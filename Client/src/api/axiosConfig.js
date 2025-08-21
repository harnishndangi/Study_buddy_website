// Axios instance setup
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  withCredentials: true,
});

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Add a request interceptor to attach CSRF token for state-changing requests
axiosInstance.interceptors.request.use(
  (config) => {
    const method = (config.method || 'get').toUpperCase();
    const csrf = getCookie('csrfToken');
    if (csrf && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      config.headers['X-CSRF-Token'] = csrf;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
    }
);

export default axiosInstance;
