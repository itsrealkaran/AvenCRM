import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth.js';
import MetaController from '../controllers/meta-ads.controllers.js';

const router: Router = Router();

router.use(protect);

router.get('/access-token/:code', MetaController.getFacebookAccessToken);
router.get('/accounts', MetaController.getMetaAdAccounts);
router.post('/account', MetaController.createMetaAdAccount);

export default router;