import { ConvertToDealPayload, CreateLead, Lead, LeadFilters, UpdateLead } from '@/types';

import { api } from '@/lib/api';

export const leadsApi = {
  getLeads: async (filters: LeadFilters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          queryParams.append(key, value.toISOString());
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    const response = await api.get(`/leads?${queryParams.toString()}`);
    return response.data;
  },

  createLead: async (data: CreateLead) => {
    const response = await api.post('/leads', data);
    return response.data;
  },

  updateLead: async (id: string, data: UpdateLead) => {
    const response = await api.put(`/leads/${id}`, data);
    return response.data;
  },

  deleteLead: async (id: string) => {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },

  bulkDeleteLeads: async (leadIds: string[]) => {
    const response = await api.delete('/leads', { data: { leadIds } });
    return response.data;
  },

  convertToDeal: async (data: ConvertToDealPayload): Promise<{ deal: any; message: string }> => {
    const response = await api.post('/leads/convert', {
      ...data,
      expectedCloseDate: data.expectedCloseDate
        ? new Date(data.expectedCloseDate).toISOString()
        : undefined,
    });
    return response.data;
  },
};
