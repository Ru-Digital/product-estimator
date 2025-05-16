/**
 * ModalManager.js
 *
 * Core modal manager that coordinates between specialized managers.
 * This class handles the basic modal functionality and delegates
 * specific responsibilities to specialized manager classes.
 */

import { createLogger } from '@utils';

// Import services and utils first
import { loadEstimateData, saveEstimateData, clearEstimateData } from '../EstimateStorage';
import { loadCustomerDetails, saveCustomerDetails, clearCustomerDetails } from '../CustomerStorage';
import TemplateEngine from '../TemplateEngine';
import ConfirmationDialog from '../ConfirmationDialog';
import ProductSelectionDialog from '../ProductSelectionDialog';

// Import specialized managers
import EstimateManager from './EstimateManager';
import RoomManager from './RoomManager';
import ProductManager from './ProductManager';
import FormManager from './FormManager';
import UIManager from './UIManager';

const logger = createLogger('ModalManager');

class ModalManager {
  /**
   * Initialize the ModalManager
   * @param {object} config - Configuration options
   * @param {object} dataService - The data service instance
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
    
    // Store DataService
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
    
    // Storage functions
    this.loadEstimateData = loadEstimateData;
    this.saveEstimateData = saveEstimateData;
    this.clearEstimateData = clearEstimateData;
    this.loadCustomerDetails = loadCustomerDetails;
    this.saveCustomerDetails = saveCustomerDetails;
    this.clearCustomerDetails = clearCustomerDetails;
    
    // Specialized managers - will be initialized in init()
    this.estimateManager = null;
    this.roomManager = null;
    this.productManager = null;
    this.formManager = null;
    this.uiManager = null;
    this.confirmationDialog = null; // Will be assigned to the global instance or created new
    
    // Bind methods to preserve 'this' context
    this._modalClickHandler = this._modalClickHandler.bind(this);
    this.showLoading = this.showLoading.bind(this);
    this.hideLoading = this.hideLoading.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    
    // Initialize the modal
    this.init();
  }
  
  /**
   * Initialize the ModalManager
   * @returns {ModalManager} The instance for chaining
   */
  init() {
    if (this.initialized) {
      logger.log('ModalManager already initialized');
      return this;
    }
    
    logger.log('Initializing ModalManager');
    
    try {
      // First check if the modal already exists in the DOM (for backward compatibility)
      this.modal = document.querySelector(this.config.selectors.modalContainer);
      
      if (!this.modal) {
        logger.log('Modal element not found in DOM. Creating from template...');
        
        // Create the modal using TemplateEngine
        this.modal = TemplateEngine.createModalContainer();
        
        if (this.modal) {
          logger.log('Modal created successfully from template');
          this.completeInitialization();
        } else {
          logger.error('Failed to create modal from template');
          return this;
        }
      } else {
        logger.log('Found existing modal in DOM, initializing elements');
        this.completeInitialization();
      }
      
      this.initialized = true;
      logger.log('ModalManager initialization completed successfully');
    } catch (error) {
      logger.error('Error initializing ModalManager:', error);
    }
    
    return this;
  }
  
  /**
   * Complete initialization once modal is found
   * @private
   */
  completeInitialization() {
    if (!this.modal) {
      logger.error('Cannot complete initialization - modal element not available');
      return;
    }
    
    // When using templates, we need to allow time for the DOM to fully update
    // before trying to find elements within the newly created template
    logger.log('Modal found, allowing time for DOM to fully update before initializing elements');
    
    // Give a small delay to ensure the DOM is fully updated with the template content
    setTimeout(() => {
      // Initialize elements
      this.initializeElements();
      
      // Set up the loading indicator safety checks
      this.setupLoaderSafety();
      
      // Initialize specialized managers
      this.initializeManagers();
      
      // Bind base events
      this.bindEvents();
      
      // Hide any loading indicators that might be visible
      setTimeout(() => {
        this.ensureLoaderHidden();
      }, 100);
      
      this.initialized = true;
      logger.log('ModalManager initialization completed successfully');
    }, 50); // A short delay to allow DOM rendering to complete
  }
  
