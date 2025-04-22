/**
 * PrintEstimate.js
 *
 * Handles the print estimate functionality for the Product Estimator.
 */

class PrintEstimate {
  /**
   * Initialize the PrintEstimate module
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    // Default configuration
    this.config = Object.assign({
      debug: false,
      selectors: {
        printButton: '.print-estimate',
        requestCallButton: '.request-call-estimate',
        scheduleDesignerButton: '.schedule-designer-estimate'
      },
      i18n: window.productEstimatorVars?.i18n || {}
    }, config);

    // State
    this.initialized = false;
    this.processing = false;

    // Initialize if auto-init is not set to false
    if (config.autoInit !== false) {
      this.init();
    }
  }

  /**
   * Initialize the module
   * @returns {PrintEstimate} This instance for chaining
   */
  init() {
    if (this.initialized) {
      this.log('PrintEstimate already initialized');
      return this;
    }

    // Bind event handlers
    this.bindEvents();

    this.initialized = true;
    this.log('PrintEstimate initialized');
    return this;
  }

  /**
   * Bind events for printing estimates
   */
  bindEvents() {
    // Use event delegation for better performance and to handle dynamically added elements
    document.addEventListener('click', (e) => {
      // Print Estimate button
      const printButton = e.target.closest(this.config.selectors.printButton);
      if (printButton && !this.processing) {
        e.preventDefault();
        this.handlePrintEstimate(printButton);
      }

      // Request Call button
      const requestCallButton = e.target.closest(this.config.selectors.requestCallButton);
      if (requestCallButton && !this.processing) {
        e.preventDefault();
        this.handleRequestCall(requestCallButton);
      }

      // Schedule Designer button
      const scheduleDesignerButton = e.target.closest(this.config.selectors.scheduleDesignerButton);
      if (scheduleDesignerButton && !this.processing) {
        e.preventDefault();
        this.handleScheduleDesigner(scheduleDesignerButton);
      }
    });

    this.log('Print estimate events bound');
  }

  /**
   * Handle print estimate button click
   * @param {HTMLElement} button - The clicked button
   */
  handlePrintEstimate(button) {
    const estimateId = button.dataset.estimateId;

    if (!estimateId) {
      this.showError('No estimate ID provided');
      return;
    }

    this.log(`Print estimate requested for estimate ID: ${estimateId}`);

    // Set processing state
    this.processing = true;
    this.setButtonLoading(button, true);

    // Skip the check and go directly to print - this simplifies the flow and avoids potential issues
    this.generatePdf(estimateId, button);
  }

