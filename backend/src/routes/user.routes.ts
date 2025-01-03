import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js';
import { validateRole } from '../middleware/roleValidator.js';
import { UserRole } from '@prisma/client';
import express from 'express';
import multer from 'multer';

const router: Router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// User Management Routes (Protected)
router.use(protect);

// SuperAdmin & Admin Routes
router.post('/', validateRole([UserRole.SUPERADMIN, UserRole.ADMIN]), userController.createUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', validateRole([UserRole.SUPERADMIN, UserRole.ADMIN]), userController.updateUser);
router.delete('/', validateRole([UserRole.SUPERADMIN, UserRole.ADMIN]), userController.deleteUser);
router.get('/admins', validateRole([UserRole.SUPERADMIN]), userController.getAllAdmins);

// Team Management Routes
router.post('/assign-team', validateRole([UserRole.ADMIN, UserRole.TEAM_LEADER]), userController.assignTeam);

// Metrics and Performance Routes
router.get('/:id/metrics', userController.getUserMetrics);

// Avatar Routes
router.put('/avatar', protect, upload.single('avatar'), userController.uploadAvatar);
router.get('/avatar/:userId', protect, userController.getAvatar);

export default router;