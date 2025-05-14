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
          // No products, show empty state using template
          TemplateEngine.insert('products-empty-template', {}, container);
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
        
        // Show error message using template
        TemplateEngine.insert('product-error-template', {}, container);
        
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
          // Show success message using ConfirmationDialog instead of alert
          if (this.modalManager) {
            const confirmationDialog = this.modalManager.confirmationDialog;
            if (confirmationDialog) {
              confirmationDialog.show({
                title: 'Success',
                message: 'Product added successfully!',
                type: 'product',
                action: 'add',
                showCancel: false,
                confirmText: 'OK'
              });
            } else {
              logger.warn('ConfirmationDialog not available, using console log instead');
              logger.log('Product added successfully!');
            }
          }
          
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
          
          // Show error using ConfirmationDialog instead of alert
          if (this.modalManager) {
            const confirmationDialog = this.modalManager.confirmationDialog;
            if (confirmationDialog) {
              confirmationDialog.show({
                title: 'Error',
                message: 'Error adding product. Please try again.',
                type: 'product',
                action: 'error',
                showCancel: false,
                confirmText: 'OK'
              });
            } else {
              logger.warn('ConfirmationDialog not available, using console log instead');
              logger.error('Error adding product. Please try again.');
            }
          }
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
    
    // Validate that we have a product ID
    if (!productId) {
      const errorMsg = 'Product ID is required to add a product to a room';
      logger.error(errorMsg);
      return Promise.reject(new Error(errorMsg));
    }
    
    // Show loading if we have a modal available
    if (this.modalManager) {
      this.modalManager.showLoading();
    }
    
    // Convert the productId to string to ensure proper handling
    const productIdString = String(productId);
    
    // Add the product to the room
    return this.dataService.addProductToRoom(estimateId, roomId, productIdString)
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
    
    // Get formatted price
    const formattedPrice = format.currency(product.price || 0);
    
    // Create template data
    const templateData = {
      productId: product.id,
      productIndex: index,
      roomId: roomId,
      estimateId: estimateId,
      productName: product.name || 'Product',
      productPrice: formattedPrice,
      productSku: product.sku || '',
      productDescription: product.description || ''
    };
    
    // Insert the template into a temporary container to get the element
    const tempContainer = document.createElement('div');
    TemplateEngine.insert('product-item-template', templateData, tempContainer);
    
    // Get the product element from the temporary container
    const productElement = tempContainer.firstElementChild;
    
    // Set additional data attributes
    productElement.dataset.productId = product.id;
    productElement.dataset.productIndex = index;
    productElement.dataset.roomId = roomId;
    productElement.dataset.estimateId = estimateId;
    
    // Set product name
    const productNameElement = productElement.querySelector('.price-title');
    if (productNameElement) {
      productNameElement.textContent = templateData.productName;
    }
    
    // Set product price
    const productPriceElement = productElement.querySelector('.product-price');
    if (productPriceElement) {
      productPriceElement.textContent = templateData.productPrice;
    }
    
    // Add variations if needed
    if (product.variations && product.variations.length > 0) {
      // Create variations container
      const variationsContainer = document.createElement('div');
      variationsContainer.className = 'product-variations';
      
      // Create label
      const label = document.createElement('label');
      label.setAttribute('for', `variation-${roomId}-${product.id}-${index}`);
      label.textContent = 'Options:';
      variationsContainer.appendChild(label);
      
      // Create select
      const select = document.createElement('select');
      select.id = `variation-${roomId}-${product.id}-${index}`;
      select.className = 'variation-select';
      
      // Add default option
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Select an option';
      select.appendChild(defaultOption);
      
      // Add variation options
      product.variations.forEach(variation => {
        const option = document.createElement('option');
        option.value = variation.id;
        option.textContent = `${variation.name} (${format.currency(variation.price || 0)})`;
        
        if (variation.id === product.selectedVariation) {
          option.selected = true;
        }
        
        select.appendChild(option);
      });
      
      variationsContainer.appendChild(select);
      
      // Add variations container to product element (after product includes)
      const includesContainer = productElement.querySelector('.includes-container');
      if (includesContainer) {
        productElement.insertBefore(variationsContainer, includesContainer.nextSibling);
      } else {
        productElement.appendChild(variationsContainer);
      }
    }
    
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
    
    // Bind remove button - use the template's .remove-product class
    const removeButton = productElement.querySelector('.remove-product');
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
                this.modalManager.hideLoading();
                const confirmationDialog = this.modalManager.confirmationDialog;
                if (confirmationDialog) {
                  confirmationDialog.show({
                    title: 'Error',
                    message: 'Error removing product. Please try again.',
                    type: 'product',
                    action: 'error',
                    showCancel: false,
                    confirmText: 'OK'
                  });
                } else {
                  this.modalManager.showError('Error removing product. Please try again.');
                }
              } else {
                logger.error('Error removing product. Please try again.');
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
          this.modalManager.hideLoading();
          const confirmationDialog = this.modalManager.confirmationDialog;
          if (confirmationDialog) {
            confirmationDialog.show({
              title: 'Error',
              message: 'Error updating variation. Please try again.',
              type: 'product',
              action: 'error',
              showCancel: false,
              confirmText: 'OK'
            });
          } else {
            this.modalManager.showError('Error updating variation. Please try again.');
          }
        } else {
          logger.error('Error updating variation. Please try again.');
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