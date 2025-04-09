<?php
/**
 * The product field functionality of the plugin.
 *
 * @link       https://rudigital.com.au
 * @since      1.0.3
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/admin
 */

namespace RuDigital\ProductEstimator\Includes\Admin;

use RuDigital\ProductEstimator\Includes\Loader;

/**
 * The product field functionality of the plugin.
 *
 * Adds the "Enable Estimator" checkbox to products and variations.
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/admin
 * @author     RU Digital <support@rudigital.com.au>
 */
class ProductEstimatorField {

    /**
     * The ID of this plugin.
     *
     * @since    1.0.3
     * @access   private
     * @var      string    $plugin_name    The ID of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     *
     * @since    1.0.3
     * @access   private
     * @var      string    $version    The current version of this plugin.
     */
    private $version;

    /**
     * The loader that's responsible for maintaining and registering all hooks.
     *
     * @since    1.0.3
     * @access   protected
     * @var      Loader    $loader    Maintains and registers all hooks for the plugin.
     */
    protected $loader;

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.0.3
     * @param    string    $plugin_name       The name of this plugin.
     * @param    string    $version           The version of this plugin.
     * @param    Loader    $loader            The loader object.
     */
    public function __construct($plugin_name, $version, $loader) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
        $this->loader = $loader;

        $this->define_hooks();
    }

    /**
     * Register the hooks related to the product field functionality.
     *
     * @since    1.0.3
     * @access   private
     */
    private function define_hooks() {
        // Add checkbox to product general tab
        $this->loader->add_action('woocommerce_product_options_general_product_data', $this, 'add_estimator_checkbox_field');

        // Save product data
        $this->loader->add_action('woocommerce_process_product_meta', $this, 'save_estimator_field');

        // Add to variations
        $this->loader->add_action('woocommerce_product_after_variable_attributes', $this, 'add_estimator_checkbox_to_variations', 10, 3);

        // Save variation data
        $this->loader->add_action('woocommerce_save_product_variation', $this, 'save_variation_estimator_field', 10, 2);
    }

    /**
     * Add estimator checkbox to product general tab
     *
     * @since    1.0.3
     * @access   public
     */
    public function add_estimator_checkbox_field() {
        global $post;

        woocommerce_wp_checkbox(array(
            'id'          => '_enable_estimator',
            'label'       => __('Enable Estimator', 'product-estimator'),
            'description' => __('Enable this product for use with the Product Estimator.', 'product-estimator'),
            'desc_tip'    => true,
            'value'       => get_post_meta($post->ID, '_enable_estimator', true),
        ));
    }

    /**
     * Save the estimator field value
     *
     * @since    1.0.3
     * @access   public
     * @param    int    $post_id    The post ID.
     */
    public function save_estimator_field($post_id) {
        $enable_estimator = isset($_POST['_enable_estimator']) ? 'yes' : 'no';
        update_post_meta($post_id, '_enable_estimator', $enable_estimator);
    }

    /**
     * Add estimator checkbox to variations
     *
     * @since    1.0.3
     * @access   public
     * @param    int      $loop           Position in the loop.
     * @param    array    $variation_data Variation data.
     * @param    WP_Post  $variation      Post data.
     */
    public function add_estimator_checkbox_to_variations($loop, $variation_data, $variation) {
        woocommerce_wp_checkbox(array(
            'id'          => '_enable_estimator_' . $variation->ID,
            'name'        => '_enable_estimator[' . $variation->ID . ']',
            'label'       => __('Enable Estimator', 'product-estimator'),
            'description' => __('Enable this variation for use with the Product Estimator.', 'product-estimator'),
            'desc_tip'    => true,
            'value'       => get_post_meta($variation->ID, '_enable_estimator', true),
            'wrapper_class' => 'form-row form-row-full',
        ));
    }

    /**
     * Save variation estimator field
     *
     * @since    1.0.3
     * @access   public
     * @param    int    $variation_id    Variation ID.
     * @param    int    $i               Position in the loop.
     */
    public function save_variation_estimator_field($variation_id, $i) {
        $enable_estimator = isset($_POST['_enable_estimator'][$variation_id]) ? 'yes' : 'no';
        update_post_meta($variation_id, '_enable_estimator', $enable_estimator);
    }

    /**
     * Check if a product has estimator enabled
     *
     * @since    1.0.3
     * @access   public
     * @param    int    $product_id    Product ID.
     * @return   bool   Whether estimator is enabled for the product.
     */
    public static function is_estimator_enabled($product_id) {
        return get_post_meta($product_id, '_enable_estimator', true) === 'yes';
    }
}
