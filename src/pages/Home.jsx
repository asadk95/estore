import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiArrowRight, FiTruck, FiShield, FiHeadphones, FiRefreshCw, FiLoader } from 'react-icons/fi';
import { ProductCard } from '../components/Product';
import { productsAPI } from '../services/api';
import './Home.css';

const categories = [
  { id: 1, name: 'Electronics', icon: '📱', count: 245, slug: 'Electronics' },
  { id: 2, name: 'Clothing', icon: '👕', count: 189, slug: 'Clothing' },
  { id: 3, name: 'Home & Living', icon: '🏠', count: 156, slug: 'Home & Living' },
  { id: 4, name: 'Sports', icon: '⚽', count: 98, slug: 'Sports' },
  { id: 5, name: 'Beauty', icon: '💄', count: 134, slug: 'Beauty' },
  { id: 6, name: 'Accessories', icon: '👜', count: 78, slug: 'Accessories' },
];

const features = [
  { icon: <FiTruck />, title: 'Free Shipping', desc: 'On orders over Rs. 2,000' },
  { icon: <FiShield />, title: 'Secure Payment', desc: '100% secure checkout' },
  { icon: <FiHeadphones />, title: '24/7 Support', desc: 'Dedicated support' },
  { icon: <FiRefreshCw />, title: 'Easy Returns', desc: '7 days return policy' },
];

const Home = () => {
  // Fetch featured products from API
  const { data, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsAPI.getFeatured(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const featuredProducts = data?.products || [];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero__content">
            <div className="hero__text">
              <span className="hero__badge">🔥 New Season Collection</span>
              <h1 className="hero__title">
                Discover Amazing
                <span className="hero__title-highlight"> Products</span>
                <br />at Best Prices
              </h1>
              <p className="hero__description">
                Shop the latest trends in electronics, fashion, home & more.
                Get exclusive deals with free delivery across Pakistan.
              </p>
              <div className="hero__buttons">
                <Link to="/products" className="btn btn-primary btn-lg">
                  Shop Now <FiArrowRight />
                </Link>
                <Link to="/deals" className="btn btn-outline btn-lg">
                  View Deals
                </Link>
              </div>
              <div className="hero__stats">
                <div className="hero__stat">
                  <span className="hero__stat-value">10K+</span>
                  <span className="hero__stat-label">Products</span>
                </div>
                <div className="hero__stat">
                  <span className="hero__stat-value">50K+</span>
                  <span className="hero__stat-label">Customers</span>
                </div>
                <div className="hero__stat">
                  <span className="hero__stat-value">100+</span>
                  <span className="hero__stat-label">Cities</span>
                </div>
              </div>
            </div>
            <div className="hero__image">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600"
                alt="Shopping"
              />
              <div className="hero__floating-card hero__floating-card--1">
                <span>🚚</span>
                <p>Fast Delivery</p>
              </div>
              <div className="hero__floating-card hero__floating-card--2">
                <span>💯</span>
                <p>Genuine Products</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="features-bar">
        <div className="container">
          <div className="features-bar__grid">
            {features.map((feature, index) => (
              <div key={index} className="features-bar__item">
                <div className="features-bar__icon">{feature.icon}</div>
                <div className="features-bar__text">
                  <h4>{feature.title}</h4>
                  <p>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section categories">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <Link to="/products" className="section-link">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="categories__grid">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="category-card"
              >
                <span className="category-card__icon">{category.icon}</span>
                <h3 className="category-card__name">{category.name}</h3>
                <p className="category-card__count">{category.count} Products</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <Link to="/products" className="section-link">
              View All <FiArrowRight />
            </Link>
          </div>

          {isLoading ? (
            <div className="products-loading">
              <FiLoader className="spinner" />
              <p>Loading products...</p>
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Banner Section */}
      <section className="banner-section">
        <div className="container">
          <div className="banner">
            <div className="banner__content">
              <span className="banner__tag">Limited Time Offer</span>
              <h2 className="banner__title">
                Up to <span>50% OFF</span>
              </h2>
              <p className="banner__text">
                On selected electronics and accessories. Hurry, offer ends soon!
              </p>
              <Link to="/deals" className="btn btn-accent btn-lg">
                Shop Now <FiArrowRight />
              </Link>
            </div>
            <div className="banner__image">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
                alt="Deals"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section newsletter-section">
        <div className="container">
          <div className="newsletter-cta">
            <div className="newsletter-cta__content">
              <h2>Get 10% Off Your First Order!</h2>
              <p>Subscribe to our newsletter for exclusive deals and updates.</p>
            </div>
            <form className="newsletter-cta__form">
              <input type="email" placeholder="Enter your email" />
              <button type="submit" className="btn btn-primary">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
