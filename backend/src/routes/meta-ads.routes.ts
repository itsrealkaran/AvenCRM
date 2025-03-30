import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth.js';
import MetaController from '../controllers/meta-ads.controllers.js';
import multer from 'multer';

const router: Router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    }
  });

router.use(protect);

router.get('/access-token/:code', MetaController.getFacebookAccessToken);
router.get('/accounts', MetaController.getMetaAdAccounts);
router.get('/forms', MetaController.getLeadForms);
router.post('/account', MetaController.createMetaAdAccount);
router.post('/upload-image', upload.single('image'), MetaController.uploadImage);
router.post('/form', MetaController.createLeadForm);
router.delete('/account/:id', MetaController.deleteMetaAdAccount);

export default router;