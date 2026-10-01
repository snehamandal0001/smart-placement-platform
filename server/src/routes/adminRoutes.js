import express from 'express';
import { getGlobalStats } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// The route is protected by BOTH middlewares: must be logged in AND be an admin
router.get('/stats', protect, admin, getGlobalStats);

export default router;