// File: admin/js/modules/ProductAdditionsSettingsModule.js

/**
 * Product Additions Settings JavaScript
 *
 * Handles functionality specific to the product additions settings tab.
 * Extends AdminTableManager for common table and form management.
 */
import AdminTableManager from '../common/AdminTableManager'; // Adjust path as needed
import { ajax, validation } from '@utils'; // Assuming @utils provides these. Removed dom, format as they weren't explicitly used in this file's logic directly.
import { createLogger } from '@utils';

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

    // this.logger is initialized by AdminTableManager.
    // this.settings (formerly this.localizedData in VTM/ATM context before PES refactor)
    // is populated by ProductEstimatorSettings via the super chain.
    // this.config from AdminTableManager holds the original config passed here.

    this.productSearchTimeout = null;

    // Defer DOM-dependent specific initializations until the base AdminTableManager signals it's ready.
    // The event name uses this.config.mainTabId.
    // Note: this.config.mainTabId is from the config passed to super(), available after super() call.
    this.$(document).on(`admin_table_manager_ready_${this.config.mainTabId}`, () => { // POTENTIAL ERROR HERE
      this.logger.log('Base AdminTableManager is ready. Initializing ProductAdditions specifics.');
      this._cacheProductAdditionsDOM();
      this._bindSpecificEvents();
      this._initializeSelect2();
      this.logger.log('ProductAdditionsSettingsModule specific features initialized.');
    });

    this.logger.log('ProductAdditionsSettingsModule constructor completed.');
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
      this.logger.log('Product Additions specific DOM elements cached.');
    } else {
      this.logger.warn('Cannot cache Product Additions specific DOM elements: this.settings.selectors not available.');
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
      this.logger.error('ProductAdditions: Form DOM element not found, cannot bind specific events.');
      return;
    }
    this.dom.form.on('click.productAdditions', '.product-result-item', this._handleProductResultClick.bind(this));

    this.dom.relationTypeSelect?.on('change.productAdditions', this._handleRelationTypeChange.bind(this));
    this.dom.targetCategorySelect?.on('change.productAdditions', this._handleTargetCategoryChange.bind(this));
    this.dom.productSearchInput?.on('keyup.productAdditions', this._handleProductSearchKeyup.bind(this));
    this.dom.clearProductButton?.on('click.productAdditions', this._handleClearProduct.bind(this));
    this.logger.log('Product Additions specific events bound.');
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
          width: 'resolve', // 'style' or '100%' might be better depending on CSS
          allowClear: true,
          dropdownCssClass: 'product-estimator-dropdown' // Custom class for styling
        }).val(null).trigger('change'); // Ensure it's cleared initially
      } else if ($element && !$element.length) {
        this.logger.warn('Select2 target element not found:', $element.selector);
      } else if (!$element) {
        this.logger.warn('Select2 target element is undefined (likely missing from DOM cache).');
      }
    };

    // Use a small timeout to ensure Select2 can properly initialize if elements were just shown/manipulated.
    setTimeout(() => {
      // this.settings.i18n is from ProductEstimatorSettings base
      initSelect2(this.dom.sourceCategorySelect, (this.settings.i18n && this.settings.i18n.selectSourceCategories) || 'Select source categories');
      initSelect2(this.dom.targetCategorySelect, (this.settings.i18n && this.settings.i18n.selectTargetCategory) || 'Select a category');
      this.logger.log('Select2 components initialized for Product Additions.');
    }, 100); // 100ms delay
  }

  /**
   * Overridden from VerticalTabbedModule. Called when the "Product Additions" main tab is activated.
   */
  onMainTabActivated() {
    super.onMainTabActivated(); // Call parent method
    this.logger.log('Product Additions main tab activated.');
    // Specific actions for Product Additions when its tab is shown.
    // For example, if Select2 or other components need re-initialization or refresh when tab becomes visible.
    // The `admin_table_manager_ready` event handles initial setup. This is for subsequent activations.
    // If Select2 was initialized while hidden, it might need a refresh.
    if (this.dom.sourceCategorySelect && this.dom.sourceCategorySelect.hasClass("select2-hidden-accessible")) {
      // this.dom.sourceCategorySelect.select2('destroy').select2({...}); // Full re-init
      // Or just trigger a resize/redraw if that helps.
    }
    // The inherited VerticalTabbedModule.handleMainTabChanged calls setupVerticalTabs,
    // which correctly handles the sub_tab in the URL. No manual sub_tab clearing needed here.
  }


  /**
   * Handles changes in the relation type select dropdown.
   */
  _handleRelationTypeChange() {
    const actionType = this.dom.relationTypeSelect?.val();
    this.logger.log('Relation type changed to:', actionType);

    this.dom.targetCategoryRow?.hide();
    this.dom.productSearchRow?.hide();
    this.dom.noteRow?.hide();

    this.dom.targetCategorySelect?.val(null).trigger('change.select2'); // Reset Select2
    this._clearProductSelectionFields();
    this.dom.noteTextInput?.val('');

    if (actionType === 'auto_add_by_category') {
      this.dom.targetCategoryRow?.show();
    } else if (actionType === 'auto_add_note_by_category') {
      this.dom.noteRow?.show();
    } else if (actionType === 'suggest_products_by_category') {
      // this.settings contains feature_flags if they are part of the localized object
      if (this.settings.feature_flags && this.settings.feature_flags.suggested_products_enabled) {
        this.dom.targetCategoryRow?.show();
      } else {
        this.logger.warn('Suggest products feature is disabled, target category row for this type will not be shown.');
      }
    }
  }

  /**
   * Handles changes in the target category select dropdown.
   */
  _handleTargetCategoryChange() {
    const categoryId = this.dom.targetCategorySelect?.val();
    const actionType = this.dom.relationTypeSelect?.val();
    this.logger.log('Target category changed to:', categoryId, 'Action type:', actionType);
    this._clearProductSelectionFields(); // Clear previous product search/selection
    if (categoryId && actionType === 'auto_add_by_category') {
      this.dom.productSearchRow?.show();
    } else {
      this.dom.productSearchRow?.hide();
    }
  }

  _clearProductSelectionFields() {
    this.dom.productSearchInput?.val('');
    this.dom.productSearchResults?.empty().hide();
    this.dom.selectedProductIdInput?.val('');
    this.dom.selectedProductDisplay?.hide().find('.selected-product-info').empty();
  }

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

  _searchProducts(searchTerm, categoryId) {
    this.logger.log('Searching products with term:', searchTerm, 'in category:', categoryId);
    // this.settings.actions and other properties from ProductEstimatorSettings base
    if (!this.settings.actions || !this.settings.actions.search_products) {
      this.logger.error('Product search AJAX action not defined in settings.actions.');
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
        this.logger.log('Raw response from ajax.ajaxRequest for product search:', response);
        let productsArray = null;
        // Standardize response checking
        if (response && response.success && response.data && Array.isArray(response.data.products)) {
          productsArray = response.data.products;
        } else if (response && Array.isArray(response.products)) { // Fallback for older direct array
          productsArray = response.products;
        }


        if (productsArray) {
          this.logger.log('Product data found. Processing products array.');
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
          this.logger.error('Product search failed or returned invalid/unexpected data structure:', response);
          this.dom.productSearchResults?.html(`<p>${(this.settings.i18n && this.settings.i18n.errorSearching) || 'Error searching products'}</p>`).show();
        }
      })
      .catch(error => {
        this.logger.error('Product search AJAX request failed:', error);
        this.dom.productSearchResults?.html(`<p>${(this.settings.i18n && this.settings.i18n.errorSearching) || 'Error searching products'}</p>`).show();
      });
  }

  _handleProductResultClick(e) {
    const $item = this.$(e.currentTarget);
    const productId = $item.data('id');
    const productName = $item.data('name'); // Already escaped if set by _searchProducts
    this.logger.log('Product selected from search:', productId, productName);

    this.dom.selectedProductIdInput?.val(productId);
    this.dom.selectedProductDisplay?.find('.selected-product-info').html(`<strong>${productName}</strong> (ID: ${productId})`);
    this.dom.selectedProductDisplay?.show();
    this.dom.productSearchInput?.val(''); // Clear search input
    this.dom.productSearchResults?.empty().hide(); // Hide results
    this.formModified = true; // Mark form as modified, inherited from AdminTableManager
  }

  _handleClearProduct() {
    this.logger.log('Clear product selection.');
    this._clearProductSelectionFields();
    this.dom.productSearchInput?.focus();
    this.formModified = true; // Mark form as modified
  }

  /**
   * Override AdminTableManager.resetForm to include Product Additions specific fields.
   */
  resetForm() {
    super.resetForm(); // Call base class method first

    // Reset Product Additions specific fields
    this.dom.relationTypeSelect?.val('').trigger('change.productAdditions'); // Triggers _handleRelationTypeChange
    this.dom.sourceCategorySelect?.val(null).trigger('change.select2'); // Clear Select2
    // Target category and product search fields are typically handled by _handleRelationTypeChange
    this._clearProductSelectionFields(); // Explicitly clear product fields
    this.dom.noteTextInput?.val('');

    // Ensure dependent rows are hidden according to the reset relationType
    this.dom.targetCategoryRow?.hide();
    this.dom.productSearchRow?.hide();
    this.dom.noteRow?.hide();

    this.logger.log('Product Additions form fields specifically reset.');
  }

  /**
   * Override AdminTableManager.populateFormWithData for Product Additions specific fields.
   */
  populateFormWithData(itemData) {
    super.populateFormWithData(itemData); // Sets item ID, calls base logic
    this.logger.log('Populating Product Additions form with full item data:', itemData);

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
          this.logger.warn("Product ID present but product_name missing in data for edit form population.");
          this.dom.selectedProductIdInput?.val(productId);
          this.dom.selectedProductDisplay?.find('.selected-product-info').html(`Product ID: ${productId} (Name not available)`);
          this.dom.selectedProductDisplay?.show();
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
   */
  validateForm() {
    let isValid = super.validateForm(); // Perform base validation first
    this.logger.log('Validating Product Additions form.');

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
    this.logger.log('Product Additions form validation result:', isValid);
    return isValid;
  }

  /**
   * Custom column population method for 'source_categories' column
   * This method follows the naming convention for column handlers in AdminTableManager
   */
  populateColumn_source_categories($cell, itemData) {
    $cell.text(itemData.source_category_display || 'N/A');
  }

  /**
   * Custom column population method for 'action_type' column
   */
  populateColumn_action_type($cell, itemData) {
    const $actionTypeSpan = this.$('<span></span>')
      .addClass(`relation-type pe-relation-${itemData.relation_type || 'unknown'}`)
      .text(itemData.action_type_display || itemData.relation_type || 'N/A');
    $cell.append($actionTypeSpan);
  }

  /**
   * Custom column population method for 'target_details' column
   */
  populateColumn_target_details($cell, itemData) {
    $cell.text(itemData.target_details_display || 'N/A');
  }

  /**
   * Binds event handlers for custom action buttons.
   * This overrides the base AdminTableManager.bindCustomActionButtons method.
   */
  bindCustomActionButtons() {
    if (this.dom.listTableBody && this.dom.listTableBody.length) {
      // Bind the view product button click event
      this.dom.listTableBody.on('click.productAdditions', '.pe-view-product-button', this.handleViewProduct.bind(this));
      this.logger.log('Product Additions custom action buttons bound');
    }
  }

  /**
   * Handles clicks on the "View Product" button.
   * @param {Event} e - The click event
   */
  handleViewProduct(e) {
    e.preventDefault();
    const $button = this.$(e.currentTarget);
    const itemId = $button.data('id');
    const productId = $button.data('product-id');

    this.logger.log('View Product button clicked for item ID:', itemId, 'Product ID:', productId);

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
