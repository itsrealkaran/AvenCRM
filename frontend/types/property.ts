/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  sqft: number;
  bedrooms?: number;
  propertySummary: Record<string, any>;
  bathrooms: Record<string, any>;
  interiorFeatures: Record<string, any>;
  buildingFeatures: Record<string, any>;
  heatingNcooling: Record<string, any>;
  exteriorFeatures: Record<string, any>;
  measurements: Record<string, any>;
  parking: Record<string, any>;
  lotFeatures: Record<string, any>;
  rooms: Record<string, any>[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  creatorId?: string;
}
