// src/controllers/superadmin/company.controller.ts
import { Request, Response } from "express";
import { BaseController } from "./base.controllers.js";
import db from "../db/index.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { verifyAdmin } from "../lib/verifyUser.js";
import { prisma } from '../lib/prisma.js';

export class AdminAgentController extends BaseController {
  async createAgent(req: Request, res: Response) {
    return this.handleRequest(req, res, async () => {
      const { name, dob, gender, phoneNo, email, role } = req.body;
      if (!req.user) {
        return res.status(400).json({ message: "bad auth" });
      } else {
        //@ts-ignore
        const adminId = req.user.id;
        try {
          const company = await db.company.findFirst({
            where: {
              adminId,
            },
          });
          if (!company) {
            return res.status(404).json({ message: "heckerrrrr" });
          } else {
            const agent = await db.user.create({
              data: {
                name,
                email,
                password: "testpassword",
                phone: phoneNo,
                dob,
                gender,
                role,
                companyId: company.id,
              },
            });

            return res.status(201).send(agent);
          }
        } catch (err) {
          return res.send(err);
        }
      }
    });
  }

  async getAgents(req: Request, res: Response) {
    return this.handleRequest(req, res, async () => {
      if (!req.user) {
        return res.status(400).json({ message: "bad auth" });
      } else {
        //@ts-ignore
        const adminId = req.user.id;
        const isVerified = await db.company.findFirst({
          where: {
            adminId,
          },
        });
        if (!isVerified) {
          return res.status(400).json({ err: "not verified" });
        }
        try {
          const agents = await db.company.findFirst({
            where: {
              adminId,
            },
            include: {
              users: true,
            },
          });

          return res.status(200).send(agents?.users);
        } catch (err) {
          return res.send(err);
        }
      }
    });
  }

  async updateAgent(req: Request, res: Response) {
    return this.handleRequest(req, res, async () => {
      const { name, age, gender, phoneNo, email, role, agentId } = req.body;

      if (!req.user) {
        return res.status(400).json({ message: "bad auth" });
      } else {
        try {
          //@ts-ignore
          const adminId = req.user.id;
          const isVerified = await verifyAdmin(adminId);
          if (!isVerified) {
            return res.status(400).json({ err: "not verified" });
          } else {
            const agent = await db.user.update({
              where: {
                id: agentId,
              },
              data: {
                name,
                email,
                password: "testpassword",
                phone: phoneNo,
                dob: age,
                gender,
                role,
              },
            });

            return res.status(201).send(agent);
          }
        } catch (err) {
          return res.send(err);
        }
      }
    });
  }

  async updateCompany(req: Request, res: Response) {
    return this.handleRequest(req, res, async () => {
      const { name, age, gender, phoneNo, email, role, agentId } = req.body;

      if (!req.user) {
        res.status(400).json({ message: "bad auth" });
      } else {
        try {
          //@ts-ignore
          const adminId = req.user.id;
          const isVerified = await verifyAdmin(adminId);
          if (!isVerified) {
            res.status(400).json({ err: "not verified" });
          } else {
            const agent = await db.user.update({
              where: {
                id: agentId,
              },
              data: {
                name,
                email,
                phone: phoneNo,
                dob: age,
                gender,
                role,
              },
            });

            res.status(201).send(agent);
          }
        } catch (err) {
          res.send(err);
        }
      }
    });
  }

  async deleteAgent(req: Request, res: Response) {
    return this.handleRequest(req, res, async () => {
      const agentIds: string[] = req.body.agentIds;
      if (!req.user) {
        res.status(400).json({ message: "bad auth" });
      } else {
        //@ts-ignore
        const adminId = req.user.id;
        const isVerified = await verifyAdmin(adminId);
        if (!isVerified) {
          res.status(400).json({ err: "not verified" });
        }

        const company = await db.company.findFirst({
          where: {
            adminId,
          },
        });
        if (!company) {
          res.status(404).json({ message: "heckerrrrr" });
        } else {
          const companyId = company.id;
          try {
            agentIds.forEach(async (agentId) => {
              await db.user.delete({
                where: {
                  id: agentId,
                  companyId: companyId,
                },
              });
            });

            res.status(200);
          } catch (err) {
            res.send(err);
          }
        }
      }
    });
  }
  async viewLeads(req: Request, res: Response) {
    return this.handleRequest(req, res, async () => {
      if (!req.user) {
        res.status(400).json({ message: "bad auth" });
      } else {
        //@ts-ignore
        const adminId = req.user.id;

        try {
          const company = await db.company.findFirst({
            where: {
              adminId,
            },
            include: {
              leads: true,
            },
          });
          if (!company) {
            res.status(404).json({ message: "heckerrrrr" });
          } else {
            res.status(200).send(company.leads);
          }
        } catch (err) {
          res.send(err);
        }
      }
    });
  }
  async viewDeals(req: Request, res: Response) {
    return this.handleRequest(req, res, async () => {
      if (!req.user) {
        res.status(400).json({ message: "bad auth" });
      } else {
        //@ts-ignore
        const adminId = req.user.id;

        try {
          const company = await db.company.findFirst({
            where: {
              adminId,
            },
            include: {
              deals: true,
            },
          });
          if (!company) {
            res.status(404).json({ message: "heckerrrrr" });
          } else {
            res.status(200).send(company.deals);
          }
        } catch (err) {
          res.send(err);
        }
      }
    });
  }
}

// Reactivate a company (SuperAdmin only)
export const reactivateCompany = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const company = await prisma.company.update({
      where: { id },
      data: { blocked: false },
    });
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: "Failed to reactivate company" });
  }
};

// Block a company (SuperAdmin only)
export const blockCompany = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const company = await prisma.company.update({
      where: { id },
      data: { blocked: true },
    });

    // Update all users of the company to be blocked
    await prisma.user.updateMany({
      where: { companyId: id },
      data: { isActive: false },
    });

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: "Failed to block company" });
  }
};

// Delete a company (SuperAdmin only)
export const deleteCompany = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Delete all related data in the correct order
    await prisma.$transaction([
      // Delete all related records first
      prisma.lead.deleteMany({ where: { companyId: id } }),
      prisma.deal.deleteMany({ where: { companyId: id } }),
      prisma.user.deleteMany({ where: { companyId: id } }),
      // Finally delete the company
      prisma.company.delete({ where: { id } })
    ]);
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete company" });
  }
};
