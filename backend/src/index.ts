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

//defining middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "nope",
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(cors())

//defining routes
app.use("/calender", manageCalendar)
app.use("/admin/company", manageCompany)

app.use("/auth", authRouter)
app.use("/company/agent", agentRouter)
app.use("/company/moniter", companyMonitoring)
app.use("/company/subsciption", manageSubscription)

app.use("/client/leads", manageLeads)
app.use("/client/deals", manageDeals)

app.get("/", (req, res) => {
  res.send(req.user)
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`conected on http://localhost:${PORT}`);
});
