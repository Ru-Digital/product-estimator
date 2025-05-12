<?php
/**
 * Debug feature switches
 *
 * This file helps debug the feature switches functionality.
 * To use, visit: /wp-content/plugins/product-estimator/debug-features.php
 */

// Load WordPress core
define('WP_USE_THEMES', false);
$wp_load_path = dirname(dirname(dirname(dirname(__FILE__)))) . '/wp-load.php';
require_once($wp_load_path);

// Security check - only allow admin users
if (!is_user_logged_in() || !current_user_can('manage_options')) {
    wp_die('Unauthorized access');
}

// Output header
header('Content-Type: text/html');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Feature Switches Debug</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            margin: 20px;
            line-height: 1.5;
        }
        pre {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 3px;
            overflow-x: auto;
        }
        .section {
            margin-bottom: 20px;
            padding: 15px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 3px;
        }
        h2 {
            margin-top: 0;
        }
        .success { color: green; }
        .error { color: red; }
        table { 
            border-collapse: collapse; 
            width: 100%;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Feature Switches Debug</h1>
    
    <div class="section">
        <h2>1. Raw Option Value</h2>
        <?php 
        $raw_option = get_option('product_estimator_feature_switches');
        echo '<pre>';
        var_dump($raw_option);
        echo '</pre>';
        
        if (isset($raw_option['suggested_products_enabled'])) {
            echo '<p class="success">suggested_products_enabled found in raw option: <strong>' . 
                ($raw_option['suggested_products_enabled'] ? 'true' : 'false') . '</strong></p>';
        } else {
            echo '<p class="error">suggested_products_enabled not found in raw option!</p>';
        }
        ?>
    </div>
    
    <div class="section">
        <h2>2. FeatureSwitches Class Access</h2>
        <?php
        if (function_exists('product_estimator_features')) {
            $features = product_estimator_features();
            if ($features) {
                echo '<p class="success">product_estimator_features() function returned an object</p>';
                
                if (property_exists($features, 'suggested_products_enabled')) {
                    echo '<p class="success">suggested_products_enabled property exists: <strong>' . 
                        ($features->suggested_products_enabled ? 'true' : 'false') . '</strong></p>';
                    
                    // Check __get method
                    $value = $features->suggested_products_enabled;
                    echo '<p>Using __get method: <strong>' . ($value ? 'true' : 'false') . '</strong></p>';
                    
                    // Check get_feature method
                    if (method_exists($features, 'get_feature')) {
                        $value = $features->get_feature('suggested_products_enabled');
                        echo '<p>Using get_feature method: <strong>' . ($value ? 'true' : 'false') . '</strong></p>';
                    }
                } else {
                    echo '<p class="error">suggested_products_enabled property does not exist!</p>';
                }
            } else {
                echo '<p class="error">product_estimator_features() function returned null or false</p>';
            }
        } else {
            echo '<p class="error">product_estimator_features() function does not exist!</p>';
        }
        ?>
    </div>
    
    <div class="section">
        <h2>3. Feature Access from get_features_object()</h2>
        <?php 
        $mock_features = null;
        // Try to replicate the get_features_object method
        if (function_exists('product_estimator_features')) {
            $mock_features = product_estimator_features();
        } else {
            $mock_features = (object)[
                'suggested_products_enabled' => false,
            ];
        }
        
        echo '<pre>';
        var_dump($mock_features);
        echo '</pre>';
        
        if ($mock_features && property_exists($mock_features, 'suggested_products_enabled')) {
            echo '<p class="success">Has suggested_products_enabled: <strong>' . 
                ($mock_features->suggested_products_enabled ? 'true' : 'false') . '</strong></p>';
            
            if ($mock_features->suggested_products_enabled) {
                echo "<p class=\"success\">The feature flag <strong>is enabled</strong> - you should see \"Suggest Products when Category\" in the dropdown</p>";
            } else {
                echo "<p class=\"error\">The feature flag <strong>is disabled</strong> - you won't see \"Suggest Products when Category\" in the dropdown</p>";
                
                // Provide instructions to enable it
                echo "<p>To enable the feature, add the following to your wp-config.php:</p>";
                echo "<pre>
// Force enable feature switches for Product Estimator
add_action('init', function() {
    update_option('product_estimator_feature_switches', [
        'suggested_products_enabled' => true
    ]);
});
</pre>";
            }
        } else {
            echo '<p class="error">Cannot determine suggested_products_enabled status</p>';
        }
        ?>
    </div>
    
    <div class="section">
        <h2>4. Test Action Type Dropdown Creation</h2>
        
        <?php
        // Simulate action type options creation like in class-product-additions-settings-module.php
        $action_type_options = [
            '' => '-- Select Action Type --',
            'auto_add_by_category' => 'Auto-Add Product with Category',
            'auto_add_note_by_category' => 'Auto-Add Note with Category',
        ];
        
        if ($mock_features && property_exists($mock_features, 'suggested_products_enabled') && $mock_features->suggested_products_enabled) {
            $action_type_options['suggest_products_by_category'] = 'Suggest Products when Category';
            echo "<p class=\"success\">Added 'Suggest Products when Category' to dropdown options</p>";
        } else {
            echo "<p class=\"error\">Did NOT add 'Suggest Products when Category' to dropdown options due to disabled feature</p>";
        }
        
        // Show the options that would be rendered
        echo "<h3>Dropdown Options:</h3>";
        echo "<table>";
        echo "<tr><th>Value</th><th>Label</th></tr>";
        foreach ($action_type_options as $value => $label) {
            echo "<tr><td>" . htmlspecialchars($value) . "</td><td>" . htmlspecialchars($label) . "</td></tr>";
        }
        echo "</table>";
        ?>
        
        <p><strong>Note:</strong> To manually force the display of the "Suggest Products when Category" option, temporarily edit <code>class-product-additions-settings-module.php</code> and insert this option directly in the $action_type_options array.</p>
    </div>
    
</body>
</html>