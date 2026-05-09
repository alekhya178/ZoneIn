import React, { useState, useEffect } from 'react';
import ChatBubble from './ChatBubble';
import ChatWindow from './ChatWindow';
import { getServiceBotReply } from './serviceBot';
import './chatbot.css';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mode, setMode] = useState(null); // 'learning' | 'support' | null
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your FocusLearn assistant. How can I help you today?", isBot: true }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const handleSelectMode = (selectedMode) => {
    setMode(selectedMode);
    const modeName = selectedMode === 'learning' ? 'Learning Assistant' : 'Platform Support';
    setMessages(prev => [
      ...prev,
      { id: Date.now(), text: `You selected ${modeName} mode.`, isBot: true, isSystemMessage: true }
    ]);
  };

  const handleSendMessage = async (userMessage) => {
    if (!userMessage.trim() || !mode) return;

    const newMessage = { id: Date.now(), text: userMessage, isBot: false };
    setMessages(prev => [...prev, newMessage]);

    if (mode === 'support') {
      // Platform Support mode: runs in browser
      const replyText = getServiceBotReply(userMessage);
      const botReply = { id: Date.now() + 1, text: replyText, isBot: true };
      setMessages(prev => [...prev, botReply]);
      if (!isOpen) setUnreadCount(prev => prev + 1);
    } else if (mode === 'learning') {
      // Learning Assistant mode: calls backend API
      setIsTyping(true);
      try {
        const topic = localStorage.getItem('focuslearn_topic') || 'your current topic';
        const userId = localStorage.getItem('focuslearn_userId');
        const token = localStorage.getItem('token'); // Read 'token' explicitly based on spec

        const url = `${process.env.REACT_APP_API_URL || ''}/api/chat/learn`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ message: userMessage, topic, userId })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const botReply = { id: Date.now() + 1, text: data.reply, isBot: true };
        setMessages(prev => [...prev, botReply]);
        if (!isOpen) setUnreadCount(prev => prev + 1);

      } catch (error) {
        console.error('Error in learning mode:', error);
        const errorReply = { id: Date.now() + 1, text: "I'm having trouble connecting right now. Please try again.", isBot: true };
        setMessages(prev => [...prev, errorReply]);
        if (!isOpen) setUnreadCount(prev => prev + 1);
      } finally {
        setIsTyping(false);
      }
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <ChatWindow 
          onClose={toggleChat} 
          mode={mode} 
          onSelectMode={handleSelectMode}
          messages={messages}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
        />
      )}
      <ChatBubble 
        onClick={toggleChat} 
        unreadCount={unreadCount} 
      />
    </div>
  );
}
