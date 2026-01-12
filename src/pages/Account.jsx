import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiPackage, FiHeart, FiMapPin, FiSettings, FiLogOut, FiEdit2, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import './Account.css';

const Account = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Demo addresses
  const [addresses] = useState([
    { id: 1, label: 'Home', address: 'House 123, Street 45, Gulberg III', city: 'Lahore', phone: '0300-1234567', isDefault: true },
    { id: 2, label: 'Office', address: 'Office 201, Blue Area', city: 'Islamabad', phone: '0301-7654321', isDefault: false },
  ]);

  // Redirect if not logged in
  if (!isAuthenticated) {
    return (
      <div className="account-page">
        <div className="container">
          <div className="account-login-prompt">
            <h2>Please Login</h2>
            <p>You need to be logged in to view your account</p>
            <Link to="/login" className="btn btn-primary">Login Now</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveProfile = () => {
    updateUser(formData);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FiUser /> },
    { id: 'orders', label: 'My Orders', icon: <FiPackage /> },
    { id: 'wishlist', label: 'Wishlist', icon: <FiHeart /> },
    { id: 'addresses', label: 'Addresses', icon: <FiMapPin /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings /> },
  ];

  return (
    <div className="account-page">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>My Account</span>
        </nav>

        <div className="account-layout">
          {/* Sidebar */}
          <aside className="account-sidebar">
            <div className="account-user">
              <div className="account-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="account-user-info">
                <h3>{user?.name}</h3>
                <p>{user?.email}</p>
              </div>
            </div>

            <nav className="account-nav">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`account-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
              <button className="account-nav-item logout" onClick={handleLogout}>
                <FiLogOut />
                <span>Logout</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="account-content">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="account-section">
                <div className="account-section-header">
                  <h2>Personal Information</h2>
                  <button className="btn btn-secondary" onClick={() => setIsEditing(!isEditing)}>
                    <FiEdit2 /> {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                <div className="profile-form">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      className="form-input"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      className="form-input"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      className="form-input"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="03XX-XXXXXXX"
                    />
                  </div>

                  {isEditing && (
                    <button className="btn btn-primary" onClick={handleSaveProfile}>
                      Save Changes
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="account-section">
                <h2>My Orders</h2>
                <p className="account-empty">
                  You haven't placed any orders yet. <Link to="/products">Start shopping!</Link>
                </p>
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="account-section">
                <h2>My Wishlist</h2>
                <p className="account-empty">
                  Your wishlist is empty. <Link to="/products">Browse products</Link>
                </p>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="account-section">
                <div className="account-section-header">
                  <h2>Saved Addresses</h2>
                  <button className="btn btn-primary">
                    <FiPlus /> Add New
                  </button>
                </div>

                <div className="addresses-grid">
                  {addresses.map(addr => (
                    <div key={addr.id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                      {addr.isDefault && <span className="address-badge">Default</span>}
                      <h4>{addr.label}</h4>
                      <p>{addr.address}</p>
                      <p>{addr.city}</p>
                      <p>{addr.phone}</p>
                      <div className="address-actions">
                        <button>Edit</button>
                        <button>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="account-section">
                <h2>Account Settings</h2>
                <div className="settings-list">
                  <div className="settings-item">
                    <div>
                      <h4>Change Password</h4>
                      <p>Update your password regularly for security</p>
                    </div>
                    <button className="btn btn-secondary">Change</button>
                  </div>
                  <div className="settings-item">
                    <div>
                      <h4>Email Notifications</h4>
                      <p>Manage your email preferences</p>
                    </div>
                    <button className="btn btn-secondary">Manage</button>
                  </div>
                  <div className="settings-item danger">
                    <div>
                      <h4>Delete Account</h4>
                      <p>Permanently delete your account and all data</p>
                    </div>
                    <button className="btn" style={{ background: 'var(--error-500)', color: 'white' }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Account;
