// src/ChatButton.tsx
import React, { useState } from 'react';
import Chatbot from './Chatbot'; // Import your Chatbot component

const ChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatbox = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {/* Chat Button with Image */}
      <button
        onClick={toggleChatbox}
        className="fixed bottom-4 right-4 bg-transparent p-2 rounded-full shadow-lg hover:shadow-xl transition"
      >
        <img
          src="./bot.webp"
          alt="Chatbot"
          className="w-16 h-16"
        />
      </button>

      {/* Chatbox */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 w-80 bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold">Chatbot</h2>
            <button onClick={toggleChatbox} className="absolute top-2 right-2 text-gray-500">
              &times;
            </button>
          </div>
          <Chatbot /> 
        </div>
      )}
    </div>
  );
};

export default ChatButton; 