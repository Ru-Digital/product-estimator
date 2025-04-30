/**
 * DataService.js
 *
 * Centralized service for all AJAX operations in the Product Estimator plugin.
 * Provides a clean API for data operations and handles errors consistently.
 */

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
   * Add method to consistently bind the Create Estimate button event
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
   * @returns {Promise<Object>} Result data
   */
  addProductToRoom(roomId, productId, estimateId = null) {
    console.log('DataService: Adding product to room', {
      roomId: roomId,
      productId: productId,
      estimateId: estimateId
    });

    const requestData = {
      room_id: roomId,
      product_id: productId
    };

    // Include estimate ID if provided to ensure correct room selection
    if (estimateId !== null) {
      requestData.estimate_id = estimateId;
    }

    return this.request('add_product_to_room', requestData)
      .then(data => {
        console.log('DataService: Product added successfully', data);

        // Invalidate caches since we modified data
        this.invalidateCache();
        return data;
      })
      .catch(error => {
        console.error('DataService: Error adding product to room', error);
        throw error;
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

    let requestData = {
      form_data: this.formatFormData(formData),
      estimate_id: estimateId
    };

    if (productId) {
      requestData.product_id = productId;
    }

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
    return this.request('remove_estimate', {
      estimate_id: estimateId
    })
      .then(data => {
        // Invalidate caches since we modified data
        this.invalidateCache();
        return data;
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
   * Add a suggested product to a room
   * @param {string|number} estimateId - Estimate ID
   * @param {string|number} roomId - Room ID
   * @param {number} productId - Product ID
   * @returns {Promise<Object>} Result data
   */
  addSuggestionToRoom(estimateId, roomId, productId) {
    return this.request('add_product_to_room', {
      estimate_id: estimateId,
      room_id: roomId,
      product_id: productId
    })
      .then(data => {
        // Invalidate caches since we modified data
        this.invalidateCache();
        return data;
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
