import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { verifyRoleAndCompany } from "../middleware/roleAuth.js";
import { prisma } from "../lib/prisma.js";

const router: Router = Router();
router.use(protect);

router.get("/", 
  verifyRoleAndCompany(["SUPERADMIN"]),
  async (req, res) => {
    try {
      const company = await prisma.company.findMany();
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company" });
    }
  }
);

router.get("/:id", 
  verifyRoleAndCompany(["SUPERADMIN", "ADMIN"]),
  async (req, res) => {
    try {
      const company = await prisma.company.findUnique({
        where: { id: req.params.id },
      });
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company" });
    }
  }
);

router.post("/", 
  verifyRoleAndCompany(["SUPERADMIN", "ADMIN"]),
  async (req, res) => {
    const data: {
      name: string;
      adminId: string;
      email: string;
      planId: string;
      planEnd: Date;
      address?: string;
      phone?: string;
      website?: string;
    } = req.body;

    try {
      const company = await prisma.company.create({
        data: data,
      });
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
);

router.put("/:id", 
  verifyRoleAndCompany(["SUPERADMIN", "ADMIN"]),
  async (req, res) => {
    try {
      const company = await prisma.company.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to update company" });
    }
  }
);

router.delete("/:id", 
  verifyRoleAndCompany(["SUPERADMIN"]),
  async (req, res) => {
    try {
      const company = await prisma.company.delete({
        where: { id: req.params.id },
      });
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete company" });
    }
  }
);

export default router;
