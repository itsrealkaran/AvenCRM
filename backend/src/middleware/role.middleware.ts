// // src/middleware/role.middleware.ts
// import { Request, Response, NextFunction, RequestHandler } from 'express';
// import { UserRole } from '@prisma/client';

// export const checkRole = (roles: UserRole[]): RequestHandler => {
//   return (req: Request, res: Response, next: NextFunction): void => {
//     if (!req.user) {
//       res.status(401).json({
//         message: 'Unauthorized - No user found'
//       });
//       return;
//     }

//     const userRole = req.user?.role;
//     if (!userRole || !roles.includes(userRole)) {
//       res.status(403).json({
//         message: 'Insufficient permissions',
//         requiredRoles: roles,
//         userRole: userRole || 'none'
//       });
//       return;
//     }
    
//     next();
//   };
// };