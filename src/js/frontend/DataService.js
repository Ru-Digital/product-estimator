/**
 * DataService.js
 *
 * Centralized service for all data operations in the Product Estimator plugin.
 * Provides a clean API for data operations and handles errors consistently.
 * Uses AjaxService for HTTP requests and EstimateStorage for local storage operations.
 */

import { createLogger } from '@utils';

import AjaxService from './AjaxService';
import {
  addEstimate, // Imports from EstimateStorage
  loadEstimateData, // Imports from EstimateStorage
  addRoom, // Imports from EstimateStorage
  removeRoom as removeRoomFromStorage, // Imports from EstimateStorage
  removeEstimate as removeEstimateFromStorage, // Imports from EstimateStorage
  addProductToRoom as addProductToRoomStorage, // Imports from EstimateStorage (Renamed to avoid conflict)
  removeProductFromRoom as removeProductFromRoomStorage, // Imports from EstimateStorage
  replaceProductInRoom as replaceProductInRoomStorage, // Imports from EstimateStorage
  addSuggestionsToRoom as replaceSuggestionsInRoomStorage,
  getSuggestionsForRoom as getSuggestionsForRoomFromStorage,
  getEstimate // Import getEstimate function
} from './EstimateStorage'; // Import necessary functions from storage

const logger = createLogger('DataService');

class DataService {
  /**
   * Initialize the DataService
   * @param {object} config - Configuration options
   */
  constructor(config = {}) {
    // Check for existing instance
    if (window._dataServiceInstance) {
      logger.log('Using existing DataService instance');
      // Return existing instance to ensure singleton
      return window._dataServiceInstance;
    }

    this.config = Object.assign({
      debug: false,
      ajaxUrl: window.productEstimatorVars?.ajax_url || '/wp-admin/admin-ajax.php',
      nonce: window.productEstimatorVars?.nonce || '',
      i18n: window.productEstimatorVars?.i18n || {}
    }, config);

    // Initialize AjaxService
    this.ajaxService = new AjaxService({
      debug: this.config.debug,
      ajaxUrl: this.config.ajaxUrl,
      nonce: this.config.nonce
    });

    // Cache for frequently accessed data
    this.cache = {
      estimatesData: null,
      estimatesList: null,
      rooms: {},
      similarProducts: {}
    };

    // Log initialization only once
    if (!window._dataServiceLogged) {
      logger.log('DataService initialized');
      window._dataServiceLogged = true;
    }

    // Store as singleton
    window._dataServiceInstance = this;
  }

  /**
   * Make an AJAX request to the WordPress backend
   * @param {string} action - WordPress AJAX action name
   * @param {object} data - Request data
   * @returns {Promise} - Promise resolving to response data
   * @deprecated Use specific action methods instead
   */
  request(action, data = {}) {
    logger.log(`[DEPRECATED] Using generic request method for '${action}'. Consider using dedicated action methods.`, data);
    return this.ajaxService._request(action, data);
  }

  /**
   * Get product variation data including available variations and attributes
   * @param {string|number} productId - The product ID to get variation data for
   * @returns {Promise<object>} Promise resolving to variation data
   */
  getProductVariationData(productId) {
    logger.log(`Getting variation data for product ID: ${productId}`);
    
    return this.ajaxService._request('product_estimator_get_product_variations', {
      product_id: productId
    })
    .then(data => {
      logger.log(`Variation data received for product ${productId}:`, data);
      return {
        isVariable: data.is_variable || false,
        productName: data.product_name || '',
        variations: data.variations || [],
        attributes: data.attributes || {}
      };
    })
    .catch(error => {
      logger.error('Error getting product variation data:', error);
      throw error;
    });
  }

  /**
   * Check if any estimates exist in the session by checking localStorage
   * @returns {Promise<boolean>} True if estimates exist
   */
  checkEstimatesExist() {
    // Return a promise for API consistency
    return new Promise((resolve) => {
      // Load estimate data from localStorage
      // This allows ModalManager to provide its own implementation by setting this.loadEstimateData
      const estimateData = this.loadEstimateData ?
        this.loadEstimateData() :
        loadEstimateData();

      // Check if there are any estimates
      const hasEstimates = estimateData &&
        estimateData.estimates &&
        Object.keys(estimateData.estimates).length > 0;

      logger.log(`Checking localStorage for estimates: ${hasEstimates ? 'Found' : 'None found'}`);

      // Resolve with the result
      resolve(hasEstimates);
    });
  }

  /**
   * Get available upgrades for a product.
   * @param {string|number} productId - The ID of the product to get upgrades for.
   * @param {string|number} estimateId - The ID of the current estimate.
   * @param {string|number} roomId - The ID of the room the product is in.
   * @param {number} roomArea - The area of the room.
   * @param {string} upgradeType - The type of upgrade (e.g., 'main', 'additional').
   * @param {boolean} bypassCache - Whether to bypass the cache.
   * @returns {Promise<Array>} - A promise resolving to an array of upgrade options.
   */
  getProductUpgrades(productId, estimateId, roomId, roomArea, upgradeType, bypassCache = false) {
    logger.log(`[DataService.getProductUpgrades] DEBUG: Called with productId: ${productId}, estimateId: ${estimateId}, roomId: ${roomId}, roomArea: ${roomArea}, upgradeType: ${upgradeType}, bypassCache: ${bypassCache}`);

    // Delegate to AjaxService which now handles its own caching
    return this.ajaxService.getProductUpgrades({
      product_id: productId,
      estimate_id: estimateId,
      room_id: roomId,
      room_area: roomArea,
      upgrade_type: upgradeType,
    }, bypassCache)
      .then(data => {
        logger.log(`[DataService.getProductUpgrades] DEBUG: Response from ajaxService.getProductUpgrades:`, data);
        if (data && Array.isArray(data.upgrades)) {
          return data.upgrades;
        } else {
          logger.warn('[getProductUpgrades] DEBUG: get_product_upgrades did not return expected data structure.', data);
          return [];
        }
      })
      .catch(error => {
        logger.error('[getProductUpgrades] DEBUG: Error fetching product upgrades:', error);
        throw error;
      });
  }

