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
        $similar_products = $similar_products_module->get_similar_products_for_display($product['id'], 5);

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
            <div class="product-similar-products">
                <h5><?php esc_html_e('Similar Products', 'product-estimator'); ?></h5>

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

                                    <?php if (isset($similar['price'])): ?>
                                        <div class="suggestion-price">
                                            <?php echo wc_price($similar['price']); ?>
                                        </div>
                                    <?php endif; ?>

                                    <div class="suggestion-actions">
                                        <button type="button"
                                                class="add-suggestion-to-room"
                                                data-product-id="<?php echo esc_attr($similar['id']); ?>"
                                                data-estimate-id="<?php echo esc_attr($estimate_id); ?>"
                                                data-room-id="<?php echo esc_attr($room_id); ?>">
                                            <?php esc_html_e('Add', 'product-estimator'); ?>
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
