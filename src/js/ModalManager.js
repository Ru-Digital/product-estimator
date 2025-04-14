/**
 * ModalManager.js
 *
 * Handles all modal operations for the Product Estimator plugin.
 * This is the single source of truth for modal operations.
 */

class ModalManager {
  /**
   * Initialize the ModalManager
   * @param {Object} config - Configuration options
   * @param {DataService} dataService - The data service instance
   */
  constructor(config = {}, dataService) {
    // Default configuration
    this.config = Object.assign({
      debug: false,
      selectors: {
        modalContainer: '#product-estimator-modal',
        estimatorButtons: '.product-estimator-button, .single_add_to_estimator_button',
        modalOverlay: '.product-estimator-modal-overlay',
        closeButton: '.product-estimator-modal-close',
        contentContainer: '.product-estimator-modal-form-container',
        loadingIndicator: '.product-estimator-modal-loading',
        estimatesList: '#estimates',
        estimateSelection: '#estimate-selection-wrapper',
        roomSelection: '#room-selection-form-wrapper',
        newEstimateForm: '#new-estimate-form-wrapper',
        newRoomForm: '#new-room-form-wrapper'
      },
      i18n: window.productEstimatorVars?.i18n || {}
    }, config);

    // Store references to dependencies
    this.dataService = dataService;

    // UI elements
    this.modal = null;
    this.overlay = null;
    this.closeButton = null;
    this.contentContainer = null;
    this.loadingIndicator = null;

    // View containers
    this.estimatesList = null;
    this.estimateSelection = null;
    this.estimateSelectionForm = null;
    this.roomSelectionForm = null;
    this.newEstimateForm = null;
    this.newRoomForm = null;

    // State
    this.isOpen = false;
    this.currentView = null;
    this.currentProductId = null;
    this.initialized = false;
    this.eventHandlers = {};
    this.escKeyHandler = null;

    // Initialize the modal
    this.init();
  }

  /**
   * Initialize the modal
   */
  init() {
    if (this.initialized) {
      this.log('ModalManager already initialized');
      return;
    }

    // Find the existing modal in the DOM
    this.modal = document.querySelector(this.config.selectors.modalContainer);

    if (!this.modal) {
      this.log('Warning: Modal element not found in DOM. The PHP partial may not be included.');
      // Don't attempt to create it - the partial should be included by PHP
    } else {
      this.log('Found existing modal in DOM, initializing elements');
    }

    // Initialize modal elements if modal exists
    if (this.modal) {
      this.initializeElements();
      this.bindEvents();
    }

    // Initialize jQuery fallback
    this.initializeJQueryAccordions();

    this.initialized = true;
    this.log('ModalManager initialized');
  }

  /**
   * Initialize modal elements
   */
  /**
   * Initialize modal elements
   */
  /**
   * Initialize modal elements - optimized version
   */
  initializeElements() {
    if (!this.modal) {
      console.error('[ModalManager] Modal element not available for initializing elements');
      return;
    }

    // Find core modal elements
    this.overlay = this.modal.querySelector(this.config.selectors.modalOverlay);
    this.closeButton = this.modal.querySelector(this.config.selectors.closeButton);
    this.contentContainer = this.modal.querySelector(this.config.selectors.contentContainer);
    this.loadingIndicator = this.modal.querySelector(this.config.selectors.loadingIndicator);

    // Find view containers - directly use string IDs for performance
    this.estimatesList = this.modal.querySelector('#estimates');
    this.estimateSelection = this.modal.querySelector('#estimate-selection-wrapper');
    this.estimateSelectionForm = this.modal.querySelector('#estimate-selection-form-wrapper');
    this.roomSelectionForm = this.modal.querySelector('#room-selection-form-wrapper');
    this.newEstimateForm = this.modal.querySelector('#new-estimate-form-wrapper');
    this.newRoomForm = this.modal.querySelector('#new-room-form-wrapper');

    // Critical fix: If estimate selection isn't found, create it
    if (!this.estimateSelection && this.contentContainer) {
      console.warn('Creating estimate selection container');
      this.estimateSelection = document.createElement('div');
      this.estimateSelection.id = 'estimate-selection-wrapper';
      this.contentContainer.appendChild(this.estimateSelection);

      // Also create the form wrapper
      if (!this.estimateSelectionForm) {
        this.estimateSelectionForm = document.createElement('div');
        this.estimateSelectionForm.id = 'estimate-selection-form-wrapper';
        this.estimateSelection.appendChild(this.estimateSelectionForm);
      }
    }

    // Bind events to any existing forms
    this.bindExistingForms();
  }

  /**
   * New method to bind events to any forms that already exist in the DOM
   */
  bindExistingForms() {
    // Bind room form events
    if (this.newRoomForm) {
      const form = this.newRoomForm.querySelector('form#new-room-form');
      if (form) {
        console.log('Found existing room form, binding event handlers');

        // Remove any existing event handlers to prevent duplicates
        if (this._newRoomFormSubmitHandler) {
          form.removeEventListener('submit', this._newRoomFormSubmitHandler);
        }

        // Create new handler with preventDefault
        this._newRoomFormSubmitHandler = (e) => {
          e.preventDefault();
          console.log('Existing room form submitted');
          this.handleNewRoomSubmission(form, e);
        };

        // Add event listener
        form.addEventListener('submit', this._newRoomFormSubmitHandler);

        // Also bind cancel button
        const cancelButton = form.querySelector('.cancel-btn');
        if (cancelButton) {
          cancelButton.addEventListener('click', () => {
            this.cancelForm('room');
          });
        }
      }
    }

    // Bind estimate form events
    if (this.newEstimateForm) {
      const form = this.newEstimateForm.querySelector('form#new-estimate-form');
      if (form) {
        // Similar binding for the estimate form
        if (this._estimateFormSubmitHandler) {
          form.removeEventListener('submit', this._estimateFormSubmitHandler);
        }

        this._estimateFormSubmitHandler = (e) => {
          e.preventDefault();
          this.handleNewEstimateSubmission(form, e);
        };

        form.addEventListener('submit', this._estimateFormSubmitHandler);
      }
    }

    // Bind room selection form events if needed
    this.bindRoomSelectionFormEvents();
  }

  /**
   * Bind events to modal elements
   */
  bindEvents() {
    // Make sure elements exist before binding events
    if (!this.modal) {
      this.log('Modal element not available, cannot bind events');
      return;
    }

    // Remove any existing click handlers from the modal
    if (this._modalClickHandler) {
      this.modal.removeEventListener('click', this._modalClickHandler);
    }

    // Use event delegation for better performance and to avoid duplicate handlers
    this._modalClickHandler = (e) => {
      // Close button handler
      if (e.target.closest(this.config.selectors.closeButton)) {
        e.preventDefault();
        e.stopPropagation();
        this.log('Close button clicked');
        this.closeModal();
      }

      // Overlay click handler
      if (e.target.classList.contains('product-estimator-modal-overlay')) {
        e.preventDefault();
        e.stopPropagation();
        this.log('Overlay clicked');
        this.closeModal();
      }
    };

    this.modal.addEventListener('click', this._modalClickHandler);

    // Escape key to close modal
    const escHandler = (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.log('Escape key pressed');
        this.closeModal();
      }
    };

