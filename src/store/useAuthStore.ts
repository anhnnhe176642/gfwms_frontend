import { create } from 'zustand';
import type { User } from '../types/auth';
import { isBrowser } from '../lib/isBrowser';

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  hasPermission: (perm: string) => boolean;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  setAuth: (user, token) => {
    try {
      if (isBrowser()) {
        localStorage.setItem('gfwms_token', token);
        localStorage.setItem('gfwms_user', JSON.stringify(user));
      }
    } catch {
      // ignore
    }
    set({ user, token, isAuthenticated: true });
  },
  clearAuth: () => {
    try {
      if (isBrowser()) {
        localStorage.removeItem('gfwms_token');
        localStorage.removeItem('gfwms_user');
      }
    } catch {
      // ignore
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
  hasPermission: (perm: string) => {
    const user = get().user;
    if (!user) return false;
    if (user.permissionKeys && user.permissionKeys.includes(perm)) return true;
    return false;
  },
}));

export default useAuthStore;
