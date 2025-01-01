import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { emailService } from '../services/email.service.js';
import logger from '../utils/logger.js';
import { EmailCampaignStatus, EmailProvider, EmailStatus, UserRole, Prisma, EmailAccountStatus } from '@prisma/client';
import { z } from 'zod';

// Define custom types for request with user

// Validation schemas
const createTemplateSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  content: z.string().min(1),
  variables: z.array(z.string()).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  isGlobal: z.boolean().optional()
});

const sendBulkEmailSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  content: z.string().min(1),
  recipients: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
    type: z.enum(['EXTERNAL', 'AGENT', 'ADMIN', 'CLIENT']),
    recipientId: z.string().optional(),
    variables: z.record(z.string()).optional()
  })),
  templateId: z.string().optional(),
  scheduledAt: z.string().datetime().optional()
});

export class EmailController {
  async provideRedirectUrl(req: Request, res: Response) {
      try {
          const { provider } = req.query;
          if (!provider) {
              return res.status(400).json({ error: 'Missing provider parameter' });
          }
          if (provider === EmailProvider.GMAIL) {
              let redirectUrl = 'https://accounts.google.com/o/oauth2/v2/auth?';
              redirectUrl += `scope=https://mail.google.com/`;
              redirectUrl += `&response_type=code`;
              redirectUrl += `&access_type=offline`;
              redirectUrl += `&client_id=${process.env.GOOGLE_CLIENT_ID}`;
              redirectUrl += `&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}`;
              return res.json({ url: redirectUrl });
          }
          if (provider === EmailProvider.OUTLOOK) {
              let redirectUrl = 'https://login.microsoft.com/oauth2/v2.0/authorize?';
              redirectUrl += `response_type=code`;
              redirectUrl += `&client_id=${process.env.OUTLOOK_CLIENT_ID}`;
              redirectUrl += `&redirect_uri=${process.env.OUTLOOK_REDIRECT_URI}`;
              redirectUrl += `&scope=openid`;
              redirectUrl += `&response_mode=query`;
              redirectUrl += `&state=12345`;
              return res.json({ url: redirectUrl });
          }
  
          // If the provider is not recognized, you might want to handle this case
          return res.status(400).json({ error: 'Unsupported provider' }); // Handle unsupported provider
      } catch (error) {
          logger.error('Provide redirect URL error:', error);
          return res.status(500).json({ 
              error: error instanceof Error ? error.message : 'Failed to provide redirect URL' 
          });
      }
  }

