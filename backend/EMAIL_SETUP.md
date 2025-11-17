# Email Setup Instructions

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com

# Optional: Email Customization
SENDER_NAME=Your Name
EMAIL_SUBJECT=Your Requested Resume
EMAIL_TEXT=Custom plain text message
EMAIL_HTML=<p>Custom HTML message</p>
```

## Gmail Setup (Example)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter "Portfolio Resume Sender"
4. Copy the 16-character app password
5. Use this as your `SMTP_PASS` value

### Step 3: Configure .env
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop  # Your 16-char app password (spaces optional)
FROM_EMAIL=your-email@gmail.com
SENDER_NAME=Your Full Name
```

## Other Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
FROM_EMAIL=your-email@outlook.com
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@yahoo.com
```

### Custom SMTP (SendGrid, Mailgun, etc.)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
FROM_EMAIL=your-verified-sender@domain.com
```

## Resume File

1. Place your resume PDF file in `backend/assets/` directory
2. Name it exactly: `resume.pdf`
3. Ensure the file is not corrupted and can be opened

## Testing

After setting up your `.env` file and placing `resume.pdf`:

1. Start the backend server:
```bash
cd backend
npm start
```

2. Test the endpoint:
```bash
curl -X POST http://localhost:5000/api/send-resume \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

3. Check the server logs for success/error messages

## Gmail OAuth2 Setup (Alternative to App Password)

OAuth2 is more secure than App Passwords and recommended for production. Use `emailServiceOAuth2.js` instead of `emailService.js`.

### Environment Variables for OAuth2

```env
# Gmail OAuth2 Configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
FROM_EMAIL=your-email@gmail.com

# Optional: Email Customization
SENDER_NAME=Your Name
EMAIL_SUBJECT=Your Requested Resume
```

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "Portfolio Email Service")
4. Click "Create"

### Step 2: Enable Gmail API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click on it and press "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" (unless you have Google Workspace)
3. Fill in required fields:
   - App name: "Portfolio Resume Sender"
   - User support email: Your email
   - Developer contact: Your email
4. Click "Save and Continue"
5. On "Scopes" page, click "Add or Remove Scopes"
6. Add scope: `https://www.googleapis.com/auth/gmail.send`
7. Click "Save and Continue"
8. Add test users (your email) if app is in testing
9. Click "Save and Continue" → "Back to Dashboard"

### Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "Portfolio Email Client"
5. Authorized redirect URIs: Add `http://localhost:3000` (or your callback URL)
6. Click "Create"
7. **Copy Client ID and Client Secret** - you'll need these for `.env`

### Step 5: Generate Refresh Token

You need to generate a refresh token using OAuth2 flow. Use one of these methods:

#### Method A: Using Node.js Script (Recommended)

Create a file `backend/scripts/getRefreshToken.js`:

```javascript
import { google } from 'googleapis';
import readline from 'readline';

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  
  console.log('Authorize this app by visiting this url:', authUrl);
  
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      console.log('\n✅ Refresh Token:', token.refresh_token);
      console.log('\nAdd this to your .env file:');
      console.log(`GOOGLE_REFRESH_TOKEN=${token.refresh_token}`);
      callback(oAuth2Client);
    });
  });
}

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000'
);

getAccessToken(oAuth2Client, () => {
  console.log('Setup complete!');
});
```

Run it:
```bash
cd backend
npm install googleapis
GOOGLE_CLIENT_ID=your-client-id GOOGLE_CLIENT_SECRET=your-secret node scripts/getRefreshToken.js
```

#### Method B: Using OAuth2 Playground

1. Go to [OAuth2 Playground](https://developers.google.com/oauthplayground/)
2. Click gear icon (⚙️) → Check "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. In left panel, find "Gmail API v1"
5. Select `https://www.googleapis.com/auth/gmail.send`
6. Click "Authorize APIs"
7. Sign in and grant permissions
8. Click "Exchange authorization code for tokens"
9. **Copy the "Refresh token"** value

### Step 6: Configure .env

Add to your `.env` file:

```env
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz
GOOGLE_REFRESH_TOKEN=1//abc123xyz...
FROM_EMAIL=your-email@gmail.com
SENDER_NAME=Your Name
```

### Step 7: Update server.js to use OAuth2

In `backend/server.js`, change the import:

```javascript
// Change from:
import { sendResumeByEmail } from './services/emailService.js';

// To:
import { sendResumeByEmailOAuth2 as sendResumeByEmail } from './services/emailServiceOAuth2.js';
```

### OAuth2 vs App Password

| Feature | OAuth2 | App Password |
|---------|--------|--------------|
| Security | ✅ More secure | ⚠️ Less secure |
| Setup Complexity | ⚠️ More complex | ✅ Simple |
| Token Expiry | ✅ Refresh token (long-lived) | ✅ No expiry |
| Production Ready | ✅ Yes | ⚠️ Not recommended |
| Revocation | ✅ Easy (via Google Console) | ⚠️ Must regenerate |

## Security Notes

- **Never commit `.env` file to version control**
- Use App Passwords for development, OAuth2 for production
- Keep your OAuth2 credentials secure
- Refresh tokens don't expire but can be revoked
- Consider using environment-specific configurations for production

