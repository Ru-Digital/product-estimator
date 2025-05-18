/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/frontend/AjaxService.js":
/*!****************************************!*\
  !*** ./src/js/frontend/AjaxService.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils_ajax__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @utils/ajax */ "./src/js/utils/ajax.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");




function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/**
 * AjaxService.js
 *
 * Dedicated service for handling AJAX requests in the Product Estimator plugin.
 * This service provides specific methods for each AJAX action, giving better control
 * over request parameters and error handling for individual operations.
 * It utilizes the existing ajax.js utilities.
 */



var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_5__.createLogger)('AjaxService');
var AjaxService = /*#__PURE__*/function () {
  /**
   * Initialize the AjaxService
   * @param {object} config - Configuration options
   */
  function AjaxService() {
    var _window$productEstima, _window$productEstima2, _window$productEstima3;
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__["default"])(this, AjaxService);
    // Check for existing instance (singleton pattern)
    if (window._ajaxServiceInstance) {
      logger.log('Using existing AjaxService instance');
      // Return existing instance to ensure singleton
      return window._ajaxServiceInstance;
    }
    this.config = Object.assign({
      debug: false,
      ajaxUrl: ((_window$productEstima = window.productEstimatorVars) === null || _window$productEstima === void 0 ? void 0 : _window$productEstima.ajax_url) || '/wp-admin/admin-ajax.php',
      nonce: ((_window$productEstima2 = window.productEstimatorVars) === null || _window$productEstima2 === void 0 ? void 0 : _window$productEstima2.nonce) || '',
      i18n: ((_window$productEstima3 = window.productEstimatorVars) === null || _window$productEstima3 === void 0 ? void 0 : _window$productEstima3.i18n) || {}
    }, config);

    // Initialize cache for server-side data
    this.cache = {
      productUpgrades: {},
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
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__["default"])(AjaxService, [{
    key: "_request",
    value: function _request(action) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var allowFailure = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      logger.log("Making request to '".concat(action, "'"), data);

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
      return (0,_utils_ajax__WEBPACK_IMPORTED_MODULE_4__.wpAjax)(action, data, this.config.nonce)["catch"](function (error) {
        // Check if this is a primary_conflict or duplicate case - these are expected responses, not errors
        if (error && error.data && (error.data.primary_conflict || error.data.duplicate)) {
          // This is expected behavior, don't log as error
          logger.log("Request '".concat(action, "' returned expected response:"), error.data.primary_conflict ? 'primary conflict' : 'duplicate');
          throw error; // Still throw it so the calling code can handle it
        }
        logger.error("Request '".concat(action, "' error:"), error);

        // Create a more informative error
        var enhancedError = new Error("AJAX request failed: ".concat(error.message));
        enhancedError.originalError = error;
        enhancedError.action = action;
        enhancedError.data = error.data; // Make sure to preserve the data

        // If we're allowed to fail, return a fallback empty response
        if (allowFailure) {
          logger.warn("AJAX request to '".concat(action, "' failed but continuing with fallback data."));
          // Return an empty success response as fallback
          return {
            success: true,
            data: {},
            isFallback: true
          };
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
  }, {
    key: "formatFormData",
    value: function formatFormData(formData) {
      return (0,_utils_ajax__WEBPACK_IMPORTED_MODULE_4__.formatFormData)(formData);
    }

    /**
     * Get product upgrades
     * @param {object} data - Request data object
     * @param {boolean} bypassCache - Whether to bypass the cache
     * @returns {Promise<Array>} - A promise resolving to an array of upgrade options
     */
  }, {
    key: "getProductUpgrades",
    value: function getProductUpgrades(data) {
      var _this = this;
      var bypassCache = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      // Create a cache key from the request data
      var cacheKey = "".concat(data.product_id, "_").concat(data.estimate_id, "_").concat(data.room_id, "_").concat(data.upgrade_type);

      // Check if we have cached data
      if (!bypassCache && this.cache.productUpgrades[cacheKey]) {
        logger.log("Returning cached product upgrades for key ".concat(cacheKey));
        return Promise.resolve(this.cache.productUpgrades[cacheKey]);
      }

      // Make the request if no cache hit
      return this._request('get_product_upgrades', data).then(function (responseData) {
        // Cache the response
        if (responseData && responseData.upgrades) {
          _this.cache.productUpgrades[cacheKey] = responseData;
        }
        return responseData;
      })["catch"](function (error) {
        // Clear cache on error
        delete _this.cache.productUpgrades[cacheKey];
        throw error;
      });
    }

    /**
     * Get product data for storage
     * @param {object} data - Request data object containing product_id, room_width, room_length, room_products
     * @param {boolean} bypassCache - Whether to bypass the cache
     * @returns {Promise<object>} - A promise resolving to product data and suggestions
     */
  }, {
    key: "getProductDataForStorage",
    value: function getProductDataForStorage(data) {
      var _this2 = this;
      var bypassCache = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      // Validate product_id is present and valid
      if (!data.product_id || data.product_id === 'null' || data.product_id === 'undefined' || data.product_id === '0') {
        return Promise.reject(new Error('Product ID is required'));
      }

      // Ensure product_id is a string
      var productId = String(data.product_id);
      if (productId.trim() === '') {
        return Promise.reject(new Error('Product ID cannot be empty'));
      }

      // Create a modified data object with validated product_id
      var validatedData = _objectSpread(_objectSpread({}, data), {}, {
        product_id: productId
      });

      // Create a cache key from the request data - use a simplified key based on product_id
      // We can't use the entire room_products array as part of the key as it's too complex
      var cacheKey = "data_".concat(productId, "_").concat(validatedData.room_width || 0, "_").concat(validatedData.room_length || 0);

      // Check if we have cached data
      if (!bypassCache && this.cache.productData[cacheKey]) {
        logger.log("Returning cached product data for key ".concat(cacheKey));
        return Promise.resolve(this.cache.productData[cacheKey]);
      }

      // Make the request if no cache hit
      return this._request('get_product_data_for_storage', validatedData).then(function (responseData) {
        // Cache the response
        if (responseData && responseData.product_data) {
          _this2.cache.productData[cacheKey] = responseData;
        }
        return responseData;
      })["catch"](function (error) {
        // Clear cache on error
        delete _this2.cache.productData[cacheKey];
        throw error;
      });
    }

    /**
     * Add a product to a room
     * @param {object} data - Request data object
     * @returns {Promise<object>} - Promise resolving to result data
     */
  }, {
    key: "addProductToRoom",
    value: function addProductToRoom(data) {
      var _this3 = this;
      return this._request('add_product_to_room', data).then(function (response) {
        // Invalidate relevant caches since we've modified data
        _this3.invalidateCache('suggestions');
        return response;
      })["catch"](function (error) {
        // Check if this is a primary_conflict or duplicate case - these are expected responses, not errors
        if (error && error.data && (error.data.primary_conflict || error.data.duplicate)) {
          // This is expected behavior, just pass it through
          throw error;
        }

        // For other errors, log them and rethrow
        logger.error("Request 'add_product_to_room' error:", error);
        throw error;
      });
    }

    /**
     * Replace a product in a room with another product
     * @param {object} data - Request data object
     * @returns {Promise<object>} - Promise resolving to result data
     */
  }, {
    key: "replaceProductInRoom",
    value: function replaceProductInRoom(data) {
      var _this4 = this;
      return this._request('replace_product_in_room', data).then(function (response) {
        // Invalidate relevant caches since we've modified data
        _this4.invalidateCache('suggestions');
        _this4.invalidateCache('productData');
        return response;
      });
    }

    /**
     * Get similar products for a specific product
     * @param {object} data - Request data object
     * @param {boolean} bypassCache - Whether to bypass the cache
     * @returns {Promise<Array>} - Promise resolving to an array of similar product objects
     */
  }, {
    key: "getSimilarProducts",
    value: function getSimilarProducts(data) {
      var _this5 = this;
      var bypassCache = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      // Create a cache key from the request data
      var cacheKey = "similar_".concat(data.product_id, "_area_").concat(data.room_area);

      // Check if we have cached data
      if (!bypassCache && this.cache.similarProducts[cacheKey]) {
        logger.log("Returning cached similar products for key ".concat(cacheKey));
        return Promise.resolve(this.cache.similarProducts[cacheKey]);
      }

      // Make the request if no cache hit
      return this._request('get_similar_products', data).then(function (responseData) {
        // Cache the response
        if (responseData && Array.isArray(responseData.products)) {
          _this5.cache.similarProducts[cacheKey] = responseData;
        }
        return responseData;
      })["catch"](function (error) {
        // Clear cache on error
        delete _this5.cache.similarProducts[cacheKey];
        throw error;
      });
    }

    /**
     * Create a new estimate
     * @param {object} data - Request data object
     * @returns {Promise<object>} - Promise resolving to result data
     */
  }, {
    key: "addNewEstimate",
    value: function addNewEstimate(data) {
      var _this6 = this;
      return this._request('add_new_estimate', data).then(function (response) {
        // Invalidate relevant caches since we've modified data
        _this6.invalidateCache('estimatesData');
        return response;
      });
    }

    /**
     * Create a new room (without adding products)
     * @param {object} data - Request data object
     * @returns {Promise<object>} - Promise resolving to result data for the new room
     */
  }, {
    key: "addNewRoom",
    value: function addNewRoom(data) {
      var _this7 = this;
      return this._request('add_new_room', data).then(function (response) {
        // Invalidate relevant caches since we've modified data
        _this7.invalidateCache('rooms');
        return response;
      });
    }

    /**
     * Fetch suggestions for a room after modifications
     * @param {object} data - Request data object
     * @param {boolean} bypassCache - Whether to bypass the cache
     * @returns {Promise<object>} - Promise resolving to updated suggestions
     */
  }, {
    key: "fetchSuggestionsForModifiedRoom",
    value: function fetchSuggestionsForModifiedRoom(data) {
      var _this8 = this;
      var bypassCache = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      // Create a cache key from the request data
      var cacheKey = "suggestions_".concat(data.estimate_id, "_").concat(data.room_id, "_").concat(data.room_product_ids_for_suggestions);

      // Check if we have cached data
      if (!bypassCache && this.cache.suggestions[cacheKey]) {
        logger.log("Returning cached suggestions for key ".concat(cacheKey));
        return Promise.resolve(this.cache.suggestions[cacheKey]);
      }

      // Make the request if no cache hit
      return this._request('fetch_suggestions_for_modified_room', data).then(function (responseData) {
        // Cache the response if it has the expected structure
        if (responseData && Array.isArray(responseData.updated_suggestions)) {
          _this8.cache.suggestions[cacheKey] = responseData;
        }
        return responseData;
      })["catch"](function (error) {
        // Clear cache on error
        delete _this8.cache.suggestions[cacheKey];
        throw error;
      });
    }

    /**
     * Remove a product from a room
     * @param {object} data - Request data object
     * @returns {Promise<object>} - Promise resolving to result data
     */
  }, {
    key: "removeProductFromRoom",
    value: function removeProductFromRoom(data) {
      var _this9 = this;
      return this._request('remove_product_from_room', data).then(function (response) {
        // Invalidate relevant caches since we've modified data
        _this9.invalidateCache('suggestions');
        return response;
      });
    }

    /**
     * Remove a room from an estimate
     * @param {object} data - Request data object
     * @returns {Promise<object>} - Promise resolving to result data
     */
  }, {
    key: "removeRoom",
    value: function removeRoom(data) {
      var _this0 = this;
      // Debug the data before making the request
      logger.log('removeRoom data before request:', data);

      // Ensure estimate_id and room_id are valid strings, not undefined or empty
      if (!data.estimate_id || data.estimate_id === 'undefined' || data.estimate_id === '') {
        logger.error('Invalid estimate_id in removeRoom request:', data.estimate_id);
        return Promise.reject(new Error('Invalid estimate ID for room removal'));
      }
      if (!data.room_id || data.room_id === 'undefined' || data.room_id === '') {
        logger.error('Invalid room_id in removeRoom request:', data.room_id);
        return Promise.reject(new Error('Invalid room ID for room removal'));
      }

      // Force to string for consistency
      var requestData = _objectSpread(_objectSpread({}, data), {}, {
        estimate_id: String(data.estimate_id),
        room_id: String(data.room_id)
      });
      return this._request('remove_room', requestData).then(function (response) {
        // Invalidate relevant caches since we've modified data
        _this0.invalidateCache('rooms');
        _this0.invalidateCache('suggestions');
        return response;
      });
    }

    /**
     * Remove an entire estimate
     * @param {object} data - Request data object
     * @returns {Promise<object>} - Promise resolving to result data
     */
  }, {
    key: "removeEstimate",
    value: function removeEstimate(data) {
      var _this1 = this;
      // Debug the data before making the request
      logger.log('removeEstimate data before request:', data);

      // Ensure estimate_id is a valid string, not undefined or empty
      if (!data.estimate_id || data.estimate_id === 'undefined' || data.estimate_id === '') {
        logger.error('Invalid estimate_id in removeEstimate request:', data.estimate_id);
        return Promise.reject(new Error('Invalid estimate ID for estimate removal'));
      }

      // Force to string for consistency
      var requestData = _objectSpread(_objectSpread({}, data), {}, {
        estimate_id: String(data.estimate_id)
      });
      return this._request('remove_estimate', requestData).then(function (response) {
        // Invalidate all caches since this is a major change
        _this1.invalidateCache();
        return response;
      });
    }

    /**
     * Get the variation estimator content
     * @param {object} data - Request data object
     * @returns {Promise<object>} - Promise resolving to HTML content
     */
  }, {
    key: "getVariationEstimator",
    value: function getVariationEstimator(data) {
      return this._request('get_variation_estimator', data);
    }

    /**
     * Invalidate all caches or a specific cache type
     * @param {string|null} cacheType - Optional specific cache to invalidate
     */
  }, {
    key: "invalidateCache",
    value: function invalidateCache() {
      var cacheType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      if (cacheType && Object.prototype.hasOwnProperty.call(this.cache, cacheType)) {
        logger.log("Invalidating ".concat(cacheType, " cache"));
        if ((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(this.cache[cacheType]) === 'object') {
          this.cache[cacheType] = {};
        } else {
          this.cache[cacheType] = null;
        }
      } else {
        logger.log('Invalidating all caches');
        // Reset all caches
        this.cache = {
          productUpgrades: {},
          productData: {},
          similarProducts: {},
          suggestions: {},
          estimatesData: null,
          rooms: {}
        };
      }
    }
  }]);
}(); // Export the class
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AjaxService);

/***/ }),

/***/ "./src/js/frontend/ConfirmationDialog.js":
/*!***********************************************!*\
  !*** ./src/js/frontend/ConfirmationDialog.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/* harmony import */ var _TemplateEngine__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./TemplateEngine */ "./src/js/frontend/TemplateEngine.js");



function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/**
 * ConfirmationDialog.js
 *
 * Custom confirmation dialog component for Product Estimator plugin.
 * Uses TemplateEngine with HTML templates for proper styling and UI consistency.
 * 
 * Supports multiple dialog types through the 'action' parameter:
 * - default: Standard confirmation dialog (blue/primary styling)
 * - success: Success message dialog (green styling)
 * - warning: Warning message dialog (amber/orange styling)
 * - error: Error message dialog (red styling)
 * - delete: Deletion confirmation dialog (red styling)
 */



var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.createLogger)('ConfirmationDialog');
var ConfirmationDialog = /*#__PURE__*/function () {
  /**
   * Initialize the confirmation dialog
   */
  function ConfirmationDialog() {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__["default"])(this, ConfirmationDialog);
    this.dialogContainer = null;
    this.dialog = null;
    this.backdropElement = null;
    this.initialized = false;
    this.callbacks = {
      confirm: null,
      cancel: null
    };

    // Don't create dialog elements immediately
    // Only mark as initialized
    this.initialized = true;
    logger.log('ConfirmationDialog constructor completed');
  }

  /**
   * Convenience method for simple confirmation dialogs
   * For backwards compatibility with window.productEstimator.dialog.confirm()
   * @param {string} title - The dialog title
   * @param {string} message - The confirmation message
   * @param {Function} onConfirm - Callback for confirmation
   * @param {Function} onCancel - Callback for cancellation
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__["default"])(ConfirmationDialog, [{
    key: "confirm",
    value: function confirm(title, message, onConfirm, onCancel) {
      this.show({
        title: title,
        message: message,
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        action: 'default',
        onConfirm: onConfirm,
        onCancel: onCancel
      });
    }

    /**
     * Initialize the dialog component
     * Note: createDialogElements is now called on demand in show()
     */
  }, {
    key: "init",
    value: function init() {
      // Don't initialize more than once
      if (this.initialized) return;
      this.initialized = true;
      logger.log('ConfirmationDialog initialized');
    }

    /**
     * Create dialog DOM elements using the TemplateEngine
     */
  }, {
    key: "createDialogElements",
    value: function createDialogElements() {
      logger.log('Creating dialog elements');

      // Remove any existing dialog elements to avoid duplicates
      var existingContainer = document.getElementById('confirmation-dialog-container');
      if (existingContainer) {
        existingContainer.remove();
      }

      // Create the dialog container using TemplateEngine
      this.dialogContainer = document.createElement('div');
      this.dialogContainer.id = 'confirmation-dialog-container';

      // Insert the dialog template into the container
      _TemplateEngine__WEBPACK_IMPORTED_MODULE_4__["default"].insert('confirmation-dialog-template', {}, this.dialogContainer);

      // Get references to the backdrop and dialog elements
      this.backdropElement = this.dialogContainer.querySelector('.pe-dialog-backdrop');
      this.dialog = this.dialogContainer.querySelector('.pe-confirmation-dialog');

      // Append the container to the body
      document.body.appendChild(this.dialogContainer);

      // Bind events now that elements are in the DOM
      this.bindEvents();
      logger.log('Dialog elements created and appended to body');
    }

    /**
     * Bind events to dialog elements
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this = this;
      if (!this.dialog) {
        logger.error('Cannot bind events: dialog element not found');
        return;
      }
      logger.log('Binding events to dialog elements');

      // Get elements
      var closeBtn = this.dialog.querySelector('.pe-dialog-close');
      var cancelBtn = this.dialog.querySelector('.pe-dialog-cancel');
      var confirmBtn = this.dialog.querySelector('.pe-dialog-confirm');

      // Close button
      if (closeBtn) {
        closeBtn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          _this.hide();
          if (typeof _this.callbacks.cancel === 'function') {
            _this.callbacks.cancel();
          }
        });
      }

      // Cancel button
      if (cancelBtn) {
        cancelBtn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          _this.hide();
          if (typeof _this.callbacks.cancel === 'function') {
            _this.callbacks.cancel();
          }
        });

        // Hover effects are handled by CSS classes
      }

      // Confirm button
      if (confirmBtn) {
        confirmBtn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          _this.hide();
          if (typeof _this.callbacks.confirm === 'function') {
            _this.callbacks.confirm();
          }
        });

        // Hover effects are handled by CSS classes
      }

      // Backdrop click
      if (this.backdropElement) {
        this.backdropElement.addEventListener('click', function (e) {
          if (e.target === _this.backdropElement) {
            e.preventDefault();
            e.stopPropagation();
            _this.hide();
            if (typeof _this.callbacks.cancel === 'function') {
              _this.callbacks.cancel();
            }
          }
        });
      }

      // Prevent clicks inside dialog from propagating
      if (this.dialog) {
        this.dialog.addEventListener('click', function (e) {
          e.stopPropagation();
        });
      }

      // Escape key handler
      this.escKeyHandler = function (e) {
        if (e.key === 'Escape' && _this.isVisible()) {
          e.preventDefault();
          e.stopPropagation();
          _this.hide();
          if (typeof _this.callbacks.cancel === 'function') {
            _this.callbacks.cancel();
          }
        }
      };

      // Add ESC key listener
      document.addEventListener('keydown', this.escKeyHandler);
      logger.log('Events bound to dialog elements');
    }

    /**
     * Show the dialog with the specified options
     * @param {object} options - Configuration options for the dialog
     */
  }, {
    key: "show",
    value: function show() {
      var _window$productEstima,
        _this2 = this;
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      // Always recreate the dialog to ensure it's fresh and properly configured
      this.hide();

      // Create new dialog elements
      this.createDialogElements();

      // If creation failed, use fallback
      if (!this.dialog || !this.backdropElement) {
        logger.error('Failed to create dialog elements');
        var message = options.message || 'Are you sure?';
        if (confirm(message)) {
          if (typeof options.onConfirm === 'function') {
            options.onConfirm();
          }
        } else {
          if (typeof options.onCancel === 'function') {
            options.onCancel();
          }
        }
        return;
      }

      // Get text from localized strings if available
      var i18n = ((_window$productEstima = window.productEstimatorVars) === null || _window$productEstima === void 0 ? void 0 : _window$productEstima.i18n) || {};
      var defaults = {
        title: 'Confirm Action',
        message: 'Are you sure you want to proceed?',
        type: '',
        // product, room, estimate - entity type for context
        confirmText: i18n.confirm || 'Confirm',
        cancelText: i18n.cancel || 'Cancel',
        onConfirm: null,
        onCancel: null,
        action: 'default',
        // dialog type: 'default', 'success', 'warning', 'error', 'delete'
        showCancel: true // Option to control cancel button visibility
      };

      // Merge options with defaults
      var settings = _objectSpread(_objectSpread({}, defaults), options);

      // If cancelText is explicitly null/false, hide the cancel button
      if (options.cancelText === null || options.cancelText === false) {
        settings.showCancel = false;
      }

      // Set callbacks
      this.callbacks.confirm = settings.onConfirm;
      this.callbacks.cancel = settings.onCancel;

      // Update dialog content
      var titleEl = this.dialog.querySelector('.pe-dialog-title');
      var messageEl = this.dialog.querySelector('.pe-dialog-message');
      var confirmEl = this.dialog.querySelector('.pe-dialog-confirm');
      var cancelEl = this.dialog.querySelector('.pe-dialog-cancel');
      var buttonsContainer = this.dialog.querySelector('.pe-dialog-buttons');

      // Update text content with settings
      if (titleEl) {
        titleEl.textContent = settings.title;
      }
      if (messageEl) {
        // Allow HTML content in the message for more complex formatting
        if (settings.message.includes('<br') || settings.message.includes('<span') || settings.message.includes('<strong')) {
          messageEl.innerHTML = settings.message;
        } else {
          messageEl.textContent = settings.message;
        }
      }
      if (confirmEl) {
        confirmEl.textContent = settings.confirmText;
      }

      // Handle cancel button visibility
      if (cancelEl) {
        if (settings.showCancel) {
          cancelEl.classList.remove('hidden');
          cancelEl.textContent = settings.cancelText;

          // When cancel is visible, ensure confirm button isn't full width
          if (confirmEl) {
            confirmEl.classList.remove('full-width');
          }
        } else {
          cancelEl.classList.add('hidden');

          // When cancel button is hidden, make confirm button full width
          if (confirmEl) {
            confirmEl.classList.add('full-width');
          }
        }
      }

      // Handle additional buttons if provided
      if (settings.additionalButtons && buttonsContainer) {
        // Clear any existing additional buttons
        var existingAdditionalButtons = buttonsContainer.querySelectorAll('.pe-dialog-additional');
        existingAdditionalButtons.forEach(function (btn) {
          return btn.remove();
        });

        // Add new additional buttons
        settings.additionalButtons.forEach(function (buttonConfig, index) {
          var button = document.createElement('button');
          button.className = 'pe-button pe-button-secondary pe-dialog-additional';
          button.textContent = buttonConfig.text || "Button ".concat(index + 1);

          // Set up click handler
          button.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            _this2.hide();
            if (typeof buttonConfig.callback === 'function') {
              buttonConfig.callback();
            }
          });

          // Insert the button after the cancel button or before confirm if no cancel
          if (cancelEl && settings.showCancel) {
            buttonsContainer.insertBefore(button, confirmEl);
          } else {
            buttonsContainer.insertBefore(button, confirmEl);
          }
        });
      }

      // Prevent scrolling on the body while modal is active
      document.body.style.overflow = 'hidden';

      // Make backdrop visible with CSS classes
      if (this.backdropElement) {
        this.backdropElement.classList.add('visible');
      }
      if (this.dialog) {
        // Add the visible class for transitions
        this.dialog.classList.add('visible');

        // Always apply an action-specific class for styling
        // Remove any existing action classes first
        this.dialog.classList.remove('pe-dialog-action-default', 'pe-dialog-action-delete', 'pe-dialog-action-error', 'pe-dialog-action-warning', 'pe-dialog-action-success');

        // Map certain actions to standard types for consistency
        var actionClass = settings.action || 'default';

        // Normalize action types for consistent styling
        if (actionClass === 'add') actionClass = 'success';
        if (actionClass === 'remove') actionClass = 'delete';

        // Add the specific action class
        this.dialog.classList.add("pe-dialog-action-".concat(actionClass));
      }

      // Focus the appropriate button after a short delay
      setTimeout(function () {
        var buttonToFocus = settings.showCancel && cancelEl ? cancelEl : confirmEl;
        if (buttonToFocus) {
          buttonToFocus.focus();
        }
      }, 100);
    }

    /**
     * Hide the dialog
     */
  }, {
    key: "hide",
    value: function hide() {
      // Restore body scrolling
      document.body.style.overflow = '';

      // Check if dialog elements exist
      if (!this.dialogContainer) {
        return;
      }

      // Hide dialog by removing visible class
      if (this.backdropElement) {
        this.backdropElement.classList.remove('visible');
      }
      if (this.dialog) {
        this.dialog.classList.remove('visible');
      }

      // Remove the dialog container from DOM immediately
      // Don't delay as we're recreating on each show() call
      if (this.dialogContainer) {
        this.dialogContainer.remove();

        // Reset references
        this.dialogContainer = null;
        this.backdropElement = null;
        this.dialog = null;
      }
    }

    /**
     * Check if dialog is visible
     * @returns {boolean} Whether dialog is visible
     */
  }, {
    key: "isVisible",
    value: function isVisible() {
      return this.dialog && this.backdropElement && this.backdropElement.classList.contains('visible');
    }
  }]);
}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ConfirmationDialog);

/***/ }),

/***/ "./src/js/frontend/CustomerDetailsManager.js":
/*!***************************************************!*\
  !*** ./src/js/frontend/CustomerDetailsManager.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/* harmony import */ var _CustomerStorage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./CustomerStorage */ "./src/js/frontend/CustomerStorage.js");
/* harmony import */ var _DataService__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./DataService */ "./src/js/frontend/DataService.js");


/**
 * CustomerDetailsManager.js
 *
 * Module for handling customer details editing and deletion in the Product Estimator.
 * Follows the ES6 module architecture used in the project.
 */


 // Import the new functions

var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.createLogger)('CustomerDetailsManager');
var CustomerDetailsManager = /*#__PURE__*/function () {
  /**
   * Initialize the CustomerDetailsManager
   * @param {object} config - Configuration options
   * @param {DataService} dataService - The data service instance
   * @param {object} modalManager - Reference to the modal manager (optional)
   */
  function CustomerDetailsManager() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var dataService = arguments.length > 1 ? arguments[1] : undefined;
    var modalManager = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, CustomerDetailsManager);
    // Default configuration
    this.config = Object.assign({
      debug: false,
      selectors: {
        editButton: '#edit-customer-details-btn',
        deleteButton: '#delete-customer-details-btn',
        saveButton: '#save-customer-details-btn',
        cancelButton: '#cancel-edit-customer-details-btn',
        detailsContainer: '.saved-customer-details',
        detailsHeader: '.customer-details-header',
        editForm: '.customer-details-edit-form',
        formContainer: '.product-estimator-modal-form-container'
      },
      i18n: {}
    }, config);

    // Store reference to data service and modal manager
    this.dataService = dataService;
    this.modalManager = modalManager;

    // State
    this.initialized = false;
    this.eventHandlers = {};

    // Initialize if config says so
    if (config.autoInit !== false) {
      this.init();
    }
  }

  /**
   * Initialize the manager
   * @returns {CustomerDetailsManager} This instance for chaining
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(CustomerDetailsManager, [{
    key: "init",
    value: function init() {
      if (this.initialized) {
        logger.log('CustomerDetailsManager already initialized');
        return this;
      }

      // Bind events
      this.bindEvents();

      // Add a custom event listener for customer details updates from other sources
      document.addEventListener('customer_details_updated', this.onCustomerDetailsUpdated.bind(this));
      this.initialized = true;
      logger.log('CustomerDetailsManager initialized');
      return this;
    }

    /**
     * Handle customer details updated event from other sources
     * @param {CustomEvent} event - The custom event with updated details
     */
  }, {
    key: "onCustomerDetailsUpdated",
    value: function onCustomerDetailsUpdated(event) {
      if (event.detail && event.detail.details) {
        logger.log('Received customer_details_updated event', event.detail);

        // Update the customer details display UI elements
        this.updateDisplayedDetails(event.detail.details);

        // Only check and update email field in the customer details edit form,
        // not in the new estimate form - this prevents field value synchronization issues
        this.checkAndUpdateEmailField(event.detail.details);

        // Important: we should never synchronize values between the customer details
        // form and the new estimate form as they serve different purposes
      }
    }

    /**
     * Check if email was added and update the form accordingly
     * @param {object} details - The updated customer details
     */
  }, {
    key: "checkAndUpdateEmailField",
    value: function checkAndUpdateEmailField(details) {
      var hasEmail = details && details.email && details.email.trim() !== '';
      logger.log("Checking for email field updates: hasEmail=".concat(hasEmail));

      // If the customer details edit form is already visible, update ONLY that form
      // NOT any other forms like the new estimate form
      var customerEditForms = document.querySelectorAll(this.config.selectors.editForm);
      customerEditForms.forEach(function (editForm) {
        // Skip if this is not a customer details edit form
        // (check for a customer-specific identifier to ensure we're only updating customer forms)
        if (!editForm.classList.contains('customer-details-edit-form') && !editForm.closest('.saved-customer-details') && !editForm.querySelector('#edit-customer-name')) {
          logger.log('Skipping non-customer details form to prevent field synchronization issues');
          return;
        }
        // Check if email field already exists
        var emailField = editForm.querySelector('#edit-customer-email');

        // If email field doesn't exist but we have an email, add it
        if (!emailField && hasEmail) {
          logger.log('Adding email field to edit form');

          // Create the email field group
          var emailGroup = document.createElement('div');
          emailGroup.className = 'form-group';

          // Create the label
          var emailLabel = document.createElement('label');
          emailLabel.setAttribute('for', 'edit-customer-email');
          emailLabel.textContent = 'Email Address';

          // Create the input
          emailField = document.createElement('input');
          emailField.type = 'email';
          emailField.id = 'edit-customer-email';
          emailField.name = 'edit_customer_email';
          emailField.value = details.email;

          // Add elements to the DOM
          emailGroup.appendChild(emailLabel);
          emailGroup.appendChild(emailField);

          // Find position to insert (after name field, before phone if exists)
          var _nameField = editForm.querySelector('#edit-customer-name');
          if (_nameField) {
            var nameGroup = _nameField.closest('.form-group');
            if (nameGroup) {
              nameGroup.parentNode.insertBefore(emailGroup, nameGroup.nextSibling);
            } else {
              // Just append if we can't find the right position
              editForm.querySelector('h4').after(emailGroup);
            }
          }
        } else if (emailField && hasEmail) {
          // If field exists, ensure value is up to date
          emailField.value = details.email;
        }

        // Update other fields if they exist - but ONLY in the customer details edit form
        // NOT in the estimate creation form, which has its own separate fields
        var nameField = editForm.querySelector('#edit-customer-name');
        if (nameField && details.name) {
          nameField.value = details.name;
        }
        var phoneField = editForm.querySelector('#edit-customer-phone');
        if (phoneField && details.phone) {
          phoneField.value = details.phone;
        }
        var postcodeField = editForm.querySelector('#edit-customer-postcode');
        if (postcodeField && details.postcode) {
          postcodeField.value = details.postcode;
        }
      });

      // Update ONLY the data-has-email attribute on new estimate forms,
      // but DO NOT update any actual form field values in the new estimate form
      var newEstimateForms = document.querySelectorAll('#new-estimate-form');
      newEstimateForms.forEach(function (form) {
        // Only update the data attribute, never the form fields directly
        form.setAttribute('data-has-email', hasEmail ? 'true' : 'false');

        // Add explicit protection to prevent postcode-to-name field synchronization
        // Add a one-time event listener to prevent the first input to postcode field from affecting the name field
        if (!form._fieldProtectionAdded) {
          var postcodeField = form.querySelector('#customer-postcode');
          var nameField = form.querySelector('#estimate-name');
          if (postcodeField && nameField) {
            logger.log('Adding protection to prevent field value synchronization in estimate form');

            // Store the original values from fields when the form is first rendered
            var nameOriginal = nameField.value;

            // Add an input event listener to detect when the postcode field changes
            postcodeField.addEventListener('input', function () {
              // If the name field now contains the postcode value (indicating unwanted sync),
              // restore it to its proper value
              if (nameField.value === postcodeField.value && nameOriginal !== postcodeField.value) {
                logger.log('Preventing postcode-to-name field sync - restoring name field value');
                nameField.value = nameOriginal;
              }
            });

            // Add a change event listener to the name field to keep track of user-intended changes
            nameField.addEventListener('change', function () {
              // Update the stored original value when the user deliberately changes it
              nameOriginal = nameField.value;
              logger.log('Name field changed by user, new value stored:', nameOriginal);
            });

            // Mark this form as protected
            form._fieldProtectionAdded = true;
          }
        }
      });
    }
    /**
     * Bind events for customer details management
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      // Find the buttons
      var editButton = document.querySelector(this.config.selectors.editButton);
      var deleteButton = document.querySelector(this.config.selectors.deleteButton);
      var saveButton = document.querySelector(this.config.selectors.saveButton);
      var cancelButton = document.querySelector(this.config.selectors.cancelButton);

      // Only proceed if we have the necessary elements
      if (!editButton) {
        logger.log('Edit button not found, skipping event binding');
        return;
      }

      // Edit button - show edit form
      this.bindButtonWithHandler(editButton, 'click', this.handleEditClick.bind(this));

      // Delete button - confirm then delete
      if (deleteButton) {
        this.bindButtonWithHandler(deleteButton, 'click', this.handleDeleteClick.bind(this));
      }

      // Save button - save updated details
      if (saveButton) {
        this.bindButtonWithHandler(saveButton, 'click', this.handleSaveClick.bind(this));
      }

      // Cancel button - hide edit form
      if (cancelButton) {
        this.bindButtonWithHandler(cancelButton, 'click', this.handleCancelClick.bind(this));
      }

      // logger.log('Customer details events bound');
    }

    /**
     * Helper to safely bind event with removal of previous handlers
     * @param {HTMLElement} element - Element to bind to
     * @param {string} eventType - Event type to bind
     * @param {Function} handler - Event handler
     */
  }, {
    key: "bindButtonWithHandler",
    value: function bindButtonWithHandler(element, eventType, handler) {
      if (!element) return;

      // Store handler reference on element for later removal
      var handlerKey = "_".concat(eventType, "Handler");

      // Remove existing handler if it exists
      if (element[handlerKey]) {
        element.removeEventListener(eventType, element[handlerKey]);
      }

      // Store new handler reference
      element[handlerKey] = handler;

      // Add the event listener
      element.addEventListener(eventType, handler);
    }

    /**
     * Handle edit button click
     * @param {Event} e - Click event
     */
  }, {
    key: "handleEditClick",
    value: function handleEditClick(e) {
      e.preventDefault();
      e.stopPropagation();
      var detailsContainer = document.querySelector(this.config.selectors.detailsContainer);
      var detailsHeader = document.querySelector(this.config.selectors.detailsHeader);
      var editForm = document.querySelector(this.config.selectors.editForm);
      if (detailsContainer) detailsContainer.style.display = 'none';
      if (detailsHeader) detailsHeader.style.display = 'none';
      if (editForm) editForm.style.display = 'block';
      logger.log('Edit form displayed');
    }

    /**
     * Handle cancel button click
     * @param {Event} e - Click event
     */
  }, {
    key: "handleCancelClick",
    value: function handleCancelClick(e) {
      e.preventDefault();
      e.stopPropagation();
      var detailsContainer = document.querySelector(this.config.selectors.detailsContainer);
      var detailsHeader = document.querySelector(this.config.selectors.detailsHeader);
      var editForm = document.querySelector(this.config.selectors.editForm);
      if (editForm) editForm.style.display = 'none';
      if (detailsContainer) detailsContainer.style.display = 'block';
      if (detailsHeader) detailsHeader.style.display = 'flex';
      logger.log('Edit form hidden');
    }

    /**
     * Handle save button click
     * @param {Event} e - Click event
     */
  }, {
    key: "handleSaveClick",
    value: function handleSaveClick(e) {
      var _document$getElementB,
        _document$getElementB2,
        _this = this;
      e.preventDefault();
      e.stopPropagation();
      var saveButton = e.target;
      var originalText = saveButton.textContent;

      // Show loading state
      saveButton.textContent = this.config.i18n && this.config.i18n.saving || 'Saving...';
      saveButton.disabled = true;

      // Get updated details - collect all available fields
      var updatedDetails = {
        name: ((_document$getElementB = document.getElementById('edit-customer-name')) === null || _document$getElementB === void 0 ? void 0 : _document$getElementB.value) || '',
        postcode: ((_document$getElementB2 = document.getElementById('edit-customer-postcode')) === null || _document$getElementB2 === void 0 ? void 0 : _document$getElementB2.value) || ''
      };

      // Add email and phone if they exist in the form
      var emailField = document.getElementById('edit-customer-email');
      if (emailField) {
        updatedDetails.email = emailField.value || '';
      }
      var phoneField = document.getElementById('edit-customer-phone');
      if (phoneField) {
        updatedDetails.phone = phoneField.value || '';
      }

      // Use the imported saveCustomerDetails function
      try {
        (0,_CustomerStorage__WEBPACK_IMPORTED_MODULE_3__.saveCustomerDetails)(updatedDetails); // Use the imported function
        logger.log('Customer details saved to localStorage:', updatedDetails);

        // 2. Now, send the update to the server asynchronously using DataService
        this.dataService.request('update_customer_details', {
          details: JSON.stringify(updatedDetails)
        }).then(function (data) {
          // Handle successful server update
          logger.log('Customer details updated on server successfully:', data);
          _this.handleSaveSuccess(data, updatedDetails); // Call success handler with server response data and updated details
        })["catch"](function (error) {
          // Handle server update error
          _this.handleSaveError(error); // Show error message
          // Note: Details are already saved locally, so we don't revert local storage on server error.
        })["finally"](function () {
          // This block runs after both success or error of the AJAX request
          saveButton.textContent = originalText;
          saveButton.disabled = false;
        });
      } catch (localStorageError) {
        // Handle synchronous local storage save error
        logger.log('Error saving to localStorage using imported function:', localStorageError);
        this.showError('Could not save details locally.'); // Show local storage error
        // We still attempt server save even if local save fails
        this.dataService.request('update_customer_details', {
          details: JSON.stringify(updatedDetails)
        }).then(function (data) {
          // Handle successful server update even after local failure
          logger.log('Customer details updated on server successfully (after local storage error):', data);
          _this.handleSaveSuccess(data, updatedDetails); // Call success handler
        })["catch"](function (error) {
          // Handle server update error after local failure
          _this.handleSaveError(error); // Show server error message
        })["finally"](function () {
          // This block runs after both success or error of the AJAX request
          saveButton.textContent = originalText;
          saveButton.disabled = false;
        });
      }
    }

    /**
     * Handle successful save response
     * @param {object} data - Response data
     * @param {object} updatedDetails - The details that were updated
     */
  }, {
    key: "handleSaveSuccess",
    value: function handleSaveSuccess(data, updatedDetails) {
      // Update the displayed customer details
      this.updateDisplayedDetails(updatedDetails); // Use the passed updatedDetails

      // Check if email was added and update forms
      this.checkAndUpdateEmailField(updatedDetails); // Use updatedDetails

      // Show success message
      this.showMessage('success', data.message || 'Details updated successfully!');

      // Hide edit form, show details view
      var detailsContainer = document.querySelector(this.config.selectors.detailsContainer);
      var detailsHeader = document.querySelector(this.config.selectors.detailsHeader);
      var editForm = document.querySelector(this.config.selectors.editForm);
      if (editForm) editForm.style.display = 'none';
      if (detailsContainer) detailsContainer.style.display = 'block';
      if (detailsHeader) detailsHeader.style.display = 'flex';

      // Dispatch event to notify other components of the update
      var event = new CustomEvent('customer_details_updated', {
        bubbles: true,
        detail: {
          details: updatedDetails // Use updatedDetails
        }
      });
      document.dispatchEvent(event);
      logger.log('Customer details updated successfully', data);
    }

    /**
     * Handle save error
     * @param {Error} error - The error that occurred
     */
  }, {
    key: "handleSaveError",
    value: function handleSaveError(error) {
      this.showMessage('error', error.message || 'Error updating details. Please try again.');
      logger.log('Error saving customer details:', error);
    }

    /**
     * Handle delete button click
     * @param {Event} e - Click event
     */
  }, {
    key: "handleDeleteClick",
    value: function handleDeleteClick(e) {
      var _this2 = this;
      e.preventDefault();
      e.stopPropagation();

      // Check if modalManager.confirmationDialog is available
      if (this.modalManager && this.modalManager.confirmationDialog) {
        this.modalManager.confirmationDialog.show({
          title: this.config.i18n && this.config.i18n.delete_customer_details || 'Delete Customer Details',
          message: this.config.i18n && this.config.i18n.confirm_delete_details || 'Are you sure you want to delete your saved details?',
          confirmText: this.config.i18n && this.config.i18n["delete"] || 'Delete',
          action: 'delete',
          cancelText: this.config.i18n.cancel || 'Cancel',
          onConfirm: function onConfirm() {
            _this2.deleteCustomerDetails();
          }
        });
      }
      // Fallback to window.productEstimator.dialog if available
      else if (window.productEstimator && window.productEstimator.dialog) {
        window.productEstimator.dialog.show({
          title: this.config.i18n && this.config.i18n.delete_customer_details || 'Delete Customer Details',
          message: this.config.i18n && this.config.i18n.confirm_delete_details || 'Are you sure you want to delete your saved details?',
          confirmText: this.config.i18n && this.config.i18n["delete"] || 'Delete',
          action: 'delete',
          cancelText: this.config.i18n.cancel || 'Cancel',
          onConfirm: function onConfirm() {
            _this2.deleteCustomerDetails();
          }
        });
      } else {
        // Fallback to regular confirm
        if (confirm(this.config.i18n.confirm_delete_details || 'Are you sure you want to delete your saved details?')) {
          this.deleteCustomerDetails();
        }
      }
    }

    /**
     * Delete customer details
     */
  }, {
    key: "deleteCustomerDetails",
    value: function deleteCustomerDetails() {
      var _this3 = this;
      // Get the customer details confirmation container
      var confirmationContainer = document.querySelector('.customer-details-confirmation');
      if (confirmationContainer) {
        confirmationContainer.classList.add('loading');
      }

      // Use the imported clearCustomerDetails function
      try {
        (0,_CustomerStorage__WEBPACK_IMPORTED_MODULE_3__.clearCustomerDetails)(); // Clear using imported function
        logger.log('Customer details removed from localStorage using imported function'); // Log the success
        this.handleDeleteSuccess({
          message: "Details deleted successfully from local storage"
        }, confirmationContainer);
      } catch (e) {
        logger.log('localStorage error on delete using imported function', e); // Log any error
      }

      // Use the dataService to make the AJAX request if available
      if (this.dataService && typeof this.dataService.request === 'function') {
        this.dataService.request('delete_customer_details').then(function (data) {
          _this3.handleDeleteSuccess(data, confirmationContainer);
        })["catch"](function (error) {
          _this3.handleDeleteError(error, confirmationContainer);
        });
      } else {
        var _window$productEstima, _window$productEstima2;
        // Fallback to direct fetch
        fetch(((_window$productEstima = window.productEstimatorVars) === null || _window$productEstima === void 0 ? void 0 : _window$productEstima.ajax_url) || '/wp-admin/admin-ajax.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            action: 'delete_customer_details',
            nonce: ((_window$productEstima2 = window.productEstimatorVars) === null || _window$productEstima2 === void 0 ? void 0 : _window$productEstima2.nonce) || ''
          })
        }).then(function (response) {
          return response.json();
        }).then(function (response) {
          if (response.success) {
            _this3.handleDeleteSuccess(response.data, confirmationContainer);
          } else {
            var _response$data;
            _this3.handleDeleteError(new Error(((_response$data = response.data) === null || _response$data === void 0 ? void 0 : _response$data.message) || 'Error deleting details'), confirmationContainer);
          }
        })["catch"](function (error) {
          _this3.handleDeleteError(error, confirmationContainer);
        });
      }
    }

    /**
     * Handle successful delete response
     * @param {object} data - Response data
     * @param {HTMLElement} confirmationContainer - The container element
     */
  }, {
    key: "handleDeleteSuccess",
    value: function handleDeleteSuccess(data, confirmationContainer) {
      // Replace the details container with the new form
      if (confirmationContainer && data.html) {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = data.html;
        confirmationContainer.parentNode.replaceChild(tempDiv.firstElementChild, confirmationContainer);
      }

      // Show success message
      this.showMessage('success', data.message || 'Details deleted successfully!');

      // Update data-has-email attribute on the main form
      var newEstimateForm = document.querySelector('#new-estimate-form');
      if (newEstimateForm) {
        newEstimateForm.setAttribute('data-has-email', 'false');
      }

      // Dispatch event to notify other components
      var event = new CustomEvent('customer_details_deleted', {
        bubbles: true
      });
      document.dispatchEvent(event);
      logger.log('Customer details deleted');
    }

    /**
     * Handle delete error
     * @param {Error} error - The error that occurred
     * @param {HTMLElement} confirmationContainer - The container element
     */
  }, {
    key: "handleDeleteError",
    value: function handleDeleteError(error, confirmationContainer) {
      this.showMessage('error', error.message || 'Error deleting details!');
      logger.log('Error deleting details:', error);

      // Remove loading class
      if (confirmationContainer) {
        confirmationContainer.classList.remove('loading');
      }
    }

    /**
     * Update the displayed customer details in the DOM
     * @param {object} details - The updated details
     */
  }, {
    key: "updateDisplayedDetails",
    value: function updateDisplayedDetails(details) {
      var detailsContainers = document.querySelectorAll(this.config.selectors.detailsContainer);
      if (!detailsContainers.length) {
        logger.log('No customer details containers found for updating');
        return;
      }
      logger.log("Updating ".concat(detailsContainers.length, " customer details containers"));
      detailsContainers.forEach(function (container) {
        // Build HTML with new details
        var detailsHtml = '<p>';
        if (details.name && details.name.trim() !== '') {
          detailsHtml += "<strong>".concat(details.name, "</strong><br>");
        }
        if (details.email && details.email.trim() !== '') {
          detailsHtml += "".concat(details.email, "<br>");
        }
        if (details.phone && details.phone.trim() !== '') {
          detailsHtml += "".concat(details.phone, "<br>");
        }
        detailsHtml += details.postcode || '';
        detailsHtml += '</p>';

        // Update container
        container.innerHTML = detailsHtml;
      });
    }

    /**
     * Show a message to the user
     * @param {string} type - Message type ('success' or 'error')
     * @param {string} message - The message to display
     */
  }, {
    key: "showMessage",
    value: function showMessage(type, message) {
      // Remove any existing messages
      var existingMessages = document.querySelectorAll('.modal-message');
      existingMessages.forEach(function (msg) {
        return msg.remove();
      });

      // Create message element
      var messageClass = type === 'error' ? 'modal-error-message' : 'modal-success-message';
      var messageEl = document.createElement('div');
      messageEl.className = "modal-message ".concat(messageClass);
      messageEl.textContent = message;

      // Add to form container
      var formContainer = document.querySelector(this.config.selectors.formContainer);
      if (formContainer) {
        formContainer.prepend(messageEl);

        // Auto-remove after 5 seconds
        setTimeout(function () {
          messageEl.remove();
        }, 5000);
      }
    }
  }]);
}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CustomerDetailsManager);

/***/ }),

/***/ "./src/js/frontend/CustomerStorage.js":
/*!********************************************!*\
  !*** ./src/js/frontend/CustomerStorage.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearCustomerDetails: () => (/* binding */ clearCustomerDetails),
/* harmony export */   loadCustomerDetails: () => (/* binding */ loadCustomerDetails),
/* harmony export */   saveCustomerDetails: () => (/* binding */ saveCustomerDetails)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/**
 * CustomerStorage.js
 *
 * Handles customer details persistence using localStorage and sessionStorage.
 * Uses the 'productEstimatorCustomerData' key for storage.
 */

var STORAGE_KEY = 'productEstimatorCustomerData';

var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.createLogger)('CustomerStorage');

/**
 * Load customer details from localStorage with fallback to sessionStorage.
 * @returns {object} Customer details object.
 */
function loadCustomerDetails() {
  try {
    var storedDetails = localStorage.getItem(STORAGE_KEY);
    if (storedDetails) {
      return JSON.parse(storedDetails);
    } else {
      var sessionDetails = sessionStorage.getItem(STORAGE_KEY);
      return sessionDetails ? JSON.parse(sessionDetails) : {};
    }
  } catch (error) {
    logger.error('Error loading customer details:', error);
    return {}; // Return empty object on error
  }
}

/**
 * Save customer details to localStorage with fallback to sessionStorage.
 * @param {object} details - Customer details to save.
 */
function saveCustomerDetails(details) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
  } catch (localStorageError) {
    logger.warn('localStorage not available, using sessionStorage:', localStorageError);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(details));
    } catch (sessionStorageError) {
      logger.error('sessionStorage not available:', sessionStorageError);
      // If neither is available, details won't persist, but we can continue
    }
  }
}

/**
 * Clear customer details from both localStorage and sessionStorage.
 */
function clearCustomerDetails() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (localStorageError) {
    logger.warn('localStorage not available:', localStorageError);
  }
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (sessionStorageError) {
    logger.warn('sessionStorage not available:', sessionStorageError);
  }
}

// You can also export these functions as a default object if preferred:
/*
export default {
  loadCustomerDetails,
  saveCustomerDetails,
  clearCustomerDetails
};
*/

/***/ }),

/***/ "./src/js/frontend/DataService.js":
/*!****************************************!*\
  !*** ./src/js/frontend/DataService.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/* harmony import */ var _AjaxService__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./AjaxService */ "./src/js/frontend/AjaxService.js");
/* harmony import */ var _EstimateStorage__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./EstimateStorage */ "./src/js/frontend/EstimateStorage.js");






function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_3__["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/**
 * DataService.js
 *
 * Centralized service for all data operations in the Product Estimator plugin.
 * Provides a clean API for data operations and handles errors consistently.
 * Uses AjaxService for HTTP requests and EstimateStorage for local storage operations.
 */



 // Import necessary functions from storage

var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_6__.createLogger)('DataService');
var DataService = /*#__PURE__*/function () {
  /**
   * Initialize the DataService
   * @param {object} config - Configuration options
   */
  function DataService() {
    var _window$productEstima, _window$productEstima2, _window$productEstima3;
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_4__["default"])(this, DataService);
    // Check for existing instance
    if (window._dataServiceInstance) {
      logger.log('Using existing DataService instance');
      // Return existing instance to ensure singleton
      return window._dataServiceInstance;
    }
    this.config = Object.assign({
      debug: false,
      ajaxUrl: ((_window$productEstima = window.productEstimatorVars) === null || _window$productEstima === void 0 ? void 0 : _window$productEstima.ajax_url) || '/wp-admin/admin-ajax.php',
      nonce: ((_window$productEstima2 = window.productEstimatorVars) === null || _window$productEstima2 === void 0 ? void 0 : _window$productEstima2.nonce) || '',
      i18n: ((_window$productEstima3 = window.productEstimatorVars) === null || _window$productEstima3 === void 0 ? void 0 : _window$productEstima3.i18n) || {}
    }, config);

    // Initialize AjaxService
    this.ajaxService = new _AjaxService__WEBPACK_IMPORTED_MODULE_7__["default"]({
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
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_5__["default"])(DataService, [{
    key: "request",
    value: function request(action) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      logger.log("[DEPRECATED] Using generic request method for '".concat(action, "'. Consider using dedicated action methods."), data);
      return this.ajaxService._request(action, data);
    }

    /**
     * Get product variation data including available variations and attributes
     * @param {string|number} productId - The product ID to get variation data for
     * @returns {Promise<object>} Promise resolving to variation data
     */
  }, {
    key: "getProductVariationData",
    value: function getProductVariationData(productId) {
      logger.log("Getting variation data for product ID: ".concat(productId));
      return this.ajaxService._request('product_estimator_get_product_variations', {
        product_id: productId
      }).then(function (data) {
        logger.log("Variation data received for product ".concat(productId, ":"), data);
        return {
          isVariable: data.is_variable || false,
          productName: data.product_name || '',
          variations: data.variations || [],
          attributes: data.attributes || {}
        };
      })["catch"](function (error) {
        logger.error('Error getting product variation data:', error);
        throw error;
      });
    }

    /**
     * Check if any estimates exist in the session by checking localStorage
     * @returns {Promise<boolean>} True if estimates exist
     */
  }, {
    key: "checkEstimatesExist",
    value: function checkEstimatesExist() {
      var _this = this;
      // Return a promise for API consistency
      return new Promise(function (resolve) {
        // Load estimate data from localStorage
        // This allows ModalManager to provide its own implementation by setting this.loadEstimateData
        var estimateData = _this.loadEstimateData ? _this.loadEstimateData() : (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.loadEstimateData)();

        // Check if there are any estimates
        var hasEstimates = estimateData && estimateData.estimates && Object.keys(estimateData.estimates).length > 0;
        logger.log("Checking localStorage for estimates: ".concat(hasEstimates ? 'Found' : 'None found'));

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
  }, {
    key: "getProductUpgrades",
    value: function getProductUpgrades(productId, estimateId, roomId, roomArea, upgradeType) {
      var bypassCache = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
      logger.log("[DataService.getProductUpgrades] DEBUG: Called with productId: ".concat(productId, ", estimateId: ").concat(estimateId, ", roomId: ").concat(roomId, ", roomArea: ").concat(roomArea, ", upgradeType: ").concat(upgradeType, ", bypassCache: ").concat(bypassCache));

      // Delegate to AjaxService which now handles its own caching
      return this.ajaxService.getProductUpgrades({
        product_id: productId,
        estimate_id: estimateId,
        room_id: roomId,
        room_area: roomArea,
        upgrade_type: upgradeType
      }, bypassCache).then(function (data) {
        logger.log("[DataService.getProductUpgrades] DEBUG: Response from ajaxService.getProductUpgrades:", data);
        if (data && Array.isArray(data.upgrades)) {
          return data.upgrades;
        } else {
          logger.warn('[getProductUpgrades] DEBUG: get_product_upgrades did not return expected data structure.', data);
          return [];
        }
      })["catch"](function (error) {
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
  }, {
    key: "getEstimatesData",
    value: function getEstimatesData() {
      var bypassCache = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      // Check cache first for efficiency within the same session
      if (!bypassCache && this.cache.estimatesData) {
        logger.log('Returning cached estimates data from localStorage.');
        return Promise.resolve(this.cache.estimatesData);
      }
      logger.log('Loading estimates data from localStorage.');

      // Load data from localStorage using the imported function
      var estimateData = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.loadEstimateData)();

      // Extract the estimates array from the loaded data structure
      // Ensure it's an array, default to empty array if structure is unexpected
      var estimatesArray = estimateData && estimateData.estimates ? Object.values(estimateData.estimates) : [];

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
  }, {
    key: "getEstimate",
    value: function getEstimate(estimateId) {
      logger.log("Getting estimate ".concat(estimateId, " from localStorage."));

      // Use the imported getEstimate function from EstimateStorage
      var estimate = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.getEstimate)(estimateId);
      if (estimate) {
        logger.log("Found estimate ".concat(estimateId, " in localStorage."));
      } else {
        logger.warn("Estimate ".concat(estimateId, " not found in localStorage."));
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
  }, {
    key: "getRoomsForEstimate",
    value: function getRoomsForEstimate(estimateId) {
      var bypassCache = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var cacheKey = "estimate_".concat(estimateId);

      // Check cache first for efficiency within the same session
      if (!bypassCache && this.cache.rooms[cacheKey]) {
        logger.log("Returning cached rooms for estimate ".concat(estimateId, " from localStorage."));
        return Promise.resolve(this.cache.rooms[cacheKey]);
      }
      logger.log("Loading rooms for estimate ".concat(estimateId, " from localStorage."));

      // Load the entire estimate data structure from localStorage
      var estimateData = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.loadEstimateData)();
      // Find the specific estimate by its ID
      var estimate = estimateData && estimateData.estimates ? estimateData.estimates[estimateId] : null;
      var roomsArray = [];
      var hasRooms = false;

      // Check if the estimate was found and if it has rooms
      if (estimate && estimate.rooms) {
        // Convert the rooms object within the estimate to an array of room objects
        roomsArray = Object.values(estimate.rooms);

        // Format room data to include a 'dimensions' string property,
        // as used by the ModalManager's dropdown population logic.
        roomsArray = roomsArray.map(function (room) {
          // Ensure width and length are numbers for calculation, default to 0 if missing
          var width = parseFloat(room.width) || 0;
          var length = parseFloat(room.length) || 0;
          return _objectSpread(_objectSpread({}, room), {}, {
            // Keep all original room properties (id, name, products, etc.)
            // Add the 'dimensions' property
            dimensions: "".concat(width, " x ").concat(length)
          });
        });

        // Determine if there are any rooms after filtering/mapping
        hasRooms = roomsArray.length > 0;
        logger.log("Found ".concat(roomsArray.length, " rooms for estimate ").concat(estimateId, " in localStorage."));
      } else {
        logger.log("Estimate ".concat(estimateId, " not found or has no rooms in localStorage."));
        // No estimate or no rooms found, so hasRooms remains false and roomsArray is empty.
      }

      // Construct the response object in the format expected by ModalManager.js
      var responseData = {
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
  }, {
    key: "getProductsForRoom",
    value: function getProductsForRoom(estimateId, roomId) {
      logger.log("Getting products for room ".concat(roomId, " in estimate ").concat(estimateId, " from localStorage."));

      // Load all estimate data
      var estimateData = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.loadEstimateData)();

      // Check if the estimate and room exist
      if (!estimateData.estimates || !estimateData.estimates[estimateId] || !estimateData.estimates[estimateId].rooms || !estimateData.estimates[estimateId].rooms[roomId]) {
        logger.warn("Estimate ".concat(estimateId, " or room ").concat(roomId, " not found in localStorage."));
        return Promise.resolve([]);
      }

      // Get the products from the room
      var room = estimateData.estimates[estimateId].rooms[roomId];

      // Convert products object to array for backward compatibility with consumers of this API
      var productsArray = [];
      if (room.products) {
        if ((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_2__["default"])(room.products) === 'object' && !Array.isArray(room.products)) {
          // If products is already an object with ID keys, convert to array
          productsArray = Object.values(room.products);
        } else if (Array.isArray(room.products)) {
          // If it's still an array (legacy format), use it directly
          productsArray = room.products;
        }
      }
      logger.log("Found ".concat(productsArray.length, " products for room ").concat(roomId, " in estimate ").concat(estimateId, "."));

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
  }, {
    key: "addProductToRoom",
    value: function addProductToRoom(roomId, productId) {
      var _this2 = this;
      var estimateId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      logger.log('DataService: Adding product to room (localStorage first)', {
        roomId: roomId,
        productId: productId,
        estimateId: estimateId
      });
      var existingData = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.loadEstimateData)();
      var estimate = existingData.estimates ? existingData.estimates[estimateId] : null;
      var room = estimate && estimate.rooms ? estimate.rooms[roomId] : null;
      var roomWidth = null;
      var roomLength = null;
      if (room) {
        roomWidth = room.width;
        roomLength = room.length;
        if (room.products) {
          var productIdStr = String(productId);
          // Check if product exists in the room's products object
          if ((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_2__["default"])(room.products) === 'object' && room.products[productIdStr] || Array.isArray(room.products) && room.products.find(function (product) {
            return String(product.id) === productIdStr;
          })) {
            logger.warn("DataService: Product ID ".concat(productId, " already exists in room ").concat(roomId, " locally. Aborting."));
            return Promise.reject({
              message: this.config.i18n.product_already_exists || 'This product already exists in the selected room.',
              data: {
                duplicate: true,
                estimate_id: estimateId,
                room_id: roomId
              }
            });
          }

          // Note: Primary category checking happens on the server side during the AJAX request
          // We can't check it here without the product category information and settings
        }
      } else {
        logger.warn("DataService: Room ID ".concat(roomId, " not found in local storage for estimate ").concat(estimateId, ". Room dimensions will be null for product data fetch."));
      }

      // Extract product IDs from room.products, which could be an object or array
      var existingProductIdsInRoom = [];
      if (room && room.products) {
        if ((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_2__["default"])(room.products) === 'object' && !Array.isArray(room.products)) {
          existingProductIdsInRoom = Object.keys(room.products);
        } else if (Array.isArray(room.products)) {
          existingProductIdsInRoom = room.products.map(function (p) {
            return p.id;
          });
        }
      }
      // For fetching suggestions, send the context of products that *will be* in the room
      var allProductIdsForSuggestionContext = (0,_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_1__["default"])(new Set([].concat((0,_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_1__["default"])(existingProductIdsInRoom), [String(productId)])));

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
      var fetchProductAndSuggestionsPromise = this.ajaxService.getProductDataForStorage({
        product_id: String(productId),
        room_width: roomWidth,
        room_length: roomLength,
        room_products: allProductIdsForSuggestionContext // Send product list including the one being added
      });

      // STEP 2: Handle local storage update using fetched data.
      var localStoragePromise = fetchProductAndSuggestionsPromise.then(function (productDataResponse) {
        logger.log('DataService: Fetched comprehensive product data response:', productDataResponse);

        // Critical validation: If getProductDataForStorage failed or returned no response
        if (!productDataResponse) {
          var errorMsg = 'Failed to get comprehensive product data from server - null/undefined response.';
          logger.error(errorMsg); // Critical error - high priority
          return {
            success: false,
            error: new Error(errorMsg),
            critical: true // Mark as critical error that should block the UI
          };
        }

        // Critical validation: If getProductDataForStorage returned no product_data
        if (!productDataResponse.product_data) {
          var _errorMsg = 'Failed to get comprehensive product data from server - missing product_data property.';
          logger.error(_errorMsg, productDataResponse); // Critical error - high priority
          return {
            success: false,
            error: new Error(_errorMsg),
            critical: true // Mark as critical error that should block the UI
          };
        }

        // Critical validation: If this is a fallback response from a failed request
        if (productDataResponse.isFallback === true) {
          var _errorMsg2 = "Unable to get product data from server for product ID ".concat(productId, ". This is a required server request.");
          logger.error(_errorMsg2); // Critical error - high priority
          return {
            success: false,
            error: new Error(_errorMsg2),
            critical: true // Mark as critical error that should block the UI
          };
        }
        var comprehensiveProductData = productDataResponse.product_data;
        var roomSuggestedProductsToStore = []; // Initialize to empty

        // Check if the new product is in a primary category
        if (comprehensiveProductData.is_primary_category === true) {
          // Check existing products in the room for primary category conflicts
          var _estimate = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.getEstimate)(estimateId);
          var _room = _estimate && _estimate.rooms && _estimate.rooms[roomId];
          var existingProducts = _room && _room.products ? _room.products : {};
          for (var productKey in existingProducts) {
            var existingProduct = existingProducts[productKey];
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
          var rawSuggestions = productDataResponse.room_suggested_products || comprehensiveProductData.room_suggested_products || [];
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
          var productAddedSuccess = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.addProductToRoom)(estimateId, roomId, comprehensiveProductData);
          if (productAddedSuccess) {
            var _updatedData$estimate, _updatedData$estimate2;
            logger.log("Product ID ".concat(productId, " (with its similar products) successfully added to room ").concat(roomId, " in localStorage."));
            if (window.productEstimatorVars.featureSwitches.suggested_products_enabled) {
              // Store the fetched (and processed) room suggestions
              (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.addSuggestionsToRoom)(roomSuggestedProductsToStore, estimateId, roomId);
              logger.log("Room suggestions updated in localStorage for room ".concat(roomId, "."));
            } else {
              // If feature is off, explicitly clear any existing suggestions for the room
              (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.addSuggestionsToRoom)([], estimateId, roomId);
              logger.log("Suggestions cleared for room ".concat(roomId, " as feature is disabled."));
            }
            var updatedData = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.loadEstimateData)(); // Reload data to get updated totals
            return {
              success: true,
              estimateData: updatedData,
              estimateId: estimateId,
              roomId: roomId,
              productData: comprehensiveProductData,
              // This now includes .similar_products
              estimate_totals: ((_updatedData$estimate = updatedData.estimates) === null || _updatedData$estimate === void 0 || (_updatedData$estimate = _updatedData$estimate[estimateId]) === null || _updatedData$estimate === void 0 ? void 0 : _updatedData$estimate.totals) || {
                min_total: 0,
                max_total: 0
              },
              room_totals: ((_updatedData$estimate2 = updatedData.estimates) === null || _updatedData$estimate2 === void 0 || (_updatedData$estimate2 = _updatedData$estimate2[estimateId]) === null || _updatedData$estimate2 === void 0 || (_updatedData$estimate2 = _updatedData$estimate2.rooms) === null || _updatedData$estimate2 === void 0 || (_updatedData$estimate2 = _updatedData$estimate2[roomId]) === null || _updatedData$estimate2 === void 0 ? void 0 : _updatedData$estimate2.totals) || {
                min_total: 0,
                max_total: 0
              }
            };
          } else {
            logger.warn("DataService: Failed to add product ID ".concat(productId, " to room ").concat(roomId, " in localStorage via addProductToRoomStorage."));
            return {
              success: false,
              error: new Error('Failed to add to local storage (product might exist or storage function failed).')
            };
          }
        } catch (e) {
          logger.error("DataService: Error adding comprehensive product ID ".concat(productId, " to room ").concat(roomId, " in localStorage:"), e);
          return {
            success: false,
            error: e
          };
        }
      })["catch"](function (error) {
        logger.error('Error fetching comprehensive product data or processing local storage for addProductToRoom:', error);
        return {
          success: false,
          error: error
        }; // Propagate error
      });

      // STEP 3: Make the asynchronous server request for session update ONLY if local storage succeeded.
      // This step is completely non-blocking - we'll fire and forget
      localStoragePromise.then(function (localResult) {
        // If not successful or critical error, just log and don't try server sync
        if (!localResult.success) {
          if (localResult.critical) {
            var _localResult$error;
            // This is a critical error - show a visible error message to the user
            var errorMsg = ((_localResult$error = localResult.error) === null || _localResult$error === void 0 ? void 0 : _localResult$error.message) || 'Critical error: Unable to add product to room.';
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
        var requestData = {
          room_id: String(roomId),
          product_id: String(productId)
        };
        if (estimateId !== null) {
          requestData.estimate_id = String(estimateId);
        }

        // Fire and forget - completely detached from main flow
        setTimeout(function () {
          _this2.ajaxService.addProductToRoom(requestData).then(function (serverData) {
            logger.log('DataService: Background server-side product add successful:', serverData);
            _this2.invalidateCache();
          })["catch"](function (error) {
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
      })["catch"](function (error) {
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
  }, {
    key: "replaceProductInRoom",
    value: function replaceProductInRoom(estimateId, roomId, oldProductId, newProductId, parentProductId) {
      var _existingData$estimat,
        _estimate$rooms,
        _this3 = this;
      var replaceType = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'main';
      logger.log('DataService: Initiating product replacement (localStorage first)', {
        estimateId: estimateId,
        roomId: roomId,
        oldProductId: oldProductId,
        newProductId: newProductId,
        parentProductId: parentProductId,
        replaceType: replaceType
      });
      var existingData = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.loadEstimateData)();
      var estimate = (_existingData$estimat = existingData.estimates) === null || _existingData$estimat === void 0 ? void 0 : _existingData$estimat[estimateId];
      var room = estimate === null || estimate === void 0 || (_estimate$rooms = estimate.rooms) === null || _estimate$rooms === void 0 ? void 0 : _estimate$rooms[roomId];
      var roomWidth = room === null || room === void 0 ? void 0 : room.width;
      var roomLength = room === null || room === void 0 ? void 0 : room.length;
      var futureRoomProductIds = [];
      var oldProductStringId = String(oldProductId);
      var newProductStringId = String(newProductId);
      if (room && room.products) {
        if ((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_2__["default"])(room.products) === 'object' && !Array.isArray(room.products)) {
          // Object-based products
          // Get all product IDs as strings
          futureRoomProductIds = Object.keys(room.products);

          // Remove the old product ID and add the new one
          if (futureRoomProductIds.includes(oldProductStringId)) {
            futureRoomProductIds = futureRoomProductIds.filter(function (id) {
              return id !== oldProductStringId;
            });
          }
          futureRoomProductIds.push(newProductStringId);
        } else if (Array.isArray(room.products)) {
          // Legacy array-based product handling
          futureRoomProductIds = room.products.map(function (p) {
            return String(p.id);
          }); // Ensure string IDs for comparison
          var oldProductIdx = futureRoomProductIds.indexOf(oldProductStringId);
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
      futureRoomProductIds = (0,_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_1__["default"])(new Set(futureRoomProductIds));

      // STEP 1: Fetch comprehensive product data for the NEW product.
      // Backend ('get_product_data_for_storage') returns:
      // - product_data: { ... (new product details), similar_products: [...] }
      // - room_suggested_products: [...] (new suggestions for the room *with* the replaced product)
      var fetchProductDataPromise = this.ajaxService.getProductDataForStorage({
        product_id: String(newProductId),
        room_width: roomWidth,
        room_length: roomLength,
        room_products: futureRoomProductIds // Send the product list *after* the intended replacement
      });

      // STEP 2: Handle local storage update using fetched data.
      var localStorageAndUpdateSuggestionsPromise = fetchProductDataPromise.then(function (productDataResponse) {
        logger.log('DataService: Fetched comprehensive product data for storage (for local replacement):', productDataResponse);
        if (!productDataResponse || !productDataResponse.product_data) {
          throw new Error('Failed to fetch complete product data for local replacement.');
        }
        var comprehensiveNewProductData = productDataResponse.product_data;
        var roomSuggestedProductsToStore = []; // Initialize to empty

        // Keep similar_products in their original format (object or array)
        // Don't convert to empty array if it's an object with data
        if (!comprehensiveNewProductData.similar_products) {
          comprehensiveNewProductData.similar_products = {};
        }
        if (window.productEstimatorVars.featureSwitches.suggested_products_enabled) {
          // Only process room_suggested_products if the feature is enabled
          var rawSuggestions = productDataResponse.room_suggested_products || comprehensiveNewProductData.room_suggested_products || [];
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
        var productReplacementSuccess = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.replaceProductInRoom)(estimateId, roomId, oldProductId, newProductId, comprehensiveNewProductData,
        // This is the data for the NEW product
        replaceType, parentProductId);
        if (productReplacementSuccess) {
          var _updatedData$estimate3, _updatedEstimate$room;
          logger.log("Product replacement (old ID ".concat(oldProductId, " -> new ID ").concat(newProductId, ") successful in localStorage for room ").concat(roomId, "."));
          if (window.productEstimatorVars.featureSwitches.suggested_products_enabled) {
            // Update suggestions in localStorage for this room using the fetched suggestions
            (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.addSuggestionsToRoom)(roomSuggestedProductsToStore, estimateId, roomId);
            logger.log("Room suggestions updated in localStorage for room ".concat(roomId, " after product replacement."));
          } else {
            // If feature is off, explicitly clear any existing suggestions for the room
            (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.addSuggestionsToRoom)([], estimateId, roomId);
            logger.log("Suggestions cleared for room ".concat(roomId, " as feature is disabled (during product replacement)."));
          }
          var updatedData = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.loadEstimateData)(); // Reload data to get updated totals
          var updatedEstimate = (_updatedData$estimate3 = updatedData.estimates) === null || _updatedData$estimate3 === void 0 ? void 0 : _updatedData$estimate3[estimateId];
          var updatedRoom = updatedEstimate === null || updatedEstimate === void 0 || (_updatedEstimate$room = updatedEstimate.rooms) === null || _updatedEstimate$room === void 0 ? void 0 : _updatedEstimate$room[roomId];
          return {
            success: true,
            estimateData: updatedData,
            estimateId: estimateId,
            roomId: roomId,
            oldProductId: oldProductId,
            newProductId: newProductId,
            productData: comprehensiveNewProductData,
            // Data of the new product
            estimate_totals: (updatedEstimate === null || updatedEstimate === void 0 ? void 0 : updatedEstimate.totals) || {
              min_total: 0,
              max_total: 0
            },
            room_totals: (updatedRoom === null || updatedRoom === void 0 ? void 0 : updatedRoom.totals) || {
              min_total: 0,
              max_total: 0
            }
          };
        } else {
          // This means replaceProductInRoomStorage returned false
          throw new Error('Failed to replace product in local storage. Original product not found or storage function failed.');
        }
      })["catch"](function (error) {
        logger.error('Error during fetch or local storage replacement attempt:', error);
        throw error; // Re-throw to be caught by the caller (e.g., ModalManager)
      });

      // STEP 3: Asynchronous server request for session update.
      localStorageAndUpdateSuggestionsPromise.then(function (localResult) {
        if (localResult.success) {
          // Ensure local operation was successful before calling server
          logger.log('DataService: Local storage replacement successful, sending asynchronous server request for session update.');
          var requestData = {
            estimate_id: String(estimateId),
            room_id: String(roomId),
            product_id: String(newProductId),
            // The ID of the new product
            replace_product_id: String(oldProductId),
            // The ID of the product being replaced
            replace_type: replaceType
          };
          if (parentProductId !== null && parentProductId !== undefined) {
            // Check for null or undefined
            requestData.parent_product_id = String(parentProductId);
          }
          return _this3.ajaxService.replaceProductInRoom(requestData);
        }
        // If localResult was not success (e.g. promise was rejected and caught by caller), this part is skipped.
      }).then(function (serverData) {
        if (serverData) {
          // Check if serverData exists (meaning request was made and potentially succeeded)
          logger.log('DataService: Asynchronous server-side product replacement (session) successful:', serverData);
          _this3.invalidateCache();
        }
      })["catch"](function (serverError) {
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
  }, {
    key: "getSimilarProducts",
    value: function getSimilarProducts(productId, roomArea) {
      var bypassCache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      // Added roomArea parameter
      logger.log("Attempting to get similar products for product ID: ".concat(productId, ", area: ").concat(roomArea, ". Cache bypass: ").concat(bypassCache));

      // Prepare data to send to the backend
      var requestData = {
        product_id: productId,
        room_area: roomArea // Pass the room area to the backend
      };

      // Use the specific AjaxService method - it now handles its own caching
      return this.ajaxService.getSimilarProducts(requestData, bypassCache).then(function (data) {
        // Assuming the backend returns an object with a 'products' key containing the array
        if (data && Array.isArray(data.products)) {
          return data.products;
        } else {
          logger.warn('get_similar_products did not return expected data structure (expected { products: [...] })', data);
          // Return an empty array if the response format is unexpected
          return [];
        }
      })["catch"](function (error) {
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
  }, {
    key: "addNewEstimate",
    value: function addNewEstimate(formData) {
      var _this4 = this;
      var productId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var requestData = {
        form_data: this.formatFormData(formData)
      };
      if (productId) {
        requestData.product_id = productId;
      }
      var estimateName = formData instanceof FormData ? formData.get('estimate_name') : formData.estimate_name || 'Unnamed Estimate';

      // Create a basic estimate object for local storage
      var clientSideEstimateData = {
        // Let EstimateStorage.js generate the unique ID
        name: estimateName,
        rooms: {} // Start with an empty rooms object
        // Add any other default properties needed for a new estimate client-side
      };

      // Add the estimate to local storage immediately
      var clientSideEstimateId = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.addEstimate)(clientSideEstimateData);
      logger.log("Client-side estimate saved to localStorage with unique ID: ".concat(clientSideEstimateId));

      // Update request data to include the client-side UUID
      requestData.estimate_uuid = clientSideEstimateId;

      // Make the AJAX request to the server asynchronously
      this.ajaxService.addNewEstimate(requestData).then(function (serverData) {
        logger.log('DataService: Server-side estimate creation successful using client UUID:', serverData);
        // Invalidate caches since we modified data on the server
        _this4.invalidateCache();
      })["catch"](function (serverError) {
        logger.error('Server-side estimate creation failed:', serverError);
        // Handle server-side error asynchronously, e.g., show a notification to the user.
        // You might also want to consider removing the locally created estimate if the server creation failed.
        // Example: removeEstimateFromStorage(clientSideEstimateId);
        // Example: ModalManager.showError('Failed to save estimate on server.');
      });

      // Return a new Promise that resolves immediately with the client-side estimate ID.
      // The ModalManager will use the resolution of this promise to proceed with the next step
      // based on the locally added estimate.
      return Promise.resolve({
        estimate_id: clientSideEstimateId
      });
    }

    /**
     * Create a new room without adding products.
     * The main promise resolves after local changes. Async calls update the server.
     * @param {FormData | object | string} formData - Form data for the new room
     * @param {string|number} estimateId - Estimate ID to add the room to
     * @returns {Promise<object>} A promise that resolves with the new room data.
     */
  }, {
    key: "addNewRoom",
    value: function addNewRoom(formData, estimateId) {
      var _this5 = this;
      logger.log('DataService: Adding new room', {
        estimateId: estimateId,
        formData: formData instanceof FormData ? Object.fromEntries(formData) : formData
      });
      return new Promise(function (resolve, reject) {
        var existingData = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.loadEstimateData)();
        var estimate = existingData.estimates ? existingData.estimates[estimateId] : null;
        if (!estimate) {
          var errorMsg = "Estimate with ID ".concat(estimateId, " not found in local storage. Cannot add room.");
          logger.error("DataService: ".concat(errorMsg));
          // Attempt server request for room creation anyway for consistency, but reject local promise.
          var requestDataOnLocalFailure = {
            form_data: _this5.formatFormData(formData),
            estimate_id: String(estimateId) // Ensure string
          };
          _this5.ajaxService.addNewRoom(requestDataOnLocalFailure).then(function (serverData) {
            return logger.log('DataService: Server add_new_room (after local estimate not found) response:', serverData);
          })["catch"](function (serverError) {
            return logger.error('Server add_new_room (after local estimate not found) failed:', serverError);
          });
          reject(new Error(errorMsg));
          return;
        }
        var roomWidth = parseFloat(formData instanceof FormData ? formData.get('room_width') : formData.room_width) || 0;
        var roomLength = parseFloat(formData instanceof FormData ? formData.get('room_length') : formData.room_length) || 0;
        var newRoomData = {
          // Let EstimateStorage.js generate the unique ID
          name: formData instanceof FormData ? formData.get('room_name') || 'Unnamed Room' : formData.room_name || 'Unnamed Room',
          width: roomWidth,
          length: roomLength,
          products: {},
          // Initialize as an empty object for the new storage structure
          // product_suggestions: [], // Suggestions will be managed separately
          min_total: 0,
          max_total: 0
        };

        // Add the basic room structure to local storage (without products)
        var clientSideRoomId = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.addRoom)(estimateId, newRoomData);
        logger.log("Room ID ".concat(clientSideRoomId, " (empty) added to localStorage for estimate ").concat(estimateId));

        // Asynchronously send the request to the server to add the room
        var serverRequestData = {
          form_data: _this5.formatFormData(formData),
          estimate_id: String(estimateId),
          room_uuid: clientSideRoomId // Include the client-generated UUID
        };
        _this5.ajaxService.addNewRoom(serverRequestData).then(function (response) {
          logger.log('DataService: Server-side room creation successful:', response);
          _this5.invalidateCache();
        })["catch"](function (serverError) {
          logger.error('Server-side room creation failed:', serverError);
        });

        // Resolve with the room data immediately - product addition is a separate concern
        logger.log("Room ".concat(clientSideRoomId, " created. Resolving with basic room data."));
        resolve(_objectSpread({
          room_id: clientSideRoomId,
          estimate_id: estimateId
        }, newRoomData));
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
  }, {
    key: "removeProductFromRoom",
    value: function removeProductFromRoom(estimateId, roomId, productIndex, productId) {
      var _this6 = this;
      logger.log('[removeProductFromRoom] Initiating product removal process', {
        estimateId: estimateId,
        roomId: roomId,
        productIndex: productIndex,
        productId: productId
      });
      return new Promise(function (resolve, reject) {
        var _currentEstimateData$, _estimate$rooms2;
        var currentEstimateData = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.loadEstimateData)();
        var estimate = (_currentEstimateData$ = currentEstimateData.estimates) === null || _currentEstimateData$ === void 0 ? void 0 : _currentEstimateData$[estimateId];
        var room = estimate === null || estimate === void 0 || (_estimate$rooms2 = estimate.rooms) === null || _estimate$rooms2 === void 0 ? void 0 : _estimate$rooms2[roomId];
        if (!room || !room.products) {
          var errorMsg = 'Room or products not found in localStorage for product removal.';
          logger.log("[removeProductFromRoom] Error: ".concat(errorMsg));
          reject(new Error(errorMsg));
          return;
        }
        var productIdStr = String(productId);
        var productExists = false;
        var remainingProductIds = [];
        if ((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_2__["default"])(room.products) === 'object' && !Array.isArray(room.products)) {
          // Object-based products
          productExists = !!room.products[productIdStr];
          // Get all product IDs except the one being removed
          remainingProductIds = Object.keys(room.products).filter(function (id) {
            return id !== productIdStr;
          });
        } else if (Array.isArray(room.products)) {
          // Legacy array-based products
          var productToRemove = room.products.find(function (p) {
            return String(p.id) === productIdStr;
          });
          productExists = !!productToRemove;
          var remainingProductObjects = room.products.filter(function (product) {
            return String(product.id) !== productIdStr;
          });
          remainingProductIds = remainingProductObjects.map(function (p) {
            return p.id;
          });
        }
        if (!productExists) {
          // Log warning but proceed, as removeProductFromRoomStorage will ultimately determine local removal success.
          logger.log("[removeProductFromRoom] Warning: Product with ID ".concat(productId, " not found in room ").concat(roomId, " (localStorage) before attempting removal logic."));
        }
        var performProductRemovalAndResolve = function performProductRemovalAndResolve(suggestionsManagedStatus) {
          var _finalEstimateData$es, _finalEstimate$rooms;
          // suggestionsManagedStatus can be 'updated', 'update_failed', 'disabled', 'cleared_due_to_disabled'
          var localProductRemoved = false;
          var removalError = null;
          try {
            // removeProductFromRoomStorage should primarily use productId for removal.
            localProductRemoved = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.removeProductFromRoom)(estimateId, roomId, productIndex, productId);
            if (localProductRemoved) {
              logger.log("[removeProductFromRoom] Product ID ".concat(productId, " reported as removed from localStorage by EstimateStorage."));
            } else {
              // This error might occur if the product was already gone or EstimateStorage internal logic failed.
              removalError = new Error("Failed to remove product ID ".concat(productId, " from localStorage (EstimateStorage.removeProductFromRoom returned false)."));
              logger.log("[removeProductFromRoom] Warning: ".concat(removalError.message));
            }
          } catch (e) {
            removalError = new Error("Error during localStorage product removal for ID ".concat(productId, ": ").concat(e.message));
            logger.log("[removeProductFromRoom] Error: ".concat(removalError.message), e);
          }

          // Only reject if local product removal itself critically failed AND was expected to succeed.
          // If product was already removed (localProductRemoved might be false but no error), we can proceed.
          if (removalError && !localProductRemoved) {
            // A true error in removal that prevented it
            reject(removalError);
            return;
          }
          var finalEstimateData = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.loadEstimateData)();
          var finalEstimate = (_finalEstimateData$es = finalEstimateData.estimates) === null || _finalEstimateData$es === void 0 ? void 0 : _finalEstimateData$es[estimateId];
          var finalRoom = finalEstimate === null || finalEstimate === void 0 || (_finalEstimate$rooms = finalEstimate.rooms) === null || _finalEstimate$rooms === void 0 ? void 0 : _finalEstimate$rooms[roomId];
          var successMessage = localProductRemoved ? 'Product removed locally. ' : 'Product local removal status uncertain (check logs). ';
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
            success: true,
            // Indicates the overall operation flow completed without critical rejection
            message: successMessage,
            estimateId: estimateId,
            roomId: roomId,
            productId: productId,
            estimate_totals: (finalEstimate === null || finalEstimate === void 0 ? void 0 : finalEstimate.totals) || {
              min_total: 0,
              max_total: 0
            },
            room_totals: (finalRoom === null || finalRoom === void 0 ? void 0 : finalRoom.totals) || {
              min_total: 0,
              max_total: 0
            }
          });

          // Asynchronous server call to remove the product from the session
          logger.log('[removeProductFromRoom] Initiating asynchronous server call to remove_product_from_room.');
          _this6.ajaxService.removeProductFromRoom({
            estimate_id: estimateId,
            room_id: roomId,
            product_index: productIndex,
            // Backend might still use this
            product_id: productId // Also send productId to backend
          }).then(function (serverResponse) {
            logger.log('[removeProductFromRoom] Async server product removal successful:', serverResponse);
            _this6.invalidateCache();
          })["catch"](function (serverError) {
            logger.log('[removeProductFromRoom] Async server product removal failed:', serverError);
            // Non-blocking error, local changes are already reflected.
          });
        };
        if (window.productEstimatorVars.featureSwitches.suggested_products_enabled) {
          logger.log('[removeProductFromRoom] Suggestions enabled. Fetching updated suggestions for room based on post-deletion state.');
          _this6.ajaxService.fetchSuggestionsForModifiedRoom({
            estimate_id: estimateId,
            room_id: roomId,
            room_product_ids_for_suggestions: JSON.stringify(remainingProductIds) // Send IDs of products that will remain
          }).then(function (suggestionResponse) {
            logger.log('[removeProductFromRoom] Successfully fetched updated suggestions:', suggestionResponse);
            if (suggestionResponse && Array.isArray(suggestionResponse.updated_suggestions)) {
              (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.addSuggestionsToRoom)(suggestionResponse.updated_suggestions, estimateId, roomId);
              logger.log('[removeProductFromRoom] Suggestions updated in localStorage.');
              performProductRemovalAndResolve('updated');
            } else {
              logger.log('[removeProductFromRoom] No updated_suggestions array received or invalid format. Clearing local suggestions.');
              (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.addSuggestionsToRoom)([], estimateId, roomId); // Clear if response is not as expected
              performProductRemovalAndResolve('update_failed'); // Still proceed with removal
            }
          })["catch"](function (suggestionError) {
            logger.error('[removeProductFromRoom] Error fetching suggestions:', suggestionError, '. Proceeding with product removal without suggestion update.');
            // Optionally, clear suggestions in localStorage if fetching failed to avoid stale data
            (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.addSuggestionsToRoom)([], estimateId, roomId);
            logger.log('[removeProductFromRoom] Cleared local suggestions due to fetch error.');
            performProductRemovalAndResolve('update_failed'); // Indicate suggestions were not successfully managed
          });
        } else {
          logger.log('[removeProductFromRoom] Suggestions disabled. Skipping suggestion fetch/update.');
          // Clear any existing suggestions for the room if the feature is disabled
          if (typeof _EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.addSuggestionsToRoom === 'function') {
            (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.addSuggestionsToRoom)([], estimateId, roomId);
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
  }, {
    key: "removeRoom",
    value: function removeRoom(estimateId, roomId) {
      var _this7 = this;
      logger.log('DataService: Removing room', {
        estimateId: estimateId,
        roomId: roomId
      });

      // Perform local storage removal immediately
      try {
        var success = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.removeRoom)(estimateId, roomId);
        if (success) {
          logger.log("Room ID ".concat(roomId, " successfully removed from localStorage for estimate ").concat(estimateId));
        } else {
          logger.warn("Room ID ".concat(roomId, " not found in localStorage for estimate ").concat(estimateId, " during removal attempt."));
        }
      } catch (e) {
        logger.error("Error removing room ID ".concat(roomId, " from localStorage:"), e);
      }

      // Force string conversion for consistency
      var requestData = {
        estimate_id: String(estimateId),
        room_id: String(roomId)
      };

      // Make the AJAX request to the server asynchronously
      this.ajaxService.removeRoom(requestData).then(function (serverData) {
        logger.log('DataService: Server-side room removal successful:', serverData);
        // Invalidate caches since we modified data on the server
        _this7.invalidateCache();
        // You might update local state further based on server response if needed
      })["catch"](function (serverError) {
        logger.error('Server-side room removal failed:', serverError);
        // Handle server error asynchronously, e.g., notify user.
        // You might need to add the room back to local storage if the server removal failed.
      });

      // Return a promise that resolves immediately after the local removal attempt.
      // ModalManager will use this to update the UI based on the local change.
      // Note: This promise does NOT wait for the server response.
      return Promise.resolve({
        success: true
      }); // Assuming local removal attempt was made
    }

    /**
     * Remove an entire estimate
     * @param {string|number} estimateId - Estimate ID
     * @returns {Promise<object>} Result data
     */
  }, {
    key: "removeEstimate",
    value: function removeEstimate(estimateId) {
      var _this8 = this;
      logger.log("DataService: Removing estimate ".concat(estimateId));

      // Perform local storage removal immediately
      try {
        var success = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.removeEstimate)(estimateId);
        if (success) {
          logger.log("Estimate ID ".concat(estimateId, " successfully removed from localStorage."));
        } else {
          logger.warn("Estimate ID ".concat(estimateId, " not found in localStorage during removal attempt."));
        }
      } catch (e) {
        logger.error("Error removing estimate ID ".concat(estimateId, " from localStorage:"), e);
      }

      // Make the AJAX request to the server asynchronously
      this.ajaxService.removeEstimate({
        estimate_id: estimateId
      }).then(function (serverData) {
        logger.log("DataService: Server-side estimate removal successful: ".concat(estimateId), serverData);
        // Invalidate caches since we modified data
        _this8.invalidateCache();
        // You might update local state further based on server response if needed
      })["catch"](function (serverError) {
        logger.error("DataService: Server-side estimate removal failed: ".concat(estimateId), serverError);
        // Handle server error asynchronously, e.g., notify user.
        // Even if server removal fails, we want to keep the estimate removed from localStorage.
      });

      // Return a promise that resolves immediately after the local removal attempt.
      // ModalManager will use this to update the UI based on the local change.
      // Note: This promise does NOT wait for the server response.
      return Promise.resolve({
        success: true
      }); // Assuming local removal attempt was made
    }

    /**
     * Get suggested products for a room from localStorage.
     * @param {string|number} estimateId - Estimate ID
     * @param {string|number} roomId - Room ID
     * @returns {Promise<Array|null>} Array of suggested products or null if not found
     */
  }, {
    key: "getSuggestedProducts",
    value: function getSuggestedProducts(estimateId, roomId) {
      if (!window.productEstimatorVars.featureSwitches.suggested_products_enabled) {
        logger.log("[getSuggestedProducts] Suggestions feature is disabled. Returning null for room ".concat(roomId, "."));
        return Promise.resolve(null); // Or Promise.resolve([])
      }
      logger.log("Getting suggested products for room ".concat(roomId, " in estimate ").concat(estimateId, " from localStorage."));

      // Directly use the getSuggestionsForRoom function from EstimateStorage.js
      // This function already handles loading from localStorage (productEstimatorEstimateData)
      // and returning the product_suggestions array or null.
      var suggestions = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.getSuggestionsForRoom)(estimateId, roomId); //

      if (suggestions) {
        logger.log("Found suggestions for room ".concat(roomId, ":"), suggestions); //
        return Promise.resolve(suggestions); //
      } else {
        logger.log("No suggestions found for room ".concat(roomId, " in localStorage.")); //
        return Promise.resolve(null); // Or Promise.resolve([]) if an empty array is preferred for "not found"
      }
    }

    /**
     * Get the variation estimator content
     * @param {number} variationId - Variation ID
     * @returns {Promise<object>} Result with HTML content
     */
  }, {
    key: "getVariationEstimator",
    value: function getVariationEstimator(variationId) {
      return this.ajaxService.getVariationEstimator({
        variation_id: variationId
      });
    }

    /**
     * Format form data into a string for AJAX requests
     * @param {FormData | object | string} formData - The form data to format
     * @returns {string} Formatted form data
     */
  }, {
    key: "formatFormData",
    value: function formatFormData(formData) {
      if (typeof formData === 'string') {
        return formData;
      }
      if (formData instanceof FormData) {
        var params = new URLSearchParams();
        var _iterator = _createForOfIteratorHelper(formData.entries()),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _step$value = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_step.value, 2),
              key = _step$value[0],
              value = _step$value[1];
            params.append(key, value);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
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
  }, {
    key: "invalidateCache",
    value: function invalidateCache() {
      var cacheType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      logger.log('Invalidating caches');

      // Invalidate local in-memory cache
      if (cacheType) {
        if (Object.prototype.hasOwnProperty.call(this.cache, cacheType)) {
          if ((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_2__["default"])(this.cache[cacheType]) === 'object') {
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
  }, {
    key: "refreshEstimatesCache",
    value: function refreshEstimatesCache() {
      logger.log('Refreshing estimates cache directly from localStorage');

      // Load directly from localStorage
      var storageData = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.loadEstimateData)();

      // Update the cache with the fresh data
      if (storageData && storageData.estimates) {
        // Convert the object of estimates to an array for the cache
        this.cache.estimatesData = Object.values(storageData.estimates);
        logger.log("Refreshed cache with ".concat(this.cache.estimatesData.length, " estimates"));
      } else {
        // Reset the cache if no data found
        this.cache.estimatesData = [];
        logger.log('No estimates found in localStorage during refresh');
      }

      // Return the raw data
      return storageData;
    }
  }]);
}(); // Export the class
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DataService);

/***/ }),

/***/ "./src/js/frontend/EstimateStorage.js":
/*!********************************************!*\
  !*** ./src/js/frontend/EstimateStorage.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addEstimate: () => (/* binding */ addEstimate),
/* harmony export */   addProductToRoom: () => (/* binding */ addProductToRoom),
/* harmony export */   addRoom: () => (/* binding */ addRoom),
/* harmony export */   addSuggestionsToRoom: () => (/* binding */ addSuggestionsToRoom),
/* harmony export */   clearEstimateData: () => (/* binding */ clearEstimateData),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   getEstimate: () => (/* binding */ getEstimate),
/* harmony export */   getEstimates: () => (/* binding */ getEstimates),
/* harmony export */   getSuggestionsForRoom: () => (/* binding */ getSuggestionsForRoom),
/* harmony export */   loadEstimateData: () => (/* binding */ loadEstimateData),
/* harmony export */   removeEstimate: () => (/* binding */ removeEstimate),
/* harmony export */   removeProductFromRoom: () => (/* binding */ removeProductFromRoom),
/* harmony export */   removeRoom: () => (/* binding */ removeRoom),
/* harmony export */   replaceProductInRoom: () => (/* binding */ replaceProductInRoom),
/* harmony export */   saveEstimate: () => (/* binding */ saveEstimate),
/* harmony export */   saveEstimateData: () => (/* binding */ saveEstimateData),
/* harmony export */   updateCustomerDetails: () => (/* binding */ updateCustomerDetails)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/esm-browser/v4.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");

/**
 * EstimateStorage.js
 *
 * Handles synchronizing PHP session data with browser localStorage.
 * This module provides methods to store and retrieve session data,
 * particularly for estimates and rooms.
 */



var STORAGE_KEY = 'productEstimatorEstimateData';
var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.createLogger)('EstimateStorage');

/**
 * Generate a unique ID using UUID v4 with an optional prefix
 * @param {string} prefix - Optional prefix for the ID (e.g., 'estimate', 'room')
 * @returns {string} A unique ID in the format prefix_uuid or just uuid if no prefix
 */
function generateUniqueId(prefix) {
  var uuid = (0,uuid__WEBPACK_IMPORTED_MODULE_2__["default"])();
  return prefix ? "".concat(prefix, "_").concat(uuid) : uuid;
}

/**
 * Load session data from localStorage
 * @returns {object} Estimate data object with estimates, etc.
 */
function loadEstimateData() {
  try {
    var storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      var data = JSON.parse(storedData);

      // Handle the case where estimates is an array (from PHP session)
      if (data.estimates && Array.isArray(data.estimates)) {
        logger.log("loadEstimateData - Converting estimates array to object");

        // Convert array to an object with array indices as keys
        var estimatesObject = {};
        data.estimates.forEach(function (estimate, index) {
          // Use array index as key if no ID is present
          var key = estimate.id || String(index);

          // If it doesn't have an ID field, add one
          if (!estimate.id) {
            estimate.id = key;
          }
          estimatesObject[key] = estimate;
        });

        // Replace the array with the new object
        data.estimates = estimatesObject;

        // Save back to localStorage
        saveEstimateData(data);
        logger.log("loadEstimateData - Converted array to object structure");
      }
      logger.log("loadEstimateData - Data loaded:", data);
      return data;
    } else {
      var sessionDetails = sessionStorage.getItem(STORAGE_KEY);
      return sessionDetails ? JSON.parse(sessionDetails) : {};
    }
  } catch (error) {
    logger.error('Error loading estimate data from localStorage:', error);
    return {}; // Return empty object on error
  }
}

/**
 * Save session data to localStorage
 * @param {object} data - Estimate data to save
 */
function saveEstimateData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (localStorageError) {
    logger.error('sessionStorage not available:', localStorageError);
  }
}

/**
 * Clear session data from localStorage
 */
function clearEstimateData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (localStorageError) {
    logger.warn('sessionStorage not available:', localStorageError);
  }
}

/**
 * Get specific estimate data from localStorage
 * @param {string} estimateId - The estimate ID to retrieve
 * @returns {object | null} The estimate data or null if not found
 */
function getEstimate(estimateId) {
  var storedData = loadEstimateData();
  return storedData.estimates && storedData.estimates[estimateId] ? storedData.estimates[estimateId] : null;
}

/**
 * Save a specific estimate to localStorage
 * @param {string} estimateId - The estimate ID
 * @param {object} estimateData - The estimate data to save
 */
function saveEstimate(estimateId, estimateData) {
  var storedData = loadEstimateData();
  if (!storedData.estimates) {
    storedData.estimates = {};
  }
  storedData.estimates[estimateId] = estimateData;
  saveEstimateData(storedData);
}

/**
 * Add a new estimate to localStorage
 * @param {object} estimateData - Estimate data to add
 * @returns {string} The new estimate ID
 */
function addEstimate(estimateData) {
  var storedData = loadEstimateData();
  if (!storedData.estimates) {
    storedData.estimates = {};
  }

  // Generate a unique ID using UUID v4 or use the provided ID
  var estimateId;

  // If the estimate data already has an ID field, use it
  if (estimateData.id) {
    estimateId = estimateData.id;
  } else {
    // No ID provided, generate a UUID with 'estimate' prefix
    estimateId = generateUniqueId('estimate');
    // Set the ID in the estimate data object
    estimateData.id = estimateId;
  }
  storedData.estimates[estimateId] = estimateData;
  saveEstimateData(storedData);
  return estimateId;
}

/**
 * Remove an estimate from localStorage
 * @param {string} estimateId - Estimate ID to remove
 * @returns {boolean} Success or failure
 */
function removeEstimate(estimateId) {
  var storedData = loadEstimateData();
  if (!storedData.estimates || !storedData.estimates[estimateId]) {
    return false;
  }
  delete storedData.estimates[estimateId];
  saveEstimateData(storedData);
  return true;
}

/**
 * Add a room to an estimate in localStorage
 * @param {string} estimateId - Estimate ID
 * @param {object} roomData - Room data to add
 * @returns {string} The new room ID
 */
function addRoom(estimateId, roomData) {
  var storedData = loadEstimateData();
  if (!storedData.estimates || !storedData.estimates[estimateId]) {
    return false;
  }
  var estimate = storedData.estimates[estimateId];
  if (!estimate.rooms) {
    estimate.rooms = {};
  }

  // Generate a unique ID using UUID v4 or use the provided ID
  var roomId;

  // If the room data already has an ID field, use it
  if (roomData.id) {
    roomId = roomData.id;
  } else {
    // No ID provided, generate a UUID with 'room' prefix
    roomId = generateUniqueId('room');
    // Set the ID in the room data object
    roomData.id = roomId;
  }

  // Initialize primary_category_product_id
  if (!Object.prototype.hasOwnProperty.call(roomData, 'primary_category_product_id')) {
    roomData.primary_category_product_id = null;
  }
  estimate.rooms[roomId] = roomData;
  saveEstimateData(storedData);
  return roomId;
}

/**
 * Get suggestions for a room from localStorage
 * @param {string} estimateId - Estimate ID
 * @param {string} roomId - Room ID
 * @returns {Array|null|Promise<null>} Array of suggestion products, null if not found, or a Promise resolving to null if feature is disabled
 */
function getSuggestionsForRoom(estimateId, roomId) {
  if (!window.productEstimatorVars.featureSwitches.suggested_products_enabled) {
    logger.log("[getSuggestionsForRoom] Suggestions feature is disabled. Returning null for room ".concat(roomId, "."));
    return Promise.resolve(null); // Or Promise.resolve([])
  }
  var storedData = loadEstimateData();
  if (!storedData.estimates || !storedData.estimates[estimateId] || !storedData.estimates[estimateId].rooms || !storedData.estimates[estimateId].rooms[roomId]) {
    return null;
  }
  return storedData.estimates[estimateId].rooms[roomId].product_suggestions || null;
}

/**
 * Add suggestions to a room in localStorage
 * @param {Array} suggestedProducts - Suggested Products Array to set
 * @param {string} estimateId - Estimate ID
 * @param {string} roomId - Room ID
 * @returns {Array|null|Promise<null>} Array of suggestion products added to room, null if not found, or a Promise resolving to null if feature is disabled
 */
function addSuggestionsToRoom(suggestedProducts, estimateId, roomId) {
  if (!window.productEstimatorVars.featureSwitches.suggested_products_enabled) {
    logger.log("[addSuggestionsToRoom] Suggestions feature is disabled. Returning null for room ".concat(roomId, "."));
    return Promise.resolve(null); // Or Promise.resolve([])
  }
  var storedData = loadEstimateData(); //

  if (!storedData.estimates || !storedData.estimates[estimateId] || !storedData.estimates[estimateId].rooms || !storedData.estimates[estimateId].rooms[roomId]) {
    //
    return null; //
  }
  var room = storedData.estimates[estimateId].rooms[roomId];

  // Ensure suggestedProducts is an array
  if (!Array.isArray(suggestedProducts)) {
    logger.error('Error: suggestedProducts must be an array.');
    return null;
  }
  room.product_suggestions = suggestedProducts;
  saveEstimateData(storedData);
  return room.product_suggestions;
}

/**
 * Update the primary category product ID for a room
 * Finds the product with is_primary_category = true and sets it on the room
 * @param {object} room - The room object to update
 */
function updateRoomPrimaryCategory(room) {
  if (!room.products || (0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(room.products) !== 'object') {
    room.primary_category_product_id = null;
    return;
  }

  // Find the product with is_primary_category = true
  var primaryCategoryProductId = null;
  for (var productId in room.products) {
    var product = room.products[productId];
    if (product && product.is_primary_category === true) {
      primaryCategoryProductId = productId;
      break; // Only one primary category product should exist per room
    }
  }
  room.primary_category_product_id = primaryCategoryProductId;
}

/**
 * Remove a room from an estimate in localStorage
 * @param {string} estimateId - Estimate ID
 * @param {string} roomId - Room ID to remove
 * @returns {boolean} Success or failure
 */
function removeRoom(estimateId, roomId) {
  var storedData = loadEstimateData();
  if (!storedData.estimates || !storedData.estimates[estimateId] || !storedData.estimates[estimateId].rooms || !storedData.estimates[estimateId].rooms[roomId]) {
    return false;
  }
  delete storedData.estimates[estimateId].rooms[roomId];
  saveEstimateData(storedData);
  return true;
}

/**
 * Add a product to a room in localStorage
 * @param {string} estimateId - Estimate ID
 * @param {string} roomId - Room ID
 * @param {object} productData - Product data to add
 * @returns {boolean} Success or failure
 */
function addProductToRoom(estimateId, roomId, productData) {
  var _storedDataAfterSave$, _roomAfterSave$produc;
  var storedData = loadEstimateData();
  if (!storedData.estimates || !storedData.estimates[estimateId] || !storedData.estimates[estimateId].rooms || !storedData.estimates[estimateId].rooms[roomId]) {
    logger.error("Estimate or Room not found. E: ".concat(estimateId, ", R: ").concat(roomId));
    return false;
  }
  var room = storedData.estimates[estimateId].rooms[roomId];

  // Convert room.products from array to object if needed
  if (Array.isArray(room.products)) {
    // Convert existing array to object with product ID as key
    var productsObject = {};
    room.products.forEach(function (product) {
      if (product && product.id) {
        productsObject[product.id] = product;
      }
    });
    room.products = productsObject;
  } else if (!room.products || (0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(room.products) !== 'object') {
    // Initialize as empty object if not already an object
    room.products = {};
  }

  // Ensure room.product_suggestions array exists (important for DataService flow)
  if (!Array.isArray(room.product_suggestions)) {
    room.product_suggestions = [];
  }

  // Make sure productData is an object, not a string
  var productDataObj = productData;

  // If productData is a string, try to parse it into an object
  if (typeof productData === 'string') {
    try {
      productDataObj = JSON.parse(productData);
      logger.log('Converted product data from string to object');
    } catch (e) {
      logger.error('Failed to parse product data string:', e);
      return false;
    }
  }

  // Check if product with the same ID already exists in the room's products object
  if (room.products[productDataObj.id]) {
    logger.warn(" Product with ID ".concat(productDataObj.id, " already exists in room ").concat(roomId, ". Aborting add to room.products."));
    return false; // Indicate failure because product already exists
  }

  // Add product to room.products using product ID as key
  room.products[productDataObj.id] = productDataObj;

  // Debug logs to check the similar_products
  if (productDataObj.similar_products) {
    console.log('EstimateStorage: Product has similar_products before save:', productDataObj.similar_products);
  } else {
    console.log('EstimateStorage: Product has NO similar_products before save');
  }

  // Update the primary category product ID for the room
  updateRoomPrimaryCategory(room);
  saveEstimateData(storedData);

  // Verify after save
  var storedDataAfterSave = loadEstimateData();
  var roomAfterSave = (_storedDataAfterSave$ = storedDataAfterSave.estimates) === null || _storedDataAfterSave$ === void 0 || (_storedDataAfterSave$ = _storedDataAfterSave$[estimateId]) === null || _storedDataAfterSave$ === void 0 || (_storedDataAfterSave$ = _storedDataAfterSave$.rooms) === null || _storedDataAfterSave$ === void 0 ? void 0 : _storedDataAfterSave$[roomId];
  var productAfterSave = roomAfterSave === null || roomAfterSave === void 0 || (_roomAfterSave$produc = roomAfterSave.products) === null || _roomAfterSave$produc === void 0 ? void 0 : _roomAfterSave$produc[productDataObj.id];
  if (productAfterSave && productAfterSave.similar_products) {
    console.log('EstimateStorage: Product has similar_products AFTER save:', productAfterSave.similar_products);
  } else {
    console.log('EstimateStorage: Product has NO similar_products AFTER save');
  }
  logger.log(" Product ".concat(productDataObj.id, " added to room ").concat(roomId, ". products:"), room.products);
  return true; // Indicate success
}

// EstimateStorage.js - Replace the existing function with this
/**
 * Remove a product from a room in localStorage based on Product ID.
 * @param {string} estimateId - Estimate ID
 * @param {string} roomId - Room ID
 * @param {number} productIndex - Index (Received but not used for removal logic)
 * @param {string|number} productId - ProductId of the product to remove. This is used for localStorage removal.
 * @returns {boolean} Success or failure
 */
function removeProductFromRoom(estimateId, roomId, productIndex, productId) {
  var storedData = loadEstimateData();

  // Check if the basic path and products object exist.
  if (!storedData.estimates || !storedData.estimates[estimateId] || !storedData.estimates[estimateId].rooms || !storedData.estimates[estimateId].rooms[roomId]) {
    logger.warn('[removeProductFromRoom] Attempted to remove product: Path to products is invalid.', {
      estimateId: estimateId,
      roomId: roomId,
      receivedProductId: productId
    });
    return false;
  }
  var room = storedData.estimates[estimateId].rooms[roomId];

  // Convert room.products from array to object if needed (for backward compatibility)
  if (Array.isArray(room.products)) {
    // Convert existing array to object with product ID as key
    var productsObject = {};
    room.products.forEach(function (product) {
      if (product && product.id) {
        productsObject[product.id] = product;
      }
    });
    room.products = productsObject;
  } else if (!room.products || (0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(room.products) !== 'object') {
    // Initialize as empty object if not already an object
    room.products = {};
  }

  // Check if the product exists in the room
  var productIdStr = String(productId);
  if (!room.products[productIdStr]) {
    logger.warn("[removeProductFromRoom] Product with ID '".concat(productId, "' not found in room '").concat(roomId, "' for estimate '").concat(estimateId, "'. Cannot remove."));
    return false; // Product not found by ID
  }

  // Remove the product by deleting its key
  delete room.products[productIdStr];

  // Update the primary category product ID for the room
  updateRoomPrimaryCategory(room);
  saveEstimateData(storedData);
  logger.log("[removeProductFromRoom] Product with ID '".concat(productId, "' successfully removed from localStorage for room '").concat(roomId, "', estimate '").concat(estimateId, "'."));
  return true; // Successfully removed by ID
}

/**
 * Update customer details in localStorage
 * @param {object} customerDetails - Customer details to save
 */
function updateCustomerDetails(customerDetails) {
  var storedData = loadEstimateData();

  // Store customer details at the top level
  storedData.customerDetails = customerDetails;
  saveEstimateData(storedData);
}

/**
 * Get all estimates from localStorage
 * @returns {object} All estimates
 */
function getEstimates() {
  var storedData = loadEstimateData();
  return storedData.estimates || {};
}

/**
 * Replace an existing product with a new one in localStorage
 * @param {string} estimateId - Estimate ID
 * @param {string} roomId - Room ID
 * @param {string} oldProductId - ID of product to replace
 * @param {string} newProductId - ID of new product
 * @param {object} newProductData - New product data
 * @param {string} replaceType - Type of replacement ('main' or 'additional_products')
 * @param {string|null} parentProductId - ID of the parent product (if replacing additional product)
 * @returns {boolean} Success or failure
 */
function replaceProductInRoom(estimateId, roomId, oldProductId, newProductId, newProductData) {
  var replaceType = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'main';
  var parentProductId = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;
  var storedData = loadEstimateData();

  // Check if estimate or room exists
  if (!storedData.estimates || !storedData.estimates[estimateId] || !storedData.estimates[estimateId].rooms || !storedData.estimates[estimateId].rooms[roomId]) {
    logger.warn("Estimate or room not found in storedData.");
    return false;
  }
  var room = storedData.estimates[estimateId].rooms[roomId];

  // Check if the room has products
  if (!room.products || (0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(room.products) !== 'object') {
    logger.warn("Room products not found or not an object.");
    return false;
  }

  // Convert IDs to strings for consistent comparison
  var oldProductIdStr = String(oldProductId);
  var newProductIdStr = String(newProductId);

  // Handle replacement based on type
  if (replaceType === 'additional_products' && parentProductId !== null) {
    var parentProductIdStr = String(parentProductId);

    // Get the parent product directly
    var parentProduct = room.products[parentProductIdStr];
    if (!parentProduct) {
      logger.warn("Parent product with ID ".concat(parentProductIdStr, " not found."));
      return false;
    }

    // Check if the parent product has additional products
    if (!parentProduct.additional_products || !Array.isArray(parentProduct.additional_products)) {
      logger.warn("Parent product with ID ".concat(parentProductIdStr, " has no additional products."));
      return false;
    }

    // Find the additional product to replace
    for (var j = 0; j < parentProduct.additional_products.length; j++) {
      var addProduct = parentProduct.additional_products[j];

      // Check if this is the product to replace
      if (addProduct.id == oldProductIdStr || addProduct.replacement_chain && addProduct.replacement_chain.includes(oldProductIdStr)) {
        logger.log("Found product to replace: ".concat(oldProductIdStr, " under parent ").concat(parentProductIdStr));

        // Handle replacement chain
        if (!addProduct.replacement_chain) {
          addProduct.replacement_chain = [];
        }
        if (!addProduct.replacement_chain.includes(addProduct.id)) {
          addProduct.replacement_chain.push(addProduct.id);
        }
        newProductData.replacement_chain = addProduct.replacement_chain;

        // Replace the product
        room.products[parentProductIdStr].additional_products[j] = newProductData;

        // Save and return
        saveEstimateData(storedData);
        return true;
      }
    }
    logger.warn("Additional product with ID ".concat(oldProductIdStr, " not found under parent ").concat(parentProductIdStr, "."));
    return false;
  } else if (replaceType === 'main') {
    // Check if the product exists
    if (!room.products[oldProductIdStr]) {
      logger.warn("Main product with ID ".concat(oldProductIdStr, " not found in room."));
      return false;
    }

    // Remove the old product
    delete room.products[oldProductIdStr];

    // Add the new product
    room.products[newProductIdStr] = newProductData;

    // Update the primary category product ID for the room
    updateRoomPrimaryCategory(room);

    // Save and return
    saveEstimateData(storedData);
    return true;
  }
  logger.warn("Invalid replaceType: ".concat(replaceType));
  return false;
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  loadEstimateData: loadEstimateData,
  saveEstimateData: saveEstimateData,
  clearEstimateData: clearEstimateData,
  getEstimate: getEstimate,
  saveEstimate: saveEstimate,
  addEstimate: addEstimate,
  removeEstimate: removeEstimate,
  addRoom: addRoom,
  removeRoom: removeRoom,
  addProductToRoom: addProductToRoom,
  removeProductFromRoom: removeProductFromRoom,
  updateCustomerDetails: updateCustomerDetails,
  getEstimates: getEstimates,
  replaceProductInRoom: replaceProductInRoom,
  getSuggestionsForRoom: getSuggestionsForRoom,
  addSuggestionsToRoom: addSuggestionsToRoom
});

/***/ }),

/***/ "./src/js/frontend/EstimatorCore.js":
/*!******************************************!*\
  !*** ./src/js/frontend/EstimatorCore.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/* harmony import */ var _DataService__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./DataService */ "./src/js/frontend/DataService.js");
/* harmony import */ var _managers_ModalManager__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./managers/ModalManager */ "./src/js/frontend/managers/ModalManager.js");
/* harmony import */ var _VariationHandler__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./VariationHandler */ "./src/js/frontend/VariationHandler.js");
/* harmony import */ var _CustomerDetailsManager__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./CustomerDetailsManager */ "./src/js/frontend/CustomerDetailsManager.js");


/**
 * EstimatorCore.js
 *
 * Main entry point for the Product Estimator JS.
 * Coordinates between modules and manages global state.
 */

 // Make sure closeMainPluginLogGroup is imported





var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.createLogger)('EstimatorCore');
var EstimatorCore = /*#__PURE__*/function () {
  /**
   * Initialize the EstimatorCore
   * @param {object} config - Configuration options
   */
  function EstimatorCore() {
    var _window$productEstima;
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, EstimatorCore);
    this.isActive = true;

    // Default configuration
    this.config = Object.assign({
      debug: false,
      selectors: {
        estimatorButtons: '.product-estimator-button, .single_add_to_estimator_button, .open-estimator-modal',
        estimatorMenuButtons: '.product-estimator-menu-item a, a.product-estimator-menu-item',
        modalContainer: '#product-estimator-modal'
      },
      autoInit: true,
      i18n: ((_window$productEstima = window.productEstimatorVars) === null || _window$productEstima === void 0 ? void 0 : _window$productEstima.i18n) || {} // Get i18n from global vars on init
    }, config);

    // Module references
    this.dataService = null;
    this.modalManager = null;
    this.variationHandler = null;
    this.customerDetailsManager = null;

    // State
    this.initialized = false;
    this.eventHandlers = {};

    // Auto-initialize if configured
    if (this.config.autoInit) {
      this.init();
    }
  }

  /**
   * Initialize the core and all modules
   * @returns {EstimatorCore} This instance for chaining
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(EstimatorCore, [{
    key: "init",
    value: function init() {
      var _this = this;
      // Strong guard against multiple initialization
      if (this.initialized) {
        logger.log('already initialized - aborting');
        return this;
      }

      // Also check for global init status
      if (window._productEstimatorInitialized && window.productEstimator && window.productEstimator.core) {
        logger.log('detected as already initialized globally - aborting');
        this.initialized = true;
        return this;
      }
      logger.log('Initializing EstimatorCore');
      try {
        // Verify jQuery is properly loaded
        if (typeof jQuery === 'undefined') {
          logger.error('jQuery is not loaded, cannot initialize EstimatorCore');
          return this;
        }

        // Create a single data service instance
        if (!this.dataService) {
          this.dataService = new _DataService__WEBPACK_IMPORTED_MODULE_3__["default"]({
            debug: this.config.debug
          });
        }

        // Safe initialization with clear console marking
        logger.log('%c=== PRODUCT ESTIMATOR INITIALIZATION START ===', 'background: #f0f0f0; color: #333; padding: 3px; border-radius: 3px;');

        // Ensure we wait for DOM to be fully ready with a clear initialization boundary
        var initializeComponents = function initializeComponents() {
          if (_this.modalManager) {
            logger.log('Components already initialized - skipping');
            return;
          }

          // Initialize modal manager
          _this.modalManager = new _managers_ModalManager__WEBPACK_IMPORTED_MODULE_4__["default"]({
            debug: _this.config.debug,
            selectors: _this.config.selectors
          }, _this.dataService);

          // Initialize customer details manager
          _this.customerDetailsManager = new _CustomerDetailsManager__WEBPACK_IMPORTED_MODULE_6__["default"]({
            debug: _this.config.debug
          }, _this.dataService);

          // Initialize variation handler if on product page
          if (_this.isWooCommerceProductPage()) {
            logger.log('WooCommerce product page detected, initializing VariationHandler');
            _this.variationHandler = new _VariationHandler__WEBPACK_IMPORTED_MODULE_5__["default"]({
              debug: _this.config.debug
            });
          }
          _this.bindGlobalEvents();
          _this.initialized = true;
          logger.log('initialized successfully');
          _this.emit('core:initialized');
          logger.log('%c=== PRODUCT ESTIMATOR INITIALIZATION COMPLETE ===', 'background: #f0f0f0; color: #333; padding: 3px; border-radius: 3px;');
        };

        // Use a small delay to ensure DOM is ready
        if (document.readyState === 'complete') {
          initializeComponents();
        } else {
          window.addEventListener('load', initializeComponents, {
            once: true
          });
        }
      } catch (error) {
        logger.error('EstimatorCore initialization error:', error);
      }
      return this;
    }

    /**
     * Binds global event handlers for the estimator
     * Sets up click handlers for estimator buttons and menu items
     * Creates a single event handler and stores a reference to avoid memory leaks
     * @returns {void}
     */
  }, {
    key: "bindGlobalEvents",
    value: function bindGlobalEvents() {
      var _this2 = this;
      try {
        // IMPORTANT: Remove any existing event listeners first
        if (this._clickHandler) {
          document.removeEventListener('click', this._clickHandler);
          logger.log('Removed existing click handler');
        }

        // Create a single handler function and store a reference to it
        this._clickHandler = function (e) {
          // Handle menu buttons (force list view)
          var menuButton = e.target.closest(_this2.config.selectors.estimatorMenuButtons);
          if (menuButton) {
            e.preventDefault();
            e.stopPropagation();
            logger.log('Menu button clicked - opening modal in list view');
            if (_this2.modalManager) {
              // Pass true as second parameter to force list view mode
              _this2.modalManager.openModal(null, true);
            }
            return;
          }

          // Handle regular product buttons
          var button = e.target.closest(_this2.config.selectors.estimatorButtons);
          if (button && !menuButton) {
            // Ensure we don't process both if menu button matches both selectors
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation(); // Prevent any other handlers from running

            // Get product ID from data attribute
            var productId = button.dataset.productId || null;
            logger.log('PRODUCT BUTTON CLICKED:', {
              productId: productId,
              buttonElement: button,
              dataAttribute: button.dataset
            });

            // Add loading state to the button - prevent duplicates
            if (button.classList.contains('loading')) {
              logger.log('Button already has loading state, skipping');
              return;
            }

            // Store original content
            var originalButtonText = button.textContent;
            var buttonWasDisabled = button.disabled;

            // Store as data attributes for later restoration
            button.dataset.originalText = originalButtonText;
            button.dataset.originalDisabled = buttonWasDisabled;

            // Add loading state
            button.disabled = true;
            button.classList.add('loading');

            // Only add our spinner to product-estimator-category-button
            if (button.classList.contains('product-estimator-category-button')) {
              // Clear button content and add our spinner
              button.innerHTML = '';
              var loadingSpinner = document.createElement('span');
              loadingSpinner.className = 'button-loading-spinner';
              loadingSpinner.innerHTML = '<span class="dashicons dashicons-update-alt spinning"></span>';
              button.appendChild(loadingSpinner);
            }
            // For single_add_to_estimator_button, just let WooCommerce handle the loading state

            if (_this2.modalManager) {
              logger.log('OPENING MODAL WITH:', {
                productId: productId,
                forceListView: false
              });

              // Pass button reference to modal manager so it can reset the state
              var config = {
                originalButtonText: originalButtonText,
                buttonWasDisabled: buttonWasDisabled,
                button: button
              };

              // Explicitly pass productId and set forceListView to false
              _this2.modalManager.openModal(productId, false, config);
            }
          }
        };

        // Add the event listener with our stored handler
        document.addEventListener('click', this._clickHandler);

        // Emit event for monitoring
        this.emit('core:eventsbound');
        // logger.log('Global events bound');
      } catch (error) {
        logger.error('Error binding global events:', error);
      }
    }

    /**
     * Closes the estimator modal if it's currently open
     * Delegates to the modalManager instance
     * Does nothing if modalManager is not initialized
     * @returns {void}
     */
  }, {
    key: "closeModal",
    value: function closeModal() {
      if (this.modalManager) {
        this.modalManager.closeModal();
      }
    }

    /**
     * Check if we're on a WooCommerce product page
     * @returns {boolean} True if on a product page
     */
  }, {
    key: "isWooCommerceProductPage",
    value: function isWooCommerceProductPage() {
      return document.body.classList.contains('single-product') || document.body.classList.contains('product-template-default') || !!document.querySelector('.product.type-product');
    }

    /**
     * Register an event handler
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     * @returns {EstimatorCore} This instance for chaining
     */
  }, {
    key: "on",
    value: function on(event, callback) {
      if (!this.eventHandlers[event]) {
        this.eventHandlers[event] = [];
      }
      this.eventHandlers[event].push(callback);
      return this;
    }

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {*} data - Event data
     * @returns {EstimatorCore} This instance for chaining
     */
  }, {
    key: "emit",
    value: function emit(event, data) {
      if (this.eventHandlers[event]) {
        this.eventHandlers[event].forEach(function (callback) {
          return callback(data);
        });
      }
      return this;
    }

    /**
     * Cleans up resources and deactivates the estimator core
     * Closes any open log groups to maintain clean console output
     * Should be called when the plugin is being removed from the page
     * @returns {void}
     */
  }, {
    key: "destroy",
    value: function destroy() {
      if (!this.isActive) return;
      logger.log('Plugin destroying...');

      // All logging for this plugin instance is now complete.
      // You can close the main plugin log group.
      (0,_utils__WEBPACK_IMPORTED_MODULE_2__.closeMainPluginLogGroup)(); // Explicitly close the main group

      this.isActive = false;
      // After this, new logs might start a *new* main group if the plugin is re-initialized,
      // or if other parts of the plugin are still logging (which should ideally be avoided after destroy).
    }
  }]);
}(); // Create and export a singleton instance
var estimatorCore = new EstimatorCore({
  debug: true
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (estimatorCore);

/***/ }),

/***/ "./src/js/frontend/PrintEstimate.js":
/*!******************************************!*\
  !*** ./src/js/frontend/PrintEstimate.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");



function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/**
 * PrintEstimate.js
 *
 * Handles PDF generation and viewing for the Product Estimator plugin.
 * Manages customer detail verification, secure token generation, and PDF display.
 * Includes support for persistent customer details across estimates.
 * Added functionality for store contact requests via email or phone.
 */


// ConfirmationDialog is used indirectly via window.productEstimator.dialog

var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.createLogger)('PrintEstimate');
var PrintEstimate = /*#__PURE__*/function () {
  /**
   * Initialize the PrintEstimate module
   * @param {object} config - Configuration options
   */
  function PrintEstimate() {
    var _window$productEstima;
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__["default"])(this, PrintEstimate);
    // Default configuration
    this.config = Object.assign({
      debug: false,
      selectors: {
        printButton: '.print-estimate, .print-estimate-pdf',
        requestContactButton: '.request-contact-estimate',
        requestCopyButton: '.request-a-copy',
        scheduleDesignerButton: '.schedule-designer-estimate'
      },
      i18n: ((_window$productEstima = window.productEstimatorVars) === null || _window$productEstima === void 0 ? void 0 : _window$productEstima.i18n) || {}
    }, config);

    // State
    this.initialized = false;
    this.processing = false;

    // Initialize if auto-init is not set to false
    if (config.autoInit !== false) {
      this.init();
    }
  }

  /**
   * Initialize the module
   * @returns {PrintEstimate} This instance for chaining
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__["default"])(PrintEstimate, [{
    key: "init",
    value: function init() {
      if (this.initialized) {
        this.log('PrintEstimate already initialized');
        return this;
      }

      // Bind event handlers
      this.bindEvents();
      this.initialized = true;
      this.log('PrintEstimate initialized');
      return this;
    }

    /**
     * Bind events for printing estimates
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this = this;
      // Use event delegation for better performance and to handle dynamically added elements
      document.addEventListener('click', function (e) {
        // Handle print PDF buttons
        var printButton = e.target.closest(_this.config.selectors.printButton);
        if (printButton && !_this.processing) {
          e.preventDefault(); // Prevent default link behavior

          // Set processing state to prevent double-clicks
          _this.processing = true;
          _this.setButtonLoading(printButton, true);
          if (printButton.classList.contains('print-estimate-pdf')) {
            // This is a direct PDF link - check customer details before proceeding
            var estimateId = printButton.dataset.estimateId;
            _this.checkCustomerDetails(estimateId).then(function (customerInfo) {
              // Check if name and email exist
              var missingFields = [];
              if (!customerInfo.name || customerInfo.name.trim() === '') missingFields.push('name');
              if (!customerInfo.email || customerInfo.email.trim() === '') missingFields.push('email');
              if (missingFields.length === 0) {
                // All required details exist, open the PDF URL
                var pdfUrl = printButton.getAttribute('href');
                if (pdfUrl && pdfUrl !== '#' && pdfUrl !== 'javascript:void(0)') {
                  window.open(pdfUrl, '_blank');
                } else {
                  // Get a fresh PDF URL
                  _this.getSecurePdfUrl(estimateId).then(function (url) {
                    window.open(url, '_blank');
                  })["catch"](function () {
                    _this.showError('Error generating PDF URL. Please try again.');
                  });
                }
              } else {
                // Missing details, show prompt
                _this.showCustomerDetailsPrompt(estimateId, printButton, 'print');
              }
            })["catch"](function () {
              _this.showError('Error checking customer details. Please try again.');
            })["finally"](function () {
              // Button state will be reset after PDF opens or error
            });
          } else {
            // This is a JS-based print button
            _this.handlePrintEstimate(printButton);
          }
        }

        // Handle request copy button (email PDF to customer)
        var requestCopyButton = e.target.closest(_this.config.selectors.requestCopyButton);
        if (requestCopyButton && !_this.processing) {
          e.preventDefault();
          _this.processing = true;
          _this.setButtonLoading(requestCopyButton, true);
          var _estimateId = requestCopyButton.dataset.estimateId;

          // Show contact method choice modal
          _this.showContactSelectionPrompt(_estimateId, requestCopyButton, 'request_copy');
        }

        // Handle request contact from store button
        var requestContactButton = e.target.closest(_this.config.selectors.requestContactButton);
        if (requestContactButton && !_this.processing) {
          e.preventDefault();
          _this.processing = true;
          _this.setButtonLoading(requestContactButton, true);
          var _estimateId2 = requestContactButton.dataset.estimateId;

          // Show contact method choice modal - similar to request copy but with different messaging
          _this.showContactSelectionPrompt(_estimateId2, requestContactButton, 'request_contact');
        }
      });
    }

    /**
     * Handle print estimate button click
     * @param {HTMLElement} button - The clicked button
     */
  }, {
    key: "handlePrintEstimate",
    value: function handlePrintEstimate(button) {
      var _this2 = this;
      var estimateId = button.dataset.estimateId;
      if (!estimateId) {
        this.showError('No estimate ID provided');
        this.setButtonLoading(button, false);
        this.processing = false;
        return;
      }
      this.log("Print estimate requested for estimate ID: ".concat(estimateId));

      // Check if customer has required details
      this.checkCustomerDetails(estimateId).then(function (customerInfo) {
        // Check if name and email exist
        var missingFields = [];
        if (!customerInfo.name || customerInfo.name.trim() === '') missingFields.push('name');
        if (!customerInfo.email || customerInfo.email.trim() === '') missingFields.push('email');
        if (missingFields.length === 0) {
          // Customer has all required details, proceed with store and generate
          return _this2.storeEstimate(estimateId).then(function (data) {
            if (data && data.estimate_id) {
              // Get a secure PDF URL
              return _this2.getSecurePdfUrl(data.estimate_id);
            } else {
              throw new Error('Failed to store estimate');
            }
          }).then(function (pdfUrl) {
            _this2.setButtonLoading(button, false);
            _this2.processing = false;
            // Open the PDF URL in a new tab
            window.open(pdfUrl, '_blank');
          });
        } else {
          // Missing required details, show prompt
          _this2.showCustomerDetailsPrompt(estimateId, button, 'print');
          return Promise.reject(new Error('missing_customer_details'));
        }
      })["catch"](function (error) {
        if (error.message !== 'missing_customer_details') {
          _this2.showError('Error generating PDF. Please try again.');
          _this2.setButtonLoading(button, false);
          _this2.processing = false;
        }
      });
    }

    /**
     * Show customer details prompt to collect missing information
     * @param {string} estimateId - The estimate ID
     * @param {HTMLElement} button - The button element
     * @param {string} action - The action type ('print', 'request_copy_email', 'request_copy_sms')
     */
  }, {
    key: "showCustomerDetailsPrompt",
    value: function showCustomerDetailsPrompt(estimateId, button) {
      var _this3 = this;
      var action = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'print';
      // Required fields are determined in getMissingFields method
      // Field requirements by action type:
      // print: ['name', 'email']
      // request_copy_email: ['name', 'email']
      // request_copy_sms: ['name', 'phone']
      // request_contact_email: ['name', 'email']
      // request_contact_phone: ['name', 'phone']

      // First check which fields are already available in customer details
      this.checkCustomerDetails(estimateId).then(function (customerInfo) {
        // Determine which fields are missing based on action type
        var missingFields = _this3.getMissingFields(customerInfo, action);
        if (missingFields.length === 0) {
          // No missing fields, proceed with the action
          _this3.continueWithAction(action, estimateId, button, customerInfo);
          return;
        }

        // Create modal HTML with dynamic fields based on what's missing
        var modalHtml = _this3.createPromptModalHtml(missingFields, action, customerInfo);

        // Create container for the modal
        var promptEl = document.createElement('div');
        promptEl.className = 'email-prompt-modal';
        promptEl.innerHTML = modalHtml;
        document.body.appendChild(promptEl);

        // Get elements
        var cancelBtn = promptEl.querySelector('.cancel-email-btn');
        var submitBtn = promptEl.querySelector('.submit-email-btn');
        var validationMsg = promptEl.querySelector('.email-validation-message');

        // Handle cancel
        cancelBtn.addEventListener('click', function () {
          promptEl.remove();
          _this3.setButtonLoading(button, false);
          _this3.processing = false;
        });

        // Handle submit
        submitBtn.addEventListener('click', function () {
          // Collect values from all input fields
          var updatedDetails = _objectSpread({}, customerInfo);
          var isValid = true;

          // Validate and collect all fields
          missingFields.forEach(function (field) {
            var input = promptEl.querySelector("#customer-".concat(field, "-input"));
            var value = input ? input.value.trim() : '';
            if (!value) {
              validationMsg.textContent = "".concat(_this3.getFieldLabel(field), " is required");
              isValid = false;
              return;
            }

            // Special validation for email and phone
            if (field === 'email' && !_this3.validateEmail(value)) {
              validationMsg.textContent = 'Please enter a valid email address';
              isValid = false;
              return;
            }
            if (field === 'phone' && !_this3.validatePhone(value)) {
              validationMsg.textContent = 'Please enter a valid phone number';
              isValid = false;
              return;
            }
            updatedDetails[field] = value;
          });
          if (!isValid) return;

          // Show loading state
          submitBtn.disabled = true;
          submitBtn.textContent = 'Saving...';

          // Update customer details with the new values
          _this3.updateCustomerDetails(estimateId, updatedDetails).then(function () {
            // Remove prompt
            promptEl.remove();
            _this3.setButtonLoading(button, true);
            _this3.processing = true;

            // Continue with the original action
            _this3.continueWithAction(action, estimateId, button, updatedDetails);
          })["catch"](function () {
            validationMsg.textContent = 'Error saving details. Please try again.';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Continue';
          });
        });

        // Set focus to the first input field
        setTimeout(function () {
          var firstInput = promptEl.querySelector('input');
          if (firstInput) {
            firstInput.focus();

            // Add enter key handler to all inputs
            var allInputs = promptEl.querySelectorAll('input');
            allInputs.forEach(function (input) {
              input.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submitBtn.click();
                }
              });
            });
          }
        }, 100);
      })["catch"](function () {
        _this3.showError('Error checking customer details. Please try again.');
        _this3.setButtonLoading(button, false);
        _this3.processing = false;
      });
    }

    /**
     * Get a list of missing fields based on action type and customer info
     * @param {object} customerInfo - Customer details object
     * @param {string} action - The action type
     * @returns {Array} List of missing field names
     */
  }, {
    key: "getMissingFields",
    value: function getMissingFields(customerInfo, action) {
      var requiredFields = {
        'print': ['name', 'email'],
        'request_copy_email': ['name', 'email'],
        'request_copy_sms': ['name', 'phone'],
        'request_contact_email': ['name', 'email'],
        'request_contact_phone': ['name', 'phone']
      };

      // Determine which action type to use
      var fieldsToCheck = requiredFields[action] || requiredFields['print'];

      // Return fields that are missing or empty
      return fieldsToCheck.filter(function (field) {
        return !customerInfo || !customerInfo[field] || customerInfo[field].trim() === '';
      });
    }

    /**
     * Get readable label for a field
     * @param {string} field - Field name
     * @returns {string} User-friendly field label
     */
  }, {
    key: "getFieldLabel",
    value: function getFieldLabel(field) {
      var labels = {
        'name': 'Full Name',
        'email': 'Email Address',
        'phone': 'Phone Number'
      };
      return labels[field] || field.charAt(0).toUpperCase() + field.slice(1);
    }

    /**
     * Create HTML for the prompt modal with dynamic fields
     * @param {Array} missingFields - List of missing field names
     * @param {string} action - The action type
     * @param {object} existingDetails - Existing customer details
     * @returns {string} Modal HTML
     */
  }, {
    key: "createPromptModalHtml",
    value: function createPromptModalHtml(missingFields, action) {
      var _this4 = this;
      var existingDetails = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      // Determine the title and instruction based on action and missing fields
      var title = 'Please Complete Your Details';
      var instruction = 'Additional information is required to continue.';
      if (action === 'request_copy_email') {
        instruction = 'An email address is required to send your estimate copy.';
      } else if (action === 'request_copy_sms') {
        instruction = 'A phone number is required to send your estimate via SMS.';
      } else if (action === 'request_contact_email') {
        instruction = 'Your details are required for our store to contact you via email.';
      } else if (action === 'request_contact_phone') {
        instruction = 'Your details are required for our store to contact you via phone.';
      } else if (missingFields.includes('email') && !missingFields.includes('name')) {
        instruction = 'An email address is required to view your estimate.';
      }

      // Start building the HTML
      var html = "\n      <div class=\"email-prompt-overlay\"></div>\n      <div class=\"email-prompt-container\">\n        <div class=\"email-prompt-header\">\n          <h3>".concat(title, "</h3>\n        </div>\n        <div class=\"email-prompt-body\">\n          <p>").concat(instruction, "</p>\n    ");

      // Add input fields for each missing field
      missingFields.forEach(function (field) {
        var fieldLabel = _this4.getFieldLabel(field);
        var fieldValue = existingDetails[field] || '';
        var fieldType = field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text';
        html += "\n        <div class=\"form-group\">\n          <label for=\"customer-".concat(field, "-input\">").concat(fieldLabel, ":</label>\n          <input type=\"").concat(fieldType, "\" id=\"customer-").concat(field, "-input\" value=\"").concat(fieldValue, "\" required>\n        </div>\n      ");
      });

      // Add validation message area and buttons
      html += "\n          <div class=\"email-validation-message\"></div>\n        </div>\n        <div class=\"email-prompt-footer\">\n          <button type=\"button\" class=\"button cancel-email-btn\">Cancel</button>\n          <button type=\"button\" class=\"button submit-email-btn\">Continue</button>\n        </div>\n      </div>\n    ";
      return html;
    }

    /**
     * Validate email format
     * @param {string} email - Email address to validate
     * @returns {boolean} Whether the email is valid
     */
  }, {
    key: "validateEmail",
    value: function validateEmail(email) {
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailPattern.test(email);
    }

    /**
     * Validate phone format (basic validation)
     * @param {string} phone - Phone number to validate
     * @returns {boolean} Whether the phone number is valid
     */
  }, {
    key: "validatePhone",
    value: function validatePhone(phone) {
      // Allow digits, spaces, parens, plus, and dashes
      // At least 8 digits in total
      var phonePattern = /^[\d\s()+]{8,}$/;
      return phonePattern.test(phone);
    }

    /**
     * Continue with the original action after customer details are updated
     * @param {string} action - The action type
     * @param {string} estimateId - The estimate ID
     * @param {HTMLElement} button - The button element
     * @param {object} customerDetails - Updated customer details
     */
  }, {
    key: "continueWithAction",
    value: function continueWithAction(action, estimateId, button, customerDetails) {
      var _this5 = this;
      switch (action) {
        case 'print':
          this.handlePrintEstimate(button);
          break;
        case 'request_copy_email':
          this.requestCopyEstimate(estimateId, button).then(function () {
            _this5.showMessage("Estimate has been emailed to ".concat(customerDetails.email), 'success', function () {
              _this5.setButtonLoading(button, false);
              _this5.processing = false;
            });
          })["catch"](function () {
            _this5.showError('Error sending estimate copy. Please try again.');
            _this5.setButtonLoading(button, false);
            _this5.processing = false;
          });
          break;
        case 'request_copy_sms':
          // SMS functionality (coming soon)
          this.showMessage('SMS option coming soon.', 'success');
          this.setButtonLoading(button, false);
          this.processing = false;
          break;
        case 'request_contact_email':
          // Request contact via email
          this.requestStoreContact(estimateId, 'email', button, customerDetails);
          break;
        case 'request_contact_phone':
          // Request contact via phone
          this.requestStoreContact(estimateId, 'phone', button, customerDetails);
          break;
      }
    }

    /**
     * Show contact selection prompt (Email or SMS)
     * @param {string} estimateId - The estimate ID
     * @param {HTMLElement} button - The button element
     * @param {string} action - The action type
     */
  }, {
    key: "showContactSelectionPrompt",
    value: function showContactSelectionPrompt(estimateId, button) {
      var _this6 = this;
      var action = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'request_copy';
      // Customize title and prompt based on the action
      var title = 'How would you like to receive your estimate?';
      var prompt = 'Please choose how you\'d prefer to receive your estimate:';
      var emailBtnText = 'Email';
      var smsBtnText = 'SMS';
      if (action === 'request_contact') {
        title = 'How would you like to be contacted?';
        prompt = 'Please choose how you\'d prefer our store to contact you:';
        emailBtnText = 'Email';
        smsBtnText = 'Phone';
      }
      var modalHtml = "\n    <div class=\"email-prompt-overlay\"></div>\n    <div class=\"email-prompt-container\">\n      <div class=\"email-prompt-header\">\n        <h3>".concat(title, "</h3>\n      </div>\n      <div class=\"email-prompt-body\">\n        <p>").concat(prompt, "</p>\n      </div>\n      <div class=\"email-prompt-footer\">\n        <button type=\"button\" class=\"button cancel-email-btn\">Cancel</button>\n        <button type=\"button\" class=\"button submit-email-btn email-choice\">").concat(emailBtnText, "</button>\n        <button type=\"button\" class=\"button submit-email-btn sms-choice\">").concat(smsBtnText, "</button>\n      </div>\n    </div>\n  ");
      var promptEl = document.createElement('div');
      promptEl.className = 'email-prompt-modal';
      promptEl.innerHTML = modalHtml;
      document.body.appendChild(promptEl);
      var cancelBtn = promptEl.querySelector('.cancel-email-btn');
      var emailBtn = promptEl.querySelector('.email-choice');
      var smsBtn = promptEl.querySelector('.sms-choice');
      cancelBtn.addEventListener('click', function () {
        _this6.setButtonLoading(button, false);
        _this6.processing = false;
        promptEl.remove();
      });
      emailBtn.addEventListener('click', function () {
        promptEl.remove();

        // Determine the specific action for email
        var emailAction = action === 'request_contact' ? 'request_contact_email' : 'request_copy_email';

        // Check customer details
        _this6.checkCustomerDetails(estimateId).then(function (customerInfo) {
          // Always check for name, plus email for email actions
          var missingFields = [];
          if (!customerInfo.name || customerInfo.name.trim() === '') missingFields.push('name');
          if (!customerInfo.email || customerInfo.email.trim() === '') missingFields.push('email');
          if (missingFields.length === 0) {
            // All required details exist, proceed with the action
            if (action === 'request_contact') {
              _this6.requestStoreContact(estimateId, 'email', button, customerInfo);
            } else {
              // Original request_copy email flow
              _this6.requestCopyEstimate(estimateId, button).then(function () {
                _this6.showMessage("Estimate has been emailed to ".concat(customerInfo.email), 'success', function () {
                  _this6.setButtonLoading(button, false);
                  _this6.processing = false;
                });
              })["catch"](function () {
                _this6.showError('Error sending estimate copy. Please try again.');
                _this6.setButtonLoading(button, false);
                _this6.processing = false;
              });
            }
          } else {
            // Missing details, show prompt
            _this6.showCustomerDetailsPrompt(estimateId, button, emailAction);
          }
        })["catch"](function () {
          _this6.showError('Error checking customer details. Please try again.');
          _this6.setButtonLoading(button, false);
          _this6.processing = false;
        });
      });
      smsBtn.addEventListener('click', function () {
        promptEl.remove();

        // Determine the specific action for SMS/phone
        var smsAction = action === 'request_contact' ? 'request_contact_phone' : 'request_copy_sms';

        // Check customer details
        _this6.checkCustomerDetails(estimateId).then(function (customerInfo) {
          // Always check for name, plus phone for SMS/phone actions
          var missingFields = [];
          if (!customerInfo.name || customerInfo.name.trim() === '') missingFields.push('name');
          if (!customerInfo.phone || customerInfo.phone.trim() === '') missingFields.push('phone');
          if (missingFields.length === 0) {
            // All required details exist, proceed with the action
            if (action === 'request_contact') {
              _this6.requestStoreContact(estimateId, 'phone', button, customerInfo);
            } else {
              // Original request_copy SMS flow (coming soon)
              _this6.showMessage('SMS option coming soon.', 'success');
              _this6.setButtonLoading(button, false);
              _this6.processing = false;
            }
          } else {
            // Missing details, show prompt
            _this6.showCustomerDetailsPrompt(estimateId, button, smsAction);
          }
        })["catch"](function () {
          _this6.showError('Error checking customer details. Please try again.');
          _this6.setButtonLoading(button, false);
          _this6.processing = false;
        });
      });
    }

    /**
     * Request store contact for a customer
     * @param {string} estimateId - The estimate ID
     * @param {string} contactMethod - Contact method ('email' or 'phone')
     * @param {HTMLElement} button - The button element
     * @param {object} customerDetails - Customer details
     */
  }, {
    key: "requestStoreContact",
    value: function requestStoreContact(estimateId, contactMethod, button, customerDetails) {
      var _this7 = this;
      // First store the estimate to ensure it's in the database
      this.storeEstimate(estimateId).then(function (data) {
        if (!data || !data.estimate_id) {
          throw new Error('Failed to store estimate');
        }

        // Prepare data for the server-side request
        var requestData = {
          action: 'request_store_contact',
          nonce: productEstimatorVars.nonce,
          estimate_id: estimateId,
          contact_method: contactMethod,
          customer_details: JSON.stringify(customerDetails)
        };
        _this7.log('Sending store contact request with data:', requestData);

        // Make the AJAX request to send the email
        return fetch(productEstimatorVars.ajax_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams(requestData)
        });
      }).then(function (response) {
        return response.json();
      }).then(function (response) {
        if (response.success) {
          _this7.log('Store contact request successful:', response.data);

          // Show success message based on contact method
          var message = '';
          if (contactMethod === 'email') {
            message = "Your request has been sent. Our store will contact you at ".concat(customerDetails.email, " shortly.");
          } else {
            message = "Your request has been sent. Our store will call you at ".concat(customerDetails.phone, " shortly.");
          }
          _this7.showMessage(message, 'success');
        } else {
          var _response$data;
          _this7.log('Store contact request failed:', response.data);
          _this7.showError(((_response$data = response.data) === null || _response$data === void 0 ? void 0 : _response$data.message) || 'Error sending contact request. Please try again.');
        }
      })["catch"](function (error) {
        _this7.log('Error in requestStoreContact:', error);
        _this7.showError('Error sending contact request. Please try again.');
      })["finally"](function () {
        _this7.setButtonLoading(button, false);
        _this7.processing = false;
      });
    }

    /**
     * Check customer details for a specific estimate
     * @param {string} estimateId - The estimate ID
     * @returns {Promise<object>} Customer details object
     */
  }, {
    key: "checkCustomerDetails",
    value: function checkCustomerDetails(estimateId) {
      var _this8 = this;
      return new Promise(function (resolve, reject) {
        fetch(productEstimatorVars.ajax_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            action: 'check_customer_details',
            nonce: productEstimatorVars.nonce,
            estimate_id: estimateId
          })
        }).then(function (response) {
          return response.json();
        }).then(function (response) {
          if (response.success) {
            _this8.log('Customer details check result:', response.data);
            resolve(response.data.customer_details || {});
          } else {
            var _response$data2;
            reject(new Error(((_response$data2 = response.data) === null || _response$data2 === void 0 ? void 0 : _response$data2.message) || 'Error checking customer details'));
          }
        })["catch"](function (error) {
          _this8.log('Error checking customer details:', error);
          reject(error);
        });
      });
    }

    /**
     * Update customer details with multiple fields
     * This version dispatches an event to update all forms
     * @param {string} estimateId - The estimate ID
     * @param {object} details - Updated customer details
     * @returns {Promise<object>} Promise that resolves when details are updated
     */
  }, {
    key: "updateCustomerDetails",
    value: function updateCustomerDetails(estimateId, details) {
      return new Promise(function (resolve, reject) {
        // Make sure we have the minimum required fields
        if (!details.postcode) {
          details.postcode = '0000'; // Default postcode if not set
        }

        // Update customer details
        fetch(productEstimatorVars.ajax_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            action: 'update_customer_details',
            nonce: productEstimatorVars.nonce,
            details: JSON.stringify(details)
          })
        }).then(function (response) {
          return response.json();
        }).then(function (response) {
          if (!response.success) {
            var _response$data3;
            throw new Error(((_response$data3 = response.data) === null || _response$data3 === void 0 ? void 0 : _response$data3.message) || 'Error updating customer details');
          }

          // Dispatch an event to notify other components of updated details
          var event = new CustomEvent('customer_details_updated', {
            bubbles: true,
            detail: {
              details: details
            }
          });
          document.dispatchEvent(event);

          // Now store the estimate to the database, passing ONLY the estimate_id
          return fetch(productEstimatorVars.ajax_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              action: 'store_single_estimate',
              nonce: productEstimatorVars.nonce,
              estimate_id: estimateId
            })
          });
        }).then(function (response) {
          return response.json();
        }).then(function (response) {
          if (response.success) {
            resolve(response.data);
          } else {
            var _response$data4;
            logger.error('Error storing estimate:', response);
            throw new Error(((_response$data4 = response.data) === null || _response$data4 === void 0 ? void 0 : _response$data4.message) || 'Error storing estimate');
          }
        })["catch"](function (error) {
          logger.error('Error in updateCustomerDetails:', error);
          reject(error);
        });
      });
    }

    /**
     * Store the estimate in the database
     * @param {string} estimateId - The estimate ID
     * @returns {Promise<object>} Promise that resolves when estimate is stored
     */
  }, {
    key: "storeEstimate",
    value: function storeEstimate(estimateId) {
      var _this9 = this;
      return new Promise(function (resolve, reject) {
        fetch(productEstimatorVars.ajax_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            action: 'store_single_estimate',
            nonce: productEstimatorVars.nonce,
            estimate_id: estimateId
          })
        }).then(function (response) {
          return response.json();
        }).then(function (response) {
          if (response.success) {
            _this9.log('Estimate stored successfully', response.data);
            resolve(response.data);
          } else {
            var _response$data5;
            reject(new Error(((_response$data5 = response.data) === null || _response$data5 === void 0 ? void 0 : _response$data5.message) || 'Error storing estimate'));
          }
        })["catch"](function (error) {
          _this9.log('Error storing estimate:', error);
          reject(error);
        });
      });
    }

    /**
     * Get a secure PDF URL for an estimate
     * @param {number|string} dbId - The database ID
     * @returns {Promise<string>} Promise that resolves to the secure URL
     */
  }, {
    key: "getSecurePdfUrl",
    value: function getSecurePdfUrl(dbId) {
      var _this0 = this;
      return new Promise(function (resolve, reject) {
        fetch(productEstimatorVars.ajax_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            action: 'get_secure_pdf_url',
            nonce: productEstimatorVars.nonce,
            estimate_id: dbId
          })
        }).then(function (response) {
          return response.json();
        }).then(function (response) {
          if (response.success && response.data.url) {
            _this0.log('Received secure PDF URL:', response.data);
            resolve(response.data.url);
          } else {
            var _response$data6;
            reject(new Error(((_response$data6 = response.data) === null || _response$data6 === void 0 ? void 0 : _response$data6.message) || 'Failed to get secure PDF URL'));
          }
        })["catch"](function (error) {
          _this0.log('Error getting secure PDF URL:', error);
          reject(error);
        });
      });
    }

    /**
     * Request a copy of the estimate to be sent via email
     * @param {string} estimateId - The estimate ID
     * @param {HTMLElement} _button - The button element
     * @returns {Promise<object>} Promise that resolves when email is sent
     */
  }, {
    key: "requestCopyEstimate",
    value: function requestCopyEstimate(estimateId, _button) {
      var _this1 = this;
      return this.checkCustomerDetails(estimateId).then(function (customerInfo) {
        if (!customerInfo.email) {
          return Promise.reject(new Error('no_email'));
        }
        return _this1.storeEstimate(estimateId).then(function (data) {
          if (!data || !data.estimate_id) {
            throw new Error('Failed to store estimate');
          }
          return new Promise(function (resolve, reject) {
            fetch(productEstimatorVars.ajax_url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: new URLSearchParams({
                action: 'request_copy_estimate',
                nonce: productEstimatorVars.nonce,
                estimate_id: estimateId
              })
            }).then(function (response) {
              return response.json();
            }).then(function (response) {
              if (response.success) {
                resolve(response.data);
              } else {
                var _response$data7;
                if (((_response$data7 = response.data) === null || _response$data7 === void 0 ? void 0 : _response$data7.code) === 'no_email') {
                  reject(new Error('no_email'));
                } else {
                  var _response$data8;
                  reject(new Error(((_response$data8 = response.data) === null || _response$data8 === void 0 ? void 0 : _response$data8.message) || 'Error requesting estimate copy'));
                }
              }
            })["catch"](function (error) {
              _this1.log('Error requesting estimate copy:', error);
              reject(error);
            });
          });
        });
      });
    }

    /**
     * Set button loading state
     * @param {HTMLElement} button - The button element
     * @param {boolean} isLoading - Whether button is in loading state
     */
  }, {
    key: "setButtonLoading",
    value: function setButtonLoading(button, isLoading) {
      if (!button) return;
      var originalText = button.dataset.originalText || button.textContent;
      if (isLoading) {
        // Store original text if not already stored
        if (!button.dataset.originalText) {
          button.dataset.originalText = button.textContent;
        }
        button.classList.add('loading');
        button.innerHTML = '<span class="loading-dots">Processing...</span>';
        button.disabled = true;
      } else {
        button.classList.remove('loading');
        button.textContent = originalText;
        button.disabled = false;
      }
    }

    /**
     * Show success or error message
     * @param {string} message - Message text
     * @param {string} _type - Message type ('success' or 'error')
     * @param {Function} onConfirm - Callback when confirmed
     */
  }, {
    key: "showMessage",
    value: function showMessage(message) {
      var _type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'success';
      var _onConfirm = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      if (window.productEstimator && window.productEstimator.dialog) {
        window.productEstimator.dialog.show({
          title: 'Estimate Sent',
          message: message,
          type: 'estimate',
          action: 'confirm',
          confirmText: 'OK',
          cancelText: null,
          onConfirm: function onConfirm() {
            if (typeof _onConfirm === 'function') {
              _onConfirm();
            }
          }
        });
      } else {
        alert(message);
        if (typeof _onConfirm === 'function') {
          _onConfirm();
        }
      }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
  }, {
    key: "showError",
    value: function showError(message) {
      // Try to use modal error display if available
      if (window.productEstimator && window.productEstimator.core && typeof window.productEstimator.core.showError === 'function') {
        window.productEstimator.core.showError(message);
      } else {
        // Fall back to alert
        alert(message);
      }
    }

    /**
     * Log debug messages
     * @param {...any} args - Arguments to log
     */
  }, {
    key: "log",
    value: function log() {
      if (this.config.debug) {
        logger.log.apply(logger, arguments);
      }
    }
  }]);
}(); // Export the class
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PrintEstimate);

/***/ }),

/***/ "./src/js/frontend/ProductDetailsToggle.js":
/*!*************************************************!*\
  !*** ./src/js/frontend/ProductDetailsToggle.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ProductDetailsToggle: () => (/* binding */ ProductDetailsToggle),
/* harmony export */   "default": () => (/* binding */ instance)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");


var _window$productEstima, _window$productEstima2, _window$productEstima3, _window$productEstima4, _window$productEstima5, _window$productEstima6;
/**
 * ProductDetailsToggle.js
 *
 * Handles the show/hide functionality for both similar products and product notes sections
 */

var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.createLogger)('ProductDetailsToggle');
var ProductDetailsToggle = /*#__PURE__*/function () {
  /**
   * Initialize the toggle functionality
   * @param {object} config - Configuration options
   */
  function ProductDetailsToggle() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, ProductDetailsToggle);
    // Default configuration
    this.config = Object.assign({
      debug: false,
      selectors: {
        productToggleButton: '.product-details-toggle',
        notesToggleButton: '.product-notes-toggle',
        includesToggleButton: '.product-includes-toggle',
        // Add new selector
        productItem: '.product-item',
        similarProductsContainer: '.similar-products-container',
        productIncludes: '.product-includes',
        similarProducts: '.product-similar-products',
        productNotes: '.product-notes',
        notesContainer: '.notes-container',
        includesContainer: '.includes-container',
        suggestionsContainer: '.suggestions-container'
      },
      i18n: {
        showProducts: 'Similar Products',
        hideProducts: 'Similar Products',
        showNotes: 'Product Notes',
        hideNotes: 'Product Notes',
        showIncludes: 'Product Includes',
        hideIncludes: 'Product Includes',
        showSuggestions: 'Suggested Products',
        hideSuggestions: 'Suggested Products',
        loading: 'Loading...'
      }
    }, config);

    // Track initialized state
    this.initialized = false;

    // Initialize on load
    this.init();
  }

  /**
   * Initialize toggle functionality
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(ProductDetailsToggle, [{
    key: "init",
    value: function init() {
      var _this = this;
      if (this.initialized) {
        logger.log('Already initialized, skipping');
        return;
      }

      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
          return _this.setup();
        });
      } else {
        this.setup();
      }

      // Also initialize when modal content changes
      document.addEventListener('product_estimator_modal_loaded', function () {
        logger.log('Modal content loaded, initializing toggles');
        _this.setup();
      });

      // Set up a mutation observer to watch for new content
      this.setupMutationObserver();

      // Mark as initialized
      this.initialized = true;
      logger.log('ProductDetailsToggle initialized');
    }

    /**
     * Prepare the DOM for suggested products toggle
     */
  }, {
    key: "prepareSuggestionsToggle",
    value: function prepareSuggestionsToggle() {
      var _this2 = this;
      if (!window.productEstimatorVars.featureSwitches.suggested_products_enabled) {
        // <--- THIS IS THE KEY CHECK
        return;
      }
      // Find all accordion content elements
      var accordionContents = document.querySelectorAll(this.config.selectors.accordionContent);
      logger.log("Found ".concat(accordionContents.length, " accordion content elements to process for suggestions toggle"));
      accordionContents.forEach(function (accordionContent) {
        // Skip if already processed for suggestions toggle
        if (accordionContent.classList.contains('suggestions-toggle-processed')) {
          return;
        }

        // Find product suggestions section
        var suggestionsSection = accordionContent.querySelector(_this2.config.selectors.productSuggestions);

        // Check if accordion content has suggestions to toggle
        if (!suggestionsSection) {
          logger.log('No suggestions section found for accordion content, skipping', accordionContent);
          return; // No suggestions to toggle
        }
        logger.log('Found suggestions section, processing', suggestionsSection);

        // Mark the accordion content as having suggestions
        accordionContent.classList.add('has-suggestions');

        // Check if container already exists
        var suggestionsContainer = accordionContent.querySelector(_this2.config.selectors.suggestionsContainer);

        // If no container exists but there is a suggestions section, we need to create one
        if (!suggestionsContainer) {
          logger.log('Creating new suggestions container');
          // Create a container to wrap suggestions
          suggestionsContainer = document.createElement('div');
          suggestionsContainer.className = 'suggestions-container visible'; // Initially visible

          // Move suggestions into the container (if not already in one)
          if (suggestionsSection.parentNode !== suggestionsContainer) {
            // Clone the node to prevent reference issues
            var clonedSection = suggestionsSection.cloneNode(true);
            suggestionsContainer.appendChild(clonedSection);

            // Remove the original from DOM
            suggestionsSection.parentNode.removeChild(suggestionsSection);
          }

          // Add the container to the accordion content
          accordionContent.appendChild(suggestionsContainer);
        }

        // Add toggle button if not already present
        var toggleButton = accordionContent.querySelector(_this2.config.selectors.suggestionsToggleButton);
        if (!toggleButton) {
          logger.log('Adding suggestions toggle button to accordion content');
          toggleButton = document.createElement('button');
          toggleButton.className = 'product-suggestions-toggle expanded'; // Initially expanded
          toggleButton.setAttribute('data-toggle-type', 'suggestions');
          toggleButton.innerHTML = "\n        ".concat(_this2.config.i18n.hideSuggestions, "\n        <span class=\"toggle-icon dashicons dashicons-arrow-up-alt2\"></span>\n      ");

          // Insert button before the suggestions container
          accordionContent.insertBefore(toggleButton, suggestionsContainer);
        }

        // Initially show the suggestions container (expanded by default)
        suggestionsContainer.style.display = 'block';
        suggestionsContainer.classList.add('visible');

        // Mark as processed to avoid duplicating
        accordionContent.classList.add('suggestions-toggle-processed');
        logger.log('Accordion content processed for suggestions toggle');
      });
    }

    /**
     * Set up mutation observer to watch for DOM changes
     */
  }, {
    key: "setupMutationObserver",
    value: function setupMutationObserver() {
      var _this3 = this;
      // Create a mutation observer to detect when new content is added
      var observer = new MutationObserver(function (mutations) {
        var shouldSetup = false;
        mutations.forEach(function (mutation) {
          // Check if new nodes were added
          if (mutation.addedNodes.length) {
            // Look for product items or toggle buttons in added content
            Array.from(mutation.addedNodes).forEach(function (node) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.matches(_this3.config.selectors.productItem) || node.matches(_this3.config.selectors.productToggleButton) || node.matches(_this3.config.selectors.notesToggleButton) || node.querySelector(_this3.config.selectors.productItem) || node.querySelector(_this3.config.selectors.productToggleButton) || node.querySelector(_this3.config.selectors.notesToggleButton)) {
                  shouldSetup = true;
                }
              }
            });
          }
        });

        // If relevant content was added, re-setup toggle functionality
        if (shouldSetup) {
          logger.log('New toggle-related content detected, re-initializing');
          setTimeout(function () {
            return _this3.setup();
          }, 100);
        }
      });

      // Start observing the document with the configured parameters
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      logger.log('Mutation observer set up');
    }

    /**
     * Set up toggle functionality
     */
  }, {
    key: "setup",
    value: function setup() {
      logger.log('Setting up product details toggles');

      // Prepare the DOM structure for all toggle types
      this.prepareProductsToggle();
      this.prepareNotesToggle();
      this.prepareIncludesToggle();
      this.prepareSuggestionsToggle();

      // Then bind events to all toggle buttons
      this.bindEvents();

      // Re-initialize carousels after setup
      this.initializeAllCarousels();
    }
    /**
     * Prepare the DOM for similar products toggle
     */
    /**
     * Prepare the DOM for similar products toggle
     * REMOVED logic that unconditionally showed the container.
     * Visibility is now solely controlled by ModalManager based on data.
     */
  }, {
    key: "prepareProductsToggle",
    value: function prepareProductsToggle() {
      var _this4 = this;
      var productItems = document.querySelectorAll(this.config.selectors.productItem);
      logger.log("Found ".concat(productItems.length, " product items to process for similar products toggle"));
      productItems.forEach(function (productItem) {
        if (productItem.classList.contains('products-toggle-processed')) {
          return;
        }
        var similarProductsSection = productItem.querySelector(_this4.config.selectors.similarProducts);
        if (!similarProductsSection) {
          // Mark as processed even if no section found, to prevent re-checking
          productItem.classList.add('products-toggle-processed');
          return;
        }

        // Only mark as having similar products if the container exists
        // ModalManager will hide toggle/container later if data is empty
        productItem.classList.add('has-similar-products');

        // Container and button variables (for later if needed)
        // let similarProductsContainer = productItem.querySelector(this.config.selectors.similarProductsContainer);
        // let toggleButton = productItem.querySelector(this.config.selectors.productToggleButton);

        // --- START REMOVAL / COMMENT ---
        // // Initially show the similar products container (expanded by default) <<-- REMOVE THIS LOGIC
        // if (similarProductsContainer) {
        //     similarProductsContainer.style.display = 'block';
        //     similarProductsContainer.classList.add('visible');
        // }
        // if (toggleButton) {
        //     toggleButton.classList.add('expanded');
        //     // ... (optional icon update) ...
        // }
        // --- END REMOVAL / COMMENT ---

        // Mark as processed
        productItem.classList.add('products-toggle-processed');
        logger.log('Product item processed for similar products toggle (visibility managed elsewhere).');
      });
    }

    /**
     * Prepare the DOM for notes toggle
     */
    /**
     * Prepare the DOM for notes toggle
     * This updated version only shows the notes section for products that actually have notes
     */
  }, {
    key: "prepareNotesToggle",
    value: function prepareNotesToggle() {
      var _this5 = this;
      // Find all product items
      var productItems = document.querySelectorAll(this.config.selectors.productItem);
      logger.log("Found ".concat(productItems.length, " product items to process for notes toggle"));
      productItems.forEach(function (productItem) {
        // Skip if already processed for notes toggle
        if (productItem.classList.contains('notes-toggle-processed')) {
          return;
        }

        // Find product notes section
        var notesSection = productItem.querySelector(_this5.config.selectors.productNotes);

        // Check if product has notes to toggle
        if (!notesSection) {
          logger.log('No notes section found for product item, skipping', productItem);
          return; // No notes to toggle
        }

        // Check if there's actual note content
        var hasValidNotes = false;

        // Check for note items within the notes section
        var noteItems = notesSection.querySelectorAll('.product-note-item');
        if (noteItems && noteItems.length > 0) {
          hasValidNotes = true;
        }

        // Also check for notes in the product data
        // Look for additional_notes data in the product data attributes
        if (productItem.dataset.additionalNotes) {
          try {
            var notesData = JSON.parse(productItem.dataset.additionalNotes);
            if (Array.isArray(notesData) && notesData.length > 0 && notesData.some(function (note) {
              return note && (note.note_text || note.text);
            })) {
              hasValidNotes = true;
            }
          } catch (e) {
            // Invalid JSON, ignore
          }
        }

        // Check the content of the notes section itself
        if (notesSection.querySelector('.product-notes-items')) {
          var itemsContent = notesSection.querySelector('.product-notes-items').textContent.trim();
          if (itemsContent !== '') {
            hasValidNotes = true;
          }
        }

        // Skip if no valid notes found
        if (!hasValidNotes) {
          logger.log('No valid notes found for product, skipping', productItem);
          productItem.classList.add('notes-toggle-processed'); // Mark as processed anyway

          // Hide any existing notes elements
          var existingToggle = productItem.querySelector(_this5.config.selectors.notesToggleButton);
          var existingContainer = productItem.querySelector(_this5.config.selectors.notesContainer);
          if (existingToggle) existingToggle.style.display = 'none';
          if (existingContainer) existingContainer.style.display = 'none';
          return;
        }
        logger.log('Found notes section with content, processing', notesSection);

        // Mark the product item as having notes
        productItem.classList.add('has-notes');

        // Check if container already exists
        var notesContainer = productItem.querySelector(_this5.config.selectors.notesContainer);

        // If no container exists but there is a notes section, we need to create one
        if (!notesContainer) {
          logger.log('Creating new notes container');
          // Create a container to wrap notes
          notesContainer = document.createElement('div');
          notesContainer.className = 'notes-container visible'; // Add visible class

          // Move notes into the container (if not already in one)
          if (notesSection.parentNode !== notesContainer) {
            // Clone the node to prevent reference issues
            var clonedSection = notesSection.cloneNode(true);
            notesContainer.appendChild(clonedSection);

            // Remove the original from DOM
            notesSection.parentNode.removeChild(notesSection);
          }

          // Add the container to the product item
          productItem.appendChild(notesContainer);
        }

        // Add toggle button if not already present
        var toggleButton = productItem.querySelector(_this5.config.selectors.notesToggleButton);
        if (!toggleButton) {
          logger.log('Adding notes toggle button to product item');
          toggleButton = document.createElement('button');

          // Mark as expanded by default and use the proper class for the arrow
          toggleButton.className = 'product-notes-toggle expanded';
          toggleButton.setAttribute('data-toggle-type', 'notes');

          // Use the hideNotes text (since it's expanded) and arrow-up icon
          toggleButton.innerHTML = "\n      ".concat(_this5.config.i18n.hideNotes, "\n      <span class=\"toggle-icon dashicons dashicons-arrow-up-alt2\"></span>\n    ");

          // Insert button before the notes container
          productItem.insertBefore(toggleButton, notesContainer);
        } else {
          // Make sure existing button has the correct state
          toggleButton.classList.add('expanded');
          var iconElement = toggleButton.querySelector('.toggle-icon');
          if (iconElement) {
            iconElement.classList.remove('dashicons-arrow-down-alt2');
            iconElement.classList.add('dashicons-arrow-up-alt2');
          }
        }

        // Initially show the notes container (expanded by default)
        notesContainer.style.display = 'block';
        notesContainer.classList.add('visible');

        // Mark as processed to avoid duplicating
        productItem.classList.add('notes-toggle-processed');
        logger.log('Product item processed for notes toggle');
      });
    }

    /**
     * Bind click events to all toggle buttons
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this6 = this;
      // Bind product toggle buttons
      var productToggleButtons = document.querySelectorAll(this.config.selectors.productToggleButton);
      logger.log("Found ".concat(productToggleButtons.length, " similar products toggle buttons to bind"));
      productToggleButtons.forEach(function (button) {
        // Skip if already bound
        if (button._toggleBound) {
          return;
        }

        // Store reference to handler for potential removal
        button._toggleHandler = function (e) {
          e.preventDefault();
          e.stopPropagation();
          _this6.toggleSimilarProducts(button);
        };

        // Add event listener
        button.addEventListener('click', button._toggleHandler);

        // Mark as bound to avoid duplicate handlers
        button._toggleBound = true;
      });

      // Bind notes toggle buttons
      var notesToggleButtons = document.querySelectorAll(this.config.selectors.notesToggleButton);
      logger.log("Found ".concat(notesToggleButtons.length, " notes toggle buttons to bind"));
      notesToggleButtons.forEach(function (button) {
        // Skip if already bound
        if (button._toggleBound) {
          return;
        }

        // Store reference to handler for potential removal
        button._toggleHandler = function (e) {
          e.preventDefault();
          e.stopPropagation();
          _this6.toggleNotes(button);
        };

        // Add event listener
        button.addEventListener('click', button._toggleHandler);

        // Mark as bound to avoid duplicate handlers
        button._toggleBound = true;
      });

      // Bind includes toggle buttons
      var includesToggleButtons = document.querySelectorAll(this.config.selectors.includesToggleButton);
      logger.log("Found ".concat(includesToggleButtons.length, " includes toggle buttons to bind"));
      includesToggleButtons.forEach(function (button) {
        // Skip if already bound
        if (button._toggleBound) {
          return;
        }

        // Store reference to handler for potential removal
        button._toggleHandler = function (e) {
          e.preventDefault();
          e.stopPropagation();
          _this6.toggleIncludes(button);
        };

        // Add event listener
        button.addEventListener('click', button._toggleHandler);

        // Mark as bound to avoid duplicate handlers
        button._toggleBound = true;
      });
      if (window.productEstimatorVars.featureSwitches.suggested_products_enabled) {
        // <--- THIS IS THE KEY CHECK

        // Bind suggestions toggle buttons
        var suggestionsToggleButtons = document.querySelectorAll(this.config.selectors.suggestionsToggleButton);
        logger.log("Found ".concat(suggestionsToggleButtons.length, " suggestions toggle buttons to bind"));
        suggestionsToggleButtons.forEach(function (button) {
          // Skip if already bound
          if (button._toggleBound) {
            return;
          }

          // Store reference to handler for potential removal
          button._toggleHandler = function (e) {
            e.preventDefault();
            e.stopPropagation();
            _this6.toggleSuggestions(button);
          };

          // Add event listener
          button.addEventListener('click', button._toggleHandler);

          // Mark as bound to avoid duplicate handlers
          button._toggleBound = true;
        });
      }
      logger.log('All toggle events bound');
    }

    // Add a new method to toggle suggestions visibility
    /**
     * Toggle the visibility of suggested products
     * @param {HTMLElement} toggleButton - The button that was clicked
     */
  }, {
    key: "toggleSuggestions",
    value: function toggleSuggestions(toggleButton) {
      // Find parent accordion content
      var accordionContent = toggleButton.closest(this.config.selectors.accordionContent);
      if (!accordionContent) {
        logger.log('Accordion content not found for toggle button');
        return;
      }

      // Find suggestions container
      var suggestionsContainer = accordionContent.querySelector(this.config.selectors.suggestionsContainer);
      if (!suggestionsContainer) {
        logger.log('Suggestions container not found');
        return;
      }

      // Toggle expanded state
      var isExpanded = toggleButton.classList.contains('expanded');
      logger.log("Suggestions toggle clicked, current expanded state: ".concat(isExpanded));
      if (isExpanded) {
        // Hide suggestions
        suggestionsContainer.classList.remove('visible');
        suggestionsContainer.style.display = 'none';
        toggleButton.classList.remove('expanded');

        // Update icon
        var iconElement = toggleButton.querySelector('.toggle-icon');
        if (iconElement) {
          iconElement.classList.remove('dashicons-arrow-up-alt2');
          iconElement.classList.add('dashicons-arrow-down-alt2');
        }

        // Update text (safely)
        toggleButton.innerHTML = toggleButton.innerHTML.replace(this.config.i18n.hideSuggestions, this.config.i18n.showSuggestions);
        logger.log('Suggestions hidden');
      } else {
        // Show suggestions
        suggestionsContainer.classList.add('visible');
        suggestionsContainer.style.display = 'block';
        toggleButton.classList.add('expanded');

        // Update icon
        var _iconElement = toggleButton.querySelector('.toggle-icon');
        if (_iconElement) {
          _iconElement.classList.remove('dashicons-arrow-down-alt2');
          _iconElement.classList.add('dashicons-arrow-up-alt2');
        }

        // Update text (safely)
        toggleButton.innerHTML = toggleButton.innerHTML.replace(this.config.i18n.showSuggestions, this.config.i18n.hideSuggestions);

        // Initialize carousels if they exist
        this.initializeCarousels(suggestionsContainer);
        logger.log('Suggestions shown');
      }
    }

    /**
     * Toggle the visibility of similar products
     * @param {HTMLElement} toggleButton - The button that was clicked
     */
  }, {
    key: "toggleSimilarProducts",
    value: function toggleSimilarProducts(toggleButton) {
      // Find parent product item
      var productItem = toggleButton.closest(this.config.selectors.productItem);
      if (!productItem) {
        logger.log('Product item not found for toggle button');
        return;
      }

      // Find similar products container
      var similarProductsContainer = productItem.querySelector(this.config.selectors.similarProductsContainer);
      if (!similarProductsContainer) {
        logger.log('Similar products container not found');
        return;
      }

      // Toggle expanded state
      var isExpanded = toggleButton.classList.contains('expanded');
      logger.log("Similar products toggle clicked, current expanded state: ".concat(isExpanded));

      // Get the icon element
      var iconElement = toggleButton.querySelector('.toggle-icon');
      if (isExpanded) {
        // Hide similar products
        similarProductsContainer.classList.remove('visible');
        similarProductsContainer.style.display = 'none';
        toggleButton.classList.remove('expanded');

        // Update icon - directly manipulate the classes instead of relying on HTML replacement
        if (iconElement) {
          iconElement.classList.remove('dashicons-arrow-up-alt2');
          iconElement.classList.add('dashicons-arrow-down-alt2');
        }

        // Keep the text the same per design requirements
        logger.log('Similar products hidden');
      } else {
        // Show similar products
        similarProductsContainer.classList.add('visible');
        similarProductsContainer.style.display = 'block';
        toggleButton.classList.add('expanded');

        // Update icon - directly manipulate the classes
        if (iconElement) {
          iconElement.classList.remove('dashicons-arrow-down-alt2');
          iconElement.classList.add('dashicons-arrow-up-alt2');
        }

        // Keep the text the same per design requirements
        logger.log('Similar products shown');

        // Initialize carousels if they exist
        this.initializeCarousels(similarProductsContainer);
      }
    }

    /**
     * Toggle the visibility of product notes
     * @param {HTMLElement} toggleButton - The button that was clicked
     */
  }, {
    key: "toggleNotes",
    value: function toggleNotes(toggleButton) {
      // Find parent product item
      var productItem = toggleButton.closest(this.config.selectors.productItem);
      if (!productItem) {
        logger.log('Product item not found for notes toggle button');
        return;
      }

      // Find notes container
      var notesContainer = productItem.querySelector(this.config.selectors.notesContainer);
      if (!notesContainer) {
        logger.log('Notes container not found');
        return;
      }

      // Toggle expanded state
      var isExpanded = toggleButton.classList.contains('expanded');
      logger.log("Notes toggle clicked, current expanded state: ".concat(isExpanded));

      // Get the icon element
      var iconElement = toggleButton.querySelector('.toggle-icon');
      if (isExpanded) {
        // Hide notes
        notesContainer.classList.remove('visible');
        notesContainer.style.display = 'none';
        toggleButton.classList.remove('expanded');

        // Update icon - directly manipulate the classes instead of relying on HTML replacement
        if (iconElement) {
          iconElement.classList.remove('dashicons-arrow-up-alt2');
          iconElement.classList.add('dashicons-arrow-down-alt2');
        }

        // Keep the text the same per design requirements
        logger.log('Notes hidden');
      } else {
        // Show notes
        notesContainer.classList.add('visible');
        notesContainer.style.display = 'block';
        toggleButton.classList.add('expanded');

        // Update icon - directly manipulate the classes
        if (iconElement) {
          iconElement.classList.remove('dashicons-arrow-down-alt2');
          iconElement.classList.add('dashicons-arrow-up-alt2');
        }

        // Keep the text the same per design requirements
        logger.log('Notes shown');
      }
    }

    /**
     * Initialize carousels within the container
     */
  }, {
    key: "initializeCarousels",
    value: function initializeCarousels() {
      // Check if SuggestionsCarousel initialization function exists
      if (typeof window.initSuggestionsCarousels === 'function') {
        logger.log('Initializing carousels in similar products container');
        window.initSuggestionsCarousels();
      } else if (typeof initSuggestionsCarousels === 'function') {
        logger.log('Using local initSuggestionsCarousels function');
        initSuggestionsCarousels();
      } else {
        logger.log('Carousel initialization function not found', window.initSuggestionsCarousels);
      }
    }

    /**
     * Initialize all carousels on the page
     */
  }, {
    key: "initializeAllCarousels",
    value: function initializeAllCarousels() {
      if (typeof window.initSuggestionsCarousels === 'function') {
        logger.log('Initializing all carousels');
        window.initSuggestionsCarousels();
      } else if (typeof initSuggestionsCarousels === 'function') {
        initSuggestionsCarousels();
      }
    }

    /**
     * Prepare the DOM for includes toggle
     */
  }, {
    key: "prepareIncludesToggle",
    value: function prepareIncludesToggle() {
      var _this7 = this;
      // Find all product items
      var productItems = document.querySelectorAll(this.config.selectors.productItem);
      logger.log("Found ".concat(productItems.length, " product items to process for includes toggle"));
      productItems.forEach(function (productItem) {
        // Skip if already processed for includes toggle
        if (productItem.classList.contains('includes-toggle-processed')) {
          return;
        }

        // Find product includes section
        var includesSection = productItem.querySelector(_this7.config.selectors.productIncludes);

        // Check if product has includes to toggle
        if (!includesSection) {
          logger.log('No includes section found for product item, skipping', productItem);
          return; // No includes to toggle
        }
        logger.log('Found includes section, processing', includesSection);

        // Mark the product item as having includes
        productItem.classList.add('has-includes');

        // Check if container already exists
        var includesContainer = productItem.querySelector('.includes-container');

        // If no container exists but there is an includes section, we need to create one
        if (!includesContainer) {
          logger.log('Creating new includes container');
          // Create a container to wrap includes
          includesContainer = document.createElement('div');
          includesContainer.className = 'includes-container visible'; // Add visible class

          // Move includes into the container (if not already in one)
          if (includesSection.parentNode !== includesContainer) {
            // Clone the node to prevent reference issues
            var clonedSection = includesSection.cloneNode(true);
            includesContainer.appendChild(clonedSection);

            // Remove the original from DOM
            includesSection.parentNode.removeChild(includesSection);
          }

          // Add the container to the product item
          productItem.appendChild(includesContainer);
        }

        // Add toggle button if not already present
        var toggleButton = productItem.querySelector('.product-includes-toggle');
        if (!toggleButton) {
          logger.log('Adding includes toggle button to product item');
          toggleButton = document.createElement('button');

          // Mark as expanded by default and use the proper class for the arrow
          toggleButton.className = 'product-includes-toggle expanded';
          toggleButton.setAttribute('data-toggle-type', 'includes');

          // Use the hideIncludes text (since it's expanded) and arrow-up icon
          toggleButton.innerHTML = "\n        ".concat(_this7.config.i18n.hideIncludes || 'Product Includes', "\n        <span class=\"toggle-icon dashicons dashicons-arrow-up-alt2\"></span>\n      ");

          // Insert button before the includes container
          productItem.insertBefore(toggleButton, includesContainer);
        } else {
          // Make sure existing button has the correct state
          toggleButton.classList.add('expanded');
          var iconElement = toggleButton.querySelector('.toggle-icon');
          if (iconElement) {
            iconElement.classList.remove('dashicons-arrow-down-alt2');
            iconElement.classList.add('dashicons-arrow-up-alt2');
          }
        }

        // Initially show the includes container (expanded by default)
        includesContainer.style.display = 'block';
        includesContainer.classList.add('visible');

        // Mark as processed to avoid duplicating
        productItem.classList.add('includes-toggle-processed');
        logger.log('Product item processed for includes toggle');
      });
    }

    /**
     * Toggle the visibility of product includes
     * @param {HTMLElement} toggleButton - The button that was clicked
     */
  }, {
    key: "toggleIncludes",
    value: function toggleIncludes(toggleButton) {
      // Find parent product item
      var productItem = toggleButton.closest(this.config.selectors.productItem);
      if (!productItem) {
        logger.log('Product item not found for includes toggle button');
        return;
      }

      // Find includes container
      var includesContainer = productItem.querySelector('.includes-container');
      if (!includesContainer) {
        logger.log('Includes container not found');
        return;
      }

      // Toggle expanded state
      var isExpanded = toggleButton.classList.contains('expanded');
      logger.log("Includes toggle clicked, current expanded state: ".concat(isExpanded));

      // Get the icon element
      var iconElement = toggleButton.querySelector('.toggle-icon');
      if (isExpanded) {
        // Hide includes
        includesContainer.classList.remove('visible');
        includesContainer.style.display = 'none';
        toggleButton.classList.remove('expanded');

        // Update icon - directly manipulate the classes instead of relying on HTML replacement
        if (iconElement) {
          iconElement.classList.remove('dashicons-arrow-up-alt2');
          iconElement.classList.add('dashicons-arrow-down-alt2');
        }

        // Keep the text the same per design requirements
        logger.log('Includes hidden');
      } else {
        // Show includes
        includesContainer.classList.add('visible');
        includesContainer.style.display = 'block';
        toggleButton.classList.add('expanded');

        // Update icon - directly manipulate the classes
        if (iconElement) {
          iconElement.classList.remove('dashicons-arrow-down-alt2');
          iconElement.classList.add('dashicons-arrow-up-alt2');
        }

        // Keep the text the same per design requirements
        logger.log('Includes shown');
      }
    }
  }]);
}(); // Create singleton instance
var instance = new ProductDetailsToggle({
  debug: ((_window$productEstima = window.productEstimatorVars) === null || _window$productEstima === void 0 ? void 0 : _window$productEstima.debug) || false,
  i18n: {
    showProducts: ((_window$productEstima2 = window.productEstimatorVars) === null || _window$productEstima2 === void 0 || (_window$productEstima2 = _window$productEstima2.i18n) === null || _window$productEstima2 === void 0 ? void 0 : _window$productEstima2.showSimilarProducts) || 'Similar Products',
    hideProducts: ((_window$productEstima3 = window.productEstimatorVars) === null || _window$productEstima3 === void 0 || (_window$productEstima3 = _window$productEstima3.i18n) === null || _window$productEstima3 === void 0 ? void 0 : _window$productEstima3.hideSimilarProducts) || 'Similar Products',
    showNotes: ((_window$productEstima4 = window.productEstimatorVars) === null || _window$productEstima4 === void 0 || (_window$productEstima4 = _window$productEstima4.i18n) === null || _window$productEstima4 === void 0 ? void 0 : _window$productEstima4.showNotes) || 'Product Notes',
    hideNotes: ((_window$productEstima5 = window.productEstimatorVars) === null || _window$productEstima5 === void 0 || (_window$productEstima5 = _window$productEstima5.i18n) === null || _window$productEstima5 === void 0 ? void 0 : _window$productEstima5.hideNotes) || 'Product Notes',
    loading: ((_window$productEstima6 = window.productEstimatorVars) === null || _window$productEstima6 === void 0 || (_window$productEstima6 = _window$productEstima6.i18n) === null || _window$productEstima6 === void 0 ? void 0 : _window$productEstima6.loading) || 'Loading...'
  }
});

// Export both the class and the instance


/***/ }),

/***/ "./src/js/frontend/ProductSelectionDialog.js":
/*!***************************************************!*\
  !*** ./src/js/frontend/ProductSelectionDialog.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");



/**
 * ProductSelectionDialog Component
 * 
 * Handles product selection with variations
 * Displays variation swatches and options
 * Manages user selection before adding to estimate
 */
var ProductSelectionDialog = /*#__PURE__*/function () {
  function ProductSelectionDialog(modalManager, templateEngine) {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__["default"])(this, ProductSelectionDialog);
    this.modalManager = modalManager;
    this.templateEngine = templateEngine;
    this.dialogElement = null;
    this.backdropElement = null;
    this.currentProduct = null;
    this.selectedVariations = {};
    this.availableVariations = null;
    this.selectedVariationId = null;
    this.onSelectCallback = null;
    this.onCancelCallback = null;
  }

  /**
   * Show the product selection dialog
   * @param {object} options - Dialog options
   * @param {object} options.product - Product data
   * @param {Array} options.variations - Available variations
   * @param {object} options.attributes - Product attributes
   * @param {string} options.action - The action being performed ('add' or 'replace')
   * @param {Function} options.onSelect - Callback when variation is selected
   * @param {Function} options.onCancel - Callback when dialog is cancelled
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__["default"])(ProductSelectionDialog, [{
    key: "show",
    value: function show(options) {
      this.currentProduct = options.product;
      this.availableVariations = options.variations || [];
      this.attributes = options.attributes || {};
      this.action = options.action || 'add';
      this.onSelectCallback = options.onSelect;
      this.onCancelCallback = options.onCancel;
      this.selectedVariations = {};
      this.selectedVariationId = null;
      this.create();

      // Check if dialog creation succeeded
      if (!this.dialogElement || !this.backdropElement) {
        throw new Error('Failed to create product selection dialog');
      }

      // If we're transitioning from loading state, hide it first
      if (this.dialogElement && this.dialogElement.classList.contains('loading')) {
        this.hideLoading();
      }
      this.populateDialog();
      this.showDialog();
    }
  }, {
    key: "create",
    value: function create() {
      if (this.dialogElement) {
        return;
      }

      // Get template element
      var template = this.templateEngine.getTemplate('product-selection-template');
      if (!template) {
        console.error('ProductSelectionDialog: Product selection template not found');
        throw new Error('Product selection template not found');
      }

      // Create dialog from template using the create method
      var dialogFragment = this.templateEngine.create('product-selection-template', {});

      // Create a wrapper div to hold the fragment content
      var wrapper = document.createElement('div');
      wrapper.appendChild(dialogFragment);

      // Extract the elements
      this.backdropElement = wrapper.querySelector('.pe-dialog-backdrop');
      this.dialogElement = wrapper.querySelector('.pe-product-selection-dialog');
      if (!this.backdropElement || !this.dialogElement) {
        console.error('ProductSelectionDialog: Failed to create dialog elements');
        throw new Error('Failed to create dialog elements');
      }

      // Move the backdrop element directly to body
      document.body.appendChild(this.backdropElement);

      // Bind events
      this.bindEvents();
    }
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this = this;
      if (!this.dialogElement) return;

      // Close button
      var closeButton = this.dialogElement.querySelector('.pe-dialog-close');
      if (closeButton) {
        closeButton.addEventListener('click', function () {
          return _this.cancel();
        });
      }

      // Cancel button
      var cancelButton = this.dialogElement.querySelector('.pe-dialog-cancel');
      if (cancelButton) {
        cancelButton.addEventListener('click', function () {
          return _this.cancel();
        });
      }

      // Confirm button
      var confirmButton = this.dialogElement.querySelector('.pe-dialog-confirm');
      if (confirmButton) {
        confirmButton.addEventListener('click', function () {
          return _this.confirm();
        });
      }

      // Backdrop click
      this.backdropElement.addEventListener('click', function (e) {
        if (e.target === _this.backdropElement) {
          _this.cancel();
        }
      });
    }
  }, {
    key: "populateDialog",
    value: function populateDialog() {
      var _this2 = this;
      if (!this.dialogElement || !this.currentProduct) return;

      // Set product name
      var productNameEl = this.dialogElement.querySelector('.pe-dialog-product-name');
      if (productNameEl) {
        productNameEl.textContent = this.currentProduct.name || 'Select Product Options';
      }

      // Update confirm button text based on action
      var confirmButton = this.dialogElement.querySelector('.pe-dialog-confirm');
      if (confirmButton) {
        confirmButton.textContent = this.action === 'replace' ? 'Replace Product' : 'Add to Estimate';
      }

      // Clear and populate variation options
      var variationContainer = this.dialogElement.querySelector('.pe-variation-options');
      if (!variationContainer) return;
      variationContainer.innerHTML = '';

      // If no variations, show simple confirmation
      if (!this.availableVariations || this.availableVariations.length === 0) {
        var message = this.dialogElement.querySelector('.pe-dialog-message');
        if (message) {
          message.textContent = 'Add this product to your estimate?';
        }
        this.updateConfirmButton(true);
        return;
      }

      // Create variation option groups
      Object.entries(this.attributes).forEach(function (_ref) {
        var _ref2 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_ref, 2),
          attributeName = _ref2[0],
          attributeData = _ref2[1];
        // Create variation group from template
        var groupFragment = _this2.templateEngine.create('variation-option-template', {
          attributeName: attributeName,
          attributeLabel: attributeData.label || attributeName
        });

        // Convert fragment to element
        var tempDiv = document.createElement('div');
        tempDiv.appendChild(groupFragment);
        var variationGroup = tempDiv.firstElementChild;
        if (!variationGroup) return;

        // Add swatches for each option
        var swatchContainer = variationGroup.querySelector('.pe-variation-swatches');
        if (swatchContainer && attributeData.options) {
          attributeData.options.forEach(function (option) {
            var swatch = _this2.createSwatch(attributeName, option, attributeData.type);
            if (swatch) {
              swatchContainer.appendChild(swatch);
            }
          });
        }
        variationContainer.appendChild(variationGroup);
      });
    }
  }, {
    key: "createSwatch",
    value: function createSwatch(attributeName, option) {
      var _this3 = this;
      var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'label';
      // Create swatch from template
      var swatchFragment = this.templateEngine.create('variation-swatch-template', {
        attributeName: attributeName,
        value: option.value,
        type: type,
        label: option.label || option.value,
        selected: '' // Empty for unselected
      });

      // Convert fragment to element
      var tempDiv = document.createElement('div');
      tempDiv.appendChild(swatchFragment);
      var swatchElement = tempDiv.firstElementChild;
      if (!swatchElement) return null;

      // Add the content based on type
      var contentEl = swatchElement.querySelector('.pe-swatch-content');
      if (contentEl) {
        switch (type) {
          case 'color':
            {
              var colorSpan = document.createElement('span');
              colorSpan.className = 'pe-swatch-color';
              colorSpan.style.backgroundColor = option.color || option.value;
              contentEl.appendChild(colorSpan);
              break;
            }
          case 'image':
            {
              var img = document.createElement('img');
              img.className = 'pe-swatch-image';
              img.src = option.image || option.value;
              img.alt = option.label || option.value;
              contentEl.appendChild(img);
              break;
            }
          default:
            contentEl.textContent = option.label || option.value;
        }
      }

      // Add click handler
      if (!option.disabled) {
        swatchElement.addEventListener('click', function () {
          return _this3.selectVariation(attributeName, option.value);
        });
      } else {
        swatchElement.disabled = true;
      }
      return swatchElement;
    }
  }, {
    key: "selectVariation",
    value: function selectVariation(attributeName, value) {
      // Update selected variations
      this.selectedVariations[attributeName] = value;

      // Update UI to show selection
      var swatches = this.dialogElement.querySelectorAll(".pe-variation-swatch[data-attribute-name=\"".concat(attributeName, "\"]"));
      swatches.forEach(function (swatch) {
        if (swatch.dataset.value === value) {
          swatch.classList.add('selected');
        } else {
          swatch.classList.remove('selected');
        }
      });

      // Find matching variation
      this.findMatchingVariation();

      // Update confirm button state
      this.updateConfirmButton();

      // Update selected summary
      this.updateSelectedSummary();
    }
  }, {
    key: "findMatchingVariation",
    value: function findMatchingVariation() {
      var _this4 = this;
      if (!this.availableVariations || this.availableVariations.length === 0) {
        return;
      }

      // Find variation that matches all selected attributes
      var matchingVariation = this.availableVariations.find(function (variation) {
        return Object.entries(_this4.selectedVariations).every(function (_ref3) {
          var _ref4 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_ref3, 2),
            attr = _ref4[0],
            value = _ref4[1];
          // Check for both attribute formats (with and without 'attribute_' prefix)
          var attrKey = "attribute_".concat(attr);
          return variation.attributes[attr] === value || variation.attributes[attrKey] === value;
        });
      });
      if (matchingVariation) {
        this.selectedVariationId = matchingVariation.variation_id;
      } else {
        this.selectedVariationId = null;
      }
    }
  }, {
    key: "updateConfirmButton",
    value: function updateConfirmButton() {
      var _this5 = this;
      var enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var confirmButton = this.dialogElement.querySelector('.pe-dialog-confirm');
      if (!confirmButton) return;
      if (enabled !== null) {
        confirmButton.disabled = !enabled;
        return;
      }

      // Check if all required attributes are selected
      var allAttributesSelected = Object.keys(this.attributes).every(function (attr) {
        return _this5.selectedVariations[attr] !== undefined;
      });
      confirmButton.disabled = !allAttributesSelected || !this.selectedVariationId;
    }
  }, {
    key: "updateSelectedSummary",
    value: function updateSelectedSummary() {
      // Removed - we don't need to show the selected attributes summary
    }
  }, {
    key: "showDialog",
    value: function showDialog() {
      if (!this.backdropElement || !this.dialogElement) return;
      this.backdropElement.style.display = 'flex';
      this.backdropElement.classList.add('visible');
      this.dialogElement.classList.add('visible');
    }
  }, {
    key: "hideDialog",
    value: function hideDialog() {
      var _this6 = this;
      if (!this.backdropElement || !this.dialogElement) return;
      this.backdropElement.classList.remove('visible');
      this.dialogElement.classList.remove('visible');
      setTimeout(function () {
        _this6.backdropElement.style.display = 'none';
      }, 300);
    }
  }, {
    key: "confirm",
    value: function confirm() {
      var selectedData = {
        productId: this.currentProduct.id,
        variationId: this.selectedVariationId,
        selectedAttributes: this.selectedVariations,
        product: this.currentProduct
      };
      this.hideDialog();
      if (this.onSelectCallback) {
        this.onSelectCallback(selectedData);
      }
    }
  }, {
    key: "cancel",
    value: function cancel() {
      this.hideDialog();
      if (this.onCancelCallback) {
        this.onCancelCallback();
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this.backdropElement) {
        this.backdropElement.remove();
        this.backdropElement = null;
      }
      this.dialogElement = null;
      this.currentProduct = null;
      this.selectedVariations = {};
      this.selectedVariationId = null;
    }

    /**
     * Show loading state
     */
  }, {
    key: "showLoading",
    value: function showLoading() {
      // Create minimal structure if not already created
      if (!this.backdropElement || !this.dialogElement) {
        this.create();
      }

      // Show backdrop immediately
      if (this.backdropElement) {
        this.backdropElement.style.display = 'flex';
        this.backdropElement.classList.add('visible');
      }

      // Show dialog with loading state
      if (this.dialogElement) {
        this.dialogElement.classList.add('visible', 'loading');

        // Update header title
        var titleEl = this.dialogElement.querySelector('.pe-dialog-title');
        if (titleEl) {
          titleEl.textContent = 'Loading...';
        }

        // Update content to show loading message
        var body = this.dialogElement.querySelector('.pe-dialog-body');
        if (body) {
          body.innerHTML = '<div class="pe-loading-message">Loading product variations...</div>';
        }

        // Hide buttons during loading
        var confirmBtn = this.dialogElement.querySelector('.pe-dialog-confirm');
        var cancelBtn = this.dialogElement.querySelector('.pe-dialog-cancel');
        if (confirmBtn) {
          confirmBtn.style.display = 'none';
        }
        if (cancelBtn) {
          cancelBtn.style.display = 'none';
        }
      }
    }

    /**
     * Hide loading state
     */
  }, {
    key: "hideLoading",
    value: function hideLoading() {
      if (this.dialogElement) {
        this.dialogElement.classList.remove('loading');

        // Restore original title
        var titleEl = this.dialogElement.querySelector('.pe-dialog-title');
        if (titleEl) {
          titleEl.textContent = 'Select Product Options';
        }

        // Restore original dialog body structure
        var body = this.dialogElement.querySelector('.pe-dialog-body');
        if (body) {
          // Recreate the original structure needed for populateDialog
          body.innerHTML = "\n                    <div class=\"pe-dialog-product-name\"></div>\n                    <div class=\"pe-dialog-variations\">\n                        <p class=\"pe-dialog-message\">Please select your options below:</p>\n                        <div class=\"pe-variation-options\">\n                            <!-- Variation options will be dynamically inserted here -->\n                        </div>\n                    </div>\n                ";
        }

        // Re-show buttons
        var confirmBtn = this.dialogElement.querySelector('.pe-dialog-confirm');
        var cancelBtn = this.dialogElement.querySelector('.pe-dialog-cancel');
        if (confirmBtn) {
          confirmBtn.style.display = '';
        }
        if (cancelBtn) {
          cancelBtn.style.display = '';
        }
      }
    }
  }]);
}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProductSelectionDialog);

/***/ }),

/***/ "./src/js/frontend/SuggestionsCarousel.js":
/*!************************************************!*\
  !*** ./src/js/frontend/SuggestionsCarousel.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SuggestionsCarousel: () => (/* binding */ SuggestionsCarousel),
/* harmony export */   initCarouselOnAccordionOpen: () => (/* binding */ initCarouselOnAccordionOpen),
/* harmony export */   initSuggestionsCarousels: () => (/* binding */ initSuggestionsCarousels)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");


/**
 * Enhanced Carousel for Suggested and Similar Products with strict width containment
 * - Properly handles multiple carousels on the same page
 * - Each carousel operates independently
 * - Strictly maintains container width constraints
 */


var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.createLogger)('SuggestionsCarousel');
var SuggestionsCarousel = /*#__PURE__*/function () {
  function SuggestionsCarousel(container) {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, SuggestionsCarousel);
    // Generate a unique ID for this carousel instance
    this.id = 'carousel_' + Math.random().toString(36).substr(2, 9);

    // Store references
    this.container = container;
    this.itemsContainer = container.querySelector('.suggestions-container');
    this.items = container.querySelectorAll('.suggestion-item');
    this.prevBtn = container.querySelector('.suggestions-nav.prev');
    this.nextBtn = container.querySelector('.suggestions-nav.next');

    // Determine if this is a similar products carousel
    this.isSimilarProducts = container.classList.contains('similar-products-carousel');

    // logger.log(`[${this.id}] Initializing carousel with ${this.items.length} items, isSimilarProducts: ${this.isSimilarProducts}`);

    // Only proceed if we have all necessary elements
    if (!this.itemsContainer || !this.items.length) {
      logger.warn("[".concat(this.id, "] Carousel missing items container or has no items"));
      return;
    }

    // Store instance reference on the container
    container.carouselInstance = this;

    // Configuration based on carousel type
    if (this.isSimilarProducts) {
      // Similar products - fixed small size
      this.itemWidth = 130;
      this.itemGap = 5;
    } else {
      // Regular suggestions - larger items
      this.itemWidth = 200;
      this.itemGap = 15;
    }
    this.visibleItems = this.calculateVisibleItems();
    this.currentPosition = 0;
    this.maxPosition = Math.max(0, this.items.length - this.visibleItems);

    // Set up container and items
    this.setContainerSize();

    // Initialize
    this.bindEvents();
    this.updateButtons();
  }
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(SuggestionsCarousel, [{
    key: "getContainerWidth",
    value: function getContainerWidth() {
      if (this.isSimilarProducts) {
        // For similar products, find the product-item width
        var parentItem = this.container.closest('.product-item');
        if (parentItem) {
          var parentWidth = parentItem.offsetWidth;
          // logger.log(`[${this.id}] Found product-item parent: ${parentWidth}px`);
          return parentWidth - 10; // Subtract a small buffer
        }
      }

      // Default - use container's width
      var containerWidth = this.container.offsetWidth;
      // logger.log(`[${this.id}] Using container width: ${containerWidth}px`);
      return containerWidth;
    }
  }, {
    key: "setContainerSize",
    value: function setContainerSize() {
      // Force consistent sizing for similar products
      if (this.isSimilarProducts) {
        // Set max-width explicitly for similar products
        var parentEl = this.container.closest('.product-item');
        if (parentEl) {
          var parentWidth = parentEl.offsetWidth;
          // logger.log(`[${this.id}] Similar products parent width: ${parentWidth}px`);
          this.container.style.maxWidth = "".concat(parentWidth - 10, "px");
        }

        // Ensure all items have consistent width
        Array.from(this.items).forEach(function (item) {
          // item.style.width = `${this.itemWidth}px`;
          item.style.flexShrink = '0';
          item.style.flexGrow = '0';
        });

        // Set container width and gap
        this.itemsContainer.style.gap = "".concat(this.itemGap, "px");
      }
    }
  }, {
    key: "calculateVisibleItems",
    value: function calculateVisibleItems() {
      // Calculate available width
      var containerWidth = this.getContainerWidth();
      var availableWidth = containerWidth - 50; // Allow space for navigation

      // Fixed item widths for similar products carousel
      var effectiveItemWidth = this.isSimilarProducts ? 130 : this.itemWidth;
      var effectiveGap = this.isSimilarProducts ? 5 : this.itemGap;

      // Calculate how many items fit
      var totalItemWidth = effectiveItemWidth + effectiveGap;
      var visibleItems = Math.max(1, Math.floor(availableWidth / totalItemWidth));

      // logger.log(`[${this.id}] Container width: ${containerWidth}px, available: ${availableWidth}px, visible items: ${visibleItems}`);

      return visibleItems;
    }
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this = this;
      // Create handler functions with proper 'this' binding
      this.handlePrevClick = this.handlePrevClick.bind(this);
      this.handleNextClick = this.handleNextClick.bind(this);
      this.handleResize = this.handleResize.bind(this);

      // Remove any existing event listeners first
      if (this.prevBtn) {
        this.prevBtn.removeEventListener('click', this.handlePrevClick);
        this.prevBtn.addEventListener('click', this.handlePrevClick);
      }
      if (this.nextBtn) {
        this.nextBtn.removeEventListener('click', this.handleNextClick);
        this.nextBtn.addEventListener('click', this.handleNextClick);
      }

      // Handle window resize - debounce to improve performance
      this.resizeTimeout = null;
      window.addEventListener('resize', function () {
        clearTimeout(_this.resizeTimeout);
        _this.resizeTimeout = setTimeout(_this.handleResize, 150);
      });

      // logger.log(`[${this.id}] Events bound`);
    }
  }, {
    key: "handlePrevClick",
    value: function handlePrevClick(e) {
      e.preventDefault();
      e.stopPropagation();

      // logger.log(`[${this.id}] Prev button clicked, current position: ${this.currentPosition}`);

      if (this.currentPosition > 0) {
        this.currentPosition--;
        this.updatePosition();
        this.updateButtons();
      }
    }
  }, {
    key: "handleNextClick",
    value: function handleNextClick(e) {
      e.preventDefault();
      e.stopPropagation();

      // logger.log(`[${this.id}] Next button clicked, current position: ${this.currentPosition}, max: ${this.maxPosition}`);

      if (this.currentPosition < this.maxPosition) {
        this.currentPosition++;
        this.updatePosition();
        this.updateButtons();
      }
    }
  }, {
    key: "handleResize",
    value: function handleResize() {
      // Update container size on resize
      this.setContainerSize();

      // Recalculate values on resize
      this.visibleItems = this.calculateVisibleItems();
      this.maxPosition = Math.max(0, this.items.length - this.visibleItems);

      // logger.log(`[${this.id}] Window resized, visible items: ${this.visibleItems}, max position: ${this.maxPosition}`);

      // Ensure current position is valid after resize
      if (this.currentPosition > this.maxPosition) {
        this.currentPosition = this.maxPosition;
      }
      this.updatePosition();
      this.updateButtons();
    }

    /**
     * Get available width for carousel items considering all parent containers
     * This method makes sure we respect the product-item width
     * @returns {number} Available width in pixels
     */
  }, {
    key: "getAvailableWidth",
    value: function getAvailableWidth() {
      // Start with the basic container width
      var availableWidth = this.container.clientWidth - 50; // Subtract arrow space

      // Check if this is a similar products carousel (within product-item)
      if (this.isSimilarProducts) {
        // Find the product-item parent to ensure we respect its width
        var parentProductItem = this.container.closest('.product-item');
        if (parentProductItem) {
          // Get product-item width and consider its padding
          var productItemStyles = window.getComputedStyle(parentProductItem);
          var productItemWidth = parentProductItem.clientWidth - (parseFloat(productItemStyles.paddingLeft) + parseFloat(productItemStyles.paddingRight));

          // Use the minimum of container width or product-item width
          availableWidth = Math.min(availableWidth, productItemWidth);

          // logger.log(`Product item width: ${productItemWidth}px, Available width: ${availableWidth}px`);
        }
      } else {
        // For suggested products - respect the accordion item width
        var accordionContent = this.container.closest('.accordion-content');
        if (accordionContent) {
          var accordionWidth = accordionContent.clientWidth - 30; // Allow for padding
          availableWidth = Math.min(availableWidth, accordionWidth);
          // logger.log(`Accordion content width: ${accordionWidth}px, Available width: ${availableWidth}px`);
        }
      }
      return Math.max(availableWidth, 100); // Ensure minimum reasonable width
    }
  }, {
    key: "updatePosition",
    value: function updatePosition() {
      if (!this.itemsContainer) return;

      // Calculate total width of an item including gap
      var totalItemWidth = this.itemWidth + this.itemGap;

      // Calculate translateX value
      var translateX = -this.currentPosition * totalItemWidth;

      // Set transition for smooth movement
      this.itemsContainer.style.transition = 'transform 0.3s ease';

      // Apply the transform
      this.itemsContainer.style.transform = "translateX(".concat(translateX, "px)");

      // logger.log(`[${this.id}] Position updated to ${this.currentPosition}, translateX: ${translateX}px`);
    }
  }, {
    key: "updateButtons",
    value: function updateButtons() {
      if (this.prevBtn) {
        if (this.currentPosition <= 0) {
          this.prevBtn.classList.add('disabled');
          this.prevBtn.setAttribute('aria-disabled', 'true');
        } else {
          this.prevBtn.classList.remove('disabled');
          this.prevBtn.removeAttribute('aria-disabled');
        }
      }
      if (this.nextBtn) {
        if (this.currentPosition >= this.maxPosition) {
          this.nextBtn.classList.add('disabled');
          this.nextBtn.setAttribute('aria-disabled', 'true');
        } else {
          this.nextBtn.classList.remove('disabled');
          this.nextBtn.removeAttribute('aria-disabled');
        }
      }

      // logger.log(`[${this.id}] Buttons updated - prev ${this.prevBtn ? (this.prevBtn.classList.contains('disabled') ? 'disabled' : 'enabled') : 'missing'}, next ${this.nextBtn ? (this.nextBtn.classList.contains('disabled') ? 'disabled' : 'enabled') : 'missing'}`);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      // Clean up event listeners
      if (this.prevBtn) {
        this.prevBtn.removeEventListener('click', this.handlePrevClick);
      }
      if (this.nextBtn) {
        this.nextBtn.removeEventListener('click', this.handleNextClick);
      }

      // Remove resize listener
      window.removeEventListener('resize', this.handleResize);

      // Remove instance reference
      if (this.container) {
        delete this.container.carouselInstance;
      }

      // logger.log(`[${this.id}] Carousel destroyed`);
    }
  }]);
}();
/**
 * Initialize carousels immediately after DOM content is loaded
 * and ensure navigation buttons work correctly
 * @returns {Array<SuggestionsCarousel>} Array of initialized carousel instances
 */
function initSuggestionsCarousels() {
  // logger.log('Initializing all suggestion carousels');

  // Find all carousel containers (both types: suggestions and similar products)
  var carouselContainers = document.querySelectorAll('.suggestions-carousel');
  // logger.log(`Found ${carouselContainers.length} carousel containers`);

  // Clean up any existing instances first
  carouselContainers.forEach(function (container) {
    if (container.carouselInstance) {
      container.carouselInstance.destroy();
    }
  });

  // Initialize new instances
  var carousels = [];
  carouselContainers.forEach(function (container) {
    var carousel = new SuggestionsCarousel(container);
    carousels.push(carousel);
  });
  return carousels;
}

/**
 * Initialize carousels when accordions are opened
 * This ensures proper rendering of carousels in accordions
 */
function initCarouselOnAccordionOpen() {
  // Find all accordion headers
  var accordionHeaders = document.querySelectorAll('.accordion-header');
  // logger.log(`Setting up ${accordionHeaders.length} accordion headers for carousel initialization`);

  accordionHeaders.forEach(function (header) {
    // Remove existing event listeners to prevent duplicates
    header.removeEventListener('click', handleAccordionClick);

    // Add event listener
    header.addEventListener('click', handleAccordionClick);
  });
}

/**
 * Handler for accordion clicks that initializes carousels when content becomes visible
 * @param {Event} e - Click event object
 */
function handleAccordionClick(e) {
  // Wait for accordion animation to complete
  setTimeout(function () {
    // Find the accordion content area
    var accordionItem = e.currentTarget.closest('.accordion-item');
    if (!accordionItem) return;
    var content = accordionItem.querySelector('.accordion-content');
    if (!content) return;

    // Check if content is visible
    if (window.getComputedStyle(content).display !== 'none') {
      // logger.log('Accordion opened, checking for carousels to initialize');

      // Find carousels within this accordion content - check for both types
      var carousels = content.querySelectorAll('.suggestions-carousel');
      // logger.log(`Found ${carousels.length} carousels in opened accordion`);

      carousels.forEach(function (container) {
        // Reinitialize carousel to ensure proper rendering and functionality
        if (container.carouselInstance) {
          container.carouselInstance.destroy();
        }
        new SuggestionsCarousel(container);
      });
    }
  }, 300);
}

// Initialize carousels after DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
  // logger.log('DOM loaded, initializing carousels');
  initSuggestionsCarousels();
  initCarouselOnAccordionOpen();
});

// Export the functions to be used in other modules


/***/ }),

/***/ "./src/js/frontend/TemplateEngine.js":
/*!*******************************************!*\
  !*** ./src/js/frontend/TemplateEngine.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");




/**
 * TemplateEngine.js
 *
 * Manages HTML templates for the Product Estimator plugin.
 */

var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_4__.createLogger)('TemplateEngine');
var TemplateEngine = /*#__PURE__*/function () {
  /**
   * Initialize the template engine
   */
  function TemplateEngine() {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__["default"])(this, TemplateEngine);
    this.templates = {};
    this.templateElements = {};
    this.initialized = false;
  }

  /**
   * Initialize template engine by gathering all templates
   * @returns {TemplateEngine} This instance for chaining
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__["default"])(TemplateEngine, [{
    key: "init",
    value: function init() {
      var _this = this;
      if (this.initialized) {
        logger.log('[init] Already initialized.'); // Added context
        return this;
      }
      logger.log('[init] Initializing TemplateEngine. Templates to process:', Object.keys(this.templates)); // Added context

      // Create template elements from registered HTML
      Object.entries(this.templates).forEach(function (_ref) {
        var _ref2 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref, 2),
          id = _ref2[0],
          html = _ref2[1];
        try {
          // Added try-catch for parsing errors per template
          // Create a temporary div to hold the HTML
          var tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;

          // Extract the template content
          var templateElement = tempDiv.querySelector('template');
          if (templateElement) {
            _this.templateElements[id] = templateElement;
            logger.log("[init] Template element found in HTML for ID: \"".concat(id, "\"")); // Added context
          } else {
            logger.error("[init] UNEXPECTED: templateElement was null/undefined for ID: \"".concat(id, "\". Creating nested template. Original HTML likely already contained a <template> tag."));

            // Create a new template element if the HTML string didn't contain <template> tags
            var newTemplate = document.createElement('template');
            newTemplate.id = id; // Set the ID on the template element itself
            newTemplate.innerHTML = html; // Put the raw HTML inside the template tag
            _this.templateElements[id] = newTemplate;
            logger.log("[init] Created new template element for ID: \"".concat(id, "\" (HTML was likely raw, not wrapped in <template>)")); // Added context
          }

          // *** Add this logging block to check template element content ***
          if (_this.templateElements[id]) {
            var contentToCheck = _this.templateElements[id].content || _this.templateElements[id]; // Check .content first, then the element itself

            logger.log("[init] TemplateElement for \"".concat(id, "\" created. Inner HTML starts with:"), ((contentToCheck === null || contentToCheck === void 0 ? void 0 : contentToCheck.innerHTML) || 'No innerHTML or content').substring(0, 200) + '...'); // Added context

            // Specifically check if the room template contains .product-list
            if (id === 'room-item-template') {
              // Use a temporary div to query the content/innerHTML safely
              var queryTempDiv = document.createElement('div');
              if (contentToCheck !== null && contentToCheck !== void 0 && contentToCheck.innerHTML) {
                queryTempDiv.innerHTML = contentToCheck.innerHTML;
              } else {
                // If no innerHTML (e.g., just text nodes or complex structure), append children
                Array.from((contentToCheck === null || contentToCheck === void 0 ? void 0 : contentToCheck.childNodes) || []).forEach(function (node) {
                  return queryTempDiv.appendChild(node.cloneNode(true));
                });
              }
              logger.log("[init] Checking \"".concat(id, "\" content for .product-list:"), queryTempDiv.querySelector('.product-list') ? 'Found' : 'Not Found'); // Added context
              if (!queryTempDiv.querySelector('.product-list')) {
                logger.error("[init] CRITICAL: .product-list not found in \"".concat(id, "\" template element content after creation.")); // Critical error if missing
              }
            }
          } else {
            logger.error("[init] Failed to assign template element for ID: \"".concat(id, "\"")); // Added context
          }
          // *** End logging block ***
        } catch (error) {
          logger.error("[init] Error processing template HTML for ID \"".concat(id, "\":"), error); // Added context
          // Decide how to handle templates that fail to parse - maybe skip them?
        }
      });
      logger.log("[init] TemplateEngine initialized with ".concat(Object.keys(this.templateElements).length, " template elements")); // Added context
      this.initialized = true;

      // this.verifyTemplates(); // Your existing verification method is fine

      return this;
    }

    /**
     * Register a template with the engine
     * @param {string} id - Template ID
     * @param {string} html - Template HTML content
     * @returns {TemplateEngine} This instance for chaining
     */
  }, {
    key: "registerTemplate",
    value: function registerTemplate(id, html) {
      if (typeof html !== 'string' || html.trim() === '') {
        logger.warn("[registerTemplate] Cannot register empty or non-string HTML for template \"".concat(id, "\".")); // Added context
        // Optionally throw an error or return early
        return this;
      }
      this.templates[id] = html;
      this.initialized = false; // Mark as needing reinitialization when a new template is added
      logger.log("[registerTemplate] Registered template \"".concat(id, "\". HTML starts with:"), html.substring(0, 200) + '...'); // Add this log
      return this;
    }

    /**
     * Get a template by ID
     * @param {string} id - Template ID
     * @returns {HTMLTemplateElement|null} Template element or null if not found
     */
  }, {
    key: "getTemplate",
    value: function getTemplate(id) {
      // Ensure initialization happens if needed
      if (!this.initialized) {
        logger.warn('[getTemplate] TemplateEngine not initialized yet. Calling init().'); // Added context
        this.init();
      }
      // Check if template element exists after ensuring initialization
      var template = this.templateElements[id] || null;
      if (!template) {
        logger.error("[getTemplate] Template element not found for ID: \"".concat(id, "\".")); // Added context
      }
      return template;
    }

    /**
     * Create an element from a template and populate it with data
     * This method returns a DocumentFragment
     * @param {string} templateId - Template ID
     * @param {object} data - Data to populate the template with
     * @returns {DocumentFragment} The populated template content
     */
  }, {
    key: "create",
    value: function create(templateId) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var template = this.getTemplate(templateId); // Retrieve the <template> element

      if (!template) {
        logger.error("[create] Cannot create element. Template element not found for ID: \"".concat(templateId, "\""));
        return document.createDocumentFragment(); // Return empty fragment gracefully
      }

      // --- START: Add Detailed Debug Logs Here ---
      logger.log("[DEBUG][TemplateEngine.create] Found template element for \"".concat(templateId, "\":"), template);
      // Check if the template element itself has content if .content property seems problematic
      logger.log("[DEBUG][TemplateEngine.create] Template \"".concat(templateId, "\" direct innerHTML (first 200 chars):"), template.innerHTML.substring(0, 200));
      if (template.content) {
        logger.log("[DEBUG][TemplateEngine.create] Template \"".concat(templateId, "\" has .content property:"), template.content);
        logger.log("[DEBUG][TemplateEngine.create] Template \"".concat(templateId, "\" .content.childNodes count:"), template.content.childNodes.length);

        // Log the node type and content of the first few children to see what's inside
        var childNodes = template.content.childNodes;
        for (var i = 0; i < Math.min(childNodes.length, 3); i++) {
          // Log first 3 nodes
          var node = childNodes[i];
          // Check if textContent exists and has trim method before calling trim()
          var nodeTextContent = node.textContent ? node.textContent.trim().substring(0, 50) : '[No textContent]';
          logger.log("[DEBUG][TemplateEngine.create] Node[".concat(i, "] type: ").concat(node.nodeType, ", name: ").concat(node.nodeName, ", text: ").concat(nodeTextContent, "..."));
        }
        var firstElement = template.content.firstElementChild;
        logger.log("[DEBUG][TemplateEngine.create] Template \"".concat(templateId, "\" .content.firstElementChild:"), firstElement);
      } else {
        logger.error("[DEBUG][TemplateEngine.create] CRITICAL: Template \"".concat(templateId, "\" DOES NOT HAVE a .content property!"));
      }
      // --- END: Add Detailed Debug Logs Here ---

      // Clone the template content (returns a DocumentFragment)
      // Use try-catch for cloning errors
      var clone;
      try {
        // Check if content exists before cloning
        if (!template.content) {
          logger.error("[create] Cannot clone template content for ID: \"".concat(templateId, "\" - .content is missing."));
          return document.createDocumentFragment(); // Return empty fragment
        }
        clone = template.content.cloneNode(true); // Clone the actual content

        if (!clone) {
          logger.error("[create] Failed to clone template content for ID: \"".concat(templateId, "\". cloneNode returned null/undefined.")); // Updated log message
          return document.createDocumentFragment(); // Return empty fragment if cloning fails
        }
        logger.log("[create] Cloned template content for \"".concat(templateId, "\". Result is a DocumentFragment.")); // Added context

        // --- START: Log Cloned Fragment Structure ---
        var tempDiv = document.createElement('div');
        tempDiv.appendChild(clone.cloneNode(true)); // Append a clone of the clone to inspect without consuming it
        logger.log("[DEBUG][TemplateEngine.create] Cloned fragment structure for \"".concat(templateId, "\" (first 200 chars): ").concat(tempDiv.innerHTML.substring(0, 200), "..."));
        // --- END: Log Cloned Fragment Structure ---
      } catch (error) {
        logger.error("[create] Error during template.content.cloneNode(true) for ID \"".concat(templateId, "\":"), error); // Updated log message
        return document.createDocumentFragment(); // Return empty fragment on cloning error
      }

      // Populate the template with data
      try {
        // Added try-catch for population errors
        this.populateElement(clone, data); //
        logger.log("[create] Populated fragment for \"".concat(templateId, "\".")); // Added context
      } catch (error) {
        logger.error("[create] Error populating fragment for ID \"".concat(templateId, "\":"), error); // Added context
        // Decide if you want to return the partially populated clone or an empty fragment on error
        // For now, we'll proceed with the potentially incomplete clone.
      }

      // *** Logging block to check the fragment content before returning (from your existing code) ***
      if (templateId === 'room-item-template') {
        // Query selector on a DocumentFragment works as expected
        var productListCheck = clone.querySelector('.product-list');
        logger.log("[create] Created fragment for \"".concat(templateId, "\". Checking for .product-list before returning:"), productListCheck ? 'Found' : 'Not Found'); // Add this log
        if (!productListCheck) {
          logger.error("[create] CRITICAL: .product-list not found in \"".concat(templateId, "\" fragment before returning. This fragment will not render products correctly.")); // Critical error if missing
          // Optionally log the fragment's innerHTML for inspection (can be verbose)
          // const tempDivForCheck = document.createElement('div'); tempDivForCheck.appendChild(clone.cloneNode(true)); logger.log('Fragment innerHTML for check:', tempDivForCheck.innerHTML);
        }
      }
      // *** End logging block ***

      return clone; // Return the populated DocumentFragment
    }

    /**
     * Process a string with handlebars-style placeholders
     * @param {string} str - The string containing {{placeholders}}
     * @param {object} data - Data object with values to replace placeholders
     * @returns {string} - The processed string with placeholders replaced
     */
  }, {
    key: "processHandlebars",
    value: function processHandlebars(str, data) {
      if (!str || typeof str !== 'string') {
        return str;
      }
      return str.replace(/\{\{(\w+)\}\}/g, function (match, key) {
        return data[key] !== undefined ? data[key] : match;
      });
    }

    /**
     * Process all handlebars placeholders in an element and its children
     * @param {Element|DocumentFragment} element - The element to process
     * @param {object} data - Data object with values to replace placeholders
     * @private
     */
  }, {
    key: "_processElementHandlebars",
    value: function _processElementHandlebars(element, data) {
      var _this2 = this;
      // Process all elements in the fragment
      var _processNode = function processNode(node) {
        // Skip non-element nodes (text nodes, comments, etc.)
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return;
        }

        // Process attributes
        if (node.hasAttributes()) {
          Array.from(node.attributes).forEach(function (attr) {
            if (attr.value.includes('{{')) {
              attr.value = _this2.processHandlebars(attr.value, data);
            }
          });
        }

        // Process text content for elements without children
        if (node.childNodes.length === 1 && node.firstChild.nodeType === Node.TEXT_NODE) {
          var text = node.textContent;
          if (text.includes('{{')) {
            node.textContent = _this2.processHandlebars(text, data);
          }
        }

        // Process child elements recursively
        Array.from(node.childNodes).forEach(function (child) {
          _processNode(child);
        });
      };

      // Start processing from the root element
      if (element.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        // For document fragments, process all child nodes
        Array.from(element.childNodes).forEach(function (child) {
          _processNode(child);
        });
      } else {
        // For regular elements, process the element itself
        _processNode(element);
      }
      logger.log('[_processElementHandlebars] Processed handlebars placeholders in element');
    }

    /**
     * Populate an element with data
     * @param {Element|DocumentFragment} element - Element to populate
     * @param {object} data - Data to populate with
     */
  }, {
    key: "populateElement",
    value: function populateElement(element, data) {
      var _this3 = this;
      // Process handlebars placeholders in element attributes and text
      this._processElementHandlebars(element, data);

      // Process simple data attributes first
      Object.entries(data).forEach(function (_ref3) {
        var _ref4 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref3, 2),
          key = _ref4[0],
          value = _ref4[1];
        // Skip complex objects and arrays
        if ((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(value) !== 'object' && !Array.isArray(value)) {
          // Look for elements with matching class name
          var targetElements = element.querySelectorAll(".".concat(key));
          targetElements.forEach(function (target) {
            if (target.tagName === 'IMG' && key === 'image') {
              target.src = value || '';
              if (data.name) target.alt = data.name;
            } else if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
              target.value = value;
            } else {
              target.textContent = value;
            }
          });

          // --- ADDED: Specific handling for similar item template classes ---
          if (key === 'name') {
            var nameElements = element.querySelectorAll('.suggestion-name');
            nameElements.forEach(function (el) {
              el.textContent = value;
            });
          }
          // The backend is sending min_price_total and max_price_total for the price range
          if (key === 'min_price_total' || key === 'max_price_total') {
            // We handle the price range display below, so no action needed here for individual min/max keys
          }
          if (key === 'image') {
            var imgElements = element.querySelectorAll('img.similar-product-thumbnail');
            imgElements.forEach(function (img) {
              var _img$closest;
              img.src = value || 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='; // Fallback to a transparent pixel
              img.alt = data.name || 'Similar Product Image';
              // Show image and hide no-image placeholder if image exists
              var noImagePlaceholder = (_img$closest = img.closest('.suggestion-image')) === null || _img$closest === void 0 ? void 0 : _img$closest.querySelector('.no-image');
              if (value && value.trim() !== '') {
                img.style.display = ''; // Show image
                if (noImagePlaceholder) noImagePlaceholder.style.display = 'none'; // Hide placeholder
              } else {
                img.style.display = 'none'; // Hide image
                if (noImagePlaceholder) noImagePlaceholder.style.display = ''; // Show placeholder
              }
            });
          }
          // --- END ADDED ---

          // Handle primary product image for room items
          if (key === 'primary_product_image') {
            var primaryImgElements = element.querySelectorAll('img.primary-product-image');
            logger.log('Found primary-product-image elements:', primaryImgElements.length, 'with value:', value);
            primaryImgElements.forEach(function (img) {
              img.src = value || 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
              img.alt = 'Primary product';
              logger.log('Set image src to:', img.src);
            });
          }

          // Also set data attributes
          var dataElements = element.querySelectorAll("[data-".concat(key, "]"));
          dataElements.forEach(function (dataElement) {
            dataElement.setAttribute("data-".concat(key), value);
          });
        }
      });

      // Handle product removal buttons specifically to ensure they get ALL required attributes
      if (data.product_index !== undefined) {
        // Find remove buttons
        var removeButtons = element.querySelectorAll('.remove-product');
        removeButtons.forEach(function (button) {
          // Set product index directly (critical for deletion to work)
          button.dataset.productIndex = data.product_index;

          // Ensure other needed attributes
          if (data.estimate_id !== undefined) button.dataset.estimateId = data.estimate_id;
          if (data.room_id !== undefined) button.dataset.roomId = data.room_id;

          // Debug log to verify attributes
          logger.log("Setting removal button data attributes: estimate=".concat(data.estimate_id, ", room=").concat(data.room_id, ", product=").concat(data.product_index));
        });
      }

      // Handle special data attributes like data-product-id
      if (data.estimate_id) {
        var elementsWithEstimateId = element.querySelectorAll('[data-estimate-id]');
        elementsWithEstimateId.forEach(function (el) {
          el.setAttribute('data-estimate-id', data.estimate_id);
        });
      }
      if (data.room_id) {
        var elementsWithRoomId = element.querySelectorAll('[data-room-id]');
        elementsWithRoomId.forEach(function (el) {
          el.setAttribute('data-room-id', data.room_id);
        });
      }
      if (data.name || data.room_name) {
        var roomNameElements = element.querySelectorAll('.room-name');
        roomNameElements.forEach(function (element) {
          element.textContent = data.name || data.room_name || 'Unnamed Room';
        });
      }

      // Enhanced product ID handling
      if (data.id || data.product_id) {
        // Use either product_id or id (prefer product_id if both exist)
        var idToUse = data.product_id || data.id;

        // Find elements with data-product-id attribute
        var elementsWithProductId = element.querySelectorAll('[data-product-id]');
        elementsWithProductId.forEach(function (el) {
          el.setAttribute('data-product-id', idToUse);
        });

        // Also set on the main element if it's a product-related element
        if (element.classList) {
          var productRelatedClasses = ['product-item', 'similar-item', 'suggestion-item', 'include-item'];
          var isProductElement = productRelatedClasses.some(function (className) {
            return element.classList.contains(className);
          });
          if (isProductElement) {
            element.setAttribute('data-product-id', idToUse);
          }
        }

        // Log successful product ID assignment for debugging
        logger.log("Set data-product-id=".concat(idToUse, " on product element(s) in template"));
      }
      if (data.product_index !== undefined) {
        var elementsWithProductIndex = element.querySelectorAll('[data-product-index]');
        elementsWithProductIndex.forEach(function (el) {
          el.setAttribute('data-product-index', data.product_index);
        });

        // Also set it on the main element if it's a product item
        if (element.classList && element.classList.contains('product-item')) {
          element.setAttribute('data-product-index', data.product_index);
        }
      }

      // Enhanced image handling (general, might overlap with similar item specific handling)
      if (data.image) {
        var imgElements = element.querySelectorAll('img.product-thumbnail, img.product-img');
        imgElements.forEach(function (img) {
          img.src = data.image;
          img.alt = data.name || 'Product';
        });
      }

      // Handle price display (general, might overlap with similar item specific handling)
      if (data.min_total !== undefined && data.max_total !== undefined) {
        var priceElements = element.querySelectorAll('.estimate-price');
        priceElements.forEach(function (el) {
          el.textContent = "".concat(_utils__WEBPACK_IMPORTED_MODULE_4__.format.formatPrice(data.min_total), " - ").concat(_utils__WEBPACK_IMPORTED_MODULE_4__.format.formatPrice(data.max_total));
        });
      }
      if (data.min_price_total !== undefined && data.max_price_total !== undefined) {
        var _priceElements = element.querySelectorAll('.product-price');
        _priceElements.forEach(function (el) {
          el.textContent = "".concat(_utils__WEBPACK_IMPORTED_MODULE_4__.format.formatPrice(data.min_price_total), " - ").concat(_utils__WEBPACK_IMPORTED_MODULE_4__.format.formatPrice(data.max_price_total));
        });
      }

      // --- ADDED: Specific handling for similar item price range ---
      if (data.min_price_total !== undefined && data.max_price_total !== undefined) {
        var _priceElements2 = element.querySelectorAll('.suggestion-price');
        _priceElements2.forEach(function (el) {
          if (data.min_price_total === data.max_price_total) {
            el.textContent = typeof _utils__WEBPACK_IMPORTED_MODULE_4__.format !== 'undefined' && _utils__WEBPACK_IMPORTED_MODULE_4__.format.formatPrice ? _utils__WEBPACK_IMPORTED_MODULE_4__.format.formatPrice(data.min_price_total) : data.min_price_total;
          } else {
            el.textContent = "".concat(typeof _utils__WEBPACK_IMPORTED_MODULE_4__.format !== 'undefined' && _utils__WEBPACK_IMPORTED_MODULE_4__.format.formatPrice ? _utils__WEBPACK_IMPORTED_MODULE_4__.format.formatPrice(data.min_price_total) : data.min_price_total, " - ").concat(typeof _utils__WEBPACK_IMPORTED_MODULE_4__.format !== 'undefined' && _utils__WEBPACK_IMPORTED_MODULE_4__.format.formatPrice ? _utils__WEBPACK_IMPORTED_MODULE_4__.format.formatPrice(data.max_price_total) : data.max_price_total);
          }
        });
      }
      // --- END ADDED ---

      // Enhanced name display for products (general, might overlap with similar item specific handling)
      if (data.name) {
        var nameElements = element.querySelectorAll('.price-title, .product-name');
        nameElements.forEach(function (el) {
          el.textContent = data.name;
        });
      }

      // Handle nested arrays of data using child templates
      Object.entries(data).forEach(function (_ref5) {
        var _ref6 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref5, 2),
          key = _ref6[0],
          value = _ref6[1];
        if (Array.isArray(value) && value.length > 0) {
          // Find container for this array
          var container = element.querySelector(".".concat(key)) || element.querySelector(".".concat(key, "-container")) || element.querySelector(".".concat(key, "-items"));
          if (container && value[0].template) {
            // Use the specified template for each item
            var childTemplateId = value[0].template;
            value.forEach(function (item) {
              var childElement = _this3.create(childTemplateId, item);
              container.appendChild(childElement);
            });
          }
        }
      });

      // Handle common product data patterns - UPDATED FOR PRODUCT INCLUDES
      if (data.additional_products) {
        var includesContainer = element.querySelector('.includes-container');
        var includesItems = element.querySelector('.product-includes-items');
        if (includesContainer && includesItems) {
          // Clear any previous items first
          includesItems.innerHTML = '';

          // Handle both array and object formats of additional_products
          var productsArray = [];
          if (Array.isArray(data.additional_products)) {
            // Format is already an array
            productsArray = data.additional_products;
          } else if ((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(data.additional_products) === 'object') {
            // Format is an object with keys, convert to array
            productsArray = Object.values(data.additional_products);
          }

          // Filter for valid additional products
          var validProducts = productsArray.filter(function (product) {
            return product && product.id;
          });
          if (validProducts.length > 0) {
            // Ensure includes container is visible
            includesContainer.style.display = 'block';
            includesContainer.classList.add('visible');

            // Render each additional product
            validProducts.forEach(function (product) {
              // Use template to create include item
              if (_this3.getTemplate('include-item-template')) {
                // Create data object for the include item
                var includeItemData = {
                  product_id: product.id,
                  include_item_name: product.name || 'Additional Product'
                };

                // Add price information if available
                if (product.min_price_total !== undefined && product.max_price_total !== undefined) {
                  includeItemData.include_item_total_price = _utils__WEBPACK_IMPORTED_MODULE_4__.format.formatPrice(product.min_price_total) + ' - ' + _utils__WEBPACK_IMPORTED_MODULE_4__.format.formatPrice(product.max_price_total);
                  product.total_price = _utils__WEBPACK_IMPORTED_MODULE_4__.format.formatPrice(product.min_price_total) + ' - ' + _utils__WEBPACK_IMPORTED_MODULE_4__.format.formatPrice(product.max_price_total);
                }
                logger.log("include item product:: ", product);
                // Create the item from template
                var includeFragment = _this3.create('include-item-template', includeItemData);
                var includeNameElement = includeFragment.querySelector('.include-item-name');
                if (includeNameElement) {
                  includeNameElement.textContent = product.name || '';
                }
                var includePriceElement = includeFragment.querySelector('.include-item-total-price');
                if (includePriceElement) {
                  includePriceElement.textContent = product.total_price || '';
                }
                includesItems.appendChild(includeFragment);
              }
            });

            // Show the toggle button if it exists
            var toggleButton = element.querySelector('.product-includes-toggle');
            if (toggleButton) {
              toggleButton.style.display = '';
            }
          } else {
            // Hide the includes container if no valid products
            includesContainer.style.display = 'none';
            includesContainer.classList.remove('visible');

            // Also hide the toggle button if it exists
            var _toggleButton = element.querySelector('.product-includes-toggle');
            if (_toggleButton) {
              _toggleButton.style.display = 'none';
            }
          }
        }
      }

      // Handle additional notes
      if (data.additional_notes) {
        var notesContainer = element.querySelector('.notes-container');
        var notesItems = element.querySelector('.product-notes-items');
        if (notesContainer && notesItems) {
          // Clear any previous notes first
          notesItems.innerHTML = '';

          // Handle both array and object formats of additional_notes
          var notesArray = [];
          if (Array.isArray(data.additional_notes)) {
            // Format is already an array
            notesArray = data.additional_notes;
          } else if ((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(data.additional_notes) === 'object') {
            // Format is an object with keys, convert to array
            notesArray = Object.values(data.additional_notes);
          }

          // Filter out empty notes
          var validNotes = notesArray.filter(function (note) {
            // Check if the note has text content
            return note && (note.note_text || note.text) && (note.note_text || note.text).trim() !== '';
          });
          if (validNotes.length > 0) {
            // Ensure notes container is visible
            notesContainer.style.display = 'block';
            notesContainer.classList.add('visible');

            // Render each valid note
            validNotes.forEach(function (note) {
              // Use template to create note element
              if (_this3.getTemplate('note-item-template')) {
                // Create a clone of the template
                var noteFragment = _this3.create('note-item-template', {});

                // Find the note-text element and explicitly set its content
                var noteTextElement = noteFragment.querySelector('.note-text');
                if (noteTextElement) {
                  noteTextElement.textContent = note.note_text || note.text || '';
                }

                // Append the fragment to the notes container
                notesItems.appendChild(noteFragment);
              }
            });
          } else {
            // Hide the notes container if no valid notes
            notesContainer.style.display = 'none';
            notesContainer.classList.remove('visible');

            // Also hide the toggle button if it exists
            var _toggleButton2 = element.querySelector('.product-notes-toggle');
            if (_toggleButton2) {
              _toggleButton2.style.display = 'none';
            }
          }
        }
      }

      // Handle similar products
      if (data.similar_products) {
        var similarProductsContainer = element.querySelector('.similar-products-container');
        var similarProductsList = element.querySelector('.similar-products-list');
        if (similarProductsContainer && similarProductsList) {
          // Clear any previous similar products first
          similarProductsList.innerHTML = '';

          // Handle both array and object formats of similar_products
          var _productsArray = [];
          if (Array.isArray(data.similar_products)) {
            // Format is already an array
            _productsArray = data.similar_products;
          } else if ((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(data.similar_products) === 'object') {
            // Format is an object with keys, convert to array
            _productsArray = Object.values(data.similar_products);
          }

          // Filter for valid similar products
          var _validProducts = _productsArray.filter(function (product) {
            return product && product.id;
          });
          if (_validProducts.length > 0) {
            // Add product ID to container for reference
            similarProductsContainer.dataset.productId = data.id || data.product_id || '';

            // Show toggle button if it exists
            var _toggleButton3 = element.querySelector('.similar-products-toggle');
            if (_toggleButton3) {
              _toggleButton3.style.display = 'block';
            }

            // Render each similar product
            _validProducts.forEach(function (product) {
              if (_this3.getTemplate('similar-product-item-template')) {
                // Create template data for the similar product
                var similarProductData = {
                  id: product.id,
                  product_id: product.id,
                  name: product.name || 'Similar Product',
                  image: product.image || '',
                  min_price_total: product.min_price_total,
                  max_price_total: product.max_price_total,
                  pricing_method: product.pricing_method || 'sqm',
                  // Data attributes for the replace button
                  estimate_id: data.estimate_id || '',
                  room_id: data.room_id || '',
                  replace_product_id: data.id || data.product_id || ''
                };
                logger.log('Rendering similar product with data:', similarProductData);

                // Create the similar product element from template
                var similarFragment = _this3.create('similar-product-item-template', similarProductData);

                // Append the fragment to the similar products container
                similarProductsList.appendChild(similarFragment);
              }
            });
          } else {
            // Hide the container and toggle if no valid similar products
            var _toggleButton4 = element.querySelector('.similar-products-toggle');
            if (_toggleButton4) {
              _toggleButton4.style.display = 'none';
            }
          }
        }
      }

      // --- ADDED: Explicitly set data-replace-product-id on the replace button ---
      if (data.replace_product_id !== undefined) {
        var replaceButton = element.querySelector('.replace-product-in-room');
        if (replaceButton) {
          replaceButton.dataset.replaceProductId = data.replace_product_id;
          logger.log("TemplateEngine: Set data-replace-product-id on button to: ".concat(data.replace_product_id));
        }
      }
      // --- END ADDED ---

      // --- ADDED: Explicitly set data-pricing-method on the replace button ---
      if (data.pricing_method !== undefined) {
        var _replaceButton = element.querySelector('.replace-product-in-room');
        if (_replaceButton) {
          _replaceButton.dataset.pricingMethod = data.pricing_method;
          logger.log("TemplateEngine: Set data-pricing-method on button to: ".concat(data.pricing_method));
        }
      }
      // --- END ADDED ---

      // Handle visibility conditions based on data-visible-if attribute
      var visibleElements = element.querySelectorAll('[data-visible-if]');
      visibleElements.forEach(function (el) {
        var condition = el.getAttribute('data-visible-if');
        if (condition) {
          // Check if the condition is truthy in the data
          var isVisible = !!data[condition];
          if (!isVisible) {
            el.style.display = 'none';
          } else {
            // Make sure it's visible if condition is true
            el.style.display = '';
          }
        }
      });
    }

    /**
     * Create and insert an element into the DOM
     * @param {string} templateId - Template ID
     * @param {object} data - Data to populate with
     * @param {Element|string} container - Container element or selector
     * @param {string} position - Insert position ('append', 'prepend', 'before', 'after', 'replace')
     * @returns {Element|DocumentFragment|null} The inserted element(s) or null if container not found
     */
  }, {
    key: "insert",
    value: function insert(templateId, data, container) {
      var position = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'append';
      var element = this.create(templateId, data); // element is a DocumentFragment

      if (typeof container === 'string') {
        container = document.querySelector(container);
      }
      if (!container) {
        logger.error("[insert] Container not found for template: \"".concat(templateId, "\"")); // Added context
        // It might be useful to return the fragment even if the container isn't found,
        // in case the caller wants to handle appending it elsewhere.
        // Or just return null to indicate insertion failed. Let's return null for clarity of failure.
        return null;
      }
      try {
        // Added try-catch for insertion errors
        switch (position) {
          case 'prepend':
            container.prepend(element); // element is a DocumentFragment
            break;
          case 'before':
            // When inserting a fragment before/after, insert the fragment itself
            container.parentNode.insertBefore(element, container); // element is a DocumentFragment
            break;
          case 'after':
            // When inserting a fragment before/after, insert the fragment itself
            container.parentNode.insertBefore(element, container.nextSibling); // element is a DocumentFragment
            break;
          case 'replace':
            {
              // To replace, we need the content of the fragment, not the fragment itself
              // This might need adjustment depending on expected behavior.
              // Standard replaceChild takes a node. Replacing with a fragment's content means looping.
              logger.warn("[insert] \"replace\" position used for template \"".concat(templateId, "\". Replacing container with fragment's children.")); // Added context
              // Get fragment's children before it's consumed (for debugging/reference purposes)
              // const fragmentChildren = Array.from(element.childNodes);
              container.parentNode.replaceChild(element, container); // This inserts the fragment, effectively replacing the container with its children
              // Note: The original container is replaced by the fragment. If you need a reference to the new element,
              // this becomes complex as a fragment can have multiple top-level children.
              // Returning the fragment itself might be the most reliable if the caller expects multiple nodes.
              break;
            }
          case 'append':
          default:
            container.appendChild(element); // element is a DocumentFragment
            break;
        }
        logger.log("[insert] Inserted template \"".concat(templateId, "\" into container. Position: ").concat(position)); // Added context

        // When appending/prepending a fragment, its children are moved.
        // If the template content is guaranteed to have a single top-level element
        // (like <div class="accordion-item">...</div> for room-item-template),
        // we might try to find and return that specific element for the caller's convenience.
        // However, returning the fragment or null on failure is safer if templates can be varied.
        // Given loadEstimatesList expects roomElement to be the .accordion-item, let's find it.
        if (templateId === 'room-item-template' && position === 'append' && container) {
          // Find the element *within the container* that matches the top-level element of the template
          // This requires querying the container after the fragment is appended.
          // This is a potential point of failure if the query is too fast or the structure is unexpected.
          // For now, let's rely on the caller (loadEstimatesList) to query for the specific element after insert.
          // Returning the fragment itself is the standard DocumentFragment behavior return.
          return element; // Return the fragment
        }
        return element; // Return the fragment that was inserted (its children are now in the DOM)
      } catch (error) {
        logger.error("[insert] Error inserting template \"".concat(templateId, "\" into container. Position: ").concat(position), error); // Added context
        return null; // Return null on insertion error
      }
    }

    /**
     * Show a message in the modal
     * @param {string} message - Message to show
     * @param {string} type - Message type ('success' or 'error')
     * @param {Element|string} container - Container element or selector
     */
  }, {
    key: "showMessage",
    value: function showMessage(message) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'success';
      var container = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '.product-estimator-modal-form-container';
      // Remove existing messages
      var existingMessages = document.querySelectorAll('.modal-message');
      existingMessages.forEach(function (msg) {
        return msg.remove();
      });

      // Message type determines which template would be used (if we used template-based approach)
      // For now, we're using direct DOM creation approach below

      // Find messages template container
      var messageTemplate = this.getTemplate('modal-messages-template');
      if (!messageTemplate) {
        // Fallback - create a basic message div
        var messageDiv = document.createElement('div');
        messageDiv.className = "modal-message modal-".concat(type, "-message");
        messageDiv.textContent = message;
        if (typeof container === 'string') {
          container = document.querySelector(container);
        }
        if (container) {
          container.prepend(messageDiv);

          // Auto-remove after 5 seconds
          setTimeout(function () {
            if (messageDiv.parentNode) {
              messageDiv.remove();
            }
          }, 5000);
        }
        return;
      }

      // Create the message element from the template
      var messageElement = document.createElement('div');
      messageElement.className = "modal-message modal-".concat(type, "-message");
      messageElement.innerHTML = "<div class=\"message-content\">".concat(message, "</div>");
      if (typeof container === 'string') {
        container = document.querySelector(container);
      }
      if (container) {
        container.prepend(messageElement);

        // Auto-remove after 5 seconds
        setTimeout(function () {
          if (messageElement.parentNode) {
            messageElement.remove();
          }
        }, 5000);
      }
    }

    // Add this method to TemplateEngine class
    /**
     * Creates the modal container in the document body
     * @returns {HTMLElement|null} The created modal element or null if creation failed
     */
  }, {
    key: "createModalContainer",
    value: function createModalContainer() {
      logger.log('Creating modal container from template');
      try {
        var _window$productEstima, _window$productEstima2, _window$productEstima3;
        // Check if modal container already exists
        var existingModal = document.querySelector('#product-estimator-modal');
        if (existingModal) {
          logger.log('Modal container already exists in DOM');
          return existingModal;
        }

        // Get the modal container template
        var modalTemplate = this.getTemplate('modal-container-template');
        if (!modalTemplate) {
          logger.error('Modal container template not found');
          return null;
        }

        // Add detailed debug logging for template creation
        logger.group('Debug: Template Creation');
        logger.log('Template id:', 'modal-container-template');
        logger.log('Template found:', !!modalTemplate);

        // Log template source
        logger.log('Template outerHTML:', modalTemplate.outerHTML);
        if (modalTemplate.content) {
          logger.log('Template has content property with:', modalTemplate.content.childNodes.length, 'child nodes');
          // Log the first few nodes
          Array.from(modalTemplate.content.childNodes).slice(0, 3).forEach(function (node, i) {
            logger.log("Node[".concat(i, "]:"), node.nodeType, node.nodeName);
          });

          // Check for specific elements in template content before creation
          var tempDiv = document.createElement('div');
          tempDiv.appendChild(modalTemplate.content.cloneNode(true));
          logger.log('Template content inner HTML:', tempDiv.innerHTML.substring(0, 500) + '...');

          // Check for specific elements
          logger.log('Template contains #estimates:', !!tempDiv.querySelector('#estimates'));
          logger.log('Template contains #estimate-selection-wrapper:', !!tempDiv.querySelector('#estimate-selection-wrapper'));
          logger.log('Template contains #room-selection-form-wrapper:', !!tempDiv.querySelector('#room-selection-form-wrapper'));
        }
        logger.groupEnd();

        // Create a fragment from the template
        var modalFragment = this.create('modal-container-template', {
          // Add i18n texts if needed
          title: ((_window$productEstima = window.productEstimatorVars) === null || _window$productEstima === void 0 || (_window$productEstima = _window$productEstima.i18n) === null || _window$productEstima === void 0 ? void 0 : _window$productEstima.productEstimator) || 'Product Estimator',
          close: ((_window$productEstima2 = window.productEstimatorVars) === null || _window$productEstima2 === void 0 || (_window$productEstima2 = _window$productEstima2.i18n) === null || _window$productEstima2 === void 0 ? void 0 : _window$productEstima2.close) || 'Close',
          loading: ((_window$productEstima3 = window.productEstimatorVars) === null || _window$productEstima3 === void 0 || (_window$productEstima3 = _window$productEstima3.i18n) === null || _window$productEstima3 === void 0 ? void 0 : _window$productEstima3.loading) || 'Loading...'
        });

        // Log the fragment content before adding to DOM
        if (modalFragment) {
          logger.log('Created fragment structure for modal:', modalFragment.childNodes.length, 'child nodes at root level');

          // Create temporary div to examine fragment content
          var tempFragDiv = document.createElement('div');
          tempFragDiv.appendChild(modalFragment.cloneNode(true));
          logger.log('Fragment content before appending to DOM:', tempFragDiv.innerHTML.substring(0, 300) + '...');

          // Check for specific elements in the fragment
          logger.log('Fragment contains #estimates:', !!tempFragDiv.querySelector('#estimates'));
          logger.log('Fragment contains form-container:', !!tempFragDiv.querySelector('.product-estimator-modal-form-container'));
        }

        // Append the fragment to the body
        document.body.appendChild(modalFragment);
        logger.log('Modal fragment appended to document body');

        // Get the modal element after it's been added to the DOM
        var modalElement = document.querySelector('#product-estimator-modal');

        // Add detailed logging about DOM after append
        logger.log('DOM after fragment append - modal found:', !!modalElement);

        // Add logging to verify all critical elements exist
        if (modalElement) {
          var elementsStatus = {
            modal: !!modalElement,
            container: !!modalElement.querySelector('.product-estimator-modal-container'),
            formContainer: !!modalElement.querySelector('.product-estimator-modal-form-container'),
            estimates: !!modalElement.querySelector('#estimates'),
            estimateSelection: !!modalElement.querySelector('#estimate-selection-wrapper'),
            roomSelection: !!modalElement.querySelector('#room-selection-form-wrapper'),
            newEstimate: !!modalElement.querySelector('#new-estimate-form-wrapper'),
            newRoom: !!modalElement.querySelector('#new-room-form-wrapper')
          };
          logger.log('Modal element created with child elements status:', elementsStatus);

          // Log element structure regardless
          logger.log('Modal HTML structure:', modalElement.outerHTML.substring(0, 500) + '...');

          // If any critical element is missing, log more details
          if (!elementsStatus.estimates) {
            logger.error('Critical element #estimates missing in created modal!');

            // Check if there's a content container
            var formContainer = modalElement.querySelector('.product-estimator-modal-form-container');
            if (formContainer) {
              logger.log('Form container exists but missing #estimates. Form container HTML:', formContainer.innerHTML);
            }
          }
        }
        if (!modalElement) {
          logger.error('Failed to find modal element after creating it');
          return null;
        }
        logger.log('Modal container created and added to DOM');
        return modalElement;
      } catch (error) {
        logger.error('Error creating modal container:', error);
        return null;
      }
    }
  }, {
    key: "debugTemplates",
    value: function debugTemplates() {
      logger.group('TemplateEngine Debug');
      logger.log('Registered template IDs:', Object.keys(this.templates));
      logger.log('Template elements:', Object.keys(this.templateElements));

      // Check each template
      Object.entries(this.templateElements).forEach(function (_ref7) {
        var _ref8 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref7, 2),
          id = _ref8[0],
          template = _ref8[1];
        logger.log("Template ".concat(id, ":"), template);

        // Check template content
        if (template.content) {
          logger.log("- Has content: ".concat(template.content.childNodes.length, " child nodes"));
        } else {
          logger.warn("- No content for template ".concat(id));
        }
      });
      logger.groupEnd();
    }
  }, {
    key: "debugNoteData",
    value: function debugNoteData(element, data) {
      logger.log('Note data processing:', {
        hasNotes: !!(data.additional_notes && Array.isArray(data.additional_notes)),
        notesCount: data.additional_notes ? data.additional_notes.length : 0,
        notesContainer: element.querySelector('.notes-container') ? 'found' : 'missing',
        notesItems: element.querySelector('.product-notes-items') ? 'found' : 'missing',
        noteTemplate: this.getTemplate('note-item-template') ? 'found' : 'missing',
        firstNote: data.additional_notes && data.additional_notes.length > 0 ? data.additional_notes[0] : null
      });
    }

    // Add to TemplateEngine.js
  }, {
    key: "verifyTemplates",
    value: function verifyTemplates() {
      logger.group('Template Verification');
      logger.log('Registered templates:', Object.keys(this.templates));
      logger.log('Template elements:', Object.keys(this.templateElements));

      // Check note template specifically
      if (this.templates['note-item-template']) {
        logger.log('Note template HTML:', this.templates['note-item-template'].substring(0, 100) + '...');
      } else {
        logger.warn('Note template not registered!');
      }

      // Check if template element exists
      if (this.templateElements['note-item-template']) {
        logger.log('Note template element exists');
      } else {
        logger.warn('Note template element not created!');
      }
      logger.groupEnd();
    }
  }]);
}(); // Export a singleton instance
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new TemplateEngine());

/***/ }),

/***/ "./src/js/frontend/VariationHandler.js":
/*!*********************************************!*\
  !*** ./src/js/frontend/VariationHandler.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");


/**
 * VariationHandler.js
 *
 * Handles all product variation related functionality
 * for the Product Estimator plugin.
 */


var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.createLogger)('VariationHandler');
var VariationHandler = /*#__PURE__*/function () {
  /**
   * Initialize the VariationHandler
   * @param {object} config - Configuration options
   */
  function VariationHandler() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, VariationHandler);
    // Default configuration
    this.config = Object.assign({
      debug: true,
      // Set to true for more verbose logging
      selectors: {
        variationsForm: '.variations_form',
        estimatorButton: '.single_add_to_estimator_button, .button.alt.open-estimator-modal, .product-estimator-button, [data-product-id]',
        variationIdInput: 'input[name="variation_id"]'
      }
    }, config);

    // Store references to DOM elements
    this.variationsForm = document.querySelector(this.config.selectors.variationsForm);
    this.estimatorButton = document.querySelector(this.config.selectors.estimatorButton);
    this.variationIdInput = this.variationsForm ? this.variationsForm.querySelector(this.config.selectors.variationIdInput) : null;

    // Get variations data from global variable - add fallback for safety
    this.variationsData = window.product_estimator_variations || {};

    // State
    this.currentVariationId = null;
    this.initialized = false;
    this.eventHandlers = {};

    // Only initialize if we have a variations form
    if (this.variationsForm) {
      this.init();
    } else {
      logger.log('No variations form found, VariationHandler not initialized');
    }
  }

  /**
   * Initialize the core and check initial button state
   * @returns {VariationHandler} This instance for chaining
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(VariationHandler, [{
    key: "init",
    value: function init() {
      if (this.initialized) {
        logger.log('VariationHandler already initialized');
        return this;
      }

      // Log the initial state for debugging
      logger.log('Initializing VariationHandler with variations data:', this.variationsData);
      logger.log('Estimator button found:', !!this.estimatorButton);

      // If we have the button, log its initial attributes
      if (this.estimatorButton) {
        logger.log('Initial button data-product-id:', this.estimatorButton.dataset.productId);

        // Force visibility if product has estimator enabled
        var productId = this.estimatorButton.dataset.productId;
        if (productId) {
          // Check if parent product has estimator enabled
          var parentEnabled = this.isParentEstimatorEnabled(productId);
          if (parentEnabled) {
            logger.log('Parent product has estimator enabled, ensuring button is visible');
            this.estimatorButton.style.display = '';
            this.estimatorButton.classList.remove('hidden');
          }
        }
      }
      this.bindEvents();

      // Check if there's already a selected variation (page could have loaded with a variation in URL)
      this.checkCurrentVariation();
      this.initialized = true;
      logger.log('VariationHandler initialized');

      // Emit initialization event
      this.emit('initialized');
      return this;
    }

    /**
     * Ensure the estimator button exists for variations with estimator enabled
     * @param {number|string} variationId - Variation ID
     */
  }, {
    key: "ensureEstimatorButton",
    value: function ensureEstimatorButton(variationId) {
      logger.log("Ensuring estimator button exists for variation: ".concat(variationId));

      // Check if button already exists
      var existingButton = document.querySelector(this.config.selectors.estimatorButton);
      if (existingButton) {
        logger.log('Estimator button already exists, updating visibility');
        this.updateEstimatorButton(true, variationId);
        return;
      }

      // Button doesn't exist, we need to create it if estimator is enabled
      var isEnabled = this.isEstimatorEnabled(variationId);
      if (!isEnabled) {
        logger.log('Estimator not enabled for this variation, not creating button');
        return;
      }
      logger.log('Creating estimator button dynamically');

      // Find the add to cart button as reference point
      var addToCartButton = document.querySelector('.single_add_to_cart_button');
      if (!addToCartButton) {
        logger.log('Cannot find add to cart button to insert after');
        return;
      }

      // Create new button
      var newButton = document.createElement('button');
      newButton.type = 'button';
      newButton.className = 'single_add_to_estimator_button button alt open-estimator-modal';
      newButton.dataset.productId = variationId;
      newButton.textContent = 'Add to Estimate';

      // Insert after add to cart button
      addToCartButton.insertAdjacentElement('afterend', newButton);
      logger.log('Estimator button created and inserted');
    }

    /**
     * Check if parent product has estimator enabled
     * @returns {boolean} True if parent has estimator enabled
     */
  }, {
    key: "isParentEstimatorEnabled",
    value: function isParentEstimatorEnabled() {
      // Check if we have any data in the DOM about parent product
      var button = document.querySelector('.single_add_to_estimator_button');
      if (button) {
        // Button presence suggests parent has estimator enabled
        return true;
      }

      // Check for any hidden input or data attribute indicating parent status
      var metaElement = document.querySelector('input[name="_enable_estimator"], [data-enable-estimator]');
      if (metaElement) {
        return metaElement.value === 'yes' || metaElement.dataset.enableEstimator === 'yes';
      }
      return false;
    }

    /**
     * Bind events to handle variation changes
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this = this;
      if (!this.variationsForm) return;
      logger.log('Binding variation events');

      // Listen for WooCommerce variation events
      this.variationsForm.addEventListener('found_variation', this.handleFoundVariation.bind(this));
      this.variationsForm.addEventListener('reset_data', this.handleResetVariation.bind(this));
      this.variationsForm.addEventListener('check_variations', this.handleCheckVariations.bind(this));

      // Also handle some custom events that themes might use
      document.addEventListener('woocommerce_variation_has_changed', this.checkCurrentVariation.bind(this));

      // Handle direct changes to the variation_id input field
      if (this.variationIdInput) {
        this.variationIdInput.addEventListener('change', function () {
          var variationId = _this.variationIdInput.value;
          if (variationId) {
            logger.log("Variation ID input changed to: ".concat(variationId));
            _this.currentVariationId = variationId;
            var enableEstimator = _this.isEstimatorEnabled(variationId);
            _this.updateEstimatorButton(enableEstimator, variationId);
          }
        });
      }

      // Add a listener for jQuery's change event on the form (some themes use this)
      if (typeof jQuery !== 'undefined') {
        jQuery(this.variationsForm).on('change', 'input[name="variation_id"]', function (e) {
          var variationId = e.target.value;
          if (variationId) {
            logger.log("jQuery variation ID change detected: ".concat(variationId));
            _this.currentVariationId = variationId;
            var enableEstimator = _this.isEstimatorEnabled(variationId);
            _this.updateEstimatorButton(enableEstimator, variationId);
          }
        });
      }

      // logger.log('Variation events bound');
    }

    /**
     * Handle found variation event
     * @param {Event} event - Event object
     */
  }, {
    key: "handleFoundVariation",
    value: function handleFoundVariation(event) {
      var variation = typeof event.detail !== 'undefined' ? event.detail : event.target.variation;
      if (!variation || !variation.variation_id) {
        logger.log('Found variation event received but no valid variation data');
        return;
      }
      var variationId = variation.variation_id;
      this.currentVariationId = variationId;
      logger.log("Found variation: ".concat(variationId));

      // Check if this variation has estimator enabled
      var enableEstimator = this.isEstimatorEnabled(variationId);
      logger.log("Variation ".concat(variationId, " has estimator enabled: ").concat(enableEstimator));

      // Ensure button exists before trying to update it
      this.ensureEstimatorButton(variationId);

      // Update UI based on variation
      this.updateEstimatorButton(enableEstimator, variationId);

      // Emit event
      this.emit('variation:changed', {
        variationId: variationId,
        enableEstimator: enableEstimator,
        variation: variation
      });
    }

    /**
     * Handle reset variation event
     */
  }, {
    key: "handleResetVariation",
    value: function handleResetVariation() {
      logger.log('Reset variation');
      this.currentVariationId = null;

      // Hide estimator button on variation reset
      this.updateEstimatorButton(false);

      // Emit event
      this.emit('variation:reset');
    }

    /**
     * Handle check variations event
     */
  }, {
    key: "handleCheckVariations",
    value: function handleCheckVariations() {
      logger.log('Check variations');

      // This event fires when variations are being checked/validated
      // We'll use it as an opportunity to check the current state
      this.checkCurrentVariation();
    }

    /**
     * Check current variation state with improved logging
     */
  }, {
    key: "checkCurrentVariation",
    value: function checkCurrentVariation() {
      // This handles cases where the variation might have changed through
      // theme-specific mechanisms or direct manipulation
      if (!this.variationsForm) return;

      // Debug the buttons we find
      var buttons = document.querySelectorAll(this.config.selectors.estimatorButton);
      logger.log("Found ".concat(buttons.length, " estimator buttons during checkCurrentVariation"));
      if (buttons.length > 1) {
        logger.log('WARNING: Found multiple estimator buttons - this may cause issues. Check for duplicates.');

        // Log the buttons for debugging
        buttons.forEach(function (btn, idx) {
          logger.log("Button ".concat(idx + 1, " HTML: ").concat(btn.outerHTML));
        });
      }

      // Try to find the current variation ID
      var currentVariation = this.getCurrentVariation();
      if (currentVariation) {
        logger.log("Current variation detected: ".concat(currentVariation.variation_id));
        this.currentVariationId = currentVariation.variation_id;
        var enableEstimator = this.isEstimatorEnabled(currentVariation.variation_id);
        this.updateEstimatorButton(enableEstimator, currentVariation.variation_id);
      } else {
        logger.log('No current variation detected');
        this.currentVariationId = null;

        // If no variation is selected, we need to check if the parent product
        // has estimator enabled to decide whether to show the button
        this.updateEstimatorButton(this.isParentProductEstimatorEnabled());
      }
    }

    /**
     * Check if parent product has estimator enabled
     * @returns {boolean} Whether parent product has estimator enabled
     */
  }, {
    key: "isParentProductEstimatorEnabled",
    value: function isParentProductEstimatorEnabled() {
      // Check if we have information about the parent product
      if (typeof window.product_estimator_variations !== 'undefined' && window.product_estimator_variations._parent_enabled) {
        return window.product_estimator_variations._parent_enabled === 'yes';
      }

      // Default to true for variable products to be safe
      return true;
    }

    /**
     * Get the currently selected variation from the form
     * @returns {object | null} The variation data or null if none selected
     */
  }, {
    key: "getCurrentVariation",
    value: function getCurrentVariation() {
      if (!this.variationsForm) return null;

      // Try different approaches to get the current variation
      // Some themes store it in different ways

      // Method 1: Check for WooCommerce's currentVariation property
      if (this.variationsForm.currentVariation) {
        return this.variationsForm.currentVariation;
      }

      // Method 2: Check for hidden input
      var hiddenInput = this.variationsForm.querySelector('input[name="variation_id"]');
      if (hiddenInput && hiddenInput.value) {
        return {
          variation_id: hiddenInput.value
        };
      }

      // Method 3: Check for data attribute
      var variationId = this.variationsForm.dataset.productVariations;
      if (variationId) {
        return {
          variation_id: variationId
        };
      }

      // Method 4: Use jQuery data if available
      if (typeof jQuery !== 'undefined') {
        var $form = jQuery(this.variationsForm);
        // Data might be available via jQuery but we're just using the value directly
        // const jqueryData = $form.data('product_variations');
        var currentVal = $form.find('input[name="variation_id"]').val();
        if (currentVal) {
          return {
            variation_id: currentVal
          };
        }
      }

      // No variation found
      return null;
    }

    /**
     * Check if estimator is enabled for a variation
     * @param {number|string} variationId - Variation ID
     * @returns {boolean} True if estimator is enabled
     */
  }, {
    key: "isEstimatorEnabled",
    value: function isEstimatorEnabled(variationId) {
      if (!variationId) return false;
      logger.log("Checking if estimator is enabled for variation: ".concat(variationId));
      logger.log('Available variations data:', this.variationsData);

      // Check if this variation has estimator enabled in our data
      if (this.variationsData[variationId]) {
        var isEnabled = this.variationsData[variationId].enable_estimator === 'yes';
        logger.log("Found variation data, estimator enabled: ".concat(isEnabled));
        return isEnabled;
      }

      // If no specific data for this variation is found, check the parent product
      var parentButton = document.querySelector('.single_add_to_estimator_button[data-product-id]:not([data-variation-id])');
      if (parentButton) {
        // Check if parent button is visible, which suggests estimator is enabled for parent
        var parentEnabled = !parentButton.classList.contains('hidden') && getComputedStyle(parentButton).display !== 'none';
        logger.log("Using parent product as fallback, estimator enabled: ".concat(parentEnabled));
        return parentEnabled;
      }
      logger.log('No variation or parent data found, estimator disabled by default');
      return false;
    }

    /**
     * Update the estimator button based on variation
     * @param {boolean} show - Whether to show the button
     * @param {number|string|null} variationId - Variation ID if available
     */
  }, {
    key: "updateEstimatorButton",
    value: function updateEstimatorButton(show) {
      var variationId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      // Find the single estimator button
      var button = document.querySelector('.single_add_to_estimator_button');
      if (!button) {
        logger.log('Estimator button not found');
        return;
      }
      logger.log("Updating button visibility: ".concat(show ? 'show' : 'hide', ", variation ID: ").concat(variationId));
      if (show) {
        // Show the button
        button.style.display = '';

        // Update product ID if variation ID provided
        if (variationId) {
          logger.log("Setting button data-product-id to variation ID: ".concat(variationId));
          button.dataset.productId = variationId;
        }
      } else {
        // Hide the button
        button.style.display = 'none';
        logger.log('Hiding estimator button');
      }
    }

    /**
     * Register an event handler
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     * @returns {VariationHandler} This instance for chaining
     */
  }, {
    key: "on",
    value: function on(event, callback) {
      if (!this.eventHandlers[event]) {
        this.eventHandlers[event] = [];
      }
      this.eventHandlers[event].push(callback);
      return this;
    }

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {*} data - Event data
     * @returns {VariationHandler} This instance for chaining
     */
  }, {
    key: "emit",
    value: function emit(event, data) {
      if (this.eventHandlers[event]) {
        this.eventHandlers[event].forEach(function (callback) {
          return callback(data);
        });
      }
      return this;
    }
  }]);
}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (VariationHandler);

/***/ }),

/***/ "./src/js/frontend/index.js":
/*!**********************************!*\
  !*** ./src/js/frontend/index.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/* harmony import */ var _EstimatorCore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./EstimatorCore */ "./src/js/frontend/EstimatorCore.js");
/* harmony import */ var _ConfirmationDialog__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ConfirmationDialog */ "./src/js/frontend/ConfirmationDialog.js");
/* harmony import */ var _SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./SuggestionsCarousel */ "./src/js/frontend/SuggestionsCarousel.js");
/* harmony import */ var _PrintEstimate__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./PrintEstimate */ "./src/js/frontend/PrintEstimate.js");
/* harmony import */ var _template_loader__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./template-loader */ "./src/js/frontend/template-loader.js");
/* harmony import */ var _ProductDetailsToggle__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ProductDetailsToggle */ "./src/js/frontend/ProductDetailsToggle.js");
/**
 * index.js
 *
 * Main entry point for the Product Estimator plugin.
 * This file initializes the application and loads required modules in the FRONTEND.
 */









// Initialize templates
(0,_template_loader__WEBPACK_IMPORTED_MODULE_5__.initializeTemplates)();
var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.createLogger)('FrontEndIndex');

// Global initialization tracker - defined at the top level
window._productEstimatorInitialized = window._productEstimatorInitialized || false;

// Only set up initialization once
if (!window._setupInitDone) {
  window._setupInitDone = true;

  // Check if the DOM is already loaded
  if (document.readyState === 'loading') {
    // Add event listener if DOM not yet loaded, using {once: true} to ensure it runs only once
    document.addEventListener('DOMContentLoaded', initApp, {
      once: true
    });
  } else {
    // DOM already loaded, initialize immediately
    initApp();
  }
}

/**
 * Initialize the application
 */
function initApp() {
  logger.log('Product Estimator initialization check...');

  // Multiple guard checks - check both global flags
  if (window._productEstimatorInitialized) {
    logger.log('Product Estimator already initialized globally, aborting');
    return;
  }

  // Also check for object existence
  if (window.productEstimator && window.productEstimator.initialized) {
    logger.log('Product Estimator initialized property found, aborting');
    window._productEstimatorInitialized = true;
    return;
  }

  // Mark as initialized IMMEDIATELY before continuing
  window._productEstimatorInitialized = true;
  logger.log('Product Estimator initializing for the first time...');
  try {
    // Setup global handlers (only once)
    setupGlobalEventHandlers();

    // Check for jQuery conflicts
    if (typeof jQuery !== 'undefined') {
      // Store the current jQuery version
      window.productEstimator = window.productEstimator || {};
      window.productEstimator.jQuery = jQuery;
    } else {
      logger.warn('jQuery not detected, some features may not work');
    }

    // Get debug mode from URL parameter or localStorage
    var debugMode = getDebugMode();

    // Ensure DOM is fully loaded
    if (document.readyState === 'complete') {
      // DOM is fully loaded, initialize right away with a minimal delay
      setTimeout(function () {
        return initEstimator(debugMode);
      }, 10);
    } else {
      // DOM content is loaded but resources may still be loading
      // Use a longer delay to ensure everything is ready
      setTimeout(function () {
        return initEstimator(debugMode);
      }, 500);
    }
  } catch (error) {
    logger.error('Error in Product Estimator initialization:', error);
  }
}

/**
 * Initialize the estimator core
 * @param {boolean} debugMode - Whether to enable debug mode
 */
// In index.js (inside initEstimator function)

function initEstimator(debugMode) {
  try {
    // One final check to prevent race conditions
    if (window.productEstimator && window.productEstimator.initialized) {
      logger.log('Product Estimator core already initialized, skipping');
      return;
    }
    logger.log('Initializing EstimatorCore...');

    // Initialize core with configuration
    // This call creates the EstimatorCore.dataService instance internally
    _EstimatorCore__WEBPACK_IMPORTED_MODULE_1__["default"].init({
      debug: debugMode
      // Add any other configuration here
    });

    // Make dialog available globally
    window.productEstimator = window.productEstimator || {};
    window.productEstimator.initialized = true;
    window.productEstimator.core = _EstimatorCore__WEBPACK_IMPORTED_MODULE_1__["default"]; // EstimatorCore instance is stored here
    window.productEstimator.dialog = new _ConfirmationDialog__WEBPACK_IMPORTED_MODULE_2__["default"](); // Initialize dialog

    // Initialize PrintEstimate and make it available globally
    // Get the dataService instance from the initialized EstimatorCore
    var dataServiceInstance = window.productEstimator.core.dataService;
    if (!dataServiceInstance) {
      logger.error("[DataService] instance not found on EstimatorCore. Cannot initialize PrintEstimate.");
      // Optionally return or handle this error case
      return;
    }

    // Pass the dataService instance to the PrintEstimate constructor
    window.productEstimator.printEstimate = new _PrintEstimate__WEBPACK_IMPORTED_MODULE_4__["default"]({
      debug: debugMode
    }, dataServiceInstance);

    // Make ProductDetailsToggle available globally
    window.productEstimator.detailsToggle = _ProductDetailsToggle__WEBPACK_IMPORTED_MODULE_6__["default"]; // Add toggle module to global object

    // Make initSuggestionsCarousels available globally for the toggle functionality
    window.initSuggestionsCarousels = _SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_3__.initSuggestionsCarousels;

    // Initialize toggle functionality explicitly
    initializeProductDetailsToggle();
    logger.log("Product Estimator initialized".concat(debugMode ? ' (debug mode)' : ''));

    // Dispatch an event that initialization is complete
    document.dispatchEvent(new CustomEvent('product_estimator_initialized'));
  } catch (e) {
    logger.error('Error during EstimatorCore initialization:', e);
  }
}
/**
 * Initialize the ProductDetailsToggle functionality
 */
function initializeProductDetailsToggle() {
  try {
    // Attach a global click handler to init toggle on product items
    document.addEventListener('click', function (e) {
      // If clicking an accordion header
      if (e.target.closest('.accordion-header')) {
        // Wait for content to be visible
        setTimeout(function () {
          // Force toggle module to scan for new content
          if (_ProductDetailsToggle__WEBPACK_IMPORTED_MODULE_6__["default"] && typeof _ProductDetailsToggle__WEBPACK_IMPORTED_MODULE_6__["default"].setup === 'function') {
            logger.log('Accordion clicked, reinitializing product details toggle');
            _ProductDetailsToggle__WEBPACK_IMPORTED_MODULE_6__["default"].setup();
          }

          // Also initialize carousels
          if (typeof _SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_3__.initSuggestionsCarousels === 'function') {
            (0,_SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_3__.initSuggestionsCarousels)();
          }
        }, 300);
      }
    });

    // Set up explicit click handlers for toggle buttons
    document.body.addEventListener('click', function (e) {
      // Handle similar products toggle
      if (e.target.closest('.product-details-toggle')) {
        var toggleButton = e.target.closest('.product-details-toggle');
        var productItem = toggleButton.closest('.product-item');
        if (!productItem) return;
        var isExpanded = toggleButton.classList.contains('expanded');
        var similarProductsContainer = productItem.querySelector('.similar-products-container');
        if (!similarProductsContainer) return;

        // Toggle state
        if (isExpanded) {
          // Hide container
          toggleButton.classList.remove('expanded');
          similarProductsContainer.style.display = 'none';
          similarProductsContainer.classList.remove('visible');
          var icon = toggleButton.querySelector('.toggle-icon');
          if (icon) {
            icon.classList.remove('dashicons-arrow-up-alt2');
            icon.classList.add('dashicons-arrow-down-alt2');
          }
        } else {
          // Show container
          toggleButton.classList.add('expanded');
          similarProductsContainer.style.display = 'block';
          similarProductsContainer.classList.add('visible');
          var _icon = toggleButton.querySelector('.toggle-icon');
          if (_icon) {
            _icon.classList.remove('dashicons-arrow-down-alt2');
            _icon.classList.add('dashicons-arrow-up-alt2');
          }

          // Initialize carousels when shown
          if (typeof _SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_3__.initSuggestionsCarousels === 'function') {
            (0,_SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_3__.initSuggestionsCarousels)();
          }
        }
        e.preventDefault();
        e.stopPropagation();
      }

      // Handle notes toggle
      if (e.target.closest('.product-notes-toggle')) {
        var _toggleButton = e.target.closest('.product-notes-toggle');
        var _productItem = _toggleButton.closest('.product-item');
        if (!_productItem) return;
        var _isExpanded = _toggleButton.classList.contains('expanded');
        var notesContainer = _productItem.querySelector('.notes-container');
        if (!notesContainer) return;

        // Toggle state
        if (_isExpanded) {
          // Hide container
          _toggleButton.classList.remove('expanded');
          notesContainer.style.display = 'none';
          notesContainer.classList.remove('visible');
          var _icon2 = _toggleButton.querySelector('.toggle-icon');
          if (_icon2) {
            _icon2.classList.remove('dashicons-arrow-up-alt2');
            _icon2.classList.add('dashicons-arrow-down-alt2');
          }
        } else {
          // Show container
          _toggleButton.classList.add('expanded');
          notesContainer.style.display = 'block';
          notesContainer.classList.add('visible');
          var _icon3 = _toggleButton.querySelector('.toggle-icon');
          if (_icon3) {
            _icon3.classList.remove('dashicons-arrow-down-alt2');
            _icon3.classList.add('dashicons-arrow-up-alt2');
          }
        }
        e.preventDefault();
        e.stopPropagation();
      }

      // Handle includes toggle
      if (e.target.closest('.product-includes-toggle')) {
        var _toggleButton2 = e.target.closest('.product-includes-toggle');
        var _productItem2 = _toggleButton2.closest('.product-item');
        if (!_productItem2) return;
        var _isExpanded2 = _toggleButton2.classList.contains('expanded');
        var includesContainer = _productItem2.querySelector('.includes-container');
        if (!includesContainer) return;

        // Toggle state
        if (_isExpanded2) {
          // Hide container
          _toggleButton2.classList.remove('expanded');
          includesContainer.style.display = 'none';
          includesContainer.classList.remove('visible');
          var _icon4 = _toggleButton2.querySelector('.toggle-icon');
          if (_icon4) {
            _icon4.classList.remove('dashicons-arrow-up-alt2');
            _icon4.classList.add('dashicons-arrow-down-alt2');
          }
        } else {
          // Show container
          _toggleButton2.classList.add('expanded');
          includesContainer.style.display = 'block';
          includesContainer.classList.add('visible');
          var _icon5 = _toggleButton2.querySelector('.toggle-icon');
          if (_icon5) {
            _icon5.classList.remove('dashicons-arrow-down-alt2');
            _icon5.classList.add('dashicons-arrow-up-alt2');
          }
        }
        e.preventDefault();
        e.stopPropagation();
      }

      // Handle suggestions toggle
      if (e.target.closest('.product-suggestions-toggle')) {
        var _toggleButton3 = e.target.closest('.product-suggestions-toggle');
        var accordionContent = _toggleButton3.closest('.accordion-content');
        if (!accordionContent) return;
        var _isExpanded3 = _toggleButton3.classList.contains('expanded');
        var suggestionsContainer = accordionContent.querySelector('.suggestions-container');
        if (!suggestionsContainer) return;

        // Toggle state
        if (_isExpanded3) {
          // Hide container
          _toggleButton3.classList.remove('expanded');
          suggestionsContainer.style.display = 'none';
          suggestionsContainer.classList.remove('visible');
          var _icon6 = _toggleButton3.querySelector('.toggle-icon');
          if (_icon6) {
            _icon6.classList.remove('dashicons-arrow-up-alt2');
            _icon6.classList.add('dashicons-arrow-down-alt2');
          }
        } else {
          // Show container
          _toggleButton3.classList.add('expanded');
          suggestionsContainer.style.display = 'block';
          suggestionsContainer.classList.add('visible');
          var _icon7 = _toggleButton3.querySelector('.toggle-icon');
          if (_icon7) {
            _icon7.classList.remove('dashicons-arrow-down-alt2');
            _icon7.classList.add('dashicons-arrow-up-alt2');
          }

          // Initialize carousels when shown
          if (typeof _SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_3__.initSuggestionsCarousels === 'function') {
            (0,_SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_3__.initSuggestionsCarousels)();
          }
        }
        e.preventDefault();
        e.stopPropagation();
      }
    });
    logger.log('[ProductDetailsToggle] initialization complete');
  } catch (error) {
    logger.error('Error initializing ProductDetailsToggle:', error);
  }
}

/**
 * Track global handlers with a dedicated flag
 */
var globalHandlersAdded = false;

/**
 * Setup global event handlers (ensures they're only added once)
 */
function setupGlobalEventHandlers() {
  // Only run once
  if (globalHandlersAdded) {
    logger.log('Global event handlers already added, skipping');
    return;
  }
  logger.log('Setting up global event handlers...');

  // Create and store handler reference
  window._productEstimatorCloseHandler = function (e) {
    if (e.target.closest('.product-estimator-modal-close') || e.target.classList.contains('product-estimator-modal-overlay')) {
      logger.log('Global close handler triggered');

      // Find the modal
      var modal = document.querySelector('#product-estimator-modal');
      if (modal) {
        // Hide it directly as a fallback approach
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');

        // Also try to notify the core
        if (window.productEstimator && window.productEstimator.core) {
          window.productEstimator.core.closeModal();
        }
      }
    }
  };

  // Remove any existing handler first (important!)
  document.removeEventListener('click', window._productEstimatorCloseHandler);
  // Add the handler
  document.addEventListener('click', window._productEstimatorCloseHandler);
  globalHandlersAdded = true;
  logger.log('Global event handlers added');
}

/**
 * Check if debug mode should be enabled
 * @returns {boolean} Whether debug mode is enabled
 */
function getDebugMode() {
  // Check URL parameters first
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('product_estimator_debug')) {
    var enabled = urlParams.get('product_estimator_debug') !== 'false';

    // Store in localStorage for future page loads
    if (enabled) {
      localStorage.setItem('product_estimator_debug', 'true');
    } else {
      localStorage.removeItem('product_estimator_debug');
    }
    return enabled;
  }

  // Check localStorage
  return localStorage.getItem('product_estimator_debug') === 'true';
}

// Export the core for potential external access
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_EstimatorCore__WEBPACK_IMPORTED_MODULE_1__["default"]);

/***/ }),

/***/ "./src/js/frontend/managers/EstimateManager.js":
/*!*****************************************************!*\
  !*** ./src/js/frontend/managers/EstimateManager.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/* harmony import */ var _EstimateStorage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../EstimateStorage */ "./src/js/frontend/EstimateStorage.js");
/* harmony import */ var _CustomerStorage__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../CustomerStorage */ "./src/js/frontend/CustomerStorage.js");
/* harmony import */ var _TemplateEngine__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../TemplateEngine */ "./src/js/frontend/TemplateEngine.js");


/**
 * EstimateManager.js
 *
 * Handles all operations related to estimates:
 * - Loading and displaying the estimates list
 * - Creating new estimates
 * - Removing estimates
 * - Updating estimate UI
 */





var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.createLogger)('EstimateManager');
var EstimateManager = /*#__PURE__*/function () {
  /**
   * Initialize the EstimateManager
   * @param {object} config - Configuration options
   * @param {object} dataService - The data service instance
   * @param {object} modalManager - Reference to the parent modal manager
   */
  function EstimateManager() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var dataService = arguments.length > 1 ? arguments[1] : undefined;
    var modalManager = arguments.length > 2 ? arguments[2] : undefined;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, EstimateManager);
    this.config = config;
    this.dataService = dataService;
    this.modalManager = modalManager;

    // References to DOM elements (can be accessed via modalManager)
    this.estimatesList = null;
    this.estimateSelection = null;
    this.newEstimateForm = null;

    // State
    this.currentProductId = null;

    // Bind methods to preserve 'this' context
    this.handleProductFlow = this.handleProductFlow.bind(this);
    this.showEstimatesList = this.showEstimatesList.bind(this);
    this.loadEstimatesList = this.loadEstimatesList.bind(this);
    this.showNewEstimateForm = this.showNewEstimateForm.bind(this);
    this.handleEstimateRemoval = this.handleEstimateRemoval.bind(this);
    this.updateEstimate = this.updateEstimate.bind(this);
    this.bindEstimateSelectionFormEvents = this.bindEstimateSelectionFormEvents.bind(this);
    this.onModalClosed = this.onModalClosed.bind(this);
  }

  /**
   * Initialize the estimate manager
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(EstimateManager, [{
    key: "init",
    value: function init() {
      // Get references to DOM elements from the modal manager
      this.estimatesList = this.modalManager.estimatesList;
      this.estimateSelection = this.modalManager.estimateSelection;
      this.newEstimateForm = this.modalManager.newEstimateForm;
      this.bindEvents();
      logger.log('EstimateManager initialized');
    }

    /**
     * Bind event listeners related to estimates
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      // We'll implement this later when we move the estimate-specific bindings
      logger.log('EstimateManager events bound');
    }

    /**
     * Hide all modal sections to ensure only one section is visible at a time
     */
  }, {
    key: "hideAllSections",
    value: function hideAllSections() {
      var _this = this;
      logger.log('Hiding all sections');

      // Get references to all section containers
      var viewContainers = [this.modalManager.estimatesList, this.modalManager.estimateSelection, this.modalManager.roomSelectionForm, this.modalManager.newEstimateForm, this.modalManager.newRoomForm];

      // Hide each container
      viewContainers.forEach(function (container) {
        if (container && _this.modalManager.uiManager) {
          _this.modalManager.uiManager.hideElement(container);
        } else if (container) {
          container.style.display = 'none';
        }
      });
    }

    /**
     * Handle the product flow in the modal
     * This is called from ModalManager.openModal when productId is provided
     * @param {string} productId - The product ID to add
     */
  }, {
    key: "handleProductFlow",
    value: function handleProductFlow(productId) {
      var _this2 = this;
      logger.log('Handling product flow with ID:', productId);
      this.currentProductId = productId;

      // Show loading indicator
      this.modalManager.showLoading();

      // Check if estimates exist using DataService
      this.dataService.checkEstimatesExist().then(function (hasEstimates) {
        logger.log('Has estimates check result:', hasEstimates);
        if (hasEstimates) {
          // Estimates exist, show estimate selection view
          logger.log('Estimates found, showing estimate selection.');
          _this2.showEstimateSelection(productId);
        } else {
          // No estimates, show new estimate form
          logger.log('No estimates found, showing new estimate form.');
          _this2.showNewEstimateForm(productId);
        }
      })["catch"](function (error) {
        logger.error('Error checking estimates:', error);

        // Show error message in the modal
        if (_this2.modalManager.contentContainer) {
          _TemplateEngine__WEBPACK_IMPORTED_MODULE_5__["default"].showMessage('Error checking estimates. Please try again.', 'error', _this2.modalManager.contentContainer);
        }

        // Hide loading indicator
        _this2.modalManager.hideLoading();
      });
    }

    /**
     * Show the estimate selection view
     * @param {string} productId - The product ID to add after selection
     */
  }, {
    key: "showEstimateSelection",
    value: function showEstimateSelection(productId) {
      logger.log('Showing estimate selection with product ID:', productId);

      // Get DOM references from modal manager
      var contentContainer = this.modalManager.contentContainer;
      var estimateSelectionWrapper = this.modalManager.estimateSelection;

      // Hide all other sections first
      this.hideAllSections();
      if (!estimateSelectionWrapper) {
        logger.error('Estimate selection wrapper not found in modal');
        this.modalManager.hideLoading();
        this.modalManager.showError('Modal structure incomplete. Please contact support.');
        return;
      }

      // Use ModalManager's utility to ensure the element is visible
      this.modalManager.forceElementVisibility(estimateSelectionWrapper);

      // Use TemplateEngine to insert the template
      try {
        // Clear existing content first in case it was loaded before
        estimateSelectionWrapper.innerHTML = '';
        _TemplateEngine__WEBPACK_IMPORTED_MODULE_5__["default"].insert('estimate-selection-template', {}, estimateSelectionWrapper);
        logger.log('Estimate selection template inserted into wrapper.');

        // Find the form wrapper
        var formWrapper = estimateSelectionWrapper.querySelector('#estimate-selection-form-wrapper');
        if (formWrapper) {
          // Make form wrapper visible
          this.modalManager.forceElementVisibility(formWrapper);

          // Find the actual form element
          var formElement = formWrapper.querySelector('form');
          if (formElement) {
            logger.log('Estimate selection form element found after template insertion, populating dropdown and binding events.');

            // Load estimates data and bind events
            this.loadEstimatesData(formElement, productId);
            this.bindEstimateSelectionFormEvents(formElement, productId);
          } else {
            logger.error('Form element not found inside the template after insertion!');
            this.modalManager.showError('Error rendering form template. Please try again.');
            this.modalManager.hideLoading();
          }
        } else {
          logger.error('Estimate selection form wrapper not found in template!');
          this.modalManager.showError('Modal structure incomplete. Please contact support.');
          this.modalManager.hideLoading();
        }
      } catch (error) {
        logger.error('Error inserting estimate selection template:', error);
        this.modalManager.showError('Error loading selection form template. Please try again.');
        this.modalManager.hideLoading();
      }
    }

    /**
     * Load estimates data into the selection form
     * @param {HTMLFormElement} formElement - The form element
     * @param {string} productId - The product ID to add after selection
     */
  }, {
    key: "loadEstimatesData",
    value: function loadEstimatesData(formElement, productId) {
      var _this3 = this;
      logger.log('Loading estimates data for selection form');
      var selectElement = formElement.querySelector('select');
      if (!selectElement) {
        logger.error('Select element not found in form');
        this.modalManager.hideLoading();
        return;
      }

      // Store product ID as a data attribute on the form
      formElement.dataset.productId = productId;

      // Load estimates from storage or API
      this.dataService.getEstimatesData().then(function (estimates) {
        // Clear existing options
        selectElement.innerHTML = '';

        // Add default option
        var defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Select an estimate --';
        selectElement.appendChild(defaultOption);

        // Add options for each estimate
        if (estimates && estimates.length > 0) {
          estimates.forEach(function (estimate) {
            var option = document.createElement('option');
            option.value = estimate.id;
            option.textContent = estimate.name || "Estimate #".concat(estimate.id);
            selectElement.appendChild(option);
          });

          // Enable the select element and form buttons
          selectElement.disabled = false;
          var submitButton = formElement.querySelector('button[type="submit"]');
          if (submitButton) submitButton.disabled = false;
        } else {
          // No estimates available, show message
          var option = document.createElement('option');
          option.value = '';
          option.textContent = 'No estimates available';
          selectElement.appendChild(option);

          // Disable the select element and form buttons
          selectElement.disabled = true;
          var _submitButton = formElement.querySelector('button[type="submit"]');
          if (_submitButton) _submitButton.disabled = true;
        }
        _this3.modalManager.hideLoading();
      })["catch"](function (error) {
        logger.error('Error loading estimates:', error);
        _this3.modalManager.showError('Error loading estimates. Please try again.');
        _this3.modalManager.hideLoading();
      });
    }

    /**
     * Bind events to the estimate selection form
     * @param {HTMLFormElement} formElement - The form element
     * @param {string} productId - The product ID to add after selection
     */
  }, {
    key: "bindEstimateSelectionFormEvents",
    value: function bindEstimateSelectionFormEvents(formElement, productId) {
      var _this4 = this;
      logger.log('Binding events to estimate selection form');
      if (!formElement) {
        logger.error('Form element not available for binding events');
        return;
      }

      // Remove any existing event listeners to prevent duplicates
      if (formElement._submitHandler) {
        formElement.removeEventListener('submit', formElement._submitHandler);
      }

      // Create new submit handler
      formElement._submitHandler = function (e) {
        e.preventDefault();

        // Show loading indicator
        _this4.modalManager.showLoading();

        // Get the selected estimate ID
        var selectElement = formElement.querySelector('select');
        var estimateId = selectElement.value;
        if (!estimateId) {
          _this4.modalManager.showError('Please select an estimate.');
          _this4.modalManager.hideLoading();
          return;
        }

        // Delegate to the RoomManager to show room selection form
        if (_this4.modalManager.roomManager) {
          _this4.modalManager.roomManager.showRoomSelectionForm(estimateId, productId);
        } else {
          logger.error('RoomManager not available for showRoomSelectionForm');
          _this4.modalManager.hideLoading();
        }
      };

      // Add the submit handler
      formElement.addEventListener('submit', formElement._submitHandler);

      // Add event handler for "Create New Estimate" button (with id="create-estimate-btn")
      var newEstimateButton = formElement.querySelector('#create-estimate-btn');
      if (newEstimateButton) {
        if (newEstimateButton._clickHandler) {
          newEstimateButton.removeEventListener('click', newEstimateButton._clickHandler);
        }
        newEstimateButton._clickHandler = function (e) {
          e.preventDefault();
          _this4.showNewEstimateForm(productId);
        };
        newEstimateButton.addEventListener('click', newEstimateButton._clickHandler);
      }

      // Add event handler for cancel button
      var cancelButton = formElement.querySelector('.cancel-button');
      if (cancelButton) {
        if (cancelButton._clickHandler) {
          cancelButton.removeEventListener('click', cancelButton._clickHandler);
        }
        cancelButton._clickHandler = function (e) {
          e.preventDefault();
          _this4.modalManager.closeModal();
        };
        cancelButton.addEventListener('click', cancelButton._clickHandler);
      }
    }

    /**
     * Show the estimates list view
     * This is called from ModalManager.openModal when no productId is provided or forceListView is true
     * @param {string|null} expandEstimateId - Optional estimate ID to expand after loading
     * @param {string|null} expandRoomId - Optional room ID to expand after loading
     */
  }, {
    key: "showEstimatesList",
    value: function showEstimatesList() {
      var _this5 = this;
      var expandEstimateId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var expandRoomId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      logger.log('Showing estimates list view', {
        expandEstimateId: expandEstimateId,
        expandRoomId: expandRoomId
      });

      // Get the estimates list container from the modal manager
      var estimatesList = this.modalManager.estimatesList;
      if (!estimatesList) {
        logger.error('Estimates list container not found in modal');
        this.modalManager.hideLoading();
        this.modalManager.showError('Modal structure incomplete. Please contact support.');
        return;
      }

      // Hide all other sections first
      this.hideAllSections();

      // Use ModalManager's utility to ensure the element is visible
      this.modalManager.forceElementVisibility(estimatesList);

      // Load and render the estimates list content first, then bind event handlers
      this.loadEstimatesList(expandRoomId, expandEstimateId).then(function () {
        // Bind event handlers to the estimates list container AFTER the content is loaded and rendered
        _this5.bindEstimateListEventHandlers();
      })["catch"](function (error) {
        logger.error('Error loading estimates list:', error);
        if (estimatesList) {
          _TemplateEngine__WEBPACK_IMPORTED_MODULE_5__["default"].showMessage('Error loading estimates. Please try again.', 'error', estimatesList);
        } else {
          _this5.modalManager.showError('Error loading estimates. Please try again.');
        }
      })["finally"](function () {
        _this5.modalManager.hideLoading();
      });
    }

    /**
     * Bind event handlers to the estimates list
     */
  }, {
    key: "bindEstimateListEventHandlers",
    value: function bindEstimateListEventHandlers() {
      var _this6 = this;
      logger.log('Binding event handlers to estimates list');
      var estimatesList = this.modalManager.estimatesList;
      if (!estimatesList) {
        logger.error('Estimates list container not found for binding events');
        return;
      }

      // Use event delegation for handling clicks within the estimates list
      if (estimatesList._clickHandler) {
        logger.log('Removing existing click handler from estimates list');
        estimatesList.removeEventListener('click', estimatesList._clickHandler);
      }
      logger.log('Adding click handler to estimates list');
      estimatesList._clickHandler = function (e) {
        // Process click events on the estimates list

        // Handle "Create New Estimate" button
        if (e.target.closest('#create-estimate-btn')) {
          e.preventDefault();
          console.log('Create New Estimate button clicked');
          _this6.showNewEstimateForm();
          return;
        }

        // Handle estimate removal
        var removeEstimateBtn = e.target.closest('.remove-estimate');
        if (removeEstimateBtn) {
          e.preventDefault();
          e.stopPropagation(); // Critical: Prevent event from bubbling to the header

          // Get estimate ID from the button directly
          var estimateId = removeEstimateBtn.getAttribute('data-estimate-id');
          if (estimateId) {
            _this6.handleEstimateRemoval(estimateId);
          } else {
            // Fallback if somehow the button doesn't have an ID
            var estimateElement = removeEstimateBtn.closest('.estimate-section');
            if (estimateElement && estimateElement.dataset.estimateId) {
              var sectionEstimateId = estimateElement.dataset.estimateId;
              _this6.handleEstimateRemoval(sectionEstimateId);
            } else {
              logger.error('Could not find estimate ID for removal');
            }
          }
          return;
        }

        // Handle print estimate
        if (e.target.closest('.print-estimate')) {
          e.preventDefault();
          var _estimateId = e.target.closest('.print-estimate').dataset.estimateId;
          if (_estimateId) {
            logger.log('Print estimate clicked for ID:', _estimateId);
            // Call the appropriate print function (to be implemented)
          }
          return;
        }

        // Handle request contact
        if (e.target.closest('.request-contact-estimate')) {
          e.preventDefault();
          var _estimateId2 = e.target.closest('.request-contact-estimate').dataset.estimateId;
          if (_estimateId2) {
            logger.log('Request contact clicked for ID:', _estimateId2);
            // Handle the contact request (to be implemented)
          }
          return;
        }

        // Handle request copy
        if (e.target.closest('.request-a-copy')) {
          e.preventDefault();
          var _estimateId3 = e.target.closest('.request-a-copy').dataset.estimateId;
          if (_estimateId3) {
            logger.log('Request copy clicked for ID:', _estimateId3);
            // Handle the copy request (to be implemented)
          }
          return;
        }

        // Handle add room button
        if (e.target.closest('.add-room')) {
          e.preventDefault();
          var _estimateId4 = e.target.closest('.add-room').dataset.estimateId;
          if (_estimateId4) {
            logger.log('Add room clicked for estimate ID:', _estimateId4);
            // Call the appropriate function to show the add room form
            if (_this6.modalManager.roomManager) {
              _this6.modalManager.roomManager.showNewRoomForm(_estimateId4);
            }
          }
          return;
        }

        // Handle accordion toggle for estimate details
        if (e.target.closest('.estimate-header')) {
          // First check if we clicked on any buttons or links inside the header
          // We don't want to expand/collapse when clicking buttons
          if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.remove-estimate')) {
            return; // Do nothing, let the button's own handler work
          }
          logger.log('Toggling estimate accordion');
          var header = e.target.closest('.estimate-header');
          var _estimateElement = header.closest('.estimate-section');
          var content = _estimateElement.querySelector('.estimate-content');
          if (content) {
            // Toggle the expanded state
            var isExpanded = _estimateElement.classList.contains('expanded');
            if (isExpanded) {
              _estimateElement.classList.remove('expanded');
              _estimateElement.classList.add('collapsed');
              content.style.display = 'none';
            } else {
              _estimateElement.classList.remove('collapsed');
              _estimateElement.classList.add('expanded');
              content.style.display = 'block';

              // If this is the first time expanding, load the rooms
              if (_estimateElement.dataset.estimateId && !content.dataset.loaded) {
                content.dataset.loaded = 'true';

                // Delegate to RoomManager to load rooms for this estimate
                if (_this6.modalManager.roomManager) {
                  _this6.modalManager.roomManager.loadRoomsForEstimate(_estimateElement.dataset.estimateId, content, null, false);
                }
              }
            }
          }
          return;
        }
      };
      logger.log('Attaching click event listener to estimates list');
      estimatesList.addEventListener('click', estimatesList._clickHandler);
    }

    /**
     * Load and display all estimates
     * @param {string|null} expandRoomId - Optional room ID to expand after loading
     * @param {string|null} expandEstimateId - Optional estimate ID to expand after loading
     * @returns {Promise} - Promise that resolves when estimates are loaded
     */
  }, {
    key: "loadEstimatesList",
    value: function loadEstimatesList() {
      var _this7 = this;
      var expandRoomId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var expandEstimateId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      logger.log('Loading estimates list', {
        expandRoomId: expandRoomId,
        expandEstimateId: expandEstimateId
      });
      var estimatesList = this.modalManager.estimatesList;
      if (!estimatesList) {
        return Promise.reject(new Error('Estimates list container not found'));
      }

      // Show loading indicator
      this.modalManager.showLoading();

      // If we have an expandEstimateId, force a refresh of the cache
      if (expandEstimateId) {
        this.dataService.refreshEstimatesCache();
      }

      // Load estimates from storage or API
      return this.dataService.getEstimatesData(true) // Force bypass cache
      .then(function (estimates) {
        // Clear existing content
        estimatesList.innerHTML = '';
        if (!estimates || estimates.length === 0) {
          // No estimates, show empty state using template
          _TemplateEngine__WEBPACK_IMPORTED_MODULE_5__["default"].insert('estimates-empty-template', {}, estimatesList);
          return;
        }

        // Render each estimate using the estimate-item template
        estimates.forEach(function (estimate) {
          // Prepare the data for the template
          var estimateData = {
            id: estimate.id,
            name: estimate.name || "Estimate #".concat(estimate.id),
            min_total: estimate.min_total || 0,
            max_total: estimate.max_total || 0
          };

          // Use TemplateEngine to create and insert the estimate item
          _TemplateEngine__WEBPACK_IMPORTED_MODULE_5__["default"].insert('estimate-item-template', estimateData, estimatesList);

          // Now find the estimate section we just inserted and set ALL the data-estimate-id attributes
          var estimateSections = estimatesList.querySelectorAll('.estimate-section');
          // Get the most recently added one (the last one in the list)
          var estimateElement = estimateSections[estimateSections.length - 1];
          if (estimateElement) {
            // 1. Set data-estimate-id on the estimate section element
            estimateElement.setAttribute('data-estimate-id', estimate.id);

            // 2. Set data-estimate-id on the remove button
            var removeButton = estimateElement.querySelector('.remove-estimate');
            if (removeButton) {
              removeButton.setAttribute('data-estimate-id', estimate.id);
              console.log('Set data-estimate-id on remove button:', removeButton);
            } else {
              console.warn('Remove button not found in estimate element');
            }

            // 3. Set data-estimate-id on all other elements that need it
            var elementsWithDataAttr = estimateElement.querySelectorAll('[data-estimate-id]');
            elementsWithDataAttr.forEach(function (element) {
              element.setAttribute('data-estimate-id', estimate.id);
            });

            // 4. Also set on add-room button specifically
            var addRoomButton = estimateElement.querySelector('.add-room');
            if (addRoomButton) {
              addRoomButton.setAttribute('data-estimate-id', estimate.id);
            }

            // 5. And all other action buttons
            var actionButtons = estimateElement.querySelectorAll('.estimate-actions a');
            actionButtons.forEach(function (button) {
              button.setAttribute('data-estimate-id', estimate.id);
            });
          }
        });

        // If expandEstimateId is provided, expand that estimate
        if (expandEstimateId) {
          var estimateToExpand = estimatesList.querySelector(".estimate-section[data-estimate-id=\"".concat(expandEstimateId, "\"]"));
          if (estimateToExpand) {
            var header = estimateToExpand.querySelector('.estimate-header');
            var content = estimateToExpand.querySelector('.estimate-content');
            if (header && content) {
              estimateToExpand.classList.remove('collapsed');
              estimateToExpand.classList.add('expanded');
              content.style.display = 'block';
              content.dataset.loaded = 'true';

              // Delegate to RoomManager to load rooms for this estimate
              // Pass bypassCache=true when expanding to ensure fresh data
              if (_this7.modalManager.roomManager) {
                _this7.modalManager.roomManager.loadRoomsForEstimate(expandEstimateId, content, expandRoomId, true);
              }
            }
          }
        }
      })["finally"](function () {
        _this7.modalManager.hideLoading();
      });
    }

    /**
     * Show the new estimate form
     * @param {string|null} productId - Optional product ID to add to the new estimate
     */
  }, {
    key: "showNewEstimateForm",
    value: function showNewEstimateForm() {
      var productId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      logger.log('Showing new estimate form', {
        productId: productId
      });

      // Get the new estimate form container from the modal manager
      var newEstimateForm = this.modalManager.newEstimateForm;
      if (!newEstimateForm) {
        logger.error('New estimate form container not found in modal');
        this.modalManager.showError('Modal structure incomplete. Please contact support.');
        this.modalManager.hideLoading();
        return;
      }

      // Hide all other sections first
      this.hideAllSections();

      // Use ModalManager's utility to ensure the element is visible
      this.modalManager.forceElementVisibility(newEstimateForm);

      // Show loading indicator while we prepare the form
      this.modalManager.showLoading();

      // Use TemplateEngine to insert the template
      try {
        // Clear existing content first in case it was loaded before
        newEstimateForm.innerHTML = '';
        _TemplateEngine__WEBPACK_IMPORTED_MODULE_5__["default"].insert('new-estimate-form-template', {}, newEstimateForm);
        logger.log('New estimate form template inserted into wrapper.');

        // Find the form element
        var formElement = newEstimateForm.querySelector('form');
        if (formElement) {
          // Store product ID as a data attribute on the form if provided
          if (productId) {
            formElement.dataset.productId = productId;
          } else {
            delete formElement.dataset.productId;
          }

          // Delegate form binding to the FormManager
          if (this.modalManager.formManager) {
            this.modalManager.formManager.bindNewEstimateFormEvents(formElement, productId);
          } else {
            logger.error('FormManager not available for bindNewEstimateFormEvents');
          }
          this.modalManager.hideLoading();
        } else {
          logger.error('Form element not found inside the template after insertion!');
          this.modalManager.showError('Error rendering form template. Please try again.');
          this.modalManager.hideLoading();
        }
      } catch (error) {
        logger.error('Error inserting new estimate form template:', error);
        this.modalManager.showError('Error loading form template. Please try again.');
        this.modalManager.hideLoading();
      }
    }

    /**
     * Handle estimate removal
     * @param {string} estimateId - The estimate ID to remove
     */
  }, {
    key: "handleEstimateRemoval",
    value: function handleEstimateRemoval(estimateId) {
      var _this8 = this;
      // Check if ConfirmationDialog is available through ModalManager
      if (!this.modalManager || !this.modalManager.confirmationDialog) {
        logger.error('ConfirmationDialog not available');
        return;
      }

      // Show the confirmation dialog using the standardized dialog helper
      (0,_utils__WEBPACK_IMPORTED_MODULE_2__.showDeleteConfirmDialog)(this.modalManager, 'Are you sure you want to remove this estimate? This action cannot be undone.', function () {
        // User confirmed, remove the estimate
        logger.log('Confirm button clicked, proceeding with estimate removal');
        _this8.modalManager.showLoading();
        _this8.dataService.removeEstimate(estimateId).then(function () {
          // Find the estimate element in the DOM and remove it
          var estimatesList = _this8.modalManager.estimatesList;
          if (estimatesList) {
            var estimateElement = estimatesList.querySelector(".estimate-section[data-estimate-id=\"".concat(estimateId, "\"]"));
            if (estimateElement) {
              estimateElement.remove();

              // Check if there are any estimates left
              if (estimatesList.querySelectorAll('.estimate-section').length === 0) {
                // No estimates left, show empty state
                estimatesList.innerHTML = '';
                _TemplateEngine__WEBPACK_IMPORTED_MODULE_5__["default"].insert('estimates-empty-template', {}, estimatesList);
              }
            }
          }
          logger.log('Showing success dialog');
          // Show success message using the standardized dialog helper
          (0,_utils__WEBPACK_IMPORTED_MODULE_2__.showSuccessDialog)(_this8.modalManager, 'The estimate has been removed successfully.', 'estimate', function () {
            return logger.log('Success dialog closed');
          });
        })["catch"](function (error) {
          logger.error('Error removing estimate:', error);

          // Show error through the standardized dialog helper
          (0,_utils__WEBPACK_IMPORTED_MODULE_2__.showErrorDialog)(_this8.modalManager, 'There was a problem removing the estimate. Please try again.', 'estimate', function () {
            return logger.log('Error dialog closed');
          });
        })["finally"](function () {
          _this8.modalManager.hideLoading();
        });
      }, 'estimate', function () {
        // User cancelled, do nothing
        logger.log('Estimate removal cancelled by user');
      }, 'Remove Estimate');
    }

    /**
     * Update an estimate's details
     * @param {string} estimateId - The estimate ID to update
     * @param {object} updateData - The data to update
     * @returns {Promise} - Promise that resolves when update is complete
     */
  }, {
    key: "updateEstimate",
    value: function updateEstimate(estimateId, updateData) {
      var _this9 = this;
      logger.log('Updating estimate', {
        estimateId: estimateId,
        updateData: updateData
      });

      // Show loading indicator
      this.modalManager.showLoading();
      return this.dataService.updateEstimate(estimateId, updateData).then(function (updatedEstimate) {
        logger.log('Estimate updated successfully:', updatedEstimate);

        // Reload the estimates list to reflect the changes
        return _this9.loadEstimatesList(null, estimateId);
      })["catch"](function (error) {
        logger.error('Error updating estimate:', error);
        _this9.modalManager.showError('Error updating estimate. Please try again.');
        throw error;
      })["finally"](function () {
        _this9.modalManager.hideLoading();
      });
    }

    /**
     * Called when the modal is closed
     */
  }, {
    key: "onModalClosed",
    value: function onModalClosed() {
      logger.log('EstimateManager: Modal closed');
      // Clean up any resources or state as needed
      this.currentProductId = null;
    }
  }]);
}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EstimateManager);

/***/ }),

/***/ "./src/js/frontend/managers/FormManager.js":
/*!*************************************************!*\
  !*** ./src/js/frontend/managers/FormManager.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/* harmony import */ var _EstimateStorage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../EstimateStorage */ "./src/js/frontend/EstimateStorage.js");
/* harmony import */ var _CustomerStorage__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../CustomerStorage */ "./src/js/frontend/CustomerStorage.js");
/* harmony import */ var _TemplateEngine__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../TemplateEngine */ "./src/js/frontend/TemplateEngine.js");


/**
 * FormManager.js
 *
 * Handles all operations related to forms:
 * - Binding form events
 * - Form submission handling
 * - Form validation
 * - Form cancellation
 */





var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.createLogger)('FormManager');
var FormManager = /*#__PURE__*/function () {
  /**
   * Initialize the FormManager
   * @param {object} config - Configuration options
   * @param {object} dataService - The data service instance
   * @param {object} modalManager - Reference to the parent modal manager
   */
  function FormManager() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var dataService = arguments.length > 1 ? arguments[1] : undefined;
    var modalManager = arguments.length > 2 ? arguments[2] : undefined;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, FormManager);
    this.config = config;
    this.dataService = dataService;
    this.modalManager = modalManager;

    // State
    this.currentForm = null;

    // Bind methods to preserve 'this' context
    this.bindNewEstimateFormEvents = this.bindNewEstimateFormEvents.bind(this);
    this.bindNewRoomFormEvents = this.bindNewRoomFormEvents.bind(this);
    this.loadEstimateSelectionForm = this.loadEstimateSelectionForm.bind(this);
    this.cancelForm = this.cancelForm.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.showError = this.showError.bind(this);
    this.clearErrors = this.clearErrors.bind(this);
    this.onModalClosed = this.onModalClosed.bind(this);
  }

  /**
   * Initialize the form manager
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(FormManager, [{
    key: "init",
    value: function init() {
      logger.log('FormManager initialized');
    }

    /**
     * Bind events to the new estimate form
     * @param {HTMLElement} formElement - The form element
     * @param {string|null} productId - Optional product ID
     */
  }, {
    key: "bindNewEstimateFormEvents",
    value: function bindNewEstimateFormEvents(formElement) {
      var _this = this;
      var productId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      logger.log('Binding events to new estimate form', {
        productId: productId
      });
      if (!formElement) {
        logger.error('Form element not available for binding events');
        return;
      }

      // Store current form reference
      this.currentForm = formElement;

      // Store product ID as a data attribute on the form if provided
      if (productId) {
        formElement.dataset.productId = productId;
      } else {
        delete formElement.dataset.productId;
      }

      // Remove any existing event listeners to prevent duplicates
      if (formElement._submitHandler) {
        formElement.removeEventListener('submit', formElement._submitHandler);
      }

      // Create new submit handler
      formElement._submitHandler = function (e) {
        e.preventDefault();

        // Clear any previous errors
        _this.clearErrors(formElement);

        // Validate the form
        if (!_this.validateForm(formElement)) {
          logger.log('Form validation failed - stopping form submission');
          e.stopPropagation(); // Ensure event doesn't propagate
          return false; // Explicit false return to stop submission
        }

        // Show loading
        if (_this.modalManager) {
          _this.modalManager.showLoading();
        }

        // Get form data
        var formData = new FormData(formElement);
        var estimateName = formData.get('estimate_name');

        // Create the estimate
        _this.dataService.addNewEstimate({
          estimate_name: estimateName
        }).then(function (newEstimate) {
          logger.log('Estimate created successfully:', newEstimate);

          // If a product ID is provided, we need to add it to a room
          if (productId) {
            var estimateId = newEstimate.estimate_id;
            if (!estimateId) {
              logger.error('No estimate ID returned from server. Cannot create room.');
              _this.modalManager.hideLoading();
              _this.showPartialSuccessMessage('Estimate created successfully, but there was an error adding a room.');
              return;
            }

            // Show room creation form for the new estimate
            if (_this.modalManager && _this.modalManager.roomManager) {
              logger.log('Transitioning to new room form with estimate ID:', estimateId);
              _this.modalManager.roomManager.showNewRoomForm(estimateId, productId);
            } else {
              logger.error('RoomManager not available for showNewRoomForm');
              // Hide loading and show success message
              if (_this.modalManager) {
                _this.modalManager.hideLoading();
              }
              _this.showSuccessMessage('Estimate created successfully.');
            }
          } else {
            // No product ID, just show the estimates list
            var _estimateId = newEstimate.estimate_id;
            if (!_estimateId) {
              logger.error('No estimate ID returned from server. Cannot show estimate.');
              _this.modalManager.hideLoading();
              _this.showSuccessMessage('Estimate created successfully.');
              return;
            }
            if (_this.modalManager && _this.modalManager.estimateManager) {
              logger.log('Transitioning to estimates list with estimate ID:', _estimateId);
              _this.modalManager.estimateManager.showEstimatesList(null, _estimateId);
            } else {
              // Hide loading and show success message
              if (_this.modalManager) {
                _this.modalManager.hideLoading();
              }
              _this.showSuccessMessage('Estimate created successfully.');
            }
          }
        })["catch"](function (error) {
          logger.error('Error creating estimate:', error);

          // Show error
          _this.showError(formElement, 'Error creating estimate. Please try again.');

          // Hide loading
          if (_this.modalManager) {
            _this.modalManager.hideLoading();
          }
        });
      };

      // Add the submit handler
      formElement.addEventListener('submit', formElement._submitHandler);

      // Bind cancel button (using the class in the template: cancel-btn)
      var cancelButton = formElement.querySelector('.cancel-btn, .cancel-button');
      if (cancelButton) {
        if (cancelButton._clickHandler) {
          cancelButton.removeEventListener('click', cancelButton._clickHandler);
        }
        cancelButton._clickHandler = function (e) {
          e.preventDefault();
          logger.log('Cancel button clicked in new estimate form');
          _this.cancelForm('estimate');
        };
        cancelButton.addEventListener('click', cancelButton._clickHandler);
        logger.log('Cancel button handler attached to new estimate form');
      } else {
        logger.log('Cancel button not found in new estimate form');
        logger.log('Form element structure:', formElement.innerHTML);
      }
    }

    /**
     * Bind events to the new room form
     * @param {HTMLElement} formElement - The form element
     * @param {string} estimateId - The estimate ID
     * @param {string|null} productId - Optional product ID
     */
  }, {
    key: "bindNewRoomFormEvents",
    value: function bindNewRoomFormEvents(formElement, estimateId) {
      var _this2 = this;
      var productId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      logger.log('Binding events to new room form', {
        estimateId: estimateId,
        productId: productId
      });
      if (!formElement) {
        logger.error('Form element not available for binding events');
        return;
      }

      // Store current form reference
      this.currentForm = formElement;

      // Store estimate ID and product ID as data attributes on the form
      formElement.dataset.estimateId = estimateId;
      if (productId) {
        formElement.dataset.productId = productId;
      } else {
        delete formElement.dataset.productId;
      }

      // Remove any existing event listeners to prevent duplicates
      if (formElement._submitHandler) {
        formElement.removeEventListener('submit', formElement._submitHandler);
      }

      // Create new submit handler
      formElement._submitHandler = function (e) {
        e.preventDefault();

        // Clear any previous errors
        _this2.clearErrors(formElement);

        // Validate the form
        if (!_this2.validateForm(formElement)) {
          logger.log('Form validation failed - stopping form submission');
          e.stopPropagation(); // Ensure event doesn't propagate
          return false; // Explicit false return to stop submission
        }

        // Show loading
        if (_this2.modalManager) {
          _this2.modalManager.showLoading();
        }

        // Get form data
        var formData = new FormData(formElement);
        var roomName = formData.get('room_name');
        var roomWidth = formData.get('room_width');
        var roomLength = formData.get('room_length');

        // Get the estimate ID from the form's dataset
        var formEstimateId = formElement.dataset.estimateId;
        if (!formEstimateId) {
          _this2.showError(formElement, 'No estimate ID found. Please try again.');
          _this2.modalManager.hideLoading();
          return;
        }

        // Retrieve the product ID from the form's dataset
        var formProductId = formElement.dataset.productId;

        // Create the room
        _this2.dataService.addNewRoom({
          room_name: roomName,
          room_width: roomWidth,
          room_length: roomLength
        }, formEstimateId, formProductId).then(function (newRoom) {
          logger.log('Room created successfully:', newRoom);

          // Check if the server already added the product (the PHP handler might do this)
          var serverAddedProduct = newRoom.product_added === true;

          // If a product ID is provided and server didn't already add it
          if (formProductId && !serverAddedProduct) {
            // Delegate to the ProductManager to add product to the new room
            if (_this2.modalManager && _this2.modalManager.productManager) {
              _this2.modalManager.productManager.addProductToRoom(formEstimateId, newRoom.room_id, formProductId).then(function () {
                // Hide loading
                if (_this2.modalManager) {
                  _this2.modalManager.hideLoading();
                }

                // If we have the estimate manager, we can directly show the estimates list
                // with the newly created room expanded, rather than showing a success message
                if (_this2.modalManager && _this2.modalManager.estimateManager) {
                  logger.log('Product added to room successfully, showing estimates list with new room expanded');
                  _this2.modalManager.estimateManager.showEstimatesList(formEstimateId, newRoom.room_id);
                } else {
                  // Fall back to showing a success message if estimateManager is not available
                  logger.log('EstimateManager not available, showing success message');
                  _this2.showSuccessMessage('Room created and product added successfully!');
                }
              })["catch"](function (error) {
                logger.error('Error adding product to room:', error);

                // Hide loading
                if (_this2.modalManager) {
                  _this2.modalManager.hideLoading();
                }

                // Show partial success as a warning/error message
                _this2.showPartialSuccessMessage('Room created successfully, but product could not be added.');
              });
            } else {
              logger.error('ProductManager not available for addProductToRoom');

              // Hide loading
              if (_this2.modalManager) {
                _this2.modalManager.hideLoading();
              }

              // Still show success for room creation
              _this2.showSuccessMessage('Room created successfully.');
            }
          } else {
            // Product was already added by the server or no product ID was provided
            // In either case, just proceed to show the room

            if (serverAddedProduct) {
              logger.log('Product was already added by the server, skipping client-side addition');
            }

            // Show the estimates list with the new room expanded
            if (_this2.modalManager && _this2.modalManager.estimateManager) {
              _this2.modalManager.estimateManager.showEstimatesList(formEstimateId, newRoom.room_id);
            } else {
              // Hide loading
              if (_this2.modalManager) {
                _this2.modalManager.hideLoading();
              }

              // Show success message
              var message = serverAddedProduct ? 'Room created and product added successfully!' : 'Room created successfully.';
              _this2.showSuccessMessage(message);
            }
          }
        })["catch"](function (error) {
          logger.error('Error creating room:', error);

          // Show error
          _this2.showError(formElement, 'Error creating room. Please try again.');

          // Hide loading
          if (_this2.modalManager) {
            _this2.modalManager.hideLoading();
          }
        });
      };

      // Add the submit handler
      formElement.addEventListener('submit', formElement._submitHandler);

      // Bind cancel button (using the class in the template: cancel-btn)
      var cancelButton = formElement.querySelector('.cancel-btn, .cancel-button');
      if (cancelButton) {
        if (cancelButton._clickHandler) {
          cancelButton.removeEventListener('click', cancelButton._clickHandler);
        }
        cancelButton._clickHandler = function (e) {
          e.preventDefault();
          logger.log('Cancel button clicked in new room form');
          _this2.cancelForm('room', estimateId, productId);
        };
        cancelButton.addEventListener('click', cancelButton._clickHandler);
        logger.log('Cancel button handler attached to new room form');
      } else {
        logger.log('Cancel button not found in new room form');
        logger.log('Form element structure:', formElement.innerHTML);
      }

      // Bind back button
      var backButton = formElement.querySelector('.back-button');
      if (backButton) {
        if (backButton._clickHandler) {
          backButton.removeEventListener('click', backButton._clickHandler);
        }
        backButton._clickHandler = function (e) {
          e.preventDefault();

          // Use the same logic as cancel button for consistency
          _this2.cancelForm('room', estimateId, productId);
        };
        backButton.addEventListener('click', backButton._clickHandler);
      }
    }

    /**
     * Load the estimate selection form
     * @param {string|null} productId - Optional product ID to add
     */
  }, {
    key: "loadEstimateSelectionForm",
    value: function loadEstimateSelectionForm() {
      var productId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      logger.log('Loading estimate selection form', {
        productId: productId
      });

      // This functionality has been moved to EstimateManager.showEstimateSelection
      if (this.modalManager && this.modalManager.estimateManager) {
        this.modalManager.estimateManager.showEstimateSelection(productId);
      } else {
        logger.error('EstimateManager not available for showEstimateSelection');
      }
    }

    /**
     * Handle form cancellation
     * @param {string} formType - The type of form to cancel ('estimate', 'room', etc.)
     * @param {string|null} estimateId - Optional estimate ID
     * @param {string|null} productId - Optional product ID
     */
  }, {
    key: "cancelForm",
    value: function cancelForm(formType) {
      var estimateId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var productId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      logger.log('Cancelling form', {
        formType: formType,
        estimateId: estimateId,
        productId: productId
      });
      switch (formType) {
        case 'estimate':
          // Go back to estimate selection or close modal
          if (productId && this.modalManager && this.modalManager.estimateManager) {
            this.modalManager.estimateManager.showEstimateSelection(productId);
          } else if (this.modalManager) {
            this.modalManager.closeModal();
          }
          break;
        case 'room':
          // If we have a productId, go back to estimate selection
          // Otherwise go to the estimates list
          if (productId && this.modalManager && this.modalManager.estimateManager) {
            // If we're adding a product, go back to estimate selection
            this.modalManager.estimateManager.showEstimateSelection(productId);
          } else if (estimateId && this.modalManager && this.modalManager.estimateManager) {
            // If we're just creating a room, go back to the estimates list
            this.modalManager.estimateManager.showEstimatesList();
          } else if (this.modalManager) {
            this.modalManager.closeModal();
          }
          break;
        default:
          // Just close the modal
          if (this.modalManager) {
            this.modalManager.closeModal();
          }
      }
    }

    /**
     * Validate a form
     * @param {HTMLElement} form - The form to validate
     * @returns {boolean} Whether the form is valid
     */
  }, {
    key: "validateForm",
    value: function validateForm(form) {
      var _this3 = this;
      logger.log('Validating form', form);
      if (!form) {
        logger.error('Form not provided for validation');
        return false;
      }

      // Clear any previous errors
      this.clearErrors(form);
      var isValid = true;

      // Validate required fields
      var requiredFields = form.querySelectorAll('[required]');
      requiredFields.forEach(function (field) {
        if (!field.value.trim()) {
          _this3.showError(form, "".concat(field.name, " is required."), field);

          // Explicitly ensure the value is empty to make sure our validation is triggered
          field.value = '';

          // Set validation custom property on the field
          field.dataset.validationFailed = 'true';
          isValid = false;
        }
      });

      // If form is not valid, ensure no storage operations happen
      if (!isValid) {
        logger.log('Form validation failed - form has errors');

        // Set a flag on the form to indicate validation failure
        form.dataset.validationFailed = 'true';

        // Prevent default browser form submission
        if (form.hasAttribute('data-submitting')) {
          form.removeAttribute('data-submitting');
        }
      } else {
        // Form is valid - remove the failure flag
        form.removeAttribute('data-validation-failed');
      }

      // Additional validation logic based on form type could be added here

      return isValid;
    }

    /**
     * Show an error message on a form
     * @param {HTMLElement} form - The form to show the error on
     * @param {string} message - The error message
     * @param {HTMLElement|null} field - Optional field that has the error
     */
  }, {
    key: "showError",
    value: function showError(form, message) {
      var field = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      logger.log('Showing error', {
        message: message,
        field: field
      });
      if (!form) {
        logger.error('Form not provided for showing error');
        return;
      }

      // Find or create error container using template
      var errorContainer = form.querySelector('.form-errors');
      if (!errorContainer) {
        // Create a temporary container to hold the template
        var tempContainer = document.createElement('div');
        _TemplateEngine__WEBPACK_IMPORTED_MODULE_5__["default"].insert('form-error-template', {
          errorMessage: message
        }, tempContainer);

        // Insert the error container at the top of the form
        errorContainer = tempContainer.firstElementChild;
        form.insertBefore(errorContainer, form.firstChild);
      } else {
        // Update the existing error container with the new message
        var errorMessageElement = errorContainer.querySelector('p');
        if (errorMessageElement) {
          errorMessageElement.textContent = message;
        } else {
          // If no <p> element exists, add one
          var p = document.createElement('p');
          p.textContent = message;
          errorContainer.appendChild(p);
        }
      }

      // Highlight the field if provided
      if (field) {
        field.classList.add('error-field');
        field.setAttribute('aria-invalid', 'true');

        // Add error class to parent form group if it exists
        var formGroup = field.closest('.form-group');
        if (formGroup) {
          formGroup.classList.add('has-error');
        }

        // Focus the field
        field.focus();
      }
    }

    /**
     * Clear errors from a form
     * @param {HTMLElement} form - The form to clear errors from
     */
  }, {
    key: "clearErrors",
    value: function clearErrors(form) {
      logger.log('Clearing errors from form');
      if (!form) {
        logger.error('Form not provided for clearing errors');
        return;
      }

      // Remove error container
      var errorContainer = form.querySelector('.form-errors');
      if (errorContainer) {
        errorContainer.remove();
      }

      // Remove error classes from fields
      var errorFields = form.querySelectorAll('.error-field');
      errorFields.forEach(function (field) {
        field.classList.remove('error-field');
        field.removeAttribute('aria-invalid');

        // Remove error class from parent form group if it exists
        var formGroup = field.closest('.form-group');
        if (formGroup) {
          formGroup.classList.remove('has-error');
        }
      });

      // Remove error classes from form groups
      var errorGroups = form.querySelectorAll('.has-error');
      errorGroups.forEach(function (group) {
        group.classList.remove('has-error');
      });
    }

    /**
     * Show a success message
     * @param {string} message - The success message
     */
  }, {
    key: "showSuccessMessage",
    value: function showSuccessMessage(message) {
      var _this4 = this;
      logger.log('Showing success message', {
        message: message
      });

      // Define the callback for after dialog is closed
      var onConfirm = function onConfirm() {
        // Show the estimates list after confirmation 
        if (_this4.modalManager && _this4.modalManager.estimateManager) {
          logger.log('Success dialog confirmed, showing estimates list');
          _this4.modalManager.estimateManager.showEstimatesList();
        } else {
          // Fall back to closing the modal
          logger.log('EstimateManager not available, closing modal after success dialog');
          if (_this4.modalManager) {
            _this4.modalManager.closeModal();
          }
        }
      };

      // Use the standardized dialog helper function
      var showResult = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.showSuccessDialog)(this.modalManager, message, 'estimate', onConfirm);

      // If the dialog couldn't be shown, use fallback approach
      if (!showResult) {
        logger.log("Success: ".concat(message));

        // Show estimates list if possible, otherwise close the modal
        if (this.modalManager && this.modalManager.estimateManager) {
          this.modalManager.estimateManager.showEstimatesList();
        } else if (this.modalManager) {
          this.modalManager.closeModal();
        }
      }
    }

    /**
     * Show a partial success message that should be styled as a warning/error
     * @param {string} message - The partial success message
     */
  }, {
    key: "showPartialSuccessMessage",
    value: function showPartialSuccessMessage(message) {
      var _this5 = this;
      logger.log('Showing partial success message as warning', {
        message: message
      });

      // Define the callback for after dialog is closed
      var onConfirm = function onConfirm() {
        // Show the estimates list after confirmation
        if (_this5.modalManager && _this5.modalManager.estimateManager) {
          logger.log('Warning dialog confirmed, showing estimates list');
          _this5.modalManager.estimateManager.showEstimatesList();
        } else {
          // Fall back to closing the modal
          logger.log('EstimateManager not available, closing modal after warning dialog');
          if (_this5.modalManager) {
            _this5.modalManager.closeModal();
          }
        }
      };

      // Use the standardized dialog helper function
      var showResult = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.showWarningDialog)(this.modalManager, message, 'estimate', onConfirm);

      // If the dialog couldn't be shown, use fallback approach
      if (!showResult) {
        logger.log("Warning: ".concat(message));
        if (this.modalManager && this.modalManager.estimateManager) {
          this.modalManager.estimateManager.showEstimatesList();
        } else if (this.modalManager) {
          this.modalManager.closeModal();
        }
      }
    }

    /**
     * Called when the modal is closed
     */
  }, {
    key: "onModalClosed",
    value: function onModalClosed() {
      logger.log('FormManager: Modal closed');
      // Clean up any resources or state as needed
      this.currentForm = null;
    }
  }]);
}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (FormManager);

/***/ }),

/***/ "./src/js/frontend/managers/ModalManager.js":
/*!**************************************************!*\
  !*** ./src/js/frontend/managers/ModalManager.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/* harmony import */ var _EstimateStorage__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../EstimateStorage */ "./src/js/frontend/EstimateStorage.js");
/* harmony import */ var _CustomerStorage__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../CustomerStorage */ "./src/js/frontend/CustomerStorage.js");
/* harmony import */ var _TemplateEngine__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../TemplateEngine */ "./src/js/frontend/TemplateEngine.js");
/* harmony import */ var _ConfirmationDialog__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../ConfirmationDialog */ "./src/js/frontend/ConfirmationDialog.js");
/* harmony import */ var _ProductSelectionDialog__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../ProductSelectionDialog */ "./src/js/frontend/ProductSelectionDialog.js");
/* harmony import */ var _EstimateManager__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./EstimateManager */ "./src/js/frontend/managers/EstimateManager.js");
/* harmony import */ var _RoomManager__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./RoomManager */ "./src/js/frontend/managers/RoomManager.js");
/* harmony import */ var _ProductManager__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./ProductManager */ "./src/js/frontend/managers/ProductManager.js");
/* harmony import */ var _FormManager__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./FormManager */ "./src/js/frontend/managers/FormManager.js");
/* harmony import */ var _UIManager__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./UIManager */ "./src/js/frontend/managers/UIManager.js");



/**
 * ModalManager.js
 *
 * Core modal manager that coordinates between specialized managers.
 * This class handles the basic modal functionality and delegates
 * specific responsibilities to specialized manager classes.
 */



// Import services and utils first






// Import specialized managers





var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.createLogger)('ModalManager');
var ModalManager = /*#__PURE__*/function () {
  /**
   * Initialize the ModalManager
   * @param {object} config - Configuration options
   * @param {object} dataService - The data service instance
   */
  function ModalManager() {
    var _window$productEstima;
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var dataService = arguments.length > 1 ? arguments[1] : undefined;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__["default"])(this, ModalManager);
    // Default configuration
    this.config = Object.assign({
      debug: false,
      selectors: {
        modalContainer: '#product-estimator-modal',
        estimatorButtons: '.product-estimator-button, .single_add_to_estimator_button',
        modalOverlay: '.product-estimator-modal-overlay',
        closeButton: '.product-estimator-modal-close',
        contentContainer: '.product-estimator-modal-form-container',
        loadingIndicator: '.product-estimator-modal-loading',
        estimatesList: '#estimates',
        estimateSelection: '#estimate-selection-wrapper',
        roomSelection: '#room-selection-form-wrapper',
        newEstimateForm: '#new-estimate-form-wrapper',
        newRoomForm: '#new-room-form-wrapper'
      },
      i18n: ((_window$productEstima = window.productEstimatorVars) === null || _window$productEstima === void 0 ? void 0 : _window$productEstima.i18n) || {}
    }, config);

    // Store DataService
    this.dataService = dataService;

    // UI elements
    this.modal = null;
    this.overlay = null;
    this.closeButton = null;
    this.contentContainer = null;
    this.loadingIndicator = null;

    // View containers
    this.estimatesList = null;
    this.estimateSelection = null;
    this.estimateSelectionForm = null;
    this.roomSelectionForm = null;
    this.newEstimateForm = null;
    this.newRoomForm = null;

    // State
    this.isOpen = false;
    this.currentView = null;
    this.currentProductId = null;
    this.initialized = false;
    this.eventHandlers = {};

    // Storage functions
    this.loadEstimateData = _EstimateStorage__WEBPACK_IMPORTED_MODULE_4__.loadEstimateData;
    this.saveEstimateData = _EstimateStorage__WEBPACK_IMPORTED_MODULE_4__.saveEstimateData;
    this.clearEstimateData = _EstimateStorage__WEBPACK_IMPORTED_MODULE_4__.clearEstimateData;
    this.loadCustomerDetails = _CustomerStorage__WEBPACK_IMPORTED_MODULE_5__.loadCustomerDetails;
    this.saveCustomerDetails = _CustomerStorage__WEBPACK_IMPORTED_MODULE_5__.saveCustomerDetails;
    this.clearCustomerDetails = _CustomerStorage__WEBPACK_IMPORTED_MODULE_5__.clearCustomerDetails;

    // Specialized managers - will be initialized in init()
    this.estimateManager = null;
    this.roomManager = null;
    this.productManager = null;
    this.formManager = null;
    this.uiManager = null;
    this.confirmationDialog = null; // Will be assigned to the global instance or created new

    // Bind methods to preserve 'this' context
    this._modalClickHandler = this._modalClickHandler.bind(this);
    this.showLoading = this.showLoading.bind(this);
    this.hideLoading = this.hideLoading.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

    // Initialize the modal
    this.init();
  }

  /**
   * Initialize the ModalManager
   * @returns {ModalManager} The instance for chaining
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__["default"])(ModalManager, [{
    key: "init",
    value: function init() {
      if (this.initialized) {
        logger.log('ModalManager already initialized');
        return this;
      }
      logger.log('Initializing ModalManager');
      try {
        // First check if the modal already exists in the DOM (for backward compatibility)
        this.modal = document.querySelector(this.config.selectors.modalContainer);
        if (!this.modal) {
          logger.log('Modal element not found in DOM. Creating from template...');

          // Create the modal using TemplateEngine
          this.modal = _TemplateEngine__WEBPACK_IMPORTED_MODULE_6__["default"].createModalContainer();
          if (this.modal) {
            logger.log('Modal created successfully from template');
            this.completeInitialization();
          } else {
            logger.error('Failed to create modal from template');
            return this;
          }
        } else {
          logger.log('Found existing modal in DOM, initializing elements');
          this.completeInitialization();
        }
        this.initialized = true;
        logger.log('ModalManager initialization completed successfully');
      } catch (error) {
        logger.error('Error initializing ModalManager:', error);
      }
      return this;
    }

    /**
     * Complete initialization once modal is found
     * @private
     */
  }, {
    key: "completeInitialization",
    value: function completeInitialization() {
      var _this = this;
      if (!this.modal) {
        logger.error('Cannot complete initialization - modal element not available');
        return;
      }

      // When using templates, we need to allow time for the DOM to fully update
      // before trying to find elements within the newly created template
      logger.log('Modal found, allowing time for DOM to fully update before initializing elements');

      // Give a small delay to ensure the DOM is fully updated with the template content
      setTimeout(function () {
        // Initialize elements
        _this.initializeElements();

        // Set up the loading indicator safety checks
        _this.setupLoaderSafety();

        // Initialize specialized managers
        _this.initializeManagers();

        // Bind base events
        _this.bindEvents();

        // Hide any loading indicators that might be visible
        setTimeout(function () {
          _this.ensureLoaderHidden();
        }, 100);
        _this.initialized = true;
        logger.log('ModalManager initialization completed successfully');
      }, 50); // A short delay to allow DOM rendering to complete
    }

    /**
     * Initialize DOM elements
     */
  }, {
    key: "initializeElements",
    value: function initializeElements() {
      logger.log('Initializing DOM elements');
      try {
        if (!this.modal) {
          logger.error('Modal element not available for initializing elements');
          return;
        }

        // Find core modal elements - Use direct CSS selectors instead of config selectors
        this.overlay = this.modal.querySelector('.product-estimator-modal-overlay');
        this.closeButton = this.modal.querySelector('.product-estimator-modal-close');
        this.contentContainer = this.modal.querySelector('.product-estimator-modal-form-container');
        this.loadingIndicator = this.modal.querySelector('.product-estimator-modal-loading');

        // Find view containers - Use direct ID selectors
        this.estimatesList = this.modal.querySelector('#estimates');
        this.estimateSelection = this.modal.querySelector('#estimate-selection-wrapper');
        this.estimateSelectionForm = this.modal.querySelector('#estimate-selection-form-wrapper');
        this.roomSelectionForm = this.modal.querySelector('#room-selection-form-wrapper');
        this.newEstimateForm = this.modal.querySelector('#new-estimate-form-wrapper');
        this.newRoomForm = this.modal.querySelector('#new-room-form-wrapper');

        // Add simple logging for container elements
        logger.log('Container elements status:', {
          modal: this.modal ? 'found' : 'missing',
          contentContainer: this.contentContainer ? 'found' : 'missing',
          estimatesList: this.estimatesList ? 'found' : 'missing',
          estimateSelection: this.estimateSelection ? 'found' : 'missing',
          estimateSelectionForm: this.estimateSelectionForm ? 'found' : 'missing',
          roomSelectionForm: this.roomSelectionForm ? 'found' : 'missing',
          newEstimateForm: this.newEstimateForm ? 'found' : 'missing',
          newRoomForm: this.newRoomForm ? 'found' : 'missing'
        });

        // Log the modal's HTML to help diagnose template issues
        if (!this.estimatesList) {
          logger.error('Critical: #estimates div not found in modal template!');
          logger.log('Modal content structure:', this.modal.innerHTML.substring(0, 500) + '...');
        }

        // Create missing containers if needed
        if (!this.loadingIndicator) {
          logger.warn('Loading indicator not found, creating one');
          this.loadingIndicator = document.createElement('div');
          this.loadingIndicator.className = 'product-estimator-modal-loading';
          this.loadingIndicator.innerHTML = "\n          <div class=\"loading-spinner\"></div>\n          <div class=\"loading-text\">".concat(this.config.i18n.loading || 'Loading...', "</div>\n        ");
          this.modal.appendChild(this.loadingIndicator);
        }
        logger.log('DOM elements initialized');
      } catch (error) {
        logger.error('Error initializing DOM elements:', error);
      }
    }

    /**
     * Initialize all specialized managers
     */
  }, {
    key: "initializeManagers",
    value: function initializeManagers() {
      logger.log('Initializing specialized managers');

      // Initialize specialized managers with references to this ModalManager
      // and the dataService
      this.estimateManager = new _EstimateManager__WEBPACK_IMPORTED_MODULE_9__["default"](this.config, this.dataService, this);
      this.roomManager = new _RoomManager__WEBPACK_IMPORTED_MODULE_10__["default"](this.config, this.dataService, this);
      this.productManager = new _ProductManager__WEBPACK_IMPORTED_MODULE_11__["default"](this.config, this.dataService, this);
      this.formManager = new _FormManager__WEBPACK_IMPORTED_MODULE_12__["default"](this.config, this.dataService, this);
      this.uiManager = new _UIManager__WEBPACK_IMPORTED_MODULE_13__["default"](this.config, this.dataService, this);

      // Set up confirmation dialog - create a new instance explicitly
      logger.log('Creating new ConfirmationDialog instance');
      try {
        // Force a new instance of the dialog
        this.confirmationDialog = new _ConfirmationDialog__WEBPACK_IMPORTED_MODULE_7__["default"]();

        // Make it available globally
        if (!window.productEstimator) {
          window.productEstimator = {};
        }
        window.productEstimator.dialog = this.confirmationDialog;

        // Don't force initialization - we'll create elements on demand
        // This ensures the dialog isn't created until it's actually needed

        logger.log('ConfirmationDialog instance created successfully and initialized');
      } catch (error) {
        logger.error('Error creating ConfirmationDialog:', error);
      }

      // Set up product selection dialog for variations
      logger.log('Creating ProductSelectionDialog instance');
      try {
        this.productSelectionDialog = new _ProductSelectionDialog__WEBPACK_IMPORTED_MODULE_8__["default"](this, _TemplateEngine__WEBPACK_IMPORTED_MODULE_6__["default"]);

        // Make it available to the product manager
        if (this.productManager) {
          this.productManager.productSelectionDialog = this.productSelectionDialog;
        }
        logger.log('ProductSelectionDialog instance created successfully');
      } catch (error) {
        logger.error('Error creating ProductSelectionDialog:', error);
      }

      // Verify dialog instance was created (elements will be created on demand)
      if (this.confirmationDialog) {
        logger.log('ConfirmationDialog instance ready for use, elements will be created when needed');
      } else {
        logger.error('ConfirmationDialog instance was not created properly');
      }

      // Initialize each manager
      if (this.estimateManager) this.estimateManager.init();
      if (this.roomManager) this.roomManager.init();
      if (this.productManager) this.productManager.init();
      if (this.formManager) this.formManager.init();
      if (this.uiManager) this.uiManager.init();
      logger.log('Specialized managers initialized');
    }

    /**
     * Bind core modal events
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this2 = this;
      logger.log('Binding core modal events');
      try {
        // Modal overlay click handler
        if (this.modal) {
          this.modal.addEventListener('click', this._modalClickHandler);
        }

        // Close button click handler
        if (this.closeButton) {
          this.closeButton.addEventListener('click', function (e) {
            e.preventDefault();
            _this2.closeModal();
          });
        }

        // Replace product button click handler (Event delegation)
        if (this.modal) {
          this.modal.addEventListener('click', function (e) {
            // Check if click is on a replace product button
            var replaceButton = e.target.closest('.replace-product-in-room');
            if (replaceButton) {
              var _estimate$rooms;
              e.preventDefault();
              e.stopPropagation();

              // Prevent double clicks
              if (replaceButton.dataset.processing === 'true') {
                logger.log('Replace button click ignored - already processing');
                return;
              }

              // Mark as processing to prevent double processing
              replaceButton.dataset.processing = 'true';

              // Get data attributes from the button
              var productId = replaceButton.dataset.productId;
              var estimateId = replaceButton.dataset.estimateId;
              var roomId = replaceButton.dataset.roomId;
              var replaceProductId = replaceButton.dataset.replaceProductId;
              logger.log('Replace product button clicked', {
                productId: productId,
                estimateId: estimateId,
                roomId: roomId,
                replaceProductId: replaceProductId
              });

              // Get room data for pricing calculations
              var estimate = _this2.dataService.getEstimate(estimateId);
              var room = estimate === null || estimate === void 0 || (_estimate$rooms = estimate.rooms) === null || _estimate$rooms === void 0 ? void 0 : _estimate$rooms[roomId];

              // Use the common variation handler
              if (_this2.productManager) {
                _this2.productManager.handleProductVariationSelection(productId, {
                  action: 'replace',
                  estimateId: estimateId,
                  roomId: roomId,
                  replaceProductId: replaceProductId,
                  room: room,
                  button: replaceButton
                }).then(function () {
                  logger.log('Product replacement completed successfully');
                })["catch"](function (error) {
                  logger.error('Error handling product replacement:', error);

                  // Show error dialog only for actual errors (not cancellation)
                  if (error.message !== 'Variation selection cancelled') {
                    _this2.confirmationDialog.show({
                      title: 'Error',
                      message: 'Unable to replace product. Please try again.',
                      type: 'error',
                      showCancel: false,
                      confirmText: 'OK'
                    });
                  }
                })["finally"](function () {
                  replaceButton.dataset.processing = 'false';
                });
              } else {
                logger.error('ProductManager not available for product replacement');
                replaceButton.dataset.processing = 'false';
              }
            }
          });
        }

        // Escape key handler
        var escHandler = function escHandler(e) {
          if (e.key === 'Escape' && _this2.isOpen) {
            _this2.closeModal();
          }
        };
        document.addEventListener('keydown', escHandler);
        logger.log('Core modal events bound');
      } catch (error) {
        logger.error('Error binding core modal events:', error);
      }
    }

    /**
     * Handle modal overlay clicks
     * @param {Event} e - The click event
     * @private
     */
  }, {
    key: "_modalClickHandler",
    value: function _modalClickHandler(e) {
      // Close modal when clicking the overlay (not the content)
      if (e.target === this.overlay) {
        this.closeModal();
      }
    }

    /**
     * Show the loading indicator
     */
  }, {
    key: "showLoading",
    value: function showLoading() {
      var _this3 = this;
      if (!this.loadingIndicator) {
        logger.warn('Loading indicator not available - creating one');
        // Try to initialize a loading indicator
        if (this.modal) {
          var loadingIndicator = document.createElement('div');
          loadingIndicator.className = 'product-estimator-modal-loading';
          loadingIndicator.style.display = 'flex';
          loadingIndicator.innerHTML = "\n          <div class=\"loading-spinner\"></div>\n          <div class=\"loading-text\">".concat(this.config.i18n.loading || 'Loading...', "</div>\n        ");
          this.modal.appendChild(loadingIndicator);
          this.loadingIndicator = loadingIndicator;
        } else {
          logger.error('Cannot create loading indicator - modal not available');
          return;
        }
      }
      try {
        this.loadingIndicator.style.display = 'flex';

        // Set a safety timeout in case something goes wrong
        this._loadingTimeout = setTimeout(function () {
          _this3.ensureLoaderHidden();
        }, 10000); // 10 seconds safety timeout

        // Track loading start time for debugging
        this.loadingStartTime = Date.now();
      } catch (error) {
        logger.error('Error showing loading indicator:', error);
      }
    }

    /**
     * Hide the loading indicator
     */
  }, {
    key: "hideLoading",
    value: function hideLoading() {
      // Reset loading start time
      this.loadingStartTime = 0;
      if (!this.loadingIndicator) {
        logger.warn('Loading indicator not available during hide operation');
        return;
      }
      try {
        this.loadingIndicator.style.display = 'none';

        // Clear the safety timeout
        if (this._loadingTimeout) {
          clearTimeout(this._loadingTimeout);
          this._loadingTimeout = null;
        }
      } catch (error) {
        logger.error('Error hiding loading indicator:', error);
      }
    }

    /**
     * Reset button state after loading
     */
  }, {
    key: "resetButtonState",
    value: function resetButtonState() {
      if (!this._buttonConfig || !this._buttonConfig.button) {
        return;
      }
      var button = this._buttonConfig.button;

      // Get original data from data attributes
      var originalText = button.dataset.originalText || button.textContent;
      var wasDisabled = button.dataset.originalDisabled === 'true';

      // Only clear content for buttons we added spinners to
      if (button.classList.contains('product-estimator-category-button')) {
        button.innerHTML = '';
      }

      // Reset button to original state
      button.textContent = originalText;
      button.disabled = wasDisabled;
      button.classList.remove('loading');

      // Clean up data attributes
      delete button.dataset.originalText;
      delete button.dataset.originalDisabled;

      // Clear the config
      this._buttonConfig = null;
    }

    /**
     * Open the modal
     * @param {string|null} productId - Optional product ID to add
     * @param {boolean} forceListView - Force showing the estimates list
     * @param {object} buttonConfig - Optional button configuration for reset
     */
  }, {
    key: "openModal",
    value: function openModal() {
      var _this4 = this;
      var productId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var forceListView = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var buttonConfig = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      logger.log('MODAL OPEN CALLED WITH:', {
        productId: productId,
        forceListView: forceListView,
        typeOfProductId: (0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(productId),
        hasButtonConfig: !!buttonConfig
      });

      // Store button config for later reset
      this._buttonConfig = buttonConfig;

      // Debounce logic - prevent rapid open/close calls
      if (this._modalActionInProgress) {
        logger.log('Modal action already in progress, ignoring open request');
        return;
      }
      this._modalActionInProgress = true;

      // Reset the debounce after a short delay
      setTimeout(function () {
        _this4._modalActionInProgress = false;
      }, 300); // 300ms debounce

      // Make sure modal exists and is initialized
      if (!this.modal) {
        logger.error('Cannot open modal - not found in DOM');
        this.showError('Modal element not found. Please contact support.');
        return;
      }
      try {
        // If we have a product ID, check for variations first
        if (productId && !forceListView) {
          logger.log('Checking for product variations', {
            productId: productId
          });

          // Don't show loading dialog immediately - the button already has loading state

          // Check if this is a variable product
          this.dataService.getProductVariationData(productId).then(function (variationData) {
            // Don't reset button state here - wait until dialog is closed

            if (variationData && variationData.isVariable && variationData.variations && variationData.variations.length > 0) {
              // Show product selection dialog for variations
              logger.log('Product has variations, showing selection dialog', variationData);
              if (_this4.productSelectionDialog) {
                _this4.productSelectionDialog.show({
                  product: {
                    id: productId,
                    name: variationData.productName || 'Select Product Options'
                  },
                  variations: variationData.variations,
                  attributes: variationData.attributes,
                  action: 'add',
                  onSelect: function onSelect(selectedData) {
                    logger.log('Variation selected:', selectedData);
                    // Hide variation dialog before showing estimate selection
                    _this4.productSelectionDialog.hideDialog();

                    // Reset button state since we're proceeding with the selected variation
                    _this4.resetButtonState();

                    // Small delay for smoother transition
                    setTimeout(function () {
                      _this4.proceedWithModalOpen(selectedData.variationId || selectedData.productId, forceListView);
                    }, 150);
                  },
                  onCancel: function onCancel() {
                    logger.log('Product selection cancelled');
                    _this4._modalActionInProgress = false;
                    _this4.resetButtonState();
                  }
                });
              } else {
                logger.error('ProductSelectionDialog not available');
                // Fallback to normal flow
                _this4.proceedWithModalOpen(productId, forceListView);
              }
            } else {
              // No variations, reset button state and proceed normally
              logger.log('Product has no variations, proceeding normally');
              _this4.resetButtonState();
              _this4.proceedWithModalOpen(productId, forceListView);
            }
          })["catch"](function (error) {
            logger.error('Error checking product variations:', error);

            // Reset button state on error
            _this4.resetButtonState();

            // On error, proceed with normal flow
            _this4.proceedWithModalOpen(productId, forceListView);
          });
          return; // Exit early, we'll continue in the callback
        }

        // No product ID or forcing list view, proceed normally
        this.proceedWithModalOpen(productId, forceListView);
      } catch (error) {
        logger.error('Error opening modal:', error);
        this.hideLoading();
        this.showError('An error occurred opening the modal. Please try again.');
      }
    }

    /**
     * Continue with opening the modal after variation check
     * @private
     * @param {string|number} productId - The product ID to add
     * @param {boolean} forceListView - Whether to force the list view
     */
  }, {
    key: "proceedWithModalOpen",
    value: function proceedWithModalOpen(productId, forceListView) {
      var _this5 = this;
      try {
        // Reset any previous modal state (hides all view wrappers)
        this.resetModalState();

        // Store product ID
        this.currentProductId = productId;

        // Set data attribute on modal
        if (productId) {
          this.modal.dataset.productId = productId;
        } else {
          delete this.modal.dataset.productId;
        }

        // Always show loader at the start of openModal
        this.showLoading();

        // Make sure modal is visible
        this.modal.style.display = 'block';

        // Add modal-open class to body
        document.body.classList.add('modal-open');
        this.isOpen = true;

        // Initialize carousels through UIManager
        if (this.uiManager) {
          setTimeout(function () {
            _this5.uiManager.initializeCarousels();
          }, 300); // Short delay to ensure DOM is ready
        }

        // Now delegate to specialized managers to handle the specific flow
        if (productId && !forceListView) {
          // Product flow: Navigate to estimate selection or new estimate form
          if (this.estimateManager) {
            this.estimateManager.handleProductFlow(productId);
          } else {
            logger.error('EstimateManager not available for handleProductFlow');
            this.hideLoading();
          }
        } else {
          // List view flow: Show list of estimates
          if (this.estimateManager) {
            this.estimateManager.showEstimatesList();
          } else {
            logger.error('EstimateManager not available for showEstimatesList');
            this.hideLoading();
          }
        }
      } catch (error) {
        logger.error('Error proceeding with modal open:', error);
        this.hideLoading();
        this.showError('An error occurred opening the modal. Please try again.');
      }
    }

    /**
     * Close the modal
     */
  }, {
    key: "closeModal",
    value: function closeModal() {
      var _this6 = this;
      if (!this.isOpen) return;

      // Debounce logic - prevent rapid open/close calls
      if (this._modalActionInProgress) {
        logger.log('Modal action already in progress, ignoring close request');
        return;
      }
      this._modalActionInProgress = true;

      // Reset the debounce after a short delay
      setTimeout(function () {
        _this6._modalActionInProgress = false;
      }, 300); // 300ms debounce

      logger.log('Closing modal');
      try {
        // Ensure loader is hidden
        this.ensureLoaderHidden();

        // Reset button state if we have one
        this.resetButtonState();

        // Hide the modal
        if (this.modal) {
          this.modal.style.display = 'none';
          this.isOpen = false;
        }

        // Reset the current product ID
        this.currentProductId = null;

        // Remove modal-open class from body
        document.body.classList.remove('modal-open');

        // Notify any specialized managers about modal closing
        if (this.estimateManager) this.estimateManager.onModalClosed();
        if (this.roomManager) this.roomManager.onModalClosed();
        if (this.productManager) this.productManager.onModalClosed();
        if (this.formManager) this.formManager.onModalClosed();
        if (this.uiManager) this.uiManager.onModalClosed();

        // Dispatch modal closed event
        var event = new CustomEvent('productEstimatorModalClosed');
        document.dispatchEvent(event);
      } catch (error) {
        logger.error('Error closing modal:', error);
      }
    }

    /**
     * Show an error message in the modal
     * @param {string} message - The error message to display
     */
  }, {
    key: "showError",
    value: function showError(message) {
      try {
        // Ensure loading is hidden
        this.hideLoading();

        // Show error using the TemplateEngine if available
        if (this.modal && _TemplateEngine__WEBPACK_IMPORTED_MODULE_6__["default"]) {
          var formContainer = this.modal.querySelector('.product-estimator-modal-form-container');
          if (formContainer) {
            _TemplateEngine__WEBPACK_IMPORTED_MODULE_6__["default"].showMessage(message, 'error', formContainer);
          } else {
            logger.error('Form container not found for error display');

            // Fallback error display
            alert(message);
          }
        } else {
          // Ultimate fallback
          alert(message);
        }
      } catch (error) {
        logger.error('Error showing error message:', error);
      }
    }

    /**
     * Set up safety mechanism for the loading indicator
     */
  }, {
    key: "setupLoaderSafety",
    value: function setupLoaderSafety() {
      var _this7 = this;
      // Log when setting up safety
      logger.log('Setting up loader safety mechanisms');

      // Monitor all API calls and ensure loading indicator is hidden in case of errors
      try {
        var originalFetch = window.fetch;
        window.fetch = function () {
          var fetchPromise = originalFetch.apply(void 0, arguments);
          return fetchPromise["catch"](function (error) {
            // Hide loading indicator if fetch fails
            logger.warn('Fetch error triggered loader safety:', error.message);
            _this7.ensureLoaderHidden();
            throw error;
          });
        };

        // Add global error handler to hide loader
        window.addEventListener('error', function (event) {
          logger.warn('Global error triggered loader safety:', event.message);
          _this7.ensureLoaderHidden();
        });

        // Add unhandled promise rejection handler
        window.addEventListener('unhandledrejection', function (event) {
          logger.warn('Unhandled rejection triggered loader safety:', event.reason ? event.reason.message || 'Unknown reason' : 'Unknown reason');
          _this7.ensureLoaderHidden();
        });

        // Set up a periodic check that no loading indicator stays visible for too long
        this._safetyInterval = setInterval(function () {
          if (_this7.loadingStartTime && Date.now() - _this7.loadingStartTime > 15000) {
            logger.warn('Loading indicator visible for too long (15s), forcing hide');
            _this7.ensureLoaderHidden();
          }
        }, 5000); // Check every 5 seconds

        logger.log('Loader safety mechanisms installed');
      } catch (error) {
        logger.error('Error setting up loader safety:', error);
      }
    }

    /**
     * Ensure the loading indicator is hidden (safety method)
     */
  }, {
    key: "ensureLoaderHidden",
    value: function ensureLoaderHidden() {
      if (!this.loadingIndicator) return;
      try {
        // Force hide the loading indicator
        this.loadingIndicator.style.display = 'none';

        // Reset loading start time
        this.loadingStartTime = 0;

        // Clear any pending timeout
        if (this._loadingTimeout) {
          clearTimeout(this._loadingTimeout);
          this._loadingTimeout = null;
        }
        logger.log('Loading indicator forcibly hidden for safety');
      } catch (error) {
        logger.error('Error hiding loading indicator:', error);
      }
    }

    /**
     * Reset the modal state (hide all views)
     */
  }, {
    key: "resetModalState",
    value: function resetModalState() {
      var _this8 = this;
      logger.log('Resetting modal state');
      try {
        // Hide all view containers
        var viewContainers = [this.estimatesList, this.estimateSelection, this.roomSelectionForm, this.newEstimateForm, this.newRoomForm];

        // If UIManager is available, use it to hide elements
        if (this.uiManager) {
          viewContainers.forEach(function (container) {
            if (container) {
              _this8.uiManager.hideElement(container);
            }
          });
        } else {
          // Fallback if UIManager not available
          viewContainers.forEach(function (container) {
            if (container) {
              container.style.display = 'none';
            }
          });
        }

        // Clear any stored data attributes safely
        if (this.roomSelectionForm) this.roomSelectionForm.removeAttribute('data-estimate-id');
        if (this.newRoomForm) {
          this.newRoomForm.removeAttribute('data-estimate-id');
          this.newRoomForm.removeAttribute('data-product-id');
        }
      } catch (error) {
        logger.error('Error resetting modal state:', error);
      }
    }

    /**
     * Force an element to be visible (utility method)
     * @param {HTMLElement} element - The element to make visible
     * @returns {HTMLElement} The element
     */
  }, {
    key: "forceElementVisibility",
    value: function forceElementVisibility(element) {
      // Delegate to UIManager if available
      if (this.uiManager) {
        return this.uiManager.forceElementVisibility(element);
      }

      // Fallback if UIManager is not available
      if (!element) return null;
      logger.log('Using fallback forceElementVisibility (UIManager not available)');
      element.style.display = 'block';
      return element;
    }
  }]);
}(); // Export the updated ModalManager class
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ModalManager);

/***/ }),

/***/ "./src/js/frontend/managers/ProductManager.js":
/*!****************************************************!*\
  !*** ./src/js/frontend/managers/ProductManager.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/* harmony import */ var _EstimateStorage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../EstimateStorage */ "./src/js/frontend/EstimateStorage.js");
/* harmony import */ var _TemplateEngine__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../TemplateEngine */ "./src/js/frontend/TemplateEngine.js");


/**
 * ProductManager.js
 *
 * Handles all operations related to products:
 * - Rendering products in rooms
 * - Adding products to rooms
 * - Removing products from rooms
 * - Handling product variations
 */




var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.createLogger)('ProductManager');
var ProductManager = /*#__PURE__*/function () {
  /**
   * Initialize the ProductManager
   * @param {object} config - Configuration options
   * @param {object} dataService - The data service instance
   * @param {object} modalManager - Reference to the parent modal manager
   */
  function ProductManager() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var dataService = arguments.length > 1 ? arguments[1] : undefined;
    var modalManager = arguments.length > 2 ? arguments[2] : undefined;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, ProductManager);
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
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(ProductManager, [{
    key: "init",
    value: function init() {
      this.bindEvents();
      logger.log('ProductManager initialized');
    }

    /**
     * Bind event listeners related to products
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
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
  }, {
    key: "loadProductsForRoom",
    value: function loadProductsForRoom(estimateId, roomId, container) {
      var _this = this;
      logger.log('Loading products for room', {
        estimateId: estimateId,
        roomId: roomId
      });
      if (!container) {
        return Promise.reject(new Error('Container not provided for loading products'));
      }

      // Show loading indicator
      var loadingPlaceholder = container.querySelector('.loading-placeholder');
      if (loadingPlaceholder) {
        loadingPlaceholder.style.display = 'block';
      }

      // Load products from storage or API
      return this.dataService.getProductsForRoom(estimateId, roomId).then(function (products) {
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
          _TemplateEngine__WEBPACK_IMPORTED_MODULE_4__["default"].insert('products-empty-template', {}, container);
        } else {
          // Use the existing container - no need to create a new div
          // Render each product directly in the container
          products.forEach(function (product, index) {
            _this.renderProduct(product, index, roomId, estimateId, container);
          });
        }

        // Hide loading placeholder
        if (loadingPlaceholder) {
          loadingPlaceholder.style.display = 'none';
        }
        return products;
      })["catch"](function (error) {
        logger.error('Error loading products for room:', error);

        // Show error message using template
        _TemplateEngine__WEBPACK_IMPORTED_MODULE_4__["default"].insert('product-error-template', {}, container);
        throw error;
      });
    }

    /**
     * Show product selection interface
     * @param {string} estimateId - The estimate ID
     * @param {string} roomId - The room ID
     */
  }, {
    key: "showProductSelection",
    value: function showProductSelection(estimateId, roomId) {
      var _this2 = this;
      logger.log('Showing product selection', {
        estimateId: estimateId,
        roomId: roomId
      });

      // Save the current room and estimate IDs
      this.currentRoomId = roomId;
      this.currentEstimateId = estimateId;

      // This will be implemented in a future phase, as we need a product search UI
      // For now, we'll just show a simple product selection prompt

      // Simple implementation for now - ask for a product ID
      var productId = prompt('Enter a product ID to add:');
      if (productId) {
        // Add the product to the room
        this.addProductToRoom(estimateId, roomId, productId).then(function () {
          // Show success message using ConfirmationDialog instead of alert
          if (_this2.modalManager) {
            var confirmationDialog = _this2.modalManager.confirmationDialog;
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
          var roomElement = document.querySelector(".room-item[data-room-id=\"".concat(roomId, "\"][data-estimate-id=\"").concat(estimateId, "\"]"));
          if (roomElement) {
            var productsContainer = roomElement.querySelector('.room-products-container');
            if (productsContainer) {
              // Mark as not loaded to force reload
              delete productsContainer.dataset.loaded;
              _this2.loadProductsForRoom(estimateId, roomId, productsContainer);
            }
          }
        })["catch"](function (error) {
          logger.error('Error adding product to room:', error);

          // Show error using ConfirmationDialog instead of alert
          if (_this2.modalManager) {
            var confirmationDialog = _this2.modalManager.confirmationDialog;
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
  }, {
    key: "addProductToRoom",
    value: function addProductToRoom(estimateId, roomId, productId) {
      var _this3 = this;
      logger.log('Adding product to room', {
        estimateId: estimateId,
        roomId: roomId,
        productId: productId
      });

      // Validate that we have a product ID
      if (!productId) {
        var errorMsg = 'Product ID is required to add a product to a room';
        logger.log(errorMsg);
        return Promise.reject(new Error(errorMsg));
      }

      // Show loading if we have a modal available
      if (this.modalManager) {
        this.modalManager.showLoading();
      }

      // Convert the productId to string to ensure proper handling
      return this.dataService.addProductToRoom(roomId, productId, estimateId).then(function (result) {
        // Check if the result is actually an error (primary conflict)
        if (result && !result.success && result.primaryConflict) {
          // This is a primary conflict error, throw it to the catch block
          throw result;
        }
        logger.log('Product added successfully:', result);

        // Invalidate the room cache for this estimate to ensure fresh data is loaded
        // This is crucial for updating the room's primary product image and name
        var cacheKey = "estimate_".concat(estimateId);
        _this3.dataService.invalidateCache('rooms');
        logger.log("Invalidated room cache for estimate ".concat(estimateId));

        // Update totals only if we have valid data and the room is likely to be visible
        // TODO: Improve room totals updating to handle timing issues better
        if (_this3.modalManager && _this3.modalManager.roomManager && result && result.room_totals) {
          try {
            // Try to update totals but don't worry if it fails - view refresh will show correct values
            _this3.modalManager.roomManager.updateRoomTotals(estimateId, roomId, {
              total: result.room_totals.min_total || 0
            });
          } catch (e) {
            // Just log and continue - this is expected in some cases
            logger.log('Non-critical error updating room totals UI');
          }
        }

        // Hide loading
        if (_this3.modalManager) {
          _this3.modalManager.hideLoading();
        }
        return result;
      })["catch"](function (error) {
        // Handle duplicate product case (not an error, just a warning)
        if (error && error.data && error.data.duplicate) {
          // Hide loading indicator
          if (_this3.modalManager) {
            _this3.modalManager.hideLoading();
          }

          // Show warning dialog instead of error
          if (_this3.modalManager && _this3.modalManager.confirmationDialog) {
            _this3.modalManager.confirmationDialog.show({
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
          if (_this3.modalManager) {
            _this3.modalManager.hideLoading();
          }

          // Show confirmation dialog for primary category conflict
          if (_this3.modalManager && _this3.modalManager.confirmationDialog) {
            var roomName = _this3.modalManager.roomManager ? _this3.modalManager.roomManager.getRoomName(error.estimateId, error.roomId) : 'selected room';
            _this3.modalManager.confirmationDialog.show({
              title: 'A flooring product already exists in the selected room',
              message: "The ".concat(roomName, " already contains \"").concat(error.existingProductName, "\". Would you like to replace it with \"").concat(error.newProductName, "\"?"),
              type: 'product',
              action: 'replace',
              confirmText: 'Replace the existing product',
              cancelText: 'Go back to room select',
              additionalButtons: [{
                text: 'Cancel',
                callback: function callback() {
                  // Simply close the dialog - no action needed
                }
              }],
              onConfirm: function onConfirm() {
                // User chose to replace the existing product
                _this3.replaceProductInRoom(error.estimateId, error.roomId, error.existingProductId, error.newProductId);
              },
              onCancel: function onCancel() {
                // User chose to go back to room select
                if (_this3.modalManager) {
                  _this3.modalManager.roomManager.showRoomSelection(error.estimateId);
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
          if (_this3.modalManager) {
            _this3.modalManager.hideLoading();
          }

          // Show confirmation dialog for primary category conflict
          if (_this3.modalManager && _this3.modalManager.confirmationDialog) {
            _this3.modalManager.confirmationDialog.show({
              title: 'Primary Product Category Conflict',
              message: error.message || error.data.message,
              type: 'product',
              action: 'replace',
              confirmText: 'Replace existing product',
              cancelText: 'Back',
              additionalButtons: [{
                text: 'Cancel',
                callback: function callback() {
                  // Simply close the dialog - no action needed
                }
              }],
              onConfirm: function onConfirm() {
                // User chose to replace the existing product
                var newProductId = error.data.new_product_id;
                var existingProductId = error.data.existing_product_id;
                var roomId = error.data.room_id;
                var estimateId = error.data.estimate_id;

                // Replace the product
                _this3.replaceProductInRoom(estimateId, roomId, existingProductId, newProductId);
              },
              onCancel: function onCancel() {
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
        if (_this3.modalManager) {
          _this3.modalManager.hideLoading();
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
  }, {
    key: "renderProduct",
    value: function renderProduct(product, index, roomId, estimateId, container) {
      logger.log('Rendering product', {
        index: index,
        roomId: roomId,
        estimateId: estimateId,
        product: product
      });
      if (!container) {
        logger.error('Container not provided for rendering product');
        return null;
      }

      // Get formatted price
      var formattedPrice = _utils__WEBPACK_IMPORTED_MODULE_2__.format.currency(product.price || product.min_price_total || 0);

      // Create comprehensive template data with proper mapped field names
      var templateData = {
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
        additional_products: product.additional_products || [],
        additional_notes: product.additional_notes || [],
        similar_products: product.similar_products || []
      };
      logger.log('Product template data:', templateData);

      // Insert the product template directly into the container
      _TemplateEngine__WEBPACK_IMPORTED_MODULE_4__["default"].insert('product-item-template', templateData, container);

      // Get the product element that was just added
      var productElement = container.querySelector(".product-item[data-product-id=\"".concat(product.id, "\"]"));
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
      var productNameElement = productElement.querySelector('.price-title');
      if (productNameElement) {
        productNameElement.textContent = product.name || 'Product';
      }
      var productPriceElement = productElement.querySelector('.product-price');
      if (productPriceElement) {
        productPriceElement.textContent = formattedPrice;
      }

      // Set product image if available
      var productImage = productElement.querySelector('.product-thumbnail');
      if (productImage && product.image) {
        productImage.src = product.image;
        productImage.alt = product.name || 'Product';
      }

      // Add variations if needed
      if (product.variations && product.variations.length > 0) {
        // Create variations container
        var variationsContainer = document.createElement('div');
        variationsContainer.className = 'product-variations';

        // Create label
        var label = document.createElement('label');
        label.setAttribute('for', "variation-".concat(roomId, "-").concat(product.id, "-").concat(index));
        label.textContent = 'Options:';
        variationsContainer.appendChild(label);

        // Create select
        var select = document.createElement('select');
        select.id = "variation-".concat(roomId, "-").concat(product.id, "-").concat(index);
        select.className = 'variation-select';

        // Add default option
        var defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select an option';
        select.appendChild(defaultOption);

        // Add variation options
        product.variations.forEach(function (variation) {
          var option = document.createElement('option');
          option.value = variation.id;
          option.textContent = "".concat(variation.name, " (").concat(_utils__WEBPACK_IMPORTED_MODULE_2__.format.currency(variation.price || 0), ")");
          if (variation.id === product.selectedVariation) {
            option.selected = true;
          }
          select.appendChild(option);
        });
        variationsContainer.appendChild(select);

        // Add variations container to product element (after product includes)
        var includesContainer = productElement.querySelector('.includes-container');
        if (includesContainer) {
          productElement.insertBefore(variationsContainer, includesContainer.nextSibling);
        } else {
          productElement.appendChild(variationsContainer);
        }
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
  }, {
    key: "bindProductEvents",
    value: function bindProductEvents(productElement, product, index, roomId, estimateId) {
      var _this4 = this;
      logger.log('Binding events to product element', {
        index: index,
        roomId: roomId,
        estimateId: estimateId
      });
      if (!productElement) {
        logger.error('Product element not available for binding events');
        return;
      }

      // Bind remove button - use the template's .remove-product class
      var removeButton = productElement.querySelector('.remove-product');
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
        removeButton._clickHandler = function (e) {
          e.preventDefault();
          e.stopPropagation();

          // Get the data attributes from the button element
          var buttonEstimateId = e.currentTarget.dataset.estimateId;
          var buttonRoomId = e.currentTarget.dataset.roomId;
          var buttonProductIndex = e.currentTarget.dataset.productIndex;
          var buttonProductId = e.currentTarget.dataset.productId;

          // Use the data from the button itself, falling back to the closure variables if needed
          var targetEstimateId = buttonEstimateId || estimateId;
          var targetRoomId = buttonRoomId || roomId;
          var targetProductIndex = buttonProductIndex || index;
          var targetProductId = buttonProductId || product.id;
          logger.log('Remove product clicked with data:', {
            estimateId: targetEstimateId,
            roomId: targetRoomId,
            productIndex: targetProductIndex,
            productId: targetProductId
          });

          // Call handleProductRemoval with the data attributes from the button
          _this4.handleProductRemoval(targetEstimateId, targetRoomId, targetProductIndex, targetProductId);
        };
        removeButton.addEventListener('click', removeButton._clickHandler);
      } else {
        logger.log('Remove button not found in product element');
      }

      // Bind variation select
      var variationSelect = productElement.querySelector('.variation-select');
      if (variationSelect) {
        if (variationSelect._changeHandler) {
          variationSelect.removeEventListener('change', variationSelect._changeHandler);
        }
        variationSelect._changeHandler = function (e) {
          var variationId = e.target.value;
          _this4.handleVariationSelection(variationId, productElement, estimateId, roomId, index, product.id);
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
  }, {
    key: "handleProductRemoval",
    value: function handleProductRemoval(estimateId, roomId, productIndex, productId) {
      var _this5 = this;
      logger.log('Handling product removal', {
        estimateId: estimateId,
        roomId: roomId,
        productIndex: productIndex,
        productId: productId
      });

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
        Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../ConfirmationDialog */ "./src/js/frontend/ConfirmationDialog.js")).then(function (module) {
          var ConfirmationDialog = module["default"];
          _this5.modalManager.confirmationDialog = new ConfirmationDialog();

          // Now show the dialog with the newly created instance
          // Pass all parameters including productId
          _this5._showProductRemovalDialog(estimateId, roomId, productIndex, productId);
        })["catch"](function (error) {
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
  }, {
    key: "_showProductRemovalDialog",
    value: function _showProductRemovalDialog(estimateId, roomId, productIndex, productId) {
      var _this6 = this;
      // Log the parameters to ensure they're all present
      logger.log('Showing product removal dialog with params:', {
        estimateId: estimateId,
        roomId: roomId,
        productIndex: productIndex,
        productId: productId
      });

      // Show the confirmation dialog using the dedicated component
      this.modalManager.confirmationDialog.show({
        // TODO: Implement labels from localization system
        title: 'Remove Product',
        message: 'Are you sure you want to remove this product from the room?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'product',
        action: 'delete',
        onConfirm: function onConfirm() {
          // User confirmed, remove the product
          // Pass all parameters including productId
          _this6.performProductRemoval(estimateId, roomId, productIndex, productId);
        },
        onCancel: function onCancel() {
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
  }, {
    key: "performProductRemoval",
    value: function performProductRemoval(estimateId, roomId, productIndex, productId) {
      var _this7 = this;
      logger.log('Performing product removal', {
        estimateId: estimateId,
        roomId: roomId,
        productIndex: productIndex,
        productId: productId
      });

      // Validate productId before proceeding
      if (!productId || productId === 'undefined') {
        var error = new Error("Cannot remove product: Invalid product ID (".concat(productId, ")"));
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
      this.dataService.removeProductFromRoom(estimateId, roomId, productIndex, productId).then(function (result) {
        logger.log('Product removed successfully:', result);

        // Find and remove the product element from the DOM using all available attributes
        // Using both productIndex and productId for more robust element selection
        var productElement = document.querySelector(".product-item[data-product-id=\"".concat(productId, "\"][data-room-id=\"").concat(roomId, "\"][data-estimate-id=\"").concat(estimateId, "\"], ") + ".product-item[data-product-index=\"".concat(productIndex, "\"][data-room-id=\"").concat(roomId, "\"][data-estimate-id=\"").concat(estimateId, "\"]"));
        if (productElement) {
          productElement.remove();

          // Find the product list container for this room
          var productsContainer = document.querySelector(".room-item[data-room-id=\"".concat(roomId, "\"][data-estimate-id=\"").concat(estimateId, "\"] .product-list, ") + ".accordion-item[data-room-id=\"".concat(roomId, "\"][data-estimate-id=\"").concat(estimateId, "\"] .product-list"));

          // Check if there are any products left in the container
          if (productsContainer) {
            var remainingProducts = productsContainer.querySelectorAll('.product-item');

            // If there are no remaining products, show the empty products template
            if (remainingProducts.length === 0) {
              logger.log('No products remaining in room, showing empty products template');
              // Clear any existing content
              productsContainer.innerHTML = '';
              // Insert the empty products template
              _TemplateEngine__WEBPACK_IMPORTED_MODULE_4__["default"].insert('products-empty-template', {}, productsContainer);
            }
          }
        } else {
          logger.log('Product element not found in DOM after removal. It may have been removed already.');
        }

        // Update room totals
        if (_this7.modalManager && _this7.modalManager.roomManager) {
          _this7.modalManager.roomManager.updateRoomTotals(estimateId, roomId, {
            total: result.roomTotal
          });

          // Update room primary product display
          // This will refresh the primary product image and name in the room header
          _this7.modalManager.roomManager.updateRoomPrimaryProduct(estimateId, roomId);
        }

        // Hide loading
        if (_this7.modalManager) {
          _this7.modalManager.hideLoading();
        }
      })["catch"](function (error) {
        logger.error('Error removing product:', error);

        // Hide loading
        if (_this7.modalManager) {
          _this7.modalManager.hideLoading();

          // Show error message using ConfirmationDialog
          if (_this7.modalManager.confirmationDialog) {
            _this7.modalManager.confirmationDialog.show({
              title: 'Error',
              message: 'Error removing product. Please try again.',
              type: 'product',
              action: 'error',
              showCancel: false,
              confirmText: 'OK'
            });
          } else {
            // Fallback to modalManager.showError
            _this7.modalManager.showError('Error removing product. Please try again.');
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
  }, {
    key: "handleVariationSelection",
    value: function handleVariationSelection(variationId, productElement, estimateId, roomId, productIndex, productId) {
      var _this8 = this;
      logger.log('Handling variation selection', {
        variationId: variationId,
        estimateId: estimateId,
        roomId: roomId,
        productIndex: productIndex,
        productId: productId
      });
      if (!productElement) {
        logger.error('Product element not provided for variation selection');
        return;
      }

      // Show loading if we have a modal available
      if (this.modalManager) {
        this.modalManager.showLoading();
      }

      // Update the selected variation in the dataService
      this.dataService.updateProductVariation(estimateId, roomId, productIndex, variationId).then(function (result) {
        logger.log('Variation updated successfully:', result);

        // Update the price display
        var priceElement = productElement.querySelector('.product-price');
        if (priceElement && result.updatedProduct) {
          priceElement.textContent = _utils__WEBPACK_IMPORTED_MODULE_2__.format.currency(result.updatedProduct.price || 0);
        }

        // Update room totals
        if (_this8.modalManager && _this8.modalManager.roomManager) {
          _this8.modalManager.roomManager.updateRoomTotals(estimateId, roomId, {
            total: result.roomTotal
          });
        }

        // Hide loading
        if (_this8.modalManager) {
          _this8.modalManager.hideLoading();
        }
      })["catch"](function (error) {
        logger.error('Error updating variation:', error);

        // Reset the select back to the original value
        var variationSelect = productElement.querySelector('.variation-select');
        if (variationSelect) {
          // Find the current selected variation from the product
          _this8.dataService.getProductsForRoom(estimateId, roomId).then(function (products) {
            var product = products[productIndex];
            if (product && product.selectedVariation) {
              variationSelect.value = product.selectedVariation;
            } else {
              variationSelect.value = '';
            }
          })["catch"](function () {
            variationSelect.value = '';
          });
        }

        // Show error
        if (_this8.modalManager) {
          _this8.modalManager.hideLoading();
          var confirmationDialog = _this8.modalManager.confirmationDialog;
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
            _this8.modalManager.showError('Error updating variation. Please try again.');
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
  }, {
    key: "replaceProductInRoom",
    value: function replaceProductInRoom(estimateId, roomId, oldProductId, newProductId) {
      var _this9 = this;
      logger.log('Replacing product in room', {
        estimateId: estimateId,
        roomId: roomId,
        oldProductId: oldProductId,
        newProductId: newProductId
      });

      // Show loading
      if (this.modalManager) {
        this.modalManager.showLoading();
      }

      // Use dataService to replace the product
      this.dataService.replaceProductInRoom(estimateId, roomId, oldProductId, newProductId).then(function () {
        logger.log('Product replaced successfully');

        // Hide loading
        if (_this9.modalManager) {
          _this9.modalManager.hideLoading();
        }

        // Navigate to the estimate list with the estimate and room expanded
        if (_this9.modalManager && _this9.modalManager.estimateManager) {
          // Show the estimates list with the specific estimate and room expanded
          _this9.modalManager.estimateManager.showEstimatesList(estimateId, roomId);

          // Show success dialog after a brief delay to ensure the view has loaded
          setTimeout(function () {
            if (_this9.modalManager.confirmationDialog) {
              _this9.modalManager.confirmationDialog.show({
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
          var roomElement = document.querySelector(".room-item[data-room-id=\"".concat(roomId, "\"][data-estimate-id=\"").concat(estimateId, "\"]"));
          if (roomElement) {
            var productsContainer = roomElement.querySelector('.room-products-container');
            if (productsContainer) {
              // Mark as not loaded to force reload
              delete productsContainer.dataset.loaded;
              _this9.loadProductsForRoom(estimateId, roomId, productsContainer);
            }
          }
        }
      })["catch"](function (error) {
        logger.error('Error replacing product:', error);

        // Hide loading
        if (_this9.modalManager) {
          _this9.modalManager.hideLoading();
        }

        // Show error dialog
        if (_this9.modalManager && _this9.modalManager.confirmationDialog) {
          _this9.modalManager.confirmationDialog.show({
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
  }, {
    key: "onModalClosed",
    value: function onModalClosed() {
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
  }, {
    key: "handleProductVariationSelection",
    value: function handleProductVariationSelection(productId, options) {
      var _this0 = this;
      var action = options.action,
        estimateId = options.estimateId,
        roomId = options.roomId,
        replaceProductId = options.replaceProductId,
        room = options.room,
        button = options.button;
      logger.log("Handling product variation selection for ".concat(action), {
        productId: productId,
        estimateId: estimateId,
        roomId: roomId
      });

      // Store original button state if provided
      var originalButtonState = null;
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
      return this.dataService.getProductVariationData(productId).then(function (variationData) {
        // Check if product has variations
        if (variationData && variationData.isVariable && variationData.variations && variationData.variations.length > 0) {
          var productData = {
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
          return new Promise(function (resolve, reject) {
            if (_this0.modalManager.productSelectionDialog) {
              _this0.modalManager.productSelectionDialog.show({
                product: productData,
                variations: productData.variations,
                attributes: productData.attributes || {},
                action: action,
                onSelect: function onSelect(selectedData) {
                  logger.log('Variation selected:', selectedData);
                  var selectedVariationId = selectedData.variationId;
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
                    resolve(_this0.addProductToRoom(estimateId, roomId, selectedVariationId));
                  } else if (action === 'replace') {
                    resolve(_this0.replaceProductInRoom(estimateId, roomId, replaceProductId, selectedVariationId));
                  } else {
                    reject(new Error("Unknown action: ".concat(action)));
                  }
                },
                onCancel: function onCancel() {
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
            return _this0.addProductToRoom(estimateId, roomId, productId);
          } else if (action === 'replace') {
            return _this0.replaceProductInRoom(estimateId, roomId, replaceProductId, productId);
          } else {
            throw new Error("Unknown action: ".concat(action));
          }
        }
      })["finally"](function () {
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
  }]);
}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProductManager);

/***/ }),

/***/ "./src/js/frontend/managers/RoomManager.js":
/*!*************************************************!*\
  !*** ./src/js/frontend/managers/RoomManager.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/* harmony import */ var _EstimateStorage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../EstimateStorage */ "./src/js/frontend/EstimateStorage.js");
/* harmony import */ var _TemplateEngine__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../TemplateEngine */ "./src/js/frontend/TemplateEngine.js");


/**
 * RoomManager.js
 *
 * Handles all operations related to rooms:
 * - Rendering rooms in estimates
 * - Creating new rooms
 * - Removing rooms
 * - Updating room totals
 */




var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.createLogger)('RoomManager');
var RoomManager = /*#__PURE__*/function () {
  /**
   * Initialize the RoomManager
   * @param {object} config - Configuration options
   * @param {object} dataService - The data service instance
   * @param {object} modalManager - Reference to the parent modal manager
   */
  function RoomManager() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var dataService = arguments.length > 1 ? arguments[1] : undefined;
    var modalManager = arguments.length > 2 ? arguments[2] : undefined;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, RoomManager);
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
  }

  /**
   * Initialize the room manager
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(RoomManager, [{
    key: "init",
    value: function init() {
      // Get references to DOM elements from the modal manager
      this.newRoomForm = this.modalManager.newRoomForm;
      this.roomSelectionForm = this.modalManager.roomSelectionForm;
      this.bindEvents();
      logger.log('RoomManager initialized');
    }

    /**
     * Bind event listeners related to rooms
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      // We'll implement this later when we move the room-specific bindings
      logger.log('RoomManager events bound');
    }

    /**
     * Get the name of a room
     * @param {string} estimateId - The estimate ID
     * @param {string} roomId - The room ID
     * @returns {string} The room name or a default value
     */
  }, {
    key: "getRoomName",
    value: function getRoomName(estimateId, roomId) {
      var estimateData = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_3__.loadEstimateData)();
      if (estimateData && estimateData.estimates) {
        var estimate = estimateData.estimates[estimateId];
        if (estimate && estimate.rooms && estimate.rooms[roomId]) {
          return estimate.rooms[roomId].name || "Room #".concat(roomId);
        }
      }
      return 'selected room';
    }

    /**
     * Show the room selection form
     * @param {string} estimateId - The estimate ID
     * @param {string|null} productId - Optional product ID to add
     */
  }, {
    key: "showRoomSelectionForm",
    value: function showRoomSelectionForm(estimateId) {
      var _this = this;
      var productId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      logger.log('Showing room selection form', {
        estimateId: estimateId,
        productId: productId
      });

      // Save the current estimate and product IDs
      this.currentEstimateId = estimateId;
      this.currentProductId = productId;

      // Get the room selection form container from the modal manager
      var roomSelectionForm = this.modalManager.roomSelectionForm;
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
      this.dataService.getEstimate(estimateId).then(function (estimate) {
        if (!estimate) {
          throw new Error("Estimate with ID ".concat(estimateId, " not found"));
        }

        // Check if the estimate has any rooms
        var hasRooms = estimate.rooms && Object.keys(estimate.rooms).length > 0;

        // If the estimate has no rooms, show the new room form directly
        if (!hasRooms) {
          logger.log('Estimate has no rooms, showing new room form directly');
          _this.modalManager.hideLoading();
          _this.showNewRoomForm(estimateId, productId);
          return;
        }

        // Use TemplateEngine to insert the template
        try {
          // Clear existing content first in case it was loaded before
          roomSelectionForm.innerHTML = '';

          // Insert the template with the estimate name
          _TemplateEngine__WEBPACK_IMPORTED_MODULE_4__["default"].insert('room-selection-form-template', {
            estimateName: estimate.name || "Estimate #".concat(estimate.id)
          }, roomSelectionForm);
          logger.log('Room selection form template inserted into wrapper.');

          // Find the form element
          var formElement = roomSelectionForm.querySelector('form');
          if (formElement) {
            // Store estimate ID and product ID as data attributes on the form
            formElement.dataset.estimateId = estimateId;
            if (productId) {
              formElement.dataset.productId = productId;
            } else {
              delete formElement.dataset.productId;
            }

            // Load the rooms for this estimate
            _this.loadRoomsForSelection(estimateId, formElement).then(function () {
              // Bind events to the form
              _this.bindRoomSelectionFormEvents(formElement, estimateId, productId);
              _this.modalManager.hideLoading();
            })["catch"](function (error) {
              logger.error('Error loading rooms for selection:', error);
              _this.modalManager.showError('Error loading rooms. Please try again.');
              _this.modalManager.hideLoading();
            });
          } else {
            logger.error('Form element not found inside the template after insertion!');
            _this.modalManager.showError('Error rendering form template. Please try again.');
            _this.modalManager.hideLoading();
          }
        } catch (error) {
          logger.error('Error inserting room selection form template:', error);
          _this.modalManager.showError('Error loading form template. Please try again.');
          _this.modalManager.hideLoading();
        }
      })["catch"](function (error) {
        logger.error('Error fetching estimate details:', error);
        _this.modalManager.showError('Error loading estimate details. Please try again.');
        _this.modalManager.hideLoading();
      });
    }

    /**
     * Load rooms for selection form
     * @param {string} estimateId - The estimate ID
     * @param {HTMLFormElement} formElement - The form element
     * @returns {Promise} - Promise that resolves when rooms are loaded
     */
  }, {
    key: "loadRoomsForSelection",
    value: function loadRoomsForSelection(estimateId, formElement) {
      logger.log('Loading rooms for selection form', {
        estimateId: estimateId
      });
      var selectElement = formElement.querySelector('select');
      if (!selectElement) {
        return Promise.reject(new Error('Select element not found in form'));
      }

      // Load rooms from storage or API
      return this.dataService.getRoomsForEstimate(estimateId).then(function (response) {
        // Extract the rooms array from the response
        // The response is an object with { has_rooms: boolean, rooms: Array }
        var hasRooms = response && response.has_rooms ? response.has_rooms : false;
        var roomsArray = response && response.rooms ? response.rooms : [];
        logger.log('Got rooms for selection, has_rooms:', hasRooms, 'count:', roomsArray.length);

        // Clear existing options
        selectElement.innerHTML = '';

        // Add default option using template
        _TemplateEngine__WEBPACK_IMPORTED_MODULE_4__["default"].insert('select-option-template', {
          value: '',
          text: '-- Select a room --'
        }, selectElement);

        // Add options for each room
        if (hasRooms && roomsArray.length > 0) {
          roomsArray.forEach(function (room) {
            // Use template for each option
            _TemplateEngine__WEBPACK_IMPORTED_MODULE_4__["default"].insert('select-option-template', {
              value: room.id,
              text: room.name || "Room #".concat(room.id)
            }, selectElement);
          });

          // Enable the select element and form buttons
          selectElement.disabled = false;
          var submitButton = formElement.querySelector('button[type="submit"]');
          if (submitButton) submitButton.disabled = false;
        } else {
          // No rooms available, show message using template
          _TemplateEngine__WEBPACK_IMPORTED_MODULE_4__["default"].insert('select-option-template', {
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
  }, {
    key: "bindRoomSelectionFormEvents",
    value: function bindRoomSelectionFormEvents(formElement, estimateId) {
      var _this2 = this;
      var productId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      logger.log('Binding events to room selection form', {
        estimateId: estimateId,
        productId: productId
      });
      if (!formElement) {
        logger.error('Form element not available for binding events');
        return;
      }

      // Remove any existing event listeners to prevent duplicates
      if (formElement._submitHandler) {
        formElement.removeEventListener('submit', formElement._submitHandler);
      }

      // Create new submit handler
      formElement._submitHandler = function (e) {
        e.preventDefault();

        // Show loading indicator
        _this2.modalManager.showLoading();

        // Get the selected room ID
        var selectElement = formElement.querySelector('select');
        var roomId = selectElement.value;
        if (!roomId) {
          _this2.modalManager.showError('Please select a room or create a new one.');
          _this2.modalManager.hideLoading();
          return;
        }

        // If a product ID is provided, add it to the room
        if (productId) {
          // Delegate to the ProductManager to add product to the selected room
          if (_this2.modalManager.productManager) {
            _this2.modalManager.productManager.addProductToRoom(estimateId, roomId, productId).then(function () {
              // Hide loading
              _this2.modalManager.hideLoading();

              // First show the estimates list with the relevant room expanded
              if (_this2.modalManager.estimateManager) {
                _this2.modalManager.estimateManager.showEstimatesList(estimateId, roomId);
              }

              // Then show a confirmation dialog using ConfirmationDialog
              if (_this2.modalManager && _this2.modalManager.confirmationDialog) {
                setTimeout(function () {
                  _this2.modalManager.confirmationDialog.show({
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
            })["catch"](function (error) {
              // If it's a duplicate product error, the dialog is already shown by ProductManager
              // and we don't need to do anything else here
              if (error && error.data && error.data.duplicate) {
                return; // Dialog already shown, just return
              }

              // Handle other errors
              logger.log('Error adding product to room:', error);
              _this2.modalManager.showError('Error adding product to room. Please try again.');
              _this2.modalManager.hideLoading();
            });
          } else {
            logger.error('ProductManager not available for addProductToRoom');
            _this2.modalManager.hideLoading();
          }
        } else {
          // No product ID, just close the form or navigate to room details
          _this2.modalManager.hideLoading();

          // Switch view to show the estimate with the selected room expanded
          if (_this2.modalManager.estimateManager) {
            _this2.modalManager.estimateManager.showEstimatesList(estimateId, roomId);
          } else {
            _this2.modalManager.closeModal();
          }
        }
      };

      // Add the submit handler
      formElement.addEventListener('submit', formElement._submitHandler);

      // Add event handler for "Add New Room" button
      // The template uses ID "add-new-room-from-selection" and class "add-room"
      var newRoomButton = formElement.querySelector('#add-new-room-from-selection, .add-room');
      if (newRoomButton) {
        if (newRoomButton._clickHandler) {
          newRoomButton.removeEventListener('click', newRoomButton._clickHandler);
        }
        newRoomButton._clickHandler = function (e) {
          e.preventDefault();
          logger.log('Add New Room button clicked');
          _this2.showNewRoomForm(estimateId, productId);
        };
        newRoomButton.addEventListener('click', newRoomButton._clickHandler);
        logger.log('Add New Room button handler attached');
      } else {
        logger.log('Add New Room button not found in form');
      }

      // Add event handler for cancel/back buttons (either one may be present)
      // The template uses classes "cancel-btn" and "back-btn" together
      var cancelButton = formElement.querySelector('.cancel-btn, .back-btn, .cancel-button');
      if (cancelButton) {
        if (cancelButton._clickHandler) {
          cancelButton.removeEventListener('click', cancelButton._clickHandler);
        }
        cancelButton._clickHandler = function (e) {
          e.preventDefault();
          logger.log('Cancel/Back button clicked');

          // Go back to estimate selection or close the modal
          if (productId && _this2.modalManager.estimateManager) {
            _this2.modalManager.estimateManager.showEstimateSelection(productId);
          } else {
            _this2.modalManager.closeModal();
          }
        };
        cancelButton.addEventListener('click', cancelButton._clickHandler);
        logger.log('Cancel/Back button handler attached');
      } else {
        logger.log('Cancel/Back button not found in form');
      }

      // Check for a separate back button if it exists distinctly
      var backButton = formElement.querySelector('.back-button:not(.cancel-btn)');
      if (backButton && backButton !== cancelButton) {
        if (backButton._clickHandler) {
          backButton.removeEventListener('click', backButton._clickHandler);
        }
        backButton._clickHandler = function (e) {
          e.preventDefault();
          logger.log('Separate back button clicked');

          // Go back to estimate selection
          if (_this2.modalManager.estimateManager) {
            _this2.modalManager.estimateManager.showEstimateSelection(productId);
          } else {
            _this2.modalManager.closeModal();
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
  }, {
    key: "loadRoomsForEstimate",
    value: function loadRoomsForEstimate(estimateId, container) {
      var _this3 = this;
      var expandRoomId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var bypassCache = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      logger.log('Loading rooms for estimate', {
        estimateId: estimateId,
        expandRoomId: expandRoomId,
        bypassCache: bypassCache
      });
      if (!container) {
        return Promise.reject(new Error('Container not provided for loading rooms'));
      }

      // Show loading indicator
      var loadingPlaceholder = container.querySelector('.loading-placeholder');
      if (loadingPlaceholder) {
        loadingPlaceholder.style.display = 'block';
      }

      // Create rooms container if it doesn't exist
      var roomsContainer = container.querySelector('.estimate-rooms-container');
      if (!roomsContainer) {
        // Use TemplateEngine to create the rooms container
        _TemplateEngine__WEBPACK_IMPORTED_MODULE_4__["default"].insert('rooms-container-template', {}, container);
        roomsContainer = container.querySelector('.estimate-rooms-container');
      }

      // Load rooms from storage or API
      return this.dataService.getRoomsForEstimate(estimateId, bypassCache).then(function (response) {
        // Clear existing content
        roomsContainer.innerHTML = '';

        // Check if response has rooms array and if it's empty
        // DataService.getRoomsForEstimate returns { has_rooms: boolean, rooms: Array }
        var roomsArray = response && response.rooms ? response.rooms : [];
        var hasRooms = response && response.has_rooms ? response.has_rooms : false;
        if (!hasRooms || roomsArray.length === 0) {
          // No rooms, show empty state using template
          logger.log("No rooms found for estimate ".concat(estimateId, ", showing empty template"));
          _TemplateEngine__WEBPACK_IMPORTED_MODULE_4__["default"].insert('rooms-empty-template', {}, roomsContainer);
        } else {
          // Render each room
          var roomPromises = roomsArray.map(function (room) {
            // Check if this room should be expanded
            var shouldExpand = expandRoomId === room.id;

            // Render the room
            return _this3.renderRoom(room, room.id, estimateId, roomsContainer, shouldExpand);
          });
          return Promise.all(roomPromises);
        }

        // Hide loading placeholder
        if (loadingPlaceholder) {
          loadingPlaceholder.style.display = 'none';
        }
        return response;
      })["catch"](function (error) {
        logger.error('Error loading rooms for estimate:', error);

        // Show error message using template
        _TemplateEngine__WEBPACK_IMPORTED_MODULE_4__["default"].insert('room-error-template', {}, roomsContainer);

        // Hide loading placeholder
        if (loadingPlaceholder) {
          loadingPlaceholder.style.display = 'none';
        }
        throw error;
      });
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
  }, {
    key: "renderRoom",
    value: function renderRoom(room, roomId, estimateId, container) {
      var expand = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      logger.log('Rendering room', {
        roomId: roomId,
        estimateId: estimateId,
        expand: expand
      });
      if (!container) {
        return Promise.reject(new Error('Container not provided for rendering room'));
      }

      // Get primary category product for the room
      var primaryProductImage = null;
      var primaryProductName = null;
      logger.log('Looking for primary product in room:', {
        roomName: room.name,
        primaryCategoryProductId: room.primary_category_product_id,
        productsObject: room.products,
        productsKeys: room.products ? Object.keys(room.products) : [],
        roomStructure: room
      });
      if (room.primary_category_product_id && room.products) {
        var primaryProduct = room.products[room.primary_category_product_id];
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
      var templateData = {
        id: roomId,
        // For direct data attribute setting
        room_id: roomId,
        // For direct data attribute setting
        estimate_id: estimateId,
        // For direct data attribute setting
        roomId: roomId,
        // For backward compatibility
        estimateId: estimateId,
        // For backward compatibility
        roomName: room.name || "Room #".concat(roomId),
        room_name: room.name || "Room #".concat(roomId),
        'room-name': room.name || "Room #".concat(roomId),
        // Add hyphenated version for class matching
        roomTotal: _utils__WEBPACK_IMPORTED_MODULE_2__.format.currency(room.total || 0),
        room_price: _utils__WEBPACK_IMPORTED_MODULE_2__.format.currency(room.total || 0),
        'room-price': _utils__WEBPACK_IMPORTED_MODULE_2__.format.currency(room.total || 0),
        // Add hyphenated version for class matching
        room_dimensions: room.dimensions_display || (room.width && room.length ? "".concat(room.width, "m x ").concat(room.length, "m") : ''),
        'room-dimensions': room.dimensions_display || (room.width && room.length ? "".concat(room.width, "m x ").concat(room.length, "m") : ''),
        // Add hyphenated version for class matching
        primary_product_image: primaryProductImage,
        // Add primary product image
        primary_product_name: primaryProductName || '',
        // Add primary product name
        'primary-product-name': primaryProductName || '',
        // Add hyphenated version for class matching
        has_primary_product: !!primaryProductImage,
        // Flag to show/hide image
        isExpanded: expand
      };

      // Log the template data we're using to ensure attributes get set
      logger.log('Room template data:', templateData);

      // Direct insertion into container using TemplateEngine
      _TemplateEngine__WEBPACK_IMPORTED_MODULE_4__["default"].insert('room-item-template', templateData, container);

      // Get the room element that was just inserted (should be last child)
      var roomElement = container.lastElementChild;

      // Double-check data attributes are set correctly
      if (roomElement) {
        // Ensure room element has the room-item class for consistent selection
        roomElement.classList.add('room-item');

        // Explicitly set data attributes on the room element
        roomElement.dataset.roomId = roomId;
        roomElement.dataset.estimateId = estimateId;

        // Also set data attributes on the remove button
        var removeButton = roomElement.querySelector('.remove-room');
        if (removeButton) {
          removeButton.dataset.roomId = roomId;
          removeButton.dataset.estimateId = estimateId;
        }

        // Set expanded state if needed
        var header = roomElement.querySelector('.accordion-header-wrapper');
        if (header && expand) {
          header.classList.add('expanded');
        }

        // Set content display based on expand flag
        var content = roomElement.querySelector('.accordion-content');
        if (content) {
          content.style.display = expand ? 'block' : 'none';
        }

        // Add loading placeholder to products container
        var productsContainer = roomElement.querySelector('.product-list');
        if (productsContainer) {
          // Use TemplateEngine to create the loading placeholder
          _TemplateEngine__WEBPACK_IMPORTED_MODULE_4__["default"].insert('loading-placeholder-template', {
            message: 'Loading products...'
          }, productsContainer);
        }

        // Bind event handlers for this room
        this.bindRoomEvents(roomElement, estimateId, roomId);

        // If the room is expanded, load its products
        if (expand && content && content.style.display === 'block') {
          var _productsContainer = roomElement.querySelector('.product-list');

          // Delegate to ProductManager to load products for this room
          if (this.modalManager.productManager && _productsContainer) {
            return this.modalManager.productManager.loadProductsForRoom(estimateId, roomId, _productsContainer);
          }
        }

        // Log that the room element was rendered with the expected attributes
        logger.log("Room element rendered with data-room-id=".concat(roomElement.dataset.roomId, " and data-estimate-id=").concat(roomElement.dataset.estimateId));
      } else {
        logger.error('Failed to find rendered room element after insertion');
      }
      return Promise.resolve(roomElement);
    }

    /**
     * Bind events to a room element
     * @param {HTMLElement} roomElement - The room element
     * @param {string} estimateId - The estimate ID
     * @param {string} roomId - The room ID
     */
  }, {
    key: "bindRoomEvents",
    value: function bindRoomEvents(roomElement, estimateId, roomId) {
      var _this4 = this;
      logger.log('Binding events to room element', {
        estimateId: estimateId,
        roomId: roomId
      });
      if (!roomElement) {
        logger.error('Room element not available for binding events');
        return;
      }

      // Bind accordion header click for expanding/collapsing
      var accordionHeader = roomElement.querySelector('.accordion-header');
      if (accordionHeader) {
        if (accordionHeader._clickHandler) {
          accordionHeader.removeEventListener('click', accordionHeader._clickHandler);
        }
        accordionHeader._clickHandler = function (e) {
          // Don't toggle if clicking on a button with specific functionality
          if (e.target.closest('button:not(.accordion-header)')) {
            return;
          }
          var headerWrapper = accordionHeader.closest('.accordion-header-wrapper');
          var content = roomElement.querySelector('.accordion-content');
          if (!content || !headerWrapper) return;

          // Toggle expanded state
          var isExpanded = headerWrapper.classList.contains('expanded');
          if (isExpanded) {
            headerWrapper.classList.remove('expanded');
            content.style.display = 'none';
          } else {
            headerWrapper.classList.add('expanded');
            content.style.display = 'block';

            // Load products if not already loaded
            var productsContainer = content.querySelector('.product-list');
            if (productsContainer && !productsContainer.dataset.loaded) {
              productsContainer.dataset.loaded = 'true';

              // Delegate to ProductManager to load products
              if (_this4.modalManager.productManager) {
                _this4.modalManager.productManager.loadProductsForRoom(estimateId, roomId, productsContainer);
              }
            }
          }
        };
        accordionHeader.addEventListener('click', accordionHeader._clickHandler);
      }

      // Bind remove button
      var removeButton = roomElement.querySelector('.remove-room');
      if (removeButton) {
        if (removeButton._clickHandler) {
          removeButton.removeEventListener('click', removeButton._clickHandler);
        }
        removeButton._clickHandler = function (e) {
          e.preventDefault();
          e.stopPropagation();
          _this4.handleRoomRemoval(estimateId, roomId);
        };
        removeButton.addEventListener('click', removeButton._clickHandler);
      }

      // Bind add product functionality - add a button if it doesn't exist in the template
      var addProductButton = roomElement.querySelector('.add-product-button');
      if (!addProductButton) {
        // Create add product button if it doesn't exist in the template using TemplateEngine
        var productList = roomElement.querySelector('.product-list');
        if (productList && productList.parentElement) {
          // Insert the actions footer template after the product list
          _TemplateEngine__WEBPACK_IMPORTED_MODULE_4__["default"].insert('room-actions-footer-template', {}, productList.parentElement);

          // Get the newly added button
          addProductButton = roomElement.querySelector('.add-product-button');
        }
      }
      if (addProductButton) {
        if (addProductButton._clickHandler) {
          addProductButton.removeEventListener('click', addProductButton._clickHandler);
        }
        addProductButton._clickHandler = function (e) {
          e.preventDefault();
          e.stopPropagation();

          // Delegate to ProductManager to show product selection
          if (_this4.modalManager.productManager) {
            _this4.modalManager.productManager.showProductSelection(estimateId, roomId);
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
  }, {
    key: "showNewRoomForm",
    value: function showNewRoomForm(estimateId) {
      var productId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      logger.log('Showing new room form', {
        estimateId: estimateId,
        productId: productId
      });

      // Save the current estimate and product IDs
      this.currentEstimateId = estimateId;
      this.currentProductId = productId;

      // Get the new room form container from the modal manager
      var newRoomForm = this.modalManager.newRoomForm;
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
        var templateData = {};

        // Insert the template with our data
        _TemplateEngine__WEBPACK_IMPORTED_MODULE_4__["default"].insert('new-room-form-template', templateData, newRoomForm);
        logger.log('New room form template inserted into wrapper.');

        // Find the form element
        var formElement = newRoomForm.querySelector('form');
        if (formElement) {
          // Store estimate ID and product ID as data attributes on the form
          formElement.dataset.estimateId = estimateId;
          if (productId) {
            formElement.dataset.productId = productId;

            // Update the submit button text if we're in the add product flow
            var submitButton = formElement.querySelector('.submit-btn');
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
  }, {
    key: "bindNewRoomFormEvents",
    value: function bindNewRoomFormEvents(formElement, estimateId) {
      var _this5 = this;
      var productId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      logger.log('Binding events to new room form', {
        estimateId: estimateId,
        productId: productId
      });
      if (!formElement) {
        logger.error('Form element not available for binding events');
        return;
      }

      // Remove any existing event listeners to prevent duplicates
      if (formElement._submitHandler) {
        formElement.removeEventListener('submit', formElement._submitHandler);
      }

      // Create new submit handler
      formElement._submitHandler = function (e) {
        e.preventDefault();

        // Show loading indicator
        _this5.modalManager.showLoading();

        // Get the form data
        var formData = new FormData(formElement);
        var roomName = formData.get('room_name');
        var roomWidth = formData.get('room_width');
        var roomLength = formData.get('room_length');
        if (!roomName) {
          _this5.modalManager.showError('Please enter a room name.');
          _this5.modalManager.hideLoading();
          return;
        }
        if (!roomWidth || !roomLength) {
          _this5.modalManager.showError('Please enter room dimensions.');
          _this5.modalManager.hideLoading();
          return;
        }

        // Create the room
        _this5.dataService.addNewRoom({
          room_name: roomName,
          room_width: roomWidth,
          room_length: roomLength
        }, estimateId, productId).then(function (newRoom) {
          logger.log('Room created successfully:', newRoom);

          // If a product ID is provided, add it to the new room
          if (productId) {
            // Delegate to the ProductManager to add product to the new room
            if (_this5.modalManager.productManager) {
              logger.log("[DEBUG][ROOM]".toJSON(newRoom));
              return _this5.modalManager.productManager.addProductToRoom(estimateId, newRoom.room_id, productId).then(function () {
                // Hide loading
                _this5.modalManager.hideLoading();

                // First show the estimates list with the newly created room expanded
                if (_this5.modalManager.estimateManager) {
                  _this5.modalManager.estimateManager.showEstimatesList(estimateId, newRoom.room_id);
                }

                // Then show a confirmation dialog using ConfirmationDialog (with slight delay to allow UI to render)
                if (_this5.modalManager && _this5.modalManager.confirmationDialog) {
                  setTimeout(function () {
                    _this5.modalManager.confirmationDialog.show({
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
              })["catch"](function (error) {
                // If it's a duplicate product error, the dialog is already shown by ProductManager
                if (error && error.data && error.data.duplicate) {
                  // Still show the estimates list with the newly created room
                  if (_this5.modalManager.estimateManager) {
                    _this5.modalManager.estimateManager.showEstimatesList(estimateId, newRoom.room_id);
                  }
                  _this5.modalManager.hideLoading();
                  return; // Dialog for duplicate already shown, just return
                }

                // For other errors, log and rethrow so the main catch handler can process it
                logger.log('Error adding product to new room:', error);
                _this5.modalManager.hideLoading();
                throw error;
              });
            } else {
              logger.error('ProductManager not available for addProductToRoom');
              _this5.modalManager.hideLoading();

              // First show the estimates list with the newly created room expanded
              if (_this5.modalManager.estimateManager) {
                _this5.modalManager.estimateManager.showEstimatesList(estimateId, newRoom.id);
              }

              // Then show a confirmation dialog using ConfirmationDialog (with slight delay to allow UI to render)
              if (_this5.modalManager && _this5.modalManager.confirmationDialog) {
                setTimeout(function () {
                  _this5.modalManager.confirmationDialog.show({
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
            _this5.modalManager.hideLoading();

            // First, switch view to show the estimate with the new room expanded
            if (_this5.modalManager.estimateManager) {
              _this5.modalManager.estimateManager.showEstimatesList(estimateId, newRoom.id);

              // Then show a confirmation dialog
              if (_this5.modalManager && _this5.modalManager.confirmationDialog) {
                setTimeout(function () {
                  _this5.modalManager.confirmationDialog.show({
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
              if (_this5.modalManager && _this5.modalManager.confirmationDialog) {
                _this5.modalManager.confirmationDialog.show({
                  title: 'Room Created',
                  message: 'The room has been created.',
                  type: 'room',
                  action: 'success',
                  showCancel: false,
                  confirmText: 'OK',
                  onConfirm: function onConfirm() {
                    _this5.modalManager.closeModal();
                  }
                });
              } else {
                logger.log('Room created successfully.');
                _this5.modalManager.closeModal();
              }
            }
          }
        })["catch"](function (error) {
          logger.error('Error creating room:', error);
          _this5.modalManager.showError('Error creating room. Please try again.');
          _this5.modalManager.hideLoading();
        });
      };

      // Add the submit handler
      formElement.addEventListener('submit', formElement._submitHandler);

      // Add event handler for cancel button
      var cancelButton = formElement.querySelector('.cancel-button');
      if (cancelButton) {
        if (cancelButton._clickHandler) {
          cancelButton.removeEventListener('click', cancelButton._clickHandler);
        }
        cancelButton._clickHandler = function (e) {
          e.preventDefault();

          // Go back to estimate selection if we have a product ID,
          // otherwise go to the estimates list view
          if (productId) {
            // If we're adding a product, go back to estimate selection
            if (_this5.modalManager.estimateManager) {
              _this5.modalManager.estimateManager.showEstimateSelection(productId);
            } else {
              _this5.modalManager.closeModal();
            }
          } else {
            // If we're just creating a room, go back to the estimates list
            if (_this5.modalManager.estimateManager) {
              _this5.modalManager.estimateManager.showEstimatesList();
            } else {
              _this5.modalManager.closeModal();
            }
          }
        };
        cancelButton.addEventListener('click', cancelButton._clickHandler);
      }

      // Add event handler for back button
      var backButton = formElement.querySelector('.back-button');
      if (backButton) {
        if (backButton._clickHandler) {
          backButton.removeEventListener('click', backButton._clickHandler);
        }
        backButton._clickHandler = function (e) {
          e.preventDefault();

          // Same behavior as cancel button
          if (productId) {
            // If we're adding a product, go back to estimate selection
            if (_this5.modalManager.estimateManager) {
              _this5.modalManager.estimateManager.showEstimateSelection(productId);
            } else {
              _this5.modalManager.closeModal();
            }
          } else {
            // If we're just creating a room, go back to the estimates list
            if (_this5.modalManager.estimateManager) {
              _this5.modalManager.estimateManager.showEstimatesList();
            } else {
              _this5.modalManager.closeModal();
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
  }, {
    key: "handleRoomRemoval",
    value: function handleRoomRemoval(estimateId, roomId) {
      var _this6 = this;
      logger.log('Handling room removal', {
        estimateId: estimateId,
        roomId: roomId
      });

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
        type: 'room',
        // Specify the entity type (for proper styling)
        action: 'delete',
        // Specify the action type (for proper styling)
        onConfirm: function onConfirm() {
          // User confirmed, remove the room
          _this6.performRoomRemoval(estimateId, roomId);
        },
        onCancel: function onCancel() {
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
  }, {
    key: "performRoomRemoval",
    value: function performRoomRemoval(estimateId, roomId) {
      var _this7 = this;
      logger.log('Performing room removal', {
        estimateId: estimateId,
        roomId: roomId
      });
      this.modalManager.showLoading();
      this.dataService.removeRoom(estimateId, roomId).then(function () {
        logger.log('Room removed successfully from localStorage');

        // Find the room element in the DOM - try both room-item and accordion-item classes
        // because our template uses accordion-item but we add room-item class in code
        var roomElement = document.querySelector(".room-item[data-room-id=\"".concat(roomId, "\"][data-estimate-id=\"").concat(estimateId, "\"]"));
        if (!roomElement) {
          // Try with just the original template class (accordion-item)
          roomElement = document.querySelector(".accordion-item[data-room-id=\"".concat(roomId, "\"][data-estimate-id=\"").concat(estimateId, "\"]"));
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
          logger.warn("Room element not found for removal with ID ".concat(roomId));

          // Since we've already removed the room from localStorage,
          // refresh the estimate view to ensure UI is in sync
          if (_this7.modalManager.estimateManager) {
            _this7.modalManager.estimateManager.showEstimatesList(null, estimateId);
          }
        }

        // Update estimate totals and check for empty state
        _this7.dataService.getEstimate(estimateId).then(function (estimate) {
          // Check if any rooms remain in the estimate (using storage data)
          var hasRoomsInStorage = estimate && estimate.rooms && Object.keys(estimate.rooms).length > 0;

          // Find the estimate item and rooms container
          var estimateItem = document.querySelector(".estimate-item[data-estimate-id=\"".concat(estimateId, "\"]"));
          if (estimateItem) {
            // Update the estimate total
            var totalElement = estimateItem.querySelector('.estimate-total-value');
            if (totalElement) {
              totalElement.textContent = _utils__WEBPACK_IMPORTED_MODULE_2__.format.currency(estimate.total || 0);
            }

            // Find the rooms container
            var roomsContainer = estimateItem.querySelector('.estimate-rooms-container');
            if (roomsContainer) {
              // Check if there are any room elements in the DOM
              var roomElementsInDOM = roomsContainer.querySelectorAll('.room-item, .accordion-item');
              var hasRoomsInDOM = roomElementsInDOM.length > 0;

              // If no rooms in storage OR no room elements in DOM, show empty template
              if (!hasRoomsInStorage || !hasRoomsInDOM) {
                logger.log('No rooms remaining in estimate, showing empty rooms template', {
                  hasRoomsInStorage: hasRoomsInStorage,
                  roomCountInDOM: roomElementsInDOM.length
                });

                // Clear existing content and show empty template
                roomsContainer.innerHTML = '';
                _TemplateEngine__WEBPACK_IMPORTED_MODULE_4__["default"].insert('rooms-empty-template', {}, roomsContainer);
              }
            }
          }
        })["catch"](function (error) {
          logger.error('Error updating estimate totals after room removal:', error);
        })["finally"](function () {
          _this7.modalManager.hideLoading();
        });
      })["catch"](function (error) {
        logger.error('Error removing room:', error);

        // Show error message using ConfirmationDialog
        if (_this7.modalManager && _this7.modalManager.confirmationDialog) {
          _this7.modalManager.confirmationDialog.show({
            title: 'Error',
            message: 'Error removing room. Please try again.',
            confirmText: 'OK',
            cancelText: false,
            onConfirm: function onConfirm() {
              logger.log('Error dialog closed');
            }
          });
        } else {
          // Fallback to modalManager.showError
          _this7.modalManager.showError('Error removing room. Please try again.');
        }
        _this7.modalManager.hideLoading();
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
  }, {
    key: "updateRoomTotals",
    value: function updateRoomTotals(estimateId, roomId, totals) {
      logger.log('Updating room totals', {
        estimateId: estimateId,
        roomId: roomId,
        totals: totals
      });

      // Find the room element
      var roomElement = document.querySelector(".room-item[data-room-id=\"".concat(roomId, "\"][data-estimate-id=\"").concat(estimateId, "\"]"));

      // If not found, just log a warning and store the totals for later
      if (!roomElement) {
        logger.warn('Room element not found for updating totals - will be updated on next view refresh', {
          estimateId: estimateId,
          roomId: roomId
        });
        // Store totals for later application
        this.pendingTotals = this.pendingTotals || {};
        this.pendingTotals["".concat(estimateId, ":").concat(roomId)] = totals;
        return;
      }

      // Update the total value - use room-price from template structure
      var totalElement = roomElement.querySelector('.room-price');
      if (totalElement) {
        totalElement.textContent = _utils__WEBPACK_IMPORTED_MODULE_2__.format.currency(totals.total || 0);
      } else {
        logger.warn('Room price element not found in room', {
          estimateId: estimateId,
          roomId: roomId
        });
      }

      // Update estimate totals if needed
      this.dataService.getEstimate(estimateId).then(function (estimate) {
        // Update the estimate total in the UI
        var estimateItem = document.querySelector(".estimate-item[data-estimate-id=\"".concat(estimateId, "\"]"));
        if (estimateItem) {
          var estimateTotalElement = estimateItem.querySelector('.estimate-total-value');
          if (estimateTotalElement) {
            estimateTotalElement.textContent = _utils__WEBPACK_IMPORTED_MODULE_2__.format.currency(estimate.total || 0);
          }
        }
      })["catch"](function (error) {
        logger.error('Error updating estimate totals:', error);
      });
    }

    /**
     * Update room header elements (primary product image and name) without re-rendering the entire room
     * This reuses the same logic as renderRoom for determining primary product
     * @param {string} estimateId - The estimate ID
     * @param {string} roomId - The room ID
     */
  }, {
    key: "updateRoomPrimaryProduct",
    value: function updateRoomPrimaryProduct(estimateId, roomId) {
      var _estimateData$estimat, _estimate$rooms;
      logger.log('Updating room primary product display', {
        estimateId: estimateId,
        roomId: roomId
      });

      // Get the room data from storage
      var estimateData = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_3__.loadEstimateData)();
      var estimate = (_estimateData$estimat = estimateData.estimates) === null || _estimateData$estimat === void 0 ? void 0 : _estimateData$estimat[estimateId];
      var room = estimate === null || estimate === void 0 || (_estimate$rooms = estimate.rooms) === null || _estimate$rooms === void 0 ? void 0 : _estimate$rooms[roomId];
      if (!room) {
        logger.warn('Room not found in storage for primary product update', {
          estimateId: estimateId,
          roomId: roomId
        });
        return;
      }

      // Find the room element in the DOM
      var roomElement = document.querySelector(".room-item[data-room-id=\"".concat(roomId, "\"][data-estimate-id=\"").concat(estimateId, "\"]"));
      if (!roomElement) {
        logger.warn('Room element not found in DOM for primary product update', {
          estimateId: estimateId,
          roomId: roomId
        });
        return;
      }

      // Use the same logic as renderRoom to determine primary product
      var primaryProductImage = null;
      var primaryProductName = null;
      logger.log('Looking for primary product in room:', {
        roomName: room.name,
        primaryCategoryProductId: room.primary_category_product_id,
        productsObject: room.products,
        productsKeys: room.products ? Object.keys(room.products) : []
      });
      if (room.primary_category_product_id && room.products) {
        var primaryProduct = room.products[room.primary_category_product_id];
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
      var imageElement = roomElement.querySelector('.primary-product-image');
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
      var nameElement = roomElement.querySelector('.primary-product-name');
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
  }, {
    key: "onModalClosed",
    value: function onModalClosed() {
      logger.log('RoomManager: Modal closed');
      // Clean up any resources or state as needed
      this.currentEstimateId = null;
      this.currentProductId = null;
    }
  }]);
}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (RoomManager);

/***/ }),

/***/ "./src/js/frontend/managers/UIManager.js":
/*!***********************************************!*\
  !*** ./src/js/frontend/managers/UIManager.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/* harmony import */ var _SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../SuggestionsCarousel */ "./src/js/frontend/SuggestionsCarousel.js");
/* harmony import */ var _ProductDetailsToggle__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../ProductDetailsToggle */ "./src/js/frontend/ProductDetailsToggle.js");
/* harmony import */ var _TemplateEngine__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../TemplateEngine */ "./src/js/frontend/TemplateEngine.js");


/**
 * UIManager.js
 *
 * Handles all UI-related operations:
 * - Carousel initialization and management
 * - Toggle functionality
 * - Visibility utilities
 * - UI components
 */





var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.createLogger)('UIManager');
var UIManager = /*#__PURE__*/function () {
  /**
   * Initialize the UIManager
   * @param {object} config - Configuration options
   * @param {object} dataService - The data service instance
   * @param {object} modalManager - Reference to the parent modal manager
   */
  function UIManager() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var dataService = arguments.length > 1 ? arguments[1] : undefined;
    var modalManager = arguments.length > 2 ? arguments[2] : undefined;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, UIManager);
    this.config = config;
    this.dataService = dataService;
    this.modalManager = modalManager;

    // References to DOM elements
    this.estimatesList = null;
    this.carousels = [];

    // Toggle component reference
    this.productDetailsToggle = null;

    // Bind methods to preserve 'this' context
    this.initializeCarousels = this.initializeCarousels.bind(this);
    this.bindSimilarProductsToggle = this.bindSimilarProductsToggle.bind(this);
    this.bindSuggestionsToggle = this.bindSuggestionsToggle.bind(this);
    this.bindProductDetailsToggles = this.bindProductDetailsToggles.bind(this);
    this.forceElementVisibility = this.forceElementVisibility.bind(this);
    this.onModalClosed = this.onModalClosed.bind(this);
  }

  /**
   * Initialize the UI manager
   * @returns {UIManager} The instance for chaining
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(UIManager, [{
    key: "init",
    value: function init() {
      // Get reference to estimatesList from modalManager for toggle binding
      this.estimatesList = this.modalManager.estimatesList;

      // Initialize product details toggle functionality if not already done
      this.initializeProductDetailsToggle();
      logger.log('UIManager initialized');
      return this;
    }

    /**
     * Initialize product details toggle functionality
     */
  }, {
    key: "initializeProductDetailsToggle",
    value: function initializeProductDetailsToggle() {
      // Use the singleton instance that's already initialized
      this.productDetailsToggle = _ProductDetailsToggle__WEBPACK_IMPORTED_MODULE_4__["default"];
      logger.log('Product details toggle functionality initialized');
    }

    /**
     * Called when the modal is closed
     */
  }, {
    key: "onModalClosed",
    value: function onModalClosed() {
      // Clean up any UI resources if needed
      logger.log('UIManager handling modal close event');
    }

    /**
     * Initialize all carousels in the UI
     */
  }, {
    key: "initializeCarousels",
    value: function initializeCarousels() {
      logger.log('Initializing all carousels');
      this.carousels = (0,_SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_3__.initSuggestionsCarousels)();
      return this.carousels;
    }

    /**
     * Bind toggle functionality for similar products
     */
  }, {
    key: "bindSimilarProductsToggle",
    value: function bindSimilarProductsToggle() {
      var _this = this;
      // Similar products toggle containers are added dynamically to product items
      var productToggleButtons = document.querySelectorAll('.product-details-toggle');
      logger.log("Found ".concat(productToggleButtons.length, " similar products toggle buttons to bind"));
      productToggleButtons.forEach(function (button) {
        if (!button._toggleBound) {
          button._toggleHandler = function (e) {
            e.preventDefault();
            e.stopPropagation();
            _this.toggleSimilarProducts(button);
          };
          button.addEventListener('click', button._toggleHandler);
          button._toggleBound = true;
        }
      });
      logger.log('Similar products toggle bound');
    }

    /**
     * Toggle the visibility of similar products
     * @param {HTMLElement} toggleButton - The button that was clicked
     */
  }, {
    key: "toggleSimilarProducts",
    value: function toggleSimilarProducts(toggleButton) {
      // Find parent product item
      var productItem = toggleButton.closest('.product-item');
      if (!productItem) {
        logger.log('Product item not found for toggle button');
        return;
      }

      // Find similar products container
      var similarProductsContainer = productItem.querySelector('.similar-products-container');
      if (!similarProductsContainer) {
        logger.log('Similar products container not found');
        return;
      }

      // Toggle expanded state
      var isExpanded = toggleButton.classList.contains('expanded');
      logger.log("Similar products toggle clicked, current expanded state: ".concat(isExpanded));

      // Get the icon element
      var iconElement = toggleButton.querySelector('.toggle-icon');
      if (isExpanded) {
        // Hide similar products
        similarProductsContainer.classList.remove('visible');
        similarProductsContainer.style.display = 'none';
        toggleButton.classList.remove('expanded');

        // Update icon
        if (iconElement) {
          iconElement.classList.remove('dashicons-arrow-up-alt2');
          iconElement.classList.add('dashicons-arrow-down-alt2');
        }
        logger.log('Similar products hidden');
      } else {
        // Show similar products
        similarProductsContainer.classList.add('visible');
        similarProductsContainer.style.display = 'block';
        toggleButton.classList.add('expanded');

        // Update icon
        if (iconElement) {
          iconElement.classList.remove('dashicons-arrow-down-alt2');
          iconElement.classList.add('dashicons-arrow-up-alt2');
        }
        logger.log('Similar products shown');

        // Initialize carousels if they exist
        this.initializeCarouselInContainer(similarProductsContainer);
      }
    }

    /**
     * Bind toggle functionality for suggestions
     */
  }, {
    key: "bindSuggestionsToggle",
    value: function bindSuggestionsToggle() {
      var _window$productEstima,
        _this2 = this;
      if (!((_window$productEstima = window.productEstimatorVars) !== null && _window$productEstima !== void 0 && (_window$productEstima = _window$productEstima.featureSwitches) !== null && _window$productEstima !== void 0 && _window$productEstima.suggested_products_enabled)) {
        logger.log('Suggestions feature is disabled, skipping toggle binding');
        return;
      }

      // Bind suggestions toggle buttons
      var suggestionsToggleButtons = document.querySelectorAll('.product-suggestions-toggle');
      logger.log("Found ".concat(suggestionsToggleButtons.length, " suggestions toggle buttons to bind"));
      suggestionsToggleButtons.forEach(function (button) {
        if (!button._toggleBound) {
          button._toggleHandler = function (e) {
            e.preventDefault();
            e.stopPropagation();
            _this2.toggleSuggestions(button);
          };
          button.addEventListener('click', button._toggleHandler);
          button._toggleBound = true;
        }
      });
      logger.log('Suggestions toggle bound');
    }

    /**
     * Toggle the visibility of suggested products
     * @param {HTMLElement} toggleButton - The button that was clicked
     */
  }, {
    key: "toggleSuggestions",
    value: function toggleSuggestions(toggleButton) {
      // Find parent accordion content
      var accordionContent = toggleButton.closest('.accordion-content');
      if (!accordionContent) {
        logger.log('Accordion content not found for toggle button');
        return;
      }

      // Find suggestions container
      var suggestionsContainer = accordionContent.querySelector('.suggestions-container');
      if (!suggestionsContainer) {
        logger.log('Suggestions container not found');
        return;
      }

      // Toggle expanded state
      var isExpanded = toggleButton.classList.contains('expanded');
      logger.log("Suggestions toggle clicked, current expanded state: ".concat(isExpanded));
      if (isExpanded) {
        // Hide suggestions
        suggestionsContainer.classList.remove('visible');
        suggestionsContainer.style.display = 'none';
        toggleButton.classList.remove('expanded');

        // Update icon
        var iconElement = toggleButton.querySelector('.toggle-icon');
        if (iconElement) {
          iconElement.classList.remove('dashicons-arrow-up-alt2');
          iconElement.classList.add('dashicons-arrow-down-alt2');
        }

        // Update text using template
        var i18n = this.config.i18n || {};
        if (i18n.showSuggestions) {
          // Clear the button contents
          toggleButton.innerHTML = '';

          // Use template to set new content
          _TemplateEngine__WEBPACK_IMPORTED_MODULE_5__["default"].insert('toggle-button-show-template', {
            buttonText: i18n.showSuggestions || 'Show Suggestions'
          }, toggleButton);
        }
        logger.log('Suggestions hidden');
      } else {
        // Show suggestions
        suggestionsContainer.classList.add('visible');
        suggestionsContainer.style.display = 'block';
        toggleButton.classList.add('expanded');

        // Update icon
        var _iconElement = toggleButton.querySelector('.toggle-icon');
        if (_iconElement) {
          _iconElement.classList.remove('dashicons-arrow-down-alt2');
          _iconElement.classList.add('dashicons-arrow-up-alt2');
        }

        // Update text using template
        var _i18n = this.config.i18n || {};
        if (_i18n.hideSuggestions) {
          // Clear the button contents
          toggleButton.innerHTML = '';

          // Use template to set new content
          _TemplateEngine__WEBPACK_IMPORTED_MODULE_5__["default"].insert('toggle-button-hide-template', {
            buttonText: _i18n.hideSuggestions || 'Hide Suggestions'
          }, toggleButton);
        }

        // Initialize carousels if they exist
        this.initializeCarouselInContainer(suggestionsContainer);
        logger.log('Suggestions shown');
      }
    }

    /**
     * Bind all product details toggle functionality
     * Note: This method delegates to the ProductDetailsToggle instance
     */
  }, {
    key: "bindProductDetailsToggles",
    value: function bindProductDetailsToggles() {
      if (this.productDetailsToggle) {
        this.productDetailsToggle.setup();
        logger.log('Product details toggles bound via ProductDetailsToggle');
      } else {
        logger.warn('ProductDetailsToggle not initialized');
      }
    }

    /**
     * Create and initialize a carousel
     * @param {HTMLElement} container - The container element for the carousel
     * @param {string} type - The type of carousel ('similar', 'suggestions', etc.)
     * @returns {SuggestionsCarousel} The initialized carousel
     */
  }, {
    key: "createCarousel",
    value: function createCarousel(container, type) {
      logger.log("Creating carousel of type: ".concat(type));
      if (!container) {
        logger.warn('Cannot create carousel - container not provided');
        return null;
      }

      // Check if container already has a carousel
      if (container.carouselInstance) {
        logger.log('Container already has a carousel instance, destroying it first');
        container.carouselInstance.destroy();
      }

      // Initialize new carousel
      var carousel = new _SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_3__.SuggestionsCarousel(container);
      logger.log('New carousel created', carousel);
      return carousel;
    }

    /**
     * Initialize all carousels within a specific container
     * @param {HTMLElement} container - The container to search for carousels in
     */
  }, {
    key: "initializeCarouselInContainer",
    value: function initializeCarouselInContainer(container) {
      if (!container) {
        logger.warn('Cannot initialize carousels - container not provided');
        return;
      }
      logger.log('Initializing carousels in container');

      // Find all carousel containers in this container
      var carouselContainers = container.querySelectorAll('.suggestions-carousel');
      logger.log("Found ".concat(carouselContainers.length, " carousel containers"));

      // Initialize each carousel
      carouselContainers.forEach(function (carouselContainer) {
        if (carouselContainer.carouselInstance) {
          carouselContainer.carouselInstance.destroy();
        }
        new _SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_3__.SuggestionsCarousel(carouselContainer);
      });
    }

    /**
     * Force an element to be visible (utility method)
     * @param {HTMLElement} element - The element to make visible
     * @returns {HTMLElement} The element
     */
  }, {
    key: "forceElementVisibility",
    value: function forceElementVisibility(element) {
      if (!element) return null;
      try {
        // Apply inline styles with !important to override any CSS rules
        element.style.cssText += 'display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;';

        // Remove any hiding classes
        ['hidden', 'hide', 'invisible', 'd-none', 'display-none'].forEach(function (cls) {
          if (element.classList.contains(cls)) {
            element.classList.remove(cls);
          }
        });

        // Add visible classes (some frameworks use these)
        element.classList.add('visible', 'd-block');

        // Ensure parent elements are also visible
        var parent = element.parentElement;
        var checkedParents = new Set(); // Prevent infinite loops

        while (parent && parent !== document.body && !checkedParents.has(parent)) {
          checkedParents.add(parent);
          var parentStyle = window.getComputedStyle(parent);
          if (parentStyle.display === 'none') {
            parent.style.cssText += 'display: block !important;';
          }
          parent = parent.parentElement;
        }

        // Use jQuery as a fallback if available
        if (typeof jQuery !== 'undefined') {
          jQuery(element).show();
        }
      } catch (error) {
        logger.error('Error forcing element visibility:', error);
      }
      return element;
    }

    /**
     * Show an element
     * @param {HTMLElement} element - The element to show
     * @param {boolean} force - Whether to use force visibility
     * @returns {HTMLElement} The element
     */
  }, {
    key: "showElement",
    value: function showElement(element) {
      var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (!element) return null;
      if (force) {
        return this.forceElementVisibility(element);
      }
      element.style.display = 'block';
      return element;
    }

    /**
     * Hide an element
     * @param {HTMLElement} element - The element to hide
     * @returns {HTMLElement} The element
     */
  }, {
    key: "hideElement",
    value: function hideElement(element) {
      if (!element) return null;
      element.style.display = 'none';
      return element;
    }

    /**
     * Toggle an element's visibility
     * @param {HTMLElement} element - The element to toggle
     * @param {boolean} show - Force show if true, force hide if false, toggle if undefined
     * @returns {HTMLElement} The element
     */
  }, {
    key: "toggleElement",
    value: function toggleElement(element, show) {
      if (!element) return null;
      if (show === undefined) {
        // Toggle current state
        if (window.getComputedStyle(element).display === 'none') {
          element.style.display = 'block';
        } else {
          element.style.display = 'none';
        }
      } else if (show) {
        // Force show
        element.style.display = 'block';
      } else {
        // Force hide
        element.style.display = 'none';
      }
      return element;
    }
  }]);
}();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (UIManager);

/***/ }),

/***/ "./src/js/frontend/template-loader.js":
/*!********************************************!*\
  !*** ./src/js/frontend/template-loader.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkTemplateContent: () => (/* binding */ checkTemplateContent),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   initializeTemplates: () => (/* binding */ initializeTemplates)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/* harmony import */ var _templates_components_product_product_item_html__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @templates/components/product/product-item.html */ "./src/templates/components/product/product-item.html");
/* harmony import */ var _templates_components_product_include_item_html__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @templates/components/product/include-item.html */ "./src/templates/components/product/include-item.html");
/* harmony import */ var _templates_components_product_note_item_html__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @templates/components/product/note-item.html */ "./src/templates/components/product/note-item.html");
/* harmony import */ var _templates_components_product_upgrade_item_html__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @templates/components/product/upgrade-item.html */ "./src/templates/components/product/upgrade-item.html");
/* harmony import */ var _templates_components_product_similar_item_html__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @templates/components/product/similar-item.html */ "./src/templates/components/product/similar-item.html");
/* harmony import */ var _templates_components_product_suggestion_item_html__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @templates/components/product/suggestion-item.html */ "./src/templates/components/product/suggestion-item.html");
/* harmony import */ var _templates_components_room_room_item_html__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @templates/components/room/room-item.html */ "./src/templates/components/room/room-item.html");
/* harmony import */ var _templates_components_room_rooms_container_html__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @templates/components/room/rooms-container.html */ "./src/templates/components/room/rooms-container.html");
/* harmony import */ var _templates_components_room_actions_footer_html__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @templates/components/room/actions-footer.html */ "./src/templates/components/room/actions-footer.html");
/* harmony import */ var _templates_components_estimate_estimate_item_html__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @templates/components/estimate/estimate-item.html */ "./src/templates/components/estimate/estimate-item.html");
/* harmony import */ var _templates_components_common_loading_html__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @templates/components/common/loading.html */ "./src/templates/components/common/loading.html");
/* harmony import */ var _templates_components_common_select_option_html__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @templates/components/common/select-option.html */ "./src/templates/components/common/select-option.html");
/* harmony import */ var _templates_components_common_toggle_hide_html__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @templates/components/common/toggle/hide.html */ "./src/templates/components/common/toggle/hide.html");
/* harmony import */ var _templates_components_common_toggle_show_html__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @templates/components/common/toggle/show.html */ "./src/templates/components/common/toggle/show.html");
/* harmony import */ var _templates_forms_estimate_new_estimate_html__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @templates/forms/estimate/new-estimate.html */ "./src/templates/forms/estimate/new-estimate.html");
/* harmony import */ var _templates_forms_estimate_estimate_selection_html__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @templates/forms/estimate/estimate-selection.html */ "./src/templates/forms/estimate/estimate-selection.html");
/* harmony import */ var _templates_forms_room_new_room_html__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @templates/forms/room/new-room.html */ "./src/templates/forms/room/new-room.html");
/* harmony import */ var _templates_forms_room_room_selection_html__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @templates/forms/room/room-selection.html */ "./src/templates/forms/room/room-selection.html");
/* harmony import */ var _templates_layout_modal_container_html__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @templates/layout/modal-container.html */ "./src/templates/layout/modal-container.html");
/* harmony import */ var _templates_ui_dialogs_confirmation_html__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! @templates/ui/dialogs/confirmation.html */ "./src/templates/ui/dialogs/confirmation.html");
/* harmony import */ var _templates_ui_dialogs_product_selection_html__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! @templates/ui/dialogs/product-selection.html */ "./src/templates/ui/dialogs/product-selection.html");
/* harmony import */ var _templates_ui_dialogs_variation_option_html__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! @templates/ui/dialogs/variation-option.html */ "./src/templates/ui/dialogs/variation-option.html");
/* harmony import */ var _templates_ui_dialogs_variation_swatch_html__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! @templates/ui/dialogs/variation-swatch.html */ "./src/templates/ui/dialogs/variation-swatch.html");
/* harmony import */ var _templates_ui_empty_states_estimates_empty_html__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! @templates/ui/empty-states/estimates-empty.html */ "./src/templates/ui/empty-states/estimates-empty.html");
/* harmony import */ var _templates_ui_empty_states_rooms_empty_html__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! @templates/ui/empty-states/rooms-empty.html */ "./src/templates/ui/empty-states/rooms-empty.html");
/* harmony import */ var _templates_ui_empty_states_products_empty_html__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! @templates/ui/empty-states/products-empty.html */ "./src/templates/ui/empty-states/products-empty.html");
/* harmony import */ var _templates_ui_errors_room_error_html__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! @templates/ui/errors/room-error.html */ "./src/templates/ui/errors/room-error.html");
/* harmony import */ var _templates_ui_errors_product_error_html__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! @templates/ui/errors/product-error.html */ "./src/templates/ui/errors/product-error.html");
/* harmony import */ var _templates_ui_errors_form_error_html__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! @templates/ui/errors/form-error.html */ "./src/templates/ui/errors/form-error.html");
/* harmony import */ var _templates_ui_messages_modal_messages_html__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! @templates/ui/messages/modal-messages.html */ "./src/templates/ui/messages/modal-messages.html");
/* harmony import */ var _TemplateEngine__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./TemplateEngine */ "./src/js/frontend/TemplateEngine.js");

/**
 * Template Loader
 *
 * Imports all HTML templates and registers them with the template engine
 */


// Component Templates
// Product Components







// Room Components




// Estimate Components


// Common Components





// Form Templates





// Layout Templates


// UI Templates
// Dialog Templates





// Empty State Templates




// Error Templates




// Message Templates


var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.createLogger)('TemplateLoader');

// Create a map of all templates
var templates = {
  'product-item-template': _templates_components_product_product_item_html__WEBPACK_IMPORTED_MODULE_2__["default"],
  'room-item-template': _templates_components_room_room_item_html__WEBPACK_IMPORTED_MODULE_8__["default"],
  'estimate-item-template': _templates_components_estimate_estimate_item_html__WEBPACK_IMPORTED_MODULE_11__["default"],
  'suggestion-item-template': _templates_components_product_suggestion_item_html__WEBPACK_IMPORTED_MODULE_7__["default"],
  'note-item-template': _templates_components_product_note_item_html__WEBPACK_IMPORTED_MODULE_4__["default"],
  'include-item-template': _templates_components_product_include_item_html__WEBPACK_IMPORTED_MODULE_3__["default"],
  'similar-product-item-template': _templates_components_product_similar_item_html__WEBPACK_IMPORTED_MODULE_6__["default"],
  'product-upgrade-item-template': _templates_components_product_upgrade_item_html__WEBPACK_IMPORTED_MODULE_5__["default"],
  'select-option-template': _templates_components_common_select_option_html__WEBPACK_IMPORTED_MODULE_13__["default"],
  'loading-placeholder-template': _templates_components_common_loading_html__WEBPACK_IMPORTED_MODULE_12__["default"],
  'room-actions-footer-template': _templates_components_room_actions_footer_html__WEBPACK_IMPORTED_MODULE_10__["default"],
  'rooms-container-template': _templates_components_room_rooms_container_html__WEBPACK_IMPORTED_MODULE_9__["default"],
  'new-estimate-form-template': _templates_forms_estimate_new_estimate_html__WEBPACK_IMPORTED_MODULE_16__["default"],
  'new-room-form-template': _templates_forms_room_new_room_html__WEBPACK_IMPORTED_MODULE_18__["default"],
  'room-selection-form-template': _templates_forms_room_room_selection_html__WEBPACK_IMPORTED_MODULE_19__["default"],
  'estimate-selection-template': _templates_forms_estimate_estimate_selection_html__WEBPACK_IMPORTED_MODULE_17__["default"],
  'estimates-empty-template': _templates_ui_empty_states_estimates_empty_html__WEBPACK_IMPORTED_MODULE_25__["default"],
  'rooms-empty-template': _templates_ui_empty_states_rooms_empty_html__WEBPACK_IMPORTED_MODULE_26__["default"],
  'products-empty-template': _templates_ui_empty_states_products_empty_html__WEBPACK_IMPORTED_MODULE_27__["default"],
  'room-error-template': _templates_ui_errors_room_error_html__WEBPACK_IMPORTED_MODULE_28__["default"],
  'product-error-template': _templates_ui_errors_product_error_html__WEBPACK_IMPORTED_MODULE_29__["default"],
  'form-error-template': _templates_ui_errors_form_error_html__WEBPACK_IMPORTED_MODULE_30__["default"],
  'modal-messages-template': _templates_ui_messages_modal_messages_html__WEBPACK_IMPORTED_MODULE_31__["default"],
  'modal-container-template': _templates_layout_modal_container_html__WEBPACK_IMPORTED_MODULE_20__["default"],
  'confirmation-dialog-template': _templates_ui_dialogs_confirmation_html__WEBPACK_IMPORTED_MODULE_21__["default"],
  'product-selection-template': _templates_ui_dialogs_product_selection_html__WEBPACK_IMPORTED_MODULE_22__["default"],
  'variation-option-template': _templates_ui_dialogs_variation_option_html__WEBPACK_IMPORTED_MODULE_23__["default"],
  'variation-swatch-template': _templates_ui_dialogs_variation_swatch_html__WEBPACK_IMPORTED_MODULE_24__["default"],
  'toggle-button-hide-template': _templates_components_common_toggle_hide_html__WEBPACK_IMPORTED_MODULE_14__["default"],
  'toggle-button-show-template': _templates_components_common_toggle_show_html__WEBPACK_IMPORTED_MODULE_15__["default"]
};

/**
 * Initialize all templates with the template engine
 * @returns {object} The initialized template engine
 */
// In template-loader.js
function initializeTemplates() {
  logger.group('Initializing templates');

  // Log all template IDs being registered
  logger.log('Registering templates:', Object.keys(templates));
  Object.entries(templates).forEach(function (_ref) {
    var _ref2 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_ref, 2),
      id = _ref2[0],
      html = _ref2[1];
    if (!html || html.trim() === '') {
      logger.warn("Template ".concat(id, " has empty HTML content!"));
    } else {
      logger.log("Registering template: ".concat(id, " (").concat(html.length, " characters)"));
      _TemplateEngine__WEBPACK_IMPORTED_MODULE_32__["default"].registerTemplate(id, html);
    }
  });
  logger.log("Initialized template engine with ".concat(Object.keys(templates).length, " templates"));
  logger.groupEnd();
  return _TemplateEngine__WEBPACK_IMPORTED_MODULE_32__["default"];
}

// Add this function to check template content
/**
 * Check if a template exists and log its content
 * @param {string} templateId - The ID of the template to check
 * @returns {boolean} True if the template exists, false otherwise
 */
function checkTemplateContent(templateId) {
  var template = templates[templateId];
  if (!template) {
    logger.error("Template not found: ".concat(templateId));
    return false;
  }
  logger.log("Template ".concat(templateId, " content (").concat(template.length, " characters):"));
  logger.log(template.substring(0, 100) + '...');
  return true;
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (templates);

/***/ }),

/***/ "./src/js/index.js":
/*!*************************!*\
  !*** ./src/js/index.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _frontend_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./frontend/index */ "./src/js/frontend/index.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");


var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.createLogger)('ProductEstimatorFrontend');
logger.log('Product Estimator Frontend initialized');

/***/ }),

/***/ "./src/templates/components/common/loading.html":
/*!******************************************************!*\
  !*** ./src/templates/components/common/loading.html ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="loading-placeholder-template"> <div class="loading-placeholder"> <span class="loading-message">{{message}}</span> </div> </template>`;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/components/common/select-option.html":
/*!************************************************************!*\
  !*** ./src/templates/components/common/select-option.html ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="select-option-template"> <option value="{{value}}">{{text}}</option> </template>`;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/components/common/toggle/hide.html":
/*!**********************************************************!*\
  !*** ./src/templates/components/common/toggle/hide.html ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="toggle-button-hide-template"> <span>{{buttonText}}</span> <span class="toggle-icon dashicons dashicons-arrow-up-alt2"></span> </template>`;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/components/common/toggle/show.html":
/*!**********************************************************!*\
  !*** ./src/templates/components/common/toggle/show.html ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="toggle-button-show-template"> <span>{{buttonText}}</span> <span class="toggle-icon dashicons dashicons-arrow-down-alt2"></span> </template>`;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/components/estimate/estimate-item.html":
/*!**************************************************************!*\
  !*** ./src/templates/components/estimate/estimate-item.html ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="estimate-item-template"> <div class="estimate-section collapsed" data-estimate-id=""> <div class="estimate-header"> <h3 class="estimate-name"> <div class="price-graph-container"> <div class="price-range-title"> <span class="price-title name"></span> <span class="estimate-price min_total max_total"></span> </div> <div class="price-graph-bar"> <div class="price-graph-range"></div> </div> <div class="price-graph-labels"></div> </div> </h3> <button class="remove-estimate" data-estimate-id="" title="Delete Estimate"> <span class="dashicons dashicons-trash"></span> </button> </div> <div class="estimate-content"> <div id="rooms"> <div class="room-header"> <h4>Rooms</h4> <button class="add-room" data-estimate-id="">Add New Room</button> </div> <div class="rooms-container"></div> </div> </div> <div class="estimate-actions"> <ul> <li> <a class="print-estimate" data-estimate-id="" title="Print Estimate"> <span class="dashicons dashicons-pdf"></span> Print estimate </a> </li> <li> <a class="request-contact-estimate" data-estimate-id="" title="Request contact from store"> <span class="dashicons dashicons-businessperson"></span> Request contact from store </a> </li> <li> <a class="request-a-copy" data-estimate-id="" title="Request a copy"> <span class="dashicons dashicons-email"></span> Request a copy </a> </li> </ul> </div> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/components/product/include-item.html":
/*!************************************************************!*\
  !*** ./src/templates/components/product/include-item.html ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="include-item-template"> <div class="include-item" data-product-id=""> <span class="product-includes-icon"> <span class="dashicons dashicons-plus-alt"></span> </span> <div class="include-item-name product-name"></div> <div class="include-item-prices"> <div class="include-item-total-price product-price"> </div> </div> <div class="product-upgrades-container" style="display:none"> <div class="product-upgrades-list"> </div> </div> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/components/product/note-item.html":
/*!*********************************************************!*\
  !*** ./src/templates/components/product/note-item.html ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="note-item-template"> <div class="include-item note-item"> <span class="product-includes-icon"> <span class="dashicons dashicons-sticky"></span> </span> <div class="include-item-note"> <p class="note-text">r</p> </div> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/components/product/product-item.html":
/*!************************************************************!*\
  !*** ./src/templates/components/product/product-item.html ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Imports
var ___HTML_LOADER_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw== */ "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="), __webpack_require__.b);
// Module
var code = `<template id="product-item-template"> <div class="product-item" data-product-index="" data-product-id=""> <div class="product-wrapper"> <img src="${___HTML_LOADER_IMPORT_0___}" alt="Product" class="product-thumbnail"> <div class="product-details-wrapper"> <div class="product-details"> <div class="price-graph-container"> <div class="price-range-title"> <span class="price-title"></span> <span class="price-dimensions"></span> <span class="product-price"></span> </div> <div class="price-graph-bar"> <div class="price-graph-range"></div> </div> <div class="price-graph-labels"></div> </div> <button class="remove-product" data-estimate-id="" data-room-id="" data-product-index="" data-product-id=""> <span class="dashicons dashicons-trash"></span> </button> </div> </div> </div> <button class="product-includes-toggle expanded"> <span>Product Includes</span> <span class="toggle-icon dashicons dashicons-arrow-up-alt2"></span> </button> <div class="includes-container visible"> <div class="product-includes"> <div class="product-includes-items"></div> </div> </div> <button class="product-notes-toggle expanded"> <span>Product Notes</span> <span class="toggle-icon dashicons dashicons-arrow-up-alt2"></span> </button> <div class="notes-container visible"> <div class="product-notes"> <div class="product-notes-items"></div> </div> </div> <div class="product-upgrades-container" style="display:none"> <button class="product-details-toggle product-upgrades-toggle"> <span>Product Upgrades</span> <span class="toggle-icon dashicons dashicons-arrow-down-alt2"></span> </button> <div class="product-upgrades"> <div class="product-upgrades-list"></div> </div> </div> <button class="product-details-toggle similar-products-toggle"> <span>Similar Products</span> <span class="toggle-icon dashicons dashicons-arrow-down-alt2"></span> </button> <div class="similar-products-container" style="display:none" data-product-id=""> <div class="product-similar-products"> <div class="suggestions-carousel similar-products-carousel"> <div class="suggestions-nav prev" aria-label="Previous"> <span class="dashicons dashicons-arrow-left-alt2"></span> </div> <div class="suggestions-container similar-products-list"> </div> <div class="suggestions-nav next" aria-label="Next"> <span class="dashicons dashicons-arrow-right-alt2"></span> </div> </div> </div> </div> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/components/product/similar-item.html":
/*!************************************************************!*\
  !*** ./src/templates/components/product/similar-item.html ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Imports
var ___HTML_LOADER_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw== */ "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="), __webpack_require__.b);
// Module
var code = `<template id="similar-product-item-template"> <div class="suggestion-item similar-product-item" data-product-id="" data-estimate-id="" data-room-id="" data-replace-product-id="" data-pricing-method=""> <div class="suggestion-image"> <img src="${___HTML_LOADER_IMPORT_0___}" alt="Similar Product Image" class="similar-product-thumbnail product-img"> <div class="no-image" style="display:none"></div> </div> <div class="suggestion-details"> <div class="suggestion-name product-name"></div> <div class="suggestion-price product-price"></div> <div class="suggestion-actions"> <button type="button" class="replace-product-in-room" data-product-id="" data-estimate-id="" data-room-id="" data-replace-product-id="" data-pricing-method=""> Replace </button> </div> </div> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/components/product/suggestion-item.html":
/*!***************************************************************!*\
  !*** ./src/templates/components/product/suggestion-item.html ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Imports
var ___HTML_LOADER_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw== */ "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="), __webpack_require__.b);
// Module
var code = `<template id="suggestion-item-template"> <div class="suggestion-item"> <div class="suggestion-image"> <img src="${___HTML_LOADER_IMPORT_0___}" alt="" class="suggestion-img product-img"> </div> <div class="suggestion-details"> <div class="suggestion-name product-name"></div> <div class="suggestion-price product-price"></div> <div class="suggestion-actions"> <button type="button" class="add-suggestion-to-room" data-product-id="" data-estimate-id="" data-room-id=""> Add </button> </div> </div> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/components/product/upgrade-item.html":
/*!************************************************************!*\
  !*** ./src/templates/components/product/upgrade-item.html ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Imports
var ___HTML_LOADER_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw== */ "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="), __webpack_require__.b);
// Module
var code = `<template id="product-upgrade-item-template"> <div class="upgrade-tile"> <img src="${___HTML_LOADER_IMPORT_0___}" alt="" class="tile-image product-img"> <span class="tile-label product-name"></span> <div class="upgrade-price product-price"></div> <button type="button" class="replace-product-in-room" data-product-id="" data-estimate-id="" data-room-id="" data-replace-product-id="" data-pricing-method="" data-replace-type=""> Upgrade </button> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/components/room/actions-footer.html":
/*!***********************************************************!*\
  !*** ./src/templates/components/room/actions-footer.html ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="room-actions-footer-template"> <div class="room-actions-footer"> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/components/room/room-item.html":
/*!******************************************************!*\
  !*** ./src/templates/components/room/room-item.html ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Imports
var ___HTML_LOADER_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw== */ "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="), __webpack_require__.b);
// Module
var code = `<template id="room-item-template"> <div class="accordion-item room-item" data-room-id="" data-estimate-id=""> <div class="accordion-header-wrapper"> <div class="accordion-header room-item-header"> <div class="room-image-wrapper"> <img class="primary-product-image product-thumbnail" src="${___HTML_LOADER_IMPORT_0___}" alt="Primary product" data-visible-if="has_primary_product"> </div> <div class="room-details-wrapper"> <div class="room-details"> <div class="room-name-wrapper"> <span class="room-name"></span> <span class="primary-product-name"></span> <span class="room-dimensions"></span> </div> <div class="room-price"></div> </div> <div class="price-graph-container"> <div class="price-graph-bar"> <div class="price-graph-range"></div> </div> <div class="price-graph-labels"></div> </div> </div> <div class="room-actions"> <button class="remove-room" data-estimate-id="" data-room-id="" title="Remove Room"> <span class="dashicons dashicons-trash"></span> </button> </div> </div> </div> <div class="accordion-content"> <div class="room-products"> <h5>Products</h5> <div class="product-list"></div> </div> <div class="product-suggestions" style="display:none"> <button class="product-suggestions-toggle"> Suggested Products <span class="toggle-icon dashicons dashicons-arrow-down-alt2"></span></button> <div class="suggestions-container-wrapper"> <div class="suggestions-carousel"> <div class="suggestions-nav prev" aria-label="Previous Suggestions">&#10094;</div> <div class="suggestions-container"> </div> <div class="suggestions-nav next" aria-label="Next Suggestions">&#10095;</div> </div> </div> </div> </div> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/components/room/rooms-container.html":
/*!************************************************************!*\
  !*** ./src/templates/components/room/rooms-container.html ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="rooms-container-template"> <div class="estimate-rooms-container"> </div> </template>`;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/forms/estimate/estimate-selection.html":
/*!**************************************************************!*\
  !*** ./src/templates/forms/estimate/estimate-selection.html ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="estimate-selection-template"> <div id="estimate-selection-wrapper"> <div id="estimate-selection-form-wrapper"> <h2>Select an Estimate</h2> <form id="estimate-selection-form"> <div class="form-group"> <label for="estimate-dropdown">Choose an estimate:</label> <select id="estimate-dropdown" name="estimate_id" required> <option value="">-- Select an Estimate --</option> </select> </div> <div class="form-actions"> <button type="submit" class="button submit-btn">Continue</button> <button type="button" class="button cancel-btn" id="create-estimate-btn"> Create New Estimate </button> </div> </form> </div> <div id="room-selection-form-wrapper" style="display:none"> <h2>Select a Room</h2> <form id="room-selection-form"> <div class="form-group"> <label for="room-dropdown">Choose a room:</label> <select id="room-dropdown" name="room_id" required> <option value="">-- Select a Room --</option> </select> </div> <div class="form-actions"> <button type="submit" class="button submit-btn">Add Product to Room</button> <button type="button" class="button cancel-btn back-btn" data-target="estimate-selection">Back</button> <button type="button" class="button add-room" id="add-new-room-from-selection" data-estimate="">Add New Room</button> </div> </form> </div> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/forms/estimate/new-estimate.html":
/*!********************************************************!*\
  !*** ./src/templates/forms/estimate/new-estimate.html ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="new-estimate-form-template"> <div id="new-estimate-form-wrapper"> <h2>Create New Estimate</h2> <form id="new-estimate-form" method="post" data-has-email="false"> <div class="form-group"> <label for="estimate-name">Estimate Name</label> <input type="text" id="estimate-name" name="estimate_name" placeholder="e.g. Home Renovation" required> </div> <div class="customer-details-section"> <h4>Your Details</h4> <div class="form-group"> <label for="customer-postcode">Postcode</label> <input type="text" id="customer-postcode" name="customer_postcode" placeholder="Your postcode" required> </div> </div> <div class="button-group"> <button type="submit" class="submit-btn create-estimate-btn">Create Estimate</button> <button type="button" class="cancel-btn" data-form-type="estimate">Cancel</button> </div> </form> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/forms/room/new-room.html":
/*!************************************************!*\
  !*** ./src/templates/forms/room/new-room.html ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="new-room-form-template"> <div id="new-room-form-wrapper"> <h2>Add New Room</h2> <form id="new-room-form" method="post" data-estimate-id="" data-product-id=""> <div class="form-group"> <label for="room-name">Room Name</label> <input type="text" id="room-name" name="room_name" placeholder="e.g. Living Room" required> </div> <div class="inline-group"> <div class="form-group"> <label for="room-width">Width (m)</label> <input type="number" id="room-width" name="room_width" placeholder="Width" required step="0.01" min="0.1"> </div> <div class="form-group"> <label for="room-length">Length (m)</label> <input type="number" id="room-length" name="room_length" placeholder="Length" required step="0.01" min="0.1"> </div> </div> <div class="button-group"> <button type="submit" class="submit-btn">Add Room</button> <button type="button" class="cancel-btn" data-form-type="room">Cancel</button> </div> </form> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/forms/room/room-selection.html":
/*!******************************************************!*\
  !*** ./src/templates/forms/room/room-selection.html ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="room-selection-form-template"> <h2>Select a Room</h2> <form id="room-selection-form"> <div class="form-group"> <label for="room-dropdown">Choose a room:</label> <select id="room-dropdown" name="room_id" required> <option value="">-- Select a Room --</option> </select> </div> <div class="form-actions"> <button type="submit" class="button submit-btn">Add Product to Room</button> <button type="button" class="button cancel-btn back-btn" data-target="estimate-selection">Back</button> <button type="button" class="button add-room" id="add-new-room-from-selection" data-estimate-id="">Add New Room</button> </div> </form> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/layout/modal-container.html":
/*!***************************************************!*\
  !*** ./src/templates/layout/modal-container.html ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="modal-container-template"> <div id="product-estimator-modal" class="product-estimator-modal"> <div class="product-estimator-modal-overlay"></div> <div class="product-estimator-modal-container"> <button class="product-estimator-modal-close" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> <div class="product-estimator-modal-header"> <h2>Product Estimator</h2> </div> <div class="product-estimator-modal-form-container"> <div id="estimates"></div> <div id="estimate-selection-wrapper" style="display:none"></div> <div id="room-selection-form-wrapper" style="display:none"></div> <div id="new-estimate-form-wrapper" style="display:none"></div> <div id="new-room-form-wrapper" style="display:none"></div> </div> <div class="product-estimator-modal-loading" style="display:none"> <div class="loading-spinner"></div> <div class="loading-text">Loading...</div> </div> </div> </div> </template>`;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/ui/dialogs/confirmation.html":
/*!****************************************************!*\
  !*** ./src/templates/ui/dialogs/confirmation.html ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="confirmation-dialog-template"> <div class="pe-dialog-backdrop"> <div class="pe-confirmation-dialog" role="dialog" aria-modal="true"> <div class="dialog-content"> <div class="pe-dialog-header"> <h3 class="pe-dialog-title">Confirm Action</h3> <button type="button" class="pe-dialog-close" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div> <div class="pe-dialog-body"> <p class="pe-dialog-message">Are you sure you want to proceed?</p> </div> <div class="pe-dialog-footer pe-dialog-buttons"> <button type="button" class="pe-dialog-btn pe-dialog-cancel">Cancel</button> <button type="button" class="pe-dialog-btn pe-dialog-confirm">Confirm</button> </div> </div> </div> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/ui/dialogs/product-selection.html":
/*!*********************************************************!*\
  !*** ./src/templates/ui/dialogs/product-selection.html ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="product-selection-template"> <div class="pe-dialog-backdrop" style="display:none"> <div class="pe-dialog pe-product-selection-dialog"> <div class="pe-dialog-header"> <h3 class="pe-dialog-title">Select Product Options</h3> <button class="pe-dialog-close" aria-label="Close">&times;</button> </div> <div class="pe-dialog-body"> <div class="pe-dialog-product-name"></div> <div class="pe-dialog-variations"> <p class="pe-dialog-message">Please select your options below:</p> <div class="pe-variation-options"> </div> </div> </div> <div class="pe-dialog-footer"> <button class="pe-dialog-cancel">Cancel</button> <button class="pe-dialog-confirm" disabled="disabled">Add to Estimate</button> </div> </div> </div> </template>`;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/ui/dialogs/variation-option.html":
/*!********************************************************!*\
  !*** ./src/templates/ui/dialogs/variation-option.html ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="variation-option-template"> <div class="pe-variation-group" data-attribute-name="{{attributeName}}"> <label class="pe-variation-label">{{attributeLabel}}</label> <div class="pe-variation-swatches"> </div> </div> </template>`;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/ui/dialogs/variation-swatch.html":
/*!********************************************************!*\
  !*** ./src/templates/ui/dialogs/variation-swatch.html ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="variation-swatch-template"> <button class="pe-variation-swatch{{selected}}" data-attribute-name="{{attributeName}}" data-value="{{value}}" data-type="{{type}}"> <span class="pe-swatch-content"> </span> <span class="pe-swatch-label">{{label}}</span> </button> </template>`;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/ui/empty-states/estimates-empty.html":
/*!************************************************************!*\
  !*** ./src/templates/ui/empty-states/estimates-empty.html ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="estimates-empty-template"> <div class="no-estimates"> <p>You don't have any estimates yet.</p> <button id="create-estimate-btn" class="button">Create New Estimate</button> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/ui/empty-states/products-empty.html":
/*!***********************************************************!*\
  !*** ./src/templates/ui/empty-states/products-empty.html ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="products-empty-template"> <div class="products"> <p>You don't have any products in this room.</p> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/ui/empty-states/rooms-empty.html":
/*!********************************************************!*\
  !*** ./src/templates/ui/empty-states/rooms-empty.html ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="rooms-empty-template"> <div class="no-rooms"> <p>You don't have any rooms in this estimate.</p> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/ui/errors/form-error.html":
/*!*************************************************!*\
  !*** ./src/templates/ui/errors/form-error.html ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="form-error-template"> <div class="form-errors error-message"> <p>{{errorMessage}}</p> </div> </template>`;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/ui/errors/product-error.html":
/*!****************************************************!*\
  !*** ./src/templates/ui/errors/product-error.html ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="product-error-template"> <div class="error-state"> <p>Error loading products. Please try again.</p> </div> </template>`;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/ui/errors/room-error.html":
/*!*************************************************!*\
  !*** ./src/templates/ui/errors/room-error.html ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="room-error-template"> <div class="error-state"> <p>Error loading rooms. Please try again.</p> </div> </template>this `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/ui/messages/modal-messages.html":
/*!*******************************************************!*\
  !*** ./src/templates/ui/messages/modal-messages.html ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="modal-messages-template"> <div class="modal-message modal-success-message"> <div class="message-content"></div> </div> <div class="modal-message modal-error-message"> <div class="message-content"></div> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==":
/*!**********************************************************************************!*\
  !*** data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw== ***!
  \**********************************************************************************/
/***/ ((module) => {

module.exports = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = document.baseURI || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"product-estimator": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkproduct_estimator"] = self["webpackChunkproduct_estimator"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["common"], () => (__webpack_require__("./src/js/index.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=product-estimator.bundle.js.map