<?php
/**
 * Core plugin functions
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */

use RuDigital\ProductEstimator\Includes\Integration\WoocommerceIntegration;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Get plugin settings with defaults
 *
 * @since 1.0.0
 * @return array
 */
function product_estimator_get_settings() {
    $defaults = array(
        'currency' => 'USD',
        'decimal_points' => 2,
        'enable_logging' => true,
        'minimum_quantity' => 1,
        'maximum_quantity' => 1000,
        'enable_notifications' => true,
        'notification_email' => get_option('admin_email'),
        'preserve_data' => false
    );

    $settings = get_option('product_estimator_settings', array());
    return wp_parse_args($settings, $defaults);
}

/**
 * Get currency symbol
 *
 * @since 1.0.0
 * @param string $currency Currency code
 * @return string Currency symbol
 */
function product_estimator_get_currency_symbol($currency = '') {
    if (empty($currency)) {
        $settings = product_estimator_get_settings();
        $currency = $settings['currency'];
    }

    $symbols = array(
        'USD' => '$',
        'EUR' => '€',
        'GBP' => '£',
        'AUD' => '$'
    );

    return isset($symbols[$currency]) ? $symbols[$currency] : '$';
}

/**
 * Check if debug mode is enabled
 *
 * @since 1.0.0
 * @return bool
 */
function product_estimator_is_debug() {
    return defined('WP_DEBUG') && WP_DEBUG;
}

function product_estimator_round_price($price) {
    // Round to the nearest whole number (full amount)
    return round($price);
}


/**
 * Write to debug log if enabled
 *
 * @since 1.0.0
 * @param mixed $log Data to log
 */
function product_estimator_log($log) {
    if (product_estimator_is_debug()) {
        if (is_array($log) || is_object($log)) {
            error_log(print_r($log, true));
        } else {
            error_log($log);
        }
    }
}

