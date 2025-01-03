import { User } from '@/types';
import { api } from '@/lib/api';

export interface UpdateProfileDTO {
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
    const response = await api.put<User>('/users/profile', data);
    return response.data;
  },

  updatePassword: async (data: UpdatePasswordDTO) => {
    const response = await api.put('/users/password', data);
    return response.data;
  },

  updateNotificationSettings: async (data: UpdateNotificationSettingsDTO) => {
    const response = await api.put('/users/notifications', data);
    return response.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.put('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
