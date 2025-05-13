/**
 * EstimateManager.js
 *
 * Handles all operations related to estimates:
 * - Loading and displaying the estimates list
 * - Creating new estimates
 * - Removing estimates
 * - Updating estimate UI
 */

import { format, createLogger } from '@utils';
import { loadEstimateData, saveEstimateData, addEstimate, removeEstimate } from '../EstimateStorage';
import { loadCustomerDetails, saveCustomerDetails } from '../CustomerStorage';
import TemplateEngine from '../TemplateEngine';

const logger = createLogger('EstimateManager');

class EstimateManager {
  /**
   * Initialize the EstimateManager
   * @param {object} config - Configuration options
   * @param {object} dataService - The data service instance
   * @param {object} modalManager - Reference to the parent modal manager
   */
  constructor(config = {}, dataService, modalManager) {
    this.config = config;
    this.dataService = dataService;
    this.modalManager = modalManager;
    
    // References to DOM elements (can be accessed via modalManager)
    this.estimatesList = null;
    this.estimateSelection = null;
    this.newEstimateForm = null;
    
    // State
    this.currentProductId = null;
    
    // Bind methods to preserve 'this' context
    this.handleProductFlow = this.handleProductFlow.bind(this);
    this.showEstimatesList = this.showEstimatesList.bind(this);
    this.loadEstimatesList = this.loadEstimatesList.bind(this);
    this.showNewEstimateForm = this.showNewEstimateForm.bind(this);
    this.handleEstimateRemoval = this.handleEstimateRemoval.bind(this);
    this.updateEstimate = this.updateEstimate.bind(this);
    this.bindEstimateSelectionFormEvents = this.bindEstimateSelectionFormEvents.bind(this);
    this.onModalClosed = this.onModalClosed.bind(this);
  }
  
  /**
   * Initialize the estimate manager
   */
  init() {
    // Get references to DOM elements from the modal manager
    this.estimatesList = this.modalManager.estimatesList;
    this.estimateSelection = this.modalManager.estimateSelection;
    this.newEstimateForm = this.modalManager.newEstimateForm;
    
    this.bindEvents();
    
    logger.log('EstimateManager initialized');
  }
  
  /**
   * Bind event listeners related to estimates
   */
  bindEvents() {
    // We'll implement this later when we move the estimate-specific bindings
    logger.log('EstimateManager events bound');
  }
  
  /**
   * Handle the product flow in the modal
   * This is called from ModalManager.openModal when productId is provided
   * @param {string} productId - The product ID to add
   */
  handleProductFlow(productId) {
    logger.log('Handling product flow with ID:', productId);
    this.currentProductId = productId;
    
    // Show loading indicator
    this.modalManager.showLoading();
    
    // Check if estimates exist using DataService
    this.dataService.checkEstimatesExist()
      .then(hasEstimates => {
        logger.log('Has estimates check result:', hasEstimates);
        
        if (hasEstimates) {
          // Estimates exist, show estimate selection view
          logger.log('Estimates found, showing estimate selection.');
          this.showEstimateSelection(productId);
        } else {
          // No estimates, show new estimate form
          logger.log('No estimates found, showing new estimate form.');
          this.showNewEstimateForm(productId);
        }
      })
      .catch(error => {
        logger.error('Error checking estimates:', error);
        
        // Show error message in the modal
        if (this.modalManager.contentContainer) {
          TemplateEngine.showMessage('Error checking estimates. Please try again.', 'error', this.modalManager.contentContainer);
        }
        
        // Hide loading indicator
        this.modalManager.hideLoading();
      });
  }
  