  /**
   * Get all estimates data for dropdowns by reading from localStorage.
   * Note: This function now relies on localStorage for its data source.
   * @param {boolean} bypassCache - Whether to bypass the cache (still respects cache for efficiency)
   * @returns {Promise<Array>} Array of estimate objects from localStorage
   */
  getEstimatesData(bypassCache = false) {
    // Check cache first for efficiency within the same session
    if (!bypassCache && this.cache.estimatesData) {
      logger.log('Returning cached estimates data from localStorage.');
      return Promise.resolve(this.cache.estimatesData);
    }

    logger.log('Loading estimates data from localStorage.');

    // Load data from localStorage using the imported function
    const estimateData = loadEstimateData();

    // Extract the estimates array from the loaded data structure
    // Ensure it's an array, default to empty array if structure is unexpected
    const estimatesArray = estimateData && estimateData.estimates ? Object.values(estimateData.estimates) : [];

    // Store the data in cache
    this.cache.estimatesData = estimatesArray;

    // Return the data wrapped in a resolved Promise, as the original function API expects a Promise
    return Promise.resolve(estimatesArray);
  }

  /**
   * Get a specific estimate by ID from localStorage
   * @param {string|number} estimateId - The estimate ID
   * @returns {Promise<object|null>} A promise that resolves with the estimate data or null if not found
   */
  getEstimate(estimateId) {
    logger.log(`Getting estimate ${estimateId} from localStorage.`);

    // Use the imported getEstimate function from EstimateStorage
    const estimate = getEstimate(estimateId);

    if (estimate) {
      logger.log(`Found estimate ${estimateId} in localStorage.`);
    } else {
      logger.warn(`Estimate ${estimateId} not found in localStorage.`);
    }

    // Return the estimate as a resolved promise to maintain API consistency
    return Promise.resolve(estimate);
  }

  /**
   * Get rooms for a specific estimate by reading from localStorage.
   * Note: This function now relies on localStorage for its data source.
   * @param {string|number} estimateId - Estimate ID
   * @param {boolean} bypassCache - Whether to bypass the cache (still respects cache for efficiency)
   * @returns {Promise<object>} An object containing room data from localStorage ({ has_rooms: boolean, rooms: Array })
   */
  getRoomsForEstimate(estimateId, bypassCache = false) {
    const cacheKey = `estimate_${estimateId}`;

    // Check cache first for efficiency within the same session
    if (!bypassCache && this.cache.rooms[cacheKey]) {
      logger.log(`Returning cached rooms for estimate ${estimateId} from localStorage.`);
      return Promise.resolve(this.cache.rooms[cacheKey]);
    }

    logger.log(`Loading rooms for estimate ${estimateId} from localStorage.`);

    // Load the entire estimate data structure from localStorage
    const estimateData = loadEstimateData();
    // Find the specific estimate by its ID
    const estimate = estimateData && estimateData.estimates ? estimateData.estimates[estimateId] : null;

    let roomsArray = [];
    let hasRooms = false;

    // Check if the estimate was found and if it has rooms
    if (estimate && estimate.rooms) {
      // Convert the rooms object within the estimate to an array of room objects
      roomsArray = Object.values(estimate.rooms);

      // Format room data to include a 'dimensions' string property,
      // as used by the ModalManager's dropdown population logic.
      roomsArray = roomsArray.map(room => {
        // Ensure width and length are numbers for calculation, default to 0 if missing
        const width = parseFloat(room.width) || 0;
        const length = parseFloat(room.length) || 0;

        return {
          ...room, // Keep all original room properties (id, name, products, etc.)
          // Add the 'dimensions' property
          dimensions: `${width} x ${length}`
        };
      });

      // Determine if there are any rooms after filtering/mapping
      hasRooms = roomsArray.length > 0;

      logger.log(`Found ${roomsArray.length} rooms for estimate ${estimateId} in localStorage.`);

    } else {
      logger.log(`Estimate ${estimateId} not found or has no rooms in localStorage.`);
      // No estimate or no rooms found, so hasRooms remains false and roomsArray is empty.
    }

    // Construct the response object in the format expected by ModalManager.js
    const responseData = {
      has_rooms: hasRooms,
      rooms: roomsArray
    };

    // Store the constructed data in cache for subsequent calls
    this.cache.rooms[cacheKey] = responseData;

    // Return the data wrapped in a resolved Promise to match the original function's signature
    return Promise.resolve(responseData);
  }

  /**
   * Get products for a specific room from an estimate
   * @param {string|number} estimateId - Estimate ID
   * @param {string|number} roomId - Room ID
   * @returns {Promise<Array>} - A promise that resolves with an array of products
   */
  getProductsForRoom(estimateId, roomId) {
    logger.log(`Getting products for room ${roomId} in estimate ${estimateId} from localStorage.`);

    // Load all estimate data
    const estimateData = loadEstimateData();

    // Check if the estimate and room exist
    if (!estimateData.estimates ||
        !estimateData.estimates[estimateId] ||
        !estimateData.estimates[estimateId].rooms ||
        !estimateData.estimates[estimateId].rooms[roomId]) {
      logger.warn(`Estimate ${estimateId} or room ${roomId} not found in localStorage.`);
      return Promise.resolve([]);
    }

    // Get the products from the room
    const room = estimateData.estimates[estimateId].rooms[roomId];

    // Convert products object to array for backward compatibility with consumers of this API
    let productsArray = [];
    if (room.products) {
      if (typeof room.products === 'object' && !Array.isArray(room.products)) {
        // If products is already an object with ID keys, convert to array
        productsArray = Object.values(room.products);
      } else if (Array.isArray(room.products)) {
        // If it's still an array (legacy format), use it directly
        productsArray = room.products;
      }
    }

    logger.log(`Found ${productsArray.length} products for room ${roomId} in estimate ${estimateId}.`);

    // Return the products as a resolved promise
    return Promise.resolve(productsArray);
  }


// In DataService.js

