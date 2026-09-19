import Job from '../models/Job.js';
import asyncHandler from '../middleware/asyncHandler.js';
import Application from '../models/Application.js'; 

// @desc    Get all jobs (with optional search and skill filtering and pagination)
// @route   GET /api/jobs
// @access  Public
export const getAllJobs = asyncHandler(async (req, res) => {
  const { keyword, location, jobType, page: reqPage } = req.query;

  let query = {};

  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { company: { $regex: keyword, $options: 'i' } }
    ];
  }

  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  if (jobType) {
    query.jobType = jobType;
  }

  // Pagination Math
  const page = parseInt(reqPage) || 1;
  const limit = 12; // Number of jobs to show per page
  const skip = (page - 1) * limit;

  // Fetch jobs using the filter query PLUS skip and limit
  const jobs = await Job.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalJobs = await Job.countDocuments(query);
  const totalPages = Math.ceil(totalJobs / limit);

  res.status(200).json({
    success: true,
    count: jobs.length,
    pagination: {
      currentPage: page,
      totalPages,
      totalJobs
    },
    data: jobs
  });
});


// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error(`Job not found with ID: ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    data: job
  });
});


// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private/Recruiter
export const createJob = asyncHandler(async (req, res) => {
  const {
    title, company, location, salary, description, requiredSkills, jobType
  } = req.body;

  const job = await Job.create({
    title,
    company,
    location,
    salary,
    description,
    requiredSkills,
    jobType,
    postedBy: req.user._id 
  });

  res.status(201).json({
    success: true,
    message: 'Job posted successfully to database',
    data: job
  });
});

// @desc    Update an existing job
// @route   PUT /api/jobs/:id
// @access  Private/Recruiter
export const updateJob = asyncHandler(async (req, res) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error(`Job not found with ID: ${req.params.id}`);
  }

  // Security check: Only the recruiter who posted it can update it
  if (job.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You are not authorized to update this job');
  }

  // Perform the update
  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Job updated successfully',
    data: job
  });
});

// @desc    Delete a job and its applications
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter only)
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error(`Job not found with ID: ${req.params.id}`);
  }

  // Security check: Only the recruiter who posted it can delete it
  if (job.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You are not authorized to delete this job');
  }

  // 1. Delete the job itself
  await job.deleteOne();

  // 2. Cascade delete: Remove all applications tied to this job
  await Application.deleteMany({ job: req.params.id });

  res.status(200).json({
    success: true,
    message: 'Job and associated applications successfully deleted',
    data: {}
  });
});