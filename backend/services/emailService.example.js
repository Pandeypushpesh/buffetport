/**
 * Usage Example for sendResumeByEmail()
 * * This file demonstrates how to use the sendResumeByEmail function
 * in different scenarios.
 */

import { sendResumeByEmail } from './services/emailService.js'; // Assuming you moved it to /services
import dotenv from 'dotenv';
import * as url from 'url'; // Required for ES Modules context
import path from 'path';

// Load environment variables
dotenv.config();

// Utility to get __dirname in ES module scope
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// --- Environment Variable Check for Demonstration ---
const REQUIRED_VARS = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'];
const TEST_EMAIL = process.env.TEST_EMAIL || 'test-recipient@example.com';
const BATCH_EMAILS = [
    'batch-1@example.com', 
    'batch-2@example.com', 
    // Add a deliberately bad email here to test error handling
    // 'bad-email-format', 
];

// ============================================
// Example 1: Basic Usage (Corrected)
// ============================================
async function basicExample(recipientEmail = TEST_EMAIL) {
    console.log('\n--- Running Basic Example ---');
    try {
        const result = await sendResumeByEmail(recipientEmail);
        
        console.log('✅ Basic Send Success!');
        console.log(`   Message ID: ${result.messageId}`);
        console.log(`   Message: ${result.message}`);
        console.log(`   Recipient: ${recipientEmail}`); // Corrected: using the input variable
        
    } catch (error) {
        console.error('❌ Basic Example Failed to send email:', error.message);
    }
}

// ============================================
// Example 2: Usage in Express Route Handler (Utility only)
// ============================================
// (This is primarily for demonstration; cannot be run standalone)
async function expressRouteExample(req, res) {
    // ... (content remains the same as your original) ...
}

// ============================================
// Example 3: Batch Sending (with error handling)
// ============================================
async function batchSendExample(emails) {
    console.log('\n--- Running Batch Send Example ---');
    const results = {
        successful: [],
        failed: [],
    };

    for (const email of emails) {
        try {
            const result = await sendResumeByEmail(email);
            results.successful.push({
                email,
                messageId: result.messageId,
            });
            console.log(`✅ Sent to ${email}`);
            
            // Add delay between emails to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            results.failed.push({
                email,
                error: error.message,
            });
            console.error(`❌ Failed to send to ${email}:`, error.message.substring(0, 80) + '...');
        }
    }

    console.log('Batch Results:', results);
    return results;
}

// ============================================
// Example 4: With Retry Logic
// ============================================
async function sendWithRetry(email, maxRetries = 3) {
    console.log('\n--- Running Send with Retry Example ---');
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt} of ${maxRetries}...`);
            const result = await sendResumeByEmail(email);
            console.log(`✅ Retry success on attempt ${attempt}!`);
            return result;
            
        } catch (error) {
            lastError = error;
            console.error(`Attempt ${attempt} failed:`, error.message);
            
            // Don't retry on critical errors like authentication
            if (error.message.includes('authentication') || error.message.includes('Missing required')) {
                throw error;
            }
            
            // Wait before retrying (exponential backoff)
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
                console.log(`Waiting ${delay / 1000}s before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw new Error(`❌ Send With Retry Failed after ${maxRetries} attempts: ${lastError.message}`);
}

// ============================================
// Example 5: Testing Email Configuration
// ============================================
async function testEmailConfiguration() {
    console.log('\n--- Running Configuration Test ---');
    
    const missing = REQUIRED_VARS.filter(v => !process.env[v]);
    
    if (missing.length > 0) {
        console.error('❌ Missing environment variables:', missing.join(', '));
        return false;
    }
    
    console.log('✅ All required environment variables are set');
    console.log(`   SMTP Host: ${process.env.SMTP_HOST}`);
    console.log(`   SMTP User: ${process.env.SMTP_USER}`);
    
    // Try sending a test email
    try {
        console.log(`Sending test email to: ${TEST_EMAIL}...`);
        
        const result = await sendResumeByEmail(TEST_EMAIL);
        
        console.log('✅ Test email sent successfully!');
        console.log('   Message ID:', result.messageId);
        return true;
        
    } catch (error) {
        console.error('❌ Test email failed:', error.message);
        return false;
    }
}

// ============================================
// Main Execution Block
// ============================================
async function main() {
    console.log('Starting Email Service Demonstration...');
    
    // 1. Run Config Test first
    const configOK = await testEmailConfiguration();
    
    if (configOK) {
        // 2. Run Basic Example
        await basicExample('primary-test@example.com'); 
        
        // 3. Run Batch Example (using mock emails to avoid spam/rate limit issues)
        // await batchSendExample(BATCH_EMAILS); 
        
        // 4. Run Retry Example (only useful if you expect transient network errors)
        // Note: For a successful test, it will only take 1 attempt.
        // await sendWithRetry('retry-test@example.com', 3);
        
    } else {
        console.warn('\nSkipping advanced examples due to configuration failure.');
    }
    
    console.log('\nDemonstration complete.');
}

// Run the main function
main().catch(err => {
    console.error('\nAn unhandled error occurred during main execution:', err);
});


export {
    basicExample,
    expressRouteExample,
    batchSendExample,
    sendWithRetry,
    testEmailConfiguration,
};