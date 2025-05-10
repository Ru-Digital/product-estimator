/**
 * Similar Products Settings Module (Class-based)
 *
 * Handles functionality for the similar products settings tab in the admin area.
 */
import { createLogger } from '@utils';
const logger = createLogger('SimilarProductsSettings');
class SimilarProductsSettingsModule {
  /**
   * Constructor for SimilarProductsSettingsModule
   */
  constructor() {
    $ = jQuery; // Make jQuery available as $

    // Attempt to get settings from localized 'similarProducts' object
    // It's crucial that 'window.similarProducts' is defined by PHP (wp_localize_script)
    // before this script runs or at least before init() is called.
    const localizedSettings = window.similarProductsSettings || {};

    this.settings = {
      ajaxUrl: localizedSettings.ajaxUrl || (typeof ajaxurl !== 'undefined' ? ajaxurl : '/wp-admin/admin-ajax.php'),
      nonce: localizedSettings.nonce || '', // Fallback
      i18n: localizedSettings.i18n || {},   // Fallback
      tab_id: localizedSettings.tab_id || 'similar_products', // Fallback
    };

    // Defer initialization to document.ready to ensure DOM is loaded
    // and other scripts (like ProductEstimatorSettings potentially defining similarProducts) might have run.
    $(document).ready(() => {
      // Re-check localizedSettings in case they are defined by another script in document.ready
      const updatedLocalizedSettingsOnReady = window.similarProductsSettings || {};
      if (updatedLocalizedSettingsOnReady.nonce) {
        this.settings.nonce = updatedLocalizedSettingsOnReady.nonce;
      }

      this.init();
    });
  }

  /**
   * Initialize similar products functionality
   */
  init() {
    // Only run on similar products settings page
    if (!$('.product-estimator-similar-products-settings').length) {
      return;
    }

    logger.log('Initializing Similar Products Settings Module (Class-based)');

    if (!this.settings.nonce && window.similarProducts && window.similarProductsSettings.nonce) {
      logger.warn('Nonce was initially empty but found later. This might indicate a race condition.');
      this.settings.nonce = window.similarProductsSettings.nonce;
    } else if (!this.settings.nonce) {
      logger.error('Nonce is not available from window.similarProductsSettings. AJAX requests may fail.');
    }


    this.bindEvents();
    this.initializeExistingRules();
  }

  /**
   * Bind core event handlers
   */
  bindEvents() {
    $('.add-new-rule').on('click', this.addNewRule.bind(this));
    $(document).on('product_estimator_tab_changed', this.handleTabChanged.bind(this));
  }

  /**
   * Handle tab changed event
   * @param {Event} e Tab changed event
   * @param {string} tabId The newly active tab ID
   */
  handleTabChanged(e, tabId) {
    if (tabId === this.settings.tab_id) {
      logger.log('Tab changed to Similar Products, re-initializing rules.');
      this.initializeExistingRules(); // Re-initialize rules when tab becomes active
    }
  }

  /**
   * Add a new rule to the interface
   */
  addNewRule() {
    const $template = $('.rule-template').children().first().clone();
    const tempId = 'new_' + Math.random().toString(36).substr(2, 9);

    $template.attr('data-rule-id', tempId);
    $template.find('[name^="TEMPLATE_ID"]').each((i, el) => {
      const newName = $(el).attr('name').replace('TEMPLATE_ID', tempId);
      $(el).attr('name', newName);
    });

    $('.similar-products-rules').append($template);
    $('.no-rules-message').hide();
    this.initializeRule($template);
    $template.addClass('open');
  }

  /**
   * Initialize all existing rules
   */
  initializeExistingRules() {
    $('.similar-products-rule').each((index, element) => {
      this.initializeRule($(element));
    });
  }

