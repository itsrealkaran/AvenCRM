/* eslint-disable @typescript-eslint/no-namespace */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { UserRole } from '@prisma/client';
import logger from '../utils/logger.js';
import { AppError } from '../utils/appError.js';
import { getCachedUser, cacheUser } from '../services/redis.js';

export interface JWTPayload {
  id: string;
  role: UserRole;
  email: string;
  companyId?: string;
  teamId?: string | null;
  exp?: number;
  iat?: number;
}

declare global {
  namespace Express {
    interface User {
      id: string;
      role: UserRole;
      email: string;
      companyId?: string;
      teamId?: string | null;
    }
    interface Request {
      user?: User;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

const verifyToken = (token: string): Promise<JWTPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key',
      (err: any, decoded: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded as JWTPayload);
        }
      }
    );
  });
};

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // 1. Get token from cookie or header
    token = req.cookies.Authorization;
    
    if (!token && req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    // 2. Verify token
    const decoded = await verifyToken(token);
    
    // 3. Check if user is cached in Redis
    const cachedUser = await getCachedUser(decoded.id);
    
    if (cachedUser) {
      req.user = cachedUser;
      return next();
    }

    // 4. If not in cache, get from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        companyId: true,
        teamId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User no longer exists or is inactive' });
    }

    // 5. Cache user data
    await cacheUser(user.id, user);

    // 6. Attach user to request
    req.user = {
      ...user,
      id: user.id,
      role: user.role,
      email: user.email,
      companyId: user.companyId || '',
      teamId: user.teamId || '',
    };
    
    next();
  } catch (error) {
    logger.error('Auth Middleware Error:', error);
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

// Middleware to restrict access based on user role
export const restrictTo = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};