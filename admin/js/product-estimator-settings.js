/**
 * Main Settings JavaScript
 *
 * Handles common functionality for the settings page.
 * Modified to work with separate forms for each tab.
 */
(function($) {
  'use strict';

  // Settings Manager
  const SettingsManager = {
    formChanged: false,
    currentTab: '',
    formChangeTrackers: {}, // Track form changes per tab

    /**
     * Initialize the Settings Manager
     */
    init: function() {
      // Only set default tab to 'general' if no tab is specified in URL
      const urlTab = this.getTabFromUrl();
      this.currentTab = urlTab !== null ? urlTab : 'general';

      // Initialize tabs
      $('.tab-content').hide();
      $(`#${this.currentTab}`).show();

      // Update active tab in navigation
      $('.nav-tab').removeClass('nav-tab-active');
      $(`.nav-tab[data-tab="${this.currentTab}"]`).addClass('nav-tab-active');

      this.bindEvents();
      this.initFormChangeTracking();
      this.initializeValidation();
    },

    /**
     * Bind event handlers
     */
    bindEvents: function() {
      // Tab switching
      $('.nav-tab-wrapper').on('click', '.nav-tab', this.handleTabClick.bind(this));

      // Form submission - convert to AJAX
      $('.product-estimator-form').on('submit', this.handleAjaxFormSubmit.bind(this));

      // Window beforeunload for unsaved changes warning
      $(window).on('beforeunload', this.handleBeforeUnload.bind(this));
    },

    /**
     * Handle AJAX form submission
     * @param {Event} e - Submit event
     */
    handleAjaxFormSubmit: function(e) {
      e.preventDefault();
      const $form = $(e.target);
      const tabId = $form.closest('.tab-content').attr('id');
      const formData = $form.serialize();

      // Show loading state
      this.showFormLoading($form);

      // Make the AJAX request to save settings
      $.ajax({
        url: productEstimatorSettings.ajax_url,
        type: 'POST',
        data: {
          action: 'save_' + tabId + '_settings',
          nonce: productEstimatorSettings.nonce,
          form_data: formData
        },
        success: (response) => {
          if (response.success) {
            // Show success message
            this.showNotice(response.data.message || productEstimatorSettings.i18n.saveSuccess, 'success');

            // Reset the change flags for this tab's form
            this.formChangeTrackers[tabId] = false;

            // If this is the current tab, reset the main formChanged flag
            if (tabId === this.currentTab) {
              this.formChanged = false;
            }
          } else {
            // Show error message
            this.showNotice(response.data.message || productEstimatorSettings.i18n.saveError, 'error');
          }
        },
        error: () => {
          this.showNotice(productEstimatorSettings.i18n.saveError, 'error');
        },
        complete: () => {
          this.hideFormLoading($form);
        }
      });
    },

    /**
     * Show loading state for form
     * @param {jQuery} $form - The form element
     */
    showFormLoading: function($form) {
      const $submitButton = $form.find(':submit');
      $submitButton.prop('disabled', true).addClass('loading');
      $submitButton.data('original-text', $submitButton.val());
      $submitButton.val(productEstimatorSettings.i18n.saving || 'Saving...');
    },

    /**
     * Hide loading state for form
     * @param {jQuery} $form - The form element
     */
    hideFormLoading: function($form) {
      const $submitButton = $form.find(':submit');
      $submitButton.prop('disabled', false).removeClass('loading');
      $submitButton.val($submitButton.data('original-text'));
    },

    /**
     * Initialize form change tracking for each tab's form
     */
    initFormChangeTracking: function() {
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
    },

    /**
     * Initialize form validation
     */
    initializeValidation: function() {
      const self = this;

      // Apply validation to all forms
      $('.product-estimator-form').each(function() {
        const $form = $(this);

        // Real-time email validation
        $form.find('input[type="email"]').on('change', function(e) {
          const $input = $(this);
          const email = $input.val();

          if (email && !self.validateEmail(email)) {
            self.showFieldError($input, productEstimatorSettings.i18n.invalidEmail || 'Invalid email address');
          } else {
            self.clearFieldError($input);
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
            self.showFieldError($input, message);
          } else {
            self.clearFieldError($input);
          }
        });
      });
    },

    /**
     * Get the active tab from URL
     * @returns {string|null} The active tab or null if not present
     */
    getTabFromUrl: function() {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('tab');
    },

    /**
     * Handle tab click
     * @param {Event} e Click event
     */
    handleTabClick: function(e) {
      e.preventDefault();
      const newTab = $(e.currentTarget).data('tab');

      // Warn about unsaved changes before switching tabs
      // if (this.formChanged) {
      //   if (!confirm(productEstimatorSettings.i18n.unsavedChanges)) {
      //     return;
      //   }
      // }

      this.switchTab(newTab);
    },

    /**
     * Switch to a different tab
     * @param {string} tabId The tab to switch to
     */
    switchTab: function(tabId) {
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
    },

    /**
     * Handle beforeunload event to warn about unsaved changes
     * @param {Event} e - BeforeUnload event
     */
    handleBeforeUnload: function(e) {
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
    },

    /**
     * Show a notification message
     * @param {string} message The message to display
     * @param {string} type The message type ('success' or 'error')
     */
    showNotice: function(message, type = 'success') {
      const $notice = $(`<div class="notice notice-${type} is-dismissible"><p>${message}</p></div>`);

      // Remove any existing notices
      $('.product-estimator-admin-wrapper .notice').remove();

      // Add the new notice
      $('.product-estimator-admin-wrapper h1').after($notice);

      // Make notices dismissible
      if (typeof wp !== 'undefined' && wp.notices && wp.notices.removeDismissed) {
        wp.notices.removeDismissed();
      }

      // Add close button if wp.notices is not available
      if (typeof wp === 'undefined' || !wp.notices) {
        const $closeButton = $('<button type="button" class="notice-dismiss"><span class="screen-reader-text">Dismiss this notice.</span></button>');
        $notice.append($closeButton);

        $closeButton.on('click', function() {
          $notice.fadeOut(100, function() {
            $notice.remove();
          });
        });
      }

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        $notice.fadeOut(500, function() {
          $notice.remove();
        });
      }, 5000);
    },

    /**
     * Show field error
     * @param {jQuery} $field - Field element
     * @param {string} message - Error message
     */
    showFieldError: function($field, message) {
      const $error = $(`<span class="field-error">${message}</span>`);
      this.clearFieldError($field);
      $field.after($error);
      $field.addClass('error');
    },

    /**
     * Clear field error
     * @param {jQuery} $field - Field element
     */
    clearFieldError: function($field) {
      $field.next('.field-error').remove();
      $field.removeClass('error');
    },

    /**
     * Validate email address
     * @param {string} email - Email address
     * @returns {boolean} - Validation result
     */
    validateEmail: function(email) {
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }
  };

  // Initialize when document is ready
  $(document).ready(function() {
    SettingsManager.init();

    // Make settings manager available globally for modules
    window.ProductEstimatorSettings = SettingsManager;
  });

})(jQuery);
