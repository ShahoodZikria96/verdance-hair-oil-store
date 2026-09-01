import { api, setAccessToken } from '../lib/api';
import type { ApiUser } from '../types/api';

interface AuthResponse {
  user: ApiUser;
  accessToken: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export const authService = {
  async register(input: RegisterInput): Promise<ApiUser> {
    const res = await api.post<AuthResponse>('/auth/register', input);
    setAccessToken(res.accessToken);
    return res.user;
  },

  async login(email: string, password: string): Promise<ApiUser> {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    setAccessToken(res.accessToken);
    return res.user;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },

  /** Restores a session on page load using the httpOnly refresh cookie. */
  async bootstrap(): Promise<ApiUser | null> {
    try {
      const res = await api.post<AuthResponse>('/auth/refresh');
      setAccessToken(res.accessToken);
      return res.user;
    } catch {
      setAccessToken(null);
      return null;
    }
  },

  me: () => api.get<ApiUser>('/auth/me'),

  updateProfile: (input: { firstName?: string; lastName?: string; phone?: string }) =>
    api.put<ApiUser>('/auth/me', input),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<null>('/auth/change-password', { currentPassword, newPassword }),

  forgotPassword: (email: string) => api.post<null>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<null>('/auth/reset-password', { token, password }),
};
