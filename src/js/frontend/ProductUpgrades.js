/**
 * ProductUpgrades.js
 *
 * Handles all product upgrade related functionality for the Product Estimator plugin.
 * Manages display and selection of product upgrade options in the estimator.
 */

class ProductUpgrades {
  /**
   * Initialize the ProductUpgrades module
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    // Default configuration
    this.config = Object.assign({
      debug: false,
      selectors: {
        productItem: '.product-item',
        productIncludes: '.product-includes',
        upgradeContainer: '.product-upgrades',
        upgradeSelect: '.product-upgrade-select',
        upgradeRadio: '.product-upgrade-radio',
        upgradeTiles: '.product-upgrade-tiles'
      }
    }, config);

    // State
    this.initialized = false;
    this.upgradeData = {};

    // Initialize if auto-init is not set to false
    if (config.autoInit !== false) {
      this.init();
    }
  }

  /**
   * Initialize the module
   * @returns {ProductUpgrades} This instance for chaining
   */
  init() {
    if (this.initialized) {
      this.log('ProductUpgrades already initialized');
      return this;
    }

    // Bind event handlers
    this.bindEvents();

    // Initialize any existing upgrade elements
    this.initializeExistingUpgrades();

    this.initialized = true;
    this.log('ProductUpgrades initialized');
    return this;
  }

  /**
   * Bind events for handling upgrades
   */
  bindEvents() {
    // Delegate event listeners to handle upgrades in dynamically added content
    document.addEventListener('click', (e) => {
      // Handle dropdown change events
      const upgradeSelect = e.target.closest(this.config.selectors.upgradeSelect);
      if (upgradeSelect) {
        this.handleUpgradeSelection(upgradeSelect);
      }

      // Handle radio button change events
      const upgradeRadio = e.target.closest(this.config.selectors.upgradeRadio + ' input[type="radio"]');
      if (upgradeRadio) {
        this.handleUpgradeRadioSelection(upgradeRadio);
      }

      // Handle tile selection events
      const upgradeTile = e.target.closest(this.config.selectors.upgradeTiles + ' .upgrade-tile');
      if (upgradeTile) {
        this.handleUpgradeTileSelection(upgradeTile);
      }
    });

    // Listen for product added events
    document.addEventListener('product_estimator_product_added', (e) => {
      if (e.detail && e.detail.productElement) {
        this.initializeUpgradesForProduct(e.detail.productElement);
      }
    });

    // Listen for accordion open events to ensure upgrades are properly displayed
    document.addEventListener('product_estimator_accordion_opened', (e) => {
      if (e.detail && e.detail.accordionContent) {
        const productItems = e.detail.accordionContent.querySelectorAll(this.config.selectors.productItem);
        productItems.forEach(product => {
          this.initializeUpgradesForProduct(product);
        });
      }
    });

    this.log('Events bound for product upgrades');
  }

  /**
   * Initialize any upgrade elements that already exist in the DOM
   */
  initializeExistingUpgrades() {
    const productItems = document.querySelectorAll(this.config.selectors.productItem);
    if (productItems.length) {
      this.log(`Found ${productItems.length} existing product items to check for upgrades`);

      productItems.forEach(product => {
        this.initializeUpgradesForProduct(product);
      });
    }
  }

  /**
   * Initialize upgrades for a specific product element
   * @param {HTMLElement} productElement - The product element
   */
  initializeUpgradesForProduct(productElement) {
    if (!productElement) return;

    const productId = this.getProductIdFromElement(productElement);
    if (!productId) {
      this.log('No product ID found for element', productElement);
      return;
    }

    // First check if upgrades are already initialized for this product
    if (productElement.dataset.upgradesInitialized === 'true') {
      this.log(`Upgrades already initialized for product ${productId}`);
      return;
    }

    // Load upgrade data for this product
    this.loadProductUpgrades(productId)
      .then(upgradeData => {
        if (upgradeData && upgradeData.length > 0) {
          this.renderUpgrades(productElement, upgradeData);
          productElement.dataset.upgradesInitialized = 'true';
        } else {
          this.log(`No upgrade options found for product ${productId}`);
        }
      })
      .catch(error => {
        this.log('Error loading product upgrades:', error);
      });
  }

