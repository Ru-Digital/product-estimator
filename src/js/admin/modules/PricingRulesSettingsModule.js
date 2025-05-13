/**
 * Pricing Rules Settings JavaScript
 *
 * Handles functionality specific to the pricing rules settings tab.
 * Extends AdminTableManager for common table and form management.
 */
import AdminTableManager from '../common/AdminTableManager';
import { ajax, validation } from '@utils';
import { createLogger } from '@utils';

class PricingRulesSettingsModule extends AdminTableManager {
  /**
   * Constructor for PricingRulesSettingsModule.
   */
  constructor() {
    const config = {
      mainTabId: 'pricing_rules',
      localizedDataName: 'pricingRulesSettings'
      // AdminTableManager passes this to VerticalTabbedModule,
      // which passes relevant parts to ProductEstimatorSettings.
    };
    super(config); // Calls AdminTableManager constructor

    // this.logger is initialized by AdminTableManager
    // this.settings is populated by ProductEstimatorSettings via the super chain

    // Defer DOM-dependent specific initializations until the base AdminTableManager signals it's ready
    this.$(document).on(`admin_table_manager_ready_${this.config.mainTabId}`, () => {
      this.logger.log('Base AdminTableManager is ready. Initializing PricingRules specifics.');
      this._cachePricingRulesDOM();
      this._bindSpecificEvents();
      this._initializeSelect2();
      this.logger.log('PricingRulesSettingsModule specific features initialized.');
    });

    this.logger.log('PricingRulesSettingsModule constructor completed.');
  }

  /**
   * Cache DOM elements specific to Pricing Rules, beyond what AdminTableManager caches.
   * @private
   */
  _cachePricingRulesDOM() {
    // this.dom is initialized by AdminTableManager. Add Pricing Rules specific elements.
    if (this.settings && this.settings.selectors) {
      const prSelectors = this.settings.selectors;
      this.dom.categoriesSelect = this.$container.find(prSelectors.categoriesSelect);
      this.dom.pricingMethodSelect = this.$container.find(prSelectors.pricingMethodSelect);
      this.dom.pricingSourceSelect = this.$container.find(prSelectors.pricingSourceSelect);
      this.logger.log('Pricing Rules specific DOM elements cached.');
    } else {
      this.logger.warn('Cannot cache Pricing Rules specific DOM elements: this.settings.selectors not available.');
    }
  }

