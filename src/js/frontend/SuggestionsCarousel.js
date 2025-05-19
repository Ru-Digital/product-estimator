/**
 * Enhanced Carousel for Suggested and Similar Products with strict width containment
 * - Properly handles multiple carousels on the same page
 * - Each carousel operates independently
 * - Strictly maintains container width constraints
 */

import { createLogger } from '@utils';
const logger = createLogger('SuggestionsCarousel');
class SuggestionsCarousel {
  constructor(container) {
    // Generate a unique ID for this carousel instance
    this.id = 'carousel_' + Math.random().toString(36).substr(2, 9);

    // Store references
    this.container = container;
    this.itemsContainer = container.querySelector('.suggestions-container');
    this.items = container.querySelectorAll('.suggestion-item');
    this.prevBtn = container.querySelector('.suggestions-nav.prev');
    this.nextBtn = container.querySelector('.suggestions-nav.next');

    // Determine if this is a similar products carousel
    this.isSimilarProducts = container.classList.contains('similar-products-carousel');

    logger.log(`[${this.id}] Initializing carousel with ${this.items.length} items, isSimilarProducts: ${this.isSimilarProducts}`);

    // Only proceed if we have all necessary elements
    if (!this.itemsContainer || !this.items.length) {
      logger.warn(`[${this.id}] Carousel missing items container or has no items`);
      return;
    }
    
    // Log navigation button existence
    if (!this.prevBtn) {
      logger.warn(`[${this.id}] Previous button not found`);
    }
    if (!this.nextBtn) {
      logger.warn(`[${this.id}] Next button not found`);
    }

    // Store instance reference on the container
    container.carouselInstance = this;

    // Configuration based on carousel type
    if (this.isSimilarProducts) {
      // Similar products - fixed small size (must match CSS)
      this.itemWidth = 170; // Matches the CSS width
      this.itemGap = 5;
      this.scrollStep = 1; // Number of items to scroll at a time
    } else {
      // Regular suggestions - larger items
      this.itemWidth = 200;
      this.itemGap = 15;
      this.scrollStep = 1;
    }

    this.visibleItems = this.calculateVisibleItems();
    this.currentPosition = 0;
    this.maxPosition = this.calculateMaxPosition();
    
    logger.log(`[${this.id}] Carousel state - Items: ${this.items.length}, Visible: ${this.visibleItems}, Max Position: ${this.maxPosition}`);

    // Set up container and items
    this.setContainerSize();

    // Initialize
    this.bindEvents();
    this.updateButtons();
  }

  getContainerWidth() {
    if (this.isSimilarProducts) {
      // For similar products, find the room-item width (similar products are now only in room items)
      const parentItem = this.container.closest('.room-item');
      if (parentItem) {
        const parentWidth = parentItem.offsetWidth;
        // logger.log(`[${this.id}] Found room-item parent: ${parentWidth}px`);
        return parentWidth - 10; // Subtract a small buffer
      }
    }

    // Default - use container's width
    const containerWidth = this.container.offsetWidth;
    // logger.log(`[${this.id}] Using container width: ${containerWidth}px`);
    return containerWidth;
  }


  setContainerSize() {
    // Force consistent sizing for similar products
    if (this.isSimilarProducts) {
      // Set max-width explicitly for similar products (now in room items)
      const parentEl = this.container.closest('.room-item');
      if (parentEl) {
        const parentWidth = parentEl.offsetWidth;
        // logger.log(`[${this.id}] Similar products parent width: ${parentWidth}px`);
        this.container.style.maxWidth = `${parentWidth - 10}px`;
      }

      // Ensure all items have consistent width
      Array.from(this.items).forEach(item => {
        // item.style.width = `${this.itemWidth}px`;
        item.style.flexShrink = '0';
        item.style.flexGrow = '0';
      });

      // Set container width and gap
      this.itemsContainer.style.gap = `${this.itemGap}px`;
    }
  }


  calculateVisibleItems() {
    // Calculate available width
    const containerWidth = this.getContainerWidth();
    const availableWidth = containerWidth - 80; // Allow space for navigation, padding, and partial item visibility

    // Use the configured item widths
    const effectiveItemWidth = this.itemWidth;
    const effectiveGap = this.itemGap;

    // Calculate how many full items fit
    const totalItemWidth = effectiveItemWidth + effectiveGap;
    const visibleItems = Math.floor(availableWidth / totalItemWidth);
    
    // Ensure at least 1 item is visible
    return Math.max(1, visibleItems);
  }

