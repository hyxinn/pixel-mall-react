import { createBrowserRouter } from 'react-router-dom';

import App from './App';
import AdminShell from './components/admin/AdminShell';
import { RequireAdminAuth, RequirePermission } from './components/admin/PermissionGate';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DetailPage from './pages/DetailPage';
import CreateOrderPage from './pages/CreateOrderPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderListPage from './pages/OrderListPage';
import PayPage from './pages/PayPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminRolesPage from './pages/admin/AdminRolesPage';

const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      {
        path: '/',
        Component: HomePage,
      },
      {
        path: 'login',
        Component: LoginPage,
      },
      {
        path: 'home',
        Component: HomePage,
      },
      {
        path: 'detail/:goodId',
        Component: DetailPage,
      },
      {
        path: 'createOrder/:goodId',
        Component: CreateOrderPage,
      },
      {
        path: 'pay/:orderId',
        Component: PayPage,
      },
      {
        path: 'orderList',
        Component: OrderListPage,
      },
      {
        path: 'orderDetail/:orderId',
        Component: OrderDetailPage,
      },
      {
        path: 'admin/login',
        Component: AdminLoginPage,
      },
      {
        path: 'admin',
        element: (
          <RequireAdminAuth>
            <AdminShell />
          </RequireAdminAuth>
        ),
        children: [
          {
            index: true,
            element: (
              <RequirePermission permission="dashboard:view">
                <AdminDashboardPage />
              </RequirePermission>
            ),
          },
          {
            path: 'products',
            element: (
              <RequirePermission permission="products:view">
                <AdminProductsPage />
              </RequirePermission>
            ),
          },
          {
            path: 'categories',
            element: (
              <RequirePermission permission="categories:view">
                <AdminCategoriesPage />
              </RequirePermission>
            ),
          },
          {
            path: 'orders',
            element: (
              <RequirePermission permission="orders:view">
                <AdminOrdersPage />
              </RequirePermission>
            ),
          },
          {
            path: 'roles',
            element: (
              <RequirePermission permission="roles:view">
                <AdminRolesPage />
              </RequirePermission>
            ),
          },
        ],
      },
    ],
  },
]);

export default router;
