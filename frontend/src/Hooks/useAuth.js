/**
 * src/Hooks/useAuth.js
 * --------------------
 * Custom hook for reading and managing the active user session.
 *
 * Returns:
 *   user     {object|null}   — the parsed active user from sessionStorage
 *   isAdmin  {boolean}       — true if user.role === 'admin'
 *   isLoggedIn {boolean}     — true if user is not null
 *   login    {function}      — saves user to sessionStorage and updates state
 *   logout   {function}      — removes user from sessionStorage and updates state
 *   refresh  {function}      — re-reads user from sessionStorage (after profile edit)
 *
 * Usage:
 *   const { user, isAdmin, isLoggedIn, login, logout } = useAuth();
 */
import { useState, useCallback } from 'react';

const SESSION_KEY = 'eazeit_active_user';

function readUser() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState(readUser);

  /** Persist a user object to sessionStorage and update state */
  const login = useCallback((userData) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  /** Remove user from sessionStorage and clear state */
  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('eazeit_auth_token');
    setUser(null);
  }, []);

  /** Re-read the user from sessionStorage (e.g. after profile update) */
  const refresh = useCallback(() => {
    setUser(readUser());
  }, []);

  return {
    user,
    isAdmin: user?.role === 'admin',
    isLoggedIn: user !== null,
    login,
    logout,
    refresh,
  };
}
