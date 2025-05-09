/**
 * Pricing Rules Settings JavaScript
 *
 * Handles functionality specific to the pricing rules settings tab.
 */
import { ajax, dom, validation } from '@utils';
import { createLogger } from '@utils';
const logger = createLogger('NetSuiteSettingsModule');

class PricingRulesSettingsModule {
  /**
   * Initialize the module
   */
  constructor() {
    // Access localized data with a fallback mechanism
    const settingsData = window.pricingRulesSettings || {};

    // Create a safe reference to the settings object
    this.settings = {
      ajaxUrl: settingsData.ajax_url || (typeof ajaxurl !== 'undefined' ? ajaxurl : '/wp-admin/admin-ajax.php'),
      nonce: settingsData.nonce || '',
      i18n: settingsData.i18n || {},
      tab_id: settingsData.tab_id || 'pricing_rules'
    };

    // Initialize when document is ready
    jQuery(document).ready(() => this.init());
  }

  /**
   * Initialize the module
   */
  init() {
    logger.log('Initializing Pricing Rules Settings Module');
    this.bindEvents();
    this.setupFormHandling();
    this.initializeDefaultSettingsForm();
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    const $ = jQuery;

    // Listen for tab changes
    $(document).on('product_estimator_tab_changed', this.handleTabChanged.bind(this));

    // Tab-specific handlers
    this.initRuleHandlers();
  }

  /**
   * Initialize default settings form
   */
  initializeDefaultSettingsForm() {
    const $ = jQuery;

    // Initialize default settings form with the main settings framework
    $('.default-pricing-form').on('submit', function(e) {
      e.preventDefault();

      // Use the main settings framework to save the settings
      if (typeof ProductEstimatorSettings !== 'undefined') {
        // Set the formChanged flag to trigger a save
        ProductEstimatorSettings.formChanged = true;

        // Submit the form using the main settings AJAX handler
        ProductEstimatorSettings.handleAjaxFormSubmit(e);
      }
    });
  }

  /**
   * Set up event handlers for the rule management UI
   */
  initRuleHandlers() {
    const $ = jQuery;
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
      logger.log('Add New Pricing Rule button clicked');
      this.resetForm();
      $('.form-title').text(this.settings.i18n.addNew || 'Add New Pricing Rule');
      $('.save-rule').text(this.settings.i18n.saveChanges || 'Save Changes');
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
  }

  /**
   * Set up form handling
   */
  setupFormHandling() {
    // Any additional setup for the form
  }

  /**
   * Handle tab changed event
   * @param {Event} e Tab changed event
   * @param {string} tabId The newly active tab ID
   */
  handleTabChanged(e, tabId) {
    // If our tab becomes active, refresh initialization
    if (tabId === this.settings.tab_id) {
      this.init();
    }
  }

  /**
   * Reset the form to its initial state
   */
  resetForm() {
    const $ = jQuery;
    const $form = $('#pricing-rule-form');
    $form[0].reset();
    $('#rule_id').val('');

    // Reset Select2 fields
    $('#categories').val(null).trigger('change');
  }

  /**
   * Toggle form state (enable/disable inputs)
   * @param {boolean} enabled Whether to enable the form inputs
   */
  toggleFormState(enabled) {
    const $ = jQuery;
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
  }

