/**
 * ProductDetailsToggle.js
 *
 * Handles the show/hide functionality for both similar products and product notes sections
 */

class ProductDetailsToggle {
  /**
   * Initialize the toggle functionality
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    // Default configuration
    this.config = Object.assign({
      debug: false,
      selectors: {
        productToggleButton: '.product-details-toggle',
        notesToggleButton: '.product-notes-toggle',
        productItem: '.product-item',
        similarProductsContainer: '.similar-products-container',
        productIncludes: '.product-includes',
        similarProducts: '.product-similar-products',
        productNotes: '.product-notes',
        notesContainer: '.notes-container'
      },
      i18n: {
        showProducts: 'Similar Products',
        hideProducts: 'Similar Products',
        showNotes: 'Product Notes',
        hideNotes: 'Product Notes',
        loading: 'Loading...'
      }
    }, config);

    // Track initialized state
    this.initialized = false;

    // Initialize on load
    this.init();
  }

  /**
   * Initialize toggle functionality
   */
  init() {
    if (this.initialized) {
      this.log('Already initialized, skipping');
      return;
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }

    // Also initialize when modal content changes
    document.addEventListener('product_estimator_modal_loaded', () => {
      this.log('Modal content loaded, initializing toggles');
      this.setup();
    });

    // Set up a mutation observer to watch for new content
    this.setupMutationObserver();

    // Mark as initialized
    this.initialized = true;
    this.log('ProductDetailsToggle initialized');
  }

