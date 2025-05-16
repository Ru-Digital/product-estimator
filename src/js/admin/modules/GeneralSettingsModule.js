/**
 * General Settings Module JavaScript
 *
 * Handles functionality specific to the general settings tab.
 * Extends VerticalTabbedModule for common vertical tab and form handling.
 */
import { setupTinyMCEHTMLPreservation } from '@utils/tinymce-preserver';
import { createLogger } from '@utils';

import VerticalTabbedModule from '../common/VerticalTabbedModule';

const logger = createLogger('GeneralSettingsModule');

class GeneralSettingsModule extends VerticalTabbedModule {
  constructor() {
    const config = {
      mainTabId: 'general',
      defaultSubTabId: 'settings',
      ajaxActionPrefix: 'save_general',
      localizedDataName: 'generalSettings'
    };

    super(config); // Calls AdminTableManager constructor


    // DOM elements cache
    this.dom = {};

    this.$(document).on(`admin_table_manager_ready_${this.config.mainTabId}`, () => {
      this.validateMarkup = this.validateMarkup.bind(this);
      this.validateExpiryDays = this.validateExpiryDays.bind(this);
      this.handleFileUpload = this.handleFileUpload.bind(this);
      this.handleFileRemove = this.handleFileRemove.bind(this);
      this.setupTinyMCEEditors = this.setupTinyMCEEditors.bind(this);
      this.onSubTabActivated = this.onSubTabActivated.bind(this);
      this.validateSelect2Field = this.validateSelect2Field.bind(this);
      this._initializeSelect2 = this._initializeSelect2.bind(this);
      this._cacheDOM = this._cacheDOM.bind(this);
    });
    // Bind methods that will be used as event handlers or callbacks

  }

  /**
   * Bind module-specific events beyond what the parent class handles
   */
  bindModuleSpecificEvents() {
    super.bindModuleSpecificEvents();

    // Only bind events if container exists
    if (!this.$container || !this.$container.length) {
      return;
    }

    // Cache DOM elements
    this._cacheDOM();

    this.$('.select-file-button').on('click', this.handleFileUpload);
    this.$('.remove-file-button').on('click', this.handleFileRemove);

    // Add validation events
    this.$('#default_markup').on('change input', this.validateMarkup);
    this.$('#estimate_expiry_days').on('change input', this.validateExpiryDays);
    this.$('#pdf_template').on('change', this.validateFileInput.bind(this, 'pdf_template'));

    // Select2 field validation
    if (this.dom.primaryProductCategories) {
      this.dom.primaryProductCategories.on('change', () => this.validateSelect2Field('primary_product_categories'));
    }

    // Listen for sub-tab changes
    this.$(document).on(`pe_sub_tab_changed_${this.settings.tab_id}`, (e, subTabId) => {
      this.onSubTabActivated(subTabId);
    });

    // Initialize Select2 when ready
    this._initializeSelect2();
  }

  /**
   * Override for actions when the main "General" tab is activated.
   */
  onMainTabActivated() {
    super.onMainTabActivated();

    // Setup the editors when the tab is activated
    const activeSubTabId = this.getActiveSubTabId();
    if (activeSubTabId) {
      this.setupTinyMCEEditors(activeSubTabId);

      // Reinitialize Select2 fields on the settings tab
      if (activeSubTabId === 'settings') {
        // Re-cache DOM elements since they might not have been available on initial load
        this._cacheDOM();
        // Refresh Select2 components if they're already initialized
        if (this.dom.primaryProductCategories && this.dom.primaryProductCategories.hasClass("select2-hidden-accessible")) {
          this.refreshSelect2(this.dom.primaryProductCategories);
        }
      }
    }
  }

  /**
   * Get the currently active sub-tab ID
   */
  getActiveSubTabId() {
    if (!this.$container || !this.$container.length) {
      return this.vtmConfig.defaultSubTabId;
    }

    const activeTabContent = this.$container.find('.vertical-tab-content.active, .pe-vtabs-tab-panel.active');
    if (activeTabContent.length) {
      return activeTabContent.data('tab-id') || activeTabContent.attr('id');
    }

    // Try to get from URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlSubTab = urlParams.get('sub_tab');
    if (urlSubTab) {
      return urlSubTab;
    }

    // Fallback to default
    return this.vtmConfig.defaultSubTabId;
  }

  /**
   * Called when sub-tab is changed - needs to setup TinyMCE and field validation
   * @param subTabId
   */
  onSubTabActivated(subTabId) {
    logger.log(`Sub-tab activated: ${subTabId}`);

    // Setup TinyMCE for the active tab
    this.setupTinyMCEEditors(subTabId);

    // Reinitialize Select2 fields if we're on the settings tab
    if (subTabId === 'settings') {
      // Re-cache DOM elements since they might not have been available on initial load
      this._cacheDOM();
      this._initializeSelect2();
    }
  }

