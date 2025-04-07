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
import logger from './utils/logger.js';

import { manageCalendar } from './routes/calander.routes.js'
import { companyMonitoring } from './routes/company/companyMonitoring.js';
import { manageSubscription } from './routes/company/subscription.js';
import propertyRoutes from './routes/property.routes.js';
import { propertyView } from './routes/publicPropertyView.js';
import cookieParser from 'cookie-parser';
import { teamRoutes } from './routes/team.routes.js';
import stripeRoutes from './routes/stripe.routes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { publicRoutes } from './routes/public.routes.js';
import { notificationRoutes } from './routes/notification.routes.js';
import { whatsAppRoutes } from './routes/whatsapp.routes.js';
import metaAdsRoutes from './routes/meta-ads.routes.js';
import pageBuilderRoutes from './routes/page-builder.routes.js';

const app = express();

// Use cookie-parser middleware
app.use(cookieParser());

// Configure CORS with specific options
const allowedOrigins = [
  'https://crm.avencrm.com',
  'https://avencrm.com',
  'https://backend.avencrm.com',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || 
        origin.endsWith('.avencrm.com') || 
        origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400,
};

app.use(cors(corsOptions));

// app.use((req, res, next) => {
//   const origin = req.headers.origin;
//   if (origin && (allowedOrigins.includes(origin) || 
//       origin.endsWith('.avencrm.com') || origin.includes('localhost'))) {
//     res.setHeader('Access-Control-Allow-Origin', origin);
//   }
//   res.setHeader('Access-Control-Allow-Credentials', 'true');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
//   next();
// });

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
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
      domain: '.avencrm.com'
    }
  } as SessionOptions)
);


// Add a middleware to log requests with detailed debugging
app.use((req: Request, res: Response, next: NextFunction) => {
  // Debugger breakpoint for request inspection

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

// Add a route to serve the Microsoft identity verification file
app.get('/.well-known/microsoft-identity-association.json', (req, res) => {
  res.json({
    "associatedApplications": [
      {
        "applicationId": "f4d02e25-a5c7-46d2-b232-16da782dc021"
      }
    ]
  });
});

// API Routes
app.use('/auth', authRouter);
app.use('/user', userRoutes);
app.use('/team', teamRoutes);
app.use('/deals', dealsRoutes);
app.use('/leads', leadsRoutes);
app.use('/company', companyRoutes);
app.use('/transactions', transctionRoutes);
app.use('/subscription', manageSubscription);
app.use('/calender', manageCalendar);
app.use('/company/moniter', companyMonitoring);
app.use('/email', emailRoutes);
app.use("/property", propertyRoutes);
app.use("/getProperty", propertyView);
app.use('/tasks', taskRoutes);
app.use('/stripe', stripeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/public', publicRoutes);
app.use('/notification', notificationRoutes);
app.use('/whatsapp', whatsAppRoutes);
app.use('/meta-ads', metaAdsRoutes);
app.use('/api/page-builder', pageBuilderRoutes);
app.use('/api/public', publicRoutes);

// // Enhanced error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {

  logger.info('Error middleware triggered', {
    error: err,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'],
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
    session: req.session,
    user: req.user,
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

const PORT = `${process.env.PORT}`;
app.listen(PORT, () => {
  logger.info(`Server started successfully`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
  });
});