  /**
   * Set up mutation observer to watch for DOM changes
   */
  setupMutationObserver() {
    // Create a mutation observer to detect when new content is added
    const observer = new MutationObserver((mutations) => {
      let shouldSetup = false;
      mutations.forEach(mutation => {
        // Check if new nodes were added
        if (mutation.addedNodes.length) {
          // Look for product items or toggle buttons in added content
          Array.from(mutation.addedNodes).forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.matches(this.config.selectors.productItem) ||
                node.matches(this.config.selectors.productToggleButton) ||
                node.matches(this.config.selectors.notesToggleButton) ||
                node.querySelector(this.config.selectors.productItem) ||
                node.querySelector(this.config.selectors.productToggleButton) ||
                node.querySelector(this.config.selectors.notesToggleButton)) {
                shouldSetup = true;
              }
            }
          });
        }
      });

      // If relevant content was added, re-setup toggle functionality
      if (shouldSetup) {
        this.log('New toggle-related content detected, re-initializing');
        setTimeout(() => this.setup(), 100);
      }
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
    this.log('Mutation observer set up');
  }

  /**
   * Set up toggle functionality
   */
  setup() {
    this.log('Setting up product details toggles');

    // Prepare the DOM structure for both toggle types
    this.prepareProductsToggle();
    this.prepareNotesToggle();

    // Then bind events to all toggle buttons
    this.bindEvents();

    // Re-initialize carousels after setup
    this.initializeAllCarousels();
  }

  /**
   * Prepare the DOM for similar products toggle
   */
  prepareProductsToggle() {
    // Find all product items
    const productItems = document.querySelectorAll(this.config.selectors.productItem);
    this.log(`Found ${productItems.length} product items to process for similar products toggle`);

    productItems.forEach(productItem => {
      // Skip if already processed for products toggle
      if (productItem.classList.contains('products-toggle-processed')) {
        return;
      }

      // Find similar products section
      const similarProductsSection = productItem.querySelector(this.config.selectors.similarProducts);

      // Check if product has similar products to toggle
      if (!similarProductsSection) {
        this.log('No similar products section found for product item, skipping', productItem);
        return; // No similar products to toggle
      }

      this.log('Found similar products section, processing', similarProductsSection);

      // Mark the product item as having similar products
      productItem.classList.add('has-similar-products');

      // Check if container already exists
      let similarProductsContainer = productItem.querySelector(this.config.selectors.similarProductsContainer);

      // If no container exists but there is a similar products section, we need to create one
      if (!similarProductsContainer) {
        this.log('Creating new similar products container');
        // Create a container to wrap similar products
        similarProductsContainer = document.createElement('div');
        similarProductsContainer.className = 'similar-products-container visible'; // Add visible class

        // Move similar products into the container (if not already in one)
        if (similarProductsSection.parentNode !== similarProductsContainer) {
          // Clone the node to prevent reference issues
          const clonedSection = similarProductsSection.cloneNode(true);
          similarProductsContainer.appendChild(clonedSection);

          // Remove the original from DOM
          similarProductsSection.parentNode.removeChild(similarProductsSection);
        }

        // Add the container to the product item
        productItem.appendChild(similarProductsContainer);
      }

      // Add toggle button if not already present
      let toggleButton = productItem.querySelector(this.config.selectors.productToggleButton);
      if (!toggleButton) {
        this.log('Adding similar products toggle button to product item');
        toggleButton = document.createElement('button');

        // Mark as expanded by default and use the proper class for the arrow
        toggleButton.className = 'product-details-toggle expanded';
        toggleButton.setAttribute('data-toggle-type', 'similar-products');

        // Use the hideProducts text (since it's expanded) and arrow-up icon
        toggleButton.innerHTML = `
        ${this.config.i18n.hideProducts}
        <span class="toggle-icon dashicons dashicons-arrow-up-alt2"></span>
      `;

        // Insert button before the similar products container
        productItem.insertBefore(toggleButton, similarProductsContainer);
      } else {
        // Make sure existing button has the correct state
        toggleButton.classList.add('expanded');
        const iconElement = toggleButton.querySelector('.toggle-icon');
        if (iconElement) {
          iconElement.classList.remove('dashicons-arrow-down-alt2');
          iconElement.classList.add('dashicons-arrow-up-alt2');
        }
      }

      // Initially show the similar products container (expanded by default)
      similarProductsContainer.style.display = 'block';
      similarProductsContainer.classList.add('visible');

      // Mark as processed to avoid duplicating
      productItem.classList.add('products-toggle-processed');
      this.log('Product item processed for similar products toggle');
    });
  }

  /**
   * Prepare the DOM for notes toggle
   */
  prepareNotesToggle() {
    // Find all product items
    const productItems = document.querySelectorAll(this.config.selectors.productItem);
    this.log(`Found ${productItems.length} product items to process for notes toggle`);

    productItems.forEach(productItem => {
      // Skip if already processed for notes toggle
      if (productItem.classList.contains('notes-toggle-processed')) {
        return;
      }

      // Find product notes section
      const notesSection = productItem.querySelector(this.config.selectors.productNotes);

      // Check if product has notes to toggle
      if (!notesSection) {
        this.log('No notes section found for product item, skipping', productItem);
        return; // No notes to toggle
      }

      this.log('Found notes section, processing', notesSection);

      // Mark the product item as having notes
      productItem.classList.add('has-notes');

      // Check if container already exists
      let notesContainer = productItem.querySelector(this.config.selectors.notesContainer);

      // If no container exists but there is a notes section, we need to create one
      if (!notesContainer) {
        this.log('Creating new notes container');
        // Create a container to wrap notes
        notesContainer = document.createElement('div');
        notesContainer.className = 'notes-container visible'; // Add visible class

        // Move notes into the container (if not already in one)
        if (notesSection.parentNode !== notesContainer) {
          // Clone the node to prevent reference issues
          const clonedSection = notesSection.cloneNode(true);
          notesContainer.appendChild(clonedSection);

          // Remove the original from DOM
          notesSection.parentNode.removeChild(notesSection);
        }

        // Add the container to the product item
        productItem.appendChild(notesContainer);
      }

      // Add toggle button if not already present
      let toggleButton = productItem.querySelector(this.config.selectors.notesToggleButton);
      if (!toggleButton) {
        this.log('Adding notes toggle button to product item');
        toggleButton = document.createElement('button');

        // Mark as expanded by default and use the proper class for the arrow
        toggleButton.className = 'product-notes-toggle expanded';
        toggleButton.setAttribute('data-toggle-type', 'notes');

        // Use the hideNotes text (since it's expanded) and arrow-up icon
        toggleButton.innerHTML = `
        ${this.config.i18n.hideNotes}
        <span class="toggle-icon dashicons dashicons-arrow-up-alt2"></span>
      `;

        // Insert button before the notes container
        productItem.insertBefore(toggleButton, notesContainer);
      } else {
        // Make sure existing button has the correct state
        toggleButton.classList.add('expanded');
        const iconElement = toggleButton.querySelector('.toggle-icon');
        if (iconElement) {
          iconElement.classList.remove('dashicons-arrow-down-alt2');
          iconElement.classList.add('dashicons-arrow-up-alt2');
        }
      }

      // Initially show the notes container (expanded by default)
      notesContainer.style.display = 'block';
      notesContainer.classList.add('visible');

      // Mark as processed to avoid duplicating
      productItem.classList.add('notes-toggle-processed');
      this.log('Product item processed for notes toggle');
    });
  }

  /**
   * Bind click events to all toggle buttons
   */
  bindEvents() {
    // Bind product toggle buttons
    const productToggleButtons = document.querySelectorAll(this.config.selectors.productToggleButton);
    this.log(`Found ${productToggleButtons.length} similar products toggle buttons to bind`);

    productToggleButtons.forEach(button => {
      // Skip if already bound
      if (button._toggleBound) {
        return;
      }

      // Store reference to handler for potential removal
      button._toggleHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleSimilarProducts(button);
      };

      // Add event listener
      button.addEventListener('click', button._toggleHandler);

      // Mark as bound to avoid duplicate handlers
      button._toggleBound = true;
    });

    // Bind notes toggle buttons
    const notesToggleButtons = document.querySelectorAll(this.config.selectors.notesToggleButton);
    this.log(`Found ${notesToggleButtons.length} notes toggle buttons to bind`);

    notesToggleButtons.forEach(button => {
      // Skip if already bound
      if (button._toggleBound) {
        return;
      }

      // Store reference to handler for potential removal
      button._toggleHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleNotes(button);
      };

      // Add event listener
      button.addEventListener('click', button._toggleHandler);

      // Mark as bound to avoid duplicate handlers
      button._toggleBound = true;
    });

    this.log('All toggle events bound');
  }

  /**
   * Toggle the visibility of similar products
   * @param {HTMLElement} toggleButton - The button that was clicked
   */
  toggleSimilarProducts(toggleButton) {
    // Find parent product item
    const productItem = toggleButton.closest(this.config.selectors.productItem);

    if (!productItem) {
      this.log('Product item not found for toggle button');
      return;
    }

    // Find similar products container
    const similarProductsContainer = productItem.querySelector(this.config.selectors.similarProductsContainer);

    if (!similarProductsContainer) {
      this.log('Similar products container not found');
      return;
    }

    // Toggle expanded state
    const isExpanded = toggleButton.classList.contains('expanded');
    this.log(`Similar products toggle clicked, current expanded state: ${isExpanded}`);

    // Get the icon element
    const iconElement = toggleButton.querySelector('.toggle-icon');

    if (isExpanded) {
      // Hide similar products
      similarProductsContainer.classList.remove('visible');
      similarProductsContainer.style.display = 'none';
      toggleButton.classList.remove('expanded');

      // Update icon - directly manipulate the classes instead of relying on HTML replacement
      if (iconElement) {
        iconElement.classList.remove('dashicons-arrow-up-alt2');
        iconElement.classList.add('dashicons-arrow-down-alt2');
      }

      // Keep the text the same per design requirements
      this.log('Similar products hidden');
    } else {
      // Show similar products
      similarProductsContainer.classList.add('visible');
      similarProductsContainer.style.display = 'block';
      toggleButton.classList.add('expanded');

      // Update icon - directly manipulate the classes
      if (iconElement) {
        iconElement.classList.remove('dashicons-arrow-down-alt2');
        iconElement.classList.add('dashicons-arrow-up-alt2');
      }

      // Keep the text the same per design requirements
      this.log('Similar products shown');

      // Initialize carousels if they exist
      this.initializeCarousels(similarProductsContainer);
    }
  }

  /**
   * Toggle the visibility of product notes
   * @param {HTMLElement} toggleButton - The button that was clicked
   */
  toggleNotes(toggleButton) {
    // Find parent product item
    const productItem = toggleButton.closest(this.config.selectors.productItem);

    if (!productItem) {
      this.log('Product item not found for notes toggle button');
      return;
    }

    // Find notes container
    const notesContainer = productItem.querySelector(this.config.selectors.notesContainer);

    if (!notesContainer) {
      this.log('Notes container not found');
      return;
    }

    // Toggle expanded state
    const isExpanded = toggleButton.classList.contains('expanded');
    this.log(`Notes toggle clicked, current expanded state: ${isExpanded}`);

    // Get the icon element
    const iconElement = toggleButton.querySelector('.toggle-icon');

    if (isExpanded) {
      // Hide notes
      notesContainer.classList.remove('visible');
      notesContainer.style.display = 'none';
      toggleButton.classList.remove('expanded');

      // Update icon - directly manipulate the classes instead of relying on HTML replacement
      if (iconElement) {
        iconElement.classList.remove('dashicons-arrow-up-alt2');
        iconElement.classList.add('dashicons-arrow-down-alt2');
      }

      // Keep the text the same per design requirements
      this.log('Notes hidden');
    } else {
      // Show notes
      notesContainer.classList.add('visible');
      notesContainer.style.display = 'block';
      toggleButton.classList.add('expanded');

      // Update icon - directly manipulate the classes
      if (iconElement) {
        iconElement.classList.remove('dashicons-arrow-down-alt2');
        iconElement.classList.add('dashicons-arrow-up-alt2');
      }

      // Keep the text the same per design requirements
      this.log('Notes shown');
    }
  }

  /**
   * Initialize carousels within the container
   * @param {HTMLElement} container - The container with carousels
   */
  initializeCarousels(container) {
    // Check if SuggestionsCarousel initialization function exists
    if (typeof window.initSuggestionsCarousels === 'function') {
      this.log('Initializing carousels in similar products container');
      window.initSuggestionsCarousels();
    } else if (typeof initSuggestionsCarousels === 'function') {
      this.log('Using local initSuggestionsCarousels function');
      initSuggestionsCarousels();
    } else {
      this.log('Carousel initialization function not found', window.initSuggestionsCarousels);
    }
  }

  /**
   * Initialize all carousels on the page
   */
  initializeAllCarousels() {
    if (typeof window.initSuggestionsCarousels === 'function') {
      this.log('Initializing all carousels');
      window.initSuggestionsCarousels();
    } else if (typeof initSuggestionsCarousels === 'function') {
      initSuggestionsCarousels();
    }
  }

  /**
   * Log debug messages if debug mode is enabled
   * @param {...any} args - Arguments to log
   */
  log(...args) {
    if (this.config.debug) {
      console.log('[ProductDetailsToggle]', ...args);
    }
  }
}

// Create singleton instance
const instance = new ProductDetailsToggle({
  debug: window.productEstimatorVars?.debug || false,
  i18n: {
    showProducts: window.productEstimatorVars?.i18n?.showSimilarProducts || 'Similar Products',
    hideProducts: window.productEstimatorVars?.i18n?.hideSimilarProducts || 'Similar Products',
    showNotes: window.productEstimatorVars?.i18n?.showNotes || 'Product Notes',
    hideNotes: window.productEstimatorVars?.i18n?.hideNotes || 'Product Notes',
    loading: window.productEstimatorVars?.i18n?.loading || 'Loading...'
  }
});

// Export both the class and the instance
export { ProductDetailsToggle, instance as default };
