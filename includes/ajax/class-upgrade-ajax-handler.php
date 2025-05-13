<?php
namespace RuDigital\ProductEstimator\Includes\Ajax;

/**
 * Product upgrade-related AJAX handlers
 */
class UpgradeAjaxHandler extends AjaxHandlerBase {

    /**
     * Register WordPress hooks for AJAX endpoints
     *
     * @return void
     */
    protected function register_hooks() {
        $this->register_ajax_endpoint('get_product_upgrades', 'get_product_upgrades');
    }

    /**
     * Get available upgrades for a product
     */
    public function get_product_upgrades() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Get product ID
        $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;

        if (!$product_id) {
            wp_send_json_error([
                'message' => __('Product ID is required', 'product-estimator')
            ]);
            return;
        }

        // Get product categories to match against upgrade configurations
        $product_categories = wp_get_post_terms($product_id, 'product_cat', ['fields' => 'ids']);

        if (empty($product_categories) || is_wp_error($product_categories)) {
            wp_send_json_success(['upgrades' => []]);
            return;
        }

        // Get product upgrades settings module
        if (!class_exists('\\RuDigital\\ProductEstimator\\Includes\\Frontend\\ProductUpgradesFrontend')) {
            wp_send_json_error([
                'message' => __('Product Upgrades module not available', 'product-estimator')
            ]);
            return;
        }

        // Initialize the settings module
        $upgrades_module = new \RuDigital\ProductEstimator\Includes\Frontend\ProductUpgradesFrontend(
            'product-estimator',
            PRODUCT_ESTIMATOR_VERSION
        );

        // Get applicable upgrades for this product
        $upgrades = $upgrades_module->get_upgrades_for_product($product_id);

        wp_send_json_success([
            'upgrades' => $upgrades
        ]);
    }
}
