import express from 'express';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
} from '../controllers/jobController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes for /api/jobs
router.route('/')
  .get(getAllJobs)
  .post(protect, authorize('recruiter'), createJob); // Protected & Authorized!
// Routes for /api/jobs/:id
router.route('/:id')
  .get(getJobById)
  .put(protect, authorize('recruiter'), updateJob)    // Protected & Authorized!  .delete(deleteJob);
  .delete(protect, authorize('recruiter'), deleteJob); // Protected & Authorized!

export default router;