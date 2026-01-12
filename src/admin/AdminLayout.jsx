import { useState } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import {
  FiHome, FiPackage, FiShoppingBag, FiUsers, FiSettings,
  FiLogOut, FiMenu, FiX, FiChevronDown
} from 'react-icons/fi';
import useAuthStore from '../store/useAuthStore';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Check if user is admin
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { path: '/admin', icon: <FiHome />, label: 'Dashboard', exact: true },
    { path: '/admin/products', icon: <FiPackage />, label: 'Products' },
    { path: '/admin/orders', icon: <FiShoppingBag />, label: 'Orders' },
    { path: '/admin/users', icon: <FiUsers />, label: 'Users' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      {/* Mobile Header */}
      <header className="admin-mobile-header">
        <button
          className="admin-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <FiX /> : <FiMenu />}
        </button>
        <span className="admin-mobile-title">E-Store Admin</span>
      </header>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'collapsed'} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar__header">
          <Link to="/admin" className="admin-logo">
            <span className="admin-logo__icon">🛒</span>
            {sidebarOpen && <span className="admin-logo__text">E-Store Admin</span>}
          </Link>
          <button
            className="admin-sidebar__toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FiChevronDown />
          </button>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav__item ${isActive(item.path, item.exact) ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="admin-nav__icon">{item.icon}</span>
              {sidebarOpen && <span className="admin-nav__label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <Link to="/" className="admin-nav__item">
            <span className="admin-nav__icon"><FiSettings /></span>
            {sidebarOpen && <span className="admin-nav__label">View Store</span>}
          </Link>
          <button onClick={logout} className="admin-nav__item admin-nav__logout">
            <span className="admin-nav__icon"><FiLogOut /></span>
            {sidebarOpen && <span className="admin-nav__label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="admin-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main Content */}
      <main className={`admin-main ${sidebarOpen ? '' : 'expanded'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
