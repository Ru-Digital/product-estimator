/**
 * Main Settings JavaScript
 *
 * Handles common functionality for the settings page.
 * Modified to work with separate forms for each tab.
 */
import { ajax, dom, validation, log } from '@utils';

class ProductEstimatorSettings {
  /**
   * Initialize the Settings Manager
   */
  constructor() {
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
  ensureGlobalVariables() {

    window.featureSwitchesSettings = window.featureSwitchesSettings || {
      tab_id: 'feature_switches',
      i18n: {}
    };
    // Create fallbacks for all settings data objects that might be referenced
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

    window.productUpgradesSettings = window.productUpgradesSettings || {
      tab_id: 'product_upgrades',
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


    // Ensure productEstimatorSettings exists
    window.productEstimatorSettings = window.productEstimatorSettings || {
      ajax_url: (typeof ajaxurl !== 'undefined') ? ajaxurl : '/wp-admin/admin-ajax.php',
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
  init() {
    // Only set default tab to 'general' if no tab is specified in URL
    const urlTab = this.getTabFromUrl();
    this.currentTab = urlTab !== null ? urlTab : 'general';

    // Initialize tabs
    jQuery('.tab-content').hide();
    jQuery(`#${this.currentTab}`).show();

    // Update active tab in navigation
    jQuery('.nav-tab').removeClass('nav-tab-active');
    jQuery(`.nav-tab[data-tab="${this.currentTab}"]`).addClass('nav-tab-active');

    this.bindEvents();
    this.initFormChangeTracking();
    this.initializeValidation();

    log('ProductEstimatorSettings', 'Settings manager initialized with tab:', this.currentTab);
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    const $ = jQuery;
    const logger = window.createLogger ? window.createLogger('ProductEstimatorSettings') : console; // Use your logger

    // Tab switching
    $('.nav-tab-wrapper').on('click', '.nav-tab', this.handleTabClick.bind(this));

    // Form submission - MODIFIED TO BE AWARE OF VERTICAL TAB FORMS
    // Use a more specific selector if possible, or ensure this is the only primary handler for general forms.
    // We are binding to document to catch all forms with '.product-estimator-form'
    $(document).on('submit', 'form.product-estimator-form', (e) => { // Changed to an arrow function to maintain 'this' from ProductEstimatorSettings if needed later, though not strictly necessary for this specific logic.
      const $form = $(e.currentTarget); // Use e.currentTarget for delegated events

      // Check if this form is specifically a vertical tab form
      // which should be handled by VerticalTabbedModule.js
      if ($form.hasClass('pe-vtabs-tab-form') && $form.attr('data-tab')) {
        logger.log('Generic handler (ProductEstimatorSettings.js): Form has .pe-vtabs-tab-form and data-tab. Letting VerticalTabbedModule handle it.', $form[0]);
        // DO NOT call e.preventDefault() or e.stopImmediatePropagation() here for these forms.
        // Simply return, allowing the VerticalTabbedModule's more specific handler to proceed.
        return;
      }

      // If it's not a vertical tab form, then this generic handler should process it.
      logger.log('Generic handler (ProductEstimatorSettings.js): Processing form submission.', $form[0]);
      e.preventDefault(); // Prevent default for forms this handler IS responsible for.

      // Call the original AJAX form submission logic
      // Ensure 'this' context is correct if handleAjaxFormSubmit uses 'this' to refer to ProductEstimatorSettings instance
      this.handleAjaxFormSubmit(e, $form); // Pass $form to avoid re-selecting
    });

    // Window beforeunload for unsaved changes warning
    $(window).on('beforeunload', this.handleBeforeUnload.bind(this));

    logger.log('ProductEstimatorSettings: Events bound');
  }

  /**
   * Handle AJAX form submission
   * @param {Event} e - Submit event
   * @param {jQuery} [$form] - Optional: The form element if already known.
   */
  handleAjaxFormSubmit(e, $form) { // Added $form parameter
    // If e is directly passed, e.target will be the form.
    // If $form is passed, use it directly.
    const $ = jQuery;
    $form = $form || $(e.target); // Ensure $form is defined

    const tabId = $form.closest('.tab-content').attr('id') || $form.data('tab'); // Fallback to data-tab if not in .tab-content
    let formData = $form.serialize();
    const logger = window.createLogger ? window.createLogger(`PES:${tabId || 'unknown_tab'}`) : console;

    logger.log('Serialized form data (generic handler):', formData);

    // Handle unchecked checkboxes
    $form.find('input[type="checkbox"]').each(function() {
      const $cb = $(this);
      if (!$cb.is(':checked')) {
        const name = $cb.attr('name');
        if (name) { // Ensure name attribute exists
          const paramRegex = new RegExp(`(^|&)${encodeURIComponent(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:=[^&]*)?`);
          if (formData.match(paramRegex) === null) { // Only add if not present at all
            formData += `&${encodeURIComponent(name)}=0`;
          }
          // Note: Modifying formData like this can be tricky.
          // It's often better to build an object and then serialize, or let server handle missing as false.
        }
      }
    });
    formData = formData.replace(/^&+/, '').replace(/&&+/g, '&');


    this.showFormLoading($form);
    logger.log(`Submitting form for tab: ${tabId}`);

    // Determine the correct AJAX action. For general tabs, it might be based on tabId.
    // For vertical tabs, this handler should ideally not be reached, but if it were,
    // it wouldn't have sub_tab_id.
    const ajaxAction = `save_${tabId}_settings`; // This assumes each general tab has a unique AJAX action.

    const localizedData = window.productEstimatorSettings || { nonce: '', ajax_url: ajaxurl, i18n: {} };

    const ajaxDataPayload = {
      action: ajaxAction,
      nonce: localizedData.nonce, // Use a general settings nonce
      form_data: formData
      // NO 'sub_tab_id' here, as this is the generic handler
    };

    logger.log('Generic handler (ProductEstimatorSettings.js) sending AJAX with payload:', ajaxDataPayload);

    ajax.ajaxRequest({
      url: localizedData.ajax_url,
      type: 'POST',
      data: ajaxDataPayload
    })
      .then(response => {
        validation.showNotice(response.message || localizedData.i18n.saveSuccess, 'success');
        this.formChangeTrackers[tabId] = false;
        if (tabId === this.currentTab) {
          this.formChanged = false;
        }
        logger.log(`Settings saved successfully for tab: ${tabId} (via generic handler)`);
      })
      .catch(error => {
        validation.showNotice(error.message || localizedData.i18n.saveError, 'error');
        logger.error(`Error saving settings for tab ${tabId} (via generic handler):`, error);
      })
      .finally(() => {
        this.hideFormLoading($form);
      });
  }


  /**
   * Show loading state for form
   * @param {jQuery} $form - The form element
   */
  showFormLoading($form) {
    const $submitButton = $form.find(':submit');
    $submitButton.prop('disabled', true).addClass('loading');
    $submitButton.data('original-text', $submitButton.val());
    $submitButton.val(productEstimatorSettings.i18n.saving || 'Saving...');
  }

  /**
   * Hide loading state for form
   * @param {jQuery} $form - The form element
   */
  hideFormLoading($form) {
    const $submitButton = $form.find(':submit');
    $submitButton.prop('disabled', false).removeClass('loading');
    $submitButton.val($submitButton.data('original-text'));
  }

  /**
   * Initialize form change tracking for each tab's form
   */
  initFormChangeTracking() {
    const $ = jQuery;
    const self = this;

    // Initialize tracker for each tab's form
    $('.tab-content').each(function() {
      const tabId = $(this).attr('id');
      self.formChangeTrackers[tabId] = false;

      // Track form changes for this tab
      $(`#${tabId} :input`).on('change input', function() {
        self.formChangeTrackers[tabId] = true;

        // If this is the current tab, update the main formChanged flag
        if (tabId === self.currentTab) {
          self.formChanged = true;
        }
      });
    });

    log('ProductEstimatorSettings', 'Form change tracking initialized');
  }

  /**
   * Initialize form validation
   */
  initializeValidation() {
    const $ = jQuery;

    // Apply validation to all forms
    $('.product-estimator-form').each(function() {
      const $form = $(this);

      // Real-time email validation
      $form.find('input[type="email"]').on('change', function(e) {
        const $input = $(this);
        const email = $input.val();

        if (email && !validation.validateEmail(email)) {
          validation.showFieldError($input, productEstimatorSettings.i18n.invalidEmail || 'Invalid email address');
        } else {
          validation.clearFieldError($input);
        }
      });

      // Number range validation
      $form.find('input[type="number"]').on('change', function(e) {
        const $input = $(this);
        const value = parseInt($input.val());
        const min = parseInt($input.attr('min') || 0);
        const max = parseInt($input.attr('max') || 9999);

        if (isNaN(value) || value < min || value > max) {
          const message = productEstimatorSettings.i18n.numberRange ?
            productEstimatorSettings.i18n.numberRange.replace('%min%', min).replace('%max%', max) :
            `Value must be between ${min} and ${max}`;
          validation.showFieldError($input, message);
        } else {
          validation.clearFieldError($input);
        }
      });
    });

    log('ProductEstimatorSettings', 'Form validation initialized');
  }

  /**
   * Get the active tab from URL
   * @returns {string|null} The active tab or null if not present
   */
  getTabFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tab');
  }

  /**
   * Handle tab click
   * @param {Event} e Click event
   */
  handleTabClick(e) {
    e.preventDefault();
    const newTab = jQuery(e.currentTarget).data('tab');

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
  switchTab(tabId) {
    const $ = jQuery;

    // Update active tab in URL without reload
    const url = new URL(window.location);
    url.searchParams.set('tab', tabId);
    window.history.pushState({}, '', url);

    // Update active tab in navigation
    $('.nav-tab').removeClass('nav-tab-active');
    $(`.nav-tab[data-tab="${tabId}"]`).addClass('nav-tab-active');

    // Show the active tab content
    $('.tab-content').hide();
    $(`#${tabId}`).show();

    // Update current tab
    const previousTab = this.currentTab;
    this.currentTab = tabId;

    // Update the formChanged flag based on the new tab's form state
    this.formChanged = this.formChangeTrackers[tabId] || false;

    // Trigger tab changed event for modules
    $(document).trigger('product_estimator_tab_changed', [tabId, previousTab]);

    log('ProductEstimatorSettings', `Switched to tab: ${tabId} from ${previousTab}`);
  }

  /**
   * Handle beforeunload event to warn about unsaved changes
   * @param {Event} e - BeforeUnload event
   */
  handleBeforeUnload(e) {
    // Check if any tab form has unsaved changes
    let hasChanges = false;
    for (const tabId in this.formChangeTrackers) {
      if (this.formChangeTrackers[tabId]) {
        hasChanges = true;
        break;
      }
    }

    if (hasChanges) {
      const message = productEstimatorSettings.i18n.unsavedChanges;
      e.returnValue = message;
      return message;
    }
  }

  /**
   * Public method to show field error - for module compatibility
   * @param {jQuery|HTMLElement} field - The field with an error
   * @param {string} message - The error message
   */
  showFieldError(field, message) {
    validation.showFieldError(field, message);
  }

  /**
   * Public method to clear field error - for module compatibility
   * @param {jQuery|HTMLElement} field - The field to clear error for
   */
  clearFieldError(field) {
    validation.clearFieldError(field);
  }

  /**
   * Public method to show notice - for module compatibility
   * @param {string} message - The message to show
   * @param {string} type - Notice type ('success' or 'error')
   */
  showNotice(message, type = 'success') {
    validation.showNotice(message, type);
  }
}

// Initialize when document is ready
jQuery(document).ready(function() {
  // Make settings manager available globally for modules
  window.ProductEstimatorSettings = new ProductEstimatorSettings();
});

export default ProductEstimatorSettings;