  /**
   * Show the estimate selection view
   * @param {string} productId - The product ID to add after selection
   */
  showEstimateSelection(productId) {
    logger.log('Showing estimate selection with product ID:', productId);
    
    // Get DOM references from modal manager
    const { contentContainer } = this.modalManager;
    const estimateSelectionWrapper = this.modalManager.estimateSelection;
    
    if (!estimateSelectionWrapper) {
      logger.error('Estimate selection wrapper not found in modal');
      this.modalManager.hideLoading();
      this.modalManager.showError('Modal structure incomplete. Please contact support.');
      return;
    }
    
    // Use ModalManager's utility to ensure the element is visible
    this.modalManager.forceElementVisibility(estimateSelectionWrapper);
    
    // Use TemplateEngine to insert the template
    try {
      // Clear existing content first in case it was loaded before
      estimateSelectionWrapper.innerHTML = '';
      TemplateEngine.insert('estimate-selection-template', {}, estimateSelectionWrapper);
      logger.log('Estimate selection template inserted into wrapper.');
      
      // Find the form wrapper
      const formWrapper = estimateSelectionWrapper.querySelector('#estimate-selection-form-wrapper');
      if (formWrapper) {
        // Make form wrapper visible
        this.modalManager.forceElementVisibility(formWrapper);
        
        // Find the actual form element
        const formElement = formWrapper.querySelector('form');
        if (formElement) {
          logger.log('Estimate selection form element found after template insertion, populating dropdown and binding events.');
          
          // Load estimates data and bind events
          this.loadEstimatesData(formElement, productId);
          this.bindEstimateSelectionFormEvents(formElement, productId);
        } else {
          logger.error('Form element not found inside the template after insertion!');
          this.modalManager.showError('Error rendering form template. Please try again.');
          this.modalManager.hideLoading();
        }
      } else {
        logger.error('Estimate selection form wrapper not found in template!');
        this.modalManager.showError('Modal structure incomplete. Please contact support.');
        this.modalManager.hideLoading();
      }
    } catch (error) {
      logger.error('Error inserting estimate selection template:', error);
      this.modalManager.showError('Error loading selection form template. Please try again.');
      this.modalManager.hideLoading();
    }
  }
  
  /**
   * Load estimates data into the selection form
   * @param {HTMLFormElement} formElement - The form element
   * @param {string} productId - The product ID to add after selection
   */
  loadEstimatesData(formElement, productId) {
    logger.log('Loading estimates data for selection form');
    
    const selectElement = formElement.querySelector('select');
    if (!selectElement) {
      logger.error('Select element not found in form');
      this.modalManager.hideLoading();
      return;
    }
    
    // Store product ID as a data attribute on the form
    formElement.dataset.productId = productId;
    
    // Load estimates from storage or API
    this.dataService.getEstimates()
      .then(estimates => {
        // Clear existing options
        selectElement.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Select an estimate --';
        selectElement.appendChild(defaultOption);
        
        // Add options for each estimate
        if (estimates && estimates.length > 0) {
          estimates.forEach(estimate => {
            const option = document.createElement('option');
            option.value = estimate.id;
            option.textContent = estimate.name || `Estimate #${estimate.id}`;
            selectElement.appendChild(option);
          });
          
          // Enable the select element and form buttons
          selectElement.disabled = false;
          const submitButton = formElement.querySelector('button[type="submit"]');
          if (submitButton) submitButton.disabled = false;
        } else {
          // No estimates available, show message
          const option = document.createElement('option');
          option.value = '';
          option.textContent = 'No estimates available';
          selectElement.appendChild(option);
          
          // Disable the select element and form buttons
          selectElement.disabled = true;
          const submitButton = formElement.querySelector('button[type="submit"]');
          if (submitButton) submitButton.disabled = true;
        }
        
        this.modalManager.hideLoading();
      })
      .catch(error => {
        logger.error('Error loading estimates:', error);
        this.modalManager.showError('Error loading estimates. Please try again.');
        this.modalManager.hideLoading();
      });
  }
  
