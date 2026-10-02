import express from 'express';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
} from '../controllers/jobController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateJob, validateRequest } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Routes for /api/jobs
router.route('/')
  .get(getAllJobs)
  // Protected, Authorized, Validated, then Created
  .post(protect, authorize('recruiter'), validateJob, validateRequest, createJob); 

// Routes for /api/jobs/:id
router.route('/:id')
  .get(getJobById)
  // Protected, Authorized, Validated, then Updated
  .put(protect, authorize('recruiter'), validateJob, validateRequest, updateJob)    
  .delete(protect, authorize('recruiter'), deleteJob); 

export default router;