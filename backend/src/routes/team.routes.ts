import { Router } from 'express';
import { teamController } from '../controllers/team.controller.js';
import { protect } from '../middleware/auth.js';
import { validateRole } from '../middleware/roleValidator.js';
import { UserRole } from '@prisma/client';

const router: Router = Router();

// User Management Routes (Protected)
router.use(protect);

// SuperAdmin & Admin Routes
router.post('/', validateRole([UserRole.SUPERADMIN, UserRole.ADMIN]), teamController.createUser);
router.get('/', validateRole([UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEAM_LEADER]), teamController.getUsers);
router.get('/get-teams', validateRole([UserRole.ADMIN]), teamController.getTeams);
router.get('/:id', teamController.getUserById);
router.put('/:id', validateRole([UserRole.SUPERADMIN, UserRole.ADMIN]), teamController.updateUser);
router.delete('/:id', validateRole([UserRole.SUPERADMIN, UserRole.ADMIN]), teamController.deleteUser);

// Team Management Routes
router.post('/assign-team', validateRole([UserRole.ADMIN, UserRole.TEAM_LEADER]), teamController.assignTeam);

// Metrics and Performance Routes
router.get('/:id/metrics', teamController.getUserMetrics);

export { router as teamRoutes };