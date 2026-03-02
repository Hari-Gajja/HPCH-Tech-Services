import { useAuth } from './AuthContext';
import LoginPage from './LoginPage';

export default function AuthGate({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          color: '#fff',
          fontFamily: '"Syne", sans-serif',
          fontSize: '1.2rem',
          zIndex: 99999,
        }}
      >
        Loading…
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return children;
}