  calculateMaxPosition() {
    // Calculate the maximum scrollable position
    // This ensures we can scroll to see all items including the last one
    const totalItems = this.items.length;
    const visibleItems = this.visibleItems;
    
    if (totalItems <= visibleItems) {
      return 0; // No scrolling needed
    }
    
    // For similar products, calculate exact max position to show last items fully
    if (this.isSimilarProducts) {
      const containerWidth = this.getContainerWidth();
      const totalItemsWidth = totalItems * this.itemWidth + (totalItems - 1) * this.itemGap;
      const availableWidth = containerWidth - 80; // Account for navigation buttons and padding
      
      // Calculate how many positions we need to scroll to see all items
      const maxScroll = Math.ceil((totalItemsWidth - availableWidth) / (this.itemWidth + this.itemGap));
      return Math.max(0, maxScroll);
    }
    
    return totalItems - visibleItems;
  }


  bindEvents() {
    // Create handler functions with proper 'this' binding
    this.handlePrevClick = this.handlePrevClick.bind(this);
    this.handleNextClick = this.handleNextClick.bind(this);
    this.handleResize = this.handleResize.bind(this);

    // Remove any existing event listeners first
    if (this.prevBtn) {
      this.prevBtn.removeEventListener('click', this.handlePrevClick);
      this.prevBtn.addEventListener('click', this.handlePrevClick);
    }

    if (this.nextBtn) {
      this.nextBtn.removeEventListener('click', this.handleNextClick);
      this.nextBtn.addEventListener('click', this.handleNextClick);
    }

    // Handle window resize - debounce to improve performance
    this.resizeTimeout = null;
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(this.handleResize, 150);
    });

    // logger.log(`[${this.id}] Events bound`);
  }

  handlePrevClick(e) {
    e.preventDefault();
    e.stopPropagation();

    logger.log(`[${this.id}] Prev button clicked, current position: ${this.currentPosition}`);

    if (this.currentPosition > 0) {
      this.currentPosition--;
      this.updatePosition();
      this.updateButtons();
    } else {
      logger.log(`[${this.id}] Already at first position`);
    }
  }

  handleNextClick(e) {
    e.preventDefault();
    e.stopPropagation();

    logger.log(`[${this.id}] Next button clicked, current position: ${this.currentPosition}, max: ${this.maxPosition}`);

    if (this.currentPosition < this.maxPosition) {
      this.currentPosition++;
      this.updatePosition();
      this.updateButtons();
    } else {
      logger.log(`[${this.id}] Already at last position`);
    }
  }

  handleResize() {
    // Update container size on resize
    this.setContainerSize();

    // Recalculate values on resize
    this.visibleItems = this.calculateVisibleItems();
    this.maxPosition = this.calculateMaxPosition();

    logger.log(`[${this.id}] Window resized - Items: ${this.items.length}, visible items: ${this.visibleItems}, max position: ${this.maxPosition}`);

    // Ensure current position is valid after resize
    if (this.currentPosition > this.maxPosition) {
      this.currentPosition = this.maxPosition;
    }

    this.updatePosition();
    this.updateButtons();
  }

  /**
   * Get available width for carousel items considering all parent containers
   * This method makes sure we respect the room-item width
   * @returns {number} Available width in pixels
   */
  getAvailableWidth() {
    // Start with the basic container width
    let availableWidth = this.container.clientWidth - 50; // Subtract arrow space

    // Check if this is a similar products carousel (within room-item)
    if (this.isSimilarProducts) {
      // Find the room-item parent to ensure we respect its width
      let parentRoomItem = this.container.closest('.room-item');
      if (parentRoomItem) {
        // Get room-item width and consider its padding
        const roomItemStyles = window.getComputedStyle(parentRoomItem);
        const roomItemWidth = parentRoomItem.clientWidth -
          (parseFloat(roomItemStyles.paddingLeft) +
            parseFloat(roomItemStyles.paddingRight));

        // Use the minimum of container width or room-item width
        availableWidth = Math.min(availableWidth, roomItemWidth);

        // logger.log(`Room item width: ${roomItemWidth}px, Available width: ${availableWidth}px`);
      }
    } else {
      // For suggested products - respect the accordion item width
      let accordionContent = this.container.closest('.accordion-content');
      if (accordionContent) {
        const accordionWidth = accordionContent.clientWidth - 30; // Allow for padding
        availableWidth = Math.min(availableWidth, accordionWidth);
        // logger.log(`Accordion content width: ${accordionWidth}px, Available width: ${availableWidth}px`);
      }
    }

    return Math.max(availableWidth, 100); // Ensure minimum reasonable width
  }


  updatePosition() {
    if (!this.itemsContainer) return;

    // Calculate total width of an item including gap
    const totalItemWidth = this.itemWidth + this.itemGap;

    // Calculate translateX value
    let translateX = -this.currentPosition * totalItemWidth;
    
    // For similar products at the last position, adjust to show last items fully
    if (this.isSimilarProducts && this.currentPosition === this.maxPosition && this.maxPosition > 0) {
      const containerWidth = this.getContainerWidth();
      const totalItemsWidth = this.items.length * this.itemWidth + (this.items.length - 1) * this.itemGap;
      const availableWidth = containerWidth - 80; // Same as in calculateMaxPosition
      
      // Calculate the exact position to show the last items
      translateX = -(totalItemsWidth - availableWidth);
    }

    // Set transition for smooth movement
    this.itemsContainer.style.transition = 'transform 0.3s ease';

    // Apply the transform
    this.itemsContainer.style.transform = `translateX(${translateX}px)`;

    logger.log(`[${this.id}] Position updated to ${this.currentPosition}, translateX: ${translateX}px`);
  }

  updateButtons() {
    if (this.prevBtn) {
      if (this.currentPosition <= 0) {
        this.prevBtn.classList.add('disabled');
        this.prevBtn.setAttribute('aria-disabled', 'true');
      } else {
        this.prevBtn.classList.remove('disabled');
        this.prevBtn.removeAttribute('aria-disabled');
      }
    }

    if (this.nextBtn) {
      if (this.currentPosition >= this.maxPosition) {
        this.nextBtn.classList.add('disabled');
        this.nextBtn.setAttribute('aria-disabled', 'true');
      } else {
        this.nextBtn.classList.remove('disabled');
        this.nextBtn.removeAttribute('aria-disabled');
      }
    }

    // logger.log(`[${this.id}] Buttons updated - prev ${this.prevBtn ? (this.prevBtn.classList.contains('disabled') ? 'disabled' : 'enabled') : 'missing'}, next ${this.nextBtn ? (this.nextBtn.classList.contains('disabled') ? 'disabled' : 'enabled') : 'missing'}`);
  }

  destroy() {
    // Clean up event listeners
    if (this.prevBtn) {
      this.prevBtn.removeEventListener('click', this.handlePrevClick);
    }

    if (this.nextBtn) {
      this.nextBtn.removeEventListener('click', this.handleNextClick);
    }

    // Remove resize listener
    window.removeEventListener('resize', this.handleResize);

    // Remove instance reference
    if (this.container) {
      delete this.container.carouselInstance;
    }

    // logger.log(`[${this.id}] Carousel destroyed`);
  }
}

