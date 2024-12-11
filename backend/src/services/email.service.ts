import { EmailProvider } from './providers/base';
import { GmailProvider } from './providers/gmail';
import { emailQueue } from '../lib/queue';
import { prisma } from '../lib/prisma';
import { EmailConfig, BulkEmailJob } from '../schemas/email.schema';

export class EmailService {
  async createBulkEmailJob(jobData: BulkEmailJob) {
    const job = await prisma.bulkEmailJob.create({
      data: {
        ...jobData,
        status: 'PENDING'
      }
    });

    const config = await this.getUserEmailConfig(job.createdById);
    await emailQueue.add({
      templateId: job.templateId,
      recipients: job.recipients,
      config
    }, {
      delay: job.scheduledFor ? new Date(job.scheduledFor).getTime() - Date.now() : 0
    });

    return job;
  }

  async handleOAuthCallback(code: string, userId: string) {
    const provider = new GmailProvider();
    const tokens = await provider.getTokensFromCode(code);
    const userInfo = await provider.getUserInfo(tokens.accessToken);

    await prisma.emailConfig.create({
      data: {
        provider: 'GMAIL',
        email: userInfo.email,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken!,
        expiresAt: new Date(Date.now() + (tokens.expiresIn * 1000)),
        userId
      }
    });
  }

  private async getUserEmailConfig(userId: string): Promise<EmailConfig> {
    const config = await prisma.emailConfig.findFirst({
      where: { userId }
    });
    if (!config) throw new Error('Email configuration not found');
    return config;
  }
}