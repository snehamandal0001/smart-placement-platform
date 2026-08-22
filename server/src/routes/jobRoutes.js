import express from 'express';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
} from '../controllers/jobController.js';

const router = express.Router();

// Routes for /api/jobs
router.route('/')
  .get(getAllJobs)
  .post(createJob);

// Routes for /api/jobs/:id
router.route('/:id')
  .get(getJobById)
  .put(updateJob)
  .delete(deleteJob);

export default router;