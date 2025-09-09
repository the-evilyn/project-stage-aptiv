import React, { useState } from 'react';
import { Cpu, Plus, Activity, Pause, Settings, ArrowRightLeft } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { ROB, ROBType } from '../../types';

export const ROBsView: React.FC = () => {
  const { robs, createROB, updateROB } = useData();
  const [selectedType, setSelectedType] = useState<ROBType | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingROB, setEditingROB] = useState<ROB | null>(null);

  const filteredROBs = selectedType === 'ALL' 
    ? robs 
    : robs.filter(rob => rob.type === selectedType);

  const getTypeColor = (type: ROBType) => {
    switch (type) {
      case 'SERIAL': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MPR': return 'bg-green-100 text-green-800 border-green-200';
      case 'MYC': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'stopped': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ROBs Management</h1>
          <p className="text-gray-600 mt-1">Robot Operating Blocks - Production Control Centers</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New ROB</span>
        </button>
      </div>

      {/* Type Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'SERIAL', 'MPR', 'MYC'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'ALL' ? 'All ROBs' : `${type} ROBs`}
              <span className="ml-2 text-xs">
                ({type === 'ALL' ? robs.length : robs.filter(r => r.type === type).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ROBs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredROBs.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Cpu className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No ROBs found for the selected type</p>
          </div>
        ) : (
          filteredROBs.map((rob) => (
            <ROBCard 
              key={rob.id} 
              rob={rob} 
              onEdit={setEditingROB}
              onUpdate={updateROB}
            />
          ))
        )}
      </div>

      {/* Create ROB Modal */}
      {showCreateModal && (
        <ROBModal
          onClose={() => setShowCreateModal(false)}
          onSave={createROB}
        />
      )}

      {/* Edit ROB Modal */}
      {editingROB && (
        <ROBModal
          rob={editingROB}
          onClose={() => setEditingROB(null)}
          onSave={(data) => updateROB(editingROB.id, data)}
        />
      )}
    </div>
  );
};

// ROB Card Component
interface ROBCardProps {
  rob: ROB;
  onEdit: (rob: ROB) => void;
  onUpdate: (id: string, data: Partial<ROB>) => void;
}

const ROBCard: React.FC<ROBCardProps> = ({ rob, onEdit, onUpdate }) => {
  const utilization = rob.capacity > 0 ? (rob.currentLoad / rob.capacity) * 100 : 0;

  const toggleStatus = () => {
    const newStatus = rob.status === 'active' ? 'inactive' : 'active';
    onUpdate(rob.id, { status: newStatus });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Cpu className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{rob.name}</h3>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${
              rob.type === 'SERIAL' ? 'bg-blue-100 text-blue-800 border-blue-200' :
              rob.type === 'MPR' ? 'bg-green-100 text-green-800 border-green-200' :
              'bg-yellow-100 text-yellow-800 border-yellow-200'
            }`}>
              {rob.type}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(rob)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status & Utilization */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status</span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            rob.status === 'active' ? 'bg-green-100 text-green-800' :
            rob.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
            rob.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {rob.status}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Capacity</span>
            <span className="text-sm font-medium text-gray-900">
              {rob.currentLoad} / {rob.capacity}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                utilization >= 90 ? 'bg-red-500' :
                utilization >= 70 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
          <div className="text-right">
            <span className={`text-xs font-medium ${
              utilization >= 90 ? 'text-red-600' :
              utilization >= 70 ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {utilization.toFixed(1)}% utilized
            </span>
          </div>
        </div>
      </div>

      {/* Type-specific Information */}
      <div className="border-t border-gray-200 pt-4">
        {rob.type === 'SERIAL' && (
          <div className="text-sm text-gray-600">
            <p>Production Mode: Real-time</p>
            <p>Last Updated: {new Date(rob.updatedAt).toLocaleString()}</p>
          </div>
        )}
        {rob.type === 'MPR' && (
          <div className="text-sm text-gray-600">
            <p>Legacy System: Read-only</p>
            <p>Historical Data Available</p>
          </div>
        )}
        {rob.type === 'MYC' && (
          <div className="text-sm text-gray-600">
            <p>Planning Mode: Future Allocation</p>
            <p>Simulation Ready</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2 mt-4">
        <button
          onClick={toggleStatus}
          disabled={rob.type === 'MPR'}
          className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            rob.status === 'active'
              ? 'bg-red-50 text-red-700 hover:bg-red-100'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          } ${rob.type === 'MPR' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {rob.status === 'active' ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Activity className="w-4 h-4" />
              <span>Activate</span>
            </>
          )}
        </button>
        
        <button
          onClick={() => onEdit(rob)}
          className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Manage</span>
        </button>
      </div>
    </div>
  );
};

// ROB Modal Component
interface ROBModalProps {
  rob?: ROB;
  onClose: () => void;
  onSave: (data: any) => void;
}

const ROBModal: React.FC<ROBModalProps> = ({ rob, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: rob?.name || '',
    type: rob?.type || 'SERIAL' as ROBType,
    capacity: rob?.capacity || 50,
    status: rob?.status || 'inactive'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      currentLoad: rob?.currentLoad || 0,
      assignedHolders: rob?.assignedHolders || []
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {rob ? 'Edit ROB' : 'Create New ROB'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ROBType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!!rob} // Disable type change for existing ROBs
              >
                <option value="SERIAL">SERIAL - Current Production</option>
                <option value="MPR">MPR - Legacy System</option>
                <option value="MYC">MYC - Future Planning</option>
              </select>
              {rob && (
                <p className="text-xs text-gray-500 mt-1">Type cannot be changed after creation</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="200"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
                <option value="stopped">Stopped</option>
              </select>
            </div>
            
            {/* Type-specific warnings */}
            {formData.type === 'MPR' && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>MPR ROBs</strong> are legacy systems with read-only access for historical data.
                </p>
              </div>
            )}
            
            {formData.type === 'MYC' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>MYC ROBs</strong> are used for future planning and resource allocation.
                </p>
              </div>
            )}
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {rob ? 'Update' : 'Create'}
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