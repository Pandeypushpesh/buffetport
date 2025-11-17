# Vercel Deployment Guide

Complete guide for deploying the portfolio website to Vercel.

## 🚀 Quick Deploy

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option 2: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add environment variables (see below)
6. Deploy

## 📁 Project Structure for Vercel

```
vibing/
├── api/                    # Serverless functions
│   ├── health.js
│   ├── index.js
│   └── send-resume.js
├── backend/                # Backend code (shared with serverless)
│   └── services/
│       └── emailService.js
├── frontend/              # Frontend React app
│   └── dist/              # Build output
├── vercel.json            # Vercel configuration
└── package.json           # Root package.json
```

## ⚙️ Environment Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

### Required Variables

```
NODE_ENV=production
FRONTEND_URL=https://your-project.vercel.app

# SMTP Configuration (Method 1)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com

# OR OAuth2 Configuration (Method 2)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
FROM_EMAIL=your-email@gmail.com
```

### Optional Variables

```
SENDER_NAME=Your Name
EMAIL_SUBJECT=Your Requested Resume
VITE_API_URL=https://your-project.vercel.app
```

## 🔧 Configuration

### vercel.json

The `vercel.json` file configures:
- Frontend build from `frontend/` directory
- API routes from `api/` directory
- Routing and rewrites for SPA

### API Routes

Serverless functions are in `api/` directory:
- `api/health.js` - Health check
- `api/index.js` - API root
- `api/send-resume.js` - Resume sending endpoint

## 📦 Build Process

1. **Frontend Build:**
   - Vercel runs `npm run build` in `frontend/`
   - Outputs to `frontend/dist/`

2. **API Functions:**
   - Each file in `api/` becomes a serverless function
   - Automatically deployed as serverless endpoints

## 🔍 Testing Locally

### Install Vercel CLI

```bash
npm i -g vercel
```

### Run Development Server

```bash
# In project root
vercel dev
```

This will:
- Start frontend dev server
- Run API functions locally
- Proxy requests correctly

## 🚨 Important Notes

### Resume File

The resume PDF needs to be accessible. Options:

1. **Upload to Cloud Storage:**
   - Upload `resume.pdf` to S3/Cloudflare R2
   - Update `emailService.js` to use cloud URL

2. **Base64 Encode:**
   - Convert PDF to base64
   - Store as environment variable
   - Decode in email service

3. **Use Download Link Method:**
   - Use `emailServiceWithLink.js` instead
   - Host resume on CDN/static hosting

### Rate Limiting

Serverless functions use in-memory rate limiting. For production:
- Consider using Vercel Edge Config
- Or external Redis for distributed rate limiting

### File Size Limits

- Vercel serverless functions: 50MB max
- Function execution: 10 seconds (Hobby), 60 seconds (Pro)
- Resume PDF should be < 10MB

## 🔄 Deployment Workflow

1. **Push to Git:**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push
   ```

2. **Vercel Auto-Deploys:**
   - Automatically detects push
   - Builds and deploys
   - Provides preview URL

3. **Production Deploy:**
   - Merge to main branch
   - Or manually deploy from dashboard

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

## 🐛 Troubleshooting

### Build Fails

**Problem:** Frontend build fails

**Solution:**
1. Check build logs in Vercel dashboard
2. Ensure all dependencies in `package.json`
3. Check Node.js version (Vercel uses 18.x by default)

### API Function Errors

**Problem:** 500 errors from API

**Solution:**
1. Check function logs
2. Verify environment variables are set
3. Check email service configuration
4. Ensure resume file is accessible

### CORS Errors

**Problem:** CORS errors in browser

**Solution:**
1. Set `FRONTEND_URL` environment variable
2. Update CORS in `api/send-resume.js`
3. Ensure frontend URL matches deployment URL

### Rate Limiting Not Working

**Problem:** Rate limit not enforced

**Solution:**
- In-memory rate limiting resets on cold start
- Consider external rate limiting service
- Or use Vercel Edge Config

## 🔒 Security

### Environment Variables

- Never commit `.env` files
- Use Vercel's encrypted environment variables
- Different values for Preview/Production

### Secrets Management

1. Go to Project Settings → Environment Variables
2. Add variables
3. Select environments (Production, Preview, Development)
4. Variables are encrypted at rest

## 📈 Performance

### Function Optimization

- Keep functions lightweight
- Minimize dependencies
- Use edge functions for static responses

### Caching

- Frontend assets cached by Vercel CDN
- API responses can be cached with headers
- Static files served from edge

## 🔗 Custom Domain

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Update `FRONTEND_URL` environment variable

## 📝 Checklist

Before deploying:

- [ ] All environment variables set
- [ ] Resume file accessible (or use download link)
- [ ] `vercel.json` configured
- [ ] API functions in `api/` directory
- [ ] Frontend builds successfully
- [ ] CORS configured correctly
- [ ] Test locally with `vercel dev`

## 🆘 Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Vercel Status](https://www.vercel-status.com/)

