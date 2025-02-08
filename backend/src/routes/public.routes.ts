import { Router } from "express";
import { propertiesController } from "../controllers/property.controller.js";

const router: Router = Router();

router.get('/:id', propertiesController.getPublicProperty);
router.post('/setLead', propertiesController.setLeadFromProperty);

export { router as publicRoutes }