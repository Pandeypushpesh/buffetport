/**
 * Integration Tests for /api/send-resume endpoint
 * 
 * Run tests: npm test
 * Run with coverage: npm test -- --coverage
 */

import request from 'supertest';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { sendResumeByEmail } from './services/emailService.js';

// Mock email service to avoid actual email sending in tests
jest.mock('./services/emailService.js', () => ({
  sendResumeByEmail: jest.fn(),
}));

// Load test environment (use .env.test if exists, otherwise .env)
dotenv.config({ path: '.env.test' });
dotenv.config();

// Create test app (similar to server.js but for testing)
function createTestApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting (more lenient for tests)
  const testRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Higher limit for tests
    skip: (req) => {
      // Skip rate limiting for test requests
      return process.env.NODE_ENV === 'test';
    },
  });

  // Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
  });

  // Send Resume Endpoint
  app.post('/api/send-resume', testRateLimiter, async (req, res) => {
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
        return res.status(400).json({
          error: 'Invalid email format',
          message: 'Email contains invalid characters',
        });
      }

      // Call email service function (mocked in tests)
      const result = await sendResumeByEmail(sanitizedEmail);

      // Success response
      res.status(200).json({
        success: true,
        message: result.message || 'Resume sent successfully! Check your email.',
        messageId: result.messageId,
      });

    } catch (error) {
      console.error('Error in /api/send-resume:', {
        error: error.message,
        code: error.code,
      });

      if (error.message.includes('SMTP') || error.message.includes('authentication')) {
        return res.status(503).json({
          error: 'Service unavailable',
          message: 'Email service is currently unavailable. Please try again later.',
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to send resume. Please try again later.',
      });
    }
  });

  return app;
}

describe('POST /api/send-resume', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(() => {
    // Reset mock before each test
    jest.clearAllMocks();
    // Mock successful email send by default
    sendResumeByEmail.mockResolvedValue({
      success: true,
      message: 'Resume sent successfully! Check your email.',
      messageId: 'test-message-id-123',
    });
  });

  describe('Valid Email Requests - Returns 200', () => {
    test('should return 200 for valid email address', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: 'test@example.com' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('successfully');
      expect(sendResumeByEmail).toHaveBeenCalledWith('test@example.com');
    });

    test('should return 200 for valid email with subdomain', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: 'user@mail.example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(sendResumeByEmail).toHaveBeenCalledWith('user@mail.example.com');
    });

    test('should sanitize email (trim and lowercase)', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: '  Test@Example.COM  ' })
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should be called with sanitized email
      expect(sendResumeByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('Invalid Email Requests - Returns 400', () => {
    test('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email is required');
      expect(response.body).toHaveProperty('message');
      expect(sendResumeByEmail).not.toHaveBeenCalled();
    });

    test('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: 'not-an-email' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid email format');
      expect(response.body).toHaveProperty('message');
      expect(sendResumeByEmail).not.toHaveBeenCalled();
    });

    test('should return 400 for email without domain', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: 'test@' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(sendResumeByEmail).not.toHaveBeenCalled();
    });

    test('should return 400 for email without @ symbol', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: 'testexample.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(sendResumeByEmail).not.toHaveBeenCalled();
    });

    test('should return 400 for email with invalid characters', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: 'test<script>@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid email format');
      expect(sendResumeByEmail).not.toHaveBeenCalled();
    });

    test('should return 400 for email longer than 254 characters', async () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: longEmail })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid email');
      expect(sendResumeByEmail).not.toHaveBeenCalled();
    });

    test('should return 400 for empty string email', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email is required');
      expect(sendResumeByEmail).not.toHaveBeenCalled();
    });

    test('should return 400 for whitespace-only email', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: '   ' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email is required');
      expect(sendResumeByEmail).not.toHaveBeenCalled();
    });
  });

  describe('Response Format', () => {
    test('should return JSON response with correct structure on success', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.any(String),
      });
    });

    test('should return JSON response with error structure on failure', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: 'invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });
  });
});

