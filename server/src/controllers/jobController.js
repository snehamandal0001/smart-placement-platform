import { jobs } from '../data/mockJobs.js';

// @desc    Get all jobs
// @route   GET /api/jobs
export const getAllJobs = (req, res) => {
  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs
  });
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
export const getJobById = (req, res) => {
  const jobId = parseInt(req.params.id);
  const job = jobs.find((j) => j.id === jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: `Job with ID ${jobId} not found`
    });
  }

  res.status(200).json({
    success: true,
    data: job
  });
};

// @desc    Create new job
// @route   POST /api/jobs
export const createJob = (req, res) => {
  const { title, company, location, salary, requiredSkills } = req.body;

  if (!title || !company || !location) {
    return res.status(400).json({
      success: false,
      message: 'Please provide title, company, and location'
    });
  }

  const newJob = {
    id: jobs.length > 0 ? Math.max(...jobs.map((j) => j.id)) + 1 : 1,
    title,
    company,
    location,
    salary: salary || 'Not Disclosed',
    requiredSkills: requiredSkills || [],
    status: 'Open',
    createdAt: new Date().toISOString()
  };

  jobs.push(newJob);

  res.status(201).json({
    success: true,
    message: 'Job created successfully',
    data: newJob
  });
};

// @desc    Update existing job
// @route   PUT /api/jobs/:id
export const updateJob = (req, res) => {
  const jobId = parseInt(req.params.id);
  const index = jobs.findIndex((j) => j.id === jobId);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Job with ID ${jobId} not found`
    });
  }

  const { title, company, location, salary, requiredSkills, status } = req.body;

  // Merge existing fields with provided update fields
  jobs[index] = {
    ...jobs[index],
    title: title || jobs[index].title,
    company: company || jobs[index].company,
    location: location || jobs[index].location,
    salary: salary || jobs[index].salary,
    requiredSkills: requiredSkills || jobs[index].requiredSkills,
    status: status || jobs[index].status,
    updatedAt: new Date().toISOString()
  };

  res.status(200).json({
    success: true,
    message: 'Job updated successfully',
    data: jobs[index]
  });
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
export const deleteJob = (req, res) => {
  const jobId = parseInt(req.params.id);
  const index = jobs.findIndex((j) => j.id === jobId);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Job with ID ${jobId} not found`
    });
  }

  const deletedJob = jobs.splice(index, 1);

  res.status(200).json({
    success: true,
    message: 'Job deleted successfully',
    data: deletedJob[0]
  });
};