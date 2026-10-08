import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper function to generate JWT
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('FATAL ERROR: JWT_SECRET is not configured in environment variables.');
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', 
  });
};


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // 1. Validation: Ensure required fields are provided
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please add all required fields');
  }

  // 2. SECURITY PATCH: Block admin creation via public registration
  if (role === 'admin') {
    res.status(403);
    throw new Error('Forbidden: Admin accounts cannot be created through public registration.');
  }

  // 3. Strict Role Assignment: Force invalid roles to default to 'student'
  const assignedRole = role === 'recruiter' ? 'recruiter' : 'student';

  // 4. Check if the user already exists in the database
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400); 
    throw new Error('User already exists with this email');
  }

  // 5. Create the user safely using the sanitized role
  const user = await User.create({
    name,
    email,
    password, 
    role: assignedRole,
    accountStatus: assignedRole === 'recruiter' ? 'Pending' : 'Approved'
  });

  if (user) {
    if (user.role === 'recruiter') {
      res.status(201).json({
        success: true,
        message: 'Registration successful! Your account is pending TPO approval.',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      // Students get instantly logged in
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id) 
        }
      });
    }
  } else {
    res.status(400);
    throw new Error('Invalid user data received');
  }
});


// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Validation
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide both email and password');
  }

  // 2. Find the user 
  const user = await User.findOne({ email });

  // 3. Compare passwords using the exact method you wrote in User.js
  if (user && (await user.matchPassword(password))) {
    if (user.role === 'recruiter' && user.accountStatus !== 'Approved') {
      res.status(401);
      throw new Error(`Your account is ${user.accountStatus.toLowerCase()}. Please wait for TPO approval.`);
    }
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } else {
    res.status(401); 
    throw new Error('Invalid email or password');
  }
});

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private (Requires Token)
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});