import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import AWS from "aws-sdk";
import multer from "multer";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(protect);

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Create S3 instance
const s3 = new AWS.S3();

// Configure multer-s3 upload middleware
const upload = multer({ 
  dest: 'uploads/', // Destination folder for temporary file storage
  limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
});

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
    console.log(req.body.formData);
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

router.post("/upload-image", async (req, res) => {
  try {
    // Check if file was uploaded
    console.log(req.file);
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate bucket name
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      return res.status(500).json({ error: 'S3 bucket name is not configured' });
    }

    // Generate unique filename
    const fileExtension = req.file.originalname.split('.').pop();
    const filename = `uploads/${uuidv4()}.${fileExtension}`;

    const uploadParams = {
      Bucket: bucketName,
      Key: filename,
      Body: fs.createReadStream(req.file.path),
      ContentType: req.file.mimetype,
      ACL: "public-read"
    };

    // Upload to S3
    const uploadResult = await s3.upload(uploadParams).promise();

    // Delete the temporary file after successful upload
    fs.unlinkSync(req.file.path);

    // Send response
    res.json({ 
      message: 'File uploaded successfully',
      imageUrl: uploadResult.Location,
      key: uploadResult.Key
    });

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