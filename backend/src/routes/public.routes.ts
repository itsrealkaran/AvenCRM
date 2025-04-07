import { Router } from "express";
import { propertiesController } from "../controllers/property.controller.js";
import { publicPageController } from '../controllers/page-builder.controller.js';

const router: Router = Router();

router.post('/setLead', propertiesController.setLeadFromProperty);
router.get('/:id', propertiesController.getPublicProperty);

// Public routes (no authentication required)
router.get('/pages/:slug', publicPageController.getPageBySlug.bind(publicPageController));

export { router as publicRoutes }