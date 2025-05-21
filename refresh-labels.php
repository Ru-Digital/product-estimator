<?php
/**
 * Admin utility to refresh labels by deactivating and reactivating the plugin
 * 
 * Run this from the browser while logged into the WordPress admin
 * wp-content/plugins/product-estimator/refresh-labels.php
 * 
 * Updated to version 2.0.12 to add missing button label:
 * - Added buttons.add_room label for the "Add Room" button
 * 
 * Previously updated to version 2.0.11 to add missing form labels:
 * - Added placeholder_width and placeholder_length labels for room dimensions
 * - Added buttons.add_room_and_product for "Add Room & Product" button
 * - Updated RoomManager.js to use labelManager.get() for "Add Room & Product" button
 * 
 * Previously updated to version 2.0.10 to fix product removal dialog labels:
 * - Fixed direct product removal confirmations in ProductManager.js
 * - Added proper labelManager.get() calls for dialog titles, messages, and buttons
 * - Added additional product removal with name format in RoomManager.js
 * - Added new label key: 'confirm_product_remove_with_name'
 * - Removed experimental labelKey parameters which were not working
 * 
 * Previously updated to version 2.0.9 to fix confirmation dialog labels:
 * - Modified ConfirmationDialog.js to process data-label attributes with TemplateEngine.processLabels()
 * - This ensures labels like "Remove Product", "Cancel", "Remove" in dialogs use admin labels system
 * 
 * Previously updated to version 2.0.8 to add proper use of label manager for additional products buttons:
 * - Now using labelManager.get('buttons.select_additional_product') for "Select" button
 * - Now using labelManager.get('buttons.selected_additional_product') for "Selected" button
 * - Fixed error message in variation selection to use labelManager
 * 
 * Previously updated to version 2.0.7 to add proper use of label manager for conflict dialog buttons:
 * - Now using labelManager.get('buttons.replace_existing_product') for "Replace the existing product" button
 * - Now using labelManager.get('buttons.go_back_to_room_select') for "Go back to room select" button
 * - Fixed error message to use labelManager
 * 
 * Previously updated to version 2.0.6 to add dialog labels:
 * - product_exists_title (in ui_elements): "Product Already Exists"
 * - product_already_exists (in messages): "This product already exists in the selected room."
 * 
 * Also updated DataService.js to use labelManager instead of config.i18n
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