/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/admin.js":
/*!*************************!*\
  !*** ./src/js/admin.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _admin_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./admin/index */ "./src/js/admin/index.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");


var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.createLogger)('ProductEstimatorAdmin');
logger.log('Product Estimator Admin initialized');

/***/ }),

/***/ "./src/js/admin/ProductEstimatorAdmin.js":
/*!***********************************************!*\
  !*** ./src/js/admin/ProductEstimatorAdmin.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

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
 * General admin functionality for the Product Estimator plugin in the ADMIN
 * Note: Tab management functionality has been moved to ProductEstimatorSettings.js
 */

var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.createLogger)('ProductEstimatorAdmin');
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
     * @returns {string|undefined} Confirmation message or undefined if no changes
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
    }
  }]);
}(); // Create instance
new ProductEstimatorAdmin();
// Log initialization
logger.log('ProductEstimatorAdmin initialized');

// Export for module use
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProductEstimatorAdmin);

/***/ }),

/***/ "./src/js/admin/common/AdminTableManager.js":
/*!**************************************************!*\
  !*** ./src/js/admin/common/AdminTableManager.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @babel/runtime/helpers/get */ "./node_modules/@babel/runtime/helpers/esm/get.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/* harmony import */ var _VerticalTabbedModule_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./VerticalTabbedModule.js */ "./src/js/admin/common/VerticalTabbedModule.js");









function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0,_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6__["default"])(o), (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_5__["default"])(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6__["default"])(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _superPropGet(t, o, e, r) { var p = (0,_babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_7__["default"])((0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6__["default"])(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
// File: admin/js/common/AdminTableManager.js

/**
 * AdminTableManager.js
 *
 * Base class for managing admin list tables with add/edit/delete functionality
 * driven by AJAX. It relies on a specific HTML structure and localized data
 * provided by the corresponding PHP settings module.
 * Now extends VerticalTabbedModule.
 */
 // Import utilities needed for this class


var AdminTableManager = /*#__PURE__*/function (_VerticalTabbedModule) {
  /**
   * Constructor for AdminTableManager.
   * @param {object} config - Configuration object for the module.
   * @param {string} config.mainTabId - The ID of the main horizontal tab this table manager belongs to.
   * @param {string} config.localizedDataName - The name of the global JS object holding localized data.
   */
  function AdminTableManager(config) {
    var _this;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_3__["default"])(this, AdminTableManager);
    // Configuration for the VerticalTabbedModule parent class
    var vtmConfig = _objectSpread(_objectSpread({}, config), {}, {
      // Includes mainTabId, localizedDataName, and possibly defaultSubTabId
      // Only set defaultSubTabId if not already provided in config
      defaultSubTabId: config.defaultSubTabId || config.mainTabId + '_table',
      // Use more predictable format
      ajaxActionPrefix: "atm_form_save_".concat(config.mainTabId)
    });
    _this = _callSuper(this, AdminTableManager, [vtmConfig]); // Calls VerticalTabbedModule constructor
    _this.config = config; // <<<< ADD THIS LINE

    // --- CORRECTED LOGGER INITIALIZATION ---
    // Use `config.mainTabId` (from this constructor's direct argument `config`)
    // This `config` is guaranteed to have `mainTabId` as passed by ProductAdditionsSettingsModule.

    var loggerName = "AdminTableManager:".concat(config.mainTabId || 'Generic');
    _this.logger = (0,_utils__WEBPACK_IMPORTED_MODULE_9__.createLogger)(loggerName); // Pass the pre-constructed string

    // `this.settings` is initialized by the `super(vtmConfig)` call chain (ProductEstimatorSettings).
    // `this.settings.tab_id` will hold the mainTabId.
    // A check for its presence after super() is good practice.
    if (!_this.settings || !_this.settings.tab_id) {
      // This was previously an empty block, but it should log a warning
      _this.logger.warn('AdminTableManager: No tab_id found in settings.');
    }
    _this.formModified = false;
    _this.isEditMode = false;
    _this.currentItemId = null;
    // Note: this.settings (formerly this.localizedData) is initialized by ProductEstimatorSettings
    return _this;
  }

  /**
   * Validates that essential settings (now from this.settings) are provided.
   * @private
   */
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_8__["default"])(AdminTableManager, _VerticalTabbedModule);
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_4__["default"])(AdminTableManager, [{
    key: "_validateSettings",
    value: function _validateSettings() {
      if (!this.settings || this.settings.tab_id === undefined) {
        throw new Error("AdminTableManager: Essential property 'this.settings.tab_id' was not initialized by the parent class. Cannot validate settings.");
      }
      if (Object.keys(this.settings).length === 0) {
        var errorMsg = "AdminTableManager: Settings (this.settings) is an empty object";
        if (this.settingsObjectName) {
          errorMsg += " (expected from window.".concat(this.settingsObjectName, "). This might happen if the global object is empty or not correctly populated.");
        }
        throw new Error(errorMsg + " Cannot proceed with empty settings for tab \"".concat(this.settings.tab_id, "\"."));
      }
      var required = {
        actions: ['add_item', 'update_item', 'delete_item'],
        selectors: ['formContainer', 'form', 'addButton', 'listTableBody', 'editButton', 'deleteButton', 'idInput', 'saveButton', 'cancelButton', 'noItemsMessage', 'formTitle', 'listItemRow', 'listTableContainer', 'listTable'],
        i18n_keys: ['confirmDelete', 'itemSavedSuccess', 'itemDeletedSuccess', 'errorSavingItem', 'errorDeletingItem', 'addItemButtonLabel', 'editItemFormTitle', 'saving', 'deleting', 'editButtonLabel', 'deleteButtonLabel']
      };
      var allValid = true;
      if (this.settings.ajaxUrl === undefined) {
        allValid = false;
      }
      if (this.settings.nonce === undefined) {
        allValid = false;
      }
      if (this.settings.option_name === undefined) {
        allValid = false;
      }
      if (this.settings.actions) {
        var _iterator = _createForOfIteratorHelper(required.actions),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var key = _step.value;
            if (this.settings.actions[key] === undefined) {
              allValid = false;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      } else {
        allValid = false;
      }
      if (this.settings.selectors) {
        var _iterator2 = _createForOfIteratorHelper(required.selectors),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var _key = _step2.value;
            if (this.settings.selectors[_key] === undefined) {
              allValid = false;
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      } else {
        allValid = false;
      }
      if (this.settings.i18n) {
        var _iterator3 = _createForOfIteratorHelper(required.i18n_keys),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var _key2 = _step3.value;
            if (this.settings.i18n[_key2] === undefined) {
              this.logger.warn("AdminTableManager: Missing i18n key '".concat(_key2, "' in settings.i18n"));
              allValid = false;
            }
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
      } else {
        allValid = false;
      }
      if (!allValid) {
        throw new Error("AdminTableManager: Settings validation failed due to missing critical settings in this.settings for tab \"".concat(this.settings.tab_id, "\". Check console for details."));
      }
    }

    /**
     * Initializes the table manager. This method overrides VerticalTabbedModule.moduleInit().
     * It's called after DOM is ready and this.$container is set by the parent class.
     */
  }, {
    key: "moduleInit",
    value: function moduleInit() {
      _superPropGet(AdminTableManager, "moduleInit", this, 3)([]); // Calls VerticalTabbedModule.moduleInit() which sets up $container etc.

      if (!this.$container || !this.$container.length) {
        if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
          window.ProductEstimatorSettingsInstance.showNotice("Critical error: Table manager UI container #".concat(this.settings.tab_id, " missing."), 'error');
        }
        return;
      }
      try {
        this._validateSettings();
      } catch (error) {
        if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
          window.ProductEstimatorSettingsInstance.showNotice("Error initializing table manager for ".concat(this.settings.tab_id, ": Configuration validation failed. Check console. Details: ").concat(error.message), 'error');
        }
        return;
      }
      this.cacheDOM();
      if (this._checkEssentialDOM()) {
        this.bindEvents();
        this.updateNoItemsMessageVisibility();
        this.$(document).trigger("admin_table_manager_ready_".concat(this.settings.tab_id), [this]);
      } else {
        if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
          var tabDisplayName = this.settings.tab_id;
          window.ProductEstimatorSettingsInstance.showNotice("Error initializing UI components for ".concat(tabDisplayName, ". Some parts may not work. Check console for missing DOM elements."), 'error');
        }
      }
    }
  }, {
    key: "_checkEssentialDOM",
    value: function _checkEssentialDOM() {
      var essentialFound = true;
      if (!this.settings || !this.settings.selectors) {
        return false;
      }
      var essentialSelectors = ['formContainer', 'form', 'addButton', 'listTableBody', 'listTableContainer', 'listTable', 'noItemsMessage', 'formTitle', 'idInput', 'saveButton', 'cancelButton'];
      for (var _i = 0, _essentialSelectors = essentialSelectors; _i < _essentialSelectors.length; _i++) {
        var key = _essentialSelectors[_i];
        if (!this.dom[key] || !this.dom[key].length) {
          essentialFound = false;
        }
      }
      return essentialFound;
    }
  }, {
    key: "cacheDOM",
    value: function cacheDOM() {
      this.dom = {};
      if (!this.settings || !this.settings.selectors) {
        return;
      }
      if (this.$container && this.$container.length) {
        for (var key in this.settings.selectors) {
          if (Object.prototype.hasOwnProperty.call(this.settings.selectors, key)) {
            this.dom[key] = this.$container.find(this.settings.selectors[key]);
          }
        }
      } else {
        this.logger.warn("AdminTableManager: Container for '".concat(this.settings.tab_id, "' not found or has no length."));
      }
    }

    /**
     * Binds event handlers to DOM elements.
     * This method sets up all the common event handling for the table manager.
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var _this$dom$addButton,
        _this$settings$select,
        _this$settings$select2,
        _this$dom$form,
        _this$dom$cancelButto,
        _this$dom$form2,
        _this2 = this;
      if (!this.dom || Object.keys(this.dom).length === 0) {
        return;
      }
      (_this$dom$addButton = this.dom.addButton) === null || _this$dom$addButton === void 0 || _this$dom$addButton.on('click.adminTableManager', this.handleAddNew.bind(this));
      var editButtonSelector = (_this$settings$select = this.settings.selectors) === null || _this$settings$select === void 0 ? void 0 : _this$settings$select.editButton;
      var deleteButtonSelector = (_this$settings$select2 = this.settings.selectors) === null || _this$settings$select2 === void 0 ? void 0 : _this$settings$select2.deleteButton;
      if (this.dom.listTableBody && this.dom.listTableBody.length) {
        // Bind standard action buttons
        if (editButtonSelector) {
          this.dom.listTableBody.on('click.adminTableManager', editButtonSelector, this.handleEdit.bind(this));
        } else {
          this.logger.warn("AdminTableManager: No edit button selector defined for '".concat(this.settings.tab_id, "'."));
        }
        if (deleteButtonSelector) {
          this.dom.listTableBody.on('click.adminTableManager', deleteButtonSelector, this.handleDelete.bind(this));
        } else {
          this.logger.warn("AdminTableManager: No delete button selector defined for '".concat(this.settings.tab_id, "'."));
        }

        // Bind custom action buttons if they exist
        this.bindCustomActionButtons();
      } else {
        this.logger.warn("AdminTableManager: List table body not found for '".concat(this.settings.tab_id, "'."));
      }
      (_this$dom$form = this.dom.form) === null || _this$dom$form === void 0 || _this$dom$form.on('submit.adminTableManager', this.handleSubmit.bind(this));
      (_this$dom$cancelButto = this.dom.cancelButton) === null || _this$dom$cancelButto === void 0 || _this$dom$cancelButto.on('click.adminTableManager', this.handleCancel.bind(this));
      (_this$dom$form2 = this.dom.form) === null || _this$dom$form2 === void 0 || _this$dom$form2.on('change.adminTableManager input.adminTableManager', ':input', function () {
        _this2.formModified = true;
      });
    }

    /**
     * Binds event handlers for custom action buttons.
     * Child classes should override this method to bind their custom action buttons.
     */
  }, {
    key: "bindCustomActionButtons",
    value: function bindCustomActionButtons() {
      // Base implementation does nothing
      // Child classes should override to handle their custom action buttons
      // Example implementation:
      //
      // if (this.dom.listTableBody) {
      //   this.dom.listTableBody.on('click.adminTableManager', '.pe-view-product-button', this.handleViewProduct.bind(this));
      // }
    }
  }, {
    key: "handleAddNew",
    value: function handleAddNew(e) {
      var _this$dom$formTitle, _this$dom$saveButton, _this$dom$formContain, _this$dom$addButton2;
      e.preventDefault();
      this.isEditMode = false;
      this.currentItemId = null;
      this.resetForm();
      (_this$dom$formTitle = this.dom.formTitle) === null || _this$dom$formTitle === void 0 || _this$dom$formTitle.text(this.settings.i18n.addItemFormTitle || 'Add New Item');
      (_this$dom$saveButton = this.dom.saveButton) === null || _this$dom$saveButton === void 0 || _this$dom$saveButton.text(this.settings.i18n.addItemButtonLabel || this.settings.i18n.saveChangesButton || 'Save Item');
      (_this$dom$formContain = this.dom.formContainer) === null || _this$dom$formContain === void 0 || _this$dom$formContain.slideDown();
      (_this$dom$addButton2 = this.dom.addButton) === null || _this$dom$addButton2 === void 0 || _this$dom$addButton2.hide();
    }
  }, {
    key: "handleEdit",
    value: function handleEdit(e) {
      var _this$dom$formTitle2,
        _this$dom$saveButton2,
        _this3 = this;
      e.preventDefault();
      var $button = this.$(e.currentTarget);
      var $row = $button.closest(this.settings.selectors.listItemRow);
      var itemId = $row.data('id');
      if (!itemId) {
        this.showNotice('Error: Could not determine the item to edit.', 'error');
        return;
      }
      this.isEditMode = true;
      this.currentItemId = itemId;
      this.resetForm();
      if (this.dom.idInput && this.dom.idInput.length) {
        this.dom.idInput.val(this.currentItemId);
      } else {
        this.logger.warn("AdminTableManager: ID input field not found for '".concat(this.settings.tab_id, "'."));
      }
      (_this$dom$formTitle2 = this.dom.formTitle) === null || _this$dom$formTitle2 === void 0 || _this$dom$formTitle2.text(this.settings.i18n.editItemFormTitle || "Edit Item #".concat(itemId));
      (_this$dom$saveButton2 = this.dom.saveButton) === null || _this$dom$saveButton2 === void 0 || _this$dom$saveButton2.text(this.settings.i18n.updateChangesButton || 'Update Item');
      if (this.settings.actions && this.settings.actions.get_item) {
        this.showFormLoadingSpinner(true, this.dom.saveButton);
        _utils__WEBPACK_IMPORTED_MODULE_9__.ajax.ajaxRequest({
          url: this.settings.ajaxUrl,
          data: {
            action: this.settings.actions.get_item,
            nonce: this.settings.nonce,
            // This should be the item-specific nonce
            item_id: itemId,
            option_name: this.settings.option_name,
            tab_id: this.settings.tab_id
          }
        }).then(function (response) {
          if (response && response.item && (0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1__["default"])(response.item) === 'object') {
            var _this3$dom$formContai, _this3$dom$addButton;
            _this3.populateFormWithData(response.item);
            (_this3$dom$formContai = _this3.dom.formContainer) === null || _this3$dom$formContai === void 0 || _this3$dom$formContai.slideDown();
            (_this3$dom$addButton = _this3.dom.addButton) === null || _this3$dom$addButton === void 0 || _this3$dom$addButton.hide();
          } else {
            var errorMsg = response && response.message ? response.message : _this3.settings.i18n.errorLoadingItem || 'Error loading item details.';
            _this3.showNotice(errorMsg, 'error');
          }
        })["catch"](function (error) {
          _this3.showNotice(error.message || _this3.settings.i18n.errorLoadingItem || 'AJAX error loading item.', 'error');
        })["finally"](function () {
          _this3.showFormLoadingSpinner(false, _this3.dom.saveButton);
        });
      } else {
        var _this$dom$formContain2, _this$dom$addButton3;
        var itemDataFromButton = $button.data();
        if (Object.keys(itemDataFromButton).length > 1) {
          itemDataFromButton.id = itemId;
          this.populateFormWithData(itemDataFromButton);
        } else {
          this.showNotice('Note: Full item details might not be loaded. Displaying basic form for editing.', 'info');
        }
        (_this$dom$formContain2 = this.dom.formContainer) === null || _this$dom$formContain2 === void 0 || _this$dom$formContain2.slideDown();
        (_this$dom$addButton3 = this.dom.addButton) === null || _this$dom$addButton3 === void 0 || _this$dom$addButton3.hide();
      }
    }
  }, {
    key: "handleDelete",
    value: function handleDelete(e) {
      var _this4 = this;
      e.preventDefault();
      var $button = this.$(e.currentTarget);
      var $row = $button.closest(this.settings.selectors.listItemRow);
      var itemId = $row.data('id');
      if (!itemId) {
        this.showNotice('Error: Could not determine item to delete.', 'error');
        return;
      }
      if (!confirm(this.settings.i18n.confirmDelete || 'Are you sure you want to delete this item?')) {
        return;
      }
      var originalButtonText = $button.text();
      $button.prop('disabled', true).text(this.settings.i18n.deleting || 'Deleting...');
      _utils__WEBPACK_IMPORTED_MODULE_9__.ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: {
          action: this.settings.actions.delete_item,
          nonce: this.settings.nonce,
          // Item-specific nonce
          item_id: itemId,
          option_name: this.settings.option_name,
          tab_id: this.settings.tab_id
        }
      }).then(function (response) {
        var isSuccess = response && (response.success === true || response.itemId && response.message);
        if (isSuccess) {
          _this4.showNotice(response.data && response.data.message || response.message || _this4.settings.i18n.itemDeletedSuccess || 'Item deleted.', 'success');
          $row.fadeOut(300, function () {
            $row.remove();
            _this4.updateNoItemsMessageVisibility();
          });
        } else {
          _this4.showNotice(response && response.message || response && response.data && response.data.message || _this4.settings.i18n.errorDeletingItem || 'Error deleting item.', 'error');
          $button.prop('disabled', false).text(originalButtonText);
        }
      })["catch"](function (error) {
        _this4.showNotice(error.message || _this4.settings.i18n.errorDeletingItem || 'AJAX error deleting item.', 'error');
        $button.prop('disabled', false).text(originalButtonText);
      });
    }
  }, {
    key: "handleSubmit",
    value: function handleSubmit(e) {
      var _this5 = this;
      e.preventDefault();
      if (!this.validateForm()) {
        this.showNotice(this.settings.i18n.validationFailed || 'Please correct the errors in the form.', 'error');
        return;
      }
      this.showFormLoadingSpinner(true, this.dom.saveButton);
      var determinedAction = this.isEditMode ? this.settings.actions.update_item : this.settings.actions.add_item;
      if (!determinedAction) {
        this.showNotice(this.settings.i18n.errorSavingItem || 'Configuration error: Save action not defined.', 'error');
        this.showFormLoadingSpinner(false, this.dom.saveButton);
        return;
      }
      var dataPayload = {
        action: determinedAction,
        nonce: this.settings.nonce,
        // Item-specific nonce
        option_name: this.settings.option_name,
        tab_id: this.settings.tab_id,
        item_data: {}
      };
      var formFields = this.dom.form.serializeArray();
      formFields.forEach(function (field) {
        var fieldName = field.name;
        var fieldValue = field.value;
        if (fieldName.endsWith('[]')) {
          var actualName = fieldName.slice(0, -2);
          if (!dataPayload.item_data[actualName]) {
            dataPayload.item_data[actualName] = [];
          }
          dataPayload.item_data[actualName].push(fieldValue);
        } else {
          dataPayload.item_data[fieldName] = fieldValue;
        }
      });
      if (this.isEditMode && this.currentItemId) {
        dataPayload.item_id = this.currentItemId;
      }
      _utils__WEBPACK_IMPORTED_MODULE_9__.ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: dataPayload
      }).then(function (response) {
        // Enhanced response validation with detailed logging
        if (!response) {
          _this5.showNotice(_this5.settings.i18n.errorSavingItem || 'Error: Empty response from server', 'error');
          return;
        }
        if (response && response.item) {
          var _this5$dom$formContai, _this5$dom$addButton;
          _this5.showNotice(response.message || _this5.settings.i18n.itemSavedSuccess || 'Item saved.', 'success');

          // CRITICAL: Handling the first item scenario directly
          var isFirstItem = !_this5.dom.listTableBody.find('tr').length;
          if (_this5.isEditMode) {
            _this5.updateTableRow(response.item);
          } else {
            _this5.addTableRow(response.item);

            // Special handling for first item
            if (isFirstItem) {
              _this5.dom.listTable.show();
              _this5.dom.noItemsMessage.hide();

              // Force DOM recalculation/repaint for the table
              void _this5.dom.listTable[0].offsetHeight;
            }
          }
          (_this5$dom$formContai = _this5.dom.formContainer) === null || _this5$dom$formContai === void 0 || _this5$dom$formContai.slideUp();
          (_this5$dom$addButton = _this5.dom.addButton) === null || _this5$dom$addButton === void 0 || _this5$dom$addButton.show();
          _this5.resetForm();
          _this5.isEditMode = false;
          _this5.currentItemId = null;
          _this5.formModified = false;
        } else {
          var errorMsg = response && response.message ? response.message : _this5.settings.i18n.errorSavingItem || 'Error saving item or response format incorrect.';
          var errorsDetail = response && response.errors ? "<br><pre>".concat(JSON.stringify(response.errors, null, 2), "</pre>") : '';
          _this5.showNotice(errorMsg + errorsDetail, 'error');
        }
      })["catch"](function (error) {
        var errorMsg = error.message || _this5.settings.i18n.errorSavingItem || 'AJAX error during save.';
        _this5.showNotice(errorMsg, 'error');
      })["finally"](function () {
        _this5.showFormLoadingSpinner(false, _this5.dom.saveButton);
      });
    }
  }, {
    key: "handleCancel",
    value: function handleCancel(e) {
      var _this$dom$formContain3, _this$dom$addButton4;
      e.preventDefault();
      if (this.formModified) {
        if (!confirm(this.settings.i18n.confirmCancelEditing || "You have unsaved changes. Are you sure you want to cancel?")) {
          return;
        }
      }
      (_this$dom$formContain3 = this.dom.formContainer) === null || _this$dom$formContain3 === void 0 || _this$dom$formContain3.slideUp();
      (_this$dom$addButton4 = this.dom.addButton) === null || _this$dom$addButton4 === void 0 || _this$dom$addButton4.show();
      this.resetForm();
      this.isEditMode = false;
      this.currentItemId = null;
      this.formModified = false;
    }
  }, {
    key: "resetForm",
    value: function resetForm() {
      var _this$dom$form$, _this$dom$form3, _this$dom$form4;
      (_this$dom$form$ = this.dom.form[0]) === null || _this$dom$form$ === void 0 || _this$dom$form$.reset();
      if (this.dom.idInput && this.dom.idInput.length) {
        this.dom.idInput.val('');
      }
      this.formModified = false;
      (_this$dom$form3 = this.dom.form) === null || _this$dom$form3 === void 0 || _this$dom$form3.find('.error').removeClass('error');
      (_this$dom$form4 = this.dom.form) === null || _this$dom$form4 === void 0 || _this$dom$form4.find('.field-error').remove();
    }
  }, {
    key: "populateFormWithData",
    value: function populateFormWithData(itemData) {
      if (itemData && itemData.id) {
        if (this.dom.idInput && this.dom.idInput.length) {
          this.dom.idInput.val(itemData.id);
        } else {
          this.logger.warn("AdminTableManager: ID input field not found when populating form data for '".concat(this.settings.tab_id, "'."));
        }
      } else {
        this.logger.warn("AdminTableManager: Invalid item data (missing ID) when populating form for '".concat(this.settings.tab_id, "'."));
      }
      this.formModified = false;
    }
  }, {
    key: "validateForm",
    value: function validateForm() {
      var _this$dom$form5,
        _this$dom$form6,
        _this$dom$form7,
        _this6 = this;
      var isValid = true;
      (_this$dom$form5 = this.dom.form) === null || _this$dom$form5 === void 0 || _this$dom$form5.find('.error').removeClass('error');
      (_this$dom$form6 = this.dom.form) === null || _this$dom$form6 === void 0 || _this$dom$form6.find('.field-error').remove();
      (_this$dom$form7 = this.dom.form) === null || _this$dom$form7 === void 0 || _this$dom$form7.find('[data-is-required="true"], .is-required').each(function (index, el) {
        var $field = _this6.$(el);
        var value = $field.val();
        if ($field.is(':checkbox')) {
          if (!$field.is(':checked')) {
            _this6.showFieldError($field.closest('label').length ? $field.closest('label') : $field, _this6.settings.i18n.fieldRequired || 'This field must be checked.');
            isValid = false;
          }
        } else {
          if (typeof value === 'string') value = value.trim();
          if (value === null || value === undefined || value === '' || $field.is('select') && !value) {
            _this6.showFieldError($field, _this6.settings.i18n.fieldRequired || 'This field is required.');
            isValid = false;
          }
        }
      });
      return isValid;
    }
  }, {
    key: "addTableRow",
    value: function addTableRow(itemData) {
      // Debug table state before adding row

      // Create the row
      var $row = this.createTableRow(itemData);

      // Add the row to the table
      if ($row && this.dom.listTableBody && this.dom.listTableBody.length) {
        this.dom.listTableBody.append($row);

        // Always make table visible after adding a row, and hide the "no items" message
        if (this.dom.listTable) {
          this.dom.listTable.show();
        }
        if (this.dom.noItemsMessage) {
          this.dom.noItemsMessage.hide();
        }

        // Skip updateNoItemsMessageVisibility() since we're explicitly handling visibility

        // Debug table state after adding row
      } else {
        this.logger.warn("AdminTableManager: Could not add table row - either row creation failed or table body not found for '".concat(this.settings.tab_id, "'."));
      }
    }
  }, {
    key: "updateTableRow",
    value: function updateTableRow(itemData) {
      var _this$dom$listTableBo;
      if (!itemData.id) {
        return;
      }
      if (!this.settings.selectors || !this.settings.selectors.listItemRow) {
        return;
      }
      var $existingRow = (_this$dom$listTableBo = this.dom.listTableBody) === null || _this$dom$listTableBo === void 0 ? void 0 : _this$dom$listTableBo.find("".concat(this.settings.selectors.listItemRow, "[data-id=\"").concat(itemData.id, "\"]"));
      if ($existingRow && $existingRow.length) {
        var $newRow = this.createTableRow(itemData);
        if ($newRow) {
          $existingRow.replaceWith($newRow);
        } else {
          this.logger.warn("AdminTableManager: Failed to create replacement row for item #".concat(itemData.id, " in '").concat(this.settings.tab_id, "'."));
        }
      } else {
        this.addTableRow(itemData);
      }
    }

    /**
     * Creates a table row from item data.
     * This method provides a common implementation for creating table rows based on
     * the table_columns setting provided from PHP.
     * @param {object} itemData - The item data for the row.
     * @returns {jQuery} - The jQuery object representing the row.
     */
  }, {
    key: "createTableRow",
    value: function createTableRow(itemData) {
      var _this7 = this;
      if (!itemData || !itemData.id) {
        var _this$dom$listTable;
        // Return a valid jQuery object for a row, even for an error.
        var colspan = ((_this$dom$listTable = this.dom.listTable) === null || _this$dom$listTable === void 0 ? void 0 : _this$dom$listTable.find('thead th').length) || 4;
        return this.$("<tr><td colspan=\"".concat(colspan, "\">Error: Invalid item data provided to createTableRow.</td></tr>"));
      }

      // Get column information from the settings passed from PHP
      var tableColumns = this.settings.table_columns || {};
      if (Object.keys(tableColumns).length === 0) {
        var _this$dom$listTable2;
        var _colspan = ((_this$dom$listTable2 = this.dom.listTable) === null || _this$dom$listTable2 === void 0 ? void 0 : _this$dom$listTable2.find('thead th').length) || 4;
        return this.$("<tr><td colspan=\"".concat(_colspan, "\">Error: table_columns data missing in settings for ").concat(this.settings.tab_id, ".</td></tr>"));
      }

      // Get selector values
      var selectors = this.settings.selectors || {};
      var listItemRowSelector = selectors.listItemRow || 'tr'; // Base class might use this if defined
      var editButtonClass = (selectors.editButton || '.pe-edit-item-button').replace(/^\./, '');
      var deleteButtonClass = (selectors.deleteButton || '.pe-delete-item-button').replace(/^\./, '');

      // Get i18n strings
      var i18n = this.settings.i18n || {};

      // Extract just the tag name without any attribute selectors
      var tagName = listItemRowSelector.split('.')[0].replace(/\[(.*?)\]/g, '');

      // Create the row with the correct tag and data-id attribute
      var $row = this.$("<".concat(tagName, " data-id=\"").concat(itemData.id, "\"></").concat(tagName, ">"));

      // Debug the row element that's being created

      // If listItemRowSelector includes classes, add them: e.g., 'tr.my-custom-row-class'
      if (listItemRowSelector.includes('.')) {
        $row.addClass(listItemRowSelector.substring(listItemRowSelector.indexOf('.') + 1).replace(/\./g, ' '));
      }

      // Create each cell using the column IDs from PHP
      Object.entries(tableColumns).forEach(function (_ref) {
        var _ref2 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_ref, 2),
          columnId = _ref2[0],
          columnTitle = _ref2[1];
        var $cell = _this7.$('<td></td>').addClass("column-".concat(columnId)) // Match the PHP class naming convention
        .attr('data-colname', columnTitle); // Set the column title for responsive display

        // Log column creation for debugging

        // Hook points for column customization:
        // 1. Child class can implement a specific method for a column
        // 2. Generic actions column handler
        // 3. Default text display

        // Check if the child class has a method to populate specific column content
        var methodName = "populateColumn_".concat(columnId.replace(/[^a-zA-Z0-9_]/g, '_'));
        if (typeof _this7[methodName] === 'function') {
          // Let the child class handle this specific column
          _this7[methodName]($cell, itemData, columnId);
        } else if (columnId === 'item_actions' || columnId.endsWith('_actions')) {
          // Default handling for actions column
          $cell.addClass('actions');

          // Create edit button
          var $editButton = _this7.$('<button></button>').attr('type', 'button').addClass("button button-small ".concat(editButtonClass)).text(i18n.editButtonLabel || 'Edit').data('id', itemData.id);

          // Create delete button
          var $deleteButton = _this7.$('<button></button>').attr('type', 'button').addClass("button button-small ".concat(deleteButtonClass)).text(i18n.deleteButtonLabel || 'Delete').data('id', itemData.id);
          $cell.append($editButton, ' ', $deleteButton);
        } else {
          // Default handling for other columns - just use the display field if available
          var displayField = "".concat(columnId, "_display");
          var displayValue = itemData[displayField] || itemData[columnId] || '';
          $cell.text(displayValue);
        }

        // Add the cell to the row
        $row.append($cell);
      });

      // Debug the final row structure

      // Allow child classes to perform post-processing on the row
      if (typeof this.afterRowCreated === 'function') {
        this.afterRowCreated($row, itemData);
      }
      return $row;
    }
  }, {
    key: "updateNoItemsMessageVisibility",
    value: function updateNoItemsMessageVisibility() {
      if (!this.settings.selectors || !this.settings.selectors.listItemRow) {
        return;
      }

      // Debug info

      if (this.dom.noItemsMessage && this.dom.noItemsMessage.length && this.dom.listTableBody && this.dom.listTable) {
        var rowSelector = this.settings.selectors.listItemRow;
        var $foundRows = this.dom.listTableBody.find(rowSelector);
        var hasItems = $foundRows.length > 0;
        if (hasItems) {
          this.dom.noItemsMessage.hide();
          this.dom.listTable.show();
        } else {
          this.dom.noItemsMessage.show();
          this.dom.listTable.hide();
        }
      } else {
        this.logger.warn("AdminTableManager: Required DOM elements for no-items message handling not found for '".concat(this.settings.tab_id, "'."));
      }
    }
  }, {
    key: "showFormLoadingSpinner",
    value: function showFormLoadingSpinner(isLoading, $button) {
      var $btn = $button || this.dom.saveButton;
      if (!$btn || !$btn.length) return;
      var originalTextKey = 'original-text';
      var savingText = this.settings.i18n && this.settings.i18n.saving || 'Saving...';
      if (isLoading) {
        $btn.prop('disabled', true).addClass('pe-loading');
        if (!$btn.data(originalTextKey)) {
          var currentText = $btn.is('input, textarea, select') ? $btn.val() : $btn.text();
          $btn.data(originalTextKey, currentText);
        }
        if ($btn.is('input, textarea, select')) $btn.val(savingText);else $btn.text(savingText);
      } else {
        $btn.prop('disabled', false).removeClass('pe-loading');
        if ($btn.data(originalTextKey)) {
          var originalText = $btn.data(originalTextKey);
          if ($btn.is('input, textarea, select')) $btn.val(originalText);else $btn.text(originalText);
          $btn.removeData(originalTextKey);
        }
      }
    }
  }]);
}(_VerticalTabbedModule_js__WEBPACK_IMPORTED_MODULE_10__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AdminTableManager);

