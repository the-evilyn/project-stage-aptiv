import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Family, 
  Kit, 
  Holder, 
  ROB, 
  Machine, 
  ProductionLine, 
  AuditLog, 
  Notification, 
  Ticket,
  SearchFilters 
} from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  // Data
  families: Family[];
  kits: Kit[];
  holders: Holder[];
  robs: ROB[];
  machines: Machine[];
  productionLines: ProductionLine[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  tickets: Ticket[];
  
  // CRUD operations
  createFamily: (family: Omit<Family, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFamily: (id: string, updates: Partial<Family>) => void;
  deleteFamily: (id: string) => void;
  
  createHolder: (holder: Omit<Holder, 'id' | 'createdAt'>) => void;
  updateHolder: (id: string, updates: Partial<Holder>) => void;
  deleteHolder: (id: string) => void;
  
  assignHolderToROB: (holderId: string, robId: string) => void;
  unassignHolderFromROB: (holderId: string) => void;
  
  createROB: (rob: Omit<ROB, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateROB: (id: string, updates: Partial<ROB>) => void;
  
  // Search and filtering
  searchEntities: (filters: SearchFilters) => any[];
  
  // Statistics
  getKPIs: () => any;
  
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Mock data
const mockFamilies: Family[] = [
  {
    id: '1',
    name: 'VW FRONT BUMPER 699',
    code: 'VW-FB-699',
    status: 'active',
    description: 'Volkswagen front bumper assembly',
    kits: 0,
    led: 0,
    goullet: 0,
    bccOptosoft: 2,
    bccMain: 1,
    robMain: 0,
    robSuite: 0,
    torque: 0,
    rack30: 0,
    machineVisio: 0,
    comment: '',
    totalHolders: 22,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    createdBy: '1'
  },
  {
    id: '2',
    name: 'SK FRONT BUMPER 702',
    code: 'SK-FB-702',
    status: 'active',
    description: 'Skoda front bumper assembly',
    kits: 0,
    led: 0,
    goullet: 0,
    bccOptosoft: 2,
    bccMain: 1,
    robMain: 0,
    robSuite: 0,
    torque: 0,
    rack30: 0,
    machineVisio: 0,
    comment: '',
    totalHolders: 18,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    createdBy: '2'
  },
  {
    id: '3',
    name: 'TAILGATE COMBI 698',
    code: 'TG-CB-698',
    status: 'active',
    description: 'Tailgate assembly for combi vehicles',
    kits: 0,
    led: 0,
    goullet: 0,
    bccOptosoft: 2,
    bccMain: 1,
    robMain: 0,
    robSuite: 0,
    torque: 0,
    rack30: 0,
    machineVisio: 0,
    comment: '',
    totalHolders: 28,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-22'),
    createdBy: '1'
  },
  {
    id: '4',
    name: 'ENGINE 1',
    code: 'ENG-001',
    status: 'active',
    description: 'Engine assembly line 1',
    kits: 25,
    led: 1,
    goullet: 4,
    bccOptosoft: 2,
    bccMain: 1,
    robMain: 1,
    robSuite: 2,
    torque: 1,
    rack30: 1,
    machineVisio: 1,
    comment: 'ROB1, ROB2, ROB5',
    totalHolders: 242,
    robAssignments: ['ROB1', 'ROB2', 'ROB5'],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-25'),
    createdBy: '1'
  },
  {
    id: '5',
    name: 'INTERIOR 1 LHD LIMO/RHD/Special Car',
    code: 'INT-LHD-001',
    type: 'Interior',
    status: 'active',
    description: 'Interior assembly for LHD/RHD vehicles',
    kits: 22,
    led: 3,
    goullet: 0,
    bccOptosoft: 3,
    bccMain: 3,
    robMain: 0,
    robSuite: 1,
    torque: 1,
    rack30: 1,
    machineVisio: 2,
    comment: 'ROB1_LHD_RHD, ROB2_LHD_RHD, ROB3, ROB7, ROB4, ROB5, ROB6',
    totalHolders: 462,
    robAssignments: ['ROB1_LHD_RHD', 'ROB2_LHD_RHD', 'ROB3', 'ROB7', 'ROB4', 'ROB5', 'ROB6'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-15'),
    createdBy: '1'
  }
];

const mockROBs: ROB[] = [
  {
    id: '1',
    name: 'ROB-SERIAL-001',
    type: 'SERIAL',
    capacity: 50,
    currentLoad: 35,
    status: 'active',
    assignedHolders: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    name: 'ROB-MPR-001',
    type: 'MPR',
    capacity: 30,
    currentLoad: 30,
    status: 'inactive',
    assignedHolders: [],
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '3',
    name: 'ROB-MYC-001',
    type: 'MYC',
    capacity: 40,
    currentLoad: 0,
    status: 'active',
    assignedHolders: [],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  }
];

const generateId = () => Math.random().toString(36).substr(2, 9);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [families, setFamilies] = useState<Family[]>(mockFamilies);
  const [kits, setKits] = useState<Kit[]>([]);
  const [holders, setHolders] = useState<Holder[]>([]);
  const [robs, setROBs] = useState<ROB[]>(mockROBs);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addAuditLog = (tableName: string, operation: 'CREATE' | 'UPDATE' | 'DELETE', oldData?: any, newData?: any) => {
    if (!user) return;
    
    const log: AuditLog = {
      id: generateId(),
      tableName,
      operation,
      oldData,
      newData,
      userId: user.id,
      timestamp: new Date()
    };
    
    setAuditLogs(prev => [log, ...prev]);
  };

  const createFamily = (familyData: Omit<Family, 'id' | 'createdAt' | 'updatedAt'>) => {
    const family: Family = {
      ...familyData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user?.id || ''
    };
    
    setFamilies(prev => [...prev, family]);
    addAuditLog('families', 'CREATE', null, family);
  };

  const updateFamily = (id: string, updates: Partial<Family>) => {
    setFamilies(prev => prev.map(family => {
      if (family.id === id) {
        const oldData = { ...family };
        const updatedFamily = { ...family, ...updates, updatedAt: new Date() };
        addAuditLog('families', 'UPDATE', oldData, updatedFamily);
        return updatedFamily;
      }
      return family;
    }));
  };

  const deleteFamily = (id: string) => {
    const family = families.find(f => f.id === id);
    if (family) {
      setFamilies(prev => prev.filter(f => f.id !== id));
      addAuditLog('families', 'DELETE', family, null);
    }
  };

  const createHolder = (holderData: Omit<Holder, 'id' | 'createdAt'>) => {
    const holder: Holder = {
      ...holderData,
      id: generateId(),
      createdAt: new Date()
    };
    
    setHolders(prev => [...prev, holder]);
    addAuditLog('holders', 'CREATE', null, holder);
  };

  const updateHolder = (id: string, updates: Partial<Holder>) => {
    setHolders(prev => prev.map(holder => {
      if (holder.id === id) {
        const oldData = { ...holder };
        const updatedHolder = { ...holder, ...updates };
        addAuditLog('holders', 'UPDATE', oldData, updatedHolder);
        return updatedHolder;
      }
      return holder;
    }));
  };

  const deleteHolder = (id: string) => {
    const holder = holders.find(h => h.id === id);
    if (holder) {
      setHolders(prev => prev.filter(h => h.id !== id));
      addAuditLog('holders', 'DELETE', holder, null);
    }
  };

  const assignHolderToROB = (holderId: string, robId: string) => {
    const rob = robs.find(r => r.id === robId);
    const holder = holders.find(h => h.id === holderId);
    
    if (rob && holder && rob.currentLoad < rob.capacity) {
      updateHolder(holderId, { 
        status: 'assigned', 
        robId, 
        assignedAt: new Date() 
      });
      
      setROBs(prev => prev.map(r => 
        r.id === robId 
          ? { 
              ...r, 
              currentLoad: r.currentLoad + 1, 
              assignedHolders: [...r.assignedHolders, holderId],
              updatedAt: new Date()
            }
          : r
      ));
    }
  };

  const unassignHolderFromROB = (holderId: string) => {
    const holder = holders.find(h => h.id === holderId);
    if (holder && holder.robId) {
      updateHolder(holderId, { 
        status: 'available', 
        robId: undefined, 
        assignedAt: undefined 
      });
      
      setROBs(prev => prev.map(r => 
        r.id === holder.robId 
          ? { 
              ...r, 
              currentLoad: Math.max(0, r.currentLoad - 1),
              assignedHolders: r.assignedHolders.filter(id => id !== holderId),
              updatedAt: new Date()
            }
          : r
      ));
    }
  };

  const createROB = (robData: Omit<ROB, 'id' | 'createdAt' | 'updatedAt'>) => {
    const rob: ROB = {
      ...robData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setROBs(prev => [...prev, rob]);
    addAuditLog('robs', 'CREATE', null, rob);
  };

  const updateROB = (id: string, updates: Partial<ROB>) => {
    setROBs(prev => prev.map(rob => {
      if (rob.id === id) {
        const oldData = { ...rob };
        const updatedROB = { ...rob, ...updates, updatedAt: new Date() };
        addAuditLog('robs', 'UPDATE', oldData, updatedROB);
        return updatedROB;
      }
      return rob;
    }));
  };

  const searchEntities = (filters: SearchFilters) => {
    let results: any[] = [];
    
    if (!filters.entityType || filters.entityType === 'families') {
      results = [...results, ...families.filter(f => 
        (!filters.query || f.name.toLowerCase().includes(filters.query.toLowerCase()) || 
         f.code.toLowerCase().includes(filters.query.toLowerCase())) &&
        (!filters.status || filters.status.includes(f.status))
      )];
    }
    
    if (!filters.entityType || filters.entityType === 'holders') {
      results = [...results, ...holders.filter(h => 
        (!filters.query || h.name.toLowerCase().includes(filters.query.toLowerCase())) &&
        (!filters.status || filters.status.includes(h.status))
      )];
    }
    
    if (!filters.entityType || filters.entityType === 'robs') {
      results = [...results, ...robs.filter(r => 
        (!filters.query || r.name.toLowerCase().includes(filters.query.toLowerCase())) &&
        (!filters.status || filters.status.includes(r.status))
      )];
    }
    
    return results;
  };

  const getKPIs = () => {
    const totalFamilies = families.length;
    const activeFamilies = families.filter(f => f.status === 'active').length;
    const totalHolders = families.reduce((sum, f) => sum + f.totalHolders, 0);
    const totalROBCapacity = robs.reduce((sum, r) => sum + r.capacity, 0);
    const totalROBLoad = robs.reduce((sum, r) => sum + r.currentLoad, 0);
    const robUtilization = totalROBCapacity > 0 ? (totalROBLoad / totalROBCapacity) * 100 : 0;
    
    return {
      totalFamilies,
      activeFamilies,
      totalHolders,
      robUtilization: Math.round(robUtilization),
      serialROBs: robs.filter(r => r.type === 'SERIAL').length,
      mprROBs: robs.filter(r => r.type === 'MPR').length,
      mycROBs: robs.filter(r => r.type === 'MYC').length
    };
  };

  const value: DataContextType = {
    families,
    kits,
    holders,
    robs,
    machines,
    productionLines,
    auditLogs,
    notifications,
    tickets,
    createFamily,
    updateFamily,
    deleteFamily,
    createHolder,
    updateHolder,
    deleteHolder,
    assignHolderToROB,
    unassignHolderFromROB,
    createROB,
    updateROB,
    searchEntities,
    getKPIs,
    loading,
    error
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};