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

export type LeadBase = z.infer<typeof leadBaseSchema>;
export type CreateLead = z.infer<typeof createLeadSchema>;
export type UpdateLead = z.infer<typeof updateLeadSchema>;
export type LeadFilter = z.infer<typeof leadFilterSchema>;
export type LeadResponse = z.infer<typeof leadResponseSchema>;
export type LeadsResponse = z.infer<typeof leadsResponseSchema>;
export type ConvertToDeal = z.infer<typeof convertToDealSchema>;

export type Lead = z.infer<typeof leadResponseSchema>;

export interface ConvertToDealPayload {
  leadId: string;
  dealAmount: number;
  expectedCloseDate?: string;
}
