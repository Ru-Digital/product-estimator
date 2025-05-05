/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _arrayLikeToArray)
/* harmony export */ });
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _arrayWithHoles)
/* harmony export */ });
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/classCallCheck.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _classCallCheck)
/* harmony export */ });
function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/createClass.js":
/*!****************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/createClass.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _createClass)
/* harmony export */ });
/* harmony import */ var _toPropertyKey_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./toPropertyKey.js */ "./node_modules/@babel/runtime/helpers/esm/toPropertyKey.js");

function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, (0,_toPropertyKey_js__WEBPACK_IMPORTED_MODULE_0__["default"])(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: !1
  }), e;
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/defineProperty.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _defineProperty)
/* harmony export */ });
/* harmony import */ var _toPropertyKey_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./toPropertyKey.js */ "./node_modules/@babel/runtime/helpers/esm/toPropertyKey.js");

function _defineProperty(e, r, t) {
  return (r = (0,_toPropertyKey_js__WEBPACK_IMPORTED_MODULE_0__["default"])(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _iterableToArrayLimit)
/* harmony export */ });
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js":
/*!********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _nonIterableRest)
/* harmony export */ });
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/slicedToArray.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _slicedToArray)
/* harmony export */ });
/* harmony import */ var _arrayWithHoles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayWithHoles.js */ "./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js");
/* harmony import */ var _iterableToArrayLimit_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterableToArrayLimit.js */ "./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js");
/* harmony import */ var _unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./unsupportedIterableToArray.js */ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js");
/* harmony import */ var _nonIterableRest_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./nonIterableRest.js */ "./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js");




function _slicedToArray(r, e) {
  return (0,_arrayWithHoles_js__WEBPACK_IMPORTED_MODULE_0__["default"])(r) || (0,_iterableToArrayLimit_js__WEBPACK_IMPORTED_MODULE_1__["default"])(r, e) || (0,_unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(r, e) || (0,_nonIterableRest_js__WEBPACK_IMPORTED_MODULE_3__["default"])();
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/toPrimitive.js":
/*!****************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/toPrimitive.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ toPrimitive)
/* harmony export */ });
/* harmony import */ var _typeof_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./typeof.js */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");

function toPrimitive(t, r) {
  if ("object" != (0,_typeof_js__WEBPACK_IMPORTED_MODULE_0__["default"])(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != (0,_typeof_js__WEBPACK_IMPORTED_MODULE_0__["default"])(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/toPropertyKey.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/toPropertyKey.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ toPropertyKey)
/* harmony export */ });
/* harmony import */ var _typeof_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./typeof.js */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _toPrimitive_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./toPrimitive.js */ "./node_modules/@babel/runtime/helpers/esm/toPrimitive.js");


function toPropertyKey(t) {
  var i = (0,_toPrimitive_js__WEBPACK_IMPORTED_MODULE_1__["default"])(t, "string");
  return "symbol" == (0,_typeof_js__WEBPACK_IMPORTED_MODULE_0__["default"])(i) ? i : i + "";
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/typeof.js":
/*!***********************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/typeof.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _typeof)
/* harmony export */ });
function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _unsupportedIterableToArray)
/* harmony export */ });
/* harmony import */ var _arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayLikeToArray.js */ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js");

function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return (0,_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? (0,_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(r, a) : void 0;
  }
}


/***/ }),

/***/ "./src/js/admin/CustomerEstimatesAdmin.js":
/*!************************************************!*\
  !*** ./src/js/admin/CustomerEstimatesAdmin.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");


/**
 * Customer Estimates Admin JavaScript
 *
 * Handles functionality for the customer estimates admin page
 */

var CustomerEstimatesAdmin = /*#__PURE__*/function () {
  /**
   * Initialize the class
   */
  function CustomerEstimatesAdmin() {
    var _window$customerEstim,
      _window$customerEstim2,
      _window$customerEstim3,
      _this = this;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, CustomerEstimatesAdmin);
    // Init properties
    this.settings = {
      ajaxUrl: ((_window$customerEstim = window.customerEstimatesAdmin) === null || _window$customerEstim === void 0 ? void 0 : _window$customerEstim.ajax_url) || (typeof ajaxurl !== 'undefined' ? ajaxurl : '/wp-admin/admin-ajax.php'),
      nonce: ((_window$customerEstim2 = window.customerEstimatesAdmin) === null || _window$customerEstim2 === void 0 ? void 0 : _window$customerEstim2.nonce) || '',
      i18n: ((_window$customerEstim3 = window.customerEstimatesAdmin) === null || _window$customerEstim3 === void 0 ? void 0 : _window$customerEstim3.i18n) || {}
    };

    // Initialize when document is ready
    jQuery(document).ready(function () {
      return _this.init();
    });
  }

  /**
   * Initialize the module
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(CustomerEstimatesAdmin, [{
    key: "init",
    value: function init() {
      this.bindEvents();
      this.initializeActions();
      (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('CustomerEstimatesAdmin', 'Initialized');
    }

    /**
     * Bind event handlers
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this2 = this;
      var $ = jQuery;

      // Handle bulk action form submission
      $('#doaction, #doaction2').on('click', this.handleBulkAction.bind(this));

      // Handle email estimate button click
      $('.email-estimate').on('click', this.handleEmailEstimate.bind(this));

      // Handle status filter change
      $('select[name="status_filter"]').on('change', function () {
        $(this).closest('form').submit();
      });

      // Add table row hover effect
      $('.wp-list-table tbody tr').hover(function () {
        $(this).addClass('row-hover');
      }, function () {
        $(this).removeClass('row-hover');
      });

      // Initialize tooltips if present
      if (typeof $.fn.tooltip === 'function') {
        $('.tooltip-trigger').tooltip();
      }

      // Add export button click handler
      $('#export-estimates-btn').on('click', this.exportEstimates.bind(this));

      // Add print button click handler
      $('.print-estimate-btn').on('click', function (e) {
        e.preventDefault();
        var estimateId = $(e.currentTarget).data('estimate-id');
        if (estimateId) {
          _this2.printEstimate(estimateId);
        }
      });
    }

    /**
     * Initialize actions
     */
  }, {
    key: "initializeActions",
    value: function initializeActions() {
      // Add responsive table labels for mobile
      this.addResponsiveTableLabels();

      // Initialize search field if empty
      this.handleSearchField();

      // Check for admin notices
      this.handleAdminNotices();
    }

    /**
     * Handle bulk action
     * @param {Event} e Click event
     * @returns {boolean} Whether to continue with the action
     */
  }, {
    key: "handleBulkAction",
    value: function handleBulkAction(e) {
      var $ = jQuery;
      var action = $(e.target).prev('select').val();
      if (action === 'delete') {
        var checked = $('tbody th.check-column input[type="checkbox"]:checked');
        if (checked.length === 0) {
          e.preventDefault();
          alert('Please select at least one estimate to delete.');
          return false;
        }
        if (!confirm(this.settings.i18n.confirmBulkDelete)) {
          e.preventDefault();
          return false;
        }
      }
    }

    /**
     * Handle email estimate button click
     * @param {Event} e Click event
     */
  }, {
    key: "handleEmailEstimate",
    value: function handleEmailEstimate(e) {
      var _this3 = this;
      e.preventDefault();
      var $ = jQuery;
      var $button = $(e.currentTarget);
      var estimateId = $button.data('estimate-id');
      var originalText = $button.text();

      // Show loading state
      $button.text(this.settings.i18n.emailSending).prop('disabled', true);

      // Send AJAX request using our ajax utility
      _utils__WEBPACK_IMPORTED_MODULE_2__.ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: {
          action: 'email_estimate',
          estimate_id: estimateId,
          nonce: this.settings.nonce
        }
      }).then(function (data) {
        // Use validation utility to show success message
        _utils__WEBPACK_IMPORTED_MODULE_2__.validation.showNotice(_this3.settings.i18n.emailSuccess, 'success');
      })["catch"](function (error) {
        var _error$data;
        // Use validation utility to show error message
        var errorMessage = _this3.settings.i18n.emailError + ((_error$data = error.data) !== null && _error$data !== void 0 && _error$data.message ? ': ' + error.data.message : '');
        _utils__WEBPACK_IMPORTED_MODULE_2__.validation.showNotice(errorMessage, 'error');
      })["finally"](function () {
        // Reset button state
        $button.text(originalText).prop('disabled', false);
      });
    }

    /**
     * Add responsive table labels for mobile
     */
  }, {
    key: "addResponsiveTableLabels",
    value: function addResponsiveTableLabels() {
      var $ = jQuery;
      if ($(window).width() <= 782) {
        $('.wp-list-table td').each(function () {
          var $td = $(this);
          var th = $td.closest('table').find('th').eq($td.index());
          if (th.length) {
            $td.attr('data-label', th.text());
          }
        });
      }
    }

    /**
     * Handle search field
     */
  }, {
    key: "handleSearchField",
    value: function handleSearchField() {
      var $ = jQuery;
      var $searchField = $('#estimate-search-input');
      if ($searchField.length && !$searchField.val()) {
        $searchField.focus();
      }
    }

    /**
     * Handle admin notices
     */
  }, {
    key: "handleAdminNotices",
    value: function handleAdminNotices() {
      var urlParams = new URLSearchParams(window.location.search);
      var message = urlParams.get('message');
      if (message) {
        var messageText = '';
        var messageType = 'success';
        switch (message) {
          case 'email_sent':
            messageText = 'Email sent successfully!';
            break;
          case 'email_failed':
            messageText = 'Failed to send email.';
            messageType = 'error';
            break;
          case 'deleted':
            messageText = 'Estimate deleted successfully!';
            break;
          case 'delete_failed':
            messageText = 'Failed to delete estimate.';
            messageType = 'error';
            break;
          case 'duplicated':
            messageText = 'Estimate duplicated successfully!';
            break;
          case 'duplicate_failed':
            messageText = 'Failed to duplicate estimate.';
            messageType = 'error';
            break;
        }
        if (messageText) {
          // Use validation utility to show notice
          _utils__WEBPACK_IMPORTED_MODULE_2__.validation.showNotice(messageText, messageType);
        }
      }
    }

    /**
     * Show a notice message using validation utility
     * @param {string} message The message to display
     * @param {string} type The notice type ('success' or 'error')
     */
  }, {
    key: "showNotice",
    value: function showNotice(message) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'success';
      // Use the validation utility function
      _utils__WEBPACK_IMPORTED_MODULE_2__.validation.showNotice(message, type);
    }

    /**
     * Export estimates
     */
  }, {
    key: "exportEstimates",
    value: function exportEstimates() {
      var filters = {};

      // Get current filter values
      var statusFilter = jQuery('select[name="status_filter"]').val();
      var searchTerm = jQuery('#estimate-search-input').val();
      if (statusFilter) filters.status = statusFilter;
      if (searchTerm) filters.search = searchTerm;

      // Create export URL using format utility
      var exportUrl = new URL(this.settings.ajaxUrl);
      exportUrl.searchParams.append('action', 'export_estimates');
      exportUrl.searchParams.append('nonce', this.settings.nonce);

      // Add filters to URL
      for (var key in filters) {
        exportUrl.searchParams.append(key, filters[key]);
      }

      // Trigger download
      window.location.href = exportUrl.toString();
    }

    /**
     * Print single estimate
     * @param {number} estimateId The estimate ID to print
     */
  }, {
    key: "printEstimate",
    value: function printEstimate(estimateId) {
      var $ = jQuery;
      var printWindow = window.open('', '_blank');

      // Show loading state
      printWindow.document.write('<html><head><title>Printing Estimate...</title></head>');
      printWindow.document.write('<body><p>Loading estimate for printing...</p></body></html>');

      // Load estimate content via AJAX using ajax utility
      _utils__WEBPACK_IMPORTED_MODULE_2__.ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: {
          action: 'get_estimate_print_view',
          estimate_id: estimateId,
          nonce: this.settings.nonce
        }
      }).then(function (response) {
        printWindow.document.write(response.html);
        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = function () {
          printWindow.print();
        };
      })["catch"](function (error) {
        var _error$data2;
        printWindow.document.write('<p>Error loading estimate: ' + (((_error$data2 = error.data) === null || _error$data2 === void 0 ? void 0 : _error$data2.message) || 'Unknown error') + '</p>');
        printWindow.document.close();
      });
    }

    /**
     * Handle estimate duplication
     * @param {number} estimateId The estimate ID to duplicate
     */
  }, {
    key: "duplicateEstimate",
    value: function duplicateEstimate(estimateId) {
      var _this4 = this;
      if (!estimateId) return;

      // Confirm duplication
      if (!confirm(this.settings.i18n.duplicateConfirm)) {
        return;
      }

      // Use ajax utility for the request
      _utils__WEBPACK_IMPORTED_MODULE_2__.ajax.wpAjax('duplicate_estimate', {
        estimate_id: estimateId
      }).then(function (response) {
        // Show success message
        _this4.showNotice(response.message || 'Estimate duplicated successfully!');

        // Reload page to show the duplicated estimate
        window.location.reload();
      })["catch"](function (error) {
        // Show error message
        _this4.showNotice(error.message || 'Failed to duplicate estimate', 'error');
      });
    }

    /**
     * Format date for display
     * @param {string} dateString Date string from server
     * @returns {string} Formatted date
     */
  }, {
    key: "formatDate",
    value: function formatDate(dateString) {
      // Use format utility
      return _utils__WEBPACK_IMPORTED_MODULE_2__.format.formatDate(dateString, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    /**
     * Format price for display
     * @param {number|string} amount Price amount
     * @returns {string} Formatted price
     */
  }, {
    key: "formatPrice",
    value: function formatPrice(amount) {
      // Use format utility
      return _utils__WEBPACK_IMPORTED_MODULE_2__.format.formatPrice(amount, '$');
    }

    /**
     * Safely truncate text with ellipsis
     * @param {string} text Text to truncate
     * @param {number} maxLength Maximum length
     * @returns {string} Truncated text
     */
  }, {
    key: "truncateText",
    value: function truncateText(text) {
      var maxLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;
      // Use format utility
      return _utils__WEBPACK_IMPORTED_MODULE_2__.format.truncateText(text, maxLength);
    }
  }]);
}(); // Initialize the module
jQuery(document).ready(function () {
  var module = new CustomerEstimatesAdmin();

  // Make the module available globally for debugging
  window.CustomerEstimatesAdmin = module;
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CustomerEstimatesAdmin);

/***/ }),

/***/ "./src/js/admin/ProductEstimatorAdmin.js":
/*!***********************************************!*\
  !*** ./src/js/admin/ProductEstimatorAdmin.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");


/**
 * Admin JavaScript functionality
 *
 * General admin functionality for the Product Estimator plugin
 * Note: Tab management functionality has been moved to ProductEstimatorSettings.js
 */

var ProductEstimatorAdmin = /*#__PURE__*/function () {
  /**
   * Initialize the admin functionality
   */
  function ProductEstimatorAdmin() {
    var _this = this;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, ProductEstimatorAdmin);
    // Initialize when document is ready
    jQuery(document).ready(function () {
      _this.initializeVariables();
      _this.bindEvents();

      // Only initialize tabs if we're not on the settings page
      if (!_this.isSettingsPage()) {
        _this.initializeTabs();
      }
    });
  }

  /**
   * Check if we're on the settings page to avoid conflicts
   * @returns {boolean} Whether this is the settings page
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(ProductEstimatorAdmin, [{
    key: "isSettingsPage",
    value: function isSettingsPage() {
      // Check if URL contains settings page identifier
      var urlParams = new URLSearchParams(window.location.search);
      var page = urlParams.get('page');
      return page && page.indexOf('-settings') > -1;
    }

    /**
     * Initialize class variables
     */
  }, {
    key: "initializeVariables",
    value: function initializeVariables() {
      this.formChanged = false;
      this.currentTab = '';
      this.reportData = null;
      this.chart = null;
    }

    /**
     * Bind event listeners
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var $ = jQuery;

      // Only bind tab events if not on settings page
      if (!this.isSettingsPage()) {
        // Tab switching
        $('.nav-tab-wrapper').on('click', '.nav-tab', this.handleTabClick.bind(this));
      }

      // Real-time validation
      this.initializeValidation();

      // Window beforeunload
      $(window).on('beforeunload', this.handleBeforeUnload.bind(this));
    }

    /**
     * Initialize tab functionality
     */
  }, {
    key: "initializeTabs",
    value: function initializeTabs() {
      var $ = jQuery;

      // Get first tab if none is active
      var $firstTab = $('.nav-tab:first');
      var firstTabId = $firstTab.data('tab') || 'tab-1';
      $('.tab-content').hide();
      $("#".concat(firstTabId)).show();
      $firstTab.addClass('nav-tab-active');
      this.currentTab = firstTabId;

      // Check for URL parameters
      var urlParams = new URLSearchParams(window.location.search);
      var tab = urlParams.get('tab');
      if (tab) {
        this.switchTab(tab);
      }
    }

    /**
     * Handle tab clicks
     * @param {Event} e - Click event
     */
  }, {
    key: "handleTabClick",
    value: function handleTabClick(e) {
      e.preventDefault();
      var $ = jQuery;
      var tab = $(e.currentTarget).data('tab');
      if (this.formChanged) {
        if (confirm(productEstimatorAdmin.i18n.unsavedChanges)) {
          this.switchTab(tab);
        }
      } else {
        this.switchTab(tab);
      }
    }

    /**
     * Switch to specified tab
     * @param {string} tab - Tab identifier
     */
  }, {
    key: "switchTab",
    value: function switchTab(tab) {
      var $ = jQuery;
      $('.nav-tab').removeClass('nav-tab-active');
      $(".nav-tab[data-tab=\"".concat(tab, "\"]")).addClass('nav-tab-active');
      $('.tab-content').hide();
      $("#".concat(tab)).show();
      this.currentTab = tab;

      // Update URL without reload
      var url = new URL(window.location);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url);

      // Load tab-specific content
      if (tab === 'reports' && !this.reportData) {
        this.loadInitialReport();
      }
    }

    /**
     * Initialize form validation
     */
  }, {
    key: "initializeValidation",
    value: function initializeValidation() {
      // Skip this if we're on the settings page
      if (this.isSettingsPage()) {
        return;
      }
      var $ = jQuery;
      var $form = $('.product-estimator-form');

      // Real-time email validation
      $form.find('input[type="email"]').on('change', function (e) {
        var $input = $(e.currentTarget);
        var email = $input.val();
        if (email && !(0,_utils__WEBPACK_IMPORTED_MODULE_2__.validateEmail)(email)) {
          (0,_utils__WEBPACK_IMPORTED_MODULE_2__.showFieldError)($input, productEstimatorAdmin.i18n.invalidEmail);
        } else {
          (0,_utils__WEBPACK_IMPORTED_MODULE_2__.clearFieldError)($input);
        }
      });

      // Number range validation
      $form.find('input[type="number"]').on('change', function (e) {
        var $input = $(e.currentTarget);
        var value = parseInt($input.val());
        var min = parseInt($input.attr('min'));
        var max = parseInt($input.attr('max'));
        if (value < min || value > max) {
          (0,_utils__WEBPACK_IMPORTED_MODULE_2__.showFieldError)($input, productEstimatorAdmin.i18n.numberRange.replace('%min%', min).replace('%max%', max));
        } else {
          (0,_utils__WEBPACK_IMPORTED_MODULE_2__.clearFieldError)($input);
        }
      });
    }

    /**
     * Handle window beforeunload event
     * @param {Event} e - BeforeUnload event
     */
  }, {
    key: "handleBeforeUnload",
    value: function handleBeforeUnload(e) {
      if (this.formChanged) {
        e.preventDefault();
        return productEstimatorAdmin.i18n.unsavedChanges;
      }
    }

    /**
     * Load initial report data (placeholder for report functionality)
     */
  }, {
    key: "loadInitialReport",
    value: function loadInitialReport() {
      // This would load report data from the server via AJAX
      console.log('Loading initial report data');
    }
  }]);
}(); // Create instance and make globally available
var admin = new ProductEstimatorAdmin();

// Export for module use
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProductEstimatorAdmin);

/***/ }),

/***/ "./src/js/admin/ProductEstimatorSettings.js":
/*!**************************************************!*\
  !*** ./src/js/admin/ProductEstimatorSettings.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");


/**
 * Main Settings JavaScript
 *
 * Handles common functionality for the settings page.
 * Modified to work with separate forms for each tab.
 */

