/**
 * Category Relations Admin JavaScript
 *
 * JavaScript for managing category relationships in the admin area.
 *
 * @since      1.0.3
 * @package    Product_Estimator
 * @subpackage Product_Estimator/admin/js
 */

(function($) {
  'use strict';

  // Initialize the category relations admin functionality
  function initProductAdditionsAdmin() {
    console.log('Initializing Product Additions Admin');

    const $container = $('.product-estimator-additions');

    if (!$container.length) {
      console.log('Product Estimator Additions container not found');
      return;
    }

    const $form = $('#product-addition-form');
    const $formContainer = $('.product-additions-form');
    const $addButton = $('.add-new-relation');
    const $formTitle = $('.form-title');
    const $saveButton = $('.save-relation');
    const $cancelButton = $('.cancel-form');
    const $relationsList = $('.product-additions-list');
    const $relationTypeSelect = $('#relation_type');
    const $targetCategoryRow = $('.target-category-row');
    const $targetCategorySelect = $('#target_category');
    const $productSearchRow = $('.product-search-row');
    const $productSearch = $('#product_search');
    const $productSearchResults = $('#product-search-results');
    const $selectedProduct = $('#selected-product');
    const $selectedProductInfo = $('.selected-product-info');
    const $clearProductButton = $('.clear-product');
    const $selectedProductIdInput = $('#selected_product_id');
    const $noteRow = $('.note-row');
    const $noteTextarea = $('#note_text');

    // Add CSS for the new relationship type
    const newStyling = `
    .relation-type.suggest_products_by_category {
      background-color: #f0f7e6;
      color: #2e7d32;
    }
    `;
    $('<style>').text(newStyling).appendTo('head');

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

    // Handle action type change
    $relationTypeSelect.on('change', function() {
      const actionType = $(this).val();

      // Reset dependent fields
      $targetCategorySelect.val('').trigger('change');
      $productSearchRow.hide();
      $selectedProduct.hide();
      $selectedProductIdInput.val('');
      $noteRow.hide();
      $noteTextarea.val('');

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
      $productSearch.val('');
      $productSearchResults.empty();
      $selectedProduct.hide();
      $selectedProductIdInput.val('');

      if (categoryId && actionType === 'auto_add_by_category') {
        $productSearchRow.show();
      } else {
        $productSearchRow.hide();
      }
    });

    // Handle product search
    let searchTimeout;
    $productSearch.on('keyup', function() {
      const searchTerm = $(this).val();
      const categoryId = $targetCategorySelect.val();

      clearTimeout(searchTimeout);

      if (searchTerm.length < 3) {
        $productSearchResults.empty();
        return;
      }

      searchTimeout = setTimeout(function() {
        searchProducts(searchTerm, categoryId);
      }, 500);
    });

    // Function to search products
    function searchProducts(searchTerm, categoryId) {
      $productSearchResults.html('<p>Searching...</p>');

      $.ajax({
        url: ProductEstimatorAdmin.ajaxUrl,
        type: 'POST',
        data: {
          action: 'search_category_products',
          nonce: ProductEstimatorAdmin.nonce,
          search: searchTerm,
          category: categoryId
        },
        success: function(response) {
          if (response.success && response.data.products.length > 0) {
            let resultsHtml = '<ul class="product-results-list">';

            response.data.products.forEach(function(product) {
              resultsHtml += `
                <li class="product-result-item" data-id="${product.id}" data-name="${product.name}">
                  ${product.name} (ID: ${product.id})
                </li>
              `;
            });

            resultsHtml += '</ul>';
            $productSearchResults.html(resultsHtml);

            // Remove any existing handlers first to prevent duplicates
            $(document).off('click', '.product-result-item');

            // Add click handler using event delegation
            $(document).on('click', '.product-result-item', function() {
              const productId = $(this).data('id');
              const productName = $(this).data('name');

              console.log('Product selected:', productId, productName);

              // Set the selected product
              $selectedProductIdInput.val(productId);
              console.log('Product ID set to:', $selectedProductIdInput.val());

              $selectedProductInfo.html(`<strong>${productName}</strong> (ID: ${productId})`);
              $selectedProduct.show();

              // Clear search
              $productSearch.val('');
              $productSearchResults.empty();
            });
          } else {
            $productSearchResults.html('<p>No products found</p>');
          }
        },
        error: function() {
          $productSearchResults.html('<p>Error searching products</p>');
        }
      });
    }

    // Handle clear product button
    $clearProductButton.on('click', function() {
      $selectedProductIdInput.val('');
      $selectedProductInfo.empty();
      $selectedProduct.hide();
    });

    // Show form when "Add New Relationship" button is clicked
    $addButton.on('click', function() {
      console.log('Add New Relationship button clicked');
      resetForm();
      $formTitle.text(ProductEstimatorAdmin.i18n.addNew || 'Add New Relationship');
      $saveButton.text(ProductEstimatorAdmin.i18n.saveChanges || 'Save Changes');
      $formContainer.slideDown();
    });

    // Hide form when "Cancel" button is clicked
    $cancelButton.on('click', function() {
      $formContainer.slideUp();
      resetForm();
    });

    // Handle form submission
    $form.on('submit', function(e) {
      e.preventDefault();

      const actionType = $relationTypeSelect.val();
      const sourceCategories = $('#source_category').val();
      const productId = $selectedProductIdInput.val();
      const noteText = $noteTextarea.val();

      // Validate form
      if (!actionType) {
        alert(ProductEstimatorAdmin.i18n.selectAction || 'Please select an action type');
        return;
      }

      if (!sourceCategories || sourceCategories.length === 0) {
        alert(ProductEstimatorAdmin.i18n.selectSourceCategories || 'Please select at least one source category');
        return;
      }

      if (actionType === 'auto_add_by_category') {
        const targetCategory = $targetCategorySelect.val();

        if (!targetCategory) {
          alert(ProductEstimatorAdmin.i18n.selectTargetCategory || 'Please select a target category');
          return;
        }

        if (!productId) {
          alert(ProductEstimatorAdmin.i18n.selectProduct || 'Please select a product');
          return;
        }
      } else if (actionType === 'suggest_products_by_category') {
        const targetCategory = $targetCategorySelect.val();

        if (!targetCategory) {
          alert(ProductEstimatorAdmin.i18n.selectTargetCategory || 'Please select a target category');
          return;
        }
      } else if (actionType === 'auto_add_note_by_category') {
        if (!noteText) {
          alert('Please enter a note text');
          return;
        }
      }

      // Disable form while submitting
      toggleFormState(false);

      const formData = {
        action: 'save_category_relation',
        nonce: ProductEstimatorAdmin.nonce,
        relation_id: $('#relation_id').val(),
        relation_type: actionType,
        source_category: sourceCategories,
        target_category: $targetCategorySelect.val(),
        product_id: productId,
        note_text: noteText
      };

      console.log('Sending form data:', formData);

      // Send AJAX request
      $.post(ProductEstimatorAdmin.ajaxUrl, formData, function(response) {
        console.log('Response received:', response);

        if (response.success) {
          // Show success message
          showNotice('success', response.data.message);

          // If editing an existing relation, replace the row
          if (formData.relation_id) {
            console.log('Updating existing relation:', formData.relation_id);
            const $existingRow = $relationsList.find(`tr[data-id="${formData.relation_id}"]`);
            if ($existingRow.length) {
              $existingRow.replaceWith(createRelationRow(response.data.relation));
            } else {
              // If the row doesn't exist (unlikely), append it
              appendRelationRow(response.data.relation);
            }
          } else {
            // For new relations, append the row and update the ID
            appendRelationRow(response.data.relation);
          }

          // Hide the form and reset it
          $formContainer.slideUp();
          resetForm();

          // If this is the first relation, remove the "no items" message and create the table
          const $noItems = $relationsList.find('.no-items');
          if ($noItems.length) {
            $noItems.remove();

            // Create the table if it doesn't exist
            if (!$relationsList.find('table').length) {
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
              $relationsList.find('h3').after(tableHtml);
            }
          }
        } else {
          // Show error message
          showNotice('error', response.data.message);
        }

        // Re-enable form
        toggleFormState(true);
      }).fail(function(xhr, status, error) {
        console.error('AJAX error:', status, error);
        console.error('Response text:', xhr.responseText);

        // Show generic error message for network/server failures
        showNotice('error', 'An error occurred while saving the relationship. Please try again.');
        toggleFormState(true);
      });
    });

    // Handle edit relation button click using event delegation
    $relationsList.on('click', '.edit-relation', function() {
      const $btn = $(this);
      const relationId = $btn.data('id');
      const sourceCategories = String($btn.data('source')).split(',');
      const targetCategory = $btn.data('target');
      const relationType = $btn.data('type');
      const productId = $btn.data('product-id');
      const noteText = $btn.data('note-text');

      console.log('Edit relation:', relationId, sourceCategories, targetCategory, relationType, productId, noteText);

      // Reset form
      resetForm();

      // Populate form with existing data
      $('#relation_id').val(relationId);
      $relationTypeSelect.val(relationType).trigger('change');

      // Need to make sure Select2 has initialized
      setTimeout(function() {
        $('#source_category').val(sourceCategories).trigger('change');

        // If it's auto_add_by_category, set target category and load product
        if (relationType === 'auto_add_by_category' && targetCategory) {
          $targetCategorySelect.val(targetCategory).trigger('change');

          // If we have a product ID, load its details
          if (productId) {
            loadProductDetails(productId);
          }
        } else if (relationType === 'suggest_products_by_category' && targetCategory) {
          // For suggest products, we just need the target category
          $targetCategorySelect.val(targetCategory).trigger('change');
        } else if (relationType === 'auto_add_note_by_category' && noteText) {
          // Set the note text
          $noteTextarea.val(noteText);
        }
      }, 100);

      // Update form title and button text
      $formTitle.text('Edit Category Relationship');
      $saveButton.text('Update Relationship');

      // Show form
      $formContainer.slideDown();

      // Scroll to form
      $('html, body').animate({
        scrollTop: $formContainer.offset().top - 50
      }, 300);
    });

    // Function to load product details by ID
    function loadProductDetails(productId) {
      $.ajax({
        url: ProductEstimatorAdmin.ajaxUrl,
        type: 'POST',
        data: {
          action: 'get_product_details',
          nonce: ProductEstimatorAdmin.nonce,
          product_id: productId
        },
        success: function(response) {
          if (response.success && response.data.product) {
            const product = response.data.product;

            // Set the selected product
            $selectedProductIdInput.val(product.id);
            $selectedProductInfo.html(`<strong>${product.name}</strong> (ID: ${product.id})`);
            $selectedProduct.show();
          }
        }
      });
    }

    // Handle delete relation button click using event delegation
    $relationsList.on('click', '.delete-relation', function() {
      const $btn = $(this);
      const relationId = $btn.data('id');

      console.log('Delete relation:', relationId);

      if (!confirm(ProductEstimatorAdmin.i18n.confirmDelete || 'Are you sure you want to delete this relationship?')) {
        return;
      }

      // Disable button while processing
      $btn.prop('disabled', true).text('Deleting...');

      const data = {
        action: 'delete_category_relation',
        nonce: ProductEstimatorAdmin.nonce,
        relation_id: relationId
      };

      $.post(ProductEstimatorAdmin.ajaxUrl, data, function(response) {
        console.log('Delete response:', response);

        if (response.success) {
          // Remove row from table
          const $row = $btn.closest('tr');
          $row.fadeOut(300, function() {
            $row.remove();

            // If no more rows, show "no items" message
            if (!$relationsList.find('tbody tr').length) {
              $relationsList.find('table').remove();
              $relationsList.append('<div class="no-items">No relationships have been created yet.</div>');
            }
          });

          // Show success message
          showNotice('success', response.data.message);
        } else {
          // Show error message
          showNotice('error', response.data.message);
          $btn.prop('disabled', false).text('Delete');
        }
      }).fail(function(xhr, status, error) {
        console.error('AJAX error:', status, error);
        console.error('Response text:', xhr.responseText);

        // Show generic error message for network/server failures
        showNotice('error', 'An error occurred while deleting the relationship. Please try again.');
        $btn.prop('disabled', false).text('Delete');
      });
    });
  }

  /**
   * Reset the form to its initial state
   */
  function resetForm() {
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
  }

  /**
   * Toggle form state (enable/disable inputs)
   *
   * @param {boolean} enabled - Whether to enable form inputs
   */
  function toggleFormState(enabled) {
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
   * Create a table row for a relation
   *
   * @param {Object} relation - The relation data
   * @return {jQuery} The created row
   */
  function createRelationRow(relation) {
    const $row = $('<tr></tr>').attr('data-id', relation.id);

    $row.append($('<td></td>').text(relation.source_name));

    const $typeCell = $('<td></td>');
    const $typeSpan = $('<span></span>')
      .addClass('relation-type')
      .addClass(relation.relation_type);

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
        relation.note_text.substring(0, 50) + '...' :
        relation.note_text || '';
      $targetCell.text(notePreview);
    } else if (relation.relation_type === 'suggest_products_by_category') {
      // For suggestion type, show the target category
      if (relation.target_name) {
        $targetCell.text(relation.target_name + ' (Category)');
      }
    }
    $row.append($targetCell);

    const $actionsCell = $('<td></td>').addClass('actions');

    const $editBtn = $('<button></button>')
      .addClass('button button-small edit-relation')
      .attr({
        'type': 'button',
        'data-id': relation.id,
        'data-source': Array.isArray(relation.source_category) ? relation.source_category.join(',') : relation.source_category,
        'data-target': relation.target_category || '',
        'data-product-id': relation.product_id || '',
        'data-type': relation.relation_type,
        'data-note-text': relation.note_text || ''
      })
      .text('Edit');

    const $deleteBtn = $('<button></button>')
      .addClass('button button-small delete-relation')
      .attr({
        'type': 'button',
        'data-id': relation.id
      })
      .text('Delete');

    $actionsCell.append($editBtn, ' ', $deleteBtn);
    $row.append($actionsCell);

    return $row;
  }

  /**
   * Append a relation row to the table
   *
   * @param {Object} relation - The relation data
   */
  function appendRelationRow(relation) {
    const $table = $('.product-additions-table');
    const $tbody = $table.find('tbody');
    const $row = createRelationRow(relation);

    $tbody.append($row);
  }

  /**
   * Show a notice message
   *
   * @param {string} type - The notice type ('success' or 'error')
   * @param {string} message - The message to display
   */
  function showNotice(type, message) {
    const $container = $('.product-estimator-additions');
    const $existingNotice = $container.find('.notice');

    // Remove existing notices
    if ($existingNotice.length) {
      $existingNotice.remove();
    }

    // Create new notice
    const $notice = $('<div></div>')
      .addClass('notice')
      .addClass(type === 'success' ? 'notice-success' : 'notice-error')
      .html(`<p>${message}</p>`);

    // Insert notice after heading
    $container.find('h1').after($notice);

    // Auto-remove after 5 seconds
    setTimeout(function() {
      $notice.fadeOut(500, function() {
        $notice.remove();
      });
    }, 5000);
  }

  // Initialize when document is ready
  $(document).ready(function() {
    console.log('Document ready, initializing Product Additions Admin');
    initProductAdditionsAdmin();
  });

})(jQuery);
