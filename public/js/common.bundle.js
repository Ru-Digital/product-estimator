"use strict";
(self["webpackChunkproduct_estimator"] = self["webpackChunkproduct_estimator"] || []).push([["common"],{

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

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

/***/ "./src/js/utils/ajax.js":
/*!******************************!*\
  !*** ./src/js/utils/ajax.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

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

/***/ "./src/js/utils/validation.js":
/*!************************************!*\
  !*** ./src/js/utils/validation.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

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

}]);
//# sourceMappingURL=common.bundle.js.map