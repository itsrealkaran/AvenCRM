import { CreateDeal, Deal, DealFilter, DealsResponse, DealStatus, UpdateDeal } from '@/types';

import { api } from '@/lib/api';

/**
 * Provides methods for interacting with the deals API.
 */
export const dealsApi = {
  // Get all deals with optional filtering
  getDeals: async (filters?: DealFilter): Promise<DealsResponse> => {
    const response = await api.get<DealsResponse>('/deals', { params: filters });
    return response.data;
  },

  // Get a single deal by ID
  getDeal: async (id: string): Promise<Deal> => {
    const response = await api.get<Deal>(`/deals/${id}`);
    return response.data;
  },

  // Get all the won deals
  getAllWonDeals: async (): Promise<any> => {
    const response = await api.get('/deals/won');
    return response.data;
  },

  // Create a new deal with files
  createDeal: async (data: CreateDeal, files?: File[]): Promise<Deal> => {
    const formData = new FormData();

    // Clean up the data and handle dates
    const cleanData = {
      ...data,
      expectedCloseDate: data.expectedCloseDate
        ? new Date(data.expectedCloseDate).toISOString()
        : undefined,
      dealAmount: data.dealAmount ? parseFloat(data.dealAmount.toString()) : undefined,
      propertyValue: data.propertyValue ? parseFloat(data.propertyValue.toString()) : undefined,
    };

    formData.append('data', JSON.stringify(cleanData));

    // Append files if any
    if (files?.length) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await api.post<Deal>('/deals', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update a deal with files
  updateDeal: async (id: string, data: UpdateDeal, files?: File[]): Promise<Deal> => {
    const formData = new FormData();

    // Clean up the data and handle dates
    const cleanData = {
      ...data,
      expectedCloseDate: data.expectedCloseDate
        ? new Date(data.expectedCloseDate).toISOString()
        : undefined,
      dealAmount: data.dealAmount ? parseFloat(data.dealAmount.toString()) : undefined,
      propertyValue: data.propertyValue ? parseFloat(data.propertyValue.toString()) : undefined,
    };

    formData.append('data', JSON.stringify(cleanData));

    // Append files if any
    if (files?.length) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await api.put<Deal>(`/deals/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete a deal
  deleteDeal: async (id: string): Promise<DealsResponse> => {
    const response = await api.delete<DealsResponse>(`/deals/${id}`);
    return response.data;
  },

  // Bulk delete deals
  bulkDeleteDeals: async (dealIds: string[]): Promise<void> => {
    await api.delete('/deals', { data: { dealIds } });
  },

  // Update deal status
  updateDealStatus: async (id: string, status: DealStatus): Promise<DealsResponse> => {
    const response = await api.patch<DealsResponse>(`/deals/${id}/status`, { status });
    return response.data;
  },

   // Add a note to a lead
   addNote: async (id: string, note: any) => {
    const response = await api.post(`/deals/${id}/notes`, { note });
    return response.data;
  },
};
