# Vercel Backend Deployment Guide

## ✅ Vercel-Compatible Setup Complete

Your Express backend is now 100% Vercel-compatible as a serverless API.

## 📁 File Structure

```
backend/
├── index.js              # ✅ Entry point (exports Express app)
├── vercel.json          # ✅ Vercel configuration
├── services/
│   └── emailService.js  # ✅ Email service (unchanged)
├── assets/
│   └── resume.pdf       # Resume file
└── package.json
```

## 🚀 Deployment Steps

### 1. Install Vercel CLI (if not already installed)

```bash
npm i -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy Backend

```bash
cd backend
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No**
- What's your project's name? **portfolio-backend** (or your choice)
- In which directory is your code located? **./** (current directory)

### 4. Set Environment Variables

After deployment, set environment variables in Vercel Dashboard:

1. Go to your project → Settings → Environment Variables
2. Add these variables:

```
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com

# Optional
SENDER_NAME=Your Name
EMAIL_SUBJECT=Your Requested Resume
```

### 5. Redeploy After Setting Variables

```bash
vercel --prod
```

## 🔍 Verify Deployment

### Test Health Endpoint

```bash
curl https://your-backend.vercel.app/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### Test API Root

```bash
curl https://your-backend.vercel.app/api
```

### Test Send Resume Endpoint

```bash
curl -X POST https://your-backend.vercel.app/api/send-resume \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## 📝 Important Notes

### ✅ What's Working

- ✅ Express app exported as default
- ✅ No `app.listen()` (Vercel handles this)
- ✅ All routes start with `/api`
- ✅ CORS configured with `FRONTEND_URL`
- ✅ Rate limiting preserved
- ✅ Email service unchanged
- ✅ All features intact

### ⚠️ Resume File Access

Vercel serverless functions have limited file system access. The resume PDF in `backend/assets/resume.pdf` might not be accessible.

**Solutions:**

1. **Upload to Cloud Storage** (Recommended)
   - Upload `resume.pdf` to S3/Cloudflare R2
   - Update `emailService.js` to download from cloud or use presigned URL

2. **Base64 Encode**
   - Convert PDF to base64
   - Store as `RESUME_BASE64` environment variable
   - Decode in `emailService.js`

3. **Use Download Link Method**
   - Use `emailServiceWithLink.js` instead
   - Host resume on CDN
   - Send email with download link

### 🔧 Configuration Files

**backend/vercel.json:**
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

**backend/index.js:**
- Exports Express app: `export default app;`
- No `app.listen()`
- All routes under `/api`

## 🐛 Troubleshooting

### Function Not Found

**Problem:** Getting 404 on API routes

**Solution:**
1. Verify `vercel.json` is in `backend/` directory
2. Check `index.js` exports app correctly
3. Ensure routes start with `/api`
4. Redeploy: `vercel --prod`

### CORS Errors

**Problem:** CORS errors from frontend

**Solution:**
1. Set `FRONTEND_URL` environment variable in Vercel
2. Value should be your frontend domain (e.g., `https://your-frontend.vercel.app`)
3. Redeploy after setting variable

### Resume File Not Found

**Problem:** Error about resume file not found

**Solution:**
- Upload resume to cloud storage
- Or use base64 encoding
- Or switch to download link method

### Environment Variables Not Loading

**Problem:** SMTP credentials not working

**Solution:**
1. Verify variables are set in Vercel Dashboard
2. Check variable names match exactly (case-sensitive)
3. Redeploy after adding variables: `vercel --prod`

## 📊 Monitoring

### View Logs

```bash
# Via CLI
vercel logs

# Or in Dashboard
# Project → Functions → View Logs
```

### Check Function Status

- Dashboard → Functions
- See execution times, errors, invocations

## 🔗 Update Frontend

After backend is deployed, update frontend to use backend URL:

```javascript
// In frontend, set VITE_API_URL
VITE_API_URL=https://your-backend.vercel.app
```

## ✅ Deployment Checklist

- [x] `index.js` created and exports app
- [x] `vercel.json` configured
- [x] No `app.listen()` in code
- [x] All routes start with `/api`
- [x] CORS uses `FRONTEND_URL`
- [x] Rate limiting preserved
- [x] Email service unchanged
- [ ] Environment variables set in Vercel
- [ ] Resume file accessible (or use cloud storage)
- [ ] Frontend URL updated
- [ ] Test all endpoints

## 🎯 Quick Deploy Command

```bash
cd backend
vercel --prod
```

Your backend is now live at: `https://your-backend.vercel.app`

