import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jobRoutes from './routes/jobRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middlewares (Top of file)
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/jobs', jobRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Placement Platform API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// --- Error Handling Middlewares (MUST BE AT THE BOTTOM) ---
app.use(notFound);      // Catches undefined routes
app.use(errorHandler);  // Formats all errors into clean JSON

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});