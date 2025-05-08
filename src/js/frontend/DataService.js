/**
 * DataService.js
 *
 * Centralized service for all AJAX operations in the Product Estimator plugin.
 * Provides a clean API for data operations and handles errors consistently.
 */

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
  getEstimate, addProductToRoom // Imports from EstimateStorage
} from './EstimateStorage'; // Import necessary functions from storage

import { createLogger } from '@utils';
const logger = createLogger('EstimateStorage');

class DataService {
  /**
   * Initialize the DataService
   * @param {Object} config - Configuration options
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
   * @param {Object} data - Request data
   * @returns {Promise} - Promise resolving to response data
   */
  request(action, data = {}) {
    logger.log(`Making request to '${action}'`, data);

    return new Promise((resolve, reject) => {
      const formData = new FormData();

      // Add required fields
      formData.append('action', action);
      formData.append('nonce', this.config.nonce);

      // Add all other data
      Object.entries(data).forEach(([key, value]) => {
        // Skip null or undefined values
        if (value === null || value === undefined) {
          return;
        }

        // Ensure all values are converted to strings for consistent server-side handling
        formData.append(key, String(value));
      });

      // Debug the request data
      if (this.config.debug) {
        logger.log('Request details:', {
          url: this.config.ajaxUrl,
          action: action,
          nonce: this.config.nonce,
          data: Object.fromEntries(formData)
        });
      }

      fetch(this.config.ajaxUrl, {
        method: 'POST',
        credentials: 'same-origin',
        body: formData
      })
        .then(response => {
          if (!response.ok) {
            // Log more details about the failed response
            logger.error(`Network response error (${response.status}): ${response.statusText}`);
            throw new Error(`Network response was not ok: ${response.status}`);
          }
          return response.json();
        })
        .then(response => {
          if (response.success) {
            logger.log(`Request '${action}' succeeded:`, response.data);
            resolve(response.data);
          } else {
            const error = new Error(response.data?.message || 'Unknown error');
            error.data = response.data;
            logger.log(`Request '${action}' failed:`, error);
            reject(error);
          }
        })
        .catch(error => {
          logger.log(`Request '${action}' error:`, error);
          // Create a more informative error that won't cause null.prepend errors
          const enhancedError = new Error(`AJAX request failed: ${error.message}`);
          enhancedError.originalError = error;
          enhancedError.action = action;
          reject(enhancedError);
        });
    });
  }

