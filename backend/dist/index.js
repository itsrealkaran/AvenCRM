"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("./routers/auth");
require("dotenv/config");
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const manageUsers_1 = require("./routers/company/manageUsers");
const manageLeads_1 = require("./routers/agents/manageLeads");
const manageDeals_1 = require("./routers/agents/manageDeals");
const companyMonitoring_1 = require("./routers/company/companyMonitoring");
const subscription_1 = require("./routers/company/subscription");
const calander_1 = require("./routers/calander");
const app = (0, express_1.default)();
//defining middlewares
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "nope",
    resave: false,
    saveUninitialized: true
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
//defining routes
app.use("/calender", calander_1.manageCalendar);
app.use("/auth", auth_1.authRouter);
app.use("/company/agent", manageUsers_1.agentRouter);
app.use("/company/moniter", companyMonitoring_1.companyMonitoring);
app.use("/company/subsciption", subscription_1.manageSubscription);
app.use("/client/leads", manageLeads_1.manageLeads);
app.use("/client/deals", manageDeals_1.manageDeals);
app.get("/", (req, res) => {
    res.send(req.user);
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`conected on http://localhost:${PORT}`);
});
