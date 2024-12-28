import { Router } from "express";
import db from "../db/index.js";
import { protect } from "../middleware/auth.js";
import { Response, Request } from "express";
import { DealStatus } from "@prisma/client";


const router: Router = Router();
router.use(protect);

router.get("/", async (req: Request, res: Response) => {
    try {
        const deals = await db.deal.findMany();
        res.json(deals);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch deals" });
    }
});


router.get("/:id", async (req: Request, res: Response) => {

    const { startDate, endDate } = req.body;

    try {
        if (startDate && endDate) {
            const deals = await db.deal.findMany({
                where: {
                    createdAt: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                },
            });
            res.json(deals);
        } else {
            const deal = await db.deal.findUnique({
                where: { id: req.params.id },
            });
            res.json(deal);
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch deal" });
    }
});


router.post("/", async (req: Request, res: Response) => {
    const { name, status, dealAmount, email, expectedCloseDate, notes, propertyType } = req.body;
    let dealValue = Number(dealAmount);

    const companyId = req.user?.companyId || '';
    const userId = req.user?.id || '';

    try {
        const deal = await db.deal.create({
            data: {
                name: name,
                status: DealStatus.ACTIVE,
                dealAmount: dealValue,
                email: email,
                expectedCloseDate: expectedCloseDate,
                notes: notes,
                companyId: companyId,
                agentId: userId,
                propertyType: propertyType
            },
        });
        res.json(deal);
    } catch (error) {
        res.status(500).json({ message: "Failed to create deal" });
    }
});


router.put("/:id", async (req: Request, res: Response) => {
    const { name, status, dealAmount, email, expectedCloseDate, notes, propertyType } = req.body;
    let dealValue = Number(dealAmount);
    try {
        const deal = await db.deal.update({
            where: { id: req.params.id },
            data: {
                name: name,
                status: status,
                dealAmount: dealValue,
                email: email,
                expectedCloseDate: expectedCloseDate,
                notes: notes,
                propertyType: propertyType
            },
        });
        res.json(deal);
    } catch (error) {
        res.status(500).json({ message: "Failed to update deal" });
    }
}); 

router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const deal = await db.deal.delete({
            where: { id: req.params.id },
        });
        res.json(deal);
    } catch (error) {
        res.status(500).json({ message: "Failed to delete deal" });
    }
});

router.delete("/", async (req: Request, res: Response) => {
    const { dealIds } = req.    body;

    try {
        const deal = await db.deal.deleteMany({
            where: {
                id: {
                    in: dealIds
                }
            }
        });
        res.json(deal);
    } catch (error) {
        res.status(500).json({ message: "Failed to delete deals" });
    }
});


export default router;

