import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const properties = await prisma.property.findMany();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch properties" });
  }
});

// Add this POST route after your existing GET route

router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      address,
      sqft,
      propertySummary,
      bathrooms,
      interiorFeatures,
      buildingFeatures,
      heatingNcooling,
      exteriorFeatures,
      measurements,
      parking,
      lotFeatures,
      rooms,
      images,
    } = req.body;

    // Basic validation
    if (!title || !description || !price || !address) {
      return res.status(400).json({
        message:
          "Required fields missing: title, description, price, and address are required",
      });
    }

    // Get the agent ID from the authenticated user
    //@ts-ignore
    const agentId = req.user?.id;
    if (!agentId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Create the property
    const property = await prisma.property.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        address,
        sqft: parseInt(sqft),
        propertySummary: propertySummary,
        bathrooms: bathrooms,
        interiorFeatures: interiorFeatures,
        buildingFeatures: buildingFeatures,
        heatingNcooling: heatingNcooling,
        exteriorFeatures: exteriorFeatures,
        measurements: measurements,
        parking: parking,
        lotFeatures: lotFeatures,
        rooms: rooms as any[],
        images: images || [],
        creatorId: agentId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    res.status(201).json(property);
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({
      message: "Failed to create property",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export { router as propertyRoutes };
