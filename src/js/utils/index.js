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

// In index.js
export function closeMainPluginLogGroup() {
  if (window.productEstimatorVars?.debug) {
    console.log('%cAttempting to close main plugin group. Flag is: ' + pluginLogGroupHasStarted, 'color: red');
    if (pluginLogGroupHasStarted) {
      console.groupEnd();
      pluginLogGroupHasStarted = false;
      console.log('%cMain plugin group closed. Flag set to: ' + pluginLogGroupHasStarted, 'color: purple');
    } else {
      console.warn('%cClose called, but logger flag indicates no main group was started or it was already closed.', 'color: orange');
    }
  }
}

let pluginLogGroupHasStarted = false;

function ensureMainPluginLogGroupIsStarted(startCollapsed = true) {
  // (Keep the version with diagnostic logs from above for testing)
  if (!pluginLogGroupHasStarted && window.productEstimatorVars?.debug) {
    if (startCollapsed) {
      console.groupCollapsed(`[ProductEstimator] Logs`);
    } else {
      console.group(`[ProductEstimator] Logs`);
    }
    pluginLogGroupHasStarted = true;
  } else if (window.productEstimatorVars?.debug) {
  }
}

// --- MODIFIED STANDALONE LOG FUNCTIONS ---
// These will now also log within the main plugin group.

export function log(component, ...args) {
  if (window.productEstimatorVars?.debug) {
    ensureMainPluginLogGroupIsStarted();
    console.log(`[${component}]`, ...args);
  }
}

export function warn(component, ...args) {
  if (window.productEstimatorVars?.debug) {
    ensureMainPluginLogGroupIsStarted();
    console.warn(`[${component}]`, ...args);
  }
}

export function error(component, ...args) {
  if (window.productEstimatorVars?.debug) {
    ensureMainPluginLogGroupIsStarted(false); // Attempt to expand main group on error
    console.error(`[${component}]`, ...args);
  }
}

// --- MODIFIED createLogger FUNCTION ---
/**
 * Logger Factory Function
 * Creates a logger instance pre-configured with a component name,
 * and manages logging within the main plugin console group.
 * @param {string} componentName - The name of the component for log prefixing.
 * @returns {object} An object with log, warn, error, group, and groupEnd methods.
 */
export function createLogger(componentName) {
  const componentLabel = `[${componentName}]`;

  // Option 1: Ensure group is started when logger is created.
  // if (window.productEstimatorVars?.debug) { // This initial call is fine
  //   ensureMainPluginLogGroupIsStarted();
  // }

  return {
    log: (...args) => {
      if (window.productEstimatorVars?.debug) {
        ensureMainPluginLogGroupIsStarted(); // This ensures it for any log call
        console.log(componentLabel, ...args);
      }
    },
    warn: (...args) => {
      if (window.productEstimatorVars?.debug) {
        ensureMainPluginLogGroupIsStarted();
        console.warn(componentLabel, ...args);
      }
    },
    error: (...args) => {
      if (window.productEstimatorVars?.debug) {
        ensureMainPluginLogGroupIsStarted(false);
        console.error(componentLabel, ...args);
      }
    },
    group: (groupName = 'Details', collapsed = true) => {
      if (window.productEstimatorVars?.debug) {
        ensureMainPluginLogGroupIsStarted();
        const fullGroupLabel = `${componentLabel} ${groupName}`;
        if (collapsed) {
          console.groupCollapsed(fullGroupLabel);
        } else {
          console.group(fullGroupLabel);
        }
      }
    },
    groupEnd: () => {
      if (window.productEstimatorVars?.debug && pluginLogGroupHasStarted) {
        console.groupEnd();
      }
    },
  };
}

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
