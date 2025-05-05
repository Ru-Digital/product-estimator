/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _arrayWithoutHoles)
/* harmony export */ });
/* harmony import */ var _arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayLikeToArray.js */ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js");

function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return (0,_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(r);
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/iterableToArray.js":
/*!********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/iterableToArray.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _iterableToArray)
/* harmony export */ });
function _iterableToArray(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _nonIterableSpread)
/* harmony export */ });
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _toConsumableArray)
/* harmony export */ });
/* harmony import */ var _arrayWithoutHoles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayWithoutHoles.js */ "./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js");
/* harmony import */ var _iterableToArray_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterableToArray.js */ "./node_modules/@babel/runtime/helpers/esm/iterableToArray.js");
/* harmony import */ var _unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./unsupportedIterableToArray.js */ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js");
/* harmony import */ var _nonIterableSpread_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./nonIterableSpread.js */ "./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js");




function _toConsumableArray(r) {
  return (0,_arrayWithoutHoles_js__WEBPACK_IMPORTED_MODULE_0__["default"])(r) || (0,_iterableToArray_js__WEBPACK_IMPORTED_MODULE_1__["default"])(r) || (0,_unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(r) || (0,_nonIterableSpread_js__WEBPACK_IMPORTED_MODULE_3__["default"])();
}


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
/* harmony import */ var _babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");




function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/**
 * ConfirmationDialog.js
 *
 * Custom confirmation dialog component for Product Estimator plugin.
 * Replaces browser's built-in confirm() with a styled dialog.
 */
var ConfirmationDialog = /*#__PURE__*/function () {
  /**
   * Initialize the confirmation dialog
   */
  function ConfirmationDialog() {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__["default"])(this, ConfirmationDialog);
    this.dialog = null;
    this.backdropElement = null;
    this.initialized = false;
    this.callbacks = {
      confirm: null,
      cancel: null
    };

    // Initialize the dialog elements
    this.init();
  }

  /**
   * Initialize and create dialog DOM elements
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__["default"])(ConfirmationDialog, [{
    key: "init",
    value: function init() {
      // Don't initialize more than once
      if (this.initialized) return;

      // Create dialog elements
      this.createDialogElements();

      // Bind events
      this.bindEvents();
      this.initialized = true;
      if (productEstimatorVars && productEstimatorVars.debug) {
        // console.log('[ConfirmationDialog] Initialized');
      }
    }

    /**
     * Updates to ConfirmationDialog.js to fix the z-index issue
     * Replace the relevant sections in your ConfirmationDialog.js file
     */

    // In the createDialogElements method, add this code:
  }, {
    key: "createDialogElements",
    value: function createDialogElements() {
      // Create backdrop with higher z-index
      this.backdropElement = document.createElement('div');
      this.backdropElement.className = 'pe-dialog-backdrop';

      // Create dialog container with higher z-index
      this.dialog = document.createElement('div');
      this.dialog.className = 'pe-confirmation-dialog';
      this.dialog.setAttribute('role', 'dialog');
      this.dialog.setAttribute('aria-modal', 'true');

      // Create dialog content
      this.dialog.innerHTML = "\n    <div class=\"dialog-content\">\n      <div class=\"pe-dialog-header\">\n        <h3 class=\"pe-dialog-title\">Confirm Action</h3>\n        <button type=\"button\" class=\"pe-dialog-close\" aria-label=\"Close\">\n          <span aria-hidden=\"true\">&times;</span>\n        </button>\n      </div>\n      <div class=\"pe-dialog-body\">\n        <p class=\"pe-dialog-message\">Are you sure you want to proceed?</p>\n      </div>\n      <div class=\"pe-dialog-footer\">\n        <button type=\"button\" class=\"pe-dialog-btn pe-dialog-cancel\">Cancel</button>\n        <button type=\"button\" class=\"pe-dialog-btn pe-dialog-confirm\">Confirm</button>\n      </div>\n    </div>\n  ";

      // Important: Append to document.body AFTER removing any existing elements
      var existingBackdrop = document.querySelector('.pe-dialog-backdrop');
      var existingDialog = document.querySelector('.pe-confirmation-dialog');
      if (existingBackdrop) existingBackdrop.remove();
      if (existingDialog) existingDialog.remove();

      // Append fresh elements to body
      document.body.appendChild(this.backdropElement);
      document.body.appendChild(this.dialog);
    }

    /**
     * Bind events to dialog elements
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this = this;
      // Get elements
      var closeBtn = this.dialog.querySelector('.pe-dialog-close');
      var cancelBtn = this.dialog.querySelector('.pe-dialog-cancel');
      var confirmBtn = this.dialog.querySelector('.pe-dialog-confirm');

      // Close button - prevent event propagation
      closeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        _this.hide();
        if (typeof _this.callbacks.cancel === 'function') {
          _this.callbacks.cancel();
        }
      });

      // Cancel button - prevent event propagation
      cancelBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        _this.hide();
        if (typeof _this.callbacks.cancel === 'function') {
          _this.callbacks.cancel();
        }
      });

      // Confirm button - prevent event propagation
      confirmBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        _this.hide();
        if (typeof _this.callbacks.confirm === 'function') {
          _this.callbacks.confirm();
        }
      });

      // Backdrop click - with better event handling
      this.backdropElement.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.target === _this.backdropElement) {
          _this.hide();
          if (typeof _this.callbacks.cancel === 'function') {
            _this.callbacks.cancel();
          }
        }
      });

      // Prevent clicks inside dialog from propagating to modal
      this.dialog.addEventListener('click', function (e) {
        e.stopPropagation();
      });

      // Escape key
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && _this.isVisible()) {
          e.preventDefault();
          e.stopPropagation();
          _this.hide();
          if (typeof _this.callbacks.cancel === 'function') {
            _this.callbacks.cancel();
          }
        }
      });
    }
  }, {
    key: "show",
    value: function show() {
      var _window$productEstima,
        _this2 = this;
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      // Get text from localized strings if available
      var i18n = ((_window$productEstima = window.productEstimatorVars) === null || _window$productEstima === void 0 ? void 0 : _window$productEstima.i18n) || {};
      var defaults = {
        title: 'Confirm Action',
        message: 'Are you sure you want to proceed?',
        type: '',
        // product, room, estimate
        confirmText: i18n.confirm || 'Confirm',
        cancelText: i18n.cancel || 'Cancel',
        onConfirm: null,
        onCancel: null,
        action: 'delete',
        showCancel: true // New option to control cancel button visibility
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
      if (titleEl) titleEl.textContent = settings.title;
      if (messageEl) messageEl.textContent = settings.message;
      if (confirmEl) confirmEl.textContent = settings.confirmText;

      // Handle cancel button visibility
      if (cancelEl) {
        if (settings.showCancel) {
          cancelEl.style.display = '';
          cancelEl.textContent = settings.cancelText;
        } else {
          cancelEl.style.display = 'none';

          // When cancel button is hidden, make confirm button full width
          if (confirmEl) {
            confirmEl.style.width = '100%';
          }
        }
      }

      // Remove all type classes
      this.dialog.classList.remove('pe-dialog-type-product', 'pe-dialog-type-room', 'pe-dialog-type-estimate', 'pe-dialog-notification');
      (0,_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__["default"])(this.dialog.classList).forEach(function (className) {
        if (/^pe-dialog-action-/.test(className)) {
          _this2.dialog.classList.remove(className);
        }
      });

      // Add type class if specified
      if (settings.type) {
        this.dialog.classList.add("pe-dialog-type-".concat(settings.type));
      }
      if (settings.action) {
        this.dialog.classList.add("pe-dialog-action-".concat(settings.action));
      }

      // Add notification class if it's a success notification
      if (!settings.showCancel && settings.type === 'estimate') {
        this.dialog.classList.add('pe-dialog-notification');
      }

      // Show the dialog - force it to the front
      if (this.backdropElement) this.backdropElement.style.display = 'block';
      if (this.dialog) this.dialog.style.display = 'block';

      // Add active class for animation
      if (this.dialog) this.dialog.classList.add('active');

      // Focus the appropriate button
      setTimeout(function () {
        var buttonToFocus = settings.showCancel ? _this2.dialog.querySelector('.pe-dialog-cancel') : _this2.dialog.querySelector('.pe-dialog-confirm');
        if (buttonToFocus) buttonToFocus.focus();
      }, 100);
    }

    /**
     * Hide the dialog
     */
  }, {
    key: "hide",
    value: function hide() {
      if (this.backdropElement) this.backdropElement.style.display = 'none';
      if (this.dialog) {
        this.dialog.classList.remove('active');
        this.dialog.style.display = 'none';
      }
    }

    /**
     * Check if dialog is visible
     * @return {boolean} Whether dialog is visible
     */
  }, {
    key: "isVisible",
    value: function isVisible() {
      return this.dialog && this.dialog.style.display === 'block';
    }

    /**
     * Log debug messages
     * @param {...any} args - Arguments to log
     */
  }, {
    key: "log",
    value: function log() {
      if (productEstimatorVars && productEstimatorVars.debug) {
        var _console;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        (_console = console).log.apply(_console, ['[ConfirmationDialog]'].concat(args));
      }
    }
  }]);
}(); // Export a singleton instance
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
/* harmony import */ var _CustomerStorage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./CustomerStorage */ "./src/js/frontend/CustomerStorage.js");
/* harmony import */ var _DataService__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./DataService */ "./src/js/frontend/DataService.js");


/**
 * CustomerDetailsManager.js
 *
 * Module for handling customer details editing and deletion in the Product Estimator.
 * Follows the ES6 module architecture used in the project.
 */

 // Import the new functions

