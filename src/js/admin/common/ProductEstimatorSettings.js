/**
 * Main Settings JavaScript
 *
 * Handles common functionality for the settings page and serves as a base class for specific settings modules.
 * Modified to work with separate forms for each tab and support module extension.
 */
import { ajax, dom, validation, log } from '@utils'; // log is the specific logging utility used here
import { createLogger as createModuleLogger } from '@utils'; // For use by modules if needed, or base can use its own logger

class ProductEstimatorSettings {
  /**
   * Initialize the Settings Manager or a Settings Module
   * @param {object|null} moduleOptions - Options if being used as a base for a module.
   * { boolean } isModule - True if being initialized as a module.
   * { string } settingsObjectName - Name of the global object holding localized settings (e.g., 'generalSettings').
   * { string } defaultTabId - Default tab ID for the module.
   * { string } loggerName - Name for the logger for this module instance.
   */
  constructor(moduleOptions = null) {
    this.$ = jQuery;
    // Use createModuleLogger for consistency if preferred, or the existing `log` for the orchestrator.
    // For simplicity, the orchestrator part will continue using the imported `log` as per original.
    // Modules will typically define their own `createLogger` instance.
    // This logger is for the base class methods when they log.
    this.baseClassLogger = createModuleLogger(this.constructor.name);

    if (moduleOptions && moduleOptions.isModule) {
      // Path for when used as a base for a specific settings module
      this.settingsObjectName = moduleOptions.settingsObjectName;
      this.defaultTabId = moduleOptions.defaultTabId;

      this._initializeModuleSpecificSettings(this.settingsObjectName, this.defaultTabId);

      this.$(document).ready(() => {
        this._finalizeModuleSettings(this.settingsObjectName);
        if (typeof this.moduleInit === 'function') {
          this.moduleInit();
        } else {
          this.baseClassLogger.warn('Module does not implement moduleInit():', moduleOptions.settingsObjectName);
        }
      });
    } else {
      // Original constructor path for the main settings page orchestrator
      this.formChanged = false;
      this.currentTab = '';
      this.formChangeTrackers = {}; // Track form changes per tab

      this.ensureGlobalVariables();

      // Call mainInit for the orchestrator AFTER document is ready, similar to modules
      this.$(document).ready(() => {
        this.mainInit();
      });
    }
  }

  /**
   * Initialize settings for a derived module.
   * @param {string} settingsObjectName - The name of the window object holding settings (e.g., 'generalSettings').
   * @param {string} defaultTabId - The default tab ID for the module.
   * @protected
   */
  _initializeModuleSpecificSettings(settingsObjectName, defaultTabId) {
    const localizedSettings = window[settingsObjectName] || {};

    this.settings = { ...localizedSettings };

    this.settings.ajaxUrl = localizedSettings.ajaxUrl ||
      (typeof ajaxurl !== 'undefined' ? ajaxurl : '/wp-admin/admin-ajax.php');

    this.settings.nonce = localizedSettings.nonce ||
      (window.productEstimatorSettings && window.productEstimatorSettings.nonce) ||
      '';

    // Ensure 'actions' is an object, merge with any global/default actions
    const defaultActions = (window.productEstimatorSettings && window.productEstimatorSettings.actions) || {};
    this.settings.actions = {
      ...defaultActions, // Default actions (e.g., global save_settings if any)
      ...(localizedSettings.actions || {}) // Module-specific actions, overrides defaults
    };
    // For simple modules, ensure a basic save_settings action if nothing else is provided
    if (!this.settings.actions.save_settings && defaultTabId) {
      this.settings.actions.save_settings = `save_${defaultTabId}_settings`;
    }


    // Ensure 'selectors' is an object, merge with any global/default selectors
    const defaultSelectors = (window.productEstimatorSettings && window.productEstimatorSettings.selectors) || {};
    this.settings.selectors = {
      ...defaultSelectors,
      ...(localizedSettings.selectors || {})
    };

    this.settings.i18n = {
      ...(window.productEstimatorSettings && window.productEstimatorSettings.i18n),
      ...(localizedSettings.i18n || {}),
    };

    this.settings.tab_id = localizedSettings.tab_id || defaultTabId;
    this.settings.settingsObjectName = settingsObjectName;

    // The 'option_name' should ideally always come from localizedSettings.
    // If it might be missing, you'd need a strategy (e.g., a global default or error).
    if (typeof this.settings.option_name === 'undefined') {
      this.baseClassLogger.warn(`'option_name' is missing from localizedSettings for ${settingsObjectName}. This is usually critical.`);
      // Consider a fallback if appropriate:
      // this.settings.option_name = 'product_estimator_settings'; // Example global default
    }

    // Diagnostic logs (keep these or similar)
    if (typeof localizedSettings.actions === 'undefined') { // Check original localizedSettings
      this.baseClassLogger.warn(`Original 'actions' object was missing from localizedSettings for ${settingsObjectName}. Defaulted/merged.`);
    }
    if (typeof localizedSettings.selectors === 'undefined') { // Check original localizedSettings
      this.baseClassLogger.warn(`Original 'selectors' object was missing from localizedSettings for ${settingsObjectName}. Defaulted/merged.`);
    }

    this.baseClassLogger.log(`Base module settings initialized for ${settingsObjectName}. Effective settings:`, JSON.stringify(this.settings));
  }
  /**
   * Finalize module settings on document.ready (e.g., update nonce).
   * @param {string} settingsObjectName - The name of the window object holding settings.
   * @protected
   */
  _finalizeModuleSettings(settingsObjectName) {
    const updatedLocalizedSettingsOnReady = window[settingsObjectName] || {};
    if (updatedLocalizedSettingsOnReady.nonce) {
      this.settings.nonce = updatedLocalizedSettingsOnReady.nonce;
      this.baseClassLogger.log(`Nonce updated for ${settingsObjectName} via _finalizeModuleSettings`);
    }
  }

