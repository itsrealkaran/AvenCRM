import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { EmailJobData, EmailJobResult } from '../types/email.types.js';
import { emailService } from './email.service.js';
import prisma from '../db/index.js';
import { EmailCampaignStatus } from '@prisma/client';
import logger from '../utils/logger.js';

// Initialize Redis connection
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

let isConnected = false;

redisConnection.on('error', (error: Error) => {
  console.error('Redis connection error:', error);
});

redisConnection.on('connect', () => {
  if (!isConnected) {
    console.log('Connected to Redis');
    isConnected = true;
  }
});

redisConnection.on('disconnect', () => {
  console.log('Disconnected from Redis');
  isConnected = false;
});

// Create email queue
export const emailQueue = new Queue<EmailJobData, EmailJobResult>('email-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,    // Keep last 1000 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
    keepLogs: 1000,
  },
});

// Create worker
const worker = new Worker<EmailJobData, EmailJobResult>(
  'email-queue',
  async (job: Job<EmailJobData, EmailJobResult>) => {
    console.log(`Processing email job ${job.id}`);
    
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
      console.error(`Error processing job ${job.id}:`, error);
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
    lockDuration: 120000, // Increased to 2 minutes
    lockRenewTime: 30000, // Renew lock more frequently
    settings: {
     backoffStrategy: (attempt) => {
        return attempt * 1000;
      },
    },
    maxStalledCount: 5,
    stalledInterval: 30000,
  }
);

worker.on('completed', (job: Job<EmailJobData, EmailJobResult>) => {
  console.log(`Job ${job.id} completed with result:`, job.returnvalue);
});

worker.on('failed', (job: Job<EmailJobData, EmailJobResult> | undefined, error: Error) => {
  console.error(`Job ${job?.id} failed with reason:`, error);
});

worker.on('error', (error: Error) => {
  console.error('Worker error:', error);
});

worker.on('progress', (job: Job<EmailJobData, EmailJobResult>) => {
  console.log(`Job ${job.id} progress: ${job.progress}%`);
});

// Event handlers
const queueEvents = new QueueEvents('email-queue', {
  connection: redisConnection,
});

queueEvents.on('completed', ({ jobId, returnvalue }) => {
  console.log(`Job ${jobId} completed with result:`, returnvalue);
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`Job ${jobId} failed with reason:`, failedReason);
});

queueEvents.on('delayed', ({ jobId, delay }) => {
  console.log(`Job ${jobId} has been delayed by ${delay}ms`);
});

// Job processors
async function processEmailJob(job: Job<EmailJobData, EmailJobResult>) {
  const { emailAccountId, recipientIds, subject, content, scheduledFor, campaignId } = job.data;
  
  try {
    const scheduledTime = scheduledFor ? new Date(scheduledFor) : null;
    
    // Check if the job is scheduled for the future
    if (scheduledTime && scheduledTime.getTime() > Date.now()) {
      logger.info(`Job ${job.id} is scheduled for future: ${scheduledTime}`);
      const delay = Math.max(0, scheduledTime.getTime() - Date.now());
      await emailQueue.add('send-email', job.data, { 
        delay,
        jobId: job.id 
      });
      return {
        success: true,
        delayed: true,
        scheduledFor: scheduledTime,
        emailsSent: 0,
        timestamp: new Date()  // Ensure timestamp is always set
      };
    }

    await job.updateProgress(10);
    await job.extendLock(job.id ?? '', 30000);
    const transporter = await emailService.createTransporter(emailAccountId);
    await job.extendLock(job.id ?? '', 30000);
    const processedContent = emailService.processTemplate(content, {});

    const recipients = await prisma.emailRecipient.findMany({
      where: {
        id: {
          in: recipientIds
        }
      }
    });
    
    if (recipients.length === 0) {
      throw new Error('No recipients found');
    }
    
    await job.updateProgress(50);
    const sendMailPromise = transporter.sendMail({
      from: (await prisma.emailAccount.findUnique({ where: { id: emailAccountId } }))?.email || '',
      to: recipients[0].email,
      subject: subject,
      html: processedContent
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email send timeout')), 25000); // 25 seconds timeout
    });

    await Promise.race([sendMailPromise, timeoutPromise])
      .catch((error) => {
        throw new Error(`Failed to send email to ${recipients[0].email}: ${error.message}`);
      });

    logger.info(`Email sent successfully to ${recipients[0].email}`);
    await job.updateProgress(100);
    await job.extendLock(job.id ?? '', 30000);

    if (campaignId) {
      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: { status: EmailCampaignStatus.COMPLETED }
      });
    }

    return {
      success: true,
      emailsSent: 1,
      timestamp: new Date(),
    };
  } catch (error) {
    logger.error('Error processing email job:', error);
    try {
      await job.extendLock(job.id ?? '', 30000);
      if (campaignId) {
        await prisma.emailCampaign.update({
          where: { id: campaignId },
          data: { status: EmailCampaignStatus.FAILED }
        });
      }
    } catch (lockError) {
      logger.error('Failed to update campaign status due to lock error:', lockError);
    }
    throw error;
  }
}

