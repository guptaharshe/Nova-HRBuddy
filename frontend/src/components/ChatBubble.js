import React from 'react';

/**
 * ChatBubble per UI_DESIGN.md §4.2:
 * - User messages: right-aligned, teal bg, white text, 6px radius
 * - Bot messages: left-aligned, white bg, dark text, 1px border, 6px radius
 *   with a small "HRBuddy" label above
 * - Timestamps: small muted text below bubble (optional)
 */
function ChatBubble({ role, content, timestamp }) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[75%]`}>
        {!isUser && (
          <span className="text-xs text-muted ml-1 mb-1 block">HRBuddy</span>
        )}
        <div
          className={`px-3 py-2 rounded-[6px] text-body leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-teal text-white'
              : 'bg-white text-[#111111] border border-border'
          }`}
        >
          {content === '' && !isUser ? (
            <div className="flex space-x-1.5 items-center h-5 px-1 py-1">
              <div className="w-1.5 h-1.5 bg-[#111111]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-[#111111]/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-[#111111]/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          ) : (
            content
          )}
        </div>
        {timestamp && (
          <span className={`text-xs text-muted mt-1 block ${isUser ? 'text-right mr-1' : 'ml-1'}`}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}

export default ChatBubble;