  /**
   * Add a product to a room.
   * Fetches comprehensive product data (including similar products).
   * Conditionally fetches and stores room suggestions based on a feature switch.
   * Adds product to localStorage. Sends the server request for adding product to session asynchronously.
   * @param {string|number} roomId - Room ID
   * @param {number} productId - Product ID
   * @param {string|number|null} estimateId - Optional estimate ID to ensure correct room
   * @returns {Promise<object>} A promise that resolves after attempting to add the product to localStorage.
   */
  addProductToRoom(roomId, productId, estimateId = null) {
    logger.log('DataService: Adding product to room (localStorage first)', {
      roomId: roomId,
      productId: productId,
      estimateId: estimateId
    });

    const existingData = loadEstimateData();
    const estimate = existingData.estimates ? existingData.estimates[estimateId] : null;
    const room = estimate && estimate.rooms ? estimate.rooms[roomId] : null;

    let roomWidth = null;
    let roomLength = null;

    if (room) {
      roomWidth = room.width;
      roomLength = room.length;

      if (room.products) {
        const productIdStr = String(productId);
        // Check if product exists in the room's products object
        if ((typeof room.products === 'object' && room.products[productIdStr]) ||
            (Array.isArray(room.products) && room.products.find(product => String(product.id) === productIdStr))) {
          logger.warn(`DataService: Product ID ${productId} already exists in room ${roomId} locally. Aborting.`);
          return Promise.reject({
            message: this.config.i18n.product_already_exists || 'This product already exists in the selected room.',
            data: { duplicate: true, estimate_id: estimateId, room_id: roomId }
          });
        }
        
        // Note: Primary category checking happens on the server side during the AJAX request
        // We can't check it here without the product category information and settings
      }
    } else {
      logger.warn(`DataService: Room ID ${roomId} not found in local storage for estimate ${estimateId}. Room dimensions will be null for product data fetch.`);
    }

    // Extract product IDs from room.products, which could be an object or array
    let existingProductIdsInRoom = [];
    if (room && room.products) {
      if (typeof room.products === 'object' && !Array.isArray(room.products)) {
        existingProductIdsInRoom = Object.keys(room.products);
      } else if (Array.isArray(room.products)) {
        existingProductIdsInRoom = room.products.map(p => p.id);
      }
    }
    // For fetching suggestions, send the context of products that *will be* in the room
    const allProductIdsForSuggestionContext = [...new Set([...existingProductIdsInRoom, String(productId)])];


    // Validate productId before proceeding
    if (!productId || productId === 'null' || productId === 'undefined' || productId === '0' || String(productId).trim() === '') {
      return Promise.reject(new Error('Valid product ID is required to add a product to a room'));
    }

    // STEP 1: Fetch comprehensive product data for the new product.
    // The backend ('get_product_data_for_storage') is expected to return:
    // - product_data: { ... (main product details), similar_products: [...] }
    // - room_suggested_products: [...] (suggestions for the room *with* the new product, if applicable)
    //
    // This is a CRITICAL request that must succeed - we cannot proceed with fallbacks.
    const fetchProductAndSuggestionsPromise = this.ajaxService.getProductDataForStorage({
      product_id: String(productId),
      room_width: roomWidth,
      room_length: roomLength,
      room_products: allProductIdsForSuggestionContext // Send product list including the one being added
    });

    // STEP 2: Handle local storage update using fetched data.
    const localStoragePromise = fetchProductAndSuggestionsPromise
      .then(productDataResponse => {
        logger.log('DataService: Fetched comprehensive product data response:', productDataResponse);

        // Critical validation: If getProductDataForStorage failed or returned no response
        if (!productDataResponse) {
          const errorMsg = 'Failed to get comprehensive product data from server - null/undefined response.';
          logger.error(errorMsg); // Critical error - high priority
          return {
            success: false,
            error: new Error(errorMsg),
            critical: true // Mark as critical error that should block the UI
          };
        }

        // Critical validation: If getProductDataForStorage returned no product_data
        if (!productDataResponse.product_data) {
          const errorMsg = 'Failed to get comprehensive product data from server - missing product_data property.';
          logger.error(errorMsg, productDataResponse); // Critical error - high priority
          return {
            success: false,
            error: new Error(errorMsg),
            critical: true // Mark as critical error that should block the UI
          };
        }

        // Critical validation: If this is a fallback response from a failed request
        if (productDataResponse.isFallback === true) {
          const errorMsg = `Unable to get product data from server for product ID ${productId}. This is a required server request.`;
          logger.error(errorMsg); // Critical error - high priority
          return {
            success: false,
            error: new Error(errorMsg),
            critical: true // Mark as critical error that should block the UI
          };
        }

        const comprehensiveProductData = productDataResponse.product_data;
        let roomSuggestedProductsToStore = []; // Initialize to empty

        // Check if the new product is in a primary category
        if (comprehensiveProductData.is_primary_category === true) {
          // Check existing products in the room for primary category conflicts
          const estimate = getEstimate(estimateId);
          const room = estimate && estimate.rooms && estimate.rooms[roomId];
          const existingProducts = room && room.products ? room.products : {};
          
          for (const productKey in existingProducts) {
            const existingProduct = existingProducts[productKey];
            // Skip non-product items like notes
            if (existingProduct.type === 'note') continue;
            
            if (existingProduct.is_primary_category === true) {
              // Found an existing primary category product - return conflict response
              logger.log('DataService: Primary category conflict detected. Existing product:', existingProduct.name, 'New product:', comprehensiveProductData.name);
              
              return {
                success: false,
                error: new Error('Primary category conflict - flooring product already exists in this room'),
                primaryConflict: true,
                existingProductId: existingProduct.id,
                newProductId: productId,
                roomId: roomId,
                estimateId: estimateId,
                existingProductName: existingProduct.name,
                newProductName: comprehensiveProductData.name
              };
            }
          }
        }

        // Add debug logs to see what's happening with similar_products

        // Keep similar_products in their original format (now that we've fixed the parser error)
        // This allows object formatted similar_products to be preserved
        if (!comprehensiveProductData.similar_products) {
          comprehensiveProductData.similar_products = {};
        }

        if (window.productEstimatorVars.featureSwitches.suggested_products_enabled) {
          // Only process room_suggested_products if the feature is enabled
          const rawSuggestions = productDataResponse.room_suggested_products || comprehensiveProductData.room_suggested_products || [];
          if (Array.isArray(rawSuggestions)) {
            roomSuggestedProductsToStore = rawSuggestions;
          }
          logger.log('DataService: Suggestions enabled. Processed room suggestions to be stored:', roomSuggestedProductsToStore);
        } else {
          logger.log('DataService: Suggestions feature disabled. Not processing room suggestions from response.');
        }

        // Remove room_suggested_products from comprehensiveProductData if it was part of it,
        // as it's handled separately or ignored.
        if (Object.prototype.hasOwnProperty.call(comprehensiveProductData, 'room_suggested_products')) {
          delete comprehensiveProductData.room_suggested_products;
        }
        logger.log('DataService: Comprehensive product data to be stored (similar_products processed):', comprehensiveProductData);


        try {
          // Add debug log before passing to storage

          // Add the main product (with its similar_products) to the room's product list in localStorage
          const productAddedSuccess = addProductToRoomStorage(estimateId, roomId, comprehensiveProductData);
          if (productAddedSuccess) {
            logger.log(`Product ID ${productId} (with its similar products) successfully added to room ${roomId} in localStorage.`);

            if (window.productEstimatorVars.featureSwitches.suggested_products_enabled) {
              // Store the fetched (and processed) room suggestions
              replaceSuggestionsInRoomStorage(roomSuggestedProductsToStore, estimateId, roomId);
              logger.log(`Room suggestions updated in localStorage for room ${roomId}.`);
            } else {
              // If feature is off, explicitly clear any existing suggestions for the room
              replaceSuggestionsInRoomStorage([], estimateId, roomId);
              logger.log(`Suggestions cleared for room ${roomId} as feature is disabled.`);
            }

            const updatedData = loadEstimateData(); // Reload data to get updated totals
            return {
              success: true,
              estimateData: updatedData,
              estimateId: estimateId,
              roomId: roomId,
              productData: comprehensiveProductData, // This now includes .similar_products
              estimate_totals: updatedData.estimates?.[estimateId]?.totals || { min_total: 0, max_total: 0 },
              room_totals: updatedData.estimates?.[estimateId]?.rooms?.[roomId]?.totals || { min_total: 0, max_total: 0 }
            };
          } else {
            logger.warn(`DataService: Failed to add product ID ${productId} to room ${roomId} in localStorage via addProductToRoomStorage.`);
            return { success: false, error: new Error('Failed to add to local storage (product might exist or storage function failed).') };
          }
        } catch (e) {
          logger.error(`DataService: Error adding comprehensive product ID ${productId} to room ${roomId} in localStorage:`, e);
          return { success: false, error: e };
        }
      })
      .catch(error => {
        logger.error('Error fetching comprehensive product data or processing local storage for addProductToRoom:', error);
        return { success: false, error: error }; // Propagate error
      });

    // STEP 3: Make the asynchronous server request for session update ONLY if local storage succeeded.
    // This step is completely non-blocking - we'll fire and forget
    localStoragePromise
      .then(localResult => {
        // If not successful or critical error, just log and don't try server sync
        if (!localResult.success) {
          if (localResult.critical) {
            // This is a critical error - show a visible error message to the user
            const errorMsg = localResult.error?.message || 'Critical error: Unable to add product to room.';
            logger.error('CRITICAL ERROR:', errorMsg);

            // Just log for critical errors - we already returned the error to the UI via localStoragePromise
            return;
          }

          // Non-critical error - just log
          logger.warn('Local storage update failed, skipping asynchronous server request for adding product to session.');
          return;
        }

        // If successful, proceed with server sync in the background - completely detached from UI flow
        logger.log('DataService: Local storage update successful, sending asynchronous server request for adding product to session.');
        const requestData = {
          room_id: String(roomId),
          product_id: String(productId),
        };
        if (estimateId !== null) {
          requestData.estimate_id = String(estimateId);
        }

        // Fire and forget - completely detached from main flow
        setTimeout(() => {
          this.ajaxService.addProductToRoom(requestData)
            .then(serverData => {
              logger.log('DataService: Background server-side product add successful:', serverData);
              this.invalidateCache();
            })
            .catch(error => {
              // Check if this is a primary_conflict case - not an error, just expected behavior
              if (error && error.data && error.data.primary_conflict) {
                logger.log('DataService: Primary category conflict detected during background sync - this is expected');
                return;
              }
              
              // Check if this is a duplicate case - not an error, just expected behavior
              if (error && error.data && error.data.duplicate) {
                logger.log('DataService: Duplicate product detected during background sync - this is expected');
                return;
              }
              
              // For other errors, log them as actual errors
              logger.error('Background server sync error:', error);
              logger.warn('Product added to local storage only. Changes may not persist between sessions.');
            });
        }, 0);
      })
      .catch(error => {
        // Just log any errors in the fire-and-forget path - they were already propagated
        // to the UI via localStoragePromise
        logger.error('Error in background sync process:', error);
      });

    // Return just the localStorage promise - UI continues as soon as local storage is updated
    return localStoragePromise;
  }

// In DataService.js