  /**
   * Handle form submission
   * @param {Event} e Form submit event
   */
  handleFormSubmission(e) {
    e.preventDefault();
    const $ = jQuery;

    const categories = $('#categories').val();
    const pricingMethod = $('#pricing_method').val();
    const pricingSource = $('#pricing_source').val();

    // Validate form
    if (!categories || categories.length === 0) {
      alert(this.settings.i18n.selectCategories || 'Please select at least one category');
      return;
    }

    if (!pricingMethod) {
      alert(this.settings.i18n.selectPricingMethod || 'Please select a pricing method');
      return;
    }

    if (!pricingSource) {
      alert(this.settings.i18n.selectPricingSource || 'Please select a pricing source');
      return;
    }

    // Disable form while submitting
    this.toggleFormState(false);

    const formData = {
      action: 'save_pricing_rule',
      nonce: this.settings.nonce,
      rule_id: $('#rule_id').val(),
      categories: categories,
      pricing_method: pricingMethod,
      pricing_source: pricingSource
    };

    logger.log('Sending form data:', formData);

    // Send AJAX request using the ajax utility
    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: formData
    })
      .then(data => {
        logger.log('Response received:', data);

        // Show success message
        this.showMessage('success', data.message);

        // If editing an existing rule, replace the row
        if (formData.rule_id) {
          logger.log('Updating existing rule:', formData.rule_id);
          const $existingRow = $('.pricing-rules-list').find(`tr[data-id="${formData.rule_id}"]`);
          if ($existingRow.length) {
            $existingRow.replaceWith(this.createRuleRow(data.rule));
          } else {
            // If the row doesn't exist (unlikely), append it
            this.appendRuleRow(data.rule);
          }
        } else {
          // For new rules, append the row
          this.appendRuleRow(data.rule);
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
      })
      .catch(error => {
        // Show error message
        this.showMessage('error', error.message || 'Error saving pricing rule. Please try again.');
        logger.error('Error saving pricing rule:', error);
      })
      .finally(() => {
        // Re-enable form
        this.toggleFormState(true);
      });
  }

  /**
   * Handle edit rule button click
   * @param {Event} e Click event
   */
  handleEditRule(e) {
    const $ = jQuery;
    const $btn = $(e.currentTarget);
    const ruleId = $btn.data('id');
    const categories = String($btn.data('categories')).split(',');
    const pricingMethod = $btn.data('method');
    const pricingSource = $btn.data('source');

    logger.log('Edit rule:', ruleId, categories, pricingMethod, pricingSource);

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
  }

  /**
   * Handle delete rule button click
   * @param {Event} e Click event
   */
  handleDeleteRule(e) {
    const $ = jQuery;
    const $btn = $(e.currentTarget);
    const ruleId = $btn.data('id');

    logger.log('Delete rule:', ruleId);

    if (!confirm(this.settings.i18n.confirmDelete || 'Are you sure you want to delete this pricing rule?')) {
      return;
    }

    // Disable button while processing
    $btn.prop('disabled', true).text('Deleting...');

    // Use ajax utility for the request
    ajax.ajaxRequest({
      url: this.settings.ajaxUrl,
      data: {
        action: 'delete_pricing_rule',
        nonce: this.settings.nonce,
        rule_id: ruleId
      }
    })
      .then(data => {
        logger.log('Delete response:', data);

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
        this.showMessage('success', data.message);
      })
      .catch(error => {
        // Show error message
        this.showMessage('error', error.message || 'Error deleting pricing rule. Please try again.');
        $btn.prop('disabled', false).text('Delete');
        logger.error('Error deleting rule:', error);
      });
  }

  /**
   * Create a table row for a rule
   * @param {Object} rule The rule data
   * @return {jQuery} The created row
   */
  createRuleRow(rule) {
    const $ = jQuery;
    const $row = $('<tr></tr>').attr('data-id', rule.id);

    $row.append($('<td></td>').text(rule.category_names));

    $row.append($('<td></td>').text(rule.pricing_label));

    const $actionsCell = $('<td></td>').addClass('actions');

    // Use dom utility to create buttons
    const editBtn = dom.createElement('button', {
      className: 'button button-small edit-rule',
      type: 'button',
      dataset: {
        id: rule.id,
        categories: Array.isArray(rule.categories) ? rule.categories.join(',') : '',
        method: rule.pricing_method,
        source: rule.pricing_source
      }
    }, 'Edit');

    const deleteBtn = dom.createElement('button', {
      className: 'button button-small delete-rule',
      type: 'button',
      dataset: {
        id: rule.id
      }
    }, 'Delete');

    // Convert DOM elements to jQuery and append
    $actionsCell.append($(editBtn), ' ', $(deleteBtn));
    $row.append($actionsCell);

    return $row;
  }

  /**
   * Append a rule row to the table
   * @param {Object} rule The rule data
   */
  appendRuleRow(rule) {
    const $ = jQuery;
    const $table = $('.pricing-rules-table');
    const $tbody = $table.find('tbody');
    const $row = this.createRuleRow(rule);

    $tbody.append($row);
  }

  /**
   * Show a notice message
   * @param {string} type The notice type ('success' or 'error')
   * @param {string} message The message to display
   */
  showMessage(type, message) {
    const $ = jQuery;
    const $container = $('.product-estimator-pricing-rules');
    const $existingNotice = $container.find('.notice');

    // Remove existing notices
    if ($existingNotice.length) {
      $existingNotice.remove();
    }

    // Use validation.showNotice if we're in a context where we can use it directly
    if (typeof ProductEstimatorSettings !== 'undefined' &&
      typeof ProductEstimatorSettings.showNotice === 'function') {
      ProductEstimatorSettings.showNotice(message, type);
      return;
    }

    // Otherwise create our own notice
    // Use dom utility to create the notice element
    const notice = dom.createElement('div', {
      className: `notice notice-${type === 'success' ? 'success' : 'error'}`
    });

    const paragraph = dom.createElement('p', {}, message);
    notice.appendChild(paragraph);

    // Insert notice after heading
    $container.find('h1, h3').first().after($(notice));

    // Auto-remove after 5 seconds
    setTimeout(function() {
      $(notice).fadeOut(500, function() {
        $(this).remove();
      });
    }, 5000);
  }
}

// Initialize when document is ready
jQuery(document).ready(function() {
  // Only initialize if we're on the correct tab
  const currentTab = jQuery('#pricing_rules');
  if (currentTab.length && currentTab.is(':visible')) {
    const module = new PricingRulesSettingsModule();
    window.PricingRulesSettingsModule = module;
  } else {
    // Listen for tab change events to initialize when our tab becomes visible
    jQuery(document).on('product_estimator_tab_changed', function(e, tabId) {
      if (tabId === 'pricing_rules') {
        setTimeout(function() {
          const module = new PricingRulesSettingsModule();
          window.PricingRulesSettingsModule = module;
        }, 100);
      }
    });
  }
});

export default PricingRulesSettingsModule;
