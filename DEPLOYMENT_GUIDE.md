# Deployment Guide

Complete deployment instructions for frontend (Vite) and backend (Express) to production platforms.

---

## Frontend Deployment

### Build Command

```bash
cd frontend
npm install
npm run build
```

This creates a `dist/` folder with production-ready files.

---

## Frontend: Netlify Deployment

### Step 1: Prepare for Deployment

1. Ensure `frontend/package.json` has build script:
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

2. Create `netlify.toml` in `frontend/` directory:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 2: Deploy via Netlify Dashboard

1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. Configure build settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
5. Click "Deploy site"

### Step 3: Environment Variables (if needed)

1. Go to Site settings → Environment variables
2. Add variables:
   - `VITE_API_URL` = `https://your-backend-url.com`
   - `VITE_GA_MEASUREMENT_ID` = `G-XXXXXXXXXX` (if using Google Analytics)
   - `VITE_PLAUSIBLE_DOMAIN` = `yourdomain.com` (if using Plausible)

### Step 4: Update API URL

In your frontend code, use:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

### Step 5: Custom Domain (Optional)

1. Site settings → Domain management
2. Add custom domain
3. Update DNS records as instructed

---

## Frontend: Vercel Deployment

### Step 1: Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### Step 2: Deploy via Vercel Dashboard

