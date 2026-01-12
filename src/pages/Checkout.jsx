import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiCheck, FiCreditCard, FiHome, FiTruck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import { ordersAPI } from '../services/api';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: '',
      city: '',
      postalCode: '',
    }
  });

  const subtotal = getSubtotal();
  const shippingCost = subtotal >= 2000 ? 0 : 200;
  const total = subtotal + shippingCost;

  const paymentMethods = [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: '💵',
      description: 'Pay when you receive your order',
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: '🏦',
      description: 'Transfer to our bank account',
    },
    {
      id: 'jazzcash',
      name: 'JazzCash',
      icon: '📱',
      description: 'Pay via JazzCash mobile wallet',
    },
    {
      id: 'easypaisa',
      name: 'Easypaisa',
      icon: '📱',
      description: 'Pay via Easypaisa mobile wallet',
    },
  ];

  const onSubmit = async (data) => {
    // Check if user is logged in
    if (!isAuthenticated) {
      toast.error('Please login to place your order');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    setIsProcessing(true);

    try {
      // Create order via API
      const orderData = {
        shippingAddress: {
          name: data.name,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
        },
        paymentMethod,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        notes: data.notes || '',
      };

      const response = await ordersAPI.create(orderData);

      toast.success(`Order ${response.order.orderId} placed successfully!`);
      clearCart();

      // Show bank details if bank transfer selected
      if (paymentMethod === 'bank' && response.bankDetails) {
        toast(
          `Please transfer Rs. ${total.toLocaleString()} to account: ${response.bankDetails.accountNumber}`,
          { duration: 10000, icon: '🏦' }
        );
      }

      // Navigate to orders page
      navigate('/orders', {
        state: {
          orderPlaced: true,
          orderId: response.order.id,
        }
      });

    } catch (error) {
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="checkout-empty">
            <h2>Your cart is empty</h2>
            <p>Add items to your cart before checkout</p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/cart">Cart</Link>
          <span>/</span>
          <span>Checkout</span>
        </nav>

        <h1 className="checkout-page__title">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="checkout-page__layout">
          {/* Checkout Form */}
          <div className="checkout-form">
            {/* Shipping Information */}
            <section className="checkout-section">
              <div className="checkout-section__header">
                <FiHome />
                <h2>Shipping Information</h2>
              </div>

              <div className="checkout-form__grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="Your full name"
                  />
                  {errors.name && <span className="form-error">{errors.name.message}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <span className="form-error">{errors.email.message}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    {...register('phone', { required: 'Phone is required' })}
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="03XX-XXXXXXX"
                  />
                  {errors.phone && <span className="form-error">{errors.phone.message}</span>}
                </div>

                <div className="form-group form-group--full">
                  <label className="form-label">Address *</label>
                  <input
                    {...register('address', { required: 'Address is required' })}
                    className={`form-input ${errors.address ? 'error' : ''}`}
                    placeholder="Street address, house number"
                  />
                  {errors.address && <span className="form-error">{errors.address.message}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">City *</label>
                  <select
                    {...register('city', { required: 'City is required' })}
                    className={`form-input ${errors.city ? 'error' : ''}`}
                  >
                    <option value="">Select city</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Multan">Multan</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Quetta">Quetta</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.city && <span className="form-error">{errors.city.message}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Postal Code</label>
                  <input
                    {...register('postalCode')}
                    className="form-input"
                    placeholder="54000"
                  />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="checkout-section">
              <div className="checkout-section__header">
                <FiCreditCard />
                <h2>Payment Method</h2>
              </div>

              <div className="payment-methods">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`payment-method ${paymentMethod === method.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                    />
                    <span className="payment-method__icon">{method.icon}</span>
                    <div className="payment-method__info">
                      <span className="payment-method__name">{method.name}</span>
                      <span className="payment-method__desc">{method.description}</span>
                    </div>
                    <span className="payment-method__check">
                      <FiCheck />
                    </span>
                  </label>
                ))}
              </div>

              {paymentMethod === 'bank' && (
                <div className="payment-info">
                  <h4>Bank Transfer Details</h4>
                  <p>Bank: <strong>HBL Bank</strong></p>
                  <p>Account Title: <strong>E-Store PVT LTD</strong></p>
                  <p>Account Number: <strong>0123456789012</strong></p>
                  <p className="payment-info__note">
                    Please transfer the total amount and upload receipt after placing order.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Order Summary */}
          <div className="checkout-summary">
            <h3 className="checkout-summary__title">Order Summary</h3>

            <div className="checkout-summary__items">
              {items.map((item) => (
                <div key={item.id} className="checkout-summary__item">
                  <img src={item.image} alt={item.name} />
                  <div className="checkout-summary__item-info">
                    <span className="checkout-summary__item-name">{item.name}</span>
                    <span className="checkout-summary__item-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="checkout-summary__item-price">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="checkout-summary__divider"></div>

            <div className="checkout-summary__row">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toLocaleString()}</span>
            </div>

            <div className="checkout-summary__row">
              <span>Shipping</span>
              <span className={shippingCost === 0 ? 'free' : ''}>
                {shippingCost === 0 ? 'FREE' : `Rs. ${shippingCost}`}
              </span>
            </div>

            <div className="checkout-summary__divider"></div>

            <div className="checkout-summary__row checkout-summary__total">
              <span>Total</span>
              <span>Rs. {total.toLocaleString()}</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg checkout-summary__btn"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>Place Order - Rs. {total.toLocaleString()}</>
              )}
            </button>

            <p className="checkout-summary__terms">
              By placing this order, you agree to our{' '}
              <Link to="/terms">Terms of Service</Link> and{' '}
              <Link to="/privacy">Privacy Policy</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
