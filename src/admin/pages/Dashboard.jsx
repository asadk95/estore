import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPackage, FiShoppingBag, FiUsers, FiDollarSign,
  FiTrendingUp, FiAlertCircle, FiLoader, FiEye
} from 'react-icons/fi';
import { adminAPI } from '../../services/adminApi';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await adminAPI.getStats();
      setStats(data.stats);
      setRecentOrders(data.recentOrders || []);
    } catch (error) {
      toast.error('Failed to load dashboard');
      // Try to setup admin if not exists
      if (error.message?.includes('Admin access')) {
        try {
          await adminAPI.setup();
          toast.success('Admin user created! Please login again.');
        } catch (e) {
          console.log('Setup not needed:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <FiLoader className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      icon: <FiDollarSign />,
      label: 'Total Revenue',
      value: `Rs. ${stats?.totalRevenue?.toLocaleString() || 0}`,
      color: 'success'
    },
    {
      icon: <FiShoppingBag />,
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      color: ''
    },
    {
      icon: <FiPackage />,
      label: 'Total Products',
      value: stats?.totalProducts || 0,
      color: ''
    },
    {
      icon: <FiUsers />,
      label: 'Total Customers',
      value: stats?.totalUsers || 0,
      color: ''
    },
    {
      icon: <FiTrendingUp />,
      label: 'Monthly Revenue',
      value: `Rs. ${stats?.monthlyRevenue?.toLocaleString() || 0}`,
      color: 'success'
    },
    {
      icon: <FiAlertCircle />,
      label: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      color: 'warning'
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      processing: 'info',
      shipped: 'info',
      delivered: 'success',
      cancelled: 'error',
    };
    return colors[status] || '';
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <div className="admin-page-actions">
          <Link to="/admin/products" className="btn btn-primary">
            <FiPackage /> Manage Products
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats">
        {statCards.map((stat, index) => (
          <div key={index} className="admin-stat-card">
            <div className={`admin-stat-card__icon ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="admin-stat-card__info">
              <h3>{stat.label}</h3>
              <p>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="admin-section">
        <div className="admin-section__header">
          <h2>Recent Orders</h2>
          <Link to="/admin/orders" className="btn btn-secondary btn-sm">
            View All
          </Link>
        </div>
        <div className="admin-table-wrapper">
          {recentOrders.length === 0 ? (
            <div className="admin-empty">
              <p>No orders yet</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.orderId}</strong></td>
                    <td>{order.shippingAddress?.name || 'N/A'}</td>
                    <td>Rs. {order.total?.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/admin/orders?view=${order.id}`} className="btn btn-sm btn-outline">
                        <FiEye /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="admin-quick-stats">
        <div className="admin-section">
          <div className="admin-section__header">
            <h2>Order Status Overview</h2>
          </div>
          <div className="admin-section__body">
            <div className="quick-stat-grid">
              <div className="quick-stat">
                <span className="quick-stat__label">Processing</span>
                <span className="quick-stat__value">{stats?.processingOrders || 0}</span>
              </div>
              <div className="quick-stat">
                <span className="quick-stat__label">Low Stock Products</span>
                <span className="quick-stat__value warning">{stats?.lowStockProducts || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-dashboard { }
        .admin-page-actions { display: flex; gap: var(--space-2); }
        .admin-empty { padding: var(--space-8); text-align: center; color: var(--text-secondary); }
        .quick-stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-4); }
        .quick-stat { text-align: center; padding: var(--space-4); background: var(--bg-tertiary); border-radius: var(--radius-md); }
        .quick-stat__label { display: block; font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-2); }
        .quick-stat__value { font-size: var(--text-2xl); font-weight: 700; }
        .quick-stat__value.warning { color: var(--warning-500); }
      `}</style>
    </div>
  );
};

export default Dashboard;
