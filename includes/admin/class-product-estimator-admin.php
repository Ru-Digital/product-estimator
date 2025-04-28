<?php
namespace RuDigital\ProductEstimator\Includes\Admin;

/**
 * The admin-specific functionality of the plugin.
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/admin
 */
class ProductEstimatorAdmin {

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
     * The settings manager instance
     *
     * @since    1.1.0
     * @access   private
     * @var      SettingsManager    $settings_manager    The settings manager
     */
    private $settings_manager;

    /**
     * The customer estimates instance
     *
     * @since    1.1.0
     * @access   private
     * @var      CustomerEstimatesAdmin    $customer_estimates    Customer Estimates
     */
    private $customer_estimates;

    /**
     * The admin script handler instance
     *
     * @since    1.2.0
     * @access   private
     * @var      AdminScriptHandler    $admin_script_handler    Admin script handler
     */
    private $admin_script_handler;

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

        $this->load_dependencies();

        // FIX: Initialize script handler first before any other components
        require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/class-admin-script-handler.php';
        $this->admin_script_handler = new AdminScriptHandler($this->plugin_name, $this->version);

        // Make the admin script handler globally available for modules
        global $product_estimator_script_handler;
        $product_estimator_script_handler = $this->admin_script_handler;

        $this->init_components();
        $this->define_hooks();

        // Make this instance globally available
        global $product_estimator;
        $product_estimator = $this;
    }

    /**
     * Load required dependencies.
     *
     * @since    1.1.0
     * @access   private
     */
    private function load_dependencies() {
        // Load Settings Manager
        require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/class-settings-manager.php';

        // Load Customer Estimates Admin
        require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/class-customer-estimates-admin.php';

        // Load Customer Estimates List Table
        require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/class-customer-estimates-list-table.php';

        // Load CSV Export Handler
        require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/class-csv-export-handler.php';
    }

    /**
     * Initialize admin components.
     *
     * @since    1.1.0
     * @access   private
     */
    private function init_components() {


        // Initialize Settings Manager with the admin script handler
        $this->settings_manager = new SettingsManager(
            $this->plugin_name,
            $this->version,
            $this->admin_script_handler
        );

        // Initialize Customer Estimates Admin
        $this->customer_estimates = new CustomerEstimatesAdmin($this->plugin_name, $this->version);

        // Initialize CSV Export Handler
        new CSVExportHandler();

        // Make the admin script handler globally available for modules
        global $product_estimator_admin_script_handler;
        $product_estimator_admin_script_handler = $this->admin_script_handler;
    }

    /**
     * Register all of the hooks related to the admin area functionality.
     *
     * @since    1.0.0
     */
    private function define_hooks() {
        // Add the main admin menu
        add_action('admin_menu', array($this, 'add_plugin_admin_menu'));

        // Add action links to plugins page
        add_filter('plugin_action_links_' . PRODUCT_ESTIMATOR_BASENAME, array($this, 'add_action_links'));
    }

    /**
     * Add an options page under the Settings submenu
     *
     * @since  1.0.0
     */
    public function add_plugin_admin_menu() {
        add_menu_page(
            __('Product Estimator', $this->plugin_name),
            __('Product Estimator', $this->plugin_name),
            'manage_options',
            $this->plugin_name,
            array($this, 'display_plugin_admin_page'),
            'dashicons-calculator',
            25
        );
    }

    /**
     * Add settings action link to the plugins page.
     *
     * @since    1.0.0
     * @param    array    $links    Plugin action links.
     * @return   array    Plugin action links.
     */
    public function add_action_links($links) {
        $settings_link = array(
            '<a href="' . admin_url('admin.php?page=' . $this->plugin_name . '-settings') . '">' .
            __('Settings', 'product-estimator') . '</a>'
        );

        $customer_estimates_link = array(
            '<a href="' . admin_url('admin.php?page=' . $this->plugin_name . '-estimates') . '">' .
            __('Customer Estimates', 'product-estimator') . '</a>'
        );

        return array_merge($settings_link, $customer_estimates_link, $links);
    }

    /**
     * Render the main admin page
     *
     * @since    1.0.0
     */
    public function display_plugin_admin_page() {
        // Include the main admin dashboard template
        include_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/product-estimator-admin-display.php';
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

    /**
     * Get the customer estimates admin instance
     *
     * @since    1.2.0
     * @return   CustomerEstimatesAdmin    The customer estimates admin instance
     */
    public function get_customer_estimates() {
        return $this->customer_estimates;
    }

    /**
     * Get the admin script handler instance
     *
     * @since    1.2.0
     * @return   AdminScriptHandler    The admin script handler instance
     */
    public function get_admin_script_handler() {
        return $this->admin_script_handler;
    }

    /**
     * Get plugin name
     *
     * @since    1.2.0
     * @return   string    The plugin name
     */
    public function get_plugin_name() {
        return $this->plugin_name;
    }

    /**
     * Get plugin version
     *
     * @since    1.2.0
     * @return   string    The plugin version
     */
    public function get_version() {
        return $this->version;
    }
}
