import express from 'express';
import { registerUser } from '../controllers/authController.js';

const router = express.Router();

// Route: POST /api/auth/register
router.post('/register', registerUser);

export default router;