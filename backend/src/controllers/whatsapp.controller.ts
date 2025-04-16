import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { whatsAppService } from '../services/whatsapp.service.js';
import { WhatsAppCampaignStatus } from '../types/whatsapp.types.js';
import logger from '../utils/logger.js';
import { BaseController } from './base.controllers.js';
import { Prisma } from '@prisma/client';

interface SSEClient {
  userId: string;
  res: Response;
}

declare global {
  var sseClients: SSEClient[];
}

// Initialize the global variable
global.sseClients = [];

export class WhatsAppController extends BaseController {

  async getAccessToken(req: Request, res: Response) {
    try {
      for (let i = 0; i < 3; i++) {
        try {
          const { code } = req.params;
          const response = await fetch(
            `https://graph.facebook.com/v22.0/oauth/access_token?client_id=${process.env.META_ADS_CLIENT_ID}&client_secret=${process.env.META_ADS_CLIENT_SECRET}&code=${code}`,
          );
          const data: any = await response.json();
          console.log(data, 'data from get access token');
          return res.status(200).json({ access_token: data.access_token });
        } catch (error: any) {
          console.error('Facebook API Error:', error);
        }
      }
      return res.status(500).json({
        error: 'UNKNOWN_ERROR',
        code: 'UNKNOWN_ERROR'
      });
    } catch (error: any) {
      console.error('Facebook API Error:', error.message);
      return res.status(500).json({
        error: error,
        code: error.code || 'UNKNOWN_ERROR'
      });
    }
  }

  // Account Management
  async createAccount(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { wabaid, accessToken, phoneNumberData, phoneNumberIds, displayName } = req.body;

      if (!wabaid || !accessToken || !phoneNumberData || !displayName) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const account = await prisma.$transaction(async (tx) => {
        const account = await whatsAppService.createAccount(req.user!.id, {
          wabaid,
          accessToken,
          phoneNumberIds,
          displayName,
        });

        await tx.whatsAppPhoneNumber.createMany({
          data: phoneNumberData.map((phoneNumber: any) => ({
            ...phoneNumber,
            accountId: account.id
          }))
        });

        return account;
      });

      return res.status(201).json(account);
    } catch (error) {
      logger.error('Error creating WhatsApp account:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAccounts(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const account = await prisma.whatsAppAccount.findFirst({
        where: { userId: req.user.id },
        include: {
          phoneNumbers: true
        }
      });

