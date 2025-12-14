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
  withXSRFToken: true, // Automatically read XSRF-TOKEN cookie and send as X-XSRF-TOKEN header
  xsrfCookieName: 'XSRF-TOKEN', // Cookie name to read from
  xsrfHeaderName: 'X-XSRF-TOKEN', // Header name to send
});

// Helper function to fetch CSRF token after login/signup
export const fetchCsrfToken = async () => {
  try {
    const response = await axiosInstance.get('/auth/csrf-token');
    console.log('✅ CSRF token fetched:', response.data.csrfToken ? 'present' : 'missing');
    return response.data.csrfToken;
  } catch (error) {
    console.error('❌ Failed to fetch CSRF token:', error.message);
    throw error;
  }
};

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