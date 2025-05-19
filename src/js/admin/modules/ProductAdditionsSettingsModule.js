// File: admin/js/modules/ProductAdditionsSettingsModule.js

/**
 * Product Additions Settings JavaScript
 *
 * Handles functionality specific to the product additions settings tab.
 * Extends AdminTableManager for common table and form management.
 */
import { ajax, createLogger } from '@utils'; // Import utilities needed for this module

import AdminTableManager from '../common/AdminTableManager'; // Adjust path as needed

class ProductAdditionsSettingsModule extends AdminTableManager {
  /**
   * Constructor for ProductAdditionsSettingsModule.
   */
  constructor() {
    const config = {
      mainTabId: 'product_additions',
      localizedDataName: 'productAdditionsSettings'
      // AdminTableManager passes this to VerticalTabbedModule,
      // which passes relevant parts to ProductEstimatorSettings.
    };
    super(config); // Calls AdminTableManager constructor

    // We can access feature flags via this.settings.feature_flags
    // This is used in _handleRelationTypeChange to show/hide fields

    // this.logger is initialized by AdminTableManager.
    // this.settings (formerly this.localizedData in VTM/ATM context before PES refactor)
    // is populated by ProductEstimatorSettings via the super chain.
    // this.config from AdminTableManager holds the original config passed here.

    this.productSearchTimeout = null;

    // Defer DOM-dependent specific initializations until the base AdminTableManager signals it's ready.
    // The event name uses this.config.mainTabId.
    // Note: this.config.mainTabId is from the config passed to super(), available after super() call.
    this.$(document).on(`admin_table_manager_ready_${this.config.mainTabId}`, () => {
      this._cacheProductAdditionsDOM();
      this._bindSpecificEvents();
      this._initializeSelect2();
    });

  }

  /**
   * Cache DOM elements specific to Product Additions, beyond what AdminTableManager caches.
   * This is called after AdminTableManager's cacheDOM.
   * @private
   */
  _cacheProductAdditionsDOM() {
    // this.dom is initialized by AdminTableManager. Add Product Additions specific elements.
    // Ensure selectors are defined in your localizedData (productAdditionsSettings)
    // e.g., productAdditionsSettings.selectors.relationTypeSelect
    if (this.settings && this.settings.selectors) { // this.settings is from ProductEstimatorSettings base
      const paSelectors = this.settings.selectors; // Assuming selectors are flat in this.settings
      this.dom.relationTypeSelect = this.$container.find(paSelectors.relationTypeSelect);
      this.dom.sourceCategorySelect = this.$container.find(paSelectors.sourceCategorySelect);
      this.dom.targetCategorySelect = this.$container.find(paSelectors.targetCategorySelect);
      this.dom.targetCategoryRow = this.$container.find(paSelectors.targetCategoryRow);
      this.dom.productSearchInput = this.$container.find(paSelectors.productSearchInput);
      this.dom.productSearchRow = this.$container.find(paSelectors.productSearchRow);
      this.dom.productSearchResults = this.$container.find(paSelectors.productSearchResults);
      this.dom.selectedProductIdInput = this.$container.find(paSelectors.selectedProductIdInput);
      this.dom.selectedProductDisplay = this.$container.find(paSelectors.selectedProductDisplay);
      this.dom.clearProductButton = this.$container.find(paSelectors.clearProductButton);
      this.dom.noteTextInput = this.$container.find(paSelectors.noteTextInput);
      this.dom.noteRow = this.$container.find(paSelectors.noteRow);
      
      // New fields for auto-add product sections
      this.dom.sectionTitleRow = this.$container.find('.section-title-row');
      this.dom.sectionDescriptionRow = this.$container.find('.section-description-row');
      this.dom.optionColorRows = this.$container.find('.option-color-row');
      this.dom.colorPickers = this.$container.find('.pe-color-picker');
    } else {
      this.logger.warn('ProductAdditionsSettingsModule: Settings or selectors not available for DOM caching');
    }
  }


