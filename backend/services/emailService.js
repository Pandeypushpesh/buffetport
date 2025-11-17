import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create and configure nodemailer transporter
 * Uses SMTP credentials from environment variables
 * @returns {nodemailer.Transporter} Configured transporter
 */
const createTransporter = () => {
  // Validate required environment variables
  const requiredVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}. ` +
      'Please check your .env file.'
    );
  }

  // Determine if connection should be secure (TLS/SSL)
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = port === 465; // Port 465 uses SSL, others use STARTTLS

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS, // Using SMTP_PASS as specified
    },
    // Additional options for better compatibility
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production', // Reject unauthorized certs in production
    },
  });
};

/**
 * Verify that resume PDF file exists
 * @returns {string} Path to resume file
 * @throws {Error} If file doesn't exist
 */
const getResumePath = () => {
  // Try multiple possible paths for resume file (Vercel-compatible)
  const possiblePaths = [
    path.join(__dirname, '..', 'assets', 'resume.pdf'), // Local development
    path.join(process.cwd(), 'assets', 'resume.pdf'), // Vercel serverless
    path.join('/tmp', 'resume.pdf'), // Alternative serverless path
  ];

  for (const resumePath of possiblePaths) {
    if (fs.existsSync(resumePath)) {
      return resumePath;
    }
  }

  // If resume not found, throw error with helpful message
  throw new Error(
    `Resume file not found. Tried paths: ${possiblePaths.join(', ')}. ` +
    'Please ensure resume.pdf exists in backend/assets/ directory or upload to cloud storage.'
  );
};

/**
 * Send resume PDF via email using Nodemailer
 * 
 * @param {string} recipientEmail - Email address of the recipient
 * @returns {Promise<Object>} - Result object with success status, messageId, and message
 * @throws {Error} - If email sending fails
 * 
 * @example
 * try {
 *   const result = await sendResumeByEmail('visitor@example.com');
 *   console.log('Success:', result.message);
 * } catch (error) {
 *   console.error('Failed:', error.message);
 * }
 */
export const sendResumeByEmail = async (recipientEmail) => {
  let transporter;

  try {
    // Step 1: Validate recipient email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      throw new Error(`Invalid recipient email format: ${recipientEmail}`);
    }

    // Step 2: Create transporter with SMTP credentials
    console.log('Creating SMTP transporter...');
    transporter = createTransporter();

    // Step 3: Verify SMTP connection (optional but recommended)
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    // Step 4: Get resume file path
    console.log('Locating resume file...');
    const resumePath = getResumePath();
    console.log(`Resume file found at: ${resumePath}`);

    // Step 5: Prepare email content
    const senderName = process.env.SENDER_NAME || 'Portfolio Owner';
    const emailSubject = process.env.EMAIL_SUBJECT || 'Your Requested Resume';
    
    // Plain text email body
    const textBody = process.env.EMAIL_TEXT || 
      `Hello,\n\n` +
      `Thank you for your interest in my work. Please find my resume attached to this email.\n\n` +
      `If you have any questions or would like to discuss opportunities, please don't hesitate to reach out.\n\n` +
      `Best regards,\n${senderName}`;

    // HTML email body
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

    // Step 6: Configure mail options
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

    // Step 7: Send email
    console.log(`Sending email to: ${recipientEmail}`);
    const info = await transporter.sendMail(mailOptions);

    // Step 8: Log success and return result
    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Recipient:', recipientEmail);
    console.log('   Response:', info.response);

    return {
      success: true,
      messageId: info.messageId,
      message: 'Resume sent successfully! Check your email.',
      recipient: recipientEmail,
    };

  } catch (error) {
    // Comprehensive error handling and logging
    console.error('❌ Error sending email:');
    console.error('   Recipient:', recipientEmail);
    
    // Handle specific Nodemailer error codes
    if (error.code) {
      console.error('   Error Code:', error.code);
      
      switch (error.code) {
        case 'EAUTH':
          console.error('   Issue: SMTP authentication failed');
          throw new Error(
            'SMTP authentication failed. Please verify your SMTP_USER and SMTP_PASS credentials in .env file.'
          );
        
        case 'ECONNECTION':
          console.error('   Issue: Failed to connect to SMTP server');
          throw new Error(
            `Failed to connect to SMTP server (${process.env.SMTP_HOST}:${process.env.SMTP_PORT}). ` +
            'Please check your SMTP_HOST and SMTP_PORT settings.'
          );
        
        case 'ETIMEDOUT':
          console.error('   Issue: Connection timeout');
          throw new Error(
            'SMTP connection timed out. Please check your network connection and SMTP settings.'
          );
        
        case 'EENVELOPE':
          console.error('   Issue: Invalid email envelope');
          throw new Error('Invalid email address format.');
        
        default:
          console.error('   Issue: Unknown Nodemailer error');
      }
    }

    // Handle file system errors
    if (error.code === 'ENOENT') {
      console.error('   Issue: Resume file not found');
      throw new Error(
        'Resume file not found. Please ensure resume.pdf exists in backend/assets/ directory.'
      );
    }

    // Handle validation errors
    if (error.message.includes('Missing required environment variables')) {
      console.error('   Issue: Missing environment variables');
      throw error; // Re-throw as-is since it has helpful message
    }

    // Log full error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('   Full Error:', error);
    }

    // Generic error fallback
    throw new Error(
      `Failed to send email: ${error.message || 'Unknown error occurred'}`
    );
  } finally {
    // Close transporter connection if it was created
    if (transporter) {
      transporter.close();
    }
  }
};
