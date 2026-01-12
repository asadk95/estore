-- ========================================
-- E-Store MySQL Database Schema
-- ========================================
-- Run this SQL in phpMyAdmin to create
-- all required tables for E-Store
-- ========================================

-- Disable foreign key checks during setup
SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ========================================
-- DROP EXISTING TABLES (in correct order)
-- ========================================
DROP TABLE IF EXISTS `carts`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `users`;

-- ========================================
-- USERS TABLE
-- ========================================
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `status` enum('active','suspended') DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- PRODUCTS TABLE
-- ========================================
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `price` int(11) NOT NULL,
  `original_price` int(11) DEFAULT NULL,
  `category` varchar(50) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `description` text,
  `rating` decimal(2,1) DEFAULT 0.0,
  `reviews` int(11) DEFAULT 0,
  `stock` int(11) DEFAULT 0,
  `badge` varchar(20) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- ORDERS TABLE
-- ========================================
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `items` text NOT NULL,
  `shipping_address` text NOT NULL,
  `payment_method` varchar(20) NOT NULL,
  `subtotal` int(11) NOT NULL,
  `shipping` int(11) DEFAULT 0,
  `processing_fee` int(11) DEFAULT 0,
  `total` int(11) NOT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `payment_status` varchar(30) DEFAULT 'pending',
  `notes` text,
  `timeline` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- CARTS TABLE
-- ========================================
CREATE TABLE `carts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `items` text NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- SAMPLE DATA - PRODUCTS
-- ========================================
INSERT INTO `products` (`name`, `price`, `original_price`, `category`, `image`, `description`, `rating`, `reviews`, `stock`, `badge`) VALUES
('Wireless Bluetooth Headphones', 4500, 6000, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 'Premium wireless headphones with noise cancellation', 4.8, 124, 15, 'Hot'),
('Smart Watch Fitness Tracker', 7500, 10000, 'Electronics', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 'Track your fitness with style', 4.5, 89, 10, 'New'),
('Premium Cotton T-Shirt', 1200, NULL, 'Clothing', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'Comfortable cotton t-shirt', 4.3, 56, 50, NULL),
('Leather Crossbody Bag', 3500, 4500, 'Accessories', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', 'Stylish leather bag for everyday use', 4.7, 78, 20, NULL),
('Running Sports Shoes', 5500, 7000, 'Sports', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'Lightweight running shoes', 4.6, 145, 30, 'Hot'),
('Minimalist Desk Lamp', 2500, NULL, 'Home & Living', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', 'Modern LED desk lamp', 4.4, 34, 25, 'New'),
('Organic Face Cream', 1800, 2200, 'Beauty', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', 'Natural skincare cream', 4.2, 67, 40, NULL),
('Portable Bluetooth Speaker', 3200, 4000, 'Electronics', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', 'Waterproof portable speaker', 4.5, 98, 35, NULL);

-- ========================================
-- SAMPLE DATA - ADMIN USER
-- Password: admin123 (hashed with bcrypt)
-- ========================================
INSERT INTO `users` (`name`, `email`, `phone`, `password`, `role`, `status`) VALUES
('Admin', 'admin@estore.pk', '0300-0000000', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOe6E1XVtVXpv9WJH2v9VoJZqDlSqIaGy', 'admin', 'active');

-- ========================================
-- DONE!
-- ========================================
