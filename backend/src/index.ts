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
  console.log(`${req.method} ${req.url}`);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
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
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something broke!',
    message: err.message 
  });
});

app.get("/", (req, res) => {
  res.send(req.user)
})

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Connected on http://localhost:${PORT}`);
});
