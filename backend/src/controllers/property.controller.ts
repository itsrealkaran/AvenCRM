import { Request, RequestHandler, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { PropertyStatus, UserRole } from "@prisma/client";
import { subMonths } from "date-fns";
import {
  createPropertySchema,
  updatePropertySchema,
  propertyFilterSchema,
  propertiesResponseSchema,
  propertyResponseSchema,
} from "../schema/property.schema.js";
import logger from "../utils/logger.js";
import multer from "multer";
import { generatePresignedUrl, generatePresignedDownloadUrl } from "../utils/s3.js";

interface PropertyCardDetails {
  title: string;
  address: string;
  price: number;
  image?: string;
  beds: number;
  baths: number;
  sqft: number;
  parking?: number;
}

const upload = multer();

type Controller = {
  [key: string]: RequestHandler | RequestHandler[];
};

export const propertiesController: Controller = {
  getProperties: async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const properties = await prisma.property.findMany({
        where: {
          isVerified: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          slug: true,
          isVerified: true,
          cardDetails: true,
          createdAt: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        }
      });

      // Generate presigned URLs for property images
      const propertiesWithUrls = await Promise.all(
        properties.map(async (property) => {
          const cardDetails = property.cardDetails as unknown as PropertyCardDetails;
          if (cardDetails?.image) {
            try {
              const imageUrl = await generatePresignedDownloadUrl(cardDetails.image);
              return {
                ...property,
                cardDetails: {
                  ...cardDetails,
                  image: imageUrl
                }
              };
            } catch (error) {
              console.error(`Failed to generate URL for property image: ${cardDetails.image}`, error);
              return property;
            }
          }
          return property;
        })
      );

      const myProperty = propertiesWithUrls.filter(property => property.createdBy.id === user.id);
      const allProperty = propertiesWithUrls.filter(property => property.createdBy.id !== user.id);

      return res.json({ myProperty, allProperty });
    } catch (error) {
      logger.error("Error in getAllProperties:", error);
      return res.status(500).json({ message: "Failed to fetch properties" });
    }
  },

  getAllProperties: async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const properties = await prisma.property.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          slug: true,
          isVerified: true,
          cardDetails: true,
          createdAt: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        }
      });

      // Generate presigned URLs for property images
      const propertiesWithUrls = await Promise.all(
        properties.map(async (property) => {
          const cardDetails = property.cardDetails as unknown as PropertyCardDetails;
          if (cardDetails?.image) {
            try {
              const imageUrl = await generatePresignedDownloadUrl(cardDetails.image);
              return {
                ...property,
                cardDetails: {
                  ...cardDetails,
                  image: imageUrl
                }
              };
            } catch (error) {
              console.error(`Failed to generate URL for property image: ${cardDetails.image}`, error);
              return property;
            }
          }
          return property;
        })
      );

      //seperate the properties based on their 'isVerified' field
      const verifiedProperties = propertiesWithUrls.filter(property => property.isVerified);
      const unverifiedProperties = propertiesWithUrls.filter(property => !property.isVerified);

      return res.json({ verifiedProperties, unverifiedProperties });
    } catch (error) {
      logger.error("Error in getAllProperties:", error);
      return res.status(500).json({ message: "Failed to fetch properties" });
    }
  },

  getPropertyById: async (req: Request, res: Response) => {
    try {
      const property = await prisma.property.findUnique({
        where: { id: req.params.id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      const validatedResponse = propertyResponseSchema.parse(property);
      return res.json(validatedResponse);
    } catch (error) {
      logger.error("Error in getPropertyById:", error);
      return res.status(500).json({ message: "Failed to fetch property" });
    }
  },

  uploadFile: async (req: Request, res: Response) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Generate presigned URL for the file
      const { uploadUrl, key, downloadUrl } = await generatePresignedUrl(
        req.file.originalname,
        req.file.mimetype
      );

      // Return both the upload and download URLs
      res.status(200).json({
        uploadUrl,
        downloadUrl,
        key,
      });
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  },

  createProperty: [
    upload.array("files", 10),
    async (req: Request, res: Response) => {
      try {
        const { cardData, completeFormData } = req.body;
        if (!cardData || !completeFormData) {
          return res
            .status(400)
            .json({ message: "Invalid request: Missing data field." });
        }
        if(!req.user?.id || !req.user?.companyId){
          return res.status(401).json({ message: "Unauthorized" });
        }

        // generate a alpha-numeric slug
        const randomStr =
          Math.random().toString(36).substring(2, 10) +
          Date.now().toString(36) +
          Math.random().toString(36).substring(2, 10);
        const slug = randomStr.toLowerCase();

        const property = await prisma.property.create({
          data: {
            slug,
            cardDetails: cardData,
            features: completeFormData,
            createdById: req.user.id,
            companyId: req.user.companyId,
          },
        });
        return res.json(property);
      } catch (error) {
        logger.error("Unexpected error in createProperty:", error);
        return res.status(500).json({ message: "Failed to create property" });
      }
    },
  ],

  updateProperty: [
    upload.array("files", 10),
    async (req: Request, res: Response) => {
      try {
        const { cardData, completeFormData } = req.body;
        if (!cardData || !completeFormData) {
          return res
            .status(400)
            .json({ message: "Invalid request: Missing data field." });
        }
        if(!req.user?.id || !req.user?.companyId){
          return res.status(401).json({ message: "Unauthorized" });
        }

        const property = await prisma.property.update({
          where: { id: req.params.id },
          data: {
            cardDetails: cardData,
            features: completeFormData,
          },
        });
        return res.json(property);
      } catch (error) {
        logger.error("Error in updateProperty:", error);
        return res.status(500).json({ message: "Failed to update property" });
      }
    },
  ],

  updatePropertyStatus: async (req: Request, res: Response) => {
    try {
      const { isVerified } = req.body;

      // Validate the status
      if (!isVerified || !Object.values(PropertyStatus).includes(isVerified)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const property = await prisma.property.update({
        where: { id: req.params.id },
        data: { isVerified },
      });

      const validatedResponse = propertyResponseSchema.parse(property);
      return res.json(validatedResponse);
    } catch (error) {
      logger.error("Error in updatePropertyStatus:", error);
      return res
        .status(500)
        .json({ message: "Failed to update property status" });
    }
  },

  deleteProperty: async (req: Request, res: Response) => {
    try {
      const property = await prisma.property.delete({
        where: { id: req.params.id },
      });
      return res.json({ message: "Property deleted successfully", property });
    } catch (error) {
      logger.error("Error in deleteProperty:", error);
      return res.status(500).json({ message: "Failed to delete property" });
    }
  },

  deleteMultipleProperties: async (req: Request, res: Response) => {
    try {
      const { propertyIds } = req.body;
      if (!Array.isArray(propertyIds)) {
        return res
          .status(400)
          .json({ message: "propertyIds must be an array" });
      }

      const result = await prisma.property.deleteMany({
        where: {
          id: {
            in: propertyIds,
          },
        },
      });
      return res.json({
        message: "Properties deleted successfully",
        count: result.count,
      });
    } catch (error) {
      logger.error("Error in deleteMultipleProperties:", error);
      return res.status(500).json({ message: "Failed to delete properties" });
    }
  },
};
