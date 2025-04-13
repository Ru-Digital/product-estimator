/**
 * Pricing Rules Settings JavaScript
 *
 * Handles functionality specific to the pricing rules settings tab.
 */
(function($) {
  'use strict';

  // Access localized data with a fallback mechanism
  const settingsData = window.pricingRulesSettings || {};

  // Create a safe reference to the settings object
  const PricingRulesData = {
    ajaxUrl: settingsData.ajax_url || (typeof ajaxurl !== 'undefined' ? ajaxurl : '/wp-admin/admin-ajax.php'),
    nonce: settingsData.nonce || '',
    i18n: settingsData.i18n || {},
    tab_id: settingsData.tab_id || 'pricing_rules'
  };

  // Pricing Rules Settings Module
  const PricingRulesSettingsModule = {
    /**
     * Initialize the module
     */
    init: function() {
      console.log('Initializing Pricing Rules Settings Module');
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
      this.initRuleHandlers();
    },

    /**
     * Set up event handlers for the rule management UI
     */
    initRuleHandlers: function() {
      const $container = $('.product-estimator-pricing-rules');
      const $form = $('#pricing-rule-form');
      const $formContainer = $('.pricing-rules-form');
      const $addButton = $('.add-new-rule');

      // Initialize Select2 for multiple selection
      $('#categories').select2({
        placeholder: 'Select categories',
        width: '100%',
        dropdownCssClass: 'product-estimator-dropdown'
      });

      // Show form when "Add New Pricing Rule" button is clicked
      $addButton.on('click', function() {
        console.log('Add New Pricing Rule button clicked');
        this.resetForm();
        $('.form-title').text(PricingRulesData.i18n.addNew || 'Add New Pricing Rule');
        $('.save-rule').text(PricingRulesData.i18n.saveChanges || 'Save Changes');
        $formContainer.slideDown();
      }.bind(this));

      // Hide form when "Cancel" button is clicked
      $('.cancel-form').on('click', function() {
        $formContainer.slideUp();
        this.resetForm();
      }.bind(this));

      // Handle form submission
      $form.on('submit', this.handleFormSubmission.bind(this));

      // Handle edit/delete rules via event delegation
      $('.pricing-rules-list').on('click', '.edit-rule', this.handleEditRule.bind(this));
      $('.pricing-rules-list').on('click', '.delete-rule', this.handleDeleteRule.bind(this));
    },

    /**
     * Set up form handling
     */
    setupFormHandling: function() {
      // Any additional setup for the form
    },

    /**
     * Handle tab changed event
     * @param {Event} e Tab changed event
     * @param {string} tabId The newly active tab ID
     */
    handleTabChanged: function(e, tabId) {
      // If our tab becomes active, refresh initialization
      if (tabId === PricingRulesData.tab_id) {
        this.init();
      }
    },

    /**
     * Reset the form to its initial state
     */
    resetForm: function() {
      const $form = $('#pricing-rule-form');
      $form[0].reset();
      $('#rule_id').val('');

      // Reset Select2 fields
      $('#categories').val(null).trigger('change');
    },

    /**
     * Toggle form state (enable/disable inputs)
     * @param {boolean} enabled Whether to enable the form inputs
     */
    toggleFormState: function(enabled) {
      const $form = $('#pricing-rule-form');
      const $submitBtn = $form.find('.save-rule');
      const $cancelBtn = $form.find('.cancel-form');

      $form.find('input, select').prop('disabled', !enabled);
      $submitBtn.prop('disabled', !enabled);
      $cancelBtn.prop('disabled', !enabled);

      if (!enabled) {
        $submitBtn.text('Saving...');
      } else {
        $submitBtn.text($('#rule_id').val() ? 'Update Pricing Rule' : 'Save Pricing Rule');
      }

      // Special handling for Select2
      if (enabled) {
        $('#categories').prop('disabled', false).trigger('change');
      } else {
        $('#categories').prop('disabled', true).trigger('change');
      }
    },

    /**
     * Handle form submission
     * @param {Event} e Form submit event
     */
    handleFormSubmission: function(e) {
      e.preventDefault();

      const categories = $('#categories').val();
      const pricingMethod = $('#pricing_method').val();
      const pricingSource = $('#pricing_source').val();

      // Validate form
      if (!categories || categories.length === 0) {
        alert(PricingRulesData.i18n.selectCategories || 'Please select at least one category');
        return;
      }

      if (!pricingMethod) {
        alert(PricingRulesData.i18n.selectPricingMethod || 'Please select a pricing method');
        return;
      }

      if (!pricingSource) {
        alert(PricingRulesData.i18n.selectPricingSource || 'Please select a pricing source');
        return;
      }

      // Disable form while submitting
      this.toggleFormState(false);

      const formData = {
        action: 'save_pricing_rule',
        nonce: PricingRulesData.nonce,
        rule_id: $('#rule_id').val(),
        categories: categories,
        pricing_method: pricingMethod,
        pricing_source: pricingSource
      };

      console.log('Sending form data:', formData);

      // Send AJAX request
      $.post(PricingRulesData.ajaxUrl, formData, function(response) {
        console.log('Response received:', response);

        if (response.success) {
          // Show success message
          this.showNotice('success', response.data.message);

          // If editing an existing rule, replace the row
          if (formData.rule_id) {
            console.log('Updating existing rule:', formData.rule_id);
            const $existingRow = $('.pricing-rules-list').find(`tr[data-id="${formData.rule_id}"]`);
            if ($existingRow.length) {
              $existingRow.replaceWith(this.createRuleRow(response.data.rule));
            } else {
              // If the row doesn't exist (unlikely), append it
              this.appendRuleRow(response.data.rule);
            }
          } else {
            // For new rules, append the row
            this.appendRuleRow(response.data.rule);
          }

          // Hide the form and reset it
          $('.pricing-rules-form').slideUp();
          this.resetForm();

          // If this is the first rule, remove the "no items" message and create the table
          const $noItems = $('.pricing-rules-list').find('.no-items');
          if ($noItems.length) {
            $noItems.remove();

            // Create the table if it doesn't exist
            if (!$('.pricing-rules-list').find('table').length) {
              const tableHtml = `
                <table class="wp-list-table widefat fixed striped pricing-rules-table">
                  <thead>
                    <tr>
                      <th scope="col">${'Categories'}</th>
                      <th scope="col">${'Pricing Method'}</th>
                      <th scope="col">${'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              `;
              $('.pricing-rules-list').find('h3').after(tableHtml);
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
        this.showNotice('error', 'An error occurred while saving the pricing rule. Please try again.');
        this.toggleFormState(true);
      }.bind(this));
    },

    /**
     * Handle edit rule button click
     * @param {Event} e Click event
     */
    handleEditRule: function(e) {
      const $btn = $(e.currentTarget);
      const ruleId = $btn.data('id');
      const categories = String($btn.data('categories')).split(',');
      const pricingMethod = $btn.data('method');
      const pricingSource = $btn.data('source');

      console.log('Edit rule:', ruleId, categories, pricingMethod, pricingSource);

      // Reset form
      this.resetForm();

      // Populate form with existing data
      $('#rule_id').val(ruleId);
      $('#pricing_method').val(pricingMethod);
      $('#pricing_source').val(pricingSource);

      // Need to make sure Select2 has initialized
      setTimeout(function() {
        $('#categories').val(categories).trigger('change');
      }, 100);

      // Update form title and button text
      $('.form-title').text('Edit Pricing Rule');
      $('.save-rule').text('Update Pricing Rule');

      // Show form
      $('.pricing-rules-form').slideDown();

      // Scroll to form
      $('html, body').animate({
        scrollTop: $('.pricing-rules-form').offset().top - 50
      }, 300);
    },

    /**
     * Handle delete rule button click
     * @param {Event} e Click event
     */
    handleDeleteRule: function(e) {
      const $btn = $(e.currentTarget);
      const ruleId = $btn.data('id');

      console.log('Delete rule:', ruleId);

      if (!confirm(PricingRulesData.i18n.confirmDelete || 'Are you sure you want to delete this pricing rule?')) {
        return;
      }

      // Disable button while processing
      $btn.prop('disabled', true).text('Deleting...');

      const data = {
        action: 'delete_pricing_rule',
        nonce: PricingRulesData.nonce,
        rule_id: ruleId
      };

      $.post(PricingRulesData.ajaxUrl, data, function(response) {
        console.log('Delete response:', response);

        if (response.success) {
          // Remove row from table
          const $row = $btn.closest('tr');
          $row.fadeOut(300, function() {
            $row.remove();

            // If no more rows, show "no items" message
            if (!$('.pricing-rules-list').find('tbody tr').length) {
              $('.pricing-rules-list').find('table').remove();
              $('.pricing-rules-list').append('<div class="no-items">No pricing rules have been created yet.</div>');
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
        this.showNotice('error', 'An error occurred while deleting the pricing rule. Please try again.');
        $btn.prop('disabled', false).text('Delete');
      }.bind(this));
    },

    /**
     * Create a table row for a rule
     * @param {Object} rule The rule data
     * @return {jQuery} The created row
     */
    createRuleRow: function(rule) {
      const $row = $('<tr></tr>').attr('data-id', rule.id);

      $row.append($('<td></td>').text(rule.category_names));

      $row.append($('<td></td>').text(rule.pricing_label));

      const $actionsCell = $('<td></td>').addClass('actions');

      const $editBtn = $('<button></button>')
        .addClass('button button-small edit-rule')
        .attr({
          'type': 'button',
          'data-id': rule.id,
          'data-categories': Array.isArray(rule.categories) ? rule.categories.join(',') : rule.categories,
          'data-method': rule.pricing_method,
          'data-source': rule.pricing_source
        })
        .text('Edit');

      const $deleteBtn = $('<button></button>')
        .addClass('button button-small delete-rule')
        .attr({
          'type': 'button',
          'data-id': rule.id
        })
        .text('Delete');

      $actionsCell.append($editBtn, ' ', $deleteBtn);
      $row.append($actionsCell);

      return $row;
    },

    /**
     * Append a rule row to the table
     * @param {Object} rule The rule data
     */
    appendRuleRow: function(rule) {
      const $table = $('.pricing-rules-table');
      const $tbody = $table.find('tbody');
      const $row = this.createRuleRow(rule);

      $tbody.append($row);
    },

    /**
     * Show a notice message
     * @param {string} type The notice type ('success' or 'error')
     * @param {string} message The message to display
     */
    showNotice: function(type, message) {
      const $container = $('.product-estimator-pricing-rules');
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
      $container.find('h1, h3').first().after($notice);

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
    const currentTab = $('#pricing_rules');
    if (currentTab.length && currentTab.is(':visible')) {
      PricingRulesSettingsModule.init();
    } else {
      // Listen for tab change events to initialize when our tab becomes visible
      $(document).on('product_estimator_tab_changed', function(e, tabId) {
        if (tabId === 'pricing_rules') {
          setTimeout(function() {
            PricingRulesSettingsModule.init();
          }, 100);
        }
      });
    }

    // Make the module available globally
    window.PricingRulesSettingsModule = PricingRulesSettingsModule;
  });

})(jQuery);
