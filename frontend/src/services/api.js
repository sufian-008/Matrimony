import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle network errors (server not reachable)
    if (!error.response) {
      // Network error - server is down or unreachable
      const networkError = new Error('Unable to connect to server. Please check if the backend is running.');
      networkError.response = {
        data: {
          message: 'Unable to connect to server. Please check if the backend is running.'
        }
      };
      return Promise.reject(networkError);
    }
    
    if (error.response?.status === 401) {
      // Clear all authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('persist:root'); // Clear Redux persist
      
      // Force reload to clear state
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
