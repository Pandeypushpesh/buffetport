import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create and configure nodemailer transporter using Gmail OAuth2
 * Uses OAuth2 credentials from environment variables
 * @returns {nodemailer.Transporter} Configured transporter with OAuth2
 */
const createOAuth2Transporter = () => {
  // Validate required OAuth2 environment variables
  const requiredVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'FROM_EMAIL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required OAuth2 environment variables: ${missingVars.join(', ')}. ` +
      'Please check your .env file. See EMAIL_SETUP.md for OAuth2 setup instructions.'
    );
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.FROM_EMAIL,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      // Access token is automatically generated from refresh token
    },
  });
};

/**
 * Verify that resume PDF file exists
 * @returns {string} Path to resume file
 * @throws {Error} If file doesn't exist
 */
const getResumePath = () => {
  const resumePath = path.join(__dirname, '..', 'assets', 'resume.pdf');
  
  if (!fs.existsSync(resumePath)) {
    throw new Error(
      `Resume file not found at: ${resumePath}. ` +
      'Please ensure resume.pdf exists in backend/assets/ directory.'
    );
  }

  return resumePath;
};

/**
 * Send resume PDF via email using Nodemailer with Gmail OAuth2
 * 
 * @param {string} recipientEmail - Email address of the recipient
 * @returns {Promise<Object>} - Result object with success status, messageId, and message
 * @throws {Error} - If email sending fails
 * 
 * @example
 * try {
 *   const result = await sendResumeByEmailOAuth2('visitor@example.com');
 *   console.log('Success:', result.message);
 * } catch (error) {
 *   console.error('Failed:', error.message);
 * }
 */
export const sendResumeByEmailOAuth2 = async (recipientEmail) => {
  let transporter;

  try {
    // Step 1: Validate recipient email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      throw new Error(`Invalid recipient email format: ${recipientEmail}`);
    }

    // Step 2: Create OAuth2 transporter
    console.log('Creating Gmail OAuth2 transporter...');
    transporter = createOAuth2Transporter();

    // Step 3: Verify OAuth2 connection
    console.log('Verifying OAuth2 connection...');
    await transporter.verify();
    console.log('✅ OAuth2 connection verified successfully');

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
    console.log('✅ Email sent successfully via OAuth2!');
    console.log('   Message ID:', info.messageId);
    console.log('   Recipient:', recipientEmail);
    console.log('   Response:', info.response);

    return {
      success: true,
      messageId: info.messageId,
      message: 'Resume sent successfully! Check your email.',
      recipient: recipientEmail,
      method: 'OAuth2',
    };

  } catch (error) {
    // Comprehensive error handling and logging
    console.error('❌ Error sending email via OAuth2:');
    console.error('   Recipient:', recipientEmail);
    
    // Handle specific OAuth2 errors
    if (error.code) {
      console.error('   Error Code:', error.code);
      
      switch (error.code) {
        case 'EAUTH':
          console.error('   Issue: OAuth2 authentication failed');
          throw new Error(
            'OAuth2 authentication failed. Please verify your GOOGLE_CLIENT_ID, ' +
            'GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN in .env file. ' +
            'The refresh token may have expired or been revoked.'
          );
        
        case 'ECONNECTION':
          console.error('   Issue: Failed to connect to Gmail');
          throw new Error(
            'Failed to connect to Gmail SMTP server. Please check your network connection.'
          );
        
        case 'ETIMEDOUT':
          console.error('   Issue: Connection timeout');
          throw new Error(
            'Gmail connection timed out. Please check your network connection.'
          );
        
        case 'EENVELOPE':
          console.error('   Issue: Invalid email envelope');
          throw new Error('Invalid email address format.');
        
        default:
          console.error('   Issue: Unknown Nodemailer error');
      }
    }

    // Handle OAuth2-specific errors
    if (error.message && error.message.includes('invalid_grant')) {
      console.error('   Issue: Invalid or expired refresh token');
      throw new Error(
        'Refresh token is invalid or expired. Please generate a new refresh token. ' +
        'See EMAIL_SETUP.md for instructions.'
      );
    }

    if (error.message && error.message.includes('invalid_client')) {
      console.error('   Issue: Invalid OAuth2 client credentials');
      throw new Error(
        'Invalid OAuth2 client credentials. Please verify GOOGLE_CLIENT_ID and ' +
        'GOOGLE_CLIENT_SECRET in your .env file.'
      );
    }

    // Handle file system errors
    if (error.code === 'ENOENT') {
      console.error('   Issue: Resume file not found');
      throw new Error(
        'Resume file not found. Please ensure resume.pdf exists in backend/assets/ directory.'
      );
    }

    // Handle validation errors
    if (error.message && error.message.includes('Missing required')) {
      console.error('   Issue: Missing environment variables');
      throw error; // Re-throw as-is since it has helpful message
    }

    // Log full error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('   Full Error:', error);
    }

    // Generic error fallback
    throw new Error(
      `Failed to send email via OAuth2: ${error.message || 'Unknown error occurred'}`
    );
  } finally {
    // Close transporter connection if it was created
    if (transporter) {
      transporter.close();
    }
  }
};

