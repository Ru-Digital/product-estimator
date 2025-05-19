<?php
namespace RuDigital\ProductEstimator\Includes\Ajax;

/**
 * Product suggestion-related AJAX handlers
 * 
 * This class handles suggestion and similar product requests.
 * Session storage has been removed as the frontend uses localStorage.
 */
class SuggestionAjaxHandler extends AjaxHandlerBase {

    /**
     * Register WordPress hooks for AJAX endpoints
     *
     * @return void
     */
    protected function register_hooks() {
        $features = product_estimator_features(); // Get feature flags

        if ($features->suggested_products_enabled) {
            $this->register_ajax_endpoint('fetch_suggestions_for_modified_room', 'handle_fetch_suggestions_for_modified_room');
            $this->register_ajax_endpoint('get_suggested_products', 'generateSuggestions');
        }

        $this->register_ajax_endpoint('get_similar_products', 'get_similar_products');
    }

    /**
     * AJAX handler to fetch suggestions for a room given its modified content (array of product IDs).
     * This is used before a product is actually removed to get relevant suggestions.
     * FIXED: Changed the validation for estimate_id and room_id to allow '0' as a valid ID.
     * MODIFIED: Expects 'room_product_ids_for_suggestions' to be a JSON array of product IDs.
     */
    public function handle_fetch_suggestions_for_modified_room() {
        check_ajax_referer('product_estimator_nonce', 'nonce');
        $features = product_estimator_features(); // Get feature flags
        $estimate_id_input = isset($_POST['estimate_id']) ? sanitize_text_field($_POST['estimate_id']) : null;
        $room_id_input = isset($_POST['room_id']) ? sanitize_text_field($_POST['room_id']) : null;
        if (!$features->suggested_products_enabled) {
            wp_send_json_success([
                'suggestions' => [],
                'estimate_id' => $estimate_id_input,
                'room_id' => $room_id_input,
                'message' => sprintf(__('Suggestions are disabled.', 'product-estimator'))
            ]);
        }

        $estimate_id_input = isset($_POST['estimate_id']) ? sanitize_text_field($_POST['estimate_id']) : null;
        $room_id_input = isset($_POST['room_id']) ? sanitize_text_field($_POST['room_id']) : null;
        // Ensure 'null' string from JS is converted to actual null for PHP
        $room_width_raw = $_POST['room_width'] ?? null;
        $room_length_raw = $_POST['room_length'] ?? null;

        $room_width = ($room_width_raw === 'null' || $room_width_raw === null) ? null : floatval($room_width_raw);
        $room_length = ($room_length_raw === 'null' || $room_length_raw === null) ? null : floatval($room_length_raw);


        // **MODIFIED: Expecting a JSON string of an array of product IDs**
        $room_product_ids_json = isset($_POST['room_product_ids_for_suggestions']) ? stripslashes($_POST['room_product_ids_for_suggestions']) : '[]';
        $simulated_room_product_ids = json_decode($room_product_ids_json, true); // true for associative array (though it will be a simple array of IDs)

        if ($estimate_id_input === null || trim($estimate_id_input) === '' || $room_id_input === null || trim($room_id_input) === '') {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('handle_fetch_suggestions_for_modified_room: Estimate ID or Room ID is missing or empty. Estimate ID: "' . $estimate_id_input . '", Room ID: "' . $room_id_input . '"');
            }
            wp_send_json_error(['message' => __('Estimate ID and Room ID are required and cannot be empty.', 'product-estimator')]);
            return;
        }

