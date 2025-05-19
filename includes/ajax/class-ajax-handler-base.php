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
     * Check if a product is in one of the primary product categories
     *
     * @param int $product_id The product ID to check
     * @return bool True if the product is in a primary category
     */
    protected function isProductInPrimaryCategories($product_id) {
        // Get the primary product categories from settings
        $settings = get_option('product_estimator_settings', []);
        $primary_categories = isset($settings['primary_product_categories']) ? $settings['primary_product_categories'] : [];

        if (empty($primary_categories)) {
            return false;
        }

        // Get the product
        $product = wc_get_product($product_id);
        if (!$product) {
            return false;
        }

        // Check if it's a variation and get the parent product
        if ($product->is_type('variation')) {
            $parent_id = $product->get_parent_id();
            $product_id = $parent_id;
        }

        // Get product categories
        $product_categories = wp_get_post_terms($product_id, 'product_cat', ['fields' => 'ids']);

        if (is_wp_error($product_categories)) {
            return false;
        }

        // Check if any of the product categories match the primary categories
        foreach ($product_categories as $category_id) {
            if (in_array($category_id, $primary_categories)) {
                return true;
            }
        }

        return false;
    }
    /**
     * Helper function to fetch and format detailed similar products.
     *
     * @param int $product_id The source product ID.
     * @param float $room_area The area of the room.
     * @param int $limit Maximum number of similar products to return.
     * @return array Array of similar product data.
     */
    protected function fetch_and_format_similar_products($product_id, $room_area, $limit = 5) {
        if (!$product_id) {
            return [];
        }

        try {
            // Check if the product is a variation and get parent if so
            $product = wc_get_product($product_id);
            if (!$product) {
                return [];
            }

            $source_product_id = $product_id;

            // If it's a variation, use parent product for finding similar products
            if ($product->is_type('variation')) {
                $source_product_id = $product->get_parent_id();
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Product ' . $product_id . ' is a variation. Using parent ID: ' . $source_product_id);
                }
            } else {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Product ' . $product_id . ' is not a variation. Using original ID: ' . $source_product_id);
                }
            }

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

            // Find similar product IDs using the parent product ID if it's a variation
            $similar_product_ids = $similar_products_module->find_similar_products($source_product_id);

            if (empty($similar_product_ids)) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('No similar products found for source product ID: ' . $source_product_id);
                }
                return [];
            }

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('find_similar_products returned ' . count($similar_product_ids) . ' product IDs');
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
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Processing similar product ID: ' . $similar_id_candidate);
                }

                if (intval($similar_id_candidate) === intval($product_id)) { // Skip the product itself
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('Skipping product itself: ' . $similar_id_candidate);
                    }
                    continue;
                }

                $product_obj = wc_get_product($similar_id_candidate);
                if (!$product_obj) {
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('Product object not found for ID: ' . $similar_id_candidate);
                    }
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
                                // If any variation has estimator enabled, consider the parent product enabled
                                // but continue using the parent product ID, not the variation ID
                                $is_estimator_enabled = true;
                                break;
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
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('Estimator not enabled for product ID: ' . $similar_id_candidate);
                    }
                    continue;
                }

                // Calculate total price including additions using the helper function
                $price_data = product_estimator_calculate_total_price_with_additions(
                    $current_similar_id_to_use, // Use the potentially updated ID (e.g., variation ID)
                    $room_area
                );
                $product_id = intval($current_similar_id_to_use);
                // Prepare data for the frontend
                $similar_products_data[$product_id] = [
                    'id' => $product_id,
                    'name' => $product_obj->get_name(),
                    'min_price' => $price_data['min_price'], // Use total prices
                    'max_price' => $price_data['max_price'], // Use total prices
                    'min_price_total' => $price_data['min_total'], // Use total prices
                    'max_price_total' => $price_data['max_total'], // Use total prices
                    'image' => wp_get_attachment_image_url($product_obj->get_image_id(), 'thumbnail') ?: '',
                    'pricing_method' => $price_data['breakdown'][0]['pricing_method'] ?? 'sqm', // Get pricing method from main product in breakdown
                    'is_primary_category' => $this->isProductInPrimaryCategories($product_id)
                ];

                $count++;
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Added similar product #' . $count . ' with ID: ' . $product_id);
                }

                if ($count >= $limit) {
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('Reached limit of ' . $limit . ' similar products');
                    }
                    break;
                }
            }

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Total similar products found: ' . count($similar_products_data));
                error_log('Similar product IDs: ' . implode(', ', array_keys($similar_products_data)));
            }

            return $similar_products_data;

        } catch (\Exception $e) {
            error_log('Exception in fetch_and_format_similar_products: ' . $e->getMessage());
            return [];
        }
    }}
