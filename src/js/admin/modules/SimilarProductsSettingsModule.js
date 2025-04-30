/**
 * Similar Products Settings Module
 *
 * Handles functionality for the similar products settings tab in the admin area.
 * Fixes syntax errors and improves integration with existing code.
 */

// Use explicit jQuery to avoid conflicts
(function($) {
  'use strict';

  // Global settings object
  var settings = {
    ajaxUrl: typeof ajaxurl !== 'undefined' ? ajaxurl : '/wp-admin/admin-ajax.php',
    nonce: similarProducts ? similarProducts.nonce : '',
    loading_attributes: similarProducts ? similarProducts.loading_attributes : 'Loading attributes...',
    select_category: similarProducts ? similarProducts.select_category : 'Please select categories first.',
    no_attributes: similarProducts ? similarProducts.no_attributes : 'No product attributes found for these categories.',
    error_loading: similarProducts ? similarProducts.error_loading : 'Error loading attributes. Please try again.',
    saving: similarProducts ? similarProducts.saving : 'Saving...',
    rule_saved: similarProducts ? similarProducts.rule_saved : 'Rule saved successfully!',
    error_saving: similarProducts ? similarProducts.error_saving : 'Error saving rule. Please try again.',
    confirm_delete: similarProducts ? similarProducts.confirm_delete : 'Are you sure you want to delete this rule?',
    error_deleting: similarProducts ? similarProducts.error_deleting : 'Error deleting rule. Please try again.',
    select_category_error: similarProducts ? similarProducts.select_category_error : 'Please select at least one source category.',
    select_attributes_error: similarProducts ? similarProducts.select_attributes_error : 'Please select at least one attribute.'
  };

  /**
   * Initialize similar products functionality
   */
  function init() {
    // Only run on similar products settings page
    if (!$('.product-estimator-similar-products-settings').length) {
      return;
    }

    console.log('Initializing Similar Products Settings Module');

    // Add new rule button
    $('.add-new-rule').on('click', addNewRule);

    // Initialize existing rules
    initializeExistingRules();

    // Initialize slider value display
    initializeSliders();

    // Listen for tab changes
    $(document).on('product_estimator_tab_changed', handleTabChanged);
  }

  /**
   * Handle tab changed event
   * @param {Event} e Tab changed event
   * @param {string} tabId The newly active tab ID
   */
  function handleTabChanged(e, tabId) {
    // If our tab becomes active, refresh any dynamic content
    if (tabId === 'similar_products') {
      // Re-initialize rules when tab becomes active
      initializeExistingRules();
      initializeSliders();
      console.log('Tab changed to Similar Products');
    }
  }

  /**
   * Add a new rule to the interface
   */
  function addNewRule() {
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
    initializeRule($template);

    // Open the new rule
    $template.addClass('open');
  }

  /**
   * Initialize all existing rules
   */
  function initializeExistingRules() {
    $('.similar-products-rule').each(function(index, element) {
      initializeRule($(element));
    });
  }

  /**
   * Initialize a single rule
   * @param {jQuery} $rule The rule element
   */
  function initializeRule($rule) {
    var ruleId = $rule.data('rule-id');

    // Toggle rule expansion
    $rule.find('.rule-header').on('click', function(e) {
      if (!$(e.target).hasClass('delete-rule') && !$(e.target).hasClass('save-rule')) {
        $rule.toggleClass('open');
      }
    });

    // Category change handler - initialize Select2 if available
    var $categorySelect = $rule.find('.source-categories-select');

    // Initialize Select2 for better multi-select if available
    if ($.fn.select2) {
      $categorySelect.select2({
        width: '100%',
        placeholder: 'Select categories',
        allowClear: true,
        closeOnSelect: false
      });
    }

    $categorySelect.on('change', function(e) {
      var categoryIds = $(e.target).val();
      if (categoryIds && categoryIds.length > 0) {
        loadCategoryAttributes(categoryIds, $rule);
      } else {
        // Clear attributes
        $rule.find('.attributes-list').empty()
          .html('<p>' + settings.select_category + '</p>');
      }
    });

    // Delete rule button
    $rule.find('.delete-rule').on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      if (confirm(settings.confirm_delete)) {
        deleteRule(ruleId, $rule);
      }
    });

    // Save rule button
    $rule.find('.save-rule').on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      saveRule(ruleId, $rule);
    });

    // If the rule has categories selected, load their attributes
    var selectedCategories = $categorySelect.val();
    if (selectedCategories && selectedCategories.length > 0) {
      loadCategoryAttributes(selectedCategories, $rule);
    }

    // Initialize the threshold slider
    initializeSlider($rule.find('.similarity-threshold'));
  }

  /**
   * Initialize all threshold sliders
   */
  function initializeSliders() {
    $('.similarity-threshold').each(function(index, element) {
      initializeSlider($(element));
    });
  }

  /**
   * Initialize a single threshold slider
   * @param {jQuery} $slider The slider element
   */
  function initializeSlider($slider) {
    if (!$slider.length) return;

    // Update the displayed value when slider changes
    $slider.on('input change', function() {
      var value = $(this).val();
      $(this).closest('.slider-container').find('.similarity-threshold-value').text(value);
    });
  }

  /**
   * Load attributes for multiple categories
   * @param {Array} categoryIds Array of category IDs
   * @param {jQuery} $rule The rule element
   */
  function loadCategoryAttributes(categoryIds, $rule) {
    var $attributesList = $rule.find('.attributes-list');

    // Show loading state
    $attributesList
      .html('<p>' + settings.loading_attributes + '</p>')
      .addClass('loading');

    // Make AJAX request to get attributes for these categories
    $.ajax({
      url: settings.ajaxUrl,
      type: 'POST',
      dataType: 'json',
      data: {
        action: 'get_category_attributes',
        nonce: settings.nonce,
        category_ids: categoryIds
      },
      success: function(response) {
        if (response.success) {
          renderAttributes(response.data.attributes, $rule);
        } else {
          $attributesList
            .html('<p class="error">' + (response.data.message || settings.error_loading) + '</p>')
            .removeClass('loading');
          console.error('Error loading attributes:', response);
        }
      },
      error: function(xhr, status, error) {
        $attributesList
          .html('<p class="error">' + settings.error_loading + '</p>')
          .removeClass('loading');
        console.error('AJAX error loading attributes:', status, error);
      }
    });
  }

  /**
   * Render attributes in the rule
   * @param {Array} attributes Array of attribute objects
   * @param {jQuery} $rule The rule element
   */
  function renderAttributes(attributes, $rule) {
    var $container = $rule.find('.attributes-list');
    $container.empty().removeClass('loading');

    if (!attributes || attributes.length === 0) {
      $container.html('<p>' + settings.no_attributes + '</p>');
      return;
    }

    var ruleId = $rule.data('rule-id');
    var selectedAttributes = $rule.find('.selected-attributes').val();
    var selectedAttrs = [];

    if (selectedAttributes) {
      selectedAttrs = selectedAttributes.split(',');
    }

    // Create HTML for attributes
    var html = '';
    $.each(attributes, function(index, attribute) {
      var isChecked = $.inArray(attribute.name, selectedAttrs) > -1;
      html += '<div class="attribute-item">';
      html += '<label>';
      html += '<input type="checkbox" name="' + ruleId + '[attributes][]" value="' + attribute.name + '"' + (isChecked ? ' checked' : '') + '>';
      html += '<span>' + attribute.label + '</span>';
      html += '</label>';
      html += '</div>';
    });

    $container.html(html);
  }

  /**
   * Save a rule
   * @param {string} ruleId The rule ID
   * @param {jQuery} $rule The rule element
   */
  function saveRule(ruleId, $rule) {
    var $saveButton = $rule.find('.save-rule');
    var originalText = $saveButton.text();

    // Validate required fields
    var sourceCategories = $rule.find('.source-categories-select').val();
    if (!sourceCategories || sourceCategories.length === 0) {
      showMessage($rule, settings.select_category_error, 'error');
      return;
    }

    var selectedAttributes = [];
    $rule.find('.attributes-list input[type="checkbox"]:checked').each(function() {
      selectedAttributes.push($(this).val());
    });

    if (selectedAttributes.length === 0) {
      showMessage($rule, settings.select_attributes_error, 'error');
      return;
    }

    // Show saving state
    $saveButton.text(settings.saving).prop('disabled', true);

    var similarityThreshold = $rule.find('.similarity-threshold').val();

    // Save data via AJAX
    $.ajax({
      url: settings.ajaxUrl,
      type: 'POST',
      dataType: 'json',
      data: {
        action: 'save_similar_products_rule',
        nonce: settings.nonce,
        rule_id: ruleId,
        source_categories: sourceCategories,
        attributes: selectedAttributes,
        similarity_threshold: similarityThreshold
      },
      success: function(response) {
        if (response.success) {
          // Show success message
          showMessage($rule, settings.rule_saved, 'success');

          // If this was a new rule, update its ID
          if (ruleId.startsWith('new_')) {
            var newRuleId = response.data.rule_id;
            $rule.attr('data-rule-id', newRuleId);

            // Update all field names
            $rule.find('[name^="' + ruleId + '"]').each(function() {
              var newName = $(this).attr('name').replace(ruleId, newRuleId);
              $(this).attr('name', newName);
            });
          }

          // Update rule title - show all selected category names
          var categoryNames = [];
          $.each(sourceCategories, function(i, catId) {
            var catName = $rule.find('.source-categories-select option[value="' + catId + '"]').text();
            if (catName) {
              categoryNames.push(catName);
            }
          });

          if (categoryNames.length > 0) {
            $rule.find('.rule-title').text(categoryNames.join(', '));
          } else {
            $rule.find('.rule-title').text(settings.select_category);
          }

          console.log('Rule saved successfully', response.data);
        } else {
          showMessage($rule, response.data.message || settings.error_saving, 'error');
          console.error('Error saving rule:', response);
        }
      },
      error: function(xhr, status, error) {
        showMessage($rule, settings.error_saving, 'error');
        console.error('AJAX error saving rule:', status, error);
      },
      complete: function() {
        $saveButton.text(originalText).prop('disabled', false);
      }
    });
  }

  /**
   * Delete a rule
   * @param {string} ruleId The rule ID
   * @param {jQuery} $rule The rule element
   */
  function deleteRule(ruleId, $rule) {
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
    $.ajax({
      url: settings.ajaxUrl,
      type: 'POST',
      dataType: 'json',
      data: {
        action: 'delete_similar_products_rule',
        nonce: settings.nonce,
        rule_id: ruleId
      },
      success: function(response) {
        if (response.success) {
          $rule.remove();

          // Show "no rules" message if no rules left
          if ($('.similar-products-rule').length === 0) {
            $('.no-rules-message').show();
          }

          console.log('Rule deleted successfully');
        } else {
          showMessage($rule, response.data.message || settings.error_deleting, 'error');
          console.error('Error deleting rule:', response);
        }
      },
      error: function(xhr, status, error) {
        showMessage($rule, settings.error_deleting, 'error');
        console.error('AJAX error deleting rule:', status, error);
      }
    });
  }

  /**
   * Show a message in the rule
   * @param {jQuery} $rule The rule element
   * @param {string} message The message text
   * @param {string} type The message type ('success' or 'error')
   */
  function showMessage($rule, message, type) {
    // Create message element
    var $messageElement = $('<div>', {
      'class': 'rule-message ' + type,
      'text': message
    });

    // Remove any existing messages
    $rule.find('.rule-message').remove();

    // Add the new message
    $rule.find('.rule-header').after($messageElement);

    // Auto remove after 3 seconds
    setTimeout(function() {
      $messageElement.fadeOut(300, function() {
        $(this).remove();
      });
    }, 3000);
  }

  // Initialize when document is ready
  $(document).ready(init);

  // Expose public methods
  window.SimilarProductsSettingsModule = {
    init: init,
    addNewRule: addNewRule,
    initializeExistingRules: initializeExistingRules
  };

})(jQuery);