1. Go to [Vercel](https://vercel.com/)
2. Click "Add New Project"
3. Import your Git repository
4. Configure project:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click "Deploy"

### Step 3: Environment Variables

1. Project Settings → Environment Variables
2. Add:
   - `VITE_API_URL` = `https://your-backend-url.com`
   - `VITE_GA_MEASUREMENT_ID` = `G-XXXXXXXXXX`
   - `VITE_PLAUSIBLE_DOMAIN` = `yourdomain.com`

### Step 4: Deploy via CLI (Alternative)

```bash
cd frontend
vercel
```

Follow prompts and enter environment variables when asked.

---

## Backend Deployment

### Required Environment Variables

```env
# Server
PORT=5000
NODE_ENV=production

# CORS (IMPORTANT: Replace localhost with production frontend URL)
FRONTEND_URL=https://your-frontend-domain.com

# SMTP Configuration (Choose one method)
# Method 1: SMTP with App Password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com

# Method 2: OAuth2 (Recommended for production)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
FROM_EMAIL=your-email@gmail.com

# Optional
SENDER_NAME=Your Name
EMAIL_SUBJECT=Your Requested Resume
```

---

## Backend: Render Deployment

### Step 1: Prepare Repository

1. Ensure `backend/package.json` has start script:
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

2. Create `render.yaml` (optional, for infrastructure as code):
```yaml
services:
  - type: web
    name: portfolio-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
```

### Step 2: Deploy via Render Dashboard

1. Go to [Render](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your Git repository
4. Configure service:
   - **Name:** `portfolio-backend`
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Root Directory:** `backend` (if monorepo)
5. Click "Create Web Service"

### Step 3: Set Environment Variables

1. Go to Environment tab
2. Add each variable:
   - `NODE_ENV` = `production`
   - `PORT` = `5000` (Render sets this automatically, but include for clarity)
   - `FRONTEND_URL` = `https://your-frontend.netlify.app`
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = `your-email@gmail.com`
   - `SMTP_PASS` = `your-app-password` (click "Encrypt" button)
   - `FROM_EMAIL` = `your-email@gmail.com`
   - Add other variables as needed

### Step 4: Update CORS in server.js

Before deploying, update CORS configuration:

```javascript
// In backend/server.js
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};
```

### Step 5: Deploy

1. Render automatically deploys on git push
2. Check "Logs" tab for deployment status
3. Your backend URL will be: `https://portfolio-backend.onrender.com`

---

## Backend: Railway Deployment

### Step 1: Install Railway CLI (Optional)

```bash
npm i -g @railway/cli
```

### Step 2: Deploy via Railway Dashboard

1. Go to [Railway](https://railway.app/)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway auto-detects Node.js

### Step 3: Configure Service

1. Click on your service
2. Go to "Settings" → "Root Directory"
3. Set to: `backend`
4. Go to "Settings" → "Start Command"
5. Set to: `npm start`

### Step 4: Set Environment Variables

1. Go to "Variables" tab
2. Click "New Variable"
3. Add each variable:
   - `NODE_ENV` = `production`
   - `PORT` = `5000` (Railway sets automatically)
   - `FRONTEND_URL` = `https://your-frontend.vercel.app`
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = `your-email@gmail.com`
   - `SMTP_PASS` = `your-app-password`
   - `FROM_EMAIL` = `your-email@gmail.com`
   - Add other variables

### Step 5: Deploy via CLI (Alternative)

```bash
cd backend
railway login
railway init
railway up
```

### Step 6: Get Production URL

1. Railway provides a URL like: `https://portfolio-backend.up.railway.app`
2. Update `FRONTEND_URL` environment variable with this URL
3. Update frontend `VITE_API_URL` with this URL

---

## Backend: Heroku Deployment

### Step 1: Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Create Heroku App

```bash
cd backend
heroku login
heroku create portfolio-backend
```

### Step 3: Set Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend.netlify.app
heroku config:set SMTP_HOST=smtp.gmail.com
heroku config:set SMTP_PORT=587
heroku config:set SMTP_USER=your-email@gmail.com
heroku config:set SMTP_PASS=your-app-password
heroku config:set FROM_EMAIL=your-email@gmail.com
```

Or via Dashboard:
1. Go to [Heroku Dashboard](https://dashboard.heroku.com/)
2. Select your app
3. Settings → Config Vars
4. Add each variable

### Step 4: Create Procfile

Create `backend/Procfile`:
```
web: node server.js
```

### Step 5: Deploy

```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Step 6: View Logs

```bash
heroku logs --tail
```

---

## Update CORS for Production

### Before Deployment

Update `backend/server.js`:

```javascript
// Replace hardcoded localhost with environment variable
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};
```

### Set FRONTEND_URL

In your hosting platform, set:
- `FRONTEND_URL` = `https://your-frontend-domain.com`

Examples:
- Netlify: `https://your-site.netlify.app`
- Vercel: `https://your-site.vercel.app`
- Custom domain: `https://yourdomain.com`

---

## Security Checklist for Production

### ✅ Environment Variables

- [ ] Never commit `.env` file
- [ ] Use platform's encrypted environment variables
- [ ] Rotate SMTP credentials regularly
- [ ] Use OAuth2 instead of App Passwords (recommended)

### ✅ SMTP Credentials Security

**Render:**
- Click "Encrypt" button when adding sensitive variables
- Variables are encrypted at rest

**Railway:**
- Variables are automatically encrypted
- Use "Secret" type for sensitive data

**Heroku:**
- Variables are encrypted
- Use `heroku config:set` for sensitive data

### ✅ CORS Configuration

- [ ] Replace `http://localhost:5173` with production URL
- [ ] Use `FRONTEND_URL` environment variable
- [ ] Don't use wildcard (`*`) in production

### ✅ HTTPS

- [ ] Ensure all URLs use HTTPS
- [ ] Update frontend API calls to use HTTPS backend URL

---

## Post-Deployment Checklist

### Frontend

- [ ] Test API connection to backend
- [ ] Verify environment variables are loaded
- [ ] Test form submission
- [ ] Check analytics tracking
- [ ] Verify CORS is working (no CORS errors in console)

### Backend

- [ ] Test `/api/health` endpoint
- [ ] Test `/api/send-resume` with valid email
- [ ] Verify email sending works
- [ ] Check logs for errors
- [ ] Monitor rate limiting
- [ ] Verify CORS allows frontend domain

### Integration

- [ ] Test complete flow: form submit → email sent
- [ ] Verify success/error messages display
- [ ] Check download button works
- [ ] Test on mobile devices

---

## Troubleshooting

### CORS Errors

**Error:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution:**
1. Check `FRONTEND_URL` environment variable is set correctly
2. Verify backend CORS configuration includes frontend URL
3. Ensure both use HTTPS in production

### Environment Variables Not Loading

**Frontend (Vite):**
- Variables must start with `VITE_`
- Rebuild after adding variables: `npm run build`

**Backend:**
- Restart service after adding variables
- Check variable names match exactly (case-sensitive)

### Email Not Sending

1. Verify SMTP credentials are correct
2. Check email service logs
3. Test SMTP connection manually
4. Ensure rate limiting isn't blocking requests

---

## Quick Reference

### Frontend Build
```bash
cd frontend
npm install
npm run build
# Output: frontend/dist/
```

### Backend Start
```bash
cd backend
npm install
npm start
# Runs on PORT from environment or 5000
```

### Environment Variables Template
```env
# Frontend (.env or platform settings)
VITE_API_URL=https://your-backend-url.com

# Backend (platform environment variables)
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-url.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
```

