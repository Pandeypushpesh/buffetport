# Vercel NOT_FOUND Error Fix

## Problem
Getting `NOT_FOUND` error when accessing API routes on Vercel.

## Solution

### 1. Updated vercel.json
- Simplified configuration
- Removed conflicting build settings
- Proper routing for API and frontend

### 2. Fixed API Functions
- Inlined email service in `api/send-resume.js` to avoid import path issues
- All dependencies included directly
- Proper error handling

### 3. Root package.json
- Added `nodemailer` as dependency (required for API functions)
- Vercel will install this automatically

## Important Notes

### Resume File Issue
Vercel serverless functions have limited file system access. The resume PDF might not be accessible.

**Solutions:**

1. **Upload to Cloud Storage (Recommended)**
   - Upload `resume.pdf` to S3/Cloudflare R2/Google Cloud Storage
   - Update the `getResumePath()` function to download from cloud
   - Or use the download link method instead

2. **Base64 Encode**
   - Convert PDF to base64
   - Store as environment variable `RESUME_BASE64`
   - Decode in the function

3. **Use Download Link Method**
   - Use `emailServiceWithLink.js` approach
   - Host resume on CDN
   - Send email with download link instead of attachment

### Environment Variables

Make sure these are set in Vercel Dashboard:

```
NODE_ENV=production
FRONTEND_URL=https://your-project.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
```

### Testing Locally

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally
vercel dev
```

This will:
- Start frontend dev server
- Run API functions locally
- Test the complete setup

### Deployment

```bash
# Deploy
vercel

# Deploy to production
vercel --prod
```

## If Still Getting NOT_FOUND

1. **Check Vercel Dashboard:**
   - Go to Functions tab
   - See if functions are being detected
   - Check build logs

2. **Verify File Structure:**
   ```
   vibing/
   ├── api/
   │   ├── health.js
   │   ├── index.js
   │   └── send-resume.js
   ├── frontend/
   ├── vercel.json
   └── package.json
   ```

3. **Check Build Logs:**
   - Vercel Dashboard → Deployments → View Build Logs
   - Look for errors in function detection

4. **Test API Routes:**
   ```bash
   # After deployment, test:
   curl https://your-project.vercel.app/api/health
   curl https://your-project.vercel.app/api
   ```

## Alternative: Separate Frontend/Backend

If issues persist, consider:
- Deploy frontend to Vercel
- Deploy backend to Render/Railway/Heroku
- Update `VITE_API_URL` to point to backend URL

