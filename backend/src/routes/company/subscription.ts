import { Router } from "express";
import db from "../../db/index.js";
import { verifyAdminCompany, verifySuperAdmin } from "../../lib/verifyUser.js";
import { protect } from "../../middleware/auth.js";
import { PlanTier } from "@prisma/client";

const router: Router = Router();

router.use(protect);

const PLAN_UPGRADE_PATHS: Record<string, string[]> = {
  'NO_PLAN': ['BASIC', 'PREMIUM'],
  'BASIC': ['PREMIUM', 'ENTERPRISE'],
  'PREMIUM': ['ENTERPRISE'],
  'ENTERPRISE': ['ENTERPRISE']
};

router.get("/", async (req, res) => {
  if (!req.user) {
    res.status(400).json({ message: "bad auth" });
  } else {
    const id = req.user.id;

    try {
      const companyId = await verifySuperAdmin(id);
      if (!companyId) {
        return res.status(400).json({ err: "not verified" });
      }
      const payments = await db.payments.findMany();
      res.send(payments);
    } catch (err) {
      res.status(500).json(err);
    }
  }
});

router.get('/plans', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const company = await db.company.findUnique({
      where: { id: user.companyId },
      include: { plan: true }
    });

    if (!company) {
      return res.status(401).json({ error: 'Company not found' });
    }

    const currentPlanName = company.plan?.name || 'NO_PLAN';
    const availablePlanNames = PLAN_UPGRADE_PATHS[currentPlanName];

    const availablePlans = await db.plan.findMany({
      where: {
        name: {
          in: availablePlanNames as PlanTier[]
        }
      },
      select: {
        id: true,
        name: true,
        price: true,
        features: true
      }
    });

    res.json(availablePlans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

router.get("/getsubscription", async (req, res) => {
  try {
    if (!req.user) {
      res.status(400).json({ message: "bad auth" });
    } else {
      const id = req.user.id;
      const companyId = await verifyAdminCompany(id);
      if (!companyId) {
        return res.status(400).json({ err: "not verified" });
      }

      const payments = await db.payments.findMany({
        where: {
          companyId
        }
      })
      res.send(payments);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

export { router as manageSubscription };
