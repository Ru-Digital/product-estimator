/**
 * General Settings Module JavaScript
 *
 * Handles functionality specific to the general settings tab.
 *
 * FIXED VERSION: Adds proper method bindings and context preservation
 */
class GeneralSettingsModule {
  /**
   * Initialize the module
   */
  constructor() {
    // Bind methods to ensure 'this' context is preserved
    this.validateMarkup = this.validateMarkup.bind(this);
    this.validateExpiryDays = this.validateExpiryDays.bind(this);
    this.showFieldError = this.showFieldError.bind(this);
    this.clearFieldError = this.clearFieldError.bind(this);
    this.handleTabChanged = this.handleTabChanged.bind(this);
    this.saveEditorContent = this.saveEditorContent.bind(this);
    this.validateAllFields = this.validateAllFields.bind(this);

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

    console.log('GeneralSettingsModule: Initialized');
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
   * Set up WordPress Rich Text Editors with fallback for missing plugins
   * This version removes dependence on the table plugin that is missing
   */
  /**
   * Set up WordPress Rich Text Editors without the table plugin
   */
// In the setupWpEditors function
  /**
   * Fixed version of the setupWpEditors function in GeneralSettingsModule.js
   * This fixes issues with TinyMCE editor initialization for HTML content fields
   */
  /**
   * Fixed version of the setupWpEditors function for GeneralSettingsModule.js
   * This properly handles TinyMCE initialization and prevents HTML stripping
   */
  /**
   * Improved setupWpEditors function that preserves HTML during mode switching
   * without triggering form submission until the Save button is clicked
   */
  /**
   * Improved setupWpEditors function with specific fixes for <br> tags
   * This preserves HTML, especially <br> tags, when switching between modes
   */
  setupWpEditors() {
    const $ = jQuery;

    // Check if we're on the general settings tab
    if ($('#general').length === 0) {
      return;
    }

    console.log('Setting up rich text editors with <br> tag preservation');

    // Target editor IDs that need HTML preservation
    const editorIds = ['pdf_footer_text', 'pdf_footer_contact_details_content'];

    // Store original HTML content to restore after mode switches
    window._originalEditorContent = window._originalEditorContent || {};

    // Function to prepare content for the Visual editor
    // This specifically handles the <br> tag issue
    const prepareForVisualEditor = (content) => {
      // Ensure <br> tags are properly preserved by adding a marker
      // TinyMCE often strips solo <br> tags, so we add a zero-width space after them
      return content.replace(/<br\s*\/?>/gi, '<br>\u200B');
    };

    // Function to clean up content when retrieving from the Visual editor
    const cleanupFromVisualEditor = (content) => {
      // Remove any zero-width spaces we added
      return content.replace(/\u200B/g, '');
    };

    // Function to properly initialize TinyMCE with br tag preservation
    const initEditor = (editorId) => {
      if (!tinyMCE || !tinyMCE.get(editorId)) {
        return false;
      }

      const editor = tinyMCE.get(editorId);

      // Configure editor for HTML preservation
      editor.settings.wpautop = false;
      editor.settings.forced_root_block = '';
      editor.settings.valid_elements = '*[*]';
      editor.settings.entity_encoding = 'raw';
      editor.settings.verify_html = false;
      editor.settings.br_in_pre = false;

      // Additional BR specific settings
      editor.settings.keep_styles = true;
      editor.settings.remove_linebreaks = false;
      editor.settings.convert_newlines_to_brs = true;
      editor.settings.remove_redundant_brs = false;

      // Get raw content from textarea
      const $textarea = $(`#${editorId}`);
      if ($textarea.length) {
        const rawContent = $textarea.val();
        window._originalEditorContent[editorId] = rawContent;

        // Set the content in editor with our <br> preservation function
        setTimeout(() => {
          const preparedContent = prepareForVisualEditor(rawContent);
          editor.setContent(preparedContent, {format: 'raw'});
        }, 100);
      }

      // Add event listeners for content filtering

      // Process content before it's set in the editor
      editor.on('BeforeSetContent', function(e) {
        if (e.content) {
          // Process the content to preserve <br> tags
          e.content = prepareForVisualEditor(e.content);
        }

        // Store original content if this is initial load or switching from text mode
        if (e.initial || e.source_view) {
          window._originalEditorContent[editorId] = e.content;
        }
      });

      // Process content when it's retrieved from the editor
      editor.on('GetContent', function(e) {
        if (e.content) {
          // Clean up our marker characters
          e.content = cleanupFromVisualEditor(e.content);
        }
      });

      // Capture raw content when editor is initialized
      editor.on('init', function() {
        const content = editor.getContent({format: 'raw'});
        window._originalEditorContent[editorId] = cleanupFromVisualEditor(content);
        console.log(`Editor ${editorId} initialized with content length: ${content.length}`);
      });

      // Prevent content loss when switching modes
      const $tabButtons = $(`.wp-editor-tabs button[data-wp-editor-id="${editorId}"]`);
      $tabButtons.on('click', function() {
        const isTextMode = $(this).hasClass('switch-html');
        const isVisualMode = $(this).hasClass('switch-tmce');

        if (isTextMode) {
          // Switching to text mode - get content from visual editor first
          if (tinyMCE.get(editorId)) {
            const content = tinyMCE.get(editorId).getContent({format: 'raw'});
            const cleanContent = cleanupFromVisualEditor(content);
            window._originalEditorContent[editorId] = cleanContent;
            // Update the textarea directly with clean content
            $(`#${editorId}`).val(cleanContent);
          }
        }

        if (isVisualMode) {
          // Switching to visual mode - restore original content after a delay
          setTimeout(() => {
            if (tinyMCE.get(editorId) && window._originalEditorContent[editorId]) {
              const preparedContent = prepareForVisualEditor(window._originalEditorContent[editorId]);
              tinyMCE.get(editorId).setContent(preparedContent, {format: 'raw'});
            }
          }, 100);
        }
      });

      console.log(`Editor ${editorId} configured with <br> tag protection`);
      return true;
    };

    // Initialize editors
    const initEditors = () => {
      if (typeof tinyMCE !== 'undefined' && tinyMCE.editors) {
        let allInitialized = true;

        editorIds.forEach(id => {
          if (!initEditor(id)) {
            allInitialized = false;
          }
        });

        return allInitialized;
      }
      return false;
    };

    // Try to initialize immediately
    if (!initEditors()) {
      // If not successful, poll until ready
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (initEditors() || attempts > 20) {
          clearInterval(interval);
        }
      }, 300);
    }

