import React, { useState, useEffect, useRef } from 'react';
import supabase from '../config/supabase';
import TopBar from '../components/TopBar';
import ChatBubble from '../components/ChatBubble';
import MessageInput from '../components/MessageInput';
import ConfirmModal from '../components/ConfirmModal';
import Button from '../components/Button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Helper to make authenticated API calls to the backend.
 * Attaches the Supabase JWT as a Bearer token.
 * If `options.stream` is true, returns the raw Response object so it can be streamed.
 */
async function apiCall(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { stream, ...fetchOptions } = options;

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...fetchOptions.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  // If the caller requested a stream, return the raw response object
  if (stream) {
    return res;
  }

  return res.json();
}

/**
 * Chat page per UI_DESIGN.md §4.2:
 * - TopBar (white, bottom border) with user info + logout
 * - Scrollable message area (light gray bg)
 * - Fixed input bar at bottom
 * - Empty state text when no messages
 * - "HRBuddy is typing…" static label while loading
 */
function ChatPage({ session }) {
  const [messages, setMessages] = useState([]); // Current fresh session
  const [pastHistory, setPastHistory] = useState([]); // Past conversations for sidebar
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null); // Now stores sessionId
  const [currentSessionId, setCurrentSessionId] = useState(crypto.randomUUID());
  
  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Group history by session_id
  const sessionGroups = React.useMemo(() => {
    const groups = {};
    pastHistory.forEach(msg => {
      const sid = msg.session_id || 'legacy';
      if (!groups[sid]) {
        groups[sid] = {
           id: sid,
           messages: [],
           title: ''
        };
      }
      groups[sid].messages.push(msg);
    });
    
    // Sort messages in each group by created_at ascending
    const sortedGroups = Object.values(groups).map(group => {
      group.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      const firstUserMsg = group.messages.find(m => m.role === 'user');
      group.title = firstUserMsg ? firstUserMsg.content : 'Chat Session';
      group.lastUpdated = group.messages[group.messages.length - 1].created_at;
      return group;
    });
    
    // Sort groups so newest is at the top
    return sortedGroups.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
  }, [pastHistory]);

  const loadHistory = async () => {
    try {
      const data = await apiCall('/api/history');
      if (data.messages) {
        setPastHistory(data.messages);
      }
      if (data.user) setUserInfo(data.user);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  // Load chat history + user info on mount
  useEffect(() => {
    async function init() {
      await loadHistory();
      setInitialLoad(false);
    }
    init();
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text) => {
    // Optimistically add user message and an empty placeholder for the bot
    setMessages((prev) => [
      ...prev, 
      { role: 'user', content: text },
      { role: 'assistant', content: '' } // Placeholder for incoming stream
    ]);
    setLoading(true);

    try {
      const response = await apiCall('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text, sessionId: currentSessionId }),
        stream: true, // Custom flag we added to our apiCall helper
      });

      // Set up a reader to parse the Server-Sent Event stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // Split the chunk by double newline to handle multiple events in one chunk
        const events = chunk.split('\n\n');

        for (const event of events) {
          if (event.startsWith('data: ')) {
            const dataString = event.slice(6);
            
            if (dataString === '[DONE]') {
              break;
            }

            try {
              const data = JSON.parse(dataString);
              if (data.chunk) {
                // Progressively append the chunk to the LAST message in the state (the bot's reply)
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastIndex = newMessages.length - 1;
                  newMessages[lastIndex] = {
                    ...newMessages[lastIndex],
                    content: newMessages[lastIndex].content + data.chunk,
                  };
                  return newMessages;
                });
              }
            } catch (e) {
              console.error('Error parsing stream chunk:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
      loadHistory(); // Sync sidebar with newly added messages
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(crypto.randomUUID());
    loadHistory(); // Sync sidebar just in case
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  const openPastChat = (sessionId) => {
    const group = sessionGroups.find(g => g.id === sessionId);
    if (group) {
      setMessages(group.messages);
      setCurrentSessionId(sessionId);
      setIsSidebarOpen(false); // Close sidebar on mobile
    }
  };

  const confirmDelete = (sessionId) => {
    setChatToDelete(sessionId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteChat = async () => {
    if (!chatToDelete) return;
    
    try {
      await apiCall(`/api/history/${chatToDelete}`, { method: 'DELETE' });
      // Reload history to refresh the sidebar
      await loadHistory();

      // If the currently open chat was deleted, clear the main window
      if (currentSessionId === chatToDelete) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    } finally {
      setIsDeleteModalOpen(false);
      setChatToDelete(null);
    }
  };

  if (initialLoad) {
    return (
      <div className="flex h-screen bg-teal-light overflow-hidden">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-teal-light flex flex-col flex-shrink-0">
          <div className="px-6 py-5 flex items-center justify-start gap-3">
            <div className="w-5 h-5 rounded bg-teal-dark/10 animate-pulse"></div>
            <div className="w-28 h-6 rounded bg-teal-dark/10 animate-pulse"></div>
          </div>
          <div className="flex-1 p-3 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-full bg-teal-dark/10 rounded-md animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Main Chat Area Skeleton */}
        <div className="flex-1 flex flex-col h-screen bg-teal-card shadow-[-10px_0_20px_-5px_rgba(15,118,110,0.1)] z-10 rounded-l-2xl border-l border-white/50">
          {/* TopBar Skeleton */}
          <div className="flex items-center justify-between px-6 py-5 bg-transparent">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-teal-dark/10 animate-pulse"></div>
              <div className="w-48 h-8 rounded bg-teal-dark/10 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 h-8 rounded bg-teal-dark/10 animate-pulse hidden sm:block"></div>
              <div className="w-24 h-8 rounded bg-teal-dark/10 animate-pulse"></div>
            </div>
          </div>

          {/* Message Area Skeleton */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col justify-end gap-6 mb-4">
            <div className="w-64 h-12 rounded-xl rounded-br-sm bg-teal/20 animate-pulse self-end"></div>
            <div className="w-96 h-24 rounded-xl rounded-bl-sm bg-white animate-pulse shadow-sm self-start"></div>
            <div className="w-48 h-12 rounded-xl rounded-br-sm bg-teal/20 animate-pulse self-end"></div>
          </div>

          {/* Input Skeleton */}
          <div className="px-6 py-5 bg-teal-card">
            <div className="w-full h-12 rounded-md bg-white border border-border animate-pulse flex items-center px-4">
               <div className="w-32 h-4 rounded bg-teal-dark/10"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-teal-light overflow-hidden relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 sm:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar for Chat History */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out absolute sm:relative z-50 h-full w-64 sm:translate-x-0 bg-teal-light flex flex-col flex-shrink-0 shadow-2xl sm:shadow-none`}>
        {/* Mobile close button inside sidebar */}
        <div className="sm:hidden absolute top-4 right-4">
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 text-teal-dark hover:bg-teal-card rounded transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 flex items-center justify-center">
          <span className="text-2xl font-bold text-teal-dark tracking-wide">Chat History</span>
        </div>

        <div className="px-5 mb-2">
          <Button variant="primary" onClick={handleNewChat} className="w-full flex items-center justify-center gap-2 py-2 text-sm shadow-sm hover:shadow-md transition-shadow">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {sessionGroups.length === 0 ? (
            <p className="text-xs text-teal-dark text-center mt-4">No Past History</p>
          ) : (
            sessionGroups.map((group, i) => (
              <div
                key={i}
                className={`group flex items-center justify-between text-sm text-teal-dark font-medium p-3 mb-1 rounded-md cursor-pointer transition-colors duration-150 ${currentSessionId === group.id ? 'bg-teal-card shadow-sm border border-teal/20' : 'bg-transparent hover:bg-teal-card'}`}
                title={group.title}
                onClick={() => openPastChat(group.id)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="truncate">{group.title}</span>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete(group.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 rounded transition-all flex-shrink-0 text-muted"
                  title="Delete chat session"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen bg-teal-card shadow-[-10px_0_20px_-5px_rgba(15,118,110,0.1)] z-10 rounded-l-2xl border-l border-white/50">
        {/* Top bar */}
        <TopBar
          userName={userInfo?.name}
          userDesignation={userInfo?.designation}
          onLogout={handleLogout}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Message area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!initialLoad && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-4 pb-12">
              <div className="w-16 h-16 bg-teal-light rounded-full flex items-center justify-center mb-6 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-dark">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#111111] mb-4 text-center">How can I help you today?</h2>
              
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  "What is the remote work policy?",
                  "Tell me about my leave balance",
                  "What are my joining details?",
                  "How does the bonus structure work?"
                ].map((suggestion, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSend(suggestion)}
                    className="p-4 text-left border border-border bg-white rounded hover:border-teal/40 hover:bg-teal-light/40 transition-all duration-200 group"
                  >
                    <p className="text-sm font-medium text-[#111111] group-hover:text-teal-dark">{suggestion}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatBubble
              key={i}
              role={msg.role}
              content={msg.content}
              timestamp={msg.created_at}
            />
          ))}



          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <MessageInput onSend={handleSend} disabled={loading} />
      </div>
      
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteChat}
        title="Delete Chat"
        message="Are you sure you want to delete this conversation? This action cannot be undone."
      />
    </div>
  );
}

export default ChatPage;
