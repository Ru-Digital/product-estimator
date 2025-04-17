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
        static $instance = 0;
        if ($instance > 0) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('WoocommerceIntegration already initialized, preventing duplicate');
            }
            return;
        }
        $instance++;

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

        // Add filter to prevent synchronization of _enable_estimator meta
        add_filter('woocommerce_product_get_meta', array($this, 'preventMetaSync'), 10, 4);
        add_filter('update_post_metadata', array($this, 'preventParentEstimatorSync'), 10, 5);

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

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Saving _enable_estimator for product $post_id: $enable_estimator");
        }

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
        // Add filter just before updating meta to prevent synchronization
        add_filter('update_post_metadata', array($this, 'preventParentEstimatorSync'), 10, 5);

        $enable_estimator = isset($_POST['_enable_estimator'][$loop]) ? 'yes' : 'no';

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Saving _enable_estimator for variation $variation_id: $enable_estimator");
        }

        // Direct SQL update to bypass WP filters that might cause sync
        global $wpdb;
        $meta_key = '_enable_estimator';

        // Check if meta already exists
        $meta_id = $wpdb->get_var($wpdb->prepare(
            "SELECT meta_id FROM $wpdb->postmeta WHERE post_id = %d AND meta_key = %s",
            $variation_id, $meta_key
        ));

        if ($meta_id) {
            // Update existing meta
            $wpdb->update(
                $wpdb->postmeta,
                array('meta_value' => $enable_estimator),
                array('meta_id' => $meta_id),
                array('%s'),
                array('%d')
            );
        } else {
            // Insert new meta
            $wpdb->insert(
                $wpdb->postmeta,
                array(
                    'post_id' => $variation_id,
                    'meta_key' => $meta_key,
                    'meta_value' => $enable_estimator
                ),
                array('%d', '%s', '%s')
            );
        }

        // Clear post meta cache
        wp_cache_delete($variation_id, 'post_meta');

        // Remove the filter after we're done
        remove_filter('update_post_metadata', array($this, 'preventParentEstimatorSync'), 10);
    }

    /**
     * Prevent unwanted synchronization of _enable_estimator between variations and parent
     *
     * @param mixed $check Whether to allow updating metadata
     * @param int $object_id Object ID
     * @param string $meta_key Meta key
     * @param mixed $meta_value Meta value
     * @param mixed $prev_value Previous value
     * @return mixed
     */
    public function preventParentEstimatorSync($check, $object_id, $meta_key, $meta_value, $prev_value) {
        // Only intercept _enable_estimator updates
        if ($meta_key === '_enable_estimator') {
            $product = wc_get_product($object_id);

            // Check if this is a parent variable product
            if ($product && $product->is_type('variable')) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("Preventing _enable_estimator sync to parent product: $object_id");
                }
                // Prevent updating parent
                return false;
            }
        }

        // Allow all other updates
        return $check;
    }

    /**
     * Prevent meta sync with parent for _enable_estimator field
     *
     * @param mixed $value Meta value
     * @param WC_Product $product Product object
     * @param string $meta_key Meta key
     * @param bool $single Whether to return a single value
     * @return mixed
     */
    public function preventMetaSync($value, $product, $meta_key, $single) {
        if ($meta_key === '_enable_estimator' && $product->is_type('variable')) {
            // For variable products, don't automatically sync from variations
            return $value;
        }

        return $value;
    }

    /**
     * Display the "Add to Estimator" button on product pages
     */
    public function displayEstimatorButton() {
        static $button_displayed = false;

        // Prevent multiple buttons from being displayed
        if ($button_displayed) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Estimator button already displayed, skipping duplicate');
            }
            return;
        }

        global $product;

        if (!$product) {
            return;
        }

        // For variable products, we should show the button by default for the parent product
        // JavaScript will handle visibility based on selected variation
        $show_button = true;

        // For simple products, only show if estimator is enabled
        if (!$product->is_type('variable')) {
            $show_button = self::isEstimatorEnabled($product->get_id());
        }

        if (!$show_button) {
            return;
        }

        // Add a single button that will be updated by JavaScript
        ?>
        <button type="button"
                class="single_add_to_estimator_button button alt open-estimator-modal"
                data-product-id="<?php echo esc_attr($product->get_id()); ?>">
            <?php esc_html_e('Add to Estimate', 'product-estimator'); ?>
        </button>
        <?php

        // Mark that the button has been displayed
        $button_displayed = true;

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Estimator button displayed for product ID: ' . $product->get_id());
        }
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
     * Check if estimator is enabled for a product/variation with improved handling
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
            // Check variation first - if it has a specific setting, use that
            $variation_meta = get_post_meta($product_id, '_enable_estimator', true);

            // Only if it's explicitly 'yes', consider it enabled
            if ($variation_meta === 'yes') {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("Variation {$product_id} has estimator explicitly enabled");
                }
                return true;
            }

            // If variation has explicitly 'no', respect that
            if ($variation_meta === 'no') {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("Variation {$product_id} has estimator explicitly disabled");
                }
                return false;
            }

            // Otherwise fall back to parent setting
            $parent_id = $product->get_parent_id();
            $parent_enabled = get_post_meta($parent_id, '_enable_estimator', true) === 'yes';

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("Variation {$product_id} using parent setting: " . ($parent_enabled ? 'enabled' : 'disabled'));
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

    /**
     * Check if a variable product has any variations with estimator enabled
     *
     * This is a new helper method to find enabled variations in a variable product
     *
     * @param int $product_id The variable product ID
     * @return array Array of variation IDs with estimator enabled, empty if none
     */
    public static function getEnabledVariations($product_id) {
        $product = wc_get_product($product_id);
        $enabled_variations = [];

        if (!$product || !$product->is_type('variable')) {
            return $enabled_variations;
        }

        // Get all available variations
        $variations = $product->get_available_variations();

        if (empty($variations)) {
            return $enabled_variations;
        }

        // Check each variation
        foreach ($variations as $variation) {
            $variation_id = $variation['variation_id'];

            // Check if this variation has estimator enabled
            if (self::isEstimatorEnabled($variation_id)) {
                $enabled_variations[] = [
                    'id' => $variation_id,
                    'attributes' => $variation['attributes'],
                    'name' => $product->get_name() . ' - ' . wc_get_formatted_variation($variation['attributes'], true),
                    'image' => isset($variation['image']['url']) ? $variation['image']['url'] : '',
                    'price' => isset($variation['display_price']) ? $variation['display_price'] : 0
                ];
            }
        }

        return $enabled_variations;
    }

    /**
     * Check if a product or any of its variations have estimator enabled
     *
     * This method handles both simple and variable products
     *
     * @param int $product_id The product ID
     * @return bool Whether estimator is enabled for the product or any variation
     */
    public static function hasEstimatorEnabled($product_id) {
        $product = wc_get_product($product_id);

        if (!$product) {
            return false;
        }

        // For simple products, just check directly
        if (!$product->is_type('variable')) {
            return self::isEstimatorEnabled($product_id);
        }

        // For variable products, check if product itself or any variation has estimator enabled
        if (self::isEstimatorEnabled($product_id)) {
            return true;
        }

        // Check variations
        $enabled_variations = self::getEnabledVariations($product_id);
        return !empty($enabled_variations);
    }
}
