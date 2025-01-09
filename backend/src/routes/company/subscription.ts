import { Router } from "express";
import db from "../../db/index.js";
import { verifyAdminCompany, verifySuperAdmin } from "../../lib/verifyUser.js";
import { protect } from "../../middleware/auth.js";

const router: Router = Router();

router.use(protect);

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

      const company = await db.company.findFirst({
        where: {
          id: companyId,
        },
        include: {
          payments: true,
        },
      });

      res.send(company?.payments);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

export { router as manageSubscription };
