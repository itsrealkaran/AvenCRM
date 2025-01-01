import express, { Request, Response, NextFunction } from 'express';
import authRouter from './routes/auth.routes.js';
import "dotenv/config.js";
import session, { SessionOptions } from 'express-session';
import userRoutes from './routes/user.routes.js';

import dealsRoutes from './routes/deals.routes.js';
import leadsRoutes from './routes/leads.routes.js'
import companyRoutes from './routes/company.routes.js';
import transctionRoutes from './routes/transactons.routes.js'
import emailRoutes from './routes/email.routes.js';
import taskRoutes from './routes/task.routes.js';

import cors from "cors"
import logger, { getRequestLogger } from './utils/logger.js';

import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

import { manageCalendar } from './routes/calander.routes.js'
import { companyMonitoring } from './routes/company/companyMonitoring.js';
import { manageSubscription } from './routes/company/subscription.js';
import { propertyRoutes } from './routes/propertyRoutes.js';
import { propertyView } from './routes/publicPropertyView.js';
import cookieParser from 'cookie-parser';
import { teamRoutes } from './routes/team.routes.js';
import stripeRoutes from './routes/stripe.routes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();

// Use cookie-parser middleware
app.use(cookieParser());

// Configure CORS with specific options
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
}));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Body parsing Middleware
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (req.originalUrl === '/stripe/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

// Debug session middleware
// app.use((req: Request, res: Response, next: NextFunction) => {
//   if (req.session) {
//     // Breakpoint for session inspection
//     logger.debug('Session data:', { 
//       sessionID: req.sessionID,
//       session: req.session 
//     });
//   }
//   next();
// });

// Add a middleware to log requests with detailed debugging
app.use((req: Request, res: Response, next: NextFunction) => {
  // Debugger breakpoint for request inspection

  // Add request ID to headers if not present
 // eq.headers['x-request-id'] = req.headers['x-request-id'] || generateRequestId();
  const reqLogger = getRequestLogger(req);

  // Log request details
  logger.info(`Incoming ${req.method} request to ${req.url}`, {
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.body,
    //headers: req.headers,
  });

  // Debug response
  const originalSend = res.send;
  res.send = function (body) {
     // Breakpoint for response inspection
    logger.debug('Response sent', {
      statusCode: res.statusCode,
      responseSize: body ? body.length : 0,
     // headers: res.getHeaders(),
    });
    return originalSend.call(this, body);
  };

  next();
});

// Root route with debug point
app.get("/", (req: Request, res: Response, next: NextFunction) => { 
  // Root route debug point
  next();
}, (req: Request, res: Response) => {
  // Root route response debug point
  logger.debug('Root route response', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
    session: req.session,
    user: req.user,
    requestId: req.headers['x-request-id']
  });
  res.send("Hello from the root route!");
});

// API Routes
app.use('/auth', authRouter);
app.use('/user', userRoutes);
app.use('/team', teamRoutes);
app.use('/deals', dealsRoutes);
app.use('/leads', leadsRoutes);
app.use('/company', companyRoutes);
app.use('/transactions', transctionRoutes);
app.use('/calender', manageCalendar);
app.use('/company/moniter', companyMonitoring);
app.use('/email', emailRoutes);
app.use("/property", propertyRoutes);
app.use("/getProperty", propertyView);
app.use('/tasks', taskRoutes);
app.use('/stripe', stripeRoutes);
app.use('/api/dashboard', dashboardRoutes);

// // Enhanced error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const reqLogger = getRequestLogger(req);
  reqLogger.error(err, {
    context: 'ErrorHandler',
    url: req.url,
    userId: req.user?.id,
    sessionId: req.sessionID
  });

  res.status(err.status || 500).json({
    error: {
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
      requestId: req.headers['x-request-id'],
      code: err.code || 'INTERNAL_ERROR'
    }
  });
});

// Enhanced global error handlers with debugging
process.on('uncaughtException', (error) => {
  // Uncaught exception debug point
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
    type: 'uncaughtException',
    timestamp: new Date().toISOString(),
    memoryUsage: process.memoryUsage()
  });
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  // Unhandled rejection debug point
  logger.error('Unhandled Rejection', {
    reason,
    promise,
    type: 'unhandledRejection',
    timestamp: new Date().toISOString(),
    memoryUsage: process.memoryUsage()
  });
});

const PORT = 8000;
app.listen(PORT, () => {
  logger.info(`Server started successfully`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
  });
});
