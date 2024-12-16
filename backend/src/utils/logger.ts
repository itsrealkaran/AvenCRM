import winston from 'winston';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Define log levels with more granularity
const levels = {
  error: 0,    // Critical errors that need immediate attention
  warn: 1,     // Warning messages for potential issues
  info: 2,     // General information about app state
  http: 3,     // HTTP request logging
  debug: 4,    // Detailed debugging information
  trace: 5     // Very detailed tracing information
};

// Define different colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
  trace: 'gray'
};

// Tell winston that we want to link specific colors with specific log levels
winston.addColors(colors);

// Create custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, requestId, duration, ...meta } = info;
    const requestIdStr = requestId ? ` [${requestId}]` : '';
    const durationStr = duration ? ` (${duration}ms)` : '';
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    
    return `${timestamp} [${level}]${requestIdStr}${durationStr}: ${message}${metaStr}`;
  })
);

// Create custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.metadata({ fillWith: ['timestamp', 'requestId'] }),
  winston.format.json()
);

// Create the logger instance
const logger = winston.createLogger({
  levels,
  transports: [
    // Remove file transports to prevent logging to files
    // Add console transport for all environments
    new winston.transports.Console({
      format: consoleFormat
    })
  ]
});

// Performance monitoring
const startTimer = () => {
  const start = process.hrtime();
  return () => {
    const diff = process.hrtime(start);
    return (diff[0] * 1e9 + diff[1]) / 1e6; // Convert to milliseconds
  };
};

// Generate a unique request ID
export const generateRequestId = () => uuidv4();

// Create a function to get a logger instance with request context
export const getRequestLogger = (req: Request) => {
  const requestId = req.headers['x-request-id'] || generateRequestId();
  const timer = startTimer();
  
  const logWithContext = (level: string, message: string, meta = {}) => {
    logger.log({
      level,
      message,
      requestId,
      url: req.url,
      method: req.method,
      ...meta
    });
  };

  return {
    error: (message: string, meta = {}) => logWithContext('error', message, meta),
    warn: (message: string, meta = {}) => logWithContext('warn', message, meta),
    info: (message: string, meta = {}) => logWithContext('info', message, meta),
    http: (message: string, meta = {}) => logWithContext('http', message, meta),
    debug: (message: string, meta = {}) => logWithContext('debug', message, meta),
    trace: (message: string, meta = {}) => logWithContext('trace', message, meta)
  };
};
export default logger;

