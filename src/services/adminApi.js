// Admin API Service
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token
const getToken = () => localStorage.getItem('auth-storage')
  ? JSON.parse(localStorage.getItem('auth-storage'))?.state?.token
  : null;

// API request helper
const adminRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};

// Admin API endpoints
export const adminAPI = {
  // Dashboard
  getStats: () => adminRequest('/admin/stats'),

  // Setup
  setup: () => adminRequest('/admin/setup', { method: 'POST' }),

  // Users
  getUsers: () => adminRequest('/admin/users'),
  updateUser: (id, data) => adminRequest(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Products (using existing endpoints)
  getProducts: (params = '') => adminRequest(`/products${params}`),
  createProduct: (data) => adminRequest('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateProduct: (id, data) => adminRequest(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteProduct: (id) => adminRequest(`/products/${id}`, {
    method: 'DELETE',
  }),

  // Orders
  getAllOrders: (status) => adminRequest(`/orders/admin/all${status ? `?status=${status}` : ''}`),
  updateOrderStatus: (id, status, note) => adminRequest(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, note }),
  }),
};

export default adminAPI;
