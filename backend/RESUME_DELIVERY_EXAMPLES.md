# Resume Delivery Code Examples

## Method 1: Email Attachment

### Implementation

```javascript
// backend/services/emailServiceAttachment.js
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const mailOptions = {
  from: '"Your Name" <your-email@gmail.com>',
  to: recipientEmail,
  subject: 'Your Requested Resume',
  text: 'Please find my resume attached.',
  html: '<p>Please find my resume attached.</p>',
  attachments: [
    {
      filename: 'resume.pdf',
      path: './assets/resume.pdf',  // Local file path
      contentType: 'application/pdf',
    },
  ],
};

await transporter.sendMail(mailOptions);
```

### Usage

```javascript
import { sendResumeByEmailAttachment } from './services/emailServiceAttachment.js';

const result = await sendResumeByEmailAttachment('visitor@example.com');
```

### Pros
- ✅ Simple setup (just local file)
- ✅ No external dependencies
- ✅ Instant delivery
- ✅ Works offline (in inbox)

### Cons
- ⚠️ Large email size
- ⚠️ May trigger spam filters
- ⚠️ No analytics
- ⚠️ Must resend to update

---

## Method 2: Download Link (S3 Presigned URL)

### Prerequisites

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### Environment Variables

```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_S3_KEY=resume.pdf
LINK_EXPIRY_SECONDS=604800  # 7 days
```

### Implementation

```javascript
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const command = new GetObjectCommand({
  Bucket: process.env.AWS_S3_BUCKET,
  Key: 'resume.pdf',
});

// Generate presigned URL (expires in 7 days)
const expiresIn = 604800; // seconds
const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn });

// Send email with link
const mailOptions = {
  from: '"Your Name" <your-email@gmail.com>',
  to: recipientEmail,
  subject: 'Your Requested Resume',
  html: `
    <p>Download your resume:</p>
    <a href="${downloadUrl}">Download Resume</a>
    <p>Link expires in 7 days.</p>
  `,
};

await transporter.sendMail(mailOptions);
```

### Usage

```javascript
import { sendResumeByEmailWithLink } from './services/emailServiceWithLink.js';

const result = await sendResumeByEmailWithLink('visitor@example.com');
```

---

## Method 3: Download Link (Signed URL - No AWS)

### Environment Variables

```env
DOWNLOAD_SECRET=your-secret-key-here
DOWNLOAD_BASE_URL=https://your-domain.com
LINK_EXPIRY_SECONDS=604800
```

### Implementation

```javascript
import crypto from 'crypto';

function generateSignedUrl(recipientEmail) {
  const secret = process.env.DOWNLOAD_SECRET;
  const expiresIn = 604800; // 7 days
  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

  // Create token: email + expiry
  const tokenData = `${recipientEmail}:${expiresAt}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(tokenData)
    .digest('hex');

  const params = new URLSearchParams({
    email: recipientEmail,
    expires: expiresAt.toString(),
    sig: signature,
  });

  return `${process.env.DOWNLOAD_BASE_URL}/api/download-resume?${params.toString()}`;
}

// Verify signed URL on download endpoint
function verifySignedUrl(email, expires, signature) {
  const secret = process.env.DOWNLOAD_SECRET;
  const tokenData = `${email}:${expires}`;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(tokenData)
    .digest('hex');

  // Check expiry
  if (parseInt(expires) < Math.floor(Date.now() / 1000)) {
    return false; // Expired
  }

  // Verify signature
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  );
}
```

### Download Endpoint Example

```javascript
// In your Express server
app.get('/api/download-resume', async (req, res) => {
  const { email, expires, sig } = req.query;

  // Verify signature
  if (!verifySignedUrl(email, expires, sig)) {
    return res.status(403).json({ error: 'Invalid or expired link' });
  }

  // Serve file
  const resumePath = path.join(__dirname, 'assets', 'resume.pdf');
  res.download(resumePath, 'resume.pdf');
});
```

---

## Method 4: Download Link (Cloudflare R2 / Netlify)

### Cloudflare R2 (S3-compatible)

```javascript
// Same as S3, just use R2 endpoint
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
```

### Netlify (Static Hosting)

```javascript
// Upload resume.pdf to Netlify, then generate signed URL
const netlifyUrl = `https://your-site.netlify.app/resume.pdf?token=${generateToken()}`;
```

---

## Quick Comparison

| Method | Code Complexity | Setup Time | Cost |
|-------|----------------|------------|------|
| Attachment | ⭐ Simple | 5 min | Free |
| S3 Presigned | ⭐⭐ Medium | 15 min | ~$0.023/GB |
| Signed URL | ⭐⭐ Medium | 10 min | Free |
| Cloudflare R2 | ⭐⭐ Medium | 15 min | Free tier available |

---

## Recommendation

**Development:** Use attachment (simplest)
**Production:** Use S3 presigned URL or signed URL (more professional)

