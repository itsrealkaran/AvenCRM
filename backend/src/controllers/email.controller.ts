import { Router } from "express";
import { Request, Response } from "express";
import { protect } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();
router.use(protect);

