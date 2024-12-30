import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import db from "../db/index.js";
import bcrypt from "bcrypt";
import { AuthenticatedRequest } from '../middleware/auth.js';

export const userController = {
  // User Management (SuperAdmin & Admin)
  async createUser(req: AuthenticatedRequest, res: Response) {
    const { name, email, agentRole, gender, teamId, phone, dob } = req.body;
    const authUser = req.user;

    try {
      // Validate permissions
      if (!authUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const companyId = authUser.companyId;

      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }

      // Only SUPERADMIN can create ADMIN, and only ADMIN can create TEAM_LEADER/AGENT
      if (
        (agentRole === UserRole.ADMIN &&
          authUser.role !== UserRole.SUPERADMIN) ||
        ([UserRole.TEAM_LEADER, UserRole.AGENT].includes(agentRole) &&
          authUser.role !== UserRole.ADMIN)
      ) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const teamId = authUser.teamId;

      if (agentRole === UserRole.TEAM_LEADER) {
        const teamName = name + Math.floor(Math.random() * 1000);

        await db.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              name,
              email,
              password: await bcrypt.hash("123456", 12),
              gender,
              phone,
              dob: new Date(dob),
              role: agentRole,
              companyId,
            },
          });

          await tx.team.create({
            data: {
              name: teamName,
              companyId: companyId,
              teamLeaderId: user.id,
              members: {
                connect: {
                  id: user.id,
                },
              },
            },
          });

          return user;
        });

        return res
          .status(201)
          .json({ message: "Team Leader created successfully" });
      } else {
        const hashedPassword = await bcrypt.hash("123456", 12);

        const user = await db.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            gender,
            phone,
            dob: new Date(dob),
            role: agentRole,
            teamId: teamId || null,
            companyId,
          },
        });

        res.status(201).json({
          message: "User created successfully",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Error creating user", error });
    }
  },

  async updateUser(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { name, email, designation, isActive, teamId } = req.body;
    const authUser = req.user;

    try {
      const user = await db.user.findUnique({ where: { id } });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Permission checks
      if (
        !authUser ||
        (authUser.role !== UserRole.SUPERADMIN &&
          authUser.role !== UserRole.ADMIN &&
          authUser.id !== id)
      ) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const updatedUser = await db.user.update({
        where: { id },
        data: {
          name,
          email,
          designation,
          isActive,
          teamId,
        },
      });

      res.json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating user", error });
    }
  },

  async getUsers(req: AuthenticatedRequest, res: Response) {
    const { role, companyId, teamId } = req.query;
    const authUser = req.user;

    try {
      if (!authUser) {
        return res.status(401).json({ message: "Unauthorized" });
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
      if (companyId && authUser.role === UserRole.SUPERADMIN)
        whereClause.companyId = companyId;

      const users = await db.user.findMany({
        where:
          authUser.role === UserRole.ADMIN
            ? {
                role: {
                  in: [UserRole.AGENT, UserRole.TEAM_LEADER],
                },
              }
            : whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          designation: true,
          isActive: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users", error });
    }
  },

  async getUserById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const authUser = req.user;

    try {
      if (!authUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await db.user.findUnique({
        where: { id },
        include: {
          company: true,
          team: true,
          leads: true,
          deals: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Permission check
      if (
        authUser.role !== UserRole.SUPERADMIN &&
        authUser.companyId !== user.companyId &&
        authUser.id !== id
      ) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user", error });
    }
  },

  async deleteUser(req: AuthenticatedRequest, res: Response) {
    const { ids } = req.query;
    const authUser = req.user;

    try {
      // Permission checks
      if (
        !authUser ||
        (authUser.role !== UserRole.SUPERADMIN &&
          authUser.role !== UserRole.ADMIN)
      ) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      if (!ids || typeof ids !== "string") {
        return res.status(400).json({ message: "User IDs are required" });
      }

      const userIds = ids.split(",");

      // Verify all users exist and can be deleted
      const users = await db.user.deleteMany({
        where: {
          id: { in: userIds },
          companyId: authUser.companyId, // Ensure users belong to same company
        },
      });

      res.json({ message: "Users deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deactivating users", error });
    }
  },

  // Team Management (Admin & Team Leader)
  async assignTeam(req: AuthenticatedRequest, res: Response) {
    const { userId, teamId } = req.body;
    const authUser = req.user;

    try {
      if (
        !authUser ||
        (authUser.role !== UserRole.ADMIN &&
          authUser.role !== UserRole.TEAM_LEADER)
      ) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const user = await db.user.update({
        where: { id: userId },
        data: { teamId },
      });

      res.json({
        message: "Team assigned successfully",
        user,
      });
    } catch (error) {
      res.status(500).json({ message: "Error assigning team", error });
    }
  },

  // Performance Metrics
  async getUserMetrics(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const authUser = req.user;

    try {
      if (!authUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const metrics = await db.$transaction([
        // Get lead count
        db.lead.count({
          where: {
            id: id,
            createdAt: {
              gte: startDate ? new Date(startDate as string) : undefined,
              lte: endDate ? new Date(endDate as string) : undefined,
            },
          },
        }),
        // Get deal count
        db.deal.count({
          where: {
            id: id,
            createdAt: {
              gte: startDate ? new Date(startDate as string) : undefined,
              lte: endDate ? new Date(endDate as string) : undefined,
            },
          },
        }),
        // Get closed deals value
        db.deal.aggregate({
          where: {
            id: id,
            status: "CLOSED_WON",
            createdAt: {
              gte: startDate ? new Date(startDate as string) : undefined,
              lte: endDate ? new Date(endDate as string) : undefined,
            },
          },
          _sum: {
            dealAmount: true,
          },
        }),
      ]);

      res.json({
        leadCount: metrics[0],
        dealCount: metrics[1],
        closedDealsValue: metrics[2]._sum.dealAmount ?? 0,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching user metrics", error });
    }
  },

  async updateProfile(req: AuthenticatedRequest, res: Response) {
    const { name, email, gender, phone, dob } = req.body;
    const authUser = req.user;

    try {
      if (!authUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await db.user.update({
        where: { id: authUser.id },
        data: {
          name,
          email,
          gender,
          phone,
          dob: dob ? new Date(dob) : undefined,
        },
      });

      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating profile" });
    }
  },

  async changePassword(req: AuthenticatedRequest, res: Response) {
    const { currentPassword, newPassword } = req.body;
    const authUser = req.user;

    try {
      if (!authUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await db.user.findUnique({ where: { id: authUser.id } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await db.user.update({
        where: { id: authUser.id },
        data: { password: hashedPassword },
      });

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error changing password" });
    }
  },

  async getProfile(req: AuthenticatedRequest, res: Response) {
    const authUser = req.user;

    try {
      if (!authUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await db.user.findUnique({
        where: { id: authUser.id },
        select: {
          id: true,
          name: true,
          email: true,
          gender: true,
          phone: true,
          dob: true,
          role: true,
          teamId: true,
          companyId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching profile" });
    }
  },
};
