import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import db from '../db/index.js';
import bcrypt from 'bcrypt';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    companyId?: string;
  };
}

export const userController = {
  // User Management (SuperAdmin & Admin)
  async createUser(req: Request, res: Response) {
    const { name, email, password, role, companyId, teamId, designation } = req.body;
    const authUser = (req as AuthenticatedRequest).user;

    try {
      // Validate permissions
      if (!authUser) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Only SUPERADMIN can create ADMIN, and only ADMIN can create TEAM_LEADER/AGENT
      if (
        (role === UserRole.ADMIN && authUser.role !== UserRole.SUPERADMIN) ||
        ([UserRole.TEAM_LEADER, UserRole.AGENT].includes(role) && authUser.role !== UserRole.ADMIN)
      ) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      
      const user = await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          companyId: role === UserRole.AGENT ? companyId : null,
          teamId,
          designation
        }
      });

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
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
    const { role, companyId, teamId } = req.query;
    const authUser = (req as AuthenticatedRequest).user;

    try {
      if (!authUser) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const whereClause: any = {};
      
      // Filter based on role permissions
      if (authUser.role === UserRole.ADMIN) {
        whereClause.companyId = authUser.companyId;
      } else if (authUser.role === UserRole.TEAM_LEADER) {
        whereClause.teamId = teamId;
      }

      // Additional filters
      if (role) whereClause.role = role;
      if (companyId && authUser.role === UserRole.SUPERADMIN) whereClause.companyId = companyId;

      const users = await db.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          designation: true,
          isActive: true,
          company: {
            select: {
              id: true,
              name: true
            }
          },
          team: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

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