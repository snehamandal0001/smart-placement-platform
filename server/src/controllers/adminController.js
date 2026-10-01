import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

// @desc    Get global stats for TPO dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getGlobalStats = asyncHandler(async (req, res) => {
  // 1. Get raw counts
  const [studentCount, recruiterCount, jobCount, applicationCount] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'recruiter' }),
    Job.countDocuments(),
    Application.countDocuments()
  ]);

  // 2. Calculate Placement Percentage
  const placedApplications = await Application.find({ status: 'Offered' }).distinct('applicant');
  const placedCount = placedApplications.length;
  const placementPercentage = studentCount === 0 ? 0 : Math.round((placedCount / studentCount) * 100);

  // 3. Fetch user directories
  const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
  const recruiters = await User.find({ role: 'recruiter' }).select('-password').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalStudents: studentCount,
        totalRecruiters: recruiterCount,
        totalJobs: jobCount,
        totalApplications: applicationCount,
        placementPercentage
      },
      students,
      recruiters
    }
  });
});

// @desc    Approve or Reject a recruiter
// @route   PUT /api/admin/recruiters/:id/status
// @access  Private/Admin
export const updateRecruiterStatus = asyncHandler(async (req, res) => {
  const { accountStatus } = req.body;
  const user = await User.findById(req.params.id);

  if (!user || user.role !== 'recruiter') {
    res.status(404);
    throw new Error('Recruiter not found');
  }

  user.accountStatus = accountStatus;
  await user.save();

  res.status(200).json({ success: true, data: user });
});