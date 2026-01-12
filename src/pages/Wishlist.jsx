import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useCartStore from '../store/useCartStore';
import './Wishlist.css';

// Demo wishlist items - in real app, this would come from store/API
const demoWishlistItems = [
  {
    id: 2,
    name: 'Smart Watch Fitness Tracker',
    price: 7500,
    originalPrice: 10000,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    category: 'Electronics',
    inStock: true,
  },
  {
    id: 5,
    name: 'Running Sports Shoes',
    price: 5500,
    originalPrice: 7000,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    category: 'Sports',
    inStock: true,
  },
  {
    id: 11,
    name: 'Coffee Maker Automatic',
    price: 8500,
    originalPrice: 12000,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400',
    category: 'Home & Living',
    inStock: false,
  },
];

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState(demoWishlistItems);
  const { addItem } = useCartStore();

  const handleRemove = (item) => {
    setWishlistItems(wishlistItems.filter(i => i.id !== item.id));
    toast.success(`${item.name} removed from wishlist`);
  };

  const handleAddToCart = (item) => {
    if (!item.inStock) {
      toast.error('This item is out of stock');
      return;
    }
    addItem(item);
    toast.success(`${item.name} added to cart!`, { icon: '🛒' });
  };

  const handleMoveAllToCart = () => {
    const inStockItems = wishlistItems.filter(item => item.inStock);
    if (inStockItems.length === 0) {
      toast.error('No in-stock items to add');
      return;
    }
    inStockItems.forEach(item => addItem(item));
    toast.success(`${inStockItems.length} items added to cart!`, { icon: '🛒' });
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <div className="wishlist-empty">
            <div className="wishlist-empty__icon">
              <FiHeart />
            </div>
            <h2>Your wishlist is empty</h2>
            <p>Start adding items you love to your wishlist</p>
            <Link to="/products" className="btn btn-primary btn-lg">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Wishlist</span>
        </nav>

        <div className="wishlist-header">
          <h1>My Wishlist ({wishlistItems.length} items)</h1>
          <button className="btn btn-primary" onClick={handleMoveAllToCart}>
            <FiShoppingCart /> Add All to Cart
          </button>
        </div>

        <div className="wishlist-grid">
          {wishlistItems.map((item) => (
            <div key={item.id} className="wishlist-item">
              <Link to={`/product/${item.id}`} className="wishlist-item__image">
                <img src={item.image} alt={item.name} />
                {!item.inStock && (
                  <span className="wishlist-item__badge">Out of Stock</span>
                )}
              </Link>

              <div className="wishlist-item__info">
                <span className="wishlist-item__category">{item.category}</span>
                <Link to={`/product/${item.id}`} className="wishlist-item__name">
                  {item.name}
                </Link>
                <div className="wishlist-item__price">
                  <span className="current">Rs. {item.price.toLocaleString()}</span>
                  {item.originalPrice && (
                    <span className="original">Rs. {item.originalPrice.toLocaleString()}</span>
                  )}
                </div>
              </div>

              <div className="wishlist-item__actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleAddToCart(item)}
                  disabled={!item.inStock}
                >
                  <FiShoppingCart /> {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <button
                  className="btn-remove"
                  onClick={() => handleRemove(item)}
                  title="Remove from wishlist"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
