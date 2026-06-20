import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('admin_user');
  if (user) {
    // Simple session token (username based)
    config.headers['X-Admin-User'] = JSON.parse(user).username;
  }
  return config;
});

export default api;