  /**
   * Check if any estimates exist in the session by checking localStorage
   * @param {boolean} bypassCache - Whether to bypass the cache
   * @returns {Promise<boolean>} True if estimates exist
   */
  checkEstimatesExist(bypassCache = false) {
    // Return a promise for API consistency
    return new Promise((resolve) => {
      // Load estimate data from localStorage
      const estimateData = this.loadEstimateData ?
        this.loadEstimateData() :
        loadEstimateData(); // Use whatever function is available

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
    const cacheKey = `upgrades_${productId}_${estimateId}_${roomId}_${upgradeType}`;

    // Initialize this.cache.productUpgrades if it's undefined
    this.cache.productUpgrades = this.cache.productUpgrades || {};

    if (!bypassCache && this.cache.productUpgrades[cacheKey]) {
      logger.log(`[DataService.getProductUpgrades] DEBUG: Returning cached upgrades for product ${productId}.`);
      return Promise.resolve(this.cache.productUpgrades[cacheKey]);
    }

    logger.log(`[DataService.getProductUpgrades] DEBUG: Fetching product upgrades from server for product ${productId}. Calling this.request('get_product_upgrades', ...).`);
    return this.request('get_product_upgrades', {
      product_id: productId,
      estimate_id: estimateId,
      room_id: roomId,
      room_area: roomArea,
      upgrade_type: upgradeType,
    })
      .then(data => {
        logger.log(`[DataService.getProductUpgrades] DEBUG: Response from this.request for 'get_product_upgrades':`, data);
        if (data && Array.isArray(data.upgrades)) {
          this.cache.productUpgrades[cacheKey] = data.upgrades;
          return data.upgrades;
        } else {
          logger.warn('[getProductUpgrades] DEBUG: get_product_upgrades did not return expected data structure.', data);
          return [];
        }
      })
      .catch(error => {
        logger.error('[getProductUpgrades] DEBUG: Error fetching product upgrades:', error);
        // this.cache.productUpgrades is already initialized
        delete this.cache.productUpgrades[cacheKey];
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
   * @param {number|null} productId - Optional product ID (kept for potential future local logic, but not used for fetching here)
   * @param {boolean} bypassCache - Whether to bypass the cache (still respects cache for efficiency)
   * @returns {Promise<Object>} An object containing room data from localStorage ({ has_rooms: boolean, rooms: Array })
   */
  getRoomsForEstimate(estimateId, productId = null, bypassCache = false) {
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
   * Add a product to a room.
   * Fetches comprehensive product data (now including similar products directly from the backend)
   * and adds to localStorage. Sends the server request for adding product to session asynchronously.
   * This function also updates room suggestions based on the backend response.
   * @param {string|number} roomId - Room ID
   * @param {number} productId - Product ID
   * @param {string|number|null} estimateId - Optional estimate ID to ensure correct room
   * @returns {Promise<Object>} A promise that resolves after attempting to add the product to localStorage.
   */
  addProductToRoom(roomId, productId, estimateId = null) {
    logger.log('DataService: Adding product to room (localStorage first)', {
      roomId: roomId,
      productId: productId,
      estimateId: estimateId
    });

    // Load existing data to check for duplicates and get room dimensions
    const existingData = loadEstimateData();
    const estimate = existingData.estimates ? existingData.estimates[estimateId] : null;
    const room = estimate && estimate.rooms ? estimate.rooms[roomId] : null;

    let roomWidth = null;
    let roomLength = null;

    if (room) {
      roomWidth = room.width;
      roomLength = room.length;

      // Check if product already exists locally
      if (room.products && room.products.find(product => product.id == productId)) {
        logger.warn(`DataService: Product ID ${productId} already exists in room ${roomId} locally. Aborting.`);
        return Promise.reject({
          message: this.config.i18n.product_already_exists || 'This product already exists in the selected room.',
          data: { duplicate: true, estimate_id: estimateId, room_id: roomId }
        });
      }
    } else {
      logger.warn(`DataService: Room ID ${roomId} not found in local storage for estimate ${estimateId}. Room dimensions will be null for product data fetch.`);
    }

    // Prepare product IDs for the backend to calculate suggestions
    // This should include the product being added.
    const existingProductIdsInRoom = room?.products?.map(p => p.id) ?? [];
    const allProductIdsForRequestContext = [...new Set([...existingProductIdsInRoom, productId])]; // Ensure unique IDs and include the new one


    // STEP 1: Fetch comprehensive product data for the new product.
    // The backend ('get_product_data_for_storage') is expected to return:
    // - product_data: { ... (main product details), similar_products: [...] }
    // - room_suggested_products: [...] (suggestions for the room *with* the new product)
    const fetchProductAndSimilarDataAndSuggestionsPromise = this.request('get_product_data_for_storage', {
      product_id: productId,
      room_width: roomWidth,
      room_length: roomLength,
      room_products: allProductIdsForRequestContext // Send product list including the one being added
    });

    // STEP 2: Handle local storage update using fetched data.
    const localStoragePromise = fetchProductAndSimilarDataAndSuggestionsPromise
      .then(productDataResponse => {
        logger.log('DataService: Fetched comprehensive product data (including similar and room suggestions):', productDataResponse);

        if (!productDataResponse || !productDataResponse.product_data) {
          logger.warn('Failed to get comprehensive product data from server for local storage.');
          // If fetching comprehensive data fails, the local storage add cannot proceed as intended.
          return { success: false, error: new Error('Failed to fetch complete product data for local storage.') };
        }

        // product_data from the backend now contains the main product info AND its similar_products array
        const comprehensiveProductData = productDataResponse.product_data;

        // Ensure similar_products is an array, even if it's missing or null from backend
        if (!Array.isArray(comprehensiveProductData.similar_products)) {
          comprehensiveProductData.similar_products = [];
        }

        // Extract room_suggested_products from the response and ensure it's an array
        const roomSuggestedProducts = Array.isArray(productDataResponse.room_suggested_products) // Check top-level response
          ? productDataResponse.room_suggested_products
          : (Array.isArray(comprehensiveProductData.room_suggested_products) // Fallback to checking within product_data
            ? comprehensiveProductData.room_suggested_products
            : []);

        // Remove room_suggested_products from comprehensiveProductData if it's there, as it's handled separately
        if (comprehensiveProductData.hasOwnProperty('room_suggested_products')) {
          delete comprehensiveProductData.room_suggested_products;
        }


        logger.log('DataService: Comprehensive product data to be stored:', comprehensiveProductData);
        logger.log('DataService: Room suggestions to be stored:', roomSuggestedProducts);


        try {
          // Add the main product (with its similar_products) to the room's product list in localStorage
          const success = addProductToRoomStorage(estimateId, roomId, comprehensiveProductData);
          if (success) {
            logger.log(`Product ID ${productId} (with its similar products) successfully added to room ${roomId} in localStorage.`);

            // Update suggestions in localStorage for this room using the fetched suggestions
            replaceSuggestionsInRoomStorage(roomSuggestedProducts, estimateId, roomId);
            logger.log(`Room suggestions updated in localStorage for room ${roomId}.`);

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
            // This might happen if addProductToRoomStorage has its own checks (e.g., duplicate, though we checked above)
            logger.warn(`DataService: Failed to add product ID ${productId} to room ${roomId} in localStorage via addProductToRoomStorage.`);
            return { success: false, error: new Error('Failed to add to local storage (product might exist or storage function failed).') };
          }
        } catch (e) {
          logger.error(`DataService: Error adding comprehensive product ID ${productId} to room ${roomId} in localStorage:`, e);
          return { success: false, error: e };
        }
      })
      .catch(error => {
        // This catches errors from fetchProductAndSimilarDataAndSuggestionsPromise (the this.request call)
        logger.error('Error fetching comprehensive product data (including similar products):', error);
        return { success: false, error: error }; // Propagate error
      });

    // STEP 3: Make the asynchronous server request for session update ONLY if local storage succeeded.
    // This request is mainly for updating the PHP session.
    localStoragePromise
      .then(localResult => {
        if (localResult.success) {
          logger.log('DataService: Local storage update successful, sending asynchronous server request for adding product to session.');
          const requestData = {
            room_id: String(roomId),
            product_id: String(productId),
          };
          if (estimateId !== null) {
            requestData.estimate_id = String(estimateId);
          }
          // This request ('add_product_to_room') is for updating the PHP session with the main product.
          // It does not need to handle similar products or suggestions again as they are now part of the client-side flow.
          return this.request('add_product_to_room', requestData);
        } else {
          logger.warn('Local storage update failed, skipping asynchronous server request for adding product to session.');
          // Propagate the local error information if needed, but resolve this part of the chain.
          return Promise.resolve({ server_request_skipped: true, local_error: localResult.error });
        }
      })
      .then(serverData => {
        // This block is reached if localStoragePromise resolved with success: true
        // AND the server request ('add_product_to_room') was successful.
        if (serverData && !serverData.server_request_skipped) {
          logger.log('DataService: Asynchronous server-side product add (to session) successful:', serverData);
          this.invalidateCache(); // Invalidate caches as server state might have changed for other things
        }
      })
      .catch(serverError => {
        // This block is reached if the server request ('add_product_to_room') itself failed.
        logger.error('Asynchronous server-side product add (to session) failed:', serverError);
      });

    return localStoragePromise; // Return the promise that tracks the local storage update.
  }



  /**
   * Replace a product in a room with another product.
   * Fetches data for the new product (including new suggestions for the room)
   * and updates localStorage. Sends a server request for session update asynchronously.
   * @param {string|number} estimateId - Estimate ID
   * @param {string|number} roomId - Room ID
   * @param {string|number} oldProductId - ID of product to replace
   * @param {string|number} newProductId - ID of new product
   * @param {string|number|null} parentProductId - ID of the parent product (if replacing additional product)
   * @param {string} replaceType - Type of replacement ('main' or 'additional_products')
   * @returns {Promise<Object>} A promise that resolves after attempting to replace the product in localStorage
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

    // Determine the product list that WILL BE in the room *after* replacement.
    // This is crucial for the backend to calculate the correct new suggestions.
    let futureRoomProductIds = [];
    if (room && Array.isArray(room.products)) {
      futureRoomProductIds = room.products.map(p => p.id);
      const oldProductIdx = futureRoomProductIds.indexOf(oldProductId);
      if (oldProductIdx > -1) {
        futureRoomProductIds.splice(oldProductIdx, 1, newProductId); // Replace old with new
      } else {
        // If oldProductId wasn't in the main list (e.g., it's an additional_product not directly in room.products)
        // or if it's a 'main' replacement where oldProductId might not be found (should be rare),
        // we still add the newProductId to ensure it's considered for suggestions.
        futureRoomProductIds.push(newProductId);
      }
    } else {
      // If room or room.products doesn't exist, assume this new product will be the only one.
      futureRoomProductIds.push(newProductId);
    }
    futureRoomProductIds = [...new Set(futureRoomProductIds)]; // Ensure unique IDs


    // STEP 1: Fetch comprehensive product data for the NEW product.
    // The backend ('get_product_data_for_storage') is expected to return:
    // - product_data: { ... (new product details), similar_products: [...] }
    // - room_suggested_products: [...] (new suggestions for the room *with* the replaced product)
    //   based on the `futureRoomProductIds` sent.
    const fetchProductDataPromise = this.request('get_product_data_for_storage', {
      product_id: newProductId,
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

        // Extract room_suggested_products from the response and ensure it's an array
        const roomSuggestedProducts = Array.isArray(productDataResponse.room_suggested_products) // Check top-level response
          ? productDataResponse.room_suggested_products
          : (Array.isArray(comprehensiveNewProductData.room_suggested_products) // Fallback to checking within product_data
            ? comprehensiveNewProductData.room_suggested_products
            : []);

        // Remove room_suggested_products from comprehensiveNewProductData if it's there,
        // as it's handled separately for storage.
        if (comprehensiveNewProductData.hasOwnProperty('room_suggested_products')) {
          delete comprehensiveNewProductData.room_suggested_products;
        }

        logger.log('DataService: New product data for replacement:', comprehensiveNewProductData);
        logger.log('DataService: New room suggestions to be stored:', roomSuggestedProducts);

        // Attempt the local storage replacement of the product itself
        const productReplacementSuccess = replaceProductInRoomStorage(
          estimateId,
          roomId,
          oldProductId,
          newProductId, // newProductId is already part of comprehensiveNewProductData.id
          comprehensiveNewProductData, // This is the data for the NEW product
          replaceType,
          parentProductId
        );

        if (productReplacementSuccess) {
          logger.log(`Product replacement (old ID ${oldProductId} -> new ID ${newProductId}) successful in localStorage for room ${roomId}.`);

          // Update suggestions in localStorage for this room using the fetched suggestions
          replaceSuggestionsInRoomStorage(roomSuggestedProducts, estimateId, roomId);
          logger.log(`Room suggestions updated in localStorage for room ${roomId} after product replacement.`);

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
          // This means replaceProductInRoomStorage returned false (e.g., old product not found for replacement)
          throw new Error('Failed to replace product in local storage. Original product not found or storage function failed.');
        }
      })
      .catch(error => {
        // Catches errors from fetchProductDataPromise or errors thrown in the .then block
        logger.error('Error during fetch or local storage replacement attempt:', error);
        throw error; // Re-throw to be caught by ModalManager
      });

    // STEP 3: Asynchronous server request for session update.
    // This runs after the local storage attempt has resolved (successfully or not).
    localStorageAndUpdateSuggestionsPromise
      .then(localResult => { // localResult is the successful outcome from above
        // Only send server request if local changes were successful
        if (localResult.success) {
          logger.log('DataService: Local storage replacement successful, sending asynchronous server request for session update.');
          const requestData = {
            estimate_id: String(estimateId),
            room_id: String(roomId),
            product_id: String(newProductId), // The ID of the new product
            replace_product_id: String(oldProductId), // The ID of the product being replaced
            replace_type: replaceType
          };
          if (parentProductId !== null) {
            requestData.parent_product_id = String(parentProductId);
          }
          // This server request ('replace_product_in_room') is primarily for updating the PHP session.
          // It's assumed the backend might also do its own suggestion recalculation for the session,
          // but the client-side suggestions are already updated based on 'get_product_data_for_storage'.
          return this.request('replace_product_in_room', requestData);
        }
        // If localResult was not success, this part of the chain is skipped.
      })
      .then(serverData => {
        // This block is reached if localResult.success was true AND the server request was successful.
        logger.log('DataService: Asynchronous server-side product replacement (session) successful:', serverData);
        this.invalidateCache(); // Invalidate caches as server state might have changed
        // Note: The server response for 'replace_product_in_room' is not strictly needed
        // for client-side suggestions here if 'get_product_data_for_storage' already handled it.
      })
      .catch(serverError => {
        // This catch is for errors from the `this.request('replace_product_in_room', ...)` call
        // or if the localStorageAndUpdateSuggestionsPromise was rejected and localResult.success was not true.
        // However, if localStorageAndUpdateSuggestionsPromise rejects, its .catch will handle it first.
        // This primarily catches errors from the server-side session update.
        logger.error('Asynchronous server-side product replacement (session) failed or skipped due to local failure:', serverError);
        // Handle server-side error asynchronously (e.g., notify user non-blockingly)
      });

    return localStorageAndUpdateSuggestionsPromise; // Return the promise tracking local changes & suggestion updates
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
    const cacheKey = `similar_${productId}_area_${roomArea}`; // Include area in cache key

    // Check cache first
    if (!bypassCache && this.cache.similarProducts && this.cache.similarProducts[cacheKey]) {
      logger.log(`Returning cached similar products for product ${productId} and area ${roomArea}`);
      return Promise.resolve(this.cache.similarProducts[cacheKey]); // Returns cached data if not bypassing
    }

    logger.log(`Attempting to make 'get_similar_products' request for product ID: ${productId}, area: ${roomArea}. Cache bypass: ${bypassCache}`);

    // Prepare data to send to the backend
    const requestData = {
      product_id: productId,
      room_area: roomArea, // Pass the room area to the backend
      // You might add a limit here if the backend supports it
      // limit: 10 // Example
    };

    // Use the generic request method for the AJAX call
    return this.request('get_similar_products', requestData) // This is the call that should trigger the network request
      .then(data => {
        // Assuming the backend returns an object with a 'products' key containing the array
        if (data && Array.isArray(data.products)) {
          // Ensure this.cache.similarProducts is initialized before accessing
          this.cache.similarProducts = this.cache.similarProducts || {};
          this.cache.similarProducts[cacheKey] = data.products; // Cache the results using the updated key
          return data.products;
        } else {
          logger.warn('get_similar_products did not return expected data structure (expected { products: [...] })', data);
          // Return an empty array or throw an error if the response format is unexpected
          return [];
        }
      })
      .catch(error => {
        logger.error('Error fetching similar products:', error);
        // Clear cache for this specific product and area on error
        this.cache.similarProducts = this.cache.similarProducts || {};
        delete this.cache.similarProducts[cacheKey];
        throw error; // Re-throw the error to be handled by ModalManager
      });
  }



  /**
   * Create a new estimate
   * @param {FormData|Object|string} formData - Form data
   * @param {number|null} productId - Optional product ID
   * @returns {Promise<Object>} A promise that resolves immediately with the client-side estimate ID.
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
    this.request('add_new_estimate', requestData)
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
   * Create a new room
   * MODIFIED: Ensures the promise resolves only after a product (if provided)
   * is also added to the new room in localStorage.
   * @param {FormData|Object|string} formData - Form data
   * @param {string|number} estimateId - Estimate ID
   * @param {number|null} productId - Optional product ID to add to the new room
   * @returns {Promise<Object>} A promise that resolves with the new room data (and product if added).
   */
  addNewRoom(formData, estimateId, productId = null) {
    logger.log('DataService: Adding new room', {
      estimateId: estimateId,
      productId: productId,
      formData: formData instanceof FormData ? Object.fromEntries(formData) : formData
    });

    // Return a new promise that encapsulates the entire operation
    return new Promise((resolve, reject) => {
      const existingData = loadEstimateData();
      const estimate = existingData.estimates ? existingData.estimates[estimateId] : null;

      if (!estimate) {
        const errorMsg = `Estimate with ID ${estimateId} not found in local storage.`;
        logger.error(`DataService: Cannot add room - ${errorMsg}`);
        // Attempt server request anyway for consistency, but reject local promise
        const requestDataOnLocalFailure = {
          form_data: this.formatFormData(formData),
          estimate_id: estimateId
        };
        if (productId) {
          requestDataOnLocalFailure.product_id = productId;
        }
        this.request('add_new_room', requestDataOnLocalFailure)
          .then(serverData => logger.log('DataService: Server add_new_room succeeded despite local estimate not found:', serverData))
          .catch(serverError => logger.error('Server add_new_room failed after local estimate not found:', serverError));
        reject(new Error(errorMsg));
        return;
      }

      // Generate a client-side ID for the new room
      const clientSideRoomId = String(Object.keys(estimate.rooms || {}).length);

      const roomWidth = parseFloat(formData instanceof FormData ? formData.get('room_width') : formData.room_width) || 0;
      const roomLength = parseFloat(formData instanceof FormData ? formData.get('room_length') : formData.room_length) || 0;

      const newRoomData = {
        id: clientSideRoomId,
        name: formData instanceof FormData ? formData.get('room_name') || 'Unnamed Room' : formData.room_name || 'Unnamed Room',
        width: roomWidth,
        length: roomLength,
        products: [],
        product_suggestions: [], // Initialize suggestions array
        min_total: 0,
        max_total: 0
      };

      // Add the new room to local storage
      addRoom(estimateId, newRoomData); // This function from EstimateStorage.js adds the room
      logger.log(`Room ID ${newRoomData.id} added to localStorage for estimate ${estimateId}`);

      // Prepare data for the asynchronous server request to add the room
      let serverRequestData = {
        form_data: this.formatFormData(formData),
        estimate_id: estimateId
      };
      if (productId) {
        serverRequestData.product_id = productId;
      }

      // Asynchronously send the request to the server to add the room
      this.request('add_new_room', serverRequestData)
        .then(serverData => {
          logger.log('DataService: Server-side room creation successful:', serverData);
          this.invalidateCache();
          // Optionally update local room with server_room_id if different and necessary
        })
        .catch(serverError => {
          logger.error('Server-side room creation failed:', serverError);
          // Potentially handle rollback of local room creation or notify user
        });

      // If a productId is provided, add it to the newly created room in localStorage
      if (productId) {
        logger.log(`DataService: Product ID ${productId} provided. Fetching its data to add to new room ${clientSideRoomId}.`);
        // Fetch comprehensive data for the product
        this.request('get_product_data_for_storage', {
          product_id: productId,
          room_width: roomWidth,
          room_length: roomLength,
          // For a new room, room_products would typically be just this product
          room_products: [productId]
        })
          .then(productDataResponse => {
            logger.log('DataService: Fetched comprehensive product data for new room product:', productDataResponse);

            if (!productDataResponse || !productDataResponse.product_data) {
              const errorMsg = 'Failed to get comprehensive product data for local storage for new room product.';
              logger.warn(`DataService: ${errorMsg}`);
              // Resolve with room data but indicate product add issue, or reject if critical
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
            const roomSuggestedProducts = Array.isArray(productDataResponse.room_suggested_products)
              ? productDataResponse.room_suggested_products
              : (Array.isArray(comprehensiveProductData.room_suggested_products)
                ? comprehensiveProductData.room_suggested_products
                : []);

            if (comprehensiveProductData.hasOwnProperty('room_suggested_products')) {
              delete comprehensiveProductData.room_suggested_products;
            }

            try {
              const productAdded = addProductToRoomStorage(estimateId, clientSideRoomId, comprehensiveProductData);
              if (productAdded) {
                logger.log(`Product ID ${productId} successfully added to new room ${clientSideRoomId} in localStorage.`);
                // Also update suggestions for this new room now that the product is in it
                replaceSuggestionsInRoomStorage(roomSuggestedProducts, estimateId, clientSideRoomId);
                logger.log(`Suggestions updated for new room ${clientSideRoomId} in localStorage.`);

                // Resolve the main promise with all data
                resolve({
                  room_id: clientSideRoomId,
                  estimate_id: estimateId,
                  ...newRoomData, // Contains the products array which should now include the new product
                  product_data: comprehensiveProductData, // Include the added product's data
                  product_added_successfully: true
                });
              } else {
                const errorMsg = `Failed to add product ID ${productId} to new room ${clientSideRoomId} in localStorage (addProductToRoomStorage returned false).`;
                logger.warn(`DataService: ${errorMsg}`);
                resolve({ // Resolve, but indicate product add failure
                  room_id: clientSideRoomId,
                  estimate_id: estimateId,
                  ...newRoomData,
                  product_added_successfully: false,
                  error: errorMsg
                });
              }
            } catch (e) {
              const errorMsg = `Error adding product ID ${productId} to new room ${clientSideRoomId} in localStorage: ${e.message}`;
              logger.error(`DataService: ${errorMsg}`, e);
              reject(new Error(errorMsg)); // Reject if critical error during product add
            }
          })
          .catch(error => {
            const errorMsg = `DataService: Error fetching product data for new room: ${error.message}`;
            logger.error(errorMsg, error);
            // Decide if this is a critical failure. If so, reject.
            // Otherwise, resolve with room data but indicate product add failure.
            reject(new Error(errorMsg));
          });
      } else {
        // No productId, so resolve the promise with just the new room data
        logger.log(`No product ID provided for new room. Resolving with room data only.`);
        resolve({
          room_id: clientSideRoomId,
          estimate_id: estimateId,
          ...newRoomData,
          product_added_successfully: null // Neither success nor failure, as no product was to be added
        });
      }
    });
  }

// Inside DataService.js
  /**
   * Remove a product from a room.
   * First, fetches new suggestions based on the room's state *after* removal
   * (sending only the IDs of remaining products).
   * Then, updates localStorage with new suggestions and removes the product (by Product ID).
   * The main promise resolves after local changes.
   * An async call updates the server session (potentially using productIndex).
   * @param {string|number} estimateId - Estimate ID
   * @param {string|number} roomId - Room ID
   * @param {number} productIndex - Product index in the room's products array (for backend call)
   * @param {string|number} productId - Product Id of the product being deleted (for localStorage and backend call)
   * @returns {Promise<Object>} A promise that resolves after local storage updates.
   */
  removeProductFromRoom(estimateId, roomId, productIndex, productId) {
    logger.log('[removeProductFromRoom] Initiating product removal process', { estimateId, roomId, productIndex, productId }); // Log all received params

    return new Promise((resolve, reject) => {
      const currentEstimateData = loadEstimateData();
      const estimate = currentEstimateData.estimates?.[estimateId];
      const room = estimate?.rooms?.[roomId];

      if (!room || !Array.isArray(room.products)) { // Simplified check
        const errorMsg = 'Room or products array not found in localStorage for suggestion fetching or removal.';
        logger.log(`[removeProductFromRoom] Error: ${errorMsg}`);
        reject(new Error(errorMsg));
        return;
      }

      const productToRemove = room.products.find(p => String(p.id) === String(productId));
      if (!productToRemove) {
        const errorMsg = `Product with ID ${productId} not found in room ${roomId} (localStorage) prior to suggestion fetching.`;
        logger.log(`[removeProductFromRoom] Warning: ${errorMsg}`);
        // Allow to proceed to attempt removal from storage, which will also fail and log,
        // but still try to fetch suggestions based on potentially stale product list.
        // OR reject here:
        // reject(new Error(errorMsg));
        // return;
      }

      const remainingProductObjects = room.products.filter(product => String(product.id) !== String(productId));
      const remainingProductIds = remainingProductObjects.map(p => p.id);

      logger.log('[removeProductFromRoom] Fetching updated suggestions for room based on post-deletion state.');

      this.request('fetch_suggestions_for_modified_room', {
        estimate_id: estimateId,
        room_id: roomId,
        room_product_ids_for_suggestions: JSON.stringify(remainingProductIds)
      })
        .then(suggestionResponse => {
          logger.log('[removeProductFromRoom] Successfully fetched updated suggestions:', suggestionResponse);

          if (suggestionResponse && Array.isArray(suggestionResponse.updated_suggestions)) {
            replaceSuggestionsInRoomStorage(suggestionResponse.updated_suggestions, estimateId, roomId);
            logger.log('[removeProductFromRoom] Suggestions updated in localStorage.');
          } else {
            logger.log('[removeProductFromRoom] No updated_suggestions array received or invalid format. Clearing local suggestions.');
            replaceSuggestionsInRoomStorage([], estimateId, roomId);
          }

          let localProductRemoved = false;
          let removalError = null;
          try {
            // CORRECTED AND CRITICAL CALL: Pass all four arguments
            // productIndex is passed for completeness if EstimateStorage expected it,
            // but EstimateStorage will now primarily use productId for the actual removal.
            localProductRemoved = removeProductFromRoomStorage(estimateId, roomId, productIndex, productId);

            if (localProductRemoved) {
              logger.log(`[removeProductFromRoom] Product ID ${productId} reported as removed from localStorage by EstimateStorage.`);
            } else {
              // This error will now be more specific from the revised EstimateStorage if product ID wasn't found
              removalError = new Error(`Failed to remove product ID ${productId} from localStorage (EstimateStorage.removeProductFromRoom returned false).`);
              logger.log(`[removeProductFromRoom] Warning: ${removalError.message}`);
            }
          } catch (e) {
            removalError = new Error(`Error during localStorage product removal for ID ${productId}: ${e.message}`);
            logger.log(`[removeProductFromRoom] Error: ${removalError.message}`, e);
          }

          if (removalError && !localProductRemoved) { // Only reject if it truly failed and wasn't somehow removed
            reject(removalError);
            return;
          }

          const finalEstimateData = loadEstimateData();
          const finalEstimate = finalEstimateData.estimates?.[estimateId];
          const finalRoom = finalEstimate?.rooms?.[roomId];

          resolve({
            success: true, // Assuming suggestions updated and removal attempt was made
            message: localProductRemoved ? 'Product removed locally and suggestions updated.' : 'Suggestions updated; product removal from local storage might have issues (check logs).',
            estimateId: estimateId,
            roomId: roomId,
            productId: productId, // Return productId
            estimate_totals: finalEstimate?.totals || { min_total: 0, max_total: 0 },
            room_totals: finalRoom?.totals || { min_total: 0, max_total: 0 }
          });

          // Backend request still uses productIndex and productId as per its requirements
          logger.log('[removeProductFromRoom] Initiating asynchronous server call to remove_product_from_room.');
          this.request('remove_product_from_room', {
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
            });

        })
        .catch(suggestionError => {
          logger.log('[removeProductFromRoom] Error fetching suggestions before removal:', suggestionError);
          reject(new Error(`Failed to fetch updated suggestions before product removal: ${suggestionError.message}`));
        });
    });
  }


  /**
   * Remove a room from an estimate
   * @param {string|number} estimateId - Estimate ID
   * @param {string|number} roomId - Room ID
   * @returns {Promise<Object>} A promise that resolves immediately after the local storage removal attempt.
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
    const serverRequestPromise = this.request('remove_room', requestData)
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
   * @returns {Promise<Object>} Result data
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
    this.request('remove_estimate', {
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
   * @param {Array} roomProducts - Array of product objects currently in the room (Note: this parameter is no longer used for data retrieval but kept for API consistency if other parts of the application expect it)
   * @param {boolean} bypassCache - Whether to bypass the cache (Note: caching is handled by direct localStorage access, so this parameter has less direct impact here but is kept for API consistency)
   * @returns {Promise<Array|null>} Array of suggested products or null if not found
   */
  getSuggestedProducts(estimateId, roomId, roomProducts = [], bypassCache = false) {
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
   * @returns {Promise<Object>} Result with HTML content
   */
  getVariationEstimator(variationId) {
    return this.request('get_variation_estimator', {
      variation_id: variationId
    });
  }

  /**
   * Format form data into a string for AJAX requests
   * @param {FormData|Object|string} formData - The form data to format
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
   */
  invalidateCache() {
    logger.log('Invalidating caches');
    this.cache.estimatesData = null;
    this.cache.estimatesList = null;
    this.cache.rooms = {};
  }
}

// Export the class
export default DataService;