/**
 * Initialize carousels immediately after DOM content is loaded
 * and ensure navigation buttons work correctly
 * @returns {Array<SuggestionsCarousel>} Array of initialized carousel instances
 */
function initSuggestionsCarousels() {
  // logger.log('Initializing all suggestion carousels');

  // Find all carousel containers (both types: suggestions and similar products)
  const carouselContainers = document.querySelectorAll('.suggestions-carousel');
  // logger.log(`Found ${carouselContainers.length} carousel containers`);

  // Clean up any existing instances first
  carouselContainers.forEach(container => {
    if (container.carouselInstance) {
      container.carouselInstance.destroy();
    }
  });

  // Initialize new instances
  const carousels = [];
  carouselContainers.forEach(container => {
    const carousel = new SuggestionsCarousel(container);
    carousels.push(carousel);
  });

  return carousels;
}

/**
 * Initialize carousels when accordions are opened
 * This ensures proper rendering of carousels in accordions
 */
function initCarouselOnAccordionOpen() {
  // Find all accordion headers
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  // logger.log(`Setting up ${accordionHeaders.length} accordion headers for carousel initialization`);

  accordionHeaders.forEach(header => {
    // Remove existing event listeners to prevent duplicates
    header.removeEventListener('click', handleAccordionClick);

    // Add event listener
    header.addEventListener('click', handleAccordionClick);
  });
}

/**
 * Handler for accordion clicks that initializes carousels when content becomes visible
 * @param {Event} e - Click event object
 */
function handleAccordionClick(e) {
  // Wait for accordion animation to complete
  setTimeout(() => {
    // Find the accordion content area
    const accordionItem = e.currentTarget.closest('.accordion-item');
    if (!accordionItem) return;

    const content = accordionItem.querySelector('.accordion-content');
    if (!content) return;

    // Check if content is visible
    if (window.getComputedStyle(content).display !== 'none') {
      // logger.log('Accordion opened, checking for carousels to initialize');

      // Find carousels within this accordion content - check for both types
      const carousels = content.querySelectorAll('.suggestions-carousel');
      // logger.log(`Found ${carousels.length} carousels in opened accordion`);

      carousels.forEach(container => {
        // Reinitialize carousel to ensure proper rendering and functionality
        if (container.carouselInstance) {
          container.carouselInstance.destroy();
        }
        new SuggestionsCarousel(container);
      });
    }
  }, 300);
}

// Initialize carousels after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // logger.log('DOM loaded, initializing carousels');
  initSuggestionsCarousels();
  initCarouselOnAccordionOpen();
});

// Export the functions to be used in other modules
export { initSuggestionsCarousels, initCarouselOnAccordionOpen, SuggestionsCarousel };
