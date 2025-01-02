import { EmailAccountStatus, EmailCampaignStatus, EmailProvider, EmailStatus } from './enums';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  companyId: string;
}

export interface EmailRecipient {
  id: string;
  name: string;
  email: string;
  tags: string[];
  notes?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  companyId: string;
}

export interface EmailAccount {
  id: string;
  email: string;
  provider: EmailProvider;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  idToken?: string;
  isActive: boolean;
  status: EmailAccountStatus;
  lastError: string;
  userId: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailCampaign {
  id: string;
  name: string;
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
  userId: string;
  companyId: string;
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
