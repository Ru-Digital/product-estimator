<?php
/**
 * Web-accessible Hierarchical Labels Activation Script
 *
 * This script can be accessed via web browser to activate hierarchical labels.
 * Navigate to: /wp-content/plugins/product-estimator/activate-hierarchical-labels-web.php
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */

// Load WordPress - try multiple possible paths
$wp_load_paths = [
    dirname(__FILE__) . '/../../../../../wp-load.php',
    dirname(__FILE__) . '/../../../../wp-load.php', 
    dirname(__FILE__) . '/../../../wp-load.php',
    dirname(__FILE__) . '/../../wp-load.php',
    dirname(__FILE__) . '/../wp-load.php',
    ABSPATH . 'wp-load.php'
];

$wp_loaded = false;
foreach ($wp_load_paths as $path) {
    if (file_exists($path)) {
        require_once($path);
        $wp_loaded = true;
        break;
    }
}

// If WordPress isn't loaded, try to define ABSPATH and load
if (!$wp_loaded && !defined('ABSPATH')) {
    // Try to find WordPress root by looking for wp-config.php
    $current_dir = dirname(__FILE__);
    $max_depth = 10;
    $depth = 0;
    
    while ($depth < $max_depth) {
        if (file_exists($current_dir . '/wp-config.php') || file_exists($current_dir . '/wp-load.php')) {
            if (file_exists($current_dir . '/wp-load.php')) {
                require_once($current_dir . '/wp-load.php');
                $wp_loaded = true;
                break;
            }
        }
        $current_dir = dirname($current_dir);
        $depth++;
    }
}

// If we still can't load WordPress, show error
if (!$wp_loaded && !function_exists('current_user_can')) {
    die('Error: Could not load WordPress. Please ensure this script is in the correct location within your WordPress installation.');
}

// Security check - only allow admin users
if (!current_user_can('manage_options')) {
    wp_die(__('You do not have sufficient permissions to access this page.', 'product-estimator'));
}

// Include the main activation script
require_once(__DIR__ . '/activate-hierarchical-labels.php');