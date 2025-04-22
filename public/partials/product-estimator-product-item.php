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
                    <?php

                    ?>
<!--                    <span class="product-name">-->
<!--                        --><?php //echo esc_html($product['name']); ?>
<!--                    </span>-->

                    <?php
                    // Room area display - ensure values are floats
                    $room_width = isset($room['width']) ? floatval($room['width']) : 0;
                    $room_length = isset($room['length']) ? floatval($room['length']) : 0;
                    $room_area = isset($product['room_area']) ? floatval($product['room_area']) : ($room_width * $room_length);

                    $price_data = product_estimator_calculate_total_price_with_additions_for_display($product);

                    $price_breakdown = $price_data['breakdown'];
                    $has_auto_add = count($price_breakdown) > 1;

                    if($has_auto_add) {
                        $main_product = $price_breakdown[0];
                    } else {
                        $main_product = $price_data;
                    }

                    $min_price = $price_data['min_price'];
                    $max_price = $price_data['max_price'];
                    $min_total = $price_data['min_total'];
                    $max_total = $price_data['max_total'];
                    $pricing_source = $main_product['pricing_source'];
                    $pricing_method = $main_product['pricing_method'];

                    ?>
<!--                    <span class="product-room-area">-->
<!--                        --><?php //echo sprintf(__('%.2f m²', 'product-estimator'), $room_area); ?>
<!--                    </span>-->

                    <?php if (isset($min_total) && isset($max_total)): ?>
                        <?php
                        // Apply markup adjustment - subtract from min, add to max
                        $min_price = $min_total;
                        $max_price = $max_total;

                        // Calculate totals based on pricing method
                        if ($pricing_method === 'sqm') {
                            // Per square meter - multiply by room area
                            $unit_price_text = '/m²'; // Show unit price for sqm pricing
                        } else {
                            // Fixed pricing - use price directly
                            $unit_price_text = ''; // No unit price for fixed pricing
                        }
                        ?>
                        <?php if ($min_total === $max_total): ?>

<!--                            <span class="product-price">-->
<!--                                --><?php //echo display_price_with_markup($min_total, $default_markup, "up"); ?>
<!--                            </span>-->
                        <?php else: ?>


<!--                            <span class="product-price">-->
<!--                                --><?php //echo display_price_with_markup($min_total, $default_markup, "down"); ?><!-- - --><?php //echo display_price_with_markup($max_total, $default_markup, "up"); ?>
<!--                            </span>-->
                        <?php endif; ?>

                        <!-- Unit price display - only for sqm pricing method -->
                        <?php if ($pricing_method === 'sqm'): ?>
                            <!-- Unit price commented out as in original template -->
                        <?php endif; ?>
                    <?php endif; ?>

                    <?php
                    display_price_graph(
                        $min_total,
                        $max_total,
                        $default_markup,
                        esc_html($product['name']),
                        $room_area,
                        $pricing_method,
                        [
                            'label_count' => 6, // Adjust number of labels as needed
                            'round_to' => 500  // Round to nearest thousand
                        ]
                    );
                    ?>

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

    <!-- Product Upgrades Toggle Button - Hidden initially, will be shown by JS when upgrades are available -->
    <button class="product-upgrades-toggle" style="display: none;">
        <?php esc_html_e('Available Upgrades', 'product-estimator'); ?>
        <span class="toggle-icon dashicons dashicons-arrow-down-alt2"></span>
    </button>

    <!-- Product Upgrades Container - Initially empty, will be filled by JS -->
    <div class="product-upgrades-container" style="display: none;"></div>

    <?php
    // Display additional products if available - NOW TOGGLEABLE
    if ($has_auto_add):
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
                    <?php foreach ($price_breakdown as $additional_product): ?>
                        <div class="include-item">
                            <span class="product-includes-icon">
                                <span class="dashicons dashicons-plus-alt"></span>
                            </span>
                            <div class="include-item-name">
                                <?php echo esc_html($additional_product['name']); ?>
                            </div>
                            <?php if($additional_product['min_total'] > 0 && $additional_product['max_total'] > 0 ): ?>
                            <div class="include-item-prices">
                                <?php if (isset($additional_product['min_total']) && isset($additional_product['max_total'])): ?>
                                    <?php
                                    // Apply markup to additional product prices for total
                                    $add_min_total = $additional_product['min_total'];
                                    $add_max_total = $additional_product['max_total'];

                                    if ($add_min_total === $add_max_total):
                                        ?>


                                        <div class="include-item-total-price">
                                            <?php echo display_price_with_markup($additional_product['min_total'], $default_markup, null); ?>
                                        </div>
                                    <?php else: ?>


                                        <div class="include-item-total-price">
                                            <?php echo display_price_with_markup($additional_product['min_total'], $default_markup, "down"); ?> - <?php echo display_price_with_markup($additional_product['max_total'], $default_markup, "up"); ?>
                                        </div>
                                    <?php endif; ?>
                                <?php endif; ?>

                                <?php if (isset($additional_product['min_price']) && isset($additional_product['max_price'])): ?>
                                    <?php
                                    // Apply markup to unit prices
                                    $add_min_price_unit = $additional_product['min_price'];
                                    $add_max_price_unit = $additional_product['max_price'];
//
//                                    if ($add_min_price_unit === $add_max_price_unit):
////                                        ?>
<!--                                        <div class="include-item-unit-price">-->
<!--                                            --><?php //echo sprintf(__('%s/m²', 'product-estimator'), display_price_with_markup($add_min_price_unit, $default_markup, "up")); ?>
<!--                                        </div>-->
<!---->
<!--                                    --><?php //else: ?>
<!--                                        <div class="include-item-unit-price">-->
<!--                                            --><?php //echo sprintf(__('%s - %s/m²', 'product-estimator'),
//                                                display_price_with_markup($add_min_price_unit, $default_markup, "down"),
//                                                display_price_with_markup($add_max_price_unit, $default_markup, "up")); ?>
<!--                                        </div>-->
<!--                                    --><?php //endif; ?>
                                <?php endif; ?>
                            </div>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; ?>
                </div>
                <?php
                // Include product upgrades template if available
                if (!isset($product['type']) || $product['type'] !== 'note') {
                    $upgrade_product_id = $additional_product['id'];
                    $upgrade_type = "additional_products";
                    if (file_exists(PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-upgrades-display.php')) {
                        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-upgrades-display.php';
                    }
                }
                ?>
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
