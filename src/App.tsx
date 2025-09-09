import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { LoginPage } from './components/Auth/LoginPage';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { FamiliesView } from './components/Families/FamiliesView';
import { ROBsView } from './components/ROBs/ROBsView';
import { ImportExportView } from './components/ImportExport/ImportExportView';
import { AdvancedSearchView } from './components/Search/AdvancedSearchView';
import { NotificationsView } from './components/Notifications/NotificationsView';
import { UserManagementView } from './components/Users/UserManagementView';
import { SettingsView } from './components/Settings/SettingsView';
import { HelpSupportView } from './components/Help/HelpSupportView';
import { ReportsView } from './components/Reports/ReportsView';
import { HoldersView } from './components/Holders/HoldersView';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'families':
        return <FamiliesView />;
      case 'robs':
        return <ROBsView />;
      case 'import-export':
        return <ImportExportView />;
      case 'search':
        return <AdvancedSearchView />;
      case 'holders':
        return <HoldersView />;
      case 'reports':
        return <ReportsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'users':
        return <UserManagementView />;
      case 'settings':
        return <SettingsView />;
      case 'help':
        return <HelpSupportView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;