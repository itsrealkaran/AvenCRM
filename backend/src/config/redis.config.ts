import { Redis, RedisOptions } from 'ioredis';
import logger from '../utils/logger.js';

export interface RedisConfig extends RedisOptions {
  host: string;
  port: number;
  retryStrategy?: (times: number) => number | void;
}

export const redisConfig: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  enableReadyCheck: true,
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
};

class RedisConnection {
  private static instance: Redis;
  private static isInitialized = false;

  public static getInstance(): Redis {
    if (!RedisConnection.instance) {
      RedisConnection.instance = new Redis(redisConfig);
      if (!RedisConnection.isInitialized) {
        RedisConnection.initializeEventHandlers();
      }
    }
    return RedisConnection.instance;
  }

  private static initializeEventHandlers() {
    const redis = RedisConnection.instance;

    redis.on('error', (err: Error) => {
      logger.error('Redis Client Error:', err);
    });

    redis.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    redis.on('ready', () => {
      logger.info('Redis Client Ready');
    });

    redis.on('reconnecting', () => {
      logger.info('Redis Client Reconnecting');
    });

    redis.on('reconnect', () => {
      logger.info('Redis Client Reconnected');
    });

    redis.on('end', () => {
      logger.info('Redis Client Disconnected');
    });

    redis.on('close', () => {
      logger.info('Redis Client Closed');
    });

    redis.on('offline', () => {
      logger.warn('Redis Client Offline');
    });

    redis.on('online', () => {
      logger.info('Redis Client Online');
    });

    RedisConnection.isInitialized = true;
  }

  public static async closeConnection(): Promise<void> {
    if (RedisConnection.instance) {
      await RedisConnection.instance.quit();
      RedisConnection.instance = null as any;
      RedisConnection.isInitialized = false;
    }
  }
}

export default RedisConnection;
