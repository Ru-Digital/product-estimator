/**
 * Notification Settings JavaScript
 *
 * Handles functionality specific to the notification settings tab.
 */
import { showFieldError, clearFieldError, showNotice } from '@utils';
import { dom, ajax, validation } from '@utils';

class NotificationSettingsModule {
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
    this.mediaFrame = null; // Initialize mediaFrame property here
    this.bindEvents();
    this.setupDependentFields();
    this.setupVerticalTabs();
    this.setupMediaUploader();
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    const $ = jQuery;

    // Enable/disable toggle for notifications
    $('#enable_notifications').on('change', this.toggleNotificationFields.bind(this));

    // Individual notification type toggles
    $('[id^="notification_"][id$="_enabled"]').on('change', function(e) {
      const $toggle = $(e.currentTarget);
      const notificationType = $toggle.attr('id').replace('notification_', '').replace('_enabled', '');
      this.toggleNotificationTypeFields(notificationType, $toggle.is(':checked'));
    }.bind(this));

    // Image upload buttons
    $('.image-upload-button').on('click', this.handleImageUpload.bind(this));
    $('.image-remove-button').on('click', this.handleImageRemove.bind(this));

    // Email validation
    $('#from_email, #default_designer_email, #default_store_email').on('change', this.validateEmail.bind(this));

    // Listen for tab changes
    $(document).on('product_estimator_tab_changed', this.handleTabChanged.bind(this));

    // Form submission - convert to AJAX
    $('.notification-settings-form').on('submit', this.handleFormSubmit.bind(this));

