import Application from '../models/Application.js';
import Job from '../models/Job.js';
import asyncHandler from '../middleware/asyncHandler.js';
import sendEmail from '../utils/sendEmail.js';
import { PDFParse } from 'pdf-parse';


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

  console.log("--- NEW APPLICATION INCOMING ---");
  console.log("Req.body:", req.body);
  console.log("Req.file:", req.file ? "File received!" : "UNDEFINED - File missing!");

  let extractedText = '';

  // 3. Parse the PDF if a file was uploaded
  if (req.file) {
    try {
      console.log("Attempting to parse PDF...");
      
      // V2 API: Instantiate the class and call getText()
      const parser = new PDFParse({ data: req.file.buffer });
      const pdfData = await parser.getText();
      
      console.log(`Success! Extracted ${pdfData.text.length} characters of text.`);
      extractedText = pdfData.text;
      
      // Free up memory after parsing
      await parser.destroy();
    } catch (error) {
      console.error("PDF Parsing failed:", error);
    }
  }
 
  // 3. Create the application
  const newApplication = await Application.create({
    job: jobId,
    applicant: req.user._id,
    resumeUrl: req.body.resumeUrl,
    resumeText: extractedText
  });

  await newApplication.save();

  // 4. Send the success response to the frontend INSTANTLY
  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    data: newApplication
  });

  // 5. Fire-and-Forget Email

  const testEmailDestination = 'snehamandal0415@gmail.com';

  sendEmail({
    email: testEmailDestination,   // SANDBOX MODE  email: req.user.email,  (when req.user is a valid mail)
    subject: 'Application Received - PlacementHub',
    message: `Hello ${req.user.name},\n\nYour job application and resume have been successfully submitted.`
  }).then(() => {
    console.log("✅ Background email sent successfully to", testEmailDestination);
  }).catch((error) => {
    console.error("❌ Background email failed:", error);
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

// @desc    Update application status & schedule interview
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter only)
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, interviewDate } = req.body; 
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // Update status
  application.status = status;
  
  if (interviewDate && status === 'Interview') {
    application.interviewDate = interviewDate;
  }

  await application.save();

  res.status(200).json({
    success: true,
    data: application
  });
});

// @desc    Get recruiter analytics (status distribution)
// @route   GET /api/applications/analytics/recruiter
// @access  Private (Recruiter only)
export const getRecruiterAnalytics = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user._id }).select('_id');
  const jobIds = jobs.map(job => job._id);

  const statusCounts = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  const pipelineData = statusCounts.map(stat => ({
    name: stat._id || 'Applied',
    value: stat.count
  }));

  //  Average CGPA & Top Skills using $lookup
  const applicantStats = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    { 
      $lookup: {
        from: 'users',
        localField: 'applicant',
        foreignField: '_id',
        as: 'applicantInfo'
      }
    },
    { $unwind: '$applicantInfo' },
    {
      $group: {
        _id: null,
        averageCgpa: { $avg: '$applicantInfo.cgpa' },
        allSkills: { $push: '$applicantInfo.skills' }
      }
    }
  ]);

  let avgCgpa = 0;
  let topSkills = [];

  if (applicantStats.length > 0) {
    avgCgpa = Math.round(applicantStats[0].averageCgpa * 100) / 100;

    // Count the frequency of every skill in the resume pool
    const skillMap = {};
    applicantStats[0].allSkills.flat().forEach(skill => {
      if (skill) {
        const cleanSkill = skill.trim().toUpperCase();
        skillMap[cleanSkill] = (skillMap[cleanSkill] || 0) + 1;
      }
    });

    topSkills = Object.entries(skillMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  res.status(200).json({ 
    success: true, 
    data: { pipeline: pipelineData, avgCgpa, topSkills } 
  });
});

// @desc    Get all applications for the logged-in student
// @route   GET /api/applications/my-applications
// @access  Private (Student Only)
export const getMyApplications = asyncHandler(async (req, res) => {
  // Find all applications where the applicant ID matches the logged-in user's ID
  const applications = await Application.find({ applicant: req.user._id })
    .populate('job', 'title company location') // THIS IS CRUCIAL for the UI Widget!
    .sort('-createdAt'); // Sort by newest first

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications
  });
});