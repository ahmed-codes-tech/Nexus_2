import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user's role
    if (user?.role === 'entrepreneur') {
      return <Navigate to="/dashboard/entrepreneur" replace />;
    } else if (user?.role === 'investor') {
      return <Navigate to="/dashboard/investor" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};