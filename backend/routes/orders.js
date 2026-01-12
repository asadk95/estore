const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { stores } = require('../config/database');
const { authenticateToken, adminOnly } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Payment method configs for Pakistan
const paymentMethods = {
  cod: { name: 'Cash on Delivery', processingFee: 0 },
  bank: {
    name: 'Bank Transfer', processingFee: 0, bankDetails: {
      bankName: 'Allied Bank',
      accountTitle: 'E-Store Pakistan',
      accountNumber: 'XXXX-XXXX-XXXX',
      iban: 'PK00ABCD1234567890',
    }
  },
  jazzcash: { name: 'JazzCash', processingFee: 50 },
  easypaisa: { name: 'Easypaisa', processingFee: 50 },
};

// GET /api/orders - Get user's orders
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  let orders = stores.orders.filter(o => o.userId === req.user.id);

  // Filter by status
  if (req.query.status) {
    orders = orders.filter(o => o.status === req.query.status);
  }

  // Sort by date (newest first)
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ orders });
}));

// GET /api/orders/:id - Get single order
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const order = stores.orders.findById(parseInt(req.params.id));

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Check ownership (or admin)
  if (order.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json({ order });
}));

// POST /api/orders - Create new order
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const {
    shippingAddress,
    paymentMethod,
    items,
    notes
  } = req.body;

  // Validate shipping address
  if (!shippingAddress || !shippingAddress.name || !shippingAddress.address || !shippingAddress.city || !shippingAddress.phone) {
    return res.status(400).json({ error: 'Complete shipping address is required' });
  }

  // Validate payment method
  if (!paymentMethod || !paymentMethods[paymentMethod]) {
    return res.status(400).json({ error: 'Valid payment method is required (cod, bank, jazzcash, easypaisa)' });
  }

  // Get items from cart if not provided
  let orderItems = items;
  if (!orderItems || orderItems.length === 0) {
    const cart = stores.carts.findBy('userId', req.user.id);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    orderItems = cart.items;
  }

  // Enrich items and calculate totals
  const enrichedItems = [];
  let subtotal = 0;

  for (const item of orderItems) {
    const product = stores.products.findById(item.productId);
    if (!product) {
      return res.status(400).json({ error: `Product ${item.productId} not found` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
    }

    enrichedItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.image,
    });
    subtotal += product.price * item.quantity;

    // Reduce stock
    stores.products.update(product.id, { stock: product.stock - item.quantity });
  }

  const shipping = subtotal >= 2000 ? 0 : 200;
  const processingFee = paymentMethods[paymentMethod].processingFee;
  const total = subtotal + shipping + processingFee;

  // Create order
  const order = stores.orders.create({
    orderId: `ORD-${Date.now()}`,
    userId: req.user.id,
    items: enrichedItems,
    shippingAddress,
    paymentMethod,
    paymentDetails: paymentMethods[paymentMethod],
    subtotal,
    shipping,
    processingFee,
    total,
    status: 'pending',
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'awaiting_payment',
    notes: notes || '',
    timeline: [
      { status: 'pending', timestamp: new Date().toISOString(), note: 'Order placed' }
    ],
  });

  // Clear cart after order
  const cart = stores.carts.findBy('userId', req.user.id);
  if (cart) {
    stores.carts.update(cart.id, { items: [] });
  }

  res.status(201).json({
    message: 'Order placed successfully',
    order,
    ...(paymentMethod === 'bank' && { bankDetails: paymentMethods.bank.bankDetails })
  });
}));

// PUT /api/orders/:id/status - Update order status (admin)
router.put('/:id/status', authenticateToken, adminOnly, asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const order = stores.orders.findById(parseInt(req.params.id));
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Add to timeline
  order.timeline.push({
    status,
    timestamp: new Date().toISOString(),
    note: note || `Status changed to ${status}`,
  });

  stores.orders.update(order.id, {
    status,
    timeline: order.timeline,
    ...(status === 'delivered' && { paymentStatus: 'paid' })
  });

  res.json({ message: 'Order status updated', order: stores.orders.findById(order.id) });
}));

// PUT /api/orders/:id/payment - Confirm payment (for bank transfers)
router.put('/:id/payment', authenticateToken, asyncHandler(async (req, res) => {
  const { transactionId, paymentProof } = req.body;

  const order = stores.orders.findById(parseInt(req.params.id));
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  stores.orders.update(order.id, {
    paymentStatus: 'pending_verification',
    transactionId,
    paymentProof,
  });

  res.json({ message: 'Payment proof submitted, pending verification' });
}));

// DELETE /api/orders/:id - Cancel order
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const order = stores.orders.findById(parseInt(req.params.id));

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (!['pending', 'confirmed'].includes(order.status)) {
    return res.status(400).json({ error: 'Cannot cancel order in current status' });
  }

  // Restore stock
  for (const item of order.items) {
    const product = stores.products.findById(item.productId);
    if (product) {
      stores.products.update(product.id, { stock: product.stock + item.quantity });
    }
  }

  order.timeline.push({
    status: 'cancelled',
    timestamp: new Date().toISOString(),
    note: 'Order cancelled by user',
  });

  stores.orders.update(order.id, { status: 'cancelled', timeline: order.timeline });

  res.json({ message: 'Order cancelled' });
}));

// GET /api/orders/admin/all - Get all orders (admin)
router.get('/admin/all', authenticateToken, adminOnly, asyncHandler(async (req, res) => {
  let orders = stores.orders.findAll();

  // Filter by status
  if (req.query.status) {
    orders = orders.filter(o => o.status === req.query.status);
  }

  // Sort by date
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    orders, stats: {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
    }
  });
}));

module.exports = router;