/***/ }),

/***/ "./src/js/admin/common/ProductEstimatorSettings.js":
/*!*********************************************************!*\
  !*** ./src/js/admin/common/ProductEstimatorSettings.js ***!
  \*********************************************************/
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
 * Main Settings JavaScript
 *
 * Handles common functionality for the settings page and serves as a base class for specific settings modules.
 * Modified to work with separate forms for each tab and support module extension.
 */

var ProductEstimatorSettings = /*#__PURE__*/function () {
  /**
   * Initialize the Settings Manager or a Settings Module
   * @param {object|null} moduleOptions - Options if being used as a base for a module.
   * { boolean } isModule - True if being initialized as a module.
   * { string } settingsObjectName - Name of the global object holding localized settings (e.g., 'generalSettings').
   * { string } defaultTabId - Default tab ID for the module.
   * { string } loggerName - Name for the logger for this module instance.
   */
  function ProductEstimatorSettings() {
    var _this = this;
    var moduleOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__["default"])(this, ProductEstimatorSettings);
    this.$ = jQuery;
    // Use createLogger for consistency if preferred, or the existing `log` for the orchestrator.
    // For simplicity, the orchestrator part will continue using the imported `log` as per original.
    // Modules will typically define their own `createLogger` instance.
    // This logger is for the base class methods when they log.
    this.baseClassLogger = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.createLogger)(this.constructor.name);
    if (moduleOptions && moduleOptions.isModule) {
      // Path for when used as a base for a specific settings module
      this.settingsObjectName = moduleOptions.settingsObjectName;
      this.defaultTabId = moduleOptions.defaultTabId;
      this._initializeModuleSpecificSettings(this.settingsObjectName, this.defaultTabId);
      this.$(document).ready(function () {
        _this._finalizeModuleSettings(_this.settingsObjectName);
        if (typeof _this.moduleInit === 'function') {
          _this.moduleInit();
        } else {
          // No moduleInit method defined in subclass - skipping initialization
        }
      });
    } else {
      // Original constructor path for the main settings page orchestrator
      this.formChanged = false;
      this.currentTab = '';
      this.formChangeTrackers = {}; // Track form changes per tab

      this.ensureGlobalVariables();

      // Call mainInit for the orchestrator AFTER document is ready, similar to modules
      this.$(document).ready(function () {
        _this.mainInit();
      });
    }
  }

  /**
   * Initialize settings for a derived module.
   * @param {string} settingsObjectName - The name of the window object holding settings (e.g., 'generalSettings').
   * @param {string} defaultTabId - The default tab ID for the module.
   * @protected
   */
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__["default"])(ProductEstimatorSettings, [{
    key: "_initializeModuleSpecificSettings",
    value: function _initializeModuleSpecificSettings(settingsObjectName, defaultTabId) {
      var localizedSettings = window[settingsObjectName] || {};
      this.settings = _objectSpread({}, localizedSettings);
      this.settings.ajaxUrl = localizedSettings.ajaxUrl || (typeof ajaxurl !== 'undefined' ? ajaxurl : '/wp-admin/admin-ajax.php');
      this.settings.nonce = localizedSettings.nonce || window.productEstimatorSettings && window.productEstimatorSettings.nonce || '';

      // Ensure 'actions' is an object, merge with any global/default actions
      var defaultActions = window.productEstimatorSettings && window.productEstimatorSettings.actions || {};
      this.settings.actions = _objectSpread(_objectSpread({}, defaultActions), localizedSettings.actions || {});
      // For simple modules, ensure a basic save_settings action if nothing else is provided
      if (!this.settings.actions.save_settings && defaultTabId) {
        this.settings.actions.save_settings = "save_".concat(defaultTabId, "_settings");
      }

      // Ensure 'selectors' is an object, merge with any global/default selectors
      var defaultSelectors = window.productEstimatorSettings && window.productEstimatorSettings.selectors || {};
      this.settings.selectors = _objectSpread(_objectSpread({}, defaultSelectors), localizedSettings.selectors || {});
      this.settings.i18n = _objectSpread(_objectSpread({}, window.productEstimatorSettings && window.productEstimatorSettings.i18n), localizedSettings.i18n || {});
      this.settings.tab_id = localizedSettings.tab_id || defaultTabId;
      this.settings.settingsObjectName = settingsObjectName;

      // The 'option_name' should ideally always come from localizedSettings.
      // If it might be missing, you'd need a strategy (e.g., a global default or error).
      if (typeof this.settings.option_name === 'undefined') {
        // Consider a fallback if appropriate:
        // this.settings.option_name = 'product_estimator_settings'; // Example global default
      }

      // Diagnostic logs (keep these or similar)
      if (typeof localizedSettings.actions === 'undefined') {
        // Check original localizedSettings
        this.logger.warn('ProductEstimatorSettings: actions is undefined in localizedSettings');
      }
      if (typeof localizedSettings.selectors === 'undefined') {
        // Check original localizedSettings
        this.logger.warn('ProductEstimatorSettings: selectors is undefined in localizedSettings');
      }
    }
    /**
     * Finalize module settings on document.ready (e.g., update nonce).
     * @param {string} settingsObjectName - The name of the window object holding settings.
     * @protected
     */
  }, {
    key: "_finalizeModuleSettings",
    value: function _finalizeModuleSettings(settingsObjectName) {
      var updatedLocalizedSettingsOnReady = window[settingsObjectName] || {};
      if (updatedLocalizedSettingsOnReady.nonce) {
        this.settings.nonce = updatedLocalizedSettingsOnReady.nonce;
      }
    }

    /**
     * Ensure all required global variables exist to prevent reference errors (for orchestrator).
     */
  }, {
    key: "ensureGlobalVariables",
    value: function ensureGlobalVariables() {
      window.featureSwitchesSettings = window.featureSwitchesSettings || {
        tab_id: 'feature_switches',
        i18n: {}
      };
      window.generalSettings = window.generalSettings || {
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
      window.pricingRulesSettings = window.pricingRulesSettings || {
        tab_id: 'pricing_rules',
        i18n: {}
      };
      window.productAdditionsSettings = window.productAdditionsSettings || {
        tab_id: 'product_additions',
        i18n: {}
      };
      window.similarProductsSettings = window.similarProductsSettings || {
        tab_id: 'similar_products',
        i18n: {}
      };
      window.labelSettings = window.labelSettings || {
        tab_id: 'labels',
        i18n: {}
      };
      window.productEstimatorSettings = window.productEstimatorSettings || {
        ajax_url: typeof ajaxurl !== 'undefined' ? ajaxurl : '/wp-admin/admin-ajax.php',
        nonce: '',
        i18n: {
          unsavedChanges: 'You have unsaved changes. Are you sure you want to leave this tab?',
          saveSuccess: 'Settings saved successfully.',
          saveError: 'Error saving settings.',
          saving: 'Saving...'
        }
      };
    }

    /**
     * Initialize the main Settings Manager (orchestrator).
     */
  }, {
    key: "mainInit",
    value: function mainInit() {
      var urlTab = this.getTabFromUrl();
      this.currentTab = urlTab !== null ? urlTab : 'general';
      this.$('.tab-content').hide();
      this.$("#".concat(this.currentTab)).show();
      this.$('.nav-tab').removeClass('nav-tab-active');
      this.$(".nav-tab[data-tab=\"".concat(this.currentTab, "\"]")).addClass('nav-tab-active');
      this.bindMainEvents();
      this.initFormChangeTracking();
      this.initializeValidation(); // Global validation for forms handled by orchestrator
    }

    /**
     * Bind event handlers for the main Settings Manager (orchestrator).
     */
  }, {
    key: "bindMainEvents",
    value: function bindMainEvents() {
      var _this2 = this;
      // Prevent default link behavior and handle tab switching via JS
      this.$('.nav-tab-wrapper').on('click', '.nav-tab', this.handleTabClick.bind(this));

      // Also prevent default on link elements themselves
      this.$('.nav-tab-wrapper a.nav-tab').on('click', function (e) {
        e.preventDefault();
      });
      this.$(document).on('submit', 'form.product-estimator-form', function (e) {
        var $form = _this2.$(e.currentTarget);
        if ($form.hasClass('pe-vtabs-tab-form') && $form.attr('data-sub-tab-id')) {
          return;
        }
        e.preventDefault();
        _this2.handleAjaxFormSubmit(e, $form);
      });
      this.$(window).on('beforeunload', this.handleBeforeUnload.bind(this));
    }

    /**
     * Handle AJAX form submission for orchestrator-managed forms.
     * @param {Event} e - Submit event
     * @param {jQuery} [$form] - Optional: The form element.
     */
  }, {
    key: "handleAjaxFormSubmit",
    value: function handleAjaxFormSubmit(e, $form) {
      var _this3 = this;
      $form = $form || this.$(e.target);
      var tabId = $form.closest('.tab-content').attr('id') || $form.data('tab');
      var formData = $form.serialize();
      $form.find('input[type="checkbox"]').each(function (i, el) {
        var $cb = _this3.$(el);
        if (!$cb.is(':checked')) {
          var name = $cb.attr('name');
          if (name) {
            var paramRegex = new RegExp("(^|&)".concat(encodeURIComponent(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "(?:=[^&]*)?"));
            if (formData.match(paramRegex) === null) {
              formData += "&".concat(encodeURIComponent(name), "=0");
            }
          }
        }
      });
      formData = formData.replace(/^&+/, '').replace(/&&+/g, '&');
      this.showFormLoading($form);
      var ajaxAction = "save_".concat(tabId, "_settings");
      var localizedData = window.productEstimatorSettings || {
        nonce: '',
        ajax_url: ajaxurl,
        i18n: {}
      };
      var ajaxDataPayload = {
        action: ajaxAction,
        nonce: localizedData.nonce,
        form_data: formData
      };
      _utils__WEBPACK_IMPORTED_MODULE_3__.ajax.ajaxRequest({
        url: localizedData.ajax_url,
        type: 'POST',
        data: ajaxDataPayload
      }).then(function (response) {
        _this3.showNotice(response.message || localizedData.i18n.saveSuccess, 'success');
        if (_this3.formChangeTrackers) {
          // Ensure orchestrator properties exist
          _this3.formChangeTrackers[tabId] = false;
        }
        if (tabId === _this3.currentTab) {
          _this3.formChanged = false;
        }
      })["catch"](function (error) {
        var errorMessage = error && error.message ? error.message : localizedData.i18n.saveError;
        _this3.showNotice(errorMessage, 'error');
      })["finally"](function () {
        _this3.hideFormLoading($form);
      });
    }

    /**
     * Show loading state for a form.
     * @param {jQuery} $form - The form element.
     */
  }, {
    key: "showFormLoading",
    value: function showFormLoading($form) {
      var $submitButton = $form.find(':submit');
      $submitButton.prop('disabled', true).addClass('loading');
      $submitButton.data('original-text', $submitButton.val());
      var savingText = window.productEstimatorSettings && window.productEstimatorSettings.i18n && window.productEstimatorSettings.i18n.saving ? window.productEstimatorSettings.i18n.saving : 'Saving...';
      $submitButton.val(savingText);
    }

    /**
     * Hide loading state for a form.
     * @param {jQuery} $form - The form element.
     */
  }, {
    key: "hideFormLoading",
    value: function hideFormLoading($form) {
      var $submitButton = $form.find(':submit');
      $submitButton.prop('disabled', false).removeClass('loading');
      if ($submitButton.data('original-text')) {
        $submitButton.val($submitButton.data('original-text'));
      }
    }

    /**
     * Initialize form change tracking for each tab's form (orchestrator).
     */
  }, {
    key: "initFormChangeTracking",
    value: function initFormChangeTracking() {
      var self = this;
      this.$('.tab-content').each(function () {
        var tabId = self.$(this).attr('id');
        if (self.formChangeTrackers) {
          self.formChangeTrackers[tabId] = false;
        }
        self.$("#".concat(tabId, " :input")).on('change input', function () {
          if (self.formChangeTrackers) {
            self.formChangeTrackers[tabId] = true;
          }
          if (tabId === self.currentTab) {
            self.formChanged = true;
          }
        });
      });
    }

    /**
     * Initialize form validation for orchestrator-managed forms.
     */
  }, {
    key: "initializeValidation",
    value: function initializeValidation() {
      var _this4 = this;
      this.$('.product-estimator-form').each(function (i, form) {
        var $form = _this4.$(form);
        // Apply only if not a module-specific form that handles its own validation
        if (!$form.data('module-managed-validation')) {
          $form.find('input[type="email"]').on('change', function (e) {
            var $input = _this4.$(e.currentTarget);
            if ($input.val() && !_utils__WEBPACK_IMPORTED_MODULE_3__.validation.validateEmail($input.val())) {
              _this4.showFieldError($input, window.productEstimatorSettings.i18n.invalidEmail || 'Invalid email address');
            } else {
              _this4.clearFieldError($input);
            }
          });
          $form.find('input[type="number"]').on('change', function (e) {
            var $input = _this4.$(e.currentTarget);
            var value = parseInt($input.val(), 10);
            var min = parseInt($input.attr('min') || 0, 10);
            var max = parseInt($input.attr('max') || 9999, 10);
            var i18nSettings = window.productEstimatorSettings && window.productEstimatorSettings.i18n;
            if (isNaN(value) || value < min || value > max) {
              var message = i18nSettings && i18nSettings.numberRange ? i18nSettings.numberRange.replace('%min%', min).replace('%max%', max) : "Value must be between ".concat(min, " and ").concat(max);
              _this4.showFieldError($input, message);
            } else {
              _this4.clearFieldError($input);
            }
          });
        }
      });
    }

    /**
     * Get the active tab from URL.
     * @returns {string|null} The active tab or null.
     */
  }, {
    key: "getTabFromUrl",
    value: function getTabFromUrl() {
      var urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('tab');
    }

    /**
     * Handle tab click for orchestrator.
     * @param {Event} e - Click event.
     */
  }, {
    key: "handleTabClick",
    value: function handleTabClick(e) {
      e.preventDefault();
      var newTab = this.$(e.currentTarget).data('tab');
      var i18nSettings = window.productEstimatorSettings && window.productEstimatorSettings.i18n;
      if (this.formChanged) {
        if (!confirm(i18nSettings.unsavedChanges || 'You have unsaved changes. Are you sure?')) {
          return;
        }
      }
      this.switchTab(newTab);
    }

    /**
     * Switch to a different tab (orchestrator).
     * @param {string} tabId - The tab to switch to.
     */
  }, {
    key: "switchTab",
    value: function switchTab(tabId) {
      var url = new URL(window.location.href);
      url.searchParams.set('tab', tabId);
      window.history.pushState({}, '', url.toString());
      this.$('.nav-tab').removeClass('nav-tab-active');
      this.$(".nav-tab[data-tab=\"".concat(tabId, "\"]")).addClass('nav-tab-active');
      this.$('.tab-content').hide();
      this.$("#".concat(tabId)).show();
      var previousTab = this.currentTab;
      this.currentTab = tabId;
      this.formChanged = this.formChangeTrackers && this.formChangeTrackers[tabId] || false;
      this.$(document).trigger('product_estimator_tab_changed', [tabId, previousTab]);
    }

    /**
     * Handle beforeunload event to warn about unsaved changes (orchestrator).
     * @param {Event} e - BeforeUnload event.
     * @returns {string|undefined} Warning message if there are unsaved changes, undefined otherwise
     */
  }, {
    key: "handleBeforeUnload",
    value: function handleBeforeUnload(e) {
      var hasChanges = false;
      if (this.formChangeTrackers) {
        for (var tabId in this.formChangeTrackers) {
          if (this.formChangeTrackers[tabId]) {
            hasChanges = true;
            break;
          }
        }
      }
      if (hasChanges) {
        var i18nSettings = window.productEstimatorSettings && window.productEstimatorSettings.i18n;
        var message = i18nSettings.unsavedChanges || 'You have unsaved changes. Are you sure?';
        e.returnValue = message;
        return message;
      }
    }

    /**
     * Utility method to clear 'sub_tab' from the URL.
     * Can be called by derived modules.
     */
  }, {
    key: "clearSubTabFromUrl",
    value: function clearSubTabFromUrl() {
      var url = new URL(window.location.href);
      if (url.searchParams.has('sub_tab')) {
        url.searchParams["delete"]('sub_tab');
        window.history.replaceState({}, '', url.toString());
      }
    }

    /**
     * Public method to show field error. Uses the 'validation' utility.
     * @param {jQuery|HTMLElement} field - The field with an error.
     * @param {string} message - The error message.
     */
  }, {
    key: "showFieldError",
    value: function showFieldError(field, message) {
      _utils__WEBPACK_IMPORTED_MODULE_3__.validation.showFieldError(this.$(field), message);
    }

    /**
     * Public method to clear field error. Uses the 'validation' utility.
     * @param {jQuery|HTMLElement} field - The field to clear error for.
     */
  }, {
    key: "clearFieldError",
    value: function clearFieldError(field) {
      _utils__WEBPACK_IMPORTED_MODULE_3__.validation.clearFieldError(this.$(field));
    }

    /**
     * Public method to show notice. Uses the 'validation' utility.
     * @param {string} message - The message to show.
     * @param {string} [type] - Notice type ('success' or 'error').
     */
  }, {
    key: "showNotice",
    value: function showNotice(message) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'success';
      _utils__WEBPACK_IMPORTED_MODULE_3__.validation.showNotice(message, type);
    }

    /**
     * Initialize a Select2 dropdown with standardized configuration
     * @param {jQuery} $element - jQuery element to initialize Select2 on
     * @param {string} placeholderText - Placeholder text to display
     * @param {object} config - Additional configuration options for Select2
     * @returns {jQuery|null} The initialized element or null if initialization failed
     */
  }, {
    key: "initSelect2",
    value: function initSelect2($element, placeholderText) {
      var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      if (!$element || !$element.length) {
        return null;
      }
      if (!this.$ || !this.$.fn.select2) {
        return null;
      }

      // Default configuration options
      var defaultConfig = {
        placeholder: placeholderText || 'Select an option',
        width: 'resolve',
        // 'style' or '100%' might be better depending on CSS
        allowClear: true,
        dropdownCssClass: 'product-estimator-dropdown' // Custom class for styling
      };

      // Merge with custom config, with custom taking precedence
      var mergedConfig = _objectSpread(_objectSpread({}, defaultConfig), config);
      try {
        $element.select2(mergedConfig);

        // Option to clear initial selection
        if (config.clearInitial) {
          $element.val(null).trigger('change');
        }
        return $element;
      } catch (error) {
        return null;
      }
    }

    /**
     * Create a template renderer function for Select2 dropdown options
     * that applies a hover-like style to selected items
     * @returns {Function} Template renderer function for Select2
     */
  }, {
    key: "createSelect2TemplateRenderer",
    value: function createSelect2TemplateRenderer() {
      var _this5 = this;
      return function (data) {
        // Skip custom formatting for the search field
        if (data.loading || !data.id) {
          return data.text;
        }

        // Determine if this option is selected in the dropdown
        // This works for both single and multiple select
        if (data.element && data.element.selected) {
          return _this5.$("<span style=\"color: #fff; background-color: #2271b1; padding: 3px 6px; border-radius: 3px; display: block;\">".concat(data.text, "</span>"));
        }
        return data.text;
      };
    }

    /**
     * Initializes multiple Select2 dropdowns in batch
     * @param {object} options - Configuration options
     * @param {Array} options.elements - Array of elements to initialize
     * @param {object} options.i18n - Internationalization strings (defaults to this.settings.i18n)
     * @param {string} options.moduleName - Module name for logging (defaults to this.settings.tab_id)
     * @param {number} options.delay - Delay in ms before initialization (defaults to 100)
     * @returns {void}
     */
  }, {
    key: "initializeSelect2Dropdowns",
    value: function initializeSelect2Dropdowns(options) {
      var _this6 = this;
      var _options$elements = options.elements,
        elements = _options$elements === void 0 ? [] : _options$elements,
        _options$i18n = options.i18n,
        i18n = _options$i18n === void 0 ? this.settings.i18n || {} : _options$i18n,
        _options$moduleName = options.moduleName,
        moduleName = _options$moduleName === void 0 ? this.settings.tab_id || 'Module' : _options$moduleName,
        _options$delay = options.delay,
        delay = _options$delay === void 0 ? 100 : _options$delay;
      if (!this.$ || !this.$.fn.select2) {
        var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.createLogger)(moduleName);
        logger.warn("Select2 not available for ".concat(moduleName));
        return;
      }

      // Use setTimeout to ensure elements are fully rendered
      setTimeout(function () {
        elements.forEach(function (el) {
          if (!el || !el.element) {
            return;
          }
          var placeholder = i18n[el.placeholderKey] || el.fallbackText || "Select ".concat(el.name);

          // Apply consistent styling for selected items in dropdown
          var config = el.config || {};
          if (!config.templateResult) {
            config.templateResult = _this6.createSelect2TemplateRenderer();
          }
          _this6.initSelect2(el.element, placeholder, config);
        });
      }, delay);
    }

    /**
     * Destroy and re-initialize Select2 components (useful when elements were hidden)
     * @param {jQuery} $element - Select2 element to refresh
     * @param {object} config - Configuration to apply when re-initializing
     * @returns {jQuery|null} The refreshed element or null if refresh failed
     */
  }, {
    key: "refreshSelect2",
    value: function refreshSelect2($element) {
      var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (!$element || !$element.length) {
        return null;
      }
      try {
        // Get current placeholder if not provided
        var placeholder = config.placeholder || $element.data('placeholder') || '';

        // Destroy and re-initialize
        $element.select2('destroy');
        return this.initSelect2($element, placeholder, config);
      } catch (error) {
        return null;
      }
    }
  }]);
}(); // Initialize the main orchestrator immediately
// This ensures ProductEstimatorSettings is available globally if needed by modules
// before they might be instantiated.
if (!window.ProductEstimatorSettingsInstance) {
  // Ensure single instance of orchestrator
  window.ProductEstimatorSettingsInstance = new ProductEstimatorSettings();
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProductEstimatorSettings);

/***/ }),

/***/ "./src/js/admin/common/VerticalTabbedModule.js":
/*!*****************************************************!*\
  !*** ./src/js/admin/common/VerticalTabbedModule.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/* harmony import */ var _ProductEstimatorSettings__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./ProductEstimatorSettings */ "./src/js/admin/common/ProductEstimatorSettings.js");