function product_estimator_get_product_price($product_id, $room_area = null, $apply_markup = true, $custom_markup = null) {
    // Initialize result array
    $settings = get_option('product_estimator_settings');

    $result = array(
        'min_price' => 0,
        'max_price' => 0,
        'min_total' => 0,
        'max_total' => 0,
        'pricing_method' => $settings['default_pricing_method'], // Default
        'pricing_source' => $settings['default_pricing_source'], // Default
    );

    if(WoocommerceIntegration::isPriceIncluded($product_id)) {

        $result['pricing_method'] = 'price_included';
        $result['pricing_source'] = 'system';

        return $result;
    }

    // Validate product ID
    if (!$product_id || $product_id <= 0) {
        return $result;
    }

    // Get WooCommerce product
    $product = wc_get_product($product_id);
    if (!$product) {
        return $result;
    }

    // Check if product is a variation and get parent if needed
    $parent_product_id = null;
    $is_variation = false;

    if ($product->is_type('variation')) {
        $is_variation = true;
        $parent_product_id = $product->get_parent_id();
    }

    // Get pricing rule for this product
    // Get pricing rule for this product - use proper categories based on whether it's a variation
    if ($is_variation && $parent_product_id) {
        // For variations, use parent product categories for pricing rules
        $pricing_rule = product_estimator_get_pricing_rule_for_product_with_parent($product_id, $parent_product_id);
    } else {
        // For regular products, use their own categories
        $pricing_rule = product_estimator_get_pricing_rule_for_product($product_id);
    }

    $result['pricing_method'] = $pricing_rule['method'];
    $result['pricing_source'] = $pricing_rule['source'];

    // Get markup from settings or use custom value if provided
    $options = get_option('product_estimator_settings');
    $default_markup = isset($options['default_markup']) ? floatval($options['default_markup']) : 0;
    $markup = ($custom_markup !== null) ? floatval($custom_markup) : $default_markup;

    // Initialize pricing data
    $min_price = 0;
    $max_price = 0;

    // Get price based on source
    if ($result['pricing_source'] === 'website' || !function_exists('wc_get_product')) {
        // Use WooCommerce price
        $base_price = (float)$product->get_price();
        $min_price = $base_price;
        $max_price = $base_price;
    } else if ($result['pricing_source'] === 'netsuite') {
        // Try NetSuite pricing
        try {
            // Check if NetSuite Integration class exists
            if (class_exists('\\RuDigital\\ProductEstimator\\Includes\\Integration\\NetsuiteIntegration')) {
                // Initialize NetSuite Integration
                $netsuite_integration = new \RuDigital\ProductEstimator\Includes\Integration\NetsuiteIntegration();

                // Get pricing data for this product
                $pricing_data = $netsuite_integration->get_product_prices([$product_id]);

                // Check if we received valid pricing data
                if (!empty($pricing_data['prices']) && is_array($pricing_data['prices'])) {
                    foreach ($pricing_data['prices'] as $price_item) {
                        if ($price_item['product_id'] == $product_id) {
                            // Add NetSuite pricing data to product
                            $min_price = $price_item['min_price'];
                            $max_price = $price_item['max_price'];
                            break;
                        }
                    }
                }
            }

            // If NetSuite data not found, set defaults based on WC price
            if ($min_price === 0) {
                $base_price = (float)$product->get_price();
                $min_price = $base_price;
                $max_price = $base_price;
            }
        } catch (\Exception $e) {
            // If NetSuite API fails, log the error but continue with base price
            error_log('NetSuite API Error: ' . $e->getMessage());

            // Set default price range from WooCommerce price
            $base_price = (float)$product->get_price();
            $min_price = $base_price;
            $max_price = $base_price;
        }
    }

//    // Apply markup if requested
//    if ($apply_markup && $markup > 0) {
//        $min_price = $min_price * (1 - ($markup / 100));
//        $max_price = $max_price * (1 + ($markup / 100));
//    }


    // Store unit prices
    $result['min_price'] = $min_price;
    $result['max_price'] = $max_price;

    // Calculate total based on pricing method and room area
    if ($result['pricing_method'] === 'sqm' && $room_area > 0) {
        // Per square meter pricing - multiply by room area
        $min_total = $min_price * $room_area;
        $max_total = $max_price * $room_area;

    } else {
        // Fixed pricing - use price directly as total
        $min_total = $min_price;
        $max_total = $max_price;
    }

    // Store total prices
    $result['min_total'] = $min_total;
    $result['max_total'] = $max_total;

    return $result;
}

