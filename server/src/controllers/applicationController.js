import Application from '../models/Application.js';
import Job from '../models/Job.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Student applies for a job
// @route   POST /api/applications/:jobId/apply
// @access  Private (Student Only)
export const applyForJob = asyncHandler(async (req, res) => {
  const jobId = req.params.jobId;

  // 1. Verify the job actually exists
  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // 2. Prevent duplicate applications
  const existingApplication = await Application.findOne({
    job: jobId,
    applicant: req.user._id
  });

  if (existingApplication) {
    res.status(400);
    throw new Error('You have already applied for this job');
  }

  // 3. Create the application
  const application = await Application.create({
    job: jobId,
    applicant: req.user._id,
    resumeUrl: req.body.resumeUrl || ''
  });

  res.status(201).json({
    success: true,
    message: 'Successfully applied for the job',
    data: application
  });
});

// @desc    Recruiter views applications for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter Only)
export const getJobApplications = asyncHandler(async (req, res) => {
  const jobId = req.params.jobId;

  // 1. Find the job and ensure it belongs to the logged-in recruiter
  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  if (job.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only view applications for jobs you posted');
  }

  // 2. Fetch applications AND populate the student's details!
  const applications = await Application.find({ job: jobId })
    .populate('applicant', 'name email skills cgpa'); // Pulls data from User collection!

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications
  });
});