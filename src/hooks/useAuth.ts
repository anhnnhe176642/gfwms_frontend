import { useCallback, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';
import useAuthStore from '../store/useAuthStore';
import type { User } from '../types/auth';
import { isBrowser } from '../lib/isBrowser';

export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // initialize from localStorage (only on client)
    try {
      if (isBrowser()) {
        const t = localStorage.getItem('gfwms_token');
        const u = localStorage.getItem('gfwms_user');
        if (t && u) {
          setAuth(JSON.parse(u) as User, t);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsReady(true);
    }
  }, [setAuth]);

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    const data = await authService.login(usernameOrEmail, password);
    setAuth(data.user, data.token);
    return data;
  }, [setAuth]);

  const logout = useCallback(async () => {
    clearAuth();
  }, [clearAuth]);

  const hasPermission = useCallback((perm: string) => {
    return useAuthStore.getState().hasPermission(perm);
  }, []);

  return { user, token, isAuthenticated, login, logout, hasPermission, isReady } as const;
};

export default useAuth;
