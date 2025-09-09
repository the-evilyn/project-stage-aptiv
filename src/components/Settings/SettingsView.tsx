import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Database, Bell, Shield, Globe, Palette, Monitor, Eye, CheckCircle, AlertTriangle, X, Upload, Download } from 'lucide-react';

interface SettingsData {
  general: {
    companyName: string;
    address: string;
    city: string;
    country: string;
    contactEmail: string;
    contactPhone: string;
    timezone: string;
    language: string;
    dateFormat: string;
    currency: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    criticalAlertsOnly: boolean;
    maintenanceReminders: boolean;
    reportSchedule: string;
  };
  security: {
    sessionTimeout: number;
    passwordExpiry: number;
    twoFactorAuth: boolean;
    auditLogging: boolean;
    ipWhitelist: string;
  };
  system: {
    backupFrequency: string;
    dataRetention: number;
    performanceMode: string;
    debugMode: boolean;
    maintenanceWindow: string;
  };
  ui: {
    compactMode: boolean;
    showAnimations: boolean;
    sidebarCollapsed: boolean;
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    customCSS: string;
  };
}

interface ValidationError {
  field: string;
  message: string;
}

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SettingsData>({
    general: {
      companyName: 'Aptiv M2',
      address: '123 Industrial Avenue, Manufacturing District',
      city: 'Detroit',
      country: 'United States',
      contactEmail: 'admin@aptiv-m2.com',
      contactPhone: '+1 (555) 123-4567',
      timezone: 'Europe/Paris',
      language: 'fr',
      dateFormat: 'DD/MM/YYYY',
      currency: 'EUR'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      criticalAlertsOnly: false,
      maintenanceReminders: true,
      reportSchedule: 'weekly'
    },
    security: {
      sessionTimeout: 30,
      passwordExpiry: 90,
      twoFactorAuth: false,
      auditLogging: true,
      ipWhitelist: ''
    },
    system: {
      backupFrequency: 'daily',
      dataRetention: 365,
      performanceMode: 'balanced',
      debugMode: false,
      maintenanceWindow: '02:00-04:00'
    },
    ui: {
      compactMode: false,
      showAnimations: true,
      sidebarCollapsed: false,
      primaryColor: '#2563eb',
      secondaryColor: '#10b981',
      logoUrl: '',
      customCSS: ''
    }
  });
  
  const [originalSettings, setOriginalSettings] = useState<SettingsData>(settings);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'validating' | 'saving' | 'success' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasUnsavedChanges(hasChanges);
  }, [settings, originalSettings]);

  // Auto-clear messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const tabs = [
    { id: 'general', label: 'Company Info', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Database },
    { id: 'ui', label: 'Appearance', icon: Palette }
  ];

  const loadSettings = async () => {
    try {
      const savedSettings = localStorage.getItem('aptiv_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        setOriginalSettings(parsed);
        applyUISettings(parsed.ui);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setErrorMessage('Failed to load settings. Using defaults.');
    }
  };

  const updateSetting = (category: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));

    // Clear validation error for this field
    setValidationErrors(prev => prev.filter(error => error.field !== `${category}.${key}`));
  };

  const validateSettings = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Company Information Validation
    if (!settings.general.companyName.trim()) {
      errors.push({ field: 'general.companyName', message: 'Company name is required' });
    } else if (settings.general.companyName.length < 3 || settings.general.companyName.length > 50) {
      errors.push({ field: 'general.companyName', message: 'Company name must be 3-50 characters' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (settings.general.contactEmail && !emailRegex.test(settings.general.contactEmail)) {
      errors.push({ field: 'general.contactEmail', message: 'Please enter a valid email address' });
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (settings.general.contactPhone && !phoneRegex.test(settings.general.contactPhone.replace(/[\s\-\(\)]/g, ''))) {
      errors.push({ field: 'general.contactPhone', message: 'Please enter a valid phone number' });
    }

    // Session timeout validation
    if (settings.security.sessionTimeout < 5 || settings.security.sessionTimeout > 480) {
      errors.push({ field: 'security.sessionTimeout', message: 'Session timeout must be between 5 and 480 minutes' });
    }

    // Password expiry validation
    if (settings.security.passwordExpiry < 30 || settings.security.passwordExpiry > 365) {
      errors.push({ field: 'security.passwordExpiry', message: 'Password expiry must be between 30 and 365 days' });
    }

    // Data retention validation
    if (settings.system.dataRetention < 30 || settings.system.dataRetention > 2555) {
      errors.push({ field: 'system.dataRetention', message: 'Data retention must be between 30 and 2555 days' });
    }

    // Maintenance window validation
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (settings.system.maintenanceWindow && !timeRegex.test(settings.system.maintenanceWindow)) {
      errors.push({ field: 'system.maintenanceWindow', message: 'Maintenance window must be in format HH:MM-HH:MM' });
    }

    // Color validation
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(settings.ui.primaryColor)) {
      errors.push({ field: 'ui.primaryColor', message: 'Primary color must be a valid hex color' });
    }
    if (!hexColorRegex.test(settings.ui.secondaryColor)) {
      errors.push({ field: 'ui.secondaryColor', message: 'Secondary color must be a valid hex color' });
    }

    // IP whitelist validation
    if (settings.security.ipWhitelist) {
      const ips = settings.security.ipWhitelist.split(',').map(ip => ip.trim());
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      for (const ip of ips) {
        if (ip && !ipRegex.test(ip)) {
          errors.push({ field: 'security.ipWhitelist', message: `Invalid IP address: ${ip}` });
          break;
        }
      }
    }

    return errors;
  };

  const applyUISettings = (uiSettings: SettingsData['ui']) => {
    // Apply primary color
    document.documentElement.style.setProperty('--primary-color', uiSettings.primaryColor);
    document.documentElement.style.setProperty('--accent-color', uiSettings.primaryColor);
    
    // Apply secondary color
    document.documentElement.style.setProperty('--secondary-color', uiSettings.secondaryColor);
    
    // Apply compact mode
    if (uiSettings.compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }

    // Apply animations
    if (!uiSettings.showAnimations) {
      document.body.style.setProperty('--animation-duration', '0s');
    } else {
      document.body.style.removeProperty('--animation-duration');
    }

    // Apply custom CSS
    let customStyleElement = document.getElementById('custom-settings-css');
    if (uiSettings.customCSS) {
      if (!customStyleElement) {
        customStyleElement = document.createElement('style');
        customStyleElement.id = 'custom-settings-css';
        document.head.appendChild(customStyleElement);
      }
      customStyleElement.textContent = uiSettings.customCSS;
    } else if (customStyleElement) {
      customStyleElement.remove();
    }
  };

  const previewChanges = () => {
    const errors = validateSettings();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setErrorMessage('Please fix validation errors before previewing changes.');
      return;
    }
    
    setPreviewMode(true);
    applyUISettings(settings.ui);
    
    // Apply company name to document title
    document.title = `${settings.general.companyName} - Management System`;
    
    setSuccessMessage('Preview Mode: Changes are temporary until saved');
    
    setTimeout(() => {
      setPreviewMode(false);
      setSuccessMessage(null);
    }, 10000);
  };

  const validateAndApplySettings = async () => {
    setSaveStatus('validating');
    setValidationErrors([]);
    setErrorMessage(null);
    
    try {
      // Validate all settings
      const errors = validateSettings();
      if (errors.length > 0) {
        setValidationErrors(errors);
        setErrorMessage(`Validation failed: ${errors.length} error(s) found. Please fix the highlighted fields.`);
        setSaveStatus('error');
        return;
      }

      setSaveStatus('saving');
      
      // Simulate database connectivity test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage (simulating database)
      const settingsToSave = {
        ...settings,
        version: Date.now(),
        lastModified: new Date().toISOString(),
        modifiedBy: 'current-user'
      };
      
      localStorage.setItem('aptiv_settings', JSON.stringify(settingsToSave));
      
      // Apply UI changes
      applyUISettings(settings.ui);
      
      // Apply company name to document title
      document.title = `${settings.general.companyName} - Management System`;
      
      // Update original settings to reflect saved state
      setOriginalSettings(settings);
      
      setSaveStatus('success');
      setSuccessMessage('✅ Settings saved successfully! All changes have been applied.');
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setErrorMessage('Failed to save settings. Please check your connection and try again.');
    }
  };

  const resetSettings = async () => {
    if (!window.confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
      return;
    }

    const defaultSettings: SettingsData = {
      general: {
        companyName: 'Aptiv M2',
        address: '123 Industrial Avenue, Manufacturing District',
        city: 'Detroit',
        country: 'United States',
        contactEmail: 'admin@aptiv-m2.com',
        contactPhone: '+1 (555) 123-4567',
        timezone: 'Europe/Paris',
        language: 'fr',
        dateFormat: 'DD/MM/YYYY',
        currency: 'EUR'
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        criticalAlertsOnly: false,
        maintenanceReminders: true,
        reportSchedule: 'weekly'
      },
      security: {
        sessionTimeout: 30,
        passwordExpiry: 90,
        twoFactorAuth: false,
        auditLogging: true,
        ipWhitelist: ''
      },
      system: {
        backupFrequency: 'daily',
        dataRetention: 365,
        performanceMode: 'balanced',
        debugMode: false,
        maintenanceWindow: '02:00-04:00'
      },
      ui: {
        compactMode: false,
        showAnimations: true,
        sidebarCollapsed: false,
        primaryColor: '#2563eb',
        secondaryColor: '#10b981',
        logoUrl: '',
        customCSS: ''
      }
    };
    
    setSettings(defaultSettings);
    setOriginalSettings(defaultSettings);
    setValidationErrors([]);
    
    localStorage.setItem('aptiv_settings', JSON.stringify(defaultSettings));
    applyUISettings(defaultSettings.ui);
    document.title = 'Aptiv M2 - Management System';
    
    setSuccessMessage('✅ Settings reset to default values successfully!');
  };

  const exportSettings = () => {
    try {
      const exportData = {
        settings,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aptiv-settings-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccessMessage('✅ Settings exported successfully!');
    } catch (error) {
      setErrorMessage('Failed to export settings. Please try again.');
    }
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        if (importData.settings) {
          setSettings(importData.settings);
          setSuccessMessage('✅ Settings imported successfully! Click "Validate & Apply Changes" to save.');
        } else {
          setErrorMessage('Invalid settings file format.');
        }
      } catch (error) {
        setErrorMessage('Failed to import settings. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setErrorMessage('Logo file size must be less than 2MB.');
      return;
    }

    setLogoFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      updateSetting('ui', 'logoUrl', e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field);
  };

  const hasFieldError = (field: string) => {
    return validationErrors.some(error => error.field === field);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure system preferences and options
            {hasUnsavedChanges && (
              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                Unsaved changes
              </span>
            )}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportSettings}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          
          <label className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              className="hidden"
            />
          </label>
          
          <button
            onClick={previewChanges}
            disabled={saveStatus === 'saving' || saveStatus === 'validating'}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Changes</span>
          </button>
          
          <button
            onClick={resetSettings}
            disabled={saveStatus === 'saving' || saveStatus === 'validating'}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          
          <button
            onClick={validateAndApplySettings}
            disabled={saveStatus === 'saving' || saveStatus === 'validating'}
            className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              saveStatus === 'saving' || saveStatus === 'validating' ? 'bg-gray-400 cursor-not-allowed' :
              saveStatus === 'success' ? 'bg-green-600 hover:bg-green-700' :
              saveStatus === 'error' ? 'bg-red-600 hover:bg-red-700' :
              hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-700' :
              'bg-gray-400 cursor-not-allowed'
            } text-white`}
          >
            {saveStatus === 'validating' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Validating...</span>
              </>
            ) : saveStatus === 'saving' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveStatus === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Settings Saved!</span>
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>Save Failed - Retry</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Validate & Apply Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Message */}
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

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-3">
            Please fix the following errors:
          </h3>
          <ul className="space-y-2">
            {validationErrors.map((error, index) => (
              <li key={index} className="text-red-700 text-sm">
                • <strong>{error.field.split('.')[1]}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Company Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={settings.general.companyName}
                      onChange={(e) => updateSetting('general', 'companyName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        hasFieldError('general.companyName') 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter company name (3-50 characters)"
                    />
                    {getFieldError('general.companyName') && (
                      <p className="text-red-600 text-sm mt-1">{getFieldError('general.companyName')?.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={settings.general.contactEmail}
                      onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        hasFieldError('general.contactEmail') 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder="admin@company.com"
                    />
                    {getFieldError('general.contactEmail') && (
                      <p className="text-red-600 text-sm mt-1">{getFieldError('general.contactEmail')?.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={settings.general.contactPhone}
                      onChange={(e) => updateSetting('general', 'contactPhone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        hasFieldError('general.contactPhone') 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder="+1 (555) 123-4567"
                    />
                    {getFieldError('general.contactPhone') && (
                      <p className="text-red-600 text-sm mt-1">{getFieldError('general.contactPhone')?.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={settings.general.address}
                      onChange={(e) => updateSetting('general', 'address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Street address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={settings.general.city}
                      onChange={(e) => updateSetting('general', 'city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <select
                      value={settings.general.country}
                      onChange={(e) => updateSetting('general', 'country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="United States">United States</option>
                      <option value="France">France</option>
                      <option value="Germany">Germany</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Europe/Paris">Europe/Paris (CET/CEST)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="America/New_York">America/New_York (EST/EDT)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={settings.general.language}
                      onChange={(e) => updateSetting('general', 'language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="de">Deutsch</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                    <select
                      value={settings.general.dateFormat}
                      onChange={(e) => updateSetting('general', 'dateFormat', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={settings.general.currency}
                      onChange={(e) => updateSetting('general', 'currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Push Notifications</h3>
                      <p className="text-sm text-gray-600">Receive browser push notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.pushNotifications}
                        onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Critical Alerts Only</h3>
                      <p className="text-sm text-gray-600">Only receive high-priority notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.criticalAlertsOnly}
                        onChange={(e) => updateSetting('notifications', 'criticalAlertsOnly', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Maintenance Reminders</h3>
                      <p className="text-sm text-gray-600">Get notified about scheduled maintenance</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.maintenanceReminders}
                        onChange={(e) => updateSetting('notifications', 'maintenanceReminders', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Schedule</label>
                    <select
                      value={settings.notifications.reportSchedule}
                      onChange={(e) => updateSetting('notifications', 'reportSchedule', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes) *
                    </label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        hasFieldError('security.sessionTimeout') 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                      min="5"
                      max="480"
                      placeholder="5-480 minutes"
                    />
                    {getFieldError('security.sessionTimeout') && (
                      <p className="text-red-600 text-sm mt-1">{getFieldError('security.sessionTimeout')?.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Expiry (days) *
                    </label>
                    <input
                      type="number"
                      value={settings.security.passwordExpiry}
                      onChange={(e) => updateSetting('security', 'passwordExpiry', parseInt(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        hasFieldError('security.passwordExpiry') 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                      min="30"
                      max="365"
                      placeholder="30-365 days"
                    />
                    {getFieldError('security.passwordExpiry') && (
                      <p className="text-red-600 text-sm mt-1">{getFieldError('security.passwordExpiry')?.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IP Whitelist</label>
                  <textarea
                    value={settings.security.ipWhitelist}
                    onChange={(e) => updateSetting('security', 'ipWhitelist', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      hasFieldError('security.ipWhitelist') 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    rows={3}
                    placeholder="192.168.1.1, 10.0.0.1 (comma-separated)"
                  />
                  {getFieldError('security.ipWhitelist') && (
                    <p className="text-red-600 text-sm mt-1">{getFieldError('security.ipWhitelist')?.message}</p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600">Require 2FA for all users</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Audit Logging</h3>
                      <p className="text-sm text-gray-600">Log all user actions for security audits</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.auditLogging}
                        onChange={(e) => updateSetting('security', 'auditLogging', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                    <select
                      value={settings.system.backupFrequency}
                      onChange={(e) => updateSetting('system', 'backupFrequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Retention (days) *
                    </label>
                    <input
                      type="number"
                      value={settings.system.dataRetention}
                      onChange={(e) => updateSetting('system', 'dataRetention', parseInt(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        hasFieldError('system.dataRetention') 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                      min="30"
                      max="2555"
                      placeholder="30-2555 days"
                    />
                    {getFieldError('system.dataRetention') && (
                      <p className="text-red-600 text-sm mt-1">{getFieldError('system.dataRetention')?.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Performance Mode</label>
                    <select
                      value={settings.system.performanceMode}
                      onChange={(e) => updateSetting('system', 'performanceMode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="performance">High Performance</option>
                      <option value="balanced">Balanced</option>
                      <option value="efficiency">High Efficiency</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance Window
                    </label>
                    <input
                      type="text"
                      value={settings.system.maintenanceWindow}
                      onChange={(e) => updateSetting('system', 'maintenanceWindow', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        hasFieldError('system.maintenanceWindow') 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder="HH:MM-HH:MM (e.g., 02:00-04:00)"
                    />
                    {getFieldError('system.maintenanceWindow') && (
                      <p className="text-red-600 text-sm mt-1">{getFieldError('system.maintenanceWindow')?.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Debug Mode</h3>
                    <p className="text-sm text-gray-600">Enable detailed logging for troubleshooting</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.system.debugMode}
                      onChange={(e) => updateSetting('system', 'debugMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'ui' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Appearance Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color *
                    </label>
                    <div className="flex space-x-3">
                      <input
                        type="color"
                        value={settings.ui.primaryColor}
                        onChange={(e) => updateSetting('ui', 'primaryColor', e.target.value)}
                        className="w-16 h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={settings.ui.primaryColor}
                        onChange={(e) => updateSetting('ui', 'primaryColor', e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          hasFieldError('ui.primaryColor') 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        placeholder="#2563eb"
                      />
                    </div>
                    {getFieldError('ui.primaryColor') && (
                      <p className="text-red-600 text-sm mt-1">{getFieldError('ui.primaryColor')?.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color *
                    </label>
                    <div className="flex space-x-3">
                      <input
                        type="color"
                        value={settings.ui.secondaryColor}
                        onChange={(e) => updateSetting('ui', 'secondaryColor', e.target.value)}
                        className="w-16 h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={settings.ui.secondaryColor}
                        onChange={(e) => updateSetting('ui', 'secondaryColor', e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          hasFieldError('ui.secondaryColor') 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        placeholder="#10b981"
                      />
                    </div>
                    {getFieldError('ui.secondaryColor') && (
                      <p className="text-red-600 text-sm mt-1">{getFieldError('ui.secondaryColor')?.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                  <div className="flex items-center space-x-4">
                    {settings.ui.logoUrl && (
                      <img 
                        src={settings.ui.logoUrl} 
                        alt="Company Logo" 
                        className="w-16 h-16 object-contain border border-gray-300 rounded-lg"
                      />
                    )}
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                      <Upload className="w-4 h-4 inline mr-2" />
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {settings.ui.logoUrl && (
                      <button
                        onClick={() => updateSetting('ui', 'logoUrl', '')}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Maximum file size: 2MB. Supported formats: JPG, PNG, SVG</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom CSS</label>
                  <textarea
                    value={settings.ui.customCSS}
                    onChange={(e) => updateSetting('ui', 'customCSS', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    rows={6}
                    placeholder="/* Custom CSS rules */
.custom-header {
  background-color: #f0f0f0;
}"
                  />
                  <p className="text-xs text-gray-500 mt-1">Advanced: Add custom CSS to override default styles</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Compact Mode</h3>
                      <p className="text-sm text-gray-600">Use smaller spacing and components</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.ui.compactMode}
                        onChange={(e) => updateSetting('ui', 'compactMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Show Animations</h3>
                      <p className="text-sm text-gray-600">Enable smooth transitions and animations</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.ui.showAnimations}
                        onChange={(e) => updateSetting('ui', 'showAnimations', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Sidebar Collapsed</h3>
                      <p className="text-sm text-gray-600">Start with sidebar collapsed by default</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.ui.sidebarCollapsed}
                        onChange={(e) => updateSetting('ui', 'sidebarCollapsed', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};