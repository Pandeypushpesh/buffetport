# Deployment Checklist

Quick reference checklist for deploying frontend and backend.

---

## Pre-Deployment

### Frontend
- [ ] Run `npm run build` locally to verify build works
- [ ] Test build output in `dist/` folder
- [ ] Update API URL in code to use environment variable
- [ ] Add `VITE_API_URL` to environment variables

### Backend
- [ ] Update CORS to use `FRONTEND_URL` environment variable
- [ ] Test server starts locally with production env vars
- [ ] Verify all environment variables are documented
- [ ] Ensure `.env` is in `.gitignore`

---

## Frontend Deployment

### Netlify
- [ ] Connect Git repository
- [ ] Set build command: `npm run build`
- [ ] Set publish directory: `dist`
- [ ] Add environment variable: `VITE_API_URL`
- [ ] Deploy and verify site loads
- [ ] Test API connection

### Vercel
- [ ] Connect Git repository
- [ ] Set framework: Vite
- [ ] Set root directory: `frontend`
- [ ] Add environment variables
- [ ] Deploy and verify
- [ ] Test API connection

---

## Backend Deployment

### Render
- [ ] Create new Web Service
- [ ] Set build command: `cd backend && npm install`
- [ ] Set start command: `cd backend && npm start`
- [ ] Add all environment variables
- [ ] Set `FRONTEND_URL` to production frontend URL
- [ ] Encrypt SMTP credentials
- [ ] Deploy and check logs

### Railway
- [ ] Create new project
- [ ] Set root directory: `backend`
- [ ] Set start command: `npm start`
- [ ] Add all environment variables
- [ ] Set `FRONTEND_URL` to production frontend URL
- [ ] Deploy and check logs

### Heroku
- [ ] Create Heroku app
- [ ] Create `Procfile` with `web: node server.js`
- [ ] Set all environment variables via CLI or dashboard
- [ ] Set `FRONTEND_URL` to production frontend URL
- [ ] Deploy: `git push heroku main`
- [ ] Check logs: `heroku logs --tail`

---

## Environment Variables Setup

### Frontend (Platform Settings)
```
VITE_API_URL=https://your-backend-url.com
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX (optional)
VITE_PLAUSIBLE_DOMAIN=yourdomain.com (optional)
```

### Backend (Platform Settings)
```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-url.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password (ENCRYPT THIS)
FROM_EMAIL=your-email@gmail.com
SENDER_NAME=Your Name (optional)
EMAIL_SUBJECT=Your Requested Resume (optional)
```

---

## Critical: Update CORS

### Before Deploying Backend

In `backend/server.js`, change:

```javascript
// ❌ OLD (Development)
const corsOptions = {
  origin: 'http://localhost:5173',
  ...
};

// ✅ NEW (Production)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  ...
};
```

Then set `FRONTEND_URL` environment variable in your hosting platform.

---

## Post-Deployment Testing

### Frontend
- [ ] Site loads without errors
- [ ] API calls work (check Network tab)
- [ ] Form submission works
- [ ] Success/error messages display
- [ ] Download button works
- [ ] Analytics tracking works

### Backend
- [ ] Health check: `GET /api/health` returns 200
- [ ] Test endpoint: `POST /api/send-resume` with valid email
- [ ] Verify email is sent
- [ ] Check error handling (invalid email returns 400)
- [ ] Verify rate limiting works
- [ ] Check logs for errors

### Integration
- [ ] Complete user flow: submit form → receive email
- [ ] Test on different browsers
- [ ] Test on mobile devices
- [ ] Verify CORS allows frontend domain

---

## Security Verification

- [ ] `.env` file is NOT in repository
- [ ] SMTP credentials are encrypted in platform
- [ ] CORS only allows production frontend URL
- [ ] All URLs use HTTPS
- [ ] Rate limiting is active
- [ ] Error messages don't expose sensitive data

---

## Monitoring

- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Monitor email sending success rate
- [ ] Track API response times
- [ ] Monitor rate limit violations
- [ ] Set up uptime monitoring

---

## Rollback Plan

If deployment fails:

1. **Frontend:** Revert to previous deployment in Netlify/Vercel dashboard
2. **Backend:** 
   - Render: Use "Manual Deploy" → select previous commit
   - Railway: Use "Redeploy" → select previous deployment
   - Heroku: `git push heroku <previous-commit-hash>:main`

---

## Quick Commands

### Frontend Build
```bash
cd frontend
npm install
npm run build
```

### Backend Test Locally
```bash
cd backend
NODE_ENV=production FRONTEND_URL=https://your-frontend.com npm start
```

### Check Environment Variables
```bash
# Render
# Check in dashboard → Environment tab

# Railway
railway variables

# Heroku
heroku config
```

