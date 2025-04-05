import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { whatsAppController } from '../controllers/whatsapp.controller.js';

const router: Router = Router();

// Use authentication for all routes except webhook
router.use(['/accounts', '/audiences', '/templates', '/campaigns', '/messages'], protect);

router.get('/access-token/:code', whatsAppController.getAccessToken);

// WhatsApp Account Management
router.post('/accounts', whatsAppController.createAccount);
router.get('/accounts', whatsAppController.getAccounts);
router.get('/accounts/phone-numbers', whatsAppController.getPhoneNumbers);
router.get('/accounts/phone-numbers/:phoneNumber', whatsAppController.getPhoneNumberChats);
router.get('/accounts/:id', whatsAppController.getAccount);
router.put('/accounts/:id', whatsAppController.updateAccount);
router.delete('/accounts/:id', whatsAppController.deleteAccount);
router.post('/accounts/:id/verify', whatsAppController.verifyAccount);

router.post('/campaigns/saveMessage', whatsAppController.saveMessage);

// Message Management
router.get('/messages', whatsAppController.getMessages);
router.get('/messages/stream', whatsAppController.streamMessages);

// Audience Management
router.post('/audiences', whatsAppController.createAudience);
router.get('/audiences', whatsAppController.getAudiences);
router.get('/audiences/:id', whatsAppController.getAudience);
router.put('/audiences/:id', whatsAppController.updateAudience);
router.delete('/audiences/:id', whatsAppController.deleteAudience);
router.post('/audiences/:id/recipients', whatsAppController.addRecipients);
router.delete('/audiences/:audienceId/recipients/:recipientId', whatsAppController.removeRecipient);
router.get('/audiences/:id/recipients', whatsAppController.getAudienceRecipients);

// Template Management
router.post('/templates', whatsAppController.createTemplate);
router.get('/templates', whatsAppController.getTemplates);
router.get('/templates/:id', whatsAppController.getTemplate);
router.put('/templates/:id', whatsAppController.updateTemplate);
router.delete('/templates/:id', whatsAppController.deleteTemplate);

// Campaign Management
router.post('/campaigns', whatsAppController.createCampaign);
router.get('/campaigns', whatsAppController.getCampaigns);
router.get('/campaigns/:id', whatsAppController.getCampaign);
router.put('/campaigns/:id', whatsAppController.updateCampaign);
router.delete('/campaigns/:id', whatsAppController.deleteCampaign);
router.post('/campaigns/:id/start', whatsAppController.startCampaign);
router.post('/campaigns/:id/pause', whatsAppController.pauseCampaign);
router.get('/campaigns/:id/statistics', whatsAppController.getCampaignStatistics);

// Webhook for delivery status updates (no auth needed for external webhook)
router.post('/webhook', whatsAppController.handleWebhook);
router.get('/webhook', whatsAppController.getWebhook);

export { router as whatsAppRoutes }; 