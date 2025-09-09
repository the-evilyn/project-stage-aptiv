import React, { useState } from 'react';
import { HelpCircle, Book, MessageCircle, Mail, Phone, FileText, Search, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

export const HelpSupportView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'getting-started', label: 'Getting Started', icon: Book },
    { id: 'families', label: 'Families Management', icon: FileText },
    { id: 'robs', label: 'ROBs & Holders', icon: FileText },
    { id: 'import-export', label: 'Import/Export', icon: FileText },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: HelpCircle }
  ];

  const helpContent = {
    'getting-started': {
      title: 'Getting Started with Aptiv M2',
      articles: [
        {
          title: 'System Overview',
          content: 'Learn about the core concepts of the Families & ROB management system, including how families, holders, and ROBs work together in the production workflow.'
        },
        {
          title: 'First Login and Navigation',
          content: 'Step-by-step guide to logging in for the first time, understanding the dashboard, and navigating through different modules of the system.'
        },
        {
          title: 'User Roles and Permissions',
          content: 'Understand the different user roles (Admin, Supervisor, Manager, Operator) and what permissions each role has within the system.'
        }
      ]
    },
    'families': {
      title: 'Families Management',
      articles: [
        {
          title: 'Creating a New Family',
          content: 'Complete guide to creating a new product family, including required fields, validation rules, and best practices for naming conventions.'
        },
        {
          title: 'Managing KITs and Specifications',
          content: 'How to add, edit, and manage KITs associated with families, including technical specifications and quantity management.'
        },
        {
          title: 'Family Status Workflow',
          content: 'Understanding the family lifecycle from Draft to Active, including approval processes and status transitions.'
        }
      ]
    },
    'robs': {
      title: 'ROBs & Holders Management',
      articles: [
        {
          title: 'Understanding ROB Types',
          content: 'Detailed explanation of SERIAL (current production), MPR (legacy), and MYC (future planning) ROB types and their specific use cases.'
        },
        {
          title: 'Holder Assignment and Optimization',
          content: 'Best practices for assigning holders to ROBs, understanding capacity constraints, and optimizing resource allocation.'
        },
        {
          title: 'ROB Transitions and Maintenance',
          content: 'How to transition ROBs between different types, schedule maintenance, and handle production interruptions.'
        }
      ]
    },
    'import-export': {
      title: 'Import/Export Operations',
      articles: [
        {
          title: 'Excel Import Process',
          content: 'Step-by-step guide to importing data from Excel files, including template formats, validation rules, and error handling.'
        },
        {
          title: 'Data Export Options',
          content: 'How to export data in various formats, create custom reports, and schedule automated exports.'
        },
        {
          title: 'Data Validation and Error Resolution',
          content: 'Understanding validation errors during import and how to resolve common data quality issues.'
        }
      ]
    },
    'troubleshooting': {
      title: 'Troubleshooting',
      articles: [
        {
          title: 'Common Login Issues',
          content: 'Solutions for login problems, password reset procedures, and session timeout issues.'
        },
        {
          title: 'Performance Optimization',
          content: 'Tips for improving system performance, browser compatibility, and handling large datasets.'
        },
        {
          title: 'Data Synchronization Issues',
          content: 'How to handle data conflicts, synchronization errors, and maintain data integrity across the system.'
        }
      ]
    }
  };

  const faqs = [
    {
      id: '1',
      question: 'How do I reset my password?',
      answer: 'You can reset your password by clicking the "Forgot Password" link on the login page. An email with reset instructions will be sent to your registered email address.'
    },
    {
      id: '2',
      question: 'What is the difference between SERIAL, MPR, and MYC ROBs?',
      answer: 'SERIAL ROBs are used for current production with real-time monitoring. MPR ROBs are legacy systems in read-only mode for historical data. MYC ROBs are used for future planning and resource allocation simulation.'
    },
    {
      id: '3',
      question: 'Can I import data from my existing Excel files?',
      answer: 'Yes, the system supports Excel import with built-in validation. Use the Import/Export module to upload your files and follow the guided import process.'
    },
    {
      id: '4',
      question: 'How do I assign holders to a ROB?',
      answer: 'Go to the ROBs section, select the target ROB, and use the holder assignment interface. The system will show available holders and respect capacity constraints.'
    },
    {
      id: '5',
      question: 'What should I do if I encounter a system error?',
      answer: 'First, try refreshing the page. If the error persists, check your internet connection and contact your system administrator or use the support contact information below.'
    }
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-1">Find answers, guides, and get support for the Aptiv M2 system</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Help Categories</h2>
            <nav className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeCategory === category.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{category.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Contact */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-6">
            <h2 className="font-semibold text-gray-900 mb-4">Quick Contact</h2>
            <div className="space-y-3">
              <a
                href="mailto:support@aptiv-m2.com"
                className="flex items-center space-x-3 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>support@aptiv-m2.com</span>
              </a>
              <a
                href="tel:+33123456789"
                className="flex items-center space-x-3 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>+33 1 23 45 67 89</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-3 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Live Chat</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Help Articles */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {helpContent[activeCategory as keyof typeof helpContent].title}
            </h2>
            <div className="space-y-4">
              {helpContent[activeCategory as keyof typeof helpContent].articles.map((article, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-medium text-gray-900 mb-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm">{article.content}</p>
                  <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1">
                    <span>Read more</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
            </div>
            
            {/* FAQ Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* FAQ List */}
            <div className="space-y-3">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    {expandedFAQ === faq.id ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="px-4 pb-4">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFAQs.length === 0 && searchTerm && (
              <div className="text-center py-8">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No FAQs found matching your search.</p>
              </div>
            )}
          </div>

          {/* Support Ticket */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Need More Help?</h2>
            <p className="text-gray-600 mb-4">
              Can't find what you're looking for? Submit a support ticket and our team will get back to you.
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>Submit Support Ticket</span>
            </button>
          </div>

          {/* System Information */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Version:</span>
                <span className="ml-2 text-gray-600">v1.0.0</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Last Updated:</span>
                <span className="ml-2 text-gray-600">January 2024</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Browser:</span>
                <span className="ml-2 text-gray-600">{navigator.userAgent.split(' ')[0]}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Support Hours:</span>
                <span className="ml-2 text-gray-600">Mon-Fri 8:00-18:00 CET</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};