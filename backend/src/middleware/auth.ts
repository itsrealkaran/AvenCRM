/* eslint-disable @typescript-eslint/no-namespace */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { UserRole } from '@prisma/client';
import logger from '../utils/logger.js';
import { AppError } from '../utils/appError.js';

interface JWTPayload {
  id: string;
  role: UserRole;
  companyId?: string;
  teamId?: string | null;
  exp?: number;
}

declare global {
  namespace Express {
    interface User {
      id: string;
      role: UserRole;
      companyId?: string;
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
      let decoded = jwt.verify(token, process.env.JWT_SECRET || 'nope') as JWTPayload;
      // Check token expiration
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        // Try to refresh using refresh token
        const refreshToken = req.cookies.RefreshToken;
        if (refreshToken) {
          try {
            const refreshDecoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'refresh-nope') as JWTPayload;
            
            // Generate new access token
            const newAccessToken = jwt.sign(
              { 
                id: refreshDecoded.id,
                role: refreshDecoded.role,
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
              maxAge: 60 * 60 * 1000 // 60 minutes
            });

            // Use new token for this request
            token = newAccessToken;
            decoded = jwt.verify(newAccessToken, process.env.JWT_SECRET || 'nope') as JWTPayload;
          } catch (refreshError) {
            return res.status(401).json({ message: 'Invalid refresh token' });
          }
        } else {
          return res.status(401).json({ message: 'Token expired' });
        }
      }

      // Verify user still exists
      let user;
      
      user = await prisma.user.findUnique({
        where: { id: decoded.id, role: decoded.role },
        include: {
          company: true
        }
      });
      if (!user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }
      // Attach user to request
      (req as AuthenticatedRequest).user = {
        ...user,
        id: user.id,
        role: decoded.role,
        teamId: user.teamId || null,
        companyId: decoded.companyId,
      };
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        // Try to refresh the token
        const refreshToken = req.cookies.RefreshToken;
        if (refreshToken) {
          try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'refresh-nope') as JWTPayload;
            
            // Generate new access token
            const newAccessToken = jwt.sign(
              { 
                id: decoded.id,
                role: decoded.role,
                companyId: decoded.companyId,
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

            // Attach user to request
            (req as AuthenticatedRequest).user = decoded;
            return next();
          } catch (refreshError) {
            return res.status(401).json({ message: 'Refresh token expired, please login again' });
          }
        }
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Not authorized to access this routes' });
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