/**
 * Send Resume Endpoint
 * POST /api/send-resume
 */

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email service function (inline to avoid import issues)
const createTransporter = () => {
  const requiredVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}. ` +
      'Please check your environment variables in Vercel dashboard.'
    );
  }

  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
};

const getResumePath = () => {
  // Try multiple possible paths for resume file
  const possiblePaths = [
    path.join(__dirname, '..', 'backend', 'assets', 'resume.pdf'),
    path.join(process.cwd(), 'backend', 'assets', 'resume.pdf'),
    path.join('/tmp', 'resume.pdf'), // For serverless environments
  ];

  for (const resumePath of possiblePaths) {
    if (fs.existsSync(resumePath)) {
      return resumePath;
    }
  }

  // If resume not found, throw error
  throw new Error(
    'Resume file not found. Please ensure resume.pdf exists in backend/assets/ ' +
    'or upload it to cloud storage and update the email service.'
  );
};

const sendResumeByEmail = async (recipientEmail) => {
  let transporter;

  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      throw new Error(`Invalid recipient email format: ${recipientEmail}`);
    }

    console.log('Creating SMTP transporter...');
    transporter = createTransporter();

    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    console.log('Locating resume file...');
    let resumePath;
    try {
      resumePath = getResumePath();
      console.log(`Resume file found at: ${resumePath}`);
    } catch (error) {
      console.warn('Resume file not found locally. Consider using cloud storage.');
      // Continue without attachment - you can modify this behavior
      throw new Error('Resume file not available. Please configure resume storage.');
    }

    const senderName = process.env.SENDER_NAME || 'Portfolio Owner';
    const emailSubject = process.env.EMAIL_SUBJECT || 'Your Requested Resume';
    
    const textBody = process.env.EMAIL_TEXT || 
      `Hello,\n\n` +
      `Thank you for your interest in my work. Please find my resume attached to this email.\n\n` +
      `If you have any questions or would like to discuss opportunities, please don't hesitate to reach out.\n\n` +
      `Best regards,\n${senderName}`;

    const htmlBody = process.env.EMAIL_HTML || 
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <p>Hello,</p>
    <p>Thank you for your interest in my work. Please find my resume attached to this email.</p>
    <p>If you have any questions or would like to discuss opportunities, please don't hesitate to reach out.</p>
    <p>Best regards,<br><strong>${senderName}</strong></p>
    <div class="footer">
      <p>This is an automated email. Please do not reply directly to this message.</p>
    </div>
  </div>
</body>
</html>`;

    const mailOptions = {
      from: `"${senderName}" <${process.env.FROM_EMAIL}>`,
      to: recipientEmail,
      subject: emailSubject,
      text: textBody,
      html: htmlBody,
      attachments: [
        {
          filename: 'resume.pdf',
          path: resumePath,
          contentType: 'application/pdf',
        },
      ],
    };

    console.log(`Sending email to: ${recipientEmail}`);
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
      message: 'Resume sent successfully! Check your email.',
      recipient: recipientEmail,
    };

  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    
    if (error.code === 'EAUTH') {
      throw new Error('SMTP authentication failed. Please verify your SMTP credentials.');
    }
    
    if (error.code === 'ECONNECTION') {
      throw new Error('Failed to connect to SMTP server. Please check your SMTP settings.');
    }

    throw new Error(`Failed to send email: ${error.message}`);
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
};

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
}, 60 * 60 * 1000);

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

    if (error.message.includes('Resume file not')) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Resume file not available. Please contact the site administrator.'
      });
    }

    return res.status(500).json({
      error: 'Internal  error',
      message: 'Failed to send resume. Please try again later.'
    });
  }
}
