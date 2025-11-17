/**
 * Usage Example for sendResumeByEmailOAuth2()
 * 
 * This file demonstrates how to use the OAuth2 email service function.
 */

import { sendResumeByEmailOAuth2 } from './emailServiceOAuth2.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ============================================
// Example 1: Basic Usage
// ============================================
async function basicOAuth2Example() {
  try {
    const result = await sendResumeByEmailOAuth2('visitor@example.com');
    
    console.log('✅ Success!');
    console.log('Message ID:', result.messageId);
    console.log('Message:', result.message);
    console.log('Recipient:', result.recipient);
    console.log('Method:', result.method); // Will show "OAuth2"
    
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
  }
}

// ============================================
// Example 2: Usage in Express Route Handler
// ============================================
async function expressRouteOAuth2Example(req, res) {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
        message: 'Please provide an email address',
      });
    }

    // Send resume using OAuth2
    const result = await sendResumeByEmailOAuth2(email);

    // Success response
    res.status(200).json({
      success: true,
      message: result.message,
      messageId: result.messageId,
      method: 'OAuth2',
    });

  } catch (error) {
    console.error('Error in route handler:', error);
    
    // Handle OAuth2-specific errors
    if (error.message.includes('refresh token')) {
      return res.status(401).json({
        error: 'OAuth2 authentication failed',
        message: 'Refresh token is invalid or expired. Please regenerate it.',
      });
    }
    
    res.status(500).json({
      error: 'Failed to send email',
      message: error.message,
    });
  }
}

// ============================================
// Example 3: Testing OAuth2 Configuration
// ============================================
async function testOAuth2Configuration() {
  console.log('Testing OAuth2 email configuration...\n');
  
  // Check environment variables
  const requiredVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'FROM_EMAIL'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.error('\nSee EMAIL_SETUP.md for OAuth2 setup instructions.');
    return false;
  }
  
  console.log('✅ All required OAuth2 environment variables are set');
  console.log(`   Client ID: ${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...`);
  console.log(`   Client Secret: ${process.env.GOOGLE_CLIENT_SECRET.substring(0, 10)}...`);
  console.log(`   Refresh Token: ${process.env.GOOGLE_REFRESH_TOKEN.substring(0, 20)}...`);
  console.log(`   From Email: ${process.env.FROM_EMAIL}\n`);
  
  // Try sending a test email
  try {
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    console.log(`Sending test email to: ${testEmail}...`);
    
    const result = await sendResumeByEmailOAuth2(testEmail);
    
    console.log('✅ Test email sent successfully via OAuth2!');
    console.log('   Message ID:', result.messageId);
    return true;
    
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    
    if (error.message.includes('refresh token')) {
      console.error('\n💡 Tip: Your refresh token may have expired.');
      console.error('   Run: node scripts/getRefreshToken.js to generate a new one.');
    }
    
    return false;
  }
}

// ============================================
// Run Examples (uncomment to test)
// ============================================

// basicOAuth2Example();
// testOAuth2Configuration();

export {
  basicOAuth2Example,
  expressRouteOAuth2Example,
  testOAuth2Configuration,
};

