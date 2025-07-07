import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

// Hooks
import useAuth from '@/hooks/useAuth';

// Layouts
import MainLayout from '@/layouts/MainLayout';

// Pages
const Login = lazy(() => import('@/pages/auth/Login'));
const Dashboard = lazy(() => import('@/pages/dashboard'));
const NotFound = lazy(() => import('@/pages/error/NotFound'));
const Unauthorized = lazy(() => import('@/pages/error/Unauthorized'));

// Lazy load other pages
const ProductionPlan = lazy(() => import('@/pages/production/plan'));
const ProductionWorkOrder = lazy(() => import('@/pages/production/work-order'));
const Quality = lazy(() => import('@/pages/quality'));
const Equipment = lazy(() => import('@/pages/equipment'));
const Inventory = lazy(() => import('@/pages/inventory'));
const Worker = lazy(() => import('@/pages/worker'));
const Settings = lazy(() => import('@/pages/settings'));
const ItemManagement = lazy(() => import('@/pages/master/item'));
const ProductManagement = lazy(() => import('@/pages/master/product'));
const BomManagement = lazy(() => import('@/pages/master/bom'));

const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

interface PrivateRouteProps {
  children: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%'
      }}>
        <Spin indicator={loadingIcon} />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login page with the return URL
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return children;
};

const AppRoutes: React.FC = () => {
  return (
    <Suspense 
      fallback={
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100%'
        }}>
          <Spin indicator={loadingIcon} />
        </div>
      }
    >
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="master">
            <Route index element={<ItemManagement />} />
            <Route path="item" element={<ItemManagement />} />
            <Route path="product" element={<ProductManagement />} />
            <Route path="bom" element={<BomManagement />} />
          </Route>
          <Route path="production">
            <Route index element={<ProductionPlan />} />
            <Route path="plan" element={<ProductionPlan />} />
            <Route path="work-order" element={<ProductionWorkOrder />} />
          </Route>
          <Route path="quality" element={<Quality />} />
          <Route path="equipment" element={<Equipment />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="worker" element={<Worker />} />
          <Route path="settings" element={<Settings />} />
          <Route path="quality/*" element={<Quality />} />
          <Route path="equipment/*" element={<Equipment />} />
          <Route path="inventory/*" element={<Inventory />} />
          <Route path="worker/*" element={<Worker />} />
          <Route path="settings/*" element={<Settings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
