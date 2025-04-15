<?php
/**
 * Product Suggestions Carousel Template
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public/partials
 */

// Skip this entire section if the room has no products
if (empty($room['products'])) {
    return;
}

// Get all product IDs in this room to avoid suggesting already added products
$room_product_ids = [];
foreach ($room['products'] as $product) {
    if (!empty($product['id']) && !isset($product['type'])) {
        $room_product_ids[] = $product['id'];
    }
}

// Get suggestions from the room data
$suggestions = isset($room['product_suggestions']) ? $room['product_suggestions'] : [];

// Filter out any products that are already in the room
if (!empty($suggestions)) {
    $suggestions = array_filter($suggestions, function($suggestion) use ($room_product_ids) {
        return !in_array($suggestion['id'], $room_product_ids);
    });
}

// Check if we have any suggestions to display
if (empty($suggestions)) {
    return; // Don't display anything if no suggestions
}

// Get default markup from settings
$options = get_option('product_estimator_settings');
$default_markup = isset($options['default_markup']) ? floatval($options['default_markup']) : 0;
?>

<div class="product-suggestions">
    <h5><?php esc_html_e('Suggested Products', 'product-estimator'); ?></h5>

    <div class="suggestions-carousel">
        <div class="suggestions-nav prev" aria-label="<?php esc_attr_e('Previous', 'product-estimator'); ?>">
            <span class="dashicons dashicons-arrow-left-alt2"></span>
        </div>

        <div class="suggestions-container">
            <?php foreach ($suggestions as $suggestion): ?>
                <div class="suggestion-item">
                    <div class="suggestion-image">
                        <?php if (!empty($suggestion['image'])): ?>
                            <img src="<?php echo esc_url($suggestion['image']); ?>"
                                 alt="<?php echo esc_attr($suggestion['name']); ?>">
                        <?php else: ?>
                            <div class="no-image"></div>
                        <?php endif; ?>
                    </div>

                    <div class="suggestion-details">
                        <div class="suggestion-name"><?php echo esc_html($suggestion['name']); ?></div>

                        <?php
                        // Get pricing method
                        $pricing_method = isset($suggestion['pricing_method']) ? $suggestion['pricing_method'] : 'sqm';

                        // Use min_price and max_price if available, otherwise use regular price
                        $min_price = isset($suggestion['min_price']) ? floatval($suggestion['min_price']) : floatval($suggestion['price']);
                        $max_price = isset($suggestion['max_price']) ? floatval($suggestion['max_price']) : floatval($suggestion['price']);

                        // If min and max are the same, create a small range based on markup
                        if ($min_price == $max_price) {
                            $base_price = $min_price;
                            // Apply markup adjustment
                            $min_price_adjusted = $base_price * (1 - ($default_markup / 100));
                            $max_price_adjusted = $base_price * (1 + ($default_markup / 100));
                        } else {
                            // Apply markup adjustment - already a range
                            $min_price_adjusted = $min_price * (1 - ($default_markup / 100));
                            $max_price_adjusted = $max_price * (1 + ($default_markup / 100));
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
                                    class="add-suggestion-to-room"
                                    data-product-id="<?php echo esc_attr($suggestion['id']); ?>"
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
