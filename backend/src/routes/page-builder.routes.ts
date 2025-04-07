import { Router } from 'express';
import { pageBuilderController, publicPageController } from '../controllers/page-builder.controller.js';
import { protect } from '../middleware/auth.js';

const router: Router = Router();

router.use(protect);

// Protected routes (require authentication)
router.get('/pages', pageBuilderController.getPages.bind(pageBuilderController));
router.get('/pages/:id', pageBuilderController.getPageById.bind(pageBuilderController));
router.post('/pages', pageBuilderController.createPage.bind(pageBuilderController));
router.put('/pages/:id', pageBuilderController.updatePage.bind(pageBuilderController));
router.delete('/pages/:id', pageBuilderController.deletePage.bind(pageBuilderController));
router.post('/check-slug', pageBuilderController.checkSlug.bind(pageBuilderController));
router.post('/pages/:id/publish', pageBuilderController.publishPage.bind(pageBuilderController));

export default router; 