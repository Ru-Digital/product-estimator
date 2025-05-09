/**
 * VerticalTabbedModule.js
 *
 * Base class for settings modules that use a vertical tabbed interface.
 * Handles common vertical tab navigation, AJAX form submission, and state management.
 */
import { ajax, validation, createLogger } from '@utils'; // Assuming @utils provides these

class VerticalTabbedModule {
  /**
   * Constructor for the VerticalTabbedModule.
   * @param {Object} config - Configuration object for the module.
   * @param {string} config.mainTabId - The ID of the main horizontal tab for this module (e.g., 'labels', 'notifications').
   * @param {string} config.defaultSubTabId - The default vertical sub-tab to show if none is specified.
   * @param {string} config.ajaxActionPrefix - The prefix for AJAX save actions (e.g., 'save_labels' for 'save_labels_settings').
   * @param {string} config.localizedDataName - The name of the global object holding localized data for this module (e.g., 'labelSettingsData').
   * @param {string} [config.loggerName] - Optional name for the logger, defaults to 'VerticalTabbedModule'.
   */
  constructor(config) {
    this.config = {
      loggerName: 'VerticalTabbedModule',
      ...config,
    };

    this.$container = null;
    this.logger = createLogger(this.config.loggerName || `VTM-${this.config.mainTabId}`);

    // Ensure required config properties are present
    if (!this.config.mainTabId || !this.config.defaultSubTabId || !this.config.ajaxActionPrefix || !this.config.localizedDataName) {
      this.logger.error('Missing critical configuration for VerticalTabbedModule.', this.config);
      return; // Prevent initialization if config is incomplete
    }

    this.localizedData = window[this.config.localizedDataName] || { i18n: {}, nonce: '', ajax_url: '' };
    if (!this.localizedData.nonce || !this.localizedData.ajax_url) {
      // Try to get from global ProductEstimatorSettings if not in specific module data
      if (window.productEstimatorSettings) {
        this.localizedData.nonce = this.localizedData.nonce || window.productEstimatorSettings.nonce;
        this.localizedData.ajax_url = this.localizedData.ajax_url || window.productEstimatorSettings.ajax_url;
      }
      if (!this.localizedData.nonce || !this.localizedData.ajax_url) {
        this.logger.warn(`Nonce or AJAX URL missing for ${this.config.mainTabId}. AJAX submissions might fail. Localized data:`, this.localizedData);
      }
    }


    jQuery(document).ready(() => {
      this.$container = jQuery(`#${this.config.mainTabId}`);
      if (this.$container.length) {
        this.init();
      } else {
        this.logger.log(`Main container #${this.config.mainTabId} not found. Module not initialized.`);
      }
    });
  }

  init() {
    this.logger.log(`Module for main tab #${this.config.mainTabId} initialized.`);
    this.bindCommonEvents();
    this.bindModuleSpecificEvents(); // For child classes to override

    if (window.ProductEstimatorSettings && window.ProductEstimatorSettings.currentTab === this.config.mainTabId) {
      this.logger.log(`Main tab #${this.config.mainTabId} is currently active. Setting up vertical tabs.`);
      // Delay slightly to ensure DOM is fully ready, especially if other scripts manipulate it.
      setTimeout(() => {
        this.setupVerticalTabs();
        this.onMainTabActivated(); // Call activation hook
      }, 100);
    }
  }

  bindCommonEvents() {
    const $ = jQuery;
    $(document).on('product_estimator_tab_changed', this.handleMainTabChanged.bind(this));

    if (!this.$container || !this.$container.length) return;

    // Use more generic class for forms if possible, or allow override
    this.$container.on('submit', '.product-estimator-form, .pe-vtabs-tab-form', this.handleFormSubmit.bind(this));
    this.$container.on('click', '.pe-vtabs-nav-list a, .vertical-tabs-nav a', this.handleVerticalTabClick.bind(this)); // Support both old and new nav classes
  }

  /**
   * Placeholder for module-specific event bindings. Child classes should override this.
   */
  bindModuleSpecificEvents() {
    // Override in child class
  }

