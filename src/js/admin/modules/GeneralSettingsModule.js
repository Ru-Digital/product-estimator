/**
 * General Settings Module JavaScript
 *
 * Handles functionality specific to the general settings tab.
 */
import { setupTinyMCEHTMLPreservation } from '@utils/tinymce-preserver';
import { createLogger } from '@utils';
import ProductEstimatorSettings from '../common/ProductEstimatorSettings'; // Adjust path as needed

const logger = createLogger('GeneralSettingsModule');

class GeneralSettingsModule extends ProductEstimatorSettings {
  /**
   * Initialize the module
   */
  constructor() {
    super({
      isModule: true,
      settingsObjectName: 'generalSettings', // Matches window.generalSettings
      defaultTabId: 'general', // Corrected from 'genaral' if that was a typo
    });
    // this.$ and this.settings are initialized by super()

    // Bind methods that will be used as event handlers or callbacks
    // This is done in constructor as they are instance-specific and need `this`
    this.validateMarkup = this.validateMarkup.bind(this);
    this.validateExpiryDays = this.validateExpiryDays.bind(this);
    this.handleFileUpload = this.handleFileUpload.bind(this);
    this.handleFileRemove = this.handleFileRemove.bind(this);
    this.handleTabChanged = this.handleTabChanged.bind(this); // Ensure this is bound if used as event handler directly
    // No need to bind showFieldError, clearFieldError as they are called as this.showFieldError()
  }

  /**
   * Module-specific initialization.
   */
  moduleInit() {
    this.mediaFrame = null;
    this.bindEvents();
    this.setupValidation();
    this.setupWpEditors(); // Must be called after tab is potentially visible or DOM ready for editors

    // Validate all fields on load if needed, or on tab activation
    // this.validateAllFields(); // Consider if this is needed on init or tab change
    logger.log('General Settings Module Initialized');
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    this.$(document).on('product_estimator_tab_changed', this.handleTabChanged);
    this.$('.select-file-button').on('click', this.handleFileUpload);
    this.$('.remove-file-button').on('click', this.handleFileRemove);

    // Form submission for this specific module's form can be handled here if necessary,
    // or rely on the main ProductEstimatorSettings handler if the form structure matches.
    // If this module has its own form with a specific ID/class, handle it here:
    // this.$('#general-settings-form').on('submit', this.handleFormSubmit.bind(this));
  }

  /**
   * Setup TinyMCE editors.
   */
  setupWpEditors() {
    setupTinyMCEHTMLPreservation(
      ['pdf_footer_text', 'pdf_footer_contact_details_content'],
      '#general' // Assuming '#general' is the ID of the tab content
    );
    logger.log('WP Editors setup/refreshed for General Settings.');
  }

  handleFileUpload(e) {
    e.preventDefault();
    const button = this.$(e.currentTarget);
    const targetInputSelector = button.data('target-input'); // Use the data-target-input attribute
    const targetPreviewSelector = button.data('target-preview'); // Use the data-target-preview attribute
    const acceptType = button.data('accept') || '';

    if (this.mediaFrame) {
      this.mediaFrame.open();
      return;
    }

    this.mediaFrame = wp.media({
      title: 'Select or Upload PDF Template',
      button: { text: 'Use this file' },
      multiple: false,
      library: { type: 'application/pdf' } // Only allow PDF files
    });

    this.mediaFrame.on('select', () => {
      const attachment = this.mediaFrame.state().get('selection').first().toJSON();
      logger.log('Selected attachment:', attachment);

      if (attachment && attachment.id) {
        // Use the target input selector from the data attribute
        if (targetInputSelector) {
          this.$(targetInputSelector).val(attachment.id).trigger('change');
          logger.log(`Updated input ${targetInputSelector} with attachment ID: ${attachment.id}`);
        } else {
          logger.error('Target input selector not found in data-target-input attribute');
        }
      } else {
        logger.error('Attachment or attachment.id is missing!', attachment);
      }

      // Use the target preview selector from the data attribute
      const $previewWrapper = targetPreviewSelector ?
        this.$(targetPreviewSelector) :
        button.siblings('.file-preview-wrapper');

      // Create a simpler preview that matches the design in the second image
      const fileSize = this._formatFileSize(attachment.filesizeInBytes || 0);
      $previewWrapper.html(`
        <div class="file-preview">
          <span class="file-icon dashicons dashicons-pdf"></span>
          <div class="file-details">
            <span class="file-name">
              <a href="${attachment.url}" target="_blank">
                ${attachment.filename}
              </a>
               ${fileSize ? `(${fileSize} PDF Document)` : ''}
            </span>
          </div>
        </div>
      `);

      // Add the file info text below the file preview if not already present
      if (!this.$('.upload-instructions').length) {
        $previewWrapper.after(`<span class="upload-instructions">Upload a PDF template file (optional) *<br>Accepted format: application/pdf</span>`);
      }
      // Show the remove button
      button.siblings('.remove-file-button').removeClass('hidden');

      // Update the button text to "Replace File"
      button.text('Replace File');
    });
    this.mediaFrame.open();
  }

