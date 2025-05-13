<?php
/**
 * Feature Switches Test Script
 * 
 * This script tests the FeatureSwitches class to ensure it's working as expected.
 * It can be run directly in the browser or via CLI to verify feature flag functionality.
 */

// Don't run this file directly from a web request
if (!defined('ABSPATH')) {
    // WordPress is not loaded, so we need to load it
    define('WP_USE_THEMES', false);
    require_once '../../../../wp-load.php';  // Adjust the path as needed
}

// Ensure error reporting is enabled for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Import the required classes
use RuDigital\ProductEstimator\Includes\FeatureSwitches;

// Headers for readable output
header('Content-Type: text/plain');
echo "===== Feature Switches Test =====\n\n";

// Get FeatureSwitches instance
$features = FeatureSwitches::get_instance();
echo "Feature Switches Object Structure:\n";
var_dump($features);

// Test specific feature access
$suggested_products_enabled = $features->suggested_products_enabled;
echo "\nSuggested Products Enabled: " . ($suggested_products_enabled ? 'TRUE' : 'FALSE') . "\n";

// Test feature modification
echo "\nCurrent Feature Switches in Database:\n";
$current_options = get_option('product_estimator_feature_switches', []);
var_dump($current_options);

// Set the feature flag
echo "\nSetting 'suggested_products_enabled' to 1...\n";
$current_options['suggested_products_enabled'] = 1;
update_option('product_estimator_feature_switches', $current_options);

// Refresh and check again
echo "\nRefreshing Feature Switches object and checking again...\n";
$features->refresh_settings();
$suggested_products_enabled_after = $features->suggested_products_enabled;
echo "Suggested Products Enabled (after update): " . ($suggested_products_enabled_after ? 'TRUE' : 'FALSE') . "\n";

echo "\n===== Test Complete =====\n";