  /**
   * Bind events to the estimate selection form
   * @param {HTMLFormElement} formElement - The form element
   * @param {string} productId - The product ID to add after selection
   */
  bindEstimateSelectionFormEvents(formElement, productId) {
    logger.log('Binding events to estimate selection form');
    
    if (!formElement) {
      logger.error('Form element not available for binding events');
      return;
    }
    
    // Remove any existing event listeners to prevent duplicates
    if (formElement._submitHandler) {
      formElement.removeEventListener('submit', formElement._submitHandler);
    }
    
    // Create new submit handler
    formElement._submitHandler = (e) => {
      e.preventDefault();
      
      // Show loading indicator
      this.modalManager.showLoading();
      
      // Get the selected estimate ID
      const selectElement = formElement.querySelector('select');
      const estimateId = selectElement.value;
      
      if (!estimateId) {
        this.modalManager.showError('Please select an estimate.');
        this.modalManager.hideLoading();
        return;
      }
      
      // Delegate to the RoomManager to show room selection form
      if (this.modalManager.roomManager) {
        this.modalManager.roomManager.showRoomSelectionForm(estimateId, productId);
      } else {
        logger.error('RoomManager not available for showRoomSelectionForm');
        this.modalManager.hideLoading();
      }
    };
    
    // Add the submit handler
    formElement.addEventListener('submit', formElement._submitHandler);
    
    // Add event handler for "Create New Estimate" button
    const newEstimateButton = formElement.querySelector('.create-new-estimate-button');
    if (newEstimateButton) {
      if (newEstimateButton._clickHandler) {
        newEstimateButton.removeEventListener('click', newEstimateButton._clickHandler);
      }
      
      newEstimateButton._clickHandler = (e) => {
        e.preventDefault();
        this.showNewEstimateForm(productId);
      };
      
      newEstimateButton.addEventListener('click', newEstimateButton._clickHandler);
    }
    
    // Add event handler for cancel button
    const cancelButton = formElement.querySelector('.cancel-button');
    if (cancelButton) {
      if (cancelButton._clickHandler) {
        cancelButton.removeEventListener('click', cancelButton._clickHandler);
      }
      
      cancelButton._clickHandler = (e) => {
        e.preventDefault();
        this.modalManager.closeModal();
      };
      
      cancelButton.addEventListener('click', cancelButton._clickHandler);
    }
  }
  
  /**
   * Show the estimates list view
   * This is called from ModalManager.openModal when no productId is provided or forceListView is true
   */
  showEstimatesList() {
    logger.log('Showing estimates list view');
    
    // Get the estimates list container from the modal manager
    const estimatesList = this.modalManager.estimatesList;
    
    if (!estimatesList) {
      logger.error('Estimates list container not found in modal');
      this.modalManager.hideLoading();
      this.modalManager.showError('Modal structure incomplete. Please contact support.');
      return;
    }
    
    // Use ModalManager's utility to ensure the element is visible
    this.modalManager.forceElementVisibility(estimatesList);
    
    // Bind event handlers to the estimates list container
    this.bindEstimateListEventHandlers();
    
    // Load and render the estimates list content
    this.loadEstimatesList()
      .catch(error => {
        logger.error('Error loading estimates list:', error);
        if (estimatesList) {
          TemplateEngine.showMessage('Error loading estimates. Please try again.', 'error', estimatesList);
        } else {
          this.modalManager.showError('Error loading estimates. Please try again.');
        }
      })
      .finally(() => {
        this.modalManager.hideLoading();
      });
  }
  
  /**
   * Bind event handlers to the estimates list
   */
  bindEstimateListEventHandlers() {
    logger.log('Binding event handlers to estimates list');
    
    const estimatesList = this.modalManager.estimatesList;
    if (!estimatesList) {
      logger.error('Estimates list container not found for binding events');
      return;
    }
    
    // Use event delegation for handling clicks within the estimates list
    if (estimatesList._clickHandler) {
      estimatesList.removeEventListener('click', estimatesList._clickHandler);
    }
    
    estimatesList._clickHandler = (e) => {
      // Handle "Add New Estimate" button
      if (e.target.closest('.add-new-estimate-button')) {
        e.preventDefault();
        this.showNewEstimateForm();
        return;
      }
      
      // Handle estimate removal
      if (e.target.closest('.remove-estimate-button')) {
        e.preventDefault();
        const estimateItem = e.target.closest('.estimate-item');
        if (estimateItem && estimateItem.dataset.estimateId) {
          this.handleEstimateRemoval(estimateItem.dataset.estimateId);
        }
        return;
      }
      
      // Handle estimate editing
      if (e.target.closest('.edit-estimate-button')) {
        e.preventDefault();
        const estimateItem = e.target.closest('.estimate-item');
        if (estimateItem && estimateItem.dataset.estimateId) {
          // This will be implemented in a later phase
          logger.log('Edit estimate button clicked for ID:', estimateItem.dataset.estimateId);
        }
        return;
      }
      
      // Handle accordion toggle for estimate details
      if (e.target.closest('.estimate-header')) {
        const header = e.target.closest('.estimate-header');
        const estimateItem = header.closest('.estimate-item');
        const content = estimateItem.querySelector('.estimate-content');
        
        if (content) {
          // Toggle the expanded state
          const isExpanded = header.classList.contains('expanded');
          
          if (isExpanded) {
            header.classList.remove('expanded');
            content.style.display = 'none';
          } else {
            header.classList.add('expanded');
            content.style.display = 'block';
            
            // If this is the first time expanding, load the rooms
            if (estimateItem.dataset.estimateId && !content.dataset.loaded) {
              content.dataset.loaded = 'true';
              
              // Delegate to RoomManager to load rooms for this estimate
              if (this.modalManager.roomManager) {
                this.modalManager.roomManager.loadRoomsForEstimate(estimateItem.dataset.estimateId, content);
              }
            }
          }
        }
        return;
      }
    };
    
    estimatesList.addEventListener('click', estimatesList._clickHandler);
  }
  
