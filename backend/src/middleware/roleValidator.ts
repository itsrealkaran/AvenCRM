import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    companyId?: string;
  };
}

export const validateRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};
