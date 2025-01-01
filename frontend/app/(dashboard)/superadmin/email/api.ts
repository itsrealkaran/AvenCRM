import { api } from '@/lib/api';

export const fetchEmails = async () => {
  const response = await api.get('/email/accounts');
  if (!response.data) throw new Error('Failed to fetch accounts');
  return response.data;
};

export const connectEmailAccount = async (provider: 'GMAIL' | 'OUTLOOK') => {
  const response = await api.get(`/email/config?provider=${provider}`);
  if (!response.data) throw new Error('Failed to get redirect URL');
  const { url } = response.data;
  return url;
};

export const disconnectEmailAccount = async (accountId: string) => {
  const response = await api.delete(`/email/accounts/${accountId}`);
  if (!response.data) throw new Error('Failed to disconnect account');
  return response.data;
};
