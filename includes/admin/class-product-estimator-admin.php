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
     * The settings instance
     *
     * @since    1.0.0
     * @access   private
     * @var      ProductEstimatorSettings    $settings    The settings handler
     */
    private $settings;

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

        // Properly initialize settings
        $this->settings = new ProductEstimatorSettings($plugin_name, $version);

        // Add this line to hook the menu method to the admin_menu action
        add_action('admin_menu', array($this, 'add_plugin_admin_menu'));
        add_action('wp_ajax_test_netsuite_connection', array($this, 'test_netsuite_connection'));





        // Register admin scripts and styles
        add_action('admin_enqueue_scripts', array($this, 'enqueue_styles'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));

        // Add action links to plugins page
        add_filter('plugin_action_links_' . PRODUCT_ESTIMATOR_BASENAME, array($this, 'add_action_links'));

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
            __('Product Estimator Settings', 'product-estimator'),
            __('Product Estimator', 'product-estimator'),
            'manage_options',
            $this->plugin_name,
            array($this, 'display_plugin_admin_page'),
            'dashicons-calculator',
            25
        );

        add_submenu_page(
            $this->plugin_name,
            __('Settings', 'product-estimator'),
            __('Settings', 'product-estimator'),
            'manage_options',
            $this->plugin_name . '-settings',
            array($this, 'display_plugin_admin_settings')
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
            '<a href="' . admin_url('admin.php?page=' . $this->plugin_name) . '">' .
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

    /**
     * Render the settings page
     *
     * @since    1.0.0
     */
    public function display_plugin_admin_settings() {
        // Set up variables needed by the template
        $plugin_name = $this->plugin_name;
        $version = $this->version;

        // Fix the path to point to the correct location
        $template_path = plugin_dir_path(dirname(dirname(__FILE__))) .
            'includes/admin/partials/product-estimator-admin-settings.php';

        if (file_exists($template_path)) {
            require $template_path;
        } else {
            wp_die(__('Settings template file not found:', 'product-estimator') . ' ' . $template_path);
        }
    }

    /**
     * Initialize WooCommerce product integration
     *
     * @since    1.0.0
     */
    public function init_woocommerce_integration() {
        // Add estimator checkbox to simple products
        add_action('woocommerce_product_options_pricing', array($this, 'add_estimator_checkbox_to_simple_product'));
        add_action('woocommerce_process_product_meta', array($this, 'save_estimator_checkbox_for_simple_product'), 10, 1);

        // Add estimator checkbox to product variations
        add_action('woocommerce_product_after_variable_attributes', array($this, 'add_estimator_checkbox_to_variation'), 10, 3);
        add_action('woocommerce_save_product_variation', array($this, 'save_estimator_checkbox_for_variation'), 10, 2);
    }

    /**
     * Add estimator checkbox to simple products
     */
    public function add_estimator_checkbox_to_simple_product() {
        woocommerce_wp_checkbox(array(
            'id' => '_enable_product_estimator',
            'label' => __('Enable Product Estimator', 'product-estimator'),
            'description' => __('Allow this product to be added to the estimator', 'product-estimator')
        ));
    }

    /**
     * Save estimator checkbox for simple products
     *
     * @param int $post_id Product ID
     */
    public function save_estimator_checkbox_for_simple_product($post_id) {
        $enable_estimator = isset($_POST['_enable_product_estimator']) ? 'yes' : 'no';
        update_post_meta($post_id, '_enable_product_estimator', $enable_estimator);
    }

    /**
     * Add estimator checkbox to product variations
     *
     * @param int $loop Variation loop index
     * @param array $variation_data Variation data
     * @param WP_Post $variation Variation post object
     */
    public function add_estimator_checkbox_to_variation($loop, $variation_data, $variation) {
        woocommerce_wp_checkbox(array(
            'id' => "_enable_product_estimator_variation_{$loop}",
            'name' => "_enable_product_estimator_variation[{$loop}]",
            'label' => __('Enable Product Estimator', 'product-estimator'),
            'value' => get_post_meta($variation->ID, '_enable_product_estimator', true),
            'description' => __('Allow this variation to be added to the estimator', 'product-estimator')
        ));
    }

    /**
     * Save estimator checkbox for product variations
     *
     * @param int $variation_id Variation ID
     * @param int $loop Variation loop index
     */
    public function save_estimator_checkbox_for_variation($variation_id, $loop) {
        $enable_estimator = isset($_POST['_enable_product_estimator_variation'][$loop]) ? 'yes' : 'no';
        update_post_meta($variation_id, '_enable_product_estimator', $enable_estimator);
    }

    /**
     * Add custom columns to product list
     */
    public function add_estimator_column_to_product_list($columns) {
        $columns['product_estimator'] = __('Estimator', 'product-estimator');
        return $columns;
    }

    /**
     * Render custom column content
     *
     * @param string $column Column name
     * @param int $post_id Product ID
     */
    public function render_estimator_column_content($column, $post_id) {
        if ($column === 'product_estimator') {
            $product = wc_get_product($post_id);

            // Check if it's a variable product
            if ($product->is_type('variable')) {
                $variations_enabled = false;
                foreach ($product->get_children() as $variation_id) {
                    if (get_post_meta($variation_id, '_enable_product_estimator', true) === 'yes') {
                        $variations_enabled = true;
                        break;
                    }
                }

                echo $variations_enabled
                    ? '<span class="dashicons dashicons-yes" style="color:green;"></span>'
                    : '<span class="dashicons dashicons-no" style="color:red;"></span>';
            } else {
                // Simple product
                echo get_post_meta($post_id, '_enable_product_estimator', true) === 'yes'
                    ? '<span class="dashicons dashicons-yes" style="color:green;"></span>'
                    : '<span class="dashicons dashicons-no" style="color:red;"></span>';
            }
        }
    }

    /**
     * Add custom bulk actions for enabling/disabling estimator
     *
     * @param array $bulk_actions Existing bulk actions
     * @return array Modified bulk actions
     */
    public function add_estimator_bulk_actions($bulk_actions) {
        $bulk_actions['enable_product_estimator'] = __('Enable Product Estimator', 'product-estimator');
        $bulk_actions['disable_product_estimator'] = __('Disable Product Estimator', 'product-estimator');
        return $bulk_actions;
    }

    /**
     * Handle bulk actions for estimator
     *
     * @param string $redirect_to Redirect URL
     * @param string $action Bulk action name
     * @param array $post_ids Selected product IDs
     * @return string Modified redirect URL
     */
    public function handle_estimator_bulk_actions($redirect_to, $action, $post_ids) {
        $processed_ids = [];

        switch ($action) {
            case 'enable_product_estimator':
                foreach ($post_ids as $post_id) {
                    $product = wc_get_product($post_id);

                    if ($product->is_type('variable')) {
                        // Enable for all variations
                        foreach ($product->get_children() as $variation_id) {
                            update_post_meta($variation_id, '_enable_product_estimator', 'yes');
                        }
                    } else {
                        update_post_meta($post_id, '_enable_product_estimator', 'yes');
                    }

                    $processed_ids[] = $post_id;
                }
                break;

            case 'disable_product_estimator':
                foreach ($post_ids as $post_id) {
                    $product = wc_get_product($post_id);

                    if ($product->is_type('variable')) {
                        // Disable for all variations
                        foreach ($product->get_children() as $variation_id) {
                            update_post_meta($variation_id, '_enable_product_estimator', 'no');
                        }
                    } else {
                        update_post_meta($post_id, '_enable_product_estimator', 'no');
                    }

                    $processed_ids[] = $post_id;
                }
                break;
        }

        // Add notice for processed products
        if (!empty($processed_ids)) {
            $redirect_to = add_query_arg([
                'post_type' => 'product',
                'bulk_estimator_processed' => count($processed_ids)
            ], $redirect_to);
        }

        return $redirect_to;
    }

    /**
     * Display admin notice after bulk action
     */
    public function display_bulk_action_notice() {
        if (isset($_REQUEST['post_type']) &&
            $_REQUEST['post_type'] === 'product' &&
            isset($_REQUEST['bulk_estimator_processed'])
        ) {
            $count = intval($_REQUEST['bulk_estimator_processed']);
            printf(
                '<div class="notice notice-success is-dismissible"><p>%s</p></div>',
                sprintf(
                    __('%d products updated with Product Estimator settings.', 'product-estimator'),
                    $count
                )
            );
        }
    }

    /**
     * Test NetSuite API connection
     */
    public function test_netsuite_connection() {
        // Verify nonce
        check_ajax_referer('product_estimator_admin_nonce', 'nonce');

        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error([
                'message' => __('You do not have permission to test API connections.', 'product-estimator')
            ]);
            return;
        }

        try {
            // Initialize NetSuite Integration
            $netsuite_integration = new \RuDigital\ProductEstimator\Includes\Integration\NetsuiteIntegration();

            // Test authentication
            $auth_result = $netsuite_integration->test_connection();

            if (is_wp_error($auth_result)) {
                wp_send_json_error([
                    'message' => $auth_result->get_error_message()
                ]);
            } else {
                wp_send_json_success([
                    'message' => __('API connection successful!', 'product-estimator')
                ]);
            }
        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => sprintf(
                    __('Error: %s', 'product-estimator'),
                    $e->getMessage()
                )
            ]);
        }
    }
}
