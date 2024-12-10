import { PrismaClient, EmailStatus } from '@prisma/client';
import { EmailService } from '../services/email/emailService.js';
import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';

const prisma = new PrismaClient();
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

const emailQueue = new Queue('email-queue', { connection: redisConnection });

const emailService = new EmailService(prisma, emailQueue);

const processEmail = async (job: Job<any, void, string> | undefined) => {
  if (!job) return;

  const { emailId } = job.data;

  try {
    const email = await prisma.email.findUnique({
      where: { id: emailId },
      include: {
        sender: true,
        recipients: true,
      },
    });

    if (!email) throw new Error('Email not found');

    const transporter = await emailService.createTransporter(email.emailAccountId);

    // Send email to each recipient
    for (const recipient of email.recipients) {
      await transporter.sendMail({
        from: email.sender.email,
        to: recipient.emailId,
        subject: email.subject,
        text: email.body,
        // Add tracking pixel for open tracking
        html: `${email.body}<img src="${process.env.API_URL}/api/email/track/${recipient.id}/open" width="1" height="1" />`,
      });
    }

    // Update email status
    await prisma.email.update({
      where: { id: emailId },
      data: {
        status: EmailStatus.SENT,
        sentAt: new Date(),
      },
    });

  } catch (error) {
    console.error('Error processing email:', error);
    
    await prisma.email.update({
      where: { id: emailId },
      data: {
        status: EmailStatus.FAILED,
      },
    });

    throw error;
  }
};

// Create worker
const worker = new Worker('email-queue', processEmail, {
  connection: redisConnection,
  concurrency: 5, // Process 5 jobs at a time
});

worker.on('completed', (job: Job<any, void, string> | undefined): void => {
  console.log(`Job ${job?.id} completed`);
});

worker.on('failed', (job: Job<any, void, string> | undefined, error: Error): void => {
  console.error(`Job ${job?.id} failed:`, error);
});

export { emailQueue };
