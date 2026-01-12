const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Create uploads directory
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only images (jpeg, jpg, png, gif, webp) and PDF files are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  }
});

// POST /api/upload/image - Upload single image
router.post('/image', authenticateToken, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    message: 'File uploaded successfully',
    file: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      url: fileUrl,
      size: req.file.size,
    }
  });
}));

// POST /api/upload/images - Upload multiple images
router.post('/images', authenticateToken, upload.array('images', 5), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const files = req.files.map(file => ({
    filename: file.filename,
    originalname: file.originalname,
    url: `/uploads/${file.filename}`,
    size: file.size,
  }));

  res.json({
    message: `${files.length} files uploaded successfully`,
    files,
  });
}));

// POST /api/upload/payment-proof - Upload payment proof
router.post('/payment-proof', authenticateToken, upload.single('proof'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    message: 'Payment proof uploaded successfully',
    proofUrl: fileUrl,
  });
}));

// DELETE /api/upload/:filename - Delete uploaded file
router.delete('/:filename', authenticateToken, asyncHandler(async (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  fs.unlinkSync(filePath);
  res.json({ message: 'File deleted successfully' });
}));

module.exports = router;
