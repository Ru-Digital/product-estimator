<?php
/**
 * Admin utility to refresh labels by deactivating and reactivating the plugin
 * 
 * Run this from the browser while logged into the WordPress admin
 * wp-content/plugins/product-estimator/refresh-labels.php
 */

// Bootstrap WordPress
require_once '../../../../wp-load.php';

// Check if user is logged in and has admin privileges
if (!is_user_logged_in() || !current_user_can('manage_options')) {
    wp_die('You do not have permission to access this page.');
}

// Plugin path
$plugin_path = 'product-estimator/product-estimator.php';

echo '<div style="max-width: 800px; margin: 40px auto; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; line-height: 1.5;">';
echo '<h1>Product Estimator Label System Update</h1>';

// Step 1: Deactivate the plugin
deactivate_plugins($plugin_path);
echo '<div style="background-color: #f8d7da; color: #721c24; padding: 15px; margin: 20px 0; border: 1px solid #f5c6cb; border-radius: 4px;">';
echo '<p>Step 1: Product Estimator plugin has been deactivated...</p>';
echo '</div>';

// Step 2: Activate the plugin (will run migrations)
activate_plugins($plugin_path);
echo '<div style="background-color: #d4edda; color: #155724; padding: 15px; margin: 20px 0; border: 1px solid #c3e6cb; border-radius: 4px;">';
echo '<p>Step 2: Product Estimator plugin has been reactivated!</p>';
echo '</div>';

// Step 3: Force labels migration
if (file_exists(dirname(__FILE__) . '/includes/class-labels-migration.php')) {
    require_once dirname(__FILE__) . '/includes/class-labels-migration.php';
    \RuDigital\ProductEstimator\Includes\LabelsMigration::migrate();
    echo '<div style="background-color: #d4edda; color: #155724; padding: 15px; margin: 20px 0; border: 1px solid #c3e6cb; border-radius: 4px;">';
    echo '<p>Step 3: Labels migration completed successfully!</p>';
    echo '</div>';
} else {
    echo '<div style="background-color: #f8d7da; color: #721c24; padding: 15px; margin: 20px 0; border: 1px solid #f5c6cb; border-radius: 4px;">';
    echo '<p>Error: Could not find labels migration file.</p>';
    echo '</div>';
}

// Conclusion
echo '<div style="background-color: #d1ecf1; color: #0c5460; padding: 15px; margin: 20px 0; border: 1px solid #bee5eb; border-radius: 4px;">';
echo '<h2>Update Complete</h2>';
echo '<p>The label system has been refreshed and all new labels should now be available in the admin settings panel.</p>';
echo '<p><a href="' . admin_url('admin.php?page=product-estimator-settings&tab=labels') . '" class="button" style="display: inline-block; padding: 10px 15px; background: #0c5460; color: white; text-decoration: none; border-radius: 4px;">Go to Labels Settings</a></p>';
echo '</div>';

echo '</div>';