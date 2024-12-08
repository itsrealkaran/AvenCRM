import { Router } from "express";
import db from "../../db";
import { verifyAdmin } from "../../lib/verifyUser";
import { authenticateToken } from "../../middleware/authMiddleware";

const router = Router();

// edit the code later


router.get("/agentsCount", authenticateToken, async (req, res) => {
  if (!req.user) {
    res.status(400).json({ message: "bad auth" });
  } else {
    //@ts-ignore
    let id = req.user.profileId;
    const isVerified = await verifyAdmin(id);
    if (!isVerified) {
      res.status(400).json({ err: "not verified" });
      return;
    }
    try {
      const agents = await db.agent.findMany({
        where: {
          companyId: id,
        },
      });

      res.status(200).send(agents);
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
      let id = req.user.profileId;
      const isVerified = await verifyAdmin(id);
      if (!isVerified) {
        res.status(400).json({ err: "not verified" });
      }

      const leads = await db.lead.findMany({
        where: {
          companyId: id,
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
