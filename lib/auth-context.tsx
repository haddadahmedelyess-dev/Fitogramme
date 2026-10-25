/**
 * Auth context — stores the JWT and current user in localStorage.
 * Provides login / register / logout helpers and protects routes.
 */
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { auth, type User, type LoginPayload, type RegisterPayload, ApiError } from '@/lib/api';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (p: LoginPayload) => Promise<void>;
  register: (p: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem('fg_user');
    const token = localStorage.getItem('fg_token');
    if (raw && token) {
      try { setUser(JSON.parse(raw)); } catch { /* corrupt */ }
    }
    setLoading(false);
  }, []);

  const persist = (user: User, token: string) => {
    localStorage.setItem('fg_token', token);
    localStorage.setItem('fg_user', JSON.stringify(user));
    setUser(user);
  };

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await auth.login(payload);
    persist(res.user, res.access_token);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await auth.register(payload);
    persist(res.user, res.access_token);
  }, []);

  const logout = useCallback(() => {
    auth.logout();
    setUser(null);
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

export { ApiError };
