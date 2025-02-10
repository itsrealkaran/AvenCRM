import { EmailAccount, EmailCampaign, EmailRecipient, EmailTemplate } from '@/types/email';
import { api } from '@/lib/api';
import { generateCodeVerifier, generateCodeChallenge } from '@/lib/pkce';

// Email Account Management
export const fetchEmailAccounts = async (): Promise<EmailAccount[]> => {
  const response = await api.get('/email/accounts');
  if (!response.data) throw new Error('Failed to fetch accounts');
  return response.data;
};

export const connectEmailAccount = async (provider: 'GMAIL' | 'OUTLOOK'): Promise<string> => {
  // Generate PKCE values for Outlook
  if (provider === 'OUTLOOK') {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // Store code verifier in local storage to use it during callback
    console.log('Code verifier:', codeVerifier);
    localStorage.setItem('pkce_code_verifier', codeVerifier);
    
    const response = await api.get(`/email/redirect-url?provider=${provider}&code_challenge=${codeChallenge}`);
    if (!response.data) throw new Error('Failed to get redirect URL');
    return response.data.url;
  }
  
  // For other providers, proceed as normal
  const response = await api.get(`/email/redirect-url?provider=${provider}`);
  if (!response.data) throw new Error('Failed to get redirect URL');
  return response.data.url;
};

export const disconnectEmailAccount = async (accountId: string): Promise<void> => {
  const response = await api.delete(`/email/accounts/${accountId}`);
  if (!response.data) throw new Error('Failed to disconnect account');
  return;
};

// Email Template Management
export const fetchEmailTemplates = async (): Promise<EmailTemplate[]> => {
  const response = await api.get('/email/templates');
  if (!response.data) throw new Error('Failed to fetch templates');
  return response.data.templates;
};

export const fetchEmailTemplate = async (templateId: string): Promise<EmailTemplate> => {
  const response = await api.get(`/email/templates/${templateId}`);
  if (!response.data) throw new Error('Failed to fetch template');
  return response.data;
};

export const createEmailTemplate = async (
  template: Partial<EmailTemplate>
): Promise<EmailTemplate> => {
  const response = await api.post('/email/templates', template);
  if (!response.data) throw new Error('Failed to create template');
  return response.data;
};

export const updateEmailTemplate = async (
  templateId: string,
  template: Partial<EmailTemplate>
): Promise<EmailTemplate> => {
  const response = await api.put(`/email/templates/${templateId}`, template);
  if (!response.data) throw new Error('Failed to update template');
  return response.data;
};

export const deleteEmailTemplate = async (templateId: string): Promise<void> => {
  const response = await api.delete(`/email/templates/${templateId}`);
  if (!response.data) throw new Error('Failed to delete template');
  return;
};

// Email Recipients Management
export const fetchEmailRecipients = async (): Promise<EmailRecipient[]> => {
  const response = await api.get('/email/recipients');
  if (!response.data) throw new Error('Failed to fetch recipients');
  return response.data;
};

export const createEmailRecipient = async (
  recipient: Partial<EmailRecipient>
): Promise<EmailRecipient> => {
  const response = await api.post('/email/recipients', recipient);
  if (!response.data) throw new Error('Failed to create recipient');
  return response.data;
};

export const updateEmailRecipient = async (
  recipientId: string,
  recipient: Partial<EmailRecipient>
): Promise<EmailRecipient> => {
  const response = await api.put(`/email/recipients/${recipientId}`, recipient);
  if (!response.data) throw new Error('Failed to update recipient');
  return response.data;
};

export const deleteEmailRecipient = async (recipientId: string): Promise<void> => {
  const response = await api.delete(`/email/recipients/${recipientId}`);
  if (!response.data) throw new Error('Failed to delete recipient');
  return;
};

// Email Campaign Management
export const fetchEmailCampaigns = async (): Promise<EmailCampaign[]> => {
  const response = await api.get('/email/campaigns');
  if (!response.data) throw new Error('Failed to fetch campaigns');
  return response.data.campaigns;
};

export const createEmailCampaign = async (campaign: {
  title: string;
  subject: string;
  content: string;
  recipientIds: string[];
  templateId?: string;
  scheduledAt?: string;
}): Promise<EmailCampaign> => {
  const response = await api.post('/email/campaigns', campaign);
  if (!response.data) throw new Error('Failed to create campaign');
  return response.data;
};

export const cancelEmailCampaign = async (campaignId: string): Promise<void> => {
  const response = await api.post(`/email/campaigns/${campaignId}/cancel`);
  if (!response.data) throw new Error('Failed to cancel campaign');
  return;
};

export const deleteEmailCampaign = async (campaignId: string): Promise<void> => {
  const response = await api.delete(`/email/campaigns/${campaignId}`);
  if (!response.data) throw new Error('Failed to delete campaign');
  return;
};

// Email Analytics
export const getEmailAnalyticsOverview = async () => {
  const response = await api.get('/email/analytics/overview');
  if (!response.data) throw new Error('Failed to fetch analytics overview');
  return response.data;
};

export const getCampaignAnalytics = async (campaignId: string) => {
  const response = await api.get(`/email/campaigns/${campaignId}/stats`);
  if (!response.data) throw new Error('Failed to fetch campaign analytics');
  return response.data;
};
