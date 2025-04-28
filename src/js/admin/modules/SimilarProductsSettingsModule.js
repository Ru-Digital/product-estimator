/**
 * Similar Products Admin JavaScript
 *
 * Handles interactive elements on the Similar Products settings page
 */
import { ajax, dom, validation, log } from '@utils';

class SimilarProductsSettingsModule {
  /**
   * Initialize the module
   */
  constructor() {
    // Store localized data with fallbacks
    this.l10n = window.similarProductsL10n || {
      nonce: '',
      loading_attributes: 'Loading attributes...',
      select_category: 'Please select categories first.',
      no_attributes: 'No product attributes found for these categories.',
      error_loading: 'Error loading attributes. Please try again.',
      saving: 'Saving...',
      rule_saved: 'Rule saved successfully!',
      error_saving: 'Error saving rule. Please try again.',
      confirm_delete: 'Are you sure you want to delete this rule?',
      error_deleting: 'Error deleting rule. Please try again.',
      select_category_error: 'Please select at least one source category.',
      select_attributes_error: 'Please select at least one attribute.'
    };

    // Initialize when document is ready
    jQuery(document).ready(() => this.init());
  }

  /**
   * Initialize when document is ready
   */
  init() {
    const $ = jQuery;

    // Only run on similar products settings page
    if (!$('.product-estimator-similar-products-settings').length) {
      return;
    }

    log('SimilarProductsSettingsModule', 'Initializing Similar Products Settings Module');

    // Add new rule button
    $('.add-new-rule').on('click', this.addNewRule.bind(this));

    // Initialize existing rules
    this.initializeExistingRules();

    // Initialize slider value display
    this.initializeSliders();
  }

  /**
   * Add a new rule to the interface
   */
  addNewRule() {
    const $ = jQuery;

    // Clone the template
    var $template = $('.rule-template').children().first().clone();

    // Generate a unique temporary ID
    var tempId = 'new_' + Math.random().toString(36).substr(2, 9);

    // Replace template ID with temp ID
    $template.attr('data-rule-id', tempId);
    $template.find('[name^="TEMPLATE_ID"]').each(function() {
      var newName = $(this).attr('name').replace('TEMPLATE_ID', tempId);
      $(this).attr('name', newName);
    });

    // Add to rules container
    $('.similar-products-rules').append($template);

    // Hide "no rules" message if visible
    $('.no-rules-message').hide();

    // Initialize the new rule
    this.initializeRule($template);

    // Open the new rule
    $template.addClass('open');
  }

  /**
   * Initialize all existing rules
   */
  initializeExistingRules() {
    const $ = jQuery;

    $('.similar-products-rule').each((index, element) => {
      this.initializeRule($(element));
    });
  }

