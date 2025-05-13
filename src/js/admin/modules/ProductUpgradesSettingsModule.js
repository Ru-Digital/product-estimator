// File: admin/js/modules/ProductUpgradesSettingsModule.js

/**
 * Product Upgrades Settings JavaScript
 *
 * Handles functionality specific to the product upgrades settings tab.
 * Extends AdminTableManager for common table and form management.
 */
import AdminTableManager from '../common/AdminTableManager';
import { ajax, validation, dom } from '@utils';
import { createLogger } from '@utils';

class ProductUpgradesSettingsModule extends AdminTableManager {
  /**
   * Constructor for ProductUpgradesSettingsModule.
   */
  constructor() {
    const config = {
      mainTabId: 'product_upgrades',
      localizedDataName: 'productUpgradesSettings'
      // AdminTableManager passes this to VerticalTabbedModule,
      // which passes relevant parts to ProductEstimatorSettings.
    };
    super(config); // Calls AdminTableManager constructor

    // this.logger is initialized by AdminTableManager
    // this.settings is populated by ProductEstimatorSettings via the super chain
    // this.config from AdminTableManager holds the original config passed here

    // Defer DOM-dependent specific initializations until the base AdminTableManager signals it's ready
    this.$(document).on(`admin_table_manager_ready_${this.config.mainTabId}`, () => {
      this._cacheProductUpgradesDOM();
      this._bindSpecificEvents();
      this._initializeSelect2();
    });

  }

  /**
   * Cache DOM elements specific to Product Upgrades, beyond what AdminTableManager caches.
   * This is called after AdminTableManager's cacheDOM.
   * @private
   */
  _cacheProductUpgradesDOM() {
    // this.dom is initialized by AdminTableManager. Add Product Upgrades specific elements.
    if (this.settings && this.settings.selectors) {
      const puSelectors = this.settings.selectors;
      this.dom.baseCategories = this.$container.find(puSelectors.baseCategories);
      this.dom.upgradeCategories = this.$container.find(puSelectors.upgradeCategories);
      this.dom.upgradeTitle = this.$container.find(puSelectors.upgradeTitle);
      this.dom.upgradeDescription = this.$container.find(puSelectors.upgradeDescription);
    } else {
    }
  }

  /**
   * Bind events specific to Product Upgrades.
   * This is called after the `admin_table_manager_ready` event.
   * @private
   */
  _bindSpecificEvents() {
    // Ensure this.dom elements are available
    if (!this.dom.form || !this.dom.form.length) {
      return;
    }

    // Any product upgrades specific events can be bound here

  }

  /**
   * Initialize Select2 components.
   * This is called after the `admin_table_manager_ready` event.
   * @private
   */
  _initializeSelect2() {
    this.initializeSelect2Dropdowns({
      elements: [
        {
          element: this.dom.baseCategories,
          placeholderKey: 'selectBaseCategories',
          fallbackText: 'Select base categories',
          name: 'base categories',
          config: {
            clearInitial: true,
            width: '100%'
          }
        },
        {
          element: this.dom.upgradeCategories,
          placeholderKey: 'selectUpgradeCategories',
          fallbackText: 'Select upgrade categories',
          name: 'upgrade categories',
          config: {
            clearInitial: true,
            width: '100%'
          }
        }
      ],
      moduleName: 'Product Upgrades'
    });
  }


  /**
   * Overridden from VerticalTabbedModule. Called when the "Product Upgrades" main tab is activated.
   */
  onMainTabActivated() {
    super.onMainTabActivated(); // Call parent method

    // Refresh Select2 components if they're already initialized
    if (this.dom.baseCategories && this.dom.baseCategories.hasClass("select2-hidden-accessible")) {
      this.refreshSelect2(this.dom.baseCategories);
    }
    if (this.dom.upgradeCategories && this.dom.upgradeCategories.hasClass("select2-hidden-accessible")) {
      this.refreshSelect2(this.dom.upgradeCategories);
    }
  }

  /**
   * Override AdminTableManager.resetForm to include Product Upgrades specific fields.
   */
  resetForm() {
    super.resetForm(); // Call base class method first

    // Reset Product Upgrades specific fields
    this.dom.baseCategories?.val(null).trigger('change.select2');
    this.dom.upgradeCategories?.val(null).trigger('change.select2');
    this.dom.upgradeTitle?.val('');
    this.dom.upgradeDescription?.val('');

  }