  /**
   * Replace a product in a room with another product.
   * Fetches data for the new product (including its similar products).
   * Conditionally fetches and updates room suggestions based on a feature switch.
   * Updates localStorage. Sends a server request for session update asynchronously.
   * @param {string|number} estimateId - Estimate ID
   * @param {string|number} roomId - Room ID
   * @param {string|number} oldProductId - ID of product to replace
   * @param {string|number} newProductId - ID of new product
   * @param {string|number|null} parentProductId - ID of the parent product (if replacing additional product)
   * @param {string} replaceType - Type of replacement ('main' or 'additional_products')
   * @returns {Promise<object>} A promise that resolves after attempting to replace the product in localStorage
   * and update suggestions based on fetched data.
   */
  replaceProductInRoom(estimateId, roomId, oldProductId, newProductId, parentProductId, replaceType = 'main') {
    logger.log('DataService: Initiating product replacement (localStorage first)', {
      estimateId, roomId, oldProductId, newProductId, parentProductId, replaceType
    });

    const existingData = loadEstimateData();
    const estimate = existingData.estimates?.[estimateId];
    const room = estimate?.rooms?.[roomId];
    const roomWidth = room?.width;
    const roomLength = room?.length;

    let futureRoomProductIds = [];
    const oldProductStringId = String(oldProductId);
    const newProductStringId = String(newProductId);

    if (room && room.products) {
      if (typeof room.products === 'object' && !Array.isArray(room.products)) {
        // Object-based products
        // Get all product IDs as strings
        futureRoomProductIds = Object.keys(room.products);

        // Remove the old product ID and add the new one
        if (futureRoomProductIds.includes(oldProductStringId)) {
          futureRoomProductIds = futureRoomProductIds.filter(id => id !== oldProductStringId);
        }
        futureRoomProductIds.push(newProductStringId);
      } else if (Array.isArray(room.products)) {
        // Legacy array-based product handling
        futureRoomProductIds = room.products.map(p => String(p.id)); // Ensure string IDs for comparison
        const oldProductIdx = futureRoomProductIds.indexOf(oldProductStringId);

        if (oldProductIdx > -1) {
          futureRoomProductIds.splice(oldProductIdx, 1, newProductStringId); // Replace old with new
        } else {
          // If oldProductId wasn't in the main list (e.g., an additional_product not directly in room.products)
          // still add the newProductId to ensure it's considered for suggestions.
          futureRoomProductIds.push(newProductStringId);
        }
      }
    } else {
      futureRoomProductIds.push(newProductStringId);
    }
    futureRoomProductIds = [...new Set(futureRoomProductIds)];


    // STEP 1: Fetch comprehensive product data for the NEW product.
    // Backend ('get_product_data_for_storage') returns:
    // - product_data: { ... (new product details), similar_products: [...] }
    // - room_suggested_products: [...] (new suggestions for the room *with* the replaced product)
    const fetchProductDataPromise = this.ajaxService.getProductDataForStorage({
      product_id: String(newProductId),
      room_width: roomWidth,
      room_length: roomLength,
      room_products: futureRoomProductIds // Send the product list *after* the intended replacement
    });

    // STEP 2: Handle local storage update using fetched data.
    const localStorageAndUpdateSuggestionsPromise = fetchProductDataPromise
      .then(productDataResponse => {
        logger.log('DataService: Fetched comprehensive product data for storage (for local replacement):', productDataResponse);

        if (!productDataResponse || !productDataResponse.product_data) {
          throw new Error('Failed to fetch complete product data for local replacement.');
        }

        const comprehensiveNewProductData = productDataResponse.product_data;
        let roomSuggestedProductsToStore = []; // Initialize to empty

        // Ensure similar_products is an array on the new product data, even if missing or null from backend
        if (!Array.isArray(comprehensiveNewProductData.similar_products)) {
          comprehensiveNewProductData.similar_products = [];
        }

        if (window.productEstimatorVars.featureSwitches.suggested_products_enabled) {
          // Only process room_suggested_products if the feature is enabled
          const rawSuggestions = productDataResponse.room_suggested_products || comprehensiveNewProductData.room_suggested_products || [];
          if (Array.isArray(rawSuggestions)) {
            roomSuggestedProductsToStore = rawSuggestions;
          }
          logger.log('DataService: Suggestions enabled. Processed room suggestions to be stored for replacement:', roomSuggestedProductsToStore);
        } else {
          logger.log('DataService: Suggestions feature disabled. Not processing room suggestions from response for replacement.');
        }

        // Remove room_suggested_products key from comprehensiveNewProductData if it was part of it,
        // as it's handled separately or ignored.
        if (Object.prototype.hasOwnProperty.call(comprehensiveNewProductData, 'room_suggested_products')) {
          delete comprehensiveNewProductData.room_suggested_products;
        }
        logger.log('DataService: New product data for replacement (similar_products processed):', comprehensiveNewProductData);


        // Attempt the local storage replacement of the product itself
        const productReplacementSuccess = replaceProductInRoomStorage(
          estimateId,
          roomId,
          oldProductId,
          newProductId,
          comprehensiveNewProductData, // This is the data for the NEW product
          replaceType,
          parentProductId
        );

        if (productReplacementSuccess) {
          logger.log(`Product replacement (old ID ${oldProductId} -> new ID ${newProductId}) successful in localStorage for room ${roomId}.`);

          if (window.productEstimatorVars.featureSwitches.suggested_products_enabled) {
            // Update suggestions in localStorage for this room using the fetched suggestions
            replaceSuggestionsInRoomStorage(roomSuggestedProductsToStore, estimateId, roomId);
            logger.log(`Room suggestions updated in localStorage for room ${roomId} after product replacement.`);
          } else {
            // If feature is off, explicitly clear any existing suggestions for the room
            replaceSuggestionsInRoomStorage([], estimateId, roomId);
            logger.log(`Suggestions cleared for room ${roomId} as feature is disabled (during product replacement).`);
          }

          const updatedData = loadEstimateData(); // Reload data to get updated totals
          const updatedEstimate = updatedData.estimates?.[estimateId];
          const updatedRoom = updatedEstimate?.rooms?.[roomId];

          return {
            success: true,
            estimateData: updatedData,
            estimateId, roomId, oldProductId, newProductId,
            productData: comprehensiveNewProductData, // Data of the new product
            estimate_totals: updatedEstimate?.totals || { min_total: 0, max_total: 0 },
            room_totals: updatedRoom?.totals || { min_total: 0, max_total: 0 }
          };
        } else {
          // This means replaceProductInRoomStorage returned false
          throw new Error('Failed to replace product in local storage. Original product not found or storage function failed.');
        }
      })
      .catch(error => {
        logger.error('Error during fetch or local storage replacement attempt:', error);
        throw error; // Re-throw to be caught by the caller (e.g., ModalManager)
      });

    // STEP 3: Asynchronous server request for session update.
    localStorageAndUpdateSuggestionsPromise
      .then(localResult => {
        if (localResult.success) { // Ensure local operation was successful before calling server
          logger.log('DataService: Local storage replacement successful, sending asynchronous server request for session update.');
          const requestData = {
            estimate_id: String(estimateId),
            room_id: String(roomId),
            product_id: String(newProductId), // The ID of the new product
            replace_product_id: String(oldProductId), // The ID of the product being replaced
            replace_type: replaceType
          };
          if (parentProductId !== null && parentProductId !== undefined) { // Check for null or undefined
            requestData.parent_product_id = String(parentProductId);
          }
          return this.ajaxService.replaceProductInRoom(requestData);
        }
        // If localResult was not success (e.g. promise was rejected and caught by caller), this part is skipped.
      })
      .then(serverData => {
        if (serverData) { // Check if serverData exists (meaning request was made and potentially succeeded)
          logger.log('DataService: Asynchronous server-side product replacement (session) successful:', serverData);
          this.invalidateCache();
        }
      })
      .catch(serverError => {
        logger.error('Asynchronous server-side product replacement (session) failed:', serverError);
      });

    return localStorageAndUpdateSuggestionsPromise;
  }