async function processBulkEmailJob(job: Job<EmailJobData, EmailJobResult>) {
  const { emailAccountId, recipientIds, subject, content, scheduledFor, campaignId } = job.data;
  
  try {
    await job.updateProgress(1);
    
    const transporter = await emailService.createTransporter(emailAccountId);
    const totalRecipients = recipientIds.length;
    let successCount = 0;
    let failedRecipients: string[] = [];

    await job.updateProgress(5);

    // Start lock renewal interval
    const lockInterval = setInterval(async () => {
      try {
        await job.extendLock(job.id ?? '', 120000);
      } catch (error) {
        logger.error('Failed to extend lock:', error);
      }
    }, 30000);

    try {
      const BATCH_SIZE = 5; // Reduced batch size for better control
      for (let i = 0; i < recipientIds.length; i += BATCH_SIZE) {
        const batch = recipientIds.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(async (recipientId) => {
          try {
            const recipient = await prisma.emailRecipient.findUnique({ where: { id: recipientId } });
            if (!recipient) {
              throw new Error('Recipient not found');
            }

            const processedContent = emailService.processTemplate(content, {});

            const emailAccount = await prisma.emailAccount.findUnique({ where: { id: emailAccountId } });
            if (!emailAccount) {
              throw new Error('No email account associated with this email');
            }

            const sendMailPromise = transporter.sendMail({
              from: emailAccount?.email || '',
              to: recipient.email,
              subject: subject,
              html: processedContent,
              sender: emailAccount.email || ''
            });

            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Email send timeout')), 25000);
            });

            await Promise.race([sendMailPromise, timeoutPromise]);
            successCount++;
          } catch (error) {
            // failedRecipients.push(recipient.email);
            // logger.error(`Failed to send email to ${recipient.email}:`, error);
            console.error(`Failed to send email to :`, error);
          }
        }));

        const progress = Math.floor((i + batch.length) / totalRecipients * 100);
        await job.updateProgress(progress);
        
        // Add a small delay between batches to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } finally {
      // Clean up the lock renewal interval
      clearInterval(lockInterval);
    }

    if (campaignId) {
      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: { 
          status: successCount === totalRecipients ? 
            EmailCampaignStatus.COMPLETED : 
            EmailCampaignStatus.FAILED,
          completedAt: new Date(),
          successfulSends: successCount,
          failedSends: totalRecipients - successCount
        }
      });
    }

    // Log results
    logger.info(`Bulk email job completed. Success: ${successCount}/${totalRecipients}`);
    if (failedRecipients.length > 0) {
      logger.warn(`Failed recipients: ${failedRecipients.join(', ')}`);
    }

    return {
      success: successCount > 0,
      emailsSent: successCount,
      timestamp: new Date(),
      failedRecipients: failedRecipients
    };
  } catch (error) {
    logger.error('Error processing bulk email job:', error);
    
    if (campaignId) {
      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: { status: EmailCampaignStatus.FAILED }
      });
    }

    throw error;
  }
}

export const emailQueueHelper = {
  async addEmailJob(data: EmailJobData, scheduledFor?: Date) {
    const jobOptions: any = {
      removeOnComplete: {
        age: 24 * 3600,
        count: 1000
      },
      removeOnFail: {
        age: 7 * 24 * 3600
      }
    };
    
    if (scheduledFor) {
      const scheduledTime = new Date(scheduledFor);
      jobOptions.delay = Math.max(0, scheduledTime.getTime() - Date.now());
    }

    return await emailQueue.add('send-email', data, jobOptions);
  },

  async addBulkEmailJob(data: EmailJobData, scheduledFor?: Date) {
    const jobOptions: any = {
      removeOnComplete: {
        age: 24 * 3600,
        count: 1000
      },
      removeOnFail: {
        age: 7 * 24 * 3600
      }
    };
    
    if (scheduledFor) {
      const scheduledTime = new Date(scheduledFor);
      jobOptions.delay = Math.max(0, scheduledTime.getTime() - Date.now());
    }

    return await emailQueue.add('send-bulk-email', data, jobOptions);
  },

  async getEmailJobs() {
    return await emailQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
  },

  async removeJob(jobId: string) {
    const job = await emailQueue.getJob(jobId);
    if (job) {
      await job.remove();
      return true;
    }
    return false;
  },
};
