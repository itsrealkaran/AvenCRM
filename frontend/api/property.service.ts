import {
  CreateProperty,
  PropertiesResponse,
  PropertyFilter,
  PropertyResponse,
  PropertyStatus,
  UpdateProperty,
} from '@/types';

import { api } from '@/lib/api';

/**
 * Provides methods for interacting with the properties API.
 */
export const propertiesApi = {
  // Get all properties with optional filtering
  getProperties: async (filters?: PropertyFilter): Promise<PropertiesResponse> => {
    const response = await api.get<PropertiesResponse>('/property', { params: filters });
    return response.data;
  },

  // Get a single property by ID
  getProperty: async (id: string): Promise<PropertyResponse> => {
    const response = await api.get<PropertyResponse>(`/property/${id}`);
    return response.data;
  },

  // Create a new property with files
  createProperty: async (data: CreateProperty, files?: File[]): Promise<PropertyResponse> => {
    const formData = new FormData();

    // Clean up the data and handle numeric values
    const cleanData = {
      ...data,
      price: data.price ? parseFloat(data.price.toString()) : undefined,
      sqft: data.sqft ? parseFloat(data.sqft.toString()) : undefined,
    };

    formData.append('data', JSON.stringify(cleanData));

    if (files) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await api.post<PropertyResponse>('/property', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update a property with files
  updateProperty: async (
    id: string,
    data: UpdateProperty,
    files?: File[]
  ): Promise<PropertyResponse> => {
    const formData = new FormData();

    // Clean up the data and handle numeric values
    const cleanData = {
      ...data,
      price: data.price ? parseFloat(data.price.toString()) : undefined,
      sqft: data.sqft ? parseFloat(data.sqft.toString()) : undefined,
    };

    formData.append('data', JSON.stringify(cleanData));

    // Append files if any
    if (files?.length) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await api.put<PropertyResponse>(`/property/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete a property
  deleteProperty: async (id: string): Promise<PropertyResponse> => {
    const response = await api.delete<PropertyResponse>(`/property/${id}`);
    return response.data;
  },

  // Bulk delete properties
  bulkDeleteProperties: async (propertyIds: string[]): Promise<void> => {
    await api.delete('/property', { data: { propertyIds } });
  },

  // Update property status
  updatePropertyStatus: async (id: string, status: PropertyStatus): Promise<PropertyResponse> => {
    const response = await api.patch<PropertyResponse>(`/property/${id}/status`, { status });
    return response.data;
  },
};
