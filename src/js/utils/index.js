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
import * as dialogHelpers from './dialog-helpers';
import * as labels from './labels';

// Export individual modules for direct imports
export { ajax, dom, format, validation, loggerModule, dialogHelpers, labels };

// Export specific items from labels
export { labelManager, LabelManager } from './labels';

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

// Re-export dialog helper functions from the default export
export const showSuccessDialog = dialogHelpers.default.showSuccessDialog;
export const showErrorDialog = dialogHelpers.default.showErrorDialog;
export const showWarningDialog = dialogHelpers.default.showWarningDialog;
export const showDeleteConfirmDialog = dialogHelpers.default.showDeleteConfirmDialog;
export const showConfirmDialog = dialogHelpers.default.showConfirmDialog;

// Export a convenience function to safely access nested properties
/**
 * Safely access nested properties in an object
 * @param {object} obj - The object to access
 * @param {string} path - The path to the property (dot notation, e.g., 'prop1.prop2.prop3')
 * @param {*} defaultValue - The value to return if the property doesn't exist
 * @returns {*} The value at the specified path or the default value if not found
 */
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
