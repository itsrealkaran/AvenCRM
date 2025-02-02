import { DealStatus, PropertyType } from '@/types';
import { z } from 'zod';

import { noteEntrySchema, coownerSchema } from './note-and-coowner.schema';

// Base schema for common deal fields
export const dealBaseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email().nullish(),
  phone: z.string().nullish(),
  dealAmount: z.number().positive('Deal amount must be positive'),
  status: z.nativeEnum(DealStatus).default(DealStatus.NEW),
  propertyType: z.nativeEnum(PropertyType).default(PropertyType.COMMERCIAL),
  propertyAddress: z.string().nullish(),
  propertyValue: z.number().positive().nullish(),
  expectedCloseDate: z.date().nullish(),
  actualCloseDate: z.date().nullish(),
  commissionRate: z.number().min(0).max(100).nullish(),
  estimatedCommission: z.number().positive().nullish(),
  notes: z.array(noteEntrySchema).default([]),
  coOwners: z.array(coownerSchema).default([]),
});

// Schema for creating a new deal
export const createDealSchema = dealBaseSchema;

// Schema for updating a deal
export const updateDealSchema = dealBaseSchema.partial().extend({
  id: z.string().cuid(),
});

// Schema for deal filters
export const dealFilterSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  createdById: z.string().optional(),
  status: z.nativeEnum(DealStatus).optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  sortBy: z.string().optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  commissionRate: z.number().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const dealAgentSchema = z.object({
  name: z.string().nullish(),
  email: z.string().email().nullish(),
  phone: z.string().nullish(),
});

// Response schemas
export const dealResponseSchema = dealBaseSchema.extend({
  id: z.string().cuid(),
  companyId: z.string().cuid(),
  agentId: z.string().cuid(),
  agent: dealAgentSchema,
  createdAt: z.date(),
  updatedAt: z.date().nullish(),
});

export const dealsResponseSchema = z.object({
  data: z.array(dealResponseSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});
