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
 * Requires at least: 5.0
 * Requires PHP: 7.4
 */

namespace RuDigital\ProductEstimator;

use function add_action;
use function wp_localize_script;
use function admin_url;
use function wp_create_nonce;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Plugin Constants
define('PRODUCT_ESTIMATOR_VERSION', '1.0.3');
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
        // and prepend 'class-' to the filename
        $file = $base_dir . str_replace('\\', '/', $relative_class);
        $file = preg_replace('/([^\/]+)$/', 'class-$1', $file);
        $file = strtolower($file) . '.php';

        // If the file exists, require it
        if (file_exists($file)) {
            require $file;
        }
    });
}

// Include core function file
require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/functions.php';

/**
 * Localize scripts with global plugin data
 */
function product_estimator_enqueue_scripts() {
    // Register and enqueue jQuery explicitly
    wp_enqueue_script('jquery');

    // Register modal script
    wp_register_script(
        'product-estimator-modal',
        PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/js/product-estimator-modal.js',
        array('jquery'),
        PRODUCT_ESTIMATOR_VERSION,
        true
    );
    wp_enqueue_script('product-estimator-modal');

    // Register public script with modal dependency
    wp_register_script(
        'product-estimator-public',
        PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/js/product-estimator-public.js',
        array('jquery', 'product-estimator-modal'),
        PRODUCT_ESTIMATOR_VERSION,
        true
    );
    wp_enqueue_script('product-estimator-public');

    // Localize script
    wp_localize_script(
        'product-estimator-public',
        'productEstimatorPublic',
        array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('product_estimator_nonce'),
            'plugin_url' => PRODUCT_ESTIMATOR_PLUGIN_URL,
            'estimator_url' => home_url('/estimator/'),
            'enableTooltips' => true,
            'i18n' => array(
                'loading' => __('Loading estimator...', 'product-estimator'),
                'error' => __('Error loading estimator. Please try again.', 'product-estimator'),
                'error_loading_options' => __('Error loading options.', 'product-estimator'),
                'error_calculation' => __('Error calculating estimate.', 'product-estimator'),
                'error_adding' => __('Error adding product to estimator.', 'product-estimator'),
                'close' => __('Close', 'product-estimator')
            )
        )
    );
}

// Register function globally
add_action('wp_enqueue_scripts', '\RuDigital\ProductEstimator\product_estimator_enqueue_scripts', 999);

// Hook into WordPress init
add_action('plugins_loaded', 'RuDigital\\ProductEstimator\\run_product_estimator');


/**
 * Check if WooCommerce is active
 *
 * @return bool
 */
function is_woocommerce_active() {
    $active_plugins = apply_filters('active_plugins', get_option('active_plugins'));
    if (is_multisite()) {
        $network_plugins = get_site_option('active_sitewide_plugins', array());
        if (is_array($network_plugins)) {
            $active_plugins = array_merge($active_plugins, array_keys($network_plugins));
        }
    }
    return in_array('woocommerce/woocommerce.php', $active_plugins);
}

/**
 * Initialize the plugin
 *
 * @since 1.0.0
 * @return void
 */
function run_product_estimator() {
    // Load core classes
    require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-loader.php';
    require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-i18n.php';
    require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-activator.php';
    require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-deactivator.php';
    require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-product-estimator.php';

    // Initialize shortcodes regardless of WooCommerce
    $shortcodes = new \RuDigital\ProductEstimator\Includes\Frontend\Shortcodes();

    // Initialize WooCommerce integration if WooCommerce is active
    if (is_woocommerce_active()) {
        $wc_integration = new \RuDigital\ProductEstimator\Includes\Integration\WoocommerceIntegration();
        $product_display = new \RuDigital\ProductEstimator\Includes\Frontend\ProductDisplay();
    }

    // Initialize main plugin class
    $plugin = new \RuDigital\ProductEstimator\Includes\ProductEstimator();
    $plugin->run();
}

// Activation/Deactivation hooks
register_activation_hook(__FILE__, array('RuDigital\\ProductEstimator\\Includes\\Activator', 'activate'));
register_deactivation_hook(__FILE__, array('RuDigital\\ProductEstimator\\Includes\\Deactivator', 'deactivate'));

// Hook into WordPress init
add_action('plugins_loaded', 'RuDigital\\ProductEstimator\\run_product_estimator');

// Add plugin action links
// Add plugin action links
add_filter('plugin_action_links_' . plugin_basename(__FILE__), function($links) {
    $settings_link = '<a href="' . admin_url('admin.php?page=product-estimator') . '">' . __('Settings', 'product-estimator') . '</a>';
    array_unshift($links, $settings_link);
    return $links;
});

if (!defined('ABSPATH')) exit; // Exit if accessed directly

// Function to add the estimator button to the menu
namespace RuDigital\ProductEstimator;

if (!defined('ABSPATH')) exit; // Exit if accessed directly

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


