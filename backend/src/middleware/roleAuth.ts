import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest } from "./auth.js";

type AllowedRoles = ("SUPERADMIN" | "ADMIN")[];

export const verifyRoleAndCompany = (allowedRoles: AllowedRoles) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthenticatedRequest).user;
      
      if (!user || !user.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Verify user still exists and get fresh data
      const dbUser = await prisma.user.findUnique({
        where: { 
          id: user.id,
        },
        include: {
          company: true
        }
      });

      if (!dbUser) {
        return res.status(401).json({ message: "User not found" });
      }

      // Verify role is allowed
      if (!allowedRoles.includes(dbUser.role as any)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      // For company-specific operations, verify company association
      if (req.params.id) {
        const company = await prisma.company.findUnique({
          where: { id: req.params.id }
        });

        if (!company) {
          return res.status(404).json({ message: "Company not found" });
        }

        // SUPERADMIN can access any company
        if (dbUser.role !== "SUPERADMIN") {
          // ADMIN can only access their own company
          if (dbUser.role === "ADMIN" && company.id !== dbUser.companyId) {
            return res.status(403).json({ message: "Access denied to this company" });
          }
        }
      }

      // Update request with fresh user data
      (req as AuthenticatedRequest).user = {
        ...dbUser,
        id: dbUser.id,
        role: dbUser.role,
        companyId: dbUser?.companyId || undefined,
      };

      next();
    } catch (error) {
      return res.status(500).json({ message: "Authorization error" });
    }
  };
};
