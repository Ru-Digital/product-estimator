<?php
/**
 * Product Suggestions Carousel Template - Enhanced with debug and fallbacks
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public/partials
 */

// Skip if no room data is available or room has no products
if (!isset($room) || empty($room) || !isset($room['products']) || empty($room['products'])) {
    return;
}

// Get all product IDs in this room to avoid suggesting already added products
$room_product_ids = [];
foreach ($room['products'] as $product) {
    if (!empty($product['id']) && !isset($product['type'])) {
        $room_product_ids[] = $product['id'];
    }
}

// Get suggestions
$suggestions = [];

// Check if we have the ProductAdditionsManager class
$product_additions_manager = new \RuDigital\ProductEstimator\Includes\Frontend\ProductAdditionsFrontend('product-estimator', PRODUCT_ESTIMATOR_VERSION);

if ($product_additions_manager) {
    // Generate suggestions based on products in this room
    foreach ($room['products'] as $product) {
        // Skip notes or products without IDs
        if (isset($product['type']) && $product['type'] === 'note') {
            continue;
        }
        if (!isset($product['id']) || empty($product['id'])) {
            continue;
        }

        $parent_id = wp_get_post_parent_id($product['id']);

        $product_id = $parent_id ?: $product['id'];
        // Get product categories
        $categories = wp_get_post_terms($product_id, 'product_cat', array('fields' => 'ids'));

        if (!empty($categories)) {
            // Check each category for suggestions
            foreach ($categories as $category_id) {
                // Get suggested products for this category
                $category_suggestions = $product_additions_manager->get_suggested_products_for_category($category_id);
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
                                'price' => $product_obj->get_price(),
                                'image' => wp_get_attachment_image_url($product_obj->get_image_id(), [300,300]) ?: '',
                                'pricing_method' => $pricing_method
                            ];
                        }
                    }
                }
            }
        }
    }
} else {
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('ProductAdditionsSettingsModule class not found');
    }
}

// Convert to indexed array
$suggestions = array_values($suggestions);

// Filter out any products that are already in the room
if (!empty($suggestions)) {
    $suggestions = array_values($suggestions);
}


// Check if we have any suggestions to display
if (empty($suggestions)) {
    return; // Don't display anything if no suggestions
}

// Calculate room area for pricing calculations
$room_width = isset($room['width']) ? floatval($room['width']) : 0;
$room_length = isset($room['length']) ? floatval($room['length']) : 0;
$room_area = $room_width * $room_length;

// Get markup from the estimate if available
$session_handler = \RuDigital\ProductEstimator\Includes\SessionHandler::getInstance();
$estimate = $session_handler->getEstimate($estimate_id);
$default_markup = isset($estimate['default_markup']) ? floatval($estimate['default_markup']) : 0;

// If no markup found in the estimate, fall back to global settings
if ($default_markup === 0) {
    $pricing_rules = get_option('product_estimator_pricing_rules');
    $default_markup = isset($pricing_rules['default_markup']) ? floatval($pricing_rules['default_markup']) : 0;
}
?>

<!-- Suggestions Toggle Button -->
<button class="product-suggestions-toggle expanded">
    <?php esc_html_e('Suggested Products', 'product-estimator'); ?>
    <span class="toggle-icon dashicons dashicons-arrow-down-alt2"></span>
</button>

<!-- Suggestions Container - initially visible -->
<div class="suggestions-container visible" style="display: block;">
    <div class="product-suggestions">
        <div class="suggestions-carousel">
            <div class="suggestions-nav prev" aria-label="<?php esc_attr_e('Previous', 'product-estimator'); ?>">
                <span class="dashicons dashicons-arrow-left-alt2"></span>
            </div>

            <div class="suggestions-container">
                <?php foreach ($suggestions as $suggestion):
                    // Use our helper function to calculate price with auto-add products
                    $price_data = product_estimator_calculate_total_price_with_additions(
                        $suggestion['id'],
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

                            <div class="suggestion-price">
                                <?php if (round($min_total, 2) !== round($max_total, 2)): ?>
                                    <?php echo wc_price($min_total); ?> - <?php echo wc_price($max_total); ?>
                                <?php else: ?>
                                    <?php echo wc_price($min_total); ?>
                                <?php endif; ?>

                                <?php if ($pricing_method === 'sqm'): ?>
                                    <span class="unit-price">/m²</span>
                                <?php endif; ?>

                                <?php if ($has_auto_add): ?>
                                    <span class="has-additions" title="<?php esc_attr_e('Includes additional products', 'product-estimator'); ?>">+</span>
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
</div>
