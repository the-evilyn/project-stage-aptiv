import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, Shield, Mail, Calendar, Search, Filter, Eye, EyeOff, Key, AtSign, AlertTriangle, Lock, History } from 'lucide-react';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const UserManagementView: React.FC = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [changingPassword, setChangingPassword] = useState<User | null>(null);
  const [changingEmail, setChangingEmail] = useState<User | null>(null);

  // Check if user has admin permissions
  const canManageUsers = hasPermission('users:write') || hasPermission('*');

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: 'admin',
      email: 'admin@aptiv-m2.com',
      role: 'admin',
      permissions: ['*'],
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date()
    },
    {
      id: '2',
      username: 'supervisor',
      email: 'supervisor@aptiv-m2.com',
      role: 'supervisor',
      permissions: ['families:read', 'families:write', 'holders:read', 'holders:write', 'robs:read', 'robs:write'],
      createdAt: new Date('2024-01-15'),
      lastLogin: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      id: '3',
      username: 'manager_prod',
      email: 'manager.prod@aptiv-m2.com',
      role: 'manager',
      permissions: ['families:read', 'holders:read', 'robs:read', 'reports:read'],
      createdAt: new Date('2024-02-01'),
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2)
    },
    {
      id: '4',
      username: 'operator_1',
      email: 'operator1@aptiv-m2.com',
      role: 'operator',
      permissions: ['families:read', 'holders:read'],
      createdAt: new Date('2024-02-15'),
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24)
    }
  ]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = (userData: any) => {
    try {
      const newUser: User = {
        ...userData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        permissions: getPermissionsByRole(userData.role)
      };
      setUsers(prev => [...prev, newUser]);
      alert('User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    }
  };

  const handleUpdateUser = (userId: string, userData: any) => {
    try {
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, ...userData, permissions: getPermissionsByRole(userData.role || u.role) }
          : u
      ));
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.role === 'admin') {
      alert('Cannot delete admin users.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        setUsers(prev => prev.filter(u => u.id !== userId));
        alert('User deleted successfully!');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handlePasswordChange = (userId: string) => {
    try {
      const newPassword = generateSecurePassword();
      const user = users.find(u => u.id === userId);
      
      if (user) {
        // In production, this would send email notification
        alert(`New password generated for ${user.username}: ${newPassword}\n\nUser will be required to change password on next login.\nEmail notification sent to: ${user.email}`);
        
        // Update user to require password change
        setUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, requirePasswordChange: true }
            : u
        ));
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password. Please try again.');
    }
  };

  const handleEmailChange = (userId: string, newEmail: string) => {
    try {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        alert('Please enter a valid email address.');
        return;
      }

      // Check for duplicates
      const emailExists = users.some(u => u.id !== userId && u.email === newEmail);
      if (emailExists) {
        alert('This email address is already in use.');
        return;
      }

      const user = users.find(u => u.id === userId);
      if (user) {
        setUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, email: newEmail }
            : u
        ));
        
        alert(`Email updated successfully for ${user.username}\nConfirmation email sent to: ${newEmail}`);
        setChangingEmail(null);
      }
    } catch (error) {
      console.error('Error changing email:', error);
      alert('Failed to change email. Please try again.');
    }
  };

  const getPermissionsByRole = (role: string) => {
    switch (role) {
      case 'admin': return ['*'];
      case 'supervisor': return ['families:read', 'families:write', 'holders:read', 'holders:write', 'robs:read', 'robs:write'];
      case 'manager': return ['families:read', 'holders:read', 'robs:read', 'reports:read'];
      case 'operator': return ['families:read', 'holders:read'];
      default: return [];
    }
  };
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'manager': return 'bg-green-100 text-green-800';
      case 'operator': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'supervisor': return Users;
      case 'manager': return Eye;
      case 'operator': return EyeOff;
      default: return Users;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users, roles, and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="supervisor">Supervisor</option>
              <option value="manager">Manager</option>
              <option value="operator">Operator</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-900">User</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Role</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Permissions</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Last Login</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Created</th>
                <th className="text-right py-4 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <RoleIcon className="w-4 h-4 text-gray-500" />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-700">
                          {user.permissions.includes('*') ? (
                            <span className="text-red-600 font-medium">All Permissions</span>
                          ) : (
                            <span>{user.permissions.length} permissions</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {user.lastLogin ? (
                          <div>
                            <div>{user.lastLogin.toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">
                              {user.lastLogin.toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {user.createdAt.toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setViewingUser(user)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View User Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingUser(user)}
                            disabled={!canManageUsers}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePasswordChange(user.id)}
                            disabled={!canManageUsers}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                            title="Change Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setChangingEmail(user)}
                            disabled={!canManageUsers}
                            className="p-1 text-gray-400 hover:text-purple-600 transition-colors disabled:opacity-50"
                            title="Change Email"
                          >
                            <AtSign className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.role === 'admin' || !canManageUsers}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['admin', 'supervisor', 'manager', 'operator'].map((role) => {
          const count = users.filter(u => u.role === role).length;
          const RoleIcon = getRoleIcon(role);
          return (
            <div key={role} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${getRoleColor(role)}`}>
                  <RoleIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{role}s</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <UserModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateUser}
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <UserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={(userData) => handleUpdateUser(editingUser.id, userData)}
        />
      )}

      {/* View User Modal */}
      {viewingUser && (
        <UserDetailModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
        />
      )}

      {/* Change Email Modal */}
      {changingEmail && (
        <EmailChangeModal
          user={changingEmail}
          onClose={() => setChangingEmail(null)}
          onSave={(newEmail) => handleEmailChange(changingEmail.id, newEmail)}
        />
      )}
    </div>
  );
};

// User Modal Component
interface UserModalProps {
  user?: User;
  onClose: () => void;
  onSave: (data: any) => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    role: user?.role || 'operator',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {user ? 'Edit User' : 'Create New User'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="operator">Operator</option>
                <option value="manager">Manager</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            {!user && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </>
            )}
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {user ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// User Detail Modal Component
interface UserDetailModalProps {
  user: User;
  onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'supervisor': return Users;
      case 'manager': return Eye;
      case 'operator': return EyeOff;
      default: return Users;
    }
  };

  const RoleIcon = getRoleIcon(user.role);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{user.username}</h3>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <RoleIcon className="w-4 h-4 text-gray-500" />
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'supervisor' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'manager' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Account Created</h4>
                <p className="text-gray-900">{user.createdAt.toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Last Login</h4>
                <p className="text-gray-900">
                  {user.lastLogin ? user.lastLogin.toLocaleString() : 'Never'}
                </p>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Permissions</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                {user.permissions.includes('*') ? (
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    <span className="text-red-600 font-medium">Full Administrator Access</span>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {user.permissions.map((permission, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{permission.replace(':', ' ')}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Email Change Modal Component
interface EmailChangeModalProps {
  user: User;
  onClose: () => void;
  onSave: (email: string) => void;
}

const EmailChangeModal: React.FC<EmailChangeModalProps> = ({ user, onClose, onSave }) => {
  const [newEmail, setNewEmail] = useState(user.email);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateEmail = (email: string) => {
    const errors: string[] = [];
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
    
    // Domain validation (basic)
    if (email && !email.includes('.')) {
      errors.push('Email must contain a valid domain');
    }
    
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setValidationErrors([]);
    
    if (newEmail !== confirmEmail) {
      setValidationErrors(['Email addresses do not match']);
      setIsValidating(false);
      return;
    }
    
    const emailErrors = validateEmail(newEmail);
    if (emailErrors.length > 0) {
      setValidationErrors(emailErrors);
      setIsValidating(false);
      return;
    }
    
    // Simulate validation delay
    setTimeout(() => {
      setIsValidating(false);
      onSave(newEmail);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Change Email for {user.username}
          </h2>
          
          {validationErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-red-800 font-medium">Validation Errors:</span>
              </div>
              <ul className="text-red-700 text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Email
              </label>
              <input
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={isValidating}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isValidating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Validating...</span>
                  </>
                ) : (
                  <span>Change Email</span>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Password Change Modal Component
interface PasswordChangeModalProps {
  user: User;
  onClose: () => void;
  onSave: (password: string) => boolean;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ user, onClose, onSave }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });

  const validatePasswordStrength = (password: string) => {
    const errors: string[] = [];
    let score = 0;
    
    if (password.length >= 12) score += 1;
    else errors.push('Password must be at least 12 characters long');
    
    if (/[A-Z]/.test(password)) score += 1;
    else errors.push('Must contain at least one uppercase letter');
    
    if (/[a-z]/.test(password)) score += 1;
    else errors.push('Must contain at least one lowercase letter');
    
    if (/\d/.test(password)) score += 1;
    else errors.push('Must contain at least one number');
    
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    else errors.push('Must contain at least one special character');
    
    const feedback = score === 5 ? 'Very Strong' : 
                    score === 4 ? 'Strong' : 
                    score === 3 ? 'Medium' : 
                    score === 2 ? 'Weak' : 'Very Weak';
    
    return { errors, score, feedback };
  };

  const handlePasswordChange = (password: string) => {
    setNewPassword(password);
    const validation = validatePasswordStrength(password);
    setPasswordStrength({ score: validation.score, feedback: validation.feedback });
    setValidationErrors(validation.errors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    
    if (newPassword !== confirmPassword) {
      setValidationErrors(['Passwords do not match']);
      setIsValidating(false);
      return;
    }
    
    const validation = validatePasswordStrength(newPassword);
    if (validation.errors.length > 0) {
      setValidationErrors(validation.errors);
      setIsValidating(false);
      return;
    }
    
    // Simulate validation delay
    setTimeout(() => {
      setIsValidating(false);
      const success = onSave(newPassword);
      if (!success) {
        setValidationErrors(['Failed to change password. Please try again.']);
      }
    }, 1000);
  };

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    // Ensure at least one of each required character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
    password += '!@#$%^&*()_+-='[Math.floor(Math.random() * 13)]; // Special
    
    // Fill remaining characters
    for (let i = 4; i < 16; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Change Password for {user.username}
          </h2>
          
          {validationErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-red-800 font-medium">Password Requirements:</span>
              </div>
              <ul className="text-red-700 text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <button
                  type="button"
                  onClick={() => handlePasswordChange(generateSecurePassword())}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Generate Secure Password
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.score === 5 ? 'bg-green-500' :
                          passwordStrength.score === 4 ? 'bg-blue-500' :
                          passwordStrength.score === 3 ? 'bg-yellow-500' :
                          passwordStrength.score === 2 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.score === 5 ? 'text-green-600' :
                      passwordStrength.score === 4 ? 'text-blue-600' :
                      passwordStrength.score === 3 ? 'text-yellow-600' :
                      passwordStrength.score === 2 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {passwordStrength.feedback}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800 dark:text-blue-200 font-medium text-sm">Security Notice</span>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-xs">
                Password will be securely hashed using industry-standard encryption. 
                User will not be required to change password on next login.
              </p>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={isValidating || passwordStrength.score < 5}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isValidating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Changing...</span>
                  </>
                ) : (
                  <span>Change Password</span>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Audit Log Modal Component
interface AuditLogModalProps {
  user: User;
  auditLogs: any[];
  users: User[];
  onClose: () => void;
}

const AuditLogModal: React.FC<AuditLogModalProps> = ({ user, auditLogs, users, onClose }) => {
  const getAdminName = (adminId: string) => {
    const admin = users.find(u => u.id === adminId);
    return admin ? admin.username : 'Unknown Admin';
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'password_change': return Key;
      case 'email_change': return AtSign;
      case 'user_delete': return Trash2;
      default: return History;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'password_change': return 'text-green-600 bg-green-100';
      case 'email_change': return 'text-blue-600 bg-blue-100';
      case 'user_delete': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Audit Log for {user.username}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {auditLogs.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No audit logs found for this user.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {auditLogs.map((log) => {
                const ActionIcon = getActionIcon(log.action);
                const colorClass = getActionColor(log.action);
                
                return (
                  <div key={log.id} className="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <ActionIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                          {log.action.replace('_', ' ')}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {log.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">{log.details}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Performed by: {getAdminName(log.adminId)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};