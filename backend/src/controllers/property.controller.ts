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
import {
  generatePresignedUrl,
  generatePresignedDownloadUrl,
} from "../utils/s3.js";

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
  getAgentId: async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const agentId = user.id;
      return res.json({ agentId });
    } catch (error) {
      logger.error("Error in getAgentId:", error);
      return res.status(500).json({ message: "Failed to fetch agent ID" });
    }
  },

  setLeadFromProperty: async (req: Request, res: Response) => {
    try {
      const { agentId, propertyId, name, phone, email, message } = req.body;
      if (!agentId) {
        return res.status(400).json({ message: "Agent ID is required" });
      }

      const agent = await prisma.user.findUnique({
        where: { id: agentId },
      });
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      const lead = await prisma.lead.create({
        data: {
          name,
          phone,
          email,
          notes: message ? [message] : [],
          agentId,
          companyId: agent.companyId!,
        },
      });
      return res.json(lead);
    } catch (error) {
      logger.error("Error in setLeadFromProperty:", error);
      return res
        .status(500)
        .json({ message: "Failed to set lead from property" });
    }
  },

  getPublicProperty: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { agentId } = req.query;

      const property = await prisma.property.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
        },
      });

      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Parse card details and features
      const cardDetails = JSON.parse(JSON.stringify(property.cardDetails));
      const features = JSON.parse(JSON.stringify(property.features));

      // Get presigned URLs for images if they exist
      let imageUrls: string[] = [];
      const propertyImages = features.imageNames || features.images || [];

      if (propertyImages.length > 0) {
        try {
          imageUrls = await Promise.all(
            propertyImages.map(async (image: string) => {
              try {
                return await generatePresignedDownloadUrl(image, 3600); // 1 hour expiry
              } catch (error) {
                console.error(
                  `Error generating presigned URL for image ${image}:`,
                  error
                );
                return ""; // Return empty string for failed URLs
              }
            })
          );
          // Filter out any empty strings (failed URLs)
          imageUrls = imageUrls.filter((url) => url);
        } catch (error) {
          console.error("Error generating presigned URLs:", error);
        }
      }

      const propertyDetails = {
        ...cardDetails,
        ...features,
        id: property.id,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
        createdById: property.createdById,
        imageUrls, // Add the presigned URLs to the response
      };

      res.json(propertyDetails);
    } catch (error) {
      logger.error("Error in getPublicProperty:", error);
      return res
        .status(500)
        .json({ message: "Failed to fetch property details" });
    }
  },

  getProperties: async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const myProperties = await prisma.property.findMany({
        where: {
          createdById: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
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
        },
      });

      let properties = await prisma.property.findMany({
        where: {
          companyId: user.companyId,
          isVerified: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
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
        },
      });

      properties = properties.filter((property) => !myProperties.some(myProp => myProp.id === property.id));
      properties.push(...myProperties);

      // Generate presigned URLs for property images
      const propertiesWithUrls = await Promise.all(
        properties.map(async (property) => {
          const cardDetails =
            property.cardDetails as unknown as PropertyCardDetails;
          if (cardDetails?.image) {
            try {
              const imageUrl = await generatePresignedDownloadUrl(
                cardDetails.image
              );
              return {
                ...property,
                cardDetails: {
                  ...cardDetails,
                  image: imageUrl,
                },
              };
            } catch (error) {
              console.error(
                `Failed to generate URL for property image: ${cardDetails.image}`,
                error
              );
              return property;
            }
          }
          return property;
        })
      );

      const myProperty = propertiesWithUrls.filter(
        (property) => property.createdBy.id === user.id
      );
      const allProperty = propertiesWithUrls.filter(
        (property) => property.createdBy.id !== user.id
      );

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
        where: {
          companyId: user.companyId,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
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
        },
      });

      // Generate presigned URLs for property images
      const propertiesWithUrls = await Promise.all(
        properties.map(async (property) => {
          const cardDetails =
            property.cardDetails as unknown as PropertyCardDetails;
          if (cardDetails?.image) {
            try {
              const imageUrl = await generatePresignedDownloadUrl(
                cardDetails.image
              );
              return {
                ...property,
                cardDetails: {
                  ...cardDetails,
                  image: imageUrl,
                },
              };
            } catch (error) {
              console.error(
                `Failed to generate URL for property image: ${cardDetails.image}`,
                error
              );
              return property;
            }
          }
          return property;
        })
      );

      //seperate the properties based on their 'isVerified' field
      const verifiedProperties = propertiesWithUrls.filter(
        (property) => property.isVerified
      );
      const unverifiedProperties = propertiesWithUrls.filter(
        (property) => !property.isVerified
      );

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

      // take the image from the property object and generate a presigned URL
      //@ts-ignore
      if (property && (property?.features?.images || property.features.documents)) {
        try { //@ts-ignore
          const images = property.features?.images;
          if (images) {
            const imageUrls = await Promise.all(images.map(async (image: string) => {
              return await generatePresignedDownloadUrl(image);
            })); //@ts-ignore
            property.features.images = imageUrls;
          }//@ts-ignore
          const documents = property.features?.documents;
          if (documents) {
            const documentUrls = await Promise.all(documents.map(async (document: string) => {
              return await generatePresignedDownloadUrl(document);
            })); //@ts-ignore
            property.features.documents = documentUrls;
          }
        } catch (error) {
          console.error( 
            `Failed to generate URL for property image: `,
            error
          );
        }
      }

      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      return res.json(property);
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
        if (!req.user?.id || !req.user?.companyId) {
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
        if (!req.user?.id || !req.user?.companyId) {
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
      if (!isVerified && typeof isVerified !== "boolean") {
        return res.status(400).json({ message: "Invalid status" });
      }

      const property = await prisma.property.update({
        where: { id: req.params.id },
        data: { isVerified },
      });

      return res.json(property);
    } catch (error) {
      logger.error("Error in updatePropertyStatus:", error);
      return res
        .status(500)
        .json({ message: "Failed to update property status" });
    }
  },

  deleteProperty: async (req: Request, res: Response) => {
    try {
      if (!req.user?.id || !req.user?.companyId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;

      if (req.user.role === "AGENT" || req.user.role === "TEAM_LEADER") {
        const doesPropertyExist = await prisma.property.findUnique({
          where: { id },
        });
        if (!doesPropertyExist) {
          return res.status(404).json({ message: "Property not found" });
        }
        if (doesPropertyExist.createdById === req.user.id) {
          const property = await prisma.property.delete({
            where: { id: req.params.id },
          });
          return res.json({ message: "Property deleted successfully", property });
        } else {
          return res
            .status(403)
            .json({
              message: "You are not authorized to delete this property",
            });
        }
      } else if (req.user.role === "ADMIN") {
        const property = await prisma.property.delete({
          where: { id: req.params.id },
        });
        return res.json({ message: "Property deleted successfully", property });
      } else {
        return res.status(403).json({
          message: "You are not authorized to delete this property",
        });
      }
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
