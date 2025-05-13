/**
 * UIManager.js
 *
 * Handles all UI-related operations:
 * - Carousel initialization and management
 * - Toggle functionality
 * - Visibility utilities
 * - UI components
 */

import { format, createLogger } from '@utils';
import { SuggestionsCarousel, initSuggestionsCarousels } from '../SuggestionsCarousel';
import ProductDetailsToggle from '../ProductDetailsToggle';

const logger = createLogger('UIManager');

class UIManager {
  /**
   * Initialize the UIManager
   * @param {object} config - Configuration options
   * @param {object} dataService - The data service instance
   * @param {object} modalManager - Reference to the parent modal manager
   */
  constructor(config = {}, dataService, modalManager) {
    this.config = config;
    this.dataService = dataService;
    this.modalManager = modalManager;
    
    // References to DOM elements
    this.estimatesList = null;
    this.carousels = [];
    
    // Toggle component reference
    this.productDetailsToggle = null;
    
    // Bind methods to preserve 'this' context
    this.initializeCarousels = this.initializeCarousels.bind(this);
    this.bindSimilarProductsToggle = this.bindSimilarProductsToggle.bind(this);
    this.bindSuggestionsToggle = this.bindSuggestionsToggle.bind(this);
    this.bindProductDetailsToggles = this.bindProductDetailsToggles.bind(this);
    this.forceElementVisibility = this.forceElementVisibility.bind(this);
    this.onModalClosed = this.onModalClosed.bind(this);
  }
  
  /**
   * Initialize the UI manager
   * @returns {UIManager} The instance for chaining
   */
  init() {
    // Get reference to estimatesList from modalManager for toggle binding
    this.estimatesList = this.modalManager.estimatesList;
    
    // Initialize product details toggle functionality if not already done
    this.initializeProductDetailsToggle();
    
    logger.log('UIManager initialized');
    return this;
  }
  
  /**
   * Initialize product details toggle functionality
   */
  initializeProductDetailsToggle() {
    // Use the singleton instance that's already initialized
    this.productDetailsToggle = ProductDetailsToggle;
    logger.log('Product details toggle functionality initialized');
  }
  
  /**
   * Called when the modal is closed
   */
  onModalClosed() {
    // Clean up any UI resources if needed
    logger.log('UIManager handling modal close event');
  }
  
  /**
   * Initialize all carousels in the UI
   */
  initializeCarousels() {
    logger.log('Initializing all carousels');
    this.carousels = initSuggestionsCarousels();
    return this.carousels;
  }
  
  /**
   * Bind toggle functionality for similar products
   */
  bindSimilarProductsToggle() {
    // Similar products toggle containers are added dynamically to product items
    const productToggleButtons = document.querySelectorAll('.product-details-toggle');
    logger.log(`Found ${productToggleButtons.length} similar products toggle buttons to bind`);
    
    productToggleButtons.forEach(button => {
      if (!button._toggleBound) {
        button._toggleHandler = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggleSimilarProducts(button);
        };
        
        button.addEventListener('click', button._toggleHandler);
        button._toggleBound = true;
      }
    });
    
