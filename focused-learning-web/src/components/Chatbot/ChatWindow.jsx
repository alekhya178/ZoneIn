import React, { useState, useRef, useEffect } from 'react';

export default function ChatWindow({ onClose, mode, onSelectMode, messages, onSendMessage, isTyping }) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, mode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleChipClick = (text) => {
    if (isTyping) return;
    onSendMessage(text);
  };

  const supportChips = [
    "Reset session",
    "Focus score",
    "Video filtering",
    "40-min timer",
    "Extension help"
  ];

  const learningChips = [
    "Explain this topic",
    "Give me an example",
    "Summarize what I learned"
  ];

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="bot-avatar"></div>
          <div className="header-info">
            <span className="bot-name">FocusLearn Assistant</span>
            {mode === 'learning' && <span className="mode-badge learning">Learning</span>}
            {mode === 'support' && <span className="mode-badge support">Support</span>}
          </div>
        </div>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.isBot ? 'bot' : 'user'} ${msg.isSystemMessage ? 'system' : ''}`}>
            <div className="message-text">{msg.text}</div>
          </div>
        ))}

        {!mode && (
          <div className="mode-selection">
            <button className="mode-btn learning-btn" onClick={() => onSelectMode('learning')}>
              📚 Learning Assistant
            </button>
            <button className="mode-btn support-btn" onClick={() => onSelectMode('support')}>
              🛠️ Platform Support
            </button>
          </div>
        )}

        {isTyping && (
          <div className="message bot">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {mode && (
        <div className="chat-input-area">
          <div className="quick-replies">
            {(mode === 'support' ? supportChips : learningChips).map((chip, index) => (
              <button 
                key={index} 
                className="chip" 
                onClick={() => handleChipClick(chip)}
                disabled={isTyping}
              >
                {chip}
              </button>
            ))}
          </div>
          <form className="input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
            />
            <button type="submit" disabled={isTyping || !inputValue.trim()} className="send-btn">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
