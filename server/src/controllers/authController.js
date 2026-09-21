import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d', 
  });
};


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validation: Ensure required fields are provided
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please add all required fields');
  }

  // Check if the user already exists in the database
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400); 
    throw new Error('User already exists with this email');
  }

  //  Create the new user in MongoDB
  const user = await User.create({
    name,
    email,
    password, 
  });

  // Send a success response WITH the token so they are instantly logged in
  if (user) {
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