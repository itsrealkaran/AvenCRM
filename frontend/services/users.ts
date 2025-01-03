import { User } from '@/types';

import { api } from '@/lib/api';

export interface UpdateProfileDTO {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  dob?: Date;
  designation?: string;
}

export interface UpdatePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateNotificationSettingsDTO {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
}

export const usersApi = {
  updateProfile: async (data: UpdateProfileDTO) => {
    try {
      const response = await api.put<User>('/user/profile', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  updatePassword: async (data: UpdatePasswordDTO) => {
    try {
      const response = await api.put('/user/password', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update password');
    }
  },

  updateNotificationSettings: async (data: UpdateNotificationSettingsDTO) => {
    try {
      const response = await api.put('/user/notifications', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update notification settings');
    }
  },

  uploadAvatar: async (file: File) => {
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        throw new Error('File size must be less than 5MB');
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.put('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload avatar');
    }
  },
};
