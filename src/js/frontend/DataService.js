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
      suggestedProducts: {}
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
   * Check if any estimates exist in the session
   * @param {boolean} bypassCache - Whether to bypass the cache
   * @returns {Promise<boolean>} True if estimates exist
   */
  checkEstimatesExist(bypassCache = false) {
    return this.request('check_estimates_exist')
      .then(data => {
        return !!data.has_estimates;
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
   * Update getEstimatesList method to bind the Create Estimate button
   * after loading the list
   */
  getEstimatesList(bypassCache = false) {
    if (!bypassCache && this.cache.estimatesList) {
      this.log('Returning cached estimates list');

      // Even when using cache, we need to bind the button
      setTimeout(() => this.bindCreateEstimateButton(), 100);

      return Promise.resolve(this.cache.estimatesList);
    }

    return this.request('get_estimates_list')
      .then(data => {
        this.cache.estimatesList = data.html;

        // After loading new content, bind the button
        setTimeout(() => this.bindCreateEstimateButton(), 100);

        return data.html;
      });
  }

  /**
   * Get all estimates data for dropdowns
   * @param {boolean} bypassCache - Whether to bypass the cache
   * @returns {Promise<Array>} Array of estimate objects
   */
  getEstimatesData(bypassCache = false) {
    if (!bypassCache && this.cache.estimatesData) {
      this.log('Returning cached estimates data');
      return Promise.resolve(this.cache.estimatesData);
    }

    return this.request('get_estimates_data')
      .then(data => {
        this.cache.estimatesData = data.estimates;
        return data.estimates;
      });
  }

  /**
   * Get rooms for a specific estimate
   * @param {string|number} estimateId - Estimate ID
   * @param {number|null} productId - Optional product ID
   * @param {boolean} bypassCache - Whether to bypass the cache
   * @returns {Promise<Object>} Room data
   */
  getRoomsForEstimate(estimateId, productId = null, bypassCache = false) {
    const cacheKey = `estimate_${estimateId}`;

    if (!bypassCache && this.cache.rooms[cacheKey]) {
      this.log(`Returning cached rooms for estimate ${estimateId}`);
      return Promise.resolve(this.cache.rooms[cacheKey]);
    }

    return this.request('get_rooms_for_estimate', {
      estimate_id: estimateId,
      product_id: productId || ''
    })
      .then(data => {
        this.cache.rooms[cacheKey] = data;
        return data;
      });
  }

  /**
   * Add a product to a room
   * @param {string|number} roomId - Room ID
   * @param {number} productId - Product ID
   * @param {string|number|null} estimateId - Optional estimate ID to ensure correct room
   * @returns {Promise<Object>} Result data from server
   */
  addProductToRoom(roomId, productId, estimateId = null) {
    console.log('DataService: Adding product to room', {
      roomId: roomId,
      productId: productId,
      estimateId: estimateId
    });

    // Get the existing estimate data to find room dimensions for the local storage update
    const existingData = loadEstimateData();
    const estimate = existingData.estimates ? existingData.estimates[estimateId] : null;
    const room = estimate && estimate.rooms ? estimate.rooms[roomId] : null;

    let roomWidth = null;
    let roomLength = null;

    if (room) {
      roomWidth = room.width;
      roomLength = room.length;
    } else {
      console.warn(`Room ID ${roomId} not found in local storage for estimate ${estimateId}. Cannot get dimensions for local product data.`);
    }


    // === START: Fetch comprehensive product data for local storage immediately ===
    // Use a nested promise chain or async/await if available to fetch data first
    // For now, we'll use a promise chain to align with existing structure

    this.request('get_product_data_for_storage', {
      product_id: productId,
      room_width: roomWidth, // Pass dimensions to the new endpoint
      room_length: roomLength // Pass dimensions to the new endpoint
    })
      .then(productDataResponse => {
        console.log('DataService: Fetched comprehensive product data for storage:', productDataResponse);

        if (!productDataResponse.product_data) {
          throw new Error('Failed to get comprehensive product data from server.');
        }

        const comprehensiveProductData = productDataResponse.product_data;

        // Use the addProductToRoom function from EstimateStorage to add the product to the specified room
        // Note: This expects the EstimateStorage addProductToRoom to find the correct estimate and room by their IDs
        try {
          const success = addProductToRoomStorage(estimateId, roomId, comprehensiveProductData);
          if (success) {
            this.log(`Product ID ${productId} successfully added to room ${roomId} in localStorage with comprehensive data.`);
          } else {
            console.warn(`Failed to add product ID ${productId} to room ${roomId} in localStorage.`);
            // Decide how to handle local storage failure - maybe still proceed with server request?
            // For now, we'll proceed with the server request even if local storage fails.
          }
        } catch (e) {
          console.error(`Error adding comprehensive product ID ${productId} to room ${roomId} in localStorage:`, e);
          // Decide how to handle local storage failure - maybe still proceed with server request?
          // For now, we'll proceed with the server request even if local storage fails.
        }
      })
      .catch(error => {
        console.error('DataService: Error fetching comprehensive product data for storage:', error);
        // If fetching data for local storage fails, reject the entire promise chain
        throw error; // Re-throw to allow handling upstream (e.g., in ModalManager)
      });

        // === END: Add product data to the room in local storage immediately ===


        // Now, make the original AJAX request to the server to add the product to the session/database
        const requestData = {
          room_id: roomId,
          product_id: productId
        };

        // Include estimate ID if provided to ensure correct room selection
        if (estimateId !== null) {
          requestData.estimate_id = estimateId;
        }

        // This is the original AJAX call that was selected
        return this.request('add_product_to_room', requestData)
          .then(data => {
            console.log('DataService: Product added successfully (server response)', data);

            // Invalidate caches since we modified data
            this.invalidateCache();
            return data; // Return the server response data
          })
          .catch(error => {
            console.error('DataService: Error adding product to room (server response)', error);
            // Note: The product was already added to local storage.
            // If the server request fails, you might want to handle the discrepancy.
            throw error; // Re-throw to allow handling upstream
          });

  }

  /**
   * Replace a product in a room with another product.
   * Handles the AJAX request to the server.
   * @param {string|number} estimateId - Estimate ID
   * @param {string|number} roomId - Room ID
   * @param {string|number} oldProductId - ID of product to replace
   * @param {string|number} newProductId - ID of new product
   * @param {string|number|null} parentProductId - ID of the parent product (if replacing additional product)
   * @param {string} replaceType - Type of replacement ('main' or 'additional_products')
   * @returns {Promise<Object>} Promise resolving to the server response data
   */
  replaceProductInRoom(estimateId, roomId, oldProductId, newProductId, parentProductId, replaceType = 'main') {
    console.log('DataService: Initiating product replacement request', {
      estimateId: estimateId,
      roomId: roomId,
      oldProductId: oldProductId,
      newProductId: newProductId,
      parentProductId: parentProductId, // Log parent product ID
      replaceType: replaceType
    });

    const storedData = loadEstimateData();
    let roomWidth = null;
    let roomLength = null;
    if (storedData && storedData.estimates && storedData.estimates[estimateId]) {
      const estimate = storedData.estimates[estimateId];

      // Check if the estimate has rooms and the specific room exists
      if (estimate.rooms && estimate.rooms[roomId]) {
        const room = estimate.rooms[roomId];

        // Extract width and length
        roomWidth = room.width;
        roomLength = room.length;

        console.log(`Room ${roomId} in Estimate ${estimateId} has dimensions: Width = ${roomWidth}, Length = ${roomLength}`);
      } else {
        console.warn(`Room with ID ${roomId} not found in estimate ${estimateId}.`);
      }
    } else {
      console.warn(`Estimate with ID ${estimateId} not found in localStorage.`);
    }


    this.request('get_product_data_for_storage', {
      product_id: newProductId,
      room_width: roomWidth, // Pass dimensions to the new endpoint
      room_length: roomLength // Pass dimensions to the new endpoint
    })
      .then(productDataResponse => {
        console.log('DataService: Fetched comprehensive product data for storage:', productDataResponse);

        if (!productDataResponse.product_data) {
          throw new Error('Failed to get comprehensive product data from server.');
        }

        const comprehensiveProductData = productDataResponse.product_data;

        try {
          const success = replaceProductInRoomStorage(estimateId, roomId, oldProductId, newProductId, comprehensiveProductData, replaceType, parentProductId);
          if (success) {
            this.log(`Product ID ${newProductId} successfully added to room ${roomId} in localStorage with comprehensive data.`);
          } else {
            console.warn(`Product replacement (old ID ${oldProductId}) failed in localStorage for room ${roomId}. Product not found?`);
            // Decide how to handle local storage failure - maybe still proceed with server request?
            // For now, we'll proceed with the server request even if local storage fails.
          }
        } catch (e) {
          console.error(`Error performing local storage product replacement for room ${roomId}:`, e);
          // Decide how to handle local storage failure - maybe still proceed with server request?
          // For now, we'll proceed with the server request even if local storage fails.
        }
      })
      .catch(error => {
        console.error('DataService: Error fetching comprehensive product data for storage:', error);
        // If fetching data for local storage fails, reject the entire promise chain
        throw error; // Re-throw to allow handling upstream (e.g., in ModalManager)
      });



    const requestData = {
      estimate_id: estimateId,
      room_id: roomId,
      product_id: newProductId, // The ID of the new product
      replace_product_id: oldProductId, // The ID of the product being replaced
      replace_type: replaceType // Send the replacement type to the server
    };

    // Include parent product ID if available
    if (parentProductId !== null) {
      requestData.parent_product_id = parentProductId;
    }

    // Use the generic request method for the AJAX call
    return this.request('replace_product_in_room', requestData)
      .then(data => {
        console.log('DataService: Product replacement successful (server response)', data);
        // Invalidate caches since we modified data on the server
        this.invalidateCache();
        return data; // Return the server response data
      })
      .catch(error => {
        console.error('DataService: Error replacing product (server response)', error);
        throw error; // Re-throw to allow handling upstream
      });
  }


  /**
   * Create a new estimate
   * @param {FormData|Object|string} formData - Form data
   * @param {number|null} productId - Optional product ID
   * @returns {Promise<Object>} New estimate data
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
    const nextSequentialId = Object.keys(existingEstimates).length; // Use the count of existing estimates as the next ID

    // Create a basic estimate object for local storage with the sequential ID
    const clientSideEstimateData = {
      id: String(nextSequentialId), // Ensure ID is a string for consistency with potential server IDs
      name: estimateName,
      rooms: {}, // Start with an empty rooms object
      // Add any other default properties needed for a new estimate client-side
    };

    const clientSideEstimateId = addEstimate(clientSideEstimateData);
    this.log(`Client-side estimate saved to localStorage with sequential ID: ${clientSideEstimateId}`);


    return this.request('add_new_estimate', requestData)
      .then(data => {
        // Invalidate caches since we modified data
        this.invalidateCache();
        return data;
      });
  }

  /**
   * Create a new room
   * @param {FormData|Object|string} formData - Form data
   * @param {string|number} estimateId - Estimate ID
   * @param {number|null} productId - Optional product ID
   * @returns {Promise<Object>} New room data
   */
  addNewRoom(formData, estimateId, productId = null) {
    console.log('DataService: Adding new room', {
      estimateId: estimateId,
      productId: productId,
      formData: formData instanceof FormData ? Object.fromEntries(formData) : formData
    });


    const existingData = loadEstimateData();
    const estimate = existingData.estimates ? existingData.estimates[estimateId] : null;


    let clientSideRoomId = String(Object.keys(estimate.rooms).length);

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

    if (productId) {
      // Create a minimal product data object with just the ID
      // In a real scenario, you might fetch more details here if needed for local display
      const minimalProductData = {
        id: String(productId), // Ensure product ID is a string for consistency
        // Add other minimal properties if necessary for local display, e.g., name: 'Product ' + productId
      };
      try {
        // Use the addProductToRoom function from EstimateStorage to add the product to the newly added room
        const success = addProductToRoomStorage(estimateId, clientSideRoomId, minimalProductData);
        if (success) {
          this.log(`Product ID ${productId} successfully added to room ${clientSideRoomId} in localStorage.`);
        } else {
          console.warn(`Failed to add product ID ${productId} to room ${clientSideRoomId} in localStorage.`);
        }
      } catch (e) {
        console.error(`Error adding product ID ${productId} to room ${clientSideRoomId} in localStorage:`, e);
      }
    }

    let requestData = {
      form_data: this.formatFormData(formData),
      estimate_id: estimateId
    };

    if (productId) {
      requestData.product_id = productId;
    }

    // Use the generic request method for the AJAX call
    return this.request('add_new_room', requestData)
      .then(data => {
        // Log success for debugging
        console.log('DataService: Room added successfully', data);

        // Invalidate caches since we modified data
        this.invalidateCache();
        return data;
      })
      .catch(error => {
        console.error('DataService: Error adding room', error);
        throw error; // Re-throw to allow handling upstream
      });
  }

  /**
   * Remove a product from a room
   * @param {string|number} estimateId - Estimate ID
   * @param {string|number} roomId - Room ID
   * @param {number} productIndex - Product index
   * @returns {Promise<Object>} Result data
   */
  removeProductFromRoom(estimateId, roomId, productIndex) {


    try {
      const success = removeProductFromRoomStorage(estimateId, roomId, productIndex);
      if (success) {
        this.log(`Product at index ${productIndex} successfully removed from room ${roomId} in localStorage.`);
      } else {
        console.warn(`Product at index ${productIndex} not found in room ${roomId} in localStorage during removal attempt.`);
      }
    } catch (e) {
      console.error(`Error removing product at index ${productIndex} from room ${roomId} in localStorage:`, e);
    }

    return this.request('remove_product_from_room', {
      estimate_id: estimateId,
      room_id: roomId,
      product_index: productIndex
    })
      .then(data => {
        // Invalidate caches since we modified data
        this.invalidateCache();
        return data;
      });
  }

  /**
   * Remove a room from an estimate
   * @param {string|number} estimateId - Estimate ID
   * @param {string|number} roomId - Room ID
   * @returns {Promise<Object>} Result data
   */
  removeRoom(estimateId, roomId) {
    console.log('DataService: Removing room', {
      estimateId: estimateId,
      roomId: roomId
    });

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

    return this.request('remove_room', requestData)
      .then(data => {
        console.log('DataService: Room removed successfully', data);

        // Invalidate caches since we modified data
        this.invalidateCache();
        return data;
      })
      .catch(error => {
        console.error('DataService: Error removing room', error);
        throw error;
      });
  }

  /**
   * Remove an entire estimate
   * @param {string|number} estimateId - Estimate ID
   * @returns {Promise<Object>} Result data
   */
  removeEstimate(estimateId) {
    console.log(`DataService: Removing estimate ${estimateId}`);

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

    return this.request('remove_estimate', {
      estimate_id: estimateId
    })
      .then(data => {
        // Invalidate caches since we modified data
        this.invalidateCache();
        console.log(`DataService: Successfully removed estimate ${estimateId}`);
        return data;
      })
      .catch(error => {
        console.error(`DataService: Error removing estimate ${estimateId}`, error);
        throw error; // Make sure to re-throw so the error propagates
      });
  }

  /**
   * Get suggested products for a room
   * @param {string|number} estimateId - Estimate ID
   * @param {string|number} roomId - Room ID
   * @param {boolean} bypassCache - Whether to bypass the cache
   * @returns {Promise<Array>} Array of suggested products
   */
  getSuggestedProducts(estimateId, roomId, bypassCache = false) {
    const cacheKey = `estimate_${estimateId}_room_${roomId}`;

    if (!bypassCache && this.cache.suggestedProducts[cacheKey]) {
      this.log(`Returning cached suggestions for room ${roomId}`);
      return Promise.resolve(this.cache.suggestedProducts[cacheKey]);
    }

    return this.request('get_suggested_products', {
      estimate_id: estimateId,
      room_id: roomId
    })
      .then(data => {
        this.cache.suggestedProducts[cacheKey] = data.suggestions;
        return data.suggestions;
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
