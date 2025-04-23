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
   * Enhanced handlePrintEstimate method with proper handling for "0" estimate IDs
   * @param {HTMLElement} button - The button that was clicked
   */
  handlePrintEstimate(button) {
    const estimateId = button.dataset.estimateId;

    // Check if estimateId is not null or undefined (allowing "0" as valid)
    if (estimateId === undefined || estimateId === null) {
      this.showError('No estimate ID provided');
      return;
    }

    this.log(`Print estimate requested for estimate ID: ${estimateId} (type: ${typeof estimateId})`);

    // Set processing state
    this.processing = true;
    this.setButtonLoading(button, true);

    // First check if customer has an email address via AJAX
    this.checkCustomerEmail(estimateId)
      .then(hasEmail => {
        if (hasEmail) {
          // Customer has email, proceed with PDF generation
          this.generatePdf(estimateId, button);
        } else {
          // Reset button state as we'll show a prompt
          this.setButtonLoading(button, false);
          this.processing = false;

          // Show prompt to collect email
          this.showEmailPrompt(estimateId, button);
        }
      })
      .catch(error => {
        this.log('Error checking customer email:', error);
        this.setButtonLoading(button, false);
        this.processing = false;
        this.showError('Error checking customer details. Please try again.');
      });
  }

  /**
   * Check if customer has an email address via AJAX
   * This uses an AJAX call to check the server-side session data
   * @param {string|number} estimateId - The estimate ID
   * @returns {Promise<boolean>} Promise resolving to whether customer has email
   */
  checkCustomerEmail(estimateId) {
    return new Promise((resolve, reject) => {
      // Ensure we have a string version of the estimate ID (even if "0")
      const estimateIdStr = String(estimateId);

      this.log(`Checking customer email for estimate: ${estimateIdStr}`);

      // Use AJAX to check customer details in session on the server
      fetch(productEstimatorVars.ajax_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          action: 'check_customer_email',
          nonce: productEstimatorVars.nonce,
          estimate_id: estimateIdStr // Always pass as string
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
            this.log(`Customer email check result: ${response.data.has_email ? 'Has email' : 'No email'}`);
            if (response.data.customer_details) {
              // Store the customer details for later use
              this._customerDetails = response.data.customer_details;
            }
            resolve(response.data.has_email);
          } else {
            reject(new Error(response.data?.message || 'Error checking customer email'));
          }
        })
        .catch(error => {
          this.log('AJAX error in checkCustomerEmail:', error);
          reject(error);
        });
    });
  }

  /**
   * Show a modal prompt to collect customer email
   * @param {string} estimateId - The estimate ID
   * @param {HTMLElement} button - The button element
   */
  showEmailPrompt(estimateId, button) {
    // Get customer details - use stored details from checkCustomerEmail if available
    const customerDetails = this._customerDetails || {};

    // Create modal HTML
    const modalHtml = `
  <div class="email-prompt-overlay"></div>
  <div class="email-prompt-container">
    <div class="email-prompt-header">
      <h3>${productEstimatorVars.i18n?.enter_email || 'Please Enter Your Email'}</h3>
    </div>
    <div class="email-prompt-body">
      <p>${productEstimatorVars.i18n?.email_required_message || 'An email address is required to print your estimate.'}</p>
      <div class="form-group">
        <label for="customer-email-input">${productEstimatorVars.i18n?.email_address || 'Email Address'}:</label>
        <input type="email" id="customer-email-input" required
               value="${customerDetails?.email || ''}">
      </div>
      <div class="email-validation-message"></div>
    </div>
    <div class="email-prompt-footer">
      <button type="button" class="button cancel-email-btn">
        ${productEstimatorVars.i18n?.cancel || 'Cancel'}
      </button>
      <button type="button" class="button submit-email-btn">
        ${productEstimatorVars.i18n?.continue || 'Continue'}
      </button>
    </div>
  </div>
`;

    // Create container for the modal
    const promptEl = document.createElement('div');
    promptEl.className = 'email-prompt-modal';
    promptEl.innerHTML = modalHtml;
    document.body.appendChild(promptEl);

    // Get elements
    const cancelBtn = promptEl.querySelector('.cancel-email-btn');
    const submitBtn = promptEl.querySelector('.submit-email-btn');
    const emailInput = promptEl.querySelector('#customer-email-input');
    const validationMsg = promptEl.querySelector('.email-validation-message');

    // Handle cancel
    cancelBtn.addEventListener('click', () => {
      promptEl.remove();
    });

    // Handle submit
    submitBtn.addEventListener('click', () => {
      // Validate email
      const email = emailInput.value.trim();
      if (!email) {
        validationMsg.textContent = productEstimatorVars.i18n?.email_required || 'Email address is required';
        return;
      }

      // Simple email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        validationMsg.textContent = productEstimatorVars.i18n?.invalid_email || 'Please enter a valid email address';
        return;
      }

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = productEstimatorVars.i18n?.saving || 'Saving...';

      // Update customer details with the email
      this.log('Submitting email update:', email, 'for estimate:', estimateId);

      this.updateCustomerEmail(estimateId, email)
        .then((updatedDetails) => {
          this.log('Email update successful');
          // Remove prompt
          promptEl.remove();

          // Dispatch an event to notify the rest of the application about the email update
          this.notifyEmailUpdated(updatedDetails);

          // Proceed with PDF generation
          this.generatePdf(estimateId, button);
        })
        .catch(error => {
          this.log('Error updating customer email:', error);
          // Display detailed error message
          let errorMessage = 'Error saving email. Please try again.';

          if (error.message) {
            errorMessage += ' (' + error.message + ')';
          }

          validationMsg.textContent = productEstimatorVars.i18n?.email_save_error || errorMessage;
          validationMsg.style.color = 'red';

          // Reset button
          submitBtn.disabled = false;
          submitBtn.textContent = productEstimatorVars.i18n?.continue || 'Continue';
        });
    });

    // Set focus to email input
    setTimeout(() => {
      emailInput.focus();

      // Add enter key handler
      emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitBtn.click();
        }
      });
    }, 100);
  }

  /**
   * Notify the application about an email update via custom event
   * @param {Object} details - The updated customer details
   */
  notifyEmailUpdated(details) {
    if (!details) return;

    this.log('Dispatching customer_details_updated event', details);

    // Create and dispatch a custom event that other components can listen for
    const event = new CustomEvent('customer_details_updated', {
      bubbles: true,
      detail: {
        details: details,
        source: 'print_estimate'
      }
    });

    document.dispatchEvent(event);

    // Also update data-has-email on the form if it exists
    const newEstimateForm = document.querySelector('#new-estimate-form');
    if (newEstimateForm && details.email) {
      newEstimateForm.setAttribute('data-has-email', 'true');
      this.log('Updated new-estimate-form data-has-email attribute to true');
    }
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
   * @returns {Promise} Promise that resolves when estimate is stored
   */
  storeEstimate(estimateId) {
    return new Promise((resolve, reject) => {
      // Get customer details from stored details or get from server
      const customerDetails = this._customerDetails || {};

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
   * Update customer email in session and database
   * @param {string} estimateId - The estimate ID
   * @param {string} email - The email address
   * @returns {Promise<Object>} Promise that resolves with updated details when email is updated
   */
  updateCustomerEmail(estimateId, email) {
    return new Promise((resolve, reject) => {
      // Get current customer details
      const customerDetails = this._customerDetails || {};

      // Update email in the customerDetails object
      const updatedDetails = {
        ...customerDetails,
        email: email
      };

      // Ensure we have other required fields
      if (!updatedDetails.name) {
        updatedDetails.name = 'Customer'; // Fallback name
      }

      if (!updatedDetails.postcode) {
        updatedDetails.postcode = ''; // Empty postcode as fallback
      }

      this.log('Updating customer email with details:', updatedDetails);
      this.log('Using estimate ID:', estimateId, 'Type:', typeof estimateId);

      // First, update the customer details in session
      fetch(productEstimatorVars.ajax_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          action: 'update_customer_details',
          nonce: productEstimatorVars.nonce,
          details: JSON.stringify(updatedDetails)
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
            this.log('Customer details updated successfully', response.data);

            // Update stored customer details
            this._customerDetails = response.data.details || updatedDetails;

            // Important: Always include estimate_id in the request, even if it's "0"
            // Convert estimateId to string to ensure consistent handling
            const estimateIdStr = String(estimateId);

            this.log('Storing estimate with ID:', estimateIdStr);

            // Now update the estimate with the new details
            return fetch(productEstimatorVars.ajax_url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: new URLSearchParams({
                action: 'store_single_estimate',
                nonce: productEstimatorVars.nonce,
                estimate_id: estimateIdStr, // Use string version
                customer_name: updatedDetails.name || 'Customer',
                customer_email: updatedDetails.email,
                customer_phone: updatedDetails.phone || '',
                customer_postcode: updatedDetails.postcode || '',
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
                this.log('Estimate stored with updated email response:', response);
                if (response.success) {
                  // Return the updated details so they can be used by the caller
                  resolve(this._customerDetails);
                } else {
                  throw new Error(response.data?.message || 'Error storing estimate with updated email');
                }
              });
          } else {
            throw new Error(response.data?.message || 'Error updating customer details');
          }
        })
        .catch(error => {
          this.log('Error in updateCustomerEmail:', error);
          reject(error);
        });
    });
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
