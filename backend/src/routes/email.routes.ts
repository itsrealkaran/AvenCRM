import emailController from '../controllers/email.controller.js';
import { Router } from 'express';

const router = Router();

router.use('/email', emailController);

export default router;