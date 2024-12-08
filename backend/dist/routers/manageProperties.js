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
exports.getProperties = void 0;
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
exports.getProperties = router;
router.get("/getAll", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const properties = yield db_1.default.property.findMany();
        res.send(properties);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
router.post("/addProperty", (req, res) => {
    try {
        const { agentId } = req.body;
    }
    catch (err) {
        res.status(500).json(err);
    }
});