var ProductEstimatorSettings = /*#__PURE__*/function () {
  /**
   * Initialize the Settings Manager
   */
  function ProductEstimatorSettings() {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, ProductEstimatorSettings);
    this.formChanged = false;
    this.currentTab = '';
    this.formChangeTrackers = {}; // Track form changes per tab

    // Make sure necessary global variables exist
    this.ensureGlobalVariables();
    this.init();
  }

  /**
   * Ensure all required global variables exist to prevent reference errors
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(ProductEstimatorSettings, [{
    key: "ensureGlobalVariables",
    value: function ensureGlobalVariables() {
      // Create fallbacks for all settings data objects that might be referenced
      window.generalSettingsData = window.generalSettingsData || {
        tab_id: 'general',
        i18n: {}
      };
      window.netsuiteSettings = window.netsuiteSettings || {
        tab_id: 'netsuite',
        i18n: {}
      };
      window.notificationSettings = window.notificationSettings || {
        tab_id: 'notifications',
        i18n: {}
      };
      window.productAdditionsSettings = window.productAdditionsSettings || {
        tab_id: 'product_additions',
        i18n: {}
      };
      window.pricingRulesSettings = window.pricingRulesSettings || {
        tab_id: 'pricing_rules',
        i18n: {}
      };
      window.similarProducts = window.similarProducts || {
        tab_id: 'similar_products',
        i18n: {}
      };
      window.productUpgradesSettings = window.productUpgradesSettings || {
        tab_id: 'product_upgrades',
        i18n: {}
      };

      // Ensure productEstimatorSettings exists
      window.productEstimatorSettings = window.productEstimatorSettings || {
        ajax_url: typeof ajaxurl !== 'undefined' ? ajaxurl : '/wp-admin/admin-ajax.php',
        nonce: '',
        i18n: {
          unsavedChanges: 'You have unsaved changes. Are you sure you want to leave this tab?',
          saveSuccess: 'Settings saved successfully.',
          saveError: 'Error saving settings.'
        }
      };
    }

    /**
     * Initialize the Settings Manager
     */
  }, {
    key: "init",
    value: function init() {
      // Only set default tab to 'general' if no tab is specified in URL
      var urlTab = this.getTabFromUrl();
      this.currentTab = urlTab !== null ? urlTab : 'general';

      // Initialize tabs
      jQuery('.tab-content').hide();
      jQuery("#".concat(this.currentTab)).show();

      // Update active tab in navigation
      jQuery('.nav-tab').removeClass('nav-tab-active');
      jQuery(".nav-tab[data-tab=\"".concat(this.currentTab, "\"]")).addClass('nav-tab-active');
      this.bindEvents();
      this.initFormChangeTracking();
      this.initializeValidation();
      (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductEstimatorSettings', 'Settings manager initialized with tab:', this.currentTab);
    }

    /**
     * Bind event handlers
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var $ = jQuery;

      // Tab switching
      $('.nav-tab-wrapper').on('click', '.nav-tab', this.handleTabClick.bind(this));

      // Form submission - convert to AJAX
      $('.product-estimator-form').on('submit', this.handleAjaxFormSubmit.bind(this));

      // Window beforeunload for unsaved changes warning
      $(window).on('beforeunload', this.handleBeforeUnload.bind(this));

      // log('ProductEstimatorSettings', 'Events bound');
    }

    /**
     * Handle AJAX form submission
     * @param {Event} e - Submit event
     */
  }, {
    key: "handleAjaxFormSubmit",
    value: function handleAjaxFormSubmit(e) {
      var _this = this;
      e.preventDefault();
      var $ = jQuery;
      var $form = $(e.target);
      var tabId = $form.closest('.tab-content').attr('id');
      var formData = $form.serialize();
      console.log('Serialized form data:', formData);

      // Show loading state
      this.showFormLoading($form);
      (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductEstimatorSettings', "Submitting form for tab: ".concat(tabId));

      // Make the AJAX request to save settings
      _utils__WEBPACK_IMPORTED_MODULE_2__.ajax.ajaxRequest({
        url: productEstimatorSettings.ajax_url,
        type: 'POST',
        data: {
          action: 'save_' + tabId + '_settings',
          nonce: productEstimatorSettings.nonce,
          form_data: formData
        }
      }).then(function (response) {
        // Show success message
        _utils__WEBPACK_IMPORTED_MODULE_2__.validation.showNotice(response.message || productEstimatorSettings.i18n.saveSuccess, 'success');

        // Reset the change flags for this tab's form
        _this.formChangeTrackers[tabId] = false;

        // If this is the current tab, reset the main formChanged flag
        if (tabId === _this.currentTab) {
          _this.formChanged = false;
        }
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductEstimatorSettings', "Settings saved successfully for tab: ".concat(tabId));
      })["catch"](function (error) {
        // Show error message
        _utils__WEBPACK_IMPORTED_MODULE_2__.validation.showNotice(error.message || productEstimatorSettings.i18n.saveError, 'error');
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductEstimatorSettings', "Error saving settings for tab ".concat(tabId, ":"), error);
      })["finally"](function () {
        _this.hideFormLoading($form);
      });
    }

    /**
     * Show loading state for form
     * @param {jQuery} $form - The form element
     */
  }, {
    key: "showFormLoading",
    value: function showFormLoading($form) {
      var $submitButton = $form.find(':submit');
      $submitButton.prop('disabled', true).addClass('loading');
      $submitButton.data('original-text', $submitButton.val());
      $submitButton.val(productEstimatorSettings.i18n.saving || 'Saving...');
    }

    /**
     * Hide loading state for form
     * @param {jQuery} $form - The form element
     */
  }, {
    key: "hideFormLoading",
    value: function hideFormLoading($form) {
      var $submitButton = $form.find(':submit');
      $submitButton.prop('disabled', false).removeClass('loading');
      $submitButton.val($submitButton.data('original-text'));
    }

    /**
     * Initialize form change tracking for each tab's form
     */
  }, {
    key: "initFormChangeTracking",
    value: function initFormChangeTracking() {
      var $ = jQuery;
      var self = this;

      // Initialize tracker for each tab's form
      $('.tab-content').each(function () {
        var tabId = $(this).attr('id');
        self.formChangeTrackers[tabId] = false;

        // Track form changes for this tab
        $("#".concat(tabId, " :input")).on('change input', function () {
          self.formChangeTrackers[tabId] = true;

          // If this is the current tab, update the main formChanged flag
          if (tabId === self.currentTab) {
            self.formChanged = true;
          }
        });
      });
      (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductEstimatorSettings', 'Form change tracking initialized');
    }

    /**
     * Initialize form validation
     */
  }, {
    key: "initializeValidation",
    value: function initializeValidation() {
      var $ = jQuery;

      // Apply validation to all forms
      $('.product-estimator-form').each(function () {
        var $form = $(this);

        // Real-time email validation
        $form.find('input[type="email"]').on('change', function (e) {
          var $input = $(this);
          var email = $input.val();
          if (email && !_utils__WEBPACK_IMPORTED_MODULE_2__.validation.validateEmail(email)) {
            _utils__WEBPACK_IMPORTED_MODULE_2__.validation.showFieldError($input, productEstimatorSettings.i18n.invalidEmail || 'Invalid email address');
          } else {
            _utils__WEBPACK_IMPORTED_MODULE_2__.validation.clearFieldError($input);
          }
        });

        // Number range validation
        $form.find('input[type="number"]').on('change', function (e) {
          var $input = $(this);
          var value = parseInt($input.val());
          var min = parseInt($input.attr('min') || 0);
          var max = parseInt($input.attr('max') || 9999);
          if (isNaN(value) || value < min || value > max) {
            var message = productEstimatorSettings.i18n.numberRange ? productEstimatorSettings.i18n.numberRange.replace('%min%', min).replace('%max%', max) : "Value must be between ".concat(min, " and ").concat(max);
            _utils__WEBPACK_IMPORTED_MODULE_2__.validation.showFieldError($input, message);
          } else {
            _utils__WEBPACK_IMPORTED_MODULE_2__.validation.clearFieldError($input);
          }
        });
      });
      (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductEstimatorSettings', 'Form validation initialized');
    }

    /**
     * Get the active tab from URL
     * @returns {string|null} The active tab or null if not present
     */
  }, {
    key: "getTabFromUrl",
    value: function getTabFromUrl() {
      var urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('tab');
    }

    /**
     * Handle tab click
     * @param {Event} e Click event
     */
  }, {
    key: "handleTabClick",
    value: function handleTabClick(e) {
      e.preventDefault();
      var newTab = jQuery(e.currentTarget).data('tab');

      // Warn about unsaved changes before switching tabs
      if (this.formChanged) {
        if (!confirm(productEstimatorSettings.i18n.unsavedChanges)) {
          return;
        }
      }
      this.switchTab(newTab);
    }

    /**
     * Switch to a different tab
     * @param {string} tabId The tab to switch to
     */
  }, {
    key: "switchTab",
    value: function switchTab(tabId) {
      var $ = jQuery;

      // Update active tab in URL without reload
      var url = new URL(window.location);
      url.searchParams.set('tab', tabId);
      window.history.pushState({}, '', url);

      // Update active tab in navigation
      $('.nav-tab').removeClass('nav-tab-active');
      $(".nav-tab[data-tab=\"".concat(tabId, "\"]")).addClass('nav-tab-active');

      // Show the active tab content
      $('.tab-content').hide();
      $("#".concat(tabId)).show();

      // Update current tab
      var previousTab = this.currentTab;
      this.currentTab = tabId;

      // Update the formChanged flag based on the new tab's form state
      this.formChanged = this.formChangeTrackers[tabId] || false;

      // Trigger tab changed event for modules
      $(document).trigger('product_estimator_tab_changed', [tabId, previousTab]);
      (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductEstimatorSettings', "Switched to tab: ".concat(tabId, " from ").concat(previousTab));
    }

    /**
     * Handle beforeunload event to warn about unsaved changes
     * @param {Event} e - BeforeUnload event
     */
  }, {
    key: "handleBeforeUnload",
    value: function handleBeforeUnload(e) {
      // Check if any tab form has unsaved changes
      var hasChanges = false;
      for (var tabId in this.formChangeTrackers) {
        if (this.formChangeTrackers[tabId]) {
          hasChanges = true;
          break;
        }
      }
      if (hasChanges) {
        var message = productEstimatorSettings.i18n.unsavedChanges;
        e.returnValue = message;
        return message;
      }
    }

    /**
     * Public method to show field error - for module compatibility
     * @param {jQuery|HTMLElement} field - The field with an error
     * @param {string} message - The error message
     */
  }, {
    key: "showFieldError",
    value: function showFieldError(field, message) {
      _utils__WEBPACK_IMPORTED_MODULE_2__.validation.showFieldError(field, message);
    }

    /**
     * Public method to clear field error - for module compatibility
     * @param {jQuery|HTMLElement} field - The field to clear error for
     */
  }, {
    key: "clearFieldError",
    value: function clearFieldError(field) {
      _utils__WEBPACK_IMPORTED_MODULE_2__.validation.clearFieldError(field);
    }

    /**
     * Public method to show notice - for module compatibility
     * @param {string} message - The message to show
     * @param {string} type - Notice type ('success' or 'error')
     */
  }, {
    key: "showNotice",
    value: function showNotice(message) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'success';
      _utils__WEBPACK_IMPORTED_MODULE_2__.validation.showNotice(message, type);
    }
  }]);
}(); // Initialize when document is ready
jQuery(document).ready(function () {
  // Make settings manager available globally for modules
  window.ProductEstimatorSettings = new ProductEstimatorSettings();
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProductEstimatorSettings);

/***/ }),

/***/ "./src/js/admin/index.js":
/*!*******************************!*\
  !*** ./src/js/admin/index.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _CustomerEstimatesAdmin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CustomerEstimatesAdmin */ "./src/js/admin/CustomerEstimatesAdmin.js");
/* harmony import */ var _ProductEstimatorAdmin__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ProductEstimatorAdmin */ "./src/js/admin/ProductEstimatorAdmin.js");
/* harmony import */ var _ProductEstimatorSettings__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ProductEstimatorSettings */ "./src/js/admin/ProductEstimatorSettings.js");
/* harmony import */ var _modules_GeneralSettingsModule__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./modules/GeneralSettingsModule */ "./src/js/admin/modules/GeneralSettingsModule.js");
/* harmony import */ var _modules_NetsuiteSettingsModule__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./modules/NetsuiteSettingsModule */ "./src/js/admin/modules/NetsuiteSettingsModule.js");
/* harmony import */ var _modules_NotificationSettingsModule__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./modules/NotificationSettingsModule */ "./src/js/admin/modules/NotificationSettingsModule.js");
/* harmony import */ var _modules_ProductAdditionsSettingsModule__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./modules/ProductAdditionsSettingsModule */ "./src/js/admin/modules/ProductAdditionsSettingsModule.js");
/* harmony import */ var _modules_PricingRulesSettingsModule__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./modules/PricingRulesSettingsModule */ "./src/js/admin/modules/PricingRulesSettingsModule.js");
/* harmony import */ var _modules_SimilarProductsSettingsModule__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./modules/SimilarProductsSettingsModule */ "./src/js/admin/modules/SimilarProductsSettingsModule.js");
/* harmony import */ var _modules_SimilarProductsSettingsModule__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_modules_SimilarProductsSettingsModule__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _modules_ProductUpgradesSettingsModule__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./modules/ProductUpgradesSettingsModule */ "./src/js/admin/modules/ProductUpgradesSettingsModule.js");
/* harmony import */ var _modules_LabelSettingsModule__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./modules/LabelSettingsModule */ "./src/js/admin/modules/LabelSettingsModule.js");
/**
 * Main entry point for the Product Estimator plugin frontend
 */












// This is the main entry point for the frontend script bundle
// The admin modules are imported separately due to code splitting in webpack

console.log('Product Estimator Admin initialized');

// Frontend functionality can be added here

/***/ }),

/***/ "./src/js/admin/modules/GeneralSettingsModule.js":
/*!*******************************************************!*\
  !*** ./src/js/admin/modules/GeneralSettingsModule.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils_tinymce_preserver__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @utils/tinymce-preserver */ "./src/js/utils/tinymce-preserver.js");


/**
 * General Settings Module JavaScript
 *
 * Handles functionality specific to the general settings tab.
 *
 * FIXED VERSION: Adds proper method bindings and context preservation
 */


var GeneralSettingsModule = /*#__PURE__*/function () {
  /**
   * Initialize the module
   */
  function GeneralSettingsModule() {
    var _this = this;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, GeneralSettingsModule);
    // Bind methods to ensure 'this' context is preserved
    this.validateMarkup = this.validateMarkup.bind(this);
    this.validateExpiryDays = this.validateExpiryDays.bind(this);
    this.showFieldError = this.showFieldError.bind(this);
    this.clearFieldError = this.clearFieldError.bind(this);
    this.handleTabChanged = this.handleTabChanged.bind(this);
    this.saveEditorContent = this.saveEditorContent.bind(this);
    this.validateAllFields = this.validateAllFields.bind(this);

    // Wait for document ready
    jQuery(document).ready(function () {
      return _this.init();
    });
  }

  /**
   * Initialize the module
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(GeneralSettingsModule, [{
    key: "init",
    value: function init() {
      this.mediaFrame = null;
      this.bindEvents();
      this.setupValidation();
      this.setupWpEditors();
      console.log('GeneralSettingsModule: Initialized');
    }

    /**
     * Bind event handlers
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var $ = jQuery;

      // Listen for tab changes
      $(document).on('product_estimator_tab_changed', this.handleTabChanged);
      $('.file-upload-button').on('click', this.handleFileUpload.bind(this));
      $('.file-remove-button').on('click', this.handleFileRemove.bind(this));
    }

    /**
     * Improved setupWpEditors function with specific fixes for <br> tags
     * This preserves HTML, especially <br> tags, when switching between modes
     */
  }, {
    key: "setupWpEditors",
    value: function setupWpEditors() {
      // Call the utility with the same parameters that work in your original function
      (0,_utils_tinymce_preserver__WEBPACK_IMPORTED_MODULE_2__.setupTinyMCEHTMLPreservation)(['pdf_footer_text', 'pdf_footer_contact_details_content'], '#general');
    }

    /**
     * Handle file upload button click
     * @param {Event} e Click event
     */
  }, {
    key: "handleFileUpload",
    value: function handleFileUpload(e) {
      var _this2 = this;
      e.preventDefault();
      var $ = jQuery;
      var button = $(e.currentTarget);
      var fieldId = button.data('field-id');
      var acceptType = button.data('accept') || '';

      // If the media frame already exists, reopen it
      if (this.mediaFrame) {
        this.mediaFrame.open();
        return;
      }

      // Create a new media frame
      this.mediaFrame = wp.media({
        title: 'Select or Upload PDF Template',
        button: {
          text: 'Use this file'
        },
        multiple: false,
        library: {
          type: acceptType ? [acceptType.split('/')[0]] : null // 'application/pdf' -> 'application'
        }
      });

      // When a file is selected, run a callback
      this.mediaFrame.on('select', function () {
        var attachment = _this2.mediaFrame.state().get('selection').first().toJSON();

        // Set the attachment ID in the hidden input
        $("#".concat(fieldId)).val(attachment.id).trigger('change');

        // Update the file preview
        var $previewWrapper = button.siblings('.file-preview-wrapper');
        $previewWrapper.html("<p class=\"file-preview\"><a href=\"".concat(attachment.url, "\" target=\"_blank\">").concat(attachment.filename, "</a></p>"));

        // Show the remove button
        button.siblings('.file-remove-button').removeClass('hidden');
      });

      // Open the modal
      this.mediaFrame.open();
    }

    /**
     * Handle file remove button click
     * @param {Event} e Click event
     */
  }, {
    key: "handleFileRemove",
    value: function handleFileRemove(e) {
      e.preventDefault();
      var $ = jQuery;
      var button = $(e.currentTarget);
      var fieldId = button.data('field-id');

      // Clear the attachment ID
      $("#".concat(fieldId)).val('').trigger('change');

      // Clear the preview
      button.siblings('.file-preview-wrapper').empty();

      // Hide the remove button
      button.addClass('hidden');
    }

    /**
     * Set up field validation
     */
  }, {
    key: "setupValidation",
    value: function setupValidation() {
      var $ = jQuery;

      // Validate markup percentage
      $('#default_markup').on('change input', this.validateMarkup);

      // Validate expiry days
      $('#estimate_expiry_days').on('change input', this.validateExpiryDays);
    }

    /**
     * Validate markup percentage
     * @param {Event} e Input event
     */
  }, {
    key: "validateMarkup",
    value: function validateMarkup(e) {
      var $ = jQuery;
      var $input = $(e.currentTarget);
      var value = parseInt($input.val());
      var min = parseInt($input.attr('min') || 0);
      var max = parseInt($input.attr('max') || 100);
      if (isNaN(value) || value < min || value > max) {
        // Use the showFieldError method with proper binding
        this.showFieldError($input, generalSettingsData.i18n.validationErrorMarkup || "Value must be between ".concat(min, " and ").concat(max));
        return false;
      } else {
        // Use the clearFieldError method with proper binding
        this.clearFieldError($input);
        return true;
      }
    }

    /**
     * Validate expiry days
     * @param {Event} e Input event
     */
  }, {
    key: "validateExpiryDays",
    value: function validateExpiryDays(e) {
      var $ = jQuery;
      var $input = $(e.currentTarget);
      var value = parseInt($input.val());
      var min = parseInt($input.attr('min') || 1);
      var max = parseInt($input.attr('max') || 365);
      if (isNaN(value) || value < min || value > max) {
        // Use the imported utility method
        this.showFieldError($input, generalSettingsData.i18n.validationErrorExpiry || "Value must be between ".concat(min, " and ").concat(max));
        return false;
      } else {
        // Use the imported utility method
        this.clearFieldError($input);
        return true;
      }
    }

    /**
     * Show field error message
     * @param {jQuery} $field The field element
     * @param {string} message Error message
     */
  }, {
    key: "showFieldError",
    value: function showFieldError($field, message) {
      // First try to use the global utility in ProductEstimatorSettings
      if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.showFieldError === 'function') {
        ProductEstimatorSettings.showFieldError($field, message);
      } else if (typeof validation !== 'undefined' && typeof validation.showFieldError === 'function') {
        // Otherwise use the imported utility function directly
        validation.showFieldError($field, message);
      } else {
        // Fallback implementation
        $field.addClass('error');

        // Clear any existing error first
        this.clearFieldError($field);

        // Create error element
        var $error = jQuery("<span class=\"field-error\">".concat(message, "</span>"));

        // Add it after the field
        $field.after($error);
      }
    }

    /**
     * Clear field error message
     * @param {jQuery} $field The field element
     */
  }, {
    key: "clearFieldError",
    value: function clearFieldError($field) {
      // First try to use the global utility in ProductEstimatorSettings
      if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.clearFieldError === 'function') {
        ProductEstimatorSettings.clearFieldError($field);
      } else if (typeof validation !== 'undefined' && typeof validation.clearFieldError === 'function') {
        // Otherwise use the imported utility function directly
        validation.clearFieldError($field);
      } else {
        // Fallback implementation
        $field.removeClass('error');
        $field.next('.field-error').remove();
      }
    }

    /**
     * Handle tab changed event
     * @param {Event} e Tab changed event
     * @param {string} tabId The newly active tab ID
     */
  }, {
    key: "handleTabChanged",
    value: function handleTabChanged(e, tabId) {
      // If our tab becomes active, refresh any dynamic content
      if (tabId === 'general') {
        // Make sure editors are refreshed when switching to this tab
        this.setupWpEditors();
        console.log('GeneralSettingsModule: Tab changed to General Settings, refreshing editors');
      }
    }

    /**
     * Ensure TinyMCE content is saved to the textarea
     * This should be called before form submission
     */
  }, {
    key: "saveEditorContent",
    value: function saveEditorContent() {
      if (typeof tinyMCE !== 'undefined') {
        // Save content from all active editors
        var editors = ['pdf_footer_text', 'pdf_footer_contact_details_content'];
        editors.forEach(function (editorId) {
          var editor = tinyMCE.get(editorId);
          if (editor) {
            editor.save();
          }
        });
      }
    }

    /**
     * Validate all fields in the form
     * @returns {boolean} Whether all fields are valid
     */
  }, {
    key: "validateAllFields",
    value: function validateAllFields() {
      var isValid = true;

      // Save editor content before validation
      this.saveEditorContent();

      // Validate markup
      if (!this.validateMarkup({
        currentTarget: jQuery('#default_markup')
      })) {
        isValid = false;
      }

      // Validate expiry days
      if (!this.validateExpiryDays({
        currentTarget: jQuery('#estimate_expiry_days')
      })) {
        isValid = false;
      }
      return isValid;
    }

    /**
     * Display notice message
     * @param {string} message The message to show
     * @param {string} type Notice type ('success' or 'error')
     */
  }, {
    key: "showNotice",
    value: function showNotice(message) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'success';
      // Use the global utility if available
      if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.showNotice === 'function') {
        ProductEstimatorSettings.showNotice(message, type);
      } else if (typeof validation !== 'undefined' && typeof validation.showNotice === 'function') {
        // Use the imported utility function
        validation.showNotice(message, type);
      } else {
        // Basic fallback implementation
        var $ = jQuery;
        var $notice = $("<div class=\"notice notice-".concat(type, " is-dismissible\"><p>").concat(message, "</p></div>"));

        // Find a good place to show the notice
        $('.wrap h1').after($notice);

        // Auto-dismiss after 5 seconds
        setTimeout(function () {
          $notice.fadeOut(500, function () {
            return $notice.remove();
          });
        }, 5000);
      }
    }
  }]);
}(); // Initialize when document is ready
jQuery(document).ready(function () {
  // Make module available globally
  window.GeneralSettingsModule = new GeneralSettingsModule();
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GeneralSettingsModule);

/***/ }),

