/**
 * Integration Tests for /api/send-resume endpoint
 * 
 * Run tests: npm test
 * Run with coverage: npm test -- --coverage
 */

import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Import app setup (you may need to export app from server.js)
// For now, we'll create a test server setup
import { createApp } from '../server.js';

describe('POST /api/send-resume', () => {
  let app;

  beforeAll(() => {
    // Create app instance for testing
    app = createApp();
  });

  describe('Valid Email Requests', () => {
    test('should return 200 for valid email address', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: 'test@example.com' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('successfully');
    });

    test('should return 200 for valid email with subdomain', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: 'user@mail.example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should sanitize email (trim and lowercase)', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: '  Test@Example.COM  ' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Invalid Email Requests', () => {
    test('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    test('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: 'not-an-email' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid email');
    });

    test('should return 400 for email without domain', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: 'test@' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 for email without @ symbol', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: 'testexample.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 for email with invalid characters', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: 'test<script>@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 for email longer than 254 characters', async () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: longEmail })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 for empty string email', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 400 for whitespace-only email', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: '   ' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limit after 5 requests', async () => {
      const validEmail = 'ratelimit@example.com';
      
      // Make 5 successful requests
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/send-resume')
          .send({ email: validEmail })
          .expect(200);
      }

      // 6th request should be rate limited
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: validEmail })
        .expect(429);

      expect(response.body).toHaveProperty('error', 'Too many requests');
    }, 10000); // Increase timeout for rate limit test
  });

  describe('Response Format', () => {
    test('should return JSON response with correct structure on success', async () => {
      const response = await request(app)
        .post('/api/send-resume')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body).toMatchObject({
        success: expect.any(Boolean),
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