  /**
   * Override AdminTableManager.populateFormWithData for Product Upgrades specific fields.
   */
  populateFormWithData(itemData) {
    super.populateFormWithData(itemData); // Sets item ID, calls base logic

    const baseCategories = itemData.base_categories || [];
    const upgradeCategories = itemData.upgrade_categories || [];

    // Look for field values in multiple possible locations
    const title = itemData.upgrade_title || itemData.title || '';
    const description = itemData.upgrade_description || itemData.description || '';


    // Use setTimeout to allow dependent field visibility changes to complete
    setTimeout(() => {
      this.dom.baseCategories?.val(baseCategories).trigger('change.select2');
      this.dom.upgradeCategories?.val(upgradeCategories).trigger('change.select2');
      this.dom.upgradeTitle?.val(title);
      this.dom.upgradeDescription?.val(description);

      this.formModified = false; // Reset modified flag after populating
    }, 150);
  }

  /**
   * Override AdminTableManager.validateForm for Product Upgrades specific validation.
   */
  validateForm() {
    let isValid = super.validateForm(); // Perform base validation first

    // Get values
    const baseCategories = this.dom.baseCategories?.val();
    const upgradeCategories = this.dom.upgradeCategories?.val();

    // i18n messages from this.settings.i18n
    const i18n = this.settings.i18n || {};

    // Clear previous specific errors
    this.clearFieldError(this.dom.baseCategories?.next('.select2-container'));
    this.clearFieldError(this.dom.upgradeCategories?.next('.select2-container'));

    if (!baseCategories || baseCategories.length === 0) {
      this.showFieldError(this.dom.baseCategories?.next('.select2-container'), i18n.selectBaseCategories || 'Please select at least one base category.');
      isValid = false;
    }

    if (!upgradeCategories || upgradeCategories.length === 0) {
      this.showFieldError(this.dom.upgradeCategories?.next('.select2-container'), i18n.selectUpgradeCategories || 'Please select at least one upgrade category.');
      isValid = false;
    }

    return isValid;
  }

  /**
   * Custom column population method for 'base_categories' column
   * This method follows the naming convention for column handlers in AdminTableManager
   */
  populateColumn_base_categories($cell, itemData) {

    // Look in all possible data fields to find the display value
    const displayValue = itemData.base_categories_display ||
                        itemData.base_category_names ||
                        (Array.isArray(itemData.base_categories) ? itemData.base_categories.join(',') : '') ||
                        'N/A';

    $cell.text(displayValue);
  }

  /**
   * Custom column population method for 'upgrade_categories' column
   */
  populateColumn_upgrade_categories($cell, itemData) {

    // Look in all possible data fields to find the display value
    const displayValue = itemData.upgrade_categories_display ||
                        itemData.upgrade_category_names ||
                        (Array.isArray(itemData.upgrade_categories) ? itemData.upgrade_categories.join(',') : '') ||
                        'N/A';

    $cell.text(displayValue);
  }

}

// Initialize the module when the DOM is ready and its main tab container exists.
jQuery(document).ready(function ($) {
  const mainTabId = 'product_upgrades'; // Specific to this module
  const localizedDataObjectName = 'productUpgradesSettings'; // Global settings object name

  if ($(`#${mainTabId}`).length) {
    // Check if the global localized data for this module is available
    if (window[localizedDataObjectName]) {
      // Instantiate the module once
      if (!window.ProductUpgradesSettingsModuleInstance) {
        try {
          window.ProductUpgradesSettingsModuleInstance = new ProductUpgradesSettingsModule();
          createLogger('ProductUpgradesInit').log('ProductUpgradesSettingsModule instance initiated.');
        } catch (error) {
          createLogger('ProductUpgradesInit').error('Error instantiating ProductUpgradesSettingsModule:', error);
          // Use the global notice system if ProductEstimatorSettings is available
          if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
            window.ProductEstimatorSettingsInstance.showNotice('Failed to initialize Product Upgrades settings. Check console for errors.', 'error');
          }
        }
      }
    } else {
      createLogger('ProductUpgradesInit').error(`Localized data object "${localizedDataObjectName}" not found for tab: ${mainTabId}. Module cannot be initialized.`);
      if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
        window.ProductEstimatorSettingsInstance.showNotice(`Configuration data for Product Upgrades ("${localizedDataObjectName}") is missing. Module disabled.`, 'error');
      }
    }
  } else {
    createLogger('ProductUpgradesInit').warn(`Main container #${mainTabId} not found. ProductUpgradesSettingsModule will not be initialized.`);
  }
});

export default ProductUpgradesSettingsModule;
