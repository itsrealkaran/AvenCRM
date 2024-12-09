export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  LOST = 'LOST',
  WON = 'WON',
}

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  companyId: string;
  agentId: string;
  leadAmount: number | null;
  source: string;
  status: LeadStatus;
  propertyType: string | null;
  budget: number | null;
  location: string | null;
  expectedDate: Date | null;
  lastContactDate: Date | null;
  notes: string | null;
  socialProfiles: Record<string, string> | null;
  createdAt: Date;
  updatedAt: Date | null;
}
