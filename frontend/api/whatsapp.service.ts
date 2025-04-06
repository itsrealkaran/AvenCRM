import { api } from '@/lib/api';

// Account Management
export const whatsAppService = {
  // Account Management
  createAccount: async (accountData: {
    phoneNumberId: string;
    wabaid: string;
    accessToken: string;
    phoneNumber: string;
    displayName: string;
  }) => {
    const response = await api.post('/whatsapp/accounts', accountData);
    return response.data;
  },

  getAccounts: async () => {
    const response = await api.get('/whatsapp/accounts');
    return response.data;
  },

  getAccount: async (accountId: string) => {
    const response = await api.get(`/whatsapp/accounts/${accountId}`);
    return response.data;
  },

  updateAccount: async (
    accountId: string,
    data: { displayName?: string; accessToken?: string }
  ) => {
    const response = await api.put(`/whatsapp/accounts/${accountId}`, data);
    return response.data;
  },

  deleteAccount: async (accountId: string) => {
    const response = await api.delete(`/whatsapp/accounts/${accountId}`);
    return response.data;
  },

  verifyAccount: async (accountId: string) => {
    const response = await api.post(`/whatsapp/accounts/${accountId}/verify`);
    return response.data;
  },

  // Audience Management
  createAudience: async (audienceData: { name: string; accountId: string }) => {
    const response = await api.post('/whatsapp/audiences', audienceData);
    return response.data;
  },

  getAudiences: async () => {
    const response = await api.get('/whatsapp/audiences');
    return response.data;
  },

  getAudience: async (audienceId: string) => {
    const response = await api.get(`/whatsapp/audiences/${audienceId}`);
    return response.data;
  },

  // New method to get all recipients of an audience
  getAudienceRecipients: async (audienceId: string) => {
    const response = await api.get(`/whatsapp/audiences/${audienceId}/recipients`);
    console.log(response.data);
    return response.data;
  },

  updateAudience: async (audienceId: string, data: { name: string }) => {
    const response = await api.put(`/whatsapp/audiences/${audienceId}`, data);
    return response.data;
  },

  deleteAudience: async (audienceId: string) => {
    const response = await api.delete(`/whatsapp/audiences/${audienceId}`);
    return response.data;
  },

  addRecipients: async (
    audienceId: string,
    recipients: Array<{ phoneNumber: string; name?: string }>
  ) => {
    const response = await api.post(`/whatsapp/audiences/${audienceId}/recipients`, { recipients });
    return response.data;
  },

  removeRecipient: async (audienceId: string, recipientId: string) => {
    const response = await api.delete(
      `/whatsapp/audiences/${audienceId}/recipients/${recipientId}`
    );
    return response.data;
  },

  // Template Management
  createTemplate: async (templateData: { name: string; content: string; accountId: string }) => {
    const response = await api.post('/whatsapp/templates', templateData);
    return response.data;
  },

  getTemplates: async () => {
    const response = await api.get('/whatsapp/templates');
    return response.data;
  },

  getTemplate: async (templateId: string) => {
    const response = await api.get(`/whatsapp/templates/${templateId}`);
    return response.data;
  },

  updateTemplate: async (templateId: string, data: { name?: string; content?: string }) => {
    const response = await api.put(`/whatsapp/templates/${templateId}`, data);
    return response.data;
  },

  deleteTemplate: async (templateId: string) => {
    const response = await api.delete(`/whatsapp/templates/${templateId}`);
    return response.data;
  },

  // Campaign Management
  createCampaign: async (campaignData: {
    name: string;
    type: 'TEXT' | 'IMAGE' | 'TEMPLATE';
    message?: string;
    mediaUrl?: string;
    templateId?: string;
    templateParams?: Record<string, string>;
    accountId: string;
    audienceId: string;
    scheduledAt?: Date;
  }) => {
    const response = await api.post('/whatsapp/campaigns', campaignData);
    return response.data;
  },

  getCampaigns: async () => {
    const response = await api.get('/whatsapp/campaigns');
    return response.data;
  },

  getCampaign: async (campaignId: string) => {
    const response = await api.get(`/whatsapp/campaigns/${campaignId}`);
    return response.data;
  },

  updateCampaign: async (
    campaignId: string,
    data: {
      name?: string;
      message?: string;
      mediaUrl?: string;
      templateId?: string;
      templateParams?: Record<string, string>;
      audienceId?: string;
      scheduledAt?: Date;
    }
  ) => {
    const response = await api.put(`/whatsapp/campaigns/${campaignId}`, data);
    return response.data;
  },

  deleteCampaign: async (campaignId: string) => {
    const response = await api.delete(`/whatsapp/campaigns/${campaignId}`);
    return response.data;
  },

  startCampaign: async (campaignId: string) => {
    const response = await api.post(`/whatsapp/campaigns/${campaignId}/start`);
    return response.data;
  },

  pauseCampaign: async (campaignId: string) => {
    const response = await api.post(`/whatsapp/campaigns/${campaignId}/pause`);
    return response.data;
  },

  getCampaignStatistics: async (campaignId: string) => {
    const response = await api.get(`/whatsapp/campaigns/${campaignId}/statistics`);
    return response.data;
  },

  async getPhoneNumbers(page = 1, limit = 20, phoneNumberId: string) {
    const response = await api.get(
      `/whatsapp/accounts/phone-numbers?page=${page}&limit=${limit}&phoneNumberId=${phoneNumberId}`
    );
    return response.data;
  },

  async getPhoneNumberChats(
    phoneNumber: string,
    originPhoneNumberId: string,
    page = 1,
    limit = 50
  ) {
    const response = await api.get(
      `/whatsapp/accounts/phone-numbers/${phoneNumber}?page=${page}&limit=${limit}&originPhoneNumberId=${originPhoneNumberId}`
    );
    return response.data;
  },
};
