/**
 * Send Resume Endpoint
 * POST /api/send-resume
 */

import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- CONFIGURATION CONSTANTS ---
const SENDER_NAME_DEFAULT = "Portfolio Owner";
const EMAIL_SUBJECT_DEFAULT = "Your Requested Resume";
const RESUME_FILENAME = "resume.pdf";
const FRONTEND_URL_PRODUCTION = "https://portpushpesh.netlify.app"; // <--- **YOUR FRONTEND URL ADDED**

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- HELPER FUNCTIONS ---

/**
 * Creates and returns the Nodemailer transporter.
 */
const createTransporter = () => {
  const requiredVars = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "FROM_EMAIL"];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}. ` +
        "Please check your SMTP configuration."
    );
  }

  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Allows self-signed certs in dev, restricts in prod (unless overridden by env var)
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });
};

/**
 * Locates the resume file path or uses a CDN URL if provided.
 */
const getResumeAttachment = () => {
  // 1. Check for a CDN/Public URL (Recommended for Serverless)
  if (process.env.RESUME_PUBLIC_URL) {
    console.log("Using RESUME_PUBLIC_URL for attachment.");
    return {
      filename: RESUME_FILENAME,
      path: process.env.RESUME_PUBLIC_URL, // Path here means URL for external files
      contentType: "application/pdf",
    };
  }

  // 2. Fallback to Local/Serverless File Path (Less reliable in serverless)
  const possiblePaths = [
    path.join(__dirname, "..", "backend", "assets", RESUME_FILENAME),
    path.join(process.cwd(), "backend", "assets", RESUME_FILENAME),
    path.join("/tmp", RESUME_FILENAME), // For serverless environments
  ];

  for (const resumePath of possiblePaths) {
    if (fs.existsSync(resumePath)) {
      console.log(`Resume file found locally at: ${resumePath}`);
      return {
        filename: RESUME_FILENAME,
        path: resumePath,
        contentType: "application/pdf",
      };
    }
  }

  // 3. Throw a clear error if neither is found
  throw new Error(
    `Resume file not available. Please set RESUME_PUBLIC_URL in environment ` +
      `variables or ensure ${RESUME_FILENAME} is packaged correctly.`
  );
};

/**
 * Sends the email with the resume attachment.
 */
const sendResumeByEmail = async (recipientEmail) => {
  let transporter;

  try {
    // Email format validation is performed in the handler, but an extra check is harmless
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      throw new Error(`Invalid recipient email format: ${recipientEmail}`);
    }

    console.log("Creating SMTP transporter...");
    transporter = createTransporter();

    console.log("Verifying SMTP connection...");
    await transporter.verify();
    console.log("SMTP connection verified successfully");

    // Get the attachment configuration
    const attachment = getResumeAttachment();

    const senderName = process.env.SENDER_NAME || SENDER_NAME_DEFAULT;
    const emailSubject = process.env.EMAIL_SUBJECT || EMAIL_SUBJECT_DEFAULT;

    // Use environment variables for body content if available
    const textBody =
      process.env.EMAIL_TEXT ||
      `Hello,\n\nThank you for your interest. Please find my resume attached.\n\nBest regards,\n${senderName}`;

    const htmlBody =
      process.env.EMAIL_HTML ||
      `<!DOCTYPE html><html><body><div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Hello,</p>
        <p>Thank you for your interest in my work. Please find my resume attached to this email.</p>
        <p>If you have any questions, please don't hesitate to reach out.</p>
        <p>Best regards,<br><strong>${senderName}</strong></p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          <p>This is an automated email.</p>
        </div>
      </div></body></html>`;

    const mailOptions = {
      from: `"${senderName}" <${process.env.FROM_EMAIL}>`,
      to: recipientEmail,
      subject: emailSubject,
      text: textBody,
      html: htmlBody,
      attachments: [attachment],
    };

    console.log(`Sending email to: ${recipientEmail}`);
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully!");
    console.log("   Message ID:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
      message: "Resume sent successfully! Check your email.",
      recipient: recipientEmail,
    };
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw error; // Re-throw to be caught by the main handler
  } finally {
    if (transporter) {
      transporter.close(); // Ensure transporter is closed in all cases
    }
  }
};

// --- RATE LIMITING (No changes needed, the logic is sound) ---
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const max = 5;

  const key = ip;
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
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
}, 60 * 60 * 1000).unref(); // Use .unref() to not block event loop exit in Node.js

// --- MAIN HANDLER FUNCTION ---

export default async function handler(req, res) {
  // --- CORS Handling ---
  const origin = req.headers.origin || req.headers.referer;

  // Combine your explicit frontend URL, local hosts, and an optional env variable
  const allowedOrigins = [
    FRONTEND_URL_PRODUCTION, // Your deployed Netlify URL
    process.env.FRONTEND_URL, // Optional environment variable (e.g., for staging/dev)
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
  ].filter(Boolean);

  // Check if the request origin is allowed or if * (for testing) is explicitly set
  if (
    origin &&
    (allowedOrigins.includes(origin) || process.env.FRONTEND_URL === "*")
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // If origin is not explicitly allowed, do not set the header to prevent CORS from working
    // You could also set it to a fixed, non-matching origin like 'null' if desired.
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // --- Rate Limiting ---
    const clientIP =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.headers["x-real-ip"] ||
      req.connection?.remoteAddress ||
      "unknown";

    if (!checkRateLimit(clientIP)) {
      return res.status(429).json({
        error: "Too many requests",
        message: "Rate limit exceeded. Maximum 5 requests per hour per IP.",
      });
    }

    // --- Input Validation ---
    const { email } = req.body;
    const sanitizedEmail = email ? email.trim().toLowerCase() : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !sanitizedEmail ||
      !emailRegex.test(sanitizedEmail) ||
      sanitizedEmail.length > 254 ||
      /[<>\"'%;()&+]/.test(sanitizedEmail)
    ) {
      return res.status(400).json({
        error: "Invalid email",
        message: "Please provide a valid email address.",
      });
    }

    // --- Send Email ---
    const result = await sendResumeByEmail(sanitizedEmail);

    return res.status(200).json({
      success: true,
      message: result.message || "Resume sent successfully! Check your email.",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Error in /api/send-resume:", {
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
    });

    // --- Error Handling ---
    if (
      error.message.includes("SMTP") ||
      error.message.includes("authentication") ||
      error.code === "EAUTH" ||
      error.code === "ECONNECTION"
    ) {
      return res.status(503).json({
        error: "Service unavailable",
        message:
          "Email service is currently unavailable due to an SMTP configuration error. Please try again later.",
      });
    }

    if (error.message.includes("Resume file not available")) {
      return res.status(503).json({
        error: "Service unavailable",
        message:
          "Resume file not found. Please contact the site administrator.",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to send resume. Please try again later.",
    });
  }
}
