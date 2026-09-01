import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { authService, type RegisterInput } from '../services/auth';
import type { ApiUser } from '../types/api';

interface AuthContextValue {
  user: ApiUser | null;
  status: 'loading' | 'authenticated' | 'guest';
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<ApiUser>;
  register: (input: RegisterInput) => Promise<ApiUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: ApiUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Callbacks other providers (cart, wishlist) register to react to auth changes. */
type AuthEvent = 'login' | 'logout';
const subscribers = new Set<(e: AuthEvent, user: ApiUser | null) => void>();
export const onAuthEvent = (fn: (e: AuthEvent, user: ApiUser | null) => void) => {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
};
const emit = (e: AuthEvent, user: ApiUser | null) => subscribers.forEach((fn) => fn(e, user));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<ApiUser | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'guest'>('loading');
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    authService
      .bootstrap()
      .then((restored) => {
        if (restored) {
          setUserState(restored);
          setStatus('authenticated');
          emit('login', restored);
        } else {
          setStatus('guest');
        }
      })
      .catch(() => setStatus('guest'));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await authService.login(email, password);
    setUserState(u);
    setStatus('authenticated');
    emit('login', u);
    return u;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const u = await authService.register(input);
    setUserState(u);
    setStatus('authenticated');
    emit('login', u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUserState(null);
    setStatus('guest');
    emit('logout', null);
  }, []);

  const refreshUser = useCallback(async () => {
    const u = await authService.me();
    setUserState(u);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated' && !!user,
      isAdmin: user?.role === 'ADMIN',
      login,
      register,
      logout,
      refreshUser,
      setUser: setUserState,
    }),
    [user, status, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
