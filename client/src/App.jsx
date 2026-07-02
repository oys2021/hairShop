import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layout/AppLayout.jsx';
import AuditLogsPage from './pages/AuditLogsPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import CustomersPage from './pages/CustomersPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import LoadingPage from './pages/LoadingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProductFormPage from './pages/ProductFormPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import SaleDetailsPage from './pages/SaleDetailsPage.jsx';
import SaleFormPage from './pages/SaleFormPage.jsx';
import SalesPage from './pages/SalesPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import { useAuth } from './context/AuthContext.jsx';

function RequireAuth({ children }) {
  const { loading, user } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RequireRole({ roles, children }) {
  const { loading, user } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/loading" element={<LoadingPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/products"
          element={
            <RequireRole roles={['admin', 'manager']}>
              <ProductsPage />
            </RequireRole>
          }
        />
        <Route
          path="/products/new"
          element={
            <RequireRole roles={['admin', 'manager']}>
              <ProductFormPage />
            </RequireRole>
          }
        />
        <Route
          path="/products/:productId/edit"
          element={
            <RequireRole roles={['admin', 'manager']}>
              <ProductFormPage />
            </RequireRole>
          }
        />
        <Route
          path="/categories"
          element={
            <RequireRole roles={['admin', 'manager']}>
              <CategoriesPage />
            </RequireRole>
          }
        />
        <Route
          path="/categories/new"
          element={
            <RequireRole roles={['admin', 'manager']}>
              <CategoriesPage mode="add" />
            </RequireRole>
          }
        />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/sales/new" element={<SaleFormPage />} />
        <Route path="/sales/:saleId" element={<SaleDetailsPage />} />
        <Route path="/sales/:saleId/edit" element={<SaleFormPage mode="edit" />} />
        <Route
          path="/customers"
          element={
            <RequireRole roles={['admin', 'manager']}>
              <CustomersPage />
            </RequireRole>
          }
        />
        <Route
          path="/users"
          element={
            <RequireRole roles={['admin', 'manager']}>
              <UsersPage />
            </RequireRole>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <RequireRole roles={['admin']}>
              <AuditLogsPage />
            </RequireRole>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
