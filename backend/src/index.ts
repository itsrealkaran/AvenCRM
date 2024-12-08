import express from 'express';
import { authRouter } from './routers/auth';
import "dotenv/config"
import session from 'express-session';
import passport from 'passport';
import { agentRouter } from './routers/company/manageUsers';
import { manageLeads } from './routers/agents/manageLeads';
import { manageDeals } from './routers/agents/manageDeals';
import { companyMonitoring } from './routers/company/companyMonitoring';
import { manageSubscription } from './routers/company/subscription';
import { manageCalendar } from './routers/calander';
import companyRoutes from './routers/superadmin/company.routes';
import adminRoutes from './routers/company/admin/agent.routes';
import cors from "cors"
import logger, { getRequestLogger, generateRequestId } from './utils/logger';

// Enable source map support for stack traces
import 'source-map-support/register';

const app = express();

// Debug middleware - log all requests
app.use((req, res, next) => {
   // Debugger breakpoint for all requests
  next();
});

// Configure CORS with specific options
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Request body debug middleware
app.use((req, res, next) => {
  if (req.body && Object.keys(req.body).length) {
     // Breakpoint for requests with body
    logger.debug('Request body:', { 
      path: req.path,
      method: req.method,
      body: req.body 
    });
  }
  next();
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || "nope",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Debug session middleware
app.use((req, res, next) => {
  if (req.session) {
     // Breakpoint for session inspection
    logger.debug('Session data:', { 
      sessionID: req.sessionID,
      session: req.session 
    });
  }
  next();
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Add a middleware to log requests with detailed debugging
app.use((req, res, next) => {
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
    ip: req.ip,
    userAgent: req.get('user-agent'),
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

// Add performance monitoring middleware with debugging
app.use((req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
     // Breakpoint for performance metrics
    const diff = process.hrtime(start);
    const responseTime = (diff[0] * 1e9 + diff[1]) / 1e6; // Convert to milliseconds
    
    const reqLogger = getRequestLogger(req);
    reqLogger.http('Request completed', {
      statusCode: res.statusCode,
      requestMethod: req.method,
      requestUrl: req.originalUrl
    });
  });
  
  next();
});

//defining routes with debug points
app.use("/calender", (req, res, next) => {
   // Calendar route debug point
  next();
}, manageCalendar);

/**
 * Debug point for superadmin/company route
 * This is a debug point for the superadmin/company route.
 * It does not perform any actual logic, but is here to help with debugging.
 */
app.use("/superadmin/company", (req, res, next) => {
  // Superadmin company route debug point
 next();
}, companyRoutes);

app.use("/admin/agent", (req, res, next) => {
  // admin agent route debug point
 next();
}, adminRoutes);

app.use("/auth", (req, res, next) => {
   // Auth route debug point
  next();
}, authRouter);

app.use("/company/agent", (req, res, next) => {
   // Company agent route debug point
  next();
}, agentRouter);

app.use("/company/moniter", (req, res, next) => {
   // Company monitor route debug point
  next();
}, companyMonitoring);

app.use("/company/subsciption", (req, res, next) => {
   // Company subscription route debug point
  next();
}, manageSubscription);

app.use("/client/leads", (req, res, next) => {
   // Client leads route debug point
  next();
}, manageLeads);

app.use("/client/deals", (req, res, next) => {
   // Client deals route debug point
  next();
}, manageDeals);

// Enhanced error handling middleware with debugging
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

// Root route with debug point
app.get("/", (req, res) => {
   // Root route debug point
  res.send(req.user);
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
