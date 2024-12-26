import { Router } from "express";
import db from "../../db/index.js";
import { verifyAdminCompany } from "../../lib/verifyUser.js";
import { protect } from "../../middleware/auth.js";

const router: Router = Router();

router.use(protect);

// edit the code later


router.get("/agentsCount", async (req, res) => {
  if (!req.user) {
    res.status(400).json({ message: "bad auth" });
  } else {
    //@ts-ignore
    let id = req.user.id;
    const companyId = await verifyAdminCompany(id);
    if (!companyId) {
      return res.status(400).json({ err: "not verified" });
    }
    try {
      const agents = await db.user.findMany({
        where: {
          companyId: companyId,
        },
      });
      res.send(agents);
    } catch (err) {
      res.status(500).send(err);
    }
  }
});
router.get("/sales", async (req, res) => {
  try {
    if (!req.user) {
      res.status(400).json({ message: "bad auth" });
    } else {
      //@ts-ignore
      let id = req.user.id;
      const companyId = await verifyAdminCompany(id);
      if (!companyId) {
        return res.status(400).json({ err: "not verified" });
      }

      const leads = await db.lead.findMany({
        where: {
          companyId: companyId,
        },
      });

      const newLeads = leads.length;
      const leadsContacted = leads.filter((lead) => {
        return lead.status === "CONTACTED";
      }).length;
      const proposals = leads.filter((lead) => {
        return lead.status === "QUALIFIED";
      }).length;
      const negotiation = leads.filter((lead) => {
        return lead.status === "NEGOTIATION";
      }).length;
      const won = leads.filter((lead) => {
        return lead.status === "WON";
      }).length;

      res
        .status(200)
        .json({ newLeads, leadsContacted, proposals, negotiation, won });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

export { router as companyMonitoring };
