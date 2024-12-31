import winston from 'winston';
import chalk from 'chalk';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import util from 'util';

// Define custom log levels with emojis for better visibility
const levels = {
  error: 0,   // 🔥 Critical errors
  warn: 1,    // ⚠️ Warnings
  info: 2,    // ℹ️ General information
  http: 3,    // 🌐 HTTP requests
  debug: 4,   // 🐛 Debug information
  trace: 5    // 🔍 Detailed tracing
};

// Custom format for better error stack traces
const errorStackFormat = winston.format((info) => {
  if (info.error instanceof Error) {
    return Object.assign({}, info, {
      stack: info.error.stack,
      message: info.error.message
    });
  }
  return info;
});

// Create custom format for pretty console output
const prettyConsoleFormat = winston.format.printf(({ level, message, timestamp, requestId, duration, stack, ...meta }) => {
  const emoji = {
    error: '🔥',
    warn: '⚠️ ',
    info: 'ℹ️ ',
    http: '🌐',
    debug: '🐛',
    trace: '🔍'
  }[level] || '';

  const colorizer = {
    error: chalk.red,
    warn: chalk.yellow,
    info: chalk.green,
    http: chalk.magenta,
    debug: chalk.blue,
    trace: chalk.gray
  }[level] || chalk.white;

  let output = `${chalk.gray(timestamp)} ${emoji} ${colorizer(level.toUpperCase())}`;
  
  if (requestId) {
    output += chalk.cyan(` [${requestId}]`);
  }
  
  if (duration) {
    output += chalk.yellow(` (${duration}ms)`);
  }

  output += `: ${message}`;

  // Add stack trace for errors
  if (stack) {
    output += `\n${chalk.red(stack)}`;
  }

  // Add metadata if present
  if (Object.keys(meta).length > 0) {
    const prettyMeta = util.inspect(meta, { colors: true, depth: 4, breakLength: 100 });
    output += `\n${prettyMeta}`;
  }

  return output;
});

// Create the logger instance
const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    errorStackFormat(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.colorize(), // Add this line for color support
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        prettyConsoleFormat
      )
    })
  ],
  exitOnError: false
});

// Performance monitoring
const startTimer = () => {
  const start = process.hrtime();
  return () => {
    const diff = process.hrtime(start);
    return Math.round((diff[0] * 1e9 + diff[1]) / 1e6); // Convert to milliseconds
  };
};

// Request context logger
export const getRequestLogger = (req: Request) => {
  const requestId = req.headers['x-request-id']?.toString() || uuidv4();
  const timer = startTimer();
  
  const logWithContext = (level: string, message: string | Error, meta: Record<string, any> = {}) => {
    const logData = {
      level,
      message: message instanceof Error ? message.message : message,
      requestId,
      // duration,
      error: message instanceof Error ? message : undefined,
      ...meta,
      // request: {
      //   method: req.method,
      //   url: req.url,
      //   // headers: req.headers,
      //   query: req.query,
      //   body: req.body,
      // }
    };
    logger.log(logData);
  };

  return {
    error: (message: string | Error, meta = {}) => logWithContext('error', message, meta),
    warn: (message: string, meta = {}) => logWithContext('warn', message, meta),
    info: (message: string, meta = {}) => logWithContext('info', message, meta),
    http: (message: string, meta = {}) => logWithContext('http', message, meta),
    debug: (message: string, meta = {}) => logWithContext('debug', message, meta),
    trace: (message: string, meta = {}) => logWithContext('trace', message, meta)
  };
};

// Global error logger
export const logGlobalError = (error: Error, type: 'uncaughtException' | 'unhandledRejection') => {
  logger.error({
    message: `Global ${type}`,
    error,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    processInfo: {
      pid: process.pid,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
  });
};

export default logger;