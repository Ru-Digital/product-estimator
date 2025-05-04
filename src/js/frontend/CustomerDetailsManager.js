/**
 * CustomerDetailsManager.js
 *
 * Module for handling customer details editing and deletion in the Product Estimator.
 * Follows the ES6 module architecture used in the project.
 */

import { saveCustomerDetails, clearCustomerDetails } from './CustomerStorage'; // Import the new functions
import DataService from "./DataService";

class CustomerDetailsManager {
  /**
   * Initialize the CustomerDetailsManager
   * @param {Object} config - Configuration options
   * @param {DataService} dataService - The data service instance
   */
  constructor(config = {}, dataService) {
    // Default configuration
    this.config = Object.assign({
      debug: false,
      selectors: {
        editButton: '#edit-customer-details-btn',
        deleteButton: '#delete-customer-details-btn',
        saveButton: '#save-customer-details-btn',
        cancelButton: '#cancel-edit-customer-details-btn',
        detailsContainer: '.saved-customer-details',
        detailsHeader: '.customer-details-header',
        editForm: '.customer-details-edit-form',
        formContainer: '.product-estimator-modal-form-container'
      },
      i18n: {}
    }, config);


    // Store reference to data service
    this.dataService = dataService;

    // State
    this.initialized = false;
    this.eventHandlers = {};

    // Initialize if config says so
    if (config.autoInit !== false) {
      this.init();
    }
  }

  /**
   * Initialize the manager
   * @returns {CustomerDetailsManager} This instance for chaining
   */
  init() {
    if (this.initialized) {
      this.log('CustomerDetailsManager already initialized');
      return this;
    }

    // Bind events
    this.bindEvents();

    // Add a custom event listener for customer details updates from other sources
    document.addEventListener('customer_details_updated', this.onCustomerDetailsUpdated.bind(this));

    this.initialized = true;
    this.log('CustomerDetailsManager initialized');
    return this;
  }

  /**
   * Handle customer details updated event from other sources
   * @param {CustomEvent} event - The custom event with updated details
   */
  onCustomerDetailsUpdated(event) {
    if (event.detail && event.detail.details) {
      this.log('Received customer_details_updated event', event.detail);
      // Update the display with the new details
      this.updateDisplayedDetails(event.detail.details);

      // Check if email was added and update forms
      this.checkAndUpdateEmailField(event.detail.details);
    }
  }

  /**
   * Check if email was added and update the form accordingly
   * @param {Object} details - The updated customer details
   */
  checkAndUpdateEmailField(details) {
    const hasEmail = details && details.email && details.email.trim() !== '';
    this.log(`Checking for email field updates: hasEmail=${hasEmail}`);

    // If the edit form is already visible, update it
    const editForms = document.querySelectorAll(this.config.selectors.editForm);
    editForms.forEach(editForm => {
      // Check if email field already exists
      let emailField = editForm.querySelector('#edit-customer-email');

      // If email field doesn't exist but we have an email, add it
      if (!emailField && hasEmail) {
        this.log('Adding email field to edit form');

        // Create the email field group
        const emailGroup = document.createElement('div');
        emailGroup.className = 'form-group';

        // Create the label
        const emailLabel = document.createElement('label');
        emailLabel.setAttribute('for', 'edit-customer-email');
        emailLabel.textContent = 'Email Address';

        // Create the input
        emailField = document.createElement('input');
        emailField.type = 'email';
        emailField.id = 'edit-customer-email';
        emailField.name = 'edit_customer_email';
        emailField.value = details.email;

        // Add elements to the DOM
        emailGroup.appendChild(emailLabel);
        emailGroup.appendChild(emailField);

        // Find position to insert (after name field, before phone if exists)
        const nameField = editForm.querySelector('#edit-customer-name');
        if (nameField) {
          const nameGroup = nameField.closest('.form-group');
          if (nameGroup) {
            nameGroup.parentNode.insertBefore(emailGroup, nameGroup.nextSibling);
          } else {
            // Just append if we can't find the right position
            editForm.querySelector('h4').after(emailGroup);
          }
        }
      } else if (emailField && hasEmail) {
        // If field exists, ensure value is up to date
        emailField.value = details.email;
      }

      // Update other fields if they exist
      const nameField = editForm.querySelector('#edit-customer-name');
      if (nameField && details.name) {
        nameField.value = details.name;
      }

      const phoneField = editForm.querySelector('#edit-customer-phone');
      if (phoneField && details.phone) {
        phoneField.value = details.phone;
      }

      const postcodeField = editForm.querySelector('#edit-customer-postcode');
      if (postcodeField && details.postcode) {
        postcodeField.value = details.postcode;
      }
    });

    // Update data-has-email attribute on any new estimate forms
    const newEstimateForms = document.querySelectorAll('#new-estimate-form');
    newEstimateForms.forEach(form => {
      form.setAttribute('data-has-email', hasEmail ? 'true' : 'false');
    });
  }
  /**
   * Bind events for customer details management
   */
  bindEvents() {
    // Find the buttons
    const editButton = document.querySelector(this.config.selectors.editButton);
    const deleteButton = document.querySelector(this.config.selectors.deleteButton);
    const saveButton = document.querySelector(this.config.selectors.saveButton);
    const cancelButton = document.querySelector(this.config.selectors.cancelButton);

    // Only proceed if we have the necessary elements
    if (!editButton) {
      this.log('Edit button not found, skipping event binding');
      return;
    }

    // Edit button - show edit form
    this.bindButtonWithHandler(editButton, 'click', this.handleEditClick.bind(this));

    // Delete button - confirm then delete
    if (deleteButton) {
      this.bindButtonWithHandler(deleteButton, 'click', this.handleDeleteClick.bind(this));
    }

    // Save button - save updated details
    if (saveButton) {
      this.bindButtonWithHandler(saveButton, 'click', this.handleSaveClick.bind(this));
    }

    // Cancel button - hide edit form
    if (cancelButton) {
      this.bindButtonWithHandler(cancelButton, 'click', this.handleCancelClick.bind(this));
    }

    // this.log('Customer details events bound');
  }