function product_estimator_get_product_price_for_display($product_id, $room_area = null, $apply_markup = true, $custom_markup = null) {
    // Initialize result array
    $settings = get_option('product_estimator_settings');

    $result = array(
        'min_price' => 0,
        'max_price' => 0,
        'min_total' => 0,
        'max_total' => 0,
        'pricing_method' => $settings['default_pricing_method'], // Default
        'pricing_source' => $settings['default_pricing_source'], // Default
    );

    // Validate product ID
    if (!$product_id || $product_id <= 0) {
        return $result;
    }

    // Get WooCommerce product
    $product = wc_get_product($product_id);
    if (!$product) {
        return $result;
    }

    // Get pricing rule for this product
    $pricing_rule = product_estimator_get_pricing_rule_for_product($product_id);
    $result['pricing_method'] = $pricing_rule['method'];
    $result['pricing_source'] = $pricing_rule['source'];

    // Get markup from settings or use custom value if provided
    $options = get_option('product_estimator_settings');
    $default_markup = isset($options['default_markup']) ? floatval($options['default_markup']) : 0;
    $markup = ($custom_markup !== null) ? floatval($custom_markup) : $default_markup;

    // Initialize pricing data
    $min_price = 0;
    $max_price = 0;

    // Get price based on source
    if ($result['pricing_source'] === 'website' || !function_exists('wc_get_product')) {
        // Use WooCommerce price
        $base_price = (float)$product->get_price();
        $min_price = $base_price;
        $max_price = $base_price;
    } else if ($result['pricing_source'] === 'netsuite') {
        // Try NetSuite pricing
        try {
            // Check if NetSuite Integration class exists
            if (class_exists('\\RuDigital\\ProductEstimator\\Includes\\Integration\\NetsuiteIntegration')) {
                // Initialize NetSuite Integration
                $netsuite_integration = new \RuDigital\ProductEstimator\Includes\Integration\NetsuiteIntegration();

                // Get pricing data for this product
                $pricing_data = $netsuite_integration->get_product_prices([$product_id]);

                // Check if we received valid pricing data
                if (!empty($pricing_data['prices']) && is_array($pricing_data['prices'])) {
                    foreach ($pricing_data['prices'] as $price_item) {
                        if ($price_item['product_id'] == $product_id) {
                            // Add NetSuite pricing data to product
                            $min_price = $price_item['min_price'];
                            $max_price = $price_item['max_price'];
                            break;
                        }
                    }
                }
            }

            // If NetSuite data not found, set defaults based on WC price
            if ($min_price === 0) {
                $base_price = (float)$product->get_price();
                $min_price = $base_price;
                $max_price = $base_price;
            }
        } catch (\Exception $e) {
            // If NetSuite API fails, log the error but continue with base price
            error_log('NetSuite API Error: ' . $e->getMessage());

            // Set default price range from WooCommerce price
            $base_price = (float)$product->get_price();
            $min_price = $base_price;
            $max_price = $base_price;
        }
    }

//    // Apply markup if requested
//    if ($apply_markup && $markup > 0) {
//        $min_price = $min_price * (1 - ($markup / 100));
//        $max_price = $max_price * (1 + ($markup / 100));
//    }


    // Store unit prices
    $result['min_price'] = $min_price;
    $result['max_price'] = $max_price;

    // Calculate total based on pricing method and room area
    if ($result['pricing_method'] === 'sqm' && $room_area > 0) {
        // Per square meter pricing - multiply by room area
        $min_total = $min_price * $room_area;
        $max_total = $max_price * $room_area;

    } else {
        // Fixed pricing - use price directly as total
        $min_total = $min_price;
        $max_total = $max_price;
    }

    // Store total prices
    $result['min_total'] = $min_total;
    $result['max_total'] = $max_total;

    return $result;
}


/**
 * Get the pricing rule for a product
 *
 * @param int $product_id The product ID
 * @return array The pricing rule with 'method' and 'source' keys, or default values
 */
function product_estimator_get_pricing_rule_for_product($product_id) {
    // Check if this is a variation and get the parent ID if it is
    $product = wc_get_product($product_id);
    $parent_id = null;

    if ($product && $product->is_type('variation')) {
        $parent_id = $product->get_parent_id();
    }

    // Use the more comprehensive function
    return product_estimator_get_pricing_rule_for_product_with_parent($product_id, $parent_id);
}

/**
 * Calculate the total price for a product including any auto-add products
 *
 * @param int $product_id The product ID
 * @param float $room_area Room area for per square meter calculations
 * @param float|null $custom_markup Custom markup percentage (if null, uses default from settings)
 * @return array Price data with min_total, max_total, breakdown
 */
