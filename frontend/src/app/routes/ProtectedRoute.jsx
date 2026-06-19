import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider.jsx';
import { PageLoader } from '../../components/feedback/PageLoader.jsx';
import { ROLES } from '../../constants/roles.js';
import { ROUTES } from '../../constants/routes.js';
import { AccessDeniedPage } from '../../features/auth/pages/AccessDeniedPage.jsx';

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <PageLoader text="Đang kiểm tra phiên đăng nhập..." />;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === ROLES.ADMIN) {
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    }
    return <AccessDeniedPage />;
  }

  return children;
}
