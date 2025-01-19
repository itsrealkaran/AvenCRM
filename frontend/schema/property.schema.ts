import { PropertyStatus, PropertyType } from '@/types';
import { z } from 'zod';

// Base schema for common property fields
export const propertyBaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be a positive number'),
  sqft: z.number().min(0, 'Area must be a positive number'),
  address: z.string().min(1, 'Address is required'),
  propertyType: z.nativeEnum(PropertyType).default(PropertyType.RESIDENTIAL),
  status: z.nativeEnum(PropertyStatus).default(PropertyStatus.ACTIVE),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  location: z.string().nullish(),
  amenities: z.array(z.string()).optional(),
});

// Schema for creating a new property
export const createPropertySchema = propertyBaseSchema;

// Schema for updating a property
export const updatePropertySchema = propertyBaseSchema.partial().extend({
  id: z.string().cuid().optional(),
  images: z.array(z.string()).optional(),
});

// Schema for property filters
export const propertyFilterSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  createdById: z.string().optional(),
  status: z.nativeEnum(PropertyStatus).optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minSqft: z.number().optional(),
  maxSqft: z.number().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Schema for property agent
const propertyAgentSchema = z.object({
  name: z.string().nullish(),
  email: z.string().email().nullish(),
  phone: z.string().nullish(),
});

// Response schemas
export const propertyResponseSchema = propertyBaseSchema.extend({
  id: z.string().cuid(),
  companyId: z.string().cuid(),
  agentId: z.string().cuid(),
  agent: propertyAgentSchema,
  images: z.array(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date().nullish(),
});

export const propertiesResponseSchema = z.object({
  data: z.array(propertyResponseSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

// Export types
export type CreatePropertySchema = z.infer<typeof createPropertySchema>;
export type UpdatePropertySchema = z.infer<typeof updatePropertySchema>;
export type PropertyFilterSchema = z.infer<typeof propertyFilterSchema>;
export type PropertyResponseSchema = z.infer<typeof propertyResponseSchema>;
export type PropertiesResponseSchema = z.infer<typeof propertiesResponseSchema>;
