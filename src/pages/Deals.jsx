import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiZap } from 'react-icons/fi';
import { ProductCard } from '../components/Product';
import './Deals.css';

// Demo deals products
const dealProducts = [
  { id: 1, name: 'Wireless Bluetooth Headphones', price: 4500, originalPrice: 6000, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', category: 'Electronics', rating: 4.8, reviews: 124, badge: 'Hot' },
  { id: 2, name: 'Smart Watch Fitness Tracker', price: 7500, originalPrice: 10000, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', category: 'Electronics', rating: 4.5, reviews: 89 },
  { id: 5, name: 'Running Sports Shoes', price: 5500, originalPrice: 7000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', category: 'Sports', rating: 4.6, reviews: 145 },
  { id: 11, name: 'Coffee Maker Automatic', price: 8500, originalPrice: 12000, image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400', category: 'Home & Living', rating: 4.7, reviews: 156, badge: 'Hot' },
  { id: 4, name: 'Leather Crossbody Bag', price: 3500, originalPrice: 4500, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', category: 'Accessories', rating: 4.7, reviews: 78 },
  { id: 7, name: 'Organic Face Cream', price: 1800, originalPrice: 2200, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', category: 'Beauty', rating: 4.2, reviews: 67 },
  { id: 8, name: 'Portable Bluetooth Speaker', price: 3200, originalPrice: 4000, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', category: 'Electronics', rating: 4.5, reviews: 98 },
  { id: 12, name: 'Wireless Earbuds Pro', price: 6500, originalPrice: 8000, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', category: 'Electronics', rating: 4.8, reviews: 234 },
];

const Deals = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30,
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="deals-page">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Deals & Offers</span>
        </nav>

        {/* Flash Sale Banner */}
        <div className="flash-sale-banner">
          <div className="flash-sale-content">
            <div className="flash-sale-icon">
              <FiZap />
            </div>
            <div className="flash-sale-text">
              <h2>⚡ Flash Sale</h2>
              <p>Hurry up! Deals end soon</p>
            </div>
          </div>
          <div className="flash-sale-timer">
            <FiClock />
            <div className="timer-block">
              <span className="timer-value">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="timer-label">Hours</span>
            </div>
            <span className="timer-separator">:</span>
            <div className="timer-block">
              <span className="timer-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="timer-label">Mins</span>
            </div>
            <span className="timer-separator">:</span>
            <div className="timer-block">
              <span className="timer-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="timer-label">Secs</span>
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <section className="deals-section">
          <h2 className="deals-title">Today's Best Deals</h2>
          <div className="deals-grid">
            {dealProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Special Offers */}
        <section className="special-offers">
          <h2>Special Offers</h2>
          <div className="offers-grid">
            <div className="offer-card offer-card--electronics">
              <div className="offer-content">
                <span className="offer-tag">Up to 40% OFF</span>
                <h3>Electronics</h3>
                <p>Shop latest gadgets at unbeatable prices</p>
                <Link to="/category/electronics" className="btn btn-accent">Shop Now</Link>
              </div>
            </div>
            <div className="offer-card offer-card--fashion">
              <div className="offer-content">
                <span className="offer-tag">Up to 50% OFF</span>
                <h3>Fashion</h3>
                <p>Trendy styles for less</p>
                <Link to="/category/clothing" className="btn btn-primary">Shop Now</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Deals;
