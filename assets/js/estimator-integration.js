(function($) {
  'use strict';

  /**
   * Product Estimator Integration
   *
   * Handles integration with WooCommerce product pages
   */
  class ProductEstimatorIntegration {
    /**
     * Initialize the integration
     */
    constructor() {
      this.bindEvents();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
      // Add to Estimator button on product page
      $(document).on('click', '.single_add_to_estimator_button', (e) => {
        e.preventDefault();
        const productId = $(e.currentTarget).data('product-id');
        this.handleAddToEstimator(productId);
      });
    }

    /**
     * Handle adding product to estimator
     * @param {number} productId - The product ID
     */
    handleAddToEstimator(productId) {
      if (!productId) {
        console.error('No product ID provided');
        return;
      }

      // Show loading state
      this.showAddingMessage();

      // Send AJAX request
      $.ajax({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'add_to_estimator',
          nonce: productEstimatorVars.nonce,
          product_id: productId
        },
        success: (response) => {
          if (response.success) {
            this.showSuccessMessage(response.data.message);

            // If the modal exists, open it
            if (window.productEstimatorModalInstance) {
              window.productEstimatorModalInstance.openModal(productId);
            } else {
              // Redirect to estimator page if no modal
              window.location.href = productEstimatorVars.estimator_url;
            }
          } else {
            this.showErrorMessage(response.data.message);
          }
        },
        error: () => {
          this.showErrorMessage(productEstimatorVars.i18n.addError);
        }
      });
    }

    /**
     * Show adding message
     */
    showAddingMessage() {
      this.removeMessages();
      $('<div class="woocommerce-info product-estimator-message adding">' +
        productEstimatorVars.i18n.adding +
        '</div>').insertBefore('.single_add_to_estimator_button').hide().fadeIn();
    }

    /**
     * Show success message
     * @param {string} message - The success message
     */
    showSuccessMessage(message) {
      this.removeMessages();
      $('<div class="woocommerce-message product-estimator-message success">' +
        message +
        '</div>').insertBefore('.single_add_to_estimator_button').hide().fadeIn();
    }

    /**
     * Show error message
     * @param {string} message - The error message
     */
    showErrorMessage(message) {
      this.removeMessages();
      $('<div class="woocommerce-error product-estimator-message error">' +
        message +
        '</div>').insertBefore('.single_add_to_estimator_button').hide().fadeIn();
    }

    /**
     * Remove all messages
     */
    removeMessages() {
      $('.product-estimator-message').fadeOut(function() {
        $(this).remove();
      });
    }
  }

  // Initialize when document is ready
  $(document).ready(() => {
    new ProductEstimatorIntegration();
  });

})(jQuery);
