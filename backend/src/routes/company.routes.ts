import { Router } from "express";
import { protect } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();
router.use(protect);

router.get("/", async (req, res) => {
    try {
        const company = await prisma.company.findMany();
        res.json(company);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch company" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const company = await prisma.company.findUnique({
            where: { id: req.params.id },
        });
        res.json(company);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch company" });
    }
});


router.post("/", async (req, res) => {

    const data: {
        name: string;
        adminId: string;
        address: string;
        email: string;
        phone: string;
        website: string;
        logo: string;
        description: string;
        country: string;
    } = req.body;


    try {
        const company = await prisma.company.create({
            data: req.body,
        });
        res.json(company);
    } catch (error) {
        res.status(500).json({ message: "Failed to create company" });
    }
});