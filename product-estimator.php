<?php
/**
 * The plugin bootstrap file
 *
 * @wordpress-plugin
 * Plugin Name: Product Estimator
 * Plugin URI: https://github.com/Ru-Digital/product-estimator
 * Description: A customizable product estimation tool for WordPress.
 * Version: 1.0.2
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
define('PRODUCT_ESTIMATOR_VERSION', '1.0.2'); // Consider updating this if making changes
define('PRODUCT_ESTIMATOR_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('PRODUCT_ESTIMATOR_PLUGIN_URL', plugin_dir_url(__FILE__));
define('PRODUCT_ESTIMATOR_BASENAME', plugin_basename(__FILE__));

// Composer autoloader
if (file_exists(dirname(__FILE__) . '/vendor/autoload.php')) {
    require_once dirname(__FILE__) . '/vendor/autoload.php';
} else {
    // Fallback: Custom autoloader for namespaced classes (if Composer isn't used or fails)
    // Consider removing this entirely if Composer is mandatory for your plugin.
    spl_autoload_register(function ($class) {
        // Base namespace for the plugin
        $prefix = 'RuDigital\\ProductEstimator\\';
        $base_dir = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/'; // Point to includes directory

        // Does the class use the namespace prefix?
        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) !== 0) {
            // No, move to the next registered autoloader
            return;
        }

        // Get the relative class name
        $relative_class = substr($class, $len);

        // Replace the namespace prefix with the base directory, replace namespace
        // separators with directory separators in the relative class name, append
        // with .php
        // Example: RuDigital\ProductEstimator\Includes\Admin\MyClass -> includes/Admin/MyClass.php
        // Needs adjustment based on your file naming convention (e.g., class-myclass.php)

        // Basic conversion (adjust if using 'class-' prefix)
        $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

        // If the file exists, require it
        if (file_exists($file)) {
            require $file;
        } else {
            // Attempt with 'class-' prefix and lowercase (common WP convention)
            $parts = explode('\\', $relative_class);
            $class_name_only = array_pop($parts);
            $namespace_path = !empty($parts) ? implode('/', $parts) . '/' : '';
            $file_wp_style = $base_dir . strtolower($namespace_path . 'class-' . str_replace('_', '-', $class_name_only) . '.php');

            if (file_exists($file_wp_style)) {
                require $file_wp_style;
            } elseif (defined('WP_DEBUG') && WP_DEBUG) {
                // Log only if both attempts fail
                error_log('ProductEstimator Custom Autoloader: Could not find file for class ' . $class . '. Tried: ' . $file . ' and ' . $file_wp_style);
            }
        }
    });
}

// --- MODIFIED: Include core function file HERE ---
// Load core functions required by the plugin after the autoloader.
// This replaces the Composer 'files' autoload directive for functions.php.
$functions_file = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/functions.php';
if (file_exists($functions_file)) {
    require_once $functions_file;
} else {
    // Log a critical error if the core functions file is missing.
    error_log('Product Estimator Critical Error: Required file includes/functions.php not found.');
    // Optional: Prevent plugin execution if functions are essential.
    // return;
}
// --- END MODIFICATION ---

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-activator.php
 */
function activate_product_estimator() {
    // Check if Activator class exists before calling static method
    if (class_exists('\\RuDigital\\ProductEstimator\\Includes\\Activator')) {
        require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-activator.php';
        \RuDigital\ProductEstimator\Includes\Activator::activate();
    } else {
        error_log('Product Estimator Error: Activator class not found during activation.');
    }
    // Flush rewrite rules on activation
    if (class_exists('\\RuDigital\\ProductEstimator\\Includes\\PDFRouteHandler')) {
        require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-pdf-route-handler.php';
        \RuDigital\ProductEstimator\Includes\PDFRouteHandler::flush_pdf_routes();
    }
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-deactivator.php
 */
function deactivate_product_estimator() {
    // Check if Deactivator class exists before calling static method
    if (class_exists('\\RuDigital\\ProductEstimator\\Includes\\Deactivator')) {
        require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-deactivator.php';
        \RuDigital\ProductEstimator\Includes\Deactivator::deactivate();
    } else {
        error_log('Product Estimator Error: Deactivator class not found during deactivation.');
    }
    // Flush rewrite rules on deactivation
    flush_rewrite_rules(true);
}

// Register activation/deactivation hooks using the functions above
register_activation_hook(__FILE__, 'RuDigital\\ProductEstimator\\activate_product_estimator');
register_deactivation_hook(__FILE__, 'RuDigital\\ProductEstimator\\deactivate_product_estimator');


/**
 * Begins execution of the plugin.
 *
 * Instantiates the main plugin class after all plugins are loaded.
 *
 * @since    1.0.0
 */
function run_product_estimator() {
    // Ensure the main plugin class file is loaded (autoloader should handle this)
    // require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-product-estimator.php'; // Autoloader should find this
    if (class_exists(ProductEstimator::class)) {
        $plugin = new ProductEstimator('product-estimator', PRODUCT_ESTIMATOR_VERSION);
    } else {
        error_log('Product Estimator Critical Error: Main class ProductEstimator not found.');
    }
}

// Hook into WordPress 'plugins_loaded' action to initialize the plugin.
// This ensures all plugins are loaded, including potential dependencies like WooCommerce.
add_action('plugins_loaded', 'RuDigital\\ProductEstimator\\run_product_estimator');


// --- Example Filter Hook (Keep or remove as needed) ---
/**
 * Function to add the estimator button to the menu
 *
 * @param string $items The HTML list content for the menu items.
 * @param object $args  An object containing wp_nav_menu() arguments.
 * @return string Modified menu items HTML.
 */
function add_estimator_button_to_menu($items, $args) {
    // Check if this is the desired menu location (e.g., 'main_menu', 'primary', etc.)
    // Adjust 'main_menu' to match your theme's actual menu location slug.
    if (isset($args->theme_location) && $args->theme_location === 'main_menu') {
        // Generate the HTML for the estimator button menu item
        // Ensure the class 'product-estimator-button' matches your JavaScript selector.
        $estimator_button = '<li class="menu-item product-estimator-menu-item">
            <a href="#" class="product-estimator-button">' . esc_html__('Estimator', 'product-estimator') . '</a>
        </li>';
        // Append the button to the existing menu items
        $items .= $estimator_button;
    }
    return $items;
}
// Hook the function into the 'wp_nav_menu_items' filter
add_filter('wp_nav_menu_items', 'RuDigital\\ProductEstimator\\add_estimator_button_to_menu', 10, 2);
// --- End Example Filter Hook ---

