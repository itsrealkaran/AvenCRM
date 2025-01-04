import { google } from 'googleapis';
import { prisma } from '../lib/prisma.js';
import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import { 
  EmailCampaign,
  EmailCampaignStatus, 
  EmailProvider as EmailProviderEnum, 
  EmailStatus,
  EmailAccount,
  Prisma,
  EmailAccountStatus,
  EmailRecipient,
  EmailTemplate
} from '@prisma/client';
import { emailQueue } from './email.queue.js';

interface EmailJobData {
  emailAccountId: string;
  recipientIds: string[];
  subject: string;
  content: string;
  scheduledFor?: Date;
  campaignId?: string;
}

interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

class EmailService {
  private readonly gmail = google.gmail('v1');
  private readonly oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    
    if (!clientId || !clientSecret || !redirectUri) {
      logger.error('Missing Gmail OAuth2 configuration');
      throw new Error('Missing Gmail OAuth2 configuration');
    }

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
  }

  async connectEmailAccount(userId: string, provider: EmailProviderEnum, code: string): Promise<void> {
    try {
      let tokens: OAuthTokens;
      let email = '';

      switch (provider) {
        case EmailProviderEnum.GMAIL:
          tokens = await this.getGmailTokens(code);
          email = await this.getGmailEmail(tokens.accessToken);
          break;
        case EmailProviderEnum.OUTLOOK:
          tokens = await this.getOutlookTokens(code);
          email = await this.getOutlookEmail(tokens.accessToken);
          break;
        default:
          throw new Error('Unsupported email provider');
      }

      await prisma.emailAccount.create({
        data: {
          userId,
          provider,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          email,
          isActive: true,
          status: EmailAccountStatus.ACTIVE,
          lastError: ''
        }
      });
    } catch (error) {
      logger.error('Connect email account error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to connect email account');
    }
  }

  async scheduleEmail(data: EmailJobData): Promise<string> {
    try {
      let jobId: any;
      if(data.recipientIds.length > 1) {
        jobId = await emailQueue.add('send-bulk-email', data, {
          delay: data.scheduledFor ? new Date(data.scheduledFor).getTime() - Date.now() : 0,
          attempts: 1,
          backoff: {
            type: 'exponential',
            delay: 1000
          },
          removeOnComplete: true,
          removeOnFail: false
        });
      } else {
        jobId = await emailQueue.add('send-email', data, {
          delay: data.scheduledFor ? new Date(data.scheduledFor).getTime() - Date.now() : 0,
          attempts: 1,
          backoff: {
            type: 'exponential',
            delay: 1000
          },
          removeOnComplete: true,
          removeOnFail: false
        });
      }

      return jobId.id ?? '';
    } catch (error) {
      logger.error('Schedule email error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to schedule email');
    }
  }

  async createCampaign(
    userId: string,
    title: string,
    subject: string,
    content: string,
    recipientIds: string[],
    scheduledFor?: Date
  ): Promise<string> {
    try {
      const agent = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { companyId: true }
      });

      if (!agent) {
        throw new Error('Agent not found');
      }

      const recipients = await prisma.emailRecipient.findMany({
        where: {
          id: {
            in: recipientIds
          }
        }
      });

      const campaign = await prisma.emailCampaign.create({
        data: {
          title,
          subject,
          content,
          recipients: {
            connect: recipients.map(recipient => ({ id: recipient.id }))
          },
          totalRecipients: recipients.length,
          status: EmailCampaignStatus.SCHEDULED,
          scheduledAt: scheduledFor,
          createdById: userId,
          companyId: agent.companyId || ''
        }
      });

      if (!campaign) {
        throw new Error('Failed to create campaign');
      }

      const emailAccounts = await prisma.emailAccount.findMany({
        where: {
          userId,
          isActive: true
        }
      });

      if (emailAccounts.length === 0) {
        throw new Error('No active email accounts found');
      }

      await this.scheduleEmail({
        emailAccountId: emailAccounts[0].id,
        recipientIds,
        subject,
        content,
        scheduledFor,
        campaignId: campaign.id
      });

      return campaign.id;
    } catch (error) {
      logger.error('Create campaign error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create campaign');
    }
  }

  private async getGmailTokens(code: string): Promise<OAuthTokens> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      if (!tokens.access_token) {
        throw new Error('No access token received from Gmail');
      }

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || '',
        expiresAt: new Date(tokens.expiry_date || Date.now() + 3600 * 1000)
      };
    } catch (error) {
      logger.error('Get Gmail tokens error:', error);
      throw error;
    }
  }

  private async getGmailEmail(accessToken: string): Promise<string> {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      
      const profile = await gmail.users.getProfile({
        userId: 'me'
      });

      if (!profile.data.emailAddress) {
        throw new Error('Could not retrieve email address from Gmail');
      }

      return profile.data.emailAddress;
    } catch (error) {
      logger.error('Get Gmail email error:', error);
      throw error;
    }
  }

  private async getOutlookTokens(code: string): Promise<OAuthTokens> {
    // Implement Outlook token retrieval
    throw new Error('Outlook integration not implemented yet');
  }

  private async getOutlookEmail(accessToken: string): Promise<string> {
    // Implement Outlook email retrieval
    throw new Error('Outlook integration not implemented yet');
  }

  async createTransporter(emailAccountId: string) {
    try {
      let emailAccount = await prisma.emailAccount.findUnique({
        where: { id: emailAccountId },
      });

      if (!emailAccount) {
        throw new Error('Email account not found');
      }

      if (!emailAccount.refreshToken) {
        await prisma.emailAccount.update({
          where: { id: emailAccountId },
          data: {
            status: EmailAccountStatus.NEEDS_REAUTH,
            lastError: 'Missing refresh token - requires reauthorization'
          }
        });
        throw new Error('Email account requires reauthorization - missing refresh token');
      }

      // Check if token needs refresh (5 minutes buffer)
      const needsRefresh = emailAccount.expiresAt.getTime() - Date.now() < 5 * 60 * 1000;

      if (needsRefresh) {
        await this.refreshAccessToken(emailAccount);
        // Fetch updated account after refresh
        const updatedAccount = await prisma.emailAccount.findUnique({
          where: { id: emailAccountId },
        });
        if (!updatedAccount || updatedAccount.status !== EmailAccountStatus.ACTIVE) {
          throw new Error('Failed to refresh access token - account needs reauthorization');
        }
        emailAccount = updatedAccount;
      }

      switch (emailAccount.provider) {
        case EmailProviderEnum.GMAIL:
          if (!emailAccount.email || !emailAccount.accessToken || !emailAccount.refreshToken) {
            throw new Error('Missing required Gmail credentials');
          }

          this.oauth2Client.setCredentials({
            access_token: emailAccount.accessToken,
            refresh_token: emailAccount.refreshToken,
            expiry_date: emailAccount.expiresAt.getTime()
          });

          return nodemailer.createTransport({
            service: 'gmail',
            auth: {
              type: 'OAuth2',
              user: emailAccount.email,
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              refreshToken: emailAccount.refreshToken,
              accessToken: emailAccount.accessToken
            }
          });

        case EmailProviderEnum.OUTLOOK:
          throw new Error('Outlook integration not implemented yet');

        default:
          throw new Error('Unsupported email provider');
      }
    } catch (error) {
      logger.error('Create transporter error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create email transporter';
      
      // Update account status if there's an error
      if (emailAccountId) {
        await prisma.emailAccount.update({
          where: { id: emailAccountId },
          data: {
            status: EmailAccountStatus.NEEDS_REAUTH,
            lastError: errorMessage
          }
        }).catch(updateError => {
          logger.error('Failed to update email account status:', updateError);
        });
      }
      
      throw new Error(errorMessage);
    }
  }

  private async refreshAccessToken(emailAccount: EmailAccount): Promise<void> {
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < maxRetries) {
      try {
        if (!emailAccount.refreshToken) {
          throw new Error('No refresh token available');
        }

        this.oauth2Client.setCredentials({
          refresh_token: emailAccount.refreshToken
        });

        const { credentials } = await this.oauth2Client.refreshAccessToken();
        
        if (!credentials.access_token) {
          throw new Error('Failed to obtain new access token');
        }

        await prisma.emailAccount.update({
          where: { id: emailAccount.id },
          data: {
            accessToken: credentials.access_token,
            expiresAt: new Date(credentials.expiry_date || Date.now() + 3600 * 1000),
            status: EmailAccountStatus.ACTIVE,
            lastError: ''
          }
        });

        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error during token refresh');
        retryCount++;
        
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
          continue;
        }

        logger.error('Refresh token error:', error);
        await prisma.emailAccount.update({
          where: { id: emailAccount.id },
          data: {
            status: EmailAccountStatus.NEEDS_REAUTH,
            lastError: lastError.message
          }
        });
        
        throw new Error(`Failed to refresh access token after ${maxRetries} attempts: ${lastError.message}`);
      }
    }
  }

  processTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, variable) => 
      variables[variable]?.toString() || match
    );
  }
}

export const emailService = new EmailService();