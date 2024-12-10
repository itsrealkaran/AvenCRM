import { Router } from "express";
import db from "../../db/index.js";
import { verifyAdminCompany } from "../../lib/verifyUser.js";
import { protect } from "../../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", async (req, res) => {
  if (!req.user) {
    res.status(400).json({ message: "bad auth" });
  } else {
    let id = req.user.profileId;

    try {
      const companyId = await verifyAdminCompany(id);
      if (!companyId) {
        return res.status(400).json({ err: "not verified" });
      }
      const payments = await db.payment.findMany({
        where: {
          companyId: companyId,
        },
      });
      res.send(payments);
    } catch (err) {
      res.status(500).json(err);
    }
  }
});

export { router as manageSubscription };
