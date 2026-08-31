import Job from '../models/Job.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get all jobs (with optional search and skill filtering and pagination)
// @route   GET /api/jobs
// @access  Public
export const getAllJobs = asyncHandler(async (req, res) => {
  const { keyword, location, jobType, page: reqPage } = req.query;

  // Build a dynamic query filter object
  let query = {};

  // Case-insensitive search on title or company
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
  const limit = 8; // Number of jobs to show per page
  const skip = (page - 1) * limit;

  // Fetch jobs using the filter query PLUS skip and limit
  const jobs = await Job.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    // Count total jobs that MATCH THE SEARCH to calculate total pages
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

  // Create document in MongoDB and attach the logged-in user's ID
  const job = await Job.create({
    title,
    company,
    location,
    salary,
    description,
    requiredSkills,
    jobType,
    postedBy: req.user._id // <-- THIS IS NEW! It links the job to the recruiter.
  });

  res.status(201).json({
    success: true,
    message: 'Job posted successfully to database',
    data: job
  });
});

// @desc    Update an existing job
// @route   PUT /api/jobs/:id
// @access  Public
export const updateJob = asyncHandler(async (req, res) => {
  // findByIdAndUpdate takes 3 arguments:
  // 1. ID to find
  // 2. Data to update (req.body)
  // 3. Options: new: true (returns updated doc), runValidators: true (runs schema validation rules)
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!job) {
    res.status(404);
    throw new Error(`Job not found with ID: ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    message: 'Job updated successfully',
    data: job
  });
});

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Public
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error(`Job not found with ID: ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    message: 'Job removed from database',
    data: {}
  });
});