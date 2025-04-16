<?php
/**
 * Core plugin functions
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */

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
 * Format currency amount
 *
 * @since 1.0.0
 * @param float $amount
 * @return string
 */
function product_estimator_format_currency($amount) {
    $settings = product_estimator_get_settings();
    $decimals = absint($settings['decimal_points']);
    $symbol = product_estimator_get_currency_symbol($settings['currency']);

    return $symbol . number_format($amount, $decimals);
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
 * Send notification email
 *
 * @since 1.0.0
 * @param array $data Calculation data
 * @param float $result Calculation result
 * @return bool Whether the email was sent successfully
 */
function product_estimator_send_notification($data, $result) {
    $settings = product_estimator_get_settings();

    if (!$settings['enable_notifications']) {
        return false;
    }

    $to = $settings['notification_email'];
    $subject = sprintf(
        __('New Product Estimate - %s', 'product-estimator'),
        product_estimator_format_currency($result)
    );

    $message = sprintf(
        __("A new product estimate has been calculated:\n\nResult: %s\nUser: %s\nDate: %s\n\nCalculation Details:\n%s", 'product-estimator'),
        product_estimator_format_currency($result),
        wp_get_current_user()->display_name,
        current_time('mysql'),
        print_r($data, true)
    );

    $headers = array('Content-Type: text/plain; charset=UTF-8');

    return wp_mail($to, $subject, $message, $headers);
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

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Product ID {$product_id} is a variation of parent ID {$parent_product_id}");
        }
    }

    // Get pricing rule for this product
    // Get pricing rule for this product - use proper categories based on whether it's a variation
    if ($is_variation && $parent_product_id) {
        // For variations, use parent product categories for pricing rules
        $pricing_rule = product_estimator_get_pricing_rule_for_product_with_parent($product_id, $parent_product_id);

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Using parent-based pricing rule for variation: " . print_r($pricing_rule, true));
        }
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

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("Using parent product ID {$product_id_for_categories} for categories of variation {$product['id']}");
            }
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
        foreach ($auto_add_products as $add_product_id => $auto_add_product) {
            // Get the auto-add product price

            $add_product_price = $product['additional_products'][$add_product_id];

            // Add to totals
            $result['min_total'] += $add_product_price['min_price_total'];
            $result['max_total'] += $add_product_price['max_price_total'];

            $result['breakdown'][] = [
                'id' => $add_product_id,
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
    return wc_price($final_price_with_markup);
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

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Using parent product categories for pricing rules: " . implode(', ', $product_categories));
        }
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
