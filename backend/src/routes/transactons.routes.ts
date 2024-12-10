import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { protect } from "../middleware/auth.js";
import { Request } from "express";

const router = Router();
router.use(protect);

router.get("/", async (req: Request, res: Response) => {
    try {
        const transactions = await prisma.transaction.findMany();
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch transactions" });
    }
});


router.get("/:id", async (req: Request, res: Response) => {
    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: req.params.id },
        });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch transaction" });
    }
});


router.post("/", async (req: Request, res: Response) => {
    try {
        const transaction = await prisma.transaction.create({
            data: req.body,
        });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: "Failed to create transaction" });
    }
});


router.put("/:id", async (req: Request, res: Response) => {
    try {
        const transaction = await prisma.transaction.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: "Failed to update transaction" });
    }
});


router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const transaction = await prisma.transaction.delete({
            where: { id: req.params.id },
        });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: "Failed to delete transaction" });
    }
});

router.delete("/", async (req: Request, res: Response) => {
    const { transactionIds } = req.body;

    try {
        const transaction = await prisma.transaction.deleteMany({
            where: {
                id: {
                    in: transactionIds
                }
            }
        });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: "Failed to delete transaction" });
    }
});


router.post("/verify", async (req: Request, res: Response) => {
    const { isVerfied } = req.body;
    try {
        const transaction = await prisma.transaction.update({
            where: {
                id: req.body.id
            },
            data: {
                isVerfied: isVerfied
            }
        });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: "Failed to verify transaction" });
    }
});



export default router;