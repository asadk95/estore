const express = require('express');
const { stores } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Helper to get/create cart for user
const getOrCreateCart = (userId) => {
  let cart = stores.carts.findBy('userId', userId);
  if (!cart) {
    cart = stores.carts.create({ userId, items: [] });
  }
  return cart;
};

// GET /api/cart - Get user's cart
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const cart = getOrCreateCart(req.user.id);

  // Enrich cart items with product details
  const enrichedItems = cart.items.map(item => {
    const product = stores.products.findById(item.productId);
    return {
      ...item,
      product: product ? {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
      } : null
    };
  }).filter(item => item.product !== null);

  // Calculate totals
  const subtotal = enrichedItems.reduce((sum, item) =>
    sum + (item.product.price * item.quantity), 0
  );
  const shipping = subtotal >= 2000 ? 0 : 200;
  const total = subtotal + shipping;

  res.json({
    cart: {
      id: cart.id,
      items: enrichedItems,
      itemCount: enrichedItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      shipping,
      total,
    }
  });
}));

// POST /api/cart/add - Add item to cart
router.post('/add', authenticateToken, asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  // Check if product exists
  const product = stores.products.findById(parseInt(productId));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Check stock
  if (product.stock < quantity) {
    return res.status(400).json({ error: 'Insufficient stock' });
  }

  const cart = getOrCreateCart(req.user.id);

  // Check if item already in cart
  const existingIndex = cart.items.findIndex(item => item.productId === parseInt(productId));

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += quantity;
  } else {
    cart.items.push({
      productId: parseInt(productId),
      quantity,
      addedAt: new Date().toISOString(),
    });
  }

  stores.carts.update(cart.id, { items: cart.items });

  res.json({ message: 'Item added to cart', itemCount: cart.items.length });
}));

// PUT /api/cart/update/:productId - Update item quantity
router.put('/update/:productId', authenticateToken, asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const productId = parseInt(req.params.productId);

  if (quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1' });
  }

  const cart = getOrCreateCart(req.user.id);
  const itemIndex = cart.items.findIndex(item => item.productId === productId);

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not in cart' });
  }

  // Check stock
  const product = stores.products.findById(productId);
  if (product && product.stock < quantity) {
    return res.status(400).json({ error: 'Insufficient stock' });
  }

  cart.items[itemIndex].quantity = quantity;
  stores.carts.update(cart.id, { items: cart.items });

  res.json({ message: 'Cart updated' });
}));

// DELETE /api/cart/remove/:productId - Remove item from cart
router.delete('/remove/:productId', authenticateToken, asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.productId);
  const cart = getOrCreateCart(req.user.id);

  cart.items = cart.items.filter(item => item.productId !== productId);
  stores.carts.update(cart.id, { items: cart.items });

  res.json({ message: 'Item removed from cart' });
}));

// DELETE /api/cart/clear - Clear cart
router.delete('/clear', authenticateToken, asyncHandler(async (req, res) => {
  const cart = getOrCreateCart(req.user.id);
  stores.carts.update(cart.id, { items: [] });

  res.json({ message: 'Cart cleared' });
}));

module.exports = router;
