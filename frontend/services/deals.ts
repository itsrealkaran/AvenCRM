import { Deal, DealFilters } from '@/types';
import { api } from '@/lib/api';

export const dealsApi = {
  getDeals: async (filters: DealFilters = {}) => {
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

    const response = await api.get(`/deals?${queryParams.toString()}`);
    return response.data;
  },

  createDeal: async (data: Partial<Deal>) => {
    const response = await api.post('/deals', data);
    return response.data;
  },

  updateDeal: async (id: string, data: Partial<Deal>) => {
    const response = await api.put(`/deals/${id}`, data);
    return response.data;
  },

  deleteDeal: async (id: string) => {
    const response = await api.delete(`/deals/${id}`);
    return response.data;
  },

  bulkDeleteDeals: async (dealIds: string[]) => {
    const response = await api.delete('/deals', { data: { dealIds } });
    return response.data;
  },
};
