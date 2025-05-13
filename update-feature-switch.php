<?php
/**
 * Enable the suggested_products_enabled feature switch
 */

// Load WordPress
define('WP_USE_THEMES', false);
$wp_load_path = dirname(dirname(dirname(dirname(__FILE__)))) . '/wp-load.php';
require_once($wp_load_path);

// Security check - only allow admin users
if (!is_user_logged_in() || !current_user_can('manage_options')) {
    wp_die('Unauthorized access');
}

echo '<h1>Feature Switch Update Tool</h1>';

// Check the current value
$current_value = get_option('product_estimator_feature_switches', array());
echo '<h2>Current Value:</h2>';
echo '<pre>';
print_r($current_value);
echo '</pre>';

// Set the feature switch
$current_value['suggested_products_enabled'] = true;

$result = update_option('product_estimator_feature_switches', $current_value);

echo '<h2>Update Result:</h2>';
if ($result) {
    echo '<p style="color:green;font-weight:bold;">Successfully updated feature switch!</p>';
} else {
    echo '<p style="color:red;font-weight:bold;">Failed to update option. It may already have the same value.</p>';
}

echo '<h2>New Value:</h2>';
$new_value = get_option('product_estimator_feature_switches', array());
echo '<pre>';
print_r($new_value);
echo '</pre>';

// Check if the global features object can be refreshed
echo '<h2>Refreshing Global Features Object:</h2>';
if (function_exists('product_estimator_features')) {
    $features = product_estimator_features();
    if (method_exists($features, 'refresh_settings')) {
        $features->refresh_settings();
        echo '<p style="color:green;">Successfully refreshed feature switches.</p>';
        
        echo '<h3>Updated Features Object:</h3>';
        echo '<pre>';
        print_r($features);
        echo '</pre>';
        
        echo '<p><strong>suggested_products_enabled value: </strong>';
        echo $features->suggested_products_enabled ? 'true' : 'false';
        echo '</p>';
    } else {
        echo '<p style="color:orange;">Could not refresh features - refresh_settings method not found.</p>';
    }
} else {
    echo '<p style="color:red;">product_estimator_features() function not available.</p>';
}

echo '<h2>What to do next:</h2>';
echo '<p>1. Visit the <a href="../wp-admin/admin.php?page=product-estimator-settings&tab=feature_switches" target="_blank">Feature Switches tab</a> to verify the setting is enabled.</p>';
echo '<p>2. Try adding a new Product Addition and check if the "Suggest Products when Category" option appears in the Action Type dropdown.</p>';
echo '<p>3. If it still doesn\'t appear, try refreshing the browser cache with Ctrl+F5 or Shift+Cmd+R.</p>';

// Provide code for reverting if needed
echo '<h2>Code to Revert Change (if needed):</h2>';
echo '<pre>';
echo '$feature_switches = get_option("product_estimator_feature_switches", array());' . "\n";
echo '$feature_switches["suggested_products_enabled"] = false;' . "\n";
echo 'update_option("product_estimator_feature_switches", $feature_switches);';
echo '</pre>';
?>