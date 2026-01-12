const express = require('express');
const { stores } = require('../config/database');
const { authenticateToken, adminOnly, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// GET /api/products - Get all products with filtering
router.get('/', asyncHandler(async (req, res) => {
  let products = stores.products.findAll();

  // Filter by category
  if (req.query.category) {
    products = products.filter(p =>
      p.category.toLowerCase() === req.query.category.toLowerCase()
    );
  }

  // Filter by search query
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search) ||
      (p.description && p.description.toLowerCase().includes(search))
    );
  }

  // Filter by price range
  if (req.query.minPrice) {
    products = products.filter(p => p.price >= parseInt(req.query.minPrice));
  }
  if (req.query.maxPrice) {
    products = products.filter(p => p.price <= parseInt(req.query.maxPrice));
  }

  // Filter by badge (Hot, New, Sale)
  if (req.query.badge) {
    products = products.filter(p => p.badge === req.query.badge);
  }

  // Sort
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  products.sort((a, b) => {
    if (sortBy === 'price') return (a.price - b.price) * sortOrder;
    if (sortBy === 'rating') return (b.rating - a.rating) * sortOrder;
    if (sortBy === 'name') return a.name.localeCompare(b.name) * sortOrder;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedProducts = products.slice(startIndex, endIndex);

  res.json({
    products: paginatedProducts,
    pagination: {
      page,
      limit,
      total: products.length,
      totalPages: Math.ceil(products.length / limit),
    }
  });
}));

// GET /api/products/featured - Get featured/hot products
router.get('/featured', asyncHandler(async (req, res) => {
  const products = stores.products.filter(p => p.badge === 'Hot' || p.badge === 'New');
  res.json({ products: products.slice(0, 8) });
}));

// GET /api/products/categories - Get all categories
router.get('/categories', asyncHandler(async (req, res) => {
  const products = stores.products.findAll();
  const categories = [...new Set(products.map(p => p.category))];

  const categoryStats = categories.map(cat => ({
    name: cat,
    count: products.filter(p => p.category === cat).length,
  }));

  res.json({ categories: categoryStats });
}));

// GET /api/products/:id - Get single product
router.get('/:id', asyncHandler(async (req, res) => {
  const product = stores.products.findById(parseInt(req.params.id));

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Get related products (same category)
  const related = stores.products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  res.json({ product, relatedProducts: related });
}));

// POST /api/products - Create product (admin only)
router.post('/', authenticateToken, adminOnly, asyncHandler(async (req, res) => {
  const { name, price, originalPrice, category, image, description, stock, badge } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }

  const product = stores.products.create({
    name,
    price,
    originalPrice: originalPrice || null,
    category,
    image: image || 'https://via.placeholder.com/400',
    description: description || '',
    stock: stock || 0,
    badge: badge || null,
    rating: 0,
    reviews: 0,
  });

  res.status(201).json({ message: 'Product created', product });
}));

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', authenticateToken, adminOnly, asyncHandler(async (req, res) => {
  const product = stores.products.update(parseInt(req.params.id), req.body);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json({ message: 'Product updated', product });
}));

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', authenticateToken, adminOnly, asyncHandler(async (req, res) => {
  const deleted = stores.products.delete(parseInt(req.params.id));

  if (!deleted) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json({ message: 'Product deleted' });
}));

module.exports = router;
