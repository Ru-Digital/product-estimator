// File: assets/js/variation-integration.js

(function($) {
  'use strict';

  class ProductEstimatorVariation {
    constructor() {
      this.wrapper = $('#product-estimator-wrapper');
      this.modalEnabled = $('#product-estimator-modal').length > 0;
      this.activeVariationId = null;

      if (this.wrapper.length) {
        this.productId = this.wrapper.data('product-id');
        this.bindEvents();
      }
    }

    bindEvents() {
      // Listen for variation changes
      $('form.variations_form').on('found_variation', (event, variation) => {
        this.activeVariationId = variation.variation_id;
        this.updateEstimator(variation.variation_id);

        // Update any "Add to estimator" buttons with the variation ID
        $('.single_add_to_estimator_button').data('product-id', variation.variation_id);
      });

      // Handle reset (when user clears selection)
      $('form.variations_form').on('reset_data', () => {
        this.activeVariationId = null;
        this.wrapper.html('');

        // Reset buttons to the parent product ID
        $('.single_add_to_estimator_button').data('product-id', this.productId);
      });

      // Modify the "Add to estimator" button click behavior if modal is enabled
      if (this.modalEnabled) {
        $('.single_add_to_estimator_button').on('click', (e) => {
          e.preventDefault();
          e.stopPropagation(); // Prevent other handlers from running

          // Get the currently active variation ID if available, otherwise use product ID
          const idToUse = this.activeVariationId || this.productId;

          // Trigger the modal with the appropriate ID
          const modalEvent = new CustomEvent('open_product_estimator_modal', {
            detail: { productId: idToUse }
          });
          document.dispatchEvent(modalEvent);

          return false;
        });
      }
    }

    updateEstimator(variationId) {
      $.ajax({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'get_variation_estimator',
          nonce: productEstimatorVars.nonce,
          variation_id: variationId
        },
        success: (response) => {
          if (response.success) {
            this.wrapper.html(response.data.html);
            // Reinitialize any necessary scripts
            if (typeof ProductEstimator !== 'undefined') {
              new ProductEstimator(this.wrapper.find('.product-estimator-container'));
            }
          }
        }
      });
    }
  }

  // Initialize when document is ready
  $(document).ready(() => {
    new ProductEstimatorVariation();
  });

})(jQuery);
