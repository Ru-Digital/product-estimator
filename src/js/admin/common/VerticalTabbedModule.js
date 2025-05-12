/**
 * VerticalTabbedModule.js
 *
 * Base class for settings modules that use a vertical tabbed interface.
 * Handles common vertical tab navigation, AJAX form submission, and state management.
 * Extends ProductEstimatorSettings.
 */
import ProductEstimatorSettings from './ProductEstimatorSettings'; // Adjust path if ProductEstimatorSettings is in a different directory
import { ajax } from '@utils'; // Assuming @utils provides ajax
import { createLogger } from '@utils';

// Module-specific logger. Can be this.logger if preferred and initialized in constructor.
const logger = createLogger('VerticalTabbedModule');

class VerticalTabbedModule extends ProductEstimatorSettings {
  /**
   * Constructor for the VerticalTabbedModule.
   * @param {Object} config - Configuration object for the module.
   * @param {string} config.mainTabId - The ID of the main horizontal tab for this module (e.g., 'labels', 'notifications'). This is passed as defaultTabId to ProductEstimatorSettings.
   * @param {string} config.defaultSubTabId - The default vertical sub-tab to show if none is specified.
   * @param {string} config.ajaxActionPrefix - The prefix for AJAX save actions (e.g., 'save_labels' for 'save_labels_settings').
   * @param {string} config.localizedDataName - The name of the global object holding localized data for this module (e.g., 'labelSettingsData'). This is passed as settingsObjectName to ProductEstimatorSettings.
   */
  constructor(config) {
    // Call the parent constructor (ProductEstimatorSettings)
    // map mainTabId to defaultTabId for ProductEstimatorSettings' module mode
    // map localizedDataName to settingsObjectName
    super({
      isModule: true,
      settingsObjectName: config.localizedDataName,
      defaultTabId: config.mainTabId,
    });

    // Store VTM-specific configuration.
    // this.settings is populated by the super() call with ajaxUrl, nonce, i18n, tab_id (which is mainTabId)
    this.vtmConfig = {
      defaultSubTabId: config.defaultSubTabId,
      ajaxActionPrefix: config.ajaxActionPrefix,
      // mainTabId and localizedDataName are available via this.settings.tab_id and this.settingsObjectName respectively
    };

    this.$container = null; // Will be jQuery object for `#mainTabId`

    // Validate VTM-specific config parts that are not covered by super's implicit validation via settingsObjectName/defaultTabId
    if (!this.vtmConfig.defaultSubTabId || !this.vtmConfig.ajaxActionPrefix) {
      logger.error('VerticalTabbedModule: Missing critical VTM-specific configuration (defaultSubTabId or ajaxActionPrefix). Halting initialization for this instance.', this.vtmConfig);
      // The super constructor would have already run, but this module might not function correctly.
      // No explicit return here as super() doesn't allow return before it.
      // The moduleInit will likely fail or not run as expected if $container isn't found or if these configs are vital early.
    }

    // Note: jQuery(document).ready() and calling moduleInit() is handled by the ProductEstimatorSettings base class.
    // this.settings (formerly this.localizedData) is initialized by super().
    // Fallbacks for nonce and ajax_url within this.settings are handled by ProductEstimatorSettings.
    // The specific VTM fallback from window.productEstimatorSettings for nonce/ajax_url might need review
    // if the base class's fallback (from ajaxurl global or direct properties) isn't sufficient.
    // For now, assume base class handles it.
  }

  /**
   * Module-specific initialization, called by ProductEstimatorSettings on document.ready.
   * Overridden from ProductEstimatorSettings.
   */
  moduleInit() {
    // this.settings.tab_id is the mainTabId for this VTM instance
    this.$container = this.$(`#${this.settings.tab_id}`);

    if (!this.$container.length) {
      logger.error(`VerticalTabbedModule: Main container #${this.settings.tab_id} not found. Module not initialized further.`);
      // Optionally show a global notice if ProductEstimatorSettings instance is available
      if (window.ProductEstimatorSettingsInstance) {
        window.ProductEstimatorSettingsInstance.showNotice(`Error: UI container for '${this.settings.tab_id}' settings not found. Some features might be unavailable.`, 'error');
      }
      return; // Halt initialization if container is missing
    }

    logger.log(`VerticalTabbedModule: moduleInit() called for main tab #${this.settings.tab_id}.`);
    this.bindCommonVTMEvents(); // Renamed from bindCommonEvents to avoid clash if base has it
    this.bindModuleSpecificEvents(); // Hook for child classes (e.g., AdminTableManager)

    // If this module's main tab is the currently active main tab in the UI
    // Access currentTab from the global orchestrator instance if available
    const orchestrator = window.ProductEstimatorSettingsInstance;
    if (orchestrator && orchestrator.currentTab === this.settings.tab_id) {
      logger.log(`VerticalTabbedModule: Main tab #${this.settings.tab_id} is currently active. Setting up vertical tabs and calling onMainTabActivated.`);
      // Use a small timeout to ensure the DOM is fully settled, especially if tab content was just shown
      setTimeout(() => {
        this.setupVerticalTabs();
        this.onMainTabActivated(); // Hook for child classes
      }, 100);
    }
  }

