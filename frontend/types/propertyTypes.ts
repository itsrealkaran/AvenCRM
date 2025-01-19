export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  listingPrice: number;
  address: string;
  sqft: number;
  bedrooms?: number;
  propertyType: string;
  buildingType?: string;
  yearBuilt?: number;
  status: 'ACTIVE' | 'PENDING' | 'SOLD' | 'INACTIVE';
  amenities?: Record<string, any>;
  specifications?: Record<string, any>;
  location?: {
    latitude?: number;
    longitude?: number;
    [key: string]: any;
  };
  rooms?: Array<{
    name: string;
    type: string;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
    };
    [key: string]: any;
  }>;
  images: string[];
  annualTax?: number;
  createdAt: string;
  updatedAt: string;
  creatorId?: string;
}

export interface PropertyFormData extends Omit<Property, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
}

export interface PropertyFilters {
  status?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface PropertyResponse {
  properties: Property[];
  totalPages: number;
  currentPage: number;
  total: number;
}
