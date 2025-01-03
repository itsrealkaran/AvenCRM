import { Redis } from 'ioredis';
import logger from '../utils/logger.js';
import RedisConnection from '../config/redis.config.js';

const redisClient = RedisConnection.getInstance();

redisClient.on('error', (err: any) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Redis Client Connected'));
redisClient.on('reconnecting', () => logger.info('Redis Client Reconnecting'));
redisClient.on('reconnect', () => logger.info('Redis Client Reconnected'));
redisClient.on('end', () => logger.info('Redis Client Disconnected'));
redisClient.on('close', () => logger.info('Redis Client Closed'));
redisClient.on('offline', () => logger.info('Redis Client Offline'));
redisClient.on('online', () => logger.info('Redis Client Online'));

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

export default redisClient;
