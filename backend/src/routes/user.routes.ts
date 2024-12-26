import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js';
import { validateRole } from '../middleware/roleValidator.js';
import { UserRole } from '@prisma/client';

const router: Router = Router();

// User Management Routes (Protected)
router.use(protect);

// SuperAdmin & Admin Routes
router.post('/', validateRole([UserRole.SUPERADMIN, UserRole.ADMIN]), userController.createUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', validateRole([UserRole.SUPERADMIN, UserRole.ADMIN]), userController.updateUser);
router.delete('/:id', validateRole([UserRole.SUPERADMIN, UserRole.ADMIN]), userController.deleteUser);

// Team Management Routes
router.post('/assign-team', validateRole([UserRole.ADMIN, UserRole.TEAM_LEADER]), userController.assignTeam);

// Metrics and Performance Routes
router.get('/:id/metrics', userController.getUserMetrics);

export default router;