  /**
   * Placeholder for actions to take when the main tab for this module is activated.
   * Child classes can override this to perform specific setups like initializing editors, media uploaders etc.
   */
  onMainTabActivated() {
    // Override in child class
    this.logger.log(`onMainTabActivated hook for ${this.config.mainTabId}`);
  }

  /**
   * Placeholder for actions to take when the main tab for this module is deactivated.
   */
  onMainTabDeactivated() {
    // Override in child class if cleanup is needed
    this.logger.log(`onMainTabDeactivated hook for ${this.config.mainTabId}`);
  }


  setupVerticalTabs() {
    if (!this.$container || !this.$container.length) {
      this.logger.warn('Cannot setup vertical tabs: main container not found.');
      return;
    }
    this.logger.log('Setting up vertical tabs.');

    const $verticalTabsNav = this.$container.find('.pe-vtabs-nav-list, .vertical-tabs-nav'); // Support both
    const $verticalTabContents = this.$container.find('.pe-vtabs-tab-panel, .vertical-tab-content'); // Support both

    if (!$verticalTabsNav.length) {
      this.logger.warn('Vertical tab navigation area (.pe-vtabs-nav-list or .vertical-tabs-nav) not found.');
      return;
    }
    if (!$verticalTabContents.length) {
      this.logger.warn('Vertical tab content panels (.pe-vtabs-tab-panel or .vertical-tab-content) not found.');
      return;
    }

    let activeSubTabId = this.config.defaultSubTabId;
    const urlParams = new URLSearchParams(window.location.search);
    const urlSubTab = urlParams.get('sub_tab');

    if (urlSubTab && $verticalTabsNav.find(`a[data-tab="${urlSubTab}"]`).length) {
      activeSubTabId = urlSubTab;
    } else {
      const $phpActiveLink = $verticalTabsNav.find('.pe-vtabs-nav-item.active a, .tab-item.active a'); // Support both
      if ($phpActiveLink.length) {
        activeSubTabId = $phpActiveLink.data('tab');
      }
    }
    // Fallback if activeSubTabId determined is somehow not valid
    if (!$verticalTabsNav.find(`a[data-tab="${activeSubTabId}"]`).length) {
      this.logger.warn(`Determined active sub-tab "${activeSubTabId}" is not valid. Falling back to default: "${this.config.defaultSubTabId}"`);
      activeSubTabId = this.config.defaultSubTabId;
      // Ensure default is actually valid
      if (!$verticalTabsNav.find(`a[data-tab="${activeSubTabId}"]`).length) {
        const firstAvailableTab = $verticalTabsNav.find('a[data-tab]').first().data('tab');
        if (firstAvailableTab) {
          this.logger.warn(`Default sub-tab "${activeSubTabId}" also not valid. Using first available: "${firstAvailableTab}"`);
          activeSubTabId = firstAvailableTab;
        } else {
          this.logger.error('No valid sub-tabs found at all. Vertical tabs cannot be initialized.');
          return;
        }
      }
    }


    this.logger.log('Initial active sub-tab ID:', activeSubTabId);
    this.showVerticalTab(activeSubTabId, false); // false to not update history on initial load
    this.adjustTabContentHeight();

    jQuery(window).off(`resize.${this.config.mainTabId}`).on(`resize.${this.config.mainTabId}`, this.adjustTabContentHeight.bind(this));
  }

  adjustTabContentHeight() {
    if (!this.$container || !this.$container.length) return;
    const $nav = this.$container.find('.pe-vtabs-nav-area, .vertical-tabs'); // Support both
    const $contentWrapper = this.$container.find('.pe-vtabs-content-area, .vertical-tabs-content'); // Support both

    if ($nav.length && $contentWrapper.length) {
      const navHeight = $nav.outerHeight();
      if (navHeight) {
        $contentWrapper.css('min-height', navHeight + 'px');
      }
    }
  }

