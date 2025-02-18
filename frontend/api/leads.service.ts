import { CreateLead, LeadFilter, LeadResponse, LeadStatus, UpdateLead } from '@/types';

import { api } from '@/lib/api';

export interface ConvertToDealPayload {
  leadId: string;
  dealAmount: number;
  expectedCloseDate?: string;
}

/**
 * Provides methods for interacting with the leads API.
 */
export const leadsApi = {
  // Get all leads with optional filtering
  getLeads: async (filters?: LeadFilter) => {
    const response = await api.get<any>('/leads', { params: filters });
    return response.data;
  },

  // Get a single lead by ID
  getLead: async (id: string): Promise<any> => {
    const response = await api.get<LeadResponse>(`/leads/${id}`);
    return response.data;
  },

  // Create a new lead with files
  createLead: async (data: CreateLead): Promise<LeadResponse> => {
    const formData = new FormData();

    // Clean up the data and handle dates
    const cleanData = {
      ...data,
      expectedDate: data.expectedDate ? new Date(data.expectedDate).toISOString() : undefined,
      lastContactDate: data.lastContactDate
        ? new Date(data.lastContactDate).toISOString()
        : undefined,
      budget: data.budget ? parseFloat(data.budget.toString()) : undefined,
    };

    formData.append('data', JSON.stringify(cleanData));

    const response = await api.post<LeadResponse>('/leads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update a lead with files
  updateLead: async (id: string, data: UpdateLead, files?: File[]): Promise<LeadResponse> => {
    const formData = new FormData();

    // Clean up the data and handle dates
    const cleanData = {
      ...data,
      expectedDate: data.expectedDate ? new Date(data.expectedDate).toISOString() : undefined,
      lastContactDate: data.lastContactDate
        ? new Date(data.lastContactDate).toISOString()
        : undefined,
      budget: data.budget ? parseFloat(data.budget.toString()) : undefined,
    };

    formData.append('data', JSON.stringify(cleanData));

    // Append files if any
    if (files?.length) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await api.put<LeadResponse>(`/leads/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete a lead
  deleteLead: async (id: string): Promise<LeadResponse> => {
    const response = await api.delete<LeadResponse>(`/leads/${id}`);
    return response.data;
  },

  // Bulk delete leads
  bulkDeleteLeads: async (leadIds: string[]): Promise<void> => {
    await api.delete('/leads', { data: { leadIds } });
  },

  // Update lead status
  updateLeadStatus: async (id: string, status: LeadStatus): Promise<LeadResponse> => {
    const response = await api.patch<LeadResponse>(`/leads/${id}/status`, { status });
    return response.data;
  },

  bulkAssignLeads: async (leadIds: string[], agentId: string) => {
    return await api.post('/leads/bulk-assign', {
      leadIds,
      agentId,
    });
  },

  // Convert lead to deal
  convertToDeal: async (data: ConvertToDealPayload): Promise<{ deal: any; message: string }> => {
    const response = await api.post('/leads/convert', {
      ...data,
      expectedCloseDate: data.expectedCloseDate
        ? new Date(data.expectedCloseDate).toISOString()
        : undefined,
    });
    return response.data;
  },

  // Add a note to a lead
  addNote: async (id: string, note: any): Promise<LeadResponse> => {
    const response = await api.post<LeadResponse>(`/leads/${id}/notes`, { note });
    return response.data;
  },
};