  /**
   * Load and display all estimates
   * @param {string|null} expandRoomId - Optional room ID to expand after loading
   * @param {string|null} expandEstimateId - Optional estimate ID to expand after loading
   * @returns {Promise} - Promise that resolves when estimates are loaded
   */
  loadEstimatesList(expandRoomId = null, expandEstimateId = null) {
    logger.log('Loading estimates list', { expandRoomId, expandEstimateId });
    
    const estimatesList = this.modalManager.estimatesList;
    if (!estimatesList) {
      return Promise.reject(new Error('Estimates list container not found'));
    }
    
    // Show loading indicator
    this.modalManager.showLoading();
    
    // Load estimates from storage or API
    return this.dataService.getEstimates()
      .then(estimates => {
        // Clear existing content
        estimatesList.innerHTML = '';
        
        if (!estimates || estimates.length === 0) {
          // No estimates, show empty state
          estimatesList.innerHTML = `
            <div class="empty-state">
              <h3>No Estimates Found</h3>
              <p>You don't have any estimates yet. Create your first estimate to get started.</p>
              <button class="add-new-estimate-button button button-primary">Create New Estimate</button>
            </div>
          `;
        } else {
          // Render each estimate
          const estimatesHTML = estimates.map(estimate => {
            return `
              <div class="estimate-item" data-estimate-id="${estimate.id}">
                <div class="estimate-header">
                  <h3>${estimate.name || `Estimate #${estimate.id}`}</h3>
                  <div class="estimate-actions">
                    <button class="edit-estimate-button button button-small">Edit</button>
                    <button class="remove-estimate-button button button-small button-danger">Remove</button>
                  </div>
                  <div class="accordion-indicator"></div>
                </div>
                <div class="estimate-content" style="display: none;">
                  <div class="estimate-rooms-container">
                    <div class="loading-placeholder">Loading rooms...</div>
                  </div>
                  <div class="estimate-actions-footer">
                    <button class="add-room-button button button-primary">Add Room</button>
                    <button class="print-estimate-button button">Print</button>
                  </div>
                </div>
              </div>
            `;
          }).join('');
          
          // Add new estimate button at the bottom
          estimatesList.innerHTML = `
            ${estimatesHTML}
            <div class="add-new-estimate-container">
              <button class="add-new-estimate-button button button-primary">Create New Estimate</button>
            </div>
          `;
          
          // If expandEstimateId is provided, expand that estimate
          if (expandEstimateId) {
            const estimateToExpand = estimatesList.querySelector(`.estimate-item[data-estimate-id="${expandEstimateId}"]`);
            if (estimateToExpand) {
              const header = estimateToExpand.querySelector('.estimate-header');
              const content = estimateToExpand.querySelector('.estimate-content');
              
              if (header && content) {
                header.classList.add('expanded');
                content.style.display = 'block';
                content.dataset.loaded = 'true';
                
                // Delegate to RoomManager to load rooms for this estimate
                if (this.modalManager.roomManager) {
                  this.modalManager.roomManager.loadRoomsForEstimate(expandEstimateId, content, expandRoomId);
                }
              }
            }
          }
        }
        
        return estimates;
      })
      .finally(() => {
        this.modalManager.hideLoading();
      });
  }
  
  /**
   * Show the new estimate form
   * @param {string|null} productId - Optional product ID to add to the new estimate
   */
  showNewEstimateForm(productId = null) {
    logger.log('Showing new estimate form', { productId });
    
    // Get the new estimate form container from the modal manager
    const newEstimateForm = this.modalManager.newEstimateForm;
    
    if (!newEstimateForm) {
      logger.error('New estimate form container not found in modal');
      this.modalManager.showError('Modal structure incomplete. Please contact support.');
      this.modalManager.hideLoading();
      return;
    }
    
    // Use ModalManager's utility to ensure the element is visible
    this.modalManager.forceElementVisibility(newEstimateForm);
    
    // Show loading indicator while we prepare the form
    this.modalManager.showLoading();
    
    // Use TemplateEngine to insert the template
    try {
      // Clear existing content first in case it was loaded before
      newEstimateForm.innerHTML = '';
      TemplateEngine.insert('new-estimate-form-template', {}, newEstimateForm);
      logger.log('New estimate form template inserted into wrapper.');
      
      // Find the form element
      const formElement = newEstimateForm.querySelector('form');
      if (formElement) {
        // Store product ID as a data attribute on the form if provided
        if (productId) {
          formElement.dataset.productId = productId;
        } else {
          delete formElement.dataset.productId;
        }
        
        // Delegate form binding to the FormManager
        if (this.modalManager.formManager) {
          this.modalManager.formManager.bindNewEstimateFormEvents(formElement, productId);
        } else {
          logger.error('FormManager not available for bindNewEstimateFormEvents');
        }
        
        this.modalManager.hideLoading();
      } else {
        logger.error('Form element not found inside the template after insertion!');
        this.modalManager.showError('Error rendering form template. Please try again.');
        this.modalManager.hideLoading();
      }
    } catch (error) {
      logger.error('Error inserting new estimate form template:', error);
      this.modalManager.showError('Error loading form template. Please try again.');
      this.modalManager.hideLoading();
    }
  }
  
  /**
   * Handle estimate removal
   * @param {string} estimateId - The estimate ID to remove
   */
  handleEstimateRemoval(estimateId) {
    logger.log('Handling estimate removal for ID:', estimateId);
    
    // Show a confirmation dialog
    if (window.productEstimator && window.productEstimator.dialog) {
      window.productEstimator.dialog.confirm(
        'Remove Estimate',
        'Are you sure you want to remove this estimate? This action cannot be undone.',
        () => {
          // User confirmed, remove the estimate
          this.modalManager.showLoading();
          
          this.dataService.removeEstimate(estimateId)
            .then(() => {
              // Reload the estimates list to reflect the change
              return this.loadEstimatesList();
            })
            .catch(error => {
              logger.error('Error removing estimate:', error);
              this.modalManager.showError('Error removing estimate. Please try again.');
            })
            .finally(() => {
              this.modalManager.hideLoading();
            });
        },
        () => {
          // User cancelled, do nothing
          logger.log('Estimate removal cancelled by user');
        }
      );
    } else {
      // No dialog service available, use native confirm
      if (confirm('Are you sure you want to remove this estimate? This action cannot be undone.')) {
        // User confirmed, remove the estimate
        this.modalManager.showLoading();
        
        this.dataService.removeEstimate(estimateId)
          .then(() => {
            // Reload the estimates list to reflect the change
            return this.loadEstimatesList();
          })
          .catch(error => {
            logger.error('Error removing estimate:', error);
            this.modalManager.showError('Error removing estimate. Please try again.');
          })
          .finally(() => {
            this.modalManager.hideLoading();
          });
      }
    }
  }
  
  /**
   * Update an estimate's details
   * @param {string} estimateId - The estimate ID to update
   * @param {object} updateData - The data to update
   * @returns {Promise} - Promise that resolves when update is complete
   */
  updateEstimate(estimateId, updateData) {
    logger.log('Updating estimate', { estimateId, updateData });
    
    // Show loading indicator
    this.modalManager.showLoading();
    
    return this.dataService.updateEstimate(estimateId, updateData)
      .then(updatedEstimate => {
        logger.log('Estimate updated successfully:', updatedEstimate);
        
        // Reload the estimates list to reflect the changes
        return this.loadEstimatesList(null, estimateId);
      })
      .catch(error => {
        logger.error('Error updating estimate:', error);
        this.modalManager.showError('Error updating estimate. Please try again.');
        throw error;
      })
      .finally(() => {
        this.modalManager.hideLoading();
      });
  }
  
  /**
   * Called when the modal is closed
   */
  onModalClosed() {
    logger.log('EstimateManager: Modal closed');
    // Clean up any resources or state as needed
    this.currentProductId = null;
  }
}

export default EstimateManager;