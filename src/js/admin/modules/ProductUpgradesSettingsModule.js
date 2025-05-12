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
      this.logger.log('Base AdminTableManager is ready. Initializing ProductUpgrades specifics.');
      this._cacheProductUpgradesDOM();
      this._bindSpecificEvents();
      this._initializeSelect2();
      this.logger.log('ProductUpgradesSettingsModule specific features initialized.');
    });

    this.logger.log('ProductUpgradesSettingsModule constructor completed.');
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
      this.logger.log('Product Upgrades specific DOM elements cached.');
    } else {
      this.logger.warn('Cannot cache Product Upgrades specific DOM elements: this.settings.selectors not available.');
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
      this.logger.error('ProductUpgrades: Form DOM element not found, cannot bind specific events.');
      return;
    }

    // Any product upgrades specific events can be bound here

    this.logger.log('Product Upgrades specific events bound.');
  }

  /**
   * Initialize Select2 components.
   * This is called after the `admin_table_manager_ready` event.
   * @private
   */
  _initializeSelect2() {
    const initSelect2 = ($element, placeholderText) => {
      if ($element && $element.length && this.$.fn.select2) {
        $element.select2({
          placeholder: placeholderText,
          width: '100%',
          dropdownCssClass: 'product-estimator-dropdown'
        }).val(null).trigger('change'); // Ensure it's cleared initially
      } else if ($element && !$element.length) {
        this.logger.warn('Select2 target element not found:', $element.selector);
      } else if (!$element) {
        this.logger.warn('Select2 target element is undefined (likely missing from DOM cache).');
      }
    };

    // Use a small timeout to ensure Select2 can properly initialize
    setTimeout(() => {
      initSelect2(this.dom.baseCategories, (this.settings.i18n && this.settings.i18n.selectBaseCategories) || 'Select base categories');
      initSelect2(this.dom.upgradeCategories, (this.settings.i18n && this.settings.i18n.selectUpgradeCategories) || 'Select upgrade categories');
      this.logger.log('Select2 components initialized for Product Upgrades.');
    }, 100);
  }


  /**
   * Overridden from VerticalTabbedModule. Called when the "Product Upgrades" main tab is activated.
   */
  onMainTabActivated() {
    super.onMainTabActivated(); // Call parent method
    this.logger.log('Product Upgrades main tab activated.');

    // Specific actions for Product Upgrades when its tab is shown
    // If Select2 was initialized while hidden, it might need a refresh
    if (this.dom.baseCategories && this.dom.baseCategories.hasClass("select2-hidden-accessible")) {
      // Refresh Select2 if needed
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

    this.logger.log('Product Upgrades form fields specifically reset.');
  }

  /**
   * Override AdminTableManager.populateFormWithData for Product Upgrades specific fields.
   */
  populateFormWithData(itemData) {
    super.populateFormWithData(itemData); // Sets item ID, calls base logic
    this.logger.log('Populating Product Upgrades form with full item data:', itemData);

    const baseCategories = itemData.base_categories || [];
    const upgradeCategories = itemData.upgrade_categories || [];

    // Look for field values in multiple possible locations
    const title = itemData.upgrade_title || itemData.title || '';
    const description = itemData.upgrade_description || itemData.description || '';

    this.logger.log('Populating title and description fields:', { title, description });

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
    this.logger.log('Validating Product Upgrades form.');

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

    this.logger.log('Product Upgrades form validation result:', isValid);
    return isValid;
  }

  /**
   * Custom column population method for 'base_categories' column
   * This method follows the naming convention for column handlers in AdminTableManager
   */
  populateColumn_base_categories($cell, itemData) {
    this.logger.log('Populating base_categories column with data:', {
      item_id: itemData.id,
      base_categories: itemData.base_categories,
      base_category_names: itemData.base_category_names,
      base_categories_display: itemData.base_categories_display
    });

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
    this.logger.log('Populating upgrade_categories column with data:', {
      item_id: itemData.id,
      upgrade_categories: itemData.upgrade_categories,
      upgrade_category_names: itemData.upgrade_category_names,
      upgrade_categories_display: itemData.upgrade_categories_display
    });

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
