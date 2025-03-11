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
        // Only proceed if WooCommerce is active
        if (!$this->isWooCommerceActive()) {
            return;
        }

        // Add fields to simple products
        add_action('woocommerce_product_options_pricing', array($this, 'addProductFields'));
        add_action('woocommerce_process_product_meta', array($this, 'saveProductFields'));

        // Add fields to variations
        add_action('woocommerce_variation_options_pricing', array($this, 'addVariationFields'), 10, 3);
        add_action('woocommerce_save_product_variation', array($this, 'saveVariationFields'), 10, 2);

        // Add estimator button to product page
        add_action('woocommerce_after_add_to_cart_button', array($this, 'displayEstimatorButton'));

        // Add shortcode for estimator button
        add_shortcode('estimator_button', array($this, 'estimatorButtonShortcode'));

         add_action('wp_footer', array($this, 'addVariationEstimatorData'), 10);

    }

    /**
     * Check if WooCommerce is active
     *
     * @return bool
     */
    private function isWooCommerceActive() {
        return class_exists('WooCommerce');
    }

    /**
     * Add custom fields to simple products
     */
    public function addProductFields() {
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
     *
     * @param int $post_id The product ID
     */
    public function saveProductFields($post_id) {
        $enable_estimator = isset($_POST['_enable_estimator']) ? 'yes' : 'no';
        update_post_meta($post_id, '_enable_estimator', $enable_estimator);
    }

    /**
     * Add custom fields to variations
     *
     * @param int $loop The variation loop index
     * @param array $variation_data The variation data
     * @param WP_Post $variation The variation post object
     */
    public function addVariationFields($loop, $variation_data, $variation) {
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
     *
     * @param int $variation_id The variation ID
     * @param int $loop The variation loop index
     */
    public function saveVariationFields($variation_id, $loop) {
        $enable_estimator = isset($_POST['_enable_estimator'][$loop]) ? 'yes' : 'no';
        update_post_meta($variation_id, '_enable_estimator', $enable_estimator);
    }

    /**
     * Display the "Add to Estimator" button on product pages
     */
    public function displayEstimatorButton() {
        global $product;

        if (!$product) {
            return;
        }

        // Only show button if estimator is enabled for this product
        if (!self::isEstimatorEnabled($product->get_id())) {
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
     * Shortcode for estimator button
     *
     * @param array $atts Shortcode attributes
     * @return string Button HTML
     */
    public function estimatorButtonShortcode($atts = array()) {
        $atts = shortcode_atts(
            array(
                'text' => __('Add to Estimator', 'product-estimator'),
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
            $product_id = intval($atts['product_id']);

            // Check if the product exists and has estimator enabled
            if ($product_id > 0 && self::isEstimatorEnabled($product_id)) {
                $product_attr = ' data-product-id="' . esc_attr($product_id) . '"';
            }
        }

        return sprintf(
            '<button type="button" class="%1$s"%2$s>%3$s</button>',
            esc_attr($classes),
            $product_attr,
            esc_html($atts['text'])
        );
    }

    /**
     * Check if estimator is enabled for a product/variation
     *
     * @param int $product_id The product/variation ID
     * @return bool Whether estimator is enabled
     */
    public static function isEstimatorEnabled($product_id) {
        $product = wc_get_product($product_id);

        if (!$product) {
            return false;
        }

        // Check if this is a variation
        if ($product->is_type('variation')) {
            // Check variation first
            $variation_enabled = get_post_meta($product_id, '_enable_estimator', true);
            if ($variation_enabled === 'yes') {
                return true;
            }

            // Then check parent product
            $parent_id = $product->get_parent_id();
            return get_post_meta($parent_id, '_enable_estimator', true) === 'yes';
        }

        // For simple products
        return get_post_meta($product_id, '_enable_estimator', true) === 'yes';
    }


    public function addVariationEstimatorData() {
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
