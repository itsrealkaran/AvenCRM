export enum WhatsAppAccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

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

export enum WhatsAppMessageStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED'
}

export interface WhatsAppAccountDto {
  phoneNumberId: string;
  wabaid: string;
  accessToken: string;
  phoneNumber: string;
  displayName: string;
}

export interface WhatsAppAudienceDto {
  name: string;
  accountId: string;
}

export interface WhatsAppRecipientDto {
  phoneNumber: string;
  name?: string;
  audienceId: string;
}

export interface WhatsAppTemplateDto {
  name: string;
  content: string;
  accountId: string;
}

export interface WhatsAppCampaignDto {
  name: string;
  type: WhatsAppCampaignType;
  message?: string;
  mediaUrl?: string;
  templateId?: string;
  templateParams?: Record<string, string>;
  accountId: string;
  audienceId: string;
  scheduledAt?: Date;
} 