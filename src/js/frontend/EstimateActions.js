/**
 * EstimateActions.js
 *
 * Handles PDF generation and viewing for the Product Estimator plugin.
 * Manages customer detail verification, secure token generation, and PDF display.
 * Includes support for persistent customer details across estimates.
 * Added functionality for store contact requests via email or phone.
 */

import { createLogger } from '@utils';
import { labelManager } from '@utils/labels';

import { loadCustomerDetails, saveCustomerDetails } from './CustomerStorage';
import TemplateEngine from './TemplateEngine';
// ConfirmationDialog is used via window.productEstimator.dialog or modalManager

const logger = createLogger('EstimateActions');

class EstimateActions {
  /**
   * Initialize the EstimateActions module
   * @param {object} config - Configuration options
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

    // Store reference to modalManager if provided
    this.modalManager = config.modalManager || null;

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
   * @returns {EstimateActions} This instance for chaining
   */
  init() {
    if (this.initialized) {
      console.log('[EstimateActions] Already initialized');
      return this;
    }

    // Bind event handlers
    this.bindEvents();

    this.initialized = true;
    console.log('[EstimateActions] PrintEstimate initialized with debug mode:', this.config.debug);
    console.log('[EstimateActions] Dialog availability at init:', window.productEstimator && window.productEstimator.dialog);
    return this;
  }

