// Axios instance setup
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
});

export default axiosInstance;
