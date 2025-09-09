import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col bg-gray-50" style={{ backgroundColor: 'var(--background-secondary)' }}>
      <Header 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        isSidebarOpen={isSidebarOpen}
        onViewChange={onViewChange}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          currentView={currentView}
          onViewChange={onViewChange}
          isOpen={isSidebarOpen}
        />
        
        <main className="flex-1 overflow-auto" style={{ backgroundColor: 'var(--background-secondary)' }}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};