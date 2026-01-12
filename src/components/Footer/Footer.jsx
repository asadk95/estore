import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { name: 'All Products', path: '/products' },
      { name: 'New Arrivals', path: '/products?sort=newest' },
      { name: 'Best Sellers', path: '/products?sort=popular' },
      { name: 'Deals & Offers', path: '/deals' },
    ],
    account: [
      { name: 'My Account', path: '/account' },
      { name: 'Order History', path: '/orders' },
      { name: 'Wishlist', path: '/wishlist' },
      { name: 'Track Order', path: '/track-order' },
    ],
    support: [
      { name: 'Contact Us', path: '/contact' },
      { name: 'FAQs', path: '/faqs' },
      { name: 'Shipping Info', path: '/shipping' },
      { name: 'Returns & Refunds', path: '/returns' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'About Us', path: '/about' },
    ],
  };

  const paymentMethods = ['💵 Cash on Delivery', '🏦 Bank Transfer', '📱 JazzCash', '📱 Easypaisa'];

  return (
    <footer className="footer">
      {/* Newsletter Section */}
      <div className="footer__newsletter">
        <div className="container">
          <div className="footer__newsletter-content">
            <div className="footer__newsletter-text">
              <h3>Subscribe to Our Newsletter</h3>
              <p>Get updates on new arrivals and exclusive offers!</p>
            </div>
            <form className="footer__newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                className="footer__newsletter-input"
              />
              <button type="submit" className="btn btn-accent">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer__main">
        <div className="container">
          <div className="footer__grid">
            {/* Brand Column */}
            <div className="footer__brand">
              <Link to="/" className="footer__logo">
                <span className="footer__logo-icon">🛒</span>
                <span className="footer__logo-text">E-Store</span>
              </Link>
              <p className="footer__description">
                Your one-stop shop for quality products at the best prices.
                Fast delivery across Pakistan.
              </p>
              <div className="footer__contact">
                <a href="mailto:support@estore.pk">
                  <FiMail /> support@estore.pk
                </a>
                <a href="tel:+923001234567">
                  <FiPhone /> +92 300 1234567
                </a>
                <span>
                  <FiMapPin /> Lahore, Pakistan
                </span>
              </div>
              <div className="footer__social">
                <a href="#" aria-label="Facebook"><FiFacebook /></a>
                <a href="#" aria-label="Instagram"><FiInstagram /></a>
                <a href="#" aria-label="Twitter"><FiTwitter /></a>
                <a href="#" aria-label="YouTube"><FiYoutube /></a>
              </div>
            </div>

            {/* Links Columns */}
            <div className="footer__links-group">
              <h4>Shop</h4>
              <ul>
                {footerLinks.shop.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer__links-group">
              <h4>Account</h4>
              <ul>
                {footerLinks.account.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer__links-group">
              <h4>Support</h4>
              <ul>
                {footerLinks.support.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Methods */}
            <div className="footer__payment">
              <h4>We Accept</h4>
              <div className="footer__payment-methods">
                {paymentMethods.map((method) => (
                  <span key={method} className="footer__payment-badge">
                    {method}
                  </span>
                ))}
              </div>
              <div className="footer__trust">
                <span className="footer__trust-badge">🔒 Secure Checkout</span>
                <span className="footer__trust-badge">✅ 100% Genuine</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="container">
          <p>© {currentYear} E-Store. All rights reserved.</p>
          <div className="footer__bottom-links">
            {footerLinks.legal.map((link) => (
              <Link key={link.path} to={link.path}>{link.name}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
