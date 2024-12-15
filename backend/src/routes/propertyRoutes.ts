import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import multer from "multer";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';
import crypto from "crypto"
import { uploadFile } from "../utils/s3.js";

const router = Router();

router.use(protect);

// Configure multer upload middleware
const storage = multer.memoryStorage();
const upload = multer({ storage });

//random file name generator
const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

//get all properties
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
    } = req.body.formData;

    // Basic validation
    console.log(req.file);
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

router.post("/upload-image",upload.single('image'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate bucket name
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      return res.status(500).json({ error: 'S3 bucket name is not configured' });
    }

    const imageName = generateFileName()

    // Generate unique filename
    const file = await uploadFile(req.file.buffer, imageName, req.file.mimetype);

    res.status(200).json({imageUrl: `https://${bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${imageName}`});
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Ensure temporary file is deleted even if upload fails
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error deleting temporary file:', cleanupError);
      }
    }

    res.status(500).json({ error: 'File upload failed' });
  }
});

export { router as propertyRoutes };
