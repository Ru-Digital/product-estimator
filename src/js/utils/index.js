/**
 * Main utilities export file
 *
 * This module exports all utility functions from submodules,
 * providing a unified API while maintaining organization.
 */

// Import all utility modules
import * as ajax from './ajax';
import * as dom from './dom';
import * as format from './format';
import * as validation from './validation';

// Export individual modules for direct imports
export { ajax, dom, format, validation };

// Export all utilities as named exports for backward compatibility
export const {
  ajaxRequest,
  debounce,     // Also in format, we prioritize the ajax version
} = ajax;

export const {
  createElement,
  createElementFromHTML,
  closest,
  toggleVisibility,
  forceElementVisibility,
  findParentBySelector,
  insertAfter,
  removeElement,
  addEventListenerOnce,
} = dom;

export const {
  formatPrice,
  sanitizeHTML,
  // debounce is also defined here but we use the one from ajax
} = format;

export const {
  validateEmail,
  validateNumber,
  validateRequired,
  showFieldError,
  clearFieldError,
  showNotice,
} = validation;

// Export a helper function for logging with conditional debug flag
export function log(component, ...args) {
  if (window.productEstimatorVars?.debug) {
    console.log(`[${component}]`, ...args);
  }
}

// Export a convenience function to safely access nested properties
export function get(obj, path, defaultValue = null) {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === undefined || result === null) {
      return defaultValue;
    }
    result = result[key];
  }

  return result === undefined ? defaultValue : result;
}
