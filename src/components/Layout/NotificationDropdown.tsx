import React from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, X, Eye } from 'lucide-react';

interface NotificationDropdownProps {
  onClose: () => void;
  onViewAll: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose, onViewAll }) => {
  // Mock notifications for the dropdown
  const notifications = [
    {
      id: '1',
      type: 'warning',
      title: 'ROB Capacity Alert',
      message: 'ROB-SERIAL-001 is at 90% capacity',
      time: '30 min ago',
      read: false
    },
    {
      id: '2',
      type: 'success',
      title: 'Family Created',
      message: 'New family "AUDI REAR BUMPER" created',
      time: '2 hours ago',
      read: false
    },
    {
      id: '3',
      type: 'info',
      title: 'Maintenance Scheduled',
      message: 'ROB-MPR-001 maintenance tomorrow',
      time: '4 hours ago',
      read: true
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const iconColor = getNotificationColor(notification.type);
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-5 h-5 mt-0.5 ${iconColor}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {notification.time}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={onViewAll}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View All Notifications</span>
          </button>
        </div>
      </div>
    </>
  );
};