  /**
   * Bind events for printing estimates
   */
  bindEvents() {
    console.log('[EstimateActions] Binding events...');
    
    // Use event delegation for better performance and to handle dynamically added elements
    document.addEventListener('click', (e) => {
      // Handle print PDF buttons
      const printButton = e.target.closest(this.config.selectors.printButton);
      if (printButton && !this.processing) {
        console.log('[EstimateActions] Print button clicked');
        e.preventDefault(); // Prevent default link behavior

        // Set processing state to prevent double-clicks
        this.processing = true;
        this.setButtonLoading(printButton, true);

        if (printButton.classList.contains('print-estimate-pdf')) {
          // This is a direct PDF link - check customer details before proceeding
          const estimateId = printButton.dataset.estimateId;
          console.log('[EstimateActions] PDF link clicked, estimate ID:', estimateId);

          this.checkCustomerDetails(estimateId)
            .then(customerInfo => {
              // Check if name and email exist
              const missingFields = [];
              if (!customerInfo.name || customerInfo.name.trim() === '') missingFields.push('name');
              if (!customerInfo.email || customerInfo.email.trim() === '') missingFields.push('email');

              if (missingFields.length === 0) {
                // All required details exist, open the PDF URL
                const pdfUrl = printButton.getAttribute('href');

                if (pdfUrl && pdfUrl !== '#' && pdfUrl !== 'javascript:void(0)') {
                  window.open(pdfUrl, '_blank');
                } else {
                  // Get a fresh PDF URL
                  this.getSecurePdfUrl(estimateId)
                    .then(url => {
                      window.open(url, '_blank');
                    })
                    .catch(() => {
                      this.showError('Error generating PDF URL. Please try again.');
                    });
                }
              } else {
                // Missing details, show prompt
                this.showCustomerDetailsPrompt(estimateId, printButton, 'print');
              }
            })
            .catch(() => {
              this.showError('Error checking customer details. Please try again.');
            })
            .finally(() => {
              // Button state will be reset after PDF opens or error
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

      // Handle request contact from store button
      const requestContactButton = e.target.closest(this.config.selectors.requestContactButton);
      if (requestContactButton && !this.processing) {
        e.preventDefault();

        this.processing = true;
        this.setButtonLoading(requestContactButton, true);

        const estimateId = requestContactButton.dataset.estimateId;

        // Show contact method choice modal - similar to request copy but with different messaging
        this.showContactSelectionPrompt(estimateId, requestContactButton, 'request_contact');
      }
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

    console.log(`[EstimateActions] Print estimate requested for estimate ID: ${estimateId}`);

    // Check if customer has required details
    this.checkCustomerDetails(estimateId)
      .then(customerInfo => {
        // Check if name and email exist
        const missingFields = [];
        if (!customerInfo.name || customerInfo.name.trim() === '') missingFields.push('name');
        if (!customerInfo.email || customerInfo.email.trim() === '') missingFields.push('email');

        if (missingFields.length === 0) {
          // Customer has all required details, proceed with store and generate
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
          // Missing required details, show prompt
          this.showCustomerDetailsPrompt(estimateId, button, 'print');
          return Promise.reject(new Error('missing_customer_details'));
        }
      })
      .catch(error => {
        if (error.message !== 'missing_customer_details') {
          this.showError('Error generating PDF. Please try again.');
          this.setButtonLoading(button, false);
          this.processing = false;
        }
      });
  }

  /**
   * Show customer details prompt to collect missing information
   * @param {string} estimateId - The estimate ID
   * @param {HTMLElement} button - The button element
   * @param {string} action - The action type ('print', 'request_copy_email', 'request_copy_sms')
   */
  showCustomerDetailsPrompt(estimateId, button, action = 'print') {
    this.log('showCustomerDetailsPrompt called with:', { estimateId, action });
    
    // Required fields are determined in getMissingFields method
    // Field requirements by action type:
    // print: ['name', 'email']
    // request_copy_email: ['name', 'email']
    // request_copy_sms: ['name', 'phone']
    // request_contact_email: ['name', 'email']
    // request_contact_phone: ['name', 'phone']

    // First check which fields are already available in customer details
    this.checkCustomerDetails(estimateId)
      .then(customerInfo => {
        this.log('Customer info in showCustomerDetailsPrompt:', customerInfo);
        
        // Determine which fields are missing based on action type
        const missingFields = this.getMissingFields(customerInfo, action);
        this.log('Missing fields:', missingFields);

        if (missingFields.length === 0) {
          // No missing fields, proceed with the action
          this.continueWithAction(action, estimateId, button, customerInfo);
          return;
        }

        // Get the confirmation dialog instance from modalManager
        console.log('[EstimateActions] Looking for dialog...');
        
        let dialog = null;
        
        // First, try from modalManager reference (preferred)
        if (this.modalManager && this.modalManager.confirmationDialog) {
          dialog = this.modalManager.confirmationDialog;
          console.log('[EstimateActions] Found dialog via modalManager reference');
        }
        // Fallback to window.productEstimator.dialog
        else if (window.productEstimator && window.productEstimator.dialog) {
          dialog = window.productEstimator.dialog;
          console.log('[EstimateActions] Found dialog at window.productEstimator.dialog');
        }

        if (!dialog) {
          console.error('[EstimateActions] Dialog not available');
          console.log('[EstimateActions] Debug info:', {
            hasModalManager: !!this.modalManager,
            hasConfirmationDialog: this.modalManager && !!this.modalManager.confirmationDialog,
            hasGlobalDialog: window.productEstimator && !!window.productEstimator.dialog
          });
          this.showError('Unable to show dialog. Please refresh the page and try again.');
          this.setButtonLoading(button, false);
          this.processing = false;
          return;
        } else {
          console.log('[EstimateActions] Dialog found:', dialog);
        }

        // Create the form fields data
        const formFields = this.createFormFieldsData(missingFields, action, customerInfo);
        const instruction = this.getDialogInstruction(action, missingFields);
        
        // Show the dialog with form fields
        dialog.show({
          title: this.getDialogTitle(action),
          message: instruction,
          formFields: formFields,
          confirmText: labelManager.get('common_ui.general_actions.buttons.continue_button.label', 'Continue'),
          cancelText: labelManager.get('common_ui.general_actions.buttons.cancel_button.label', 'Cancel'),
          type: 'form',
          action: 'collect-details',
          showCancel: true,
          onConfirm: () => {
            console.log('[EstimateActions] Dialog onConfirm triggered');
            
            // Validate and collect form data
            const validationResult = this.validateAndCollectFormData(missingFields, customerInfo);
            console.log('[EstimateActions] Validation result:', validationResult);
            
            if (!validationResult.isValid) {
              // Show validation error
              const errorEl = document.querySelector('.pe-dialog-validation-error');
              if (errorEl) {
                errorEl.textContent = validationResult.errorMessage;
                errorEl.style.display = 'block';
              }
              console.log('[EstimateActions] Validation failed, keeping dialog open');
              return false; // Keep dialog open
            }
            
            // Save to localStorage
            saveCustomerDetails(validationResult.details);
            this.log('Customer details saved to localStorage:', validationResult.details);
            
            // Update server (async)
            this.updateCustomerDetails(estimateId, validationResult.details)
              .then(() => {
                this.setButtonLoading(button, true);
                this.processing = true;
                this.continueWithAction(action, estimateId, button, validationResult.details);
              })
              .catch(() => {
                this.showError('Error saving details. Please try again.');
              });
          },
          onCancel: () => {
            this.setButtonLoading(button, false);
            this.processing = false;
          }
        });
        
        // Add input focus after dialog is displayed
        setTimeout(() => {
          const firstInput = document.querySelector('.pe-dialog-body input');
          if (firstInput) {
            firstInput.focus();
          }
        }, 100);
      })
      .catch(error => {
        this.log('Error in showCustomerDetailsPrompt:', error);
        
        // Since we're only using localStorage, errors are very unlikely
        // but if they occur, we can still continue
        this.setButtonLoading(button, false);
        this.processing = false;
      });
  }

  /**
   * Create form fields data for the dialog
   * @param {Array} missingFields - List of missing field names
   * @param {string} action - The action type
   * @param {object} existingDetails - Existing customer details
   * @returns {Array} Array of field objects for the template
   */
  createFormFieldsData(missingFields, action, existingDetails = {}) {
    return missingFields.map(field => ({
      fieldName: field,
      fieldLabel: this.getFieldLabel(field),
      fieldValue: existingDetails[field] || '',
      fieldType: field === 'email' ? 'email' : (field === 'phone' ? 'tel' : 'text')
    }));
  }

  /**
   * Get dialog instruction based on action and missing fields
   * @param {string} action - The action type
   * @param {Array} missingFields - List of missing field names
   * @returns {string} Instruction text
   */
  getDialogInstruction(action, missingFields) {
    if (action === 'request_copy_email') {
      return labelManager.get('messages.email_required_for_copy', 'An email address is required to send your estimate copy.');
    } else if (action === 'request_copy_sms') {
      return labelManager.get('messages.phone_required_for_sms', 'A phone number is required to send your estimate via SMS.');
    } else if (action === 'request_contact_email') {
      return labelManager.get('messages.contact_email_details_required', 'Your details are required for our store to contact you via email.');
    } else if (action === 'request_contact_phone') {
      return labelManager.get('messages.contact_phone_details_required', 'Your details are required for our store to contact you via phone.');
    } else if (missingFields.includes('email') && !missingFields.includes('name')) {
      return labelManager.get('messages.email_required_for_estimate', 'An email address is required to view your estimate.');
    }
    
    return labelManager.get('messages.additional_information_required', 'Additional information is required to continue.');
  }

  /**
   * Validate and collect form data from dialog inputs
   * @param {Array} missingFields - List of field names to validate
   * @param {object} existingDetails - Existing customer details
   * @returns {object} Validation result with details and error message
   */
  validateAndCollectFormData(missingFields, existingDetails) {
    const updatedDetails = {...existingDetails};
    let isValid = true;
    let errorMessage = '';

    for (const field of missingFields) {
      const input = document.querySelector(`#customer-${field}-input`);
      const value = input ? input.value.trim() : '';

      if (!value) {
        errorMessage = `${this.getFieldLabel(field)} ${labelManager.get('messages.required_field', 'is required')}`;
        isValid = false;
        break;
      }

      // Special validation for email and phone
      if (field === 'email' && !this.validateEmail(value)) {
        errorMessage = labelManager.get('messages.invalid_email', 'Please enter a valid email address');
        isValid = false;
        break;
      }

      if (field === 'phone' && !this.validatePhone(value)) {
        errorMessage = labelManager.get('messages.invalid_phone', 'Please enter a valid phone number');
        isValid = false;
        break;
      }

      updatedDetails[field] = value;
    }

    return {
      isValid,
      errorMessage,
      details: updatedDetails
    };
  }

  /**
   * Get dialog title based on action
   * @param {string} action - The action type
   * @returns {string} Dialog title
   */
  getDialogTitle(action) {
    // Use label manager to get dialog titles with appropriate defaults
    const titles = {
      'print': labelManager.get('ui_elements.complete_details_title', 'Complete Your Details'),
      'request_copy_email': labelManager.get('ui_elements.email_details_required_title', 'Email Details Required'),
      'request_copy_sms': labelManager.get('ui_elements.phone_details_required_title', 'Phone Number Required'),
      'request_contact_email': labelManager.get('ui_elements.contact_information_required_title', 'Contact Information Required'),
      'request_contact_phone': labelManager.get('ui_elements.contact_information_required_title', 'Contact Information Required')
    };

    return titles[action] || labelManager.get('ui_elements.complete_details_title', 'Complete Your Details');
  }

  /**
   * Get a list of missing fields based on action type and customer info
   * @param {object} customerInfo - Customer details object
   * @param {string} action - The action type
   * @returns {Array} List of missing field names
   */
  getMissingFields(customerInfo, action) {
    const requiredFields = {
      'print': ['name', 'email'],
      'request_copy_email': ['name', 'email'],
      'request_copy_sms': ['name', 'phone'],
      'request_contact_email': ['name', 'email'],
      'request_contact_phone': ['name', 'phone']
    };

    // Determine which action type to use
    const fieldsToCheck = requiredFields[action] || requiredFields['print'];

    // Return fields that are missing or empty
    return fieldsToCheck.filter(field =>
      !customerInfo || !customerInfo[field] || customerInfo[field].trim() === ''
    );
  }

  /**
   * Get readable label for a field
   * @param {string} field - Field name
   * @returns {string} User-friendly field label
   */
  getFieldLabel(field) {
    const labels = {
      'name': labelManager.get('customer_details.customer_details_form.fields.customer_name_field.label', 'Full Name'),
      'email': labelManager.get('customer_details.customer_details_form.fields.customer_email_field.label', 'Email Address'),
      'phone': labelManager.get('customer_details.customer_details_form.fields.customer_phone_field.label', 'Phone Number')
    };

    return labels[field] || field.charAt(0).toUpperCase() + field.slice(1);
  }

  /**
   * Create HTML for the prompt modal with dynamic fields
   * @param {Array} missingFields - List of missing field names
   * @param {string} action - The action type
   * @param {object} existingDetails - Existing customer details
   * @returns {string} Modal HTML
   */
  createPromptModalHtml(missingFields, action, existingDetails = {}) {
    // Determine the title and instruction based on action and missing fields
    let title = 'Please Complete Your Details';
    let instruction = 'Additional information is required to continue.';

    if (action === 'request_copy_email') {
      instruction = 'An email address is required to send your estimate copy.';
    } else if (action === 'request_copy_sms') {
      instruction = 'A phone number is required to send your estimate via SMS.';
    } else if (action === 'request_contact_email') {
      instruction = 'Your details are required for our store to contact you via email.';
    } else if (action === 'request_contact_phone') {
      instruction = 'Your details are required for our store to contact you via phone.';
    } else if (missingFields.includes('email') && !missingFields.includes('name')) {
      instruction = 'An email address is required to view your estimate.';
    }

    // Start building the HTML
    let html = `
      <div class="email-prompt-overlay"></div>
      <div class="email-prompt-container">
        <div class="email-prompt-header">
          <h3>${title}</h3>
        </div>
        <div class="email-prompt-body">
          <p>${instruction}</p>
    `;

    // Add input fields for each missing field
    missingFields.forEach(field => {
      const fieldLabel = this.getFieldLabel(field);
      const fieldValue = existingDetails[field] || '';
      const fieldType = field === 'email' ? 'email' : (field === 'phone' ? 'tel' : 'text');

      html += `
        <div class="form-group">
          <label for="customer-${field}-input">${fieldLabel}:</label>
          <input type="${fieldType}" id="customer-${field}-input" value="${fieldValue}" required>
        </div>
      `;
    });

    // Add validation message area and buttons
    html += `
          <div class="email-validation-message"></div>
        </div>
        <div class="email-prompt-footer">
          <button type="button" class="button cancel-email-btn">Cancel</button>
          <button type="button" class="button submit-email-btn">Continue</button>
        </div>
      </div>
    `;

    return html;
  }

  /**
   * Validate email format
   * @param {string} email - Email address to validate
   * @returns {boolean} Whether the email is valid
   */
  validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  /**
   * Validate phone format (basic validation)
   * @param {string} phone - Phone number to validate
   * @returns {boolean} Whether the phone number is valid
   */
  validatePhone(phone) {
    // Allow digits, spaces, parens, plus, and dashes
    // At least 8 digits in total
    const phonePattern = /^[\d\s()+]{8,}$/;
    return phonePattern.test(phone);
  }

  /**
   * Continue with the original action after customer details are updated
   * @param {string} action - The action type
   * @param {string} estimateId - The estimate ID
   * @param {HTMLElement} button - The button element
   * @param {object} customerDetails - Updated customer details
   */
  continueWithAction(action, estimateId, button, customerDetails) {
    switch (action) {
      case 'print':
        this.handlePrintEstimate(button);
        break;
      case 'request_copy_email':
        this.requestCopyEstimate(estimateId, button)
          .then(() => {
            this.showMessage(
              `Estimate has been emailed to ${customerDetails.email}`,
              'success',
              () => {
                this.setButtonLoading(button, false);
                this.processing = false;
              }
            );
          })
          .catch(() => {
            this.showError('Error sending estimate copy. Please try again.');
            this.setButtonLoading(button, false);
            this.processing = false;
          });
        break;
      case 'request_copy_sms':
        // SMS functionality (coming soon)
        this.showMessage('SMS option coming soon.', 'success');
        this.setButtonLoading(button, false);
        this.processing = false;
        break;
      case 'request_contact_email':
        // Request contact via email
        this.requestStoreContact(estimateId, 'email', button, customerDetails);
        break;
      case 'request_contact_phone':
        // Request contact via phone
        this.requestStoreContact(estimateId, 'phone', button, customerDetails);
        break;
    }
  }

  /**
   * Show contact selection prompt (Email or SMS)
   * @param {string} estimateId - The estimate ID
   * @param {HTMLElement} button - The button element
   * @param {string} action - The action type
   */
  showContactSelectionPrompt(estimateId, button, action = 'request_copy') {
    // Customize title and prompt based on the action
    let title = labelManager.get('ui_elements.contact_method_estimate_title', 'How would you like to receive your estimate?');
    let prompt = labelManager.get('messages.contact_method_estimate_prompt', 'Please choose how you\'d prefer to receive your estimate:');
    let emailBtnText = labelManager.get('buttons.contact_email', 'Email');
    let phoneBtnText = labelManager.get('buttons.contact_phone', 'SMS');

    if (action === 'request_contact') {
      title = labelManager.get('ui_elements.contact_method_title', 'How would you like to be contacted?');
      prompt = labelManager.get('messages.contact_method_prompt', 'Please choose how you\'d prefer our store to contact you:');
      emailBtnText = labelManager.get('buttons.contact_email', 'Email');
      phoneBtnText = labelManager.get('buttons.contact_phone', 'Phone');
    }

    // Get the dialog instance
    let dialog = null;
    
    // Try to get dialog from modalManager reference (preferred)
    if (this.modalManager && this.modalManager.confirmationDialog) {
      dialog = this.modalManager.confirmationDialog;
    }
    // Fallback to window.productEstimator.dialog
    else if (window.productEstimator && window.productEstimator.dialog) {
      dialog = window.productEstimator.dialog;
    }

    if (!dialog) {
      this.showError('Dialog not available. Please refresh the page and try again.');
      this.setButtonLoading(button, false);
      this.processing = false;
      return;
    }

    // Show the dialog with contact selection type
    dialog.show({
      title: title,
      message: prompt,
      type: 'contact-selection',
      emailButtonText: emailBtnText,
      phoneButtonText: phoneBtnText,
      onEmailChoice: () => {
        // Determine the specific action for email
        const emailAction = action === 'request_contact' ? 'request_contact_email' : 'request_copy_email';

        // Check customer details
        this.checkCustomerDetails(estimateId)
          .then(customerInfo => {
            // Always check for name, plus email for email actions
            const missingFields = [];
            if (!customerInfo.name || customerInfo.name.trim() === '') missingFields.push('name');
            if (!customerInfo.email || customerInfo.email.trim() === '') missingFields.push('email');

            if (missingFields.length === 0) {
              // All required details exist, proceed with the action
              if (action === 'request_contact') {
                this.requestStoreContact(estimateId, 'email', button, customerInfo);
              } else {
                // Original request_copy email flow
                this.requestCopyEstimate(estimateId, button)
                  .then(() => {
                    this.showMessage(`Estimate has been emailed to ${customerInfo.email}`, 'success', () => {
                      this.setButtonLoading(button, false);
                      this.processing = false;
                    });
                  })
                  .catch(() => {
                    this.showError('Error sending estimate copy. Please try again.');
                    this.setButtonLoading(button, false);
                    this.processing = false;
                  });
              }
            } else {
              // Missing details, show prompt
              this.showCustomerDetailsPrompt(estimateId, button, emailAction);
            }
          })
          .catch(() => {
            this.showError('Error checking customer details. Please try again.');
            this.setButtonLoading(button, false);
            this.processing = false;
          });
      },
      onPhoneChoice: () => {
        // Determine the specific action for SMS/phone
        const smsAction = action === 'request_contact' ? 'request_contact_phone' : 'request_copy_sms';

        // Check customer details
        this.checkCustomerDetails(estimateId)
          .then(customerInfo => {
            // Always check for name, plus phone for SMS/phone actions
            const missingFields = [];
            if (!customerInfo.name || customerInfo.name.trim() === '') missingFields.push('name');
            if (!customerInfo.phone || customerInfo.phone.trim() === '') missingFields.push('phone');

            if (missingFields.length === 0) {
              // All required details exist, proceed with the action
              if (action === 'request_contact') {
                this.requestStoreContact(estimateId, 'phone', button, customerInfo);
              } else {
                // Original request_copy SMS flow (coming soon)
                this.showMessage('SMS option coming soon.', 'success');
                this.setButtonLoading(button, false);
                this.processing = false;
              }
            } else {
              // Missing details, show prompt
              this.showCustomerDetailsPrompt(estimateId, button, smsAction);
            }
          })
          .catch(() => {
            this.showError('Error checking customer details. Please try again.');
            this.setButtonLoading(button, false);
            this.processing = false;
          });
      },
      showCancel: true,
      onCancel: () => {
        this.setButtonLoading(button, false);
        this.processing = false;
      }
    });
  }

  /**
   * Request store contact for a customer
   * @param {string} estimateId - The estimate ID
   * @param {string} contactMethod - Contact method ('email' or 'phone')
   * @param {HTMLElement} button - The button element
   * @param {object} customerDetails - Customer details
   */
  requestStoreContact(estimateId, contactMethod, button, customerDetails) {
    // First store the estimate to ensure it's in the database
    this.storeEstimate(estimateId)
      .then(data => {
        if (!data || !data.estimate_id) {
          throw new Error('Failed to store estimate');
        }

        // Prepare data for the server-side request
        const requestData = {
          action: 'request_store_contact',
          nonce: productEstimatorVars.nonce,
          estimate_id: estimateId,
          contact_method: contactMethod,
          customer_details: JSON.stringify(customerDetails)
        };

        this.log('Sending store contact request with data:', requestData);

        // Make the AJAX request to send the email
        return fetch(productEstimatorVars.ajax_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams(requestData)
        });
      })
      .then(response => response.json())
      .then(response => {
        if (response.success) {
          this.log('Store contact request successful:', response.data);

          // Show success message based on contact method
          let message = '';
          if (contactMethod === 'email') {
            message = `Your request has been sent. Our store will contact you at ${customerDetails.email} shortly.`;
          } else {
            message = `Your request has been sent. Our store will call you at ${customerDetails.phone} shortly.`;
          }

          this.showMessage(message, 'success');
        } else {
          this.log('Store contact request failed:', response.data);
          this.showError(response.data?.message || 'Error sending contact request. Please try again.');
        }
      })
      .catch(error => {
        this.log('Error in requestStoreContact:', error);
        this.showError('Error sending contact request. Please try again.');
      })
      .finally(() => {
        this.setButtonLoading(button, false);
        this.processing = false;
      });
  }

  /**
   * Check customer details for a specific estimate
   * Only checks localStorage as per new requirement
   * @param {string} estimateId - The estimate ID
   * @returns {Promise<object>} Customer details object
   */
  checkCustomerDetails(estimateId) {
    return new Promise((resolve, _reject) => {
      // Only check localStorage for customer details
      const storedDetails = loadCustomerDetails();
      
      if (storedDetails && Object.keys(storedDetails).length > 0) {
        console.log('[EstimateActions] Customer details found in localStorage:', storedDetails);
        resolve(storedDetails);
      } else {
        console.log('[EstimateActions] No customer details in localStorage, returning empty object');
        resolve({});
      }
    });
  }

  /**
   * Update customer details with multiple fields
   * This version saves to localStorage and dispatches an event to update all forms
   * @param {string} estimateId - The estimate ID
   * @param {object} details - Updated customer details
   * @returns {Promise<object>} Promise that resolves when details are updated
   */
  updateCustomerDetails(estimateId, details) {
    return new Promise((resolve, reject) => {
      // Make sure we have the minimum required fields
      if (!details.postcode) {
        details.postcode = '0000'; // Default postcode if not set
      }
      
      // Save to localStorage immediately
      saveCustomerDetails(details);
      this.log('Customer details saved to localStorage from updateCustomerDetails:', details);

      // Dispatch an event to notify other components of updated details
      const event = new CustomEvent('customer_details_updated', {
        bubbles: true,
        detail: {
          details: details
        }
      });
      document.dispatchEvent(event);

      // Now store the estimate to the database, passing ONLY the estimate_id
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
            resolve(response.data);
          } else {
            logger.error('Error storing estimate:', response);
            throw new Error(response.data?.message || 'Error storing estimate');
          }
        })
        .catch(error => {
          logger.error('Error in updateCustomerDetails:', error);
          reject(error);
        });
    });
  }

  /**
   * Store the estimate in the database
   * @param {string} estimateId - The estimate ID
   * @returns {Promise<object>} Promise that resolves when estimate is stored
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
   * @param {HTMLElement} _button - The button element
   * @returns {Promise<object>} Promise that resolves when email is sent
   */
  requestCopyEstimate(estimateId, _button) {
    return this.checkCustomerDetails(estimateId)
      .then(customerInfo => {
        if (!customerInfo.email) {
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

    if (isLoading) {
      // Store original HTML content if not already stored
      if (!button.dataset.originalHtml) {
        button.dataset.originalHtml = button.innerHTML;
      }

      button.classList.add('loading');
      button.innerHTML = '<span class="loading-dots">Processing...</span>';
      button.disabled = true;
    } else {
      button.classList.remove('loading');
      // Restore original HTML (includes icons)
      if (button.dataset.originalHtml) {
        button.innerHTML = button.dataset.originalHtml;
      } else {
        // Fallback to text content if HTML was not stored
        button.textContent = button.dataset.originalText || button.textContent;
      }
      button.disabled = false;
    }
  }

  /**
   * Show success or error message
   * @param {string} message - Message text
   * @param {string} _type - Message type ('success' or 'error')
   * @param {Function} onConfirm - Callback when confirmed
   */
  showMessage(message, _type = 'success', onConfirm = null) {
    if (window.productEstimator && window.productEstimator.dialog) {
      window.productEstimator.dialog.show({
        title: labelManager.get('ui_elements.success_title', 'Success'),
        message: message,
        type: 'estimate',
        action: 'confirm',
        confirmText: labelManager.get('common_ui.general_actions.buttons.ok_button.label', 'OK'),
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
      logger.log(...args);
    }
  }
}

// Export the class
export default EstimateActions;
