/**
 * ModalManager.js
 *
 * Handles all modal operations for the Product Estimator plugin.
 * This is the single source of truth for modal operations.
 */
import ConfirmationDialog from './ConfirmationDialog';
import { SuggestionsCarousel } from './SuggestionsCarousel';
import { loadCustomerDetails, saveCustomerDetails, clearCustomerDetails} from "./CustomerStorage";
import { loadEstimateData, saveEstimate, saveEstimateData, clearEstimateData, addEstimate, removeEstimate } from "./EstimateStorage";
import TemplateEngine from './TemplateEngine';
import { format } from '@utils';



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

    // Find view containers - ASSUME they are now in the PHP template
    this.estimatesList = this.modal.querySelector('#estimates');
    this.estimateSelection = this.modal.querySelector('#estimate-selection-wrapper');
    this.estimateSelectionForm = this.modal.querySelector('#estimate-selection-form-wrapper'); // If this is also a persistent wrapper
    this.roomSelectionForm = this.modal.querySelector('#room-selection-form-wrapper');
    this.newEstimateForm = this.modal.querySelector('#new-estimate-form-wrapper');
    this.newRoomForm = this.modal.querySelector('#new-room-form-wrapper');

    // Add checks and potential error handling if essential elements are missing
    if (!this.estimatesList) {
      console.error('[ModalManager] Critical: #estimates div not found in modal template!');
      // You might want to disable the modal or show a fatal error message here
    }

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
      this.showError('Modal element not found. Please contact support.');
      return;
    }

    // Reset any previous modal state (hides all view wrappers)
    this.resetModalState();

    // Store product ID
    this.currentProductId = productId;

    // Set data attribute on modal
    if (productId) {
      this.modal.dataset.productId = productId;
    } else {
      delete this.modal.dataset.productId;
    }

    // Always show loader at the start of openModal
    this.showLoading();

    // Make sure modal is visible
    this.modal.style.display = 'block';

    // Add modal-open class to body
    document.body.classList.add('modal-open');
    this.isOpen = true;

    // Get the form container for content (where view wrappers reside)
    const formContainer = this.modal.querySelector('.product-estimator-modal-form-container');
    if (!formContainer) {
      console.error('Form container not found in modal');
      this.hideLoading(); // Hide loading on error
      this.showError('Modal structure missing. Please contact support.');
      return;
    }

    // DETERMINE WHICH FLOW TO USE
    if (productId && !forceListView) {
      console.log('STARTING PRODUCT FLOW with product ID:', productId);

      // Check if estimates exist using DataService
      this.dataService.checkEstimatesExist()
        .then(hasEstimates => {
          console.log('Has estimates check result:', hasEstimates);

          if (hasEstimates) {
            // Estimates exist, show estimate selection view
            console.log('Estimates found, showing estimate selection.');

            // Ensure estimate selection wrapper is visible
            const estimateSelectionWrapper = formContainer.querySelector('#estimate-selection-wrapper');
            if (estimateSelectionWrapper) {
              this.forceElementVisibility(estimateSelectionWrapper); // Use force visibility

              // --- MODIFIED CODE START ---
              // Insert the estimate selection template content into the wrapper
              try {
                // Clear existing content first in case it was loaded before
                estimateSelectionWrapper.innerHTML = '';
                TemplateEngine.insert('estimate-selection-template', {}, estimateSelectionWrapper);
                console.log('Estimate selection template inserted into wrapper.');

                // *** FIX: Update the instance property to the newly inserted element ***
                this.estimateSelectionForm = estimateSelectionWrapper.querySelector('#estimate-selection-form-wrapper');
                // *** END FIX ***

              } catch (templateError) {
                console.error('Error inserting estimate selection template:', templateError);
                this.showError('Error loading selection form template. Please try again.');
                this.hideLoading();
                return; // Stop execution if template insertion fails
              }
              // --- MODIFIED CODE END ---

              // Now that this.estimateSelectionForm is updated, safely proceed
              if (this.estimateSelectionForm) {
                this.forceElementVisibility(this.estimateSelectionForm); // Ensure the form wrapper itself is visible

                // Assuming the template insertion includes the actual <form> element,
                // we can proceed directly to loading data and binding events.
                // If the form content itself is loaded via a separate AJAX call *after* the wrapper template,
                // you would keep the check `if (!this.estimateSelectionForm.querySelector('form'))` and the AJAX logic here.
                // Based on the template structure, it seems the <form> is included in estimate-selection.html.

                const estimateSelectionFormElement = this.estimateSelectionForm.querySelector('form');
                if (estimateSelectionFormElement) {
                  console.log('Estimate selection form element found after template insertion, populating dropdown and binding events.');
                  this.loadEstimatesData(); // This function now uses the updated this.estimateSelectionForm
                  this.bindEstimateSelectionFormEvents(); // This function now uses the updated this.estimateSelectionForm
                  // hideLoading() is now called within loadEstimatesData's finally() block
                } else {
                  console.error('Form element (#estimate-selection-form) not found inside the template after insertion!');
                  this.showError('Error rendering form template. Please try again.');
                  this.hideLoading(); // Ensure loading is hidden on error
                }


              } else {
                // This error is less likely now that template insertion is handled, but keep as a fallback
                console.error('Estimate selection form wrapper not found in template AFTER INSERTION!');
                this.showError('Modal structure incomplete. Please contact support.');
                this.hideLoading(); // Ensure loading is hidden on error
              }

            } else {
              console.error('Estimate selection wrapper not found in template!');
              this.showError('Modal structure incomplete. Please contact support.');
              this.hideLoading(); // Ensure loading is hidden on error
              return;
            }

          } else {
            // No estimates, show new estimate form
            console.log('No estimates found, showing new estimate form.');

            // Check if template exists before calling showNewEstimateForm
            if (!TemplateEngine.getTemplate('new-estimate-form-template')) {
              console.error('Template not found: new-estimate-form-template');
              this.showError('Template not found. Please refresh and try again.');
              this.hideLoading(); // Hide loading on error
              return;
            }

            this.showNewEstimateForm();
            // Note: showNewEstimateForm now manages its own loading state.
            // The hideLoading() that was previously here is no longer needed.
          }
        })
        .catch(error => {
          console.error('Error checking estimates:', error);
          if (formContainer) { // Ensure formContainer exists before showing message
            TemplateEngine.showMessage('Error checking estimates. Please try again.', 'error', formContainer);
          }
          this.hideLoading(); // Hide loading on error checking estimates
        });
    } else {
      // LIST VIEW FLOW: No product ID or forcing list view
      console.log('STARTING LIST VIEW FLOW');

      // Ensure estimates list container is visible (it's in the template)
      if (this.estimatesList) {
        this.forceElementVisibility(this.estimatesList); // Use force visibility
      } else {
        console.error('Estimates list container not found in template!');
        this.showError('Modal structure incomplete. Please contact support.');
        this.hideLoading(); // Hide loading on error
        return;
      }

      // Bind event handlers to the estimates list container (for delegation)
      this.bindEstimateListEventHandlers();

      // Load and render the estimates list content
      this.loadEstimatesList()
        .catch(error => {
          console.error('Error loading estimates list:', error);
          // Show error message in the estimates list container if possible
          if (this.estimatesList) {
            TemplateEngine.showMessage('Error loading estimates. Please try again.', 'error', this.estimatesList);
          } else {
            this.showError('Error loading estimates. Please try again.');
          }
        })
        .finally(() => {
          this.hideLoading(); // Ensure loading is hidden after loading estimates list
        });
    }
    // Any hideLoading() here at the end of openModal are likely redundant
  }

  /**
   * Bind events to the new room form element
   * @param {HTMLFormElement} formElement - The form element to bind events to
   * @param {string} estimateId - The estimate ID for the new room
   * @param {string|null} productId - The current product ID, if applicable
   */
  bindNewRoomFormEvents(formElement, estimateId, productId = null) {
    if (!formElement) {
      console.error('Cannot bind events - new room form element not provided');
      return;
    }

    console.log('Binding events to new room form:', formElement);

    // Set data attributes on the form
    formElement.dataset.estimateId = estimateId;
    console.log('Set estimate ID on new room form:', estimateId);

    if (productId !== null && productId !== undefined) {
      formElement.dataset.productId = productId;
      console.log('Set product ID on new room form:', productId);
    } else {
      delete formElement.dataset.productId;
      console.log('Removed product ID from new room form dataset.');
    }


    // Remove any existing submit handler to prevent duplicates
    if (formElement._submitHandler) {
      formElement.removeEventListener('submit', formElement._submitHandler);
    }

    // Bind submit event
    formElement._submitHandler = (e) => {
      e.preventDefault(); // Prevent default form submission
      console.log('New room form submitted via template');
      this.handleNewRoomSubmission(formElement, e); // Pass the event object
    };
    formElement.addEventListener('submit', formElement._submitHandler);
    console.log('New room form submit event bound.');


    // Bind cancel button
    const cancelButton = formElement.querySelector('.cancel-btn');
    if (cancelButton) {
      // Remove existing handler if any, store handler directly on button
      if (cancelButton._clickHandler) {
        cancelButton.removeEventListener('click', cancelButton._clickHandler);
      }

      cancelButton._clickHandler = () => {
        console.log('New room form cancel button clicked');
        this.cancelForm('room'); // Call the cancel handler
      };
      cancelButton.addEventListener('click', cancelButton._clickHandler);
      console.log('New room form cancel button bound.');

    } else {
      console.warn('Cancel button not found in new room form.');
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
    console.log('[ModalManager.loadEstimatesList] Function started', { expandRoomId, expandEstimateId });

    return new Promise((resolve, reject) => {
      this.showLoading();

      if (!this.estimatesList) {
        console.error('[ModalManager.loadEstimatesList] Estimates list container not found!');
        reject(new Error('Estimates list container not found'));
        return;
      }

      this.estimatesList.style.display = 'block';

      try {
        // Load estimate data from LocalStorage
        const estimateData = this.loadEstimateData();
        const estimates = estimateData.estimates || {};

        console.log('[ModalManager.loadEstimatesList] Loaded estimate data from LocalStorage:', estimateData);

        this.estimatesList.innerHTML = ''; // Clear existing content

        if (Object.keys(estimates).length === 0) {
          console.log('[ModalManager.loadEstimatesList] No estimates found, showing empty template.');
          TemplateEngine.insert('estimates-empty-template', {}, this.estimatesList);

          const createButton = this.estimatesList.querySelector('#create-estimate-btn');
          if (createButton) {
            createButton.addEventListener('click', () => {
              this.showNewEstimateForm();
            });
          }
        } else {
          console.log(`[ModalManager.loadEstimatesList] Found ${Object.keys(estimates).length} estimates, rendering.`);
          Object.entries(estimates).forEach(([estimateId, estimate]) => {
            try {
              console.log(`[ModalManager.loadEstimatesList] Rendering estimate: ${estimateId}`);

              TemplateEngine.insert('estimate-item-template', {
                estimate_id: estimateId,
                name: estimate.name || 'Unnamed Estimate',
                min_total: estimate.min_total || 0,
                max_total: estimate.max_total || 0,
                default_markup: estimate.default_markup || 0
              }, this.estimatesList);

              // Find the estimate section element that was just inserted
              const estimateSection = this.estimatesList.querySelector(
                `.estimate-section[data-estimate-id="${estimateId}"]`
              );

              if (estimateSection) {
                console.log(`[ModalManager.loadEstimatesList] Found estimate section element for ${estimateId}`);
                const roomsContainer = estimateSection.querySelector('.rooms-container');
                if (roomsContainer) { // Check if roomsContainer exists
                  if (estimate.rooms && Object.keys(estimate.rooms).length > 0) { // Check if estimate.rooms exists and has keys
                    console.log(`[ModalManager.loadEstimatesList] Rendering rooms for estimate: ${estimateId}`);
                    Object.entries(estimate.rooms).forEach(([roomId, room]) => {
                      console.log(`[ModalManager.loadEstimatesList] Rendering room: ${roomId} in estimate ${estimateId}`);
                      // Insert the room item template and get a reference to the created element.
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

                      // Find the room element that was just inserted *by its ID*
                      const roomElement = roomsContainer.querySelector(`.accordion-item[data-room-id="${roomId}"]`);

                      // Find the product list container within the newly created room element
                      const productListContainer = roomElement ? roomElement.querySelector('.product-list') : null;

                      if (productListContainer) {
                        console.log(`[ModalManager.loadEstimatesList] .product-list container found for room ${roomId}. Attempting to render products.`);

                        if (room.products && Array.isArray(room.products) && room.products.length > 0) { // Check if products exist and is not empty
                          console.log(`[ModalManager.loadEstimatesList] Room ${roomId} has ${room.products.length} products.`);
                          room.products.forEach((product, productIndex) => {
                            if (product && product.id !== undefined) {
                              try {
                                console.log(`[ModalManager.loadEstimatesList] Rendering product ${product.id} at index ${productIndex} for room ${roomId}.`);
                                TemplateEngine.insert('product-item-template', {
                                  ...product,
                                  product_index: productIndex,
                                  room_id: roomId,
                                  estimate_id: estimateId
                                }, productListContainer);
                              } catch (productRenderError) {
                                console.error(`[ModalManager.loadEstimatesList] Error rendering product ${product?.id || 'unknown'} at index ${productIndex} for room ${roomId}:`, productRenderError);
                              }
                            } else {
                              console.warn(`[ModalManager.loadEstimatesList] Invalid product data found in room ${roomId} at index ${productIndex}:`, product);
                            }
                          });
                        } else { // If no products
                          console.log(`[ModalManager.loadEstimatesList] Room ${roomId} has no products or products is not an array, showing empty template.`);
                          TemplateEngine.insert('products-empty-template', {}, productListContainer);
                        }
                      } else {
                        console.error(`[ModalManager.loadEstimatesList] v .product-list container not found within room element for room ${roomId}. Cannot render products.`);
                      }

                      // --- SUGGESTION LOADING AND RENDERING START ---
                      // Find the suggestions container within the room element
                      const suggestionsContainer = roomElement ? roomElement.querySelector('.product-suggestions .suggestions-container') : null;
                      const suggestionsWrapper = roomElement ? roomElement.querySelector('.suggestions-container-wrapper') : null;
                      const suggestionsSection = roomElement ? roomElement.querySelector('.product-suggestions') : null; // Get the entire suggestions section


                      // Get the room products array directly from the loaded estimateData
                      // This is the list of products currently in the room, used to get suggestions
                      const roomProducts = room.products || [];

                      // Check if suggestionsSection and containers exist before proceeding
                      if (suggestionsSection && suggestionsContainer && suggestionsWrapper) {
                        console.log(`[ModalManager.loadEstimatesList] Found suggestions container for room ${roomId}. Fetching suggestions...`);

                        // Display a temporary loading message or spinner
                        suggestionsContainer.innerHTML = '<div class="loading-text">Loading suggestions...</div>'; // You could use a template here

                        // Initially hide the suggestions section
                        suggestionsSection.style.display = 'none'; // Hide while loading/fetching

                        // Fetch suggestions using DataService, passing the room products array
                        // This call will trigger the backend to return suggestions *excluding* products already in roomProducts
                        this.dataService.getSuggestedProducts(estimateId, roomId, roomProducts)
                          .then(suggestions => {
                            console.log(`[ModalManager.loadEstimatesList] Fetched ${suggestions.length} suggestions for room ${roomId}. Rendering...`);
                            console.log('[ModalManager.loadEstimatesList] Suggestions data received:', suggestions); // Log the suggestions data
                            suggestionsContainer.innerHTML = ''; // Clear loading state

                            if (suggestions && suggestions.length > 0) {
                              // If suggestions are returned, show the entire suggestions section
                              suggestionsSection.style.display = 'block'; // Show the section
                              // Ensure carousel nav is visible
                              const carouselNav = roomElement.querySelectorAll('.suggestions-nav');
                              carouselNav.forEach(nav => nav.style.display = ''); // Or 'block' or 'flex' as appropriate


                              // Use TemplateEngine to render each suggestion item
                              suggestions.forEach(suggestion => {
                                // Ensure suggestion data includes necessary IDs for the button
                                const suggestionData = {
                                  ...suggestion,
                                  estimate_id: estimateId,
                                  room_id: roomId // Pass the room ID to the suggestion item template
                                };
                                const suggestionElement = TemplateEngine.create('suggestion-item-template', suggestionData);
                                if (suggestionElement) {
                                  suggestionsContainer.appendChild(suggestionElement);
                                } else {
                                  console.warn('[ModalManager.loadEstimatesList] Failed to create suggestion element from template for suggestion:', suggestion); // Added log
                                }
                              });
                              console.log(`[ModalManager.loadEstimatesList] Rendered ${suggestions.length} suggestion items for room ${roomId}.`);

                              // Initialize the carousel for this specific room's suggestions container
                              // This needs to happen after the items are added to the DOM
                              // We need to find the carousel wrapper element
                              const carouselWrapper = roomElement.querySelector('.suggestions-carousel');
                              if(carouselWrapper) {
                                console.log(`[ModalManager.loadEstimatesList] Initializing carousel for room ${roomId}.`);
                                // Destroy existing instance if any and create a new one
                                if (carouselWrapper.carouselInstance) {
                                  carouselWrapper.carouselInstance.destroy();
                                }
                                new SuggestionsCarousel(carouselWrapper); // Create a new instance
                              } else {
                                console.warn(`[ModalManager.loadEstimatesList] Suggestions carousel wrapper not found for room ${roomId}. Cannot initialize carousel.`);
                              }


                            } else {
                              // If no suggestions are returned, the section remains hidden
                              console.log(`[ModalManager.loadEstimatesList] No suggestions found for room ${roomId}. Suggestions section remains hidden.`);
                              suggestionsSection.style.display = 'none'; // Explicitly hide if no suggestions
                              // Hide carousel nav
                              const carouselNav = roomElement.querySelectorAll('.suggestions-nav');
                              carouselNav.forEach(nav => nav.style.display = 'none');
                              // Destroy existing carousel instance if any
                              if (carouselWrapper.carouselInstance) {
                                carouselWrapper.carouselInstance.destroy();
                                carouselWrapper.carouselInstance = null; // Clear reference
                              }
                            }
                          })
                          .catch(error => {
                            console.error(`[ModalManager.loadEstimatesList] Error fetching suggestions for room ${roomId}:`, error);
                            // Display an error message in the suggestions container
                            suggestionsContainer.innerHTML = '<p class="error-message">Error loading suggestions.</p>';
                            // Ensure the entire suggestions section remains hidden on error as well
                            suggestionsSection.style.display = 'none';
                            // Hide carousel nav on error
                            const carouselNav = roomElement.querySelectorAll('.suggestions-nav');
                            carouselNav.forEach(nav => nav.style.display = 'none');
                            // Destroy existing carousel instance if any
                            if (carouselWrapper.carouselInstance) {
                              carouselWrapper.carouselInstance.destroy();
                              carouselWrapper.carouselInstance = null; // Clear reference
                            }
                          });
                      } else {
                        console.warn(`[ModalManager.loadEstimatesList] Suggestions container (.product-suggestions .suggestions-container), wrapper (.suggestions-container-wrapper), or section (.product-suggestions) not found for room ${roomId}. Cannot load suggestions.`);
                      }
                      // --- SUGGESTION LOADING AND RENDERING END ---


                    });
                  } else { // If roomsContainer exists but no rooms
                    console.log(`[ModalManager.loadEstimatesList] Estimate ${estimateId} has no rooms, showing empty template.`);
                    TemplateEngine.insert('rooms-empty-template', {}, roomsContainer);
                  }
                } else { // If roomsContainer does not exist
                  console.warn(`[ModalManager.loadEstimatesList] Rooms container not found for estimate ${estimateId}.`);
                }
              } else {
                console.error(`[ModalManager.loadEstimatesList] Estimate section element not found for estimate ${estimateId} after insertion.`);
              }
            } catch (error) {
              console.error(`[ModalManager.loadEstimatesList] Error rendering estimate ${estimateId}:`, error);
            }
          });
        }

        // CRUCIAL: Initialize both types of accordions after rendering
        // Pass expandRoomId and expandEstimateId to the initialization functions
        setTimeout(() => {
          console.log('[ModalManager.loadEstimatesList] Initializing accordions and events after content rendering');
          this.initializeEstimateAccordions(expandRoomId, expandEstimateId); // Pass IDs here
          this.initializeAccordions(expandRoomId, expandEstimateId); // Pass IDs here

          // Re-bind all necessary event handlers after the list is re-rendered
          this.bindProductRemovalEvents();
          this.bindRoomRemovalEvents();
          this.bindEstimateListEventHandlers(); // For "Add Room" buttons
          this.bindDirectEstimateRemovalEvents(); // For "Remove Estimate" buttons
          this.bindReplaceProductButtons(); // For "Upgrade" buttons
          this.bindSuggestedProductButtons(); // For "Add Suggestion" buttons
          this.bindSuggestionsToggle(); // Bind the suggestions toggle


          // Initial carousel initialization is still needed for any carousels
          // that might be visible initially (e.g., if an accordion is expanded by default)
          // However, the main suggestion carousels are now initialized AFTER their content is loaded per room.
          // We might remove this general call or adjust initSuggestionsCarousels
          // to only initialize carousels that haven't been initialized yet.
          // For now, keep it, but rely on the per-room initialization for suggestions.
          // this.initializeCarousels(); // This might be redundant or need adjustment now


          if (window.productEstimator && window.productEstimator.detailsToggle) {
            window.productEstimator.detailsToggle.setup();
          } else {
            console.warn('[ModalManager.loadEstimatesList] Product details toggle setup not available.');
          }

          this.hideLoading();
          console.log('[ModalManager.loadEstimatesList] Loading complete.');

          resolve(this.estimatesList.innerHTML);
        }, 150); // Small delay to allow DOM updates

      } catch (error) {
        console.error('[ModalManager.loadEstimatesList] Error during rendering process:', error);
        this.showError('Error rendering estimates. Please try again.');
        reject(error);
      } finally {
        // hideLoading is handled in the setTimeout and catch blocks
      }
    });
  }





  /**
   * Bind estimate removal events directly to buttons after rendering.
   * Used when event propagation is stopped by ancestor handlers (like accordion).
   */
  bindDirectEstimateRemovalEvents() {
    console.log('>>> Entered bindDirectEstimateRemovalEvents function (Direct Binding)');

    // Find all remove estimate buttons within the estimates list container
    if (!this.estimatesList) {
      console.error('Estimates list not available for direct binding.');
      return;
    }

    const removeButtons = this.estimatesList.querySelectorAll('.remove-estimate');

    if (removeButtons.length > 0) {
      console.log(`>>> Found ${removeButtons.length} remove estimate buttons for direct binding`);

      removeButtons.forEach(button => {
        // Remove any existing direct handlers on this specific button
        // This prevents duplicate bindings if loadEstimatesList is called multiple times
        if (button._directEstimateRemovalHandler) {
          button.removeEventListener('click', button._directEstimateRemovalHandler);
        }

        // Create and store the new handler directly on the button element
        button._directEstimateRemovalHandler = (e) => {
          console.log('>>> Direct click handler fired for remove estimate button.', button);
          e.preventDefault(); // Prevent default button action
          e.stopPropagation(); // Explicitly stop propagation from the button itself

          const estimateId = button.dataset.estimateId;
          console.log('>>> Direct handler extracted estimateId:', estimateId, 'Type:', typeof estimateId);

          // Use the robust check for estimateId
          if (estimateId !== null && estimateId !== undefined && estimateId !== '') {
            console.log('>>> Direct handler found valid estimate ID. Calling confirmDelete.');
            this.confirmDelete('estimate', estimateId);
          } else {
            console.error('>>> Direct handler found invalid estimate ID.', button);
            this.showError('Cannot remove estimate: Missing ID.');
          }
        };

        // Add the event listener directly to the button
        button.addEventListener('click', button._directEstimateRemovalHandler);
      });
      console.log('>>> Direct estimate removal events bound successfully.');
    } else {
      console.log('>>> No remove estimate buttons found for direct binding.');
    }
  }

  // ModalManager.js

  /**
   * Bind events to the new estimate form element
   * @param {HTMLFormElement} formElement - The form element to bind events to
   * @param {string|null} productId - The current product ID, if applicable (for data attribute)
   */
  bindNewEstimateFormEvents(formElement, productId = null) {
    if (!formElement) {
      console.error('Cannot bind events - new estimate form element not provided');
      return;
    }

    console.log('Binding events to new estimate form:', formElement);

    // Set product ID as data attribute on the form if needed
    if (productId !== null && productId !== undefined) {
      formElement.dataset.productId = productId;
      console.log('Set product ID on new estimate form:', productId);
    } else {
      // Ensure it's removed if no product ID
      delete formElement.dataset.productId;
      console.log('Removed product ID from new estimate form dataset.');
    }


    // Remove any existing submit handler to prevent duplicates
    // Store handler reference directly on the form element
    if (formElement._submitHandler) {
      formElement.removeEventListener('submit', formElement._submitHandler);
    }

    // Bind submit event
    formElement._submitHandler = (e) => {
      e.preventDefault(); // Prevent default form submission
      console.log('New estimate form submitted via template');
      this.handleNewEstimateSubmission(formElement); // Call the submission handler
    };
    formElement.addEventListener('submit', formElement._submitHandler);
    console.log('New estimate form submit event bound.');


    // Bind cancel button
    const cancelButton = formElement.querySelector('.cancel-btn');
    if (cancelButton) {
      // Remove existing handler if any, store handler directly on button
      if (cancelButton._clickHandler) {
        cancelButton.removeEventListener('click', cancelButton._clickHandler);
      }

      cancelButton._clickHandler = () => {
        console.log('New estimate form cancel button clicked');
        this.cancelForm('estimate'); // Call the cancel handler
      };
      cancelButton.addEventListener('click', cancelButton._clickHandler);
      console.log('New estimate form cancel button bound.');

    } else {
      console.warn('Cancel button not found in new estimate form.');
    }

    // Initialize customer details manager if available and form is loaded
    // Pass the form or its container to the init method if it expects a context
    if (window.productEstimator && window.productEstimator.core &&
      window.productEstimator.core.customerDetailsManager) {
      // Slight delay to ensure DOM is fully updated after insertion before initializing customer details
      setTimeout(() => {
        // Check if the init method accepts a form element or container as context
        if (typeof window.productEstimator.core.customerDetailsManager.init === 'function') {
          window.productEstimator.core.customerDetailsManager.init(this.newEstimateForm); // Pass the container
          console.log('CustomerDetailsManager init called for new estimate form.');
        } else {
          console.warn('CustomerDetailsManager init method does not accept a form element argument.');
          // Call init without argument if it expects to find elements itself
          window.productEstimator.core.customerDetailsManager.init();
          console.log('CustomerDetailsManager init called without form element for new estimate form.');
        }
      }, 50); // Small delay
    }
  }

  /**
   * Handle product removal
   * MODIFIED to call updateRoomSuggestions if products still exist after removal.
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

          // If room is now empty, hide suggestions and similar products sections
          const suggestions = roomElement.querySelector('.product-suggestions');
          if (suggestions) {
            suggestions.style.display = 'none';
          }
          const similarProducts = roomElement.querySelector('.product-similar-products');
          if (similarProducts) {
            similarProducts.style.display = 'none';
          }
        } else {
          // *** MODIFIED: If products still exist, re-check for suggestions asynchronously ***
          console.log(`Products still exist in room ${roomId}. Checking for updated suggestions.`);
          this.updateRoomSuggestions(estimateId, roomId, roomElement);
          // *** END MODIFIED ***
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
   * Handle adding a suggested product to a room.
   * Moves the AJAX request to the DataService for consistency.
   * Calls updateRoomSuggestions after successful add and list reload.
   * Removes the suggestion item from the DOM after successful local add.
   * Includes logging to help debug the add process.
   *
   * @param {string|number} productId - Product ID
   * @param {string|number} estimateId - Estimate ID
   * @param {string|number} roomId - Room ID
   * @param {HTMLElement} buttonElement - The button element that triggered the action
   */
  handleAddSuggestedProduct(productId, estimateId, roomId, buttonElement) {
    console.log('[ModalManager.handleAddSuggestedProduct] Function called with:', { productId, estimateId, roomId, buttonElement }); // Added log
    this.showLoading(); // Show loading indicator

    // Disable button and show loading state
    if (buttonElement) {
      buttonElement.disabled = true;
      buttonElement.classList.add('loading');
      buttonElement.innerHTML = '<span class="loading-dots">Adding...</span>'; // Use loading text/spinner
    }

    console.log(`[ModalManager.handleAddSuggestedProduct] Adding suggested product ${productId} to room ${roomId} in estimate ${estimateId} via DataService`);

    // Use DataService to add the product (handles local storage and async server request)
    this.dataService.addProductToRoom(roomId, productId, estimateId)
      .then(localResult => {
        console.log('[ModalManager.handleAddSuggestedProduct] DataService.addProductToRoom local storage attempt result:', localResult); // Log the result from DataService

        if (localResult.success) {
          console.log('[ModalManager.handleAddSuggestedProduct] Local storage add successful.');

          // --- NEW: Remove the suggestion item from the DOM ---
          // Find the closest ancestor element with the class 'suggestion-item' from the clicked button
          const suggestionItemElement = buttonElement ? buttonElement.closest('.suggestion-item') : null;
          if (suggestionItemElement) {
            console.log('[ModalManager.handleAddSuggestedProduct] Removing suggestion item from DOM:', suggestionItemElement); // Added log
            // Remove the element from the document
            suggestionItemElement.remove();

            // Check if the carousel needs to be updated/re-initialized after removal
            const carouselContainer = suggestionItemElement.closest('.suggestions-carousel');
            if (carouselContainer && carouselContainer.carouselInstance) {
              console.log('[ModalManager.handleAddSuggestedProduct] Reinitializing carousel after item removal.'); // Added log
              // Destroy existing instance if any and create a new one
              carouselContainer.carouselInstance.destroy();
              // Create a new instance of SuggestionsCarousel for the container
              carouselContainer.carouselInstance = new SuggestionsCarousel(carouselContainer);
            }
          } else {
            console.warn('[ModalManager.handleAddSuggestedProduct] Could not find suggestion item element to remove.'); // Added log
          }
          // --- END NEW ---


          // Hide selection forms if they are visible (only applicable in product flow)
          if (this.estimateSelection) this.estimateSelection.style.display = 'none';
          if (this.roomSelectionForm) this.roomSelectionForm.style.display = 'none';

          // Clear product ID from modal state as we've completed the product flow
          delete this.modal.dataset.productId;
          this.currentProductId = null;

          // Use the estimate_id and room_id from the localResult if available, fallback to original IDs
          const responseEstimateId = localResult.estimate_id || estimateId;
          const responseRoomId = localResult.room_id || roomId;

          console.log(`[ModalManager.handleAddSuggestedProduct] Product added to estimate ${responseEstimateId}, room ${responseRoomId} (based on local storage). Refreshing list.`); // Added log

          // --- KEY LINE FOR EXPANSION AND REFRESH ---
          // Call loadEstimatesList with the room and estimate IDs to expand the relevant section
          // This will re-render the room and its product list, including the newly added product.
          // It will also re-fetch and re-render suggestions for that room,
          // which should no longer include the product that was just added.
          return this.loadEstimatesList(responseRoomId, responseEstimateId)
            .then(() => {
              console.log('[ModalManager.handleAddSuggestedProduct] Estimates list refreshed.'); // Added log

              // *** MODIFIED: After list reloads and room is expanded, update suggestions for *this* room ***
              // Find the newly loaded room element in the DOM using the response IDs
              const roomElement = this.modal.querySelector(`.accordion-item[data-room-id="${responseRoomId}"][data-estimate-id="${responseEstimateId}"]`);
              if (roomElement) {
                console.log('[ModalManager.handleAddSuggestedProduct] List reloaded. Triggering suggestion update for room:', responseRoomId); // Added log
                // Pass the room element, estimate ID, and room ID to the update function
                this.updateRoomSuggestions(responseEstimateId, responseRoomId, roomElement);
              } else {
                console.warn('[ModalManager.handleAddSuggestedProduct] Could not find room element after list reload to update suggestions.'); // Added log
              }
              // *** END MODIFIED ***

              // Show success message after the list is loaded and expanded
              this.showMessage('Product added successfully!', 'success');
            });
          // --- END KEY LINE ---

        } else {
          // Handle cases where local storage add failed (e.g., duplicate product)
          console.error('[ModalManager.handleAddSuggestedProduct] Error during local storage add:', localResult.error); // Added log
          // Show error message based on the error provided by DataService
          this.showError(localResult.error.message || 'Failed to add product locally. Please try again.');

          // If it's a duplicate, navigate to the room where the product already exists
          if (localResult.error?.data?.duplicate) {
            const duplicateEstimateId = localResult.error.data.estimate_id;
            const duplicateRoomId = localResult.error.data.room_id;
            console.log(`[ModalManager.handleAddSuggestedProduct] Duplicate detected, navigating to estimate ${duplicateEstimateId}, room ${duplicateRoomId}`); // Added log
            this.loadEstimatesList(duplicateRoomId, duplicateEstimateId); // Expand the room with the duplicate
          }
        }
      })
      .catch(error => {
        // This catch block handles errors from the DataService.addProductToRoom promise itself
        // (e.g., error during the initial fetch for comprehensive product data, or the DataService promise rejection)
        console.error('[ModalManager.handleAddSuggestedProduct] Error adding suggested product via DataService promise rejection:', error); // Added log

        // Check if the error has the duplicate flag from DataService
        if (error.data?.duplicate) {
          console.log('[ModalManager.handleAddSuggestedProduct] Duplicate suggested product detected by DataService promise rejection:', error.data); // Added log

          // Hide selection forms if they are visible
          if (this.estimateSelection) this.estimateSelection.style.display = 'none';
          if (this.roomSelectionForm) this.roomSelectionForm.style.display = 'none';

          // Clear product ID from modal state
          delete this.modal.dataset.productId;
          this.currentProductId = null;

          const duplicateEstimateId = error.data.estimate_id;
          const duplicateRoomId = error.data.room_id;

          this.showError(error.data.message || 'This product already exists in the selected room.');

          // --- KEY LINE FOR EXPANSION (Duplicate Case) ---
          // Call loadEstimatesList with the duplicate room and estimate IDs to show where it exists
          this.loadEstimatesList(duplicateRoomId, duplicateEstimateId)
            .then(() => {
              console.log('[ModalManager.handleAddSuggestedProduct] Estimates list refreshed to show duplicate product location'); // Added log
              // No need to update suggestions here, as the room already contains the product.
            })
            .catch(error => {
              console.error('[ModalManager.handleAddSuggestedProduct] Error refreshing estimates list:', error); // Added log
            });
          // --- END KEY LINE ---

        } else {
          // Handle other types of errors from the DataService promise
          this.showError(error.message || 'Error adding product. Please try again.');
        }
      })
      .finally(() => {
        // Ensure button state is reset and loading is hidden
        if (buttonElement) {
          buttonElement.disabled = false;
          buttonElement.classList.remove('loading');
          buttonElement.textContent = 'Add'; // Reset button text
        }
        this.hideLoading(); // Hide loading indicator
      });
  }









  /**
   * Binds click events to the suggested product buttons within each room.
   * This controls the action of adding a suggested product to a room.
   * Includes logging to help debug click events and data attributes.
   */
  bindSuggestedProductButtons() {
    console.log('[ModalManager.bindSuggestedProductButtons] Binding suggested product buttons'); // Added log

    // Find all suggestion buttons in the modal
    // Use event delegation by querying within the main estimates list container
    // We will bind the handler to the estimatesList container and use event delegation
    // to catch clicks on buttons with the class 'add-suggestion-to-room'.
    const estimatesListContainer = this.modal.querySelector('#estimates');

    if (!estimatesListContainer) {
      console.error('[ModalManager.bindSuggestedProductButtons] Estimates list container (#estimates) not found. Cannot bind suggestion button events.');
      return;
    }

    // Remove any existing event listener on the estimatesList container for this handler
    // This prevents duplicate bindings if loadEstimatesList is called multiple times
    if (estimatesListContainer._suggestionButtonHandler) {
      estimatesListContainer.removeEventListener('click', estimatesListContainer._suggestionButtonHandler);
    }

    // Create a single handler function and store a reference to it
    // Store the handler directly on the container element
    estimatesListContainer._suggestionButtonHandler = (e) => {
      const button = e.target.closest('.add-suggestion-to-room'); // Find the clicked button using closest()

      if (button) { // Check if a button with the class was actually clicked
        console.log('[ModalManager.bindSuggestedProductButtons] Click handler triggered for button:', button); // Added log
        e.preventDefault(); // Prevent default button action
        e.stopPropagation(); // Prevent the click from propagating to parent elements (like accordion headers)

        // Get data attributes directly from the clicked button element's dataset
        const productId = button.dataset.productId;
        const estimateId = button.dataset.estimateId;
        const roomId = button.dataset.roomId;

        console.log('[ModalManager.bindSuggestedProductButtons] Data attributes read:', {
          productId,
          estimateId,
          roomId
        }); // Added log

        // Handle adding the suggested product if all required data attributes are present
        if (productId && estimateId && roomId) {
          console.log('[ModalManager.bindSuggestedProductButtons] Data attributes are valid, calling handleAddSuggestedProduct'); // Added log
          this.handleAddSuggestedProduct(productId, estimateId, roomId, button);
        } else {
          console.error('[ModalManager.bindSuggestedProductButtons] Missing required data attributes for adding suggested product on button:', button); // Added log
          // Optionally provide user feedback here
          this.showError('Cannot add product: Missing required information.');
        }
      }
    };

    // Add the event listener to the estimates list container using the stored handler
    estimatesListContainer.addEventListener('click', estimatesListContainer._suggestionButtonHandler);
    console.log('[ModalManager.bindSuggestedProductButtons] Suggestion button click event handler bound to #estimates element.'); // Added log

    // Initial check for buttons that might already be in the DOM on load
    const initialButtons = estimatesListContainer.querySelectorAll('.add-suggestion-to-room');
    if (initialButtons.length > 0) {
      console.log(`[ModalManager.bindSuggestedProductButtons] Found ${initialButtons.length} suggestion buttons initially in the DOM.`); // Added log
    } else {
      console.log('[ModalManager.bindSuggestedProductButtons] No suggestion buttons found initially in the DOM.'); // Added log
    }
  }



  /**
   * Asynchronously fetches and updates the suggested products for a specific room.
   * Hides the suggestions section if no suggestions are returned.
   * Includes logging to help debug the suggestion fetching and rendering process.
   *
   * @param {string} estimateId - Estimate ID
   * @param {string} roomId - Room ID
   * @param {HTMLElement} roomElement - The DOM element for the room
   */
  updateRoomSuggestions(estimateId, roomId, roomElement) {
    console.log(`[ModalManager.updateRoomSuggestions] Updating suggestions for room ${roomId} in estimate ${estimateId}`); // Added log

    if (!roomElement) {
      console.error('[ModalManager.updateRoomSuggestions] Room element not provided.'); // Added log
      return;
    }

    // Find the necessary elements within the room element
    const suggestionsSection = roomElement.querySelector('.product-suggestions');
    const suggestionsContainer = roomElement.querySelector('.product-suggestions .suggestions-container');
    const suggestionsWrapper = roomElement.querySelector('.suggestions-container-wrapper');
    const carouselWrapper = roomElement.querySelector('.suggestions-carousel');
    const carouselNav = roomElement.querySelectorAll('.suggestions-nav'); // Get navigation elements

    if (!suggestionsSection || !suggestionsContainer || !suggestionsWrapper || !carouselWrapper) {
      console.warn('[ModalManager.updateRoomSuggestions] Required suggestion elements not found in room element.', {
        suggestionsSection: !!suggestionsSection,
        suggestionsContainer: !!suggestionsContainer,
        suggestionsWrapper: !!suggestionsWrapper,
        carouselWrapper: !!carouselWrapper
      }); // Added log with element checks
      return; // Cannot update suggestions if elements are missing
    }

    // Load estimate data to get the current list of products in the room
    // This is crucial because the DataService needs the current products to filter suggestions
    const estimateData = this.loadEstimateData();
    const roomData = estimateData.estimates?.[estimateId]?.rooms?.[roomId];
    const roomProducts = roomData?.products || [];

    console.log(`[ModalManager.updateRoomSuggestions] Room ${roomId} has ${roomProducts.length} products.`, roomProducts); // Added log

    // If there are no products in the room, hide suggestions immediately
    if (roomProducts.length === 0) {
      console.log(`[ModalManager.updateRoomSuggestions] Room ${roomId} has no products. Hiding suggestions section.`); // Added log
      suggestionsSection.style.display = 'none';
      suggestionsContainer.innerHTML = ''; // Clear old suggestions
      carouselNav.forEach(nav => nav.style.display = 'none'); // Hide nav
      // Destroy existing carousel instance if any
      if (carouselWrapper.carouselInstance) {
        carouselWrapper.carouselInstance.destroy();
        carouselWrapper.carouselInstance = null; // Clear reference
      }
      return; // No products, no suggestions to fetch
    }


    // Show loading state in the suggestions container
    suggestionsContainer.innerHTML = '<div class="loading-text">Loading suggestions...</div>';
    suggestionsSection.style.display = 'block'; // Ensure section is visible while loading

    // Fetch suggestions using DataService, passing the current list of room products
    this.dataService.getSuggestedProducts(estimateId, roomId, roomProducts)
      .then(suggestions => {
        console.log(`[ModalManager.updateRoomSuggestions] Fetched ${suggestions.length} suggestions for room ${roomId}. Rendering...`); // Added log
        console.log('[ModalManager.updateRoomSuggestions] Suggestions data received:', suggestions); // Log the suggestions data
        suggestionsContainer.innerHTML = ''; // Clear loading state

        if (suggestions && suggestions.length > 0) {
          console.log('[ModalManager.updateRoomSuggestions] Suggestions found, showing section and rendering items.'); // Added log
          // Show the entire suggestions section if it was hidden
          suggestionsSection.style.display = 'block';
          // Ensure carousel nav is visible
          carouselNav.forEach(nav => nav.style.display = ''); // Or 'block' or 'flex' as appropriate


          // Use TemplateEngine to render each suggestion item
          suggestions.forEach(suggestion => {
            console.log('[ModalManager.updateRoomSuggestions] Rendering suggestion item:', suggestion); // Log each suggestion item being rendered
            // Ensure suggestion data includes necessary IDs for the button
            const suggestionData = {
              ...suggestion,
              estimate_id: estimateId,
              room_id: roomId // Pass the room ID to the suggestion item template
            };
            const suggestionElement = TemplateEngine.create('suggestion-item-template', suggestionData);
            if (suggestionElement) {
              suggestionsContainer.appendChild(suggestionElement);
            } else {
              console.warn('[ModalManager.updateRoomSuggestions] Failed to create suggestion element from template for suggestion:', suggestion); // Added log
            }
          });
          console.log(`[ModalManager.updateRoomSuggestions] Rendered ${suggestions.length} suggestion items.`); // Added log

          // Initialize the carousel for this specific room's suggestions container
          console.log(`[ModalManager.updateRoomSuggestions] Initializing carousel for room ${roomId}.`); // Added log
          // Destroy existing instance if any and create a new one
          if (carouselWrapper.carouselInstance) {
            carouselWrapper.carouselInstance.destroy();
          }
          carouselWrapper.carouselInstance = new SuggestionsCarousel(carouselWrapper); // Store instance

        } else {
          console.log(`[ModalManager.updateRoomSuggestions] No suggestions found. Hiding suggestions section.`); // Added log
          // If no suggestions are returned, hide the entire suggestions section
          suggestionsSection.style.display = 'none';
          suggestionsContainer.innerHTML = ''; // Clear any old suggestions
          // Hide carousel nav
          carouselNav.forEach(nav => nav.style.display = 'none');
          // Destroy existing carousel instance if any
          if (carouselWrapper.carouselInstance) {
            carouselWrapper.carouselInstance.destroy();
            carouselWrapper.carouselInstance = null; // Clear reference
          }
        }
      })
      .catch(error => {
        console.error(`[ModalManager.updateRoomSuggestions] Error fetching suggestions:`, error); // Added log
        // Display an error message in the suggestions container
        suggestionsContainer.innerHTML = '<p class="error-message">Error loading suggestions.</p>';
        // Hide the suggestions section on error
        suggestionsSection.style.display = 'none';
        // Hide carousel nav on error
        carouselNav.forEach(nav => nav.style.display = 'none');
        // Destroy existing carousel instance if any
        if (carouselWrapper.carouselInstance) {
          carouselWrapper.carouselInstance.destroy();
          carouselWrapper.carouselInstance = null; // Clear reference
        }
      });
  }





  /**
   * Binds click events to the suggestions toggle button within each room.
   * This controls the visibility of the suggestions carousel.
   */
  bindSuggestionsToggle() {
    console.log('[ModalManager] Binding suggestions toggle buttons');

    // Use event delegation on the main estimates list container
    if (!this.estimatesList) {
      console.warn('[ModalManager] Estimates list container not available for binding suggestions toggle.');
      return;
    }

    // Remove any existing handler to prevent duplicates
    if (this._suggestionsToggleHandler) {
      this.estimatesList.removeEventListener('click', this._suggestionsToggleHandler);
    }

    // Create and store the new handler
    this._suggestionsToggleHandler = (e) => {
      const toggleButton = e.target.closest('.product-suggestions-toggle');

      if (toggleButton) {
        e.preventDefault();
        e.stopPropagation(); // Prevent this click from triggering the main room accordion

        console.log('[ModalManager] Suggestions toggle button clicked.');

        const suggestionsSection = toggleButton.closest('.product-suggestions');
        const suggestionsWrapper = suggestionsSection ? suggestionsSection.querySelector('.suggestions-container-wrapper') : null;
        const toggleIcon = toggleButton.querySelector('.toggle-icon');

        if (suggestionsWrapper) {
          // Toggle the 'expanded' class on the button
          toggleButton.classList.toggle('expanded');

          // Toggle the icon class
          if (toggleIcon) {
            toggleIcon.classList.toggle('dashicons-arrow-down-alt2');
            toggleIcon.classList.toggle('dashicons-arrow-up-alt2');
          }


          // Toggle the visibility of the suggestions wrapper with animation
          if (window.getComputedStyle(suggestionsWrapper).display === 'none' || !suggestionsWrapper.classList.contains('visible')) {
            console.log('[ModalManager] Expanding suggestions section.');
            suggestionsWrapper.classList.add('visible');
            if (typeof jQuery !== 'undefined') {
              jQuery(suggestionsWrapper).slideDown(200, () => {
                // Initialize carousels after slideDown completes
                const carousels = suggestionsWrapper.querySelectorAll('.suggestions-carousel');
                if (carousels.length) {
                  console.log('[ModalManager] Initializing carousels in suggestions section after toggle.');
                  carousels.forEach(container => {
                    if (container.carouselInstance) {
                      container.carouselInstance.destroy();
                    }
                    new SuggestionsCarousel(container);
                  });
                }
              });
            } else {
              suggestionsWrapper.style.display = 'block';
              // Initialize carousels after setting display block
              const carousels = suggestionsWrapper.querySelectorAll('.suggestions-carousel');
              if (carousels.length) {
                console.log('[ModalManager] Initializing carousels in suggestions section after toggle.');
                carousels.forEach(container => {
                  if (container.carouselInstance) {
                    container.carouselInstance.destroy();
                  }
                  new SuggestionsCarousel(container);
                });
              }
            }
          } else {
            console.log('[ModalManager] Collapsing suggestions section.');
            suggestionsWrapper.classList.remove('visible');
            if (typeof jQuery !== 'undefined') {
              jQuery(suggestionsWrapper).slideUp(200);
            } else {
              suggestionsWrapper.style.display = 'none';
            }
          }
        } else {
          console.warn('[ModalManager] Suggestions container wrapper not found for toggling.');
        }
      }
    };

    // Add the new handler using event delegation
    this.estimatesList.addEventListener('click', this._suggestionsToggleHandler);
    console.log('[ModalManager] Suggestions toggle events bound to #estimates element.');
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
   * Show new estimate form using template rendering
   */
  showNewEstimateForm() {
    console.log('Showing new estimate form using template');

    // Hide other views that might be visible
    // Assuming these wrappers are persistent in the PHP template
    if (this.estimatesList) this.estimatesList.style.display = 'none';
    if (this.estimateSelection) this.estimateSelection.style.display = 'none';
    if (this.roomSelectionForm) this.roomSelectionForm.style.display = 'none';


    // Ensure the form wrapper element exists in the DOM (it should be in your PHP template)
    if (!this.newEstimateForm) {
      console.error('New estimate form wrapper (#new-estimate-form-wrapper) not found in modal template!');
      this.showError('Modal structure incomplete. Cannot show new estimate form.');
      this.hideLoading(); // Ensure loading is hidden on error
      return;
    }

    // Force visibility of the form wrapper element
    this.forceElementVisibility(this.newEstimateForm);

    // Show loading state briefly while template is inserted and events are bound
    this.showLoading();


    // --- NEW: Insert form content using TemplateEngine ---
    // Clear any existing content inside the wrapper before inserting the new template
    // This prevents multiple forms from appearing if the button is clicked repeatedly
    this.newEstimateForm.innerHTML = '';

    try {
      // Use the TemplateEngine to create and insert the form HTML from the template
      // Insert it into the predefined #new-estimate-form-wrapper element
      TemplateEngine.insert('new-estimate-form-template', {}, this.newEstimateForm); // The second argument {} can be used to pass data if needed

      console.log('New estimate form template inserted into wrapper.');

      // Get a reference to the actual <form> element that was just inserted
      const formElement = this.newEstimateForm.querySelector('form#new-estimate-form');

      if (formElement) {
        // Bind events to the newly inserted form element
        // Pass the currentProductId if you need to set it on the form's data attribute
        this.bindNewEstimateFormEvents(formElement, this.currentProductId);

        console.log('Called bindNewEstimateFormEvents for the new form.');
      } else {
        console.error('Form element with ID #new-estimate-form not found inside #new-estimate-form-wrapper after template insertion!');
        this.showError('Error rendering form template. Please try again.');
      }

    } catch (error) {
      console.error('Error inserting new estimate form template:', error);
      this.showError('Error loading form template. Please try again.');
    } finally {
      // Hide loading after the template insertion and binding attempt
      this.hideLoading();
    }
    // --- END NEW ---

    // Remove the old check for querySelector('form') and the loadNewEstimateForm call entirely.
    // The logic above replaces it.
  }

  /**
   * Show new room form using template rendering
   * @param {string} estimateId - Estimate ID for the new room
   * @param {string|null} productId - Optional product ID if adding a product to this new room
   */
  showNewRoomForm(estimateId, productId = null) {
    console.log('Showing new room form using template for estimate:', estimateId, 'with product:', productId);

    // Hide other views
    if (this.estimatesList) this.estimatesList.style.display = 'none';
    if (this.estimateSelection) this.estimateSelection.style.display = 'none';
    if (this.roomSelectionForm) this.roomSelectionForm.style.display = 'none';
    if (this.newEstimateForm) this.newEstimateForm.style.display = 'none'; // Ensure new estimate form is hidden


    // Ensure the form wrapper element exists in the DOM (it should be in your PHP template)
    if (!this.newRoomForm) {
      console.error('New room form wrapper (#new-room-form-wrapper) not found in modal template!');
      this.showError('Modal structure incomplete. Cannot show new room form.');
      this.hideLoading(); // Ensure loading is hidden on error
      return;
    }

    // Force visibility of the form wrapper element
    this.forceElementVisibility(this.newRoomForm);

    // Show loading state briefly while template is inserted and events are bound
    this.showLoading();

    // Clear any existing content inside the wrapper before inserting the new template
    this.newRoomForm.innerHTML = '';

    try {
      // Use the TemplateEngine to create and insert the form HTML from the template
      // Pass estimateId and productId to the template data if needed for initial values or data attributes
      TemplateEngine.insert('new-room-form-template', {
        estimate_id: estimateId,
        product_id: productId
      }, this.newRoomForm);

      console.log('New room form template inserted into wrapper.');

      // Get a reference to the actual <form> element that was just inserted
      const formElement = this.newRoomForm.querySelector('form#new-room-form');

      if (formElement) {
        // Bind events to the newly inserted form element
        this.bindNewRoomFormEvents(formElement, estimateId, productId);

        console.log('Called bindNewRoomFormEvents for the new room form.');
      } else {
        console.error('Form element with ID #new-room-form not found inside #new-room-form-wrapper after template insertion!');
        this.showError('Error rendering form template. Please try again.');
      }

    } catch (error) {
      console.error('Error inserting new room form template:', error);
      this.showError('Error loading form template. Please try again.');
    } finally {
      // Hide loading after the template insertion and binding attempt
      this.hideLoading();
    }
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
        const estimateId = addRoomButton.dataset.estimateId;
        console.log('Add room button clicked for estimate:', estimateId);

        // Get product ID if available (e.g., from modal dataset if we are in product flow)
        const productId = this.currentProductId; // Use the stored currentProductId

        if (estimateId !== null && estimateId !== undefined && estimateId !== '') {
          // --- END MODIFIED CHECK ---
          // Call the modified showNewRoomForm
          this.showNewRoomForm(estimateId, productId);
        } else {
          console.error('No estimate ID found for add room button');
          this.showError('Cannot add room: Missing estimate ID.'); // Show error to user
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
    const backButton = form.querySelector('.cancel-btn'); // Assuming cancel-btn is also the back button
    if (backButton) {
      if (this._backButtonHandler) {
        backButton.removeEventListener('click', this._backButtonHandler);
      }

      this._backButtonHandler = () => {
        console.log('Back button clicked in room selection form');
        // Go back to estimate selection view
        this.forceElementVisibility(this.estimateSelectionForm);
        this.forceElementVisibility(this.estimateSelection);
        this.roomSelectionForm.style.display = 'none'; // Hide the room selection form
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
        console.log('Add new room button clicked in room selection form');
        // Get the estimate ID from the room selection form's data attribute
        const estimateId = this.roomSelectionForm.dataset.estimateId;
        // Get the product ID from the modal's data attribute
        const productId = this.currentProductId;

        console.log('Estimate ID for new room:', estimateId, 'Product ID:', productId);

        if (estimateId) {
          // Call the modified showNewRoomForm
          this.showNewRoomForm(estimateId, productId);
        } else {
          console.error('No estimate ID found for add new room button in room selection form');
          this.showError('Cannot add room: Missing estimate ID.'); // Show error to user
        }
      };

      addRoomButton.addEventListener('click', this._addNewRoomHandler);
      console.log('Add new room button handler bound in room selection form');
    } else {
      console.warn('Add new room button not found in room selection form');
    }

    console.log('Room selection form events bound successfully');
  }

  /**
   * Update handleEstimateSelection to bind room selection form events
   */
  handleEstimateSelection(form) {
    // Get the selected estimate ID from the dropdown
    const estimateDropdown = form.querySelector('#estimate-dropdown');
    const estimateId = String(estimateDropdown ? estimateDropdown.value || '' : '').trim();

    // Get the current product ID from the modal state
    const productId = String(this.currentProductId || '').trim();

    // Validate that an estimate was selected
    if (!estimateId) {
      this.showError('Please select an estimate to continue.');
      return;
    }

    // Show the loading indicator
    this.showLoading();

    // Use the DataService to get rooms for the selected estimate
    this.dataService.getRoomsForEstimate(estimateId, productId)
      .then(response => {
        // Hide the estimate selection form wrapper
        if (this.estimateSelectionForm) {
          this.estimateSelectionForm.style.display = 'none';
        } else {
          console.warn('Estimate selection form wrapper not found when trying to hide it.');
        }


        // *** ADD setTimeout HERE to allow DOM to update after template insertion ***
        // A 0ms delay is often enough to defer the task until the current call stack is clear
        setTimeout(() => {

          // Ensure the room selection form wrapper element exists
          const roomSelectionWrapper = this.modal.querySelector('#room-selection-form-wrapper'); // Query the main modal for the wrapper
          if (!roomSelectionWrapper) {
            console.error('Room selection form wrapper not found in modal template!');
            this.showError('Modal structure incomplete. Cannot proceed.');
            this.hideLoading(); // Hide loading on error
            return;
          }

          // Update the instance property to ensure it's correct
          this.roomSelectionForm = roomSelectionWrapper; // *** Update the instance property ***


          // If the estimate has rooms (based on the response from DataService)
          if (response.has_rooms) {
            console.log('Estimate has rooms, showing room selection form.');

            // Force visibility of the room selection form wrapper
            this.forceElementVisibility(this.roomSelectionForm);

            // Populate the room dropdown - query *within* the correct wrapper element
            const roomDropdown = this.roomSelectionForm.querySelector('#room-dropdown');

            if (roomDropdown) {
              // Clear existing options and add a default option
              roomDropdown.innerHTML = '';
              const defaultOption = document.createElement('option');
              defaultOption.value = '';
              defaultOption.textContent = productEstimatorVars.i18n.select_room || '-- Select a Room --';
              roomDropdown.appendChild(defaultOption);

              // Add room options from the response data
              if (Array.isArray(response.rooms)) {
                response.rooms.forEach(room => {
                  if (room && room.id !== undefined && room.name !== undefined && room.dimensions !== undefined) {
                    const option = document.createElement('option');
                    option.value = room.id;
                    option.textContent = `${room.name} (${room.dimensions})`; // Use the formatted dimensions
                    roomDropdown.appendChild(option);
                  } else {
                    console.warn('Skipping invalid room data received:', room);
                  }
                });
                console.log(`Populated room dropdown with ${response.rooms.length} rooms.`);
              } else {
                console.warn('Received non-array data for rooms:', response.rooms);
              }


              // Store the estimate ID on the room selection form wrapper for later use (e.g., adding a new room)
              this.roomSelectionForm.dataset.estimateId = estimateId;

              // Find the "Add New Room" button within the room selection form wrapper
              const addNewRoomButton = this.roomSelectionForm.querySelector('#add-new-room-from-selection');
              if (addNewRoomButton) {
                // Set the data-estimate-id on the button if your logic requires it there too
                addNewRoomButton.dataset.estimateId = estimateId;
                console.log('Set estimate ID on Add New Room button:', estimateId);
              } else {
                console.warn('Add New Room button not found in room selection form.');
              }


              // Important: Bind the form events to the room selection form
              // This function will now correctly find the form inside the wrapper
              this.bindRoomSelectionFormEvents();

              // Hide loading is handled in the .finally block
              // Ensure no double hideLoading calls if bindEvents or populate finishes quickly
              // this.hideLoading();


            } else {
              console.error('Room dropdown element (#room-dropdown) not found inside the room selection form wrapper!');
              this.showError('Modal structure incomplete. Cannot show room selection form.');
              // Hide loading immediately as there's nothing else to do in this path
              this.hideLoading();
            }

          } else {
            // No rooms found for this estimate, proceed directly to showing the new room form
            console.log('No rooms found for this estimate, showing new room form.');

            // Pass the estimateId and productId to the showNewRoomForm function
            // showNewRoomForm handles showing the correct wrapper and setting data attributes
            this.showNewRoomForm(estimateId, productId);
            // hideLoading() is handled within showNewRoomForm's finally block
          }

        }, 0); // A 0ms delay is usually sufficient

      })
      .catch(error => {
        // Handle errors from getRoomsForEstimate
        this.log('Error getting rooms for estimate:', error);
        this.showError(error.message || 'Error loading rooms. Please try again.');
      })
      .finally(() => {
        // Ensure loading is hidden after the entire process (both success and error paths)
        // This finally block will execute after the .then() or .catch() completes.
        // If hideLoading is called inside the setTimeout paths, this will simply be redundant, which is fine.
        this.hideLoading();
      });
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
   * MODIFIED to call updateRoomSuggestions after successful add and list reload.
   * @param {HTMLFormElement} form - The submitted form
   */
  handleRoomSelection(form) {
    const roomDropdown = form.querySelector('#room-dropdown');
    const roomId = String(roomDropdown ? roomDropdown.value || '' : '').trim();
    const productId = String(this.currentProductId || '').trim();
    const estimateId = String(this.roomSelectionForm.dataset.estimateId || '').trim();

    if (roomId === undefined || roomId === null || roomId === '') {
      this.showError('Please select a room');
      console.error('[ModalManager.handleRoomSelection] Room selection requires a valid room ID but it was empty or invalid');
      return;
    }

    if (productId === undefined || productId === null || productId === '' || productId === '0') {
      this.showError('No product selected');
      console.error('[ModalManager.handleRoomSelection] Room selection requires a valid product ID but it was empty or invalid');
      return;
    }

    console.log('[ModalManager.handleRoomSelection] Room selection validated with:', {
      roomId,
      productId,
      estimateId
    });

    this.showLoading();

    this.dataService.addProductToRoom(roomId, productId, estimateId)
      .then(localResult => {
        console.log('[ModalManager.handleRoomSelection] Room selection add product local storage attempt result:', localResult);

        if (localResult.success) {
          console.log('[ModalManager.handleRoomSelection] Local storage add successful. Refreshing list.');

          this.estimateSelection.style.display = 'none';
          this.roomSelectionForm.style.display = 'none';

          delete this.modal.dataset.productId;
          this.currentProductId = null;

          const responseEstimateId = localResult.estimate_id || estimateId; // Corrected to use localResult.estimate_id
          const responseRoomId = localResult.room_id || roomId; // Corrected to use localResult.room_id

          console.log(`[ModalManager.handleRoomSelection] Product added to estimate ${responseEstimateId}, room ${responseRoomId} (based on local storage)`);

          // --- KEY LINE FOR EXPANSION ---
          // Call loadEstimatesList with the room and estimate IDs to expand
          this.loadEstimatesList(responseRoomId, responseEstimateId)
            .then(() => {
              // *** MODIFIED: After list reloads and room is expanded, update suggestions for *this* room ***
              // Find the newly loaded room element in the DOM
              const roomElement = this.modal.querySelector(`.accordion-item[data-room-id="${responseRoomId}"][data-estimate-id="${responseEstimateId}"]`);
              if (roomElement) {
                console.log('[ModalManager.handleRoomSelection] List reloaded. Triggering suggestion update for room:', responseRoomId);
                // Pass the room element, estimate ID, and room ID to the update function
                this.updateRoomSuggestions(responseEstimateId, responseRoomId, roomElement);
              } else {
                console.warn('[ModalManager.handleRoomSelection] Could not find room element after list reload to update suggestions.');
              }
              // *** END MODIFIED ***

              // Show success message after the list is loaded and expanded
              this.showMessage('Product added successfully!', 'success');
            })
            .catch(error => {
              console.error('[ModalManager.handleRoomSelection] Error refreshing estimates list:', error);
              this.showError('Error refreshing estimates list. Please try again.');
            });
          // --- END KEY LINE ---

        } else {
          console.error('[ModalManager.handleRoomSelection] Error during local storage add:', localResult.error);
          this.showError(localResult.error.message || 'Failed to add product locally. Please try again.');
        }
      })
      .catch(error => {
        console.error('[ModalManager.handleRoomSelection] Error adding product from room selection via DataService:', error);

        if (error.data?.duplicate) {
          console.log('[ModalManager.handleRoomSelection] Duplicate product detected from room selection by DataService:', error.data);

          this.estimateSelection.style.display = 'none';
          this.roomSelectionForm.style.display = 'none';

          delete this.modal.dataset.productId;
          this.currentProductId = null;

          const duplicateEstimateId = error.data.estimate_id;
          const duplicateRoomId = error.data.room_id;

          this.showError(error.data.message || 'This product already exists in the selected room.');

          // --- KEY LINE FOR EXPANSION (Duplicate Case) ---
          // Call loadEstimatesList with the duplicate room and estimate IDs to show where it exists
          this.loadEstimatesList(duplicateRoomId, duplicateEstimateId)
            .then(() => {
              console.log('[ModalManager.handleRoomSelection] Estimates list refreshed to show duplicate product location');
              // No need to update suggestions here, as the room already contains the product.
            })
            .catch(error => {
              console.error('[ModalManager.handleRoomSelection] Error refreshing estimates list:', error);
            });
          // --- END KEY LINE ---

        } else {
          const errorMessage = error.message || 'Error adding product to room. Please try again.';
          this.showError(errorMessage);
          console.error('[ModalManager.handleRoomSelection] DataService error:', error);
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

          console.log('New estimate created in product flow, showing new room form for estimate ID:', newEstimateId, 'with product ID:', productId);

          // Call the modified showNewRoomForm
          this.showNewRoomForm(newEstimateId, productId); // Pass both IDs

          // Note: showNewRoomForm now handles setting data attributes and visibility
          // The hideLoading() that was previously here is no longer needed.

        } else {
          // Just refresh the estimates list
          console.log('New estimate created in general flow, refreshing estimates list.');
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
   * MODIFIED to call updateRoomSuggestions after successful add and list reload.
   * @param {HTMLFormElement} form - The submitted form
   * @param {Event} event - The form submission event
   */
  handleNewRoomSubmission(form, event) {
    console.log('[ModalManager.handleNewRoomSubmission] Processing new room form submission via DataService');

    if (event) {
      event.preventDefault();
    } else if (typeof window.event !== 'undefined') {
      window.event.preventDefault();
    }

    if (!form.checkValidity()) {
      console.error('[ModalManager.handleNewRoomSubmission] Form validation failed');
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const estimateId = form.dataset.estimateId;
    const productId = this.currentProductId || form.dataset.productId;

    console.log('[ModalManager.handleNewRoomSubmission] Room form submission data:', {
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

    console.log('[ModalManager.handleNewRoomSubmission] Calling DataService.addNewRoom for estimate ID:', estimateId);

    this.dataService.addNewRoom(formData, estimateId, productId)
      .then(response => {
        console.log('[ModalManager.handleNewRoomSubmission] DataService.addNewRoom response:', response);

        form.reset();
        this.newRoomForm.style.display = 'none';

        delete this.modal.dataset.productId;
        this.currentProductId = null;

        const responseEstimateId = response.estimate_id || estimateId;
        const responseRoomId = response.room_id || '0';

        console.log(`[ModalManager.handleNewRoomSubmission] New room added to estimate ${responseEstimateId}, room ${responseRoomId}`);

        // --- KEY LINE FOR EXPANSION ---
        // Call loadEstimatesList with the newly added room and its estimate IDs to expand
        this.loadEstimatesList(responseRoomId, responseEstimateId)
          .then(() => {
            // Show success message after the list is loaded and expanded
            this.showMessage('Room added successfully!', 'success');

            // *** MODIFIED: After list reloads and room is expanded, update suggestions for *this* room ***
            // Find the newly loaded room element in the DOM
            const roomElement = this.modal.querySelector(`.accordion-item[data-room-id="${responseRoomId}"][data-estimate-id="${responseEstimateId}"]`);
            if (roomElement) {
              console.log('[ModalManager.handleNewRoomSubmission] List reloaded. Triggering suggestion update for room:', responseRoomId);
              // Pass the room element, estimate ID, and room ID to the update function
              this.updateRoomSuggestions(responseEstimateId, responseRoomId, roomElement);
            } else {
              console.warn('[ModalManager.handleNewRoomSubmission] Could not find room element after list reload to update suggestions.');
            }
            // *** END MODIFIED ***
          })
          .catch(error => {
            console.error('[ModalManager.handleNewRoomSubmission] Error refreshing estimates list:', error);
            this.showError('Error refreshing estimates list. Please try again.');
          });
        // --- END KEY LINE ---

      })
      .catch(error => {
        console.error('[ModalManager.handleNewRoomSubmission] Error adding room via DataService:', error);
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
          // Clear data attributes when hidden
          this.newRoomForm.removeAttribute('data-estimate-id');
          this.newRoomForm.removeAttribute('data-product-id');
          const form = this.newRoomForm.querySelector('form');
          if(form) {
            form.removeAttribute('data-estimate-id');
            form.removeAttribute('data-product-id');
          }
        }


        // Determine where to go back to
        // If we came from room selection (product flow)
        if (this.currentProductId && this.roomSelectionForm && this.roomSelectionForm.dataset.estimateId) {
          console.log('Canceling room form, returning to room selection.');
          this.forceElementVisibility(this.roomSelectionForm);
          // Assuming estimateSelection is the parent wrapper that needs to be visible too
          if (this.estimateSelection) {
            this.forceElementVisibility(this.estimateSelection);
          }

        } else if (this.currentProductId && this.estimateSelection && this.estimateSelection.dataset.estimateId) {
          // If we came from estimate selection (product flow, but no rooms existed)
          console.log('Canceling room form, returning to estimate selection (no rooms existed).');
          this.forceElementVisibility(this.estimateSelection);
          // Ensure estimate selection form is also visible if it's a separate element
          if (this.estimateSelectionForm) {
            this.forceElementVisibility(this.estimateSelectionForm);
          }

        } else {
          // Regular flow (no product being added), return to estimates list
          console.log('Canceling room form, returning to estimates list.');
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
   * Initialize accordion functionality for rooms with better multi-estimate support
   * This function handles the actual expansion logic based on provided IDs.
   * It initiates the loading of similar products concurrently for each product item.
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

        const accordionItem = header.closest('.accordion-item');
        if (accordionItem) {
          const content = accordionItem.querySelector('.accordion-content');
          if (content && window.getComputedStyle(content).display !== 'none') {
            // Content is visible, initialize carousels and load similar products
            setTimeout(() => {
              // Initialize Suggestions Carousels (runs concurrently with similar product loading)
              const suggestionCarousels = content.querySelectorAll('.product-suggestions .suggestions-carousel');
              if (suggestionCarousels.length) {
                this.log(`Found ${suggestionCarousels.length} suggestion carousels in opened accordion`);
                if (typeof initSuggestionsCarousels === 'function') {
                  initSuggestionsCarousels();
                }
              }

              // Load Similar Products for each product item in the expanded room (runs concurrently)
              const productItems = content.querySelectorAll('.product-item');
              const estimateId = accordionItem.dataset.estimateId;
              const roomId = accordionItem.dataset.roomId;

              if (productItems.length > 0 && estimateId && roomId) {
                this.log(`Found ${productItems.length} product items in room ${roomId}, loading similar products.`);
                productItems.forEach(productItem => {
                  // Only load if similar products haven't been loaded for this item yet
                  if (!productItem.dataset.similarProductsLoaded) {
                    // Check if the product item is a regular product (not a note)
                    const isNote = productItem.classList.contains('product-note-item');
                    if (!isNote) {
                      // Call loadSimilarProductsForProduct for each product item
                      this.loadSimilarProductsForProduct(productItem, estimateId, roomId);
                    } else {
                      // Mark notes as processed so we don't try to load similar products for them
                      productItem.dataset.similarProductsLoaded = 'true';
                    }
                  } else {
                    this.log(`Similar products already loaded for product item ${productItem.dataset.productId || 'unknown'}.`);
                  }
                });
              } else {
                this.log(`No product items found in room ${roomId} or missing estimate/room ID. Skipping similar products load.`);
              }

            }, 100); // Small delay to ensure DOM is ready after accordion animation
          }
        }
      }
    };

    // Add the event listener to the estimates list container
    if (this.estimatesList) {
      this.estimatesList.addEventListener('click', this.accordionHandler);
      this.log('Accordion event handler (re)attached');

      // If a specific room ID is provided, find and expand that accordion item
      if (expandRoomId) {
        // Build selector based on available information
        let selector = `.accordion-item[data-room-id="${expandRoomId}"]`;

        // If specific estimate ID is provided, make the selector more precise
        if (expandEstimateId) {
          selector = `.estimate-section[data-estimate-id="${expandEstimateId}"] ${selector}`;
        }

        console.log(`[ModalManager.initializeAccordions] Looking for room with selector: ${selector} for auto-expansion`);

        const roomElement = this.modal.querySelector(selector);
        if (roomElement) {
          this.log(`[ModalManager.initializeAccordions] Found room element to expand: ${selector}`);

          // First ensure the estimate container is visible if it's a nested structure
          const estimateSection = roomElement.closest('.estimate-section');
          if (estimateSection) {
            console.log(`[ModalManager.initializeAccordions] Found parent estimate section for room ${expandRoomId}, ensuring visibility.`);
            // Make sure the estimate section is visible
            estimateSection.style.display = 'block';

            // Also ensure the estimate accordion is not collapsed and its content is visible
            estimateSection.classList.remove('collapsed');
            const estimateContent = estimateSection.querySelector('.estimate-content');
            if (estimateContent) {
              console.log(`[ModalManager.initializeAccordions] Ensuring estimate content for ${expandEstimateId} is visible.`);
              estimateContent.style.display = 'block';
              if (typeof jQuery !== 'undefined') {
                jQuery(estimateContent).show(0); // Show immediately
              }
            }

            // Re-initialize estimate accordion logic briefly for this section if needed (optional, might be handled by initializeEstimateAccordions)
            const estimateHeader = estimateSection.querySelector('.estimate-header');
            if(estimateHeader && typeof jQuery !== 'undefined') {
              jQuery(estimateHeader).addClass('active'); // Ensure header is active
            }
          } else {
            console.warn(`[ModalManager.initializeAccordions] Parent estimate section not found for room ${expandRoomId} using closest('.estimate-section')`);
          }


          // Now expand the room accordion
          const header = roomElement.querySelector('.accordion-header');
          if (header) {
            console.log(`[ModalManager.initializeAccordions] Found room header for room ${expandRoomId}, expanding.`);
            header.classList.add('active');

            const content = roomElement.querySelector('.accordion-content');
            if (content) {
              console.log(`[ModalManager.initializeAccordions] Found room content for room ${expandRoomId}, showing.`);
              content.style.display = 'block';

              if (typeof jQuery !== 'undefined') {
                jQuery(content).slideDown(300, function() {
                  console.log(`[ModalManager.initializeAccordions] jQuery slideDown complete for room ${expandRoomId}, attempting to scroll.`);
                  roomElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

                  // Load Similar Products for each product item in the expanded room after animation
                  const productItems = content.querySelectorAll('.product-item');
                  const estimateId = roomElement.dataset.estimateId;
                  const roomId = roomElement.dataset.roomId;

                  if (productItems.length > 0 && estimateId && roomId) {
                    this.log(`Found ${productItems.length} product items in room ${roomId} after slideDown, loading similar products.`);
                    productItems.forEach(productItem => {
                      // Only load if similar products haven't been loaded for this item yet
                      if (!productItem.dataset.similarProductsLoaded) {
                        const isNote = productItem.classList.contains('product-note-item');
                        if (!isNote) {
                          this.loadSimilarProductsForProduct(productItem, estimateId, roomId);
                        } else {
                          productItem.dataset.similarProductsLoaded = 'true';
                        }
                      }
                    });
                  } else {
                    this.log(`No product items found in room ${roomId} or missing estimate/room ID after slideDown. Skipping similar products load.`);
                  }

                  // Initialize Suggestions Carousels after slideDown
                  const suggestionCarousels = content.querySelectorAll('.product-suggestions .suggestions-carousel');
                  if (suggestionCarousels.length) {
                    this.log(`Found ${suggestionCarousels.length} suggestion carousels in auto-opened accordion after slideDown.`);
                    if (typeof initSuggestionsCarousels === 'function') {
                      initSuggestionsCarousels();
                    }
                  }


                }.bind(this)); // Bind 'this' to the callback
              } else {
                console.log(`[ModalManager.initializeAccordions] No jQuery, setting display: block for room ${expandRoomId}.`);
                content.style.display = 'block';
                roomElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Load Similar Products immediately if no jQuery animation
                const productItems = content.querySelectorAll('.product-item');
                const estimateId = roomElement.dataset.estimateId;
                const roomId = roomElement.dataset.roomId;

                if (productItems.length > 0 && estimateId && roomId) {
                  this.log(`Found ${productItems.length} product items in room ${roomId} immediately, loading similar products.`);
                  productItems.forEach(productItem => {
                    if (!productItem.dataset.similarProductsLoaded) {
                      const isNote = productItem.classList.contains('product-note-item');
                      if (!isNote) {
                        this.loadSimilarProductsForProduct(productItem, estimateId, roomId);
                      } else {
                        productItem.dataset.similarProductsLoaded = 'true';
                      }
                    }
                  });
                } else {
                  this.log(`No product items found in room ${roomId} or missing estimate/room ID immediately. Skipping similar products load.`);
                }

                setTimeout(() => {
                  if (typeof initSuggestionsCarousels === 'function') {
                    initSuggestionsCarousels();
                    console.log(`[ModalManager.initializeAccordions] Initialized carousels in room ${expandRoomId} content.`);
                  } else {
                    console.warn('[ModalManager.initializeAccordions] initSuggestionsCarousels function not available.');
                  }
                }, 150);
              }

            } else {
              console.warn(`[ModalManager.initializeAccordions] Room content (.accordion-content) not found for room ID ${expandRoomId}`);
            }

            this.log(`[ModalManager.initializeAccordions] Auto-expanded logic completed for room ID: ${expandRoomId} in estimate: ${expandEstimateId || 'any'}`);
          }
        } else {
          this.log(`[ModalManager.initializeAccordions] Room ID ${expandRoomId} not found for auto-expansion using selector: ${selector}`);
          const allRooms = this.modal.querySelectorAll('.accordion-item[data-room-id]');
          this.log(`[ModalManager.initializeAccordions] Available room elements found in modal: ${Array.from(allRooms).map(r => r.dataset.roomId).join(', ')}`);
        }
      } else if (expandEstimateId) {
        console.log(`[ModalManager.initializeAccordions] expandRoomId not provided, checking if only estimate ${expandEstimateId} needs expansion.`);
        const estimateSection = this.modal.querySelector(`.estimate-section[data-estimate-id="${expandEstimateId}"]`);
        if(estimateSection) {
          console.log(`[ModalManager.initializeAccordions] Found estimate section ${expandEstimateId}, expanding.`);
          estimateSection.classList.remove('collapsed');
          const estimateContent = estimateSection.querySelector('.estimate-content');
          if(estimateContent) {
            estimateContent.style.display = 'block';
            if (typeof jQuery !== 'undefined') {
              jQuery(estimateContent).show(0); // Show immediately
            }
          }
          setTimeout(() => {
            estimateSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 150);
        } else {
          console.warn(`[ModalManager.initializeAccordions] Estimate ID ${expandEstimateId} not found for auto-expansion.`);
        }
      } else {
        console.log('[ModalManager.initializeAccordions] No specific room or estimate ID provided for auto-expansion.');
      }
    }
  }


  /**
   * Load and display similar products for a specific product item.
   * This function is called for each product item in an expanded room
   * and initiates an asynchronous request for similar products.
   * It now gets the room_area from the stored room data in localStorage.
   * @param {HTMLElement} productItemElement - The DOM element for the product item.
   * @param {string} estimateId - The ID of the estimate the product belongs to.
   * @param {string} roomId - The ID of the room the product belongs to.
   */
  loadSimilarProductsForProduct(productItemElement, estimateId, roomId) {
    // Check if similar products are already loaded for this element
    if (productItemElement.dataset.similarProductsLoaded) {
      this.log(`Similar products already loaded for product item ${productItemElement.dataset.productId || 'unknown'}. Skipping load.`);
      return;
    }

    // --- More reliably get the product ID ---
    let productId = productItemElement.dataset.productId; // 1. Try getting from the main element's dataset first

    // 2. If not found on the main element, search for any element with data-product-id within the product item
    if (!productId) {
      const elementWithProductId = productItemElement.querySelector('[data-product-id]');
      if (elementWithProductId && elementWithProductId.dataset.productId) {
        productId = elementWithProductId.dataset.productId;
        this.log(`Found product ID from nested element: ${productId}`);
      }
    }

    // 3. Fallback: Check specifically on the remove button, which often has the ID
    if (!productId) {
      const removeButton = productItemElement.querySelector('.remove-product');
      if (removeButton && removeButton.dataset.productId) {
        productId = removeButton.dataset.productId;
        this.log(`Found product ID from remove button: ${productId}`);
      }
    }

    // 4. Final Fallback: Check if the product item has a data-product-index and try to get the ID from the stored data
    // This requires estimateId and roomId to be available.
    if (!productId) {
      const productIndex = productItemElement.dataset.productIndex;
      if (productIndex !== undefined && productIndex !== null && estimateId && roomId) {
        const estimateData = this.loadEstimateData(); // Assuming loadEstimateData is accessible here
        const roomData = estimateData.estimates?.[estimateId]?.rooms?.[roomId];
        const productData = roomData?.products?.[productIndex];
        if (productData && productData.id) {
          productId = productData.id;
          this.log(`Found product ID from stored data using index: ${productId}`);
        } else {
          this.log('Product ID not found in stored data for index.', {estimateId, roomId, productIndex, productData});
        }
      } else {
        this.log('Product ID not found on main element, nested element, remove button, or via index in stored data.', {estimateId, roomId, productIndex});
      }
    }
    // --- End product ID retrieval ---

    // --- MODIFIED: Get room area from stored room data ---
    let roomArea = 0;
    if (estimateId && roomId) {
      const estimateData = this.loadEstimateData();
      const roomData = estimateData.estimates?.[estimateId]?.rooms?.[roomId];
      if (roomData) {
        const roomWidth = parseFloat(roomData.width) || 0;
        const roomLength = parseFloat(roomData.length) || 0;
        roomArea = roomWidth * roomLength;
        this.log(`Calculated room area for similar products from stored data: ${roomArea} (from width: ${roomWidth}, length: ${roomLength})`);
      } else {
        this.log('Stored room data not found for calculating room area for similar products.', {estimateId, roomId});
      }
    } else {
      this.log('Estimate ID or Room ID missing for calculating room area from stored data.');
    }
    // --- END MODIFIED ---


    const similarProductsContainer = productItemElement.querySelector('.similar-products-container');
    const similarProductsList = productItemElement.querySelector('.similar-products-list');
    const similarProductsToggle = productItemElement.querySelector('.similar-products-toggle');
    const similarProductsCarousel = productItemElement.querySelector('.similar-products-carousel');
    const carouselNav = similarProductsCarousel ? similarProductsCarousel.querySelectorAll('.suggestions-nav') : [];

    // --- ADDED LOGGING BEFORE ELEMENT CHECK ---
    this.log(`Checking for required elements for product ID ${productId}:`, {
      hasContainer: !!similarProductsContainer,
      hasList: !!similarProductsList,
      hasToggle: !!similarProductsToggle,
      hasCarousel: !!similarProductsCarousel
    });
    // --- END ADDED LOGGING ---


    // Ensure we have the necessary elements AND a valid product ID
    if (!productId || !similarProductsContainer || !similarProductsList || !similarProductsToggle || !similarProductsCarousel) {
      // --- ADDED LOGGING INSIDE SKIP CONDITION ---
      this.log(`Skipping similar products load for product ID ${productId} because required elements are missing.`);
      // --- END ADDED LOGGING ---
      // Mark as loaded to prevent repeated attempts for this product item
      productItemElement.dataset.similarProductsLoaded = 'true';
      // Hide the toggle button if elements are missing or ID is not found
      if (similarProductsToggle) similarProductsToggle.style.display = 'none';
      if (similarProductsContainer) similarProductsContainer.style.display = 'none';
      return;
    }

    this.log(`Loading similar products for product ID: ${productId}`);

    // Show a loading indicator in the list container
    similarProductsList.innerHTML = '<div class="loading-text">Loading similar products...</div>';
    // Initially hide the container and toggle button until we know there are products
    similarProductsContainer.style.display = 'none';
    similarProductsToggle.style.display = 'none';


    // Hide carousel nav while loading
    carouselNav.forEach(nav => nav.style.display = 'none');


    // Fetch similar products using DataService, BYPASSING THE CACHE
    // This call runs asynchronously and concurrently with other similar product calls
    // and the suggested products call.
    // --- MODIFIED: Pass roomArea to DataService ---
    this.dataService.getSimilarProducts(productId, roomArea, true) // Pass roomArea as the second argument
      // --- END MODIFIED ---
      .then(similarProducts => {
        this.log(`Fetched ${similarProducts.length} similar products for product ${productId}. Rendering...`);
        similarProductsList.innerHTML = ''; // Clear loading indicator

        if (similarProducts && similarProducts.length > 0) {
          this.log('Similar products found, rendering items.');

          // Use TemplateEngine to render each similar product item
          similarProducts.forEach(similarProduct => {
            // Ensure similar product data includes necessary IDs for the button
            const similarProductData = {
              ...similarProduct,
              estimate_id: estimateId,
              room_id: roomId,
              replace_product_id: productId // The product being replaced is the current one
            };
            const similarProductElement = TemplateEngine.create('similar-product-item-template', similarProductData);
            if (similarProductElement) {
              similarProductsList.appendChild(similarProductElement);
            } else {
              console.warn('[ModalManager.loadSimilarProductsForProduct] Failed to create similar product element from template for:', similarProduct);
            }
          });

          // Ensure the container is visible (it's initially hidden)
          similarProductsContainer.style.display = 'block';
          similarProductsContainer.classList.add('visible');

          // Ensure the toggle button is visible
          similarProductsToggle.style.display = ''; // Use default display

          // Initialize the carousel for this specific similar products container
          this.log(`Initializing similar products carousel for product ${productId}.`);
          // Destroy existing instance if any and create a new one
          if (similarProductsCarousel.carouselInstance) {
            similarProductsCarousel.carouselInstance.destroy();
          }
          similarProductsCarousel.carouselInstance = new SuggestionsCarousel(similarProductsCarousel); // Use SuggestionsCarousel for similar products too

          // Show carousel nav
          carouselNav.forEach(nav => nav.style.display = '');


          // Bind replace buttons within the newly added similar product items
          this.bindReplaceProductButtons();


        } else {
          // No similar products found, hide the container and toggle button
          this.log('No similar products found. Hiding container and toggle button.');
          similarProductsContainer.style.display = 'none';
          similarProductsContainer.classList.remove('visible');
          similarProductsToggle.style.display = 'none'; // Hide the toggle button
          // Destroy existing carousel instance if any
          if (similarProductsCarousel.carouselInstance) {
            similarProductsCarousel.carouselInstance.destroy();
            similarProductsCarousel.carouselInstance = null; // Clear reference
          }
        }
      })
      .catch(error => {
        console.error(`Error fetching similar products for product ${productId}:`, error);
        similarProductsList.innerHTML = '<p class="error-message">Error loading similar products.</p>'; // Show error message
        similarProductsContainer.style.display = 'none'; // Hide container on error
        similarProductsContainer.classList.remove('visible');
        similarProductsToggle.style.display = 'none'; // Hide the toggle button on error
        // Destroy existing carousel instance if any
        if (similarProductsCarousel.carouselInstance) {
          similarProductsCarousel.carouselInstance.destroy();
          similarProductsCarousel.carouselInstance = null; // Clear reference
        }
      })
      .finally(() => {
        // Mark as loaded regardless of success or failure, to prevent repeated attempts
        productItemElement.dataset.similarProductsLoaded = 'true';
      });
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
          $content.slideDown(200, function() {
            // Initialize carousels after slideDown animation completes
            const carousels = $content.find('.suggestions-carousel');
            if (carousels.length) {
              console.log(`[ModalManager.initializeJQueryAccordions] Initializing carousels in opened accordion via slideDown callback.`);
              carousels.each(function() {
                const container = this;
                if (container.carouselInstance) {
                  container.carouselInstance.destroy();
                }
                new SuggestionsCarousel(container);
              });
            }
          });
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

                // Initialize carousels after slideDown animation completes
                const carousels = $content.find('.suggestions-carousel');
                if (carousels.length) {
                  console.log(`[ModalManager.initializeJQueryAccordions] Initializing carousels in auto-opened room via slideDown callback.`);
                  carousels.each(function() {
                    const container = this;
                    if (container.carouselInstance) {
                      container.carouselInstance.destroy();
                    }
                    new SuggestionsCarousel(container);
                  });
                }
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
   * MODIFIED to show different confirmation text for similar products vs. upgrades.
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
        const productItem = buttonElement.closest('.suggestion-item, .upgrade-tile, .similar-product-item'); // Added .similar-product-item
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

    // --- MODIFIED: Determine dialog text based on button origin ---
    let dialogTitle = 'Confirm Upgrade';
    let confirmButtonText = 'Upgrade';
    let dialogAction = 'upgrade_product'; // Default action

    // Check if the button is within a similar product item
    if (buttonElement && buttonElement.closest('.similar-product-item')) {
      dialogTitle = 'Confirm Replacement';
      confirmButtonText = 'Replace';
      dialogAction = 'replace_product'; // Use a different action identifier if needed
    }
    // --- END MODIFIED ---


    // Build confirmation message
    const confirmMessage = `Are you sure you want to replace "${oldProductName}" with "${newProductName}"?`;

    // Use the confirmation dialog
    if (window.productEstimator && window.productEstimator.dialog) {
      window.productEstimator.dialog.show({
        title: dialogTitle, // Use dynamic title
        message: confirmMessage,
        type: 'product', // Using product type for styling
        action: dialogAction, // Use dynamic action
        confirmText: confirmButtonText, // Use dynamic button text
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
            // Reset text to original based on context (Upgrade or Replace)
            buttonElement.textContent = buttonElement.closest('.similar-product-item') ? 'Replace' : 'Upgrade';
          }
          console.log('Product replacement cancelled');
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
          // Reset text to original based on context (Upgrade or Replace)
          buttonElement.textContent = buttonElement.closest('.similar-product-item') ? 'Replace' : 'Upgrade';
        }
      }
    }
  }

  /**
   * Completely revised executeProductReplacement method for upgrading products
   * with more robust upgrade button handling.
   * This now handles the promise resolving after local storage update.
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
      // Use appropriate text based on replaceType
      const loadingText = replaceType === 'additional_products' ? 'Upgrading...' : 'Replacing...';
      buttonElement.innerHTML = `<span class="loading-dots">${loadingText}</span>`;
    }

    console.log(`[PRODUCT REPLACEMENT] Executing replacement via DataService (waiting for local update):
  Type: ${replaceType}
  Old Product ID: ${oldProductId}
  New Product ID: ${newProductId}
  Room ID: ${roomId}
  Parent Product ID: ${parentProductId}
  Estimate ID: ${estimateId}`);

    // Use DataService to make the replacement request.
    // The promise returned by DataService.replaceProductInRoom now resolves
    // after the local storage update is attempted, *not* after the server request.
    this.dataService.replaceProductInRoom(estimateId, roomId, oldProductId, newProductId, parentProductId, replaceType)
      .then(localResult => { // 'localResult' is the object returned by DataService after local update
        console.log('[PRODUCT REPLACEMENT] DataService.replaceProductInRoom local storage attempt successful:', localResult);

        // The UI update logic now happens here, based on the successful local storage change.

        // Store the replacement chain from the localResult if available
        // This is now handled inside DataService, storing it globally.
        // We can access it later after the list refresh.

        console.log('[PRODUCT REPLACEMENT] Local storage update successful, attempting to load estimates list...');

        // Refresh the estimates list with the room expanded
        // Pass the room and estimate IDs from the localResult for accuracy
        this.loadEstimatesList(localResult.roomId, localResult.estimateId)
          .then(() => {
            console.log('[PRODUCT REPLACEMENT] Estimates list refreshed');

            // Find the updated room element in the DOM after the list refresh
            const roomElement = this.modal.querySelector(`.accordion-item[data-room-id="${localResult.roomId}"][data-estimate-id="${localResult.estimateId}"]`) ||
              this.modal.querySelector(`.accordion-item[data-room-id="${localResult.roomId}"]`); // Fallback selector

            if (roomElement) {
              console.log('[PRODUCT REPLACEMENT] Found updated room element after refresh, performing post-refresh updates.');

              // Ensure the parent estimate section is expanded if it exists
              const estimateSection = roomElement.closest('.estimate-section');
              if (estimateSection) {
                console.log('[PRODUCT REPLACEMENT] Found parent estimate section, ensuring it is not collapsed.');
                // Remove collapsed class and ensure content is visible
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


              // Activate the room's accordion header
              const header = roomElement.querySelector('.accordion-header');
              if (header) header.classList.add('active');

              // Show the room's accordion content
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
                // Use localResult.newProductId and localResult.oldProductId for accuracy
                if (replaceType === 'additional_products') {
                  this.updateAdditionalProductUpgradeButtons(roomElement, localResult.newProductId, localResult.oldProductId);
                }

                // Initialize carousels in the expanded room (suggestions and similar products)
                setTimeout(() => { // Keep a small delay to ensure DOM is ready
                  console.log('[PRODUCT REPLACEMENT] Initializing carousels and rebinding events after list refresh.');
                  if (typeof initSuggestionsCarousels === 'function') {
                    initSuggestionsCarousels();
                  }

                  // Rebind all button events to ensure they work properly on the new DOM elements
                  this.bindReplaceProductButtons();
                  this.bindSuggestedProductButtons();

                  // Update replacement chains on buttons in this room
                  this.updateAllReplacementChains(roomElement); // Ensure this function exists and works with the new structure

                  // Update room and estimate totals based on the localResult
                  if (localResult.room_totals) {
                    this.updateRoomTotals(localResult.estimateId, localResult.roomId, localResult.room_totals);
                  }
                  if (localResult.estimate_totals) {
                    this.updateEstimateTotals(localResult.estimateId, localResult.estimate_totals);
                  }

                  // Show success message
                  this.showMessage('Product updated successfully!', 'success'); // Changed message to "updated"
                }, 300); // Small delay

              } else {
                console.warn('[PRODUCT REPLACEMENT] Room content element not found after refresh.');
                // If no room content, just show success message and hide loading
                this.showMessage('Product updated successfully!', 'success');
              }
            } else {
              console.warn(`[PRODUCT REPLACEMENT] Could not find updated room element for room ID ${localResult.roomId} after refresh.`);
              this.showMessage('Product updated successfully!', 'success');
            }
          })
          .catch(error => {
            // This catch handles errors specifically from loadEstimatesList
            console.error('[PRODUCT REPLACEMENT] Error refreshing estimates list after local update:', error);
            this.showError('Error refreshing list after update. Please try again.');
          });
      })
      .catch(error => {
        // This catch handles errors from the initial fetch or the local storage attempt itself
        console.error('[PRODUCT REPLACEMENT] DataService local update attempt failed:', error);
        this.showError(error.message || 'Error updating product. Please try again.');
      })
      .finally(() => {
        // Ensure button state is reset
        if (buttonElement) {
          buttonElement.disabled = false;
          buttonElement.classList.remove('loading');
          // Reset text to original based on context (Upgrade or Replace)
          buttonElement.textContent = replaceType === 'additional_products' ? 'Upgrade' : 'Replace';
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

  log(...args) {
    if (this.config.debug) {
      console.log('[EstimatorCore]', ...args);
    }
  }
}

// Export the class
export default ModalManager;

