/**
 * FormManager.js
 *
 * Handles all operations related to forms:
 * - Binding form events
 * - Form submission handling
 * - Form validation
 * - Form cancellation
 */

import { format, createLogger, showSuccessDialog, showWarningDialog, showErrorDialog } from '@utils';

import { loadEstimateData, saveEstimateData } from '../EstimateStorage';
import TemplateEngine from '../TemplateEngine';

const logger = createLogger('FormManager');

class FormManager {
  /**
   * Initialize the FormManager
   * @param {object} config - Configuration options
   * @param {object} dataService - The data service instance
   * @param {object} modalManager - Reference to the parent modal manager
   */
  constructor(config = {}, dataService, modalManager) {
    this.config = config;
    this.dataService = dataService;
    this.modalManager = modalManager;

    // State
    this.currentForm = null;

    // Bind methods to preserve 'this' context
    this.bindNewEstimateFormEvents = this.bindNewEstimateFormEvents.bind(this);
    this.bindNewRoomFormEvents = this.bindNewRoomFormEvents.bind(this);
    this.loadEstimateSelectionForm = this.loadEstimateSelectionForm.bind(this);
    this.cancelForm = this.cancelForm.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.showError = this.showError.bind(this);
    this.clearErrors = this.clearErrors.bind(this);
    this.onModalClosed = this.onModalClosed.bind(this);
  }

  /**
   * Initialize the form manager
   */
  init() {
    logger.log('FormManager initialized');
  }

  /**
   * Bind events to the new estimate form
   * @param {HTMLElement} formElement - The form element
   * @param {string|null} productId - Optional product ID
   */
  bindNewEstimateFormEvents(formElement, productId = null) {
    logger.log('Binding events to new estimate form', { productId });

    if (!formElement) {
      logger.error('Form element not available for binding events');
      return;
    }

    // Store current form reference
    this.currentForm = formElement;

    // Store product ID as a data attribute on the form if provided
    if (productId) {
      formElement.dataset.productId = productId;
    } else {
      delete formElement.dataset.productId;
    }

    // Remove any existing event listeners to prevent duplicates
    if (formElement._submitHandler) {
      formElement.removeEventListener('submit', formElement._submitHandler);
    }

    // Create new submit handler
    formElement._submitHandler = (e) => {
      e.preventDefault();

      // Clear any previous errors
      this.clearErrors(formElement);

      // Validate the form
      if (!this.validateForm(formElement)) {
        logger.log('Form validation failed - stopping form submission');
        e.stopPropagation(); // Ensure event doesn't propagate
        return false; // Explicit false return to stop submission
      }

      // Show loading
      if (this.modalManager) {
        this.modalManager.showLoading();
      }

      // Get form data
      const formData = new FormData(formElement);
      const estimateName = formData.get('estimate_name');
      const postcode = formData.get('customer_postcode');

      // Check if we need to update customer data with postcode
      const customerDetailsManager = window.productEstimator?.core?.customerDetailsManager;
      if (customerDetailsManager && postcode && postcode.trim() !== '') {
        // Update postcode in customer details if it's new or different
        customerDetailsManager.updatePostcodeIfNew(postcode);
      }

      // Create the estimate
      const estimateData = {
        estimate_name: estimateName
      };
      
      // Include postcode if available
      if (postcode) {
        estimateData.customer_postcode = postcode;
      }
      
      this.dataService.addNewEstimate(estimateData)
        .then(newEstimate => {
          logger.log('Estimate created successfully:', newEstimate);

          // If a product ID is provided, we need to add it to a room
          if (productId) {
            const estimateId = newEstimate.estimate_id;

            if (!estimateId) {
              logger.error('No estimate ID returned from server. Cannot create room.');
              this.modalManager.hideLoading();
              this.showPartialSuccessMessage('Estimate created successfully, but there was an error adding a room.');
              return;
            }

            // Show room creation form for the new estimate
            if (this.modalManager && this.modalManager.roomManager) {
              logger.log('Transitioning to new room form with estimate ID:', estimateId);
              this.modalManager.roomManager.showNewRoomForm(estimateId, productId);
            } else {
              logger.error('RoomManager not available for showNewRoomForm');
              // Hide loading and show success message
              if (this.modalManager) {
                this.modalManager.hideLoading();
              }

              this.showSuccessMessage('Estimate created successfully.');
            }
          } else {
            // No product ID, just show the estimates list
            const estimateId = newEstimate.estimate_id;

            if (!estimateId) {
              logger.error('No estimate ID returned from server. Cannot show estimate.');
              this.modalManager.hideLoading();
              this.showSuccessMessage('Estimate created successfully.');
              return;
            }

            if (this.modalManager && this.modalManager.estimateManager) {
              logger.log('Transitioning to estimates list with estimate ID:', estimateId);
              this.modalManager.estimateManager.showEstimatesList(null, estimateId);
            } else {
              // Hide loading and show success message
              if (this.modalManager) {
                this.modalManager.hideLoading();
              }

              this.showSuccessMessage('Estimate created successfully.');
            }
          }
        })
        .catch(error => {
          logger.error('Error creating estimate:', error);

          // Show error
          this.showError(formElement, 'Error creating estimate. Please try again.');

          // Hide loading
          if (this.modalManager) {
            this.modalManager.hideLoading();
          }
        });
    };

    // Add the submit handler
    formElement.addEventListener('submit', formElement._submitHandler);

    // Bind cancel button (using the class in the template: cancel-btn)
    const cancelButton = formElement.querySelector('.cancel-btn, .cancel-button');
    if (cancelButton) {
      if (cancelButton._clickHandler) {
        cancelButton.removeEventListener('click', cancelButton._clickHandler);
      }

      cancelButton._clickHandler = (e) => {
        e.preventDefault();
        logger.log('Cancel button clicked in new estimate form');
        this.cancelForm('estimate');
      };

      cancelButton.addEventListener('click', cancelButton._clickHandler);
      logger.log('Cancel button handler attached to new estimate form');
    } else {
      logger.log('Cancel button not found in new estimate form');
      logger.log('Form element structure:', formElement.innerHTML);
    }
  }

