import express from 'express';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs 
} from '../controllers/jobController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateJob, validateRequest } from '../middleware/validationMiddleware.js';

const router = express.Router();

// ==========================================
// 1. STATIC ROUTES 
// ==========================================

router.get('/my-jobs', protect, authorize('recruiter'), getMyJobs);


// ==========================================
// 2. DYNAMIC ROUTES
// ==========================================

// Routes for /api/jobs
router.route('/')
  .get(getAllJobs)
  .post(protect, authorize('recruiter'), validateJob, validateRequest, createJob); 

// Routes for /api/jobs/:id
router.route('/:id')
  .get(getJobById)
  .put(protect, authorize('recruiter'), validateJob, validateRequest, updateJob)    
  .delete(protect, authorize('recruiter'), deleteJob); 

export default router;