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
        self::create_tables();
        self::upgrade_tables();
        self::check_requirements();
//        self::run_composer_install();
        
        // Run labels migration if the class exists
        if (class_exists('\\RuDigital\\ProductEstimator\\Includes\\LabelsMigration')) {
            require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-labels-migration.php';
            LabelsMigration::migrate();
        }

        // Set activation flag
        update_option('product_estimator_activated', true);

        // Clear any relevant caches
        wp_cache_flush();

        error_log("[Product Estimator] Activation");
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

        // Product estimates table
        $table_name = $wpdb->prefix . 'product_estimator_estimates';

        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name text NULL,
            email varchar(255) DEFAULT NULL,
            phone_number varchar(50) DEFAULT NULL,
            postcode varchar(10) DEFAULT NULL,
            total_min decimal(10,2) NOT NULL DEFAULT 0,
            total_max decimal(10,2) NOT NULL DEFAULT 0,
            markup decimal(10,2) NOT NULL DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            status varchar(20) DEFAULT 'completed',
            notes text,
            estimate_data longtext,
            PRIMARY KEY  (id),
            KEY status (status)
    ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);

        // Store the current database version
        update_option('product_estimator_db_version', '1.0.1');

        // Add debug logging
        error_log("Product Estimator table creation executed");
    }

    /**
     * Upgrade database tables if necessary
     */
    public static function upgrade_tables() {
//        global $wpdb;

//        $installed_version = get_option('product_estimator_db_version', '1.0.0');
//
//        // Check if we need to upgrade
//        if (version_compare($installed_version, '1.0.1', '<')) {
//            $table_name = $wpdb->prefix . 'product_estimator_estimates';
//
//            // Check if total_min and total_max columns already exist
//            $columns = $wpdb->get_results("SHOW COLUMNS FROM {$table_name} LIKE 'total_min'");
//            if (empty($columns)) {
//                // Add total_min and total_max columns
//                $wpdb->query("ALTER TABLE {$table_name}
//                         ADD COLUMN total_min decimal(10,2) NOT NULL DEFAULT 0,
//                         ADD COLUMN total_max decimal(10,2) NOT NULL DEFAULT 0");
//
//                // Copy existing total values to both min and max
//                $wpdb->query("UPDATE {$table_name} SET total_min = total, total_max = total");
//
//                // Optionally, you can drop the total column after migration
//                // $wpdb->query("ALTER TABLE {$table_name} DROP COLUMN total");
//            }
//
//            update_option('product_estimator_db_version', '1.0.1');
//        }
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
        if (version_compare(PHP_VERSION, '8.2', '<')) {
            deactivate_plugins(plugin_basename(PRODUCT_ESTIMATOR_PLUGIN_DIR));
            wp_die(
                esc_html__('This plugin requires PHP version 8.2 or higher.', 'product-estimator'),
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
