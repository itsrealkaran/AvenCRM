import express, { Request, Response, NextFunction } from 'express';
import authRouter from './routes/auth.routes.js';
import "dotenv/config.js";
import session, { SessionOptions } from 'express-session';
// import { agentRouter } from './routes/company/manageUsers.js';
// import { manageLeads } from './routes/agents/manageLeads.js';
// import { manageDeals } from './routes/agents/manageDeals.js';
// import { companyMonitoring } from './routes/company/companyMonitoring.js';
// import { manageSubscription } from './routes/company/subscription.js';
// import { manageCalendar } from './routes/calander.js';
import adminRoutes from './routes/company/admin/agent.routes.js';
import superAdminRoutes from './routes/superadmin.routes.js';
import agentRoutes from './routes/agent.routes.js';
import dealsRoutes from './routes/deals.routes.js';
import leadsRoutes from './routes/leads.routes.js'
import companyRoutes from './routes/company.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import cors from "cors"
import logger, { generateRequestId, getRequestLogger } from './utils/logger.js';
import { managePayment  } from './routes/company/managePayment.js';
import { Router } from 'express';
import { manageCalendar } from './routes/calander.js';
import { agentRouter } from './routes/company/manageUsers.js';
import { companyMonitoring } from './routes/company/companyMonitoring.js';
import { manageSubscription } from './routes/company/subscription.js';


const app = express();


// Configure CORS with specific options
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));



// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

// Debug session middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.session) {
     // Breakpoint for session inspection
    logger.debug('Session data:', { 
      sessionID: req.sessionID,
      session: req.session 
    });
  }
  next();
});

// app.use(requestLogger);
logger.info(`Server started successfully`, {
  port: 8000,
  environment: process.env.NODE_ENV || 'development',
  nodeVersion: process.version,
});

// Add a middleware to log requests with detailed debugging
app.use((req: Request, res: Response, next: NextFunction) => {
   // Debugger breakpoint for request inspection
  
  // Add request ID to headers if not present
  req.headers['x-request-id'] = req.headers['x-request-id'] || generateRequestId();
  const reqLogger = getRequestLogger(req);

  // Log request details
  reqLogger.info(`Incoming ${req.method} request to ${req.url}`, {
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.body,
    headers: req.headers,
  });

  // Debug response
  const originalSend = res.send;
  res.send = function (body) {
     // Breakpoint for response inspection
    reqLogger.debug('Response sent', {
      statusCode: res.statusCode,
      responseSize: body ? body.length : 0,
      headers: res.getHeaders(),
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
app.use('/superadmin', superAdminRoutes);
app.use('/agent', agentRoutes);
app.use('/leads', leadsRoutes);
app.use('/company', companyRoutes);
app.use('/calender', manageCalendar);
app.use('/company/moniter', companyMonitoring);
app.use('/company/subsciption', manageSubscription);
// app.use('/company/payments', managePayment);

// Enhanced error handling middleware with debugging
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
   // Error handling debug point
  
  const reqLogger = getRequestLogger(req);
  reqLogger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    query: req.query,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({ 
    error: 'Something broke!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
    requestId: req.headers['x-request-id']
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
   // Server start debug point
  logger.info(`Server started successfully`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
  });
});
