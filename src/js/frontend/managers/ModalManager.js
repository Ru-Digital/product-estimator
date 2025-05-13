/**
 * ModalManager.js
 *
 * Core modal manager that coordinates between specialized managers.
 * This class handles the basic modal functionality and delegates
 * specific responsibilities to specialized manager classes.
 */

import { format, createLogger } from '@utils';

// Import specialized managers
import EstimateManager from './EstimateManager';
import RoomManager from './RoomManager';
import ProductManager from './ProductManager';
import FormManager from './FormManager';
import UIManager from './UIManager';

// Import services and utils
import { loadEstimateData, saveEstimateData, clearEstimateData } from '../EstimateStorage';
import { loadCustomerDetails, saveCustomerDetails, clearCustomerDetails } from '../CustomerStorage';
import TemplateEngine from '../TemplateEngine';

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
      // Find the existing modal in the DOM
      this.modal = document.querySelector(this.config.selectors.modalContainer);
      
      if (!this.modal) {
        logger.log('Warning: Modal element not found in DOM. The PHP partial may not be included.');
        // Don't attempt to create it - the partial should be included by PHP
      } else {
        logger.log('Found existing modal in DOM, initializing elements');
      }
      
      // Initialize modal elements if modal exists
      if (this.modal) {
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
        }, 500);
      }
      
      this.initialized = true;
      logger.log('ModalManager initialized successfully');
    } catch (error) {
      logger.error('Error initializing ModalManager:', error);
    }
    
    return this;
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
      
      // Find core modal elements
      this.overlay = this.modal.querySelector(this.config.selectors.modalOverlay);
      this.closeButton = this.modal.querySelector(this.config.selectors.closeButton);
      this.contentContainer = this.modal.querySelector(this.config.selectors.contentContainer);
      this.loadingIndicator = this.modal.querySelector(this.config.selectors.loadingIndicator);
      
      // Find view containers - ASSUME they are now in the PHP template
      this.estimatesList = this.modal.querySelector(this.config.selectors.estimatesList);
      this.estimateSelection = this.modal.querySelector(this.config.selectors.estimateSelection);
      this.estimateSelectionForm = this.modal.querySelector('#estimate-selection-form-wrapper'); // If this is also a persistent wrapper
      this.roomSelectionForm = this.modal.querySelector(this.config.selectors.roomSelection);
      this.newEstimateForm = this.modal.querySelector(this.config.selectors.newEstimateForm);
      this.newRoomForm = this.modal.querySelector(this.config.selectors.newRoomForm);
      
      // Add checks and potential error handling if essential elements are missing
      if (!this.estimatesList) {
        logger.error('Critical: #estimates div not found in modal template!');
        // You might want to disable the modal or show a fatal error message here
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
   * Open the modal
   * @param {string|null} productId - Optional product ID to add
   * @param {boolean} forceListView - Force showing the estimates list
   */
  openModal(productId = null, forceListView = false) {
    logger.log('MODAL OPEN CALLED WITH:', {
      productId: productId,
      forceListView: forceListView,
      typeOfProductId: typeof productId
    });
    
    // Make sure modal exists and is initialized
    if (!this.modal) {
      logger.error('Cannot open modal - not found in DOM');
      this.showError('Modal element not found. Please contact support.');
      return;
    }
    
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
      logger.error('Error opening modal:', error);
      this.hideLoading();
      this.showError('An error occurred opening the modal. Please try again.');
    }
  }
  
  /**
   * Close the modal
   */
  closeModal() {
    if (!this.isOpen) return;
    
    logger.log('Closing modal');
    
    try {
      // Ensure loader is hidden
      this.ensureLoaderHidden();
      
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
      
      viewContainers.forEach(container => {
        if (container) {
          container.style.display = 'none';
        }
      });
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
    if (!element) return null;
    
    try {
      // Apply inline styles with !important to override any CSS rules
      element.style.cssText += 'display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;';
      
      // Remove any hiding classes
      ['hidden', 'hide', 'invisible', 'd-none', 'display-none'].forEach(cls => {
        if (element.classList.contains(cls)) {
          element.classList.remove(cls);
        }
      });
      
      // Add visible classes (some frameworks use these)
      element.classList.add('visible', 'd-block');
      
      // Ensure parent elements are also visible
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
      
      // Use jQuery as a fallback if available
      if (typeof jQuery !== 'undefined') {
        jQuery(element).show();
      }
    } catch (error) {
      logger.error('Error forcing element visibility:', error);
    }
    
    return element;
  }
}

// Export the updated ModalManager class
export default ModalManager;