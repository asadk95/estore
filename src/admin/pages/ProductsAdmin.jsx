import { useState, useEffect, useRef } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiLoader, FiUpload, FiX, FiImage
} from 'react-icons/fi';
import { adminAPI } from '../../services/adminApi';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProductsAdmin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: '',
    image: '',
    description: '',
    stock: '',
    badge: '',
  });

  const categories = ['Electronics', 'Clothing', 'Home & Living', 'Sports', 'Beauty', 'Accessories'];
  const badges = ['', 'New', 'Hot', 'Sale'];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await adminAPI.getProducts('?limit=100');
      setProducts(data.products || []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditProduct(product);
      setForm({
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice || '',
        category: product.category,
        image: product.image || '',
        description: product.description || '',
        stock: product.stock || 0,
        badge: product.badge || '',
      });
      setImagePreview(product.image || '');
    } else {
      setEditProduct(null);
      setForm({
        name: '',
        price: '',
        originalPrice: '',
        category: categories[0],
        image: '',
        description: '',
        stock: 0,
        badge: '',
      });
      setImagePreview('');
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditProduct(null);
    setImagePreview('');
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('auth-storage')
        ? JSON.parse(localStorage.getItem('auth-storage'))?.state?.token
        : null;

      const response = await fetch(`${API_BASE}/upload/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Use relative URL - works in both local and production
      // The browser/frontend will resolve it relative to current domain
      const imageUrl = data.file.url; // e.g., /uploads/filename.jpg
      setForm({ ...form, image: imageUrl });
      setImagePreview(imageUrl);
      toast.success('Image uploaded!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setForm({ ...form, image: '' });
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const productData = {
        ...form,
        price: parseInt(form.price),
        originalPrice: form.originalPrice ? parseInt(form.originalPrice) : null,
        stock: parseInt(form.stock) || 0,
        badge: form.badge || null,
      };

      if (editProduct) {
        await adminAPI.updateProduct(editProduct.id, productData);
        toast.success('Product updated!');
      } else {
        await adminAPI.createProduct(productData);
        toast.success('Product created!');
      }

      closeModal();
      loadProducts();
    } catch (error) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteProduct(id);
      toast.success('Product deleted!');
      setDeleteConfirm(null);
      loadProducts();
    } catch (error) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <FiLoader className="spinner" />
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="products-admin">
      <div className="admin-page-header">
        <h1>Products ({products.length})</h1>
        <button onClick={() => openModal()} className="btn btn-primary">
          <FiPlus /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="admin-toolbar">
        <div className="admin-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Badge</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <img
                    src={product.image || 'https://via.placeholder.com/60'}
                    alt={product.name}
                    className="product-thumb"
                  />
                </td>
                <td><strong>{product.name}</strong></td>
                <td>{product.category}</td>
                <td>
                  Rs. {product.price?.toLocaleString()}
                  {product.originalPrice && (
                    <del className="text-muted"> Rs. {product.originalPrice?.toLocaleString()}</del>
                  )}
                </td>
                <td className={product.stock < 10 ? 'text-warning' : ''}>
                  {product.stock || 0}
                </td>
                <td>
                  {product.badge && (
                    <span className={`status-badge ${product.badge.toLowerCase()}`}>
                      {product.badge}
                    </span>
                  )}
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => openModal(product)}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => setDeleteConfirm(product)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal admin-modal--lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="admin-modal__close" onClick={closeModal}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal__body">
              {/* Image Upload Section */}
              <div className="image-upload-section">
                <label>Product Image</label>
                <div className="image-upload-area">
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button type="button" className="image-remove" onClick={clearImage}>
                        <FiX />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="image-dropzone"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? (
                        <>
                          <FiLoader className="spinner" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <FiUpload />
                          <span>Click to upload image</span>
                          <small>Max 5MB • JPG, PNG, GIF, WebP</small>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="image-input-hidden"
                  />
                </div>
                <div className="image-url-fallback">
                  <span>Or paste image URL:</span>
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => {
                      setForm({ ...form, image: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    className="form-input"
                    placeholder="/uploads/... or https://..."
                  />
                </div>
              </div>

              <div className="admin-form__row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="admin-form__row">
                <div className="form-group">
                  <label>Price (Rs.) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Original Price (Rs.)</label>
                  <input
                    type="number"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    className="form-input"
                    placeholder="For showing discount"
                  />
                </div>
              </div>

              <div className="admin-form__row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="form-input"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="admin-form__row">
                <div className="form-group">
                  <label>Badge</label>
                  <select
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className="form-input"
                  >
                    {badges.map(b => (
                      <option key={b} value={b}>{b || 'None'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="form-input"
                  rows={3}
                />
              </div>

              <div className="admin-modal__footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
                  {saving ? 'Saving...' : (editProduct ? 'Update Product' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal admin-modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>Delete Product</h2>
            </div>
            <div className="admin-modal__body">
              <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?</p>
              <p className="text-muted">This action cannot be undone.</p>
            </div>
            <div className="admin-modal__footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={() => handleDelete(deleteConfirm.id)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-toolbar { margin-bottom: var(--space-4); }
        .admin-search { display: flex; align-items: center; gap: var(--space-2); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: var(--space-2) var(--space-3); max-width: 300px; }
        .admin-search input { border: none; background: none; outline: none; flex: 1; }
        .product-thumb { width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius-sm); }
        .table-actions { display: flex; gap: var(--space-2); }
        .text-muted { color: var(--text-secondary); font-size: var(--text-sm); margin-left: var(--space-1); }
        .text-warning { color: var(--warning-500); font-weight: 600; }
        .status-badge.new { background: var(--primary-100); color: var(--primary-700); }
        .status-badge.hot { background: var(--error-100); color: var(--error-700); }
        .status-badge.sale { background: var(--success-100); color: var(--success-700); }
        
        .admin-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: var(--space-4); }
        .admin-modal { background: var(--bg-secondary); border-radius: var(--radius-lg); max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; }
        .admin-modal--sm { max-width: 400px; }
        .admin-modal--lg { max-width: 700px; }
        .admin-modal__header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); border-bottom: 1px solid var(--border-color); position: sticky; top: 0; background: var(--bg-secondary); z-index: 1; }
        .admin-modal__header h2 { font-size: var(--text-lg); }
        .admin-modal__close { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-secondary); }
        .admin-modal__body { padding: var(--space-4); }
        .admin-modal__footer { display: flex; justify-content: flex-end; gap: var(--space-2); padding: var(--space-4); border-top: 1px solid var(--border-color); position: sticky; bottom: 0; background: var(--bg-secondary); }
        .btn-error { background: var(--error-500); color: white; }
        .btn-error:hover { background: var(--error-600); }
        
        /* Image Upload Styles */
        .image-upload-section { margin-bottom: var(--space-4); }
        .image-upload-section > label { display: block; font-weight: 500; margin-bottom: var(--space-2); }
        .image-upload-area { margin-bottom: var(--space-3); }
        
        .image-dropzone { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-2); padding: var(--space-8); border: 2px dashed var(--border-color); border-radius: var(--radius-lg); cursor: pointer; transition: all 0.2s; background: var(--bg-tertiary); }
        .image-dropzone:hover { border-color: var(--primary-500); background: var(--primary-50); }
        .image-dropzone svg { font-size: 32px; color: var(--text-muted); }
        .image-dropzone span { color: var(--text-secondary); }
        .image-dropzone small { font-size: var(--text-xs); color: var(--text-muted); }
        .image-dropzone .spinner { animation: spin 1s linear infinite; }
        
        .image-preview { position: relative; display: inline-block; max-width: 200px; }
        .image-preview img { width: 100%; border-radius: var(--radius-lg); }
        .image-remove { position: absolute; top: -8px; right: -8px; width: 24px; height: 24px; background: var(--error-500); color: white; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        
        .image-input-hidden { display: none; }
        
        .image-url-fallback { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: var(--text-muted); }
        .image-url-fallback span { white-space: nowrap; }
        .image-url-fallback .form-input { flex: 1; }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProductsAdmin;
