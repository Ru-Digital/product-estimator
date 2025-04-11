/**
 * Notification Settings JavaScript
 *
 * Handles functionality specific to the notification settings tab.
 */
(function($) {
  'use strict';

  // Notification Settings Module
  const NotificationSettingsModule = {
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
      // Enable/disable toggle for notifications
      $('#enable_notifications').on('change', this.toggleNotificationFields.bind(this));

      // Image upload buttons
      $('.image-upload-button').on('click', this.handleImageUpload.bind(this));
      $('.image-remove-button').on('click', this.handleImageRemove.bind(this));

      // Email validation
      $('#default_designer_email, #default_store_email').on('change', this.validateEmail.bind(this));

      // Listen for tab changes
      $(document).on('product_estimator_tab_changed', this.handleTabChanged.bind(this));
    },

    /**
     * Validate email field
     * @param {Event} e Change event
     */
    validateEmail: function(e) {
      const $field = $(e.target);
      const email = $field.val().trim();

      if (email && !this.isValidEmail(email)) {
        this.showFieldError($field, notificationSettings.i18n.validationErrorEmail);
        return false;
      }

      this.clearFieldError($field);
      return true;
    },

    /**
     * Check if email is valid
     * @param {string} email Email to validate
     * @returns {boolean} Whether email is valid
     */
    isValidEmail: function(email) {
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
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
     * Set up dependent fields based on initial state
     */
    setupDependentFields: function() {
      // Initial toggle of fields based on enabled state
      this.toggleNotificationFields();
    },

    /**
     * Toggle notification fields based on enabled checkbox
     */
    toggleNotificationFields: function() {
      const enabled = $('#enable_notifications').is(':checked');
      const $fields = $('#admin_email_notifications, #user_email_notifications, #default_designer_email, #default_store_email, #pdf_footer_text, #email_subject_template, #company_logo')
        .closest('tr');

      if (enabled) {
        $fields.fadeIn(200);
      } else {
        $fields.fadeOut(200);
      }
    },

    /**
     * Handle image upload button click
     * @param {Event} e Click event
     */
    handleImageUpload: function(e) {
      e.preventDefault();

      const button = $(e.currentTarget);
      const fieldId = button.data('field-id');

      // If the media frame already exists, reopen it
      if (this.mediaFrame) {
        this.mediaFrame.open();
        return;
      }

      // Create media frame
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
      this.mediaFrame.on('select', function() {
        const attachment = this.mediaFrame.state().get('selection').first().toJSON();

        // Set hidden input value
        $(`#${fieldId}`).val(attachment.id).trigger('change');

        // Update image preview
        const $previewWrapper = button.closest('td').find('.image-preview-wrapper');
        $previewWrapper.html(`<img src="${attachment.sizes.medium ? attachment.sizes.medium.url : attachment.url}" alt="" style="max-width:100px;max-height:100px;display:block;margin-bottom:10px;" />`);

        // Show remove button
        button.closest('td').find('.image-remove-button').removeClass('hidden');
      }.bind(this));

      // Open media frame
      this.mediaFrame.open();
    },

    /**
     * Handle image remove button click
     * @param {Event} e Click event
     */
    handleImageRemove: function(e) {
      e.preventDefault();

      const button = $(e.currentTarget);
      const fieldId = button.data('field-id');

      // Clear hidden input value
      $(`#${fieldId}`).val('').trigger('change');

      // Clear image preview
      button.closest('td').find('.image-preview-wrapper').empty();

      // Hide remove button
      button.addClass('hidden');
    },

    /**
     * Handle tab changed event
     * @param {Event} e Tab changed event
     * @param {string} tabId The newly active tab ID
     */
    handleTabChanged: function(e, tabId) {
      // If our tab becomes active, refresh dependent fields
      if (tabId === notificationSettings.tab_id) {
        this.toggleNotificationFields();
      }
    }
  };

  // Initialize when document is ready
  $(document).ready(function() {
    NotificationSettingsModule.init();
  });

})(jQuery);
