<?php
namespace RuDigital\ProductEstimator\Includes\Frontend;

/**
 * Modal Implementation for Product Estimator
 *
 * This file adds a global modal that can be triggered from any page
 * with an "Add to estimator" button.
 *
 * @since      1.0.4
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/frontend
 */
class ProductEstimatorModal {

    /**
     * The ID of this plugin.
     *
     * @since    1.0.4
     * @access   private
     * @var      string    $plugin_name    The ID of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     *
     * @since    1.0.4
     * @access   private
     * @var      string    $version    The current version of this plugin.
     */
    private $version;

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.0.4
     * @param    string    $plugin_name    The name of the plugin.
     * @param    string    $version        The version of this plugin.
     */
    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;

        // Add the modal to the footer
        add_action('wp_footer', array($this, 'render_modal'));

        // Add shortcode for the trigger button
        add_shortcode('estimator_button', array($this, 'render_button'));

        // Enqueue scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));

        // Register AJAX handlers
        add_action('wp_ajax_get_estimator_form', array($this, 'get_estimator_form'));
        add_action('wp_ajax_nopriv_get_estimator_form', array($this, 'get_estimator_form'));
    }

    /**
     * Enqueue scripts and styles for the modal
     *
     * @since    1.0.4
     */
    public function enqueue_assets() {
        // Only enqueue if we're on a product page or the shortcode is used
        if (is_product() || $this->is_shortcode_used()) {
            // Enqueue modal styles
            wp_enqueue_style(
                $this->plugin_name . '-modal',
                PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/css/product-estimator-modal.css',
                array(),
                $this->version
            );

            // Enqueue modal scripts
            wp_enqueue_script(
                $this->plugin_name . '-modal',
                PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/js/product-estimator-modal.js',
                array('jquery'),
                $this->version,
                true
            );

            // Localize the script
            wp_localize_script(
                $this->plugin_name . '-modal',
                'productEstimatorVars',
                array(
                    'ajax_url' => admin_url('admin-ajax.php'),
                    'nonce' => wp_create_nonce('product_estimator_nonce'),
                    'estimator_url' => esc_url(home_url('/estimator/')),
                    'i18n' => array(
                        'loading' => __('Loading estimator...', 'product-estimator'),
                        'error' => __('Error loading estimator. Please try again.', 'product-estimator'),
                        'close' => __('Close', 'product-estimator')
                    )
                )
            );
        }
    }

    /**
     * Check if the estimator shortcode is used on the current page
     *
     * @since    1.0.4
     * @return   boolean  True if shortcode is used
     */
    private function is_shortcode_used() {
        global $post;

        if (!is_singular() || !$post) {
            return false;
        }

        return (
            has_shortcode($post->post_content, 'estimator_button') ||
            has_shortcode($post->post_content, 'product_estimator')
        );
    }

    /**
     * Render the modal HTML in the footer
     *
     * @since    1.0.4
     */
    public function render_modal() {
        // Only render modal if we're on a product page or the shortcode is used
        if (is_product() || $this->is_shortcode_used()) {
            include_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-modal.php';
        }
    }

    /**
     * Render the "Add to estimator" button
     *
     * @since    1.0.4
     * @param    array    $atts    Shortcode attributes.
     * @return   string   Button HTML.
     */
    public function render_button($atts = array()) {
        $atts = shortcode_atts(
            array(
                'text' => __('Add to estimator', 'product-estimator'),
                'class' => '',
                'product_id' => 0,
            ),
            $atts,
            'estimator_button'
        );

        $classes = 'product-estimator-button';
        if (!empty($atts['class'])) {
            $classes .= ' ' . esc_attr($atts['class']);
        }

        $product_attr = '';
        if (!empty($atts['product_id'])) {
            $product_attr = ' data-product-id="' . esc_attr($atts['product_id']) . '"';
        }

        $button = sprintf(
            '<button type="button" class="%1$s"%2$s>%3$s</button>',
            esc_attr($classes),
            $product_attr,
            esc_html($atts['text'])
        );

        return $button;
    }

    /**
     * AJAX handler to get the estimator form
     *
     * @since    1.0.4
     */
    public function get_estimator_form() {
        // Check nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Get product ID if provided
        $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
        $is_variation = isset($_POST['is_variation']) && $_POST['is_variation'] == 'true';

        // Start output buffer to capture form HTML
        ob_start();

        // If we have a product ID, handle it accordingly
        if ($product_id > 0) {
            // Create a product instance
            $product = wc_get_product($product_id);

            if (!$product) {
                wp_send_json_error(array(
                    'message' => __('Product not found', 'product-estimator')
                ));
                return;
            }

            // Check if estimator is enabled for this product
            if (!$this->is_estimator_enabled($product_id)) {
                wp_send_json_error(array(
                    'message' => __('Estimator is not enabled for this product', 'product-estimator')
                ));
                return;
            }
        }

        // Render the estimator form
        $this->render_estimator_form($product_id, $is_variation);

        // Get the form HTML
        $html = ob_get_clean();

        // Send the response
        wp_send_json_success(array('html' => $html));
    }

    /**
     * Render the estimator form
     *
     * @since    1.0.4
     * @param    int      $product_id    Product ID
     * @param    boolean  $is_variation  Whether this is a variation
     */
    private function render_estimator_form($product_id = 0, $is_variation = false) {
        // Pass the correct parameters to the template
        $atts = array(
            'title' => __('Product Estimate', 'product-estimator'),
            'button_text' => __('Calculate', 'product-estimator'),
            'product_id' => $product_id
        );

        // If this is a variation, handle it differently
        if ($is_variation && $product_id > 0) {
            $variation = wc_get_product($product_id);
            if ($variation && $variation->is_type('variation')) {
                $parent_id = $variation->get_parent_id();
                $atts['parent_id'] = $parent_id;
                $atts['variation_id'] = $product_id;
            }
        }

        // Render the estimator display template
        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-display.php';
    }

    /**
     * Check if estimator is enabled for a product
     *
     * @since    1.0.4
     * @param    int      $product_id    Product ID
     * @return   boolean  True if estimator is enabled
     */
    private function is_estimator_enabled($product_id) {
        // Use the static method from WoocommerceIntegration class
        return \RuDigital\ProductEstimator\Includes\Integration\WoocommerceIntegration::is_estimator_enabled($product_id);
    }
}
