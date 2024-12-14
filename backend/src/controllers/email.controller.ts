import { Router } from "express";
import { Request, Response } from "express";
import { protect } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { emailService } from "../services/email.service.js";

const router = Router();
router.use(protect);

// Get Gmail OAuth URL
router.get("/auth/gmail/url", async (req: Request, res: Response) => {
  const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
  const GMAIL_REDIRECT_URI = process.env.GMAIL_REDIRECT_URI;
  const GMAIL_SCOPE = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly'
  ].join(' ');

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GMAIL_CLIENT_ID}&redirect_uri=${GMAIL_REDIRECT_URI}&response_type=code&scope=${GMAIL_SCOPE}&access_type=offline&prompt=consent`;
  
  res.json({ url });
});

// Get Outlook OAuth URL
router.get("/auth/outlook/url", async (req: Request, res: Response) => {
  const OUTLOOK_CLIENT_ID = process.env.OUTLOOK_CLIENT_ID;
  const OUTLOOK_REDIRECT_URI = process.env.OUTLOOK_REDIRECT_URI;
  const OUTLOOK_SCOPE = ['Mail.Send', 'User.Read'].join(' ');

  const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${OUTLOOK_CLIENT_ID}&response_type=code&redirect_uri=${OUTLOOK_REDIRECT_URI}&response_mode=query&scope=${OUTLOOK_SCOPE}`;
  
  res.json({ url });
});

// Handle Gmail OAuth callback
router.get("/auth/gmail/callback", async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    const userId = req.user?.profileId

    await emailService.handleGmailCallback(code as string, userId ?? '');
    res.redirect(process.env.FRONTEND_URL + '/settings/email?success=true');
  } catch (error) {
    console.error('Gmail auth error:', error);
    res.redirect(process.env.FRONTEND_URL + '/settings/email?error=auth_failed');
  }
});

// Handle Outlook OAuth callback
router.get("/auth/outlook/callback", async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    const userId = req.user?.profileId;

    await emailService.handleOutlookCallback(code as string, userId ?? '');
    res.redirect(process.env.FRONTEND_URL + '/settings/email?success=true');
  } catch (error) {
    console.error('Outlook auth error:', error);
    res.redirect(process.env.FRONTEND_URL + '/settings/email?error=auth_failed');
  }
});

// Send bulk email
router.post("/send/bulk", async (req: Request, res: Response) => {
  try {
    const { subject, content, recipients, templateId, scheduledFor } = req.body;
    const userId = req.user?.profileId;
    const companyId = req.user?.companyId;

    const job = await emailService.createBulkEmailJob({
      subject,
      content,
      recipients,
      templateId,
      scheduledFor,
      createdById: userId ?? '',
      companyId
    });

    res.json({ success: true, jobId: job.id });
  } catch (error) {
    console.error('Bulk email error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get email templates
router.get("/templates", async (req: Request, res: Response) => {
  try {
    const templates = await prisma.emailTemplate.findMany({
      where: {
        companyId: req.user.companyId
      }
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create email template
router.post("/templates", async (req: Request, res: Response) => {
  try {
    const { name, subject, content } = req.body;
    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        content,
        userId: req.user.id,
        companyId: req.user.companyId
      }
    });
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get email logs
router.get("/logs", async (req: Request, res: Response) => {
  try {
    const logs = await prisma.emailLog.findMany({
      where: {
        companyId: req.user.companyId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
