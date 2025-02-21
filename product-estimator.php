<?php
/*
Plugin Name: Product Estimator
Plugin URI: https://github.com/yourusername/product-estimator
Description: A customizable product estimation tool for WordPress.
Version: 1.0.0
Author: Your Name
Author URI: https://yourwebsite.com
License: GPL2
Text Domain: product-estimator
*/

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Include the main class file
require_once plugin_dir_path(__FILE__) . 'includes/class-product-estimator.php';

// Initialize the plugin
function run_product_estimator() {
    $plugin = new Product_Estimator();
    $plugin->run();
}
add_action('plugins_loaded', 'run_product_estimator');