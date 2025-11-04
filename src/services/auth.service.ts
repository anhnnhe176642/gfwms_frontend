import api from '../lib/api';
import type { AuthResponse, User } from '../types/auth';

const AUTH_PATH = process.env.NEXT_PUBLIC_AUTH_PATH || '/v1/auth';

export interface RegisterPayload {
  username: string;
  password: string;
  email: string;
  phone: string;
  fullname: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  dob: string;
}

export const authService = {
  login: async (usernameOrEmail: string, password: string) => {
    const res = await api.post<AuthResponse>(`${AUTH_PATH}/login`, { usernameOrEmail, password });
    return res.data;
  },
  register: async (payload: RegisterPayload) => {
    const res = await api.post<AuthResponse>(`${AUTH_PATH}/register`, payload);
    return res.data;
  },
  verifyEmail: async (email: string, pin: string) => {
    const res = await api.post<AuthResponse>(`${AUTH_PATH}/verify-email`, { email, pin });
    return res.data;
  },
  resendVerification: async (email: string) => {
    const res = await api.post(`${AUTH_PATH}/resend-verification`, { email });
    return res.data;
  },
  requestPasswordReset: async (email: string) => {
    const res = await api.post(`${AUTH_PATH}/request-password-reset`, { email });
    return res.data;
  },
  verifyResetPin: async (email: string, pin: string) => {
    const res = await api.post(`${AUTH_PATH}/verify-reset-pin`, { email, pin });
    return res.data;
  },
  setNewPassword: async (email: string, pin: string, newPassword: string) => {
    const res = await api.post(`${AUTH_PATH}/set-new-password`, { email, pin, newPassword });
    return res.data;
  },
  me: async () => {
    const res = await api.get<AuthResponse>(`${AUTH_PATH}/me`);
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get<{ user: User }>(`${AUTH_PATH}/profile`);
    return res.data;
  },
  updateProfile: async (payload: Partial<User>) => {
    const res = await api.put<{ user: User }>(`${AUTH_PATH}/profile`, payload);
    return res.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await api.put(`${AUTH_PATH}/change-password`, { currentPassword, newPassword });
    return res.data;
  },
};

export default authService;
