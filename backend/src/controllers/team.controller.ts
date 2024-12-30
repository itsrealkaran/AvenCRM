import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import db from '../db/index.js';
import bcrypt from 'bcrypt';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    companyId?: string;
    teamId?: string;
  };
}

export const teamController = {
  // User Management (SuperAdmin & Admin)
  async createUser(req: Request, res: Response) {
    const { name, email, agentRole, gender, teamLead, phone, dob } = req.body;
    const authUser = (req as AuthenticatedRequest).user;

    try {
      // Validate permissions
      if (!authUser) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const companyId = authUser.companyId

      if (!companyId) {
        return res.status(400).json({ message: 'Company ID is required' });
      }

      if(authUser.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'You are not assigned to any team' });
      }

      let team;
      if (teamLead) {
        team = await db.team.findFirst({ where: { name: teamLead } });
      }
      console.log(team);

      const hashedPassword = await bcrypt.hash('123456', 12);
      
      const user = await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          gender,
          phone,
          teamId: team?.id || null,
          dob: new Date(dob),
          role: agentRole,
          companyId,
        }
      });

      res.status(201).json({
        message: 'User created successfully',
        user
      });
    } catch (error) {
      res.status(500).json({ message: 'Error creating user', error });
    }
  },

  async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const { name, email, designation, isActive, teamId } = req.body;
    const authUser = (req as AuthenticatedRequest).user;

    try {
      const user = await db.user.findUnique({ where: { id } });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Permission checks
      if (!authUser || (
        authUser.role !== UserRole.SUPERADMIN &&
        authUser.role !== UserRole.ADMIN &&
        authUser.id !== id
      )) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      const updatedUser = await db.user.update({
        where: { id },
        data: {
          name,
          email,
          designation,
          isActive,
          teamId
        }
      });

      res.json({
        message: 'User updated successfully',
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ message: 'Error updating user', error });
    }
  },

  async getUsers(req: Request, res: Response) {
    const authUser = (req as AuthenticatedRequest).user;

    try {
      if (!authUser) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!authUser.teamId) {
        return res.status(403).json({ message: 'You are not assigned to any team' });
      }
      // Additional filters
      if (authUser.role !== UserRole.TEAM_LEADER) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

     const users = await db.team.findFirst({
      where: {
        id: authUser.teamId
      },
      include: {
        members: true
      }
     })

      res.json(users?.members);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error });
    }
  },

  async getTeams(req: Request, res: Response) {
    const authUser = (req as AuthenticatedRequest).user;

    try {
      if (!authUser) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Additional filters
      if (authUser.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

     const users = await db.team.findMany({})

      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error });
    }
  },

  async getUserById(req: Request, res: Response) {
    const { id } = req.params;
    const authUser = (req as AuthenticatedRequest).user;

    try {
      if (!authUser) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await db.user.findUnique({
        where: { id },
        include: {
          company: true,
          team: true,
          leads: true,
          deals: true
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Permission check
      if (
        authUser.role !== UserRole.SUPERADMIN &&
        authUser.companyId !== user.companyId &&
        authUser.id !== id
      ) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user', error });
    }
  },

  async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    const authUser = (req as AuthenticatedRequest).user;

    try {
      const user = await db.user.findUnique({ where: { id } });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Permission checks
      if (
        !authUser ||
        (authUser.role !== UserRole.SUPERADMIN && authUser.role !== UserRole.ADMIN)
      ) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      // Instead of deleting, deactivate the user
      await db.user.update({
        where: { id },
        data: { isActive: false }
      });

      res.json({ message: 'User deactivated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deactivating user', error });
    }
  },

  // Team Management (Admin & Team Leader)
  async assignTeam(req: Request, res: Response) {
    const { userId, teamId } = req.body;
    const authUser = (req as AuthenticatedRequest).user;

    try {
      if (!authUser || (authUser.role !== UserRole.ADMIN && authUser.role !== UserRole.TEAM_LEADER)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      const user = await db.user.update({
        where: { id: userId },
        data: { teamId }
      });

      res.json({
        message: 'Team assigned successfully',
        user
      });
    } catch (error) {
      res.status(500).json({ message: 'Error assigning team', error });
    }
  },

  // Performance Metrics
  async getUserMetrics(req: Request, res: Response) {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const authUser = (req as AuthenticatedRequest).user;

    try {
      if (!authUser) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const metrics = await db.$transaction([
        // Get lead count
        db.lead.count({
          where: {
            id: id,
            createdAt: {
              gte: startDate ? new Date(startDate as string) : undefined,
              lte: endDate ? new Date(endDate as string) : undefined
            }
          }
        }),
        // Get deal count
        db.deal.count({
          where: {
            id: id,
            createdAt: {
              gte: startDate ? new Date(startDate as string) : undefined,
              lte: endDate ? new Date(endDate as string) : undefined
            }
          }
        }),
        // Get closed deals value
        db.deal.aggregate({
          where: {
            id: id,
            status: 'CLOSED_WON',
            createdAt: {
              gte: startDate ? new Date(startDate as string) : undefined,
              lte: endDate ? new Date(endDate as string) : undefined
            }
          },
          _sum: {
            dealAmount: true
          }
        })
      ]);

      res.json({
        leadCount: metrics[0],
        dealCount: metrics[1],
        closedDealsValue: metrics[2]._sum.dealAmount ?? 0
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user metrics', error });
    }
  }
};