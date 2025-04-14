/**
 * index.js
 *
 * Main entry point for the Product Estimator plugin.
 * This file initializes the application and loads required modules.
 */

import EstimatorCore from './EstimatorCore';
import ConfirmationDialog from './ConfirmationDialog';


// Global initialization tracker - defined at the top level
window._productEstimatorInitialized = window._productEstimatorInitialized || false;

// Only set up initialization once
if (!window._setupInitDone) {
  window._setupInitDone = true;

  // Check if the DOM is already loaded
  if (document.readyState === 'loading') {
    // Add event listener if DOM not yet loaded, using {once: true} to ensure it runs only once
    document.addEventListener('DOMContentLoaded', initApp, { once: true });
  } else {
    // DOM already loaded, initialize immediately
    initApp();
  }
}

/**
 * Initialize the application
 */
function initApp() {
  console.log('Product Estimator initialization check...');

  // Multiple guard checks - check both global flags
  if (window._productEstimatorInitialized) {
    console.log('Product Estimator already initialized globally, aborting');
    return;
  }

  // Also check for object existence
  if (window.productEstimator && window.productEstimator.initialized) {
    console.log('Product Estimator initialized property found, aborting');
    window._productEstimatorInitialized = true;
    return;
  }

  // Mark as initialized IMMEDIATELY before continuing
  window._productEstimatorInitialized = true;
  console.log('Product Estimator initializing for the first time...');

  try {
    // Setup global handlers (only once)
    setupGlobalEventHandlers();

    // Check for jQuery conflicts
    if (typeof jQuery !== 'undefined') {
      // Store the current jQuery version
      window.productEstimator = window.productEstimator || {};
      window.productEstimator.jQuery = jQuery;
    } else {
      console.warn('jQuery not detected, some features may not work');
    }

    // Get debug mode from URL parameter or localStorage
    const debugMode = getDebugMode();

    // Ensure DOM is fully loaded
    if (document.readyState === 'complete') {
      // DOM is fully loaded, initialize right away with a minimal delay
      setTimeout(() => initEstimator(debugMode), 10);
    } else {
      // DOM content is loaded but resources may still be loading
      // Use a longer delay to ensure everything is ready
      setTimeout(() => initEstimator(debugMode), 500);
    }
  } catch (error) {
    console.error('Error in Product Estimator initialization:', error);
  }
}

/**
 * Initialize the estimator core
 */
function initEstimator(debugMode) {
  try {
    // One final check to prevent race conditions
    if (window.productEstimator && window.productEstimator.initialized) {
      console.log('Product Estimator core already initialized, skipping');
      return;
    }

    console.log('Initializing EstimatorCore...');

    // Initialize core with configuration
    EstimatorCore.init({
      debug: debugMode,
      // Add any other configuration here
    });

    // Make dialog available globally
    window.productEstimator = window.productEstimator || {};
    window.productEstimator.initialized = true;
    window.productEstimator.core = EstimatorCore;
    window.productEstimator.dialog = ConfirmationDialog; // Add dialog to global object

    console.log(`Product Estimator initialized${debugMode ? ' (debug mode)' : ''}`);
  } catch (e) {
    console.error('Error during EstimatorCore initialization:', e);
  }
}

/**
 * Track global handlers with a dedicated flag
 */
let globalHandlersAdded = false;

/**
 * Setup global event handlers (ensures they're only added once)
 */
function setupGlobalEventHandlers() {
  // Only run once
  if (globalHandlersAdded) {
    console.log('Global event handlers already added, skipping');
    return;
  }

  console.log('Setting up global event handlers...');

  // Create and store handler reference
  window._productEstimatorCloseHandler = function(e) {
    if (e.target.closest('.product-estimator-modal-close') ||
      e.target.classList.contains('product-estimator-modal-overlay')) {
      console.log('Global close handler triggered');

      // Find the modal
      const modal = document.querySelector('#product-estimator-modal');
      if (modal) {
        // Hide it directly as a fallback approach
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');

        // Also try to notify the core
        if (window.productEstimator && window.productEstimator.core) {
          window.productEstimator.core.closeModal();
        }
      }
    }
  };

  // Remove any existing handler first (important!)
  document.removeEventListener('click', window._productEstimatorCloseHandler);
  // Add the handler
  document.addEventListener('click', window._productEstimatorCloseHandler);

  globalHandlersAdded = true;
  console.log('Global event handlers added');
}

/**
 * Check if debug mode should be enabled
 * @returns {boolean} Whether debug mode is enabled
 */
function getDebugMode() {
  // Check URL parameters first
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('product_estimator_debug')) {
    const enabled = urlParams.get('product_estimator_debug') !== 'false';

    // Store in localStorage for future page loads
    if (enabled) {
      localStorage.setItem('product_estimator_debug', 'true');
    } else {
      localStorage.removeItem('product_estimator_debug');
    }

    return enabled;
  }

  // Check localStorage
  return localStorage.getItem('product_estimator_debug') === 'true';
}

// Export the core for potential external access
export default EstimatorCore;
