import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { emailService } from '../services/email.service.js';
import logger from '../utils/logger.js';
import { EmailCampaignStatus, EmailProvider, EmailStatus, UserRole, Prisma, EmailAccountStatus, EmailRecipient } from '@prisma/client';
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
  recipientIds: z.array(z.string()).min(1),
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
              redirectUrl += `scope=${encodeURIComponent(
                'https://mail.google.com/ ' +
                'https://www.googleapis.com/auth/gmail.send ' +
                'https://www.googleapis.com/auth/gmail.compose ' +
                'https://www.googleapis.com/auth/gmail.modify'
              )}`;
              redirectUrl += `&response_type=code`;
              redirectUrl += `&access_type=offline`;
              redirectUrl += `&prompt=consent`;
              redirectUrl += `&client_id=${process.env.GOOGLE_CLIENT_ID}`;
              redirectUrl += `&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}`;
              return res.json({ url: redirectUrl });
          }
          if (provider === EmailProvider.OUTLOOK) {
              const { code_challenge } = req.query;
              if (!code_challenge) {
                  return res.status(400).json({ error: 'Missing code_challenge parameter for PKCE' });
              }

              let redirectUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?';
              redirectUrl += `response_type=code`;
              redirectUrl += `&client_id=${process.env.OUTLOOK_CLIENT_ID}`;
              redirectUrl += `&redirect_uri=${encodeURIComponent(process.env.OUTLOOK_REDIRECT_URI!)}`;
              redirectUrl += `&scope=${encodeURIComponent(
                'offline_access ' +
                'https://graph.microsoft.com/mail.read ' +
                'https://graph.microsoft.com/mail.send ' +
                'https://graph.microsoft.com/user.read'
              )}`;
              // Add PKCE parameters
              redirectUrl += `&code_challenge_method=S256`;
              redirectUrl += `&code_challenge=${code_challenge}`;
              
              logger.info('Generated Outlook OAuth URL:', { redirectUrl });
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
      const { code, provider, code_verifier } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!code || !provider) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      // For Outlook, require code_verifier
      if (provider === EmailProvider.OUTLOOK && !code_verifier) {
        return res.status(400).json({ error: 'Missing code_verifier for Outlook OAuth' });
      }

      await emailService.connectEmailAccount(userId, provider, code, code_verifier);
      res.json({ success: true });
    } catch (error) {
      logger.error('Connect email account error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to connect email account' });
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
          createdAt: true,
          updatedAt: true,
          status: true
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
      const userId = req.user?.id;
      const { category, search, page = 1, limit = 10 } = req.query;

      if (!companyId) {
        // return the templates  having userId as userId
        const templates = await prisma.emailTemplate.findMany({
          where: { createdById: userId },
          orderBy: { createdAt: 'desc' },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit)
        });
        const total = await prisma.emailTemplate.count({ where: { createdById: userId } });
        return res.json({
          templates,
          pagination: {
            total,
            pages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            perPage: Number(limit)
          }
        });
      }

      // if company ID is present then return all the tempates created  by user and the templates present in compnay which are not private
      const templates = await prisma.emailTemplate.findMany({
        where: { 
          OR: [{ createdById: userId }, { companyId, isPrivate: false }],
          category: category as string,
          name: { contains: search as string, mode: Prisma.QueryMode.insensitive }
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });
      const total = await prisma.emailTemplate.count({
        where: { 
          OR: [{ createdById: userId }, { companyId, isPrivate: false }],
          category: category as string,
          name: { contains: search as string, mode: Prisma.QueryMode.insensitive }
        }
      });
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

      const { title, subject, content, recipientIds, scheduledAt } = validationResult.data;

      const campaignId = await emailService.createCampaign(
        userId,
        title,
        subject,
        content,
        recipientIds,
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
      const userId = req.user?.id;
      const { status, search, startDate, endDate, page = 1, limit = 10 } = req.query;

      if (!companyId) {
        // return the templates  having userId as userId
        const campaigns = await prisma.emailCampaign.findMany({
          where: { createdById: userId },
          orderBy: { createdAt: 'desc' },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit)
        });
        const total = await prisma.emailCampaign.count({ where: { createdById: userId } });
        return res.json({
          campaigns,
          pagination: {
            total,
            pages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            perPage: Number(limit)
          }
        });
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
            Email: {
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
        const emails = campaign.Email;
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
          Email: {
            select: {
              id: true,
              status: true,
              sentAt: true,
              error: true,
              recipients: true,

            }
          },
          recipients: true
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
        emailDetails: campaign.Email.map((email) => ({
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
          Email: {
            select: {
              status: true,
              recipients: true,
              sentAt: true,
              error: true
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

  async getRecipients(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const companyId = req.user?.companyId ?? '';
      const recipients = await prisma.emailRecipient.findMany({
        where: { userId, companyId },
        select: { id: true, email: true, name: true, tags: true, notes: true, isPrivate: true }
      });
      res.json(recipients);
    } catch (error) {
      logger.error('Get recipients error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch recipients' });
    }
  }

  async createRecipient(req: Request, res: Response) {
    try {
      const { email, name, tags, notes, isPrivate } = req.body;
      if (!email || !name) {
        return res.status(400).json({ error: 'Email and name are required' });
      }
      const userId = req.user?.id;
      const companyId = req.user?.companyId ?? '';
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const recipient = await prisma.emailRecipient.create({
        data: { email, name, userId, companyId, tags, notes, isPrivate }
      });
      res.json(recipient);
    } catch (error) {
      logger.error('Create recipient error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create recipient' });
    }
  }

  async updateRecipient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { email, name } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const recipient = await prisma.emailRecipient.findUnique({
        where: { id, userId }
      });
      if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found' });
      }
      const updatedRecipient = await prisma.emailRecipient.update({
        where: { id },
        data: { email, name }
      });
      res.json(updatedRecipient);
    } catch (error) {
      logger.error('Update recipient error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update recipient' });
    }
  }

  async deleteRecipient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const recipient = await prisma.emailRecipient.findUnique({
        where: { id, userId }
      });
      if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found' });
      }
      await prisma.emailRecipient.delete({ where: { id } });
      res.json({ message: 'Recipient deleted successfully' });
    } catch (error) {
      logger.error('Delete recipient error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete recipient' });
    }
  }

  async scheduleEmail(data: {
    emailAccountId: string;
    recipientIds: string[];
    subject: string;
    content: string;
    scheduledFor?: Date;
    campaignId?: string;
  }): Promise<string> {
    return emailService.scheduleEmail(data);
  }

  private async processRecipients(recipients: EmailRecipient[], companyId: string) {
    const processedRecipients = [];

    for (const recipient of recipients) {
      let processedRecipient: any = {
        email: recipient.email,
        name: recipient.name,
        recipientId: recipient.id
      };


      // // If recipient is a client, validate from leads
      // if (recipient.type === 'CLIENT') {
      //   const client = await prisma.lead.findFirst({
      //     where: {
      //       id: recipient.recipientId,
      //       companyId
      //     }
      //   });

      //   if (!client) {
      //     throw new Error(`Invalid client ID: ${recipient.recipientId}`);
      //   }

      //   processedRecipient = {
      //     ...processedRecipient,
      //     recipientId: client.id,
      //     email: client.email,
      //     name: client.name
      //   };
      // }

      processedRecipients.push(processedRecipient);
    }

    return processedRecipients;
  }
}

export const emailController = new EmailController();