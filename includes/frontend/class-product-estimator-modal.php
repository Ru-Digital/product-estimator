<?php
/**
 * Modal Implementation for Product Estimator
 *
 * This file adds a global modal that can be triggered from any page
 * with an "Add to estimator" button.
 *
 * @since      1.0.4
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public
 */

namespace RuDigital\ProductEstimator\Includes\Frontend;

/**
 * Modal Implementation Class
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
            'productEstimatorModal',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('product_estimator_modal_nonce'),
                'i18n' => array(
                    'loading' => __('Loading estimator...', 'product-estimator'),
                    'error' => __('Error loading estimator. Please try again.', 'product-estimator'),
                    'close' => __('Close', 'product-estimator')
                )
            )
        );
    }

    /**
     * Render the modal HTML in the footer
     *
     * @since    1.0.4
     */
    public function render_modal() {
        ?>
        <div id="product-estimator-modal" class="product-estimator-modal" style="display: none;">
            <div class="product-estimator-modal-overlay"></div>
            <div class="product-estimator-modal-container">
                <div class="product-estimator-modal-header">
                    <h2><?php esc_html_e('Product Estimator', 'product-estimator'); ?></h2>
                    <button type="button" class="product-estimator-modal-close" aria-label="<?php esc_attr_e('Close', 'product-estimator'); ?>">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="product-estimator-modal-content">
                    <div class="product-estimator-modal-loading">
                        <div class="product-estimator-spinner"></div>
                        <p><?php esc_html_e('Loading estimator...', 'product-estimator'); ?></p>
                    </div>
                    <div class="product-estimator-modal-form-container"></div>
                </div>
            </div>
        </div>
        <?php
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
        check_ajax_referer('product_estimator_modal_nonce', 'nonce');

        // Get product ID if provided
        $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
        $is_variation = isset($_POST['is_variation']) && $_POST['is_variation'] == 'true';

        // Get the estimator form
        ob_start();

        // If your plugin is using a frontend class to handle the estimator display
        $public_class = new ProductEstimatorPublic($this->plugin_name, $this->version);

        // Pass the atts to the render method
        $atts = array(
            'title' => __('Product Estimate', 'product-estimator'),
            'button_text' => __('Calculate', 'product-estimator'),
            'product_id' => $product_id
        );

        // If this is a variation, handle it differently
        if ($is_variation && $product_id > 0) {
            if (function_exists('wc_get_product')) {
                $variation = wc_get_product($product_id);
                if ($variation && $variation->is_type('variation')) {
                    $parent_id = $variation->get_parent_id();

                    // Add variation info to the attributes
                    $atts['parent_id'] = $parent_id;
                    $atts['variation_id'] = $product_id;
                }
            }
        }

        echo $public_class->render_estimator($atts);

        $html = ob_get_clean();

        wp_send_json_success(array('html' => $html));
    }
}
