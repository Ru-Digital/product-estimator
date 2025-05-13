<?php

use RuDigital\ProductEstimator\Includes\Frontend\SimilarProductsFrontend;

if (isset($product['id']) && !empty($product['id'])):
    // Check if we have the similar products module available
    // Initialize the Similar Products module
    $similar_products_module = new SimilarProductsFrontend(
        'product-estimator',
        PRODUCT_ESTIMATOR_VERSION
    );

    if ($similar_products_module):
        // Get similar products for this specific product (limited to 10 for better carousel)
        $similar_products = $similar_products_module->get_similar_products_for_display($product['id'], 10);


        // Filter out products already in this room
        if (!empty($similar_products) && !empty($room['products'])):

            ?>
            <!-- Similar Products Toggle Button -->
            <?php

            $similar_products_label = $product_estimator_labels_frontend->get_label('label_similar_products');

            ?>
            <button class="product-details-toggle">
                <?php esc_html_e($similar_products_label, 'product-estimator'); ?>
                <span class="toggle-icon dashicons dashicons-arrow-down-alt2"></span>
            </button>
<!-- Similar Products Container - TOGGLEABLE (Hidden by default) -->
<div class="similar-products-container" style="display: none;">
        <?php

            $room_product_ids = [];
            foreach ($room['products'] as $room_product) {
                if (!empty($room_product['id']) && !isset($room_product['type'])) {
                    $room_product_ids[] = $room_product['id'];
                }
            }


            $filtered_similar_products = [];
            foreach ($similar_products as $similar_product) {
                if (!in_array($similar_product['id'], $room_product_ids)) {
                    $filtered_similar_products[] = $similar_product;
                }
            }

            $similar_products = $filtered_similar_products;
        endif;

        if (!empty($similar_products)):
            $estimator_enabled_products = [];
            foreach ($similar_products as $similar_product) {
                // Check if estimator is enabled using the WoocommerceIntegration class
                if (\RuDigital\ProductEstimator\Includes\Integration\WoocommerceIntegration::isEstimatorEnabled($similar_product['id'])) {
                    $estimator_enabled_products[] = $similar_product;
                } else {
                    // For variations, try to get the parent product and check its variations
                    $product_obj = wc_get_product($similar_product['id']);

                    if ($product_obj && $product_obj->is_type('variable')) {
                        // Get available variations
                        $variations = $product_obj->get_available_variations();

                        // Check if any variation has estimator enabled
                        foreach ($variations as $variation) {


                            if (\RuDigital\ProductEstimator\Includes\Integration\WoocommerceIntegration::isEstimatorEnabled($variation['variation_id'])) {


                                // Use the variation instead
                                $similar_product['id'] = $variation['variation_id'];
                                $similar_product['name'] = $product_obj->get_name() . ' - ' . wc_get_formatted_variation($variation['attributes'], true);
                                $estimator_enabled_products[] = $similar_product;
                                break; // Found an enabled variation, no need to check others
                            }
                        }
                    }
                }
            }


            $similar_products = $estimator_enabled_products;
        endif;


        // Display similar products if we have any
        if (!empty($similar_products)):


            // Get room dimensions for area calculation
            $room_width = isset($room['width']) ? floatval($room['width']) : 0;
            $room_length = isset($room['length']) ? floatval($room['length']) : 0;
            $room_area = $room_width * $room_length;

            // Get default markup from the estimate in session instead of global settings
            // First try to get it from the estimate
            $session_handler = \RuDigital\ProductEstimator\Includes\SessionHandler::getInstance();
            $estimate = $session_handler->getEstimate($estimate_id);
            $default_markup = isset($estimate['default_markup']) ? floatval($estimate['default_markup']) : 0;

            // If no markup found in the estimate, fall back to global settings
            if ($default_markup === 0) {
                $pricing_rules = get_option('product_estimator_pricing_rules');
                $default_markup = isset($pricing_rules['default_markup']) ? floatval($pricing_rules['default_markup']) : 0;
            }
            ?>
            <!-- This is a similar products carousel - should be bound by product-item -->
            <div class="product-similar-products">
                <div class="suggestions-carousel similar-products-carousel">
                    <div class="suggestions-nav prev"
                         aria-label="<?php esc_attr_e('Previous', 'product-estimator'); ?>">
                        <span class="dashicons dashicons-arrow-left-alt2"></span>
                    </div>

                    <div class="suggestions-container">

                        <?php foreach ($similar_products as $similar):
                            // Use our new helper function to calculate price with auto-add products
                            $price_data = product_estimator_calculate_total_price_with_additions(
                                $similar['id'],
                                $room_area
                            );

                            $min_total = $price_data['min_total'];
                            $max_total = $price_data['max_total'];
                            $price_breakdown = $price_data['breakdown'];

                            // Get pricing method for display
                            $has_auto_add = count($price_breakdown) > 1;
                            $main_product = $price_breakdown[0];
                            $pricing_method = $main_product['pricing_method'];
                            ?>
                            <div class="suggestion-item similar-product-item">
                                <div class="suggestion-image">
                                    <?php if (!empty($similar['image'])): ?>
                                        <img src="<?php echo esc_url($similar['image']); ?>"
                                             alt="<?php echo esc_attr($similar['name']); ?>">
                                    <?php else: ?>
                                        <div class="no-image"></div>
                                    <?php endif; ?>
                                </div>

                                <div class="suggestion-details">
                                    <div class="suggestion-name"><?php echo esc_html($similar['name']); ?></div>

                                    <div class="suggestion-price">
                                        <?php if ($min_total !== $max_total): ?>
                                            <?php echo display_price_with_markup($min_total, $default_markup, "down"); ?> - <?php echo display_price_with_markup($max_total, $default_markup, "up"); ?>
                                        <?php else: ?>
                                            <?php echo display_price_with_markup($min_total, $default_markup, "up"); ?>
                                        <?php endif; ?>

                                    </div>


                                    <div class="suggestion-actions">
                                        <button type="button"
                                                class="replace-product-in-room"
                                                data-product-id="<?php echo esc_attr($similar['id']); ?>"
                                                data-estimate-id="<?php echo esc_attr($estimate_id); ?>"
                                                data-room-id="<?php echo esc_attr($room_id); ?>"
                                                data-replace-product-id="<?php echo esc_attr($product['id']); ?>"
                                                data-pricing-method="<?php echo esc_attr($pricing_method); ?>">
                                            <?php esc_html_e('Replace', 'product-estimator'); ?>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <div class="suggestions-nav next" aria-label="<?php esc_attr_e('Next', 'product-estimator'); ?>">
                        <span class="dashicons dashicons-arrow-right-alt2"></span>
                    </div>
                </div>
            </div>
            </div>
        <?php
        endif;
    endif;
endif;
?>