function product_estimator_calculate_total_price_with_additions($product_id, $room_area, $custom_markup = null) {
    // Initialize result
    $result = [
        'min_total' => 0,
        'max_total' => 0,
        'breakdown' => []
    ];

    // Get main product price
    $main_product_price = product_estimator_get_product_price($product_id, $room_area, true, null);

    // Add main product to totals
    $result['min_total'] += $main_product_price['min_total'];
    $result['max_total'] += $main_product_price['max_total'];

    // Add main product to breakdown
    $product = wc_get_product($product_id);
    $product_name = $product ? $product->get_name() : "Product #$product_id";

    $result['breakdown'][] = [
        'id' => $product_id,
        'name' => $product_name,
        'min_price' => $main_product_price['min_price'],
        'max_price' => $main_product_price['max_price'],
        'min_total' => $main_product_price['min_total'],
        'max_total' => $main_product_price['max_total'],
        'pricing_method' => $main_product_price['pricing_method'],
        'type' => 'main'
    ];

    // Check for auto-add products if the ProductAdditionsManager is accessible
    if (class_exists('RuDigital\ProductEstimator\Includes\Admin\Settings\ProductAdditionsSettingsModule')) {
        $product_additions_manager = new \RuDigital\ProductEstimator\Includes\Admin\Settings\ProductAdditionsSettingsModule(
            'product-estimator',
            PRODUCT_ESTIMATOR_VERSION
        );

        // Get product categories
        $product_categories = wp_get_post_terms($product_id, 'product_cat', array('fields' => 'ids'));
        $auto_add_products = array();

        // Get auto-add products for all categories
        foreach ($product_categories as $category_id) {
            $category_auto_add_products = $product_additions_manager->get_auto_add_products_for_category($category_id);
            if (!empty($category_auto_add_products)) {
                $auto_add_products = array_merge($auto_add_products, $category_auto_add_products);
            }
        }

        // Remove duplicates and the main product itself
        $auto_add_products = array_unique($auto_add_products);
        $auto_add_products = array_diff($auto_add_products, [$product_id]);

        // Process each auto-add product
        foreach ($auto_add_products as $add_product_id) {
            // Get the auto-add product price
            $add_product_price = product_estimator_get_product_price($add_product_id, $room_area, false, null);

            // Add to totals
            $result['min_total'] += $add_product_price['min_total'];
            $result['max_total'] += $add_product_price['max_total'];

            // Add to breakdown
            $add_product = wc_get_product($add_product_id);
            $add_product_name = $add_product ? $add_product->get_name() : "Product #$add_product_id";

            $result['breakdown'][] = [
                'id' => $add_product_id,
                'name' => $add_product_name,
                'min_price' => $add_product_price['min_price'],
                'max_price' => $add_product_price['max_price'],
                'min_total' => $add_product_price['min_total'],
                'max_total' => $add_product_price['max_total'],
                'pricing_method' => $add_product_price['pricing_method'],
                'type' => 'auto_add'
            ];
        }
    }

    return $result;
}

/**
 * Calculate the total price for a product including any auto-add products
 *
 * @param array $product The product array
 * @param float $room_area Room area for per square meter calculations
 * @param float|null $custom_markup Custom markup percentage (if null, uses default from settings)
 * @return array Price data with min_total, max_total, breakdown
 */
function product_estimator_calculate_total_price_with_additions_for_display($product, $custom_markup = null) {

    // Initialize result
    $result = [
        'min_total' => 0,
        'max_total' => 0,
        'breakdown' => []
    ];

    // Add main product to totals
    $result['min_total'] += $product['min_price_total'];
    $result['max_total'] += $product['max_price_total'];

    // Add main product to breakdown
    $product_name = $product['name'];

    $result['breakdown'][] = [
        'id' => $product['id'],
        'name' => $product_name,
        'min_price' => $product['min_price'],
        'max_price' => $product['max_price'],
        'min_total' => $product['min_price_total'],
        'max_total' => $product['max_price_total'],
        'pricing_method' => $product['pricing_method'],
        'type' => 'main'
    ];

    // Check for auto-add products if the ProductAdditionsManager is accessible
    if (class_exists('RuDigital\ProductEstimator\Includes\Admin\Settings\ProductAdditionsSettingsModule')) {
        $product_additions_manager = new \RuDigital\ProductEstimator\Includes\Admin\Settings\ProductAdditionsSettingsModule(
            'product-estimator',
            PRODUCT_ESTIMATOR_VERSION
        );

        $product_id_for_categories = $product['id'];
        $productObj = wc_get_product($product['id']);
        if ($productObj->is_type('variation')) {
            // Get the parent product ID for getting categories
            $product_id_for_categories = $productObj->get_parent_id();
        }



        // Get product categories
        $product_categories = wp_get_post_terms($product_id_for_categories, 'product_cat', array('fields' => 'ids'));
        $auto_add_products = array();

        // Get auto-add products for all categories
        foreach ($product_categories as $category_id) {
            $category_auto_add_products = $product_additions_manager->get_auto_add_products_for_category($category_id);

            if (!empty($category_auto_add_products)) {
                $auto_add_products = array_merge($auto_add_products, $category_auto_add_products);
            }
        }

        // Remove duplicates and the main product itself
        $auto_add_products = array_unique($auto_add_products);

        $auto_add_products = array_diff($auto_add_products, [$product['id']]);


        // Process each auto-add product
        foreach ($auto_add_products as $key => $auto_add_product) {
            // Get the auto-add product price


            $add_product_price = $product['additional_products'][$key];

            // Add to totals
            $result['min_total'] += $add_product_price['min_price_total'];
            $result['max_total'] += $add_product_price['max_price_total'];

            $result['breakdown'][] = [
                'id' => $auto_add_product,
                'name' => $add_product_price['name'],
                'min_price' => $add_product_price['min_price'],
                'max_price' => $add_product_price['max_price'],
                'min_total' => $add_product_price['min_price_total'],
                'max_total' => $add_product_price['max_price_total'],
                'pricing_method' => $add_product_price['pricing_method'],
                'type' => 'auto_add'
            ];
        }
    }

    return $result;
}

