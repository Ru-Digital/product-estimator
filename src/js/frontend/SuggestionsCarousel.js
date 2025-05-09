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

    // logger.log(`[${this.id}] Initializing carousel with ${this.items.length} items, isSimilarProducts: ${this.isSimilarProducts}`);

    // Only proceed if we have all necessary elements
    if (!this.itemsContainer || !this.items.length) {
      logger.warn(`[${this.id}] Carousel missing items container or has no items`);
      return;
    }

    // Store instance reference on the container
    container.carouselInstance = this;

    // Configuration based on carousel type
    if (this.isSimilarProducts) {
      // Similar products - fixed small size
      this.itemWidth = 130;
      this.itemGap = 5;
    } else {
      // Regular suggestions - larger items
      this.itemWidth = 200;
      this.itemGap = 15;
    }

    this.visibleItems = this.calculateVisibleItems();
    this.currentPosition = 0;
    this.maxPosition = Math.max(0, this.items.length - this.visibleItems);

    // Set up container and items
    this.setContainerSize();

    // Initialize
    this.bindEvents();
    this.updateButtons();
  }

  getContainerWidth() {
    if (this.isSimilarProducts) {
      // For similar products, find the product-item width
      const parentItem = this.container.closest('.product-item');
      if (parentItem) {
        const parentWidth = parentItem.offsetWidth;
        // logger.log(`[${this.id}] Found product-item parent: ${parentWidth}px`);
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
      // Set max-width explicitly for similar products
      const parentEl = this.container.closest('.product-item');
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
    const availableWidth = containerWidth - 50; // Allow space for navigation

    // Fixed item widths for similar products carousel
    const effectiveItemWidth = this.isSimilarProducts ? 130 : this.itemWidth;
    const effectiveGap = this.isSimilarProducts ? 5 : this.itemGap;

    // Calculate how many items fit
    const totalItemWidth = effectiveItemWidth + effectiveGap;
    const visibleItems = Math.max(1, Math.floor(availableWidth / totalItemWidth));

    // logger.log(`[${this.id}] Container width: ${containerWidth}px, available: ${availableWidth}px, visible items: ${visibleItems}`);

    return visibleItems;
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

    // logger.log(`[${this.id}] Prev button clicked, current position: ${this.currentPosition}`);

    if (this.currentPosition > 0) {
      this.currentPosition--;
      this.updatePosition();
      this.updateButtons();
    }
  }

  handleNextClick(e) {
    e.preventDefault();
    e.stopPropagation();

    // logger.log(`[${this.id}] Next button clicked, current position: ${this.currentPosition}, max: ${this.maxPosition}`);

    if (this.currentPosition < this.maxPosition) {
      this.currentPosition++;
      this.updatePosition();
      this.updateButtons();
    }
  }

  handleResize() {
    // Update container size on resize
    this.setContainerSize();

    // Recalculate values on resize
    const oldVisibleItems = this.visibleItems;
    this.visibleItems = this.calculateVisibleItems();
    this.maxPosition = Math.max(0, this.items.length - this.visibleItems);

    // logger.log(`[${this.id}] Window resized, visible items: ${this.visibleItems}, max position: ${this.maxPosition}`);

    // Ensure current position is valid after resize
    if (this.currentPosition > this.maxPosition) {
      this.currentPosition = this.maxPosition;
    }

    this.updatePosition();
    this.updateButtons();
  }

  /**
   * Get available width for carousel items considering all parent containers
   * This method makes sure we respect the product-item width
   */
  getAvailableWidth() {
    // Start with the basic container width
    let availableWidth = this.container.clientWidth - 50; // Subtract arrow space

    // Check if this is a similar products carousel (within product-item)
    if (this.isSimilarProducts) {
      // Find the product-item parent to ensure we respect its width
      let parentProductItem = this.container.closest('.product-item');
      if (parentProductItem) {
        // Get product-item width and consider its padding
        const productItemStyles = window.getComputedStyle(parentProductItem);
        const productItemWidth = parentProductItem.clientWidth -
          (parseFloat(productItemStyles.paddingLeft) +
            parseFloat(productItemStyles.paddingRight));

        // Use the minimum of container width or product-item width
        availableWidth = Math.min(availableWidth, productItemWidth);

        // logger.log(`Product item width: ${productItemWidth}px, Available width: ${availableWidth}px`);
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
    const translateX = -this.currentPosition * totalItemWidth;

    // Set transition for smooth movement
    this.itemsContainer.style.transition = 'transform 0.3s ease';

    // Apply the transform
    this.itemsContainer.style.transform = `translateX(${translateX}px)`;

    // logger.log(`[${this.id}] Position updated to ${this.currentPosition}, translateX: ${translateX}px`);
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
