/**
 * index.js
 *
 * Main entry point for the Product Estimator plugin.
 * This file initializes the application and loads required modules in the FRONTEND.
 */

import { createLogger } from '@utils';

import EstimatorCore from './EstimatorCore';
import ConfirmationDialog from './ConfirmationDialog';
import { initSuggestionsCarousels } from './SuggestionsCarousel';
import PrintEstimate from './PrintEstimate';
import { initializeTemplates } from './template-loader';
import detailsToggleInstance from './ProductDetailsToggle';

// Initialize templates
initializeTemplates();
const logger = createLogger('FrontEndIndex');


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
  logger.log('Product Estimator initialization check...');

  // Multiple guard checks - check both global flags
  if (window._productEstimatorInitialized) {
    logger.log('Product Estimator already initialized globally, aborting');
    return;
  }

  // Also check for object existence
  if (window.productEstimator && window.productEstimator.initialized) {
    logger.log('Product Estimator initialized property found, aborting');
    window._productEstimatorInitialized = true;
    return;
  }

  // Mark as initialized IMMEDIATELY before continuing
  window._productEstimatorInitialized = true;
  logger.log('Product Estimator initializing for the first time...');

  try {
    // Setup global handlers (only once)
    setupGlobalEventHandlers();

    // Check for jQuery conflicts
    if (typeof jQuery !== 'undefined') {
      // Store the current jQuery version
      window.productEstimator = window.productEstimator || {};
      window.productEstimator.jQuery = jQuery;
    } else {
      logger.warn('jQuery not detected, some features may not work');
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
    logger.error('Error in Product Estimator initialization:', error);
  }
}

/**
 * Initialize the estimator core
 * @param {boolean} debugMode - Whether to enable debug mode
 */
// In index.js (inside initEstimator function)

function initEstimator(debugMode) {
  try {
    // One final check to prevent race conditions
    if (window.productEstimator && window.productEstimator.initialized) {
      logger.log('Product Estimator core already initialized, skipping');
      return;
    }

    logger.log('Initializing EstimatorCore...');

    // Initialize core with configuration
    // This call creates the EstimatorCore.dataService instance internally
    EstimatorCore.init({
      debug: debugMode,
      // Add any other configuration here
    });

    // Make dialog available globally
    window.productEstimator = window.productEstimator || {};
    window.productEstimator.initialized = true;
    window.productEstimator.core = EstimatorCore; // EstimatorCore instance is stored here
    window.productEstimator.dialog = new ConfirmationDialog(); // Initialize dialog

    // Initialize PrintEstimate and make it available globally
    // Get the dataService instance from the initialized EstimatorCore
    const dataServiceInstance = window.productEstimator.core.dataService;

    if (!dataServiceInstance) {
      logger.error("[DataService] instance not found on EstimatorCore. Cannot initialize PrintEstimate.");
      // Optionally return or handle this error case
      return;
    }

    // Pass the dataService instance to the PrintEstimate constructor
    window.productEstimator.printEstimate =  new PrintEstimate({ debug: debugMode }, dataServiceInstance);

    // Make ProductDetailsToggle available globally
    window.productEstimator.detailsToggle = detailsToggleInstance; // Add toggle module to global object

    // Make initSuggestionsCarousels available globally for the toggle functionality
    window.initSuggestionsCarousels = initSuggestionsCarousels;

    // Initialize toggle functionality explicitly
    initializeProductDetailsToggle();

    logger.log(`Product Estimator initialized${debugMode ? ' (debug mode)' : ''}`);

    // Dispatch an event that initialization is complete
    document.dispatchEvent(new CustomEvent('product_estimator_initialized'));
  } catch (e) {
    logger.error('Error during EstimatorCore initialization:', e);
  }
}
/**
 * Initialize the ProductDetailsToggle functionality
 */
