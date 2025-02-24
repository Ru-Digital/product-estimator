// File: assets/js/variation-integration.js

(function($) {
  'use strict';

  class ProductEstimatorVariation {
    constructor() {
      this.wrapper = $('#product-estimator-wrapper');

      if (this.wrapper.length) {
        this.productId = this.wrapper.data('product-id');
        this.bindEvents();
      }
    }

    bindEvents() {
      $('form.variations_form').on('found_variation', (event, variation) => {
        this.updateEstimator(variation.variation_id);
      });

      $('form.variations_form').on('reset_data', () => {
        this.wrapper.html('');
      });
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
