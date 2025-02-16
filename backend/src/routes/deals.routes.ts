import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { dealsController } from '../controllers/deals.controller.js';

const router: Router = Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get all deals with filtering and pagination
router.get('/', dealsController.getAllDeals);

// Get all the won deals
router.get('/won', dealsController.getAllWonDeals);

// Get single deal by ID
router.get('/:id', dealsController.getDealById);

// Create new deal
router.post('/', dealsController.createDeal);

// Update notes
router.post('/:id/notes', dealsController.updateNotes);

// Update deal
router.put('/:id', dealsController.updateDeal);

// Update deal status
router.patch('/:id/status', dealsController.updateDealStatus);

// Delete single deal
router.delete('/:id', dealsController.deleteDeal);

// Delete multiple deals
router.delete('/', dealsController.deleteMultipleDeals);

// Convert deal to deal

export default router;