/**
 * RoomManager.js
 *
 * Handles all operations related to rooms:
 * - Rendering rooms in estimates
 * - Creating new rooms
 * - Removing rooms
 * - Updating room totals
 */

import { format, createLogger } from '@utils';

import { loadEstimateData, saveEstimateData, addRoom, removeRoom } from '../EstimateStorage';
import TemplateEngine from '../TemplateEngine';

const logger = createLogger('RoomManager');

class RoomManager {
  /**
   * Initialize the RoomManager
   * @param {object} config - Configuration options
   * @param {object} dataService - The data service instance
   * @param {object} modalManager - Reference to the parent modal manager
   */
  constructor(config = {}, dataService, modalManager) {
    this.config = config;
    this.dataService = dataService;
    this.modalManager = modalManager;

    // References to DOM elements (can be accessed via modalManager)
    this.newRoomForm = null;
    this.roomSelectionForm = null;

    // State
    this.currentEstimateId = null;
    this.currentProductId = null;

    // Bind methods to preserve 'this' context
    this.showRoomSelectionForm = this.showRoomSelectionForm.bind(this);
    this.loadRoomsForEstimate = this.loadRoomsForEstimate.bind(this);
    this.showNewRoomForm = this.showNewRoomForm.bind(this);
    this.bindNewRoomFormEvents = this.bindNewRoomFormEvents.bind(this);
    this.handleRoomRemoval = this.handleRoomRemoval.bind(this);
    this.updateRoomTotals = this.updateRoomTotals.bind(this);
    this.renderRoom = this.renderRoom.bind(this);
    this.onModalClosed = this.onModalClosed.bind(this);
    this.initializeSimilarProductsForRoom = this.initializeSimilarProductsForRoom.bind(this);
    this.loadSimilarProductsForRoom = this.loadSimilarProductsForRoom.bind(this);
    this.bindIncludesToggle = this.bindIncludesToggle.bind(this);
    this.bindSimilarProductsToggle = this.bindSimilarProductsToggle.bind(this);
  }

  /**
   * Initialize the room manager
   */
  init() {
    // Get references to DOM elements from the modal manager
    this.newRoomForm = this.modalManager.newRoomForm;
    this.roomSelectionForm = this.modalManager.roomSelectionForm;

    this.bindEvents();

    logger.log('RoomManager initialized');
  }

  /**
   * Bind event listeners related to rooms
   */
  bindEvents() {
    // We'll implement this later when we move the room-specific bindings
    logger.log('RoomManager events bound');
  }

  /**
   * Get the name of a room
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   * @returns {string} The room name or a default value
   */
  getRoomName(estimateId, roomId) {
    const estimateData = loadEstimateData();
    if (estimateData && estimateData.estimates) {
      const estimate = estimateData.estimates[estimateId];
      if (estimate && estimate.rooms && estimate.rooms[roomId]) {
        return estimate.rooms[roomId].name || `Room #${roomId}`;
      }
    }
    return 'selected room';
  }

  /**
   * Show the room selection form
   * @param {string} estimateId - The estimate ID
   * @param {string|null} productId - Optional product ID to add
   */
  showRoomSelectionForm(estimateId, productId = null) {
    logger.log('Showing room selection form', { estimateId, productId });

    // Save the current estimate and product IDs
    this.currentEstimateId = estimateId;
    this.currentProductId = productId;

    // Get the room selection form container from the modal manager
    const roomSelectionForm = this.modalManager.roomSelectionForm;

    if (!roomSelectionForm) {
      logger.error('Room selection form container not found in modal');
      this.modalManager.showError('Modal structure incomplete. Please contact support.');
      this.modalManager.hideLoading();
      return;
    }

    // Hide all other sections first to ensure only the room selection form is visible
    if (this.modalManager.estimateManager && this.modalManager.estimateManager.hideAllSections) {
      this.modalManager.estimateManager.hideAllSections();
    }

    // Use ModalManager's utility to ensure the element is visible
    this.modalManager.forceElementVisibility(roomSelectionForm);

    // Show loading indicator while we prepare the form
    this.modalManager.showLoading();

    // Fetch the estimate details to get the estimate name
    this.dataService.getEstimate(estimateId)
      .then(estimate => {
        if (!estimate) {
          throw new Error(`Estimate with ID ${estimateId} not found`);
        }

        // Check if the estimate has any rooms
        const hasRooms = estimate.rooms && Object.keys(estimate.rooms).length > 0;

        // If the estimate has no rooms, show the new room form directly
        if (!hasRooms) {
          logger.log('Estimate has no rooms, showing new room form directly');
          this.modalManager.hideLoading();
          this.showNewRoomForm(estimateId, productId);
          return;
        }

        // Use TemplateEngine to insert the template
        try {
          // Clear existing content first in case it was loaded before
          roomSelectionForm.innerHTML = '';

          // Insert the template with the estimate name
          TemplateEngine.insert('room-selection-form-template', {
            estimateName: estimate.name || `Estimate #${estimate.id}`
          }, roomSelectionForm);

          logger.log('Room selection form template inserted into wrapper.');

          // Find the form element
          const formElement = roomSelectionForm.querySelector('form');
          if (formElement) {
            // Store estimate ID and product ID as data attributes on the form
            formElement.dataset.estimateId = estimateId;

            if (productId) {
              formElement.dataset.productId = productId;
            } else {
              delete formElement.dataset.productId;
            }

            // Load the rooms for this estimate
            this.loadRoomsForSelection(estimateId, formElement)
              .then(() => {
                // Bind events to the form
                this.bindRoomSelectionFormEvents(formElement, estimateId, productId);
                this.modalManager.hideLoading();
              })
              .catch(error => {
                logger.error('Error loading rooms for selection:', error);
                this.modalManager.showError('Error loading rooms. Please try again.');
                this.modalManager.hideLoading();
              });
          } else {
            logger.error('Form element not found inside the template after insertion!');
            this.modalManager.showError('Error rendering form template. Please try again.');
            this.modalManager.hideLoading();
          }
        } catch (error) {
          logger.error('Error inserting room selection form template:', error);
          this.modalManager.showError('Error loading form template. Please try again.');
          this.modalManager.hideLoading();
        }
      })
      .catch(error => {
        logger.error('Error fetching estimate details:', error);
        this.modalManager.showError('Error loading estimate details. Please try again.');
        this.modalManager.hideLoading();
      });
  }

  /**
   * Load rooms for selection form
   * @param {string} estimateId - The estimate ID
   * @param {HTMLFormElement} formElement - The form element
   * @returns {Promise} - Promise that resolves when rooms are loaded
   */
  loadRoomsForSelection(estimateId, formElement) {
    logger.log('Loading rooms for selection form', { estimateId });

    const selectElement = formElement.querySelector('select');
    if (!selectElement) {
      return Promise.reject(new Error('Select element not found in form'));
    }

    // Load rooms from storage or API
    return this.dataService.getRoomsForEstimate(estimateId)
      .then(response => {
        // Extract the rooms array from the response
        // The response is an object with { has_rooms: boolean, rooms: Array }
        const hasRooms = response && response.has_rooms ? response.has_rooms : false;
        const roomsArray = response && response.rooms ? response.rooms : [];

        logger.log('Got rooms for selection, has_rooms:', hasRooms, 'count:', roomsArray.length);

        // Clear existing options
        selectElement.innerHTML = '';

        // Add default option using template
        TemplateEngine.insert('select-option-template', {
          value: '',
          text: '-- Select a room --'
        }, selectElement);

        // Add options for each room
        if (hasRooms && roomsArray.length > 0) {
          roomsArray.forEach(room => {
            // Use template for each option
            TemplateEngine.insert('select-option-template', {
              value: room.id,
              text: room.name || `Room #${room.id}`
            }, selectElement);
          });

          // Enable the select element and form buttons
          selectElement.disabled = false;
          const submitButton = formElement.querySelector('button[type="submit"]');
          if (submitButton) submitButton.disabled = false;
        } else {
          // No rooms available, show message using template
          TemplateEngine.insert('select-option-template', {
            value: '',
            text: 'No rooms available'
          }, selectElement);

          // Disable the select element but keep buttons enabled for "Create New Room"
          selectElement.disabled = true;
        }

        return roomsArray;
      });
  }

