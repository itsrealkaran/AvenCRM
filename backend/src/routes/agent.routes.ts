import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { Response, Request } from 'express';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';

const router = Router();
router.use(protect);


router.get("/", async (req: Request, res: Response) => {
    try {
        const agents = await prisma.agent.findMany();
        res.json(agents);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch agents" });
    }
});


router.get("/:id", async (req: Request, res: Response) => {
    try {
        const agent = await prisma.agent.findUnique({
            where: { id: req.params.id },
        });
        res.json(agent);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch agent" });
    }
});


router.post("/", async (req: Request, res: Response) => {

    const adminId = req.user?.profileId;

    const company = await prisma.company.findFirst({
        where: {
            adminId,
        },
    });
    if (!company) {
        return res.status(404).json({ message: "Company not found" });
    }   

    const { name, email, dob, phone, gender } = req.body;

    let password = bcrypt.hashSync("123456", 12);
    const companyId = company.id;

    try {
        const agent = await prisma.agent.create({
            data: {
                name: name,
                email: email,
                password: password,
                dob: dob,
                companyId: companyId,
                phone: phone,
                gender: gender,
                role: "AGENT",
            },
        });
        res.json(agent);
    } catch (error) {
        res.status(500).json({ message: "Failed to create agent" });
    }
});


router.put("/:id", async (req: Request, res: Response) => {
    try {
        const agent = await prisma.agent.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(agent);
    } catch (error) {
        res.status(500).json({ message: "Failed to update agent" });
    }
});


router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const agent = await prisma.agent.delete({
            where: { id: req.params.id },
        });
        res.json(agent);
    } catch (error) {
        res.status(500).json({ message: "Failed to delete agent" });
    }
});


router.delete("/", async (req: Request, res: Response) => {
    const { agentIds } = req.body;

    console.log(agentIds);

    if(agentIds.length === 0){
        return res.status(400).json({ message: "No agent ids provided" });
    }

    try {
        const agent = await prisma.agent.deleteMany({
            where: {
                id: {
                    in: agentIds
                }
            }
        });
        res.json(agent);
    } catch (error) {
        res.status(500).json({ message: "Failed to delete agent" });
    }
});



export default router;