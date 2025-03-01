export enum WhatsAppCampaignType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  TEMPLATE = 'TEMPLATE'
}

export enum WhatsAppCampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface WhatsAppAccount {
  id: string;
  userId: string;
  phoneNumberId: string;
  wabaid: string;
  phoneNumber: string;
  displayName: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppAudience {
  id: string;
  name: string;
  accountId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    recipients: number;
  };
  recipients?: WhatsAppRecipient[];
}

export interface WhatsAppRecipient {
  id: string;
  phoneNumber: string;
  name?: string;
  audienceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  accountId: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppCampaign {
  id: string;
  name: string;
  type: WhatsAppCampaignType;
  message?: string;
  mediaUrl?: string;
  templateId?: string;
  templateParams?: Record<string, string>;
  accountId: string;
  audienceId: string;
  status: WhatsAppCampaignStatus;
  scheduledAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  account?: {
    phoneNumber: string;
    displayName: string;
  };
  audience?: {
    name: string;
    _count?: {
      recipients: number;
    };
  };
  template?: {
    name: string;
  };
  _count?: {
    messages: number;
  };
}

export interface WhatsAppCampaignStatistics {
  totalMessages: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  pending: number;
  deliveryRate: number;
  readRate: number;
  failureRate: number;
} 