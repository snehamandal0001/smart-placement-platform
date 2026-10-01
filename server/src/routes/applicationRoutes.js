import express from 'express';
import multer from 'multer'; 
import { applyForJob,
     getJobApplications, 
     updateApplicationStatus,
     getRecruiterAnalytics,
     getMyApplications } from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure Multer to hold the file in memory
const upload = multer({ storage: multer.memoryStorage() });

// Recruiter Route: View analytics
router.get('/analytics/recruiter', protect,authorize('recruiter'), getRecruiterAnalytics);

// Student Route: Apply for a job
router.post('/:jobId/apply', protect, authorize('student'), upload.single('resumeFile'),applyForJob);

// Recruiter Route: View applications
router.get('/job/:jobId', protect, authorize('recruiter'), getJobApplications);

// Recruiter Route: View applications
router.put('/:id/status', protect, authorize('recruiter'), updateApplicationStatus);

// Student route to get their own applications
router.get('/my-applications', protect, authorize('student'), getMyApplications);

export default router;