/***/ "./src/js/admin/modules/LabelSettingsModule.js":
/*!*****************************************************!*\
  !*** ./src/js/admin/modules/LabelSettingsModule.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");


/**
 * Label Settings JavaScript
 *
 * Handles functionality specific to the label settings tab.
 */


var LabelSettingsModule = /*#__PURE__*/function () {
  /**
   * Initialize the module
   */
  function LabelSettingsModule() {
    var _this = this;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, LabelSettingsModule);
    // Initialize when document is ready
    jQuery(document).ready(function () {
      return _this.init();
    });
  }

  /**
   * Initialize the module
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(LabelSettingsModule, [{
    key: "init",
    value: function init() {
      var _this2 = this;
      console.log('Label Settings Module initialized');
      this.bindEvents();

      // Slight delay to ensure DOM is fully rendered
      setTimeout(function () {
        _this2.setupVerticalTabs();
      }, 100);
    }

    /**
     * Bind event handlers
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var $ = jQuery;

      // Listen for tab changes
      $(document).on('product_estimator_tab_changed', this.handleTabChanged.bind(this));

      // Form submission - convert to AJAX
      $('.label-settings-form').on('submit', this.handleFormSubmit.bind(this));

      // Vertical tabs navigation - use delegated events to handle dynamically loaded content
      $(document).on('click', '.vertical-tabs-nav a', this.handleVerticalTabClick.bind(this));

      // Email validation
      $(document).on('change', 'input[type="email"]', this.validateEmail.bind(this));

      // console.log('Label Settings events bound');
    }

    /**
     * Validate email field
     * @param {Event} e Change event
     */
  }, {
    key: "validateEmail",
    value: function validateEmail(e) {
      var $ = jQuery;
      var $field = $(e.target);
      var email = $field.val().trim();
      if (email && !_utils__WEBPACK_IMPORTED_MODULE_2__.validation.validateEmail(email)) {
        this.showFieldError($field, 'Please enter a valid email address');
        return false;
      }
      this.clearFieldError($field);
      return true;
    }

    /**
     * Show field error message
     * @param {jQuery} $field The field element
     * @param {string} message Error message
     */
  }, {
    key: "showFieldError",
    value: function showFieldError($field, message) {
      if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.showFieldError === 'function') {
        ProductEstimatorSettings.showFieldError($field, message);
      } else {
        _utils__WEBPACK_IMPORTED_MODULE_2__.validation.clearFieldError($field);
        var $error = jQuery("<span class=\"field-error\">".concat(message, "</span>"));
        $field.after($error).addClass('error');
      }
    }

    /**
     * Clear field error message
     * @param {jQuery} $field The field element
     */
  }, {
    key: "clearFieldError",
    value: function clearFieldError($field) {
      if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.clearFieldError === 'function') {
        ProductEstimatorSettings.clearFieldError($field);
      } else {
        _utils__WEBPACK_IMPORTED_MODULE_2__.validation.clearFieldError($field);
      }
    }

    /**
     * Set up vertical tabs
     */
  }, {
    key: "setupVerticalTabs",
    value: function setupVerticalTabs() {
      var $ = jQuery;
      console.log('Setting up vertical tabs');

      // First check URL parameters for sub_tab
      var activeTabId = 'labels-general'; // Default to general

      // Check for sub_tab in URL
      var urlParams = new URLSearchParams(window.location.search);
      var subTab = urlParams.get('sub_tab');
      if (subTab && $('.vertical-tabs-nav a[data-tab="' + subTab + '"]').length) {
        activeTabId = subTab;
      }
      // If no valid sub_tab in URL, look for .active class
      else if ($('.vertical-tabs-nav .tab-item.active a').length) {
        activeTabId = $('.vertical-tabs-nav .tab-item.active a').data('tab');
      }
      console.log('Active tab ID:', activeTabId);

      // Show the active tab
      this.showVerticalTab(activeTabId);

      // Adjust height of the tab content container to match the nav
      this.adjustTabContentHeight();

      // Adjust on window resize
      $(window).on('resize', this.adjustTabContentHeight.bind(this));
    }

    /**
     * Adjust tab content height
     */
  }, {
    key: "adjustTabContentHeight",
    value: function adjustTabContentHeight() {
      var $ = jQuery;
      var navHeight = $('.vertical-tabs-nav').outerHeight();
      if (navHeight) {
        $('.vertical-tabs-content').css('min-height', navHeight + 'px');
      }
    }

    /**
     * Handle vertical tab click
     * @param {Event} e Click event
     */
  }, {
    key: "handleVerticalTabClick",
    value: function handleVerticalTabClick(e) {
      e.preventDefault();
      var $ = jQuery;
      var $link = $(e.currentTarget);
      var tabId = $link.data('tab');
      console.log('Vertical tab clicked:', tabId);

      // Update URL hash
      window.history.pushState({}, '', "?page=product-estimator-settings&tab=labels&sub_tab=".concat(tabId));

      // Show the selected tab
      this.showVerticalTab(tabId);
    }

    /**
     * Show vertical tab
     * @param {string} tabId Tab ID to show
     */
  }, {
    key: "showVerticalTab",
    value: function showVerticalTab(tabId) {
      var $ = jQuery;
      console.log('Showing vertical tab:', tabId);

      // Update active tab in navigation
      $('.vertical-tabs-nav .tab-item').removeClass('active');
      $(".vertical-tabs-nav a[data-tab=\"".concat(tabId, "\"]")).parent().addClass('active');

      // Show the tab content
      $('.vertical-tab-content').hide().removeClass('active');
      $("#".concat(tabId)).show().addClass('active');
    }

    /**
     * Handle tab changed event
     * @param {Event} e Tab changed event
     * @param {string} tabId The newly active tab ID
     */
  }, {
    key: "handleTabChanged",
    value: function handleTabChanged(e, tabId) {
      var _this3 = this;
      // If our tab becomes active, refresh vertical tabs
      if (tabId === 'labels') {
        console.log('Labels tab activated');

        // Slight delay to ensure content is rendered
        setTimeout(function () {
          _this3.setupVerticalTabs();
        }, 100);
      }
    }

    /**
     * Handle form submission
     * @param {Event} e Submit event
     */
  }, {
    key: "handleFormSubmit",
    value: function handleFormSubmit(e) {
      e.preventDefault();
      var $ = jQuery;
      var $form = $(e.currentTarget);
      var formData = $form.serialize();
      var type = $form.data('type') || 'labels-general';
      console.log('Form submitted for type:', type);

      // Show loading state
      var $submitButton = $form.find('.save-settings');
      var $spinner = $form.find('.spinner');
      $submitButton.prop('disabled', true);
      $spinner.addClass('is-active');

      // Ensure unchecked checkboxes are properly represented
      // This helps ensure all checkboxes are submitted even when unchecked
      var formDataStr = formData;
      var checkboxFields = $form.find('input[type="checkbox"]');
      checkboxFields.each(function () {
        if (!$(this).is(':checked') && !formDataStr.includes($(this).attr('name'))) {
          formDataStr += '&' + $(this).attr('name') + '=0';
        }
      });

      // Log the data being sent
      console.log('Sending form data:', formDataStr);

      // Submit the form via AJAX - use the direct save_labels_settings action
      _utils__WEBPACK_IMPORTED_MODULE_2__.ajax.ajaxRequest({
        url: productEstimatorSettings.ajax_url,
        type: 'POST',
        data: {
          action: 'save_labels_settings',
          // Direct action name
          nonce: productEstimatorSettings.nonce,
          form_data: formDataStr,
          label_type: type
        }
      }).then(function (response) {
        console.log('Success response:', response);
        // Show success message
        if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.showNotice === 'function') {
          ProductEstimatorSettings.showNotice(response.message || 'Labels saved successfully', 'success');
        } else {
          (0,_utils__WEBPACK_IMPORTED_MODULE_2__.showNotice)(response.message || 'Labels saved successfully', 'success');
        }
      })["catch"](function (error) {
        console.error('Error response:', error);
        // Show error message
        if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.showNotice === 'function') {
          ProductEstimatorSettings.showNotice(error.message || 'Error saving labels', 'error');
        } else {
          (0,_utils__WEBPACK_IMPORTED_MODULE_2__.showNotice)(error.message || 'Error saving labels', 'error');
        }
      })["finally"](function () {
        // Reset form state
        $submitButton.prop('disabled', false);
        $spinner.removeClass('is-active');
      });
    }
  }]);
}(); // Initialize the module and make it globally available
var labelSettingsInstance = null;
jQuery(document).ready(function () {
  console.log('Document ready, initializing Label Settings Module');
  labelSettingsInstance = new LabelSettingsModule();

  // Export the module globally for backward compatibility
  window.LabelSettingsModule = labelSettingsInstance;
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (LabelSettingsModule);

/***/ }),

/***/ "./src/js/admin/modules/NetsuiteSettingsModule.js":
/*!********************************************************!*\
  !*** ./src/js/admin/modules/NetsuiteSettingsModule.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils_validation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @utils/validation */ "./src/js/utils/validation.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/* harmony import */ var _utils_ajax__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @utils/ajax */ "./src/js/utils/ajax.js");
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @utils/dom */ "./src/js/utils/dom.js");


/**
 * NetSuite Settings JavaScript
 *
 * Handles functionality specific to the NetSuite integration settings tab.
 */




var NetsuiteSettingsModule = /*#__PURE__*/function () {
  /**
   * Initialize the module
   */
  function NetsuiteSettingsModule() {
    var _this = this;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, NetsuiteSettingsModule);
    // Initialize when document is ready
    jQuery(document).ready(function () {
      return _this.init();
    });
  }

  /**
   * Initialize the module
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(NetsuiteSettingsModule, [{
    key: "init",
    value: function init() {
      // Log initialization if debug mode is enabled
      (0,_utils__WEBPACK_IMPORTED_MODULE_3__.log)('NetsuiteSettingsModule', 'Initializing NetSuite settings module');
      this.bindEvents();
      this.setupDependentFields();
    }

    /**
     * Bind event handlers
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var $ = jQuery;

      // Test connection button
      $('#test-netsuite-connection').on('click', this.testNetsuiteConnection.bind(this));

      // Handle enable/disable toggle
      $('#netsuite_enabled').on('change', this.toggleNetsuiteFields.bind(this));

      // URL validation
      $('#netsuite_api_url, #netsuite_token_url').on('change', this.validateUrl.bind(this));

      // Number range validation
      $('#netsuite_request_limit').on('change', this.validateRequestLimit.bind(this));
      $('#netsuite_cache_time').on('change', this.validateCacheTime.bind(this));

      // Listen for tab changes
      $(document).on('product_estimator_tab_changed', this.handleTabChanged.bind(this));

      // Add handler for form submission - THIS IS THE FIX
      $('.product-estimator-form').on('submit', this.handleFormSubmit.bind(this));

      // log('NetsuiteSettingsModule', 'Events bound successfully');
    }

    /**
     * Handle form submission - THIS IS THE NEW METHOD
     * @param {Event} e Submit event
     */
  }, {
    key: "handleFormSubmit",
    value: function handleFormSubmit(e) {
      // Only handle if this is our tab's form
      var $ = jQuery;
      var $form = $(e.currentTarget);

      // Make sure we're on the netsuite tab
      if ($form.closest('#netsuite').length === 0) {
        return; // Let the default handler process it
      }
      e.preventDefault();

      // Get the serialized form data
      var formData = $form.serialize();

      // Fix for checkbox fields - add unchecked checkboxes to the data
      var checkboxFields = $form.find('input[type="checkbox"]');
      checkboxFields.each(function () {
        var checkboxName = $(this).attr('name');
        if (!$(this).is(':checked') && !formData.includes(checkboxName)) {
          formData += '&' + checkboxName + '=0';
        }
      });

      // Show loading state
      var $submitBtn = $form.find(':submit');
      $submitBtn.prop('disabled', true);
      $submitBtn.data('original-text', $submitBtn.val());
      $submitBtn.val('Saving...');

      // Send the AJAX request
      (0,_utils_ajax__WEBPACK_IMPORTED_MODULE_4__.ajaxRequest)({
        url: netsuiteSettings.ajax_url,
        type: 'POST',
        data: {
          action: 'save_netsuite_settings',
          nonce: netsuiteSettings.nonce,
          form_data: formData
        }
      }).then(function (response) {
        // Show success message
        if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.showNotice === 'function') {
          ProductEstimatorSettings.showNotice(response.message || 'Settings saved successfully', 'success');
        } else {
          showNotice(response.message || 'Settings saved successfully', 'success');
        }

        // Reset form change state
        if (typeof ProductEstimatorSettings !== 'undefined') {
          ProductEstimatorSettings.formChanged = false;
          if (ProductEstimatorSettings.formChangeTrackers) {
            ProductEstimatorSettings.formChangeTrackers['netsuite'] = false;
          }
        }
      })["catch"](function (error) {
        // Show error message
        if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.showNotice === 'function') {
          ProductEstimatorSettings.showNotice(error.message || 'Error saving settings', 'error');
        } else {
          showNotice(error.message || 'Error saving settings', 'error');
        }
      })["finally"](function () {
        // Reset button
        $submitBtn.prop('disabled', false);
        $submitBtn.val($submitBtn.data('original-text'));
      });
    }

    /**
     * Set up dependent fields based on initial state
     */
  }, {
    key: "setupDependentFields",
    value: function setupDependentFields() {
      // Initial toggle of fields based on enabled state
      this.toggleNetsuiteFields();
      (0,_utils__WEBPACK_IMPORTED_MODULE_3__.log)('NetsuiteSettingsModule', 'Dependent fields setup complete');
    }

    /**
     * Toggle NetSuite fields based on enabled checkbox
     */
  }, {
    key: "toggleNetsuiteFields",
    value: function toggleNetsuiteFields() {
      var $ = jQuery;
      var enabled = $('#netsuite_enabled').is(':checked');
      var $fields = $('#netsuite_client_id, #netsuite_client_secret, #netsuite_api_url, #netsuite_token_url, #netsuite_request_limit, #netsuite_cache_time').closest('tr');
      if (enabled) {
        $fields.fadeIn(200);
        $('#test-netsuite-connection').closest('p').fadeIn(200);
      } else {
        $fields.fadeOut(200);
        $('#test-netsuite-connection').closest('p').fadeOut(200);
      }
      (0,_utils__WEBPACK_IMPORTED_MODULE_3__.log)('NetsuiteSettingsModule', "NetSuite fields toggled: ".concat(enabled ? 'visible' : 'hidden'));
    }

    // Rest of the class remains the same...
  }]);
}(); // Initialize the module
jQuery(document).ready(function () {
  var module = new NetsuiteSettingsModule();

  // Export the module globally for backward compatibility
  window.NetsuiteSettingsModule = module;
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (NetsuiteSettingsModule);

/***/ }),

/***/ "./src/js/admin/modules/NotificationSettingsModule.js":
/*!************************************************************!*\
  !*** ./src/js/admin/modules/NotificationSettingsModule.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/* harmony import */ var _utils_tinymce_preserver__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @utils/tinymce-preserver */ "./src/js/utils/tinymce-preserver.js");


/**
 * Notification Settings JavaScript
 *
 * Handles functionality specific to the notification settings tab.
 */



var NotificationSettingsModule = /*#__PURE__*/function () {
  /**
   * Initialize the module
   */
  function NotificationSettingsModule() {
    var _this = this;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, NotificationSettingsModule);
    // Initialize when document is ready
    jQuery(document).ready(function () {
      return _this.init();
    });
  }

  /**
   * Initialize the module
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(NotificationSettingsModule, [{
    key: "init",
    value: function init() {
      this.mediaFrame = null; // Initialize mediaFrame property here
      this.bindEvents();
      this.setupDependentFields();
      this.setupVerticalTabs();
      this.setupMediaUploader();
    }

    /**
     * Bind event handlers
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var $ = jQuery;

      // Enable/disable toggle for notifications
      $('#enable_notifications').on('change', this.toggleNotificationFields.bind(this));

      // Individual notification type toggles
      $('[id^="notification_"][id$="_enabled"]').on('change', function (e) {
        var $toggle = $(e.currentTarget);
        var notificationType = $toggle.attr('id').replace('notification_', '').replace('_enabled', '');
        this.toggleNotificationTypeFields(notificationType, $toggle.is(':checked'));
      }.bind(this));

      // Image upload buttons
      $('.image-upload-button').on('click', this.handleImageUpload.bind(this));
      $('.image-remove-button').on('click', this.handleImageRemove.bind(this));

      // Email validation
      $('#from_email, #default_designer_email, #default_store_email').on('change', this.validateEmail.bind(this));

      // Listen for tab changes
      $(document).on('product_estimator_tab_changed', this.handleTabChanged.bind(this));

      // Form submission - convert to AJAX
      $('.notification-settings-form').on('submit', this.handleFormSubmit.bind(this));

      // Vertical tabs navigation
      $('.vertical-tabs-nav a').on('click', this.handleVerticalTabClick.bind(this));
    }
  }, {
    key: "setupNotificationEditors",
    value: function setupNotificationEditors() {
      var $ = jQuery;

      // Check if we're on the notifications tab
      if ($('#notifications').length === 0) {
        return;
      }
      console.log('Setting up rich text editors for notifications');
      (0,_utils_tinymce_preserver__WEBPACK_IMPORTED_MODULE_3__.setupTinyMCEHTMLPreservation)(['pdf_footer_text', 'pdf_footer_contact_details_content'], '#general');
    }

    /**
     * Toggle fields for a specific notification type
     * @param {string} notificationType The notification type
     * @param {boolean} enabled Whether this notification type is enabled
     */
  }, {
    key: "toggleNotificationTypeFields",
    value: function toggleNotificationTypeFields(notificationType, enabled) {
      var $ = jQuery;
      var $form = $(".notification-type-form[data-type=\"".concat(notificationType, "\"]"));
      var $fields = $form.find('input, textarea, button').not("#notification_".concat(notificationType, "_enabled")).not('.save-settings'); // Don't disable the save button

      if (enabled) {
        $fields.prop('disabled', false);
      } else {
        $fields.prop('disabled', true);
      }
    }

    /**
     * Set up WordPress media uploader
     */
  }, {
    key: "setupMediaUploader",
    value: function setupMediaUploader() {
      // The mediaFrame property is now initialized in the init method
    }

    /**
     * Validate email field
     * @param {Event} e Change event
     */
  }, {
    key: "validateEmail",
    value: function validateEmail(e) {
      var $ = jQuery;
      var $field = $(e.target);
      var email = $field.val().trim();
      if (email && !_utils__WEBPACK_IMPORTED_MODULE_2__.validation.validateEmail(email)) {
        this.showFieldError($field, notificationSettings.i18n.validationErrorEmail || 'Please enter a valid email address');
        return false;
      }
      this.clearFieldError($field);
      return true;
    }

    /**
     * Show field error message
     * @param {jQuery} $field The field element
     * @param {string} message Error message
     */
  }, {
    key: "showFieldError",
    value: function showFieldError($field, message) {
      if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.showFieldError === 'function') {
        ProductEstimatorSettings.showFieldError($field, message);
      } else {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.clearFieldError)($field);
        var $error = jQuery("<span class=\"field-error\">".concat(message, "</span>"));
        $field.after($error).addClass('error');
      }
    }

    /**
     * Clear field error message
     * @param {jQuery} $field The field element
     */
  }, {
    key: "clearFieldError",
    value: function clearFieldError($field) {
      if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.clearFieldError === 'function') {
        ProductEstimatorSettings.clearFieldError($field);
      } else {
        $field.removeClass('error').next('.field-error').remove();
      }
    }

    /**
     * Set up dependent fields based on initial state
     */
  }, {
    key: "setupDependentFields",
    value: function setupDependentFields() {
      var $ = jQuery;

      // Initial toggle of fields based on enabled state
      this.toggleNotificationFields();

      // Also toggle fields for individual notification types
      $('[id^="notification_"][id$="_enabled"]').each(function (i, el) {
        var $toggle = $(el);
        var notificationType = $toggle.attr('id').replace('notification_', '').replace('_enabled', '');
        this.toggleNotificationTypeFields(notificationType, $toggle.is(':checked'));
      }.bind(this));
    }

    /**
     * Toggle notification fields based on enabled checkbox
     */
  }, {
    key: "toggleNotificationFields",
    value: function toggleNotificationFields() {
      var $ = jQuery;
      var enabled = $('#enable_notifications').is(':checked');
      var $verticalTabsNav = $('.vertical-tabs-nav');
      var $notificationForms = $('.notification-type-form');
      if (enabled) {
        $verticalTabsNav.removeClass('disabled');
        $notificationForms.find('input, textarea, button').not('.save-settings') // Don't touch the save buttons
        .prop('disabled', false);

        // Re-apply individual notification type toggles
        $('[id^="notification_"][id$="_enabled"]').each(function (i, el) {
          var $toggle = $(el);
          var notificationType = $toggle.attr('id').replace('notification_', '').replace('_enabled', '');
          this.toggleNotificationTypeFields(notificationType, $toggle.is(':checked'));
        }.bind(this));
      } else {
        $verticalTabsNav.addClass('disabled');
        $notificationForms.find('input, textarea, button').not('.save-settings') // Don't touch the save buttons
        .prop('disabled', true);
      }
    }

    /**
     * Set up vertical tabs
     */
  }, {
    key: "setupVerticalTabs",
    value: function setupVerticalTabs() {
      var $ = jQuery;

      // First check URL parameters for sub_tab
      var activeTabId = 'notification_general'; // Default to notification_general

      // Check for sub_tab in URL
      var urlParams = new URLSearchParams(window.location.search);
      var subTab = urlParams.get('sub_tab');
      if (subTab && $('.vertical-tabs-nav a[data-tab="' + subTab + '"]').length) {
        activeTabId = subTab;
      }
      // If no valid sub_tab in URL, look for .active class
      else if ($('.vertical-tabs-nav .tab-item.active a').length) {
        activeTabId = $('.vertical-tabs-nav .tab-item.active a').data('tab');
      }

      // Show the active tab
      this.showVerticalTab(activeTabId);

      // Adjust height of the tab content container to match the nav
      this.adjustTabContentHeight();

      // Adjust on window resize
      $(window).on('resize', this.adjustTabContentHeight.bind(this));
    }

    /**
     * Adjust tab content height
     */
  }, {
    key: "adjustTabContentHeight",
    value: function adjustTabContentHeight() {
      var $ = jQuery;
      var navHeight = $('.vertical-tabs-nav').outerHeight();
      $('.vertical-tabs-content').css('min-height', navHeight + 'px');
    }

    /**
     * Handle vertical tab click
     * @param {Event} e Click event
     */
  }, {
    key: "handleVerticalTabClick",
    value: function handleVerticalTabClick(e) {
      e.preventDefault();
      var $ = jQuery;
      var $link = $(e.currentTarget);
      var tabId = $link.data('tab');

      // Update URL hash
      window.history.pushState({}, '', "?page=product-estimator-settings&tab=notifications&sub_tab=".concat(tabId));

      // Show the selected tab
      this.showVerticalTab(tabId);
    }

    /**
     * Show vertical tab
     * @param {string} tabId Tab ID to show
     */
  }, {
    key: "showVerticalTab",
    value: function showVerticalTab(tabId) {
      var $ = jQuery;

      // Update active tab in navigation
      $('.vertical-tabs-nav .tab-item').removeClass('active');
      $(".vertical-tabs-nav a[data-tab=\"".concat(tabId, "\"]")).parent().addClass('active');

      // Show the tab content
      $('.vertical-tab-content').removeClass('active');
      $("#".concat(tabId)).addClass('active');
    }

    /**
     * Handle image upload button click
     * @param {Event} e Click event
     */
  }, {
    key: "handleImageUpload",
    value: function handleImageUpload(e) {
      e.preventDefault();
      var $ = jQuery;
      var button = $(e.currentTarget);
      var fieldId = button.data('field-id');
      var mediaFrameInstance = this.mediaFrame;

      // If the media frame already exists, reopen it
      if (mediaFrameInstance) {
        mediaFrameInstance.open();
        return;
      }

      // Create media frame - ensure wp.media is available (WP admin)
      if (typeof wp !== 'undefined' && wp.media) {
        this.mediaFrame = wp.media({
          title: notificationSettings.i18n.selectImage || 'Select Image',
          button: {
            text: notificationSettings.i18n.useThisImage || 'Use this image'
          },
          multiple: false,
          library: {
            type: 'image'
          }
        });

        // Handle selection
        this.mediaFrame.on('select', function () {
          var attachment = this.mediaFrame.state().get('selection').first().toJSON();

          // Set hidden input value
          $("#".concat(fieldId)).val(attachment.id).trigger('change');

          // Update image preview
          var $previewWrapper = button.closest('td').find('.image-preview-wrapper');
          $previewWrapper.html("<img src=\"".concat(attachment.sizes.medium ? attachment.sizes.medium.url : attachment.url, "\" alt=\"\" style=\"max-width:200px;max-height:100px;display:block;margin-bottom:10px;\" />"));

          // Show remove button
          button.closest('td').find('.image-remove-button').removeClass('hidden');
        }.bind(this));

        // Open media frame
        this.mediaFrame.open();
      } else {
        console.error('WordPress Media Library not available');
      }
    }

    /**
     * Handle image remove button click
     * @param {Event} e Click event
     */
  }, {
    key: "handleImageRemove",
    value: function handleImageRemove(e) {
      e.preventDefault();
      var $ = jQuery;
      var button = $(e.currentTarget);
      var fieldId = button.data('field-id');

      // Clear hidden input value
      $("#".concat(fieldId)).val('').trigger('change');

      // Clear image preview
      button.closest('td').find('.image-preview-wrapper').empty();

      // Hide remove button
      button.addClass('hidden');
    }

    /**
     * Handle tab changed event
     * @param {Event} e Tab changed event
     * @param {string} tabId The newly active tab ID
     */
  }, {
    key: "handleTabChanged",
    value: function handleTabChanged(e, tabId) {
      // If our tab becomes active, refresh dependent fields
      if (tabId === notificationSettings.tab_id) {
        this.toggleNotificationFields();
        this.setupVerticalTabs();
        this.setupNotificationEditors();
      }
    }

    /**
     * Handle form submission
     * @param {Event} e Submit event
     */
  }, {
    key: "handleFormSubmit",
    value: function handleFormSubmit(e) {
      e.preventDefault();
      var $ = jQuery;
      var $form = $(e.currentTarget);
      var formData = $form.serialize();
      var type = $form.data('type') || 'notification_general';

      // Show loading state
      var $submitButton = $form.find('.save-settings');
      var $spinner = $form.find('.spinner');
      $submitButton.prop('disabled', true);
      $spinner.addClass('is-active');

      // Ensure TinyMCE editors are saved
      if (typeof tinyMCE !== 'undefined') {
        var activeEditors = tinyMCE.editors;
        for (var i = 0; i < activeEditors.length; i++) {
          activeEditors[i].save();
        }
      }

      // Ensure unchecked checkboxes are properly represented
      // This helps ensure all checkboxes are submitted even when unchecked
      var formDataStr = formData;
      var checkboxFields = $form.find('input[type="checkbox"]');
      checkboxFields.each(function () {
        if (!$(this).is(':checked') && !formDataStr.includes($(this).attr('name'))) {
          formDataStr += '&' + $(this).attr('name') + '=0';
        }
      });

      // Submit the form via AJAX using our ajax utility
      _utils__WEBPACK_IMPORTED_MODULE_2__.ajax.ajaxRequest({
        url: productEstimatorSettings.ajax_url,
        type: 'POST',
        data: {
          action: 'save_notifications_settings',
          nonce: productEstimatorSettings.nonce,
          form_data: formDataStr,
          notification_type: type
        }
      }).then(function (response) {
        // Show success message using our showNotice utility
        if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.showNotice === 'function') {
          ProductEstimatorSettings.showNotice(response.message || notificationSettings.i18n.saveSuccess, 'success');
        } else {
          (0,_utils__WEBPACK_IMPORTED_MODULE_2__.showNotice)(response.message || notificationSettings.i18n.saveSuccess, 'success');
        }
      })["catch"](function (error) {
        // Show error message using our showNotice utility
        if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.showNotice === 'function') {
          ProductEstimatorSettings.showNotice(error.message || notificationSettings.i18n.saveError, 'error');
        } else {
          (0,_utils__WEBPACK_IMPORTED_MODULE_2__.showNotice)(error.message || notificationSettings.i18n.saveError, 'error');
        }
      })["finally"](function () {
        // Reset form state
        $submitButton.prop('disabled', false);
        $spinner.removeClass('is-active');
      });
    }
  }]);
}(); // Initialize the module
jQuery(document).ready(function () {
  var module = new NotificationSettingsModule();

  // Export the module globally for backward compatibility
  window.NotificationSettingsModule = module;
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (NotificationSettingsModule);

/***/ }),

