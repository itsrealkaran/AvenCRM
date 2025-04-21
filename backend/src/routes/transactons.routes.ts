import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { protect } from "../middleware/auth.js";
import { Request } from "express";
import { LeadRole, PlanTier, TransactionStatus, UserRole } from "@prisma/client";
import { getAllTransactions } from "../controllers/transactions.controller.js";
import { notificationService } from "../services/redis.js";

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

router.get("/teamleader", async (req: Request, res: Response) => {
    try {
        const role = req.user?.role;
        if (role && role !== "TEAM_LEADER") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const team = await prisma.team.findFirst({
            where: {
                teamLeaderId: req.user?.id
            },
            include: {
                members: true
            }
        })
        
        if(!team){
            return res.status(404).json({ message: "Team not found" });
        }

        const agentsId = team.members.map(member => member.id);
        const transactions = await prisma.transaction.findMany({
            where: {
                agentId: {
                    in: agentsId
                },
            },
            include: {
                agent: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        res.json(transactions);
    } catch (error) {
        console.error("Get teamleader transactions error:", error);
        res.status(500).json({ message: "Failed to fetch transactions" });
    }
})

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
        const { amount, commissionRate, transactionMethod, date, propertyType } = req.body;

        // generate a random 10 digit invoice number
        const invoiceNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        console.log(invoiceNumber);

        let isApprovedByTeamLeader: TransactionStatus = TransactionStatus.PENDING;
        let status: TransactionStatus = TransactionStatus.PENDING;
        if(req.user?.role === UserRole.ADMIN) {
            status = TransactionStatus.APPROVED;
        }
        if(req.user?.role === UserRole.TEAM_LEADER) {
            isApprovedByTeamLeader = TransactionStatus.APPROVED;
        } else if (req.user?.teamId === null || req.user?.teamId === "") {
            isApprovedByTeamLeader = TransactionStatus.APPROVED;
        }
        
        const transaction = await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                invoiceNumber: invoiceNumber,
                commissionRate: commissionRate ? parseFloat(commissionRate) : null,
                transactionMethod,
                status,
                date: new Date(date),
                agentId: req.user?.id!,
                companyId: req.user?.companyId!,
                isApprovedByTeamLeader,
                propertyType: propertyType as LeadRole,
            },
            include: {
                agent: {
                    select: {
                        name: true,
                        company: {
                            select: {
                                admin: {
                                    select: {
                                        id: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // send notification to the admin
        try {
            if(!transaction.agent.company?.admin?.id) {
                console.log("Admin not found");
                return;
            }
            await notificationService.createNotification(transaction.agent.company.admin.id, {
                title: "New Transaction",
                message: `A new transaction has been created by ${transaction.agent.name}`,
                type: "transaction",
                link: `/admin/transactions`
            });
        } catch (error) {
            console.log("Create transaction error:", error);
        }
        
        res.status(201).json(transaction);
    } catch (error) {
        console.error("Create transaction error:", error);
        res.status(500).json({ message: "Failed to create transaction" });
    }
});

router.put("/teamleader/verify/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isVerified } = req.body;

        if (req.user?.role !== "TEAM_LEADER") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        await prisma.transaction.update({
            where: { id },
            data: {
                isApprovedByTeamLeader: isVerified
            }
        });

        res.json("transaction verified");
    } catch (error) {
        console.error('Error verifying transaction:', error);
        res.status(500).json({ message: 'Failed to verify transaction' });
    }
});

router.put("/admin/verify/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isVerified } = req.body;

        if (req.user?.role !== "ADMIN") {
            return res.status(401).json({ message: "Unauthorized" });
        }

         await prisma.transaction.update({
            where: { id },
            data: {
                status: isVerified
            }
        });

        res.json("transaction verified");
    } catch (error) {
        console.error('Error verifying transaction:', error);
        res.status(500).json({ message: 'Failed to verify transaction' });
    }
});

router.put("/:id", async (req: Request, res: Response) => {
    try {
        const { amount, commissionRate, transactionMethod, date, propertyType } = req.body;
        
        const user = req.user;
        if(!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        // Check if transaction exists and belongs to the user's company
        const existingTransaction = await prisma.transaction.findFirst({
            where: {
                id: req.params.id,
                companyId: user.companyId
            }
        });

        if (!existingTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        const transaction = await prisma.transaction.update({
            where: { id: req.params.id },
            data: {
                amount: parseFloat(amount),
                commissionRate: commissionRate ? parseFloat(commissionRate) : null,
                transactionMethod,
                date: new Date(date),
                propertyType: propertyType as LeadRole
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

export default router;