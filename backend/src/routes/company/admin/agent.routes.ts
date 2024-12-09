// src/routes/superadmin/company.routes.ts
import { Router, Request, Response } from 'express';
import { AdminAgentController } from '../../../controllers/company.controller';
import { authenticateToken } from '../../../middleware/authMiddleware';
import { UserRole } from '@prisma/client';

const router = Router();
const controller = new AdminAgentController();

// Apply authentication middleware
router.use(authenticateToken);

// Apply role middleware as a function call
// const roleMiddleware = checkRole([UserRole.SUPERADMIN, UserRole.ADMIN, ]);
// router.use(roleMiddleware);

// Route handlers
router.post('/add', async (req: Request, res: Response) => {
  await controller.createAgent(req, res);
});

router.get('/getAll', async (req: Request, res: Response) => {
  await controller.getAgents(req, res);
});

router.post('/update', async (req: Request, res: Response) => {
  await controller.updateAgent(req, res);
});

router.post('/delete', async (req: Request, res: Response) => {
  await controller.deleteAgent(req, res);
});

router.get('/leads', async (req: Request, res: Response) => {
  await controller.viewLeads(req, res);
});

router.get('/deals', async (req: Request, res: Response) => {
  await controller.viewDeals(req, res);
});

export default router;