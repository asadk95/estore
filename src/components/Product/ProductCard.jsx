import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiEye, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useCartStore from '../../store/useCartStore';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCartStore();

  const {
    id,
    name,
    price,
    originalPrice,
    image,
    category,
    rating = 4.5,
    reviews = 0,
    badge,
    inStock = true,
  } = product;

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock) {
      toast.error('This product is out of stock');
      return;
    }

    addItem(product);
    toast.success(`${name} added to cart!`, {
      icon: '🛒',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(
      isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!',
      { icon: isWishlisted ? '💔' : '❤️' }
    );
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`product-card__star ${i < Math.floor(rating) ? 'filled' : ''}`}
      />
    ));
  };

  return (
    <Link
      to={`/product/${id}`}
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="product-card__image-container">
        <img
          src={image || '/placeholder-product.jpg'}
          alt={name}
          className="product-card__image"
          loading="lazy"
        />

        {/* Badges */}
        <div className="product-card__badges">
          {badge && (
            <span className={`product-card__badge product-card__badge--${badge.toLowerCase()}`}>
              {badge}
            </span>
          )}
          {discount > 0 && (
            <span className="product-card__badge product-card__badge--sale">
              -{discount}%
            </span>
          )}
          {!inStock && (
            <span className="product-card__badge product-card__badge--out">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className={`product-card__actions ${isHovered ? 'visible' : ''}`}>
          <button
            className={`product-card__action-btn ${isWishlisted ? 'active' : ''}`}
            onClick={handleWishlist}
            title="Add to Wishlist"
          >
            <FiHeart />
          </button>
          <button
            className="product-card__action-btn"
            title="Quick View"
          >
            <FiEye />
          </button>
          <button
            className="product-card__action-btn product-card__action-btn--cart"
            onClick={handleAddToCart}
            disabled={!inStock}
            title="Add to Cart"
          >
            <FiShoppingCart />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="product-card__info">
        <span className="product-card__category">{category}</span>
        <h3 className="product-card__name">{name}</h3>

        {/* Rating */}
        <div className="product-card__rating">
          <div className="product-card__stars">{renderStars()}</div>
          <span className="product-card__rating-text">
            {rating} ({reviews} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="product-card__price-container">
          <span className="product-card__price">Rs. {price.toLocaleString()}</span>
          {originalPrice && (
            <span className="product-card__original-price">
              Rs. {originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
