import React, { useState } from 'react';
import { Box, Plus, Search, Filter, Edit, Trash2, ArrowRightLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Holder } from '../../types';

export const HoldersView: React.FC = () => {
  const { families, robs, createHolder, updateHolder, deleteHolder, assignHolderToROB, unassignHolderFromROB } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [familyFilter, setFamilyFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingHolder, setEditingHolder] = useState<Holder | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<Holder | null>(null);
  const [holders, setHolders] = useState<Holder[]>([
    {
      id: '1',
      name: 'VW-FB-H001',
      familyId: '1',
      status: 'assigned',
      robId: '1',
      assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'VW-FB-H002',
      familyId: '1',
      status: 'available',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '3',
      name: 'SK-FB-H001',
      familyId: '2',
      status: 'assigned',
      robId: '2',
      assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      createdAt: new Date('2024-01-20')
    },
    {
      id: '4',
      name: 'SK-FB-H002',
      familyId: '2',
      status: 'maintenance',
      createdAt: new Date('2024-01-20')
    },
    {
      id: '5',
      name: 'TG-CB-H001',
      familyId: '3',
      status: 'available',
      createdAt: new Date('2024-02-01')
    },
    {
      id: '6',
      name: 'TG-CB-H002',
      familyId: '3',
      status: 'out_of_service',
      createdAt: new Date('2024-02-01')
    }
  ]);


  const filteredHolders = holders.filter(holder => {
    const matchesSearch = holder.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || holder.status === statusFilter;
    const matchesFamily = familyFilter === 'all' || holder.familyId === familyFilter;
    return matchesSearch && matchesStatus && matchesFamily;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_service': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return CheckCircle;
      case 'assigned': return ArrowRightLeft;
      case 'maintenance': return AlertTriangle;
      case 'out_of_service': return AlertTriangle;
      default: return Box;
    }
  };

  const getFamilyName = (familyId: string) => {
    const family = families.find(f => f.id === familyId);
    return family ? family.name : 'Unknown Family';
  };

  const getROBName = (robId?: string) => {
    if (!robId) return null;
    const rob = robs.find(r => r.id === robId);
    return rob ? rob.name : 'Unknown ROB';
  };

  const handleAssignToROB = (holderId: string, robId: string) => {
    setHolders(prev => prev.map(h => 
      h.id === holderId 
        ? { ...h, status: 'assigned', robId, assignedAt: new Date() }
        : h
    ));
    setShowAssignModal(null);
  };

  const handleUnassignFromROB = (holderId: string) => {
    if (confirm('Are you sure you want to unassign this holder from its ROB?')) {
      setHolders(prev => prev.map(h => 
        h.id === holderId 
          ? { ...h, status: 'available', robId: undefined, assignedAt: undefined }
          : h
      ));
    }
  };

  const handleDeleteHolder = (holderId: string) => {
    if (confirm('Are you sure you want to delete this holder? This action cannot be undone.')) {
      setHolders(prev => prev.filter(h => h.id !== holderId));
    }
  };

  const handleUpdateHolder = (holderId: string, updates: Partial<Holder>) => {
    setHolders(prev => prev.map(h => 
      h.id === holderId ? { ...h, ...updates } : h
    ));
  };

  const handleCreateHolder = (holderData: any) => {
    const newHolder: Holder = {
      ...holderData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };
    setHolders(prev => [...prev, newHolder]);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Holders Management</h1>
          <p className="text-gray-600 mt-1">Manage holder inventory, assignments, and status tracking</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Holder</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Holders', value: holders.length, color: 'blue' },
          { label: 'Available', value: holders.filter(h => h.status === 'available').length, color: 'green' },
          { label: 'Assigned', value: holders.filter(h => h.status === 'assigned').length, color: 'purple' },
          { label: 'Maintenance', value: holders.filter(h => h.status === 'maintenance').length, color: 'yellow' }
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${
                stat.color === 'blue' ? 'bg-blue-100' :
                stat.color === 'green' ? 'bg-green-100' :
                stat.color === 'purple' ? 'bg-purple-100' :
                'bg-yellow-100'
              }`}>
                <Box className={`w-6 h-6 ${
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'purple' ? 'text-purple-600' :
                  'text-yellow-600'
                }`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search holders by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
              <option value="maintenance">Maintenance</option>
              <option value="out_of_service">Out of Service</option>
            </select>
            
            <select
              value={familyFilter}
              onChange={(e) => setFamilyFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Families</option>
              {families.map((family) => (
                <option key={family.id} value={family.id}>{family.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Holders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHolders.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Box className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No holders found matching your criteria</p>
          </div>
        ) : (
          filteredHolders.map((holder) => {
            const StatusIcon = getStatusIcon(holder.status);
            const robName = getROBName(holder.robId);
            
            return (
              <div key={holder.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Box className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{holder.name}</h3>
                      <p className="text-sm text-gray-600">{getFamilyName(holder.familyId)}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setEditingHolder(holder)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit Holder"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteHolder(holder.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Holder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <StatusIcon className="w-4 h-4 text-gray-500" />
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(holder.status)}`}>
                      {holder.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  {robName && (
                    <p className="text-sm text-gray-600">
                      Assigned to: <span className="font-medium">{robName}</span>
                    </p>
                  )}
                  
                  {holder.assignedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Assigned: {holder.assignedAt.toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  {holder.status === 'available' && (
                    <button
                      onClick={() => setShowAssignModal(holder)}
                      className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>Assign</span>
                    </button>
                  )}
                  
                  {holder.status === 'assigned' && (
                    <button
                      onClick={() => handleUnassignFromROB(holder.id)}
                      className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                    >
                      Unassign
                    </button>
                  )}
                  
                  {holder.status === 'maintenance' && (
                    <button
                      onClick={() => handleUpdateHolder(holder.id, { status: 'available' })}
                      className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                    >
                      Mark Available
                    </button>
                  )}
                </div>

                {/* Created Date */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Created: {holder.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Holder Modal */}
      {showCreateModal && (
        <HolderModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateHolder}
          families={families}
        />
      )}

      {/* Edit Holder Modal */}
      {editingHolder && (
        <HolderModal
          holder={editingHolder}
          onClose={() => setEditingHolder(null)}
          onSave={(holderData) => handleUpdateHolder(editingHolder.id, holderData)}
          families={families}
        />
      )}

      {/* Assign to ROB Modal */}
      {showAssignModal && (
        <AssignROBModal
          holder={showAssignModal}
          robs={robs}
          onClose={() => setShowAssignModal(null)}
          onAssign={handleAssignToROB}
        />
      )}
    </div>
  );
};

// Holder Modal Component
interface HolderModalProps {
  holder?: Holder;
  onClose: () => void;
  onSave: (data: any) => void;
  families: any[];
}

const HolderModal: React.FC<HolderModalProps> = ({ holder, onClose, onSave, families }) => {
  const [formData, setFormData] = useState({
    name: holder?.name || '',
    familyId: holder?.familyId || '',
    status: holder?.status || 'available'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {holder ? 'Edit Holder' : 'Create New Holder'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., VW-FB-H001"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Family</label>
              <select
                value={formData.familyId}
                onChange={(e) => setFormData({ ...formData, familyId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Family</option>
                {families.map((family) => (
                  <option key={family.id} value={family.id}>{family.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="out_of_service">Out of Service</option>
              </select>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {holder ? 'Update' : 'Create'}
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

// Assign ROB Modal Component
interface AssignROBModalProps {
  holder: Holder;
  robs: any[];
  onClose: () => void;
  onAssign: (holderId: string, robId: string) => void;
}

const AssignROBModal: React.FC<AssignROBModalProps> = ({ holder, robs, onClose, onAssign }) => {
  const [selectedROB, setSelectedROB] = useState('');

  const availableROBs = robs.filter(rob => rob.currentLoad < rob.capacity && rob.status === 'active');

  const handleAssign = () => {
    if (selectedROB) {
      onAssign(holder.id, selectedROB);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Assign Holder to ROB
          </h2>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Assigning holder: <span className="font-medium">{holder.name}</span>
            </p>
          </div>
          
          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium text-gray-700">Select ROB</label>
            {availableROBs.length === 0 ? (
              <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
                No ROBs available with capacity
              </p>
            ) : (
              <div className="space-y-2">
                {availableROBs.map((rob) => (
                  <label key={rob.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="rob"
                      value={rob.id}
                      checked={selectedROB === rob.id}
                      onChange={(e) => setSelectedROB(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{rob.name}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rob.type === 'SERIAL' ? 'bg-blue-100 text-blue-800' :
                          rob.type === 'MPR' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {rob.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Capacity: {rob.currentLoad}/{rob.capacity} ({Math.round((rob.currentLoad / rob.capacity) * 100)}% used)
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleAssign}
              disabled={!selectedROB}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Assign
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};