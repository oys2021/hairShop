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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/loading" element={<LoadingPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/new" element={<ProductFormPage />} />
        <Route path="/products/:productId/edit" element={<ProductFormPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/new" element={<CategoriesPage mode="add" />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/sales/new" element={<SaleFormPage />} />
        <Route path="/sales/:saleId" element={<SaleDetailsPage />} />
        <Route path="/sales/:saleId/edit" element={<SaleFormPage mode="edit" />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/audit-logs" element={<AuditLogsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
