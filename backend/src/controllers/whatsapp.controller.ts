import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { whatsAppService } from '../services/whatsapp.service.js';
import { WhatsAppCampaignStatus } from '../types/whatsapp.types.js';
import logger from '../utils/logger.js';
import { BaseController } from './base.controllers.js';
import { Prisma } from '@prisma/client';

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

      const { phoneNumberId, wabaid, accessToken, phoneNumberData, displayName } = req.body;

      if (!phoneNumberId || !wabaid || !accessToken || !phoneNumberData || !displayName) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const account = await whatsAppService.createAccount(req.user.id, {
        phoneNumberId,
        wabaid,
        accessToken,
        phoneNumberData,
        displayName,
        userId: req.user.id
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

      const accounts = await prisma.whatsAppAccount.findMany({
        where: { userId: req.user.id }
      });

      return res.status(200).json(accounts);
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

  async verifyAccount(req: Request, res: Response) {
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

      const verified = await whatsAppService.verifyAccount(accountId);

      if (verified) {
        return res.status(200).json({ message: 'Account verified successfully', verified: true });
      } else {
        return res.status(400).json({ message: 'Account verification failed', verified: false });
      }
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
        templateId,
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
      } else if (type === 'TEMPLATE' && !templateId) {
        return res.status(400).json({ message: 'Template ID is required for template campaigns' });
      }

      // Verify account belongs to user
      const account = await prisma.whatsAppAccount.findUnique({
        where: { id: accountId }
      });

      if (!account || account.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Verify audience belongs to account
      const audience = await prisma.whatsAppAudience.findUnique({
        where: { id: audienceId }
      });

      if (!audience || audience.accountId !== accountId) {
        return res.status(403).json({ message: 'Invalid audience for this account' });
      }

      // If template is specified, verify it belongs to account
      if (templateId) {
        const template = await prisma.whatsAppTemplate.findUnique({
          where: { id: templateId }
        });

        if (!template || template.accountId !== accountId) {
          return res.status(403).json({ message: 'Invalid template for this account' });
        }
      }

      const campaign = await prisma.whatsAppCampaign.create({
        data: {
          name,
          type,
          message,
          mediaUrl,
          templateId,
          templateParams: templateParams
            ? templateParams
            : Prisma.JsonNull,
          accountId,
          audienceId,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          status: WhatsAppCampaignStatus.DRAFT
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
          },
          template: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              messages: true
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
          template: true,
          messages: {
            select: {
              id: true,
              status: true,
              sentAt: true,
              deliveredAt: true,
              readAt: true,
              errorMessage: true,
              recipient: {
                select: {
                  phoneNumber: true,
                  name: true
                }
              }
            }
          }
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
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const campaignId = req.params.id;

      const campaign = await prisma.whatsAppCampaign.findUnique({
        where: { id: campaignId },
        include: {
          account: true,
          messages: true
        }
      });

      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      if (campaign.account.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const totalMessages = campaign.messages.length;
      const sent = campaign.messages.filter(m => m.status === 'SENT').length;
      const delivered = campaign.messages.filter(m => m.status === 'DELIVERED').length;
      const read = campaign.messages.filter(m => m.status === 'READ').length;
      const failed = campaign.messages.filter(m => m.status === 'FAILED').length;
      const pending = campaign.messages.filter(m => m.status === 'PENDING').length;

      const stats = {
        totalMessages,
        sent,
        delivered,
        read,
        failed,
        pending,
        deliveryRate: totalMessages > 0 ? (delivered / totalMessages) * 100 : 0,
        readRate: delivered > 0 ? (read / delivered) * 100 : 0,
        failureRate: totalMessages > 0 ? (failed / totalMessages) * 100 : 0
      };

      return res.status(200).json(stats);
    } catch (error) {
      logger.error('Error getting WhatsApp campaign statistics:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Webhook handler
  async handleWebhook(req: Request, res: Response) {
    try {
      // Return the hub challenge to verify the webhook
      if (req.query['hub.mode'] === 'subscribe' && req.query['hub.challenge']) {
        return res.status(200).send(req.query['hub.challenge']);
      }

      const data = req.body;
      logger.info('WhatsApp webhook received:', JSON.stringify(data));

      // Handle delivery status updates
      if (data.entry && data.entry.length > 0) {
        for (const entry of data.entry) {
          for (const change of entry.changes) {
            if (change.field === 'messages' && change.value && change.value.statuses) {
              for (const status of change.value.statuses) {
                const wamid = status.id;
                const statusValue = status.status; // sent, delivered, read, failed

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
}

export const whatsAppController = new WhatsAppController(); 