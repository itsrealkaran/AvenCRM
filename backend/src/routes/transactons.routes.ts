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
            where: {
                agentId: req.user?.id
            },
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
            where: { id: req.params.id, agentId: req.user?.id },
        });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch transaction" });
    }
});


router.post("/", async (req: Request, res: Response) => {
    try {
        const { amount, type, planType, invoiceNumber, taxRate, transactionMethod, date } = req.body;
        
        const transaction = await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                type,
                planType,
                invoiceNumber,
                taxRate: taxRate ? parseFloat(taxRate) : null,
                transactionMethod,
                date: new Date(date),
                agentId: req.user?.id!,
                companyId: req.user?.companyId!,
                isVerified: false
            },
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
        
        res.status(201).json(transaction);
    } catch (error) {
        console.error("Create transaction error:", error);
        res.status(500).json({ message: "Failed to create transaction" });
    }
});

router.put("/:id", async (req: Request, res: Response) => {
    try {
        const { amount, type, planType, invoiceNumber, taxRate, transactionMethod, date } = req.body;
        
        // Check if transaction exists and belongs to the user's company
        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                id: req.params.id,
                companyId: req.user?.companyId
            }
        });

        if (!existingTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        const transaction = await prisma.transaction.update({
            where: { id: req.params.id },
            data: {
                amount: parseFloat(amount),
                type,
                planType,
                invoiceNumber,
                taxRate: taxRate ? parseFloat(taxRate) : null,
                transactionMethod,
                date: new Date(date)
            },
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
        
        res.json(transaction);
    } catch (error) {
        console.error("Update transaction error:", error);
        res.status(500).json({ message: "Failed to update transaction" });
    }
});

router.delete("/:id", async (req: Request, res: Response) => {
    try {
        // Check if transaction exists and belongs to the user's company
        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                id: req.params.id,
                companyId: req.user?.companyId
            }
        });

        if (!existingTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        await prisma.transaction.delete({
            where: { id: req.params.id }
        });
        
        res.status(204).send();
    } catch (error) {
        console.error("Delete transaction error:", error);
        res.status(500).json({ message: "Failed to delete transaction" });
    }
});

router.delete("/", async (req: Request, res: Response) => {
    try {
        const { transactionIds } = req.body;
        
        if (!Array.isArray(transactionIds)) {
            return res.status(400).json({ message: "Invalid transaction IDs" });
        }

        // Check if all transactions belong to the user's company
        const transactions = await prisma.transaction.findMany({
            where: {
                id: { in: transactionIds },
                companyId: req.user?.companyId
            }
        });

        if (transactions.length !== transactionIds.length) {
            return res.status(403).json({ message: "Some transactions are not accessible" });
        }

        await prisma.transaction.deleteMany({
            where: {
                id: { in: transactionIds }
            }
        });
        
        res.status(204).send();
    } catch (error) {
        console.error("Bulk delete transactions error:", error);
        res.status(500).json({ message: "Failed to delete transactions" });
    }
});

router.put("/:id/verify", async (req: Request, res: Response) => {
    try {
        const { isVerified } = req.body;
        
        // Check if transaction exists and belongs to the user's company
        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                id: req.params.id,
                companyId: req.user?.companyId
            }
        });

        if (!existingTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        const transaction = await prisma.transaction.update({
            where: { id: req.params.id },
            data: { isVerified: isVerified },
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
        
        res.json(transaction);
    } catch (error) {
        console.error("Verify transaction error:", error);
        res.status(500).json({ message: "Failed to verify transaction" });
    }
});

export default router;