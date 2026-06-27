import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from './router/Router';
import { ToastProvider } from './components/common/Toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';

import Layout from './components/layout/Layout';
import { PrivateRoute, CustomerRoute, SellerRoute, AdminRoute } from './components/common/GuardedRoutes';
import ScrollToTop from './components/common/ScrollToTop';

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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-4)',
    }}>
      <div className="spinner" />
      <p style={{
        color: 'var(--color-text-muted)',
        fontSize: 'var(--text-sm)',
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.05em',
      }}>
        Loading...
      </p>
    </div>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                  <Route path="/" element={<Layout><HomePage /></Layout>} />
                  <Route path="/products" element={<Layout><ProductListPage /></Layout>} />
                  <Route path="/products/:slug" element={<Layout><ProductDetailPage /></Layout>} />
                  <Route path="/login" element={<Layout><LoginPage /></Layout>} />
                  <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
                  <Route path="/cart" element={<Layout><PrivateRoute><CustomerRoute><CartPage /></CustomerRoute></PrivateRoute></Layout>} />
                  <Route path="/checkout" element={<Layout><PrivateRoute><CustomerRoute><CheckoutPage /></CustomerRoute></PrivateRoute></Layout>} />
                  <Route path="/order-confirmation/:id" element={<Layout><PrivateRoute><CustomerRoute><OrderConfirmPage /></CustomerRoute></PrivateRoute></Layout>} />
                  <Route path="/my-orders" element={<Layout><PrivateRoute><CustomerRoute><MyOrdersPage /></CustomerRoute></PrivateRoute></Layout>} />
                  <Route path="/seller/dashboard" element={<Layout><SellerRoute><SellerDashboardPage /></SellerRoute></Layout>} />
                  <Route path="/admin/dashboard" element={<Layout><AdminRoute><AdminDashboardPage /></AdminRoute></Layout>} />
                  <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
                </Routes>
              </Suspense>
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
