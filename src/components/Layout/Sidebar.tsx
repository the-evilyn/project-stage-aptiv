import React from 'react';
import { 
  Home, 
  Package, 
  Box, 
  Cpu, 
  Settings, 
  Users, 
  FileText, 
  BarChart3,
  Search,
  Bell,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  permission?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home
  },
  {
    id: 'families',
    label: 'Families',
    icon: Package,
    permission: 'families:read'
  },
  {
    id: 'holders',
    label: 'Holders',
    icon: Box,
    permission: 'holders:read'
  },
  {
    id: 'robs',
    label: 'ROBs',
    icon: Cpu,
    permission: 'robs:read'
  },
  {
    id: 'search',
    label: 'Advanced Search',
    icon: Search
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3
  },
  {
    id: 'import-export',
    label: 'Import/Export',
    icon: FileText
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell
  },
  {
    id: 'users',
    label: 'User Management',
    icon: Users,
    permission: 'users:read'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: HelpCircle
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isOpen }) => {
  const { hasPermission } = useAuth();

  const renderNavItem = (item: NavItem) => {
    if (item.permission && !hasPermission(item.permission)) {
      return null;
    }

    const Icon = item.icon;
    const isActive = currentView === item.id;

    return (
      <button
        key={item.id}
        onClick={() => onViewChange(item.id)}
        className={`
          w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors text-sm font-medium
          ${isActive 
            ? 'text-blue-700 border-r-2 border-blue-500' 
            : 'hover:bg-gray-100'
          }
        `}
        style={{
          backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
          color: isActive ? 'var(--accent-color)' : 'var(--text-primary)'
        }}
      >
        <Icon className="w-5 h-5" />
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <aside className={`
      sidebar border-r transition-all duration-300 flex flex-col
      ${isOpen ? 'w-64' : 'w-16'}
      fixed lg:relative inset-y-0 left-0 z-20 lg:z-auto
    `} style={{ backgroundColor: 'var(--sidebar-background)', borderColor: 'var(--border-color)' }}>
      {/* Sidebar content */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {navItems.map(item => renderNavItem(item))}
        </nav>
      </div>
      </div>
      
      {/* Collapsed sidebar for desktop */}
      <div className={`${!isOpen ? 'block' : 'hidden'} lg:hidden`}>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {navItems.map(item => {
              if (item.permission && !hasPermission(item.permission)) {
                return null;
              }
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`
                    w-full flex items-center justify-center p-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};