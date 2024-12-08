import { Router } from "express";
import db from "../../db/index.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";
import { verifyAdmin } from "../../lib/verifyUser.js";

const router = Router();

router.get("/", authenticateToken, async (req, res) => {
    if (!req.user) {
        res.status(400).json({ message: "bad auth" });
    } else {
        //@ts-ignore
        let id = req.user.profileId;

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
                const payments = await db.payment.findMany({
                    where: {
                        companyId: company.id
                    }
                });
                res.status(200).send(payments);
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
    let adminId = req.user.profileId;
    const isAdmin = await verifyAdmin(adminId);
    if(!isAdmin){
        res.status(400).json({ err: "not verified" })
        return;
    }

    try {
        const payment = await db.payment.update({
            where: {
                id: id
            },
            data: {
                isVerfied: isVerfied
            }
        }); 
        res.status(200).send(payment);

    } catch (err) {
        res.status(500).json({ message: "Failed to update payment status", error: err });
    }
});


router.post("/", authenticateToken, async (req, res) => {
    const { amount, paymentMethod, type } = req.body;
    if (!req.user) {
        res.status(400).json({ message: "bad auth" });
    } else {
        //@ts-ignore
        let id = req.user.profileId;
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
                const payment = await db.payment.create({
                    data: {
                        amount,
                        paymentMethod,
                        type,
                        companyId: comapanyID
                    }
                });
                res.status(201).send(payment);
            }

        } catch (err) {
            res.status(500).json(err);
        }
    }
});


export { router as managePayment };
