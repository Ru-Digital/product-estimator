<?php
namespace RuDigital\ProductEstimator\Includes\Admin;

use RuDigital\ProductEstimator\Includes\Admin\Settings\SettingsModuleInterface;

/**
 * The settings manager class.
 *
 * This class is responsible for managing all the settings modules
 * and coordinating the admin settings interface. It primarily acts as a
 * coordinator, delegating the actual implementation to individual modules.
 *
 * @since      1.2.0
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
     * Admin script handler instance
     *
     * @since    1.2.0
     * @access   private
     * @var      AdminScriptHandler    $admin_script_handler    Admin script handler instance
     */
    private $admin_script_handler;

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.2.0
     * @param    string             $plugin_name         The name of this plugin.
     * @param    string             $version             The version of this plugin.
     * @param    AdminScriptHandler $admin_script_handler The admin script handler instance.
     */
    public function __construct($plugin_name, $version, $admin_script_handler) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;

        // Fix: Set up the script handler, creating a new instance if not provided
        if ($admin_script_handler === null) {
            // Make sure the class is loaded
            if (!class_exists('RuDigital\\ProductEstimator\\Includes\\Admin\\AdminScriptHandler')) {
                require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/class-admin-script-handler.php';
            }
            $this->admin_script_handler = new AdminScriptHandler($plugin_name, $version);
        } else {
            $this->admin_script_handler = $admin_script_handler;
        }

        // Make the admin_script_handler globally available for modules
        global $product_estimator_script_handler;
        $product_estimator_script_handler = $this->admin_script_handler;

        // Load dependencies for modules
        $this->load_dependencies();

        // Let modules register themselves
        do_action('product_estimator_register_settings_modules', $this);

        // Register common hooks
        $this->register_hooks();
    }

    /**
     * Load required dependencies.
     *
     * @since    1.2.0
     * @access   private
     */
    private function load_dependencies() {
        // Load the base module and interface
        require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/settings/interface-settings-module.php';
        require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/settings/class-settings-module-base.php';

        $this->initialize_modules();
    }

    /**
     * Initialize all settings modules
     *
     * @since    1.2.0
     * @access   private
     */
    private function initialize_modules() {
        // Define the module classes to load
        $module_classes = [
            'GeneralSettingsModule',
            'NetsuiteSettingsModule',
            'ProductAdditionsSettingsModule',
            'PricingRulesSettingsModule',
            'SimilarProductsSettingsModule',
            'ProductUpgradesSettingsModule',
            'NotificationSettingsModule',
            'LabelsSettingsModule',
            'FeatureSwitchesSettingsModule',

        ];

        // Load and initialize each module
        foreach ($module_classes as $class_name) {

            $file_name = 'class-' . strtolower(preg_replace('/([a-z])([A-Z])/', '$1-$2', $class_name)) . '.php';
            $file_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/settings/' . $file_name;

            if (file_exists($file_path)) {
                require_once $file_path;

                // Create the fully qualified class name
                $full_class_name = 'RuDigital\\ProductEstimator\\Includes\\Admin\\Settings\\' . $class_name;

                if (class_exists($full_class_name)) {
                    // Instantiate the module
                    $module = new $full_class_name($this->plugin_name, $this->version);
                    $this->register_module($module);
                }
            }
        }
    }

    /**
     * Register a settings module with the manager
     *
     * @since    1.2.0
     * @access   public
     * @param    SettingsModuleInterface $module The module to register
     */
    public function register_module(SettingsModuleInterface $module) {
        $this->modules[$module->get_tab_id()] = $module;

        // Register module script data
        $this->register_module_script_data($module);
    }

    /**
     * Register module-specific script data
     *
     * @since    1.2.0
     * @access   private
     * @param    SettingsModuleInterface $module The settings module
     */
    private function register_module_script_data(SettingsModuleInterface $module) {
        $tab_id = $module->get_tab_id();

        // Convert tab ID to JS variable name (camelCase convention)
        $js_var_name = lcfirst(str_replace('-', '', ucwords($tab_id, '-'))) . 'Settings';

        // Prepare module script data
        $module_data = array(
            'tab_id' => $tab_id,
            'nonce' => wp_create_nonce('product_estimator_' . $tab_id . '_nonce'),
            'ajax_url' => admin_url('admin-ajax.php')
        );

        // Add module data to script handler
        $this->admin_script_handler->add_script_data($js_var_name, $module_data);

        wp_localize_script(
            $this->plugin_name . '-admin',
            $js_var_name,
            $module_data
        );
    }

    /**
     * Register all of the hooks related to the admin settings functionality.
     *
     * @since    1.2.0
     * @access   private
     */
    private function register_hooks() {
        // Add admin menu
        add_action('admin_menu', array($this, 'add_settings_pages'), 30);

        // Register main settings
        add_action('admin_init', array($this, 'register_main_settings'));
    }

    /**
     * Register the main settings group.
     *
     * @since    1.2.0
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
     * @since    1.2.0
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
     * @since    1.2.0
     * @access   public
     */
    public function display_settings_page() {
        // Get active tab from URL or use first tab as default
        $active_tab = isset($_GET['tab']) ? sanitize_key($_GET['tab']) : '';

        // If no tab is specified or the tab doesn't exist, use the first tab
        if (empty($active_tab) || !isset($this->modules[$active_tab])) {
            // Get first module as default
            reset($this->modules);
            $active_tab = key($this->modules);
        }

        // Make variables available to the template
        $modules = $this->modules;
        $plugin_name = $this->plugin_name;

        // Include settings page template
        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/product-estimator-admin-settings.php';
    }

    /**
     * Validate settings from all modules
     *
     * @since    1.2.0
     * @access   public
     * @param    array    $input    The settings to validate
     * @return   array    The validated settings
     */
    public function validate_settings($input) {
        $valid = [];

        // If input is empty, return empty array to prevent clearing existing settings
        if (empty($input) || !is_array($input)) {
            return $valid;
        }

        // Organize settings by module
        $module_settings = [];
        $unclaimed_settings = [];

        // First pass: group settings by their respective modules
        foreach ($input as $key => $value) {
            $module_found = false;

            // Find which module handles this setting
            foreach ($this->modules as $module) {
                if (method_exists($module, 'has_setting') && $module->has_setting($key)) {
                    $module_settings[$module->get_tab_id()][$key] = $value;
                    $module_found = true;
                    break;
                }
            }

            // If no module claims this setting, add to unclaimed list
            if (!$module_found) {
                $unclaimed_settings[$key] = $value;
            }
        }

        // Second pass: validate settings with their respective modules
        foreach ($module_settings as $tab_id => $settings) {
            if (isset($this->modules[$tab_id])) {
                $module_valid = $this->modules[$tab_id]->validate_settings($settings);
                $valid = array_merge($valid, $module_valid);
            }
        }

        // Handle any unclaimed settings with basic sanitization
        foreach ($unclaimed_settings as $key => $value) {
            // Apply default sanitization based on value type
            if (is_bool($value)) {
                $valid[$key] = (bool) $value;
            } elseif (is_numeric($value)) {
                $valid[$key] = floatval($value);
            } elseif (is_string($value)) {
                if (filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $valid[$key] = sanitize_email($value);
                } else {
                    $valid[$key] = sanitize_text_field($value);
                }
            } else {
                // For arrays or objects, leave as is
                $valid[$key] = $value;
            }
        }

        return $valid;
    }

    /**
     * Get all registered modules.
     *
     * @since    1.2.0
     * @access   public
     * @return   array    List of registered settings modules.
     */
    public function get_modules() {
        return $this->modules;
    }

    /**
     * Get a specific module by tab ID.
     *
     * @since    1.2.0
     * @access   public
     * @param    string    $tab_id    The tab ID to retrieve.
     * @return   SettingsModuleInterface|null    The requested module or null if not found.
     */
    public function get_module($tab_id) {
        return isset($this->modules[$tab_id]) ? $this->modules[$tab_id] : null;
    }

    /**
     * Output WordPress settings fields with a unique nonce ID.
     * This method modifies the standard settings_fields() function to prevent duplicate IDs.
     *
     * @since    1.3.0
     * @access   public
     * @param    string    $option_group    The option group name.
     * @param    string    $unique_suffix   A unique suffix to add to the nonce ID.
     * @return   void
     */
    public function settings_fields_unique($option_group, $unique_suffix) {
        // Capture the output of settings_fields
        ob_start();
        settings_fields($option_group);
        $settings_fields = ob_get_clean();
        
        // Add unique ID to _wpnonce field
        $settings_fields = str_replace('id="_wpnonce"', 'id="_wpnonce_' . esc_attr($unique_suffix) . '"', $settings_fields);
        
        // Output the modified fields
        echo $settings_fields;
    }
}
