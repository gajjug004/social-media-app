import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/'; // Change for production

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add access token to each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Remove tokens
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');

      // Redirect to login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

