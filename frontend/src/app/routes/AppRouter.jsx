import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { AppLayout } from '../../components/layout/AppLayout.jsx';

import { LoginPage } from '../../features/auth/pages/LoginPage.jsx';
import { AdminDashboardPage } from '../../features/dashboard/pages/AdminDashboardPage.jsx';
import { ProductListPage } from '../../features/products/pages/ProductListPage.jsx';
import { ProductFormPage } from '../../features/products/pages/ProductFormPage.jsx';
import { IngredientListPage } from '../../features/ingredients/pages/IngredientListPage.jsx';
import { IngredientFormPage } from '../../features/ingredients/pages/IngredientFormPage.jsx';
import { StockPage } from '../../features/stock/pages/StockPage.jsx';
import { StockTransactionPage } from '../../features/stock/pages/StockTransactionPage.jsx';
import { RecipeListPage } from '../../features/recipes/pages/RecipeListPage.jsx';
import { RecipeFormPage } from '../../features/recipes/pages/RecipeFormPage.jsx';
import { ReportsPage } from '../../features/reports/pages/ReportsPage.jsx';
import { POSPage } from '../../features/pos/pages/POSPage.jsx';
import { OrderHistoryPage } from '../../features/orders/pages/OrderHistoryPage.jsx';
import { OrderDetailPage } from '../../features/orders/pages/OrderDetailPage.jsx';

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
      {/* Public Route */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AppLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="products" element={<ProductListPage />} />
                <Route path="products/new" element={<ProductFormPage />} />
                <Route path="products/:id/edit" element={<ProductFormPage />} />
                <Route path="ingredients" element={<IngredientListPage />} />
                <Route path="ingredients/new" element={<IngredientFormPage />} />
                <Route path="ingredients/:id/edit" element={<IngredientFormPage />} />
                <Route path="stock" element={<StockPage />} />
                <Route path="stock/transactions" element={<StockTransactionPage />} />
                <Route path="recipes" element={<RecipeListPage />} />
                <Route path="recipes/new" element={<RecipeFormPage />} />
                <Route path="recipes/:id/edit" element={<RecipeFormPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Staff Protected Routes */}
      <Route
        path="/staff/*"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STAFF]}>
            <AppLayout>
              <Routes>
                <Route path="pos" element={<POSPage />} />
                <Route path="orders" element={<OrderHistoryPage />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
                <Route path="*" element={<Navigate to="/staff/pos" replace />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Default Redirection */}
      <Route path="/" element={<RoleHomeRedirect />} />
      <Route path="*" element={<RoleHomeRedirect />} />
    </Routes>
  );
}
export default AppRouter;
