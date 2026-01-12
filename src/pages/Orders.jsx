import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiPackage, FiTruck, FiCheck, FiX, FiEye, FiRefreshCw, FiLoader } from 'react-icons/fi';
import useAuthStore from '../store/useAuthStore';
import { ordersAPI } from '../services/api';
import './Orders.css';

const statusConfig = {
  pending: { label: 'Pending', icon: <FiPackage />, color: 'warning' },
  confirmed: { label: 'Confirmed', icon: <FiCheck />, color: 'info' },
  processing: { label: 'Processing', icon: <FiPackage />, color: 'warning' },
  shipped: { label: 'Shipped', icon: <FiTruck />, color: 'info' },
  delivered: { label: 'Delivered', icon: <FiCheck />, color: 'success' },
  cancelled: { label: 'Cancelled', icon: <FiX />, color: 'error' },
};

const Orders = () => {
  const { isAuthenticated } = useAuthStore();
  const [filter, setFilter] = useState('all');

  // Fetch orders from API
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['orders', filter],
    queryFn: () => ordersAPI.getAll(filter === 'all' ? undefined : filter),
    enabled: isAuthenticated,
    staleTime: 1000 * 60, // 1 minute
  });

  const orders = data?.orders || [];

  if (!isAuthenticated) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="orders-empty">
            <h2>Please Login</h2>
            <p>You need to be logged in to view your orders</p>
            <Link to="/login" className="btn btn-primary">Login Now</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/account">Account</Link>
          <span>/</span>
          <span>Orders</span>
        </nav>

        <div className="orders-header">
          <h1>My Orders</h1>
          <div className="orders-filter">
            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
              <button
                key={status}
                className={`filter-btn ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status)}
              >
                {status === 'all' ? 'All Orders' : statusConfig[status]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="orders-loading">
            <FiLoader className="spinner" />
            <p>Loading your orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="orders-error">
            <p>Failed to load orders</p>
            <button className="btn btn-primary" onClick={() => refetch()}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && orders.length === 0 && (
          <div className="orders-empty">
            <FiPackage />
            <h2>No orders found</h2>
            <p>You haven't placed any orders yet.</p>
            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <span className="order-id">{order.orderId || `ORD-${order.id}`}</span>
                    <span className="order-date">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
                    </span>
                  </div>
                  <span className={`order-status ${statusConfig[order.status]?.color || 'warning'}`}>
                    {statusConfig[order.status]?.icon || <FiPackage />}
                    {statusConfig[order.status]?.label || order.status}
                  </span>
                </div>

                <div className="order-items">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} />
                      <div className="order-item-info">
                        <span className="order-item-name">{item.name}</span>
                        <span className="order-item-qty">Qty: {item.quantity}</span>
                      </div>
                      <span className="order-item-price">Rs. {item.price?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <span className="order-total">Total: Rs. {order.total?.toLocaleString()}</span>
                  <div className="order-actions">
                    <Link to={`/orders/${order.id}`} className="btn btn-secondary">
                      <FiEye /> View Details
                    </Link>
                    {order.status === 'delivered' && (
                      <button className="btn btn-outline">
                        <FiRefreshCw /> Buy Again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
