/**
 * ModalManager.js
 *
 * Handles all modal operations for the Product Estimator plugin.
 * This is the single source of truth for modal operations.
 */
import { dom, ajax, format, log } from '@utils';
import ConfirmationDialog from './ConfirmationDialog';
import { initSuggestionsCarousels, initCarouselOnAccordionOpen } from './SuggestionsCarousel';

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
      log('ModalManager', 'ModalManager already initialized');
      return;
    }

    // Find the existing modal in the DOM
    this.modal = document.querySelector(this.config.selectors.modalContainer);

    if (!this.modal) {
      log('ModalManager', 'Warning: Modal element not found in DOM. The PHP partial may not be included.');
      // Don't attempt to create it - the partial should be included by PHP
    } else {
      log('ModalManager', 'Found existing modal in DOM, initializing elements');
    }

    // Initialize modal elements if modal exists
    if (this.modal) {
      this.initializeElements();
      this.bindEvents();

      // Install the loader safety system
      this.setupLoaderSafety();

      // Hide any loading indicators that might be visible
      setTimeout(() => {
        this.ensureLoaderHidden();
      }, 500);
    }

    // Initialize jQuery fallback
    this.initializeJQueryAccordions();

    this.initialized = true;
    log('ModalManager', 'ModalManager initialized');
  }

  /**
   * Initialize modal elements - with loading indicator fix
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

    // Create loading indicator if it doesn't exist
    if (!this.loadingIndicator) {
      console.warn('[ModalManager] Loading indicator not found, creating one');
      this.loadingIndicator = dom.createElement('div', {
        className: 'product-estimator-modal-loading'
      }, [
        dom.createElement('div', { className: 'loading-spinner' }),
        dom.createElement('div', {
          className: 'loading-text',
          textContent: this.config.i18n.loading || 'Loading...'
        })
      ]);

      this.modal.appendChild(this.loadingIndicator);
    }

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
      this.estimateSelection = dom.createElement('div', {
        id: 'estimate-selection-wrapper'
      });
      this.contentContainer.appendChild(this.estimateSelection);

      // Also create the form wrapper
      if (!this.estimateSelectionForm) {
        this.estimateSelectionForm = dom.createElement('div', {
          id: 'estimate-selection-form-wrapper'
        });
        this.estimateSelection.appendChild(this.estimateSelectionForm);
      }
    }

    // Create any missing form containers to prevent errors
    if (!this.roomSelectionForm && this.contentContainer) {
      console.warn('Creating room selection form container');
      this.roomSelectionForm = dom.createElement('div', {
        id: 'room-selection-form-wrapper',
        style: { display: 'none' }
      });
      this.contentContainer.appendChild(this.roomSelectionForm);
    }

    // Bind events to any existing forms
    this.bindExistingForms();
  }

  /**
   * Show loading overlay - with error handling
   */
  showLoading() {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = 'flex';
    } else {
      console.warn('Loading indicator not available - creating one');
      // Try to initialize a loading indicator
      if (this.modal) {
        const loadingIndicator = dom.createElement('div', {
          className: 'product-estimator-modal-loading',
          style: { display: 'flex' }
        }, [
          dom.createElement('div', { className: 'loading-spinner' }),
          dom.createElement('div', {
            className: 'loading-text',
            textContent: this.config.i18n.loading || 'Loading...'
          })
        ]);

        this.modal.appendChild(loadingIndicator);
        this.loadingIndicator = loadingIndicator;
      } else {
        console.error('Cannot create loading indicator - modal not available');
      }
    }
  }

  /**
   * Hide loading overlay with timeout tracking reset
   */
  hideLoading() {
    // Reset loading start time
    this.loadingStartTime = 0;

    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = 'none';

      // Log operation for tracking
      console.log('Loading indicator hidden at:', new Date().toISOString());
    } else {
      console.warn('Loading indicator not available during hide operation');
    }
  }

  initializeCarousels() {
    console.log('Initializing carousels in modal');

    // Find all carousel containers in the modal (both suggestions and similar products)
    const carouselContainers = this.modal.querySelectorAll('.suggestions-carousel');

    if (carouselContainers.length > 0) {
      console.log(`Found ${carouselContainers.length} carousel containers in modal`);

      // Count each type for better debugging
      const suggestionCarousels = this.modal.querySelectorAll('.product-suggestions .suggestions-carousel').length;
      const similarProductCarousels = this.modal.querySelectorAll('.product-similar-products .suggestions-carousel').length;

      console.log(`Carousel types: ${suggestionCarousels} suggestion carousels, ${similarProductCarousels} similar product carousels`);

      // Initialize all carousels
      initSuggestionsCarousels();
    } else {
      console.log('No carousel containers found in modal');
    }
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
      log('ModalManager', 'Modal element not available, cannot bind events');
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
        log('ModalManager', 'Close button clicked');
        this.closeModal();
      }

      // Overlay click handler
      if (e.target.classList.contains('product-estimator-modal-overlay')) {
        e.preventDefault();
        e.stopPropagation();
        log('ModalManager', 'Overlay clicked');
        this.closeModal();
      }
    };

    this.modal.addEventListener('click', this._modalClickHandler);

    // Escape key to close modal
    const escHandler = (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        log('ModalManager', 'Escape key pressed');
        this.closeModal();
      }
    };

    // Remove any existing handler before adding
    document.removeEventListener('keydown', this.escKeyHandler);
    document.addEventListener('keydown', escHandler);
    this.escKeyHandler = escHandler;

    log('ModalManager', 'Modal events bound');
  }

  /**
   * Open the modal with corrected loading handling
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
            // IMPORTANT: Hide the loading indicator when showing the form
            this.hideLoading();
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

      // Ensure the estimates list is visible and other views are hidden
      if (this.estimatesList) {
        this.estimatesList.style.display = 'block';
      }

      if (this.estimateSelection) {
        this.estimateSelection.style.display = 'none';
      }

      if (this.newEstimateForm) {
        this.newEstimateForm.style.display = 'none';
      }

      if (this.newRoomForm) {
        this.newRoomForm.style.display = 'none';
      }

      // Show estimates list
      this.loadEstimatesList()
        .then(() => {
          // Find and ensure the create estimate button has correct event handler
          const createButton = this.modal.querySelector('#create-estimate-btn');
          if (createButton) {
            // Remove existing handlers
            if (this._createEstimateBtnHandler) {
              createButton.removeEventListener('click', this._createEstimateBtnHandler);
            }

            // Create and store new handler
            this._createEstimateBtnHandler = () => {
              this.showNewEstimateForm();
            };

            // Add the handler
            createButton.addEventListener('click', this._createEstimateBtnHandler);
            console.log('Updated event handler for list view create estimate button');
          }
        })
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
    dom.forceElementVisibility(this.estimateSelection);

    // Ensure the form is also visible
    if (this.estimateSelectionForm) {
      dom.forceElementVisibility(this.estimateSelectionForm);
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
   * Override the original closeModal to ensure loader is hidden
   */
  closeModal() {
    if (!this.isOpen) return;

    if (this.modal) {
      this.modal.style.display = 'none';
      delete this.modal.dataset.productId;
    } else {
      log('ModalManager', 'Cannot close modal - element not found');
      return;
    }

    // Make sure loading indicator is hidden
    this.ensureLoaderHidden();

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
   * Add method to attach a global loader timeout checker
   */
  setupLoaderSafety() {
    // Set up a periodic check to ensure the loader doesn't get stuck
    setInterval(() => {
      if (this.isOpen && this.loadingIndicator &&
        window.getComputedStyle(this.loadingIndicator).display !== 'none') {
        // Check if the loader has been visible for too long (more than 10 seconds)
        const loaderStartTime = this.loadingStartTime || 0;
        const currentTime = new Date().getTime();

        if (loaderStartTime && (currentTime - loaderStartTime > 10000)) {
          console.warn('Loading indicator has been visible for more than 10 seconds, hiding it.');
          this.hideLoading();
          this.showError('The operation is taking longer than expected or may have failed silently.');
        }
      }
    }, 2000); // Check every 2 seconds

    // Track when loading starts
    const originalShowLoading = this.showLoading;
    this.showLoading = () => {
      this.loadingStartTime = new Date().getTime();
      return originalShowLoading.call(this);
    };

    // Reset tracking when loading ends
    const originalHideLoading = this.hideLoading;
    this.hideLoading = () => {
      this.loadingStartTime = 0;
      return originalHideLoading.call(this);
    };

    console.log('Loader safety system installed');
  }

  /**
   * Global method to ensure loading indicator is hidden
   * This can be called from multiple places as a safety measure
   */
  ensureLoaderHidden() {
    // Check if we have a loader that's currently visible
    if (this.loadingIndicator &&
      window.getComputedStyle(this.loadingIndicator).display !== 'none') {
      console.log('Force hiding loader that was left visible');
      this.hideLoading();
    }

    // Also check for any other loading indicators that might exist
    const allLoaders = document.querySelectorAll('.product-estimator-modal-loading');
    if (allLoaders.length > 1) {
      console.warn(`Found ${allLoaders.length} loading indicators, cleaning up duplicates`);
      // Keep only the first one, remove others
      for (let i = 1; i < allLoaders.length; i++) {
        allLoaders[i].remove();
      }
    }

    // Set all loaders to hidden
    allLoaders.forEach(loader => {
      loader.style.display = 'none';
    });
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
   * Load the estimates list with improved multi-estimate expansion
   * @param {string|null} expandRoomId - Optional room ID to expand after loading
   * @param {string|null} expandEstimateId - Optional estimate ID containing the room
   * @returns {Promise} Promise that resolves when the list is loaded
   */
  loadEstimatesList(expandRoomId = null, expandEstimateId = null) {
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

      // Log expansion parameters
      console.log(`Loading estimates list with expansion params - Room: ${expandRoomId}, Estimate: ${expandEstimateId}`);

      // Use our ajax utility for AJAX requests
      ajax.ajaxRequest({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'get_estimates_list',
          nonce: productEstimatorVars.nonce
        }
      })
        .then(data => {
          if (data.html) {
            // Insert the HTML into the container
            this.estimatesList.innerHTML = data.html;

            // Initialize accordions with a slight delay to ensure DOM is updated
            setTimeout(() => {
              // Update estimate-specific data attributes if needed
              if (expandEstimateId) {
                const estimateSection = this.modal.querySelector(`.estimate-section[data-estimate-id="${expandEstimateId}"]`);
                if (!estimateSection) {
                  // Add data-estimate-id to estimate sections that don't have it
                  const estimateSections = this.modal.querySelectorAll('.estimate-section');
                  console.log(`Adding missing data-estimate-id attributes to ${estimateSections.length} estimates`);

                  // Find sections that match our estimate ID by other means
                  estimateSections.forEach((section, index) => {
                    if (!section.dataset.estimateId) {
                      // Get estimate ID from the section's remove button if available
                      const removeButton = section.querySelector('.remove-estimate');
                      if (removeButton && removeButton.dataset.estimateId) {
                        section.dataset.estimateId = removeButton.dataset.estimateId;
                        console.log(`Added estimate ID ${removeButton.dataset.estimateId} to section`);
                      } else {
                        // Fallback: add sequential IDs
                        section.dataset.estimateId = String(index);
                        console.log(`Added fallback estimate ID ${index} to section`);
                      }
                    }
                  });
                }
              }

              // Initialize accordions with a slight delay to ensure DOM is updated
              setTimeout(() => {
                this.updateEstimatesList(expandRoomId, expandEstimateId);
              }, 150);

              this.initializeAccordions(expandRoomId, expandEstimateId);

              // Bind all the necessary event handlers
              this.bindProductRemovalEvents();
              this.bindRoomRemovalEvents();
              this.bindEstimateRemovalEvents();
              this.bindEstimateListEventHandlers();

              initCarouselOnAccordionOpen();
              this.initializeCarousels();

              // Also bind the suggested product buttons
              this.bindSuggestedProductButtons();
            }, 150); // Increased delay for more reliability

            resolve(data.html);
          } else {
            const error = new Error('Failed to load estimates list');
            console.error(error);
            reject(error);
          }
        })
        .catch(error => {
          console.error('Error loading estimates list:', error);
          reject(error);
        })
        .finally(() => {
          this.hideLoading();
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

    console.log(`Removing product at index ${productIndex} from room ${roomId} in estimate ${estimateId}`);

    this.dataService.removeProductFromRoom(estimateId, roomId, productIndex)
      .then(response => {
        // Call loadEstimatesList with the IDs to expand
        return this.loadEstimatesList(roomId, estimateId)
          .then(() => {
            console.log(`Estimates list refreshed, attempting to expand room ${roomId} in estimate ${estimateId}`);

            // Ensure the estimate section is expanded
            const estimateSection = this.modal.querySelector(`.estimate-section[data-estimate-id="${estimateId}"]`);
            if (estimateSection) {
              estimateSection.classList.remove('collapsed');
              const estimateContent = estimateSection.querySelector('.estimate-content');
              if (estimateContent) {
                estimateContent.style.display = 'block';
              }
            }

            // Find the specific room that needs to be expanded
            let roomElement = this.modal.querySelector(`.accordion-item[data-room-id="${roomId}"][data-estimate-id="${estimateId}"]`);
            if (!roomElement) {
              // Try a more general selector if the specific one fails
              console.log('Using fallback room selector');
              roomElement = this.modal.querySelector(`.accordion-item[data-room-id="${roomId}"]`);
            }

            if (roomElement) {
              console.log('Found room element, expanding it');
              const header = roomElement.querySelector('.accordion-header');
              const content = roomElement.querySelector('.accordion-content');

              if (header) header.classList.add('active');
              if (content) content.style.display = 'block';

              // Scroll to the room to ensure it's visible
              setTimeout(() => {
                roomElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 200);
            } else {
              console.warn(`Could not find room element for room ID ${roomId}`);
            }

            // Show success message
            this.showMessage('Product removed successfully', 'success');
          });
      })
      .catch(error => {
        console.error('Error removing product:', error);
        this.showError(error.message || 'Error removing product. Please try again.');
      })
      .finally(() => {
        this.hideLoading();
      });
  }

  handleAddSuggestedProduct(productId, estimateId, roomId, buttonElement) {
    // Show loading indicator
    this.showLoading();

    // Show loading state on the button
    if (buttonElement) {
      buttonElement.disabled = true;
      buttonElement.classList.add('loading');
      buttonElement.innerHTML = '<span class="loading-dots">Adding...</span>';
    }

    console.log(`Adding suggested product ${productId} to room ${roomId} in estimate ${estimateId}`);

    // Use AJAX utility for the request
    ajax.ajaxRequest({
      url: productEstimatorVars.ajax_url,
      type: 'POST',
      data: {
        action: 'add_product_to_room',
        nonce: productEstimatorVars.nonce,
        product_id: productId,
        room_id: roomId,
        estimate_id: estimateId
      }
    })
      .then(data => {
        console.log('Add suggested product response:', data);

        // Refresh the estimates list to show the updated room
        this.loadEstimatesList(roomId, estimateId)
          .then(() => {
            // Auto-expand the room accordion after refreshing
            setTimeout(() => {
              const roomAccordion = this.modal.querySelector(`.accordion-item[data-room-id="${roomId}"]`);
              if (roomAccordion) {
                const header = roomAccordion.querySelector('.accordion-header');
                if (header && !header.classList.contains('active')) {
                  header.click();
                }
              }
            }, 300);

            // Show success message
            this.showMessage('Product added successfully!', 'success');
          })
          .catch(error => {
            console.error('Error refreshing estimates list:', error);
            this.showError('Error refreshing list. Please try again.');
          });
      })
      .catch(error => {
        // Check if this is a duplicate product error (using error.data that our ajax utility preserves)
        if (error.data?.duplicate) {
          console.log('Duplicate suggested product detected:', error.data);

          // Show specific error message
          this.showMessage(error.data.message || 'This product already exists in this room.', 'error');
        } else {
          // Handle generic error
          console.error('AJAX error:', error);
          this.showError('Error adding product. Please try again.');
        }
      })
      .finally(() => {
        // Reset button state
        if (buttonElement) {
          buttonElement.disabled = false;
          buttonElement.classList.remove('loading');
          buttonElement.textContent = 'Add';
        }

        // Hide loading
        this.hideLoading();
      });
  }

  bindSuggestedProductButtons() {
    console.log('Binding suggested product buttons');

    // Find all suggestion buttons in the modal
    const suggestionButtons = this.modal.querySelectorAll('.add-suggestion-to-room');

    if (suggestionButtons.length) {
      console.log(`Found ${suggestionButtons.length} suggestion buttons to bind`);

      // Loop through each button and bind click event
      suggestionButtons.forEach(button => {
        // Remove any existing handlers to prevent duplicates
        // Store handler reference directly on the button element for easy removal
        if (button._suggestionButtonHandler) {
          button.removeEventListener('click', button._suggestionButtonHandler);
        }

        // Create and store new handler directly on button element
        button._suggestionButtonHandler = (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Get data attributes
          const productId = button.dataset.productId;
          const estimateId = button.dataset.estimateId;
          const roomId = button.dataset.roomId;

          console.log('Add suggestion button clicked:', {
            productId,
            estimateId,
            roomId
          });

          // Handle adding the suggested product
          if (productId && estimateId && roomId) {
            this.handleAddSuggestedProduct(productId, estimateId, roomId, button);
          } else {
            console.error('Missing required data attributes for adding suggested product');
          }
        };

        // Add click event listener
        button.addEventListener('click', button._suggestionButtonHandler);
      });

      console.log('Suggestion buttons bound successfully');
    } else {
      console.log('No suggestion buttons found to bind');
    }
  }

  /**
   * Handle room removal
   * @param {string} estimateId - Estimate ID
   * @param {string} roomId - Room ID
   */
  handleRoomRemoval(estimateId, roomId) {
    // Find the room element before removal for better UI handling
    const roomElement = this.modal.querySelector(`.accordion-item[data-room-id="${roomId}"]`);
    const roomName = roomElement ? roomElement.querySelector('.room-name')?.textContent || 'room' : 'room';

    this.showLoading();

    // Log the exact parameters being sent
    console.log('Removing room with parameters:', {
      estimate_id: estimateId,
      room_id: roomId
    });

    this.dataService.removeRoom(estimateId, roomId)
      .then((response) => {
        console.log('Room removal response:', response);

        // Refresh estimates list
        this.loadEstimatesList(null, estimateId)
          .then(() => {
            // Show success message
            this.showMessage(`${roomName} removed successfully`, 'success');

            // If the estimate has no rooms left, it might need special handling
            if (response.has_rooms === false) {
              console.log('Estimate has no rooms left after removal');

              // You might want to highlight the "Add New Room" button or similar
              const addRoomBtn = this.modal.querySelector(`.estimate-section[data-estimate-id="${estimateId}"] .add-room`);
              if (addRoomBtn) {
                // Briefly highlight the button
                addRoomBtn.classList.add('highlight-btn');
                setTimeout(() => {
                  addRoomBtn.classList.remove('highlight-btn');
                }, 2000);
              }
            }
          })
          .catch(error => {
            log('ModalManager', 'Error refreshing estimates list:', error);
            this.showError('Error refreshing estimates list. Please try again.');
          });
      })
      .catch(error => {
        log('ModalManager', 'Error removing room:', error);
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
            log('ModalManager', 'Error refreshing estimates list:', error);
            this.showError('Error refreshing estimates list. Please try again.');
          });
      })
      .catch(error => {
        log('ModalManager', 'Error removing estimate:', error);
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
   * Replace your existing confirmDelete method with this updated version
   * that uses the custom confirmation dialog
   */
  confirmDelete(type, estimateId, roomId, productIndex) {
    // Get text from localized strings if available
    const i18n = window.productEstimatorVars?.i18n || {};
    const dialogTitles = i18n.dialog_titles || {};
    const dialogMessages = i18n.dialog_messages || {};

    // Set default values
    let title = '';
    let message = '';
    let confirmText = '';

    // Set values based on type
    switch (type) {
      case 'estimate':
        title = dialogTitles.estimate || 'Delete Estimate';
        message = dialogMessages.estimate || 'Are you sure you want to delete this estimate and all its rooms?';
        confirmText = i18n.delete || 'Delete';
        break;
      case 'room':
        title = dialogTitles.room || 'Delete Room';
        message = dialogMessages.room || 'Are you sure you want to delete this room and all its products?';
        confirmText = i18n.delete || 'Delete';
        break;
      case 'product':
        title = dialogTitles.product || 'Remove Product';
        message = dialogMessages.product || 'Are you sure you want to remove this product from the room?';
        confirmText = i18n.remove || 'Remove';
        break;
    }

    // Log what we're trying to delete
    log('ModalManager', `Confirming deletion of ${type} - ID: ${type === 'product' ? productIndex : (type === 'room' ? roomId : estimateId)}`);

    // Use our custom confirmation dialog
    ConfirmationDialog.show({
      title: title,
      message: message,
      type: type,
      confirmText: confirmText,
      onConfirm: () => {
        log('ModalManager', `User confirmed deletion of ${type}`);

        // Handle deletion based on type
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
      },
      onCancel: () => {
        log('ModalManager', `User cancelled deletion of ${type}`);
        // No action needed on cancel
      }
    });
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

      // Load form via AJAX - using our ajax utility
      ajax.ajaxRequest({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'get_estimate_selection_form',
          nonce: productEstimatorVars.nonce
        }
      })
        .then(data => {
          if (data.html) {
            // Insert the HTML
            this.estimateSelectionForm.innerHTML = data.html;

            // Load data for the form
            this.loadEstimatesData();

            // Bind form events - this is critical
            this.bindEstimateSelectionFormEvents();

            resolve(data.html);
          } else {
            reject(new Error('Failed to load estimate selection form'));
          }
        })
        .catch(error => {
          console.error('Error loading estimate selection form:', error);
          reject(error);
        })
        .finally(() => {
          this.hideLoading();
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
              log('ModalManager', 'Error loading estimate selection form:', error);
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
        log('ModalManager', 'Error loading estimates data:', error);
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
      log('ModalManager', 'Estimate dropdown not found, cannot populate');
      return;
    }

    // Clear existing options
    dropdown.innerHTML = '';

    // Add default option
    const defaultOption = dom.createElement('option', {
      value: '',
      textContent: productEstimatorVars.i18n.select_estimate || '-- Select an Estimate --'
    });

    dropdown.appendChild(defaultOption);

    // Add estimate options
    if (Array.isArray(estimates)) {
      estimates.forEach(estimate => {
        if (estimate) {
          const roomCount = estimate.rooms ? Object.keys(estimate.rooms).length : 0;
          const roomText = roomCount === 1 ? '1 room' : `${roomCount} rooms`;

          const option = dom.createElement('option', {
            value: estimate.id,
            textContent: `${estimate.name || 'Unnamed Estimate'} (${roomText})`
          });

          dropdown.appendChild(option);
        }
      });
    }

    log('ModalManager', `Populated dropdown with ${estimates ? estimates.length : 0} estimates`);
  }

  /**
   * Show new estimate form with correct loading indicator handling
   */
  showNewEstimateForm() {
    if (this.estimatesList) this.estimatesList.style.display = 'none';
    if (this.estimateSelection) this.estimateSelection.style.display = 'none';

    // Force visibility of the form
    dom.forceElementVisibility(this.newEstimateForm);

    // Check if form content needs to be loaded
    if (!this.newEstimateForm.querySelector('form')) {
      this.loadNewEstimateForm()
        .finally(() => {
          // Always hide loading when form is ready
          this.hideLoading();

          // Add this: Ensure cancel button is properly bound
          this.bindCancelButton(this.newEstimateForm, 'estimate');
        });
    } else {
      // Form already exists, just make sure loading is hidden and cancel button is bound
      this.hideLoading();

      // Add this: Ensure cancel button is properly bound
      this.bindCancelButton(this.newEstimateForm, 'estimate');
    }
  }

  bindCancelButton(formContainer, formType) {
    if (!formContainer) return;

    // Find the cancel button in this form
    const cancelButton = formContainer.querySelector('.cancel-btn');

    if (cancelButton) {
      // Remove any existing event listeners to prevent duplicates
      cancelButton.removeEventListener('click', this._cancelFormHandler);

      // Create and store new handler
      this._cancelFormHandler = () => {
        console.log(`Cancel button clicked for ${formType} form`);
        this.cancelForm(formType);
      };

      // Add the event listener
      cancelButton.addEventListener('click', this._cancelFormHandler);

      console.log(`Cancel button bound for ${formType} form`);
    } else {
      console.warn(`No cancel button found in ${formType} form`);
    }
  }

  /**
   * Load new estimate form via AJAX with improved loading handling
   * @returns {Promise} Promise that resolves when form is loaded
   */
  loadNewEstimateForm() {
    return new Promise((resolve, reject) => {
      // Show loading
      this.showLoading();

      // Use our ajax utility for AJAX requests
      ajax.ajaxRequest({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'get_new_estimate_form',
          nonce: productEstimatorVars.nonce
        }
      })
        .then(data => {
          if (data.html) {
            this.newEstimateForm.innerHTML = data.html;

            if (window.productEstimator && window.productEstimator.core &&
              window.productEstimator.core.customerDetailsManager) {
              // Slight delay to ensure DOM is updated
              setTimeout(() => {
                window.productEstimator.core.customerDetailsManager.init();
              }, 100);
            }

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

            // Dispatch a custom event that modal content has been loaded
            document.dispatchEvent(new CustomEvent('product_estimator_modal_loaded'));

            resolve(data.html);
          } else {
            reject(new Error('Failed to load new estimate form'));
          }
        })
        .catch(error => {
          console.error('Error loading new estimate form:', error);
          reject(error);
        })
        .finally(() => {
          // Hide loading indicator when AJAX completes, regardless of success or error
          this.hideLoading();
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
    dom.forceElementVisibility(this.newRoomForm);

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

      // Use our ajax utility
      ajax.ajaxRequest({
        url: productEstimatorVars.ajax_url,
        type: 'POST',
        data: {
          action: 'get_new_room_form',
          nonce: productEstimatorVars.nonce
        }
      })
        .then(data => {
          if (data.html) {
            // Insert form HTML
            this.newRoomForm.innerHTML = data.html;

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

            resolve(data.html);
          } else {
            reject(new Error('Failed to load new room form'));
          }
        })
        .catch(error => {
          console.error('Error loading new room form:', error);
          reject(error);
        })
        .finally(() => {
          this.hideLoading();
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
        dom.forceElementVisibility(this.estimateSelectionForm);
        dom.forceElementVisibility(this.estimateSelection);
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
   * Handle form submission
   * Code for other methods in the class...
   */

  // [Include the rest of your existing methods...]

  /**
   * Show a message to the user
   * @param {string} message - The message to display
   * @param {string} type - Message type ('success' or 'error')
   */
  showMessage(message, type = 'success') {
    // Find the form container first
    const formContainer = this.contentContainer || document.querySelector('.product-estimator-modal-form-container');

    if (!formContainer) {
      // If we can't find the container, log the error but don't try to prepend
      console.error('Form container not found for message display:', message);
      return;
    }

    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.modal-message');
    existingMessages.forEach(msg => dom.removeElement(msg));

    // Create message element using dom utility
    const messageEl = dom.createElement('div', {
      className: `modal-message ${type === 'error' ? 'modal-error-message' : 'modal-success-message'}`,
      textContent: message
    });

    // Safely prepend to container
    try {
      formContainer.prepend(messageEl);
    } catch (e) {
      console.error('Error adding message to container:', e);
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        dom.removeElement(messageEl);
      }
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
}

// Export the class
export default ModalManager;
