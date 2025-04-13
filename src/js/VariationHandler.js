/**
 * VariationHandler.js
 *
 * Handles all product variation related functionality
 * for the Product Estimator plugin.
 */

class VariationHandler {
  /**
   * Initialize the VariationHandler
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    // Default configuration
    this.config = Object.assign({
      debug: false,
      selectors: {
        variationsForm: '.variations_form',
        estimatorButton: '.single_add_to_estimator_button'
      }
    }, config);

    // Store references to DOM elements
    this.variationsForm = document.querySelector(this.config.selectors.variationsForm);
    this.estimatorButton = document.querySelector(this.config.selectors.estimatorButton);

    // Get variations data from global variable
    this.variationsData = window.product_estimator_variations || {};

    // State
    this.currentVariationId = null;
    this.initialized = false;
    this.eventHandlers = {};

    // Only initialize if we have a variations form
    if (this.variationsForm) {
      this.init();
    } else {
      this.log('No variations form found, VariationHandler not initialized');
    }
  }

  /**
   * Initialize the variation handler
   * @returns {VariationHandler} This instance for chaining
   */
  init() {
    if (this.initialized) {
      this.log('VariationHandler already initialized');
      return this;
    }

    this.bindEvents();

    this.initialized = true;
    this.log('VariationHandler initialized');

    // Emit initialization event
    this.emit('initialized');

    return this;
  }

  /**
   * Bind events to handle variation changes
   */
  bindEvents() {
    if (!this.variationsForm) return;

    // Listen for WooCommerce variation events
    this.variationsForm.addEventListener('found_variation', this.handleFoundVariation.bind(this));
    this.variationsForm.addEventListener('reset_data', this.handleResetVariation.bind(this));
    this.variationsForm.addEventListener('check_variations', this.handleCheckVariations.bind(this));

    // Also handle some custom events that themes might use
    document.addEventListener('woocommerce_variation_has_changed', this.checkCurrentVariation.bind(this));

    this.log('Variation events bound');
  }

  /**
   * Handle found variation event
   * @param {Event} event - Event object
   */
  handleFoundVariation(event) {
    const variation = typeof event.detail !== 'undefined' ? event.detail : event.target.variation;

    if (!variation || !variation.variation_id) {
      this.log('Found variation event received but no valid variation data');
      return;
    }

    const variationId = variation.variation_id;
    this.currentVariationId = variationId;

    this.log(`Found variation: ${variationId}`);

    // Check if this variation has estimator enabled
    const enableEstimator = this.isEstimatorEnabled(variationId);

    // Update UI based on variation
    this.updateEstimatorButton(enableEstimator, variationId);

    // Emit event
    this.emit('variation:changed', {
      variationId,
      enableEstimator,
      variation
    });
  }

  /**
   * Handle reset variation event
   */
  handleResetVariation() {
    this.log('Reset variation');

    this.currentVariationId = null;

    // Hide estimator button on variation reset
    this.updateEstimatorButton(false);

    // Emit event
    this.emit('variation:reset');
  }

  /**
   * Handle check variations event
   */
  handleCheckVariations() {
    this.log('Check variations');

    // This event fires when variations are being checked/validated
    // We'll use it as an opportunity to check the current state
    this.checkCurrentVariation();
  }

  /**
   * Check current variation state
   */
  checkCurrentVariation() {
    // This handles cases where the variation might have changed through
    // theme-specific mechanisms or direct manipulation
    if (!this.variationsForm) return;

    // Try to find the current variation ID
    const currentVariation = this.getCurrentVariation();

    if (currentVariation) {
      this.currentVariationId = currentVariation.variation_id;
      const enableEstimator = this.isEstimatorEnabled(currentVariation.variation_id);
      this.updateEstimatorButton(enableEstimator, currentVariation.variation_id);
    } else {
      this.currentVariationId = null;
      // If no variation is selected, hide the button
      this.updateEstimatorButton(false);
    }
  }

  /**
   * Get the currently selected variation from the form
   * @returns {Object|null} The variation data or null if none selected
   */
  getCurrentVariation() {
    if (!this.variationsForm) return null;

    // Try different approaches to get the current variation
    // Some themes store it in different ways

    // Method 1: Check for WooCommerce's currentVariation property
    if (this.variationsForm.currentVariation) {
      return this.variationsForm.currentVariation;
    }

    // Method 2: Check for data attribute
    const variationId = this.variationsForm.dataset.productVariations;
    if (variationId) {
      return { variation_id: variationId };
    }

    // Method 3: Check for hidden input
    const hiddenInput = this.variationsForm.querySelector('input[name="variation_id"]');
    if (hiddenInput && hiddenInput.value) {
      return { variation_id: hiddenInput.value };
    }

    // No variation found
    return null;
  }

  /**
   * Check if estimator is enabled for a variation
   * @param {number|string} variationId - Variation ID
   * @returns {boolean} True if estimator is enabled
   */
  isEstimatorEnabled(variationId) {
    if (!variationId) return false;

    // Check if this variation has estimator enabled in our data
    if (this.variationsData[variationId]) {
      return this.variationsData[variationId].enable_estimator === 'yes';
    }

    // If no data for this variation, check the parent product
    // Fall back to checking the parent product's button visibility
    const parentButton = document.querySelector('.single_add_to_estimator_button[data-product-id]:not([data-variation-id])');
    if (parentButton) {
      // If parent button is visible and doesn't have a product ID, estimator is enabled for parent
      return !parentButton.classList.contains('hidden') && !parentButton.style.display === 'none';
    }

    return false;
  }

  /**
   * Update the estimator button based on variation
   * @param {boolean} show - Whether to show the button
   * @param {number|string|null} variationId - Variation ID if available
   */
  updateEstimatorButton(show, variationId = null) {
    // Find all estimator buttons
    const buttons = document.querySelectorAll(this.config.selectors.estimatorButton);

    if (!buttons.length) {
      this.log('No estimator buttons found to update');
      return;
    }

    buttons.forEach(button => {
      if (show) {
        button.style.display = '';

        // Update product ID if variation ID provided
        if (variationId) {
          button.dataset.productId = variationId;

          // Also set variation ID attribute for clarity
          button.dataset.variationId = variationId;
        }
      } else {
        button.style.display = 'none';
      }
    });

    this.log(`${show ? 'Showed' : 'Hid'} estimator button${variationId ? ' for variation ' + variationId : ''}`);
  }

  /**
   * Register an event handler
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @returns {VariationHandler} This instance for chaining
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
   * @returns {VariationHandler} This instance for chaining
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
      console.log('[VariationHandler]', ...args);
    }
  }
}

export default VariationHandler;
