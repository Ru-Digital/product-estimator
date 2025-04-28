/**
 * Product Additions Settings JavaScript
 *
 * Handles functionality specific to the product additions settings tab.
 */
import { ajax, dom, format, validation, log } from '@utils';

class ProductAdditionsSettingsModule {
  /**
   * Initialize the module
   */
  constructor() {
    // Access localized data with a fallback mechanism
    const adminSettings = window.productAdditionsSettings || {};

    // Create a safe reference to the settings object
    this.settings = {
      ajaxUrl: adminSettings.ajax_url || (typeof ajaxurl !== 'undefined' ? ajaxurl : '/wp-admin/admin-ajax.php'),
      nonce: adminSettings.nonce || '',
      i18n: adminSettings.i18n || {},
      tab_id: adminSettings.tab_id || 'product_additions'
    };

    // Add a variable to track if the form has been modified
    this.formModified = false;

    // Initialize when document is ready
    jQuery(document).ready(() => this.init());
  }

  /**
   * Initialize the module
   */
  init() {
    log('ProductAdditionsSettingsModule', 'Initializing Product Additions Settings Module');
    // Reset form modified state on initialization
    this.formModified = false;
    this.bindEvents();
    this.setupFormHandling();
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    const $ = jQuery;

    // Listen for tab changes
    $(document).on('product_estimator_tab_changed', this.handleTabChanged.bind(this));

    // Tab-specific handlers
    this.initRelationshipHandlers();

    // Track form changes
    $('#product-addition-form').on('change input', 'input, select, textarea', () => {
      this.formModified = true;

      // Update the global form change tracker if available
      if (typeof ProductEstimatorSettings !== 'undefined' &&
        typeof ProductEstimatorSettings.formChangeTrackers !== 'undefined') {
        ProductEstimatorSettings.formChangeTrackers[this.settings.tab_id] = true;

        // If this is the current tab, update the main formChanged flag
        if (ProductEstimatorSettings.currentTab === this.settings.tab_id) {
          ProductEstimatorSettings.formChanged = true;
        }
      }
    });
  }

  /**
   * Set up event handlers for the relationship management UI
   */
  initRelationshipHandlers() {
    const $ = jQuery;
    const $container = $('.product-estimator-additions');
    const $form = $('#product-addition-form');
    const $formContainer = $('.product-additions-form');
    const $addButton = $('.add-new-relation');
    const $relationTypeSelect = $('#relation_type');
    const $targetCategoryRow = $('.target-category-row');
    const $targetCategorySelect = $('#target_category');
    const $productSearchRow = $('.product-search-row');
    const $noteRow = $('.note-row');

    // Initialize Select2 for multiple selection
    $('#source_category').select2({
      placeholder: 'Select source categories',
      width: '100%',
      dropdownCssClass: 'product-estimator-dropdown'
    });

    $('#target_category').select2({
      placeholder: 'Select a category',
      width: '100%',
      allowClear: true,
      dropdownCssClass: 'product-estimator-dropdown'
    });

    // Show form when "Add New Relationship" button is clicked
    $addButton.on('click', function() {
      log('ProductAdditionsSettingsModule', 'Add New Relationship button clicked');
      this.resetForm();
      $('.form-title').text(this.settings.i18n.addNew || 'Add New Relationship');
      $('.save-relation').text(this.settings.i18n.saveChanges || 'Save Changes');
      $formContainer.slideDown();
    }.bind(this));

    // Hide form when "Cancel" button is clicked
    $('.cancel-form').on('click', function() {
      $formContainer.slideUp();
      this.resetForm();
    }.bind(this));

    // Handle action type change
    $relationTypeSelect.on('change', function() {
      const actionType = $(this).val();

      // Reset dependent fields
      $targetCategorySelect.val('').trigger('change');
      $productSearchRow.hide();
      $('#selected-product').hide();
      $('#selected_product_id').val('');
      $noteRow.hide();
      $('#note_text').val('');

      if (actionType === 'auto_add_by_category') {
        $targetCategoryRow.show();
        $noteRow.hide();
      } else if (actionType === 'auto_add_note_by_category') {
        $targetCategoryRow.hide();
        $noteRow.show();
      } else if (actionType === 'suggest_products_by_category') {
        // For suggestion type, we only need the target category
        $targetCategoryRow.show();
        $noteRow.hide();
        $productSearchRow.hide();
      } else {
        $targetCategoryRow.hide();
        $noteRow.hide();
      }
    });

    // Handle target category change
    $targetCategorySelect.on('change', function() {
      const categoryId = $(this).val();
      const actionType = $relationTypeSelect.val();

      // Reset product search
      $('#product_search').val('');
      $('#product-search-results').empty();
      $('#selected-product').hide();
      $('#selected_product_id').val('');

      if (categoryId && actionType === 'auto_add_by_category') {
        $productSearchRow.show();
      } else {
        $productSearchRow.hide();
      }
    });

    // Handle product search
    let searchTimeout;
    $('#product_search').on('keyup', function(e) {
      // Use the event target instead of 'this' to ensure correct reference
      const searchTerm = $(e.target).val() || '';
      const categoryId = $targetCategorySelect.val();

      clearTimeout(searchTimeout);

      if (searchTerm.length < 3) {
        $('#product-search-results').empty();
        return;
      }

      searchTimeout = setTimeout(() => {
        // Use the correctly bound function for searchProducts
        this.searchProducts(searchTerm, categoryId);
      }, 500);
    }.bind(this));

    // Handle clear product button
    $('.clear-product').on('click', function() {
      $('#selected_product_id').val('');
      $('.selected-product-info').empty();
      $('#selected-product').hide();
    });

    // Handle form submission
    $form.on('submit', this.handleFormSubmission.bind(this));

    // Handle edit/delete relations via event delegation
    $('.product-additions-list').on('click', '.edit-relation', this.handleEditRelation.bind(this));
    $('.product-additions-list').on('click', '.delete-relation', this.handleDeleteRelation.bind(this));
  }

