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
      this.mediaFrame = null;
      this.bindEvents();
      this.setupValidation();
    },

    /**
     * Bind event handlers
     */
    bindEvents: function() {
      // Listen for tab changes
      $(document).on('product_estimator_tab_changed', this.handleTabChanged.bind(this));
      $('.file-upload-button').on('click', this.handleFileUpload.bind(this));
      $('.file-remove-button').on('click', this.handleFileRemove.bind(this));
    },

    /**
     * Handle file upload button click
     * @param {Event} e Click event
     */
    handleFileUpload: function(e) {
      e.preventDefault();

      const button = $(e.currentTarget);
      const fieldId = button.data('field-id');
      const acceptType = button.data('accept') || '';

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
      this.mediaFrame.on('select', function() {
        const attachment = this.mediaFrame.state().get('selection').first().toJSON();

        // Set the attachment ID in the hidden input
        $(`#${fieldId}`).val(attachment.id).trigger('change');

        // Update the file preview
        const $previewWrapper = button.siblings('.file-preview-wrapper');
        $previewWrapper.html(`<p class="file-preview"><a href="${attachment.url}" target="_blank">${attachment.filename}</a></p>`);

        // Show the remove button
        button.siblings('.file-remove-button').removeClass('hidden');
      }.bind(this));

      // Open the modal
      this.mediaFrame.open();
    },

    /**
     * Handle file remove button click
     * @param {Event} e Click event
     */
    handleFileRemove: function(e) {
      e.preventDefault();

      const button = $(e.currentTarget);
      const fieldId = button.data('field-id');

      // Clear the attachment ID
      $(`#${fieldId}`).val('').trigger('change');

      // Clear the preview
      button.siblings('.file-preview-wrapper').empty();

      // Hide the remove button
      button.addClass('hidden');
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
