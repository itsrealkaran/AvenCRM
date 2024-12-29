import express, { Router } from 'express';
import { createTask, getTasks, updateTask, deleteTask } from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.js';

const router: Router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Task routes
router.post('/', createTask);
router.get('/', getTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
