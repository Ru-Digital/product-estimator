/**
 * Notification Settings JavaScript
 */
import { showFieldError, clearFieldError, showNotice } from '@utils';
import { dom, ajax, validation } from '@utils';
import { setupTinyMCEHTMLPreservation } from '@utils/tinymce-preserver';
import { createLogger } from '@utils';
const logger = createLogger('NotificationSettingsModule');

class NotificationSettingsModule {
  constructor() {
    this.$container = null;
    this.tabId = 'notifications'; // Main horizontal tab ID
    this.mediaFrame = null;

    jQuery(document).ready(() => {
      this.$container = jQuery(`#${this.tabId}`);
      if (this.$container.length) {
        this.init();
      }
    });
  }

  init() {
    logger.log('Notification Settings Module initialized');
    this.bindEvents();
    this.setupDependentFields(); // This calls toggleNotificationFields
    // Vertical tabs setup will be triggered by handleMainTabChanged or if initially active
    if (window.ProductEstimatorSettings && window.ProductEstimatorSettings.currentTab === this.tabId) {
      setTimeout(() => {
        this.setupVerticalTabs();
        this.setupNotificationEditors(); // Assuming this is also specific to this tab
      }, 100);
    }
    this.setupMediaUploader(); // General setup, might not need to be in tab change
  }

  bindEvents() {
    const $ = jQuery;

    // Listen for main horizontal tab changes
    $(document).on('product_estimator_tab_changed', this.handleMainTabChanged.bind(this));

    // Scoped events to this module's container
    if (!this.$container || !this.$container.length) return;

    this.$container.on('change', '#enable_notifications', this.toggleNotificationFields.bind(this));

    this.$container.on('change', '[id^="notification_"][id$="_enabled"]', function(e) {
      const $toggle = $(e.currentTarget);
      const notificationType = $toggle.attr('id').replace('notification_', '').replace('_enabled', '');
      this.toggleNotificationTypeFields(notificationType, $toggle.is(':checked'));
    }.bind(this));

    this.$container.on('click', '.image-upload-button', this.handleImageUpload.bind(this));
    this.$container.on('click', '.image-remove-button', this.handleImageRemove.bind(this));

    this.$container.on('change', '#from_email, #default_designer_email, #default_store_email', this.validateEmail.bind(this));
    this.$container.on('submit', '.notification-settings-form', this.handleFormSubmit.bind(this));
    this.$container.on('click', '.vertical-tabs-nav a', this.handleVerticalTabClick.bind(this));
  }

  setupNotificationEditors() {
    if (!this.$container || !this.$container.length) return;
    logger.log('Setting up rich text editors');
    // Example: If 'pdf_footer_text' is within this module's scope, scope the selector
    // setupTinyMCEHTMLPreservation(['some_notification_editor_id'], `#${this.tabId}`);
  }

  toggleNotificationTypeFields(notificationType, enabled) {
    if (!this.$container || !this.$container.length) return;
    const $ = jQuery;
    // Scope form finding to within this module's container
    const $form = this.$container.find(`.notification-type-form[data-type="${notificationType}"]`);
    const $fields = $form.find('input, textarea, button, select') // Added select
      .not(`#notification_${notificationType}_enabled`) // Ensure this ID is unique or scoped if necessary
      .not('.save-settings');

    $fields.prop('disabled', !enabled);
    // If you have TinyMCE editors, you might need to toggle their readonly state
    $form.find('.wp-editor-area').each(function() {
      const editorId = $(this).attr('id');
      const editor = tinyMCE.get(editorId);
      if (editor) {
        editor.setMode(enabled ? 'design' : 'readonly');
      }
    });
  }

  setupMediaUploader() {
    // This is fine as is, mediaFrame is an instance property
  }

  validateEmail(e) {
    const $ = jQuery;
    const $field = $(e.target);
    if (!$field.closest(this.$container).length) return; // Check scope

    const email = $field.val().trim();
    const i18n = (window.notificationSettings && window.notificationSettings.i18n) || {};
    if (email && !validation.validateEmail(email)) {
      this.showFieldError($field, i18n.validationErrorEmail || 'Please enter a valid email address');
      return false;
    }
    this.clearFieldError($field);
    return true;
  }

