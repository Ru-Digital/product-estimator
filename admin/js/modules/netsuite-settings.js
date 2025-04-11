/**
 * NetSuite Settings JavaScript
 *
 * Handles functionality specific to the NetSuite integration settings tab.
 */
(function($) {
  'use strict';

  // NetSuite Settings Module
  const NetsuiteSettingsModule = {
    /**
     * Initialize the module
     */
    init: function() {
      this.bindEvents();
      this.setupDependentFields();
    },

    /**
     * Bind event handlers
     */
    bindEvents: function() {
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
    },

    /**
     * Set up dependent fields based on initial state
     */
    setupDependentFields: function() {
      // Initial toggle of fields based on enabled state
      this.toggleNetsuiteFields();
    },

    /**
     * Toggle NetSuite fields based on enabled checkbox
     */
    toggleNetsuiteFields: function() {
      const enabled = $('#netsuite_enabled').is(':checked');
      const $fields = $('#netsuite_client_id, #netsuite_client_secret, #netsuite_api_url, #netsuite_token_url, #netsuite_request_limit, #netsuite_cache_time')
        .closest('tr');

      if (enabled) {
        $fields.fadeIn(200);
        $('#test-netsuite-connection').closest('p').fadeIn(200);
      } else {
        $fields.fadeOut(200);
        $('#test-netsuite-connection').closest('p').fadeOut(200);
      }
    },

    /**
     * Test NetSuite API connection
     */
    testNetsuiteConnection: function() {
      const $button = $('#test-netsuite-connection');
      const $result = $('#connection-result');

      // Prevent multiple clicks
      if ($button.prop('disabled')) {
        return;
      }

      // Show testing state
      $button.prop('disabled', true);
      $result.html(`<span style="color:#666;">${netsuiteSettings.i18n.testing || 'Testing connection...'}</span>`);

      // Send AJAX request
      $.ajax({
        url: netsuiteSettings.ajax_url,
        type: 'POST',
        data: {
          action: 'test_netsuite_connection',
          nonce: netsuiteSettings.nonce
        },
        success: function(response) {
          if (response.success) {
            $result.html(`<span style="color:green;">${response.data.message}</span>`);
          } else {
            $result.html(`<span style="color:red;">${netsuiteSettings.i18n.error || 'Error:'} ${response.data.message}</span>`);
          }
        },
        error: function(xhr, status, error) {
          $result.html(`<span style="color:red;">${netsuiteSettings.i18n.error || 'Error:'} ${error}</span>`);
          console.error('AJAX error:', status, error);
          console.error('Response:', xhr.responseText);
        },
        complete: function() {
          $button.prop('disabled', false);
        }
      });
    },

    /**
     * Handle tab changed event
     * @param {Event} e Tab changed event
     * @param {string} tabId The newly active tab ID
     */
    handleTabChanged: function(e, tabId) {
      // If our tab becomes active, refresh dependent fields
      if (tabId === netsuiteSettings.tab_id) {
        this.toggleNetsuiteFields();
      }
    },

    /**
     * Validate URL format
     * @param {Event} e Change event
     */
    validateUrl: function(e) {
      const $field = $(e.currentTarget);
      const value = $field.val().trim();

      if (value && !this.isValidUrl(value)) {
        this.showFieldError($field, netsuiteSettings.i18n.invalidUrl || 'Please enter a valid URL');
        return false;
      }

      this.clearFieldError($field);
      return true;
    },

    /**
     * Validate request limit
     * @param {Event} e Change event
     */
    validateRequestLimit: function(e) {
      const $field = $(e.currentTarget);
      const value = parseInt($field.val(), 10);

      if (isNaN(value) || value < 1 || value > 100) {
        this.showFieldError($field, 'Request limit must be between 1 and 100');
        return false;
      }

      this.clearFieldError($field);
      return true;
    },

    /**
     * Validate cache time
     * @param {Event} e Change event
     */
    validateCacheTime: function(e) {
      const $field = $(e.currentTarget);
      const value = parseInt($field.val(), 10);

      if (isNaN(value) || value < 0) {
        this.showFieldError($field, 'Cache time must be at least 0');
        return false;
      }

      this.clearFieldError($field);
      return true;
    },

    /**
     * Check if a string is a valid URL
     * @param {string} url URL to validate
     * @returns {boolean} Whether URL is valid
     */
    isValidUrl: function(url) {
      try {
        new URL(url);
        return true;
      } catch (e) {
        return false;
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
    }
  };

  // Initialize when document is ready
  $(document).ready(function() {
    NetsuiteSettingsModule.init();
  });

})(jQuery);
