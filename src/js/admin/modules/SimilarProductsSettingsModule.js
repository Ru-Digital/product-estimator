/**
 * Similar Products Settings Module (Class-based)
 *
 * Handles functionality for the similar products settings tab in the admin area.
 */
import { ajax, createLogger } from '@utils'; // Import utilities needed for this module

import AdminTableManager from '../common/AdminTableManager'; // Adjust path as needed

class SimilarProductsSettingsModule extends AdminTableManager {
  /**
   * Constructor for SimilarProductsSettingsModule
   */
  constructor() {
    const config = {
      mainTabId: 'similar_products',
      localizedDataName: 'similarProductsSettings'
      // AdminTableManager passes this to VerticalTabbedModule,
      // which passes relevant parts to ProductEstimatorSettings.
    };

    super(config); // Calls AdminTableManager constructor

    this.$(document).on(`admin_table_manager_ready_${this.config.mainTabId}`, () => { // POTENTIAL ERROR HERE
      this._cacheSimilarProductsDOM();
      this._bindSpecificEvents();
      this._initializeSelect2();
    });
  }

  /**
   * Cache DOM elements specific to Similar Products, beyond what AdminTableManager caches.
   * This is called after AdminTableManager's cacheDOM.
   * @private
   */
  _cacheSimilarProductsDOM() {
    // this.dom is initialized by AdminTableManager. Add Similar Products specific elements.
    if (this.settings && this.settings.selectors) { // this.settings is from ProductEstimatorSettings base
      const selectors = this.settings.selectors;
      this.dom.sourceCategoriesSelect = this.$container.find(selectors.sourceCategoriesSelect);
      this.dom.attributesContainer = this.$container.find(selectors.attributesContainer);
      this.dom.attributesList = this.$container.find(selectors.attributesList);
      this.dom.attributesLoading = this.$container.find(selectors.attributesLoading);
      this.dom.selectedAttributesInput = this.$container.find(selectors.selectedAttributesInput);
    } else {
      createLogger('SimilarProductsModule').warn('SimilarProductsSettingsModule: settings or selectors not available for DOM caching');
    }

  }

  /**
   * Bind core event handlers
   */
  _bindSpecificEvents() {
    if (!this.dom.form || !this.dom.form.length) {
      return;
    }

    this.dom.sourceCategoriesSelect?.on('change.SimilarProducts', this._handleSourceCategoriesChange.bind(this));
  }

  /**
   * Initialize Select2 components.
   * This is called after the `admin_table_manager_ready` event.
   * Using the base class Select2 initialization methods.
   * @private
   */
  _initializeSelect2() {
    // Use the base class initializeSelect2Dropdowns method with our specific configuration
    this.initializeSelect2Dropdowns({
      elements: [
        {
          element: this.dom.sourceCategoriesSelect,
          placeholderKey: 'selectCategoryError',
          fallbackText: 'Select source categories',
          name: 'source categories',
          config: {
            clearInitial: true
          }
        }
      ],
      // Settings and i18n are automatically provided by the base method
      moduleName: 'Similar Products'
    });
  }

  /**
   * Overridden from VerticalTabbedModule. Called when the "Product Additions" main tab is activated.
   */
  onMainTabActivated() {
    super.onMainTabActivated(); // Call parent method
    // Specific actions for Product Additions when its tab is shown.
    // For example, if Select2 or other components need re-initialization or refresh when tab becomes visible.
    // The `admin_table_manager_ready` event handles initial setup. This is for subsequent activations.
    // If Select2 was initialized while hidden, it might need a refresh.
    if (this.dom.sourceCategoriesSelect && this.dom.sourceCategoriesSelect.hasClass("select2-hidden-accessible")) {
      // this.dom.sourceCategorySelect.select2('destroy').select2({...}); // Full re-init
      // Or just trigger a resize/redraw if that helps.
    }
    // The inherited VerticalTabbedModule.handleMainTabChanged calls setupVerticalTabs,
    // which correctly handles the sub_tab in the URL. No manual sub_tab clearing needed here.
  }


  _handleSourceCategoriesChange() {
    const categoryIds = this.dom.sourceCategoriesSelect?.val();

    if (categoryIds && categoryIds.length > 0) {
      this._fetchAttributesForCategories(categoryIds);
    } else {
      this._updateAttributeSelectionField([], []);
    }
  }

