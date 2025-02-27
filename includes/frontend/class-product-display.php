<?php
namespace RuDigital\ProductEstimator\Includes\Frontend;

use RuDigital\ProductEstimator\Includes\Integration\WoocommerceIntegration;

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

        // Add AJAX handler for loading the form
        add_action('wp_ajax_load_product_estimator_form', array($this, 'load_product_estimator_form'));
        add_action('wp_ajax_nopriv_load_product_estimator_form', array($this, 'load_product_estimator_form'));

        // Add modal HTML to footer on product pages
        add_action('wp_footer', array($this, 'add_estimator_modal'));

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

        // Only show button if estimator is enabled for this product
        if (!WoocommerceIntegration::is_estimator_enabled($product->get_id())) {
            return;
        }

        ?>
        <button type="button"
                class="single_add_to_estimator_button button alt open-estimator-modal"
                data-product-id="<?php echo esc_attr($product->get_id()); ?>">
            <?php esc_html_e('Add to Estimator', 'product-estimator'); ?>
        </button>
        <?php
    }

    /**
     * Add modal HTML to footer
     */
    public function add_estimator_modal() {
        // Only add modal on product pages
        if (!is_product()) {
            return;
        }

        ?>
        <div id="product-estimator-modal" class="product-estimator-modal">
            <div class="product-estimator-modal-overlay"></div>
            <div class="product-estimator-modal-container">
                <button class="product-estimator-modal-close" aria-label="<?php esc_attr_e('Close', 'product-estimator'); ?>">
                    <span aria-hidden="true">&times;</span>
                </button>
                <div class="product-estimator-modal-header">
                    <h2><?php esc_html_e('Product Estimator', 'product-estimator'); ?></h2>
                </div>
                <div class="product-estimator-modal-form-container">
                    <!-- Form will be loaded here via AJAX -->
                </div>
                <div class="product-estimator-modal-loading" style="display: none;">
                    <div class="loading-spinner"></div>
                    <div class="loading-text"><?php esc_html_e('Loading...', 'product-estimator'); ?></div>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Load estimator form via AJAX
     */
    public function load_product_estimator_form() {
        check_ajax_referer('product_estimator_nonce', 'nonce');

        $product_id = isset($_POST['product_id']) ? absint($_POST['product_id']) : 0;

        if (!$product_id) {
            wp_send_json_error(array(
                'message' => __('Invalid product ID', 'product-estimator')
            ));
        }

        try {
            $product = wc_get_product($product_id);

            if (!$product) {
                throw new \Exception(__('Product not found', 'product-estimator'));
            }

            // Start output buffer to capture form HTML
            ob_start();

            // Include form template
            include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-form.php';

            // Get form HTML
            $form_html = ob_get_clean();

            wp_send_json_success(array(
                'html' => $form_html
            ));

        } catch (\Exception $e) {
            wp_send_json_error(array(
                'message' => $e->getMessage()
            ));
        }
    }

    /**
     * Enqueue necessary scripts
     */
    public function enqueue_scripts() {
        if (did_action('product_estimator_scripts_enqueued')) {
            return;
        }
        if (is_product()) {
            // Enqueue core estimator scripts
            wp_enqueue_script(
                'product-estimator-public',
                PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/js/product-estimator-public.js',
                array('jquery'),
                PRODUCT_ESTIMATOR_VERSION,
                true
            );

            // Localize core scripts
            wp_localize_script(
                'product-estimator-public',
                'productEstimatorPublic',
                array(
                    'ajax_url' => admin_url('admin-ajax.php'),
                    'nonce' => wp_create_nonce('product_estimator_nonce'),
                    'currency' => get_woocommerce_currency_symbol(),
                    'decimal_points' => wc_get_price_decimals(),
                    'enableTooltips' => true,
                    'i18n' => array(
                        'error_loading_options' => __('Error loading options.', 'product-estimator'),
                        'error_calculation' => __('Error calculating estimate.', 'product-estimator'),
                        'select_product' => __('Please select a product.', 'product-estimator'),
                        'invalid_quantity' => __('Please enter a valid quantity between %min% and %max%.', 'product-estimator')
                    )
                )
            );

            // Enqueue modal script
            wp_enqueue_script(
                'product-estimator-modal',
                PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/js/product-estimator-modal.js',
                array('jquery', 'product-estimator-public'),
                PRODUCT_ESTIMATOR_VERSION,
                true
            );

            // Add modal styles
            wp_enqueue_style(
                'product-estimator-modal',
                PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/css/product-estimator-modal.css',
                array(),
                PRODUCT_ESTIMATOR_VERSION
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
            // Get product data
            $product = wc_get_product($product_id);

            if (!$product) {
                throw new \Exception(__('Product not found', 'product-estimator'));
            }

            // Store in session for later use
            if (!isset($_SESSION)) {
                session_start();
            }

            if (!isset($_SESSION['product_estimator'])) {
                $_SESSION['product_estimator'] = array();
            }

            $_SESSION['product_estimator']['product_id'] = $product_id;
            $_SESSION['product_estimator']['timestamp'] = time();

            wp_send_json_success(array(
                'message' => __('Product added to estimator', 'product-estimator'),
                'product_id' => $product_id,
                'product_name' => $product->get_name()
            ));

        } catch (\Exception $e) {
            wp_send_json_error(array(
                'message' => $e->getMessage()
            ));
        }
    }
}