var CustomerDetailsManager = /*#__PURE__*/function () {
  /**
   * Initialize the CustomerDetailsManager
   * @param {Object} config - Configuration options
   * @param {DataService} dataService - The data service instance
   */
  function CustomerDetailsManager() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var dataService = arguments.length > 1 ? arguments[1] : undefined;
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

    // Store reference to data service
    this.dataService = dataService;

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
        this.log('CustomerDetailsManager already initialized');
        return this;
      }

      // Bind events
      this.bindEvents();

      // Add a custom event listener for customer details updates from other sources
      document.addEventListener('customer_details_updated', this.onCustomerDetailsUpdated.bind(this));
      this.initialized = true;
      this.log('CustomerDetailsManager initialized');
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
        this.log('Received customer_details_updated event', event.detail);
        // Update the display with the new details
        this.updateDisplayedDetails(event.detail.details);

        // Check if email was added and update forms
        this.checkAndUpdateEmailField(event.detail.details);
      }
    }

    /**
     * Check if email was added and update the form accordingly
     * @param {Object} details - The updated customer details
     */
  }, {
    key: "checkAndUpdateEmailField",
    value: function checkAndUpdateEmailField(details) {
      var _this = this;
      var hasEmail = details && details.email && details.email.trim() !== '';
      this.log("Checking for email field updates: hasEmail=".concat(hasEmail));

      // If the edit form is already visible, update it
      var editForms = document.querySelectorAll(this.config.selectors.editForm);
      editForms.forEach(function (editForm) {
        // Check if email field already exists
        var emailField = editForm.querySelector('#edit-customer-email');

        // If email field doesn't exist but we have an email, add it
        if (!emailField && hasEmail) {
          _this.log('Adding email field to edit form');

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

        // Update other fields if they exist
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

      // Update data-has-email attribute on any new estimate forms
      var newEstimateForms = document.querySelectorAll('#new-estimate-form');
      newEstimateForms.forEach(function (form) {
        form.setAttribute('data-has-email', hasEmail ? 'true' : 'false');
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
        this.log('Edit button not found, skipping event binding');
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

      // this.log('Customer details events bound');
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
      this.log('Edit form displayed');
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
      this.log('Edit form hidden');
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
        _this2 = this;
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
        (0,_CustomerStorage__WEBPACK_IMPORTED_MODULE_2__.saveCustomerDetails)(updatedDetails); // Use the imported function
        this.log('Customer details saved to localStorage:', updatedDetails);

        // 2. Now, send the update to the server asynchronously using DataService
        this.dataService.request('update_customer_details', {
          details: JSON.stringify(updatedDetails)
        }).then(function (data) {
          // Handle successful server update
          _this2.log('Customer details updated on server successfully:', data);
          _this2.handleSaveSuccess(data, updatedDetails); // Call success handler with server response data and updated details
        })["catch"](function (error) {
          // Handle server update error
          _this2.handleSaveError(error); // Show error message
          // Note: Details are already saved locally, so we don't revert local storage on server error.
        })["finally"](function () {
          // This block runs after both success or error of the AJAX request
          saveButton.textContent = originalText;
          saveButton.disabled = false;
        });
      } catch (localStorageError) {
        // Handle synchronous local storage save error
        this.log('Error saving to localStorage using imported function:', localStorageError);
        this.showError('Could not save details locally.'); // Show local storage error
        // We still attempt server save even if local save fails
        this.dataService.request('update_customer_details', {
          details: JSON.stringify(updatedDetails)
        }).then(function (data) {
          // Handle successful server update even after local failure
          _this2.log('Customer details updated on server successfully (after local storage error):', data);
          _this2.handleSaveSuccess(data, updatedDetails); // Call success handler
        })["catch"](function (error) {
          // Handle server update error after local failure
          _this2.handleSaveError(error); // Show server error message
        })["finally"](function () {
          // This block runs after both success or error of the AJAX request
          saveButton.textContent = originalText;
          saveButton.disabled = false;
        });
      }
    }

    /**
     * Handle successful save response
     * @param {Object} data - Response data
     * @param {Object} updatedDetails - The details that were updated
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
      this.log('Customer details updated successfully', data);
    }

    /**
     * Handle save error
     * @param {Error} error - The error that occurred
     */
  }, {
    key: "handleSaveError",
    value: function handleSaveError(error) {
      this.showMessage('error', error.message || 'Error updating details. Please try again.');
      this.log('Error saving customer details:', error);
    }

    /**
     * Handle delete button click
     * @param {Event} e - Click event
     */
  }, {
    key: "handleDeleteClick",
    value: function handleDeleteClick(e) {
      var _this3 = this;
      e.preventDefault();
      e.stopPropagation();

      // Use the confirmation dialog if available
      if (window.productEstimator && window.productEstimator.dialog) {
        window.productEstimator.dialog.show({
          title: this.config.i18n && this.config.i18n.delete_customer_details || 'Delete Customer Details',
          message: this.config.i18n && this.config.i18n.confirm_delete_details || 'Are you sure you want to delete your saved details?',
          confirmText: this.config.i18n && this.config.i18n["delete"] || 'Delete',
          action: 'delete',
          cancelText: this.config.i18n.cancel || 'Cancel',
          onConfirm: function onConfirm() {
            _this3.deleteCustomerDetails();
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
      var _this4 = this;
      // Get the customer details confirmation container
      var confirmationContainer = document.querySelector('.customer-details-confirmation');
      if (confirmationContainer) {
        confirmationContainer.classList.add('loading');
      }

      // Use the imported clearCustomerDetails function
      try {
        (0,_CustomerStorage__WEBPACK_IMPORTED_MODULE_2__.clearCustomerDetails)(); // Clear using imported function
        this.log('Customer details removed from localStorage using imported function'); // Log the success
        this.handleDeleteSuccess({
          message: "Details deleted successfully from local storage"
        }, confirmationContainer);
      } catch (e) {
        this.log('localStorage error on delete using imported function', e); // Log any error
      }

      // Use the dataService to make the AJAX request if available
      if (this.dataService && typeof this.dataService.request === 'function') {
        this.dataService.request('delete_customer_details').then(function (data) {
          _this4.handleDeleteSuccess(data, confirmationContainer);
        })["catch"](function (error) {
          _this4.handleDeleteError(error, confirmationContainer);
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
            _this4.handleDeleteSuccess(response.data, confirmationContainer);
          } else {
            var _response$data;
            _this4.handleDeleteError(new Error(((_response$data = response.data) === null || _response$data === void 0 ? void 0 : _response$data.message) || 'Error deleting details'), confirmationContainer);
          }
        })["catch"](function (error) {
          _this4.handleDeleteError(error, confirmationContainer);
        });
      }
    }

    /**
     * Handle successful delete response
     * @param {Object} data - Response data
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
      this.log('Customer details deleted');
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
      this.log('Error deleting details:', error);

      // Remove loading class
      if (confirmationContainer) {
        confirmationContainer.classList.remove('loading');
      }
    }

    /**
     * Update the displayed customer details in the DOM
     * @param {Object} details - The updated details
     */
  }, {
    key: "updateDisplayedDetails",
    value: function updateDisplayedDetails(details) {
      var detailsContainers = document.querySelectorAll(this.config.selectors.detailsContainer);
      if (!detailsContainers.length) {
        this.log('No customer details containers found for updating');
        return;
      }
      this.log("Updating ".concat(detailsContainers.length, " customer details containers"));
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

    /**
     * Log debug messages
     * @param {...any} args - Arguments to log
     */
  }, {
    key: "log",
    value: function log() {
      if (this.config.debug) {
        var _console;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        (_console = console).log.apply(_console, ['[CustomerDetailsManager]'].concat(args));
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
/**
 * CustomerStorage.js
 *
 * Handles customer details persistence using localStorage and sessionStorage.
 * Uses the 'productEstimatorCustomerData' key for storage.
 */

var STORAGE_KEY = 'productEstimatorCustomerData';

/**
 * Load customer details from localStorage with fallback to sessionStorage.
 * @returns {Object} Customer details object.
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
    console.error('Error loading customer details:', error);
    return {}; // Return empty object on error
  }
}

/**
 * Save customer details to localStorage with fallback to sessionStorage.
 * @param {Object} details - Customer details to save.
 */
function saveCustomerDetails(details) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
  } catch (localStorageError) {
    console.warn('localStorage not available, using sessionStorage:', localStorageError);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(details));
    } catch (sessionStorageError) {
      console.error('sessionStorage not available:', sessionStorageError);
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
    console.warn('localStorage not available:', localStorageError);
  }
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (sessionStorageError) {
    console.warn('sessionStorage not available:', sessionStorageError);
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
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _EstimateStorage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./EstimateStorage */ "./src/js/frontend/EstimateStorage.js");



function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/**
 * DataService.js
 *
 * Centralized service for all AJAX operations in the Product Estimator plugin.
 * Provides a clean API for data operations and handles errors consistently.
 */

 // Import necessary functions from storage
var DataService = /*#__PURE__*/function () {
  /**
   * Initialize the DataService
   * @param {Object} config - Configuration options
   */
  function DataService() {
    var _window$productEstima, _window$productEstima2, _window$productEstima3;
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__["default"])(this, DataService);
    // Check for existing instance
    if (window._dataServiceInstance) {
      console.log('Using existing DataService instance');
      // Return existing instance to ensure singleton
      return window._dataServiceInstance;
    }
    this.config = Object.assign({
      debug: false,
      ajaxUrl: ((_window$productEstima = window.productEstimatorVars) === null || _window$productEstima === void 0 ? void 0 : _window$productEstima.ajax_url) || '/wp-admin/admin-ajax.php',
      nonce: ((_window$productEstima2 = window.productEstimatorVars) === null || _window$productEstima2 === void 0 ? void 0 : _window$productEstima2.nonce) || '',
      i18n: ((_window$productEstima3 = window.productEstimatorVars) === null || _window$productEstima3 === void 0 ? void 0 : _window$productEstima3.i18n) || {}
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
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__["default"])(DataService, [{
    key: "request",
    value: function request(action) {
      var _this = this;
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      this.log("Making request to '".concat(action, "'"), data);
      return new Promise(function (resolve, reject) {
        var formData = new FormData();

        // Add required fields
        formData.append('action', action);
        formData.append('nonce', _this.config.nonce);

        // Add all other data
        Object.entries(data).forEach(function (_ref) {
          var _ref2 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_ref, 2),
            key = _ref2[0],
            value = _ref2[1];
          // Skip null or undefined values
          if (value === null || value === undefined) {
            return;
          }

          // Ensure all values are converted to strings for consistent server-side handling
          formData.append(key, String(value));
        });

        // Debug the request data
        if (_this.config.debug) {
          console.log('Request details:', {
            url: _this.config.ajaxUrl,
            action: action,
            nonce: _this.config.nonce,
            data: Object.fromEntries(formData)
          });
        }
        fetch(_this.config.ajaxUrl, {
          method: 'POST',
          credentials: 'same-origin',
          body: formData
        }).then(function (response) {
          if (!response.ok) {
            // Log more details about the failed response
            console.error("Network response error (".concat(response.status, "): ").concat(response.statusText));
            throw new Error("Network response was not ok: ".concat(response.status));
          }
          return response.json();
        }).then(function (response) {
          if (response.success) {
            _this.log("Request '".concat(action, "' succeeded:"), response.data);
            resolve(response.data);
          } else {
            var _response$data;
            var error = new Error(((_response$data = response.data) === null || _response$data === void 0 ? void 0 : _response$data.message) || 'Unknown error');
            error.data = response.data;
            _this.log("Request '".concat(action, "' failed:"), error);
            reject(error);
          }
        })["catch"](function (error) {
          _this.log("Request '".concat(action, "' error:"), error);
          // Create a more informative error that won't cause null.prepend errors
          var enhancedError = new Error("AJAX request failed: ".concat(error.message));
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
  }, {
    key: "checkEstimatesExist",
    value: function checkEstimatesExist() {
      var bypassCache = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      return this.request('check_estimates_exist').then(function (data) {
        return !!data.has_estimates;
      });
    }

    /**
     * Addmethod to consistently bind the Create Estimate button event
     */
  }, {
    key: "bindCreateEstimateButton",
    value: function bindCreateEstimateButton() {
      var _this2 = this;
      // Find the button in the DOM
      var createButton = this.modal.querySelector('#create-estimate-btn');
      if (createButton) {
        console.log('Found Create Estimate button, binding event handler');

        // Remove any existing event handlers to prevent duplication
        if (this._createEstimateBtnHandler) {
          createButton.removeEventListener('click', this._createEstimateBtnHandler);
        }

        // Create and store a new handler
        this._createEstimateBtnHandler = function (e) {
          e.preventDefault();
          console.log('Create Estimate button clicked');
          _this2.showNewEstimateForm();
        };

        // Add the new handler
        createButton.addEventListener('click', this._createEstimateBtnHandler);
      }
    }

    /**
     * Update getEstimatesList method to bind the Create Estimate button
     * after loading the list
     */
  }, {
    key: "getEstimatesList",
    value: function getEstimatesList() {
      var _this3 = this;
      var bypassCache = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      if (!bypassCache && this.cache.estimatesList) {
        this.log('Returning cached estimates list');

        // Even when using cache, we need to bind the button
        setTimeout(function () {
          return _this3.bindCreateEstimateButton();
        }, 100);
        return Promise.resolve(this.cache.estimatesList);
      }
      return this.request('get_estimates_list').then(function (data) {
        _this3.cache.estimatesList = data.html;

        // After loading new content, bind the button
        setTimeout(function () {
          return _this3.bindCreateEstimateButton();
        }, 100);
        return data.html;
      });
    }

    /**
     * Get all estimates data for dropdowns
     * @param {boolean} bypassCache - Whether to bypass the cache
     * @returns {Promise<Array>} Array of estimate objects
     */
  }, {
    key: "getEstimatesData",
    value: function getEstimatesData() {
      var _this4 = this;
      var bypassCache = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      if (!bypassCache && this.cache.estimatesData) {
        this.log('Returning cached estimates data');
        return Promise.resolve(this.cache.estimatesData);
      }
      return this.request('get_estimates_data').then(function (data) {
        _this4.cache.estimatesData = data.estimates;
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
  }, {
    key: "getRoomsForEstimate",
    value: function getRoomsForEstimate(estimateId) {
      var _this5 = this;
      var productId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var bypassCache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var cacheKey = "estimate_".concat(estimateId);
      if (!bypassCache && this.cache.rooms[cacheKey]) {
        this.log("Returning cached rooms for estimate ".concat(estimateId));
        return Promise.resolve(this.cache.rooms[cacheKey]);
      }
      return this.request('get_rooms_for_estimate', {
        estimate_id: estimateId,
        product_id: productId || ''
      }).then(function (data) {
        _this5.cache.rooms[cacheKey] = data;
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
  }, {
    key: "addProductToRoom",
    value: function addProductToRoom(roomId, productId) {
      var _this6 = this;
      var estimateId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      console.log('DataService: Adding product to room', {
        roomId: roomId,
        productId: productId,
        estimateId: estimateId
      });

      // Get the existing estimate data to find room dimensions for the local storage update
      var existingData = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_3__.loadEstimateData)();
      var estimate = existingData.estimates ? existingData.estimates[estimateId] : null;
      var room = estimate && estimate.rooms ? estimate.rooms[roomId] : null;
      var roomWidth = null;
      var roomLength = null;
      if (room) {
        roomWidth = room.width;
        roomLength = room.length;
      } else {
        console.warn("Room ID ".concat(roomId, " not found in local storage for estimate ").concat(estimateId, ". Cannot get dimensions for local product data."));
      }

      // === START: Fetch comprehensive product data for local storage immediately ===
      // Use a nested promise chain or async/await if available to fetch data first
      // For now, we'll use a promise chain to align with existing structure

      this.request('get_product_data_for_storage', {
        product_id: productId,
        room_width: roomWidth,
        // Pass dimensions to the new endpoint
        room_length: roomLength // Pass dimensions to the new endpoint
      }).then(function (productDataResponse) {
        console.log('DataService: Fetched comprehensive product data for storage:', productDataResponse);
        if (!productDataResponse.product_data) {
          throw new Error('Failed to get comprehensive product data from server.');
        }
        var comprehensiveProductData = productDataResponse.product_data;

        // Use the addProductToRoom function from EstimateStorage to add the product to the specified room
        // Note: This expects the EstimateStorage addProductToRoom to find the correct estimate and room by their IDs
        try {
          var success = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_3__.addProductToRoom)(estimateId, roomId, comprehensiveProductData);
          if (success) {
            _this6.log("Product ID ".concat(productId, " successfully added to room ").concat(roomId, " in localStorage with comprehensive data."));
          } else {
            console.warn("Failed to add product ID ".concat(productId, " to room ").concat(roomId, " in localStorage."));
            // Decide how to handle local storage failure - maybe still proceed with server request?
            // For now, we'll proceed with the server request even if local storage fails.
          }
        } catch (e) {
          console.error("Error adding comprehensive product ID ".concat(productId, " to room ").concat(roomId, " in localStorage:"), e);
          // Decide how to handle local storage failure - maybe still proceed with server request?
          // For now, we'll proceed with the server request even if local storage fails.
        }
      })["catch"](function (error) {
        console.error('DataService: Error fetching comprehensive product data for storage:', error);
        // If fetching data for local storage fails, reject the entire promise chain
        throw error; // Re-throw to allow handling upstream (e.g., in ModalManager)
      });

      // === END: Add product data to the room in local storage immediately ===

      // Now, make the original AJAX request to the server to add the product to the session/database
      var requestData = {
        room_id: roomId,
        product_id: productId
      };

      // Include estimate ID if provided to ensure correct room selection
      if (estimateId !== null) {
        requestData.estimate_id = estimateId;
      }

      // This is the original AJAX call that was selected
      return this.request('add_product_to_room', requestData).then(function (data) {
        console.log('DataService: Product added successfully (server response)', data);

        // Invalidate caches since we modified data
        _this6.invalidateCache();
        return data; // Return the server response data
      })["catch"](function (error) {
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
  }, {
    key: "replaceProductInRoom",
    value: function replaceProductInRoom(estimateId, roomId, oldProductId, newProductId, parentProductId) {
      var _this7 = this;
      var replaceType = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'main';
      console.log('DataService: Initiating product replacement request', {
        estimateId: estimateId,
        roomId: roomId,
        oldProductId: oldProductId,
        newProductId: newProductId,
        parentProductId: parentProductId,
        // Log parent product ID
        replaceType: replaceType
      });
      var storedData = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_3__.loadEstimateData)();
      var roomWidth = null;
      var roomLength = null;
      if (storedData && storedData.estimates && storedData.estimates[estimateId]) {
        var estimate = storedData.estimates[estimateId];

        // Check if the estimate has rooms and the specific room exists
        if (estimate.rooms && estimate.rooms[roomId]) {
          var room = estimate.rooms[roomId];

          // Extract width and length
          roomWidth = room.width;
          roomLength = room.length;
          console.log("Room ".concat(roomId, " in Estimate ").concat(estimateId, " has dimensions: Width = ").concat(roomWidth, ", Length = ").concat(roomLength));
        } else {
          console.warn("Room with ID ".concat(roomId, " not found in estimate ").concat(estimateId, "."));
        }
      } else {
        console.warn("Estimate with ID ".concat(estimateId, " not found in localStorage."));
      }
      this.request('get_product_data_for_storage', {
        product_id: newProductId,
        room_width: roomWidth,
        // Pass dimensions to the new endpoint
        room_length: roomLength // Pass dimensions to the new endpoint
      }).then(function (productDataResponse) {
        console.log('DataService: Fetched comprehensive product data for storage:', productDataResponse);
        if (!productDataResponse.product_data) {
          throw new Error('Failed to get comprehensive product data from server.');
        }
        var comprehensiveProductData = productDataResponse.product_data;
        try {
          var success = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_3__.replaceProductInRoom)(estimateId, roomId, oldProductId, newProductId, comprehensiveProductData, replaceType, parentProductId);
          if (success) {
            _this7.log("Product ID ".concat(newProductId, " successfully added to room ").concat(roomId, " in localStorage with comprehensive data."));
          } else {
            console.warn("Product replacement (old ID ".concat(oldProductId, ") failed in localStorage for room ").concat(roomId, ". Product not found?"));
            // Decide how to handle local storage failure - maybe still proceed with server request?
            // For now, we'll proceed with the server request even if local storage fails.
          }
        } catch (e) {
          console.error("Error performing local storage product replacement for room ".concat(roomId, ":"), e);
          // Decide how to handle local storage failure - maybe still proceed with server request?
          // For now, we'll proceed with the server request even if local storage fails.
        }
      })["catch"](function (error) {
        console.error('DataService: Error fetching comprehensive product data for storage:', error);
        // If fetching data for local storage fails, reject the entire promise chain
        throw error; // Re-throw to allow handling upstream (e.g., in ModalManager)
      });
      var requestData = {
        estimate_id: estimateId,
        room_id: roomId,
        product_id: newProductId,
        // The ID of the new product
        replace_product_id: oldProductId,
        // The ID of the product being replaced
        replace_type: replaceType // Send the replacement type to the server
      };

      // Include parent product ID if available
      if (parentProductId !== null) {
        requestData.parent_product_id = parentProductId;
      }

      // Use the generic request method for the AJAX call
      return this.request('replace_product_in_room', requestData).then(function (data) {
        console.log('DataService: Product replacement successful (server response)', data);
        // Invalidate caches since we modified data on the server
        _this7.invalidateCache();
        return data; // Return the server response data
      })["catch"](function (error) {
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
  }, {
    key: "addNewEstimate",
    value: function addNewEstimate(formData) {
      var _this8 = this;
      var productId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var requestData = {
        form_data: this.formatFormData(formData)
      };
      if (productId) {
        requestData.product_id = productId;
      }
      var estimateName = formData instanceof FormData ? formData.get('estimate_name') : formData.estimate_name || 'Unnamed Estimate';
      var existingData = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_3__.loadEstimateData)();
      var existingEstimates = existingData.estimates || {};
      var nextSequentialId = Object.keys(existingEstimates).length; // Use the count of existing estimates as the next ID

      // Create a basic estimate object for local storage with the sequential ID
      var clientSideEstimateData = {
        id: String(nextSequentialId),
        // Ensure ID is a string for consistency with potential server IDs
        name: estimateName,
        rooms: {} // Start with an empty rooms object
        // Add any other default properties needed for a new estimate client-side
      };
      var clientSideEstimateId = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_3__.addEstimate)(clientSideEstimateData);
      this.log("Client-side estimate saved to localStorage with sequential ID: ".concat(clientSideEstimateId));
      return this.request('add_new_estimate', requestData).then(function (data) {
        // Invalidate caches since we modified data
        _this8.invalidateCache();
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
  }, {
    key: "addNewRoom",
    value: function addNewRoom(formData, estimateId) {
      var _this9 = this;
      var productId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      console.log('DataService: Adding new room', {
        estimateId: estimateId,
        productId: productId,
        formData: formData instanceof FormData ? Object.fromEntries(formData) : formData
      });
      var existingData = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_3__.loadEstimateData)();
      var estimate = existingData.estimates ? existingData.estimates[estimateId] : null;
      var clientSideRoomId = String(Object.keys(estimate.rooms).length);
      var roomWidth = parseFloat(formData instanceof FormData ? formData.get('room_width') : formData.room_width) || 0;
      var roomLength = parseFloat(formData instanceof FormData ? formData.get('room_length') : formData.room_length) || 0;
      var newRoomData = {
        id: clientSideRoomId,
        // Use the client-side ID for local storage
        name: formData instanceof FormData ? formData.get('room_name') || 'Unnamed Room' : formData.room_name || 'Unnamed Room',
        // Get name from form data
        width: roomWidth,
        // Add width from form data
        length: roomLength,
        // Add length from form data
        products: [],
        // New rooms start with no products
        min_total: 0,
        // Initialize min_total to 0
        max_total: 0 // Initialize max_total to 0
      };

      // Add the new room data to local storage for the specified estimate immediately
      (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_3__.addRoom)(estimateId, newRoomData);
      this.log("Room ID ".concat(newRoomData.id, " added to localStorage for estimate ").concat(estimateId));
      if (productId) {
        // Create a minimal product data object with just the ID
        // In a real scenario, you might fetch more details here if needed for local display
        var minimalProductData = {
          id: String(productId) // Ensure product ID is a string for consistency
          // Add other minimal properties if necessary for local display, e.g., name: 'Product ' + productId
        };
        try {
          // Use the addProductToRoom function from EstimateStorage to add the product to the newly added room
          var success = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_3__.addProductToRoom)(estimateId, clientSideRoomId, minimalProductData);
          if (success) {
            this.log("Product ID ".concat(productId, " successfully added to room ").concat(clientSideRoomId, " in localStorage."));
          } else {
            console.warn("Failed to add product ID ".concat(productId, " to room ").concat(clientSideRoomId, " in localStorage."));
          }
        } catch (e) {
          console.error("Error adding product ID ".concat(productId, " to room ").concat(clientSideRoomId, " in localStorage:"), e);
        }
      }
      var requestData = {
        form_data: this.formatFormData(formData),
        estimate_id: estimateId
      };
      if (productId) {
        requestData.product_id = productId;
      }

      // Use the generic request method for the AJAX call
      return this.request('add_new_room', requestData).then(function (data) {
        // Log success for debugging
        console.log('DataService: Room added successfully', data);

        // Invalidate caches since we modified data
        _this9.invalidateCache();
        return data;
      })["catch"](function (error) {
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
  }, {
    key: "removeProductFromRoom",
    value: function removeProductFromRoom(estimateId, roomId, productIndex) {
      var _this10 = this;
      try {
        var success = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_3__.removeProductFromRoom)(estimateId, roomId, productIndex);
        if (success) {
          this.log("Product at index ".concat(productIndex, " successfully removed from room ").concat(roomId, " in localStorage."));
        } else {
          console.warn("Product at index ".concat(productIndex, " not found in room ").concat(roomId, " in localStorage during removal attempt."));
        }
      } catch (e) {
        console.error("Error removing product at index ".concat(productIndex, " from room ").concat(roomId, " in localStorage:"), e);
      }
      return this.request('remove_product_from_room', {
        estimate_id: estimateId,
        room_id: roomId,
        product_index: productIndex
      }).then(function (data) {
        // Invalidate caches since we modified data
        _this10.invalidateCache();
        return data;
      });
    }

    /**
     * Remove a room from an estimate
     * @param {string|number} estimateId - Estimate ID
     * @param {string|number} roomId - Room ID
     * @returns {Promise<Object>} Result data
     */
  }, {
    key: "removeRoom",
    value: function removeRoom(estimateId, roomId) {
      var _this11 = this;
      console.log('DataService: Removing room', {
        estimateId: estimateId,
        roomId: roomId
      });
      try {
        var success = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_3__.removeRoom)(estimateId, roomId);
        if (success) {
          this.log("Room ID ".concat(roomId, " successfully removed from localStorage for estimate ").concat(estimateId));
        } else {
          console.warn("Room ID ".concat(roomId, " not found in localStorage for estimate ").concat(estimateId, " during removal attempt."));
        }
      } catch (e) {
        console.error("Error removing room ID ".concat(roomId, " from localStorage:"), e);
      }

      // Force string conversion for consistency
      var requestData = {
        estimate_id: String(estimateId),
        room_id: String(roomId)
      };
      return this.request('remove_room', requestData).then(function (data) {
        console.log('DataService: Room removed successfully', data);

        // Invalidate caches since we modified data
        _this11.invalidateCache();
        return data;
      })["catch"](function (error) {
        console.error('DataService: Error removing room', error);
        throw error;
      });
    }

    /**
     * Remove an entire estimate
     * @param {string|number} estimateId - Estimate ID
     * @returns {Promise<Object>} Result data
     */
  }, {
    key: "removeEstimate",
    value: function removeEstimate(estimateId) {
      var _this12 = this;
      console.log("DataService: Removing estimate ".concat(estimateId));
      try {
        var success = (0,_EstimateStorage__WEBPACK_IMPORTED_MODULE_3__.removeEstimate)(estimateId);
        if (success) {
          this.log("Estimate ID ".concat(estimateId, " successfully removed from localStorage."));
        } else {
          console.warn("Estimate ID ".concat(estimateId, " not found in localStorage during removal attempt."));
        }
      } catch (e) {
        console.error("Error removing estimate ID ".concat(estimateId, " from localStorage:"), e);
      }
      return this.request('remove_estimate', {
        estimate_id: estimateId
      }).then(function (data) {
        // Invalidate caches since we modified data
        _this12.invalidateCache();
        console.log("DataService: Successfully removed estimate ".concat(estimateId));
        return data;
      })["catch"](function (error) {
        console.error("DataService: Error removing estimate ".concat(estimateId), error);
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
  }, {
    key: "getSuggestedProducts",
    value: function getSuggestedProducts(estimateId, roomId) {
      var _this13 = this;
      var bypassCache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var cacheKey = "estimate_".concat(estimateId, "_room_").concat(roomId);
      if (!bypassCache && this.cache.suggestedProducts[cacheKey]) {
        this.log("Returning cached suggestions for room ".concat(roomId));
        return Promise.resolve(this.cache.suggestedProducts[cacheKey]);
      }
      return this.request('get_suggested_products', {
        estimate_id: estimateId,
        room_id: roomId
      }).then(function (data) {
        _this13.cache.suggestedProducts[cacheKey] = data.suggestions;
        return data.suggestions;
      });
    }

    /**
     * Get the variation estimator content
     * @param {number} variationId - Variation ID
     * @returns {Promise<Object>} Result with HTML content
     */
  }, {
    key: "getVariationEstimator",
    value: function getVariationEstimator(variationId) {
      return this.request('get_variation_estimator', {
        variation_id: variationId
      });
    }

    /**
     * Format form data into a string for AJAX requests
     * @param {FormData|Object|string} formData - The form data to format
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
     */
  }, {
    key: "invalidateCache",
    value: function invalidateCache() {
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
  }, {
    key: "log",
    value: function log() {
      if (this.config.debug) {
        var _console;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        (_console = console).log.apply(_console, ['[DataService]'].concat(args));
      }
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

/**
 * EstimateStorage.js
 *
 * Handles synchronizing PHP session data with browser localStorage.
 * This module provides methods to store and retrieve session data,
 * particularly for estimates and rooms.
 */

var STORAGE_KEY = 'productEstimatorEstimateData';

/**
 * Load session data from localStorage
 * @returns {Object} Estimate data object with estimates, etc.
 */
function loadEstimateData() {
  try {
    var storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      var data = JSON.parse(storedData);
      console.log("EstimateStorage: loadEstimateData - Data loaded:", data); // Add this log
      return data;
    } else {
      var sessionDetails = sessionStorage.getItem(STORAGE_KEY);
      return sessionDetails ? JSON.parse(sessionDetails) : {};
    }
  } catch (error) {
    console.error('Error loading estimate data from localStorage:', error);
    return {}; // Return empty object on error
  }
}

/**
 * Save session data to localStorage
 * @param {Object} data - Estimate data to save
 */
function saveEstimateData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (localStorageError) {
    console.warn('localStorage not available, using sessionStorage:', localStorageError);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (sessionStorageError) {
      console.error('sessionStorage not available:', sessionStorageError);
      // If neither is available, details won't persist, but we can continue
    }
  }
}

/**
 * Clear session data from localStorage
 */
function clearEstimateData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (localStorageError) {
    console.warn('localStorage not available:', localStorageError);
  }
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (sessionStorageError) {
    console.warn('sessionStorage not available:', sessionStorageError);
  }
}

/**
 * Get specific estimate data from localStorage
 * @param {string} estimateId - The estimate ID to retrieve
 * @returns {Object|null} The estimate data or null if not found
 */
function getEstimate(estimateId) {
  var storedData = loadEstimateData();
  return storedData.estimates && storedData.estimates[estimateId] ? storedData.estimates[estimateId] : null;
}

/**
 * Save a specific estimate to localStorage
 * @param {string} estimateId - The estimate ID
 * @param {Object} estimateData - The estimate data to save
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
 * @param {Object} estimateData - Estimate data to add
 * @returns {string} The new estimate ID
 */
function addEstimate(estimateData) {
  var storedData = loadEstimateData();
  if (!storedData.estimates) {
    storedData.estimates = {};
  }

  // Generate a unique ID if not provided
  var estimateId = estimateData.id;
  if (!estimateId) {
    estimateId = "estimate_".concat(Date.now());
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
 * @param {Object} roomData - Room data to add
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

  // Generate a unique ID if not provided
  var roomId = roomData.id;
  if (!roomId) {
    roomId = "room_".concat(Date.now());
  }
  estimate.rooms[roomId] = roomData;
  saveEstimateData(storedData);
  return roomId;
}

/**
 * Get suggestions for a room from localStorage
 * @param {string} estimateId - Estimate ID
 * @param {string} roomId - Room ID
 * @returns {Array|null} Array of suggestion products or null if not found
 */
function getSuggestionsForRoom(estimateId, roomId) {
  var storedData = loadEstimateData();
  if (!storedData.estimates || !storedData.estimates[estimateId] || !storedData.estimates[estimateId].rooms || !storedData.estimates[estimateId].rooms[roomId]) {
    return null;
  }
  return storedData.estimates[estimateId].rooms[roomId].product_suggestions || null;
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
 * Add a product to a room in an estimate in localStorage
 * @param {string} estimateId - Estimate ID
 * @param {string} roomId - Room ID
 * @param {Object} productData - Product data to add
 * @returns {boolean} Success or failure
 */
function addProductToRoom(estimateId, roomId, productData) {
  var storedData = loadEstimateData();
  if (!storedData.estimates || !storedData.estimates[estimateId] || !storedData.estimates[estimateId].rooms || !storedData.estimates[estimateId].rooms[roomId]) {
    return false;
  }
  var room = storedData.estimates[estimateId].rooms[roomId];
  if (!room.products) {
    room.products = [];
  }
  room.products.push(productData);
  saveEstimateData(storedData);
  return true;
}

/**
 * Remove a product from a room in localStorage
 * @param {string} estimateId - Estimate ID
 * @param {string} roomId - Room ID
 * @param {number} productIndex - Index of the product in the products array
 * @returns {boolean} Success or failure
 */
function removeProductFromRoom(estimateId, roomId, productIndex) {
  var storedData = loadEstimateData();
  if (!storedData.estimates || !storedData.estimates[estimateId] || !storedData.estimates[estimateId].rooms || !storedData.estimates[estimateId].rooms[roomId] || !storedData.estimates[estimateId].rooms[roomId].products || !storedData.estimates[estimateId].rooms[roomId].products[productIndex]) {
    return false;
  }

  // Remove the product at the specified index
  storedData.estimates[estimateId].rooms[roomId].products.splice(productIndex, 1);
  saveEstimateData(storedData);
  return true;
}

/**
 * Update customer details in localStorage
 * @param {Object} customerDetails - Customer details to save
 */
function updateCustomerDetails(customerDetails) {
  var storedData = loadEstimateData();

  // Store customer details at the top level
  storedData.customerDetails = customerDetails;
  saveEstimateData(storedData);
}

/**
 * Get all estimates from localStorage
 * @returns {Object} All estimates
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
 * @param {string} newProductId - ID of new product
 * @param {Object} newProductData - New product data
 * @param {string} replaceType - Type of replacement ('main' or 'additional_products')
 * @param {string|null} parentProductId - ID of the parent product (if replacing additional product)
 * @returns {boolean} Success or failure
 */
function replaceProductInRoom(estimateId, roomId, oldProductId, newProductId, newProductData) {
  var replaceType = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'main';
  var parentProductId = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;
  var storedData = loadEstimateData(); // Load the current data from localStorage

  // Check if estimate or room exists
  if (!storedData.estimates || !storedData.estimates[estimateId] ||
  // Accessing with estimateId
  !storedData.estimates[estimateId].rooms ||
  // Accessing rooms with estimateId
  !storedData.estimates[estimateId].rooms[roomId]) {
    console.warn("Estimate or room not found in storedData."); // Original log
    return false; // Return false if estimate or room is not found
  }
  var room = storedData.estimates[estimateId].rooms[roomId]; // Get the specific room object
  console.log("Debugging: State of room.products:", room.products, "(Type: ".concat((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(room.products), ")"), "(Is Array: ".concat(Array.isArray(room.products), ")"));

  // Check if the room has a 'products' array
  if (!room.products) {
    return false; // Return false if there are no products in the room
  }
  console.log("Debugging: Value of replaceType before check:", replaceType, "(Type: ".concat((0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(replaceType), ")"));

  // If replacing an additional product
  if (replaceType === 'additional_products' && parentProductId !== null) {
    // Ensure parentProductId is available
    console.log("Starting outer loop for main products..."); // Added log

    var parentProduct = null;

    // Find the parent main product first
    for (var i = 0; i < room.products.length; i++) {
      var product = room.products[i];
      if (product.id == parentProductId) {
        parentProduct = product;
        console.log("Found parent product:", parentProduct);
        break; // Found the parent, no need to continue searching main products
      }
    }

    // If the parent product is found and has additional products
    if (parentProduct && parentProduct.additional_products && Array.isArray(parentProduct.additional_products)) {
      console.log("Searching additional products for parent product ID: ".concat(parentProductId));

      // Iterate through the additional products associated with this specific parent product
      for (var j = 0; j < parentProduct.additional_products.length; j++) {
        var addProduct = parentProduct.additional_products[j];

        // --- CONDITION TO IDENTIFY THE ADDITIONAL PRODUCT TO REPLACE ---
        // Check if the current additional product's ID matches the oldProductId
        // OR if the oldProductId is present in the additional product's replacement chain (if it exists)
        if (addProduct.id == oldProductId || addProduct.replacement_chain && addProduct.replacement_chain.includes(oldProductId)) {
          console.log("  Match found for oldProductId ".concat(oldProductId, " under parent ").concat(parentProductId, "! Replacing..."));

          // --- REPLACEMENT CHAIN LOGIC ---
          if (!addProduct.replacement_chain) {
            addProduct.replacement_chain = [];
          }
          if (!addProduct.replacement_chain.includes(addProduct.id)) {
            addProduct.replacement_chain.push(addProduct.id);
          }
          newProductData.replacement_chain = addProduct.replacement_chain;
          // --- END REPLACEMENT CHAIN LOGIC ---

          // === THE ACTUAL REPLACEMENT STEP ===
          // Replace the old additional product object at index 'j'
          // within the additional_products array of the correct parent product.
          room.products.find(function (p) {
            return p.id == parentProductId;
          }).additional_products[j] = newProductData;

          // === SAVE THE MODIFIED DATA TO LOCAL STORAGE ===
          saveEstimateData(storedData);
          return true; // Product found and replaced
        }
      }
      console.warn("Additional product with oldProductId ".concat(oldProductId, " not found under parent product ID ").concat(parentProductId, "."));
    } else {
      console.warn("Parent product with ID ".concat(parentProductId, " not found or has no additional products."));
    }
    console.warn("Additional product with oldProductId ".concat(oldProductId, " not found in any additional_products array.")); // Log if not found

    // If the loops finish without finding the additional product to replace
    return false;
  } else if (replaceType === 'main') {
    // --- LOGIC FOR REPLACING MAIN PRODUCTS ---
    var found = false;
    var productIndex = -1;

    // Find the index of the main product to replace
    for (var _i = 0; _i < room.products.length; _i++) {
      if (room.products[_i].id == oldProductId) {
        found = true;
        productIndex = _i;
        break; // Exit loop once the product is found
      }
    }

    // If the main product was found
    if (found && productIndex >= 0) {
      // Remove the old main product from the array at the found index
      room.products.splice(productIndex, 1);

      // Add the new product to the end of the main products array
      room.products.push(newProductData);

      // === SAVE THE MODIFIED DATA TO LOCAL STORAGE ===
      // Call saveEstimateData with the updated storedData object
      saveEstimateData(storedData);

      // Return true to indicate successful replacement
      return true;
    }

    // If the main product was not found
    return false;
  }
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
  getSuggestionsForRoom: getSuggestionsForRoom
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
/* harmony import */ var _DataService__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./DataService */ "./src/js/frontend/DataService.js");
/* harmony import */ var _ModalManager__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ModalManager */ "./src/js/frontend/ModalManager.js");
/* harmony import */ var _VariationHandler__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./VariationHandler */ "./src/js/frontend/VariationHandler.js");
/* harmony import */ var _CustomerDetailsManager__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./CustomerDetailsManager */ "./src/js/frontend/CustomerDetailsManager.js");


/**
 * EstimatorCore.js
 *
 * Main entry point for the Product Estimator JS.
 * Coordinates between modules and manages global state.
 */





var EstimatorCore = /*#__PURE__*/function () {
  /**
   * Initialize the EstimatorCore
   * @param {Object} config - Configuration options
   */
  function EstimatorCore() {
    var _window$productEstima;
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, EstimatorCore);
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
        this.log('EstimatorCore already initialized - aborting');
        return this;
      }

      // Also check for global init status
      if (window._productEstimatorInitialized && window.productEstimator && window.productEstimator.core) {
        this.log('EstimatorCore detected as already initialized globally - aborting');
        this.initialized = true;
        return this;
      }
      this.log('Initializing EstimatorCore');
      try {
        // Verify jQuery is properly loaded
        if (typeof jQuery === 'undefined') {
          console.error('jQuery is not loaded, cannot initialize EstimatorCore');
          return this;
        }

        // Create a single data service instance
        if (!this.dataService) {
          this.dataService = new _DataService__WEBPACK_IMPORTED_MODULE_2__["default"]({
            debug: this.config.debug
          });
        }

        // Safe initialization with clear console marking
        console.log('%c=== PRODUCT ESTIMATOR INITIALIZATION START ===', 'background: #f0f0f0; color: #333; padding: 3px; border-radius: 3px;');

        // Ensure we wait for DOM to be fully ready with a clear initialization boundary
        var initializeComponents = function initializeComponents() {
          if (_this.modalManager) {
            _this.log('Components already initialized - skipping');
            return;
          }

          // Initialize modal manager
          _this.modalManager = new _ModalManager__WEBPACK_IMPORTED_MODULE_3__["default"]({
            debug: _this.config.debug,
            selectors: _this.config.selectors
          }, _this.dataService);

          // Initialize customer details manager
          _this.customerDetailsManager = new _CustomerDetailsManager__WEBPACK_IMPORTED_MODULE_5__["default"]({
            debug: _this.config.debug
          }, _this.dataService);

          // Initialize variation handler if on product page
          if (_this.isWooCommerceProductPage()) {
            _this.log('WooCommerce product page detected, initializing VariationHandler');
            _this.variationHandler = new _VariationHandler__WEBPACK_IMPORTED_MODULE_4__["default"]({
              debug: _this.config.debug
            });
          }
          _this.bindGlobalEvents();
          _this.initialized = true;
          _this.log('EstimatorCore initialized successfully');
          _this.emit('core:initialized');
          console.log('%c=== PRODUCT ESTIMATOR INITIALIZATION COMPLETE ===', 'background: #f0f0f0; color: #333; padding: 3px; border-radius: 3px;');
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
        console.error('EstimatorCore initialization error:', error);
      }
      return this;
    }

    /**
     * Bind global events
     */
  }, {
    key: "bindGlobalEvents",
    value: function bindGlobalEvents() {
      var _this2 = this;
      try {
        // IMPORTANT: Remove any existing event listeners first
        if (this._clickHandler) {
          document.removeEventListener('click', this._clickHandler);
        }

        // Create a single handler function and store a reference to it
        this._clickHandler = function (e) {
          // Handle menu buttons (force list view)
          var menuButton = e.target.closest(_this2.config.selectors.estimatorMenuButtons);
          if (menuButton) {
            e.preventDefault();
            e.stopPropagation();
            _this2.log('Menu button clicked - opening modal in list view');
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

            // Get product ID from data attribute
            var productId = button.dataset.productId || null;
            console.log('PRODUCT BUTTON CLICKED:', {
              productId: productId,
              buttonElement: button,
              dataAttribute: button.dataset
            });
            if (_this2.modalManager) {
              console.log('OPENING MODAL WITH:', {
                productId: productId,
                forceListView: false
              });

              // Explicitly pass productId and set forceListView to false
              _this2.modalManager.openModal(productId, false);
            }
          }
        };

        // Add the event listener with our stored handler
        document.addEventListener('click', this._clickHandler);

        // Emit event for monitoring
        this.emit('core:eventsbound');
        // this.log('Global events bound');
      } catch (error) {
        console.error('Error binding global events:', error);
      }
    }

    /**
     * Close the modal if open
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
     * Log debug messages
     * @param {...any} args - Arguments to log
     */
  }, {
    key: "log",
    value: function log() {
      if (this.config.debug) {
        var _console;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        (_console = console).log.apply(_console, ['[EstimatorCore]'].concat(args));
      }
    }
  }]);
}(); // Create and export a singleton instance
var estimatorCore = new EstimatorCore({
  debug: true
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (estimatorCore);

/***/ }),

/***/ "./src/js/frontend/ModalManager.js":
/*!*****************************************!*\
  !*** ./src/js/frontend/ModalManager.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _ConfirmationDialog__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ConfirmationDialog */ "./src/js/frontend/ConfirmationDialog.js");
/* harmony import */ var _SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./SuggestionsCarousel */ "./src/js/frontend/SuggestionsCarousel.js");
/* harmony import */ var _CustomerStorage__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./CustomerStorage */ "./src/js/frontend/CustomerStorage.js");
/* harmony import */ var _EstimateStorage__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./EstimateStorage */ "./src/js/frontend/EstimateStorage.js");
/* harmony import */ var _TemplateEngine__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./TemplateEngine */ "./src/js/frontend/TemplateEngine.js");





function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/**
 * ModalManager.js
 *
 * Handles all modal operations for the Product Estimator plugin.
 * This is the single source of truth for modal operations.
 */





var ModalManager = /*#__PURE__*/function () {
  /**
   * Initialize the ModalManager
   * @param {Object} config - Configuration options
   * @param {DataService} dataService - The data service instance
   */
  function ModalManager() {
    var _window$productEstima;
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var dataService = arguments.length > 1 ? arguments[1] : undefined;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_3__["default"])(this, ModalManager);
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

    // Store references to dependencies
    this.dataService = dataService;
    this.loadCustomerDetails = _CustomerStorage__WEBPACK_IMPORTED_MODULE_7__.loadCustomerDetails;
    this.saveCustomerDetails = _CustomerStorage__WEBPACK_IMPORTED_MODULE_7__.saveCustomerDetails;
    this.clearCustomerDetails = _CustomerStorage__WEBPACK_IMPORTED_MODULE_7__.clearCustomerDetails;
    this.loadEstimateData = _EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.loadEstimateData;
    this.clearEstimateData = _EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.clearEstimateData;
    this.saveEstimateData = _EstimateStorage__WEBPACK_IMPORTED_MODULE_8__.saveEstimateData;
    // Make addEstimate and removeEstimate available if needed elsewhere, though direct import is used below
    // this.addEstimate = addEstimate;
    // this.removeEstimate = removeEstimate;

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
    this.escKeyHandler = null;

    // Initialize the modal
    this.init();
  }

  /**
   * Initialize the modal
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_4__["default"])(ModalManager, [{
    key: "init",
    value: function init() {
      var _this = this;
      if (this.initialized) {
        this.log('ModalManager already initialized');
        return;
      }

      // Find the existing modal in the DOM
      this.modal = document.querySelector(this.config.selectors.modalContainer);
      if (!this.modal) {
        this.log('Warning: Modal element not found in DOM. The PHP partial may not be included.');
        // Don't attempt to create it - the partial should be included by PHP
      } else {
        this.log('Found existing modal in DOM, initializing elements');
      }

      // Initialize modal elements if modal exists
      if (this.modal) {
        this.initializeElements();
        this.bindEvents();

        // Install the loader safety system
        this.setupLoaderSafety();

        // Hide any loading indicators that might be visible
        setTimeout(function () {
          _this.ensureLoaderHidden();
        }, 500);
      }

      // Initialize jQuery fallback
      this.initializeJQueryAccordions();
      this.initialized = true;
      this.log('ModalManager initialized');
    }

    /**
     * Initialize modal elements - with loading indicator fix
     */
  }, {
    key: "initializeElements",
    value: function initializeElements() {
      if (!this.modal) {
        console.error('[ModalManager] Modal element not available for initializing elements');
        return;
      }

      // Find core modal elements
      this.overlay = this.modal.querySelector(this.config.selectors.modalOverlay);
      this.closeButton = this.modal.querySelector(this.config.selectors.closeButton);
      this.contentContainer = this.modal.querySelector(this.config.selectors.contentContainer);
      this.loadingIndicator = this.modal.querySelector(this.config.selectors.loadingIndicator);

      // Create missing containers if needed
      if (!this.loadingIndicator) {
        console.warn('[ModalManager] Loading indicator not found, creating one');
        this.loadingIndicator = document.createElement('div');
        this.loadingIndicator.className = 'product-estimator-modal-loading';
        this.loadingIndicator.innerHTML = "\n      <div class=\"loading-spinner\"></div>\n      <div class=\"loading-text\">".concat(this.config.i18n.loading || 'Loading...', "</div>\n    ");
        this.modal.appendChild(this.loadingIndicator);
      }

      // Find view containers - directly use string IDs for performance
      this.estimatesList = this.modal.querySelector('#estimates');
      this.estimateSelection = this.modal.querySelector('#estimate-selection-wrapper');

      // Create missing containers when needed
      if (!this.estimateSelection && this.contentContainer) {
        this.estimateSelection = document.createElement('div');
        this.estimateSelection.id = 'estimate-selection-wrapper';
        this.contentContainer.appendChild(this.estimateSelection);
      }
      this.estimateSelectionForm = this.modal.querySelector('#estimate-selection-form-wrapper');
      if (!this.estimateSelectionForm && this.estimateSelection) {
        this.estimateSelectionForm = document.createElement('div');
        this.estimateSelectionForm.id = 'estimate-selection-form-wrapper';
        this.estimateSelection.appendChild(this.estimateSelectionForm);
      }
      this.roomSelectionForm = this.modal.querySelector('#room-selection-form-wrapper');
      if (!this.roomSelectionForm && this.contentContainer) {
        this.roomSelectionForm = document.createElement('div');
        this.roomSelectionForm.id = 'room-selection-form-wrapper';
        this.roomSelectionForm.style.display = 'none';
        this.contentContainer.appendChild(this.roomSelectionForm);
      }
      this.newEstimateForm = this.modal.querySelector('#new-estimate-form-wrapper');
      this.newRoomForm = this.modal.querySelector('#new-room-form-wrapper');

      // Bind events to any existing forms
      // this.bindExistingForms();
    }
    /**
     * Show loading overlay - with error handling
     */
  }, {
    key: "showLoading",
    value: function showLoading() {
      if (this.loadingIndicator) {
        this.loadingIndicator.style.display = 'flex';
      } else {
        console.warn('Loading indicator not available - creating one');
        // Try to initialize a loading indicator
        if (this.modal) {
          var loadingIndicator = document.createElement('div');
          loadingIndicator.className = 'product-estimator-modal-loading';
          loadingIndicator.style.display = 'flex';
          loadingIndicator.innerHTML = "\n        <div class=\"loading-spinner\"></div>\n        <div class=\"loading-text\">".concat(this.config.i18n.loading || 'Loading...', "</div>\n      ");
          this.modal.appendChild(loadingIndicator);
          this.loadingIndicator = loadingIndicator;
        } else {
          console.error('Cannot create loading indicator - modal not available');
        }
      }
    }

    /**
     * Hide loading overlay with timeout tracking reset
     */
  }, {
    key: "hideLoading",
    value: function hideLoading() {
      // Reset loading start time
      this.loadingStartTime = 0;
      if (this.loadingIndicator) {
        this.loadingIndicator.style.display = 'none';

        // Log operation for tracking
        // console.log('Loading indicator hidden at:', new Date().toISOString());
      } else {
        console.warn('Loading indicator not available during hide operation');
      }
    }
  }, {
    key: "initializeCarousels",
    value: function initializeCarousels() {
      console.log('Initializing carousels in modal');

      // Find all carousel containers in the modal (both suggestions and similar products)
      var carouselContainers = this.modal.querySelectorAll('.suggestions-carousel');
      if (carouselContainers.length > 0) {
        console.log("Found ".concat(carouselContainers.length, " carousel containers in modal"));

        // Count each type for better debugging
        var suggestionCarousels = this.modal.querySelectorAll('.product-suggestions .suggestions-carousel').length;
        var similarProductCarousels = this.modal.querySelectorAll('.product-similar-products .suggestions-carousel').length;
        console.log("Carousel types: ".concat(suggestionCarousels, " suggestion carousels, ").concat(similarProductCarousels, " similar product carousels"));

        // Initialize all carousels
        (0,_SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_6__.initSuggestionsCarousels)();
      } else {
        console.log('No carousel containers found in modal');
      }
    }

    /**
     * New method to bind events to any forms that already exist in the DOM
     */
  }, {
    key: "bindExistingForms",
    value: function bindExistingForms() {
      var _this2 = this;
      // Bind room form events
      if (this.newRoomForm) {
        var form = this.newRoomForm.querySelector('form#new-room-form');
        if (form) {
          console.log('Found existing room form, binding event handlers');

          // Remove any existing event handlers to prevent duplicates
          if (this._newRoomFormSubmitHandler) {
            form.removeEventListener('submit', this._newRoomFormSubmitHandler);
          }

          // Create new handler with preventDefault
          this._newRoomFormSubmitHandler = function (e) {
            e.preventDefault();
            console.log('Existing room form submitted');
            _this2.handleNewRoomSubmission(form, e);
          };

          // Add event listener
          form.addEventListener('submit', this._newRoomFormSubmitHandler);

          // Also bind cancel button
          var cancelButton = form.querySelector('.cancel-btn');
          if (cancelButton) {
            cancelButton.addEventListener('click', function () {
              _this2.cancelForm('room');
            });
          }
        }
      }

      // Bind estimate form events
      if (this.newEstimateForm) {
        var _form = this.newEstimateForm.querySelector('form#new-estimate-form');
        if (_form) {
          // Similar binding for the estimate form
          if (this._estimateFormSubmitHandler) {
            _form.removeEventListener('submit', this._estimateFormSubmitHandler);
          }
          this._estimateFormSubmitHandler = function (e) {
            e.preventDefault();
            _this2.handleNewEstimateSubmission(_form, e);
          };
          _form.addEventListener('submit', this._estimateFormSubmitHandler);
        }
      }

      // Bind room selection form events if needed
      this.bindRoomSelectionFormEvents();
    }

    /**
     * Bind events to modal elements
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this3 = this;
      // Make sure elements exist before binding events
      if (!this.modal) {
        this.log('Modal element not available, cannot bind events');
        return;
      }

      // Remove any existing click handlers from the modal
      if (this._modalClickHandler) {
        this.modal.removeEventListener('click', this._modalClickHandler);
      }

      // Use event delegation for better performance and to avoid duplicate handlers
      this._modalClickHandler = function (e) {
        // Close button handler
        if (e.target.closest(_this3.config.selectors.closeButton)) {
          e.preventDefault();
          e.stopPropagation();
          _this3.log('Close button clicked');
          _this3.closeModal();
        }

        // Overlay click handler
        if (e.target.classList.contains('product-estimator-modal-overlay')) {
          e.preventDefault();
          e.stopPropagation();
          _this3.log('Overlay clicked');
          _this3.closeModal();
        }
      };
      this.modal.addEventListener('click', this._modalClickHandler);

      // Escape key to close modal
      var escHandler = function escHandler(e) {
        if (e.key === 'Escape' && _this3.isOpen) {
          _this3.log('Escape key pressed');
          _this3.closeModal();
        }
      };

      // Remove any existing handler before adding
      document.removeEventListener('keydown', this.escKeyHandler);
      document.addEventListener('keydown', escHandler);
      this.escKeyHandler = escHandler;

      // this.log('Modal events bound');
    }

    /**
     * Open the modal with template-based rendering
     * @param {number|string|null} productId - Product ID or null for list view
     * @param {boolean} forceListView - Whether to force showing the list view
     */
  }, {
    key: "openModal",
    value: function openModal() {
      var _this4 = this;
      var productId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var forceListView = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      console.log('MODAL OPEN CALLED WITH:', {
        productId: productId,
        forceListView: forceListView,
        typeOfProductId: (0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_2__["default"])(productId)
      });

      // Make sure modal exists and is initialized
      if (!this.modal) {
        console.error('Cannot open modal - not found in DOM');
        return;
      }

      // Reset any previous modal state
      this.resetModalState();

      // Store product ID
      this.currentProductId = productId;

      // Set data attribute on modal
      if (productId) {
        this.modal.dataset.productId = productId;
      } else {
        delete this.modal.dataset.productId;
      }

      // Always start with loader visible
      this.showLoading();

      // Make sure modal is visible
      this.modal.style.display = 'block';

      // Add modal-open class to body
      document.body.classList.add('modal-open');
      this.isOpen = true;

      // Get the form container for content
      var formContainer = this.modal.querySelector('.product-estimator-modal-form-container');
      if (!formContainer) {
        console.error('Form container not found in modal');
        this.hideLoading();
        return;
      }

      // Clear any existing content
      formContainer.innerHTML = '';

      // DETERMINE WHICH FLOW TO USE
      if (productId && !forceListView) {
        console.log('STARTING PRODUCT FLOW with product ID:', productId);

        // Check if estimates exist using DataService
        this.dataService.checkEstimatesExist().then(function (hasEstimates) {
          console.log('Has estimates check result:', hasEstimates);
          if (hasEstimates) {
            // Show estimate selection view using template engine
            _this4.dataService.getEstimatesData().then(function (estimates) {
              // Check if template exists first
              if (!_TemplateEngine__WEBPACK_IMPORTED_MODULE_9__["default"].getTemplate('estimate-selection-template')) {
                console.error('Template not found: estimate-selection-template');
                _this4.showError('Template not found. Please refresh and try again.');
                _this4.hideLoading();
                return;
              }

              // Create and insert the estimate selection template
              _TemplateEngine__WEBPACK_IMPORTED_MODULE_9__["default"].insert('estimate-selection-template', {
                estimates: estimates
              }, formContainer);

              // Populate the estimate dropdown
              var estimateDropdown = formContainer.querySelector('#estimate-dropdown');
              if (estimateDropdown) {
                estimates.forEach(function (estimate) {
                  var option = document.createElement('option');
                  option.value = estimate.id;
                  var roomCount = estimate.rooms ? Object.keys(estimate.rooms).length : 0;
                  option.textContent = "".concat(estimate.name, " (").concat(roomCount, " room").concat(roomCount !== 1 ? 's' : '', ")");
                  estimateDropdown.appendChild(option);
                });
              }

              // Bind events to the form
              _this4.bindEstimateSelectionFormEvents();
              _this4.hideLoading();
            })["catch"](function (error) {
              console.error('Error loading estimates data:', error);
              _TemplateEngine__WEBPACK_IMPORTED_MODULE_9__["default"].showMessage('Error loading estimates data.', 'error', formContainer);
              _this4.hideLoading();
            });
          } else {
            // Show new estimate form
            // Check if template exists first
            if (!_TemplateEngine__WEBPACK_IMPORTED_MODULE_9__["default"].getTemplate('new-estimate-form-template')) {
              console.error('Template not found: new-estimate-form-template');
              _this4.showError('Template not found. Please refresh and try again.');
              _this4.hideLoading();
              return;
            }

            // Insert the template for new estimate form
            _TemplateEngine__WEBPACK_IMPORTED_MODULE_9__["default"].insert('new-estimate-form-template', {}, formContainer);

            // Bind events to the form
            var form = formContainer.querySelector('#new-estimate-form');
            if (form) {
              // Set product ID as data attribute
              form.dataset.productId = productId;

              // Bind submit event
              form.addEventListener('submit', function (e) {
                e.preventDefault();
                _this4.handleNewEstimateSubmission(form);
              });

              // Bind cancel button
              var cancelButton = form.querySelector('.cancel-btn');
              if (cancelButton) {
                cancelButton.addEventListener('click', function () {
                  _this4.cancelForm('estimate');
                });
              }
            }
            _this4.hideLoading();
          }
        })["catch"](function (error) {
          console.error('Error checking estimates:', error);
          if (formContainer) {
            _TemplateEngine__WEBPACK_IMPORTED_MODULE_9__["default"].showMessage('Error checking estimates. Please try again.', 'error', formContainer);
          }
          _this4.hideLoading();
        });
      } else {
        // LIST VIEW FLOW: No product ID or forcing list view
        console.log('STARTING LIST VIEW FLOW');

        // First, create the estimates list container
        this.estimatesList = document.createElement('div');
        this.estimatesList.id = 'estimates';
        formContainer.appendChild(this.estimatesList);

        // Now that we have created the container, we can bind events to it
        this.bindProductRemovalEvents();
        this.bindRoomRemovalEvents();
        this.bindEstimateRemovalEvents();

        // Get estimates from localStorage
        var estimateData = this.loadEstimateData();
        console.log('ESTIMATE DATA:', JSON.stringify(estimateData, null, 2));
        var estimates = estimateData.estimates || {};
        if (Object.keys(estimates).length === 0) {
          // No estimates - show empty state template
          if (_TemplateEngine__WEBPACK_IMPORTED_MODULE_9__["default"].getTemplate('estimates-empty-template')) {
            _TemplateEngine__WEBPACK_IMPORTED_MODULE_9__["default"].insert('estimates-empty-template', {}, this.estimatesList);

            // Bind create button
            var createButton = this.estimatesList.querySelector('#create-estimate-btn');
            if (createButton) {
              createButton.addEventListener('click', function () {
                _this4.showNewEstimateForm();
              });
            }
          } else {
            this.estimatesList.innerHTML = '<div class="no-estimates"><p>You don\'t have any estimates yet.</p><button id="create-estimate-btn" class="button">Create New Estimate</button></div>';

            // Bind create button
            var _createButton = this.estimatesList.querySelector('#create-estimate-btn');
            if (_createButton) {
              _createButton.addEventListener('click', function () {
                _this4.showNewEstimateForm();
              });
            }
          }
        } else {
          // Render estimates from localStorage data
          Object.entries(estimates).forEach(function (_ref) {
            var _ref2 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref, 2),
              estimateId = _ref2[0],
              estimate = _ref2[1];
            console.log("Rendering estimate ".concat(estimateId, ":"), estimate);
            try {
              // Create estimate element with template
              var _estimateData = {
                estimate_id: estimateId,
                name: estimate.name || 'Unnamed Estimate',
                min_total: estimate.min_total || 0,
                max_total: estimate.max_total || 0
              };

              // Insert the estimate template
              _TemplateEngine__WEBPACK_IMPORTED_MODULE_9__["default"].insert('estimate-item-template', _estimateData, _this4.estimatesList);

              // Now that the estimate is in the DOM, find the rooms-container for this specific estimate
              var estimateSection = _this4.estimatesList.querySelector(".estimate-section[data-estimate-id=\"".concat(estimateId, "\"]"));
              if (!estimateSection) {
                console.error("Could not find estimate section with ID ".concat(estimateId, " in the DOM"));
                return;
              }
              var roomsContainer = estimateSection.querySelector('.rooms-container');
              if (!roomsContainer) {
                console.error("Could not find rooms-container in estimate ".concat(estimateId));
                return;
              }
              console.log("Found rooms-container for estimate ".concat(estimateId, ", rendering ").concat(Object.keys(estimate.rooms || {}).length, " rooms"));

              // Render rooms into this specific container
              if (estimate.rooms && Object.keys(estimate.rooms).length > 0) {
                Object.entries(estimate.rooms).forEach(function (_ref3) {
                  var _ref4 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref3, 2),
                    roomId = _ref4[0],
                    room = _ref4[1];
                  console.log("Rendering room ".concat(roomId, " in estimate ").concat(estimateId, ":"), room);
                  var roomData = {
                    room_id: roomId,
                    estimate_id: estimateId,
                    name: room.name || 'Unnamed Room',
                    room_name: room.name || 'Unnamed Room',
                    width: room.width || 0,
                    length: room.length || 0,
                    min_total: room.min_total || 0,
                    max_total: room.max_total || 0
                  };

                  // Insert the room template directly into this estimate's rooms-container
                  _TemplateEngine__WEBPACK_IMPORTED_MODULE_9__["default"].insert('room-item-template', roomData, roomsContainer);

                  // Now find the product-list container for this room
                  var roomElement = roomsContainer.querySelector(".accordion-item[data-room-id=\"".concat(roomId, "\"]"));
                  if (!roomElement) {
                    console.error("Could not find room element with ID ".concat(roomId, " in the DOM"));
                    return;
                  }
                  var productList = roomElement.querySelector('.product-list');
                  if (!productList) {
                    console.error("Could not find product-list in room ".concat(roomId));
                    return;
                  }

                  // Render products in this room if they exist
                  if (room.products && room.products.length > 0) {
                    console.log("Found ".concat(room.products.length, " products in room ").concat(roomId, ", rendering..."));

                    // Render each product in the room
                    room.products.forEach(function (product, productIndex) {
                      console.log("Rendering product ".concat(product.id, " at index ").concat(productIndex, " in room ").concat(roomId));

                      // Prepare product data for template
                      var productData = _objectSpread({
                        product_index: productIndex,
                        estimate_id: estimateId,
                        room_id: roomId
                      }, product);

                      // Insert product using template
                      _TemplateEngine__WEBPACK_IMPORTED_MODULE_9__["default"].insert('product-item-template', productData, productList);
                    });
                  } else {
                    console.log("No products found in room ".concat(roomId));
                  }
                });
              }
            } catch (error) {
              console.error("Error rendering estimate ".concat(estimateId, ":"), error);
            }
          });
        }

        // Initialize accordions and add event handlers after all content is rendered
        setTimeout(function () {
          console.log('Initializing accordions and events after content rendering');
          _this4.initializeEstimateAccordions();
          _this4.initializeAccordions();

          // Re-bind events to ensure they work with the newly rendered content
          _this4.bindProductRemovalEvents();
          _this4.bindRoomRemovalEvents();
          _this4.bindEstimateRemovalEvents();

          // Initialize carousels
          _this4.initializeCarousels();

          // Initialize product details toggles
          if (window.productEstimator && window.productEstimator.detailsToggle) {
            window.productEstimator.detailsToggle.setup();
          }

          // Hide loading when everything is done
          _this4.hideLoading();
        }, 100);
      }
    }

    /**
     * Show estimate selection with force visibility
     */
  }, {
    key: "showEstimateSelection",
    value: function showEstimateSelection() {
      var _this5 = this;
      console.log('Showing estimate selection');

      // Make sure estimates list is hidden
      if (this.estimatesList) {
        this.estimatesList.style.display = 'none';
      }

      // Force visibility of estimate selection
      if (!this.estimateSelection) {
        console.error('Estimate selection container not found');
        return;
      }

      // Force visibility using multiple techniques
      this.forceElementVisibility(this.estimateSelection);

      // Ensure the form is also visible
      if (this.estimateSelectionForm) {
        this.forceElementVisibility(this.estimateSelectionForm);
      }

      // Make sure the form is loaded properly
      if (!this.estimateSelectionForm || !this.estimateSelectionForm.querySelector('form')) {
        // Form content needs to be loaded
        this.loadEstimateSelectionForm().then(function () {
          // Double-check event binding
          _this5.bindEstimateSelectionFormEvents();
        })["catch"](function (error) {
          console.error('Error loading form:', error);
        });
      } else {
        // Form already exists, just load the estimates data for the dropdown
        this.loadEstimatesData();

        // Re-bind events to ensure they work
        this.bindEstimateSelectionFormEvents();
        this.hideLoading();
      }
    }

    /**
     * Force element visibility using multiple techniques
     * @param {HTMLElement} element - Element to make visible
     * @return {HTMLElement} The element for chaining
     */
  }, {
    key: "forceElementVisibility",
    value: function forceElementVisibility(element) {
      if (!element) {
        console.error('Cannot show null element');
        return null;
      }
      console.log('Forcing visibility for:', element.id || element.tagName);

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
     * Override the original closeModal to ensure loader is hidden
     */
  }, {
    key: "closeModal",
    value: function closeModal() {
      if (!this.isOpen) return;
      if (this.modal) {
        this.modal.style.display = 'none';
        delete this.modal.dataset.productId;
      } else {
        this.log('Cannot close modal - element not found');
        return;
      }

      // Make sure loading indicator is hidden
      this.ensureLoaderHidden();
      document.body.classList.remove('modal-open');
      this.isOpen = false;
      this.currentProductId = null;
      this.currentView = null;

      // Reset modal state
      this.resetModalState();

      // Emit close event
      this.emit('modal:closed');
    }

    /**
     * Add method to attach a global loader timeout checker
     */
  }, {
    key: "setupLoaderSafety",
    value: function setupLoaderSafety() {
      var _this6 = this;
      // Set up a periodic check to ensure the loader doesn't get stuck
      setInterval(function () {
        if (_this6.isOpen && _this6.loadingIndicator && window.getComputedStyle(_this6.loadingIndicator).display !== 'none') {
          // Check if the loader has been visible for too long (more than 10 seconds)
          var loaderStartTime = _this6.loadingStartTime || 0;
          var currentTime = new Date().getTime();
          if (loaderStartTime && currentTime - loaderStartTime > 10000) {
            console.warn('Loading indicator has been visible for more than 10 seconds, hiding it.');
            _this6.hideLoading();
            _this6.showError('The operation is taking longer than expected or may have failed silently.');
          }
        }
      }, 2000); // Check every 2 seconds

      // Track when loading starts
      var originalShowLoading = this.showLoading;
      this.showLoading = function () {
        _this6.loadingStartTime = new Date().getTime();
        return originalShowLoading.call(_this6);
      };

      // Reset tracking when loading ends
      var originalHideLoading = this.hideLoading;
      this.hideLoading = function () {
        _this6.loadingStartTime = 0;
        return originalHideLoading.call(_this6);
      };
      console.log('Loader safety system installed');
    }

    /**
     * Global method to ensure loading indicator is hidden
     * This can be called from multiple places as a safety measure
     */
  }, {
    key: "ensureLoaderHidden",
    value: function ensureLoaderHidden() {
      // Check if we have a loader that's currently visible
      if (this.loadingIndicator && window.getComputedStyle(this.loadingIndicator).display !== 'none') {
        console.log('Force hiding loader that was left visible');
        this.hideLoading();
      }

      // Also check for any other loading indicators that might exist
      var allLoaders = document.querySelectorAll('.product-estimator-modal-loading');
      if (allLoaders.length > 1) {
        console.warn("Found ".concat(allLoaders.length, " loading indicators, cleaning up duplicates"));
        // Keep only the first one, remove others
        for (var i = 1; i < allLoaders.length; i++) {
          allLoaders[i].remove();
        }
      }

      // Set all loaders to hidden
      allLoaders.forEach(function (loader) {
        loader.style.display = 'none';
      });
    }

    /**
     * Reset modal state
     */
  }, {
    key: "resetModalState",
    value: function resetModalState() {
      // console.log('Resetting modal state');

      // Hide all views with null checking and jQuery support
      var hideElement = function hideElement(element) {
        if (element) {
          element.style.display = 'none';
          if (typeof jQuery !== 'undefined') {
            jQuery(element).hide();
          }
        }
      };

      // Hide each element
      hideElement(this.estimatesList);
      hideElement(this.estimateSelection);
      hideElement(this.estimateSelectionForm);
      hideElement(this.roomSelectionForm);
      hideElement(this.newEstimateForm);
      hideElement(this.newRoomForm);

      // Clear any stored data attributes safely
      if (this.roomSelectionForm) this.roomSelectionForm.removeAttribute('data-estimate-id');
      if (this.newRoomForm) {
        this.newRoomForm.removeAttribute('data-estimate-id');
        this.newRoomForm.removeAttribute('data-product-id');
      }
    }

    /**
     * Load the estimates list with improved multi-estimate expansion
     * @param {string|null} expandRoomId - Optional room ID to expand after loading
     * @param {string|null} expandEstimateId - Optional estimate ID containing the room
     * @returns {Promise} Promise that resolves when the list is loaded
     */
  }, {
    key: "loadEstimatesList",
    value: function loadEstimatesList() {
      var _this7 = this;
      var expandRoomId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var expandEstimateId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      console.log('[loadEstimatesList] Function started', {
        expandRoomId: expandRoomId,
        expandEstimateId: expandEstimateId
      });
      return new Promise(function (resolve, reject) {
        // Show loading state
        _this7.showLoading();

        // Ensure estimates list container exists
        if (!_this7.estimatesList) {
          console.error('[loadEstimatesList] Estimates list container not found!');
          reject(new Error('Estimates list container not found'));
          return;
        }

        // Make sure it's visible
        _this7.estimatesList.style.display = 'block';
        try {
          // Get data from localStorage via our imported function
          var estimateData = _this7.loadEstimateData();
          var estimates = estimateData.estimates || {};

          // Clear existing content
          _this7.estimatesList.innerHTML = '';
          if (Object.keys(estimates).length === 0) {
            // No estimates - show empty state
            _TemplateEngine__WEBPACK_IMPORTED_MODULE_9__["default"].insert('estimates-empty-template', {}, _this7.estimatesList);

            // Bind create button
            var createButton = _this7.estimatesList.querySelector('#create-estimate-btn');
            if (createButton) {
              createButton.addEventListener('click', function () {
                _this7.showNewEstimateForm();
              });
            }
          } else {
            // Render estimates from localStorage data
            Object.entries(estimates).forEach(function (_ref5) {
              var _ref6 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref5, 2),
                estimateId = _ref6[0],
                estimate = _ref6[1];
              try {
                // Create estimate element with explicit template data
                _TemplateEngine__WEBPACK_IMPORTED_MODULE_9__["default"].insert('estimate-item-template', {
                  estimate_id: estimateId,
                  name: estimate.name || 'Unnamed Estimate',
                  min_total: estimate.min_total || 0,
                  max_total: estimate.max_total || 0,
                  default_markup: estimate.default_markup || 0
                }, _this7.estimatesList);

                // Find this estimate section to add rooms
                var estimateSection = _this7.estimatesList.querySelector(".estimate-section[data-estimate-id=\"".concat(estimateId, "\"]"));
                if (estimateSection) {
                  var roomsContainer = estimateSection.querySelector('.rooms-container');
                  if (roomsContainer && estimate.rooms) {
                    // Add rooms
                    Object.entries(estimate.rooms).forEach(function (_ref7) {
                      var _ref8 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref7, 2),
                        roomId = _ref8[0],
                        room = _ref8[1];
                      _TemplateEngine__WEBPACK_IMPORTED_MODULE_9__["default"].insert('room-item-template', {
                        room_id: roomId,
                        estimate_id: estimateId,
                        name: room.name || 'Unnamed Room',
                        room_name: room.name || 'Unnamed Room',
                        width: room.width || 0,
                        length: room.length || 0,
                        min_total: room.min_total || 0,
                        max_total: room.max_total || 0
                      }, roomsContainer);
                    });
                  }
                }
              } catch (error) {
                console.error("Error rendering estimate ".concat(estimateId, ":"), error);
              }
            });
          }

          // CRUCIAL: Initialize both types of accordions after rendering
          setTimeout(function () {
            console.log('Calling initializeEstimateAccordions from loadEstimatesList');
            _this7.initializeEstimateAccordions(expandRoomId, expandEstimateId);
            _this7.initializeAccordions(expandRoomId, expandEstimateId);
            _this7.bindProductRemovalEvents();
            _this7.bindRoomRemovalEvents();
            _this7.bindEstimateRemovalEvents();
            _this7.initializeCarousels();
            _this7.bindSuggestedProductButtons();
          }, 100);
          resolve(_this7.estimatesList.innerHTML);
        } catch (error) {
          console.error('[loadEstimatesList] Error loading estimates from localStorage:', error);
          reject(error);
        } finally {
          _this7.hideLoading();
        }
      });
    }

    /**
     * Handle product removal
     * @param {string} estimateId - Estimate ID
     * @param {string} roomId - Room ID
     * @param {number} productIndex - Product index
     */
  }, {
    key: "handleProductRemoval",
    value: function handleProductRemoval(estimateId, roomId, productIndex) {
      var _this8 = this;
      this.showLoading();
      console.log("Removing product at index ".concat(productIndex, " from room ").concat(roomId, " in estimate ").concat(estimateId));

      // Find the room element
      var roomElement = this.modal.querySelector(".accordion-item[data-room-id=\"".concat(roomId, "\"][data-estimate-id=\"").concat(estimateId, "\"]"));
      if (!roomElement) {
        console.warn("Could not find room element for room ID ".concat(roomId, " and estimate ID ").concat(estimateId));
        this.showError('Room element not found. Please refresh and try again.');
        this.hideLoading();
        return;
      }
      var productElement = roomElement.querySelector(".product-item[data-product-index=\"".concat(productIndex, "\"]"));
      if (!productElement) {
        console.warn("Could not find product element with index ".concat(productIndex, " in the DOM"));
        this.showError('Product element not found. Please refresh and try again.');
        this.hideLoading();
        return;
      }

      // Use DataService to make the AJAX request
      this.dataService.removeProductFromRoom(estimateId, roomId, productIndex).then(function (response) {
        console.log('Product removal successful:', response);

        // Get parent container before removing element
        var productList = productElement.parentElement;

        // Remove the element from the DOM
        productElement.remove();

        // Check if this was the last product in the room
        if (productList && productList.children.length === 0) {
          console.log('Last product in room removed, updating room UI');

          // If room is now empty, hide suggestions
          var suggestions = roomElement.querySelector('.product-suggestions');
          if (suggestions) {
            suggestions.style.display = 'none';
          }
        }

        // Update the room's total price if needed
        if (response.room_totals) {
          _this8.updateRoomTotals(estimateId, roomId, response.room_totals);
        }

        // Also update the estimate's total price
        if (response.estimate_totals) {
          _this8.updateEstimateTotals(estimateId, response.estimate_totals);
        }

        // Show success message
        _this8.showMessage('Product removed successfully', 'success');
      })["catch"](function (error) {
        console.error('Error removing product:', error);
        _this8.showError(error.message || 'Error removing product. Please try again.');
      })["finally"](function () {
        _this8.hideLoading();
      });
    }

    /**
     * Update room price totals after a product is removed
     * @param {string} estimateId - Estimate ID
     * @param {string} roomId - Room ID
     * @param {Object} totals - New price totals from the server
     */
  }, {
    key: "updateRoomTotals",
    value: function updateRoomTotals(estimateId, roomId, totals) {
      if (!totals) return;
      var roomElement = this.modal.querySelector(".accordion-item[data-room-id=\"".concat(roomId, "\"][data-estimate-id=\"").concat(estimateId, "\"]"));
      if (!roomElement) return;

      // Update the room price display
      var priceElement = roomElement.querySelector('.room-price');
      if (priceElement && totals.min_total !== undefined && totals.max_total !== undefined) {
        var formattedPrice = "".concat(format.formatPrice(totals.min_total), " - ").concat(format.formatPrice(totals.max_total));
        priceElement.textContent = formattedPrice;
        console.log("Updated room price display to ".concat(formattedPrice));
      }

      // Update the price graph if it exists
      var priceGraph = roomElement.querySelector('.price-graph-range');
      if (priceGraph && totals.max_total) {
        // Calculate percentage width based on max price
        var maxPossible = totals.max_total * 1.5; // Assume the graph is scaled to 150% of max
        var percentage = totals.max_total / maxPossible * 100;
        priceGraph.style.width = "".concat(Math.min(percentage, 100), "%");
      }
    }

    /**
     * Update estimate price totals after a product is removed
     * @param {string} estimateId - Estimate ID
     * @param {Object} totals - New price totals from the server
     */
  }, {
    key: "updateEstimateTotals",
    value: function updateEstimateTotals(estimateId, totals) {
      if (!totals) return;
      var estimateSection = this.modal.querySelector(".estimate-section[data-estimate-id=\"".concat(estimateId, "\"]"));
      if (!estimateSection) return;

      // Update the estimate price display
      var priceElement = estimateSection.querySelector('.estimate-price');
      if (priceElement && totals.min_total !== undefined && totals.max_total !== undefined) {
        var formattedPrice = "".concat(format.formatPrice(totals.min_total), " - ").concat(format.formatPrice(totals.max_total));
        priceElement.textContent = formattedPrice;
        console.log("Updated estimate price display to ".concat(formattedPrice));
      }

      // Update the price graph if it exists
      var priceGraph = estimateSection.querySelector('.price-graph-range');
      if (priceGraph && totals.max_total) {
        // Calculate percentage width based on max price
        var maxPossible = totals.max_total * 1.5; // Assume the graph is scaled to 150% of max
        var percentage = totals.max_total / maxPossible * 100;
        priceGraph.style.width = "".concat(Math.min(percentage, 100), "%");
      }
    }

    /**
     * Handle adding a suggested product to a room
     * Moves the AJAX request to the DataService for consistency.
     *
     * @param {string|number} productId - Product ID
     * @param {string|number} estimateId - Estimate ID
     * @param {string|number} roomId - Room ID
     * @param {HTMLElement} buttonElement - The button element that triggered the action
     */
  }, {
    key: "handleAddSuggestedProduct",
    value: function handleAddSuggestedProduct(productId, estimateId, roomId, buttonElement) {
      var _this9 = this;
      // Show loading indicator
      this.showLoading();

      // Show loading state on the button
      if (buttonElement) {
        buttonElement.disabled = true;
        buttonElement.classList.add('loading');
        buttonElement.innerHTML = '<span class="loading-dots">Adding...</span>';
      }
      console.log("Adding suggested product ".concat(productId, " to room ").concat(roomId, " in estimate ").concat(estimateId, " via DataService"));

      // Use DataService to make the AJAX request
      this.dataService.addProductToRoom(roomId, productId, estimateId).then(function (response) {
        console.log('Add suggested product response from DataService:', response);

        // Refresh the estimates list to show the updated room
        return _this9.loadEstimatesList(roomId, estimateId).then(function () {
          // Auto-expand the room accordion after refreshing
          setTimeout(function () {
            var roomAccordion = _this9.modal.querySelector(".accordion-item[data-room-id=\"".concat(roomId, "\"]"));
            if (roomAccordion) {
              var header = roomAccordion.querySelector('.accordion-header');
              if (header && !header.classList.contains('active')) {
                header.click();
              }
            }
          }, 300);

          // Show success message
          _this9.showMessage('Product added successfully!', 'success');
        });
      })["catch"](function (error) {
        var _error$data;
        // Handle error response from DataService
        console.error('Error adding suggested product via DataService:', error);

        // Check if this is a duplicate product error (assuming DataService adds this property)
        if ((_error$data = error.data) !== null && _error$data !== void 0 && _error$data.duplicate) {
          console.log('Duplicate suggested product detected by DataService:', error.data);
          _this9.showMessage(error.data.message || 'This product already exists in this room.', 'error');
          // The room is likely already open, so no need to refresh or expand
        } else {
          // Handle other errors
          _this9.showError(error.message || 'Error adding product. Please try again.');
        }
      })["finally"](function () {
        // Reset button state
        if (buttonElement) {
          buttonElement.disabled = false;
          buttonElement.classList.remove('loading');
          buttonElement.textContent = 'Add'; // Restore original text
        }

        // Hide loading indicator
        _this9.hideLoading();
      });
    }
  }, {
    key: "bindSuggestedProductButtons",
    value: function bindSuggestedProductButtons() {
      var _this10 = this;
      console.log('Binding suggested product buttons');

      // Find all suggestion buttons in the modal
      var suggestionButtons = this.modal.querySelectorAll('.add-suggestion-to-room');
      if (suggestionButtons.length) {
        console.log("Found ".concat(suggestionButtons.length, " suggestion buttons to bind"));

        // Loop through each button and bind click event
        suggestionButtons.forEach(function (button) {
          // Remove any existing handlers to prevent duplicates
          // Store handler reference directly on the button element for easy removal
          if (button._suggestionButtonHandler) {
            button.removeEventListener('click', button._suggestionButtonHandler);
          }

          // Create and store new handler directly on button element
          button._suggestionButtonHandler = function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Get data attributes
            var productId = button.dataset.productId;
            var estimateId = button.dataset.estimateId;
            var roomId = button.dataset.roomId;
            console.log('Add suggestion button clicked:', {
              productId: productId,
              estimateId: estimateId,
              roomId: roomId
            });

            // Handle adding the suggested product
            if (productId && estimateId && roomId) {
              _this10.handleAddSuggestedProduct(productId, estimateId, roomId, button);
            } else {
              console.error('Missing required data attributes for adding suggested product');
            }
          };

          // Add click event listener
          button.addEventListener('click', button._suggestionButtonHandler);
        });
        console.log('Suggestion buttons bound successfully');
      } else {
        console.log('No suggestion buttons found to bind');
      }
    }
    /**
     * Handle room removal
     * @param {string} estimateId - Estimate ID
     * @param {string} roomId - Room ID
     */
  }, {
    key: "handleRoomRemoval",
    value: function handleRoomRemoval(estimateId, roomId) {
      var _roomElement$querySel,
        _this11 = this;
      // Find the room element before removal for better UI handling
      var roomElement = this.modal.querySelector(".accordion-item[data-room-id=\"".concat(roomId, "\"]"));
      var roomName = roomElement ? ((_roomElement$querySel = roomElement.querySelector('.room-name')) === null || _roomElement$querySel === void 0 ? void 0 : _roomElement$querySel.textContent) || 'room' : 'room';
      this.showLoading();

      // Log the exact parameters being sent
      console.log('Removing room with parameters:', {
        estimate_id: estimateId,
        room_id: roomId
      });
      this.dataService.removeRoom(estimateId, roomId).then(function (response) {
        console.log('Room removal response:', response);

        // Refresh estimates list
        _this11.loadEstimatesList(null, estimateId).then(function () {
          // Show success message
          _this11.showMessage("".concat(roomName, " removed successfully"), 'success');

          // If the estimate has no rooms left, it might need special handling
          if (response.has_rooms === false) {
            console.log('Estimate has no rooms left after removal');

            // You might want to highlight the "Add New Room" button or similar
            var addRoomBtn = _this11.modal.querySelector(".estimate-section[data-estimate-id=\"".concat(estimateId, "\"] .add-room"));
            if (addRoomBtn) {
              // Briefly highlight the button
              addRoomBtn.classList.add('highlight-btn');
              setTimeout(function () {
                addRoomBtn.classList.remove('highlight-btn');
              }, 2000);
            }
          }
        })["catch"](function (error) {
          _this11.log('Error refreshing estimates list:', error);
          _this11.showError('Error refreshing estimates list. Please try again.');
        });
      })["catch"](function (error) {
        _this11.log('Error removing room:', error);
        _this11.showError(error.message || 'Error removing room. Please try again.');
      })["finally"](function () {
        _this11.hideLoading();
      });
    }

    /**
     * Handle estimate removal
     * @param {string} estimateId - Estimate ID
     */
  }, {
    key: "handleEstimateRemoval",
    value: function handleEstimateRemoval(estimateId) {
      var _this12 = this;
      this.showLoading();

      // Log the estimate ID being removed for debugging
      console.log("Attempting to remove estimate ID: ".concat(estimateId));
      this.dataService.removeEstimate(estimateId).then(function (response) {
        console.log('Estimate removal response:', response);

        // Refresh estimates list
        _this12.loadEstimatesList().then(function () {
          // Show success message
          _this12.showMessage('Estimate removed successfully', 'success');
        })["catch"](function (error) {
          console.error('Error refreshing estimates list:', error);
          _this12.showError('Error refreshing estimates list. Please try again.');
        });
      })["catch"](function (error) {
        console.error('Error removing estimate:', error);
        _this12.showError(error.message || 'Error removing estimate. Please try again.');
      })["finally"](function () {
        _this12.hideLoading();
      });
    }

    /**
     * Bind product removal events with proper event delegation
     */
  }, {
    key: "bindProductRemovalEvents",
    value: function bindProductRemovalEvents() {
      var _this13 = this;
      console.log('Binding product removal events');

      // Make sure we have a valid estimatesList element
      if (!this.estimatesList) {
        console.error('Estimates list not available for binding product removal events');
        return;
      }

      // Remove any existing click handlers first to prevent duplicates
      if (this._productRemovalHandler) {
        this.estimatesList.removeEventListener('click', this._productRemovalHandler);
      }

      // Create a new handler function and save a reference to it
      this._productRemovalHandler = function (e) {
        var removeButton = e.target.closest('.remove-product');
        if (removeButton) {
          e.preventDefault();
          e.stopPropagation();

          // Get the necessary data attributes
          var estimateId = removeButton.dataset.estimateId;
          var roomId = removeButton.dataset.roomId;
          var productIndex = removeButton.dataset.productIndex;
          console.log('Remove product button clicked:', {
            estimateId: estimateId,
            roomId: roomId,
            productIndex: productIndex,
            button: removeButton
          });
          if (estimateId && roomId && productIndex !== undefined) {
            // Confirm before removing
            _this13.confirmDelete('product', estimateId, roomId, productIndex);
          } else {
            console.error('Missing data attributes for product removal:', {
              estimateId: estimateId,
              roomId: roomId,
              productIndex: productIndex,
              buttonData: removeButton.dataset
            });
          }
        }
      };

      // Add the new handler
      this.estimatesList.addEventListener('click', this._productRemovalHandler);
      console.log('Product removal events bound to #estimates element');
    }

    /**
     * Bind room removal events with duplicate prevention
     */
  }, {
    key: "bindRoomRemovalEvents",
    value: function bindRoomRemovalEvents() {
      var _this14 = this;
      if (this.estimatesList) {
        // Remove any existing handlers
        if (this._roomRemovalHandler) {
          this.estimatesList.removeEventListener('click', this._roomRemovalHandler);
        }

        // Create new handler and store reference
        this._roomRemovalHandler = function (e) {
          var removeButton = e.target.closest('.remove-room');
          if (removeButton) {
            e.preventDefault();
            e.stopPropagation();
            var estimateId = removeButton.dataset.estimateId;
            var roomId = removeButton.dataset.roomId;
            console.log('Remove room button clicked:', {
              estimateId: estimateId,
              roomId: roomId
            });
            if (estimateId && roomId) {
              _this14.confirmDelete('room', estimateId, roomId);
            }
          }
        };

        // Add the new handler
        this.estimatesList.addEventListener('click', this._roomRemovalHandler);
      }
    }

    /**
     * Bind estimate removal events with duplicate prevention
     */
  }, {
    key: "bindEstimateRemovalEvents",
    value: function bindEstimateRemovalEvents() {
      var _this15 = this;
      if (this.estimatesList) {
        // Remove any existing handlers
        if (this._estimateRemovalHandler) {
          this.estimatesList.removeEventListener('click', this._estimateRemovalHandler);
        }

        // Create new handler and store reference
        this._estimateRemovalHandler = function (e) {
          var removeButton = e.target.closest('.remove-estimate');
          if (removeButton) {
            e.preventDefault();
            e.stopPropagation();
            var estimateId = removeButton.dataset.estimateId;
            console.log('Remove estimate button clicked:', {
              estimateId: estimateId
            });
            if (estimateId) {
              _this15.confirmDelete('estimate', estimateId);
            }
          }
        };

        // Add the new handler
        this.estimatesList.addEventListener('click', this._estimateRemovalHandler);
      }
    }

    /**
     * Confirm deletion with better error handling and logging
     * @param {string} type - Item type ('product', 'room', or 'estimate')
     * @param {string} estimateId - Estimate ID
     * @param {string} roomId - Room ID (for room or product deletion)
     * @param {string} productIndex - Product index (for product deletion only)
     */
  }, {
    key: "confirmDelete",
    value: function confirmDelete(type, estimateId, roomId, productIndex) {
      var _window$productEstima2,
        _this16 = this;
      // Get text from localized strings if available
      var i18n = ((_window$productEstima2 = window.productEstimatorVars) === null || _window$productEstima2 === void 0 ? void 0 : _window$productEstima2.i18n) || {};
      var dialogTitles = i18n.dialog_titles || {};
      var dialogMessages = i18n.dialog_messages || {};

      // Set default values
      var title = '';
      var message = '';
      var confirmText = '';

      // Set values based on type
      switch (type) {
        case 'estimate':
          title = dialogTitles.estimate || 'Delete Estimate';
          message = dialogMessages.estimate || 'Are you sure you want to delete this estimate and all its rooms?';
          confirmText = i18n["delete"] || 'Delete';
          break;
        case 'room':
          title = dialogTitles.room || 'Delete Room';
          message = dialogMessages.room || 'Are you sure you want to delete this room and all its products?';
          confirmText = i18n["delete"] || 'Delete';
          break;
        case 'product':
          title = dialogTitles.product || 'Remove Product';
          message = dialogMessages.product || 'Are you sure you want to remove this product from the room?';
          confirmText = i18n.remove || 'Remove';
          break;
      }

      // Log what we're trying to delete
      console.log("Confirming deletion of ".concat(type, " - ID: ").concat(type === 'product' ? productIndex : type === 'room' ? roomId : estimateId));

      // Use our custom confirmation dialog
      if (window.productEstimator && window.productEstimator.dialog) {
        console.log('Using custom dialog for deletion confirmation');
        window.productEstimator.dialog.show({
          title: title,
          message: message,
          type: type,
          confirmText: confirmText,
          onConfirm: function onConfirm() {
            console.log("User confirmed deletion of ".concat(type));

            // Handle deletion based on type
            switch (type) {
              case 'estimate':
                _this16.handleEstimateRemoval(estimateId);
                break;
              case 'room':
                _this16.handleRoomRemoval(estimateId, roomId);
                break;
              case 'product':
                _this16.handleProductRemoval(estimateId, roomId, productIndex);
                break;
            }
          },
          onCancel: function onCancel() {
            console.log("User cancelled deletion of ".concat(type));
            // No action needed on cancel
          }
        });
      } else {
        // Fallback to standard confirm if custom dialog not available
        console.log('Custom dialog not available, using browser confirm');
        if (confirm(message)) {
          console.log("User confirmed deletion of ".concat(type, " via browser confirm"));
          switch (type) {
            case 'estimate':
              this.handleEstimateRemoval(estimateId);
              break;
            case 'room':
              this.handleRoomRemoval(estimateId, roomId);
              break;
            case 'product':
              this.handleProductRemoval(estimateId, roomId, productIndex);
              break;
          }
        } else {
          console.log("User cancelled deletion of ".concat(type, " via browser confirm"));
        }
      }
    }

    /**
     * Load estimate selection form via AJAX
     * @returns {Promise} Promise that resolves when form is loaded
     */
  }, {
    key: "loadEstimateSelectionForm",
    value: function loadEstimateSelectionForm() {
      var _this17 = this;
      return new Promise(function (resolve, reject) {
        if (!_this17.estimateSelectionForm) {
          reject(new Error('Estimate selection form container not found'));
          return;
        }

        // Show loading state
        _this17.showLoading();

        // Load form via AJAX
        jQuery.ajax({
          url: productEstimatorVars.ajax_url,
          type: 'POST',
          data: {
            action: 'get_estimate_selection_form',
            nonce: productEstimatorVars.nonce
          },
          success: function success(response) {
            if (response.success && response.data.html) {
              // Insert the HTML
              _this17.estimateSelectionForm.innerHTML = response.data.html;

              // Load data for the form
              _this17.loadEstimatesData();

              // Bind form events - this is critical
              _this17.bindEstimateSelectionFormEvents();
              resolve(response.data.html);
            } else {
              var error = new Error('Failed to load estimate selection form');
              console.error(error);
              reject(error);
            }
          },
          error: function error(_error) {
            console.error('Error loading estimate selection form:', _error);
            reject(_error);
          },
          complete: function complete() {
            _this17.hideLoading();
          }
        });
      });
    }

    /**
     * Add a dedicated method to bind form events
     */
  }, {
    key: "bindEstimateSelectionFormEvents",
    value: function bindEstimateSelectionFormEvents() {
      var _this18 = this;
      console.log('Binding estimate selection form events');
      var form = this.estimateSelectionForm.querySelector('form');
      if (!form) {
        console.error('Cannot bind events - form not found in estimate selection form');
        return;
      }

      // Log what we're working with
      console.log('Form found:', form);

      // Remove existing event listeners to prevent duplication
      if (this._estimateFormSubmitHandler) {
        form.removeEventListener('submit', this._estimateFormSubmitHandler);
      }

      // Create and store the handler
      this._estimateFormSubmitHandler = function (e) {
        e.preventDefault();
        console.log('Estimate selection form submitted');
        _this18.handleEstimateSelection(form);
      };

      // Add the event listener
      form.addEventListener('submit', this._estimateFormSubmitHandler);

      // Handle create button
      var createButton = form.querySelector('#create-estimate-btn');
      if (createButton) {
        if (this._createEstimateHandler) {
          createButton.removeEventListener('click', this._createEstimateHandler);
        }
        this._createEstimateHandler = function () {
          console.log('Create estimate button clicked');
          _this18.showNewEstimateForm();
        };
        createButton.addEventListener('click', this._createEstimateHandler);
      }
      console.log('Form events bound successfully');
    }

    /**
     * Load estimates data for dropdowns
     */
  }, {
    key: "loadEstimatesData",
    value: function loadEstimatesData() {
      var _this19 = this;
      this.showLoading();
      this.dataService.getEstimatesData().then(function (estimates) {
        // Update the estimates dropdown
        var dropdown = _this19.estimateSelectionForm.querySelector('#estimate-dropdown');
        if (!dropdown) {
          // Load the form template first
          _this19.loadEstimateSelectionForm().then(function () {
            return _this19.populateEstimateDropdown(estimates);
          })["catch"](function (error) {
            _this19.log('Error loading estimate selection form:', error);
            _this19.showError('Error loading estimate selection form. Please try again.');
          })["finally"](function () {
            _this19.hideLoading();
          });
          return;
        }
        _this19.populateEstimateDropdown(estimates);
        _this19.hideLoading();
      })["catch"](function (error) {
        _this19.log('Error loading estimates data:', error);
        _this19.showError('Error loading estimates data. Please try again.');
        _this19.hideLoading();
      });
    }

    /**
     * Populate estimate dropdown with data
     * @param {Array} estimates - Array of estimate objects
     */
  }, {
    key: "populateEstimateDropdown",
    value: function populateEstimateDropdown(estimates) {
      // Find the dropdown in the form
      var dropdown = this.estimateSelectionForm ? this.estimateSelectionForm.querySelector('#estimate-dropdown') : null;
      if (!dropdown) {
        this.log('Estimate dropdown not found, cannot populate');
        return;
      }

      // Clear existing options
      dropdown.innerHTML = '';

      // Add default option
      var defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = productEstimatorVars.i18n.select_estimate || '-- Select an Estimate --';
      dropdown.appendChild(defaultOption);

      // Add estimate options
      if (Array.isArray(estimates)) {
        estimates.forEach(function (estimate) {
          if (estimate) {
            var roomCount = estimate.rooms ? Object.keys(estimate.rooms).length : 0;
            var roomText = roomCount === 1 ? '1 room' : "".concat(roomCount, " rooms");
            var option = document.createElement('option');
            option.value = estimate.id;
            option.textContent = "".concat(estimate.name || 'Unnamed Estimate', " (").concat(roomText, ")");
            dropdown.appendChild(option);
          }
        });
      }
      this.log("Populated dropdown with ".concat(estimates ? estimates.length : 0, " estimates"));
    }

    /**
     * Show new estimate form with correct loading indicator handling
     */
  }, {
    key: "showNewEstimateForm",
    value: function showNewEstimateForm() {
      var _this20 = this;
      if (this.estimatesList) this.estimatesList.style.display = 'none';
      if (this.estimateSelection) this.estimateSelection.style.display = 'none';

      // Force visibility of the form
      this.forceElementVisibility(this.newEstimateForm);

      // Check if form content needs to be loaded
      if (!this.newEstimateForm.querySelector('form')) {
        this.loadNewEstimateForm()["finally"](function () {
          // Always hide loading when form is ready
          _this20.hideLoading();

          // Add this: Ensure cancel button is properly bound
          _this20.bindCancelButton(_this20.newEstimateForm, 'estimate');
        });
      } else {
        // Form already exists, just make sure loading is hidden and cancel button is bound
        this.hideLoading();

        // Add this: Ensure cancel button is properly bound
        this.bindCancelButton(this.newEstimateForm, 'estimate');
      }
    }
  }, {
    key: "bindCancelButton",
    value: function bindCancelButton(formContainer, formType) {
      var _this21 = this;
      if (!formContainer) return;

      // Find the cancel button in this form
      var cancelButton = formContainer.querySelector('.cancel-btn');
      if (cancelButton) {
        // Remove any existing event listeners to prevent duplicates
        cancelButton.removeEventListener('click', this._cancelFormHandler);

        // Create and store new handler
        this._cancelFormHandler = function () {
          console.log("Cancel button clicked for ".concat(formType, " form"));
          _this21.cancelForm(formType);
        };

        // Add the event listener
        cancelButton.addEventListener('click', this._cancelFormHandler);
        console.log("Cancel button bound for ".concat(formType, " form"));
      } else {
        console.warn("No cancel button found in ".concat(formType, " form"));
      }
    }

    /**
     * Load new estimate form via AJAX with improved loading handling
     * @returns {Promise} Promise that resolves when form is loaded
     */
  }, {
    key: "loadNewEstimateForm",
    value: function loadNewEstimateForm() {
      var _this22 = this;
      return new Promise(function (resolve, reject) {
        // Show loading
        _this22.showLoading();

        // Load form via AJAX
        jQuery.ajax({
          url: productEstimatorVars.ajax_url,
          type: 'POST',
          data: {
            action: 'get_new_estimate_form',
            nonce: productEstimatorVars.nonce
          },
          success: function success(response) {
            if (response.success && response.data.html) {
              _this22.newEstimateForm.innerHTML = response.data.html;
              if (window.productEstimator && window.productEstimator.core && window.productEstimator.core.customerDetailsManager) {
                // Slight delay to ensure DOM is updated
                setTimeout(function () {
                  window.productEstimator.core.customerDetailsManager.init();
                }, 100);
              }

              // Bind form events
              var form = _this22.newEstimateForm.querySelector('form');
              if (form) {
                form.addEventListener('submit', function (e) {
                  e.preventDefault();
                  _this22.handleNewEstimateSubmission(form);
                });
                var cancelButton = form.querySelector('.cancel-btn');
                if (cancelButton) {
                  cancelButton.addEventListener('click', function () {
                    _this22.cancelForm('estimate');
                  });
                }
              }

              // Dispatch a custom event that modal content has been loaded
              document.dispatchEvent(new CustomEvent('product_estimator_modal_loaded'));
              resolve(response.data.html);
            } else {
              reject(new Error('Failed to load new estimate form'));
            }
          },
          error: function error(_error2) {
            console.error('Error loading new estimate form:', _error2);
            reject(_error2);
          },
          complete: function complete() {
            // Hide loading indicator when AJAX completes, regardless of success or error
            _this22.hideLoading();
          }
        });
      });
    }

    /**
     * Show new room form
     * @param {string} estimateId - Estimate ID
     */
  }, {
    key: "showNewRoomForm",
    value: function showNewRoomForm(estimateId) {
      console.log('Showing new room form for estimate:', estimateId);

      // Store the estimate ID with the form
      if (this.newRoomForm) {
        this.newRoomForm.dataset.estimateId = estimateId;

        // Also set it on the form element directly for redundancy
        var form = this.newRoomForm.querySelector('form');
        if (form) {
          form.dataset.estimateId = estimateId;
        }
      }

      // Hide other views
      if (this.estimatesList) this.estimatesList.style.display = 'none';
      if (this.estimateSelection) this.estimateSelection.style.display = 'none';
      if (this.roomSelectionForm) this.roomSelectionForm.style.display = 'none';

      // Force visibility of the form
      this.forceElementVisibility(this.newRoomForm);

      // Check if form content needs to be loaded
      if (!this.newRoomForm.querySelector('form')) {
        this.loadNewRoomForm(estimateId);
      } else {
        // Form already exists, make sure it has the right estimate ID
        var _form2 = this.newRoomForm.querySelector('form');
        if (_form2) {
          _form2.dataset.estimateId = estimateId;
        }
      }
    }

    /**
     * Load new room form via AJAX
     * @param {string} estimateId - Estimate ID
     * @returns {Promise} Promise that resolves when form is loaded
     */
  }, {
    key: "loadNewRoomForm",
    value: function loadNewRoomForm(estimateId) {
      var _this23 = this;
      return new Promise(function (resolve, reject) {
        // Show loading
        _this23.showLoading();

        // Load form via AJAX
        jQuery.ajax({
          url: productEstimatorVars.ajax_url,
          type: 'POST',
          data: {
            action: 'get_new_room_form',
            nonce: productEstimatorVars.nonce
          },
          success: function success(response) {
            if (response.success && response.data.html) {
              // Insert form HTML
              _this23.newRoomForm.innerHTML = response.data.html;

              // HERE IS WHERE YOU ADD THE EVENT BINDING CODE:
              var form = _this23.newRoomForm.querySelector('form');
              if (form) {
                // Set estimate ID on the form
                form.dataset.estimateId = estimateId;

                // Remove any existing event handlers
                if (_this23._newRoomFormSubmitHandler) {
                  form.removeEventListener('submit', _this23._newRoomFormSubmitHandler);
                }

                // Create new handler that PREVENTS DEFAULT
                _this23._newRoomFormSubmitHandler = function (e) {
                  e.preventDefault(); // This is crucial to prevent page reload
                  console.log('New room form submitted');
                  _this23.handleNewRoomSubmission(form);
                };

                // Bind the handler
                form.addEventListener('submit', _this23._newRoomFormSubmitHandler);

                // Also bind cancel button
                var cancelButton = form.querySelector('.cancel-btn');
                if (cancelButton) {
                  cancelButton.addEventListener('click', function () {
                    _this23.cancelForm('room');
                  });
                }
              }
              resolve(response.data.html);
            } else {
              reject(new Error('Failed to load new room form'));
            }
          },
          error: function error(_error3) {
            console.error('Error loading new room form:', _error3);
            reject(_error3);
          },
          complete: function complete() {
            _this23.hideLoading();
          }
        });
      });
    }
  }, {
    key: "bindEstimateListEventHandlers",
    value: function bindEstimateListEventHandlers() {
      var _this24 = this;
      if (!this.estimatesList) {
        console.error('Cannot bind events - estimates list container not found');
        return;
      }

      // Remove any existing handlers
      if (this._addRoomButtonHandler) {
        this.estimatesList.removeEventListener('click', this._addRoomButtonHandler);
      }

      // Create a new handler function and store the reference
      this._addRoomButtonHandler = function (e) {
        var addRoomButton = e.target.closest('.add-room');
        if (addRoomButton) {
          e.preventDefault();
          e.stopPropagation();

          // Get estimate ID from data attribute
          var estimateId = addRoomButton.dataset.estimate;
          console.log('Add room button clicked for estimate:', estimateId);
          if (estimateId) {
            _this24.showNewRoomForm(estimateId);
          } else {
            console.error('No estimate ID found for add room button');
          }
        }
      };

      // Add the event listener to the estimates list
      this.estimatesList.addEventListener('click', this._addRoomButtonHandler);
      console.log('Add room button event handler bound');
    }

    /**
     * Bind room selection form events
     */
  }, {
    key: "bindRoomSelectionFormEvents",
    value: function bindRoomSelectionFormEvents() {
      var _this25 = this;
      console.log('Binding room selection form events');

      // First check if the form container exists
      if (!this.roomSelectionForm) {
        console.warn('Cannot bind events - room selection form container not found');
        return;
      }

      // Then check if the form exists inside the container
      var form = this.roomSelectionForm.querySelector('form');
      if (!form) {
        console.warn('Cannot bind events - form not found in room selection form');
        return;
      }

      // Continue with the rest of your binding code...
      // Remove existing event listeners to prevent duplication
      if (this._roomFormSubmitHandler) {
        form.removeEventListener('submit', this._roomFormSubmitHandler);
      }

      // Create and store the handler
      this._roomFormSubmitHandler = function (e) {
        e.preventDefault();
        console.log('Room selection form submitted');
        _this25.handleRoomSelection(form);
      };

      // Add the event listener
      form.addEventListener('submit', this._roomFormSubmitHandler);

      // Also bind the back button
      var backButton = form.querySelector('.back-btn');
      if (backButton) {
        if (this._backButtonHandler) {
          backButton.removeEventListener('click', this._backButtonHandler);
        }
        this._backButtonHandler = function () {
          console.log('Back button clicked');
          _this25.forceElementVisibility(_this25.estimateSelectionForm);
          _this25.forceElementVisibility(_this25.estimateSelection);
          _this25.roomSelectionForm.style.display = 'none';
        };
        backButton.addEventListener('click', this._backButtonHandler);
      }

      // Bind add new room button - CRITICAL FIX
      var addRoomButton = form.querySelector('#add-new-room-from-selection');
      if (addRoomButton) {
        if (this._addNewRoomHandler) {
          addRoomButton.removeEventListener('click', this._addNewRoomHandler);
        }
        this._addNewRoomHandler = function () {
          console.log('Add new room button clicked in form');
          var estimateId = _this25.roomSelectionForm.dataset.estimateId;
          console.log('Estimate ID for new room:', estimateId);
          if (estimateId) {
            _this25.showNewRoomForm(estimateId);
          } else {
            console.error('No estimate ID found for new room');
          }
        };
        addRoomButton.addEventListener('click', this._addNewRoomHandler);
        console.log('Add new room button handler bound');
      } else {
        console.warn('Add new room button not found in room selection form');
      }
      console.log('Room selection form events bound successfully');
    }

    /**
     * Update handleEstimateSelection to bind room selection form events
     */
  }, {
    key: "handleEstimateSelection",
    value: function handleEstimateSelection(form) {
      var _this26 = this;
      var estimateId = form.querySelector('#estimate-dropdown').value;
      var productId = this.currentProductId;
      if (!estimateId) {
        this.showError('Please select an estimate');
        return;
      }
      this.showLoading();

      // Get rooms for the selected estimate
      this.dataService.getRoomsForEstimate(estimateId, productId).then(function (response) {
        // Hide estimate selection form
        _this26.estimateSelectionForm.style.display = 'none';

        // If the estimate has rooms, show room selection form
        if (response.has_rooms) {
          // Populate room dropdown
          var roomDropdown = document.getElementById('room-dropdown');
          if (roomDropdown) {
            roomDropdown.innerHTML = '';
            roomDropdown.appendChild(new Option('-- Select a Room --', ''));
            response.rooms.forEach(function (room) {
              roomDropdown.appendChild(new Option("".concat(room.name, " (").concat(room.dimensions, ")"), room.id));
            });

            // Store estimate ID with the form
            _this26.roomSelectionForm.dataset.estimateId = estimateId;

            // Also set the data-estimate attribute on the Add New Room button
            var addNewRoomButton = document.getElementById('add-new-room-from-selection');
            if (addNewRoomButton) {
              addNewRoomButton.dataset.estimate = estimateId;
            }

            // Show room selection form with force visibility
            _this26.forceElementVisibility(_this26.roomSelectionForm);

            // Important: Bind the room selection form events
            _this26.bindRoomSelectionFormEvents();
          } else {
            _this26.loadRoomSelectionForm(estimateId).then(function () {
              _this26.roomSelectionForm.dataset.estimateId = estimateId;
              _this26.forceElementVisibility(_this26.roomSelectionForm);
              // Bind events after loading
              _this26.bindRoomSelectionFormEvents();
            })["catch"](function (error) {
              _this26.log('Error loading room selection form:', error);
              _this26.showError('Error loading room selection form. Please try again.');
            });
          }
        } else {
          // No rooms, show new room form
          _this26.newRoomForm.dataset.estimateId = estimateId;
          _this26.newRoomForm.dataset.productId = productId;
          _this26.forceElementVisibility(_this26.newRoomForm);
        }
      })["catch"](function (error) {
        _this26.log('Error getting rooms:', error);
        _this26.showError('Error getting rooms. Please try again.');
      })["finally"](function () {
        _this26.hideLoading();
      });
    }

    /**
     * Load room selection form content
     */
  }, {
    key: "loadRoomSelectionForm",
    value: function loadRoomSelectionForm(estimateId) {
      var _this27 = this;
      return new Promise(function (resolve, reject) {
        if (!_this27.roomSelectionForm) {
          reject(new Error('Room selection form container not found'));
          return;
        }

        // Show loading state
        _this27.showLoading();

        // Load form via AJAX
        jQuery.ajax({
          url: productEstimatorVars.ajax_url,
          type: 'POST',
          data: {
            action: 'get_room_selection_form',
            nonce: productEstimatorVars.nonce,
            estimate_id: estimateId
          },
          success: function success(response) {
            if (response.success && response.data.html) {
              // Insert the HTML
              _this27.roomSelectionForm.innerHTML = response.data.html;

              // Set estimate ID
              _this27.roomSelectionForm.dataset.estimateId = estimateId;

              // Bind form events
              _this27.bindRoomSelectionFormEvents();
              resolve(response.data.html);
            } else {
              var error = new Error('Failed to load room selection form');
              console.error(error);
              reject(error);
            }
          },
          error: function error(_error4) {
            console.error('Error loading room selection form:', _error4);
            reject(_error4);
          },
          complete: function complete() {
            _this27.hideLoading();
          }
        });
      });
    }

    /**
     * Add this method to the ModalManager class to handle customer details updates
     */
  }, {
    key: "onCustomerDetailsUpdated",
    value: function onCustomerDetailsUpdated(event) {
      if (event.detail && event.detail.details) {
        var _this$modal;
        console.log('Customer details updated:', event.detail.details);

        // Update any new estimate form in the modal
        var newEstimateForm = (_this$modal = this.modal) === null || _this$modal === void 0 ? void 0 : _this$modal.querySelector('#new-estimate-form');
        if (newEstimateForm) {
          // Set data-has-email attribute to update UI behavior
          var hasEmail = event.detail.details.email && event.detail.details.email.trim() !== '';
          newEstimateForm.setAttribute('data-has-email', hasEmail ? 'true' : 'false');
        }

        // If there's a customer details confirmation area, update it with new details
        this.updateCustomerDetailsDisplay(event.detail.details);
      }
    }

    /**
     * Add this method to the ModalManager class to update the customer details display
     */
  }, {
    key: "updateCustomerDetailsDisplay",
    value: function updateCustomerDetailsDisplay(details) {
      var _this$modal2;
      // Find any customer details confirmation areas in the modal
      var detailsConfirmations = (_this$modal2 = this.modal) === null || _this$modal2 === void 0 ? void 0 : _this$modal2.querySelectorAll('.customer-details-confirmation');
      if (!detailsConfirmations || detailsConfirmations.length === 0) {
        return; // No confirmation areas found
      }
      detailsConfirmations.forEach(function (confirmation) {
        // Find the details paragraph
        var detailsPara = confirmation.querySelector('.saved-customer-details p');
        if (!detailsPara) return;

        // Build HTML with new details
        var html = '';
        if (details.name && details.name.trim() !== '') {
          html += "<strong>".concat(details.name, "</strong><br>");
        }
        if (details.email && details.email.trim() !== '') {
          html += "".concat(details.email, "<br>");
        }
        if (details.phone && details.phone.trim() !== '') {
          html += "".concat(details.phone, "<br>");
        }
        html += details.postcode || '';

        // Update the paragraph
        detailsPara.innerHTML = html;

        // Update input fields in the edit form as well
        var editNameField = confirmation.querySelector('#edit-customer-name');
        var editEmailField = confirmation.querySelector('#edit-customer-email');
        var editPhoneField = confirmation.querySelector('#edit-customer-phone');
        var editPostcodeField = confirmation.querySelector('#edit-customer-postcode');
        if (editNameField && details.name) editNameField.value = details.name;
        if (editEmailField && details.email) editEmailField.value = details.email;
        if (editPhoneField && details.phone) editPhoneField.value = details.phone;
        if (editPostcodeField && details.postcode) editPostcodeField.value = details.postcode;
      });
    }

    /**
     * Handle room selection form submission with multi-estimate support
     * @param {HTMLFormElement} form - The submitted form
     */
  }, {
    key: "handleRoomSelection",
    value: function handleRoomSelection(form) {
      var _this28 = this;
      // Ensure all form values are strings to avoid type issues
      var roomDropdown = form.querySelector('#room-dropdown');
      var roomId = String(roomDropdown ? roomDropdown.value || '' : '').trim(); // Get roomId from dropdown
      var productId = String(this.currentProductId || '').trim();

      // Get the estimate ID from the form's data attribute
      var estimateId = String(this.roomSelectionForm.dataset.estimateId || '').trim();

      // Validate required data
      if (roomId === undefined || roomId === null || roomId === '') {
        this.showError('Please select a room');
        console.error('Room selection requires a valid room ID but it was empty or invalid');
        return;
      }
      if (productId === undefined || productId === null || productId === '' || productId === '0') {
        this.showError('No product selected');
        console.error('Room selection requires a valid product ID but it was empty or invalid');
        return;
      }

      // Debug information - log before submission
      console.log('Room selection validated with:', {
        roomId: roomId,
        productId: productId,
        estimateId: estimateId
      });
      this.showLoading();

      // Make the AJAX request using DataService
      this.dataService.addProductToRoom(roomId, productId, estimateId).then(function (response) {
        console.log('Add product response:', response);

        // Hide selection forms
        _this28.estimateSelection.style.display = 'none';
        _this28.roomSelectionForm.style.display = 'none';

        // Clear the product ID from the modal after successful addition
        delete _this28.modal.dataset.productId;
        _this28.currentProductId = null;

        // Get the estimate and room IDs from the response
        var responseEstimateId = response.estimate_id || estimateId;
        var responseRoomId = response.room_id || roomId;
        console.log("Product added to estimate ".concat(responseEstimateId, ", room ").concat(responseRoomId));

        // Refresh the estimates list to show the updated room
        _this28.loadEstimatesList(responseRoomId, responseEstimateId).then(function () {
          // Show success message
          _this28.showMessage('Product added successfully!', 'success');
        })["catch"](function (error) {
          console.error('Error refreshing estimates list:', error);
          _this28.showError('Error refreshing estimates list. Please try again.');
        });
      })["catch"](function (error) {
        var _error$data2;
        // Check if this is a duplicate product error (assuming DataService adds this property)
        if ((_error$data2 = error.data) !== null && _error$data2 !== void 0 && _error$data2.duplicate) {
          console.log('Duplicate product detected:', error.data);

          // Hide selection forms
          _this28.estimateSelection.style.display = 'none';
          _this28.roomSelectionForm.style.display = 'none';

          // Clear the product ID after handling
          delete _this28.modal.dataset.productId;
          _this28.currentProductId = null;
          var duplicateEstimateId = error.data.estimate_id;
          var duplicateRoomId = error.data.room_id;

          // Show specific error message
          _this28.showError(error.data.message || 'This product already exists in the selected room.');

          // Load the estimates and expand the specific room where the product already exists
          _this28.loadEstimatesList(duplicateRoomId, duplicateEstimateId).then(function () {
            console.log('Estimates list refreshed to show duplicate product location');
            setTimeout(function () {
              // Find and expand the estimate containing the room
              var estimateSection = _this28.modal.querySelector(".estimate-section[data-estimate-id=\"".concat(duplicateEstimateId, "\"]"));
              if (estimateSection && estimateSection.classList.contains('collapsed')) {
                // Remove collapsed class
                estimateSection.classList.remove('collapsed');
                // Show content
                var estimateContent = estimateSection.querySelector('.estimate-content');
                if (estimateContent) {
                  if (typeof jQuery !== 'undefined') {
                    jQuery(estimateContent).slideDown(200);
                  } else {
                    estimateContent.style.display = 'block';
                  }
                }
              }

              // Find and expand the room accordion
              var roomElement = _this28.modal.querySelector(".accordion-item[data-room-id=\"".concat(duplicateRoomId, "\"]"));
              if (roomElement) {
                var header = roomElement.querySelector('.accordion-header');
                if (header && !header.classList.contains('active')) {
                  // Add active class
                  header.classList.add('active');

                  // Show room content
                  var content = roomElement.querySelector('.accordion-content');
                  if (content) {
                    if (typeof jQuery !== 'undefined') {
                      jQuery(content).slideDown(300, function () {
                        // Scroll to room after animation completes
                        roomElement[0].scrollIntoView({
                          behavior: 'smooth',
                          block: 'center'
                        });
                      });
                    } else {
                      content.style.display = 'block';
                      roomElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                      });
                    }
                  }
                } else {
                  // Room is already expanded, just scroll to it
                  roomElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                  });
                }
              }
            }, 300); // Wa
          })["catch"](function (error) {
            console.error('Error refreshing estimates list:', error);
          });
        } else {
          // Handle regular error response
          var errorMessage = error.message || 'Error adding product to room. Please try again.';
          _this28.showError(errorMessage);
          console.error('DataService error:', error);
        }
      })["finally"](function () {
        _this28.hideLoading();
      });
    }
    /**
     * Handle new estimate form submission with improved loader handling
     * @param {HTMLFormElement} form - The submitted form
     */
  }, {
    key: "handleNewEstimateSubmission",
    value: function handleNewEstimateSubmission(form) {
      var _this29 = this;
      var formData = new FormData(form);
      var productId = this.currentProductId;
      var estimateName = formData.get('estimate_name') || 'Unnamed Estimate';
      this.showLoading();

      // Use console.log to debug the process
      console.log('Submitting new estimate form');
      console.log(formData);
      this.dataService.addNewEstimate(formData, productId).then(function (response) {
        // Check that we got a valid estimate_id
        console.log('New estimate created with ID:', response.estimate_id);

        // === START: Save customer details from the form to localStorage ===
        var customerDetails = {
          name: formData.get('customer_name') || '',
          email: formData.get('customer_email') || '',
          phone: formData.get('customer_phone') || '',
          postcode: formData.get('customer_postcode') || ''
        };
        (0,_CustomerStorage__WEBPACK_IMPORTED_MODULE_7__.saveCustomerDetails)(customerDetails); // Use the imported function
        _this29.log('Customer details from new estimate form saved to localStorage:', customerDetails);
        // === END: Save customer details ===

        // Clear form
        form.reset();

        // Hide new estimate form
        _this29.newEstimateForm.style.display = 'none';
        if (productId) {
          // Show new room form for the new estimate
          // THIS IS THE KEY PART - we need to properly pass the new estimate ID
          var newEstimateId = response.estimate_id;
          console.log('Setting new room form with estimate ID:', newEstimateId);

          // Set on container element
          _this29.newRoomForm.dataset.estimateId = newEstimateId;

          // Also ensure it's set on the actual form element
          var roomForm = _this29.newRoomForm.querySelector('form');
          if (roomForm) {
            roomForm.dataset.estimateId = newEstimateId;
            console.log('Form dataset updated:', roomForm.dataset);
          } else {
            console.error('Could not find room form element');
          }
          _this29.newRoomForm.dataset.productId = productId;
          _this29.forceElementVisibility(_this29.newRoomForm);

          // Important - hide the loading indicator when showing the new form
          _this29.hideLoading();
        } else {
          // Just refresh the estimates list
          _this29.loadEstimatesList()["catch"](function (error) {
            _this29.log('Error refreshing estimates list:', error);
            _this29.showError('Error refreshing estimates list. Please try again.');
          })["finally"](function () {
            // Make sure to hide the loading indicator
            _this29.hideLoading();
          });
        }
      })["catch"](function (error) {
        _this29.log('Error creating estimate:', error);
        _this29.showError(error.message || 'Error creating estimate. Please try again.');
        // Make sure to hide the loading indicator on error
        _this29.hideLoading();
      });
    }

    /**
     * Handle new room form submission with multi-estimate support
     * @param {HTMLFormElement} form - The submitted form
     * @param {Event} event - The form submission event
     */
  }, {
    key: "handleNewRoomSubmission",
    value: function handleNewRoomSubmission(form, event) {
      var _this30 = this;
      console.log('Processing new room form submission via DataService');

      // Prevent default form submission which would cause page reload
      if (event) {
        event.preventDefault();
      } else if (typeof window.event !== 'undefined') {
        window.event.preventDefault();
      }

      // Check form validity
      if (!form.checkValidity()) {
        console.error('Form validation failed');
        form.reportValidity();
        return;
      }

      // Get the estimate ID directly from the form's dataset
      var formData = new FormData(form);
      var estimateId = form.dataset.estimateId;
      var productId = this.currentProductId || form.dataset.productId;

      // Log the full state for debugging
      console.log('Room form submission data:', {
        formElement: form,
        formDataset: form.dataset,
        containerDataset: this.newRoomForm.dataset,
        estimateId: estimateId,
        productId: productId,
        formData: Object.fromEntries(formData)
      });
      if (estimateId === undefined || estimateId === null || estimateId === '') {
        this.showError('No estimate selected for this room.');
        return;
      }
      this.showLoading();

      // Add a specific log message for the DataService call
      console.log('Calling DataService.addNewRoom for estimate ID:', estimateId);

      // Use DataService to submit the form data
      this.dataService.addNewRoom(formData, estimateId, productId).then(function (response) {
        console.log('DataService.addNewRoom response:', response);

        // Clear form
        form.reset();

        // Hide new room form
        _this30.newRoomForm.style.display = 'none';

        // Clear the product ID from the modal after successful addition
        delete _this30.modal.dataset.productId;
        _this30.currentProductId = null;

        // Get estimate and room IDs from the response
        var responseEstimateId = response.estimate_id || estimateId;
        var responseRoomId = response.room_id || '0'; // Use '0' or handle appropriately if room_id might be missing

        // Refresh the estimates list to show the new room
        _this30.loadEstimatesList(responseRoomId, responseEstimateId).then(function () {
          // Show success message
          _this30.showMessage('Room added successfully!', 'success');
        })["catch"](function (error) {
          console.error('Error refreshing estimates list:', error);
          _this30.showError('Error refreshing estimates list. Please try again.');
        });
      })["catch"](function (error) {
        // Handle error response from DataService
        console.error('Error adding room via DataService:', error);
        _this30.showError(error.message || 'Error adding room. Please try again.');
      })["finally"](function () {
        _this30.hideLoading();
      });
    }

    /**
     * Cancel a form and return to previous view
     * @param {string} formType - Form type ('estimate' or 'room')
     */
  }, {
    key: "cancelForm",
    value: function cancelForm(formType) {
      var _this31 = this;
      console.log("Canceling form type: ".concat(formType));
      switch (formType) {
        case 'estimate':
          // Hide the new estimate form
          if (this.newEstimateForm) {
            this.newEstimateForm.style.display = 'none';
          }

          // If we have a product ID, go back to estimate selection if estimates exist
          if (this.currentProductId) {
            this.dataService.checkEstimatesExist().then(function (hasEstimates) {
              if (hasEstimates) {
                // Show estimate selection form (product flow)
                _this31.forceElementVisibility(_this31.estimateSelectionForm);
                _this31.forceElementVisibility(_this31.estimateSelection);
              } else {
                // No estimates, show the estimates list
                _this31.forceElementVisibility(_this31.estimatesList);
              }
            })["catch"](function (error) {
              console.error('Error checking estimates:', error);
              // On error, just show the estimates list
              _this31.forceElementVisibility(_this31.estimatesList);
            });
          } else {
            // No product ID, we're in the general flow, show the estimates list
            this.forceElementVisibility(this.estimatesList);
          }
          break;
        case 'room':
          // Hide the new room form
          if (this.newRoomForm) {
            this.newRoomForm.style.display = 'none';
          }

          // If we have a product ID and came from room selection
          if (this.currentProductId && this.roomSelectionForm.dataset.estimateId) {
            // Return to room selection (we were adding a new room during product addition)
            this.forceElementVisibility(this.roomSelectionForm);
            this.forceElementVisibility(this.estimateSelection);
          } else {
            // Regular flow (no product being added), return to estimates list
            this.forceElementVisibility(this.estimatesList);
          }
          break;
        default:
          console.warn("Unknown form type: ".concat(formType));
          // Default behavior - show the estimates list
          this.forceElementVisibility(this.estimatesList);
          break;
      }
    }

    /**
     * Initialize estimate accordions with support for auto-expanding specific estimates
     * @param {string|null} expandRoomId - Optional room ID to auto-expand
     * @param {string|null} expandEstimateId - Optional estimate ID to auto-expand
     */
  }, {
    key: "initializeEstimateAccordions",
    value: function initializeEstimateAccordions() {
      var expandRoomId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var expandEstimateId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      console.log('Initializing estimate accordions');

      // Find all estimate headers within the modal
      var estimateHeaders = this.modal.querySelectorAll('.estimate-header');
      console.log("Found ".concat(estimateHeaders.length, " estimate headers to initialize"));

      // Clear previous handlers
      estimateHeaders.forEach(function (header) {
        var newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);

        // Add new handler directly to the cloned node
        newHeader.addEventListener('click', function (e) {
          // Skip if clicking on a button
          if (e.target.closest('.remove-estimate')) {
            e.stopPropagation();
            return;
          }
          console.log('Estimate header clicked');

          // Find the parent estimate section
          var estimateSection = this.closest('.estimate-section');
          if (!estimateSection) {
            console.error('No parent estimate section found');
            return;
          }

          // Toggle the collapsed state
          estimateSection.classList.toggle('collapsed');
          console.log('Toggled collapsed class on estimate section');

          // Find the content element
          var content = estimateSection.querySelector('.estimate-content');
          if (!content) {
            console.error('No estimate content element found');
            return;
          }

          // Toggle the content visibility
          if (estimateSection.classList.contains('collapsed')) {
            // Hide content
            content.style.display = 'none';
          } else {
            // Show content
            content.style.display = 'block';
          }
        });
      });
      console.log('Estimate accordions initialization complete');
    }

    /**
     * Toggle estimate accordion expansion
     * @param {HTMLElement} header - The estimate header element
     */
  }, {
    key: "toggleEstimateAccordion",
    value: function toggleEstimateAccordion(header) {
      console.log('Toggling estimate accordion', header);

      // Find the estimate section
      var estimateSection = header.closest('.estimate-section');
      if (!estimateSection) {
        console.error('No parent estimate section found');
        return;
      }

      // Toggle collapsed class with explicit logging
      var wasCollapsed = estimateSection.classList.contains('collapsed');
      console.log("Estimate section was ".concat(wasCollapsed ? 'collapsed' : 'expanded', ", toggling state"));
      estimateSection.classList.toggle('collapsed');
      var isNowCollapsed = estimateSection.classList.contains('collapsed');
      console.log("Estimate section is now ".concat(isNowCollapsed ? 'collapsed' : 'expanded'));

      // Find the content container
      var content = estimateSection.querySelector('.estimate-content');
      if (!content) {
        console.error('No estimate content found');
        return;
      }

      // Toggle display of content with animation if jQuery is available
      if (isNowCollapsed) {
        console.log('Collapsing estimate content');
        if (typeof jQuery !== 'undefined') {
          jQuery(content).slideUp(200);
        } else {
          content.style.display = 'none';
        }
      } else {
        console.log('Expanding estimate content');
        if (typeof jQuery !== 'undefined') {
          jQuery(content).slideDown(200);
        } else {
          content.style.display = 'block';
        }
      }
    }

    /**
     * Initialize accordion functionality for rooms with better multi-estimate support
     * @param {string|null} expandRoomId - Optional room ID to auto-expand after initialization
     * @param {string|null} expandEstimateId - Optional estimate ID containing the room
     */
  }, {
    key: "initializeAccordions",
    value: function initializeAccordions() {
      var _this32 = this;
      var expandRoomId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var expandEstimateId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      if (!this.modal) {
        console.error('[ModalManager] Modal not available for initializing accordions');
        return;
      }

      // Remove any existing event listener with same function
      if (this.accordionHandler) {
        this.estimatesList.removeEventListener('click', this.accordionHandler);
      }

      // Create a new handler function and store reference for later removal
      this.accordionHandler = function (e) {
        var header = e.target.closest('.accordion-header');
        if (header) {
          e.preventDefault();
          e.stopPropagation();
          _this32.log('Accordion header clicked via delegation');
          _this32.toggleAccordionItem(header);

          // After toggling, initialize carousels in this accordion
          var accordionItem = header.closest('.accordion-item');
          if (accordionItem) {
            var content = accordionItem.querySelector('.accordion-content');
            if (content && window.getComputedStyle(content).display !== 'none') {
              // Content is visible, initialize carousels
              setTimeout(function () {
                // Find carousels within this content - check for both types
                var carousels = content.querySelectorAll('.suggestions-carousel');
                if (carousels.length) {
                  _this32.log("Found ".concat(carousels.length, " carousels in opened accordion"));
                  if (typeof _SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_6__.initSuggestionsCarousels === 'function') {
                    (0,_SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_6__.initSuggestionsCarousels)();
                  }
                }
              }, 100);
            }
          }
        }
      };

      // Add the event listener to the estimates list container
      if (this.estimatesList) {
        this.estimatesList.addEventListener('click', this.accordionHandler);
        this.log('Accordion event handler (re)attached');

        // If a specific room ID is provided, expand that accordion item
        if (expandRoomId) {
          // More specific selector that includes estimate ID when available
          var selector = ".accordion-item[data-room-id=\"".concat(expandRoomId, "\"]");

          // If specific estimate ID is provided, make the selector more precise
          if (expandEstimateId) {
            selector = ".estimate-section[data-estimate-id=\"".concat(expandEstimateId, "\"] ").concat(selector);
          }
          var roomElement = this.modal.querySelector(selector);
          if (roomElement) {
            this.log("Found room element to expand: ".concat(selector));

            // First ensure the estimate container is visible if it's a nested structure
            var estimateSection = roomElement.closest('.estimate-section');
            if (estimateSection) {
              // Make sure the estimate section is visible
              estimateSection.style.display = 'block';
            }

            // Now expand the room accordion
            var header = roomElement.querySelector('.accordion-header');
            if (header) {
              // Add active class
              header.classList.add('active');

              // Find and show content
              var content = roomElement.querySelector('.accordion-content');
              if (content) {
                content.style.display = 'block';

                // Try jQuery if available for smoother animation
                if (typeof jQuery !== 'undefined') {
                  jQuery(content).show(300);
                }

                // Initialize carousels in the expanded room
                setTimeout(function () {
                  if (typeof _SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_6__.initSuggestionsCarousels === 'function') {
                    (0,_SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_6__.initSuggestionsCarousels)();
                  }
                }, 150);
              }

              // Scroll to the expanded room
              setTimeout(function () {
                roomElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center'
                });
              }, 150);
              this.log("Auto-expanded room ID: ".concat(expandRoomId, " in estimate: ").concat(expandEstimateId || 'any'));
            }
          } else {
            this.log("Room ID ".concat(expandRoomId, " not found for auto-expansion"));
            // If room wasn't found, log all available rooms for debugging
            var allRooms = this.modal.querySelectorAll('.accordion-item[data-room-id]');
            this.log("Available rooms: ".concat(Array.from(allRooms).map(function (r) {
              return r.dataset.roomId;
            }).join(', ')));
          }
        }
      }
    }

    /**
     * Toggle accordion item expansion with enhanced animation
     * @param {HTMLElement} header - The accordion header element
     */
  }, {
    key: "toggleAccordionItem",
    value: function toggleAccordionItem(header) {
      this.log('Toggling accordion item');

      // Toggle active class on header
      header.classList.toggle('active');

      // Find the accordion content
      var accordionItem = header.closest('.accordion-item');
      if (!accordionItem) {
        this.log('No parent accordion item found');
        return;
      }
      var content = accordionItem.querySelector('.accordion-content');
      if (!content) {
        this.log('No accordion content found');
        return;
      }

      // Toggle display of content with animation if jQuery is available
      if (header.classList.contains('active')) {
        this.log('Opening accordion content');
        if (typeof jQuery !== 'undefined') {
          jQuery(content).slideDown(200);
        } else {
          content.style.display = 'block';
        }
      } else {
        this.log('Closing accordion content');
        if (typeof jQuery !== 'undefined') {
          jQuery(content).slideUp(200);
        } else {
          content.style.display = 'none';
        }
      }
    }

    /**
     * Initialize jQuery fallback for accordions with improved multi-estimate support
     * @param {string|null} expandRoomId - Optional room ID to expand after initialization
     * @param {string|null} expandEstimateId - Optional estimate ID containing the room
     */
  }, {
    key: "initializeJQueryAccordions",
    value: function initializeJQueryAccordions() {
      var expandRoomId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var expandEstimateId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      if (typeof jQuery === 'undefined') {
        this.log('jQuery not available for fallback');
        return;
      }

      // Unbind existing handlers before adding new ones
      jQuery(document).off('click', '.accordion-header');
      jQuery(document).on('click', '.accordion-header', function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('jQuery accordion handler triggered');
        var $header = jQuery(this);
        $header.toggleClass('active');
        var $content = $header.closest('.accordion-item').find('.accordion-content');
        if ($content.length) {
          if ($header.hasClass('active')) {
            $content.slideDown(200);
          } else {
            $content.slideUp(200);
          }
        }
      });

      // Auto-expand specific room if provided
      if (expandRoomId) {
        // Add a small delay to ensure the DOM is ready
        setTimeout(function () {
          // Build selector based on available information
          var selector = ".accordion-item[data-room-id=\"".concat(expandRoomId, "\"]");

          // If we have an estimate ID, make the selector more precise
          if (expandEstimateId) {
            selector = ".estimate-section[data-estimate-id=\"".concat(expandEstimateId, "\"] ").concat(selector);
          }
          console.log("Looking for room with selector: ".concat(selector));
          var $roomElement = jQuery(selector);
          if ($roomElement.length) {
            console.log("Found room element using jQuery: ".concat(selector));

            // Make sure the estimate section is expanded if nested
            var $estimateSection = $roomElement.closest('.estimate-section');
            if ($estimateSection.length) {
              $estimateSection.show();
            }
            var $header = $roomElement.find('.accordion-header');
            if ($header.length) {
              // Add active class
              $header.addClass('active');

              // Show the content
              var $content = $roomElement.find('.accordion-content');
              if ($content.length) {
                $content.slideDown(300, function () {
                  // Scroll to room after animation completes
                  $roomElement[0].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                  });
                });
              }
              console.log("jQuery auto-expanded room ID: ".concat(expandRoomId, " in estimate: ").concat(expandEstimateId || 'any'));
            }
          } else {
            console.warn("Room element not found with jQuery using selector: ".concat(selector));
            console.log('Available room elements:', jQuery('.accordion-item[data-room-id]').map(function () {
              return jQuery(this).data('roomId');
            }).get());
          }
        }, 300); // Longer delay for more reliability
      }
    }

    /**
     * Update the estimates list view with enhanced room expansion
     * @param {string|null} expandRoomId - Optional room ID to expand after update
     * @param {string|null} expandEstimateId - Optional estimate ID containing the room
     */
  }, {
    key: "updateEstimatesList",
    value: function updateEstimatesList() {
      var _this33 = this;
      var expandRoomId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var expandEstimateId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      // Check if there are any estimates
      var hasEstimates = !!this.modal.querySelector('.estimate-section');

      // If no estimates, DON'T add create button - it's already in the template
      // We'll just ensure the existing no-estimates div is properly shown
      if (!hasEstimates) {
        var noEstimatesDiv = this.modal.querySelector('.no-estimates');
        if (noEstimatesDiv) {
          noEstimatesDiv.style.display = 'block';

          // Make sure the button has the right event handler
          var createButton = noEstimatesDiv.querySelector('#create-estimate-btn');
          if (createButton) {
            // Remove any existing event listeners to prevent duplication
            if (this._createEstimateBtnHandler) {
              createButton.removeEventListener('click', this._createEstimateBtnHandler);
            }

            // Create and store new handler
            this._createEstimateBtnHandler = function () {
              _this33.showNewEstimateForm();
            };

            // Add the new handler
            createButton.addEventListener('click', this._createEstimateBtnHandler);
            console.log('Added event handler to existing create estimate button');
          }
        }
      } else {
        // If we have estimates, make sure the no-estimates div is hidden
        var _noEstimatesDiv = this.modal.querySelector('.no-estimates');
        if (_noEstimatesDiv) {
          _noEstimatesDiv.style.display = 'none';
        }
      }

      // Update all suggestions visibility
      this.updateAllSuggestionsVisibility();

      // Initialize estimate accordions
      this.initializeEstimateAccordions(expandRoomId, expandEstimateId);

      // Initialize accordions with auto-expansion if a room ID is specified
      this.initializeAccordions(expandRoomId, expandEstimateId);
      this.initializeCarousels();

      // Bind the replace product buttons
      this.bindReplaceProductButtons();

      // Also bind the suggested product buttons again
      this.bindSuggestedProductButtons();
    }

    /**
     * Update suggestion visibility based on room contents
     * @param {string} estimateId - Estimate ID
     * @param {string} roomId - Room ID
     */
  }, {
    key: "updateSuggestionVisibility",
    value: function updateSuggestionVisibility(estimateId, roomId) {
      // Find the room element
      var roomElement = this.modal.querySelector(".accordion-item[data-room-id=\"".concat(roomId, "\"]"));
      if (!roomElement) return;

      // Check if this room has any products
      var hasProducts = roomElement.querySelectorAll('.product-item:not(.product-note-item)').length > 0;

      // Find the product suggestions section
      var suggestions = roomElement.querySelector('.product-suggestions');
      if (!suggestions) return;

      // Toggle visibility based on whether there are products in the room
      suggestions.style.display = hasProducts ? 'block' : 'none';
    }

    /**
     * Update visibility of suggestions for all rooms
     */
  }, {
    key: "updateAllSuggestionsVisibility",
    value: function updateAllSuggestionsVisibility() {
      var rooms = this.modal.querySelectorAll('.accordion-item');
      rooms.forEach(function (room) {
        var _room$closest;
        var roomId = room.dataset.roomId;
        var estimateId = (_room$closest = room.closest('.estimate-section')) === null || _room$closest === void 0 ? void 0 : _room$closest.dataset.estimateId;
        if (!roomId || !estimateId) return;

        // Check if this room has any products (excluding note items)
        var hasProducts = room.querySelectorAll('.product-item:not(.product-note-item)').length > 0;

        // Find the product suggestions section
        var suggestions = room.querySelector('.product-suggestions');
        if (!suggestions) return;

        // Toggle visibility based on whether there are products in the room
        suggestions.style.display = hasProducts ? 'block' : 'none';
      });
    }

    /**
     * Show a message to the user
     * @param {string} message - The message to display
     * @param {string} type - Message type ('success' or 'error')
     */
  }, {
    key: "showMessage",
    value: function showMessage(message) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'success';
      // Find the form container first
      var formContainer = this.contentContainer || document.querySelector('.product-estimator-modal-form-container');
      if (!formContainer) {
        // If we can't find the container, log the error but don't try to prepend
        console.error('Form container not found for message display:', message);
        return;
      }

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

      // Safely prepend to container
      try {
        formContainer.prepend(messageEl);
      } catch (e) {
        console.error('Error adding message to container:', e);
      }

      // Auto-remove after 5 seconds
      setTimeout(function () {
        if (messageEl.parentNode) {
          messageEl.remove();
        }
      }, 5000);
    }
    /**
     * Show error message
     * @param {string} message - Error message
     */
  }, {
    key: "showError",
    value: function showError(message) {
      this.showMessage(message, 'error');
    }

    /**
     * Register an event handler
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     * @returns {ModalManager} - This instance for chaining
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
     * @returns {ModalManager} - This instance for chaining
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
     * Diagnostic function to check for duplicate elements
     */
  }, {
    key: "checkModalElements",
    value: function checkModalElements() {
      console.group('🔍 MODAL ELEMENTS CHECK');

      // Check for duplicates
      var checkElement = function checkElement(selector, name) {
        var elements = document.querySelectorAll(selector);
        console.log("".concat(name, ": ").concat(elements.length, " elements found"));
        return elements.length;
      };
      checkElement('#product-estimator-modal', 'Modal container');
      checkElement('.product-estimator-modal-form-container', 'Form container');
      checkElement('#estimates', 'Estimates list');
      checkElement('#estimate-selection-wrapper', 'Estimate selection');
      checkElement('#estimate-selection-form-wrapper', 'Estimate selection form');
      checkElement('#new-estimate-form-wrapper', 'New estimate form');

      // Check our specific element's visibility
      var estimateSelection = document.querySelector('#estimate-selection-wrapper');
      if (estimateSelection) {
        console.log('Estimate selection container:', {
          display: estimateSelection.style.display,
          computedDisplay: window.getComputedStyle(estimateSelection).display,
          visibility: window.getComputedStyle(estimateSelection).visibility,
          opacity: window.getComputedStyle(estimateSelection).opacity,
          parent: estimateSelection.parentElement ? estimateSelection.parentElement.tagName : 'none'
        });
      } else {
        console.warn('Estimate selection container not found');
      }
      console.groupEnd();
    }

    /**
     * Completely revised bindReplaceProductButtons method that ensures
     * consistent button behavior between page refreshes
     */
  }, {
    key: "bindReplaceProductButtons",
    value: function bindReplaceProductButtons() {
      var _this34 = this;
      // console.log('[BUTTON BINDING] Binding replace product buttons');

      // Find all replacement buttons in the modal
      var replaceButtons = this.modal.querySelectorAll('.replace-product-in-room');
      if (replaceButtons.length) {
        // console.log(`[BUTTON BINDING] Found ${replaceButtons.length} replace buttons to bind`);

        // Loop through each button and bind click event
        replaceButtons.forEach(function (button, index) {
          // Log each button's attributes for debugging
          console.log("[BUTTON BINDING] Button #".concat(index + 1, " attributes:"), {
            productId: button.dataset.productId,
            estimateId: button.dataset.estimateId,
            roomId: button.dataset.roomId,
            replaceProductId: button.dataset.replaceProductId,
            replaceType: button.dataset.replaceType || 'main'
          });

          // Remove any existing handlers to prevent duplicates
          if (button._replaceButtonHandler) {
            button.removeEventListener('click', button._replaceButtonHandler);
          }

          // Create and store new handler directly on button element
          button._replaceButtonHandler = function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Get data attributes - explicitly check the button.dataset properties
            var newProductId = button.dataset.productId;
            var estimateId = button.dataset.estimateId;
            var roomId = button.dataset.roomId;
            var oldProductId = button.dataset.replaceProductId;
            var parentProductId = button.dataset.parentProductId || null; // Get parent product ID

            // Get the replace type - defaulting to 'main' if not specified
            var replaceType = button.hasAttribute('data-replace-type') ? button.getAttribute('data-replace-type') : 'main';
            console.log('[BUTTON CLICKED] Replace product button clicked:', {
              estimateId: estimateId,
              roomId: roomId,
              oldProductId: oldProductId,
              newProductId: newProductId,
              replaceType: replaceType
            });

            // Handle replacing the product with confirmation dialog
            _this34.handleReplaceProduct(estimateId, roomId, oldProductId, newProductId, parentProductId, button, replaceType);
          };

          // Add click event listener
          button.addEventListener('click', button._replaceButtonHandler);
        });
        console.log('[BUTTON BINDING] Replace product buttons bound successfully');
      } else {
        console.log('[BUTTON BINDING] No replace product buttons found to bind');
      }
    }

    /**
     * Comprehensively fixed handleReplaceProduct method
     * This method handles replacing products with enhanced front-end handling
     *
     * @param {string} estimateId - Estimate ID
     * @param {string} roomId - Room ID
     * @param {string} oldProductId - ID of product to replace
     * @param {string} newProductId - ID of new product
     * @param {string|null} parentProductId - ID of the parent product (if replacing additional product)
     * @param {HTMLElement} buttonElement - Button element for UI feedback
     * @param {string} replaceType - Type of replacement ('main' or 'additional_products')
     */
  }, {
    key: "handleReplaceProduct",
    value: function handleReplaceProduct(estimateId, roomId, oldProductId, newProductId, parentProductId, buttonElement) {
      var _this35 = this;
      var replaceType = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'main';
      // First, log detailed replacement information for debugging
      console.log("[PRODUCT REPLACEMENT] Starting product replacement process\n    Type: ".concat(replaceType, "\n    Old Product ID: ").concat(oldProductId, "\n    New Product ID: ").concat(newProductId, "\n    Parent Product ID: ").concat(parentProductId, " // Log parent product ID\n    Room ID: ").concat(roomId, "\n    Estimate ID: ").concat(estimateId, "\n  "));

      // Get product names if available (from button attributes or nearby elements)
      var oldProductName = "this product";
      var newProductName = "the selected product";
      try {
        // Try to get product names from DOM
        if (buttonElement) {
          // Get name of new product (the one in the carousel or tile)
          var productItem = buttonElement.closest('.suggestion-item, .upgrade-tile');
          if (productItem) {
            var nameEl = productItem.querySelector('.suggestion-name, .tile-label');
            if (nameEl) {
              newProductName = nameEl.textContent.trim();
            }
          }

          // For additional products (find in the includes section)
          if (replaceType === 'additional_products') {
            console.log('Looking for additional product name to replace');

            // Find the product item that contains this button (usually the outer parent)
            var mainProductItem = buttonElement.closest('.product-item');
            if (mainProductItem) {
              // Look specifically within this product's includes section
              // and find the include-item that matches our oldProductId
              var includeItems = mainProductItem.querySelectorAll('.include-item');
              console.log("Found ".concat(includeItems.length, " include items to search through"));
              var _iterator = _createForOfIteratorHelper(includeItems),
                _step;
              try {
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                  var item = _step.value;
                  var _nameEl = item.querySelector('.include-item-name');
                  if (_nameEl) {
                    // For additional products, we need a better way to match
                    // Look for data attributes if available
                    var includeProduct = item.closest('[data-product-id]');
                    if (includeProduct && includeProduct.dataset.productId === oldProductId) {
                      oldProductName = _nameEl.textContent.trim();
                      console.log("Found matching additional product: ".concat(oldProductName));
                      break;
                    } else {
                      // If no data attribute, just use the first one we find
                      // This is a fallback that might not be accurate
                      oldProductName = _nameEl.textContent.trim();
                    }
                  }
                }
              } catch (err) {
                _iterator.e(err);
              } finally {
                _iterator.f();
              }
            }
          }
          // For main products
          else {
            var productWrapper = buttonElement.closest('.product-item');
            if (productWrapper) {
              var _nameEl2 = productWrapper.querySelector('.product-name, .price-title');
              if (_nameEl2) {
                oldProductName = _nameEl2.textContent.trim();
                console.log("Found main product name: ".concat(oldProductName));
              }
            }
          }
        }
      } catch (e) {
        console.warn('Could not determine product names for confirmation dialog:', e);
      }

      // Build confirmation message
      var confirmMessage = "Are you sure you want to replace \"".concat(oldProductName, "\" with \"").concat(newProductName, "\"?");

      // Use the confirmation dialog
      if (window.productEstimator && window.productEstimator.dialog) {
        window.productEstimator.dialog.show({
          title: 'Confirm Upgrade',
          message: confirmMessage,
          type: 'product',
          // Using product type for styling
          action: 'upgrade_product',
          confirmText: 'Upgrade',
          cancelText: 'Cancel',
          onConfirm: function onConfirm() {
            // Proceed with replacement, passing parentProductId
            _this35.executeProductReplacement(estimateId, roomId, oldProductId, newProductId, parentProductId, buttonElement, replaceType);
          },
          onCancel: function onCancel() {
            // Reset button state if needed
            if (buttonElement) {
              buttonElement.disabled = false;
              buttonElement.classList.remove('loading');
              buttonElement.textContent = 'Upgrade';
            }
            console.log('Product upgrade cancelled');
          }
        });
      } else {
        // Fallback to browser confirm if custom dialog isn't available
        if (confirm(confirmMessage)) {
          this.executeProductReplacement(estimateId, roomId, oldProductId, newProductId, parentProductId, buttonElement, replaceType);
        } else {
          // Reset button state if needed
          if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.classList.remove('loading');
            buttonElement.textContent = 'Upgrade';
          }
        }
      }
    }

    /**
     * Enhanced method to reload and properly expand estimates and rooms,
     * especially after product replacements
     *
     * @param {string} roomId - Room ID to expand
     * @param {string} estimateId - Estimate ID to expand
     * @param {string|null} productId - Optional product ID to highlight
     * @returns {Promise} Promise that resolves when list is loaded and expanded
     */
  }, {
    key: "reloadAndExpandEstimatesList",
    value: function reloadAndExpandEstimatesList(roomId, estimateId) {
      var _this36 = this;
      var productId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      return new Promise(function (resolve, reject) {
        _this36.showLoading();
        console.log("Reloading estimates list with expansion params - Room: ".concat(roomId, ", Estimate: ").concat(estimateId, ", Product: ").concat(productId));

        // Load the estimates list
        _this36.loadEstimatesList(roomId, estimateId).then(function () {
          // First, find and expand the estimate
          setTimeout(function () {
            var estimateSection = _this36.modal.querySelector(".estimate-section[data-estimate-id=\"".concat(estimateId, "\"]"));
            if (estimateSection) {
              console.log("Found estimate section: ".concat(estimateId));

              // Remove collapsed class
              estimateSection.classList.remove('collapsed');

              // Show estimate content
              var estimateContent = estimateSection.querySelector('.estimate-content');
              if (estimateContent) {
                estimateContent.style.display = 'block';
              }
            }

            // Now find and expand the room
            setTimeout(function () {
              var roomElement = _this36.modal.querySelector(".accordion-item[data-room-id=\"".concat(roomId, "\"][data-estimate-id=\"").concat(estimateId, "\"]")) || _this36.modal.querySelector(".accordion-item[data-room-id=\"".concat(roomId, "\"]"));
              if (roomElement) {
                console.log("Found and expanding room: ".concat(roomId));

                // Activate the header
                var header = roomElement.querySelector('.accordion-header');
                if (header) header.classList.add('active');

                // Show the content
                var content = roomElement.querySelector('.accordion-content');
                if (content) {
                  content.style.display = 'block';

                  // Initialize carousels in the expanded room
                  setTimeout(function () {
                    if (typeof _SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_6__.initSuggestionsCarousels === 'function') {
                      (0,_SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_6__.initSuggestionsCarousels)();
                    }

                    // If a product ID was provided, highlight it briefly
                    if (productId) {
                      var productElements = content.querySelectorAll('.product-item');
                      productElements.forEach(function (productEl) {
                        // Look for the product item that contains data for this product
                        if (productEl.dataset.productId === productId || productEl.querySelector("[data-product-id=\"".concat(productId, "\"]"))) {
                          // Highlight the product for attention
                          productEl.classList.add('highlight-product');

                          // Remove highlight after 2 seconds
                          setTimeout(function () {
                            productEl.classList.remove('highlight-product');
                          }, 2000);

                          // Scroll to make the product visible
                          productEl.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                          });
                        }
                      });
                    } else {
                      // No specific product to highlight, just scroll to the room
                      roomElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                      });
                    }
                  }, 150);
                }
              } else {
                console.warn("Room ID ".concat(roomId, " not found for auto-expansion"));
              }
            }, 150);
            console.warn("Estimate ID ".concat(estimateId, " not found for auto-expansion"));
          });
          resolve();
        })["catch"](function (error) {
          console.error('Error reloading estimates list:', error);
          reject(error);
        })["finally"](function () {
          _this36.hideLoading();
        });
      });
    }

    /**
     * Completely revised executeProductReplacement method for upgrading products
     * with more robust upgrade button handling
     *
     * @param {string} estimateId - Estimate ID
     * @param {string} roomId - Room ID
     * @param {string} oldProductId - ID of product to replace
     * @param {string} newProductId - ID of new product
    * @param {string|null} parentProductId - ID of the parent product (if replacing additional product)
     * @param {HTMLElement} buttonElement - Button element for UI feedback
     * @param {string} replaceType - Type of replacement ('main' or 'additional_products')
     */
  }, {
    key: "executeProductReplacement",
    value: function executeProductReplacement(estimateId, roomId, oldProductId, newProductId, parentProductId, buttonElement) {
      var _this37 = this;
      var replaceType = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'main';
      // Show loading indicator
      this.showLoading();

      // Show loading state on the button
      if (buttonElement) {
        buttonElement.disabled = true;
        buttonElement.classList.add('loading');
        buttonElement.innerHTML = '<span class="loading-dots">Upgrading...</span>';
      }
      console.log("[PRODUCT REPLACEMENT] Executing replacement via DataService:\n  Type: ".concat(replaceType, "\n  Old Product ID: ").concat(oldProductId, "\n  New Product ID: ").concat(newProductId, "\n  Room ID: ").concat(roomId, "\n  Parent Product ID: ").concat(parentProductId, "\n  Estimate ID: ").concat(estimateId));

      // Use DataService to make the replacement request
      this.dataService.replaceProductInRoom(estimateId, roomId, oldProductId, newProductId, parentProductId, replaceType).then(function (response) {
        // 'response' here is the 'data' payload from the server's successful response
        console.log('[PRODUCT REPLACEMENT] Server response (data payload):', response); // Added note for clarity

        // *** REMOVE THE INCORRECT IF (response.success) CHECK ***

        // Store the replacement chain in window for later reference
        // Check if response.replacement_chain exists in the data payload
        window._productReplacementChains = window._productReplacementChains || {};
        window._productReplacementChains["".concat(roomId, "_").concat(newProductId)] = response.replacement_chain || []; // Access replacement_chain directly from the data payload

        console.log('[PRODUCT REPLACEMENT] Just stored replacement chain, attempting to load estimates list...');

        // Refresh the estimates list with the room expanded
        _this37.loadEstimatesList(roomId, estimateId).then(function () {
          console.log('[PRODUCT REPLACEMENT] Estimates list refreshed');

          // Ensure the estimate section is expanded (this logic should now run)
          var estimateSection = _this37.modal.querySelector(".estimate-section[data-estimate-id=\"".concat(estimateId, "\"]"));
          if (estimateSection) {
            estimateSection.classList.remove('collapsed');
            var estimateContent = estimateSection.querySelector('.estimate-content');
            if (estimateContent) {
              // Use jQuery slideDown if available, otherwise display block
              if (typeof jQuery !== 'undefined') {
                jQuery(estimateContent).slideDown(200);
              } else {
                estimateContent.style.display = 'block';
              }
            }
          }

          // Find and expand the room (this logic should now run)
          var roomElement = _this37.modal.querySelector(".accordion-item[data-room-id=\"".concat(roomId, "\"][data-estimate-id=\"").concat(estimateId, "\"]")) || _this37.modal.querySelector(".accordion-item[data-room-id=\"".concat(roomId, "\"]"));
          if (roomElement) {
            console.log('[PRODUCT REPLACEMENT] Found room element, expanding');

            // Activate the header
            var header = roomElement.querySelector('.accordion-header');
            if (header) header.classList.add('active');

            // Show the content
            var content = roomElement.querySelector('.accordion-content');
            if (content) {
              // Use jQuery slideDown if available, otherwise display block
              if (typeof jQuery !== 'undefined') {
                jQuery(content).slideDown(300, function () {
                  // Scroll to the room after animation completes
                  roomElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                  });
                });
              } else {
                content.style.display = 'block';
                // Scroll immediately if no jQuery animation
                roomElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center'
                });
              }

              // CRITICAL FIX: Update the data-replace-product-id attributes on additional product buttons
              // to maintain reference to the original product ID for future upgrades
              if (replaceType === 'additional_products') {
                _this37.updateAdditionalProductUpgradeButtons(roomElement, newProductId, oldProductId);
              }

              // Initialize carousels in the expanded room
              setTimeout(function () {
                // Keep a small delay to ensure DOM is ready
                if (typeof _SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_6__.initSuggestionsCarousels === 'function') {
                  (0,_SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_6__.initSuggestionsCarousels)();
                }

                // Rebind all button events to ensure they work properly
                _this37.bindReplaceProductButtons();
                _this37.bindSuggestedProductButtons();
                _this37.updateAllReplacementChains(roomElement); // Ensure this function exists and works with the new structure

                // Show success message
                _this37.showMessage('Product upgraded successfully!', 'success');
              }, 300); // Small delay
            } else {
              console.warn('[PRODUCT REPLACEMENT] Room content element not found.');
              // If no room content, just show success message and hide loading
              _this37.showMessage('Product upgraded successfully!', 'success');
            }
          } else {
            console.warn("[PRODUCT REPLACEMENT] Could not find room element for room ID ".concat(roomId));
            _this37.showMessage('Product upgraded successfully!', 'success');
          }
        })["catch"](function (error) {
          // This catch handles errors specifically from loadEstimatesList
          console.error('[PRODUCT REPLACEMENT] Error refreshing estimates list:', error);
          _this37.showError('Error refreshing list after upgrade. Please try again.');
        });
      })["catch"](function (error) {
        // This catch handles errors from dataService.replaceProductInRoom itself
        // (e.g., server returned success: false, fetch error, JSON parse error)
        console.error('[PRODUCT REPLACEMENT] DataService request failed:', error);
        _this37.showError(error.message || 'Error upgrading product. Please try again.');
      })["finally"](function () {
        // Reset button state
        if (buttonElement) {
          buttonElement.disabled = false;
          buttonElement.classList.remove('loading');
          buttonElement.textContent = 'Upgrade';
        }

        // Hide loading
        _this37.hideLoading();
      });
    }

    /**
     * Update all replacement chains on buttons after page refresh
     * This ensures consistent ID references for multiple replacements
     *
     * @param {HTMLElement} roomElement - The room element containing buttons
     */
  }, {
    key: "updateAllReplacementChains",
    value: function updateAllReplacementChains(roomElement) {
      if (!roomElement || !window._productReplacementChains) return;
      console.log('[REPLACEMENT CHAINS] Updating all buttons with replacement chains');

      // Find all upgrade buttons in this room
      var upgradeButtons = roomElement.querySelectorAll('button.replace-product-in-room[data-replace-type="additional_products"]');
      upgradeButtons.forEach(function (button) {
        var productId = button.dataset.productId;
        var roomId = button.dataset.roomId;
        var replaceProductId = button.dataset.replaceProductId;
        var chainKey = "".concat(roomId, "_").concat(productId); // Corrected line
        var replacementChain = window._productReplacementChains[chainKey];
        if (replacementChain) {
          console.log("[REPLACEMENT CHAINS] Found chain for ".concat(chainKey, ":"), replacementChain);

          // Add data attribute with the replacement chain for debugging
          button.dataset.replacementChain = JSON.stringify(replacementChain);

          // This helps track the relationship for debugging
          console.log("[REPLACEMENT CHAINS] Updated button ".concat(button.textContent, " with chain data"));
        }
      });
    }

    /**
     * Update additional product upgrade buttons after replacement
     * This updates the data-replace-product-id attribute to the new product ID
     *
     * @param {HTMLElement} roomElement - The room accordion element
     * @param {string} newProductId - The new product ID
     * @param {string} oldProductId - The old product ID that was replaced
     */
  }, {
    key: "updateAdditionalProductUpgradeButtons",
    value: function updateAdditionalProductUpgradeButtons(roomElement, newProductId, oldProductId) {
      if (!roomElement) return;
      console.log("Updating additional product upgrade buttons: newProductId=".concat(newProductId, ", oldProductId=").concat(oldProductId));

      // Look for upgrade buttons with the specific data-replace-type="additional_products" attribute
      // that match the old product ID
      var upgradeButtons = roomElement.querySelectorAll("button.replace-product-in-room[data-replace-product-id=\"".concat(oldProductId, "\"][data-replace-type=\"additional_products\"]"));
      if (upgradeButtons.length > 0) {
        console.log("Found ".concat(upgradeButtons.length, " additional product upgrade buttons to update"));

        // Update each button's data-replace-product-id to the new product ID
        upgradeButtons.forEach(function (button) {
          console.log("Updating button data-replace-product-id from ".concat(oldProductId, " to ").concat(newProductId));
          button.dataset.replaceProductId = newProductId;
        });
      } else {
        console.log('No additional product upgrade buttons found that need updating');
      }

      // Also update any product-upgrades containers
      var upgradeContainers = roomElement.querySelectorAll(".product-upgrades[data-product-id=\"".concat(oldProductId, "\"]"));
      upgradeContainers.forEach(function (container) {
        container.dataset.productId = newProductId;
        console.log("Updated product-upgrades container data-product-id from ".concat(oldProductId, " to ").concat(newProductId));
      });
    }

    /**
     * Update all upgrade buttons within a room to point to a new product ID
     * This ensures that after an upgrade, subsequent upgrade buttons work correctly
     *
     * @param {HTMLElement} roomElement - The room accordion element
     * @param {string} oldProductId - The old product ID to replace
     * @param {string} newProductId - The new product ID to use
     */
  }, {
    key: "updateUpgradeButtonProductIds",
    value: function updateUpgradeButtonProductIds(roomElement, oldProductId, newProductId) {
      if (!roomElement) return;
      console.log("Updating upgrade buttons: replacing ".concat(oldProductId, " with ").concat(newProductId));

      // Find all replace buttons that reference the old product ID
      var upgradeButtons = roomElement.querySelectorAll("button.replace-product-in-room[data-replace-product-id=\"".concat(oldProductId, "\"]"));
      if (upgradeButtons.length > 0) {
        console.log("Found ".concat(upgradeButtons.length, " upgrade buttons to update"));

        // Update each button's data attribute
        upgradeButtons.forEach(function (button) {
          button.dataset.replaceProductId = newProductId;
          console.log("Updated button to use new product ID: ".concat(newProductId));
        });
      } else {
        console.log('No upgrade buttons found that need updating');
      }
    }
  }, {
    key: "log",
    value: function log() {
      if (this.config.debug) {
        var _console;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        (_console = console).log.apply(_console, ['[EstimatorCore]'].concat(args));
      }
    }
  }]);
}(); // Export the class
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ModalManager);

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
/* harmony import */ var _ConfirmationDialog__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ConfirmationDialog */ "./src/js/frontend/ConfirmationDialog.js");
/* harmony import */ var _CustomerStorage__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./CustomerStorage */ "./src/js/frontend/CustomerStorage.js");
/* harmony import */ var _DataService__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./DataService */ "./src/js/frontend/DataService.js");



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


 // Import the new functions
 // <--- Add this line
