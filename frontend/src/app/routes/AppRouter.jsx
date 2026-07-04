import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { AppLayout } from '../../components/layout/AppLayout.jsx';

import { LoginPage } from '../../features/auth/pages/LoginPage.jsx';
import { AdminDashboardPage } from '../../features/dashboard/pages/AdminDashboardPage.jsx';
import { UserFormPage } from '../../features/users/pages/UserFormPage.jsx';
import { ProfilePage } from '../../features/profile/pages/ProfilePage.jsx';
import { ProductListPage } from '../../features/products/pages/ProductListPage.jsx';
import { ProductFormPage } from '../../features/products/pages/ProductFormPage.jsx';
import { IngredientListPage } from '../../features/ingredients/pages/IngredientListPage.jsx';
import { IngredientFormPage } from '../../features/ingredients/pages/IngredientFormPage.jsx';
import { StockPage } from '../../features/stock/pages/StockPage.jsx';
import { RecipeFormPage } from '../../features/recipes/pages/RecipeFormPage.jsx';
import { ReportsPage } from '../../features/reports/pages/ReportsPage.jsx';
import { KDSPage } from '../../features/kds/pages/KDSPage.jsx';
import { POSPage } from '../../features/pos/pages/POSPage.jsx';
import { OrderHistoryPage } from '../../features/orders/pages/OrderHistoryPage.jsx';
import { OrderDetailPage } from '../../features/orders/pages/OrderDetailPage.jsx';
import { StaffHRPage } from '../../features/hr/pages/StaffHRPage.jsx';
import { AdminHRPage } from '../../features/hr/pages/AdminHRPage.jsx';
import { AdminCalendarPage } from '../../features/hr/pages/AdminCalendarPage.jsx';
import { AttendancePage } from '../../features/hr/pages/AttendancePage.jsx';

import { ROLES } from '../../constants/roles.js';
import { ROUTES } from '../../constants/routes.js';

function RoleHomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (user.role === ROLES.ADMIN) return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  return <Navigate to={ROUTES.STAFF_POS} replace />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AppLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="users" element={<Navigate to="/admin/hr?tab=users" replace />} />
                <Route path="users/new" element={<UserFormPage />} />
                <Route path="users/:id/edit" element={<UserFormPage />} />
                <Route path="products" element={<ProductListPage />} />
                <Route path="products/new" element={<ProductFormPage />} />
                <Route path="products/:id/edit" element={<ProductFormPage />} />
                <Route path="ingredients" element={<IngredientListPage />} />
                <Route path="ingredients/new" element={<IngredientFormPage />} />
                <Route path="ingredients/:id/edit" element={<IngredientFormPage />} />
                <Route path="stock" element={<StockPage />} />
                <Route path="stock/transactions" element={<Navigate to="/admin/stock?tab=transactions" replace />} />
                <Route path="stock/forecast" element={<Navigate to="/admin/stock?tab=forecast" replace />} />
                <Route path="recipes" element={<Navigate to="/admin/products?tab=recipes" replace />} />
                <Route path="recipes/new" element={<RecipeFormPage />} />
                <Route path="recipes/:id/edit" element={<RecipeFormPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="hr/calendar" element={<AdminCalendarPage />} />
                <Route path="hr/attendance" element={<AttendancePage />} />
                <Route path="hr" element={<AdminHRPage />} />
                <Route path="*" element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STAFF]}>
            <AppLayout>
              <Routes>
                <Route path="pos" element={<POSPage />} />
                <Route path="kds" element={<KDSPage />} />
                <Route path="orders" element={<OrderHistoryPage />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
                <Route path="hr" element={<StaffHRPage />} />
                <Route path="*" element={<Navigate to={ROUTES.STAFF_POS} replace />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<RoleHomeRedirect />} />
      <Route path="*" element={<RoleHomeRedirect />} />
    </Routes>
  );
}

export default AppRouter;
