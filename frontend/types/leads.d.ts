import { PropertyType } from './enums';

export type Lead = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  companyId: string;
  agentId: string;
  leadAmount?: number;
  source?: string;
  status: LeadStatus;
  propertyType: PropertyType;
  budget?: number;
  location?: string;
  lastContactDate?: Date;
  notes?: Record<string, string>;
  socialProfiles?: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
};

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  // PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
}
