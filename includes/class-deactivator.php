<?php
namespace RuDigital\ProductEstimator\Includes;

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */
class Deactivator {

    /**
     * Plugin deactivation handler.
     *
     * Handles cleanup tasks when the plugin is deactivated.
     * Note: This is not the same as uninstallation.
     *
     * @since    1.0.0
     */
    public static function deactivate() {
        // Clear scheduled hooks
//        self::clear_scheduled_hooks();

        // Clear transients
//        self::clear_transients();

        // Remove user capabilities
//        self::remove_capabilities();

        // Log deactivation
        self::log_deactivation();

        // Clear cache
        wp_cache_flush();
    }

    /**
     * Clear all scheduled hooks created by the plugin.
     *
     * @since    1.0.0
     */
    private static function clear_scheduled_hooks() {
        $hooks = array(
            'product_estimator_daily_cleanup',
            'product_estimator_weekly_report',
            'product_estimator_monthly_maintenance'
        );

        foreach ($hooks as $hook) {
            $timestamp = wp_next_scheduled($hook);
            if ($timestamp) {
                wp_unschedule_event($timestamp, $hook);
            }
        }
    }

    /**
     * Clear all transients created by the plugin.
     *
     * @since    1.0.0
     */
    private static function clear_transients() {
        global $wpdb;

        // Delete all transients with our prefix
        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$wpdb->options}
                WHERE option_name LIKE %s
                OR option_name LIKE %s",
                $wpdb->esc_like('_transient_product_estimator_') . '%',
                $wpdb->esc_like('_transient_timeout_product_estimator_') . '%'
            )
        );
    }

    /**
     * Remove plugin-specific capabilities from roles.
     *
     * @since    1.0.0
     */
    private static function remove_capabilities() {
        // Get roles that have plugin capabilities
        $roles = array('administrator', 'editor', 'shop_manager');

        // List of plugin-specific capabilities
        $capabilities = array(
            'manage_product_estimator',
            'view_product_estimates',
            'edit_product_estimates'
        );

        // Remove capabilities from roles
        foreach ($roles as $role_name) {
            $role = get_role($role_name);
            if ($role) {
                foreach ($capabilities as $cap) {
                    $role->remove_cap($cap);
                }
            }
        }
    }

    /**
     * Log plugin deactivation for debugging purposes.
     *
     * @since    1.0.0
     */
    private static function log_deactivation() {
        if (!WP_DEBUG) {
            return;
        }

        $log_data = array(
            'timestamp' => current_time('mysql'),
            'user_id' => get_current_user_id(),
            'version' => PRODUCT_ESTIMATOR_VERSION,
            'wp_version' => get_bloginfo('version'),
            'php_version' => PHP_VERSION,
            'site_url' => get_site_url()
        );

        // Get plugin settings (sanitized)
        $settings = get_option('product_estimator_settings');
        if ($settings) {
            // Remove sensitive data
            unset($settings['notification_email']);
            $log_data['settings'] = $settings;
        }

        // Log to debug.log
        error_log(
            sprintf(
                '[Product Estimator] Deactivation - Data: %s',
                wp_json_encode($log_data, JSON_PRETTY_PRINT)
            )
        );

        // Store deactivation data in wp_options for future reference
        update_option(
            'product_estimator_last_deactivation',
            array(
                'timestamp' => current_time('mysql'),
                'user_id' => get_current_user_id(),
                'version' => PRODUCT_ESTIMATOR_VERSION
            )
        );
    }

    /**
     * Backup essential data before deactivation.
     *
     * @since    1.0.0
     */
    private static function backup_essential_data() {
        global $wpdb;

        // Only perform backup if the setting is enabled
        $settings = get_option('product_estimator_settings');
        if (!isset($settings['backup_on_deactivate']) || !$settings['backup_on_deactivate']) {
            return;
        }

        $tables = array(
            $wpdb->prefix . 'product_estimator_calculations',
            $wpdb->prefix . 'product_estimator_estimates'
        );

        $upload_dir = wp_upload_dir();
        $backup_dir = $upload_dir['basedir'] . '/product-estimator-backups';

        // Create backup directory if it doesn't exist
        if (!file_exists($backup_dir)) {
            wp_mkdir_p($backup_dir);

            // Create .htaccess to protect backup directory
            $htaccess_content = "Order deny,allow\nDeny from all";
            file_put_contents($backup_dir . '/.htaccess', $htaccess_content);
        }

        // Create backup file
        $backup_file = $backup_dir . '/backup-' . date('Y-m-d-H-i-s') . '.sql';
        $handle = fopen($backup_file, 'w');

        foreach ($tables as $table) {
            // Get table structure
            $results = $wpdb->get_results("SHOW CREATE TABLE $table", ARRAY_N);
            if (!empty($results)) {
                fwrite($handle, "DROP TABLE IF EXISTS $table;\n");
                fwrite($handle, $results[0][1] . ";\n\n");

                // Get table data
                $rows = $wpdb->get_results("SELECT * FROM $table", ARRAY_A);
                foreach ($rows as $row) {
                    $values = array_map(array($wpdb, '_real_escape'), $row);
                    fwrite($handle, "INSERT INTO $table VALUES ('" . implode("','", $values) . "');\n");
                }
                fwrite($handle, "\n");
            }
        }

        fclose($handle);

        // Store backup info
        update_option('product_estimator_last_backup', array(
            'timestamp' => current_time('mysql'),
            'file' => $backup_file,
            'size' => filesize($backup_file)
        ));
    }
}
