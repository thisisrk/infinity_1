import React from 'react';

const ChatContainer = ({ messages, currentUserId }) => {
  return (
    <div className="chat-container">
      {messages.map((message, index) => (
        <div 
          key={`${message._id}-${index}`}  // Modified to ensure unique keys
          className={`message ${message.sender === currentUserId ? 'sent' : 'received'}`}
        >
          {/* ...message content... */}
        </div>
      ))}
    </div>
  );
};

export default ChatContainer;