  /**
   * Get product ID from a product element
   * @param {HTMLElement} productElement - The product element
   * @returns {string|number|null} The product ID or null if not found
   */
  getProductIdFromElement(productElement) {
    // Try various ways to find the product ID

    // 1. Check for data attribute on the product element itself
    if (productElement.dataset.productId) {
      return productElement.dataset.productId;
    }

    // 2. Check for a button with product ID
    const button = productElement.querySelector('[data-product-id]');
    if (button && button.dataset.productId) {
      return button.dataset.productId;
    }

    // 3. Check for hidden input with product ID
    const input = productElement.querySelector('input[name="product_id"]');
    if (input && input.value) {
      return input.value;
    }

    // 4. Try to extract from the URL in the product link
    const productLink = productElement.querySelector('a.product-name');
    if (productLink && productLink.href) {
      const match = productLink.href.match(/product\/(\d+)/);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Load upgrade options for a product via AJAX
   * @param {string|number} productId - The product ID
   * @returns {Promise<Array>} Promise resolving to array of upgrade options
   */
  loadProductUpgrades(productId) {
    return new Promise((resolve, reject) => {
      // Check if we already have data cached
      if (this.upgradeData[productId]) {
        this.log(`Using cached upgrade data for product ${productId}`);
        resolve(this.upgradeData[productId]);
        return;
      }

      // Use WordPress AJAX to fetch upgrade options
      fetch(productEstimatorVars.ajax_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          action: 'get_product_upgrades',
          nonce: productEstimatorVars.nonce,
          product_id: productId
        })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Network response error: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success && data.data) {
            // Cache the upgrade data
            this.upgradeData[productId] = data.data.upgrades || [];
            resolve(this.upgradeData[productId]);
          } else {
            // No upgrades or error
            this.upgradeData[productId] = [];
            resolve([]);
          }
        })
        .catch(error => {
          this.log('Error fetching product upgrades:', error);
          reject(error);
        });
    });
  }

  /**
   * Render upgrade options for a product
   * @param {HTMLElement} productElement - The product element
   * @param {Array} upgradeOptions - Array of upgrade options
   */
  renderUpgrades(productElement, upgradeOptions) {
    if (!upgradeOptions || upgradeOptions.length === 0) return;

    // Find the product includes container to add upgrades inside it
    const includesContainer = productElement.querySelector(this.config.selectors.productIncludes);
    if (!includesContainer) {
      this.log('Product includes container not found, cannot add upgrades');
      return;
    }

    // Create container for upgrades if it doesn't exist
    let upgradeContainer = productElement.querySelector(this.config.selectors.upgradeContainer);
    if (!upgradeContainer) {
      upgradeContainer = document.createElement('div');
      upgradeContainer.className = 'product-upgrades';
      includesContainer.appendChild(upgradeContainer);
    }

    // Clear any existing content
    upgradeContainer.innerHTML = '';

    // Process each upgrade configuration
    upgradeOptions.forEach(upgrade => {
      this.renderUpgradeOption(upgradeContainer, upgrade);
    });

    this.log(`Rendered ${upgradeOptions.length} upgrade options for product`);
  }

  /**
   * Render a single upgrade option
   * @param {HTMLElement} container - Container element
   * @param {Object} upgrade - Upgrade configuration
   */
  renderUpgradeOption(container, upgrade) {
    // Create the upgrade option based on display mode
    const upgradeElement = document.createElement('div');
    upgradeElement.className = 'product-upgrade-option';

    // Add title if available
    if (upgrade.title) {
      const titleElement = document.createElement('h4');
      titleElement.className = 'upgrade-title';
      titleElement.textContent = upgrade.title;
      upgradeElement.appendChild(titleElement);
    }

    // Add description if available
    if (upgrade.description) {
      const descElement = document.createElement('p');
      descElement.className = 'upgrade-description';
      descElement.textContent = upgrade.description;
      upgradeElement.appendChild(descElement);
    }

    // Create the appropriate input based on display mode
    switch (upgrade.display_mode) {
      case 'dropdown':
        this.createDropdownUpgrade(upgradeElement, upgrade);
        break;

      case 'radio':
        this.createRadioUpgrade(upgradeElement, upgrade);
        break;

      case 'tiles':
        this.createTilesUpgrade(upgradeElement, upgrade);
        break;

      default:
        // Default to dropdown
        this.createDropdownUpgrade(upgradeElement, upgrade);
    }

    // Add to container
    container.appendChild(upgradeElement);
  }

  /**
   * Create a dropdown upgrade option
   * @param {HTMLElement} container - Container element
   * @param {Object} upgrade - Upgrade configuration
   */
  createDropdownUpgrade(container, upgrade) {
    const selectContainer = document.createElement('div');
    selectContainer.className = 'product-upgrade-select';
    selectContainer.dataset.upgradeId = upgrade.id;

    const select = document.createElement('select');
    select.className = 'upgrade-select';
    select.name = `upgrade_${upgrade.id}`;

    // Add default "No upgrade" option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'No upgrade';
    select.appendChild(defaultOption);

    // Add upgrade options
    if (upgrade.upgrade_categories && upgrade.upgrade_categories.length > 0) {
      // First load all products in these categories
      this.loadCategoryProducts(upgrade.upgrade_categories)
        .then(products => {
          products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            option.dataset.price = product.price;
            select.appendChild(option);
          });
        })
        .catch(error => {
          this.log('Error loading category products:', error);
        });
    }

    selectContainer.appendChild(select);
    container.appendChild(selectContainer);

    // Add change event listener
    select.addEventListener('change', () => this.handleUpgradeSelection(select));
  }

  /**
   * Create radio button upgrade options
   * @param {HTMLElement} container - Container element
   * @param {Object} upgrade - Upgrade configuration
   */
  createRadioUpgrade(container, upgrade) {
    const radioContainer = document.createElement('div');
    radioContainer.className = 'product-upgrade-radio';
    radioContainer.dataset.upgradeId = upgrade.id;

    // Create a form group for radio buttons
    const radioGroup = document.createElement('div');
    radioGroup.className = 'radio-group';

    // Add "No upgrade" option
    const defaultLabel = document.createElement('label');
    defaultLabel.className = 'radio-label';

    const defaultRadio = document.createElement('input');
    defaultRadio.type = 'radio';
    defaultRadio.name = `upgrade_${upgrade.id}`;
    defaultRadio.value = '';
    defaultRadio.checked = true;

    defaultLabel.appendChild(defaultRadio);
    defaultLabel.appendChild(document.createTextNode('No upgrade'));
    radioGroup.appendChild(defaultLabel);

    // Load and add upgrade options
    if (upgrade.upgrade_categories && upgrade.upgrade_categories.length > 0) {
      this.loadCategoryProducts(upgrade.upgrade_categories)
        .then(products => {
          products.forEach(product => {
            const label = document.createElement('label');
            label.className = 'radio-label';

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `upgrade_${upgrade.id}`;
            radio.value = product.id;
            radio.dataset.price = product.price;

            label.appendChild(radio);
            label.appendChild(document.createTextNode(product.name));
            radioGroup.appendChild(label);
          });
        })
        .catch(error => {
          this.log('Error loading category products:', error);
        });
    }

    radioContainer.appendChild(radioGroup);
    container.appendChild(radioContainer);
  }

  /**
   * Create image tiles upgrade options
   * @param {HTMLElement} container - Container element
   * @param {Object} upgrade - Upgrade configuration
   */
  createTilesUpgrade(container, upgrade) {
    const tilesContainer = document.createElement('div');
    tilesContainer.className = 'product-upgrade-tiles';
    tilesContainer.dataset.upgradeId = upgrade.id;

    // Create tiles wrapper
    const tilesWrapper = document.createElement('div');
    tilesWrapper.className = 'tiles-wrapper';

    // Add "No upgrade" tile
    const defaultTile = document.createElement('div');
    defaultTile.className = 'upgrade-tile selected';
    defaultTile.dataset.value = '';

    const defaultLabel = document.createElement('span');
    defaultLabel.className = 'tile-label';
    defaultLabel.textContent = 'No upgrade';

    defaultTile.appendChild(defaultLabel);
    tilesWrapper.appendChild(defaultTile);

    // Load and add upgrade options
    if (upgrade.upgrade_categories && upgrade.upgrade_categories.length > 0) {
      this.loadCategoryProducts(upgrade.upgrade_categories)
        .then(products => {
          products.forEach(product => {
            const tile = document.createElement('div');
            tile.className = 'upgrade-tile';
            tile.dataset.value = product.id;
            tile.dataset.price = product.price;

            // Add product image if available
            if (product.image) {
              const img = document.createElement('img');
              img.src = product.image;
              img.alt = product.name;
              img.className = 'tile-image';
              tile.appendChild(img);
            }

            const label = document.createElement('span');
            label.className = 'tile-label';
            label.textContent = product.name;

            tile.appendChild(label);
            tilesWrapper.appendChild(tile);
          });
        })
        .catch(error => {
          this.log('Error loading category products:', error);
        });
    }

    tilesContainer.appendChild(tilesWrapper);

    // Add hidden input to store selection
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = `upgrade_${upgrade.id}`;
    hiddenInput.value = '';
    tilesContainer.appendChild(hiddenInput);

    container.appendChild(tilesContainer);

    // Add click event delegation for tiles
    tilesContainer.addEventListener('click', e => {
      const tile = e.target.closest('.upgrade-tile');
      if (tile) {
        // Deselect all tiles
        tilesContainer.querySelectorAll('.upgrade-tile').forEach(t => {
          t.classList.remove('selected');
        });

        // Select clicked tile
        tile.classList.add('selected');

        // Update hidden input
        hiddenInput.value = tile.dataset.value;

        // Trigger update event
        this.handleUpgradeChange(tilesContainer, tile.dataset.value);
      }
    });
  }

  /**
   * Load products from specified categories
   * @param {Array} categoryIds - Array of category IDs
   * @returns {Promise<Array>} Promise resolving to array of product objects
   */
  loadCategoryProducts(categoryIds) {
    return new Promise((resolve, reject) => {
      fetch(productEstimatorVars.ajax_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          action: 'get_category_products',
          nonce: productEstimatorVars.nonce,
          categories: categoryIds.join(',')
        })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Network response error: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success && data.data) {
            resolve(data.data.products || []);
          } else {
            resolve([]);
          }
        })
        .catch(error => {
          this.log('Error fetching category products:', error);
          reject(error);
        });
    });
  }

  /**
   * Handle selection from dropdown
   * @param {HTMLSelectElement} select - The select element
   */
  handleUpgradeSelection(select) {
    const value = select.value;
    const upgradeContainer = select.closest(this.config.selectors.upgradeSelect);

    if (upgradeContainer) {
      this.handleUpgradeChange(upgradeContainer, value);
    }
  }

  /**
   * Handle selection from radio buttons
   * @param {HTMLInputElement} radio - The radio input element
   */
  handleUpgradeRadioSelection(radio) {
    if (radio.checked) {
      const value = radio.value;
      const upgradeContainer = radio.closest(this.config.selectors.upgradeRadio);

      if (upgradeContainer) {
        this.handleUpgradeChange(upgradeContainer, value);
      }
    }
  }

  /**
   * Handle selection from tiles
   * @param {HTMLElement} tile - The tile element
   */
  handleUpgradeTileSelection(tile) {
    const value = tile.dataset.value;
    const upgradeContainer = tile.closest(this.config.selectors.upgradeTiles);

    // Update tile selection visually
    if (upgradeContainer) {
      const allTiles = upgradeContainer.querySelectorAll('.upgrade-tile');
      allTiles.forEach(t => t.classList.remove('selected'));
      tile.classList.add('selected');

      // Update hidden input
      const hiddenInput = upgradeContainer.querySelector('input[type="hidden"]');
      if (hiddenInput) {
        hiddenInput.value = value;
      }

      this.handleUpgradeChange(upgradeContainer, value);
    }
  }

  /**
   * Handle upgrade change (common handler for all types)
   * @param {HTMLElement} container - The upgrade container
   * @param {string} value - The selected value
   */
  handleUpgradeChange(container, value) {
    const upgradeId = container.dataset.upgradeId;
    const productElement = container.closest(this.config.selectors.productItem);

    if (!productElement) {
      this.log('Product element not found for upgrade change');
      return;
    }

    const productId = this.getProductIdFromElement(productElement);

    if (!productId) {
      this.log('Product ID not found for upgrade change');
      return;
    }

    this.log(`Upgrade changed for product ${productId}, upgrade ${upgradeId}: ${value}`);

    // Update product data with upgrade selection
    this.updateProductWithUpgrade(productElement, upgradeId, value);

    // Trigger custom event for other components to react
    const event = new CustomEvent('product_estimator_upgrade_changed', {
      bubbles: true,
      detail: {
        productId,
        upgradeId,
        value,
        productElement
      }
    });

    container.dispatchEvent(event);
  }

  /**
   * Update product data with upgrade selection
   * @param {HTMLElement} productElement - The product element
   * @param {string} upgradeId - Upgrade configuration ID
   * @param {string} upgradeValue - Selected upgrade value
   */
  updateProductWithUpgrade(productElement, upgradeId, upgradeValue) {
    // Store upgrade selection in product element's dataset
    productElement.dataset[`upgrade_${upgradeId}`] = upgradeValue;

    // If the upgrade value is empty, remove any previous selection
    if (!upgradeValue) {
      delete productElement.dataset[`upgrade_${upgradeId}`];
    }

    // Update any forms or hidden inputs within the product element
    const forms = productElement.querySelectorAll('form');
    forms.forEach(form => {
      let input = form.querySelector(`input[name="upgrade_${upgradeId}"]`);

      if (!input && upgradeValue) {
        // Create input if it doesn't exist and we have a value
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = `upgrade_${upgradeId}`;
        form.appendChild(input);
      }

      if (input) {
        if (upgradeValue) {
          input.value = upgradeValue;
        } else {
          // Remove input if value is empty
          input.remove();
        }
      }
    });

    // Update button data attributes
    const buttons = productElement.querySelectorAll('button[data-product-id]');
    buttons.forEach(button => {
      if (upgradeValue) {
        button.dataset[`upgrade_${upgradeId}`] = upgradeValue;
      } else {
        delete button.dataset[`upgrade_${upgradeId}`];
      }
    });
  }

  /**
   * Log debug messages
   * @param {...any} args - Arguments to log
   */
  log(...args) {
    if (this.config.debug) {
      console.log('[ProductUpgrades]', ...args);
    }
  }


}

// Export the class
export default ProductUpgrades;
