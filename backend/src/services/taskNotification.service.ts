import { PrismaClient, Task } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

export class TaskNotificationService {
  private static instance: TaskNotificationService;

  private constructor() {}

  public static getInstance(): TaskNotificationService {
    if (!TaskNotificationService.instance) {
      TaskNotificationService.instance = new TaskNotificationService();
    }
    return TaskNotificationService.instance;
  }

  async checkDueTasks(): Promise<Task[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dueTasks = await prisma.task.findMany({
        where: {
          dueDate: {
            gte: today,
            lt: tomorrow,
          },
          status: {
            not: 'COMPLETED',
          },
        },
      });

      return dueTasks;
    } catch (error) {
      logger.error('Error checking due tasks:', error);
      return [];
    }
  }

  async getOverdueTasks(): Promise<Task[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdueTasks = await prisma.task.findMany({
        where: {
          dueDate: {
            lt: today,
          },
          status: {
            not: 'COMPLETED',
          },
        },
      });

      return overdueTasks;
    } catch (error) {
      logger.error('Error checking overdue tasks:', error);
      return [];
    }
  }

  async getUpcomingTasks(userId: string, days: number = 7): Promise<Task[]> {
    try {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + days);

      const upcomingTasks = await prisma.task.findMany({
        where: {
          userId,
          dueDate: {
            gte: today,
            lte: futureDate,
          },
          status: {
            not: 'COMPLETED',
          },
        },
        orderBy: {
          dueDate: 'asc',
        },
      });

      return upcomingTasks;
    } catch (error) {
      logger.error('Error fetching upcoming tasks:', error);
      return [];
    }
  }
}
