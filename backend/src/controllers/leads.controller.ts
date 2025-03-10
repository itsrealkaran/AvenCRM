import { Request, RequestHandler, Response } from 'express';
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
import multer from 'multer';
import { LeadStatus } from '@prisma/client';
import { notificationService } from '../services/redis.js';

const upload = multer();

type Controller = {
  [key: string]: RequestHandler | RequestHandler[];
};

export const leadsController: Controller  = {
  getAllLeads: async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const where: any = {}
      if (user.role === UserRole.ADMIN) {
        where.companyId = user.companyId;
      } else if (user.role === UserRole.AGENT) {
        where.agentId = user.id;
      } else if (user.role === UserRole.TEAM_LEADER) {
        // Get all team members' IDs
        const teamMembers = await prisma.user.findMany({
          where: {
            teamId: user.teamId,
            companyId: user.companyId
          },
          select: {
            id: true
          }
        });
        
        const teamMemberIds = teamMembers.map(member => member.id);
        where.agentId = {
          in: teamMemberIds
        };
        where.companyId = user.companyId;
      }

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
      });

      const response = {
        data: leads,
        meta: {
          total,
        }
      };

      return res.json(response);
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

  createLead: [
    // Use multer middleware to parse `multipart/form-data`
    upload.none(),
    async (req: Request, res: Response) => {
      try {
        const user = req.user;
        if (!user || !user.companyId) {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        // Parse the JSON string from the `FormData` key "data"
        const rawData = req.body.data;
        if (!rawData) {
          return res.status(400).json({ message: 'Invalid request: Missing data field.' });
        }

        const parsedData = JSON.parse(rawData);

        // Validate the parsed data using Zod
        const validationResult = createLeadSchema.safeParse(parsedData);
        if (!validationResult.success) {
          logger.error('Validation error in createLead:', validationResult.error);
          return res.status(400).json({ errors: validationResult.error.flatten() });
        }

        const leadData = validationResult.data;

        const notesAuthor = user.role === 'ADMIN' ? 'Admin' : user.role === 'TEAM_LEADER' ? 'Team Leader' : 'Agent'

        // Save the validated lead data to the database
        const lead = await prisma.lead.create({
          data: {
            ...leadData,
            agentId: user.role === UserRole.ADMIN ? null : user.id,
            companyId: user.companyId,
            notes: leadData.notes
              ? leadData.notes
                  .filter((note) => note !== null)
                  .map((note) => ({ time: note.time, note: note.note, author: notesAuthor })) as InputJsonValue[] | undefined
              : undefined,
          },

          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            source: true,
            status: true,
            propertyType: true,
            budget: true,
            location: true,
            lastContactDate: true,
            expectedDate: true,
            agent: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            agentId: true,
            companyId: true,
            createdAt: true,
            updatedAt: true
          }
        });

        // Validate the response before sending it back
        const validatedResponse = leadResponseSchema.parse(lead);
        return res.json(validatedResponse);
      } catch (error) {
        logger.error('Unexpected error in createLead:', error);
        return res.status(500).json({ message: 'Failed to create lead' });
      }
    },
  ],

  createManyLeads: [
    upload.none(),
    async (req: Request, res: Response) => {
      try {
        const user = req.user;
        if (!user || !user.id || !user.companyId) {
          return res.status(401).json({ message: 'Unauthorized: Missing user information' });
        }

        const leadsData = req.body;
        if (!Array.isArray(leadsData)) {
          return res.status(400).json({ message: 'Invalid request: Data must be an array of leads.' });
        }

        // Validate each lead in the array
        const validatedLeads = [];
        const errors = [];
        const erroredData = [];

        for (let i = 0; i < leadsData.length; i++) {
          const leadData = {
            ...leadsData[i],
            // Convert numeric fields
            budget: leadsData[i].budget ? Number(leadsData[i].budget) : null,
            leadAmount: leadsData[i].leadAmount ? Number(leadsData[i].leadAmount) : null,
            phone: leadsData[i].phone ? String(leadsData[i].phone) : null,
            // Ensure required fields
            agentId: user.id,
            companyId: user.companyId,
          };

          const validationResult = createLeadSchema.safeParse(leadData);

          const notesAuthor = user.role === 'ADMIN' ? 'Admin' : user.role === 'TEAM_LEADER' ? 'Team Leader' : 'Agent'

          if (validationResult.success) {
            validatedLeads.push({
              ...validationResult.data,
              phone: validationResult.data.phone ? String(validationResult.data.phone) : null,
              notes: validationResult.data.notes
                ? validationResult.data.notes
                    .filter((note: any) => note !== null)
                    .map((note: any) => ({ time: note.time, note: note.note, author: notesAuthor })) as InputJsonValue[]
                : [],
              // Ensure required fields
              agentId: user.role === UserRole.ADMIN ? null : user.id,
              companyId: user.companyId,
              // Set default values
              status: validationResult.data.status || 'NEW',
              source: validationResult.data.source || 'IMPORT',
              propertyType: validationResult.data.propertyType || 'COMMERCIAL'
            });
          } else {
            errors.push(validationResult.error);
            erroredData.push(leadsData[i]);
          }
        }
        
        // Create all leads in a transaction
        const createdLeads = await prisma.$transaction(
          validatedLeads.map(leadData => 
            prisma.lead.create({
              data: leadData,
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                source: true,
                status: true,
                propertyType: true,
                budget: true,
                leadAmount: true,
                location: true,
                lastContactDate: true,
                expectedDate: true,
                agent: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                },
                agentId: true,
                companyId: true,
                createdAt: true,
                updatedAt: true
              }
            })
          )
        );
        
        return res.status(201).json({
          message: `Successfully created ${createdLeads.length} leads`,
          errors,
          erroredData
        });

      } catch (error) {
        logger.error('Error in createManyLeads:', error);
        return res.status(500).json({ message: 'Failed to create leads' });
      }
    }
  ],

  updateLead: [
    upload.none(),
    async (req: Request, res: Response) => {
      try {
        const validationResult = updateLeadSchema.safeParse(JSON.parse(req.body.data));
        if (!validationResult.success) {
          return res.status(400).json({ errors: validationResult.error.flatten() });
        }
        
        const user = req.user;
        if (!user) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
  
        const leadData = validationResult.data;
        const notesAuthor = user.role === 'ADMIN' ? 'Admin' : user.role === 'TEAM_LEADER' ? 'Team Leader' : 'Agent'
        
        const lead = await prisma.lead.update({
          where: { id: req.params.id },
          data: {
            ...leadData,
            notes: leadData.notes ? leadData.notes.filter(note => note !== null).map(note => ({ time: note.time, note: note.note, author: notesAuthor })) as InputJsonValue[] | undefined : undefined,
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            source: true,
            status: true,
            propertyType: true,
            budget: true,
            location: true,
            lastContactDate: true,
            expectedDate: true,
            agent: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            agentId: true,
            companyId: true,
            createdAt: true,
            updatedAt: true
          }
        });
  
        const validatedResponse = leadResponseSchema.parse(lead);
        return res.json(validatedResponse);
      } catch (error) {
        console.error('Error in updateLead:', error);
        return res.status(500).json({ message: 'Failed to update lead' });
      }
    },
  ],

  updateLeadStatus: async (req: Request, res: Response) => {
    try {
      const { status } = req.body;

      console.log(status);
  
      // Validate the status
      if (!status || !Object.values(LeadStatus).includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const checkLead = await prisma.lead.findUnique({
        where: { id: req.params.id },
      });

      if (!checkLead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      if (checkLead.status === LeadStatus.WON) {
        return res.status(400).json({ message: "Cannot change the status of a won lead" });
      }
  
      const lead = await prisma.lead.update({
        where: { id: req.params.id },
        data: { status },
      });
  
      return res.json(lead);
    } catch (error) {
      console.error("Error in updateLeadStatus:", error);
      return res.status(500).json({ message: "Failed to update lead status" });
    }
  },

  updateNotes: async (req: Request, res: Response) => {
    try {
      const { note } = req.body;
      const { id } = req.params;

      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const notesAuthor = user.role === 'ADMIN' ? 'Admin' : user.role === 'TEAM_LEADER' ? 'Team Leader' : 'Agent'
      note[note.length - 1].author = notesAuthor;

      let lead;
      if (user.role === UserRole.ADMIN) {
        lead = await prisma.lead.update({
          where: { id },
          data: { notes: note },
        });
      } else if (user.role === UserRole.TEAM_LEADER) {
        const teamMembers = await prisma.user.findMany({
          where: {
            teamId: user.teamId,
            companyId: user.companyId
          },
        });
        if (!teamMembers) {
          return res.status(404).json({ message: 'Team members not found' });
        }
        
        lead = await prisma.lead.update({
          where: { id, agentId: { in: teamMembers.map(member => member.id) } },
          data: { notes: note },
        });
      } else {
        lead = await prisma.lead.update({
          where: { id, agentId: user.id },
          data: { notes: note },
        });
      }
  

      return res.json(lead);
    } catch (error) {
      console.error('Error in updateNotes:', error);
      return res.status(500).json({ message: 'Failed to update notes' });
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
            agentId: lead.agentId || "",
            status: 'NEW',
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
  },

  updateLeadAgent: async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.params;
      const { agentId } = req.body;

      const lead = await prisma.lead.findFirst({
        where: {
          id,
          companyId: user.companyId,
        },
      });

      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      const updatedLead = await prisma.lead.update({
        where: { id },
        data: { agentId },
        include: {
          agent: true,
        },
      });

      if (!updatedLead.agent) {
        return res.status(404).json({ message: 'Agent not found' });
      }

      console.log(updatedLead.agent);

      try {
        const link = updatedLead.agent.role === "TEAM_LEADER"
        ? "/teamleader/leads"
        : updatedLead.agent.role === "AGENT"
        ? "/agent/leads"
        : "";

        await notificationService.createNotification(agentId, {
          title: "New Lead Assigned",
          message: `${updatedLead.name} is assigned to you`,
          type: "lead",
          link,
        });
      } catch (error) {
        logger.error('Error in updateLeadAgent:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      const result = leadResponseSchema.safeParse(updatedLead);
      if (!result.success) {
        logger.error('Error in updateLeadAgent:', result.error);
        return res.status(500).json({ message: 'Failed to validate updated lead' });
      }

      return res.json(result.data);
    } catch (error) {
      logger.error('Error in updateLeadAgent:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  bulkAssignLeads: async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { leadIds, agentId } = req.body;

      if (!Array.isArray(leadIds) || !agentId) {
        return res.status(400).json({ 
          message: 'Invalid request: leadIds must be an array and agentId is required' 
        });
      }

      // Verify the agent belongs to the same company
      const agent = await prisma.user.findFirst({
        where: {
          id: agentId,
          companyId: user.companyId,
        },
      });

      if (!agent) {
        return res.status(404).json({ message: 'Agent not found' });
      }

      // Update all leads in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // First verify all leads belong to the company
        const leads = await tx.lead.findMany({
          where: {
            id: { in: leadIds },
            companyId: user.companyId,
          },
        });

        if (leads.length !== leadIds.length) {
          throw new Error('Some leads were not found or do not belong to your company');
        }

        // Perform the bulk update
        return await tx.lead.updateMany({
          where: {
            id: { in: leadIds },
            companyId: user.companyId,
          },
          data: {
            agentId,
          },
        });
      });

      return res.json({ 
        message: `Successfully assigned ${result.count} leads to agent`,
        count: result.count 
      });
    } catch (error) {
      logger.error('Error in bulkAssignLeads:', error);
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Failed to assign leads' });
    }
  },
};