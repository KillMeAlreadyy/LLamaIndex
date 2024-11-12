import os
import openai
import nest_asyncio
import azure.functions as func
from llama_index.readers.file import UnstructuredReader
from pathlib import Path
from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.core import Settings
from llama_index.core.tools import QueryEngineTool, ToolMetadata
from llama_index.llms.openai import OpenAI
from llama_index.core.query_engine import SubQuestionQueryEngine
from llama_index.agent.openai import OpenAIAgent
import json

Settings.chunk_size = 512
index_set = {}

os.environ["OPENAI_API_KEY"] = "<insert API Key here>"
openai.api_key = os.getenv("OPENAI_API_KEY")
nest_asyncio.apply()

years = [2022,2021,2020,2019]

loader = UnstructuredReader()
doc_set = {}
all_docs = []

def DataIngestion():
    for year in years:
        year_docs = loader.load_data(
            file=Path(f"./data/UBER/UBER_{year}.html"), split_documents=False
        )
        # insert year metadata into each year
        for d in year_docs:
            d.metadata = {"year": year}
        doc_set[year] = year_docs
        all_docs.extend(year_docs)
    for year in years:
        storage_context = StorageContext.from_defaults()
        cur_index = VectorStoreIndex.from_documents(
            doc_set[year],
            storage_context=storage_context,
        )
        index_set[year] = cur_index
        storage_context.persist(persist_dir=f"./storage/{year}")


def QueryData():
    individual_query_engine_tool = [
        QueryEngineTool(
            query_engine=index_set[year].as_query_engine(),
            metadata = ToolMetadata(
                name = f"vector_index_{year}",
                description = f"Use this tool to query the data for the year {year}"
            )
        )
        for year in years
    ]
    query_engine = SubQuestionQueryEngine.from_defaults(
        query_engine_tools=individual_query_engine_tool,
        llm=OpenAI(model="gpt-4o-mini", temperature=0)
    )
    #Agent
    query_engine_tool = QueryEngineTool(
        query_engine=query_engine,
        metadata=ToolMetadata(
            name="sub_question_query_engine",
            description="useful for when you want to answer queries that require analyzing multiple SEC 10-K documents for Uber"
        )
    )
    tools = individual_query_engine_tool + [query_engine_tool]
    agent = OpenAIAgent.from_tools(tools, verbose=True)
    return agent

def AskAgent(query):
    agent = QueryData()
    response = agent.chat(query)
    
    # Assuming response has a method or attribute to get the text
    if hasattr(response, 'text'):  # Check if the response has a 'text' attribute
        return response.text  # Return the text of the response
    else:
        return str(response)  # Fallback to converting the response to string
    

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()  # Get the JSON body
        query = req_body.get('message')  # Extract the 'message' field
    except ValueError:
        return func.HttpResponse(
            json.dumps({"error": "Invalid JSON."}),
            status_code=400,
            mimetype="application/json"
        )

    if not query:
        return func.HttpResponse(
            json.dumps({"error": "Query parameter is required."}),
            status_code=400,
            mimetype="application/json"
        )

    try:
        # Process the query with AskAgent
        response = AskAgent(query)
        
        # Ensure response is a string
        if isinstance(response, str):
            return func.HttpResponse(
                json.dumps({"response": response}),  # Wrap the response in a JSON object
                status_code=200,
                mimetype="application/json"
            )
        else:
            return func.HttpResponse(
                json.dumps({"error": "Unexpected response type."}),
                status_code=500,
                mimetype="application/json"
            )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({"error": "Internal Server Error."}),
            status_code=500,
            mimetype="application/json"
        )

#In tsx abbilden
def Chatloop():
    DataIngestion()
    while True:
        text_input = input("User: ")
        if text_input == "exit":
            break
        response = AskAgent(text_input)
        print(f"Uber Chatbot: {response}")
        
Chatloop()