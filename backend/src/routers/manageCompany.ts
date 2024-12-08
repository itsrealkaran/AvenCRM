import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import db from "../db";

const router = Router();

router.get("/getAll", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const id = req.user.profileId;
    
    const company = await db.company.findFirst({
      where: {
        adminId: id,
      },
    });

    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    res.status(200).json(company);
  } catch (err) {
    console.error('Error fetching company:', err);
    res.status(500).json({ message: "Internal server error", error: err });
  }
});

export { router as manageCompany };
