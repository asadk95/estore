import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import Orders from './pages/Orders';
import Search from './pages/Search';
import Deals from './pages/Deals';
import Contact from './pages/Contact';
import About from './pages/About';
import FAQs from './pages/FAQs';

// Admin imports
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import ProductsAdmin from './admin/pages/ProductsAdmin';
import OrdersAdmin from './admin/pages/OrdersAdmin';
import UsersAdmin from './admin/pages/UsersAdmin';

import './index.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Layout wrapper component
const Layout = ({ children }) => (
  <div className="app-layout">
    <Header />
    <main className="main-content">{children}</main>
    <Footer />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Admin Routes - No Header/Footer */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="orders" element={<OrdersAdmin />} />
            <Route path="users" element={<UsersAdmin />} />
          </Route>

          {/* Main Store Routes - With Header/Footer */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                {/* Main Routes */}
                <Route path="/" element={<Home />} />

                {/* Product Routes */}
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/category/:slug" element={<Products />} />
                <Route path="/search" element={<Search />} />
                <Route path="/deals" element={<Deals />} />

                {/* Cart & Checkout */}
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/wishlist" element={<Wishlist />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ComingSoon title="Forgot Password" />} />

                {/* Account Routes */}
                <Route path="/account" element={<Account />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/track-order" element={<ComingSoon title="Track Order" />} />

                {/* Info Pages */}
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faqs" element={<FAQs />} />
                <Route path="/shipping" element={<ComingSoon title="Shipping Info" />} />
                <Route path="/returns" element={<ComingSoon title="Returns & Refunds" />} />
                <Route path="/privacy" element={<ComingSoon title="Privacy Policy" />} />
                <Route path="/terms" element={<ComingSoon title="Terms of Service" />} />

                {/* 404 */}
                <Route path="*" element={<ComingSoon title="Page Not Found" />} />
              </Routes>
            </Layout>
          } />
        </Routes>

        {/* Toast Notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '10px',
            },
          }}
        />
      </Router>
    </QueryClientProvider>
  );
}

// Temporary Coming Soon component for pages not yet built
const ComingSoon = ({ title }) => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    textAlign: 'center',
  }}>
    <h1 style={{
      fontSize: '2.5rem',
      marginBottom: '1rem',
      background: 'linear-gradient(135deg, #0ea5e9, #f97316)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}>
      {title}
    </h1>
    <p style={{ color: '#64748b', fontSize: '1.125rem' }}>
      This page is coming soon! 🚀
    </p>
  </div>
);

export default App;