  /**
   * Helper to safely bind event with removal of previous handlers
   * @param {HTMLElement} element - Element to bind to
   * @param {string} eventType - Event type to bind
   * @param {Function} handler - Event handler
   */
  bindButtonWithHandler(element, eventType, handler) {
    if (!element) return;

    // Store handler reference on element for later removal
    const handlerKey = `_${eventType}Handler`;

    // Remove existing handler if it exists
    if (element[handlerKey]) {
      element.removeEventListener(eventType, element[handlerKey]);
    }

    // Store new handler reference
    element[handlerKey] = handler;

    // Add the event listener
    element.addEventListener(eventType, handler);
  }

  /**
   * Handle edit button click
   * @param {Event} e - Click event
   */
  handleEditClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const detailsContainer = document.querySelector(this.config.selectors.detailsContainer);
    const detailsHeader = document.querySelector(this.config.selectors.detailsHeader);
    const editForm = document.querySelector(this.config.selectors.editForm);

    if (detailsContainer) detailsContainer.style.display = 'none';
    if (detailsHeader) detailsHeader.style.display = 'none';
    if (editForm) editForm.style.display = 'block';

    this.log('Edit form displayed');
  }

  /**
   * Handle cancel button click
   * @param {Event} e - Click event
   */
  handleCancelClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const detailsContainer = document.querySelector(this.config.selectors.detailsContainer);
    const detailsHeader = document.querySelector(this.config.selectors.detailsHeader);
    const editForm = document.querySelector(this.config.selectors.editForm);

    if (editForm) editForm.style.display = 'none';
    if (detailsContainer) detailsContainer.style.display = 'block';
    if (detailsHeader) detailsHeader.style.display = 'flex';

    this.log('Edit form hidden');
  }

  /**
   * Handle save button click
   * @param {Event} e - Click event
   */
  handleSaveClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const saveButton = e.target;
    const originalText = saveButton.textContent;

    // Show loading state
    saveButton.textContent = (this.config.i18n && this.config.i18n.saving) || 'Saving...';
    saveButton.disabled = true;

    // Get updated details - collect all available fields
    const updatedDetails = {
      name: document.getElementById('edit-customer-name')?.value || '',
      postcode: document.getElementById('edit-customer-postcode')?.value || ''
    };

    // Add email and phone if they exist in the form
    const emailField = document.getElementById('edit-customer-email');
    if (emailField) {
      updatedDetails.email = emailField.value || '';
    }

    const phoneField = document.getElementById('edit-customer-phone');
    if (phoneField) {
      updatedDetails.phone = phoneField.value || '';
    }

    // Use the imported saveCustomerDetails function
    try {
      saveCustomerDetails(updatedDetails); // Use the imported function
      this.log('Customer details saved to localStorage:', updatedDetails);

      // 2. Now, send the update to the server asynchronously using DataService
      this.dataService.request('update_customer_details', {
        details: JSON.stringify(updatedDetails)
      })
        .then(data => {
          // Handle successful server update
          this.log('Customer details updated on server successfully:', data);
          this.handleSaveSuccess(data, updatedDetails); // Call success handler with server response data and updated details
        })
        .catch(error => {
          // Handle server update error
          this.handleSaveError(error); // Show error message
          // Note: Details are already saved locally, so we don't revert local storage on server error.
        })
        .finally(() => {
          // This block runs after both success or error of the AJAX request
          saveButton.textContent = originalText;
          saveButton.disabled = false;
        });

    } catch (localStorageError) {
      // Handle synchronous local storage save error
      this.log('Error saving to localStorage using imported function:', localStorageError);
      this.showError('Could not save details locally.'); // Show local storage error
      // We still attempt server save even if local save fails
      this.dataService.request('update_customer_details', {
        details: JSON.stringify(updatedDetails)
      })
        .then(data => {
          // Handle successful server update even after local failure
          this.log('Customer details updated on server successfully (after local storage error):', data);
          this.handleSaveSuccess(data, updatedDetails); // Call success handler
        })
        .catch(error => {
          // Handle server update error after local failure
          this.handleSaveError(error); // Show server error message
        })
        .finally(() => {
          // This block runs after both success or error of the AJAX request
          saveButton.textContent = originalText;
          saveButton.disabled = false;
        });
    }

  }

  /**
   * Handle successful save response
   * @param {Object} data - Response data
   * @param {Object} updatedDetails - The details that were updated
   */
  handleSaveSuccess(data, updatedDetails) {
    // Update the displayed customer details
    this.updateDisplayedDetails(updatedDetails);  // Use the passed updatedDetails

    // Check if email was added and update forms
    this.checkAndUpdateEmailField(updatedDetails); // Use updatedDetails

    // Show success message
    this.showMessage('success', data.message || 'Details updated successfully!');

    // Hide edit form, show details view
    const detailsContainer = document.querySelector(this.config.selectors.detailsContainer);
    const detailsHeader = document.querySelector(this.config.selectors.detailsHeader);
    const editForm = document.querySelector(this.config.selectors.editForm);

    if (editForm) editForm.style.display = 'none';
    if (detailsContainer) detailsContainer.style.display = 'block';
    if (detailsHeader) detailsHeader.style.display = 'flex';

    // Dispatch event to notify other components of the update
    const event = new CustomEvent('customer_details_updated', {
      bubbles: true,
      detail: {
        details: updatedDetails // Use updatedDetails
      }
    });
    document.dispatchEvent(event);

    this.log('Customer details updated successfully', data);
  }

  /**
   * Handle save error
   * @param {Error} error - The error that occurred
   */
  handleSaveError(error) {
    this.showMessage('error', error.message || 'Error updating details. Please try again.');
    this.log('Error saving customer details:', error);
  }

  /**
   * Handle delete button click
   * @param {Event} e - Click event
   */
  handleDeleteClick(e) {
    e.preventDefault();
    e.stopPropagation();

    // Use the confirmation dialog if available
    if (window.productEstimator && window.productEstimator.dialog) {
      window.productEstimator.dialog.show({
        title: (this.config.i18n && this.config.i18n.delete_customer_details) || 'Delete Customer Details',
        message: (this.config.i18n && this.config.i18n.confirm_delete_details) || 'Are you sure you want to delete your saved details?',
        confirmText: (this.config.i18n && this.config.i18n.delete) || 'Delete',
        action: 'delete',
        cancelText: this.config.i18n.cancel || 'Cancel',
        onConfirm: () => {
          this.deleteCustomerDetails();
        }
      });
    } else {
      // Fallback to regular confirm
      if (confirm(this.config.i18n.confirm_delete_details || 'Are you sure you want to delete your saved details?')) {
        this.deleteCustomerDetails();
      }
    }
  }

  /**
   * Delete customer details
   */
  deleteCustomerDetails() {
    // Get the customer details confirmation container
    const confirmationContainer = document.querySelector('.customer-details-confirmation');
    if (confirmationContainer) {
      confirmationContainer.classList.add('loading');
    }

    // Use the imported clearCustomerDetails function
    try {
      clearCustomerDetails(); // Clear using imported function
      this.log('Customer details removed from localStorage using imported function'); // Log the success
      this.handleDeleteSuccess({message: "Details deleted successfully from local storage"}, confirmationContainer);
    } catch (e) {
      this.log('localStorage error on delete using imported function', e); // Log any error
    }


    // Use the dataService to make the AJAX request if available
    if (this.dataService && typeof this.dataService.request === 'function') {
      this.dataService.request('delete_customer_details')
        .then(data => {
          this.handleDeleteSuccess(data, confirmationContainer);
        })
        .catch(error => {
          this.handleDeleteError(error, confirmationContainer);
        });
    } else {
      // Fallback to direct fetch
      fetch(window.productEstimatorVars?.ajax_url || '/wp-admin/admin-ajax.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          action: 'delete_customer_details',
          nonce: window.productEstimatorVars?.nonce || ''
        })
      })
        .then(response => response.json())
        .then(response => {
          if (response.success) {
            this.handleDeleteSuccess(response.data, confirmationContainer);
          } else {
            this.handleDeleteError(
              new Error(response.data?.message || 'Error deleting details'),
              confirmationContainer
            );
          }
        })
        .catch(error => {
          this.handleDeleteError(error, confirmationContainer);
        });
    }
  }

  /**
   * Handle successful delete response
   * @param {Object} data - Response data
   * @param {HTMLElement} confirmationContainer - The container element
   */
  handleDeleteSuccess(data, confirmationContainer) {
    // Replace the details container with the new form
    if (confirmationContainer && data.html) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = data.html;
      confirmationContainer.parentNode.replaceChild(tempDiv.firstElementChild, confirmationContainer);
    }

    // Show success message
    this.showMessage('success', data.message || 'Details deleted successfully!');

    // Update data-has-email attribute on the main form
    const newEstimateForm = document.querySelector('#new-estimate-form');
    if (newEstimateForm) {
      newEstimateForm.setAttribute('data-has-email', 'false');
    }

    // Dispatch event to notify other components
    const event = new CustomEvent('customer_details_deleted', {
      bubbles: true
    });
    document.dispatchEvent(event);

    this.log('Customer details deleted');
  }

  /**
   * Handle delete error
   * @param {Error} error - The error that occurred
   * @param {HTMLElement} confirmationContainer - The container element
   */
  handleDeleteError(error, confirmationContainer) {
    this.showMessage('error', error.message || 'Error deleting details!');
    this.log('Error deleting details:', error);

    // Remove loading class
    if (confirmationContainer) {
      confirmationContainer.classList.remove('loading');
    }
  }

  /**
   * Update the displayed customer details in the DOM
   * @param {Object} details - The updated details
   */
  updateDisplayedDetails(details) {
    const detailsContainers = document.querySelectorAll(this.config.selectors.detailsContainer);

    if (!detailsContainers.length) {
      this.log('No customer details containers found for updating');
      return;
    }

    this.log(`Updating ${detailsContainers.length} customer details containers`);

    detailsContainers.forEach(container => {
      // Build HTML with new details
      let detailsHtml = '<p>';

      if (details.name && details.name.trim() !== '') {
        detailsHtml += `<strong>${details.name}</strong><br>`;
      }

      if (details.email && details.email.trim() !== '') {
        detailsHtml += `${details.email}<br>`;
      }

      if (details.phone && details.phone.trim() !== '') {
        detailsHtml += `${details.phone}<br>`;
      }

      detailsHtml += details.postcode || '';
      detailsHtml += '</p>';

      // Update container
      container.innerHTML = detailsHtml;
    });
  }

  /**
   * Show a message to the user
   * @param {string} type - Message type ('success' or 'error')
   * @param {string} message - The message to display
   */
  showMessage(type, message) {
    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.modal-message');
    existingMessages.forEach(msg => msg.remove());

    // Create message element
    const messageClass = type === 'error' ? 'modal-error-message' : 'modal-success-message';
    const messageEl = document.createElement('div');
    messageEl.className = `modal-message ${messageClass}`;
    messageEl.textContent = message;

    // Add to form container
    const formContainer = document.querySelector(this.config.selectors.formContainer);
    if (formContainer) {
      formContainer.prepend(messageEl);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        messageEl.remove();
      }, 5000);
    }
  }

  /**
   * Log debug messages
   * @param {...any} args - Arguments to log
   */
  log(...args) {
    if (this.config.debug) {
      console.log('[CustomerDetailsManager]', ...args);
    }
  }
}

export default CustomerDetailsManager;
