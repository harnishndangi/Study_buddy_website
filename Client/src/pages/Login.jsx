import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance, { fetchCsrfToken } from '../api/axiosConfig';
import logo from '../assets/icons/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        console.log('✅ Login successful, cookies set. User:', res.data.user);
        console.log('📍 Current cookies:', document.cookie);
        
        // Fetch CSRF token to ensure it's available for subsequent requests
        try {
          await fetchCsrfToken();
          console.log('✅ CSRF token verified and ready');
        } catch (csrfError) {
          console.warn('⚠️ CSRF token fetch failed, but continuing:', csrfError.message);
          // Don't block login if CSRF fetch fails - token should already be set by login
        }
        
        // Short delay to ensure cookies are properly established before navigation
        setTimeout(() => {
          console.log('🔀 Redirecting to dashboard...');
          navigate('/');
        }, 200);
      } else {
        setError('Login failed - invalid response from server');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed - ' + (err.message || 'Please check your connection'));
      }
      console.error('❌ Login error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Decorative area with image and quote */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-900 to-blue-800 p-8 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-4/5 h-4/5">
            {/* Decorative shapes */}
            <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-pink-500 opacity-70"></div>
            <div className="absolute bottom-20 right-10 w-16 h-16 rounded-full bg-yellow-400 opacity-60"></div>
            <div className="absolute top-1/4 right-1/4 w-8 h-8 rounded-full bg-white opacity-30"></div>
            <div className="absolute bottom-1/3 left-1/3 w-12 h-12 rounded-full border-2 border-white opacity-40"></div>
            <div className="absolute top-1/2 right-1/2 w-6 h-6 transform rotate-45 bg-red-400 opacity-60"></div>
            
            {/* Image container with fancy border */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-3/4 h-3/4 rounded-[40px] overflow-hidden border-4 border-white/20 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                  alt="Student studying" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Quote */}
        <div className="absolute bottom-8 left-0 right-0 text-center text-white px-8">
          <p className="text-lg italic">"Education is the most powerful weapon you can use to change the world."</p>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <img src={logo} alt="BuddyStudy Logo" className="h-28" />
          </div>
          
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Hi, Welcome Back! 👋</h2>
          <p className="text-center text-gray-600 mb-8">Let's get you logged in</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter your password"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
              </div>
              
              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Forgot password?</a>
              </div>
            </div>
            
            {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
            
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold shadow hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <p className="mt-8 text-center text-gray-600">
            Don't have an account? <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
