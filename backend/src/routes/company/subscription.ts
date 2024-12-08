import { Router } from "express";
import db from "../../db";
import { authenticateToken } from "../../middleware/authMiddleware";
import { verifyAdmin } from "../../lib/verifyUser";

const router = Router();

router.get("/subscriptions", authenticateToken, async (req, res) => {
  if (!req.user) {
    res.status(400).json({ message: "bad auth" });
  } else {
    //@ts-ignore
    let id = req.user.profileId;

    const isVerified = await verifyAdmin(id);
    if(!isVerified){
      res.status(400).json({ err: "not verified" })
      return;
    }
    try {
      const company = await db.company.findFirst({
        where: {
          adminId: id,
        },
      });
      if (!company) {
        res.status(404).json({ message: "heckerrrrr" });
      } else {
        const payments = await db.payment.findMany({
          where: {
            companyId: company.id,
          },
        });
        res.send(payments);
      }
    } catch (err) {
      res.status(500).json(err);
    }
  }
});

export { router as manageSubscription };
