import { useState } from 'react';
import Toast from './Toast';
import { trackResumeEmailSent, trackResumeDownload } from '../utils/analytics';

function Contact() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showSuccessState, setShowSuccessState] = useState(false);

  // Email validation regex (syntactic validation)
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const showToastMessage = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
  };

  const handleDownload = () => {
    // Track download button click
    trackResumeDownload();

    // Download resume from public assets or API
    const resumeUrl = '/resume.pdf'; // Or '/api/download-resume' if using backend
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = 'resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setMessage('');
    setMessageType('');
    setShowSuccessState(false);

    // Client-side email validation
    if (!email.trim()) {
      setMessage('Please enter your email address');
      setMessageType('error');
      showToastMessage('Please enter your email address', 'error');
      return;
    }

    if (!validateEmail(email)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      showToastMessage('Please enter a valid email address', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Using Fetch API
      const response = await fetch('/api/send-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      // Handle 200 (Success)
      if (response.ok) {
        const data = await response.json();
        
        // Track successful email send
        trackResumeEmailSent();
        
        // Show success state
        setShowSuccessState(true);
        setMessage('Resume sent — check your inbox');
        setMessageType('success');
        setEmail(''); // Clear form on success
        
        // Show toast notification
        showToastMessage('Resume sent — check your inbox', 'success');
      }
      // Handle 4xx (Client Errors)
      else if (response.status >= 400 && response.status < 500) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || 
          errorData.error || 
          'Invalid request. Please check your email and try again.';
        setMessage(errorMsg);
        setMessageType('error');
        showToastMessage(errorMsg, 'error');
      }
      // Handle 5xx (Server Errors)
      else if (response.status >= 500) {
        const errorMsg = 'Server error. Please try again later.';
        setMessage(errorMsg);
        setMessageType('error');
        showToastMessage(errorMsg, 'error');
      }
      // Handle other status codes
      else {
        const errorMsg = 'An unexpected error occurred. Please try again.';
        setMessage(errorMsg);
        setMessageType('error');
        showToastMessage(errorMsg, 'error');
      }
    } catch (error) {
      // Network errors or other fetch failures
      console.error('Error:', error);
      const errorMsg = 'Network error. Please check your connection and try again.';
      setMessage(errorMsg);
      setMessageType('error');
      showToastMessage(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section id="contact" className="py-24 px-4">
        <div className="max-w-content mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-text-primary mb-8">
            Contact
          </h2>
          
          {!showSuccessState ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="mb-6">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear error message when user starts typing
                    if (messageType === 'error') {
                      setMessage('');
                      setMessageType('');
                    }
                  }}
                  placeholder="Enter your email address"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text-primary font-sans text-base disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-accent text-white px-8 py-4 rounded-sm hover:bg-accent-hover transition-colors duration-200 font-sans text-base disabled:opacity-50 disabled:cursor-not-allowed w-full"
              >
                {isSubmitting ? 'Sending...' : 'Email me the resume'}
              </button>
              
              {message && messageType === 'error' && (
                <div className="mt-4 text-sm font-sans text-red-600">
                  {message}
                </div>
              )}
            </form>
          ) : (
            // Success State
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl text-text-primary mb-2">
                  Resume sent — check your inbox
                </h3>
                <p className="font-sans text-base text-text-muted mb-6">
                  We've sent the resume to your email address. It may take a few minutes to arrive.
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className="bg-accent text-white px-8 py-4 rounded-sm hover:bg-accent-hover transition-colors duration-200 font-sans text-base w-full"
                >
                  Download Resume Directly
                </button>
                
                <button
                  onClick={() => {
                    setShowSuccessState(false);
                    setEmail('');
                    setMessage('');
                    setMessageType('');
                  }}
                  className="text-text-muted hover:text-text-primary transition-colors duration-200 font-sans text-sm underline"
                >
                  Send to another email
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
          duration={5000}
        />
      )}
    </>
  );
}

export default Contact;
