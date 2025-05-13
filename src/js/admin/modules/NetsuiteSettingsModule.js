/**
 * NetSuite Settings JavaScript
 *
 * Handles functionality specific to the NetSuite integration settings tab.
 */
import { ajaxRequest } from '@utils/ajax'; // Specific import from original
import { createElement } from '@utils/dom'; // Specific import from original

import ProductEstimatorSettings from '../common/ProductEstimatorSettings'; // Adjust path as needed

class NetsuiteSettingsModule extends ProductEstimatorSettings {
  /**
   * Initialize the module
   */
  constructor() {
    super({
      isModule: true,
      settingsObjectName: 'netsuiteSettings',
      defaultTabId: 'netsuite',
    });

    // Bind methods
    this.testNetsuiteConnection = this.testNetsuiteConnection.bind(this);
    this.toggleNetsuiteFields = this.toggleNetsuiteFields.bind(this);
    this.validateUrl = this.validateUrl.bind(this);
    this.validateRequestLimit = this.validateRequestLimit.bind(this);
    this.validateCacheTime = this.validateCacheTime.bind(this);
    this.handleTabChanged = this.handleTabChanged.bind(this);
  }

  /**
   * Module-specific initialization.
   */
  moduleInit() {
    this.bindEvents();
    this.setupDependentFields(); // Call after DOM is ready and elements are available
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    this.$(document).on('product_estimator_tab_changed', this.handleTabChanged);
    this.$('#test-netsuite-connection').on('click', this.testNetsuiteConnection);
    this.$('#netsuite_enabled').on('change', this.toggleNetsuiteFields);
    this.$('#netsuite_api_url, #netsuite_token_url').on('blur', this.validateUrl); // Use blur for validation after input
    this.$('#netsuite_request_limit').on('blur', this.validateRequestLimit);
    this.$('#netsuite_cache_time').on('blur', this.validateCacheTime);
  }

  setupDependentFields() {
    this.toggleNetsuiteFields(); // Initial toggle based on current state
  }

  toggleNetsuiteFields() {
    const enabled = this.$('#netsuite_enabled').is(':checked');
    const $fields = this.$('#netsuite_client_id, #netsuite_client_secret, #netsuite_api_url, #netsuite_token_url, #netsuite_request_limit, #netsuite_cache_time')
      .closest('tr');
    const $testButtonContainer = this.$('#test-netsuite-connection').closest('p'); // Or other container

    if (enabled) {
      $fields.fadeIn(200);
      $testButtonContainer.fadeIn(200);
    } else {
      $fields.fadeOut(200);
      $testButtonContainer.fadeOut(200);
    }
  }

  testNetsuiteConnection() {
    const $button = this.$('#test-netsuite-connection');
    const $result = this.$('#connection-result'); // Assuming this element exists

    if ($button.prop('disabled')) return;

    const i18n = this.settings.i18n || (window.netsuiteSettings && window.netsuiteSettings.i18n) || {};
    $button.prop('disabled', true);
    $result.html(`<span style="color:#666;">${i18n.testing || 'Testing connection...'}</span>`);

    ajaxRequest({ // Using imported ajaxRequest directly as in original
      url: this.settings.ajaxUrl, // Use ajaxUrl from this.settings
      type: 'POST',
      data: {
        action: 'test_netsuite_connection', // Ensure this action is correct
        nonce: this.settings.nonce // Use nonce from this.settings
      }
    })
      .then(response => {
        // Assuming response is { success: true/false, data: { message: "..." } } or { message: "..." }
        const message = (response.data && response.data.message) ? response.data.message : response.message;
        $result.html(`<span style="color:green;">${message || 'Connection successful.'}</span>`);
      })
      .catch(error => {
        const errorMessage = (error && error.message) ? error.message : (i18n.error || 'Error');
        $result.html(`<span style="color:red;">${errorMessage}</span>`);
      })
      .finally(() => {
        $button.prop('disabled', false);
      });
  }

  handleTabChanged(e, tabId) {
    if (tabId === this.settings.tab_id) {
      this.toggleNetsuiteFields(); // Refresh field visibility when tab becomes active
    }
    this.clearSubTabFromUrl();
  }

  validateUrl(e) {
    const $field = this.$(e.currentTarget);
    const value = $field.val().trim();
    const i18n = this.settings.i18n || (window.netsuiteSettings && window.netsuiteSettings.i18n) || {};

    if (value && !this.isValidUrl(value)) {
      this.showFieldError($field, i18n.invalidUrl || 'Please enter a valid URL.');
      return false;
    }
    this.clearFieldError($field);
    return true;
  }

  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  }

  validateRequestLimit(e) {
    const $field = this.$(e.currentTarget);
    const value = parseInt($field.val(), 10);
    const i18n = this.settings.i18n || (window.netsuiteSettings && window.netsuiteSettings.i18n) || {};


    if (isNaN(value) || value < 1 || value > 100) { // Example range
      this.showFieldError($field, i18n.requestLimitError || 'Request limit must be between 1 and 100.');
      return false;
    }
    this.clearFieldError($field);
    return true;
  }

  validateCacheTime(e) {
    const $field = this.$(e.currentTarget);
    const value = parseInt($field.val(), 10);
    const i18n = this.settings.i18n || (window.netsuiteSettings && window.netsuiteSettings.i18n) || {};

    if (isNaN(value) || value < 0) { // Example: must be non-negative
      this.showFieldError($field, i18n.cacheTimeError || 'Cache time must be at least 0.');
      return false;
    }
    this.clearFieldError($field);
    return true;
  }

  // showFieldError and clearFieldError are inherited.

  addInfoSection(message) { // Example of using imported createElement
    const $settingsTable = this.$('#netsuite-settings-table'); // Ensure this ID exists
    if (!$settingsTable.length || !message) return;

    this.$('.netsuite-info-section').remove(); // Remove existing

    const infoSection = createElement('div', { // createElement from @utils/dom
      className: 'netsuite-info-section notice notice-info',
      style: { padding: '10px', marginBottom: '15px' },
      innerHTML: message // Assuming message can be HTML
    });

    $settingsTable.before(infoSection);
  }
}

jQuery(document).ready(function() {
  if (jQuery('#netsuite').length) { // Assuming 'netsuite' is the ID of the tab content
    window.NetsuiteSettingsModuleInstance = new NetsuiteSettingsModule();
  }
});

export default NetsuiteSettingsModule;