  /**
   * Initialize DOM elements
   */
  initializeElements() {
    logger.log('Initializing DOM elements');
    
    try {
      if (!this.modal) {
        logger.error('Modal element not available for initializing elements');
        return;
      }
      
      // Find core modal elements - Use direct CSS selectors instead of config selectors
      this.overlay = this.modal.querySelector('.product-estimator-modal-overlay');
      this.closeButton = this.modal.querySelector('.product-estimator-modal-close');
      this.contentContainer = this.modal.querySelector('.product-estimator-modal-form-container');
      this.loadingIndicator = this.modal.querySelector('.product-estimator-modal-loading');
      
      // Find view containers - Use direct ID selectors
      this.estimatesList = this.modal.querySelector('#estimates');
      this.estimateSelection = this.modal.querySelector('#estimate-selection-wrapper');
      this.estimateSelectionForm = this.modal.querySelector('#estimate-selection-form-wrapper');
      this.roomSelectionForm = this.modal.querySelector('#room-selection-form-wrapper');
      this.newEstimateForm = this.modal.querySelector('#new-estimate-form-wrapper');
      this.newRoomForm = this.modal.querySelector('#new-room-form-wrapper');
      
      // Add simple logging for container elements
      logger.log('Container elements status:', {
        modal: this.modal ? 'found' : 'missing',
        contentContainer: this.contentContainer ? 'found' : 'missing',
        estimatesList: this.estimatesList ? 'found' : 'missing',
        estimateSelection: this.estimateSelection ? 'found' : 'missing',
        estimateSelectionForm: this.estimateSelectionForm ? 'found' : 'missing',
        roomSelectionForm: this.roomSelectionForm ? 'found' : 'missing',
        newEstimateForm: this.newEstimateForm ? 'found' : 'missing',
        newRoomForm: this.newRoomForm ? 'found' : 'missing'
      });
      
      // Log the modal's HTML to help diagnose template issues
      if (!this.estimatesList) {
        logger.error('Critical: #estimates div not found in modal template!');
        logger.log('Modal content structure:', this.modal.innerHTML.substring(0, 500) + '...');
      }
      
      // Create missing containers if needed
      if (!this.loadingIndicator) {
        logger.warn('Loading indicator not found, creating one');
        this.loadingIndicator = document.createElement('div');
        this.loadingIndicator.className = 'product-estimator-modal-loading';
        this.loadingIndicator.innerHTML = `
          <div class="loading-spinner"></div>
          <div class="loading-text">${this.config.i18n.loading || 'Loading...'}</div>
        `;
        this.modal.appendChild(this.loadingIndicator);
      }
      
      logger.log('DOM elements initialized');
    } catch (error) {
      logger.error('Error initializing DOM elements:', error);
    }
  }
  
  /**
   * Initialize all specialized managers
   */
  initializeManagers() {
    logger.log('Initializing specialized managers');
    
    // Initialize specialized managers with references to this ModalManager
    // and the dataService
    this.estimateManager = new EstimateManager(this.config, this.dataService, this);
    this.roomManager = new RoomManager(this.config, this.dataService, this);
    this.productManager = new ProductManager(this.config, this.dataService, this);
    this.formManager = new FormManager(this.config, this.dataService, this);
    this.uiManager = new UIManager(this.config, this.dataService, this);
    
    // Set up confirmation dialog - create a new instance explicitly
    logger.log('Creating new ConfirmationDialog instance');
    try {
      // Force a new instance of the dialog
      this.confirmationDialog = new ConfirmationDialog();
      
      // Make it available globally
      if (!window.productEstimator) {
        window.productEstimator = {};
      }
      
      window.productEstimator.dialog = this.confirmationDialog;
      
      // Don't force initialization - we'll create elements on demand
      // This ensures the dialog isn't created until it's actually needed
      
      logger.log('ConfirmationDialog instance created successfully and initialized');
    } catch (error) {
      logger.error('Error creating ConfirmationDialog:', error);
    }
    
    // Set up product selection dialog for variations
    logger.log('Creating ProductSelectionDialog instance');
    try {
      this.productSelectionDialog = new ProductSelectionDialog(this, TemplateEngine);
      
      // Make it available to the product manager
      if (this.productManager) {
        this.productManager.productSelectionDialog = this.productSelectionDialog;
      }
      
      logger.log('ProductSelectionDialog instance created successfully');
    } catch (error) {
      logger.error('Error creating ProductSelectionDialog:', error);
    }
    
    // Verify dialog instance was created (elements will be created on demand)
    if (this.confirmationDialog) {
      logger.log('ConfirmationDialog instance ready for use, elements will be created when needed');
    } else {
      logger.error('ConfirmationDialog instance was not created properly');
    }
    
    // Initialize each manager
    if (this.estimateManager) this.estimateManager.init();
    if (this.roomManager) this.roomManager.init();
    if (this.productManager) this.productManager.init();
    if (this.formManager) this.formManager.init();
    if (this.uiManager) this.uiManager.init();
    
    logger.log('Specialized managers initialized');
  }
  