  /**
   * Ensure all required global variables exist to prevent reference errors (for orchestrator).
   */
  ensureGlobalVariables() {
    window.featureSwitchesSettings = window.featureSwitchesSettings || { tab_id: 'feature_switches', i18n: {} };
    window.generalSettings = window.generalSettings || { tab_id: 'general', i18n: {} };
    window.netsuiteSettings = window.netsuiteSettings || { tab_id: 'netsuite', i18n: {} };
    window.notificationSettings = window.notificationSettings || { tab_id: 'notifications', i18n: {} };
    window.pricingRulesSettings = window.pricingRulesSettings || { tab_id: 'pricing_rules', i18n: {} };
    window.productAdditionsSettings = window.productAdditionsSettings || { tab_id: 'product_additions', i18n: {} };
    window.productUpgradesSettings = window.productUpgradesSettings || { tab_id: 'product_upgrades', i18n: {} };
    window.similarProductsSettings = window.similarProductsSettings || { tab_id: 'similar_products', i18n: {} };
    window.labelSettings = window.labelSettings || { tab_id: 'labels', i18n: {} };

    window.productEstimatorSettings = window.productEstimatorSettings || {
      ajax_url: (typeof ajaxurl !== 'undefined') ? ajaxurl : '/wp-admin/admin-ajax.php',
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
  mainInit() {
    log('ProductEstimatorSettings', 'Initializing Settings Manager Orchestrator...'); // Original logging style

    const urlTab = this.getTabFromUrl();
    this.currentTab = urlTab !== null ? urlTab : 'general';

    this.$('.tab-content').hide();
    this.$(`#${this.currentTab}`).show();

    this.$('.nav-tab').removeClass('nav-tab-active');
    this.$(`.nav-tab[data-tab="${this.currentTab}"]`).addClass('nav-tab-active');

    this.bindMainEvents();
    this.initFormChangeTracking();
    this.initializeValidation(); // Global validation for forms handled by orchestrator

    log('ProductEstimatorSettings', 'Settings manager orchestrator initialized with tab:', this.currentTab);
  }

  /**
   * Bind event handlers for the main Settings Manager (orchestrator).
   */
  bindMainEvents() {
    this.$('.nav-tab-wrapper').on('click', '.nav-tab', this.handleTabClick.bind(this));

    this.$(document).on('submit', 'form.product-estimator-form', (e) => {
      const $form = this.$(e.currentTarget);
      if ($form.hasClass('pe-vtabs-tab-form') && $form.attr('data-sub-tab-id')) {
        log('ProductEstimatorSettings', 'Orchestrator: Form is vtab, letting specialized handler process.', $form[0]);
        return;
      }
      log('ProductEstimatorSettings', 'Orchestrator: Processing form submission.', $form[0]);
      e.preventDefault();
      this.handleAjaxFormSubmit(e, $form);
    });

    this.$(window).on('beforeunload', this.handleBeforeUnload.bind(this));
    log('ProductEstimatorSettings', 'Orchestrator events bound');
  }

  /**
   * Handle AJAX form submission for orchestrator-managed forms.
   * @param {Event} e - Submit event
   * @param {jQuery} [$form] - Optional: The form element.
   */
  handleAjaxFormSubmit(e, $form) {
    $form = $form || this.$(e.target);
    const tabId = $form.closest('.tab-content').attr('id') || $form.data('tab');
    let formData = $form.serialize();
    const currentLogger = window.createLogger ? window.createLogger(`PES-Orchestrator:${tabId || 'unknown_tab'}`) : console;

    currentLogger.log('Serialized form data (orchestrator):', formData);

    $form.find('input[type="checkbox"]').each((i, el) => {
      const $cb = this.$(el);
      if (!$cb.is(':checked')) {
        const name = $cb.attr('name');
        if (name) {
          const paramRegex = new RegExp(`(^|&)${encodeURIComponent(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:=[^&]*)?`);
          if (formData.match(paramRegex) === null) {
            formData += `&${encodeURIComponent(name)}=0`;
          }
        }
      }
    });
    formData = formData.replace(/^&+/, '').replace(/&&+/g, '&');

    this.showFormLoading($form);
    currentLogger.log(`Submitting form for tab: ${tabId}`);

    const ajaxAction = `save_${tabId}_settings`;
    const localizedData = window.productEstimatorSettings || { nonce: '', ajax_url: ajaxurl, i18n: {} };

    const ajaxDataPayload = {
      action: ajaxAction,
      nonce: localizedData.nonce,
      form_data: formData
    };

    currentLogger.log('Orchestrator sending AJAX with payload:', ajaxDataPayload);

    ajax.ajaxRequest({
      url: localizedData.ajax_url,
      type: 'POST',
      data: ajaxDataPayload
    })
      .then(response => {
        this.showNotice(response.message || localizedData.i18n.saveSuccess, 'success');
        if (this.formChangeTrackers) { // Ensure orchestrator properties exist
          this.formChangeTrackers[tabId] = false;
        }
        if (tabId === this.currentTab) {
          this.formChanged = false;
        }
        currentLogger.log(`Settings saved successfully for tab: ${tabId} (via orchestrator)`);
      })
      .catch(error => {
        const errorMessage = (error && error.message) ? error.message : localizedData.i18n.saveError;
        this.showNotice(errorMessage, 'error');
        currentLogger.error(`Error saving settings for tab ${tabId} (via orchestrator):`, error);
      })
      .finally(() => {
        this.hideFormLoading($form);
      });
  }

  /**
   * Show loading state for a form.
   * @param {jQuery} $form - The form element.
   */
  showFormLoading($form) {
    const $submitButton = $form.find(':submit');
    $submitButton.prop('disabled', true).addClass('loading');
    $submitButton.data('original-text', $submitButton.val());
    const savingText = (window.productEstimatorSettings && window.productEstimatorSettings.i18n && window.productEstimatorSettings.i18n.saving)
      ? window.productEstimatorSettings.i18n.saving : 'Saving...';
    $submitButton.val(savingText);
  }

  /**
   * Hide loading state for a form.
   * @param {jQuery} $form - The form element.
   */
  hideFormLoading($form) {
    const $submitButton = $form.find(':submit');
    $submitButton.prop('disabled', false).removeClass('loading');
    if ($submitButton.data('original-text')) {
      $submitButton.val($submitButton.data('original-text'));
    }
  }

  /**
   * Initialize form change tracking for each tab's form (orchestrator).
   */
  initFormChangeTracking() {
    const self = this;
    this.$('.tab-content').each(function() {
      const tabId = self.$(this).attr('id');
      if (self.formChangeTrackers) {
        self.formChangeTrackers[tabId] = false;
      }

      self.$(`#${tabId} :input`).on('change input', function() {
        if (self.formChangeTrackers) {
          self.formChangeTrackers[tabId] = true;
        }
        if (tabId === self.currentTab) {
          self.formChanged = true;
        }
      });
    });
    log('ProductEstimatorSettings', 'Orchestrator form change tracking initialized');
  }

  /**
   * Initialize form validation for orchestrator-managed forms.
   */
  initializeValidation() {
    this.$('.product-estimator-form').each((i, form) => {
      const $form = this.$(form);
      // Apply only if not a module-specific form that handles its own validation
      if (!$form.data('module-managed-validation')) {
        $form.find('input[type="email"]').on('change', (e) => {
          const $input = this.$(e.currentTarget);
          if ($input.val() && !validation.validateEmail($input.val())) {
            this.showFieldError($input, (window.productEstimatorSettings.i18n.invalidEmail || 'Invalid email address'));
          } else {
            this.clearFieldError($input);
          }
        });

        $form.find('input[type="number"]').on('change', (e) => {
          const $input = this.$(e.currentTarget);
          const value = parseInt($input.val(), 10);
          const min = parseInt($input.attr('min') || 0, 10);
          const max = parseInt($input.attr('max') || 9999, 10);
          const i18nSettings = window.productEstimatorSettings && window.productEstimatorSettings.i18n;


          if (isNaN(value) || value < min || value > max) {
            const message = i18nSettings && i18nSettings.numberRange ?
              i18nSettings.numberRange.replace('%min%', min).replace('%max%', max) :
              `Value must be between ${min} and ${max}`;
            this.showFieldError($input, message);
          } else {
            this.clearFieldError($input);
          }
        });
      }
    });
    log('ProductEstimatorSettings', 'Orchestrator form validation initialized');
  }

  /**
   * Get the active tab from URL.
   * @returns {string|null} The active tab or null.
   */
  getTabFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tab');
  }

  /**
   * Handle tab click for orchestrator.
   * @param {Event} e - Click event.
   */
  handleTabClick(e) {
    e.preventDefault();
    const newTab = this.$(e.currentTarget).data('tab');
    const i18nSettings = window.productEstimatorSettings && window.productEstimatorSettings.i18n;


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
  switchTab(tabId) {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    window.history.pushState({}, '', url.toString());

    this.$('.nav-tab').removeClass('nav-tab-active');
    this.$(`.nav-tab[data-tab="${tabId}"]`).addClass('nav-tab-active');

    this.$('.tab-content').hide();
    this.$(`#${tabId}`).show();

    const previousTab = this.currentTab;
    this.currentTab = tabId;
    this.formChanged = (this.formChangeTrackers && this.formChangeTrackers[tabId]) || false;

    this.$(document).trigger('product_estimator_tab_changed', [tabId, previousTab]);
    log('ProductEstimatorSettings', `Orchestrator switched to tab: ${tabId} from ${previousTab}`);
  }

  /**
   * Handle beforeunload event to warn about unsaved changes (orchestrator).
   * @param {Event} e - BeforeUnload event.
   */
  handleBeforeUnload(e) {
    let hasChanges = false;
    if (this.formChangeTrackers) {
      for (const tabId in this.formChangeTrackers) {
        if (this.formChangeTrackers[tabId]) {
          hasChanges = true;
          break;
        }
      }
    }

    if (hasChanges) {
      const i18nSettings = window.productEstimatorSettings && window.productEstimatorSettings.i18n;
      const message = i18nSettings.unsavedChanges || 'You have unsaved changes. Are you sure?';
      e.returnValue = message;
      return message;
    }
  }

  /**
   * Utility method to clear 'sub_tab' from the URL.
   * Can be called by derived modules.
   */
  clearSubTabFromUrl() {
    const url = new URL(window.location.href);
    if (url.searchParams.has('sub_tab')) {
      url.searchParams.delete('sub_tab');
      window.history.replaceState({}, '', url.toString());
      this.baseClassLogger.log('Cleared sub_tab from URL.');
    }
  }

  /**
   * Public method to show field error. Uses the 'validation' utility.
   * @param {jQuery|HTMLElement} field - The field with an error.
   * @param {string} message - The error message.
   */
  showFieldError(field, message) {
    validation.showFieldError(this.$(field), message);
  }

  /**
   * Public method to clear field error. Uses the 'validation' utility.
   * @param {jQuery|HTMLElement} field - The field to clear error for.
   */
  clearFieldError(field) {
    validation.clearFieldError(this.$(field));
  }

  /**
   * Public method to show notice. Uses the 'validation' utility.
   * @param {string} message - The message to show.
   * @param {string} [type='success'] - Notice type ('success' or 'error').
   */
  showNotice(message, type = 'success') {
    validation.showNotice(message, type);
  }
}

// Initialize the main orchestrator when document is ready
// This ensures ProductEstimatorSettings is available globally if needed by modules
// before they might be instantiated.
jQuery(document).ready(function() {
  if (!window.ProductEstimatorSettingsInstance) { // Ensure single instance of orchestrator
    window.ProductEstimatorSettingsInstance = new ProductEstimatorSettings();
  }
});

export default ProductEstimatorSettings;
