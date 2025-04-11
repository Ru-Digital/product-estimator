/**
 * General Settings JavaScript
 *
 * Handles functionality specific to the general settings tab.
 */
(function($) {
  'use strict';

  // General Settings Module
  const GeneralSettingsModule = {
    /**
     * Initialize the module
     */
    init: function() {
      this.bindEvents();
      this.setupValidation();
    },

    /**
     * Bind event handlers
     */
    bindEvents: function() {
      // Listen for tab changes
      $(document).on('product_estimator_tab_changed', this.handleTabChanged.bind(this));
    },

    /**
     * Set up field validation
     */
    setupValidation: function() {
      // Validate markup percentage
      $('#default_markup').on('change input', this.validateMarkup.bind(this));

      // Validate expiry days
      $('#estimate_expiry_days').on('change input', this.validateExpiryDays.bind(this));
    },

    /**
     * Validate markup percentage
     * @param {Event} e Input event
     */
    validateMarkup: function(e) {
      const $input = $(e.currentTarget);
      const value = parseInt($input.val());
      const min = parseInt($input.attr('min') || 0);
      const max = parseInt($input.attr('max') || 100);

      if (isNaN(value) || value < min || value > max) {
        this.showFieldError($input, generalSettingsData.i18n.validationErrorMarkup || `Value must be between ${min} and ${max}`);
        return false;
      } else {
        this.clearFieldError($input);
        return true;
      }
    },

    /**
     * Validate expiry days
     * @param {Event} e Input event
     */
    validateExpiryDays: function(e) {
      const $input = $(e.currentTarget);
      const value = parseInt($input.val());
      const min = parseInt($input.attr('min') || 1);
      const max = parseInt($input.attr('max') || 365);

      if (isNaN(value) || value < min || value > max) {
        this.showFieldError($input, generalSettingsData.i18n.validationErrorExpiry || `Value must be between ${min} and ${max}`);
        return false;
      } else {
        this.clearFieldError($input);
        return true;
      }
    },

    /**
     * Show field error message
     * @param {jQuery} $field The field element
     * @param {string} message Error message
     */
    showFieldError: function($field, message) {
      if (typeof ProductEstimatorSettings !== 'undefined' &&
        typeof ProductEstimatorSettings.showFieldError === 'function') {
        ProductEstimatorSettings.showFieldError($field, message);
      } else {
        this.clearFieldError($field);
        const $error = $(`<span class="field-error">${message}</span>`);
        $field.after($error).addClass('error');
      }
    },

    /**
     * Clear field error message
     * @param {jQuery} $field The field element
     */
    clearFieldError: function($field) {
      if (typeof ProductEstimatorSettings !== 'undefined' &&
        typeof ProductEstimatorSettings.clearFieldError === 'function') {
        ProductEstimatorSettings.clearFieldError($field);
      } else {
        $field.removeClass('error').next('.field-error').remove();
      }
    },

    /**
     * Handle tab changed event
     * @param {Event} e Tab changed event
     * @param {string} tabId The newly active tab ID
     */
    handleTabChanged: function(e, tabId) {
      // If our tab becomes active, refresh any dynamic content
      if (tabId === generalSettingsData.tab_id) {
        // Nothing specific needed for general tab currently
      }
    },

    /**
     * Validate all fields in the form
     * @returns {boolean} Whether all fields are valid
     */
    validateAllFields: function() {
      let isValid = true;

      // Validate markup
      if (!this.validateMarkup({
        currentTarget: $('#default_markup')
      })) {
        isValid = false;
      }

      // Validate expiry days
      if (!this.validateExpiryDays({
        currentTarget: $('#estimate_expiry_days')
      })) {
        isValid = false;
      }

      return isValid;
    }
  };

  // Initialize when document is ready
  $(document).ready(function() {
    GeneralSettingsModule.init();

    // Make the module available globally
    window.GeneralSettingsModule = GeneralSettingsModule;
  });

})(jQuery);
