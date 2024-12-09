export type Deal = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  companyId: string;
  agentId: string;
  dealAmount?: number;
  source?: string;
  status: DealStatus;
  propertyType?: string;
  budget?: number;
  location?: string;
  expectedCloseDate?: Date;
  lastContactDate?: Date;
  notes?: string;
  socialProfiles?: any;
  createdAt: Date;
  updatedAt?: Date;
};

export enum DealStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
}
