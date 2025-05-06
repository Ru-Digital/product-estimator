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
  getEstimate, addProductToRoom // Imports from EstimateStorage
} from './EstimateStorage'; // Import necessary functions from storage

class DataService {
  /**
   * Initialize the DataService
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    // Check for existing instance
    if (window._dataServiceInstance) {
      console.log('Using existing DataService instance');
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
      suggestedProducts: {},
      similarProducts: {}
    };

    // Log initialization only once
    if (!window._dataServiceLogged) {
      this.log('DataService initialized');
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
    this.log(`Making request to '${action}'`, data);

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
        console.log('Request details:', {
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
            console.error(`Network response error (${response.status}): ${response.statusText}`);
            throw new Error(`Network response was not ok: ${response.status}`);
          }
          return response.json();
        })
        .then(response => {
          if (response.success) {
            this.log(`Request '${action}' succeeded:`, response.data);
            resolve(response.data);
          } else {
            const error = new Error(response.data?.message || 'Unknown error');
            error.data = response.data;
            this.log(`Request '${action}' failed:`, error);
            reject(error);
          }
        })
        .catch(error => {
          this.log(`Request '${action}' error:`, error);
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

      this.log(`Checking localStorage for estimates: ${hasEstimates ? 'Found' : 'None found'}`);

      // Resolve with the result
      resolve(hasEstimates);
    });
  }

  /**
   * Addmethod to consistently bind the Create Estimate button event
   */
  bindCreateEstimateButton() {
    // Find the button in the DOM
    const createButton = this.modal.querySelector('#create-estimate-btn');

    if (createButton) {
      console.log('Found Create Estimate button, binding event handler');

      // Remove any existing event handlers to prevent duplication
      if (this._createEstimateBtnHandler) {
        createButton.removeEventListener('click', this._createEstimateBtnHandler);
      }

      // Create and store a new handler
      this._createEstimateBtnHandler = (e) => {
        e.preventDefault();
        console.log('Create Estimate button clicked');
        this.showNewEstimateForm();
      };

      // Add the new handler
      createButton.addEventListener('click', this._createEstimateBtnHandler);
    }
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
      this.log('Returning cached estimates data from localStorage.');
      return Promise.resolve(this.cache.estimatesData);
    }

