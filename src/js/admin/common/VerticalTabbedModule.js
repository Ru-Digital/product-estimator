/**
 * VerticalTabbedModule.js
 *
 * Base class for settings modules that use a vertical tabbed interface.
 * Handles common vertical tab navigation, AJAX form submission, and state management.
 * Extends ProductEstimatorSettings.
 */
import { ajax, createLogger } from '@utils'; // Import ajax utility and logger creator

import ProductEstimatorSettings from './ProductEstimatorSettings'; // Adjust path if ProductEstimatorSettings is in a different directory

// Module-specific logger. Can be this.logger if preferred and initialized in constructor.
const logger = createLogger('VerticalTabbedModule');

class VerticalTabbedModule extends ProductEstimatorSettings {
  /**
   * Constructor for the VerticalTabbedModule.
   * @param {object} config - Configuration object for the module.
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

    this.config = config; // <<<< ADD THIS LINE

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
      // Optionally show a global notice if ProductEstimatorSettings instance is available
      if (window.ProductEstimatorSettingsInstance) {
        window.ProductEstimatorSettingsInstance.showNotice(`Error: UI container for '${this.settings.tab_id}' settings not found. Some features might be unavailable.`, 'error');
      }
      return; // Halt initialization if container is missing
    }

    this.bindCommonVTMEvents(); // Renamed from bindCommonEvents to avoid clash if base has it
    this.bindModuleSpecificEvents(); // Hook for child classes (e.g., AdminTableManager)

    // If this module's main tab is the currently active main tab in the UI
    // Access currentTab from the global orchestrator instance if available
    const orchestrator = window.ProductEstimatorSettingsInstance;
    if (orchestrator && orchestrator.currentTab === this.settings.tab_id) {
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

    // Click handling for vertical tab navigation links - use selectors from PHP's get_common_script_data
    // ENHANCEMENT: Use a very broad selector that will catch all possible tab links
    const navSelector = this.settings.selectors.verticalTabNav || '.pe-vtabs-nav-list, .vertical-tabs-nav';

    // Use a more robust selector that will catch any links in the nav area
    this.$container.on('click.vtm', `${navSelector} a, .pe-vtabs-nav-item a, .tab-item a`, this.handleVerticalTabClick.bind(this));

    // Fix data attributes on tab links during binding phase
    this.setTabAttributesOnLinks();

  }

  /**
   * Sets data-tab attributes on any tab links that are missing them.
   * This ensures all links have consistent data attributes.
   */
  setTabAttributesOnLinks() {
    // Find all potential tab links
    const navSelector = this.settings.selectors.verticalTabNav || '.pe-vtabs-nav-list, .vertical-tabs-nav';
    const $navLinks = this.$container.find(`${navSelector} a`);


    // For each link, ensure it has the proper data-tab attribute based on the URL
    $navLinks.each((i, link) => {
      const $link = this.$(link);
      const href = $link.attr('href') || '';

      // If no data-tab attribute but the href has sub_tab parameter
      if (!$link.attr('data-tab') && href.includes('sub_tab=')) {
        const match = href.match(/[?&]sub_tab=([^&#]*)/i);
        if (match && match[1]) {
          const subTabId = decodeURIComponent(match[1].replace(/\+/g, ' '));
          $link.attr('data-tab', subTabId);
        }
      }
    });
  }

  /**
   * Placeholder for module-specific event bindings. Override in child classes.
   * Child classes should implement this method to bind their own specific events.
   * For example, AdminTableManager uses this to bind table/form events.
   * This method is called during initialization after common events are bound.
   * @returns {void}
   */
  bindModuleSpecificEvents() {
    // Child classes like AdminTableManager will override this to bind their own specific events.
  }

  /**
   * Called when this module's main horizontal tab becomes active.
   * Child classes should override this method to implement specific activation logic.
   * This is the ideal place to refresh or initialize components that need to be
   * visible when the tab is shown.
   * @returns {void}
   */
  onMainTabActivated() {
    // Child classes can implement specific logic here.
  }

  /**
   * Called when this module's main horizontal tab becomes inactive.
   * Child classes should override this method to implement specific deactivation logic.
   * This is the ideal place to clean up resources or pause processes when the tab
   * is no longer visible.
   * @returns {void}
   */
  onMainTabDeactivated() {
    // Child classes can implement specific logic here.
  }

  setupVerticalTabs() {
    if (!this.$container || !this.$container.length) {
      return;
    }

    // Use selectors from settings that are provided by PHP via get_common_script_data
    const navSelector = this.settings.selectors.verticalTabNav || '.pe-vtabs-nav-list, .vertical-tabs-nav';
    const contentSelector = this.settings.selectors.verticalTabPane || '.pe-vtabs-tab-panel, .vertical-tab-content';

    const $verticalTabsNav = this.$container.find(navSelector);
    const $verticalTabContents = this.$container.find(contentSelector);

    if (!$verticalTabsNav.length || !$verticalTabContents.length) {
      return;
    }

    // Make sure all tab links have data-tab attributes
    // This ensures data attributes are added right before tab initialization
    this.setTabAttributesOnLinks();

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
      const $firstTabLink = $verticalTabsNav.find('a[data-tab]').first();
      if ($firstTabLink.length) {
        activeSubTabId = $firstTabLink.data('tab');
      } else {
        return;
      }
    }

    this.showVerticalTab(activeSubTabId, false); // false to prevent history update on initial load

    this.adjustTabContentHeight();
    // Ensure resize event is namespaced to this module instance to avoid conflicts
    this.$(window).off(`resize.vtm.${this.settings.tab_id}`).on(`resize.vtm.${this.settings.tab_id}`, this.adjustTabContentHeight.bind(this));
  }

  handleVerticalTabClick(e) {
    e.preventDefault();
    const $targetLink = this.$(e.currentTarget);

    // Multiple ways to get the subTabId, with fallbacks
    let subTabId = null;
    const element = $targetLink[0];

    // Direct DOM attribute access - most reliable for elements with data-* attributes
    const domTabAttr = element ? element.getAttribute('data-tab') : null;
    if (domTabAttr) {
      subTabId = domTabAttr;
    }
    // Check if there's a data-tabid attribute
    else if (element && element.hasAttribute('data-tabid')) {
      subTabId = element.getAttribute('data-tabid');
    }

    // If we have a subTabId from any of the data-* attributes
    if (subTabId) {
      this.showVerticalTab(subTabId, true); // true to update history
      return;
    }

    // No data-* attributes found, try the URL as last resort
    // THIS IS THE MOST IMPORTANT FALLBACK - we prioritize this approach for more reliability
    const href = $targetLink.attr('href');

    // Direct regex extraction for sub_tab parameter - most reliable method
    // This works even when URL is relative or malformed
    if (href) {
      const subTabMatch = href.match(/[?&]sub_tab=([^&#]*)/i);
      if (subTabMatch && subTabMatch[1]) {
        const subTabFromRegex = decodeURIComponent(subTabMatch[1].replace(/\+/g, ' '));
        this.showVerticalTab(subTabFromRegex, true);

        // Fix the data-tab attribute for future clicks
        $targetLink.attr('data-tab', subTabFromRegex);
        return;
      }

      // As a backup, try standard URL parsing
      if (href.includes('sub_tab=')) {
        try {
          const hrefUrl = new URL(href, window.location.origin);
          const subTabFromHref = hrefUrl.searchParams.get('sub_tab');
          if (subTabFromHref) {
            this.showVerticalTab(subTabFromHref, true);
            // Fix the data-tab attribute to prevent future issues
            $targetLink.attr('data-tab', subTabFromHref);
            return;
          }
        } catch (e) {
          // If URL parsing fails, try a more direct approach with URLSearchParams
          try {
            const queryString = href.split('?')[1];
            if (queryString) {
              const subTabFromHref = new URLSearchParams(queryString).get('sub_tab');
              if (subTabFromHref) {
                this.showVerticalTab(subTabFromHref, true);
                // Fix the data-tab attribute to prevent future issues
                $targetLink.attr('data-tab', subTabFromHref);
                return;
              }
            }
          } catch (e2) {
            logger.error('Error parsing URL or query string:', e2);
          }
        }
      }
    }
  }

  adjustTabContentHeight() {
    if (!this.$container || !this.$container.length) return;

    // Use provided selectors with fallbacks
    const navAreaSelector = this.settings.selectors.verticalTabNavArea || '.pe-vtabs-nav-area, .vertical-tabs';
    const contentAreaSelector = this.settings.selectors.verticalTabContentArea || '.pe-vtabs-content-area, .vertical-tabs-content';

    const $nav = this.$container.find(navAreaSelector);
    const $contentWrapper = this.$container.find(contentAreaSelector);

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

    // Use shared selectors from settings with fallbacks
    const navSelector = this.settings.selectors.verticalTabNav || '.pe-vtabs-nav-list, .vertical-tabs-nav';
    const contentSelector = this.settings.selectors.verticalTabPane || '.pe-vtabs-tab-panel, .vertical-tab-content';
    const navItemSelector = this.settings.selectors.verticalTabNavItem || '.pe-vtabs-nav-item, .tab-item';

    const $verticalTabsNav = this.$container.find(navSelector);
    const $verticalTabContents = this.$container.find(contentSelector);

    // Remove active class from all nav items
    $verticalTabsNav.find(navItemSelector).removeClass('active');

    // Find the tab link directly using data attribute
    let $activeLink = $verticalTabsNav.find(`a[data-tab="${subTabId}"]`);

    // If not found, try other ways to find the link
    if (!$activeLink.length) {
      // Look for links with matching href containing the tab ID
      $activeLink = $verticalTabsNav.find(`a[href*="sub_tab=${subTabId}"]`);

      // If still not found, try more aggressive matching
      if (!$activeLink.length) {
        $verticalTabsNav.find('a').each((i, link) => {
          const $link = this.$(link);
          const href = $link.attr('href') || '';

          // If this link's href contains our tab ID
          if (href.includes(subTabId)) {
            $activeLink = $link;
            // Set the data-tab attribute to fix future lookups
            $link.attr('data-tab', subTabId);
          }
        });
      }
    }

    // Now add active class to the parent li of the found link
    if ($activeLink.length) {
      $activeLink.closest(navItemSelector).addClass('active');
    } else {
      // No active link found - this is OK if this is the initial load
      // and we'll select the default tab
    }

    // Hide and deactivate all tab content panels
    $verticalTabContents.hide().removeClass('active');

    // Find and activate the selected content panel
    // First try exact ID match
    const sanitizedTabId = subTabId.replace(/[^a-zA-Z0-9-_]/g, '');
    let $activeContentPanel = this.$container.find(`#${sanitizedTabId}`);

    // If not found, try more flexible selectors
    if (!$activeContentPanel.length) {
      // Try panel with a class that contains the tab ID
      $activeContentPanel = this.$container.find(`.pe-vtabs-tab-panel-${sanitizedTabId}, [data-tab-id="${sanitizedTabId}"], [data-tab-content="${sanitizedTabId}"]`);
    }

    // If still not found, try searching for a panel that contains the tab ID in class or id
    if (!$activeContentPanel.length) {
      $activeContentPanel = this.$container.find(`[id*="${sanitizedTabId}"], [class*="${sanitizedTabId}"]`).filter('.pe-vtabs-tab-panel, .vertical-tab-content');
    }

    if ($activeContentPanel.length) {
      $activeContentPanel.show().addClass('active');
    } else {
      // No matching content panel found with direct ID - try partial matches

      // Last resort: try to find a panel with a similar ID/class
      const partialMatches = [];
      const contentPanels = this.$container.find(contentSelector);
      contentPanels.each((i, panel) => {
        const $panel = this.$(panel);
        const panelId = $panel.attr('id') || '';
        const panelClass = $panel.attr('class') || '';

        // Check if panel ID or class contains parts of the tab ID
        if (panelId.includes(sanitizedTabId.substring(0, 5)) ||
            panelClass.includes(sanitizedTabId.substring(0, 5))) {
          partialMatches.push($panel);
        }
      });

      if (partialMatches.length === 1) {
        // If we have exactly one partial match, use it
        partialMatches[0].show().addClass('active');
      } else if (partialMatches.length > 1) {
        partialMatches[0].show().addClass('active');
      }
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
        // Container not found, log a warning
        this.logger.warn(`VerticalTabbedModule: Container for tab '${this.settings.tab_id}' not found when activating main tab`);
      }
    } else if (oldMainTabId === this.settings.tab_id) { // If this VTM's main tab was deactivated
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
      this.showNotice('Error: Could not save settings. Form configuration is missing "data-sub-tab-id".', 'error');
      return;
    }

    // Special handling for multi-select elements using Select2
    $form.find('select[multiple]').each((idx, select) => {
      const $select = this.$(select);
      const name = $select.attr('name');
      
      // If this is a multi-select that uses Select2
      if (name && $select.hasClass('pe-select2')) {
        const values = $select.val();
        
        // Remove any existing serialized versions of this field
        const regex = new RegExp(`${encodeURIComponent(name)}=[^&]*&?`, 'g');
        formDataStr = formDataStr.replace(regex, '');
        
        // Add each selected value individually with array notation
        if (values && values.length) {
          values.forEach(value => {
            formDataStr += `&${encodeURIComponent(name)}[]=${encodeURIComponent(value)}`;
          });
        } else {
          // Ensure empty array is sent if nothing selected
          formDataStr += `&${encodeURIComponent(name)}[]=`;
        }
      }
    });

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


    ajax.ajaxRequest({
      url: this.settings.ajaxUrl, // ajaxUrl from base class settings
      type: 'POST',
      data: ajaxDataPayload
    })
      .then(response => {
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
        const errorMsg = (error && error.message) ? error.message : (this.settings.i18n && this.settings.i18n.saveError) || 'Error saving settings.';
        this.showNotice(errorMsg, 'error'); // Inherited from ProductEstimatorSettings
      })
      .finally(() => {
        $submitButton.prop('disabled', false);
        $spinner.removeClass('is-active');
      });
  }

  // showNotice, showFieldError, clearFieldError are inherited from ProductEstimatorSettings.
  // No need to redefine them here.
}

export default VerticalTabbedModule;
