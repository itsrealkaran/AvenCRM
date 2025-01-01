import express, { Router } from 'express';
import { getAdminDashboard, getAgentDashboard, getSuperAdminDashboard } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';
import { verifyRoleAndCompany } from '../middleware/roleAuth.js';
import { UserRole } from '@prisma/client';

const router: Router = Router();

// Dashboard routes with role-based authorization
router.get('/superadmin', protect, verifyRoleAndCompany([UserRole.SUPERADMIN]), getSuperAdminDashboard);
router.get('/admin', protect, verifyRoleAndCompany([UserRole.ADMIN]), getAdminDashboard);
router.get('/agent', protect, getAgentDashboard);

export default router;
