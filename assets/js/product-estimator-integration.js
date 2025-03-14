/**
 * Product Estimator Integration Loader
 *
 * This script ensures all Product Estimator components are loaded in the correct order
 * and properly initialized, with support for variations, modals, and estimator functionality.
 */
(function($) {
  'use strict';

  // Track loaded scripts and initialization state
  const loadedScripts = new Set();
  let isInitialized = false;

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
    // Prevent multiple initializations
    if (isInitialized) {
      console.log('Product Estimator already initialized, skipping');
      return;
    }

    console.log('Initializing Product Estimator Integration');

    // Check for WooCommerce variable products
    const hasVariations = $('form.variations_form').length > 0;

    // Check for estimator buttons
    const hasEstimatorButtons = $('.product-estimator-button, .single_add_to_estimator_button').length > 0;

    // Check for estimator containers
    const hasEstimatorContainers = $('.product-estimator-container').length > 0;

    // Base path for plugin scripts
    const basePath = productEstimatorVars.plugin_url || '/wp-content/plugins/product-estimator/';

    // Load necessary scripts based on page content
    const scriptsToLoad = [];

    // Modal is needed if we have buttons
    if (hasEstimatorButtons && !window.ProductEstimatorModal) {
      scriptsToLoad.push(basePath + 'public/js/product-estimator-modal.js');
    }

    // Main public script for estimator functionality
    if (hasEstimatorContainers && !window.ProductEstimator) {
      scriptsToLoad.push(basePath + 'public/js/product-estimator-public.js');
    }

    // Variation integration for variable products
    if (hasVariations && !window.ProductEstimatorVariation) {
      scriptsToLoad.push(basePath + 'assets/js/variation-integration.js');
    }

    // Load all required scripts in sequence
    if (scriptsToLoad.length > 0) {
      console.log('Loading scripts:', scriptsToLoad);

      // Chain promises to load scripts in sequence
      scriptsToLoad.reduce((chain, scriptUrl) => {
        return chain.then(() => loadScript(scriptUrl));
      }, Promise.resolve())
        .then(() => {
          console.log('All Product Estimator scripts loaded successfully');
          initializeComponents();
        })
        .catch((error) => {
          console.error('Error loading Product Estimator scripts', error);
        });
    } else {
      // If no additional scripts needed, just initialize components
      initializeComponents();
    }

    // Set initialization flag
    isInitialized = true;
  }

  /**
   * Initialize all components after scripts are loaded
   */
  function initializeComponents() {
    console.log('Initializing Product Estimator components');

    // Initialize product estimator containers if the class exists
    if (typeof ProductEstimator !== 'undefined' && $('.product-estimator-container').length) {
      $('.product-estimator-container').each(function() {
        // Only initialize containers that haven't been initialized yet
        if (!$(this).data('initialized')) {
          const estimator = new ProductEstimator(this);
          $(this).data('initialized', true);
          console.log('Initialized ProductEstimator container');
        }
      });
    }

    // Initialize modal if available and not already initialized
    if (typeof ProductEstimatorModal !== 'undefined' && !window.productEstimatorModalInstance) {
      window.productEstimatorModalInstance = new ProductEstimatorModal();
      console.log('Initialized ProductEstimatorModal');
    }

    // Initialize variation integration if on variable product and not already initialized
    if (typeof ProductEstimatorVariation !== 'undefined' && $('form.variations_form').length && !window.productEstimatorVariationInstance) {
      window.productEstimatorVariationInstance = new ProductEstimatorVariation();
      console.log('Initialized ProductEstimatorVariation');
    }

    // Mark buttons as visible by default if they're initially visible
    $('.product-estimator-button, .single_add_to_estimator_button').each(function() {
      if ($(this).is(':visible') && !$(this).hasClass('visible-by-default')) {
        $(this).addClass('visible-by-default');
      }
    });
  }

  // Initialize when document is ready - but only once
  $(document).ready(function() {
    initProductEstimator();

    // Clean up any conflicting event handlers
    $(document).off('click.productEstimator', '.product-estimator-menu-item a');

    // Special handler for menu links
    $(document).on('click.productEstimator', '.product-estimator-menu-item a', function(e) {
      e.preventDefault();
      e.stopPropagation();

      console.log('Menu link clicked through integration handler');

      // If modal exists, use it directly
      if (window.productEstimatorModalInstance) {
        window.productEstimatorModalInstance.openModal(null, true);
      } else {
        // Try to load modal script and then open it
        loadScript(productEstimatorVars.plugin_url + 'public/js/product-estimator-modal.js')
          .then(() => {
            if (typeof ProductEstimatorModal !== 'undefined') {
              window.productEstimatorModalInstance = new ProductEstimatorModal();
              window.productEstimatorModalInstance.openModal(null, true);
            }
          });
      }

      return false;
    });
  });

})(jQuery);
