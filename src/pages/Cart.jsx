import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useCartStore from '../store/useCartStore';
import './Cart.css';

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, getSubtotal, getFormattedSubtotal } = useCartStore();

  const handleRemove = (item) => {
    removeItem(item.id);
    toast.success(`${item.name} removed from cart`);
  };

  const subtotal = getSubtotal();
  const shippingCost = subtotal >= 2000 ? 0 : 200;
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="cart-empty">
            <div className="cart-empty__icon">
              <FiShoppingBag />
            </div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <Link to="/products" className="btn btn-primary btn-lg">
              Start Shopping <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Shopping Cart</span>
        </nav>

        <h1 className="cart-page__title">Shopping Cart</h1>

        <div className="cart-page__layout">
          {/* Cart Items */}
          <div className="cart-items">
            <div className="cart-items__header">
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
              <span></span>
            </div>

            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item__product">
                  <img src={item.image} alt={item.name} className="cart-item__image" />
                  <div className="cart-item__details">
                    <Link to={`/product/${item.id}`} className="cart-item__name">
                      {item.name}
                    </Link>
                    <span className="cart-item__category">{item.category}</span>
                  </div>
                </div>

                <div className="cart-item__price">
                  Rs. {item.price.toLocaleString()}
                </div>

                <div className="cart-item__quantity">
                  <button
                    className="cart-item__qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <FiMinus />
                  </button>
                  <span className="cart-item__qty-value">{item.quantity}</span>
                  <button
                    className="cart-item__qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <FiPlus />
                  </button>
                </div>

                <div className="cart-item__total">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </div>

                <button
                  className="cart-item__remove"
                  onClick={() => handleRemove(item)}
                  title="Remove item"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}

            <div className="cart-items__footer">
              <button className="btn btn-secondary" onClick={clearCart}>
                Clear Cart
              </button>
              <Link to="/products" className="btn btn-outline">
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="cart-summary">
            <h3 className="cart-summary__title">Order Summary</h3>

            <div className="cart-summary__row">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toLocaleString()}</span>
            </div>

            <div className="cart-summary__row">
              <span>Shipping</span>
              <span className={shippingCost === 0 ? 'free' : ''}>
                {shippingCost === 0 ? 'FREE' : `Rs. ${shippingCost}`}
              </span>
            </div>

            {shippingCost > 0 && (
              <div className="cart-summary__note">
                Add Rs. {(2000 - subtotal).toLocaleString()} more for free shipping!
              </div>
            )}

            <div className="cart-summary__divider"></div>

            <div className="cart-summary__row cart-summary__total">
              <span>Total</span>
              <span>Rs. {total.toLocaleString()}</span>
            </div>

            <Link to="/checkout" className="btn btn-primary btn-lg cart-summary__checkout">
              Proceed to Checkout <FiArrowRight />
            </Link>

            <div className="cart-summary__payment-methods">
              <p>We Accept:</p>
              <div className="cart-summary__badges">
                <span>💵 COD</span>
                <span>🏦 Bank Transfer</span>
                <span>📱 JazzCash</span>
                <span>📱 Easypaisa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
