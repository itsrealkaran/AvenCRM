// src/controllers/superadmin/company.controller.ts
import { Request, Response } from 'express';
import { BaseController } from '../base.controllers';

export class SuperAdminCompanyController extends BaseController {
  async createCompany(req: Request, res: Response) {
    return this.handleRequest(req, res, async () => {
      const { 
        name, 
        email, 
        planId,
        adminData,
        address,
        phone,
        website 
      } = req.body;

      // Create company and admin in a transaction
      const result = await this.prisma.$transaction(async (prisma) => {
        // Create admin first
        const admin = await prisma.admin.create({
          data: {
            name: adminData.name,
            email: adminData.email,
            password: adminData.password, // Make sure to hash this
            designation: adminData.designation
          }
        });

        // Create company with admin
        const company = await prisma.company.create({
          data: {
            name,
            email,
            planId,
            adminId: admin.id,
            address,
            phone,
            website,
            planStart: new Date(),
            planEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          },
          include: {
            admin: true,
            plan: true
          }
        });

        return company;
      });

      return result;
    });
  }

  async getCompanies(req: Request, res: Response) {
    return this.handleRequest(req, res, async () => {
      const companies = await this.prisma.company.findMany({
        include: {
          admin: true,
          plan: true,
          _count: {
            select: {
              users: true,
              deals: true,
              leads: true
            }
          }
        }
      });

      return companies;
    });
  }

  async getCompanyById(req: Request, res: Response) {
    return this.handleRequest(req, res, async () => {
      const { id } = req.params;

      const company = await this.prisma.company.findUnique({
        where: { id },
        include: {
          admin: true,
          plan: true,
          users: true,
          deals: true,
          leads: true,
          teams: true
        }
      });

      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      return company;
    });
  }

  async updateCompany(req: Request, res: Response) {
    return this.handleRequest(req, res, async () => {
      const { id } = req.params;
      const updateData = req.body;

      const company = await this.prisma.company.update({
        where: { id },
        data: updateData,
        include: {
          admin: true,
          plan: true
        }
      });

      return company;
    });
  }

  async deleteCompany(req: Request, res: Response) {
    return this.handleRequest(req, res, async () => {
      const { id } = req.params;

      await this.prisma.company.delete({
        where: { id }
      });

      return { message: 'Company deleted successfully' };
    });
  }
}