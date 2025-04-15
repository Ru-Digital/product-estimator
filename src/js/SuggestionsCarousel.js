/**
 * Enhanced Carousel for Suggested and Similar Products with strict width containment
 * - Properly handles multiple carousels on the same page
 * - Each carousel operates independently
 * - Strictly maintains container width constraints
 */
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

    console.log(`[${this.id}] Initializing carousel with ${this.items.length} items, isSimilarProducts: ${this.isSimilarProducts}`);

    // Only proceed if we have all necessary elements
    if (!this.itemsContainer || !this.items.length) {
      console.warn(`[${this.id}] Carousel missing items container or has no items`);
      return;
    }

    // Store instance reference on the container
    container.carouselInstance = this;

    // Get container width before setting configuration
    const containerWidth = this.getContainerWidth();

    // Configuration
    // Use container width to determine item width and gap
    if (this.isSimilarProducts) {
      // For similar products: use smaller items, narrower gaps
      this.itemWidth = Math.min(130, Math.floor((containerWidth - 40) / 2)); // At least 2 items visible
      this.itemGap = 5;
    } else {
      // For regular suggestions: larger items, wider gaps
      this.itemWidth = Math.min(200, Math.floor((containerWidth - 80) / 2)); // At least 2 items visible
      this.itemGap = 15;
    }

    this.visibleItems = this.calculateVisibleItems();
    this.currentPosition = 0;
    this.maxPosition = Math.max(0, this.items.length - this.visibleItems);

    // Set container size
    this.setContainerSize();

    // Initialize
    this.bindEvents();
    this.updateButtons();

    console.log(`[${this.id}] Carousel initialized - container width: ${containerWidth}px, item width: ${this.itemWidth}px, visible items: ${this.visibleItems}, maxPosition: ${this.maxPosition}`);
  }

  getContainerWidth() {
    // Get computed width of container
    const computedStyle = window.getComputedStyle(this.container);
    const paddingLeft = parseFloat(computedStyle.paddingLeft);
    const paddingRight = parseFloat(computedStyle.paddingRight);

    // Use offsetWidth which includes padding
    const containerWidth = this.container.offsetWidth;
    const contentWidth = containerWidth - paddingLeft - paddingRight;

    console.log(`[${this.id}] Container dimensions - offsetWidth: ${containerWidth}px, content width: ${contentWidth}px, padding: ${paddingLeft}px ${paddingRight}px`);

    return contentWidth;
  }

  setContainerSize() {
    // Force container size via inline style for similar products carousel
    if (this.isSimilarProducts) {
      // Get parent width (product item)
      let parentWidth = 0;
      let parentEl = this.container.parentElement;

      // Find the closest product-item parent
      while (parentEl && !parentEl.classList.contains('product-item')) {
        parentEl = parentEl.parentElement;
      }

      if (parentEl) {
        parentWidth = parentEl.offsetWidth;
        console.log(`[${this.id}] Found parent product-item width: ${parentWidth}px`);

        // Set max-width based on parent
        if (parentWidth > 0) {
          this.container.style.maxWidth = `${parentWidth - 20}px`; // 20px buffer
        }
      }

      // Set item widths to ensure they fit
      Array.from(this.items).forEach(item => {
        item.style.width = `${this.itemWidth}px`;
        item.style.flexShrink = '0';
        item.style.flexGrow = '0';
      });

      // Set container width
      this.itemsContainer.style.gap = `${this.itemGap}px`;
    }
  }

  calculateVisibleItems() {
    // Use the more precise available width
    const availableWidth = this.getAvailableWidth();

    // Fixed item widths for similar products carousel
    const itemWidth = this.container.classList.contains('similar-products-carousel')
      ? 110 // Small fixed width
      : this.itemWidth;

    // Calculate and ensure at least 1 item shows
    const visibleItems = Math.max(1, Math.floor(availableWidth / itemWidth));

    console.log(`Available width: ${availableWidth}px, item width: ${itemWidth}px, visible items: ${visibleItems}`);

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

    console.log(`[${this.id}] Events bound`);
  }

  handlePrevClick(e) {
    e.preventDefault();
    e.stopPropagation();

    console.log(`[${this.id}] Prev button clicked, current position: ${this.currentPosition}`);

    if (this.currentPosition > 0) {
      this.currentPosition--;
      this.updatePosition();
      this.updateButtons();
    }
  }

  handleNextClick(e) {
    e.preventDefault();
    e.stopPropagation();

    console.log(`[${this.id}] Next button clicked, current position: ${this.currentPosition}, max: ${this.maxPosition}`);

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

    console.log(`[${this.id}] Window resized, visible items: ${this.visibleItems}, max position: ${this.maxPosition}`);

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

      console.log(`Product item width: ${productItemWidth}px, Available width: ${availableWidth}px`);
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

    console.log(`[${this.id}] Position updated to ${this.currentPosition}, translateX: ${translateX}px`);
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

    console.log(`[${this.id}] Buttons updated - prev ${this.prevBtn ? (this.prevBtn.classList.contains('disabled') ? 'disabled' : 'enabled') : 'missing'}, next ${this.nextBtn ? (this.nextBtn.classList.contains('disabled') ? 'disabled' : 'enabled') : 'missing'}`);
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

    console.log(`[${this.id}] Carousel destroyed`);
  }
}

/**
 * Initialize carousels immediately after DOM content is loaded
 * and ensure navigation buttons work correctly
 */
function initSuggestionsCarousels() {
  console.log('Initializing all suggestion carousels');

  // Find all carousel containers (both types: suggestions and similar products)
  const carouselContainers = document.querySelectorAll('.suggestions-carousel');
  console.log(`Found ${carouselContainers.length} carousel containers`);

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
  console.log(`Setting up ${accordionHeaders.length} accordion headers for carousel initialization`);

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
      console.log('Accordion opened, checking for carousels to initialize');

      // Find carousels within this accordion content - check for both types
      const carousels = content.querySelectorAll('.suggestions-carousel');
      console.log(`Found ${carousels.length} carousels in opened accordion`);

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
  console.log('DOM loaded, initializing carousels');
  initSuggestionsCarousels();
  initCarouselOnAccordionOpen();
});

// Export the functions to be used in other modules
export { initSuggestionsCarousels, initCarouselOnAccordionOpen, SuggestionsCarousel };
