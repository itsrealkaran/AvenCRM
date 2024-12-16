import { Router } from 'express';
import agentRoutes from './agent.routes.js';
import authRoutes from './auth.routes.js';


const router: Router = Router();

router.use('/agent', agentRoutes);
router.use('/auth', authRoutes);

export { router as apiRoutes };