  /**
   * Bind events specific to Product Additions.
   * This is called after the `admin_table_manager_ready` event.
   * @private
   */
  _bindSpecificEvents() {
    // Ensure this.dom elements are available (cached by _cacheProductAdditionsDOM or base)
    if (!this.dom.form || !this.dom.form.length) {
      return;
    }
    this.dom.form.on('click.productAdditions', '.product-result-item', this._handleProductResultClick.bind(this));

    this.dom.relationTypeSelect?.on('change.productAdditions', this._handleRelationTypeChange.bind(this));
    this.dom.targetCategorySelect?.on('change.productAdditions', this._handleTargetCategoryChange.bind(this));
    this.dom.productSearchInput?.on('keyup.productAdditions', this._handleProductSearchKeyup.bind(this));
    this.dom.clearProductButton?.on('click.productAdditions', this._handleClearProduct.bind(this));
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
          element: this.dom.sourceCategorySelect,
          placeholderKey: 'selectSourceCategories',
          fallbackText: 'Select source categories',
          name: 'source categories',
          config: {
            clearInitial: true
          }
        },
        {
          element: this.dom.targetCategorySelect,
          placeholderKey: 'selectTargetCategory',
          fallbackText: 'Select a category',
          name: 'target category',
          config: {
            clearInitial: true
          }
        }
      ],
      moduleName: 'Product Additions'
    });
    
    // Initialize color pickers
    this._initializeColorPickers();
  }
  
  /**
   * Initialize WordPress color pickers.
   * @private
   */
  _initializeColorPickers() {
    if (this.dom.colorPickers && this.dom.colorPickers.length && this.$.fn.wpColorPicker) {
      this.dom.colorPickers.wpColorPicker({
        change: () => {
          this.formModified = true; // Mark form as modified when color changes
        }
      });
    }
  }

  /**
   * Overridden from VerticalTabbedModule. Called when the "Product Additions" main tab is activated.
   */
  onMainTabActivated() {
    super.onMainTabActivated(); // Call parent method

    // Refresh Select2 components if they're already initialized
    if (this.dom.sourceCategorySelect && this.dom.sourceCategorySelect.hasClass("select2-hidden-accessible")) {
      this.refreshSelect2(this.dom.sourceCategorySelect);
    }
    if (this.dom.targetCategorySelect && this.dom.targetCategorySelect.hasClass("select2-hidden-accessible")) {
      this.refreshSelect2(this.dom.targetCategorySelect);
    }

    // The inherited VerticalTabbedModule.handleMainTabChanged calls setupVerticalTabs,
    // which correctly handles the sub_tab in the URL. No manual sub_tab clearing needed here.
  }


  /**
   * Handles changes in the relation type select dropdown.
   * Shows/hides appropriate fields based on the selected relation type.
   * @private
   */
  _handleRelationTypeChange() {
    const actionType = this.dom.relationTypeSelect?.val();

    // Check feature flags to determine UI behavior

    this.dom.targetCategoryRow?.hide();
    this.dom.productSearchRow?.hide();
    this.dom.noteRow?.hide();
    this.dom.sectionTitleRow?.hide();
    this.dom.sectionDescriptionRow?.hide();
    this.dom.optionColorRows?.hide();

    this.dom.targetCategorySelect?.val(null).trigger('change.select2'); // Reset Select2
    this._clearProductSelectionFields();
    this.dom.noteTextInput?.val('');

    if (actionType === 'auto_add_by_category') {
      this.dom.targetCategoryRow?.show();
      this.dom.sectionTitleRow?.show();
      this.dom.sectionDescriptionRow?.show();
      this.dom.optionColorRows?.show();
    } else if (actionType === 'auto_add_note_by_category') {
      this.dom.noteRow?.show();
    } else if (actionType === 'suggest_products_by_category') {
      // Only show target category row if feature is enabled
      if (this.settings.feature_flags && this.settings.feature_flags.suggested_products_enabled) {
        this.dom.targetCategoryRow?.show();
      } else {
        this.logger.warn('ProductAdditionsSettingsModule: Suggested products feature is disabled in feature flags');
      }
    }
  }

  /**
   * Handles changes in the target category select dropdown.
   * Shows/hides product search field based on the selected category and relation type.
   * @private
   */
  _handleTargetCategoryChange() {
    const categoryId = this.dom.targetCategorySelect?.val();
    const actionType = this.dom.relationTypeSelect?.val();
    this._clearProductSelectionFields(); // Clear previous product search/selection
    if (categoryId && actionType === 'auto_add_by_category') {
      this.dom.productSearchRow?.show();
    } else {
      this.dom.productSearchRow?.hide();
    }
  }

  /**
   * Clears all product selection related fields.
   * @private
   */
  _clearProductSelectionFields() {
    this.dom.productSearchInput?.val('');
    this.dom.productSearchResults?.empty().hide();
    this.dom.selectedProductIdInput?.val('');
    this.dom.selectedProductDisplay?.hide().find('.selected-product-info').empty();
  }

  /**
   * Handles keyup events in the product search input field.
   * Triggers product search after debounce period.
   * @param {Event} e - The keyup event
   * @private
   */
  _handleProductSearchKeyup(e) {
    const searchTerm = this.$(e.target).val()?.trim() || '';
    const categoryId = this.dom.targetCategorySelect?.val();
    clearTimeout(this.productSearchTimeout);

    if (searchTerm.length < 3 || !categoryId) {
      this.dom.productSearchResults?.empty().hide();
      return;
    }
    // this.settings.i18n from ProductEstimatorSettings base
    this.dom.productSearchResults?.html(`<p>${(this.settings.i18n && this.settings.i18n.searching) || 'Searching...'}</p>`).show();
    this.productSearchTimeout = setTimeout(() => {
      this._searchProducts(searchTerm, categoryId);
    }, 500); // Debounce
  }

  /**
   * Searches for products based on search term and category.
   * Displays results in the product search results container.
   * @param {string} searchTerm - The search term to filter products by
   * @param {string|number} categoryId - The category ID to filter products by
   * @private
   */
  _searchProducts(searchTerm, categoryId) {
    // this.settings.actions and other properties from ProductEstimatorSettings base
    if (!this.settings.actions || !this.settings.actions.search_products) {
      this.dom.productSearchResults?.html(`<p>${(this.settings.i18n && this.settings.i18n.errorSearching) || 'Error: Search action not configured.'}</p>`).show();
      return;
    }

    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: {
        action: this.settings.actions.search_products,
        nonce: this.settings.nonce,
        search: searchTerm,
        category: categoryId,
      }
    })
      .then(response => {
        let productsArray = null;
        // Standardize response checking
        if (response && response.success && response.data && Array.isArray(response.data.products)) {
          productsArray = response.data.products;
        } else if (response && Array.isArray(response.products)) { // Fallback for older direct array
          productsArray = response.products;
        }


        if (productsArray) {
          let resultsHtml = '';
          if (productsArray.length > 0) {
            resultsHtml = '<ul class="product-results-list">';
            productsArray.forEach(product => {
              // Basic escaping for display
              const escapedName = this.$('<div>').text(product.name || '').html();
              resultsHtml += `<li class="product-result-item" data-id="${product.id}" data-name="${escapedName}">${escapedName || 'Unnamed Product'} (ID: ${product.id})</li>`;
            });
            resultsHtml += '</ul>';
          } else {
            resultsHtml = `<p>${(this.settings.i18n && this.settings.i18n.noProductsFound) || 'No products found'}</p>`;
          }
          this.dom.productSearchResults?.html(resultsHtml).show();
        } else {
          this.dom.productSearchResults?.html(`<p>${(this.settings.i18n && this.settings.i18n.errorSearching) || 'Error searching products'}</p>`).show();
        }
      })
      .catch(() => {
        this.dom.productSearchResults?.html(`<p>${(this.settings.i18n && this.settings.i18n.errorSearching) || 'Error searching products'}</p>`).show();
      });
  }

  /**
   * Handles clicks on product search results.
   * Sets the selected product ID and displays product information.
   * @param {Event} e - The click event
   * @private
   */
  _handleProductResultClick(e) {
    const $item = this.$(e.currentTarget);
    const productId = $item.data('id');
    const productName = $item.data('name'); // Already escaped if set by _searchProducts

    this.dom.selectedProductIdInput?.val(productId);
    this.dom.selectedProductDisplay?.find('.selected-product-info').html(`<strong>${productName}</strong> (ID: ${productId})`);
    this.dom.selectedProductDisplay?.show();
    this.dom.productSearchInput?.val(''); // Clear search input
    this.dom.productSearchResults?.empty().hide(); // Hide results
    this.formModified = true; // Mark form as modified, inherited from AdminTableManager
  }

  /**
   * Handles clicks on the clear product button.
   * Clears product selection fields and sets focus to search input.
   * @private
   */
  _handleClearProduct() {
    this._clearProductSelectionFields();
    this.dom.productSearchInput?.focus();
    this.formModified = true; // Mark form as modified
  }

  /**
   * Override AdminTableManager.resetForm to include Product Additions specific fields.
   * @override
   */
  resetForm() {
    super.resetForm(); // Call base class method first

    // Reset Product Additions specific fields
    this.dom.relationTypeSelect?.val('').trigger('change.productAdditions'); // Triggers _handleRelationTypeChange
    this.dom.sourceCategorySelect?.val(null).trigger('change.select2'); // Clear Select2
    // Target category and product search fields are typically handled by _handleRelationTypeChange
    this._clearProductSelectionFields(); // Explicitly clear product fields
    this.dom.noteTextInput?.val('');
    
    // Clear new fields
    this.$container.find('#section_title').val('');
    this.$container.find('#section_description').val('');
    
    // Reset color pickers to default
    for (let i = 1; i <= 5; i++) {
      const colourKey = `option_colour_${i}`;
      this.$container.find(`#${colourKey}`).val('#000000');
      // Reset color picker if it exists
      if (this.$.fn.wpColorPicker) {
        this.$container.find(`#${colourKey}`).wpColorPicker('color', '#000000');
      }
    }

    // Ensure dependent rows are hidden according to the reset relationType
    this.dom.targetCategoryRow?.hide();
    this.dom.productSearchRow?.hide();
    this.dom.noteRow?.hide();
    this.dom.sectionTitleRow?.hide();
    this.dom.sectionDescriptionRow?.hide();
    this.dom.optionColorRows?.hide();

  }

  /**
   * Override AdminTableManager.populateFormWithData for Product Additions specific fields.
   * @param {object} itemData - The data for the product addition item to populate the form with
   * @override
   */
  populateFormWithData(itemData) {
    super.populateFormWithData(itemData); // Sets item ID, calls base logic

    const relationType = itemData.relation_type || '';
    const sourceCategories = itemData.source_category || []; // Expecting array for multi-select
    const targetCategory = itemData.target_category || '';
    const productId = itemData.product_id || '';
    const noteText = itemData.note_text || '';

    // Set relation type first, as it might control visibility of other fields
    this.dom.relationTypeSelect?.val(relationType).trigger('change.productAdditions');

    // Use setTimeout to allow dependent field visibility changes from 'change.productAdditions' to complete
    setTimeout(() => {
      this.dom.sourceCategorySelect?.val(sourceCategories).trigger('change.select2');

      if (relationType === 'auto_add_by_category') {
        this.dom.targetCategorySelect?.val(targetCategory).trigger('change.select2');
        if (productId && itemData.product_name) {
          this.dom.selectedProductIdInput?.val(productId);
          // Ensure productName is properly escaped if it comes directly from itemData and hasn't been
          const escapedProductName = this.$('<div>').text(itemData.product_name).html();
          this.dom.selectedProductDisplay?.find('.selected-product-info').html(`<strong>${escapedProductName}</strong> (ID: ${productId})`);
          this.dom.selectedProductDisplay?.show();
        } else if (productId) {
          // Fallback if product_name is missing
          this.dom.selectedProductIdInput?.val(productId);
          this.dom.selectedProductDisplay?.find('.selected-product-info').html(`Product ID: ${productId} (Name not available)`);
          this.dom.selectedProductDisplay?.show();
        }
        
        // Populate new fields for auto-add product sections
        if (itemData.section_title) {
          this.$container.find('#section_title').val(itemData.section_title);
        }
        if (itemData.section_description) {
          this.$container.find('#section_description').val(itemData.section_description);
        }
        
        // Populate color fields
        for (let i = 1; i <= 5; i++) {
          const colourKey = `option_colour_${i}`;
          if (itemData[colourKey]) {
            this.$container.find(`#${colourKey}`).val(itemData[colourKey]);
            // Update color picker preview if it exists
            this.$container.find(`#${colourKey}`).wpColorPicker('color', itemData[colourKey]);
          }
        }
      } else if (relationType === 'suggest_products_by_category') {
        if (this.settings.feature_flags && this.settings.feature_flags.suggested_products_enabled) {
          this.dom.targetCategorySelect?.val(targetCategory).trigger('change.select2');
        }
      } else if (relationType === 'auto_add_note_by_category') {
        this.dom.noteTextInput?.val(noteText);
      }
      this.formModified = false; // Reset modified flag after populating
    }, 150); // Small delay
  }

  /**
   * Override AdminTableManager.validateForm for Product Additions specific validation.
   * @returns {boolean} True if the form passes validation, false otherwise
   * @override
   */
  validateForm() {
    let isValid = super.validateForm(); // Perform base validation first

    // Get values
    const actionType = this.dom.relationTypeSelect?.val();
    const sourceCategories = this.dom.sourceCategorySelect?.val(); // Returns array for multi-select
    const targetCategory = this.dom.targetCategorySelect?.val();
    const productId = this.dom.selectedProductIdInput?.val();
    const noteText = this.dom.noteTextInput?.val()?.trim() || '';

    // i18n messages from this.settings.i18n
    const i18n = this.settings.i18n || {};

    // Clear previous specific errors (showFieldError/clearFieldError are inherited)
    this.clearFieldError(this.dom.relationTypeSelect);
    this.clearFieldError(this.dom.sourceCategorySelect?.next('.select2-container')); // Target Select2 container for error
    this.clearFieldError(this.dom.targetCategorySelect?.next('.select2-container'));
    this.clearFieldError(this.dom.productSearchInput); // Or selectedProductDisplay
    this.clearFieldError(this.dom.noteTextInput);

    if (!actionType) {
      this.showFieldError(this.dom.relationTypeSelect, i18n.selectAction || 'Please select an action type.');
      isValid = false;
    }
    if (!sourceCategories || sourceCategories.length === 0) {
      this.showFieldError(this.dom.sourceCategorySelect?.next('.select2-container'), i18n.selectSourceCategories || 'Please select source categories.');
      isValid = false;
    }

    if (actionType === 'auto_add_by_category') {
      if (!targetCategory) {
        this.showFieldError(this.dom.targetCategorySelect?.next('.select2-container'), i18n.selectTargetCategory || 'Please select a target category.');
        isValid = false;
      }
      if (!productId) {
        // Show error near search input or the display area if visible
        const $productErrorTarget = this.dom.selectedProductDisplay?.is(':visible') ? this.dom.selectedProductDisplay : this.dom.productSearchInput;
        this.showFieldError($productErrorTarget, i18n.selectProduct || 'Please select a product.');
        isValid = false;
      }
    } else if (actionType === 'suggest_products_by_category') {
      if (this.settings.feature_flags && this.settings.feature_flags.suggested_products_enabled) {
        if (!targetCategory) {
          this.showFieldError(this.dom.targetCategorySelect?.next('.select2-container'), i18n.selectTargetCategory || 'Please select a target category.');
          isValid = false;
        }
      }
    } else if (actionType === 'auto_add_note_by_category') {
      if (!noteText) {
        this.showFieldError(this.dom.noteTextInput, i18n.noteTextRequired || 'Note text is required.');
        isValid = false;
      }
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
    $cell.text(itemData.source_category_display || 'N/A');
  }

  /**
   * Custom column population method for 'action_type' column
   * @param {jQuery} $cell - The table cell element to populate
   * @param {object} itemData - The data for the current row
   */
  populateColumn_action_type($cell, itemData) {
    const $actionTypeSpan = this.$('<span></span>')
      .addClass(`relation-type pe-relation-${itemData.relation_type || 'unknown'}`)
      .text(itemData.action_type_display || itemData.relation_type || 'N/A');
    $cell.append($actionTypeSpan);
  }

  /**
   * Custom column population method for 'target_details' column
   * @param {jQuery} $cell - The table cell element to populate
   * @param {object} itemData - The data for the current row
   */
  populateColumn_target_details($cell, itemData) {
    $cell.text(itemData.target_details_display || 'N/A');
  }

  /**
   * Binds event handlers for custom action buttons.
   * This overrides the base AdminTableManager.bindCustomActionButtons method.
   * @override
   */
  bindCustomActionButtons() {
    if (this.dom.listTableBody && this.dom.listTableBody.length) {
      // Bind the view product button click event
      this.dom.listTableBody.on('click.productAdditions', '.pe-view-product-button', this.handleViewProduct.bind(this));
    }
  }

  /**
   * Handles clicks on the "View Product" button.
   * @param {Event} e - The click event
   */
  handleViewProduct(e) {
    e.preventDefault();
    const $button = this.$(e.currentTarget);
    const productId = $button.data('product-id');


    if (!productId) {
      this.showNotice('Error: Could not determine the product to view.', 'error');
      return;
    }

    // Open the product in a new window/tab
    // This could be a link to the WordPress admin edit page for the product
    const adminUrl = window.ajaxurl ? window.ajaxurl.replace('admin-ajax.php', '') : '/wp-admin/';
    const productUrl = `${adminUrl}post.php?post=${productId}&action=edit`;
    window.open(productUrl, '_blank');
  }
}

