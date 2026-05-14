import { api } from '@/lib/axios';
import type { AuthResponse } from '@/types/api';

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  tenantSlug: string;
  tenantName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  refresh: () =>
    api.post('/auth/refresh'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),

  me: () =>
    api.get<AuthResponse>('/auth/me').then((r) => r.data),

  logout: () =>
    api.post('/auth/logout'),
};
