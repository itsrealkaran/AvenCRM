import cron from 'node-cron';
import { notificationService } from './redis.js';

class CronService {
  private scheduledJobs: Map<string, cron.ScheduledTask>;

  constructor() {
    this.scheduledJobs = new Map();
  }

  scheduleEventNotification(
    userId: string,
    eventId: string,
    title: string,
    eventDate: Date,
    link: string
  ) {
    // Calculate notification date (1 day before the event)
    const notificationDate = new Date(eventDate);
    notificationDate.setDate(notificationDate.getDate() - 1);
    
    // Create a unique job ID
    const jobId = `event_${eventId}_notification`;
    
    // If a notification is already scheduled for this event, cancel it
    if (this.scheduledJobs.has(jobId)) {
      this.scheduledJobs.get(jobId)?.stop();
      this.scheduledJobs.delete(jobId);
    }

    let cronExpression;
    //if the notification date is today then send the notification immediately
    if (eventDate.getDate() === new Date().getDate()) {
      cronExpression = `* * * * *`;
    } else {
      // Schedule the notification for 9:00 AM on the day before
      cronExpression = `0 9 ${notificationDate.getDate()} ${notificationDate.getMonth() + 1} *`;
    }
    
    const job = cron.schedule(cronExpression, async () => {
      try {
        await notificationService.createNotification(userId, {
          title: "Upcoming Calendar Event",
          message: `Reminder: "${title}" is scheduled for ${eventDate.toLocaleString()}`,
          type: "calendar",
          link,
        });
        
        // Remove the job after execution
        job.stop();
        this.scheduledJobs.delete(jobId);
      } catch (error) {
        console.error("Failed to create reminder notification:", error);
      }
    });

    this.scheduledJobs.set(jobId, job);
  }
}

export const cronService = new CronService();
