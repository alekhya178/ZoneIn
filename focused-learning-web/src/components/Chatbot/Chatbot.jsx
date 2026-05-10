import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, User, Bot, Sparkles, Settings } from 'lucide-react';
import { fetchApi } from '../../api';
import { getServiceReply } from './serviceBot';
import './chatbot.css';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [mode, setMode] = useState(null); // 'learning' | 'support' | null
  const [messages, setMessages] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]); // Track history for LLM
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
      if (messages.length === 0) {
        setMessages([
          { id: 'welcome', text: "Hi! I'm your ZoneIn assistant. How can I help?", isBot: true }
        ]);
      }
    }
  };

  const handleSwitchMode = () => {
    // Reset mode to null — shows mode picker again
    setMode(null);

    // Reset conversation history so new mode starts fresh
    setConversationHistory([]);

    // Add a separator message in chat so user knows what happened
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        isBot: true,
        text: 'Mode reset. Please choose how you would like to continue:',
        timestamp: new Date(),
        isModePicker: true   // this triggers the mode picker buttons to show
      }
    ]);
  };

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    setConversationHistory([]);

    const confirmationText = selectedMode === 'learning'
      ? 'You are now in Learning Assistant mode. Ask me anything about your current study topic!'
      : 'You are now in Platform Support mode. Ask me about sessions, focus score, videos, or the Chrome extension.';

    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        isBot: true,
        text: confirmationText,
        timestamp: new Date(),
        isModePicker: false
      }
    ]);
  };

  const handleSend = async (overrideMessage = null) => {
    const messageToSend = overrideMessage || inputValue;
    if (!messageToSend.trim() || !mode) return;

    const userMsg = { id: Date.now(), text: messageToSend, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    if (mode === 'support') {
      setIsTyping(true);
      setTimeout(() => {
        const reply = getServiceReply(messageToSend);
        setMessages(prev => [...prev, { id: Date.now() + 1, text: reply, isBot: true }]);
        setIsTyping(false);
        if (!isOpen) setHasUnread(true);
      }, 600);
    } else if (mode === 'learning') {
      setIsTyping(true);
      try {
        const topic = localStorage.getItem('currentTopic') || 'General';
        const historyToSend = conversationHistory;

        const data = await fetchApi('/chat/learn', {
          method: 'POST',
          body: JSON.stringify({
            message: messageToSend,
            topic: topic,
            userId: localStorage.getItem('token'),
            conversationHistory: historyToSend
          })
        });

        // Update UI messages
        setMessages(prev => [...prev, { id: Date.now() + 1, text: data.reply, isBot: true }]);
        
        // Update conversation history for LLM memory
        setConversationHistory(prev => [
          ...prev,
          { role: 'user', content: messageToSend },
          { role: 'assistant', content: data.reply }
        ]);

        if (!isOpen) setHasUnread(true);
      } catch (error) {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: "I'm having trouble connecting right now. Please try again.", isBot: true }]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleChipClick = (chipLabel) => {
    if (chipLabel === 'Explain this topic') {
      // Step 1: Try to detect the actual topic from conversation history
      const recentHistory = conversationHistory.slice(-6);

      // Step 2: Extract the last user message that was a real question
      const lastRealUserMessage = recentHistory
        .filter(msg => msg.role === 'user')
        .filter(msg =>
          !msg.content.toLowerCase().startsWith('please explain') &&
          !msg.content.toLowerCase().startsWith('give me') &&
          !msg.content.toLowerCase().startsWith('please summarize')
        )
        .pop();

      // Step 3: Also grab the last bot reply
      const lastBotMessage = recentHistory
        .filter(msg => msg.role === 'assistant')
        .pop();

      // Step 4: Build a smart context-aware message
      let messageToSend;

      if (lastRealUserMessage) {
        messageToSend = `Based on our conversation, please give me a deeper and more detailed explanation of the topic I just asked about: "${lastRealUserMessage.content}". Include how it works, why it matters, and a simple example.`;
      } else if (lastBotMessage) {
        messageToSend = `Please explain the topic from your last response in more detail. Include a clear definition, how it works step by step, and a simple example.`;
      } else {
        const topic = localStorage.getItem('currentTopic') || 'General';
        messageToSend = `Please explain ${topic} with a clear definition, how it works, and a simple example.`;
      }

      handleSend(messageToSend);

    } else if (chipLabel === 'Give me an example') {
      handleSend('Give me a specific example related to what we just discussed.');

    } else if (mode === 'learning') {
      handleSend('Please summarize all the key points I have learned in this conversation.');

    } else {
      // Support mode — map chip label to a question that 
      // matches a qaMap key exactly
      const supportChipMessages = {
        'Start a session':       'How do I start a study session?',
        'End my session':        'How do I end my session?',
        'Pause session':         'How do I pause my session?',
        'Focus score':           'How is my focus score calculated?',
        'My streak':             'What is a focus streak?',
        'Improve score':         'How do I improve my focus score?',
        'Create roadmap':        'How do I create a roadmap?',
        'Delete roadmap':        'How do I delete a roadmap?',
        'My notebook':           'What is the notebook?',
        'Extension not working': 'Why is the extension not working?',
        'Video filtering':       'Why are some videos hidden on YouTube?',
        'Delete account':        'How do I delete my account?',
      };

      const messageToSend = supportChipMessages[chipLabel] || chipLabel;
      handleSend(messageToSend);
    }
  };

  function formatBotMessage(text) {
    // Step 1: Inline bold formatter — converts **word** to <strong>word</strong>
    const formatInline = (str) => {
      const parts = str.split(/\*\*(.*?)\*\*/g);
      return parts.map((part, i) =>
        i % 2 === 1
          ? <strong key={i} style={{ fontWeight: 700 }}>{part}</strong>
          : part
      );
    };

    // Step 2: Split text into lines
    const lines = text.split('\n');

    const elements = [];
    let listBuffer = [];   // collects consecutive list items
    let keyCounter = 0;

    const flushList = () => {
      if (listBuffer.length === 0) return;
      elements.push(
        <ul key={`ul-${keyCounter++}`} className="bot-list">
          {listBuffer.map((item, i) => (
            <li key={i} className="bot-list-item">
              {formatInline(item)}
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed === '') {
        flushList();
        return;
      }

      // Numbered list: "1. text" or "1) text"
      const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)/);
      if (numberedMatch) {
        listBuffer.push(numberedMatch[2]);
        return;
      }

      // Arrow list: "→ text" or "- text" or "• text" or "* text"
      const bulletMatch = trimmed.match(/^(→|-|•|\*)\s+(.+)/);
      if (bulletMatch) {
        listBuffer.push(bulletMatch[2]);
        return;
      }

      // Heading: line ending with ":" and shorter than 60 chars
      // OR line starting with ### or **heading**
      const isHeading =
        (trimmed.endsWith(':') && trimmed.length < 60) ||
        trimmed.startsWith('###') ||
        /^\*\*[^*]+\*\*:?$/.test(trimmed);

      if (isHeading) {
        flushList();
        const cleanHeading = trimmed
          .replace(/^###\s*/, '')
          .replace(/\*\*/g, '')
          .replace(/:$/, '');
        elements.push(
          <p key={keyCounter++} className="bot-heading">
            {cleanHeading}
          </p>
        );
        return;
      }

      // Code block marker (``` or `code`) — render as inline code
      if (trimmed.startsWith('`') && trimmed.endsWith('`')) {
        flushList();
        const code = trimmed.replace(/^`+|`+$/g, '');
        elements.push(
          <code key={keyCounter++} className="bot-code-inline">
            {code}
          </code>
        );
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={keyCounter++} className="bot-paragraph">
          {formatInline(trimmed)}
        </p>
      );
    });

    flushList(); // flush any remaining list items
    return elements;
  }

  return (
    <div className="chatbot-root">
      {/* Floating Bubble */}
      <button className="chatbot-bubble" onClick={toggleChat}>
        <MessageSquare size={28} color="white" />
        {hasUnread && <div className="unread-badge" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="flex items-center gap-3">
              <div className="avatar-bot">
                <Bot size={20} color="white" />
              </div>
              <div className="bot-info">
                <h4 className="text-sm font-bold m-0 leading-tight">ZoneIn Assistant</h4>
                {mode && (
                  <span className={`mode-badge mode-badge-${mode}`}>
                    {mode === 'learning' ? '📚 Learning' : '🛠️ Support'}
                  </span>
                )}
              </div>
            </div>

            {/* Switch mode button — only shows when mode is selected */}
            {mode && (
              <button
                className="switch-mode-btn"
                onClick={handleSwitchMode}
                title="Switch mode"
              >
                ⇄ Switch
              </button>
            )}

            <button onClick={toggleChat} className="text-gray-400 hover:text-white transition-colors close-btn">
              <X size={20} />
            </button>
          </div>

          {/* Messages List */}
          <div className="messages-list">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-wrapper ${msg.isBot ? 'bot' : 'user'} ${msg.isSystem ? 'system' : ''}`}>
                <div className={`message-bubble ${msg.isBot ? 'message-bot' : 'message-user'}`}>
                  {msg.isBot && !msg.isSystem ? formatBotMessage(msg.text) : msg.text}

                  {/* Mode picker buttons — shown on welcome and after switch */}
                  {msg.isModePicker && !mode && (
                    <div className="mode-selection mt-3">
                      <button onClick={() => handleModeSelect('learning')} className="mode-btn learning">
                        📚 Learning Assistant
                      </button>
                      <button onClick={() => handleModeSelect('support')} className="mode-btn support">
                        🛠️ Platform Support
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Initial Welcome Mode Selection Buttons (only if no mode is selected yet and no isModePicker messages) */}
            {!mode && messages.length === 1 && messages[0].id === 'welcome' && (
              <div className="mode-selection">
                <button onClick={() => handleModeSelect('learning')} className="mode-btn learning">
                  <Sparkles size={16} /> 📚 Learning Assistant
                </button>
                <button onClick={() => handleModeSelect('support')} className="mode-btn support">
                  <Settings size={16} /> 🛠️ Platform Support
                </button>
              </div>
            )}

            {isTyping && (
              <div className="message-wrapper bot">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Chips */}
          {mode && (
            <div className="quick-chips">
              {(mode === 'learning'
                ? [
                    'Explain this topic',
                    'Give me an example',
                    'Summarize what I learned'
                  ]
                : [
                    'Start a session',
                    'End my session',
                    'Pause session',
                    'Focus score',
                    'My streak',
                    'Improve score',
                    'Create roadmap',
                    'Delete roadmap',
                    'My notebook',
                    'Extension not working',
                    'Video filtering',
                    'Delete account',
                  ]
              ).map((chip) => (
                <button key={chip} onClick={() => handleChipClick(chip)}>
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <form className="chat-input-bar" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <input 
              type="text" 
              placeholder={mode ? "Type your message..." : "Select a mode first"} 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={!mode}
            />
            <button type="submit" disabled={!mode || !inputValue.trim()}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
