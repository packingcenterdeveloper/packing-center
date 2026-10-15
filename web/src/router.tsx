import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { CartPage } from '@/pages/cart/CartPage';
import { CategoriesListPage } from '@/pages/categories/CategoriesListPage';
import { CategoryPage } from '@/pages/categories/CategoryPage';
import { CheckoutPage } from '@/pages/checkout/CheckoutPage';
import { HomePage } from '@/pages/home/HomePage';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';
import { MyOrdersPage } from '@/pages/order/MyOrdersPage';
import { OrderConfirmationPage } from '@/pages/order/OrderConfirmationPage';
import { OrderTrackingPage } from '@/pages/order/OrderTrackingPage';
import { ProductPage } from '@/pages/product/ProductPage';
import { SearchPage } from '@/pages/search/SearchPage';

export const router = createBrowserRouter([
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
      { path: 'pedido/:id', element: <OrderConfirmationPage /> },
      { path: 'mis-pedidos', element: <MyOrdersPage /> },
      { path: 'mis-pedidos/:id', element: <OrderTrackingPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);