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

  // 1. Verify the job actually exists AND populate recruiter details for the email
  const job = await Job.findById(jobId).populate('postedBy', 'name email');
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
  let extractedText = '';

  // 3. Parse the PDF if a file was uploaded
  if (req.file) {
    try {
      console.log("Attempting to parse PDF...");
      const parser = new PDFParse({ data: req.file.buffer });
      const pdfData = await parser.getText();
      console.log(`Success! Extracted ${pdfData.text.length} characters of text.`);
      extractedText = pdfData.text;
      await parser.destroy();
    } catch (error) {
      console.error("PDF Parsing failed:", error);
    }
  }
 
  // 4. Create the application
  const newApplication = await Application.create({
    job: jobId,
    applicant: req.user._id,
    resumeUrl: req.body.resumeUrl,
    resumeText: extractedText
  });

  await newApplication.save();

  // 5. Send the success response to the frontend INSTANTLY
  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    data: newApplication
  });

  // 6. Fire-and-Forget Emails (Dynamic Routing)
  
  // Email the Student (Confirmation)
  sendEmail({
    email: req.user.email,
    subject: `Application Received: ${job.title} at ${job.company}`,
    message: `Hello ${req.user.name},\n\nYour job application and resume for the ${job.title} position have been successfully submitted.`
  }).catch(err => console.error("Student email failed:", err));

  // Email the Recruiter (Notification)
  if (job.postedBy && job.postedBy.email) {
    sendEmail({
      email: job.postedBy.email,
      subject: `New Applicant: ${job.title}`,
      message: `Hello ${job.postedBy.name},\n\nA new student (${req.user.name}) has just applied for your ${job.title} posting. Log in to your dashboard to review their resume.`
    }).catch(err => console.error("Recruiter email failed:", err));
  }
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
    .populate('applicant', 'name email skills cgpa'); 

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
  
  // 1. Find application and populate job AND applicant for email routing
  const application = await Application.findById(req.params.id)
    .populate('job', 'title company postedBy')
    .populate('applicant', 'name email');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // 2. SECURITY FIX: Verify Authorization (The Ownership Check)
  if (application.job.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update applications for this job');
  }

  // 3. Update the status safely
  application.status = status;
  
  if (interviewDate && status === 'Interview') {
    application.interviewDate = interviewDate;
  }

  await application.save();

  // 4. Trigger the interview notification email
  if (status === 'Interview' && interviewDate) {
    const formattedDate = new Date(interviewDate).toLocaleString('en-IN', {
      weekday: 'short', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit'
    });

    sendEmail({
      email: application.applicant.email,
      subject: `Interview Scheduled: ${application.job.company}`,
      message: `Hello ${application.applicant.name},\n\nGreat news! ${application.job.company} has scheduled a technical round for the ${application.job.title} role.\n\nScheduled for: ${formattedDate}\n\nPlease check your student dashboard for details.`
    }).catch(err => console.error("Interview email failed:", err));
  }

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
    { $match: { job: {$in: jobIds } } },
    { $group: { _id: '$status', count: {$sum: 1 } } }
  ]);
  const pipelineData = statusCounts.map(stat => ({
    name: stat._id || 'Applied',
    value: stat.count
  }));

  const applicantStats = await Application.aggregate([
    { $match: { job: {$in: jobIds } } },
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
  const applications = await Application.find({ applicant: req.user._id })
    .populate('job', 'title company location') 
    .sort('-createdAt'); 

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications
  });
});