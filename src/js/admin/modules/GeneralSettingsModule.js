/**
 * General Settings Module JavaScript
 *
 * Handles functionality specific to the general settings tab.
 *
 * FIXED VERSION: Adds proper method bindings and context preservation
 */

import { setupTinyMCEHTMLPreservation } from '@utils/tinymce-preserver';
import { createLogger } from '@utils';
const logger = createLogger('GeneralSettings');

class GeneralSettingsModule {
  /**
   * Initialize the module
   */
  constructor() {
    $ = jQuery; // Make jQuery available as this.$

    // before this script runs or at least before init() is called.
    const localizedSettings = window.generalSettings || {};

    this.settings = {
      ajaxUrl: localizedSettings.ajaxUrl || (typeof ajaxurl !== 'undefined' ? ajaxurl : '/wp-admin/admin-ajax.php'),
      nonce: localizedSettings.nonce || '', // Fallback
      i18n: localizedSettings.i18n || {},   // Fallback
      tab_id: localizedSettings.tab_id || 'genaral', // Fallback
    };

    // Defer initialization to document.ready to ensure DOM is loaded
    $(document).ready(() => {
      // Re-check localizedSettings in case they are defined by another script in document.ready
      const updatedLocalizedSettingsOnReady = window.generalSettings || {};
      if (updatedLocalizedSettingsOnReady.nonce) {
        this.settings.nonce = updatedLocalizedSettingsOnReady.nonce;
      }

      this.validateMarkup = this.validateMarkup.bind(this);
      this.validateExpiryDays = this.validateExpiryDays.bind(this);
      this.showFieldError = this.showFieldError.bind(this);
      this.clearFieldError = this.clearFieldError.bind(this);
      this.handleTabChanged = this.handleTabChanged.bind(this);
      this.saveEditorContent = this.saveEditorContent.bind(this);
      this.validateAllFields = this.validateAllFields.bind(this);

      this.init();
    });
  }

  /**
   * Initialize the module
   */
  init() {
    this.mediaFrame = null;
    this.bindEvents();
    this.setupValidation();
    this.setupWpEditors();

    logger.log('Initialized');
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    const $ = jQuery;

    // Listen for tab changes
    $(document).on('product_estimator_tab_changed', this.handleTabChanged);
    $('.file-upload-button').on('click', this.handleFileUpload.bind(this));
    $('.file-remove-button').on('click', this.handleFileRemove.bind(this));
  }


  /**
   * Improved setupWpEditors function with specific fixes for <br> tags
   * This preserves HTML, especially <br> tags, when switching between modes
   */
  setupWpEditors() {
    // Call the utility with the same parameters that work in your original function
    setupTinyMCEHTMLPreservation(
      ['pdf_footer_text', 'pdf_footer_contact_details_content'],
      '#general'
    );
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
    this.mediaFrame.on('select', () => {
      const attachment = this.mediaFrame.state().get('selection').first().toJSON();

      // Set the attachment ID in the hidden input
      $(`#${fieldId}`).val(attachment.id).trigger('change');

      // Update the file preview
      const $previewWrapper = button.siblings('.file-preview-wrapper');
      $previewWrapper.html(`<p class="file-preview"><a href="${attachment.url}" target="_blank">${attachment.filename}</a></p>`);

      // Show the remove button
      button.siblings('.file-remove-button').removeClass('hidden');
    });

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
    $('#default_markup').on('change input', this.validateMarkup);

    // Validate expiry days
    $('#estimate_expiry_days').on('change input', this.validateExpiryDays);
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
      // Use the showFieldError method with proper binding
      this.showFieldError($input, generalSettingsData.i18n.validationErrorMarkup || `Value must be between ${min} and ${max}`);
      return false;
    } else {
      // Use the clearFieldError method with proper binding
      this.clearFieldError($input);
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
      this.showFieldError($input, generalSettingsData.i18n.validationErrorExpiry || `Value must be between ${min} and ${max}`);
      return false;
    } else {
      // Use the imported utility method
      this.clearFieldError($input);
      return true;
    }
  }

  /**
   * Show field error message
   * @param {jQuery} $field The field element
   * @param {string} message Error message
   */
  showFieldError($field, message) {
    // First try to use the global utility in ProductEstimatorSettings
    if (typeof ProductEstimatorSettings !== 'undefined' &&
      typeof ProductEstimatorSettings.showFieldError === 'function') {
      ProductEstimatorSettings.showFieldError($field, message);
    } else if (typeof validation !== 'undefined' && typeof validation.showFieldError === 'function') {
      // Otherwise use the imported utility function directly
      validation.showFieldError($field, message);
    } else {
      // Fallback implementation
      $field.addClass('error');

      // Clear any existing error first
      this.clearFieldError($field);

      // Create error element
      const $error = jQuery(`<span class="field-error">${message}</span>`);

      // Add it after the field
      $field.after($error);
    }
  }

  /**
   * Clear field error message
   * @param {jQuery} $field The field element
   */
  clearFieldError($field) {
    // First try to use the global utility in ProductEstimatorSettings
    if (typeof ProductEstimatorSettings !== 'undefined' &&
      typeof ProductEstimatorSettings.clearFieldError === 'function') {
      ProductEstimatorSettings.clearFieldError($field);
    } else if (typeof validation !== 'undefined' && typeof validation.clearFieldError === 'function') {
      // Otherwise use the imported utility function directly
      validation.clearFieldError($field);
    } else {
      // Fallback implementation
      $field.removeClass('error');
      $field.next('.field-error').remove();
    }
  }

  /**
   * Handle tab changed event
   * @param {Event} e Tab changed event
   * @param {string} tabId The newly active tab ID
   */
  handleTabChanged(e, tabId) {
    // If our tab becomes active, refresh any dynamic content
    if (tabId === 'general') {
      // Make sure editors are refreshed when switching to this tab
      this.setupWpEditors();
      logger.log('Tab changed to General Settings, refreshing editors');
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
   * Display notice message
   * @param {string} message The message to show
   * @param {string} type Notice type ('success' or 'error')
   */
  showNotice(message, type = 'success') {
    // Use the global utility if available
    if (typeof ProductEstimatorSettings !== 'undefined' &&
      typeof ProductEstimatorSettings.showNotice === 'function') {
      ProductEstimatorSettings.showNotice(message, type);
    } else if (typeof validation !== 'undefined' &&
      typeof validation.showNotice === 'function') {
      // Use the imported utility function
      validation.showNotice(message, type);
    } else {
      // Basic fallback implementation
      const $ = jQuery;
      const $notice = $(`<div class="notice notice-${type} is-dismissible"><p>${message}</p></div>`);

      // Find a good place to show the notice
      $('.wrap h1').after($notice);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        $notice.fadeOut(500, () => $notice.remove());
      }, 5000);
    }
  }
}

// Initialize when document is ready
jQuery(document).ready(function() {
  // Make module available globally
  window.GeneralSettingsModule = new GeneralSettingsModule();
});

export default GeneralSettingsModule;
