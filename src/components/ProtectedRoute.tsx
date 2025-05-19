import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.ts';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated, loading, checkAuthentication } = useAuthStore();
  const [checkComplete, setCheckComplete] = useState(false);
  
  // Update the useEffect to check authentication more reliably
  useEffect(() => {
    // Check authentication status when component mounts
    const checkAuth = async () => {
      try {
        if (!isAuthenticated && localStorage.getItem('token')) {
          await checkAuthentication();
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setCheckComplete(true);
      }
    };
    
    checkAuth();
  }, [isAuthenticated, checkAuthentication]);

  // Add console logs to see authentication state changes
  useEffect(() => {
    console.log('ProtectedRoute auth status:', 
      { user: !!user, isAuthenticated, token: !!localStorage.getItem('token') });
  }, [user, isAuthenticated]);

  // Show loading state while checking authentication
  if (loading || !checkComplete) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Verifying your access...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;