/***/ "./src/js/admin/modules/PricingRulesSettingsModule.js":
/*!************************************************************!*\
  !*** ./src/js/admin/modules/PricingRulesSettingsModule.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");


/**
 * Pricing Rules Settings JavaScript
 *
 * Handles functionality specific to the pricing rules settings tab.
 */

var PricingRulesSettingsModule = /*#__PURE__*/function () {
  /**
   * Initialize the module
   */
  function PricingRulesSettingsModule() {
    var _this = this;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, PricingRulesSettingsModule);
    // Access localized data with a fallback mechanism
    var settingsData = window.pricingRulesSettings || {};

    // Create a safe reference to the settings object
    this.settings = {
      ajaxUrl: settingsData.ajax_url || (typeof ajaxurl !== 'undefined' ? ajaxurl : '/wp-admin/admin-ajax.php'),
      nonce: settingsData.nonce || '',
      i18n: settingsData.i18n || {},
      tab_id: settingsData.tab_id || 'pricing_rules'
    };

    // Initialize when document is ready
    jQuery(document).ready(function () {
      return _this.init();
    });
  }

  /**
   * Initialize the module
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(PricingRulesSettingsModule, [{
    key: "init",
    value: function init() {
      (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('PricingRulesSettingsModule', 'Initializing Pricing Rules Settings Module');
      this.bindEvents();
      this.setupFormHandling();
      this.initializeDefaultSettingsForm();
    }

    /**
     * Bind event handlers
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var $ = jQuery;

      // Listen for tab changes
      $(document).on('product_estimator_tab_changed', this.handleTabChanged.bind(this));

      // Tab-specific handlers
      this.initRuleHandlers();
    }

    /**
     * Initialize default settings form
     */
  }, {
    key: "initializeDefaultSettingsForm",
    value: function initializeDefaultSettingsForm() {
      var $ = jQuery;

      // Initialize default settings form with the main settings framework
      $('.default-pricing-form').on('submit', function (e) {
        e.preventDefault();

        // Use the main settings framework to save the settings
        if (typeof ProductEstimatorSettings !== 'undefined') {
          // Set the formChanged flag to trigger a save
          ProductEstimatorSettings.formChanged = true;

          // Submit the form using the main settings AJAX handler
          ProductEstimatorSettings.handleAjaxFormSubmit(e);
        }
      });
    }

    /**
     * Set up event handlers for the rule management UI
     */
  }, {
    key: "initRuleHandlers",
    value: function initRuleHandlers() {
      var $ = jQuery;
      var $container = $('.product-estimator-pricing-rules');
      var $form = $('#pricing-rule-form');
      var $formContainer = $('.pricing-rules-form');
      var $addButton = $('.add-new-rule');

      // Initialize Select2 for multiple selection
      $('#categories').select2({
        placeholder: 'Select categories',
        width: '100%',
        dropdownCssClass: 'product-estimator-dropdown'
      });

      // Show form when "Add New Pricing Rule" button is clicked
      $addButton.on('click', function () {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('PricingRulesSettingsModule', 'Add New Pricing Rule button clicked');
        this.resetForm();
        $('.form-title').text(this.settings.i18n.addNew || 'Add New Pricing Rule');
        $('.save-rule').text(this.settings.i18n.saveChanges || 'Save Changes');
        $formContainer.slideDown();
      }.bind(this));

      // Hide form when "Cancel" button is clicked
      $('.cancel-form').on('click', function () {
        $formContainer.slideUp();
        this.resetForm();
      }.bind(this));

      // Handle form submission
      $form.on('submit', this.handleFormSubmission.bind(this));

      // Handle edit/delete rules via event delegation
      $('.pricing-rules-list').on('click', '.edit-rule', this.handleEditRule.bind(this));
      $('.pricing-rules-list').on('click', '.delete-rule', this.handleDeleteRule.bind(this));
    }

    /**
     * Set up form handling
     */
  }, {
    key: "setupFormHandling",
    value: function setupFormHandling() {
      // Any additional setup for the form
    }

    /**
     * Handle tab changed event
     * @param {Event} e Tab changed event
     * @param {string} tabId The newly active tab ID
     */
  }, {
    key: "handleTabChanged",
    value: function handleTabChanged(e, tabId) {
      // If our tab becomes active, refresh initialization
      if (tabId === this.settings.tab_id) {
        this.init();
      }
    }

    /**
     * Reset the form to its initial state
     */
  }, {
    key: "resetForm",
    value: function resetForm() {
      var $ = jQuery;
      var $form = $('#pricing-rule-form');
      $form[0].reset();
      $('#rule_id').val('');

      // Reset Select2 fields
      $('#categories').val(null).trigger('change');
    }

    /**
     * Toggle form state (enable/disable inputs)
     * @param {boolean} enabled Whether to enable the form inputs
     */
  }, {
    key: "toggleFormState",
    value: function toggleFormState(enabled) {
      var $ = jQuery;
      var $form = $('#pricing-rule-form');
      var $submitBtn = $form.find('.save-rule');
      var $cancelBtn = $form.find('.cancel-form');
      $form.find('input, select').prop('disabled', !enabled);
      $submitBtn.prop('disabled', !enabled);
      $cancelBtn.prop('disabled', !enabled);
      if (!enabled) {
        $submitBtn.text('Saving...');
      } else {
        $submitBtn.text($('#rule_id').val() ? 'Update Pricing Rule' : 'Save Pricing Rule');
      }

      // Special handling for Select2
      if (enabled) {
        $('#categories').prop('disabled', false).trigger('change');
      } else {
        $('#categories').prop('disabled', true).trigger('change');
      }
    }

    /**
     * Handle form submission
     * @param {Event} e Form submit event
     */
  }, {
    key: "handleFormSubmission",
    value: function handleFormSubmission(e) {
      var _this2 = this;
      e.preventDefault();
      var $ = jQuery;
      var categories = $('#categories').val();
      var pricingMethod = $('#pricing_method').val();
      var pricingSource = $('#pricing_source').val();

      // Validate form
      if (!categories || categories.length === 0) {
        alert(this.settings.i18n.selectCategories || 'Please select at least one category');
        return;
      }
      if (!pricingMethod) {
        alert(this.settings.i18n.selectPricingMethod || 'Please select a pricing method');
        return;
      }
      if (!pricingSource) {
        alert(this.settings.i18n.selectPricingSource || 'Please select a pricing source');
        return;
      }

      // Disable form while submitting
      this.toggleFormState(false);
      var formData = {
        action: 'save_pricing_rule',
        nonce: this.settings.nonce,
        rule_id: $('#rule_id').val(),
        categories: categories,
        pricing_method: pricingMethod,
        pricing_source: pricingSource
      };
      (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('PricingRulesSettingsModule', 'Sending form data:', formData);

      // Send AJAX request using the ajax utility
      _utils__WEBPACK_IMPORTED_MODULE_2__.ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: formData
      }).then(function (data) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('PricingRulesSettingsModule', 'Response received:', data);

        // Show success message
        _this2.showMessage('success', data.message);

        // If editing an existing rule, replace the row
        if (formData.rule_id) {
          (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('PricingRulesSettingsModule', 'Updating existing rule:', formData.rule_id);
          var $existingRow = $('.pricing-rules-list').find("tr[data-id=\"".concat(formData.rule_id, "\"]"));
          if ($existingRow.length) {
            $existingRow.replaceWith(_this2.createRuleRow(data.rule));
          } else {
            // If the row doesn't exist (unlikely), append it
            _this2.appendRuleRow(data.rule);
          }
        } else {
          // For new rules, append the row
          _this2.appendRuleRow(data.rule);
        }

        // Hide the form and reset it
        $('.pricing-rules-form').slideUp();
        _this2.resetForm();

        // If this is the first rule, remove the "no items" message and create the table
        var $noItems = $('.pricing-rules-list').find('.no-items');
        if ($noItems.length) {
          $noItems.remove();

          // Create the table if it doesn't exist
          if (!$('.pricing-rules-list').find('table').length) {
            var tableHtml = "\n              <table class=\"wp-list-table widefat fixed striped pricing-rules-table\">\n                <thead>\n                  <tr>\n                    <th scope=\"col\">".concat('Categories', "</th>\n                    <th scope=\"col\">", 'Pricing Method', "</th>\n                    <th scope=\"col\">", 'Actions', "</th>\n                  </tr>\n                </thead>\n                <tbody></tbody>\n              </table>\n            ");
            $('.pricing-rules-list').find('h3').after(tableHtml);
          }
        }
      })["catch"](function (error) {
        // Show error message
        _this2.showMessage('error', error.message || 'Error saving pricing rule. Please try again.');
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('PricingRulesSettingsModule', 'Error saving pricing rule:', error);
      })["finally"](function () {
        // Re-enable form
        _this2.toggleFormState(true);
      });
    }

    /**
     * Handle edit rule button click
     * @param {Event} e Click event
     */
  }, {
    key: "handleEditRule",
    value: function handleEditRule(e) {
      var $ = jQuery;
      var $btn = $(e.currentTarget);
      var ruleId = $btn.data('id');
      var categories = String($btn.data('categories')).split(',');
      var pricingMethod = $btn.data('method');
      var pricingSource = $btn.data('source');
      (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('PricingRulesSettingsModule', 'Edit rule:', ruleId, categories, pricingMethod, pricingSource);

      // Reset form
      this.resetForm();

      // Populate form with existing data
      $('#rule_id').val(ruleId);
      $('#pricing_method').val(pricingMethod);
      $('#pricing_source').val(pricingSource);

      // Need to make sure Select2 has initialized
      setTimeout(function () {
        $('#categories').val(categories).trigger('change');
      }, 100);

      // Update form title and button text
      $('.form-title').text('Edit Pricing Rule');
      $('.save-rule').text('Update Pricing Rule');

      // Show form
      $('.pricing-rules-form').slideDown();

      // Scroll to form
      $('html, body').animate({
        scrollTop: $('.pricing-rules-form').offset().top - 50
      }, 300);
    }

    /**
     * Handle delete rule button click
     * @param {Event} e Click event
     */
  }, {
    key: "handleDeleteRule",
    value: function handleDeleteRule(e) {
      var _this3 = this;
      var $ = jQuery;
      var $btn = $(e.currentTarget);
      var ruleId = $btn.data('id');
      (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('PricingRulesSettingsModule', 'Delete rule:', ruleId);
      if (!confirm(this.settings.i18n.confirmDelete || 'Are you sure you want to delete this pricing rule?')) {
        return;
      }

      // Disable button while processing
      $btn.prop('disabled', true).text('Deleting...');

      // Use ajax utility for the request
      _utils__WEBPACK_IMPORTED_MODULE_2__.ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: {
          action: 'delete_pricing_rule',
          nonce: this.settings.nonce,
          rule_id: ruleId
        }
      }).then(function (data) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('PricingRulesSettingsModule', 'Delete response:', data);

        // Remove row from table
        var $row = $btn.closest('tr');
        $row.fadeOut(300, function () {
          $row.remove();

          // If no more rows, show "no items" message
          if (!$('.pricing-rules-list').find('tbody tr').length) {
            $('.pricing-rules-list').find('table').remove();
            $('.pricing-rules-list').append('<div class="no-items">No pricing rules have been created yet.</div>');
          }
        });

        // Show success message
        _this3.showMessage('success', data.message);
      })["catch"](function (error) {
        // Show error message
        _this3.showMessage('error', error.message || 'Error deleting pricing rule. Please try again.');
        $btn.prop('disabled', false).text('Delete');
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('PricingRulesSettingsModule', 'Error deleting rule:', error);
      });
    }

    /**
     * Create a table row for a rule
     * @param {Object} rule The rule data
     * @return {jQuery} The created row
     */
  }, {
    key: "createRuleRow",
    value: function createRuleRow(rule) {
      var $ = jQuery;
      var $row = $('<tr></tr>').attr('data-id', rule.id);
      $row.append($('<td></td>').text(rule.category_names));
      $row.append($('<td></td>').text(rule.pricing_label));
      var $actionsCell = $('<td></td>').addClass('actions');

      // Use dom utility to create buttons
      var editBtn = _utils__WEBPACK_IMPORTED_MODULE_2__.dom.createElement('button', {
        className: 'button button-small edit-rule',
        type: 'button',
        dataset: {
          id: rule.id,
          categories: Array.isArray(rule.categories) ? rule.categories.join(',') : '',
          method: rule.pricing_method,
          source: rule.pricing_source
        }
      }, 'Edit');
      var deleteBtn = _utils__WEBPACK_IMPORTED_MODULE_2__.dom.createElement('button', {
        className: 'button button-small delete-rule',
        type: 'button',
        dataset: {
          id: rule.id
        }
      }, 'Delete');

      // Convert DOM elements to jQuery and append
      $actionsCell.append($(editBtn), ' ', $(deleteBtn));
      $row.append($actionsCell);
      return $row;
    }

    /**
     * Append a rule row to the table
     * @param {Object} rule The rule data
     */
  }, {
    key: "appendRuleRow",
    value: function appendRuleRow(rule) {
      var $ = jQuery;
      var $table = $('.pricing-rules-table');
      var $tbody = $table.find('tbody');
      var $row = this.createRuleRow(rule);
      $tbody.append($row);
    }

    /**
     * Show a notice message
     * @param {string} type The notice type ('success' or 'error')
     * @param {string} message The message to display
     */
  }, {
    key: "showMessage",
    value: function showMessage(type, message) {
      var $ = jQuery;
      var $container = $('.product-estimator-pricing-rules');
      var $existingNotice = $container.find('.notice');

      // Remove existing notices
      if ($existingNotice.length) {
        $existingNotice.remove();
      }

      // Use validation.showNotice if we're in a context where we can use it directly
      if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.showNotice === 'function') {
        ProductEstimatorSettings.showNotice(message, type);
        return;
      }

      // Otherwise create our own notice
      // Use dom utility to create the notice element
      var notice = _utils__WEBPACK_IMPORTED_MODULE_2__.dom.createElement('div', {
        className: "notice notice-".concat(type === 'success' ? 'success' : 'error')
      });
      var paragraph = _utils__WEBPACK_IMPORTED_MODULE_2__.dom.createElement('p', {}, message);
      notice.appendChild(paragraph);

      // Insert notice after heading
      $container.find('h1, h3').first().after($(notice));

      // Auto-remove after 5 seconds
      setTimeout(function () {
        $(notice).fadeOut(500, function () {
          $(this).remove();
        });
      }, 5000);
    }
  }]);
}(); // Initialize when document is ready
jQuery(document).ready(function () {
  // Only initialize if we're on the correct tab
  var currentTab = jQuery('#pricing_rules');
  if (currentTab.length && currentTab.is(':visible')) {
    var module = new PricingRulesSettingsModule();
    window.PricingRulesSettingsModule = module;
  } else {
    // Listen for tab change events to initialize when our tab becomes visible
    jQuery(document).on('product_estimator_tab_changed', function (e, tabId) {
      if (tabId === 'pricing_rules') {
        setTimeout(function () {
          var module = new PricingRulesSettingsModule();
          window.PricingRulesSettingsModule = module;
        }, 100);
      }
    });
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PricingRulesSettingsModule);

/***/ }),

/***/ "./src/js/admin/modules/ProductAdditionsSettingsModule.js":
/*!****************************************************************!*\
  !*** ./src/js/admin/modules/ProductAdditionsSettingsModule.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");


/**
 * Product Additions Settings JavaScript
 *
 * Handles functionality specific to the product additions settings tab.
 */

