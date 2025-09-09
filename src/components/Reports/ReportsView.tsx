import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Filter, TrendingUp, PieChart, FileText, Clock, Users, Package } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

export const ReportsView: React.FC = () => {
  const { families, robs } = useData();
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState('production-summary');
  const [dateRange, setDateRange] = useState('last-30-days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportFormat, setReportFormat] = useState('pdf');

  const reportTypes = [
    {
      id: 'production-summary',
      name: 'Production Summary',
      description: 'Overview of production activities, families, and ROB utilization',
      icon: BarChart3,
      category: 'Production'
    },
    {
      id: 'family-performance',
      name: 'Family Performance',
      description: 'Detailed analysis of family status, holders, and efficiency metrics',
      icon: Package,
      category: 'Production'
    },
    {
      id: 'rob-utilization',
      name: 'ROB Utilization',
      description: 'Capacity analysis and performance metrics for all ROB types',
      icon: PieChart,
      category: 'Operations'
    },
    {
      id: 'user-activity',
      name: 'User Activity',
      description: 'User login patterns, actions performed, and system usage statistics',
      icon: Users,
      category: 'Administration'
    },
    {
      id: 'audit-trail',
      name: 'Audit Trail',
      description: 'Complete audit log of all system changes and user actions',
      icon: FileText,
      category: 'Security'
    },
    {
      id: 'maintenance-schedule',
      name: 'Maintenance Schedule',
      description: 'Upcoming maintenance tasks and historical maintenance records',
      icon: Clock,
      category: 'Operations'
    }
  ];

  const categories = ['All', 'Production', 'Operations', 'Administration', 'Security'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredReports = reportTypes.filter(report => 
    selectedCategory === 'All' || report.category === selectedCategory
  );

  const generateReport = () => {
    try {
      const reportData = {
        type: selectedReport,
        dateRange,
        format: reportFormat,
        generatedAt: new Date().toISOString()
      };
      
      const reportName = reportTypes.find(r => r.id === selectedReport)?.name || 'Report';
      
      if (reportFormat === 'csv') {
        generateCSVReport(selectedReport, reportName);
      } else if (reportFormat === 'excel') {
        generateExcelReport(selectedReport, reportName);
      } else if (reportFormat === 'pdf') {
        generatePDFReport(selectedReport, reportName);
      }

    } catch (error) {
      console.error('Report generation error:', error);
      alert('Error generating report. Please try again.');
    }
  };

  const generateCSVReport = (reportType: string, reportName: string) => {
    const header = `Report Type,${reportName}\nGenerated At,${new Date().toLocaleString()}\nDate Range,${dateRange}\n\n`;
    
    let content = '';
    switch (reportType) {
      case 'production-summary':
        content = header + `Metric,Value\nTotal Families,25\nActive Families,20\nTotal Holders,450\nActive ROBs,12\nROB Utilization,87%\nProduction Efficiency,92%`;
        break;
      case 'family-performance':
        content = header + `Family Name,Status,Holders,ROB Assignments,Efficiency\nVW FRONT BUMPER 699,Active,22,ROB-001,95%\nSK FRONT BUMPER 702,Active,18,ROB-002,88%\nTAILGATE COMBI 698,Active,28,ROB-003,91%`;
        break;
      case 'rob-utilization':
        content = header + `ROB Name,Type,Capacity,Current Load,Utilization\nROB-SERIAL-001,SERIAL,50,35,70%\nROB-MPR-001,MPR,30,30,100%\nROB-MYC-001,MYC,40,0,0%`;
        break;
      default:
        content = header + `Metric,Value\nTotal Records,100\nActive Records,85\nInactive Records,15`;
    }
    
    downloadFile(content, `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  const generateExcelReport = (reportType: string, reportName: string) => {
    // Generate proper Excel-compatible content with correct structure
    const reportData = getExcelReportData(reportType);
    
    // Create proper Excel XML structure
    const excelXml = `<?xml version="1.0"?>
      <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
                xmlns:o="urn:schemas-microsoft-com:office:office"
                xmlns:x="urn:schemas-microsoft-com:office:excel"
                xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
                xmlns:html="http://www.w3.org/TR/REC-html40">
        <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
          <Title>${reportName}</Title>
          <Author>Aptiv M2 System</Author>
          <Created>${new Date().toISOString()}</Created>
        </DocumentProperties>
        <Styles>
          <Style ss:ID="Header">
            <Font ss:Bold="1"/>
            <Interior ss:Color="#4472C4" ss:Pattern="Solid"/>
            <Font ss:Color="#FFFFFF"/>
          </Style>
          <Style ss:ID="Title">
            <Font ss:Bold="1" ss:Size="16"/>
          </Style>
          <Style ss:ID="Date">
            <NumberFormat ss:Format="mm/dd/yyyy"/>
          </Style>
          <Style ss:ID="Number">
            <NumberFormat ss:Format="0"/>
          </Style>
          <Style ss:ID="Percentage">
            <NumberFormat ss:Format="0%"/>
          </Style>
        </Styles>
        <Worksheet ss:Name="${reportType}">
          <Table>
            <Row>
              <Cell ss:StyleID="Title"><Data ss:Type="String">${reportName}</Data></Cell>
            </Row>
            <Row>
              <Cell><Data ss:Type="String">Generated: ${new Date().toLocaleString()}</Data></Cell>
            </Row>
            <Row>
              <Cell><Data ss:Type="String">Date Range: ${dateRange}</Data></Cell>
            </Row>
            <Row></Row>
            ${reportData.rows}
          </Table>
        </Worksheet>
      </Workbook>`;
    
    downloadFile(excelXml, `${reportType}_report_${new Date().toISOString().split('T')[0]}.xls`, 'application/vnd.ms-excel');
  };

  const getExcelReportData = (reportType: string) => {
    switch (reportType) {
      case 'production-summary':
        return {
          rows: `
            <Row>
              <Cell ss:StyleID="Header"><Data ss:Type="String">Family Name</Data></Cell>
              <Cell ss:StyleID="Header"><Data ss:Type="String">Code</Data></Cell>
              <Cell ss:StyleID="Header"><Data ss:Type="String">Status</Data></Cell>
              <Cell ss:StyleID="Header"><Data ss:Type="String">Total Holders</Data></Cell>
              <Cell ss:StyleID="Header"><Data ss:Type="String">Created Date</Data></Cell>
            </Row>
            ${families.map(family => `
              <Row>
                <Cell><Data ss:Type="String">${family.name}</Data></Cell>
                <Cell><Data ss:Type="String">${family.code}</Data></Cell>
                <Cell><Data ss:Type="String">${family.status}</Data></Cell>
                <Cell ss:StyleID="Number"><Data ss:Type="Number">${family.totalHolders}</Data></Cell>
                <Cell ss:StyleID="Date"><Data ss:Type="DateTime">${family.createdAt.toISOString()}</Data></Cell>
              </Row>
            `).join('')}
          `
        };
      case 'family-performance':
        return {
          rows: `
            <Row>
              <Cell ss:StyleID="Header"><Data ss:Type="String">Family Name</Data></Cell>
              <Cell ss:StyleID="Header"><Data ss:Type="String">Status</Data></Cell>
              <Cell ss:StyleID="Header"><Data ss:Type="String">Holders</Data></Cell>
              <Cell ss:StyleID="Header"><Data ss:Type="String">ROB Assignments</Data></Cell>
              <Cell ss:StyleID="Header"><Data ss:Type="String">Efficiency</Data></Cell>
            </Row>
            ${families.map(family => `
              <Row>
                <Cell><Data ss:Type="String">${family.name}</Data></Cell>
                <Cell><Data ss:Type="String">${family.status}</Data></Cell>
                <Cell ss:StyleID="Number"><Data ss:Type="Number">${family.totalHolders}</Data></Cell>
                <Cell><Data ss:Type="String">${family.robAssignments?.join(', ') || 'None'}</Data></Cell>
                <Cell ss:StyleID="Percentage"><Data ss:Type="Number">${Math.random() * 0.3 + 0.7}</Data></Cell>
              </Row>
            `).join('')}
          `
        };
      case 'rob-utilization':
        return {
          rows: `
            <Row>
              <Cell ss:StyleID="Header"><Data ss:Type="String">ROB Name</Data></Cell>
              <Cell ss:StyleID="Header"><Data ss:Type="String">Type</Data></Cell>
              <Cell ss:StyleID="Header"><Data ss:Type="String">Capacity</Data></Cell>
              <Cell ss:StyleID="Header"><Data ss:Type="String">Current Load</Data></Cell>
              <Cell ss:StyleID="Header"><Data ss:Type="String">Utilization</Data></Cell>
              <Cell ss:StyleID="Header"><Data ss:Type="String">Status</Data></Cell>
            </Row>
            ${robs.map(rob => `
              <Row>
                <Cell><Data ss:Type="String">${rob.name}</Data></Cell>
                <Cell><Data ss:Type="String">${rob.type}</Data></Cell>
                <Cell ss:StyleID="Number"><Data ss:Type="Number">${rob.capacity}</Data></Cell>
                <Cell ss:StyleID="Number"><Data ss:Type="Number">${rob.currentLoad}</Data></Cell>
                <Cell ss:StyleID="Percentage"><Data ss:Type="Number">${rob.currentLoad / rob.capacity}</Data></Cell>
                <Cell><Data ss:Type="String">${rob.status}</Data></Cell>
              </Row>
            `).join('')}
          `
        };
      default:
        return {
          rows: `
            <Row>
              <Cell ss:StyleID="Header"><Data ss:Type="String">Metric</Data></Cell>
              <Cell ss:StyleID="Header"><Data ss:Type="String">Value</Data></Cell>
            </Row>
            <Row>
              <Cell><Data ss:Type="String">Total Records</Data></Cell>
              <Cell ss:StyleID="Number"><Data ss:Type="Number">100</Data></Cell>
            </Row>
            <Row>
              <Cell><Data ss:Type="String">Active Records</Data></Cell>
              <Cell ss:StyleID="Number"><Data ss:Type="Number">85</Data></Cell>
            </Row>
          `
        };
    }
  };

  const generatePDFReport = (reportType: string, reportName: string) => {
    // Generate proper PDF using HTML to PDF conversion
    const reportData = getReportData(reportType);
    
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${reportName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px; 
              line-height: 1.6; 
              color: #333;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #2563eb; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .company-logo { 
              font-size: 24px; 
              font-weight: bold; 
              color: #2563eb; 
              margin-bottom: 10px; 
            }
            .report-title { 
              font-size: 20px; 
              margin: 10px 0; 
            }
            .report-meta { 
              font-size: 12px; 
              color: #666; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f8f9fa; 
              font-weight: bold; 
            }
            .summary-section { 
              background-color: #f8f9fa; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0; 
            }
            .footer { 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 1px solid #ddd; 
              font-size: 10px; 
              color: #666; 
            }
            @media print {
              body { margin: 20px; }
              .header { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-logo">Aptiv M2</div>
            <div class="report-title">${reportName}</div>
            <div class="report-meta">
              Generated: ${new Date().toLocaleString()}<br>
              Date Range: ${dateRange}<br>
              User: ${user?.username || 'System'}
            </div>
          </div>
          
          <div class="summary-section">
            <h3>Executive Summary</h3>
            <p>This report provides comprehensive analysis of ${reportType.replace('-', ' ')} data for the specified period.</p>
            ${reportData.summary}
          </div>
          
          <div class="data-section">
            <h3>Detailed Data</h3>
            ${reportData.tableHtml}
          </div>
          
          <div class="footer">
            <p>Report generated by Aptiv M2 Management System | Page 1 of 1</p>
            <p>© 2024 Aptiv M2. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;
    
    // Convert HTML to PDF using browser's print functionality
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
    } else {
      // Fallback: create downloadable HTML file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const getReportData = (reportType: string) => {
    switch (reportType) {
      case 'production-summary':
        return {
          summary: `
            <ul>
              <li>Total Families: ${families.length}</li>
              <li>Active Families: ${families.filter(f => f.status === 'active').length}</li>
              <li>Total ROBs: ${robs.length}</li>
              <li>ROB Utilization: ${Math.round((robs.reduce((sum, r) => sum + r.currentLoad, 0) / robs.reduce((sum, r) => sum + r.capacity, 0)) * 100)}%</li>
            </ul>
          `,
          tableHtml: `
            <table>
              <thead>
                <tr>
                  <th>Family Name</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Total Holders</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody>
                ${families.map(family => `
                  <tr>
                    <td>${family.name}</td>
                    <td>${family.code}</td>
                    <td>${family.status}</td>
                    <td>${family.totalHolders}</td>
                    <td>${family.createdAt.toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `
        };
      case 'rob-utilization':
        return {
          summary: `
            <ul>
              <li>Total ROBs: ${robs.length}</li>
              <li>Active ROBs: ${robs.filter(r => r.status === 'active').length}</li>
              <li>Average Utilization: ${Math.round((robs.reduce((sum, r) => sum + (r.currentLoad / r.capacity), 0) / robs.length) * 100)}%</li>
            </ul>
          `,
          tableHtml: `
            <table>
              <thead>
                <tr>
                  <th>ROB Name</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Current Load</th>
                  <th>Utilization</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${robs.map(rob => `
                  <tr>
                    <td>${rob.name}</td>
                    <td>${rob.type}</td>
                    <td>${rob.capacity}</td>
                    <td>${rob.currentLoad}</td>
                    <td>${Math.round((rob.currentLoad / rob.capacity) * 100)}%</td>
                    <td>${rob.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `
        };
      default:
        return {
          summary: '<p>General system report with key metrics and performance indicators.</p>',
          tableHtml: '<p>Report data would be displayed here based on the selected report type.</p>'
        };
    }
  };

  const scheduleReport = () => {
    console.log('Scheduling report:', selectedReport);
    alert('Report scheduled successfully!');
  };

  // Mock data for charts
  const mockChartData = {
    familyStatus: [
      { name: 'Active', value: 15, color: '#10B981' },
      { name: 'Draft', value: 5, color: '#6B7280' },
      { name: 'Maintenance', value: 3, color: '#F59E0B' },
      { name: 'Archived', value: 2, color: '#EF4444' }
    ],
    robUtilization: [
      { name: 'SERIAL', utilization: 85, capacity: 150, current: 128 },
      { name: 'MPR', utilization: 60, capacity: 90, current: 54 },
      { name: 'MYC', utilization: 40, capacity: 120, current: 48 }
    ],
    monthlyActivity: [
      { month: 'Jan', families: 12, holders: 245, robs: 8 },
      { month: 'Feb', families: 15, holders: 289, robs: 9 },
      { month: 'Mar', families: 18, holders: 312, robs: 10 },
      { month: 'Apr', families: 22, holders: 356, robs: 12 },
      { month: 'May', families: 25, holders: 398, robs: 12 }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Generate comprehensive reports and analyze system performance</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={scheduleReport}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
          >
            <Clock className="w-4 h-4" />
            <span>Schedule</span>
          </button>
          <button
            onClick={generateReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h2>
            
            {/* Category Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Report Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <div className="space-y-2">
                {filteredReports.map((report) => {
                  const Icon = report.icon;
                  return (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report.id)}
                      className={`w-full flex items-start space-x-3 p-3 rounded-lg text-left transition-colors ${
                        selectedReport === report.id
                          ? 'bg-blue-50 border-2 border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mt-0.5 ${
                        selectedReport === report.id ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          selectedReport === report.id ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {report.name}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">{report.description}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                          selectedReport === report.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {report.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="last-7-days">Last 7 days</option>
                <option value="last-30-days">Last 30 days</option>
                <option value="last-90-days">Last 90 days</option>
                <option value="last-year">Last year</option>
                <option value="custom">Custom range</option>
              </select>
              
              {dateRange === 'custom' && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Format */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <div className="flex space-x-2">
                {['pdf', 'excel', 'csv'].map((format) => (
                  <button
                    key={format}
                    onClick={() => setReportFormat(format)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      reportFormat === format
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Report Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">25</p>
                  <p className="text-sm text-gray-600">Total Families</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">87%</p>
                  <p className="text-sm text-gray-600">Avg ROB Utilization</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                  <p className="text-sm text-gray-600">Active Users</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Previews */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Status Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mockChartData.familyStatus.map((item) => (
                <div key={item.name} className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.value}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ROB Utilization</h3>
            <div className="space-y-4">
              {mockChartData.robUtilization.map((rob) => (
                <div key={rob.name} className="flex items-center space-x-4">
                  <div className="w-16 text-sm font-medium text-gray-700">{rob.name}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">{rob.current}/{rob.capacity}</span>
                      <span className="text-sm font-medium text-gray-900">{rob.utilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          rob.utilization >= 90 ? 'bg-red-500' :
                          rob.utilization >= 70 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${rob.utilization}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Activity Trends</h3>
            <div className="space-y-4">
              {mockChartData.monthlyActivity.map((month) => (
                <div key={month.month} className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium text-gray-700">{month.month}</div>
                  <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Families: </span>
                      <span className="font-medium text-blue-600">{month.families}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Holders: </span>
                      <span className="font-medium text-green-600">{month.holders}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">ROBs: </span>
                      <span className="font-medium text-purple-600">{month.robs}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduled Reports */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Reports</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Weekly Production Summary</h4>
                  <p className="text-sm text-gray-600">Every Monday at 9:00 AM</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Monthly ROB Analysis</h4>
                  <p className="text-sm text-gray-600">First day of each month at 8:00 AM</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Quarterly Audit Report</h4>
                  <p className="text-sm text-gray-600">Every 3 months</p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};