import express from 'express';
import { applyForJob, getJobApplications } from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Student Route: Apply for a job
router.post('/:jobId/apply', protect, authorize('student'), applyForJob);

// Recruiter Route: View applications
router.get('/job/:jobId', protect, authorize('recruiter'), getJobApplications);

export default router;