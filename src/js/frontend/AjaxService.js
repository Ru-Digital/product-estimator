/**
 * AjaxService.js
 *
 * Dedicated service for handling AJAX requests in the Product Estimator plugin.
 * This service provides specific methods for each AJAX action, giving better control
 * over request parameters and error handling for individual operations.
 * It utilizes the existing ajax.js utilities.
 */

import { wpAjax, formatFormData } from '@utils/ajax';
import { createLogger } from '@utils';

const logger = createLogger('AjaxService');

class AjaxService {
  /**
   * Initialize the AjaxService
   * @param {object} config - Configuration options
   */
  constructor(config = {}) {
    // Check for existing instance (singleton pattern)
    if (window._ajaxServiceInstance) {
      logger.log('Using existing AjaxService instance');
      // Return existing instance to ensure singleton
      return window._ajaxServiceInstance;
    }

    this.config = Object.assign({
      debug: false,
      ajaxUrl: window.productEstimatorVars?.ajax_url || '/wp-admin/admin-ajax.php',
      nonce: window.productEstimatorVars?.nonce || '',
      i18n: window.productEstimatorVars?.i18n || {}
    }, config);

    // Initialize cache for server-side data
    this.cache = {
      productData: {},
      similarProducts: {},
      suggestions: {},
      estimatesData: null,
      rooms: {}
    };

    // Log initialization only once
    if (!window._ajaxServiceLogged) {
      logger.log('AjaxService initialized');
      window._ajaxServiceLogged = true;
    }

    // Store as singleton
    window._ajaxServiceInstance = this;
  }

  /**
   * Private method to make a generic AJAX request
   * @param {string} action - WordPress AJAX action name
   * @param {object} data - Request data
   * @param {boolean} allowFailure - Whether to allow the request to fail and return a fallback response
   * @returns {Promise} - Promise resolving to response data or fallback data if allowFailure=true
   * @private
   */
  _request(action, data = {}, allowFailure = false) {
    logger.log(`Making request to '${action}'`, data);

    // Debug the request data if enabled
    if (this.config.debug) {
      logger.log('Request details:', {
        url: this.config.ajaxUrl,
        action: action,
        nonce: this.config.nonce,
        data: data
      });
    }

    // Use the wpAjax utility from ajax.js
    return wpAjax(action, data, this.config.nonce)
      .catch(error => {
        // Check if this is a primary_conflict or duplicate case - these are expected responses, not errors
        if (error && error.data && (error.data.primary_conflict || error.data.duplicate)) {
          // This is expected behavior, don't log as error
          logger.log(`Request '${action}' returned expected response:`, error.data.primary_conflict ? 'primary conflict' : 'duplicate');
          throw error; // Still throw it so the calling code can handle it
        }

        logger.error(`Request '${action}' error:`, error);

        // Create a more informative error
        const enhancedError = new Error(`AJAX request failed: ${error.message}`);
        enhancedError.originalError = error;
        enhancedError.action = action;
        enhancedError.data = error.data; // Make sure to preserve the data

        // If we're allowed to fail, return a fallback empty response
        if (allowFailure) {
          logger.warn(`AJAX request to '${action}' failed but continuing with fallback data.`);
          // Return an empty success response as fallback
          return { success: true, data: {}, isFallback: true };
        }

        // Otherwise rethrow the error
        throw enhancedError;
      });
  }

  /**
   * Format form data into a string for AJAX requests
   * Using the existing formatFormData utility from ajax.js
   * @param {FormData | object | string} formData - The form data to format
   * @returns {string} Formatted form data
   */
  formatFormData(formData) {
    return formatFormData(formData);
  }


