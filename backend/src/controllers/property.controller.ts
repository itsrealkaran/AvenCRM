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
import { generatePresignedUrl } from "../utils/s3.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import fs from "fs";

const upload = multer();

type Controller = {
  [key: string]: RequestHandler | RequestHandler[];
};

export const propertiesController: Controller = {
  getAllProperties: async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Convert page and limit to numbers if they are present
      const query: Record<string, any> = { ...req.query };
      if (query.page) {
        query.page = Number(query.page);
      }
      if (query.limit) {
        query.limit = Number(query.limit);
      }

      const filterResult = propertyFilterSchema.safeParse(query);
      if (!filterResult.success) {
        logger.error("Error in getAllProperties:", filterResult.error);
        return res.status(400).json({ errors: filterResult.error.flatten() });
      }

      const filters = filterResult.data;
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const skip = (page - 1) * limit;

      const startDate = filters.startDate
        ? new Date(filters.startDate)
        : subMonths(new Date(), 1);
      const endDate = filters.endDate ? new Date(filters.endDate) : new Date();

      const where: any = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (filters.createdById) where.createdById = filters.createdById;
      if (filters.status) where.status = filters.status;
      if (filters.propertyType) where.propertyType = filters.propertyType;
      if (filters.minPrice) where.price = { gte: filters.minPrice };
      if (filters.maxPrice)
        where.price = { ...where.price, lte: filters.maxPrice };
      if (filters.minSqft) where.sqft = { gte: filters.minSqft };
      if (filters.maxSqft) where.sqft = { ...where.sqft, lte: filters.maxSqft };

      const total = await prisma.property.count({ where });

      const properties = await prisma.property.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: filters.sortBy
          ? {
              [filters.sortBy]: filters.sortOrder || "desc",
            }
          : {
              createdAt: "desc",
            },
      });

      const response = {
        data: properties,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };

      const validatedResponse = propertiesResponseSchema.parse(response);
      return res.json(validatedResponse);
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
