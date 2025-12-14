// Axios instance setup
import axios from 'axios';

// Get API URL from environment variable with fallback
// The baseURL should include the /api prefix
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // If environment variable is set, use it
  if (envUrl) {
    // Ensure it ends with /api
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  
  // Fallback for production
  return 'https://study-buddy-website.onrender.com/api';
};

const API_URL = getApiUrl();

// Log the API URL being used (helpful for debugging)
console.log('🔗 API Base URL:', API_URL);

// Validate API URL is set
if (!API_URL || API_URL === '/api') {
  console.error('❌ API URL is not properly configured! API requests will fail.');
  console.error('Expected format: https://your-backend-url.com/api');
}

const axiosInstance = axios.create({
  baseURL: API_URL,
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
    // Only add CSRF token for state-changing methods
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      const csrf = getCookie('csrfToken');
      if (csrf) {
        config.headers['X-CSRF-Token'] = csrf;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information for debugging
    if (error.response) {
      console.error('❌ API Error:', {
        status: error.response.status,
        url: error.config?.url,
        method: error.config?.method,
        message: error.response.data?.message || error.message
      });
    } else if (error.request) {
      console.error('❌ Network Error: No response received', {
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
    } else {
      console.error('❌ Request Error:', error.message);
    }

    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      console.warn('🔒 Unauthorized - redirecting to login');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