  handleFileRemove(e) {
    e.preventDefault();
    const button = this.$(e.currentTarget);
    const targetInputSelector = button.data('target-input');
    const targetPreviewSelector = button.data('target-preview');
    const uploadButton = button.siblings('.select-file-button');

    if (targetInputSelector) {
      this.$(targetInputSelector).val('').trigger('change');
      logger.log(`Cleared input ${targetInputSelector}`);
    } else {
      logger.error('Target input selector not found in data-target-input attribute');
    }

    if (targetPreviewSelector) {
      this.$(targetPreviewSelector).empty();
    } else {
      button.siblings('.file-preview-wrapper').empty();
    }

    // Hide the remove button
    button.addClass('hidden');

    // Update the text on the upload button from "Replace File" to "Upload File"
    if (uploadButton.length) {
      uploadButton.text('Upload File');
      logger.log('Reset upload button text to "Upload File"');
    }

    // Remove the upload instructions if they were added
    this.$('.upload-instructions').remove();
  }

  setupValidation() {
    this.$('#default_markup').on('change input', this.validateMarkup);
    this.$('#estimate_expiry_days').on('change input', this.validateExpiryDays);
  }

  validateMarkup(e) {
    const $input = this.$(e.currentTarget);
    const value = parseInt($input.val(), 10);
    const min = parseInt($input.attr('min') || 0, 10);
    const max = parseInt($input.attr('max') || 100, 10);

    // Use generalSettings.i18n if available, otherwise use this.settings.i18n
    const i18n = (window.generalSettings && window.generalSettings.i18n) || this.settings.i18n || {};


    if (isNaN(value) || value < min || value > max) {
      this.showFieldError($input, i18n.validationErrorMarkup || `Value must be between ${min} and ${max}.`);
      return false;
    }
    this.clearFieldError($input);
    return true;
  }

  validateExpiryDays(e) {
    const $input = this.$(e.currentTarget);
    const value = parseInt($input.val(), 10);
    const min = parseInt($input.attr('min') || 1, 10);
    const max = parseInt($input.attr('max') || 365, 10);

    const i18n = (window.generalSettings && window.generalSettings.i18n) || this.settings.i18n || {};

    if (isNaN(value) || value < min || value > max) {
      this.showFieldError($input, i18n.validationErrorExpiry || `Value must be between ${min} and ${max}.`);
      return false;
    }
    this.clearFieldError($input);
    return true;
  }

  handleTabChanged(e, tabId) {
    if (tabId === this.settings.tab_id) { // Use this.settings.tab_id from base class
      this.setupWpEditors(); // Refresh editors when tab becomes active
      logger.log('General Settings tab activated, refreshing editors.');
    }
    this.clearSubTabFromUrl(); // Common URL clearing
  }

  saveEditorContent() {
    if (typeof tinyMCE !== 'undefined') {
      const editors = ['pdf_footer_text', 'pdf_footer_contact_details_content'];
      editors.forEach((editorId) => {
        const editor = tinyMCE.get(editorId);
        if (editor) {
          editor.save();
        }
      });
      logger.log('TinyMCE editor content saved.');
    }
  }

  validateAllFields() {
    let isValid = true;
    this.saveEditorContent(); // Save editor content before validation

    // Trigger change event to run validation
    if (!this.validateMarkup({ currentTarget: this.$('#default_markup')[0] })) isValid = false;
    if (!this.validateExpiryDays({ currentTarget: this.$('#estimate_expiry_days')[0] })) isValid = false;

    logger.log('All fields validation result:', isValid);
    return isValid;
  }

  /**
   * Format file size in bytes to a human-readable format
   * @param {number} bytes - Size in bytes
   * @return {string} Formatted size (e.g., "256 KB")
   */
  _formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // showFieldError, clearFieldError, showNotice are inherited from ProductEstimatorSettings
  // No need to redefine them here.
}

jQuery(document).ready(function() {
  // Ensure module is only instantiated if its corresponding UI is present.
  if (jQuery('#general').length) { // Assuming 'general' is the ID of the tab content
    window.GeneralSettingsModuleInstance = new GeneralSettingsModule();
  }
});

export default GeneralSettingsModule;
