import { Redis } from 'ioredis';
import logger from '../utils/logger.js';
import RedisConnection from '../config/redis.config.js';
import crypto from 'crypto';

const redisClient = RedisConnection.getInstance();

redisClient.on('error', (err: any) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Redis Client Connected'));
redisClient.on('reconnecting', () => logger.info('Redis Client Reconnecting'));
redisClient.on('reconnect', () => logger.info('Redis Client Reconnected'));
redisClient.on('end', () => logger.info('Redis Client Disconnected'));
redisClient.on('close', () => logger.info('Redis Client Closed'));
redisClient.on('offline', () => logger.info('Redis Client Offline'));
redisClient.on('online', () => logger.info('Redis Client Online'));

// User Cache Methods
export const cacheUser = async (userId: string, userData: any) => {
  try {
    await redisClient.setex(`user:${userId}`, 3600, JSON.stringify(userData)); // Cache for 1 hour
  } catch (error) {
    logger.error('Redis Cache Error:', error);
  }
};

export const getCachedUser = async (userId: string) => {
  try {
    const cachedUser = await redisClient.get(`user:${userId}`);
    return cachedUser ? JSON.parse(cachedUser) : null;
  } catch (error) {
    logger.error('Redis Get Error:', error);
    return null;
  }
};

export const invalidateUserCache = async (userId: string) => {
  try {
    await redisClient.del(`user:${userId}`);
  } catch (error) {
    logger.error('Redis Delete Error:', error);
  }
};

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'calendar' | 'task' | 'lead' | 'upgrade';
  read: boolean;
  createdAt: number; // Unix timestamp
  link?: string; // Optional link to redirect when clicked
}

export type CreateNotificationDto = Omit<Notification, 'id' | 'createdAt' | 'read' | 'userId'>;

// Constants
const NOTIFICATION_KEY_PREFIX = 'notifications:';
const NOTIFICATION_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

// Notification Methods
export const notificationService = {
  /**
   * Create a new notification for a user
   */
  async createNotification(userId: string, notification: CreateNotificationDto): Promise<Notification> {
    try {
      const notificationId = crypto.randomUUID();
      const newNotification: Notification = {
        ...notification,
        id: notificationId,
        userId,
        read: false,
        createdAt: Date.now(),
      };

      // Store notification in a sorted set with timestamp as score
      const notificationKey = `${NOTIFICATION_KEY_PREFIX}${userId}`;
      await redisClient.zadd(notificationKey, newNotification.createdAt, JSON.stringify(newNotification));

      // Set TTL for the notifications key
      await redisClient.expire(notificationKey, NOTIFICATION_TTL);

      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  },

  /**
   * Get all notifications for a user with pagination
   */
  async getUserNotifications(userId: string, page = 1, limit = 10): Promise<{ notifications: Notification[]; total: number }> {
    try {
      const notificationKey = `${NOTIFICATION_KEY_PREFIX}${userId}`;
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      // Get notifications from sorted set with pagination (newest first)
      const notifications = await redisClient.zrevrange(notificationKey, start, end);
      const total = await redisClient.zcard(notificationKey);

      return {
        notifications: notifications.map((n) => JSON.parse(n)),
        total,
      };
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw new Error('Failed to get notifications');
    }
  },

  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(userId: string, notificationId: string): Promise<boolean> {
    try {
      const notificationKey = `${NOTIFICATION_KEY_PREFIX}${userId}`;
      
      // Get the notification
      const notifications = await redisClient.zrange(notificationKey, 0, -1);
      const notificationIndex = notifications.findIndex((n) => {
        const parsed = JSON.parse(n);
        return parsed.id === notificationId;
      });

      if (notificationIndex === -1) {
        return false;
      }

      // Update the notification
      const notification = JSON.parse(notifications[notificationIndex]);
      notification.read = true;

      // Remove old and add updated notification
      await redisClient.zremrangebyrank(notificationKey, notificationIndex, notificationIndex);
      await redisClient.zadd(notificationKey, notification.createdAt, JSON.stringify(notification));

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  },

  async markAllRead(userId: string) {
    try {
      const notificationKey = `${NOTIFICATION_KEY_PREFIX}${userId}`;
      
      // Get all notifications
      const notifications = await redisClient.zrange(notificationKey, 0, -1);
      
      // Update all notifications to read=true
      const updatedNotifications = notifications.map(n => {
        const notification = JSON.parse(n);
        notification.read = true;
        return {
          score: notification.createdAt,
          value: JSON.stringify(notification)
        };
      });

      // Remove all existing notifications
      await redisClient.del(notificationKey);
      
      // Add back updated notifications if there are any
      if (updatedNotifications.length > 0) {
        await redisClient.zadd(notificationKey,
          ...updatedNotifications.flatMap(n => [n.score, n.value])
        );
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw new Error('Failed to mark all notifications as read');
    }
  },

  /**
   * Delete a specific notification
   */
  async deleteNotification(userId: string, notificationId: string): Promise<boolean> {
    try {
      const notificationKey = `${NOTIFICATION_KEY_PREFIX}${userId}`;
      
      // Get the notification
      const notifications = await redisClient.zrange(notificationKey, 0, -1);
      const notificationIndex = notifications.findIndex((n) => {
        const parsed = JSON.parse(n);
        return parsed.id === notificationId;
      });

      if (notificationIndex === -1) {
        return false;
      }

      // Remove the notification
      await redisClient.zremrangebyrank(notificationKey, notificationIndex, notificationIndex);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  },

  /**
   * Delete all notifications for a user
   */
  async clearAllNotifications(userId: string): Promise<void> {
    try {
      const notificationKey = `${NOTIFICATION_KEY_PREFIX}${userId}`;
      await redisClient.del(notificationKey);
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw new Error('Failed to clear notifications');
    }
  },

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notificationKey = `${NOTIFICATION_KEY_PREFIX}${userId}`;
      const notifications = await redisClient.zrange(notificationKey, 0, -1);
      
      return notifications.reduce((count, n) => {
        const parsed = JSON.parse(n);
        return parsed.read ? count : count + 1;
      }, 0);
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw new Error('Failed to get unread notification count');
    }
  },
};

export default redisClient;
