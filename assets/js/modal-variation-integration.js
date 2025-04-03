/**
 * Integration between the Product Estimator Modal and WooCommerce Variations
 *
 * This script enhances the modal functionality to better handle variations.
 */
(function($) {
  'use strict';

  class ProductEstimatorModalVariationEnhancement {
    constructor() {
      this.hasSetup = false;

      // Initialize when DOM is ready
      $(document).ready(() => this.init());
    }

    init() {
      // Prevent multiple initializations
      if (this.hasSetup) return;
      this.hasSetup = true;

      // Listen for variation changes
      $(document).on('found_variation', 'form.variations_form', (event, variation) => {
        this.onVariationFound(variation);
      });

      // Listen for variation reset
      $(document).on('reset_data', 'form.variations_form', () => {
        this.onVariationReset();
      });

      // Listen for modal opening events
      document.addEventListener('open_product_estimator_modal', (e) => {
        if (e.detail && e.detail.productId) {
          this.openModalWithProduct(e.detail.productId);
        }
      });
    }

    onVariationFound(variation) {
      if (!variation || !variation.variation_id) return;

      // Update all estimator buttons on the page with this variation ID
      $('.single_add_to_estimator_button').each(function() {
        const $button = $(this);
        $button.data('product-id', variation.variation_id);
        $button.attr('data-product-id', variation.variation_id);

        // Store original product ID if not already stored
        if (!$button.data('original-product-id')) {
          $button.data('original-product-id', $button.attr('data-product-id') || '');
        }

        // Handle visibility based on variation settings
        if (typeof variation.enable_estimator !== 'undefined') {
          if (variation.enable_estimator === 'yes') {
            $button.fadeIn(200);
          } else {
            $button.fadeOut(200);
          }
        }
      });

      // If the modal is open, we should potentially update its content
      this.updateOpenModal(variation.variation_id);
    }

    onVariationReset() {
      // Reset all buttons to their original product IDs
      $('.product-estimator-button, .single_add_to_estimator_button').each(function() {
        const $button = $(this);
        const originalId = $button.data('original-product-id');

        if (originalId) {
          $button.data('product-id', originalId);
          $button.attr('data-product-id', originalId);
        }

        // If the button was visible initially, show it again
        if ($button.hasClass('visible-by-default')) {
          $button.fadeIn(200);
        }
      });
    }

    openModalWithProduct(productId) {
      // Check if we have a modal instance
      if (window.productEstimatorModalInstance) {
        window.productEstimatorModalInstance.openModal(productId);
      } else {
        console.warn('Modal instance not found');

        // Try to initialize it
        $.getScript(productEstimatorVars.plugin_url + 'public/js/product-estimator-modal.js')
          .done(() => {
            if (window.ProductEstimatorModal) {
              window.productEstimatorModalInstance = new window.ProductEstimatorModal();
              window.productEstimatorModalInstance.openModal(productId);
            }
          });
      }
    }

    updateOpenModal(variationId) {
      // If the modal is open and showing a product selection
      if (window.productEstimatorModalInstance &&
        $('#product-estimator-modal').is(':visible') &&
        $('#room-selection-form').is(':visible')) {

        // The current modal might be showing a form for the parent product
        // We could potentially update it for the variation
        // This is advanced functionality that would require additional handlers
        console.log('Modal is open while variation changed to: ' + variationId);
      }
    }
  }

  // Create an instance to initialize
  new ProductEstimatorModalVariationEnhancement();

})(jQuery);
