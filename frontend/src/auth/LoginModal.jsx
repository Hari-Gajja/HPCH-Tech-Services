import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from './AuthContext';
import './LoginModal.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function LoginModal({ onClose, onSuccess }) {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef(null);
  const googleBtnRef = useRef(null);

  const handleCredentialResponse = useCallback(
    async (response) => {
      try {
        setLoading(true);
        await login(response.credential);
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
      if (!googleBtnRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        use_fedcm_for_prompt: false,
      });

      // Render Google's own sign-in button — handles popup internally, no COOP issues
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        width: 300,
        logo_alignment: 'left',
      });
    };

    if (window.google?.accounts?.id) {
      initGoogle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
  }, [handleCredentialResponse]);

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

        {/* Google's own rendered button — no COOP/FedCM issues */}
        <div className="lm-google-wrap anim-item" style={{ '--i': 5 }}>
          {loading ? (
            <div className="lm-google-btn lm-google-btn--loading">
              <div className="lm-spinner" />
              Signing in…
            </div>
          ) : (
            <div ref={googleBtnRef} className="lm-google-rendered" />
          )}
        </div>

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
