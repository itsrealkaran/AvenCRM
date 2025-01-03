import { PrismaClient, EmailStatus } from '@prisma/client';
import { emailService } from '../services/email.service.js';
import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import logger from '../utils/logger.js';

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

// Create worker
const worker = new Worker<EmailJobData>(
  'email-queue',
  async (job: Job<EmailJobData>) => {
    logger.info(`Processing email job ${job.id}`);
    
    try {
      await job.extendLock(job.id ?? '', 30000);
      
      let result;
      switch (job.name) {
        case 'send-email':
          result = await processEmailJob(job);
          break;
        case 'send-bulk-email':
          result = await processBulkEmailJob(job);
          break;
        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }

      await job.extendLock(job.id ?? '', 30000);
      return result;
    } catch (error) {
      logger.error(`Error processing job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
    limiter: {
      max: 100,
      duration: 1000,
    },
    lockDuration: 120000,
    lockRenewTime: 30000,
    settings: {
      backoffStrategy: (attempt) => attempt * 1000,
    },
    maxStalledCount: 5,
    stalledInterval: 30000,
  }
);

// Event handlers
worker.on('completed', (job: Job<EmailJobData>) => {
  logger.info(`Job ${job.id} completed with result:`, job.returnvalue);
});

worker.on('failed', (job: Job<EmailJobData> | undefined, error: Error) => {
  logger.error(`Job ${job?.id} failed with reason:`, error);
});

worker.on('error', (error: Error) => {
  logger.error('Worker error:', error);
});

worker.on('progress', (job: Job<EmailJobData>) => {
  logger.info(`Job ${job.id} progress: ${job.progress}%`);
});

// Job processors
async function processEmailJob(job: Job<EmailJobData>) {
  const { emailId } = job.data;
  
  try {
    const email = await prisma.email.findUnique({
      where: { id: emailId },
      include: {
        sender: true,
        recipients: true,
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

    return {
      success: true,
      emailsSent: totalRecipients,
      timestamp: new Date()
    };
  } catch (error) {
    logger.error('Error processing email job:', error);
    throw error;
  }
}

async function processBulkEmailJob(job: Job<EmailJobData>) {
  const { emailId } = job.data;
  
  try {
    const email = await prisma.email.findUnique({
      where: { id: emailId },
      include: {
        sender: true,
        recipients: true,
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
    await job.updateProgress(1);

    const recipients = email.recipients; 
    const totalRecipients = recipients.length;
    let successCount = 0;
    let failedRecipients: string[] = [];

    const BATCH_SIZE = 5;
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (recipient) => {
        try {
          const processedContent = emailService.processTemplate(email.body, {});

          await transporter.sendMail({
            from: email.sender.email,
            to: recipient.emailId,
            subject: email.subject,
            html: processedContent
          });
          
          successCount++;
        } catch (error) {
          logger.error(`Failed to send email to recipient ${recipient.emailId}:`, error);
          failedRecipients.push(recipient.emailId);
        }
      }));

      const progress = Math.floor((i + batch.length) / totalRecipients * 100);
      await job.updateProgress(progress);
      
      // Add a small delay between batches
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    logger.info(`Bulk email job completed. Success: ${successCount}/${totalRecipients}`);
    return {
      success: successCount > 0,
      emailsSent: successCount,
      timestamp: new Date(),
      failedRecipients
    };
  } catch (error) {
    logger.error('Error processing bulk email job:', error);
    throw error;
  }
}

process.on('SIGTERM', async () => {
  logger.info('Shutting down email worker...');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Shutting down email worker...');
  await worker.close();
  process.exit(0);
});

export default worker;
