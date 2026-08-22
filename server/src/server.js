import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Essential Middleware
app.use(cors());
app.use(express.json()); // Crucial: allows Express to read JSON sent in POST requests

// --- In-Memory Mock Database ---
// In Day 5, we will replace this array with MongoDB!
let jobs = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'TechCorp Solutions',
    location: 'Bangalore / Remote',
    salary: '8-12 LPA',
    requiredSkills: ['React', 'JavaScript', 'Tailwind CSS'],
    status: 'Open'
  },
  {
    id: 2,
    title: 'Backend Engineer',
    company: 'NextGen Systems',
    location: 'Hyderabad / Hybrid',
    salary: '10-14 LPA',
    requiredSkills: ['Node.js', 'Express', 'MongoDB'],
    status: 'Open'
  }
];

// --- Routes ---

// 1. Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Placement Platform API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// 2. GET All Jobs
app.get('/api/jobs', (req, res) => {
  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs
  });
});

// 3. POST Create a New Job
app.post('/api/jobs', (req, res) => {
  const { title, company, location, salary, requiredSkills } = req.body;

  // Basic Validation: Ensure mandatory fields are provided
  if (!title || !company || !location) {
    return res.status(400).json({
      success: false,
      message: 'Please provide title, company, and location for the job.'
    });
  }

  // Create new job object with an auto-incrementing ID
  const newJob = {
    id: jobs.length + 1,
    title,
    company,
    location,
    salary: salary || 'Not Disclosed',
    requiredSkills: requiredSkills || [],
    status: 'Open',
    createdAt: new Date().toISOString()
  };

  // Add to our in-memory array
  jobs.push(newJob);

  // Return the newly created job with 201 Created status
  res.status(201).json({
    success: true,
    message: 'Job created successfully',
    data: newJob
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});