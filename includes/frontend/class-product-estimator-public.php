<?php
namespace RuDigital\ProductEstimator\Includes\Frontend;


/**
 * The public-facing functionality of the plugin.
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public
 */
class ProductEstimatorPublic {

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
    }

    /**
     * Register the stylesheets for the public-facing side of the site.
     *
     * @since    1.0.0
     */
    public function enqueue_styles() {
        wp_enqueue_style(
            $this->plugin_name,
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/css/product-estimator-public.css',
            array(),
            $this->version,
            'all'
        );
    }

    /**
     * Register the JavaScript for the public-facing side of the site.
     *
     * @since    1.0.0
     */
    public function enqueue_scripts() {
        wp_enqueue_script(
            $this->plugin_name,
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/js/product-estimator-public.js',
            array('jquery'),
            $this->version,
            true
        );

        // Localize the script
        wp_localize_script(
            $this->plugin_name,
            'productEstimatorPublic',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('product_estimator_public_nonce'),
                'currency' => $this->get_currency_symbol(),
                'decimal_points' => $this->get_decimal_points(),
                'i18n' => array(
                    'error_message' => __('An error occurred. Please try again.', 'product-estimator'),
                    'calculating' => __('Calculating...', 'product-estimator')
                )
            )
        );
    }
}
