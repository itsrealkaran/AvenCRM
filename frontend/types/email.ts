import { EmailStatus, EmailProvider, EmailAccountStatus, EmailCampaignStatus } from './enums';

export interface EmailAccount {
  id: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  idToken?: string;
  isActive: boolean;
  provider: EmailProvider;
  status: EmailAccountStatus;
  lastError: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailCampaign {
  id: string;
  title: string;
  subject: string;
  content: string;
  companyId: string;
  createdById: string;
  status: EmailCampaignStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  completedAt?: Date;
  totalRecipients: number;
  successfulSends: number;
  failedSends: number;
  recipients: Record<string, any>;
  templateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Email {
  id: string;
  subject: string;
  body: string;
  scheduledFor?: Date;
  sentAt?: Date;
  status: EmailStatus;
  error?: string;
  emailAccountId: string;
  campaignId?: string;
  recipients: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  companyId: string;
  createdById: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
