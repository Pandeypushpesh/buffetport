/**
 * Send Resume Endpoint
 * POST /api/send-resume
 */

import { sendResumeByEmail } from '../backend/services/emailService.js';

// Simple in-memory rate limiting (for serverless)
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const max = 5;

  const key = ip;
  const record = rateLimitMap.get(key);

  if (!record) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= max) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour

export default async function handler(req, res) {
  // CORS headers
  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000'
  ].filter(Boolean);

  if (origin && (allowedOrigins.includes(origin) || process.env.FRONTEND_URL === '*')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Rate limiting
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                    req.headers['x-real-ip'] || 
                    req.connection?.remoteAddress || 
                    'unknown';

    if (!checkRateLimit(clientIP)) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Maximum 5 requests per hour per IP.'
      });
    }

    // Validate email
    const { email } = req.body;
    const sanitizedEmail = email ? email.trim().toLowerCase() : '';

    if (!sanitizedEmail) {
      return res.status(400).json({
        error: 'Email is required',
        message: 'Please provide an email address'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    // Email length validation
    if (sanitizedEmail.length > 254) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Email address is too long'
      });
    }

    // Prevent injection patterns
    if (/[<>\"'%;()&+]/.test(sanitizedEmail)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Email contains invalid characters'
      });
    }

    // Send email
    const result = await sendResumeByEmail(sanitizedEmail);

    return res.status(200).json({
      success: true,
      message: result.message || 'Resume sent successfully! Check your email.',
      messageId: result.messageId
    });

  } catch (error) {
    console.error('Error in /api/send-resume:', {
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });

    // Handle specific error types
    if (error.message.includes('SMTP') || error.message.includes('authentication')) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Email service is currently unavailable. Please try again later.'
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to send resume. Please try again later.'
    });
  }
}
