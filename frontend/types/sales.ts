import { DealStatus, LeadStatus } from './enums';

export interface Lead {
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
  leadAmount?: number;
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
