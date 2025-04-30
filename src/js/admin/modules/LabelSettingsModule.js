/**
 * Label Settings JavaScript
 *
 * Handles functionality specific to the label settings tab.
 */
import { showFieldError, clearFieldError, showNotice } from '@utils';
import { dom, ajax, validation } from '@utils';

class LabelSettingsModule {
  /**
   * Initialize the module
   */
  constructor() {
    // Initialize when document is ready
    jQuery(document).ready(() => this.init());
  }

  /**
   * Initialize the module
   */
  init() {
    this.bindEvents();
    this.setupVerticalTabs();
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    const $ = jQuery;

    // Listen for tab changes
    $(document).on('product_estimator_tab_changed', this.handleTabChanged.bind(this));

    // Form submission - convert to AJAX
    $('.label-settings-form').on('submit', this.handleFormSubmit.bind(this));

    // Vertical tabs navigation
    $('.vertical-tabs-nav a').on('click', this.handleVerticalTabClick.bind(this));

    // Email validation
    $('input[type="email"]').on('change', this.validateEmail.bind(this));
  }

  /**
   * Validate email field
   * @param {Event} e Change event
   */
  validateEmail(e) {
    const $ = jQuery;
    const $field = $(e.target);
    const email = $field.val().trim();

    if (email && !validation.validateEmail(email)) {
      this.showFieldError($field, labelSettings.i18n.validationErrorEmail || 'Please enter a valid email address');
      return false;
    }

    this.clearFieldError($field);
    return true;
  }

  /**
   * Show field error message
   * @param {jQuery} $field The field element
   * @param {string} message Error message
   */
  showFieldError($field, message) {
    if (typeof ProductEstimatorSettings !== 'undefined' &&
      typeof ProductEstimatorSettings.showFieldError === 'function') {
      ProductEstimatorSettings.showFieldError($field, message);
    } else {
      clearFieldError($field);
      const $error = jQuery(`<span class="field-error">${message}</span>`);
      $field.after($error).addClass('error');
    }
  }

  /**
   * Clear field error message
   * @param {jQuery} $field The field element
   */
  clearFieldError($field) {
    if (typeof ProductEstimatorSettings !== 'undefined' &&
      typeof ProductEstimatorSettings.clearFieldError === 'function') {
      ProductEstimatorSettings.clearFieldError($field);
    } else {
      $field.removeClass('error').next('.field-error').remove();
    }
  }

  /**
   * Set up vertical tabs
   */
  setupVerticalTabs() {
    const $ = jQuery;

    // First check URL parameters for sub_tab
    let activeTabId = 'general'; // Default to general

    // Check for sub_tab in URL
    const urlParams = new URLSearchParams(window.location.search);
    const subTab = urlParams.get('sub_tab');
    if (subTab && $('.vertical-tabs-nav a[data-tab="' + subTab + '"]').length) {
      activeTabId = subTab;
    }
    // If no valid sub_tab in URL, look for .active class
    else if ($('.vertical-tabs-nav .tab-item.active a').length) {
      activeTabId = $('.vertical-tabs-nav .tab-item.active a').data('tab');
    }

    // Show the active tab
    this.showVerticalTab(activeTabId);

    // Adjust height of the tab content container to match the nav
    this.adjustTabContentHeight();

    // Adjust on window resize
    $(window).on('resize', this.adjustTabContentHeight.bind(this));
  }

  /**
   * Adjust tab content height
   */
  adjustTabContentHeight() {
    const $ = jQuery;
    const navHeight = $('.vertical-tabs-nav').outerHeight();
    $('.vertical-tabs-content').css('min-height', navHeight + 'px');
  }

  /**
   * Handle vertical tab click
   * @param {Event} e Click event
   */
  handleVerticalTabClick(e) {
    e.preventDefault();
    const $ = jQuery;

    const $link = $(e.currentTarget);
    const tabId = $link.data('tab');

    // Update URL hash
    window.history.pushState({}, '', `?page=product-estimator-settings&tab=labels&sub_tab=${tabId}`);

    // Show the selected tab
    this.showVerticalTab(tabId);
  }

  /**
   * Show vertical tab
   * @param {string} tabId Tab ID to show
   */
  showVerticalTab(tabId) {
    const $ = jQuery;

    // Update active tab in navigation
    $('.vertical-tabs-nav .tab-item').removeClass('active');
    $(`.vertical-tabs-nav a[data-tab="${tabId}"]`).parent().addClass('active');

    // Show the tab content
    $('.vertical-tab-content').removeClass('active');
    $(`#${tabId}`).addClass('active');
  }

  /**
   * Handle tab changed event
   * @param {Event} e Tab changed event
   * @param {string} tabId The newly active tab ID
   */
  handleTabChanged(e, tabId) {
    // If our tab becomes active, refresh vertical tabs
    if (tabId === labelSettings.tab_id) {
      this.setupVerticalTabs();
    }
  }

  /**
   * Handle form submission
   * @param {Event} e Submit event
   */
  handleFormSubmit(e) {
    e.preventDefault();
    const $ = jQuery;

    const $form = $(e.currentTarget);
    const formData = $form.serialize();
    const type = $form.data('type') || 'general';

    // Show loading state
    const $submitButton = $form.find('.save-settings');
    const $spinner = $form.find('.spinner');

    $submitButton.prop('disabled', true);
    $spinner.addClass('is-active');

    // Ensure unchecked checkboxes are properly represented
    // This helps ensure all checkboxes are submitted even when unchecked
    let formDataStr = formData;
    const checkboxFields = $form.find('input[type="checkbox"]');
    checkboxFields.each(function() {
      if (!$(this).is(':checked') && !formDataStr.includes($(this).attr('name'))) {
        formDataStr += '&' + $(this).attr('name') + '=0';
      }
    });

    // Submit the form via AJAX - use the direct save_labels_settings action
    ajax.ajaxRequest({
      url: productEstimatorSettings.ajax_url,
      type: 'POST',
      data: {
        action: 'save_labels_settings', // Direct action name
        nonce: productEstimatorSettings.nonce,
        form_data: formDataStr,
        label_type: type
      }
    })
      .then(response => {
        // Show success message
        if (typeof ProductEstimatorSettings !== 'undefined' &&
          typeof ProductEstimatorSettings.showNotice === 'function') {
          ProductEstimatorSettings.showNotice(response.message || labelSettings.i18n.saveSuccess, 'success');
        } else {
          showNotice(response.message || labelSettings.i18n.saveSuccess, 'success');
        }
      })
      .catch(error => {
        // Show error message
        if (typeof ProductEstimatorSettings !== 'undefined' &&
          typeof ProductEstimatorSettings.showNotice === 'function') {
          ProductEstimatorSettings.showNotice(error.message || labelSettings.i18n.saveError, 'error');
        } else {
          showNotice(error.message || labelSettings.i18n.saveError, 'error');
        }
      })
      .finally(() => {
        // Reset form state
        $submitButton.prop('disabled', false);
        $spinner.removeClass('is-active');
      });
  }
}

// Initialize the module
jQuery(document).ready(function() {
  const module = new LabelSettingsModule();

  // Export the module globally for backward compatibility
  window.LabelSettingsModule = module;
});

export default LabelSettingsModule;