  /**
   * Get similar products for a specific product.
   * Calls the 'get_similar_products' AJAX action.
   * @param {string|number} productId - The product ID to get similar products for.
   * @param {number} roomArea - The area of the room the product is in.
   * @param {boolean} bypassCache - Whether to bypass the cache.
   * @returns {Promise<Array>} Promise resolving to an array of similar product objects.
   */
  getSimilarProducts(productId, roomArea, bypassCache = false) { // Added roomArea parameter
    logger.log(`Attempting to get similar products for product ID: ${productId}, area: ${roomArea}. Cache bypass: ${bypassCache}`);

    // Prepare data to send to the backend
    const requestData = {
      product_id: productId,
      room_area: roomArea // Pass the room area to the backend
    };

    // Use the specific AjaxService method - it now handles its own caching
    return this.ajaxService.getSimilarProducts(requestData, bypassCache)
      .then(data => {
        // Assuming the backend returns an object with a 'products' key containing the array
        if (data && Array.isArray(data.products)) {
          return data.products;
        } else {
          logger.warn('get_similar_products did not return expected data structure (expected { products: [...] })', data);
          // Return an empty array if the response format is unexpected
          return [];
        }
      })
      .catch(error => {
        logger.error('Error fetching similar products:', error);
        throw error; // Re-throw the error to be handled by ModalManager
      });
  }



