// src/routes/superadmin/company.routes.ts
import { Router, Request, Response } from 'express';
import { SuperAdminCompanyController } from '../../controllers/superadmin/company.controller';
import { authenticateToken } from '../../middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const router = Router();
const controller = new SuperAdminCompanyController();

// Apply authentication middleware
router.use(authenticateToken);

// Apply role middleware as a function call
// const roleMiddleware = checkRole([UserRole.SUPERADMIN, UserRole.ADMIN, ]);
// router.use(roleMiddleware);

// Route handlers
router.post('/', async (req: Request, res: Response) => {
  await controller.createCompany(req, res);
});

router.get('/', async (req: Request, res: Response) => {
  await controller.getCompanies(req, res);
});

router.get('/:id', async (req: Request, res: Response) => {
  await controller.getCompanyById(req, res);
});

router.put('/:id', async (req: Request, res: Response) => {
  await controller.updateCompany(req, res);
});

router.delete('/:id', async (req: Request, res: Response) => {
  await controller.deleteCompany(req, res);
});

export default router;