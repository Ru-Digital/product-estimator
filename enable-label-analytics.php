<?php
/**
 * Utility script to enable label analytics feature switch
 * 
 * Usage: Include this file in your WordPress setup or run it directly
 * from the WordPress admin area via a temporary admin page.
 */

// Ensure this script is run within WordPress
if (!defined('ABSPATH')) {
    // Check if WordPress is loaded in the parent directory
    if (file_exists(dirname(dirname(dirname(dirname(__FILE__)))) . '/wp-load.php')) {
        require_once(dirname(dirname(dirname(dirname(__FILE__)))) . '/wp-load.php');
    } else {
        die('WordPress not found. This script must be run within WordPress.');
    }
}

// Check for admin privileges
if (!current_user_can('manage_options')) {
    die('You do not have sufficient permissions to access this page.');
}

// Get current feature switches
$feature_switches = get_option('product_estimator_feature_switches', []);

// Enable label analytics
$feature_switches['label_analytics_enabled'] = true;

// Save updated feature switches
update_option('product_estimator_feature_switches', $feature_switches);

// Output status
echo '<h1>Label Analytics Feature Switch</h1>';
echo '<p>Label analytics has been enabled.</p>';

// Display current feature switches
echo '<h2>Current Feature Switches</h2>';
echo '<pre>';
print_r($feature_switches);
echo '</pre>';

// Add a link to return to the plugin admin page
echo '<p><a href="' . admin_url('admin.php?page=product-estimator') . '">Return to Product Estimator</a></p>';
?>