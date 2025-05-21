/**
 * VariationHandler.js
 *
 * Handles all product variation related functionality
 * for the Product Estimator plugin.
 */

import { createLogger } from '@utils';
const logger = createLogger('VariationHandler');
class VariationHandler {
  /**
   * Initialize the VariationHandler
   * @param {object} config - Configuration options
   */
  constructor(config = {}) {
    // Default configuration
    this.config = Object.assign({
      debug: true, // Set to true for more verbose logging
      selectors: {
        variationsForm: '.variations_form',
        estimatorButton: '.single_add_to_estimator_button, .button.alt.open-estimator-modal, .product-estimator-button, [data-product-id]',
        variationIdInput: 'input[name="variation_id"]'
      }
    }, config);

    // Store references to DOM elements
    this.variationsForm = document.querySelector(this.config.selectors.variationsForm);
    this.estimatorButton = document.querySelector(this.config.selectors.estimatorButton);
    this.variationIdInput = this.variationsForm ? this.variationsForm.querySelector(this.config.selectors.variationIdInput) : null;

    // Get variations data from global variable - add fallback for safety
    this.variationsData = window.product_estimator_variations || {};

    // State
    this.currentVariationId = null;
    this.initialized = false;
    this.eventHandlers = {};

    // Only initialize if we have a variations form
    if (this.variationsForm) {
      this.init();
    } else {
      logger.log('No variations form found, VariationHandler not initialized');
    }
  }

  /**
   * Initialize the core and check initial button state
   * @returns {VariationHandler} This instance for chaining
   */
  init() {
    if (this.initialized) {
      logger.log('VariationHandler already initialized');
      return this;
    }

    // Log the initial state for debugging
    logger.log('Initializing VariationHandler with variations data:', this.variationsData);
    logger.log('Estimator button found:', !!this.estimatorButton);

    // If we have the button, log its initial attributes
    if (this.estimatorButton) {
      logger.log('Initial button data-product-id:', this.estimatorButton.dataset.productId);

      // Force visibility if product has estimator enabled
      const productId = this.estimatorButton.dataset.productId;
      if (productId) {
        // Check if parent product has estimator enabled
        const parentEnabled = this.isParentEstimatorEnabled(productId);
        if (parentEnabled) {
          logger.log('Parent product has estimator enabled, ensuring button is visible');
          this.estimatorButton.style.display = '';
          this.estimatorButton.classList.remove('hidden');
        }
      }
    }

    this.bindEvents();

    // Check if there's already a selected variation (page could have loaded with a variation in URL)
    this.checkCurrentVariation();

    this.initialized = true;
    logger.log('VariationHandler initialized');

    // Emit initialization event
    this.emit('initialized');

    return this;
  }

  /**
   * Ensure the estimator button exists for variations with estimator enabled
   * @param {number|string} variationId - Variation ID
   */
  ensureEstimatorButton(variationId) {
    logger.log(`Ensuring estimator button exists for variation: ${variationId}`);

    // Check if button already exists
    const existingButton = document.querySelector(this.config.selectors.estimatorButton);

    if (existingButton) {
      logger.log('Estimator button already exists, updating visibility');
      this.updateEstimatorButton(true, variationId);
      return;
    }

    // Button doesn't exist, we need to create it if estimator is enabled
    const isEnabled = this.isEstimatorEnabled(variationId);

    if (!isEnabled) {
      logger.log('Estimator not enabled for this variation, not creating button');
      return;
    }

    logger.log('Creating estimator button dynamically');

    // Find the add to cart button as reference point
    const addToCartButton = document.querySelector('.single_add_to_cart_button');

    if (!addToCartButton) {
      logger.log('Cannot find add to cart button to insert after');
      return;
    }

    // Create new button
    const newButton = document.createElement('button');
    newButton.type = 'button';
    newButton.className = 'single_add_to_estimator_button button alt open-estimator-modal';
    newButton.dataset.productId = variationId;
    // Hard-code the label until we can find a better solution
    // We'll use the button attribute for dynamic text instead
    newButton.textContent = 'Add to Estimate';
    
    // Use a data attribute that can be targeted by CSS or JS if needed
    newButton.dataset.labelKey = 'add_to_estimate_single_product';

    // Insert after add to cart button
    addToCartButton.insertAdjacentElement('afterend', newButton);

    logger.log('Estimator button created and inserted');
  }

