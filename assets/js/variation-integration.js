// File: assets/js/variation-integration.js

(function($) {
  'use strict';

  class ProductEstimatorVariation {
    constructor() {
      this.wrapper = $('#product-estimator-wrapper');
      this.modalEnabled = $('#product-estimator-modal').length > 0;
      this.activeVariationId = null;
      this.parentProductId = null;
      this.productEnabled = false;

      // Get the Add to Estimator button
      this.estimatorButton = $('.single_add_to_estimator_button');

      if (this.estimatorButton.length) {
        // Store the parent product ID
        this.parentProductId = this.estimatorButton.data('product-id');
        // Check if estimator is enabled by default
        this.productEnabled = this.estimatorButton.is(':visible');
      }

      // Check if we're on a variable product page
      if ($('form.variations_form').length) {
        this.bindEvents();
      }
    }

    bindEvents() {
      // Listen for variation changes
      $('form.variations_form').on('found_variation', (event, variation) => {
        this.activeVariationId = variation.variation_id;

        // Update estimator button
        if (this.estimatorButton.length) {
          this.estimatorButton.data('product-id', variation.variation_id);
          this.estimatorButton.attr('data-product-id', variation.variation_id);

          // Handle visibility based on variation settings
          if (typeof variation.enable_estimator !== 'undefined') {
            if (variation.enable_estimator === 'yes') {
              this.estimatorButton.fadeIn(200);
            } else {
              this.estimatorButton.fadeOut(200);
            }
          }
        }

        // Update any estimator wrapper content if present
        if (this.wrapper.length) {
          this.updateEstimator(variation.variation_id);
        }
      });

      // Handle reset (when user clears selection)
      $('form.variations_form').on('reset_data', () => {
        this.activeVariationId = null;

        // Reset button to parent product ID
        if (this.estimatorButton.length && this.parentProductId) {
          this.estimatorButton.data('product-id', this.parentProductId);
          this.estimatorButton.attr('data-product-id', this.parentProductId);

          // Reset visibility based on parent product setting
          if (this.productEnabled) {
            this.estimatorButton.fadeIn(200);
          } else {
            this.estimatorButton.fadeOut(200);
          }
        }

        // Reset estimator wrapper if present
        if (this.wrapper.length) {
          this.wrapper.html('');
        }
      });

      // Special handling for the modal if enabled
      if (this.modalEnabled) {
        $('.single_add_to_estimator_button').on('click', (e) => {
          e.preventDefault();
          e.stopPropagation(); // Prevent other handlers from running

          // Get the currently active variation ID if available, otherwise use parent product ID
          const idToUse = this.activeVariationId || this.parentProductId;

          if (window.productEstimatorModalInstance) {
            window.productEstimatorModalInstance.openModal(idToUse);
          } else {
            // Dispatch custom event for opening the modal
            const modalEvent = new CustomEvent('open_product_estimator_modal', {
              detail: { productId: idToUse }
            });
            document.dispatchEvent(modalEvent);
          }

          return false;
        });
      }
    }

    updateEstimator(variationId) {
      if (!variationId) return;

      // Show loading indicator if present
      const loadingEl = this.wrapper.find('.loading-overlay');
      if (loadingEl.length) loadingEl.show();

      $.ajax({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'get_variation_estimator',
          nonce: productEstimatorVars.nonce,
          variation_id: variationId
        },
        success: (response) => {
          if (response.success && response.data.html) {
            this.wrapper.html(response.data.html);

            // Reinitialize any necessary scripts
            if (typeof ProductEstimator !== 'undefined') {
              new ProductEstimator(this.wrapper.find('.product-estimator-container'));
            }
          }
        },
        complete: () => {
          // Hide loading indicator if present
          if (loadingEl.length) loadingEl.hide();
        }
      });
    }
  }

  // Initialize when document is ready
  $(document).ready(() => {
    new ProductEstimatorVariation();
  });

})(jQuery);
