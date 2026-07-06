import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';

/**
 * MessageInput per UI_DESIGN.md §4.2:
 * - Fixed at bottom, white bg, top border
 * - Text input + teal Send button
 * - Enter key sends the message
 * - Disabled while awaiting response
 */
function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-3 px-6 py-5 bg-teal-card">
      <Input
        id="chat-input"
        type="text"
        placeholder="Type your question..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <Button onClick={handleSend} disabled={disabled || !text.trim()} className="flex items-center gap-2 px-5">
        Send
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </Button>
    </div>
  );
}

export default MessageInput;
