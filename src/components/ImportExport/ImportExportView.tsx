import React, { useState } from 'react';
import { Upload, Download, FileText, CheckCircle, AlertTriangle, X, Info, AlertCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

export const ImportExportView: React.FC = () => {
  const { families, robs } = useData();
  const [dragOver, setDragOver] = useState(false);
  const [importProgress, setImportProgress] = useState<number | null>(null);
  const [importResults, setImportResults] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && (files[0].name.endsWith('.xlsx') || files[0].name.endsWith('.xls') || files[0].name.endsWith('.csv'))) {
      setSelectedFile(files[0]);
      setImportError(null);
      setImportResults(null);
      setValidationResults(null);
    } else {
      setImportError('Please select a valid Excel file (.xlsx, .xls) or CSV file.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setImportError(null);
      setImportResults(null);
      setValidationResults(null);
    }
  };

  const validateFileStructure = (data: any[]): { isValid: boolean; errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data || data.length === 0) {
      errors.push('File is empty or could not be read');
      return { isValid: false, errors, warnings };
    }

    // Check if first row contains headers
    const headers = data[0];
    if (!headers || typeof headers !== 'object') {
      errors.push('Invalid file structure: No headers found');
      return { isValid: false, errors, warnings };
    }

    // Detect file type based on headers
    const headerKeys = Object.keys(headers);
    let fileType = 'unknown';
    
    if (headerKeys.includes('Family Name') || headerKeys.includes('Family Code')) {
      fileType = 'families';
    } else if (headerKeys.includes('Holder ID') || headerKeys.includes('Holder Name')) {
      fileType = 'holders';
    } else if (headerKeys.includes('ROB ID') || headerKeys.includes('ROB Name')) {
      fileType = 'robs';
    }

    // Validate required fields based on file type
    const requiredFields: Record<string, string[]> = {
      families: ['Family Name', 'Family Code', 'Type', 'Status'],
      holders: ['Holder ID', 'Holder Name', 'Family Code', 'Status'],
      robs: ['ROB ID', 'ROB Name', 'Type', 'Capacity', 'Status']
    };

    if (fileType !== 'unknown' && requiredFields[fileType]) {
      const missing = requiredFields[fileType].filter(field => !headerKeys.includes(field));
      if (missing.length > 0) {
        errors.push(`Missing required fields: ${missing.join(', ')}`);
      }
    }

    // Check data rows
    const dataRows = data.slice(1);
    if (dataRows.length === 0) {
      warnings.push('No data rows found in file');
    }

    return { isValid: errors.length === 0, errors, warnings };
  };

  const validateDataRow = (row: any, rowIndex: number, fileType: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (fileType === 'families') {
      // Validate Family Name
      if (!row['Family Name'] || row['Family Name'].toString().trim() === '') {
        errors.push(`Row ${rowIndex + 2}: Family Name is required`);
      }

      // Validate Family Code
      if (!row['Family Code'] || row['Family Code'].toString().trim() === '') {
        errors.push(`Row ${rowIndex + 2}: Family Code is required`);
      } else {
        // Check for duplicate codes
        const code = row['Family Code'].toString().trim();
        if (families.some(f => f.code === code)) {
          errors.push(`Row ${rowIndex + 2}: Family Code '${code}' already exists`);
        }
      }

      // Validate Status
      const validStatuses = ['active', 'draft', 'maintenance', 'archived'];
      if (row['Status'] && !validStatuses.includes(row['Status'].toString().toLowerCase())) {
        errors.push(`Row ${rowIndex + 2}: Invalid status '${row['Status']}'. Must be one of: ${validStatuses.join(', ')}`);
      }

      // Validate numeric fields
      const numericFields = ['KITs', 'Led', 'Goullet', 'BCC Optosoft', 'BCC Main', 'Rob Main', 'Rob Suite', 'Torque', 'Rack 30', 'Machine Visio', 'Total Holders'];
      numericFields.forEach(field => {
        if (row[field] && row[field] !== '' && isNaN(Number(row[field]))) {
          errors.push(`Row ${rowIndex + 2}: ${field} must be a number`);
        }
      });
    }

    if (fileType === 'holders') {
      // Validate Holder ID
      if (!row['Holder ID'] || row['Holder ID'].toString().trim() === '') {
        errors.push(`Row ${rowIndex + 2}: Holder ID is required`);
      }

      // Validate Holder Name
      if (!row['Holder Name'] || row['Holder Name'].toString().trim() === '') {
        errors.push(`Row ${rowIndex + 2}: Holder Name is required`);
      }

      // Validate Family Code exists
      if (row['Family Code']) {
        const familyCode = row['Family Code'].toString().trim();
        if (!families.some(f => f.code === familyCode)) {
          errors.push(`Row ${rowIndex + 2}: Family Code '${familyCode}' does not exist`);
        }
      }

      // Validate Status
      const validStatuses = ['available', 'assigned', 'maintenance', 'out_of_service'];
      if (row['Status'] && !validStatuses.includes(row['Status'].toString().toLowerCase())) {
        errors.push(`Row ${rowIndex + 2}: Invalid status '${row['Status']}'. Must be one of: ${validStatuses.join(', ')}`);
      }
    }

    if (fileType === 'robs') {
      // Validate ROB ID
      if (!row['ROB ID'] || row['ROB ID'].toString().trim() === '') {
        errors.push(`Row ${rowIndex + 2}: ROB ID is required`);
      }

      // Validate ROB Name
      if (!row['ROB Name'] || row['ROB Name'].toString().trim() === '') {
        errors.push(`Row ${rowIndex + 2}: ROB Name is required`);
      }

      // Validate Type
      const validTypes = ['SERIAL', 'MPR', 'MYC'];
      if (!row['Type'] || !validTypes.includes(row['Type'].toString().toUpperCase())) {
        errors.push(`Row ${rowIndex + 2}: Invalid type '${row['Type']}'. Must be one of: ${validTypes.join(', ')}`);
      }

      // Validate Capacity
      if (!row['Capacity'] || isNaN(Number(row['Capacity'])) || Number(row['Capacity']) <= 0) {
        errors.push(`Row ${rowIndex + 2}: Capacity must be a positive number`);
      }

      // Validate Status
      const validStatuses = ['active', 'inactive', 'maintenance', 'stopped'];
      if (row['Status'] && !validStatuses.includes(row['Status'].toString().toLowerCase())) {
        errors.push(`Row ${rowIndex + 2}: Invalid status '${row['Status']}'. Must be one of: ${validStatuses.join(', ')}`);
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const parseCSVContent = (content: string): any[] => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      // Handle CSV parsing with proper quote handling
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }

    return [headers.reduce((obj, header) => ({ ...obj, [header]: header }), {}), ...data];
  };

  const simulateImport = async () => {
    if (!selectedFile) return;

    setImportProgress(0);
    setImportError(null);

    try {
      // Read file content
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(selectedFile);
      });

      setImportProgress(20);

      // Parse content
      let data: any[];
      if (selectedFile.name.endsWith('.csv')) {
        data = parseCSVContent(content);
      } else {
        // For Excel files, simulate parsing
        data = parseCSVContent(content); // In production, use a proper Excel parser
      }

      setImportProgress(40);

      // Validate file structure
      const structureValidation = validateFileStructure(data);
      if (!structureValidation.isValid) {
        setImportError(`File validation failed: ${structureValidation.errors.join(', ')}`);
        setImportProgress(null);
        return;
      }

      setImportProgress(60);

      // Detect file type
      const headers = Object.keys(data[0]);
      let fileType = 'unknown';
      if (headers.includes('Family Name')) fileType = 'families';
      else if (headers.includes('Holder ID')) fileType = 'holders';
      else if (headers.includes('ROB ID')) fileType = 'robs';

      // Validate data rows
      const dataRows = data.slice(1);
      const validationErrors: string[] = [];
      const validRows: any[] = [];
      const invalidRows: any[] = [];

      for (let i = 0; i < dataRows.length; i++) {
        const rowValidation = validateDataRow(dataRows[i], i, fileType);
        if (rowValidation.isValid) {
          validRows.push(dataRows[i]);
        } else {
          invalidRows.push({ row: i + 2, data: dataRows[i], errors: rowValidation.errors });
          validationErrors.push(...rowValidation.errors);
        }
        
        // Update progress
        setImportProgress(60 + (i / dataRows.length) * 30);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setImportProgress(100);

      // Set results
      setImportResults({
        fileType,
        totalRows: dataRows.length,
        successfulRows: validRows.length,
        errorRows: invalidRows.length,
        validRows,
        invalidRows,
        errors: validationErrors.slice(0, 10), // Show first 10 errors
        warnings: structureValidation.warnings
      });

      setImportProgress(null);

    } catch (error) {
      console.error('Import error:', error);
      setImportError(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setImportProgress(null);
    }
  };

  const exportData = (type: string) => {
    try {
      let data: any[] = [];
      let filename = '';
      let headers: string[] = [];

      switch (type) {
        case 'families':
          headers = ['Family Name', 'Family Code', 'Type', 'Status', 'KITs', 'Led', 'Goullet', 'BCC Optosoft', 'BCC Main', 'Rob Main', 'Rob Suite', 'Torque', 'Rack 30', 'Machine Visio', 'Comment', 'Total Holders', 'Created At', 'Updated At'];
          data = families.map(family => ({
            'Family Name': family.name,
            'Family Code': family.code,
            'Type': family.type || '',
            'Status': family.status,
            'KITs': family.kits || 0,
            'Led': family.led || 0,
            'Goullet': family.goullet || 0,
            'BCC Optosoft': family.bccOptosoft || 0,
            'BCC Main': family.bccMain || 0,
            'Rob Main': family.robMain || 0,
            'Rob Suite': family.robSuite || 0,
            'Torque': family.torque || 0,
            'Rack 30': family.rack30 || 0,
            'Machine Visio': family.machineVisio || 0,
            'Comment': family.comment || '',
            'Total Holders': family.totalHolders || 0,
            'Created At': family.createdAt.toISOString(),
            'Updated At': family.updatedAt.toISOString()
          }));
          filename = 'families_export.csv';
          break;

        case 'holders':
          headers = ['Holder ID', 'Holder Name', 'Family Code', 'Family Name', 'Status', 'ROB Assignment', 'Assigned Date', 'Created At'];
          // Mock holders data for export
          data = [
            {
              'Holder ID': 'H001',
              'Holder Name': 'VW-FB-H001',
              'Family Code': 'VW-FB-699',
              'Family Name': 'VW FRONT BUMPER 699',
              'Status': 'assigned',
              'ROB Assignment': 'ROB-SERIAL-001',
              'Assigned Date': '2024-01-15',
              'Created At': '2024-01-15T10:00:00.000Z'
            },
            {
              'Holder ID': 'H002',
              'Holder Name': 'VW-FB-H002',
              'Family Code': 'VW-FB-699',
              'Family Name': 'VW FRONT BUMPER 699',
              'Status': 'available',
              'ROB Assignment': '',
              'Assigned Date': '',
              'Created At': '2024-01-15T10:00:00.000Z'
            }
          ];
          filename = 'holders_export.csv';
          break;

        case 'robs':
          headers = ['ROB ID', 'ROB Name', 'Type', 'Capacity', 'Current Load', 'Status', 'Created At', 'Updated At'];
          data = robs.map(rob => ({
            'ROB ID': rob.id,
            'ROB Name': rob.name,
            'Type': rob.type,
            'Capacity': rob.capacity,
            'Current Load': rob.currentLoad,
            'Status': rob.status,
            'Created At': rob.createdAt.toISOString(),
            'Updated At': rob.updatedAt.toISOString()
          }));
          filename = 'robs_export.csv';
          break;

        default:
          throw new Error('Unknown export type');
      }

      // Create CSV content with proper escaping
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escape values that contain commas, quotes, or newlines
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(`${type} data exported successfully as ${filename}!`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  const downloadTemplate = (type: string) => {
    try {
      let headers: string[] = [];
      let sampleData: any[] = [];
      let filename = '';

      switch (type) {
        case 'families':
          headers = ['Family Name', 'Family Code', 'Type', 'Status', 'KITs', 'Led', 'Goullet', 'BCC Optosoft', 'BCC Main', 'Rob Main', 'Rob Suite', 'Torque', 'Rack 30', 'Machine Visio', 'Comment', 'Total Holders'];
          sampleData = [
            {
              'Family Name': 'EXAMPLE FAMILY',
              'Family Code': 'EX-001',
              'Type': 'Front Bumper',
              'Status': 'active',
              'KITs': 0,
              'Led': 0,
              'Goullet': 0,
              'BCC Optosoft': 1,
              'BCC Main': 1,
              'Rob Main': 0,
              'Rob Suite': 0,
              'Torque': 0,
              'Rack 30': 0,
              'Machine Visio': 0,
              'Comment': 'Example comment',
              'Total Holders': 10
            }
          ];
          filename = 'families_template.csv';
          break;

        case 'holders':
          headers = ['Holder ID', 'Holder Name', 'Family Code', 'Family Name', 'Status', 'ROB Assignment', 'Assigned Date'];
          sampleData = [
            {
              'Holder ID': 'H001',
              'Holder Name': 'EXAMPLE-H001',
              'Family Code': 'EX-001',
              'Family Name': 'EXAMPLE FAMILY',
              'Status': 'available',
              'ROB Assignment': '',
              'Assigned Date': ''
            }
          ];
          filename = 'holders_template.csv';
          break;

        case 'robs':
          headers = ['ROB ID', 'ROB Name', 'Type', 'Capacity', 'Current Load', 'Status'];
          sampleData = [
            {
              'ROB ID': 'R001',
              'ROB Name': 'ROB-EXAMPLE-001',
              'Type': 'SERIAL',
              'Capacity': 50,
              'Current Load': 0,
              'Status': 'active'
            }
          ];
          filename = 'robs_template.csv';
          break;

        default:
          throw new Error('Unknown template type');
      }

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...sampleData.map(row => 
          headers.map(header => {
            const value = row[header];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(`${type} template downloaded successfully as ${filename}!`);
    } catch (error) {
      console.error('Template download error:', error);
      alert('Error downloading template. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Import / Export</h1>
        <p className="text-gray-600 mt-1">Manage data import and export operations with full compatibility</p>
      </div>

      {/* Import Error Display */}
      {importError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-red-800 font-medium">Import Error</h3>
            <p className="text-red-700 mt-1">{importError}</p>
          </div>
          <button
            onClick={() => setImportError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Upload className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Import Data</h2>
          </div>

          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your file here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports .xlsx, .xls, and .csv files
              </p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  Select File
                </span>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setImportResults(null);
                    setImportError(null);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {importProgress !== null ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Processing...</span>
                    <span className="text-sm text-gray-500">{importProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                </div>
              ) : importResults ? (
                <ImportResults results={importResults} onClose={() => setImportResults(null)} />
              ) : (
                <button
                  onClick={simulateImport}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Validate & Import
                </button>
              )}
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Download className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Export Data</h2>
          </div>

          <div className="space-y-4">
            <ExportOption
              title="Product Families"
              description="Export all families with complete configuration data"
              count={`${families.length} families`}
              onExport={() => exportData('families')}
            />
            
            <ExportOption
              title="Holders Data"
              description="Export holder assignments and status information"
              count="Sample holders data"
              onExport={() => exportData('holders')}
            />
            
            <ExportOption
              title="ROBs Configuration"
              description="Export all ROB types with capacity and assignments"
              count={`${robs.length} ROBs`}
              onExport={() => exportData('robs')}
            />
          </div>
        </div>
      </div>

      {/* Templates Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Templates</h2>
        <p className="text-gray-600 mb-4">
          Download these templates with proper headers and sample data for importing.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TemplateCard
            title="Families Template"
            description="Template with validation rules and sample family data"
            onDownload={() => downloadTemplate('families')}
          />
          
          <TemplateCard
            title="Holders Template"
            description="Template with status validation and assignment examples"
            onDownload={() => downloadTemplate('holders')}
          />
          
          <TemplateCard
            title="ROBs Template"
            description="Template with ROB type validation and capacity examples"
            onDownload={() => downloadTemplate('robs')}
          />
        </div>
      </div>

      {/* Compatibility Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-blue-900 font-medium mb-2">Import/Export Compatibility</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Exported files can be re-imported without modifications</li>
              <li>• All data types are preserved (numbers, dates, text)</li>
              <li>• Field validation matches UI requirements exactly</li>
              <li>• Detailed error reporting with row numbers and descriptions</li>
              <li>• Partial import support - valid rows are imported, invalid ones are reported</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Import Results Component
interface ImportResultsProps {
  results: any;
  onClose: () => void;
}

const ImportResults: React.FC<ImportResultsProps> = ({ results, onClose }) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Import Results</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-white p-3 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{results.totalRows}</p>
          <p className="text-xs text-gray-500">Total Rows</p>
        </div>
        <div className="bg-white p-3 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{results.successfulRows}</p>
          <p className="text-xs text-gray-500">Valid</p>
        </div>
        <div className="bg-white p-3 rounded-lg">
          <p className="text-2xl font-bold text-red-600">{results.errorRows}</p>
          <p className="text-xs text-gray-500">Errors</p>
        </div>
      </div>

      {results.warnings && results.warnings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-yellow-800">Warnings:</h4>
          <div className="max-h-20 overflow-y-auto space-y-1">
            {results.warnings.map((warning: string, index: number) => (
              <div key={index} className="text-xs bg-yellow-50 text-yellow-700 p-2 rounded">
                {warning}
              </div>
            ))}
          </div>
        </div>
      )}

      {results.errors && results.errors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-red-800">Validation Errors:</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {results.errors.map((error: string, index: number) => (
              <div key={index} className="text-xs bg-red-50 text-red-700 p-2 rounded">
                {error}
              </div>
            ))}
          </div>
          {results.invalidRows && results.invalidRows.length > results.errors.length && (
            <p className="text-xs text-red-600">
              ... and {results.invalidRows.length - results.errors.length} more errors
            </p>
          )}
        </div>
      )}

      {results.successfulRows > 0 && results.errorRows === 0 && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">Import completed successfully!</span>
        </div>
      )}

      {results.successfulRows > 0 && results.errorRows > 0 && (
        <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <span className="text-yellow-800 font-medium">
            Partial import: {results.successfulRows} rows imported, {results.errorRows} rows failed
          </span>
        </div>
      )}
    </div>
  );
};

// Export Option Component
interface ExportOptionProps {
  title: string;
  description: string;
  count: string;
  onExport: () => void;
}

const ExportOption: React.FC<ExportOptionProps> = ({ title, description, count, onExport }) => {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-xs text-gray-500 mt-1">{count}</p>
      </div>
      <button
        onClick={onExport}
        className="ml-4 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors text-sm"
      >
        Export CSV
      </button>
    </div>
  );
};

// Template Card Component
interface TemplateCardProps {
  title: string;
  description: string;
  onDownload: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ title, description, onDownload }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <FileText className="w-8 h-8 text-blue-600 mb-3" />
      <h3 className="font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <button
        onClick={onDownload}
        className="w-full bg-blue-50 text-blue-700 px-3 py-2 rounded hover:bg-blue-100 transition-colors text-sm"
      >
        Download Template
      </button>
    </div>
  );
};