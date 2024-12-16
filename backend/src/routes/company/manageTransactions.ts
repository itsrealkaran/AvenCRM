import { Router } from "express";
import db from "../../db/index.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";
import { verifyAdmin } from "../../lib/verifyUser.js";

const router: Router = Router();

router.get("/", authenticateToken, async (req, res) => {
    if (!req.user) {
        res.status(400).json({ message: "bad auth" });
    } else {
        //@ts-ignore
        let id = req.user.id;

        const isVerified = await verifyAdmin(id);
        if(!isVerified){
            res.status(400).json({ err: "not verified" })
            return;
        }
        try {
            const company = await db.company.findFirst({
                where: {
                    adminId: id,
                },
            });
            if (!company) {
                res.status(404).json({ message: "heckerrrrr" });
            } else {
                const transactions = await db.transaction.findMany({
                    where: {
                        companyId: company.id
                    }
                });
                res.status(200).send(transactions);
            }
        } catch (err) {
            res.status(500).json(err);
        }
    }
});

router.put(`/verify`, authenticateToken, async (req, res) => {    
    debugger;

    const { isVerfied, id } = req.body;

    console.log(isVerfied),
    console.log(id);

    if (!req.user) {
        res.status(400).json({ message: "bad auth" });
        return;
    }

    //@ts-ignore
    let adminId = req.user.id;
    const isAdmin = await verifyAdmin(adminId);
    if(!isAdmin){
        res.status(400).json({ err: "not verified" })
        return;
    }

    try {
        const transaction = await db.transaction.update({
            where: {
                id: id
            },
            data: {
                isVerfied: isVerfied
            }
        }); 
        res.status(200).send(transaction);

    } catch (err) {
        res.status(500).json({ message: "Failed to update transaction status", error: err });
    }
});


router.post("/", authenticateToken, async (req, res) => {
    const { amount, transactionMethod, type } = req.body;
    if (!req.user) {
        res.status(400).json({ message: "bad auth" });
    } else {
        //@ts-ignore
        let id = req.user.id;
        try {
            const agent = await db.agent.findFirst({
                where: {
                    id: id
                },
            });
           
            if (!agent) {
                res.status(404).json({ message: "heckerrrrr" });
            } else {
                const comapanyID = agent.companyId;
                const transaction = await db.transaction.create({
                    data: {
                        amount,
                        transactionMethod: transactionMethod,
                        type,
                        companyId: comapanyID,
                        agentId: agent.id
                    }
                });
                res.status(201).send(transaction);
            }

        } catch (err) {
            res.status(500).json(err);
        }
    }
});


export { router as managePayment };
