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

        // Register actions
        add_action('wp_enqueue_scripts', array($this, 'enqueue_styles'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));

        // Add WooCommerce-specific hooks
        add_action('wp_footer', array($this, 'add_variation_data_to_footer'), 20);
    }

    /**
     * Register the stylesheets for the public-facing side of the site.
     *
     * @since    1.0.0
     */
    public function enqueue_styles() {
        // Only enqueue on relevant pages
        if (!is_product() && !is_singular() && !$this->is_shortcode_present()) {
            return;
        }

        // Register main styles
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

        // Enqueue the main public styles
        wp_enqueue_style($this->plugin_name . '-public');

        // Enqueue modal styles if we have estimator buttons or containers
        if ($this->has_estimator_buttons() || $this->has_estimator_containers()) {
            wp_enqueue_style($this->plugin_name . '-modal');
        }
    }

    /**
     * Register and enqueue all scripts for Product Estimator
     *
     * @since    1.0.0
     */
    public function enqueue_scripts() {
        // Only enqueue on relevant pages
        if (!is_product() && !is_singular() && !$this->is_shortcode_present()) {
            return;
        }

        // Get the current product if we're on a product page
        $product = is_product() ? wc_get_product() : null;
        $is_variable = $product && $product->is_type('variable');

        // Register core scripts
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

        // Register integration loader (should load last)
        wp_register_script(
            $this->plugin_name . '-integration',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'assets/js/product-estimator-integration.js',
            array('jquery', $this->plugin_name . '-public', $this->plugin_name . '-modal'),
            $this->version,
            true
        );

        // Localize scripts with shared data
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

        // Enqueue the core public script (always needed)
        wp_enqueue_script($this->plugin_name . '-public');

        // Enqueue modal script if we have estimator buttons or containers
        if ($this->has_estimator_buttons() || $this->has_estimator_containers()) {
            wp_enqueue_script($this->plugin_name . '-modal');
        }

        // Enqueue variation scripts if on variable product page
        if ($is_variable) {
            wp_enqueue_script($this->plugin_name . '-variation-handler');
            wp_enqueue_script($this->plugin_name . '-variation-integration');

            // Modal variation integration if modal is also used
            if ($this->has_estimator_buttons()) {
                wp_enqueue_script($this->plugin_name . '-modal-variation');
            }
        }

        // Always enqueue the integration loader last
        wp_enqueue_script($this->plugin_name . '-integration');
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

    /**
     * Check if page has estimator buttons
     *
     * @since    1.0.0
     * @return   boolean  True if page has estimator buttons
     */
    private function has_estimator_buttons() {
        global $post;

        // Always true on product pages
        if (is_product()) {
            return true;
        }

        // Check if shortcode is used
        if (is_singular() && $post && has_shortcode($post->post_content, 'estimator_button')) {
            return true;
        }

        return false;
    }

    /**
     * Check if page has estimator containers
     *
     * @since    1.0.0
     * @return   boolean  True if page has estimator containers
     */
    private function has_estimator_containers() {
        global $post;

        // Check if the estimator shortcode is used
        if (is_singular() && $post && has_shortcode($post->post_content, 'product_estimator')) {
            return true;
        }

        return false;
    }

    /**
     * Check if plugin shortcode is present on current page
     *
     * @since    1.0.0
     * @return   boolean  Whether shortcode is present
     */
    private function is_shortcode_present() {
        global $post;

        if (!is_singular() || !is_a($post, 'WP_Post')) {
            return false;
        }

        return (
            has_shortcode($post->post_content, 'product_estimator') ||
            has_shortcode($post->post_content, 'estimator_button')
        );
    }
}
