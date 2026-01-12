// API Configuration and Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth token
const getToken = () => {
  try {
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.state?.token || null;
    }
  } catch {
    return null;
  }
  return null;
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // Don't stringify if FormData
  if (options.body && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: userData,
  }),

  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: credentials,
  }),

  getMe: () => apiRequest('/auth/me'),

  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    const query = searchParams.toString();
    return apiRequest(`/products${query ? `?${query}` : ''}`);
  },

  getById: (id) => apiRequest(`/products/${id}`),

  getFeatured: () => apiRequest('/products/featured'),

  getCategories: () => apiRequest('/products/categories'),

  search: (query) => apiRequest(`/products?search=${encodeURIComponent(query)}`),
};

// Cart API
export const cartAPI = {
  get: () => apiRequest('/cart'),

  add: (productId, quantity = 1) => apiRequest('/cart/add', {
    method: 'POST',
    body: { productId, quantity },
  }),

  update: (productId, quantity) => apiRequest(`/cart/update/${productId}`, {
    method: 'PUT',
    body: { quantity },
  }),

  remove: (productId) => apiRequest(`/cart/remove/${productId}`, {
    method: 'DELETE',
  }),

  clear: () => apiRequest('/cart/clear', { method: 'DELETE' }),
};

// Orders API
export const ordersAPI = {
  getAll: (status) => apiRequest(`/orders${status ? `?status=${status}` : ''}`),

  getById: (id) => apiRequest(`/orders/${id}`),

  create: (orderData) => apiRequest('/orders', {
    method: 'POST',
    body: orderData,
  }),

  cancel: (id) => apiRequest(`/orders/${id}`, { method: 'DELETE' }),

  uploadPaymentProof: (id, formData) => apiRequest(`/orders/${id}/payment`, {
    method: 'PUT',
    body: formData,
  }),
};

// Users API
export const usersAPI = {
  getProfile: () => apiRequest('/users/profile'),

  updateProfile: (data) => apiRequest('/users/profile', {
    method: 'PUT',
    body: data,
  }),

  changePassword: (data) => apiRequest('/users/password', {
    method: 'PUT',
    body: data,
  }),

  getAddresses: () => apiRequest('/users/addresses'),

  addAddress: (address) => apiRequest('/users/addresses', {
    method: 'POST',
    body: address,
  }),

  deleteAddress: (id) => apiRequest(`/users/addresses/${id}`, {
    method: 'DELETE',
  }),
};

// Upload API
export const uploadAPI = {
  image: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  paymentProof: async (file) => {
    const formData = new FormData();
    formData.append('proof', file);

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/upload/payment-proof`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },
};

export default {
  auth: authAPI,
  products: productsAPI,
  cart: cartAPI,
  orders: ordersAPI,
  users: usersAPI,
  upload: uploadAPI,
};
