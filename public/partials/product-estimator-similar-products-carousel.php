<?php
if (isset($product['id']) && !empty($product['id'])):
    // Check if we have the similar products module available
    if (class_exists('\\RuDigital\\ProductEstimator\\Includes\\Admin\\Settings\\SimilarProductsSettingsModule')):
        // Initialize the module
        $similar_products_module = new \RuDigital\ProductEstimator\Includes\Admin\Settings\SimilarProductsSettingsModule(
            'product-estimator',
            PRODUCT_ESTIMATOR_VERSION
        );

        // Get similar products for this specific product (limited to 5 for better carousel)
        $similar_products = $similar_products_module->get_similar_products_for_display($product['id'], 10);

        // Filter out products already in this room
        if (!empty($similar_products) && !empty($room['products'])):
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
                $options = get_option('product_estimator_settings');
                $default_markup = isset($options['default_markup']) ? floatval($options['default_markup']) : 0;
            }

            // Get pricing rules
            $pricing_rules = get_option('product_estimator_pricing_rules', []);
            ?>
            <!-- This is a similar products carousel - should be bound by product-item -->
            <div class="product-similar-products">
                <!--                <h5>--><?php //esc_html_e('Similar Products', 'product-estimator'); ?><!--</h5>-->

                <div class="suggestions-carousel similar-products-carousel">
                    <div class="suggestions-nav prev" aria-label="<?php esc_attr_e('Previous', 'product-estimator'); ?>">
                        <span class="dashicons dashicons-arrow-left-alt2"></span>
                    </div>

                    <div class="suggestions-container">
                        <?php foreach ($similar_products as $similar): ?>
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

                                    <?php
                                    // PRICING CALCULATION SECTION - FIXED

                                    // Determine pricing method from rules
                                    $pricing_method = isset($similar['pricing_method']) ? $similar['pricing_method'] : 'sqm';

                                    // If pricing method not directly provided, check pricing rules
                                    if (!isset($similar['pricing_method']) && isset($similar['id'])) {
                                        $product_categories = wp_get_post_terms($similar['id'], 'product_cat', ['fields' => 'ids']);

                                        // Check each rule for matching categories
                                        foreach ($pricing_rules as $rule) {
                                            if (isset($rule['categories']) && is_array($rule['categories'])) {
                                                $matching_categories = array_intersect($product_categories, $rule['categories']);
                                                if (!empty($matching_categories)) {
                                                    // Found a matching rule, use its method
                                                    $pricing_method = isset($rule['pricing_method']) ? $rule['pricing_method'] : 'sqm';
                                                    break;
                                                }
                                            }
                                        }
                                    }

                                    // Use min_price and max_price if available, otherwise use regular price
                                    $min_price = isset($similar['min_price']) ? floatval($similar['min_price']) : floatval($similar['price']);
                                    $max_price = isset($similar['max_price']) ? floatval($similar['max_price']) : floatval($similar['price']);

                                    // Apply markup adjustment to prices
                                    $min_price_adjusted = $min_price * (1 - ($default_markup / 100));
                                    $max_price_adjusted = $max_price * (1 + ($default_markup / 100));

                                    // Round the unit prices
                                    $min_price_adjusted = function_exists('product_estimator_round_price')
                                        ? product_estimator_round_price($min_price_adjusted)
                                        : round($min_price_adjusted, 2);
                                    $max_price_adjusted = function_exists('product_estimator_round_price')
                                        ? product_estimator_round_price($max_price_adjusted)
                                        : round($max_price_adjusted, 2);

                                    // Calculate totals based on pricing method and room area
                                    if ($pricing_method === 'sqm' && $room_area > 0) {
                                        // Multiply unit price by room area to get total
                                        $min_total = $min_price_adjusted * $room_area;
                                        $max_total = $max_price_adjusted * $room_area;

                                        // Round the calculated totals
                                        $min_total = function_exists('product_estimator_round_price')
                                            ? product_estimator_round_price($min_total)
                                            : round($min_total, 2);
                                        $max_total = function_exists('product_estimator_round_price')
                                            ? product_estimator_round_price($max_total)
                                            : round($max_total, 2);
                                    } else {
                                        // For fixed pricing, use the adjusted prices directly
                                        $min_total = $min_price_adjusted;
                                        $max_total = $max_price_adjusted;

                                        // Already rounded above
                                    }

                                    // Determine if we need to show a price range or single price
                                    $show_range = round($min_total, 2) !== round($max_total, 2);
                                    ?>

                                    <div class="suggestion-price">
                                        <?php if ($show_range): ?>
                                            <?php echo wc_price($min_total); ?> - <?php echo wc_price($max_total); ?>
                                        <?php else: ?>
                                            <?php echo wc_price($min_total); ?>
                                        <?php endif; ?>
                                    </div>

                                    <div class="suggestion-actions">
                                        <button type="button"
                                                class="replace-product-in-room"
                                                data-product-id="<?php echo esc_attr($similar['id']); ?>"
                                                data-estimate-id="<?php echo esc_attr($estimate_id); ?>"
                                                data-room-id="<?php echo esc_attr($room_id); ?>"
                                                data-replace-product-id="<?php echo esc_attr($product['id']); ?>"
                                                data-pricing-method="<?php echo esc_attr($pricing_method); ?>"
                                                data-pricing-source="<?php echo esc_attr($similar['pricing_source'] ?? 'website'); ?>">
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
        <?php
        endif;
    endif;
endif;
?>
