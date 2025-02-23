<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * This file contains all the logic for cleaning up after the plugin
 * when it is uninstalled from WordPress.
 *
 * @since      1.0.0
 * @package    Product_Estimator
 */

// If uninstall not called from WordPress, then exit
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Get the uninstall settings
$settings = get_option('product_estimator_settings');
$preserve_data = isset($settings['preserve_data']) ? $settings['preserve_data'] : false;

// If preserve data setting is true, exit without deletion
if ($preserve_data) {
    return;
}

// Start uninstallation process
try {
    global $wpdb;

    // Tables to remove
    $tables = array(
        $wpdb->prefix . 'product_estimator_calculations',
        $wpdb->prefix . 'product_estimator_estimates'
    );

    // Drop custom tables
    foreach ($tables as $table) {
        $wpdb->query("DROP TABLE IF EXISTS {$table}");
    }

    // Delete options
    $options = array(
        'product_estimator_settings',
        'product_estimator_db_version',
        'product_estimator_activated',
        'product_estimator_last_backup',
        'product_estimator_last_deactivation'
    );

    foreach ($options as $option) {
        delete_option($option);
    }

    // Delete transients
    $wpdb->query(
        $wpdb->prepare(
            "DELETE FROM {$wpdb->options} 
            WHERE option_name LIKE %s 
            OR option_name LIKE %s",
            $wpdb->esc_like('_transient_product_estimator_') . '%',
            $wpdb->esc_like('_transient_timeout_product_estimator_') . '%'
        )
    );

    // Remove user capabilities
    $roles = array('administrator', 'editor', 'shop_manager');
    $capabilities = array(
        'manage_product_estimator',
        'view_product_estimates',
        'edit_product_estimates'
    );

    foreach ($roles as $role_name) {
        $role = get_role($role_name);
        if ($role) {
            foreach ($capabilities as $cap) {
                $role->remove_cap($cap);
            }
        }
    }

    // Clear scheduled hooks
    wp_clear_scheduled_hook('product_estimator_daily_cleanup');
    wp_clear_scheduled_hook('product_estimator_weekly_report');
    wp_clear_scheduled_hook('product_estimator_monthly_maintenance');

    // Clean up uploads directory
    $upload_dir = wp_upload_dir();
    $plugin_upload_dir = $upload_dir['basedir'] . '/product-estimator';

    if (is_dir($plugin_upload_dir)) {
        // Recursively delete plugin upload directory
        product_estimator_recursive_delete($plugin_upload_dir);
    }

    // Clear any remaining cache
    wp_cache_flush();

    // Log the uninstallation if WP_DEBUG is enabled
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('Product Estimator: Plugin uninstalled successfully.');
    }

} catch (Exception $e) {
    // Log error if WP_DEBUG is enabled
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('Product Estimator Uninstall Error: ' . $e->getMessage());
    }
}

/**
 * Recursively delete a directory and its contents
 *
 * @param string $dir Directory path
 * @return bool
 */
function product_estimator_recursive_delete($dir) {
    if (!is_dir($dir)) {
        return false;
    }

    $files = array_diff(scandir($dir), array('.', '..'));

    foreach ($files as $file) {
        $path = $dir . '/' . $file;

        if (is_dir($path)) {
            product_estimator_recursive_delete($path);
        } else {
            unlink($path);
        }
    }

    return rmdir($dir);
}