    // Remove any existing handler before adding
    document.removeEventListener('keydown', this.escKeyHandler);
    document.addEventListener('keydown', escHandler);
    this.escKeyHandler = escHandler;

    this.log('Modal events bound');
  }

  /**
   * Open the modal
   * @param {number|string|null} productId - Product ID or null for list view
   * @param {boolean} forceListView - Whether to force showing the list view
   */
  openModal(productId = null, forceListView = false) {
    console.log('MODAL OPEN CALLED WITH:', {
      productId: productId,
      forceListView: forceListView,
      typeOfProductId: typeof productId
    });

    // Make sure modal exists and is initialized
    if (!this.modal) {
      console.error('Cannot open modal - not found in DOM');
      return;
    }

    // Reset any previous modal state
    this.resetModalState();

    // Store product ID
    this.currentProductId = productId;

    // Set data attribute on modal
    if (productId) {
      this.modal.dataset.productId = productId;
    } else {
      delete this.modal.dataset.productId;
    }

    // Always start with loader visible
    this.showLoading();

    // Make sure modal is visible
    this.modal.style.display = 'block';

    // Add modal-open class to body
    document.body.classList.add('modal-open');
    this.isOpen = true;

    // DETERMINE WHICH FLOW TO USE
    console.log('FLOW DECISION:', {
      hasProductId: !!productId,
      forceListView: forceListView,
      willShowProductFlow: (!!productId && !forceListView),
      willShowListView: (!productId || forceListView)
    });

    // PRODUCT FLOW: Has product ID and not forcing list view
    if (productId && !forceListView) {
      console.log('STARTING PRODUCT FLOW with product ID:', productId);

      // Explicitly hide the estimates list
      if (this.estimatesList) {
        this.estimatesList.style.display = 'none';
        if (typeof jQuery !== 'undefined') {
          jQuery(this.estimatesList).hide();
        }
      }

      // Check if estimates exist
      this.dataService.checkEstimatesExist()
        .then(hasEstimates => {
          console.log('Has estimates check result:', hasEstimates);

          if (hasEstimates) {
            // Show estimate selection view
            this.showEstimateSelection();
          } else {
            // Show new estimate form
            this.showNewEstimateForm();
          }
        })
        .catch(error => {
          console.error('Error checking estimates:', error);
          this.showError('Error checking estimates. Please try again.');
          this.hideLoading();
        });
    } else {
      // LIST VIEW FLOW: No product ID or forcing list view
      console.log('STARTING LIST VIEW FLOW');

      // Show estimates list
      this.loadEstimatesList()
        .catch(error => {
          console.error('Error loading estimates list:', error);
          this.showError('Error loading estimates list.');
        })
        .finally(() => {
          this.hideLoading();
        });
    }
  }

  /**
   * Show estimate selection with force visibility
   */
  showEstimateSelection() {
    console.log('Showing estimate selection');

    // Make sure estimates list is hidden
    if (this.estimatesList) {
      this.estimatesList.style.display = 'none';
    }

    // Force visibility of estimate selection
    if (!this.estimateSelection) {
      console.error('Estimate selection container not found');
      return;
    }

    // Force visibility using multiple techniques
    this.forceElementVisibility(this.estimateSelection);

    // Ensure the form is also visible
    if (this.estimateSelectionForm) {
      this.forceElementVisibility(this.estimateSelectionForm);
    }

    // Make sure the form is loaded properly
    if (!this.estimateSelectionForm || !this.estimateSelectionForm.querySelector('form')) {
      // Form content needs to be loaded
      this.loadEstimateSelectionForm()
        .then(() => {
          // Double-check event binding
          this.bindEstimateSelectionFormEvents();
        })
        .catch(error => {
          console.error('Error loading form:', error);
        });
    } else {
      // Form already exists, just load the estimates data for the dropdown
      this.loadEstimatesData();

      // Re-bind events to ensure they work
      this.bindEstimateSelectionFormEvents();

      this.hideLoading();
    }
  }

  /**
   * Force element visibility using multiple techniques
   * @param {HTMLElement} element - Element to make visible
   * @return {HTMLElement} The element for chaining
   */
  forceElementVisibility(element) {
    if (!element) {
      console.error('Cannot show null element');
      return null;
    }

    console.log('Forcing visibility for:', element.id || element.tagName);

    // 1. Apply inline styles with !important to override any CSS rules
    element.style.cssText += 'display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;';

    // 2. Remove any hiding classes
    ['hidden', 'hide', 'invisible', 'd-none', 'display-none'].forEach(cls => {
      if (element.classList.contains(cls)) {
        element.classList.remove(cls);
      }
    });

    // 3. Add visible classes (some frameworks use these)
    element.classList.add('visible', 'd-block');

    // 4. Ensure parent elements are also visible
    let parent = element.parentElement;
    const checkedParents = new Set(); // Prevent infinite loops

    while (parent && parent !== document.body && !checkedParents.has(parent)) {
      checkedParents.add(parent);

      const parentStyle = window.getComputedStyle(parent);
      if (parentStyle.display === 'none') {
        parent.style.cssText += 'display: block !important;';
      }
      parent = parent.parentElement;
    }

    // 5. Use jQuery as a fallback if available
    if (typeof jQuery !== 'undefined') {
      jQuery(element).show();
    }

    return element;
  }

  /**
   * Close the modal and reset state
   */
  closeModal() {
    if (!this.isOpen) return;

    if (this.modal) {
      this.modal.style.display = 'none';
      delete this.modal.dataset.productId;
    } else {
      this.log('Cannot close modal - element not found');
      return;
    }

    document.body.classList.remove('modal-open');
    this.isOpen = false;
    this.currentProductId = null;
    this.currentView = null;

    // Reset modal state
    this.resetModalState();

    // Emit close event
    this.emit('modal:closed');
  }

  /**
   * Reset modal state
   */
  resetModalState() {
    console.log('Resetting modal state');

    // Hide all views with null checking and jQuery support
    const hideElement = (element) => {
      if (element) {
        element.style.display = 'none';
        if (typeof jQuery !== 'undefined') {
          jQuery(element).hide();
        }
      }
    };

    // Hide each element
    hideElement(this.estimatesList);
    hideElement(this.estimateSelection);
    hideElement(this.estimateSelectionForm);
    hideElement(this.roomSelectionForm);
    hideElement(this.newEstimateForm);
    hideElement(this.newRoomForm);

    // Clear any stored data attributes safely
    if (this.roomSelectionForm) this.roomSelectionForm.removeAttribute('data-estimate-id');
    if (this.newRoomForm) {
      this.newRoomForm.removeAttribute('data-estimate-id');
      this.newRoomForm.removeAttribute('data-product-id');
    }
  }

  /**
   * Load the estimates list
   * @returns {Promise} Promise that resolves when the list is loaded
   */
  loadEstimatesList() {
    return new Promise((resolve, reject) => {
      // Show loading state
      this.showLoading();

      // Ensure estimates list container exists
      if (!this.estimatesList) {
        reject(new Error('Estimates list container not found'));
        return;
      }

      // Make sure it's visible
      this.estimatesList.style.display = 'block';

      // Load estimates list via AJAX
      jQuery.ajax({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'get_estimates_list',
          nonce: productEstimatorVars.nonce
        },
        success: (response) => {
          if (response.success && response.data.html) {
            // Insert the HTML into the container
            this.estimatesList.innerHTML = response.data.html;

            // Initialize accordions with a slight delay to ensure DOM is updated
            setTimeout(() => {
              this.initializeAccordions();
              this.updateEstimatesList();

              // Bind all the necessary event handlers
              this.bindProductRemovalEvents();
              this.bindRoomRemovalEvents();
              this.bindEstimateRemovalEvents();
              this.bindEstimateListEventHandlers(); // Add this line
            }, 50);

            resolve(response.data.html);
          } else {
            const error = new Error('Failed to load estimates list');
            console.error(error);
            reject(error);
          }
        },
        error: (error) => {
          console.error('Error loading estimates list:', error);
          reject(error);
        },
        complete: () => {
          this.hideLoading();
        }
      });
    });
  }

  /**
   * Handle product removal
   * @param {string} estimateId - Estimate ID
   * @param {string} roomId - Room ID
   * @param {number} productIndex - Product index
   */
  handleProductRemoval(estimateId, roomId, productIndex) {
    this.showLoading();

    this.dataService.removeProductFromRoom(estimateId, roomId, productIndex)
      .then(response => {
        // Refresh estimates list
        this.loadEstimatesList()
          .then(() => {
            // After refreshing the list, find the room
            const roomElement = this.modal.querySelector(`.accordion-item[data-room-id="${roomId}"]`);

            if (roomElement) {
              // Always ensure the room stays expanded after deleting a product
              const header = roomElement.querySelector('.accordion-header');
              if (header) {
                header.classList.add('active');
                const content = roomElement.querySelector('.accordion-content');
                if (content) content.style.display = 'block';
              }

              // Handle suggestions visibility
              const suggestions = roomElement.querySelector('.product-suggestions');
              if (suggestions) {
                suggestions.style.display = response.show_suggestions ? 'block' : 'none';
              }
            }

            // Show success message
            this.showMessage('Product removed successfully', 'success');
          })
          .catch(error => {
            this.log('Error refreshing estimates list:', error);
            this.showError('Error refreshing estimates list. Please try again.');
          });
      })
      .catch(error => {
        this.log('Error removing product:', error);
        this.showError(error.message || 'Error removing product. Please try again.');
      })
      .finally(() => {
        this.hideLoading();
      });
  }

  javascript/**
   * Handle room removal
   * @param {string} estimateId - Estimate ID
   * @param {string} roomId - Room ID
   */
  handleRoomRemoval(estimateId, roomId) {
    this.showLoading();

    this.dataService.removeRoom(estimateId, roomId)
      .then(() => {
        // Refresh estimates list
        this.loadEstimatesList()
          .then(() => {
            // Show success message
            this.showMessage('Room removed successfully', 'success');
          })
          .catch(error => {
            this.log('Error refreshing estimates list:', error);
            this.showError('Error refreshing estimates list. Please try again.');
          });
      })
      .catch(error => {
        this.log('Error removing room:', error);
        this.showError(error.message || 'Error removing room. Please try again.');
      })
      .finally(() => {
        this.hideLoading();
      });
  }


  /**
   * Handle estimate removal
   * @param {string} estimateId - Estimate ID
   */
  handleEstimateRemoval(estimateId) {
    this.showLoading();

    this.dataService.removeEstimate(estimateId)
      .then(() => {
        // Refresh estimates list
        this.loadEstimatesList()
          .then(() => {
            // Show success message
            this.showMessage('Estimate removed successfully', 'success');
          })
          .catch(error => {
            this.log('Error refreshing estimates list:', error);
            this.showError('Error refreshing estimates list. Please try again.');
          });
      })
      .catch(error => {
        this.log('Error removing estimate:', error);
        this.showError(error.message || 'Error removing estimate. Please try again.');
      })
      .finally(() => {
        this.hideLoading();
      });
  }
  /**
   * Bind product removal events with duplicate prevention
   */
  bindProductRemovalEvents() {
    console.log('Binding product removal events');

    // Important: Remove any existing click handlers first to prevent duplicates
    if (this.estimatesList) {
      // Store a reference to our delegated handler
      if (this._productRemovalHandler) {
        this.estimatesList.removeEventListener('click', this._productRemovalHandler);
      }

      // Create a new handler function and save a reference to it
      this._productRemovalHandler = (e) => {
        const removeButton = e.target.closest('.remove-product');
        if (removeButton) {
          e.preventDefault();
          e.stopPropagation();

          // Get the necessary data attributes
          const estimateId = removeButton.dataset.estimateId;
          const roomId = removeButton.dataset.roomId;
          const productIndex = removeButton.dataset.productIndex;

          console.log('Remove product button clicked:', {
            estimateId,
            roomId,
            productIndex
          });

          if (estimateId && roomId && productIndex !== undefined) {
            // Confirm before removing
            this.confirmDelete('product', estimateId, roomId, productIndex);
          } else {
            console.error('Missing data attributes for product removal');
          }
        }
      };

      // Add the new handler
      this.estimatesList.addEventListener('click', this._productRemovalHandler);
    }

    console.log('Product removal events bound with duplicate prevention');
  }

  /**
   * Bind room removal events with duplicate prevention
   */
  bindRoomRemovalEvents() {
    if (this.estimatesList) {
      // Remove any existing handlers
      if (this._roomRemovalHandler) {
        this.estimatesList.removeEventListener('click', this._roomRemovalHandler);
      }

      // Create new handler and store reference
      this._roomRemovalHandler = (e) => {
        const removeButton = e.target.closest('.remove-room');
        if (removeButton) {
          e.preventDefault();
          e.stopPropagation();

          const estimateId = removeButton.dataset.estimateId;
          const roomId = removeButton.dataset.roomId;

          console.log('Remove room button clicked:', {
            estimateId,
            roomId
          });

          if (estimateId && roomId) {
            this.confirmDelete('room', estimateId, roomId);
          }
        }
      };

      // Add the new handler
      this.estimatesList.addEventListener('click', this._roomRemovalHandler);
    }
  }

  /**
   * Bind estimate removal events with duplicate prevention
   */
  bindEstimateRemovalEvents() {
    if (this.estimatesList) {
      // Remove any existing handlers
      if (this._estimateRemovalHandler) {
        this.estimatesList.removeEventListener('click', this._estimateRemovalHandler);
      }

      // Create new handler and store reference
      this._estimateRemovalHandler = (e) => {
        const removeButton = e.target.closest('.remove-estimate');
        if (removeButton) {
          e.preventDefault();
          e.stopPropagation();

          const estimateId = removeButton.dataset.estimateId;

          console.log('Remove estimate button clicked:', {
            estimateId
          });

          if (estimateId) {
            this.confirmDelete('estimate', estimateId);
          }
        }
      };

      // Add the new handler
      this.estimatesList.addEventListener('click', this._estimateRemovalHandler);
    }
  }

  /**
   * Update confirmDelete method to ensure proper dialog creation
   */
  confirmDelete(type, estimateId, roomId, productIndex) {
    let message = '';
    let title = '';

    switch (type) {
      case 'estimate':
        title = 'Delete Estimate';
        message = 'Are you sure you want to delete this estimate and all its rooms?';
        break;
      case 'room':
        title = 'Delete Room';
        message = 'Are you sure you want to delete this room and all its products?';
        break;
      case 'product':
        title = 'Remove Product';
        message = 'Are you sure you want to remove this product from the room?';
        break;
    }

    // Create a simple confirmation dialog
    if (confirm(message)) {
      console.log(`User confirmed deletion of ${type}`);
      switch (type) {
        case 'estimate':
          this.handleEstimateRemoval(estimateId);
          break;
        case 'room':
          this.handleRoomRemoval(estimateId, roomId);
          break;
        case 'product':
          this.handleProductRemoval(estimateId, roomId, productIndex);
          break;
      }
    }
  }

  /**
   * Load estimate selection form via AJAX
   * @returns {Promise} Promise that resolves when form is loaded
   */
  loadEstimateSelectionForm() {
    return new Promise((resolve, reject) => {
      if (!this.estimateSelectionForm) {
        reject(new Error('Estimate selection form container not found'));
        return;
      }

      // Show loading state
      this.showLoading();

      // Load form via AJAX
      jQuery.ajax({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'get_estimate_selection_form',
          nonce: productEstimatorVars.nonce
        },
        success: (response) => {
          if (response.success && response.data.html) {
            // Insert the HTML
            this.estimateSelectionForm.innerHTML = response.data.html;

            // Load data for the form
            this.loadEstimatesData();

            // Bind form events - this is critical
            this.bindEstimateSelectionFormEvents();

            resolve(response.data.html);
          } else {
            const error = new Error('Failed to load estimate selection form');
            console.error(error);
            reject(error);
          }
        },
        error: (error) => {
          console.error('Error loading estimate selection form:', error);
          reject(error);
        },
        complete: () => {
          this.hideLoading();
        }
      });
    });
  }

  /**
   * Add a dedicated method to bind form events
   */
  bindEstimateSelectionFormEvents() {
    console.log('Binding estimate selection form events');

    const form = this.estimateSelectionForm.querySelector('form');
    if (!form) {
      console.error('Cannot bind events - form not found in estimate selection form');
      return;
    }

    // Log what we're working with
    console.log('Form found:', form);

    // Remove existing event listeners to prevent duplication
    if (this._estimateFormSubmitHandler) {
      form.removeEventListener('submit', this._estimateFormSubmitHandler);
    }

    // Create and store the handler
    this._estimateFormSubmitHandler = (e) => {
      e.preventDefault();
      console.log('Estimate selection form submitted');
      this.handleEstimateSelection(form);
    };

    // Add the event listener
    form.addEventListener('submit', this._estimateFormSubmitHandler);

    // Handle create button
    const createButton = form.querySelector('#create-estimate-btn');
    if (createButton) {
      if (this._createEstimateHandler) {
        createButton.removeEventListener('click', this._createEstimateHandler);
      }

      this._createEstimateHandler = (e) => {
        console.log('Create estimate button clicked');
        this.showNewEstimateForm();
      };

      createButton.addEventListener('click', this._createEstimateHandler);
    }

    console.log('Form events bound successfully');
  }

  /**
   * Load estimates data for dropdowns
   */
  loadEstimatesData() {
    this.showLoading();

    this.dataService.getEstimatesData()
      .then(estimates => {
        // Update the estimates dropdown
        const dropdown = this.estimateSelectionForm.querySelector('#estimate-dropdown');
        if (!dropdown) {
          // Load the form template first
          this.loadEstimateSelectionForm()
            .then(() => this.populateEstimateDropdown(estimates))
            .catch(error => {
              this.log('Error loading estimate selection form:', error);
              this.showError('Error loading estimate selection form. Please try again.');
            })
            .finally(() => {
              this.hideLoading();
            });
          return;
        }

        this.populateEstimateDropdown(estimates);
        this.hideLoading();
      })
      .catch(error => {
        this.log('Error loading estimates data:', error);
        this.showError('Error loading estimates data. Please try again.');
        this.hideLoading();
      });
  }

  /**
   * Populate estimate dropdown with data
   * @param {Array} estimates - Array of estimate objects
   */
  populateEstimateDropdown(estimates) {
    // Find the dropdown in the form
    const dropdown = this.estimateSelectionForm ?
      this.estimateSelectionForm.querySelector('#estimate-dropdown') :
      null;

    if (!dropdown) {
      this.log('Estimate dropdown not found, cannot populate');
      return;
    }

    // Clear existing options
    dropdown.innerHTML = '';

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = productEstimatorVars.i18n.select_estimate || '-- Select an Estimate --';
    dropdown.appendChild(defaultOption);

    // Add estimate options
    if (Array.isArray(estimates)) {
      estimates.forEach(estimate => {
        if (estimate) {
          const roomCount = estimate.rooms ? Object.keys(estimate.rooms).length : 0;
          const roomText = roomCount === 1 ? '1 room' : `${roomCount} rooms`;

          const option = document.createElement('option');
          option.value = estimate.id;
          option.textContent = `${estimate.name || 'Unnamed Estimate'} (${roomText})`;
          dropdown.appendChild(option);
        }
      });
    }

    this.log(`Populated dropdown with ${estimates ? estimates.length : 0} estimates`);
  }

  /**
   * Show new estimate form
   */
  showNewEstimateForm() {
    if (this.estimatesList) this.estimatesList.style.display = 'none';
    if (this.estimateSelection) this.estimateSelection.style.display = 'none';

    // Ensure new estimate form exists
    if (!this.newEstimateForm) {
      console.error('New estimate form not found');
      return;
    }

    // Force visibility of the form
    this.forceElementVisibility(this.newEstimateForm);

    // Check if form content needs to be loaded
    if (!this.newEstimateForm.querySelector('form')) {
      this.loadNewEstimateForm();
    }
  }

  /**
   * Load new estimate form via AJAX
   * @returns {Promise} Promise that resolves when form is loaded
   */
  loadNewEstimateForm() {
    return new Promise((resolve, reject) => {
      // Show loading
      this.showLoading();

      // Load form via AJAX
      jQuery.ajax({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'get_new_estimate_form',
          nonce: productEstimatorVars.nonce
        },
        success: (response) => {
          if (response.success && response.data.html) {
            this.newEstimateForm.innerHTML = response.data.html;

            // Bind form events
            const form = this.newEstimateForm.querySelector('form');
            if (form) {
              form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewEstimateSubmission(form);
              });

              const cancelButton = form.querySelector('.cancel-btn');
              if (cancelButton) {
                cancelButton.addEventListener('click', () => {
                  this.cancelForm('estimate');
                });
              }
            }

            resolve(response.data.html);
          } else {
            reject(new Error('Failed to load new estimate form'));
          }
        },
        error: (error) => {
          console.error('Error loading new estimate form:', error);
          reject(error);
        },
        complete: () => {
          this.hideLoading();
        }
      });
    });
  }

  /**
   * Show new room form
   * @param {string} estimateId - Estimate ID
   */
  showNewRoomForm(estimateId) {
    console.log('Showing new room form for estimate:', estimateId);

    // Store the estimate ID with the form
    if (this.newRoomForm) {
      this.newRoomForm.dataset.estimateId = estimateId;

      // Also set it on the form element directly for redundancy
      const form = this.newRoomForm.querySelector('form');
      if (form) {
        form.dataset.estimateId = estimateId;
      }
    }

    // Hide other views
    if (this.estimatesList) this.estimatesList.style.display = 'none';
    if (this.estimateSelection) this.estimateSelection.style.display = 'none';
    if (this.roomSelectionForm) this.roomSelectionForm.style.display = 'none';

    // Force visibility of the form
    this.forceElementVisibility(this.newRoomForm);

    // Check if form content needs to be loaded
    if (!this.newRoomForm.querySelector('form')) {
      this.loadNewRoomForm(estimateId);
    } else {
      // Form already exists, make sure it has the right estimate ID
      const form = this.newRoomForm.querySelector('form');
      if (form) {
        form.dataset.estimateId = estimateId;
      }
    }
  }

  /**
   * Load new room form via AJAX
   * @param {string} estimateId - Estimate ID
   * @returns {Promise} Promise that resolves when form is loaded
   */
  loadNewRoomForm(estimateId) {
    return new Promise((resolve, reject) => {
      // Show loading
      this.showLoading();

      // Load form via AJAX
      jQuery.ajax({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'get_new_room_form',
          nonce: productEstimatorVars.nonce
        },
        success: (response) => {
          if (response.success && response.data.html) {
            // Insert form HTML
            this.newRoomForm.innerHTML = response.data.html;

            // HERE IS WHERE YOU ADD THE EVENT BINDING CODE:
            const form = this.newRoomForm.querySelector('form');
            if (form) {
              // Set estimate ID on the form
              form.dataset.estimateId = estimateId;

              // Remove any existing event handlers
              if (this._newRoomFormSubmitHandler) {
                form.removeEventListener('submit', this._newRoomFormSubmitHandler);
              }

              // Create new handler that PREVENTS DEFAULT
              this._newRoomFormSubmitHandler = (e) => {
                e.preventDefault(); // This is crucial to prevent page reload
                console.log('New room form submitted');
                this.handleNewRoomSubmission(form);
              };

              // Bind the handler
              form.addEventListener('submit', this._newRoomFormSubmitHandler);

              // Also bind cancel button
              const cancelButton = form.querySelector('.cancel-btn');
              if (cancelButton) {
                cancelButton.addEventListener('click', () => {
                  this.cancelForm('room');
                });
              }
            }

            resolve(response.data.html);
          } else {
            reject(new Error('Failed to load new room form'));
          }
        },
        error: (error) => {
          console.error('Error loading new room form:', error);
          reject(error);
        },
        complete: () => {
          this.hideLoading();
        }
      });
    });
  }

  bindEstimateListEventHandlers() {
    if (!this.estimatesList) {
      console.error('Cannot bind events - estimates list container not found');
      return;
    }

    // Remove any existing handlers
    if (this._addRoomButtonHandler) {
      this.estimatesList.removeEventListener('click', this._addRoomButtonHandler);
    }

    // Create a new handler function and store the reference
    this._addRoomButtonHandler = (e) => {
      const addRoomButton = e.target.closest('.add-room');
      if (addRoomButton) {
        e.preventDefault();
        e.stopPropagation();

        // Get estimate ID from data attribute
        const estimateId = addRoomButton.dataset.estimate;
        console.log('Add room button clicked for estimate:', estimateId);

        if (estimateId) {
          this.showNewRoomForm(estimateId);
        } else {
          console.error('No estimate ID found for add room button');
        }
      }
    };

    // Add the event listener to the estimates list
    this.estimatesList.addEventListener('click', this._addRoomButtonHandler);
    console.log('Add room button event handler bound');
  }


  /**
   * Bind room selection form events
   */
  bindRoomSelectionFormEvents() {
    console.log('Binding room selection form events');

    const form = this.roomSelectionForm.querySelector('form');
    if (!form) {
      console.error('Cannot bind events - form not found in room selection form');
      return;
    }

    console.log('Room selection form found:', form);

    // Remove existing event listeners to prevent duplication
    if (this._roomFormSubmitHandler) {
      form.removeEventListener('submit', this._roomFormSubmitHandler);
    }

    // Create and store the handler
    this._roomFormSubmitHandler = (e) => {
      e.preventDefault();
      console.log('Room selection form submitted');
      this.handleRoomSelection(form);
    };

    // Add the event listener
    form.addEventListener('submit', this._roomFormSubmitHandler);

    // Also bind the back button
    const backButton = form.querySelector('.back-btn');
    if (backButton) {
      if (this._backButtonHandler) {
        backButton.removeEventListener('click', this._backButtonHandler);
      }

      this._backButtonHandler = () => {
        console.log('Back button clicked');
        this.forceElementVisibility(this.estimateSelectionForm);
        this.forceElementVisibility(this.estimateSelection);
        this.roomSelectionForm.style.display = 'none';
      };

      backButton.addEventListener('click', this._backButtonHandler);
    }

    // Bind add new room button - CRITICAL FIX
    const addRoomButton = form.querySelector('#add-new-room-from-selection');
    if (addRoomButton) {
      if (this._addNewRoomHandler) {
        addRoomButton.removeEventListener('click', this._addNewRoomHandler);
      }

      this._addNewRoomHandler = () => {
        console.log('Add new room button clicked in form');
        const estimateId = this.roomSelectionForm.dataset.estimateId;
        console.log('Estimate ID for new room:', estimateId);

        if (estimateId) {
          this.showNewRoomForm(estimateId);
        } else {
          console.error('No estimate ID found for new room');
        }
      };

      addRoomButton.addEventListener('click', this._addNewRoomHandler);
      console.log('Add new room button handler bound');
    } else {
      console.warn('Add new room button not found in room selection form');
    }

    console.log('Room selection form events bound successfully');
  }

  /**
   * Update handleEstimateSelection to bind room selection form events
   */
  handleEstimateSelection(form) {
    const estimateId = form.querySelector('#estimate-dropdown').value;
    const productId = this.currentProductId;

    if (!estimateId) {
      this.showError('Please select an estimate');
      return;
    }

    this.showLoading();

    // Get rooms for the selected estimate
    this.dataService.getRoomsForEstimate(estimateId, productId)
      .then(response => {
        // Hide estimate selection form
        this.estimateSelectionForm.style.display = 'none';

        // If the estimate has rooms, show room selection form
        if (response.has_rooms) {
          // Populate room dropdown
          const roomDropdown = document.getElementById('room-dropdown');
          if (roomDropdown) {
            roomDropdown.innerHTML = '';
            roomDropdown.appendChild(new Option('-- Select a Room --', ''));

            response.rooms.forEach(room => {
              roomDropdown.appendChild(new Option(
                `${room.name} (${room.dimensions})`,
                room.id
              ));
            });

            // Store estimate ID with the form
            this.roomSelectionForm.dataset.estimateId = estimateId;

            // Also set the data-estimate attribute on the Add New Room button
            const addNewRoomButton = document.getElementById('add-new-room-from-selection');
            if (addNewRoomButton) {
              addNewRoomButton.dataset.estimate = estimateId;
            }

            // Show room selection form with force visibility
            this.forceElementVisibility(this.roomSelectionForm);

            // Important: Bind the room selection form events
            this.bindRoomSelectionFormEvents();
          } else {
            this.loadRoomSelectionForm(estimateId)
              .then(() => {
                this.roomSelectionForm.dataset.estimateId = estimateId;
                this.forceElementVisibility(this.roomSelectionForm);
                // Bind events after loading
                this.bindRoomSelectionFormEvents();
              })
              .catch(error => {
                this.log('Error loading room selection form:', error);
                this.showError('Error loading room selection form. Please try again.');
              });
          }
        } else {
          // No rooms, show new room form
          this.newRoomForm.dataset.estimateId = estimateId;
          this.newRoomForm.dataset.productId = productId;
          this.forceElementVisibility(this.newRoomForm);
        }
      })
      .catch(error => {
        this.log('Error getting rooms:', error);
        this.showError('Error getting rooms. Please try again.');
      })
      .finally(() => {
        this.hideLoading();
      });
  }

  /**
   * Load room selection form content
   */
  loadRoomSelectionForm(estimateId) {
    return new Promise((resolve, reject) => {
      if (!this.roomSelectionForm) {
        reject(new Error('Room selection form container not found'));
        return;
      }

      // Show loading state
      this.showLoading();

      // Load form via AJAX
      jQuery.ajax({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'get_room_selection_form',
          nonce: productEstimatorVars.nonce,
          estimate_id: estimateId
        },
        success: (response) => {
          if (response.success && response.data.html) {
            // Insert the HTML
            this.roomSelectionForm.innerHTML = response.data.html;

            // Set estimate ID
            this.roomSelectionForm.dataset.estimateId = estimateId;

            // Bind form events
            this.bindRoomSelectionFormEvents();

            resolve(response.data.html);
          } else {
            const error = new Error('Failed to load room selection form');
            console.error(error);
            reject(error);
          }
        },
        error: (error) => {
          console.error('Error loading room selection form:', error);
          reject(error);
        },
        complete: () => {
          this.hideLoading();
        }
      });
    });
  }

  /**
   * Handle room selection form submission
   * @param {HTMLFormElement} form - The submitted form
   */
  handleRoomSelection(form) {
    // Force room ID to string to ensure consistency
    const roomId = String(form.querySelector('#room-dropdown').value || '0');
    const productId = this.currentProductId;

    if (!roomId) {
      this.showError('Please select a room');
      return;
    }

    this.showLoading();

    this.dataService.addProductToRoom(roomId, productId)
      .then(response => {
        // Hide selection forms
        this.estimateSelection.style.display = 'none';
        this.roomSelectionForm.style.display = 'none';

        // Clear the product ID from the modal after successful addition
        delete this.modal.dataset.productId;
        this.currentProductId = null;

        // Refresh estimates list and show it
        this.loadEstimatesList()
          .then(() => {
            // After refreshing the list, find and expand the room
            const roomElement = this.modal.querySelector(`.accordion-item[data-room-id="${roomId}"]`);
            if (roomElement) {
              // Make sure the room is expanded
              const header = roomElement.querySelector('.accordion-header');
              if (header) {
                header.classList.add('active');
                const content = roomElement.querySelector('.accordion-content');
                if (content) content.style.display = 'block';
              }

              // Scroll to the room to ensure it's visible
              roomElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // After refreshing the list, check if we should show suggestions
            const estimateId = this.roomSelectionForm.dataset.estimateId;
            if (estimateId) {
              this.updateSuggestionVisibility(estimateId, roomId);
            }

            // Show success message
            this.showMessage('Product added successfully!', 'success');
          })
          .catch(error => {
            this.log('Error refreshing estimates list:', error);
            this.showError('Error refreshing estimates list. Please try again.');
          });
      })
      .catch(error => {
        this.log('Error adding product to room:', error);
        this.showError(error.message || 'Error adding product to room. Please try again.');
      })
      .finally(() => {
        this.hideLoading();
      });
  }

  /**
   * Handle new estimate form submission
   * @param {HTMLFormElement} form - The submitted form
   */
  handleNewEstimateSubmission(form) {
    const formData = new FormData(form);
    const productId = this.currentProductId;

    this.showLoading();

    // Use console.log to debug the process
    console.log('Submitting new estimate form');

    this.dataService.addNewEstimate(formData, productId)
      .then(response => {
        // Check that we got a valid estimate_id
        console.log('New estimate created with ID:', response.estimate_id);

        // Clear form
        form.reset();

        // Hide new estimate form
        this.newEstimateForm.style.display = 'none';

        if (productId) {
          // Show new room form for the new estimate
          // THIS IS THE KEY PART - we need to properly pass the new estimate ID
          const newEstimateId = response.estimate_id;

          console.log('Setting new room form with estimate ID:', newEstimateId);

          // Set on container element
          this.newRoomForm.dataset.estimateId = newEstimateId;

          // Also ensure it's set on the actual form element
          const roomForm = this.newRoomForm.querySelector('form');
          if (roomForm) {
            roomForm.dataset.estimateId = newEstimateId;
            console.log('Form dataset updated:', roomForm.dataset);
          } else {
            console.error('Could not find room form element');
          }

          this.newRoomForm.dataset.productId = productId;
          this.forceElementVisibility(this.newRoomForm);
        } else {
          // Just refresh the estimates list
          this.loadEstimatesList()
            .catch(error => {
              this.log('Error refreshing estimates list:', error);
              this.showError('Error refreshing estimates list. Please try again.');
            });
        }
      })
      .catch(error => {
        this.log('Error creating estimate:', error);
        this.showError(error.message || 'Error creating estimate. Please try again.');
      })
      .finally(() => {
        this.hideLoading();
      });
  }

  /**
   * Handle new room form submission via AJAX
   * @param {HTMLFormElement} form - The submitted form
   * @param {Event} event - The form submission event
   */
  handleNewRoomSubmission(form, event) {
    console.log('Processing new room form submission via AJAX');

    // Prevent default form submission which would cause page reload
    if (event) {
      event.preventDefault();
    } else {
      // This is for backward compatibility
      if (typeof window.event !== 'undefined') {
        window.event.preventDefault();
      }
    }

    // Check form validity
    if (!form.checkValidity()) {
      console.error('Form validation failed');
      form.reportValidity();
      return;
    }

    // Get the estimate ID directly from the form's dataset
    const formData = new FormData(form);
    const estimateId = form.dataset.estimateId;
    const productId = this.currentProductId || form.dataset.productId;

    // Log the full state for debugging
    console.log('Room form submission data:', {
      formElement: form,
      formDataset: form.dataset,
      containerDataset: this.newRoomForm.dataset,
      estimateId: estimateId,
      productId: productId,
      formData: Object.fromEntries(formData)
    });

    if (!estimateId) {
      this.showError('No estimate selected for this room.');
      console.error('Missing estimate ID for room submission');
      return;
    }

    this.showLoading();

    // Add a specific log message for the AJAX submission
    console.log('Submitting room for estimate ID:', estimateId);

    // Use jQuery AJAX to submit the form data
    jQuery.ajax({
      url: productEstimatorVars.ajax_url,
      type: 'POST',
      data: {
        action: 'add_new_room',
        nonce: productEstimatorVars.nonce,
        estimate_id: estimateId,
        product_id: productId || '',
        form_data: jQuery(form).serialize()
      },
      success: (response) => {
        if (response.success) {
          console.log('Room added successfully:', response.data);

          // Clear form
          form.reset();

          // Hide new room form
          this.newRoomForm.style.display = 'none';

          // Clear the product ID from the modal after successful addition
          delete this.modal.dataset.productId;
          this.currentProductId = null;

          // Refresh the estimates list to show the new room
          this.loadEstimatesList()
            .then(() => {
              // If we had a room ID in the response, find and expand it
              if (response.data.room_id) {
                const roomElement = this.modal.querySelector(`.accordion-item[data-room-id="${response.data.room_id}"]`);
                if (roomElement) {
                  const header = roomElement.querySelector('.accordion-header');
                  if (header) {
                    header.classList.add('active');
                    const content = roomElement.querySelector('.accordion-content');
                    if (content) content.style.display = 'block';
                  }

                  // Scroll to the room to ensure it's visible
                  roomElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }

              // Show success message
              this.showMessage('Room added successfully!', 'success');
            })
            .catch(error => {
              console.error('Error refreshing estimates list:', error);
              this.showError('Error refreshing estimates list. Please try again.');
            });
        } else {
          // Handle error response
          console.error('Error adding room:', response.data.message);
          this.showError(response.data.message || 'Error adding room. Please try again.');
        }
      },
      error: (jqXHR, textStatus, errorThrown) => {
        console.error('AJAX error:', textStatus, errorThrown);
        this.showError('Error adding room. Please try again.');
      },
      complete: () => {
        this.hideLoading();
      }
    });
  }


  /**
   * Cancel a form and return to previous view
   * @param {string} formType - Form type ('estimate' or 'room')
   */
  cancelForm(formType) {
    switch (formType) {
      case 'estimate':
        this.newEstimateForm.style.display = 'none';

        // If we have a product ID, go back to estimate selection if estimates exist
        if (this.currentProductId) {
          this.dataService.checkEstimatesExist()
            .then(hasEstimates => {
              if (hasEstimates) {
                this.forceElementVisibility(this.estimateSelectionForm);
                this.forceElementVisibility(this.estimateSelection);
              } else {
                this.forceElementVisibility(this.estimatesList);
              }
            })
            .catch(() => {
              // On error, just show the estimates list
              this.forceElementVisibility(this.estimatesList);
            });
        } else {
          this.forceElementVisibility(this.estimatesList);
        }
        break;
      case 'room':
        this.newRoomForm.style.display = 'none';

        // If we have a product ID and came from room selection
        if (this.currentProductId && this.roomSelectionForm.dataset.estimateId) {
          this.forceElementVisibility(this.roomSelectionForm);
          this.forceElementVisibility(this.estimateSelection);
        } else {
          this.forceElementVisibility(this.estimatesList);
        }
        break;
    }
  }

  /**
   * Initialize accordion functionality for rooms with duplicate prevention
   */
  initializeAccordions() {
    if (!this.modal) {
      console.error('[ModalManager] Modal not available for initializing accordions');
      return;
    }

    // Remove any existing event listener with same function
    if (this.accordionHandler) {
      this.estimatesList.removeEventListener('click', this.accordionHandler);
    }

    // Create a new handler function and store reference for later removal
    this.accordionHandler = (e) => {
      const header = e.target.closest('.accordion-header');
      if (header) {
        e.preventDefault();
        e.stopPropagation();
        this.log('Accordion header clicked via delegation');
        this.toggleAccordionItem(header);
      }
    };

    // Add the event listener to the estimates list container
    if (this.estimatesList) {
      this.estimatesList.addEventListener('click', this.accordionHandler);
      this.log('Accordion event handler (re)attached');
    }
  }

  /**
   * Toggle accordion item expansion
   * @param {HTMLElement} header - The accordion header element
   */
  toggleAccordionItem(header) {
    this.log('Toggling accordion item');

    // Toggle active class on header
    header.classList.toggle('active');

    // Find the accordion content
    const accordionItem = header.closest('.accordion-item');
    if (!accordionItem) {
      this.log('No parent accordion item found');
      return;
    }

    const content = accordionItem.querySelector('.accordion-content');
    if (!content) {
      this.log('No accordion content found');
      return;
    }

    // Toggle display of content
    if (header.classList.contains('active')) {
      this.log('Opening accordion content');
      content.style.display = 'block';
    } else {
      this.log('Closing accordion content');
      content.style.display = 'none';
    }
  }

  /**
   * Initialize jQuery fallback for accordions
   */
  initializeJQueryAccordions() {
    if (typeof jQuery === 'undefined') {
      this.log('jQuery not available for fallback');
      return;
    }

    // Unbind existing handlers before adding new ones
    jQuery(document).off('click', '.accordion-header');

    jQuery(document).on('click', '.accordion-header', function(e) {
      e.preventDefault();
      e.stopPropagation();

      console.log('jQuery accordion handler triggered');

      const $header = jQuery(this);
      $header.toggleClass('active');

      const $content = $header.closest('.accordion-item').find('.accordion-content');
      if ($content.length) {
        if ($header.hasClass('active')) {
          $content.slideDown(200);
        } else {
          $content.slideUp(200);
        }
      }
    });
  }

  /**
   * Update the estimates list view
   * This is called after loading the estimates list
   */
  updateEstimatesList() {
    // Check if there are any estimates
    const hasEstimates = !!this.modal.querySelector('.estimate-section');

    // If no estimates, add create button
    if (!hasEstimates) {
      const noEstimatesDiv = document.createElement('div');
      noEstimatesDiv.className = 'no-estimates';
      noEstimatesDiv.innerHTML = `
        <p>${this.config.i18n.no_estimates || 'You don\'t have any estimates yet.'}</p>
        <button id="create-estimate-btn" class="button">
          ${this.config.i18n.create_estimate || 'Create New Estimate'}
        </button>
      `;

      this.estimatesList.appendChild(noEstimatesDiv);
    }

    // Update all suggestions visibility
    this.updateAllSuggestionsVisibility();
  }

  /**
   * Update suggestion visibility based on room contents
   * @param {string} estimateId - Estimate ID
   * @param {string} roomId - Room ID
   */
  updateSuggestionVisibility(estimateId, roomId) {
    // Find the room element
    const roomElement = this.modal.querySelector(`.accordion-item[data-room-id="${roomId}"]`);
    if (!roomElement) return;

    // Check if this room has any products
    const hasProducts = roomElement.querySelectorAll('.product-item:not(.product-note-item)').length > 0;

    // Find the product suggestions section
    const suggestions = roomElement.querySelector('.product-suggestions');
    if (!suggestions) return;

    // Toggle visibility based on whether there are products in the room
    suggestions.style.display = hasProducts ? 'block' : 'none';
  }

  /**
   * Update visibility of suggestions for all rooms
   */
  updateAllSuggestionsVisibility() {
    const rooms = this.modal.querySelectorAll('.accordion-item');

    rooms.forEach(room => {
      const roomId = room.dataset.roomId;
      const estimateId = room.closest('.estimate-section')?.dataset.estimateId;

      if (!roomId || !estimateId) return;

      // Check if this room has any products (excluding note items)
      const hasProducts = room.querySelectorAll('.product-item:not(.product-note-item)').length > 0;

      // Find the product suggestions section
      const suggestions = room.querySelector('.product-suggestions');
      if (!suggestions) return;

      // Toggle visibility based on whether there are products in the room
      suggestions.style.display = hasProducts ? 'block' : 'none';
    });
  }

  /**
   * Show a message to the user
   * @param {string} message - The message to display
   * @param {string} type - Message type ('success' or 'error')
   */
  showMessage(message, type = 'success') {
    // Remove any existing messages
    const existingMessages = this.modal.querySelectorAll('.modal-message');
    existingMessages.forEach(msg => msg.remove());

    // Create message element
    const messageClass = type === 'error' ? 'modal-error-message' : 'modal-success-message';
    const messageEl = document.createElement('div');
    messageEl.className = `modal-message ${messageClass}`;
    messageEl.textContent = message;

    // Add to modal container
    this.contentContainer.prepend(messageEl);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      messageEl.remove();
    }, 5000);
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    this.showMessage(message, 'error');
  }

  /**
   * Show loading overlay
   */
  showLoading() {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = 'flex';
    } else {
      this.log('Loading indicator not available');
    }
  }

  /**
   * Hide loading overlay
   */
  hideLoading() {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = 'none';
    }
  }

  /**
   * Register an event handler
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @returns {ModalManager} - This instance for chaining
   */
  on(event, callback) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(callback);
    return this;
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   * @returns {ModalManager} - This instance for chaining
   */
  emit(event, data) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(callback => callback(data));
    }
    return this;
  }

  /**
   * Diagnostic function to check for duplicate elements
   */
  checkModalElements() {
    console.group('🔍 MODAL ELEMENTS CHECK');

    // Check for duplicates
    const checkElement = (selector, name) => {
      const elements = document.querySelectorAll(selector);
      console.log(`${name}: ${elements.length} elements found`);
      return elements.length;
    };

    checkElement('#product-estimator-modal', 'Modal container');
    checkElement('.product-estimator-modal-form-container', 'Form container');
    checkElement('#estimates', 'Estimates list');
    checkElement('#estimate-selection-wrapper', 'Estimate selection');
    checkElement('#estimate-selection-form-wrapper', 'Estimate selection form');
    checkElement('#new-estimate-form-wrapper', 'New estimate form');

    // Check our specific element's visibility
    const estimateSelection = document.querySelector('#estimate-selection-wrapper');
    if (estimateSelection) {
      console.log('Estimate selection container:', {
        display: estimateSelection.style.display,
        computedDisplay: window.getComputedStyle(estimateSelection).display,
        visibility: window.getComputedStyle(estimateSelection).visibility,
        opacity: window.getComputedStyle(estimateSelection).opacity,
        parent: estimateSelection.parentElement ? estimateSelection.parentElement.tagName : 'none'
      });
    } else {
      console.warn('Estimate selection container not found');
    }

    console.groupEnd();
  }

  /**
   * Log debug messages
   * @param {...any} args - Arguments to log
   */
  log(...args) {
    if (this.config.debug) {
      console.log('[ModalManager]', ...args);
    }
  }
}

// Export the class
export default ModalManager;
