import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import bcrypt from 'bcryptjs';

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

  // 2. Check if the user already exists in the database
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400); // 400 Bad Request
    throw new Error('User already exists with this email');
  }

  // 3. Hash the password
  // A "salt" is a random string added to the password before hashing to make it truly unique
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 4. Create the new user in MongoDB
  const user = await User.create({
    name,
    email,
    password: hashedPassword, // Save the scrambled password, not the real one!
    role
  });

  // 5. Send a success response
  if (user) {
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
        // Notice we do NOT send the password back in the response!
      }
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data received');
  }
});