  /**
   * Initialize a single rule
   * @param {jQuery} $rule The rule element
   */
  initializeRule($rule) {
    const ruleId = $rule.data('rule-id');

    $rule.find('.rule-header').off('click').on('click', (e) => { // Ensure event handlers are not duplicated
      if (!$(e.target).is('.delete-rule, .save-rule') && !$(e.target).parent().is('.delete-rule, .save-rule')) {
        $rule.toggleClass('open');
      }
    });

    const $categorySelect = $rule.find('.source-categories-select');
    if ($.fn.select2) {
      $categorySelect.select2({
        width: '100%',
        placeholder: 'Select categories',
        allowClear: true,
        closeOnSelect: false
      });
    }

    $categorySelect.off('change').on('change', (e) => {
      const categoryIds = $(e.target).val();
      if (categoryIds && categoryIds.length > 0) {
        this.loadCategoryAttributes(categoryIds, $rule);
      } else {
        $rule.find('.attributes-list').empty().html(`<p>${this.settings.select_category}</p>`);
      }
    });

    $rule.find('.delete-rule').off('click').on('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (confirm(this.settings.confirm_delete)) {
        this.deleteRule(ruleId, $rule);
      }
    });

    $rule.find('.save-rule').off('click').on('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.saveRule(ruleId, $rule);
    });

    const selectedCategories = $categorySelect.val();
    if (selectedCategories && selectedCategories.length > 0) {
      this.loadCategoryAttributes(selectedCategories, $rule);
    } else {
      // Ensure attributes list is cleared or shows select_category message if no categories selected on init
      $rule.find('.attributes-list').empty().html(`<p>${this.settings.select_category}</p>`);
    }
  }

  /**
   * Load attributes for multiple categories
   * @param {Array} categoryIds Array of category IDs
   * @param {jQuery} $rule The rule element
   */
  loadCategoryAttributes(categoryIds, $rule) {
    const $attributesList = $rule.find('.attributes-list');
    $attributesList.html(`<p>${this.settings.loading_attributes}</p>`).addClass('loading');

    $.ajax({
      url: this.settings.ajaxUrl,
      type: 'POST',
      dataType: 'json',
      data: {
        action: 'get_category_attributes',
        nonce: this.settings.nonce,
        category_ids: categoryIds
      },
      success: (response) => {
        if (response.success) {
          this.renderAttributes(response.data.attributes, $rule);
        } else {
          $attributesList.html(`<p class="error">${response.data.message || this.settings.error_loading}</p>`).removeClass('loading');
          logger.error('Error loading attributes:', response);
        }
      },
      error: (xhr, status, error) => {
        $attributesList.html(`<p class="error">${this.settings.error_loading}</p>`).removeClass('loading');
        logger.error('AJAX error loading attributes:', status, error);
      }
    });
  }

  /**
   * Render attributes in the rule
   * @param {Array} attributes Array of attribute objects
   * @param {jQuery} $rule The rule element
   */
  renderAttributes(attributes, $rule) {
    const $container = $rule.find('.attributes-list');
    $container.empty().removeClass('loading');

    if (!attributes || attributes.length === 0) {
      $container.html(`<p>${this.settings.no_attributes}</p>`);
      return;
    }

    const ruleId = $rule.data('rule-id');
    // Get previously selected attributes IF they exist (e.g. loading an existing rule)
    // This data could be on $rule itself or inside a hidden input.
    // For now, assuming new attributes are always unchecked unless present in `attributes` data itself if backend pre-selects.
    // If you have a hidden input storing selected attributes, you'd read it here.
    // For example: const selectedAttributesFromHiddenField = $rule.find('.selected-attributes-hidden-input').val();
    // const selectedAttrsArray = selectedAttributesFromHiddenField ? selectedAttributesFromHiddenField.split(',') : [];

    let html = '';
    attributes.forEach(attribute => {
      // const isChecked = selectedAttrsArray.includes(attribute.name); // If using a hidden field to store selections
      const isChecked = attribute.is_selected || false; // Assuming backend might send 'is_selected'
      html += `<div class="attribute-item">
                 <label>
                   <input type="checkbox" name="${ruleId}[attributes][]" value="${attribute.name}"${isChecked ? ' checked' : ''}>
                   <span>${attribute.label}</span>
                 </label>
               </div>`;
    });
    $container.html(html);
  }

  /**
   * Save a rule
   * @param {string} ruleId The rule ID
   * @param {jQuery} $rule The rule element
   */
  saveRule(ruleId, $rule) {
    const $saveButton = $rule.find('.save-rule');
    const originalText = $saveButton.text();

    const sourceCategories = $rule.find('.source-categories-select').val();
    if (!sourceCategories || sourceCategories.length === 0) {
      this.showMessage($rule, this.settings.select_category_error, 'error');
      return;
    }

    const selectedAttributes = [];
    $rule.find('.attributes-list input[type="checkbox"]:checked').each((i, el) => {
      selectedAttributes.push($(el).val());
    });

    if (selectedAttributes.length === 0) {
      this.showMessage($rule, this.settings.select_attributes_error, 'error');
      return;
    }

    $saveButton.text(this.settings.saving).prop('disabled', true);

    $.ajax({
      url: this.settings.ajaxUrl,
      type: 'POST',
      dataType: 'json',
      data: {
        action: 'save_similar_products_rule',
        nonce: this.settings.nonce,
        rule_id: ruleId,
        source_categories: sourceCategories,
        attributes: selectedAttributes
      },
      success: (response) => {
        if (response.success) {
          this.showMessage($rule, this.settings.rule_saved, 'success');
          let currentRuleId = ruleId;

          if (ruleId.startsWith('new_') && response.data.rule_id) {
            const newRuleId = response.data.rule_id;
            $rule.attr('data-rule-id', newRuleId);
            $rule.find(`[name^="${ruleId}"]`).each((i, el) => {
              const newName = $(el).attr('name').replace(ruleId, newRuleId);
              $(el).attr('name', newName);
            });
            currentRuleId = newRuleId; // update for title generation
          }

          const categoryNames = [];
          sourceCategories.forEach(catId => {
            const catName = $rule.find(`.source-categories-select option[value="${catId}"]`).text();
            if (catName) categoryNames.push(catName);
          });

          $rule.find('.rule-title').text(categoryNames.length > 0 ? categoryNames.join(', ') : 'Rule'); // Updated title
          logger.log('Rule saved successfully', response.data);
        } else {
          this.showMessage($rule, response.data.message || this.settings.error_saving, 'error');
          logger.error('Error saving rule:', response);
        }
      },
      error: (xhr, status, error) => {
        this.showMessage($rule, this.settings.error_saving, 'error');
        logger.error('AJAX error saving rule:', status, error);
      },
      complete: () => {
        $saveButton.text(originalText).prop('disabled', false);
      }
    });
  }

  /**
   * Delete a rule
   * @param {string} ruleId The rule ID
   * @param {jQuery} $rule The rule element
   */
  deleteRule(ruleId, $rule) {
    if (ruleId.startsWith('new_')) {
      $rule.remove();
      if ($('.similar-products-rule').length === 0) {
        $('.no-rules-message').show();
      }
      return;
    }

    $.ajax({
      url: this.settings.ajaxUrl,
      type: 'POST',
      dataType: 'json',
      data: {
        action: 'delete_similar_products_rule',
        nonce: this.settings.nonce,
        rule_id: ruleId
      },
      success: (response) => {
        if (response.success) {
          $rule.remove();
          if ($('.similar-products-rule').length === 0) {
            $('.no-rules-message').show();
          }
          logger.log('Rule deleted successfully');
        } else {
          this.showMessage($rule, response.data.message || this.settings.error_deleting, 'error');
          logger.error('Error deleting rule:', response);
        }
      },
      error: (xhr, status, error) => {
        this.showMessage($rule, this.settings.error_deleting, 'error');
        logger.error('AJAX error deleting rule:', status, error);
      }
    });
  }

  /**
   * Show a message in the rule
   * @param {jQuery} $rule The rule element
   * @param {string} message The message text
   * @param {string} type The message type ('success' or 'error')
   */
  showMessage($rule, message, type) {
    const $messageElement = $('<div>', {
      'class': `rule-message ${type}`,
      'text': message
    });

    $rule.find('.rule-message').remove();
    $rule.find('.rule-header').after($messageElement);

    setTimeout(() => {
      $messageElement.fadeOut(300, function() { this.remove(); });
    }, 3000);
  }
}

// Initialize the module when the DOM is ready.
// It will activate fully when its tab is displayed due to the tab change listener.
jQuery(document).ready(function() {
  // Check if the main container for this module's settings tab exists
  if (jQuery('#similar_products').length || jQuery('.product-estimator-similar-products-settings').length) {
    const similarProductsModule = new SimilarProductsSettingsModule();
    // Optional: Make it available globally for debugging or if other scripts need to call its methods
    window.SimilarProductsSettingsModuleInstance = similarProductsModule;
  } else {
    // logger.log('Similar Products settings tab/container not found, module not initialized.');
  }
});

export default SimilarProductsSettingsModule;
