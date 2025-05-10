// File: admin/js/modules/ProductAdditionsSettingsModule.js

/**
 * Product Additions Settings JavaScript
 *
 * Handles functionality specific to the product additions settings tab.
 * Extends AdminTableManager for common table and form management.
 */
import AdminTableManager from '../common/AdminTableManager'; // Adjust path as needed
import { ajax, dom, format, validation } from '@utils'; // Assuming @utils provides these
import { createLogger } from '@utils';

class ProductAdditionsSettingsModule extends AdminTableManager {
  /**
   * Constructor for ProductAdditionsSettingsModule.
   * @param {Object} moduleSettings - Localized settings from PHP.
   * @param {jQuery} $mainContainer - The main jQuery container for this module.
   */
  constructor(moduleSettings, $mainContainer) {
    super(moduleSettings, $mainContainer);
    this.logger = createLogger(`ProductAdditions`);

    this.productSearchTimeout = null;

    this._bindSpecificEvents();
    this._initializeSelect2();
    this.logger.log('ProductAdditionsSettingsModule initialized.');
  }

  /**
   * Bind events specific to Product Additions.
   * @private
   */
  _bindSpecificEvents() {
    this.$mainContainer.on('click.productAdditions', '.product-result-item', this._handleProductResultClick.bind(this));
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
          allowClear: true, // Allow clearing for single selects if needed
          dropdownCssClass: 'product-estimator-dropdown'
        }).val(null).trigger('change'); // Ensure it's cleared initially
      } else if ($element && !$element.length) {
        this.logger.warn('Select2 target element not found:', $element.selector);
      }
    };

    initSelect2(this.dom.sourceCategorySelect, this.settings.i18n.selectSourceCategories || 'Select source categories');
    initSelect2(this.dom.targetCategorySelect, this.settings.i18n.selectTargetCategory || 'Select a category');
    this.logger.log('Select2 components initialized.');
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

    // Reset fields that depend on actionType
    this.dom.targetCategorySelect?.val(null).trigger('change.select2');
    this._clearProductSelectionFields(); // Helper to clear product search related fields
    this.dom.noteTextInput?.val('');

    if (actionType === 'auto_add_by_category') {
      this.dom.targetCategoryRow?.show();
    } else if (actionType === 'auto_add_note_by_category') {
      this.dom.noteRow?.show();
    } else if (actionType === 'suggest_products_by_category') {
      this.dom.targetCategoryRow?.show();
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
   * @param {Event} e - Keyup event.
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
   * Performs AJAX search for products.
   * @param {string} searchTerm
   * @param {string|number} categoryId
   * @private
   */
  _searchProducts(searchTerm, categoryId) {
    this.logger.log('Searching products with term:', searchTerm, 'in category:', categoryId);
    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: {
        action: this.settings.actions.search_products,
        nonce: this.settings.nonce,
        search: searchTerm,
        category: categoryId,
        option_name: this.settings.option_name, // Pass option_name if PHP needs it
        tab_id: this.settings.tab_id,           // Pass tab_id if PHP needs it
      }
    })
      .then(response => {
        if (response.success && response.data && response.data.products) {
          if (response.data.products.length > 0) {
            let resultsHtml = '<ul class="product-results-list">';
            response.data.products.forEach(product => {
              // Ensure names are properly escaped for HTML attributes if they contain special characters
              const escapedName = this.$('<div>').text(product.name || '').html();
              resultsHtml += `
                            <li class="product-result-item" data-id="${product.id}" data-name="${escapedName}">
                                ${product.name || 'Unnamed Product'} (ID: ${product.id})
                            </li>`;
            });
            resultsHtml += '</ul>';
            this.dom.productSearchResults?.html(resultsHtml).show();
          } else {
            this.dom.productSearchResults?.html(`<p>${this.settings.i18n.noProductsFound || 'No products found'}</p>`).show();
          }
        } else {
          this.logger.error('Product search failed or returned invalid data:', response);
          this.dom.productSearchResults?.html(`<p>${this.settings.i18n.errorSearching || 'Error searching products'}</p>`).show();
        }
      })
      .catch(error => {
        this.logger.error('AJAX error searching products:', error);
        this.dom.productSearchResults?.html(`<p>${this.settings.i18n.errorSearching || 'Error searching products'}</p>`).show();
      });
  }

  /**
   * Handles click on a product search result item.
   * @param {Event} e - Click event.
   * @private
   */
  _handleProductResultClick(e) {
    const $item = this.$(e.currentTarget);
    const productId = $item.data('id');
    const productName = $item.data('name'); // Name is already HTML escaped if needed from _searchProducts

    this.logger.log('Product selected from search:', productId, productName);

    this.dom.selectedProductIdInput?.val(productId);
    this.dom.selectedProductDisplay?.find('.selected-product-info').html(`<strong>${productName}</strong> (ID: ${productId})`);
    this.dom.selectedProductDisplay?.show();

    this.dom.productSearchInput?.val('');
    this.dom.productSearchResults?.empty().hide();
    this.formModified = true;
  }

  /**
   * Handles click on the "Clear Product" button.
   * @private
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
    super.resetForm();

    this.dom.relationTypeSelect?.val('').trigger('change.productAdditions'); // Trigger specific handler
    this.dom.sourceCategorySelect?.val(null).trigger('change.select2');
    this.dom.targetCategorySelect?.val(null).trigger('change.select2');
    this._clearProductSelectionFields();
    this.dom.noteTextInput?.val('');

    this.dom.targetCategoryRow?.hide();
    this.dom.productSearchRow?.hide();
    this.dom.noteRow?.hide();

    this.logger.log('Product Additions form fields reset.');
  }

  /**
   * Overrides AdminTableManager.populateFormWithData.
   * @param {Object} dataForRow - Data for the row, usually from edit button's data attributes.
   * For Product Additions, the 'get_item' AJAX fetches product details, not the full relation.
   * So, we primarily use the data attributes from the clicked edit button.
   */
  populateFormWithData(dataForRow) {
    // `dataForRow` in this module's context comes from the edit button's data attributes,
    // because `actions.get_item` (get_product_details) fetches product info, not full relation.
    // The AdminTableManager's handleEdit method passes $button.data() if get_item is not used,
    // or response.item if get_item is used. Here, we assume it's the button data.
    this.logger.log('Populating Product Additions form with data from button attributes:', dataForRow);

    // The AdminTableManager's populateFormWithData already handles setting the hidden ID input
    // if dataForRow.id is present and this.dom.idInput exists.
    // this.dom.idInput.val(dataForRow.id || this.currentItemId);
    super.populateFormWithData({ id: dataForRow.id || this.currentItemId });


    const relationType = dataForRow.type || '';
    const sourceCategories = (dataForRow.source || '').toString().split(',').filter(id => id.trim() !== '');
    const targetCategory = dataForRow.target || '';
    const productId = dataForRow.productId || '';
    const noteText = dataForRow.noteText || '';

    this.dom.relationTypeSelect?.val(relationType).trigger('change.productAdditions');

    // Use setTimeout to allow conditional sections to become visible before setting values
    setTimeout(() => {
      this.dom.sourceCategorySelect?.val(sourceCategories).trigger('change.select2');

      if (relationType === 'auto_add_by_category') {
        this.dom.targetCategorySelect?.val(targetCategory).trigger('change.select2');
        if (productId) {
          this._loadProductDetailsForEditForm(productId);
        }
      } else if (relationType === 'suggest_products_by_category') {
        this.dom.targetCategorySelect?.val(targetCategory).trigger('change.select2');
      } else if (relationType === 'auto_add_note_by_category') {
        this.dom.noteTextInput?.val(noteText);
      }
      this.formModified = false; // Reset after populating
    }, 150); // Increased delay slightly
  }

  /**
   * Fetches product details to display product name in the form when editing.
   * @param {string|number} productId
   * @private
   */
  _loadProductDetailsForEditForm(productId) {
    this.logger.log('Loading product details for edit form, product ID:', productId);
    // No need for separate loading spinner here, form is already visible.
    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: {
        action: this.settings.actions.get_item, // This is 'get_product_details'
        nonce: this.settings.nonce,
        item_id: productId,
        option_name: this.settings.option_name,
        tab_id: this.settings.tab_id,
      }
    })
      .then(response => {
        if (response.success && response.data && response.data.item && response.data.item.name) {
          this.dom.selectedProductIdInput?.val(productId);
          this.dom.selectedProductDisplay?.find('.selected-product-info')
            .html(`<strong>${response.data.item.name}</strong> (ID: ${productId})`);
          this.dom.selectedProductDisplay?.show();
        } else {
          this.logger.warn('Could not load product name for edit form:', response);
          this._clearProductSelectionFields(); // Clear if product not found
        }
      })
      .catch(error => {
        this.logger.error('Error loading product details for edit form:', error);
        this.showNotice(this.settings.i18n.errorLoadingProduct || 'Error loading product details.', 'error');
        this._clearProductSelectionFields();
      });
  }

  /**
   * Overrides AdminTableManager.validateForm.
   * @returns {boolean}
   */
  validateForm() {
    if (!super.validateForm()) return false; // Basic required field check from parent

    let isValid = true;
    const actionType = this.dom.relationTypeSelect?.val();
    const sourceCategories = this.dom.sourceCategorySelect?.val();
    const targetCategory = this.dom.targetCategorySelect?.val();
    const productId = this.dom.selectedProductIdInput?.val();
    const noteText = this.dom.noteTextInput?.val()?.trim() || '';

    // Clear previous specific errors
    this.clearFieldError(this.dom.relationTypeSelect);
    this.clearFieldError(this.dom.sourceCategorySelect?.next('.select2-container'));
    this.clearFieldError(this.dom.targetCategorySelect?.next('.select2-container'));
    this.clearFieldError(this.dom.selectedProductDisplay); // Error near selected product or search input
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
        this.showFieldError(this.dom.selectedProductDisplay.is(':visible') ? this.dom.selectedProductDisplay : this.dom.productSearchInput, this.settings.i18n.selectProduct);
        isValid = false;
      }
    } else if (actionType === 'suggest_products_by_category') {
      if (!targetCategory) {
        this.showFieldError(this.dom.targetCategorySelect?.next('.select2-container'), this.settings.i18n.selectTargetCategory);
        isValid = false;
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
   * @param {Object} itemData - Data for the relation.
   * @returns {jQuery}
   */
  createTableRow(itemData) {
    this.logger.log('Creating Product Additions table row with data:', itemData);
    if (!itemData || !itemData.id) {
      this.logger.error('Cannot create table row: itemData or itemData.id is missing.');
      return this.$('<tr><td colspan="4">Error: Invalid item data.</td></tr>');
    }

    const $row = this.$(`<tr data-id="${itemData.id}"></tr>`);

    $row.append(this.$('<td></td>').text(itemData.source_name || 'N/A'));

    const $actionTypeCell = this.$('<td></td>');
    const $actionTypeSpan = this.$('<span></span>')
      .addClass(`relation-type ${itemData.relation_type || ''}`)
      .text(itemData.relation_type_label || itemData.relation_type || 'N/A');
    $actionTypeCell.append($actionTypeSpan);
    $row.append($actionTypeCell);

    let targetNoteContent = 'N/A';
    if (itemData.relation_type === 'auto_add_by_category') {
      targetNoteContent = itemData.product_name || (itemData.target_name ? `${itemData.target_name} (Category)` : 'N/A');
    } else if (itemData.relation_type === 'auto_add_note_by_category') {
      targetNoteContent = itemData.note_text ? format.truncateText(itemData.note_text, 50) : 'N/A';
    } else if (itemData.relation_type === 'suggest_products_by_category') {
      // Only show if feature is enabled (row should be filtered out by PHP if not)
      if (this.settings.feature_flags && this.settings.feature_flags.suggested_products_enabled) {
        targetNoteContent = itemData.target_name ? `${itemData.target_name} (Category)` : 'N/A';
      } else {
        targetNoteContent = '(Feature Disabled)';
      }
    }
    $row.append(this.$('<td></td>').text(targetNoteContent));

    const $actionsCell = this.$('<td></td>').addClass('actions');
    const sourceCatIds = Array.isArray(itemData.source_category) ? itemData.source_category.join(',') : (itemData.source_category || '');

    const $editButton = this.$('<button></button>')
      .attr('type', 'button')
      .addClass('button button-small')
      .addClass(this.settings.selectors.editButton.substring(1)) // Remove leading dot for class name
      .text(this.settings.i18n.editButtonLabel || 'Edit')
      .data({ // Data attributes for populating form on edit
        id: itemData.id,
        source: sourceCatIds,
        target: itemData.target_category || '',
        productId: itemData.product_id || '',
        type: itemData.relation_type || '',
        noteText: itemData.note_text || ''
      });

    const $deleteButton = this.$('<button></button>')
      .attr('type', 'button')
      .addClass('button button-small')
      .addClass(this.settings.selectors.deleteButton.substring(1)) // Remove leading dot
      .text(this.settings.i18n.deleteButtonLabel || 'Delete')
      .data('id', itemData.id);

    $actionsCell.append($editButton, ' ', $deleteButton);
    $row.append($actionsCell);

    return $row;
  }
}

// Initialization logic
jQuery(document).ready(function($) {
  const mainTabId = 'product_additions';
  const $mainContainer = $(`#${mainTabId}`);

  if ($mainContainer.length) {
    const initModule = () => {
      // Ensure ProductEstimatorSettings is initialized and currentTab is set
      if (window.ProductEstimatorSettings && window.ProductEstimatorSettings.currentTab === mainTabId) {
        if (window.productAdditionsSettingsData) { // Localized data from PHP
          if (!window.ProductAdditionsTableManagerInstance) { // Prevent re-initialization
            window.ProductAdditionsTableManagerInstance = new ProductAdditionsSettingsModule(window.productAdditionsSettingsData, $mainContainer);
          }
        } else {
          createLogger(`ProductAdditionsInit`).error('Localized data (productAdditionsSettingsData) not found for tab:', mainTabId);
        }
      }
    };

    initModule(); // Attempt init on ready
    $(document).on('product_estimator_tab_changed', function(e, newTabId) {
      if (newTabId === mainTabId) {
        setTimeout(initModule, 50); // Initialize when tab becomes active
      }
    });
  }
});

export default ProductAdditionsSettingsModule;
