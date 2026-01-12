import { useState, useEffect } from 'react';
import { FiSearch, FiLoader, FiEye, FiX } from 'react-icons/fi';
import { adminAPI } from '../../services/adminApi';
import toast from 'react-hot-toast';

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const OrdersAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [viewOrder, setViewOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getAllOrders(filter);
      setOrders(data.orders || []);
      setStats(data.stats || {});
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated!');
      loadOrders();
      if (viewOrder && viewOrder.id === orderId) {
        setViewOrder({ ...viewOrder, status: newStatus });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'primary',
      processing: 'primary',
      shipped: 'info',
      delivered: 'success',
      cancelled: 'error',
    };
    return colors[status] || '';
  };

  if (loading && orders.length === 0) {
    return (
      <div className="admin-loading">
        <FiLoader className="spinner" />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-admin">
      <div className="admin-page-header">
        <h1>Orders ({stats.total || 0})</h1>
      </div>

      {/* Stats */}
      <div className="orders-stats">
        {['pending', 'processing', 'shipped', 'delivered'].map(status => (
          <button
            key={status}
            className={`order-stat-btn ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(filter === status ? '' : status)}
          >
            <span className="order-stat-count">{stats[status] || 0}</span>
            <span className="order-stat-label">{status}</span>
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="admin-toolbar">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="form-input"
          style={{ maxWidth: 200 }}
        >
          <option value="">All Orders</option>
          {statusOptions.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td><strong>{order.orderId}</strong></td>
                <td>
                  <div>{order.shippingAddress?.name}</div>
                  <small className="text-muted">{order.shippingAddress?.phone}</small>
                </td>
                <td>{order.items?.length || 0} items</td>
                <td>Rs. {order.total?.toLocaleString()}</td>
                <td>
                  <span className="payment-method">{order.paymentMethod?.toUpperCase()}</span>
                </td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className={`status-select ${order.status}`}
                    disabled={updating}
                  >
                    {statusOptions.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => setViewOrder(order)}
                  >
                    <FiEye /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {viewOrder && (
        <div className="admin-modal-overlay" onClick={() => setViewOrder(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>Order {viewOrder.orderId}</h2>
              <button className="admin-modal__close" onClick={() => setViewOrder(null)}>
                <FiX />
              </button>
            </div>
            <div className="admin-modal__body">
              {/* Order Info */}
              <div className="order-detail-grid">
                <div className="order-detail-section">
                  <h4>Customer</h4>
                  <p><strong>{viewOrder.shippingAddress?.name}</strong></p>
                  <p>{viewOrder.shippingAddress?.phone}</p>
                  <p>{viewOrder.shippingAddress?.address}</p>
                  <p>{viewOrder.shippingAddress?.city}</p>
                </div>
                <div className="order-detail-section">
                  <h4>Order Info</h4>
                  <p><strong>Status:</strong> <span className={`status-badge ${viewOrder.status}`}>{viewOrder.status}</span></p>
                  <p><strong>Payment:</strong> {viewOrder.paymentMethod?.toUpperCase()}</p>
                  <p><strong>Payment Status:</strong> {viewOrder.paymentStatus}</p>
                  <p><strong>Date:</strong> {new Date(viewOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Items */}
              <div className="order-items-section">
                <h4>Items</h4>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="order-item-info">
                            <img src={item.image} alt={item.name} className="order-item-img" />
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td>Rs. {item.price?.toLocaleString()}</td>
                        <td>{item.quantity}</td>
                        <td>Rs. {(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="order-totals">
                <div><span>Subtotal:</span> <span>Rs. {viewOrder.subtotal?.toLocaleString()}</span></div>
                <div><span>Shipping:</span> <span>Rs. {viewOrder.shipping?.toLocaleString()}</span></div>
                <div className="order-total"><span>Total:</span> <span>Rs. {viewOrder.total?.toLocaleString()}</span></div>
              </div>

              {/* Update Status */}
              <div className="order-update-section">
                <label>Update Status:</label>
                <select
                  value={viewOrder.status}
                  onChange={(e) => updateStatus(viewOrder.id, e.target.value)}
                  className="form-input"
                  disabled={updating}
                >
                  {statusOptions.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .orders-stats { display: flex; gap: var(--space-3); margin-bottom: var(--space-4); flex-wrap: wrap; }
        .order-stat-btn { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: var(--space-3) var(--space-4); text-align: center; cursor: pointer; transition: all 0.2s; min-width: 100px; }
        .order-stat-btn:hover, .order-stat-btn.active { border-color: var(--primary-500); background: var(--primary-50); }
        .order-stat-count { display: block; font-size: var(--text-xl); font-weight: 700; }
        .order-stat-label { font-size: var(--text-sm); color: var(--text-secondary); text-transform: capitalize; }
        
        .admin-toolbar { margin-bottom: var(--space-4); }
        .text-muted { color: var(--text-secondary); font-size: var(--text-sm); }
        .payment-method { font-size: var(--text-xs); background: var(--bg-tertiary); padding: 2px 6px; border-radius: var(--radius-sm); }
        
        .status-select { padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-size: var(--text-sm); }
        .status-select.pending { background: var(--warning-50); }
        .status-select.shipped { background: var(--info-50); }
        .status-select.delivered { background: var(--success-50); }
        
        .order-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4); }
        .order-detail-section h4 { margin-bottom: var(--space-2); color: var(--text-secondary); font-size: var(--text-sm); }
        .order-items-section { margin-bottom: var(--space-4); }
        .order-items-section h4 { margin-bottom: var(--space-2); }
        .order-item-info { display: flex; align-items: center; gap: var(--space-2); }
        .order-item-img { width: 40px; height: 40px; object-fit: cover; border-radius: var(--radius-sm); }
        
        .order-totals { text-align: right; padding: var(--space-3); background: var(--bg-tertiary); border-radius: var(--radius-md); margin-bottom: var(--space-4); }
        .order-totals div { display: flex; justify-content: flex-end; gap: var(--space-6); padding: var(--space-1) 0; }
        .order-total { font-weight: 700; font-size: var(--text-lg); border-top: 1px solid var(--border-color); padding-top: var(--space-2); margin-top: var(--space-2); }
        
        .order-update-section { display: flex; align-items: center; gap: var(--space-3); padding-top: var(--space-3); border-top: 1px solid var(--border-color); }
        .order-update-section label { font-weight: 500; }
        .order-update-section select { flex: 1; max-width: 200px; }
        
        .admin-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: var(--space-4); }
        .admin-modal { background: var(--bg-secondary); border-radius: var(--radius-lg); max-width: 700px; width: 100%; max-height: 90vh; overflow-y: auto; }
        .admin-modal__header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); border-bottom: 1px solid var(--border-color); }
        .admin-modal__close { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-secondary); }
        .admin-modal__body { padding: var(--space-4); }
      `}</style>
    </div>
  );
};

export default OrdersAdmin;
