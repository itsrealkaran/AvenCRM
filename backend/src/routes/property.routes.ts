import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { propertiesController } from '../controllers/property.controller.js';
import multer from 'multer';

const router: Router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Apply authentication middleware to all routes
router.use(protect);

// Property CRUD routes
router.get('/', propertiesController.getProperties);
router.get('/all', propertiesController.getAllProperties);
router.get('/agent', propertiesController.getAgentId);
router.get('/public/:id', propertiesController.getPublicProperty);
router.get('/:id', propertiesController.getPropertyById);
router.post('/', propertiesController.createProperty);
router.post('/upload-file', upload.single('file'), propertiesController.uploadFile);
router.put('/:id', propertiesController.updateProperty);
router.patch('/:id/permit-number', propertiesController.updatePermitNumber);
router.patch('/:id/status', propertiesController.updatePropertyStatus);
router.delete('/:id', propertiesController.deleteProperty);
router.delete('/', propertiesController.deleteMultipleProperties);

export default router;