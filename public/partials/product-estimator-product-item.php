<?php
/**
 * Product Item Template with Details Toggle
 *
 * This template displays a product item with:
 * - Main product details always visible
 * - "Includes" section can be toggled (expanded by default)
 * - "Notes" section can be toggled (expanded by default)
 * - "Similar Products" section can be toggled (hidden by default)
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public/partials
 */

// Check if product has similar products that need to be toggled
$has_similar_products = isset($product['id']) && !empty($product['id']);

// Check if product has notes that need to be toggled
$has_notes = !empty($product['additional_notes']) && is_array($product['additional_notes']);

// Check if product has includes that need to be toggled
$has_includes = !empty($product['additional_products']) && is_array($product['additional_products']);

// Add classes for styling
$product_class = 'product-item';
$product_class .= isset($product['type']) && $product['type'] === 'note' ? ' product-note-item' : '';
$product_class .= $has_similar_products ? ' has-similar-products' : '';
$product_class .= $has_notes ? ' has-notes' : '';
$product_class .= $has_includes ? ' has-includes' : '';

// Get default markup from the parent estimate if available
$default_markup = 0;
if (isset($estimate_id)) {
    $session_handler = \RuDigital\ProductEstimator\Includes\SessionHandler::getInstance();
    $estimate = $session_handler->getEstimate($estimate_id);
    if ($estimate && isset($estimate['default_markup'])) {
        $default_markup = floatval($estimate['default_markup']);

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Using estimate's markup for product item: $default_markup%");
        }
    } else {
        // If no markup found in the estimate, fall back to global settings
        $options = get_option('product_estimator_settings');
        $default_markup = isset($options['default_markup']) ? floatval($options['default_markup']) : 0;
    }
}
?>

