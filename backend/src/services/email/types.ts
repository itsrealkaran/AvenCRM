import { EmailProvider, EmailStatus } from '@prisma/client';

export interface EmailAccountDTO {
  provider: EmailProvider;
  email: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
  companyId: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailDTO {
  subject: string;
  body: string;
  recipients: EmailRecipient[];
  scheduledFor?: Date;
  campaignId?: string;
  emailAccountId: string;
}

export interface EmailProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export class EmailError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'EmailError';
  }
}

type EmailRecipientStatus = 'PENDING' | 'SENT' | 'FAILED';

export const EMAIL_ERROR_CODES = {
  ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SEND_FAILED: 'SEND_FAILED',
  INVALID_RECIPIENT: 'INVALID_RECIPIENT',
} as const;
