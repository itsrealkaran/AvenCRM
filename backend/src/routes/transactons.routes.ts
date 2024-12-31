import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { protect } from "../middleware/auth.js";
import { Request } from "express";
import { PlanTier } from "@prisma/client";
import { getAllTransactions } from "../controllers/transactions.controller.js";

const router: Router = Router();
router.use(protect);

router.get("/", async (req: Request, res: Response) => {

    if (req.user?.role === 'ADMIN') {
        return getAllTransactions(req, res);
    }

    try {
        const transactions = await prisma.transaction.findMany({
            include: {
                agent: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
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

    const agentId = req.user?.id;
    if (!agentId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const company = await prisma.user.findUnique({
        where: { id: agentId },
        select: { companyId: true }
    });
    if (!company) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const companyId = company.companyId;
    const { amount, type, transactionMethod, invoiceNumber , date, planType } = req.body;

    try {
        const transaction = await prisma.transaction.create({
            data: {  
                amount: amount,
                type: type,
                transactionMethod: transactionMethod, 
                companyId: companyId || '', 
                agentId: agentId,
                planType: PlanTier.BASIC,
                invoiceNumber: invoiceNumber,
                date: date,
            },
        });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: "Failed to create transaction" });
    }
});


router.put("/:id", async (req: Request, res: Response) => {

    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const company = await prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true }
    });

    if (!company) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const companyId = company.companyId;

    const { amount, type, transactionMethod, invoiceNumber, date, planType, receiptUrl } = req.body;

    try {
        const transaction = await prisma.transaction.update({
            where: { id: req.params.id },
            data: {
                amount: amount,
                type: type,
                transactionMethod: transactionMethod, 
                companyId: companyId || '', 
                agentId: userId,
                planType: PlanTier.BASIC,
                invoiceNumber: invoiceNumber,
                date: date,
                receiptUrl: receiptUrl
            },
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
                isVerified: isVerfied
            }
        });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: "Failed to verify transaction" });
    }
});



export default router;