  /**
   * Bind events to the room selection form
   * @param {HTMLFormElement} formElement - The form element
   * @param {string} estimateId - The estimate ID
   * @param {string|null} productId - Optional product ID
   */
  bindRoomSelectionFormEvents(formElement, estimateId, productId = null) {
    logger.log('Binding events to room selection form', { estimateId, productId });

    if (!formElement) {
      logger.error('Form element not available for binding events');
      return;
    }

    // Remove any existing event listeners to prevent duplicates
    if (formElement._submitHandler) {
      formElement.removeEventListener('submit', formElement._submitHandler);
    }

    // Create new submit handler
    formElement._submitHandler = (e) => {
      e.preventDefault();

      // Show loading indicator
      this.modalManager.showLoading();

      // Get the selected room ID
      const selectElement = formElement.querySelector('select');
      const roomId = selectElement.value;

      if (!roomId) {
        this.modalManager.showError('Please select a room or create a new one.');
        this.modalManager.hideLoading();
        return;
      }

      // If a product ID is provided, add it to the room
      if (productId) {
        // Delegate to the ProductManager to add product to the selected room
        if (this.modalManager.productManager) {
          this.modalManager.productManager.addProductToRoom(estimateId, roomId, productId)
            .then(() => {
              // Hide loading
              this.modalManager.hideLoading();

              // First show the estimates list with the relevant room expanded
              if (this.modalManager.estimateManager) {
                this.modalManager.estimateManager.showEstimatesList(estimateId, roomId);
              }

              // Then show a confirmation dialog using ConfirmationDialog
              if (this.modalManager && this.modalManager.confirmationDialog) {
                setTimeout(() => {
                  this.modalManager.confirmationDialog.show({
                    title: 'Product Added',
                    message: 'The product has been added to the selected room.',
                    type: 'product',
                    action: 'success',
                    showCancel: false,
                    confirmText: 'OK'
                  });
                }, 100); // Short delay to allow estimates list to render
              } else {
                logger.log('Product has been added to the selected room.');
              }
            })
            .catch(error => {
              // If it's a duplicate product error, the dialog is already shown by ProductManager
              // and we don't need to do anything else here
              if (error && error.data && error.data.duplicate) {
                return; // Dialog already shown, just return
              }

              // Handle other errors
              logger.log('Error adding product to room:', error);
              this.modalManager.showError('Error adding product to room. Please try again.');
              this.modalManager.hideLoading();
            });
        } else {
          logger.error('ProductManager not available for addProductToRoom');
          this.modalManager.hideLoading();
        }
      } else {
        // No product ID, just close the form or navigate to room details
        this.modalManager.hideLoading();

        // Switch view to show the estimate with the selected room expanded
        if (this.modalManager.estimateManager) {
          this.modalManager.estimateManager.showEstimatesList(estimateId, roomId);
        } else {
          this.modalManager.closeModal();
        }
      }
    };

    // Add the submit handler
    formElement.addEventListener('submit', formElement._submitHandler);

    // Add event handler for "Add New Room" button
    // The template uses ID "add-new-room-from-selection" and class "add-room"
    const newRoomButton = formElement.querySelector('#add-new-room-from-selection, .add-room');
    if (newRoomButton) {
      if (newRoomButton._clickHandler) {
        newRoomButton.removeEventListener('click', newRoomButton._clickHandler);
      }

      newRoomButton._clickHandler = (e) => {
        e.preventDefault();
        logger.log('Add New Room button clicked');
        this.showNewRoomForm(estimateId, productId);
      };

      newRoomButton.addEventListener('click', newRoomButton._clickHandler);
      logger.log('Add New Room button handler attached');
    } else {
      logger.log('Add New Room button not found in form');
    }

    // Add event handler for cancel/back buttons (either one may be present)
    // The template uses classes "cancel-btn" and "back-btn" together
    const cancelButton = formElement.querySelector('.cancel-btn, .back-btn, .cancel-button');
    if (cancelButton) {
      if (cancelButton._clickHandler) {
        cancelButton.removeEventListener('click', cancelButton._clickHandler);
      }

      cancelButton._clickHandler = (e) => {
        e.preventDefault();
        logger.log('Cancel/Back button clicked');

        // Go back to estimate selection or close the modal
        if (productId && this.modalManager.estimateManager) {
          this.modalManager.estimateManager.showEstimateSelection(productId);
        } else {
          this.modalManager.closeModal();
        }
      };

      cancelButton.addEventListener('click', cancelButton._clickHandler);
      logger.log('Cancel/Back button handler attached');
    } else {
      logger.log('Cancel/Back button not found in form');
    }

    // Check for a separate back button if it exists distinctly
    const backButton = formElement.querySelector('.back-button:not(.cancel-btn)');
    if (backButton && backButton !== cancelButton) {
      if (backButton._clickHandler) {
        backButton.removeEventListener('click', backButton._clickHandler);
      }

      backButton._clickHandler = (e) => {
        e.preventDefault();
        logger.log('Separate back button clicked');

        // Go back to estimate selection
        if (this.modalManager.estimateManager) {
          this.modalManager.estimateManager.showEstimateSelection(productId);
        } else {
          this.modalManager.closeModal();
        }
      };

      backButton.addEventListener('click', backButton._clickHandler);
    }
  }

  /**
   * Load and display rooms for an estimate in the estimates list view
   * @param {string} estimateId - The estimate ID
   * @param {HTMLElement} container - The container to render rooms in
   * @param {string|null} expandRoomId - Optional room ID to expand
   * @param {boolean} bypassCache - Whether to bypass the cache when loading rooms
   * @returns {Promise} - Promise that resolves when rooms are loaded
   */
  loadRoomsForEstimate(estimateId, container, expandRoomId = null, bypassCache = false) {
    logger.log('Loading rooms for estimate', { estimateId, expandRoomId, bypassCache });

    if (!container) {
      return Promise.reject(new Error('Container not provided for loading rooms'));
    }

    // Show loading indicator
    const loadingPlaceholder = container.querySelector('.loading-placeholder');
    if (loadingPlaceholder) {
      loadingPlaceholder.style.display = 'block';
    }

    // Create rooms container if it doesn't exist
    let roomsContainer = container.querySelector('.estimate-rooms-container');
    if (!roomsContainer) {
      // Use TemplateEngine to create the rooms container
      TemplateEngine.insert('rooms-container-template', {}, container);
      roomsContainer = container.querySelector('.estimate-rooms-container');
    }

    // Load rooms from storage or API
    return this.dataService.getRoomsForEstimate(estimateId, bypassCache)
      .then(response => {
        // Clear existing content
        roomsContainer.innerHTML = '';

        // Check if response has rooms array and if it's empty
        // DataService.getRoomsForEstimate returns { has_rooms: boolean, rooms: Array }
        const roomsArray = response && response.rooms ? response.rooms : [];
        const hasRooms = response && response.has_rooms ? response.has_rooms : false;

        if (!hasRooms || roomsArray.length === 0) {
          // No rooms, show empty state using template
          logger.log(`No rooms found for estimate ${estimateId}, showing empty template`);
          TemplateEngine.insert('rooms-empty-template', {}, roomsContainer);
        } else {
          // Render each room
          const roomPromises = roomsArray.map(room => {
            // Check if this room should be expanded
            const shouldExpand = expandRoomId === room.id;

            // Render the room
            return this.renderRoom(room, room.id, estimateId, roomsContainer, shouldExpand);
          });

          return Promise.all(roomPromises);
        }

        // Hide loading placeholder
        if (loadingPlaceholder) {
          loadingPlaceholder.style.display = 'none';
        }

        return response;
      })
      .catch(error => {
        logger.error('Error loading rooms for estimate:', error);

        // Show error message using template
        TemplateEngine.insert('room-error-template', {}, roomsContainer);

        // Hide loading placeholder
        if (loadingPlaceholder) {
          loadingPlaceholder.style.display = 'none';
        }

        throw error;
      });
  }

  /**
   * Aggregate all product includes from all products in a room
   * @param {object} room - The room data
   * @returns {object} - Object containing aggregated product includes and section info
   */
  aggregateProductIncludes(room) {
    const includesMap = new Map(); // To track unique includes by product ID
    let sectionInfo = null;

    // Handle null or undefined room
    if (!room) {
      logger.warn('aggregateProductIncludes called with null/undefined room');
      return {
        includes: [],
        sectionInfo: null
      };
    }

    if (room.products) {
      Object.values(room.products).forEach(product => {
        // First, add the product itself to the includes
        const productId = product.id || product.product_id;
        if (productId && !includesMap.has(productId)) {
          includesMap.set(productId, {
            id: productId,
            product_id: productId,
            name: product.name || 'Product',
            price: product.min_price_total || product.max_price_total || product.price || 0,
            image: product.image || '',
            sku: product.sku || '',
            is_primary: true // Mark primary products
          });
        }
        
        // Then add any additional products
        if (product.additional_products) {
          // Handle both array and object formats
          const additionalProducts = Array.isArray(product.additional_products)
            ? product.additional_products
            : Object.values(product.additional_products);
            
          additionalProducts.forEach(include => {
            const additionalProductId = include.id || include.product_id;
            if (additionalProductId && !includesMap.has(additionalProductId)) {
              // Get the correct price - check for selected variation
              let price = include.price || include.total || 0;
              if (include.selected_option && include.variations && include.variations[include.selected_option]) {
                const selectedVariation = include.variations[include.selected_option];
                price = selectedVariation.min_price_total || selectedVariation.max_price_total || 0;
              }
              
              includesMap.set(additionalProductId, {
                id: additionalProductId,
                product_id: additionalProductId,
                name: include.name || include.product_name || 'Product',
                price: price,
                image: include.image || '',
                sku: include.sku || '',
                selected_option: include.selected_option,
                variations: include.variations,
                is_additional: true // Mark additional products
              });
            }
          });
        }
        
        // Check for additional_products_section info
        if (product.additional_products_section && !sectionInfo) {
          sectionInfo = product.additional_products_section;
        }
      });
    }

    // Convert map values to array
    return {
      includes: Array.from(includesMap.values()),
      sectionInfo: sectionInfo
    };
  }

  /**
   * Render a single room in the estimate
   * @param {object} room - The room data
   * @param {string} roomId - The room ID
   * @param {string} estimateId - The estimate ID
   * @param {HTMLElement} container - The container to render the room in
   * @param {boolean} expand - Whether to expand the room
   * @returns {Promise} - Promise that resolves when the room is rendered
   */
  renderRoom(room, roomId, estimateId, container, expand = false) {
    logger.log('Rendering room', { roomId, estimateId, expand });

    if (!container) {
      return Promise.reject(new Error('Container not provided for rendering room'));
    }

    // Get primary category product for the room
    let primaryProductImage = null;
    let primaryProductName = null;

    logger.log('Looking for primary product in room:', {
      roomName: room.name,
      primaryCategoryProductId: room.primary_category_product_id,
      productsObject: room.products,
      productsKeys: room.products ? Object.keys(room.products) : [],
      roomStructure: room
    });

    if (room.primary_category_product_id && room.products) {
      const primaryProduct = room.products[room.primary_category_product_id];
      if (primaryProduct) {
        primaryProductImage = primaryProduct.image || null;
        primaryProductName = primaryProduct.name || null;
        logger.log('Primary product found:', {
          productId: room.primary_category_product_id,
          image: primaryProductImage,
          name: primaryProductName,
          productData: primaryProduct
        });
      } else {
        logger.log('Primary product not found in products object:', {
          searchedId: room.primary_category_product_id,
          availableIds: Object.keys(room.products),
          productsStructure: room.products
        });
      }
    } else {
      logger.log('Cannot find primary product:', {
        primaryId: room.primary_category_product_id,
        hasProducts: !!room.products,
        roomData: room
      });
    }

    // Create room element using TemplateEngine with complete template data
    const templateData = {
      id: roomId,                // For direct data attribute setting
      room_id: roomId,          // For direct data attribute setting
      estimate_id: estimateId,  // For direct data attribute setting
      roomId: roomId,           // For backward compatibility
      estimateId: estimateId,   // For backward compatibility
      roomName: room.name || `Room #${roomId}`,
      room_name: room.name || `Room #${roomId}`,
      'room-name': room.name || `Room #${roomId}`, // Add hyphenated version for class matching
      roomTotal: format.currency(room.total || 0),
      room_price: format.currency(room.total || 0),
      'room-price': format.currency(room.total || 0), // Add hyphenated version for class matching
      room_dimensions: room.dimensions_display || (room.width && room.length ?
        `${room.width}m x ${room.length}m` : ''),
      'room-dimensions': room.dimensions_display || (room.width && room.length ?
        `${room.width}m x ${room.length}m` : ''), // Add hyphenated version for class matching
      primary_product_image: primaryProductImage,  // Add primary product image
      primary_product_name: primaryProductName || '', // Add primary product name
      'primary-product-name': primaryProductName || '', // Add hyphenated version for class matching
      has_primary_product: !!primaryProductImage,  // Flag to show/hide image
      isExpanded: expand
    };

    // Log the template data we're using to ensure attributes get set
    logger.log('Room template data:', templateData);

    // Direct insertion into container using TemplateEngine
    TemplateEngine.insert('room-item-template', templateData, container);

    // Get the room element that was just inserted (should be last child)
    const roomElement = container.lastElementChild;

    // Double-check data attributes are set correctly
    if (roomElement) {
      // Ensure room element has the room-item class for consistent selection
      roomElement.classList.add('room-item');

      // Explicitly set data attributes on the room element
      roomElement.dataset.roomId = roomId;
      roomElement.dataset.estimateId = estimateId;

      // Also set data attributes on the remove button
      const removeButton = roomElement.querySelector('.remove-room');
      if (removeButton) {
        removeButton.dataset.roomId = roomId;
        removeButton.dataset.estimateId = estimateId;
      }

      // Set expanded state if needed
      const header = roomElement.querySelector('.accordion-header-wrapper');
      if (header && expand) {
        header.classList.add('expanded');
      }

      // Set content display based on expand flag
      const content = roomElement.querySelector('.accordion-content');
      if (content) {
        content.style.display = expand ? 'block' : 'none';
      }

      // Product list section removed - products now displayed as part of room-item template

      // Bind event handlers for this room
      this.bindRoomEvents(roomElement, estimateId, roomId);

      // Bind toggle functionality for includes and similar products
      this.bindIncludesToggle(roomElement);
      this.bindSimilarProductsToggle(roomElement);

      // Render aggregated product includes at the room level
      const includesData = this.aggregateProductIncludes(room);
      this.renderRoomIncludes(includesData, roomElement, room.id, estimateId);

      // Render additional products with variations
      this.renderAdditionalProducts(room, roomElement);

      // Render product upgrades for the room
      this.renderRoomUpgrades(room, roomElement);

      // Initialize similar products for the room
      this.initializeSimilarProductsForRoom(estimateId, roomId);

      // Product loading removed - products now displayed as part of room-item template

      // Log that the room element was rendered with the expected attributes
      logger.log(`Room element rendered with data-room-id=${roomElement.dataset.roomId} and data-estimate-id=${roomElement.dataset.estimateId}`);
    } else {
      logger.error('Failed to find rendered room element after insertion');
    }

    return Promise.resolve(roomElement);
  }

