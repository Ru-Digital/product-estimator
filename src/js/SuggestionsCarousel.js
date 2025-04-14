/**
 * Enhanced Carousel for Suggested Products
 * - Properly handles multiple carousels on the same page
 * - Each carousel operates independently
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

    console.log(`[${this.id}] Initializing carousel with ${this.items.length} items`);

    // Only proceed if we have all necessary elements
    if (!this.itemsContainer || !this.items.length) {
      console.warn(`[${this.id}] Carousel missing items container or has no items`);
      return;
    }

    // Store instance reference on the container
    container.carouselInstance = this;

    // Configuration
    this.itemWidth = 215; // Width of item + gap (200px + 15px)
    this.visibleItems = this.calculateVisibleItems();
    this.currentPosition = 0;
    this.maxPosition = Math.max(0, this.items.length - this.visibleItems);

    // Initialize
    this.bindEvents();
    this.updateButtons();

    console.log(`[${this.id}] Carousel initialized with ${this.items.length} items, ${this.visibleItems} visible`);
  }

  calculateVisibleItems() {
    // Calculate how many items can be visible based on container width
    const containerWidth = this.container.clientWidth - 80; // Subtract padding
    return Math.max(1, Math.floor(containerWidth / this.itemWidth));
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

  updatePosition() {
    if (!this.itemsContainer) return;

    const translateX = -this.currentPosition * this.itemWidth;
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

  // Find all carousel containers
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

      // Find carousels within this accordion content
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
