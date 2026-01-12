const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// For development without MySQL, we'll use a JSON file store
const DATA_DIR = path.join(__dirname, '..', 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const CARTS_FILE = path.join(DATA_DIR, 'carts.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize JSON files if they don't exist
const initFile = (filePath, defaultData) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

// Default products for demo
const defaultProducts = [
  { id: 1, name: 'Wireless Bluetooth Headphones', price: 4500, originalPrice: 6000, category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', rating: 4.8, reviews: 124, badge: 'Hot', description: 'Premium wireless headphones with noise cancellation', stock: 15, createdAt: new Date().toISOString() },
  { id: 2, name: 'Smart Watch Fitness Tracker', price: 7500, originalPrice: 10000, category: 'Electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', rating: 4.5, reviews: 89, badge: 'New', description: 'Track your fitness with style', stock: 10, createdAt: new Date().toISOString() },
  { id: 3, name: 'Premium Cotton T-Shirt', price: 1200, originalPrice: null, category: 'Clothing', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', rating: 4.3, reviews: 56, description: 'Comfortable cotton t-shirt', stock: 50, createdAt: new Date().toISOString() },
  { id: 4, name: 'Leather Crossbody Bag', price: 3500, originalPrice: 4500, category: 'Accessories', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', rating: 4.7, reviews: 78, description: 'Stylish leather bag for everyday use', stock: 20, createdAt: new Date().toISOString() },
  { id: 5, name: 'Running Sports Shoes', price: 5500, originalPrice: 7000, category: 'Sports', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', rating: 4.6, reviews: 145, badge: 'Hot', description: 'Lightweight running shoes', stock: 30, createdAt: new Date().toISOString() },
  { id: 6, name: 'Minimalist Desk Lamp', price: 2500, originalPrice: null, category: 'Home & Living', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', rating: 4.4, reviews: 34, badge: 'New', description: 'Modern LED desk lamp', stock: 25, createdAt: new Date().toISOString() },
  { id: 7, name: 'Organic Face Cream', price: 1800, originalPrice: 2200, category: 'Beauty', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', rating: 4.2, reviews: 67, description: 'Natural skincare cream', stock: 40, createdAt: new Date().toISOString() },
  { id: 8, name: 'Portable Bluetooth Speaker', price: 3200, originalPrice: 4000, category: 'Electronics', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', rating: 4.5, reviews: 98, description: 'Waterproof portable speaker', stock: 35, createdAt: new Date().toISOString() },
];

initFile(PRODUCTS_FILE, defaultProducts);
initFile(USERS_FILE, []);
initFile(ORDERS_FILE, []);
initFile(CARTS_FILE, []);

// JSON File Store (Development mode)
class JsonStore {
  constructor(filePath) {
    this.filePath = filePath;
  }

  read() {
    const data = fs.readFileSync(this.filePath, 'utf8');
    return JSON.parse(data);
  }

  write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  findAll() {
    return this.read();
  }

  findById(id) {
    const data = this.read();
    return data.find(item => item.id === id);
  }

  findBy(field, value) {
    const data = this.read();
    return data.find(item => item[field] === value);
  }

  filter(predicate) {
    const data = this.read();
    return data.filter(predicate);
  }

  create(item) {
    const data = this.read();
    const newId = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
    const newItem = { id: newId, ...item, createdAt: new Date().toISOString() };
    data.push(newItem);
    this.write(data);
    return newItem;
  }

  update(id, updates) {
    const data = this.read();
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return null;
    data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
    this.write(data);
    return data[index];
  }

  delete(id) {
    const data = this.read();
    const filtered = data.filter(item => item.id !== id);
    if (filtered.length === data.length) return false;
    this.write(filtered);
    return true;
  }
}

// Export stores
const stores = {
  products: new JsonStore(PRODUCTS_FILE),
  users: new JsonStore(USERS_FILE),
  orders: new JsonStore(ORDERS_FILE),
  carts: new JsonStore(CARTS_FILE),
};

// MySQL connection pool (for production)
let pool = null;

const initMySQLPool = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    });
    console.log('✅ MySQL connection pool created');
    return pool;
  } catch (error) {
    console.log('⚠️ MySQL not available, using JSON file store');
    return null;
  }
};

module.exports = { stores, initMySQLPool, pool };
