import React, { useState, useEffect } from 'react';
import supabase from './config/supabase';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';

/**
 * Root component. Uses Supabase auth state to decide which page to show:
 * - No session → LoginPage
 * - Active session → ChatPage
 *
 * Listens for auth state changes (login, logout, token refresh)
 * so transitions are immediate.
 */
function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Subscribe to auth changes (login/logout/refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-muted text-sm">Loading…</p>
      </div>
    );
  }

  return session ? <ChatPage session={session} /> : <LoginPage />;
}

export default App;
