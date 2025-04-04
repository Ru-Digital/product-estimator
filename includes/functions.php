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
