/* eslint-disable @typescript-eslint/no-namespace */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { UserRole } from '@prisma/client';
import logger from '../utils/logger.js';
import { AppError } from '../utils/appError.js';

export interface JWTPayload {
  id: string;
  role: UserRole;
  email: string;
  companyId?: string;
  teamId?: string | null;
  exp?: number;
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

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
  let token: string | undefined;

    // 1. First check Authorization cookie
    token = req.cookies.Authorization;

    // 2. Then check Authorization header
    // if (token && req.headers.authorization?.startsWith('Bearer')) {
    //   token = req.headers.authorization.split(' ')[1];
    // }
    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nope') as JWTPayload;

      // Check token expiration
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        // Try to refresh using refresh token
        const refreshToken = req.cookies.RefreshToken;
        if (!refreshToken) {
          return res.status(401).json({ message: 'Token expired' });
        }

        try {
          const refreshDecoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'refresh-nope') as JWTPayload;
          
          // Generate new access token
          const newAccessToken = jwt.sign(
            { 
              id: refreshDecoded.id,
              role: refreshDecoded.role,
              email: refreshDecoded.email,
              companyId: refreshDecoded.companyId,
              exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
            },
            process.env.JWT_SECRET || 'nope'
          );

          // Set new access token in cookie
          res.cookie('Authorization', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 60 * 60 * 1000 // 1 hour
          });

          // Verify user still exists
          const user = await prisma.user.findUnique({
            where: { id: refreshDecoded.id },
            select: {
              id: true,
              email: true,
              role: true,
              teamId: true,
              companyId: true
            }
          });

          if (!user) {
            return res.status(401).json({ message: 'User no longer exists' });
          }

          // Attach user to request
          req.user = {
            id: user.id,
            role: user.role,
            email: user.email,
            companyId: user.companyId || undefined,
            teamId: user.teamId
          };
          return next();
        } catch (refreshError) {
          return res.status(401).json({ message: 'Invalid refresh token' });
        }
      }

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          teamId: true,
          companyId: true
        }
      });

      if (!user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }

      // Attach user to request
      req.user = {
        id: user.id,
        role: user.role,
        email: user.email,
        companyId: user.companyId || undefined,
        teamId: user.teamId
      };
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};

// Middleware to restrict access based on user type
export const restrictTo = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    // Assert that req is of type AuthenticatedRequest
    const authenticatedRequest = req as AuthenticatedRequest;

    if (!authenticatedRequest.user) {
      return next(new AppError('You are not logged in', 401));
    }

    // Now TypeScript knows that authenticatedRequest.user exists and has a role
    if (!allowedRoles.includes(authenticatedRequest.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};