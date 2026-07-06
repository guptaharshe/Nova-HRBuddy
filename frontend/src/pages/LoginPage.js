import React, { useState } from 'react';
import supabase from '../config/supabase';
import Input from '../components/Input';
import Button from '../components/Button';

/**
 * Login page per UI_DESIGN.md §4.1:
 * - Centered card (~380px) on plain white bg
 * - Wordmark, heading, email, password, sign-in button, helper text
 * - Card: white bg, 1px border, 8px radius, minimal shadow
 * - Error: red text below form, no animation
 */
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-light px-4">
      <div
        className="w-full bg-teal-card border border-border rounded-lg p-10"
        style={{ maxWidth: '480px', boxShadow: '0 10px 25px -5px rgba(15, 118, 110, 0.15), 0 8px 10px -6px rgba(15, 118, 110, 0.1)' }}
      >
        {/* Wordmark */}
        <div className="flex items-center justify-center gap-3 mb-2">
          {/* <span className="inline-block w-3 h-3 rounded-full bg-teal"></span> */}
          <span className="text-2xl sm:text-3xl mb-4 font-bold text-[#111111]">NovaTech - HRBuddy</span>
        </div>

        {/* Heading */}
        {/* <h1 className="text-heading font-medium text-center text-[#111111] mb-8">
          Sign In
        </h1> */}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="login-email" className="block text-sm text-muted mb-1">
              Email
            </label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@novatech.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="login-password" className="block text-sm text-muted mb-1">
              Password
            </label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            id="sign-in-button"
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2"
          >
            {loading ? 'Signing in…' : (
              <>
                Sign In
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </>
            )}
          </Button>
        </form>

        {/* Error message */}
        {error && (
          <p className="text-sm text-error mt-3 text-center">{error}</p>
        )}

        {/* Helper text */}
        <p className="text-xs text-muted text-center mt-4">
          Contact HR if you've forgotten your credentials.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
