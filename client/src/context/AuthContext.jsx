import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reloadUser = useCallback(async function reloadUser() {
    setLoading(true);
    setError('');

    try {
      const response = await apiFetch('/auth/me');
      setUser(response.data.user);
    } catch (err) {
      if (err?.status !== 401) {
        setError(err.message ?? 'Unable to load user session');
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async function logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    reloadUser();
  }, [reloadUser]);

  const value = useMemo(
    () => ({ user, loading, error, reloadUser, logout }),
    [user, loading, error, reloadUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
