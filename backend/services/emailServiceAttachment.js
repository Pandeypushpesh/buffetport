import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create nodemailer transporter (OAuth2 or SMTP)
 */
const createTransporter = () => {
  // OAuth2 configuration
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.FROM_EMAIL,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      },
    });
  }

  // SMTP fallback
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  throw new Error('No email configuration found. Set up OAuth2 or SMTP credentials.');
};

/**
 * Get resume file path and validate it exists
 */
const getResumePath = () => {
  const resumePath = path.join(__dirname, '..', 'assets', 'resume.pdf');
  
  if (!fs.existsSync(resumePath)) {
    throw new Error(
      `Resume file not found at: ${resumePath}. ` +
      'Please ensure resume.pdf exists in backend/assets/ directory.'
    );
  }

  // Check file size (warn if too large)
  const stats = fs.statSync(resumePath);
  const fileSizeMB = stats.size / (1024 * 1024);
  
  if (fileSizeMB > 10) {
    console.warn(`⚠️  Warning: Resume file is ${fileSizeMB.toFixed(2)}MB. Large attachments may be rejected by email providers.`);
  }

  return resumePath;
};

/**
 * Send resume as email attachment
 * 
 * @param {string} recipientEmail - Email address of the recipient
 * @returns {Promise<Object>} - Result object with success status and message
 */
export const sendResumeByEmailAttachment = async (recipientEmail) => {
  let transporter;

  try {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      throw new Error(`Invalid recipient email format: ${recipientEmail}`);
    }

    // Create transporter
    console.log('Creating email transporter...');
    transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email connection verified');

    // Get resume file
    console.log('Locating resume file...');
    const resumePath = getResumePath();
    console.log(`✅ Resume file found: ${resumePath}`);

    // Prepare email content
    const senderName = process.env.SENDER_NAME || 'Portfolio Owner';
    const emailSubject = process.env.EMAIL_SUBJECT || 'Your Requested Resume';

    // Plain text email
    const textBody = process.env.EMAIL_TEXT || 
      `Hello,\n\n` +
      `Thank you for your interest in my work. Please find my resume attached to this email.\n\n` +
      `If you have any questions, please don't hesitate to reach out.\n\n` +
      `Best regards,\n${senderName}`;

    // HTML email
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
    <p>If you have any questions, please don't hesitate to reach out.</p>
    <p>Best regards,<br><strong>${senderName}</strong></p>
    <div class="footer">
      <p>This is an automated email. Please do not reply directly to this message.</p>
    </div>
  </div>
</body>
</html>`;

    // Configure mail options WITH attachment
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

    // Send email
    console.log(`Sending email with attachment to: ${recipientEmail}`);
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Attachment: resume.pdf');

    return {
      success: true,
      messageId: info.messageId,
      message: 'Resume sent successfully! Check your email.',
      recipient: recipientEmail,
      method: 'attachment',
    };

  } catch (error) {
    console.error('❌ Error sending email with attachment:', error);
    throw error;
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
};