function initializeProductDetailsToggle() {
  try {
    // Attach a global click handler to init toggle on product items
    document.addEventListener('click', function(e) {
      // If clicking an accordion header
      if (e.target.closest('.accordion-header')) {
        // Wait for content to be visible
        setTimeout(() => {
          // Force toggle module to scan for new content
          if (detailsToggleInstance && typeof detailsToggleInstance.setup === 'function') {
            logger.log('Accordion clicked, reinitializing product details toggle');
            detailsToggleInstance.setup();
          }

          // Also initialize carousels
          if (typeof initSuggestionsCarousels === 'function') {
            initSuggestionsCarousels();
          }
        }, 300);
      }
    });

    // Set up explicit click handlers for toggle buttons
    document.body.addEventListener('click', function(e) {
      // Handle similar products toggle
      if (e.target.closest('.product-details-toggle')) {
        const toggleButton = e.target.closest('.product-details-toggle');
        const productItem = toggleButton.closest('.product-item');

        if (!productItem) return;

        const isExpanded = toggleButton.classList.contains('expanded');
        const similarProductsContainer = productItem.querySelector('.similar-products-container');

        if (!similarProductsContainer) return;

        // Toggle state
        if (isExpanded) {
          // Hide container
          toggleButton.classList.remove('expanded');
          similarProductsContainer.style.display = 'none';
          similarProductsContainer.classList.remove('visible');
          const icon = toggleButton.querySelector('.toggle-icon');
          if (icon) {
            icon.classList.remove('dashicons-arrow-up-alt2');
            icon.classList.add('dashicons-arrow-down-alt2');
          }
        } else {
          // Show container
          toggleButton.classList.add('expanded');
          similarProductsContainer.style.display = 'block';
          similarProductsContainer.classList.add('visible');
          const icon = toggleButton.querySelector('.toggle-icon');
          if (icon) {
            icon.classList.remove('dashicons-arrow-down-alt2');
            icon.classList.add('dashicons-arrow-up-alt2');
          }

          // Initialize carousels when shown
          if (typeof initSuggestionsCarousels === 'function') {
            initSuggestionsCarousels();
          }
        }

        e.preventDefault();
        e.stopPropagation();
      }

      // Handle notes toggle
      if (e.target.closest('.product-notes-toggle')) {
        const toggleButton = e.target.closest('.product-notes-toggle');
        const productItem = toggleButton.closest('.product-item');

        if (!productItem) return;

        const isExpanded = toggleButton.classList.contains('expanded');
        const notesContainer = productItem.querySelector('.notes-container');

        if (!notesContainer) return;

        // Toggle state
        if (isExpanded) {
          // Hide container
          toggleButton.classList.remove('expanded');
          notesContainer.style.display = 'none';
          notesContainer.classList.remove('visible');
          const icon = toggleButton.querySelector('.toggle-icon');
          if (icon) {
            icon.classList.remove('dashicons-arrow-up-alt2');
            icon.classList.add('dashicons-arrow-down-alt2');
          }
        } else {
          // Show container
          toggleButton.classList.add('expanded');
          notesContainer.style.display = 'block';
          notesContainer.classList.add('visible');
          const icon = toggleButton.querySelector('.toggle-icon');
          if (icon) {
            icon.classList.remove('dashicons-arrow-down-alt2');
            icon.classList.add('dashicons-arrow-up-alt2');
          }
        }

        e.preventDefault();
        e.stopPropagation();
      }

      // Handle includes toggle
      if (e.target.closest('.product-includes-toggle')) {
        const toggleButton = e.target.closest('.product-includes-toggle');
        const productItem = toggleButton.closest('.product-item');

        if (!productItem) return;

        const isExpanded = toggleButton.classList.contains('expanded');
        const includesContainer = productItem.querySelector('.includes-container');

        if (!includesContainer) return;

        // Toggle state
        if (isExpanded) {
          // Hide container
          toggleButton.classList.remove('expanded');
          includesContainer.style.display = 'none';
          includesContainer.classList.remove('visible');
          const icon = toggleButton.querySelector('.toggle-icon');
          if (icon) {
            icon.classList.remove('dashicons-arrow-up-alt2');
            icon.classList.add('dashicons-arrow-down-alt2');
          }
        } else {
          // Show container
          toggleButton.classList.add('expanded');
          includesContainer.style.display = 'block';
          includesContainer.classList.add('visible');
          const icon = toggleButton.querySelector('.toggle-icon');
          if (icon) {
            icon.classList.remove('dashicons-arrow-down-alt2');
            icon.classList.add('dashicons-arrow-up-alt2');
          }
        }

        e.preventDefault();
        e.stopPropagation();
      }

      // Handle suggestions toggle
      if (e.target.closest('.product-suggestions-toggle')) {
        const toggleButton = e.target.closest('.product-suggestions-toggle');
        const accordionContent = toggleButton.closest('.accordion-content');

        if (!accordionContent) return;

        const isExpanded = toggleButton.classList.contains('expanded');
        const suggestionsContainer = accordionContent.querySelector('.suggestions-container');

        if (!suggestionsContainer) return;

        // Toggle state
        if (isExpanded) {
          // Hide container
          toggleButton.classList.remove('expanded');
          suggestionsContainer.style.display = 'none';
          suggestionsContainer.classList.remove('visible');
          const icon = toggleButton.querySelector('.toggle-icon');
          if (icon) {
            icon.classList.remove('dashicons-arrow-up-alt2');
            icon.classList.add('dashicons-arrow-down-alt2');
          }
        } else {
          // Show container
          toggleButton.classList.add('expanded');
          suggestionsContainer.style.display = 'block';
          suggestionsContainer.classList.add('visible');
          const icon = toggleButton.querySelector('.toggle-icon');
          if (icon) {
            icon.classList.remove('dashicons-arrow-down-alt2');
            icon.classList.add('dashicons-arrow-up-alt2');
          }

          // Initialize carousels when shown
          if (typeof initSuggestionsCarousels === 'function') {
            initSuggestionsCarousels();
          }
        }

        e.preventDefault();
        e.stopPropagation();
      }


    });

    logger.log('[ProductDetailsToggle] initialization complete');
  } catch (error) {
    logger.error('Error initializing ProductDetailsToggle:', error);
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
    logger.log('Global event handlers already added, skipping');
    return;
  }

  logger.log('Setting up global event handlers...');

  // Create and store handler reference
  window._productEstimatorCloseHandler = function(e) {
    if (e.target.closest('.product-estimator-modal-close') ||
      e.target.classList.contains('product-estimator-modal-overlay')) {
      logger.log('Global close handler triggered');

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
  logger.log('Global event handlers added');
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
export default EstimatorCore
