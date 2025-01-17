import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { leadsController } from '../controllers/leads.controller.js';

const router: Router = Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get all leads with filtering and pagination
router.get('/', leadsController.getAllLeads);

// Get single lead by ID
router.get('/:id', leadsController.getLeadById);

// Create new lead
router.post('/', leadsController.createLead);

// Update lead
router.put('/:id', leadsController.updateLead);

// Delete single lead
router.delete('/:id', leadsController.deleteLead);

// Delete multiple leads
router.delete('/', leadsController.deleteMultipleLeads);

// Convert lead to deal
router.post('/convert', leadsController.convertToDeal);

export default router;