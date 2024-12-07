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
import { manageCompany } from './routers/manageCompany';
import cors from "cors"
import logger, { getRequestLogger, generateRequestId } from './utils/logger';

const app = express();

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

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Add a middleware to log requests
app.use((req, res, next) => {
  // Add request ID to headers if not present
  req.headers['x-request-id'] = req.headers['x-request-id'] || generateRequestId();
  const reqLogger = getRequestLogger(req);

  // Log request details
  reqLogger.info(`Incoming ${req.method} request to ${req.url}`, {
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.body,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log response
  const originalSend = res.send;
  res.send = function (body) {
    reqLogger.debug('Response sent', {
      statusCode: res.statusCode,
      responseSize: body ? body.length : 0,
    });
    return originalSend.call(this, body);
  };

  next();
});

// Add performance monitoring middleware
app.use((req, res, next) => {
  const start = process.hrtime();
  
  // Add response time logging
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const responseTime = (diff[0] * 1e9 + diff[1]) / 1e6; // Convert to milliseconds
    
    const reqLogger = getRequestLogger(req);
    reqLogger.http('Request completed', {
      statusCode: res.statusCode,
      requestMethod: req.method,
      requestUrl: req.originalUrl,
    });
  });
  
  next();
});

//defining routes
app.use("/calender", manageCalendar)
app.use("/admin/company", manageCompany)

app.use("/auth", authRouter)
app.use("/company/agent", agentRouter)
app.use("/company/moniter", companyMonitoring)
app.use("/company/subsciption", manageSubscription)

app.use("/client/leads", manageLeads)
app.use("/client/deals", manageDeals)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const reqLogger = getRequestLogger(req);
  reqLogger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });
  
  res.status(500).json({ 
    error: 'Something broke!',
    message: err.message 
  });
});

app.get("/", (req, res) => {
  res.send(req.user)
})

// Add global error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
    type: 'uncaughtException'
  });
  // Give logger time to write before exiting
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason,
    promise,
    type: 'unhandledRejection'
  });
});

// Add memory usage logging at intervals
setInterval(() => {
  const used = process.memoryUsage();
  logger.info('Memory usage', {
    rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(used.external / 1024 / 1024)}MB`,
  });
}, 300000); // Log every 5 minutes

const PORT = 8000;
app.listen(PORT, () => {
  logger.info(`Server started successfully`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
  });
});
