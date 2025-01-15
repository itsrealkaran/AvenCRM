import { User } from '@/types/user';

import { api } from '@/lib/api';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const userService = {
  async updateProfile(data: Partial<User>) {
    try {
      const response = await api.put(`/api/users/${data.id}`, data);
      return response.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || 'Failed to update profile'
      );
    }
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    try {
      const response = await api.post('/api/auth/change-password', data);
      return response.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || 'Failed to change password'
      );
    }
  },

  async updateNotificationPreferences(data: any) {
    try {
      const response = await api.put('/api/users/notifications', data);
      return response.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || 'Failed to update notification preferences'
      );
    }
  },

  async getUserById(id: string) {
    try {
      const response = await api.get(`/api/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || 'Failed to fetch user'
      );
    }
  },

  async getUsers(params?: { role?: string; companyId?: string; teamId?: string }) {
    try {
      const response = await api.get('/api/users', { params });
      return response.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || 'Failed to fetch users'
      );
    }
  },
};
