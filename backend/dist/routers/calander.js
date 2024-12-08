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
exports.manageCalendar = void 0;
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
exports.manageCalendar = router;
router.get("/getEvents", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let id = "";
        if (req.body.agentId) {
            id = req.body.agentId;
        }
        else if (req.body.adminId) {
            id = req.body.adminId;
        }
        else if (req.body.superAdminId) {
            id = req.body.superAdminId;
        }
        else {
            res.status(400).json({ message: "bad auth" });
        }
        const events = yield db_1.default.calendarEvent.findMany({
            where: {
                setterId: id
            }
        });
        res.send(events);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
router.post("createEvent", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, startTime, endTime, location, type, setterId } = req.body;
        const event = yield db_1.default.calendarEvent.create({
            data: {
                title,
                description,
                startTime,
                endTime,
                type,
                location,
                setterId
            }
        });
        res.send(event);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