  /**
   * Get product data for storage
   * @param {object} data - Request data object containing product_id, room_width, room_length, room_products
   * @param {boolean} bypassCache - Whether to bypass the cache
   * @returns {Promise<object>} - A promise resolving to product data and suggestions
   */
  getProductDataForStorage(data, bypassCache = false) {
    // Validate product_id is present and valid
    if (!data.product_id || data.product_id === 'null' || data.product_id === 'undefined' || data.product_id === '0') {
      return Promise.reject(new Error('Product ID is required'));
    }

    // Ensure product_id is a string
    const productId = String(data.product_id);
    if (productId.trim() === '') {
      return Promise.reject(new Error('Product ID cannot be empty'));
    }

    // Create a modified data object with validated product_id
    const validatedData = {
      ...data,
      product_id: productId
    };

    // Create a cache key from the request data - use a simplified key based on product_id
    // We can't use the entire room_products array as part of the key as it's too complex
    const cacheKey = `data_${productId}_${validatedData.room_width || 0}_${validatedData.room_length || 0}`;

    // Check if we have cached data
    if (!bypassCache && this.cache.productData[cacheKey]) {
      logger.log(`Returning cached product data for key ${cacheKey}`);
      return Promise.resolve(this.cache.productData[cacheKey]);
    }

    // Make the request if no cache hit
    return this._request('get_product_data_for_storage', validatedData)
      .then(responseData => {
        // Cache the response
        if (responseData && responseData.product_data) {
          this.cache.productData[cacheKey] = responseData;
        }
        return responseData;
      })
      .catch(error => {
        // Clear cache on error
        delete this.cache.productData[cacheKey];
        throw error;
      });
  }



  /**
   * Get similar products for a specific product
   * @param {object} data - Request data object
   * @param {boolean} bypassCache - Whether to bypass the cache
   * @returns {Promise<Array>} - Promise resolving to an array of similar product objects
   */
  getSimilarProducts(data, bypassCache = false) {
    // Create a cache key from the request data
    const cacheKey = `similar_${data.product_id}_area_${data.room_area}`;

    // Check if we have cached data
    if (!bypassCache && this.cache.similarProducts[cacheKey]) {
      logger.log(`Returning cached similar products for key ${cacheKey}`);
      return Promise.resolve(this.cache.similarProducts[cacheKey]);
    }

    // Make the request if no cache hit
    return this._request('get_similar_products', data)
      .then(responseData => {
        // Cache the response
        if (responseData && Array.isArray(responseData.products)) {
          this.cache.similarProducts[cacheKey] = responseData;
        }
        return responseData;
      })
      .catch(error => {
        // Clear cache on error
        delete this.cache.similarProducts[cacheKey];
        throw error;
      });
  }


  /**
   * Fetch suggestions for a room after modifications
   * @param {object} data - Request data object
   * @param {boolean} bypassCache - Whether to bypass the cache
   * @returns {Promise<object>} - Promise resolving to updated suggestions
   */
  fetchSuggestionsForModifiedRoom(data, bypassCache = false) {
    // Create a cache key from the request data
    const cacheKey = `suggestions_${data.estimate_id}_${data.room_id}_${data.room_product_ids_for_suggestions}`;

    // Check if we have cached data
    if (!bypassCache && this.cache.suggestions[cacheKey]) {
      logger.log(`Returning cached suggestions for key ${cacheKey}`);
      return Promise.resolve(this.cache.suggestions[cacheKey]);
    }

    // Make the request if no cache hit
    return this._request('fetch_suggestions_for_modified_room', data)
      .then(responseData => {
        // Cache the response if it has the expected structure
        if (responseData && Array.isArray(responseData.updated_suggestions)) {
          this.cache.suggestions[cacheKey] = responseData;
        }
        return responseData;
      })
      .catch(error => {
        // Clear cache on error
        delete this.cache.suggestions[cacheKey];
        throw error;
      });
  }



  /**
   * Get the variation estimator content
   * @param {object} data - Request data object
   * @returns {Promise<object>} - Promise resolving to HTML content
   */
  getVariationEstimator(data) {
    return this._request('get_variation_estimator', data);
  }

  /**
   * Invalidate all caches or a specific cache type
   * @param {string|null} cacheType - Optional specific cache to invalidate
   */
  invalidateCache(cacheType = null) {
    if (cacheType && Object.prototype.hasOwnProperty.call(this.cache, cacheType)) {
      logger.log(`Invalidating ${cacheType} cache`);
      if (typeof this.cache[cacheType] === 'object') {
        this.cache[cacheType] = {};
      } else {
        this.cache[cacheType] = null;
      }
    } else {
      logger.log('Invalidating all caches');
      // Reset all caches
      this.cache = {
        productData: {},
        similarProducts: {},
        suggestions: {},
        estimatesData: null,
        rooms: {}
      };
    }
  }
}

// Export the class
export default AjaxService;
