import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider.jsx';
import { ROLES } from '../../constants/roles.js';
import { ROUTES } from '../../constants/routes.js';
import { AccessDeniedPage } from '../../features/auth/pages/AccessDeniedPage.jsx';

export function RoleRoute({ children, allowedRoles = [] }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // If role is not in the allowed list
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If ADMIN is trying to access STAFF page, redirect to ADMIN dashboard
    if (user.role === ROLES.ADMIN) {
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    }
    // If STAFF is trying to access ADMIN page, show Access Denied page
    return <AccessDeniedPage />;
  }

  return children;
}
export default RoleRoute;