var ProductAdditionsSettingsModule = /*#__PURE__*/function () {
  /**
   * Initialize the module
   */
  function ProductAdditionsSettingsModule() {
    var _this = this;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, ProductAdditionsSettingsModule);
    // Access localized data with a fallback mechanism
    var adminSettings = window.productAdditionsSettings || {};

    // Create a safe reference to the settings object
    this.settings = {
      ajaxUrl: adminSettings.ajax_url || (typeof ajaxurl !== 'undefined' ? ajaxurl : '/wp-admin/admin-ajax.php'),
      nonce: adminSettings.nonce || '',
      i18n: adminSettings.i18n || {},
      tab_id: adminSettings.tab_id || 'product_additions'
    };

    // Add a variable to track if the form has been modified
    this.formModified = false;

    // Initialize when document is ready
    jQuery(document).ready(function () {
      return _this.init();
    });
  }

  /**
   * Initialize the module
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(ProductAdditionsSettingsModule, [{
    key: "init",
    value: function init() {
      (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductAdditionsSettingsModule', 'Initializing Product Additions Settings Module');
      // Reset form modified state on initialization
      this.formModified = false;
      this.bindEvents();
      this.setupFormHandling();
    }

    /**
     * Bind event handlers
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this2 = this;
      var $ = jQuery;

      // Listen for tab changes
      $(document).on('product_estimator_tab_changed', this.handleTabChanged.bind(this));

      // Tab-specific handlers
      this.initRelationshipHandlers();

      // Track form changes
      $('#product-addition-form').on('change input', 'input, select, textarea', function () {
        _this2.formModified = true;

        // Update the global form change tracker if available
        if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.formChangeTrackers !== 'undefined') {
          ProductEstimatorSettings.formChangeTrackers[_this2.settings.tab_id] = true;

          // If this is the current tab, update the main formChanged flag
          if (ProductEstimatorSettings.currentTab === _this2.settings.tab_id) {
            ProductEstimatorSettings.formChanged = true;
          }
        }
      });
    }

    /**
     * Set up event handlers for the relationship management UI
     */
  }, {
    key: "initRelationshipHandlers",
    value: function initRelationshipHandlers() {
      var $ = jQuery;
      var $container = $('.product-estimator-additions');
      var $form = $('#product-addition-form');
      var $formContainer = $('.product-additions-form');
      var $addButton = $('.add-new-relation');
      var $relationTypeSelect = $('#relation_type');
      var $targetCategoryRow = $('.target-category-row');
      var $targetCategorySelect = $('#target_category');
      var $productSearchRow = $('.product-search-row');
      var $noteRow = $('.note-row');

      // Initialize Select2 for multiple selection
      $('#source_category').select2({
        placeholder: 'Select source categories',
        width: '100%',
        dropdownCssClass: 'product-estimator-dropdown'
      });
      $('#target_category').select2({
        placeholder: 'Select a category',
        width: '100%',
        allowClear: true,
        dropdownCssClass: 'product-estimator-dropdown'
      });

      // Show form when "Add New Relationship" button is clicked
      $addButton.on('click', function () {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductAdditionsSettingsModule', 'Add New Relationship button clicked');
        this.resetForm();
        $('.form-title').text(this.settings.i18n.addNew || 'Add New Relationship');
        $('.save-relation').text(this.settings.i18n.saveChanges || 'Save Changes');
        $formContainer.slideDown();
      }.bind(this));

      // Hide form when "Cancel" button is clicked
      $('.cancel-form').on('click', function () {
        $formContainer.slideUp();
        this.resetForm();
      }.bind(this));

      // Handle action type change
      $relationTypeSelect.on('change', function () {
        var actionType = $(this).val();

        // Reset dependent fields
        $targetCategorySelect.val('').trigger('change');
        $productSearchRow.hide();
        $('#selected-product').hide();
        $('#selected_product_id').val('');
        $noteRow.hide();
        $('#note_text').val('');
        if (actionType === 'auto_add_by_category') {
          $targetCategoryRow.show();
          $noteRow.hide();
        } else if (actionType === 'auto_add_note_by_category') {
          $targetCategoryRow.hide();
          $noteRow.show();
        } else if (actionType === 'suggest_products_by_category') {
          // For suggestion type, we only need the target category
          $targetCategoryRow.show();
          $noteRow.hide();
          $productSearchRow.hide();
        } else {
          $targetCategoryRow.hide();
          $noteRow.hide();
        }
      });

      // Handle target category change
      $targetCategorySelect.on('change', function () {
        var categoryId = $(this).val();
        var actionType = $relationTypeSelect.val();

        // Reset product search
        $('#product_search').val('');
        $('#product-search-results').empty();
        $('#selected-product').hide();
        $('#selected_product_id').val('');
        if (categoryId && actionType === 'auto_add_by_category') {
          $productSearchRow.show();
        } else {
          $productSearchRow.hide();
        }
      });

      // Handle product search
      var searchTimeout;
      $('#product_search').on('keyup', function (e) {
        var _this3 = this;
        // Use the event target instead of 'this' to ensure correct reference
        var searchTerm = $(e.target).val() || '';
        var categoryId = $targetCategorySelect.val();
        clearTimeout(searchTimeout);
        if (searchTerm.length < 3) {
          $('#product-search-results').empty();
          return;
        }
        searchTimeout = setTimeout(function () {
          // Use the correctly bound function for searchProducts
          _this3.searchProducts(searchTerm, categoryId);
        }, 500);
      }.bind(this));

      // Handle clear product button
      $('.clear-product').on('click', function () {
        $('#selected_product_id').val('');
        $('.selected-product-info').empty();
        $('#selected-product').hide();
      });

      // Handle form submission
      $form.on('submit', this.handleFormSubmission.bind(this));

      // Handle edit/delete relations via event delegation
      $('.product-additions-list').on('click', '.edit-relation', this.handleEditRelation.bind(this));
      $('.product-additions-list').on('click', '.delete-relation', this.handleDeleteRelation.bind(this));
    }

    /**
     * Set up form handling
     */
  }, {
    key: "setupFormHandling",
    value: function setupFormHandling() {
      var $ = jQuery;

      // Add event delegation for the dynamic product results
      $(document).on('click', '.product-result-item', function (e) {
        var productId = $(e.currentTarget).data('id');
        var productName = $(e.currentTarget).data('name');
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductAdditionsSettingsModule', 'Product selected:', productId, productName);

        // Set the selected product
        $('#selected_product_id').val(productId);
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductAdditionsSettingsModule', 'Product ID set to:', $('#selected_product_id').val());
        $('.selected-product-info').html("<strong>".concat(productName, "</strong> (ID: ").concat(productId, ")"));
        $('#selected-product').show();

        // Clear search
        $('#product_search').val('');
        $('#product-search-results').empty();
      });
    }

    /**
     * Handle tab changed event
     * @param {Event} e Tab changed event
     * @param {string} tabId The newly active tab ID
     */
  }, {
    key: "handleTabChanged",
    value: function handleTabChanged(e, tabId) {
      // If our tab becomes active, refresh initialization
      if (tabId === this.settings.tab_id) {
        this.formModified = false; // Reset form modified state
        this.init();

        // Update the global form change tracker if available
        if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.formChangeTrackers !== 'undefined') {
          ProductEstimatorSettings.formChangeTrackers[this.settings.tab_id] = false;

          // If this is the current tab, update the main formChanged flag
          if (ProductEstimatorSettings.currentTab === this.settings.tab_id) {
            ProductEstimatorSettings.formChanged = false;
          }
        }
      }
    }

    /**
     * Reset the form to its initial state
     */
  }, {
    key: "resetForm",
    value: function resetForm() {
      var $ = jQuery;
      var $form = $('#product-addition-form');
      $form[0].reset();
      $('#relation_id').val('');
      $('#selected_product_id').val('');

      // Reset Select2 fields
      $('#source_category').val(null).trigger('change');
      $('#target_category').val(null).trigger('change');

      // Reset dependent fields
      $('#relation_type').val('').trigger('change');
      $('.target-category-row').hide();
      $('.product-search-row').hide();
      $('#selected-product').hide();
      $('#product-search-results').empty();
      $('.note-row').hide();

      // Reset form modified state
      this.formModified = false;

      // Update the global form change tracker if available
      if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.formChangeTrackers !== 'undefined') {
        ProductEstimatorSettings.formChangeTrackers[this.settings.tab_id] = false;

        // If this is the current tab, update the main formChanged flag
        if (ProductEstimatorSettings.currentTab === this.settings.tab_id) {
          ProductEstimatorSettings.formChanged = false;
        }
      }
    }

    /**
     * Toggle form state (enable/disable inputs)
     * @param {boolean} enabled Whether to enable the form inputs
     */
  }, {
    key: "toggleFormState",
    value: function toggleFormState(enabled) {
      var $ = jQuery;
      var $form = $('#product-addition-form');
      var $submitBtn = $form.find('.save-relation');
      var $cancelBtn = $form.find('.cancel-form');
      $form.find('input, select, textarea').prop('disabled', !enabled);
      $submitBtn.prop('disabled', !enabled);
      $cancelBtn.prop('disabled', !enabled);
      if (!enabled) {
        $submitBtn.text('Saving...');
      } else {
        $submitBtn.text($('#relation_id').val() ? 'Update Relationship' : 'Save Relationship');
      }

      // Special handling for Select2
      if (enabled) {
        $('#source_category').prop('disabled', false).trigger('change');
        $('#target_category').prop('disabled', false).trigger('change');
      } else {
        $('#source_category').prop('disabled', true).trigger('change');
        $('#target_category').prop('disabled', true).trigger('change');
      }
    }

    /**
     * Handle form submission
     * @param {Event} e Form submit event
     */
  }, {
    key: "handleFormSubmission",
    value: function handleFormSubmission(e) {
      var _this4 = this;
      e.preventDefault();
      var $ = jQuery;
      var actionType = $('#relation_type').val();
      var sourceCategories = $('#source_category').val();
      var productId = $('#selected_product_id').val();
      var noteText = $('#note_text').val();

      // Validate form
      if (!actionType) {
        alert(this.settings.i18n.selectAction || 'Please select an action type');
        return;
      }
      if (!sourceCategories || sourceCategories.length === 0) {
        alert(this.settings.i18n.selectSourceCategories || 'Please select at least one source category');
        return;
      }
      if (actionType === 'auto_add_by_category') {
        var targetCategory = $('#target_category').val();
        if (!targetCategory) {
          alert(this.settings.i18n.selectTargetCategory || 'Please select a target category');
          return;
        }
        if (!productId) {
          alert(this.settings.i18n.selectProduct || 'Please select a product');
          return;
        }
      } else if (actionType === 'suggest_products_by_category') {
        var _targetCategory = $('#target_category').val();
        if (!_targetCategory) {
          alert(this.settings.i18n.selectTargetCategory || 'Please select a target category');
          return;
        }
      } else if (actionType === 'auto_add_note_by_category') {
        if (!noteText) {
          alert('Please enter a note text');
          return;
        }
      }

      // Disable form while submitting
      this.toggleFormState(false);
      var formData = {
        action: 'save_category_relation',
        nonce: this.settings.nonce,
        relation_id: $('#relation_id').val(),
        relation_type: actionType,
        source_category: sourceCategories,
        target_category: $('#target_category').val(),
        product_id: productId,
        note_text: noteText
      };
      (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductAdditionsSettingsModule', 'Sending form data:', formData);

      // Send AJAX request using ajax utility
      _utils__WEBPACK_IMPORTED_MODULE_2__.ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: formData
      }).then(function (response) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductAdditionsSettingsModule', 'Response received:', response);

        // Show success message
        _this4.showMessage('success', response.message);

        // If editing an existing relation, replace the row
        if (formData.relation_id) {
          (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductAdditionsSettingsModule', 'Updating existing relation:', formData.relation_id);
          var $existingRow = $('.product-additions-list').find("tr[data-id=\"".concat(formData.relation_id, "\"]"));
          if ($existingRow.length) {
            $existingRow.replaceWith(_this4.createRelationRow(response.relation));
          } else {
            // If the row doesn't exist (unlikely), append it
            _this4.appendRelationRow(response.relation);
          }
        } else {
          // For new relations, append the row
          _this4.appendRelationRow(response.relation);
        }

        // Hide the form and reset it
        $('.product-additions-form').slideUp();
        _this4.resetForm();

        // If this is the first relation, remove the "no items" message and create the table
        var $noItems = $('.product-additions-list').find('.no-items');
        if ($noItems.length) {
          $noItems.remove();

          // Create the table if it doesn't exist
          if (!$('.product-additions-list').find('table').length) {
            var tableHtml = "\n              <table class=\"wp-list-table widefat fixed striped product-additions-table\">\n                <thead>\n                  <tr>\n                    <th scope=\"col\">".concat('Source Categories', "</th>\n                    <th scope=\"col\">", 'Action', "</th>\n                    <th scope=\"col\">", 'Target/Note', "</th>\n                    <th scope=\"col\">", 'Actions', "</th>\n                  </tr>\n                </thead>\n                <tbody></tbody>\n              </table>\n            ");
            $('.product-additions-list').find('h3').after(tableHtml);
          }
        }

        // Reset form modified state
        _this4.formModified = false;

        // Update the global form change tracker if available
        if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.formChangeTrackers !== 'undefined') {
          ProductEstimatorSettings.formChangeTrackers[_this4.settings.tab_id] = false;

          // If this is the current tab, update the main formChanged flag
          if (ProductEstimatorSettings.currentTab === _this4.settings.tab_id) {
            ProductEstimatorSettings.formChanged = false;
          }
        }
      })["catch"](function (error) {
        // Show error message
        _this4.showMessage('error', error.message || 'Error saving relationship. Please try again.');
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductAdditionsSettingsModule', 'Error saving relationship:', error);
      })["finally"](function () {
        // Re-enable form
        _this4.toggleFormState(true);
      });
    }

    /**
     * Handle edit relation button click
     * @param {Event} e Click event
     */
  }, {
    key: "handleEditRelation",
    value: function handleEditRelation(e) {
      var $ = jQuery;
      var $btn = $(e.currentTarget);
      var relationId = $btn.data('id');
      var sourceCategories = String($btn.data('source') || '').split(',');
      var targetCategory = $btn.data('target');
      var relationType = $btn.data('type');
      var productId = $btn.data('product-id');
      var noteText = $btn.data('note-text');
      (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductAdditionsSettingsModule', 'Edit relation:', relationId, sourceCategories, targetCategory, relationType, productId, noteText);

      // Reset form
      this.resetForm();

      // Populate form with existing data
      $('#relation_id').val(relationId);
      $('#relation_type').val(relationType).trigger('change');

      // Need to make sure Select2 has initialized
      setTimeout(function () {
        $('#source_category').val(sourceCategories).trigger('change');

        // If it's auto_add_by_category, set target category and load product
        if (relationType === 'auto_add_by_category' && targetCategory) {
          $('#target_category').val(targetCategory).trigger('change');

          // If we have a product ID, load its details
          if (productId) {
            this.loadProductDetails(productId);
          }
        } else if (relationType === 'suggest_products_by_category' && targetCategory) {
          // For suggest products, we just need the target category
          $('#target_category').val(targetCategory).trigger('change');
        } else if (relationType === 'auto_add_note_by_category' && noteText) {
          // Set the note text
          $('#note_text').val(noteText);
        }
      }.bind(this), 100);

      // Update form title and button text
      $('.form-title').text('Edit Category Relationship');
      $('.save-relation').text('Update Relationship');

      // Show form
      $('.product-additions-form').slideDown();

      // Scroll to form
      $('html, body').animate({
        scrollTop: $('.product-additions-form').offset().top - 50
      }, 300);
    }

    /**
     * Handle delete relation button click
     * @param {Event} e Click event
     */
  }, {
    key: "handleDeleteRelation",
    value: function handleDeleteRelation(e) {
      var _this5 = this;
      var $ = jQuery;
      var $btn = $(e.currentTarget);
      var relationId = $btn.data('id');
      (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductAdditionsSettingsModule', 'Delete relation:', relationId);
      if (!confirm(this.settings.i18n.confirmDelete || 'Are you sure you want to delete this relationship?')) {
        return;
      }

      // Disable button while processing
      $btn.prop('disabled', true).text('Deleting...');

      // Use ajax utility for the request
      _utils__WEBPACK_IMPORTED_MODULE_2__.ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: {
          action: 'delete_category_relation',
          nonce: this.settings.nonce,
          relation_id: relationId
        }
      }).then(function (response) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductAdditionsSettingsModule', 'Delete response:', response);

        // Remove row from table
        var $row = $btn.closest('tr');
        $row.fadeOut(300, function () {
          $row.remove();

          // If no more rows, show "no items" message
          if (!$('.product-additions-list').find('tbody tr').length) {
            $('.product-additions-list').find('table').remove();
            $('.product-additions-list').append('<div class="no-items">No relationships have been created yet.</div>');
          }
        });

        // Show success message
        _this5.showMessage('success', response.message);
      })["catch"](function (error) {
        // Show error message
        _this5.showMessage('error', error.message || 'Error deleting relationship. Please try again.');
        $btn.prop('disabled', false).text('Delete');
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductAdditionsSettingsModule', 'Error deleting relationship:', error);
      });
    }

    /**
     * Search products based on search term and category
     * @param {string} searchTerm Search term
     * @param {number} categoryId Category ID
     */
  }, {
    key: "searchProducts",
    value: function searchProducts(searchTerm, categoryId) {
      var $ = jQuery;
      if (!searchTerm || !categoryId) {
        $('#product-search-results').html('<p>Please enter search term and select a category</p>');
        return;
      }
      $('#product-search-results').html('<p>Searching...</p>');

      // Use ajax utility for the search request
      _utils__WEBPACK_IMPORTED_MODULE_2__.ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: {
          action: 'search_category_products',
          nonce: this.settings.nonce,
          search: searchTerm,
          category: categoryId
        }
      }).then(function (response) {
        if (response.products && response.products.length > 0) {
          var resultsHtml = '<ul class="product-results-list">';
          response.products.forEach(function (product) {
            resultsHtml += "\n              <li class=\"product-result-item\" data-id=\"".concat(product.id, "\" data-name=\"").concat(product.name, "\">\n                ").concat(product.name, " (ID: ").concat(product.id, ")\n              </li>\n            ");
          });
          resultsHtml += '</ul>';
          $('#product-search-results').html(resultsHtml);
        } else {
          $('#product-search-results').html('<p>No products found</p>');
        }
      })["catch"](function (error) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductAdditionsSettingsModule', 'AJAX error:', error);
        $('#product-search-results').html('<p>Error searching products</p>');
      });
    }

    /**
     * Load product details by ID
     * @param {number} productId Product ID
     */
  }, {
    key: "loadProductDetails",
    value: function loadProductDetails(productId) {
      var $ = jQuery;
      if (!productId) {
        return;
      }

      // Use ajax utility for the request
      _utils__WEBPACK_IMPORTED_MODULE_2__.ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: {
          action: 'get_product_details',
          nonce: this.settings.nonce,
          product_id: productId
        }
      }).then(function (response) {
        if (response.product) {
          var product = response.product;

          // Set the selected product
          $('#selected_product_id').val(product.id);
          $('.selected-product-info').html("<strong>".concat(product.name, "</strong> (ID: ").concat(product.id, ")"));
          $('#selected-product').show();
        } else {
          (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductAdditionsSettingsModule', 'Failed to load product details:', response);
        }
      })["catch"](function (error) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductAdditionsSettingsModule', 'AJAX error while loading product details:', error);
      });
    }

    /**
     * Create a table row for a relation
     * @param {Object} relation The relation data
     * @return {jQuery} The created row
     */
  }, {
    key: "createRelationRow",
    value: function createRelationRow(relation) {
      var $ = jQuery;
      if (!relation || !relation.id) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductAdditionsSettingsModule', 'Invalid relation data', relation);
        return $('<tr><td colspan="4">Error: Invalid relation data</td></tr>');
      }
      var $row = $('<tr></tr>').attr('data-id', relation.id);

      // Source categories
      var sourceName = relation.source_name || '';
      $row.append($('<td></td>').text(sourceName));

      // Relation type
      var $typeCell = $('<td></td>');
      var $typeSpan = $('<span></span>').addClass('relation-type').addClass(relation.relation_type || '');

      // Set appropriate label based on relation type
      var relation_type_label = '';
      if (relation.relation_type === 'auto_add_by_category') {
        relation_type_label = 'Auto add product with Category';
      } else if (relation.relation_type === 'auto_add_note_by_category') {
        relation_type_label = 'Auto add note with Category';
      } else if (relation.relation_type === 'suggest_products_by_category') {
        relation_type_label = 'Suggest products when Category';
      } else {
        relation_type_label = relation.relation_type_label || '';
      }
      $typeSpan.text(relation_type_label);
      $typeCell.append($typeSpan);
      $row.append($typeCell);

      // Target product cell or Note text
      var $targetCell = $('<td></td>');
      if (relation.relation_type === 'auto_add_by_category') {
        if (relation.product_name) {
          $targetCell.text(relation.product_name);
        } else if (relation.target_name) {
          $targetCell.text(relation.target_name + ' (Category)');
        }
      } else if (relation.relation_type === 'auto_add_note_by_category') {
        // For note type, we display a preview of the note text
        var notePreview = relation.note_text && relation.note_text.length > 50 ? _utils__WEBPACK_IMPORTED_MODULE_2__.format.truncateText(relation.note_text, 50) :
        // Using format utility
        relation.note_text || '';
        $targetCell.text(notePreview);
      } else if (relation.relation_type === 'suggest_products_by_category') {
        // For suggestion type, show the target category
        if (relation.target_name) {
          $targetCell.text(relation.target_name + ' (Category)');
        }
      }
      $row.append($targetCell);

      // Action buttons
      var $actionsCell = $('<td></td>').addClass('actions');
      var sourceStr = Array.isArray(relation.source_category) ? relation.source_category.join(',') : relation.source_category || '';

      // Use dom utility to create buttons
      var editBtn = _utils__WEBPACK_IMPORTED_MODULE_2__.dom.createElement('button', {
        className: 'button button-small edit-relation',
        type: 'button',
        dataset: {
          id: relation.id,
          source: sourceStr,
          target: relation.target_category || '',
          productId: relation.product_id || '',
          type: relation.relation_type || '',
          noteText: relation.note_text || ''
        }
      }, 'Edit');
      var deleteBtn = _utils__WEBPACK_IMPORTED_MODULE_2__.dom.createElement('button', {
        className: 'button button-small delete-relation',
        type: 'button',
        dataset: {
          id: relation.id
        }
      }, 'Delete');

      // Convert DOM elements to jQuery and append
      $actionsCell.append($(editBtn), ' ', $(deleteBtn));
      $row.append($actionsCell);
      return $row;
    }

    /**
     * Append a relation row to the table
     * @param {Object} relation The relation data
     */
  }, {
    key: "appendRelationRow",
    value: function appendRelationRow(relation) {
      var $ = jQuery;
      if (!relation || !relation.id) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductAdditionsSettingsModule', 'Cannot append row: Invalid relation data', relation);
        return;
      }
      var $table = $('.product-additions-table');
      if (!$table.length) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductAdditionsSettingsModule', 'Cannot append row: Table not found');
        return;
      }
      var $tbody = $table.find('tbody');
      if (!$tbody.length) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductAdditionsSettingsModule', 'Cannot append row: Table body not found');
        return;
      }
      var $row = this.createRelationRow(relation);
      $tbody.append($row);
    }

    /**
     * Show a notice message
     * @param {string} type The notice type ('success' or 'error')
     * @param {string} message The message to display
     */
  }, {
    key: "showMessage",
    value: function showMessage(type, message) {
      var $ = jQuery;
      var $container = $('.product-estimator-additions');
      if (!$container.length) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductAdditionsSettingsModule', 'Cannot show notice: Container not found');
        return;
      }
      var $existingNotice = $container.find('.notice');

      // Remove existing notices
      if ($existingNotice.length) {
        $existingNotice.remove();
      }

      // Use the validation utility if available, or create a notice manually
      if (typeof _utils__WEBPACK_IMPORTED_MODULE_2__.validation.showNotice === 'function') {
        _utils__WEBPACK_IMPORTED_MODULE_2__.validation.showNotice(message, type);
      } else {
        // Create new notice using dom utility
        var notice = _utils__WEBPACK_IMPORTED_MODULE_2__.dom.createElement('div', {
          className: "notice ".concat(type === 'success' ? 'notice-success' : 'notice-error')
        });
        var paragraph = _utils__WEBPACK_IMPORTED_MODULE_2__.dom.createElement('p', {}, message);
        notice.appendChild(paragraph);

        // Insert notice at the top of the container
        $container.prepend($(notice));

        // Auto-remove after 5 seconds
        setTimeout(function () {
          $(notice).fadeOut(500, function () {
            $(this).remove();
          });
        }, 5000);
      }
    }
  }]);
}(); // Initialize when document is ready
jQuery(document).ready(function () {
  // Only initialize if we're on the correct tab
  var currentTab = jQuery('#product_additions');
  if (currentTab.length && currentTab.is(':visible')) {
    var module = new ProductAdditionsSettingsModule();
    window.ProductAdditionsSettingsModule = module;
  } else {
    // Listen for tab change events to initialize when our tab becomes visible
    jQuery(document).on('product_estimator_tab_changed', function (e, tabId) {
      if (tabId === 'product_additions') {
        setTimeout(function () {
          var module = new ProductAdditionsSettingsModule();
          window.ProductAdditionsSettingsModule = module;
        }, 100);
      }
    });
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProductAdditionsSettingsModule);

/***/ }),