        // **MODIFIED: Validate that $simulated_room_product_ids is an array (even if empty)**
        if (!is_array($simulated_room_product_ids)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('handle_fetch_suggestions_for_modified_room: simulated_room_product_ids is not a valid array after JSON decode.');
                error_log('Raw room_product_ids_json: ' . $room_product_ids_json);
            }
            wp_send_json_error(['message' => __('Invalid simulated product IDs data received.', 'product-estimator')]);
            return;
        }

        try {
            if (!class_exists('\\RuDigital\\ProductEstimator\\Includes\\Frontend\\ProductAdditionsFrontend')) {
                $pa_frontend_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/frontend/class-product-additions-frontend.php';
                if (file_exists($pa_frontend_path)) {
                    require_once $pa_frontend_path;
                } else {
                    throw new \Exception('ProductAdditionsFrontend class file not found.');
                }
            }
            $product_additions_manager = new \RuDigital\ProductEstimator\Includes\Frontend\ProductAdditionsFrontend('product-estimator', PRODUCT_ESTIMATOR_VERSION);

            $room_area = 0;
            if (is_numeric($room_width) && is_numeric($room_length)) {
                $room_area = floatval($room_width) * floatval($room_length);
            }

            $products_for_suggestion_engine = [];
            foreach ($simulated_room_product_ids as $product_id) {
                $products_for_suggestion_engine[] = ['id' => intval($product_id)];
            }

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('handle_fetch_suggestions_for_modified_room: Fetching suggestions with simulated room content (for suggestion engine): ' . print_r($products_for_suggestion_engine, true) . ' and room_area: ' . $room_area);
            }

            $suggestions = $product_additions_manager->get_suggestions_for_room($products_for_suggestion_engine, $room_area);

            wp_send_json_success([
                'updated_suggestions' => $suggestions,
                'estimate_id' => $estimate_id_input,
                'room_id' => $room_id_input
            ]);

        } catch (\Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('handle_fetch_suggestions_for_modified_room: Error occurred: ' . $e->getMessage());
            }
            wp_send_json_error(['message' => __('Error generating suggestions', 'product-estimator'), 'error' => $e->getMessage()]);
        }
    }

    /**
     * Generate suggestions (deprecated method kept for backward compatibility)
     * This uses room data directly from the request rather than session
     */
    public function generateSuggestions() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Instead of getting data from session, expect room data from the request
        $room_products = isset($_POST['room_products']) ? $_POST['room_products'] : [];
        $room_area = isset($_POST['room_area']) ? floatval($_POST['room_area']) : 0;
        
        try {
            if (!class_exists('\\RuDigital\\ProductEstimator\\Includes\\Frontend\\ProductAdditionsFrontend')) {
                $pa_frontend_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/frontend/class-product-additions-frontend.php';
                if (file_exists($pa_frontend_path)) {
                    require_once $pa_frontend_path;
                } else {
                    throw new \Exception('ProductAdditionsFrontend class file not found.');
                }
            }
            
            $product_additions_manager = new \RuDigital\ProductEstimator\Includes\Frontend\ProductAdditionsFrontend('product-estimator', PRODUCT_ESTIMATOR_VERSION);
            
            // Generate suggestions using provided room data
            $suggestions = $product_additions_manager->get_suggestions_for_room($room_products, $room_area);
            
            wp_send_json_success([
                'suggestions' => $suggestions,
                'message' => __('Suggestions generated successfully', 'product-estimator')
            ]);
            
        } catch (\Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('generateSuggestions: Error occurred: ' . $e->getMessage());
            }
            wp_send_json_error([
                'message' => __('Error generating suggestions', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * AJAX handler for getting similar products for a specific product
     * This has never used session storage
     */
    public function get_similar_products() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Get product ID
        $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
        $room_area = isset($_POST['room_area']) ? floatval($_POST['room_area']) : 0;

        if (!$product_id) {
            wp_send_json_error(['message' => __('Product ID is required', 'product-estimator')]);
            return;
        }

        try {
            // Check if SimilarProductsFrontend class exists
            if (!class_exists('\\RuDigital\\ProductEstimator\\Includes\\Frontend\\SimilarProductsFrontend')) {
                $similar_products_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/frontend/class-similar-products-frontend.php';
                if (file_exists($similar_products_path)) {
                    require_once $similar_products_path;
                } else {
                    throw new \Exception('SimilarProductsFrontend class file not found.');
                }
            }

            // Create instance of SimilarProductsFrontend
            $similar_products_frontend = new \RuDigital\ProductEstimator\Includes\Frontend\SimilarProductsFrontend('product-estimator', PRODUCT_ESTIMATOR_VERSION);

            // Get similar products using the frontend class
            $similar_products = $similar_products_frontend->get_similar_products_for_product($product_id, $room_area);
            
            // Get section info for the product
            $section_info = $similar_products_frontend->get_section_info_for_product($product_id);

            // Force logging to see what's actually happening
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Similar products result: ' . print_r($similar_products, true));
                error_log('Section info result: ' . print_r($section_info, true));
            }

            wp_send_json_success([
                'products' => $similar_products,
                'source_product_id' => $product_id,
                'section_info' => $section_info
            ]);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => __('Error retrieving similar products', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Check if a product is in one of the primary product categories
     *
     * @param int $product_id The product ID to check
     * @return bool True if the product is in a primary category
     */
    protected function isProductInPrimaryCategories($product_id) {
        // Get the primary categories from settings
        $general_settings = get_option('product_estimator_general', []);
        $primary_category_ids = isset($general_settings['primary_product_categories']) ? $general_settings['primary_product_categories'] : [];
        
        // If no primary categories are configured, no product can be primary
        if (empty($primary_category_ids)) {
            return false;
        }
        
        // Get the product's categories
        $product_categories = wp_get_post_terms($product_id, 'product_cat', ['fields' => 'ids']);
        
        // Check if any of the product's categories are in the primary categories list
        $is_primary = !empty(array_intersect($product_categories, $primary_category_ids));
        
        return $is_primary;
    }
}