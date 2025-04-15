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

// Generate suggestions at template render time instead of from session
$suggestions = [];

// Check if we have the ProductAdditionsManager class
if (class_exists('RuDigital\\ProductEstimator\\Includes\\Admin\\Settings\\ProductAdditionsSettingsModule')) {
    $manager = new \RuDigital\ProductEstimator\Includes\Admin\Settings\ProductAdditionsSettingsModule('product-estimator', '1.0.4');

    // Generate suggestions based on products in this room
    foreach ($room['products'] as $product) {
        // Skip notes or products without IDs
        if (isset($product['type']) && $product['type'] === 'note') {
            continue;
        }
        if (!isset($product['id']) || empty($product['id'])) {
            continue;
        }

        // Get product categories
        $categories = wp_get_post_terms($product['id'], 'product_cat', array('fields' => 'ids'));
        if (!empty($categories)) {
            // Check each category for suggestions
            foreach ($categories as $category_id) {
                // Get suggested products for this category
                $category_suggestions = $manager->get_suggested_products_for_category($category_id);
                if (!empty($category_suggestions)) {
                    // Add each suggested product to the array
                    foreach ($category_suggestions as $suggestion_id) {
                        // Skip if this product is already in the room
                        if (in_array($suggestion_id, $room_product_ids)) {
                            continue;
                        }

                        // Get product data
                        $product_obj = wc_get_product($suggestion_id);
                        if ($product_obj) {
                            // Get pricing rule for this product
                            $pricing_method = 'sqm'; // Default method
                            $pricing_rules = get_option('product_estimator_pricing_rules', []);
                            $product_categories = wp_get_post_terms($suggestion_id, 'product_cat', ['fields' => 'ids']);

                            foreach ($pricing_rules as $rule) {
                                if (isset($rule['categories']) && !empty(array_intersect($product_categories, $rule['categories']))) {
                                    $pricing_method = isset($rule['pricing_method']) ? $rule['pricing_method'] : 'sqm';
                                    break;
                                }
                            }

                            // Add to suggestions array - using product ID as key to avoid duplicates
                            $suggestions[$suggestion_id] = [
                                'id' => $suggestion_id,
                                'name' => $product_obj->get_name(),
                                'price' => product_estimator_round_price($product_obj->get_price()),
                                'image' => wp_get_attachment_image_url($product_obj->get_image_id(), 'thumbnail') ?: '',
                                'pricing_method' => $pricing_method
                            ];
                        }
                    }
                }
            }
        }
    }
}

// Convert to indexed array
$suggestions = array_values($suggestions);

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
                        $min_price = product_estimator_round_price(isset($suggestion['min_price']) ? floatval($suggestion['min_price']) : floatval($suggestion['price']));
                        $max_price = product_estimator_round_price(isset($suggestion['max_price']) ? floatval($suggestion['max_price']) : floatval($suggestion['price']));

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
