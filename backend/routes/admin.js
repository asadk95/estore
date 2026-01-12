const express = require('express');
const { stores } = require('../config/database');
const { authenticateToken, adminOnly } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', authenticateToken, adminOnly, asyncHandler(async (req, res) => {
  const products = stores.products.findAll();
  const orders = stores.orders.findAll();
  const users = stores.users.findAll();

  // Calculate stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);
  const monthlyRevenue = orders
    .filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear() &&
        o.status === 'delivered';
    })
    .reduce((sum, o) => sum + o.total, 0);

  res.json({
    stats: {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalUsers: users.filter(u => u.role !== 'admin').length,
      totalRevenue,
      monthlyRevenue,
      ordersToday: todayOrders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      processingOrders: orders.filter(o => o.status === 'processing').length,
      lowStockProducts: products.filter(p => p.stock < 10).length,
    },
    recentOrders: orders.slice(0, 5),
  });
}));

// GET /api/admin/users - List all users
router.get('/users', authenticateToken, adminOnly, asyncHandler(async (req, res) => {
  const users = stores.users.findAll();

  // Remove passwords from response
  const safeUsers = users.map(({ password, ...user }) => user);

  res.json({
    users: safeUsers,
    stats: {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      customers: users.filter(u => u.role !== 'admin').length,
    }
  });
}));

// PUT /api/admin/users/:id - Update user (toggle status, role)
router.put('/users/:id', authenticateToken, adminOnly, asyncHandler(async (req, res) => {
  const { role, status } = req.body;

  const user = stores.users.findById(parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Don't allow editing yourself
  if (user.id === req.user.id) {
    return res.status(400).json({ error: 'Cannot modify your own account from here' });
  }

  const updates = {};
  if (role && ['user', 'admin'].includes(role)) updates.role = role;
  if (status && ['active', 'suspended'].includes(status)) updates.status = status;

  stores.users.update(user.id, updates);

  const { password, ...updatedUser } = stores.users.findById(user.id);
  res.json({ message: 'User updated', user: updatedUser });
}));

// POST /api/admin/setup - Create initial admin user (one-time)
router.post('/setup', asyncHandler(async (req, res) => {
  const admins = stores.users.filter(u => u.role === 'admin');

  if (admins.length > 0) {
    return res.status(400).json({ error: 'Admin already exists' });
  }

  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = stores.users.create({
    name: 'Admin',
    email: 'admin@estore.pk',
    phone: '0300-0000000',
    password: hashedPassword,
    role: 'admin',
    status: 'active',
  });

  const { password, ...safeAdmin } = admin;
  res.status(201).json({
    message: 'Admin created successfully',
    admin: safeAdmin,
    credentials: { email: 'admin@estore.pk', password: 'admin123' }
  });
}));

module.exports = router;
