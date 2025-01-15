import { z } from 'zod';

import {
  convertToDealSchema,
  createLeadSchema,
  leadBaseSchema,
  leadFilterSchema,
  leadResponseSchema,
  leadsResponseSchema,
  updateLeadSchema,
} from '../schema/lead.schema';
import { LeadStatus, PropertyType } from './enums';

export type LeadBase = z.infer<typeof leadBaseSchema>;
export type CreateLead = z.infer<typeof createLeadSchema>;
export type UpdateLead = z.infer<typeof updateLeadSchema>;
export type LeadFilter = z.infer<typeof leadFilterSchema>;
export type LeadResponse = z.infer<typeof leadResponseSchema>;
export type LeadsResponse = z.infer<typeof leadsResponseSchema>;
export type ConvertToDeal = z.infer<typeof convertToDealSchema>;

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
  propertyType?: PropertyType;
  budget?: number;
  location?: string;
  expectedDate?: Date;
  lastContactDate?: Date;
  notes?: Record<string, string>;
  socialProfiles?: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ConvertToDealPayload {
  leadId: string;
  dealAmount: number;
  expectedCloseDate?: string;
}
