/**
 * FormManager.js
 *
 * Handles all operations related to forms:
 * - Binding form events
 * - Form submission handling
 * - Form validation
 * - Form cancellation
 */

import { format, createLogger } from '@utils';
import { loadEstimateData, saveEstimateData } from '../EstimateStorage';
import { loadCustomerDetails, saveCustomerDetails } from '../CustomerStorage';
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
        return;
      }
      
      // Show loading
      if (this.modalManager) {
        this.modalManager.showLoading();
      }
      
      // Get form data
      const formData = new FormData(formElement);
      const estimateName = formData.get('estimate_name');
      
      // Create the estimate
      this.dataService.createEstimate({ 
        name: estimateName
      })
        .then(newEstimate => {
          logger.log('Estimate created successfully:', newEstimate);
          
          // If a product ID is provided, we need to add it to a room
          if (productId) {
            // Show room creation form for the new estimate
            if (this.modalManager && this.modalManager.roomManager) {
              this.modalManager.roomManager.showNewRoomForm(newEstimate.id, productId);
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
            if (this.modalManager && this.modalManager.estimateManager) {
              this.modalManager.estimateManager.showEstimatesList(null, newEstimate.id);
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
    
    // Bind cancel button
    const cancelButton = formElement.querySelector('.cancel-button');
    if (cancelButton) {
      if (cancelButton._clickHandler) {
        cancelButton.removeEventListener('click', cancelButton._clickHandler);
      }
      
      cancelButton._clickHandler = (e) => {
        e.preventDefault();
        this.cancelForm('estimate');
      };
      
      cancelButton.addEventListener('click', cancelButton._clickHandler);
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
        return;
      }
      
      // Show loading
      if (this.modalManager) {
        this.modalManager.showLoading();
      }
      
      // Get form data
      const formData = new FormData(formElement);
      const roomName = formData.get('room_name');
      
      // Create the room
      this.dataService.createRoom(estimateId, {
        name: roomName
      })
        .then(newRoom => {
          logger.log('Room created successfully:', newRoom);
          
          // If a product ID is provided, add it to the new room
          if (productId) {
            // Delegate to the ProductManager to add product to the new room
            if (this.modalManager && this.modalManager.productManager) {
              this.modalManager.productManager.addProductToRoom(estimateId, newRoom.id, productId)
                .then(() => {
                  // Hide loading
                  if (this.modalManager) {
                    this.modalManager.hideLoading();
                  }
                  
                  // Show success message
                  this.showSuccessMessage('Room created and product added successfully!');
                })
                .catch(error => {
                  logger.error('Error adding product to room:', error);
                  
                  // Hide loading
                  if (this.modalManager) {
                    this.modalManager.hideLoading();
                  }
                  
                  // Still show success for room creation
                  this.showSuccessMessage('Room created successfully, but product could not be added.');
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
            // No product ID, just show the estimates list with the new room expanded
            if (this.modalManager && this.modalManager.estimateManager) {
              this.modalManager.estimateManager.showEstimatesList(newRoom.id, estimateId);
            } else {
              // Hide loading
              if (this.modalManager) {
                this.modalManager.hideLoading();
              }
              
              // Show success message
              this.showSuccessMessage('Room created successfully.');
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
    
    // Bind cancel button
    const cancelButton = formElement.querySelector('.cancel-button');
    if (cancelButton) {
      if (cancelButton._clickHandler) {
        cancelButton.removeEventListener('click', cancelButton._clickHandler);
      }
      
      cancelButton._clickHandler = (e) => {
        e.preventDefault();
        this.cancelForm('room', estimateId, productId);
      };
      
      cancelButton.addEventListener('click', cancelButton._clickHandler);
    }
    
    // Bind back button
    const backButton = formElement.querySelector('.back-button');
    if (backButton) {
      if (backButton._clickHandler) {
        backButton.removeEventListener('click', backButton._clickHandler);
      }
      
      backButton._clickHandler = (e) => {
        e.preventDefault();
        
        // Go back to room selection
        if (this.modalManager && this.modalManager.roomManager) {
          this.modalManager.roomManager.showRoomSelectionForm(estimateId, productId);
        } else {
          // Just close the modal
          if (this.modalManager) {
            this.modalManager.closeModal();
          }
        }
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
        // Go back to room selection or close modal
        if (estimateId && this.modalManager && this.modalManager.roomManager) {
          this.modalManager.roomManager.showRoomSelectionForm(estimateId, productId);
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
        isValid = false;
      }
    });
    
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
    
    // Find or create error container
    let errorContainer = form.querySelector('.form-errors');
    if (!errorContainer) {
      errorContainer = document.createElement('div');
      errorContainer.className = 'form-errors error-message';
      form.insertBefore(errorContainer, form.firstChild);
    }
    
    // Add the error message
    const errorMessage = document.createElement('p');
    errorMessage.textContent = message;
    errorContainer.appendChild(errorMessage);
    
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
    
    // Use dialog if available
    if (window.productEstimator && window.productEstimator.dialog) {
      window.productEstimator.dialog.alert('Success', message, () => {
        // Close the modal
        if (this.modalManager) {
          this.modalManager.closeModal();
        }
      });
    } else {
      // Use native alert
      alert(message);
      
      // Close the modal
      if (this.modalManager) {
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