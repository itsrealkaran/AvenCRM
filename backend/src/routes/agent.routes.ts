import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { Response, Request } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";
import { verifyAdminCompany } from "../lib/verifyUser.js";

const router = Router();
router.use(protect);

router.get("/", async (req: Request, res: Response) => {
  const role = req.user?.role;
  const adminId = req.user?.profileId;
  if (role !== "ADMIN" || !adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const companyId = await verifyAdminCompany(adminId);
    if (!companyId) {
      return res.status(404).json({ message: "Company not found" });
    }
    const agents = await prisma.agent.findMany({
      where: {
        companyId: companyId,
      },
    });
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch agents" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const role = req.user?.role;
  const adminId = req.user?.profileId;
  if (role !== "ADMIN" || !adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const companyId = await verifyAdminCompany(adminId);
    if (!companyId) {
      return res.status(404).json({ message: "Company not found" });
    }
    const agent = await prisma.agent.findUnique({
      where: { 
        id: req.params.id,
        companyId: companyId
      },
    });
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch agent" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const role = req.user?.role;
  const adminId = req.user?.profileId;
  if (role !== "ADMIN" || !adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const companyId = await verifyAdminCompany(adminId);
    if (!companyId) {
      return res.status(404).json({ message: "Company not found" });
    }

    const { name, email, dob, phone, gender } = req.body;
    
    let password = bcrypt.hashSync("123456", 12);

    const agent = await prisma.agent.create({
      data: {
        name: name,
        email: email,
        password: password,
        dob: dob,
        companyId: companyId,
        phone: phone,
        gender: gender,
        role: UserRole.AGENT,
      },
    });
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  const role = req.user?.role;
  const adminId = req.user?.profileId;
  if (role !== "ADMIN" || !adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { name, email, dob, phone, gender } = req.body;
  let dobDate
  if(dob)
      dobDate = new Date(dob);
  try {
    const companyId = await verifyAdminCompany(adminId);
    if (!companyId) {
      return res.status(404).json({ message: "Company not found" });
    }

    const agent = await prisma.agent.update({
      where: { id: req.params.id },
      data: {
        name: name,
        email: email,
        dob: dobDate,
        phone: phone,
        gender: gender,
      },
    });
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const role = req.user?.role;
  const adminId = req.user?.profileId;
  if (role !== "ADMIN" || !adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const companyId = await verifyAdminCompany(adminId);
    if (!companyId) {
      return res.status(404).json({ message: "Company not found" });
    }
    const agent = await prisma.agent.delete({
      where: { 
        id: req.params.id,
        companyId: companyId
      },
    });
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: "Failed to delete agent" });
  }
});

router.delete("/", async (req: Request, res: Response) => {
  const role = req.user?.role;
  const adminId = req.user?.profileId;
  if (role !== "ADMIN" || !adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { agentIds } = req.body;

  if (agentIds.length === 0) {
    return res.status(400).json({ message: "No agent ids provided" });
  }

  try {
    const companyId = await verifyAdminCompany(adminId);
    if (!companyId) {
      return res.status(404).json({ message: "Company not found" });
    }
    const agent = await prisma.agent.deleteMany({
      where: {
        id: {
          in: agentIds,
        },
        companyId: companyId
      },
    });
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: "Failed to delete agent" });
  }
});

export default router;
