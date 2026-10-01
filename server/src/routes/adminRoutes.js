import express from 'express';
import { getGlobalStats, updateRecruiterStatus } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js'; 

const router = express.Router();

router.get('/stats', protect, admin, getGlobalStats);

router.put('/recruiters/:id/status', protect, admin, updateRecruiterStatus);

export default router;