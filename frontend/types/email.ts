import { EmailAccountStatus, EmailCampaignStatus, EmailProvider, EmailStatus } from './enums';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables?: string[];
  description?: string;
  category?: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  status: EmailStatus;
  lastEmailSentAt?: Date;
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
  lastError?: string;
  lastSyncAt?: Date;
  userId: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailCampaign {
  id: string;
  title: string;
  subject: string;
  content: string;
  templateId?: string;
  status: EmailCampaignStatus;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  openCount: number;
  clickCount: number;
  error?: string;
  companyId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Email {
  id: string;
  subject: string;
  content: string;
  scheduledFor?: Date;
  sentAt?: Date;
  status: EmailStatus;
  error?: string;
  emailAccountId: string;
  campaignId?: string;
  recipientId: string;
  trackingId?: string;
  openedAt?: Date;
  clickedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