function _callSuper(t, o, e) { return o = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(o), (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__["default"])(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
/**
 * VerticalTabbedModule.js
 *
 * Base class for settings modules that use a vertical tabbed interface.
 * Handles common vertical tab navigation, AJAX form submission, and state management.
 * Extends ProductEstimatorSettings.
 */
 // Import ajax utility and logger creator

 // Adjust path if ProductEstimatorSettings is in a different directory

// Module-specific logger. Can be this.logger if preferred and initialized in constructor.
var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_6__.createLogger)('VerticalTabbedModule');
var VerticalTabbedModule = /*#__PURE__*/function (_ProductEstimatorSett) {
  /**
   * Constructor for the VerticalTabbedModule.
   * @param {object} config - Configuration object for the module.
   * @param {string} config.mainTabId - The ID of the main horizontal tab for this module (e.g., 'labels', 'notifications'). This is passed as defaultTabId to ProductEstimatorSettings.
   * @param {string} config.defaultSubTabId - The default vertical sub-tab to show if none is specified.
   * @param {string} config.ajaxActionPrefix - The prefix for AJAX save actions (e.g., 'save_labels' for 'save_labels_settings').
   * @param {string} config.localizedDataName - The name of the global object holding localized data for this module (e.g., 'labelSettingsData'). This is passed as settingsObjectName to ProductEstimatorSettings.
   */
  function VerticalTabbedModule(config) {
    var _this;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__["default"])(this, VerticalTabbedModule);
    // Call the parent constructor (ProductEstimatorSettings)
    // map mainTabId to defaultTabId for ProductEstimatorSettings' module mode
    // map localizedDataName to settingsObjectName
    _this = _callSuper(this, VerticalTabbedModule, [{
      isModule: true,
      settingsObjectName: config.localizedDataName,
      defaultTabId: config.mainTabId
    }]);
    _this.config = config; // <<<< ADD THIS LINE

    // Store VTM-specific configuration.
    // this.settings is populated by the super() call with ajaxUrl, nonce, i18n, tab_id (which is mainTabId)
    _this.vtmConfig = {
      defaultSubTabId: config.defaultSubTabId,
      ajaxActionPrefix: config.ajaxActionPrefix
      // mainTabId and localizedDataName are available via this.settings.tab_id and this.settingsObjectName respectively
    };
    _this.$container = null; // Will be jQuery object for `#mainTabId`

    // Validate VTM-specific config parts that are not covered by super's implicit validation via settingsObjectName/defaultTabId
    if (!_this.vtmConfig.defaultSubTabId || !_this.vtmConfig.ajaxActionPrefix) {
      // The super constructor would have already run, but this module might not function correctly.
      // No explicit return here as super() doesn't allow return before it.
      // The moduleInit will likely fail or not run as expected if $container isn't found or if these configs are vital early.
    }

    // Note: jQuery(document).ready() and calling moduleInit() is handled by the ProductEstimatorSettings base class.
    // this.settings (formerly this.localizedData) is initialized by super().
    // Fallbacks for nonce and ajax_url within this.settings are handled by ProductEstimatorSettings.
    // The specific VTM fallback from window.productEstimatorSettings for nonce/ajax_url might need review
    // if the base class's fallback (from ajaxurl global or direct properties) isn't sufficient.
    // For now, assume base class handles it.
    return _this;
  }

  /**
   * Module-specific initialization, called by ProductEstimatorSettings on document.ready.
   * Overridden from ProductEstimatorSettings.
   */
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__["default"])(VerticalTabbedModule, _ProductEstimatorSett);
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__["default"])(VerticalTabbedModule, [{
    key: "moduleInit",
    value: function moduleInit() {
      var _this2 = this;
      // this.settings.tab_id is the mainTabId for this VTM instance
      this.$container = this.$("#".concat(this.settings.tab_id));
      if (!this.$container.length) {
        // Optionally show a global notice if ProductEstimatorSettings instance is available
        if (window.ProductEstimatorSettingsInstance) {
          window.ProductEstimatorSettingsInstance.showNotice("Error: UI container for '".concat(this.settings.tab_id, "' settings not found. Some features might be unavailable."), 'error');
        }
        return; // Halt initialization if container is missing
      }
      this.bindCommonVTMEvents(); // Renamed from bindCommonEvents to avoid clash if base has it
      this.bindModuleSpecificEvents(); // Hook for child classes (e.g., AdminTableManager)

      // If this module's main tab is the currently active main tab in the UI
      // Access currentTab from the global orchestrator instance if available
      var orchestrator = window.ProductEstimatorSettingsInstance;
      if (orchestrator && orchestrator.currentTab === this.settings.tab_id) {
        // Use a small timeout to ensure the DOM is fully settled, especially if tab content was just shown
        setTimeout(function () {
          _this2.setupVerticalTabs();
          _this2.onMainTabActivated(); // Hook for child classes
        }, 100);
      }
    }

    /**
     * Binds event handlers common to VerticalTabbedModules.
     */
  }, {
    key: "bindCommonVTMEvents",
    value: function bindCommonVTMEvents() {
      // Listen for global main tab changes (handled by ProductEstimatorSettings orchestrator)
      // This event is triggered by the orchestrator.
      this.$(document).on('product_estimator_tab_changed', this.handleMainTabChanged.bind(this));

      // Form submission for forms within this module that are specifically for VTM handling
      // These forms should have class 'pe-vtabs-tab-form'
      this.$container.on('submit.vtm', 'form.pe-vtabs-tab-form', this.handleVTMFormSubmit.bind(this));

      // Click handling for vertical tab navigation links - use selectors from PHP's get_common_script_data
      // ENHANCEMENT: Use a very broad selector that will catch all possible tab links
      var navSelector = this.settings.selectors.verticalTabNav || '.pe-vtabs-nav-list, .vertical-tabs-nav';

      // Use a more robust selector that will catch any links in the nav area
      this.$container.on('click.vtm', "".concat(navSelector, " a, .pe-vtabs-nav-item a, .tab-item a"), this.handleVerticalTabClick.bind(this));

      // Fix data attributes on tab links during binding phase
      this.setTabAttributesOnLinks();
    }

    /**
     * Sets data-tab attributes on any tab links that are missing them.
     * This ensures all links have consistent data attributes.
     */
  }, {
    key: "setTabAttributesOnLinks",
    value: function setTabAttributesOnLinks() {
      var _this3 = this;
      // Find all potential tab links
      var navSelector = this.settings.selectors.verticalTabNav || '.pe-vtabs-nav-list, .vertical-tabs-nav';
      var $navLinks = this.$container.find("".concat(navSelector, " a"));

      // For each link, ensure it has the proper data-tab attribute based on the URL
      $navLinks.each(function (i, link) {
        var $link = _this3.$(link);
        var href = $link.attr('href') || '';

        // If no data-tab attribute but the href has sub_tab parameter
        if (!$link.attr('data-tab') && href.includes('sub_tab=')) {
          var match = href.match(/[?&]sub_tab=([^&#]*)/i);
          if (match && match[1]) {
            var subTabId = decodeURIComponent(match[1].replace(/\+/g, ' '));
            $link.attr('data-tab', subTabId);
          }
        }
      });
    }

    /**
     * Placeholder for module-specific event bindings. Override in child classes.
     * Child classes should implement this method to bind their own specific events.
     * For example, AdminTableManager uses this to bind table/form events.
     * This method is called during initialization after common events are bound.
     * @returns {void}
     */
  }, {
    key: "bindModuleSpecificEvents",
    value: function bindModuleSpecificEvents() {
      // Child classes like AdminTableManager will override this to bind their own specific events.
    }

    /**
     * Called when this module's main horizontal tab becomes active.
     * Child classes should override this method to implement specific activation logic.
     * This is the ideal place to refresh or initialize components that need to be
     * visible when the tab is shown.
     * @returns {void}
     */
  }, {
    key: "onMainTabActivated",
    value: function onMainTabActivated() {
      // Child classes can implement specific logic here.
    }

    /**
     * Called when this module's main horizontal tab becomes inactive.
     * Child classes should override this method to implement specific deactivation logic.
     * This is the ideal place to clean up resources or pause processes when the tab
     * is no longer visible.
     * @returns {void}
     */
  }, {
    key: "onMainTabDeactivated",
    value: function onMainTabDeactivated() {
      // Child classes can implement specific logic here.
    }
  }, {
    key: "setupVerticalTabs",
    value: function setupVerticalTabs() {
      if (!this.$container || !this.$container.length) {
        return;
      }

      // Use selectors from settings that are provided by PHP via get_common_script_data
      var navSelector = this.settings.selectors.verticalTabNav || '.pe-vtabs-nav-list, .vertical-tabs-nav';
      var contentSelector = this.settings.selectors.verticalTabPane || '.pe-vtabs-tab-panel, .vertical-tab-content';
      var $verticalTabsNav = this.$container.find(navSelector);
      var $verticalTabContents = this.$container.find(contentSelector);
      if (!$verticalTabsNav.length || !$verticalTabContents.length) {
        return;
      }

      // Make sure all tab links have data-tab attributes
      // This ensures data attributes are added right before tab initialization
      this.setTabAttributesOnLinks();
      var activeSubTabId = this.vtmConfig.defaultSubTabId;
      var urlParams = new URLSearchParams(window.location.search);
      var urlSubTab = urlParams.get('sub_tab');
      if (urlSubTab && $verticalTabsNav.find("a[data-tab=\"".concat(urlSubTab, "\"]")).length) {
        activeSubTabId = urlSubTab;
      } else {
        var $phpActiveLink = $verticalTabsNav.find('.pe-vtabs-nav-item.active a, .tab-item.active a');
        if ($phpActiveLink.length) {
          activeSubTabId = $phpActiveLink.data('tab');
        }
      }
      if (!$verticalTabsNav.find("a[data-tab=\"".concat(activeSubTabId, "\"]")).length) {
        var $firstTabLink = $verticalTabsNav.find('a[data-tab]').first();
        if ($firstTabLink.length) {
          activeSubTabId = $firstTabLink.data('tab');
        } else {
          return;
        }
      }
      this.showVerticalTab(activeSubTabId, false); // false to prevent history update on initial load

      this.adjustTabContentHeight();
      // Ensure resize event is namespaced to this module instance to avoid conflicts
      this.$(window).off("resize.vtm.".concat(this.settings.tab_id)).on("resize.vtm.".concat(this.settings.tab_id), this.adjustTabContentHeight.bind(this));
    }
  }, {
    key: "handleVerticalTabClick",
    value: function handleVerticalTabClick(e) {
      e.preventDefault();
      var $targetLink = this.$(e.currentTarget);

      // Multiple ways to get the subTabId, with fallbacks
      var subTabId = null;
      var element = $targetLink[0];

      // Direct DOM attribute access - most reliable for elements with data-* attributes
      var domTabAttr = element ? element.getAttribute('data-tab') : null;
      if (domTabAttr) {
        subTabId = domTabAttr;
      }
      // Check if there's a data-tabid attribute
      else if (element && element.hasAttribute('data-tabid')) {
        subTabId = element.getAttribute('data-tabid');
      }

      // If we have a subTabId from any of the data-* attributes
      if (subTabId) {
        this.showVerticalTab(subTabId, true); // true to update history
        return;
      }

      // No data-* attributes found, try the URL as last resort
      // THIS IS THE MOST IMPORTANT FALLBACK - we prioritize this approach for more reliability
      var href = $targetLink.attr('href');

      // Direct regex extraction for sub_tab parameter - most reliable method
      // This works even when URL is relative or malformed
      if (href) {
        var subTabMatch = href.match(/[?&]sub_tab=([^&#]*)/i);
        if (subTabMatch && subTabMatch[1]) {
          var subTabFromRegex = decodeURIComponent(subTabMatch[1].replace(/\+/g, ' '));
          this.showVerticalTab(subTabFromRegex, true);

          // Fix the data-tab attribute for future clicks
          $targetLink.attr('data-tab', subTabFromRegex);
          return;
        }

        // As a backup, try standard URL parsing
        if (href.includes('sub_tab=')) {
          try {
            var hrefUrl = new URL(href, window.location.origin);
            var subTabFromHref = hrefUrl.searchParams.get('sub_tab');
            if (subTabFromHref) {
              this.showVerticalTab(subTabFromHref, true);
              // Fix the data-tab attribute to prevent future issues
              $targetLink.attr('data-tab', subTabFromHref);
              return;
            }
          } catch (e) {
            // If URL parsing fails, try a more direct approach with URLSearchParams
            try {
              var queryString = href.split('?')[1];
              if (queryString) {
                var _subTabFromHref = new URLSearchParams(queryString).get('sub_tab');
                if (_subTabFromHref) {
                  this.showVerticalTab(_subTabFromHref, true);
                  // Fix the data-tab attribute to prevent future issues
                  $targetLink.attr('data-tab', _subTabFromHref);
                  return;
                }
              }
            } catch (e2) {
              logger.error('Error parsing URL or query string:', e2);
            }
          }
        }
      }
    }
  }, {
    key: "adjustTabContentHeight",
    value: function adjustTabContentHeight() {
      if (!this.$container || !this.$container.length) return;

      // Use provided selectors with fallbacks
      var navAreaSelector = this.settings.selectors.verticalTabNavArea || '.pe-vtabs-nav-area, .vertical-tabs';
      var contentAreaSelector = this.settings.selectors.verticalTabContentArea || '.pe-vtabs-content-area, .vertical-tabs-content';
      var $nav = this.$container.find(navAreaSelector);
      var $contentWrapper = this.$container.find(contentAreaSelector);
      if ($nav.length && $contentWrapper.length) {
        var navHeight = $nav.outerHeight();
        if (navHeight) {
          // Ensure navHeight is a valid number
          $contentWrapper.css('min-height', navHeight + 'px');
        }
      }
    }
  }, {
    key: "showVerticalTab",
    value: function showVerticalTab(subTabId) {
      var _this4 = this;
      var updateHistory = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      if (!this.$container || !this.settings.tab_id || !subTabId) {
        var _this$$container;
        logger.warn('VerticalTabbedModule: Cannot show vertical tab due to missing container, mainTabId, or subTabId.', {
          containerExists: !!((_this$$container = this.$container) !== null && _this$$container !== void 0 && _this$$container.length),
          mainTabId: this.settings.tab_id,
          subTabId: subTabId
        });
        return;
      }

      // Use shared selectors from settings with fallbacks
      var navSelector = this.settings.selectors.verticalTabNav || '.pe-vtabs-nav-list, .vertical-tabs-nav';
      var contentSelector = this.settings.selectors.verticalTabPane || '.pe-vtabs-tab-panel, .vertical-tab-content';
      var navItemSelector = this.settings.selectors.verticalTabNavItem || '.pe-vtabs-nav-item, .tab-item';
      var $verticalTabsNav = this.$container.find(navSelector);
      var $verticalTabContents = this.$container.find(contentSelector);

      // Remove active class from all nav items
      $verticalTabsNav.find(navItemSelector).removeClass('active');

      // Find the tab link directly using data attribute
      var $activeLink = $verticalTabsNav.find("a[data-tab=\"".concat(subTabId, "\"]"));

      // If not found, try other ways to find the link
      if (!$activeLink.length) {
        // Look for links with matching href containing the tab ID
        $activeLink = $verticalTabsNav.find("a[href*=\"sub_tab=".concat(subTabId, "\"]"));

        // If still not found, try more aggressive matching
        if (!$activeLink.length) {
          $verticalTabsNav.find('a').each(function (i, link) {
            var $link = _this4.$(link);
            var href = $link.attr('href') || '';

            // If this link's href contains our tab ID
            if (href.includes(subTabId)) {
              $activeLink = $link;
              // Set the data-tab attribute to fix future lookups
              $link.attr('data-tab', subTabId);
            }
          });
        }
      }

      // Now add active class to the parent li of the found link
      if ($activeLink.length) {
        $activeLink.closest(navItemSelector).addClass('active');
      } else {
        // No active link found - this is OK if this is the initial load
        // and we'll select the default tab
      }

      // Hide and deactivate all tab content panels
      $verticalTabContents.hide().removeClass('active');

      // Find and activate the selected content panel
      // First try exact ID match
      var sanitizedTabId = subTabId.replace(/[^a-zA-Z0-9-_]/g, '');
      var $activeContentPanel = this.$container.find("#".concat(sanitizedTabId));

      // If not found, try more flexible selectors
      if (!$activeContentPanel.length) {
        // Try panel with a class that contains the tab ID
        $activeContentPanel = this.$container.find(".pe-vtabs-tab-panel-".concat(sanitizedTabId, ", [data-tab-id=\"").concat(sanitizedTabId, "\"], [data-tab-content=\"").concat(sanitizedTabId, "\"]"));
      }

      // If still not found, try searching for a panel that contains the tab ID in class or id
      if (!$activeContentPanel.length) {
        $activeContentPanel = this.$container.find("[id*=\"".concat(sanitizedTabId, "\"], [class*=\"").concat(sanitizedTabId, "\"]")).filter('.pe-vtabs-tab-panel, .vertical-tab-content');
      }
      if ($activeContentPanel.length) {
        $activeContentPanel.show().addClass('active');
      } else {
        // No matching content panel found with direct ID - try partial matches

        // Last resort: try to find a panel with a similar ID/class
        var partialMatches = [];
        var contentPanels = this.$container.find(contentSelector);
        contentPanels.each(function (i, panel) {
          var $panel = _this4.$(panel);
          var panelId = $panel.attr('id') || '';
          var panelClass = $panel.attr('class') || '';

          // Check if panel ID or class contains parts of the tab ID
          if (panelId.includes(sanitizedTabId.substring(0, 5)) || panelClass.includes(sanitizedTabId.substring(0, 5))) {
            partialMatches.push($panel);
          }
        });
        if (partialMatches.length === 1) {
          // If we have exactly one partial match, use it
          partialMatches[0].show().addClass('active');
        } else if (partialMatches.length > 1) {
          partialMatches[0].show().addClass('active');
        }
      }
      if (updateHistory) {
        var currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('page', currentUrl.searchParams.get('page') || 'product-estimator-settings'); // Ensure page param is present
        currentUrl.searchParams.set('tab', this.settings.tab_id); // main horizontal tab
        currentUrl.searchParams.set('sub_tab', subTabId); // vertical sub-tab
        window.history.pushState({
          mainTabId: this.settings.tab_id,
          subTabId: subTabId
        }, '', currentUrl.toString());
      }
      // Trigger a sub-tab changed event, namespaced by the main tab ID
      this.$(document).trigger("pe_sub_tab_changed_".concat(this.settings.tab_id), [subTabId]);
    }

    /**
     * Handles the main horizontal tab change event.
     * @param {Event} e - The event object.
     * @param {string} newMainTabId - The ID of the newly activated main horizontal tab.
     * @param {string} oldMainTabId - The ID of the previously active main horizontal tab.
     */
  }, {
    key: "handleMainTabChanged",
    value: function handleMainTabChanged(e, newMainTabId, oldMainTabId) {
      var _this5 = this;
      if (newMainTabId === this.settings.tab_id) {
        // If this VTM's main tab is now active
        // Ensure $container is valid, especially if moduleInit was deferred or failed partially
        if (!this.$container || !this.$container.length) {
          this.$container = this.$("#".concat(this.settings.tab_id));
        }
        if (this.$container.length) {
          setTimeout(function () {
            // Use setTimeout to ensure tab content is fully visible and DOM settled
            _this5.setupVerticalTabs(); // Re-initialize or ensure vertical tabs are correctly set up
            _this5.onMainTabActivated(); // Call hook for child classes
          }, 100);
        } else {
          // Container not found, log a warning
          this.logger.warn("VerticalTabbedModule: Container for tab '".concat(this.settings.tab_id, "' not found when activating main tab"));
        }
      } else if (oldMainTabId === this.settings.tab_id) {
        // If this VTM's main tab was deactivated
        this.onMainTabDeactivated(); // Call hook for child classes
      }
    }

    /**
     * Handles AJAX form submission for forms within vertical tabs.
     * These forms should have the class 'pe-vtabs-tab-form' and a 'data-sub-tab-id' attribute.
     * @param {Event} e - Submit event.
     */
  }, {
    key: "handleVTMFormSubmit",
    value: function handleVTMFormSubmit(e) {
      var _this6 = this;
      var $form = this.$(e.currentTarget);
      e.preventDefault();
      var $submitButton = $form.find('.save-settings, button[type="submit"], input[type="submit"]');
      var $spinner = $form.find('.spinner').first(); // Common spinner class

      // Save TinyMCE editors if any
      if (typeof tinyMCE !== 'undefined') {
        $form.find('.wp-editor-area').each(function (idx, editorArea) {
          var editor = tinyMCE.get(_this6.$(editorArea).attr('id'));
          if (editor) {
            editor.save();
          }
        });
      }
      var formDataStr = $form.serialize();
      var subTabId = $form.attr('data-sub-tab-id');
      if (!subTabId || String(subTabId).trim() === '') {
        this.showNotice('Error: Could not save settings. Form configuration is missing "data-sub-tab-id".', 'error');
        return;
      }

      // Special handling for multi-select elements using Select2
      $form.find('select[multiple]').each(function (idx, select) {
        var $select = _this6.$(select);
        var name = $select.attr('name');

        // If this is a multi-select that uses Select2
        if (name && $select.hasClass('pe-select2')) {
          var values = $select.val();

          // Remove any existing serialized versions of this field
          var regex = new RegExp("".concat(encodeURIComponent(name), "=[^&]*&?"), 'g');
          formDataStr = formDataStr.replace(regex, '');

          // Add each selected value individually with array notation
          if (values && values.length) {
            values.forEach(function (value) {
              formDataStr += "&".concat(encodeURIComponent(name), "[]=").concat(encodeURIComponent(value));
            });
          } else {
            // Ensure empty array is sent if nothing selected
            formDataStr += "&".concat(encodeURIComponent(name), "[]=");
          }
        }
      });

      // Handle unchecked checkboxes
      $form.find('input[type="checkbox"]').each(function (idx, cb) {
        var $cb = _this6.$(cb);
        var name = $cb.attr('name');
        if (name && !$cb.is(':checked')) {
          var paramExistsRegex = new RegExp("(^|&)".concat(encodeURIComponent(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "="));
          if (!paramExistsRegex.test(formDataStr)) {
            formDataStr += "&".concat(encodeURIComponent(name), "=0");
          }
        }
      });
      formDataStr = formDataStr.replace(/^&+/, '').replace(/&&+/g, '&');
      $submitButton.prop('disabled', true);
      $spinner.addClass('is-active');
      var ajaxAction = "".concat(this.vtmConfig.ajaxActionPrefix, "_settings"); // Uses VTM specific prefix
      var ajaxDataPayload = {
        action: ajaxAction,
        nonce: this.settings.nonce,
        // Nonce from base class settings
        form_data: formDataStr,
        sub_tab_id: subTabId.trim(),
        // Essential for PHP to know which sub-tab's settings to save
        main_tab_id: this.settings.tab_id // Pass main tab ID for context if needed by backend
      };
      _utils__WEBPACK_IMPORTED_MODULE_6__.ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        // ajaxUrl from base class settings
        type: 'POST',
        data: ajaxDataPayload
      }).then(function (response) {
        var successMsg = response && response.message || _this6.settings.i18n && _this6.settings.i18n.saveSuccess || 'Settings saved successfully.';
        _this6.showNotice(successMsg, 'success'); // Inherited from ProductEstimatorSettings

        // Reset form change tracking on the main orchestrator if it exists
        var orchestrator = window.ProductEstimatorSettingsInstance;
        if (orchestrator && (0,_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__["default"])(orchestrator.formChangeTrackers) === 'object') {
          orchestrator.formChangeTrackers[_this6.settings.tab_id] = false;
          if (orchestrator.currentTab === _this6.settings.tab_id) {
            orchestrator.formChanged = false;
          }
        }
      })["catch"](function (error) {
        var errorMsg = error && error.message ? error.message : _this6.settings.i18n && _this6.settings.i18n.saveError || 'Error saving settings.';
        _this6.showNotice(errorMsg, 'error'); // Inherited from ProductEstimatorSettings
      })["finally"](function () {
        $submitButton.prop('disabled', false);
        $spinner.removeClass('is-active');
      });
    }

    // showNotice, showFieldError, clearFieldError are inherited from ProductEstimatorSettings.
    // No need to redefine them here.
  }]);
}(_ProductEstimatorSettings__WEBPACK_IMPORTED_MODULE_7__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (VerticalTabbedModule);

/***/ }),

/***/ "./src/js/admin/index.js":
/*!*******************************!*\
  !*** ./src/js/admin/index.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ProductEstimatorAdmin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ProductEstimatorAdmin */ "./src/js/admin/ProductEstimatorAdmin.js");
/* harmony import */ var _common_ProductEstimatorSettings__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./common/ProductEstimatorSettings */ "./src/js/admin/common/ProductEstimatorSettings.js");
/* harmony import */ var _modules_GeneralSettingsModule__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./modules/GeneralSettingsModule */ "./src/js/admin/modules/GeneralSettingsModule.js");
/* harmony import */ var _modules_NetsuiteSettingsModule__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./modules/NetsuiteSettingsModule */ "./src/js/admin/modules/NetsuiteSettingsModule.js");
/* harmony import */ var _modules_NotificationSettingsModule__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./modules/NotificationSettingsModule */ "./src/js/admin/modules/NotificationSettingsModule.js");
/* harmony import */ var _modules_ProductAdditionsSettingsModule__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./modules/ProductAdditionsSettingsModule */ "./src/js/admin/modules/ProductAdditionsSettingsModule.js");
/* harmony import */ var _modules_LabelSettingsModule__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./modules/LabelSettingsModule */ "./src/js/admin/modules/LabelSettingsModule.js");
/* harmony import */ var _modules_HierarchicalLabelSettingsModule__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./modules/HierarchicalLabelSettingsModule */ "./src/js/admin/modules/HierarchicalLabelSettingsModule.js");
/* harmony import */ var _modules_FeatureSwitchesSettingsModule__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./modules/FeatureSwitchesSettingsModule */ "./src/js/admin/modules/FeatureSwitchesSettingsModule.js");
/* harmony import */ var _modules_PricingRulesSettingsModule__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./modules/PricingRulesSettingsModule */ "./src/js/admin/modules/PricingRulesSettingsModule.js");
/* harmony import */ var _modules_SimilarProductsSettingsModule__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./modules/SimilarProductsSettingsModule */ "./src/js/admin/modules/SimilarProductsSettingsModule.js");
/**
 * Main entry point for the Product Estimator plugin frontend
 */
// import './CustomerEstimatesAdmin';












// This is the main entry point for the frontend script bundle
// The admin modules are imported separately due to code splitting in webpack

// Frontend functionality can be added here

/***/ }),

/***/ "./src/js/admin/modules/FeatureSwitchesSettingsModule.js":
/*!***************************************************************!*\
  !*** ./src/js/admin/modules/FeatureSwitchesSettingsModule.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _common_ProductEstimatorSettings__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../common/ProductEstimatorSettings */ "./src/js/admin/common/ProductEstimatorSettings.js");





function _callSuper(t, o, e) { return o = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(o), (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__["default"])(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
/**
 * Feature Switches Settings JavaScript
 *
 * Handles functionality specific to the feature switches settings tab.
 */
 // Adjust path as needed
var FeatureSwitchesSettingsModule = /*#__PURE__*/function (_ProductEstimatorSett) {
  /**
   * Initialize the module
   */
  function FeatureSwitchesSettingsModule() {
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, FeatureSwitchesSettingsModule);
    return _callSuper(this, FeatureSwitchesSettingsModule, [{
      isModule: true,
      settingsObjectName: 'featureSwitchesSettings',
      defaultTabId: 'feature_switches'
      // loggerName: 'FeatureSwitchesSettingsModule' // Base class now uses constructor.name
    }]); // Properties like this.$ and this.settings are initialized by super()
  }

  /**
   * Module-specific initialization, called by the base class constructor on document.ready.
   */
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__["default"])(FeatureSwitchesSettingsModule, _ProductEstimatorSett);
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(FeatureSwitchesSettingsModule, [{
    key: "moduleInit",
    value: function moduleInit() {
      this.bindEvents();
      // Add any initial setup logic for feature switch fields here if needed
    }

    /**
     * Bind event handlers specific to this module
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      // Listen for tab changes to activate module logic when this tab is shown
      this.$(document).on('product_estimator_tab_changed', this.handleTabChanged.bind(this));

      // Add any specific event handlers for interactions within the Feature Switches tab
      // Example: this.$('#enable_example_feature').on('change', this.handleFeatureSwitchChange.bind(this));
    }

    /**
     * Handle tab changed event
     * @param {Event} e Tab changed event
     * @param {string} tabId The newly active tab ID
     */
  }, {
    key: "handleTabChanged",
    value: function handleTabChanged(e, tabId) {
      // If our tab becomes active, perform any necessary re-initialization or setup
      if (tabId === this.settings.tab_id) {
        // You can call setup functions here if needed when the tab becomes visible
        // this.setupFeatureSwitchFields();
      }
      this.clearSubTabFromUrl(); // Call common URL clearing logic from base
    }

    // Add other methods as needed for client-side functionality
    // Example:
    // setupFeatureSwitchFields() {
    //
    //   // Add logic to set initial states, attach event listeners, etc.
    // }
  }]);
}(_common_ProductEstimatorSettings__WEBPACK_IMPORTED_MODULE_5__["default"]); // Initialize the module when the DOM is ready.
// The base class constructor handles calling moduleInit at the right time.
jQuery(document).ready(function () {
  // Check if the tab's container element exists before initializing
  // This ensures the module is only instantiated if its corresponding UI is present.
  if (jQuery('#feature_switches').length) {
    // Make it available globally for debugging or if other scripts need to interact with it
    window.FeatureSwitchesSettingsModuleInstance = new FeatureSwitchesSettingsModule();
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (FeatureSwitchesSettingsModule);

/***/ }),

/***/ "./src/js/admin/modules/GeneralSettingsModule.js":
/*!*******************************************************!*\
  !*** ./src/js/admin/modules/GeneralSettingsModule.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/get */ "./node_modules/@babel/runtime/helpers/esm/get.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _utils_tinymce_preserver__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @utils/tinymce-preserver */ "./src/js/utils/tinymce-preserver.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/* harmony import */ var _common_VerticalTabbedModule__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../common/VerticalTabbedModule */ "./src/js/admin/common/VerticalTabbedModule.js");






