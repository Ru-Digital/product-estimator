/**
 * ModalManager.js
 *
 * Handles all modal operations for the Product Estimator plugin.
 * This is the single source of truth for modal operations.
 */
import ConfirmationDialog from './ConfirmationDialog';
import { initSuggestionsCarousels, initCarouselOnAccordionOpen } from './SuggestionsCarousel';
import { loadCustomerDetails, saveCustomerDetails, clearCustomerDetails} from "./CustomerStorage";
import { loadEstimateData, saveEstimate, saveEstimateData, clearEstimateData, addEstimate, removeEstimate } from "./EstimateStorage";
import TemplateEngine from './TemplateEngine';



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

    this.loadCustomerDetails = loadCustomerDetails;
    this.saveCustomerDetails = saveCustomerDetails;
    this.clearCustomerDetails = clearCustomerDetails;

    this.loadEstimateData = loadEstimateData;
    this.clearEstimateData = clearEstimateData;
    this.saveEstimateData = saveEstimateData;
    // Make addEstimate and removeEstimate available if needed elsewhere, though direct import is used below
    // this.addEstimate = addEstimate;
    // this.removeEstimate = removeEstimate;

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
    this.log('ModalManager initialized');
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

    // Create missing containers if needed
    if (!this.loadingIndicator) {
      console.warn('[ModalManager] Loading indicator not found, creating one');
      this.loadingIndicator = document.createElement('div');
      this.loadingIndicator.className = 'product-estimator-modal-loading';
      this.loadingIndicator.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-text">${this.config.i18n.loading || 'Loading...'}</div>
    `;
      this.modal.appendChild(this.loadingIndicator);
    }

    // Find view containers - directly use string IDs for performance
    this.estimatesList = this.modal.querySelector('#estimates');
    this.estimateSelection = this.modal.querySelector('#estimate-selection-wrapper');

    // Create missing containers when needed
    if (!this.estimateSelection && this.contentContainer) {
      this.estimateSelection = document.createElement('div');
      this.estimateSelection.id = 'estimate-selection-wrapper';
      this.contentContainer.appendChild(this.estimateSelection);
    }

    this.estimateSelectionForm = this.modal.querySelector('#estimate-selection-form-wrapper');
    if (!this.estimateSelectionForm && this.estimateSelection) {
      this.estimateSelectionForm = document.createElement('div');
      this.estimateSelectionForm.id = 'estimate-selection-form-wrapper';
      this.estimateSelection.appendChild(this.estimateSelectionForm);
    }

    this.roomSelectionForm = this.modal.querySelector('#room-selection-form-wrapper');
    if (!this.roomSelectionForm && this.contentContainer) {
      this.roomSelectionForm = document.createElement('div');
      this.roomSelectionForm.id = 'room-selection-form-wrapper';
      this.roomSelectionForm.style.display = 'none';
      this.contentContainer.appendChild(this.roomSelectionForm);
    }

    this.newEstimateForm = this.modal.querySelector('#new-estimate-form-wrapper');
    this.newRoomForm = this.modal.querySelector('#new-room-form-wrapper');

    // Bind events to any existing forms
    // this.bindExistingForms();
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
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'product-estimator-modal-loading';
        loadingIndicator.style.display = 'flex';
        loadingIndicator.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">${this.config.i18n.loading || 'Loading...'}</div>
      `;
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
      // console.log('Loading indicator hidden at:', new Date().toISOString());
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

    // this.log('Modal events bound');
  }

  /**
   * Open the modal with template-based rendering
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

    // Get the form container for content
    const formContainer = this.modal.querySelector('.product-estimator-modal-form-container');
    if (!formContainer) {
      console.error('Form container not found in modal');
      this.hideLoading();
      return;
    }

    // Clear any existing content
    formContainer.innerHTML = '';

    // DETERMINE WHICH FLOW TO USE
    if (productId && !forceListView) {
      console.log('STARTING PRODUCT FLOW with product ID:', productId);

      // Check if estimates exist using DataService
      this.dataService.checkEstimatesExist()
        .then(hasEstimates => {
          console.log('Has estimates check result:', hasEstimates);

          if (hasEstimates) {
            // Show estimate selection view using template engine
            this.dataService.getEstimatesData()
              .then(estimates => {
                // Check if template exists first
                if (!TemplateEngine.getTemplate('estimate-selection-template')) {
                  console.error('Template not found: estimate-selection-template');
                  this.showError('Template not found. Please refresh and try again.');
                  this.hideLoading();
                  return;
                }

                // Create and insert the estimate selection template
                TemplateEngine.insert('estimate-selection-template', {
                  estimates: estimates
                }, formContainer);

                // Populate the estimate dropdown
                const estimateDropdown = formContainer.querySelector('#estimate-dropdown');
                if (estimateDropdown) {
                  estimates.forEach(estimate => {
                    const option = document.createElement('option');
                    option.value = estimate.id;
                    const roomCount = estimate.rooms ? Object.keys(estimate.rooms).length : 0;
                    option.textContent = `${estimate.name} (${roomCount} room${roomCount !== 1 ? 's' : ''})`;
                    estimateDropdown.appendChild(option);
                  });
                }

                // Bind events to the form
                this.bindEstimateSelectionFormEvents();
                this.hideLoading();
              })
              .catch(error => {
                console.error('Error loading estimates data:', error);
                TemplateEngine.showMessage('Error loading estimates data.', 'error', formContainer);
                this.hideLoading();
              });
          } else {
            // Show new estimate form
            // Check if template exists first
            if (!TemplateEngine.getTemplate('new-estimate-form-template')) {
              console.error('Template not found: new-estimate-form-template');
              this.showError('Template not found. Please refresh and try again.');
              this.hideLoading();
              return;
            }

            // Insert the template for new estimate form
            TemplateEngine.insert('new-estimate-form-template', {}, formContainer);

            // Bind events to the form
            const form = formContainer.querySelector('#new-estimate-form');
            if (form) {
              // Set product ID as data attribute
              form.dataset.productId = productId;

              // Bind submit event
              form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewEstimateSubmission(form);
              });

              // Bind cancel button
              const cancelButton = form.querySelector('.cancel-btn');
              if (cancelButton) {
                cancelButton.addEventListener('click', () => {
                  this.cancelForm('estimate');
                });
              }
            }

            this.hideLoading();
          }
        })
        .catch(error => {
          console.error('Error checking estimates:', error);
          if (formContainer) {
            TemplateEngine.showMessage('Error checking estimates. Please try again.', 'error', formContainer);
          }
          this.hideLoading();
        });
    } else {
      // LIST VIEW FLOW: No product ID or forcing list view
      console.log('STARTING LIST VIEW FLOW');

      // First, create the estimates list container
      this.estimatesList = document.createElement('div');
      this.estimatesList.id = 'estimates';
      formContainer.appendChild(this.estimatesList);

      // Now that we have created the container, we can bind events to it
      this.bindProductRemovalEvents();
      this.bindRoomRemovalEvents();
      this.bindEstimateRemovalEvents();

      // Get estimates from localStorage
      const estimateData = this.loadEstimateData();
      console.log('ESTIMATE DATA:', JSON.stringify(estimateData, null, 2));

      const estimates = estimateData.estimates || {};

      if (Object.keys(estimates).length === 0) {
        // No estimates - show empty state template
        if (TemplateEngine.getTemplate('estimates-empty-template')) {
          TemplateEngine.insert('estimates-empty-template', {}, this.estimatesList);

          // Bind create button
          const createButton = this.estimatesList.querySelector('#create-estimate-btn');
          if (createButton) {
            createButton.addEventListener('click', () => {
              this.showNewEstimateForm();
            });
          }
        } else {
          this.estimatesList.innerHTML = '<div class="no-estimates"><p>You don\'t have any estimates yet.</p><button id="create-estimate-btn" class="button">Create New Estimate</button></div>';

          // Bind create button
          const createButton = this.estimatesList.querySelector('#create-estimate-btn');
          if (createButton) {
            createButton.addEventListener('click', () => {
              this.showNewEstimateForm();
            });
          }
        }
      } else {
        // Render estimates from localStorage data
        Object.entries(estimates).forEach(([estimateId, estimate]) => {
          console.log(`Rendering estimate ${estimateId}:`, estimate);

          try {
            // Create estimate element with template
            const estimateData = {
              estimate_id: estimateId,
              name: estimate.name || 'Unnamed Estimate',
              min_total: estimate.min_total || 0,
              max_total: estimate.max_total || 0
            };

            // Insert the estimate template
            TemplateEngine.insert('estimate-item-template', estimateData, this.estimatesList);

            // Now that the estimate is in the DOM, find the rooms-container for this specific estimate
            const estimateSection = this.estimatesList.querySelector(`.estimate-section[data-estimate-id="${estimateId}"]`);
            if (!estimateSection) {
              console.error(`Could not find estimate section with ID ${estimateId} in the DOM`);
              return;
            }

            const roomsContainer = estimateSection.querySelector('.rooms-container');
            if (!roomsContainer) {
              console.error(`Could not find rooms-container in estimate ${estimateId}`);
              return;
            }

            console.log(`Found rooms-container for estimate ${estimateId}, rendering ${Object.keys(estimate.rooms || {}).length} rooms`);

            // Render rooms into this specific container
            if (estimate.rooms && Object.keys(estimate.rooms).length > 0) {
              Object.entries(estimate.rooms).forEach(([roomId, room]) => {
                console.log(`Rendering room ${roomId} in estimate ${estimateId}:`, room);

                const roomData = {
                  room_id: roomId,
                  estimate_id: estimateId,
                  name: room.name || 'Unnamed Room',
                  room_name: room.name || 'Unnamed Room',
                  width: room.width || 0,
                  length: room.length || 0,
                  min_total: room.min_total || 0,
                  max_total: room.max_total || 0
                };

                // Insert the room template directly into this estimate's rooms-container
                TemplateEngine.insert('room-item-template', roomData, roomsContainer);

                // Now find the product-list container for this room
                const roomElement = roomsContainer.querySelector(`.accordion-item[data-room-id="${roomId}"]`);
                if (!roomElement) {
                  console.error(`Could not find room element with ID ${roomId} in the DOM`);
                  return;
                }

                const productList = roomElement.querySelector('.product-list');
                if (!productList) {
                  console.error(`Could not find product-list in room ${roomId}`);
                  return;
                }

                // Render products in this room if they exist
                if (room.products && room.products.length > 0) {
                  console.log(`Found ${room.products.length} products in room ${roomId}, rendering...`);

                  // Render each product in the room
                  room.products.forEach((product, productIndex) => {
                    console.log(`Rendering product ${product.id} at index ${productIndex} in room ${roomId}`);

                    // Prepare product data for template
                    const productData = {
                      product_index: productIndex,
                      estimate_id: estimateId,
                      room_id: roomId,
                      ...product // Spread the product properties
                    };

                    // Insert product using template
                    TemplateEngine.insert('product-item-template', productData, productList);
                  });
                } else {
                  console.log(`No products found in room ${roomId}`);
                }
              });
            }
          } catch (error) {
            console.error(`Error rendering estimate ${estimateId}:`, error);
          }
        });
      }

      // Initialize accordions and add event handlers after all content is rendered
      setTimeout(() => {
        console.log('Initializing accordions and events after content rendering');
        this.initializeEstimateAccordions();
        this.initializeAccordions();

        // Re-bind events to ensure they work with the newly rendered content
        this.bindProductRemovalEvents();
        this.bindRoomRemovalEvents();
        this.bindEstimateRemovalEvents();

        // Initialize carousels
        this.initializeCarousels();

        // Initialize product details toggles
        if (window.productEstimator && window.productEstimator.detailsToggle) {
          window.productEstimator.detailsToggle.setup();
        }

        // Hide loading when everything is done
        this.hideLoading();
      }, 100);
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
   * Override the original closeModal to ensure loader is hidden
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
    // console.log('Resetting modal state');

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
    console.log('[loadEstimatesList] Function started', { expandRoomId, expandEstimateId });

    return new Promise((resolve, reject) => {
      // Show loading state
      this.showLoading();

      // Ensure estimates list container exists
      if (!this.estimatesList) {
        console.error('[loadEstimatesList] Estimates list container not found!');
        reject(new Error('Estimates list container not found'));
        return;
      }

      // Make sure it's visible
      this.estimatesList.style.display = 'block';

      try {
        // Get data from localStorage via our imported function
        const estimateData = this.loadEstimateData();
        const estimates = estimateData.estimates || {};

        // Clear existing content
        this.estimatesList.innerHTML = '';

        if (Object.keys(estimates).length === 0) {
          // No estimates - show empty state
          TemplateEngine.insert('estimates-empty-template', {}, this.estimatesList);

          // Bind create button
          const createButton = this.estimatesList.querySelector('#create-estimate-btn');
          if (createButton) {
            createButton.addEventListener('click', () => {
              this.showNewEstimateForm();
            });
          }
        } else {
          // Render estimates from localStorage data
          Object.entries(estimates).forEach(([estimateId, estimate]) => {
            try {
              // Create estimate element with explicit template data
              TemplateEngine.insert('estimate-item-template', {
                estimate_id: estimateId,
                name: estimate.name || 'Unnamed Estimate',
                min_total: estimate.min_total || 0,
                max_total: estimate.max_total || 0,
                default_markup: estimate.default_markup || 0
              }, this.estimatesList);

              // Find this estimate section to add rooms
              const estimateSection = this.estimatesList.querySelector(
                `.estimate-section[data-estimate-id="${estimateId}"]`
              );

              if (estimateSection) {
                const roomsContainer = estimateSection.querySelector('.rooms-container');
                if (roomsContainer && estimate.rooms) {
                  // Add rooms
                  Object.entries(estimate.rooms).forEach(([roomId, room]) => {
                    TemplateEngine.insert('room-item-template', {
                      room_id: roomId,
                      estimate_id: estimateId,
                      name: room.name || 'Unnamed Room',
                      room_name: room.name || 'Unnamed Room',
                      width: room.width || 0,
                      length: room.length || 0,
                      min_total: room.min_total || 0,
                      max_total: room.max_total || 0
                    }, roomsContainer);
                  });
                }
              }
            } catch (error) {
              console.error(`Error rendering estimate ${estimateId}:`, error);
            }
          });
        }

        // CRUCIAL: Initialize both types of accordions after rendering
        setTimeout(() => {
          console.log('Calling initializeEstimateAccordions from loadEstimatesList');
          this.initializeEstimateAccordions(expandRoomId, expandEstimateId);
          this.initializeAccordions(expandRoomId, expandEstimateId);
          this.bindProductRemovalEvents();
          this.bindRoomRemovalEvents();
          this.bindEstimateRemovalEvents();
          this.initializeCarousels();
          this.bindSuggestedProductButtons();
        }, 100);

        resolve(this.estimatesList.innerHTML);
      } catch (error) {
        console.error('[loadEstimatesList] Error loading estimates from localStorage:', error);
        reject(error);
      } finally {
        this.hideLoading();
      }
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

    // Find the room element
    const roomElement = this.modal.querySelector(`.accordion-item[data-room-id="${roomId}"][data-estimate-id="${estimateId}"]`);

    if (!roomElement) {
      console.warn(`Could not find room element for room ID ${roomId} and estimate ID ${estimateId}`);
      this.showError('Room element not found. Please refresh and try again.');
      this.hideLoading();
      return;
    }

    const productElement = roomElement.querySelector(`.product-item[data-product-index="${productIndex}"]`);

    if (!productElement) {
      console.warn(`Could not find product element with index ${productIndex} in the DOM`);
      this.showError('Product element not found. Please refresh and try again.');
      this.hideLoading();
      return;
    }

    // Use DataService to make the AJAX request
    this.dataService.removeProductFromRoom(estimateId, roomId, productIndex)
      .then(response => {
        console.log('Product removal successful:', response);

        // Get parent container before removing element
        const productList = productElement.parentElement;

        // Remove the element from the DOM
        productElement.remove();

        // Check if this was the last product in the room
        if (productList && productList.children.length === 0) {
          console.log('Last product in room removed, updating room UI');

          // If room is now empty, hide suggestions
          const suggestions = roomElement.querySelector('.product-suggestions');
          if (suggestions) {
            suggestions.style.display = 'none';
          }
        }

        // Update the room's total price if needed
        if (response.room_totals) {
          this.updateRoomTotals(estimateId, roomId, response.room_totals);
        }

        // Also update the estimate's total price
        if (response.estimate_totals) {
          this.updateEstimateTotals(estimateId, response.estimate_totals);
        }

        // Show success message
        this.showMessage('Product removed successfully', 'success');
      })
      .catch(error => {
        console.error('Error removing product:', error);
        this.showError(error.message || 'Error removing product. Please try again.');
      })
      .finally(() => {
        this.hideLoading();
      });
  }


  /**
   * Update room price totals after a product is removed
   * @param {string} estimateId - Estimate ID
   * @param {string} roomId - Room ID
   * @param {Object} totals - New price totals from the server
   */
  updateRoomTotals(estimateId, roomId, totals) {
    if (!totals) return;

    const roomElement = this.modal.querySelector(`.accordion-item[data-room-id="${roomId}"][data-estimate-id="${estimateId}"]`);
    if (!roomElement) return;

    // Update the room price display
    const priceElement = roomElement.querySelector('.room-price');
    if (priceElement && totals.min_total !== undefined && totals.max_total !== undefined) {
      const formattedPrice = `${format.formatPrice(totals.min_total)} - ${format.formatPrice(totals.max_total)}`;
      priceElement.textContent = formattedPrice;
      console.log(`Updated room price display to ${formattedPrice}`);
    }

    // Update the price graph if it exists
    const priceGraph = roomElement.querySelector('.price-graph-range');
    if (priceGraph && totals.max_total) {
      // Calculate percentage width based on max price
      const maxPossible = totals.max_total * 1.5; // Assume the graph is scaled to 150% of max
      const percentage = (totals.max_total / maxPossible) * 100;
      priceGraph.style.width = `${Math.min(percentage, 100)}%`;
    }
  }

  /**
   * Update estimate price totals after a product is removed
   * @param {string} estimateId - Estimate ID
   * @param {Object} totals - New price totals from the server
   */
  updateEstimateTotals(estimateId, totals) {
    if (!totals) return;

    const estimateSection = this.modal.querySelector(`.estimate-section[data-estimate-id="${estimateId}"]`);
    if (!estimateSection) return;

    // Update the estimate price display
    const priceElement = estimateSection.querySelector('.estimate-price');
    if (priceElement && totals.min_total !== undefined && totals.max_total !== undefined) {
      const formattedPrice = `${format.formatPrice(totals.min_total)} - ${format.formatPrice(totals.max_total)}`;
      priceElement.textContent = formattedPrice;
      console.log(`Updated estimate price display to ${formattedPrice}`);
    }

    // Update the price graph if it exists
    const priceGraph = estimateSection.querySelector('.price-graph-range');
    if (priceGraph && totals.max_total) {
      // Calculate percentage width based on max price
      const maxPossible = totals.max_total * 1.5; // Assume the graph is scaled to 150% of max
      const percentage = (totals.max_total / maxPossible) * 100;
      priceGraph.style.width = `${Math.min(percentage, 100)}%`;
    }
  }

  /**
   * Handle adding a suggested product to a room
   * Moves the AJAX request to the DataService for consistency.
   *
   * @param {string|number} productId - Product ID
   * @param {string|number} estimateId - Estimate ID
   * @param {string|number} roomId - Room ID
   * @param {HTMLElement} buttonElement - The button element that triggered the action
   */
  handleAddSuggestedProduct(productId, estimateId, roomId, buttonElement) {
    // Show loading indicator
    this.showLoading();

    // Show loading state on the button
    if (buttonElement) {
      buttonElement.disabled = true;
      buttonElement.classList.add('loading');
      buttonElement.innerHTML = '<span class="loading-dots">Adding...</span>';
    }

    console.log(`Adding suggested product ${productId} to room ${roomId} in estimate ${estimateId} via DataService`);

    // Use DataService to make the AJAX request
    this.dataService.addProductToRoom(roomId, productId, estimateId)
      .then(response => {
        console.log('Add suggested product response from DataService:', response);

        // Refresh the estimates list to show the updated room
        return this.loadEstimatesList(roomId, estimateId)
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
          });
      })
      .catch(error => {
        // Handle error response from DataService
        console.error('Error adding suggested product via DataService:', error);

        // Check if this is a duplicate product error (assuming DataService adds this property)
        if (error.data?.duplicate) {
          console.log('Duplicate suggested product detected by DataService:', error.data);
          this.showMessage(error.data.message || 'This product already exists in this room.', 'error');
          // The room is likely already open, so no need to refresh or expand
        } else {
          // Handle other errors
          this.showError(error.message || 'Error adding product. Please try again.');
        }
      })
      .finally(() => {
        // Reset button state
        if (buttonElement) {
          buttonElement.disabled = false;
          buttonElement.classList.remove('loading');
          buttonElement.textContent = 'Add'; // Restore original text
        }

        // Hide loading indicator
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
          const roomId =button.dataset.roomId;

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

    // Log the estimate ID being removed for debugging
    console.log(`Attempting to remove estimate ID: ${estimateId}`);

    this.dataService.removeEstimate(estimateId)
      .then((response) => {
        console.log('Estimate removal response:', response);

        // Refresh estimates list
        this.loadEstimatesList()
          .then(() => {
            // Show success message
            this.showMessage('Estimate removed successfully', 'success');
          })
          .catch(error => {
            console.error('Error refreshing estimates list:', error);
            this.showError('Error refreshing estimates list. Please try again.');
          });
      })
      .catch(error => {
        console.error('Error removing estimate:', error);
        this.showError(error.message || 'Error removing estimate. Please try again.');
      })
      .finally(() => {
        this.hideLoading();
      });
  }

  /**
   * Bind product removal events with proper event delegation
   */
  bindProductRemovalEvents() {
    console.log('Binding product removal events');

    // Make sure we have a valid estimatesList element
    if (!this.estimatesList) {
      console.error('Estimates list not available for binding product removal events');
      return;
    }

    // Remove any existing click handlers first to prevent duplicates
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
          productIndex,
          button: removeButton
        });

        if (estimateId && roomId && productIndex !== undefined) {
          // Confirm before removing
          this.confirmDelete('product', estimateId, roomId, productIndex);
        } else {
          console.error('Missing data attributes for product removal:', {
            estimateId,
            roomId,
            productIndex,
            buttonData: removeButton.dataset
          });
        }
      }
    };

    // Add the new handler
    this.estimatesList.addEventListener('click', this._productRemovalHandler);
    console.log('Product removal events bound to #estimates element');
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
   * Confirm deletion with better error handling and logging
   * @param {string} type - Item type ('product', 'room', or 'estimate')
   * @param {string} estimateId - Estimate ID
   * @param {string} roomId - Room ID (for room or product deletion)
   * @param {string} productIndex - Product index (for product deletion only)
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
    console.log(`Confirming deletion of ${type} - ID: ${type === 'product' ? productIndex : (type === 'room' ? roomId : estimateId)}`);

    // Use our custom confirmation dialog
    if (window.productEstimator && window.productEstimator.dialog) {
      console.log('Using custom dialog for deletion confirmation');

      window.productEstimator.dialog.show({
        title: title,
        message: message,
        type: type,
        confirmText: confirmText,
        onConfirm: () => {
          console.log(`User confirmed deletion of ${type}`);

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
          console.log(`User cancelled deletion of ${type}`);
          // No action needed on cancel
        }
      });
    } else {
      // Fallback to standard confirm if custom dialog not available
      console.log('Custom dialog not available, using browser confirm');

      if (confirm(message)) {
        console.log(`User confirmed deletion of ${type} via browser confirm`);

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
      } else {
        console.log(`User cancelled deletion of ${type} via browser confirm`);
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

      this._createEstimateHandler = () => {
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
   * Show new estimate form with correct loading indicator handling
   */
  showNewEstimateForm() {
    if (this.estimatesList) this.estimatesList.style.display = 'none';
    if (this.estimateSelection) this.estimateSelection.style.display = 'none';

    // Force visibility of the form
    this.forceElementVisibility(this.newEstimateForm);

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
          // Hide loading indicator when AJAX completes, regardless of success or error
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

    // First check if the form container exists
    if (!this.roomSelectionForm) {
      console.warn('Cannot bind events - room selection form container not found');
      return;
    }

    // Then check if the form exists inside the container
    const form = this.roomSelectionForm.querySelector('form');
    if (!form) {
      console.warn('Cannot bind events - form not found in room selection form');
      return;
    }

    // Continue with the rest of your binding code...
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
   * Add this method to the ModalManager class to handle customer details updates
   */
  onCustomerDetailsUpdated(event) {
    if (event.detail && event.detail.details) {
      console.log('Customer details updated:', event.detail.details);

      // Update any new estimate form in the modal
      const newEstimateForm = this.modal?.querySelector('#new-estimate-form');
      if (newEstimateForm) {
        // Set data-has-email attribute to update UI behavior
        const hasEmail = event.detail.details.email && event.detail.details.email.trim() !== '';
        newEstimateForm.setAttribute('data-has-email', hasEmail ? 'true' : 'false');
      }

      // If there's a customer details confirmation area, update it with new details
      this.updateCustomerDetailsDisplay(event.detail.details);
    }
  }

  /**
   * Add this method to the ModalManager class to update the customer details display
   */
  updateCustomerDetailsDisplay(details) {
    // Find any customer details confirmation areas in the modal
    const detailsConfirmations = this.modal?.querySelectorAll('.customer-details-confirmation');

    if (!detailsConfirmations || detailsConfirmations.length === 0) {
      return; // No confirmation areas found
    }

    detailsConfirmations.forEach(confirmation => {
      // Find the details paragraph
      const detailsPara = confirmation.querySelector('.saved-customer-details p');
      if (!detailsPara) return;

      // Build HTML with new details
      let html = '';

      if (details.name && details.name.trim() !== '') {
        html += `<strong>${details.name}</strong><br>`;
      }

      if (details.email && details.email.trim() !== '') {
        html += `${details.email}<br>`;
      }

      if (details.phone && details.phone.trim() !== '') {
        html += `${details.phone}<br>`;
      }

      html += details.postcode || '';

      // Update the paragraph
      detailsPara.innerHTML = html;

      // Update input fields in the edit form as well
      const editNameField = confirmation.querySelector('#edit-customer-name');
      const editEmailField = confirmation.querySelector('#edit-customer-email');
      const editPhoneField = confirmation.querySelector('#edit-customer-phone');
      const editPostcodeField = confirmation.querySelector('#edit-customer-postcode');

      if (editNameField && details.name) editNameField.value = details.name;
      if (editEmailField && details.email) editEmailField.value = details.email;
      if (editPhoneField && details.phone) editPhoneField.value = details.phone;
      if (editPostcodeField && details.postcode) editPostcodeField.value = details.postcode;
    });
  }

  /**
   * Handle room selection form submission with multi-estimate support
   * @param {HTMLFormElement} form - The submitted form
   */
  handleRoomSelection(form) {
    // Ensure all form values are strings to avoid type issues
    const roomDropdown = form.querySelector('#room-dropdown');
    const roomId = String(roomDropdown ? roomDropdown.value || '' : '').trim(); // Get roomId from dropdown
    const productId = String(this.currentProductId || '').trim();

    // Get the estimate ID from the form's data attribute
    const estimateId = String(this.roomSelectionForm.dataset.estimateId || '').trim();

    // Validate required data
    if (roomId === undefined || roomId === null || roomId === '') {
      this.showError('Please select a room');
      console.error('Room selection requires a valid room ID but it was empty or invalid');
      return;
    }

    if (productId === undefined || productId === null || productId === '' || productId === '0') {
      this.showError('No product selected');
      console.error('Room selection requires a valid product ID but it was empty or invalid');
      return;
    }

    // Debug information - log before submission
    console.log('Room selection validated with:', {
      roomId,
      productId,
      estimateId
    });

    this.showLoading();

    // Make the AJAX request using DataService
    this.dataService.addProductToRoom(roomId, productId, estimateId)
      .then(response => {
        console.log('Add product response:', response);

        // Hide selection forms
        this.estimateSelection.style.display = 'none';
        this.roomSelectionForm.style.display = 'none';

        // Clear the product ID from the modal after successful addition
        delete this.modal.dataset.productId;
        this.currentProductId = null;

        // Get the estimate and room IDs from the response
        const responseEstimateId = response.estimate_id || estimateId;
        const responseRoomId = response.room_id || roomId;

        console.log(`Product added to estimate ${responseEstimateId}, room ${responseRoomId}`);

        // Refresh the estimates list to show the updated room
        this.loadEstimatesList(responseRoomId, responseEstimateId)
          .then(() => {
            // Show success message
            this.showMessage('Product added successfully!', 'success');
          })
          .catch(error => {
            console.error('Error refreshing estimates list:', error);
            this.showError('Error refreshing estimates list. Please try again.');
          });
      })
      .catch(error => {
        // Check if this is a duplicate product error (assuming DataService adds this property)
        if (error.data?.duplicate) {
          console.log('Duplicate product detected:', error.data);

          // Hide selection forms
          this.estimateSelection.style.display = 'none';
          this.roomSelectionForm.style.display = 'none';

          // Clear the product ID after handling
          delete this.modal.dataset.productId;
          this.currentProductId = null;

          const duplicateEstimateId = error.data.estimate_id;
          const duplicateRoomId = error.data.room_id;

          // Show specific error message
          this.showError(error.data.message || 'This product already exists in the selected room.');

          // Load the estimates and expand the specific room where the product already exists
          this.loadEstimatesList(duplicateRoomId, duplicateEstimateId)
            .then(() => {
              console.log('Estimates list refreshed to show duplicate product location');
              setTimeout(() => {
                // Find and expand the estimate containing the room
                const estimateSection = this.modal.querySelector(`.estimate-section[data-estimate-id="${duplicateEstimateId}"]`);
                if (estimateSection && estimateSection.classList.contains('collapsed')) {
                  // Remove collapsed class
                  estimateSection.classList.remove('collapsed');
                  // Show content
                  const estimateContent = estimateSection.querySelector('.estimate-content');
                  if (estimateContent) {
                    if (typeof jQuery !== 'undefined') {
                      jQuery(estimateContent).slideDown(200);
                    } else {
                      estimateContent.style.display = 'block';
                    }
                  }
                }

                // Find and expand the room accordion
                const roomElement = this.modal.querySelector(`.accordion-item[data-room-id="${duplicateRoomId}"]`);
                if (roomElement) {
                  const header = roomElement.querySelector('.accordion-header');
                  if (header && !header.classList.contains('active')) {
                    // Add active class
                    header.classList.add('active');

                    // Show room content
                    const content = roomElement.querySelector('.accordion-content');
                    if (content) {
                      if (typeof jQuery !== 'undefined') {
                        jQuery(content).slideDown(300, function() {
                          // Scroll to room after animation completes
                          roomElement[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                        });
                      } else {
                        content.style.display = 'block';
                        roomElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }
                  } else {
                    // Room is already expanded, just scroll to it
                    roomElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }
              }, 300); // Wa
            })
            .catch(error => {
              console.error('Error refreshing estimates list:', error);
            });
        } else {
          // Handle regular error response
          const errorMessage = error.message || 'Error adding product to room. Please try again.';
          this.showError(errorMessage);
          console.error('DataService error:', error);
        }
      })
      .finally(() => {
        this.hideLoading();
      });
  }
  /**
   * Handle new estimate form submission with improved loader handling
   * @param {HTMLFormElement} form - The submitted form
   */
  handleNewEstimateSubmission(form) {
    const formData = new FormData(form);
    const productId = this.currentProductId;
    const estimateName = formData.get('estimate_name') || 'Unnamed Estimate';

    this.showLoading();

    // Use console.log to debug the process
    console.log('Submitting new estimate form');

    console.log(formData);

    this.dataService.addNewEstimate(formData, productId)
      .then(response => {
        // Check that we got a valid estimate_id
        console.log('New estimate created with ID:', response.estimate_id);

        // === START: Save customer details from the form to localStorage ===
        const customerDetails = {
          name: formData.get('customer_name') || '',
          email: formData.get('customer_email') || '',
          phone: formData.get('customer_phone') || '',
          postcode: formData.get('customer_postcode') || ''
        };
        saveCustomerDetails(customerDetails); // Use the imported function
        this.log('Customer details from new estimate form saved to localStorage:', customerDetails);
        // === END: Save customer details ===

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

          // Important - hide the loading indicator when showing the new form
          this.hideLoading();
        } else {
          // Just refresh the estimates list
          this.loadEstimatesList()
            .catch(error => {
              this.log('Error refreshing estimates list:', error);
              this.showError('Error refreshing estimates list. Please try again.');
            })
            .finally(() => {
              // Make sure to hide the loading indicator
              this.hideLoading();
            });
        }
      })
      .catch(error => {
        this.log('Error creating estimate:', error);
        this.showError(error.message || 'Error creating estimate. Please try again.');
        // Make sure to hide the loading indicator on error
        this.hideLoading();
      });
  }

  /**
   * Handle new room form submission with multi-estimate support
   * @param {HTMLFormElement} form - The submitted form
   * @param {Event} event - The form submission event
   */
  handleNewRoomSubmission(form, event) {
    console.log('Processing new room form submission via DataService');

    // Prevent default form submission which would cause page reload
    if (event) {
      event.preventDefault();
    } else if (typeof window.event !== 'undefined') {
      window.event.preventDefault();
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

    if (estimateId === undefined || estimateId === null || estimateId === '') {
      this.showError('No estimate selected for this room.');
      return;
    }

    this.showLoading();

    // Add a specific log message for the DataService call
    console.log('Calling DataService.addNewRoom for estimate ID:', estimateId);

    // Use DataService to submit the form data
    this.dataService.addNewRoom(formData, estimateId, productId)
      .then(response => {
        console.log('DataService.addNewRoom response:', response);

        // Clear form
        form.reset();

        // Hide new room form
        this.newRoomForm.style.display = 'none';

        // Clear the product ID from the modal after successful addition
        delete this.modal.dataset.productId;
        this.currentProductId = null;

        // Get estimate and room IDs from the response
        const responseEstimateId = response.estimate_id || estimateId;
        const responseRoomId = response.room_id || '0'; // Use '0' or handle appropriately if room_id might be missing

        // Refresh the estimates list to show the new room
        this.loadEstimatesList(responseRoomId, responseEstimateId)
          .then(() => {
            // Show success message
            this.showMessage('Room added successfully!', 'success');
          })
          .catch(error => {
            console.error('Error refreshing estimates list:', error);
            this.showError('Error refreshing estimates list. Please try again.');
          });
      })
      .catch(error => {
        // Handle error response from DataService
        console.error('Error adding room via DataService:', error);
        this.showError(error.message || 'Error adding room. Please try again.');
      })
      .finally(() => {
        this.hideLoading();
      });
  }



  /**
   * Cancel a form and return to previous view
   * @param {string} formType - Form type ('estimate' or 'room')
   */
  cancelForm(formType) {
    console.log(`Canceling form type: ${formType}`);

    switch (formType) {
      case 'estimate':
        // Hide the new estimate form
        if (this.newEstimateForm) {
          this.newEstimateForm.style.display = 'none';
        }

        // If we have a product ID, go back to estimate selection if estimates exist
        if (this.currentProductId) {
          this.dataService.checkEstimatesExist()
            .then(hasEstimates => {
              if (hasEstimates) {
                // Show estimate selection form (product flow)
                this.forceElementVisibility(this.estimateSelectionForm);
                this.forceElementVisibility(this.estimateSelection);
              } else {
                // No estimates, show the estimates list
                this.forceElementVisibility(this.estimatesList);
              }
            })
            .catch(error => {
              console.error('Error checking estimates:', error);
              // On error, just show the estimates list
              this.forceElementVisibility(this.estimatesList);
            });
        } else {
          // No product ID, we're in the general flow, show the estimates list
          this.forceElementVisibility(this.estimatesList);
        }
        break;

      case 'room':
        // Hide the new room form
        if (this.newRoomForm) {
          this.newRoomForm.style.display = 'none';
        }

        // If we have a product ID and came from room selection
        if (this.currentProductId && this.roomSelectionForm.dataset.estimateId) {
          // Return to room selection (we were adding a new room during product addition)
          this.forceElementVisibility(this.roomSelectionForm);
          this.forceElementVisibility(this.estimateSelection);
        } else {
          // Regular flow (no product being added), return to estimates list
          this.forceElementVisibility(this.estimatesList);
        }
        break;

      default:
        console.warn(`Unknown form type: ${formType}`);
        // Default behavior - show the estimates list
        this.forceElementVisibility(this.estimatesList);
        break;
    }
  }

  /**
   * Initialize estimate accordions with support for auto-expanding specific estimates
   * @param {string|null} expandRoomId - Optional room ID to auto-expand
   * @param {string|null} expandEstimateId - Optional estimate ID to auto-expand
   */
  initializeEstimateAccordions(expandRoomId = null, expandEstimateId = null) {
    console.log('Initializing estimate accordions');

    // Find all estimate headers within the modal
    const estimateHeaders = this.modal.querySelectorAll('.estimate-header');
    console.log(`Found ${estimateHeaders.length} estimate headers to initialize`);

    // Clear previous handlers
    estimateHeaders.forEach(header => {
      const newHeader = header.cloneNode(true);
      header.parentNode.replaceChild(newHeader, header);

      // Add new handler directly to the cloned node
      newHeader.addEventListener('click', function(e) {
        // Skip if clicking on a button
        if (e.target.closest('.remove-estimate')) {
          e.stopPropagation();
          return;
        }

        console.log('Estimate header clicked');

        // Find the parent estimate section
        const estimateSection = this.closest('.estimate-section');
        if (!estimateSection) {
          console.error('No parent estimate section found');
          return;
        }

        // Toggle the collapsed state
        estimateSection.classList.toggle('collapsed');
        console.log('Toggled collapsed class on estimate section');

        // Find the content element
        const content = estimateSection.querySelector('.estimate-content');
        if (!content) {
          console.error('No estimate content element found');
          return;
        }

        // Toggle the content visibility
        if (estimateSection.classList.contains('collapsed')) {
          // Hide content
          content.style.display = 'none';
        } else {
          // Show content
          content.style.display = 'block';
        }
      });
    });

    console.log('Estimate accordions initialization complete');
  }

  /**
   * Toggle estimate accordion expansion
   * @param {HTMLElement} header - The estimate header element
   */
  toggleEstimateAccordion(header) {
    console.log('Toggling estimate accordion', header);

    // Find the estimate section
    const estimateSection = header.closest('.estimate-section');
    if (!estimateSection) {
      console.error('No parent estimate section found');
      return;
    }

    // Toggle collapsed class with explicit logging
    const wasCollapsed = estimateSection.classList.contains('collapsed');
    console.log(`Estimate section was ${wasCollapsed ? 'collapsed' : 'expanded'}, toggling state`);

    estimateSection.classList.toggle('collapsed');

    const isNowCollapsed = estimateSection.classList.contains('collapsed');
    console.log(`Estimate section is now ${isNowCollapsed ? 'collapsed' : 'expanded'}`);

    // Find the content container
    const content = estimateSection.querySelector('.estimate-content');
    if (!content) {
      console.error('No estimate content found');
      return;
    }

    // Toggle display of content with animation if jQuery is available
    if (isNowCollapsed) {
      console.log('Collapsing estimate content');
      if (typeof jQuery !== 'undefined') {
        jQuery(content).slideUp(200);
      } else {
        content.style.display = 'none';
      }
    } else {
      console.log('Expanding estimate content');
      if (typeof jQuery !== 'undefined') {
        jQuery(content).slideDown(200);
      } else {
        content.style.display = 'block';
      }
    }
  }

  /**
   * Initialize accordion functionality for rooms with better multi-estimate support
   * @param {string|null} expandRoomId - Optional room ID to auto-expand after initialization
   * @param {string|null} expandEstimateId - Optional estimate ID containing the room
   */
  initializeAccordions(expandRoomId = null, expandEstimateId = null) {
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

        // After toggling, initialize carousels in this accordion
        const accordionItem = header.closest('.accordion-item');
        if (accordionItem) {
          const content = accordionItem.querySelector('.accordion-content');
          if (content && window.getComputedStyle(content).display !== 'none') {
            // Content is visible, initialize carousels
            setTimeout(() => {
              // Find carousels within this content - check for both types
              const carousels = content.querySelectorAll('.suggestions-carousel');
              if (carousels.length) {
                this.log(`Found ${carousels.length} carousels in opened accordion`);
                if (typeof initSuggestionsCarousels === 'function') {
                  initSuggestionsCarousels();
                }
              }
            }, 100);
          }
        }
      }
    };

    // Add the event listener to the estimates list container
    if (this.estimatesList) {
      this.estimatesList.addEventListener('click', this.accordionHandler);
      this.log('Accordion event handler (re)attached');

      // If a specific room ID is provided, expand that accordion item
      if (expandRoomId) {
        // More specific selector that includes estimate ID when available
        let selector = `.accordion-item[data-room-id="${expandRoomId}"]`;

        // If specific estimate ID is provided, make the selector more precise
        if (expandEstimateId) {
          selector = `.estimate-section[data-estimate-id="${expandEstimateId}"] ${selector}`;
        }

        const roomElement = this.modal.querySelector(selector);
        if (roomElement) {
          this.log(`Found room element to expand: ${selector}`);

          // First ensure the estimate container is visible if it's a nested structure
          const estimateSection = roomElement.closest('.estimate-section');
          if (estimateSection) {
            // Make sure the estimate section is visible
            estimateSection.style.display = 'block';
          }

          // Now expand the room accordion
          const header = roomElement.querySelector('.accordion-header');
          if (header) {
            // Add active class
            header.classList.add('active');

            // Find and show content
            const content = roomElement.querySelector('.accordion-content');
            if (content) {
              content.style.display = 'block';

              // Try jQuery if available for smoother animation
              if (typeof jQuery !== 'undefined') {
                jQuery(content).show(300);
              }

              // Initialize carousels in the expanded room
              setTimeout(() => {
                if (typeof initSuggestionsCarousels === 'function') {
                  initSuggestionsCarousels();
                }
              }, 150);
            }

            // Scroll to the expanded room
            setTimeout(() => {
              roomElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 150);

            this.log(`Auto-expanded room ID: ${expandRoomId} in estimate: ${expandEstimateId || 'any'}`);
          }
        } else {
          this.log(`Room ID ${expandRoomId} not found for auto-expansion`);
          // If room wasn't found, log all available rooms for debugging
          const allRooms = this.modal.querySelectorAll('.accordion-item[data-room-id]');
          this.log(`Available rooms: ${Array.from(allRooms).map(r => r.dataset.roomId).join(', ')}`);
        }
      }
    }
  }

  /**
   * Toggle accordion item expansion with enhanced animation
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

    // Toggle display of content with animation if jQuery is available
    if (header.classList.contains('active')) {
      this.log('Opening accordion content');
      if (typeof jQuery !== 'undefined') {
        jQuery(content).slideDown(200);
      } else {
        content.style.display = 'block';
      }
    } else {
      this.log('Closing accordion content');
      if (typeof jQuery !== 'undefined') {
        jQuery(content).slideUp(200);
      } else {
        content.style.display = 'none';
      }
    }
  }

  /**
   * Initialize jQuery fallback for accordions with improved multi-estimate support
   * @param {string|null} expandRoomId - Optional room ID to expand after initialization
   * @param {string|null} expandEstimateId - Optional estimate ID containing the room
   */
  initializeJQueryAccordions(expandRoomId = null, expandEstimateId = null) {
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

    // Auto-expand specific room if provided
    if (expandRoomId) {
      // Add a small delay to ensure the DOM is ready
      setTimeout(() => {
        // Build selector based on available information
        let selector = `.accordion-item[data-room-id="${expandRoomId}"]`;

        // If we have an estimate ID, make the selector more precise
        if (expandEstimateId) {
          selector = `.estimate-section[data-estimate-id="${expandEstimateId}"] ${selector}`;
        }

        console.log(`Looking for room with selector: ${selector}`);

        const $roomElement = jQuery(selector);
        if ($roomElement.length) {
          console.log(`Found room element using jQuery: ${selector}`);

          // Make sure the estimate section is expanded if nested
          const $estimateSection = $roomElement.closest('.estimate-section');
          if ($estimateSection.length) {
            $estimateSection.show();
          }

          const $header = $roomElement.find('.accordion-header');
          if ($header.length) {
            // Add active class
            $header.addClass('active');

            // Show the content
            const $content = $roomElement.find('.accordion-content');
            if ($content.length) {
              $content.slideDown(300, function() {
                // Scroll to room after animation completes
                $roomElement[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
              });
            }

            console.log(`jQuery auto-expanded room ID: ${expandRoomId} in estimate: ${expandEstimateId || 'any'}`);
          }
        } else {
          console.warn(`Room element not found with jQuery using selector: ${selector}`);
          console.log('Available room elements:', jQuery('.accordion-item[data-room-id]').map(function() {
            return jQuery(this).data('roomId');
          }).get());
        }
      }, 300); // Longer delay for more reliability
    }
  }


  /**
   * Update the estimates list view with enhanced room expansion
   * @param {string|null} expandRoomId - Optional room ID to expand after update
   * @param {string|null} expandEstimateId - Optional estimate ID containing the room
   */
  updateEstimatesList(expandRoomId = null, expandEstimateId = null) {
    // Check if there are any estimates
    const hasEstimates = !!this.modal.querySelector('.estimate-section');

    // If no estimates, DON'T add create button - it's already in the template
    // We'll just ensure the existing no-estimates div is properly shown
    if (!hasEstimates) {
      const noEstimatesDiv = this.modal.querySelector('.no-estimates');
      if (noEstimatesDiv) {
        noEstimatesDiv.style.display = 'block';

        // Make sure the button has the right event handler
        const createButton = noEstimatesDiv.querySelector('#create-estimate-btn');
        if (createButton) {
          // Remove any existing event listeners to prevent duplication
          if (this._createEstimateBtnHandler) {
            createButton.removeEventListener('click', this._createEstimateBtnHandler);
          }

          // Create and store new handler
          this._createEstimateBtnHandler = () => {
            this.showNewEstimateForm();
          };

          // Add the new handler
          createButton.addEventListener('click', this._createEstimateBtnHandler);
          console.log('Added event handler to existing create estimate button');
        }
      }
    } else {
      // If we have estimates, make sure the no-estimates div is hidden
      const noEstimatesDiv = this.modal.querySelector('.no-estimates');
      if (noEstimatesDiv) {
        noEstimatesDiv.style.display = 'none';
      }
    }

    // Update all suggestions visibility
    this.updateAllSuggestionsVisibility();

    // Initialize estimate accordions
    this.initializeEstimateAccordions(expandRoomId, expandEstimateId);

    // Initialize accordions with auto-expansion if a room ID is specified
    this.initializeAccordions(expandRoomId, expandEstimateId);



    this.initializeCarousels();

    // Bind the replace product buttons
    this.bindReplaceProductButtons();

    // Also bind the suggested product buttons again
    this.bindSuggestedProductButtons();
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
    // Find the form container first
    const formContainer = this.contentContainer || document.querySelector('.product-estimator-modal-form-container');

    if (!formContainer) {
      // If we can't find the container, log the error but don't try to prepend
      console.error('Form container not found for message display:', message);
      return;
    }

    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.modal-message');
    existingMessages.forEach(msg => msg.remove());

    // Create message element
    const messageClass = type === 'error' ? 'modal-error-message' : 'modal-success-message';
    const messageEl = document.createElement('div');
    messageEl.className = `modal-message ${messageClass}`;
    messageEl.textContent = message;

    // Safely prepend to container
    try {
      formContainer.prepend(messageEl);
    } catch (e) {
      console.error('Error adding message to container:', e);
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.remove();
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
   * Completely revised bindReplaceProductButtons method that ensures
   * consistent button behavior between page refreshes
   */
  bindReplaceProductButtons() {
    // console.log('[BUTTON BINDING] Binding replace product buttons');

    // Find all replacement buttons in the modal
    const replaceButtons = this.modal.querySelectorAll('.replace-product-in-room');

    if (replaceButtons.length) {
      // console.log(`[BUTTON BINDING] Found ${replaceButtons.length} replace buttons to bind`);

      // Loop through each button and bind click event
      replaceButtons.forEach((button, index) => {
        // Log each button's attributes for debugging
        console.log(`[BUTTON BINDING] Button #${index+1} attributes:`, {
          productId: button.dataset.productId,
          estimateId: button.dataset.estimateId,
          roomId: button.dataset.roomId,
          replaceProductId: button.dataset.replaceProductId,
          replaceType: button.dataset.replaceType || 'main'
        });

        // Remove any existing handlers to prevent duplicates
        if (button._replaceButtonHandler) {
          button.removeEventListener('click', button._replaceButtonHandler);
        }

        // Create and store new handler directly on button element
        button._replaceButtonHandler = (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Get data attributes - explicitly check the button.dataset properties
          const newProductId = button.dataset.productId;
          const estimateId = button.dataset.estimateId;
          const roomId = button.dataset.roomId;
          const oldProductId = button.dataset.replaceProductId;
          const parentProductId = button.dataset.parentProductId || null; // Get parent product ID


          // Get the replace type - defaulting to 'main' if not specified
          const replaceType = button.hasAttribute('data-replace-type') ?
            button.getAttribute('data-replace-type') : 'main';

          console.log('[BUTTON CLICKED] Replace product button clicked:', {
            estimateId,
            roomId,
            oldProductId,
            newProductId,
            replaceType
          });

          // Handle replacing the product with confirmation dialog
          this.handleReplaceProduct(estimateId, roomId, oldProductId, newProductId, parentProductId, button, replaceType);
        };

        // Add click event listener
        button.addEventListener('click', button._replaceButtonHandler);
      });

      console.log('[BUTTON BINDING] Replace product buttons bound successfully');
    } else {
      console.log('[BUTTON BINDING] No replace product buttons found to bind');
    }
  }

  /**
   * Comprehensively fixed handleReplaceProduct method
   * This method handles replacing products with enhanced front-end handling
   *
   * @param {string} estimateId - Estimate ID
   * @param {string} roomId - Room ID
   * @param {string} oldProductId - ID of product to replace
   * @param {string} newProductId - ID of new product
   * @param {string|null} parentProductId - ID of the parent product (if replacing additional product)
   * @param {HTMLElement} buttonElement - Button element for UI feedback
   * @param {string} replaceType - Type of replacement ('main' or 'additional_products')
   */
  handleReplaceProduct(estimateId, roomId, oldProductId, newProductId, parentProductId, buttonElement, replaceType = 'main') {
    // First, log detailed replacement information for debugging
    console.log(`[PRODUCT REPLACEMENT] Starting product replacement process
    Type: ${replaceType}
    Old Product ID: ${oldProductId}
    New Product ID: ${newProductId}
    Parent Product ID: ${parentProductId} // Log parent product ID
    Room ID: ${roomId}
    Estimate ID: ${estimateId}
  `);

    // Get product names if available (from button attributes or nearby elements)
    let oldProductName = "this product";
    let newProductName = "the selected product";

    try {
      // Try to get product names from DOM
      if (buttonElement) {
        // Get name of new product (the one in the carousel or tile)
        const productItem = buttonElement.closest('.suggestion-item, .upgrade-tile');
        if (productItem) {
          const nameEl = productItem.querySelector('.suggestion-name, .tile-label');
          if (nameEl) {
            newProductName = nameEl.textContent.trim();
          }
        }

        // For additional products (find in the includes section)
        if (replaceType === 'additional_products') {
          console.log('Looking for additional product name to replace');

          // Find the product item that contains this button (usually the outer parent)
          const mainProductItem = buttonElement.closest('.product-item');

          if (mainProductItem) {
            // Look specifically within this product's includes section
            // and find the include-item that matches our oldProductId
            const includeItems = mainProductItem.querySelectorAll('.include-item');
            console.log(`Found ${includeItems.length} include items to search through`);

            for (const item of includeItems) {
              const nameEl = item.querySelector('.include-item-name');
              if (nameEl) {
                // For additional products, we need a better way to match
                // Look for data attributes if available
                const includeProduct = item.closest('[data-product-id]');
                if (includeProduct && includeProduct.dataset.productId === oldProductId) {
                  oldProductName = nameEl.textContent.trim();
                  console.log(`Found matching additional product: ${oldProductName}`);
                  break;
                } else {
                  // If no data attribute, just use the first one we find
                  // This is a fallback that might not be accurate
                  oldProductName = nameEl.textContent.trim();
                }
              }
            }
          }
        }
        // For main products
        else {
          const productWrapper = buttonElement.closest('.product-item');
          if (productWrapper) {
            const nameEl = productWrapper.querySelector('.product-name, .price-title');
            if (nameEl) {
              oldProductName = nameEl.textContent.trim();
              console.log(`Found main product name: ${oldProductName}`);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not determine product names for confirmation dialog:', e);
    }

    // Build confirmation message
    const confirmMessage = `Are you sure you want to replace "${oldProductName}" with "${newProductName}"?`;

    // Use the confirmation dialog
    if (window.productEstimator && window.productEstimator.dialog) {
      window.productEstimator.dialog.show({
        title: 'Confirm Upgrade',
        message: confirmMessage,
        type: 'product', // Using product type for styling
        action: 'upgrade_product',
        confirmText: 'Upgrade',
        cancelText: 'Cancel',
        onConfirm: () => {
          // Proceed with replacement, passing parentProductId
          this.executeProductReplacement(estimateId, roomId, oldProductId, newProductId, parentProductId, buttonElement, replaceType);
        },
        onCancel: () => {
          // Reset button state if needed
          if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.classList.remove('loading');
            buttonElement.textContent = 'Upgrade';
          }
          console.log('Product upgrade cancelled');
        }
      });
    } else {
      // Fallback to browser confirm if custom dialog isn't available
      if (confirm(confirmMessage)) {
        this.executeProductReplacement(estimateId, roomId, oldProductId, newProductId, parentProductId, buttonElement, replaceType);
      } else {
        // Reset button state if needed
        if (buttonElement) {
          buttonElement.disabled = false;
          buttonElement.classList.remove('loading');
          buttonElement.textContent = 'Upgrade';
        }
      }
    }
  }

  /**
   * Enhanced method to reload and properly expand estimates and rooms,
   * especially after product replacements
   *
   * @param {string} roomId - Room ID to expand
   * @param {string} estimateId - Estimate ID to expand
   * @param {string|null} productId - Optional product ID to highlight
   * @returns {Promise} Promise that resolves when list is loaded and expanded
   */
  reloadAndExpandEstimatesList(roomId, estimateId, productId = null) {
    return new Promise((resolve, reject) => {
      this.showLoading();

      console.log(`Reloading estimates list with expansion params - Room: ${roomId}, Estimate: ${estimateId}, Product: ${productId}`);

      // Load the estimates list
      this.loadEstimatesList(roomId, estimateId)
        .then(() => {
          // First, find and expand the estimate
          setTimeout(() => {
            const estimateSection = this.modal.querySelector(`.estimate-section[data-estimate-id="${estimateId}"]`);
            if (estimateSection) {
              console.log(`Found estimate section: ${estimateId}`);

              // Remove collapsed class
              estimateSection.classList.remove('collapsed');

              // Show estimate content
              const estimateContent = estimateSection.querySelector('.estimate-content');
              if (estimateContent) {
                estimateContent.style.display = 'block';
              }
            }

            // Now find and expand the room
            setTimeout(() => {
              const roomElement = this.modal.querySelector(`.accordion-item[data-room-id="${roomId}"][data-estimate-id="${estimateId}"]`) ||
                this.modal.querySelector(`.accordion-item[data-room-id="${roomId}"]`);

              if (roomElement) {
                console.log(`Found and expanding room: ${roomId}`);

                // Activate the header
                const header = roomElement.querySelector('.accordion-header');
                if (header) header.classList.add('active');

                // Show the content
                const content = roomElement.querySelector('.accordion-content');
                if (content) {
                  content.style.display = 'block';

                  // Initialize carousels in the expanded room
                  setTimeout(() => {
                    if (typeof initSuggestionsCarousels === 'function') {
                      initSuggestionsCarousels();
                    }

                    // If a product ID was provided, highlight it briefly
                    if (productId) {
                      const productElements = content.querySelectorAll('.product-item');
                      productElements.forEach(productEl => {
                        // Look for the product item that contains data for this product
                        if (productEl.dataset.productId === productId ||
                          productEl.querySelector(`[data-product-id="${productId}"]`)) {

                          // Highlight the product for attention
                          productEl.classList.add('highlight-product');

                          // Remove highlight after 2 seconds
                          setTimeout(() => {
                            productEl.classList.remove('highlight-product');
                          }, 2000);

                          // Scroll to make the product visible
                          productEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      });
                    } else {
                      // No specific product to highlight, just scroll to the room
                      roomElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }, 150);
                }
              } else {
                console.warn(`Room ID ${roomId} not found for auto-expansion`);
              }
            }, 150);
            console.warn(`Estimate ID ${estimateId} not found for auto-expansion`);

          });

          resolve();
        })
        .catch(error => {
          console.error('Error reloading estimates list:', error);
          reject(error);
        })
        .finally(() => {
          this.hideLoading();
        });
    });
  }

  /**
   * Completely revised executeProductReplacement method for upgrading products
   * with more robust upgrade button handling
   *
   * @param {string} estimateId - Estimate ID
   * @param {string} roomId - Room ID
   * @param {string} oldProductId - ID of product to replace
   * @param {string} newProductId - ID of new product
  * @param {string|null} parentProductId - ID of the parent product (if replacing additional product)
   * @param {HTMLElement} buttonElement - Button element for UI feedback
   * @param {string} replaceType - Type of replacement ('main' or 'additional_products')
   */
  executeProductReplacement(estimateId, roomId, oldProductId, newProductId, parentProductId, buttonElement, replaceType = 'main') {
    // Show loading indicator
    this.showLoading();

    // Show loading state on the button
    if (buttonElement) {
      buttonElement.disabled = true;
      buttonElement.classList.add('loading');
      buttonElement.innerHTML = '<span class="loading-dots">Upgrading...</span>';
    }

    console.log(`[PRODUCT REPLACEMENT] Executing replacement via DataService:
  Type: ${replaceType}
  Old Product ID: ${oldProductId}
  New Product ID: ${newProductId}
  Room ID: ${roomId}
  Parent Product ID: ${parentProductId}
  Estimate ID: ${estimateId}`);

    // Use DataService to make the replacement request
    this.dataService.replaceProductInRoom(estimateId, roomId, oldProductId, newProductId, parentProductId, replaceType)
      .then(response => { // 'response' here is the 'data' payload from the server's successful response
        console.log('[PRODUCT REPLACEMENT] Server response (data payload):', response); // Added note for clarity

        // *** REMOVE THE INCORRECT IF (response.success) CHECK ***

        // Store the replacement chain in window for later reference
        // Check if response.replacement_chain exists in the data payload
        window._productReplacementChains = window._productReplacementChains || {};
        window._productReplacementChains[`${roomId}_${newProductId}`] = response.replacement_chain || []; // Access replacement_chain directly from the data payload

        console.log('[PRODUCT REPLACEMENT] Just stored replacement chain, attempting to load estimates list...');

        // Refresh the estimates list with the room expanded
        this.loadEstimatesList(roomId, estimateId)
          .then(() => {
            console.log('[PRODUCT REPLACEMENT] Estimates list refreshed');

            // Ensure the estimate section is expanded (this logic should now run)
            const estimateSection = this.modal.querySelector(`.estimate-section[data-estimate-id="${estimateId}"]`);
            if (estimateSection) {
              estimateSection.classList.remove('collapsed');
              const estimateContent = estimateSection.querySelector('.estimate-content');
              if (estimateContent) {
                // Use jQuery slideDown if available, otherwise display block
                if (typeof jQuery !== 'undefined') {
                  jQuery(estimateContent).slideDown(200);
                } else {
                  estimateContent.style.display = 'block';
                }
              }
            }


            // Find and expand the room (this logic should now run)
            const roomElement = this.modal.querySelector(`.accordion-item[data-room-id="${roomId}"][data-estimate-id="${estimateId}"]`) ||
              this.modal.querySelector(`.accordion-item[data-room-id="${roomId}"]`);

            if (roomElement) {
              console.log('[PRODUCT REPLACEMENT] Found room element, expanding');

              // Activate the header
              const header = roomElement.querySelector('.accordion-header');
              if (header) header.classList.add('active');

              // Show the content
              const content = roomElement.querySelector('.accordion-content');
              if (content) {
                // Use jQuery slideDown if available, otherwise display block
                if (typeof jQuery !== 'undefined') {
                  jQuery(content).slideDown(300, () => {
                    // Scroll to the room after animation completes
                    roomElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  });
                } else {
                  content.style.display = 'block';
                  // Scroll immediately if no jQuery animation
                  roomElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }


                // CRITICAL FIX: Update the data-replace-product-id attributes on additional product buttons
                // to maintain reference to the original product ID for future upgrades
                if (replaceType === 'additional_products') {
                  this.updateAdditionalProductUpgradeButtons(roomElement, newProductId, oldProductId);
                }

                // Initialize carousels in the expanded room
                setTimeout(() => { // Keep a small delay to ensure DOM is ready
                  if (typeof initSuggestionsCarousels === 'function') {
                    initSuggestionsCarousels();
                  }

                  // Rebind all button events to ensure they work properly
                  this.bindReplaceProductButtons();
                  this.bindSuggestedProductButtons();

                  this.updateAllReplacementChains(roomElement); // Ensure this function exists and works with the new structure

                  // Show success message
                  this.showMessage('Product upgraded successfully!', 'success');
                }, 300); // Small delay

              } else {
                console.warn('[PRODUCT REPLACEMENT] Room content element not found.');
                // If no room content, just show success message and hide loading
                this.showMessage('Product upgraded successfully!', 'success');
              }
            } else {
              console.warn(`[PRODUCT REPLACEMENT] Could not find room element for room ID ${roomId}`);
              this.showMessage('Product upgraded successfully!', 'success');
            }
          })
          .catch(error => {
            // This catch handles errors specifically from loadEstimatesList
            console.error('[PRODUCT REPLACEMENT] Error refreshing estimates list:', error);
            this.showError('Error refreshing list after upgrade. Please try again.');
          });
      })
      .catch(error => {
        // This catch handles errors from dataService.replaceProductInRoom itself
        // (e.g., server returned success: false, fetch error, JSON parse error)
        console.error('[PRODUCT REPLACEMENT] DataService request failed:', error);
        this.showError(error.message || 'Error upgrading product. Please try again.');
      })
      .finally(() => {
        // Reset button state
        if (buttonElement) {
          buttonElement.disabled = false;
          buttonElement.classList.remove('loading');
          buttonElement.textContent = 'Upgrade';
        }

        // Hide loading
        this.hideLoading();
      });
  }

  /**
   * Update all replacement chains on buttons after page refresh
   * This ensures consistent ID references for multiple replacements
   *
   * @param {HTMLElement} roomElement - The room element containing buttons
   */
  updateAllReplacementChains(roomElement) {
    if (!roomElement || !window._productReplacementChains) return;

    console.log('[REPLACEMENT CHAINS] Updating all buttons with replacement chains');

    // Find all upgrade buttons in this room
    const upgradeButtons = roomElement.querySelectorAll('button.replace-product-in-room[data-replace-type="additional_products"]');

    upgradeButtons.forEach(button => {
      const productId = button.dataset.productId;
      const roomId = button.dataset.roomId;
      const replaceProductId = button.dataset.replaceProductId;

      const chainKey = `${roomId}_${productId}`; // Corrected line
      const replacementChain = window._productReplacementChains[chainKey];

      if (replacementChain) {
        console.log(`[REPLACEMENT CHAINS] Found chain for ${chainKey}:`, replacementChain);

        // Add data attribute with the replacement chain for debugging
        button.dataset.replacementChain = JSON.stringify(replacementChain);

        // This helps track the relationship for debugging
        console.log(`[REPLACEMENT CHAINS] Updated button ${button.textContent} with chain data`);
      }
    });
  }



  /**
   * Update additional product upgrade buttons after replacement
   * This updates the data-replace-product-id attribute to the new product ID
   *
   * @param {HTMLElement} roomElement - The room accordion element
   * @param {string} newProductId - The new product ID
   * @param {string} oldProductId - The old product ID that was replaced
   */
  updateAdditionalProductUpgradeButtons(roomElement, newProductId, oldProductId) {
    if (!roomElement) return;

    console.log(`Updating additional product upgrade buttons: newProductId=${newProductId}, oldProductId=${oldProductId}`);

    // Look for upgrade buttons with the specific data-replace-type="additional_products" attribute
    // that match the old product ID
    const upgradeButtons = roomElement.querySelectorAll(
      `button.replace-product-in-room[data-replace-product-id="${oldProductId}"][data-replace-type="additional_products"]`
    );

    if (upgradeButtons.length > 0) {
      console.log(`Found ${upgradeButtons.length} additional product upgrade buttons to update`);

      // Update each button's data-replace-product-id to the new product ID
      upgradeButtons.forEach(button => {
        console.log(`Updating button data-replace-product-id from ${oldProductId} to ${newProductId}`);
        button.dataset.replaceProductId = newProductId;
      });
    } else {
      console.log('No additional product upgrade buttons found that need updating');
    }

    // Also update any product-upgrades containers
    const upgradeContainers = roomElement.querySelectorAll(`.product-upgrades[data-product-id="${oldProductId}"]`);
    upgradeContainers.forEach(container => {
      container.dataset.productId = newProductId;
      console.log(`Updated product-upgrades container data-product-id from ${oldProductId} to ${newProductId}`);
    });
  }

  /**
   * Update all upgrade buttons within a room to point to a new product ID
   * This ensures that after an upgrade, subsequent upgrade buttons work correctly
   *
   * @param {HTMLElement} roomElement - The room accordion element
   * @param {string} oldProductId - The old product ID to replace
   * @param {string} newProductId - The new product ID to use
   */
  updateUpgradeButtonProductIds(roomElement, oldProductId, newProductId) {
    if (!roomElement) return;

    console.log(`Updating upgrade buttons: replacing ${oldProductId} with ${newProductId}`);

    // Find all replace buttons that reference the old product ID
    const upgradeButtons = roomElement.querySelectorAll(`button.replace-product-in-room[data-replace-product-id="${oldProductId}"]`);

    if (upgradeButtons.length > 0) {
      console.log(`Found ${upgradeButtons.length} upgrade buttons to update`);

      // Update each button's data attribute
      upgradeButtons.forEach(button => {
        button.dataset.replaceProductId = newProductId;
        console.log(`Updated button to use new product ID: ${newProductId}`);
      });
    } else {
      console.log('No upgrade buttons found that need updating');
    }
  }
  log(...args) {
    if (this.config.debug) {
      console.log('[EstimatorCore]', ...args);
    }
  }
}

// Export the class
export default ModalManager;

