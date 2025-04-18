/**
 * EstimatorCore.js
 *
 * Main entry point for the Product Estimator JS.
 * Coordinates between modules and manages global state.
 */

import DataService from './DataService';
import ModalManager from './ModalManager';
import VariationHandler from './VariationHandler';
import CustomerDetailsManager from './CustomerDetailsManager';


class EstimatorCore {
  /**
   * Initialize the EstimatorCore
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    // Default configuration
    this.config = Object.assign({
      debug: false,
      selectors: {
        estimatorButtons: '.product-estimator-button, .single_add_to_estimator_button, .open-estimator-modal',
        estimatorMenuButtons: '.product-estimator-menu-item a, a.product-estimator-menu-item',
        modalContainer: '#product-estimator-modal'
      },
      autoInit: true
    }, config);

    // Module references
    this.dataService = null;
    this.modalManager = null;
    this.variationHandler = null;
    this.customerDetailsManager = null;

    // State
    this.initialized = false;
    this.eventHandlers = {};

    // Auto-initialize if configured
    if (this.config.autoInit) {
      this.init();
    }
  }

  /**
   * Initialize the core and all modules
   * @returns {EstimatorCore} This instance for chaining
   */
  init() {
    // Strong guard against multiple initialization
    if (this.initialized) {
      this.log('EstimatorCore already initialized - aborting');
      return this;
    }

    // Also check for global init status
    if (window._productEstimatorInitialized && window.productEstimator && window.productEstimator.core) {
      this.log('EstimatorCore detected as already initialized globally - aborting');
      this.initialized = true;
      return this;
    }

    this.log('Initializing EstimatorCore');

    try {
      // Verify jQuery is properly loaded
      if (typeof jQuery === 'undefined') {
        console.error('jQuery is not loaded, cannot initialize EstimatorCore');
        return this;
      }

      // Create a single data service instance
      if (!this.dataService) {
        this.dataService = new DataService({ debug: this.config.debug });
      }

      // Safe initialization with clear console marking
      console.log('%c=== PRODUCT ESTIMATOR INITIALIZATION START ===', 'background: #f0f0f0; color: #333; padding: 3px; border-radius: 3px;');

      // Ensure we wait for DOM to be fully ready with a clear initialization boundary
      const initializeComponents = () => {
        if (this.modalManager) {
          this.log('Components already initialized - skipping');
          return;
        }

        // Initialize modal manager
        this.modalManager = new ModalManager({
          debug: this.config.debug,
          selectors: this.config.selectors
        }, this.dataService);

        // Initialize customer details manager
        this.customerDetailsManager = new CustomerDetailsManager({
          debug: this.config.debug
        }, this.dataService);

        // Initialize variation handler if on product page
        if (this.isWooCommerceProductPage()) {
          this.log('WooCommerce product page detected, initializing VariationHandler');
          this.variationHandler = new VariationHandler({ debug: this.config.debug });
        }

        this.bindGlobalEvents();
        this.initialized = true;
        this.log('EstimatorCore initialized successfully');
        this.emit('core:initialized');

        console.log('%c=== PRODUCT ESTIMATOR INITIALIZATION COMPLETE ===', 'background: #f0f0f0; color: #333; padding: 3px; border-radius: 3px;');
      };

      // Use a small delay to ensure DOM is ready
      if (document.readyState === 'complete') {
        initializeComponents();
      } else {
        window.addEventListener('load', initializeComponents, { once: true });
      }

    } catch (error) {
      console.error('EstimatorCore initialization error:', error);
    }

    return this;
  }


  /**
   * Bind global events
   */
  bindGlobalEvents() {
    try {
      // IMPORTANT: Remove any existing event listeners first
      if (this._clickHandler) {
        document.removeEventListener('click', this._clickHandler);
      }

      // Create a single handler function and store a reference to it
      this._clickHandler = (e) => {
        // Handle menu buttons (force list view)
        const menuButton = e.target.closest(this.config.selectors.estimatorMenuButtons);
        if (menuButton) {
          e.preventDefault();
          e.stopPropagation();
          this.log('Menu button clicked - opening modal in list view');
          if (this.modalManager) {
            // Pass true as second parameter to force list view mode
            this.modalManager.openModal(null, true);
          }
          return;
        }

        // Handle regular product buttons
        const button = e.target.closest(this.config.selectors.estimatorButtons);
        if (button && !menuButton) {  // Ensure we don't process both if menu button matches both selectors
          e.preventDefault();
          e.stopPropagation();

          // Get product ID from data attribute
          const productId = button.dataset.productId || null;

          console.log('PRODUCT BUTTON CLICKED:', {
            productId: productId,
            buttonElement: button,
            dataAttribute: button.dataset
          });

          if (this.modalManager) {
            console.log('OPENING MODAL WITH:', {
              productId: productId,
              forceListView: false
            });

            // Explicitly pass productId and set forceListView to false
            this.modalManager.openModal(productId, false);
          }
        }
      };

      // Add the event listener with our stored handler
      document.addEventListener('click', this._clickHandler);

      // Emit event for monitoring
      this.emit('core:eventsbound');
      this.log('Global events bound');
    } catch (error) {
      console.error('Error binding global events:', error);
    }
  }

  /**
   * Close the modal if open
   */
  closeModal() {
    if (this.modalManager) {
      this.modalManager.closeModal();
    }
  }

  /**
   * Check if we're on a WooCommerce product page
   * @returns {boolean} True if on a product page
   */
  isWooCommerceProductPage() {
    return document.body.classList.contains('single-product') ||
      document.body.classList.contains('product-template-default') ||
      !!document.querySelector('.product.type-product');
  }

  /**
   * Register an event handler
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @returns {EstimatorCore} This instance for chaining
   */
  on(event, callback) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(callback);
    return this;
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   * @returns {EstimatorCore} This instance for chaining
   */
  emit(event, data) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(callback => callback(data));
    }
    return this;
  }

  /**
   * Log debug messages
   * @param {...any} args - Arguments to log
   */
  log(...args) {
    if (this.config.debug) {
      console.log('[EstimatorCore]', ...args);
    }
  }
}

// Create and export a singleton instance
const estimatorCore = new EstimatorCore({ debug: true });

export default estimatorCore;
