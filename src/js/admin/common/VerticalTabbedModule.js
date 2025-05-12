/**
 * VerticalTabbedModule.js
 *
 * Base class for settings modules that use a vertical tabbed interface.
 * Handles common vertical tab navigation, AJAX form submission, and state management.
 */
import { ajax, validation } from '@utils'; // Assuming @utils provides these
import { createLogger } from '@utils';
const logger = createLogger('VerticalTabbedModule');

class VerticalTabbedModule {
  /**
   * Constructor for the VerticalTabbedModule.
   * @param {Object} config - Configuration object for the module.
   * @param {string} config.mainTabId - The ID of the main horizontal tab for this module (e.g., 'labels', 'notifications').
   * @param {string} config.defaultSubTabId - The default vertical sub-tab to show if none is specified.
   * @param {string} config.ajaxActionPrefix - The prefix for AJAX save actions (e.g., 'save_labels' for 'save_labels_settings').
   * @param {string} config.localizedDataName - The name of the global object holding localized data for this module (e.g., 'labelSettingsData').
   */
  constructor(config) {
    const settingsData = window.featureSwitchesSettings || {}; // Assumes JS variable name convention


    this.config = {
      ...config,
    };

    this.$container = null;

    if (!this.config.mainTabId || !this.config.defaultSubTabId || !this.config.ajaxActionPrefix || !this.config.localizedDataName) {
      logger.error('Missing critical configuration for VerticalTabbedModule.', this.config);
      return;
    }

    this.localizedData = window[this.config.localizedDataName] || { i18n: {}, nonce: '', ajax_url: '' };
    if (!this.localizedData.nonce || !this.localizedData.ajax_url) {
      if (window.productEstimatorSettings) {
        this.localizedData.nonce = this.localizedData.nonce || window.productEstimatorSettings.nonce;
        this.localizedData.ajax_url = this.localizedData.ajax_url || window.productEstimatorSettings.ajax_url;
      }
      if (!this.localizedData.nonce || !this.localizedData.ajax_url) {
        logger.warn(`Nonce or AJAX URL missing for ${this.config.mainTabId}. AJAX submissions might fail. Localized data:`, this.localizedData);
      }
    }

    jQuery(document).ready(() => {
      this.$container = jQuery(`#${this.config.mainTabId}`);
      if (this.$container.length) {
        this.init();
      } else {
        logger.log(`Main container #${this.config.mainTabId} not found. Module not initialized.`);
      }
    });
  }

  init() {
    logger.log(`Module for main tab #${this.config.mainTabId} initialized.`);
    this.bindCommonEvents();
    this.bindModuleSpecificEvents();

    if (window.ProductEstimatorSettings && window.ProductEstimatorSettings.currentTab === this.config.mainTabId) {
      logger.log(`Main tab #${this.config.mainTabId} is currently active. Setting up vertical tabs.`);
      setTimeout(() => {
        this.setupVerticalTabs();
        this.onMainTabActivated();
      }, 100);
    }
  }

  bindCommonEvents() {
    const $ = jQuery;
    $(document).on('product_estimator_tab_changed', this.handleMainTabChanged.bind(this));
    if (!this.$container || !this.$container.length) return;
    this.$container.on('submit', '.product-estimator-form, .pe-vtabs-tab-form', this.handleFormSubmit.bind(this));
    this.$container.on('click', '.pe-vtabs-nav-list a, .vertical-tabs-nav a', this.handleVerticalTabClick.bind(this));
  }

  bindModuleSpecificEvents() { /* Override in child */ }
  onMainTabActivated() { logger.log(`onMainTabActivated hook for ${this.config.mainTabId}`); }
  onMainTabDeactivated() { logger.log(`onMainTabDeactivated hook for ${this.config.mainTabId}`); }

  setupVerticalTabs() {
    if (!this.$container || !this.$container.length) {
      logger.warn('Cannot setup vertical tabs: main container not found.');
      return;
    }
    logger.log('Setting up vertical tabs.');
    const $verticalTabsNav = this.$container.find('.pe-vtabs-nav-list, .vertical-tabs-nav');
    const $verticalTabContents = this.$container.find('.pe-vtabs-tab-panel, .vertical-tab-content');

    if (!$verticalTabsNav.length || !$verticalTabContents.length) {
      logger.warn('Vertical tab navigation or content panels not found.');
      return;
    }

    let activeSubTabId = this.config.defaultSubTabId;
    const urlParams = new URLSearchParams(window.location.search);
    const urlSubTab = urlParams.get('sub_tab');

    if (urlSubTab && $verticalTabsNav.find(`a[data-tab="${urlSubTab}"]`).length) {
      activeSubTabId = urlSubTab;
    } else {
      const $phpActiveLink = $verticalTabsNav.find('.pe-vtabs-nav-item.active a, .tab-item.active a');
      if ($phpActiveLink.length) activeSubTabId = $phpActiveLink.data('tab');
    }

    if (!$verticalTabsNav.find(`a[data-tab="${activeSubTabId}"]`).length) {
      logger.warn(`Active/Default sub-tab "${activeSubTabId}" not valid. Falling back.`);
      activeSubTabId = $verticalTabsNav.find('a[data-tab]').first().data('tab') || this.config.defaultSubTabId;
      if (!$verticalTabsNav.find(`a[data-tab="${activeSubTabId}"]`).length){
        logger.error('No valid sub-tabs found. Cannot initialize.');
        return;
      }
    }

    logger.log('Initial active sub-tab ID:', activeSubTabId);
    this.showVerticalTab(activeSubTabId, false); // false to prevent history update on initial load
    this.adjustTabContentHeight();
    jQuery(window).off(`resize.${this.config.mainTabId}`).on(`resize.${this.config.mainTabId}`, this.adjustTabContentHeight.bind(this));
  }

