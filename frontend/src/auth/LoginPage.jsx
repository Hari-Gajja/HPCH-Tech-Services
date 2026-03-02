import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from './AuthContext';
import './LoginPage.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const codeClientRef = useRef(null);

  const handleCodeResponse = useCallback(
    async (response) => {
      if (response.error) {
        console.error('Google auth error:', response.error);
        setError('Google sign-in was cancelled.');
        return;
      }
      try {
        await login(response.code);
      } catch (err) {
        console.error('Login failed:', err);
        setError('Login failed. Please try again.');
      }
    },
    [login]
  );

  useEffect(() => {
    // Load the Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Use authorization code flow
      codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid profile email',
        ux_mode: 'popup',
        callback: handleCodeResponse,
      });
    };
    document.head.appendChild(script);

    return () => {
      const existing = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (existing) existing.remove();
    };
  }, [handleCodeResponse]);

  const handleSignIn = () => {
    setError('');
    if (codeClientRef.current) {
      codeClientRef.current.requestCode();
    }
  };

  return (
    <div className="login-page">
      {/* Animated background blobs */}
      <div className="login-bg-blob login-bg-blob--1" />
      <div className="login-bg-blob login-bg-blob--2" />
      <div className="login-bg-blob login-bg-blob--3" />

      <div className="login-card">
        <div className="login-logo">HPCH</div>
        <h1 className="login-title">Welcome</h1>
        <p className="login-subtitle">Sign in with Google to continue</p>

        <button className="login-google-custom-btn" onClick={handleSignIn}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>

        {error && <p className="login-error">{error}</p>}

        <p className="login-footer">
          By signing in you agree to our terms of service.
        </p>
      </div>
    </div>
  );
}
