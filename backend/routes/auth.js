const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { stores } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').matches(/^03[0-9]{2}-?[0-9]{7}$/).withMessage('Valid Pakistani phone number required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// POST /api/auth/register
router.post('/register', registerValidation, asyncHandler(async (req, res) => {
  // Check validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, password } = req.body;

  // Check if user exists
  const existingUser = stores.users.findBy('email', email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = stores.users.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role: 'customer',
  });

  // Generate token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  res.status(201).json({
    message: 'Registration successful',
    user: userWithoutPassword,
    token,
  });
}));

// POST /api/auth/login
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  // Find user
  const user = stores.users.findBy('email', email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Generate token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  res.json({
    message: 'Login successful',
    user: userWithoutPassword,
    token,
  });
}));

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = stores.users.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
}));

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req, res) => {
  // For JWT, logout is typically handled client-side by removing the token
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
