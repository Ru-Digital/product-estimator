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
          // Use the existing container - no need to create a new div
          // Render each product directly in the container
          products.forEach((product, index) => {
            this.renderProduct(product, index, roomId, estimateId, container);
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
      logger.log(errorMsg);
      return Promise.reject(new Error(errorMsg));
    }

    // Show loading if we have a modal available
    if (this.modalManager) {
      this.modalManager.showLoading();
    }

    // Convert the productId to string to ensure proper handling
    return this.dataService.addProductToRoom(roomId, productId, estimateId)
      .then(result => {
        // Check if the result is actually an error (primary conflict)
        if (result && !result.success && result.primaryConflict) {
          // This is a primary conflict error, throw it to the catch block
          throw result;
        }
        
        logger.log('Product added successfully:', result);

        // Invalidate the room cache for this estimate to ensure fresh data is loaded
        // This is crucial for updating the room's primary product image and name
        const cacheKey = `estimate_${estimateId}`;
        this.dataService.invalidateCache('rooms');
        logger.log(`Invalidated room cache for estimate ${estimateId}`);

        // Update totals only if we have valid data and the room is likely to be visible
        // TODO: Improve room totals updating to handle timing issues better
        if (this.modalManager && this.modalManager.roomManager && result && result.room_totals) {
          try {
            // Try to update totals but don't worry if it fails - view refresh will show correct values
            this.modalManager.roomManager.updateRoomTotals(estimateId, roomId, {
              total: result.room_totals.min_total || 0
            });
          } catch (e) {
            // Just log and continue - this is expected in some cases
            logger.log('Non-critical error updating room totals UI');
          }
        }

        // Update room includes to reflect the new product's includes
        if (this.modalManager && this.modalManager.roomManager) {
          try {
            this.modalManager.roomManager.updateRoomIncludes(estimateId, roomId);
          } catch (e) {
            logger.log('Non-critical error updating room includes UI');
          }
        }

        // Update similar products to include the new product's similar items
        if (this.modalManager && this.modalManager.roomManager) {
          try {
            this.modalManager.roomManager.initializeSimilarProductsForRoom(estimateId, roomId);
          } catch (e) {
            logger.log('Non-critical error updating similar products UI:', e);
          }
        }

        // Hide loading
        if (this.modalManager) {
          this.modalManager.hideLoading();
        }

        return result;
      })
      .catch(error => {
        // Handle duplicate product case (not an error, just a warning)
        if (error && error.data && error.data.duplicate) {
          // Hide loading indicator
          if (this.modalManager) {
            this.modalManager.hideLoading();
          }
          
          // Show warning dialog instead of error
          if (this.modalManager && this.modalManager.confirmationDialog) {
            this.modalManager.confirmationDialog.show({
              title: 'Product Already Exists',
              message: error.message || 'This product already exists in the selected room.',
              type: 'product',
              action: 'warning',
              showCancel: false,
              confirmText: 'OK'
            });
          }
          
          // Return a rejected promise with the error object
          // but don't log it as an error since it's expected behavior
          return Promise.reject(error);
        }
        
        // Handle primary category conflict case from LOCAL STORAGE
        if (error.primaryConflict === true) {
          // Hide loading indicator
          if (this.modalManager) {
            this.modalManager.hideLoading();
          }
          
          // Show confirmation dialog for primary category conflict
          if (this.modalManager && this.modalManager.confirmationDialog) {
            const roomName = this.modalManager.roomManager ? 
              this.modalManager.roomManager.getRoomName(error.estimateId, error.roomId) : 'selected room';
              
            this.modalManager.confirmationDialog.show({
              title: 'A flooring product already exists in the selected room',
              message: `The ${roomName} already contains "${error.existingProductName}". Would you like to replace it with "${error.newProductName}"?`,
              type: 'product',
              action: 'replace',
              confirmText: 'Replace the existing product',
              cancelText: 'Go back to room select',
              additionalButtons: [{
                text: 'Cancel',
                callback: () => {
                  // Simply close the dialog - no action needed
                }
              }],
              onConfirm: () => {
                // User chose to replace the existing product
                this.replaceProductInRoom(error.estimateId, error.roomId, error.existingProductId, error.newProductId);
              },
              onCancel: () => {
                // User chose to go back to room select
                if (this.modalManager) {
                  this.modalManager.roomManager.showRoomSelection(error.estimateId);
                }
              }
            });
          }
          
          // Return a rejected promise with the error object
          // but don't log it as an error since it's expected behavior
          return Promise.reject(error);
        }
        
        // Handle primary category conflict case from SERVER
        if (error && error.data && error.data.primary_conflict) {
          // Hide loading indicator
          if (this.modalManager) {
            this.modalManager.hideLoading();
          }
          
          // Show confirmation dialog for primary category conflict
          if (this.modalManager && this.modalManager.confirmationDialog) {
            this.modalManager.confirmationDialog.show({
              title: 'Primary Product Category Conflict',
              message: error.message || error.data.message,
              type: 'product',
              action: 'replace',
              confirmText: 'Replace existing product',
              cancelText: 'Back',
              additionalButtons: [{
                text: 'Cancel',
                callback: () => {
                  // Simply close the dialog - no action needed
                }
              }],
              onConfirm: () => {
                // User chose to replace the existing product
                const newProductId = error.data.new_product_id;
                const existingProductId = error.data.existing_product_id;
                const roomId = error.data.room_id;
                const estimateId = error.data.estimate_id;
                
                // Replace the product
                this.replaceProductInRoom(estimateId, roomId, existingProductId, newProductId);
              },
              onCancel: () => {
                // User chose to go back - we can optionally do something here
                // For now, just close the dialog
              }
            });
          }
          
          // Return a rejected promise with the error object
          return Promise.reject(error);
        }
        
        // Handle other errors
        logger.log('Error adding product to room:', error);

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
    const formattedPrice = format.currency(product.price || product.min_price_total || 0);

    // Create comprehensive template data with proper mapped field names
    const templateData = {
      // Data attributes for the product element
      id: product.id,
      product_id: product.id,
      product_index: index,
      room_id: roomId,
      estimate_id: estimateId,
      
      // Visual fields for display
      name: product.name || 'Product',
      price_title: product.name || 'Product',
      product_price: formattedPrice,
      price_dimensions: product.dimensions || '',
      image: product.image || 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
      sku: product.sku || '',
      description: product.description || '',
      
      // Include additional product data if available
      additional_notes: product.additional_notes || [],
    };

    logger.log('Product template data:', templateData);

    // Insert the product template directly into the container
    TemplateEngine.insert('product-item-template', templateData, container);

    // Get the product element that was just added
    const productElement = container.querySelector(`.product-item[data-product-id="${product.id}"]`);
    
    if (!productElement) {
      logger.error('Product element not found after insertion');
      return null;
    }

    // Double-check all required data attributes
    productElement.dataset.productId = product.id;
    productElement.dataset.productIndex = index;
    productElement.dataset.roomId = roomId;
    productElement.dataset.estimateId = estimateId;

    // Ensure product name and price are properly set
    const productNameElement = productElement.querySelector('.price-title');
    if (productNameElement) {
      productNameElement.textContent = product.name || 'Product';
    }

    const productPriceElement = productElement.querySelector('.product-price');
    if (productPriceElement) {
      productPriceElement.textContent = formattedPrice;
    }

    // Set product image if available
    const productImage = productElement.querySelector('.product-thumbnail');
    if (productImage && product.image) {
      productImage.src = product.image;
      productImage.alt = product.name || 'Product';
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

      // Add variations container to product element
      productElement.appendChild(variationsContainer);
    }

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
      // Make sure data attributes are set properly
      removeButton.dataset.estimateId = estimateId;
      removeButton.dataset.roomId = roomId;
      removeButton.dataset.productIndex = index;
      removeButton.dataset.productId = product.id;
      
      logger.log('Remove button data attributes set:', { 
        estimateId: removeButton.dataset.estimateId,
        roomId: removeButton.dataset.roomId,
        productIndex: removeButton.dataset.productIndex,
        productId: removeButton.dataset.productId
      });
      
      if (removeButton._clickHandler) {
        removeButton.removeEventListener('click', removeButton._clickHandler);
      }

      removeButton._clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Get the data attributes from the button element
        const buttonEstimateId = e.currentTarget.dataset.estimateId;
        const buttonRoomId = e.currentTarget.dataset.roomId;
        const buttonProductIndex = e.currentTarget.dataset.productIndex;
        const buttonProductId = e.currentTarget.dataset.productId;
        
        // Use the data from the button itself, falling back to the closure variables if needed
        const targetEstimateId = buttonEstimateId || estimateId;
        const targetRoomId = buttonRoomId || roomId;
        const targetProductIndex = buttonProductIndex || index;
        const targetProductId = buttonProductId || product.id;
        
        logger.log('Remove product clicked with data:', { 
          estimateId: targetEstimateId, 
          roomId: targetRoomId, 
          productIndex: targetProductIndex,
          productId: targetProductId
        });
        
        // Call handleProductRemoval with the data attributes from the button
        this.handleProductRemoval(targetEstimateId, targetRoomId, targetProductIndex, targetProductId);
      };

      removeButton.addEventListener('click', removeButton._clickHandler);
    } else {
      logger.log('Remove button not found in product element');
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

    // First, ensure we have a reference to the ModalManager
    if (!this.modalManager) {
      logger.error('ModalManager not available for product removal');
      return;
    }

    // If we don't have a confirmationDialog through ModalManager,
    // create one on demand to ensure we never use window.confirm()
    if (!this.modalManager.confirmationDialog) {
      logger.warn('ConfirmationDialog not available via ModalManager, creating one');

      // Dynamically import ConfirmationDialog to ensure it's available
      import('../ConfirmationDialog').then(module => {
        const ConfirmationDialog = module.default;
        this.modalManager.confirmationDialog = new ConfirmationDialog();

        // Now show the dialog with the newly created instance
        // Pass all parameters including productId
        this._showProductRemovalDialog(estimateId, roomId, productIndex, productId);
      }).catch(error => {
        logger.error('Error importing ConfirmationDialog:', error);
      });
      return;
    }

    // If we already have the confirmationDialog, use it directly
    // Make sure to pass the productId parameter
    this._showProductRemovalDialog(estimateId, roomId, productIndex, productId);
  }

  /**
   * Show the product removal confirmation dialog
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   * @param {number} productIndex - The product index in the room's products array
   * @param {string|number} productId - The product ID to remove
   * @private
   */
  _showProductRemovalDialog(estimateId, roomId, productIndex, productId) {
    // Log the parameters to ensure they're all present
    logger.log('Showing product removal dialog with params:', { estimateId, roomId, productIndex, productId });
    
    // Show the confirmation dialog using the dedicated component
    this.modalManager.confirmationDialog.show({
      // TODO: Implement labels from localization system
      title: 'Remove Product',
      message: 'Are you sure you want to remove this product from the room?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'product',
      action: 'delete',
      onConfirm: () => {
        // User confirmed, remove the product
        // Pass all parameters including productId
        this.performProductRemoval(estimateId, roomId, productIndex, productId);
      },
      onCancel: () => {
        // User cancelled, do nothing
        logger.log('Product removal cancelled by user');
      }
    });
  }

  /**
   * Perform the actual product removal operation
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   * @param {number} productIndex - The product index in the room's products array
   * @param {string|number} productId - The product ID to remove
   * @private
   */
  performProductRemoval(estimateId, roomId, productIndex, productId) {
    logger.log('Performing product removal', { estimateId, roomId, productIndex, productId });
    
    // Validate productId before proceeding
    if (!productId || productId === 'undefined') {
      const error = new Error(`Cannot remove product: Invalid product ID (${productId})`);
      logger.error(error);
      
      if (this.modalManager) {
        this.modalManager.hideLoading();
        if (this.modalManager.confirmationDialog) {
          this.modalManager.confirmationDialog.show({
            title: 'Error',
            message: 'Could not identify the product to remove.',
            type: 'product',
            action: 'error',
            showCancel: false,
            confirmText: 'OK'
          });
        }
      }
      return;
    }

    if (this.modalManager) {
      this.modalManager.showLoading();
    }

    // Now we pass both productIndex and productId to the removeProductFromRoom method
    // This allows the method to use productId as the primary identifier, with productIndex as fallback
    this.dataService.removeProductFromRoom(estimateId, roomId, productIndex, productId)
      .then(result => {
        logger.log('Product removed successfully:', result);

        // Find and remove the product element from the DOM using all available attributes
        // Using both productIndex and productId for more robust element selection
        const productElement = document.querySelector(
          `.product-item[data-product-id="${productId}"][data-room-id="${roomId}"][data-estimate-id="${estimateId}"], ` +
          `.product-item[data-product-index="${productIndex}"][data-room-id="${roomId}"][data-estimate-id="${estimateId}"]`
        );
        
        if (productElement) {
          productElement.remove();
          
          // Find the product list container for this room
          const productsContainer = document.querySelector(
            `.room-item[data-room-id="${roomId}"][data-estimate-id="${estimateId}"] .product-list, ` +
            `.accordion-item[data-room-id="${roomId}"][data-estimate-id="${estimateId}"] .product-list`
          );
          
          // Check if there are any products left in the container
          if (productsContainer) {
            const remainingProducts = productsContainer.querySelectorAll('.product-item');
            
            // If there are no remaining products, show the empty products template
            if (remainingProducts.length === 0) {
              logger.log('No products remaining in room, showing empty products template');
              // Clear any existing content
              productsContainer.innerHTML = '';
              // Insert the empty products template
              TemplateEngine.insert('products-empty-template', {}, productsContainer);
            }
          }
        } else {
          logger.log('Product element not found in DOM after removal. It may have been removed already.');
        }

        // Update room totals
        if (this.modalManager && this.modalManager.roomManager) {
          this.modalManager.roomManager.updateRoomTotals(estimateId, roomId, {
            total: result.roomTotal
          });
          
          // Update room primary product display
          // This will refresh the primary product image and name in the room header
          this.modalManager.roomManager.updateRoomPrimaryProduct(estimateId, roomId);
          
          // Update room includes to reflect the removed product's includes
          try {
            this.modalManager.roomManager.updateRoomIncludes(estimateId, roomId);
          } catch (e) {
            logger.log('Non-critical error updating room includes UI after product removal');
          }
          
          // Update similar products after product removal
          try {
            this.modalManager.roomManager.initializeSimilarProductsForRoom(estimateId, roomId);
          } catch (e) {
            logger.log('Non-critical error updating similar products UI after product removal:', e);
          }
        }

        // Hide loading
        if (this.modalManager) {
          this.modalManager.hideLoading();
        }
      })
      .catch(error => {
        logger.error('Error removing product:', error);

        // Hide loading
        if (this.modalManager) {
          this.modalManager.hideLoading();

          // Show error message using ConfirmationDialog
          if (this.modalManager.confirmationDialog) {
            this.modalManager.confirmationDialog.show({
              title: 'Error',
              message: 'Error removing product. Please try again.',
              type: 'product',
              action: 'error',
              showCancel: false,
              confirmText: 'OK'
            });
          } else {
            // Fallback to modalManager.showError
            this.modalManager.showError('Error removing product. Please try again.');
          }
        } else {
          logger.error('Error removing product. Please try again.');
        }
      });
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
          
          // Update room includes to reflect any changes from variation selection
          try {
            this.modalManager.roomManager.updateRoomIncludes(estimateId, roomId);
          } catch (e) {
            logger.log('Non-critical error updating room includes UI after variation change');
          }
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
   * Replace a product in a room with another product
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   * @param {string|number} oldProductId - The product ID to replace
   * @param {string|number} newProductId - The new product ID
   */
  replaceProductInRoom(estimateId, roomId, oldProductId, newProductId) {
    logger.log('Replacing product in room', { estimateId, roomId, oldProductId, newProductId });
    
    // Show loading
    if (this.modalManager) {
      this.modalManager.showLoading();
    }
    
    // Use dataService to replace the product
    this.dataService.replaceProductInRoom(estimateId, roomId, oldProductId, newProductId)
      .then(() => {
        logger.log('Product replaced successfully');
        
        // Hide loading
        if (this.modalManager) {
          this.modalManager.hideLoading();
        }
        
        // Navigate to the estimate list with the estimate and room expanded
        if (this.modalManager && this.modalManager.estimateManager) {
          // Show the estimates list with the specific estimate and room expanded
          this.modalManager.estimateManager.showEstimatesList(estimateId, roomId);
          
          // After product replacement, update similar products with a small delay
          // to ensure the view has fully rendered and room element is available
          setTimeout(() => {
            if (this.modalManager.roomManager) {
              // Reinitialize similar products for the room using localStorage data
              this.modalManager.roomManager.initializeSimilarProductsForRoom(estimateId, roomId);
            }
          }, 300);
          
          // Show success dialog after a brief delay to ensure the view has loaded
          setTimeout(() => {
            if (this.modalManager.confirmationDialog) {
              this.modalManager.confirmationDialog.show({
                title: 'Product Replaced Successfully',
                message: 'The product has been successfully replaced in your estimate.',
                type: 'success',
                action: 'success',
                showCancel: false,
                confirmText: 'OK'
              });
            }
          }, 200);
        } else {
          // Fallback: reload the products for this room if modalManager is not available
          const roomElement = document.querySelector(`.room-item[data-room-id="${roomId}"][data-estimate-id="${estimateId}"]`);
          if (roomElement) {
            const productsContainer = roomElement.querySelector('.room-products-container');
            if (productsContainer) {
              // Mark as not loaded to force reload
              delete productsContainer.dataset.loaded;
              this.loadProductsForRoom(estimateId, roomId, productsContainer);
            }
          }
        }
      })
      .catch(error => {
        logger.error('Error replacing product:', error);
        
        // Hide loading
        if (this.modalManager) {
          this.modalManager.hideLoading();
        }
        
        // Show error dialog
        if (this.modalManager && this.modalManager.confirmationDialog) {
          this.modalManager.confirmationDialog.show({
            title: 'Error',
            message: 'Error replacing product. Please try again.',
            type: 'product',
            action: 'error',
            showCancel: false,
            confirmText: 'OK'
          });
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

  /**
   * Handle product selection with variation checking
   * @param {string|number} productId - The product ID
   * @param {object} options - Options for handling the product selection
   * @param {string} options.action - The action to perform ('add' or 'replace')
   * @param {string} options.estimateId - The estimate ID
   * @param {string} options.roomId - The room ID
   * @param {string} [options.replaceProductId] - Product ID to replace (for replace action)
   * @param {object} [options.room] - Room data for pricing calculations
   * @param {HTMLElement} [options.button] - The button element for state management
   * @returns {Promise} - Promise that resolves when action is complete
   */
  handleProductVariationSelection(productId, options) {
    const {
      action,
      estimateId,
      roomId,
      replaceProductId,
      room,
      button
    } = options;

    logger.log(`Handling product variation selection for ${action}`, { productId, estimateId, roomId });

    // Store original button state if provided
    let originalButtonState = null;
    if (button) {
      originalButtonState = {
        text: button.textContent,
        disabled: button.disabled
      };
      button.disabled = true;
      button.innerHTML = '<span class="spinner"></span> Loading...';
      button.classList.add('loading');
    }

    // Fetch product data to check for variations - use the same method as add product flow
    return this.dataService.getProductVariationData(productId)
    .then(variationData => {
      // Check if product has variations
      if (variationData && variationData.isVariable && variationData.variations && variationData.variations.length > 0) {
        const productData = {
          id: productId,
          name: variationData.productName || 'Product',
          variations: variationData.variations,
          attributes: variationData.attributes
        };
        logger.log('Product has variations, showing selection dialog');
        
        // Reset button temporarily if provided
        if (button && originalButtonState) {
          button.innerHTML = originalButtonState.text;
          button.disabled = originalButtonState.disabled;
          button.classList.remove('loading');
        }
        
        // Show product selection dialog
        return new Promise((resolve, reject) => {
          if (this.modalManager.productSelectionDialog) {
            this.modalManager.productSelectionDialog.show({
              product: productData,
              variations: productData.variations,
              attributes: productData.attributes || {},
              action: action,
              onSelect: (selectedData) => {
                logger.log('Variation selected:', selectedData);
                
                const selectedVariationId = selectedData.variationId;
                
                if (!selectedVariationId) {
                  reject(new Error('No variation selected'));
                  return;
                }
                
                // Re-disable button if provided
                if (button) {
                  button.innerHTML = '<span class="spinner"></span> Loading...';
                  button.disabled = true;
                  button.classList.add('loading');
                }
                
                // Perform the action based on type
                if (action === 'add') {
                  resolve(this.addProductToRoom(estimateId, roomId, selectedVariationId));
                } else if (action === 'replace') {
                  resolve(this.replaceProductInRoom(estimateId, roomId, replaceProductId, selectedVariationId));
                } else {
                  reject(new Error(`Unknown action: ${action}`));
                }
              },
              onCancel: () => {
                logger.log('Variation selection cancelled');
                // Reset button if provided
                if (button && originalButtonState) {
                  button.innerHTML = originalButtonState.text;
                  button.disabled = originalButtonState.disabled;
                  button.classList.remove('loading');
                  button.dataset.processing = 'false';
                }
                reject(new Error('Variation selection cancelled'));
              }
            });
          } else {
            reject(new Error('Product selection dialog not available'));
          }
        });
      } else {
        // No variations, proceed directly with action
        logger.log('Product has no variations, proceeding directly');
        
        if (action === 'add') {
          return this.addProductToRoom(estimateId, roomId, productId);
        } else if (action === 'replace') {
          return this.replaceProductInRoom(estimateId, roomId, replaceProductId, productId);
        } else {
          throw new Error(`Unknown action: ${action}`);
        }
      }
    })
    .finally(() => {
      // Always reset button state at the end
      if (button && originalButtonState) {
        button.innerHTML = originalButtonState.text;
        button.disabled = originalButtonState.disabled;
        button.classList.remove('loading');
        if (button.dataset) {
          button.dataset.processing = 'false';
        }
      }
    });
  }
}

export default ProductManager;
