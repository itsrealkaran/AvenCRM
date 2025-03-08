import { Request, RequestHandler, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { UserRole } from "@prisma/client";
import { subMonths } from "date-fns";
import {
  createDealSchema,
  updateDealSchema,
  dealFilterSchema,
  dealsResponseSchema,
  dealResponseSchema,
} from "../schema/deal.schema.js";
import { InputJsonValue } from "@prisma/client/runtime/library";
import logger from "../utils/logger.js";
import multer from "multer";
import { z } from "zod";
import { DealStatus } from "@prisma/client";
import { generatePresignedDownloadUrl } from '../utils/s3.js'; // Use your existing S3 utility

const upload = multer();

type Controller = {
  [key: string]: RequestHandler | RequestHandler[];
};

export const dealsController: Controller = {
  getAllDeals: async (req: Request, res: Response) => {
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

      const filterResult = dealFilterSchema.safeParse(query);
      if (!filterResult.success) {
        logger.error("Error in getAllDeals:", filterResult.error);
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

      if (user.role === UserRole.ADMIN) {
        where.companyId = user.companyId;
      } else if (user.role === UserRole.AGENT) {
        where.agentId = user.id;
      }

      if (filters.createdById) where.agentId = filters.createdById;
      if (filters.status) where.status = filters.status;
      if (filters.propertyType) where.propertyType = filters.propertyType;
      if (filters.minAmount) where.dealAmount = { gte: filters.minAmount };
      if (filters.maxAmount) where.dealAmount = { lte: filters.maxAmount };
      if (filters.commissionRate)
        where.commissionRate = { gte: filters.commissionRate };

      const total = await prisma.deal.count({ where });

      const deals = await prisma.deal.findMany({
        where,
        include: {
          agent: {
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

      // Generate presigned URLs for documents
      const dealsWithPresignedUrls = await Promise.all(
        deals.map(async (deal) => {
          let documentUrls: any[] = [];
          
          try {
            // Ensure documents is parsed if it's a string
            const documents = typeof deal.documents === 'string' 
              ? JSON.parse(deal.documents) 
              : deal.documents;

            if (Array.isArray(documents)) {
              documentUrls = await Promise.all(
                documents.map(async (doc) => {
                  try {
                    const url = await generatePresignedDownloadUrl(doc.file, 3600);
                    return {
                      name: doc.name,
                      file: doc.file,
                      url
                    };
                  } catch (error) {
                    console.error(`Error generating presigned URL for document ${doc.file}:`, error);
                    return null;
                  }
                })
              );
              // Filter out any null values (failed URLs)
              documentUrls = documentUrls.filter(Boolean);
            }
          } catch (error) {
            console.error("Error processing documents:", error);
          }

          // Create a new object with all deal properties and documents
          const dealWithDocs = {
            ...deal,
            documents: documentUrls || [] // Ensure documents is always an array
          };

          return dealWithDocs;
        })
      );

      const response = {
        data: dealsWithPresignedUrls,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };

      return res.json(response);
    } catch (error) {
      logger.error("Error in getAllDeals:", error);
      return res.status(500).json({ message: "Failed to fetch deals" });
    }
  },

  getAllWonDeals: async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      let deals: any[] = [];
      if (user.role === UserRole.ADMIN) {
        deals = await prisma.deal.findMany({
          where: {
            status: DealStatus.WON,
            companyId: user.companyId,
          },
          select: {
            id: true,
            name: true,
            dealAmount: true,
          },
        });
      } else if (user.role === UserRole.AGENT || user.role === UserRole.TEAM_LEADER) {
        deals = await prisma.deal.findMany({
        where: {
          status: DealStatus.WON,
          companyId: user.companyId,
          agentId: user.id,
        },
        select: {
          id: true,
          name: true,
          dealAmount: true,
          },
        });
      }

      return res.json(deals);
    } catch (error) {
      logger.error("Error in getAllWonDeals:", error);
      return res.status(500).json({ message: "Failed to fetch won deals" });
    }
  },

  getDealById: async (req: Request, res: Response) => {
    try {
      const deal = await prisma.deal.findUnique({
        where: { id: req.params.id },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }

      const validatedResponse = dealResponseSchema.parse(deal);
      return res.json(validatedResponse);
    } catch (error) {
      logger.error("Error in getDealById:", error);
      return res.status(500).json({ message: "Failed to fetch deal" });
    }
  },

  createDeal: [
    // Use multer middleware to parse `multipart/form-data`
    upload.none(),
    async (req: Request, res: Response) => {
      try {
        const rawData = req.body.data;
        if (!rawData) {
          return res
            .status(400)
            .json({ message: "Invalid request: Missing data field." });
        }

        const parsedData = JSON.parse(rawData);
        console.log(parsedData, 'parsedData');

        if (typeof parsedData.expectedCloseDate === "string") {
          parsedData.expectedCloseDate = new Date(parsedData.expectedCloseDate);
        }

        if (typeof parsedData.actualCloseDate === "string") {
          parsedData.actualCloseDate = new Date(parsedData.actualCloseDate);
        }

        // Validate the parsed data using Zod
        const validationResult = createDealSchema.safeParse(parsedData);

        if (!validationResult.success) {
          console.log('Validation failed:', validationResult.error);
          logger.error(
            "Validation error in createDeal:",
            validationResult.error
          );
          return res
            .status(400)
            .json({ errors: validationResult.error.flatten() });
        }

        const dealData = validationResult.data;
        console.log(dealData, 'dealData');
        // Save the validated deal data to the database
        const deal = await prisma.deal.create({
          data: {
            ...dealData,
            role: dealData.role, // Explicitly set role
            agentId: req.user?.id ?? "",
            companyId: req.user?.companyId ?? "",
            notes:  dealData.notes
              ? (dealData.notes
                  .filter((note) => note !== null)
                  .map((note) => ({ time: note.time, note: note.note })) as
                  | InputJsonValue[]
                  | undefined)
              : undefined,
            coOwners: dealData.coOwners
              ? (dealData.coOwners
                  .filter((coOwner) => coOwner !== null)
                  .map((coOwner) => ({
                    name: coOwner.name,
                    email: coOwner.email,
                    phone: coOwner.phone,
                  })) as InputJsonValue[] | undefined)
              : undefined,
            documents: dealData.documents || []
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            dealAmount: true,
            status: true,
            propertyType: true,
            propertyAddress: true,
            propertyValue: true,
            expectedCloseDate: true,
            actualCloseDate: true,
            commissionRate: true,
            estimatedCommission: true,
            agent: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            agentId: true,
            companyId: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        // Validate the response before sending it back
        const validatedResponse = dealResponseSchema.parse(deal);
        return res.json(validatedResponse);
      } catch (error) {
        logger.error("Unexpected error in createDeal:", error);
        return res.status(500).json({ message: "Failed to create deal" });
      }
    },
  ],

  updateDeal: [
    upload.none(),
    async (req: Request, res: Response) => {
      try {
        const user = req.user;
        if (!user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        const rawData = req.body.data;
        if (!rawData) {
          return res
            .status(400)
            .json({ message: "Invalid request: Missing data field." });
        }

        const parsedData = JSON.parse(rawData);
        if (typeof parsedData.expectedCloseDate === "string") {
          parsedData.expectedCloseDate = new Date(parsedData.expectedCloseDate);
        }

        if (typeof parsedData.actualCloseDate === "string") {
          parsedData.actualCloseDate = new Date(parsedData.actualCloseDate);
        }

        const validationResult = updateDealSchema.safeParse(parsedData);
        if (!validationResult.success) {
          logger.error(
            "Validation error in updateDeal:",
            validationResult.error
          );
          return res
            .status(400)
            .json({ errors: validationResult.error.flatten() });
        }

        const notesAuthor = user.role === 'ADMIN' ? 'Admin' : user.role === 'TEAM_LEADER' ? 'Team Leader' : 'Me'

        const dealData = validationResult.data;

        const deal = await prisma.deal.update({
          where: { id: req.params.id },
          data: {
            ...dealData,
            notes: dealData.notes
              ? (dealData.notes
                  .filter((note) => note !== null)
                  .map((note) => ({ time: note.time, note: note.note, author: notesAuthor })) as
                  | InputJsonValue[]
                  | undefined)
              : undefined,
            coOwners: dealData.coOwners
              ? (dealData.coOwners
                  .filter((coOwner) => coOwner !== null)
                  .map((coOwner) => ({
                    name: coOwner.name,
                    email: coOwner.email,
                    phone: coOwner.phone,
                  })) as InputJsonValue[] | undefined)
              : undefined,
            documents: dealData.documents || []
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            dealAmount: true,
            status: true,
            notes: true,
            propertyType: true,
            propertyAddress: true,
            propertyValue: true,
            expectedCloseDate: true,
            actualCloseDate: true,
            commissionRate: true,
            estimatedCommission: true,
            agent: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            agentId: true,
            companyId: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        const validatedResponse = dealResponseSchema.parse(deal);
        return res.json(validatedResponse);
      } catch (error) {
        console.error("Error in updateDeal:", error);
        return res.status(500).json({ message: "Failed to update deal" });
      }
    },
  ],

  updateDealStatus: async (req: Request, res: Response) => {
    try {
      const { status } = req.body;

      // Validate the status
      if (!status || !Object.values(DealStatus).includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const deal = await prisma.deal.update({
        where: { id: req.params.id },
        data: { status },
      });

      const validatedResponse = dealResponseSchema.parse(deal);
      return res.json(validatedResponse);
    } catch (error) {
      console.error("Error in updateDealStatus:", error);
      return res.status(500).json({ message: "Failed to update deal status" });
    }
  },

  updateNotes: async (req: Request, res: Response) => {
    try {
      const { note } = req.body;
      const { id } = req.params;
  
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const notesAuthor = user.role === 'ADMIN' ? 'Admin' : user.role === 'TEAM_LEADER' ? 'Team Leader' : 'Me'

      //note is a array of objects append author to the last object
      note[note.length - 1].author = notesAuthor;
      
      let deal: any;
      if (user.role === UserRole.ADMIN) {
        deal = await prisma.deal.update({
          where: { id },
          data: { notes: note },
        });
      } else {
        deal = await prisma.deal.update({
          where: { id, agentId: user.id },
          data: { notes: note },
        });
      }

      return res.json(deal);
    } catch (error) {
      console.error('Error in updateNotes:', error);
      return res.status(500).json({ message: 'Failed to update notes' });
    }
  },

  deleteDeal: async (req: Request, res: Response) => {
    try {
      const deal = await prisma.deal.delete({
        where: { id: req.params.id },
      });
      return res.json({ message: "Deal deleted successfully", deal });
    } catch (error) {
      console.error("Error in deleteDeal:", error);
      return res.status(500).json({ message: "Failed to delete deal" });
    }
  },

  deleteMultipleDeals: async (req: Request, res: Response) => {
    try {
      const { dealIds } = req.body;
      if (!Array.isArray(dealIds)) {
        return res.status(400).json({ message: "dealIds must be an array" });
      }

      const result = await prisma.deal.deleteMany({
        where: {
          id: {
            in: dealIds,
          },
        },
      });
      return res.json({
        message: "Deals deleted successfully",
        count: result.count,
      });
    } catch (error) {
      console.error("Error in deleteMultipleDeals:", error);
      return res.status(500).json({ message: "Failed to delete deals" });
    }
  },
};
