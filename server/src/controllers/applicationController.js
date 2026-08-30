import Application from '../models/Application.js';
import Job from '../models/Job.js';
import asyncHandler from '../middleware/asyncHandler.js';
import sendEmail from '../utils/sendEmail.js';

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

  // // 3. Create the application
  // const newApplication = await Application.create({
  //   job: jobId,
  //   applicant: req.user._id,
  //   resumeUrl: req.body.resumeUrl //|| '' 
  // });

  // await newApplication.save();
  
  // try {

  //     const testEmailDestination = 'snehamandal0415@gmail.com';
  //     console.log("1. Attempting to send email to:", testEmailDestination);
 
  //   // For testing !
  //   await sendEmail({
  //     email: testEmailDestination , 

  //    // email: req.user.email,  
  //     subject: 'Application Received - PlacementHub',
  //     message: `Hello ${req.user.name},\n\nYour job application and resume have been successfully submitted to the recruiter.\n\nBest of luck,\nThe PlacementHub Team`
  //   });
  //   console.log(`✅ Success! Email delivered to ${testEmailDestination}`);

  // } catch (error) {
  //   console.log("3. Nodemailer caught an error:");
  //   console.error('Email sending failed:', error);
  // }

  // res.status(201).json({
  //   success: true,
  //   message: 'Application submitted successfully',
  //   data: newApplication
  // });



  // 3. Create the application
  const newApplication = await Application.create({
    job: jobId,
    applicant: req.user._id,
    resumeUrl: req.body.resumeUrl
  });

  await newApplication.save();

  // 4. Send the success response to the frontend INSTANTLY
  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    data: newApplication
  });

  // 5. Fire-and-Forget Email: Notice there is NO 'await' keyword here!
  // The server will handle this in the background after the user already sees success.

  const testEmailDestination = 'snehamandal0415@gmail.com';

  sendEmail({
    email: testEmailDestination,
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