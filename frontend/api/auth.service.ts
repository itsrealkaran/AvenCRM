import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types/user';

import { api } from '@/lib/api';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/api/auth/sign-in', credentials);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post('/api/auth/sign-up', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/sign-out');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async getCurrency(): Promise<{ currency: string }> {
    const response = await api.get('/auth/currency');
    return response.data;
  },

  async getCompany() {
    const response = await api.get('/auth/company');
    return response.data;
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post('/auth/refresh-token');
    return response.data;
  },
};