  async connectEmailAccount(req: Request, res: Response) {
    try {
      const { provider, code } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!provider || !code) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      if (!Object.values(EmailProvider).includes(provider)) {
        return res.status(400).json({ error: 'Invalid email provider' });
      }

      await emailService.connectEmailAccount(userId, provider, code);
      res.json({ message: 'Email account connected successfully' });
    } catch (error) {
      logger.error('Connect email account error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to connect email account' 
      });
    }
  }

  async getEmailAccounts(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const accounts = await prisma.emailAccount.findMany({
        where: { userId },
        select: {
          id: true,
          email: true,
          provider: true,
          isActive: true,
          createdAt: true
        }
      });

      res.json(accounts);
    } catch (error) {
      logger.error('Get email accounts error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch email accounts' 
      });
    }
  }

  async disconnectEmailAccount(req: Request, res: Response) {
    try {
      const { accountId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const account = await prisma.emailAccount.findFirst({
        where: { id: accountId, userId }
      });

      if (!account) {
        return res.status(404).json({ error: 'Email account not found' });
      }

      await prisma.emailAccount.delete({
        where: { id: accountId }
      });

      res.json({ message: 'Email account disconnected successfully' });
    } catch (error) {
      logger.error('Disconnect email account error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to disconnect email account' 
      });
    }
  }

  async createEmailTemplate(req: Request, res: Response) {
    try {
      const result = createTemplateSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid request data', details: result.error });
      }

      const userId = req.user?.id;
      const companyId = req.user?.companyId;

      if (!userId || !companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const template = await prisma.emailTemplate.create({
        data: {
          ...result.data,
          description: result.data.description || '',
          createdById: userId,
          companyId
        }
      });

      res.json(template);
    } catch (error) {
      logger.error('Create email template error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to create template' 
      });
    }
  }

  async getEmailTemplates(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;
      const { category, search, page = 1, limit = 10 } = req.query;

      // if (!companyId) {
      //   return res.status(401).json({ error: 'Unauthorized' });
      // }

      const where = {
        OR: [
          { companyId }
        ],
        ...(category ? { category: category as string } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search as string, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: search as string, mode: Prisma.QueryMode.insensitive } }
          ]
        } : {})
      };

      const [templates, total] = await Promise.all([
        prisma.emailTemplate.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit)
        }),
        prisma.emailTemplate.count({ where })
      ]);

      res.json({
        templates,
        pagination: {
          total,
          pages: Math.ceil(total / Number(limit)),
          currentPage: Number(page),
          perPage: Number(limit)
        }
      });
    } catch (error) {
      logger.error('Get email templates error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch templates' 
      });
    }
  }

  async sendBulkEmail(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const validationResult = sendBulkEmailSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid request data',
          details: validationResult.error.errors 
        });
      }

      const { title, subject, content, recipients, scheduledAt } = validationResult.data;

      const campaignId = await emailService.createCampaign(
        userId,
        title,
        subject,
        content,
        recipients,
        scheduledAt ? new Date(scheduledAt) : undefined
      );

      res.json({ 
        message: 'Email campaign created successfully',
        campaignId 
      });
    } catch (error) {
      logger.error('Send bulk email error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to send bulk email' 
      });
    }
  }

  async getEmailCampaigns(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;
      const { status, search, startDate, endDate, page = 1, limit = 10 } = req.query;

      if (!companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const where = {
        companyId,
        ...(status ? { status: status as EmailCampaignStatus } : {}),
        ...(search ? {
          OR: [
            { title: { contains: search as string, mode: Prisma.QueryMode.insensitive } },
            { subject: { contains: search as string, mode: Prisma.QueryMode.insensitive } }
          ]
        } : {}),
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate as string) } : {}),
            ...(endDate ? { lte: new Date(endDate as string) } : {})
          }
        } : {})
      };

      const [campaigns, total] = await Promise.all([
        prisma.emailCampaign.findMany({
          where,
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            emails: {
              select: {
                status: true,
                sentAt: true,
                campaignId: true,
                body: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit)
        }),
        prisma.emailCampaign.count({ where })
      ]);

      // Calculate campaign statistics
      const campaignsWithStats = campaigns.map(campaign => {
        const emails = campaign.emails;
        const stats = {
          totalEmails: emails.length,
          sent: emails.filter((e: { status: string; }) => e.status === EmailStatus.SENT).length,
          failed: emails.filter((e: { status: string; }) => e.status === EmailStatus.FAILED).length,
          deliveryRate: emails.length ? 
            ((emails.filter((e: { status: string; }) => e.status === EmailStatus.SENT).length / emails.length) * 100).toFixed(2) : 0,
          successRate: emails.length ? 
            ((emails.filter((e: { status: string; }) => e.status === EmailStatus.SENT).length / emails.length) * 100).toFixed(2) : 0
        };

        return {
          ...campaign,
          stats,
          Email: undefined // Remove detailed email data from response
        };
      });

      res.json({
        campaigns: campaignsWithStats,
        pagination: {
          total,
          pages: Math.ceil(total / Number(limit)),
          currentPage: Number(page),
          perPage: Number(limit)
        }
      });
    } catch (error) {
      logger.error('Get email campaigns error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch campaigns' 
      });
    }
  }

  async getCampaignStats(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const campaign = await prisma.emailCampaign.findFirst({
        where: {
          id: campaignId,
          companyId
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          emails: {
            select: {
              id: true,
              status: true,
              sentAt: true,
              error: true,
              recipients: true,

            }
          }
        }
      });

      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      // Calculate detailed statistics
      const stats = {
        delivery: {
          total: campaign.recipients,
          sent: campaign.successfulSends,
          failed: campaign.failedSends,
          successRate: campaign.totalRecipients ? 
            ((campaign.successfulSends / campaign.totalRecipients) * 100).toFixed(2) : 0,
          deliveryRate: campaign.totalRecipients ? 
            ((campaign.successfulSends / campaign.totalRecipients) * 100).toFixed(2) : 0
        },
        timing: {
          scheduledAt: campaign.scheduledAt,
          sentAt: campaign.sentAt,
          completedAt: campaign.completedAt,
          duration: campaign.completedAt && campaign.sentAt ? 
            (campaign.completedAt.getTime() - campaign.sentAt.getTime()) / 1000 : null
        }
      };

      res.json({
        campaign: {
          ...campaign,
          Email: undefined // Remove detailed email data
        },
        stats,
        emailDetails: campaign.emails.map((email) => ({
          status: email.status,
          recipient: Array.isArray(email.recipients) ? email.recipients[0] : email.recipients,
          sentAt: email.sentAt,
          error: email.error
        }))
      });
    } catch (error) {
      logger.error('Get campaign stats error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch campaign statistics' 
      });
    }
  }

  async trackEmailOpen(req: Request, res: Response) {
    try {
      const { trackingId } = req.params;
      // await emailService.trackEmailOpen(trackingId);
      
      // Return a 1x1 transparent GIF
      res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': '43',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      res.end(Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64'));
    } catch (error) {
      logger.error('Track email open error:', error);
      // Still return the tracking pixel even if tracking fails
      res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': '43'
      });
      res.end(Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64'));
    }
  }

  async trackEmailClick(req: Request, res: Response) {
    try {
      const { trackingId } = req.params;
      const { url } = req.query;

      if (!url) {
        return res.status(400).json({ error: 'Missing URL parameter' });
      }

      // await emailService.trackEmailClick(trackingId);
      
      // Redirect to the original URL
      res.redirect(url as string);
    } catch (error) {
      logger.error('Track email click error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to track email click' 
      });
    }
  }

  async getTemplateById(req: Request, res: Response) {
    try {
      const { templateId } = req.params;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const template = await prisma.emailTemplate.findFirst({
        where: {
          id: templateId,
          OR: [
            { companyId }
          ]
        }
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json(template);
    } catch (error) {
      logger.error('Get template by ID error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch template' 
      });
    }
  }

  async updateTemplate(req: Request, res: Response) {
    try {
      const { templateId } = req.params;
      const companyId = req.user?.companyId;
      const result = createTemplateSchema.safeParse(req.body);

      if (!companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!result.success) {
        return res.status(400).json({ error: 'Invalid request data', details: result.error });
      }

      const template = await prisma.emailTemplate.findFirst({
        where: {
          id: templateId,
          companyId
        }
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const updatedTemplate = await prisma.emailTemplate.update({
        where: { id: templateId },
        data: result.data
      });

      res.json(updatedTemplate);
    } catch (error) {
      logger.error('Update template error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to update template' 
      });
    }
  }

  async deleteTemplate(req: Request, res: Response) {
    try {
      const { templateId } = req.params;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const template = await prisma.emailTemplate.findFirst({
        where: {
          id: templateId,
          companyId
        }
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      await prisma.emailTemplate.delete({
        where: { id: templateId }
      });

      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      logger.error('Delete template error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to delete template' 
      });
    }
  }

  async deleteCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const campaign = await prisma.emailCampaign.findFirst({
        where: {
          id: campaignId,
          companyId
        }
      });

      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      await prisma.emailCampaign.delete({
        where: { id: campaignId }
      });

      res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
      logger.error('Delete campaign error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to delete campaign' 
      });
    }
  }

  async cancelCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const campaign = await prisma.emailCampaign.findFirst({
        where: {
          id: campaignId,
          companyId,
          status: EmailCampaignStatus.SCHEDULED
        }
      });

      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found or cannot be cancelled' });
      }

      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: { status: EmailCampaignStatus.FAILED }
      });

      res.json({ message: 'Campaign cancelled successfully' });
    } catch (error) {
      logger.error('Cancel campaign error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to cancel campaign' 
      });
    }
  }

  async getEmailAnalyticsOverview(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;
      const { startDate, endDate } = req.query;

      if (!companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const dateFilter = {
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate as string) } : {}),
            ...(endDate ? { lte: new Date(endDate as string) } : {})
          }
        } : {})
      };

      const [campaigns, templates, totalEmails] = await Promise.all([
        prisma.emailCampaign.count({
          where: { companyId, ...dateFilter }
        }),
        prisma.emailTemplate.count({
          where: { companyId }
        }),
        prisma.email.count({
          where: { 
            campaign: { companyId },
            ...dateFilter
          }
        })
      ]);

      res.json({
        overview: {
          totalCampaigns: campaigns,
          totalTemplates: templates,
          totalEmails
        }
      });
    } catch (error) {
      logger.error('Get email analytics overview error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch analytics overview' 
      });
    }
  }

  async getCampaignAnalytics(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;
      const { startDate, endDate } = req.query;

      if (!companyId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const dateFilter = {
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate as string) } : {}),
            ...(endDate ? { lte: new Date(endDate as string) } : {})
          }
        } : {})
      };

      const campaigns = await prisma.emailCampaign.findMany({
        where: {
          companyId,
          ...dateFilter
        },
        include: {
          emails: {
            select: {
              status: true
            }
          }
        }
      });

      const analytics = campaigns.map(campaign => ({
        id: campaign.id,
        title: campaign.title,
        totalRecipients: campaign.totalRecipients,
        successfulSends: campaign.successfulSends,
        failedSends: campaign.failedSends,
        status: campaign.status,
        createdAt: campaign.createdAt
      }));

      res.json({ analytics });
    } catch (error) {
      logger.error('Get campaign analytics error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch campaign analytics' 
      });
    }
  }

  async validateEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email address is required' });
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(email);

      res.json({ 
        isValid,
        email 
      });
    } catch (error) {
      logger.error('Validate email error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to validate email' 
      });
    }
  }

  async sendTestEmail(req: Request, res: Response) {
    try {
      const { email, subject, content } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!email || !subject || !content) {
        return res.status(400).json({ error: 'Email, subject, and content are required' });
      }

      await this.scheduleEmail({
        emailAccountId: userId,
        recipients: [{ email }],
        subject,
        content
      });

      res.json({ message: 'Test email sent successfully' });
    } catch (error) {
      logger.error('Send test email error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to send test email' 
      });
    }
  }

  async scheduleEmail(data: {
    emailAccountId: string;
    recipients: Array<{ email: string; name?: string; variables?: Record<string, any> }>;
    subject: string;
    content: string;
    scheduledFor?: Date;
    campaignId?: string;
  }): Promise<string> {
    return emailService.scheduleEmail(data);
  }

  private async processRecipients(recipients: any[], companyId: string) {
    const processedRecipients = [];

    for (const recipient of recipients) {
      let processedRecipient: any = {
        email: recipient.email,
        name: recipient.name,
        type: recipient.type,
        variables: recipient.variables
      };

      // If recipient is internal (agent/admin), validate and get details
      if (recipient.type === 'AGENT' || recipient.type === 'ADMIN') {
        const user = await prisma.user.findFirst({
          where: {
            id: recipient.recipientId,
            companyId
          }
        });

        if (!user) {
          throw new Error(`Invalid recipient ID: ${recipient.recipientId}`);
        }

        processedRecipient = {
          ...processedRecipient,
          recipientId: user.id,
          email: user.email,
          name: user.name
        };
      }

      // If recipient is a client, validate from leads
      if (recipient.type === 'CLIENT') {
        const client = await prisma.lead.findFirst({
          where: {
            id: recipient.recipientId,
            companyId
          }
        });

        if (!client) {
          throw new Error(`Invalid client ID: ${recipient.recipientId}`);
        }

        processedRecipient = {
          ...processedRecipient,
          recipientId: client.id,
          email: client.email,
          name: client.name
        };
      }

      processedRecipients.push(processedRecipient);
    }

    return processedRecipients;
  }
}

export const emailController = new EmailController();