/***/ "./src/js/admin/modules/ProductUpgradesSettingsModule.js":
/*!***************************************************************!*\
  !*** ./src/js/admin/modules/ProductUpgradesSettingsModule.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");


/**
 * Product Upgrades Settings JavaScript
 *
 * Handles functionality specific to the product upgrades settings tab.
 */

var ProductUpgradesSettingsModule = /*#__PURE__*/function () {
  /**
   * Initialize the module
   */
  function ProductUpgradesSettingsModule() {
    var _this = this;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, ProductUpgradesSettingsModule);
    // Access localized data with a fallback mechanism
    var adminSettings = window.productUpgradesSettings || {};

    // Create a safe reference to the settings object
    this.settings = {
      ajaxUrl: adminSettings.ajax_url || (typeof ajaxurl !== 'undefined' ? ajaxurl : '/wp-admin/admin-ajax.php'),
      nonce: adminSettings.nonce || '',
      i18n: adminSettings.i18n || {},
      tab_id: adminSettings.tab_id || 'product_upgrades'
    };

    // Add a variable to track if the form has been modified
    this.formModified = false;

    // Initialize when document is ready
    jQuery(document).ready(function () {
      return _this.init();
    });
  }

  /**
   * Initialize the module
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(ProductUpgradesSettingsModule, [{
    key: "init",
    value: function init() {
      (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductUpgradesSettingsModule', 'Initializing Product Upgrades Settings Module');
      // Reset form modified state on initialization
      this.formModified = false;
      this.bindEvents();
      this.setupFormHandling();
    }

    /**
     * Bind event handlers
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this2 = this;
      var $ = jQuery;

      // Listen for tab changes
      $(document).on('product_estimator_tab_changed', this.handleTabChanged.bind(this));

      // Tab-specific handlers
      this.initUpgradeHandlers();

      // Track form changes
      $('#product-upgrade-form').on('change input', 'input, select, textarea', function () {
        _this2.formModified = true;

        // Update the global form change tracker if available
        if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.formChangeTrackers !== 'undefined') {
          ProductEstimatorSettings.formChangeTrackers[_this2.settings.tab_id] = true;

          // If this is the current tab, update the main formChanged flag
          if (ProductEstimatorSettings.currentTab === _this2.settings.tab_id) {
            ProductEstimatorSettings.formChanged = true;
          }
        }
      });
    }

    /**
     * Set up event handlers for the upgrade configuration management UI
     */
  }, {
    key: "initUpgradeHandlers",
    value: function initUpgradeHandlers() {
      var $ = jQuery;
      var $container = $('.product-estimator-upgrades');
      var $form = $('#product-upgrade-form');
      var $formContainer = $('.product-upgrades-form');
      var $addButton = $('.add-new-upgrade');

      // Initialize Select2 for multiple selection
      $('#base_categories').select2({
        placeholder: 'Select base categories',
        width: '100%',
        dropdownCssClass: 'product-estimator-dropdown'
      });
      $('#upgrade_categories').select2({
        placeholder: 'Select upgrade categories',
        width: '100%',
        dropdownCssClass: 'product-estimator-dropdown'
      });

      // Show form when "Add New Upgrade Configuration" button is clicked
      $addButton.on('click', function () {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductUpgradesSettingsModule', 'Add New Upgrade Configuration button clicked');
        this.resetForm();
        $('.form-title').text(this.settings.i18n.addNew || 'Add New Upgrade Configuration');
        $('.save-upgrade').text(this.settings.i18n.saveChanges || 'Save Changes');
        $formContainer.slideDown();
      }.bind(this));

      // Hide form when "Cancel" button is clicked
      $('.cancel-form').on('click', function () {
        $formContainer.slideUp();
        this.resetForm();
      }.bind(this));

      // Handle form submission
      $form.on('submit', this.handleFormSubmission.bind(this));

      // Handle edit/delete upgrades via event delegation
      $('.product-upgrades-list').on('click', '.edit-upgrade', this.handleEditUpgrade.bind(this));
      $('.product-upgrades-list').on('click', '.delete-upgrade', this.handleDeleteUpgrade.bind(this));
    }

    /**
     * Set up form handling
     */
  }, {
    key: "setupFormHandling",
    value: function setupFormHandling() {
      // Additional form setup if needed
    }

    /**
     * Handle tab changed event
     * @param {Event} e Tab changed event
     * @param {string} tabId The newly active tab ID
     */
  }, {
    key: "handleTabChanged",
    value: function handleTabChanged(e, tabId) {
      // If our tab becomes active, refresh initialization
      if (tabId === this.settings.tab_id) {
        this.formModified = false; // Reset form modified state
        this.init();

        // Update the global form change tracker if available
        if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.formChangeTrackers !== 'undefined') {
          ProductEstimatorSettings.formChangeTrackers[this.settings.tab_id] = false;

          // If this is the current tab, update the main formChanged flag
          if (ProductEstimatorSettings.currentTab === this.settings.tab_id) {
            ProductEstimatorSettings.formChanged = false;
          }
        }
      }
    }

    /**
     * Reset the form to its initial state
     */
  }, {
    key: "resetForm",
    value: function resetForm() {
      var $ = jQuery;
      var $form = $('#product-upgrade-form');
      $form[0].reset();
      $('#upgrade_id').val('');

      // Reset Select2 fields
      $('#base_categories').val(null).trigger('change');
      $('#upgrade_categories').val(null).trigger('change');
      $('#display_mode').val('dropdown').trigger('change');
      $('#upgrade_title').val('');
      $('#upgrade_description').val('');

      // Reset form modified state
      this.formModified = false;

      // Update the global form change tracker if available
      if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.formChangeTrackers !== 'undefined') {
        ProductEstimatorSettings.formChangeTrackers[this.settings.tab_id] = false;

        // If this is the current tab, update the main formChanged flag
        if (ProductEstimatorSettings.currentTab === this.settings.tab_id) {
          ProductEstimatorSettings.formChanged = false;
        }
      }
    }

    /**
     * Toggle form state (enable/disable inputs)
     * @param {boolean} enabled Whether to enable the form inputs
     */
  }, {
    key: "toggleFormState",
    value: function toggleFormState(enabled) {
      var $ = jQuery;
      var $form = $('#product-upgrade-form');
      var $submitBtn = $form.find('.save-upgrade');
      var $cancelBtn = $form.find('.cancel-form');
      $form.find('input, select, textarea').prop('disabled', !enabled);
      $submitBtn.prop('disabled', !enabled);
      $cancelBtn.prop('disabled', !enabled);
      if (!enabled) {
        $submitBtn.text('Saving...');
      } else {
        $submitBtn.text($('#upgrade_id').val() ? 'Update Configuration' : 'Save Configuration');
      }

      // Special handling for Select2
      if (enabled) {
        $('#base_categories').prop('disabled', false).trigger('change');
        $('#upgrade_categories').prop('disabled', false).trigger('change');
      } else {
        $('#base_categories').prop('disabled', true).trigger('change');
        $('#upgrade_categories').prop('disabled', true).trigger('change');
      }
    }

    /**
     * Handle form submission
     * @param {Event} e Form submit event
     */
  }, {
    key: "handleFormSubmission",
    value: function handleFormSubmission(e) {
      var _this3 = this;
      e.preventDefault();
      var $ = jQuery;
      var baseCategories = $('#base_categories').val();
      var upgradeCategories = $('#upgrade_categories').val();
      var displayMode = $('#display_mode').val();
      var upgradeTitle = $('#upgrade_title').val();
      var upgradeDescription = $('#upgrade_description').val();

      // Validate form
      if (!baseCategories || baseCategories.length === 0) {
        alert(this.settings.i18n.selectBaseCategories || 'Please select at least one base category');
        return;
      }
      if (!upgradeCategories || upgradeCategories.length === 0) {
        alert(this.settings.i18n.selectUpgradeCategories || 'Please select at least one upgrade category');
        return;
      }

      // Disable form while submitting
      this.toggleFormState(false);
      var formData = {
        action: 'save_product_upgrade',
        nonce: this.settings.nonce,
        upgrade_id: $('#upgrade_id').val(),
        base_categories: baseCategories,
        upgrade_categories: upgradeCategories,
        display_mode: displayMode,
        upgrade_title: upgradeTitle,
        upgrade_description: upgradeDescription
      };
      (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductUpgradesSettingsModule', 'Sending form data:', formData);

      // Send AJAX request using ajax utility
      _utils__WEBPACK_IMPORTED_MODULE_2__.ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: formData
      }).then(function (response) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductUpgradesSettingsModule', 'Response received:', response);

        // Show success message
        _this3.showMessage('success', response.message);

        // If editing an existing upgrade, replace the row
        if (formData.upgrade_id) {
          (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductUpgradesSettingsModule', 'Updating existing upgrade:', formData.upgrade_id);
          var $existingRow = $('.product-upgrades-list').find("tr[data-id=\"".concat(formData.upgrade_id, "\"]"));
          if ($existingRow.length) {
            $existingRow.replaceWith(_this3.createUpgradeRow(response.upgrade));
          } else {
            // If the row doesn't exist (unlikely), append it
            _this3.appendUpgradeRow(response.upgrade);
          }
        } else {
          // For new upgrades, append the row
          _this3.appendUpgradeRow(response.upgrade);
        }

        // Hide the form and reset it
        $('.product-upgrades-form').slideUp();
        _this3.resetForm();

        // If this is the first upgrade, remove the "no items" message and create the table
        var $noItems = $('.product-upgrades-list').find('.no-items');
        if ($noItems.length) {
          $noItems.remove();

          // Create the table if it doesn't exist
          if (!$('.product-upgrades-list').find('table').length) {
            var tableHtml = "\n              <table class=\"wp-list-table widefat fixed striped product-upgrades-table\">\n                <thead>\n                  <tr>\n                    <th scope=\"col\">".concat('Base Categories', "</th>\n                    <th scope=\"col\">", 'Upgrade Categories', "</th>\n                    <th scope=\"col\">", 'Display Mode', "</th>\n                    <th scope=\"col\">", 'Actions', "</th>\n                  </tr>\n                </thead>\n                <tbody></tbody>\n              </table>\n            ");
            $('.product-upgrades-list').find('h3').after(tableHtml);
          }
        }

        // Reset form modified state
        _this3.formModified = false;

        // Update the global form change tracker if available
        if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.formChangeTrackers !== 'undefined') {
          ProductEstimatorSettings.formChangeTrackers[_this3.settings.tab_id] = false;

          // If this is the current tab, update the main formChanged flag
          if (ProductEstimatorSettings.currentTab === _this3.settings.tab_id) {
            ProductEstimatorSettings.formChanged = false;
          }
        }
      })["catch"](function (error) {
        // Show error message
        _this3.showMessage('error', error.message || 'Error saving upgrade configuration. Please try again.');
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductUpgradesSettingsModule', 'Error saving upgrade configuration:', error);
      })["finally"](function () {
        // Re-enable form
        _this3.toggleFormState(true);
      });
    }

    /**
     * Handle edit upgrade button click
     * @param {Event} e Click event
     */
  }, {
    key: "handleEditUpgrade",
    value: function handleEditUpgrade(e) {
      var $ = jQuery;
      var $btn = $(e.currentTarget);
      var upgradeId = $btn.data('id');
      var baseCategories = String($btn.data('base') || '').split(',').filter(Boolean);
      var upgradeCategories = String($btn.data('upgrade') || '').split(',').filter(Boolean);
      var displayMode = $btn.data('mode');
      var upgradeTitle = $btn.data('title');
      var upgradeDescription = $btn.data('description');
      (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductUpgradesSettingsModule', 'Edit upgrade:', upgradeId, baseCategories, upgradeCategories, displayMode, upgradeTitle, upgradeDescription);

      // Reset form
      this.resetForm();

      // Populate form with existing data
      $('#upgrade_id').val(upgradeId);
      $('#display_mode').val(displayMode || 'dropdown').trigger('change');
      $('#upgrade_title').val(upgradeTitle || '');
      $('#upgrade_description').val(upgradeDescription || '');

      // Need to make sure Select2 has initialized
      setTimeout(function () {
        $('#base_categories').val(baseCategories).trigger('change');
        $('#upgrade_categories').val(upgradeCategories).trigger('change');
      }, 100);

      // Update form title and button text
      $('.form-title').text('Edit Upgrade Configuration');
      $('.save-upgrade').text('Update Configuration');

      // Show form
      $('.product-upgrades-form').slideDown();

      // Scroll to form
      $('html, body').animate({
        scrollTop: $('.product-upgrades-form').offset().top - 50
      }, 300);
    }

    /**
     * Handle delete upgrade button click
     * @param {Event} e Click event
     */
  }, {
    key: "handleDeleteUpgrade",
    value: function handleDeleteUpgrade(e) {
      var _this4 = this;
      var $ = jQuery;
      var $btn = $(e.currentTarget);
      var upgradeId = $btn.data('id');
      (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductUpgradesSettingsModule', 'Delete upgrade:', upgradeId);
      if (!confirm(this.settings.i18n.confirmDelete || 'Are you sure you want to delete this upgrade configuration?')) {
        return;
      }

      // Disable button while processing
      $btn.prop('disabled', true).text('Deleting...');
      var data = {
        action: 'delete_product_upgrade',
        nonce: this.settings.nonce,
        upgrade_id: upgradeId
      };

      // Use ajax utility for the request
      _utils__WEBPACK_IMPORTED_MODULE_2__.ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: data
      }).then(function (response) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductUpgradesSettingsModule', 'Delete response:', response);

        // Remove row from table
        var $row = $btn.closest('tr');
        $row.fadeOut(300, function () {
          $row.remove();

          // If no more rows, show "no items" message
          if (!$('.product-upgrades-list').find('tbody tr').length) {
            $('.product-upgrades-list').find('table').remove();
            $('.product-upgrades-list').append('<div class="no-items">No upgrade configurations have been created yet.</div>');
          }
        });

        // Show success message
        _this4.showMessage('success', response.message);
      })["catch"](function (error) {
        // Show error message
        _this4.showMessage('error', error.message || 'Error deleting upgrade configuration. Please try again.');
        $btn.prop('disabled', false).text('Delete');
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductUpgradesSettingsModule', 'Error deleting upgrade configuration:', error);
      });
    }

    /**
     * Create a table row for an upgrade
     * @param {Object} upgrade The upgrade data
     * @return {jQuery} The created row
     */
  }, {
    key: "createUpgradeRow",
    value: function createUpgradeRow(upgrade) {
      var $ = jQuery;
      if (!upgrade || !upgrade.id) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductUpgradesSettingsModule', 'Invalid upgrade data', upgrade);
        return $('<tr><td colspan="4">Error: Invalid upgrade data</td></tr>');
      }
      var $row = $('<tr></tr>').attr('data-id', upgrade.id);

      // Base Categories
      var baseCategoryNames = upgrade.base_category_names || '';
      $row.append($('<td></td>').text(baseCategoryNames));

      // Upgrade Categories
      var upgradeCategoryNames = upgrade.upgrade_category_names || '';
      $row.append($('<td></td>').text(upgradeCategoryNames));

      // Display Mode
      var displayModes = {
        'dropdown': 'Dropdown',
        'radio': 'Radio Buttons',
        'tiles': 'Image Tiles'
      };
      var displayMode = displayModes[upgrade.display_mode] || 'Dropdown';
      $row.append($('<td></td>').text(displayMode));

      // Actions
      var $actionsCell = $('<td></td>').addClass('actions');

      // Use dom.createElement utility to create buttons
      var editBtn = _utils__WEBPACK_IMPORTED_MODULE_2__.dom.createElement('button', {
        className: 'button button-small edit-upgrade',
        type: 'button',
        dataset: {
          id: upgrade.id,
          base: Array.isArray(upgrade.base_categories) ? upgrade.base_categories.join(',') : '',
          upgrade: Array.isArray(upgrade.upgrade_categories) ? upgrade.upgrade_categories.join(',') : '',
          mode: upgrade.display_mode || 'dropdown',
          title: upgrade.title || '',
          description: upgrade.description || ''
        }
      }, 'Edit');
      var deleteBtn = _utils__WEBPACK_IMPORTED_MODULE_2__.dom.createElement('button', {
        className: 'button button-small delete-upgrade',
        type: 'button',
        dataset: {
          id: upgrade.id
        }
      }, 'Delete');

      // Convert DOM elements to jQuery and append
      $actionsCell.append($(editBtn), ' ', $(deleteBtn));
      $row.append($actionsCell);
      return $row;
    }

    /**
     * Append an upgrade row to the table
     * @param {Object} upgrade The upgrade data
     */
  }, {
    key: "appendUpgradeRow",
    value: function appendUpgradeRow(upgrade) {
      var $ = jQuery;
      if (!upgrade || !upgrade.id) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductUpgradesSettingsModule', 'Cannot append row: Invalid upgrade data', upgrade);
        return;
      }
      var $table = $('.product-upgrades-table');
      if (!$table.length) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductUpgradesSettingsModule', 'Cannot append row: Table not found');
        return;
      }
      var $tbody = $table.find('tbody');
      if (!$tbody.length) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductUpgradesSettingsModule', 'Cannot append row: Table body not found');
        return;
      }
      var $row = this.createUpgradeRow(upgrade);
      $tbody.append($row);
    }

    /**
     * Show a notice message
     * @param {string} type The notice type ('success' or 'error')
     * @param {string} message The message to display
     */
  }, {
    key: "showMessage",
    value: function showMessage(type, message) {
      var $ = jQuery;
      var $container = $('.product-estimator-upgrades');
      if (!$container.length) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.log)('ProductUpgradesSettingsModule', 'Cannot show notice: Container not found');
        return;
      }
      var $existingNotice = $container.find('.notice');

      // Remove existing notices
      if ($existingNotice.length) {
        $existingNotice.remove();
      }

      // First try to use the global utility in ProductEstimatorSettings
      if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.showNotice === 'function') {
        ProductEstimatorSettings.showNotice(message, type);
        return;
      }

      // Fallback to using validation utility
      if (typeof _utils__WEBPACK_IMPORTED_MODULE_2__.validation.showNotice === 'function') {
        _utils__WEBPACK_IMPORTED_MODULE_2__.validation.showNotice(message, type);
        return;
      }

      // Fallback implementation if utilities aren't available
      // Create new notice using dom utility
      var notice = _utils__WEBPACK_IMPORTED_MODULE_2__.dom.createElement('div', {
        className: "notice notice-".concat(type === 'success' ? 'success' : 'error')
      });
      var paragraph = _utils__WEBPACK_IMPORTED_MODULE_2__.dom.createElement('p', {}, message);
      notice.appendChild(paragraph);

      // Insert notice at the top of the container
      $container.prepend($(notice));

      // Auto-remove after 5 seconds
      setTimeout(function () {
        $(notice).fadeOut(500, function () {
          $(this).remove();
        });
      }, 5000);
    }
  }]);
}(); // Initialize when document is ready
jQuery(document).ready(function () {
  // Only initialize if we're on the correct tab
  var currentTab = jQuery('#product_upgrades');
  if (currentTab.length && currentTab.is(':visible')) {
    var module = new ProductUpgradesSettingsModule();
    window.ProductUpgradesSettingsModule = module;
  } else {
    // Listen for tab change events to initialize when our tab becomes visible
    jQuery(document).on('product_estimator_tab_changed', function (e, tabId) {
      if (tabId === 'product_upgrades') {
        setTimeout(function () {
          var module = new ProductUpgradesSettingsModule();
          window.ProductUpgradesSettingsModule = module;
        }, 100);
      }
    });
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProductUpgradesSettingsModule);

/***/ }),