  /**
   * Bind events specific to Pricing Rules.
   * This is called after the `admin_table_manager_ready` event.
   * @private
   */
  _bindSpecificEvents() {
    // Ensure this.dom elements are available (cached by _cachePricingRulesDOM or base)
    if (!this.dom.form || !this.dom.form.length) {
      this.logger.error('PricingRules: Form DOM element not found, cannot bind specific events.');
      return;
    }
    
    this.logger.log('Pricing Rules specific events bound.');
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
          element: this.dom.categoriesSelect,
          placeholderKey: 'selectCategories',
          fallbackText: 'Select categories',
          name: 'categories',
          config: {
            clearInitial: true
          }
        }
      ],
      moduleName: 'Pricing Rules'
    });
  }

  /**
   * Overridden from VerticalTabbedModule. Called when the "Pricing Rules" main tab is activated.
   */
  onMainTabActivated() {
    super.onMainTabActivated(); // Call parent method
    this.logger.log('Pricing Rules main tab activated.');

    // Refresh Select2 components if they're already initialized
    if (this.dom.categoriesSelect && this.dom.categoriesSelect.hasClass("select2-hidden-accessible")) {
      this.refreshSelect2(this.dom.categoriesSelect);
    }
  }

  /**
   * Override AdminTableManager.resetForm to include Pricing Rules specific fields.
   */
  resetForm() {
    super.resetForm(); // Call base class method first

    // Reset Pricing Rules specific fields
    this.dom.categoriesSelect?.val(null).trigger('change.select2'); // Clear Select2
    this.dom.pricingMethodSelect?.val('');
    this.dom.pricingSourceSelect?.val('');

    this.logger.log('Pricing Rules form fields specifically reset.');
  }

  /**
   * Override AdminTableManager.populateFormWithData for Pricing Rules specific fields.
   */
  populateFormWithData(itemData) {
    super.populateFormWithData(itemData); // Sets item ID, calls base logic
    this.logger.log('Populating Pricing Rules form with full item data:', itemData);

    const categories = itemData.categories || [];
    const pricingMethod = itemData.pricing_method || '';
    const pricingSource = itemData.pricing_source || '';

    // Use setTimeout to allow dependent field visibility changes to complete
    setTimeout(() => {
      this.dom.categoriesSelect?.val(categories).trigger('change.select2');
      this.dom.pricingMethodSelect?.val(pricingMethod);
      this.dom.pricingSourceSelect?.val(pricingSource);
      
      this.formModified = false; // Reset modified flag after populating
    }, 150); // Small delay
  }

  /**
   * Override AdminTableManager.validateForm for Pricing Rules specific validation.
   */
  validateForm() {
    let isValid = super.validateForm(); // Perform base validation first
    this.logger.log('Validating Pricing Rules form.');

    // Get values
    const categories = this.dom.categoriesSelect?.val(); // Returns array for multi-select
    const pricingMethod = this.dom.pricingMethodSelect?.val();
    const pricingSource = this.dom.pricingSourceSelect?.val();

    // i18n messages from this.settings.i18n
    const i18n = this.settings.i18n || {};

    // Clear previous specific errors
    this.clearFieldError(this.dom.categoriesSelect?.next('.select2-container'));
    this.clearFieldError(this.dom.pricingMethodSelect);
    this.clearFieldError(this.dom.pricingSourceSelect);

    if (!categories || categories.length === 0) {
      this.showFieldError(this.dom.categoriesSelect?.next('.select2-container'), i18n.selectCategories || 'Please select categories.');
      isValid = false;
    }

    if (!pricingMethod) {
      this.showFieldError(this.dom.pricingMethodSelect, i18n.selectPricingMethod || 'Please select a pricing method.');
      isValid = false;
    }

    if (!pricingSource) {
      this.showFieldError(this.dom.pricingSourceSelect, i18n.selectPricingSource || 'Please select a pricing source.');
      isValid = false;
    }

    this.logger.log('Pricing Rules form validation result:', isValid);
    return isValid;
  }

  /**
   * Custom column population method for 'categories' column
   */
  populateColumn_categories($cell, itemData) {
    $cell.text(itemData.category_names || 'N/A');
  }

  /**
   * Custom column population method for 'pricing_method' column
   */
  populateColumn_pricing_method($cell, itemData) {
    $cell.text(itemData.pricing_label || 'N/A');
  }
}

// Initialize the module when the DOM is ready and its main tab container exists.
jQuery(document).ready(function ($) {
  const mainTabId = 'pricing_rules'; // Specific to this module
  const localizedDataObjectName = 'pricingRulesSettings'; // Global settings object name

  if ($(`#${mainTabId}`).length) {
    // Check if the global localized data for this module is available
    if (window[localizedDataObjectName]) {
      // Instantiate the module once
      if (!window.PricingRulesSettingsModuleInstance) {
        try {
          window.PricingRulesSettingsModuleInstance = new PricingRulesSettingsModule();
          createLogger('PricingRulesInit').log('PricingRulesSettingsModule instance initiated.');
        } catch (error) {
          createLogger('PricingRulesInit').error('Error instantiating PricingRulesSettingsModule:', error);
          // Use the global notice system if ProductEstimatorSettings is available
          if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
            window.ProductEstimatorSettingsInstance.showNotice('Failed to initialize Pricing Rules settings. Check console for errors.', 'error');
          }
        }
      }
    } else {
      createLogger('PricingRulesInit').error(`Localized data object "${localizedDataObjectName}" not found for tab: ${mainTabId}. Module cannot be initialized.`);
      if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
        window.ProductEstimatorSettingsInstance.showNotice(`Configuration data for Pricing Rules ("${localizedDataObjectName}") is missing. Module disabled.`, 'error');
      }
    }
  } else {
    createLogger('PricingRulesInit').warn(`Main container #${mainTabId} not found. PricingRulesSettingsModule will not be initialized.`);
  }
});

export default PricingRulesSettingsModule;