    // Vertical tabs navigation
    $('.vertical-tabs-nav a').on('click', this.handleVerticalTabClick.bind(this));
  }

  /**
   * Toggle fields for a specific notification type
   * @param {string} notificationType The notification type
   * @param {boolean} enabled Whether this notification type is enabled
   */
  toggleNotificationTypeFields(notificationType, enabled) {
    const $ = jQuery;
    const $form = $(`.notification-type-form[data-type="${notificationType}"]`);
    const $fields = $form.find('input, textarea, button').not(`#notification_${notificationType}_enabled`);

    if (enabled) {
      $fields.prop('disabled', false);
    } else {
      $fields.prop('disabled', true);
    }
  }

  /**
   * Set up WordPress media uploader
   */
  setupMediaUploader() {
    // The mediaFrame property is now initialized in the init method
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
      this.showFieldError($field, notificationSettings.i18n.validationErrorEmail || 'Please enter a valid email address');
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
   * Set up dependent fields based on initial state
   */
  setupDependentFields() {
    const $ = jQuery;

    // Initial toggle of fields based on enabled state
    this.toggleNotificationFields();

    // Also toggle fields for individual notification types
    $('[id^="notification_"][id$="_enabled"]').each(function(i, el) {
      const $toggle = $(el);
      const notificationType = $toggle.attr('id').replace('notification_', '').replace('_enabled', '');
      this.toggleNotificationTypeFields(notificationType, $toggle.is(':checked'));
    }.bind(this));
  }

  /**
   * Toggle notification fields based on enabled checkbox
   */
  toggleNotificationFields() {
    const $ = jQuery;
    const enabled = $('#enable_notifications').is(':checked');
    const $verticalTabsNav = $('.vertical-tabs-nav');
    const $notificationForms = $('.notification-type-form');

    if (enabled) {
      $verticalTabsNav.removeClass('disabled');
      $notificationForms.find('input, textarea, button').prop('disabled', false);

      // Re-apply individual notification type toggles
      $('[id^="notification_"][id$="_enabled"]').each(function(i, el) {
        const $toggle = $(el);
        const notificationType = $toggle.attr('id').replace('notification_', '').replace('_enabled', '');
        this.toggleNotificationTypeFields(notificationType, $toggle.is(':checked'));
      }.bind(this));

    } else {
      $verticalTabsNav.addClass('disabled');
      $notificationForms.find('input, textarea, button').prop('disabled', true);
    }
  }

  /**
   * Set up vertical tabs
   */
  setupVerticalTabs() {
    const $ = jQuery;

    // First check URL parameters for sub_tab
    let activeTabId = 'notification_general'; // Default to notification_general

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
    window.history.pushState({}, '', `?page=product-estimator-settings&tab=notifications&sub_tab=${tabId}`);

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
   * Handle image upload button click
   * @param {Event} e Click event
   */
  handleImageUpload(e) {
    e.preventDefault();
    const $ = jQuery;

    const button = $(e.currentTarget);
    const fieldId = button.data('field-id');
    let mediaFrameInstance = this.mediaFrame;

    // If the media frame already exists, reopen it
    if (mediaFrameInstance) {
      mediaFrameInstance.open();
      return;
    }

    // Create media frame - ensure wp.media is available (WP admin)
    if (typeof wp !== 'undefined' && wp.media) {
      this.mediaFrame = wp.media({
        title: notificationSettings.i18n.selectImage || 'Select Image',
        button: {
          text: notificationSettings.i18n.useThisImage || 'Use this image'
        },
        multiple: false,
        library: {
          type: 'image'
        }
      });

      // Handle selection
      this.mediaFrame.on('select', function() {
        const attachment = this.mediaFrame.state().get('selection').first().toJSON();

        // Set hidden input value
        $(`#${fieldId}`).val(attachment.id).trigger('change');

        // Update image preview
        const $previewWrapper = button.closest('td').find('.image-preview-wrapper');
        $previewWrapper.html(`<img src="${attachment.sizes.medium ? attachment.sizes.medium.url : attachment.url}" alt="" style="max-width:200px;max-height:100px;display:block;margin-bottom:10px;" />`);

        // Show remove button
        button.closest('td').find('.image-remove-button').removeClass('hidden');
      }.bind(this));

      // Open media frame
      this.mediaFrame.open();
    } else {
      console.error('WordPress Media Library not available');
    }
  }

  /**
   * Handle image remove button click
   * @param {Event} e Click event
   */
  handleImageRemove(e) {
    e.preventDefault();
    const $ = jQuery;

    const button = $(e.currentTarget);
    const fieldId = button.data('field-id');

    // Clear hidden input value
    $(`#${fieldId}`).val('').trigger('change');

    // Clear image preview
    button.closest('td').find('.image-preview-wrapper').empty();

    // Hide remove button
    button.addClass('hidden');
  }

  /**
   * Handle tab changed event
   * @param {Event} e Tab changed event
   * @param {string} tabId The newly active tab ID
   */
  handleTabChanged(e, tabId) {
    // If our tab becomes active, refresh dependent fields
    if (tabId === notificationSettings.tab_id) {
      this.toggleNotificationFields();
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
    const type = $form.data('type') || 'notification_general';

    // Show loading state
    const $submitButton = $form.find('.save-settings');
    const $spinner = $form.find('.spinner');

    $submitButton.prop('disabled', true);
    $spinner.addClass('is-active');

    // Ensure TinyMCE editors are saved
    if (typeof tinyMCE !== 'undefined') {
      const activeEditors = tinyMCE.editors;
      for (let i = 0; i < activeEditors.length; i++) {
        activeEditors[i].save();
      }
    }

    // Ensure unchecked checkboxes are properly represented
    // This helps ensure all checkboxes are submitted even when unchecked
    let formDataStr = formData;
    const checkboxFields = $form.find('input[type="checkbox"]');
    checkboxFields.each(function() {
      if (!$(this).is(':checked') && !formDataStr.includes($(this).attr('name'))) {
        formDataStr += '&' + $(this).attr('name') + '=0';
      }
    });

    // Submit the form via AJAX using our ajax utility
    ajax.ajaxRequest({
      url: productEstimatorSettings.ajax_url,
      type: 'POST',
      data: {
        action: 'save_notifications_settings',
        nonce: productEstimatorSettings.nonce,
        form_data: formDataStr,
        notification_type: type
      }
    })
      .then(response => {
        // Show success message using our showNotice utility
        if (typeof ProductEstimatorSettings !== 'undefined' &&
          typeof ProductEstimatorSettings.showNotice === 'function') {
          ProductEstimatorSettings.showNotice(response.message || notificationSettings.i18n.saveSuccess, 'success');
        } else {
          showNotice(response.message || notificationSettings.i18n.saveSuccess, 'success');
        }
      })
      .catch(error => {
        // Show error message using our showNotice utility
        if (typeof ProductEstimatorSettings !== 'undefined' &&
          typeof ProductEstimatorSettings.showNotice === 'function') {
          ProductEstimatorSettings.showNotice(error.message || notificationSettings.i18n.saveError, 'error');
        } else {
          showNotice(error.message || notificationSettings.i18n.saveError, 'error');
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
  const module = new NotificationSettingsModule();

  // Export the module globally for backward compatibility
  window.NotificationSettingsModule = module;
});

export default NotificationSettingsModule;
