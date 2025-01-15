import { DealStatus, PropertyType } from './enums';

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
  propertyType?: PropertyType;
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
