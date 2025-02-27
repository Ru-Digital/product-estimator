<?php
namespace RuDigital\ProductEstimator\Includes\Integration;

/**
 * WooCommerce Integration Class
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/integration
 */
class WoocommerceIntegration {

    /**
     * Initialize the integration
     */
    public function __construct() {
        // Add fields to simple products
        add_action('woocommerce_product_options_pricing', array($this, 'add_product_fields'));
        add_action('woocommerce_process_product_meta', array($this, 'save_product_fields'));

        // Add fields to variations
        add_action('woocommerce_variation_options_pricing', array($this, 'add_variation_fields'), 10, 3);
        add_action('woocommerce_save_product_variation', array($this, 'save_variation_fields'), 10, 2);
    }

    /**
     * Add custom fields to simple products
     */
    public function add_product_fields() {
        global $post;

        echo '<div class="options_group">';

        woocommerce_wp_checkbox(array(
            'id' => '_enable_estimator',
            'label' => __('Enable Product Estimator', 'product-estimator'),
            'description' => __('Enable product estimation tool for this product', 'product-estimator'),
            'desc_tip' => true,
            'value' => get_post_meta($post->ID, '_enable_estimator', true)
        ));

        echo '</div>';
    }

    /**
     * Save custom fields for simple products
     */
    public function save_product_fields($post_id) {
        $enable_estimator = isset($_POST['_enable_estimator']) ? 'yes' : 'no';
        update_post_meta($post_id, '_enable_estimator', $enable_estimator);
    }

    /**
     * Add custom fields to variations
     */
    public function add_variation_fields($loop, $variation_data, $variation) {
        woocommerce_wp_checkbox(array(
            'id' => '_enable_estimator_' . $variation->ID,
            'name' => '_enable_estimator[' . $loop . ']',
            'label' => __('Enable Product Estimator', 'product-estimator'),
            'description' => __('Enable product estimation tool for this variation', 'product-estimator'),
            'desc_tip' => true,
            'value' => get_post_meta($variation->ID, '_enable_estimator', true),
            'wrapper_class' => 'form-row form-row-full'
        ));
    }

    /**
     * Save custom fields for variations
     */
    public function save_variation_fields($variation_id, $loop) {
        $enable_estimator = isset($_POST['_enable_estimator'][$loop]) ? 'yes' : 'no';
        update_post_meta($variation_id, '_enable_estimator', $enable_estimator);
    }

    /**
     * Check if estimator is enabled for a product/variation
     */
    public static function is_estimator_enabled($product_id) {
        return get_post_meta($product_id, '_enable_estimator', true) === 'yes';
    }
}
