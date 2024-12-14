import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
import { ConfidentialClientApplication } from '@azure/msal-node';
import { prisma } from '../lib/prisma.js';
import nodemailer from 'nodemailer';
import Queue from 'bull';

// Configuration interfaces
interface EmailConfig {
  provider: 'GMAIL' | 'OUTLOOK';
  accessToken: string;
  refreshToken: string;
  email: string;
}

interface BulkEmailJob {
  subject: string;
  content: string;
  recipients: string[];
  templateId?: string;
  scheduledFor?: Date;
  createdById: string;
  companyId: string;
}

// Email queue configuration
const emailQueue = new Queue('email-queue', process.env.REDIS_URL || 'redis://localhost:6379');

export class EmailService {
  private readonly GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
  private readonly GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
  private readonly GMAIL_REDIRECT_URI = process.env.GMAIL_REDIRECT_URI;
  private readonly OUTLOOK_CLIENT_ID = process.env.OUTLOOK_CLIENT_ID;
  private readonly OUTLOOK_CLIENT_SECRET = process.env.OUTLOOK_CLIENT_SECRET;
  private readonly OUTLOOK_REDIRECT_URI = process.env.OUTLOOK_REDIRECT_URI;

  constructor() {
    this.setupQueueProcessor();
  }

  private setupQueueProcessor() {
    emailQueue.process(async (job) => {
      const { recipients, subject, content, config, createdById, companyId } = job.data;
      
      try {
        if (config.provider === 'GMAIL') {
          await this.sendGmailBulk(config, recipients, subject, content);
        } else {
          await this.sendOutlookBulk(config, recipients, subject, content);
        }
        
        await prisma.emailLog.create({
          data: {
            from: config.email,
            to: recipients,
            subject,
            content,
            status: 'SENT',
            userId: createdById,
            companyId
          }
        });
      } catch (error) {
        await prisma.emailLog.create({
          data: {
            from: config.email,
            to: recipients,
            subject,
            content,
            status: 'FAILED',
            error: error.message,
            userId: createdById,
            companyId
          }
        });
        throw error;
      }
    });
  }

  async createBulkEmailJob(jobData: BulkEmailJob) {
    const emailProvider = await prisma.emailProvider.findFirst({
      where: { userId: jobData.createdById }
    });

    if (!emailProvider) {
      throw new Error('No email provider configured for this user');
    }

    const config: EmailConfig = {
      provider: emailProvider.provider as 'GMAIL' | 'OUTLOOK',
      accessToken: emailProvider.accessToken,
      refreshToken: emailProvider.refreshToken,
      email: emailProvider.email
    };

    return emailQueue.add({
      ...jobData,
      config
    }, {
      delay: jobData.scheduledFor ? new Date(jobData.scheduledFor).getTime() - Date.now() : 0
    });
  }

  async handleGmailCallback(code: string, userId: string) {
    const oauth2Client = new google.auth.OAuth2(
      this.GMAIL_CLIENT_ID,
      this.GMAIL_CLIENT_SECRET,
      this.GMAIL_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });

    await prisma.emailProvider.create({
      data: {
        provider: 'GMAIL',
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        expiresAt: new Date(tokens.expiry_date!),
        userId,
        email: profile.data.emailAddress!
      }
    });

    return { success: true };
  }

  async handleOutlookCallback(code: string, userId: string) {
    const msalConfig = {
      auth: {
        clientId: this.OUTLOOK_CLIENT_ID!,
        clientSecret: this.OUTLOOK_CLIENT_SECRET!,
        authority: 'https://login.microsoftonline.com/common'
      }
    };

    const cca = new ConfidentialClientApplication(msalConfig);
    const response = await cca.acquireTokenByCode({
      code,
      scopes: ['Mail.Send', 'User.Read'],
      redirectUri: this.OUTLOOK_REDIRECT_URI!
    });

    const graphClient = Client.init({
      authProvider: (done) => {
        done(null, response.accessToken);
      }
    });

    const user = await graphClient.api('/me').get();

    await prisma.emailProvider.create({
      data: {
        provider: 'OUTLOOK',
        accessToken: response.accessToken,
        refreshToken: response.refreshToken || '',
        expiresAt: new Date(response.expiresOn!),
        userId,
        email: user.mail
      }
    });

    return { success: true };
  }

  private async sendGmailBulk(config: EmailConfig, recipients: string[], subject: string, content: string) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: config.accessToken });

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: config.email,
        accessToken: config.accessToken,
        clientId: this.GMAIL_CLIENT_ID,
        clientSecret: this.GMAIL_CLIENT_SECRET,
        refreshToken: config.refreshToken
      }
    });

    const mailOptions = {
      from: config.email,
      bcc: recipients,
      subject,
      html: content
    };

    return transport.sendMail(mailOptions);
  }

  private async sendOutlookBulk(config: EmailConfig, recipients: string[], subject: string, content: string) {
    const graphClient = Client.init({
      authProvider: (done) => {
        done(null, config.accessToken);
      }
    });

    const message = {
      subject,
      body: {
        contentType: 'HTML',
        content
      },
      bccRecipients: recipients.map(email => ({ emailAddress: { address: email } }))
    };

    return graphClient.api('/me/sendMail').post({ message });
  }
}

export const emailService = new EmailService();