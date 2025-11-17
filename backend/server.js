import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { sendResumeByEmail } from './services/emailService.js';

dotenv.config();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting for resume endpoint
const resumeRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Maximum 5 requests per hour per IP.',
  }
});

// General rate limiter
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Apply general rate limiter
app.use('/api', apiRateLimiter);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Portfolio API' });
});

// Send Resume Endpoint
app.post('/api/send-resume', resumeRateLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const sanitizedEmail = email ? email.trim().toLowerCase() : '';

    if (!sanitizedEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address',
      });
    }

    const result = await sendResumeByEmail(sanitizedEmail);

    res.status(200).json({
      success: true,
      message: result.message || 'Resume sent successfully!',
      messageId: result.messageId,
    });

  } catch (error) {
    console.error('Error in /api/send-resume:', error.message);

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to send resume. Please try again later.',
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'This route does not exist',
  });
});

// ❌ REMOVE app.listen()
// Vercel automatically handles server creation

export default app;   // ✅ IMPORTANT FOR VERCEL
