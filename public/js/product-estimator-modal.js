(function($) {
  'use strict';

  console.log('Product Estimator Modal script loaded'); // Debug log

  /**
   * Product Estimator Modal Handler
   *
   * Handles the product estimator modal functionality
   */
  class ProductEstimatorModal {
    /**
     * Initialize the modal functionality
     */
    constructor() {
      console.log('Modal constructor called'); // Debug log

      this.modal = $('#product-estimator-modal');

      // Check if modal exists in DOM
      if (!this.modal.length) {
        console.warn('Product Estimator Modal not found in DOM');
        return;
      }

      console.log('Modal element found:', this.modal.length > 0); // Debug log

      this.overlay = this.modal.find('.product-estimator-modal-overlay');
      this.closeBtn = this.modal.find('.product-estimator-modal-close');
      this.content = this.modal.find('.product-estimator-modal-form-container');
      this.loading = this.modal.find('.product-estimator-modal-loading');
      this.currentProductId = 0;
      this.initialized = false;

      this.bindEvents();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
      console.log('Binding modal events'); // Debug log

      // Debug: Check for estimator buttons
      console.log('Product estimator buttons found:', $('.product-estimator-button, .single_add_to_estimator_button').length);

      // Trigger modal open from any estimator button (using direct selector)
      $(document).on('click', '.product-estimator-button, .single_add_to_estimator_button', (e) => {
        console.log('Button clicked'); // Debug log
        e.preventDefault();
        const productId = $(e.currentTarget).data('product-id');
        console.log('Product ID from button:', productId); // Debug log
        this.openModal(productId);
      });

      // Close modal when clicking the close button
      this.closeBtn.on('click', (e) => {
        console.log('Close button clicked'); // Debug log
        e.preventDefault();
        this.closeModal();
      });

      // Close modal when clicking the overlay
      this.overlay.on('click', () => {
        console.log('Overlay clicked'); // Debug log
        this.closeModal();
      });

      // Close modal when pressing escape key
      $(document).on('keydown', (e) => {
        if (e.key === 'Escape' && this.modal.hasClass('open')) {
          console.log('Escape key pressed'); // Debug log
          this.closeModal();
        }
      });
    }

    /**
     * Open the modal and load content
     * @param {number} productId - The product ID to load
     */
    openModal(productId) {
      console.log('Opening modal for product:', productId); // Debug log

      if (!productId) {
        console.error('No product ID provided');
        return;
      }

      this.currentProductId = productId;
      this.showLoading();
      this.modal.addClass('open');
      $('body').addClass('modal-open');

      console.log('Modal opened, loading content...'); // Debug log

      // Simulate content loading for testing
      setTimeout(() => {
        this.setContent('<div class="test-content">Test Content Loaded for Product ID: ' + productId + '</div>');
        this.hideLoading();
      }, 1000);

      // Uncomment this for actual AJAX loading
      /*
      // Load content via AJAX
      $.ajax({
        url: productEstimatorPublic.ajax_url,
        type: 'POST',
        data: {
          action: 'load_product_estimator_form',
          nonce: productEstimatorPublic.nonce,
          product_id: productId
        },
        success: (response) => {
          if (response.success) {
            this.setContent(response.data.html);
            this.initializeForm();
          } else {
            this.setContent('<div class="error">Error loading form: ' + response.data.message + '</div>');
          }
        },
        error: () => {
          this.setContent('<div class="error">Error loading form. Please try again later.</div>');
        },
        complete: () => {
          this.hideLoading();
        }
      });
      */
    }

    /**
     * Close the modal
     */
    closeModal() {
      console.log('Closing modal'); // Debug log
      this.modal.removeClass('open');
      $('body').removeClass('modal-open');
      setTimeout(() => {
        this.content.html('');
        this.currentProductId = 0;
      }, 300);
    }

    /**
     * Set modal content
     * @param {string} html - The HTML content
     */
    setContent(html) {
      console.log('Setting modal content'); // Debug log
      this.content.html(html);
    }

    /**
     * Initialize form handlers
     */
    initializeForm() {
      const form = this.content.find('form');

      // Skip if no form found
      if (!form.length) {
        return;
      }

      form.on('submit', (e) => {
        e.preventDefault();
        this.showLoading();

        const formData = new FormData(form[0]);
        formData.append('action', 'calculate_product_estimate');
        formData.append('nonce', productEstimatorPublic.nonce);
        formData.append('product_id', this.currentProductId);

        $.ajax({
          url: productEstimatorPublic.ajax_url,
          type: 'POST',
          data: formData,
          processData: false,
          contentType: false,
          success: (response) => {
            if (response.success) {
              this.showResults(response.data);
            } else {
              form.find('.error-messages').html(response.data.message).show();
            }
          },
          error: () => {
            form.find('.error-messages').html('An error occurred. Please try again.').show();
          },
          complete: () => {
            this.hideLoading();
          }
        });
      });
    }

    /**
     * Show loading indicator
     */
    showLoading() {
      this.loading.show();
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
      this.loading.hide();
    }
  }

  // Initialize when document is ready
  $(document).ready(() => {
    console.log('Document ready'); // Debug log
    console.log('Modal element exists:', $('#product-estimator-modal').length > 0); // Debug log

    // Only initialize if the modal exists in the DOM
    if ($('#product-estimator-modal').length) {
      console.log('Creating modal instance'); // Debug log
      window.productEstimatorModalInstance = new ProductEstimatorModal();
    } else {
      console.log('Modal element not found in the DOM'); // Debug log
    }

    // Debug: Check for estimator buttons
    console.log('Estimator buttons found:', $('.product-estimator-button, .single_add_to_estimator_button').length);
  });

})(jQuery);
