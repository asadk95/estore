import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Contact.css';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    reset();
    setIsSubmitting(false);
  };

  const contactInfo = [
    { icon: <FiPhone />, title: 'Phone', info: '+92 300 1234567', link: 'tel:+923001234567' },
    { icon: <FiMail />, title: 'Email', info: 'support@estore.pk', link: 'mailto:support@estore.pk' },
    { icon: <FiMapPin />, title: 'Address', info: 'Main Boulevard, Gulberg III, Lahore, Pakistan' },
    { icon: <FiClock />, title: 'Working Hours', info: 'Mon - Sat: 9AM - 9PM' },
  ];

  return (
    <div className="contact-page">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Contact Us</span>
        </nav>

        <div className="contact-header">
          <h1>Get in Touch</h1>
          <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>

        <div className="contact-layout">
          {/* Contact Form */}
          <div className="contact-form-wrapper">
            <h2><FiMessageSquare /> Send us a Message</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="Your name"
                  />
                  {errors.name && <span className="form-error">{errors.name.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                    })}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <span className="form-error">{errors.email.message}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  {...register('phone')}
                  className="form-input"
                  placeholder="03XX-XXXXXXX"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select {...register('subject', { required: 'Please select a subject' })} className="form-input">
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="order">Order Issue</option>
                  <option value="return">Returns & Refunds</option>
                  <option value="payment">Payment Issue</option>
                  <option value="feedback">Feedback</option>
                </select>
                {errors.subject && <span className="form-error">{errors.subject.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea
                  {...register('message', { required: 'Message is required' })}
                  className={`form-input ${errors.message ? 'error' : ''}`}
                  rows="5"
                  placeholder="How can we help you?"
                ></textarea>
                {errors.message && <span className="form-error">{errors.message.message}</span>}
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : <><FiSend /> Send Message</>}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="contact-info">
            <h2>Contact Information</h2>
            <div className="contact-cards">
              {contactInfo.map((item, idx) => (
                <div key={idx} className="contact-card">
                  <div className="contact-card-icon">{item.icon}</div>
                  <div className="contact-card-content">
                    <h4>{item.title}</h4>
                    {item.link ? (
                      <a href={item.link}>{item.info}</a>
                    ) : (
                      <p>{item.info}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="contact-map">
              <div className="map-placeholder">
                <FiMapPin />
                <p>📍 Main Boulevard, Gulberg III, Lahore</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
