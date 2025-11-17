# Gmail OAuth2 Quick Start Guide

## Overview

This guide helps you set up Gmail OAuth2 for sending emails securely without using App Passwords.

## Required Environment Variables

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
FROM_EMAIL=your-email@gmail.com
```

## Quick Setup (5 Steps)

### 1. Create Google Cloud Project
- Visit [Google Cloud Console](https://console.cloud.google.com/)
- Create new project → Name it "Portfolio Email"

### 2. Enable Gmail API
- APIs & Services → Library
- Search "Gmail API" → Enable

### 3. Configure OAuth Consent Screen
- APIs & Services → OAuth consent screen
- Choose "External"
- Fill app name, email
- Add scope: `https://www.googleapis.com/auth/gmail.send`
- Add your email as test user

### 4. Create OAuth Credentials
- APIs & Services → Credentials
- Create OAuth client ID → Web application
- Add redirect URI: `http://localhost:3000`
- Copy Client ID and Secret

### 5. Generate Refresh Token

**Option A: Use provided script (Recommended)**
```bash
cd backend
npm install googleapis
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-client-secret"
node scripts/getRefreshToken.js
```

**Option B: Use OAuth2 Playground**
1. Go to [OAuth2 Playground](https://developers.google.com/oauthplayground/)
2. Click ⚙️ → Use your own OAuth credentials
3. Enter Client ID and Secret
4. Select `https://www.googleapis.com/auth/gmail.send`
5. Authorize → Exchange code → Copy refresh token

## Update Your Code

In `backend/server.js`:
```javascript
// Change import to use OAuth2
import { sendResumeByEmailOAuth2 as sendResumeByEmail } from './services/emailServiceOAuth2.js';
```

## Test

```bash
curl -X POST http://localhost:5000/api/send-resume \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Troubleshooting

**"Invalid refresh token"**
- Regenerate refresh token using the script
- Make sure you granted all permissions

**"Access denied"**
- Add your email as test user in OAuth consent screen
- Wait a few minutes after adding test user

**"Redirect URI mismatch"**
- Ensure redirect URI in credentials matches script (http://localhost:3000)

## Full Documentation

See `EMAIL_SETUP.md` for detailed instructions.