function _callSuper(t, o, e) { return o = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(o), (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__["default"])(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _superPropGet(t, o, e, r) { var p = (0,_babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_4__["default"])((0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
/**
 * General Settings Module JavaScript
 *
 * Handles functionality specific to the general settings tab.
 * Extends VerticalTabbedModule for common vertical tab and form handling.
 */



var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_7__.createLogger)('GeneralSettingsModule');
var GeneralSettingsModule = /*#__PURE__*/function (_VerticalTabbedModule) {
  function GeneralSettingsModule() {
    var _this;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, GeneralSettingsModule);
    var config = {
      mainTabId: 'general',
      defaultSubTabId: 'settings',
      ajaxActionPrefix: 'save_general',
      localizedDataName: 'generalSettings'
    };
    _this = _callSuper(this, GeneralSettingsModule, [config]); // Calls AdminTableManager constructor

    // DOM elements cache
    _this.dom = {};
    _this.$(document).on("admin_table_manager_ready_".concat(_this.config.mainTabId), function () {
      _this.validateMarkup = _this.validateMarkup.bind(_this);
      _this.validateExpiryDays = _this.validateExpiryDays.bind(_this);
      _this.handleFileUpload = _this.handleFileUpload.bind(_this);
      _this.handleFileRemove = _this.handleFileRemove.bind(_this);
      _this.setupTinyMCEEditors = _this.setupTinyMCEEditors.bind(_this);
      _this.onSubTabActivated = _this.onSubTabActivated.bind(_this);
      _this.validateSelect2Field = _this.validateSelect2Field.bind(_this);
      _this._initializeSelect2 = _this._initializeSelect2.bind(_this);
      _this._cacheDOM = _this._cacheDOM.bind(_this);
    });
    // Bind methods that will be used as event handlers or callbacks
    return _this;
  }

  /**
   * Bind module-specific events beyond what the parent class handles
   */
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__["default"])(GeneralSettingsModule, _VerticalTabbedModule);
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(GeneralSettingsModule, [{
    key: "bindModuleSpecificEvents",
    value: function bindModuleSpecificEvents() {
      var _this2 = this;
      _superPropGet(GeneralSettingsModule, "bindModuleSpecificEvents", this, 3)([]);

      // Only bind events if container exists
      if (!this.$container || !this.$container.length) {
        return;
      }

      // Cache DOM elements
      this._cacheDOM();
      this.$('.select-file-button').on('click', this.handleFileUpload);
      this.$('.remove-file-button').on('click', this.handleFileRemove);

      // Add validation events
      this.$('#default_markup').on('change input', this.validateMarkup);
      this.$('#estimate_expiry_days').on('change input', this.validateExpiryDays);
      this.$('#pdf_template').on('change', this.validateFileInput.bind(this, 'pdf_template'));

      // Select2 field validation
      if (this.dom.primaryProductCategories) {
        this.dom.primaryProductCategories.on('change', function () {
          return _this2.validateSelect2Field('primary_product_categories');
        });
      }

      // Listen for sub-tab changes
      this.$(document).on("pe_sub_tab_changed_".concat(this.settings.tab_id), function (e, subTabId) {
        _this2.onSubTabActivated(subTabId);
      });

      // Initialize Select2 when ready
      this._initializeSelect2();
    }

    /**
     * Override for actions when the main "General" tab is activated.
     */
  }, {
    key: "onMainTabActivated",
    value: function onMainTabActivated() {
      _superPropGet(GeneralSettingsModule, "onMainTabActivated", this, 3)([]);

      // Setup the editors when the tab is activated
      var activeSubTabId = this.getActiveSubTabId();
      if (activeSubTabId) {
        this.setupTinyMCEEditors(activeSubTabId);

        // Reinitialize Select2 fields on the settings tab
        if (activeSubTabId === 'settings') {
          // Re-cache DOM elements since they might not have been available on initial load
          this._cacheDOM();
          // Refresh Select2 components if they're already initialized
          if (this.dom.primaryProductCategories && this.dom.primaryProductCategories.hasClass("select2-hidden-accessible")) {
            this.refreshSelect2(this.dom.primaryProductCategories);
          }
        }
      }
    }

    /**
     * Get the currently active sub-tab ID
     */
  }, {
    key: "getActiveSubTabId",
    value: function getActiveSubTabId() {
      if (!this.$container || !this.$container.length) {
        return this.vtmConfig.defaultSubTabId;
      }
      var activeTabContent = this.$container.find('.vertical-tab-content.active, .pe-vtabs-tab-panel.active');
      if (activeTabContent.length) {
        return activeTabContent.data('tab-id') || activeTabContent.attr('id');
      }

      // Try to get from URL
      var urlParams = new URLSearchParams(window.location.search);
      var urlSubTab = urlParams.get('sub_tab');
      if (urlSubTab) {
        return urlSubTab;
      }

      // Fallback to default
      return this.vtmConfig.defaultSubTabId;
    }

    /**
     * Called when sub-tab is changed - needs to setup TinyMCE and field validation
     * @param subTabId
     */
  }, {
    key: "onSubTabActivated",
    value: function onSubTabActivated(subTabId) {
      logger.log("Sub-tab activated: ".concat(subTabId));

      // Setup TinyMCE for the active tab
      this.setupTinyMCEEditors(subTabId);

      // Reinitialize Select2 fields if we're on the settings tab
      if (subTabId === 'settings') {
        // Re-cache DOM elements since they might not have been available on initial load
        this._cacheDOM();
        this._initializeSelect2();
      }
    }

    /**
     * Initialize TinyMCE editors for the given sub-tab
     * @param subTabId
     */
  }, {
    key: "setupTinyMCEEditors",
    value: function setupTinyMCEEditors(subTabId) {
      // Map sub-tab IDs to editor fields
      var editorFields = {
        'pdf-settings': ['pdf_footer_text', 'pdf_footer_contact_details_content']
        // Add other sub-tabs with their editor fields
      };

      // If this sub-tab has editors, initialize them
      if (editorFields[subTabId]) {
        logger.log("Setting up TinyMCE editors for ".concat(subTabId, ": ").concat(editorFields[subTabId].join(', ')));
        (0,_utils_tinymce_preserver__WEBPACK_IMPORTED_MODULE_6__.setupTinyMCEHTMLPreservation)(editorFields[subTabId], "#".concat(this.settings.mainTabId, " .vertical-tab-content[data-tab-id=\"").concat(subTabId, "\"]"));
      }
    }
  }, {
    key: "handleFileUpload",
    value: function handleFileUpload(e) {
      var _this3 = this;
      e.preventDefault();
      var button = this.$(e.currentTarget);
      var targetInputSelector = button.data('target-input'); // Use the data-target-input attribute
      var targetPreviewSelector = button.data('target-preview'); // Use the data-target-preview attribute

      if (this.mediaFrame) {
        this.mediaFrame.open();
        return;
      }
      this.mediaFrame = wp.media({
        title: 'Select or Upload PDF Template',
        button: {
          text: 'Use this file'
        },
        multiple: false,
        library: {
          type: 'application/pdf'
        } // Only allow PDF files
      });
      this.mediaFrame.on('select', function () {
        var attachment = _this3.mediaFrame.state().get('selection').first().toJSON();
        if (attachment && attachment.id) {
          // Use the target input selector from the data attribute
          if (targetInputSelector) {
            _this3.$(targetInputSelector).val(attachment.id).trigger('change');
          } else {
            logger.warn('No target input selector found for file upload');
          }
        } else {
          logger.warn('Invalid attachment selected from media library');
        }

        // Use the target preview selector from the data attribute
        var $previewWrapper = targetPreviewSelector ? _this3.$(targetPreviewSelector) : button.siblings('.file-preview-wrapper');

        // Create a simpler preview that matches the design in the second image
        var fileSize = _this3._formatFileSize(attachment.filesizeInBytes || 0);
        $previewWrapper.html("\n        <div class=\"file-preview\">\n          <span class=\"file-icon dashicons dashicons-pdf\"></span>\n          <div class=\"file-details\">\n            <span class=\"file-name\">\n              <a href=\"".concat(attachment.url, "\" target=\"_blank\">\n                ").concat(attachment.filename, "\n              </a>\n               ").concat(fileSize ? "(".concat(fileSize, " PDF Document)") : '', "\n            </span>\n          </div>\n        </div>\n      "));

        // Add the file info text below the file preview if not already present
        if (!_this3.$('.upload-instructions').length) {
          $previewWrapper.after("<span class=\"upload-instructions\">Upload a PDF template file (optional) *<br>Accepted format: application/pdf</span>");
        }
        // Show the remove button
        button.siblings('.remove-file-button').removeClass('hidden');

        // Update the button text to "Replace File"
        button.text('Replace File');
      });
      this.mediaFrame.open();
    }
  }, {
    key: "handleFileRemove",
    value: function handleFileRemove(e) {
      e.preventDefault();
      var button = this.$(e.currentTarget);
      var targetInputSelector = button.data('target-input');
      var targetPreviewSelector = button.data('target-preview');
      var uploadButton = button.siblings('.select-file-button');
      if (targetInputSelector) {
        this.$(targetInputSelector).val('').trigger('change');
      }
      if (targetPreviewSelector) {
        this.$(targetPreviewSelector).empty();
      } else {
        button.siblings('.file-preview-wrapper').empty();
      }

      // Hide the remove button
      button.addClass('hidden');

      // Update the text on the upload button from "Replace File" to "Upload File"
      if (uploadButton.length) {
        uploadButton.text('Upload File');
      }

      // Remove the upload instructions if they were added
      this.$('.upload-instructions').remove();
    }
  }, {
    key: "validateMarkup",
    value: function validateMarkup(e) {
      var $input = this.$(e.currentTarget);
      var value = parseInt($input.val(), 10);
      var min = parseInt($input.attr('min') || 0, 10);
      var max = parseInt($input.attr('max') || 100, 10);

      // Use generalSettings.i18n if available, otherwise use this.settings.i18n
      var i18n = window.generalSettings && window.generalSettings.i18n || this.settings.i18n || {};
      if (isNaN(value) || value < min || value > max) {
        this.showFieldError($input, i18n.validationErrorMarkup || "Value must be between ".concat(min, " and ").concat(max, "."));
        return false;
      }
      this.clearFieldError($input);
      return true;
    }
  }, {
    key: "validateExpiryDays",
    value: function validateExpiryDays(e) {
      var $input = this.$(e.currentTarget);
      var value = parseInt($input.val(), 10);
      var min = parseInt($input.attr('min') || 1, 10);
      var max = parseInt($input.attr('max') || 365, 10);
      var i18n = window.generalSettings && window.generalSettings.i18n || this.settings.i18n || {};
      if (isNaN(value) || value < min || value > max) {
        this.showFieldError($input, i18n.validationErrorExpiry || "Value must be between ".concat(min, " and ").concat(max, "."));
        return false;
      }
      this.clearFieldError($input);
      return true;
    }

    /**
     * Override validateAllFields to save editor content before validation
     */
  }, {
    key: "validateAllFields",
    value: function validateAllFields() {
      this.saveEditorContent(); // Save editor content before validation

      var isValid = _superPropGet(GeneralSettingsModule, "validateAllFields", this, 3)([]);

      // Also validate file inputs
      if (!this.validateFileInput('pdf_template')) {
        isValid = false;
      }

      // Validate select2 fields
      if (!this.validateSelect2Field('primary_product_categories')) {
        isValid = false;
      }
      return isValid;
    }
  }, {
    key: "saveEditorContent",
    value: function saveEditorContent() {
      if (typeof tinyMCE !== 'undefined') {
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
     * Validate file input fields
     * @param {string} fieldId - The ID of the file input field
     */
  }, {
    key: "validateFileInput",
    value: function validateFileInput(fieldId) {
      var $input = this.$("#".concat(fieldId));
      var value = $input.val();
      var isRequired = $input.prop('required') || $input.data('required') === true;
      var i18n = window.generalSettings && window.generalSettings.i18n || this.settings.i18n || {};
      if (isRequired && !value) {
        this.showFieldError($input, i18n.validationErrorRequired || 'This field is required.');
        return false;
      }
      this.clearFieldError($input);
      return true;
    }

    /**
     * Validate a Select2 field
     * @param {string} fieldId - The ID of the select2 field
     * @returns {boolean} Whether the field is valid
     */
  }, {
    key: "validateSelect2Field",
    value: function validateSelect2Field(fieldId) {
      var $select = this.$("#".concat(fieldId));
      if (!$select.length) {
        return true;
      }
      var isRequired = $select.prop('required') || $select.data('required') === true;
      var value = $select.val();
      var isEmpty = !value || Array.isArray(value) && value.length === 0;
      if (isRequired && isEmpty) {
        this.showFieldError($select, 'This field is required.');
        return false;
      }
      this.clearFieldError($select);
      return true;
    }

    /**
     * Cache DOM elements for later use
     * @private
     */
  }, {
    key: "_cacheDOM",
    value: function _cacheDOM() {
      // Cache the select2 elements
      if (!this.dom) {
        this.dom = {};
      }
      this.dom.primaryProductCategories = this.$('#primary_product_categories');

      // Log cache status for debugging
      if (this.dom.primaryProductCategories && this.dom.primaryProductCategories.length) {
        logger.log('Successfully cached DOM element for primary categories');
      } else {
        logger.warn('Failed to cache primary categories DOM element - element not found');
      }
    }

    /**
     * Initialize Select2 dropdowns
     * @private
     */
  }, {
    key: "_initializeSelect2",
    value: function _initializeSelect2() {
      this.initializeSelect2Dropdowns({
        elements: [{
          element: this.dom.primaryProductCategories,
          placeholderKey: 'primaryProductCategories',
          fallbackText: 'Select primary product categories',
          name: 'primary product categories',
          config: {
            width: '100%',
            dropdownAutoWidth: true,
            minimumResultsForSearch: 0,
            matcher: function matcher(params, data) {
              // If there are no params or no search term, return all data
              if (!params || !params.term) {
                return data;
              }

              // Search in the text field
              if (data.text.toLowerCase().indexOf(params.term.toLowerCase()) > -1) {
                return data;
              }

              // Return null if the term doesn't match
              return null;
            }
            // templateResult is now provided by the base class
          }
        }],
        moduleName: 'General Settings'
      });
    }

    /**
     * Format file size in bytes to a human-readable format
     * @param {number} bytes - Size in bytes
     * @returns {string} Formatted size (e.g., "256 KB")
     */
  }, {
    key: "_formatFileSize",
    value: function _formatFileSize(bytes) {
      if (bytes === 0) {
        return '0 Bytes';
      }
      var k = 1024;
      var sizes = ['Bytes', 'KB', 'MB', 'GB'];
      var i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  }]);
}(_common_VerticalTabbedModule__WEBPACK_IMPORTED_MODULE_8__["default"]);
jQuery(document).ready(function ($) {
  // Ensure module is only instantiated if its corresponding UI is present.
  if ($('#general').length) {
    window.GeneralSettingsModuleInstance = new GeneralSettingsModule();
  } else {
    logger.warn('Container #general not found. GeneralSettingsModule will not be initialized.');
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GeneralSettingsModule);

/***/ }),

/***/ "./src/js/admin/modules/HierarchicalLabelSettingsModule.js":
/*!*****************************************************************!*\
  !*** ./src/js/admin/modules/HierarchicalLabelSettingsModule.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/get */ "./node_modules/@babel/runtime/helpers/esm/get.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _common_VerticalTabbedModule__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../common/VerticalTabbedModule */ "./src/js/admin/common/VerticalTabbedModule.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");






function _callSuper(t, o, e) { return o = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(o), (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__["default"])(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _superPropGet(t, o, e, r) { var p = (0,_babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_4__["default"])((0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
/**
 * Hierarchical Label Settings JavaScript
 *
 * Handles functionality specific to the hierarchical label settings tab.
 * Extends VerticalTabbedModule for common vertical tab and form handling.
 *
 * This module provides enhanced UI for managing hierarchical label structure,
 * including expandable sections, path-based navigation, and search functionality.
 */


var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_7__.createLogger)('HierarchicalLabelSettingsModule');
var HierarchicalLabelSettingsModule = /*#__PURE__*/function (_VerticalTabbedModule) {
  function HierarchicalLabelSettingsModule() {
    var _this;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, HierarchicalLabelSettingsModule);
    _this = _callSuper(this, HierarchicalLabelSettingsModule, [{
      mainTabId: 'labels',
      defaultSubTabId: 'common',
      ajaxActionPrefix: 'save_labels',
      localizedDataName: 'labelSettings'
    }]);

    // Log that the HierarchicalLabelSettingsModule is being constructed
    logger.log('HierarchicalLabelSettingsModule constructor called');

    // Initialize label management properties
    _this.bulkEditItems = [];
    _this.expandedSections = new Set();
    _this.searchResults = [];
    return _this;
  }

  /**
   * Module initialization method called by ProductEstimatorSettings base class
   */
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__["default"])(HierarchicalLabelSettingsModule, _VerticalTabbedModule);
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(HierarchicalLabelSettingsModule, [{
    key: "moduleInit",
    value: function moduleInit() {
      var _this2 = this;
      logger.log('HierarchicalLabelSettingsModule moduleInit called');

      // Fix section header table structure immediately when module loads
      setTimeout(function () {
        _this2.fixSectionHeaderTableStructure();
      }, 500);
    }

    /**
     * Override to bind module-specific events.
     * Common events are bound by the parent class.
     */
  }, {
    key: "bindModuleSpecificEvents",
    value: function bindModuleSpecificEvents() {
      var _this3 = this;
      _superPropGet(HierarchicalLabelSettingsModule, "bindModuleSpecificEvents", this, 3)([]);
      if (!this.$container || !this.$container.length) {
        logger.warn('Container not found, cannot bind label-specific events');
        return;
      }
      logger.log('Binding module-specific events for Hierarchical Labels Settings');

      // Bind events for label management functionality
      // Export functionality
      this.$('#export-labels').on('click', this.handleExport.bind(this));

      // Import functionality
      this.$('#import-labels').on('click', function () {
        return _this3.$('#import-file').click();
      });
      this.$('#import-file').on('change', this.handleImport.bind(this));

      // Reset category
      this.$('#reset-category-defaults').on('click', this.handleResetCategory.bind(this));

      // Bulk edit
      this.$(document).on('click', '.bulk-edit-trigger', this.handleBulkEditTrigger.bind(this));
      this.$('#apply-bulk-edits').on('click', this.handleBulkUpdate.bind(this));
      this.$('#cancel-bulk-edit').on('click', this.cancelBulkEdit.bind(this));

      // Hierarchical-specific events
      this.$(document).on('click', '.pe-label-subcategory-heading', this.toggleSubcategory.bind(this));
      this.$('#label-search').on('input', this.debounce(this.handleSearch.bind(this), 300));

      // Add expand/collapse all buttons to each tab
      this.addExpandCollapseButtons();

      // Preview updates for hierarchical labels
      this.$(document).on('input', 'input[data-path]', this.updatePreview.bind(this));
      logger.log('Hierarchical label management events bound successfully');
    }

    /**
     * Add expand/collapse all buttons to each vertical tab panel
     */
  }, {
    key: "addExpandCollapseButtons",
    value: function addExpandCollapseButtons() {
      var _this4 = this;
      this.$('.pe-vtabs-tab-panel, .vertical-tab-content').each(function (_, panel) {
        var $panel = jQuery(panel);
        var $heading = $panel.find('h2, h3').first();
        if ($heading.length) {
          var $buttonContainer = jQuery('<div class="section-toggle-buttons"></div>');
          var $expandButton = jQuery("<button type=\"button\" class=\"button expand-all-button\">\n          ".concat(_this4.settings.i18n.expandAll || 'Expand All', "\n        </button>"));
          var $collapseButton = jQuery("<button type=\"button\" class=\"button collapse-all-button\">\n          ".concat(_this4.settings.i18n.collapseAll || 'Collapse All', "\n        </button>"));
          $buttonContainer.append($expandButton).append($collapseButton);
          $heading.after($buttonContainer);
          $expandButton.on('click', function () {
            return _this4.expandAllSections($panel);
          });
          $collapseButton.on('click', function () {
            return _this4.collapseAllSections($panel);
          });
        }
      });
    }

    /**
     * Expand all sections in a panel
     * @param {jQuery} $panel - The panel containing sections to expand
     */
  }, {
    key: "expandAllSections",
    value: function expandAllSections($panel) {
      var _this5 = this;
      var $headings = $panel.find('.pe-label-subcategory-heading');
      $headings.each(function (_, heading) {
        var $heading = jQuery(heading);
        var path = $heading.next('.pe-label-subcategory-data').data('path');
        if (path) {
          _this5.expandedSections.add(path);
          _this5.updateSectionVisibility(path, true);
        }
      });
    }

    /**
     * Collapse all sections in a panel
     * @param {jQuery} $panel - The panel containing sections to collapse
     */
  }, {
    key: "collapseAllSections",
    value: function collapseAllSections($panel) {
      var _this6 = this;
      var $headings = $panel.find('.pe-label-subcategory-heading');
      $headings.each(function (_, heading) {
        var $heading = jQuery(heading);
        var path = $heading.next('.pe-label-subcategory-data').data('path');
        if (path) {
          _this6.expandedSections["delete"](path);
          _this6.updateSectionVisibility(path, false);
        }
      });
    }

    /**
     * Toggle a subcategory's visibility
     * @param {Event} e - The click event
     */
  }, {
    key: "toggleSubcategory",
    value: function toggleSubcategory(e) {
      var $heading = jQuery(e.currentTarget);
      var $data = $heading.next('.pe-label-subcategory-data');
      var path = $data.data('path');
      if (!path) return;
      if (this.expandedSections.has(path)) {
        this.expandedSections["delete"](path);
        this.updateSectionVisibility(path, false);
      } else {
        this.expandedSections.add(path);
        this.updateSectionVisibility(path, true);
      }
    }

    /**
     * Update a section's visibility
     * @param {string} path - The section path
     * @param {boolean} visible - Whether the section should be visible
     */
  }, {
    key: "updateSectionVisibility",
    value: function updateSectionVisibility(path, visible) {
      var $heading = jQuery(".pe-label-subcategory-data[data-path=\"".concat(path, "\"]")).prev('.pe-label-subcategory-heading');
      var $fields = jQuery(".pe-label-field-wrapper[data-path^=\"".concat(path, ".\"]"));
      if (visible) {
        $heading.addClass('expanded');
        $fields.show();
      } else {
        $heading.removeClass('expanded');
        $fields.hide();
      }
    }

    /**
     * Handle search functionality
     */
  }, {
    key: "handleSearch",
    value: function handleSearch(e) {
      var _this7 = this;
      var searchTerm = e.target.value.trim().toLowerCase();
      var $resultsContainer = jQuery('#label-search-results');
      if (searchTerm.length < 2) {
        $resultsContainer.hide();
        return;
      }

      // Find matching labels
      this.searchResults = [];
      jQuery('input[data-path]').each(function (_, input) {
        var $input = jQuery(input);
        var path = $input.data('path');
        var value = $input.val().toLowerCase();
        if (path.toLowerCase().includes(searchTerm) || value.includes(searchTerm)) {
          _this7.searchResults.push({
            path: path,
            value: $input.val(),
            element: $input
          });
        }
      });

      // Display results
      $resultsContainer.empty();
      if (this.searchResults.length === 0) {
        $resultsContainer.html("<p>".concat(this.settings.i18n.searchNoResults || 'No labels found matching your search.', "</p>"));
        $resultsContainer.show();
        return;
      }
      var resultsCountText = this.settings.i18n.searchResultsCount ? this.settings.i18n.searchResultsCount.replace('%d', this.searchResults.length) : "".concat(this.searchResults.length, " labels found.");
      $resultsContainer.append("<p><strong>".concat(resultsCountText, "</strong></p>"));

      // Add results to container
      this.searchResults.forEach(function (result) {
        var highlightedPath = _this7.highlightSearchTerm(result.path, searchTerm);
        var highlightedValue = _this7.highlightSearchTerm(result.value, searchTerm);
        var $resultItem = jQuery("\n        <div class=\"search-result-item\">\n          <div class=\"path\">".concat(highlightedPath, "</div>\n          <div class=\"value\">").concat(highlightedValue, "</div>\n          <a href=\"#\" class=\"go-to\" data-path=\"").concat(result.path, "\">Go to this field</a>\n        </div>\n      "));
        $resultsContainer.append($resultItem);
      });

      // Bind click events for "Go to" links
      $resultsContainer.find('.go-to').on('click', function (e) {
        e.preventDefault();
        var path = jQuery(e.currentTarget).data('path');
        _this7.goToLabelField(path);
      });
      $resultsContainer.show();
    }

    /**
     * Highlight search term in text
     * @param {string} text - The text to highlight
     * @param {string} term - The search term
     * @returns {string} HTML with highlighted term
     */
  }, {
    key: "highlightSearchTerm",
    value: function highlightSearchTerm(text, term) {
      if (!term) return text;
      var regex = new RegExp("(".concat(term, ")"), 'gi');
      return text.replace(regex, '<span class="label-search-highlight">$1</span>');
    }

    /**
     * Navigate to a label field by path
     * @param {string} path - The path to the field
     */
  }, {
    key: "goToLabelField",
    value: function goToLabelField(path) {
      var _this8 = this;
      // First, determine which tab this field is in
      var pathParts = path.split('.');
      var category = pathParts[0];

      // Switch to the correct tab if needed
      if (this.getCurrentSubTabId() !== category) {
        this.activateSubTab(category);
      }

      // Ensure all parent sections are expanded
      var currentPath = '';
      pathParts.forEach(function (part, index) {
        if (index === pathParts.length - 1) return; // Skip the last part (field name)

        currentPath = currentPath ? "".concat(currentPath, ".").concat(part) : part;
        _this8.expandedSections.add(currentPath);
        _this8.updateSectionVisibility(currentPath, true);
      });

      // Find and highlight the field
      var $field = jQuery("input[data-path=\"".concat(path, "\"]"));
      if ($field.length) {
        // Scroll to the field
        jQuery('html, body').animate({
          scrollTop: $field.offset().top - 100
        }, 500);

        // Highlight the field
        $field.focus().css('background-color', '#fffbcc');

        // Remove highlight after a delay
        setTimeout(function () {
          $field.css('background-color', '');
        }, 3000);

        // Close search results
        jQuery('#label-search-results').hide();
        jQuery('#label-search').val('');
      }
    }

    /**
     * Override for actions when the main "Labels" tab is activated.
     */
  }, {
    key: "onMainTabActivated",
    value: function onMainTabActivated() {
      _superPropGet(HierarchicalLabelSettingsModule, "onMainTabActivated", this, 3)([]);
      logger.log('Hierarchical Labels tab activated');
      this.initializeUI();
    }

    /**
     * Initialize UI components
     */
  }, {
    key: "initializeUI",
    value: function initializeUI() {
      var _this9 = this;
      // Fix section header table structure to use colspan (with delay to ensure DOM is ready)
      setTimeout(function () {
        _this9.fixSectionHeaderTableStructure();
      }, 100);

      // Hide all nested fields initially
      jQuery('.pe-label-field-wrapper[data-depth]').each(function (_, field) {
        var $field = jQuery(field);
        var path = $field.data('path') || '';
        var pathParts = path.split('.');

        // If this is a nested field (depth > 1), check if its path matches any expanded section
        if (pathParts.length > 2) {
          var parentPath = pathParts.slice(0, pathParts.length - 1).join('.');
          var isVisible = _this9.expandedSections.has(parentPath);
          $field.toggle(isVisible);
        }
      });

      // Apply expand/collapse state to section headings
      jQuery('.pe-label-subcategory-heading').each(function (_, heading) {
        var $heading = jQuery(heading);
        var $data = $heading.next('.pe-label-subcategory-data');
        var path = $data.data('path');
        if (path && _this9.expandedSections.has(path)) {
          $heading.addClass('expanded');
        } else {
          $heading.removeClass('expanded');
        }
      });
    }

    /**
     * Fix section header table structure to use proper colspan
     */
  }, {
    key: "fixSectionHeaderTableStructure",
    value: function fixSectionHeaderTableStructure() {
      logger.log('fixSectionHeaderTableStructure called');
      var $headers = jQuery('.section-header-needs-colspan');
      logger.log('Found headers with needs-colspan:', $headers.length);
      $headers.each(function (_, sectionHeader) {
        var $sectionHeader = jQuery(sectionHeader);
        var $td = $sectionHeader.closest('td');
        var $th = $td.prev('th');
        var $tr = $td.closest('tr');
        logger.log('Processing header:', $sectionHeader.text());
        logger.log('Found td:', $td.length);
        logger.log('Found th:', $th.length);
        logger.log('Th is empty:', $th.is(':empty'));

        // Only process if this is in a table row with empty th
        if ($th.length && $th.is(':empty')) {
          logger.log('Removing th and adding colspan for:', $sectionHeader.text());

          // Remove the empty th
          $th.remove();

          // Add colspan to the td
          $td.attr('colspan', '2');
          $td.addClass('section-header-cell');

          // Remove the special class now that we've processed it
          $sectionHeader.removeClass('section-header-needs-colspan');
          logger.log('Fixed section header table structure for:', $sectionHeader.text());
        }
      });
    }

    /**
     * Handle exporting labels to JSON
     */
  }, {
    key: "handleExport",
    value: function handleExport() {
      var _this0 = this;
      logger.log('Export button clicked');

      // Use the managementNonce from this module
      var nonce = this.settings.managementNonce || this.settings.nonce;
      logger.log('Using nonce for export:', nonce);
      _utils__WEBPACK_IMPORTED_MODULE_7__.ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: {
          action: 'pe_export_labels',
          nonce: nonce
        }
      }).then(function (data) {
        logger.log('Export response:', data);
        _this0.downloadJSON(data.filename, data.data);
        _this0.showNotice(_this0.settings.i18n.exportSuccess || 'Labels exported successfully.', 'success');
      })["catch"](function (error) {
        logger.error('Export failed:', error);
        _this0.showNotice('Export failed: ' + (error.message || 'Unknown error'), 'error');
      });
    }

    /**
     * Handle importing labels from JSON file
     */
  }, {
    key: "handleImport",
    value: function handleImport(e) {
      var _this1 = this;
      logger.log('Import button clicked');
      var file = e.target.files[0];
      if (!file) return;
      var confirmMessage = this.settings.i18n.confirmImport || 'This will replace all existing labels. Are you sure?';
      if (!confirm(confirmMessage)) {
        jQuery('#import-file').val('');
        return;
      }
      var reader = new FileReader();
      reader.onload = function (event) {
        var importData = event.target.result;

        // Use managementNonce first, then fall back to regular nonce
        var nonce = _this1.settings.managementNonce || _this1.settings.nonce;
        logger.log('Using nonce for import:', nonce);
        _utils__WEBPACK_IMPORTED_MODULE_7__.ajax.ajaxRequest({
          url: _this1.settings.ajaxUrl,
          data: {
            action: 'pe_import_labels',
            nonce: nonce,
            import_data: importData
          }
        }).then(function (data) {
          logger.log('Import response:', data);
          _this1.showNotice(data.message || 'Labels imported successfully.', 'success');
          // Reload page to show imported labels
          setTimeout(function () {
            return location.reload();
          }, 1500);
        })["catch"](function (error) {
          logger.error('Import failed:', error);
          _this1.showNotice(error.message || _this1.settings.i18n.importError || 'Error importing labels.', 'error');
        })["finally"](function () {
          jQuery('#import-file').val('');
        });
      };
      reader.readAsText(file);
    }

    /**
     * Handle reset category to defaults
     */
  }, {
    key: "handleResetCategory",
    value: function handleResetCategory() {
      var _this10 = this;
      // Valid categories for hierarchical structure
      var validCategories = ['common', 'estimate', 'room', 'product', 'customer', 'ui', 'modal', 'pdf'];

      // Try multiple selector strategies to find the active category
      var currentCategory = null;

      // Strategy 1: Use the form's data attribute in the visible panel (most reliable)
      var $activeForm = jQuery('.pe-vtabs-tab-panel:visible form.pe-vtabs-tab-form, .vertical-tab-content:visible form');
      if ($activeForm.length) {
        currentCategory = $activeForm.data('sub-tab-id');
        logger.log('Reset category: Found active category from form data attribute:', currentCategory);
      }

      // Try additional strategies to find the current category as in the original code
      // [Strategies 2-6 omitted for brevity, same as original code]

      // Validate that we have a valid category
      if (!currentCategory || !validCategories.includes(currentCategory)) {
        logger.error("Reset category: Invalid category \"".concat(currentCategory, "\". Must be one of: ").concat(validCategories.join(', ')));

        // Default to 'common' category if on labels tab
        var urlParams = new URLSearchParams(window.location.search);
        var tabParam = urlParams.get('tab');
        if (tabParam === 'labels') {
          currentCategory = 'common';
          logger.log('Reset category: Defaulting to "common" category');
        } else {
          return; // Can't proceed without a valid category
        }
      }
      var confirmMessage = this.settings.i18n.resetConfirm || 'Are you sure you want to reset this category to default values?';
      if (!confirm(confirmMessage)) {
        logger.log('Reset category: User canceled the operation');
        return;
      }

      // Use managementNonce first, then fall back to regular nonce
      var nonce = this.settings.managementNonce || this.settings.nonce;
      logger.log('Reset category: Using nonce:', nonce);
      logger.log('Reset category: Making AJAX request for category:', currentCategory);
      _utils__WEBPACK_IMPORTED_MODULE_7__.ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: {
          action: 'pe_reset_category_labels',
          nonce: nonce,
          category: currentCategory
        }
      }).then(function (data) {
        logger.log('Reset category response:', data);
        _this10.showNotice(data.message || 'Category reset to defaults successfully. Page will refresh to show changes.', 'success');

        // Schedule a page refresh after a short delay to show the changes
        setTimeout(function () {
          logger.log('Refreshing page to show updated labels');
          window.location.reload();
        }, 1500);
      })["catch"](function (error) {
        logger.error('Reset category failed:', error);
        _this10.showNotice('Reset failed: ' + (error.message || 'Unknown error'), 'error');
      });
    }

    /**
     * Handle bulk edit trigger button
     */
  }, {
    key: "handleBulkEditTrigger",
    value: function handleBulkEditTrigger(e) {
      e.preventDefault();
      var $target = jQuery(e.currentTarget);
      var $input = $target.closest('.pe-label-field-wrapper').find('input[data-path]');
      if ($input.length) {
        var path = $input.data('path');
        var currentValue = $input.val();

        // Add to bulk edit items
        var existingIndex = this.bulkEditItems.findIndex(function (item) {
          return item.path === path;
        });
        if (existingIndex === -1) {
          this.bulkEditItems.push({
            path: path,
            originalValue: currentValue,
            newValue: currentValue
          });
        }
        this.showBulkEditSection();
      }
    }

    /**
     * Show bulk edit section
     */
  }, {
    key: "showBulkEditSection",
    value: function showBulkEditSection() {
      var _this11 = this;
      var $section = jQuery('.label-bulk-edit-section');
      var $container = jQuery('#bulk-edit-items');
      $container.empty();
      this.bulkEditItems.forEach(function (item, index) {
        var $item = jQuery("\n        <div class=\"bulk-edit-item\" data-index=\"".concat(index, "\">\n          <label>").concat(item.path, "</label>\n          <input type=\"text\" class=\"bulk-edit-value regular-text\" \n                 value=\"").concat(item.newValue, "\" \n                 data-index=\"").concat(index, "\" />\n          <button type=\"button\" class=\"button-link remove-bulk-item\" data-index=\"").concat(index, "\">\n            Remove\n          </button>\n        </div>\n      "));
        $container.append($item);
      });

      // Bind events for bulk edit items
      jQuery('.bulk-edit-value').on('input', function (e) {
        var index = jQuery(e.target).data('index');
        _this11.bulkEditItems[index].newValue = e.target.value;
      });
      jQuery('.remove-bulk-item').on('click', function (e) {
        var index = jQuery(e.target).data('index');
        _this11.bulkEditItems.splice(index, 1);
        if (_this11.bulkEditItems.length === 0) {
          _this11.cancelBulkEdit();
        } else {
          _this11.showBulkEditSection();
        }
      });
      $section.show();
    }

    /**
     * Handle bulk update button
     */
  }, {
    key: "handleBulkUpdate",
    value: function handleBulkUpdate() {
      var _this12 = this;
      var updates = {};
      this.bulkEditItems.forEach(function (item) {
        if (item.newValue !== item.originalValue) {
          updates[item.path] = item.newValue;
        }
      });
      if (Object.keys(updates).length === 0) {
        this.showNotice('No changes to apply', 'info');
        return;
      }

      // Use managementNonce first, then fall back to regular nonce
      var nonce = this.settings.managementNonce || this.settings.nonce;
      _utils__WEBPACK_IMPORTED_MODULE_7__.ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: {
          action: 'pe_bulk_update_labels',
          nonce: nonce,
          updates: updates
        }
      }).then(function (data) {
        logger.log('Bulk update response:', data);
        _this12.showNotice(_this12.settings.i18n.bulkUpdateSuccess || 'Labels updated successfully.', 'success');

        // Update the actual input fields
        _this12.bulkEditItems.forEach(function (item) {
          var $input = jQuery("input[data-path=\"".concat(item.path, "\"]"));
          if ($input.length) {
            $input.val(item.newValue);
          }
        });
        _this12.cancelBulkEdit();
      })["catch"](function (error) {
        logger.error('Bulk update failed:', error);
        _this12.showNotice(_this12.settings.i18n.bulkUpdateError || 'Error updating labels.', 'error');
      });
    }

    /**
     * Cancel bulk edit
     */
  }, {
    key: "cancelBulkEdit",
    value: function cancelBulkEdit() {
      this.bulkEditItems = [];
      jQuery('.label-bulk-edit-section').hide();
      jQuery('#bulk-edit-items').empty();
    }

    /**
     * Update preview for a label input field
     */
  }, {
    key: "updatePreview",
    value: function updatePreview(e) {
      var $input = jQuery(e.target);
      var value = $input.val();
      var $preview = $input.next('.label-preview-text');
      if ($preview.length) {
        $preview.find('em').text(value);
      }
    }

    /**
     * Download JSON data as a file
     */
  }, {
    key: "downloadJSON",
    value: function downloadJSON(filename, data) {
      var blob = new Blob([data], {
        type: 'application/json'
      });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    /**
     * Simple debounce function
     * @param {Function} func - The function to debounce
     * @param {number} wait - Milliseconds to wait
     * @returns {Function} Debounced function
     */
  }, {
    key: "debounce",
    value: function debounce(func, wait) {
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
  }]);
}(_common_VerticalTabbedModule__WEBPACK_IMPORTED_MODULE_6__["default"]); // Initialize the module
jQuery(document).ready(function () {
  if (jQuery('#labels').length) {
    logger.log('Initializing HierarchicalLabelSettingsModule');
    window.LabelSettingsModuleInstance = new HierarchicalLabelSettingsModule();
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (HierarchicalLabelSettingsModule);

/***/ }),

/***/ "./src/js/admin/modules/LabelSettingsModule.js":
/*!*****************************************************!*\
  !*** ./src/js/admin/modules/LabelSettingsModule.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/get */ "./node_modules/@babel/runtime/helpers/esm/get.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _common_VerticalTabbedModule__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../common/VerticalTabbedModule */ "./src/js/admin/common/VerticalTabbedModule.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");







function _callSuper(t, o, e) { return o = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(o), (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__["default"])(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _superPropGet(t, o, e, r) { var p = (0,_babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_5__["default"])((0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__["default"])(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
/**
 * Label Settings JavaScript
 *
 * Handles functionality specific to the label settings tab.
 * Extends VerticalTabbedModule for common vertical tab and form handling.
 *
 * This module relies on abstract base classes for common functionality,
 * selectors, and internationalization strings.
 */


var logger = (0,_utils__WEBPACK_IMPORTED_MODULE_8__.createLogger)('LabelSettingsModule');
var LabelSettingsModule = /*#__PURE__*/function (_VerticalTabbedModule) {
  function LabelSettingsModule() {
    var _this;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__["default"])(this, LabelSettingsModule);
    _this = _callSuper(this, LabelSettingsModule, [{
      mainTabId: 'labels',
      defaultSubTabId: 'estimate_management',
      ajaxActionPrefix: 'save_labels',
      localizedDataName: 'labelSettings'
    }]);

    // Log that the LabelSettingsModule is being constructed
    logger.log('LabelSettingsModule constructor called');

    // Initialize label management properties
    _this.bulkEditItems = [];
    return _this;
  }

  /**
   * Override to bind module-specific events.
   * Common events are bound by the parent class.
   */
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_6__["default"])(LabelSettingsModule, _VerticalTabbedModule);
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__["default"])(LabelSettingsModule, [{
    key: "bindModuleSpecificEvents",
    value: function bindModuleSpecificEvents() {
      var _this2 = this;
      _superPropGet(LabelSettingsModule, "bindModuleSpecificEvents", this, 3)([]);
      if (!this.$container || !this.$container.length) {
        logger.warn('Container not found, cannot bind label-specific events');
        return;
      }
      logger.log('Binding module-specific events for Labels Settings');

      // Bind events for label management functionality
      // Export functionality
      this.$('#export-labels').on('click', this.handleExport.bind(this));

      // Import functionality
      this.$('#import-labels').on('click', function () {
        return _this2.$('#import-file').click();
      });
      this.$('#import-file').on('change', this.handleImport.bind(this));

      // Reset category
      this.$('#reset-category-defaults').on('click', this.handleResetCategory.bind(this));

      // Bulk edit
      this.$(document).on('click', '.bulk-edit-trigger', this.handleBulkEditTrigger.bind(this));
      this.$('#apply-bulk-edits').on('click', this.handleBulkUpdate.bind(this));
      this.$('#cancel-bulk-edit').on('click', this.cancelBulkEdit.bind(this));

      // Preview updates for V3 hierarchical structure
      this.$('.regular-text[id^="estimate_management_"], .regular-text[id^="room_management_"], .regular-text[id^="customer_details_"], .regular-text[id^="product_management_"], .regular-text[id^="common_ui_"], .regular-text[id^="modal_system_"], .regular-text[id^="search_and_filters_"], .regular-text[id^="pdf_generation_"]').on('input', this.updatePreview.bind(this));
      logger.log('Label management events bound successfully');
    }

    /**
     * Override for actions when the main "Labels" tab is activated.
     */
  }, {
    key: "onMainTabActivated",
    value: function onMainTabActivated() {
      _superPropGet(LabelSettingsModule, "onMainTabActivated", this, 3)([]);
      logger.log('Labels tab activated');
      this.initializePreview();
    }

    /**
     * Handle exporting labels to JSON
     */
  }, {
    key: "handleExport",
    value: function handleExport() {
      var _this3 = this;
      logger.log('Export button clicked');

      // Use the managementNonce from this module
      var nonce = this.settings.managementNonce || this.settings.nonce;
      logger.log('Using nonce for export:', nonce);
      _utils__WEBPACK_IMPORTED_MODULE_8__.ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: {
          action: 'pe_export_labels',
          nonce: nonce
        }
      }).then(function (data) {
        logger.log('Export response:', data);
        _this3.downloadJSON(data.filename, data.data);
        _this3.showNotice(_this3.settings.i18n.exportSuccess || 'Labels exported successfully.', 'success');
      })["catch"](function (error) {
        logger.error('Export failed:', error);
        _this3.showNotice('Export failed: ' + (error.message || 'Unknown error'), 'error');
      });
    }

    /**
     * Handle importing labels from JSON file
     */
  }, {
    key: "handleImport",
    value: function handleImport(e) {
      var _this4 = this;
      logger.log('Import button clicked');
      var file = e.target.files[0];
      if (!file) return;
      var confirmMessage = this.settings.i18n.confirmImport || 'This will replace all existing labels. Are you sure?';
      if (!confirm(confirmMessage)) {
        jQuery('#import-file').val('');
        return;
      }
      var reader = new FileReader();
      reader.onload = function (event) {
        var importData = event.target.result;

        // Use managementNonce first, then fall back to regular nonce
        var nonce = _this4.settings.managementNonce || _this4.settings.nonce;
        logger.log('Using nonce for import:', nonce);
        _utils__WEBPACK_IMPORTED_MODULE_8__.ajax.ajaxRequest({
          url: _this4.settings.ajaxUrl,
          data: {
            action: 'pe_import_labels',
            nonce: nonce,
            import_data: importData
          }
        }).then(function (data) {
          logger.log('Import response:', data);
          _this4.showNotice(data.message || 'Labels imported successfully.', 'success');
          // Reload page to show imported labels
          setTimeout(function () {
            return location.reload();
          }, 1500);
        })["catch"](function (error) {
          logger.error('Import failed:', error);
          _this4.showNotice(error.message || _this4.settings.i18n.importError || 'Error importing labels.', 'error');
        })["finally"](function () {
          jQuery('#import-file').val('');
        });
      };
      reader.readAsText(file);
    }

    /**
     * Handle reset category to defaults
     */
  }, {
    key: "handleResetCategory",
    value: function handleResetCategory() {
      var _this5 = this;
      // Valid categories list - must match what's defined in PHP (V3 hierarchical structure)
      var validCategories = ['estimate_management', 'room_management', 'customer_details', 'product_management', 'common_ui', 'modal_system', 'search_and_filters', 'pdf_generation'];

      // Try multiple selector strategies to find the active category
      var currentCategory = null;

      // Strategy 1: Use the form's data attribute in the visible panel (most reliable)
      var $activeForm = jQuery('.pe-vtabs-tab-panel:visible form.pe-vtabs-tab-form, .vertical-tab-content:visible form');
      if ($activeForm.length) {
        currentCategory = $activeForm.data('sub-tab-id');
        logger.log('Reset category: Found active category from form data attribute:', currentCategory);
      }

      // Strategy 2: Check visible content panel ID
      if (!currentCategory || !validCategories.includes(currentCategory)) {
        var $visiblePanel = jQuery('.pe-vtabs-tab-panel:visible, .vertical-tab-content:visible');
        if ($visiblePanel.length) {
          currentCategory = $visiblePanel.attr('id');
          logger.log('Reset category: Found active category from visible panel:', currentCategory);
        }
      }

      // Strategy 3: Look for navigation item with active class
      if (!currentCategory || !validCategories.includes(currentCategory)) {
        // First try data-tab attribute
        var $activeNavItem = jQuery('.pe-vtabs-nav-item.active, .tab-item.active');
        if ($activeNavItem.length) {
          currentCategory = $activeNavItem.data('tab');
          logger.log('Reset category: Found active category from nav item data-tab:', currentCategory);

          // If not found in data-tab, try data-vertical-tab-id
          if (!currentCategory) {
            currentCategory = $activeNavItem.data('vertical-tab-id');
            logger.log('Reset category: Found active category from nav item data-vertical-tab-id:', currentCategory);
          }
        }
      }

      // Strategy 4: Check active link elements in navigation
      if (!currentCategory || !validCategories.includes(currentCategory)) {
        var $activeLink = jQuery('.pe-vtabs-nav-item.active a, .tab-item.active a, .pe-vtabs-nav a.active');
        if ($activeLink.length) {
          currentCategory = $activeLink.data('tab');
          logger.log('Reset category: Found active category from active link data-tab:', currentCategory);
        }
      }

      // Strategy 5: Extract from URL in active link href
      if (!currentCategory || !validCategories.includes(currentCategory)) {
        var _$activeLink = jQuery('.pe-vtabs-nav-item.active a, .tab-item.active a');
        if (_$activeLink.length) {
          var href = _$activeLink.attr('href') || '';
          var match = href.match(/[?&]sub_tab=([^&#]*)/i);
          if (match && match[1]) {
            currentCategory = decodeURIComponent(match[1].replace(/\+/g, ' '));
            logger.log('Reset category: Found active category from href:', currentCategory);
          }
        }
      }

      // Strategy 6: Fallback to URL parameter
      if (!currentCategory || !validCategories.includes(currentCategory)) {
        var urlParams = new URLSearchParams(window.location.search);
        currentCategory = urlParams.get('sub_tab');
        logger.log('Reset category: Found active category from URL param:', currentCategory);
      }

      // Validate that we have a valid category
      if (!currentCategory || !validCategories.includes(currentCategory)) {
        logger.error("Reset category: Invalid category \"".concat(currentCategory, "\". Must be one of: ").concat(validCategories.join(', ')));

        // If we found a category but it's invalid, try to automatically determine the correct category
        if (currentCategory) {
          // Try to extract a valid category from URL
          var _urlParams = new URLSearchParams(window.location.search);
          var tabParam = _urlParams.get('tab');
          if (tabParam === 'labels') {
            // If we're on the labels tab, default to 'estimate_management' category
            currentCategory = 'estimate_management';
            logger.log('Reset category: Defaulting to "estimate_management" category');
          } else {
            return; // Can't proceed without a valid category
          }
        } else {
          return; // Can't proceed without a category at all
        }
      }
      var confirmMessage = this.settings.i18n.resetConfirm || 'Are you sure you want to reset this category to default values?';
      if (!confirm(confirmMessage)) {
        logger.log('Reset category: User canceled the operation');
        return;
      }

      // Use managementNonce first, then fall back to regular nonce
      var nonce = this.settings.managementNonce || this.settings.nonce;
      logger.log('Reset category: Using nonce:', nonce);
      logger.log('Reset category: Making AJAX request for category:', currentCategory);
      _utils__WEBPACK_IMPORTED_MODULE_8__.ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: {
          action: 'pe_reset_category_labels',
          nonce: nonce,
          category: currentCategory
        }
      }).then(function (data) {
        logger.log('Reset category response:', data);
        _this5.showNotice(data.message || 'Category reset to defaults successfully. Page will refresh to show changes.', 'success');

        // Update the form fields in the UI
        if (data.labels) {
          logger.log('Reset category: Updating', Object.keys(data.labels).length, 'labels');
          Object.entries(data.labels).forEach(function (_ref) {
            var _ref2 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_ref, 2),
              key = _ref2[0],
              value = _ref2[1];
            var selector = "#".concat(currentCategory, "_").concat(key);
            var $field = jQuery(selector);
            if ($field.length) {
              $field.val(value);
              logger.log("Reset category: Updated field ".concat(selector, " to \"").concat(value, "\""));
            } else {
              logger.warn("Reset category: Field not found for ".concat(selector));
            }
          });

          // Schedule a page refresh after a short delay to show the changes
          setTimeout(function () {
            logger.log('Refreshing page to show updated labels');
            window.location.reload();
          }, 1500);
        } else {
          logger.warn('Reset category: No labels returned in response');
        }
      })["catch"](function (error) {
        logger.error('Reset category failed:', error);
        _this5.showNotice('Reset failed: ' + (error.message || 'Unknown error'), 'error');
      });
    }

    /**
     * Handle bulk edit trigger button
     */
  }, {
    key: "handleBulkEditTrigger",
    value: function handleBulkEditTrigger(e) {
      e.preventDefault();
      var $button = jQuery(e.currentTarget);
      var path = $button.data('path');
      var category = $button.data('category');
      var key = $button.data('key');

      // Find the input field
      var $input = jQuery("#".concat(category, "_").concat(key));
      if ($input.length) {
        var currentValue = $input.val();

        // Add to bulk edit items
        var existingIndex = this.bulkEditItems.findIndex(function (item) {
          return item.path === path;
        });
        if (existingIndex === -1) {
          this.bulkEditItems.push({
            path: path,
            originalValue: currentValue,
            newValue: currentValue,
            category: category,
            key: key
          });
        }
        this.showBulkEditSection();
      }
    }

    /**
     * Show bulk edit section
     */
  }, {
    key: "showBulkEditSection",
    value: function showBulkEditSection() {
      var _this6 = this;
      var $section = jQuery('.label-bulk-edit-section');
      var $container = jQuery('#bulk-edit-items');
      $container.empty();
      this.bulkEditItems.forEach(function (item, index) {
        var $item = jQuery("\n        <div class=\"bulk-edit-item\" data-index=\"".concat(index, "\">\n          <label>").concat(item.path, "</label>\n          <input type=\"text\" class=\"bulk-edit-value regular-text\" \n                 value=\"").concat(item.newValue, "\" \n                 data-index=\"").concat(index, "\" />\n          <button type=\"button\" class=\"button-link remove-bulk-item\" data-index=\"").concat(index, "\">\n            Remove\n          </button>\n        </div>\n      "));
        $container.append($item);
      });

      // Bind events for bulk edit items
      jQuery('.bulk-edit-value').on('input', function (e) {
        var index = jQuery(e.target).data('index');
        _this6.bulkEditItems[index].newValue = e.target.value;
      });
      jQuery('.remove-bulk-item').on('click', function (e) {
        var index = jQuery(e.target).data('index');
        _this6.bulkEditItems.splice(index, 1);
        if (_this6.bulkEditItems.length === 0) {
          _this6.cancelBulkEdit();
        } else {
          _this6.showBulkEditSection();
        }
      });
      $section.show();
    }

    /**
     * Handle bulk update button
     */
  }, {
    key: "handleBulkUpdate",
    value: function handleBulkUpdate() {
      var _this7 = this;
      var updates = {};
      this.bulkEditItems.forEach(function (item) {
        if (item.newValue !== item.originalValue) {
          updates[item.path] = item.newValue;
        }
      });
      if (Object.keys(updates).length === 0) {
        this.showNotice('No changes to apply', 'info');
        return;
      }

      // Use managementNonce first, then fall back to regular nonce
      var nonce = this.settings.managementNonce || this.settings.nonce;
      _utils__WEBPACK_IMPORTED_MODULE_8__.ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: {
          action: 'pe_bulk_update_labels',
          nonce: nonce,
          updates: updates
        }
      }).then(function (data) {
        logger.log('Bulk update response:', data);
        _this7.showNotice(_this7.settings.i18n.bulkUpdateSuccess || 'Labels updated successfully.', 'success');

        // Update the actual input fields
        _this7.bulkEditItems.forEach(function (item) {
          var $input = jQuery("#".concat(item.category, "_").concat(item.key));
          $input.val(item.newValue);
        });
        _this7.cancelBulkEdit();
      })["catch"](function (error) {
        logger.error('Bulk update failed:', error);
        _this7.showNotice(_this7.settings.i18n.bulkUpdateError || 'Error updating labels.', 'error');
      });
    }

    /**
     * Cancel bulk edit
     */
  }, {
    key: "cancelBulkEdit",
    value: function cancelBulkEdit() {
      this.bulkEditItems = [];
      jQuery('.label-bulk-edit-section').hide();
      jQuery('#bulk-edit-items').empty();
    }

    /**
     * Initialize preview functionality
     */
  }, {
    key: "initializePreview",
    value: function initializePreview() {
      var _this8 = this;
      // Add preview functionality for labels (V3 hierarchical structure)
      jQuery('.regular-text[id^="estimate_management_"], .regular-text[id^="room_management_"], .regular-text[id^="customer_details_"], .regular-text[id^="product_management_"], .regular-text[id^="common_ui_"], .regular-text[id^="modal_system_"], .regular-text[id^="search_and_filters_"], .regular-text[id^="pdf_generation_"]').each(function (index, element) {
        var $input = jQuery(element);
        var labelId = $input.attr('id');
        var preview = _this8.getPreviewForLabel(labelId);
        if (preview) {
          $input.after("<div class=\"label-preview-text\">Preview: <em>".concat(preview, "</em></div>"));
        }
      });
    }

    /**
     * Update preview text as user types
     */
  }, {
    key: "updatePreview",
    value: function updatePreview(e) {
      var $input = jQuery(e.target);
      var value = $input.val();
      var $preview = $input.next('.label-preview-text');
      if ($preview.length) {
        $preview.find('em').text(value);
      }
    }

    /**
     * Get preview text for a specific label
     */
  }, {
    key: "getPreviewForLabel",
    value: function getPreviewForLabel(labelId) {
      var previewMap = {
        // Estimate Management previews
        'estimate_management_estimate_actions_buttons_save': 'Button text shown when saving',
        'estimate_management_estimate_actions_buttons_print': 'Button text for printing',
        'estimate_management_create_new_estimate_form_estimate_name_field_label': 'Form field label',
        // Room Management previews  
        'room_management_add_new_room_form_room_name_field_label': 'Room name form field label',
        // Customer Details previews
        'customer_details_customer_details_form_customer_name_field_label': 'Customer name form field label',
        // Common UI previews
        'common_ui_confirmation_dialogs_buttons_confirm': 'Confirmation dialog button text',
        'common_ui_general_actions_buttons_save': 'General save button text'

        // Add more preview mappings as needed
      };
      return previewMap[labelId] || null;
    }

    /**
     * Download JSON data as a file
     */
  }, {
    key: "downloadJSON",
    value: function downloadJSON(filename, data) {
      var blob = new Blob([data], {
        type: 'application/json'
      });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }]);
}(_common_VerticalTabbedModule__WEBPACK_IMPORTED_MODULE_7__["default"]); // Initialize the module
jQuery(document).ready(function () {
  if (jQuery('#labels').length) {
    logger.log('Initializing LabelSettingsModule');
    window.LabelSettingsModuleInstance = new LabelSettingsModule();
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (LabelSettingsModule);

/***/ }),

/***/ "./src/js/admin/modules/NetsuiteSettingsModule.js":
/*!********************************************************!*\
  !*** ./src/js/admin/modules/NetsuiteSettingsModule.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _utils_ajax__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @utils/ajax */ "./src/js/utils/ajax.js");
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @utils/dom */ "./src/js/utils/dom.js");
/* harmony import */ var _common_ProductEstimatorSettings__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../common/ProductEstimatorSettings */ "./src/js/admin/common/ProductEstimatorSettings.js");





function _callSuper(t, o, e) { return o = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(o), (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__["default"])(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
/**
 * NetSuite Settings JavaScript
 *
 * Handles functionality specific to the NetSuite integration settings tab.
 */
 // Specific import from original
 // Specific import from original

 // Adjust path as needed
var NetsuiteSettingsModule = /*#__PURE__*/function (_ProductEstimatorSett) {
  /**
   * Initialize the module
   */
  function NetsuiteSettingsModule() {
    var _this;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, NetsuiteSettingsModule);
    _this = _callSuper(this, NetsuiteSettingsModule, [{
      isModule: true,
      settingsObjectName: 'netsuiteSettings',
      defaultTabId: 'netsuite'
    }]);

    // Bind methods
    _this.testNetsuiteConnection = _this.testNetsuiteConnection.bind(_this);
    _this.toggleNetsuiteFields = _this.toggleNetsuiteFields.bind(_this);
    _this.validateUrl = _this.validateUrl.bind(_this);
    _this.validateRequestLimit = _this.validateRequestLimit.bind(_this);
    _this.validateCacheTime = _this.validateCacheTime.bind(_this);
    _this.handleTabChanged = _this.handleTabChanged.bind(_this);
    return _this;
  }

  /**
   * Module-specific initialization.
   */
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__["default"])(NetsuiteSettingsModule, _ProductEstimatorSett);
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(NetsuiteSettingsModule, [{
    key: "moduleInit",
    value: function moduleInit() {
      this.bindEvents();
      this.setupDependentFields(); // Call after DOM is ready and elements are available
    }

    /**
     * Bind event handlers
     */
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      this.$(document).on('product_estimator_tab_changed', this.handleTabChanged);
      this.$('#test-netsuite-connection').on('click', this.testNetsuiteConnection);
      this.$('#netsuite_enabled').on('change', this.toggleNetsuiteFields);
      this.$('#netsuite_api_url, #netsuite_token_url').on('blur', this.validateUrl); // Use blur for validation after input
      this.$('#netsuite_request_limit').on('blur', this.validateRequestLimit);
      this.$('#netsuite_cache_time').on('blur', this.validateCacheTime);
    }
  }, {
    key: "setupDependentFields",
    value: function setupDependentFields() {
      this.toggleNetsuiteFields(); // Initial toggle based on current state
    }
  }, {
    key: "toggleNetsuiteFields",
    value: function toggleNetsuiteFields() {
      var enabled = this.$('#netsuite_enabled').is(':checked');
      var $fields = this.$('#netsuite_client_id, #netsuite_client_secret, #netsuite_api_url, #netsuite_token_url, #netsuite_request_limit, #netsuite_cache_time').closest('tr');
      var $testButtonContainer = this.$('#test-netsuite-connection').closest('p'); // Or other container

      if (enabled) {
        $fields.fadeIn(200);
        $testButtonContainer.fadeIn(200);
      } else {
        $fields.fadeOut(200);
        $testButtonContainer.fadeOut(200);
      }
    }
  }, {
    key: "testNetsuiteConnection",
    value: function testNetsuiteConnection() {
      var $button = this.$('#test-netsuite-connection');
      var $result = this.$('#connection-result'); // Assuming this element exists

      if ($button.prop('disabled')) return;
      var i18n = this.settings.i18n || window.netsuiteSettings && window.netsuiteSettings.i18n || {};
      $button.prop('disabled', true);
      $result.html("<span style=\"color:#666;\">".concat(i18n.testing || 'Testing connection...', "</span>"));
      (0,_utils_ajax__WEBPACK_IMPORTED_MODULE_5__.ajaxRequest)({
        // Using imported ajaxRequest directly as in original
        url: this.settings.ajaxUrl,
        // Use ajaxUrl from this.settings
        type: 'POST',
        data: {
          action: 'test_netsuite_connection',
          // Ensure this action is correct
          nonce: this.settings.nonce // Use nonce from this.settings
        }
      }).then(function (response) {
        // Assuming response is { success: true/false, data: { message: "..." } } or { message: "..." }
        var message = response.data && response.data.message ? response.data.message : response.message;
        $result.html("<span style=\"color:green;\">".concat(message || 'Connection successful.', "</span>"));
      })["catch"](function (error) {
        var errorMessage = error && error.message ? error.message : i18n.error || 'Error';
        $result.html("<span style=\"color:red;\">".concat(errorMessage, "</span>"));
      })["finally"](function () {
        $button.prop('disabled', false);
      });
    }
  }, {
    key: "handleTabChanged",
    value: function handleTabChanged(e, tabId) {
      if (tabId === this.settings.tab_id) {
        this.toggleNetsuiteFields(); // Refresh field visibility when tab becomes active
      }
      this.clearSubTabFromUrl();
    }
  }, {
    key: "validateUrl",
    value: function validateUrl(e) {
      var $field = this.$(e.currentTarget);
      var value = $field.val().trim();
      var i18n = this.settings.i18n || window.netsuiteSettings && window.netsuiteSettings.i18n || {};
      if (value && !this.isValidUrl(value)) {
        this.showFieldError($field, i18n.invalidUrl || 'Please enter a valid URL.');
        return false;
      }
      this.clearFieldError($field);
      return true;
    }
  }, {
    key: "isValidUrl",
    value: function isValidUrl(url) {
      try {
        new URL(url);
        return true;
      } catch (_) {
        return false;
      }
    }
  }, {
    key: "validateRequestLimit",
    value: function validateRequestLimit(e) {
      var $field = this.$(e.currentTarget);
      var value = parseInt($field.val(), 10);
      var i18n = this.settings.i18n || window.netsuiteSettings && window.netsuiteSettings.i18n || {};
      if (isNaN(value) || value < 1 || value > 100) {
        // Example range
        this.showFieldError($field, i18n.requestLimitError || 'Request limit must be between 1 and 100.');
        return false;
      }
      this.clearFieldError($field);
      return true;
    }
  }, {
    key: "validateCacheTime",
    value: function validateCacheTime(e) {
      var $field = this.$(e.currentTarget);
      var value = parseInt($field.val(), 10);
      var i18n = this.settings.i18n || window.netsuiteSettings && window.netsuiteSettings.i18n || {};
      if (isNaN(value) || value < 0) {
        // Example: must be non-negative
        this.showFieldError($field, i18n.cacheTimeError || 'Cache time must be at least 0.');
        return false;
      }
      this.clearFieldError($field);
      return true;
    }

    // showFieldError and clearFieldError are inherited.
  }, {
    key: "addInfoSection",
    value: function addInfoSection(message) {
      // Example of using imported createElement
      var $settingsTable = this.$('#netsuite-settings-table'); // Ensure this ID exists
      if (!$settingsTable.length || !message) return;
      this.$('.netsuite-info-section').remove(); // Remove existing

      var infoSection = (0,_utils_dom__WEBPACK_IMPORTED_MODULE_6__.createElement)('div', {
        // createElement from @utils/dom
        className: 'netsuite-info-section notice notice-info',
        style: {
          padding: '10px',
          marginBottom: '15px'
        },
        innerHTML: message // Assuming message can be HTML
      });
      $settingsTable.before(infoSection);
    }
  }]);
}(_common_ProductEstimatorSettings__WEBPACK_IMPORTED_MODULE_7__["default"]);
jQuery(document).ready(function () {
  if (jQuery('#netsuite').length) {
    // Assuming 'netsuite' is the ID of the tab content
    window.NetsuiteSettingsModuleInstance = new NetsuiteSettingsModule();
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (NetsuiteSettingsModule);

/***/ }),

/***/ "./src/js/admin/modules/NotificationSettingsModule.js":
/*!************************************************************!*\
  !*** ./src/js/admin/modules/NotificationSettingsModule.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/get */ "./node_modules/@babel/runtime/helpers/esm/get.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/* harmony import */ var _common_VerticalTabbedModule__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../common/VerticalTabbedModule */ "./src/js/admin/common/VerticalTabbedModule.js");






function _callSuper(t, o, e) { return o = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(o), (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__["default"])(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _superPropGet(t, o, e, r) { var p = (0,_babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_4__["default"])((0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
/**
 * Notification Settings JavaScript
 * Extends VerticalTabbedModule for common vertical tab and form handling.
 */
 // Import utilities needed for this module
// import { setupTinyMCEHTMLPreservation } from '@utils/tinymce-preserver'; // If still needed specifically here

 // Adjust path as needed
var NotificationSettingsModule = /*#__PURE__*/function (_VerticalTabbedModule) {
  function NotificationSettingsModule() {
    var _this;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, NotificationSettingsModule);
    _this = _callSuper(this, NotificationSettingsModule, [{
      mainTabId: 'notifications',
      defaultSubTabId: 'notifications-general',
      // Default vertical tab
      ajaxActionPrefix: 'save_notifications',
      // Results in 'save_notifications_settings'
      localizedDataName: 'notificationSettings'
    }]);
    _this.mediaFrame = null; // Specific to notifications for image uploads
    return _this;
  }

  /**
   * Override to bind module-specific events.
   */
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__["default"])(NotificationSettingsModule, _VerticalTabbedModule);
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(NotificationSettingsModule, [{
    key: "bindModuleSpecificEvents",
    value: function bindModuleSpecificEvents() {
      _superPropGet(NotificationSettingsModule, "bindModuleSpecificEvents", this, 3)([]);
      if (!this.$container || !this.$container.length) {
        return;
      }
      this.$container.on('change', '#enable_notifications', this.handleToggleAllNotifications.bind(this));
      this.$container.on('change', 'input[id^="notification_"][id$="_enabled"]', this.handleToggleSingleNotification.bind(this));
      this.$container.on('click', '.image-upload-button', this.handleImageUpload.bind(this));
      this.$container.on('click', '.image-remove-button', this.handleImageRemove.bind(this));
      this.$container.on('change', 'input[type="email"]', this.handleEmailValidation.bind(this)); // e.g. #from_email
    }

    /**
     * Override for actions when the main "Notifications" tab is activated.
     */
  }, {
    key: "onMainTabActivated",
    value: function onMainTabActivated() {
      _superPropGet(NotificationSettingsModule, "onMainTabActivated", this, 3)([]);
      this.setupDependentFieldsState(); // Initial state for toggles
      this.setupNotificationEditors(); // e.g. TinyMCE
      // this.setupMediaUploader(); // Media uploader is more general, could be in init if not already.
      // Or ensure it's setup if it relies on tab being visible.
    }
  }, {
    key: "setupNotificationEditors",
    value: function setupNotificationEditors() {
      if (!this.$container || !this.localizedData) return;
      // Example: If using setupTinyMCEHTMLPreservation for specific editors in notifications
      // const editorIds = this.localizedData.notification_types.map(type => `notification_${type}_content`);
      // setupTinyMCEHTMLPreservation(editorIds, `#${this.config.mainTabId}`);
    }
  }, {
    key: "setupDependentFieldsState",
    value: function setupDependentFieldsState() {
      var _this2 = this;
      if (!this.$container || !this.$container.length) return;
      this.handleToggleAllNotifications(); // Initial check for global toggle

      // Initial check for individual notification toggles
      this.$container.find('input[id^="notification_"][id$="_enabled"]').each(function (i, el) {
        var $toggle = jQuery(el);
        _this2.toggleSingleNotificationFields($toggle);
      });
    }
  }, {
    key: "handleToggleAllNotifications",
    value: function handleToggleAllNotifications() {
      var _this3 = this;
      if (!this.$container || !this.$container.length) return;
      var $globalEnableCheckbox = this.$container.find('#enable_notifications');
      if (!$globalEnableCheckbox.length) {
        return;
      }
      var isEnabled = $globalEnableCheckbox.is(':checked');
      var $verticalTabsNavList = this.$container.find('.pe-vtabs-nav-list, .vertical-tabs-nav');
      var $allNotificationTypeForms = this.$container.find('.pe-vtabs-tab-form[data-tab-id*="notification_type_"]');
      if (isEnabled) {
        $verticalTabsNavList.removeClass('pe-vtabs-nav-disabled'); // Use class from admin-vertical-tabs.css
        // Enable fields in specific notification type forms, but respect their individual toggles
        this.$container.find('input[id^="notification_"][id$="_enabled"]').each(function (i, el) {
          _this3.toggleSingleNotificationFields(jQuery(el));
        });
      } else {
        $verticalTabsNavList.addClass('pe-vtabs-nav-disabled');
        // Disable all fields in all notification type forms
        $allNotificationTypeForms.find('input, textarea, button, select').not('.save-settings').prop('disabled', true);
        $allNotificationTypeForms.find('.wp-editor-area').each(function () {
          var editor = tinyMCE.get(jQuery(this).attr('id'));
          if (editor) editor.setMode('readonly');
        });
      }
    }
  }, {
    key: "handleToggleSingleNotification",
    value: function handleToggleSingleNotification(e) {
      this.toggleSingleNotificationFields(jQuery(e.currentTarget));
    }
  }, {
    key: "toggleSingleNotificationFields",
    value: function toggleSingleNotificationFields($toggleCheckbox) {
      if (!this.$container || !this.$container.length) return;
      var $ = jQuery;
      var isChecked = $toggleCheckbox.is(':checked');
      var formDataType = $toggleCheckbox.attr('id').replace('notification_', '').replace('_enabled', '');
      var $form = this.$container.find(".pe-vtabs-tab-form[data-sub-tab-id=\"notification-type-".concat(formDataType, "\"]"));
      if (!$form.length) {
        return;
      }

      // Only proceed if global notifications are enabled
      var $globalEnableCheckbox = this.$container.find('#enable_notifications');
      if ($globalEnableCheckbox.length && !$globalEnableCheckbox.is(':checked')) {
        // Fields should remain disabled by handleToggleAllNotifications
        return;
      }
      $form.find('input, textarea, button, select').not($toggleCheckbox) // Don't disable the toggle itself
      .not('.save-settings') // Don't disable the save button
      .prop('disabled', !isChecked);
      $form.find('.wp-editor-area').each(function () {
        var editor = tinyMCE.get($(this).attr('id'));
        if (editor) {
          editor.setMode(isChecked ? 'design' : 'readonly');
        }
      });
    }
  }, {
    key: "handleImageUpload",
    value: function handleImageUpload(e) {
      var _this4 = this;
      e.preventDefault();
      var $button = jQuery(e.currentTarget);
      var fieldId = $button.data('field-id'); // e.g., 'company_logo'

      if (this.mediaFrame) {
        this.mediaFrame.off('select');
      } else {
        if (typeof wp === 'undefined' || !wp.media) {
          return;
        }
        this.mediaFrame = wp.media({
          title: this.localizedData.i18n.selectImage || 'Select Image',
          button: {
            text: this.localizedData.i18n.useThisImage || 'Use this image'
          },
          multiple: false,
          library: {
            type: 'image'
          }
        });
      }
      this.mediaFrame.on('select', function () {
        var attachment = _this4.mediaFrame.state().get('selection').first().toJSON();
        var $fieldInput = _this4.$container.find("#".concat(fieldId));
        var $previewWrapper = $fieldInput.closest('td').find('.image-preview-wrapper'); // Find relative to the input
        var $removeButton = $fieldInput.closest('td').find('.image-remove-button');
        $fieldInput.val(attachment.id).trigger('change');
        $previewWrapper.html("<img src=\"".concat(attachment.sizes.thumbnail ? attachment.sizes.thumbnail.url : attachment.url, "\" alt=\"Preview\" />"));
        $removeButton.removeClass('hidden');
      });
      this.mediaFrame.open();
    }
  }, {
    key: "handleImageRemove",
    value: function handleImageRemove(e) {
      e.preventDefault();
      var $button = jQuery(e.currentTarget);
      var fieldId = $button.data('field-id');
      var $fieldInput = this.$container.find("#".concat(fieldId));
      var $previewWrapper = $fieldInput.closest('td').find('.image-preview-wrapper');
      $fieldInput.val('').trigger('change');
      $previewWrapper.empty();
      $button.addClass('hidden');
    }
  }, {
    key: "handleEmailValidation",
    value: function handleEmailValidation(e) {
      var $field = jQuery(e.target);
      if (!$field.closest(this.$container).length) return;
      var email = $field.val().trim();
      var i18n = this.localizedData && this.localizedData.i18n || {};
      if (email && !_utils__WEBPACK_IMPORTED_MODULE_6__.validation.validateEmail(email)) {
        this.showFieldError($field, i18n.validationErrorEmail || 'Please enter a valid email address.');
        return false;
      }
      this.clearFieldError($field);
      return true;
    }
  }]);
}(_common_VerticalTabbedModule__WEBPACK_IMPORTED_MODULE_7__["default"]);
jQuery(document).ready(function () {
  if (jQuery('#notifications').length) {
    window.ProductEstimatorNotificationSettingsModule = new NotificationSettingsModule();
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (NotificationSettingsModule);

/***/ }),

/***/ "./src/js/admin/modules/PricingRulesSettingsModule.js":
/*!************************************************************!*\
  !*** ./src/js/admin/modules/PricingRulesSettingsModule.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/get */ "./node_modules/@babel/runtime/helpers/esm/get.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/* harmony import */ var _common_AdminTableManager__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../common/AdminTableManager */ "./src/js/admin/common/AdminTableManager.js");






function _callSuper(t, o, e) { return o = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(o), (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__["default"])(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _superPropGet(t, o, e, r) { var p = (0,_babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_4__["default"])((0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
/**
 * Pricing Rules Settings JavaScript
 *
 * Handles functionality specific to the pricing rules settings tab.
 * Extends AdminTableManager for common table and form management.
 */


var PricingRulesSettingsModule = /*#__PURE__*/function (_AdminTableManager) {
  /**
   * Constructor for PricingRulesSettingsModule.
   */
  function PricingRulesSettingsModule() {
    var _this;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, PricingRulesSettingsModule);
    var config = {
      mainTabId: 'pricing_rules',
      defaultSubTabId: 'pricing_rules_table',
      // Specify default sub-tab ID to match PHP definitions
      localizedDataName: 'pricingRulesSettings'
      // AdminTableManager passes this to VerticalTabbedModule,
      // which passes relevant parts to ProductEstimatorSettings.
    };
    _this = _callSuper(this, PricingRulesSettingsModule, [config]); // Calls AdminTableManager constructor

    // this.logger is initialized by AdminTableManager
    // this.settings is populated by ProductEstimatorSettings via the super chain

    // Defer DOM-dependent specific initializations until the base AdminTableManager signals it's ready
    _this.$(document).on("admin_table_manager_ready_".concat(_this.config.mainTabId), function () {
      _this._cachePricingRulesDOM();
      _this._bindSpecificEvents();
      _this._initializeSelect2();
    });
    return _this;
  }

  /**
   * Cache DOM elements specific to Pricing Rules, beyond what AdminTableManager caches.
   * @private
   */
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__["default"])(PricingRulesSettingsModule, _AdminTableManager);
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(PricingRulesSettingsModule, [{
    key: "_cachePricingRulesDOM",
    value: function _cachePricingRulesDOM() {
      // this.dom is initialized by AdminTableManager. Add Pricing Rules specific elements.
      if (this.settings && this.settings.selectors) {
        var prSelectors = this.settings.selectors;
        this.dom.categoriesSelect = this.$container.find(prSelectors.categoriesSelect);
        this.dom.pricingMethodSelect = this.$container.find(prSelectors.pricingMethodSelect);
        this.dom.pricingSourceSelect = this.$container.find(prSelectors.pricingSourceSelect);
      } else {
        this.logger.warn('PricingRulesSettingsModule: settings or selectors not available for DOM caching');
      }
    }

    /**
     * Bind events specific to Pricing Rules.
     * This is called after the `admin_table_manager_ready` event.
     * @private
     */
  }, {
    key: "_bindSpecificEvents",
    value: function _bindSpecificEvents() {
      // Ensure this.dom elements are available (cached by _cachePricingRulesDOM or base)
      if (!this.dom.form || !this.dom.form.length) {
        return;
      }
    }

    /**
     * Initialize Select2 components.
     * This is called after the `admin_table_manager_ready` event.
     * @private
     */
  }, {
    key: "_initializeSelect2",
    value: function _initializeSelect2() {
      this.initializeSelect2Dropdowns({
        elements: [{
          element: this.dom.categoriesSelect,
          placeholderKey: 'selectCategories',
          fallbackText: 'Select categories',
          name: 'categories',
          config: {
            clearInitial: true
          }
        }],
        moduleName: 'Pricing Rules'
      });
    }

    /**
     * Overridden from VerticalTabbedModule. Called when the "Pricing Rules" main tab is activated.
     */
  }, {
    key: "onMainTabActivated",
    value: function onMainTabActivated() {
      _superPropGet(PricingRulesSettingsModule, "onMainTabActivated", this, 3)([]); // Call parent method

      // Refresh Select2 components if they're already initialized
      if (this.dom.categoriesSelect && this.dom.categoriesSelect.hasClass("select2-hidden-accessible")) {
        this.refreshSelect2(this.dom.categoriesSelect);
      }
    }

    /**
     * Override AdminTableManager.resetForm to include Pricing Rules specific fields.
     */
  }, {
    key: "resetForm",
    value: function resetForm() {
      var _this$dom$categoriesS, _this$dom$pricingMeth, _this$dom$pricingSour;
      _superPropGet(PricingRulesSettingsModule, "resetForm", this, 3)([]); // Call base class method first

      // Reset Pricing Rules specific fields
      (_this$dom$categoriesS = this.dom.categoriesSelect) === null || _this$dom$categoriesS === void 0 || _this$dom$categoriesS.val(null).trigger('change.select2'); // Clear Select2
      (_this$dom$pricingMeth = this.dom.pricingMethodSelect) === null || _this$dom$pricingMeth === void 0 || _this$dom$pricingMeth.val('');
      (_this$dom$pricingSour = this.dom.pricingSourceSelect) === null || _this$dom$pricingSour === void 0 || _this$dom$pricingSour.val('');
    }

    /**
     * Override AdminTableManager.populateFormWithData for Pricing Rules specific fields.
     * @param {object} itemData - The data for the pricing rule item to populate the form with
     * @override
     */
  }, {
    key: "populateFormWithData",
    value: function populateFormWithData(itemData) {
      var _this2 = this;
      _superPropGet(PricingRulesSettingsModule, "populateFormWithData", this, 3)([itemData]); // Sets item ID, calls base logic

      var categories = itemData.categories || [];
      var pricingMethod = itemData.pricing_method || '';
      var pricingSource = itemData.pricing_source || '';

      // Use setTimeout to allow dependent field visibility changes to complete
      setTimeout(function () {
        var _this2$dom$categories, _this2$dom$pricingMet, _this2$dom$pricingSou;
        (_this2$dom$categories = _this2.dom.categoriesSelect) === null || _this2$dom$categories === void 0 || _this2$dom$categories.val(categories).trigger('change.select2');
        (_this2$dom$pricingMet = _this2.dom.pricingMethodSelect) === null || _this2$dom$pricingMet === void 0 || _this2$dom$pricingMet.val(pricingMethod);
        (_this2$dom$pricingSou = _this2.dom.pricingSourceSelect) === null || _this2$dom$pricingSou === void 0 || _this2$dom$pricingSou.val(pricingSource);
        _this2.formModified = false; // Reset modified flag after populating
      }, 150); // Small delay
    }

    /**
     * Override AdminTableManager.validateForm for Pricing Rules specific validation.
     * @returns {boolean} True if the form passes validation, false otherwise
     * @override
     */
  }, {
    key: "validateForm",
    value: function validateForm() {
      var _this$dom$categoriesS2, _this$dom$pricingMeth2, _this$dom$pricingSour2, _this$dom$categoriesS3;
      var isValid = _superPropGet(PricingRulesSettingsModule, "validateForm", this, 3)([]); // Perform base validation first

      // Get values
      var categories = (_this$dom$categoriesS2 = this.dom.categoriesSelect) === null || _this$dom$categoriesS2 === void 0 ? void 0 : _this$dom$categoriesS2.val(); // Returns array for multi-select
      var pricingMethod = (_this$dom$pricingMeth2 = this.dom.pricingMethodSelect) === null || _this$dom$pricingMeth2 === void 0 ? void 0 : _this$dom$pricingMeth2.val();
      var pricingSource = (_this$dom$pricingSour2 = this.dom.pricingSourceSelect) === null || _this$dom$pricingSour2 === void 0 ? void 0 : _this$dom$pricingSour2.val();

      // i18n messages from this.settings.i18n
      var i18n = this.settings.i18n || {};

      // Clear previous specific errors
      this.clearFieldError((_this$dom$categoriesS3 = this.dom.categoriesSelect) === null || _this$dom$categoriesS3 === void 0 ? void 0 : _this$dom$categoriesS3.next('.select2-container'));
      this.clearFieldError(this.dom.pricingMethodSelect);
      this.clearFieldError(this.dom.pricingSourceSelect);
      if (!categories || categories.length === 0) {
        var _this$dom$categoriesS4;
        this.showFieldError((_this$dom$categoriesS4 = this.dom.categoriesSelect) === null || _this$dom$categoriesS4 === void 0 ? void 0 : _this$dom$categoriesS4.next('.select2-container'), i18n.selectCategories || 'Please select categories.');
        isValid = false;
      }
      if (!pricingMethod) {
        this.showFieldError(this.dom.pricingMethodSelect, i18n.selectPricingMethod || 'Please select a pricing method.');
        isValid = false;
      }
      if (!pricingSource) {
        this.showFieldError(this.dom.pricingSourceSelect, i18n.selectPricingSource || 'Please select a pricing source.');
        isValid = false;
      }
      return isValid;
    }

    /**
     * Custom column population method for 'categories' column
     * @param {jQuery} $cell - The table cell element to populate
     * @param {object} itemData - The data for the current row
     */
  }, {
    key: "populateColumn_categories",
    value: function populateColumn_categories($cell, itemData) {
      $cell.text(itemData.category_names || 'N/A');
    }

    /**
     * Custom column population method for 'pricing_method' column
     * @param {jQuery} $cell - The table cell element to populate
     * @param {object} itemData - The data for the current row
     */
  }, {
    key: "populateColumn_pricing_method",
    value: function populateColumn_pricing_method($cell, itemData) {
      $cell.text(itemData.pricing_label || 'N/A');
    }
  }]);
}(_common_AdminTableManager__WEBPACK_IMPORTED_MODULE_7__["default"]); // Initialize the module when the DOM is ready and its main tab container exists.
jQuery(document).ready(function ($) {
  var mainTabId = 'pricing_rules'; // Specific to this module
  var localizedDataObjectName = 'pricingRulesSettings'; // Global settings object name

  if ($("#".concat(mainTabId)).length) {
    // Check if the global localized data for this module is available
    if (window[localizedDataObjectName]) {
      // Instantiate the module once
      if (!window.PricingRulesSettingsModuleInstance) {
        try {
          // Create a properly configured instance with the correct defaultSubTabId
          window.PricingRulesSettingsModuleInstance = new PricingRulesSettingsModule();
        } catch (error) {
          var errorLogger = (0,_utils__WEBPACK_IMPORTED_MODULE_6__.createLogger)('PricingRulesInit');
          errorLogger.error('Error instantiating PricingRulesSettingsModule:', error);
          // Use the global notice system if ProductEstimatorSettings is available
          if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
            window.ProductEstimatorSettingsInstance.showNotice('Failed to initialize Pricing Rules settings. Check console for errors.', 'error');
          }
        }
      }
    } else {
      var _errorLogger = (0,_utils__WEBPACK_IMPORTED_MODULE_6__.createLogger)('PricingRulesInit');
      _errorLogger.error("Localized data object \"".concat(localizedDataObjectName, "\" not found for tab: ").concat(mainTabId, ". Module cannot be initialized."));
      if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
        window.ProductEstimatorSettingsInstance.showNotice("Configuration data for Pricing Rules (\"".concat(localizedDataObjectName, "\") is missing. Module disabled."), 'error');
      }
    }
  } else {
    var warnLogger = (0,_utils__WEBPACK_IMPORTED_MODULE_6__.createLogger)('PricingRulesInit');
    warnLogger.warn("Main container #".concat(mainTabId, " not found. PricingRulesSettingsModule will not be initialized."));
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PricingRulesSettingsModule);

/***/ }),

/***/ "./src/js/admin/modules/ProductAdditionsSettingsModule.js":
/*!****************************************************************!*\
  !*** ./src/js/admin/modules/ProductAdditionsSettingsModule.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/get */ "./node_modules/@babel/runtime/helpers/esm/get.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/* harmony import */ var _common_AdminTableManager__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../common/AdminTableManager */ "./src/js/admin/common/AdminTableManager.js");






function _callSuper(t, o, e) { return o = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(o), (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__["default"])(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _superPropGet(t, o, e, r) { var p = (0,_babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_4__["default"])((0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
// File: admin/js/modules/ProductAdditionsSettingsModule.js

/**
 * Product Additions Settings JavaScript
 *
 * Handles functionality specific to the product additions settings tab.
 * Extends AdminTableManager for common table and form management.
 */
 // Import utilities needed for this module

 // Adjust path as needed
var ProductAdditionsSettingsModule = /*#__PURE__*/function (_AdminTableManager) {
  /**
   * Constructor for ProductAdditionsSettingsModule.
   */
  function ProductAdditionsSettingsModule() {
    var _this;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, ProductAdditionsSettingsModule);
    var config = {
      mainTabId: 'product_additions',
      localizedDataName: 'productAdditionsSettings'
      // AdminTableManager passes this to VerticalTabbedModule,
      // which passes relevant parts to ProductEstimatorSettings.
    };
    _this = _callSuper(this, ProductAdditionsSettingsModule, [config]); // Calls AdminTableManager constructor

    // We can access feature flags via this.settings.feature_flags
    // This is used in _handleRelationTypeChange to show/hide fields

    // this.logger is initialized by AdminTableManager.
    // this.settings (formerly this.localizedData in VTM/ATM context before PES refactor)
    // is populated by ProductEstimatorSettings via the super chain.
    // this.config from AdminTableManager holds the original config passed here.

    _this.productSearchTimeout = null;

    // Defer DOM-dependent specific initializations until the base AdminTableManager signals it's ready.
    // The event name uses this.config.mainTabId.
    // Note: this.config.mainTabId is from the config passed to super(), available after super() call.
    _this.$(document).on("admin_table_manager_ready_".concat(_this.config.mainTabId), function () {
      _this._cacheProductAdditionsDOM();
      _this._bindSpecificEvents();
      _this._initializeSelect2();
    });
    return _this;
  }

  /**
   * Cache DOM elements specific to Product Additions, beyond what AdminTableManager caches.
   * This is called after AdminTableManager's cacheDOM.
   * @private
   */
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__["default"])(ProductAdditionsSettingsModule, _AdminTableManager);
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(ProductAdditionsSettingsModule, [{
    key: "_cacheProductAdditionsDOM",
    value: function _cacheProductAdditionsDOM() {
      // this.dom is initialized by AdminTableManager. Add Product Additions specific elements.
      // Ensure selectors are defined in your localizedData (productAdditionsSettings)
      // e.g., productAdditionsSettings.selectors.relationTypeSelect
      if (this.settings && this.settings.selectors) {
        // this.settings is from ProductEstimatorSettings base
        var paSelectors = this.settings.selectors; // Assuming selectors are flat in this.settings
        this.dom.relationTypeSelect = this.$container.find(paSelectors.relationTypeSelect);
        this.dom.sourceCategorySelect = this.$container.find(paSelectors.sourceCategorySelect);
        this.dom.targetCategorySelect = this.$container.find(paSelectors.targetCategorySelect);
        this.dom.targetCategoryRow = this.$container.find(paSelectors.targetCategoryRow);
        this.dom.productSearchInput = this.$container.find(paSelectors.productSearchInput);
        this.dom.productSearchRow = this.$container.find(paSelectors.productSearchRow);
        this.dom.productSearchResults = this.$container.find(paSelectors.productSearchResults);
        this.dom.selectedProductIdInput = this.$container.find(paSelectors.selectedProductIdInput);
        this.dom.selectedProductDisplay = this.$container.find(paSelectors.selectedProductDisplay);
        this.dom.clearProductButton = this.$container.find(paSelectors.clearProductButton);
        this.dom.noteTextInput = this.$container.find(paSelectors.noteTextInput);
        this.dom.noteRow = this.$container.find(paSelectors.noteRow);

        // New fields for auto-add product sections
        this.dom.sectionTitleRow = this.$container.find('.section-title-row');
        this.dom.sectionDescriptionRow = this.$container.find('.section-description-row');
        this.dom.optionColorRows = this.$container.find('.option-color-row');
        this.dom.colorPickers = this.$container.find('.pe-color-picker');
      } else {
        this.logger.warn('ProductAdditionsSettingsModule: Settings or selectors not available for DOM caching');
      }
    }

    /**
     * Bind events specific to Product Additions.
     * This is called after the `admin_table_manager_ready` event.
     * @private
     */
  }, {
    key: "_bindSpecificEvents",
    value: function _bindSpecificEvents() {
      var _this$dom$relationTyp, _this$dom$targetCateg, _this$dom$productSear, _this$dom$clearProduc;
      // Ensure this.dom elements are available (cached by _cacheProductAdditionsDOM or base)
      if (!this.dom.form || !this.dom.form.length) {
        return;
      }
      this.dom.form.on('click.productAdditions', '.product-result-item', this._handleProductResultClick.bind(this));
      (_this$dom$relationTyp = this.dom.relationTypeSelect) === null || _this$dom$relationTyp === void 0 || _this$dom$relationTyp.on('change.productAdditions', this._handleRelationTypeChange.bind(this));
      (_this$dom$targetCateg = this.dom.targetCategorySelect) === null || _this$dom$targetCateg === void 0 || _this$dom$targetCateg.on('change.productAdditions', this._handleTargetCategoryChange.bind(this));
      (_this$dom$productSear = this.dom.productSearchInput) === null || _this$dom$productSear === void 0 || _this$dom$productSear.on('keyup.productAdditions', this._handleProductSearchKeyup.bind(this));
      (_this$dom$clearProduc = this.dom.clearProductButton) === null || _this$dom$clearProduc === void 0 || _this$dom$clearProduc.on('click.productAdditions', this._handleClearProduct.bind(this));
    }

    /**
     * Initialize Select2 components.
     * This is called after the `admin_table_manager_ready` event.
     * @private
     */
  }, {
    key: "_initializeSelect2",
    value: function _initializeSelect2() {
      this.initializeSelect2Dropdowns({
        elements: [{
          element: this.dom.sourceCategorySelect,
          placeholderKey: 'selectSourceCategories',
          fallbackText: 'Select source categories',
          name: 'source categories',
          config: {
            clearInitial: true
          }
        }, {
          element: this.dom.targetCategorySelect,
          placeholderKey: 'selectTargetCategory',
          fallbackText: 'Select a category',
          name: 'target category',
          config: {
            clearInitial: true
          }
        }],
        moduleName: 'Product Additions'
      });

      // Initialize color pickers
      this._initializeColorPickers();
    }

    /**
     * Initialize WordPress color pickers.
     * @private
     */
  }, {
    key: "_initializeColorPickers",
    value: function _initializeColorPickers() {
      var _this2 = this;
      if (this.dom.colorPickers && this.dom.colorPickers.length && this.$.fn.wpColorPicker) {
        this.dom.colorPickers.wpColorPicker({
          change: function change() {
            _this2.formModified = true; // Mark form as modified when color changes
          }
        });
      }
    }

    /**
     * Overridden from VerticalTabbedModule. Called when the "Product Additions" main tab is activated.
     */
  }, {
    key: "onMainTabActivated",
    value: function onMainTabActivated() {
      _superPropGet(ProductAdditionsSettingsModule, "onMainTabActivated", this, 3)([]); // Call parent method

      // Refresh Select2 components if they're already initialized
      if (this.dom.sourceCategorySelect && this.dom.sourceCategorySelect.hasClass("select2-hidden-accessible")) {
        this.refreshSelect2(this.dom.sourceCategorySelect);
      }
      if (this.dom.targetCategorySelect && this.dom.targetCategorySelect.hasClass("select2-hidden-accessible")) {
        this.refreshSelect2(this.dom.targetCategorySelect);
      }

      // The inherited VerticalTabbedModule.handleMainTabChanged calls setupVerticalTabs,
      // which correctly handles the sub_tab in the URL. No manual sub_tab clearing needed here.
    }

    /**
     * Handles changes in the relation type select dropdown.
     * Shows/hides appropriate fields based on the selected relation type.
     * @private
     */
  }, {
    key: "_handleRelationTypeChange",
    value: function _handleRelationTypeChange() {
      var _this$dom$relationTyp2, _this$dom$targetCateg2, _this$dom$productSear2, _this$dom$noteRow, _this$dom$sectionTitl, _this$dom$sectionDesc, _this$dom$optionColor, _this$dom$targetCateg3, _this$dom$noteTextInp;
      var actionType = (_this$dom$relationTyp2 = this.dom.relationTypeSelect) === null || _this$dom$relationTyp2 === void 0 ? void 0 : _this$dom$relationTyp2.val();

      // Check feature flags to determine UI behavior

      (_this$dom$targetCateg2 = this.dom.targetCategoryRow) === null || _this$dom$targetCateg2 === void 0 || _this$dom$targetCateg2.hide();
      (_this$dom$productSear2 = this.dom.productSearchRow) === null || _this$dom$productSear2 === void 0 || _this$dom$productSear2.hide();
      (_this$dom$noteRow = this.dom.noteRow) === null || _this$dom$noteRow === void 0 || _this$dom$noteRow.hide();
      (_this$dom$sectionTitl = this.dom.sectionTitleRow) === null || _this$dom$sectionTitl === void 0 || _this$dom$sectionTitl.hide();
      (_this$dom$sectionDesc = this.dom.sectionDescriptionRow) === null || _this$dom$sectionDesc === void 0 || _this$dom$sectionDesc.hide();
      (_this$dom$optionColor = this.dom.optionColorRows) === null || _this$dom$optionColor === void 0 || _this$dom$optionColor.hide();
      (_this$dom$targetCateg3 = this.dom.targetCategorySelect) === null || _this$dom$targetCateg3 === void 0 || _this$dom$targetCateg3.val(null).trigger('change.select2'); // Reset Select2
      this._clearProductSelectionFields();
      (_this$dom$noteTextInp = this.dom.noteTextInput) === null || _this$dom$noteTextInp === void 0 || _this$dom$noteTextInp.val('');
      if (actionType === 'auto_add_by_category') {
        var _this$dom$targetCateg4, _this$dom$sectionTitl2, _this$dom$sectionDesc2, _this$dom$optionColor2;
        (_this$dom$targetCateg4 = this.dom.targetCategoryRow) === null || _this$dom$targetCateg4 === void 0 || _this$dom$targetCateg4.show();
        (_this$dom$sectionTitl2 = this.dom.sectionTitleRow) === null || _this$dom$sectionTitl2 === void 0 || _this$dom$sectionTitl2.show();
        (_this$dom$sectionDesc2 = this.dom.sectionDescriptionRow) === null || _this$dom$sectionDesc2 === void 0 || _this$dom$sectionDesc2.show();
        (_this$dom$optionColor2 = this.dom.optionColorRows) === null || _this$dom$optionColor2 === void 0 || _this$dom$optionColor2.show();
      } else if (actionType === 'auto_add_note_by_category') {
        var _this$dom$noteRow2;
        (_this$dom$noteRow2 = this.dom.noteRow) === null || _this$dom$noteRow2 === void 0 || _this$dom$noteRow2.show();
      } else if (actionType === 'suggest_products_by_category') {
        // Only show target category row if feature is enabled
        if (this.settings.feature_flags && this.settings.feature_flags.suggested_products_enabled) {
          var _this$dom$targetCateg5;
          (_this$dom$targetCateg5 = this.dom.targetCategoryRow) === null || _this$dom$targetCateg5 === void 0 || _this$dom$targetCateg5.show();
        } else {
          this.logger.warn('ProductAdditionsSettingsModule: Suggested products feature is disabled in feature flags');
        }
      }
    }

    /**
     * Handles changes in the target category select dropdown.
     * Shows/hides product search field based on the selected category and relation type.
     * @private
     */
  }, {
    key: "_handleTargetCategoryChange",
    value: function _handleTargetCategoryChange() {
      var _this$dom$targetCateg6, _this$dom$relationTyp3;
      var categoryId = (_this$dom$targetCateg6 = this.dom.targetCategorySelect) === null || _this$dom$targetCateg6 === void 0 ? void 0 : _this$dom$targetCateg6.val();
      var actionType = (_this$dom$relationTyp3 = this.dom.relationTypeSelect) === null || _this$dom$relationTyp3 === void 0 ? void 0 : _this$dom$relationTyp3.val();
      this._clearProductSelectionFields(); // Clear previous product search/selection
      if (categoryId && actionType === 'auto_add_by_category') {
        var _this$dom$productSear3;
        (_this$dom$productSear3 = this.dom.productSearchRow) === null || _this$dom$productSear3 === void 0 || _this$dom$productSear3.show();
      } else {
        var _this$dom$productSear4;
        (_this$dom$productSear4 = this.dom.productSearchRow) === null || _this$dom$productSear4 === void 0 || _this$dom$productSear4.hide();
      }
    }

    /**
     * Clears all product selection related fields.
     * @private
     */
  }, {
    key: "_clearProductSelectionFields",
    value: function _clearProductSelectionFields() {
      var _this$dom$productSear5, _this$dom$productSear6, _this$dom$selectedPro, _this$dom$selectedPro2;
      (_this$dom$productSear5 = this.dom.productSearchInput) === null || _this$dom$productSear5 === void 0 || _this$dom$productSear5.val('');
      (_this$dom$productSear6 = this.dom.productSearchResults) === null || _this$dom$productSear6 === void 0 || _this$dom$productSear6.empty().hide();
      (_this$dom$selectedPro = this.dom.selectedProductIdInput) === null || _this$dom$selectedPro === void 0 || _this$dom$selectedPro.val('');
      (_this$dom$selectedPro2 = this.dom.selectedProductDisplay) === null || _this$dom$selectedPro2 === void 0 || _this$dom$selectedPro2.hide().find('.selected-product-info').empty();
    }

    /**
     * Handles keyup events in the product search input field.
     * Triggers product search after debounce period.
     * @param {Event} e - The keyup event
     * @private
     */
  }, {
    key: "_handleProductSearchKeyup",
    value: function _handleProductSearchKeyup(e) {
      var _this$$$val,
        _this$dom$targetCateg7,
        _this$dom$productSear8,
        _this3 = this;
      var searchTerm = ((_this$$$val = this.$(e.target).val()) === null || _this$$$val === void 0 ? void 0 : _this$$$val.trim()) || '';
      var categoryId = (_this$dom$targetCateg7 = this.dom.targetCategorySelect) === null || _this$dom$targetCateg7 === void 0 ? void 0 : _this$dom$targetCateg7.val();
      clearTimeout(this.productSearchTimeout);
      if (searchTerm.length < 3 || !categoryId) {
        var _this$dom$productSear7;
        (_this$dom$productSear7 = this.dom.productSearchResults) === null || _this$dom$productSear7 === void 0 || _this$dom$productSear7.empty().hide();
        return;
      }
      // this.settings.i18n from ProductEstimatorSettings base
      (_this$dom$productSear8 = this.dom.productSearchResults) === null || _this$dom$productSear8 === void 0 || _this$dom$productSear8.html("<p>".concat(this.settings.i18n && this.settings.i18n.searching || 'Searching...', "</p>")).show();
      this.productSearchTimeout = setTimeout(function () {
        _this3._searchProducts(searchTerm, categoryId);
      }, 500); // Debounce
    }

    /**
     * Searches for products based on search term and category.
     * Displays results in the product search results container.
     * @param {string} searchTerm - The search term to filter products by
     * @param {string|number} categoryId - The category ID to filter products by
     * @private
     */
  }, {
    key: "_searchProducts",
    value: function _searchProducts(searchTerm, categoryId) {
      var _this4 = this;
      // this.settings.actions and other properties from ProductEstimatorSettings base
      if (!this.settings.actions || !this.settings.actions.search_products) {
        var _this$dom$productSear9;
        (_this$dom$productSear9 = this.dom.productSearchResults) === null || _this$dom$productSear9 === void 0 || _this$dom$productSear9.html("<p>".concat(this.settings.i18n && this.settings.i18n.errorSearching || 'Error: Search action not configured.', "</p>")).show();
        return;
      }
      _utils__WEBPACK_IMPORTED_MODULE_6__.ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: {
          action: this.settings.actions.search_products,
          nonce: this.settings.nonce,
          search: searchTerm,
          category: categoryId
        }
      }).then(function (response) {
        var productsArray = null;
        // Standardize response checking
        if (response && response.success && response.data && Array.isArray(response.data.products)) {
          productsArray = response.data.products;
        } else if (response && Array.isArray(response.products)) {
          // Fallback for older direct array
          productsArray = response.products;
        }
        if (productsArray) {
          var _this4$dom$productSea;
          var resultsHtml = '';
          if (productsArray.length > 0) {
            resultsHtml = '<ul class="product-results-list">';
            productsArray.forEach(function (product) {
              // Basic escaping for display
              var escapedName = _this4.$('<div>').text(product.name || '').html();
              resultsHtml += "<li class=\"product-result-item\" data-id=\"".concat(product.id, "\" data-name=\"").concat(escapedName, "\">").concat(escapedName || 'Unnamed Product', " (ID: ").concat(product.id, ")</li>");
            });
            resultsHtml += '</ul>';
          } else {
            resultsHtml = "<p>".concat(_this4.settings.i18n && _this4.settings.i18n.noProductsFound || 'No products found', "</p>");
          }
          (_this4$dom$productSea = _this4.dom.productSearchResults) === null || _this4$dom$productSea === void 0 || _this4$dom$productSea.html(resultsHtml).show();
        } else {
          var _this4$dom$productSea2;
          (_this4$dom$productSea2 = _this4.dom.productSearchResults) === null || _this4$dom$productSea2 === void 0 || _this4$dom$productSea2.html("<p>".concat(_this4.settings.i18n && _this4.settings.i18n.errorSearching || 'Error searching products', "</p>")).show();
        }
      })["catch"](function () {
        var _this4$dom$productSea3;
        (_this4$dom$productSea3 = _this4.dom.productSearchResults) === null || _this4$dom$productSea3 === void 0 || _this4$dom$productSea3.html("<p>".concat(_this4.settings.i18n && _this4.settings.i18n.errorSearching || 'Error searching products', "</p>")).show();
      });
    }

    /**
     * Handles clicks on product search results.
     * Sets the selected product ID and displays product information.
     * @param {Event} e - The click event
     * @private
     */
  }, {
    key: "_handleProductResultClick",
    value: function _handleProductResultClick(e) {
      var _this$dom$selectedPro3, _this$dom$selectedPro4, _this$dom$selectedPro5, _this$dom$productSear0, _this$dom$productSear1;
      var $item = this.$(e.currentTarget);
      var productId = $item.data('id');
      var productName = $item.data('name'); // Already escaped if set by _searchProducts

      (_this$dom$selectedPro3 = this.dom.selectedProductIdInput) === null || _this$dom$selectedPro3 === void 0 || _this$dom$selectedPro3.val(productId);
      (_this$dom$selectedPro4 = this.dom.selectedProductDisplay) === null || _this$dom$selectedPro4 === void 0 || _this$dom$selectedPro4.find('.selected-product-info').html("<strong>".concat(productName, "</strong> (ID: ").concat(productId, ")"));
      (_this$dom$selectedPro5 = this.dom.selectedProductDisplay) === null || _this$dom$selectedPro5 === void 0 || _this$dom$selectedPro5.show();
      (_this$dom$productSear0 = this.dom.productSearchInput) === null || _this$dom$productSear0 === void 0 || _this$dom$productSear0.val(''); // Clear search input
      (_this$dom$productSear1 = this.dom.productSearchResults) === null || _this$dom$productSear1 === void 0 || _this$dom$productSear1.empty().hide(); // Hide results
      this.formModified = true; // Mark form as modified, inherited from AdminTableManager
    }

    /**
     * Handles clicks on the clear product button.
     * Clears product selection fields and sets focus to search input.
     * @private
     */
  }, {
    key: "_handleClearProduct",
    value: function _handleClearProduct() {
      var _this$dom$productSear10;
      this._clearProductSelectionFields();
      (_this$dom$productSear10 = this.dom.productSearchInput) === null || _this$dom$productSear10 === void 0 || _this$dom$productSear10.focus();
      this.formModified = true; // Mark form as modified
    }

    /**
     * Override AdminTableManager.resetForm to include Product Additions specific fields.
     * @override
     */
  }, {
    key: "resetForm",
    value: function resetForm() {
      var _this$dom$relationTyp4, _this$dom$sourceCateg, _this$dom$noteTextInp2, _this$dom$targetCateg8, _this$dom$productSear11, _this$dom$noteRow3, _this$dom$sectionTitl3, _this$dom$sectionDesc3, _this$dom$optionColor3;
      _superPropGet(ProductAdditionsSettingsModule, "resetForm", this, 3)([]); // Call base class method first

      // Reset Product Additions specific fields
      (_this$dom$relationTyp4 = this.dom.relationTypeSelect) === null || _this$dom$relationTyp4 === void 0 || _this$dom$relationTyp4.val('').trigger('change.productAdditions'); // Triggers _handleRelationTypeChange
      (_this$dom$sourceCateg = this.dom.sourceCategorySelect) === null || _this$dom$sourceCateg === void 0 || _this$dom$sourceCateg.val(null).trigger('change.select2'); // Clear Select2
      // Target category and product search fields are typically handled by _handleRelationTypeChange
      this._clearProductSelectionFields(); // Explicitly clear product fields
      (_this$dom$noteTextInp2 = this.dom.noteTextInput) === null || _this$dom$noteTextInp2 === void 0 || _this$dom$noteTextInp2.val('');

      // Clear new fields
      this.$container.find('#section_title').val('');
      this.$container.find('#section_description').val('');

      // Reset color pickers to default
      for (var i = 1; i <= 5; i++) {
        var colourKey = "option_colour_".concat(i);
        this.$container.find("#".concat(colourKey)).val('#000000');
        // Reset color picker if it exists
        if (this.$.fn.wpColorPicker) {
          this.$container.find("#".concat(colourKey)).wpColorPicker('color', '#000000');
        }
      }

      // Ensure dependent rows are hidden according to the reset relationType
      (_this$dom$targetCateg8 = this.dom.targetCategoryRow) === null || _this$dom$targetCateg8 === void 0 || _this$dom$targetCateg8.hide();
      (_this$dom$productSear11 = this.dom.productSearchRow) === null || _this$dom$productSear11 === void 0 || _this$dom$productSear11.hide();
      (_this$dom$noteRow3 = this.dom.noteRow) === null || _this$dom$noteRow3 === void 0 || _this$dom$noteRow3.hide();
      (_this$dom$sectionTitl3 = this.dom.sectionTitleRow) === null || _this$dom$sectionTitl3 === void 0 || _this$dom$sectionTitl3.hide();
      (_this$dom$sectionDesc3 = this.dom.sectionDescriptionRow) === null || _this$dom$sectionDesc3 === void 0 || _this$dom$sectionDesc3.hide();
      (_this$dom$optionColor3 = this.dom.optionColorRows) === null || _this$dom$optionColor3 === void 0 || _this$dom$optionColor3.hide();
    }

    /**
     * Override AdminTableManager.populateFormWithData for Product Additions specific fields.
     * @param {object} itemData - The data for the product addition item to populate the form with
     * @override
     */
  }, {
    key: "populateFormWithData",
    value: function populateFormWithData(itemData) {
      var _this$dom$relationTyp5,
        _this5 = this;
      _superPropGet(ProductAdditionsSettingsModule, "populateFormWithData", this, 3)([itemData]); // Sets item ID, calls base logic

      var relationType = itemData.relation_type || '';
      var sourceCategories = itemData.source_category || []; // Expecting array for multi-select
      var targetCategory = itemData.target_category || '';
      var productId = itemData.product_id || '';
      var noteText = itemData.note_text || '';

      // Set relation type first, as it might control visibility of other fields
      (_this$dom$relationTyp5 = this.dom.relationTypeSelect) === null || _this$dom$relationTyp5 === void 0 || _this$dom$relationTyp5.val(relationType).trigger('change.productAdditions');

      // Use setTimeout to allow dependent field visibility changes from 'change.productAdditions' to complete
      setTimeout(function () {
        var _this5$dom$sourceCate;
        (_this5$dom$sourceCate = _this5.dom.sourceCategorySelect) === null || _this5$dom$sourceCate === void 0 || _this5$dom$sourceCate.val(sourceCategories).trigger('change.select2');
        if (relationType === 'auto_add_by_category') {
          var _this5$dom$targetCate;
          (_this5$dom$targetCate = _this5.dom.targetCategorySelect) === null || _this5$dom$targetCate === void 0 || _this5$dom$targetCate.val(targetCategory).trigger('change.select2');
          if (productId && itemData.product_name) {
            var _this5$dom$selectedPr, _this5$dom$selectedPr2, _this5$dom$selectedPr3;
            (_this5$dom$selectedPr = _this5.dom.selectedProductIdInput) === null || _this5$dom$selectedPr === void 0 || _this5$dom$selectedPr.val(productId);
            // Ensure productName is properly escaped if it comes directly from itemData and hasn't been
            var escapedProductName = _this5.$('<div>').text(itemData.product_name).html();
            (_this5$dom$selectedPr2 = _this5.dom.selectedProductDisplay) === null || _this5$dom$selectedPr2 === void 0 || _this5$dom$selectedPr2.find('.selected-product-info').html("<strong>".concat(escapedProductName, "</strong> (ID: ").concat(productId, ")"));
            (_this5$dom$selectedPr3 = _this5.dom.selectedProductDisplay) === null || _this5$dom$selectedPr3 === void 0 || _this5$dom$selectedPr3.show();
          } else if (productId) {
            var _this5$dom$selectedPr4, _this5$dom$selectedPr5, _this5$dom$selectedPr6;
            // Fallback if product_name is missing
            (_this5$dom$selectedPr4 = _this5.dom.selectedProductIdInput) === null || _this5$dom$selectedPr4 === void 0 || _this5$dom$selectedPr4.val(productId);
            (_this5$dom$selectedPr5 = _this5.dom.selectedProductDisplay) === null || _this5$dom$selectedPr5 === void 0 || _this5$dom$selectedPr5.find('.selected-product-info').html("Product ID: ".concat(productId, " (Name not available)"));
            (_this5$dom$selectedPr6 = _this5.dom.selectedProductDisplay) === null || _this5$dom$selectedPr6 === void 0 || _this5$dom$selectedPr6.show();
          }

          // Populate new fields for auto-add product sections
          if (itemData.section_title) {
            _this5.$container.find('#section_title').val(itemData.section_title);
          }
          if (itemData.section_description) {
            _this5.$container.find('#section_description').val(itemData.section_description);
          }

          // Populate color fields
          for (var i = 1; i <= 5; i++) {
            var colourKey = "option_colour_".concat(i);
            if (itemData[colourKey]) {
              _this5.$container.find("#".concat(colourKey)).val(itemData[colourKey]);
              // Update color picker preview if it exists
              _this5.$container.find("#".concat(colourKey)).wpColorPicker('color', itemData[colourKey]);
            }
          }
        } else if (relationType === 'suggest_products_by_category') {
          if (_this5.settings.feature_flags && _this5.settings.feature_flags.suggested_products_enabled) {
            var _this5$dom$targetCate2;
            (_this5$dom$targetCate2 = _this5.dom.targetCategorySelect) === null || _this5$dom$targetCate2 === void 0 || _this5$dom$targetCate2.val(targetCategory).trigger('change.select2');
          }
        } else if (relationType === 'auto_add_note_by_category') {
          var _this5$dom$noteTextIn;
          (_this5$dom$noteTextIn = _this5.dom.noteTextInput) === null || _this5$dom$noteTextIn === void 0 || _this5$dom$noteTextIn.val(noteText);
        }
        _this5.formModified = false; // Reset modified flag after populating
      }, 150); // Small delay
    }

    /**
     * Override AdminTableManager.validateForm for Product Additions specific validation.
     * @returns {boolean} True if the form passes validation, false otherwise
     * @override
     */
  }, {
    key: "validateForm",
    value: function validateForm() {
      var _this$dom$relationTyp6, _this$dom$sourceCateg2, _this$dom$targetCateg9, _this$dom$selectedPro6, _this$dom$noteTextInp3, _this$dom$sourceCateg3, _this$dom$targetCateg0;
      var isValid = _superPropGet(ProductAdditionsSettingsModule, "validateForm", this, 3)([]); // Perform base validation first

      // Get values
      var actionType = (_this$dom$relationTyp6 = this.dom.relationTypeSelect) === null || _this$dom$relationTyp6 === void 0 ? void 0 : _this$dom$relationTyp6.val();
      var sourceCategories = (_this$dom$sourceCateg2 = this.dom.sourceCategorySelect) === null || _this$dom$sourceCateg2 === void 0 ? void 0 : _this$dom$sourceCateg2.val(); // Returns array for multi-select
      var targetCategory = (_this$dom$targetCateg9 = this.dom.targetCategorySelect) === null || _this$dom$targetCateg9 === void 0 ? void 0 : _this$dom$targetCateg9.val();
      var productId = (_this$dom$selectedPro6 = this.dom.selectedProductIdInput) === null || _this$dom$selectedPro6 === void 0 ? void 0 : _this$dom$selectedPro6.val();
      var noteText = ((_this$dom$noteTextInp3 = this.dom.noteTextInput) === null || _this$dom$noteTextInp3 === void 0 || (_this$dom$noteTextInp3 = _this$dom$noteTextInp3.val()) === null || _this$dom$noteTextInp3 === void 0 ? void 0 : _this$dom$noteTextInp3.trim()) || '';

      // i18n messages from this.settings.i18n
      var i18n = this.settings.i18n || {};

      // Clear previous specific errors (showFieldError/clearFieldError are inherited)
      this.clearFieldError(this.dom.relationTypeSelect);
      this.clearFieldError((_this$dom$sourceCateg3 = this.dom.sourceCategorySelect) === null || _this$dom$sourceCateg3 === void 0 ? void 0 : _this$dom$sourceCateg3.next('.select2-container')); // Target Select2 container for error
      this.clearFieldError((_this$dom$targetCateg0 = this.dom.targetCategorySelect) === null || _this$dom$targetCateg0 === void 0 ? void 0 : _this$dom$targetCateg0.next('.select2-container'));
      this.clearFieldError(this.dom.productSearchInput); // Or selectedProductDisplay
      this.clearFieldError(this.dom.noteTextInput);
      if (!actionType) {
        this.showFieldError(this.dom.relationTypeSelect, i18n.selectAction || 'Please select an action type.');
        isValid = false;
      }
      if (!sourceCategories || sourceCategories.length === 0) {
        var _this$dom$sourceCateg4;
        this.showFieldError((_this$dom$sourceCateg4 = this.dom.sourceCategorySelect) === null || _this$dom$sourceCateg4 === void 0 ? void 0 : _this$dom$sourceCateg4.next('.select2-container'), i18n.selectSourceCategories || 'Please select source categories.');
        isValid = false;
      }
      if (actionType === 'auto_add_by_category') {
        if (!targetCategory) {
          var _this$dom$targetCateg1;
          this.showFieldError((_this$dom$targetCateg1 = this.dom.targetCategorySelect) === null || _this$dom$targetCateg1 === void 0 ? void 0 : _this$dom$targetCateg1.next('.select2-container'), i18n.selectTargetCategory || 'Please select a target category.');
          isValid = false;
        }
        if (!productId) {
          var _this$dom$selectedPro7;
          // Show error near search input or the display area if visible
          var $productErrorTarget = (_this$dom$selectedPro7 = this.dom.selectedProductDisplay) !== null && _this$dom$selectedPro7 !== void 0 && _this$dom$selectedPro7.is(':visible') ? this.dom.selectedProductDisplay : this.dom.productSearchInput;
          this.showFieldError($productErrorTarget, i18n.selectProduct || 'Please select a product.');
          isValid = false;
        }
      } else if (actionType === 'suggest_products_by_category') {
        if (this.settings.feature_flags && this.settings.feature_flags.suggested_products_enabled) {
          if (!targetCategory) {
            var _this$dom$targetCateg10;
            this.showFieldError((_this$dom$targetCateg10 = this.dom.targetCategorySelect) === null || _this$dom$targetCateg10 === void 0 ? void 0 : _this$dom$targetCateg10.next('.select2-container'), i18n.selectTargetCategory || 'Please select a target category.');
            isValid = false;
          }
        }
      } else if (actionType === 'auto_add_note_by_category') {
        if (!noteText) {
          this.showFieldError(this.dom.noteTextInput, i18n.noteTextRequired || 'Note text is required.');
          isValid = false;
        }
      }
      return isValid;
    }

    /**
     * Custom column population method for 'source_categories' column
     * This method follows the naming convention for column handlers in AdminTableManager
     * @param {jQuery} $cell - The table cell element to populate
     * @param {object} itemData - The data for the current row
     */
  }, {
    key: "populateColumn_source_categories",
    value: function populateColumn_source_categories($cell, itemData) {
      $cell.text(itemData.source_category_display || 'N/A');
    }

    /**
     * Custom column population method for 'action_type' column
     * @param {jQuery} $cell - The table cell element to populate
     * @param {object} itemData - The data for the current row
     */
  }, {
    key: "populateColumn_action_type",
    value: function populateColumn_action_type($cell, itemData) {
      var $actionTypeSpan = this.$('<span></span>').addClass("relation-type pe-relation-".concat(itemData.relation_type || 'unknown')).text(itemData.action_type_display || itemData.relation_type || 'N/A');
      $cell.append($actionTypeSpan);
    }

    /**
     * Custom column population method for 'target_details' column
     * @param {jQuery} $cell - The table cell element to populate
     * @param {object} itemData - The data for the current row
     */
  }, {
    key: "populateColumn_target_details",
    value: function populateColumn_target_details($cell, itemData) {
      $cell.text(itemData.target_details_display || 'N/A');
    }

    /**
     * Binds event handlers for custom action buttons.
     * This overrides the base AdminTableManager.bindCustomActionButtons method.
     * @override
     */
  }, {
    key: "bindCustomActionButtons",
    value: function bindCustomActionButtons() {
      if (this.dom.listTableBody && this.dom.listTableBody.length) {
        // Bind the view product button click event
        this.dom.listTableBody.on('click.productAdditions', '.pe-view-product-button', this.handleViewProduct.bind(this));
      }
    }

    /**
     * Handles clicks on the "View Product" button.
     * @param {Event} e - The click event
     */
  }, {
    key: "handleViewProduct",
    value: function handleViewProduct(e) {
      e.preventDefault();
      var $button = this.$(e.currentTarget);
      var productId = $button.data('product-id');
      if (!productId) {
        this.showNotice('Error: Could not determine the product to view.', 'error');
        return;
      }

      // Open the product in a new window/tab
      // This could be a link to the WordPress admin edit page for the product
      var adminUrl = window.ajaxurl ? window.ajaxurl.replace('admin-ajax.php', '') : '/wp-admin/';
      var productUrl = "".concat(adminUrl, "post.php?post=").concat(productId, "&action=edit");
      window.open(productUrl, '_blank');
    }
  }]);
}(_common_AdminTableManager__WEBPACK_IMPORTED_MODULE_7__["default"]); // Initialize the module when the DOM is ready and its main tab container exists.
jQuery(document).ready(function ($) {
  var mainTabId = 'product_additions'; // Specific to this module
  var localizedDataObjectName = 'productAdditionsSettings'; // Global settings object name

  if ($("#".concat(mainTabId)).length) {
    // Check if the global localized data for this module is available
    if (window[localizedDataObjectName]) {
      // Instantiate the module once
      if (!window.ProductAdditionsSettingsModuleInstance) {
        try {
          window.ProductAdditionsSettingsModuleInstance = new ProductAdditionsSettingsModule();
          (0,_utils__WEBPACK_IMPORTED_MODULE_6__.createLogger)('ProductAdditionsInit').log('ProductAdditionsSettingsModule instance initiated.');
        } catch (error) {
          (0,_utils__WEBPACK_IMPORTED_MODULE_6__.createLogger)('ProductAdditionsInit').error('Error instantiating ProductAdditionsSettingsModule:', error);
          // Use the global notice system if ProductEstimatorSettings is available
          if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
            window.ProductEstimatorSettingsInstance.showNotice('Failed to initialize Product Additions settings. Check console for errors.', 'error');
          }
        }
      }
    } else {
      (0,_utils__WEBPACK_IMPORTED_MODULE_6__.createLogger)('ProductAdditionsInit').error("Localized data object \"".concat(localizedDataObjectName, "\" not found for tab: ").concat(mainTabId, ". Module cannot be initialized."));
      if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
        window.ProductEstimatorSettingsInstance.showNotice("Configuration data for Product Additions (\"".concat(localizedDataObjectName, "\") is missing. Module disabled."), 'error');
      }
    }
    // The module's inherited `handleMainTabChanged` (from VerticalTabbedModule)
    // will manage activation/deactivation logic, including calling `onMainTabActivated`.
    // No separate `product_estimator_tab_changed` listener is needed here for re-initialization
    // or for clearing `sub_tab` from URL, as `VerticalTabbedModule.showVerticalTab` handles URL state.
  } else {
    (0,_utils__WEBPACK_IMPORTED_MODULE_6__.createLogger)('ProductAdditionsInit').warn("Main container #".concat(mainTabId, " not found. ProductAdditionsSettingsModule will not be initialized."));
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProductAdditionsSettingsModule);

/***/ }),

/***/ "./src/js/admin/modules/SimilarProductsSettingsModule.js":
/*!***************************************************************!*\
  !*** ./src/js/admin/modules/SimilarProductsSettingsModule.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/get */ "./node_modules/@babel/runtime/helpers/esm/get.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @utils */ "./src/js/utils/index.js");
/* harmony import */ var _common_AdminTableManager__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../common/AdminTableManager */ "./src/js/admin/common/AdminTableManager.js");






function _callSuper(t, o, e) { return o = (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(o), (0,_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_2__["default"])(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _superPropGet(t, o, e, r) { var p = (0,_babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_4__["default"])((0,_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_3__["default"])(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
/**
 * Similar Products Settings Module (Class-based)
 *
 * Handles functionality for the similar products settings tab in the admin area.
 */
 // Import utilities needed for this module

 // Adjust path as needed
var SimilarProductsSettingsModule = /*#__PURE__*/function (_AdminTableManager) {
  /**
   * Constructor for SimilarProductsSettingsModule
   */
  function SimilarProductsSettingsModule() {
    var _this;
    (0,_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, SimilarProductsSettingsModule);
    var config = {
      mainTabId: 'similar_products',
      localizedDataName: 'similarProductsSettings'
      // AdminTableManager passes this to VerticalTabbedModule,
      // which passes relevant parts to ProductEstimatorSettings.
    };
    _this = _callSuper(this, SimilarProductsSettingsModule, [config]); // Calls AdminTableManager constructor

    _this.$(document).on("admin_table_manager_ready_".concat(_this.config.mainTabId), function () {
      // POTENTIAL ERROR HERE
      _this._cacheSimilarProductsDOM();
      _this._bindSpecificEvents();
      _this._initializeSelect2();
    });
    return _this;
  }

  /**
   * Cache DOM elements specific to Similar Products, beyond what AdminTableManager caches.
   * This is called after AdminTableManager's cacheDOM.
   * @private
   */
  (0,_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_5__["default"])(SimilarProductsSettingsModule, _AdminTableManager);
  return (0,_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(SimilarProductsSettingsModule, [{
    key: "_cacheSimilarProductsDOM",
    value: function _cacheSimilarProductsDOM() {
      // this.dom is initialized by AdminTableManager. Add Similar Products specific elements.
      if (this.settings && this.settings.selectors) {
        // this.settings is from ProductEstimatorSettings base
        var selectors = this.settings.selectors;
        this.dom.sourceCategoriesSelect = this.$container.find(selectors.sourceCategoriesSelect);
        this.dom.attributesContainer = this.$container.find(selectors.attributesContainer);
        this.dom.attributesList = this.$container.find(selectors.attributesList);
        this.dom.attributesLoading = this.$container.find(selectors.attributesLoading);
        this.dom.selectedAttributesInput = this.$container.find(selectors.selectedAttributesInput);
      } else {
        (0,_utils__WEBPACK_IMPORTED_MODULE_6__.createLogger)('SimilarProductsModule').warn('SimilarProductsSettingsModule: settings or selectors not available for DOM caching');
      }
    }

    /**
     * Bind core event handlers
     */
  }, {
    key: "_bindSpecificEvents",
    value: function _bindSpecificEvents() {
      var _this$dom$sourceCateg;
      if (!this.dom.form || !this.dom.form.length) {
        return;
      }
      (_this$dom$sourceCateg = this.dom.sourceCategoriesSelect) === null || _this$dom$sourceCateg === void 0 || _this$dom$sourceCateg.on('change.SimilarProducts', this._handleSourceCategoriesChange.bind(this));
    }

    /**
     * Initialize Select2 components.
     * This is called after the `admin_table_manager_ready` event.
     * Using the base class Select2 initialization methods.
     * @private
     */
  }, {
    key: "_initializeSelect2",
    value: function _initializeSelect2() {
      // Use the base class initializeSelect2Dropdowns method with our specific configuration
      this.initializeSelect2Dropdowns({
        elements: [{
          element: this.dom.sourceCategoriesSelect,
          placeholderKey: 'selectCategoryError',
          fallbackText: 'Select source categories',
          name: 'source categories',
          config: {
            clearInitial: true
          }
        }],
        // Settings and i18n are automatically provided by the base method
        moduleName: 'Similar Products'
      });
    }

    /**
     * Overridden from VerticalTabbedModule. Called when the "Product Additions" main tab is activated.
     */
  }, {
    key: "onMainTabActivated",
    value: function onMainTabActivated() {
      _superPropGet(SimilarProductsSettingsModule, "onMainTabActivated", this, 3)([]); // Call parent method
      // Specific actions for Product Additions when its tab is shown.
      // For example, if Select2 or other components need re-initialization or refresh when tab becomes visible.
      // The `admin_table_manager_ready` event handles initial setup. This is for subsequent activations.
      // If Select2 was initialized while hidden, it might need a refresh.
      if (this.dom.sourceCategoriesSelect && this.dom.sourceCategoriesSelect.hasClass("select2-hidden-accessible")) {
        // this.dom.sourceCategorySelect.select2('destroy').select2({...}); // Full re-init
        // Or just trigger a resize/redraw if that helps.
      }
      // The inherited VerticalTabbedModule.handleMainTabChanged calls setupVerticalTabs,
      // which correctly handles the sub_tab in the URL. No manual sub_tab clearing needed here.
    }
  }, {
    key: "_handleSourceCategoriesChange",
    value: function _handleSourceCategoriesChange() {
      var _this$dom$sourceCateg2;
      var categoryIds = (_this$dom$sourceCateg2 = this.dom.sourceCategoriesSelect) === null || _this$dom$sourceCateg2 === void 0 ? void 0 : _this$dom$sourceCateg2.val();
      if (categoryIds && categoryIds.length > 0) {
        this._fetchAttributesForCategories(categoryIds);
      } else {
        this._updateAttributeSelectionField([], []);
      }
    }
  }, {
    key: "_updateAttributeSelectionField",
    value: function _updateAttributeSelectionField(attributes) {
      var selectedAttributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      // Clear previous content
      this.dom.attributesList.empty();
      if (!attributes || attributes.length === 0) {
        // Show loading message if no attributes passed
        this.dom.attributesLoading.show();
        this.dom.attributesList.hide();
        return;
      }

      // Hide loading, show attributes list
      this.dom.attributesLoading.hide();
      this.dom.attributesList.show();

      // Convert selectedAttributes to array if needed
      if (typeof selectedAttributes === 'string') {
        selectedAttributes = selectedAttributes.split(',').filter(Boolean);
      }

      // Create checkbox for each attribute
      var attributesHtml = attributes.map(function (attr) {
        var isChecked = selectedAttributes.includes(attr.name) ? 'checked' : '';
        return "\n        <div class=\"attribute-item\">\n          <label>\n            <input type=\"checkbox\"\n                   name=\"attribute_checkbox[]\"\n                   value=\"".concat(attr.name, "\"\n                   data-label=\"").concat(attr.label, "\"\n                   ").concat(isChecked, ">\n            ").concat(attr.label, "\n          </label>\n        </div>");
      }).join('');

      // Add to the DOM and bind events
      this.dom.attributesList.html(attributesHtml);

      // Bind change event to update the hidden input
      this.dom.attributesList.find('input[type="checkbox"]').on('change', this._handleAttributeCheckboxChange.bind(this));

      // Update hidden input with currently selected attributes
      this._updateSelectedAttributesInput();
    }
  }, {
    key: "_fetchAttributesForCategories",
    value: function _fetchAttributesForCategories(categoryIds) {
      var _this2 = this;
      var selectedAttributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      if (!this.settings.actions || !this.settings.actions.get_attributes) {
        return;
      }

      // Show loading indicator
      this.dom.attributesLoading.text(this.settings.i18n.loadingAttributes || 'Loading attributes...');
      this.dom.attributesLoading.show();
      this.dom.attributesList.hide();

      // Get currently selected attributes - either from parameter or from the input field
      var currentlySelectedAttributes = selectedAttributes || this.dom.selectedAttributesInput.val().split(',').filter(Boolean);
      _utils__WEBPACK_IMPORTED_MODULE_6__.ajax.ajaxRequest({
        url: this.settings.ajaxUrl,
        data: {
          action: this.settings.actions.get_attributes,
          nonce: this.settings.nonce,
          category_ids: categoryIds
        }
      }).then(function (response) {
        var attributesArray = null;

        // Standardize response checking
        if (response && response.success && response.data && Array.isArray(response.data.attributes)) {
          attributesArray = response.data.attributes;
        } else if (response && Array.isArray(response.attributes)) {
          // Fallback for older direct array
          attributesArray = response.attributes;
        }
        if (attributesArray) {
          if (attributesArray.length > 0) {
            _this2._updateAttributeSelectionField(attributesArray, currentlySelectedAttributes);
          } else {
            _this2.dom.attributesLoading.text(_this2.settings.i18n.noAttributes || 'No product attributes found for these categories.');
            _this2.dom.attributesList.hide();
          }
        } else {
          _this2.dom.attributesLoading.text(_this2.settings.i18n.errorLoading || 'Error loading attributes. Please try again.');
          _this2.dom.attributesList.hide();
        }
      })["catch"](function () {
        _this2.dom.attributesLoading.text(_this2.settings.i18n.errorLoading || 'Error loading attributes. Please try again.');
        _this2.dom.attributesList.hide();
      });
    }

    /**
     * Handle attribute checkbox change events
     * @private
     */
  }, {
    key: "_handleAttributeCheckboxChange",
    value: function _handleAttributeCheckboxChange() {
      this._updateSelectedAttributesInput();
    }

    /**
     * Update the hidden input with selected attribute values
     * @private
     */
  }, {
    key: "_updateSelectedAttributesInput",
    value: function _updateSelectedAttributesInput() {
      var _this3 = this;
      var selectedAttributes = [];
      this.dom.attributesList.find('input[type="checkbox"]:checked').each(function (i, checkbox) {
        selectedAttributes.push(_this3.$(checkbox).val());
      });
      this.dom.selectedAttributesInput.val(selectedAttributes.join(','));
    }

    /**
     * Override AdminTableManager.resetForm to include Similar Products specific fields.
     */
  }, {
    key: "resetForm",
    value: function resetForm() {
      var _this$dom$sourceCateg3;
      _superPropGet(SimilarProductsSettingsModule, "resetForm", this, 3)([]); // Call base class method first

      // Reset Similar Products specific fields
      (_this$dom$sourceCateg3 = this.dom.sourceCategoriesSelect) === null || _this$dom$sourceCateg3 === void 0 || _this$dom$sourceCateg3.val(null).trigger('change.select2'); // Clear Select2
      this.dom.attributesList.empty();
      this.dom.attributesLoading.text(this.settings.i18n.selectCategory || 'Select categories to load available attributes...');
      this.dom.attributesLoading.show();
      this.dom.selectedAttributesInput.val('');
    }

    /**
     * Override AdminTableManager.populateFormWithData for Similar Products specific fields.
     * @param {object} itemData - The data for the similar product item to populate the form with
     * @override
     */
  }, {
    key: "populateFormWithData",
    value: function populateFormWithData(itemData) {
      var _this4 = this;
      _superPropGet(SimilarProductsSettingsModule, "populateFormWithData", this, 3)([itemData]); // Sets item ID, calls base logic

      var sourceCategories = itemData.source_categories || []; // Expecting array for multi-select
      var attributes = Array.isArray(itemData.attributes) ? itemData.attributes : itemData.attributes ? itemData.attributes.split(',') : [];

      // Set the hidden input value for selected attributes first
      this.dom.selectedAttributesInput.val(attributes.join(','));

      // Use setTimeout to allow dependent field visibility changes to complete
      setTimeout(function () {
        var _this4$dom$sourceCate;
        // Set source categories and trigger change to load attributes
        (_this4$dom$sourceCate = _this4.dom.sourceCategoriesSelect) === null || _this4$dom$sourceCate === void 0 || _this4$dom$sourceCate.val(sourceCategories).trigger('change.select2');

        // If we have both categories and attributes selected, manually fetch the attributes
        // This ensures attributes are loaded and selected when editing an existing item
        if (sourceCategories.length > 0 && attributes.length > 0) {
          _this4._fetchAttributesForCategories(sourceCategories, attributes);
        }
        _this4.formModified = false; // Reset modified flag after populating
      }, 150); // Small delay
    }

    /**
     * Override AdminTableManager.validateForm for Similar Products specific validation.
     * @returns {boolean} True if the form passes validation, false otherwise
     * @override
     */
  }, {
    key: "validateForm",
    value: function validateForm() {
      var _this$dom$sourceCateg4, _this$dom$sourceCateg5;
      var isValid = _superPropGet(SimilarProductsSettingsModule, "validateForm", this, 3)([]); // Perform base validation first

      // Get values
      var sourceCategories = (_this$dom$sourceCateg4 = this.dom.sourceCategoriesSelect) === null || _this$dom$sourceCateg4 === void 0 ? void 0 : _this$dom$sourceCateg4.val(); // Returns array for multi-select
      var selectedAttributes = this.dom.selectedAttributesInput.val();

      // i18n messages from this.settings.i18n
      var i18n = this.settings.i18n || {};

      // Clear previous specific errors (showFieldError/clearFieldError are inherited)
      this.clearFieldError((_this$dom$sourceCateg5 = this.dom.sourceCategoriesSelect) === null || _this$dom$sourceCateg5 === void 0 ? void 0 : _this$dom$sourceCateg5.next('.select2-container')); // Target Select2 container for error
      this.clearFieldError(this.dom.attributesList); // Clear error on attributes list

      if (!sourceCategories || sourceCategories.length === 0) {
        var _this$dom$sourceCateg6;
        this.showFieldError((_this$dom$sourceCateg6 = this.dom.sourceCategoriesSelect) === null || _this$dom$sourceCateg6 === void 0 ? void 0 : _this$dom$sourceCateg6.next('.select2-container'), i18n.selectCategoryError || 'Please select at least one source category.');
        isValid = false;
      }
      if (!selectedAttributes) {
        this.showFieldError(this.dom.attributesList, i18n.selectAttributesError || 'Please select at least one attribute.');
        isValid = false;
      }
      return isValid;
    }

    /**
     * Custom column population method for 'source_categories' column
     * This method follows the naming convention for column handlers in AdminTableManager
     * @param {jQuery} $cell - The table cell element to populate
     * @param {object} itemData - The data for the current row
     */
  }, {
    key: "populateColumn_source_categories",
    value: function populateColumn_source_categories($cell, itemData) {
      $cell.text(itemData.source_categories_display || 'N/A');
    }

    /**
     * Custom column population method for 'attributes' column
     * @param {jQuery} $cell - The table cell element to populate
     * @param {object} itemData - The data for the current row
     */
  }, {
    key: "populateColumn_attributes",
    value: function populateColumn_attributes($cell, itemData) {
      $cell.text(itemData.attributes_display || 'None selected');
    }
  }]);
}(_common_AdminTableManager__WEBPACK_IMPORTED_MODULE_7__["default"]); // Initialize the module when the DOM is ready and its main tab container exists.
jQuery(document).ready(function ($) {
  var mainTabId = 'similar_products'; // Specific to this module
  var localizedDataObjectName = 'similarProductsSettings'; // Global settings object name

  if ($("#".concat(mainTabId)).length) {
    // Check if the global localized data for this module is available
    if (window[localizedDataObjectName]) {
      // Instantiate the module once
      if (!window.SimilarProductsSettingsModuleInstance) {
        try {
          window.SimilarProductsSettingsModuleInstance = new SimilarProductsSettingsModule();
          (0,_utils__WEBPACK_IMPORTED_MODULE_6__.createLogger)('SimilarProductsInit').log('SimilarProductsSettingsModuleInstance instance initiated.');
        } catch (error) {
          (0,_utils__WEBPACK_IMPORTED_MODULE_6__.createLogger)('SimilarProductsInit').error('Error instantiating SimilarProductsSettingsModuleInstance:', error);
          // Use the global notice system if ProductEstimatorSettings is available
          if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
            window.ProductEstimatorSettingsInstance.showNotice('Failed to initialize Similar Products settings. Check console for errors.', 'error');
          }
        }
      }
    } else {
      (0,_utils__WEBPACK_IMPORTED_MODULE_6__.createLogger)('SimilarProductsInit').error("Localized data object \"".concat(localizedDataObjectName, "\" not found for tab: ").concat(mainTabId, ". Module cannot be initialized."));
      if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
        window.ProductEstimatorSettingsInstance.showNotice("Configuration data for Similar Products (\"".concat(localizedDataObjectName, "\") is missing. Module disabled."), 'error');
      }
    }
    // The module's inherited `handleMainTabChanged` (from VerticalTabbedModule)
    // will manage activation/deactivation logic, including calling `onMainTabActivated`.
    // No separate `product_estimator_tab_changed` listener is needed here for re-initialization
    // or for clearing `sub_tab` from URL, as `VerticalTabbedModule.showVerticalTab` handles URL state.
  } else {
    (0,_utils__WEBPACK_IMPORTED_MODULE_6__.createLogger)('SimilarProductsInit').warn("Main container #".concat(mainTabId, " not found. SimilarProductsSettingsModule will not be initialized."));
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SimilarProductsSettingsModule);

/***/ }),

/***/ "./src/js/utils/tinymce-preserver.js":
/*!*******************************************!*\
  !*** ./src/js/utils/tinymce-preserver.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   setupTinyMCEHTMLPreservation: () => (/* binding */ setupTinyMCEHTMLPreservation)
/* harmony export */ });
/* harmony import */ var _logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./logger */ "./src/js/utils/logger.js");
/**
 * Direct copy of the working setupWpEditors function as a utility
 */


var logger = (0,_logger__WEBPACK_IMPORTED_MODULE_0__.createLogger)('UtilsTinyMCEPreserver');
/**
 * Set up TinyMCE HTML preservation to properly handle special tags like <br>
 * @param {string[]} editorIds - Array of TinyMCE editor IDs to configure
 * @param {string} containerSelector - CSS selector for the container with editors
 * @returns {void}
 */
function setupTinyMCEHTMLPreservation(editorIds) {
  var containerSelector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'body';
  var $ = jQuery;

  // Check if we're in the right container
  if ($(containerSelector).length === 0) {
    return;
  }
  logger.log('Setting up rich text editors with <br> tag preservation');

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
      logger.log("Editor ".concat(editorId, " initialized with content length: ").concat(content.length));
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
    logger.log("Editor ".concat(editorId, " configured with <br> tag protection"));
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
        logger.log("Form submission: Updated ".concat(id, " with content length: ").concat(finalContent.length));
      }
    });

    // Let the form submit normally
    return true;
  });
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
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"product-estimator-admin": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["common"], () => (__webpack_require__("./src/js/admin.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=product-estimator-admin.bundle.js.map