  /**
   * Bind core modal events
   */
  bindEvents() {
    logger.log('Binding core modal events');
    
    try {
      // Modal overlay click handler
      if (this.modal) {
        this.modal.addEventListener('click', this._modalClickHandler);
      }
      
      // Close button click handler
      if (this.closeButton) {
        this.closeButton.addEventListener('click', (e) => {
          e.preventDefault();
          this.closeModal();
        });
      }
      
      // Escape key handler
      const escHandler = (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeModal();
        }
      };
      document.addEventListener('keydown', escHandler);
      
      logger.log('Core modal events bound');
    } catch (error) {
      logger.error('Error binding core modal events:', error);
    }
  }
  
  /**
   * Handle modal overlay clicks
   * @param {Event} e - The click event
   * @private
   */
  _modalClickHandler(e) {
    // Close modal when clicking the overlay (not the content)
    if (e.target === this.overlay) {
      this.closeModal();
    }
  }
  
  /**
   * Show the loading indicator
   */
  showLoading() {
    if (!this.loadingIndicator) {
      logger.warn('Loading indicator not available - creating one');
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
        logger.error('Cannot create loading indicator - modal not available');
        return;
      }
    }
    
    try {
      this.loadingIndicator.style.display = 'flex';
      
      // Set a safety timeout in case something goes wrong
      this._loadingTimeout = setTimeout(() => {
        this.ensureLoaderHidden();
      }, 10000); // 10 seconds safety timeout
      
      // Track loading start time for debugging
      this.loadingStartTime = Date.now();
    } catch (error) {
      logger.error('Error showing loading indicator:', error);
    }
  }
  
  /**
   * Hide the loading indicator
   */
  hideLoading() {
    // Reset loading start time
    this.loadingStartTime = 0;
    
    if (!this.loadingIndicator) {
      logger.warn('Loading indicator not available during hide operation');
      return;
    }
    
    try {
      this.loadingIndicator.style.display = 'none';
      
      // Clear the safety timeout
      if (this._loadingTimeout) {
        clearTimeout(this._loadingTimeout);
        this._loadingTimeout = null;
      }
    } catch (error) {
      logger.error('Error hiding loading indicator:', error);
    }
  }
  
  /**
   * Reset button state after loading
   */
  resetButtonState() {
    if (!this._buttonConfig || !this._buttonConfig.button) {
      return;
    }
    
    const { button } = this._buttonConfig;
    
    // Get original data from data attributes
    const originalText = button.dataset.originalText || button.textContent;
    const wasDisabled = button.dataset.originalDisabled === 'true';
    
    // Only clear content for buttons we added spinners to
    if (button.classList.contains('product-estimator-category-button')) {
      button.innerHTML = '';
    }
    
    // Reset button to original state
    button.textContent = originalText;
    button.disabled = wasDisabled;
    button.classList.remove('loading');
    
    // Clean up data attributes
    delete button.dataset.originalText;
    delete button.dataset.originalDisabled;
    
    // Clear the config
    this._buttonConfig = null;
  }
  
  /**
   * Open the modal
   * @param {string|null} productId - Optional product ID to add
   * @param {boolean} forceListView - Force showing the estimates list
   * @param {object} buttonConfig - Optional button configuration for reset
   */
  openModal(productId = null, forceListView = false, buttonConfig = null) {
    logger.log('MODAL OPEN CALLED WITH:', {
      productId: productId,
      forceListView: forceListView,
      typeOfProductId: typeof productId,
      hasButtonConfig: !!buttonConfig
    });
    
    // Store button config for later reset
    this._buttonConfig = buttonConfig;
    
    // Debounce logic - prevent rapid open/close calls
    if (this._modalActionInProgress) {
      logger.log('Modal action already in progress, ignoring open request');
      return;
    }
    this._modalActionInProgress = true;
    
    // Reset the debounce after a short delay
    setTimeout(() => {
      this._modalActionInProgress = false;
    }, 300); // 300ms debounce
    
    // Make sure modal exists and is initialized
    if (!this.modal) {
      logger.error('Cannot open modal - not found in DOM');
      this.showError('Modal element not found. Please contact support.');
      return;
    }
    
    try {
      // If we have a product ID, check for variations first
      if (productId && !forceListView) {
        logger.log('Checking for product variations', { productId });
        
        // Don't show loading dialog immediately - the button already has loading state
        
        // Check if this is a variable product
        this.dataService.getProductVariationData(productId)
          .then(variationData => {
            // Don't reset button state here - wait until dialog is closed
            
            if (variationData && variationData.isVariable && variationData.variations && variationData.variations.length > 0) {
              // Show product selection dialog for variations
              logger.log('Product has variations, showing selection dialog', variationData);
              
              if (this.productSelectionDialog) {
                this.productSelectionDialog.show({
                  product: {
                    id: productId,
                    name: variationData.productName || 'Select Product Options'
                  },
                  variations: variationData.variations,
                  attributes: variationData.attributes,
                  onSelect: (selectedData) => {
                    logger.log('Variation selected:', selectedData);
                    // Hide variation dialog before showing estimate selection
                    this.productSelectionDialog.hideDialog();
                    
                    // Reset button state since we're proceeding with the selected variation
                    this.resetButtonState();
                    
                    // Small delay for smoother transition
                    setTimeout(() => {
                      this.proceedWithModalOpen(selectedData.variationId || selectedData.productId, forceListView);
                    }, 150);
                  },
                  onCancel: () => {
                    logger.log('Product selection cancelled');
                    this._modalActionInProgress = false;
                    this.resetButtonState();
                  }
                });
              } else {
                logger.error('ProductSelectionDialog not available');
                // Fallback to normal flow
                this.proceedWithModalOpen(productId, forceListView);
              }
            } else {
              // No variations, reset button state and proceed normally
              logger.log('Product has no variations, proceeding normally');
              this.resetButtonState();
              this.proceedWithModalOpen(productId, forceListView);
            }
          })
          .catch(error => {
            logger.error('Error checking product variations:', error);
            
            // Reset button state on error
            this.resetButtonState();
            
            // On error, proceed with normal flow
            this.proceedWithModalOpen(productId, forceListView);
          });
        
        return; // Exit early, we'll continue in the callback
      }
      
      // No product ID or forcing list view, proceed normally
      this.proceedWithModalOpen(productId, forceListView);
      
    } catch (error) {
      logger.error('Error opening modal:', error);
      this.hideLoading();
      this.showError('An error occurred opening the modal. Please try again.');
    }
  }
  
  /**
   * Continue with opening the modal after variation check
   * @private
   * @param {string|number} productId - The product ID to add
   * @param {boolean} forceListView - Whether to force the list view
   */
  proceedWithModalOpen(productId, forceListView) {
    try {
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
      
      // Initialize carousels through UIManager
      if (this.uiManager) {
        setTimeout(() => {
          this.uiManager.initializeCarousels();
        }, 300); // Short delay to ensure DOM is ready
      }
      
      // Now delegate to specialized managers to handle the specific flow
      if (productId && !forceListView) {
        // Product flow: Navigate to estimate selection or new estimate form
        if (this.estimateManager) {
          this.estimateManager.handleProductFlow(productId);
        } else {
          logger.error('EstimateManager not available for handleProductFlow');
          this.hideLoading();
        }
      } else {
        // List view flow: Show list of estimates
        if (this.estimateManager) {
          this.estimateManager.showEstimatesList();
        } else {
          logger.error('EstimateManager not available for showEstimatesList');
          this.hideLoading();
        }
      }
    } catch (error) {
      logger.error('Error proceeding with modal open:', error);
      this.hideLoading();
      this.showError('An error occurred opening the modal. Please try again.');
    }
  }
  
  /**
   * Close the modal
   */
  closeModal() {
    if (!this.isOpen) return;
    
    // Debounce logic - prevent rapid open/close calls
    if (this._modalActionInProgress) {
      logger.log('Modal action already in progress, ignoring close request');
      return;
    }
    this._modalActionInProgress = true;
    
    // Reset the debounce after a short delay
    setTimeout(() => {
      this._modalActionInProgress = false;
    }, 300); // 300ms debounce
    
    logger.log('Closing modal');
    
    try {
      // Ensure loader is hidden
      this.ensureLoaderHidden();
      
      // Reset button state if we have one
      this.resetButtonState();
      
      // Hide the modal
      if (this.modal) {
        this.modal.style.display = 'none';
        this.isOpen = false;
      }
      
      // Reset the current product ID
      this.currentProductId = null;
      
      // Remove modal-open class from body
      document.body.classList.remove('modal-open');
      
      // Notify any specialized managers about modal closing
      if (this.estimateManager) this.estimateManager.onModalClosed();
      if (this.roomManager) this.roomManager.onModalClosed();
      if (this.productManager) this.productManager.onModalClosed();
      if (this.formManager) this.formManager.onModalClosed();
      if (this.uiManager) this.uiManager.onModalClosed();
      
      // Dispatch modal closed event
      const event = new CustomEvent('productEstimatorModalClosed');
      document.dispatchEvent(event);
    } catch (error) {
      logger.error('Error closing modal:', error);
    }
  }
  
  /**
   * Show an error message in the modal
   * @param {string} message - The error message to display
   */
  showError(message) {
    try {
      // Ensure loading is hidden
      this.hideLoading();
      
      // Show error using the TemplateEngine if available
      if (this.modal && TemplateEngine) {
        const formContainer = this.modal.querySelector('.product-estimator-modal-form-container');
        if (formContainer) {
          TemplateEngine.showMessage(message, 'error', formContainer);
        } else {
          logger.error('Form container not found for error display');
          
          // Fallback error display
          alert(message);
        }
      } else {
        // Ultimate fallback
        alert(message);
      }
    } catch (error) {
      logger.error('Error showing error message:', error);
    }
  }
  
  /**
   * Set up safety mechanism for the loading indicator
   */
  setupLoaderSafety() {
    // Log when setting up safety
    logger.log('Setting up loader safety mechanisms');
    
    // Monitor all API calls and ensure loading indicator is hidden in case of errors
    try {
      const originalFetch = window.fetch;
      window.fetch = (...args) => {
        const fetchPromise = originalFetch(...args);
        
        return fetchPromise.catch(error => {
          // Hide loading indicator if fetch fails
          logger.warn('Fetch error triggered loader safety:', error.message);
          this.ensureLoaderHidden();
          throw error;
        });
      };
      
      // Add global error handler to hide loader
      window.addEventListener('error', (event) => {
        logger.warn('Global error triggered loader safety:', event.message);
        this.ensureLoaderHidden();
      });
      
      // Add unhandled promise rejection handler
      window.addEventListener('unhandledrejection', (event) => {
        logger.warn('Unhandled rejection triggered loader safety:', 
          event.reason ? (event.reason.message || 'Unknown reason') : 'Unknown reason');
        this.ensureLoaderHidden();
      });
      
      // Set up a periodic check that no loading indicator stays visible for too long
      this._safetyInterval = setInterval(() => {
        if (this.loadingStartTime && (Date.now() - this.loadingStartTime > 15000)) {
          logger.warn('Loading indicator visible for too long (15s), forcing hide');
          this.ensureLoaderHidden();
        }
      }, 5000); // Check every 5 seconds
      
      logger.log('Loader safety mechanisms installed');
    } catch (error) {
      logger.error('Error setting up loader safety:', error);
    }
  }
  
  /**
   * Ensure the loading indicator is hidden (safety method)
   */
  ensureLoaderHidden() {
    if (!this.loadingIndicator) return;
    
    try {
      // Force hide the loading indicator
      this.loadingIndicator.style.display = 'none';
      
      // Reset loading start time
      this.loadingStartTime = 0;
      
      // Clear any pending timeout
      if (this._loadingTimeout) {
        clearTimeout(this._loadingTimeout);
        this._loadingTimeout = null;
      }
      
      logger.log('Loading indicator forcibly hidden for safety');
    } catch (error) {
      logger.error('Error hiding loading indicator:', error);
    }
  }
  
  /**
   * Reset the modal state (hide all views)
   */
  resetModalState() {
    logger.log('Resetting modal state');
    
    try {
      // Hide all view containers
      const viewContainers = [
        this.estimatesList,
        this.estimateSelection,
        this.roomSelectionForm,
        this.newEstimateForm,
        this.newRoomForm
      ];
      
      // If UIManager is available, use it to hide elements
      if (this.uiManager) {
        viewContainers.forEach(container => {
          if (container) {
            this.uiManager.hideElement(container);
          }
        });
      } else {
        // Fallback if UIManager not available
        viewContainers.forEach(container => {
          if (container) {
            container.style.display = 'none';
          }
        });
      }
      
      // Clear any stored data attributes safely
      if (this.roomSelectionForm) this.roomSelectionForm.removeAttribute('data-estimate-id');
      if (this.newRoomForm) {
        this.newRoomForm.removeAttribute('data-estimate-id');
        this.newRoomForm.removeAttribute('data-product-id');
      }
    } catch (error) {
      logger.error('Error resetting modal state:', error);
    }
  }
  
  /**
   * Force an element to be visible (utility method)
   * @param {HTMLElement} element - The element to make visible
   * @returns {HTMLElement} The element
   */
  forceElementVisibility(element) {
    // Delegate to UIManager if available
    if (this.uiManager) {
      return this.uiManager.forceElementVisibility(element);
    }
    
    // Fallback if UIManager is not available
    if (!element) return null;
    
    logger.log('Using fallback forceElementVisibility (UIManager not available)');
    element.style.display = 'block';
    return element;
  }
}

// Export the updated ModalManager class
export default ModalManager;