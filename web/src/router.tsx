import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { RootLayout } from '@/components/layout/RootLayout';
import { LoginPage } from '@/pages/admin/login/LoginPage';
import { DashboardPage } from '@/pages/admin/dashboard/DashboardPage';
import { OrdersListPage } from '@/pages/admin/orders/OrdersListPage';
import { OrderDetailPage } from '@/pages/admin/orders/OrderDetailPage';
import { ProductsListPage } from '@/pages/admin/products/ProductsListPage';
import { ProductFormPage } from '@/pages/admin/products/ProductFormPage';
import { CategoriesPage } from '@/pages/admin/categories/CategoriesPage';
import { CouponsPage } from '@/pages/admin/coupons/CouponsPage';
import { CouponFormPage } from '@/pages/admin/coupons/CouponFormPage';
import { SettingsPage } from '@/pages/admin/settings/SettingsPage';
import { CartPage } from '@/pages/cart/CartPage';
import { CategoriesListPage } from '@/pages/categories/CategoriesListPage';
import { CategoryPage } from '@/pages/categories/CategoryPage';
import { CheckoutPage } from '@/pages/checkout/CheckoutPage';
import { CheckoutResultPage } from '@/pages/checkout/CheckoutResultPage';
import { HomePage } from '@/pages/home/HomePage';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';
import { MyOrdersPage } from '@/pages/order/MyOrdersPage';
import { OrderConfirmationPage } from '@/pages/order/OrderConfirmationPage';
import { OrderTrackingPage } from '@/pages/order/OrderTrackingPage';
import { ProductPage } from '@/pages/product/ProductPage';
import { SearchPage } from '@/pages/search/SearchPage';

export const router = createBrowserRouter([
  // --- Tienda pública ---
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'categorias', element: <CategoriesListPage /> },
      { path: 'categorias/:slug', element: <CategoryPage /> },
      { path: 'buscar', element: <SearchPage /> },
      { path: 'productos/:slug', element: <ProductPage /> },
      { path: 'carrito', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'checkout/resultado', element: <CheckoutResultPage /> },
      { path: 'pedido/:id', element: <OrderConfirmationPage /> },
      { path: 'mis-pedidos', element: <MyOrdersPage /> },
      { path: 'mis-pedidos/:id', element: <OrderTrackingPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },

  // --- Admin ---
  {
    path: '/admin/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'pedidos', element: <OrdersListPage /> },
          { path: 'pedidos/:id', element: <OrderDetailPage /> },
          { path: 'productos', element: <ProductsListPage /> },
          { path: 'productos/nuevo', element: <ProductFormPage /> },
          { path: 'productos/:id', element: <ProductFormPage /> },
          { path: 'categorias', element: <CategoriesPage /> },
          { path: 'cupones', element: <CouponsPage /> },
          { path: 'cupones/nuevo', element: <CouponFormPage /> },
          { path: 'cupones/:id', element: <CouponFormPage /> },
          { path: 'configuracion', element: <SettingsPage /> },
        ],
      },
    ],
  },
]);