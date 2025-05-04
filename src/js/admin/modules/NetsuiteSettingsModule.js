/**
 * NetSuite Settings JavaScript
 *
 * Handles functionality specific to the NetSuite integration settings tab.
 */
import { showFieldError, clearFieldError } from '@utils/validation';
import { log } from '@utils';
import { ajaxRequest } from '@utils/ajax';
import { createElement } from '@utils/dom';

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
    log('NetsuiteSettingsModule', 'Initializing NetSuite settings module');

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

    // log('NetsuiteSettingsModule', 'Events bound successfully');
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

    log('NetsuiteSettingsModule', 'Dependent fields setup complete');
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

    log('NetsuiteSettingsModule', `NetSuite fields toggled: ${enabled ? 'visible' : 'hidden'}`);
  }

  // Rest of the class remains the same...
}

// Initialize the module
jQuery(document).ready(function() {
  const module = new NetsuiteSettingsModule();

  // Export the module globally for backward compatibility
  window.NetsuiteSettingsModule = module;
});

export default NetsuiteSettingsModule;
