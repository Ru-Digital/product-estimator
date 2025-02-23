<?php
/**
 * The plugin bootstrap file
 *
 * @wordpress-plugin
 * Plugin Name: Product Estimator
 * Plugin URI: https://github.com/Ru-Digital/product-estimator
 * Description: A customizable product estimation tool for WordPress.
 * Version: 1.0.3
 * Author: RU Digital
 * Author URI: https://rudigital.com.au
 * License: GPL2
 * Text Domain: product-estimator
 * Domain Path: /languages
 * GitHub Plugin URI: Ru-Digital/product-estimator
 * GitHub Branch: main
 */

namespace RuDigital\ProductEstimator;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Include the main class file
require_once plugin_dir_path(__FILE__) . 'includes/class-product-estimator.php';

// Plugin Constants
define('PRODUCT_ESTIMATOR_VERSION', '1.0.3');
define('PRODUCT_ESTIMATOR_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('PRODUCT_ESTIMATOR_PLUGIN_URL', plugin_dir_url(__FILE__));
define('PRODUCT_ESTIMATOR_BASENAME', plugin_basename(__FILE__));

// Composer autoloader
if (file_exists(dirname(__FILE__) . '/vendor/autoload.php')) {
    require_once dirname(__FILE__) . '/vendor/autoload.php';
}

// Custom autoloader for our namespaced classes
spl_autoload_register(function ($class) {
    $prefix = 'RuDigital\\ProductEstimator\\';
    $base_dir = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

// Activation/Deactivation hooks
register_activation_hook(__FILE__, array('RuDigital\\ProductEstimator\\Includes\\Activator', 'activate'));
register_deactivation_hook(__FILE__, array('RuDigital\\ProductEstimator\\Includes\\Deactivator', 'deactivate'));

/**
 * Initialize the plugin
 *
 * @since 1.0.0
 * @return void
 */
function run_product_estimator() {
    // Initialize error logging
    if (WP_DEBUG === true) {
        error_log('Product Estimator: Plugin initialization started');
    }

    try {
        $plugin = new Includes\ProductEstimator();
        $plugin->run();
    } catch (\Exception $e) {
        if (WP_DEBUG === true) {
            error_log('Product Estimator Error: ' . $e->getMessage());
        }
    }
}

// Hook into WordPress init
add_action('plugins_loaded', 'RuDigital\\ProductEstimator\\run_product_estimator');

// Add plugin action links
add_filter('plugin_action_links_' . plugin_basename(__FILE__), function($links) {
    $settings_link = '<a href="' . admin_url('admin.php?page=product-estimator') . '">' . __('Settings', 'product-estimator') . '</a>';
    array_unshift($links, $settings_link);
    return $links;
});
