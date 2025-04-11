(function($) {
  'use strict';

  /**
   * Admin JavaScript functionality
   *
   * Note: Tab management functionality has been moved to product-estimator-settings.js
   * This file should only be used for admin pages other than the settings page
   */
  class ProductEstimatorAdmin {
    /**
     * Initialize the admin functionality
     */
    constructor() {
      this.initializeVariables();
      this.bindEvents();

      // Only initialize tabs if we're not on the settings page
      if (!this.isSettingsPage()) {
        this.initializeTabs();
      }
    }

    /**
     * Check if we're on the settings page to avoid conflicts
     */
    isSettingsPage() {
      // Check if URL contains settings page identifier
      const urlParams = new URLSearchParams(window.location.search);
      const page = urlParams.get('page');
      return page && page.indexOf('-settings') > -1;
    }

    /**
     * Initialize class variables
     */
    initializeVariables() {
      this.formChanged = false;
      this.currentTab = '';
      this.reportData = null;
      this.chart = null;
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
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
    initializeTabs() {
      // Get first tab if none is active
      const $firstTab = $('.nav-tab:first');
      const firstTabId = $firstTab.data('tab') || 'tab-1';

      $('.tab-content').hide();
      $(`#${firstTabId}`).show();
      $firstTab.addClass('nav-tab-active');
      this.currentTab = firstTabId;

      // Check for URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');

      if (tab) {
        this.switchTab(tab);
      }
    }

    /**
     * Handle tab clicks
     * @param {Event} e - Click event
     */
    handleTabClick(e) {
      e.preventDefault();
      const tab = $(e.currentTarget).data('tab');

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
    switchTab(tab) {
      $('.nav-tab').removeClass('nav-tab-active');
      $(`.nav-tab[data-tab="${tab}"]`).addClass('nav-tab-active');

      $('.tab-content').hide();
      $(`#${tab}`).show();

      this.currentTab = tab;

      // Update URL without reload
      const url = new URL(window.location);
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
    initializeValidation() {
      // Skip this if we're on the settings page
      if (this.isSettingsPage()) {
        return;
      }

      const $form = $('.product-estimator-form');

      // Real-time email validation
      $form.find('input[type="email"]').on('change', (e) => {
        const $input = $(e.currentTarget);
        const email = $input.val();

        if (email && !this.validateEmail(email)) {
          this.showFieldError($input, productEstimatorAdmin.i18n.invalidEmail);
        } else {
          this.clearFieldError($input);
        }
      });

      // Number range validation
      $form.find('input[type="number"]').on('change', (e) => {
        const $input = $(e.currentTarget);
        const value = parseInt($input.val());
        const min = parseInt($input.attr('min'));
        const max = parseInt($input.attr('max'));

        if (value < min || value > max) {
          this.showFieldError($input, productEstimatorAdmin.i18n.numberRange
            .replace('%min%', min)
            .replace('%max%', max));
        } else {
          this.clearFieldError($input);
        }
      });
    }

    /**
     * Handle window beforeunload event
     * @param {Event} e - BeforeUnload event
     */
    handleBeforeUnload(e) {
      if (this.formChanged) {
        e.preventDefault();
        return productEstimatorAdmin.i18n.unsavedChanges;
      }
    }


    /**
     * Show admin notice
     * @param {string} message - Notice message
     * @param {string} type - Notice type (success/error)
     */
    showNotice(message, type = 'success') {
      const $notice = $(`<div class="notice notice-${type} is-dismissible"><p>${message}</p></div>`);
      $('.wrap h1').after($notice);

      // Initialize WordPress dismissible notices
      if (window.wp && window.wp.notices) {
        window.wp.notices.init();
      }

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        $notice.fadeOut(() => $notice.remove());
      }, 5000);
    }

    /**
     * Show field error
     * @param {jQuery} $field - Field element
     * @param {string} message - Error message
     */
    showFieldError($field, message) {
      const $error = $(`<span class="field-error">${message}</span>`);
      this.clearFieldError($field);
      $field.after($error);
      $field.addClass('error');
    }

    /**
     * Clear field error
     * @param {jQuery} $field - Field element
     */
    clearFieldError($field) {
      $field.next('.field-error').remove();
      $field.removeClass('error');
    }

    /**
     * Validate email address
     * @param {string} email - Email address
     * @returns {boolean} - Validation result
     */
    validateEmail(email) {
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }
  }

  // Initialize when document is ready
  $(document).ready(() => {
    new ProductEstimatorAdmin();
  });

})(jQuery);
