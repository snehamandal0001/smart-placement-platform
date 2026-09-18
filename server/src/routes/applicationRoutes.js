import express from 'express';
import multer from 'multer'; 
import { applyForJob, getJobApplications } from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure Multer to hold the file in memory
const upload = multer({ storage: multer.memoryStorage() });

// Student Route: Apply for a job
router.post('/:jobId/apply', protect, authorize('student'), upload.single('resumeFile'),applyForJob);

// Recruiter Route: View applications
router.get('/job/:jobId', protect, authorize('recruiter'), getJobApplications);

export default router;