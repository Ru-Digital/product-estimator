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
        $this->init_components();
        $this->define_hooks();
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
    }

    /**
     * Initialize admin components.
     *
     * @since    1.1.0
     * @access   private
     */
    private function init_components() {
        // Initialize Settings Manager
        $this->settings_manager = new SettingsManager($this->plugin_name, $this->version);
    }

    /**
     * Register all of the hooks related to the admin area functionality.
     *
     * @since    1.0.0
     */
    private function define_hooks() {
        // Add the main admin menu
        add_action('admin_menu', array($this, 'add_plugin_admin_menu'));

        // Register admin scripts and styles
        add_action('admin_enqueue_scripts', array($this, 'enqueue_styles'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));

        // Add action links to plugins page
//        add_filter('plugin_action_links_' . PRODUCT_ESTIMATOR_BASENAME, array($this, 'add_action_links'));

        // WooCommerce product integration
//        $this->init_woocommerce_integration();
    }

    /**
     * Register the stylesheets for the admin area.
     *
     * @since    1.0.0
     */
    public function enqueue_styles() {
        wp_enqueue_style(
            $this->plugin_name,
            plugin_dir_url(dirname(dirname(__FILE__))) . 'admin/css/product-estimator-admin.css',
            array(),
            $this->version,
            'all'
        );
    }

    /**
     * Register the JavaScript for the admin area.
     *
     * @since    1.0.0
     */
    public function enqueue_scripts() {
        wp_enqueue_script(
            $this->plugin_name,
            plugin_dir_url(dirname(dirname(__FILE__))) . 'admin/js/product-estimator-admin.js',
            array('jquery'),
            $this->version,
            true
        );

        wp_localize_script(
            $this->plugin_name,
            'productEstimatorAdmin',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('product_estimator_admin_nonce'),
                'i18n' => array(
                    'save_success' => __('Settings saved successfully!', 'product-estimator'),
                    'save_error' => __('Error saving settings.', 'product-estimator')
                )
            )
        );
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
        return array_merge($settings_link, $links);
    }

    /**
     * Render the main admin page
     *
     * @since    1.0.0
     */
    public function display_plugin_admin_page() {
        // Fix the path to point to the correct location
        $template_path = plugin_dir_path(dirname(dirname(__FILE__))) .
            'includes/admin/partials/product-estimator-admin-display.php';

        if (file_exists($template_path)) {
            include_once $template_path;
        } else {
            wp_die(__('Admin template file not found:', 'product-estimator') . ' ' . $template_path);
        }
    }
}
