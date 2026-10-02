import express from 'express';
import multer from 'multer'; 
import { 
  applyForJob,
  getJobApplications, 
  updateApplicationStatus,
  getRecruiterAnalytics,
  getMyApplications 
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateApplication, validateRequest } from '../middleware/validationMiddleware.js';

const router = express.Router();

// SECURED: Configure Multer with memory limits and MIME validation
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit prevents RAM exhaustion
  },
  fileFilter: (req, file, cb) => {
    // Only accept strictly PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
    }
  }
});

// ==========================================
// 1. STATIC ROUTES 
// ==========================================

// Recruiter Route: View analytics
router.get('/analytics/recruiter', protect, authorize('recruiter'), getRecruiterAnalytics);

// Student Route: Get their own applications
router.get('/my-applications', protect, authorize('student'), getMyApplications);


// ==========================================
// 2. DYNAMIC ID ROUTES 
// ==========================================

// Student Route: Apply for a job (Requires PDF upload)
router.post('/:jobId/apply',
   protect, authorize('student'),
   upload.single('resumeFile'),
   validateApplication, 
   validateRequest, 
   applyForJob);

// Recruiter Route: View applications for a specific job
router.get('/job/:jobId', protect, authorize('recruiter'), getJobApplications);

// Recruiter Route: Update application status (Approve/Reject/Interview)
router.put('/:id/status', protect, authorize('recruiter'), updateApplicationStatus);

export default router;