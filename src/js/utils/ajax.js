/**
 * AJAX utilities for Product Estimator plugin
 *
 * Functions for handling AJAX requests and related operations.
 */

import { createLogger } from './logger'; // Tries to import createLogger directly

const logger = createLogger('UtilsAjax'); // <<< ERROR HAPPENS HERE: createLogger is not a function

/**
 * Handle AJAX request with error handling and consistent response format
 * @param {object} options - AJAX options
 * @returns {Promise} - Promise resolving to response data
 */
export function ajaxRequest(options) {
  const $ = jQuery;

  // Default options
  const defaults = {
    url: window.productEstimatorVars?.ajax_url || (typeof ajaxurl !== 'undefined' ? ajaxurl : '/wp-admin/admin-ajax.php'),
    type: 'POST',
    dataType: 'json'
  };

  // Merge defaults with provided options
  const settings = { ...defaults, ...options };

  return new Promise((resolve, reject) => {
    $.ajax({
      ...settings,
      success: (response) => {
        if (response.success) {
          resolve(response.data);
        } else {
          const error = new Error(response.data?.message || 'Unknown error');
          error.data = response.data;
          reject(error);
        }
      },
      error: (xhr, status, error) => {
        logger.error('AJAX error:', status, error);
        reject(new Error(error));
      }
    });
  });
}

/**
 * Creates a debounced function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Makes a simple WordPress AJAX request with FormData
 * @param {string} action - WordPress AJAX action name
 * @param {object} data - Data to send (excluding action and nonce)
 * @param {string} nonce - Security nonce (defaults to productEstimatorVars.nonce)
 * @returns {Promise} - Promise resolving to response data
 */
export function wpAjax(action, data = {}, nonce = null) {
  // Use the global nonce if available and none provided
  const securityNonce = nonce || (window.productEstimatorVars?.nonce || '');

  // Create FormData object
  const formData = new FormData();
  formData.append('action', action);
  formData.append('nonce', securityNonce);

  // Add all other data
  Object.entries(data).forEach(([key, value]) => {
    // Skip null or undefined values
    if (value === null || value === undefined) {
      return;
    }

    // Handle arrays and objects by JSON-stringifying them
    if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });

  // Make the fetch request
  return fetch(window.productEstimatorVars?.ajax_url || '/wp-admin/admin-ajax.php', {
    method: 'POST',
    credentials: 'same-origin',
    body: formData
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      return response.json();
    })
    .then(response => {
      if (response.success) {
        return response.data;
      } else {
        const error = new Error(response.data?.message || 'Unknown error');
        error.data = response.data;
        throw error;
      }
    });
}

/**
 * Format form data for AJAX submissions
 * @param {FormData | object | string} formData - The form data to format
 * @returns {string} Formatted form data string
 */
export function formatFormData(formData) {
  if (typeof formData === 'string') {
    return formData;
  }

  if (formData instanceof FormData) {
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      params.append(key, value);
    }
    return params.toString();
  }

  // If it's an object, convert to URLSearchParams
  return new URLSearchParams(formData).toString();
}