  /**
   * Check if parent product has estimator enabled
   * @returns {boolean} True if parent has estimator enabled
   */
  isParentEstimatorEnabled() {
    // Check if we have any data in the DOM about parent product
    const button = document.querySelector('.single_add_to_estimator_button');
    if (button) {
      // Button presence suggests parent has estimator enabled
      return true;
    }

    // Check for any hidden input or data attribute indicating parent status
    const metaElement = document.querySelector('input[name="_enable_estimator"], [data-enable-estimator]');
    if (metaElement) {
      return metaElement.value === 'yes' || metaElement.dataset.enableEstimator === 'yes';
    }

    return false;
  }

  /**
   * Bind events to handle variation changes
   */
  bindEvents() {
    if (!this.variationsForm) return;

    logger.log('Binding variation events');

    // Listen for WooCommerce variation events
    this.variationsForm.addEventListener('found_variation', this.handleFoundVariation.bind(this));
    this.variationsForm.addEventListener('reset_data', this.handleResetVariation.bind(this));
    this.variationsForm.addEventListener('check_variations', this.handleCheckVariations.bind(this));

    // Also handle some custom events that themes might use
    document.addEventListener('woocommerce_variation_has_changed', this.checkCurrentVariation.bind(this));

    // Handle direct changes to the variation_id input field
    if (this.variationIdInput) {
      this.variationIdInput.addEventListener('change', () => {
        const variationId = this.variationIdInput.value;
        if (variationId) {
          logger.log(`Variation ID input changed to: ${variationId}`);
          this.currentVariationId = variationId;
          const enableEstimator = this.isEstimatorEnabled(variationId);
          this.updateEstimatorButton(enableEstimator, variationId);
        }
      });
    }

    // Add a listener for jQuery's change event on the form (some themes use this)
    if (typeof jQuery !== 'undefined') {
      jQuery(this.variationsForm).on('change', 'input[name="variation_id"]', (e) => {
        const variationId = e.target.value;
        if (variationId) {
          logger.log(`jQuery variation ID change detected: ${variationId}`);
          this.currentVariationId = variationId;
          const enableEstimator = this.isEstimatorEnabled(variationId);
          this.updateEstimatorButton(enableEstimator, variationId);
        }
      });
    }

    // logger.log('Variation events bound');
  }

  /**
   * Handle found variation event
   * @param {Event} event - Event object
   */
  handleFoundVariation(event) {
    const variation = typeof event.detail !== 'undefined' ? event.detail : event.target.variation;

    if (!variation || !variation.variation_id) {
      logger.log('Found variation event received but no valid variation data');
      return;
    }

    const variationId = variation.variation_id;
    this.currentVariationId = variationId;

    logger.log(`Found variation: ${variationId}`);

    // Check if this variation has estimator enabled
    const enableEstimator = this.isEstimatorEnabled(variationId);

    logger.log(`Variation ${variationId} has estimator enabled: ${enableEstimator}`);

    // Ensure button exists before trying to update it
    this.ensureEstimatorButton(variationId);

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
    logger.log('Reset variation');

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
    logger.log('Check variations');

    // This event fires when variations are being checked/validated
    // We'll use it as an opportunity to check the current state
    this.checkCurrentVariation();
  }

  /**
   * Check current variation state with improved logging
   */
  checkCurrentVariation() {
    // This handles cases where the variation might have changed through
    // theme-specific mechanisms or direct manipulation
    if (!this.variationsForm) return;

    // Debug the buttons we find
    const buttons = document.querySelectorAll(this.config.selectors.estimatorButton);
    logger.log(`Found ${buttons.length} estimator buttons during checkCurrentVariation`);
    if (buttons.length > 1) {
      logger.log('WARNING: Found multiple estimator buttons - this may cause issues. Check for duplicates.');

      // Log the buttons for debugging
      buttons.forEach((btn, idx) => {
        logger.log(`Button ${idx+1} HTML: ${btn.outerHTML}`);
      });
    }

    // Try to find the current variation ID
    const currentVariation = this.getCurrentVariation();

    if (currentVariation) {
      logger.log(`Current variation detected: ${currentVariation.variation_id}`);
      this.currentVariationId = currentVariation.variation_id;
      const enableEstimator = this.isEstimatorEnabled(currentVariation.variation_id);
      this.updateEstimatorButton(enableEstimator, currentVariation.variation_id);
    } else {
      logger.log('No current variation detected');
      this.currentVariationId = null;

      // If no variation is selected, we need to check if the parent product
      // has estimator enabled to decide whether to show the button
      this.updateEstimatorButton(this.isParentProductEstimatorEnabled());
    }
  }

