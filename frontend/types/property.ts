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

export enum PropertyType {
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

export interface Room {
  id: string;
  name: string;
  type: string;
  width: string;
  length: string;
}

export interface Floor {
  id: string;
  name: string;
  level: number;
  rooms: Room[];
}

export interface CardDetails {
  id: string;
  beds: number;
  sqft: number;
  baths: number;
  image: string;
  price: number;
  title: string;
  address: string;
  parking: number;
  isVerified: boolean;
}

export interface PropertyData {
  id: string;
  beds: number;
  city: string;
  slug: string;
  sqft: string;
  baths: number;
  image: string;
  price: string;
  rooms: any[];
  title: string;
  views: string[];
  floors: Floor[];
  images: string[];
  address: string;
  country: string;
  parking: string;
  zipCode: string;
  bedrooms: string;
  isMetric: boolean;
  latitude: string;
  bathrooms: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  documents: string[];
  longitude: string;
  utilities: string[];
  imageNames: string[];
  isVerified: boolean;
  streetName: string;
  zoningType: string;
  addressLine: string;
  cardDetails: CardDetails;
  description: string;
  listingType: string;
  propertyName: string;
  propertyType: string;
  documentNames: string[];
  exteriorTypes: string[];
  googleMapsLink: string;
  generalFeatures: string[];
  exteriorFeatures: string[];
  interiorFeatures: string[];
  locationFeatures: string[];
  buildingDevelopmentFeatures: string[];
}

export interface PropertyListResponse {
  properties: PropertyData[];
}
