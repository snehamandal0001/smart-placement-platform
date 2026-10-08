import { validationResult, check, param } from 'express-validator';

// 1. Core Error Checker
// This runs after the rules and throws a 400 error if any rule fails
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array().map(err => ({ field: err.path, message: err.msg })) 
    });
  }
  next();
};

// 2. Job Rules
export const validateJob = [
  check('title').notEmpty().withMessage('Job title is required'),
  check('company').notEmpty().withMessage('Company name is required'),
  check('location').notEmpty().withMessage('Location is required'),
  check('salary').notEmpty().withMessage('Salary is required'),
  check('description').notEmpty().withMessage('Description is required'),
  check('jobType').isIn(['Full-Time', 'Part-Time', 'Internship']).withMessage('Invalid job type'),
  check('requiredSkills').isArray().withMessage('Required skills must be an array'),
];

// 3. User Rules (Auth/Registration)
export const validateUser = [
  check('email').isEmail().withMessage('Please provide a valid email'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  // CGPA and skills are optional during initial signup, but validated if provided
  check('cgpa').optional().isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10'),
  check('skills').optional().isArray().withMessage('Skills must be an array')
];

// 4. Application Rules
export const validateApplication = [
  param('jobId').isMongoId().withMessage('Invalid Job ID format'),
  check('resumeUrl').optional().isURL().withMessage('Resume must be a valid URL')
];