  /**
   * Create a new estimate
   * @param {FormData | object | string} formData - Form data
   * @param {number|null} productId - Optional product ID
   * @returns {Promise<object>} A promise that resolves immediately with the client-side estimate ID.
   * The server-side creation is handled asynchronously.
   */
  addNewEstimate(formData, productId = null) {
    let requestData = {
      form_data: this.formatFormData(formData)
    };

    if (productId) {
      requestData.product_id = productId;
    }

    const estimateName = formData instanceof FormData ? formData.get('estimate_name') : (formData.estimate_name || 'Unnamed Estimate');

    // Create a basic estimate object for local storage
    const clientSideEstimateData = {
      // Let EstimateStorage.js generate the unique ID
      name: estimateName,
      rooms: {}, // Start with an empty rooms object
      // Add any other default properties needed for a new estimate client-side
    };

    // Add the estimate to local storage immediately
    const clientSideEstimateId = addEstimate(clientSideEstimateData);
    logger.log(`Client-side estimate saved to localStorage with unique ID: ${clientSideEstimateId}`);

    // Update request data to include the client-side UUID
    requestData.estimate_uuid = clientSideEstimateId;

    // Make the AJAX request to the server asynchronously
    this.ajaxService.addNewEstimate(requestData)
      .then(serverData => {
        logger.log('DataService: Server-side estimate creation successful using client UUID:', serverData);
        // Invalidate caches since we modified data on the server
        this.invalidateCache();
      })
      .catch(serverError => {
        logger.error('Server-side estimate creation failed:', serverError);
        // Handle server-side error asynchronously, e.g., show a notification to the user.
        // You might also want to consider removing the locally created estimate if the server creation failed.
        // Example: removeEstimateFromStorage(clientSideEstimateId);
        // Example: ModalManager.showError('Failed to save estimate on server.');
      });

    // Return a new Promise that resolves immediately with the client-side estimate ID.
    // The ModalManager will use the resolution of this promise to proceed with the next step
    // based on the locally added estimate.
    return Promise.resolve({ estimate_id: clientSideEstimateId });
  }

  /**
   * Create a new room without adding products.
   * The main promise resolves after local changes. Async calls update the server.
   * @param {FormData | object | string} formData - Form data for the new room
   * @param {string|number} estimateId - Estimate ID to add the room to
   * @returns {Promise<object>} A promise that resolves with the new room data.
   */
  addNewRoom(formData, estimateId) {
    logger.log('DataService: Adding new room', {
      estimateId: estimateId,
      formData: formData instanceof FormData ? Object.fromEntries(formData) : formData
    });

    return new Promise((resolve, reject) => {
      const existingData = loadEstimateData();
      const estimate = existingData.estimates ? existingData.estimates[estimateId] : null;

      if (!estimate) {
        const errorMsg = `Estimate with ID ${estimateId} not found in local storage. Cannot add room.`;
        logger.error(`DataService: ${errorMsg}`);
        // Attempt server request for room creation anyway for consistency, but reject local promise.
        const requestDataOnLocalFailure = {
          form_data: this.formatFormData(formData),
          estimate_id: String(estimateId) // Ensure string
        };
        this.ajaxService.addNewRoom(requestDataOnLocalFailure)
          .then(serverData => logger.log('DataService: Server add_new_room (after local estimate not found) response:', serverData))
          .catch(serverError => logger.error('Server add_new_room (after local estimate not found) failed:', serverError));
        reject(new Error(errorMsg));
        return;
      }

      const roomWidth = parseFloat(formData instanceof FormData ? formData.get('room_width') : formData.room_width) || 0;
      const roomLength = parseFloat(formData instanceof FormData ? formData.get('room_length') : formData.room_length) || 0;

      const newRoomData = {
        // Let EstimateStorage.js generate the unique ID
        name: formData instanceof FormData ? formData.get('room_name') || 'Unnamed Room' : formData.room_name || 'Unnamed Room',
        width: roomWidth,
        length: roomLength,
        products: {}, // Initialize as an empty object for the new storage structure
        // product_suggestions: [], // Suggestions will be managed separately
        min_total: 0,
        max_total: 0
      };

      // Add the basic room structure to local storage (without products)
      const clientSideRoomId = addRoom(estimateId, newRoomData);
      logger.log(`Room ID ${clientSideRoomId} (empty) added to localStorage for estimate ${estimateId}`);

      // Asynchronously send the request to the server to add the room
      let serverRequestData = {
        form_data: this.formatFormData(formData),
        estimate_id: String(estimateId),
        room_uuid: clientSideRoomId // Include the client-generated UUID
      };

      this.ajaxService.addNewRoom(serverRequestData)
        .then(response => {
          logger.log('DataService: Server-side room creation successful:', response);
          this.invalidateCache();
        })
        .catch(serverError => {
          logger.error('Server-side room creation failed:', serverError);
        });

      // Resolve with the room data immediately - product addition is a separate concern
      logger.log(`Room ${clientSideRoomId} created. Resolving with basic room data.`);
      resolve({
        room_id: clientSideRoomId,
        estimate_id: estimateId,
        ...newRoomData, // Contains `products: []`
      });
    });
  }

// In DataService.js

