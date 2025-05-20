/**
 * Notification Settings JavaScript
 * Extends VerticalTabbedModule for common vertical tab and form handling.
 */
import { validation } from '@utils'; // Import utilities needed for this module
// import { setupTinyMCEHTMLPreservation } from '@utils/tinymce-preserver'; // If still needed specifically here

import VerticalTabbedModule from '../common/VerticalTabbedModule'; // Adjust path as needed

class NotificationSettingsModule extends VerticalTabbedModule {
  constructor() {
    super({
      mainTabId: 'notifications',
      defaultSubTabId: 'notifications-general', // Default vertical tab
      ajaxActionPrefix: 'save_notifications', // Results in 'save_notifications_settings'
      localizedDataName: 'notificationSettings'
    });

    this.mediaFrame = null; // Specific to notifications for image uploads
  }

  /**
   * Override to bind module-specific events.
   */
  bindModuleSpecificEvents() {
    super.bindModuleSpecificEvents();
    if (!this.$container || !this.$container.length) {
      return;
    }

    this.$container.on('change', '#enable_notifications', this.handleToggleAllNotifications.bind(this));
    this.$container.on('change', 'input[id^="notification_"][id$="_enabled"]', this.handleToggleSingleNotification.bind(this));
    this.$container.on('click', '.image-upload-button', this.handleImageUpload.bind(this));
    this.$container.on('click', '.image-remove-button', this.handleImageRemove.bind(this));
    this.$container.on('change', 'input[type="email"]', this.handleEmailValidation.bind(this)); // e.g. #from_email

  }

  /**
   * Override for actions when the main "Notifications" tab is activated.
   */
  onMainTabActivated() {
    super.onMainTabActivated();
    this.setupDependentFieldsState(); // Initial state for toggles
    this.setupNotificationEditors(); // e.g. TinyMCE
    // this.setupMediaUploader(); // Media uploader is more general, could be in init if not already.
    // Or ensure it's setup if it relies on tab being visible.
  }

  setupNotificationEditors() {
    if (!this.$container || !this.localizedData) return;
    // Example: If using setupTinyMCEHTMLPreservation for specific editors in notifications
    // const editorIds = this.localizedData.notification_types.map(type => `notification_${type}_content`);
    // setupTinyMCEHTMLPreservation(editorIds, `#${this.config.mainTabId}`);
  }

  setupDependentFieldsState() {
    if (!this.$container || !this.$container.length) return;
    this.handleToggleAllNotifications(); // Initial check for global toggle

    // Initial check for individual notification toggles
    this.$container.find('input[id^="notification_"][id$="_enabled"]').each((i, el) => {
      const $toggle = jQuery(el);
      this.toggleSingleNotificationFields($toggle);
    });
  }

  handleToggleAllNotifications() {
    if (!this.$container || !this.$container.length) return;

    const $globalEnableCheckbox = this.$container.find('#enable_notifications');
    if (!$globalEnableCheckbox.length) {
      return;
    }
    const isEnabled = $globalEnableCheckbox.is(':checked');
    const $verticalTabsNavList = this.$container.find('.pe-vtabs-nav-list, .vertical-tabs-nav');
    const $allNotificationTypeForms = this.$container.find('.pe-vtabs-tab-form[data-tab-id*="notification_type_"]');


    if (isEnabled) {
      $verticalTabsNavList.removeClass('pe-vtabs-nav-disabled'); // Use class from admin-vertical-tabs.css
      // Enable fields in specific notification type forms, but respect their individual toggles
      this.$container.find('input[id^="notification_"][id$="_enabled"]').each((i, el) => {
        this.toggleSingleNotificationFields(jQuery(el));
      });
    } else {
      $verticalTabsNavList.addClass('pe-vtabs-nav-disabled');
      // Disable all fields in all notification type forms
      $allNotificationTypeForms.find('input, textarea, button, select').not('.save-settings').prop('disabled', true);
      $allNotificationTypeForms.find('.wp-editor-area').each(function() {
        const editor = tinyMCE.get(jQuery(this).attr('id'));
        if (editor) editor.setMode('readonly');
      });
    }
  }

