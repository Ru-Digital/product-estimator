<?php
namespace RuDigital\ProductEstimator\Includes\Frontend;

/**
 * Handles script and style enqueuing for the frontend of the Product Estimator plugin
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

        // Register frontend actions only
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
        wp_enqueue_style('dashicons');

        // Register and enqueue our bundled frontend styles instead of individual files
        wp_register_style(
            $this->plugin_name . '-styles-bundled',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/css/product-estimator-frontend-bundled.css',
            array(),
            $this->version,
            'all'
        );
        
        // Enqueue the bundled styles
        wp_enqueue_style($this->plugin_name . '-styles-bundled');
    }

    /**
     * Register and enqueue all scripts for Product Estimator
     *
     * @since    1.0.0
     */
    public function enqueue_scripts() {
        // Enqueue main frontend bundle
        wp_register_script(
            $this->plugin_name,
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/js/product-estimator.bundle.js',
            array('jquery'),
            $this->version,
            true
        );

        // Enqueue common bundle if it exists
        if (file_exists(PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/js/common.bundle.js')) {
            wp_register_script(
                $this->plugin_name . '-common',
                PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/js/common.bundle.js',
                array('jquery'),
                $this->version,
                true
            );
            wp_enqueue_script($this->plugin_name . '-common');
        }

        // Create a fresh nonce for AJAX requests - ensure this name matches what's used in AjaxHandler.php
        $nonce = wp_create_nonce('product_estimator_nonce');

        // Get feature switches
        $raw_feature_switches = get_option('product_estimator_feature_switches', []); // This will be [ "suggested_products_enabled" => 1 ]
        $processed_feature_switches = [];

        if (is_array($raw_feature_switches)) {
            foreach ($raw_feature_switches as $key => $value) {
                // For "suggested_products_enabled", $key is "suggested_products_enabled" and $value is 1
                if ($value === '1' || $value === 1 || $value === true) { // 1 === 1 is true
                    $processed_feature_switches[$key] = true; // So, $processed_feature_switches["suggested_products_enabled"] becomes true
                } elseif ($value === '0' || $value === 0 || $value === false) {
                    $processed_feature_switches[$key] = false;
                } else {
                    $processed_feature_switches[$key] = $value;
                }
            }
        }


        // Localize the script with your data
        wp_localize_script(
            $this->plugin_name,
            'productEstimatorVars',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => $nonce,
                'is_admin' => current_user_can('manage_options'),
                'plugin_url' => PRODUCT_ESTIMATOR_PLUGIN_URL,
                'estimator_url' => home_url('/estimator/'),
                'debug' => defined('WP_DEBUG') && WP_DEBUG, // Pass debug mode to JS,
                'featureSwitches' => $processed_feature_switches // <-- Add this line
            )
        );
        
        // Also send settings to match the format expected by labels.js
        wp_localize_script(
            $this->plugin_name,
            'productEstimatorSettings',
            array(
                'labelAnalyticsEnabled' => isset($processed_feature_switches['label_analytics_enabled']) ? 
                    $processed_feature_switches['label_analytics_enabled'] : true, // Default to enabled for now
                'i18n' => array(
                    'loading' => __('Loading...', 'product-estimator'),
                    'error' => __('Error loading content. Please try again.', 'product-estimator'),
                    'adding' => __('Adding product...', 'product-estimator'),
                    'addError' => __('Error adding product. Please try again.', 'product-estimator'),
                    'close' => __('Close', 'product-estimator'),
                    'cancel' => __('Cancel', 'product-estimator'),
                    'confirm' => __('Confirm', 'product-estimator'),
                    'delete' => __('Delete', 'product-estimator'),
                    'remove' => __('Remove', 'product-estimator'),
                    'select_estimate' => __('-- Select an Estimate --', 'product-estimator'),
                    'expand_accordion' => __('Expand', 'product-estimator'),
                    'collapse_accordion' => __('Collapse', 'product-estimator'),
                    'delete_customer_details' => __('Delete Customer Details', 'product-estimator'),
                    'confirm_delete_details' => __('Are you sure you want to delete your saved details?', 'product-estimator'),
                    'saving' => __('Saving...', 'product-estimator'),
                    'details_updated' => __('Details updated successfully!', 'product-estimator'),
                    'details_deleted' => __('Details deleted successfully!', 'product-estimator'),
                    'showDetails' => __('Show additional details', 'product-estimator'),
                    'hideDetails' => __('Hide additional details', 'product-estimator'),
                    'showNotes' => __('Product Notes', 'product-estimator'),
                    'hideNotes' => __('Product Notes', 'product-estimator'),
                    'loadingDetails' => __('Loading details', 'product-estimator'),
                    // Dialog translations
                    'dialog_titles' => array(
                        'product' => __('Remove Product', 'product-estimator'),
                        'room' => __('Delete Room', 'product-estimator'),
                        'estimate' => __('Delete Estimate', 'product-estimator'),
                        'replace' => __('Confirm Replacement', 'product-estimator'),
                    ),
                    'dialog_messages' => array(
                        'product' => __('Are you sure you want to remove this product from the room?', 'product-estimator'),
                        'room' => __('Are you sure you want to delete this room and all its products?', 'product-estimator'),
                        'estimate' => __('Are you sure you want to delete this estimate and all its rooms?', 'product-estimator'),
                        'replace' => __('Are you sure you want to replace "%old%" with "%new%"?', 'product-estimator'),
                    ),
                )
            )
        );

        // Enqueue the main script
        wp_enqueue_script($this->plugin_name);

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
