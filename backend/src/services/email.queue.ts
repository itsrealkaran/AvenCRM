import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { EmailJobData, EmailJobResult } from '../types/email.types.js';

// Initialize Redis connection
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

redisConnection.on('error', (error: Error) => {
  console.error('Redis connection error:', error);
});

redisConnection.on('connect', () => {
  console.log('Connected to Redis');
});

redisConnection.on('disconnect', () => {
  console.log('Disconnected from Redis');
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
  },
});

// Create worker
const worker = new Worker<EmailJobData, EmailJobResult>(
  'email-queue',
  async (job: Job<EmailJobData, EmailJobResult>) => {
    console.log(`Processing email job ${job.id}`);
    
    try {
      switch (job.name) {
        case 'send-email':
          return await processEmailJob(job);
        case 'send-bulk-email':
          return await processBulkEmailJob(job);
        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
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
  const { emailAccountId, recipients, subject, content, scheduledFor } = job.data;
  
  // Implementation will be in email.service.ts
  return {
    success: true,
    emailsSent: 1,
    timestamp: new Date(),
  };
}

async function processBulkEmailJob(job: Job<EmailJobData, EmailJobResult>) {
  const { emailAccountId, recipients, subject, content, scheduledFor } = job.data;
  
  // Implementation will be in email.service.ts
  return {
    success: true,
    emailsSent: recipients.length,
    timestamp: new Date(),
  };
}

export const emailQueueHelper = {
  // Add a single email job
  async addEmailJob(data: EmailJobData, scheduledFor?: Date) {
    const jobOptions: any = {};
    
    if (scheduledFor) {
      jobOptions.delay = Math.max(0, scheduledFor.getTime() - Date.now());
    }

    return await emailQueue.add('send-email', data, jobOptions);
  },

  // Add a bulk email job
  async addBulkEmailJob(data: EmailJobData, scheduledFor?: Date) {
    const jobOptions: any = {};
    
    if (scheduledFor) {
      jobOptions.delay = Math.max(0, scheduledFor.getTime() - Date.now());
    }

    return await emailQueue.add('send-bulk-email', data, jobOptions);
  },

  // Get all email jobs
  async getEmailJobs() {
    return await emailQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
  },

  // Remove a job
  async removeJob(jobId: string) {
    const job = await emailQueue.getJob(jobId);
    if (job) {
      await job.remove();
      return true;
    }
    return false;
  },
};
