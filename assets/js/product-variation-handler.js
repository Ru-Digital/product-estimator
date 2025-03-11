/**
 * Product Estimator Variation Handler
 *
 * This script enhances the "Add to Estimator" button to work with WooCommerce product variations.
 * It updates the button's product ID when a variation is selected and ensures the correct
 * variation data is sent to the estimator.
 */
(function($) {
  'use strict';

  // Initialize when document is ready
  $(document).ready(function() {
    // Only run on variable product pages
    if (!$('form.variations_form').length) {
      return;
    }

    // Cache DOM elements
    const $variationForm = $('form.variations_form');
    const $estimatorButton = $('.single_add_to_estimator_button');

    // Store the original parent product ID
    const parentProductId = $estimatorButton.data('product-id');

    // Listen for variation changes
    $variationForm.on('found_variation', function(event, variation) {
      if (variation && variation.variation_id) {
        // Update the button with the variation ID
        $estimatorButton.data('product-id', variation.variation_id);
        $estimatorButton.attr('data-product-id', variation.variation_id);

        // If the variation has its own "Enable Estimator" setting, handle visibility
        if (typeof variation.enable_estimator !== 'undefined') {
          if (variation.enable_estimator === 'yes') {
            $estimatorButton.show();
          } else {
            $estimatorButton.hide();
          }
        }
      }
    });

    // Reset the button when variations are reset
    $variationForm.on('reset_data', function() {
      // Reset to parent product ID
      $estimatorButton.data('product-id', parentProductId);
      $estimatorButton.attr('data-product-id', parentProductId);

      // Check if the parent product has estimator enabled (should be visible by default)
      if ($estimatorButton.hasClass('visible-by-default')) {
        $estimatorButton.show();
      }
    });

    // Add visible-by-default class if the button is initially visible
    if ($estimatorButton.is(':visible')) {
      $estimatorButton.addClass('visible-by-default');
    }
  });

})(jQuery);
