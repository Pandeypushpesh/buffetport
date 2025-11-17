import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { sendResumeByEmail } from './services/emailService.js';

dotenv.config();

const app = express();

// CORS Configuration
// Automatically detects frontend in production via FRONTEND_URL environment variable
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting Middleware
// Limits: 5 requests per hour per IP for resume endpoint
const resumeRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per hour
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Maximum 5 requests per hour per IP.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests (including successful ones)
  skipFailedRequests: false, // Count failed requests too
});

// General API rate limiter (more lenient)
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

// Apply general rate limiter to all requests
app.use('/api', apiRateLimiter);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Portfolio API' });
});

// Send Resume Endpoint with rate limiting
app.post('/api/send-resume', resumeRateLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    // Input sanitization: trim and normalize email
    const sanitizedEmail = email ? email.trim().toLowerCase() : '';

    // Validate email presence
    if (!sanitizedEmail) {
      return res.status(400).json({
        error: 'Email is required',
        message: 'Please provide an email address',
      });
    }

    // Validate email format (syntactic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      // Log security event (no sensitive data)
      console.warn('Invalid email format attempted:', {
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address',
      });
    }

    // Additional validation: email length (RFC 5321 limit)
    if (sanitizedEmail.length > 254) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Email address is too long',
      });
    }

    // Additional validation: prevent common injection patterns
    if (/[<>\"'%;()&+]/.test(sanitizedEmail)) {
      console.warn('Suspicious email pattern detected:', {
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Email contains invalid characters',
      });
    }

    // Call email service function (use sanitized email)
    const result = await sendResumeByEmail(sanitizedEmail);

    // Success response
    res.status(200).json({
      success: true,
      message: result.message || 'Resume sent successfully! Check your email.',
      messageId: result.messageId,
    });

  } catch (error) {
    // Secure error logging: never log credentials or sensitive data
    console.error('Error in /api/send-resume:', {
      error: error.message,
      code: error.code,
      ip: req.ip,
      timestamp: new Date().toISOString(),
      // Explicitly NOT logging: email, passwords, tokens, or any sensitive data
    });

    // Handle specific error types
    if (error.message.includes('SMTP') || error.message.includes('authentication')) {
      // Log security event without exposing details
      console.warn('Email service authentication issue:', {
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Email service is currently unavailable. Please try again later.',
      });
    }

    // Generic server error (don't expose internal error details)
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to send resume. Please try again later.',
    });
  }
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: isDevelopment ? err.message : 'An unexpected error occurred',
    ...(isDevelopment && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist',
  });
});

// ✅ Export app for Vercel (DO NOT use app.listen())
export default app;