function display_price_with_markup($price, $markup, $direction = null) {
    $final_price_with_markup = $price;
//    echo "<br>Markup: " . $markup . "<br>";
    switch ($direction) {
        case 'up':
            $final_price_with_markup = $price * (1 + ($markup / 100));
            break;
        case 'down':
            $final_price_with_markup = $price / (1 + ($markup / 100));
            break;
    }
    return wc_price(round($final_price_with_markup));
}

/**
 * Get the pricing rule for a product with proper handling for variations
 * This function specifically considers the parent product categories for variations
 *
 * @param int $product_id The product ID
 * @param int|null $parent_id The parent product ID (for variations)
 * @return array The pricing rule with 'method' and 'source' keys, or default values
 */
function product_estimator_get_pricing_rule_for_product_with_parent($product_id, $parent_id = null) {
    // Get global settings
    $settings = get_option('product_estimator_settings');

    // Use defaults from settings if available, otherwise fall back to hardcoded defaults
    $default_rule = [
        'method' => isset($settings['default_pricing_method']) ? $settings['default_pricing_method'] : 'sqm',
        'source' => isset($settings['default_pricing_source']) ? $settings['default_pricing_source'] : 'website'
    ];

    // Return default rule if WooCommerce is not active or product ID is invalid
    if (!function_exists('wp_get_post_terms') || (empty($product_id) && empty($parent_id))) {
        return $default_rule;
    }

    // Get product categories - use parent product categories for variations
    if ($parent_id) {
        $product_categories = wp_get_post_terms($parent_id, 'product_cat', ['fields' => 'ids']);
    } else {
        $product_categories = wp_get_post_terms($product_id, 'product_cat', ['fields' => 'ids']);
    }

    if (empty($product_categories) || is_wp_error($product_categories)) {
        return $default_rule;
    }

    // Get all pricing rules
    $pricing_rules = get_option('product_estimator_pricing_rules', []);

    if (empty($pricing_rules)) {
        return $default_rule;
    }

    // Check each rule to find one that applies to this product's categories
    foreach ($pricing_rules as $rule) {
        if (!isset($rule['categories']) || !is_array($rule['categories'])) {
            continue;
        }

        // Check if any of this product's categories match the rule's categories
        $matching_categories = array_intersect($product_categories, $rule['categories']);

        if (!empty($matching_categories)) {
            // Found a matching rule, return its method and source
            return [
                'method' => isset($rule['pricing_method']) ? $rule['pricing_method'] : $default_rule['method'],
                'source' => isset($rule['pricing_source']) ? $rule['pricing_source'] : $default_rule['source']
            ];
        }
    }

    // No matching rule found, return default
    return $default_rule;
}

/**
 * Display a price range graph for product estimator
 *
 * @param float $min_price The minimum price
 * @param float $max_price The maximum price
 * @param float $markup The markup percentage
 * @param string $title Product/room/estimate title
 * @param string $dimensions Room dimensions (if applicable)
 * @param string $pricing_method Pricing method (sqm or fixed)
 * @param array $options Optional display options
 */
