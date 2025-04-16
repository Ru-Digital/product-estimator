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
        add_action('woocommerce_after_add_to_cart_button', array($this, 'displayEstimatorButton'), 20);

        // Add variation data to footer with higher priority to ensure it runs
        add_action('wp_footer', array($this, 'addVariationEstimatorData'), 30);
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
     * Add custom fields to variations with improved display
     *
     * @param int $loop The variation loop index
     * @param array $variation_data The variation data
     * @param WP_Post $variation The variation post object
     */
    public function addVariationFields($loop, $variation_data, $variation) {
        // Add a clear wrapper div to ensure the checkbox is visible
        echo '<div class="form-row form-row-full enable-estimator-variation-wrapper">';

        woocommerce_wp_checkbox(array(
            'id' => '_enable_estimator_' . $variation->ID,
            'name' => '_enable_estimator[' . $loop . ']',
            'label' => __('Enable Product Estimator', 'product-estimator'),
            'description' => __('Enable product estimation tool for this variation', 'product-estimator'),
            'desc_tip' => true,
            'value' => get_post_meta($variation->ID, '_enable_estimator', true),
            'wrapper_class' => 'form-row form-row-full'
        ));

        echo '</div>';
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

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Saving estimator setting for variation {$variation_id}: {$enable_estimator}");
        }
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
            <?php esc_html_e('Add to Estimate', 'product-estimator'); ?>
        </button>
        <?php
    }

    /**
     * Add variation data to footer with enhanced debugging
     */
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
        $debug_data = [];

        // Prepare variation data for JS
        foreach ($available_variations as $variation) {
            $variation_id = $variation['variation_id'];
            $enable_estimator = get_post_meta($variation_id, '_enable_estimator', true);

            $variation_data[$variation_id] = [
                'enable_estimator' => $enable_estimator
            ];

            // Add to debug data
            $debug_data[] = [
                'id' => $variation_id,
                'enable_estimator' => $enable_estimator,
                'attributes' => $variation['attributes']
            ];
        }

        // Add inline script with variation data
        if (!empty($variation_data)) {
            echo '<script type="text/javascript">
            /* Product Estimator Variation Data */
            var product_estimator_variations = ' . wp_json_encode($variation_data) . ';

            // Debug data for estimator variations
            if (window.console && window.console.log) {
                console.log("Product Estimator: Variation data loaded", product_estimator_variations);
            }

            // Enhance the variation found event to update the Add to Estimator button
            jQuery(document).ready(function($) {
                $("form.variations_form").on("found_variation", function(event, variation) {
                    if (variation && variation.variation_id) {
                        console.log("WooCommerce variation found:", variation.variation_id);

                        // Update the button based on whether estimator is enabled for this variation
                        var isEstimatorEnabled = false;

                        if (product_estimator_variations &&
                            product_estimator_variations[variation.variation_id]) {

                            isEstimatorEnabled = product_estimator_variations[variation.variation_id].enable_estimator === "yes";
                            console.log("Estimator enabled for variation " + variation.variation_id + ": " + isEstimatorEnabled);

                            // Update estimator button
                            var $button = $(".single_add_to_estimator_button");

                            if (isEstimatorEnabled) {
                                $button.show();
                                $button.attr("data-product-id", variation.variation_id);
                                $button.attr("data-variation-id", variation.variation_id);
                            } else {
                                $button.hide();
                            }
                        } else {
                            console.log("No estimator data found for variation:", variation.variation_id);
                            $(".single_add_to_estimator_button").hide();
                        }

                        // Add estimator data to the variation object
                        variation.enable_estimator = isEstimatorEnabled ? "yes" : "no";
                    }
                });

                // Also handle reset events
                $("form.variations_form").on("reset_data", function() {
                    console.log("WooCommerce variations reset");

                    // Check the parent product setting
                    var $button = $(".single_add_to_estimator_button");
                    var parentEnabled = ' . (self::isEstimatorEnabled($product->get_id()) ? 'true' : 'false') . ';

                    if (parentEnabled) {
                        $button.show();
                        $button.attr("data-product-id", "' . esc_js($product->get_id()) . '");
                        $button.removeAttr("data-variation-id");
                    } else {
                        $button.hide();
                    }
                });
            });
        </script>';
        }
    }

    /**
     * Check if estimator is enabled for a product/variation with improved logging
     *
     * @param int $product_id The product/variation ID
     * @return bool Whether estimator is enabled
     */
    public static function isEstimatorEnabled($product_id) {
        $product = wc_get_product($product_id);

        if (!$product) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("Product ID {$product_id} not found");
            }
            return false;
        }

        // Check if this is a variation
        if ($product->is_type('variation')) {
            // Check variation first
            $variation_enabled = get_post_meta($product_id, '_enable_estimator', true);

            if ($variation_enabled === 'yes') {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("Variation {$product_id} has estimator enabled");
                }
                return true;
            }

            // Then check parent product
            $parent_id = $product->get_parent_id();
            $parent_enabled = get_post_meta($parent_id, '_enable_estimator', true) === 'yes';

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("Variation {$product_id} checking parent {$parent_id}: " . ($parent_enabled ? 'enabled' : 'disabled'));
            }

            return $parent_enabled;
        }

        // For simple products
        $enabled = get_post_meta($product_id, '_enable_estimator', true) === 'yes';

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Simple product {$product_id} estimator: " . ($enabled ? 'enabled' : 'disabled'));
        }

        return $enabled;
    }
}
