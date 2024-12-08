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
exports.manageLeads = void 0;
const express_1 = require("express");
const index_1 = __importDefault(require("../../db/index"));
const router = (0, express_1.Router)();
exports.manageLeads = router;
//managing leads
router.get('/getall', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyId, agentId } = req.body;
    try {
        const leads = yield index_1.default.lead.findMany({
            where: {
                companyId,
                agentId,
            },
        });
        res.status(200).send(leads);
    }
    catch (err) {
        res.send(err);
    }
}));
router.post('/add', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, status, phoneNo, email, companyId, agentId, leadAmount, source, expectedDate, notes, } = req.body;
    const datedate = expectedDate ? new Date(expectedDate) : null;
    try {
        const lead = yield index_1.default.lead.create({
            data: {
                companyId,
                agentId,
                name,
                status,
                phone: phoneNo,
                email,
                leadAmount,
                source,
                expectedDate: datedate,
                notes,
            },
        });
        res.status(201).send(lead);
    }
    catch (err) {
        res.send(err);
    }
}));
router.post('/add', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, status, phoneNo, email, companyId, agentId, leadAmount, source, expectedDate, notes, } = req.body;
    try {
        const lead = yield index_1.default.lead.create({
            data: {
                companyId,
                agentId,
                name,
                status,
                phone: phoneNo,
                email,
                leadAmount,
                source,
                expectedDate,
                notes,
            },
        });
        res.status(201).send(lead);
    }
    catch (err) {
        res.send(err);
    }
}));
router.patch('/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, status, phoneNo, email, companyId, agentId, leadId, leadAmount, source, expectedDate, notes, } = req.body;
    try {
        const lead = yield index_1.default.lead.update({
            where: {
                companyId,
                agentId,
                id: leadId,
            },
            data: {
                companyId,
                agentId,
                name,
                status,
                phone: phoneNo,
                email,
                leadAmount,
                source,
                expectedDate,
                notes,
            },
        });
        res.status(201).send(lead);
    }
    catch (err) {
        res.send(err);
    }
}));
router.delete('/delete', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyId, agentId, leadId } = req.body;
    try {
        const lead = yield index_1.default.lead.delete({
            where: {
                companyId,
                agentId,
                id: leadId,
            },
        });
        res.status(200).send(lead);
    }
    catch (err) {
        res.send(err);
    }
}));
