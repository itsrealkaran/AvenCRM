import { Router } from "express";
import db from "../../db";
import { authenticateToken } from "../../middleware/authMiddleware";

const router = Router();

router.get("/getall", authenticateToken, async (req, res) => {
  if (!req.user) {
    res.status(400).json({ message: "bad auth" });
  } else {
    //@ts-ignore
    let id = req.user.profileId;
    try {
      const deals = await db.deal.findMany({
        where: {
          agentId: id,
        },
      });

      res.status(200).send(deals);
    } catch (err) {
      res.send(err);
    }
  }
});

router.post("/add", (req, res) => {
  const {
    name,
    status,
    dealValue,
    email,
    expectedCloseDate,
    notes,
    companyId,
    agentId,
  } = req.body;

  try {
    const deal = db.deal.create({
      data: {
        name,
        status,
        dealAmount: dealValue,
        email,
        expectedCloseDate,
        notes,
        companyId,
        agentId,
      },
    });
    res.status(200).send(deal);
  } catch (err) {
    res.send(err);
  }
});

router.patch("/update", (req, res) => {
  const {
    name,
    status,
    dealValue,
    email,
    expectedCloseDate,
    notes,
    companyId,
    agentId,
    dealId,
  } = req.body;

  try {
    const deal = db.deal.update({
      where: {
        companyId,
        agentId,
        id: dealId,
      },
      data: {
        name,
        status,
        dealAmount: dealValue,
        email,
        expectedCloseDate,
        notes,
        companyId,
        agentId,
      },
    });
    res.status(200).send(deal);
  } catch (err) {
    res.send(err);
  }
});

router.delete("/delete", async (req, res) => {
  const { companyId, agentId, dealId } = req.body;

  try {
    const deals = await db.deal.delete({
      where: {
        companyId,
        agentId,
        id: dealId,
      },
    });

    res.status(200).send(deals);
  } catch (err) {
    res.send(err);
  }
});

export { router as manageDeals };
