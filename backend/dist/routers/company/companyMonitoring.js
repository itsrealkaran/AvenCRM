"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyMonitoring = void 0;
const express_1 = require("express");
const db_1 = __importDefault(require("../../db"));
const router = (0, express_1.Router)();
exports.companyMonitoring = router;
router.get('/agentsCount', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyId } = req.body;
    try {
        const agents = yield db_1.default.agent.findMany({
            where: {
                companyId,
            },
        });
        res.status(200).send(agents);
    }
    catch (err) {
        res.status(500).send(err);
    }
}));
router.get('/sales', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { companyId } = req.body;
        const leads = yield db_1.default.lead.findMany({
            where: {
                companyId,
            },
        });
        const newLeads = leads.length;
        const leadsContacted = leads.filter((lead) => {
            return lead.status === 'CONTACTED';
        }).length;
        const proposals = leads.filter((lead) => {
            return lead.status === 'QUALIFIED';
        }).length;
        const negotiation = leads.filter((lead) => {
            return lead.status === 'NEGOTIATION';
        }).length;
        const won = leads.filter((lead) => {
            return lead.status === 'WON';
        }).length;
        res
            .status(200)
            .json({ newLeads, leadsContacted, proposals, negotiation, won });
    }
    catch (err) {
        res.status(500).send(err);
    }
}));
