/**
 * General Settings JavaScript
 *
 * Handles functionality specific to the general settings tab.
 */
import { showFieldError, clearFieldError, showNotice, log } from '@utils';
import { ajax } from '@utils';
import { dom } from '@utils';
import { validation } from '@utils';

class GeneralSettingsModule {
  /**
   * Initialize the module
   */
  constructor() {
    // Wait for document ready
    jQuery(document).ready(() => this.init());
  }

  /**
   * Initialize the module
   */
  init() {
    this.mediaFrame = null;
    this.bindEvents();
    this.setupValidation();
    this.setupWpEditors();

    log('GeneralSettingsModule', 'Initialized');
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    const $ = jQuery;

    // Listen for tab changes
    $(document).on('product_estimator_tab_changed', this.handleTabChanged.bind(this));
    $('.file-upload-button').on('click', this.handleFileUpload.bind(this));
    $('.file-remove-button').on('click', this.handleFileRemove.bind(this));
  }

  /**
   * Set up WordPress Rich Text Editors
   */
  setupWpEditors() {
    const $ = jQuery;

    // Check if we're on the general settings tab
    if ($('#general').length === 0) {
      return;
    }

    // Initialize TinyMCE if not already initialized
    if (typeof tinyMCE !== 'undefined' &&
      typeof tinyMCE.editors !== 'undefined' &&
      tinyMCE.editors.length === 0) {

      // These editors should have already been initialized by wp_editor(),
      // but we can trigger a refresh if needed
      if (typeof switchEditors !== 'undefined') {
        ['pdf_footer_text', 'pdf_footer_contact_details_content'].forEach(function(editorId) {
          if ($('#' + editorId).length > 0 && typeof tinyMCE.get(editorId) === 'undefined') {
            switchEditors.go(editorId, 'tmce');
          }
        });
      }
    }
  }

  /**
   * Handle file upload button click
   * @param {Event} e Click event
   */
  handleFileUpload(e) {
    e.preventDefault();
    const $ = jQuery;

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
  }

  /**
   * Handle file remove button click
   * @param {Event} e Click event
   */
  handleFileRemove(e) {
    e.preventDefault();
    const $ = jQuery;

    const button = $(e.currentTarget);
    const fieldId = button.data('field-id');

    // Clear the attachment ID
    $(`#${fieldId}`).val('').trigger('change');

    // Clear the preview
    button.siblings('.file-preview-wrapper').empty();

    // Hide the remove button
    button.addClass('hidden');
  }

  /**
   * Set up field validation
   */
  setupValidation() {
    const $ = jQuery;

    // Validate markup percentage
    $('#default_markup').on('change input', this.validateMarkup.bind(this));

    // Validate expiry days
    $('#estimate_expiry_days').on('change input', this.validateExpiryDays.bind(this));
  }

  /**
   * Validate markup percentage
   * @param {Event} e Input event
   */
  validateMarkup(e) {
    const $ = jQuery;
    const $input = $(e.currentTarget);
    const value = parseInt($input.val());
    const min = parseInt($input.attr('min') || 0);
    const max = parseInt($input.attr('max') || 100);

    if (isNaN(value) || value < min || value > max) {
      // Use the imported utility method instead of a local method
      showFieldError($input, generalSettingsData.i18n.validationErrorMarkup || `Value must be between ${min} and ${max}`);
      return false;
    } else {
      // Use the imported utility method instead of a local method
      clearFieldError($input);
      return true;
    }
  }

  /**
   * Validate expiry days
   * @param {Event} e Input event
   */
  validateExpiryDays(e) {
    const $ = jQuery;
    const $input = $(e.currentTarget);
    const value = parseInt($input.val());
    const min = parseInt($input.attr('min') || 1);
    const max = parseInt($input.attr('max') || 365);

    if (isNaN(value) || value < min || value > max) {
      // Use the imported utility method
      showFieldError($input, generalSettingsData.i18n.validationErrorExpiry || `Value must be between ${min} and ${max}`);
      return false;
    } else {
      // Use the imported utility method
      clearFieldError($input);
      return true;
    }
  }

  /**
   * Show field error message - now uses imported utility
   * @param {jQuery} $field The field element
   * @param {string} message Error message
   */
  showFieldError($field, message) {
    // First try to use the global utility in ProductEstimatorSettings
    if (typeof ProductEstimatorSettings !== 'undefined' &&
      typeof ProductEstimatorSettings.showFieldError === 'function') {
      ProductEstimatorSettings.showFieldError($field, message);
    } else {
      // Otherwise use the imported utility function directly
      showFieldError($field, message);
    }
  }

  /**
   * Clear field error message - now uses imported utility
   * @param {jQuery} $field The field element
   */
  clearFieldError($field) {
    // First try to use the global utility in ProductEstimatorSettings
    if (typeof ProductEstimatorSettings !== 'undefined' &&
      typeof ProductEstimatorSettings.clearFieldError === 'function') {
      ProductEstimatorSettings.clearFieldError($field);
    } else {
      // Otherwise use the imported utility function directly
      clearFieldError($field);
    }
  }

  /**
   * Handle tab changed event
   * @param {Event} e Tab changed event
   * @param {string} tabId The newly active tab ID
   */
  handleTabChanged(e, tabId) {
    // If our tab becomes active, refresh any dynamic content
    if (tabId === generalSettingsData.tab_id) {
      // Make sure editors are refreshed when switching to this tab
      this.setupWpEditors();
      log('GeneralSettingsModule', 'Tab changed to General Settings, refreshing editors');
    }
  }

  /**
   * Ensure TinyMCE content is saved to the textarea
   * This should be called before form submission
   */
  saveEditorContent() {
    if (typeof tinyMCE !== 'undefined') {
      // Save content from all active editors
      const editors = ['pdf_footer_text', 'pdf_footer_contact_details_content'];

      editors.forEach(function(editorId) {
        const editor = tinyMCE.get(editorId);
        if (editor) {
          editor.save();
        }
      });
    }
  }

  /**
   * Validate all fields in the form
   * @returns {boolean} Whether all fields are valid
   */
  validateAllFields() {
    let isValid = true;

    // Save editor content before validation
    this.saveEditorContent();

    // Validate markup
    if (!this.validateMarkup({
      currentTarget: jQuery('#default_markup')
    })) {
      isValid = false;
    }

    // Validate expiry days
    if (!this.validateExpiryDays({
      currentTarget: jQuery('#estimate_expiry_days')
    })) {
      isValid = false;
    }

    return isValid;
  }

  /**
   * Display notice message using utility
   * @param {string} message The message to display
   * @param {string} type The message type ('success' or 'error')
   */
  showNotice(message, type = 'success') {
    // Use the imported utility function
    showNotice(message, type);
  }
}

// Initialize when document is ready
jQuery(document).ready(function() {
  const module = new GeneralSettingsModule();

  // Patch the form submission to ensure editor content is saved
  const originalSubmit = jQuery('form.product-estimator-form').submit;
  jQuery('form.product-estimator-form').submit(function(e) {
    // Save editor content before submitting
    if (typeof GeneralSettingsModule !== 'undefined') {
      module.saveEditorContent();
    }
    // Call original handler
    return originalSubmit.apply(this, arguments);
  });

  // Make the module available globally
  window.GeneralSettingsModule = module;
});

export default GeneralSettingsModule;
