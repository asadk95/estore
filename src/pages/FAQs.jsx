import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiSearch, FiPackage, FiTruck, FiCreditCard, FiRefreshCw, FiUser, FiMessageCircle } from 'react-icons/fi';
import './FAQs.css';

const faqData = [
  {
    category: 'Orders & Shipping',
    icon: <FiPackage />,
    questions: [
      { q: 'How do I track my order?', a: 'You can track your order by visiting the "My Orders" section in your account. Click on any order to see real-time tracking updates. You will also receive SMS and email notifications at each stage.' },
      { q: 'What are the delivery charges?', a: 'Delivery is FREE on orders above Rs. 2,000. For orders below Rs. 2,000, a flat delivery fee of Rs. 200 applies. Express delivery is available for an additional Rs. 300.' },
      { q: 'How long does delivery take?', a: 'Standard delivery takes 3-5 business days for major cities and 5-7 days for other areas. Express delivery (1-2 days) is available for Lahore, Karachi, and Islamabad.' },
      { q: 'Do you deliver to my city?', a: 'Yes! We deliver to 100+ cities across Pakistan. Enter your postal code at checkout to confirm delivery availability in your area.' },
    ]
  },
  {
    category: 'Payments',
    icon: <FiCreditCard />,
    questions: [
      { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery (COD), Bank Transfer, JazzCash, and Easypaisa. All payment methods are secure and verified.' },
      { q: 'Is Cash on Delivery available?', a: 'Yes! Cash on Delivery is our most popular payment method. Pay in cash when your order is delivered to your doorstep.' },
      { q: 'How do I pay via Bank Transfer?', a: 'Select Bank Transfer at checkout. You\'ll receive our bank account details. Transfer the amount and upload the receipt in your order page for faster processing.' },
      { q: 'Are online payments secure?', a: 'Absolutely! All online payments are processed through secure payment gateways with encryption. Your financial information is never stored on our servers.' },
    ]
  },
  {
    category: 'Returns & Refunds',
    icon: <FiRefreshCw />,
    questions: [
      { q: 'What is your return policy?', a: 'We offer a 7-day easy return policy. If you\'re not satisfied with your purchase, you can return it within 7 days of delivery for a full refund or exchange.' },
      { q: 'How do I return a product?', a: 'Go to "My Orders", select the order, and click "Return Item". Choose your reason and schedule a pickup. Our rider will collect the item from your address.' },
      { q: 'When will I receive my refund?', a: 'Refunds are processed within 5-7 business days after we receive the returned item. The amount will be credited to your original payment method.' },
      { q: 'Can I exchange instead of refund?', a: 'Yes! You can choose to exchange the product for a different size, color, or another product of equal value. Exchanges are also processed within 7 days.' },
    ]
  },
  {
    category: 'Account & Security',
    icon: <FiUser />,
    questions: [
      { q: 'How do I create an account?', a: 'Click "Register" in the header, fill in your details including name, email, and phone number. Verify your email and start shopping!' },
      { q: 'I forgot my password. What do I do?', a: 'Click "Forgot Password" on the login page. Enter your email address and we\'ll send you a link to reset your password.' },
      { q: 'How do I update my profile?', a: 'Go to "My Account" and click on "Profile". Here you can update your name, email, phone number, and manage your addresses.' },
      { q: 'Is my personal information safe?', a: 'Yes! We take data security seriously. Your personal information is encrypted and never shared with third parties without your consent.' },
    ]
  },
];

const FAQs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(0);
  const [openQuestion, setOpenQuestion] = useState(null);

  const filteredFAQs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  const displayFAQs = searchQuery ? filteredFAQs : faqData;

  return (
    <div className="faqs-page">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>FAQs</span>
        </nav>

        <div className="faqs-header">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about orders, payments, returns, and more</p>

          <div className="faqs-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="faqs-layout">
          {/* Categories */}
          <aside className="faqs-categories">
            {faqData.map((cat, idx) => (
              <button
                key={idx}
                className={`category-btn ${activeCategory === idx && !searchQuery ? 'active' : ''}`}
                onClick={() => { setActiveCategory(idx); setSearchQuery(''); }}
              >
                {cat.icon}
                <span>{cat.category}</span>
              </button>
            ))}
          </aside>

          {/* Questions */}
          <main className="faqs-content">
            {displayFAQs.map((category, catIdx) => (
              (searchQuery || catIdx === activeCategory) && (
                <div key={catIdx} className="faq-category">
                  {searchQuery && <h3>{category.category}</h3>}
                  <div className="faq-list">
                    {category.questions.map((faq, qIdx) => {
                      const key = `${catIdx}-${qIdx}`;
                      return (
                        <div
                          key={key}
                          className={`faq-item ${openQuestion === key ? 'open' : ''}`}
                        >
                          <button
                            className="faq-question"
                            onClick={() => setOpenQuestion(openQuestion === key ? null : key)}
                          >
                            <span>{faq.q}</span>
                            <FiChevronDown />
                          </button>
                          <div className="faq-answer">
                            <p>{faq.a}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ))}

            {searchQuery && displayFAQs.length === 0 && (
              <div className="faqs-empty">
                <p>No results found for "{searchQuery}"</p>
                <button onClick={() => setSearchQuery('')}>Clear search</button>
              </div>
            )}
          </main>
        </div>

        {/* Contact CTA */}
        <div className="faqs-contact">
          <FiMessageCircle />
          <div>
            <h3>Still have questions?</h3>
            <p>Our support team is here to help</p>
          </div>
          <Link to="/contact" className="btn btn-primary">Contact Us</Link>
        </div>
      </div>
    </div>
  );
};

export default FAQs;