  handleToggleSingleNotification(e) {
    this.toggleSingleNotificationFields(jQuery(e.currentTarget));
  }

  toggleSingleNotificationFields($toggleCheckbox) {
    if (!this.$container || !this.$container.length) return;
    const $ = jQuery;
    const isChecked = $toggleCheckbox.is(':checked');
    const formDataType = $toggleCheckbox.attr('id').replace('notification_', '').replace('_enabled', '');
    const $form = this.$container.find(`.pe-vtabs-tab-form[data-sub-tab-id="notification-type-${formDataType}"]`);

    if (!$form.length) {
      return;
    }

    // Only proceed if global notifications are enabled
    const $globalEnableCheckbox = this.$container.find('#enable_notifications');
    if ($globalEnableCheckbox.length && !$globalEnableCheckbox.is(':checked')) {
      // Fields should remain disabled by handleToggleAllNotifications
      return;
    }

    $form.find('input, textarea, button, select')
      .not($toggleCheckbox) // Don't disable the toggle itself
      .not('.save-settings') // Don't disable the save button
      .prop('disabled', !isChecked);

    $form.find('.wp-editor-area').each(function() {
      const editor = tinyMCE.get($(this).attr('id'));
      if (editor) {
        editor.setMode(isChecked ? 'design' : 'readonly');
      }
    });
  }


  handleImageUpload(e) {
    e.preventDefault();
    const $button = jQuery(e.currentTarget);
    const fieldId = $button.data('field-id'); // e.g., 'company_logo'

    if (this.mediaFrame) {
      this.mediaFrame.off('select');
    } else {
      if (typeof wp === 'undefined' || !wp.media) {
        return;
      }
      this.mediaFrame = wp.media({
        title: this.localizedData.i18n.selectImage || 'Select Image',
        button: { text: this.localizedData.i18n.useThisImage || 'Use this image' },
        multiple: false,
        library: { type: 'image' }
      });
    }

    this.mediaFrame.on('select', () => {
      const attachment = this.mediaFrame.state().get('selection').first().toJSON();
      const $fieldInput = this.$container.find(`#${fieldId}`);
      const $previewWrapper = $fieldInput.closest('td').find('.image-preview-wrapper'); // Find relative to the input
      const $removeButton = $fieldInput.closest('td').find('.image-remove-button');

      $fieldInput.val(attachment.id).trigger('change');
      $previewWrapper.html(`<img src="${attachment.sizes.thumbnail ? attachment.sizes.thumbnail.url : attachment.url}" alt="Preview" />`);
      $removeButton.removeClass('hidden');
    });
    this.mediaFrame.open();
  }

  handleImageRemove(e) {
    e.preventDefault();
    const $button = jQuery(e.currentTarget);
    const fieldId = $button.data('field-id');
    const $fieldInput = this.$container.find(`#${fieldId}`);
    const $previewWrapper = $fieldInput.closest('td').find('.image-preview-wrapper');

    $fieldInput.val('').trigger('change');
    $previewWrapper.empty();
    $button.addClass('hidden');
  }

  handleEmailValidation(e) {
    const $field = jQuery(e.target);
    if (!$field.closest(this.$container).length) return;

    const email = $field.val().trim();
    const i18n = (this.localizedData && this.localizedData.i18n) || {};
    if (email && !validation.validateEmail(email)) {
      this.showFieldError($field, i18n.validationErrorEmail || 'Please enter a valid email address.');
      return false;
    }
    this.clearFieldError($field);
    return true;
  }
}

jQuery(document).ready(function() {
  if (jQuery('#notifications').length) {
    window.ProductEstimatorNotificationSettingsModule = new NotificationSettingsModule();
  }
});

export default NotificationSettingsModule;
