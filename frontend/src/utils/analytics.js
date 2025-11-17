/**
 * Analytics Utility Functions
 * Supports Google Analytics (gtag) and Plausible Analytics
 */

/**
 * Track event with Google Analytics
 * @param {string} eventName - Event name
 * @param {object} eventParams - Event parameters
 */
export const trackGAEvent = (eventName, eventParams = {}) => {
  // Check if gtag is available (Google Analytics)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
    console.log('GA Event tracked:', eventName, eventParams);
  } else {
    console.log('GA not loaded. Event would be:', eventName, eventParams);
  }
};

/**
 * Track event with Plausible Analytics
 * @param {string} eventName - Event name
 * @param {object} props - Event properties
 */
export const trackPlausibleEvent = (eventName, props = {}) => {
  // Check if plausible is available
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props });
    console.log('Plausible event tracked:', eventName, props);
  } else {
    console.log('Plausible not loaded. Event would be:', eventName, props);
  }
};

/**
 * Track event with both analytics (if available)
 * @param {string} eventName - Event name
 * @param {object} eventData - Event data
 */
export const trackEvent = (eventName, eventData = {}) => {
  // Track with Google Analytics
  trackGAEvent(eventName, {
    event_category: eventData.category || 'Resume',
    event_label: eventData.label || '',
    value: eventData.value || 0,
    ...eventData,
  });

  // Track with Plausible
  trackPlausibleEvent(eventName, eventData);
};

/**
 * Track resume email sent
 */
export const trackResumeEmailSent = () => {
  trackEvent('resume_email_sent', {
    category: 'Resume',
    label: 'Email Sent',
  });
};

/**
 * Track resume download button click
 */
export const trackResumeDownload = () => {
  trackEvent('resume_download_clicked', {
    category: 'Resume',
    label: 'Download Button',
  });
};

