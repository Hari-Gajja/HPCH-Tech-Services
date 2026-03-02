import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { checkAuth, loginWithGoogle, logout as logoutApi } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if user is already authenticated
  useEffect(() => {
    checkAuth()
      .then((u) => setUser(u))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (code) => {
    const data = await loginWithGoogle(code);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
