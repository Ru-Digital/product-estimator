/**
 * CustomerDetailsManager.js
 *
 * Module for handling customer details editing and deletion in the Product Estimator.
 * Follows the ES6 module architecture used in the project.
 */

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
      i18n: window.productEstimatorVars?.i18n || {}
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

    this.initialized = true;
    this.log('CustomerDetailsManager initialized');
    return this;
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

    this.log('Customer details events bound');
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
  // In CustomerDetailsManager.js, modify the handleSaveClick method:

  handleSaveClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const saveButton = e.target;
    const originalText = saveButton.textContent;

    // Show loading state
    saveButton.textContent = this.config.i18n.saving || 'Saving...';
    saveButton.disabled = true;

    // Get updated details
    const updatedDetails = {
      name: document.getElementById('edit-customer-name')?.value || '',
      email: document.getElementById('edit-customer-email')?.value || '',
      phone: document.getElementById('edit-customer-phone')?.value || '',
      postcode: document.getElementById('edit-customer-postcode')?.value || ''
    };

    // Use the dataService to make the AJAX request - pass the details object properly
    this.dataService.request('update_customer_details', {
      details: JSON.stringify(updatedDetails) // Stringify the details object
    })
      .then(data => {
        // Rest of the function remains the same
      })
      .catch(error => {
        // Error handling
      })
      .finally(() => {
        // Reset button state
      });
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
        title: this.config.i18n.delete_customer_details || 'Delete Customer Details',
        message: this.config.i18n.confirm_delete_details || 'Are you sure you want to delete your saved details?',
        confirmText: this.config.i18n.delete || 'Delete',
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
   * Delete customer details via AJAX
   */
  deleteCustomerDetails() {
    // Get the customer details confirmation container
    const confirmationContainer = document.querySelector('.customer-details-confirmation');
    if (confirmationContainer) {
      confirmationContainer.classList.add('loading');
    }

    // Use the dataService to make the AJAX request
    this.dataService.request('delete_customer_details')
      .then(data => {
        // Replace the details container with the new form
        if (confirmationContainer && data.html) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = data.html;
          confirmationContainer.parentNode.replaceChild(tempDiv.firstElementChild, confirmationContainer);
        }

        // Show success message
        this.showMessage('success', data.message || 'Details deleted successfully!');

        this.log('Customer details deleted');
      })
      .catch(error => {
        this.showMessage('error', error.message || 'Error deleting details!');
        this.log('Error deleting details:', error);

        // Remove loading class
        if (confirmationContainer) {
          confirmationContainer.classList.remove('loading');
        }
      });
  }

  /**
   * Update the displayed customer details in the DOM
   * @param {Object} details - The updated details
   */
  updateDisplayedDetails(details) {
    const detailsContainer = document.querySelector(this.config.selectors.detailsContainer);
    if (!detailsContainer) return;

    // Build HTML
    let detailsHtml = `<p><strong>${details.name}</strong><br>
      ${details.email}<br>`;

    if (details.phone) {
      detailsHtml += `${details.phone}<br>`;
    }

    detailsHtml += `${details.postcode}</p>`;

    // Update container
    detailsContainer.innerHTML = detailsHtml;
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
