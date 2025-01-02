import { Company } from '@/types';
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loops by checking retry flag
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (response.data.access_token) {
          // Retry the original request
          return api(originalRequest);
        } else {
          // If no new token received, redirect to login
          window.location.href = '/sign-in';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Clear any existing tokens
        document.cookie = 'Authorization=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'RefreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

        // Only redirect if we're not already on the sign-in page
        if (!window.location.pathname.includes('/sign-in')) {
          window.location.href = '/sign-in';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Company related API calls
export const companyAPI = {
  getAll: () => api.get('/company'),
  getById: (id: string) => api.get(`/company/${id}`),
  create: (data: any) => api.post('/company', data),
  update: (id: string, data: any) => api.put(`/company/${id}`, data),
  delete: (id: string) => api.delete(`/company/${id}`),
  getAdmins: () => api.get('/user/admins'),
  // getPlans: () => api.get('/plans'),
};
