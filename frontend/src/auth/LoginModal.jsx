import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from './AuthContext';
import './LoginModal.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function LoginModal({ onClose, onSuccess }) {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef(null);
  const codeClientRef = useRef(null);

  const handleCodeResponse = useCallback(
    async (response) => {
      if (response.error) {
        setError('Sign-in was cancelled.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        await login(response.code);
        onSuccess?.();
      } catch (err) {
        console.error('Login failed:', err);
        setError('Login failed. Please try again.');
        setLoading(false);
      }
    },
    [login, onSuccess]
  );

  useEffect(() => {
    const initGoogle = () => {
      if (codeClientRef.current) return;
      codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile',
        ux_mode: 'popup',
        callback: handleCodeResponse,
      });
    };

    if (window.google?.accounts?.oauth2) {
      initGoogle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
  }, [handleCodeResponse]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSignIn = () => {
    setError('');
    if (codeClientRef.current) {
      codeClientRef.current.requestCode();
    }
  };

  return (
    <div className="lm-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      {/* Floating particles */}
      <div className="lm-particle lm-particle--1" />
      <div className="lm-particle lm-particle--2" />
      <div className="lm-particle lm-particle--3" />
      <div className="lm-particle lm-particle--4" />
      <div className="lm-particle lm-particle--5" />

      <div className="lm-card">
        {/* Animated gradient border */}
        <div className="lm-card-border" />

        <button className="lm-close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Lock icon */}
        <div className="lm-icon anim-item" style={{ '--i': 0 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="url(#lockGrad)" strokeWidth="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="url(#lockGrad)" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1.5" fill="url(#lockGrad)"/>
            <defs>
              <linearGradient id="lockGrad" x1="3" y1="5" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ff0080"/>
                <stop offset="0.5" stopColor="#7928ca"/>
                <stop offset="1" stopColor="#00d4ff"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="lm-logo anim-item" style={{ '--i': 1 }}>HPCH</div>
        <h2 className="lm-title anim-item" style={{ '--i': 2 }}>Sign in to continue</h2>
        <p className="lm-subtitle anim-item" style={{ '--i': 3 }}>Login is required to send your request</p>

        <div className="lm-divider anim-item" style={{ '--i': 4 }}>
          <span className="lm-divider-line" />
          <span className="lm-divider-text">continue with</span>
          <span className="lm-divider-line" />
        </div>

        <button
          className={`lm-google-btn anim-item ${loading ? 'lm-google-btn--loading' : ''}`}
          style={{ '--i': 5 }}
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <div className="lm-spinner" />
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {loading ? 'Signing in…' : 'Sign in with Google'}
        </button>

        {error && (
          <p className="lm-error anim-item" style={{ '--i': 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#ff4d6a" strokeWidth="2"/>
              <path d="M12 8v4m0 4h.01" stroke="#ff4d6a" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {error}
          </p>
        )}

        <p className="lm-footer anim-item" style={{ '--i': 6 }}>
          Your data is secured with Google OAuth 2.0
        </p>
      </div>
    </div>
  );
}