    logger.log('Similar products toggle bound');
  }
  
  /**
   * Toggle the visibility of similar products
   * @param {HTMLElement} toggleButton - The button that was clicked
   */
  toggleSimilarProducts(toggleButton) {
    // Find parent product item
    const productItem = toggleButton.closest('.product-item');
    
    if (!productItem) {
      logger.log('Product item not found for toggle button');
      return;
    }
    
    // Find similar products container
    const similarProductsContainer = productItem.querySelector('.similar-products-container');
    
    if (!similarProductsContainer) {
      logger.log('Similar products container not found');
      return;
    }
    
    // Toggle expanded state
    const isExpanded = toggleButton.classList.contains('expanded');
    logger.log(`Similar products toggle clicked, current expanded state: ${isExpanded}`);
    
    // Get the icon element
    const iconElement = toggleButton.querySelector('.toggle-icon');
    
    if (isExpanded) {
      // Hide similar products
      similarProductsContainer.classList.remove('visible');
      similarProductsContainer.style.display = 'none';
      toggleButton.classList.remove('expanded');
      
      // Update icon
      if (iconElement) {
        iconElement.classList.remove('dashicons-arrow-up-alt2');
        iconElement.classList.add('dashicons-arrow-down-alt2');
      }
      
      logger.log('Similar products hidden');
    } else {
      // Show similar products
      similarProductsContainer.classList.add('visible');
      similarProductsContainer.style.display = 'block';
      toggleButton.classList.add('expanded');
      
      // Update icon
      if (iconElement) {
        iconElement.classList.remove('dashicons-arrow-down-alt2');
        iconElement.classList.add('dashicons-arrow-up-alt2');
      }
      
      logger.log('Similar products shown');
      
      // Initialize carousels if they exist
      this.initializeCarouselInContainer(similarProductsContainer);
    }
  }
  
  /**
   * Bind toggle functionality for suggestions
   */
  bindSuggestionsToggle() {
    if (!window.productEstimatorVars?.featureSwitches?.suggested_products_enabled) {
      logger.log('Suggestions feature is disabled, skipping toggle binding');
      return;
    }
    
    // Bind suggestions toggle buttons
    const suggestionsToggleButtons = document.querySelectorAll('.product-suggestions-toggle');
    logger.log(`Found ${suggestionsToggleButtons.length} suggestions toggle buttons to bind`);
    
    suggestionsToggleButtons.forEach(button => {
      if (!button._toggleBound) {
        button._toggleHandler = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggleSuggestions(button);
        };
        
        button.addEventListener('click', button._toggleHandler);
        button._toggleBound = true;
      }
    });
    
    logger.log('Suggestions toggle bound');
  }
  
  /**
   * Toggle the visibility of suggested products
   * @param {HTMLElement} toggleButton - The button that was clicked
   */
  toggleSuggestions(toggleButton) {
    // Find parent accordion content
    const accordionContent = toggleButton.closest('.accordion-content');
    
    if (!accordionContent) {
      logger.log('Accordion content not found for toggle button');
      return;
    }
    
    // Find suggestions container
    const suggestionsContainer = accordionContent.querySelector('.suggestions-container');
    
    if (!suggestionsContainer) {
      logger.log('Suggestions container not found');
      return;
    }
    
    // Toggle expanded state
    const isExpanded = toggleButton.classList.contains('expanded');
    logger.log(`Suggestions toggle clicked, current expanded state: ${isExpanded}`);
    
    if (isExpanded) {
      // Hide suggestions
      suggestionsContainer.classList.remove('visible');
      suggestionsContainer.style.display = 'none';
      toggleButton.classList.remove('expanded');
      
      // Update icon
      const iconElement = toggleButton.querySelector('.toggle-icon');
      if (iconElement) {
        iconElement.classList.remove('dashicons-arrow-up-alt2');
        iconElement.classList.add('dashicons-arrow-down-alt2');
      }
      
      // Update text if needed
      const i18n = this.config.i18n || {};
      if (i18n.showSuggestions && i18n.hideSuggestions) {
        toggleButton.innerHTML = toggleButton.innerHTML.replace(
          i18n.hideSuggestions,
          i18n.showSuggestions
        );
      }
      
      logger.log('Suggestions hidden');
    } else {
      // Show suggestions
      suggestionsContainer.classList.add('visible');
      suggestionsContainer.style.display = 'block';
      toggleButton.classList.add('expanded');
      
      // Update icon
      const iconElement = toggleButton.querySelector('.toggle-icon');
      if (iconElement) {
        iconElement.classList.remove('dashicons-arrow-down-alt2');
        iconElement.classList.add('dashicons-arrow-up-alt2');
      }
      
      // Update text if needed
      const i18n = this.config.i18n || {};
      if (i18n.showSuggestions && i18n.hideSuggestions) {
        toggleButton.innerHTML = toggleButton.innerHTML.replace(
          i18n.showSuggestions,
          i18n.hideSuggestions
        );
      }
      
      // Initialize carousels if they exist
      this.initializeCarouselInContainer(suggestionsContainer);
      logger.log('Suggestions shown');
    }
  }
  
  /**
   * Bind all product details toggle functionality
   * Note: This method delegates to the ProductDetailsToggle instance
   */
  bindProductDetailsToggles() {
    if (this.productDetailsToggle) {
      this.productDetailsToggle.setup();
      logger.log('Product details toggles bound via ProductDetailsToggle');
    } else {
      logger.warn('ProductDetailsToggle not initialized');
    }
  }
  
  /**
   * Create and initialize a carousel
   * @param {HTMLElement} container - The container element for the carousel
   * @param {string} type - The type of carousel ('similar', 'suggestions', etc.)
   * @returns {SuggestionsCarousel} The initialized carousel
   */
  createCarousel(container, type) {
    logger.log(`Creating carousel of type: ${type}`);
    
    if (!container) {
      logger.warn('Cannot create carousel - container not provided');
      return null;
    }
    
    // Check if container already has a carousel
    if (container.carouselInstance) {
      logger.log('Container already has a carousel instance, destroying it first');
      container.carouselInstance.destroy();
    }
    
    // Initialize new carousel
    const carousel = new SuggestionsCarousel(container);
    logger.log('New carousel created', carousel);
    
    return carousel;
  }
  
  /**
   * Initialize all carousels within a specific container
   * @param {HTMLElement} container - The container to search for carousels in
   */
  initializeCarouselInContainer(container) {
    if (!container) {
      logger.warn('Cannot initialize carousels - container not provided');
      return;
    }
    
    logger.log('Initializing carousels in container');
    
    // Find all carousel containers in this container
    const carouselContainers = container.querySelectorAll('.suggestions-carousel');
    logger.log(`Found ${carouselContainers.length} carousel containers`);
    
    // Initialize each carousel
    carouselContainers.forEach(carouselContainer => {
      if (carouselContainer.carouselInstance) {
        carouselContainer.carouselInstance.destroy();
      }
      new SuggestionsCarousel(carouselContainer);
    });
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
  
  /**
   * Show an element
   * @param {HTMLElement} element - The element to show
   * @param {boolean} force - Whether to use force visibility
   * @returns {HTMLElement} The element
   */
  showElement(element, force = false) {
    if (!element) return null;
    
    if (force) {
      return this.forceElementVisibility(element);
    }
    
    element.style.display = 'block';
    return element;
  }
  
  /**
   * Hide an element
   * @param {HTMLElement} element - The element to hide
   * @returns {HTMLElement} The element
   */
  hideElement(element) {
    if (!element) return null;
    
    element.style.display = 'none';
    return element;
  }
  
  /**
   * Toggle an element's visibility
   * @param {HTMLElement} element - The element to toggle
   * @param {boolean} show - Force show if true, force hide if false, toggle if undefined
   * @returns {HTMLElement} The element
   */
  toggleElement(element, show) {
    if (!element) return null;
    
    if (show === undefined) {
      // Toggle current state
      if (window.getComputedStyle(element).display === 'none') {
        element.style.display = 'block';
      } else {
        element.style.display = 'none';
      }
    } else if (show) {
      // Force show
      element.style.display = 'block';
    } else {
      // Force hide
      element.style.display = 'none';
    }
    
    return element;
  }
}

export default UIManager;