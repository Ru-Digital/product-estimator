<?php
/**
 * The plugin bootstrap file
 *
 * @wordpress-plugin
 * Plugin Name: Product Estimator
 * Plugin URI: https://github.com/Ru-Digital/product-estimator
 * Description: A customizable product estimation tool for WordPress.
 * Version: 1.0.8
 * Author: RU Digital
 * Author URI: https://rudigital.com.au
 * License: GPL2
 * Text Domain: product-estimator
 * Domain Path: /languages
 * GitHub Plugin URI: Ru-Digital/product-estimator
 * GitHub Branch: main
 * Requires at least: 5.0
 * Requires PHP: 8.2
 */

namespace RuDigital\ProductEstimator;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Plugin Constants
define('PRODUCT_ESTIMATOR_VERSION', '1.0.8');
define('PRODUCT_ESTIMATOR_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('PRODUCT_ESTIMATOR_PLUGIN_URL', plugin_dir_url(__FILE__));
define('PRODUCT_ESTIMATOR_BASENAME', plugin_basename(__FILE__));

// Composer autoloader
if (file_exists(dirname(__FILE__) . '/vendor/autoload.php')) {
    require_once dirname(__FILE__) . '/vendor/autoload.php';
} else {
    // Custom autoloader for our namespaced classes
    spl_autoload_register(function ($class) {
        // Base namespace for the plugin
        $prefix = 'RuDigital\\ProductEstimator\\';
        $base_dir = PRODUCT_ESTIMATOR_PLUGIN_DIR;

        // Does the class use the namespace prefix?
        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) !== 0) {
            return;
        }

        // Get the relative class name
        $relative_class = substr($class, $len);

        // Convert namespace separators to directory separators
        // and prepend 'class-' to the filename (if not already there)
        $file = $base_dir . str_replace('\\', '/', $relative_class);

        // Only add 'class-' prefix if it's not already there
        $filename = basename($file);
        if (strpos($filename, 'class-') !== 0) {
            $file = dirname($file) . '/class-' . $filename;
        }

        $file = strtolower($file) . '.php';

        // If the file exists, require it
        if (file_exists($file)) {
            require $file;
        } else {
            // For debugging, you might want to see which files can't be found
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('ProductEstimator autoloader could not find: ' . $file);
            }
        }
    });
}

// Include core function file
require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/functions.php';

/**
 * Begin execution of the plugin
 */
function run_product_estimator() {
    require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-product-estimator.php';
    $plugin = new ProductEstimator('product-estimator', PRODUCT_ESTIMATOR_VERSION);
}

// Register activation/deactivation hooks
register_activation_hook(__FILE__, array('RuDigital\\ProductEstimator\\Includes\\Activator', 'activate'));
register_deactivation_hook(__FILE__, array('RuDigital\\ProductEstimator\\Includes\\Deactivator', 'deactivate'));

// Hook into WordPress init
add_action('plugins_loaded', 'RuDigital\\ProductEstimator\\run_product_estimator');
// Function to add the estimator button to the menu
function add_estimator_button_to_menu($items, $args) {
    if (isset($args->theme_location) && $args->theme_location === 'main_menu') {
        $estimator_button = '<li class="menu-item product-estimator-menu-item">
            <a href="#" class="product-estimator-button">Estimator</a>
        </li>';
        $items .= $estimator_button; // Append the button at the end of the menu
    }
    return $items;
}

// Ensure function is referenced correctly within the namespace
add_filter('wp_nav_menu_items', 'RuDigital\\ProductEstimator\\add_estimator_button_to_menu', 10, 2);


