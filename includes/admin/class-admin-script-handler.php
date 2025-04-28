<?php
namespace RuDigital\ProductEstimator\Includes\Admin;

/**
 * Admin Script Handler Class
 *
 * Handles all script and style enqueuing for the admin area of the Product Estimator plugin.
 *
 * @since      1.2.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin
 */
class AdminScriptHandler {

    /**
     * The plugin name.
     *
     * @since    1.2.0
     * @access   private
     * @var      string    $plugin_name    The name of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     *
     * @since    1.2.0
     * @access   private
     * @var      string    $version    The current version of this plugin.
     */
    private $version;

    /**
     * Store localization data for admin scripts.
     *
     * @since    1.2.0
     * @access   private
     * @var      array    $script_data    Data to be localized for scripts.
     */
    private $script_data = array();

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.2.0
     * @param    string    $plugin_name    The name of this plugin.
     * @param    string    $version        The version of this plugin.
     */
    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;

        // Register hooks for admin script handling
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'), 5);
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_styles'), 5);

        $this->initialize_script_data();

        // Make this instance globally available
        global $product_estimator_script_handler;
        $product_estimator_script_handler = $this;
    }

    /**
     * Initialize default script data.
     *
     * @since    1.2.0
     * @access   private
     */
    private function initialize_script_data() {
        $this->script_data = array(
            'main' => array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('product_estimator_admin_nonce'),
                'plugin_url' => PRODUCT_ESTIMATOR_PLUGIN_URL,
                'admin_url' => admin_url(),
                'i18n' => array(
                    'loading' => __('Loading...', 'product-estimator'),
                    'success' => __('Success!', 'product-estimator'),
                    'error' => __('Error occurred.', 'product-estimator'),
                    'unsavedChanges' => __('You have unsaved changes. Are you sure you want to leave?', 'product-estimator'),
                    'confirmDelete' => __('Are you sure you want to delete this item?', 'product-estimator'),
                    'invalidEmail' => __('Please enter a valid email address.', 'product-estimator'),
                    'numberRange' => __('Value must be between %min% and %max%.', 'product-estimator'),
                    'required' => __('This field is required.', 'product-estimator'),
                    'save' => __('Save', 'product-estimator'),
                    'saving' => __('Saving...', 'product-estimator'),
                    'saved' => __('Saved!', 'product-estimator'),
                    'cancel' => __('Cancel', 'product-estimator'),
                    'add' => __('Add', 'product-estimator'),
                    'delete' => __('Delete', 'product-estimator'),
                    'edit' => __('Edit', 'product-estimator')
                )
            ),
            'settings' => array(
                'nonce' => wp_create_nonce('product_estimator_settings_nonce'),
                'current_tab' => isset($_GET['tab']) ? sanitize_key($_GET['tab']) : '',
                'i18n' => array(
                    'unsavedChanges' => __('You have unsaved changes. Are you sure you want to leave this tab?', 'product-estimator'),
                    'saveSuccess' => __('Settings saved successfully.', 'product-estimator'),
                    'saveError' => __('Error saving settings.', 'product-estimator'),
                    'saving' => __('Saving...', 'product-estimator')
                )
            ),
            'customer_estimates' => array(
                'nonce' => wp_create_nonce('customer_estimates_admin_nonce'),
                'i18n' => array(
                    'confirmBulkDelete' => __('Are you sure you want to delete the selected estimates?', 'product-estimator'),
                    'emailSending' => __('Sending...', 'product-estimator'),
                    'emailSuccess' => __('Email sent successfully!', 'product-estimator'),
                    'emailError' => __('Failed to send email', 'product-estimator'),
                    'deleteConfirm' => __('Are you sure you want to delete this estimate?', 'product-estimator'),
                    'duplicateConfirm' => __('Are you sure you want to duplicate this estimate?', 'product-estimator'),
                    'loadingMessage' => __('Loading...', 'product-estimator'),
                    'errorMessage' => __('An error occurred', 'product-estimator'),
                    'noEstimatesMessage' => __('No estimates found', 'product-estimator')
                ),
                'current_filter' => isset($_GET['status_filter']) ? sanitize_text_field($_GET['status_filter']) : 'all'
            )
        );
    }

    /**
     * Register and enqueue admin scripts
     *
     * @since    1.2.0
     * @param    string    $hook_suffix    The current admin page.
     */
    public function enqueue_admin_scripts($hook_suffix) {
        // Only load on plugin admin pages or WooCommerce product pages
        $is_plugin_page = strpos($hook_suffix, $this->plugin_name) !== false;
        $is_product_page = in_array($hook_suffix, array('post.php', 'post-new.php')) &&
            isset($_GET['post_type']) &&
            $_GET['post_type'] === 'product';

        if (!$is_plugin_page && !$is_product_page) {
            return;
        }

        // Enqueue common bundle if it exists
        if (file_exists(PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/js/common.bundle.js')) {
            wp_enqueue_script(
                $this->plugin_name . '-admin-common',
                PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/js/common.bundle.js',
                array('jquery'),
                $this->version,
                true
            );
        }

        // Enqueue admin bundle - check if file exists first to prevent errors
        $admin_bundle_path = 'public/js/admin/product-estimator-admin.bundle.js';
        if (file_exists(PRODUCT_ESTIMATOR_PLUGIN_DIR . $admin_bundle_path)) {
            wp_enqueue_script(
                $this->plugin_name . '-admin',
                PRODUCT_ESTIMATOR_PLUGIN_URL . $admin_bundle_path,
                array('jquery'),
                $this->version,
                true
            );

            // Localize scripts with stored data
            $this->localize_scripts($hook_suffix);
        } else {
            // Log error if the file doesn't exist
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Admin bundle not found: ' . PRODUCT_ESTIMATOR_PLUGIN_DIR . $admin_bundle_path);
            }
        }
    }
    /**
     * Register and enqueue admin styles
     *
     * @since    1.2.0
     * @param    string    $hook_suffix    The current admin page.
     */
    public function enqueue_admin_styles($hook_suffix) {
        // Only load on plugin admin pages or WooCommerce product pages
        $is_plugin_page = strpos($hook_suffix, $this->plugin_name) !== false;
        $is_product_page = in_array($hook_suffix, array('post.php', 'post-new.php')) &&
            isset($_GET['post_type']) &&
            $_GET['post_type'] === 'product';

        if (!$is_plugin_page && !$is_product_page) {
            return;
        }

        // Enqueue the admin styles
        wp_enqueue_style(
            $this->plugin_name . '-admin',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/product-estimator-admin.css',
            array(),
            $this->version,
            'all'
        );

        // Enqueue settings-specific styles if on settings page
        if (strpos($hook_suffix, $this->plugin_name . '-settings') !== false) {
            wp_enqueue_style(
                $this->plugin_name . '-settings',
                PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/product-estimator-settings.css',
                array(),
                $this->version
            );
        }
    }

    /**
     * Add data to be localized with scripts.
     *
     * @since    1.2.0
     * @access   public
     * @param    string    $context    Context key for data (main, settings, module name, etc.)
     * @param    mixed     $data       Data to add (array or scalar)
     */
    public function add_script_data($context, $data) {
        if (!isset($this->script_data[$context])) {
            $this->script_data[$context] = array();
        }

        // If data is an array, merge it with existing data
        if (is_array($data)) {
            $this->script_data[$context] = array_merge($this->script_data[$context], $data);
        } else {
            // For backwards compatibility or simple values
            $this->script_data[$context] = $data;
        }
    }

    /**
     * Add specific key-value pair to script data context
     *
     * @since    1.2.0
     * @access   public
     * @param    string    $context    Context key for data
     * @param    string    $key        Key for this data
     * @param    mixed     $value      Value to store
     */
    public function add_script_data_value($context, $key, $value) {
        if (!isset($this->script_data[$context])) {
            $this->script_data[$context] = array();
        }
        $this->script_data[$context][$key] = $value;
    }

    /**
     * Get script data for a context.
     *
     * @since    1.2.0
     * @access   public
     * @param    string    $context    Context key for data
     * @return   mixed     Data for this context
     */
    public function get_script_data($context) {
        return isset($this->script_data[$context]) ? $this->script_data[$context] : array();
    }

    /**
     * Get all script data.
     *
     * @since    1.2.0
     * @access   public
     * @return   array     All script data
     */
    public function get_all_script_data() {
        return $this->script_data;
    }

    /**
     * Localize scripts with stored data.
     *
     * @since    1.2.0
     * @access   public
     * @param    string    $hook_suffix    The current admin page hook suffix.
     */
    public function localize_scripts($hook_suffix) {
        // Localize main script data
        if (isset($this->script_data['main'])) {
            wp_localize_script(
                $this->plugin_name . '-admin',
                'productEstimatorAdmin',
                $this->script_data['main']
            );
        }

        // Localize settings script data if on settings page
        if (strpos($hook_suffix, $this->plugin_name . '-settings') !== false && isset($this->script_data['settings'])) {
            wp_localize_script(
                $this->plugin_name . '-admin',
                'productEstimatorSettings',
                $this->script_data['settings']
            );
        }

        // Localize customer estimates script data if on estimates page
        if (strpos($hook_suffix, $this->plugin_name . '-estimates') !== false && isset($this->script_data['customer_estimates'])) {
            wp_localize_script(
                $this->plugin_name . '-admin',
                'customerEstimatesAdmin',
                $this->script_data['customer_estimates']
            );
        }

        // If on product edit page, add product-specific data
        if (in_array($hook_suffix, array('post.php', 'post-new.php')) &&
            isset($_GET['post_type']) && $_GET['post_type'] === 'product') {

            $post_id = isset($_GET['post']) ? intval($_GET['post']) : 0;

            if ($post_id > 0) {
                wp_localize_script(
                    $this->plugin_name . '-admin',
                    'productEstimatorProductData',
                    array(
                        'product_id' => $post_id,
                        'enable_estimator' => get_post_meta($post_id, '_enable_estimator', true) ? true : false,
                        'estimator_settings' => $this->get_product_estimator_settings($post_id)
                    )
                );
            }
        }

        // Localize module-specific data
        $this->localize_module_data();
    }

    /**
     * Localize any module-specific script data.
     *
     * @since    1.2.0
     * @access   private
     */
    private function localize_module_data() {
        // Localize module data for all registered modules
        foreach ($this->script_data as $context => $data) {
            // Skip main, settings, and customer_estimates data which are handled separately
            if ($context === 'main' || $context === 'settings' || $context === 'customer_estimates') {
                continue;
            }

            // Localize module-specific data
            wp_localize_script(
                $this->plugin_name . '-admin',
                $context,
                $data
            );
        }
    }

    /**
     * Get product estimator settings
     *
     * @param int $product_id The product ID
     * @return array The estimator settings
     */
    private function get_product_estimator_settings($product_id) {
        // Get any product-specific estimator settings
        $settings = array();

        // Example: pricing method
        $pricing_method = get_post_meta($product_id, '_estimator_pricing_method', true);
        if ($pricing_method) {
            $settings['pricing_method'] = $pricing_method;
        }

        // Example: minimum size
        $min_size = get_post_meta($product_id, '_estimator_min_size', true);
        if ($min_size) {
            $settings['min_size'] = floatval($min_size);
        }

        // Example: maximum size
        $max_size = get_post_meta($product_id, '_estimator_max_size', true);
        if ($max_size) {
            $settings['max_size'] = floatval($max_size);
        }

        return $settings;
    }
}