  /**
   * Bind events to the new room form
   * @param {HTMLElement} formElement - The form element
   * @param {string} estimateId - The estimate ID
   * @param {string|null} productId - Optional product ID
   */
  bindNewRoomFormEvents(formElement, estimateId, productId = null) {
    logger.log('Binding events to new room form', { estimateId, productId });

    if (!formElement) {
      logger.error('Form element not available for binding events');
      return;
    }

    // Store current form reference
    this.currentForm = formElement;

    // Store estimate ID and product ID as data attributes on the form
    formElement.dataset.estimateId = estimateId;

    if (productId) {
      formElement.dataset.productId = productId;
    } else {
      delete formElement.dataset.productId;
    }

    // Remove any existing event listeners to prevent duplicates
    if (formElement._submitHandler) {
      formElement.removeEventListener('submit', formElement._submitHandler);
    }

    // Create new submit handler
    formElement._submitHandler = (e) => {
      e.preventDefault();

      // Clear any previous errors
      this.clearErrors(formElement);

      // Validate the form
      if (!this.validateForm(formElement)) {
        logger.log('Form validation failed - stopping form submission');
        e.stopPropagation(); // Ensure event doesn't propagate
        return false; // Explicit false return to stop submission
      }

      // Show loading
      if (this.modalManager) {
        this.modalManager.showLoading();
      }

      // Get form data
      const formData = new FormData(formElement);
      const roomName = formData.get('room_name');
      const roomWidth = formData.get('room_width');
      const roomLength = formData.get('room_length');

      // Get the estimate ID from the form's dataset
      const formEstimateId = formElement.dataset.estimateId;

      if (!formEstimateId) {
        this.showError(formElement, 'No estimate ID found. Please try again.');
        this.modalManager.hideLoading();
        return;
      }

      // Retrieve the product ID from the form's dataset
      const formProductId = formElement.dataset.productId;

      // Create the room
      this.dataService.addNewRoom({
        room_name: roomName,
        room_width: roomWidth,
        room_length: roomLength
      }, formEstimateId, formProductId)
        .then(newRoom => {
          logger.log('Room created successfully:', newRoom);

          // Check if the server already added the product (the PHP handler might do this)
          const serverAddedProduct = newRoom.product_added === true;
          
          // If a product ID is provided and server didn't already add it
          if (formProductId && !serverAddedProduct) {
            // Delegate to the ProductManager to add product to the new room
            if (this.modalManager && this.modalManager.productManager) {
              this.modalManager.productManager.addProductToRoom(formEstimateId, newRoom.room_id, formProductId)
                .then(() => {
                  // Hide loading
                  if (this.modalManager) {
                    this.modalManager.hideLoading();
                  }

                  // If we have the estimate manager, we can directly show the estimates list
                  // with the newly created room expanded, rather than showing a success message
                  if (this.modalManager && this.modalManager.estimateManager) {
                    logger.log('Product added to room successfully, showing estimates list with new room expanded');
                    this.modalManager.estimateManager.showEstimatesList(formEstimateId, newRoom.room_id);
                  } else {
                    // Fall back to showing a success message if estimateManager is not available
                    logger.log('EstimateManager not available, showing success message');
                    this.showSuccessMessage('Room created and product added successfully!');
                  }
                })
                .catch(error => {
                  logger.error('Error adding product to room:', error);

                  // Hide loading
                  if (this.modalManager) {
                    this.modalManager.hideLoading();
                  }

                  // Show partial success as a warning/error message
                  this.showPartialSuccessMessage('Room created successfully, but product could not be added.');
                });
            } else {
              logger.error('ProductManager not available for addProductToRoom');

              // Hide loading
              if (this.modalManager) {
                this.modalManager.hideLoading();
              }

              // Still show success for room creation
              this.showSuccessMessage('Room created successfully.');
            }
          } else {
            // Product was already added by the server or no product ID was provided
            // In either case, just proceed to show the room
            
            if (serverAddedProduct) {
              logger.log('Product was already added by the server, skipping client-side addition');
            }
            
            // Show the estimates list with the new room expanded
            if (this.modalManager && this.modalManager.estimateManager) {
              this.modalManager.estimateManager.showEstimatesList(formEstimateId, newRoom.room_id);
            } else {
              // Hide loading
              if (this.modalManager) {
                this.modalManager.hideLoading();
              }

              // Show success message
              const message = serverAddedProduct ? 
                'Room created and product added successfully!' : 
                'Room created successfully.';
              this.showSuccessMessage(message);
            }
          }
        })
        .catch(error => {
          logger.error('Error creating room:', error);

          // Show error
          this.showError(formElement, 'Error creating room. Please try again.');

          // Hide loading
          if (this.modalManager) {
            this.modalManager.hideLoading();
          }
        });
    };

    // Add the submit handler
    formElement.addEventListener('submit', formElement._submitHandler);

    // Bind cancel button (using the class in the template: cancel-btn)
    const cancelButton = formElement.querySelector('.cancel-btn, .cancel-button');
    if (cancelButton) {
      if (cancelButton._clickHandler) {
        cancelButton.removeEventListener('click', cancelButton._clickHandler);
      }

      cancelButton._clickHandler = (e) => {
        e.preventDefault();
        logger.log('Cancel button clicked in new room form');
        this.cancelForm('room', estimateId, productId);
      };

      cancelButton.addEventListener('click', cancelButton._clickHandler);
      logger.log('Cancel button handler attached to new room form');
    } else {
      logger.log('Cancel button not found in new room form');
      logger.log('Form element structure:', formElement.innerHTML);
    }

    // Bind back button
    const backButton = formElement.querySelector('.back-button');
    if (backButton) {
      if (backButton._clickHandler) {
        backButton.removeEventListener('click', backButton._clickHandler);
      }

      backButton._clickHandler = (e) => {
        e.preventDefault();

        // Use the same logic as cancel button for consistency
        this.cancelForm('room', estimateId, productId);
      };

      backButton.addEventListener('click', backButton._clickHandler);
    }
  }

