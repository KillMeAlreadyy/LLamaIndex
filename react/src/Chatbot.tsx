// src/Chatbot.tsx
import React, { useState } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (input.trim()) {
      // Add user message to the chat
      setMessages([...messages, { text: input, sender: "user" }]);
      const userMessage = input;
      setInput("");
  
      try {
        // Make API request to the server using POST
        const response = await fetch("http://localhost:7071/api/data_ingestion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: userMessage }),
        });
     
        const responseText = await response.text(); // Get the raw response text
        console.log("Raw response:", responseText); // Log the raw response
     
        if (!response.ok) {
          console.error("Error response:", response.status, responseText);
          throw new Error("Network response was not ok");
        }
     
        const data = JSON.parse(responseText); // Parse the response as JSON
        // Assuming the response contains a 'response' field with the bot's reply
        const botMessage = data.response;
  
        // Add bot response to the chat after a short delay
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: botMessage, sender: "bot" },
        ]);
      } catch (error) {
        console.error("Error:", error);
        // Handle error (e.g., show an error message)
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "Sorry, there was an error. Please try again.", sender: "bot" },
        ]);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto mt-10 bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-4 flex-1 flex flex-col">
          <h1 className="text-2xl font-bold text-center">Chatbot</h1>
          <div className="mt-4 flex-1 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-2 my-2 rounded-lg ${
                  message.sender === "bot"
                    ? "bg-blue-100 text-left"
                    : "bg-green-100 text-right"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>
          <div className="flex mt-4">
            <input
              type="text"
              className="flex-1 p-2 border rounded-l-lg"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
            />
            <button
              className="bg-blue-500 text-white p-2 rounded-r-lg"
              onClick={handleSend}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}