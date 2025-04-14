/**
 * Similar Products Admin JavaScript
 *
 * Handles interactive elements on the Similar Products settings page
 */
(function($) {
  'use strict';

  /**
   * Initialize when document is ready
   */
  $(document).ready(function() {
    // Only run on similar products settings page
    if (!$('.product-estimator-similar-products-settings').length) {
      return;
    }

    // Add new rule button
    $('.add-new-rule').on('click', addNewRule);

    // Initialize existing rules
    initializeExistingRules();

    // Initialize slider value display
    initializeSliders();
  });

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
    $('.similar-products-rule').each(function() {
      initializeRule($(this));
    });
  }

  /**
   * Initialize a single rule
   */
  function initializeRule($rule) {
    var ruleId = $rule.data('rule-id');

    // Toggle rule expansion
    $rule.find('.rule-header').on('click', function(e) {
      if (!$(e.target).hasClass('delete-rule') && !$(e.target).hasClass('save-rule')) {
        $rule.toggleClass('open');
      }
    });

    // Category change handler
    $rule.find('.source-categories-select').on('change', function() {
      var categoryIds = $(this).val();
      if (categoryIds && categoryIds.length > 0) {
        loadCategoryAttributes(categoryIds, $rule);
      } else {
        // Clear attributes
        $rule.find('.attributes-list').empty().html('<p>' + similarProductsL10n.select_category + '</p>');
      }
    });

    // Delete rule button
    $rule.find('.delete-rule').on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      if (confirm(similarProductsL10n.confirm_delete)) {
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
    var selectedCategories = $rule.find('.source-categories-select').val();
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
    $('.similarity-threshold').each(function() {
      initializeSlider($(this));
    });
  }

  /**
   * Initialize a single threshold slider
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
   */
  function loadCategoryAttributes(categoryIds, $rule) {
    var $attributesList = $rule.find('.attributes-list');

    // Show loading state
    $attributesList
      .html('<p>' + similarProductsL10n.loading_attributes + '</p>')
      .addClass('loading');

    $.ajax({
      url: ajaxurl,
      type: 'POST',
      data: {
        action: 'get_category_attributes',
        nonce: similarProductsL10n.nonce,
        category_ids: categoryIds
      },
      success: function(response) {
        if (response.success) {
          renderAttributes(response.data.attributes, $rule);
        } else {
          $attributesList
            .html('<p class="error">' + response.data.message + '</p>')
            .removeClass('loading');
        }
      },
      error: function() {
        $attributesList
          .html('<p class="error">' + similarProductsL10n.error_loading + '</p>')
          .removeClass('loading');
      }
    });
  }

  /**
   * Render attributes in the rule
   */
  function renderAttributes(attributes, $rule) {
    var $container = $rule.find('.attributes-list');
    $container.empty().removeClass('loading');

    if (attributes.length === 0) {
      $container.html('<p>' + similarProductsL10n.no_attributes + '</p>');
      return;
    }

    var ruleId = $rule.data('rule-id');
    var selectedAttributes = $rule.find('.selected-attributes').val();

    if (selectedAttributes) {
      selectedAttributes = selectedAttributes.split(',');
    } else {
      selectedAttributes = [];
    }

    $.each(attributes, function(index, attribute) {
      var isChecked = selectedAttributes.indexOf(attribute.name) > -1;
      var $attributeItem = $('<div class="attribute-item"></div>');

      $attributeItem.append(
        '<label>' +
        '<input type="checkbox" name="' + ruleId + '[attributes][]" value="' + attribute.name + '"' + (isChecked ? ' checked' : '') + '> ' +
        '<span>' + attribute.label + '</span>' +
        '</label>'
      );

      $container.append($attributeItem);
    });
  }

  /**
   * Save a rule
   */
  function saveRule(ruleId, $rule) {
    var $saveButton = $rule.find('.save-rule');
    var originalText = $saveButton.text();

    // Validate required fields
    var sourceCategories = $rule.find('.source-categories-select').val();
    if (!sourceCategories || sourceCategories.length === 0) {
      showMessage($rule, similarProductsL10n.select_category_error, 'error');
      return;
    }

    var selectedAttributes = [];
    $rule.find('.attributes-list input[type="checkbox"]:checked').each(function() {
      selectedAttributes.push($(this).val());
    });

    if (selectedAttributes.length === 0) {
      showMessage($rule, similarProductsL10n.select_attributes_error, 'error');
      return;
    }

    // Show saving state
    $saveButton.text(similarProductsL10n.saving).prop('disabled', true);

    var similarityThreshold = $rule.find('.similarity-threshold').val();

    $.ajax({
      url: ajaxurl,
      type: 'POST',
      data: {
        action: 'save_similar_products_rule',
        nonce: similarProductsL10n.nonce,
        rule_id: ruleId,
        source_categories: sourceCategories,
        attributes: selectedAttributes,
        similarity_threshold: similarityThreshold
      },
      success: function(response) {
        if (response.success) {
          // Show success message
          showMessage($rule, similarProductsL10n.rule_saved, 'success');

          // If this was a new rule, update its ID
          if (ruleId.startsWith('new_')) {
            $rule.attr('data-rule-id', response.data.rule_id);

            // Update all field names
            $rule.find('[name^="' + ruleId + '"]').each(function() {
              var newName = $(this).attr('name').replace(ruleId, response.data.rule_id);
              $(this).attr('name', newName);
            });
          }

          // Update rule title - show all selected category names
          var categoryNames = [];
          sourceCategories.forEach(function(catId) {
            var catName = $rule.find('.source-categories-select option[value="' + catId + '"]').text();
            if (catName) {
              categoryNames.push(catName);
            }
          });

          if (categoryNames.length > 0) {
            $rule.find('.rule-title').text(categoryNames.join(', '));
          } else {
            $rule.find('.rule-title').text(similarProductsL10n.select_category);
          }
        } else {
          showMessage($rule, response.data.message, 'error');
        }
      },
      error: function() {
        showMessage($rule, similarProductsL10n.error_saving, 'error');
      },
      complete: function() {
        $saveButton.text(originalText).prop('disabled', false);
      }
    });
  }

  /**
   * Delete a rule
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
      url: ajaxurl,
      type: 'POST',
      data: {
        action: 'delete_similar_products_rule',
        nonce: similarProductsL10n.nonce,
        rule_id: ruleId
      },
      success: function(response) {
        if (response.success) {
          $rule.remove();

          // Show "no rules" message if no rules left
          if ($('.similar-products-rule').length === 0) {
            $('.no-rules-message').show();
          }
        } else {
          showMessage($rule, response.data.message, 'error');
        }
      },
      error: function() {
        showMessage($rule, similarProductsL10n.error_deleting, 'error');
      }
    });
  }

  /**
   * Show a message in the rule
   */
  function showMessage($rule, message, type) {
    var $message = $('<div class="rule-message ' + type + '">' + message + '</div>');

    // Remove any existing messages
    $rule.find('.rule-message').remove();

    // Add the new message
    $rule.find('.rule-header').after($message);

    // Remove the message after 3 seconds
    setTimeout(function() {
      $message.fadeOut(300, function() {
        $(this).remove();
      });
    }, 3000);
  }

})(jQuery);
