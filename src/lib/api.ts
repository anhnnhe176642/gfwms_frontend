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

// Response helper: could centralize error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Add global error handling here if needed
    return Promise.reject(err);
  }
);

export default api;
