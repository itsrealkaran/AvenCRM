import { Transaction, TransactionType } from '@/types';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types/user';

import apiClient from '@/lib/axios';

export interface TransactionFilters {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  createdById?: string;
  type?: TransactionType;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TransactionResponse {
  data: Transaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateTransactionDTO {
  amount: number;
  type: string;
  planType?: string;
  invoiceNumber?: string;
  taxRate?: number;
  transactionMethod?: string;
  date: string;
}

export interface UpdateTransactionDTO extends CreateTransactionDTO {}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<AuthResponse>('/auth/sign-in', credentials),

  register: (data: RegisterCredentials) => apiClient.post<AuthResponse>('/auth/sign-up', data),

  me: () => apiClient.get<User>('/auth/me'),

  refreshToken: () => apiClient.post('/auth/refresh-token'),

  logout: () => {
    localStorage.removeItem('accessToken');
    // return apiClient.post('/auth/sign-out');
  },
};

export const transactionApi = {
  getAll: (filters: TransactionFilters = {}) => {
    const queryParams = new URLSearchParams();

    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString());
    if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString());
    if (filters.createdById) queryParams.append('createdById', filters.createdById);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.minAmount) queryParams.append('minAmount', filters.minAmount.toString());
    if (filters.maxAmount) queryParams.append('maxAmount', filters.maxAmount.toString());
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

    return apiClient.get<TransactionResponse>(`/transactions?${queryParams.toString()}`);
  },

  getById: (id: string) => apiClient.get<Transaction>(`/transactions/${id}`),

  create: (data: CreateTransactionDTO) => apiClient.post<Transaction>('/transactions', data),

  update: (id: string, data: UpdateTransactionDTO) =>
    apiClient.put<Transaction>(`/transactions/${id}`, data),

  delete: (id: string) => apiClient.delete(`/transactions/${id}`),

  bulkDelete: (transactionIds: string[]) =>
    apiClient.delete('/transactions', { data: { transactionIds } }),

  verify: (id: string, isVerified: boolean) =>
    apiClient.put<Transaction>(`/transactions/${id}/verify`, { isVerified }),
};

export const userApi = {
  // User related endpoints
};

export const companyApi = {
  // Company related endpoints
};

// ... other API services