  // Ensure this function is defined or updated like this
  handleVerticalTabClick(e) {
    e.preventDefault(); // Prevent default link navigation
    const $targetLink = jQuery(e.currentTarget);
    const subTabId = $targetLink.data('tab'); // Assumes links have data-tab="subTabId"

    if (subTabId) {
      this.showVerticalTab(subTabId, true); // true to update history
    } else {
      logger.warn('Vertical tab link clicked but no subTabId found in data-tab attribute.');
    }
  }

  adjustTabContentHeight() {
    if (!this.$container || !this.$container.length) return;
    const $nav = this.$container.find('.pe-vtabs-nav-area, .vertical-tabs');
    const $contentWrapper = this.$container.find('.pe-vtabs-content-area, .vertical-tabs-content');
    if ($nav.length && $contentWrapper.length) {
      const navHeight = $nav.outerHeight();
      if (navHeight) $contentWrapper.css('min-height', navHeight + 'px');
    }
  }

  showVerticalTab(subTabId, updateHistory = true) {
    if (!this.$container || !this.config.mainTabId || !subTabId) {
      logger.warn('Cannot show vertical tab: missing container, mainTabId, or subTabId.', {containerExists: !!this.$container, mainTabId: this.config.mainTabId, subTabId});
      return;
    }
    logger.log('Showing vertical tab:', subTabId, 'Update history:', updateHistory);
    const $verticalTabsNav = this.$container.find('.pe-vtabs-nav-list, .vertical-tabs-nav');
    const $verticalTabContents = this.$container.find('.pe-vtabs-tab-panel, .vertical-tab-content');

    $verticalTabsNav.find('.pe-vtabs-nav-item, .tab-item').removeClass('active');
    $verticalTabsNav.find(`a[data-tab="${subTabId}"]`).parent().addClass('active');

    $verticalTabContents.hide().removeClass('active');
    this.$container.find(`#${subTabId}`).show().addClass('active'); // Assumes content panels have ID matching subTabId

    if (updateHistory) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('page', currentUrl.searchParams.get('page') || 'product-estimator-settings'); // Adjust 'page' as needed
      currentUrl.searchParams.set('tab', this.config.mainTabId);
      currentUrl.searchParams.set('sub_tab', subTabId);
      window.history.pushState({mainTabId: this.config.mainTabId, subTabId: subTabId}, '', currentUrl.toString());
    }
    jQuery(document).trigger(`pe_sub_tab_changed_${this.config.mainTabId}`, [subTabId]);
  }

  handleMainTabChanged(e, newMainTabId, oldMainTabId) {
    if (newMainTabId === this.config.mainTabId) {
      logger.log(`Main tab #${this.config.mainTabId} activated.`);
      setTimeout(() => { // Delay to ensure tab content is visible for height calculations or JS initializations
        if (!this.$container || !this.$container.length) this.$container = jQuery(`#${this.config.mainTabId}`);
        if (this.$container.length) {
          this.setupVerticalTabs(); // Re-setup or ensure vertical tabs are correctly initialized
          this.onMainTabActivated();
        } else {
          logger.warn(`Main container #${this.config.mainTabId} not found when trying to activate tab.`);
        }
      }, 100);
    } else if (oldMainTabId === this.config.mainTabId) {
      this.onMainTabDeactivated();
    }
  }

  handleFormSubmit(e) {
    const $form = jQuery(e.currentTarget);
    const logger = createLogger(`VTM:${this.config.mainTabId || 'UnknownModule'}`);
    logger.log('Form submission event triggered by VerticalTabbedModule for form:', $form[0]);

    e.preventDefault();

    const $submitButton = $form.find('.save-settings');
    const $spinner = $form.find('.spinner');

    if (typeof tinyMCE !== 'undefined') {
      $form.find('.wp-editor-area').each(function() {
        const editor = tinyMCE.get(jQuery(this).attr('id'));
        if (editor) {
          editor.save();
          logger.log('Saved TinyMCE editor content for:', jQuery(this).attr('id'));
        }
      });
    }

    let formDataStr = $form.serialize();
    logger.log('Serialized form data:', formDataStr);

    let currentSubTabId = $form.attr('data-sub-tab-id'); // Correctly get sub-tab ID
    if (!currentSubTabId || String(currentSubTabId).trim() === '') {
      // Try data-tab as a fallback if data-sub-tab-id isn't there, though data-sub-tab-id should be standard
      currentSubTabId = $form.attr('data-tab');
      if (!currentSubTabId || String(currentSubTabId).trim() === '') {
        logger.error("CRITICAL: 'data-sub-tab-id' (or fallback 'data-tab') attribute is missing or empty on a form this module is handling. Form:", $form[0]);
        currentSubTabId = this.config.defaultSubTabId; // Fallback to default
        this.showNotice('Error: Could not determine the current settings section. Please check form markup.', 'error');
        // ... (rest of error handling)
        return;
      }
    }
    currentSubTabId = String(currentSubTabId).trim();
    logger.log(`Final sub-tab ID for AJAX: "${currentSubTabId}"`);

    $form.find('input[type="checkbox"]').each(function() {
      const $cb = jQuery(this);
      const name = $cb.attr('name');
      if (name && !$cb.is(':checked')) {
        const paramRegex = new RegExp(`(^|&)${encodeURIComponent(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:=[^&]*)?`);
        if (!paramRegex.test(formDataStr)) {
          formDataStr += `&${encodeURIComponent(name)}=0`;
        }
      }
    });
    formDataStr = formDataStr.replace(/^&+/, '').replace(/&&+/g, '&');

    $submitButton.prop('disabled', true);
    $spinner.addClass('is-active');

    const ajaxAction = `${this.config.ajaxActionPrefix}_settings`;
    const ajaxDataPayload = {
      action: ajaxAction,
      nonce: this.localizedData.nonce,
      form_data: formDataStr,
      sub_tab_id: currentSubTabId
    };

    logger.log('Sending AJAX with payload:', ajaxDataPayload);

    ajax.ajaxRequest({
      url: this.localizedData.ajax_url,
      type: 'POST',
      data: ajaxDataPayload
    })
      .then(response => {
        logger.log('Success response:', response);
        const successMsg = (response && response.message) || (this.localizedData.i18n && this.localizedData.i18n.saveSuccess) || 'Settings saved successfully.';
        this.showNotice(successMsg, 'success');
        if (window.ProductEstimatorSettings && typeof window.ProductEstimatorSettings.formChangeTrackers === 'object') {
          window.ProductEstimatorSettings.formChangeTrackers[this.config.mainTabId] = false;
          if (this.config.mainTabId === window.ProductEstimatorSettings.currentTab) {
            window.ProductEstimatorSettings.formChanged = false;
          }
        }
      })
      .catch(error => {
        logger.error('Error response:', error);
        const errorMsg = (error && error.message) || (this.localizedData.i18n && this.localizedData.i18n.saveError) || 'Error saving settings.';
        this.showNotice(errorMsg, 'error');
      })
      .finally(() => {
        if ($submitButton.length) $submitButton.prop('disabled', false);
        if ($spinner.length) $spinner.removeClass('is-active');
      });
  }

  showNotice(message, type = 'success') {
    if (window.ProductEstimatorSettings && typeof window.ProductEstimatorSettings.showNotice === 'function') {
      window.ProductEstimatorSettings.showNotice(message, type);
    } else if (typeof validation !== 'undefined' && typeof validation.showNotice === 'function') {
      validation.showNotice(message, type);
    } else {
      logger.log(`NOTICE (${type}): ${message}`);
      alert(`(${type.toUpperCase()}) ${message}`);
    }
  }

  showFieldError($field, message) {
    if (window.ProductEstimatorSettings && typeof window.ProductEstimatorSettings.showFieldError === 'function') {
      window.ProductEstimatorSettings.showFieldError($field, message);
    } else if (typeof validation !== 'undefined' && typeof validation.showFieldError === 'function') {
      validation.showFieldError($field, message);
    } else {
      this.clearFieldError($field);
      const $error = jQuery(`<span class="field-error" style="color:red;display:block;">${message}</span>`);
      $field.after($error).addClass('error');
    }
  }

  clearFieldError($field) {
    if (window.ProductEstimatorSettings && typeof window.ProductEstimatorSettings.clearFieldError === 'function') {
      window.ProductEstimatorSettings.clearFieldError($field);
    } else if (typeof validation !== 'undefined' && typeof validation.clearFieldError === 'function') {
      validation.clearFieldError($field);
    } else {
      $field.removeClass('error').next('.field-error').remove();
    }
  }
}

export default VerticalTabbedModule;
