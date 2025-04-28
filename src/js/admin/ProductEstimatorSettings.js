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

    window.similarProductsL10n = window.similarProductsL10n || {
      tab_id: 'similar_products',
      i18n: {}
    };

    window.productUpgradesSettings = window.productUpgradesSettings || {
      tab_id: 'product_upgrades',
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

    // Tab switching
    $('.nav-tab-wrapper').on('click', '.nav-tab', this.handleTabClick.bind(this));

    // Form submission - convert to AJAX
    $('.product-estimator-form').on('submit', this.handleAjaxFormSubmit.bind(this));

    // Window beforeunload for unsaved changes warning
    $(window).on('beforeunload', this.handleBeforeUnload.bind(this));

    log('ProductEstimatorSettings', 'Events bound');
  }

  /**
   * Handle AJAX form submission
   * @param {Event} e - Submit event
   */
  handleAjaxFormSubmit(e) {
    e.preventDefault();
    const $ = jQuery;
    const $form = $(e.target);
    const tabId = $form.closest('.tab-content').attr('id');
    const formData = $form.serialize();

    // Show loading state
    this.showFormLoading($form);

    log('ProductEstimatorSettings', `Submitting form for tab: ${tabId}`);

    // Make the AJAX request to save settings
    ajax.ajaxRequest({
      url: productEstimatorSettings.ajax_url,
      type: 'POST',
      data: {
        action: 'save_' + tabId + '_settings',
        nonce: productEstimatorSettings.nonce,
        form_data: formData
      }
    })
      .then(response => {
        // Show success message
        validation.showNotice(response.message || productEstimatorSettings.i18n.saveSuccess, 'success');

        // Reset the change flags for this tab's form
        this.formChangeTrackers[tabId] = false;

        // If this is the current tab, reset the main formChanged flag
        if (tabId === this.currentTab) {
          this.formChanged = false;
        }

        log('ProductEstimatorSettings', `Settings saved successfully for tab: ${tabId}`);
      })
      .catch(error => {
        // Show error message
        validation.showNotice(error.message || productEstimatorSettings.i18n.saveError, 'error');
        log('ProductEstimatorSettings', `Error saving settings for tab ${tabId}:`, error);
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