  /**
   * Load the estimate selection form
   * @param {string|null} productId - Optional product ID to add
   */
  loadEstimateSelectionForm(productId = null) {
    logger.log('Loading estimate selection form', { productId });

    // This functionality has been moved to EstimateManager.showEstimateSelection
    if (this.modalManager && this.modalManager.estimateManager) {
      this.modalManager.estimateManager.showEstimateSelection(productId);
    } else {
      logger.error('EstimateManager not available for showEstimateSelection');
    }
  }

  /**
   * Handle form cancellation
   * @param {string} formType - The type of form to cancel ('estimate', 'room', etc.)
   * @param {string|null} estimateId - Optional estimate ID
   * @param {string|null} productId - Optional product ID
   */
  cancelForm(formType, estimateId = null, productId = null) {
    logger.log('Cancelling form', { formType, estimateId, productId });

    switch (formType) {
      case 'estimate':
        // Go back to estimate selection or close modal
        if (productId && this.modalManager && this.modalManager.estimateManager) {
          this.modalManager.estimateManager.showEstimateSelection(productId);
        } else if (this.modalManager) {
          this.modalManager.closeModal();
        }
        break;

      case 'room':
        // If we have a productId, go back to estimate selection
        // Otherwise go to the estimates list
        if (productId && this.modalManager && this.modalManager.estimateManager) {
          // If we're adding a product, go back to estimate selection
          this.modalManager.estimateManager.showEstimateSelection(productId);
        } else if (estimateId && this.modalManager && this.modalManager.estimateManager) {
          // If we're just creating a room, go back to the estimates list
          this.modalManager.estimateManager.showEstimatesList();
        } else if (this.modalManager) {
          this.modalManager.closeModal();
        }
        break;

      default:
        // Just close the modal
        if (this.modalManager) {
          this.modalManager.closeModal();
        }
    }
  }

