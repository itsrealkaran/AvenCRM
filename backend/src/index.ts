import express from 'express';
import { authRouter } from './routers/auth';
import "dotenv/config"
import session from 'express-session';
import passport from 'passport';
import { agentRouter } from './routers/manageUsers';
import { manageLeads } from './routers/manageLeads';
import { manageDeals } from './routers/manageDeals';

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

//defining routes
app.use("/auth", authRouter)
app.use("/company/agent", agentRouter)
app.use("/company/moniter")

app.use("/client/leads", manageLeads)
app.use("/client/deals", manageDeals)

app.get("/", (req, res) => {
  res.send(req.user)
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`conected on http://localhost:${PORT}`);
});
