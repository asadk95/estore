import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiSearch, FiUser, FiMenu, FiX, FiHeart, FiMoon, FiSun } from 'react-icons/fi';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  const navigate = useNavigate();
  const { getTotalItems } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const cartCount = getTotalItems();

  // Apply theme on mount and when isDarkMode changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const categories = [
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Clothing', slug: 'clothing' },
    { name: 'Home & Living', slug: 'home-living' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Beauty', slug: 'beauty' },
  ];

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      {/* Top Bar */}
      <div className="header__topbar">
        <div className="container">
          <p>🚚 Free Delivery on orders above Rs. 2,000</p>
          <div className="header__topbar-links">
            <Link to="/track-order">Track Order</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="header__main">
        <div className="container header__container">
          {/* Logo */}
          <Link to="/" className="header__logo">
            <span className="header__logo-icon">🛒</span>
            <span className="header__logo-text">E-Store</span>
          </Link>

          {/* Search Bar */}
          <form className="header__search" onSubmit={handleSearch}>
            <FiSearch className="header__search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="header__search-input"
            />
            <button type="submit" className="header__search-btn">
              Search
            </button>
          </form>

          {/* Actions */}
          <div className="header__actions">
            <button
              className="header__action-btn"
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? <FiSun /> : <FiMoon />}
            </button>

            <Link to="/wishlist" className="header__action-btn" title="Wishlist">
              <FiHeart />
            </Link>

            <Link to="/cart" className="header__action-btn header__cart-btn" title="Cart">
              <FiShoppingCart />
              {cartCount > 0 && (
                <span className="header__cart-count">{cartCount}</span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="header__user-menu">
                <button className="header__action-btn header__user-btn">
                  <FiUser />
                  <span className="header__user-name">{user?.name?.split(' ')[0]}</span>
                </button>
                <div className="header__dropdown">
                  <Link to="/account">My Account</Link>
                  <Link to="/orders">My Orders</Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin">Admin Panel</Link>
                  )}
                  <button onClick={logout}>Logout</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                Login
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="header__menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>

      {/* Categories Navigation */}
      <nav className={`header__nav ${isMenuOpen ? 'header__nav--open' : ''}`}>
        <div className="container">
          <ul className="header__nav-list">
            <li>
              <Link to="/" className="header__nav-link">Home</Link>
            </li>
            <li>
              <Link to="/products" className="header__nav-link">All Products</Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link to={`/category/${cat.slug}`} className="header__nav-link">
                  {cat.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/deals" className="header__nav-link header__nav-link--highlight">
                🔥 Deals
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
