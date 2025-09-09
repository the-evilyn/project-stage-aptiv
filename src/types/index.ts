export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'supervisor' | 'manager' | 'operator';
  permissions: string[];
  createdAt: Date;
  lastLogin?: Date;
}

export interface Family {
  id: string;
  name: string;
  code: string;
  type?: string;
  status: 'draft' | 'active' | 'maintenance' | 'archived';
  description: string;
  kits: number;
  led: number;
  goullet: number;
  bccOptosoft: number;
  bccMain: number;
  robMain: number;
  robSuite: number;
  torque: number;
  rack30: number;
  machineVisio: number;
  comment: string;
  totalHolders: number;
  robAssignments?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Kit {
  id: string;
  name: string;
  familyId: string;
  specifications: string;
  quantity: number;
  version: string;
  createdAt: Date;
}

export interface Holder {
  id: string;
  name: string;
  familyId: string;
  status: 'available' | 'assigned' | 'maintenance' | 'out_of_service';
  robId?: string;
  assignedAt?: Date;
  createdAt: Date;
}

export type ROBType = 'SERIAL' | 'MPR' | 'MYC';

export interface ROB {
  id: string;
  name: string;
  type: ROBType;
  capacity: number;
  currentLoad: number;
  status: 'active' | 'inactive' | 'maintenance' | 'stopped';
  assignedHolders: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Machine {
  id: string;
  name: string;
  type: 'led' | 'goullet' | 'bcc_optosoft' | 'bcc_main' | 'rob_main' | 'rob_suite' | 'torque' | 'rack_30' | 'machine_visio';
  status: 'operational' | 'maintenance' | 'stopped' | 'error';
  lineId?: string;
  specifications: Record<string, any>;
  createdAt: Date;
}

export interface ProductionLine {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
  machineIds: string[];
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  tableName: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  oldData?: any;
  newData?: any;
  userId: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  userId?: string;
  read: boolean;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  entityType: string;
  entityId: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  query?: string;
  status?: string[];
  type?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  entityType?: string;
}