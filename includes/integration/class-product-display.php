<?php

// File: includes/frontend/class-product-display.php

namespace RuDigital\ProductEstimator\Includes\Frontend;

/**
 * Product Display Integration
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/frontend
 */
class ProductDisplay {

    /**
     * Initialize the display integration
     */
    public function __construct() {
        // Add estimator button to product page
        add_action('woocommerce_after_add_to_cart_button', array($this, 'display_estimator_button'));

        // Handle AJAX requests
        add_action('wp_ajax_add_to_estimator', array($this, 'add_to_estimator'));
        add_action('wp_ajax_nopriv_add_to_estimator', array($this, 'add_to_estimator'));

        // Enqueue scripts
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }

    /**
     * Display the Add to Estimator button
     */
    public function display_estimator_button() {
        global $product;

        if (!$product) {
            return;
        }

        ?>
        <button type="button"
                class="single_add_to_estimator_button button alt"
                data-product-id="<?php echo esc_attr($product->get_id()); ?>">
            <?php esc_html_e('Add to Estimator', 'product-estimator'); ?>
        </button>
        <?php
    }

    /**
     * Enqueue necessary scripts
     */
    public function enqueue_scripts() {
        if (is_product()) {
            wp_enqueue_script(
                'product-estimator-integration',
                PRODUCT_ESTIMATOR_PLUGIN_URL . 'assets/js/estimator-integration.js',
                array('jquery'),
                PRODUCT_ESTIMATOR_VERSION,
                true
            );

            wp_localize_script(
                'product-estimator-integration',
                'productEstimatorVars',
                array(
                    'ajax_url' => admin_url('admin-ajax.php'),
                    'nonce' => wp_create_nonce('product_estimator_nonce'),
                    'i18n' => array(
                        'addSuccess' => __('Product added to estimator!', 'product-estimator'),
                        'addError' => __('Error adding product to estimator.', 'product-estimator')
                    )
                )
            );

            // Add custom styles
            wp_add_inline_style(
                'product-estimator-public',
                '
                .single_add_to_estimator_button {
                    margin-left: 10px;
                    background-color: #2271b1;
                    color: #ffffff;
                }
                .single_add_to_estimator_button:hover {
                    background-color: #135e96;
                }
                '
            );
        }
    }

    /**
     * Handle adding product to estimator
     */
    public function add_to_estimator() {
        check_ajax_referer('product_estimator_nonce', 'nonce');

        $product_id = isset($_POST['product_id']) ? absint($_POST['product_id']) : 0;

        if (!$product_id) {
            wp_send_json_error(array(
                'message' => __('Invalid product ID', 'product-estimator')
            ));
        }

        try {
            // Add your logic here to handle adding the product to the estimator
            // This could involve storing in a session, database, etc.

            wp_send_json_success(array(
                'message' => __('Product added to estimator', 'product-estimator')
            ));

        } catch (\Exception $e) {
            wp_send_json_error(array(
                'message' => $e->getMessage()
            ));
        }
    }
}
