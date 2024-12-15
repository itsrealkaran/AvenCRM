export interface EmailJobData {
  emailAccountId: string;
  recipients: Array<{
    email: string;
    name?: string;
    variables?: Record<string, any>;
  }>;
  subject: string;
  content: string;
  scheduledFor?: Date;
  templateId?: string;
  campaignId?: string;
}

export interface EmailJobResult {
  success: boolean;
  emailsSent: number;
  timestamp: Date;
  error?: string;
}

export interface EmailProvider {
  sendEmail(options: EmailJobData): Promise<boolean>;
  getBatchStatus(batchId: string): Promise<any>;
  revokeAccess(emailAccountId: string): Promise<boolean>;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}
