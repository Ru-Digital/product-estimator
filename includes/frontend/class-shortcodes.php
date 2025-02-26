<?php
namespace RuDigital\ProductEstimator\Includes\Frontend;

/**
 * Handle Plugin Shortcodes
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/frontend
 */
class Shortcodes {

    /**
     * Initialize shortcodes
     */
    public function __construct() {
        // Register shortcodes
        add_shortcode('product_estimator', array($this, 'product_estimator_shortcode'));
        add_shortcode('product_estimator_button', array($this, 'product_estimator_button_shortcode'));

        // Enqueue scripts when shortcodes are used
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));

        // Add modal HTML to footer
        add_action('wp_footer', array($this, 'add_estimator_modal'));
    }

    /**
     * Register main estimator shortcode
     *
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function product_estimator_shortcode($atts) {
        // Flag that we're using the shortcode
        global $product_estimator_shortcode_used;
        $product_estimator_shortcode_used = true;

        // Parse attributes
        $atts = shortcode_atts(
            array(
                'title' => __('Product Estimator', 'product-estimator'),
                'description' => '',
                'button_text' => __('Calculate', 'product-estimator'),
                'product_id' => 0
            ),
            $atts,
            'product_estimator'
        );

        // Start output buffering
        ob_start();

        // Include the template
        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-display.php';

        // Return the buffered content
        return ob_get_clean();
    }

    /**
     * Register button shortcode
     *
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function product_estimator_button_shortcode($atts) {
        // Flag that we're using the button shortcode
        global $product_estimator_button_used;
        $product_estimator_button_used = true;

        // Parse attributes
        $atts = shortcode_atts(
            array(
                'product_id' => 0,
                'button_text' => __('Estimate Product', 'product-estimator'),
                'class' => '',
            ),
            $atts,
            'product_estimator_button'
        );

        // Validate product ID
        $product_id = intval($atts['product_id']);
        if ($product_id <= 0) {
            return '<p class="estimator-error">' . __('Error: Invalid product ID', 'product-estimator') . '</p>';
        }

        // Build button HTML with product ID as data attribute
        $button_classes = 'product-estimator-button';
        if (!empty($atts['class'])) {
            $button_classes .= ' ' . esc_attr($atts['class']);
        }

        $button_html = sprintf(
            '<button type="button" class="%s" data-product-id="%d">%s</button>',
            esc_attr($button_classes),
            esc_attr($product_id),
            esc_html($atts['button_text'])
        );

        return $button_html;
    }

    /**
     * Add modal to footer when button shortcode is used
     */
    public function add_estimator_modal() {
        global $product_estimator_button_used;

        // Only add modal if button shortcode was used
        if (!isset($product_estimator_button_used) || !$product_estimator_button_used) {
            return;
        }

        // Don't add if we're on a product page where it's already added
        if (function_exists('is_product') && is_product()) {
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
     * Enqueue necessary scripts
     */
    public function enqueue_scripts() {
        global $product_estimator_shortcode_used, $product_estimator_button_used;

        // Only enqueue if shortcodes are being used
        if (!isset($product_estimator_shortcode_used) && !isset($product_estimator_button_used)) {
            return;
        }

        // Don't duplicate scripts on product pages
        if (function_exists('is_product') && is_product()) {
            return;
        }

        // Main public script
        wp_enqueue_script(
            'product-estimator-public',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/js/product-estimator-public.js',
            array('jquery'),
            PRODUCT_ESTIMATOR_VERSION,
            true
        );

        // Localize script
        wp_localize_script(
            'product-estimator-public',
            'productEstimatorPublic',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('product_estimator_nonce'),
                'currency' => function_exists('get_woocommerce_currency_symbol') ? get_woocommerce_currency_symbol() : '$',
                'decimal_points' => function_exists('wc_get_price_decimals') ? wc_get_price_decimals() : 2,
                'plugin_url' => PRODUCT_ESTIMATOR_PLUGIN_URL,
                'enableTooltips' => true,
                'i18n' => array(
                    'error_loading_options' => __('Error loading options.', 'product-estimator'),
                    'error_calculation' => __('Error calculating estimate.', 'product-estimator'),
                    'error_adding' => __('Error adding product to estimator.', 'product-estimator'),
                    'select_product' => __('Please select a product.', 'product-estimator'),
                    'invalid_quantity' => __('Please enter a valid quantity between %min% and %max%.', 'product-estimator')
                )
            )
        );

        // Add styles
        wp_enqueue_style(
            'product-estimator-public',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/css/product-estimator-public.css',
            array(),
            PRODUCT_ESTIMATOR_VERSION
        );

        // If button shortcode is used, add modal script and styles
        if (isset($product_estimator_button_used) && $product_estimator_button_used) {
            wp_enqueue_script(
                'product-estimator-modal',
                PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/js/product-estimator-modal.js',
                array('jquery', 'product-estimator-public'),
                PRODUCT_ESTIMATOR_VERSION,
                true
            );

            wp_enqueue_style(
                'product-estimator-modal',
                PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/css/product-estimator-modal.css',
                array(),
                PRODUCT_ESTIMATOR_VERSION
            );
        }
    }
}
