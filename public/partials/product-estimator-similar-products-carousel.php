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
                                    // Get default markup from settings
                                    $options = get_option('product_estimator_settings');
                                    $default_markup = isset($options['default_markup']) ? floatval($options['default_markup']) : 0;

                                    // Get pricing method
                                    $pricing_method = isset($similar['pricing_method']) ? $similar['pricing_method'] : 'sqm';

                                    // Use min_price and max_price if available, otherwise use regular price
                                    $min_price = product_estimator_round_price(isset($similar['min_price']) ? floatval($similar['min_price']) : floatval($similar['price']));
                                    $max_price = product_estimator_round_price(isset($similar['max_price']) ? floatval($similar['max_price']) : floatval($similar['price']));

                                    // If min and max are the same, create a small range based on markup
                                    if ($min_price == $max_price) {
                                        $base_price = $min_price;
                                        // Apply markup adjustment - subtract from min, add to max
                                        $min_price_adjusted = product_estimator_round_price($base_price * (1 - ($default_markup / 100)));
                                        $max_price_adjusted = product_estimator_round_price($base_price * (1 + ($default_markup / 100)));
                                    } else {
                                        // Apply markup adjustment - already a range
                                        $min_price_adjusted = product_estimator_round_price($min_price * (1 - ($default_markup / 100)));
                                        $max_price_adjusted = product_estimator_round_price($max_price * (1 + ($default_markup / 100)));
                                    }

                                    // Determine if we need to show a price range or single price
                                    $show_range = round($min_price_adjusted, 2) !== round($max_price_adjusted, 2);
                                    ?>

                                    <div class="suggestion-price">
                                        <?php if ($show_range): ?>
                                            <?php echo wc_price($min_price_adjusted); ?> - <?php echo wc_price($max_price_adjusted); ?>
                                        <?php else: ?>
                                            <?php echo wc_price($min_price_adjusted); ?>
                                        <?php endif; ?>

                                        <?php if ($pricing_method === 'sqm'): ?>
                                            <span class="unit-price">/m²</span>
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
