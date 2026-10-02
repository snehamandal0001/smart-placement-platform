import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js'; 
import { validateUser, validateRequest } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/register', 
  validateUser, 
  validateRequest, 
  registerUser
);
router.post('/login', loginUser);

// Route: GET /api/auth/me
router.get('/me', protect, getMe); 

export default router;