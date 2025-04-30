/**
 * PrintEstimate.js
 *
 * Handles PDF generation and viewing for the Product Estimator plugin.
 * Manages email verification, secure token generation, and PDF display.
 */

import ConfirmationDialog from './ConfirmationDialog';


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
        printButton: '.print-estimate, .print-estimate-pdf',
        requestContactButton: '.request-contact-estimate',
        requestCopyButton: '.request-a-copy',
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
      // Handle print PDF buttons
      const printButton = e.target.closest(this.config.selectors.printButton);
      if (printButton && !this.processing) {
        e.preventDefault(); // Prevent default link behavior

        // Set processing state to prevent double-clicks
        this.processing = true;
        this.setButtonLoading(printButton, true);

        if (printButton.classList.contains('print-estimate-pdf')) {
          // This is a direct PDF link - check email before proceeding
          const estimateId = printButton.dataset.estimateId;

          this.checkCustomerEmail(estimateId)
            .then(hasEmail => {
              if (hasEmail) {
                // Email exists, open the PDF URL
                const pdfUrl = printButton.getAttribute('href');

                if (pdfUrl && pdfUrl !== '#' && pdfUrl !== 'javascript:void(0)') {
                  window.open(pdfUrl, '_blank');
                } else {
                  // Get a fresh PDF URL
                  this.getSecurePdfUrl(estimateId)
                    .then(url => {
                      window.open(url, '_blank');
                    })
                    .catch(error => {
                      this.showError('Error generating PDF URL. Please try again.');
                    });
                }
              } else {
                // No email, show prompt
                this.showEmailPrompt(estimateId, printButton, 'pdf');
              }
            })
            .catch(error => {
              this.showError('Error checking customer email. Please try again.');
            })
            .finally(() => {
              // Reset button state
              // this.setButtonLoading(printButton, false);
              // this.processing = false;
            });
        } else {
          // This is a JS-based print button
          this.handlePrintEstimate(printButton);
        }
      }

      // Handle request copy button (email PDF to customer)
      const requestCopyButton = e.target.closest(this.config.selectors.requestCopyButton);
      if (requestCopyButton && !this.processing) {
        e.preventDefault();

        this.processing = true;
        this.setButtonLoading(requestCopyButton, true);

        const estimateId = requestCopyButton.dataset.estimateId;

        // Show contact method choice modal
        this.showContactSelectionPrompt(estimateId, requestCopyButton, 'request_copy');
      }
      // Other button handlers can be added here
    });
  }

  /**
   * Handle print estimate button click
   * @param {HTMLElement} button - The clicked button
   */
  handlePrintEstimate(button) {
    const estimateId = button.dataset.estimateId;

    if (!estimateId) {
      this.showError('No estimate ID provided');
      this.setButtonLoading(button, false);
      this.processing = false;
      return;
    }

    this.log(`Print estimate requested for estimate ID: ${estimateId}`);

    // Check if customer has email
    this.checkCustomerEmail(estimateId)
      .then(hasEmail => {
        if (hasEmail) {
          // Customer has email, proceed with store and generate
          return this.storeEstimate(estimateId)
            .then(data => {
              if (data && data.estimate_id) {
                // Get a secure PDF URL
                return this.getSecurePdfUrl(data.estimate_id);
              } else {
                throw new Error('Failed to store estimate');
              }
            })
            .then(pdfUrl => {
              this.setButtonLoading(button, false);
              this.processing = false;
              // Open the PDF URL in a new tab
              window.open(pdfUrl, '_blank');
            });
        } else {
          // No email, show prompt
          this.showEmailPrompt(estimateId, button, 'print');
          return Promise.reject(new Error('email_prompt_shown'));
        }
      })
      .catch(error => {
        if (error.message !== 'email_prompt_shown') {
          this.showError('Error generating PDF. Please try again.');
        }
      })
      .finally(() => {
        // Reset button state
        // this.setButtonLoading(button, false);
        // this.processing = false;
      });
  }

  /**
   * Show email prompt modal
   * @param {string} estimateId - The estimate ID
   * @param {HTMLElement} button - The button element
   * @param {string} action - The action type ('print', 'copy', etc.)
   */
  showEmailPrompt(estimateId, button, action = 'print') {
    // Create modal HTML
    const modalHtml = `
      <div class="email-prompt-overlay"></div>
      <div class="email-prompt-container">
        <div class="email-prompt-header">
          <h3>Please Enter Your Email</h3>
        </div>
        <div class="email-prompt-body">
          <p>An email address is required to view your estimate.</p>
          <div class="form-group">
            <label for="customer-email-input">Email Address:</label>
            <input type="email" id="customer-email-input" required>
          </div>
          <div class="email-validation-message"></div>
        </div>
        <div class="email-prompt-footer">
          <button type="button" class="button cancel-email-btn">Cancel</button>
          <button type="button" class="button submit-email-btn">Continue</button>
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
        validationMsg.textContent = 'Email address is required';
        return;
      }

      // Simple email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        validationMsg.textContent = 'Please enter a valid email address';
        return;
      }

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';

      // Update customer details with the email
      this.updateCustomerEmail(estimateId, email)
        .then(() => {
          // Remove prompt
          promptEl.remove();
          this.setButtonLoading(button, true);
          this.processing = true;
          // Continue with the original action
          if (action === 'print') {

            this.handlePrintEstimate(button);
          } else if (action === 'request_copy') {

            this.requestCopyEstimate(estimateId, button)
              .then(response => {
                this.showMessage(
                  `Estimate has been emailed to ${response.email}`,
                  'success',
                  () => {
                    this.setButtonLoading(button, false);
                    this.processing = false;
                  }
                );
              })
              .catch(error => {
                this.showError('Error sending estimate copy. Please try again.');
              })
              .finally(() => {

              });

          }
        })
        .catch(error => {
          validationMsg.textContent = 'Error saving email. Please try again.';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Continue';
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
   * Show email prompt modal
   * @param {string} estimateId - The estimate ID
   * @param {HTMLElement} button - The button element
   * @param {string} action - The action type ('print', 'copy', etc.)
   */
  showContactSelectionPrompt(estimateId, button, action = 'request_copy') {
    const modalHtml = `
    <div class="email-prompt-overlay"></div>
    <div class="email-prompt-container">
      <div class="email-prompt-header">
        <h3>How would you like to receive your estimate?</h3>
      </div>
      <div class="email-prompt-body">
        <p>Please choose how you'd prefer to receive your estimate:</p>
      </div>
      <div class="email-prompt-footer">
        <button type="button" class="button cancel-email-btn">Cancel</button>
        <button type="button" class="button submit-email-btn email-choice">Email</button>
        <button type="button" class="button submit-email-btn sms-choice">SMS</button>
      </div>
    </div>
  `;

    const promptEl = document.createElement('div');
    promptEl.className = 'email-prompt-modal';
    promptEl.innerHTML = modalHtml;
    document.body.appendChild(promptEl);

    const cancelBtn = promptEl.querySelector('.cancel-email-btn');
    const emailBtn = promptEl.querySelector('.email-choice');
    const smsBtn = promptEl.querySelector('.sms-choice');

    cancelBtn.addEventListener('click', () => {
      this.setButtonLoading(button, false);
      this.processing = false;
      promptEl.remove();
    });

    emailBtn.addEventListener('click', () => {
      promptEl.remove();

      // Run the original flow for "Email"
      this.checkCustomerEmail(estimateId)
        .then(hasEmail => {
          if (hasEmail) {
            this.requestCopyEstimate(estimateId, button)
              .then(response => {
                this.showMessage(`Estimate has been emailed to ${response.email}`, 'success', () => {
                  this.setButtonLoading(button, false);
                  this.processing = false;
                });
              })
              .catch(() => {
                this.showError('Error sending estimate copy. Please try again.');
                this.setButtonLoading(button, false);
                this.processing = false;
              });
          } else {
            this.showEmailPrompt(estimateId, button, 'request_copy');
          }
        })
        .catch(() => {
          this.showError('Error checking customer email. Please try again.');
          this.setButtonLoading(button, false);
          this.processing = false;
        });
    });

    smsBtn.addEventListener('click', () => {
      promptEl.remove();
      this.showMessage('SMS option coming soon.');
      this.setButtonLoading(button, false);
      this.processing = false;
    });
  }
  /**
   * Check if customer has an email address
   * @param {string} estimateId - The estimate ID
   * @returns {Promise<boolean>} Promise that resolves to whether customer has email
   */
  checkCustomerEmail(estimateId) {
    return new Promise((resolve, reject) => {
      fetch(productEstimatorVars.ajax_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          action: 'check_customer_email',
          nonce: productEstimatorVars.nonce,
          estimate_id: estimateId
        })
      })
        .then(response => response.json())
        .then(response => {
          if (response.success) {
            this.log('Customer email check result:', response.data);
            resolve(response.data.has_email);
          } else {
            reject(new Error(response.data?.message || 'Error checking customer email'));
          }
        })
        .catch(error => {
          this.log('Error checking customer email:', error);
          reject(error);
        });
    });
  }

  /**
   * Update customer email
   * @param {string} estimateId - The estimate ID
   * @param {string} email - The email address
   * @returns {Promise} Promise that resolves when email is updated
   */
  updateCustomerEmail(estimateId, email) {
    return new Promise((resolve, reject) => {
      // First get existing customer details
      fetch(productEstimatorVars.ajax_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          action: 'check_customer_email',
          nonce: productEstimatorVars.nonce,
          estimate_id: estimateId
        })
      })
        .then(response => response.json())
        .then(response => {
          if (!response.success) {
            throw new Error('Failed to get customer details');
          }

          // Get existing details or initialize empty object
          const existingDetails = response.data.customer_details || {};

          // Merge existing details with new email, ensuring we preserve all required fields
          const updatedDetails = {
            ...existingDetails,
            email: email
          };

          // Make sure name and postcode exist (required fields)
          if (!updatedDetails.name) {
            updatedDetails.name = 'Customer';
          }

          if (!updatedDetails.postcode) {
            updatedDetails.postcode = '0000'; // Default postcode
          }

          // Update customer details
          return fetch(productEstimatorVars.ajax_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              action: 'update_customer_details',
              nonce: productEstimatorVars.nonce,
              details: JSON.stringify(updatedDetails)
            })
          });
        })
        .then(response => response.json())
        .then(response => {
          if (!response.success) {
            throw new Error(response.data?.message || 'Error updating customer details');
          }

          // Now store the estimate to the database, passing ONLY the estimate_id
          return fetch(productEstimatorVars.ajax_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              action: 'store_single_estimate',
              nonce: productEstimatorVars.nonce,
              estimate_id: estimateId
            })
          });
        })
        .then(response => response.json())
        .then(response => {
          if (response.success) {
            resolve(response.data);
          } else {
            console.error('Error storing estimate:', response);
            throw new Error(response.data?.message || 'Error storing estimate');
          }
        })
        .catch(error => {
          console.error('Error in updateCustomerEmail:', error);
          reject(error);
        });
    });
  }

  /**
   * Store the estimate in the database
   * @param {string} estimateId - The estimate ID
   * @returns {Promise<Object>} Promise that resolves when estimate is stored
   */
  storeEstimate(estimateId) {
    return new Promise((resolve, reject) => {
      fetch(productEstimatorVars.ajax_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          action: 'store_single_estimate',
          nonce: productEstimatorVars.nonce,
          estimate_id: estimateId
        })
      })
        .then(response => response.json())
        .then(response => {
          if (response.success) {
            this.log('Estimate stored successfully', response.data);
            resolve(response.data);
          } else {
            reject(new Error(response.data?.message || 'Error storing estimate'));
          }
        })
        .catch(error => {
          this.log('Error storing estimate:', error);
          reject(error);
        });
    });
  }

  /**
   * Get a secure PDF URL for an estimate
   * @param {number|string} dbId - The database ID
   * @returns {Promise<string>} Promise that resolves to the secure URL
   */
  getSecurePdfUrl(dbId) {
    return new Promise((resolve, reject) => {
      fetch(productEstimatorVars.ajax_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          action: 'get_secure_pdf_url',
          nonce: productEstimatorVars.nonce,
          estimate_id: dbId
        })
      })
        .then(response => response.json())
        .then(response => {
          if (response.success && response.data.url) {
            this.log('Received secure PDF URL:', response.data);
            resolve(response.data.url);
          } else {
            reject(new Error(response.data?.message || 'Failed to get secure PDF URL'));
          }
        })
        .catch(error => {
          this.log('Error getting secure PDF URL:', error);
          reject(error);
        });
    });
  }

  /**
   * Request a copy of the estimate to be sent via email
   * @param {string} estimateId - The estimate ID
   * @returns {Promise<Object>} Promise that resolves when email is sent
   */
  requestCopyEstimate(estimateId, button) {
    return this.checkCustomerEmail(estimateId)
      .then(hasEmail => {
        if (!hasEmail) {
          return Promise.reject(new Error('no_email'));
        }
        return this.storeEstimate(estimateId)
          .then(data => {
            if (!data || !data.estimate_id) {
              throw new Error('Failed to store estimate');
            }

            return new Promise((resolve, reject) => {
              fetch(productEstimatorVars.ajax_url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                  action: 'request_copy_estimate',
                  nonce: productEstimatorVars.nonce,
                  estimate_id: estimateId
                })
              })
                .then(response => response.json())
                .then(response => {
                  if (response.success) {
                    resolve(response.data);
                  } else {
                    if (response.data?.code === 'no_email') {
                      reject(new Error('no_email'));
                    } else {
                      reject(new Error(response.data?.message || 'Error requesting estimate copy'));
                    }
                  }
                })
                .catch(error => {
                  this.log('Error requesting estimate copy:', error);
                  reject(error);
                });
            });
          });
      });
  }

  /**
   * Set button loading state
   * @param {HTMLElement} button - The button element
   * @param {boolean} isLoading - Whether button is in loading state
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
   * Show success or error message
   * @param {string} message - Message text
   * @param {string} type - Message type ('success' or 'error')
   */
  showMessage(message, type = 'success', onConfirm = null) {
    if (window.productEstimator && window.productEstimator.dialog) {
      window.productEstimator.dialog.show({
        title: 'Estimate Sent',
        message: message,
        type: 'estimate',
        action: 'confirm',
        confirmText: 'OK',
        cancelText: null,
        onConfirm: () => {
          if (typeof onConfirm === 'function') {
            onConfirm();
          }
        }
      });
    } else {
      alert(message);
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    // Try to use modal error display if available
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
