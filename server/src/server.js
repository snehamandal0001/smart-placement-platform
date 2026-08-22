import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load variables from .env
dotenv.config();

// Create the Express application instance
const app = express();

// Read port from .env or fallback to 5000
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(cors()); // Allow requests from other origins (like React frontend)
app.use(express.json()); // Allow Express to parse incoming JSON in request bodies

// First API Route: Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Placement Platform API is up and running!',
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});