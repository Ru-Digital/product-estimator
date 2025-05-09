/**
 * Label Settings JavaScript
 *
 * Handles functionality specific to the label settings tab.
 */
import { showFieldError, clearFieldError, showNotice } from '@utils'; // Assuming these are utility functions
import { dom, ajax, validation } from '@utils'; // Assuming these are utility functions
import { createLogger } from '@utils';
const logger = createLogger('LabelSettingsModule');

class LabelSettingsModule {
  constructor() {
    // Cache the main container for this module's settings
    this.$container = null;
    this.tabId = 'labels'; // The main horizontal tab ID for this module

    jQuery(document).ready(() => {
      // Initialize only if this main tab exists
      this.$container = jQuery(`#${this.tabId}`);
      if (this.$container.length) {
        this.init();
      }
    });
  }

  init() {
    logger.log('Label Settings Module initialized');
    this.bindEvents();

    // Setup vertical tabs if the main "Labels" tab is already active or becomes active
    // The ProductEstimatorSettings.js will trigger 'product_estimator_tab_changed' on initial load if 'labels' is the active tab.
    // And also when switching to the 'labels' tab.
    // Initial setup can also be done here if needed, checking if currentTab is 'labels'.
    if (window.ProductEstimatorSettings && window.ProductEstimatorSettings.currentTab === this.tabId) {
      setTimeout(() => {
        this.setupVerticalTabs();
      }, 100); // Delay to ensure DOM is fully rendered
    }
  }

  bindEvents() {
    const $ = jQuery;

    // Listen for main horizontal tab changes
    $(document).on('product_estimator_tab_changed', this.handleMainTabChanged.bind(this));

    // Form submission - scoped to this module's container
    this.$container.on('submit', '.label-settings-form', this.handleFormSubmit.bind(this));

    // Vertical tabs navigation - scoped to this module's container
    this.$container.on('click', '.vertical-tabs-nav a', this.handleVerticalTabClick.bind(this));

    // Email validation - scoped
    this.$container.on('change', 'input[type="email"]', this.validateEmail.bind(this));
  }

  validateEmail(e) {
    const $ = jQuery;
    const $field = $(e.target);
    // Ensure the event target is within this module's container
    if (!$field.closest(this.$container).length) return;

    const email = $field.val().trim();
    if (email && !validation.validateEmail(email)) { // Assuming validation.validateEmail exists
      this.showFieldError($field, 'Please enter a valid email address'); // Use module-specific or global error display
      return false;
    }
    this.clearFieldError($field);
    return true;
  }