// Initialize the module when the DOM is ready and its main tab container exists.
jQuery(document).ready(function ($) {
  const mainTabId = 'product_additions'; // Specific to this module
  const localizedDataObjectName = 'productAdditionsSettings'; // Global settings object name

  if ($(`#${mainTabId}`).length) {
    // Check if the global localized data for this module is available
    if (window[localizedDataObjectName]) {
      // Instantiate the module once
      if (!window.ProductAdditionsSettingsModuleInstance) {
        try {
          window.ProductAdditionsSettingsModuleInstance = new ProductAdditionsSettingsModule();
          createLogger('ProductAdditionsInit').log('ProductAdditionsSettingsModule instance initiated.');
        } catch (error) {
          createLogger('ProductAdditionsInit').error('Error instantiating ProductAdditionsSettingsModule:', error);
          // Use the global notice system if ProductEstimatorSettings is available
          if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
            window.ProductEstimatorSettingsInstance.showNotice('Failed to initialize Product Additions settings. Check console for errors.', 'error');
          }
        }
      }
    } else {
      createLogger('ProductAdditionsInit').error(`Localized data object "${localizedDataObjectName}" not found for tab: ${mainTabId}. Module cannot be initialized.`);
      if (window.ProductEstimatorSettingsInstance && typeof window.ProductEstimatorSettingsInstance.showNotice === 'function') {
        window.ProductEstimatorSettingsInstance.showNotice(`Configuration data for Product Additions ("${localizedDataObjectName}") is missing. Module disabled.`, 'error');
      }
    }
    // The module's inherited `handleMainTabChanged` (from VerticalTabbedModule)
    // will manage activation/deactivation logic, including calling `onMainTabActivated`.
    // No separate `product_estimator_tab_changed` listener is needed here for re-initialization
    // or for clearing `sub_tab` from URL, as `VerticalTabbedModule.showVerticalTab` handles URL state.
  } else {
    createLogger('ProductAdditionsInit').warn(`Main container #${mainTabId} not found. ProductAdditionsSettingsModule will not be initialized.`);
  }
});

export default ProductAdditionsSettingsModule;
