/**
 * EstimatorCore.js
 *
 * Main entry point for the Product Estimator JS.
 * Coordinates between modules and manages global state.
 */

import { createLogger, closeMainPluginLogGroup } from '@utils'; // Make sure closeMainPluginLogGroup is imported
import eventBus from './core/EventBus';

import DataService from './DataService';
import ModalManager from './managers/ModalManager';
import VariationHandler from './VariationHandler';
import CustomerDetailsManager from './CustomerDetailsManager';

const logger = createLogger('EstimatorCore');

class EstimatorCore {
  /**
   * Initialize the EstimatorCore
   * @param {object} config - Configuration options
   */
  constructor(config = {}) {

    this.isActive = true;

    // Default configuration
    this.config = Object.assign({
      debug: false,
      selectors: {
        estimatorButtons: '.product-estimator-button, .single_add_to_estimator_button, .open-estimator-modal',
        estimatorMenuButtons: '.product-estimator-menu-item a, a.product-estimator-menu-item',
        modalContainer: '#product-estimator-modal'
      },
      autoInit: true,
      i18n: window.productEstimatorVars?.i18n || {} // Get i18n from global vars on init

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
      logger.log('already initialized - aborting');
      return this;
    }

    // Also check for global init status
    if (window._productEstimatorInitialized && window.productEstimator && window.productEstimator.core) {
      logger.log('detected as already initialized globally - aborting');
      this.initialized = true;
      return this;
    }

    logger.log('Initializing EstimatorCore');

    try {
      // Verify jQuery is properly loaded
      if (typeof jQuery === 'undefined') {
        logger.error('jQuery is not loaded, cannot initialize EstimatorCore');
        return this;
      }

      // Create a single data service instance
      if (!this.dataService) {
        this.dataService = new DataService({ debug: this.config.debug });
      }

      // Safe initialization with clear console marking
      logger.log('%c=== PRODUCT ESTIMATOR INITIALIZATION START ===', 'background: #f0f0f0; color: #333; padding: 3px; border-radius: 3px;');

      // Ensure we wait for DOM to be fully ready with a clear initialization boundary
      const initializeComponents = () => {
        if (this.modalManager) {
          logger.log('Components already initialized - skipping');
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
          logger.log('WooCommerce product page detected, initializing VariationHandler');
          this.variationHandler = new VariationHandler({ debug: this.config.debug });
        }

        this.bindGlobalEvents();
        this.initialized = true;
        logger.log('initialized successfully');
        
        // Enable debug mode on EventBus in development
        if (this.config.debug) {
          eventBus.setDebug(true);
        }
        
        // Emit core initialized event through both systems
        this.emit('core:initialized');

        logger.log('%c=== PRODUCT ESTIMATOR INITIALIZATION COMPLETE ===', 'background: #f0f0f0; color: #333; padding: 3px; border-radius: 3px;');
      };

      // Use a small delay to ensure DOM is ready
      if (document.readyState === 'complete') {
        initializeComponents();
      } else {
        window.addEventListener('load', initializeComponents, { once: true });
      }

    } catch (error) {
      logger.error('EstimatorCore initialization error:', error);
    }

    return this;
  }


  /**
   * Binds global event handlers for the estimator
   * Sets up click handlers for estimator buttons and menu items
   * Creates a single event handler and stores a reference to avoid memory leaks
   * @returns {void}
   */
  bindGlobalEvents() {
    try {
      // IMPORTANT: Remove any existing event listeners first
      if (this._clickHandler) {
        document.removeEventListener('click', this._clickHandler);
        logger.log('Removed existing click handler');
      }

      // Create a single handler function and store a reference to it
      this._clickHandler = (e) => {
        // Handle menu buttons (force list view)
        const menuButton = e.target.closest(this.config.selectors.estimatorMenuButtons);
        if (menuButton) {
          e.preventDefault();
          e.stopPropagation();
          logger.log('Menu button clicked - opening modal in list view');
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
          e.stopImmediatePropagation(); // Prevent any other handlers from running

          // Get product ID from data attribute
          const productId = button.dataset.productId || null;

          logger.log('PRODUCT BUTTON CLICKED:', {
            productId: productId,
            buttonElement: button,
            dataAttribute: button.dataset
          });

          // Add loading state to the button - prevent duplicates
          if (button.classList.contains('loading')) {
            logger.log('Button already has loading state, skipping');
            return;
          }

          // Store original content
          const originalButtonText = button.textContent;
          const buttonWasDisabled = button.disabled;
          
          // Store as data attributes for later restoration
          button.dataset.originalText = originalButtonText;
          button.dataset.originalDisabled = buttonWasDisabled;
          
          // Add loading state
          button.disabled = true;
          button.classList.add('loading');
          
          // Only add our spinner to product-estimator-category-button
          if (button.classList.contains('product-estimator-category-button')) {
            // Clear button content and add our spinner
            button.innerHTML = '';
            
            const loadingSpinner = document.createElement('span');
            loadingSpinner.className = 'button-loading-spinner';
            loadingSpinner.innerHTML = '<span class="dashicons dashicons-update-alt spinning"></span>';
            button.appendChild(loadingSpinner);
          }
          // For single_add_to_estimator_button, just let WooCommerce handle the loading state

          if (this.modalManager) {
            logger.log('OPENING MODAL WITH:', {
              productId: productId,
              forceListView: false
            });

            // Pass button reference to modal manager so it can reset the state
            const config = {
              originalButtonText,
              buttonWasDisabled,
              button
            };

            // Explicitly pass productId and set forceListView to false
            this.modalManager.openModal(productId, false, config);
          }
        }
      };

      // Add the event listener with our stored handler
      document.addEventListener('click', this._clickHandler);

      // Emit event for monitoring
      this.emit('core:eventsbound');
      // logger.log('Global events bound');
    } catch (error) {
      logger.error('Error binding global events:', error);
    }
  }

  /**
   * Closes the estimator modal if it's currently open
   * Delegates to the modalManager instance
   * Does nothing if modalManager is not initialized
   * @returns {void}
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
    // Use EventBus for new events
    eventBus.on(event, callback);
    
    // Also maintain backward compatibility with the old event system
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
    // Use EventBus for all events
    eventBus.emit(event, data);
    
    // Also maintain backward compatibility with the old event system
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(callback => callback(data));
    }
    return this;
  }

  /**
   * Cleans up resources and deactivates the estimator core
   * Closes any open log groups to maintain clean console output
   * Should be called when the plugin is being removed from the page
   * @returns {void}
   */
  destroy() {
    if (!this.isActive) return;
      logger.log('Plugin destroying...');

    // All logging for this plugin instance is now complete.
    // You can close the main plugin log group.
    closeMainPluginLogGroup(); // Explicitly close the main group

    this.isActive = false;
    // After this, new logs might start a *new* main group if the plugin is re-initialized,
    // or if other parts of the plugin are still logging (which should ideally be avoided after destroy).
  }

}

// Create and export a singleton instance
const estimatorCore = new EstimatorCore({ debug: true });

export default estimatorCore;
