/**
 * ProductManager.js
 *
 * Handles all operations related to products:
 * - Rendering products in rooms
 * - Adding products to rooms
 * - Removing products from rooms
 * - Handling product variations
 */

import { format, createLogger } from '@utils';

import { loadEstimateData, saveEstimateData } from '../EstimateStorage';
import TemplateEngine from '../TemplateEngine';

const logger = createLogger('ProductManager');

class ProductManager {
  /**
   * Initialize the ProductManager
   * @param {object} config - Configuration options
   * @param {object} dataService - The data service instance
   * @param {object} modalManager - Reference to the parent modal manager
   */
  constructor(config = {}, dataService, modalManager) {
    this.config = config;
    this.dataService = dataService;
    this.modalManager = modalManager;
    
    // State
    this.currentRoomId = null;
    this.currentEstimateId = null;
    this.currentProductId = null;
    
    // Bind methods to preserve 'this' context
    this.loadProductsForRoom = this.loadProductsForRoom.bind(this);
    this.showProductSelection = this.showProductSelection.bind(this);
    this.addProductToRoom = this.addProductToRoom.bind(this);
    this.handleProductRemoval = this.handleProductRemoval.bind(this);
    this.renderProduct = this.renderProduct.bind(this);
    this.handleVariationSelection = this.handleVariationSelection.bind(this);
    this.onModalClosed = this.onModalClosed.bind(this);
  }
  
  /**
   * Initialize the product manager
   */
  init() {
    this.bindEvents();
    logger.log('ProductManager initialized');
  }
  
  /**
   * Bind event listeners related to products
   */
  bindEvents() {
    // We'll implement this later when we move the product-specific bindings
    logger.log('ProductManager events bound');
  }
  
  /**
   * Load products for a room
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   * @param {HTMLElement} container - The container to render products in
   * @returns {Promise} - Promise that resolves when products are loaded
   */
  loadProductsForRoom(estimateId, roomId, container) {
    logger.log('Loading products for room', { estimateId, roomId });
    
    if (!container) {
      return Promise.reject(new Error('Container not provided for loading products'));
    }
    
    // Show loading indicator
    const loadingPlaceholder = container.querySelector('.loading-placeholder');
    if (loadingPlaceholder) {
      loadingPlaceholder.style.display = 'block';
    }
    
    // Load products from storage or API
    return this.dataService.getProductsForRoom(estimateId, roomId)
      .then(products => {
        // Clear existing content (except the loading placeholder)
        if (loadingPlaceholder && loadingPlaceholder.parentNode === container) {
          container.innerHTML = '';
          container.appendChild(loadingPlaceholder);
        } else {
          container.innerHTML = '';
        }
        
        // Mark the container as loaded
        container.dataset.loaded = 'true';
        
        if (!products || products.length === 0) {
          // No products, show empty state
          container.innerHTML = `
            <div class="empty-state">
              <p>No products in this room yet.</p>
            </div>
          `;
        } else {
          // Create products container
          const productsContainer = document.createElement('div');
          productsContainer.className = 'room-products-list';
          container.appendChild(productsContainer);
          
          // Render each product
          products.forEach((product, index) => {
            this.renderProduct(product, index, roomId, estimateId, productsContainer);
          });
        }
        
        // Hide loading placeholder
        if (loadingPlaceholder) {
          loadingPlaceholder.style.display = 'none';
        }
        
        return products;
      })
      .catch(error => {
        logger.error('Error loading products for room:', error);
        
        // Show error message
        container.innerHTML = `
          <div class="error-state">
            <p>Error loading products. Please try again.</p>
          </div>
        `;
        
        throw error;
      });
  }
  
  /**
   * Show product selection interface
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   */
  showProductSelection(estimateId, roomId) {
    logger.log('Showing product selection', { estimateId, roomId });
    
    // Save the current room and estimate IDs
    this.currentRoomId = roomId;
    this.currentEstimateId = estimateId;
    
    // This will be implemented in a future phase, as we need a product search UI
    // For now, we'll just show a simple product selection prompt
    
    // Simple implementation for now - ask for a product ID
    const productId = prompt('Enter a product ID to add:');
    
    if (productId) {
      // Add the product to the room
      this.addProductToRoom(estimateId, roomId, productId)
        .then(() => {
          // Show success message
          alert('Product added successfully!');
          
          // Reload the products for this room
          const roomElement = document.querySelector(`.room-item[data-room-id="${roomId}"][data-estimate-id="${estimateId}"]`);
          if (roomElement) {
            const productsContainer = roomElement.querySelector('.room-products-container');
            if (productsContainer) {
              // Mark as not loaded to force reload
              delete productsContainer.dataset.loaded;
              this.loadProductsForRoom(estimateId, roomId, productsContainer);
            }
          }
        })
        .catch(error => {
          logger.error('Error adding product to room:', error);
          alert('Error adding product. Please try again.');
        });
    }
  }
  
