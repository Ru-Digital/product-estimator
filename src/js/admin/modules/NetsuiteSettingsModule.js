/**
 * NetSuite Settings JavaScript
 *
 * Handles functionality specific to the NetSuite integration settings tab.
 */
import { showFieldError, clearFieldError } from '@utils/validation';
import { ajaxRequest } from '@utils/ajax';
import { createElement } from '@utils/dom';
import { createLogger } from '@utils';
const logger = createLogger('NetSuiteSettingsModule');

class NetsuiteSettingsModule {
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
    // Log initialization if debug mode is enabled
    logger.log('Initializing NetSuite settings module');

    this.bindEvents();
    this.setupDependentFields();
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    const $ = jQuery;

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

    // Add handler for form submission - THIS IS THE FIX
    $('.product-estimator-form').on('submit', this.handleFormSubmit.bind(this));

    // logger.log('Events bound successfully');
  }

  /**
   * Handle form submission - THIS IS THE NEW METHOD
   * @param {Event} e Submit event
   */
  handleFormSubmit(e) {
    // Only handle if this is our tab's form
    const $ = jQuery;
    const $form = $(e.currentTarget);

    // Make sure we're on the netsuite tab
    if ($form.closest('#netsuite').length === 0) {
      return; // Let the default handler process it
    }

    e.preventDefault();

    // Get the serialized form data
    let formData = $form.serialize();

    // Fix for checkbox fields - add unchecked checkboxes to the data
    const checkboxFields = $form.find('input[type="checkbox"]');
    checkboxFields.each(function() {
      const checkboxName = $(this).attr('name');
      if (!$(this).is(':checked') && !formData.includes(checkboxName)) {
        formData += '&' + checkboxName + '=0';
      }
    });

    // Show loading state
    const $submitBtn = $form.find(':submit');
    $submitBtn.prop('disabled', true);
    $submitBtn.data('original-text', $submitBtn.val());
    $submitBtn.val('Saving...');

    // Send the AJAX request
    ajaxRequest({
      url: netsuiteSettings.ajax_url,
      type: 'POST',
      data: {
        action: 'save_netsuite_settings',
        nonce: netsuiteSettings.nonce,
        form_data: formData
      }
    })
      .then(response => {
        // Show success message
        if (typeof ProductEstimatorSettings !== 'undefined' &&
          typeof ProductEstimatorSettings.showNotice === 'function') {
          ProductEstimatorSettings.showNotice(response.message || 'Settings saved successfully', 'success');
        } else {
          showNotice(response.message || 'Settings saved successfully', 'success');
        }

        // Reset form change state
        if (typeof ProductEstimatorSettings !== 'undefined') {
          ProductEstimatorSettings.formChanged = false;

          if (ProductEstimatorSettings.formChangeTrackers) {
            ProductEstimatorSettings.formChangeTrackers['netsuite'] = false;
          }
        }
      })
      .catch(error => {
        // Show error message
        if (typeof ProductEstimatorSettings !== 'undefined' &&
          typeof ProductEstimatorSettings.showNotice === 'function') {
          ProductEstimatorSettings.showNotice(error.message || 'Error saving settings', 'error');
        } else {
          showNotice(error.message || 'Error saving settings', 'error');
        }
      })
      .finally(() => {
        // Reset button
        $submitBtn.prop('disabled', false);
        $submitBtn.val($submitBtn.data('original-text'));
      });
  }

  /**
   * Set up dependent fields based on initial state
   */
  setupDependentFields() {
    // Initial toggle of fields based on enabled state
    this.toggleNetsuiteFields();

    logger.log('Dependent fields setup complete');
  }

  /**
   * Toggle NetSuite fields based on enabled checkbox
   */
  toggleNetsuiteFields() {
    const $ = jQuery;
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
  }

  /**
   * Test NetSuite API connection using the ajax utility
   */
  testNetsuiteConnection() {
    const $ = jQuery;
    const $button = $('#test-netsuite-connection');
    const $result = $('#connection-result');

    // Prevent multiple clicks
    if ($button.prop('disabled')) {
      return;
    }

    // Show testing state
    $button.prop('disabled', true);
    $result.html(`<span style="color:#666;">${netsuiteSettings.i18n.testing || 'Testing connection...'}</span>`);

    logger.log('Testing NetSuite connection');

    // Use the new ajaxRequest utility
    ajaxRequest({
      url: netsuiteSettings.ajax_url,
      type: 'POST',
      data: {
        action: 'test_netsuite_connection',
        nonce: netsuiteSettings.nonce
      }
    })
      .then(response => {
        // Success case - using the response.data directly since ajaxRequest handles the success/error parsing
        $result.html(`<span style="color:green;">${response.message}</span>`);
        logger.log('Connection test successful');
      })
      .catch(error => {
        // Error case
        $result.html(`<span style="color:red;">${netsuiteSettings.i18n.error || 'Error:'} ${error.message}</span>`);
        logger.log('Connection test failed:', error);
      })
      .finally(() => {
        $button.prop('disabled', false);
      });
  }

  /**
   * Handle tab changed event
   * @param {Event} e Tab changed event
   * @param {string} tabId The newly active tab ID
   */
  handleTabChanged(e, tabId) {
    // If our tab becomes active, refresh dependent fields
    if (tabId === netsuiteSettings.tab_id) {
      this.toggleNetsuiteFields();
      logger.log('Tab changed to NetSuite settings, refreshing fields');
    }
  }

  /**
   * Validate URL format
   * @param {Event} e Change event
   */
  validateUrl(e) {
    const $ = jQuery;
    const $field = $(e.currentTarget);
    const value = $field.val().trim();

    if (value && !this.isValidUrl(value)) {
      this.showFieldError($field, netsuiteSettings.i18n.invalidUrl || 'Please enter a valid URL');
      return false;
    }

    this.clearFieldError($field);
    return true;
  }

  /**
   * Validate request limit
   * @param {Event} e Change event
   */
  validateRequestLimit(e) {
    const $ = jQuery;
    const $field = $(e.currentTarget);
    const value = parseInt($field.val(), 10);

    if (isNaN(value) || value < 1 || value > 100) {
      this.showFieldError($field, 'Request limit must be between 1 and 100');
      return false;
    }

    this.clearFieldError($field);
    return true;
  }

  /**
   * Validate cache time
   * @param {Event} e Change event
   */
  validateCacheTime(e) {
    const $ = jQuery;
    const $field = $(e.currentTarget);
    const value = parseInt($field.val(), 10);

    if (isNaN(value) || value < 0) {
      this.showFieldError($field, 'Cache time must be at least 0');
      return false;
    }

    this.clearFieldError($field);
    return true;
  }

  /**
   * Check if a string is a valid URL
   * @param {string} url URL to validate
   * @returns {boolean} Whether URL is valid
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Show field error message using the validation utility
   * @param {jQuery} $field The field element
   * @param {string} message Error message
   */
  showFieldError($field, message) {
    if (typeof ProductEstimatorSettings !== 'undefined' &&
      typeof ProductEstimatorSettings.showFieldError === 'function') {
      ProductEstimatorSettings.showFieldError($field, message);
    } else {
      // Use the imported utility function
      showFieldError($field, message);
    }
  }

  /**
   * Clear field error message using the validation utility
   * @param {jQuery} $field The field element
   */
  clearFieldError($field) {
    if (typeof ProductEstimatorSettings !== 'undefined' &&
      typeof ProductEstimatorSettings.clearFieldError === 'function') {
      ProductEstimatorSettings.clearFieldError($field);
    } else {
      // Use the imported utility function
      clearFieldError($field);
    }
  }

  /**
   * Add a dynamic info section to the settings page
   * An example of using the DOM utility
   * @param {string} message The message to display
   */
  addInfoSection(message) {
    const $ = jQuery;
    const $settingsTable = $('#netsuite-settings-table');

    if (!$settingsTable.length || !message) return;

    // Remove any existing info section
    $('.netsuite-info-section').remove();

    // Use createElement utility to create the info section
    const infoSection = createElement('div', {
      className: 'netsuite-info-section notice notice-info',
      style: {
        padding: '10px',
        marginBottom: '15px'
      }
    }, message);

    // Insert before the settings table
    $settingsTable.before(infoSection);

    logger.log('Added info section to settings page');
  }}

// Initialize the module
jQuery(document).ready(function() {
  const module = new NetsuiteSettingsModule();

  // Export the module globally for backward compatibility
  window.NetsuiteSettingsModule = module;
});

export default NetsuiteSettingsModule;
