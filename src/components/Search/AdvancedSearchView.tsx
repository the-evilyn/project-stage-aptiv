import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Package, Box, Cpu, Calendar, AlertTriangle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { SearchFilters } from '../../types';

export const AdvancedSearchView: React.FC = () => {
  const { searchEntities } = useData();
  const { families, robs } = useData();
  const [initialQuery, setInitialQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    status: [],
    type: [],
    entityType: ''
  });
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    // Check if there's a search query from the header search
    const savedQuery = localStorage.getItem('searchQuery');
    if (savedQuery) {
      setFilters(prev => ({ ...prev, query: savedQuery }));
      setInitialQuery(savedQuery);
      localStorage.removeItem('searchQuery');
      // Auto-trigger search
      setTimeout(() => {
        handleSearch();
      }, 100);
    }
  }, []);

  const performSearch = async (): Promise<any[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Enhanced mock holders data
    const mockHolders = [
      { id: '1', name: 'VW-FB-H001', familyId: '1', status: 'assigned', type: 'Holder', createdAt: new Date('2024-01-15') },
      { id: '2', name: 'VW-FB-H002', familyId: '1', status: 'available', type: 'Holder', createdAt: new Date('2024-01-15') },
      { id: '3', name: 'SK-FB-H001', familyId: '2', status: 'assigned', type: 'Holder', createdAt: new Date('2024-01-20') },
      { id: '4', name: 'SK-FB-H002', familyId: '2', status: 'maintenance', type: 'Holder', createdAt: new Date('2024-01-20') },
      { id: '5', name: 'TG-CB-H001', familyId: '3', status: 'available', type: 'Holder', createdAt: new Date('2024-02-01') },
      { id: '6', name: 'TG-CB-H002', familyId: '3', status: 'out_of_service', type: 'Holder', createdAt: new Date('2024-02-01') }
    ];
    
    let searchResults: any[] = [];
    
    // Search families
    if (!filters.entityType || filters.entityType === 'families') {
      const familyResults = families
        .filter(f => 
          (!filters.query || 
           f.name.toLowerCase().includes(filters.query.toLowerCase()) || 
           f.code.toLowerCase().includes(filters.query.toLowerCase())) &&
          (!filters.status?.length || filters.status.includes(f.status))
        )
        .map(f => ({ ...f, type: 'Family' }));
      searchResults = [...searchResults, ...familyResults];
    }
    
    // Search holders
    if (!filters.entityType || filters.entityType === 'holders') {
      const holderResults = mockHolders.filter(h => 
        (!filters.query || h.name.toLowerCase().includes(filters.query.toLowerCase())) &&
        (!filters.status?.length || filters.status.includes(h.status))
      );
      searchResults = [...searchResults, ...holderResults];
    }
    
    // Search ROBs
    if (!filters.entityType || filters.entityType === 'robs') {
      const robResults = robs
        .filter(r => 
          (!filters.query || r.name.toLowerCase().includes(filters.query.toLowerCase())) &&
          (!filters.status?.length || filters.status.includes(r.status))
        )
        .map(r => ({ ...r, type: 'ROB' }));
      searchResults = [...searchResults, ...robResults];
    }
    
    return searchResults;
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchError(null);
    
    try {
      // Add timeout for search operations
      const searchPromise = performSearch();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Search timeout')), 10000)
      );
      
      const searchResults = await Promise.race([searchPromise, timeoutPromise]);
      setResults(searchResults as any[]);
      
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(error instanceof Error ? error.message : 'Search failed');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      status: [],
      type: [],
      entityType: ''
    });
    setResults([]);
    setSearchError(null);
  };

  const addStatusFilter = (status: string) => {
    if (!filters.status?.includes(status)) {
      setFilters(prev => ({
        ...prev,
        status: [...(prev.status || []), status]
      }));
    }
  };

  const removeStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status?.filter(s => s !== status) || []
    }));
  };

  const getEntityIcon = (entity: any) => {
    if (entity.code) return Package; // Family
    if (entity.robId !== undefined) return Box; // Holder
    if (entity.type && ['SERIAL', 'MPR', 'MYC'].includes(entity.type)) return Cpu; // ROB
    return Package;
  };

  const getEntityType = (entity: any) => {
    if (entity.entityType) return entity.entityType;
    if (entity.code && !entity.capacity) return 'Family';
    if (entity.robId !== undefined) return 'Holder';
    if (entity.type && ['SERIAL', 'MPR', 'MYC'].includes(entity.type)) return 'ROB';
    return 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Advanced Search</h1>
        <p className="text-gray-600 mt-1">Search across all entities with powerful filtering options</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {/* Main Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Query</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, code, or description..."
                value={filters.query || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* Entity Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: '', label: 'All Types' },
                { value: 'families', label: 'Families' },
                { value: 'holders', label: 'Holders' },
                { value: 'robs', label: 'ROBs' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilters(prev => ({ ...prev, entityType: option.value }))}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    filters.entityType === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {['active', 'draft', 'maintenance', 'archived', 'available', 'assigned', 'inactive'].map((status) => (
                <button
                  key={status}
                  onClick={() => 
                    filters.status?.includes(status) 
                      ? removeStatusFilter(status) 
                      : addStatusFilter(status)
                  }
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    filters.status?.includes(status)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                  {filters.status?.includes(status) && (
                    <X className="w-3 h-3 ml-1 inline" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                isSearching 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </>
              )}
            </button>
            
            <button
              onClick={clearFilters}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Error */}
      {searchError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Search Error</h3>
          </div>
          <p className="text-red-700 mt-2">{searchError}</p>
          <button
            onClick={() => setSearchError(null)}
            className="mt-3 text-red-600 hover:text-red-800 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Search Results ({results.length} found)
            </h2>
            <button
              onClick={() => setResults([])}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {results.map((entity, index) => {
              const Icon = getEntityIcon(entity);
              const entityType = getEntityType(entity);
              
              return (
                <div
                  key={`${entityType}-${entity.id}-${index}`}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{entity.name}</h3>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {entityType}
                      </span>
                      {entity.status && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          entity.status === 'active' ? 'bg-green-100 text-green-800' :
                          entity.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          entity.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                          entity.status === 'assigned' ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {entity.status}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mt-1">
                      {entity.code && <span className="font-mono">{entity.code}</span>}
                      {entity.description && (
                        <span className={entity.code ? 'ml-2' : ''}>{entity.description}</span>
                      )}
                      {entity.type && ['SERIAL', 'MPR', 'MYC'].includes(entity.type) && (
                        <span className="ml-2">Type: {entity.type}</span>
                      )}
                      {entity.totalHolders !== undefined && (
                        <span className="ml-2">Holders: {entity.totalHolders}</span>
                      )}
                      {entity.capacity !== undefined && (
                        <span className="ml-2">Capacity: {entity.currentLoad}/{entity.capacity}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center text-xs text-gray-500 space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(entity.createdAt || entity.assignedAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results */}
      {!isSearching && results.length === 0 && !searchError && (filters.query || filters.status?.length || filters.entityType) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or clearing some filters.
          </p>
        </div>
      )}

      {/* Search Tips */}
      {!filters.query && !filters.status?.length && !filters.entityType && !isSearching && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Search Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Quick Searches:</h4>
              <ul className="space-y-1">
                <li>• Type family names or codes</li>
                <li>• Search for specific ROB types</li>
                <li>• Find holders by status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Filter Options:</h4>
              <ul className="space-y-1">
                <li>• Combine multiple status filters</li>
                <li>• Filter by entity type</li>
                <li>• Use date ranges for recent items</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};