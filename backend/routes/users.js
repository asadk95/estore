const express = require('express');
const bcrypt = require('bcryptjs');
const { stores } = require('../config/database');
const { authenticateToken, adminOnly } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// GET /api/users/profile - Get current user profile
router.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const user = stores.users.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { password, ...userProfile } = user;
  res.json({ user: userProfile });
}));

// PUT /api/users/profile - Update user profile
router.put('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const { name, phone, addresses } = req.body;

  const updates = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (addresses) updates.addresses = addresses;

  const user = stores.users.update(req.user.id, updates);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { password, ...userProfile } = user;
  res.json({ message: 'Profile updated', user: userProfile });
}));

// PUT /api/users/password - Change password
router.put('/password', authenticateToken, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const user = stores.users.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  stores.users.update(req.user.id, { password: hashedPassword });

  res.json({ message: 'Password changed successfully' });
}));

// GET /api/users/addresses - Get saved addresses
router.get('/addresses', authenticateToken, asyncHandler(async (req, res) => {
  const user = stores.users.findById(req.user.id);
  res.json({ addresses: user?.addresses || [] });
}));

// POST /api/users/addresses - Add new address
router.post('/addresses', authenticateToken, asyncHandler(async (req, res) => {
  const { label, name, phone, address, city, postalCode, isDefault } = req.body;

  if (!name || !phone || !address || !city) {
    return res.status(400).json({ error: 'Name, phone, address, and city are required' });
  }

  const user = stores.users.findById(req.user.id);
  const addresses = user.addresses || [];

  // If this is default, unset other defaults
  if (isDefault) {
    addresses.forEach(addr => addr.isDefault = false);
  }

  const newAddress = {
    id: Date.now(),
    label: label || 'Home',
    name,
    phone,
    address,
    city,
    postalCode: postalCode || '',
    isDefault: isDefault || addresses.length === 0,
  };

  addresses.push(newAddress);
  stores.users.update(req.user.id, { addresses });

  res.status(201).json({ message: 'Address added', address: newAddress });
}));

// DELETE /api/users/addresses/:id - Delete address
router.delete('/addresses/:id', authenticateToken, asyncHandler(async (req, res) => {
  const user = stores.users.findById(req.user.id);
  const addresses = (user.addresses || []).filter(a => a.id !== parseInt(req.params.id));

  stores.users.update(req.user.id, { addresses });
  res.json({ message: 'Address deleted' });
}));

// Admin routes

// GET /api/users/admin/all - Get all users (admin)
router.get('/admin/all', authenticateToken, adminOnly, asyncHandler(async (req, res) => {
  const users = stores.users.findAll().map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  res.json({ users, total: users.length });
}));

// PUT /api/users/admin/:id/role - Update user role (admin)
router.put('/admin/:id/role', authenticateToken, adminOnly, asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['customer', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const user = stores.users.update(parseInt(req.params.id), { role });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ message: 'User role updated' });
}));

module.exports = router;
