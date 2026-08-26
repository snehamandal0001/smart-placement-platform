import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js'; // <-- Import middleware

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Route: GET /api/auth/me
// Notice how `protect` sits in the middle. It runs first!
router.get('/me', protect, getMe); 

export default router;