// File: admin/js/modules/ProductAdditionsSettingsModule.js

/**
 * Product Additions Settings JavaScript
 *
 * Handles functionality specific to the product additions settings tab.
 * Extends AdminTableManager for common table and form management.
 */
import AdminTableManager from '../common/AdminTableManager'; // Adjust path as needed
import {ajax, dom, format, validation} from '@utils'; // Assuming @utils provides these
import {createLogger} from '@utils';

class ProductAdditionsSettingsModule extends AdminTableManager {
  /**
   * Constructor for ProductAdditionsSettingsModule.
   */
  constructor() {
    // Configuration for AdminTableManager base class
    const config = {
      mainTabId: 'product_additions', // Matches the main container ID and PHP tab_id
      localizedDataName: 'productAdditionsSettings' // Name of the global JS object from PHP
    };
    super(config); // Pass config to AdminTableManager

    // this.logger is already initialized by AdminTableManager with 'AdminTableManager:product_additions'
    // If you need an additional, distinct logger for pure ProductAdditions messages:
    // this.paLogger = createLogger('ProductAdditions');

    this.productSearchTimeout = null;

    // Defer DOM-dependent specific initializations until the base class signals it's ready
    this.$(document).on(`admin_table_manager_ready_${this.config.mainTabId}`, () => {
      this.logger.log('Base AdminTableManager is ready. Initializing ProductAdditions specifics.');
      this._bindSpecificEvents();
      this._initializeSelect2();
      this.logger.log('ProductAdditionsSettingsModule specific features initialized.');
    });

    this.logger.log('ProductAdditionsSettingsModule constructor completed.');
  }

  /**
   * Bind events specific to Product Additions.
   * @private
   */
  _bindSpecificEvents() {
    // Ensure DOM elements are available (they are cached by base class's init -> cacheDOM)
    this.dom.form?.on('click.productAdditions', '.product-result-item', this._handleProductResultClick.bind(this));
    this.dom.relationTypeSelect?.on('change.productAdditions', this._handleRelationTypeChange.bind(this));
    this.dom.targetCategorySelect?.on('change.productAdditions', this._handleTargetCategoryChange.bind(this));
    this.dom.productSearchInput?.on('keyup.productAdditions', this._handleProductSearchKeyup.bind(this));
    this.dom.clearProductButton?.on('click.productAdditions', this._handleClearProduct.bind(this));
    this.logger.log('Product Additions specific events bound.');
  }

