import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    // Use real API registration
    const result = await registerUser({
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      password: data.password,
    });

    if (result.success) {
      toast.success('Account created successfully! 🎉');
      navigate('/');
    } else {
      toast.error(result.error || 'Registration failed');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span>🛒</span> E-Store
            </Link>
            <h1>Create Account</h1>
            <p>Join E-Store and start shopping</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="name-fields">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <div className="input-with-icon">
                  <FiUser className="input-icon" />
                  <input
                    {...register('firstName', { required: 'First name is required' })}
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                    placeholder="John"
                  />
                </div>
                {errors.firstName && (
                  <span className="form-error">{errors.firstName.message}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <div className="input-with-icon">
                  <FiUser className="input-icon" />
                  <input
                    {...register('lastName', { required: 'Last name is required' })}
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && (
                  <span className="form-error">{errors.lastName.message}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <span className="form-error">{errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-with-icon">
                <FiPhone className="input-icon" />
                <input
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^03[0-9]{2}-?[0-9]{7}$/,
                      message: 'Enter valid Pakistani phone (03XX-XXXXXXX)',
                    },
                  })}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="03XX-XXXXXXX"
                />
              </div>
              {errors.phone && (
                <span className="form-error">{errors.phone.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && (
                <span className="form-error">{errors.password.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match',
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <span className="form-error">{errors.confirmPassword.message}</span>
              )}
            </div>

            <div className="form-checkbox">
              <input
                type="checkbox"
                id="terms"
                {...register('terms', { required: 'You must agree to terms' })}
              />
              <label htmlFor="terms">
                I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link>
              </label>
            </div>
            {errors.terms && (
              <span className="form-error" style={{ marginTop: '-1rem', marginBottom: '1rem', display: 'block' }}>
                {errors.terms.message}
              </span>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>

        {/* Side Panel */}
        <div className="auth-side">
          <div className="auth-side__content">
            <h2>Start Shopping Today</h2>
            <p>Create an account to enjoy exclusive benefits</p>
            <div className="auth-side__features">
              <div className="feature">
                <span>📦</span>
                <p>Track your orders easily</p>
              </div>
              <div className="feature">
                <span>❤️</span>
                <p>Save items to your wishlist</p>
              </div>
              <div className="feature">
                <span>🎁</span>
                <p>Get exclusive offers & discounts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
