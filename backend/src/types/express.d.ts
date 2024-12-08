import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        profileId: string;
        role?: UserRole;
        exp?: number;
      }
    }
  }
}

// Export an empty object to make it a module
export {};