  /**
   * Initialize Select2 components.
   * @private
   */
  _initializeSelect2() {
    const initSelect2 = ($element, placeholderText) => {
      if ($element && $element.length && this.$.fn.select2) {
        $element.select2({
          placeholder: placeholderText,
          width: '100%',
          allowClear: true,
          dropdownCssClass: 'product-estimator-dropdown'
        }).val(null).trigger('change'); // Ensure it's cleared initially
      } else if ($element && !$element.length) {
        this.logger.warn('Select2 target element not found:', $element.selector);
      }
    };

    initSelect2(this.dom.sourceCategorySelect, this.settings.i18n.selectSourceCategories || 'Select source categories');
    initSelect2(this.dom.targetCategorySelect, this.settings.i18n.selectTargetCategory || 'Select a category');
    this.logger.log('Select2 components initialized for Product Additions.');
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

    this.dom.targetCategorySelect?.val(null).trigger('change.select2');
    this._clearProductSelectionFields();
    this.dom.noteTextInput?.val('');

    if (actionType === 'auto_add_by_category') {
      this.dom.targetCategoryRow?.show();
      // Product search row visibility is handled by _handleTargetCategoryChange
    } else if (actionType === 'auto_add_note_by_category') {
      this.dom.noteRow?.show();
    } else if (actionType === 'suggest_products_by_category') {
      // Only show if feature is enabled
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

    this._clearProductSelectionFields();

    if (categoryId && actionType === 'auto_add_by_category') {
      this.dom.productSearchRow?.show();
    } else {
      this.dom.productSearchRow?.hide();
    }
  }

  /**
   * Helper to clear product selection fields.
   * @private
   */
  _clearProductSelectionFields() {
    this.dom.productSearchInput?.val('');
    this.dom.productSearchResults?.empty().hide();
    this.dom.selectedProductIdInput?.val('');
    this.dom.selectedProductDisplay?.hide().find('.selected-product-info').empty();
  }


  /**
   * Handles keyup event on the product search input.
   */
  _handleProductSearchKeyup(e) {
    const searchTerm = this.$(e.target).val()?.trim() || '';
    const categoryId = this.dom.targetCategorySelect?.val();

    clearTimeout(this.productSearchTimeout);

    if (searchTerm.length < 3 || !categoryId) {
      this.dom.productSearchResults?.empty().hide();
      return;
    }

    this.dom.productSearchResults?.html(`<p>${this.settings.i18n.searching || 'Searching...'}</p>`).show();

    this.productSearchTimeout = setTimeout(() => {
      this._searchProducts(searchTerm, categoryId);
    }, 500);
  }

  /**
   * Performs AJAX search for products. Uses ProductAdditions-specific AJAX action.
   */
// ProductAdditionsSettingsModule.js
  _searchProducts(searchTerm, categoryId) {
    this.logger.log('Searching products with term:', searchTerm, 'in category:', categoryId);
    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: { // This is the 'data' object passed to your utility
        action: this.settings.actions.search_products,
        nonce: this.settings.nonce,
        search: searchTerm,
        category: categoryId,
        // Potentially add these if your PHP handler expects them and isn't getting them:
        // option_name: this.settings.option_name,
        // tab_id: this.settings.tab_id,
      }
    })
      .then(response => { // 'response' is whatever ajax.ajaxRequest resolves with
        this.logger.log('Raw response from ajax.ajaxRequest:', response);
        this.logger.log('Type of response:', typeof response);
        if (response && typeof response === 'object') {
          this.logger.log('Is response an array?', Array.isArray(response));
          this.logger.log('Response keys:', Object.keys(response));
          this.logger.log('Does response have "success" property?', response.hasOwnProperty('success'));
          this.logger.log('Does response have "data" property?', response.hasOwnProperty('data'));
        }

        // Original check:
        // if (response.success && response.data && response.data.products) {

        // Tentative check if ajax.ajaxRequest directly returns the 'data' part:
        if (response && response.products && Array.isArray(response.products)) {
          this.logger.log('Product data found directly in response. Processing products array.');
          let resultsHtml = '';
          if (response.products.length > 0) {
            resultsHtml = '<ul class="product-results-list">';
            response.products.forEach(product => {
              const escapedName = this.$('<div>').text(product.name || '').html();
              resultsHtml += `<li class="product-result-item" data-id="${product.id}" data-name="${escapedName}">${product.name || 'Unnamed Product'} (ID: ${product.id})</li>`;
            });
            resultsHtml += '</ul>';
          } else {
            resultsHtml = `<p>${this.settings.i18n.noProductsFound || 'No products found'}</p>`;
          }
          this.dom.productSearchResults?.html(resultsHtml).show();
        } else {
          // If the above 'if' failed, it means 'response' wasn't structured as {products: [...]}
          // So, now we check if it was the original WordPress format {success: true, data: {products: [...]}}
          if (response && response.success && response.data && response.data.products && Array.isArray(response.data.products)) {
            this.logger.log('Product data found in response.data.products. Processing products array.');
            let resultsHtml = '';
            if (response.data.products.length > 0) {
              resultsHtml = '<ul class="product-results-list">';
              response.data.products.forEach(product => {
                const escapedName = this.$('<div>').text(product.name || '').html();
                resultsHtml += `<li class="product-result-item" data-id="${product.id}" data-name="${escapedName}">${product.name || 'Unnamed Product'} (ID: ${product.id})</li>`;
              });
              resultsHtml += '</ul>';
            } else {
              resultsHtml = `<p>${this.settings.i18n.noProductsFound || 'No products found'}</p>`;
            }
            this.dom.productSearchResults?.html(resultsHtml).show();
          } else {
            // If both checks fail, then the data is truly unexpected.
            this.logger.error('Product search failed or returned invalid/unexpected data structure:', response);
            this.dom.productSearchResults?.html(`<p>${this.settings.i18n.errorSearching || 'Error searching products'}</p>`).show();
          }
        }
      })
      .catch(error => { /* ... */
      });
  }

  /**
   * Handles click on a product search result item.
   */
  _handleProductResultClick(e) {
    const $item = this.$(e.currentTarget);
    const productId = $item.data('id');
    const productName = $item.data('name');

    this.logger.log('Product selected from search:', productId, productName);

    this.dom.selectedProductIdInput?.val(productId);
    this.dom.selectedProductDisplay?.find('.selected-product-info').html(`<strong>${productName}</strong> (ID: ${productId})`);
    this.dom.selectedProductDisplay?.show();

    this.dom.productSearchInput?.val(''); // Clear search input
    this.dom.productSearchResults?.empty().hide();
    this.formModified = true;
  }

  /**
   * Handles click on the "Clear Product" button.
   */
  _handleClearProduct() {
    this.logger.log('Clear product selection.');
    this._clearProductSelectionFields();
    this.dom.productSearchInput?.focus();
    this.formModified = true;
  }

  /**
   * Overrides AdminTableManager.resetForm.
   */
  resetForm() {
    super.resetForm(); // Calls base method (which handles generic form reset and flags)

    // Now reset ProductAdditions-specific fields
    this.dom.relationTypeSelect?.val('').trigger('change.productAdditions');
    this.dom.sourceCategorySelect?.val(null).trigger('change.select2');
    this.dom.targetCategorySelect?.val(null).trigger('change.select2');
    this._clearProductSelectionFields();
    this.dom.noteTextInput?.val('');

    // Ensure conditional fields are hidden after full reset
    this.dom.targetCategoryRow?.hide();
    this.dom.productSearchRow?.hide();
    this.dom.noteRow?.hide();

    this.logger.log('Product Additions form fields specifically reset.');
  }

  /**
   * Overrides AdminTableManager.populateFormWithData.
   * @param {Object} itemData - Full data for the item/relation, typically from AJAX 'get_item'.
   */
  populateFormWithData(itemData) {
    super.populateFormWithData(itemData); // Sets hidden ID input
    this.logger.log('Populating Product Additions form with full item data:', itemData);

    const relationType = itemData.relation_type || '';
    const sourceCategories = itemData.source_category || []; // Expect array from PHP
    const targetCategory = itemData.target_category || '';
    const productId = itemData.product_id || '';
    const noteText = itemData.note_text || '';

    this.dom.relationTypeSelect?.val(relationType).trigger('change.productAdditions'); // This will show/hide relevant sections

    // Use setTimeout to ensure conditional sections are visible before populating them
    setTimeout(() => {
      this.dom.sourceCategorySelect?.val(sourceCategories).trigger('change.select2');

      if (relationType === 'auto_add_by_category') {
        this.dom.targetCategorySelect?.val(targetCategory).trigger('change.select2');
        if (productId && itemData.product_name) { // product_name should come from get_item
          this.dom.selectedProductIdInput?.val(productId);
          this.dom.selectedProductDisplay?.find('.selected-product-info').html(`<strong>${itemData.product_name}</strong> (ID: ${productId})`);
          this.dom.selectedProductDisplay?.show();
        } else if (productId) {
          // If product_name wasn't in itemData, you might need a separate fetch or indicate loading
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
      this.formModified = false; // Reset after populating
    }, 150);
  }


  /**
   * Overrides AdminTableManager.validateForm.
   * @returns {boolean}
   */
  validateForm() {
    // First, run base validation (e.g., for fields with 'is-required' class if any)
    // For this module, explicit validation is more comprehensive.
    // super.validateForm(); // Call if base has meaningful validation for this form

    let isValid = true;
    this.logger.log('Validating Product Additions form.');

    const actionType = this.dom.relationTypeSelect?.val();
    const sourceCategories = this.dom.sourceCategorySelect?.val(); // This will be an array for multi-select
    const targetCategory = this.dom.targetCategorySelect?.val();
    const productId = this.dom.selectedProductIdInput?.val(); // Actual selected product ID
    const noteText = this.dom.noteTextInput?.val()?.trim() || '';

    // Clear previous specific errors
    this.clearFieldError(this.dom.relationTypeSelect);
    this.clearFieldError(this.dom.sourceCategorySelect?.next('.select2-container')); // Target Select2 container for error display
    this.clearFieldError(this.dom.targetCategorySelect?.next('.select2-container'));
    this.clearFieldError(this.dom.productSearchInput); // Error near product search
    this.clearFieldError(this.dom.noteTextInput);


    if (!actionType) {
      this.showFieldError(this.dom.relationTypeSelect, this.settings.i18n.selectAction);
      isValid = false;
    }
    if (!sourceCategories || sourceCategories.length === 0) {
      this.showFieldError(this.dom.sourceCategorySelect?.next('.select2-container'), this.settings.i18n.selectSourceCategories);
      isValid = false;
    }

    if (actionType === 'auto_add_by_category') {
      if (!targetCategory) {
        this.showFieldError(this.dom.targetCategorySelect?.next('.select2-container'), this.settings.i18n.selectTargetCategory);
        isValid = false;
      }
      if (!productId) {
        // Show error near the product search input or the display area if visible
        const $productErrorTarget = this.dom.selectedProductDisplay?.is(':visible') ? this.dom.selectedProductDisplay : this.dom.productSearchInput;
        this.showFieldError($productErrorTarget, this.settings.i18n.selectProduct);
        isValid = false;
      }
    } else if (actionType === 'suggest_products_by_category') {
      if (this.settings.feature_flags && this.settings.feature_flags.suggested_products_enabled) {
        if (!targetCategory) {
          this.showFieldError(this.dom.targetCategorySelect?.next('.select2-container'), this.settings.i18n.selectTargetCategory);
          isValid = false;
        }
      }
    } else if (actionType === 'auto_add_note_by_category') {
      if (!noteText) {
        this.showFieldError(this.dom.noteTextInput, this.settings.i18n.noteTextRequired);
        isValid = false;
      }
    }
    this.logger.log('Product Additions form validation result:', isValid);
    return isValid;
  }

  /**
   * Overrides AdminTableManager.createTableRow.
   * @param {Object} itemData - Data for the relation. This is the response from PHP's prepare_item_for_response.
   * @returns {jQuery} The new table row.
   */
  createTableRow(itemData) {
    this.logger.log('Creating Product Additions table row with data:', itemData);
    if (!itemData || !itemData.id) {
      this.logger.error('Cannot create table row: itemData or itemData.id is missing.');
      return this.$('<tr><td colspan="4">Error: Invalid item data.</td></tr>'); // Ensure colspan matches columns
    }

    const $row = this.$(`<tr data-id="${itemData.id}"></tr>`);

    // Column 1: Source Categories
    $row.append(this.$('<td></td>').text(itemData.source_name || 'N/A'));

    // Column 2: Action Type
    const $actionTypeCell = this.$('<td></td>');
    const $actionTypeSpan = this.$('<span></span>')
      .addClass(`relation-type ${itemData.relation_type || ''}`) // For styling based on type
      .text(itemData.relation_type_label || itemData.relation_type || 'N/A');
    $actionTypeCell.append($actionTypeSpan);
    $row.append($actionTypeCell);

    // Column 3: Target/Note (uses itemData.target_details_display from PHP)
    $row.append(this.$('<td></td>').text(itemData.target_details_display || 'N/A'));

    // Column 4: Actions (Edit/Delete buttons)
    const $actionsCell = this.$('<td></td>').addClass('actions');
    // Data for edit button should match what populateFormWithData expects from AJAX get_item if used,
    // or enough to populate if get_item isn't used.
    // Since populateFormWithData now expects the full item from get_item,
    // we only strictly need data-id for the edit button if get_item is always used.
    // However, including all data for direct population fallback can be useful.
    const sourceCatIds = Array.isArray(itemData.source_category) ? itemData.source_category.join(',') : (itemData.source_category || '');

    const $editButton = this.$('<button></button>')
      .attr('type', 'button')
      .addClass('button button-small')
      .addClass(this.settings.selectors.editButton.substring(1)) // Get class name from selector
      .text(this.settings.i18n.editButtonLabel || 'Edit')
      .data('id', itemData.id); // Essential for handleEdit to fetch full item data
    // Optionally, add all data here if NOT using get_item for populating edit form:
    // .data({
    //   id: itemData.id,
    //   source_category: sourceCatIds, // Send as comma-separated string if needed by form
    //   target_category: itemData.target_category || '',
    //   product_id: itemData.product_id || '',
    //   relation_type: itemData.relation_type || '',
    //   note_text: itemData.note_text || '',
    //   product_name: itemData.product_name || '' // If available and needed for direct population
    // });


    const $deleteButton = this.$('<button></button>')
      .attr('type', 'button')
      .addClass('button button-small')
      .addClass(this.settings.selectors.deleteButton.substring(1)) // Get class name from selector
      .text(this.settings.i18n.deleteButtonLabel || 'Delete')
      .data('id', itemData.id);

    $actionsCell.append($editButton, ' ', $deleteButton);
    $row.append($actionsCell);

    return $row;
  }
}

// Revised Initialization logic at the end of the file
jQuery(document).ready(function ($) {
  const mainTabId = 'product_additions';
  const localizedDataObjectName = 'productAdditionsSettings';

  const initProductAdditionsModule = () => {
    // Check if the main settings object is available and if this is the current active tab
    if (window.ProductEstimatorSettings && window.ProductEstimatorSettings.currentTab === mainTabId) {
      if (window[localizedDataObjectName]) {
        if (!window.ProductAdditionsTableManagerInstance) { // Prevent re-initialization
          try {
            // Instantiate the module-specific JS class. AdminTableManager's constructor will handle its own init.
            window.ProductAdditionsTableManagerInstance = new ProductAdditionsSettingsModule();
            createLogger('ProductAdditionsInit').log('ProductAdditionsSettingsModule instance initiated.');
          } catch (error) {
            createLogger('ProductAdditionsInit').error('Error instantiating ProductAdditionsSettingsModule:', error);
            if (window.ProductEstimatorSettings && typeof window.ProductEstimatorSettings.showNotice === 'function') {
              window.ProductEstimatorSettings.showNotice('Failed to initialize Product Additions settings. Check console for errors.', 'error');
            }
          }
        }
      } else {
        createLogger('ProductAdditionsInit').error(`Localized data object "${localizedDataObjectName}" not found for tab: ${mainTabId}. Cannot initialize module.`);
        if (window.ProductEstimatorSettings && typeof window.ProductEstimatorSettings.showNotice === 'function') {
          window.ProductEstimatorSettings.showNotice(`Configuration data for Product Additions ("${localizedDataObjectName}") is missing.`, 'error');
        }
      }
    }
  };

  // Ensure the container for this specific module/tab exists before attempting anything
  if ($(`#${mainTabId}`).length) {
    initProductAdditionsModule(); // Attempt initialization on document ready if tab is active

    // Also listen for global tab change events to initialize if this tab becomes active later
    $(document).on('product_estimator_tab_changed', function (e, newTabId) {
      if (newTabId === mainTabId) {
        // Use a small timeout to ensure the tab content is fully rendered and visible by WordPress/other scripts
        setTimeout(initProductAdditionsModule, 50);
      }
      const url = new URL(window.location.href);
      url.searchParams.delete('sub_tab');
      window.history.replaceState({}, '', url);
    });
  } else {
    createLogger('ProductAdditionsInit').warn(`Main container #${mainTabId} not found. ProductAdditionsSettingsModule will not be initialized.`);
  }
});

export default ProductAdditionsSettingsModule;
