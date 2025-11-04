import { useCallback, useEffect, useRef, useState } from 'react';
import { authService } from '../services/auth.service';
import useAuthStore from '../store/useAuthStore';
import type { User } from '../types/auth';
import { isBrowser } from '../lib/isBrowser';

// Track if initialization has already been done
let authInitialized = false;

export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    // Only initialize once across the entire app
    if (initRef.current || authInitialized) {
      setIsReady(true);
      return;
    }

    const initializeAuth = async () => {
      try {
        if (isBrowser()) {
          const t = localStorage.getItem('gfwms_token');
          
          if (t) {
            try {
              // Set token first to allow API calls
              useAuthStore.setState({ token: t });
              
              // Verify token is still valid by fetching current user
              const data = await authService.me();
              
              // Update with latest user data from server
              setAuth(data.user, t);
            } catch (error) {
              // Token expired, user locked/deleted, or any auth error
              clearAuth();
            }
          }
        }
      } catch {
        // ignore
      } finally {
        initRef.current = true;
        authInitialized = true;
        setIsReady(true);
      }
    };

    initializeAuth();
  }, []); // Empty dependency array

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    const data = await authService.login(usernameOrEmail, password);
    setAuth(data.user, data.token);
    return data;
  }, [setAuth]);

  const setAuthData = useCallback((user: User, token: string) => {
    setAuth(user, token);
  }, [setAuth]);

  const logout = useCallback(async () => {
    clearAuth();
  }, [clearAuth]);

  const hasPermission = useCallback((perm: string) => {
    return useAuthStore.getState().hasPermission(perm);
  }, []);

  return { user, token, isAuthenticated, login, setAuthData, logout, hasPermission, isReady } as const;
};

export default useAuth;
