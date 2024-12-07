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
exports.manageDeals = void 0;
const express_1 = require("express");
const db_1 = __importDefault(require("../../db"));
const router = (0, express_1.Router)();
exports.manageDeals = router;
router.get("/getall", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyId, agentId } = req.body;
    try {
        const deals = yield db_1.default.deal.findMany({
            where: {
                companyId,
                agentId,
            }
        });
        res.status(200).send(deals);
    }
    catch (err) {
        res.send(err);
    }
}));
router.post("/add", (req, res) => {
    const { name, status, dealValue, email, expectedCloseDate, notes, companyId, agentId } = req.body;
    try {
        const deal = db_1.default.deal.create({
            data: {
                name,
                status,
                dealAmount: dealValue,
                email,
                expectedCloseDate,
                notes,
                companyId,
                agentId
            }
        });
        res.status(200).send(deal);
    }
    catch (err) {
        res.send(err);
    }
});
router.patch("/update", (req, res) => {
    const { name, status, dealValue, email, expectedCloseDate, notes, companyId, agentId, dealId } = req.body;
    try {
        const deal = db_1.default.deal.update({
            where: {
                companyId,
                agentId,
                id: dealId
            },
            data: {
                name,
                status,
                dealAmount: dealValue,
                email,
                expectedCloseDate,
                notes,
                companyId,
                agentId
            }
        });
        res.status(200).send(deal);
    }
    catch (err) {
        res.send(err);
    }
});
router.delete("/delete", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyId, agentId, dealId } = req.body;
    try {
        const deals = yield db_1.default.deal.delete({
            where: {
                companyId,
                agentId,
                id: dealId
            }
        });
        res.status(200).send(deals);
    }
    catch (err) {
        res.send(err);
    }
}));
