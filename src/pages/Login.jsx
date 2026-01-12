import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { loginWithAPI } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    // Use real API login
    const result = await loginWithAPI(data.email, data.password);

    if (result.success) {
      toast.success('Welcome back! 🎉');
      navigate('/');
    } else {
      toast.error(result.error || 'Invalid credentials');
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
            <h1>Welcome Back</h1>
            <p>Sign in to continue shopping</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
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
              <div className="form-label-row">
                <label className="form-label">Password</label>
                <Link to="/forgot-password" className="form-link">
                  Forgot password?
                </Link>
              </div>
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

            <div className="form-checkbox">
              <input type="checkbox" id="remember" {...register('remember')} />
              <label htmlFor="remember">Remember me for 30 days</label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Social Login */}
          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="social-login">
            <button className="social-btn google">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button className="social-btn facebook">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register">Create one now</Link>
            </p>
          </div>
        </div>

        {/* Side Panel */}
        <div className="auth-side">
          <div className="auth-side__content">
            <h2>Shop the Best Products</h2>
            <p>Join thousands of happy customers shopping at E-Store</p>
            <div className="auth-side__features">
              <div className="feature">
                <span>🚚</span>
                <p>Free delivery across Pakistan</p>
              </div>
              <div className="feature">
                <span>💳</span>
                <p>Secure payment methods</p>
              </div>
              <div className="feature">
                <span>🔄</span>
                <p>Easy returns & exchanges</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
