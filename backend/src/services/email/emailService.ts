import { PrismaClient, EmailProvider, EmailStatus } from '@prisma/client';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as nodemailer from 'nodemailer';
import { Queue } from 'bullmq';
import { 
  EmailAccountDTO, 
  SendEmailDTO, 
  EmailError, 
  EMAIL_ERROR_CODES 
} from './types.js';

export class EmailService {
  private prisma: PrismaClient;
  private emailQueue: Queue;
  private readonly googleOAuth2Client: OAuth2Client;
  private readonly maxRetries = 3;
  private readonly retryDelay = 5000;

  constructor(prisma: PrismaClient, emailQueue: Queue) {
    this.prisma = prisma;
    this.emailQueue = emailQueue;
    
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new EmailError(
        'Missing Google OAuth credentials',
        EMAIL_ERROR_CODES.INVALID_CREDENTIALS,
        500
      );
    }

    this.googleOAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
  }

  async connectEmailAccount(data: EmailAccountDTO) {
    try {
      const existingAccount = await this.prisma.emailAccount.findFirst({
        where: {
          email: data.email,
          userId: data.userId,
        },
      });

      if (existingAccount) {
        return await this.prisma.emailAccount.update({
          where: { id: existingAccount.id },
          data: {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiresAt: new Date(Date.now() + 3600 * 1000),
            isActive: true,
          },
        });
      }

      return await this.prisma.emailAccount.create({
        data: {
          provider: data.provider,
          email: data.email,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: new Date(Date.now() + 3600 * 1000),
          user: { connect: { id: data.userId } },
          company: { connect: { id: data.companyId } },
          isActive: true,
        },
      });
    } catch (error) {
      throw new EmailError(
        'Failed to connect email account',
        EMAIL_ERROR_CODES.INVALID_CREDENTIALS,
        500,
        error
      );
    }
  }

  async scheduleEmail(data: SendEmailDTO) {
    try {
      // Validate recipients
      if (!data.recipients.length) {
        throw new EmailError(
          'No recipients specified',
          EMAIL_ERROR_CODES.INVALID_RECIPIENT,
          400
        );
      }

      // Create email record with proper error handling
      const email = await this.prisma.email.create({
        data: {
          subject: data.subject,
          body: data.body,
          scheduledFor: data.scheduledFor,
          status: EmailStatus.PENDING,
          sender: { connect: { id: data.emailAccountId } },
          campaign: data.campaignId ? { connect: { id: data.campaignId } } : undefined,
          recipients: {
            create: data.recipients.map(recipient => ({
              email: recipient.email,
              name: recipient.name,
              status: 'PENDING',
            })),
          },
        },
        include: {
          recipients: true,
        },
      });

      // Add to queue with retry logic
      await this.emailQueue.add(
        'sendEmail',
        { emailId: email.id },
        {
          delay: data.scheduledFor ? new Date(data.scheduledFor).getTime() - Date.now() : 0,
          attempts: this.maxRetries,
          backoff: {
            type: 'exponential',
            delay: this.retryDelay,
          },
          removeOnComplete: true,
          removeOnFail: false,
        }
      );

      return email;
    } catch (error) {
      throw new EmailError(
        'Failed to schedule email',
        EMAIL_ERROR_CODES.SEND_FAILED,
        500,
        error
      );
    }
  }

  async refreshGmailToken(emailAccountId: string): Promise<string> {
    try {
      const emailAccount = await this.prisma.emailAccount.findUnique({
        where: { id: emailAccountId },
      });

      if (!emailAccount) {
        throw new EmailError(
          'Email account not found',
          EMAIL_ERROR_CODES.ACCOUNT_NOT_FOUND,
          404
        );
      }

      this.googleOAuth2Client.setCredentials({
        refresh_token: emailAccount.refreshToken,
      });

      const { credentials } = await this.googleOAuth2Client.refreshAccessToken();

      if (!credentials.access_token) {
        throw new EmailError(
          'Failed to refresh access token',
          EMAIL_ERROR_CODES.TOKEN_EXPIRED,
          401
        );
      }

      await this.prisma.emailAccount.update({
        where: { id: emailAccountId },
        data: {
          accessToken: credentials.access_token,
          expiresAt: new Date(Date.now() + (credentials.expiry_date || 3600 * 1000)),
        },
      });

      return credentials.access_token;
    } catch (error) {
      if (error instanceof EmailError) throw error;
      
      throw new EmailError(
        'Failed to refresh token',
        EMAIL_ERROR_CODES.TOKEN_EXPIRED,
        401,
        error
      );
    }
  }

  async createTransporter(emailAccountId: string) {
    try {
      const emailAccount = await this.prisma.emailAccount.findUnique({
        where: { id: emailAccountId },
      });

      if (!emailAccount) {
        throw new EmailError(
          'Email account not found',
          EMAIL_ERROR_CODES.ACCOUNT_NOT_FOUND,
          404
        );
      }

      if (emailAccount.provider === EmailProvider.GMAIL) {
        let accessToken = emailAccount.accessToken;

        if (new Date() >= emailAccount.expiresAt) {
          accessToken = await this.refreshGmailToken(emailAccountId);
        }

        return nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: emailAccount.email,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: emailAccount.refreshToken,
            accessToken,
          },
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
          rateDelta: 1000,
          rateLimit: 30,
        });
      }

      throw new EmailError(
        'Unsupported email provider',
        EMAIL_ERROR_CODES.INVALID_CREDENTIALS,
        400
      );
    } catch (error) {
      if (error instanceof EmailError) throw error;
      
      throw new EmailError(
        'Failed to create email transporter',
        EMAIL_ERROR_CODES.INVALID_CREDENTIALS,
        500,
        error
      );
    }
  }
}
