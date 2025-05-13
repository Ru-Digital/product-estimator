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
      }
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
    this.currentProductId = null;
    
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
  }
  
  /**
   * Initialize the ModalManager
   * @returns {ModalManager} The instance for chaining
   */
  init() {
    logger.log('Initializing ModalManager');
    
    try {
      // Initialize elements
      this.initializeElements();
      
      // Set up the loading indicator safety checks
      this.setupLoaderSafety();
      
      // Initialize specialized managers
      this.initializeManagers();
      
      // Bind base events
      this.bindEvents();
      
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
      // Modal elements
      this.modal = document.querySelector(this.config.selectors.modalContainer);
      if (!this.modal) {
        logger.error('Modal container not found:', this.config.selectors.modalContainer);
        return;
      }
      
      this.overlay = this.modal.querySelector(this.config.selectors.modalOverlay);
      this.closeButton = this.modal.querySelector(this.config.selectors.closeButton);
      this.contentContainer = this.modal.querySelector(this.config.selectors.contentContainer);
      this.loadingIndicator = this.modal.querySelector(this.config.selectors.loadingIndicator);
      
      // View containers
      this.estimatesList = this.modal.querySelector(this.config.selectors.estimatesList);
      this.estimateSelection = this.modal.querySelector(this.config.selectors.estimateSelection);
      this.roomSelectionForm = this.modal.querySelector(this.config.selectors.roomSelection);
      this.newEstimateForm = this.modal.querySelector(this.config.selectors.newEstimateForm);
      this.newRoomForm = this.modal.querySelector(this.config.selectors.newRoomForm);
      
      // Optional elements that might not exist
      if (this.estimateSelection) {
        this.estimateSelectionForm = this.estimateSelection.querySelector('form');
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
    if (!this.loadingIndicator) return;
    
    try {
      this.loadingIndicator.style.display = 'block';
      
      // Set a safety timeout in case something goes wrong
      this._loadingTimeout = setTimeout(() => {
        this.ensureLoaderHidden();
      }, 10000); // 10 seconds safety timeout
    } catch (error) {
      logger.error('Error showing loading indicator:', error);
    }
  }
  
  /**
   * Hide the loading indicator
   */
  hideLoading() {
    if (!this.loadingIndicator) return;
    
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
    logger.log('Opening modal', { productId, forceListView });
    
    try {
      // Show the modal
      if (this.modal) {
        this.modal.style.display = 'block';
        this.isOpen = true;
      } else {
        logger.error('Modal container not found');
        return;
      }
      
      // Store the product ID
      this.currentProductId = productId;
      
      // Reset modal state - hide all views
      this.resetModalState();
      
      // Show loading indicator while deciding what to show
      this.showLoading();
      
      // Placeholder - this will delegate to specialized managers
      // when they are implemented
      this.hideLoading();
      logger.log('Modal opened, but delegation to specialized managers not yet implemented');
    } catch (error) {
      logger.error('Error opening modal:', error);
      this.hideLoading();
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
      
      // Dispatch modal closed event
      const event = new CustomEvent('productEstimatorModalClosed');
      document.dispatchEvent(event);
    } catch (error) {
      logger.error('Error closing modal:', error);
    }
  }
  
  /**
   * Set up safety mechanism for the loading indicator
   */
  setupLoaderSafety() {
    // Monitor all API calls and ensure loading indicator is hidden in case of errors
    const originalFetch = window.fetch;
    window.fetch = (...args) => {
      const fetchPromise = originalFetch(...args);
      
      return fetchPromise.catch(error => {
        // Hide loading indicator if fetch fails
        this.ensureLoaderHidden();
        throw error;
      });
    };
    
    // Add global error handler to hide loader
    window.addEventListener('error', () => {
      this.ensureLoaderHidden();
    });
    
    // Add unhandled promise rejection handler
    window.addEventListener('unhandledrejection', () => {
      this.ensureLoaderHidden();
    });
  }
  
  /**
   * Ensure the loading indicator is hidden (safety method)
   */
  ensureLoaderHidden() {
    if (!this.loadingIndicator) return;
    
    try {
      // Force hide the loading indicator
      this.loadingIndicator.style.display = 'none';
      
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