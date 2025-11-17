/**
 * Script to generate Google OAuth2 Refresh Token
 * 
 * Usage:
 * 1. Set environment variables:
 *    export GOOGLE_CLIENT_ID=your-client-id
 *    export GOOGLE_CLIENT_SECRET=your-client-secret
 * 
 * 2. Install dependencies:
 *    npm install googleapis
 * 
 * 3. Run the script:
 *    node scripts/getRefreshToken.js
 * 
 * 4. Follow the prompts to authorize and get refresh token
 */

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
    prompt: 'consent', // Force consent screen to get refresh token
  });
  
  console.log('\n📧 Gmail OAuth2 Setup\n');
  console.log('='.repeat(50));
  console.log('Step 1: Authorize this app');
  console.log('='.repeat(50));
  console.log('\nVisit this URL in your browser:');
  console.log('\n' + authUrl + '\n');
  console.log('You will be asked to:');
  console.log('  1. Sign in with your Google account');
  console.log('  2. Grant permission to send emails');
  console.log('  3. Copy the authorization code\n');
  
  rl.question('Step 2: Paste the authorization code here: ', (code) => {
    rl.close();
    
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error('\n❌ Error retrieving access token:', err.message);
        console.error('\nMake sure you:');
        console.error('  1. Copied the full authorization code');
        console.error('  2. Used the correct Client ID and Secret');
        console.error('  3. Added your email as a test user (if app is in testing mode)');
        process.exit(1);
      }
      
      oAuth2Client.setCredentials(token);
      
      console.log('\n' + '='.repeat(50));
      console.log('✅ Success! Your OAuth2 tokens:');
      console.log('='.repeat(50));
      console.log('\n📋 Add these to your .env file:\n');
      console.log(`GOOGLE_CLIENT_ID=${process.env.GOOGLE_CLIENT_ID}`);
      console.log(`GOOGLE_CLIENT_SECRET=${process.env.GOOGLE_CLIENT_SECRET}`);
      console.log(`GOOGLE_REFRESH_TOKEN=${token.refresh_token}`);
      console.log(`FROM_EMAIL=${token.email || 'your-email@gmail.com'}`);
      console.log('\n' + '='.repeat(50));
      console.log('\n⚠️  Important:');
      console.log('  - Keep these credentials secure');
      console.log('  - Never commit .env to version control');
      console.log('  - Refresh token is long-lived but can be revoked');
      console.log('\n✅ Setup complete! You can now use emailServiceOAuth2.js\n');
      
      callback(oAuth2Client);
    });
  });
}

// Validate environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('❌ Error: Missing required environment variables\n');
  console.error('Please set:');
  console.error('  GOOGLE_CLIENT_ID=your-client-id');
  console.error('  GOOGLE_CLIENT_SECRET=your-client-secret\n');
  console.error('Example:');
  console.error('  export GOOGLE_CLIENT_ID="123-abc.apps.googleusercontent.com"');
  console.error('  export GOOGLE_CLIENT_SECRET="GOCSPX-xyz123"');
  console.error('  node scripts/getRefreshToken.js\n');
  process.exit(1);
}

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000' // Redirect URI (must match OAuth consent screen)
);

getAccessToken(oAuth2Client, () => {
  // Script complete
});

