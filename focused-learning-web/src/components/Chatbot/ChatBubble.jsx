import React, { useState } from 'react';

export default function ChatBubble({ onClick, unreadCount }) {
  return (
    <button className="chat-bubble" onClick={onClick}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      {unreadCount > 0 && (
        <span className="unread-badge"></span>
      )}
    </button>
  );
}