  showFieldError($field, message) {
    // Prefer global error display if available
    if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.showFieldError === 'function') {
      ProductEstimatorSettings.showFieldError($field, message);
    } else if (typeof validation !== 'undefined' && typeof validation.showFieldError === 'function') {
      validation.showFieldError($field, message);
    } else { // Basic fallback
      validation.clearFieldError($field); // Assuming this exists or implement
      const $error = jQuery(`<span class="field-error">${message}</span>`);
      $field.after($error).addClass('error');
    }
  }

  clearFieldError($field) {
    if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.clearFieldError === 'function') {
      ProductEstimatorSettings.clearFieldError($field);
    } else if (typeof validation !== 'undefined' && typeof validation.clearFieldError === 'function') {
      validation.clearFieldError($field);
    } else { // Basic fallback
      $field.removeClass('error').next('.field-error').remove();
    }
  }

  setupVerticalTabs() {
    if (!this.$container || !this.$container.length) return; // Ensure container exists

    const $ = jQuery;
    logger.log(' Setting up vertical tabs');

    const $verticalTabsNav = this.$container.find('.vertical-tabs-nav');
    const $verticalTabContents = this.$container.find('.vertical-tab-content'); // Direct children preferred for content

    if (!$verticalTabsNav.length || !$verticalTabContents.length) {
      logger.warn(' Vertical tab navigation or content areas not found.');
      return;
    }

    // Determine active tab (respect URL param, then PHP-set active class, then default)
    let activeSubTabId = 'labels-general'; // Default sub-tab for labels
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
      activeSubTabId = 'labels-general';
    }


    logger.log(' Active sub-tab ID:', activeSubTabId);
    this.showVerticalTab(activeSubTabId);
    this.adjustTabContentHeight();

    // Adjust on window resize - ensure to unbind previous to avoid multiple listeners if re-initialized
    $(window).off('resize.labelSettings').on('resize.labelSettings', this.adjustTabContentHeight.bind(this));
  }

  adjustTabContentHeight() {
    if (!this.$container || !this.$container.length) return;
    const $ = jQuery;
    const $nav = this.$container.find('.vertical-tabs-nav');
    const $contentWrapper = this.$container.find('.vertical-tabs-content'); // The direct wrapper of all tab panes

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

    // Ensure the click originated from within this module's vertical tabs
    if (!$link.closest(this.$container.find('.vertical-tabs-nav')).length) {
      return; // Not our event
    }

    const subTabId = $link.data('tab');
    logger.log(' Vertical tab clicked:', subTabId);

    window.history.pushState({}, '', `?page=product-estimator-settings&tab=${this.tabId}&sub_tab=${subTabId}`);
    this.showVerticalTab(subTabId);
  }

  showVerticalTab(subTabId) {
    if (!this.$container || !this.$container.length || !subTabId) return;

    const $ = jQuery;
    logger.log(' Showing vertical tab:', subTabId);

    const $verticalTabsNav = this.$container.find('.vertical-tabs-nav');
    const $verticalTabContents = this.$container.find('.vertical-tab-content'); // All content panes within this module

    $verticalTabsNav.find('.tab-item').removeClass('active');
    $verticalTabsNav.find(`a[data-tab="${subTabId}"]`).parent().addClass('active');

    $verticalTabContents.hide().removeClass('active');
    this.$container.find(`#${subTabId}.vertical-tab-content`).show().addClass('active'); // More specific selector for the content pane
  }

  handleMainTabChanged(e, newMainTabId, oldMainTabId) {
    if (newMainTabId === this.tabId) {
      logger.log('Label Settings main tab activated');
      setTimeout(() => {
        this.setupVerticalTabs(); // Re-initialize vertical tabs when main tab becomes active
      }, 100);
    }
  }

  handleFormSubmit(e) {
    e.preventDefault();
    if (!this.$container || !this.$container.length) return;

    const $ = jQuery;
    const $form = $(e.currentTarget);

    // Ensure the form is within this module's container
    if (!$form.closest(this.$container).length) return;

    let formDataStr = $form.serialize();
    const type = $form.data('type') || 'labels-general'; // Sub-tab type

    logger.log(' Form submitted for type:', type);

    const $submitButton = $form.find('.save-settings');
    const $spinner = $form.find('.spinner');

    $submitButton.prop('disabled', true);
    $spinner.addClass('is-active');

    // Add unchecked checkboxes
    $form.find('input[type="checkbox"]').each(function() {
      const $cb = $(this);
      if (!$cb.is(':checked')) {
        // Check if already present (e.g. if it was 0 and then changed to 1 and back to 0)
        const regex = new RegExp(`&?${encodeURIComponent($cb.attr('name'))}=[^&]*`);
        if (formDataStr.match(regex)) {
          formDataStr = formDataStr.replace(regex, ''); // Remove existing
        }
        formDataStr += `&${encodeURIComponent($cb.attr('name'))}=0`;
      }
    });
    // Clean leading ampersand if formDataStr was initially empty and only checkboxes were added
    if (formDataStr.startsWith('&')) {
      formDataStr = formDataStr.substring(1);
    }


    logger.log(' Sending form data:', formDataStr);

    ajax.ajaxRequest({ // Assuming ajax.ajaxRequest exists
      url: window.productEstimatorSettings.ajax_url, // Use global settings for ajax_url and nonce
      type: 'POST',
      data: {
        action: 'save_labels_settings', // Specific AJAX action for labels
        nonce: window.productEstimatorSettings.nonce,
        form_data: formDataStr,
        label_type: type // To identify which sub-form/label type is being saved
      }
    })
      .then(response => {
        logger.log(' Success response:', response);
        if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.showNotice === 'function') {
          ProductEstimatorSettings.showNotice(response.message || 'Labels saved successfully.', 'success');
        } else {
          showNotice(response.message || 'Labels saved successfully.', 'success'); // Fallback
        }
        // Reset form changed state for this specific sub-form/tab if ProductEstimatorSettings handles it per sub-form.
        // Otherwise, the main ProductEstimatorSettings.js handles it per main tab.
      })
      .catch(error => {
        logger.error('Error response:', error);
        if (typeof ProductEstimatorSettings !== 'undefined' && typeof ProductEstimatorSettings.showNotice === 'function') {
          ProductEstimatorSettings.showNotice(error.message || 'Error saving labels.', 'error');
        } else {
          showNotice(error.message || 'Error saving labels.', 'error'); // Fallback
        }
      })
      .finally(() => {
        $submitButton.prop('disabled', false);
        $spinner.removeClass('is-active');
      });
  }
}

// Initialize the module
jQuery(document).ready(function() {
  if (jQuery('#labels').length) { // Only instantiate if the main #labels tab container exists
    window.ProductEstimatorLabelSettingsModule = new LabelSettingsModule();
  }
});

export default LabelSettingsModule; // If using ES modules
