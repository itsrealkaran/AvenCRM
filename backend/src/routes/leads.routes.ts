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

// Create multiple leads
router.post('/bulk', leadsController.createManyLeads);

// Update notes
router.post('/:id/notes', leadsController.updateNotes);

// Update lead
router.put('/:id', leadsController.updateLead);

// Update lead agent
router.patch('/agent/:id', leadsController.updateLeadAgent);

// Update lead status
router.patch('/:id/status', leadsController.updateLeadStatus);

// Delete single lead
router.delete('/:id', leadsController.deleteLead);

// Delete multiple leads
router.delete('/', leadsController.deleteMultipleLeads);

// Convert lead to deal
router.post('/convert', leadsController.convertToDeal);

export default router;