import { PrismaClient, EmailStatus } from '@prisma/client';
import { emailService } from '../services/email.service.js';
import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';

interface EmailJobData {
  emailId: string;
}

interface EmailWithRelations {
  id: string;
  subject: string;
  body: string;
  scheduledFor: Date | null;
  sentAt: Date | null;
  status: EmailStatus;
  error: string | null;
  emailAccountId: string;
  sender: {
    email: string;
  };
  recipients: Array<{ emailId: string; id?: string }>;
}

const prisma = new PrismaClient();
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

redisConnection.on('error', (error: Error) => {
  console.error('Redis connection error:', error);
});

redisConnection.on('connect', () => {
  console.log('Connected to Redis 2');
});

redisConnection.on('disconnect', () => {
  console.log('Disconnected from Redis');
});

redisConnection.on('reconnecting', () => {
  console.log('Reconnecting to Redis');
});

export const emailQueue = new Queue<EmailJobData>('email-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

const processEmail = async (job: Job<EmailJobData>): Promise<void> => {
  const { emailId } = job.data;

  try {
    const email = await prisma.email.findUnique({
      where: { id: emailId },
      include: {
        sender: true,
      },
    }) as unknown as EmailWithRelations;

    if (!email) {
      throw new Error(`Email not found with ID: ${emailId}`);
    }

    if (!email.emailAccountId) {
      throw new Error('No email account associated with this email');
    }

    const transporter = await emailService.createTransporter(email.emailAccountId);

    // Update job progress
    await job.updateProgress(10);

    const recipients = email.recipients; 
    const totalRecipients = recipients.length;
    if (totalRecipients === 0) {
      throw new Error('No recipients found for this email');
    }

    for (let i = 0; i < totalRecipients; i++) {
      const recipient = recipients[i];
      if (!recipient?.emailId) {
        console.warn(`Skipping invalid recipient at index ${i}`);
        continue;
      }

      await transporter.sendMail({
        from: email.sender.email,
        to: recipient.emailId,
        subject: email.subject,
        text: email.body,
        html: `${email.body}${recipient.id ? `<img src="${process.env.API_URL}/api/email/track/${recipient.id}/open" width="1" height="1" />` : ''}`,
      });

      // Update progress for each recipient
      const progress = Math.round(((i + 1) / totalRecipients) * 90) + 10;
      await job.updateProgress(progress);
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
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    });

    throw error;
  }
};

// Create worker
const worker = new Worker<EmailJobData>('email-queue', processEmail, {
  connection: redisConnection,
  concurrency: 5,
  limiter: {
    max: 50,
    duration: 1000 * 60, // 1 minute
  },
});

worker.on('error', (error: Error): void => {
  console.error('Worker error:', error);
});

worker.on('active', (job: Job<EmailJobData>): void => {
  console.log(`Job ${job.id} is active`);
});

worker.on('progress', (job: Job<EmailJobData>, progress: number | object): void => {
  console.log(`Job ${job.id} progress: ${typeof progress === 'number' ? progress : JSON.stringify(progress)}%`);
});

worker.on('completed', (job: Job<EmailJobData>): void => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job: Job<EmailJobData> | undefined, error: Error): void => {
  console.error(`Job ${job?.id} failed:`, error);
});

export { worker };
