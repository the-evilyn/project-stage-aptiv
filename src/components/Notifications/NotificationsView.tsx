import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, X, AlertTriangle, Info, CheckCircle, AlertCircle, Trash2, Filter, Search, RefreshCw, Undo } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Notification } from '../../types';

export const NotificationsView: React.FC = () => {
  const { } = useData();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [operationLoading, setOperationLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<Array<{id: string, action: string, previousState: any}>>([]);

  // Mock notifications data with more comprehensive structure
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'ROB Capacity Alert',
      message: 'ROB-SERIAL-001 is at 90% capacity. Consider redistributing holders.',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      id: '2',
      type: 'success',
      title: 'Family Created Successfully',
      message: 'New family "AUDI REAR BUMPER" has been created and is ready for configuration.',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
      id: '3',
      type: 'error',
      title: 'Import Failed',
      message: 'Excel import failed due to validation errors in rows 15-20. Please check the data format.',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
    },
    {
      id: '4',
      type: 'info',
      title: 'Maintenance Scheduled',
      message: 'ROB-MPR-001 is scheduled for maintenance tomorrow at 14:00.',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    },
    {
      id: '5',
      type: 'warning',
      title: 'Holder Assignment Conflict',
      message: 'Holder H-001 cannot be assigned to ROB-MYC-001 due to capacity constraints.',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
    },
    {
      id: '6',
      type: 'success',
      title: 'Backup Completed',
      message: 'Daily system backup completed successfully at 02:00 AM.',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 hours ago
    },
    {
      id: '7',
      type: 'info',
      title: 'System Update Available',
      message: 'A new system update (v2.1.3) is available. Schedule installation during maintenance window.',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8) // 8 hours ago
    }
  ]);

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'read' && notification.read) || 
      (filter === 'unread' && !notification.read);
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesType && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // In production, this would fetch new notifications from API
      console.log('Auto-refreshing notifications...');
      // Simulate new notification occasionally
      if (Math.random() > 0.9) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: 'info',
          title: 'New System Alert',
          message: 'Auto-generated notification for testing.',
          read: false,
          createdAt: new Date()
        };
        setNotifications(prev => [newNotification, ...prev]);
        showSuccessMessage('New notification received');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setError(null);
  };

  const showError = (message: string) => {
    setError(message);
    setSuccessMessage(null);
  };

  const simulateAPICall = (duration: number = 1000): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, duration);
    });
  };

  const setOperationLoadingState = (id: string, loading: boolean) => {
    setOperationLoading(prev => ({
      ...prev,
      [id]: loading
    }));
  };

  const markAsRead = async (id: string, showUndo: boolean = true) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification || notification.read) return;

    setOperationLoadingState(`read-${id}`, true);
    
    try {
      await simulateAPICall(800);
      
      // Store for undo functionality
      if (showUndo) {
        setUndoStack(prev => [...prev, {
          id,
          action: 'markAsRead',
          previousState: { read: false }
        }]);
      }
      
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      
      if (showUndo) {
        showSuccessMessage('Notification marked as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showError('Failed to mark notification as read. Please try again.');
    } finally {
      setOperationLoadingState(`read-${id}`, false);
    }
  };

  const markAsUnread = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification || !notification.read) return;

    setOperationLoadingState(`unread-${id}`, true);
    
    try {
      await simulateAPICall(500);
      
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: false } : n
      ));
      
      showSuccessMessage('Notification marked as unread');
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      showError('Failed to mark notification as unread. Please try again.');
    } finally {
      setOperationLoadingState(`unread-${id}`, false);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    setOperationLoadingState(`delete-${id}`, true);
    
    try {
      await simulateAPICall(600);
      
      setNotifications(prev => prev.filter(n => n.id !== id));
      setSelectedNotifications(prev => prev.filter(nId => nId !== id));
      
      showSuccessMessage('Notification deleted successfully');
    } catch (error) {
      console.error('Error deleting notification:', error);
      showError('Failed to delete notification. Please try again.');
    } finally {
      setOperationLoadingState(`delete-${id}`, false);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = filteredNotifications.filter(n => !n.read);
    
    if (unreadNotifications.length === 0) {
      showError('No unread notifications to mark as read');
      return;
    }

    if (!window.confirm(`Mark ${unreadNotifications.length} notifications as read?`)) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate batch operation with progress
      for (let i = 0; i < unreadNotifications.length; i++) {
        await simulateAPICall(200);
        
        setNotifications(prev => prev.map(n => 
          n.id === unreadNotifications[i].id ? { ...n, read: true } : n
        ));
      }
      
      showSuccessMessage(`${unreadNotifications.length} notifications marked as read`);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showError('Failed to mark all notifications as read. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSelected = async () => {
    if (selectedNotifications.length === 0) {
      showError('Please select notifications to delete');
      return;
    }
    
    if (!window.confirm(`Delete ${selectedNotifications.length} selected notifications? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate batch delete with progress
      for (let i = 0; i < selectedNotifications.length; i++) {
        await simulateAPICall(300);
        
        setNotifications(prev => prev.filter(n => n.id !== selectedNotifications[i]));
      }
      
      const deletedCount = selectedNotifications.length;
      setSelectedNotifications([]);
      
      showSuccessMessage(`${deletedCount} notifications deleted successfully`);
    } catch (error) {
      console.error('Error deleting selected notifications:', error);
      showError('Failed to delete selected notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const selectAllNotifications = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const undoLastAction = () => {
    const lastAction = undoStack[undoStack.length - 1];
    if (!lastAction) return;

    if (lastAction.action === 'markAsRead') {
      markAsUnread(lastAction.id);
    }

    setUndoStack(prev => prev.slice(0, -1));
  };

  const refreshNotifications = async () => {
    setIsLoading(true);
    try {
      await simulateAPICall(1000);
      // In production, this would fetch fresh data from API
      showSuccessMessage('Notifications refreshed');
    } catch (error) {
      showError('Failed to refresh notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertCircle;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay updated with system alerts and important messages
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {undoStack.length > 0 && (
            <button
              onClick={undoLastAction}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
            >
              <Undo className="w-4 h-4" />
              <span>Undo</span>
            </button>
          )}
          
          <button
            onClick={refreshNotifications}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Mark All Read</span>
                </>
              )}
            </button>
          )}
          
          {selectedNotifications.length > 0 && (
            <button
              onClick={deleteSelected}
              disabled={isLoading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Selected ({selectedNotifications.length})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {filteredNotifications.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedNotifications.length === filteredNotifications.length}
                onChange={selectAllNotifications}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                Select All ({filteredNotifications.length})
                {selectedNotifications.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    - {selectedNotifications.length} selected
                  </span>
                )}
              </span>
            </label>
          </div>
        )}
        
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-600">
              {searchTerm || filter !== 'all' || typeFilter !== 'all' 
                ? 'Try adjusting your filters to see more notifications.'
                : 'You\'re all caught up! New notifications will appear here.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);
              const isOperationLoading = operationLoading[`read-${notification.id}`] || 
                                       operationLoading[`delete-${notification.id}`] ||
                                       operationLoading[`unread-${notification.id}`];
              
              return (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  } ${isOperationLoading ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="pt-2">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => toggleSelectNotification(notification.id)}
                        disabled={isOperationLoading}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-lg font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            {notification.createdAt.toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read ? (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              disabled={isOperationLoading}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Mark as read"
                            >
                              {operationLoading[`read-${notification.id}`] ? (
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => markAsUnread(notification.id)}
                              disabled={isOperationLoading}
                              className="p-2 text-gray-400 hover:text-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Mark as unread"
                            >
                              {operationLoading[`unread-${notification.id}`] ? (
                                <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Bell className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            disabled={isOperationLoading}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete notification"
                          >
                            {operationLoading[`delete-${notification.id}`] ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Push Notifications</h3>
              <p className="text-sm text-gray-600">Receive browser push notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Critical Alerts Only</h3>
              <p className="text-sm text-gray-600">Only receive high-priority notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};