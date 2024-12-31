import { Router } from "express";
import db from "../db/index.js";
import { protect } from "../middleware/auth.js";
import { Response, Request } from "express";
import { leadsController } from "../controllers/leads.controller.js";
import { DealStatus } from "@prisma/client";


const router: Router = Router();
router.use(protect);

router.get("/", async (req: Request, res: Response) => {

    // if the user is a company admin, only return leads from their company
    if(req.user?.role === 'ADMIN') {
        return leadsController.getAllLeads(req, res);
    }


    try {
        const leads = await db.lead.findMany({
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
    const companyId = req.user?.companyId;
    

    const { name, phone, email, source, expectedDate, notes, status } = req.body;
    

    try {
        const lead = await db.lead.create({
            data: {
                name,
                phone: phone,
                email,
                source,
                expectedDate,
                notes,
                status,
                agentId: req.user?.id ?? '',
                companyId: companyId || '',
            },
        });
        res.json(lead);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to create lead" });
    }
});


router.put("/:id", async (req: Request, res: Response) => {
    const { name, phone, email, source, expectedDate , notes, status } = req.body;
    
    try {
        const lead = await db.lead.update({
            where: { id: req.params.id },
            data: {
                name,
                phone,
                email,
                source,
                expectedDate,
                notes,
                status,
            },
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

    if (!leadId || !dealAmount) {
        return res.status(400).json({ message: "Lead ID and deal amount are required" });
    }

    try {
        const lead = await db.lead.findUnique({
            where: { id: leadId },
            include: {
                company: true,
                agent: true,
            },
        });

        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }

        // Start a transaction to ensure data consistency
        const [deal, updatedLead] = await db.$transaction([
            db.deal.create({
                data: {
                    name: lead.name,
                    dealAmount: parseFloat(dealAmount.toString()),
                    email: lead.email,
                    expectedCloseDate: expectedCloseDate ?? lead.expectedDate,
                    notes: lead.notes || '{}',
                    companyId: lead.companyId,
                    agentId: lead.agentId,
                    status: DealStatus.ACTIVE,
                },
            }),
            db.lead.update({
                where: { id: leadId },
                data: {
                    status: 'WON',
                },
            }),
        ]);

        res.json({ deal, message: "Lead successfully converted to deal" });
    } catch (error) {
        console.error("Error converting lead to deal:", error);
        res.status(500).json({ 
            message: "Failed to convert lead to deal",
            error: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
});

export default router;
