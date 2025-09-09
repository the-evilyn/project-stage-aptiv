import React, { useState } from 'react';
import { Package, Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Family } from '../../types';

export const FamiliesView: React.FC = () => {
  const { families, createFamily, updateFamily, deleteFamily } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const [viewingFamily, setViewingFamily] = useState<Family | null>(null);

  const filteredFamilies = families.filter(family => {
    const matchesSearch = family.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         family.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || family.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Families</h1>
          <p className="text-gray-600 mt-1">Manage automotive component families and configurations</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Family</span>
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
                placeholder="Search families by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="maintenance">Maintenance</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Families Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Name</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Code</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Type</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Holders</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Created</th>
                <th className="text-right py-4 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFamilies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No families found</p>
                  </td>
                </tr>
              ) : (
                filteredFamilies.map((family) => (
                  <tr key={family.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">{family.name}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{family.description}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-mono text-gray-700">{family.code}</td>
                    <td className="py-4 px-6 text-sm text-gray-700">{family.type}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(family.status)}`}>
                        {family.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">{family.totalHolders}</td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {new Date(family.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setViewingFamily(family)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingFamily(family)}
                          className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteFamily(family.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Family Modal */}
      {showCreateModal && (
        <FamilyModal
          onClose={() => setShowCreateModal(false)}
          onSave={createFamily}
        />
      )}

      {/* Edit Family Modal */}
      {editingFamily && (
        <FamilyModal
          family={editingFamily}
          onClose={() => setEditingFamily(null)}
          onSave={(data) => updateFamily(editingFamily.id, data)}
        />
      )}

      {/* View Family Modal */}
      {viewingFamily && (
        <FamilyDetailModal
          family={viewingFamily}
          onClose={() => setViewingFamily(null)}
        />
      )}
    </div>
  );
};

// Family Modal Component
interface FamilyModalProps {
  family?: Family;
  onClose: () => void;
  onSave: (data: any) => void;
}

const FamilyModal: React.FC<FamilyModalProps> = ({ family, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: family?.name || '',
    code: family?.code || '',
    type: family?.type || '',
    customType: '',
    status: family?.status || 'draft',
    description: family?.description || '',
    totalHolders: family?.totalHolders || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      type: formData.type === 'Other' ? formData.customType : formData.type
    };
    onSave(finalData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {family ? 'Edit Family' : 'Create New Family'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Type</option>
                <option value="Front Bumper">Front Bumper</option>
                <option value="Rear Bumper">Rear Bumper</option>
                <option value="Tailgate">Tailgate</option>
                <option value="Door Panel">Door Panel</option>
                <option value="Other">Other</option>
              </select>
              {formData.type === 'Other' && (
                <input
                  type="text"
                  placeholder="Enter custom type"
                  value={formData.customType}
                  onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Holders</label>
              <input
                type="number"
                value={formData.totalHolders}
                onChange={(e) => setFormData({ ...formData, totalHolders: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {family ? 'Update' : 'Create'}
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

// Family Detail Modal Component
interface FamilyDetailModalProps {
  family: Family;
  onClose: () => void;
}

const FamilyDetailModal: React.FC<FamilyDetailModalProps> = ({ family, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Family Details</h2>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Name</h3>
              <p className="text-lg font-medium text-gray-900">{family.name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Code</h3>
              <p className="text-lg font-mono text-gray-900">{family.code}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Type</h3>
              <p className="text-lg text-gray-900">{family.type}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                family.status === 'active' ? 'bg-green-100 text-green-800' :
                family.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                family.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {family.status}
              </span>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Holders</h3>
              <p className="text-lg font-medium text-gray-900">{family.totalHolders}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
              <p className="text-lg text-gray-900">{new Date(family.createdAt).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{family.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};