import { Router, Request, Response } from 'express';
import { emailController } from '../controllers/email.controller.js';
import { protect } from '../middleware/auth.js';

const router: Router = Router();

// Apply authentication middleware
router.use(protect);

// Email configuration
router.get('/config', (req: Request, res: Response) => emailController.provideRedirectUrl(req, res));

// Email account management
router.post('/accounts/connect', (req: Request, res: Response) => emailController.connectEmailAccount(req, res));
router.get('/accounts', (req: Request, res: Response) => emailController.getEmailAccounts(req, res));
router.delete('/accounts/:accountId', (req: Request, res: Response) => emailController.disconnectEmailAccount(req, res));

// Email template management
router.post('/templates', (req: Request, res: Response) => emailController.createEmailTemplate(req, res));
router.get('/templates', (req: Request, res: Response) => emailController.getEmailTemplates(req, res));
router.get('/templates/:templateId', (req: Request, res: Response) => emailController.getTemplateById(req, res));
router.put('/templates/:templateId', (req: Request, res: Response) => emailController.updateTemplate(req, res));
router.delete('/templates/:templateId', (req: Request, res: Response) => emailController.deleteTemplate(req, res));

// Email recipients management
router.get('/recipients', (req: Request, res: Response) => emailController.getRecipients(req, res));
router.post('/recipients', (req: Request, res: Response) => emailController.createRecipient(req, res));
router.put('/recipients/:id', (req: Request, res: Response) => emailController.updateRecipient(req, res));
router.delete('/recipients/:id', (req: Request, res: Response) => emailController.deleteRecipient(req, res));

// Email campaign management
router.post('/campaigns', (req: Request, res: Response) => emailController.sendBulkEmail(req, res));
router.get('/campaigns', (req: Request, res: Response) => emailController.getEmailCampaigns(req, res));
router.get('/campaigns/:campaignId', (req: Request, res: Response) => emailController.getCampaignStats(req, res));
router.delete('/campaigns/:campaignId', (req: Request, res: Response) => emailController.deleteCampaign(req, res));
router.post('/campaigns/:campaignId/cancel', (req: Request, res: Response) => emailController.cancelCampaign(req, res));

// Email tracking
router.get('/track/open/:trackingId', (req: Request, res: Response) => emailController.trackEmailOpen(req, res));
router.get('/track/click/:trackingId', (req: Request, res: Response) => emailController.trackEmailClick(req, res));

// Email analytics
router.get('/analytics/overview', (req: Request, res: Response) => emailController.getEmailAnalyticsOverview(req, res));
router.get('/analytics/campaigns', (req: Request, res: Response) => emailController.getCampaignAnalytics(req, res));

// Email validation and testing
router.post('/validate-email', (req: Request, res: Response) => emailController.validateEmail(req, res));
router.post('/test-email', (req: Request, res: Response) => emailController.sendTestEmail(req, res));

export default router;