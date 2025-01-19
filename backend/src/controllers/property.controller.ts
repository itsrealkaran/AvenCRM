import { Request, RequestHandler, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { PropertyStatus, UserRole } from '@prisma/client';
import { subMonths } from 'date-fns';
import { 
  createPropertySchema, 
  updatePropertySchema, 
  propertyFilterSchema,
  propertiesResponseSchema,
  propertyResponseSchema
} from '../schema/property.schema.js';
import logger from '../utils/logger.js';
import multer from 'multer';
import { uploadFile } from '../utils/s3.js';
import { v4 as uuidv4 } from 'uuid';

const upload = multer();

type Controller = {
  [key: string]: RequestHandler | RequestHandler[];
};

export const propertiesController: Controller = {
  getAllProperties: async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
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
        logger.error('Error in getAllProperties:', filterResult.error);
        return res.status(400).json({ errors: filterResult.error.flatten() });
      }

      const filters = filterResult.data;
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const skip = (page - 1) * limit;

      const startDate = filters.startDate ? new Date(filters.startDate) : subMonths(new Date(), 1);
      const endDate = filters.endDate ? new Date(filters.endDate) : new Date();

      const where: any = {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      };

      if (filters.createdById) where.createdById = filters.createdById;
      if (filters.status) where.status = filters.status;
      if (filters.propertyType) where.propertyType = filters.propertyType;
      if (filters.minPrice) where.price = { gte: filters.minPrice };
      if (filters.maxPrice) where.price = { ...where.price, lte: filters.maxPrice };
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
              email: true
            },
          },
        },
        skip,
        take: limit,
        orderBy: filters.sortBy ? {
          [filters.sortBy]: filters.sortOrder || 'desc'
        } : {
          createdAt: 'desc'
        }
      });

      const response = {
        data: properties,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };

      const validatedResponse = propertiesResponseSchema.parse(response);
      return res.json(validatedResponse);
    } catch (error) {
      logger.error('Error in getAllProperties:', error);
      return res.status(500).json({ message: 'Failed to fetch properties' });
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
              email: true
            }
          },
        }
      });

      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      const validatedResponse = propertyResponseSchema.parse(property);
      return res.json(validatedResponse);
    } catch (error) {
      logger.error('Error in getPropertyById:', error);
      return res.status(500).json({ message: 'Failed to fetch property' });
    }
  },

  createProperty: [
    upload.array('files', 10),
    async (req: Request, res: Response) => {
      try {
        const rawData = req.body.data;
        if (!rawData) {
          return res.status(400).json({ message: 'Invalid request: Missing data field.' });
        }

        const parsedData = JSON.parse(rawData);
        const validationResult = createPropertySchema.safeParse(parsedData);
        if (!validationResult.success) {
          logger.error('Validation error in createProperty:', validationResult.error);
          return res.status(400).json({ errors: validationResult.error.flatten() });
        }

        const propertyData = validationResult.data;
        const files = req.files as Express.Multer.File[];
        const imageUrls: string[] = [];

        // Upload files to S3 if present
        if (files && files.length > 0) {
          for (const file of files) {
            const fileName = `properties/${uuidv4()}-${file.originalname}`;
            const result = await uploadFile(file.buffer, fileName, file.mimetype);
            imageUrls.push(result.url);
          }
        }

        const property = await prisma.property.create({
          data: {
            ...propertyData,
            description: propertyData.description ?? '',
            createdById: req.user?.id ?? '',
            companyId: req.user?.companyId ?? '',
            price: propertyData.price ?? 0,
            sqft: propertyData.sqft ?? 0,
            images: imageUrls
          },
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            sqft: true,
            address: true,
            propertyType: true,
            status: true,
            bedrooms: true,
            location: true,
            amenities: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            createdById: true,
            companyId: true,
            createdAt: true,
            updatedAt: true,
            images: true,
          }
        });

        const validatedResponse = propertyResponseSchema.parse(property);
        return res.json(validatedResponse);
      } catch (error) {
        logger.error('Unexpected error in createProperty:', error);
        return res.status(500).json({ message: 'Failed to create property' });
      }
    },
  ],

  updateProperty: [
    upload.array('files', 10),
    async (req: Request, res: Response) => {
      try {
        const rawData = req.body.data;
        if (!rawData) {
          return res.status(400).json({ message: 'Invalid request: Missing data field.' });
        }

        const parsedData = JSON.parse(rawData);
        parsedData.id = req.params.id;

        const validationResult = updatePropertySchema.safeParse(parsedData);
        if (!validationResult.success) {
          return res.status(400).json({ errors: validationResult.error.flatten() });
        }
  
        const propertyData = validationResult.data;
        const files = req.files as Express.Multer.File[];
        let imageUrls: string[] = [];

        // Get existing property to preserve existing images
        const existingProperty = await prisma.property.findUnique({
          where: { id: req.params.id },
          select: { images: true }
        });

        // Keep existing images
        imageUrls = existingProperty?.images || [];

        // Upload new files to S3 if present
        if (files && files.length > 0) {
          for (const file of files) {
            const fileName = `properties/${uuidv4()}-${file.originalname}`;
            const result = await uploadFile(file.buffer, fileName, file.mimetype);
            imageUrls.push(result.url);
          }
        }

        const property = await prisma.property.update({
          where: { id: req.params.id },
          data: {
            ...propertyData,
            location: propertyData.location,
            price: propertyData.price,
            images: imageUrls
          },
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            sqft: true,
            address: true,
            propertyType: true,
            status: true,
            bedrooms: true,
            location: true,
            amenities: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            createdById: true,
            createdAt: true,
            updatedAt: true,
            companyId: true,
            images: true
          }
        });
  
        const validatedResponse = propertyResponseSchema.parse(property);
        return res.json(validatedResponse);
      } catch (error) {
        logger.error('Error in updateProperty:', error);
        return res.status(500).json({ message: 'Failed to update property' });
      }
    },
  ],

  updatePropertyStatus: async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
  
      // Validate the status
      if (!status || !Object.values(PropertyStatus).includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
  
      const property = await prisma.property.update({
        where: { id: req.params.id },
        data: { status },
      });
  
      const validatedResponse = propertyResponseSchema.parse(property);
      return res.json(validatedResponse);
    } catch (error) {
      logger.error("Error in updatePropertyStatus:", error);
      return res.status(500).json({ message: "Failed to update property status" });
    }
  },

  deleteProperty: async (req: Request, res: Response) => {
    try {
      const property = await prisma.property.delete({
        where: { id: req.params.id },
      });
      return res.json({ message: 'Property deleted successfully', property });
    } catch (error) {
      logger.error('Error in deleteProperty:', error);
      return res.status(500).json({ message: 'Failed to delete property' });
    }
  },

  deleteMultipleProperties: async (req: Request, res: Response) => {
    try {
      const { propertyIds } = req.body;
      if (!Array.isArray(propertyIds)) {
        return res.status(400).json({ message: 'propertyIds must be an array' });
      }

      const result = await prisma.property.deleteMany({
        where: {
          id: {
            in: propertyIds
          }
        }
      });
      return res.json({ message: 'Properties deleted successfully', count: result.count });
    } catch (error) {
      logger.error('Error in deleteMultipleProperties:', error);
      return res.status(500).json({ message: 'Failed to delete properties' });
    }
  },
};
