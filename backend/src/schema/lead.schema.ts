import { LeadStatus, PropertyType } from '@prisma/client';
import { z } from 'zod';

import { noteEntrySchema } from './note-and-coowners.schema.js';

// Base schema for common lead fields
export const leadBaseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email().nullish(),
  phone: z.string().nullish(),
  source: z.string().nullish(),
  status: z.nativeEnum(LeadStatus).default(LeadStatus.NEW),
  propertyType: z.nativeEnum(PropertyType).default(PropertyType.COMMERCIAL),
  budget: z.number().nullish(),
  leadAmount: z.number().nullish(),
  location: z.string().nullish(),
  lastContactDate: z.date().nullish(),
  expectedDate: z.date().nullish(),
  notes: z.array(noteEntrySchema).default([]), // Changed from nullish to default([])
});

// Schema for creating a new lead
export const createLeadSchema = leadBaseSchema;

// Schema for updating a lead
export const updateLeadSchema = leadBaseSchema.partial().extend({
  id: z.string().cuid(),
});

// Schema for lead filters
export const leadFilterSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  createdById: z.string().optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  source: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Schema for converting lead to deal
export const convertToDealSchema = z.object({
  leadId: z.string(),
  dealAmount: z.number(),
  expectedCloseDate: z.string().optional(),
});

const leadAgentSchema = z.object({
  name: z.string().nullish(),
  email: z.string().email().nullish(),
  phone: z.string().nullish(),
});

// Response schemas
export const leadResponseSchema = leadBaseSchema.extend({
  id: z.string().cuid(),
  companyId: z.string().cuid(),
  agentId: z.string().cuid().nullable(),
  agent: leadAgentSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date().nullish(),
});

export const leadsResponseSchema = z.object({
  data: z.array(leadResponseSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});
