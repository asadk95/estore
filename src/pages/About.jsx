import { Link } from 'react-router-dom';
import { FiCheck, FiUsers, FiPackage, FiAward, FiHeart } from 'react-icons/fi';
import './About.css';

const About = () => {
  const stats = [
    { value: '50K+', label: 'Happy Customers' },
    { value: '10K+', label: 'Products' },
    { value: '100+', label: 'Cities Covered' },
    { value: '5+', label: 'Years Experience' },
  ];

  const values = [
    { icon: <FiHeart />, title: 'Customer First', desc: 'We prioritize customer satisfaction in everything we do' },
    { icon: <FiAward />, title: 'Quality Products', desc: 'Only genuine and quality-tested products make it to our store' },
    { icon: <FiPackage />, title: 'Fast Delivery', desc: 'Swift and reliable delivery across Pakistan' },
    { icon: <FiUsers />, title: 'Trusted Support', desc: '24/7 customer support to help you with any queries' },
  ];

  const team = [
    { name: 'Ali Hassan', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' },
    { name: 'Sara Khan', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
    { name: 'Ahmed Malik', role: 'Tech Lead', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
    { name: 'Fatima Ali', role: 'Customer Success', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200' },
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>About Us</span>
          </nav>

          <div className="about-hero-content">
            <h1>About E-Store</h1>
            <p>
              Pakistan's trusted online shopping destination. We're on a mission to make
              quality products accessible to everyone, everywhere in Pakistan.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-item">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story">
        <div className="container">
          <div className="story-content">
            <h2>Our Story</h2>
            <p>
              E-Store was founded in 2019 with a simple idea: make online shopping easy,
              affordable, and trustworthy for Pakistani consumers. What started as a small
              electronics store has now grown into a comprehensive marketplace offering
              everything from gadgets to fashion.
            </p>
            <p>
              We understand the unique challenges of e-commerce in Pakistan - from payment
              concerns to delivery trust issues. That's why we offer Cash on Delivery, easy
              returns, and door-to-door delivery across 100+ cities.
            </p>
            <ul className="story-features">
              <li><FiCheck /> 100% Genuine Products</li>
              <li><FiCheck /> Cash on Delivery Available</li>
              <li><FiCheck /> 7-Day Easy Returns</li>
              <li><FiCheck /> Nationwide Delivery</li>
            </ul>
          </div>
          <div className="story-image">
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600"
              alt="Shopping experience"
            />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values">
        <div className="container">
          <h2>Our Values</h2>
          <div className="values-grid">
            {values.map((value, idx) => (
              <div key={idx} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team">
        <div className="container">
          <h2>Meet Our Team</h2>
          <div className="team-grid">
            {team.map((member, idx) => (
              <div key={idx} className="team-card">
                <img src={member.image} alt={member.name} />
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Shopping?</h2>
            <p>Explore thousands of products at unbeatable prices</p>
            <Link to="/products" className="btn btn-primary btn-lg">
              Shop Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
