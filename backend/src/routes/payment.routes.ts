import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { protect } from "../middleware/auth.js";
import { Request } from "express";

const router = Router();
router.use(protect);

router.get("/", async (req: Request, res: Response) => {
    try {
        const payments = await prisma.payment.findMany();
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch payments" });
    }
});


router.get("/:id", async (req: Request, res: Response) => {
    try {
        const payment = await prisma.payment.findUnique({
            where: { id: req.params.id },
        });
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch payment" });
    }
});


router.post("/", async (req: Request, res: Response) => {
    try {
        const payment = await prisma.payment.create({
            data: req.body,
        });
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: "Failed to create payment" });
    }
});


router.put("/:id", async (req: Request, res: Response) => {
    try {
        const payment = await prisma.payment.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: "Failed to update payment" });
    }
});


router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const payment = await prisma.payment.delete({
            where: { id: req.params.id },
        });
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: "Failed to delete payment" });
    }
});

router.delete("/", async (req: Request, res: Response) => {
    const { paymentIds } = req.body;

    try {
        const payment = await prisma.payment.deleteMany({
            where: {
                id: {
                    in: paymentIds
                }
            }
        });
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: "Failed to delete payment" });
    }
});


router.post("/verify", async (req: Request, res: Response) => {
    const { isVerfied } = req.body;
    try {
        const payment = await prisma.payment.update({
            where: {
                id: req.body.id
            },
            data: {
                isVerfied: isVerfied
            }
        });
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: "Failed to verify payment" });
    }
});



export default router;