      return res.status(200).json(account);
    } catch (error) {
      logger.error('Error getting WhatsApp accounts:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAccount(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const accountId = req.params.id;

      const account = await prisma.whatsAppAccount.findUnique({
        where: { id: accountId }
      });

      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }

      if (account.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      return res.status(200).json(account);
    } catch (error) {
      logger.error('Error getting WhatsApp account:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateAccount(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const accountId = req.params.id;
      const { displayName, accessToken } = req.body;

      const account = await prisma.whatsAppAccount.findUnique({
        where: { id: accountId }
      });

      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }

      if (account.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const updateData: any = {};
      if (displayName) updateData.displayName = displayName;
      if (accessToken) updateData.accessToken = whatsAppService.encrypt(accessToken);

      const updatedAccount = await prisma.whatsAppAccount.update({
        where: { id: accountId },
        data: updateData
      });

      return res.status(200).json(updatedAccount);
    } catch (error) {
      logger.error('Error updating WhatsApp account:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteAccount(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const accountId = req.params.id;

      await prisma.whatsAppPhoneNumber.deleteMany({
        where: {
          accountId: accountId
        }
      });

      const account = await prisma.whatsAppAccount.findUnique({
        where: { id: accountId }
      });

      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }

      if (account.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      await prisma.whatsAppAccount.delete({
        where: { id: accountId }
      });

      return res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
      logger.error('Error deleting WhatsApp account:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateRegisteredNumberStatus(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.body;

      const phoneNumber = await prisma.whatsAppPhoneNumber.update({
        where: { id },
        data: {
          isRegistered: true
        }
      });

      if (!phoneNumber) {
        return res.status(404).json({ message: 'Phone number not found' });
      }

      return res.status(200).json({ message: 'Phone number registered successfully' });
    } catch (error) {
      logger.error('Error registering WhatsApp number:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async verifyAccount(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { phoneNumberId } = req.query;

      const phoneNumber = await prisma.whatsAppPhoneNumber.findFirst({
        where: {
          account: {
            userId: req.user.id
          },
          phoneNumberId: phoneNumberId as string
        }
      });

      if (!phoneNumber) {
        return res.status(404).json({ message: 'Account not found' });
      }

      await prisma.whatsAppPhoneNumber.update({
        where: { id: phoneNumber.id },
        data: {
          codeVerificationStatus: 'VERIFIED'
        }
      });

      return res.status(200).json({ message: 'Account verified successfully' });
    } catch (error) {
      logger.error('Error verifying WhatsApp account:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Audience Management
  async createAudience(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { name, accountId } = req.body;

      if (!name || !accountId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Verify account belongs to user
      const account = await prisma.whatsAppAccount.findUnique({
        where: { id: accountId }
      });

      if (!account || account.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const audience = await prisma.whatsAppAudience.create({
        data: {
          name,
          accountId
        }
      });

      return res.status(201).json(audience);
    } catch (error) {
      logger.error('Error creating WhatsApp audience:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAudiences(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const audiences = await prisma.whatsAppAudience.findMany({
        where: {
          account: {
            userId: req.user.id
          }
        },
        include: {
          account: true,
          recipients: true,
          _count: {
            select: {
              recipients: true
            }
          }
        }
      });

      return res.status(200).json(audiences);
    } catch (error) {
      logger.error('Error getting WhatsApp audiences:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAudience(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const audienceId = req.params.id;

      const audience = await prisma.whatsAppAudience.findUnique({
        where: { id: audienceId },
        include: {
          account: true,
          recipients: true,
          _count: {
            select: {
              recipients: true
            }
          }
        }
      });

      if (!audience) {
        return res.status(404).json({ message: 'Audience not found' });
      }

      if (audience.account.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      return res.status(200).json(audience);
    } catch (error) {
      logger.error('Error getting WhatsApp audience:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateAudience(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const audienceId = req.params.id;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const audience = await prisma.whatsAppAudience.findUnique({
        where: { id: audienceId },
        include: { account: true }
      });

      if (!audience) {
        return res.status(404).json({ message: 'Audience not found' });
      }

      if (audience.account.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const updatedAudience = await prisma.whatsAppAudience.update({
        where: { id: audienceId },
        data: { name }
      });

      return res.status(200).json(updatedAudience);
    } catch (error) {
      logger.error('Error updating WhatsApp audience:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteAudience(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const audienceId = req.params.id;

      const audience = await prisma.whatsAppAudience.findUnique({
        where: { id: audienceId },
        include: { account: true }
      });

      if (!audience) {
        return res.status(404).json({ message: 'Audience not found' });
      }

      if (audience.account.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      await prisma.whatsAppAudience.delete({
        where: { id: audienceId }
      });

      return res.status(200).json({ message: 'Audience deleted successfully' });
    } catch (error) {
      logger.error('Error deleting WhatsApp audience:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async addRecipients(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const audienceId = req.params.id;
      const { recipients } = req.body;

      if (!recipients || !Array.isArray(recipients)) {
        return res.status(400).json({ message: 'Missing or invalid recipients' });
      }

      const audience = await prisma.whatsAppAudience.findUnique({
        where: { id: audienceId },
        include: { account: true }
      });

      if (!audience) {
        return res.status(404).json({ message: 'Audience not found' });
      }

      if (audience.account.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const createdRecipients = await Promise.all(
        recipients.map(async (recipient: any) => {
          return prisma.whatsAppRecipient.create({
            data: {
              phoneNumber: recipient.phoneNumber,
              name: recipient.name,
              audienceId
            }
          });
        })
      );

      return res.status(201).json(createdRecipients);
    } catch (error) {
      logger.error('Error adding WhatsApp recipients:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async removeRecipient(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const audienceId = req.params.audienceId;
      const recipientId = req.params.recipientId;

      const audience = await prisma.whatsAppAudience.findUnique({
        where: { id: audienceId },
        include: { account: true }
      });

      if (!audience) {
        return res.status(404).json({ message: 'Audience not found' });
      }

      if (audience.account.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const recipient = await prisma.whatsAppRecipient.findUnique({
        where: { id: recipientId }
      });

      if (!recipient || recipient.audienceId !== audienceId) {
        return res.status(404).json({ message: 'Recipient not found in this audience' });
      }

      await prisma.whatsAppRecipient.delete({
        where: { id: recipientId }
      });

      return res.status(200).json({ message: 'Recipient removed successfully' });
    } catch (error) {
      logger.error('Error removing WhatsApp recipient:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Template Management
  async createTemplate(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { name, content, accountId } = req.body;

      if (!name || !content || !accountId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Verify account belongs to user
      const account = await prisma.whatsAppAccount.findUnique({
        where: { id: accountId }
      });

      if (!account || account.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const template = await prisma.whatsAppTemplate.create({
        data: {
          name,
          content,
          accountId
        }
      });

      return res.status(201).json(template);
    } catch (error) {
      logger.error('Error creating WhatsApp template:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getTemplates(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const templates = await prisma.whatsAppTemplate.findMany({
        where: {
          account: {
            userId: req.user.id
          }
        }
      });

      return res.status(200).json(templates);
    } catch (error) {
      logger.error('Error getting WhatsApp templates:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getTemplate(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const templateId = req.params.id;

      const template = await prisma.whatsAppTemplate.findUnique({
        where: { id: templateId },
        include: { account: true }
      });

      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }

      if (template.account.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      return res.status(200).json(template);
    } catch (error) {
      logger.error('Error getting WhatsApp template:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateTemplate(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const templateId = req.params.id;
      const { name, content } = req.body;

      const template = await prisma.whatsAppTemplate.findUnique({
        where: { id: templateId },
        include: { account: true }
      });

      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }

      if (template.account.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (content) updateData.content = content;

      const updatedTemplate = await prisma.whatsAppTemplate.update({
        where: { id: templateId },
        data: updateData
      });

      return res.status(200).json(updatedTemplate);
    } catch (error) {
      logger.error('Error updating WhatsApp template:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteTemplate(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const templateId = req.params.id;

      const template = await prisma.whatsAppTemplate.findUnique({
        where: { id: templateId },
        include: { account: true }
      });

      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }

      if (template.account.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      await prisma.whatsAppTemplate.delete({
        where: { id: templateId }
      });

      return res.status(200).json({ message: 'Template deleted successfully' });
    } catch (error) {
      logger.error('Error deleting WhatsApp template:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Campaign Management
  async createCampaign(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const {
        name,
        type,
        message,
        mediaUrl,
        template,
        status,
        templateParams,
        accountId,
        audienceId,
        scheduledAt
      } = req.body;

      if (!name || !type || !accountId || !audienceId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Type-specific validation
      if (type === 'TEXT' && !message) {
        return res.status(400).json({ message: 'Message is required for text campaigns' });
      } else if (type === 'IMAGE' && !mediaUrl) {
        return res.status(400).json({ message: 'Media URL is required for image campaigns' });
      } else if (type === 'TEMPLATE' && !template.id) {
        return res.status(400).json({ message: 'Template ID is required for template campaigns' });
      }

      const account = await prisma.whatsAppAccount.findUnique({
        where: {
          userId: req.user.id
        }
      });

      if (!account) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const campaign = await prisma.whatsAppCampaign.create({
        data: {
          name,
          type,
          message,
          mediaUrl,
          templateId: template.id,
          templateParams: templateParams
            ? templateParams
            : Prisma.JsonNull,
          accountId: account.id,
          audienceId,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          status
        }
      });

      return res.status(201).json(campaign);
    } catch (error) {
      logger.error('Error creating WhatsApp campaign:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getCampaigns(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const campaigns = await prisma.whatsAppCampaign.findMany({
        where: {
          account: {
            userId: req.user.id
          }
        },
        include: {
          account: {
            select: {
              phoneNumberData: true,
              displayName: true
            }
          },
          audience: {
            select: {
              name: true,
              _count: {
                select: {
                  recipients: true
                }
              }
            }
          }
        }
      });

      return res.status(200).json(campaigns);
    } catch (error) {
      logger.error('Error getting WhatsApp campaigns:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getCampaign(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const campaignId = req.params.id;

      const campaign = await prisma.whatsAppCampaign.findUnique({
        where: { id: campaignId },
        include: {
          account: true,
          audience: {
            include: {
              recipients: true
            }
          },
        }
      });

      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      if (campaign.account.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      return res.status(200).json(campaign);
    } catch (error) {
      logger.error('Error getting WhatsApp campaign:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateCampaign(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const campaignId = req.params.id;
      const {
        name,
        message,
        mediaUrl,
        templateId,
        templateParams,
        audienceId,
        scheduledAt
      } = req.body;

      const campaign = await prisma.whatsAppCampaign.findUnique({
        where: { id: campaignId },
        include: { account: true }
      });

      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      // Verify account belongs to user
      if (campaign.account.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Can only update draft campaigns
      if (campaign.status !== WhatsAppCampaignStatus.DRAFT) {
        return res.status(400).json({ message: 'Can only update draft campaigns' });
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (message) updateData.message = message;
      if (mediaUrl) updateData.mediaUrl = mediaUrl;
      if (templateId) updateData.templateId = templateId;
      if (templateParams) updateData.templateParams = JSON.stringify(templateParams);
      if (audienceId) updateData.audienceId = audienceId;
      if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt);

      const updatedCampaign = await prisma.whatsAppCampaign.update({
        where: { id: campaignId },
        data: updateData
      });

      return res.status(200).json(updatedCampaign);
    } catch (error) {
      logger.error('Error updating WhatsApp campaign:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteCampaign(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const campaignId = req.params.id;

      const campaign = await prisma.whatsAppCampaign.findUnique({
        where: { id: campaignId },
        include: { account: true }
      });

      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      if (campaign.account.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Can only delete campaigns that aren't active
      if (campaign.status === WhatsAppCampaignStatus.ACTIVE) {
        return res.status(400).json({ message: 'Cannot delete active campaigns' });
      }

      await prisma.whatsAppCampaign.delete({
        where: { id: campaignId }
      });

      return res.status(200).json({ message: 'Campaign deleted successfully' });
    } catch (error) {
      logger.error('Error deleting WhatsApp campaign:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async startCampaign(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const campaignId = req.params.id;

      const campaign = await prisma.whatsAppCampaign.findUnique({
        where: { id: campaignId },
        include: { account: true }
      });

      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      if (campaign.account.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      if (campaign.status !== WhatsAppCampaignStatus.DRAFT) {
        return res.status(400).json({ message: 'Campaign cannot be started' });
      }

      const updatedCampaign = await prisma.whatsAppCampaign.update({
        where: { id: campaignId },
        data: {
          status: campaign.scheduledAt && campaign.scheduledAt > new Date()
            ? WhatsAppCampaignStatus.SCHEDULED
            : WhatsAppCampaignStatus.ACTIVE
        }
      });

      return res.status(200).json(updatedCampaign);
    } catch (error) {
      logger.error('Error starting WhatsApp campaign:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async pauseCampaign(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const campaignId = req.params.id;

      const campaign = await prisma.whatsAppCampaign.findUnique({
        where: { id: campaignId },
        include: { account: true }
      });

      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      if (campaign.account.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      if (campaign.status !== WhatsAppCampaignStatus.ACTIVE && campaign.status !== WhatsAppCampaignStatus.SCHEDULED) {
        return res.status(400).json({ message: 'Campaign cannot be paused' });
      }

      const updatedCampaign = await prisma.whatsAppCampaign.update({
        where: { id: campaignId },
        data: {
          status: WhatsAppCampaignStatus.PAUSED
        }
      });

      return res.status(200).json(updatedCampaign);
    } catch (error) {
      logger.error('Error pausing WhatsApp campaign:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getCampaignStatistics(req: Request, res: Response) {
    // try {
    //   if (!req.user) {
    //     return res.status(401).json({ message: 'Unauthorized' });
    //   }

    //   const campaignId = req.params.id;

    //   const campaign = await prisma.whatsAppCampaign.findUnique({
    //     where: { id: campaignId },
    //     include: {
    //       account: true,
    //     }
    //   });

    //   if (!campaign) {
    //     return res.status(404).json({ message: 'Campaign not found' });
    //   }

    //   if (campaign.account.userId !== req.user.id) {
    //     return res.status(403).json({ message: 'Forbidden' });
    //   }



    //   const stats = {
    //     totalMessages,
    //     sent,
    //     delivered,
    //     read,
    //     failed,
    //     pending,
    //     deliveryRate: totalMessages > 0 ? (delivered / totalMessages) * 100 : 0,
    //     readRate: delivered > 0 ? (read / delivered) * 100 : 0,
    //     failureRate: totalMessages > 0 ? (failed / totalMessages) * 100 : 0
    //   };

    //   return res.status(200).json(stats);
    // } catch (error) {
    //   logger.error('Error getting WhatsApp campaign statistics:', error);
    //   return res.status(500).json({ message: 'Internal server error' });
    // }
  }

  // Webhook handler
  async handleWebhook(req: Request, res: Response) {
    try {
      const data = req.body;
      logger.info('WhatsApp webhook received:', JSON.stringify(data));

      // Handle delivery status updates
      if (data.entry && data.entry.length > 0) {
        for (const entry of data.entry) {
          for (const change of entry.changes) {
            const phoneNumberId = change.value.metadata.phone_number_id;

            // Find all matching phone numbers
            const whatsAppPhoneNumbers = await prisma.whatsAppPhoneNumber.findMany({
              where: {
                phoneNumberId
              },
              include: {
                recipients: true,
                account: true
              }
            });

            if (!whatsAppPhoneNumbers || whatsAppPhoneNumbers.length === 0) {
              logger.error('WhatsApp phone number not found');
              continue;
            }

            // Process each matching phone number
            for (const whatsAppPhoneNumber of whatsAppPhoneNumbers) {
              // Emit event for status updates
              if (change.field === 'messages' && change.value && change.value.statuses) {
                for (const status of change.value.statuses) {
                  const wamid = status.id;
                  const statusValue = status.status;
                  const phoneNumber = status.recipient_id;

                  if (statusValue === 'failed') {
                    await prisma.whatsAppMessage.updateMany({
                      where: { wamid },
                      data: {
                        status: 'FAILED',
                        errorMessage: JSON.stringify(status.errors)
                      }
                    });
                  } else {
                    // Update message status
                    await prisma.whatsAppMessage.updateMany({
                      where: { wamid },
                      data: {
                        status: statusValue.toUpperCase(),
                        deliveredAt: statusValue === 'delivered' ? new Date() : undefined,
                        readAt: statusValue === 'read' ? new Date() : undefined,
                        errorMessage: status.errors ? JSON.stringify(status.errors) : null
                      }
                    });
                  }

                  // Emit status update event
                  const eventData = {
                    type: 'status_update',
                    userId: whatsAppPhoneNumber.account.userId,
                    data: {
                      wamid,
                      status: statusValue.toUpperCase(),
                      phoneNumberId,
                      phoneNumber,
                      error: status.errors ? status.errors[0].error_data.details : null
                    }
                  };
                  global.sseClients.forEach(client => {
                    if (client.userId === whatsAppPhoneNumber.account.userId) {
                      client.res.write(`data: ${JSON.stringify(eventData)}\n\n`);
                    }
                  });
                }
              } else if (change.field === 'messages' && change.value && !change.value.statuses) {
                for (const message of change.value.messages) {
                  const recipient = whatsAppPhoneNumber.recipients.find(recipient => recipient.phoneNumber === message.from);
                  let newMessage;

                  if (recipient) {
                    if (!recipient.name && change.value.contacts[0].profile.name) {
                      await prisma.whatsAppRecipient.update({
                        where: {
                          id: recipient.id
                        },
                        data: {
                          name: change.value.contacts[0].profile.name
                        }
                      });
                    }
                    newMessage = await prisma.whatsAppMessage.create({
                      data: {
                        recipientId: recipient.id,
                        phoneNumber: message.from,
                        wamid: message.id,
                        message: message.text.body,
                        sentAt: new Date(message.timestamp * 1000),
                        status: 'PENDING',
                        whatsAppPhoneNumberId: whatsAppPhoneNumber.id,
                      }
                    });
                  } else {
                    const newData = await prisma.$transaction(async (tx) => {
                      const newRecipient = await tx.whatsAppRecipient.create({
                        data: {
                          phoneNumber: message.from,
                          name: change.value.contacts[0].profile.name || null,
                          whatsAppPhoneNumberId: whatsAppPhoneNumber.id,
                        }
                      });
                      newMessage = await tx.whatsAppMessage.create({
                        data: {
                          recipientId: newRecipient.id,
                          wamid: message.id,
                          phoneNumber: message.from,
                          message: message.text.body,
                          sentAt: new Date(message.timestamp * 1000),
                          status: 'PENDING',
                          whatsAppPhoneNumberId: whatsAppPhoneNumber.id,
                        }
                      });
                      return { newRecipient, newMessage };
                    });
                  }

                  // Emit new message event
                  const eventData = {
                    type: 'new_message',
                    userId: whatsAppPhoneNumber.account.userId,
                    data: {
                      message: newMessage,
                      phoneNumberId
                    }
                  };
                  global.sseClients.forEach(client => {
                    if (client.userId === whatsAppPhoneNumber.account.userId) {
                      client.res.write(`data: ${JSON.stringify(eventData)}\n\n`);
                    }
                  });
                }
              }
            }
          }
        }
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Error handling WhatsApp webhook:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Add SSE endpoint
  async streamMessages(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || 'http://localhost:3000',
        'Access-Control-Allow-Credentials': 'true',
      };
      res.writeHead(200, headers);

      // Add client to global list
      const client = {
        userId: req.user.id,
        res
      };
      global.sseClients.push(client);

      // Send initial connection message
      res.write(`data: ${JSON.stringify({ type: 'connected', userId: req.user.id })}\n\n`);

      // Remove client when connection closes
      req.on('close', () => {
        global.sseClients = global.sseClients.filter(c => c !== client);
      });
    } catch (error) {
      logger.error('Error setting up SSE connection:', error);
      res.end();
    }
  }

  async getWebhook(req: Request, res: Response) {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // check the mode and token sent are correct
    if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      // respond with 200 OK and challenge token from the request
      res.status(200).send(challenge);
      console.log("Webhook verified successfully!");
    } else {
      // respond with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }

  // Add this new method to get all recipients of an audience
  async getAudienceRecipients(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const audienceId = req.params.id;

      // First check if the audience exists and belongs to the user
      const audience = await prisma.whatsAppAudience.findUnique({
        where: { id: audienceId },
        include: { account: true }
      });

      if (!audience) {
        return res.status(404).json({ message: 'Audience not found' });
      }

      if (audience.account.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Get all recipients for this audience
      const recipients = await prisma.whatsAppRecipient.findMany({
        where: { audienceId }
      });

      return res.status(200).json(recipients);
    } catch (error) {
      logger.error('Error getting audience recipients:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async saveMessage(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const { wamid, message, sentAt, phoneNumberId, recipientNumber } = req.body;

      const whatsAppAccount = await prisma.whatsAppAccount.findUnique({
        where: {
          userId: req.user.id
        },
        select: {
          phoneNumbers: {
            where: {
              phoneNumberId
            },
            select: {
              id: true,
              recipients: true
            }
          }
        }
      });

      if (!whatsAppAccount || whatsAppAccount.phoneNumbers.length === 0) {
        return res.status(404).json({ message: 'WhatsApp account not found' });
      }

      let recipient = whatsAppAccount.phoneNumbers[0].recipients.find(recipient => recipient.phoneNumber === recipientNumber);

      if (!recipient) {
        recipient = await prisma.whatsAppRecipient.create({
          data: {
            phoneNumber: recipientNumber,
            whatsAppPhoneNumberId: whatsAppAccount.phoneNumbers[0].id
          }
        });
      }

      await prisma.whatsAppMessage.create({
        data: {
          recipientId: recipient.id,
          isOutbound: true,
          phoneNumber: recipientNumber,
          wamid,
          message,
          sentAt,
          whatsAppPhoneNumberId: whatsAppAccount.phoneNumbers[0].id,
        }
      });
      return res.status(200).json({ message: 'Message saved successfully' });
    } catch (error) {
      logger.error('Error saving WhatsApp message:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getMessages(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Fetch all messages for the current user
      const messages = await prisma.whatsAppMessage.findMany({
        where: {
          whatsAppPhoneNumber: {
            account: {
              userId: req.user.id
            }
          },
          phoneNumber: { not: null }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Group messages by phone number
      const groupedMessages = messages.reduce((acc, message) => {
        if (!message.phoneNumber) return acc;

        if (!acc[message.phoneNumber]) {
          acc[message.phoneNumber] = [];
        }

        acc[message.phoneNumber].push(message);
        return acc;
      }, {} as Record<string, typeof messages>);

      // Format the response
      const formattedResponse = Object.entries(groupedMessages).map(([phoneNumber, msgs]) => {
        // Sort messages by date (newest first)
        const sortedMessages = msgs.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Get the last message
        const lastMessage = sortedMessages[0];

        // Count unread messages (assuming status 'PENDING' means unread)
        const unreadCount = msgs.filter(msg => msg.status === 'PENDING').length;

        return {
          id: phoneNumber, // Using phone number as ID for simplicity
          phoneNumber,
          lastMessage: lastMessage.message || '',
          timestamp: lastMessage.createdAt,
          unread: unreadCount,
          messages: sortedMessages.map(msg => ({
            id: msg.id,
            text: msg.message || '',
            timestamp: msg.createdAt,
            isOutbound: msg.status !== 'PENDING', // Assuming outbound messages have a different status
            status: msg.status
          }))
        };
      });

      return res.status(200).json(formattedResponse);
    } catch (error) {
      logger.error('Error fetching WhatsApp messages:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getPhoneNumbers(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const phoneNumberId = req.query.phoneNumberId as string;

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const whatsAppPhoneNumbers = await prisma.whatsAppPhoneNumber.findMany({
        where: {
          account: {
            userId: req.user.id
          },
          phoneNumberId
        },
        skip,
        take: limit,
        select: {
          id: true,
          phoneNumber: true,
          name: true,
          recipients: {
            select: {
              name: true,
              phoneNumber: true,
              messages: {
                orderBy: {
                  createdAt: 'desc'
                },
                take: 1,
                distinct: ['recipientId']
              }
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      const totalCount = await prisma.whatsAppPhoneNumber.count({
        where: {
          account: {
            userId: req.user.id
          }
        }
      });

      const phoneNumbers = whatsAppPhoneNumbers[0].recipients
        .map(recipient => ({
          phoneNumber: recipient.phoneNumber,
          name: recipient.name,
          latestMessage: recipient.messages[0]
        }))
        .sort((a, b) => {
          const aTime = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt).getTime() : 0;
          const bTime = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt).getTime() : 0;
          return bTime - aTime;
        });

      const totalPages = Math.ceil(totalCount / limit);

      return res.status(200).json({
        data: phoneNumbers,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          hasMore: page < totalPages
        }
      });
    } catch (error) {
      logger.error('Error fetching WhatsApp phone numbers:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getPhoneNumberChats(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const phoneNumber = req.params.phoneNumber;
      const originPhoneNumberId = req.query.originPhoneNumberId as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const whatsAppPhoneNumber = await prisma.whatsAppPhoneNumber.findFirst({
        where: {
          phoneNumberId: originPhoneNumberId,
          account: {
            userId: req.user.id
          }
        },
        include: {
          messages: {
            where: {
              recipient: {
                phoneNumber: phoneNumber
              }
            },
            orderBy: {
              createdAt: 'asc'
            },
            skip,
            take: limit
          },
          _count: {
            select: {
              messages: true
            }
          }
        }
      });

      if (!whatsAppPhoneNumber) {
        return res.status(404).json({ message: 'Phone number not found' });
      }

      const totalMessages = whatsAppPhoneNumber._count.messages;
      const totalPages = Math.ceil(totalMessages / limit);

      return res.status(200).json({
        data: whatsAppPhoneNumber.messages,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalMessages,
          hasMore: page < totalPages
        }
      });
    } catch (error) {
      logger.error('Error fetching WhatsApp messages:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAccountStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get messages for last 60 days
      const messages = await prisma.whatsAppMessage.findMany({
        where: {
          whatsAppPhoneNumber: {
            account: { userId: req.user.id }
          },
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 60)),
            lte: new Date()
          }
        },
        select: {
          isOutbound: true,
          createdAt: true,
          phoneNumber: true,
          status: true
        }
      });

      // Split messages into current and previous 30 days
      const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));
      const sixtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 60));

      const currentPeriodMessages = messages.filter(msg =>
        msg.createdAt >= thirtyDaysAgo && msg.isOutbound
      );
      const previousPeriodMessages = messages.filter(msg =>
        msg.createdAt >= sixtyDaysAgo && msg.createdAt < thirtyDaysAgo && msg.isOutbound
      );

      // Calculate open rates for both periods
      const currentOpenRate = currentPeriodMessages.length > 0
        ? Math.round((currentPeriodMessages.filter(msg => msg.status === 'READ').length / currentPeriodMessages.length) * 100)
        : 0;

      const previousOpenRate = previousPeriodMessages.length > 0
        ? Math.round((previousPeriodMessages.filter(msg => msg.status === 'READ').length / previousPeriodMessages.length) * 100)
        : 0;

      // Calculate growth/decline percentage
      const openRateChange = previousOpenRate > 0
        ? Math.round(((currentOpenRate - previousOpenRate) / previousOpenRate) * 100)
        : 0;

      // if the phone number is in the current period, then it is an active conversation
      const activeConversation = currentPeriodMessages.reduce((acc, msg) => {
        if (msg.phoneNumber) {
          acc[msg.phoneNumber] = (acc[msg.phoneNumber] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const messageOpenRate = currentOpenRate;
      const messageOpenRateChange = openRateChange;

      return res.status(200).json({
        activeConversations: Object.keys(activeConversation).length,
        activeConversationsChange: previousPeriodMessages.length > 0
          ? Math.round(((currentPeriodMessages.length - previousPeriodMessages.length) / previousPeriodMessages.length) * 100)
          : 0,
        messageOpenRate,
        messageOpenRateChange
      });
    } catch (error) {
      logger.error('Error fetching WhatsApp account stats:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export const whatsAppController = new WhatsAppController(); 