  /**
   * Binds event handlers common to VerticalTabbedModules.
   */
  bindCommonVTMEvents() {
    // Listen for global main tab changes (handled by ProductEstimatorSettings orchestrator)
    // This event is triggered by the orchestrator.
    this.$(document).on('product_estimator_tab_changed', this.handleMainTabChanged.bind(this));

    // Form submission for forms within this module that are specifically for VTM handling
    // These forms should have class 'pe-vtabs-tab-form'
    this.$container.on('submit.vtm', 'form.pe-vtabs-tab-form', this.handleVTMFormSubmit.bind(this));

    // Click handling for vertical tab navigation links
    this.$container.on('click.vtm', '.pe-vtabs-nav-list a, .vertical-tabs-nav a', this.handleVerticalTabClick.bind(this));
    logger.log(`VerticalTabbedModule for "${this.settings.tab_id}": Common VTM events bound.`);
  }

  /**
   * Placeholder for module-specific event bindings. Override in child classes.
   * (e.g., AdminTableManager will put its item table/form events here or in its own init)
   */
  bindModuleSpecificEvents() {
    logger.log(`VerticalTabbedModule for "${this.settings.tab_id}": Base bindModuleSpecificEvents() called.`);
    // Child classes like AdminTableManager will override this to bind their own specific events.
  }

  /**
   * Called when this module's main horizontal tab becomes active. Override in child classes.
   */
  onMainTabActivated() {
    logger.log(`VerticalTabbedModule for "${this.settings.tab_id}": Base onMainTabActivated() called.`);
    // Child classes can implement specific logic here.
  }

  /**
   * Called when this module's main horizontal tab becomes inactive. Override in child classes.
   */
  onMainTabDeactivated() {
    logger.log(`VerticalTabbedModule for "${this.settings.tab_id}": Base onMainTabDeactivated() called.`);
    // Child classes can implement specific logic here.
  }

  setupVerticalTabs() {
    if (!this.$container || !this.$container.length) {
      logger.warn(`VerticalTabbedModule for "${this.settings.tab_id}": Cannot setup vertical tabs, $container not found.`);
      return;
    }
    logger.log(`VerticalTabbedModule for "${this.settings.tab_id}": Setting up vertical tabs.`);
    const $verticalTabsNav = this.$container.find('.pe-vtabs-nav-list, .vertical-tabs-nav');
    const $verticalTabContents = this.$container.find('.pe-vtabs-tab-panel, .vertical-tab-content');

    if (!$verticalTabsNav.length || !$verticalTabContents.length) {
      logger.warn(`VerticalTabbedModule for "${this.settings.tab_id}": Vertical tab navigation or content panels not found. Vertical tabs may not function.`);
      return;
    }

    let activeSubTabId = this.vtmConfig.defaultSubTabId;
    const urlParams = new URLSearchParams(window.location.search);
    const urlSubTab = urlParams.get('sub_tab');

    if (urlSubTab && $verticalTabsNav.find(`a[data-tab="${urlSubTab}"]`).length) {
      activeSubTabId = urlSubTab;
    } else {
      const $phpActiveLink = $verticalTabsNav.find('.pe-vtabs-nav-item.active a, .tab-item.active a');
      if ($phpActiveLink.length) {
        activeSubTabId = $phpActiveLink.data('tab');
      }
    }

    if (!$verticalTabsNav.find(`a[data-tab="${activeSubTabId}"]`).length) {
      logger.warn(`VerticalTabbedModule for "${this.settings.tab_id}": Determined active/default sub-tab "${activeSubTabId}" not valid. Falling back to first available.`);
      const $firstTabLink = $verticalTabsNav.find('a[data-tab]').first();
      if ($firstTabLink.length) {
        activeSubTabId = $firstTabLink.data('tab');
      } else {
        logger.error(`VerticalTabbedModule for "${this.settings.tab_id}": No valid sub-tabs found. Cannot initialize vertical tabs.`);
        return;
      }
    }

    logger.log(`VerticalTabbedModule for "${this.settings.tab_id}": Initial active sub-tab ID to show: ${activeSubTabId}`);
    this.showVerticalTab(activeSubTabId, false); // false to prevent history update on initial load

    this.adjustTabContentHeight();
    // Ensure resize event is namespaced to this module instance to avoid conflicts
    this.$(window).off(`resize.vtm.${this.settings.tab_id}`).on(`resize.vtm.${this.settings.tab_id}`, this.adjustTabContentHeight.bind(this));
  }

