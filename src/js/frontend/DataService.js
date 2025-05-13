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
  getSuggestionsForRoom as getSuggestionsForRoomFromStorage
  // getEstimate, addProductToRoom - Removed unused imports
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

      if (room.products && room.products.find(product => String(product.id) === String(productId))) {
        logger.warn(`DataService: Product ID ${productId} already exists in room ${roomId} locally. Aborting.`);
        return Promise.reject({
          message: this.config.i18n.product_already_exists || 'This product already exists in the selected room.',
          data: { duplicate: true, estimate_id: estimateId, room_id: roomId }
        });
      }
    } else {
      logger.warn(`DataService: Room ID ${roomId} not found in local storage for estimate ${estimateId}. Room dimensions will be null for product data fetch.`);
    }

    const existingProductIdsInRoom = room?.products?.map(p => p.id) ?? [];
    // For fetching suggestions, send the context of products that *will be* in the room
    const allProductIdsForSuggestionContext = [...new Set([...existingProductIdsInRoom, String(productId)])];


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

        // Ensure similar_products is an array, even if it's missing or null from backend
        if (!Array.isArray(comprehensiveProductData.similar_products)) {
          comprehensiveProductData.similar_products = [];
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
    // This step is non-blocking - errors will be logged but won't affect the UI
    localStoragePromise
      .then(localResult => {
        // Check for critical errors from product data fetch
        if (!localResult.success) {
          if (localResult.critical) {
            // This is a critical error - show a visible error message to the user
            // Here we're using the console.error for visibility, but in a real app
            // you might want to show a modal dialog or other UI element
            const errorMsg = localResult.error?.message || 'Critical error: Unable to add product to room.';
            logger.error('CRITICAL ERROR:', errorMsg);
            
            // This should be replaced with your app's error display mechanism
            if (typeof window.productEstimatorShowError === 'function') {
              window.productEstimatorShowError(errorMsg);
            } else if (typeof window.alert === 'function') {
              window.alert(`Error: ${errorMsg}`);
            }
            
            // Propagate the error so the UI can handle it
            throw new Error(errorMsg);
          }
          
          // Non-critical error
          logger.warn('Local storage update failed, skipping asynchronous server request for adding product to session.');
          return Promise.resolve({ 
            server_request_skipped: true, 
            local_error: localResult.error 
          });
        }
        
        // If successful, proceed with server sync
        logger.log('DataService: Local storage update successful, sending asynchronous server request for adding product to session.');
        const requestData = {
          room_id: String(roomId),
          product_id: String(productId),
        };
        if (estimateId !== null) {
          requestData.estimate_id = String(estimateId);
        }
        
        // Try to send to server, but don't let failures block the UI
        return this.ajaxService.addProductToRoom(requestData)
          .catch(error => {
            // Log the error but swallow it to keep the promise chain going
            logger.error('Error sending product to server, but continuing with local data:', error);
            logger.warn('Product added to local storage only. Changes may not persist between sessions.');
            return { server_request_skipped: true, error_message: error.message };
          });
      })
      .then(serverData => {
        if (serverData && !serverData.server_request_skipped) {
          logger.log('DataService: Asynchronous server-side product add (to session) successful:', serverData);
          this.invalidateCache();
        } else if (serverData && serverData.server_request_skipped) {
          // Soft-fail: Just log but let the UI continue working with local data
          logger.warn('Using local data only - server sync skipped or failed');
        }
      })
      .catch(serverError => {
        // This will now catch and propagate critical errors
        logger.error('Error in product-to-room process:', serverError);
        // Propagate error to caller
        throw serverError;
      });

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
    if (room && Array.isArray(room.products)) {
      futureRoomProductIds = room.products.map(p => String(p.id)); // Ensure string IDs for comparison
      const oldProductStringId = String(oldProductId);
      const oldProductIdx = futureRoomProductIds.indexOf(oldProductStringId);

      if (oldProductIdx > -1) {
        futureRoomProductIds.splice(oldProductIdx, 1, String(newProductId)); // Replace old with new
      } else {
        // If oldProductId wasn't in the main list (e.g., an additional_product not directly in room.products)
        // still add the newProductId to ensure it's considered for suggestions.
        futureRoomProductIds.push(String(newProductId));
      }
    } else {
      futureRoomProductIds.push(String(newProductId));
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

    const existingData = loadEstimateData();
    const existingEstimates = existingData.estimates || {};
    // Use the count of existing estimates as the next sequential ID for local storage
    const nextSequentialId = Object.keys(existingEstimates).length;

    // Create a basic estimate object for local storage with the sequential ID
    const clientSideEstimateData = {
      id: String(nextSequentialId), // Ensure ID is a string for consistency
      name: estimateName,
      rooms: {}, // Start with an empty rooms object
      // Add any other default properties needed for a new estimate client-side
    };

    // Add the estimate to local storage immediately
    const clientSideEstimateId = addEstimate(clientSideEstimateData);
    logger.log(`Client-side estimate saved to localStorage with sequential ID: ${clientSideEstimateId}`);

    // Make the AJAX request to the server asynchronously
    this.ajaxService.addNewEstimate(requestData)
      .then(serverData => {
        logger.log('DataService: Server-side estimate creation successful:', serverData);
        // Invalidate caches since we modified data on the server
        this.invalidateCache();

        // You might want to update the client-side estimate with the server-assigned ID
        // if the server returns one and it's different from the sequential client-side ID.
        // Example: if (serverData.estimate_id && serverData.estimate_id !== clientSideEstimateId) {
        //   updateEstimateIdInStorage(clientSideEstimateId, serverData.estimate_id);
        // }

        // Trigger an event that ModalManager (or other parts of the app) can listen to
        // to know that the server-side creation is complete.
        // Example: EventBus.emit('estimateCreatedOnServer', { clientSideId: clientSideEstimateId, serverData: serverData });

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
   // In DataService.js
   
   /**
   * Create a new room.
   * If a productId is provided, it fetches data for that product (including similar products)
   * and conditionally fetches/stores room suggestions based on a feature switch, then adds
   * the product to the new room in localStorage.
   * The main promise resolves after local changes. Async calls update the server.
   * @param {FormData | object | string} formData - Form data for the new room
   * @param {string|number} estimateId - Estimate ID to add the room to
   * @param {number|null} productId - Optional product ID to add to the new room
   * @returns {Promise<object>} A promise that resolves with the new room data (and product if added).
   */
  addNewRoom(formData, estimateId, productId = null) {
    logger.log('DataService: Adding new room', {
      estimateId: estimateId,
      productId: productId,
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
        if (productId) {
          requestDataOnLocalFailure.product_id = String(productId); // Ensure string
        }
        this.ajaxService.addNewRoom(requestDataOnLocalFailure)
          .then(serverData => logger.log('DataService: Server add_new_room (after local estimate not found) response:', serverData))
          .catch(serverError => logger.error('Server add_new_room (after local estimate not found) failed:', serverError));
        reject(new Error(errorMsg));
        return;
      }

      const clientSideRoomId = String(Object.keys(estimate.rooms || {}).length);
      const roomWidth = parseFloat(formData instanceof FormData ? formData.get('room_width') : formData.room_width) || 0;
      const roomLength = parseFloat(formData instanceof FormData ? formData.get('room_length') : formData.room_length) || 0;

      const newRoomData = {
        id: clientSideRoomId,
        name: formData instanceof FormData ? formData.get('room_name') || 'Unnamed Room' : formData.room_name || 'Unnamed Room',
        width: roomWidth,
        length: roomLength,
        products: [],
        // product_suggestions: [], // Suggestions will be explicitly managed if a product is added
        min_total: 0,
        max_total: 0
      };

      addRoom(estimateId, newRoomData); // Add the basic room structure to local storage
      logger.log(`Room ID ${newRoomData.id} (empty) added to localStorage for estimate ${estimateId}`);

      // Asynchronously send the request to the server to add the room
      // This part of the server request might include the product_id if the backend handles
      // creating the room and adding the product in one step.
      let serverRequestData = {
        form_data: this.formatFormData(formData),
        estimate_id: String(estimateId)
      };
      if (productId) {
        serverRequestData.product_id = String(productId);
      }
      this.ajaxService.addNewRoom(serverRequestData)
        .then(serverData => {
          logger.log('DataService: Server-side room creation successful (potentially with product):', serverData);
          this.invalidateCache();
        })
        .catch(serverError => {
          logger.error('Server-side room creation failed:', serverError);
        });

      if (productId) {
        logger.log(`DataService: Product ID ${productId} provided for new room ${clientSideRoomId}. Fetching product data and managing suggestions.`);
        // Fetch comprehensive data for the product to be added.
        // The backend should provide 'room_suggested_products' based on this single product in the new room.
        this.ajaxService.getProductDataForStorage({
          product_id: String(productId),
          room_width: roomWidth,
          room_length: roomLength,
          room_products: [String(productId)] // Context for suggestions: just this product in the new room
        })
          .then(productDataResponse => {
            logger.log('DataService: Fetched comprehensive product data for new room product:', productDataResponse);

            if (!productDataResponse || !productDataResponse.product_data) {
              const errorMsg = 'Failed to get comprehensive product data for new room product.';
              logger.warn(`DataService: ${errorMsg}`);
              // The room is created, but product addition failed. Resolve with partial success.
              resolve({
                room_id: clientSideRoomId,
                estimate_id: estimateId,
                ...newRoomData,
                product_added_successfully: false,
                error: errorMsg
              });
              return;
            }

            const comprehensiveProductData = productDataResponse.product_data;
            let roomSuggestedProductsToStore = [];

            if (!Array.isArray(comprehensiveProductData.similar_products)) {
              comprehensiveProductData.similar_products = [];
            }

            if (window.productEstimatorVars.featureSwitches.suggested_products_enabled) {
              const rawSuggestions = productDataResponse.room_suggested_products || comprehensiveProductData.room_suggested_products || [];
              if (Array.isArray(rawSuggestions)) {
                roomSuggestedProductsToStore = rawSuggestions;
              }
              logger.log('DataService: Suggestions enabled. Processed room suggestions for new room:', roomSuggestedProductsToStore);
            } else {
              logger.log('DataService: Suggestions feature disabled. Not processing room suggestions for new room.');
            }

            if (Object.prototype.hasOwnProperty.call(comprehensiveProductData, 'room_suggested_products')) {
              delete comprehensiveProductData.room_suggested_products;
            }
            logger.log('DataService: Comprehensive product data for new room (similar_products processed):', comprehensiveProductData);

            try {
              const productAddedSuccess = addProductToRoomStorage(estimateId, clientSideRoomId, comprehensiveProductData);
              if (productAddedSuccess) {
                logger.log(`Product ID ${productId} successfully added to new room ${clientSideRoomId} in localStorage.`);

                if (window.productEstimatorVars.featureSwitches.suggested_products_enabled) {
                  replaceSuggestionsInRoomStorage(roomSuggestedProductsToStore, estimateId, clientSideRoomId);
                  logger.log(`Suggestions updated for new room ${clientSideRoomId} in localStorage.`);
                } else {
                  replaceSuggestionsInRoomStorage([], estimateId, clientSideRoomId);
                  logger.log(`Suggestions cleared for new room ${clientSideRoomId} as feature is disabled.`);
                }

                const finalEstimateData = loadEstimateData();
                const finalEstimate = finalEstimateData.estimates?.[estimateId];
                const finalRoom = finalEstimate?.rooms?.[clientSideRoomId]; // This should now contain the product

                resolve({
                  room_id: clientSideRoomId,
                  estimate_id: estimateId,
                  ...(finalRoom || newRoomData), // Use the updated room data from storage
                  product_data: comprehensiveProductData, // Data of the product added
                  product_added_successfully: true
                });
              } else {
                const errorMsg = `Failed to add product ID ${productId} to new room ${clientSideRoomId} via addProductToRoomStorage.`;
                logger.warn(`DataService: ${errorMsg}`);
                resolve({
                  room_id: clientSideRoomId,
                  estimate_id: estimateId,
                  ...newRoomData, // Room exists, but product not added
                  product_added_successfully: false,
                  error: errorMsg
                });
              }
            } catch (e) {
              const errorMsg = `Error adding product ID ${productId} to new room ${clientSideRoomId} in localStorage: ${e.message}`;
              logger.error(`DataService: ${errorMsg}`, e);
              // This is a critical failure in adding the product after room creation.
              // The room exists in local storage, but the product part failed.
              // Depending on desired behavior, could reject or resolve with error.
              // Here, we reject to signal that the 'add product to new room' part failed significantly.
              reject(new Error(errorMsg));
            }
          })
          .catch(error => { // Catches errors from this.request('get_product_data_for_storage', ...)
            const errorMsg = `DataService: Error fetching product data for new room (product ID ${productId}): ${error.message}`;
            logger.error(errorMsg, error);
            // If fetching product data fails, the product cannot be added, and suggestions are unknown.
            // Reject the promise as this part of the operation failed.
            reject(new Error(errorMsg));
          });
      } else {
        // No productId, so resolve the promise with just the new room data.
        // Suggestions are not relevant here as no product is being immediately added.
        // However, ensure the suggestions array for the new empty room is initialized if not done by `addRoom`.
        // `addRoom` should ideally create `product_suggestions: []` for the new room.
        // If not, one could call `replaceSuggestionsInRoomStorage([], estimateId, clientSideRoomId);` here too.
        // For now, assuming `addRoom` initializes it or it's implicitly empty.
        logger.log(`No product ID provided for new room ${clientSideRoomId}. Resolving with basic room data.`);
        resolve({
          room_id: clientSideRoomId,
          estimate_id: estimateId,
          ...newRoomData, // Contains `products: []`
          product_added_successfully: null // Not applicable
        });
      }
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

      if (!room || !Array.isArray(room.products)) {
        const errorMsg = 'Room or products array not found in localStorage for product removal.';
        logger.log(`[removeProductFromRoom] Error: ${errorMsg}`);
        reject(new Error(errorMsg));
        return;
      }

      const productToRemove = room.products.find(p => String(p.id) === String(productId));
      if (!productToRemove) {
        // Log warning but proceed, as removeProductFromRoomStorage will ultimately determine local removal success.
        logger.log(`[removeProductFromRoom] Warning: Product with ID ${productId} not found in room ${roomId} (localStorage) before attempting removal logic.`);
      }

      const remainingProductObjects = room.products.filter(product => String(product.id) !== String(productId));
      const remainingProductIds = remainingProductObjects.map(p => p.id);

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
        // You might need to add the estimate back to local storage if the server removal failed.
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
}

// Export the class
export default DataService;
