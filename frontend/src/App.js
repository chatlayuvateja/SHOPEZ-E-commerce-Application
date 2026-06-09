import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ErrorBoundary from './components/ErrorBoundary';

import Layout from './components/layout/Layout';
import PrivateRoute from './components/common/PrivateRoute';
import SellerRoute from './components/common/SellerRoute';
import AdminRoute from './components/common/AdminRoute';

const HomePage = lazy(() => import('./pages/HomePage'));
const ProductListPage = lazy(() => import('./pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderConfirmPage = lazy(() => import('./pages/OrderConfirmPage'));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const SellerDashboardPage = lazy(() => import('./pages/seller/SellerDashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const PageLoader = () => (
  <div className="page-loader">
    <div className="page-loader__spinner" />
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                },
              }}
            />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Layout><HomePage /></Layout>} />
                <Route path="/products" element={<Layout><ProductListPage /></Layout>} />
                <Route path="/products/:slug" element={<Layout><ProductDetailPage /></Layout>} />
                <Route path="/login" element={<Layout><LoginPage /></Layout>} />
                <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
                <Route path="/cart" element={<Layout><PrivateRoute><CartPage /></PrivateRoute></Layout>} />
                <Route path="/checkout" element={<Layout><PrivateRoute><CheckoutPage /></PrivateRoute></Layout>} />
                <Route path="/order-confirmation/:id" element={<Layout><PrivateRoute><OrderConfirmPage /></PrivateRoute></Layout>} />
                <Route path="/my-orders" element={<Layout><PrivateRoute><MyOrdersPage /></PrivateRoute></Layout>} />
                <Route path="/seller/dashboard" element={<Layout><SellerRoute><SellerDashboardPage /></SellerRoute></Layout>} />
                <Route path="/admin/dashboard" element={<Layout><AdminRoute><AdminDashboardPage /></AdminRoute></Layout>} />
                <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
              </Routes>
            </Suspense>
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