  /**
   * Remove a product from a room.
   * Conditionally fetches new suggestions and updates localStorage based on feature switch.
   * Always attempts to remove the product from localStorage and the server session.
   * The main promise resolves after local changes.
   * An async call updates the server session.
   * @param {string|number} estimateId - Estimate ID
   * @param {string|number} roomId - Room ID
   * @param {number} productIndex - Product index in the room's products array (for backend call)
   * @param {string|number} productId - Product Id of the product being deleted (for localStorage and backend call)
   * @returns {Promise<object>} A promise that resolves after local storage updates.
   */
  removeProductFromRoom(estimateId, roomId, productIndex, productId) {
    logger.log('[removeProductFromRoom] Initiating product removal process', { estimateId, roomId, productIndex, productId });

    return new Promise((resolve, reject) => {
      const currentEstimateData = loadEstimateData();
      const estimate = currentEstimateData.estimates?.[estimateId];
      const room = estimate?.rooms?.[roomId];

      if (!room || (!room.products)) {
        const errorMsg = 'Room or products not found in localStorage for product removal.';
        logger.log(`[removeProductFromRoom] Error: ${errorMsg}`);
        reject(new Error(errorMsg));
        return;
      }

      const productIdStr = String(productId);
      let productExists = false;
      let remainingProductIds = [];

      if (typeof room.products === 'object' && !Array.isArray(room.products)) {
        // Object-based products
        productExists = !!room.products[productIdStr];
        // Get all product IDs except the one being removed
        remainingProductIds = Object.keys(room.products).filter(id => id !== productIdStr);
      } else if (Array.isArray(room.products)) {
        // Legacy array-based products
        const productToRemove = room.products.find(p => String(p.id) === productIdStr);
        productExists = !!productToRemove;
        const remainingProductObjects = room.products.filter(product => String(product.id) !== productIdStr);
        remainingProductIds = remainingProductObjects.map(p => p.id);
      }

      if (!productExists) {
        // Log warning but proceed, as removeProductFromRoomStorage will ultimately determine local removal success.
        logger.log(`[removeProductFromRoom] Warning: Product with ID ${productId} not found in room ${roomId} (localStorage) before attempting removal logic.`);
      }

      const performProductRemovalAndResolve = (suggestionsManagedStatus) => {
        // suggestionsManagedStatus can be 'updated', 'update_failed', 'disabled', 'cleared_due_to_disabled'
        let localProductRemoved = false;
        let removalError = null;
        try {
          // removeProductFromRoomStorage should primarily use productId for removal.
          localProductRemoved = removeProductFromRoomStorage(estimateId, roomId, productIndex, productId);
          if (localProductRemoved) {
            logger.log(`[removeProductFromRoom] Product ID ${productId} reported as removed from localStorage by EstimateStorage.`);
          } else {
            // This error might occur if the product was already gone or EstimateStorage internal logic failed.
            removalError = new Error(`Failed to remove product ID ${productId} from localStorage (EstimateStorage.removeProductFromRoom returned false).`);
            logger.log(`[removeProductFromRoom] Warning: ${removalError.message}`);
          }
        } catch (e) {
          removalError = new Error(`Error during localStorage product removal for ID ${productId}: ${e.message}`);
          logger.log(`[removeProductFromRoom] Error: ${removalError.message}`, e);
        }

        // Only reject if local product removal itself critically failed AND was expected to succeed.
        // If product was already removed (localProductRemoved might be false but no error), we can proceed.
        if (removalError && !localProductRemoved) { // A true error in removal that prevented it
          reject(removalError);
          return;
        }

        const finalEstimateData = loadEstimateData();
        const finalEstimate = finalEstimateData.estimates?.[estimateId];
        const finalRoom = finalEstimate?.rooms?.[roomId];

        let successMessage = localProductRemoved ? 'Product removed locally. ' : 'Product local removal status uncertain (check logs). ';
        switch (suggestionsManagedStatus) {
          case 'updated':
            successMessage += 'Suggestions updated.';
            break;
          case 'update_failed':
            successMessage += 'Suggestion update failed (see logs).';
            break;
          case 'cleared_due_to_disabled':
            successMessage += 'Suggestions cleared (feature disabled).';
            break;
          case 'disabled':
          default:
            successMessage += 'Suggestions not managed (feature disabled).';
            break;
        }

        resolve({
          success: true, // Indicates the overall operation flow completed without critical rejection
          message: successMessage,
          estimateId: estimateId,
          roomId: roomId,
          productId: productId,
          estimate_totals: finalEstimate?.totals || { min_total: 0, max_total: 0 },
          room_totals: finalRoom?.totals || { min_total: 0, max_total: 0 }
        });

        // Asynchronous server call to remove the product from the session
        logger.log('[removeProductFromRoom] Initiating asynchronous server call to remove_product_from_room.');
        this.ajaxService.removeProductFromRoom({
          estimate_id: estimateId,
          room_id: roomId,
          product_index: productIndex, // Backend might still use this
          product_id: productId      // Also send productId to backend
        })
          .then(serverResponse => {
            logger.log('[removeProductFromRoom] Async server product removal successful:', serverResponse);
            this.invalidateCache();
          })
          .catch(serverError => {
            logger.log('[removeProductFromRoom] Async server product removal failed:', serverError);
            // Non-blocking error, local changes are already reflected.
          });
      };

      if (window.productEstimatorVars.featureSwitches.suggested_products_enabled) {
        logger.log('[removeProductFromRoom] Suggestions enabled. Fetching updated suggestions for room based on post-deletion state.');
        this.ajaxService.fetchSuggestionsForModifiedRoom({
          estimate_id: estimateId,
          room_id: roomId,
          room_product_ids_for_suggestions: JSON.stringify(remainingProductIds) // Send IDs of products that will remain
        })
          .then(suggestionResponse => {
            logger.log('[removeProductFromRoom] Successfully fetched updated suggestions:', suggestionResponse);
            if (suggestionResponse && Array.isArray(suggestionResponse.updated_suggestions)) {
              replaceSuggestionsInRoomStorage(suggestionResponse.updated_suggestions, estimateId, roomId);
              logger.log('[removeProductFromRoom] Suggestions updated in localStorage.');
              performProductRemovalAndResolve('updated');
            } else {
              logger.log('[removeProductFromRoom] No updated_suggestions array received or invalid format. Clearing local suggestions.');
              replaceSuggestionsInRoomStorage([], estimateId, roomId); // Clear if response is not as expected
              performProductRemovalAndResolve('update_failed'); // Still proceed with removal
            }
          })
          .catch(suggestionError => {
            logger.error('[removeProductFromRoom] Error fetching suggestions:', suggestionError, '. Proceeding with product removal without suggestion update.');
            // Optionally, clear suggestions in localStorage if fetching failed to avoid stale data
            replaceSuggestionsInRoomStorage([], estimateId, roomId);
            logger.log('[removeProductFromRoom] Cleared local suggestions due to fetch error.');
            performProductRemovalAndResolve('update_failed'); // Indicate suggestions were not successfully managed
          });
      } else {
        logger.log('[removeProductFromRoom] Suggestions disabled. Skipping suggestion fetch/update.');
        // Clear any existing suggestions for the room if the feature is disabled
        if (typeof replaceSuggestionsInRoomStorage === 'function') {
          replaceSuggestionsInRoomStorage([], estimateId, roomId);
          logger.log('[removeProductFromRoom] Cleared local suggestions as feature is disabled.');
          performProductRemovalAndResolve('cleared_due_to_disabled');
        } else {
          performProductRemovalAndResolve('disabled');
        }
      }
    });
  }