/***/ "./src/js/admin/modules/SimilarProductsSettingsModule.js":
/*!***************************************************************!*\
  !*** ./src/js/admin/modules/SimilarProductsSettingsModule.js ***!
  \***************************************************************/
/***/ (() => {

/**
 * Similar Products Settings Module
 *
 * Handles functionality for the similar products settings tab in the admin area.
 * Fixes syntax errors and improves integration with existing code.
 */

// Use explicit jQuery to avoid conflicts
(function ($) {
  'use strict';

  // Global settings object
  var settings = {
    ajaxUrl: typeof ajaxurl !== 'undefined' ? ajaxurl : '/wp-admin/admin-ajax.php',
    nonce: similarProducts ? similarProducts.nonce : '',
    loading_attributes: similarProducts ? similarProducts.loading_attributes : 'Loading attributes...',
    select_category: similarProducts ? similarProducts.select_category : 'Please select categories first.',
    no_attributes: similarProducts ? similarProducts.no_attributes : 'No product attributes found for these categories.',
    error_loading: similarProducts ? similarProducts.error_loading : 'Error loading attributes. Please try again.',
    saving: similarProducts ? similarProducts.saving : 'Saving...',
    rule_saved: similarProducts ? similarProducts.rule_saved : 'Rule saved successfully!',
    error_saving: similarProducts ? similarProducts.error_saving : 'Error saving rule. Please try again.',
    confirm_delete: similarProducts ? similarProducts.confirm_delete : 'Are you sure you want to delete this rule?',
    error_deleting: similarProducts ? similarProducts.error_deleting : 'Error deleting rule. Please try again.',
    select_category_error: similarProducts ? similarProducts.select_category_error : 'Please select at least one source category.',
    select_attributes_error: similarProducts ? similarProducts.select_attributes_error : 'Please select at least one attribute.'
  };

  /**
   * Initialize similar products functionality
   */
  function init() {
    // Only run on similar products settings page
    if (!$('.product-estimator-similar-products-settings').length) {
      return;
    }
    console.log('Initializing Similar Products Settings Module');

    // Add new rule button
    $('.add-new-rule').on('click', addNewRule);

    // Initialize existing rules
    initializeExistingRules();

    // Listen for tab changes
    $(document).on('product_estimator_tab_changed', handleTabChanged);
  }

  /**
   * Handle tab changed event
   * @param {Event} e Tab changed event
   * @param {string} tabId The newly active tab ID
   */
  function handleTabChanged(e, tabId) {
    // If our tab becomes active, refresh any dynamic content
    if (tabId === 'similar_products') {
      // Re-initialize rules when tab becomes active
      initializeExistingRules();
      console.log('Tab changed to Similar Products');
    }
  }

  /**
   * Add a new rule to the interface
   */
  function addNewRule() {
    // Clone the template
    var $template = $('.rule-template').children().first().clone();

    // Generate a unique temporary ID
    var tempId = 'new_' + Math.random().toString(36).substr(2, 9);

    // Replace template ID with temp ID
    $template.attr('data-rule-id', tempId);
    $template.find('[name^="TEMPLATE_ID"]').each(function () {
      var newName = $(this).attr('name').replace('TEMPLATE_ID', tempId);
      $(this).attr('name', newName);
    });

    // Add to rules container
    $('.similar-products-rules').append($template);

    // Hide "no rules" message if visible
    $('.no-rules-message').hide();

    // Initialize the new rule
    initializeRule($template);

    // Open the new rule
    $template.addClass('open');
  }

  /**
   * Initialize all existing rules
   */
  function initializeExistingRules() {
    $('.similar-products-rule').each(function (index, element) {
      initializeRule($(element));
    });
  }

  /**
   * Initialize a single rule
   * @param {jQuery} $rule The rule element
   */
  function initializeRule($rule) {
    var ruleId = $rule.data('rule-id');

    // Toggle rule expansion
    $rule.find('.rule-header').on('click', function (e) {
      if (!$(e.target).hasClass('delete-rule') && !$(e.target).hasClass('save-rule')) {
        $rule.toggleClass('open');
      }
    });

    // Category change handler - initialize Select2 if available
    var $categorySelect = $rule.find('.source-categories-select');

    // Initialize Select2 for better multi-select if available
    if ($.fn.select2) {
      $categorySelect.select2({
        width: '100%',
        placeholder: 'Select categories',
        allowClear: true,
        closeOnSelect: false
      });
    }
    $categorySelect.on('change', function (e) {
      var categoryIds = $(e.target).val();
      if (categoryIds && categoryIds.length > 0) {
        loadCategoryAttributes(categoryIds, $rule);
      } else {
        // Clear attributes
        $rule.find('.attributes-list').empty().html('<p>' + settings.select_category + '</p>');
      }
    });

    // Delete rule button
    $rule.find('.delete-rule').on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (confirm(settings.confirm_delete)) {
        deleteRule(ruleId, $rule);
      }
    });

    // Save rule button
    $rule.find('.save-rule').on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      saveRule(ruleId, $rule);
    });

    // If the rule has categories selected, load their attributes
    var selectedCategories = $categorySelect.val();
    if (selectedCategories && selectedCategories.length > 0) {
      loadCategoryAttributes(selectedCategories, $rule);
    }
  }

  /**
   * Load attributes for multiple categories
   * @param {Array} categoryIds Array of category IDs
   * @param {jQuery} $rule The rule element
   */
  function loadCategoryAttributes(categoryIds, $rule) {
    var $attributesList = $rule.find('.attributes-list');

    // Show loading state
    $attributesList.html('<p>' + settings.loading_attributes + '</p>').addClass('loading');

    // Make AJAX request to get attributes for these categories
    $.ajax({
      url: settings.ajaxUrl,
      type: 'POST',
      dataType: 'json',
      data: {
        action: 'get_category_attributes',
        nonce: settings.nonce,
        category_ids: categoryIds
      },
      success: function success(response) {
        if (response.success) {
          renderAttributes(response.data.attributes, $rule);
        } else {
          $attributesList.html('<p class="error">' + (response.data.message || settings.error_loading) + '</p>').removeClass('loading');
          console.error('Error loading attributes:', response);
        }
      },
      error: function error(xhr, status, _error) {
        $attributesList.html('<p class="error">' + settings.error_loading + '</p>').removeClass('loading');
        console.error('AJAX error loading attributes:', status, _error);
      }
    });
  }

  /**
   * Render attributes in the rule
   * @param {Array} attributes Array of attribute objects
   * @param {jQuery} $rule The rule element
   */
  function renderAttributes(attributes, $rule) {
    var $container = $rule.find('.attributes-list');
    $container.empty().removeClass('loading');
    if (!attributes || attributes.length === 0) {
      $container.html('<p>' + settings.no_attributes + '</p>');
      return;
    }
    var ruleId = $rule.data('rule-id');
    var selectedAttributes = $rule.find('.selected-attributes').val();
    var selectedAttrs = [];
    if (selectedAttributes) {
      selectedAttrs = selectedAttributes.split(',');
    }

    // Create HTML for attributes
    var html = '';
    $.each(attributes, function (index, attribute) {
      var isChecked = $.inArray(attribute.name, selectedAttrs) > -1;
      html += '<div class="attribute-item">';
      html += '<label>';
      html += '<input type="checkbox" name="' + ruleId + '[attributes][]" value="' + attribute.name + '"' + (isChecked ? ' checked' : '') + '>';
      html += '<span>' + attribute.label + '</span>';
      html += '</label>';
      html += '</div>';
    });
    $container.html(html);
  }

  /**
   * Save a rule
   * @param {string} ruleId The rule ID
   * @param {jQuery} $rule The rule element
   */
  function saveRule(ruleId, $rule) {
    var $saveButton = $rule.find('.save-rule');
    var originalText = $saveButton.text();

    // Validate required fields
    var sourceCategories = $rule.find('.source-categories-select').val();
    if (!sourceCategories || sourceCategories.length === 0) {
      showMessage($rule, settings.select_category_error, 'error');
      return;
    }
    var selectedAttributes = [];
    $rule.find('.attributes-list input[type="checkbox"]:checked').each(function () {
      selectedAttributes.push($(this).val());
    });
    if (selectedAttributes.length === 0) {
      showMessage($rule, settings.select_attributes_error, 'error');
      return;
    }

    // Show saving state
    $saveButton.text(settings.saving).prop('disabled', true);

    // Save data via AJAX
    $.ajax({
      url: settings.ajaxUrl,
      type: 'POST',
      dataType: 'json',
      data: {
        action: 'save_similar_products_rule',
        nonce: settings.nonce,
        rule_id: ruleId,
        source_categories: sourceCategories,
        attributes: selectedAttributes
      },
      success: function success(response) {
        if (response.success) {
          // Show success message
          showMessage($rule, settings.rule_saved, 'success');

          // If this was a new rule, update its ID
          if (ruleId.startsWith('new_')) {
            var newRuleId = response.data.rule_id;
            $rule.attr('data-rule-id', newRuleId);

            // Update all field names
            $rule.find('[name^="' + ruleId + '"]').each(function () {
              var newName = $(this).attr('name').replace(ruleId, newRuleId);
              $(this).attr('name', newName);
            });
          }

          // Update rule title - show all selected category names
          var categoryNames = [];
          $.each(sourceCategories, function (i, catId) {
            var catName = $rule.find('.source-categories-select option[value="' + catId + '"]').text();
            if (catName) {
              categoryNames.push(catName);
            }
          });
          if (categoryNames.length > 0) {
            $rule.find('.rule-title').text(categoryNames.join(', '));
          } else {
            $rule.find('.rule-title').text(settings.select_category);
          }
          console.log('Rule saved successfully', response.data);
        } else {
          showMessage($rule, response.data.message || settings.error_saving, 'error');
          console.error('Error saving rule:', response);
        }
      },
      error: function error(xhr, status, _error2) {
        showMessage($rule, settings.error_saving, 'error');
        console.error('AJAX error saving rule:', status, _error2);
      },
      complete: function complete() {
        $saveButton.text(originalText).prop('disabled', false);
      }
    });
  }

  /**
   * Delete a rule
   * @param {string} ruleId The rule ID
   * @param {jQuery} $rule The rule element
   */
  function deleteRule(ruleId, $rule) {
    // If this is a new rule that hasn't been saved, just remove it
    if (ruleId.startsWith('new_')) {
      $rule.remove();

      // Show "no rules" message if no rules left
      if ($('.similar-products-rule').length === 0) {
        $('.no-rules-message').show();
      }
      return;
    }

    // Otherwise, send AJAX request to delete from database
    $.ajax({
      url: settings.ajaxUrl,
      type: 'POST',
      dataType: 'json',
      data: {
        action: 'delete_similar_products_rule',
        nonce: settings.nonce,
        rule_id: ruleId
      },
      success: function success(response) {
        if (response.success) {
          $rule.remove();

          // Show "no rules" message if no rules left
          if ($('.similar-products-rule').length === 0) {
            $('.no-rules-message').show();
          }
          console.log('Rule deleted successfully');
        } else {
          showMessage($rule, response.data.message || settings.error_deleting, 'error');
          console.error('Error deleting rule:', response);
        }
      },
      error: function error(xhr, status, _error3) {
        showMessage($rule, settings.error_deleting, 'error');
        console.error('AJAX error deleting rule:', status, _error3);
      }
    });
  }

  /**
   * Show a message in the rule
   * @param {jQuery} $rule The rule element
   * @param {string} message The message text
   * @param {string} type The message type ('success' or 'error')
   */
  function showMessage($rule, message, type) {
    // Create message element
    var $messageElement = $('<div>', {
      'class': 'rule-message ' + type,
      'text': message
    });

    // Remove any existing messages
    $rule.find('.rule-message').remove();

    // Add the new message
    $rule.find('.rule-header').after($messageElement);

    // Auto remove after 3 seconds
    setTimeout(function () {
      $messageElement.fadeOut(300, function () {
        $(this).remove();
      });
    }, 3000);
  }

  // Initialize when document is ready
  $(document).ready(init);

  // Expose public methods
  window.SimilarProductsSettingsModule = {
    init: init,
    addNewRule: addNewRule,
    initializeExistingRules: initializeExistingRules
  };
})(jQuery);

/***/ }),

/***/ "./src/js/utils/ajax.js":
/*!******************************!*\
  !*** ./src/js/utils/ajax.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ajaxRequest: () => (/* binding */ ajaxRequest),
/* harmony export */   debounce: () => (/* binding */ debounce),
/* harmony export */   formatFormData: () => (/* binding */ formatFormData),
/* harmony export */   wpAjax: () => (/* binding */ wpAjax)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");



function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/**
 * AJAX utilities for Product Estimator plugin
 *
 * Functions for handling AJAX requests and related operations.
 */

/**
 * Handle AJAX request with error handling and consistent response format
 *
 * @param {Object} options - AJAX options
 * @return {Promise} - Promise resolving to response data
 */
function ajaxRequest(options) {
  var _window$productEstima;
  var $ = jQuery;

  // Default options
  var defaults = {
    url: ((_window$productEstima = window.productEstimatorVars) === null || _window$productEstima === void 0 ? void 0 : _window$productEstima.ajax_url) || (typeof ajaxurl !== 'undefined' ? ajaxurl : '/wp-admin/admin-ajax.php'),
    type: 'POST',
    dataType: 'json'
  };

  // Merge defaults with provided options
  var settings = _objectSpread(_objectSpread({}, defaults), options);
  return new Promise(function (resolve, reject) {
    $.ajax(_objectSpread(_objectSpread({}, settings), {}, {
      success: function success(response) {
        if (response.success) {
          resolve(response.data);
        } else {
          var _response$data;
          var error = new Error(((_response$data = response.data) === null || _response$data === void 0 ? void 0 : _response$data.message) || 'Unknown error');
          error.data = response.data;
          reject(error);
        }
      },
      error: function error(xhr, status, _error) {
        console.error('AJAX error:', status, _error);
        reject(new Error(_error));
      }
    }));
  });
}

/**
 * Creates a debounced function
 *
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @return {Function} - Debounced function
 */
function debounce(func) {
  var wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 300;
  var timeout;
  return function executedFunction() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var later = function later() {
      clearTimeout(timeout);
      func.apply(void 0, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Makes a simple WordPress AJAX request with FormData
 *
 * @param {string} action - WordPress AJAX action name
 * @param {Object} data - Data to send (excluding action and nonce)
 * @param {string} nonce - Security nonce (defaults to productEstimatorVars.nonce)
 * @returns {Promise} - Promise resolving to response data
 */
function wpAjax(action) {
  var _window$productEstima2, _window$productEstima3;
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var nonce = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  // Use the global nonce if available and none provided
  var securityNonce = nonce || ((_window$productEstima2 = window.productEstimatorVars) === null || _window$productEstima2 === void 0 ? void 0 : _window$productEstima2.nonce) || '';

  // Create FormData object
  var formData = new FormData();
  formData.append('action', action);
  formData.append('nonce', securityNonce);

  // Add all other data
  Object.entries(data).forEach(function (_ref) {
    var _ref2 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref, 2),
      key = _ref2[0],
      value = _ref2[1];
    // Skip null or undefined values
    if (value === null || value === undefined) {
      return;
    }

    // Handle arrays and objects by JSON-stringifying them
    if ((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(value) === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });

  // Make the fetch request
  return fetch(((_window$productEstima3 = window.productEstimatorVars) === null || _window$productEstima3 === void 0 ? void 0 : _window$productEstima3.ajax_url) || '/wp-admin/admin-ajax.php', {
    method: 'POST',
    credentials: 'same-origin',
    body: formData
  }).then(function (response) {
    if (!response.ok) {
      throw new Error("Network response was not ok: ".concat(response.status));
    }
    return response.json();
  }).then(function (response) {
    if (response.success) {
      return response.data;
    } else {
      var _response$data2;
      var error = new Error(((_response$data2 = response.data) === null || _response$data2 === void 0 ? void 0 : _response$data2.message) || 'Unknown error');
      error.data = response.data;
      throw error;
    }
  });
}

/**
 * Format form data for AJAX submissions
 * @param {FormData|Object|string} formData - The form data to format
 * @returns {string} Formatted form data string
 */
function formatFormData(formData) {
  if (typeof formData === 'string') {
    return formData;
  }
  if (formData instanceof FormData) {
    var params = new URLSearchParams();
    var _iterator = _createForOfIteratorHelper(formData.entries()),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _step$value = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_step.value, 2),
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

/***/ }),

/***/ "./src/js/utils/dom.js":
/*!*****************************!*\
  !*** ./src/js/utils/dom.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addEventListenerOnce: () => (/* binding */ addEventListenerOnce),
/* harmony export */   closest: () => (/* binding */ closest),
/* harmony export */   createElement: () => (/* binding */ createElement),
/* harmony export */   createElementFromHTML: () => (/* binding */ createElementFromHTML),
/* harmony export */   findParentBySelector: () => (/* binding */ findParentBySelector),
/* harmony export */   forceElementVisibility: () => (/* binding */ forceElementVisibility),
/* harmony export */   insertAfter: () => (/* binding */ insertAfter),
/* harmony export */   removeElement: () => (/* binding */ removeElement),
/* harmony export */   toggleVisibility: () => (/* binding */ toggleVisibility)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");


/**
 * DOM utility functions for Product Estimator plugin
 *
 * Enhanced DOM manipulation utilities that combine the existing functionality
 * with additional helpers.
 */

/**
 * Create an element with attributes and children
 * @param {string} tag - Element tag name
 * @param {Object} attributes - Element attributes
 * @param {Array|string} children - Child elements or text
 * @returns {HTMLElement} Created element
 */
function createElement(tag) {
  var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var element = document.createElement(tag);

  // Set attributes
  Object.entries(attributes).forEach(function (_ref) {
    var _ref2 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref, 2),
      key = _ref2[0],
      value = _ref2[1];
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(function (_ref3) {
        var _ref4 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref3, 2),
          dataKey = _ref4[0],
          dataValue = _ref4[1];
        element.dataset[dataKey] = dataValue;
      });
    } else if (key === 'style' && (0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(value) === 'object') {
      Object.entries(value).forEach(function (_ref5) {
        var _ref6 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref5, 2),
          prop = _ref6[0],
          val = _ref6[1];
        element.style[prop] = val;
      });
    } else {
      element.setAttribute(key, value);
    }
  });

  // Add children
  if (typeof children === 'string') {
    element.textContent = children;
  } else if (Array.isArray(children)) {
    children.forEach(function (child) {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    });
  }
  return element;
}

/**
 * Create a HTML element from HTML string
 * @param {string} html - HTML string
 * @returns {HTMLElement} Created element
 */
function createElementFromHTML(html) {
  var div = document.createElement('div');
  div.innerHTML = html.trim();
  return div.firstChild;
}

/**
 * Find the closest ancestor matching a selector
 * @param {HTMLElement} element - Element to start from
 * @param {string} selector - CSS selector
 * @returns {HTMLElement|null} Matching ancestor or null
 */
function closest(element, selector) {
  if (element.closest) {
    return element.closest(selector);
  }

  // Polyfill for older browsers
  var current = element;
  while (current && current !== document) {
    if (current.matches(selector)) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

/**
 * Toggle element visibility
 * @param {HTMLElement} element - Element to toggle
 * @param {boolean} [show] - Whether to show or hide (if not provided, toggles current state)
 * @returns {boolean} New visibility state
 */
function toggleVisibility(element, show) {
  if (!element) return false;

  // If show parameter not provided, toggle based on current state
  var newState = show !== undefined ? show : element.style.display === 'none';
  element.style.display = newState ? '' : 'none';
  return newState;
}

/**
 * Force element visibility using multiple techniques
 * @param {HTMLElement} element - Element to make visible
 * @return {HTMLElement|null} The element for chaining or null if not found
 */
function forceElementVisibility(element) {
  if (!element) {
    console.error('Cannot show null element');
    return null;
  }

  // 1. Apply inline styles with !important to override any CSS rules
  element.style.cssText += 'display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important;';

  // 2. Remove any hiding classes
  ['hidden', 'hide', 'invisible', 'd-none', 'display-none'].forEach(function (cls) {
    if (element.classList.contains(cls)) {
      element.classList.remove(cls);
    }
  });

  // 3. Add visible classes (some frameworks use these)
  element.classList.add('visible', 'd-block');

  // 4. Ensure parent elements are also visible
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

  // 5. Use jQuery as a fallback if available
  if (typeof jQuery !== 'undefined') {
    jQuery(element).show();
  }
  return element;
}

/**
 * Find parent element by selector
 * @param {HTMLElement} element - Element to start search from
 * @param {string} selector - CSS selector to match
 * @returns {HTMLElement|null} The matching parent or null
 */
function findParentBySelector(element, selector) {
  return closest(element, selector);
}

/**
 * Insert element after a reference element
 * @param {HTMLElement} newElement - Element to insert
 * @param {HTMLElement} referenceElement - Element to insert after
 * @returns {HTMLElement} The inserted element
 */
function insertAfter(newElement, referenceElement) {
  if (!referenceElement || !referenceElement.parentNode) {
    throw new Error('Reference element must be in the DOM');
  }
  referenceElement.parentNode.insertBefore(newElement, referenceElement.nextSibling);
  return newElement;
}

/**
 * Remove element from DOM with optional animation
 * @param {HTMLElement} element - Element to remove
 * @param {boolean} animate - Whether to animate the removal
 * @returns {Promise} Promise that resolves when removal is complete
 */
function removeElement(element) {
  var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (!element) return Promise.resolve();
  if (!animate || !element.parentNode) {
    // Remove immediately if no animation or no parent
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
    return Promise.resolve();
  }

  // With animation
  return new Promise(function (resolve) {
    // First fade out
    element.style.transition = 'opacity 0.3s ease';
    element.style.opacity = '0';

    // Then remove after animation completes
    setTimeout(function () {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      resolve();
    }, 300);
  });
}

/**
 * Add event listener that only fires once
 * @param {HTMLElement} element - Element to add listener to
 * @param {string} eventType - Event type (e.g., 'click')
 * @param {Function} handler - Event handler
 * @param {boolean} useCapture - Whether to use capture phase
 */
function addEventListenerOnce(element, eventType, handler) {
  var useCapture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  if (!element) return;
  var _wrappedHandler = function wrappedHandler(e) {
    // Remove the event listener
    element.removeEventListener(eventType, _wrappedHandler, useCapture);
    // Call the original handler
    handler(e);
  };
  element.addEventListener(eventType, _wrappedHandler, useCapture);
}

/***/ }),

