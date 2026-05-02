import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
console.log('Connecting to API at:', API_URL);
if (window.location.hostname !== 'localhost' && API_URL.includes('localhost')) {
  console.warn('WARNING: Frontend is running in production but connecting to localhost API! Set VITE_API_URL env var.');
}

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Important: don't send cookies for stateless API
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
