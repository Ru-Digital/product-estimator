<?php
namespace RuDigital\ProductEstimator\Includes\Frontend;

/**
 * Handles all script and style enqueuing for the Product Estimator plugin
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/frontend
 */
class ScriptHandler {

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
     * Initialize the class and set its properties.
     *
     * @since    1.0.0
     * @param    string    $plugin_name    The name of the plugin.
     * @param    string    $version        The version of this plugin.
     */
    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;

        // Register actions - with higher priority to ensure styles/scripts are registered early
        add_action('wp_enqueue_scripts', array($this, 'enqueue_styles'), 5);
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'), 5);

        // Add WooCommerce-specific hooks
        add_action('wp_footer', array($this, 'add_variation_data_to_footer'), 20);
    }

    /**
     * Register the stylesheets for the public-facing side of the site.
     *
     * @since    1.0.0
     */
    public function enqueue_styles() {
        // Always register and enqueue styles on all pages
        wp_register_style(
            $this->plugin_name . '-public',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/css/product-estimator-public.css',
            array(),
            $this->version,
            'all'
        );

        wp_register_style(
            $this->plugin_name . '-modal',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/css/product-estimator-modal.css',
            array(),
            $this->version,
            'all'
        );

        // Always load styles on all pages
        wp_enqueue_style($this->plugin_name . '-public');
        wp_enqueue_style($this->plugin_name . '-modal');
    }

    /**
     * Register and enqueue all scripts for Product Estimator
     *
     * @since    1.0.0
     */
    public function enqueue_scripts() {
        // Always register scripts - this doesn't affect performance as they're only loaded when needed
        wp_register_script(
            $this->plugin_name . '-public',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/js/product-estimator-public.js',
            array('jquery'),
            $this->version,
            true
        );

        wp_register_script(
            $this->plugin_name . '-modal',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/js/product-estimator-modal.js',
            array('jquery'),
            $this->version,
            true
        );

        // Register variation-related scripts
        wp_register_script(
            $this->plugin_name . '-variation-handler',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'assets/js/product-variation-handler.js',
            array('jquery'),
            $this->version,
            true
        );

        wp_register_script(
            $this->plugin_name . '-variation-integration',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'assets/js/variation-integration.js',
            array('jquery'),
            $this->version,
            true
        );

        wp_register_script(
            $this->plugin_name . '-modal-variation',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'assets/js/modal-variation-integration.js',
            array('jquery', $this->plugin_name . '-modal'),
            $this->version,
            true
        );

        // Register integration loader
        wp_register_script(
            $this->plugin_name . '-integration',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'assets/js/product-estimator-integration.js',
            array('jquery', $this->plugin_name . '-public', $this->plugin_name . '-modal'),
            $this->version,
            true
        );

        // Localize script with all necessary data
        wp_localize_script(
            $this->plugin_name . '-public',
            'productEstimatorVars',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('product_estimator_nonce'),
                'plugin_url' => PRODUCT_ESTIMATOR_PLUGIN_URL,
                'estimator_url' => home_url('/estimator/'),
                'i18n' => array(
                    'loading' => __('Loading...', 'product-estimator'),
                    'error' => __('Error loading content. Please try again.', 'product-estimator'),
                    'adding' => __('Adding product...', 'product-estimator'),
                    'addError' => __('Error adding product. Please try again.', 'product-estimator'),
                    'close' => __('Close', 'product-estimator'),
                    'cancel' => __('Cancel', 'product-estimator'),
                    'confirm' => __('Confirm', 'product-estimator'),
                    'select_estimate' => __('-- Select an Estimate --', 'product-estimator')
                )
            )
        );

        // Always enqueue core scripts and modal scripts on all pages
        wp_enqueue_script($this->plugin_name . '-public');
        wp_enqueue_script($this->plugin_name . '-modal');

        // If on variable product page, load variation scripts
        if (is_product() && function_exists('wc_get_product') && wc_get_product() && wc_get_product()->is_type('variable')) {
            wp_enqueue_script($this->plugin_name . '-variation-handler');
            wp_enqueue_script($this->plugin_name . '-variation-integration');
            wp_enqueue_script($this->plugin_name . '-modal-variation');
        }

        // Always load integration script
        wp_enqueue_script($this->plugin_name . '-integration');

        // Set a flag to avoid duplicate enqueuing
        do_action('product_estimator_scripts_enqueued');
    }

    /**
     * Add variation data to the footer for JS use
     *
     * This adds the 'enable_estimator' property to WooCommerce variation data
     * which allows the JS to properly handle visibility for each variation
     *
     * @since    1.0.0
     */
    public function add_variation_data_to_footer() {
        // Only on single product pages
        if (!is_product()) {
            return;
        }

        global $product;

        // Only for variable products
        if (!$product || !$product->is_type('variable')) {
            return;
        }

        // Get available variations
        $available_variations = $product->get_available_variations();
        $variation_data = [];

        // Prepare variation data for JS
        foreach ($available_variations as $variation) {
            $variation_id = $variation['variation_id'];
            $enable_estimator = get_post_meta($variation_id, '_enable_estimator', true);

            $variation_data[$variation_id] = [
                'enable_estimator' => $enable_estimator
            ];
        }

        // Add inline script with variation data
        if (!empty($variation_data)) {
            echo '<script type="text/javascript">
                var product_estimator_variations = ' . wp_json_encode($variation_data) . ';

                // Enhance the variation found event
                jQuery(document).ready(function($) {
                    $("form.variations_form").on("found_variation", function(event, variation) {
                        if (variation && variation.variation_id && product_estimator_variations[variation.variation_id]) {
                            // Add estimator data to the variation object
                            variation.enable_estimator = product_estimator_variations[variation.variation_id].enable_estimator;
                        }
                    });
                });
            </script>';
        }
    }
}
