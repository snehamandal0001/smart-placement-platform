import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  if (user) {
    res.status(200).json({ success: true, data: user });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Update fields if they are provided in the request
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.resumeUrl = req.body.resumeUrl !== undefined ? req.body.resumeUrl : user.resumeUrl;
    user.skills = req.body.skills || user.skills;
    user.cgpa = req.body.cgpa !== undefined ? req.body.cgpa : user.cgpa;

    if (req.body.password) {
      user.password = req.body.password; 
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        resumeUrl: updatedUser.resumeUrl,
        skills: updatedUser.skills,
        cgpa: updatedUser.cgpa
      }
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});