  _updateAttributeSelectionField(attributes, selectedAttributes = []) {
    // Clear previous content
    this.dom.attributesList.empty();

    if (!attributes || attributes.length === 0) {
      // Show loading message if no attributes passed
      this.dom.attributesLoading.show();
      this.dom.attributesList.hide();
      return;
    }

    // Hide loading, show attributes list
    this.dom.attributesLoading.hide();
    this.dom.attributesList.show();

    // Convert selectedAttributes to array if needed
    if (typeof selectedAttributes === 'string') {
      selectedAttributes = selectedAttributes.split(',').filter(Boolean);
    }

    // Create checkbox for each attribute
    const attributesHtml = attributes.map(attr => {
      const isChecked = selectedAttributes.includes(attr.name) ? 'checked' : '';
      return `
        <div class="attribute-item">
          <label>
            <input type="checkbox"
                   name="attribute_checkbox[]"
                   value="${attr.name}"
                   data-label="${attr.label}"
                   ${isChecked}>
            ${attr.label}
          </label>
        </div>`;
    }).join('');

    // Add to the DOM and bind events
    this.dom.attributesList.html(attributesHtml);

    // Bind change event to update the hidden input
    this.dom.attributesList.find('input[type="checkbox"]').on('change', this._handleAttributeCheckboxChange.bind(this));

    // Update hidden input with currently selected attributes
    this._updateSelectedAttributesInput();
  }

  _fetchAttributesForCategories(categoryIds, selectedAttributes = null) {

    if (!this.settings.actions || !this.settings.actions.get_attributes) {
      return;
    }

    // Show loading indicator
    this.dom.attributesLoading.text(this.settings.i18n.loadingAttributes || 'Loading attributes...');
    this.dom.attributesLoading.show();
    this.dom.attributesList.hide();

    // Get currently selected attributes - either from parameter or from the input field
    const currentlySelectedAttributes = selectedAttributes ||
                                       this.dom.selectedAttributesInput.val().split(',').filter(Boolean);


    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: {
        action: this.settings.actions.get_attributes,
        nonce: this.settings.nonce,
        category_ids: categoryIds,
      }
    })
    .then(response => {
      let attributesArray = null;

      // Standardize response checking
      if (response && response.success && response.data && Array.isArray(response.data.attributes)) {
        attributesArray = response.data.attributes;
      } else if (response && Array.isArray(response.attributes)) { // Fallback for older direct array
        attributesArray = response.attributes;
      }

      if (attributesArray) {
        if (attributesArray.length > 0) {
          this._updateAttributeSelectionField(attributesArray, currentlySelectedAttributes);
        } else {
          this.dom.attributesLoading.text(this.settings.i18n.noAttributes || 'No product attributes found for these categories.');
          this.dom.attributesList.hide();
        }
      } else {
        this.dom.attributesLoading.text(this.settings.i18n.errorLoading || 'Error loading attributes. Please try again.');
        this.dom.attributesList.hide();
      }
    })
    .catch(() => {
      this.dom.attributesLoading.text(this.settings.i18n.errorLoading || 'Error loading attributes. Please try again.');
      this.dom.attributesList.hide();
    });
  }


  /**
   * Handle attribute checkbox change events
   * @private
   */
  _handleAttributeCheckboxChange() {
    this._updateSelectedAttributesInput();
  }

  /**
   * Update the hidden input with selected attribute values
   * @private
   */
  _updateSelectedAttributesInput() {
    const selectedAttributes = [];

    this.dom.attributesList.find('input[type="checkbox"]:checked').each((i, checkbox) => {
      selectedAttributes.push(this.$(checkbox).val());
    });

    this.dom.selectedAttributesInput.val(selectedAttributes.join(','));
  }

  /**
   * Override AdminTableManager.resetForm to include Similar Products specific fields.
   */
  resetForm() {
    super.resetForm(); // Call base class method first

    // Reset Similar Products specific fields
    this.dom.sourceCategoriesSelect?.val(null).trigger('change.select2'); // Clear Select2
    this.dom.attributesList.empty();
    this.dom.attributesLoading.text(this.settings.i18n.selectCategory || 'Select categories to load available attributes...');
    this.dom.attributesLoading.show();
    this.dom.selectedAttributesInput.val('');

  }

  /**
   * Override AdminTableManager.populateFormWithData for Similar Products specific fields.
   * @param {object} itemData - The data for the similar product item to populate the form with
   * @override
   */
  populateFormWithData(itemData) {
    super.populateFormWithData(itemData); // Sets item ID, calls base logic

    const sourceCategories = itemData.source_categories || []; // Expecting array for multi-select
    const attributes = Array.isArray(itemData.attributes) ? itemData.attributes :
                      (itemData.attributes ? itemData.attributes.split(',') : []);

    // Set the hidden input value for selected attributes first
    this.dom.selectedAttributesInput.val(attributes.join(','));

    // Use setTimeout to allow dependent field visibility changes to complete
    setTimeout(() => {
      // Set source categories and trigger change to load attributes
      this.dom.sourceCategoriesSelect?.val(sourceCategories).trigger('change.select2');

      // If we have both categories and attributes selected, manually fetch the attributes
      // This ensures attributes are loaded and selected when editing an existing item
      if (sourceCategories.length > 0 && attributes.length > 0) {
        this._fetchAttributesForCategories(sourceCategories, attributes);
      }

      this.formModified = false; // Reset modified flag after populating
    }, 150); // Small delay
  }

  /**
   * Override AdminTableManager.validateForm for Similar Products specific validation.
   * @returns {boolean} True if the form passes validation, false otherwise
   * @override
   */
  validateForm() {
    let isValid = super.validateForm(); // Perform base validation first

    // Get values
    const sourceCategories = this.dom.sourceCategoriesSelect?.val(); // Returns array for multi-select
    const selectedAttributes = this.dom.selectedAttributesInput.val();

    // i18n messages from this.settings.i18n
    const i18n = this.settings.i18n || {};

    // Clear previous specific errors (showFieldError/clearFieldError are inherited)
    this.clearFieldError(this.dom.sourceCategoriesSelect?.next('.select2-container')); // Target Select2 container for error
    this.clearFieldError(this.dom.attributesList); // Clear error on attributes list

    if (!sourceCategories || sourceCategories.length === 0) {
      this.showFieldError(this.dom.sourceCategoriesSelect?.next('.select2-container'), i18n.selectCategoryError || 'Please select at least one source category.');
      isValid = false;
    }

    if (!selectedAttributes) {
      this.showFieldError(this.dom.attributesList, i18n.selectAttributesError || 'Please select at least one attribute.');
      isValid = false;
    }

    return isValid;
  }

  /**
   * Custom column population method for 'source_categories' column
   * This method follows the naming convention for column handlers in AdminTableManager
   * @param {jQuery} $cell - The table cell element to populate
   * @param {object} itemData - The data for the current row
   */
  populateColumn_source_categories($cell, itemData) {
    $cell.text(itemData.source_categories_display || 'N/A');
  }

  /**
   * Custom column population method for 'attributes' column
   * @param {jQuery} $cell - The table cell element to populate
   * @param {object} itemData - The data for the current row
   */
  populateColumn_attributes($cell, itemData) {
    $cell.text(itemData.attributes_display || 'None selected');
  }
}

