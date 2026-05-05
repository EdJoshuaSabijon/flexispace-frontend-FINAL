import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

if (window.location.hostname !== 'localhost' && API_URL.includes('localhost')) {
  console.warn('WARNING: Frontend is running in production but connecting to localhost API! Set VITE_API_URL env var.');
}

// Helper: build a full URL for any file stored in Laravel's storage/
export const storageUrl = (path) => {
  if (!path) return null;
  // Already a full URL (e.g. from an external CDN)
  if (path.startsWith('http')) return path;
  return `${API_URL}/storage/${path}`;
};

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
