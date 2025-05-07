<?php
/**
 * Core plugin functions
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */

use RuDigital\ProductEstimator\Includes\Integration\WoocommerceIntegration;
use RuDigital\ProductEstimator\Includes\SessionHandler;

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
    $product_additions_manager = new \RuDigital\ProductEstimator\Includes\Frontend\ProductAdditionsFrontend('product-estimator', PRODUCT_ESTIMATOR_VERSION);

    if ($product_additions_manager) {

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
    $product_additions_manager = new \RuDigital\ProductEstimator\Includes\Frontend\ProductAdditionsFrontend('product-estimator', PRODUCT_ESTIMATOR_VERSION);

    if ($product_additions_manager) {

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

function calculate_price_with_markup($price, $markup, $direction = null) {
    $final_price = $price;
    switch ($direction) {
        case 'up':
            $final_price = $price * (1 + ($markup / 100));
            break;
        case 'down':
            $final_price = $price / (1 + ($markup / 100));
            break;
    }
    return round($final_price, 2); // RETURN numeric value
}

function display_price_with_markup($price, $markup, $direction = null) {
    $numeric_price = calculate_price_with_markup($price, $markup, $direction);
    return wc_price($numeric_price);
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
 * PDF Helper Functions
 *
 * These functions should be added to the includes/functions.php file
 */
function product_estimator_calculate_price_steps($min_price, $max_price, $options = []) {
    $round_to = isset($options['round_to']) ? floatval($options['round_to']) : null;
    $label_count = isset($options['label_count']) ? intval($options['label_count']) : 6;

    $min_price = max(0, floatval($min_price));
    $max_price = max($min_price, floatval($max_price));
    $raw_range = $max_price - $min_price;

    if ($raw_range <= 0) {
        $raw_range = 1;
    }

    // Force smaller roundings for tight ranges
    if (!$round_to) {
        if ($raw_range <= 1000) {
            $round_to = 100;
        } elseif ($raw_range <= 5000) {
            $round_to = 500;
        } elseif ($raw_range <= 10000) {
            $round_to = 1000;
        } elseif ($raw_range <= 50000) {
            $round_to = 2000;
        } else {
            $round_to = 5000;
        }
    }

    // Force graph to expand to a clean nice set of steps
    $step_count = max(1, $label_count - 1);
    $target_step_size = ceil($raw_range / $step_count / 100) * 100;

    // Adjust rounded min and max
    $rounded_min = floor($min_price / 100) * 100;
    $rounded_max = ceil($max_price / 100) * 100;

    // Expand outward to nearest "pretty" labels
    $scale_min = $rounded_min - ($target_step_size * 2);
    $scale_max = $rounded_max + ($target_step_size * 2);

    if ($scale_min < 0) {
        $scale_min = 0;
    }

    $scale_range = $scale_max - $scale_min;
    if ($scale_range <= 0) {
        $scale_range = 1;
    }

    // Steps
    $nice_step_size = ceil($scale_range / $step_count / 100) * 100;

    // Build nice label steps
    $step_values = [];
    for ($i = 0; $i <= $step_count; $i++) {
        $value = $scale_min + ($i * $nice_step_size);
//        $percent = ($value - $scale_min) / ($scale_max - $scale_min) * 100;
        $percent = ($i / $step_count) * 100;
        $step_values[] = [
            'value' => round($value),
            'percent' => $percent,
            'formatted' => '$' . number_format(round($value), 0)
        ];
    }

    return [
        'display_min' => $scale_min,
        'display_max' => $scale_max,
        'display_range' => $scale_range,
        'step_values' => $step_values
    ];
}
/**
 * Calculate the position of the price range bar on the graph
 *
 * @param float $min_price The minimum price
 * @param float $max_price The maximum price
 * @param array $options Optional display options
 * @return array Bar position data
 */
function calculate_price_graph_bar_position($min_price, $max_price, $options = []) {
    $price_steps = product_estimator_calculate_price_steps($min_price, $max_price, $options);

    $scale_min = floatval($price_steps['display_min']);
    $scale_max = floatval($price_steps['display_max']);
    $scale_range = $scale_max - $scale_min;

    if ($scale_range <= 0) {
        $scale_range = 1;
    }

    $min_price = floatval($min_price);
    $max_price = floatval($max_price);

    // Calculate bar position
    $left_percent = (($min_price - $scale_min) / $scale_range) * 100;
    $right_percent = (($max_price - $scale_min) / $scale_range) * 100;
    $width_percent = $right_percent - $left_percent;

    // Ensure values are valid
    $left_percent = round(max(0, min($left_percent, 100)), 2);
    $width_percent = round(max(0, min($width_percent, 100 - $left_percent)), 2);


    return [
        'bar_left_percent' => $left_percent,
        'bar_width_percent' => $width_percent,
        'label_values' => $price_steps['step_values'],
        'scale_min' => $scale_min,
        'scale_max' => $scale_max
    ];
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
        'label_count' => 6,       // Number of labels to show
        'min_bar_width' => 5,     // Minimum width percentage
        'round_to' => 1000        // Round labels to nearest value
    ];

    $options = wp_parse_args($options, $defaults);

    // ✅ First adjust prices numerically (NOT formatted!)
    $price_min_adjusted = calculate_price_with_markup($min_price, $markup, 'down');
    $price_max_adjusted = calculate_price_with_markup($max_price, $markup, 'up');

    // ✅ Get bar position using adjusted prices
    $position = calculate_price_graph_bar_position($price_min_adjusted, $price_max_adjusted, $options);

    $left_percent = $position['bar_left_percent'];
    $width_percent = $position['bar_width_percent'];
    $step_values = $position['label_values'];

    // ✅ Format for display
    $formatted_min = wc_price($price_min_adjusted);
    $formatted_max = wc_price($price_max_adjusted);

    // Small range class if width is tiny
    $small_range_class = ($width_percent <= 8) ? ' small-range' : '';


    // ✅ Output graph HTML
    ?>
    <div class="price-graph-container">
        <div class="price-range-title">
            <span class="price-title">
                <?php echo esc_html($title); ?>
                <?php if ($pricing_method == "sqm"): ?>
                    <span class="price-dimensions"><?php echo esc_html($dimensions); ?>&#13217;</span>
                <?php elseif ($pricing_method == "m"): ?>
                    <span class="price-dimensions"><?php echo esc_html($dimensions); ?>m</span>
                <?php endif; ?>
            </span>
            <?php if ($min_price > 0 && $max_price > 0): ?>
                <span class="room-price"><?php echo $formatted_min; ?> - <?php echo $formatted_max; ?></span>
            <?php endif; ?>
        </div>

        <?php if ($min_price > 0 && $max_price > 0): ?>
            <div class="price-graph-bar" style="position: relative; height: <?php echo esc_attr($options['height']); ?>; background-color: <?php echo esc_attr($options['bg_color']); ?>;">
                <div class="price-graph-range<?php echo $small_range_class; ?>" style="
                    position: absolute;
                    left: <?php echo esc_attr($left_percent); ?>%;
                    width: <?php echo esc_attr($width_percent); ?>%;
                    top: 0;
                    bottom: 0;
                    height: 100%;
                    background-color: <?php echo esc_attr($options['bar_color']); ?>;
                    margin: 0;">
                </div>
            </div>
        <?php endif; ?>

        <?php if ($min_price > 0 && $max_price > 0 && $options['show_labels']): ?>
            <div class="price-graph-labels">
                <?php foreach ($step_values as $index => $step): ?>
                    <?php
                    $percent = floatval($step['percent']);
                    $is_last = ($index === array_key_last($step_values));
                    $left = $is_last ? 100 : min($percent, 100);
                    $transform = $is_last ? 'transform: translateX(-100%);' : '';
                    ?>
                    <div class="price-label" style="left: <?php echo esc_attr($left); ?>%; <?php echo $transform; ?>">
                        <div class="price-tick"></div>
                        <div class="price-value"><?php echo esc_html($step['formatted']); ?></div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

    <div class="price-notice">
        <?php
        global $product_estimator_labels_frontend;
        echo $product_estimator_labels_frontend->get_label('label_price_graph_notice');
        ?>
    </div>
    </div>

    <?php
}




/**
 * Get the URL for viewing a PDF of an estimate
 *
 * @param int $estimate_id The database ID of the estimate
 * @param bool $for_customer Whether this is for customer view (true) or admin view (false)
 * @return string The URL for viewing the PDF
 */
function product_estimator_get_pdf_url($estimate_id, $for_customer = true) {
    if (empty($estimate_id)) {
        return '';
    }

    // Admin view (internal use)
    if (!$for_customer && current_user_can('manage_options')) {
        return home_url('/product-estimator/pdf/admin/' . $estimate_id);
    }

    // Customer view (secure token)
    $pdf_handler = new \RuDigital\ProductEstimator\Includes\PDFRouteHandler();
    $token = $pdf_handler->generate_secure_pdf_token($estimate_id);

    if (!$token) {
        return '';
    }

    return home_url('/product-estimator/pdf/view/' . $token);
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

/**
 * Get customer email from estimate data or session.
 *
 * Prioritizes email within the specific estimate data, then falls back
 * to the globally stored customer details in the session.
 *
 * @param array|null $estimate The estimate data array (optional).
 * @param string|int|null $session_estimate_id The session estimate ID (used if $estimate is null to fetch from session).
 * @return string The customer email or empty string if not found.
 */
function product_estimator_get_customer_email(?array $estimate = null, $session_estimate_id = null): string {
    $customer_email = '';
    $session = SessionHandler::getInstance(); // Get session handler instance

    // 1. Check provided estimate data first
    if ($estimate !== null && isset($estimate['customer_details']['email']) && !empty($estimate['customer_details']['email'])) {
        $customer_email = sanitize_email($estimate['customer_details']['email']);
    }
    // 2. If not found in provided data OR data wasn't provided, try fetching estimate from session
    elseif ($session_estimate_id !== null) {
        $session_estimate = $session->getEstimate($session_estimate_id); // Fetches via SessionHandler
        if ($session_estimate && isset($session_estimate['customer_details']['email']) && !empty($session_estimate['customer_details']['email'])) {
            $customer_email = sanitize_email($session_estimate['customer_details']['email']);
        }
    }

    // 3. If still not found, check the global customer details stored in session
    if (empty($customer_email)) {
        $global_customer_details = $session->getCustomerDetails(); // Uses SessionHandler method
        if ($global_customer_details && isset($global_customer_details['email']) && !empty($global_customer_details['email'])) {
            $customer_email = sanitize_email($global_customer_details['email']);
        }
    }

    return $customer_email;
}



/**
 * Global helper functions for accessing Product Estimator components
 *
 * These functions make it easy to access the main plugin instance and its components
 * from anywhere in the code, including modules.
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */

if (!function_exists('product_estimator')) {
    /**
     * Get the main Product Estimator admin instance
     *
     * @return   \RuDigital\ProductEstimator\Includes\Admin\ProductEstimatorAdmin|null  Admin instance or null
     * @since    1.2.0
     */
    function product_estimator()
    {
        global $product_estimator;
        return isset($product_estimator) ? $product_estimator : null;
    }
}

if (!function_exists('product_estimator_admin_script_handler')) {
    /**
     * Get the Admin Script Handler instance
     *
     * @return   \RuDigital\ProductEstimator\Includes\Admin\AdminScriptHandler|null  Admin script handler or null
     * @since    1.2.0
     */
    function product_estimator_admin_script_handler()
    {
        global $product_estimator_admin_script_handler;

        if (!isset($product_estimator_admin_script_handler)) {
            $admin = product_estimator();
            if ($admin && method_exists($admin, 'get_admin_script_handler')) {
                $product_estimator_admin_script_handler = $admin->get_admin_script_handler();
            }
        }

        return $product_estimator_admin_script_handler;
    }
}

if (!function_exists('product_estimator_settings_manager')) {
    /**
     * Get the Settings Manager instance
     *
     * @return   \RuDigital\ProductEstimator\Includes\Admin\SettingsManager|null  Settings manager or null
     * @since    1.2.0
     */
    function product_estimator_settings_manager()
    {
        $admin = product_estimator();
        return $admin && method_exists($admin, 'get_settings_manager') ? $admin->get_settings_manager() : null;
    }
}

if (!function_exists('product_estimator_customer_estimates')) {
    /**
     * Get the Customer Estimates admin instance
     *
     * @return   \RuDigital\ProductEstimator\Includes\Admin\CustomerEstimatesAdmin|null  Customer estimates or null
     * @since    1.2.0
     */
    function product_estimator_customer_estimates()
    {
        $admin = product_estimator();
        return $admin && method_exists($admin, 'get_customer_estimates') ? $admin->get_customer_estimates() : null;
    }

}
