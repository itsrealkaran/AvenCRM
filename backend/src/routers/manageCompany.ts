import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import db from "../db";
import { verifySuperAdmin } from "../lib/verifyUser";

const router = Router();

router.get("/getAll", authenticateToken, async(req, res) => {
  if (!req.user) {
    res.status(400).json({ message: "bad auth" });
  } else {
    //@ts-ignore
    let id = req.user.profileId;
    const isVerified = await verifySuperAdmin(id);
    if (!isVerified) {
      res.status(400).json({ err: "not verified" });
    }
    
    try {
      const company = await db.company.findMany({});
      if (!company) {
        res.status(404).json({ message: "heckerrrrr" });
      } else {
        res.send(company);
      }
    } catch (err) {
      res.status(500).json(err);
    }
  }
});

export { router as manageCompany };