    this.log('Loading estimates data from localStorage.');

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
      this.log(`Returning cached rooms for estimate ${estimateId} from localStorage.`);
      return Promise.resolve(this.cache.rooms[cacheKey]);
    }

    this.log(`Loading rooms for estimate ${estimateId} from localStorage.`);

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

      this.log(`Found ${roomsArray.length} rooms for estimate ${estimateId} in localStorage.`);

    } else {
      this.log(`Estimate ${estimateId} not found or has no rooms in localStorage.`);
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
   * Adds to localStorage immediately after fetching necessary product data,
   * and sends the server request asynchronously.
   * @param {string|number} roomId - Room ID
   * @param {number} productId - Product ID
   * @param {string|number|null} estimateId - Optional estimate ID to ensure correct room
   * @returns {Promise<Object>} A promise that resolves immediately after attempting to add the product to localStorage.
   * The resolved value includes a success flag and potentially the updated local estimate data.
   */
  addProductToRoom(roomId, productId, estimateId = null) {
    console.log('DataService: Adding product to room (localStorage first)', {
      roomId: roomId,
      productId: productId,
      estimateId: estimateId
    });

    // Load existing estimate data to get room dimensions for fetching comprehensive product data
    const existingData = loadEstimateData();
    const estimate = existingData.estimates ? existingData.estimates[estimateId] : null;
    const room = estimate && estimate.rooms ? estimate.rooms[roomId] : null;

    let roomWidth = null;
    let roomLength = null;

    if (room) {
      roomWidth = room.width;
      roomLength = room.length;

      // Check for duplicate product locally BEFORE fetching comprehensive data
      if (room.products && room.products.find(product => product.id == productId)) {
        console.warn(`DataService: Product ID ${productId} already exists in room ${roomId} locally. Aborting.`);
        // Immediately reject the promise to signal duplicate and prevent any further action (including fetch and server request)
        return Promise.reject({
          message: this.config.i18n.product_already_exists || 'This product already exists in the selected room.',
          data: { duplicate: true, estimate_id: estimateId, room_id: roomId } // Include duplicate flag and relevant IDs
        });
      }

    } else {
      console.warn(`DataService: Room ID ${roomId} not found in local storage for estimate ${estimateId}. Cannot get dimensions for fetching product data.`);
      // If the room isn't found locally, we still proceed with fetching and server request,
      // as local storage might be out of sync or it's a new room being added indirectly.
    }

    // === STEP 1: Fetch comprehensive product data for local storage ===
    // This needs to complete before we can add the product to local storage with full data.
    const fetchProductDataPromise = this.request('get_product_data_for_storage', {
      product_id: productId,
      room_width: roomWidth, // Pass dimensions to the new endpoint
      room_length: roomLength // Pass dimensions to the new endpoint
    });

    // === STEP 2: Attempt to add product to localStorage and resolve a promise immediately ===
    // This promise resolves as soon as the local storage attempt is made.
    const localStoragePromise = fetchProductDataPromise
      .then(productDataResponse => {
        console.log('DataService: Fetched comprehensive product data for storage (for local add):', productDataResponse);

        if (!productDataResponse.product_data) {
          console.warn('DataService: Failed to get comprehensive product data from server for local storage.');
          // If fetching comprehensive data fails, the local storage add cannot proceed as intended.
          return { success: false, error: new Error('Failed to fetch complete product data for local storage.') };
        }

        const comprehensiveProductData = productDataResponse.product_data;

        // Add the product to local storage immediately with the comprehensive data
        try {
          // Check the return value of the local storage add function
          const success = addProductToRoomStorage(estimateId, roomId, comprehensiveProductData);
          if (success) {
            this.log(`Product ID ${productId} successfully added to room ${roomId} in localStorage.`);
            // Return the updated local data or a success indicator and relevant IDs
            const updatedData = loadEstimateData(); // Load data again to include the new product and updated totals
            return {
              success: true,
              estimateData: updatedData,
              estimateId: estimateId,
              roomId: roomId,
              productData: comprehensiveProductData,
              // Include updated totals from the local data for UI refresh
              estimate_totals: updatedData.estimates?.[estimateId]?.totals || { min_total: 0, max_total: 0 },
              room_totals: updatedData.estimates?.[estimateId]?.rooms?.[roomId]?.totals || { min_total: 0, max_total: 0 }
            };
          } else {
            console.warn(`DataService: Failed to add product ID ${productId} to room ${roomId} in localStorage. Product might already exist.`);
            // If local storage function returns false (e.g., duplicate detected by storage function itself)
            // This case is less likely now that we check before fetch, but kept as a safeguard.
            return { success: false, error: new Error('Failed to add to local storage (product might exist).') };
          }
        } catch (e) {
          console.error(`DataService: Error adding comprehensive product ID ${productId} to room ${roomId} in localStorage:`, e);
          // If local storage function throws an error
          return { success: false, error: e };
        }
      })
      .catch(error => {
        console.error('DataService: Error fetching comprehensive product data before local add:', error);
        // If fetching product data fails, the local storage step cannot proceed.
        // Resolve the local storage promise with a failure state.
        return { success: false, error: error };
      });

    // === STEP 3: Make the asynchronous server request ONLY if local storage succeeded ===
    // This promise chain is separate and does not affect the return value of addProductToRoom.
    // It runs in the background.
    localStoragePromise
      .then(localResult => {
        // Only send the server request if the local storage update was successful
        if (localResult.success) {
          console.log('DataService: Local storage update successful, sending asynchronous server request.');

          const requestData = {
            room_id: String(roomId), // Ensure string type
            product_id: String(productId), // Ensure string type
          };

          // Include estimate ID if provided
          if (estimateId !== null) {
            requestData.estimate_id = String(estimateId); // Ensure string type
          }

          // Use the generic request method for the AJAX call
          return this.request('add_product_to_room', requestData); // Return this promise to continue the chain
        } else {
          console.warn('DataService: Local storage update failed (or product already exists), skipping asynchronous server request.');
          // If local storage failed (either due to fetch error or the storage function returning false),
          // stop this chain here by returning a rejected promise or throwing an error.
          // We'll return a resolved promise with a flag indicating server request was skipped.
          return Promise.resolve({ server_request_skipped: true, local_error: localResult.error });
        }
      })
      .then(serverData => {
        // This block is only reached if localStoragePromise resolved with success: true
        // AND the server request was successful.
        console.log('DataService: Asynchronous server-side product add successful:', serverData);
        // Handle server-side success (e.g., invalidate relevant caches, log)
        this.invalidateCache(); // Invalidate caches as server state might have changed

        // If the server returns updated totals, you might want to compare/reconcile
        // with local storage or trigger a UI refresh based on the server's totals
        // if the server is the ultimate source of truth for totals.

      })
      .catch(serverError => {
        // This block is reached if either localStoragePromise resolved with success: false
        // AND we decided to propagate that error OR the server request itself failed.
        // Check if the error is the one we threw for skipping the server request.
        if (serverError && serverError.message === "Local storage update failed, server request skipped.") {
          console.warn('DataService: Asynchronous server request was intentionally skipped.');
          // Handle the case where server request was skipped gracefully if needed
        } else {
          console.error('DataService: Asynchronous server-side product add failed:', serverError);
          // Handle actual server-side error (e.g., show a non-blocking notification)
        }
      });


    // The function returns the promise that tracks the localStorage update (and the fetch before it).
    // The consumer (ModalManager) will use the resolution/rejection of *this* promise
    // to update the UI based on the local storage state, including duplicate checks
    // and errors during the fetching/local saving steps.
    return localStoragePromise;
  }

  /**
   * Replace a product in a room with another product.
   * Performs local storage replacement immediately and sends the server request asynchronously.
   * @param {string|number} estimateId - Estimate ID
   * @param {string|number} roomId - Room ID
   * @param {string|number} oldProductId - ID of product to replace
   * @param {string|number} newProductId - ID of new product
   * @param {string|number|null} parentProductId - ID of the parent product (if replacing additional product)
   * @param {string} replaceType - Type of replacement ('main' or 'additional_products')
   * @returns {Promise<Object>} A promise that resolves immediately after attempting to replace the product in localStorage.
   * The resolved value includes a success flag and potentially the updated local estimate data and totals.
   */
  replaceProductInRoom(estimateId, roomId, oldProductId, newProductId, parentProductId, replaceType = 'main') {
    console.log('DataService: Initiating product replacement (localStorage first)', {
      estimateId: estimateId,
      roomId: roomId,
      oldProductId: oldProductId,
      newProductId: newProductId,
      parentProductId: parentProductId, // Log parent product ID
      replaceType: replaceType
    });

    // Load existing estimate data to get room dimensions for fetching comprehensive product data
    const existingData = loadEstimateData();
    const estimate = existingData.estimates ? existingData.estimates[estimateId] : null;
    const room = estimate && estimate.rooms ? estimate.rooms[roomId] : null;

    let roomWidth = null;
    let roomLength = null;

    if (room) {
      roomWidth = room.width;
      roomLength = room.length;
      console.log(`Room ${roomId} in Estimate ${estimateId} has dimensions: Width = ${roomWidth}, Length = ${roomLength}`);

      // Optional: Add a local check for duplicate new product before fetching, if applicable for replacement context
      // This might be complex depending on replaceType and whether the new product can already exist as an additional product etc.
      // For simplicity, we'll rely on the storage function's check and the server's check.

    } else {
      console.warn(`DataService: Room ID ${roomId} not found in local storage for estimate ${estimateId}. Cannot get dimensions for fetching product data.`);
      // If the room isn't found locally, we still proceed with fetching and server request,
      // as local storage might be out of sync or it's a new room being added indirectly.
    }

    // === STEP 1: Fetch comprehensive product data for local storage ===
    // This needs to complete before we can add the product to local storage with full data.
    // This promise represents the fetch operation.
    const fetchProductDataPromise = this.request('get_product_data_for_storage', {
      product_id: newProductId,
      room_width: roomWidth, // Pass dimensions to the new endpoint
      room_length: roomLength // Pass dimensions to the new endpoint
    });

    // === STEP 2: Attempt to replace product in localStorage and resolve a promise immediately ===
    // This promise chain handles the fetch and the local storage update.
    // It resolves/rejects based on the success of these steps.
    const localStoragePromise = fetchProductDataPromise
      .then(productDataResponse => {
        console.log('DataService: Fetched comprehensive product data for storage (for local replacement):', productDataResponse);

        if (!productDataResponse.product_data) {
          console.warn('DataService: Failed to get comprehensive product data from server for local storage.');
          // If fetching comprehensive data fails, the local storage replacement cannot proceed as intended.
          // Reject this promise to signal failure immediately to the caller (ModalManager).
          throw new Error('Failed to fetch complete product data for local replacement.');
        }

        const comprehensiveProductData = productDataResponse.product_data;

        // Attempt the local storage replacement immediately with the comprehensive data
        try {
          // Use the imported storage function
          const success = replaceProductInRoomStorage(estimateId, roomId, oldProductId, newProductId, comprehensiveProductData, replaceType, parentProductId);

          if (success) {
            this.log(`Product replacement (old ID ${oldProductId} -> new ID ${newProductId}) successful in localStorage for room ${roomId}.`);
            // Return the updated local data or a success indicator and relevant IDs
            const updatedData = loadEstimateData(); // Load data again to include the new product and updated totals
            const updatedEstimate = updatedData.estimates?.[estimateId];
            const updatedRoom = updatedEstimate?.rooms?.[roomId];

            // Include the replacement chain from the fetched product data if available
            const replacementChain = comprehensiveProductData.replacement_chain || [];
            // Store the replacement chain globally for ModalManager to access after list refresh
            window._productReplacementChains = window._productReplacementChains || {};
            window._productReplacementChains[`${roomId}_${newProductId}`] = replacementChain;


            return {
              success: true,
              estimateData: updatedData, // Provide the full updated data
              estimateId: estimateId,
              roomId: roomId,
              oldProductId: oldProductId, // Include old ID for reference
              newProductId: newProductId, // Include new ID for reference
              productData: comprehensiveProductData, // Include the comprehensive data
              replacement_chain: replacementChain, // Include the replacement chain
              // Include updated totals from the local data for UI refresh
              estimate_totals: updatedEstimate?.totals || { min_total: 0, max_total: 0 },
              room_totals: updatedRoom?.totals || { min_total: 0, max_total: 0 }
            };
          } else {
            console.warn(`DataService: Local storage product replacement (old ID ${oldProductId}) failed for room ${roomId}. Product not found or other storage issue.`);
            // If local storage function returns false (e.g., old product not found)
            // Reject this promise to signal failure immediately to the caller.
            throw new Error('Failed to replace product in local storage. Original product not found?');
          }
        } catch (e) {
          console.error(`DataService: Error performing local storage product replacement for room ${roomId}:`, e);
          // If local storage function throws an error
          // Reject this promise to signal failure immediately to the caller.
          throw new Error(`Error during local storage replacement: ${e.message}`);
        }
      })
      .catch(error => {
        console.error('DataService: Error during fetch or local storage attempt:', error);
        // Re-throw the error to be caught by the caller's .catch()
        throw error;
      });


    // === STEP 3: Make the asynchronous server request AFTER the local storage attempt ===
    // This promise chain is separate and does not affect the return value of replaceProductInRoom.
    // It runs in the background.
    localStoragePromise
      .then(localResult => {
        // Only send the server request if the local storage update was successful
        // Or you might decide to send it anyway if local storage failed but you still want server sync.
        // For this scenario, we'll send it regardless of local storage success,
        // as the server is the ultimate source of truth.
        console.log('DataService: Local storage attempt completed, sending asynchronous server request.');

        const requestData = {
          estimate_id: String(estimateId), // Ensure string type
          room_id: String(roomId), // Ensure string type
          product_id: String(newProductId), // The ID of the new product
          replace_product_id: String(oldProductId), // The ID of the product being replaced
          replace_type: replaceType // Send the replacement type to the server
        };

        // Include parent product ID if available
        if (parentProductId !== null) {
          requestData.parent_product_id = String(parentProductId); // Ensure string type
        }

        // Use the generic request method for the AJAX call
        return this.request('replace_product_in_room', requestData); // Return this promise to continue the chain

      })
      .then(serverData => {
        // This block is only reached if the server request was successful.
        console.log('DataService: Asynchronous server-side product replacement successful:', serverData);
        // Handle server-side success (e.g., invalidate relevant caches, log)
        this.invalidateCache(); // Invalidate caches as server state might have changed

        // If the server returns updated totals or replacement chain, you might want to compare/reconcile
        // with local storage or trigger a UI refresh based on the server's data if it's the ultimate source of truth.
        // However, the ModalManager already refreshed based on local storage, so this might be just for logging/auditing.

      })
      .catch(serverError => {
        // This block is reached if the server request failed.
        console.error('DataService: Asynchronous server-side product replacement failed:', serverError);
        // Handle actual server-side error asynchronously (e.g., show a non-blocking notification to the user)
        // Note: The main promise returned by replaceProductInRoom has already resolved by this point.
        // You could emit a global event here that a notification system listens to.
        // Example: EventBus.emit('serverError', { action: 'replace_product_in_room', error: serverError });
      });


    // The function returns the promise that tracks the initial fetch and the localStorage update.
    // The consumer (ModalManager) will use the resolution/rejection of *this* promise
    // to update the UI based on the local storage state.
    return localStoragePromise;
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
      this.log(`Returning cached similar products for product ${productId} and area ${roomArea}`);
      return Promise.resolve(this.cache.similarProducts[cacheKey]); // Returns cached data if not bypassing
    }

    this.log(`Attempting to make 'get_similar_products' request for product ID: ${productId}, area: ${roomArea}. Cache bypass: ${bypassCache}`);

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
          console.warn('DataService: get_similar_products did not return expected data structure (expected { products: [...] })', data);
          // Return an empty array or throw an error if the response format is unexpected
          return [];
        }
      })
      .catch(error => {
        console.error('DataService: Error fetching similar products:', error);
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
    this.log(`Client-side estimate saved to localStorage with sequential ID: ${clientSideEstimateId}`);

    // Make the AJAX request to the server asynchronously
    this.request('add_new_estimate', requestData)
      .then(serverData => {
        console.log('DataService: Server-side estimate creation successful:', serverData);
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
        console.error('DataService: Server-side estimate creation failed:', serverError);
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
   * @param {FormData|Object|string} formData - Form data
   * @param {string|number} estimateId - Estimate ID
   * @param {number|null} productId - Optional product ID
   * @returns {Promise<Object>} A promise that resolves immediately with the client-side room data.
   */
  addNewRoom(formData, estimateId, productId = null) {
    console.log('DataService: Adding new room', {
      estimateId: estimateId,
      productId: productId,
      formData: formData instanceof FormData ? Object.fromEntries(formData) : formData
    });


    const existingData = loadEstimateData();
    const estimate = existingData.estimates ? existingData.estimates[estimateId] : null;

    // Ensure the estimate exists before attempting to add a room locally
    if (!estimate) {
      console.error(`DataService: Cannot add room - Estimate with ID ${estimateId} not found in local storage.`);
      // Make the server request anyway, it might succeed if local storage is out of sync
      // but reject this promise immediately to signal local failure.
      const requestDataOnLocalFailure = {
        form_data: this.formatFormData(formData),
        estimate_id: estimateId
      };
      if (productId) {
        requestDataOnLocalFailure.product_id = productId;
      }

      this.request('add_new_room', requestDataOnLocalFailure)
        .then(serverData => console.log('DataService: Server add_new_room succeeded despite local estimate not found:', serverData))
        .catch(serverError => console.error('DataService: Server add_new_room failed after local estimate not found:', serverError));

      return Promise.reject(new Error(`Estimate with ID ${estimateId} not found in local storage.`));
    }


    let clientSideRoomId = String(Object.keys(estimate.rooms).length); // Use the count of existing rooms as the sequential ID for local storage

    const roomWidth = parseFloat(formData instanceof FormData ? formData.get('room_width') : formData.room_width) || 0;
    const roomLength = parseFloat(formData instanceof FormData ? formData.get('room_length') : formData.room_length) || 0;

    const newRoomData = {
      id: clientSideRoomId, // Use the client-side ID for local storage
      name: formData instanceof FormData ? formData.get('room_name') || 'Unnamed Room' : formData.room_name || 'Unnamed Room', // Get name from form data
      width: roomWidth, // Add width from form data
      length: roomLength, // Add length from form data
      products: [], // New rooms start with no products
      min_total: 0, // Initialize min_total to 0
      max_total: 0  // Initialize max_total to 0
    };

    // Add the new room data to local storage for the specified estimate immediately
    addRoom(estimateId, newRoomData);
    this.log(`Room ID ${newRoomData.id} added to localStorage for estimate ${estimateId}`);

    // If a product ID is provided, add it to the newly created room in local storage
    if (productId) {
      // Fetch comprehensive data for the product for local storage immediately
      this.request('get_product_data_for_storage', {
        product_id: productId,
        room_width: roomWidth, // Pass dimensions to the new endpoint
        room_length: roomLength // Pass dimensions to the new endpoint
      })
        .then(productDataResponse => {
          console.log('DataService: Fetched comprehensive product data for storage (for new room product):', productDataResponse);

          if (!productDataResponse.product_data) {
            console.warn('Failed to get comprehensive product data for local storage for new room product.');
            return; // Continue without adding product to local storage if data fetch fails
          }

          const comprehensiveProductData = productDataResponse.product_data;

          try {
            // Use the addProductToRoom function from EstimateStorage to add the product to the newly added room
            const success = addProductToRoomStorage(estimateId, clientSideRoomId, comprehensiveProductData);
            if (success) {
              this.log(`Product ID ${productId} successfully added to new room ${clientSideRoomId} in localStorage.`);
            } else {
              console.warn(`Failed to add product ID ${productId} to new room ${clientSideRoomId} in localStorage.`);
            }
          } catch (e) {
            console.error(`Error adding product ID ${productId} to new room ${clientSideRoomId} in localStorage:`, e);
          }
        })
        .catch(error => {
          console.error('DataService: Error fetching comprehensive product data for storage (for new room product):', error);
          // Continue even if fetching data for local storage fails
        });
    }


    let requestData = {
      form_data: this.formatFormData(formData),
      estimate_id: estimateId
    };

    if (productId) {
      requestData.product_id = productId;
    }

    // Use the generic request method for the AJAX call - handle asynchronously
    const serverRequestPromise = this.request('add_new_room', requestData)
      .then(data => {
        // Log success for debugging
        console.log('DataService: Room added successfully (server response)', data);

        // Invalidate caches since we modified data on the server
        this.invalidateCache();

        // You might want to update the client-side room with the server-assigned ID
        // if the server returns one and it's different from the sequential client-side ID.
        // Example: if (data.room_id && data.room_id !== clientSideRoomId) {
        //   updateRoomIdInStorage(estimateId, clientSideRoomId, data.room_id);
        // }

        // If a product was added along with the room, you might need to update
        // the client-side product data with server-assigned details if necessary.

        return data; // Return the server response data

      })
      .catch(error => {
        console.error('DataService: Error adding room (server response)', error);
        // Handle server-side error asynchronously, e.g., show a notification to the user.
        // You might also want to consider removing the locally created room if the server creation failed.
        // Example: removeRoomFromStorage(estimateId, clientSideRoomId);
        throw error; // Re-throw to allow handling upstream
      });

    // Return a promise that resolves immediately with the client-side room data.
    // ModalManager will use this to update the UI based on the local change.
    return Promise.resolve({ room_id: clientSideRoomId, estimate_id: estimateId, ...newRoomData });
  }

  /**
   * Remove a product from a room
   * @param {string|number} estimateId - Estimate ID
   * @param {string|number} roomId - Room ID
   * @param {number} productIndex - Product index
   * @returns {Promise<Object>} A promise that resolves immediately after the local storage removal attempt.
   */
  removeProductFromRoom(estimateId, roomId, productIndex) {
    console.log('DataService: Attempting to remove product from room (localStorage first)', {
      estimateId: estimateId,
      roomId: roomId,
      productIndex: productIndex
    });

    let localStorageSuccess = false;
    let localStorageError = null;

    // Perform local storage removal immediately
    try {
      localStorageSuccess = removeProductFromRoomStorage(estimateId, roomId, productIndex); // Use the imported function
      if (localStorageSuccess) {
        this.log(`Product at index ${productIndex} successfully removed from room ${roomId} in localStorage.`);
      } else {
        console.warn(`Product at index ${productIndex} not found in room ${roomId} in localStorage during removal attempt.`);
        localStorageError = new Error('Product not found in local storage.'); // Set a specific error for local failure
      }
    } catch (e) {
      console.error(`Error removing product at index ${productIndex} from room ${roomId} in localStorage:`, e);
      localStorageError = e; // Capture the error
      localStorageSuccess = false; // Ensure success is false on error
    }

    // === Make the asynchronous server request AFTER the local storage attempt ===
    // This promise chain is separate and does not affect the return value of this function.
    const serverRequestPromise = this.request('remove_product_from_room', {
      estimate_id: estimateId,
      room_id: roomId,
      product_index: productIndex
    });

    serverRequestPromise
      .then(serverData => {
        console.log('DataService: Asynchronous server-side product removal successful:', serverData);
        // Handle server-side success (e.g., invalidate relevant caches, log)
        this.invalidateCache(); // Invalidate caches as server state might have changed

        // You might want to compare/reconcile local storage with server data here if needed,
        // or trigger further UI updates based on server response, if any.

      })
      .catch(serverError => {
        console.error('DataService: Asynchronous server-side product removal failed:', serverError);
        // Handle actual server-side error asynchronously (e.g., show a non-blocking notification to the user)
        // Note: The main promise has already resolved by this point.
      });

    // === Return a promise that resolves immediately with the local storage result ===
    // The consumer (ModalManager) will use the resolution/rejection of *this* promise
    // to update the UI based on the local storage state.
    if (localStorageSuccess) {
      // If local storage was successful, resolve immediately.
      // Include any data that the ModalManager might need to update the UI based on the local change.
      // For product removal, the success itself is the key, potentially with updated local totals if calculated immediately.
      // For simplicity, we'll just indicate success here.
      const updatedData = loadEstimateData(); // Load data again to get updated totals after removal
      const estimate = updatedData.estimates ? updatedData.estimates[estimateId] : null;
      const room = estimate && estimate.rooms ? estimate.rooms[roomId] : null;


      return Promise.resolve({
        success: true,
        estimateId: estimateId,
        roomId: roomId,
        productIndex: productIndex,
        estimate_totals: estimate?.totals || { min_total: 0, max_total: 0 },
        room_totals: room?.totals || { min_total: 0, max_total: 0 }
      });
    } else {
      // If local storage failed (e.g., product not found locally), reject immediately.
      return Promise.reject(localStorageError || new Error('Failed to remove product from local storage.'));
    }
  }

  /**
   * Remove a room from an estimate
   * @param {string|number} estimateId - Estimate ID
   * @param {string|number} roomId - Room ID
   * @returns {Promise<Object>} A promise that resolves immediately after the local storage removal attempt.
   */
  removeRoom(estimateId, roomId) {
    console.log('DataService: Removing room', {
      estimateId: estimateId,
      roomId: roomId
    });

    // Perform local storage removal immediately
    try {
      const success = removeRoomFromStorage(estimateId, roomId);
      if (success) {
        this.log(`Room ID ${roomId} successfully removed from localStorage for estimate ${estimateId}`);
      } else {
        console.warn(`Room ID ${roomId} not found in localStorage for estimate ${estimateId} during removal attempt.`);
      }
    } catch (e) {
      console.error(`Error removing room ID ${roomId} from localStorage:`, e);
    }


    // Force string conversion for consistency
    const requestData = {
      estimate_id: String(estimateId),
      room_id: String(roomId)
    };

    // Make the AJAX request to the server asynchronously
    const serverRequestPromise = this.request('remove_room', requestData)
      .then(serverData => {
        console.log('DataService: Server-side room removal successful:', serverData);
        // Invalidate caches since we modified data on the server
        this.invalidateCache();
        // You might update local state further based on server response if needed
      })
      .catch(serverError => {
        console.error('DataService: Server-side room removal failed:', serverError);
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
    console.log(`DataService: Removing estimate ${estimateId}`);

    // Perform local storage removal immediately
    try {
      const success = removeEstimateFromStorage(estimateId);
      if (success) {
        this.log(`Estimate ID ${estimateId} successfully removed from localStorage.`);
      } else {
        console.warn(`Estimate ID ${estimateId} not found in localStorage during removal attempt.`);
      }
    } catch (e) {
      console.error(`Error removing estimate ID ${estimateId} from localStorage:`, e);
    }

    // Make the AJAX request to the server asynchronously
    this.request('remove_estimate', {
      estimate_id: estimateId
    })
      .then(serverData => {
        console.log(`DataService: Server-side estimate removal successful: ${estimateId}`, serverData);
        // Invalidate caches since we modified data
        this.invalidateCache();
        // You might update local state further based on server response if needed
      })
      .catch(serverError => {
        console.error(`DataService: Server-side estimate removal failed: ${estimateId}`, serverError);
        // Handle server error asynchronously, e.g., notify user.
        // You might need to add the estimate back to local storage if the server removal failed.
      });

    // Return a promise that resolves immediately after the local removal attempt.
    // ModalManager will use this to update the UI based on the local change.
    // Note: This promise does NOT wait for the server response.
    return Promise.resolve({ success: true }); // Assuming local removal attempt was made
  }


  /**
   * Get suggested products for a room
   * Now accepts roomProducts array to send to the backend.
   * @param {string|number} estimateId - Estimate ID
   * @param {string|number} roomId - Room ID
   * @param {Array} roomProducts - Array of product objects currently in the room
   * @param {boolean} bypassCache - Whether to bypass the cache
   * @returns {Promise<Array>} Array of suggested products
   */
  getSuggestedProducts(estimateId, roomId, roomProducts = [], bypassCache = false) {
    const cacheKey = `estimate_${estimateId}_room_${roomId}`;

    // Check cache first for efficiency within the same session
    // Note: Cache is still based on estimate and room ID, not the specific products passed.
    // If suggestion logic is highly sensitive to exact product list changes,
    // you might need a more complex cache key or bypass cache more often.
    if (!bypassCache && this.cache.suggestedProducts[cacheKey]) {
      this.log(`Returning cached suggestions for room ${roomId}`);
      return Promise.resolve(this.cache.suggestedProducts[cacheKey]);
    }

    console.log('Fetching suggestions from backend, passing room products:', roomProducts);

    // Prepare data to send to the backend
    const requestData = {
      estimate_id: estimateId,
      room_id: roomId,
      // Stringify the roomProducts array to send it in the POST data
      // The backend must be designed to receive and parse this JSON string.
      room_products: JSON.stringify(roomProducts)
    };

    return this.request('get_suggested_products', requestData)
      .then(data => {
        // Assuming the backend returns an object with a 'suggestions' key containing the array
        if (data && Array.isArray(data.suggestions)) {
          this.cache.suggestedProducts[cacheKey] = data.suggestions;
          return data.suggestions;
        } else {
          console.warn('DataService: get_suggested_products did not return expected data structure (expected { suggestions: [...] })', data);
          // Return an empty array or throw an error if the response format is unexpected
          return [];
        }
      })
      .catch(error => {
        console.error('DataService: Error fetching suggestions:', error);
        // Clear cache for this room on error, as the cached data might be stale or indicate a problem
        delete this.cache.suggestedProducts[cacheKey];
        throw error; // Re-throw the error to be handled by ModalManager
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
    console.log(`[DataService.getProductUpgrades] DEBUG: Called with productId: ${productId}, estimateId: ${estimateId}, roomId: ${roomId}, roomArea: ${roomArea}, upgradeType: ${upgradeType}, bypassCache: ${bypassCache}`);
    const cacheKey = `upgrades_${productId}_${estimateId}_${roomId}_${upgradeType}`;

    // Initialize this.cache.productUpgrades if it's undefined
    this.cache.productUpgrades = this.cache.productUpgrades || {};

    if (!bypassCache && this.cache.productUpgrades[cacheKey]) {
      console.log(`[DataService.getProductUpgrades] DEBUG: Returning cached upgrades for product ${productId}.`);
      return Promise.resolve(this.cache.productUpgrades[cacheKey]);
    }

    console.log(`[DataService.getProductUpgrades] DEBUG: Fetching product upgrades from server for product ${productId}. Calling this.request('get_product_upgrades', ...).`);
    return this.request('get_product_upgrades', {
      product_id: productId,
      estimate_id: estimateId,
      room_id: roomId,
      room_area: roomArea,
      upgrade_type: upgradeType,
    })
      .then(data => {
        console.log(`[DataService.getProductUpgrades] DEBUG: Response from this.request for 'get_product_upgrades':`, data);
        if (data && Array.isArray(data.upgrades)) {
          this.cache.productUpgrades[cacheKey] = data.upgrades;
          return data.upgrades;
        } else {
          console.warn('[DataService.getProductUpgrades] DEBUG: get_product_upgrades did not return expected data structure.', data);
          return [];
        }
      })
      .catch(error => {
        console.error('[DataService.getProductUpgrades] DEBUG: Error fetching product upgrades:', error);
        // this.cache.productUpgrades is already initialized
        delete this.cache.productUpgrades[cacheKey];
        throw error;
      });
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
    this.log('Invalidating caches');
    this.cache.estimatesData = null;
    this.cache.estimatesList = null;
    this.cache.rooms = {};
    this.cache.suggestedProducts = {};
  }

  /**
   * Log debug messages
   * @param {...any} args - Arguments to log
   */
  log(...args) {
    if (this.config.debug) {
      console.log('[DataService]', ...args);
    }
  }
}

// Export the class
export default DataService;
