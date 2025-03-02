import axios from 'axios';
import crypto from 'crypto';
import { WhatsAppCampaignType } from '../types/whatsapp.types.js';
import { prisma } from '../lib/prisma.js';
import logger from '../utils/logger.js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_key_for_development_only';
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v22.0';

const getEncryptionKey = () => {
  const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest('base64').substring(0, 32);
  return Buffer.from(key);
};

export class WhatsAppService {
  public encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', getEncryptionKey(), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  private decrypt(text: string): string {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', getEncryptionKey(), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  async createAccount(userId: string, accountData: any) {
    const encryptedToken = this.encrypt(accountData.accessToken);
    
    return prisma.whatsAppAccount.create({
      data: {
        userId,
        phoneNumberId: accountData.phoneNumberId,
        wabaid: accountData.wabaid,
        accessToken: encryptedToken,
        phoneNumber: accountData.phoneNumber,
        displayName: accountData.displayName
      }
    });
  }

  async verifyAccount(accountId: string) {
    const account = await prisma.whatsAppAccount.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      throw new Error('Account not found');
    }

    try {
      const accessToken = this.decrypt(account.accessToken);
      const response = await axios.get(
        `${WHATSAPP_API_URL}/${WHATSAPP_API_VERSION}/${account.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.status === 200) {
        return prisma.whatsAppAccount.update({
          where: { id: accountId },
          data: { verified: true }
        });
      }
      
      throw new Error('Failed to verify account');
    } catch (error) {
      logger.error('WhatsApp verification error:', error);
      throw new Error('Failed to verify WhatsApp account');
    }
  }

  async sendMessage(accountId: string, recipientPhone: string, campaignType: WhatsAppCampaignType, messageData: any) {
    const account = await prisma.whatsAppAccount.findUnique({
      where: { id: accountId }
    });
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    const accessToken = this.decrypt(account.accessToken);
    const url = `${WHATSAPP_API_URL}/${WHATSAPP_API_VERSION}/${account.phoneNumberId}/messages`;
    
    try {
      let payload;
      
      switch (campaignType) {
        case WhatsAppCampaignType.TEXT:
          payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipientPhone,
            type: 'text',
            text: { body: messageData.message }
          };
          break;
          
        case WhatsAppCampaignType.IMAGE:
          payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipientPhone,
            type: 'image',
            image: { 
              link: messageData.mediaUrl,
              caption: messageData.caption
            }
          };
          break;
          
        case WhatsAppCampaignType.TEMPLATE:
          const template = await prisma.whatsAppTemplate.findUnique({
            where: { id: messageData.templateId }
          });
          
          if (!template) {
            throw new Error('Template not found');
          }
          
          // Process template parameters
          const components = this.prepareTemplateComponents(
            template.content, 
            messageData.templateParams || {}
          );
          
          payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipientPhone,
            type: 'template',
            template: { 
              name: template.name,
              language: { code: 'en' },
              components
            }
          };
          break;
          
        default:
          throw new Error('Unsupported message type');
      }
      
      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error: any) {
      logger.error('WhatsApp API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  private prepareTemplateComponents(templateContent: string, params: Record<string, string>) {
    // Extract parameter placeholders from template content
    const placeholders = templateContent.match(/{{(\d+)}}/g) || [];
    
    // Prepare components for the API
    const components = [
      {
        type: "body",
        parameters: placeholders.map((placeholder) => {
          const paramKey = placeholder.replace(/[{}]/g, '');
          return {
            type: "text",
            text: params[paramKey] || `[Parameter ${paramKey}]`
          };
        })
      }
    ];
    
    return components;
  }
}

export const whatsAppService = new WhatsAppService();