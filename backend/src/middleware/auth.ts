/* eslint-disable @typescript-eslint/no-namespace */
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AppError } from '../utils/appError.js';
import { prisma } from '../lib/prisma.js';
import { UserRole } from '@prisma/client';

interface JwtPayload {
  id: string;
  role: UserRole;
  companyId?: string
}

declare global {
  namespace Express {
    interface User {
      id: string;
      role: UserRole;
      companyId?: string
    }
    interface Request {
      user?: User;
    }
  }
}

export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // 1) Get token and check if it exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

      if (!token) {
      return next(new AppError('You are not logged in', 401));
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;

    if (!decoded || decoded.role !== UserRole.SUPERADMIN && decoded.role !== UserRole.ADMIN && decoded.role !== UserRole.AGENT) {
      return next(new AppError('Invalid token', 401));  
    }

    // 3) Check if user still exists based on userType
    let user;
   
    if (decoded.role === UserRole.SUPERADMIN) {
      user = await prisma.superAdmin.findUnique({
        where: {
          id: decoded.id 
        }
      });
    } else if (decoded.role === UserRole.ADMIN) {
      user = await prisma.admin.findUnique({
        where: {
          id: decoded.id
        }
      });
    } else if (decoded.role === UserRole.AGENT) {
      user = await prisma.agent.findUnique({
        where: {
          id: decoded.id
        }
      });
    }

    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    // 4) Grant access to protected route
    req.user = {
      ...user,
      role: decoded.role,
      id: decoded.id,
      companyId: decoded.companyId
    };
    next();
  } catch (error) {
    next(new AppError('Invalid token', 401));
  }
};

// Middleware to restrict access based on user type
export const restrictTo = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('You are not logged in', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};