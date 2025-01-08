import { DealStatus, LeadStatus } from './enums';

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  companyId: string;
  agentId: string;
  leadAmount?: number;
  agent?: {
    id: string;
    name: string;
    email: string;
  };
  source?: string;
  status: LeadStatus;
  propertyType?: string;
  budget?: number;
  location?: string;
  expectedDate?: Date;
  lastContactDate?: Date;
  notes?: Record<string, string>;
  socialProfiles?: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Deal {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  companyId: string;
  agentId: string;
  agent?: {
    id: string;
    name: string;
    email: string;
  };
  dealAmount: number;
  status: DealStatus;
  propertyType?: string;
  propertyAddress?: string;
  propertyValue?: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  commissionRate?: number;
  estimatedCommission?: number;
  notes?: Record<string, string>;
  createdAt: Date;
  updatedAt?: Date;
}

export interface BaseFilters {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  createdById?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LeadFilters extends BaseFilters {
  status?: LeadStatus;
  source?: string;
  type?: string;
  minBudget?: number;
  maxBudget?: number;
  location?: string;
}

export interface DealFilters extends BaseFilters {
  status?: DealStatus;
  minAmount?: number;
  maxAmount?: number;
  propertyType?: string;
  location?: string;
}
