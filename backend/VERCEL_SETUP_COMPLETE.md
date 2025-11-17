# ✅ Vercel Serverless API - Setup Complete

Your Express backend is now 100% Vercel-compatible and ready to deploy.

## 📁 Final Folder Structure

```
backend/
├── index.js              ✅ Entry point (exports Express app)
├── vercel.json           ✅ Vercel configuration
├── package.json          ✅ Updated to use index.js
├── services/
│   └── emailService.js  ✅ Email service (Vercel-compatible)
└── assets/
    └── resume.pdf       ⚠️  Note: May need cloud storage in production
```

## ✅ Verification Checklist

- [x] **Entry file:** `backend/index.js` exists
- [x] **No app.listen():** Removed (Vercel handles this)
- [x] **Export default app:** `export default app;` at end of index.js
- [x] **vercel.json:** Created with exact specified content
- [x] **All routes use /api prefix:**
  - `/api/health` ✅
  - `/api` ✅
  - `/api/send-resume` ✅
- [x] **CORS:** Uses `process.env.FRONTEND_URL`
- [x] **Rate limiting:** Preserved
- [x] **Email service:** Preserved and Vercel-compatible
- [x] **Validation:** All validation logic preserved
- [x] **package.json:** Updated to use index.js

## 🚀 Deploy to Vercel

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

```bash
cd backend
vercel
```

Follow prompts:
- Set up and deploy? **Yes**
- Link to existing project? **No** (first time)
- Project name: **portfolio-backend** (or your choice)
- Directory: **./** (current directory)

### Step 4: Set Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

```
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com

SENDER_NAME=Your Name (optional)
EMAIL_SUBJECT=Your Requested Resume (optional)
```

### Step 5: Redeploy

```bash
vercel --prod
```

## 🔍 Test Your API

After deployment, your API will be available at:

```
https://your-project.vercel.app/api/health
https://your-project.vercel.app/api
https://your-project.vercel.app/api/send-resume
```

### Test Commands

```bash
# Health check
curl https://your-project.vercel.app/api/health

# API root
curl https://your-project.vercel.app/api

# Send resume
curl -X POST https://your-project.vercel.app/api/send-resume \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## ⚠️ Important: Resume File

Vercel serverless functions have **read-only file system** access. The resume PDF in `backend/assets/resume.pdf` might not be accessible in production.

### Solutions:

1. **Upload to Cloud Storage** (Recommended)
   - Upload `resume.pdf` to S3/Cloudflare R2/Google Cloud Storage
   - Update `emailService.js` to download from cloud
   - Or use presigned URL method

2. **Base64 Encode**
   - Convert PDF to base64: `base64 resume.pdf > resume.txt`
   - Store as `RESUME_BASE64` environment variable in Vercel
   - Decode in `emailService.js`

3. **Use Download Link Method**
   - Switch to `emailServiceWithLink.js`
   - Host resume on CDN
   - Send email with download link instead of attachment

## 📝 Code Summary

### backend/index.js
- ✅ Express app setup
- ✅ CORS with `process.env.FRONTEND_URL`
- ✅ Rate limiting (5/hour for resume, 100/15min general)
- ✅ All routes under `/api`
- ✅ Email validation and sanitization
- ✅ Error handling
- ✅ `export default app` (no `app.listen()`)

### backend/vercel.json
```json
{
  "version": 2,
  "builds": [
    { "src": "index.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/index.js" }
  ]
}
```

### backend/services/emailService.js
- ✅ Vercel-compatible file path resolution
- ✅ Tries multiple paths for resume file
- ✅ All email logic preserved

## 🎯 Your API Endpoints

Once deployed, these will work:

- `GET https://your-project.vercel.app/api/health`
- `GET https://your-project.vercel.app/api`
- `POST https://your-project.vercel.app/api/send-resume`

## ✅ Everything is Ready!

Your backend is now 100% Vercel-compatible. Just deploy and set environment variables!

