import { Router } from "express";
import db from "../db/index.js";
import { protect } from "../middleware/auth.js";
import { Response, Request } from "express";


const router = Router();
router.use(protect);

router.get("/", async (req: Request, res: Response) => {
    try {
        const leads = await db.lead.findMany();
        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch leads" });
    }
});


router.get("/:id", async (req: Request, res: Response) => {

    const { startDate, endDate } = req.body;

    try {
        if (startDate && endDate) {
            const leads = await db.lead.findMany({
                where: {
                    createdAt: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                },
            });
            res.json(leads);
        } else {
            const lead = await db.lead.findUnique({
                where: { id: req.params.id },
            });
            res.json(lead);
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch lead" });
    }
});


router.post("/", async (req: Request, res: Response) => {

    const agentId = req.user?.profileId;
    const company = await db.agent.findUnique({
        where: { id: agentId },
        select: { companyId: true }
    });
    

    const { name, phoneNo, email, leadAmount, source, expectedDate, notes } = req.body;
    
    try {
        const lead = await db.lead.create({
            data: {
                name,
                phone: phoneNo,
                email,
                leadAmount,
                source,
                expectedDate,
                notes,
                agentId: req.user?.profileId ?? '',
                companyId: company?.companyId || '',
            },
        });
        res.json(lead);
    } catch (error) {
        res.status(500).json({ message: "Failed to create lead" });
    }
});


router.put("/:id", async (req: Request, res: Response) => {
    try {
        const lead = await db.lead.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(lead);
    } catch (error) {
        res.status(500).json({ message: "Failed to update lead" });
    }
}); 

router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const lead = await db.lead.delete({
            where: { id: req.params.id },
        });
        res.json(lead);
    } catch (error) {
        res.status(500).json({ message: "Failed to delete lead" });
    }
});

router.delete("/", async (req: Request, res: Response) => {
    const { leadIds } = req.body;

    try {
        const lead = await db.lead.deleteMany({
            where: {
                id: {
                    in: leadIds
                }
            }
        });
        res.json(lead);
    } catch (error) {
        res.status(500).json({ message: "Failed to delete leads" });
    }
});

// route to convert lead to deal
router.post("/convert", async (req: Request, res: Response) => {
    const { leadId, dealAmount, expectedCloseDate } = req.body;
    try {
        const lead = await db.lead.findUnique({
            where: { id: leadId },
        });
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }
        const deal = await db.deal.create({
            data: {
                name: lead.name,
                dealAmount: dealAmount,
                email: lead.email,
                expectedCloseDate: expectedCloseDate ?? lead.expectedDate,
                notes: lead.notes,
                companyId: lead.companyId,
                agentId: lead.agentId,
            },
        });
        res.json(deal);
    } catch (error) {
        res.status(500).json({ message: "Failed to convert lead to deal" });
    }
});


export default router;

