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
  propertyType?: string;
  budget?: number;
  location?: string;
  expectedDate?: Date;
  lastContactDate?: Date;
  notes?: string;
  socialProfiles?: any;
  createdAt: Date;
  updatedAt?: Date;
};

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
}
