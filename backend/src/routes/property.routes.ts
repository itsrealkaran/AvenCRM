import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { propertiesController } from '../controllers/property.controller.js';

const router: Router = Router();

// Apply authentication middleware to all routes
router.use(protect);

// Property CRUD routes
router.get('/', propertiesController.getAllProperties);
router.get('/:id', propertiesController.getPropertyById);
router.post('/', propertiesController.createProperty);
router.put('/:id', propertiesController.updateProperty);
router.patch('/:id/status', propertiesController.updatePropertyStatus);
router.delete('/:id', propertiesController.deleteProperty);
router.delete('/', propertiesController.deleteMultipleProperties);

export default router;