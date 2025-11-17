import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import path from 'path';
import crypto from 'crypto';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create nodemailer transporter (OAuth2 or SMTP)
 * Uses same configuration as other email services
 */
const createTransporter = () => {
  // OAuth2 configuration (preferred)
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
 * Generate secure download link
 * Supports: S3 presigned URL, signed URL, or custom URL
 * 
 * @param {string} recipientEmail - Email for link generation
 * @returns {Promise<string>} - Secure download URL
 */
const generateDownloadLink = async (recipientEmail) => {
  // Option 1: AWS S3 Presigned URL
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET) {
    return await generateS3PresignedUrl(recipientEmail);
  }

  // Option 2: Signed URL (using crypto)
  if (process.env.DOWNLOAD_SECRET) {
    return generateSignedUrl(recipientEmail);
  }

  // Option 3: Simple token-based URL (for development)
  return generateTokenUrl(recipientEmail);
};

/**
 * Generate AWS S3 Presigned URL
 * Requires: aws-sdk package
 */
const generateS3PresignedUrl = async (recipientEmail) => {
  try {
    // Dynamic import for optional dependency
    const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3');
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: process.env.AWS_S3_KEY || 'resume.pdf',
    });

    // Generate presigned URL (expires in 7 days)
    const expiresIn = parseInt(process.env.LINK_EXPIRY_SECONDS || '604800', 10); // 7 days default
    const url = await getSignedUrl(s3Client, command, { expiresIn });

    return url;
  } catch (error) {
    console.error('Error generating S3 presigned URL:', error);
    throw new Error('Failed to generate download link');
  }
};

/**
 * Generate signed URL using crypto (no external dependencies)
 * Uses HMAC to sign the URL with recipient email and expiry
 */
const generateSignedUrl = (recipientEmail) => {
  
  const baseUrl = process.env.DOWNLOAD_BASE_URL || 'https://your-domain.com';
  const secret = process.env.DOWNLOAD_SECRET;
  const expiresIn = parseInt(process.env.LINK_EXPIRY_SECONDS || '604800', 10); // 7 days
  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

  // Create token: email + expiry timestamp
  const tokenData = `${recipientEmail}:${expiresAt}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(tokenData)
    .digest('hex');

  // URL format: /download?email=...&expires=...&sig=...
  const params = new URLSearchParams({
    email: recipientEmail,
    expires: expiresAt.toString(),
    sig: signature,
  });

  return `${baseUrl}/api/download-resume?${params.toString()}`;
};

/**
 * Generate simple token-based URL (development only)
 */
const generateTokenUrl = (recipientEmail) => {
  const baseUrl = process.env.DOWNLOAD_BASE_URL || 'http://localhost:5000';
  const token = Buffer.from(`${recipientEmail}:${Date.now()}`).toString('base64');
  return `${baseUrl}/api/download-resume?token=${token}`;
};

/**
 * Send resume via email with download link (no attachment)
 * 
 * @param {string} recipientEmail - Email address of the recipient
 * @returns {Promise<Object>} - Result object with success status and message
 */
export const sendResumeByEmailWithLink = async (recipientEmail) => {
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

    // Generate secure download link
    console.log('Generating secure download link...');
    const downloadUrl = await generateDownloadLink(recipientEmail);
    console.log('✅ Download link generated');

    // Prepare email content
    const senderName = process.env.SENDER_NAME || 'Portfolio Owner';
    const emailSubject = process.env.EMAIL_SUBJECT || 'Your Requested Resume';
    const linkExpiryHours = parseInt(process.env.LINK_EXPIRY_SECONDS || '604800', 10) / 3600;

    // Plain text email
    const textBody = process.env.EMAIL_TEXT || 
      `Hello,\n\n` +
      `Thank you for your interest in my work.\n\n` +
      `You can download my resume using this secure link:\n` +
      `${downloadUrl}\n\n` +
      `This link will expire in ${linkExpiryHours} hours.\n\n` +
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
    .button { display: inline-block; padding: 12px 24px; background-color: #0d47a1; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .button:hover { background-color: #1565c0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
    .link { word-break: break-all; color: #0d47a1; }
  </style>
</head>
<body>
  <div class="container">
    <p>Hello,</p>
    <p>Thank you for your interest in my work.</p>
    <p>You can download my resume using the secure link below:</p>
    <p style="text-align: center;">
      <a href="${downloadUrl}" class="button">Download Resume</a>
    </p>
    <p style="font-size: 12px; color: #666;">
      Or copy this link: <span class="link">${downloadUrl}</span>
    </p>
    <p style="font-size: 12px; color: #666;">
      This link will expire in ${linkExpiryHours} hours.
    </p>
    <p>If you have any questions, please don't hesitate to reach out.</p>
    <p>Best regards,<br><strong>${senderName}</strong></p>
    <div class="footer">
      <p>This is an automated email. Please do not reply directly to this message.</p>
    </div>
  </div>
</body>
</html>`;

    // Configure mail options (NO attachment)
    const mailOptions = {
      from: `"${senderName}" <${process.env.FROM_EMAIL}>`,
      to: recipientEmail,
      subject: emailSubject,
      text: textBody,
      html: htmlBody,
      // No attachments - just the download link
    };

    // Send email
    console.log(`Sending email with download link to: ${recipientEmail}`);
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Download link:', downloadUrl);

    return {
      success: true,
      messageId: info.messageId,
      message: 'Resume download link sent successfully! Check your email.',
      recipient: recipientEmail,
      downloadUrl: downloadUrl, // For logging/analytics
      method: 'download-link',
    };

  } catch (error) {
    console.error('❌ Error sending email with download link:', error);
    throw error;
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
};