  /**
   * Remove a room from an estimate
   * @param {string|number} estimateId - Estimate ID
   * @param {string|number} roomId - Room ID
   * @returns {Promise<object>} A promise that resolves immediately after the local storage removal attempt.
   */
  removeRoom(estimateId, roomId) {
    logger.log('DataService: Removing room', {
      estimateId: estimateId,
      roomId: roomId
    });

    // Perform local storage removal immediately
    try {
      const success = removeRoomFromStorage(estimateId, roomId);
      if (success) {
        logger.log(`Room ID ${roomId} successfully removed from localStorage for estimate ${estimateId}`);
      } else {
        logger.warn(`Room ID ${roomId} not found in localStorage for estimate ${estimateId} during removal attempt.`);
      }
    } catch (e) {
      logger.error(`Error removing room ID ${roomId} from localStorage:`, e);
    }


    // Force string conversion for consistency
    const requestData = {
      estimate_id: String(estimateId),
      room_id: String(roomId)
    };

    // Make the AJAX request to the server asynchronously
    this.ajaxService.removeRoom(requestData)
      .then(serverData => {
        logger.log('DataService: Server-side room removal successful:', serverData);
        // Invalidate caches since we modified data on the server
        this.invalidateCache();
        // You might update local state further based on server response if needed
      })
      .catch(serverError => {
        logger.error('Server-side room removal failed:', serverError);
        // Handle server error asynchronously, e.g., notify user.
        // You might need to add the room back to local storage if the server removal failed.
      });

    // Return a promise that resolves immediately after the local removal attempt.
    // ModalManager will use this to update the UI based on the local change.
    // Note: This promise does NOT wait for the server response.
    return Promise.resolve({ success: true }); // Assuming local removal attempt was made
  }

  /**
   * Remove an entire estimate
   * @param {string|number} estimateId - Estimate ID
   * @returns {Promise<object>} Result data
   */
  removeEstimate(estimateId) {
    logger.log(`DataService: Removing estimate ${estimateId}`);

    // Perform local storage removal immediately
    try {
      const success = removeEstimateFromStorage(estimateId);
      if (success) {
        logger.log(`Estimate ID ${estimateId} successfully removed from localStorage.`);
      } else {
        logger.warn(`Estimate ID ${estimateId} not found in localStorage during removal attempt.`);
      }
    } catch (e) {
      logger.error(`Error removing estimate ID ${estimateId} from localStorage:`, e);
    }

    // Make the AJAX request to the server asynchronously
    this.ajaxService.removeEstimate({
      estimate_id: estimateId
    })
      .then(serverData => {
        logger.log(`DataService: Server-side estimate removal successful: ${estimateId}`, serverData);
        // Invalidate caches since we modified data
        this.invalidateCache();
        // You might update local state further based on server response if needed
      })
      .catch(serverError => {
        logger.error(`DataService: Server-side estimate removal failed: ${estimateId}`, serverError);
        // Handle server error asynchronously, e.g., notify user.
        // Even if server removal fails, we want to keep the estimate removed from localStorage.
      });

    // Return a promise that resolves immediately after the local removal attempt.
    // ModalManager will use this to update the UI based on the local change.
    // Note: This promise does NOT wait for the server response.
    return Promise.resolve({ success: true }); // Assuming local removal attempt was made
  }


  /**
   * Get suggested products for a room from localStorage.
   * @param {string|number} estimateId - Estimate ID
   * @param {string|number} roomId - Room ID
   * @returns {Promise<Array|null>} Array of suggested products or null if not found
   */
  getSuggestedProducts(estimateId, roomId) {
    if (!window.productEstimatorVars.featureSwitches.suggested_products_enabled) {
      logger.log(`[getSuggestedProducts] Suggestions feature is disabled. Returning null for room ${roomId}.`);
      return Promise.resolve(null); // Or Promise.resolve([])
    }
    logger.log(`Getting suggested products for room ${roomId} in estimate ${estimateId} from localStorage.`);

    // Directly use the getSuggestionsForRoom function from EstimateStorage.js
    // This function already handles loading from localStorage (productEstimatorEstimateData)
    // and returning the product_suggestions array or null.
    const suggestions = getSuggestionsForRoomFromStorage(estimateId, roomId); //

    if (suggestions) {
      logger.log(`Found suggestions for room ${roomId}:`, suggestions); //
      return Promise.resolve(suggestions); //
    } else {
      logger.log(`No suggestions found for room ${roomId} in localStorage.`); //
      return Promise.resolve(null); // Or Promise.resolve([]) if an empty array is preferred for "not found"
    }
  }

  /**
   * Get the variation estimator content
   * @param {number} variationId - Variation ID
   * @returns {Promise<object>} Result with HTML content
   */
  getVariationEstimator(variationId) {
    return this.ajaxService.getVariationEstimator({
      variation_id: variationId
    });
  }

  /**
   * Format form data into a string for AJAX requests
   * @param {FormData | object | string} formData - The form data to format
   * @returns {string} Formatted form data
   */
  formatFormData(formData) {
    if (typeof formData === 'string') {
      return formData;
    }

    if (formData instanceof FormData) {
      const params = new URLSearchParams();
      for (const [key, value] of formData.entries()) {
        params.append(key, value);
      }
      return params.toString();
    }

    // If it's an object, convert to URLSearchParams
    return new URLSearchParams(formData).toString();
  }

  /**
   * Invalidate all caches
   * @param {string|null} cacheType - Optional specific cache to invalidate
   */
  invalidateCache(cacheType = null) {
    logger.log('Invalidating caches');

    // Invalidate local in-memory cache
    if (cacheType) {
      if (Object.prototype.hasOwnProperty.call(this.cache, cacheType)) {
        if (typeof this.cache[cacheType] === 'object') {
          this.cache[cacheType] = {};
        } else {
          this.cache[cacheType] = null;
        }
      }
    } else {
      this.cache.estimatesData = null;
      this.cache.estimatesList = null;
      this.cache.rooms = {};
    }

    // Delegate to AjaxService to invalidate its cache
    this.ajaxService.invalidateCache(cacheType);
  }

  /**
   * Force reload estimates from localStorage and update cache
   * @returns {object} Raw estimates data from localStorage
   */
  refreshEstimatesCache() {
    logger.log('Refreshing estimates cache directly from localStorage');

    // Load directly from localStorage
    const storageData = loadEstimateData();

    // Update the cache with the fresh data
    if (storageData && storageData.estimates) {
      // Convert the object of estimates to an array for the cache
      this.cache.estimatesData = Object.values(storageData.estimates);
      logger.log(`Refreshed cache with ${this.cache.estimatesData.length} estimates`);
    } else {
      // Reset the cache if no data found
      this.cache.estimatesData = [];
      logger.log('No estimates found in localStorage during refresh');
    }

    // Return the raw data
    return storageData;
  }
}

// Export the class
export default DataService;