function display_price_graph($min_price, $max_price, $markup = 0, $title = null, $dimensions = null, $pricing_method = null, $options = []) {
    // Default options
    $defaults = [
        'width' => '100%',
        'height' => '20px',
        'bar_color' => '#4CAF50', // Green color
        'bg_color' => '#e0e0e0',  // Light gray background
        'show_labels' => true,
        'label_count' => 6,       // Number of labels to show (including start and end)
        'round_to' => 1000,       // Round values to nearest thousand
        'min_bar_width' => 50,    // Minimum width percentage for small ranges
        'min_display_range' => 0.3 // Minimum display range as fraction of price
    ];

    // Merge user options with defaults
    $options = wp_parse_args($options, $defaults);

    // For very close min/max prices, create an artificial range for better visualization
    $price_range = $max_price - $min_price;
    $is_narrow_range = $price_range < ($min_price * 0.05); // If range is less than 5% of min price

    // Calculate the center point of our price range
    $center_price = ($min_price + $max_price) / 2;

    // For narrow ranges, create a symmetric display range around the center point
    if ($is_narrow_range) {
        $range_padding = $center_price * $options['min_display_range'];
        $display_min = max(0, $center_price - $range_padding);
        $display_max = $center_price + $range_padding;
    } else {
        // Calculate rounded range with reasonable padding for normal ranges
        $round_to = $options['round_to'];

        // Use a smaller rounding factor for products with smaller price ranges
        if ($price_range < $round_to) {
            $round_to = max(100, ceil($price_range / 4 / 100) * 100); // Make divisible by 100
        }

        $display_min = floor($min_price / $round_to) * $round_to;
        $display_min = max(0, $display_min - $round_to); // Ensure at least one step below min

        $display_max = ceil($max_price / $round_to) * $round_to + $round_to; // At least one step above max
    }

    $display_range = $display_max - $display_min;

    // Calculate percentages for the green bar - ensure we have a valid range
    if ($display_range > 0) {
        $left_percent = ($min_price - $display_min) / $display_range * 100;
        $width_percent = ($max_price - $min_price) / $display_range * 100;

        // Ensure small ranges are still clearly visible
        if ($width_percent < $options['min_bar_width']) {
            // If bar is too narrow, increase its width
            $adjustment = ($options['min_bar_width'] - $width_percent) / 2;
            $left_percent = max(0, $left_percent - $adjustment);
            $width_percent = $options['min_bar_width'];

            // Make sure the adjusted bar doesn't exceed 100%
            if ($left_percent + $width_percent > 100) {
                $left_percent = 100 - $width_percent;
            }
        }
    } else {
        $left_percent = 35; // Center the bar more if range calculation fails
        $width_percent = $options['min_bar_width']; // Use minimum width
    }

    // Ensure we have reasonable values (fallback for edge cases)
    $left_percent = max(0, min(80, $left_percent));
    $width_percent = max($options['min_bar_width'], min(100 - $left_percent, $width_percent));

    // Format prices for display using the display_price_with_markup function
    $formatted_min = display_price_with_markup($min_price, $markup, "down");
    $formatted_max = display_price_with_markup($max_price, $markup, "up");

    // Output CSS only once
    static $css_output = false;
    if (!$css_output) {
        // CSS is removed as requested - it's in the product-estimator-modal.css file
        $css_output = true;
    }

    // Output HTML
    ?>
    <div class="price-graph-container">
        <div class="price-range-title">
            <span class="price-title">
                <?php echo $title; ?>

                <?php if ($pricing_method == "sqm"): ?>
                        <span class="price-dimensions"><?php echo $dimensions; ?>&#13217</span>
                <?php elseif($pricing_method == "m"): ?>
                    <span class="price-dimensions"><?php echo $dimensions; ?>m</span>
<!--                --><?php //else: ?>
<!--                    <span class="price-dimensions">--><?php //echo $dimensions; ?><!--</span>-->
                <?php endif; ?>
            </span>
            <?php if($min_price > 0 && $max_price > 0): ?>
            <span class="room-price"><?php echo $formatted_min; ?> - <?php echo $formatted_max; ?></span>
            <?php endif; ?>
        </div>

    <?php if($min_price > 0 && $max_price > 0): ?>
        <div class="price-graph-bar <?php echo $is_narrow_range ? 'narrow-range' : ''; ?>" style="height: <?php echo esc_attr($options['height']); ?>; background-color: <?php echo esc_attr($options['bg_color']); ?>; position: relative;">
            <div class="price-graph-range" style="position: absolute; left: <?php echo esc_attr($left_percent); ?>%; width: <?php echo esc_attr($width_percent); ?>%; top: 0; bottom: 0; background-color: <?php echo esc_attr($options['bar_color']); ?>;"></div>
        </div>
    <?php endif; ?>
    <?php if($min_price > 0 && $max_price > 0): ?>

        <?php if ($options['show_labels']): ?>
            <div class="price-graph-labels">
                <?php
                $label_count = $options['label_count'];

                // For narrow ranges, use friendlier increments
                if ($is_narrow_range) {
                    if ($label_count > 4) {
                        $label_count = 4;
                    }

                    // Determine a nice round step value based on the price range
                    $range_magnitude = $display_range / ($label_count - 1);

                    // Choose step sizes that make sense based on magnitude for narrow ranges
                    if ($range_magnitude >= 2000) {
                        $step = 1000; // Use $1000 increments for larger ranges
                    } elseif ($range_magnitude >= 1000) {
                        $step = 500; // Use $500 increments for medium ranges
                    } elseif ($range_magnitude >= 200) {
                        $step = 200; // Use $200 increments
                    } elseif ($range_magnitude >= 100) {
                        $step = 100; // Use $100 increments
                    } elseif ($range_magnitude >= 50) {
                        $step = 50; // Use $50 increments
                    } elseif ($range_magnitude >= 20) {
                        $step = 20; // Use $20 increments
                    } elseif ($range_magnitude >= 10) {
                        $step = 10; // Use $10 increments
                    } else {
                        $step = 5; // Use $5 increments for very small ranges
                    }

                    // Adjust display range to start and end on nice round numbers
                    $display_min = floor($min_price / $step) * $step;

                    // For cases where we need extra space on the low end
                    if ($display_min > $min_price - ($step * 0.5)) {
                        $display_min -= $step;
                    }

                    // Calculate how many steps we need for a clean display
                    $total_steps = ceil(($max_price - $display_min) / $step) + 1;

                    // Make sure we have at least the minimum number of steps for good visualization
                    $total_steps = max($total_steps, $label_count);

                    // Calculate the max based on steps
                    $display_max = $display_min + ($step * ($total_steps - 1));

                    // Calculate how many labels to actually display (usually equal to label_count)
                    $labels_to_show = min($total_steps, $label_count);

                    // Calculate the step between each displayed label
                    $display_step = ($total_steps - 1) / ($labels_to_show - 1);

                    for ($i = 0; $i < $labels_to_show; $i++) {
                        // Get the label index (evenly distributed across the range)
                        $step_index = round($i * $display_step);

                        // Calculate the actual value and position
                        $current_value = $display_min + ($step_index * $step);
                        $percent_position = ($step_index / ($total_steps - 1)) * 100;

                        // Format the price without decimals
                        $formatted_value = '$' . number_format($current_value, 0);
                        ?>
                        <div class="price-label" style="left: <?php echo esc_attr($percent_position); ?>%;">
                            <div class="price-tick"></div>
                            <div class="price-value"><?php echo $formatted_value; ?></div>
                        </div>
                        <?php
                    }
                } else {
                    // For normal ranges, use standard evenly spaced labels
                    $step = $display_range / ($label_count - 1);

                    for ($i = 0; $i < $label_count; $i++) {
                        $current_value = $display_min + ($i * $step);
                        $percent_position = ($i / ($label_count - 1)) * 100;

                        // Format the price without decimals
                        $formatted_value = '$' . number_format($current_value, 0);
                        ?>
                        <div class="price-label" style="left: <?php echo esc_attr($percent_position); ?>%;">
                            <div class="price-tick"></div>
                            <div class="price-value"><?php echo $formatted_value; ?></div>
                        </div>
                        <?php
                    }
                }
                ?>
            </div>
        <?php endif; ?>
    <?php endif; ?>
    </div>
    <?php
}


