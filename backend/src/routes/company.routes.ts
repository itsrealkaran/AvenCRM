import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { verifyRoleAndCompany } from "../middleware/roleAuth.js";
import { prisma } from "../lib/prisma.js";
import { blockCompany, deleteCompany, extendPlan, reactivateCompany } from '../controllers/company.controller.js';
import { notificationService } from "../services/redis.js";

const router: Router = Router();
router.use(protect);

// Get all companies (SuperAdmin only)
router.get("/", 
  verifyRoleAndCompany(["SUPERADMIN"]),
  async (req, res) => {
    try {
      const companies = await prisma.company.findMany({
        include: {
          
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          plan: true,
        },
      });
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  }
);

// Get company by ID (SuperAdmin and Admin)
router.get("/:id", 
  verifyRoleAndCompany(["SUPERADMIN", "ADMIN"]),
  async (req, res) => {
    try {
      const company = await prisma.company.findUnique({
        where: { id: req.params.id },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          plan: true,
        },
      });
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company" });
    }
  }
);

// Create new company (SuperAdmin only)
router.post("/", 
  verifyRoleAndCompany(["SUPERADMIN"]),
  async (req, res) => {
    const data = req.body;

    try {
      const company = await prisma.company.create({
        data: {
          name: data.name,
          email: data.email,
          adminId: data.adminId,
          planId: data.planId,
          planEnd: new Date(data.planEnd),
          address: data.address,
          phone: data.phone,
          website: data.website,
        },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          plan: true,
        },
      });
      
      res.status(201).json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to create company" });
    }
  }
);

router.post("/notify-admin", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userDetails= await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        name: true,
      },
    });

    const adminDetails = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: {
        admin: {
          select: {
            id: true,
          }
        },
      },
    });
    
    if (!adminDetails) {
      return res.status(404).json({ message: "Admin not found" });
    }

    notificationService.createNotification(adminDetails?.admin?.id, {
      title: "Upgrade Plan",
      message: `${userDetails?.name} is requesting an upgrade to the Enterprise plan to use AI features.`,
      type: "upgrade",
    });

    return res.status(200).json({ message: "Admin notified successfully" });
    
  } catch (error) {
    res.status(500).json({ message: "Failed to notify admin" });
  }
});
// Update company (SuperAdmin only)
router.put("/:id",
  verifyRoleAndCompany(["SUPERADMIN", "ADMIN"]),
  async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (user.role === "ADMIN" && user.companyId !== id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const company = await prisma.company.update({
        where: { id },
        data: {
          ...data,
        },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          plan: true,
        },
      });
      
      res.json(company);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Failed to update company" });
    }
  }
);

// Block/Reactivate/Delete company routes (SuperAdmin only)
router.post("/block/:id", verifyRoleAndCompany(["SUPERADMIN"]), blockCompany);
router.post("/reactivate/:id", verifyRoleAndCompany(["SUPERADMIN"]), reactivateCompany);
router.post("/extend-plan/:id", verifyRoleAndCompany(["SUPERADMIN"]), extendPlan);
router.delete("/:id", verifyRoleAndCompany(["SUPERADMIN"]), deleteCompany);

export default router;
