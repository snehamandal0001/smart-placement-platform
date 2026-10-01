import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

// @desc    Get global stats for TPO dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getGlobalStats = asyncHandler(async (req, res) => {
  // Fire all 4 database queries at the exact same time for maximum speed
  const [studentCount, recruiterCount, jobCount, applicationCount] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'recruiter' }),
    Job.countDocuments(),
    Application.countDocuments()
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalStudents: studentCount,
      totalRecruiters: recruiterCount,
      totalJobs: jobCount,
      totalApplications: applicationCount
    }
  });
});