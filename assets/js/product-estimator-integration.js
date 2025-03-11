/**
 * Product Estimator Integration Loader
 *
 * This script ensures all Product Estimator components are loaded in the correct order
 * and properly initialized, with support for variations, modals, and estimator functionality.
 */
(function($) {
  'use strict';

  // Track loaded scripts
  const loadedScripts = new Set();

  /**
   * Dynamically load a script
   * @param {string} url - Script URL
   * @returns {Promise} - Promise that resolves when script is loaded
   */
  function loadScript(url) {
    if (loadedScripts.has(url)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      $.getScript(url)
        .done(() => {
          loadedScripts.add(url);
          resolve();
        })
        .fail((jqxhr, settings, exception) => {
          console.error('Error loading script: ' + url, exception);
          reject(exception);
        });
    });
  }

  /**
   * Initialize the Product Estimator
   */
  function initProductEstimator() {
    console.log('Initializing Product Estimator Integration');

    // Check for WooCommerce variable products
    const hasVariations = $('form.variations_form').length > 0;

    // Check for estimator buttons
    const hasEstimatorButtons = $('.product-estimator-button, .single_add_to_estimator_button').length > 0;

    // Check for estimator containers
    const hasEstimatorContainers = $('.product-estimator-container').length > 0;

    // Load necessary scripts based on page content
    const scriptsToLoad = [];

    // Base path for plugin scripts
    const basePath = productEstimatorVars.plugin_url || '/wp-content/plugins/product-estimator/';

    // Modal is needed if we have buttons
    if (hasEstimatorButtons) {
      scriptsToLoad.push(basePath + 'public/js/product-estimator-modal.js');
    }

    // Main public script for estimator functionality
    if (hasEstimatorContainers) {
      scriptsToLoad.push(basePath + 'public/js/product-estimator-public.js');
    }

    // Variation integration for variable products
    if (hasVariations) {
      scriptsToLoad.push(basePath + 'assets/js/variation-integration.js');
    }

    // Load all required scripts in sequence
    if (scriptsToLoad.length > 0) {
      // Chain promises to load scripts in sequence
      scriptsToLoad.reduce((chain, scriptUrl) => {
        return chain.then(() => loadScript(scriptUrl));
      }, Promise.resolve())
        .then(() => {
          console.log('All Product Estimator scripts loaded successfully');

          // Initialize components after all scripts are loaded
          initializeComponents();
        })
        .catch((error) => {
          console.error('Error loading Product Estimator scripts', error);
        });
    } else {
      // If no additional scripts needed, just initialize components
      initializeComponents();
    }
  }

  /**
   * Initialize all components after scripts are loaded
   */
  function initializeComponents() {
    // Initialize product estimator containers
    if (typeof ProductEstimator !== 'undefined' && $('.product-estimator-container').length) {
      $('.product-estimator-container').each(function() {
        new ProductEstimator(this);
      });
    }

    // Initialize modal if available
    if (typeof ProductEstimatorModal !== 'undefined' && !window.productEstimatorModalInstance) {
      window.productEstimatorModalInstance = new ProductEstimatorModal();
    }

    // Initialize variation integration if on variable product
    if (typeof ProductEstimatorVariation !== 'undefined' && $('form.variations_form').length) {
      new ProductEstimatorVariation();
    }

    // Mark buttons as visible by default if they're initially visible
    $('.product-estimator-button, .single_add_to_estimator_button').each(function() {
      if ($(this).is(':visible')) {
        $(this).addClass('visible-by-default');
      }
    });
  }

  // Initialize when document is ready
  $(document).ready(initProductEstimator);

})(jQuery);
