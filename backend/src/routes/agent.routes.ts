import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { Response, Request } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import { Prisma, UserRole } from "@prisma/client";
import { verifyAdminCompany } from "../lib/verifyUser.js";

const router: Router = Router();
router.use(protect);

router.get("/", async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(404).json({ message: "Company not found" });
    }
    const agents = await prisma.user.findMany({
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
  const adminId = req.user?.id;
  if (role !== "ADMIN" || !adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const agent = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
    });
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch agent" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const role = req.user?.role;
  const adminId = req.user?.id;
  if (role !== "ADMIN" || !adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const companyId = await verifyAdminCompany(adminId);
    if (!companyId) {
      return res.status(404).json({ message: "Company not found" });
    }

    const { name, email, dob, phone, gender, agentRole } = req.body;

    let password = bcrypt.hashSync("123456", 12);
    
    let agent;
    // Create a team if role is team leader
    if (agentRole === UserRole.TEAM_LEADER) {
      agent = await prisma.$transaction(async (tx) => {
        const teamLeader = await tx.user.create({
          data: {
            name: name,
            email: email,
            password: password,
            dob: new Date(dob),
            companyId: companyId,
            phone: phone,
            gender: gender,
            role: agentRole,
          },
        });
        await tx.team.create({
          data: {
            name: name + Math.floor(Math.random() * 1000),
            teamLeaderId: teamLeader.id,
            companyId
          },
        });
        return teamLeader;
      });
    } else {
      agent = await prisma.$transaction(async(dx) => {
        const user = await prisma.user.create({
          data: {
            name: name,
            email: email,
            password: password,
            dob: new Date(dob),
            companyId: companyId,
            phone: phone,
            gender: gender,
            role: agentRole,
          },
        });
        return await prisma.team.update({
          where: {
            teamLeaderId: user.id
          },
          data: {
            members: {
              connect: {
                id: user.id
              }
            } 
          }
        })
      })
    }
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  const role = req.user?.role;
  const adminId = req.params.id;
  if (role !== "ADMIN" || !adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { name, email, dob, phone, gender } = req.body;
  let dobDate;
  if (dob) dobDate = new Date(dob);
  try {
    const agent = await prisma.user.update({
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
  const adminId = req.user?.id;
  if (role !== "ADMIN" || !adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const companyId = await verifyAdminCompany(adminId);
    if (!companyId) {
      return res.status(404).json({ message: "Company not found" });
    }
    const agent = await prisma.user.delete({
      where: {
        id: req.params.id,
        companyId: companyId,
      },
    });
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: "Failed to delete agent" });
  }
});

router.delete("/", async (req: Request, res: Response) => {
  const role = req.user?.role;
  const adminId = req.user?.id;
  if (role !== "ADMIN" || !adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { agentIds } = req.body;

  if (!Array.isArray(agentIds)) {
    return res.status(400).json({ message: "agentIds must be an array" });
  }

  if (agentIds.length === 0) {
    return res.status(400).json({ message: "No agent ids provided" });
  }

  // Validate that all IDs are valid strings
  if (!agentIds.every((id) => typeof id === "string" && id.length > 0)) {
    return res.status(400).json({ message: "Invalid agent IDs format" });
  }

  try {
    const companyId = await verifyAdminCompany(adminId);
    if (!companyId) {
      return res.status(404).json({ message: "Company not found" });
    }
    await prisma.user.deleteMany({
      where: {
        id: {
          in: agentIds,
        },
        companyId: companyId,
      },
    });
    res.json({
      message: "Agents deleted successfully",
      count: agentIds.length,
    });
  } catch (error) {
    console.error("Failed to delete agents:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(400).json({ message: "Invalid agent IDs provided" });
    }
    res.status(500).json({ message: "Failed to delete agents" });
  }
});

export default router;
