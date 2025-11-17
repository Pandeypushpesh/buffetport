/**
 * Express Rate Limit Configuration Examples
 * 
 * This file shows different rate limiting configurations for the /api/send-resume endpoint
 */

import rateLimit from 'express-rate-limit';

// ============================================
// Example 1: Basic Rate Limiter (5 per hour)
// ============================================
export const resumeRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
  max: 5, // Limit each IP to 5 requests per hour
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Maximum 5 requests per hour per IP.',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// ============================================
// Example 2: Rate Limiter with Custom Key Generator
// ============================================
export const resumeRateLimiterWithEmail = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  // Limit by both IP and email address
  keyGenerator: (req) => {
    const email = req.body?.email?.trim().toLowerCase() || '';
    return `${req.ip}:${email}`;
  },
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Maximum 5 requests per hour per email address.',
  },
  standardHeaders: true,
});

// ============================================
// Example 3: Rate Limiter with Skip Options
// ============================================
export const resumeRateLimiterSkipFailed = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: false, // Count successful requests
  skipFailedRequests: true, // Don't count failed requests (400, 500, etc.)
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded.',
  },
});

// ============================================
// Example 4: Rate Limiter with Store (Redis for production)
// ============================================
/*
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

export const resumeRateLimiterRedis = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:resume:',
  }),
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded.',
  },
});
*/

// ============================================
// Example 5: Rate Limiter with Custom Handler
// ============================================
export const resumeRateLimiterCustom = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    // Log rate limit violation
    console.warn('Rate limit exceeded:', {
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString(),
    });

    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Maximum 5 requests per hour.',
      retryAfter: Math.ceil(60 * 60 / 1000), // seconds
    });
  },
  standardHeaders: true,
});

// ============================================
// Example 6: Different Limits for Different Environments
// ============================================
export const getResumeRateLimiter = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: isProduction ? 5 : 10, // More lenient in development
    message: {
      error: 'Too many requests',
      message: `Rate limit exceeded. Maximum ${isProduction ? 5 : 10} requests per hour.`,
    },
    standardHeaders: true,
  });
};

// ============================================
// Usage in Express App
// ============================================
/*
import express from 'express';
import { resumeRateLimiter } from './SECURITY_RATE_LIMIT_EXAMPLE.js';

const app = express();

// Apply rate limiter to specific endpoint
app.post('/api/send-resume', resumeRateLimiter, async (req, res) => {
  // Your endpoint logic here
});

// Or apply to multiple endpoints
app.use('/api/send-resume', resumeRateLimiter);
app.use('/api/contact', resumeRateLimiter);
*/

