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
    console.log('Label Settings Module initialized');
    this.bindEvents();

    // Slight delay to ensure DOM is fully rendered
    setTimeout(() => {
      this.setupVerticalTabs();
    }, 100);
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

    // Vertical tabs navigation - use delegated events to handle dynamically loaded content
    $(document).on('click', '.vertical-tabs-nav a', this.handleVerticalTabClick.bind(this));

    // Email validation
    $(document).on('change', 'input[type="email"]', this.validateEmail.bind(this));

    // console.log('Label Settings events bound');
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
      this.showFieldError($field, 'Please enter a valid email address');
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
      validation.clearFieldError($field);
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
      validation.clearFieldError($field);
    }
  }

  /**
   * Set up vertical tabs
   */
  setupVerticalTabs() {
    const $ = jQuery;
    console.log('Setting up vertical tabs');

    // First check URL parameters for sub_tab
    let activeTabId = 'labels-general'; // Default to general

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

    console.log('Active tab ID:', activeTabId);

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
    if (navHeight) {
      $('.vertical-tabs-content').css('min-height', navHeight + 'px');
    }
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

    console.log('Vertical tab clicked:', tabId);

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

    console.log('Showing vertical tab:', tabId);

    // Update active tab in navigation
    $('.vertical-tabs-nav .tab-item').removeClass('active');
    $(`.vertical-tabs-nav a[data-tab="${tabId}"]`).parent().addClass('active');

    // Show the tab content
    $('.vertical-tab-content').hide().removeClass('active');
    $(`#${tabId}`).show().addClass('active');
  }

  /**
   * Handle tab changed event
   * @param {Event} e Tab changed event
   * @param {string} tabId The newly active tab ID
   */
  handleTabChanged(e, tabId) {
    // If our tab becomes active, refresh vertical tabs
    if (tabId === 'labels') {
      console.log('Labels tab activated');

      // Slight delay to ensure content is rendered
      setTimeout(() => {
        this.setupVerticalTabs();
      }, 100);
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
    const type = $form.data('type') || 'labels-general';

    console.log('Form submitted for type:', type);

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

    // Log the data being sent
    console.log('Sending form data:', formDataStr);

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
        console.log('Success response:', response);
        // Show success message
        if (typeof ProductEstimatorSettings !== 'undefined' &&
          typeof ProductEstimatorSettings.showNotice === 'function') {
          ProductEstimatorSettings.showNotice(response.message || 'Labels saved successfully', 'success');
        } else {
          showNotice(response.message || 'Labels saved successfully', 'success');
        }
      })
      .catch(error => {
        console.error('Error response:', error);
        // Show error message
        if (typeof ProductEstimatorSettings !== 'undefined' &&
          typeof ProductEstimatorSettings.showNotice === 'function') {
          ProductEstimatorSettings.showNotice(error.message || 'Error saving labels', 'error');
        } else {
          showNotice(error.message || 'Error saving labels', 'error');
        }
      })
      .finally(() => {
        // Reset form state
        $submitButton.prop('disabled', false);
        $spinner.removeClass('is-active');
      });
  }
}

// Initialize the module and make it globally available
let labelSettingsInstance = null;

jQuery(document).ready(function() {
  console.log('Document ready, initializing Label Settings Module');
  labelSettingsInstance = new LabelSettingsModule();

  // Export the module globally for backward compatibility
  window.LabelSettingsModule = labelSettingsInstance;
});

export default LabelSettingsModule;
