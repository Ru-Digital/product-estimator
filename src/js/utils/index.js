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
import * as loggerModule from './logger';

// Export individual modules for direct imports
export { ajax, dom, format, validation, loggerModule};

export const {
  log,
  warn,
  error,
  createLogger, // Directly exporting createLogger
  closeMainPluginLogGroup
} = loggerModule;

// Export all utilities as named exports for backward compatibility
export const {
  ajaxRequest,
  // debounce is also in format, you've prioritized the ajax version
  debounce,
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
} = format;

export const {
  validateEmail,
  validateNumber,
  validateRequired,
  showFieldError,
  clearFieldError,
  showNotice,
} = validation;

// Export a convenience function to safely access nested properties
export function get(obj, path, defaultValue = null) {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === undefined || result === null || typeof result !== 'object') { // Added type check for robustnest
      return defaultValue;
    }
    result = result[key];
  }

  return result === undefined ? defaultValue : result;
}
