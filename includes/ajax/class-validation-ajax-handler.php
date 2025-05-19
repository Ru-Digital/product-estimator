<?php
namespace RuDigital\ProductEstimator\Includes\Ajax;

use RuDigital\ProductEstimator\Includes\CustomerDetails;

/**
 * Validation-related AJAX handlers
 *
 * Handles all validation operations including primary category conflicts and customer details
 */
class ValidationAjaxHandler extends AjaxHandlerBase {

    /**
     * Register WordPress hooks for AJAX endpoints
     *
     * @return void
     */
    protected function register_hooks() {
        $this->register_ajax_endpoint('check_primary_category_conflict', 'checkPrimaryCategoryConflict');
    }

    /**
     * Check for primary category conflicts
     * This is still needed to validate primary category rules server-side
     */
    public function checkPrimaryCategoryConflict() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Get the product IDs to check
        $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
        $existing_products = isset($_POST['existing_products']) ? $_POST['existing_products'] : [];

        if (!$product_id) {
            wp_send_json_error(['message' => __('Product ID is required', 'product-estimator')]);
            return;
        }

        // Check if the new product is in a primary category
        $new_product_is_primary = $this->isProductInPrimaryCategories($product_id);

        if (!$new_product_is_primary) {
            // No conflict possible if the new product isn't primary
            wp_send_json_success(['has_conflict' => false]);
            return;
        }

        // Check existing products for primary category conflicts
        foreach ($existing_products as $existing_product_id) {
            if ($this->isProductInPrimaryCategories($existing_product_id)) {
                // Found a conflict
                $existing_product = wc_get_product($existing_product_id);
                $new_product = wc_get_product($product_id);

                wp_send_json_success([
                    'has_conflict' => true,
                    'existing_product_id' => $existing_product_id,
                    'existing_product_name' => $existing_product ? $existing_product->get_name() : '',
                    'new_product_id' => $product_id,
                    'new_product_name' => $new_product ? $new_product->get_name() : ''
                ]);
                return;
            }
        }

        // No conflicts found
        wp_send_json_success(['has_conflict' => false]);
    }
}
