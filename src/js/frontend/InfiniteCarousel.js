/**
 * Continuous Infinite Scroll Carousel
 * - Keeps scrolling in the same direction continuously
 * - Duplicates items dynamically as needed
 * - Shows all items without cutoff
 */

import { createLogger } from '@utils';

const logger = createLogger('InfiniteCarousel');

class InfiniteCarousel {
  constructor(container) {
    this.container = container;
    this.itemsContainer = container.querySelector('.suggestions-container');
    this.originalItems = Array.from(container.querySelectorAll('.suggestion-item'));
    this.prevBtn = container.querySelector('.suggestions-nav.prev');
    this.nextBtn = container.querySelector('.suggestions-nav.next');
    
    // Determine if this is a similar products carousel
    this.isSimilarProducts = container.classList.contains('similar-products-carousel');
    
    if (!this.itemsContainer || this.originalItems.length === 0) {
      logger.warn('Carousel missing required elements');
      return;
    }
    
    // Configuration
    this.itemWidth = this.isSimilarProducts ? 170 : 200;
    this.itemGap = this.isSimilarProducts ? 5 : 15;
    this.animationDuration = 300; // ms
    
    // State
    this.currentPosition = 0;
    this.itemCount = this.originalItems.length;
    this.isAnimating = false;
    this.duplicatedSets = 0;
    
    // Store instance on container
    container.carouselInstance = this;
    
    this.init();
  }
  
  init() {
    // Calculate dimensions
    this.calculateDimensions();
    
    // Duplicate items if needed to fill the container
    this.ensureSufficientItems();
    
    // Initialize position
    this.setPosition(0, false);
    
    // Bind events
    this.bindEvents();
    
    // Update button states and ensure they're enabled
    this.updateButtons();
    
    logger.log(`Initialized continuous scroll carousel with ${this.itemCount} items`);
  }
  
  calculateDimensions() {
    const containerStyles = window.getComputedStyle(this.container);
    const containerPadding = parseInt(containerStyles.paddingLeft) + parseInt(containerStyles.paddingRight);
    
    // Get the raw container width
    this.containerWidth = this.container.clientWidth;
    
    // Calculate available width for items (accounting for padding)
    const availableWidth = this.containerWidth - containerPadding;
    
    // Calculate visible items
    const itemTotalWidth = this.itemWidth + this.itemGap;
    this.visibleItems = Math.floor(availableWidth / itemTotalWidth);
    
    // Ensure at least 1 visible
    this.visibleItems = Math.max(1, this.visibleItems);
    
    // Calculate total width of all items
    this.totalItemsWidth = this.itemCount * itemTotalWidth - this.itemGap;
    
    logger.log(`Container width: ${this.containerWidth}, Padding: ${containerPadding}, Visible items: ${this.visibleItems}, Available width: ${availableWidth}`);
  }
  
  ensureSufficientItems() {
    const itemTotalWidth = this.itemWidth + this.itemGap;
    const containerStyles = window.getComputedStyle(this.container);
    const containerPadding = parseInt(containerStyles.paddingLeft) + parseInt(containerStyles.paddingRight);
    const containerAvailableWidth = this.containerWidth - containerPadding;
    
    // Ensure we have enough items for smooth scrolling (3x the visible width)
    while (this.totalItemsWidth < containerAvailableWidth * 3) {
      this.duplicateItems();
    }
  }
  
  duplicateItems() {
    const clonedItems = [];
    
    // Clone all original items
    this.originalItems.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.classList.add('duplicated');
      clone.dataset.duplicateSet = this.duplicatedSets;
      clonedItems.push(clone);
    });
    
    // Append to container
    clonedItems.forEach(clone => {
      this.itemsContainer.appendChild(clone);
    });
    
    // Update counts
    this.itemCount += this.originalItems.length;
    this.duplicatedSets++;
    
    // Recalculate dimensions
    const itemTotalWidth = this.itemWidth + this.itemGap;
    this.totalItemsWidth = this.itemCount * itemTotalWidth - this.itemGap;
    
    logger.log(`Duplicated items. Total count: ${this.itemCount}`);
  }
  
  bindEvents() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }
    
    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.calculateDimensions();
        this.ensureSufficientItems();
      }, 150);
    });
    
    // Handle animation end
    this.itemsContainer.addEventListener('transitionend', () => {
      this.isAnimating = false;
      this.checkInfiniteScroll();
    });
  }
  
  prev() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.currentPosition = Math.max(0, this.currentPosition - 1);
    
    this.setPosition(this.currentPosition, true);
  }
  
  next() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    
    // Always increment position for continuous scrolling
    this.currentPosition++;
    
    // Set the new position
    this.setPosition(this.currentPosition, true);
  }
  
  setPosition(position, animate = true) {
    const itemTotalWidth = this.itemWidth + this.itemGap;
    const translateX = -position * itemTotalWidth;
    
    if (animate) {
      this.itemsContainer.style.transition = `transform ${this.animationDuration}ms ease`;
    } else {
      this.itemsContainer.style.transition = 'none';
    }
    
    this.itemsContainer.style.transform = `translateX(${translateX}px)`;
    
    if (animate) {
      this.updateButtons();
    }
  }
  
  checkInfiniteScroll() {
    const itemTotalWidth = this.itemWidth + this.itemGap;
    const currentTranslateX = -this.currentPosition * itemTotalWidth;
    const containerStyles = window.getComputedStyle(this.container);
    const containerPadding = parseInt(containerStyles.paddingLeft) + parseInt(containerStyles.paddingRight);
    const availableWidth = this.containerWidth - containerPadding;
    
    // Calculate how many items are currently visible ahead of current position
    const itemsAhead = Math.floor((this.totalItemsWidth + currentTranslateX) / itemTotalWidth);
    
    // Duplicate when we have less than 10 items ahead
    if (itemsAhead < 10) {
      this.duplicateItems();
      logger.log(`Duplicating items - items ahead: ${itemsAhead}`);
    }
  }
  
  updateButtons() {
    // Always enable next button for infinite scroll
    if (this.nextBtn) {
      this.nextBtn.classList.remove('disabled');
      this.nextBtn.disabled = false; // Ensure it's not disabled at DOM level
      this.nextBtn.style.pointerEvents = 'auto'; // Ensure clicks are allowed
    }
    
    // Disable prev button at the beginning
    if (this.prevBtn) {
      this.prevBtn.classList.toggle('disabled', this.currentPosition === 0);
      this.prevBtn.disabled = this.currentPosition === 0;
    }
  }
  
  destroy() {
    // Remove event listeners
    if (this.prevBtn) {
      this.prevBtn.removeEventListener('click', () => this.prev());
    }
    
    if (this.nextBtn) {
      this.nextBtn.removeEventListener('click', () => this.next());
    }
    
    // Remove instance reference
    delete this.container.carouselInstance;
  }
}

export { InfiniteCarousel };
export default InfiniteCarousel;