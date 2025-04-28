<?php
// File: includes/admin/class-product-estimator-settings.php

namespace RuDigital\ProductEstimator\Includes\Admin;

/**
 * Product Estimator Settings Handler
 *
 * Main settings coordinator that bridges between the WP Settings API and
 * our modular settings architecture.
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin
 */
class ProductEstimatorSettings {

    /**
     * The ID of this plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      string    $plugin_name    The ID of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      string    $version    The current version of this plugin.
     */
    private $version;

    /**
     * Option name for settings
     *
     * @since    1.0.0
     * @access   private
     * @var      string    $option_name    Option name for settings.
     */
    private $option_name = 'product_estimator_settings';

    /**
     * Settings manager instance
     *
     * @since    1.2.0
     * @access   private
     * @var      SettingsManager    $settings_manager    Settings manager instance
     */
    private $settings_manager;

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.0.0
     * @param    string    $plugin_name    The name of this plugin.
     * @param    string    $version        The version of this plugin.
     */
    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;

        // Initialize settings manager
        $this->settings_manager = new SettingsManager($plugin_name, $version);

        // Register our hooks
        $this->register_hooks();
    }

    /**
     * Register all the needed hooks
     *
     * @since    1.2.0
     * @access   private
     */
    private function register_hooks() {
        // Legacy settings registration for backward compatibility
//        add_action('admin_init', array($this, 'register_legacy_settings'));

        // Add settings link to plugins page
        add_filter('plugin_action_links_' . PRODUCT_ESTIMATOR_BASENAME, array($this, 'add_settings_link'));

        // Add admin notices for settings-related events
        add_action('admin_notices', array($this, 'settings_admin_notices'));
    }

//    /**
//     * Register legacy settings for backward compatibility
//     *
//     * This ensures old settings formats are still supported
//     */
//    public function register_legacy_settings() {
//        // Register the main settings option
//        register_setting(
//            $this->plugin_name . '_options',
//            $this->option_name,
//            array($this, 'validate_legacy_settings')
//        );
//    }

//    /**
//     * Validate legacy settings format
//     *
//     * @param array $input Input settings
//     * @return array Validated settings
//     */
//    public function validate_legacy_settings($input) {
//        // Get existing settings
//        $current_settings = get_option($this->option_name, array());
//
//        // Merge with new input
//        $merged_settings = array_merge($current_settings, $input);
//
//        // Apply basic sanitization
//        $valid = array();
//
//        foreach ($merged_settings as $key => $value) {
//            switch ($key) {
//                // Boolean fields
//                case 'netsuite_enabled':
//                case 'room_dimensions_required':
//                case 'enable_notifications':
//                    $valid[$key] = !empty($value) ? 1 : 0;
//                    break;
//
//                // Email fields
//                case 'default_designer_email':
//                case 'default_store_email':
//                case 'from_email':
//                    $valid[$key] = sanitize_email($value);
//                    break;
//
//                // Numeric fields
//                case 'default_markup':
//                case 'estimate_expiry_days':
//                case 'netsuite_request_limit':
//                case 'netsuite_cache_time':
//                    $valid[$key] = intval($value);
//                    break;
//
//                // URL fields
//                case 'netsuite_api_url':
//                case 'netsuite_token_url':
//                    $valid[$key] = esc_url_raw($value);
//                    break;
//
//                // Text areas with allowed HTML
//                case 'pdf_footer_text':
//                    $valid[$key] = wp_kses_post($value);
//                    break;
//
//                // Default sanitization for other fields
//                default:
//                    $valid[$key] = sanitize_text_field($value);
//                    break;
//            }
//        }
//
//        return $valid;
//    }

    /**
     * Add settings link to plugins page
     *
     * @since    1.0.0
     * @param    array    $links    Plugin action links.
     * @return   array    Plugin action links.
     */
    public function add_settings_link($links) {
        $settings_link = array(
            '<a href="' . admin_url('admin.php?page=' . $this->plugin_name . '-settings') . '">' .
            __('Settings', 'product-estimator') . '</a>'
        );

        return array_merge($settings_link, $links);
    }

    /**
     * Display admin notices for settings
     *
     * @since    1.2.0
     */
    public function settings_admin_notices() {
        // Check if we're on our settings page
        $screen = get_current_screen();
        if (!$screen || strpos($screen->id, $this->plugin_name) === false) {
            return;
        }

        // Check for settings messages
        if (!isset($_GET['message'])) {
            return;
        }

        $message = sanitize_key($_GET['message']);
        $notice_html = '';
        $notice_type = 'success';

        switch ($message) {
            case 'settings_updated':
                $notice_html = __('Settings updated successfully.', 'product-estimator');
                break;

            case 'settings_error':
                $notice_html = __('Error updating settings. Please try again.', 'product-estimator');
                $notice_type = 'error';
                break;

            case 'netsuite_connected':
                $notice_html = __('NetSuite API connection successful!', 'product-estimator');
                break;

            case 'netsuite_error':
                $notice_html = isset($_GET['error'])
                    ? sanitize_text_field(urldecode($_GET['error']))
                    : __('NetSuite API connection failed.', 'product-estimator');
                $notice_type = 'error';
                break;
        }

        if (!empty($notice_html)) {
            printf(
                '<div class="notice notice-%s is-dismissible"><p>%s</p></div>',
                esc_attr($notice_type),
                esc_html($notice_html)
            );
        }
    }

    /**
     * Get a specific setting
     *
     * @since    1.2.0
     * @param    string    $key         The setting key to retrieve
     * @param    mixed     $default     Default value if setting doesn't exist
     * @return   mixed                  The setting value or default
     */
    public function get_setting($key, $default = null) {
        $options = get_option($this->option_name, array());
        return isset($options[$key]) ? $options[$key] : $default;
    }

    /**
     * Update a specific setting
     *
     * @since    1.2.0
     * @param    string    $key         The setting key to update
     * @param    mixed     $value       The new value
     * @return   bool                   True if updated, false otherwise
     */
    public function update_setting($key, $value) {
        $options = get_option($this->option_name, array());
        $options[$key] = $value;
        return update_option($this->option_name, $options);
    }

    /**
     * Get all settings
     *
     * @since    1.2.0
     * @return   array     All settings
     */
    public function get_all_settings() {
        return get_option($this->option_name, array());
    }

    /**
     * Get the settings manager instance
     *
     * @since    1.2.0
     * @return   SettingsManager    The settings manager instance
     */
    public function get_settings_manager() {
        return $this->settings_manager;
    }
}