  handleVerticalTabClick(e) {
    e.preventDefault();
    const $link = jQuery(e.currentTarget);

    // Ensure the click originated from within this module's vertical tabs
    if (!$link.closest(this.$container.find('.pe-vtabs-nav-list, .vertical-tabs-nav')).length) {
      return; // Not our event
    }

    const subTabId = $link.data('tab');
    if (!subTabId) {
      this.logger.warn('Vertical tab link clicked but data-tab attribute is missing.', $link);
      return;
    }
    this.logger.log('Vertical tab clicked:', subTabId);
    this.showVerticalTab(subTabId, true); // true to update history
  }

  showVerticalTab(subTabId, updateHistory = true) {
    if (!this.$container || !this.config.mainTabId || !subTabId) {
      this.logger.warn('Cannot show vertical tab: missing container, mainTabId, or subTabId.', {
        containerExists: !!this.$container,
        mainTabId: this.config.mainTabId,
        subTabId
      });
      return;
    }
    this.logger.log('Showing vertical tab:', subTabId);

    const $verticalTabsNav = this.$container.find('.pe-vtabs-nav-list, .vertical-tabs-nav');
    const $verticalTabContents = this.$container.find('.pe-vtabs-tab-panel, .vertical-tab-content');

    $verticalTabsNav.find('.pe-vtabs-nav-item, .tab-item').removeClass('active');
    $verticalTabsNav.find(`a[data-tab="${subTabId}"]`).parent().addClass('active');

    $verticalTabContents.hide().removeClass('active');
    // The ID of the content panel should match subTabId
    this.$container.find(`#${subTabId}`).show().addClass('active');

    if (updateHistory) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('page', currentUrl.searchParams.get('page') || 'product-estimator-settings'); // Ensure page param is set
      currentUrl.searchParams.set('tab', this.config.mainTabId);
      currentUrl.searchParams.set('sub_tab', subTabId);
      window.history.pushState({mainTabId: this.config.mainTabId, subTabId: subTabId}, '', currentUrl.toString());
    }
    // Trigger an event that a sub-tab has changed
    jQuery(document).trigger(`pe_sub_tab_changed_${this.config.mainTabId}`, [subTabId]);
  }

  handleMainTabChanged(e, newMainTabId, oldMainTabId) {
    if (newMainTabId === this.config.mainTabId) {
      this.logger.log(`Main tab #${this.config.mainTabId} activated.`);
      // Delay to ensure other scripts (like main settings tab switcher) have finished updating DOM
      setTimeout(() => {
        if (!this.$container || !this.$container.length) { // Re-check container in case DOM was altered
          this.$container = jQuery(`#${this.config.mainTabId}`);
        }
        if (this.$container.length) {
          this.setupVerticalTabs();
          this.onMainTabActivated(); // Hook for child class
        } else {
          this.logger.warn(`Main container #${this.config.mainTabId} not found when trying to activate tab.`);
        }
      }, 100);
    } else if (oldMainTabId === this.config.mainTabId) {
      this.onMainTabDeactivated(); // Hook for child class
    }
  }

  handleFormSubmit(e) {
    e.preventDefault();
    if (!this.$container || !this.$container.length) return;

    const $form = jQuery(e.currentTarget);
    if (!$form.closest(this.$container).length) return; // Ensure form is within this module's container

    // TinyMCE save
    if (typeof tinyMCE !== 'undefined') {
      $form.find('.wp-editor-area').each(function() {
        const editor = tinyMCE.get(jQuery(this).attr('id'));
        if (editor) {
          editor.save(); // Save content from editor to textarea
        }
      });
    }

    let formDataStr = $form.serialize();
    const subTabType = $form.data('type') || $form.data('tab-id') || this.config.defaultSubTabId;

    this.logger.log(`Form submitted for sub-tab: ${subTabType}`);

    const $submitButton = $form.find('.save-settings');
    const $spinner = $form.find('.spinner');

    $submitButton.prop('disabled', true);
    $spinner.addClass('is-active');

    // Add unchecked checkboxes
    $form.find('input[type="checkbox"]').each(function() {
      const $cb = jQuery(this);
      if (!$cb.is(':checked')) {
        const name = $cb.attr('name');
        // Ensure it's not already in formDataStr (e.g. from a hidden field with value 0)
        const regex = new RegExp(`&?${encodeURIComponent(name)}=[^&]*`);
        if (!formDataStr.match(regex)) {
          formDataStr += `&${encodeURIComponent(name)}=0`;
        } else { // If it exists (e.g. as name=0 from a hidden field), ensure it's correctly set to 0 if unchecked
          formDataStr = formDataStr.replace(regex, `&${encodeURIComponent(name)}=0`);
        }
      }
    });
    // Clean leading/multiple ampersands
    formDataStr = formDataStr.replace(/^&+/, '').replace(/&&+/g, '&');


    this.logger.log('Sending form data:', formDataStr);
    const ajaxAction = `${this.config.ajaxActionPrefix}_settings`; // e.g., 'save_labels_settings'

    ajax.ajaxRequest({
      url: this.localizedData.ajax_url,
      type: 'POST',
      data: {
        action: ajaxAction,
        nonce: this.localizedData.nonce,
        form_data: formDataStr,
        sub_tab_type: subTabType // Pass sub-tab identifier if backend needs it
      }
    })
      .then(response => {
        this.logger.log('Success response:', response);
        const successMsg = (response && response.message)
          ? response.message
          : (this.localizedData.i18n && this.localizedData.i18n.saveSuccess)
            ? this.localizedData.i18n.saveSuccess
            : 'Settings saved successfully.';
        this.showNotice(successMsg, 'success');

        // Reset form changed state for this specific form/tab if ProductEstimatorSettings uses it
        if (window.ProductEstimatorSettings && typeof window.ProductEstimatorSettings.formChangeTrackers === 'object') {
          // Assuming the form is directly under a tab content div with ID matching mainTabId
          // This might need refinement if sub-tabs have their own change tracking.
          window.ProductEstimatorSettings.formChangeTrackers[this.config.mainTabId] = false;
          if (this.config.mainTabId === window.ProductEstimatorSettings.currentTab) {
            window.ProductEstimatorSettings.formChanged = false;
          }
        }

      })
      .catch(error => {
        this.logger.error('Error response:', error);
        const errorMsg = (error && error.message)
          ? error.message
          : (this.localizedData.i18n && this.localizedData.i18n.saveError)
            ? this.localizedData.i18n.saveError
            : 'Error saving settings.';
        this.showNotice(errorMsg, 'error');
      })
      .finally(() => {
        $submitButton.prop('disabled', false);
        $spinner.removeClass('is-active');
      });
  }

  showNotice(message, type = 'success') {
    if (window.ProductEstimatorSettings && typeof window.ProductEstimatorSettings.showNotice === 'function') {
      window.ProductEstimatorSettings.showNotice(message, type);
    } else if (typeof validation !== 'undefined' && typeof validation.showNotice === 'function') {
      validation.showNotice(message, type); // Fallback to global validation utility
    } else {
      this.logger.log(`NOTICE (${type}): ${message}`); // Console fallback
      alert(`(${type.toUpperCase()}) ${message}`); // Basic alert fallback
    }
  }

  showFieldError($field, message) {
    if (window.ProductEstimatorSettings && typeof window.ProductEstimatorSettings.showFieldError === 'function') {
      window.ProductEstimatorSettings.showFieldError($field, message);
    } else if (typeof validation !== 'undefined' && typeof validation.showFieldError === 'function') {
      validation.showFieldError($field, message);
    } else {
      this.clearFieldError($field); // Basic fallback
      const $error = jQuery(`<span class="field-error" style="color:red;display:block;">${message}</span>`);
      $field.after($error).addClass('error');
    }
  }

  clearFieldError($field) {
    if (window.ProductEstimatorSettings && typeof window.ProductEstimatorSettings.clearFieldError === 'function') {
      window.ProductEstimatorSettings.clearFieldError($field);
    } else if (typeof validation !== 'undefined' && typeof validation.clearFieldError === 'function') {
      validation.clearFieldError($field);
    } else { // Basic fallback
      $field.removeClass('error').next('.field-error').remove();
    }
  }
}

export default VerticalTabbedModule;