/***/ "./src/js/utils/format.js":
/*!********************************!*\
  !*** ./src/js/utils/format.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   debounce: () => (/* binding */ debounce),
/* harmony export */   formatDate: () => (/* binding */ formatDate),
/* harmony export */   formatPrice: () => (/* binding */ formatPrice),
/* harmony export */   objectToQueryString: () => (/* binding */ objectToQueryString),
/* harmony export */   sanitizeHTML: () => (/* binding */ sanitizeHTML),
/* harmony export */   throttle: () => (/* binding */ throttle),
/* harmony export */   truncateText: () => (/* binding */ truncateText)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");


function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/**
 * Formatting utilities for Product Estimator plugin
 *
 * Functions for formatting different types of data.
 */

/**
 * Format a price with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currencySymbol - Currency symbol
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted price
 */
function formatPrice(amount) {
  var currencySymbol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '$';
  var decimals = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
  // Handle undefined or null amount
  if (amount === undefined || amount === null) {
    return "".concat(currencySymbol, "0.00");
  }

  // Convert to number if it's a string
  var numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Check if it's a valid number
  if (isNaN(numAmount)) {
    return "".concat(currencySymbol, "0.00");
  }
  return currencySymbol + numAmount.toFixed(decimals);
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
function debounce(func) {
  var wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 300;
  var timeout;
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    var context = this;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      return func.apply(context, args);
    }, wait);
  };
}

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Milliseconds to limit invocation
 * @returns {Function} Throttled function
 */
function throttle(func) {
  var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 300;
  var lastCall = 0;
  return function () {
    var now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      return func.apply(this, args);
    }
  };
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
function sanitizeHTML(html) {
  if (!html) return '';

  // Use a temporary element to sanitize the HTML
  var temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

/**
 * Format a date according to locale preferences
 * @param {Date|string} date - Date to format or ISO string
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
function formatDate(date) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  // Default options
  var defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  // Merge options
  var formatOptions = _objectSpread(_objectSpread({}, defaultOptions), options);

  // Convert string to Date if needed
  var dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  // Format date according to locale
  return new Intl.DateTimeFormat(navigator.language, formatOptions).format(dateObj);
}

/**
 * Truncate text to a specific length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} ellipsis - Ellipsis string
 * @returns {string} Truncated text
 */
function truncateText(text) {
  var maxLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
  var ellipsis = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '...';
  if (!text) return '';
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Convert object to URL query string
 * @param {Object} obj - Object to convert
 * @returns {string} URL query string (without leading ?)
 */
function objectToQueryString(obj) {
  return Object.entries(obj).filter(function (_ref) {
    var _ref2 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_ref, 2),
      _ = _ref2[0],
      value = _ref2[1];
    return value !== undefined && value !== null;
  }).map(function (_ref3) {
    var _ref4 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_ref3, 2),
      key = _ref4[0],
      value = _ref4[1];
    if (Array.isArray(value)) {
      return value.map(function (val) {
        return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(val));
      }).join('&');
    }
    return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(value));
  }).join('&');
}

/***/ }),

/***/ "./src/js/utils/index.js":
/*!*******************************!*\
  !*** ./src/js/utils/index.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addEventListenerOnce: () => (/* binding */ addEventListenerOnce),
/* harmony export */   ajax: () => (/* reexport module object */ _ajax__WEBPACK_IMPORTED_MODULE_0__),
/* harmony export */   ajaxRequest: () => (/* binding */ ajaxRequest),
/* harmony export */   clearFieldError: () => (/* binding */ clearFieldError),
/* harmony export */   closest: () => (/* binding */ closest),
/* harmony export */   createElement: () => (/* binding */ createElement),
/* harmony export */   createElementFromHTML: () => (/* binding */ createElementFromHTML),
/* harmony export */   debounce: () => (/* binding */ debounce),
/* harmony export */   dom: () => (/* reexport module object */ _dom__WEBPACK_IMPORTED_MODULE_1__),
/* harmony export */   findParentBySelector: () => (/* binding */ findParentBySelector),
/* harmony export */   forceElementVisibility: () => (/* binding */ forceElementVisibility),
/* harmony export */   format: () => (/* reexport module object */ _format__WEBPACK_IMPORTED_MODULE_2__),
/* harmony export */   formatPrice: () => (/* binding */ formatPrice),
/* harmony export */   get: () => (/* binding */ get),
/* harmony export */   insertAfter: () => (/* binding */ insertAfter),
/* harmony export */   log: () => (/* binding */ log),
/* harmony export */   removeElement: () => (/* binding */ removeElement),
/* harmony export */   sanitizeHTML: () => (/* binding */ sanitizeHTML),
/* harmony export */   showFieldError: () => (/* binding */ showFieldError),
/* harmony export */   showNotice: () => (/* binding */ showNotice),
/* harmony export */   toggleVisibility: () => (/* binding */ toggleVisibility),
/* harmony export */   validateEmail: () => (/* binding */ validateEmail),
/* harmony export */   validateNumber: () => (/* binding */ validateNumber),
/* harmony export */   validateRequired: () => (/* binding */ validateRequired),
/* harmony export */   validation: () => (/* reexport module object */ _validation__WEBPACK_IMPORTED_MODULE_3__)
/* harmony export */ });
/* harmony import */ var _ajax__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ajax */ "./src/js/utils/ajax.js");
/* harmony import */ var _dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./dom */ "./src/js/utils/dom.js");
/* harmony import */ var _format__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./format */ "./src/js/utils/format.js");
/* harmony import */ var _validation__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./validation */ "./src/js/utils/validation.js");
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/**
 * Main utilities export file
 *
 * This module exports all utility functions from submodules,
 * providing a unified API while maintaining organization.
 */

// Import all utility modules





// Export individual modules for direct imports


// Export all utilities as named exports for backward compatibility
var ajaxRequest = _ajax__WEBPACK_IMPORTED_MODULE_0__.ajaxRequest,
  debounce = _ajax__WEBPACK_IMPORTED_MODULE_0__.debounce;

var createElement = _dom__WEBPACK_IMPORTED_MODULE_1__.createElement,
  createElementFromHTML = _dom__WEBPACK_IMPORTED_MODULE_1__.createElementFromHTML,
  closest = _dom__WEBPACK_IMPORTED_MODULE_1__.closest,
  toggleVisibility = _dom__WEBPACK_IMPORTED_MODULE_1__.toggleVisibility,
  forceElementVisibility = _dom__WEBPACK_IMPORTED_MODULE_1__.forceElementVisibility,
  findParentBySelector = _dom__WEBPACK_IMPORTED_MODULE_1__.findParentBySelector,
  insertAfter = _dom__WEBPACK_IMPORTED_MODULE_1__.insertAfter,
  removeElement = _dom__WEBPACK_IMPORTED_MODULE_1__.removeElement,
  addEventListenerOnce = _dom__WEBPACK_IMPORTED_MODULE_1__.addEventListenerOnce;

var formatPrice = _format__WEBPACK_IMPORTED_MODULE_2__.formatPrice,
  sanitizeHTML = _format__WEBPACK_IMPORTED_MODULE_2__.sanitizeHTML;

var validateEmail = _validation__WEBPACK_IMPORTED_MODULE_3__.validateEmail,
  validateNumber = _validation__WEBPACK_IMPORTED_MODULE_3__.validateNumber,
  validateRequired = _validation__WEBPACK_IMPORTED_MODULE_3__.validateRequired,
  showFieldError = _validation__WEBPACK_IMPORTED_MODULE_3__.showFieldError,
  clearFieldError = _validation__WEBPACK_IMPORTED_MODULE_3__.clearFieldError,
  showNotice = _validation__WEBPACK_IMPORTED_MODULE_3__.showNotice;

// Export a helper function for logging with conditional debug flag

function log(component) {
  var _window$productEstima;
  if ((_window$productEstima = window.productEstimatorVars) !== null && _window$productEstima !== void 0 && _window$productEstima.debug) {
    var _console;
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    (_console = console).log.apply(_console, ["[".concat(component, "]")].concat(args));
  }
}

// Export a convenience function to safely access nested properties
function get(obj, path) {
  var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var keys = path.split('.');
  var result = obj;
  var _iterator = _createForOfIteratorHelper(keys),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var key = _step.value;
      if (result === undefined || result === null) {
        return defaultValue;
      }
      result = result[key];
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return result === undefined ? defaultValue : result;
}

/***/ }),

/***/ "./src/js/utils/tinymce-preserver.js":
/*!*******************************************!*\
  !*** ./src/js/utils/tinymce-preserver.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   setupTinyMCEHTMLPreservation: () => (/* binding */ setupTinyMCEHTMLPreservation)
/* harmony export */ });
/**
 * Direct copy of the working setupWpEditors function as a utility
 */
function setupTinyMCEHTMLPreservation(editorIds) {
  var containerSelector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'body';
  var $ = jQuery;

  // Check if we're in the right container
  if ($(containerSelector).length === 0) {
    return;
  }
  console.log('Setting up rich text editors with <br> tag preservation');

  // Store original HTML content to restore after mode switches
  window._originalEditorContent = window._originalEditorContent || {};

  // Function to prepare content for the Visual editor
  // This specifically handles the <br> tag issue
  var prepareForVisualEditor = function prepareForVisualEditor(content) {
    // Ensure <br> tags are properly preserved by adding a marker
    // TinyMCE often strips solo <br> tags, so we add a zero-width space after them
    return content.replace(/<br\s*\/?>/gi, "<br>\u200B");
  };

  // Function to clean up content when retrieving from the Visual editor
  var cleanupFromVisualEditor = function cleanupFromVisualEditor(content) {
    // Remove any zero-width spaces we added
    return content.replace(/\u200B/g, '');
  };

  // Function to properly initialize TinyMCE with br tag preservation
  var initEditor = function initEditor(editorId) {
    if (!tinyMCE || !tinyMCE.get(editorId)) {
      return false;
    }
    var editor = tinyMCE.get(editorId);

    // Configure editor for HTML preservation
    editor.settings.wpautop = false;
    editor.settings.forced_root_block = '';
    editor.settings.valid_elements = '*[*]';
    editor.settings.entity_encoding = 'raw';
    editor.settings.verify_html = false;
    editor.settings.br_in_pre = false;

    // Additional BR specific settings
    editor.settings.keep_styles = true;
    editor.settings.remove_linebreaks = false;
    editor.settings.convert_newlines_to_brs = true;
    editor.settings.remove_redundant_brs = false;

    // Get raw content from textarea
    var $textarea = $("#".concat(editorId));
    if ($textarea.length) {
      var rawContent = $textarea.val();
      window._originalEditorContent[editorId] = rawContent;

      // Set the content in editor with our <br> preservation function
      setTimeout(function () {
        var preparedContent = prepareForVisualEditor(rawContent);
        editor.setContent(preparedContent, {
          format: 'raw'
        });
      }, 100);
    }

    // Add event listeners for content filtering

    // Process content before it's set in the editor
    editor.on('BeforeSetContent', function (e) {
      if (e.content) {
        // Process the content to preserve <br> tags
        e.content = prepareForVisualEditor(e.content);
      }

      // Store original content if this is initial load or switching from text mode
      if (e.initial || e.source_view) {
        window._originalEditorContent[editorId] = e.content;
      }
    });

    // Process content when it's retrieved from the editor
    editor.on('GetContent', function (e) {
      if (e.content) {
        // Clean up our marker characters
        e.content = cleanupFromVisualEditor(e.content);
      }
    });

    // Capture raw content when editor is initialized
    editor.on('init', function () {
      var content = editor.getContent({
        format: 'raw'
      });
      window._originalEditorContent[editorId] = cleanupFromVisualEditor(content);
      console.log("Editor ".concat(editorId, " initialized with content length: ").concat(content.length));
    });

    // Prevent content loss when switching modes
    var $tabButtons = $(".wp-editor-tabs button[data-wp-editor-id=\"".concat(editorId, "\"]"));
    $tabButtons.on('click', function () {
      var isTextMode = $(this).hasClass('switch-html');
      var isVisualMode = $(this).hasClass('switch-tmce');
      if (isTextMode) {
        // Switching to text mode - get content from visual editor first
        if (tinyMCE.get(editorId)) {
          var content = tinyMCE.get(editorId).getContent({
            format: 'raw'
          });
          var cleanContent = cleanupFromVisualEditor(content);
          window._originalEditorContent[editorId] = cleanContent;
          // Update the textarea directly with clean content
          $("#".concat(editorId)).val(cleanContent);
        }
      }
      if (isVisualMode) {
        // Switching to visual mode - restore original content after a delay
        setTimeout(function () {
          if (tinyMCE.get(editorId) && window._originalEditorContent[editorId]) {
            var preparedContent = prepareForVisualEditor(window._originalEditorContent[editorId]);
            tinyMCE.get(editorId).setContent(preparedContent, {
              format: 'raw'
            });
          }
        }, 100);
      }
    });
    console.log("Editor ".concat(editorId, " configured with <br> tag protection"));
    return true;
  };

  // Initialize editors
  var initEditors = function initEditors() {
    if (typeof tinyMCE !== 'undefined' && tinyMCE.editors) {
      var allInitialized = true;
      editorIds.forEach(function (id) {
        if (!initEditor(id)) {
          allInitialized = false;
        }
      });
      return allInitialized;
    }
    return false;
  };

  // Try to initialize immediately
  if (!initEditors()) {
    // If not successful, poll until ready
    var attempts = 0;
    var interval = setInterval(function () {
      attempts++;
      if (initEditors() || attempts > 20) {
        clearInterval(interval);
      }
    }, 300);
  }

  // Ensure text mode changes are stored
  editorIds.forEach(function (id) {
    $("#".concat(id)).on('input change', function () {
      window._originalEditorContent[id] = $(this).val();
    });
  });

  // Handle form submission to ensure HTML content is preserved
  $("".concat(containerSelector, " form")).off('submit.htmlPreservation').on('submit.htmlPreservation', function () {
    // Update all editor content before form submission
    editorIds.forEach(function (id) {
      var finalContent = '';

      // First try to get content from active editor (Visual or Text)
      if (tinyMCE.get(id) && tinyMCE.get(id).isHidden()) {
        // Text mode is active - get directly from textarea
        var $textarea = $("#".concat(id));
        if ($textarea.length) {
          finalContent = $textarea.val();
        }
      } else if (tinyMCE.get(id)) {
        // Visual mode is active - get from editor and clean up
        var content = tinyMCE.get(id).getContent({
          format: 'raw'
        });
        finalContent = cleanupFromVisualEditor(content);
      }

      // If no content found but we have stored content, use that
      if (!finalContent && window._originalEditorContent[id]) {
        finalContent = window._originalEditorContent[id];
      }

      // Update the textarea with final content
      if (finalContent) {
        $("#".concat(id)).val(finalContent);
        console.log("Form submission: Updated ".concat(id, " with content length: ").concat(finalContent.length));
      }
    });

    // Let the form submit normally
    return true;
  });
}

/***/ }),

/***/ "./src/js/utils/validation.js":
/*!************************************!*\
  !*** ./src/js/utils/validation.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearFieldError: () => (/* binding */ clearFieldError),
/* harmony export */   showFieldError: () => (/* binding */ showFieldError),
/* harmony export */   showNotice: () => (/* binding */ showNotice),
/* harmony export */   validateEmail: () => (/* binding */ validateEmail),
/* harmony export */   validateForm: () => (/* binding */ validateForm),
/* harmony export */   validateNumber: () => (/* binding */ validateNumber),
/* harmony export */   validateRequired: () => (/* binding */ validateRequired)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");

/**
 * Validation utilities for Product Estimator plugin
 *
 * Functions for validating inputs and displaying error messages.
 */

/**
 * Validates an email address
 *
 * @param {string} email - Email address to validate
 * @return {boolean} - Whether the email is valid
 */
function validateEmail(email) {
  if (!email) return false;
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Validates a number within specified bounds
 *
 * @param {number|string} value - Number to validate
 * @param {Object} options - Validation options
 * @param {number} [options.min] - Minimum allowed value
 * @param {number} [options.max] - Maximum allowed value
 * @param {boolean} [options.integer=false] - Whether the value must be an integer
 * @returns {boolean} Whether the number is valid
 */
function validateNumber(value) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var min = options.min,
    max = options.max,
    _options$integer = options.integer,
    integer = _options$integer === void 0 ? false : _options$integer;

  // Convert to number if string
  var num = typeof value === 'string' ? parseFloat(value) : value;

  // Check if it's a valid number
  if (isNaN(num)) {
    return false;
  }

  // Check if it's an integer when required
  if (integer && !Number.isInteger(num)) {
    return false;
  }

  // Check bounds
  if (min !== undefined && num < min) {
    return false;
  }
  if (max !== undefined && num > max) {
    return false;
  }
  return true;
}

/**
 * Validates that a value is not empty
 *
 * @param {*} value - Value to check
 * @returns {boolean} Whether the value is not empty
 */
function validateRequired(value) {
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim() !== '';
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
}

/**
 * Show field error
 *
 * @param {jQuery|HTMLElement} field - Field element
 * @param {string} message - Error message
 */
function showFieldError(field, message) {
  var $ = jQuery;
  if (!field) return;

  // Handle both jQuery object and DOM element
  var $field = field instanceof jQuery ? field : $(field);

  // Clear any existing error first
  clearFieldError($field);

  // Create error element
  var $error = $("<span class=\"field-error\">".concat(message, "</span>"));

  // Add it after the field
  $field.after($error);
  $field.addClass('error');
}

/**
 * Clear field error
 *
 * @param {jQuery|HTMLElement} field - Field element
 */
function clearFieldError(field) {
  var $ = jQuery;
  if (!field) return;

  // Handle both jQuery object and DOM element
  var $field = field instanceof jQuery ? field : $(field);
  $field.next('.field-error').remove();
  $field.removeClass('error');
}

/**
 * Shows an admin notice
 *
 * @param {string} message - Notice message
 * @param {string} type - Notice type (success/error)
 * @param {number} duration - Duration in ms before auto-dismissing
 */
function showNotice(message) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'success';
  var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5000;
  var $ = jQuery;
  if (!$) {
    // Fallback if jQuery not available
    alert(message);
    return;
  }
  var $notice = $("<div class=\"notice notice-".concat(type, " is-dismissible\"><p>").concat(message, "</p></div>"));

  // Try to find a good location to show the notice
  var $targetLocations = [$('.wrap h1'),
  // Admin page headers
  $('.product-estimator-form-container'),
  // Our form containers
  $('#wpbody-content') // WordPress admin content area
  ];
  var $target = null;

  // Find the first available target
  for (var i = 0; i < $targetLocations.length; i++) {
    if ($targetLocations[i].length) {
      $target = $targetLocations[i];
      break;
    }
  }
  if ($target) {
    $target.after($notice);
  } else {
    // Fallback - just prepend to body
    $('body').prepend($notice);
  }

  // Initialize WordPress dismissible notices
  if (window.wp && window.wp.notices) {
    window.wp.notices.init();
  } else {
    // Add close button manually if wp.notices is not available
    var $closeButton = $('<button type="button" class="notice-dismiss"><span class="screen-reader-text">Dismiss this notice.</span></button>');
    $notice.append($closeButton);
    $closeButton.on('click', function () {
      $notice.fadeOut(100, function () {
        $notice.remove();
      });
    });
  }

  // Auto-dismiss after specified duration
  setTimeout(function () {
    $notice.fadeOut(500, function () {
      return $notice.remove();
    });
  }, duration);
}

/**
 * Validates a form by checking all specified fields
 *
 * @param {HTMLFormElement|jQuery} form - Form to validate
 * @param {Object} validators - Map of field selectors to validator functions
 * @returns {boolean} Whether the form is valid
 */
function validateForm(form, validators) {
  var $ = jQuery;

  // Get jQuery object for the form
  var $form = form instanceof jQuery ? form : $(form);
  var isValid = true;

  // Process each validation rule
  Object.entries(validators).forEach(function (_ref) {
    var _ref2 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_ref, 2),
      selector = _ref2[0],
      validator = _ref2[1];
    var $field = $form.find(selector);
    if (!$field.length) return;

    // Get the field value
    var value = $field.val();

    // Run the validator function, which should return { valid: boolean, message: string }
    var result = validator(value, $field);
    if (!result.valid) {
      showFieldError($field, result.message);
      isValid = false;
    } else {
      clearFieldError($field);
    }
  });
  return isValid;
}

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
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
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
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!*************************!*\
  !*** ./src/js/admin.js ***!
  \*************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _admin_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./admin/index */ "./src/js/admin/index.js");

console.log('Product Estimator Admin initialized');
})();

/******/ })()
;
//# sourceMappingURL=product-estimator-admin.bundle.js.map