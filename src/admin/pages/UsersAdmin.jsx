import { useState, useEffect } from 'react';
import { FiLoader, FiUser } from 'react-icons/fi';
import { adminAPI } from '../../services/adminApi';
import toast from 'react-hot-toast';

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminAPI.getUsers();
      setUsers(data.users || []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id, updates) => {
    try {
      await adminAPI.updateUser(id, updates);
      toast.success('User updated!');
      loadUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to update user');
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <FiLoader className="spinner" />
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="users-admin">
      <div className="admin-page-header">
        <h1>Users ({users.length})</h1>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      <FiUser />
                    </div>
                    <strong>{user.name}</strong>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.phone || '-'}</td>
                <td>
                  <span className={`status-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.status || 'active'}`}>
                    {user.status || 'active'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  {user.role !== 'admin' && (
                    <select
                      value={user.status || 'active'}
                      onChange={(e) => updateUser(user.id, { status: e.target.value })}
                      className="form-input"
                      style={{ maxWidth: 120 }}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspend</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .user-info { display: flex; align-items: center; gap: var(--space-2); }
        .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--primary-100); color: var(--primary-500); display: flex; align-items: center; justify-content: center; }
        .status-badge.admin { background: var(--primary-100); color: var(--primary-700); }
        .status-badge.user { background: var(--neutral-100); color: var(--neutral-700); }
      `}</style>
    </div>
  );
};

export default UsersAdmin;