  /**
   * Check if parent product has estimator enabled
   * @returns {boolean} Whether parent product has estimator enabled
   */
  isParentProductEstimatorEnabled() {
    // Check if we have information about the parent product
    if (typeof window.product_estimator_variations !== 'undefined' &&
      window.product_estimator_variations._parent_enabled) {
      return window.product_estimator_variations._parent_enabled === 'yes';
    }

    // Default to true for variable products to be safe
    return true;
  }

  /**
   * Get the currently selected variation from the form
   * @returns {object | null} The variation data or null if none selected
   */
  getCurrentVariation() {
    if (!this.variationsForm) return null;

    // Try different approaches to get the current variation
    // Some themes store it in different ways

    // Method 1: Check for WooCommerce's currentVariation property
    if (this.variationsForm.currentVariation) {
      return this.variationsForm.currentVariation;
    }

    // Method 2: Check for hidden input
    const hiddenInput = this.variationsForm.querySelector('input[name="variation_id"]');
    if (hiddenInput && hiddenInput.value) {
      return { variation_id: hiddenInput.value };
    }

    // Method 3: Check for data attribute
    const variationId = this.variationsForm.dataset.productVariations;
    if (variationId) {
      return { variation_id: variationId };
    }

    // Method 4: Use jQuery data if available
    if (typeof jQuery !== 'undefined') {
      const $form = jQuery(this.variationsForm);
      // Data might be available via jQuery but we're just using the value directly
      // const jqueryData = $form.data('product_variations');
      const currentVal = $form.find('input[name="variation_id"]').val();

      if (currentVal) {
        return { variation_id: currentVal };
      }
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

    logger.log(`Checking if estimator is enabled for variation: ${variationId}`);
    logger.log('Available variations data:', this.variationsData);

    // Check if this variation has estimator enabled in our data
    if (this.variationsData[variationId]) {
      const isEnabled = this.variationsData[variationId].enable_estimator === 'yes';
      logger.log(`Found variation data, estimator enabled: ${isEnabled}`);
      return isEnabled;
    }

    // If no specific data for this variation is found, check the parent product
    const parentButton = document.querySelector('.single_add_to_estimator_button[data-product-id]:not([data-variation-id])');
    if (parentButton) {
      // Check if parent button is visible, which suggests estimator is enabled for parent
      const parentEnabled = !parentButton.classList.contains('hidden') &&
        getComputedStyle(parentButton).display !== 'none';
      logger.log(`Using parent product as fallback, estimator enabled: ${parentEnabled}`);
      return parentEnabled;
    }

    logger.log('No variation or parent data found, estimator disabled by default');
    return false;
  }

  /**
   * Update the estimator button based on variation
   * @param {boolean} show - Whether to show the button
   * @param {number|string|null} variationId - Variation ID if available
   */
  updateEstimatorButton(show, variationId = null) {
    // Find the single estimator button
    const button = document.querySelector('.single_add_to_estimator_button');

    if (!button) {
      logger.log('Estimator button not found');
      return;
    }

    logger.log(`Updating button visibility: ${show ? 'show' : 'hide'}, variation ID: ${variationId}`);

    if (show) {
      // Show the button
      button.style.display = '';

      // Update product ID if variation ID provided
      if (variationId) {
        logger.log(`Setting button data-product-id to variation ID: ${variationId}`);
        button.dataset.productId = variationId;
      }
    } else {
      // Hide the button
      button.style.display = 'none';
      logger.log('Hiding estimator button');
    }
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

}

export default VariationHandler;
