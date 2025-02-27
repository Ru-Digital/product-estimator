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
     * The plugin name
     *
     * @var string
     */
    private $plugin_name;

    /**
     * The plugin version
     *
     * @var string
     */
    private $version;

    /**
     * Initialize shortcodes
     *
     * @param string $plugin_name The name of the plugin
     * @param string $version The plugin version
     */
    public function __construct($plugin_name = 'product-estimator', $version = '1.0.0') {
        $this->plugin_name = $plugin_name;
        $this->version = $version;

        // Register shortcodes
        add_shortcode('product_estimator', array($this, 'product_estimator_shortcode'));
        add_shortcode('estimator_button', array($this, 'product_estimator_button_shortcode'));

        // Enqueue scripts when shortcodes are used
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
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
                'text' => __('Estimate Product', 'product-estimator'),
                'class' => '',
            ),
            $atts,
            'estimator_button'
        );

        // Validate product ID
        $product_id = intval($atts['product_id']);

        // Build button HTML with product ID as data attribute
        $button_classes = 'product-estimator-button';
        if (!empty($atts['class'])) {
            $button_classes .= ' ' . esc_attr($atts['class']);
        }

        $button_html = sprintf(
            '<button type="button" class="%s" data-product-id="%d">%s</button>',
            esc_attr($button_classes),
            esc_attr($product_id),
            esc_html($atts['text'])
        );

        return $button_html;
    }

    /**
     * Enqueue necessary scripts
     */
    public function enqueue_scripts() {
        global $product_estimator_shortcode_used, $product_estimator_button_used;

        // Only enqueue if shortcodes are being used and we're not on a product page
        if ((isset($product_estimator_shortcode_used) || isset($product_estimator_button_used))
            && !is_product()) {

            // Enqueue core scripts
            wp_enqueue_script(
                'product-estimator-public',
                PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/js/product-estimator-public.js',
                array('jquery'),
                $this->version,
                true
            );

            // Localize script
            wp_localize_script(
                'product-estimator-public',
                'productEstimatorVars',
                array(
                    'ajax_url' => admin_url('admin-ajax.php'),
                    'nonce' => wp_create_nonce('product_estimator_nonce'),
                    'estimator_url' => home_url('/estimator/'),
                    'i18n' => array(
                        'error_loading_options' => __('Error loading options.', 'product-estimator'),
                        'error_calculation' => __('Error calculating estimate.', 'product-estimator'),
                        'error_adding' => __('Error adding product to estimator.', 'product-estimator'),
                    )
                )
            );

            // Add styles
            wp_enqueue_style(
                'product-estimator-public',
                PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/css/product-estimator-public.css',
                array(),
                $this->version
            );
        }
    }
}
