(function($) {
  'use strict';

  console.log('Product Estimator Public script loaded'); // Debug log

  /**
   * Product Estimator Core Functionality
   *
   * Handles the core functionality of the product estimator
   */
  class ProductEstimator {
    /**
     * Initialize the estimator functionality
     * @param {HTMLElement} element - The container element
     */
    constructor(element) {
      console.log('Initializing Product Estimator for container'); // Debug log

      this.container = $(element);

      // Initialize properties
      this.form = this.container.find('.estimator-form');
      this.productSelect = this.form.find('#product-type');
      this.quantityInput = this.form.find('#quantity');
      this.optionsGroup = this.form.find('.options-group');
      this.resultsContainer = this.form.find('.calculation-results');
      this.errorContainer = this.form.find('.error-messages');
      this.loadingOverlay = this.container.find('.loading-overlay');

      // Get any estimator buttons within this container
      this.estimatorButtons = this.container.find('.product-estimator-button');

      console.log('Found estimator buttons in container:', this.estimatorButtons.length); // Debug log

      // Store templates
      this.templates = {
        optionGroup: $('#option-group-template').html(),
        optionItem: $('#option-item-template').html(),
        tooltip: $('#tooltip-template').html()
      };

      // Initialize state
      this.state = {
        currentProduct: null,
        options: [],
        calculations: {
          basePrice: 0,
          optionsTotal: 0,
          quantity: 0,
          total: 0
        }
      };

      // Bind events
      this.bindEvents();

      // Initialize tooltips if enabled
      if (productEstimatorPublic.enableTooltips) {
        this.initializeTooltips();
      }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
      console.log('Binding events for estimator'); // Debug log

      // Form submission
      this.form.on('submit', (e) => {
        e.preventDefault();
        this.handleCalculation();
      });

      // Product selection change
      this.productSelect.on('change', () => {
        this.handleProductChange();
      });

      // Quantity input change
      this.quantityInput.on('input', () => {
        this.validateQuantity();
      });

      // Option changes
      this.form.on('change', 'input[name="options[]"]', () => {
        this.updateCalculations();
      });

      // Reset button
      this.form.find('.reset-button').on('click', () => {
        this.resetForm();
      });

      // PDF download
      this.form.find('.download-pdf').on('click', () => {
        this.generatePDF();
      });

      // Bind click event to estimator buttons within this container
      this.estimatorButtons.on('click', (e) => {
        console.log('Estimator button clicked in container'); // Debug log
        e.preventDefault();
        const productId = $(e.currentTarget).data('product-id');

        // Check if we have a modal functionality available
        if (window.productEstimatorModalInstance) {
          console.log('Opening modal for product ID:', productId); // Debug log
          window.productEstimatorModalInstance.openModal(productId);
        } else {
          console.log('No modal instance found, adding product to estimator directly'); // Debug log
          this.addToEstimator(productId);
        }
      });
    }

    /**
     * Add product to estimator
     * @param {number} productId - The product ID to add
     */
    addToEstimator(productId) {
      if (!productId) {
        console.error('No product ID provided');
        return;
      }

      this.showLoading();

      $.ajax({
        url: productEstimatorPublic.ajax_url,
        type: 'POST',
        data: {
          action: 'add_to_estimator',
          nonce: productEstimatorPublic.nonce,
          product_id: productId
        },
        success: (response) => {
          if (response.success) {
            // Show success message
            this.showMessage(response.data.message, 'success');

            // Trigger product change event
            if (this.productSelect.length) {
              this.productSelect.val(productId).trigger('change');
            }
          } else {
            this.showMessage(response.data.message, 'error');
          }
        },
        error: () => {
          this.showMessage(productEstimatorPublic.i18n.error_adding, 'error');
        },
        complete: () => {
          this.hideLoading();
        }
      });
    }

    /**
     * Handle product selection change
     */
    handleProductChange() {
      const productId = this.productSelect.val();

      if (!productId) {
        this.optionsGroup.hide();
        this.resetCalculations();
        return;
      }

      this.loadProductOptions(productId);
    }

    /**
     * Load product options via AJAX
     * @param {number} productId - The product ID
     */
    loadProductOptions(productId) {
      this.showLoading();

      $.ajax({
        url: productEstimatorPublic.ajax_url,
        type: 'POST',
        data: {
          action: 'get_product_options',
          nonce: productEstimatorPublic.nonce,
          product_id: productId
        },
        success: (response) => {
          if (response.success) {
            this.renderOptions(response.data);
          } else {
            this.showError(response.data.message);
          }
        },
        error: () => {
          this.showError(productEstimatorPublic.i18n.error_loading_options);
        },
        complete: () => {
          this.hideLoading();
        }
      });
    }

    /**
     * Render options in the form
     * @param {Array} options - The options data
     */
    renderOptions(options) {
      const optionsContainer = this.form.find('#product-options');
      optionsContainer.empty();

      if (!options.length) {
        this.optionsGroup.hide();
        return;
      }

      // Group options by category
      const groupedOptions = this.groupOptionsByCategory(options);

      // Render each group
      Object.entries(groupedOptions).forEach(([category, options]) => {
        const groupElement = $(this.templates.optionGroup);

        groupElement.find('.option-group-title').text(category);

        const itemsContainer = groupElement.find('.option-items');

        options.forEach(option => {
          const itemElement = $(this.templates.optionItem);

          itemElement.find('input').val(option.id);
          itemElement.find('.option-title').text(option.title);
          itemElement.find('.option-price').text(
            this.formatCurrency(option.price)
          );

          if (option.description) {
            itemElement.find('.option-description').text(option.description);
          }

          itemsContainer.append(itemElement);
        });

        optionsContainer.append(groupElement);
      });

      this.optionsGroup.show();
      this.updateCalculations();
    }

    /**
     * Handle form calculation
     */
    handleCalculation() {
      if (!this.validateForm()) {
        return;
      }

      this.showLoading();

      const formData = this.form.serializeArray();
      formData.push({
        name: 'action',
        value: 'calculate_estimate'
      }, {
        name: 'nonce',
        value: productEstimatorPublic.nonce
      });

      $.ajax({
        url: productEstimatorPublic.ajax_url,
        type: 'POST',
        data: formData,
        success: (response) => {
          if (response.success) {
            this.displayResults(response.data);
          } else {
            this.showError(response.data.message);
          }
        },
        error: () => {
          this.showError(productEstimatorPublic.i18n.error_calculation);
        },
        complete: () => {
          this.hideLoading();
        }
      });
    }

    /**
     * Validate the form inputs
     * @returns {boolean} Is form valid
     */
    validateForm() {
      let isValid = true;
      this.errorContainer.find('.error-content').empty();

      // Validate product selection
      if (!this.productSelect.val()) {
        this.addError(productEstimatorPublic.i18n.select_product);
        isValid = false;
      }

      // Validate quantity
      const quantity = parseInt(this.quantityInput.val());
      const min = parseInt(this.quantityInput.attr('min'));
      const max = parseInt(this.quantityInput.attr('max'));

      if (isNaN(quantity) || quantity < min || quantity > max) {
        this.addError(
          productEstimatorPublic.i18n.invalid_quantity
            .replace('%min%', min)
            .replace('%max%', max)
        );
        isValid = false;
      }

      if (!isValid) {
        this.errorContainer.show();
      }

      return isValid;
    }

    /**
     * Update calculations based on current form state
     */
    updateCalculations() {
      const selectedProduct = this.productSelect.find('option:selected');
      const basePrice = parseFloat(selectedProduct.data('base-price')) || 0;
      const quantity = parseInt(this.quantityInput.val()) || 0;

      // Calculate options total
      let optionsTotal = 0;
      this.form.find('input[name="options[]"]:checked').each(function() {
        const price = parseFloat($(this).closest('.option-item')
          .find('.option-price').text().replace(/[^0-9.-]+/g, ''));
        optionsTotal += price;
      });

      // Update state
      this.state.calculations = {
        basePrice: basePrice,
        optionsTotal: optionsTotal,
        quantity: quantity,
        total: (basePrice + optionsTotal) * quantity
      };

      this.updateDisplay();
    }

    /**
     * Update the display with calculation results
     */
    updateDisplay() {
      const calc = this.state.calculations;

      this.resultsContainer.find('.base-price-value')
        .text(this.formatCurrency(calc.basePrice));
      this.resultsContainer.find('.options-total-value')
        .text(this.formatCurrency(calc.optionsTotal));
      this.resultsContainer.find('.quantity-value')
        .text(calc.quantity);
      this.resultsContainer.find('.total-price-value')
        .text(this.formatCurrency(calc.total));

      this.resultsContainer.show();
      this.form.find('.reset-button, .download-pdf').show();
    }

    /**
     * Display calculation results
     * @param {Object} data - Result data
     */
    displayResults(data) {
      this.resultsContainer.find('.base-price-value')
        .text(data.formattedBasePrice);
      this.resultsContainer.find('.options-total-value')
        .text(data.formattedOptionsPrice);
      this.resultsContainer.find('.quantity-value')
        .text(data.quantity);
      this.resultsContainer.find('.total-price-value')
        .text(data.formattedTotal);

      this.resultsContainer.show();
      this.form.find('.reset-button, .download-pdf').show();
    }

    /**
     * Generate a PDF of the estimate
     */
    generatePDF() {
      // Implementation would depend on your PDF generation strategy
      if (typeof productEstimatorPublic.generatePDF === 'function') {
        productEstimatorPublic.generatePDF(this.state.calculations);
      } else {
        console.log('PDF generation not implemented');
      }
    }

    /**
     * Reset the form to initial state
     */
    resetForm() {
      this.form[0].reset();
      this.optionsGroup.hide();
      this.resultsContainer.hide();
      this.errorContainer.hide();
      this.form.find('.reset-button, .download-pdf').hide();
      this.resetCalculations();
    }

    /**
     * Reset the calculation state
     */
    resetCalculations() {
      this.state.calculations = {
        basePrice: 0,
        optionsTotal: 0,
        quantity: 0,
        total: 0
      };
    }

    /**
     * Format currency amount
     * @param {number} amount - Amount to format
     * @returns {string} Formatted amount
     */
    formatCurrency(amount) {
      return productEstimatorPublic.currency +
        amount.toFixed(productEstimatorPublic.decimal_points);
    }

    /**
     * Group options by category
     * @param {Array} options - The options array
     * @returns {Object} Options grouped by category
     */
    groupOptionsByCategory(options) {
      return options.reduce((groups, option) => {
        const category = option.category || 'Other';
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(option);
        return groups;
      }, {});
    }

    /**
     * Show loading overlay
     */
    showLoading() {
      this.loadingOverlay.show();
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
      this.loadingOverlay.hide();
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
      this.errorContainer.find('.error-content').html(message);
      this.errorContainer.show();
    }

    /**
     * Show message above form
     * @param {string} message - Message text
     * @param {string} type - Message type ('success' or 'error')
     */
    showMessage(message, type) {
      const messageClass = type === 'error' ? 'woocommerce-error' : 'woocommerce-message';
      const $message = $(`<div class="${messageClass} product-estimator-message">${message}</div>`);

      // Remove any existing messages
      $('.product-estimator-message').remove();

      // Add the new message
      this.container.prepend($message);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        $message.fadeOut(() => $message.remove());
      }, 5000);
    }

    /**
     * Add error message
     * @param {string} message - Error message
     */
    addError(message) {
      const errorContent = this.errorContainer.find('.error-content');
      errorContent.append($('<div>').text(message));
    }

    /**
     * Validate quantity input
     */
    validateQuantity() {
      const value = this.quantityInput.val();
      const min = parseInt(this.quantityInput.attr('min'));
      const max = parseInt(this.quantityInput.attr('max'));

      if (value && (parseInt(value) < min || parseInt(value) > max)) {
        this.quantityInput.addClass('error');
      } else {
        this.quantityInput.removeClass('error');
      }

      this.updateCalculations();
    }

    /**
     * Initialize tooltips
     */
    initializeTooltips() {
      this.container.on('mouseenter', '[data-tooltip]', (e) => {
        const element = $(e.currentTarget);
        const content = element.data('tooltip');

        if (!content) return;

        const tooltip = $(this.templates.tooltip);
        tooltip.find('.tooltip-content').text(content);

        $('body').append(tooltip);

        const position = element.offset();
        const elementWidth = element.outerWidth();
        const elementHeight = element.outerHeight();

        tooltip.css({
          top: position.top + elementHeight + 5,
          left: position.left + (elementWidth / 2) - (tooltip.outerWidth() / 2)
        });
      });

      this.container.on('mouseleave', '[data-tooltip]', () => {
        $('.estimator-tooltip').remove();
      });
    }
  }

  // Initialize all product estimators on the page
  $(document).ready(() => {
    console.log('Document ready, initializing product estimators'); // Debug log
    console.log('Found product estimator containers:', $('.product-estimator-container').length); // Debug log

    $('.product-estimator-container').each(function() {
      new ProductEstimator(this);
    });

    // If we're on a regular content page with shortcode buttons but no modal
    if ($('.product-estimator-button').length && !$('#product-estimator-modal').length) {
      console.log('Found estimator buttons outside containers, adding modal to page'); // Debug log

      // Add modal HTML to page if not already present
      $('body').append(`
        <div id="product-estimator-modal" class="product-estimator-modal">
            <div class="product-estimator-modal-overlay"></div>
            <div class="product-estimator-modal-container">
                <button class="product-estimator-modal-close" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                <div class="product-estimator-modal-header">
                    <h2>Product Estimator</h2>
                </div>
                <div class="product-estimator-modal-content">
                    <div class="product-estimator-modal-loading" style="display: none;">
                        <div class="loading-spinner"></div>
                        <div class="loading-text">Loading...</div>
                    </div>
                    <div class="product-estimator-modal-form-container">
                        <!-- Form will be loaded here via AJAX -->
                    </div>
                </div>
            </div>
        </div>
      `);

      // Initialize the modal
      if (typeof window.ProductEstimatorModal === 'function') {
        console.log('Initializing modal for shortcode buttons'); // Debug log
        window.productEstimatorModalInstance = new window.ProductEstimatorModal();
      } else {
        console.log('ProductEstimatorModal class not available, loading modal script'); // Debug log

        // Dynamically load the modal script
        $.getScript(productEstimatorPublic.plugin_url + 'public/js/product-estimator-modal.js')
          .done(function() {
            console.log('Modal script loaded successfully'); // Debug log
            // Wait a moment for the script to execute
            setTimeout(function() {
              if (typeof window.ProductEstimatorModal === 'function') {
                window.productEstimatorModalInstance = new window.ProductEstimatorModal();
              }
            }, 200);
          })
          .fail(function() {
            console.error('Failed to load modal script'); // Debug log
          });
      }
    }

    // Bind click events for buttons outside containers directly
    $(document).on('click', '.product-estimator-button:not(.product-estimator-container .product-estimator-button)', function(e) {
      console.log('Standalone estimator button clicked'); // Debug log
      e.preventDefault();
      const productId = $(this).data('product-id');

      if (window.productEstimatorModalInstance) {
        window.productEstimatorModalInstance.openModal(productId);
      } else {
        console.warn('Modal instance not available for button click'); // Debug log

        // If the modal instance doesn't exist yet, create it dynamically
        if (!$('#product-estimator-modal').length) {
          // Add modal HTML to page if not already present
          $('body').append(`
            <div id="product-estimator-modal" class="product-estimator-modal">
                <div class="product-estimator-modal-overlay"></div>
                <div class="product-estimator-modal-container">
                    <button class="product-estimator-modal-close" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <div class="product-estimator-modal-header">
                        <h2>Product Estimator</h2>
                    </div>
                    <div class="product-estimator-modal-content">
                        <div class="product-estimator-modal-loading" style="display: none;">
                            <div class="loading-spinner"></div>
                            <div class="loading-text">Loading...</div>
                        </div>
                        <div class="product-estimator-modal-form-container">
                            <!-- Form will be loaded here via AJAX -->
                        </div>
                    </div>
                </div>
            </div>
          `);
        }

        $.getScript(productEstimatorPublic.plugin_url + 'public/js/product-estimator-modal.js')
          .done(function() {
            // Create the modal instance and open it
            window.productEstimatorModalInstance = new window.ProductEstimatorModal();
            setTimeout(function() {
              window.productEstimatorModalInstance.openModal(productId);
            }, 100);
          })
          .fail(function() {
            console.error('Failed to load modal script'); // Debug log

            // Fallback: redirect to estimator page
            if (productEstimatorPublic.estimator_url) {
              window.location.href = productEstimatorPublic.estimator_url + '?product_id=' + productId;
            }
          });
      }
    });
  });

})(jQuery);
