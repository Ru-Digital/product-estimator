<?php
namespace RuDigital\ProductEstimator\Includes\Admin;

use RuDigital\ProductEstimator\Includes\Admin\Settings\SettingsModuleBase;

/**
 * The settings manager class.
 *
 * This class is responsible for managing all the settings modules
 * and coordinating the admin settings interface.
 *
 * @since      1.1.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin
 */
class SettingsManager {

    /**
     * The ID of this plugin.
     *
     * @since    1.1.0
     * @access   private
     * @var      string    $plugin_name    The ID of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     *
     * @since    1.1.0
     * @access   private
     * @var      string    $version    The current version of this plugin.
     */
    private $version;

    /**
     * Array of registered settings modules.
     *
     * @since    1.1.0
     * @access   private
     * @var      array    $modules    Registered settings modules.
     */
    private $modules = array();

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.1.0
     * @param    string    $plugin_name    The name of this plugin.
     * @param    string    $version        The version of this plugin.
     */
    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;

        $this->load_dependencies();
        $this->register_modules();
        $this->register_hooks();
    }

    /**
     * Load required dependencies.
     *
     * @since    1.1.0
     * @access   private
     */
    private function load_dependencies() {
        // Base settings module
        require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/settings/class-settings-module-base.php';

        // Settings modules
        require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/settings/class-general-settings-module.php';
        require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/settings/class-netsuite-settings-module.php';
        require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/settings/class-notification-settings-module.php';
    }

    /**
     * Register all settings modules.
     *
     * @since    1.1.0
     * @access   private
     */
    private function register_modules() {
        // Create instances of each module
        $modules = array(
            new \RuDigital\ProductEstimator\Includes\Admin\Settings\GeneralSettingsModule($this->plugin_name, $this->version),
            new \RuDigital\ProductEstimator\Includes\Admin\Settings\NetsuiteSettingsModule($this->plugin_name, $this->version),
            new \RuDigital\ProductEstimator\Includes\Admin\Settings\NotificationSettingsModule($this->plugin_name, $this->version),
        );

        // Store modules by their tab ID for easy access
        foreach ($modules as $module) {
            if ($module instanceof SettingsModuleBase) {
                $this->modules[$module->get_tab_id()] = $module;
            }
        }
    }

    /**
     * Register all of the hooks related to the admin settings functionality.
     *
     * @since    1.1.0
     * @access   private
     */
    private function register_hooks() {
        // Add admin menu
        add_action('admin_menu', array($this, 'add_settings_pages'), 30);

        // Register main settings
        add_action('admin_init', array($this, 'register_main_settings'));

        // Add script to handle tab switching
        add_action('admin_enqueue_scripts', array($this, 'enqueue_settings_scripts'));
    }

    /**
     * Register the main settings group.
     *
     * @since    1.1.0
     * @access   public
     */
    public function register_main_settings() {
        // Register the main settings option
        register_setting(
            $this->plugin_name . '_options',
            'product_estimator_settings',
            array($this, 'validate_settings')
        );
    }

    /**
     * Add the settings pages to the admin menu.
     *
     * @since    1.1.0
     * @access   public
     */
    public function add_settings_pages() {
        // Add the settings page
        add_submenu_page(
            $this->plugin_name, // Parent menu slug
            __('Settings', $this->plugin_name),
            __('Settings', $this->plugin_name),
            'manage_options',
            $this->plugin_name . '-settings',
            array($this, 'display_settings_page')
        );
    }

    /**
     * Display the settings page.
     *
     * @since    1.1.0
     * @access   public
     */
    public function display_settings_page() {
        // Include settings page template
        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/product-estimator-admin-settings.php';
    }

    /**
     * Get all registered modules.
     *
     * @since    1.1.0
     * @access   public
     * @return   array    List of registered settings modules.
     */
    public function get_modules() {
        return $this->modules;
    }

    /**
     * Get a specific module by tab ID.
     *
     * @since    1.1.0
     * @access   public
     * @param    string    $tab_id    The tab ID to retrieve.
     * @return   SettingsModuleBase|null    The requested module or null if not found.
     */
    public function get_module($tab_id) {
        return isset($this->modules[$tab_id]) ? $this->modules[$tab_id] : null;
    }

    /**
     * Enqueue scripts for the settings page.
     *
     * @since    1.1.0
     * @access   public
     * @param    string    $hook_suffix    The current admin page.
     */
    public function enqueue_settings_scripts($hook_suffix) {
        // Only load on the plugin's settings page
        if (strpos($hook_suffix, $this->plugin_name . '-settings') === false) {
            return;
        }

        // Enqueue main settings script
        wp_enqueue_script(
            $this->plugin_name . '-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/js/product-estimator-settings.js',
            array('jquery'),
            $this->version,
            true
        );

        // Localize script
        wp_localize_script(
            $this->plugin_name . '-settings',
            'productEstimatorSettings',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('product_estimator_settings_nonce'),
                'i18n' => array(
                    'unsavedChanges' => __('You have unsaved changes. Are you sure you want to leave this tab?', 'product-estimator'),
                    'saveSuccess' => __('Settings saved successfully.', 'product-estimator'),
                    'saveError' => __('Error saving settings.', 'product-estimator'),
                    'saving' => __('Saving...', 'product-estimator'),
                    'invalidEmail' => __('Please enter a valid email address', 'product-estimator'),
                    'numberRange' => __('Value must be between %min% and %max%', 'product-estimator')
                )
            )
        );

        // Enqueue main settings style
        wp_enqueue_style(
            $this->plugin_name . '-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/product-estimator-settings.css',
            array(),
            $this->version
        );
    }

    /**
     * Validate settings before saving.
     *
     * @since    1.1.0
     * @access   public
     * @param    array    $input    The settings input to validate.
     * @return   array    The validated settings.
     */
    public function validate_settings($input) {
        $valid = array();

        // If input is empty, return empty array to prevent clearing existing settings
        if (empty($input) || !is_array($input)) {
            return $valid;
        }

        foreach ($input as $key => $value) {
            switch ($key) {
                // Boolean fields
                case 'netsuite_enabled':
                case 'room_dimensions_required':
                case 'enable_notifications':
                case 'admin_email_notifications':
                case 'user_email_notifications':
                    $valid[$key] = isset($value) && $value ? 1 : 0;
                    break;

                // Text fields that should be sanitized as text
                case 'netsuite_client_id':
                case 'netsuite_api_url':
                case 'netsuite_token_url':
                case 'email_subject_template':
                    $valid[$key] = sanitize_text_field($value);
                    break;

                // Secret/password fields - preserve if empty (for updating forms that don't resend passwords)
                case 'netsuite_client_secret':
                    if (!empty($value)) {
                        $valid[$key] = sanitize_text_field($value);
                    } else {
                        // Get existing value
                        $current_settings = get_option('product_estimator_settings', array());
                        if (isset($current_settings[$key])) {
                            $valid[$key] = $current_settings[$key];
                        }
                    }
                    break;

                // Email fields
                case 'default_designer_email':
                case 'default_store_email':
                    if (!empty($value) && !is_email($value)) {
                        add_settings_error(
                            'product_estimator_settings',
                            'invalid_email',
                            sprintf(__('"%s" is not a valid email address', 'product-estimator'), $value)
                        );
                    } else {
                        $valid[$key] = sanitize_email($value);
                    }
                    break;

                // Integer fields
                case 'default_markup':
                case 'netsuite_request_limit':
                case 'netsuite_cache_time':
                case 'estimate_expiry_days':
                    $valid[$key] = absint($value);
                    break;

                // HTML content
                case 'pdf_footer_text':
                    $valid[$key] = wp_kses_post($value);
                    break;

                // Media/image fields
                case 'company_logo':
                    // Validate attachment ID
                    if (!empty($value) && is_numeric($value)) {
                        $attachment = get_post($value);
                        if ($attachment && 'attachment' === $attachment->post_type) {
                            $valid[$key] = absint($value);
                        }
                    } elseif (empty($value)) {
                        $valid[$key] = '';
                    }
                    break;

                // Default case for any other fields
                default:
                    $valid[$key] = sanitize_text_field($value);
            }
        }

        return $valid;
    }
}
