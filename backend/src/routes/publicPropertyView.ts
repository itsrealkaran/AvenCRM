import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router: Router = Router();

router.get("/:id", async (req, res) => {
  try {
    const propertyId = req.params.id;
    const property = await prisma.property.findFirst({
        where: {
            id: propertyId
        }
    });
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch properties" });
  }
});

export { router as propertyView}