/**
 * EstimateManager.js
 *
 * Handles all operations related to estimates:
 * - Loading and displaying the estimates list
 * - Creating new estimates
 * - Removing estimates
 * - Updating estimate UI
 */

import { format, createLogger, showSuccessDialog, showErrorDialog, showDeleteConfirmDialog, labelManager } from '@utils';

import { loadEstimateData, saveEstimateData, addEstimate, removeEstimate } from '../EstimateStorage';
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
    this.estimateHasProducts = this.estimateHasProducts.bind(this);
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
   * Check if an estimate has any rooms with products
   * @param {object} estimate - The estimate data
   * @returns {boolean} True if the estimate has at least one room with products
   */
  estimateHasProducts(estimate) {
    if (!estimate || !estimate.rooms || typeof estimate.rooms !== 'object') {
      return false;
    }

    // Check each room for products
    for (const roomId in estimate.rooms) {
      const room = estimate.rooms[roomId];
      
      // Check if room has products (object or array)
      if (room.products) {
        if (Array.isArray(room.products) && room.products.length > 0) {
          return true;
        } else if (typeof room.products === 'object' && Object.keys(room.products).length > 0) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Hide all modal sections to ensure only one section is visible at a time
   */
  hideAllSections() {
    logger.log('Hiding all sections');

    // Get references to all section containers
    const viewContainers = [
      this.modalManager.estimatesList,
      this.modalManager.estimateSelection,
      this.modalManager.roomSelectionForm,
      this.modalManager.newEstimateForm,
      this.modalManager.newRoomForm
    ];

    // Hide each container
    viewContainers.forEach(container => {
      if (container && this.modalManager.uiManager) {
        this.modalManager.uiManager.hideElement(container);
      } else if (container) {
        container.style.display = 'none';
      }
    });
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
          TemplateEngine.showMessage(labelManager.get('messages.estimate_check_error', 'Error checking estimates. Please try again.'), 'error', this.modalManager.contentContainer);
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

    // Hide all other sections first
    this.hideAllSections();

    if (!estimateSelectionWrapper) {
      logger.error('Estimate selection wrapper not found in modal');
      this.modalManager.hideLoading();
      this.modalManager.showError(labelManager.get('errors.modal_structure', 'Modal structure incomplete. Please contact support.'));
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
          this.modalManager.showError(labelManager.get('errors.form_template', 'Error rendering form template. Please try again.'));
          this.modalManager.hideLoading();
        }
      } else {
        logger.error('Estimate selection form wrapper not found in template!');
        this.modalManager.showError(labelManager.get('errors.modal_structure', 'Modal structure incomplete. Please contact support.'));
        this.modalManager.hideLoading();
      }
    } catch (error) {
      logger.error('Error inserting estimate selection template:', error);
      this.modalManager.showError(labelManager.get('errors.selection_template', 'Error loading selection form template. Please try again.'));
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
    this.dataService.getEstimatesData()
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
        this.modalManager.showError(labelManager.get('messages.load_estimates_error', 'Error loading estimates. Please try again.'));
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
        this.modalManager.showError(labelManager.get('messages.select_estimate', 'Please select an estimate.'));
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

    // Add event handler for "Create New Estimate" button (with id="create-estimate-btn")
    const newEstimateButton = formElement.querySelector('#create-estimate-btn');
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
   * @param {string|null} expandEstimateId - Optional estimate ID to expand after loading
   * @param {string|null} expandRoomId - Optional room ID to expand after loading
   */
  showEstimatesList(expandEstimateId = null, expandRoomId = null) {
    logger.log('Showing estimates list view', { expandEstimateId, expandRoomId });

    // Get the estimates list container from the modal manager
    const estimatesList = this.modalManager.estimatesList;

    if (!estimatesList) {
      logger.error('Estimates list container not found in modal');
      this.modalManager.hideLoading();
      this.modalManager.showError(labelManager.get('errors.modal_structure', 'Modal structure incomplete. Please contact support.'));
      return;
    }

    // Hide all other sections first
    this.hideAllSections();

    // Use ModalManager's utility to ensure the element is visible
    this.modalManager.forceElementVisibility(estimatesList);

    // Load and render the estimates list content first, then bind event handlers
    this.loadEstimatesList(expandRoomId, expandEstimateId)
      .then(() => {
        // Bind event handlers to the estimates list container AFTER the content is loaded and rendered
        this.bindEstimateListEventHandlers();
      })
      .catch(error => {
        logger.error('Error loading estimates list:', error);
        if (estimatesList) {
          TemplateEngine.showMessage(labelManager.get('messages.load_estimates_error', 'Error loading estimates. Please try again.'), 'error', estimatesList);
        } else {
          this.modalManager.showError(labelManager.get('messages.load_estimates_error', 'Error loading estimates. Please try again.'));
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
      logger.log('Removing existing click handler from estimates list');
      estimatesList.removeEventListener('click', estimatesList._clickHandler);
    }

    logger.log('Adding click handler to estimates list');
    estimatesList._clickHandler = (e) => {
      // Process click events on the estimates list

      // Handle "Create New Estimate" button
      if (e.target.closest('#create-estimate-btn')) {
        e.preventDefault();
        console.log('Create New Estimate button clicked');
        this.showNewEstimateForm();
        return;
      }

      // Handle estimate removal
      const removeEstimateBtn = e.target.closest('.remove-estimate');
      if (removeEstimateBtn) {
        e.preventDefault();
        e.stopPropagation(); // Critical: Prevent event from bubbling to the header

        // Get estimate ID from the button directly
        const estimateId = removeEstimateBtn.getAttribute('data-estimate-id');

        if (estimateId) {
          this.handleEstimateRemoval(estimateId);
        } else {
          // Fallback if somehow the button doesn't have an ID
          const estimateElement = removeEstimateBtn.closest('.estimate-section');
          if (estimateElement && estimateElement.dataset.estimateId) {
            const sectionEstimateId = estimateElement.dataset.estimateId;
            this.handleEstimateRemoval(sectionEstimateId);
          } else {
            logger.error('Could not find estimate ID for removal');
          }
        }
        return;
      }

      // Handle print estimate
      if (e.target.closest('.print-estimate')) {
        e.preventDefault();
        const estimateId = e.target.closest('.print-estimate').dataset.estimateId;
        if (estimateId) {
          logger.log('Print estimate clicked for ID:', estimateId);
          // Call the appropriate print function (to be implemented)
        }
        return;
      }

      // Handle request contact
      if (e.target.closest('.request-contact-estimate')) {
        e.preventDefault();
        const estimateId = e.target.closest('.request-contact-estimate').dataset.estimateId;
        if (estimateId) {
          logger.log('Request contact clicked for ID:', estimateId);
          // Handle the contact request (to be implemented)
        }
        return;
      }

      // Handle request copy
      if (e.target.closest('.request-a-copy')) {
        e.preventDefault();
        const estimateId = e.target.closest('.request-a-copy').dataset.estimateId;
        if (estimateId) {
          logger.log('Request copy clicked for ID:', estimateId);
          // Handle the copy request (to be implemented)
        }
        return;
      }

      // Handle add room button
      if (e.target.closest('.add-room')) {
        e.preventDefault();
        const estimateId = e.target.closest('.add-room').dataset.estimateId;
        if (estimateId) {
          logger.log('Add room clicked for estimate ID:', estimateId);
          // Call the appropriate function to show the add room form
          if (this.modalManager.roomManager) {
            this.modalManager.roomManager.showNewRoomForm(estimateId);
          }
        }
        return;
      }

      // Handle accordion toggle for estimate details
      if (e.target.closest('.estimate-header')) {
        // First check if we clicked on any buttons or links inside the header
        // We don't want to expand/collapse when clicking buttons
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.remove-estimate')) {
          return; // Do nothing, let the button's own handler work
        }

        logger.log('Toggling estimate accordion');
        const header = e.target.closest('.estimate-header');
        const estimateElement = header.closest('.estimate-section');
        const content = estimateElement.querySelector('.estimate-content');

        if (content) {
          // Toggle the expanded state
          const isExpanded = estimateElement.classList.contains('expanded');

          if (isExpanded) {
            estimateElement.classList.remove('expanded');
            estimateElement.classList.add('collapsed');
            content.style.display = 'none';
          } else {
            estimateElement.classList.remove('collapsed');
            estimateElement.classList.add('expanded');
            content.style.display = 'block';

            // If this is the first time expanding, load the rooms
            if (estimateElement.dataset.estimateId && !content.dataset.loaded) {
              content.dataset.loaded = 'true';

              // Delegate to RoomManager to load rooms for this estimate
              if (this.modalManager.roomManager) {
                this.modalManager.roomManager.loadRoomsForEstimate(estimateElement.dataset.estimateId, content, null, false);
              }
            }
          }
        }
        return;
      }
    };

    logger.log('Attaching click event listener to estimates list');
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

    // If we have an expandEstimateId, force a refresh of the cache
    if (expandEstimateId) {
      this.dataService.refreshEstimatesCache();
    }

    // Load estimates from storage or API
    return this.dataService.getEstimatesData(true) // Force bypass cache
      .then(estimates => {
        // Clear existing content
        estimatesList.innerHTML = '';

        if (!estimates || estimates.length === 0) {
          // No estimates, show empty state using template
          TemplateEngine.insert('estimates-empty-template', {}, estimatesList);
          return;
        }

        // Render each estimate using the estimate-item template
        estimates.forEach(estimate => {
          // Prepare the data for the template
          const estimateData = {
            id: estimate.id,
            name: estimate.name || `Estimate #${estimate.id}`,
            min_total: estimate.min_total || 0,
            max_total: estimate.max_total || 0
          };

          // Use TemplateEngine to create and insert the estimate item
          TemplateEngine.insert('estimate-item-template', estimateData, estimatesList);

          // Now find the estimate section we just inserted and set ALL the data-estimate-id attributes
          const estimateSections = estimatesList.querySelectorAll('.estimate-section');
          // Get the most recently added one (the last one in the list)
          const estimateElement = estimateSections[estimateSections.length - 1];

          if (estimateElement) {
            // 1. Set data-estimate-id on the estimate section element
            estimateElement.setAttribute('data-estimate-id', estimate.id);

            // 2. Set data-estimate-id on the remove button
            const removeButton = estimateElement.querySelector('.remove-estimate');
            if (removeButton) {
              removeButton.setAttribute('data-estimate-id', estimate.id);
              console.log('Set data-estimate-id on remove button:', removeButton);
            } else {
              console.warn('Remove button not found in estimate element');
            }

            // 3. Set data-estimate-id on all other elements that need it
            const elementsWithDataAttr = estimateElement.querySelectorAll('[data-estimate-id]');
            elementsWithDataAttr.forEach(element => {
              element.setAttribute('data-estimate-id', estimate.id);
            });

            // 4. Also set on add-room button specifically
            const addRoomButton = estimateElement.querySelector('.add-room');
            if (addRoomButton) {
              addRoomButton.setAttribute('data-estimate-id', estimate.id);
            }

            // 5. And all other action buttons
            const actionButtons = estimateElement.querySelectorAll('.estimate-actions a');
            actionButtons.forEach(button => {
              button.setAttribute('data-estimate-id', estimate.id);
            });

            // 6. Hide estimate actions if the estimate has no products
            const estimateActionsSection = estimateElement.querySelector('.estimate-actions');
            if (estimateActionsSection) {
              const hasProducts = this.estimateHasProducts(estimate);
              logger.log(`Estimate ${estimate.id} has products: ${hasProducts}`);
              estimateActionsSection.style.display = hasProducts ? 'block' : 'none';
            }
          }
        });

        // If expandEstimateId is provided, expand that estimate
        if (expandEstimateId) {
          const estimateToExpand = estimatesList.querySelector(`.estimate-section[data-estimate-id="${expandEstimateId}"]`);
          if (estimateToExpand) {
            const header = estimateToExpand.querySelector('.estimate-header');
            const content = estimateToExpand.querySelector('.estimate-content');

            if (header && content) {
              estimateToExpand.classList.remove('collapsed');
              estimateToExpand.classList.add('expanded');
              content.style.display = 'block';
              content.dataset.loaded = 'true';

              // Delegate to RoomManager to load rooms for this estimate
              // Pass bypassCache=true when expanding to ensure fresh data
              if (this.modalManager.roomManager) {
                this.modalManager.roomManager.loadRoomsForEstimate(expandEstimateId, content, expandRoomId, true);
              }
            }
          }
        }
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
      this.modalManager.showError(labelManager.get('errors.modal_structure', 'Modal structure incomplete. Please contact support.'));
      this.modalManager.hideLoading();
      return;
    }

    // Hide all other sections first
    this.hideAllSections();

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

        // Check if customer already has a postcode
        const customerDetailsManager = window.productEstimator?.core?.customerDetailsManager;
        
        // Get the customer details display section
        const customerDetailsDisplay = newEstimateForm.querySelector('.customer-details-display');
        const customerDetailsContent = newEstimateForm.querySelector('.customer-details-content');
        
        if (customerDetailsManager) {
          const customerData = customerDetailsManager.getCustomerDetails();
          
          // Check if we have any customer data to display
          if (customerData && (customerData.name || customerData.email || customerData.phone || customerData.postcode)) {
            logger.log('Customer data found, displaying details');
            
            // Build the customer details HTML in grid format
            let detailsHtml = '';
            
            if (customerData.name) {
              detailsHtml += `<p><strong>NAME:</strong><br>${customerData.name}</p>`;
            }
            
            if (customerData.email) {
              detailsHtml += `<p><strong>EMAIL:</strong><br>${customerData.email}</p>`;
            }
            
            if (customerData.phone) {
              detailsHtml += `<p><strong>PHONE:</strong><br>${customerData.phone}</p>`;
            }
            
            if (customerData.postcode) {
              detailsHtml += `<p><strong>POSTCODE:</strong><br>${customerData.postcode}</p>`;
            }
            
            // Insert the details and show the section
            if (customerDetailsDisplay && customerDetailsContent) {
              customerDetailsContent.innerHTML = detailsHtml;
              customerDetailsDisplay.style.display = '';  // Remove inline style to use CSS
            }
          }
          
          // Handle postcode field visibility
          if (customerDetailsManager.hasPostcode()) {
            logger.log('Customer postcode found, hiding postcode field');
            
            // Hide the entire customer details section since we have postcode
            const customerDetailsSection = formElement.querySelector('.customer-details-section');
            if (customerDetailsSection) {
              customerDetailsSection.style.display = 'none';
            }
            
            // Remove the required attribute from the postcode field to prevent validation errors
            const postcodeField = formElement.querySelector('#customer-postcode');
            if (postcodeField) {
              postcodeField.removeAttribute('required');
              logger.log('Removed required attribute from hidden postcode field');
            }
            
            // Also set a data attribute to indicate we have customer data
            formElement.dataset.hasPostcode = 'true';
          } else {
            logger.log('No customer postcode found, showing postcode field');
            formElement.dataset.hasPostcode = 'false';
          }
        }

        // Delegate form binding to the FormManager
        if (this.modalManager.formManager) {
          this.modalManager.formManager.bindNewEstimateFormEvents(formElement, productId);
        } else {
          logger.error('FormManager not available for bindNewEstimateFormEvents');
        }

        // Initialize customer details edit functionality if manager is available
        if (customerDetailsManager && customerDetailsManager.bindEvents) {
          customerDetailsManager.bindEvents();
          logger.log('Customer details edit functionality initialized');
        }

        this.modalManager.hideLoading();
      } else {
        logger.error('Form element not found inside the template after insertion!');
        this.modalManager.showError('Error rendering form template. Please try again.');
        this.modalManager.hideLoading();
      }
    } catch (error) {
      logger.error('Error inserting new estimate form template:', error);
      this.modalManager.showError(labelManager.get('errors.form_template', 'Error loading form template. Please try again.'));
      this.modalManager.hideLoading();
    }
  }

  /**
   * Handle estimate removal
   * @param {string} estimateId - The estimate ID to remove
   */
  handleEstimateRemoval(estimateId) {

    // Check if ConfirmationDialog is available through ModalManager
    if (!this.modalManager || !this.modalManager.confirmationDialog) {
      logger.error('ConfirmationDialog not available');
      return;
    }

    // Show the confirmation dialog using the standardized dialog helper
    showDeleteConfirmDialog(
      this.modalManager,
      labelManager.get('messages.confirm_delete_estimate', 'Are you sure you want to delete this estimate?'),
      () => {
        // User confirmed, remove the estimate
        logger.log('Confirm button clicked, proceeding with estimate removal');
        this.modalManager.showLoading();

        this.dataService.removeEstimate(estimateId)
          .then(() => {

            // Find the estimate element in the DOM and remove it
            const estimatesList = this.modalManager.estimatesList;
            if (estimatesList) {
              const estimateElement = estimatesList.querySelector(`.estimate-section[data-estimate-id="${estimateId}"]`);
              if (estimateElement) {
                estimateElement.remove();

                // Check if there are any estimates left
                if (estimatesList.querySelectorAll('.estimate-section').length === 0) {
                  // No estimates left, show empty state
                  estimatesList.innerHTML = '';
                  TemplateEngine.insert('estimates-empty-template', {}, estimatesList);
                }
              }
            }

            logger.log('Showing success dialog');
            // Show success message using the standardized dialog helper
            showSuccessDialog(
              this.modalManager, 
              labelManager.get('messages.estimate_removed', 'This estimate has been removed successfully.'), 
              'estimate', 
              () => logger.log('Success dialog closed')
            );
          })
          .catch(error => {
            logger.error('Error removing estimate:', error);

            // Show error through the standardized dialog helper
            showErrorDialog(
              this.modalManager, 
              labelManager.get('messages.estimate_remove_error', 'There was a problem removing the estimate. Please try again.'), 
              'estimate', 
              () => logger.log('Error dialog closed')
            );
          })
          .finally(() => {
            this.modalManager.hideLoading();
          });
      },
      'estimate',
      () => {
        // User cancelled, do nothing
        logger.log('Estimate removal cancelled by user');
      }
    );
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
        this.modalManager.showError(labelManager.get('messages.update_estimate_error', 'Error updating estimate. Please try again.'));
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