  /**
   * Initialize a single rule
   * @param {jQuery} $rule The rule element
   */
  initializeRule($rule) {
    const $ = jQuery;
    const ruleId = $rule.data('rule-id');

    // Toggle rule expansion
    $rule.find('.rule-header').on('click', (e) => {
      if (!$(e.target).hasClass('delete-rule') && !$(e.target).hasClass('save-rule')) {
        $rule.toggleClass('open');
      }
    });

    // Category change handler
    $rule.find('.source-categories-select').on('change', (e) => {
      const categoryIds = $(e.target).val();
      if (categoryIds && categoryIds.length > 0) {
        this.loadCategoryAttributes(categoryIds, $rule);
      } else {
        // Clear attributes
        $rule.find('.attributes-list').empty()
          .html(`<p>${this.l10n.select_category}</p>`);
      }
    });

    // Delete rule button
    $rule.find('.delete-rule').on('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (confirm(this.l10n.confirm_delete)) {
        this.deleteRule(ruleId, $rule);
      }
    });

    // Save rule button
    $rule.find('.save-rule').on('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      this.saveRule(ruleId, $rule);
    });

    // If the rule has categories selected, load their attributes
    const selectedCategories = $rule.find('.source-categories-select').val();
    if (selectedCategories && selectedCategories.length > 0) {
      this.loadCategoryAttributes(selectedCategories, $rule);
    }

    // Initialize the threshold slider
    this.initializeSlider($rule.find('.similarity-threshold'));
  }

  /**
   * Initialize all threshold sliders
   */
  initializeSliders() {
    const $ = jQuery;

    $('.similarity-threshold').each((index, element) => {
      this.initializeSlider($(element));
    });
  }

  /**
   * Initialize a single threshold slider
   * @param {jQuery} $slider The slider element
   */
  initializeSlider($slider) {
    if (!$slider.length) return;

    // Update the displayed value when slider changes
    $slider.on('input change', function() {
      const value = $(this).val();
      $(this).closest('.slider-container').find('.similarity-threshold-value').text(value);
    });
  }

  /**
   * Load attributes for multiple categories
   * @param {Array} categoryIds Array of category IDs
   * @param {jQuery} $rule The rule element
   */
  loadCategoryAttributes(categoryIds, $rule) {
    const $ = jQuery;
    const $attributesList = $rule.find('.attributes-list');

    // Show loading state
    $attributesList
      .html(`<p>${this.l10n.loading_attributes}</p>`)
      .addClass('loading');

    // Use ajax utility for AJAX request
    ajax.ajaxRequest({
      url: ajaxurl,
      data: {
        action: 'get_category_attributes',
        nonce: this.l10n.nonce,
        category_ids: categoryIds
      }
    })
      .then(response => {
        this.renderAttributes(response.attributes, $rule);
      })
      .catch(error => {
        $attributesList
          .html(`<p class="error">${error.message || this.l10n.error_loading}</p>`)
          .removeClass('loading');

        log('SimilarProductsSettingsModule', 'Error loading attributes:', error);
      });
  }

  /**
   * Render attributes in the rule
   * @param {Array} attributes Array of attribute objects
   * @param {jQuery} $rule The rule element
   */
  renderAttributes(attributes, $rule) {
    const $ = jQuery;
    const $container = $rule.find('.attributes-list');
    $container.empty().removeClass('loading');

    if (!attributes || attributes.length === 0) {
      $container.html(`<p>${this.l10n.no_attributes}</p>`);
      return;
    }

    const ruleId = $rule.data('rule-id');
    const selectedAttributes = $rule.find('.selected-attributes').val();
    let selectedAttrs = [];

    if (selectedAttributes) {
      selectedAttrs = selectedAttributes.split(',');
    }

    attributes.forEach((attribute) => {
      const isChecked = selectedAttrs.indexOf(attribute.name) > -1;

      // Use dom utility to create attribute item
      const attributeItem = dom.createElement('div', {
        className: 'attribute-item'
      });

      // Create label element
      const label = dom.createElement('label', {}, [
        dom.createElement('input', {
          type: 'checkbox',
          name: `${ruleId}[attributes][]`,
          value: attribute.name,
          checked: isChecked
        }),
        dom.createElement('span', {}, attribute.label)
      ]);

      attributeItem.appendChild(label);
      $container.append(attributeItem);
    });
  }

  /**
   * Save a rule
   * @param {string} ruleId The rule ID
   * @param {jQuery} $rule The rule element
   */
  saveRule(ruleId, $rule) {
    const $ = jQuery;
    const $saveButton = $rule.find('.save-rule');
    const originalText = $saveButton.text();

    // Validate required fields
    const sourceCategories = $rule.find('.source-categories-select').val();
    if (!sourceCategories || sourceCategories.length === 0) {
      this.showMessage($rule, this.l10n.select_category_error, 'error');
      return;
    }

    const selectedAttributes = [];
    $rule.find('.attributes-list input[type="checkbox"]:checked').each(function() {
      selectedAttributes.push($(this).val());
    });

    if (selectedAttributes.length === 0) {
      this.showMessage($rule, this.l10n.select_attributes_error, 'error');
      return;
    }

    // Show saving state
    $saveButton.text(this.l10n.saving).prop('disabled', true);

    const similarityThreshold = $rule.find('.similarity-threshold').val();

    // Use ajax utility for the request
    ajax.ajaxRequest({
      url: ajaxurl,
      data: {
        action: 'save_similar_products_rule',
        nonce: this.l10n.nonce,
        rule_id: ruleId,
        source_categories: sourceCategories,
        attributes: selectedAttributes,
        similarity_threshold: similarityThreshold
      }
    })
      .then(data => {
        // Show success message
        this.showMessage($rule, this.l10n.rule_saved, 'success');

        // If this was a new rule, update its ID
        if (ruleId.startsWith('new_')) {
          $rule.attr('data-rule-id', data.rule_id);

          // Update all field names
          $rule.find(`[name^="${ruleId}"]`).each(function() {
            const newName = $(this).attr('name').replace(ruleId, data.rule_id);
            $(this).attr('name', newName);
          });
        }

        // Update rule title - show all selected category names
        const categoryNames = [];
        sourceCategories.forEach((catId) => {
          const catName = $rule.find(`.source-categories-select option[value="${catId}"]`).text();
          if (catName) {
            categoryNames.push(catName);
          }
        });

        if (categoryNames.length > 0) {
          $rule.find('.rule-title').text(categoryNames.join(', '));
        } else {
          $rule.find('.rule-title').text(this.l10n.select_category);
        }

        log('SimilarProductsSettingsModule', 'Rule saved successfully', data);
      })
      .catch(error => {
        this.showMessage($rule, error.message || this.l10n.error_saving, 'error');
        log('SimilarProductsSettingsModule', 'Error saving rule:', error);
      })
      .finally(() => {
        $saveButton.text(originalText).prop('disabled', false);
      });
  }

  /**
   * Delete a rule
   * @param {string} ruleId The rule ID
   * @param {jQuery} $rule The rule element
   */
  deleteRule(ruleId, $rule) {
    const $ = jQuery;

    // If this is a new rule that hasn't been saved, just remove it
    if (ruleId.startsWith('new_')) {
      $rule.remove();

      // Show "no rules" message if no rules left
      if ($('.similar-products-rule').length === 0) {
        $('.no-rules-message').show();
      }

      return;
    }

    // Otherwise, send AJAX request to delete from database
    // Use ajax utility for the request
    ajax.ajaxRequest({
      url: ajaxurl,
      data: {
        action: 'delete_similar_products_rule',
        nonce: this.l10n.nonce,
        rule_id: ruleId
      }
    })
      .then(data => {
        $rule.remove();

        // Show "no rules" message if no rules left
        if ($('.similar-products-rule').length === 0) {
          $('.no-rules-message').show();
        }

        log('SimilarProductsSettingsModule', 'Rule deleted successfully');
      })
      .catch(error => {
        this.showMessage($rule, error.message || this.l10n.error_deleting, 'error');
        log('SimilarProductsSettingsModule', 'Error deleting rule:', error);
      });
  }

  /**
   * Show a message in the rule
   * @param {jQuery} $rule The rule element
   * @param {string} message The message text
   * @param {string} type The message type ('success' or 'error')
   */
  showMessage($rule, message, type) {
    const $ = jQuery;

    // Use dom utility to create message element
    const messageElement = dom.createElement('div', {
      className: `rule-message ${type}`
    }, message);

    // Remove any existing messages
    $rule.find('.rule-message').remove();

    // Add the new message
    $rule.find('.rule-header').after($(messageElement));

    // Remove the message after 3 seconds
    setTimeout(() => {
      // Use dom utility for animation
      dom.removeElement(messageElement, true);
    }, 3000);
  }
}

// Initialize the module
jQuery(document).ready(function() {
  const module = new SimilarProductsSettingsModule();

  // Make it available globally
  window.SimilarProductsSettingsModule = module;
});

export default SimilarProductsSettingsModule;
