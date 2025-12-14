import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log('🔐 Verifying authentication...');
        // Always verify session with backend (uses cookies automatically)
        const response = await axiosInstance.get('/auth/me');
        if (response.data.user) {
          // Store user in localStorage for client-side reference
          localStorage.setItem('user', JSON.stringify(response.data.user));
          console.log('✅ Authentication verified successfully');
          setIsAuthenticated(true);
        } else {
          console.warn('⚠️ No user data in response');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      } catch (error) {
        // 401 or any error means user is not authenticated
        console.error('❌ Auth verification failed:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          cookies: document.cookie,
        });
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
