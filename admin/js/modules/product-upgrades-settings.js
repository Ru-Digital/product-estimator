/**
 * Product Upgrades Settings JavaScript
 *
 * Handles functionality specific to the product upgrades settings tab.
 */
(function($) {
  'use strict';

  // Access localized data with a fallback mechanism
  const adminSettings = window.productUpgradesSettings || {};

  // Create a safe reference to the settings object
  const ProductUpgradesAdmin = {
    ajaxUrl: adminSettings.ajax_url || (typeof ajaxurl !== 'undefined' ? ajaxurl : '/wp-admin/admin-ajax.php'),
    nonce: adminSettings.nonce || '',
    i18n: adminSettings.i18n || {},
    tab_id: adminSettings.tab_id || 'product_upgrades'
  };

  // Product Upgrades Settings Module
  const ProductUpgradesSettingsModule = {
    // Add a variable to track if the form has been modified
    formModified: false,

    /**
     * Initialize the module
     */
    init: function() {
      console.log('Initializing Product Upgrades Settings Module');
      // Reset form modified state on initialization
      this.formModified = false;
      this.bindEvents();
      this.setupFormHandling();
    },

    /**
     * Bind event handlers
     */
    bindEvents: function() {
      // Listen for tab changes
      $(document).on('product_estimator_tab_changed', this.handleTabChanged.bind(this));

      // Tab-specific handlers
      this.initUpgradeHandlers();

      // Track form changes
      $('#product-upgrade-form').on('change input', 'input, select, textarea', () => {
        this.formModified = true;

        // Update the global form change tracker if available
        if (typeof ProductEstimatorSettings !== 'undefined' &&
          typeof ProductEstimatorSettings.formChangeTrackers !== 'undefined') {
          ProductEstimatorSettings.formChangeTrackers[ProductUpgradesAdmin.tab_id] = true;

          // If this is the current tab, update the main formChanged flag
          if (ProductEstimatorSettings.currentTab === ProductUpgradesAdmin.tab_id) {
            ProductEstimatorSettings.formChanged = true;
          }
        }
      });
    },

    /**
     * Set up event handlers for the upgrade configuration management UI
     */
    initUpgradeHandlers: function() {
      const $container = $('.product-estimator-upgrades');
      const $form = $('#product-upgrade-form');
      const $formContainer = $('.product-upgrades-form');
      const $addButton = $('.add-new-upgrade');

      // Initialize Select2 for multiple selection
      $('#base_categories').select2({
        placeholder: 'Select base categories',
        width: '100%',
        dropdownCssClass: 'product-estimator-dropdown'
      });

      $('#upgrade_categories').select2({
        placeholder: 'Select upgrade categories',
        width: '100%',
        dropdownCssClass: 'product-estimator-dropdown'
      });

      // Show form when "Add New Upgrade Configuration" button is clicked
      $addButton.on('click', function() {
        console.log('Add New Upgrade Configuration button clicked');
        this.resetForm();
        $('.form-title').text(ProductUpgradesAdmin.i18n.addNew || 'Add New Upgrade Configuration');
        $('.save-upgrade').text(ProductUpgradesAdmin.i18n.saveChanges || 'Save Changes');
        $formContainer.slideDown();
      }.bind(this));

      // Hide form when "Cancel" button is clicked
      $('.cancel-form').on('click', function() {
        $formContainer.slideUp();
        this.resetForm();
      }.bind(this));

      // Handle form submission
      $form.on('submit', this.handleFormSubmission.bind(this));

      // Handle edit/delete upgrades via event delegation
      $('.product-upgrades-list').on('click', '.edit-upgrade', this.handleEditUpgrade.bind(this));
      $('.product-upgrades-list').on('click', '.delete-upgrade', this.handleDeleteUpgrade.bind(this));
    },

    /**
     * Set up form handling
     */
    setupFormHandling: function() {
      // Additional form setup if needed
    },

    /**
     * Handle tab changed event
     * @param {Event} e Tab changed event
     * @param {string} tabId The newly active tab ID
     */
    handleTabChanged: function(e, tabId) {
      // If our tab becomes active, refresh initialization
      if (tabId === ProductUpgradesAdmin.tab_id) {
        this.formModified = false; // Reset form modified state
        this.init();

        // Update the global form change tracker if available
        if (typeof ProductEstimatorSettings !== 'undefined' &&
          typeof ProductEstimatorSettings.formChangeTrackers !== 'undefined') {
          ProductEstimatorSettings.formChangeTrackers[ProductUpgradesAdmin.tab_id] = false;

          // If this is the current tab, update the main formChanged flag
          if (ProductEstimatorSettings.currentTab === ProductUpgradesAdmin.tab_id) {
            ProductEstimatorSettings.formChanged = false;
          }
        }
      }
    },

    /**
     * Reset the form to its initial state
     */
    resetForm: function() {
      const $form = $('#product-upgrade-form');
      $form[0].reset();
      $('#upgrade_id').val('');

      // Reset Select2 fields
      $('#base_categories').val(null).trigger('change');
      $('#upgrade_categories').val(null).trigger('change');
      $('#display_mode').val('dropdown').trigger('change');
      $('#upgrade_title').val('');
      $('#upgrade_description').val('');

      // Reset form modified state
      this.formModified = false;

      // Update the global form change tracker if available
      if (typeof ProductEstimatorSettings !== 'undefined' &&
        typeof ProductEstimatorSettings.formChangeTrackers !== 'undefined') {
        ProductEstimatorSettings.formChangeTrackers[ProductUpgradesAdmin.tab_id] = false;

        // If this is the current tab, update the main formChanged flag
        if (ProductEstimatorSettings.currentTab === ProductUpgradesAdmin.tab_id) {
          ProductEstimatorSettings.formChanged = false;
        }
      }
    },

    /**
     * Toggle form state (enable/disable inputs)
     * @param {boolean} enabled Whether to enable the form inputs
     */
    toggleFormState: function(enabled) {
      const $form = $('#product-upgrade-form');
      const $submitBtn = $form.find('.save-upgrade');
      const $cancelBtn = $form.find('.cancel-form');

      $form.find('input, select, textarea').prop('disabled', !enabled);
      $submitBtn.prop('disabled', !enabled);
      $cancelBtn.prop('disabled', !enabled);

      if (!enabled) {
        $submitBtn.text('Saving...');
      } else {
        $submitBtn.text($('#upgrade_id').val() ? 'Update Configuration' : 'Save Configuration');
      }

      // Special handling for Select2
      if (enabled) {
        $('#base_categories').prop('disabled', false).trigger('change');
        $('#upgrade_categories').prop('disabled', false).trigger('change');
      } else {
        $('#base_categories').prop('disabled', true).trigger('change');
        $('#upgrade_categories').prop('disabled', true).trigger('change');
      }
    },

    /**
     * Handle form submission
     * @param {Event} e Form submit event
     */
    handleFormSubmission: function(e) {
      e.preventDefault();

      const baseCategories = $('#base_categories').val();
      const upgradeCategories = $('#upgrade_categories').val();
      const displayMode = $('#display_mode').val();
      const upgradeTitle = $('#upgrade_title').val();
      const upgradeDescription = $('#upgrade_description').val();

      // Validate form
      if (!baseCategories || baseCategories.length === 0) {
        alert(ProductUpgradesAdmin.i18n.selectBaseCategories || 'Please select at least one base category');
        return;
      }

      if (!upgradeCategories || upgradeCategories.length === 0) {
        alert(ProductUpgradesAdmin.i18n.selectUpgradeCategories || 'Please select at least one upgrade category');
        return;
      }

      // Disable form while submitting
      this.toggleFormState(false);

      const formData = {
        action: 'save_product_upgrade',
        nonce: ProductUpgradesAdmin.nonce,
        upgrade_id: $('#upgrade_id').val(),
        base_categories: baseCategories,
        upgrade_categories: upgradeCategories,
        display_mode: displayMode,
        upgrade_title: upgradeTitle,
        upgrade_description: upgradeDescription
      };

      console.log('Sending form data:', formData);

      // Send AJAX request
      $.post(ProductUpgradesAdmin.ajaxUrl, formData, function(response) {
        console.log('Response received:', response);

        if (response.success) {
          // Show success message
          this.showNotice('success', response.data.message);

          // If editing an existing upgrade, replace the row
          if (formData.upgrade_id) {
            console.log('Updating existing upgrade:', formData.upgrade_id);
            const $existingRow = $('.product-upgrades-list').find(`tr[data-id="${formData.upgrade_id}"]`);
            if ($existingRow.length) {
              $existingRow.replaceWith(this.createUpgradeRow(response.data.upgrade));
            } else {
              // If the row doesn't exist (unlikely), append it
              this.appendUpgradeRow(response.data.upgrade);
            }
          } else {
            // For new upgrades, append the row
            this.appendUpgradeRow(response.data.upgrade);
          }

          // Hide the form and reset it
          $('.product-upgrades-form').slideUp();
          this.resetForm();

          // If this is the first upgrade, remove the "no items" message and create the table
          const $noItems = $('.product-upgrades-list').find('.no-items');
          if ($noItems.length) {
            $noItems.remove();

            // Create the table if it doesn't exist
            if (!$('.product-upgrades-list').find('table').length) {
              const tableHtml = `
                <table class="wp-list-table widefat fixed striped product-upgrades-table">
                  <thead>
                    <tr>
                      <th scope="col">${'Base Categories'}</th>
                      <th scope="col">${'Upgrade Categories'}</th>
                      <th scope="col">${'Display Mode'}</th>
                      <th scope="col">${'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              `;
              $('.product-upgrades-list').find('h3').after(tableHtml);
            }
          }

          // Reset form modified state
          this.formModified = false;

          // Update the global form change tracker if available
          if (typeof ProductEstimatorSettings !== 'undefined' &&
            typeof ProductEstimatorSettings.formChangeTrackers !== 'undefined') {
            ProductEstimatorSettings.formChangeTrackers[ProductUpgradesAdmin.tab_id] = false;

            // If this is the current tab, update the main formChanged flag
            if (ProductEstimatorSettings.currentTab === ProductUpgradesAdmin.tab_id) {
              ProductEstimatorSettings.formChanged = false;
            }
          }
        } else {
          // Show error message
          this.showNotice('error', response.data.message);
        }

        // Re-enable form
        this.toggleFormState(true);
      }.bind(this)).fail(function(xhr, status, error) {
        console.error('AJAX error:', status, error);
        console.error('Response text:', xhr.responseText);

        // Show generic error message for network/server failures
        this.showNotice('error', 'An error occurred while saving the upgrade configuration. Please try again.');
        this.toggleFormState(true);
      }.bind(this));
    },

    /**
     * Handle edit upgrade button click
     * @param {Event} e Click event
     */
    handleEditUpgrade: function(e) {
      const $btn = $(e.currentTarget);
      const upgradeId = $btn.data('id');
      const baseCategories = String($btn.data('base') || '').split(',').filter(Boolean);
      const upgradeCategories = String($btn.data('upgrade') || '').split(',').filter(Boolean);
      const displayMode = $btn.data('mode');
      const upgradeTitle = $btn.data('title');
      const upgradeDescription = $btn.data('description');

      console.log('Edit upgrade:', upgradeId, baseCategories, upgradeCategories, displayMode, upgradeTitle, upgradeDescription);

      // Reset form
      this.resetForm();

      // Populate form with existing data
      $('#upgrade_id').val(upgradeId);
      $('#display_mode').val(displayMode || 'dropdown').trigger('change');
      $('#upgrade_title').val(upgradeTitle || '');
      $('#upgrade_description').val(upgradeDescription || '');

      // Need to make sure Select2 has initialized
      setTimeout(function() {
        $('#base_categories').val(baseCategories).trigger('change');
        $('#upgrade_categories').val(upgradeCategories).trigger('change');
      }, 100);

      // Update form title and button text
      $('.form-title').text('Edit Upgrade Configuration');
      $('.save-upgrade').text('Update Configuration');

      // Show form
      $('.product-upgrades-form').slideDown();

      // Scroll to form
      $('html, body').animate({
        scrollTop: $('.product-upgrades-form').offset().top - 50
      }, 300);
    },

    /**
     * Handle delete upgrade button click
     * @param {Event} e Click event
     */
    handleDeleteUpgrade: function(e) {
      const $btn = $(e.currentTarget);
      const upgradeId = $btn.data('id');

      console.log('Delete upgrade:', upgradeId);

      if (!confirm(ProductUpgradesAdmin.i18n.confirmDelete || 'Are you sure you want to delete this upgrade configuration?')) {
        return;
      }

      // Disable button while processing
      $btn.prop('disabled', true).text('Deleting...');

      const data = {
        action: 'delete_product_upgrade',
        nonce: ProductUpgradesAdmin.nonce,
        upgrade_id: upgradeId
      };

      $.post(ProductUpgradesAdmin.ajaxUrl, data, function(response) {
        console.log('Delete response:', response);

        if (response.success) {
          // Remove row from table
          const $row = $btn.closest('tr');
          $row.fadeOut(300, function() {
            $row.remove();

            // If no more rows, show "no items" message
            if (!$('.product-upgrades-list').find('tbody tr').length) {
              $('.product-upgrades-list').find('table').remove();
              $('.product-upgrades-list').append('<div class="no-items">No upgrade configurations have been created yet.</div>');
            }
          });

          // Show success message
          this.showNotice('success', response.data.message);
        } else {
          // Show error message
          this.showNotice('error', response.data.message);
          $btn.prop('disabled', false).text('Delete');
        }
      }.bind(this)).fail(function(xhr, status, error) {
        console.error('AJAX error:', status, error);
        console.error('Response text:', xhr.responseText);

        // Show generic error message for network/server failures
        this.showNotice('error', 'An error occurred while deleting the upgrade configuration. Please try again.');
        $btn.prop('disabled', false).text('Delete');
      }.bind(this));
    },

    /**
     * Create a table row for an upgrade
     * @param {Object} upgrade The upgrade data
     * @return {jQuery} The created row
     */
    createUpgradeRow: function(upgrade) {
      if (!upgrade || !upgrade.id) {
        console.error('Invalid upgrade data', upgrade);
        return $('<tr><td colspan="4">Error: Invalid upgrade data</td></tr>');
      }

      const $row = $('<tr></tr>').attr('data-id', upgrade.id);

      // Base Categories
      const baseCategoryNames = upgrade.base_category_names || '';
      $row.append($('<td></td>').text(baseCategoryNames));

      // Upgrade Categories
      const upgradeCategoryNames = upgrade.upgrade_category_names || '';
      $row.append($('<td></td>').text(upgradeCategoryNames));

      // Display Mode
      const displayModes = {
        'dropdown': 'Dropdown',
        'radio': 'Radio Buttons',
        'tiles': 'Image Tiles'
      };
      const displayMode = displayModes[upgrade.display_mode] || 'Dropdown';
      $row.append($('<td></td>').text(displayMode));

      // Actions
      const $actionsCell = $('<td></td>').addClass('actions');

      const $editBtn = $('<button></button>')
        .addClass('button button-small edit-upgrade')
        .attr({
          'type': 'button',
          'data-id': upgrade.id,
          'data-base': Array.isArray(upgrade.base_categories) ? upgrade.base_categories.join(',') : '',
          'data-upgrade': Array.isArray(upgrade.upgrade_categories) ? upgrade.upgrade_categories.join(',') : '',
          'data-mode': upgrade.display_mode || 'dropdown',
          'data-title': upgrade.title || '',
          'data-description': upgrade.description || ''
        })
        .text('Edit');

      const $deleteBtn = $('<button></button>')
        .addClass('button button-small delete-upgrade')
        .attr({
          'type': 'button',
          'data-id': upgrade.id
        })
        .text('Delete');

      $actionsCell.append($editBtn, ' ', $deleteBtn);
      $row.append($actionsCell);

      return $row;
    },

    /**
     * Append an upgrade row to the table
     * @param {Object} upgrade The upgrade data
     */
    appendUpgradeRow: function(upgrade) {
      if (!upgrade || !upgrade.id) {
        console.error('Cannot append row: Invalid upgrade data', upgrade);
        return;
      }

      const $table = $('.product-upgrades-table');
      if (!$table.length) {
        console.error('Cannot append row: Table not found');
        return;
      }

      const $tbody = $table.find('tbody');
      if (!$tbody.length) {
        console.error('Cannot append row: Table body not found');
        return;
      }

      const $row = this.createUpgradeRow(upgrade);
      $tbody.append($row);
    },

    /**
     * Show a notice message
     * @param {string} type The notice type ('success' or 'error')
     * @param {string} message The message to display
     */
    showNotice: function(type, message) {
      const $container = $('.product-estimator-upgrades');
      if (!$container.length) {
        console.error('Cannot show notice: Container not found');
        return;
      }

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

      // Insert notice at the top of the container
      $container.prepend($notice);

      // Auto-remove after 5 seconds
      setTimeout(function() {
        $notice.fadeOut(500, function() {
          $notice.remove();
        });
      }, 5000);
    }
  };

  // Initialize when document is ready
  $(document).ready(function() {
    // Only initialize if we're on the correct tab
    const currentTab = $('#product_upgrades');
    if (currentTab.length && currentTab.is(':visible')) {
      ProductUpgradesSettingsModule.init();
    } else {
      // Listen for tab change events to initialize when our tab becomes visible
      $(document).on('product_estimator_tab_changed', function(e, tabId) {
        if (tabId === 'product_upgrades') {
          setTimeout(function() {
            ProductUpgradesSettingsModule.init();
          }, 100);
        }
      });
    }

    // Make the module available globally
    window.ProductUpgradesSettingsModule = ProductUpgradesSettingsModule;

    // Also make ProductUpgradesAdmin available for debugging
    window.ProductUpgradesAdmin = ProductUpgradesAdmin;
  });

})(jQuery);