  /**
   * Render additional products with variations for a room
   * @param {object} room - The room data
   * @param {HTMLElement} roomElement - The room element
   */
  renderAdditionalProducts(room, roomElement) {
    logger.log('Rendering additional products', { roomName: room.name });

    // Get estimate and room IDs from the room element
    const estimateId = roomElement.dataset.estimateId;
    const roomId = roomElement.dataset.roomId;

    if (!estimateId || !roomId) {
      logger.error('Missing estimate or room ID on room element');
      return;
    }

    // Find the additional products container
    const additionalProductsContainer = roomElement.querySelector('.additional-products-container');
    const additionalProductsList = roomElement.querySelector('.additional-products-list');
    
    if (!additionalProductsList) {
      logger.warn('Additional products list container not found in room element');
      return;
    }

    // Clear existing content
    additionalProductsList.innerHTML = '';

    // Collect all additional products with variations
    let hasAdditionalProducts = false;
    
    if (room.products && typeof room.products === 'object') {
      Object.values(room.products).forEach(product => {
        if (product.additional_products && typeof product.additional_products === 'object') {
          Object.values(product.additional_products).forEach(additionalProduct => {
            // Check if this additional product has variations
            if (additionalProduct.is_variable && additionalProduct.variations) {
              hasAdditionalProducts = true;
              
              // Create a section for this additional product
              const sectionContainer = document.createElement('div');
              sectionContainer.className = 'additional-product-section';
              sectionContainer.setAttribute('data-parent-product-id', additionalProduct.id);
              
              // Add section title
              const titleElement = document.createElement('h6');
              titleElement.className = 'additional-product-title';
              titleElement.textContent = `${additionalProduct.name} Variations`;
              sectionContainer.appendChild(titleElement);
              
              // Create variations container
              const variationsContainer = document.createElement('div');
              variationsContainer.className = 'additional-product-variations-grid';
              
              // Render each variation - sort by menu_order to match admin display order
              const sortedVariations = Object.values(additionalProduct.variations)
                .sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0));
              
              sortedVariations.forEach(variation => {
                const variationData = {
                  product_id: variation.id,
                  estimate_id: estimateId,
                  room_id: roomId,
                  parent_product_id: additionalProduct.id,
                  name: variation.name,
                  product_name: variation.name,
                  price: variation.min_price_total || variation.min_price || 0,
                  product_price: format.currency(variation.min_price_total || variation.min_price || 0),
                  image: variation.image || '',
                  attributes: variation.attributes || {}
                };
                
                logger.log('Rendering additional product variation:', variationData);
                
                // Create variation container
                const variationContainer = document.createElement('div');
                
                // Use the template but modify button text and data
                TemplateEngine.insert('additional-product-option-template', variationData, variationContainer);
                
                // Get the actual tile element from the container
                const variationElement = variationContainer.querySelector('.additional-product-option-tile');
                if (variationElement) {
                  variationElement.classList.add('variation-tile');
                  
                  // Add selected class if this variation is selected
                  if (variation.selected === true) {
                    variationElement.classList.add('selected');
                  }
                }
                
                // Update button
                const button = variationElement.querySelector('.replace-product-in-room');
                if (button) {
                  // Change button text based on selected state
                  button.textContent = variation.selected === true ? 'Selected' : 'Select Variation';
                  button.dataset.productId = variation.id;
                  button.dataset.estimateId = estimateId;
                  button.dataset.roomId = roomId;
                  button.dataset.replaceProductId = additionalProduct.id;
                  button.dataset.replaceType = 'additional_products';
                  button.dataset.parentProductId = additionalProduct.id;
                }
                
                // Append only the content of the container, not the wrapper
                variationsContainer.appendChild(variationContainer.firstElementChild);
              });
              
              sectionContainer.appendChild(variationsContainer);
              additionalProductsList.appendChild(sectionContainer);
            }
          });
        }
      });
    }
    
    // Show/hide the container based on whether we have additional products
    if (additionalProductsContainer) {
      additionalProductsContainer.style.display = hasAdditionalProducts ? '' : 'none';
    }
    
    // Bind events for variation buttons
    if (hasAdditionalProducts) {
      this.bindAdditionalProductButtons(additionalProductsList);
    }
  }
  
  /**
   * Bind events for additional product variation buttons
   * @param {HTMLElement} container - The container with buttons
   */
  bindAdditionalProductButtons(container) {
    const buttons = container.querySelectorAll('.replace-product-in-room');
    
    buttons.forEach(button => {
      if (button._clickHandler) {
        button.removeEventListener('click', button._clickHandler);
      }

      button._clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const productId = button.dataset.productId;
        const estimateId = button.dataset.estimateId;
        const roomId = button.dataset.roomId;
        const replaceProductId = button.dataset.replaceProductId;
        const replaceType = button.dataset.replaceType;
        const parentProductId = button.dataset.parentProductId;

        logger.log('Additional product variation button clicked', {
          productId,
          estimateId,
          roomId,
          replaceProductId,
          replaceType,
          parentProductId
        });

        // Handle variation selection
        this.selectProductAdditionVariation(estimateId, roomId, parentProductId, productId);
      };

      button.addEventListener('click', button._clickHandler);
    });
  }

  /**
   * Select a variation for a product addition
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   * @param {string} parentProductId - The parent additional product ID
   * @param {string} variationId - The selected variation ID
   */
  selectProductAdditionVariation(estimateId, roomId, parentProductId, variationId) {
    logger.log('Selecting product addition variation', { estimateId, roomId, parentProductId, variationId });
    
    // Use DataService to update the variation selection
    this.dataService.updateProductAdditionVariation(estimateId, roomId, parentProductId, variationId)
      .then(() => {
        logger.log('Product addition variation updated successfully');
        
        // Update the UI to reflect the changes
        this.updateProductAdditionVariationUI(estimateId, roomId);
      })
      .catch(error => {
        logger.error('Error updating product addition variation', error);
        
        // Show error notification
        if (this.modalManager.confirmationDialog) {
          this.modalManager.confirmationDialog.show({
            title: 'Error',
            message: 'Failed to update the variation. Please try again.',
            type: 'error',
            showCancel: false,
            confirmText: 'OK'
          });
        }
      });
  }

  /**
   * Update the product addition variation UI after selection
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   */
  updateProductAdditionVariationUI(estimateId, roomId) {
    // Find the room element
    const roomElement = document.querySelector(`.room-item[data-estimate-id="${estimateId}"][data-room-id="${roomId}"]`);
    
    if (!roomElement) {
      // If room element not found, try to refresh the room display
      const roomContainer = document.querySelector(`.room-content[data-estimate-id="${estimateId}"][data-room-id="${roomId}"]`);
      if (roomContainer) {
        this.displayRoomProducts(estimateId, roomId, roomContainer);
      }
      return;
    }
    
    // Refresh the additional products display
    const estimatesData = loadEstimateData();
    const estimate = estimatesData.estimates[estimateId];
    if (estimate && estimate.rooms[roomId]) {
      this.renderAdditionalProducts(estimate.rooms[roomId], roomElement);
    }
    
    // Also update the main product display if needed
    const roomContainer = roomElement.closest('.room-container');
    if (roomContainer) {
      const productsContainer = roomContainer.querySelector('.room-products');
      if (productsContainer) {
        this.displayRoomProducts(estimateId, roomId, productsContainer);
      }
    }
  }

  /**
   * Render aggregated product includes for a room
   * @param {object} includesData - Object containing includes array and sectionInfo
   * @param {HTMLElement} roomElement - The room element
   * @param {string} roomId - The room ID
   * @param {string} estimateId - The estimate ID
   */
  renderRoomIncludes(includesData, roomElement, roomId, estimateId) {
    logger.log('Rendering room includes (products)', { roomId, includesData });

    if (!estimateId || !roomId) {
      logger.error('Missing estimate or room ID on room element');
      return;
    }

    // Find the includes container in the room element
    const includesContainer = roomElement.querySelector('.product-includes-items');
    if (!includesContainer) {
      logger.warn('Product includes container not found in room element');
      return;
    }

    // Clear existing includes
    includesContainer.innerHTML = '';

    // Handle both includesData and room parameter formats for backwards compatibility
    let includesArray = [];
    let sectionInfo = null;
    
    if (includesData.includes && Array.isArray(includesData.includes)) {
      // New format with includes and sectionInfo
      includesArray = includesData.includes;
      sectionInfo = includesData.sectionInfo;
    } else if (includesData.products) {
      // Old format - room object
      const aggregated = this.aggregateProductIncludes(includesData);
      includesArray = aggregated.includes;
      sectionInfo = aggregated.sectionInfo;
    }
    
    // Check if we have includes
    if (includesArray.length === 0) {
      logger.log('No includes to display, show empty state');
      
      // Hide all product-related sections
      const includesSection = roomElement.querySelector('.includes-container');
      const includesToggle = roomElement.querySelector('.product-includes-toggle');
      const similarProductsSection = roomElement.querySelector('.similar-products-container');
      const similarProductsToggle = roomElement.querySelector('.similar-products-toggle');
      
      if (includesSection) includesSection.style.display = 'none';
      if (includesToggle) includesToggle.style.display = 'none';
      if (similarProductsSection) similarProductsSection.style.display = 'none';
      if (similarProductsToggle) similarProductsToggle.style.display = 'none';
      
      // Show empty state
      const emptyStateContainer = roomElement.querySelector('.room-empty-state');
      if (emptyStateContainer) {
        emptyStateContainer.style.display = 'block';
        TemplateEngine.insert('products-empty-template', {}, emptyStateContainer);
      }
      return;
    }

    // Hide empty state if it exists
    const emptyStateContainer = roomElement.querySelector('.room-empty-state');
    if (emptyStateContainer) {
      emptyStateContainer.style.display = 'none';
    }
    
    // Show the includes section and toggle button
    const includesSection = roomElement.querySelector('.includes-container');
    const includesToggle = roomElement.querySelector('.product-includes-toggle');
    
    if (includesSection) {
      includesSection.style.display = '';
    }
    if (includesToggle) {
      includesToggle.style.display = '';
    }
    
    // Also show similar products section if it was hidden
    const similarProductsToggle = roomElement.querySelector('.similar-products-toggle');
    const similarProductsContainer = roomElement.querySelector('.similar-products-container');
    
    if (similarProductsToggle) {
      similarProductsToggle.style.display = '';
    }
    if (similarProductsContainer) {
      similarProductsContainer.style.display = '';
    }

    // Separate primary products and additional products
    const primaryProducts = includesArray.filter(item => item.is_primary);
    const additionalProducts = includesArray.filter(item => item.is_additional);
    
    // Render primary products first
    primaryProducts.forEach((include, index) => {
      const price = include.price || 0;
      const productData = {
        product_id: include.id || include.product_id,
        estimate_id: estimateId,
        room_id: roomId,
        product_index: index,
        name: include.name || 'Product',
        product_name: include.name || 'Product',
        price: price,
        product_price: format.currency(price),
        image: include.image || '',
        sku: include.sku || ''
      };

      logger.log('Rendering primary product as include:', productData);
      TemplateEngine.insert('include-item-template', productData, includesContainer);
    });
    
    // If we have additional products and section info, render them in a separate section
    if (additionalProducts.length > 0 && sectionInfo && (sectionInfo.title || sectionInfo.description)) {
      // Create section wrapper
      const sectionData = {
        'additional-product-title': sectionInfo.title || 'Additional Products',
        'additional-product-description': sectionInfo.description || ''
      };
      
      // Insert section template
      const sectionContainer = includesContainer.parentElement;
      if (sectionContainer) {
        TemplateEngine.insert('additional-products-section-template', sectionData, sectionContainer);
        
        // Find the section's product list container
        const newSection = sectionContainer.querySelector('.additional-products-section');
        if (newSection) {
          const productsList = newSection.querySelector('.additional-products-list');
          if (productsList) {
            // Render additional products in this section
            additionalProducts.forEach((include, index) => {
              const price = include.price || 0;
              const productData = {
                product_id: include.id || include.product_id,
                estimate_id: estimateId,
                room_id: roomId,
                product_index: primaryProducts.length + index,
                name: include.name || 'Product',
                product_name: include.name || 'Product',
                price: price,
                product_price: format.currency(price),
                image: include.image || '',
                sku: include.sku || ''
              };

              logger.log('Rendering additional product:', productData);
              TemplateEngine.insert('include-item-template', productData, productsList);
            });
          }
        }
      }
    } else if (additionalProducts.length > 0) {
      // If we have additional products but no section info, just render them normally
      additionalProducts.forEach((include, index) => {
        const price = include.price || 0;
        const productData = {
          product_id: include.id || include.product_id,
          estimate_id: estimateId,
          room_id: roomId,
          product_index: primaryProducts.length + index,
          name: include.name || 'Product',
          product_name: include.name || 'Product',
          price: price,
          product_price: format.currency(price),
          image: include.image || '',
          sku: include.sku || ''
        };

        logger.log('Rendering additional product without section:', productData);
        TemplateEngine.insert('include-item-template', productData, includesContainer);
      });
    }

    // Bind remove buttons for all include items
    this.bindIncludeItemRemoveButtons(includesContainer, estimateId, roomId);

    // Also bind remove buttons in the additional products section if it exists
    const additionalSection = includesContainer.parentElement?.querySelector('.additional-products-section');
    if (additionalSection) {
      const additionalProductsList = additionalSection.querySelector('.additional-products-list');
      if (additionalProductsList) {
        this.bindIncludeItemRemoveButtons(additionalProductsList, estimateId, roomId);
      }
    }

    logger.log(`Rendered ${includesArray.length} products in room includes (${primaryProducts.length} primary, ${additionalProducts.length} additional)`);
  }

  /**
   * Bind remove button events for include items
   * @param {HTMLElement} includesContainer - The includes container
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   */
  bindIncludeItemRemoveButtons(includesContainer, estimateId, roomId) {
    logger.log('Binding remove buttons for include items', { estimateId, roomId });

    const removeButtons = includesContainer.querySelectorAll('.remove-product');
    removeButtons.forEach((button) => {
      const productId = button.dataset.productId;
      const includeItem = button.closest('.include-item');
      const productName = includeItem ? includeItem.querySelector('.product-name').textContent : 'this product';
      
      // Remove any existing handler
      if (button._clickHandler) {
        button.removeEventListener('click', button._clickHandler);
      }

      button._clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Show confirmation dialog before removing
        if (this.modalManager && this.modalManager.confirmationDialog) {
          this.modalManager.confirmationDialog.show({
            title: 'Remove Product',
            message: `Are you sure you want to remove "${productName}" from this room?`,
            confirmText: 'Remove',
            cancelText: 'Cancel',
            type: 'product',
            action: 'delete',
            onConfirm: () => {
              // Use the productManager to handle removal
              if (this.modalManager.productManager) {
                // Since products are indexed by ID, we need to pass the productId directly
                this.modalManager.productManager.performProductRemoval(estimateId, roomId, null, productId);
              }
            },
            onCancel: () => {
              logger.log('Product removal cancelled by user');
            }
          });
        }
      };

      button.addEventListener('click', button._clickHandler);
    });
  }

  /**
   * Render product upgrades for a room
   * @param {object} room - The room data
   * @param {HTMLElement} roomElement - The room element
   */
  renderRoomUpgrades(room, roomElement) {
    logger.log('Rendering room upgrades', { roomName: room.name });

    // Get estimate and room IDs from the room element
    const estimateId = roomElement.dataset.estimateId;
    const roomId = roomElement.dataset.roomId;

    if (!estimateId || !roomId) {
      logger.error('Missing estimate or room ID on room element');
      return;
    }

    // Find the upgrades container in the room element
    const upgradesListContainer = roomElement.querySelector('.product-upgrades-list');
    const upgradesContainer = roomElement.querySelector('.product-upgrades-container');
    
    if (!upgradesListContainer) {
      logger.warn('Product upgrades list container not found in room element');
      return;
    }

    // Clear existing upgrades
    upgradesListContainer.innerHTML = '';

    // Collect all upgrades from all products in the room
    let allUpgrades = [];
    
    if (room.products && typeof room.products === 'object') {
      Object.values(room.products).forEach(product => {
        logger.log('Checking product for upgrades:', {
          productId: product.id,
          productName: product.name,
          hasAdditionalProducts: !!product.additional_products,
          additionalProductsCount: product.additional_products ? Object.keys(product.additional_products).length : 0
        });
        
        // Check if additional_products is an object (as in the localStorage data)
        if (product.additional_products && typeof product.additional_products === 'object') {
          // Iterate through additional products object
          Object.values(product.additional_products).forEach((item, index) => {
            logger.log(`Additional product:`, {
              id: item.id,
              name: item.name,
              has_upgrades: item.has_upgrades,
              upgrades: item.upgrades,
              entire_item: item
            });
            
            // Check if this additional product has upgrades
            if (item.has_upgrades && item.upgrades && item.upgrades.products && Array.isArray(item.upgrades.products)) {
              logger.log(`Found ${item.upgrades.products.length} upgrades for ${item.name}`);
              
              // Create upgrade sections for each additional product with upgrades
              const upgradeSection = {
                ...item.upgrades,
                parent_product_id: item.id,
                parent_product_name: item.name,
                products: item.upgrades.products.map(upgradeProduct => ({
                  ...upgradeProduct,
                  room_id: roomId,
                  estimate_id: estimateId,
                  replace_product_id: item.id,
                  pricing_method: upgradeProduct.pricing_method || 'fixed',
                  parent_product_name: item.name
                }))
              };
              
              allUpgrades.push(upgradeSection);
            }
          });
        }
      });
    }

    logger.log(`Found ${allUpgrades.length} upgrades for room ${room.name}`);

    // If we have upgrades, show the container and render them
    if (allUpgrades.length > 0) {
      if (upgradesContainer) {
        upgradesContainer.style.display = '';
      }

      // Render each upgrade section
      allUpgrades.forEach(upgradeSection => {
        logger.log('Rendering upgrade section:', {
          title: upgradeSection.title,
          description: upgradeSection.description,
          productCount: upgradeSection.products ? upgradeSection.products.length : 0,
          parentProduct: upgradeSection.parent_product_name
        });

        // Create a section container for each upgrade group
        const sectionContainer = document.createElement('div');
        sectionContainer.className = 'product-upgrades';
        sectionContainer.setAttribute('data-product-id', upgradeSection.parent_product_id);
        
        // Create the upgrade option container
        const optionContainer = document.createElement('div');
        optionContainer.className = 'product-upgrade-option';
        optionContainer.setAttribute('data-upgrade-id', upgradeSection.parent_product_id);
        
        // Add section title and description if available
        if (upgradeSection.title) {
          const titleElement = document.createElement('h6');
          titleElement.className = 'upgrade-title';
          titleElement.textContent = upgradeSection.title;
          optionContainer.appendChild(titleElement);
        }
        
        if (upgradeSection.description) {
          const descElement = document.createElement('p');
          descElement.className = 'upgrade-description';
          descElement.textContent = upgradeSection.description;
          optionContainer.appendChild(descElement);
        }
        
        // Create tiles container structure
        const tilesContainer = document.createElement('div');
        tilesContainer.className = 'product-upgrade-tiles';
        tilesContainer.setAttribute('data-upgrade-id', upgradeSection.parent_product_id);
        
        // Create tiles wrapper
        const tilesWrapper = document.createElement('div');
        tilesWrapper.className = 'tiles-wrapper';
        
        // Render each upgrade product in the section
        if (upgradeSection.products && Array.isArray(upgradeSection.products)) {
          upgradeSection.products.forEach(upgrade => {
            const upgradeData = {
              product_id: upgrade.id,
              estimate_id: upgrade.estimate_id,
              room_id: upgrade.room_id,
              replace_product_id: upgrade.replace_product_id,
              pricing_method: upgrade.pricing_method,
              replace_type: 'product_upgrade',
              name: upgrade.name,
              product_name: upgrade.name,
              price: upgrade.min_total || upgrade.price || 0,
              product_price: format.currency(upgrade.min_total || upgrade.price || 0),
              image: upgrade.image || '',
              url: upgrade.url || '#',
              parent_product_name: upgrade.parent_product_name
            };

            logger.log('Rendering upgrade product:', upgradeData);
            TemplateEngine.insert('product-upgrade-item-template', upgradeData, tilesWrapper);
          });
        }
        
        // Assemble the structure: tiles wrapper -> tiles container -> option container -> section container
        tilesContainer.appendChild(tilesWrapper);
        optionContainer.appendChild(tilesContainer);
        sectionContainer.appendChild(optionContainer);
        upgradesListContainer.appendChild(sectionContainer);
      });

      // Bind events for upgrade buttons
      this.bindUpgradeButtons(upgradesListContainer);
    } else {
      // Hide the upgrades container if no upgrades
      if (upgradesContainer) {
        upgradesContainer.style.display = 'none';
      }
    }
  }

  /**
   * Bind events for upgrade buttons
   * @param {HTMLElement} upgradesContainer - The upgrades container
   */
  bindUpgradeButtons(upgradesContainer) {
    const upgradeButtons = upgradesContainer.querySelectorAll('.replace-product-in-room');
    
    upgradeButtons.forEach(button => {
      if (button._clickHandler) {
        button.removeEventListener('click', button._clickHandler);
      }

      button._clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const productId = button.dataset.productId;
        const estimateId = button.dataset.estimateId;
        const roomId = button.dataset.roomId;
        const replaceProductId = button.dataset.replaceProductId;
        const pricingMethod = button.dataset.pricingMethod;
        const replaceType = button.dataset.replaceType;

        logger.log('Upgrade button clicked', {
          productId,
          estimateId,
          roomId,
          replaceProductId,
          pricingMethod,
          replaceType
        });

        // Use the productManager to handle the replacement
        if (this.modalManager.productManager) {
          // Note: replaceProductInRoom expects: estimateId, roomId, oldProductId, newProductId
          this.modalManager.productManager.replaceProductInRoom(
            estimateId,
            roomId,
            replaceProductId,  // OLD product to replace
            productId          // NEW product (the upgrade)
          );
        }
      };

      button.addEventListener('click', button._clickHandler);
    });
  }

  /**
   * Bind toggle functionality for includes section
   * @param {HTMLElement} roomElement - The room element
   */
  bindIncludesToggle(roomElement) {
    logger.log('bindIncludesToggle called for room element');
    const toggleButton = roomElement.querySelector('.product-includes-toggle');
    const includesContainer = roomElement.querySelector('.includes-container');
    
    logger.log('Found includes toggle button:', !!toggleButton);
    logger.log('Found includes container:', !!includesContainer);
    
    if (toggleButton && includesContainer) {
      // Remove any existing click handler to prevent duplicates
      if (toggleButton._clickHandler) {
        logger.log('Removing existing includes toggle handler');
        toggleButton.removeEventListener('click', toggleButton._clickHandler);
      }
      
      toggleButton._clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        logger.log('Includes toggle clicked');
        const isExpanded = toggleButton.classList.contains('expanded');
        logger.log('Current expanded state:', isExpanded);
        
        if (isExpanded) {
          toggleButton.classList.remove('expanded');
          includesContainer.classList.remove('visible');
          
          // Update toggle icon
          const toggleIcon = toggleButton.querySelector('.toggle-icon');
          if (toggleIcon) {
            toggleIcon.classList.remove('dashicons-arrow-up-alt2');
            toggleIcon.classList.add('dashicons-arrow-down-alt2');
          }
          logger.log('Includes collapsed');
        } else {
          toggleButton.classList.add('expanded');
          includesContainer.classList.add('visible');
          
          // Update toggle icon
          const toggleIcon = toggleButton.querySelector('.toggle-icon');
          if (toggleIcon) {
            toggleIcon.classList.remove('dashicons-arrow-down-alt2');
            toggleIcon.classList.add('dashicons-arrow-up-alt2');
          }
          logger.log('Includes expanded');
        }
      };
      
      toggleButton.addEventListener('click', toggleButton._clickHandler);
      logger.log('Includes toggle event handler attached');
    } else {
      logger.warn('Could not bind includes toggle - missing elements');
    }
  }

  /**
   * Bind toggle functionality for similar products section
   * @param {HTMLElement} roomElement - The room element
   */
  bindSimilarProductsToggle(roomElement) {
    logger.log('bindSimilarProductsToggle called for room element');
    const toggleButton = roomElement.querySelector('.similar-products-toggle');
    const similarProductsContainer = roomElement.querySelector('.similar-products-container');
    
    logger.log('Found similar products toggle button:', !!toggleButton);
    logger.log('Found similar products container:', !!similarProductsContainer);
    
    if (toggleButton && similarProductsContainer) {
      // Remove any existing click handler to prevent duplicates
      if (toggleButton._clickHandler) {
        logger.log('Removing existing similar products toggle handler');
        toggleButton.removeEventListener('click', toggleButton._clickHandler);
      }
      
      toggleButton._clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        logger.log('Similar products toggle clicked');
        const isExpanded = toggleButton.classList.contains('expanded');
        logger.log('Current expanded state:', isExpanded);
        
        if (isExpanded) {
          toggleButton.classList.remove('expanded');
          similarProductsContainer.classList.remove('visible');
          
          // Update toggle icon
          const toggleIcon = toggleButton.querySelector('.toggle-icon');
          if (toggleIcon) {
            toggleIcon.classList.remove('dashicons-arrow-up-alt2');
            toggleIcon.classList.add('dashicons-arrow-down-alt2');
          }
          logger.log('Similar products collapsed');
        } else {
          toggleButton.classList.add('expanded');
          similarProductsContainer.classList.add('visible');
          
          // Update toggle icon
          const toggleIcon = toggleButton.querySelector('.toggle-icon');
          if (toggleIcon) {
            toggleIcon.classList.remove('dashicons-arrow-down-alt2');
            toggleIcon.classList.add('dashicons-arrow-up-alt2');
          }
          logger.log('Similar products expanded');
          
          // Trigger carousel initialization if not already loaded
          const carouselContainer = similarProductsContainer.querySelector('.similar-products-carousel');
          if (carouselContainer && this.modalManager.uiManager) {
            this.modalManager.uiManager.initializeCarouselInContainer(carouselContainer);
          }
        }
      };
      
      toggleButton.addEventListener('click', toggleButton._clickHandler);
      logger.log('Similar products toggle event handler attached');
    } else {
      logger.warn('Could not bind similar products toggle - missing elements');
    }
  }

  /**
   * Bind events to a room element
   * @param {HTMLElement} roomElement - The room element
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   */
  bindRoomEvents(roomElement, estimateId, roomId) {
    logger.log('Binding events to room element', { estimateId, roomId });

    if (!roomElement) {
      logger.error('Room element not available for binding events');
      return;
    }

    // Bind accordion header click for expanding/collapsing
    const accordionHeader = roomElement.querySelector('.accordion-header');
    if (accordionHeader) {
      if (accordionHeader._clickHandler) {
        accordionHeader.removeEventListener('click', accordionHeader._clickHandler);
      }

      accordionHeader._clickHandler = (e) => {
        // Don't toggle if clicking on a button with specific functionality
        if (e.target.closest('button:not(.accordion-header)')) {
          return;
        }

        const headerWrapper = accordionHeader.closest('.accordion-header-wrapper');
        const content = roomElement.querySelector('.accordion-content');
        if (!content || !headerWrapper) return;

        // Toggle expanded state
        const isExpanded = headerWrapper.classList.contains('expanded');

        if (isExpanded) {
          headerWrapper.classList.remove('expanded');
          content.style.display = 'none';
        } else {
          headerWrapper.classList.add('expanded');
          content.style.display = 'block';

          // Product loading removed - products now displayed as part of room-item template
          
          // Initialize similar products for the room
          this.initializeSimilarProductsForRoom(estimateId, roomId);
        }
      };

      accordionHeader.addEventListener('click', accordionHeader._clickHandler);
    }

    // Bind remove button
    const removeButton = roomElement.querySelector('.remove-room');
    if (removeButton) {
      if (removeButton._clickHandler) {
        removeButton.removeEventListener('click', removeButton._clickHandler);
      }

      removeButton._clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleRoomRemoval(estimateId, roomId);
      };

      removeButton.addEventListener('click', removeButton._clickHandler);
    }

    // Bind add product functionality - add a button if it doesn't exist in the template
    let addProductButton = roomElement.querySelector('.add-product-button');
    if (!addProductButton) {
      // Create add product button if it doesn't exist in the template using TemplateEngine
      const productList = roomElement.querySelector('.product-list');
      if (productList && productList.parentElement) {
        // Insert the actions footer template after the product list
        TemplateEngine.insert('room-actions-footer-template', {}, productList.parentElement);

        // Get the newly added button
        addProductButton = roomElement.querySelector('.add-product-button');
      }
    }

    if (addProductButton) {
      if (addProductButton._clickHandler) {
        addProductButton.removeEventListener('click', addProductButton._clickHandler);
      }

      addProductButton._clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Delegate to ProductManager to show product selection
        if (this.modalManager.productManager) {
          this.modalManager.productManager.showProductSelection(estimateId, roomId);
        } else {
          logger.error('ProductManager not available for showProductSelection');
        }
      };

      addProductButton.addEventListener('click', addProductButton._clickHandler);
    }
  }

  /**
   * Show the new room form
   * @param {string} estimateId - The estimate ID to add the room to
   * @param {string|null} productId - Optional product ID to add to the new room
   */
  showNewRoomForm(estimateId, productId = null) {
    logger.log('Showing new room form', { estimateId, productId });

    // Save the current estimate and product IDs
    this.currentEstimateId = estimateId;
    this.currentProductId = productId;

    // Get the new room form container from the modal manager
    const newRoomForm = this.modalManager.newRoomForm;

    if (!newRoomForm) {
      logger.error('New room form container not found in modal');
      this.modalManager.showError('Modal structure incomplete. Please contact support.');
      this.modalManager.hideLoading();
      return;
    }

    // Hide all other sections first to ensure only the new room form is visible
    if (this.modalManager.estimateManager && this.modalManager.estimateManager.hideAllSections) {
      this.modalManager.estimateManager.hideAllSections();
    }

    // Use ModalManager's utility to ensure the element is visible
    this.modalManager.forceElementVisibility(newRoomForm);

    // Show loading indicator while we prepare the form
    this.modalManager.showLoading();

    // Use TemplateEngine to insert the template
    try {
      // Clear existing content first in case it was loaded before
      newRoomForm.innerHTML = '';

      // Create the template data object
      const templateData = {};

      // Insert the template with our data
      TemplateEngine.insert('new-room-form-template', templateData, newRoomForm);
      logger.log('New room form template inserted into wrapper.');

      // Find the form element
      const formElement = newRoomForm.querySelector('form');
      if (formElement) {
        // Store estimate ID and product ID as data attributes on the form
        formElement.dataset.estimateId = estimateId;

        if (productId) {
          formElement.dataset.productId = productId;

          // Update the submit button text if we're in the add product flow
          const submitButton = formElement.querySelector('.submit-btn');
          if (submitButton) {
            submitButton.textContent = 'Add Room & Product';
          }
        } else {
          delete formElement.dataset.productId;
        }

        // Delegate form binding to the FormManager or bind events ourselves
        if (this.modalManager.formManager) {
          this.modalManager.formManager.bindNewRoomFormEvents(formElement, estimateId, productId);
        } else {
          this.bindNewRoomFormEvents(formElement, estimateId, productId);
        }

        this.modalManager.hideLoading();
      } else {
        logger.error('Form element not found inside the template after insertion!');
        this.modalManager.showError('Error rendering form template. Please try again.');
        this.modalManager.hideLoading();
      }
    } catch (error) {
      logger.error('Error inserting new room form template:', error);
      this.modalManager.showError('Error loading form template. Please try again.');
      this.modalManager.hideLoading();
    }
  }

  /**
   * Bind events to the new room form
   * @param {HTMLFormElement} formElement - The form element
   * @param {string} estimateId - The estimate ID
   * @param {string|null} productId - Optional product ID
   */
  bindNewRoomFormEvents(formElement, estimateId, productId = null) {
    logger.log('Binding events to new room form', { estimateId, productId });

    if (!formElement) {
      logger.error('Form element not available for binding events');
      return;
    }

    // Remove any existing event listeners to prevent duplicates
    if (formElement._submitHandler) {
      formElement.removeEventListener('submit', formElement._submitHandler);
    }

    // Create new submit handler
    formElement._submitHandler = (e) => {
      e.preventDefault();

      // Show loading indicator
      this.modalManager.showLoading();

      // Get the form data
      const formData = new FormData(formElement);
      const roomName = formData.get('room_name');
      const roomWidth = formData.get('room_width');
      const roomLength = formData.get('room_length');

      if (!roomName) {
        this.modalManager.showError('Please enter a room name.');
        this.modalManager.hideLoading();
        return;
      }

      if (!roomWidth || !roomLength) {
        this.modalManager.showError('Please enter room dimensions.');
        this.modalManager.hideLoading();
        return;
      }

      // Create the room
      this.dataService.addNewRoom({
        room_name: roomName,
        room_width: roomWidth,
        room_length: roomLength
      }, estimateId, productId)
        .then(newRoom => {
          logger.log('Room created successfully:', newRoom);

          // If a product ID is provided, add it to the new room
          if (productId) {
            // Delegate to the ProductManager to add product to the new room
            if (this.modalManager.productManager) {
              logger.log("[DEBUG][ROOM]" . toJSON(newRoom));
              return this.modalManager.productManager.addProductToRoom(estimateId, newRoom.room_id, productId)
                .then(() => {
                  // Hide loading
                  this.modalManager.hideLoading();

                  // First show the estimates list with the newly created room expanded
                  if (this.modalManager.estimateManager) {
                    this.modalManager.estimateManager.showEstimatesList(estimateId, newRoom.room_id);
                  }

                  // Then show a confirmation dialog using ConfirmationDialog (with slight delay to allow UI to render)
                  if (this.modalManager && this.modalManager.confirmationDialog) {
                    setTimeout(() => {
                      this.modalManager.confirmationDialog.show({
                        title: 'Room Created',
                        message: 'The room has been created and the product has been added.',
                        type: 'room',
                        action: 'success',
                        showCancel: false,
                        confirmText: 'OK'
                      });
                    }, 100);
                  } else {
                    logger.log('Room created and product added successfully.');
                  }
                })
                .catch(error => {
                  // If it's a duplicate product error, the dialog is already shown by ProductManager
                  if (error && error.data && error.data.duplicate) {
                    // Still show the estimates list with the newly created room
                    if (this.modalManager.estimateManager) {
                      this.modalManager.estimateManager.showEstimatesList(estimateId, newRoom.room_id);
                    }
                    this.modalManager.hideLoading();
                    return; // Dialog for duplicate already shown, just return
                  }

                  // For other errors, log and rethrow so the main catch handler can process it
                  logger.log('Error adding product to new room:', error);
                  this.modalManager.hideLoading();
                  throw error;
                });
            } else {
              logger.error('ProductManager not available for addProductToRoom');
              this.modalManager.hideLoading();

              // First show the estimates list with the newly created room expanded
              if (this.modalManager.estimateManager) {
                this.modalManager.estimateManager.showEstimatesList(estimateId, newRoom.id);
              }

              // Then show a confirmation dialog using ConfirmationDialog (with slight delay to allow UI to render)
              if (this.modalManager && this.modalManager.confirmationDialog) {
                setTimeout(() => {
                  this.modalManager.confirmationDialog.show({
                    title: 'Room Created',
                    message: 'The room has been created.',
                    type: 'room',
                    action: 'success',
                    showCancel: false,
                    confirmText: 'OK'
                  });
                }, 100);
              } else {
                logger.log('Room created successfully.');
              }
            }
          } else {
            // No product ID, just show success message
            this.modalManager.hideLoading();

            // First, switch view to show the estimate with the new room expanded
            if (this.modalManager.estimateManager) {
              this.modalManager.estimateManager.showEstimatesList(estimateId, newRoom.id);

              // Then show a confirmation dialog
              if (this.modalManager && this.modalManager.confirmationDialog) {
                setTimeout(() => {
                  this.modalManager.confirmationDialog.show({
                    title: 'Room Created',
                    message: 'The room has been created.',
                    type: 'room',
                    action: 'success',
                    showCancel: false,
                    confirmText: 'OK'
                  });
                }, 100);
              } else {
                logger.log('Room created successfully.');
              }
            } else {
              // No estimate manager, show message and close
              if (this.modalManager && this.modalManager.confirmationDialog) {
                this.modalManager.confirmationDialog.show({
                  title: 'Room Created',
                  message: 'The room has been created.',
                  type: 'room',
                  action: 'success',
                  showCancel: false,
                  confirmText: 'OK',
                  onConfirm: () => {
                    this.modalManager.closeModal();
                  }
                });
              } else {
                logger.log('Room created successfully.');
                this.modalManager.closeModal();
              }
            }
          }
        })
        .catch(error => {
          logger.error('Error creating room:', error);
          this.modalManager.showError('Error creating room. Please try again.');
          this.modalManager.hideLoading();
        });
    };

    // Add the submit handler
    formElement.addEventListener('submit', formElement._submitHandler);

    // Add event handler for cancel button
    const cancelButton = formElement.querySelector('.cancel-button');
    if (cancelButton) {
      if (cancelButton._clickHandler) {
        cancelButton.removeEventListener('click', cancelButton._clickHandler);
      }

      cancelButton._clickHandler = (e) => {
        e.preventDefault();

        // Go back to estimate selection if we have a product ID,
        // otherwise go to the estimates list view
        if (productId) {
          // If we're adding a product, go back to estimate selection
          if (this.modalManager.estimateManager) {
            this.modalManager.estimateManager.showEstimateSelection(productId);
          } else {
            this.modalManager.closeModal();
          }
        } else {
          // If we're just creating a room, go back to the estimates list
          if (this.modalManager.estimateManager) {
            this.modalManager.estimateManager.showEstimatesList();
          } else {
            this.modalManager.closeModal();
          }
        }
      };

      cancelButton.addEventListener('click', cancelButton._clickHandler);
    }

    // Add event handler for back button
    const backButton = formElement.querySelector('.back-button');
    if (backButton) {
      if (backButton._clickHandler) {
        backButton.removeEventListener('click', backButton._clickHandler);
      }

      backButton._clickHandler = (e) => {
        e.preventDefault();

        // Same behavior as cancel button
        if (productId) {
          // If we're adding a product, go back to estimate selection
          if (this.modalManager.estimateManager) {
            this.modalManager.estimateManager.showEstimateSelection(productId);
          } else {
            this.modalManager.closeModal();
          }
        } else {
          // If we're just creating a room, go back to the estimates list
          if (this.modalManager.estimateManager) {
            this.modalManager.estimateManager.showEstimatesList();
          } else {
            this.modalManager.closeModal();
          }
        }
      };

      backButton.addEventListener('click', backButton._clickHandler);
    }
  }

  /**
   * Handle room removal
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID to remove
   */
  /**
   * Update room includes after products change
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   */

  handleRoomRemoval(estimateId, roomId) {
    logger.log('Handling room removal', { estimateId, roomId });

    // Check if ConfirmationDialog is available through ModalManager
    if (!this.modalManager || !this.modalManager.confirmationDialog) {
      logger.error('ConfirmationDialog not available');

      // Fallback to native confirm if ConfirmationDialog isn't available
      // TODO: Implement labels from localization system
      if (confirm('Are you sure you want to remove this room? All products in this room will also be removed. This action cannot be undone.')) {
        this.performRoomRemoval(estimateId, roomId);
      }
      return;
    }

    // Show the confirmation dialog using the dedicated component
    this.modalManager.confirmationDialog.show({
      // TODO: Implement labels from localization system
      title: 'Remove Room',
      message: 'Are you sure you want to remove this room? All products in this room will also be removed. This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'room',           // Specify the entity type (for proper styling)
      action: 'delete',       // Specify the action type (for proper styling)
      onConfirm: () => {
        // User confirmed, remove the room
        this.performRoomRemoval(estimateId, roomId);
      },
      onCancel: () => {
        // User cancelled, do nothing
        logger.log('Room removal cancelled by user');
      }
    });
  }

  /**
   * Perform the actual room removal operation
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID to remove
   * @private
   */
  performRoomRemoval(estimateId, roomId) {
    logger.log('Performing room removal', { estimateId, roomId });
    this.modalManager.showLoading();

    this.dataService.removeRoom(estimateId, roomId)
      .then(() => {
        logger.log('Room removed successfully from localStorage');

        // Find the room element in the DOM - try both room-item and accordion-item classes
        // because our template uses accordion-item but we add room-item class in code
        let roomElement = document.querySelector(`.room-item[data-room-id="${roomId}"][data-estimate-id="${estimateId}"]`);

        if (!roomElement) {
          // Try with just the original template class (accordion-item)
          roomElement = document.querySelector(`.accordion-item[data-room-id="${roomId}"][data-estimate-id="${estimateId}"]`);
        }

        if (roomElement) {
          // Remove the room element
          roomElement.remove();
          logger.log('Room element removed from DOM');

          // Instead of checking DOM right away, check localStorage
          // The element was just removed, so we'll rely on the getEstimate call below
          // to handle showing the empty state if there are no more rooms
          logger.log('Room element removed. Will check localStorage for remaining rooms.');
        } else {
          logger.warn(`Room element not found for removal with ID ${roomId}`);

          // Since we've already removed the room from localStorage,
          // refresh the estimate view to ensure UI is in sync
          if (this.modalManager.estimateManager) {
            this.modalManager.estimateManager.showEstimatesList(null, estimateId);
          }
        }

        // Update estimate totals and check for empty state
        this.dataService.getEstimate(estimateId)
          .then(estimate => {
            // Check if any rooms remain in the estimate (using storage data)
            const hasRoomsInStorage = estimate && estimate.rooms && Object.keys(estimate.rooms).length > 0;

            // Find the estimate item and rooms container
            const estimateItem = document.querySelector(`.estimate-item[data-estimate-id="${estimateId}"]`);
            if (estimateItem) {
              // Update the estimate total
              const totalElement = estimateItem.querySelector('.estimate-total-value');
              if (totalElement) {
                totalElement.textContent = format.currency(estimate.total || 0);
              }

              // Find the rooms container
              const roomsContainer = estimateItem.querySelector('.estimate-rooms-container');
              if (roomsContainer) {
                // Check if there are any room elements in the DOM
                const roomElementsInDOM = roomsContainer.querySelectorAll('.room-item, .accordion-item');
                const hasRoomsInDOM = roomElementsInDOM.length > 0;

                // If no rooms in storage OR no room elements in DOM, show empty template
                if (!hasRoomsInStorage || !hasRoomsInDOM) {
                  logger.log('No rooms remaining in estimate, showing empty rooms template',
                    { hasRoomsInStorage, roomCountInDOM: roomElementsInDOM.length });

                  // Clear existing content and show empty template
                  roomsContainer.innerHTML = '';
                  TemplateEngine.insert('rooms-empty-template', {}, roomsContainer);
                }
              }
            }
          })
          .catch(error => {
            logger.error('Error updating estimate totals after room removal:', error);
          })
          .finally(() => {
            this.modalManager.hideLoading();
          });
      })
      .catch(error => {
        logger.error('Error removing room:', error);

        // Show error message using ConfirmationDialog
        if (this.modalManager && this.modalManager.confirmationDialog) {
          this.modalManager.confirmationDialog.show({
            title: 'Error',
            message: 'Error removing room. Please try again.',
            confirmText: 'OK',
            cancelText: false,
            onConfirm: () => {
              logger.log('Error dialog closed');
            }
          });
        } else {
          // Fallback to modalManager.showError
          this.modalManager.showError('Error removing room. Please try again.');
        }

        this.modalManager.hideLoading();
      });
  }

  /**
   * Update room totals in the UI
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   * @param {object} totals - The totals data
   *
   * TODO: Fix room totals update to properly handle timing issues and DOM element availability.
   * Currently, the room element may not be available in the DOM when this is called,
   * particularly after adding a product to a newly created room.
   */
  updateRoomTotals(estimateId, roomId, totals) {
    logger.log('Updating room totals', { estimateId, roomId, totals });

    // Find the room element
    let roomElement = document.querySelector(`.room-item[data-room-id="${roomId}"][data-estimate-id="${estimateId}"]`);

    // If not found, just log a warning and store the totals for later
    if (!roomElement) {
      logger.warn('Room element not found for updating totals - will be updated on next view refresh', { estimateId, roomId });
      // Store totals for later application
      this.pendingTotals = this.pendingTotals || {};
      this.pendingTotals[`${estimateId}:${roomId}`] = totals;
      return;
    }

    // Update the total value - use room-price from template structure
    const totalElement = roomElement.querySelector('.room-price');
    if (totalElement) {
      totalElement.textContent = format.currency(totals.total || 0);
    } else {
      logger.warn('Room price element not found in room', { estimateId, roomId });
    }

    // Update estimate totals if needed
    this.dataService.getEstimate(estimateId)
      .then(estimate => {
        // Update the estimate total in the UI
        const estimateItem = document.querySelector(`.estimate-item[data-estimate-id="${estimateId}"]`);
        if (estimateItem) {
          const estimateTotalElement = estimateItem.querySelector('.estimate-total-value');
          if (estimateTotalElement) {
            estimateTotalElement.textContent = format.currency(estimate.total || 0);
          }
        }
      })
      .catch(error => {
        logger.error('Error updating estimate totals:', error);
      });
  }

  /**
   * Update room header elements (primary product image and name) without re-rendering the entire room
   * This reuses the same logic as renderRoom for determining primary product
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   */
  updateRoomPrimaryProduct(estimateId, roomId) {
    logger.log('Updating room primary product display', { estimateId, roomId });
    
    // Get the room data from storage
    const estimateData = loadEstimateData();
    const estimate = estimateData.estimates?.[estimateId];
    const room = estimate?.rooms?.[roomId];
    
    if (!room) {
      logger.warn('Room not found in storage for primary product update', { estimateId, roomId });
      return;
    }
    
    // Find the room element in the DOM
    const roomElement = document.querySelector(`.room-item[data-room-id="${roomId}"][data-estimate-id="${estimateId}"]`);
    
    if (!roomElement) {
      logger.warn('Room element not found in DOM for primary product update', { estimateId, roomId });
      return;
    }
    
    // Use the same logic as renderRoom to determine primary product
    let primaryProductImage = null;
    let primaryProductName = null;
    
    logger.log('Looking for primary product in room:', {
      roomName: room.name,
      primaryCategoryProductId: room.primary_category_product_id,
      productsObject: room.products,
      productsKeys: room.products ? Object.keys(room.products) : []
    });
    
    if (room.primary_category_product_id && room.products) {
      const primaryProduct = room.products[room.primary_category_product_id];
      if (primaryProduct) {
        primaryProductImage = primaryProduct.image || null;
        primaryProductName = primaryProduct.name || null;
        logger.log('Primary product found:', {
          productId: room.primary_category_product_id,
          image: primaryProductImage,
          name: primaryProductName
        });
      }
    }
    
    // Update primary product image element
    const imageElement = roomElement.querySelector('.primary-product-image');
    if (imageElement) {
      if (primaryProductImage) {
        imageElement.src = primaryProductImage;
        imageElement.style.display = '';
      } else {
        // Use placeholder and hide via display none
        imageElement.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        imageElement.style.display = 'none';
      }
    }
    
    // Update primary product name element
    const nameElement = roomElement.querySelector('.primary-product-name');
    if (nameElement) {
      nameElement.textContent = primaryProductName || '';
      // The template uses data-visible-if which should handle visibility,
      // but we'll also set display for immediate effect
      nameElement.style.display = primaryProductName ? '' : 'none';
    }
    
    logger.log('Room primary product display updated', {
      hasPrimaryProduct: !!primaryProductImage,
      primaryProductName: primaryProductName
    });
  }

  /**
   * Called when the modal is closed
   */
  onModalClosed() {
    logger.log('RoomManager: Modal closed');
    // Clean up any resources or state as needed
    this.currentEstimateId = null;
    this.currentProductId = null;
  }


  /**
   * Update room includes (called when products are added/removed)
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   */
  updateRoomIncludes(estimateId, roomId) {
    logger.log('Updating room includes', { estimateId, roomId });

    // Find the room element
    const roomElement = document.querySelector(`.room-item[data-room-id="${roomId}"][data-estimate-id="${estimateId}"]`);
    
    if (!roomElement) {
      logger.warn('Room element not found for updating includes', { estimateId, roomId });
      return;
    }

    // Get the current room data from storage
    const estimateData = loadEstimateData();
    const estimate = estimateData.estimates?.[estimateId];
    const room = estimate?.rooms?.[roomId];
    
    if (!room) {
      logger.warn('Room not found in storage for includes update', { estimateId, roomId });
      return;
    }

    // Re-render the includes with updated room data
    const includesData = this.aggregateProductIncludes(room);
    this.renderRoomIncludes(includesData, roomElement, roomId, estimateId);
    
    // Re-render the upgrades with updated room data  
    this.renderRoomUpgrades(room, roomElement);
    
    // If the room has products now, make sure similar products section is visible
    if (room.products && Object.keys(room.products).length > 0) {
      const similarProductsToggle = roomElement.querySelector('.similar-products-toggle');
      const similarProductsContainer = roomElement.querySelector('.similar-products-container');
      
      if (similarProductsToggle) {
        similarProductsToggle.style.display = '';
        // Make sure it's expanded by default
        similarProductsToggle.classList.add('expanded');
        const toggleIcon = similarProductsToggle.querySelector('.toggle-icon');
        if (toggleIcon) {
          toggleIcon.classList.remove('dashicons-arrow-down-alt2');
          toggleIcon.classList.add('dashicons-arrow-up-alt2');
        }
      }
      if (similarProductsContainer) {
        similarProductsContainer.style.display = '';
        // Make sure it's expanded by default
        similarProductsContainer.classList.add('visible');
      }
    }
    
    // Also update similar products since product list changed
    // Force refresh if this is the first product in the room to ensure we get data from server
    const isFirstProduct = room.products && Object.keys(room.products).length === 1;
    this.initializeSimilarProductsForRoom(estimateId, roomId, isFirstProduct);
  }
  
  /**
   * Initialize similar products for a room
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   * @param {boolean} forceRefresh - Whether to force refresh from server even if data exists
   */
  initializeSimilarProductsForRoom(estimateId, roomId, forceRefresh = false) {
    logger.log('Initializing similar products for room', { estimateId, roomId, forceRefresh });
    
    // Load the room data from localStorage
    const estimateData = loadEstimateData();
    const room = estimateData.estimates?.[estimateId]?.rooms?.[roomId];
    
    if (!room) {
      logger.warn('Room not found for similar products initialization');
      return;
    }
    
    // Get all product IDs from the room
    const productIds = Object.keys(room.products || {});
    
    if (productIds.length === 0) {
      logger.log('No products in room, skipping similar products initialization');
      // Hide the similar products section if no products
      const roomElement = document.querySelector(`.room-item[data-room-id="${roomId}"]`);
      if (roomElement) {
        const toggleButton = roomElement.querySelector('.similar-products-toggle');
        const container = roomElement.querySelector('.similar-products-container');
        
        if (toggleButton) {
          toggleButton.style.display = 'none';
        }
        if (container) {
          container.classList.remove('visible');
        }
      }
      return;
    }
    
    // Check if room element is in DOM
    const roomElement = document.querySelector(`.room-item[data-room-id="${roomId}"]`);
    if (!roomElement) {
      logger.warn('Room element not found in DOM, deferring similar products initialization');
      // Defer initialization using setTimeout to allow DOM to render
      setTimeout(() => {
        this.initializeSimilarProductsForRoom(estimateId, roomId, forceRefresh);
      }, 100);
      return;
    }
    
    // Calculate room area for pricing calculations
    const roomArea = room.width * room.length;
    
    // Load similar products for all products in the room
    this.loadSimilarProductsForRoom(estimateId, roomId, productIds, roomArea, forceRefresh);
  }
  
  /**
   * Load similar products for all products in a room
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   * @param {Array} productIds - Array of product IDs in the room
   * @param {number} roomArea - The room area
   * @param {boolean} forceRefresh - Whether to force refresh from server
   */
  loadSimilarProductsForRoom(estimateId, roomId, productIds, roomArea, forceRefresh = false) {
    logger.log('Loading similar products for room', { estimateId, roomId, productIds, roomArea, forceRefresh });
    
    // Get the room element
    const roomElement = document.querySelector(`.room-item[data-room-id="${roomId}"]`);
    if (!roomElement) {
      logger.warn('Room element not found in DOM');
      return;
    }
    
    const similarProductsContainer = roomElement.querySelector('.similar-products-list');
    const toggleButton = roomElement.querySelector('.similar-products-toggle');
    
    if (!similarProductsContainer) {
      logger.warn('Similar products container not found in room element');
      return;
    }
    
    // Load the room data from localStorage to check if similar products are already available
    const estimateData = loadEstimateData();
    const room = estimateData.estimates?.[estimateId]?.rooms?.[roomId];
    
    // First try to collect similar products from localStorage
    const allSimilarProducts = [];
    const productsMissingSimilar = [];
    
    productIds.forEach(productId => {
      const product = room?.products?.[productId];
      
      logger.log(`Processing product ${productId}:`, {
        hasProduct: !!product,
        hasSimilarProducts: !!product?.similar_products,
        similarProductsType: Array.isArray(product?.similar_products) ? 'array' : typeof product?.similar_products,
        forceRefresh: forceRefresh
      });
      
      // Check if this product has similar products already stored and we're not forcing refresh
      if (product?.similar_products && !forceRefresh) {
        const similarProductsArray = Array.isArray(product.similar_products) 
          ? product.similar_products 
          : Object.values(product.similar_products);
          
        // Add the source product ID to each similar product for replacement tracking
        const enhancedSimilarProducts = similarProductsArray.map(sp => ({
          ...sp,
          sourceProductId: productId // The product these suggestions are for
        }));
        allSimilarProducts.push(...enhancedSimilarProducts);
        logger.log(`Found ${similarProductsArray.length} similar products for product ${productId} in localStorage`);
      } else {
        // Product doesn't have similar products stored or we're forcing refresh
        productsMissingSimilar.push(productId);
        if (forceRefresh) {
          logger.log(`Forcing refresh of similar products for product ${productId}`);
        } else if (!product) {
          logger.log(`Product ${productId} not found in room data`);
        } else {
          logger.log(`Product ${productId} has no similar products in localStorage`);
        }
      }
    });
    
    // If we found all similar products in localStorage and not forcing refresh, render them immediately
    if (productsMissingSimilar.length === 0 && allSimilarProducts.length > 0 && !forceRefresh) {
      logger.log('All similar products found in localStorage, rendering immediately');
      
      // Remove duplicates by product ID
      const uniqueProducts = {};
      allSimilarProducts.forEach(product => {
        if (!uniqueProducts[product.id]) {
          uniqueProducts[product.id] = product;
        }
      });
      
      const similarProductsList = Object.values(uniqueProducts);
      this.renderSimilarProductsList(similarProductsContainer, toggleButton, similarProductsList, estimateId, roomId, productIds, roomElement);
      return;
    }
    
    // Show loading state only if we need to fetch some products
    if (productsMissingSimilar.length > 0) {
      similarProductsContainer.innerHTML = '<div class="loading">Loading similar products...</div>';
    }
    
    // Fetch only the products that don't have similar products in localStorage
    const similarProductPromises = [];
    
    productsMissingSimilar.forEach(productId => {
      const promise = this.dataService.getSimilarProducts(productId, roomArea)
        .then(similarProducts => {
          logger.log(`Received ${similarProducts.length} similar products for product ${productId} from server`);
          // Add the source product ID to each similar product for replacement tracking
          const enhancedSimilarProducts = similarProducts.map(sp => ({
            ...sp,
            sourceProductId: productId // The product these suggestions are for
          }));
          allSimilarProducts.push(...enhancedSimilarProducts);
        })
        .catch(error => {
          logger.error(`Error loading similar products for product ${productId}:`, error);
        });
      
      similarProductPromises.push(promise);
    });
    
    // Wait for all requests to complete
    Promise.all(similarProductPromises)
      .then(() => {
        // Remove duplicates by product ID
        const uniqueProducts = {};
        allSimilarProducts.forEach(product => {
          if (!uniqueProducts[product.id]) {
            uniqueProducts[product.id] = product;
          }
        });
        
        const similarProductsList = Object.values(uniqueProducts);
        
        // Use the extracted rendering method
        this.renderSimilarProductsList(similarProductsContainer, toggleButton, similarProductsList, estimateId, roomId, productIds, roomElement);
      })
      .catch(error => {
        logger.error('Error loading similar products:', error);
        similarProductsContainer.innerHTML = '<div class="error">Failed to load similar products</div>';
      });
  }

  /**
   * Render similar products list
   * @param {HTMLElement} similarProductsContainer - The container for similar products
   * @param {HTMLElement} toggleButton - The toggle button element
   * @param {Array} similarProductsList - The list of similar products to render
   * @param {string} estimateId - The estimate ID
   * @param {string} roomId - The room ID
   * @param {Array} productIds - Array of product IDs in the room
   * @param {HTMLElement} roomElement - The room element
   */
  renderSimilarProductsList(similarProductsContainer, toggleButton, similarProductsList, estimateId, roomId, productIds, roomElement) {
    if (similarProductsList.length === 0) {
      // No similar products found
      similarProductsContainer.innerHTML = '<div class="no-similar-products">No similar products available</div>';
      
      // Hide the toggle button and container
      if (toggleButton) {
        toggleButton.style.display = 'none';
      }
      // Remove visible class from container
      const container = roomElement.querySelector('.similar-products-container');
      if (container) {
        container.classList.remove('visible');
      }
      return;
    }
    
    // Clear loading state
    similarProductsContainer.innerHTML = '';
    
    // Render each similar product
    similarProductsList.forEach((product) => {
      // Add room context to product data and ensure all required fields
      const productData = {
        ...product,
        id: product.id || product.product_id,
        product_id: product.id || product.product_id,
        estimate_id: estimateId,
        room_id: roomId,
        // Map fields from different possible structures
        name: product.name || product.product_name || 'Similar Product',
        product_name: product.name || product.product_name || 'Similar Product',
        price: product.price || product.regular_price || 0,
        product_price: format.currency(product.price || product.regular_price || 0),
        image: product.image || product.product_image || '',
        product_img: product.image || product.product_image || '',
        pricing_method: product.pricing_method || 'sq_ft',
        replace_product_id: product.sourceProductId || productIds[0] || '', // Use source product ID or first product as fallback
      };
      
      logger.log('Rendering similar product with data:', productData);
      
      // Use TemplateEngine to insert the similar product template
      TemplateEngine.insert('similar-product-item-template', productData, similarProductsContainer);
      
      // Bind replace button event for this product
      const lastSimilarItem = similarProductsContainer.lastElementChild;
      if (lastSimilarItem) {
        const replaceButton = lastSimilarItem.querySelector('.replace-product-in-room');
        if (replaceButton) {
          replaceButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const productId = replaceButton.dataset.productId;
            const replaceProductId = replaceButton.dataset.replaceProductId;
            const roomId = replaceButton.dataset.roomId;
            const estimateId = replaceButton.dataset.estimateId;
            
            logger.log('Replace button clicked', { productId, replaceProductId, roomId, estimateId });
            
            // Delegate to ProductManager to handle replacement with variation check
            if (this.modalManager && this.modalManager.productManager) {
              // Check if product has variations before replacing
              this.modalManager.productManager.handleProductVariationSelection(productId, {
                action: 'replace',
                estimateId: estimateId,
                roomId: roomId,
                replaceProductId: replaceProductId,
                button: replaceButton
              });
            } else {
              logger.error('ProductManager not available for product replacement');
            }
          });
        }
      }
    });
    
    // Initialize carousel if needed
    const carouselContainer = roomElement.querySelector('.similar-products-carousel');
    if (carouselContainer && similarProductsList.length > 0) {
      // The SuggestionsCarousel should automatically initialize when content is added
      // But we can trigger initialization manually if needed
      if (this.modalManager.uiManager) {
        this.modalManager.uiManager.initializeCarouselInContainer(carouselContainer);
      }
    }
    
    // Make sure the toggle button is visible
    if (toggleButton) {
      toggleButton.style.display = 'block';
    }
    
    logger.log(`Rendered ${similarProductsList.length} similar products for room ${roomId}`);
  }
}

export default RoomManager;