// Initialize the module when the DOM is ready and its main tab container exists.
  jQuery(document).ready(function ($) {
    const mainTabId = 'similar_products'; // Specific to this module
    const localizedDataObjectName = 'similarProductsSettings'; // Global settings object name

    if ($(`#${mainTabId}`).length) {

      // Check if the global localized data for this module is available
      if (window[localizedDataObjectName]) {
        // Instantiate the module once
        if (!window.SimilarProductsSettingsModuleInstance) {
          try {
            window.SimilarProductsSettingsModuleInstance = new SimilarProductsSettingsModule();
            createLogger('SimilarProductsInit').log('SimilarProductsSettingsModuleInstance instance initiated.');
          } catch (error) {
            createLogger('SimilarProductsInit').error('Error instantiating SimilarProductsSettingsModuleInstance:', error);
            // Use the global notice system if ProductEstimatorSettings is available
            if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
              window.ProductEstimatorSettingsInstance.showNotice('Failed to initialize Similar Products settings. Check console for errors.', 'error');
            }
          }
        }
      } else {
        createLogger('SimilarProductsInit').error(`Localized data object "${localizedDataObjectName}" not found for tab: ${mainTabId}. Module cannot be initialized.`);
        if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
          window.ProductEstimatorSettingsInstance.showNotice(`Configuration data for Similar Products ("${localizedDataObjectName}") is missing. Module disabled.`, 'error');
        }
      }
      // The module's inherited `handleMainTabChanged` (from VerticalTabbedModule)
      // will manage activation/deactivation logic, including calling `onMainTabActivated`.
      // No separate `product_estimator_tab_changed` listener is needed here for re-initialization
      // or for clearing `sub_tab` from URL, as `VerticalTabbedModule.showVerticalTab` handles URL state.
    } else {
      createLogger('SimilarProductsInit').warn(`Main container #${mainTabId} not found. SimilarProductsSettingsModule will not be initialized.`);
    }
  });

  export default SimilarProductsSettingsModule;
