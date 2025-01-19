import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import multer from 'multer';
import { propertiesController } from '../controllers/property.controller.js';

const router: Router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

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

// Image upload route
// router.post('/:id/upload-images', upload.array('images', 10), propertiesController.uploadImages);

export default router;