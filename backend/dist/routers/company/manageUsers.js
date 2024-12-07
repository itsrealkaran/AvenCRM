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
exports.agentRouter = void 0;
const express_1 = require("express");
const db_1 = __importDefault(require("../../db"));
const router = (0, express_1.Router)();
exports.agentRouter = router;
router.get('/getAll', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyId } = req.body;
    try {
        const agents = yield db_1.default.agent.findMany({
            where: {
                companyId: companyId,
            },
        });
        res.status(200).send(agents);
    }
    catch (err) {
        res.send(err);
    }
}));
router.post('/add', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, dob, gender, phoneNo, email, role, companyId } = req.body;
    try {
        const agent = yield db_1.default.agent.create({
            data: {
                name,
                email,
                password: 'testpassword',
                phone: phoneNo,
                dob,
                gender,
                role,
                companyId,
            },
        });
        res.status(201).send(agent);
    }
    catch (err) {
        res.send(err);
    }
}));
router.patch('/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, age, gender, phoneNo, email, role, agentId, companyId } = req.body;
    try {
        const agent = yield db_1.default.agent.update({
            where: {
                id: agentId,
                companyId
            },
            data: {
                name,
                email,
                password: 'testpassword',
                phone: phoneNo,
                dob: age,
                gender,
                role,
                companyId,
            },
        });
        res.status(201).send(agent);
    }
    catch (err) {
        res.send(err);
    }
}));
router.delete('/delete', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyId, agentId } = req.body;
    try {
        const agents = yield db_1.default.agent.delete({
            where: {
                id: agentId,
                companyId: companyId,
            },
        });
        res.status(200).send(agents);
    }
    catch (err) {
        res.send(err);
    }
}));
