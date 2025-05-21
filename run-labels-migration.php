<?php
/**
 * Admin utility to run labels migration
 * 
 * Run this from the browser while logged into the WordPress admin
 * wp-content/plugins/product-estimator/run-labels-migration.php
 */

// Bootstrap WordPress
require_once '../../../../wp-load.php';

// Check if user is logged in and has admin privileges
if (!is_user_logged_in() || !current_user_can('manage_options')) {
    wp_die('You do not have permission to access this page.');
}

// Include and run the labels migration
if (file_exists(dirname(__FILE__) . '/includes/class-labels-migration.php')) {
    require_once dirname(__FILE__) . '/includes/class-labels-migration.php';
    \RuDigital\ProductEstimator\Includes\LabelsMigration::migrate();
    echo '<div style="background-color: #dff0d8; color: #3c763d; padding: 15px; margin: 20px 0; border: 1px solid #d6e9c6; border-radius: 4px;">';
    echo '<h2>Labels Migration Completed</h2>';
    echo '<p>The labels migration has been successfully executed. All new labels have been added to your WordPress database and are now available in the Labels settings panel.</p>';
    echo '<p><a href="' . admin_url('admin.php?page=product-estimator-settings&tab=labels') . '" class="button button-primary">Go to Labels Settings</a></p>';
    echo '</div>';
} else {
    echo '<div style="background-color: #f2dede; color: #a94442; padding: 15px; margin: 20px 0; border: 1px solid #ebccd1; border-radius: 4px;">';
    echo '<h2>Error</h2>';
    echo '<p>The labels migration file could not be found. Please check your plugin installation.</p>';
    echo '</div>';
}