  /**
   * Add a product to a room
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   * @param {string|number} productId - The product ID to add
   * @returns {Promise} - Promise that resolves when the product is added
   */
  addProductToRoom(estimateId, roomId, productId) {
    logger.log('Adding product to room', { estimateId, roomId, productId });
    
    // Show loading if we have a modal available
    if (this.modalManager) {
      this.modalManager.showLoading();
    }
    
    // Add the product to the room
    return this.dataService.addProductToRoom(estimateId, roomId, productId)
      .then(result => {
        logger.log('Product added successfully:', result);
        
        // Update room totals
        if (this.modalManager && this.modalManager.roomManager) {
          this.modalManager.roomManager.updateRoomTotals(estimateId, roomId, {
            total: result.roomTotal
          });
        }
        
        // Hide loading
        if (this.modalManager) {
          this.modalManager.hideLoading();
        }
        
        return result;
      })
      .catch(error => {
        logger.error('Error adding product to room:', error);
        
        // Hide loading
        if (this.modalManager) {
          this.modalManager.hideLoading();
        }
        
        throw error;
      });
  }
  
  /**
   * Render a product in a room
   * @param {object} product - The product data
   * @param {number} index - The product index in the room
   * @param {string} roomId - The room ID
   * @param {string} estimateId - The estimate ID
   * @param {HTMLElement} container - The container to render the product in
   * @returns {HTMLElement} - The product element
   */
  renderProduct(product, index, roomId, estimateId, container) {
    logger.log('Rendering product', { index, roomId, estimateId, product });
    
    if (!container) {
      logger.error('Container not provided for rendering product');
      return null;
    }
    
    // Create product element
    const productElement = document.createElement('div');
    productElement.className = 'product-item';
    productElement.dataset.productId = product.id;
    productElement.dataset.productIndex = index;
    productElement.dataset.roomId = roomId;
    productElement.dataset.estimateId = estimateId;
    
    // Get formatted price
    const formattedPrice = format.currency(product.price || 0);
    
    // Build product HTML
    productElement.innerHTML = `
      <div class="product-header">
        <div class="product-name-container">
          <h5 class="product-name">${product.name || 'Product'}</h5>
          <div class="product-meta">
            ${product.sku ? `<span class="product-sku">SKU: ${product.sku}</span>` : ''}
          </div>
        </div>
        <div class="product-price-container">
          <span class="product-price">${formattedPrice}</span>
        </div>
        <div class="product-actions">
          <button class="remove-product-button button button-small button-danger">Remove</button>
        </div>
      </div>
      ${product.description ? `
      <div class="product-description">
        <p>${product.description}</p>
      </div>
      ` : ''}
      ${product.variations && product.variations.length > 0 ? `
      <div class="product-variations">
        <label for="variation-${roomId}-${product.id}-${index}">Options:</label>
        <select id="variation-${roomId}-${product.id}-${index}" class="variation-select">
          <option value="">Select an option</option>
          ${product.variations.map(variation => 
            `<option value="${variation.id}" ${variation.id === product.selectedVariation ? 'selected' : ''}>
              ${variation.name} (${format.currency(variation.price || 0)})
            </option>`
          ).join('')}
        </select>
      </div>
      ` : ''}
    `;
    
    // Add to container
    container.appendChild(productElement);
    
    // Bind events
    this.bindProductEvents(productElement, product, index, roomId, estimateId);
    
    return productElement;
  }
  
  /**
   * Bind events to a product element
   * @param {HTMLElement} productElement - The product element
   * @param {object} product - The product data
   * @param {number} index - The product index
   * @param {string} roomId - The room ID
   * @param {string} estimateId - The estimate ID
   */
  bindProductEvents(productElement, product, index, roomId, estimateId) {
    logger.log('Binding events to product element', { index, roomId, estimateId });
    
    if (!productElement) {
      logger.error('Product element not available for binding events');
      return;
    }
    
    // Bind remove button
    const removeButton = productElement.querySelector('.remove-product-button');
    if (removeButton) {
      if (removeButton._clickHandler) {
        removeButton.removeEventListener('click', removeButton._clickHandler);
      }
      
      removeButton._clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleProductRemoval(estimateId, roomId, index, product.id);
      };
      
      removeButton.addEventListener('click', removeButton._clickHandler);
    }
    
