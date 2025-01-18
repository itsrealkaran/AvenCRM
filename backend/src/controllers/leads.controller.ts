import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { UserRole } from '@prisma/client';
import { subMonths } from 'date-fns';
import { 
  createLeadSchema, 
  updateLeadSchema, 
  leadFilterSchema, 
  convertToDealSchema,
  leadsResponseSchema,
  leadResponseSchema
} from '../schema/lead.schema.js';
import { InputJsonValue } from '@prisma/client/runtime/library';
import logger from '../utils/logger.js';

export const leadsController = {
  getAllLeads: async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const filterResult = leadFilterSchema.safeParse(req.query);
      if (!filterResult.success) {
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

      if (user.role === UserRole.ADMIN) {
        where.companyId = user.companyId;
      } else if (user.role === UserRole.AGENT) {
        where.agentId = user.id;
      }

      if (filters.createdById) where.agentId = filters.createdById;
      if (filters.status) where.status = filters.status;
      if (filters.source) where.source = filters.source;

      const total = await prisma.lead.count({ where });

      const leads = await prisma.lead.findMany({
        where,
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
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
        data: leads,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };

      const validatedResponse = leadsResponseSchema.parse(response);
      return res.json(validatedResponse);
    } catch (error) {
      logger.error('Error in getAllLeads:', error);
      return res.status(500).json({ message: 'Failed to fetch leads' });
    }
  },

  getLeadById: async (req: Request, res: Response) => {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: req.params.id },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      const validatedResponse = leadResponseSchema.parse(lead);
      return res.json(validatedResponse);
    } catch (error) {
      logger.error('Error in getLeadById:', error);
      return res.status(500).json({ message: 'Failed to fetch lead' });
    }
  },

  createLead: async (req: Request, res: Response) => {
    try {
      const validationResult = createLeadSchema.safeParse(req.body);
      if (!validationResult.success) {
        logger.error('Error in createLead:', validationResult.error);
        return res.status(400).json({ errors: validationResult.error.flatten() });
      }

      const leadData = validationResult.data;
      const lead = await prisma.lead.create({
        data: {
          ...leadData,
          agentId: req.user?.id ?? '',
          companyId: req.user?.companyId ?? '',
          notes: leadData.notes ? leadData.notes.filter(note => note !== null).map(note => ({ time: note.time, note: note.note })) as InputJsonValue[] | undefined : undefined,
        },
      });

      const validatedResponse = leadResponseSchema.parse(lead);
      return res.json(validatedResponse);
    } catch (error) {
      console.error('Error in createLead:', error);
      return res.status(500).json({ message: 'Failed to create lead' });
    }
  },

  updateLead: async (req: Request, res: Response) => {
    try {
      const validationResult = updateLeadSchema.safeParse({ ...req.body, id: req.params.id });
      if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.flatten() });
      }

      const leadData = validationResult.data;
      const lead = await prisma.lead.update({
        where: { id: req.params.id },
        data: {
          ...leadData,
          notes: leadData.notes ? leadData.notes.filter(note => note !== null).map(note => ({ time: note.time, note: note.note })) as InputJsonValue[] | undefined : undefined,
        },
      });

      const validatedResponse = leadResponseSchema.parse(lead);
      return res.json(validatedResponse);
    } catch (error) {
      console.error('Error in updateLead:', error);
      return res.status(500).json({ message: 'Failed to update lead' });
    }
  },

  deleteLead: async (req: Request, res: Response) => {
    try {
      const lead = await prisma.lead.delete({
        where: { id: req.params.id },
      });
      return res.json({ message: 'Lead deleted successfully', lead });
    } catch (error) {
      console.error('Error in deleteLead:', error);
      return res.status(500).json({ message: 'Failed to delete lead' });
    }
  },

  deleteMultipleLeads: async (req: Request, res: Response) => {
    try {
      const { leadIds } = req.body;
      if (!Array.isArray(leadIds)) {
        return res.status(400).json({ message: 'leadIds must be an array' });
      }

      const result = await prisma.lead.deleteMany({
        where: {
          id: {
            in: leadIds
          }
        }
      });
      return res.json({ message: 'Leads deleted successfully', count: result.count });
    } catch (error) {
      console.error('Error in deleteMultipleLeads:', error);
      return res.status(500).json({ message: 'Failed to delete leads' });
    }
  },

  convertToDeal: async (req: Request, res: Response) => {
    try {
      const validationResult = convertToDealSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.flatten() });
      }

      const { leadId, dealAmount, expectedCloseDate } = validationResult.data;

      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: {
          company: true,
          agent: true,
        },
      });

      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      const [deal, updatedLead] = await prisma.$transaction([
        prisma.deal.create({
          data: {
            name: lead.name,
            dealAmount,
            email: lead.email,
            expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : lead.expectedDate,
            notes: lead.notes ? lead.notes.filter(note => note !== null) : [],
            companyId: lead.companyId,
            agentId: lead.agentId,
            status: 'ACTIVE',
            phone: lead.phone,
            id: lead.id
          },
        }),
        prisma.lead.update({
          where: { id: leadId },
          data: {
            status: 'WON',
          },
        }),
      ]);

      return res.json({ deal, message: 'Lead successfully converted to deal' });
    } catch (error) {
      console.error('Error in convertToDeal:', error);
      return res.status(500).json({ 
        message: 'Failed to convert lead to deal',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
};