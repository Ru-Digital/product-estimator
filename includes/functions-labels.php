<?php
/**
 * Label helper functions for use throughout the plugin
 *
 * @since      2.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */

/**
 * Get a label value
 *
 * @since  2.0.0
 * @param  string  $key      Label key (supports dot notation)
 * @param  string  $default  Default value if label not found
 * @return string  Label value
 */
function product_estimator_get_label($key, $default = '') {
    // Get the labels frontend instance
    global $product_estimator;
    
    if (isset($product_estimator) && method_exists($product_estimator, 'get_loader')) {
        $loader = $product_estimator->get_loader();
        $labels_frontend = $loader->get_component('labels_frontend');
        
        // Track usage if analytics is enabled
        $feature_switches = \RuDigital\ProductEstimator\Includes\FeatureSwitches::get_instance();
        if ($feature_switches->get_feature('label_analytics_enabled', false)) {
            $analytics = $loader->get_component('labels_analytics');
            if ($analytics && method_exists($analytics, 'record_access')) {
                // Get caller information for context
                $backtrace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2);
                $context = isset($backtrace[1]['file']) ? basename($backtrace[1]['file']) : '';
                $analytics->record_access($key, $context);
            }
        }
        
        if ($labels_frontend && method_exists($labels_frontend, 'get_label')) {
            return $labels_frontend->get_label($key, $default);
        }
    }
    
    // Fallback to default
    return $default;
}

/**
 * Format a label with replacements
 *
 * @since  2.0.0
 * @param  string  $key           Label key
 * @param  array   $replacements  Key-value pairs for replacements
 * @param  string  $default       Default value if label not found
 * @return string  Formatted label
 */
function product_estimator_format_label($key, $replacements = [], $default = '') {
    global $product_estimator;
    
    if (isset($product_estimator) && method_exists($product_estimator, 'get_loader')) {
        $loader = $product_estimator->get_loader();
        $labels_frontend = $loader->get_component('labels_frontend');
        
        // Track usage if analytics is enabled
        $feature_switches = \RuDigital\ProductEstimator\Includes\FeatureSwitches::get_instance();
        if ($feature_switches->get_feature('label_analytics_enabled', false)) {
            $analytics = $loader->get_component('labels_analytics');
            if ($analytics && method_exists($analytics, 'record_access')) {
                // Get caller information for context
                $backtrace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2);
                $context = isset($backtrace[1]['file']) ? basename($backtrace[1]['file']) : '';
                $analytics->record_access($key, $context);
            }
        }
        
        if ($labels_frontend && method_exists($labels_frontend, 'format_label')) {
            return $labels_frontend->format_label($key, $replacements, $default);
        }
    }
    
    // Fallback formatting
    $label = $default;
    foreach ($replacements as $placeholder => $value) {
        $label = str_replace('{' . $placeholder . '}', $value, $label);
    }
    
    return $label;
}

/**
 * Echo a label value
 *
 * @since  2.0.0
 * @param  string  $key      Label key
 * @param  string  $default  Default value if label not found
 */
function product_estimator_label($key, $default = '') {
    echo esc_html(product_estimator_get_label($key, $default));
}

/**
 * Echo a formatted label
 *
 * @since  2.0.0
 * @param  string  $key           Label key
 * @param  array   $replacements  Key-value pairs for replacements
 * @param  string  $default       Default value if label not found
 */
function product_estimator_label_format($key, $replacements = [], $default = '') {
    echo esc_html(product_estimator_format_label($key, $replacements, $default));
}

/**
 * Get labels for a specific category
 *
 * @since  2.0.0
 * @param  string  $category  Category name
 * @return array   Category labels
 */
function product_estimator_get_category_labels($category) {
    global $product_estimator;
    
    if (isset($product_estimator) && method_exists($product_estimator, 'get_loader')) {
        $loader = $product_estimator->get_loader();
        $labels_frontend = $loader->get_component('labels_frontend');
        
        if ($labels_frontend && method_exists($labels_frontend, 'get_category_labels')) {
            return $labels_frontend->get_category_labels($category);
        }
    }
    
    return [];
}

/**
 * Check if a label exists
 *
 * @since  2.0.0
 * @param  string  $key  Label key
 * @return bool    True if label exists
 */
function product_estimator_label_exists($key) {
    global $product_estimator;
    
    if (isset($product_estimator) && method_exists($product_estimator, 'get_loader')) {
        $loader = $product_estimator->get_loader();
        $labels_frontend = $loader->get_component('labels_frontend');
        
        if ($labels_frontend && method_exists($labels_frontend, 'label_exists')) {
            return $labels_frontend->label_exists($key);
        }
    }
    
    return false;
}

/**
 * Output a label with HTML allowed
 *
 * @since  2.0.0
 * @param  string  $key      Label key
 * @param  string  $default  Default value if label not found
 * @param  array   $allowed_html  Allowed HTML tags (uses wp_kses)
 */
function product_estimator_label_html($key, $default = '', $allowed_html = null) {
    $label = product_estimator_get_label($key, $default);
    
    if ($allowed_html === null) {
        // Default allowed HTML tags
        $allowed_html = [
            'strong' => [],
            'em' => [],
            'br' => [],
            'span' => ['class' => []],
            'a' => ['href' => [], 'title' => [], 'target' => []],
        ];
    }
    
    echo wp_kses($label, $allowed_html);
}

/**
 * Get label for JavaScript usage (escaped for JS)
 *
 * @since  2.0.0
 * @param  string  $key      Label key
 * @param  string  $default  Default value if label not found
 * @return string  JS-escaped label
 */
function product_estimator_label_js($key, $default = '') {
    $label = product_estimator_get_label($key, $default);
    return esc_js($label);
}

/**
 * Get label for attribute usage (escaped for attributes)
 *
 * @since  2.0.0
 * @param  string  $key      Label key
 * @param  string  $default  Default value if label not found
 * @return string  Attribute-escaped label
 */
function product_estimator_label_attr($key, $default = '') {
    $label = product_estimator_get_label($key, $default);
    return esc_attr($label);
}