  handleVerticalTabClick(e) {
    e.preventDefault();
    const $targetLink = this.$(e.currentTarget);
    const subTabId = $targetLink.data('tab');

    if (subTabId) {
      this.showVerticalTab(subTabId, true); // true to update history
    } else {
      logger.warn(`VerticalTabbedModule for "${this.settings.tab_id}": Vertical tab link clicked but no subTabId found in data-tab attribute.`);
    }
  }

  adjustTabContentHeight() {
    if (!this.$container || !this.$container.length) return;
    const $nav = this.$container.find('.pe-vtabs-nav-area, .vertical-tabs');
    const $contentWrapper = this.$container.find('.pe-vtabs-content-area, .vertical-tabs-content');
    if ($nav.length && $contentWrapper.length) {
      const navHeight = $nav.outerHeight();
      if (navHeight) { // Ensure navHeight is a valid number
        $contentWrapper.css('min-height', navHeight + 'px');
      }
    }
  }

  showVerticalTab(subTabId, updateHistory = true) {
    if (!this.$container || !this.settings.tab_id || !subTabId) {
      logger.warn('VerticalTabbedModule: Cannot show vertical tab due to missing container, mainTabId, or subTabId.', {
        containerExists: !!this.$container?.length,
        mainTabId: this.settings.tab_id,
        subTabId: subTabId
      });
      return;
    }
    const $verticalTabsNav = this.$container.find('.pe-vtabs-nav-list, .vertical-tabs-nav');
    const $verticalTabContents = this.$container.find('.pe-vtabs-tab-panel, .vertical-tab-content');

    $verticalTabsNav.find('.pe-vtabs-nav-item, .tab-item').removeClass('active');
    $verticalTabsNav.find(`a[data-tab="${subTabId}"]`).closest('.pe-vtabs-nav-item, .tab-item').addClass('active');

    $verticalTabContents.hide().removeClass('active');
    const $activeContentPanel = this.$container.find(`#${subTabId.replace(/[^a-zA-Z0-9-_]/g, '')}`);
    if ($activeContentPanel.length) {
      $activeContentPanel.show().addClass('active');
    } else {
      logger.warn(`VerticalTabbedModule for "${this.settings.tab_id}": Content panel for sub-tab ID "${subTabId}" not found.`);
    }

    if (updateHistory) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('page', currentUrl.searchParams.get('page') || 'product-estimator-settings'); // Ensure page param is present
      currentUrl.searchParams.set('tab', this.settings.tab_id); // main horizontal tab
      currentUrl.searchParams.set('sub_tab', subTabId); // vertical sub-tab
      window.history.pushState({ mainTabId: this.settings.tab_id, subTabId: subTabId }, '', currentUrl.toString());
    }
    // Trigger a sub-tab changed event, namespaced by the main tab ID
    this.$(document).trigger(`pe_sub_tab_changed_${this.settings.tab_id}`, [subTabId]);
  }

  /**
   * Handles the main horizontal tab change event.
   * @param {Event} e - The event object.
   * @param {string} newMainTabId - The ID of the newly activated main horizontal tab.
   * @param {string} oldMainTabId - The ID of the previously active main horizontal tab.
   */
  handleMainTabChanged(e, newMainTabId, oldMainTabId) {
    if (newMainTabId === this.settings.tab_id) { // If this VTM's main tab is now active
      logger.log(`VerticalTabbedModule: Main tab #${this.settings.tab_id} activated.`);
      // Ensure $container is valid, especially if moduleInit was deferred or failed partially
      if (!this.$container || !this.$container.length) {
        this.$container = this.$(`#${this.settings.tab_id}`);
      }
      if (this.$container.length) {
        setTimeout(() => { // Use setTimeout to ensure tab content is fully visible and DOM settled
          this.setupVerticalTabs(); // Re-initialize or ensure vertical tabs are correctly set up
          this.onMainTabActivated(); // Call hook for child classes
        }, 100);
      } else {
        logger.warn(`VerticalTabbedModule: Main container #${this.settings.tab_id} not found when trying to reactivate tab.`);
      }
    } else if (oldMainTabId === this.settings.tab_id) { // If this VTM's main tab was deactivated
      logger.log(`VerticalTabbedModule: Main tab #${this.settings.tab_id} deactivated.`);
      this.onMainTabDeactivated(); // Call hook for child classes
    }
  }

  /**
   * Handles AJAX form submission for forms within vertical tabs.
   * These forms should have the class 'pe-vtabs-tab-form' and a 'data-sub-tab-id' attribute.
   * @param {Event} e - Submit event.
   */
  handleVTMFormSubmit(e) {
    const $form = this.$(e.currentTarget);
    e.preventDefault();
    logger.log(`VTM Form submission for main tab "${this.settings.tab_id}", form:`, $form[0]);

    const $submitButton = $form.find('.save-settings, button[type="submit"], input[type="submit"]');
    const $spinner = $form.find('.spinner').first(); // Common spinner class

    // Save TinyMCE editors if any
    if (typeof tinyMCE !== 'undefined') {
      $form.find('.wp-editor-area').each((idx, editorArea) => {
        const editor = tinyMCE.get(this.$(editorArea).attr('id'));
        if (editor) {
          editor.save();
        }
      });
    }

    let formDataStr = $form.serialize();
    const subTabId = $form.attr('data-sub-tab-id');

    if (!subTabId || String(subTabId).trim() === '') {
      logger.error(`VerticalTabbedModule for "${this.settings.tab_id}": CRITICAL - 'data-sub-tab-id' attribute is missing or empty on the submitted form. Form:`, $form[0]);
      this.showNotice('Error: Could not save settings. Form configuration is missing "data-sub-tab-id".', 'error');
      return;
    }

    // Handle unchecked checkboxes
    $form.find('input[type="checkbox"]').each((idx, cb) => {
      const $cb = this.$(cb);
      const name = $cb.attr('name');
      if (name && !$cb.is(':checked')) {
        const paramExistsRegex = new RegExp(`(^|&)${encodeURIComponent(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=`);
        if (!paramExistsRegex.test(formDataStr)) {
          formDataStr += `&${encodeURIComponent(name)}=0`;
        }
      }
    });
    formDataStr = formDataStr.replace(/^&+/, '').replace(/&&+/g, '&');

    $submitButton.prop('disabled', true);
    $spinner.addClass('is-active');

    const ajaxAction = `${this.vtmConfig.ajaxActionPrefix}_settings`; // Uses VTM specific prefix
    const ajaxDataPayload = {
      action: ajaxAction,
      nonce: this.settings.nonce, // Nonce from base class settings
      form_data: formDataStr,
      sub_tab_id: subTabId.trim(), // Essential for PHP to know which sub-tab's settings to save
      main_tab_id: this.settings.tab_id // Pass main tab ID for context if needed by backend
    };

    logger.log(`VerticalTabbedModule for "${this.settings.tab_id}": Sending AJAX with payload:`, ajaxDataPayload);

    ajax.ajaxRequest({
      url: this.settings.ajaxUrl, // ajaxUrl from base class settings
      type: 'POST',
      data: ajaxDataPayload
    })
      .then(response => {
        logger.log(`VerticalTabbedModule for "${this.settings.tab_id}": AJAX success response:`, response);
        const successMsg = (response && response.message) || (this.settings.i18n && this.settings.i18n.saveSuccess) || 'Settings saved successfully.';
        this.showNotice(successMsg, 'success'); // Inherited from ProductEstimatorSettings

        // Reset form change tracking on the main orchestrator if it exists
        const orchestrator = window.ProductEstimatorSettingsInstance;
        if (orchestrator && typeof orchestrator.formChangeTrackers === 'object') {
          orchestrator.formChangeTrackers[this.settings.tab_id] = false;
          if (orchestrator.currentTab === this.settings.tab_id) {
            orchestrator.formChanged = false;
          }
        }
      })
      .catch(error => {
        logger.error(`VerticalTabbedModule for "${this.settings.tab_id}": AJAX error response:`, error);
        const errorMsg = (error && error.message) ? error.message : (this.settings.i18n && this.settings.i18n.saveError) || 'Error saving settings.';
        this.showNotice(errorMsg, 'error'); // Inherited from ProductEstimatorSettings
      })
      .finally(() => {
        $submitButton.prop('disabled', false);
        $spinner.removeClass('is-active');
        logger.log(`VerticalTabbedModule for "${this.settings.tab_id}": AJAX request finalized.`);
      });
  }

  // showNotice, showFieldError, clearFieldError are inherited from ProductEstimatorSettings.
  // No need to redefine them here.
}

export default VerticalTabbedModule;
