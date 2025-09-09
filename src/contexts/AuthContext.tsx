import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@aptiv-m2.com',
    role: 'admin',
    permissions: ['*'],
    createdAt: new Date(),
    lastLogin: new Date()
  },
  {
    id: '2',
    username: 'supervisor',
    email: 'supervisor@aptiv-m2.com',
    role: 'supervisor',
    permissions: ['families:read', 'families:write', 'holders:read', 'holders:write', 'robs:read', 'robs:write'],
    createdAt: new Date(),
    lastLogin: new Date()
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('aptiv_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Mock authentication - in production, this would call your API
    const foundUser = mockUsers.find(u => u.username === username);
    
    if (foundUser && password === 'password') {
      const userWithLastLogin = { ...foundUser, lastLogin: new Date() };
      setUser(userWithLastLogin);
      localStorage.setItem('aptiv_user', JSON.stringify(userWithLastLogin));
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aptiv_user');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, loading }}>
      {children}
    </AuthContext.Provider>
  );
};