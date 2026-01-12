import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiHeart, FiShoppingCart, FiMinus, FiPlus, FiStar, FiTruck, FiShield, FiRefreshCw, FiShare2, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useCartStore from '../store/useCartStore';
import { ProductCard } from '../components/Product';
import { productsAPI } from '../services/api';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCartStore();

  // Fetch product from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsAPI.getById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const product = data?.product;
  const relatedProducts = data?.relatedProducts || [];

  // Handle loading state
  if (isLoading) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="product-loading">
            <FiLoader className="spinner" />
            <p>Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !product) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="product-error">
            <h2>Product Not Found</h2>
            <p>Sorry, we couldn't find this product.</p>
            <Link to="/products" className="btn btn-primary">Browse Products</Link>
          </div>
        </div>
      </div>
    );
  }

  // Use image array or single image
  const images = product.images || [product.image];

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const inStock = product.stock > 0;
  const stockCount = product.stock || 0;

  const handleAddToCart = () => {
    addItem({ ...product, image: images[0] }, quantity);
    toast.success(`${quantity} × ${product.name} added to cart!`, { icon: '🛒' });
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!', {
      icon: isWishlisted ? '💔' : '❤️',
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`star ${i < Math.floor(rating) ? 'filled' : ''}`}
      />
    ));
  };

  return (
    <div className="product-detail">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`}>{product.category}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="product-detail__main">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="product-gallery__main">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="product-gallery__image"
              />
              {discount > 0 && (
                <span className="product-gallery__badge">-{discount}%</span>
              )}
              {product.badge && (
                <span className="product-gallery__tag">{product.badge}</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="product-gallery__thumbs">
                {images.map((img, index) => (
                  <button
                    key={index}
                    className={`product-gallery__thumb ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <span className="product-info__category">{product.category}</span>
            <h1 className="product-info__name">{product.name}</h1>

            <div className="product-info__rating">
              <div className="stars">{renderStars(product.rating || 0)}</div>
              <span className="rating-value">{product.rating || 0}</span>
              <span className="reviews-count">({product.reviews || 0} reviews)</span>
            </div>

            <div className="product-info__price">
              <span className="current-price">Rs. {product.price?.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="original-price">Rs. {product.originalPrice?.toLocaleString()}</span>
              )}
              {discount > 0 && (
                <span className="discount-badge">Save {discount}%</span>
              )}
            </div>

            <p className="product-info__description">{product.description || 'No description available.'}</p>

            {/* Stock Status */}
            <div className="product-info__stock">
              {inStock ? (
                <span className="in-stock">✅ In Stock ({stockCount} available)</span>
              ) : (
                <span className="out-of-stock">❌ Out of Stock</span>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="product-info__actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <FiMinus />
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(stockCount, quantity + 1))}>
                  <FiPlus />
                </button>
              </div>

              <button
                className="btn btn-primary btn-lg add-to-cart"
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                <FiShoppingCart /> Add to Cart
              </button>

              <button
                className={`btn-wishlist ${isWishlisted ? 'active' : ''}`}
                onClick={handleWishlist}
              >
                <FiHeart />
              </button>

              <button className="btn-share">
                <FiShare2 />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="product-info__badges">
              <div className="badge-item">
                <FiTruck />
                <span>Free Shipping on Rs. 2000+</span>
              </div>
              <div className="badge-item">
                <FiShield />
                <span>1 Year Warranty</span>
              </div>
              <div className="badge-item">
                <FiRefreshCw />
                <span>7 Days Return</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="product-tabs">
          <div className="product-tabs__nav">
            <button
              className={activeTab === 'description' ? 'active' : ''}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={activeTab === 'features' ? 'active' : ''}
              onClick={() => setActiveTab('features')}
            >
              Features
            </button>
            <button
              className={activeTab === 'specifications' ? 'active' : ''}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button
              className={activeTab === 'reviews' ? 'active' : ''}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({product.reviews || 0})
            </button>
          </div>

          <div className="product-tabs__content">
            {activeTab === 'description' && (
              <div className="tab-content">
                <p>{product.description || 'No description available.'}</p>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="tab-content">
                {product.features ? (
                  <ul className="features-list">
                    {product.features.map((feature, i) => (
                      <li key={i}>✓ {feature}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No features listed for this product.</p>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="tab-content">
                {product.specifications ? (
                  <table className="specs-table">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <tr key={key}>
                          <td>{key}</td>
                          <td>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No specifications available.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="tab-content">
                <p className="coming-soon">Customer reviews coming soon!</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="related-products">
            <h2>Related Products</h2>
            <div className="related-products__grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
