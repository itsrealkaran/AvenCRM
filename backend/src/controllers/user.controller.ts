import { Request, Response } from "express";
import { Gender, UserRole } from "@prisma/client";
import db from "../db/index.js";
import bcrypt from "bcrypt";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { uploadFile } from "../utils/s3.js";

export const userController = {
  // User Management (SuperAdmin & Admin)
  async createUser(req: AuthenticatedRequest, res: Response) {
    const { name, email, agentRole, gender, teamId, phone, dob, commissionRate, commissionThreshhold, commissionAfterThreshhold } = req.body;
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
              commissionRate,
              commissionThreshhold,
              commissionAfterThreshhold,
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

        const user = await db.$transaction(async (tx) => {
          const user = await tx.user.create({
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
              commissionRate,
              commissionThreshhold,
              commissionAfterThreshhold,
            },
          });
          if (user.teamId) {
            await tx.team.update({
              where: {
                id: teamId,
              },
              data: {
                members: {
                  connect: {
                    id: user.id,
                  },
                },
              },
            });
          }
          return user;
        });

        res.status(201).json({
          message: "User created successfully",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            teamId: user.teamId,
          },
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Error creating user", error });
    }
  },

  async createBulkUser(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user || !user.companyId || user.role !== "ADMIN") {
        return res.status(401).json({ message: "Unauthorized: Missing user information or insufficient permissions" });
      }

      const usersData = req.body;
      if (!Array.isArray(usersData)) {
        return res.status(400).json({ message: "Invalid request: Data must be an array of users." });
      }

      // Validate each user in the array
      const validatedUsers = [];
      const errors = [];

      for (let i = 0; i < usersData.length; i++) {
        const userData = {
          ...usersData[i],
          companyId: user.companyId,
          role: "AGENT",
          password: bcrypt.hashSync("123456", 12)
        };

        try {
          // Basic validation
          if (!userData.name || !userData.email || !userData.phone) {
            errors.push({
              row: i + 1,
              error: "Missing required fields: name, email, or phone"
            });
            continue;
          }

          // Check if email already exists
          const existingUser = await db.user.findUnique({
            where: { email: userData.email }
          });

          if (existingUser) {
            errors.push({
              row: i + 1,
              error: "Email already exists"
            });
            continue;
          }

          validatedUsers.push(userData);
        } catch (error) {
          errors.push({
            row: i + 1,
            error: "Validation failed",
            details: error
          });
        }
      }

      // Create users individually and collect errors
      const createdUsers = [];
      for (let i = 0; i < validatedUsers.length; i++) {
        const userData = validatedUsers[i];
        try {
          const createdUser = await db.user.create({
            data: {
              name: userData.name,
              email: userData.email,
              password: userData.password,
              phone: userData.phone.toString(),
              dob: userData.dob ? new Date(userData.dob) : null,
              designation: userData.designation || null,
              role: "AGENT",
              companyId: userData.companyId,
            },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              designation: true,
              role: true,
              createdAt: true,
              updatedAt: true
            }
          });
          createdUsers.push(createdUser);
        } catch (error) {
          errors.push({
            row: i + 1,
            error: "Failed to create user",
            details: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }

      return res.status(201).json({
        message: `Successfully created ${createdUsers.length} users`,
        data: createdUsers,
        erroredData: errors.length > 0 ? errors : null
      });

    } catch (error) {
      console.error("Error in createBulkUser:", error);
      return res.status(500).json({ message: "Failed to create users" });
    }
  },

  async updateUser(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { name, email, agentRole, gender, teamId, phone, dob, commissionRate, commissionThreshhold, commissionAfterThreshhold } = req.body;
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

      if (agentRole === UserRole.TEAM_LEADER) {
        const teamName = name + Math.floor(Math.random() * 1000);

        await db.$transaction(async (tx) => {
          const user = await tx.user.update({
            where: { id },
            data: {
              name,
              email,
              gender,
              phone,
              dob: new Date(dob),
              commissionRate,
              commissionThreshhold,
              commissionAfterThreshhold,
              role: agentRole,
            },
          });

          await tx.team.create({
            data: {
              name: teamName,
              companyId: user.companyId!,
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

        const user = await db.$transaction(async (tx) => {
          const user = await tx.user.update({
            where: { id },
            data: {
              name,
              email,
              gender,
              phone,
              dob: new Date(dob),
              role: agentRole,
              teamId: teamId || null,
              commissionRate,
              commissionThreshhold,
              commissionAfterThreshhold,
            },
          });
          if (user.teamId) {
            await tx.team.update({
              where: {
                id: teamId,
              },
              data: {
                members: {
                  connect: {
                    id: user.id,
                  },
                },
              },
            });
          }
          return user;
        });

        res.status(201).json({
          message: "User created successfully",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            teamId: user.teamId,
          },
        });
      }
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
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          gender: true,
          designation: true,
          isActive: true,
          dob: true,
          commissionRate: true,
          commissionThreshhold: true,
          commissionAfterThreshhold: true,
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
          createdAt: true,
          updatedAt: true,
        },
      });

      const usersList = users.filter((user) => user.id !== authUser.id)

      res.json(usersList);
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

  async getAllAdmins(req: AuthenticatedRequest, res: Response) {
    const authUser = req.user;

    try {
      if (!authUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Permission check for SUPERADMIN
      if (authUser.role !== UserRole.SUPERADMIN) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const admins = await db.user.findMany({
        where: { role: UserRole.ADMIN },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json(admins);
    } catch (error) {
      res.status(500).json({ message: "Error fetching admins", error });
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
            status: "WON",
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
    const { name, email, gender, phone, dob, avatar, designation } = req.body;
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
          avatar,
          designation,
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

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
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

  async uploadAvatar(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Validate bucket name
      const bucketName = process.env.AWS_S3_BUCKET_NAME;
      if (!bucketName) {
        return res
          .status(500)
          .json({ error: "S3 bucket name is not configured" });
      }

      const imageName = `avatars/${userId}-${Date.now()}`;
      const file = await uploadFile(
        req.file.buffer,
        imageName,
        req.file.mimetype
      );

      // Update user's avatar URL in database
      const imageUrl = `https://${bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${imageName}`;

      const updatedUser = await db.user.update({
        where: { id: userId },
        data: { avatar: imageUrl },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          companyId: true,
        },
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      res.status(500).json({ error: "Avatar upload failed" });
    }
  },

  async getAvatar(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.params.userId;

      const user = await db.user.findUnique({
        where: { id: userId },
        select: { avatar: true },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!user.avatar) {
        return res.status(404).json({ error: "Avatar not found" });
      }

      res.status(200).json({ imageUrl: user.avatar });
    } catch (error) {
      console.error("Error fetching avatar:", error);
      res.status(500).json({ error: "Failed to fetch avatar" });
    }
  },
};
