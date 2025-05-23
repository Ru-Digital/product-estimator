/**
 * CustomerStorage.js
 *
 * Handles customer details persistence using localStorage and sessionStorage.
 * Uses the 'productEstimatorCustomerData' key for storage.
 */

const STORAGE_KEY = 'productEstimatorCustomerData';
import { createLogger } from '@utils';
const logger = createLogger('CustomerStorage');

/**
 * Load customer details from localStorage with fallback to sessionStorage.
 * @returns {object} Customer details object.
 */
export function loadCustomerDetails() {
  try {
    const storedDetails = localStorage.getItem(STORAGE_KEY);
    if (storedDetails) {
      return JSON.parse(storedDetails);
    } else {
      const sessionDetails = sessionStorage.getItem(STORAGE_KEY);
      return sessionDetails ? JSON.parse(sessionDetails) : {};
    }
  } catch (error) {
    logger.error('Error loading customer details:', error);
    return {}; // Return empty object on error
  }
}

/**
 * Save customer details to localStorage with fallback to sessionStorage.
 * @param {object} details - Customer details to save.
 */
export function saveCustomerDetails(details) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
  } catch (localStorageError) {
    logger.warn('localStorage not available, using sessionStorage:', localStorageError);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(details));
    } catch (sessionStorageError) {
      logger.error('sessionStorage not available:', sessionStorageError);
      // If neither is available, details won't persist, but we can continue
    }
  }
}

/**
 * Clear customer details from both localStorage and sessionStorage.
 */
export function clearCustomerDetails() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (localStorageError) {
    logger.warn('localStorage not available:', localStorageError);
  }
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (sessionStorageError) {
    logger.warn('sessionStorage not available:', sessionStorageError);
  }
}

// You can also export these functions as a default object if preferred:
/*
export default {
  loadCustomerDetails,
  saveCustomerDetails,
  clearCustomerDetails
};
*/