  /**
   * Validate a form
   * @param {HTMLElement} form - The form to validate
   * @returns {boolean} Whether the form is valid
   */
  validateForm(form) {
    logger.log('Validating form', form);

    if (!form) {
      logger.error('Form not provided for validation');
      return false;
    }

    // Clear any previous errors
    this.clearErrors(form);

    let isValid = true;

    // Validate required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        this.showError(form, `${field.name} is required.`, field);
        
        // Explicitly ensure the value is empty to make sure our validation is triggered
        field.value = '';  
        
        // Set validation custom property on the field
        field.dataset.validationFailed = 'true';
        
        isValid = false;
      }
    });

    // If form is not valid, ensure no storage operations happen
    if (!isValid) {
      logger.log('Form validation failed - form has errors');
      
      // Set a flag on the form to indicate validation failure
      form.dataset.validationFailed = 'true';
      
      // Prevent default browser form submission
      if (form.hasAttribute('data-submitting')) {
        form.removeAttribute('data-submitting');
      }
    } else {
      // Form is valid - remove the failure flag
      form.removeAttribute('data-validation-failed');
    }

    // Additional validation logic based on form type could be added here

    return isValid;
  }

  /**
   * Show an error message on a form
   * @param {HTMLElement} form - The form to show the error on
   * @param {string} message - The error message
   * @param {HTMLElement|null} field - Optional field that has the error
   */
  showError(form, message, field = null) {
    logger.log('Showing error', { message, field });

    if (!form) {
      logger.error('Form not provided for showing error');
      return;
    }

    // Find or create error container using template
    let errorContainer = form.querySelector('.form-errors');
    if (!errorContainer) {
      // Create a temporary container to hold the template
      const tempContainer = document.createElement('div');
      TemplateEngine.insert('form-error-template', {
        errorMessage: message
      }, tempContainer);

      // Insert the error container at the top of the form
      errorContainer = tempContainer.firstElementChild;
      form.insertBefore(errorContainer, form.firstChild);
    } else {
      // Update the existing error container with the new message
      const errorMessageElement = errorContainer.querySelector('p');
      if (errorMessageElement) {
        errorMessageElement.textContent = message;
      } else {
        // If no <p> element exists, add one
        const p = document.createElement('p');
        p.textContent = message;
        errorContainer.appendChild(p);
      }
    }

    // Highlight the field if provided
    if (field) {
      field.classList.add('error-field');
      field.setAttribute('aria-invalid', 'true');

      // Add error class to parent form group if it exists
      const formGroup = field.closest('.form-group');
      if (formGroup) {
        formGroup.classList.add('has-error');
      }

      // Focus the field
      field.focus();
    }
  }

  /**
   * Clear errors from a form
   * @param {HTMLElement} form - The form to clear errors from
   */
  clearErrors(form) {
    logger.log('Clearing errors from form');

    if (!form) {
      logger.error('Form not provided for clearing errors');
      return;
    }

    // Remove error container
    const errorContainer = form.querySelector('.form-errors');
    if (errorContainer) {
      errorContainer.remove();
    }

    // Remove error classes from fields
    const errorFields = form.querySelectorAll('.error-field');
    errorFields.forEach(field => {
      field.classList.remove('error-field');
      field.removeAttribute('aria-invalid');

      // Remove error class from parent form group if it exists
      const formGroup = field.closest('.form-group');
      if (formGroup) {
        formGroup.classList.remove('has-error');
      }
    });

    // Remove error classes from form groups
    const errorGroups = form.querySelectorAll('.has-error');
    errorGroups.forEach(group => {
      group.classList.remove('has-error');
    });
  }

  /**
   * Show a success message
   * @param {string} message - The success message
   */
  showSuccessMessage(message) {
    logger.log('Showing success message', { message });

    // Define the callback for after dialog is closed
    const onConfirm = () => {
      // Show the estimates list after confirmation 
      if (this.modalManager && this.modalManager.estimateManager) {
        logger.log('Success dialog confirmed, showing estimates list');
        this.modalManager.estimateManager.showEstimatesList();
      } else {
        // Fall back to closing the modal
        logger.log('EstimateManager not available, closing modal after success dialog');
        if (this.modalManager) {
          this.modalManager.closeModal();
        }
      }
    };

    // Use the standardized dialog helper function
    const showResult = showSuccessDialog(this.modalManager, message, 'estimate', onConfirm);
    
    // If the dialog couldn't be shown, use fallback approach
    if (!showResult) {
      logger.log(`Success: ${message}`);
      
      // Show estimates list if possible, otherwise close the modal
      if (this.modalManager && this.modalManager.estimateManager) {
        this.modalManager.estimateManager.showEstimatesList();
      } else if (this.modalManager) {
        this.modalManager.closeModal();
      }
    }
  }

  /**
   * Show a partial success message that should be styled as a warning/error
   * @param {string} message - The partial success message
   */
  showPartialSuccessMessage(message) {
    logger.log('Showing partial success message as warning', { message });

    // Define the callback for after dialog is closed
    const onConfirm = () => {
      // Show the estimates list after confirmation
      if (this.modalManager && this.modalManager.estimateManager) {
        logger.log('Warning dialog confirmed, showing estimates list');
        this.modalManager.estimateManager.showEstimatesList();
      } else {
        // Fall back to closing the modal
        logger.log('EstimateManager not available, closing modal after warning dialog');
        if (this.modalManager) {
          this.modalManager.closeModal();
        }
      }
    };

    // Use the standardized dialog helper function
    const showResult = showWarningDialog(this.modalManager, message, 'estimate', onConfirm);
    
    // If the dialog couldn't be shown, use fallback approach
    if (!showResult) {
      logger.log(`Warning: ${message}`);
      
      if (this.modalManager && this.modalManager.estimateManager) {
        this.modalManager.estimateManager.showEstimatesList();
      } else if (this.modalManager) {
        this.modalManager.closeModal();
      }
    }
  }

  /**
   * Called when the modal is closed
   */
  onModalClosed() {
    logger.log('FormManager: Modal closed');
    // Clean up any resources or state as needed
    this.currentForm = null;
  }
}

export default FormManager;