  /**
   * Set up form handling
   */
  setupFormHandling() {
    const $ = jQuery;

    // Add event delegation for the dynamic product results
    $(document).on('click', '.product-result-item', function(e) {
      const productId = $(e.currentTarget).data('id');
      const productName = $(e.currentTarget).data('name');

      log('ProductAdditionsSettingsModule', 'Product selected:', productId, productName);

      // Set the selected product
      $('#selected_product_id').val(productId);
      log('ProductAdditionsSettingsModule', 'Product ID set to:', $('#selected_product_id').val());

      $('.selected-product-info').html(`<strong>${productName}</strong> (ID: ${productId})`);
      $('#selected-product').show();

      // Clear search
      $('#product_search').val('');
      $('#product-search-results').empty();
    });
  }

  /**
   * Handle tab changed event
   * @param {Event} e Tab changed event
   * @param {string} tabId The newly active tab ID
   */
  handleTabChanged(e, tabId) {
    // If our tab becomes active, refresh initialization
    if (tabId === this.settings.tab_id) {
      this.formModified = false; // Reset form modified state
      this.init();

      // Update the global form change tracker if available
      if (typeof ProductEstimatorSettings !== 'undefined' &&
        typeof ProductEstimatorSettings.formChangeTrackers !== 'undefined') {
        ProductEstimatorSettings.formChangeTrackers[this.settings.tab_id] = false;

        // If this is the current tab, update the main formChanged flag
        if (ProductEstimatorSettings.currentTab === this.settings.tab_id) {
          ProductEstimatorSettings.formChanged = false;
        }
      }
    }
  }

  /**
   * Reset the form to its initial state
   */
  resetForm() {
    const $ = jQuery;
    const $form = $('#product-addition-form');
    $form[0].reset();
    $('#relation_id').val('');
    $('#selected_product_id').val('');

    // Reset Select2 fields
    $('#source_category').val(null).trigger('change');
    $('#target_category').val(null).trigger('change');

    // Reset dependent fields
    $('#relation_type').val('').trigger('change');
    $('.target-category-row').hide();
    $('.product-search-row').hide();
    $('#selected-product').hide();
    $('#product-search-results').empty();
    $('.note-row').hide();

    // Reset form modified state
    this.formModified = false;

    // Update the global form change tracker if available
    if (typeof ProductEstimatorSettings !== 'undefined' &&
      typeof ProductEstimatorSettings.formChangeTrackers !== 'undefined') {
      ProductEstimatorSettings.formChangeTrackers[this.settings.tab_id] = false;

      // If this is the current tab, update the main formChanged flag
      if (ProductEstimatorSettings.currentTab === this.settings.tab_id) {
        ProductEstimatorSettings.formChanged = false;
      }
    }
  }

