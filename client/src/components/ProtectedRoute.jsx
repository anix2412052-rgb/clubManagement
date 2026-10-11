import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Checking authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <h3 className="text-lg font-bold text-red-700 mb-2">Access Denied</h3>
        <p className="text-sm text-red-600 mb-4">
          You do not have the required permissions ({allowedRoles.join(', ')}) to view this page.
        </p>
        <a
          href="/"
          className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
        >
          Return Home
        </a>
      </div>
    );
  }

  return children;
};