/**
 * PDF Helper Functions
 *
 * These functions should be added to the includes/functions.php file
 */

/**
 * Get the URL for viewing a PDF of an estimate
 *
 * @param int $estimate_id The database ID of the estimate
 * @return string The URL for viewing the PDF
 */
function product_estimator_get_pdf_url($estimate_id)
{
    if (empty($estimate_id)) {
        return '';
    }

    // Convert to integer to ensure it's a valid ID
    $estimate_id = intval($estimate_id);
    if ($estimate_id <= 0) {
        return '';
    }

    // Return the URL with the estimate ID
    return home_url('/product-estimator/pdf/' . $estimate_id);
}

/**
 * Output a button or link to view the PDF of an estimate
 *
 * @param int $estimate_id The database ID of the estimate
 * @param string $text The text for the button (default: 'View PDF')
 * @param string $type The type of element to output ('button' or 'link', default: 'button')
 * @param array $attrs Additional attributes for the element
 * @return string The HTML for the button or link
 */
function product_estimator_pdf_button($estimate_id, $text = '', $type = 'button', $attrs = array())
{
    if (empty($estimate_id)) {
        return '';
    }

    // Default text if not provided
    if (empty($text)) {
        $text = __('View PDF', 'product-estimator');
    }

    // Get the URL
    $url = product_estimator_get_pdf_url($estimate_id);
    if (empty($url)) {
        return '';
    }

    // Default attributes
    $default_attrs = array(
        'class' => 'product-estimator-pdf-' . $type,
        'target' => '_blank',
    );

    // Merge with user attributes
    $attrs = wp_parse_args($attrs, $default_attrs);

    // Build attribute string
    $attr_string = '';
    foreach ($attrs as $key => $value) {
        $attr_string .= ' ' . esc_attr($key) . '="' . esc_attr($value) . '"';
    }

    // Generate HTML based on type
    if ($type === 'link') {
        return '<a href="' . esc_url($url) . '"' . $attr_string . '>' . esc_html($text) . '</a>';
    } else {
        return '<button type="button" onclick="window.open(\'' . esc_url($url) . '\', \'_blank\')"' . $attr_string . '>' . esc_html($text) . '</button>';
    }
}