  /**
   * Toggle form state (enable/disable inputs)
   * @param {boolean} enabled Whether to enable the form inputs
   */
  toggleFormState(enabled) {
    const $ = jQuery;
    const $form = $('#product-addition-form');
    const $submitBtn = $form.find('.save-relation');
    const $cancelBtn = $form.find('.cancel-form');

    $form.find('input, select, textarea').prop('disabled', !enabled);
    $submitBtn.prop('disabled', !enabled);
    $cancelBtn.prop('disabled', !enabled);

    if (!enabled) {
      $submitBtn.text('Saving...');
    } else {
      $submitBtn.text($('#relation_id').val() ? 'Update Relationship' : 'Save Relationship');
    }

    // Special handling for Select2
    if (enabled) {
      $('#source_category').prop('disabled', false).trigger('change');
      $('#target_category').prop('disabled', false).trigger('change');
    } else {
      $('#source_category').prop('disabled', true).trigger('change');
      $('#target_category').prop('disabled', true).trigger('change');
    }
  }

  /**
   * Handle form submission
   * @param {Event} e Form submit event
   */
  handleFormSubmission(e) {
    e.preventDefault();
    const $ = jQuery;

    const actionType = $('#relation_type').val();
    const sourceCategories = $('#source_category').val();
    const productId = $('#selected_product_id').val();
    const noteText = $('#note_text').val();

    // Validate form
    if (!actionType) {
      alert(this.settings.i18n.selectAction || 'Please select an action type');
      return;
    }

    if (!sourceCategories || sourceCategories.length === 0) {
      alert(this.settings.i18n.selectSourceCategories || 'Please select at least one source category');
      return;
    }

    if (actionType === 'auto_add_by_category') {
      const targetCategory = $('#target_category').val();

      if (!targetCategory) {
        alert(this.settings.i18n.selectTargetCategory || 'Please select a target category');
        return;
      }

      if (!productId) {
        alert(this.settings.i18n.selectProduct || 'Please select a product');
        return;
      }
    } else if (actionType === 'suggest_products_by_category') {
      const targetCategory = $('#target_category').val();

      if (!targetCategory) {
        alert(this.settings.i18n.selectTargetCategory || 'Please select a target category');
        return;
      }
    } else if (actionType === 'auto_add_note_by_category') {
      if (!noteText) {
        alert('Please enter a note text');
        return;
      }
    }

    // Disable form while submitting
    this.toggleFormState(false);

    const formData = {
      action: 'save_category_relation',
      nonce: this.settings.nonce,
      relation_id: $('#relation_id').val(),
      relation_type: actionType,
      source_category: sourceCategories,
      target_category: $('#target_category').val(),
      product_id: productId,
      note_text: noteText
    };

    log('ProductAdditionsSettingsModule', 'Sending form data:', formData);

    // Send AJAX request using ajax utility
    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: formData
    })
      .then(response => {
        log('ProductAdditionsSettingsModule', 'Response received:', response);

        // Show success message
        this.showMessage('success', response.message);

        // If editing an existing relation, replace the row
        if (formData.relation_id) {
          log('ProductAdditionsSettingsModule', 'Updating existing relation:', formData.relation_id);
          const $existingRow = $('.product-additions-list').find(`tr[data-id="${formData.relation_id}"]`);
          if ($existingRow.length) {
            $existingRow.replaceWith(this.createRelationRow(response.relation));
          } else {
            // If the row doesn't exist (unlikely), append it
            this.appendRelationRow(response.relation);
          }
        } else {
          // For new relations, append the row
          this.appendRelationRow(response.relation);
        }

        // Hide the form and reset it
        $('.product-additions-form').slideUp();
        this.resetForm();

        // If this is the first relation, remove the "no items" message and create the table
        const $noItems = $('.product-additions-list').find('.no-items');
        if ($noItems.length) {
          $noItems.remove();

          // Create the table if it doesn't exist
          if (!$('.product-additions-list').find('table').length) {
            const tableHtml = `
              <table class="wp-list-table widefat fixed striped product-additions-table">
                <thead>
                  <tr>
                    <th scope="col">${'Source Categories'}</th>
                    <th scope="col">${'Action'}</th>
                    <th scope="col">${'Target/Note'}</th>
                    <th scope="col">${'Actions'}</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            `;
            $('.product-additions-list').find('h3').after(tableHtml);
          }
        }

        // Reset form modified state
        this.formModified = false;

        // Update the global form change tracker if available
        if (typeof ProductEstimatorSettings !== 'undefined' &&
          typeof ProductEstimatorSettings.formChangeTrackers !== 'undefined') {
          ProductEstimatorSettings.formChangeTrackers[this.settings.tab_id] = false;

          // If this is the current tab, update the main formChanged flag
          if (ProductEstimatorSettings.currentTab === this.settings.tab_id) {
            ProductEstimatorSettings.formChanged = false;
          }
        }
      })
      .catch(error => {
        // Show error message
        this.showMessage('error', error.message || 'Error saving relationship. Please try again.');
        log('ProductAdditionsSettingsModule', 'Error saving relationship:', error);
      })
      .finally(() => {
        // Re-enable form
        this.toggleFormState(true);
      });
  }

  /**
   * Handle edit relation button click
   * @param {Event} e Click event
   */
  handleEditRelation(e) {
    const $ = jQuery;
    const $btn = $(e.currentTarget);
    const relationId = $btn.data('id');
    const sourceCategories = String($btn.data('source') || '').split(',');
    const targetCategory = $btn.data('target');
    const relationType = $btn.data('type');
    const productId = $btn.data('product-id');
    const noteText = $btn.data('note-text');

    log('ProductAdditionsSettingsModule', 'Edit relation:', relationId, sourceCategories, targetCategory, relationType, productId, noteText);

    // Reset form
    this.resetForm();

    // Populate form with existing data
    $('#relation_id').val(relationId);
    $('#relation_type').val(relationType).trigger('change');

    // Need to make sure Select2 has initialized
    setTimeout(function() {
      $('#source_category').val(sourceCategories).trigger('change');

      // If it's auto_add_by_category, set target category and load product
      if (relationType === 'auto_add_by_category' && targetCategory) {
        $('#target_category').val(targetCategory).trigger('change');

        // If we have a product ID, load its details
        if (productId) {
          this.loadProductDetails(productId);
        }
      } else if (relationType === 'suggest_products_by_category' && targetCategory) {
        // For suggest products, we just need the target category
        $('#target_category').val(targetCategory).trigger('change');
      } else if (relationType === 'auto_add_note_by_category' && noteText) {
        // Set the note text
        $('#note_text').val(noteText);
      }
    }.bind(this), 100);

    // Update form title and button text
    $('.form-title').text('Edit Category Relationship');
    $('.save-relation').text('Update Relationship');

    // Show form
    $('.product-additions-form').slideDown();

    // Scroll to form
    $('html, body').animate({
      scrollTop: $('.product-additions-form').offset().top - 50
    }, 300);
  }

  /**
   * Handle delete relation button click
   * @param {Event} e Click event
   */
  handleDeleteRelation(e) {
    const $ = jQuery;
    const $btn = $(e.currentTarget);
    const relationId = $btn.data('id');

    log('ProductAdditionsSettingsModule', 'Delete relation:', relationId);

    if (!confirm(this.settings.i18n.confirmDelete || 'Are you sure you want to delete this relationship?')) {
      return;
    }

    // Disable button while processing
    $btn.prop('disabled', true).text('Deleting...');

    // Use ajax utility for the request
    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: {
        action: 'delete_category_relation',
        nonce: this.settings.nonce,
        relation_id: relationId
      }
    })
      .then(response => {
        log('ProductAdditionsSettingsModule', 'Delete response:', response);

        // Remove row from table
        const $row = $btn.closest('tr');
        $row.fadeOut(300, function() {
          $row.remove();

          // If no more rows, show "no items" message
          if (!$('.product-additions-list').find('tbody tr').length) {
            $('.product-additions-list').find('table').remove();
            $('.product-additions-list').append('<div class="no-items">No relationships have been created yet.</div>');
          }
        });

        // Show success message
        this.showMessage('success', response.message);
      })
      .catch(error => {
        // Show error message
        this.showMessage('error', error.message || 'Error deleting relationship. Please try again.');
        $btn.prop('disabled', false).text('Delete');
        log('ProductAdditionsSettingsModule', 'Error deleting relationship:', error);
      });
  }

  /**
   * Search products based on search term and category
   * @param {string} searchTerm Search term
   * @param {number} categoryId Category ID
   */
  searchProducts(searchTerm, categoryId) {
    const $ = jQuery;

    if (!searchTerm || !categoryId) {
      $('#product-search-results').html('<p>Please enter search term and select a category</p>');
      return;
    }

    $('#product-search-results').html('<p>Searching...</p>');

    // Use ajax utility for the search request
    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: {
        action: 'search_category_products',
        nonce: this.settings.nonce,
        search: searchTerm,
        category: categoryId
      }
    })
      .then(response => {
        if (response.products && response.products.length > 0) {
          let resultsHtml = '<ul class="product-results-list">';

          response.products.forEach(function(product) {
            resultsHtml += `
              <li class="product-result-item" data-id="${product.id}" data-name="${product.name}">
                ${product.name} (ID: ${product.id})
              </li>
            `;
          });

          resultsHtml += '</ul>';
          $('#product-search-results').html(resultsHtml);
        } else {
          $('#product-search-results').html('<p>No products found</p>');
        }
      })
      .catch(error => {
        log('ProductAdditionsSettingsModule', 'AJAX error:', error);
        $('#product-search-results').html('<p>Error searching products</p>');
      });
  }

  /**
   * Load product details by ID
   * @param {number} productId Product ID
   */
  loadProductDetails(productId) {
    const $ = jQuery;

    if (!productId) {
      return;
    }

    // Use ajax utility for the request
    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: {
        action: 'get_product_details',
        nonce: this.settings.nonce,
        product_id: productId
      }
    })
      .then(response => {
        if (response.product) {
          const product = response.product;

          // Set the selected product
          $('#selected_product_id').val(product.id);
          $('.selected-product-info').html(`<strong>${product.name}</strong> (ID: ${product.id})`);
          $('#selected-product').show();
        } else {
          log('ProductAdditionsSettingsModule', 'Failed to load product details:', response);
        }
      })
      .catch(error => {
        log('ProductAdditionsSettingsModule', 'AJAX error while loading product details:', error);
      });
  }

  /**
   * Create a table row for a relation
   * @param {Object} relation The relation data
   * @return {jQuery} The created row
   */
  createRelationRow(relation) {
    const $ = jQuery;

    if (!relation || !relation.id) {
      log('ProductAdditionsSettingsModule', 'Invalid relation data', relation);
      return $('<tr><td colspan="4">Error: Invalid relation data</td></tr>');
    }

    const $row = $('<tr></tr>').attr('data-id', relation.id);

    // Source categories
    const sourceName = relation.source_name || '';
    $row.append($('<td></td>').text(sourceName));

    // Relation type
    const $typeCell = $('<td></td>');
    const $typeSpan = $('<span></span>')
      .addClass('relation-type')
      .addClass(relation.relation_type || '');

    // Set appropriate label based on relation type
    let relation_type_label = '';
    if (relation.relation_type === 'auto_add_by_category') {
      relation_type_label = 'Auto add product with Category';
    } else if (relation.relation_type === 'auto_add_note_by_category') {
      relation_type_label = 'Auto add note with Category';
    } else if (relation.relation_type === 'suggest_products_by_category') {
      relation_type_label = 'Suggest products when Category';
    } else {
      relation_type_label = relation.relation_type_label || '';
    }

    $typeSpan.text(relation_type_label);
    $typeCell.append($typeSpan);
    $row.append($typeCell);

    // Target product cell or Note text
    const $targetCell = $('<td></td>');
    if (relation.relation_type === 'auto_add_by_category') {
      if (relation.product_name) {
        $targetCell.text(relation.product_name);
      } else if (relation.target_name) {
        $targetCell.text(relation.target_name + ' (Category)');
      }
    } else if (relation.relation_type === 'auto_add_note_by_category') {
      // For note type, we display a preview of the note text
      const notePreview = relation.note_text && relation.note_text.length > 50 ?
        format.truncateText(relation.note_text, 50) : // Using format utility
        relation.note_text || '';
      $targetCell.text(notePreview);
    } else if (relation.relation_type === 'suggest_products_by_category') {
      // For suggestion type, show the target category
      if (relation.target_name) {
        $targetCell.text(relation.target_name + ' (Category)');
      }
    }
    $row.append($targetCell);

    // Action buttons
    const $actionsCell = $('<td></td>').addClass('actions');

    const sourceStr = Array.isArray(relation.source_category) ?
      relation.source_category.join(',') :
      (relation.source_category || '');

    // Use dom utility to create buttons
    const editBtn = dom.createElement('button', {
      className: 'button button-small edit-relation',
      type: 'button',
      dataset: {
        id: relation.id,
        source: sourceStr,
        target: relation.target_category || '',
        productId: relation.product_id || '',
        type: relation.relation_type || '',
        noteText: relation.note_text || ''
      }
    }, 'Edit');

    const deleteBtn = dom.createElement('button', {
      className: 'button button-small delete-relation',
      type: 'button',
      dataset: {
        id: relation.id
      }
    }, 'Delete');

    // Convert DOM elements to jQuery and append
    $actionsCell.append($(editBtn), ' ', $(deleteBtn));
    $row.append($actionsCell);

    return $row;
  }

  /**
   * Append a relation row to the table
   * @param {Object} relation The relation data
   */
  appendRelationRow(relation) {
    const $ = jQuery;

    if (!relation || !relation.id) {
      log('ProductAdditionsSettingsModule', 'Cannot append row: Invalid relation data', relation);
      return;
    }

    const $table = $('.product-additions-table');
    if (!$table.length) {
      log('ProductAdditionsSettingsModule', 'Cannot append row: Table not found');
      return;
    }

    const $tbody = $table.find('tbody');
    if (!$tbody.length) {
      log('ProductAdditionsSettingsModule', 'Cannot append row: Table body not found');
      return;
    }

    const $row = this.createRelationRow(relation);
    $tbody.append($row);
  }

  /**
   * Show a notice message
   * @param {string} type The notice type ('success' or 'error')
   * @param {string} message The message to display
   */
  showMessage(type, message) {
    const $ = jQuery;
    const $container = $('.product-estimator-additions');

    if (!$container.length) {
      log('ProductAdditionsSettingsModule', 'Cannot show notice: Container not found');
      return;
    }

    const $existingNotice = $container.find('.notice');

    // Remove existing notices
    if ($existingNotice.length) {
      $existingNotice.remove();
    }

    // Use the validation utility if available, or create a notice manually
    if (typeof validation.showNotice === 'function') {
      validation.showNotice(message, type);
    } else {
      // Create new notice using dom utility
      const notice = dom.createElement('div', {
        className: `notice ${type === 'success' ? 'notice-success' : 'notice-error'}`
      });
      const paragraph = dom.createElement('p', {}, message);
      notice.appendChild(paragraph);

      // Insert notice at the top of the container
      $container.prepend($(notice));

      // Auto-remove after 5 seconds
      setTimeout(function() {
        $(notice).fadeOut(500, function() {
          $(this).remove();
        });
      }, 5000);
    }
  }
}

// Initialize when document is ready
jQuery(document).ready(function() {
  // Only initialize if we're on the correct tab
  const currentTab = jQuery('#product_additions');
  if (currentTab.length && currentTab.is(':visible')) {
    const module = new ProductAdditionsSettingsModule();
    window.ProductAdditionsSettingsModule = module;
  } else {
    // Listen for tab change events to initialize when our tab becomes visible
    jQuery(document).on('product_estimator_tab_changed', function(e, tabId) {
      if (tabId === 'product_additions') {
        setTimeout(function() {
          const module = new ProductAdditionsSettingsModule();
          window.ProductAdditionsSettingsModule = module;
        }, 100);
      }
    });
  }
});

export default ProductAdditionsSettingsModule;
