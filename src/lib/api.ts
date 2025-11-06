import axios from 'axios';
import { isBrowser } from './isBrowser';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token if present
api.interceptors.request.use((config) => {
  try {
    if (isBrowser()) {
      const token = localStorage.getItem('gfwms_token');
      if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore
  }
  return config;
});

// Response interceptor: handle auth errors and auto-logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Check if it's an auth-related error
    const status = err?.response?.status;

    // Handle token expired, user locked, user deleted, or invalid token
    if (status === 401) {
      // Only clear auth if we're on client side and not already logging out
      if (isBrowser() && localStorage.getItem('gfwms_token')) {
        localStorage.removeItem('gfwms_token');
        
        // Redirect to login if not already there
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/auth/login')) {
          window.location.href = '/auth/login?from=401';
        }
      }
    }

    return Promise.reject(err);
  }
);

export default api;