  /**
   * Initialize TinyMCE editors for the given sub-tab
   * @param subTabId
   */
  setupTinyMCEEditors(subTabId) {
    // Map sub-tab IDs to editor fields
    const editorFields = {
      'pdf-settings': ['pdf_footer_text', 'pdf_footer_contact_details_content'],
      // Add other sub-tabs with their editor fields
    };

    // If this sub-tab has editors, initialize them
    if (editorFields[subTabId]) {
      logger.log(`Setting up TinyMCE editors for ${subTabId}: ${editorFields[subTabId].join(', ')}`);
      setupTinyMCEHTMLPreservation(
        editorFields[subTabId],
        `#${this.settings.mainTabId} .vertical-tab-content[data-tab-id="${subTabId}"]`
      );
    }
  }

  handleFileUpload(e) {
    e.preventDefault();
    const button = this.$(e.currentTarget);
    const targetInputSelector = button.data('target-input'); // Use the data-target-input attribute
    const targetPreviewSelector = button.data('target-preview'); // Use the data-target-preview attribute

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

      if (attachment && attachment.id) {
        // Use the target input selector from the data attribute
        if (targetInputSelector) {
          this.$(targetInputSelector).val(attachment.id).trigger('change');
        } else {
          logger.warn('No target input selector found for file upload');
        }
      } else {
        logger.warn('Invalid attachment selected from media library');
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
    }

    // Remove the upload instructions if they were added
    this.$('.upload-instructions').remove();
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

  /**
   * Override validateAllFields to save editor content before validation
   */
  validateAllFields() {
    this.saveEditorContent(); // Save editor content before validation

    let isValid = super.validateAllFields();

    // Also validate file inputs
    if (!this.validateFileInput('pdf_template')) {
      isValid = false;
    }

    // Validate select2 fields
    if (!this.validateSelect2Field('primary_product_categories')) {
      isValid = false;
    }

    return isValid;
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
    }
  }

  /**
   * Validate file input fields
   * @param {string} fieldId - The ID of the file input field
   */
  validateFileInput(fieldId) {
    const $input = this.$(`#${fieldId}`);
    const value = $input.val();
    const isRequired = $input.prop('required') || $input.data('required') === true;

    const i18n = (window.generalSettings && window.generalSettings.i18n) || this.settings.i18n || {};

    if (isRequired && !value) {
      this.showFieldError($input, i18n.validationErrorRequired || 'This field is required.');
      return false;
    }

    this.clearFieldError($input);
    return true;
  }


  /**
   * Validate a Select2 field
   * @param {string} fieldId - The ID of the select2 field
   * @returns {boolean} Whether the field is valid
   */
  validateSelect2Field(fieldId) {
    const $select = this.$(`#${fieldId}`);
    if (!$select.length) {return true; }

    const isRequired = $select.prop('required') || $select.data('required') === true;
    const value = $select.val();
    const isEmpty = !value || (Array.isArray(value) && value.length === 0);

    if (isRequired && isEmpty) {
      this.showFieldError($select, 'This field is required.');
      return false;
    }

    this.clearFieldError($select);
    return true;
  }

  /**
   * Cache DOM elements for later use
   * @private
   */
  _cacheDOM() {
    // Cache the select2 elements
    if (!this.dom) {
      this.dom = {};
    }
    this.dom.primaryProductCategories = this.$('#primary_product_categories');

    // Log cache status for debugging
    if (this.dom.primaryProductCategories && this.dom.primaryProductCategories.length) {
      logger.log('Successfully cached DOM element for primary categories');
    } else {
      logger.warn('Failed to cache primary categories DOM element - element not found');
    }
  }

  /**
   * Initialize Select2 dropdowns
   * @private
   */
  _initializeSelect2() {
    this.initializeSelect2Dropdowns({
      elements: [
        {
          element: this.dom.primaryProductCategories,
          placeholderKey: 'primaryProductCategories',
          fallbackText: 'Select primary product categories',
          name: 'primary product categories',
          config: {
            width: '100%',
            dropdownAutoWidth: true,
            minimumResultsForSearch: 0,
            matcher: (params, data) => {
              // If there are no params or no search term, return all data
              if (!params || !params.term) {
                return data;
              }
              
              // Search in the text field
              if (data.text.toLowerCase().indexOf(params.term.toLowerCase()) > -1) {
                return data;
              }
              
              // Return null if the term doesn't match
              return null;
            }
            // templateResult is now provided by the base class
          }
        }
      ],
      moduleName: 'General Settings'
    });
  }

  /**
   * Format file size in bytes to a human-readable format
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size (e.g., "256 KB")
   */
  _formatFileSize(bytes) {
    if (bytes === 0) {return '0 Bytes';}

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

jQuery(document).ready(function($) {
  // Ensure module is only instantiated if its corresponding UI is present.
  if ($('#general').length) {
    window.GeneralSettingsModuleInstance = new GeneralSettingsModule();
  } else {
    logger.warn('Container #general not found. GeneralSettingsModule will not be initialized.');
  }
});

export default GeneralSettingsModule;
