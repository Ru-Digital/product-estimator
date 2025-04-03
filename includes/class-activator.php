<?php
namespace RuDigital\ProductEstimator\Includes;

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */
class Activator {

    /**
     * Plugin activation handler.
     *
     * Creates necessary database tables and sets up default options
     * when the plugin is activated.
     *
     * @since    1.0.0
     */
    public static function activate() {
//        self::create_tables();
//        self::set_default_options();
//        self::check_requirements();
//        self::run_composer_install();
s
        // Set activation flag
        update_option('product_estimator_activated', true);

        // Clear any relevant caches
        wp_cache_flush();
    }


    private static function run_composer_install() {
        $pluginPath = dirname(__FILE__, 2); // Adjust based on directory structure
        $composerAutoload = $pluginPath . '/vendor/autoload.php';

        // If dependencies are missing, attempt to install them
        if (!file_exists($composerAutoload)) {
            // Check if Composer is available
            $composerCmd = shell_exec('command -v composer');

            if ($composerCmd) {
                // Run composer install
                exec("cd {$pluginPath} && composer install --no-dev 2>&1", $output, $returnCode);

                if ($returnCode !== 0) {
                    error_log("Composer install failed: " . implode("\n", $output));
                    wp_die('Composer dependencies could not be installed automatically. Please run `composer install` in the plugin directory.');
                }
            } else {
                wp_die('Composer is not installed on the server. Please install Composer or run `composer install` manually.');
            }
        }
    }
    /**
     * Create plugin database tables.
     *
     * @since    1.0.0
     */
    private static function create_tables() {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();

        // Calculations table
        $table_name = $wpdb->prefix . 'product_estimator_calculations';

        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            calculation_data longtext NOT NULL,
            result decimal(10,2) NOT NULL,
            time datetime DEFAULT CURRENT_TIMESTAMP,
            status varchar(20) DEFAULT 'completed',
            notes text,
            PRIMARY KEY  (id),
            KEY user_id (user_id),
            KEY status (status),
            KEY time (time)
        ) $charset_collate;";

        // Product estimates table
        $estimates_table = $wpdb->prefix . 'product_estimator_estimates';

        $sql .= "CREATE TABLE IF NOT EXISTS $estimates_table (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            description text,
            base_price decimal(10,2) NOT NULL,
            multiplier decimal(5,2) DEFAULT '1.00',
            is_active tinyint(1) DEFAULT 1,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY is_active (is_active)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);

        // Store the current database version
        update_option('product_estimator_db_version', '1.0.0');
    }

    /**
     * Set default plugin options.
     *
     * @since    1.0.0
     */
    private static function set_default_options() {
        $default_options = array(
            'currency' => 'USD',
            'decimal_points' => 2,
            'enable_logging' => true,
            'minimum_quantity' => 1,
            'maximum_quantity' => 1000,
            'enable_notifications' => true,
            'admin_email_notifications' => true,
            'user_email_notifications' => true,
            'notification_email' => get_option('admin_email'),
            'version' => PRODUCT_ESTIMATOR_VERSION
        );

        // Only add options if they don't exist
        if (!get_option('product_estimator_settings')) {
            add_option('product_estimator_settings', $default_options);
        }

        // Set default capabilities for admin role
        $role = get_role('administrator');
        if ($role) {
            $role->add_cap('manage_product_estimator');
            $role->add_cap('view_product_estimates');
            $role->add_cap('edit_product_estimates');
        }
    }

    /**
     * Check plugin requirements.
     *
     * @since    1.0.0
     * @throws   \Exception If requirements are not met.
     */
    private static function check_requirements() {
        global $wp_version;

        // Check WordPress version
        if (version_compare($wp_version, '5.0', '<')) {
            deactivate_plugins(plugin_basename(PRODUCT_ESTIMATOR_PLUGIN_DIR));
            wp_die(
                esc_html__('This plugin requires WordPress version 5.0 or higher.', 'product-estimator'),
                'Plugin Activation Error',
                array('back_link' => true)
            );
        }

        // Check PHP version
        if (version_compare(PHP_VERSION, '7.4', '<')) {
            deactivate_plugins(plugin_basename(PRODUCT_ESTIMATOR_PLUGIN_DIR));
            wp_die(
                esc_html__('This plugin requires PHP version 7.4 or higher.', 'product-estimator'),
                'Plugin Activation Error',
                array('back_link' => true)
            );
        }

        // Check if required PHP extensions are loaded
        $required_extensions = array('mysqli', 'json');
        $missing_extensions = array();

        foreach ($required_extensions as $ext) {
            if (!extension_loaded($ext)) {
                $missing_extensions[] = $ext;
            }
        }

        if (!empty($missing_extensions)) {
            deactivate_plugins(plugin_basename(PRODUCT_ESTIMATOR_PLUGIN_DIR));
            wp_die(
                sprintf(
                    esc_html__('This plugin requires the following PHP extensions: %s', 'product-estimator'),
                    implode(', ', $missing_extensions)
                ),
                'Plugin Activation Error',
                array('back_link' => true)
            );
        }

        // Ensure uploads directory is writable
        $upload_dir = wp_upload_dir();
        if (!wp_is_writable($upload_dir['basedir'])) {
            deactivate_plugins(plugin_basename(PRODUCT_ESTIMATOR_PLUGIN_DIR));
            wp_die(
                esc_html__('Upload directory is not writable. Please check your permissions.', 'product-estimator'),
                'Plugin Activation Error',
                array('back_link' => true)
            );
        }
    }
}
