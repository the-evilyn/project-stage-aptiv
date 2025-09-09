import React, { useState } from 'react';
import { Bell, Search, User, LogOut, Settings, Menu, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
  onViewChange: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isSidebarOpen, onViewChange }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    // Detect system theme preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  React.useEffect(() => {
    // Apply theme to document
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Legacy support for existing dark mode classes
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Listen for system theme changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no manual preference is stored
      const saved = localStorage.getItem('theme');
      if (!saved) {
        setIsDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performDirectSearch(searchQuery.trim());
    }
  };

  const performDirectSearch = async (query: string) => {
    try {
      // Mock search implementation - replace with actual API call
      const mockResults = [
        { id: '1', name: 'VW FRONT BUMPER 699', type: 'Family', status: 'active' },
        { id: '2', name: 'ROB-SERIAL-001', type: 'ROB', status: 'active' },
        { id: '3', name: 'VW-FB-H001', type: 'Holder', status: 'assigned' }
      ].filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(mockResults);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowSearchResults(true);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim().length > 2) {
      performDirectSearch(value.trim());
    } else {
      setShowSearchResults(false);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-6 sticky top-0 z-30 transition-colors duration-300">
      <div className="flex items-center justify-between w-full">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Aptiv M2</h1>
              <p className="text-xs text-gray-500">Families & ROB System</p>
            </div>
          </div>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full" onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}>
            <form onSubmit={handleSearch}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search families, holders, ROBs..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
              />
            </form>
            
            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No results found
                  </div>
                ) : (
                  searchResults.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      onClick={() => {
                        setShowSearchResults(false);
                        setSearchQuery('');
                        // Navigate to specific item
                        if (result.type === 'Family') onViewChange('families');
                        else if (result.type === 'ROB') onViewChange('robs');
                        else if (result.type === 'Holder') onViewChange('holders');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{result.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{result.type}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          result.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          result.status === 'assigned' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {result.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-300"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <div className="relative w-5 h-5">
              <Sun className={`absolute inset-0 w-5 h-5 text-yellow-500 transition-all duration-300 ${
                isDarkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
              }`} />
              <Moon className={`absolute inset-0 w-5 h-5 text-blue-400 transition-all duration-300 ${
                isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
              }`} />
            </div>
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            {showNotifications && (
              <NotificationDropdown 
                onClose={() => setShowNotifications(false)}
                onViewAll={() => {
                  setShowNotifications(false);
                  onViewChange('notifications');
                }}
              />
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.username}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">
                    {user?.role}
                  </span>
                </div>
                
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    onViewChange('settings');
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
                
                <button
                  onClick={logout}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};