var PrintEstimate = /*#__PURE__*/function () {
  /**
   * Initialize the PrintEstimate module
   * @param {Object} config - Configuration options
   * @param {DataService} dataService - The data service instance // Added dataService parameter
   */
  function PrintEstimate() {
    var _window$productEstima;
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var dataService = arguments.length > 1 ? arguments[1] : undefined;
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

    // Store reference to data service
    this.dataService = dataService; // Store the dataService

    // State
    this.initialized = false;
    this.processing = false;
    // Use the imported loadCustomerDetails function on init
    this.customerDetails = (0,_CustomerStorage__WEBPACK_IMPORTED_MODULE_4__.loadCustomerDetails)();

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

    // Removed duplicated loadCustomerDetails, saveCustomerDetails, and clearCustomerDetails methods
    // The imported functions from CustomerStorage.js will be used instead.

    /**
     * Bind events for printing estimates
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this = this;
      this.log('Binding print events'); // <--- Added log

      // Use event delegation for better performance and to handle dynamically added elements
      document.addEventListener('click', function (e) {
        _this.log('Document click event triggered'); // <--- Added log

        // Handle print PDF buttons
        var printButton = e.target.closest(_this.config.selectors.printButton);
        if (printButton) {
          _this.log('Print button clicked or is ancestor of click target'); // <--- Added log
        } else {
          // If it's not a print button, exit this part of the handler early
          return;
        }
        if (printButton && !_this.processing) {
          _this.log('Print button is active and not processing'); // <--- Added log

          e.preventDefault(); // Prevent default link behavior

          // Set processing state to prevent double-clicks
          _this.processing = true;
          _this.setButtonLoading(printButton, true);
          if (printButton.classList.contains('print-estimate-pdf')) {
            _this.log('Handling direct PDF link'); // <--- Added log
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
                  _this.log('Opening PDF URL from href:', pdfUrl); // <--- Added log
                  window.open(pdfUrl, '_blank');
                } else {
                  _this.log('href is missing or invalid, getting secure PDF URL'); // <--- Added log
                  // Get a fresh PDF URL
                  _this.getSecurePdfUrl(estimateId).then(function (url) {
                    _this.log('Opening secure PDF URL:', url); // <--- Added log
                    window.open(url, '_blank');
                  })["catch"](function (error) {
                    _this.showError('Error generating PDF URL. Please try again.');
                  });
                }
              } else {
                _this.log('Missing required customer details for PDF link:', missingFields); // <--- Added log
                // Missing details, show prompt
                _this.showCustomerDetailsPrompt(estimateId, printButton, 'print');
              }
            })["catch"](function (error) {
              _this.showError('Error checking customer details. Please try again.');
            })["finally"](function () {
              // Button state will be reset after PDF opens or error
            });
          } else {
            _this.log('Handling JS-based print button'); // <--- Added log
            // This is a JS-based print button
            _this.handlePrintEstimate(printButton);
          }
        } else if (_this.processing) {
          _this.log('Print button clicked but processing is true, ignoring.'); // <--- Added log
        }
      });

      // Handle request copy button (email PDF to customer)
      document.addEventListener('click', function (e) {
        // <--- Separate listener for clarity
        var requestCopyButton = e.target.closest(_this.config.selectors.requestCopyButton);
        if (requestCopyButton && !_this.processing) {
          _this.log('Request copy button clicked'); // <--- Added log
          e.preventDefault();
          _this.processing = true;
          _this.setButtonLoading(requestCopyButton, true);
          var estimateId = requestCopyButton.dataset.estimateId;

          // Show contact method choice modal
          _this.showContactSelectionPrompt(estimateId, requestCopyButton, 'request_copy');
        }
      });

      // Handle request contact from store button
      document.addEventListener('click', function (e) {
        // <--- Separate listener for clarity
        var requestContactButton = e.target.closest(_this.config.selectors.requestContactButton);
        if (requestContactButton && !_this.processing) {
          _this.log('Request contact button clicked'); // <--- Added log
          e.preventDefault();
          _this.processing = true;
          _this.setButtonLoading(requestContactButton, true);
          var estimateId = requestContactButton.dataset.estimateId;

          // Show contact method choice modal - similar to request copy but with different messaging
          _this.showContactSelectionPrompt(estimateId, requestContactButton, 'request_contact');
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
      this.log('handlePrintEstimate called'); // <--- Added log
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
          _this2.log('Customer has required details, proceeding to store estimate'); // <--- Added log
          // Customer has all required details, proceed with store and generate
          return _this2.storeEstimate(estimateId).then(function (data) {
            if (data && data.estimate_id) {
              _this2.log('Estimate stored, getting secure PDF URL'); // <--- Added log
              // Get a secure PDF URL
              return _this2.getSecurePdfUrl(data.estimate_id);
            } else {
              throw new Error('Failed to store estimate');
            }
          }).then(function (pdfUrl) {
            _this2.log('Received PDF URL, opening:', pdfUrl); // <--- Added log
            _this2.setButtonLoading(button, false);
            _this2.processing = false;
            // Open the PDF URL in a new tab
            window.open(pdfUrl, '_blank');
          });
        } else {
          _this2.log('Missing required customer details for JS print:', missingFields); // <--- Added log
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
      this.log('showCustomerDetailsPrompt called'); // <--- Added log
      // Define which fields are required for each action type
      var requiredFields = {
        'print': ['name', 'email'],
        'request_copy_email': ['name', 'email'],
        'request_copy_sms': ['name', 'phone'],
        'request_contact_email': ['name', 'email'],
        'request_contact_phone': ['name', 'phone']
      };

      // Use the class property for initial check
      // IMPORTANT: Make sure this.customerDetails is up-to-date by calling loadCustomerDetails before this.
      // Or, pass the latest customer details object fetched from checkCustomerDetails call
      // For now, let's assume customerDetails property is updated before this call.
      var missingFields = this.getMissingFields(this.customerDetails, action);
      if (missingFields.length === 0) {
        this.log('No missing fields, continuing with action:', action); // <--- Added log
        // No missing fields, proceed with the action
        this.continueWithAction(action, estimateId, button, this.customerDetails);
        return;
      }
      this.log('Missing fields detected, showing prompt modal:', missingFields); // <--- Added log
      // Create modal HTML with dynamic fields based on what's missing
      var modalHtml = this.createPromptModalHtml(missingFields, action, this.customerDetails);

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
        _this3.log('Prompt modal cancelled'); // <--- Added log
        promptEl.remove();
        _this3.setButtonLoading(button, false);
        _this3.processing = false;
      });

      // Handle submit
      submitBtn.addEventListener('click', function () {
        _this3.log('Prompt modal submit clicked'); // <--- Added log
        // Collect values from all input fields
        var updatedDetails = _objectSpread({}, _this3.customerDetails); // Start with existing details
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
        if (!isValid) {
          _this3.log('Prompt modal validation failed'); // <--- Added log
          return;
        }
        _this3.log('Prompt modal validation successful, saving details:', updatedDetails); // <--- Added log
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        // Update customer details with the new values
        _this3.updateCustomerDetails(estimateId, updatedDetails).then(function () {
          _this3.log('Details saved successfully after prompt'); // <--- Added log
          // Remove prompt
          promptEl.remove();
          _this3.setButtonLoading(button, true);
          _this3.processing = true;

          // Continue with the original action
          _this3.continueWithAction(action, estimateId, button, updatedDetails);
        })["catch"](function (error) {
          _this3.log('Error saving details after prompt:', error); // <--- Added log
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
    }

    /**
     * Get a list of missing fields based on action type and customer info
     * @param {Object} customerInfo - Customer details object
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
     * @param {Object} existingDetails - Existing customer details
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
      var phonePattern = /^[\d\s()+\-]{8,}$/;
      return phonePattern.test(phone);
    }

    /**
     * Continue with the original action after customer details are updated
     * @param {string} action - The action type
     * @param {string} estimateId - The estimate ID
     * @param {HTMLElement} button - The button element
     * @param {Object} customerDetails - Updated customer details
     */
  }, {
    key: "continueWithAction",
    value: function continueWithAction(action, estimateId, button, customerDetails) {
      var _this5 = this;
      this.log('continueWithAction called:', action); // <--- Added log
      switch (action) {
        case 'print':
          this.handlePrintEstimate(button);
          break;
        case 'request_copy_email':
          this.requestCopyEstimate(estimateId, button).then(function (response) {
            _this5.showMessage("Estimate has been emailed to ".concat(customerDetails.email), 'success', function () {
              _this5.setButtonLoading(button, false);
              _this5.processing = false;
            });
          })["catch"](function (error) {
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
      this.log('showContactSelectionPrompt called:', action); // <--- Added log
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
        _this6.log('Contact selection cancelled'); // <--- Added log
        _this6.setButtonLoading(button, false);
        _this6.processing = false;
        promptEl.remove();
      });
      emailBtn.addEventListener('click', function () {
        _this6.log('Email contact method selected'); // <--- Added log
        promptEl.remove();

        // Determine the specific action for email
        var emailAction = action === 'request_contact' ? 'request_contact_email' : 'request_copy_email';

        // Check customer details using the imported function
        var customerInfo = (0,_CustomerStorage__WEBPACK_IMPORTED_MODULE_4__.loadCustomerDetails)();

        // Always check for name, plus email for email actions
        var missingFields = [];
        if (!customerInfo.name || customerInfo.name.trim() === '') missingFields.push('name');
        if (!customerInfo.email || customerInfo.email.trim() === '') missingFields.push('email');
        if (missingFields.length === 0) {
          _this6.log('Required details for email contact exist, proceeding'); // <--- Added log
          // All required details exist, proceed with the action
          if (action === 'request_contact') {
            _this6.requestStoreContact(estimateId, 'email', button, customerInfo);
          } else {
            // Original request_copy email flow
            _this6.requestCopyEstimate(estimateId, button).then(function (response) {
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
          _this6.log('Missing details for email contact, showing prompt:', missingFields); // <--- Added log
          // Missing details, show prompt
          _this6.showCustomerDetailsPrompt(estimateId, button, emailAction);
        }
      });
      smsBtn.addEventListener('click', function () {
        _this6.log('Phone contact method selected'); // <--- Added log
        promptEl.remove();

        // Determine the specific action for SMS/phone
        var smsAction = action === 'request_contact' ? 'request_contact_phone' : 'request_copy_sms';

        // Check customer details using the imported function
        var customerInfo = (0,_CustomerStorage__WEBPACK_IMPORTED_MODULE_4__.loadCustomerDetails)();

        // Always check for name, plus phone for SMS/phone actions
        var missingFields = [];
        if (!customerInfo.name || customerInfo.name.trim() === '') missingFields.push('name');
        if (!customerInfo.phone || customerInfo.phone.trim() === '') missingFields.push('phone');
        if (missingFields.length === 0) {
          _this6.log('Required details for phone contact exist, proceeding'); // <--- Added log
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
          _this6.log('Missing details for phone contact, showing prompt:', missingFields); // <--- Added log
          // Missing details, show prompt
          _this6.showCustomerDetailsPrompt(estimateId, button, smsAction);
        }
      });
    }

    /**
     * Request store contact for a customer
     * @param {string} estimateId - The estimate ID
     * @param {string} contactMethod - Contact method ('email' or 'phone')
     * @param {HTMLElement} button - The button element
     * @param {Object} customerDetails - Customer details
     */
  }, {
    key: "requestStoreContact",
    value: function requestStoreContact(estimateId, contactMethod, button, customerDetails) {
      var _this7 = this;
      this.log('requestStoreContact called:', {
        estimateId: estimateId,
        contactMethod: contactMethod,
        customerDetails: customerDetails
      }); // <--- Added log
      // First store the estimate to ensure it's in the database
      this.storeEstimate(estimateId).then(function (data) {
        if (!data || !data.estimate_id) {
          throw new Error('Failed to store estimate');
        }

        // Prepare data for the server-side request
        var requestData = {
          estimate_id: estimateId,
          contact_method: contactMethod,
          customer_details: JSON.stringify(customerDetails)
        };
        _this7.log('Sending store contact request with data:', requestData);

        // Use DataService for the AJAX request
        return _this7.dataService.request('request_store_contact', requestData);
      }).then(function (response) {
        _this7.log('Store contact request successful:', response);

        // Show success message based on contact method
        var message = '';
        if (contactMethod === 'email') {
          message = "Your request has been sent. Our store will contact you at ".concat(customerDetails.email, " shortly.");
        } else {
          message = "Your request has been sent. Our store will call you at ".concat(customerDetails.phone, " shortly.");
        }
        _this7.showMessage(message, 'success');
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
     * @returns {Promise<Object>} Customer details object
     */
  }, {
    key: "checkCustomerDetails",
    value: function checkCustomerDetails(estimateId) {
      var _this8 = this;
      this.log('checkCustomerDetails called for estimate:', estimateId); // <--- Added log
      return new Promise(function (resolve, reject) {
        // If we have customer details in local storage, resolve immediately
        // Use the imported loadCustomerDetails function
        var currentDetails = (0,_CustomerStorage__WEBPACK_IMPORTED_MODULE_4__.loadCustomerDetails)();
        // Add a check for required fields (name and email are typically needed for printing/contact)
        // Adjust the check below based on which fields are *always* required for this check.
        // If any required fields are missing from local storage, proceed to AJAX.
        if (currentDetails && currentDetails.name && currentDetails.email) {
          _this8.customerDetails = currentDetails; // Update class property
          _this8.log('Customer details found in local storage.');
          resolve(_this8.customerDetails);
          return; // Exit early
        }

        // If not in local storage, fetch from the server using DataService
        _this8.log('Customer details not fully available in local storage, fetching from server.');
        _this8.dataService.request('check_customer_details', {
          estimate_id: estimateId
        }).then(function (data) {
          _this8.log('Customer details check result from server:', data);
          if (data && data.customer_details) {
            // Save to local storage using the imported function
            (0,_CustomerStorage__WEBPACK_IMPORTED_MODULE_4__.saveCustomerDetails)(data.customer_details);
            // Load updated details into class property using the imported function
            _this8.customerDetails = (0,_CustomerStorage__WEBPACK_IMPORTED_MODULE_4__.loadCustomerDetails)();
            resolve(_this8.customerDetails);
          } else {
            // Even if server returns success, if no details are provided, treat as not found
            _this8.log('Server check succeeded but no customer details returned.');
            // Optionally save an empty state or just resolve with empty details
            (0,_CustomerStorage__WEBPACK_IMPORTED_MODULE_4__.saveCustomerDetails)({}); // Save empty details to indicate server has none
            _this8.customerDetails = {};
            resolve(_this8.customerDetails); // Resolve with empty object
          }
        })["catch"](function (error) {
          _this8.log('Error fetching customer details from server:', error);
          // On AJAX error, resolve with empty details, but log the error
          _this8.customerDetails = {};
          resolve(_this8.customerDetails); // Resolve with empty object on error
          // Or reject if a server error should halt the process:
          // reject(error);
        });
      });
    }

    /**
     * Update customer details with multiple fields
     * This version dispatches an event to update all forms
     * @param {string} estimateId - The estimate ID
     * @param {Object} details - Updated customer details
     * @returns {Promise<Object>} Promise that resolves when details are updated
     */
  }, {
    key: "updateCustomerDetails",
    value: function updateCustomerDetails(estimateId, details) {
      var _this9 = this;
      this.log('updateCustomerDetails called:', {
        estimateId: estimateId,
        details: details
      }); // <--- Added log
      return new Promise(function (resolve, reject) {
        // Make sure we have the minimum required fields
        if (!details.postcode) {
          details.postcode = '0000'; // Default postcode if not set
        }

        // Update customer details using DataService
        _this9.dataService.request('update_customer_details', {
          details: JSON.stringify(details)
        }).then(function (response) {
          _this9.log('Server update_customer_details successful:', response); // <--- Added log
          // Dispatch an event to notify other components of updated details
          var event = new CustomEvent('customer_details_updated', {
            bubbles: true,
            detail: {
              details: details
            }
          });
          document.dispatchEvent(event);

          // Now store the estimate to the database using DataService
          return _this9.dataService.request('store_single_estimate', {
            estimate_id: estimateId
          });
        }).then(function (response) {
          _this9.log('Server store_single_estimate successful:', response); // <--- Added log
          // Save updated details to local storage using the imported function
          (0,_CustomerStorage__WEBPACK_IMPORTED_MODULE_4__.saveCustomerDetails)(details);
          _this9.customerDetails = details; // Update class property
          resolve(response); // Resolve with the response from storing the estimate
        })["catch"](function (error) {
          console.error('Error in updateCustomerDetails AJAX chain:', error); // <--- Added log
          reject(error);
        });
      });
    }

    /**
     * This method is now redundant and can be removed, as it's handled by CustomerStorage.js
     */
    /*
    clearCustomerDetails() {
      try {
        localStorage.removeItem('customerDetails');
      } catch (localStorageError) {
        console.warn('localStorage not available:', localStorageError);
      }
      try {
        sessionStorage.removeItem('customerDetails');
      } catch (sessionStorageError) {
        console.warn('sessionStorage not available:', sessionStorageError);
      }
      this.customerDetails = {}; // Clear the class property
    }
    */
    /**
     * Store the estimate in the database
     * @param {string} estimateId - The estimate ID
     * @returns {Promise<Object>} Promise that resolves when estimate is stored
     */
  }, {
    key: "storeEstimate",
    value: function storeEstimate(estimateId) {
      this.log('storeEstimate called:', estimateId); // <--- Added log
      // Use DataService for the AJAX request
      return this.dataService.request('store_single_estimate', {
        estimate_id: estimateId
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
      var _this10 = this;
      this.log('getSecurePdfUrl called:', dbId); // <--- Added log
      // Use DataService for the AJAX request
      return this.dataService.request('get_secure_pdf_url', {
        estimate_id: dbId
      }).then(function (data) {
        if (data && data.url) {
          _this10.log('Received secure PDF URL:', data);
          return data.url; // Resolve with the URL string
        } else {
          throw new Error('Failed to get secure PDF URL');
        }
      });
    }

    /**
     * Request a copy of the estimate to be sent via email
     * @param {string} estimateId - The estimate ID
     * @param {HTMLElement} button - The buttonelement
     * @returns {Promise<Object>} Promise that resolves when email is sent
     */
  }, {
    key: "requestCopyEstimate",
    value: function requestCopyEstimate(estimateId, button) {
      var _this11 = this;
      this.log('requestCopyEstimate called:', estimateId); // <--- Added log
      // Use the imported loadCustomerDetails function
      var customerInfo = (0,_CustomerStorage__WEBPACK_IMPORTED_MODULE_4__.loadCustomerDetails)();
      if (!customerInfo.email) {
        this.log('No email found for requestCopyEstimate'); // <--- Added log
        return Promise.reject(new Error('no_email'));
      }
      return this.storeEstimate(estimateId).then(function (data) {
        if (!data || !data.estimate_id) {
          throw new Error('Failed to store estimate');
        }

        // Use DataService for the AJAX request
        return _this11.dataService.request('request_copy_estimate', {
          estimate_id: estimateId
        });
      })["catch"](function (error) {
        var _error$data;
        // Handle specific no_email error from server response if needed
        if (((_error$data = error.data) === null || _error$data === void 0 ? void 0 : _error$data.code) === 'no_email') {
          _this11.log('Server returned no_email error for requestCopyEstimate'); // <--- Added log
          throw new Error('no_email');
        } else {
          _this11.log('Error requesting estimate copy:', error);
          throw error; // Re-throw other errors
        }
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
      this.log('setButtonLoading called:', {
        button: (button === null || button === void 0 ? void 0 : button.id) || (button === null || button === void 0 ? void 0 : button.className),
        isLoading: isLoading
      }); // <--- Added log
      if (!button) {
        this.log('setButtonLoading called with null button'); // <--- Added log
        return;
      }
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
     * @param {string} type - Message type ('success' or 'error')
     * @param {Function} onConfirm - Callback when confirmed
     */
  }, {
    key: "showMessage",
    value: function showMessage(message) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'success';
      var _onConfirm = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      this.log('showMessage called:', {
        message: message,
        type: type
      }); // <--- Added log
      if (window.productEstimator && window.productEstimator.dialog) {
        window.productEstimator.dialog.show({
          title: type === 'success' ? 'Success' : 'Error',
          // Use generic titles here
          message: message,
          type: 'estimate',
          // Use 'estimate' type for styling if appropriate
          action: 'confirm',
          confirmText: this.config.i18n.confirm || 'OK',
          // Use localized OK
          cancelText: null,
          // Hide cancel for simple messages
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
      this.log('showError called:', message); // <--- Added log
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
        var _console;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        (_console = console).log.apply(_console, ['[PrintEstimate]'].concat(args));
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


var _window$productEstima, _window$productEstima2, _window$productEstima3, _window$productEstima4, _window$productEstima5, _window$productEstima6;
/**
 * ProductDetailsToggle.js
 *
 * Handles the show/hide functionality for both similar products and product notes sections
 */
var ProductDetailsToggle = /*#__PURE__*/function () {
  /**
   * Initialize the toggle functionality
   * @param {Object} config - Configuration options
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
        this.log('Already initialized, skipping');
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
        _this.log('Modal content loaded, initializing toggles');
        _this.setup();
      });

      // Set up a mutation observer to watch for new content
      this.setupMutationObserver();

      // Mark as initialized
      this.initialized = true;
      this.log('ProductDetailsToggle initialized');
    }

    /**
     * Prepare the DOM for suggested products toggle
     */
  }, {
    key: "prepareSuggestionsToggle",
    value: function prepareSuggestionsToggle() {
      var _this2 = this;
      // Find all accordion content elements
      var accordionContents = document.querySelectorAll(this.config.selectors.accordionContent);
      this.log("Found ".concat(accordionContents.length, " accordion content elements to process for suggestions toggle"));
      accordionContents.forEach(function (accordionContent) {
        // Skip if already processed for suggestions toggle
        if (accordionContent.classList.contains('suggestions-toggle-processed')) {
          return;
        }

        // Find product suggestions section
        var suggestionsSection = accordionContent.querySelector(_this2.config.selectors.productSuggestions);

        // Check if accordion content has suggestions to toggle
        if (!suggestionsSection) {
          _this2.log('No suggestions section found for accordion content, skipping', accordionContent);
          return; // No suggestions to toggle
        }
        _this2.log('Found suggestions section, processing', suggestionsSection);

        // Mark the accordion content as having suggestions
        accordionContent.classList.add('has-suggestions');

        // Check if container already exists
        var suggestionsContainer = accordionContent.querySelector(_this2.config.selectors.suggestionsContainer);

        // If no container exists but there is a suggestions section, we need to create one
        if (!suggestionsContainer) {
          _this2.log('Creating new suggestions container');
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
          _this2.log('Adding suggestions toggle button to accordion content');
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
        _this2.log('Accordion content processed for suggestions toggle');
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
          _this3.log('New toggle-related content detected, re-initializing');
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
      this.log('Mutation observer set up');
    }

    /**
     * Set up toggle functionality
     */
  }, {
    key: "setup",
    value: function setup() {
      this.log('Setting up product details toggles');

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
  }, {
    key: "prepareProductsToggle",
    value: function prepareProductsToggle() {
      var _this4 = this;
      // Find all product items
      var productItems = document.querySelectorAll(this.config.selectors.productItem);
      this.log("Found ".concat(productItems.length, " product items to process for similar products toggle"));
      productItems.forEach(function (productItem) {
        // Skip if already processed for products toggle
        if (productItem.classList.contains('products-toggle-processed')) {
          return;
        }

        // Find similar products section
        var similarProductsSection = productItem.querySelector(_this4.config.selectors.similarProducts);

        // Check if product has similar products to toggle
        if (!similarProductsSection) {
          _this4.log('No similar products section found for product item, skipping', productItem);
          return; // No similar products to toggle
        }
        _this4.log('Found similar products section, processing', similarProductsSection);

        // Mark the product item as having similar products
        productItem.classList.add('has-similar-products');

        // Check if container already exists
        var similarProductsContainer = productItem.querySelector(_this4.config.selectors.similarProductsContainer);

        // If no container exists but there is a similar products section, we need to create one
        if (!similarProductsContainer) {
          _this4.log('Creating new similar products container');
          // Create a container to wrap similar products
          similarProductsContainer = document.createElement('div');
          similarProductsContainer.className = 'similar-products-container visible'; // Add visible class

          // Move similar products into the container (if not already in one)
          if (similarProductsSection.parentNode !== similarProductsContainer) {
            // Clone the node to prevent reference issues
            var clonedSection = similarProductsSection.cloneNode(true);
            similarProductsContainer.appendChild(clonedSection);

            // Remove the original from DOM
            similarProductsSection.parentNode.removeChild(similarProductsSection);
          }

          // Add the container to the product item
          productItem.appendChild(similarProductsContainer);
        }

        // Add toggle button if not already present
        var toggleButton = productItem.querySelector(_this4.config.selectors.productToggleButton);
        if (!toggleButton) {
          _this4.log('Adding similar products toggle button to product item');
          toggleButton = document.createElement('button');

          // Mark as expanded by default and use the proper class for the arrow
          toggleButton.className = 'product-details-toggle expanded';
          toggleButton.setAttribute('data-toggle-type', 'similar-products');

          // Use the hideProducts text (since it's expanded) and arrow-up icon
          toggleButton.innerHTML = "\n        ".concat(_this4.config.i18n.hideProducts, "\n        <span class=\"toggle-icon dashicons dashicons-arrow-up-alt2\"></span>\n      ");

          // Insert button before the similar products container
          productItem.insertBefore(toggleButton, similarProductsContainer);
        } else {
          // Make sure existing button has the correct state
          toggleButton.classList.add('expanded');
          var iconElement = toggleButton.querySelector('.toggle-icon');
          if (iconElement) {
            iconElement.classList.remove('dashicons-arrow-down-alt2');
            iconElement.classList.add('dashicons-arrow-up-alt2');
          }
        }

        // Initially show the similar products container (expanded by default)
        similarProductsContainer.style.display = 'block';
        similarProductsContainer.classList.add('visible');

        // Mark as processed to avoid duplicating
        productItem.classList.add('products-toggle-processed');
        _this4.log('Product item processed for similar products toggle');
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
      this.log("Found ".concat(productItems.length, " product items to process for notes toggle"));
      productItems.forEach(function (productItem) {
        // Skip if already processed for notes toggle
        if (productItem.classList.contains('notes-toggle-processed')) {
          return;
        }

        // Find product notes section
        var notesSection = productItem.querySelector(_this5.config.selectors.productNotes);

        // Check if product has notes to toggle
        if (!notesSection) {
          _this5.log('No notes section found for product item, skipping', productItem);
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
          _this5.log('No valid notes found for product, skipping', productItem);
          productItem.classList.add('notes-toggle-processed'); // Mark as processed anyway

          // Hide any existing notes elements
          var existingToggle = productItem.querySelector(_this5.config.selectors.notesToggleButton);
          var existingContainer = productItem.querySelector(_this5.config.selectors.notesContainer);
          if (existingToggle) existingToggle.style.display = 'none';
          if (existingContainer) existingContainer.style.display = 'none';
          return;
        }
        _this5.log('Found notes section with content, processing', notesSection);

        // Mark the product item as having notes
        productItem.classList.add('has-notes');

        // Check if container already exists
        var notesContainer = productItem.querySelector(_this5.config.selectors.notesContainer);

        // If no container exists but there is a notes section, we need to create one
        if (!notesContainer) {
          _this5.log('Creating new notes container');
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
          _this5.log('Adding notes toggle button to product item');
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
        _this5.log('Product item processed for notes toggle');
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
      this.log("Found ".concat(productToggleButtons.length, " similar products toggle buttons to bind"));
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
      this.log("Found ".concat(notesToggleButtons.length, " notes toggle buttons to bind"));
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
      this.log("Found ".concat(includesToggleButtons.length, " includes toggle buttons to bind"));
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

      // Bind suggestions toggle buttons
      var suggestionsToggleButtons = document.querySelectorAll(this.config.selectors.suggestionsToggleButton);
      this.log("Found ".concat(suggestionsToggleButtons.length, " suggestions toggle buttons to bind"));
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
      this.log('All toggle events bound');
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
        this.log('Accordion content not found for toggle button');
        return;
      }

      // Find suggestions container
      var suggestionsContainer = accordionContent.querySelector(this.config.selectors.suggestionsContainer);
      if (!suggestionsContainer) {
        this.log('Suggestions container not found');
        return;
      }

      // Toggle expanded state
      var isExpanded = toggleButton.classList.contains('expanded');
      this.log("Suggestions toggle clicked, current expanded state: ".concat(isExpanded));
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
        this.log('Suggestions hidden');
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
        this.log('Suggestions shown');
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
        this.log('Product item not found for toggle button');
        return;
      }

      // Find similar products container
      var similarProductsContainer = productItem.querySelector(this.config.selectors.similarProductsContainer);
      if (!similarProductsContainer) {
        this.log('Similar products container not found');
        return;
      }

      // Toggle expanded state
      var isExpanded = toggleButton.classList.contains('expanded');
      this.log("Similar products toggle clicked, current expanded state: ".concat(isExpanded));

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
        this.log('Similar products hidden');
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
        this.log('Similar products shown');

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
        this.log('Product item not found for notes toggle button');
        return;
      }

      // Find notes container
      var notesContainer = productItem.querySelector(this.config.selectors.notesContainer);
      if (!notesContainer) {
        this.log('Notes container not found');
        return;
      }

      // Toggle expanded state
      var isExpanded = toggleButton.classList.contains('expanded');
      this.log("Notes toggle clicked, current expanded state: ".concat(isExpanded));

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
        this.log('Notes hidden');
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
        this.log('Notes shown');
      }
    }

    /**
     * Initialize carousels within the container
     * @param {HTMLElement} container - The container with carousels
     */
  }, {
    key: "initializeCarousels",
    value: function initializeCarousels(container) {
      // Check if SuggestionsCarousel initialization function exists
      if (typeof window.initSuggestionsCarousels === 'function') {
        this.log('Initializing carousels in similar products container');
        window.initSuggestionsCarousels();
      } else if (typeof initSuggestionsCarousels === 'function') {
        this.log('Using local initSuggestionsCarousels function');
        initSuggestionsCarousels();
      } else {
        this.log('Carousel initialization function not found', window.initSuggestionsCarousels);
      }
    }

    /**
     * Initialize all carousels on the page
     */
  }, {
    key: "initializeAllCarousels",
    value: function initializeAllCarousels() {
      if (typeof window.initSuggestionsCarousels === 'function') {
        this.log('Initializing all carousels');
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
      this.log("Found ".concat(productItems.length, " product items to process for includes toggle"));
      productItems.forEach(function (productItem) {
        // Skip if already processed for includes toggle
        if (productItem.classList.contains('includes-toggle-processed')) {
          return;
        }

        // Find product includes section
        var includesSection = productItem.querySelector(_this7.config.selectors.productIncludes);

        // Check if product has includes to toggle
        if (!includesSection) {
          _this7.log('No includes section found for product item, skipping', productItem);
          return; // No includes to toggle
        }
        _this7.log('Found includes section, processing', includesSection);

        // Mark the product item as having includes
        productItem.classList.add('has-includes');

        // Check if container already exists
        var includesContainer = productItem.querySelector('.includes-container');

        // If no container exists but there is an includes section, we need to create one
        if (!includesContainer) {
          _this7.log('Creating new includes container');
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
          _this7.log('Adding includes toggle button to product item');
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
        _this7.log('Product item processed for includes toggle');
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
        this.log('Product item not found for includes toggle button');
        return;
      }

      // Find includes container
      var includesContainer = productItem.querySelector('.includes-container');
      if (!includesContainer) {
        this.log('Includes container not found');
        return;
      }

      // Toggle expanded state
      var isExpanded = toggleButton.classList.contains('expanded');
      this.log("Includes toggle clicked, current expanded state: ".concat(isExpanded));

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
        this.log('Includes hidden');
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
        this.log('Includes shown');
      }
    }

    /**
     * Log debug messages if debug mode is enabled
     * @param {...any} args - Arguments to log
     */
  }, {
    key: "log",
    value: function log() {
      if (this.config.debug) {
        // console.log('[ProductDetailsToggle]', ...args);
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


/**
 * Enhanced Carousel for Suggested and Similar Products with strict width containment
 * - Properly handles multiple carousels on the same page
 * - Each carousel operates independently
 * - Strictly maintains container width constraints
 */
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

    // console.log(`[${this.id}] Initializing carousel with ${this.items.length} items, isSimilarProducts: ${this.isSimilarProducts}`);

    // Only proceed if we have all necessary elements
    if (!this.itemsContainer || !this.items.length) {
      console.warn("[".concat(this.id, "] Carousel missing items container or has no items"));
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
          // console.log(`[${this.id}] Found product-item parent: ${parentWidth}px`);
          return parentWidth - 10; // Subtract a small buffer
        }
      }

      // Default - use container's width
      var containerWidth = this.container.offsetWidth;
      // console.log(`[${this.id}] Using container width: ${containerWidth}px`);
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
          // console.log(`[${this.id}] Similar products parent width: ${parentWidth}px`);
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

      // console.log(`[${this.id}] Container width: ${containerWidth}px, available: ${availableWidth}px, visible items: ${visibleItems}`);

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

      // console.log(`[${this.id}] Events bound`);
    }
  }, {
    key: "handlePrevClick",
    value: function handlePrevClick(e) {
      e.preventDefault();
      e.stopPropagation();

      // console.log(`[${this.id}] Prev button clicked, current position: ${this.currentPosition}`);

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

      // console.log(`[${this.id}] Next button clicked, current position: ${this.currentPosition}, max: ${this.maxPosition}`);

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
      var oldVisibleItems = this.visibleItems;
      this.visibleItems = this.calculateVisibleItems();
      this.maxPosition = Math.max(0, this.items.length - this.visibleItems);

      // console.log(`[${this.id}] Window resized, visible items: ${this.visibleItems}, max position: ${this.maxPosition}`);

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

          // console.log(`Product item width: ${productItemWidth}px, Available width: ${availableWidth}px`);
        }
      } else {
        // For suggested products - respect the accordion item width
        var accordionContent = this.container.closest('.accordion-content');
        if (accordionContent) {
          var accordionWidth = accordionContent.clientWidth - 30; // Allow for padding
          availableWidth = Math.min(availableWidth, accordionWidth);
          // console.log(`Accordion content width: ${accordionWidth}px, Available width: ${availableWidth}px`);
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

      // console.log(`[${this.id}] Position updated to ${this.currentPosition}, translateX: ${translateX}px`);
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

      // console.log(`[${this.id}] Buttons updated - prev ${this.prevBtn ? (this.prevBtn.classList.contains('disabled') ? 'disabled' : 'enabled') : 'missing'}, next ${this.nextBtn ? (this.nextBtn.classList.contains('disabled') ? 'disabled' : 'enabled') : 'missing'}`);
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

      // console.log(`[${this.id}] Carousel destroyed`);
    }
  }]);
}();
/**
 * Initialize carousels immediately after DOM content is loaded
 * and ensure navigation buttons work correctly
 */
function initSuggestionsCarousels() {
  // console.log('Initializing all suggestion carousels');

  // Find all carousel containers (both types: suggestions and similar products)
  var carouselContainers = document.querySelectorAll('.suggestions-carousel');
  // console.log(`Found ${carouselContainers.length} carousel containers`);

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
  // console.log(`Setting up ${accordionHeaders.length} accordion headers for carousel initialization`);

  accordionHeaders.forEach(function (header) {
    // Remove existing event listeners to prevent duplicates
    header.removeEventListener('click', handleAccordionClick);

    // Add event listener
    header.addEventListener('click', handleAccordionClick);
  });
}

/**
 * Handler for accordion clicks that initializes carousels when content becomes visible
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
      // console.log('Accordion opened, checking for carousels to initialize');

      // Find carousels within this accordion content - check for both types
      var carousels = content.querySelectorAll('.suggestions-carousel');
      // console.log(`Found ${carousels.length} carousels in opened accordion`);

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
  // console.log('DOM loaded, initializing carousels');
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
  // In TemplateEngine.js - init method
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__["default"])(TemplateEngine, [{
    key: "init",
    value: function init() {
      var _this = this;
      if (this.initialized) return this;
      console.log('Initializing TemplateEngine with templates', Object.keys(this.templates));

      // Create template elements from registered HTML
      Object.entries(this.templates).forEach(function (_ref) {
        var _ref2 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref, 2),
          id = _ref2[0],
          html = _ref2[1];
        // Create a temporary div to hold the HTML
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Extract the template content
        var templateElement = tempDiv.querySelector('template');
        if (templateElement) {
          _this.templateElements[id] = templateElement;
          console.log("Template found in HTML: ".concat(id));
        } else {
          // Create a new template element
          var newTemplate = document.createElement('template');
          newTemplate.id = id;
          newTemplate.innerHTML = html;
          _this.templateElements[id] = newTemplate;
          console.log("Created new template element: ".concat(id));
        }
      });
      console.log("TemplateEngine initialized with ".concat(Object.keys(this.templateElements).length, " templates"));
      this.initialized = true;
      this.verifyTemplates();
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
      this.templates[id] = html;
      this.initialized = false; // Mark as needing reinitialization
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
      if (!this.initialized) this.init();
      return this.templateElements[id] || null;
    }

    /**
     * Create an element from a template and populate it with data
     * @param {string} templateId - Template ID
     * @param {Object} data - Data to populate the template with
     * @returns {DocumentFragment} The populated template content
     */
  }, {
    key: "create",
    value: function create(templateId) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var template = this.getTemplate(templateId);
      if (!template) {
        console.error("Template not found: ".concat(templateId));
        return document.createDocumentFragment();
      }

      // Clone the template content
      var clone = template.content.cloneNode(true);

      // Populate the template with data
      this.populateElement(clone, data);
      return clone;
    }

    /**
     * Populate an element with data
     * @param {Element|DocumentFragment} element - Element to populate
     * @param {Object} data - Data to populate with
     */
  }, {
    key: "populateElement",
    value: function populateElement(element, data) {
      var _this2 = this;
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
          console.log("Setting removal button data attributes: estimate=".concat(data.estimate_id, ", room=").concat(data.room_id, ", product=").concat(data.product_index));
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

      // Enhance product ID handling
      if (data.id) {
        // For products, the ID is often stored in data.id
        var elementsWithProductId = element.querySelectorAll('[data-product-id]');
        elementsWithProductId.forEach(function (el) {
          el.setAttribute('data-product-id', data.id);
        });

        // Also set on the main element if it's a product item
        if (element.classList && element.classList.contains('product-item')) {
          element.setAttribute('data-product-id', data.id);
        }
      } else if (data.product_id) {
        var _elementsWithProductId = element.querySelectorAll('[data-product-id]');
        _elementsWithProductId.forEach(function (el) {
          el.setAttribute('data-product-id', data.product_id);
        });
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

      // Enhanced image handling
      if (data.image) {
        var imgElements = element.querySelectorAll('img.product-thumbnail, img.product-img');
        imgElements.forEach(function (img) {
          img.src = data.image;
          img.alt = data.name || 'Product';
        });
      }

      // Handle price display
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

      // Enhanced name display for products
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
              var childElement = _this2.create(childTemplateId, item);
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

          // Filter for valid additional products
          var validProducts = Array.isArray(data.additional_products) ? data.additional_products.filter(function (product) {
            return product && product.id;
          }) : [];
          if (validProducts.length > 0) {
            // Ensure includes container is visible
            includesContainer.style.display = 'block';
            includesContainer.classList.add('visible');

            // Render each additional product
            validProducts.forEach(function (product) {
              // Use template to create include item
              if (_this2.getTemplate('include-item-template')) {
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
                console.log("include item product:: ", product);
                // Create the item from template
                var includeFragment = _this2.create('include-item-template', includeItemData);
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

      // Handle additional notes - THIS IS YOUR EXISTING CODE
      if (data.additional_notes && Array.isArray(data.additional_notes)) {
        var notesContainer = element.querySelector('.notes-container');
        var notesItems = element.querySelector('.product-notes-items');
        if (notesContainer && notesItems) {
          // Clear any previous notes first
          notesItems.innerHTML = '';

          // Filter out empty notes
          var validNotes = data.additional_notes.filter(function (note) {
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
              if (_this2.getTemplate('note-item-template')) {
                // Create a clone of the template
                var noteFragment = _this2.create('note-item-template', {});

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
    }

    /**
     * Create and insert an element into the DOM
     * @param {string} templateId - Template ID
     * @param {Object} data - Data to populate with
     * @param {Element|string} container - Container element or selector
     * @param {string} position - Insert position ('append', 'prepend', 'before', 'after', 'replace')
     * @returns {Element} The inserted element
     */
  }, {
    key: "insert",
    value: function insert(templateId, data, container) {
      var position = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'append';
      var element = this.create(templateId, data);
      if (typeof container === 'string') {
        container = document.querySelector(container);
      }
      if (!container) {
        console.error("Container not found for template: ".concat(templateId));
        return null;
      }
      switch (position) {
        case 'prepend':
          container.prepend(element);
          break;
        case 'before':
          container.parentNode.insertBefore(element, container);
          break;
        case 'after':
          container.parentNode.insertBefore(element, container.nextSibling);
          break;
        case 'replace':
          container.parentNode.replaceChild(element, container);
          break;
        case 'append':
        default:
          container.appendChild(element);
          break;
      }
      return element;
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

      // Create message element - use correct template ID based on type
      var templateId = type === 'error' ? 'error-message-template' : 'success-message-template';

      // Find both templates in the modal-messages-template
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
  }, {
    key: "debugTemplates",
    value: function debugTemplates() {
      console.group('TemplateEngine Debug');
      console.log('Registered template IDs:', Object.keys(this.templates));
      console.log('Template elements:', Object.keys(this.templateElements));

      // Check each template
      Object.entries(this.templateElements).forEach(function (_ref7) {
        var _ref8 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref7, 2),
          id = _ref8[0],
          template = _ref8[1];
        console.log("Template ".concat(id, ":"), template);

        // Check template content
        if (template.content) {
          console.log("- Has content: ".concat(template.content.childNodes.length, " child nodes"));
        } else {
          console.warn("- No content for template ".concat(id));
        }
      });
      console.groupEnd();
    }
  }, {
    key: "debugNoteData",
    value: function debugNoteData(element, data) {
      console.log('Note data processing:', {
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
      console.group('Template Verification');
      console.log('Registered templates:', Object.keys(this.templates));
      console.log('Template elements:', Object.keys(this.templateElements));

      // Check note template specifically
      if (this.templates['note-item-template']) {
        console.log('Note template HTML:', this.templates['note-item-template'].substring(0, 100) + '...');
      } else {
        console.warn('Note template not registered!');
      }

      // Check if template element exists
      if (this.templateElements['note-item-template']) {
        console.log('Note template element exists');
      } else {
        console.warn('Note template element not created!');
      }
      console.groupEnd();
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


/**
 * VariationHandler.js
 *
 * Handles all product variation related functionality
 * for the Product Estimator plugin.
 */
var VariationHandler = /*#__PURE__*/function () {
  /**
   * Initialize the VariationHandler
   * @param {Object} config - Configuration options
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
      this.log('No variations form found, VariationHandler not initialized');
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
        this.log('VariationHandler already initialized');
        return this;
      }

      // Log the initial state for debugging
      this.log('Initializing VariationHandler with variations data:', this.variationsData);
      this.log('Estimator button found:', !!this.estimatorButton);

      // If we have the button, log its initial attributes
      if (this.estimatorButton) {
        this.log('Initial button data-product-id:', this.estimatorButton.dataset.productId);

        // Force visibility if product has estimator enabled
        var productId = this.estimatorButton.dataset.productId;
        if (productId) {
          // Check if parent product has estimator enabled
          var parentEnabled = this.isParentEstimatorEnabled(productId);
          if (parentEnabled) {
            this.log('Parent product has estimator enabled, ensuring button is visible');
            this.estimatorButton.style.display = '';
            this.estimatorButton.classList.remove('hidden');
          }
        }
      }
      this.bindEvents();

      // Check if there's already a selected variation (page could have loaded with a variation in URL)
      this.checkCurrentVariation();
      this.initialized = true;
      this.log('VariationHandler initialized');

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
      this.log("Ensuring estimator button exists for variation: ".concat(variationId));

      // Check if button already exists
      var existingButton = document.querySelector(this.config.selectors.estimatorButton);
      if (existingButton) {
        this.log('Estimator button already exists, updating visibility');
        this.updateEstimatorButton(true, variationId);
        return;
      }

      // Button doesn't exist, we need to create it if estimator is enabled
      var isEnabled = this.isEstimatorEnabled(variationId);
      if (!isEnabled) {
        this.log('Estimator not enabled for this variation, not creating button');
        return;
      }
      this.log('Creating estimator button dynamically');

      // Find the add to cart button as reference point
      var addToCartButton = document.querySelector('.single_add_to_cart_button');
      if (!addToCartButton) {
        this.log('Cannot find add to cart button to insert after');
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
      this.log('Estimator button created and inserted');
    }

    /**
     * Check if parent product has estimator enabled
     * @param {number|string} productId - Product ID
     * @returns {boolean} True if parent has estimator enabled
     */
  }, {
    key: "isParentEstimatorEnabled",
    value: function isParentEstimatorEnabled(productId) {
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
      this.log('Binding variation events');

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
            _this.log("Variation ID input changed to: ".concat(variationId));
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
            _this.log("jQuery variation ID change detected: ".concat(variationId));
            _this.currentVariationId = variationId;
            var enableEstimator = _this.isEstimatorEnabled(variationId);
            _this.updateEstimatorButton(enableEstimator, variationId);
          }
        });
      }

      // this.log('Variation events bound');
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
        this.log('Found variation event received but no valid variation data');
        return;
      }
      var variationId = variation.variation_id;
      this.currentVariationId = variationId;
      this.log("Found variation: ".concat(variationId));

      // Check if this variation has estimator enabled
      var enableEstimator = this.isEstimatorEnabled(variationId);
      this.log("Variation ".concat(variationId, " has estimator enabled: ").concat(enableEstimator));

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
      this.log('Reset variation');
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
      this.log('Check variations');

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
      var _this2 = this;
      // This handles cases where the variation might have changed through
      // theme-specific mechanisms or direct manipulation
      if (!this.variationsForm) return;

      // Debug the buttons we find
      var buttons = document.querySelectorAll(this.config.selectors.estimatorButton);
      this.log("Found ".concat(buttons.length, " estimator buttons during checkCurrentVariation"));
      if (buttons.length > 1) {
        this.log('WARNING: Found multiple estimator buttons - this may cause issues. Check for duplicates.');

        // Log the buttons for debugging
        buttons.forEach(function (btn, idx) {
          _this2.log("Button ".concat(idx + 1, " HTML: ").concat(btn.outerHTML));
        });
      }

      // Try to find the current variation ID
      var currentVariation = this.getCurrentVariation();
      if (currentVariation) {
        this.log("Current variation detected: ".concat(currentVariation.variation_id));
        this.currentVariationId = currentVariation.variation_id;
        var enableEstimator = this.isEstimatorEnabled(currentVariation.variation_id);
        this.updateEstimatorButton(enableEstimator, currentVariation.variation_id);
      } else {
        this.log('No current variation detected');
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
     * @returns {Object|null} The variation data or null if none selected
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
        var jqueryData = $form.data('product_variations');
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
      this.log("Checking if estimator is enabled for variation: ".concat(variationId));
      this.log('Available variations data:', this.variationsData);

      // Check if this variation has estimator enabled in our data
      if (this.variationsData[variationId]) {
        var isEnabled = this.variationsData[variationId].enable_estimator === 'yes';
        this.log("Found variation data, estimator enabled: ".concat(isEnabled));
        return isEnabled;
      }

      // If no specific data for this variation is found, check the parent product
      var parentButton = document.querySelector('.single_add_to_estimator_button[data-product-id]:not([data-variation-id])');
      if (parentButton) {
        // Check if parent button is visible, which suggests estimator is enabled for parent
        var parentEnabled = !parentButton.classList.contains('hidden') && getComputedStyle(parentButton).display !== 'none';
        this.log("Using parent product as fallback, estimator enabled: ".concat(parentEnabled));
        return parentEnabled;
      }
      this.log('No variation or parent data found, estimator disabled by default');
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
        this.log('Estimator button not found');
        return;
      }
      this.log("Updating button visibility: ".concat(show ? 'show' : 'hide', ", variation ID: ").concat(variationId));
      if (show) {
        // Show the button
        button.style.display = '';

        // Update product ID if variation ID provided
        if (variationId) {
          this.log("Setting button data-product-id to variation ID: ".concat(variationId));
          button.dataset.productId = variationId;
        }
      } else {
        // Hide the button
        button.style.display = 'none';
        this.log('Hiding estimator button');
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

    /**
     * Log debug messages
     * @param {...any} args - Arguments to log
     */
  }, {
    key: "log",
    value: function log() {
      if (this.config.debug) {
        var _console;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        (_console = console).log.apply(_console, ['[VariationHandler]'].concat(args));
      }
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
/* harmony import */ var _EstimatorCore__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./EstimatorCore */ "./src/js/frontend/EstimatorCore.js");
/* harmony import */ var _ConfirmationDialog__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ConfirmationDialog */ "./src/js/frontend/ConfirmationDialog.js");
/* harmony import */ var _SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./SuggestionsCarousel */ "./src/js/frontend/SuggestionsCarousel.js");
/* harmony import */ var _ProductDetailsToggle__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ProductDetailsToggle */ "./src/js/frontend/ProductDetailsToggle.js");
/* harmony import */ var _PrintEstimate__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./PrintEstimate */ "./src/js/frontend/PrintEstimate.js");
/* harmony import */ var _template_loader__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./template-loader */ "./src/js/frontend/template-loader.js");
/**
 * index.js
 *
 * Main entry point for the Product Estimator plugin.
 * This file initializes the application and loads required modules.
 */




 // Import the default instance



// Initialize templates first
var templateEngine = (0,_template_loader__WEBPACK_IMPORTED_MODULE_5__.initializeTemplates)();

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
  console.log('Product Estimator initialization check...');

  // Multiple guard checks - check both global flags
  if (window._productEstimatorInitialized) {
    console.log('Product Estimator already initialized globally, aborting');
    return;
  }

  // Also check for object existence
  if (window.productEstimator && window.productEstimator.initialized) {
    console.log('Product Estimator initialized property found, aborting');
    window._productEstimatorInitialized = true;
    return;
  }

  // Mark as initialized IMMEDIATELY before continuing
  window._productEstimatorInitialized = true;
  console.log('Product Estimator initializing for the first time...');
  try {
    // Setup global handlers (only once)
    setupGlobalEventHandlers();

    // Check for jQuery conflicts
    if (typeof jQuery !== 'undefined') {
      // Store the current jQuery version
      window.productEstimator = window.productEstimator || {};
      window.productEstimator.jQuery = jQuery;
    } else {
      console.warn('jQuery not detected, some features may not work');
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
    console.error('Error in Product Estimator initialization:', error);
  }
}

/**
 * Initialize the estimator core
 */
// In index.js (inside initEstimator function)

function initEstimator(debugMode) {
  try {
    // One final check to prevent race conditions
    if (window.productEstimator && window.productEstimator.initialized) {
      console.log('Product Estimator core already initialized, skipping');
      return;
    }
    console.log('Initializing EstimatorCore...');

    // Initialize core with configuration
    // This call creates the EstimatorCore.dataService instance internally
    _EstimatorCore__WEBPACK_IMPORTED_MODULE_0__["default"].init({
      debug: debugMode
      // Add any other configuration here
    });

    // Make dialog available globally
    window.productEstimator = window.productEstimator || {};
    window.productEstimator.initialized = true;
    window.productEstimator.core = _EstimatorCore__WEBPACK_IMPORTED_MODULE_0__["default"]; // EstimatorCore instance is stored here
    window.productEstimator.dialog = new _ConfirmationDialog__WEBPACK_IMPORTED_MODULE_1__["default"](); // <--- ADD 'new' HERE

    // Initialize PrintEstimate and make it available globally
    // Get the dataService instance from the initialized EstimatorCore
    var dataServiceInstance = window.productEstimator.core.dataService;
    if (!dataServiceInstance) {
      console.error("DataService instance not found on EstimatorCore. Cannot initialize PrintEstimate.");
      // Optionally return or handle this error case
      return;
    }

    // Pass the dataService instance to the PrintEstimate constructor
    window.productEstimator.printEstimate = new _PrintEstimate__WEBPACK_IMPORTED_MODULE_4__["default"]({
      debug: debugMode
    }, dataServiceInstance);

    // Make ProductDetailsToggle available globally
    window.productEstimator.detailsToggle = _ProductDetailsToggle__WEBPACK_IMPORTED_MODULE_3__["default"]; // Add toggle module to global object

    // Make initSuggestionsCarousels available globally for the toggle functionality
    window.initSuggestionsCarousels = _SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_2__.initSuggestionsCarousels;

    // Initialize toggle functionality explicitly
    initializeProductDetailsToggle(debugMode);
    console.log("Product Estimator initialized".concat(debugMode ? ' (debug mode)' : ''));

    // Dispatch an event that initialization is complete
    document.dispatchEvent(new CustomEvent('product_estimator_initialized'));
  } catch (e) {
    console.error('Error during EstimatorCore initialization:', e);
  }
}
/**
 * Initialize the ProductDetailsToggle functionality
 */
function initializeProductDetailsToggle(debugMode) {
  try {
    // Attach a global click handler to init toggle on product items
    document.addEventListener('click', function (e) {
      // If clicking an accordion header
      if (e.target.closest('.accordion-header')) {
        // Wait for content to be visible
        setTimeout(function () {
          // Force toggle module to scan for new content
          if (_ProductDetailsToggle__WEBPACK_IMPORTED_MODULE_3__["default"] && typeof _ProductDetailsToggle__WEBPACK_IMPORTED_MODULE_3__["default"].setup === 'function') {
            console.log('Accordion clicked, reinitializing product details toggle');
            _ProductDetailsToggle__WEBPACK_IMPORTED_MODULE_3__["default"].setup();
          }

          // Also initialize carousels
          if (typeof _SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_2__.initSuggestionsCarousels === 'function') {
            (0,_SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_2__.initSuggestionsCarousels)();
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
          if (typeof _SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_2__.initSuggestionsCarousels === 'function') {
            (0,_SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_2__.initSuggestionsCarousels)();
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
          if (typeof _SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_2__.initSuggestionsCarousels === 'function') {
            (0,_SuggestionsCarousel__WEBPACK_IMPORTED_MODULE_2__.initSuggestionsCarousels)();
          }
        }
        e.preventDefault();
        e.stopPropagation();
      }
    });
    console.log('ProductDetailsToggle initialization complete');
  } catch (error) {
    console.error('Error initializing ProductDetailsToggle:', error);
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
    console.log('Global event handlers already added, skipping');
    return;
  }
  console.log('Setting up global event handlers...');

  // Create and store handler reference
  window._productEstimatorCloseHandler = function (e) {
    if (e.target.closest('.product-estimator-modal-close') || e.target.classList.contains('product-estimator-modal-overlay')) {
      console.log('Global close handler triggered');

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
  console.log('Global event handlers added');
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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_EstimatorCore__WEBPACK_IMPORTED_MODULE_0__["default"]);

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
/* harmony import */ var _TemplateEngine__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./TemplateEngine */ "./src/js/frontend/TemplateEngine.js");
/* harmony import */ var _templates_components_product_item_html__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @templates/components/product-item.html */ "./src/templates/components/product-item.html");
/* harmony import */ var _templates_components_room_item_html__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @templates/components/room-item.html */ "./src/templates/components/room-item.html");
/* harmony import */ var _templates_components_estimate_item_html__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @templates/components/estimate-item.html */ "./src/templates/components/estimate-item.html");
/* harmony import */ var _templates_components_suggestion_item_html__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @templates/components/suggestion-item.html */ "./src/templates/components/suggestion-item.html");
/* harmony import */ var _templates_components_note_item_html__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @templates/components/note-item.html */ "./src/templates/components/note-item.html");
/* harmony import */ var _templates_components_include_item_html__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @templates/components/include-item.html */ "./src/templates/components/include-item.html");
/* harmony import */ var _templates_forms_new_estimate_form_html__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @templates/forms/new-estimate-form.html */ "./src/templates/forms/new-estimate-form.html");
/* harmony import */ var _templates_forms_new_room_form_html__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @templates/forms/new-room-form.html */ "./src/templates/forms/new-room-form.html");
/* harmony import */ var _templates_forms_room_selection_form_html__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @templates/forms/room-selection-form.html */ "./src/templates/forms/room-selection-form.html");
/* harmony import */ var _templates_forms_estimate_selection_html__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @templates/forms/estimate-selection.html */ "./src/templates/forms/estimate-selection.html");
/* harmony import */ var _templates_ui_estimates_empty_html__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @templates/ui/estimates-empty.html */ "./src/templates/ui/estimates-empty.html");
/* harmony import */ var _templates_ui_modal_messages_html__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @templates/ui/modal-messages.html */ "./src/templates/ui/modal-messages.html");

/**
 * Template Loader
 *
 * Imports all HTML templates and registers them with the template engine
 */

// Import template engine


// Import component templates







// Import form templates





// Import UI templates



// Create a map of all templates
var templates = {
  'product-item-template': _templates_components_product_item_html__WEBPACK_IMPORTED_MODULE_2__["default"],
  'room-item-template': _templates_components_room_item_html__WEBPACK_IMPORTED_MODULE_3__["default"],
  'estimate-item-template': _templates_components_estimate_item_html__WEBPACK_IMPORTED_MODULE_4__["default"],
  'suggestion-item-template': _templates_components_suggestion_item_html__WEBPACK_IMPORTED_MODULE_5__["default"],
  'note-item-template': _templates_components_note_item_html__WEBPACK_IMPORTED_MODULE_6__["default"],
  'include-item-template': _templates_components_include_item_html__WEBPACK_IMPORTED_MODULE_7__["default"],
  // Add this line
  'new-estimate-form-template': _templates_forms_new_estimate_form_html__WEBPACK_IMPORTED_MODULE_8__["default"],
  'new-room-form-template': _templates_forms_new_room_form_html__WEBPACK_IMPORTED_MODULE_9__["default"],
  'room-selection-form-template': _templates_forms_room_selection_form_html__WEBPACK_IMPORTED_MODULE_10__["default"],
  'estimate-selection-template': _templates_forms_estimate_selection_html__WEBPACK_IMPORTED_MODULE_11__["default"],
  'estimates-empty-template': _templates_ui_estimates_empty_html__WEBPACK_IMPORTED_MODULE_12__["default"],
  'modal-messages-template': _templates_ui_modal_messages_html__WEBPACK_IMPORTED_MODULE_13__["default"]
};

/**
 * Initialize all templates with the template engine
 * @returns {Object} The initialized template engine
 */
// In template-loader.js
function initializeTemplates() {
  console.group('Initializing templates');

  // Log all template IDs being registered
  console.log('Registering templates:', Object.keys(templates));
  Object.entries(templates).forEach(function (_ref) {
    var _ref2 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_ref, 2),
      id = _ref2[0],
      html = _ref2[1];
    if (!html || html.trim() === '') {
      console.warn("Template ".concat(id, " has empty HTML content!"));
    } else {
      console.log("Registering template: ".concat(id, " (").concat(html.length, " characters)"));
      _TemplateEngine__WEBPACK_IMPORTED_MODULE_1__["default"].registerTemplate(id, html);
    }
  });
  console.log("Initialized template engine with ".concat(Object.keys(templates).length, " templates"));
  console.groupEnd();
  return _TemplateEngine__WEBPACK_IMPORTED_MODULE_1__["default"];
}

// Add this function to check template content
function checkTemplateContent(templateId) {
  var template = templates[templateId];
  if (!template) {
    console.error("Template not found: ".concat(templateId));
    return false;
  }
  console.log("Template ".concat(templateId, " content (").concat(template.length, " characters):"));
  console.log(template.substring(0, 100) + '...');
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

console.log('Product Estimator Frontend initialized');

/***/ }),

/***/ "./src/templates/components/estimate-item.html":
/*!*****************************************************!*\
  !*** ./src/templates/components/estimate-item.html ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="estimate-item-template"> <div class="estimate-section collapsed" data-estimate-id=""> <div class="estimate-header"> <h3 class="estimate-name"> <div class="price-graph-container"> <div class="price-range-title"> <span class="price-title name"></span> <span class="estimate-price min_total max_total"></span> </div> <div class="price-graph-bar"> <div class="price-graph-range"></div> </div> <div class="price-graph-labels"></div> </div> </h3> <button class="remove-estimate" data-estimate-id="" title="Delete Estimate"> <span class="dashicons dashicons-trash"></span> </button> </div> <div class="estimate-content"> <div id="rooms"> <div class="room-header"> <h4>Rooms</h4> <button class="add-room" data-estimate="">Add New Room</button> </div> <div class="rooms-container"></div> </div> </div> <div class="estimate-actions"> <ul> <li> <a class="print-estimate" data-estimate-id="" title="Print Estimate"> <span class="dashicons dashicons-pdf"></span> Print estimate </a> </li> <li> <a class="request-contact-estimate" data-estimate-id="" title="Request contact from store"> <span class="dashicons dashicons-businessperson"></span> Request contact from store </a> </li> <li> <a class="request-a-copy" data-estimate-id="" title="Request a copy"> <span class="dashicons dashicons-email"></span> Request a copy </a> </li> </ul> </div> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/components/include-item.html":
/*!****************************************************!*\
  !*** ./src/templates/components/include-item.html ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="include-item-template"> <div class="include-item"> <span class="product-includes-icon"> <span class="dashicons dashicons-plus-alt"></span> </span> <div class="include-item-name"></div> <div class="include-item-prices"> <div class="include-item-total-price"> </div> </div> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/components/note-item.html":
/*!*************************************************!*\
  !*** ./src/templates/components/note-item.html ***!
  \*************************************************/
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

/***/ "./src/templates/components/product-item.html":
/*!****************************************************!*\
  !*** ./src/templates/components/product-item.html ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Imports
var ___HTML_LOADER_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw== */ "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="), __webpack_require__.b);
// Module
var code = `\`\`\`html <template id="product-item-template"> <div class="product-item" data-product-index=""> <div class="product-wrapper"> <img src="${___HTML_LOADER_IMPORT_0___}" alt="Product" class="product-thumbnail"> <div class="product-details-wrapper"> <div class="product-details"> <div class="price-graph-container"> <div class="price-range-title"> <span class="price-title"></span> <span class="price-dimensions"></span> <span class="product-price"></span> </div> <div class="price-graph-bar"> <div class="price-graph-range"></div> </div> <div class="price-graph-labels"></div> </div> <button class="remove-product" data-estimate-id="" data-room-id="" data-product-index=""> <span class="dashicons dashicons-trash"></span> </button> </div> </div> </div> <button class="product-includes-toggle expanded"> <span>Product Includes</span> <span class="toggle-icon dashicons dashicons-arrow-up-alt2"></span> </button> <div class="includes-container visible"> <div class="product-includes"> <div class="product-includes-items"></div> </div> </div> <button class="product-notes-toggle expanded"> <span>Product Notes</span> <span class="toggle-icon dashicons dashicons-arrow-up-alt2"></span> </button> <div class="notes-container visible"> <div class="product-notes"> <div class="product-notes-items"></div> </div> </div> </div> </template> \`\`\` `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/components/room-item.html":
/*!*************************************************!*\
  !*** ./src/templates/components/room-item.html ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="room-item-template"> <div class="accordion-item" data-room-id="" data-estimate-id=""> <div class="accordion-header-wrapper"> <button class="accordion-header"> <div class="price-graph-container"> <div class="price-range-title"> <span class="price-title room-name"></span> <span class="price-dimensions"></span> <span class="room-price"></span> </div> <div class="price-graph-bar"> <div class="price-graph-range"></div> </div> <div class="price-graph-labels"></div> </div> </button> <button class="remove-room" data-estimate-id="" data-room-id="" title="Remove Room"> <span class="dashicons dashicons-trash"></span> </button> </div> <div class="accordion-content"> <div class="room-products"> <h5>Products</h5> <div class="product-list"></div> </div> </div> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/components/suggestion-item.html":
/*!*******************************************************!*\
  !*** ./src/templates/components/suggestion-item.html ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Imports
var ___HTML_LOADER_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw== */ "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="), __webpack_require__.b);
// Module
var code = `<template id="suggestion-item-template"> <div class="suggestion-item"> <div class="suggestion-image"> <img src="${___HTML_LOADER_IMPORT_0___}" alt="" class="suggestion-img"> </div> <div class="suggestion-details"> <div class="suggestion-name"></div> <div class="suggestion-price"></div> <div class="suggestion-actions"> <button type="button" class="add-suggestion-to-room" data-product-id="" data-estimate-id="" data-room-id=""> Add </button> </div> </div> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/forms/estimate-selection.html":
/*!*****************************************************!*\
  !*** ./src/templates/forms/estimate-selection.html ***!
  \*****************************************************/
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

/***/ "./src/templates/forms/new-estimate-form.html":
/*!****************************************************!*\
  !*** ./src/templates/forms/new-estimate-form.html ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="new-estimate-form-template"> <div id="new-estimate-form-wrapper"> <h2>Create New Estimate</h2> <form id="new-estimate-form" method="post" data-has-email="false"> <div class="form-group"> <label for="estimate-name">Estimate Name</label> <input type="text" id="estimate-name" name="estimate_name" placeholder="e.g. Home Renovation" required> </div> <div class="customer-details-section"> <h4>Your Details</h4> <div class="form-group"> <label for="customer-postcode">Postcode</label> <input type="text" id="customer-postcode" name="customer_postcode" placeholder="Your postcode" required> </div> </div> <div class="button-group"> <button type="submit" class="submit-btn">Create Estimate</button> <button type="button" class="cancel-btn" data-form-type="estimate">Cancel</button> </div> </form> </div> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/forms/new-room-form.html":
/*!************************************************!*\
  !*** ./src/templates/forms/new-room-form.html ***!
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

/***/ "./src/templates/forms/room-selection-form.html":
/*!******************************************************!*\
  !*** ./src/templates/forms/room-selection-form.html ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<template id="room-selection-form-template"> <h2>Select a Room</h2> <form id="room-selection-form"> <div class="form-group"> <label for="room-dropdown">Choose a room:</label> <select id="room-dropdown" name="room_id" required> <option value="">-- Select a Room --</option> </select> </div> <div class="form-actions"> <button type="submit" class="button submit-btn">Add Product to Room</button> <button type="button" class="button cancel-btn back-btn" data-target="estimate-selection">Back</button> <button type="button" class="button add-room" id="add-new-room-from-selection" data-estimate="">Add New Room</button> </div> </form> </template> `;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);

/***/ }),

/***/ "./src/templates/ui/estimates-empty.html":
/*!***********************************************!*\
  !*** ./src/templates/ui/estimates-empty.html ***!
  \***********************************************/
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

/***/ "./src/templates/ui/modal-messages.html":
/*!**********************************************!*\
  !*** ./src/templates/ui/modal-messages.html ***!
  \**********************************************/
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