  /**
   * Generate PDF for the estimate - simplified version that directly calls print_estimate
   * @param {string} estimateId - The estimate ID
   * @param {HTMLElement} button - The button element
   */
  generatePdf(estimateId, button) {
    fetch(productEstimatorVars.ajax_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        action: 'print_estimate',
        nonce: productEstimatorVars.nonce,
        estimate_id: estimateId
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response error: ${response.status}`);
        }
        return response.json();
      })
      .then(response => {
        if (response.success) {
          this.log('PDF generated successfully', response.data);

          // Open PDF in new window
          if (response.data.pdf_url) {
            window.open(response.data.pdf_url, '_blank');
          }
        } else {
          this.log('Error generating PDF', response.data);
          this.showError(response.data.message || 'Error generating PDF. Please try again.');
        }
      })
      .catch(error => {
        this.log('AJAX error', error);
        this.showError('Connection error. Please try again.');
      })
      .finally(() => {
        // Reset processing state
        this.processing = false;
        this.setButtonLoading(button, false);
      });
  }

  /**
   * Handle request call button click
   * @param {HTMLElement} button - The clicked button
   */
  handleRequestCall(button) {
    const estimateId = button.dataset.estimateId;

    if (!estimateId) {
      this.showError('No estimate ID provided');
      return;
    }

    this.log(`Request call requested for estimate ID: ${estimateId}`);

    // First, ensure the estimate is saved in the database
    this.saveEstimateIfNeeded(estimateId, () => {
      // Now show the request call form/modal
      // This would be implemented based on your specific UI requirements
      alert('Request call feature will be implemented here');
    });
  }

  /**
   * Handle schedule designer button click
   * @param {HTMLElement} button - The clicked button
   */
  handleScheduleDesigner(button) {
    const estimateId = button.dataset.estimateId;

    if (!estimateId) {
      this.showError('No estimate ID provided');
      return;
    }

    this.log(`Schedule designer requested for estimate ID: ${estimateId}`);

    // First, ensure the estimate is saved in the database
    this.saveEstimateIfNeeded(estimateId, () => {
      // Now show the schedule designer form/modal
      // This would be implemented based on your specific UI requirements
      alert('Schedule designer feature will be implemented here');
    });
  }

  /**
   * Save estimate if needed before proceeding with an action
   * @param {string} estimateId - The estimate ID
   * @param {Function} callback - Callback to execute after saving
   */
  saveEstimateIfNeeded(estimateId, callback) {
    // Set processing state
    this.processing = true;

    // Skip checking and just store the estimate - simplifies the flow
    this.storeEstimate(estimateId)
      .then(data => {
        if (typeof callback === 'function') {
          callback(data.estimate_id || estimateId);
        }
      })
      .catch(error => {
        this.log('Error storing estimate', error);
        this.showError('Error storing estimate. Please try again.');
      })
      .finally(() => {
        // Reset processing state
        this.processing = false;
      });
  }

  /**
   * Store the estimate in the database
   * @param {string} estimateId - The estimate ID
   * @param {HTMLElement} button - The button element
   * @returns {Promise} Promise that resolves when estimate is stored
   */
  storeEstimate(estimateId) {
    return new Promise((resolve, reject) => {
      // Get customer details - we may want to use existing customer details from session
      // or could prompt the user to confirm details before printing
      const customerDetails = this.getCustomerDetails();

      fetch(productEstimatorVars.ajax_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          action: 'store_single_estimate',
          nonce: productEstimatorVars.nonce,
          estimate_id: estimateId,
          customer_name: customerDetails.name || '',
          customer_email: customerDetails.email || '',
          customer_phone: customerDetails.phone || '',
          customer_postcode: customerDetails.postcode || '',
          notes: ''
        })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Network response error: ${response.status}`);
          }
          return response.json();
        })
        .then(response => {
          if (response.success) {
            this.log('Estimate stored successfully', response.data);
            resolve(response.data);
          } else {
            reject(new Error(response.data?.message || 'Error storing estimate'));
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Get customer details from session or page DOM
   * @returns {Object} Customer details
   */
  getCustomerDetails() {
    // Try to find customer details in the DOM or session
    // This could be expanded to look for specific elements or use session data
    const details = {
      name: '',
      email: '',
      phone: '',
      postcode: ''
    };

    // Try to find customer details in session through query parameter to PHP
    // We'll rely on the server having this data in session

    return details;
  }

  /**
   * Set button loading state
   * @param {HTMLElement} button - The button element
   * @param {boolean} isLoading - Whether the button is in loading state
   */
  setButtonLoading(button, isLoading) {
    if (!button) return;

    const originalText = button.dataset.originalText || button.textContent;

    if (isLoading) {
      // Store original text if not already stored
      if (!button.dataset.originalText) {
        button.dataset.originalText = button.textContent;
      }

      button.classList.add('loading');
      button.innerHTML = '<span class="loading-dots">Processing...</span>';
      button.disabled = true;
    } else {
      button.classList.remove('loading');
      button.textContent = originalText;
      button.disabled = false;
    }
  }

  /**
   * Show error message to the user
   * Uses the modal's message display if available, otherwise falls back to alert
   * @param {string} message - Error message
   */
  showError(message) {
    // Check if we can display in the modal
    if (window.productEstimator &&
      window.productEstimator.core &&
      typeof window.productEstimator.core.showError === 'function') {
      window.productEstimator.core.showError(message);
    } else {
      // Fall back to alert
      alert(message);
    }
  }

  /**
   * Show success message to the user
   * @param {string} message - Success message
   */
  showSuccess(message) {
    // Check if we can display in the modal
    if (window.productEstimator &&
      window.productEstimator.core &&
      typeof window.productEstimator.core.showMessage === 'function') {
      window.productEstimator.core.showMessage(message, 'success');
    } else {
      // Fall back to alert
      alert(message);
    }
  }

  /**
   * Log debug messages
   * @param {...any} args - Arguments to log
   */
  log(...args) {
    if (this.config.debug) {
      console.log('[PrintEstimate]', ...args);
    }
  }
}

// Export the class
export default PrintEstimate;
