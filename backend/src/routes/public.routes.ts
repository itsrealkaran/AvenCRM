import { Router } from "express";
import { propertiesController } from "../controllers/property.controller.js";
import { prisma } from "../lib/prisma.js";

const router: Router = Router();

router.post('/setLead', propertiesController.setLeadFromProperty);
router.get('/:id', propertiesController.getPublicProperty);

export { router as publicRoutes }