    // Bind variation select
    const variationSelect = productElement.querySelector('.variation-select');
    if (variationSelect) {
      if (variationSelect._changeHandler) {
        variationSelect.removeEventListener('change', variationSelect._changeHandler);
      }
      
      variationSelect._changeHandler = (e) => {
        const variationId = e.target.value;
        this.handleVariationSelection(variationId, productElement, estimateId, roomId, index, product.id);
      };
      
      variationSelect.addEventListener('change', variationSelect._changeHandler);
    }
  }
  
  /**
   * Handle product removal
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   * @param {number} productIndex - The product index in the room's products array
   * @param {string|number} productId - The product ID
   */
  handleProductRemoval(estimateId, roomId, productIndex, productId) {
    logger.log('Handling product removal', { estimateId, roomId, productIndex, productId });
    
    // Show a confirmation dialog
    if (window.productEstimator && window.productEstimator.dialog) {
      window.productEstimator.dialog.confirm(
        'Remove Product',
        'Are you sure you want to remove this product from the room?',
        () => {
          // User confirmed, remove the product
          if (this.modalManager) {
            this.modalManager.showLoading();
          }
          
          this.dataService.removeProductFromRoom(estimateId, roomId, productIndex)
            .then(result => {
              logger.log('Product removed successfully:', result);
              
              // Find and remove the product element from the DOM
              const productElement = document.querySelector(`.product-item[data-product-index="${productIndex}"][data-room-id="${roomId}"][data-estimate-id="${estimateId}"]`);
              if (productElement) {
                productElement.remove();
              }
              
              // Update room totals
              if (this.modalManager && this.modalManager.roomManager) {
                this.modalManager.roomManager.updateRoomTotals(estimateId, roomId, {
                  total: result.roomTotal
                });
              }
              
              // Hide loading
              if (this.modalManager) {
                this.modalManager.hideLoading();
              }
            })
            .catch(error => {
              logger.error('Error removing product:', error);
              
              if (this.modalManager) {
                this.modalManager.showError('Error removing product. Please try again.');
                this.modalManager.hideLoading();
              } else {
                alert('Error removing product. Please try again.');
              }
            });
        },
        () => {
          // User cancelled, do nothing
          logger.log('Product removal cancelled by user');
        }
      );
    } else {
      // No dialog service available, use native confirm
      if (confirm('Are you sure you want to remove this product from the room?')) {
        // User confirmed, remove the product
        if (this.modalManager) {
          this.modalManager.showLoading();
        }
        
        this.dataService.removeProductFromRoom(estimateId, roomId, productIndex)
          .then(result => {
            logger.log('Product removed successfully:', result);
            
            // Find and remove the product element from the DOM
            const productElement = document.querySelector(`.product-item[data-product-index="${productIndex}"][data-room-id="${roomId}"][data-estimate-id="${estimateId}"]`);
            if (productElement) {
              productElement.remove();
            }
            
            // Update room totals
            if (this.modalManager && this.modalManager.roomManager) {
              this.modalManager.roomManager.updateRoomTotals(estimateId, roomId, {
                total: result.roomTotal
              });
            }
            
            // Hide loading
            if (this.modalManager) {
              this.modalManager.hideLoading();
            }
          })
          .catch(error => {
            logger.error('Error removing product:', error);
            
            if (this.modalManager) {
              this.modalManager.showError('Error removing product. Please try again.');
              this.modalManager.hideLoading();
            } else {
              alert('Error removing product. Please try again.');
            }
          });
      }
    }
  }
  
  /**
   * Handle variation selection for a product
   * @param {string} variationId - The selected variation ID
   * @param {HTMLElement} productElement - The product element
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   * @param {number} productIndex - The product index
   * @param {string|number} productId - The product ID
   */
  handleVariationSelection(variationId, productElement, estimateId, roomId, productIndex, productId) {
    logger.log('Handling variation selection', { variationId, estimateId, roomId, productIndex, productId });
    
    if (!productElement) {
      logger.error('Product element not provided for variation selection');
      return;
    }
    
    // Show loading if we have a modal available
    if (this.modalManager) {
      this.modalManager.showLoading();
    }
    
    // Update the selected variation in the dataService
    this.dataService.updateProductVariation(estimateId, roomId, productIndex, variationId)
      .then(result => {
        logger.log('Variation updated successfully:', result);
        
        // Update the price display
        const priceElement = productElement.querySelector('.product-price');
        if (priceElement && result.updatedProduct) {
          priceElement.textContent = format.currency(result.updatedProduct.price || 0);
        }
        
        // Update room totals
        if (this.modalManager && this.modalManager.roomManager) {
          this.modalManager.roomManager.updateRoomTotals(estimateId, roomId, {
            total: result.roomTotal
          });
        }
        
        // Hide loading
        if (this.modalManager) {
          this.modalManager.hideLoading();
        }
      })
      .catch(error => {
        logger.error('Error updating variation:', error);
        
        // Reset the select back to the original value
        const variationSelect = productElement.querySelector('.variation-select');
        if (variationSelect) {
          // Find the current selected variation from the product
          this.dataService.getProductsForRoom(estimateId, roomId)
            .then(products => {
              const product = products[productIndex];
              if (product && product.selectedVariation) {
                variationSelect.value = product.selectedVariation;
              } else {
                variationSelect.value = '';
              }
            })
            .catch(() => {
              variationSelect.value = '';
            });
        }
        
        // Show error
        if (this.modalManager) {
          this.modalManager.showError('Error updating variation. Please try again.');
          this.modalManager.hideLoading();
        } else {
          alert('Error updating variation. Please try again.');
        }
      });
  }
  
  /**
   * Called when the modal is closed
   */
  onModalClosed() {
    logger.log('ProductManager: Modal closed');
    // Clean up any resources or state as needed
    this.currentRoomId = null;
    this.currentEstimateId = null;
    this.currentProductId = null;
  }
}

export default ProductManager;