<div class="<?php echo esc_attr($product_class); ?>" data-product-index="<?php echo esc_attr($product_index); ?>">
    <div class="product-wrapper">
        <?php if (isset($product['type']) && $product['type'] === 'note'): ?>
            <!-- Note Item Display -->
            <div class="note-details-wrapper">
                <div class="note-details">
                    <span class="note-icon">
                        <span class="dashicons dashicons-sticky"></span>
                    </span>
                    <div class="note-content">
                        <?php echo wpautop(esc_html($product['note_text'])); ?>
                    </div>
                    <button class="remove-product"
                            data-estimate-id="<?php echo esc_attr($estimate_id); ?>"
                            data-room-id="<?php echo esc_attr($room_id); ?>"
                            data-product-index="<?php echo esc_attr($product_index); ?>"
                            title="<?php esc_attr_e('Remove Product', 'product-estimator'); ?>">
                        <span class="dashicons dashicons-trash"></span>
                    </button>
                </div>
            </div>
        <?php else: ?>
            <!-- Regular Product Item Display -->
            <?php if (!empty($product['image'])): ?>
                <img src="<?php echo esc_url($product['image']); ?>"
                     alt="<?php echo esc_attr($product['name']); ?>"
                     class="product-thumbnail">
            <?php endif; ?>
            <div class="product-details-wrapper">
                <div class="product-details">
                    <span class="product-name">
                        <?php echo esc_html($product['name']); ?>
                    </span>

                    <?php
                    // Room area display - ensure values are floats
                    $room_width = isset($room['width']) ? floatval($room['width']) : 0;
                    $room_length = isset($room['length']) ? floatval($room['length']) : 0;
                    $room_area = isset($product['room_area']) ? floatval($product['room_area']) : ($room_width * $room_length);
                    ?>
                    <span class="product-room-area">
                        <?php echo sprintf(__('%.2f m²', 'product-estimator'), $room_area); ?>
                    </span>

                    <?php if (isset($product['min_price']) && isset($product['max_price'])): ?>
                        <?php
                        // Apply markup adjustment - subtract from min, add to max
                        $min_price = floatval($product['min_price']);
                        $max_price = floatval($product['max_price']);
                        $pricing_method = isset($product['pricing_method']) ? $product['pricing_method'] : 'sqm';

                        // Calculate adjusted prices with markup
                        $min_price_adjusted = $min_price * (1 - ($default_markup / 100));
                        $max_price_adjusted = $max_price * (1 + ($default_markup / 100));

                        // Calculate totals based on pricing method
                        if ($pricing_method === 'sqm') {
                            // Per square meter - multiply by room area
                            $min_total = $min_price_adjusted * $room_area;
                            $max_total = $max_price_adjusted * $room_area;
                            $unit_price_text = '/m²'; // Show unit price for sqm pricing
                        } else {
                            // Fixed pricing - use price directly
                            $min_total = $min_price_adjusted;
                            $max_total = $max_price_adjusted;
                            $unit_price_text = ''; // No unit price for fixed pricing
                        }
                        ?>

                        <?php if (round($min_total, 2) === round($max_total, 2)): ?>
                            <span class="product-price">
                                <?php echo wc_price($min_total); ?>
                            </span>
                        <?php else: ?>
                            <span class="product-price">
                                <?php echo wc_price($min_total); ?> - <?php echo wc_price($max_total); ?>
                            </span>
                        <?php endif; ?>

                        <!-- Unit price display - only for sqm pricing method -->
                        <?php if ($pricing_method === 'sqm'): ?>
                            <!-- Unit price commented out as in original template -->
                        <?php endif; ?>
                    <?php endif; ?>

                    <button class="remove-product"
                            data-estimate-id="<?php echo esc_attr($estimate_id); ?>"
                            data-room-id="<?php echo esc_attr($room_id); ?>"
                            data-product-index="<?php echo esc_attr($product_index); ?>"
                            title="<?php esc_attr_e('Remove Product', 'product-estimator'); ?>">
                        <span class="dashicons dashicons-trash"></span>
                    </button>
                </div>
            </div>
        <?php endif; ?>
    </div>

    <?php
    // Display additional products if available - NOW TOGGLEABLE
    if ($has_includes):
        ?>
        <!-- Includes Toggle Button -->
        <button class="product-includes-toggle expanded">
            <?php esc_html_e('Product Includes', 'product-estimator'); ?>
            <span class="toggle-icon dashicons dashicons-arrow-up-alt2"></span>
        </button>

        <!-- Includes Container - TOGGLEABLE -->
        <div class="includes-container visible" style="display: block;">
            <div class="product-includes">
                <div class="product-includes-items">
                    <?php foreach ($product['additional_products'] as $additional_product): ?>
                        <div class="include-item">
                            <span class="product-includes-icon">
                                <span class="dashicons dashicons-plus-alt"></span>
                            </span>
                            <div class="include-item-name">
                                <?php echo esc_html($additional_product['name']); ?>
                            </div>
                            <div class="include-item-prices">
                                <?php if (isset($additional_product['min_price_total']) && isset($additional_product['max_price_total'])): ?>
                                    <?php
                                    // Apply markup to additional product prices for total
                                    $add_min_total = floatval($additional_product['min_price_total']) * (1 - ($default_markup / 100));
                                    $add_max_total = floatval($additional_product['max_price_total']) * (1 + ($default_markup / 100));

                                    if (round($add_min_total, 2) === round($add_max_total, 2)):
                                        ?>
                                        <div class="include-item-total-price">
                                            <?php echo wc_price($add_min_total); ?>
                                        </div>
                                    <?php else: ?>
                                        <div class="include-item-total-price">
                                            <?php echo wc_price($add_min_total); ?> - <?php echo wc_price($add_max_total); ?>
                                        </div>
                                    <?php endif; ?>
                                <?php endif; ?>

                                <?php if (isset($additional_product['min_price']) && isset($additional_product['max_price'])): ?>
                                    <?php
                                    // Apply markup to unit prices
                                    $add_min_price_unit = floatval($additional_product['min_price']) * (1 - ($default_markup / 100));
                                    $add_max_price_unit = floatval($additional_product['max_price']) * (1 + ($default_markup / 100));

                                    if (round($add_min_price_unit, 2) === round($add_max_price_unit, 2)):
                                        ?>
                                        <div class="include-item-unit-price">
                                            <?php echo sprintf(__('%s/m²', 'product-estimator'), wc_price($add_min_price_unit)); ?>
                                        </div>
                                    <?php else: ?>
                                        <div class="include-item-unit-price">
                                            <?php echo sprintf(__('%s - %s/m²', 'product-estimator'),
                                                wc_price($add_min_price_unit),
                                                wc_price($add_max_price_unit)); ?>
                                        </div>
                                    <?php endif; ?>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    <?php endif; ?>

    <?php
    // Display additional notes if available - TOGGLEABLE
    if ($has_notes):
        ?>
        <!-- Notes Toggle Button -->
        <button class="product-notes-toggle expanded">
            <?php esc_html_e('Product Notes', 'product-estimator'); ?>
            <span class="toggle-icon dashicons dashicons-arrow-up-alt2"></span>
        </button>

        <!-- Notes Container - TOGGLEABLE -->
        <div class="notes-container visible" style="display: block;">
            <div class="product-includes product-notes">
                <div class="product-includes-items">
                    <?php foreach ($product['additional_notes'] as $additional_note): ?>
                        <div class="include-item note-item">
                            <span class="product-includes-icon">
                                <span class="dashicons dashicons-sticky"></span>
                            </span>
                            <div class="include-item-note">
                                <?php echo wpautop(esc_html($additional_note['note_text'])); ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    <?php endif; ?>

    <?php if ($has_similar_products): ?>
        <!-- Similar Products Toggle Button -->
        <button class="product-details-toggle">
            <?php esc_html_e('Similar Products', 'product-estimator'); ?>
            <span class="toggle-icon dashicons dashicons-arrow-down-alt2"></span>
        </button>

        <!-- Similar Products Container - TOGGLEABLE (Hidden by default) -->
        <div class="similar-products-container" style="display: none;">
            <?php include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-similar-products-carousel.php'; ?>
        </div>
    <?php endif; ?>
</div>