/**
 * Check if an estimate has been stored in the database
 *
 * @param mixed $estimate_id The session estimate ID or estimate array
 * @return int|false The database ID if stored, false otherwise
 */
function product_estimator_get_db_id($estimate_id)
{
    // If we have the EstimateDbHandler trait directly available in this scope
    if (function_exists('getEstimateDbId')) {
        return getEstimateDbId($estimate_id);
    }

    // Otherwise use the session to check
    $session = \RuDigital\ProductEstimator\Includes\SessionHandler::getInstance();

    // If we got an ID, get the estimate from session
    if (is_string($estimate_id) || is_numeric($estimate_id)) {
        $estimate = $session->getEstimate($estimate_id);

        // If not found in session, return false
        if (!$estimate) {
            return false;
        }

        // Return the db_id if set
        return isset($estimate['db_id']) ? (int)$estimate['db_id'] : false;
    }

    // If we got an estimate array directly
    if (is_array($estimate_id)) {
        return isset($estimate_id['db_id']) ? (int)$estimate_id['db_id'] : false;
    }

    return false;
}
//
//// Add directly to functions.php for testing
//add_action('init', function() {
//    add_rewrite_rule(
//        'product-estimator/pdf/([0-9]+)/?$',
//        'index.php?product_estimator_pdf=1&estimate_id=$matches[1]',
//        'top'
//    );
//    flush_rewrite_rules();
//}, 20);
