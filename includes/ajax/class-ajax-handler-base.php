<?php
namespace RuDigital\ProductEstimator\Includes\Ajax;

/**
 * Base class for AJAX handlers
 *
 * Provides common functionality for all AJAX handlers
 */
abstract class AjaxHandlerBase {

    /**
     * Initialize the class and set up WordPress hooks
     */
    public function __construct() {
        $this->register_hooks();
    }

    /**
     * Register WordPress hooks for AJAX endpoints
     *
     * Child classes must implement this method to register their specific AJAX endpoints
     *
     * @return void
     */
    abstract protected function register_hooks();

    /**
     * Verify nonce for AJAX requests
     *
     * @param string $action The nonce action
     * @param string $nonce_field The nonce field name
     * @return bool True if nonce is valid, false otherwise
     */
    protected function verify_nonce($action, $nonce_field = 'security') {
        $nonce = isset($_REQUEST[$nonce_field]) ? sanitize_text_field($_REQUEST[$nonce_field]) : '';
        return wp_verify_nonce($nonce, $action);
    }

    /**
     * Send JSON success response
     *
     * @param mixed $data Data to send in response
     */
    protected function send_json_success($data = null) {
        wp_send_json_success($data);
    }

    /**
     * Send JSON error response
     *
     * @param string $message Error message
     * @param int $status_code HTTP status code
     */
    protected function send_json_error($message = '', $status_code = 400) {
        wp_send_json_error(array('message' => $message), $status_code);
    }

    /**
     * Register an AJAX endpoint
     *
     * Registers both authenticated and non-authenticated versions of the endpoint
     *
     * @param string $action AJAX action name without prefix
     * @param string $method Method name to handle the action
     * @param bool $nopriv Whether to allow non-authenticated requests
     */
    protected function register_ajax_endpoint($action, $method, $nopriv = true) {
        add_action('wp_ajax_' . $action, array($this, $method));

        if ($nopriv) {
            add_action('wp_ajax_nopriv_' . $action, array($this, $method));
        }
    }

    /**
     * Helper function to fetch and format detailed similar products.
     *
     * @param int $product_id The source product ID.
     * @param float $room_area The area of the room.
     * @param int $limit Maximum number of similar products to return.
     * @return array Array of similar product data.
     */
    protected function fetch_and_format_similar_products($product_id, $room_area, $limit = 5)
    {
        if (!$product_id) {
            return [];
        }

        try {
            // Ensure SimilarProductsFrontend is available
            if (!class_exists('\\RuDigital\\ProductEstimator\\Includes\\Frontend\\SimilarProductsFrontend')) {
                $similar_products_frontend_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/frontend/class-similar-products-frontend.php';
                if (file_exists($similar_products_frontend_path)) {
                    require_once $similar_products_frontend_path;
                } else {
                    error_log('SimilarProductsFrontend class file not found for fetching similar products.');
                    return [];
                }
            }
            $similar_products_module = new \RuDigital\ProductEstimator\Includes\Frontend\SimilarProductsFrontend(
                'product-estimator',
                PRODUCT_ESTIMATOR_VERSION
            );

            // Find similar product IDs
            $similar_product_ids = $similar_products_module->find_similar_products($product_id);

            if (empty($similar_product_ids)) {
                return [];
            }

            $similar_products_data = [];
            $count = 0;

            // Ensure the pricing helper function is available
            if (!function_exists('product_estimator_calculate_total_price_with_additions')) {
                // This function is crucial. If it's not globally available,
                // you might need to include the file where it's defined or call it via a class method.
                error_log('Helper function product_estimator_calculate_total_price_with_additions not available for similar products.');
                return [];
            }

            foreach ($similar_product_ids as $similar_id_candidate) {
                if (intval($similar_id_candidate) === intval($product_id)) { // Skip the product itself
                    continue;
                }

                $product_obj = wc_get_product($similar_id_candidate);
                if (!$product_obj) {
                    continue;
                }

                $current_similar_id_to_use = $similar_id_candidate; // ID to use for pricing and data

                // Check if estimator is enabled for this product (or its variations)
                $is_estimator_enabled = false;
                if (class_exists('\\RuDigital\\ProductEstimator\\Includes\\Integration\\WoocommerceIntegration') &&
                    method_exists('\\RuDigital\\ProductEstimator\\Includes\\Integration\\WoocommerceIntegration', 'isEstimatorEnabled')) {

                    if (\RuDigital\ProductEstimator\Includes\Integration\WoocommerceIntegration::isEstimatorEnabled($similar_id_candidate)) {
                        $is_estimator_enabled = true;
                    } elseif ($product_obj->is_type('variable')) {
                        $variations = $product_obj->get_available_variations();
                        foreach ($variations as $variation) {
                            if (\RuDigital\ProductEstimator\Includes\Integration\WoocommerceIntegration::isEstimatorEnabled($variation['variation_id'])) {
                                $current_similar_id_to_use = $variation['variation_id']; // Use the variation ID
                                $product_obj = wc_get_product($current_similar_id_to_use); // Get the variation product object
                                if ($product_obj) { // Ensure variation product object is valid
                                    $is_estimator_enabled = true;
                                    break;
                                }
                            }
                        }
                    }
                } else {
                    error_log('WoocommerceIntegration::isEstimatorEnabled not available. Cannot reliably check if estimator is enabled for similar products.');
                    // Depending on desired behavior, you might default to true or false, or skip.
                    // For now, let's skip if we can't check.
                    continue;
                }

                if (!$is_estimator_enabled) {
                    continue;
                }

                // Calculate total price including additions using the helper function
                $price_data = product_estimator_calculate_total_price_with_additions(
                    $current_similar_id_to_use, // Use the potentially updated ID (e.g., variation ID)
                    $room_area
                );

                // Prepare data for the frontend
                $similar_products_data[] = [
                    'id' => intval($current_similar_id_to_use),
                    'name' => $product_obj->get_name(),
                    'min_price' => $price_data['min_price'], // Use total prices
                    'max_price' => $price_data['max_price'], // Use total prices
                    'min_price_total' => $price_data['min_total'], // Use total prices
                    'max_price_total' => $price_data['max_total'], // Use total prices
                    'image' => wp_get_attachment_image_url($product_obj->get_image_id(), 'thumbnail') ?: '',
                    'pricing_method' => $price_data['breakdown'][0]['pricing_method'] ?? 'sqm' // Get pricing method from main product in breakdown
                ];

                $count++;
                if ($count >= $limit) {
                    break;
                }
            }
            return $similar_products_data;

        } catch (\Exception $e) {
            error_log('Exception in fetch_and_format_similar_products: ' . $e->getMessage());
            return [];
        }
    }
}
