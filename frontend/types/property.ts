import {
  CreatePropertySchema,
  PropertiesResponseSchema,
  PropertyFilterSchema,
  PropertyResponseSchema,
  UpdatePropertySchema,
} from '@/schema/property.schema';

export enum PropertyStatus {
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE',
}

export enum  PropertyType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  LAND = 'LAND',
}

export type Property = PropertyResponseSchema;
export type CreateProperty = CreatePropertySchema;
export type UpdateProperty = UpdatePropertySchema;
export type PropertyFilter = PropertyFilterSchema;
export type PropertyResponse = PropertyResponseSchema;
export type PropertiesResponse = PropertiesResponseSchema;

// Additional utility types for frontend use
export interface PropertyImage {
  id: string;
  imageUrl: string;
}

export interface PropertyAgent {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}
