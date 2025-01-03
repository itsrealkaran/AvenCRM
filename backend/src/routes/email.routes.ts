import express, { Router } from 'express';
import { emailController } from '../controllers/email.controller.js';
import { protect } from '../middleware/auth.js';

const router: Router = express.Router();
router.use(protect);

// Email account management
router.get('/redirect-url', emailController.provideRedirectUrl);
router.post('/connect', emailController.connectEmailAccount);
router.get('/accounts', emailController.getEmailAccounts);
router.delete('/accounts/:accountId', emailController.disconnectEmailAccount);

// Email templates
router.get('/templates', emailController.getEmailTemplates);
router.post('/templates', emailController.createEmailTemplate);
router.get('/templates/:templateId', emailController.getTemplateById);
router.put('/templates/:templateId', emailController.updateTemplate);
router.delete('/templates/:templateId', emailController.deleteTemplate);

// Email recipients
router.get('/recipients', emailController.getRecipients);
router.post('/recipients', emailController.createRecipient);
router.put('/recipients/:id', emailController.updateRecipient);
router.delete('/recipients/:id', emailController.deleteRecipient);

// Email campaigns
router.post('/campaigns', emailController.sendBulkEmail);
router.get('/campaigns', emailController.getEmailCampaigns);
router.get('/campaigns/:campaignId/stats', emailController.getCampaignStats);
router.delete('/campaigns/:campaignId', emailController.deleteCampaign);
router.post('/campaigns/:campaignId/cancel', emailController.cancelCampaign);

// Email analytics
router.get('/analytics/overview', emailController.getEmailAnalyticsOverview);
router.get('/analytics/campaigns', emailController.getCampaignAnalytics);

// Email tracking
router.get('/track/open/:trackingId', emailController.trackEmailOpen);
router.get('/track/click/:trackingId', emailController.trackEmailClick);

// Email utilities
router.post('/validate', emailController.validateEmail);
// router.post('/test', emailController.sendTestEmail);

export default router;