    // Ensure text mode changes are stored
    editorIds.forEach(id => {
      $(`#${id}`).on('input change', function() {
        window._originalEditorContent[id] = $(this).val();
      });
    });

    // Handle form submission to ensure HTML content is preserved
    $('#general form').off('submit.htmlPreservation').on('submit.htmlPreservation', function() {
      // Update all editor content before form submission
      editorIds.forEach(function(id) {
        let finalContent = '';

        // First try to get content from active editor (Visual or Text)
        if (tinyMCE.get(id) && tinyMCE.get(id).isHidden()) {
          // Text mode is active - get directly from textarea
          const $textarea = $(`#${id}`);
          if ($textarea.length) {
            finalContent = $textarea.val();
          }
        } else if (tinyMCE.get(id)) {
          // Visual mode is active - get from editor and clean up
          const content = tinyMCE.get(id).getContent({format: 'raw'});
          finalContent = cleanupFromVisualEditor(content);
        }

        // If no content found but we have stored content, use that
        if (!finalContent && window._originalEditorContent[id]) {
          finalContent = window._originalEditorContent[id];
        }

        // Update the textarea with final content
        if (finalContent) {
          $(`#${id}`).val(finalContent);
          console.log(`Form submission: Updated ${id} with content length: ${finalContent.length}`);
        }
      });

      // Let the form submit normally
      return true;
    });

    // Add a debug button in debug mode
    if (window.productEstimatorVars?.debug) {
      const $debugButton = $('<button type="button" class="button debug-editor-content">Debug Editor Content</button>');
      $('#general form .submit').append($debugButton);

      $debugButton.on('click', function(e) {
        e.preventDefault();
        console.group('TinyMCE Editor Debug');

        editorIds.forEach(id => {
          console.group(`Editor: ${id}`);

          // Check visual editor content
          if (tinyMCE.get(id)) {
            const visualContent = tinyMCE.get(id).getContent({format: 'raw'});
            console.log('Visual Editor Content:', visualContent);
            console.log('Clean Visual Content:', cleanupFromVisualEditor(visualContent));
          } else {
            console.log('Visual Editor not available');
          }

          // Check textarea content
          const textareaContent = $(`#${id}`).val();
          console.log('Textarea Content:', textareaContent);

          // Check stored original content
          console.log('Stored Original Content:', window._originalEditorContent[id] || 'None');

          console.groupEnd();
        });

        console.groupEnd();
        alert('Editor content information has been logged to the console');
      });
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
      console.log('GeneralSettingsModule: Tab changed to General Settings, refreshing editors');
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
