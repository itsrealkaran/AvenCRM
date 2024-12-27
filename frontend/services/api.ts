import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types/user';

import apiClient from '@/lib/axios';

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

// Add other API services as needed
export const userApi = {
  // User related endpoints
};

export const companyApi = {
  // Company related endpoints
};

// ... other API services
