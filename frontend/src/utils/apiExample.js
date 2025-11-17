/**
 * API Integration Examples
 * 
 * This file contains examples of how to call the /api/send-resume endpoint
 * using both Fetch API and Axios.
 */

// ============================================
// EXAMPLE 1: Using Fetch API (Built-in)
// ============================================

export const sendResumeWithFetch = async (email) => {
  try {
    const response = await fetch('/api/send-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    // Handle 200 (Success)
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: data.message || 'Resume sent successfully!',
        data
      };
    }

    // Handle 4xx (Client Errors)
    if (response.status >= 400 && response.status < 500) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: 'client_error',
        message: errorData.message || errorData.error || 'Invalid request',
        status: response.status
      };
    }

    // Handle 5xx (Server Errors)
    if (response.status >= 500) {
      return {
        success: false,
        error: 'server_error',
        message: 'Server error. Please try again later.',
        status: response.status
      };
    }

    // Handle other status codes
    return {
      success: false,
      error: 'unknown_error',
      message: 'An unexpected error occurred.',
      status: response.status
    };

  } catch (error) {
    // Network errors or other fetch failures
    return {
      success: false,
      error: 'network_error',
      message: 'Network error. Please check your connection.',
      originalError: error
    };
  }
};

// ============================================
// EXAMPLE 2: Using Axios (Requires installation)
// ============================================
// To use Axios, first install it:
// npm install axios
//
// Then import: import axios from 'axios';

/*
export const sendResumeWithAxios = async (email) => {
  try {
    const response = await axios.post('/api/send-resume', {
      email
    });

    // Handle 200 (Success) - Axios automatically throws for 4xx/5xx
    // So if we reach here, it's a success
    return {
      success: true,
      message: response.data.message || 'Resume sent successfully!',
      data: response.data
    };

  } catch (error) {
    // Axios error handling
    if (error.response) {
      // Server responded with error status (4xx, 5xx)
      const status = error.response.status;
      const errorData = error.response.data;

      // Handle 4xx (Client Errors)
      if (status >= 400 && status < 500) {
        return {
          success: false,
          error: 'client_error',
          message: errorData?.message || errorData?.error || 'Invalid request',
          status
        };
      }

      // Handle 5xx (Server Errors)
      if (status >= 500) {
        return {
          success: false,
          error: 'server_error',
          message: 'Server error. Please try again later.',
          status
        };
      }
    } else if (error.request) {
      // Request made but no response received (network error)
      return {
        success: false,
        error: 'network_error',
        message: 'Network error. Please check your connection.'
      };
    } else {
      // Something else happened
      return {
        success: false,
        error: 'unknown_error',
        message: 'An unexpected error occurred.',
        originalError: error.message
      };
    }
  }
};
*/

// ============================================
// USAGE EXAMPLE IN COMPONENT
// ============================================

/*
import { sendResumeWithFetch } from '../utils/apiExample';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateEmail(email)) {
    setMessage('Please enter a valid email address');
    setMessageType('error');
    return;
  }

  setIsSubmitting(true);
  setMessage('');
  setMessageType('');

  const result = await sendResumeWithFetch(email);

  if (result.success) {
    setMessage(result.message);
    setMessageType('success');
    setEmail('');
  } else {
    setMessage(result.message);
    setMessageType('error');
  }

  setIsSubmitting(false);
};
*/

