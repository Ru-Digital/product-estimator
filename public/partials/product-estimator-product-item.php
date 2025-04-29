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
                    // Room area display - ensure values are floats
                    $room_width = isset($room['width']) ? floatval($room['width']) : 0;
                    $room_length = isset($room['length']) ? floatval($room['length']) : 0;
                    $room_area = isset($product['room_area']) ? floatval($product['room_area']) : ($room_width * $room_length);

                    // Check if required price data exists
                    $price_data = [];
                    if (function_exists('product_estimator_calculate_total_price_with_additions_for_display')) {
                        $price_data = product_estimator_calculate_total_price_with_additions_for_display($product);
                    }

                    // Set default values
                    $min_price = isset($product['min_price']) ? $product['min_price'] : 0;
                    $max_price = isset($product['max_price']) ? $product['max_price'] : 0;
                    $min_total = isset($product['min_price_total']) ? $product['min_price_total'] : 0;
                    $max_total = isset($product['max_price_total']) ? $product['max_price_total'] : 0;
                    $pricing_source = isset($product['pricing_source']) ? $product['pricing_source'] : '';
                    $pricing_method = isset($product['pricing_method']) ? $product['pricing_method'] : 'sqm';

                    // Get breakdown data if available
                    $price_breakdown = isset($price_data['breakdown']) ? $price_data['breakdown'] : [];
                    $has_auto_add = !empty($price_breakdown) && count($price_breakdown) > 1;

                    // Use price data values if available
                    if (!empty($price_data)) {
                        $min_price = isset($price_data['min_total']) ? $price_data['min_total'] : $min_price;
                        $max_price = isset($price_data['max_total']) ? $price_data['max_total'] : $max_price;
                    }

                    if ($has_auto_add && isset($price_breakdown[0])) {
                        $main_product = $price_breakdown[0];
                        // Update pricing method if available in breakdown
                        if (isset($main_product['pricing_method'])) {
                            $pricing_method = $main_product['pricing_method'];
                        }
                    }
                    ?>

                    <?php
                    // Display the price graph if the function exists
                    if (function_exists('display_price_graph')) {
                        display_price_graph(
                            $min_price,
                            $max_price,
                            $default_markup,
                            esc_html($product['name']),
                            $room_area,
                            $pricing_method,
                            [
                                'label_count' => 6,
                                'min_bar_width' => 5
                            ]
                        );
                    } else {
                        // Fallback if function doesn't exist
                        echo '<span class="product-name">' . esc_html($product['name']) . '</span>';

                        if (isset($min_total) && isset($max_total)) {
                            if ($min_total === $max_total) {
                                echo '<span class="product-price">' .
                                    (function_exists('display_price_with_markup') ?
                                        display_price_with_markup($min_total, $default_markup, "up") :
                                        wc_price($min_total)) . '</span>';
                            } else {
                                echo '<span class="product-price">' .
                                    (function_exists('display_price_with_markup') ?
                                        display_price_with_markup($min_total, $default_markup, "down") . ' - ' .
                                        display_price_with_markup($max_total, $default_markup, "up") :
                                        wc_price($min_total) . ' - ' . wc_price($max_total)) . '</span>';
                            }
                        }
                    }
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
    if ($has_auto_add && !empty($price_breakdown)):
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
                    <?php foreach ($price_breakdown as $index => $additional_product):
                        // Skip the first item as it's the main product
                        if ($index === 0) continue;
                        ?>
                        <div class="include-item">
                            <span class="product-includes-icon">
                                <span class="dashicons dashicons-plus-alt"></span>
                            </span>
                            <div class="include-item-name">
                                <?php echo isset($additional_product['name']) ? esc_html($additional_product['name']) : ''; ?>
                            </div>
                            <?php if(isset($additional_product['min_total']) && $additional_product['min_total'] > 0 &&
                                isset($additional_product['max_total']) && $additional_product['max_total'] > 0 ): ?>
                                <div class="include-item-prices">
                                    <?php if (isset($additional_product['min_total']) && isset($additional_product['max_total'])): ?>
                                        <?php
                                        // Apply markup to additional product prices for total
                                        $add_min_total = $additional_product['min_total'];
                                        $add_max_total = $additional_product['max_total'];

                                        if ($add_min_total === $add_max_total):
                                            ?>
                                            <div class="include-item-total-price">
                                                <?php echo function_exists('display_price_with_markup') ?
                                                    display_price_with_markup($add_min_total, $default_markup, null) :
                                                    wc_price($add_min_total); ?>
                                            </div>
                                        <?php else: ?>
                                            <div class="include-item-total-price">
                                                <?php
                                                if (function_exists('display_price_with_markup')) {
                                                    echo display_price_with_markup($add_min_total, $default_markup, "down") .
                                                        ' - ' .
                                                        display_price_with_markup($add_max_total, $default_markup, "up");
                                                } else {
                                                    echo wc_price($add_min_total) . ' - ' . wc_price($add_max_total);
                                                }
                                                ?>
                                            </div>
                                        <?php endif; ?>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; ?>
                </div>
                <?php
                // Include product upgrades template if available
                if (!isset($product['type']) || $product['type'] !== 'note') {
                    // Make sure we have a valid product ID for upgrades
                    $upgrade_product_id = isset($product['id']) ? $product['id'] : 0;
                    $upgrade_type = "additional_products";
                    if (file_exists(PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-upgrades-display.php')) {
                        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-upgrades-display.php';
                    }
                }
                ?>
            </div>
        </div>
    <?php elseif ($has_includes): ?>
        <!-- Includes Toggle Button for original additional_products -->
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
                                <?php echo isset($additional_product['name']) ? esc_html($additional_product['name']) : ''; ?>
                            </div>
                            <?php if(isset($additional_product['min_price_total']) && $additional_product['min_price_total'] > 0 &&
                                isset($additional_product['max_price_total']) && $additional_product['max_price_total'] > 0 ): ?>
                                <div class="include-item-prices">
                                    <?php
                                    $add_min_total = $additional_product['min_price_total'];
                                    $add_max_total = $additional_product['max_price_total'];

                                    if ($add_min_total === $add_max_total):
                                        ?>
                                        <div class="include-item-total-price">
                                            <?php echo function_exists('display_price_with_markup') ?
                                                display_price_with_markup($add_min_total, $default_markup, null) :
                                                wc_price($add_min_total); ?>
                                        </div>
                                    <?php else: ?>
                                        <div class="include-item-total-price">
                                            <?php
                                            if (function_exists('display_price_with_markup')) {
                                                echo display_price_with_markup($add_min_total, $default_markup, "down") .
                                                    ' - ' .
                                                    display_price_with_markup($add_max_total, $default_markup, "up");
                                            } else {
                                                echo wc_price($add_min_total) . ' - ' . wc_price($add_max_total);
                                            }
                                            ?>
                                        </div>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>
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