  showFieldError($field, message) {
    if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.showFieldError === 'function') {
      ProductEstimatorSettings.showFieldError($field, message);
    } else if (typeof validation !== 'undefined' && typeof validation.showFieldError === 'function') {
      validation.showFieldError($field, message);
    } else {
      validation.clearFieldError($field);
      const $error = jQuery(`<span class="field-error">${message}</span>`);
      $field.after($error).addClass('error');
    }
  }

  clearFieldError($field) {
    if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.clearFieldError === 'function') {
      ProductEstimatorSettings.clearFieldError($field);
    } else if (typeof validation !== 'undefined' && typeof validation.clearFieldError === 'function') {
      validation.clearFieldError($field);
    } else {
      $field.removeClass('error').next('.field-error').remove();
    }
  }

  setupDependentFields() {
    if (!this.$container || !this.$container.length) return;
    this.toggleNotificationFields(); // This will use the scoped version

    // Scope this too
    this.$container.find('[id^="notification_"][id$="_enabled"]').each(function(i, el) {
      const $toggle = jQuery(el);
      const notificationType = $toggle.attr('id').replace('notification_', '').replace('_enabled', '');
      this.toggleNotificationTypeFields(notificationType, $toggle.is(':checked'));
    }.bind(this));
  }

  toggleNotificationFields() {
    if (!this.$container || !this.$container.length) return;
    const $ = jQuery;
    // #enable_notifications should be unique or scoped if it's a common ID pattern
    const $enableNotificationsCheckbox = this.$container.find('#enable_notifications');
    if (!$enableNotificationsCheckbox.length) {
      logger.warn("#enable_notifications checkbox not found within #notifications container.");
      // Potentially default to enabled or disabled behavior, or do nothing.
      // For now, let's assume if the checkbox isn't found, we don't alter the disabled state of tabs.
      // Or, if this checkbox MUST exist for this logic, ensure it's in notification-settings-admin-display.php
      // and that its ID is truly unique if it's outside $this.$container.
      // For safety, let's assume it should be within $this.$container:
      if(!this.$container.find('#enable_notifications').length) return; // exit if not found in scope
    }

    const enabled = $enableNotificationsCheckbox.is(':checked');
    const $verticalTabsNav = this.$container.find('.vertical-tabs-nav');
    const $notificationForms = this.$container.find('.notification-type-form');


    if (enabled) {
      $verticalTabsNav.removeClass('disabled');
      // Enable fields in all sub-forms, then let individual toggles refine this
      $notificationForms.find('input, textarea, button, select').not('.save-settings').prop('disabled', false);
      // Re-apply individual toggles
      this.$container.find('[id^="notification_"][id$="_enabled"]').each(function(i, el) {
        const $toggle = $(el);
        const notificationType = $toggle.attr('id').replace('notification_', '').replace('_enabled', '');
        this.toggleNotificationTypeFields(notificationType, $toggle.is(':checked'));
      }.bind(this));
    } else {
      $verticalTabsNav.addClass('disabled');
      $notificationForms.find('input, textarea, button, select').not('.save-settings').prop('disabled', true);
    }
    logger.log(`Vertical tabs nav ${enabled ? 'enabled' : 'disabled'}.`);
  }

  setupVerticalTabs() {
    if (!this.$container || !this.$container.length) return;
    const $ = jQuery;
    logger.log('Setting up vertical tabs');

    const $verticalTabsNav = this.$container.find('.vertical-tabs-nav');
    const $verticalTabContents = this.$container.find('.vertical-tab-content');

    if (!$verticalTabsNav.length || !$verticalTabContents.length) {
      logger.warn('Vertical tab navigation or content areas not found.');
      return;
    }

    let activeSubTabId = 'notification_general'; // Default for notifications
    const urlParams = new URLSearchParams(window.location.search);
    const urlSubTab = urlParams.get('sub_tab');

    if (urlSubTab && $verticalTabsNav.find(`a[data-tab="${urlSubTab}"]`).length) {
      activeSubTabId = urlSubTab;
    } else {
      const $phpActiveLink = $verticalTabsNav.find('.tab-item.active a');
      if ($phpActiveLink.length) {
        activeSubTabId = $phpActiveLink.data('tab');
      }
    }
    // Fallback if activeSubTabId determined is somehow not valid for this module
    if (!$verticalTabsNav.find(`a[data-tab="${activeSubTabId}"]`).length) {
      activeSubTabId = 'notification_general';
    }


    logger.log('Active sub-tab ID:', activeSubTabId);
    this.showVerticalTab(activeSubTabId);
    this.adjustTabContentHeight();
    $(window).off('resize.notificationSettings').on('resize.notificationSettings', this.adjustTabContentHeight.bind(this));
  }

  adjustTabContentHeight() {
    if (!this.$container || !this.$container.length) return;
    const $ = jQuery;
    const $nav = this.$container.find('.vertical-tabs-nav');
    const $contentWrapper = this.$container.find('.vertical-tabs-content'); // The direct wrapper

    if ($nav.length && $contentWrapper.length) {
      const navHeight = $nav.outerHeight();
      if (navHeight) {
        $contentWrapper.css('min-height', navHeight + 'px');
      }
    }
  }

  handleVerticalTabClick(e) {
    e.preventDefault();
    const $ = jQuery;
    const $link = $(e.currentTarget);
    if (!$link.closest(this.$container.find('.vertical-tabs-nav')).length) return;

    const subTabId = $link.data('tab');
    logger.log('Vertical tab clicked:', subTabId);
    window.history.pushState({}, '', `?page=product-estimator-settings&tab=${this.tabId}&sub_tab=${subTabId}`);
    this.showVerticalTab(subTabId);
  }

  showVerticalTab(subTabId) {
    if (!this.$container || !this.$container.length || !subTabId) return;
    const $ = jQuery;
    logger.log('Showing vertical tab:', subTabId);

    const $verticalTabsNav = this.$container.find('.vertical-tabs-nav');
    const $verticalTabContents = this.$container.find('.vertical-tab-content');

    $verticalTabsNav.find('.tab-item').removeClass('active');
    $verticalTabsNav.find(`a[data-tab="${subTabId}"]`).parent().addClass('active');

    $verticalTabContents.hide().removeClass('active');
    this.$container.find(`#${subTabId}.vertical-tab-content`).show().addClass('active');
  }

  handleImageUpload(e) {
    e.preventDefault();
    if (!this.$container || !this.$container.length) return;
    const $ = jQuery;
    const $button = $(e.currentTarget);
    if (!$button.closest(this.$container).length) return;

    const fieldId = $button.data('field-id');

    if (this.mediaFrame) {
      this.mediaFrame.off('select'); // Remove previous listeners to avoid multiple triggers
    } else {
      if (typeof wp === 'undefined' || !wp.media) {
        logger.error('WordPress Media Library not available');
        return;
      }
      this.mediaFrame = wp.media({
        title: (window.notificationSettings && window.notificationSettings.i18n && window.notificationSettings.i18n.selectImage) || 'Select Image',
        button: { text: (window.notificationSettings && window.notificationSettings.i18n && window.notificationSettings.i18n.useThisImage) || 'Use this image' },
        multiple: false,
        library: { type: 'image' }
      });
    }

    this.mediaFrame.on('select', () => {
      const attachment = this.mediaFrame.state().get('selection').first().toJSON();
      this.$container.find(`#${fieldId}`).val(attachment.id).trigger('change'); // Scope find
      const $previewWrapper = $button.closest('td').find('.image-preview-wrapper');
      $previewWrapper.html(`<img src="${attachment.sizes.medium ? attachment.sizes.medium.url : attachment.url}" alt="" style="max-width:200px;max-height:100px;display:block;margin-bottom:10px;" />`);
      $button.closest('td').find('.image-remove-button').removeClass('hidden');
    });

    this.mediaFrame.open();
  }

  handleImageRemove(e) {
    e.preventDefault();
    if (!this.$container || !this.$container.length) return;
    const $ = jQuery;
    const $button = $(e.currentTarget);
    if (!$button.closest(this.$container).length) return;

    const fieldId = $button.data('field-id');
    this.$container.find(`#${fieldId}`).val('').trigger('change');
    $button.closest('td').find('.image-preview-wrapper').empty();
    $button.addClass('hidden');
  }

  handleMainTabChanged(e, newMainTabId, oldMainTabId) {
    const localizedTabId = (window.notificationSettings && window.notificationSettings.tab_id) || 'notifications';
    if (newMainTabId === localizedTabId) {
      logger.log('Notification Settings main tab activated');
      setTimeout(() => {
        // toggleNotificationFields checks #enable_notifications which is specific to this module's HTML,
        // so it's inherently scoped if the ID is unique.
        this.toggleNotificationFields();
        this.setupVerticalTabs();
        this.setupNotificationEditors();
      }, 100);
    }
  }

  handleFormSubmit(e) {
    e.preventDefault();
    if (!this.$container || !this.$container.length) return;
    const $ = jQuery;
    const $form = $(e.currentTarget);
    if (!$form.closest(this.$container).length) return;

    let formDataStr = $form.serialize();
    const type = $form.data('type') || 'notification_general';

    const $submitButton = $form.find('.save-settings');
    const $spinner = $form.find('.spinner');

    $submitButton.prop('disabled', true);
    $spinner.addClass('is-active');

    if (typeof tinyMCE !== 'undefined') {
      $form.find('.wp-editor-area').each(function() {
        const editor = tinyMCE.get($(this).attr('id'));
        if (editor) {
          editor.save();
        }
      });
    }

    // Re-serialize after editor save
    formDataStr = $form.serialize();

    $form.find('input[type="checkbox"]').each(function() {
      const $cb = $(this);
      if (!$cb.is(':checked')) {
        const regex = new RegExp(`&?${encodeURIComponent($cb.attr('name'))}=[^&]*`);
        if (formDataStr.match(regex)) {
          formDataStr = formDataStr.replace(regex, '');
        }
        formDataStr += `&${encodeURIComponent($cb.attr('name'))}=0`;
      }
    });
    if (formDataStr.startsWith('&')) {
      formDataStr = formDataStr.substring(1);
    }

    logger.log('Sending form data:', formDataStr);

    ajax.ajaxRequest({
      url: window.productEstimatorSettings.ajax_url,
      type: 'POST',
      data: {
        action: 'save_notifications_settings',
        nonce: window.productEstimatorSettings.nonce,
        form_data: formDataStr,
        notification_type: type
      }
    })
      .then(response => {
        logger.log('Success response:', response);
        const i18n = (window.notificationSettings && window.notificationSettings.i18n) || {};
        if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.showNotice === 'function') {
          ProductEstimatorSettings.showNotice(response.message || i18n.saveSuccess || 'Settings saved.', 'success');
        } else {
          showNotice(response.message || i18n.saveSuccess || 'Settings saved.', 'success');
        }
      })
      .catch(error => {
        logger.error('Error response:', error);
        const i18n = (window.notificationSettings && window.notificationSettings.i18n) || {};
        if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.showNotice === 'function') {
          ProductEstimatorSettings.showNotice(error.message || i18n.saveError || 'Error saving settings.', 'error');
        } else {
          showNotice(error.message || i18n.saveError || 'Error saving settings.', 'error');
        }
      })
      .finally(() => {
        $submitButton.prop('disabled', false);
        $spinner.removeClass('is-active');
      });
  }
}

jQuery(document).ready(function() {
  if (jQuery('#notifications').length) {
    window.ProductEstimatorNotificationSettingsModule = new NotificationSettingsModule();
  }
});

export default NotificationSettingsModule;
