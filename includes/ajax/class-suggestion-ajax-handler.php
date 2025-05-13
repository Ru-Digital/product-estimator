<?php
namespace RuDigital\ProductEstimator\Includes\Ajax;

use RuDigital\ProductEstimator\Includes\SessionHandler;

/**
 * Product suggestion-related AJAX handlers
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
                error_log('handle_fetch_suggestions_for_modified_room: Calling get_suggestions_for_room with formatted items from IDs: ' . print_r($products_for_suggestion_engine, true) . ' for room_area ' . $room_area);
            }


            $raw_suggestions = $product_additions_manager->get_suggestions_for_room($products_for_suggestion_engine, $room_area);
            $suggestions = array_values($raw_suggestions);

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('handle_fetch_suggestions_for_modified_room: Sending success with ' . count($suggestions) . ' suggestions.');
                error_log('--- handle_fetch_suggestions_for_modified_room AJAX END ---');
            }

            wp_send_json_success([
                'updated_suggestions' => array_values($suggestions),
                'message' => __('Suggestions fetched successfully for modified room state.', 'product-estimator')
            ]);

        } catch (\Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Exception in handle_fetch_suggestions_for_modified_room: ' . $e->getMessage());
                error_log('Trace: ' . $e->getTraceAsString());
            }
            wp_send_json_error([
                'message' => __('An error occurred while fetching suggestions.', 'product-estimator'),
                'error_detail' => $e->getMessage()
            ]);
        }
    }

    /**
     * AJAX handler to generate and return suggested products for a room.
     * MODIFIED: Uses local SessionHandler instance and relies on ensureSessionStarted().
     *
     * @since 1.0.0
     * @since 1.1.0 Modified to use ProductAdditionsFrontend::get_suggestions_for_room()
     * @since x.x.x Refactored for lazy session loading.
     */
    public function generateSuggestions() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');
        $estimate_id = isset($_POST['estimate_id']) ? sanitize_text_field($_POST['estimate_id']) : null;
        $room_id = isset($_POST['room_id']) ? sanitize_text_field($_POST['room_id']) : null;
        $features = product_estimator_features(); // Get feature flags

        if (!$features->suggested_products_enabled) {
            wp_send_json_success([
                'suggestions' => [],
                'estimate_id' => $estimate_id,
                'room_id' => $room_id,
                'message' => sprintf(__('Suggestions are disabled.', 'product-estimator'))
            ]);
        }

        // --- ENHANCED LOGGING START ---
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('--- generateSuggestions AJAX START ---');
            error_log('Raw $_POST data: ' . print_r($_POST, true));
            error_log('Nonce check passed.');
        }
        // --- ENHANCED LOGGING END ---

        // Get estimate_id, room_id, and room_products from POST data

        $room_products_json = isset($_POST['room_products']) ? stripslashes($_POST['room_products']) : '[]'; // Get JSON string, default to empty array JSON

        // Decode the JSON string into a PHP array
        $room_products = json_decode($room_products_json, true);

        // --- ENHANCED LOGGING START ---
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Processed estimate_id: " . ($estimate_id === null ? 'null' : "'{$estimate_id}'"));
            error_log("Processed room_id: " . ($room_id === null ? 'null' : "'{$room_id}'"));
            error_log("Decoded room_products (first 5): " . print_r(array_slice($room_products, 0, 5), true)); // Log first few products
            error_log("Room products count: " . count($room_products));
        }
        // --- ENHANCED LOGGING END ---

        // Validate inputs
        if ($estimate_id === null || $estimate_id === '' || $room_id === null || $room_id === '') {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('generateSuggestions: Missing estimate_id or room_id.');
                error_log('--- generateSuggestions AJAX END (Validation Failed) ---');
            }
            wp_send_json_error(['message' => __('Missing estimate or room ID.', 'product-estimator')]);
            return;
        }

        // Validate room_products array
        if (!is_array($room_products)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('generateSuggestions: room_products is not a valid array after JSON decode.');
                error_log('Raw room_products_json: ' . $room_products_json);
                error_log('--- generateSuggestions AJAX END (Invalid Products Data) ---');
            }
            wp_send_json_error(['message' => __('Invalid product data received.', 'product-estimator')]);
            return;
        }

        $products_in_room = $room_products;

        if (empty($products_in_room)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("generateSuggestions: Passed room_products array is empty. No suggestions generated.");
                error_log('--- generateSuggestions AJAX END (Empty Products Array) ---');
            }
            wp_send_json_success([
                'suggestions' => [],
                'message' => __('No products in room, no suggestions generated.', 'product-estimator')
            ]);
            return;
        }

        try {
            // Get all product IDs currently in this room to avoid suggesting them
            $room_product_ids = [];
            foreach ($products_in_room as $product) {
                if (isset($product['id']) && !empty($product['id']) && (!isset($product['type']) || $product['type'] !== 'note')) {
                    $room_product_ids[] = intval($product['id']);
                }
                if (isset($product['additional_products']) && is_array($product['additional_products'])) {
                    foreach($product['additional_products'] as $additional_product) {
                        if (isset($additional_product['id']) && !empty($additional_product['id']) && (!isset($additional_product['type']) || $additional_product['type'] !== 'note')) {
                            $room_product_ids[] = intval($additional_product['id']);
                        }
                    }
                }
            }
            $room_product_ids = array_unique($room_product_ids);

            $suggestions = [];

            // Ensure ProductAdditionsFrontend class is loaded
            if (!class_exists('\\RuDigital\\ProductEstimator\\Includes\\Frontend\\ProductAdditionsFrontend')) {
                $product_additions_frontend_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/frontend/class-product-additions-frontend.php';
                if (file_exists($product_additions_frontend_path)) {
                    require_once $product_additions_frontend_path;
                } else {
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('generateSuggestions: ProductAdditionsFrontend class file not found.');
                        error_log('--- generateSuggestions AJAX END (Class Not Found) ---');
                    }
                    wp_send_json_error(['message' => __('Suggestion generation module not available.', 'product-estimator')]);
                    return;
                }
            }

            $product_additions_manager = new \RuDigital\ProductEstimator\Includes\Frontend\ProductAdditionsFrontend('product-estimator', PRODUCT_ESTIMATOR_VERSION);

            // Determine room area (needed for pricing suggestions)
            $room_area = 0;
            if (!empty($products_in_room)) {
                $first_product_with_area = reset($products_in_room);
                if (isset($first_product_with_area['room_area'])) {
                    $room_area = floatval($first_product_with_area['room_area']);
                } else {
                    // Fallback: Try to get room dimensions from session
                    $session = SessionHandler::getInstance(); // Get session instance ONLY if needed for fallback
                    $session_room = $session->getRoom($estimate_id, $room_id); // This will ensure session is started if needed
                    if ($session_room && isset($session_room['width']) && isset($session_room['length'])) {
                        $room_area = floatval($session_room['width']) * floatval($session_room['length']);
                    }
                }
            }

            // Use the get_suggestions_for_room method
            $unique_raw_suggestions = $product_additions_manager->get_suggestions_for_room($products_in_room, $room_area); // Pass room_area here

            // Filter out products already in the room and format for frontend
            foreach ($unique_raw_suggestions as $suggestion_id) {
                if (in_array(intval($suggestion_id), $room_product_ids)) {
                    continue;
                }

                $product_obj = wc_get_product($suggestion_id);
                if ($product_obj) {
                    // --- Start: Replicated logic for pricing and formatting ---
                    $pricing_method = 'sqm'; // Default
                    $pricing_rules = get_option('product_estimator_pricing_rules', []);
                    $product_categories = wp_get_post_terms($suggestion_id, 'product_cat', ['fields' => 'ids']);
                    if (!is_wp_error($product_categories)) {
                        foreach ($pricing_rules as $rule) {
                            if (isset($rule['categories']) && is_array($rule['categories']) && !empty(array_intersect($product_categories, $rule['categories']))) {
                                $pricing_method = isset($rule['pricing_method']) ? $rule['pricing_method'] : 'sqm';
                                break;
                            }
                        }
                    }

                    if (function_exists('product_estimator_calculate_total_price_with_additions')) {
                        $price_data = product_estimator_calculate_total_price_with_additions($suggestion_id, $room_area);
                        $min_total = $price_data['min_total'];
                        $max_total = $price_data['max_total'];
                        $has_auto_add = count($price_data['breakdown']) > 1;

                        $suggestions[intval($suggestion_id)] = [
                            'id' => intval($suggestion_id),
                            'name' => $product_obj->get_name(),
                            'image' => wp_get_attachment_image_url($product_obj->get_image_id(), [300,300]) ?: '',
                            'min_price_total' => $min_total,
                            'max_price_total' => $max_total,
                            'pricing_method' => $pricing_method,
                            'has_auto_add' => $has_auto_add
                        ];
                    } else {
                        // Fallback pricing
                        if (defined('WP_DEBUG') && WP_DEBUG) {
                            error_log('generateSuggestions: product_estimator_calculate_total_price_with_additions function not available.');
                        }
                        $suggestions[intval($suggestion_id)] = [
                            'id' => intval($suggestion_id),
                            'name' => $product_obj->get_name(),
                            'image' => wp_get_attachment_image_url($product_obj->get_image_id(), [300,300]) ?: '',
                            'min_price_total' => floatval($product_obj->get_price()),
                            'max_price_total' => floatval($product_obj->get_price()),
                            'pricing_method' => $pricing_method,
                            'has_auto_add' => false
                        ];
                    }
                    // --- End: Replicated logic ---
                }
            }

            $suggestions = array_values($suggestions); // Convert to indexed array

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('generateSuggestions: Sending success response with ' . count($suggestions) . ' suggestions.');
                error_log('--- generateSuggestions AJAX END (Success) ---');
            }
            wp_send_json_success([
                'suggestions' => $suggestions,
                'estimate_id' => $estimate_id,
                'room_id' => $room_id,
                'message' => sprintf(__('%d suggestions generated.', 'product-estimator'), count($suggestions))
            ]);

        } catch (\Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Exception in generateSuggestions: ' . $e->getMessage());
                error_log('Stack trace: ' . $e->getTraceAsString());
                error_log('--- generateSuggestions AJAX END (Exception) ---');
            }
            wp_send_json_error([
                'message' => __('An error occurred while generating suggestions.', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * AJAX handler to get similar products.
     * This remains for any direct calls but is not used by addProductToRoom anymore for its primary similar product fetching.
     * It can still be used by ModalManager.js if it needs to refresh similar products independently.
     */
    public function get_similar_products() {
        check_ajax_referer('product_estimator_nonce', 'nonce');
        $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
        $room_area = isset($_POST['room_area']) ? floatval($_POST['room_area']) : 0; // Get room_area
        $limit = isset($_POST['limit']) ? intval($_POST['limit']) : 5;

        if (!$product_id) {
            wp_send_json_error(['message' => __('Invalid product ID', 'product-estimator')]);
            return;
        }

        // Use the helper function to get the data
        $similar_products_data = $this->fetch_and_format_similar_products($product_id, $room_area, $limit);

        wp_send_json_success([
            'products' => $similar_products_data, // Ensure key is 'products' for consistency with frontend
            'source_product_id' => $product_id,
            'message' => sprintf(__('%d similar products found.', 'product-estimator'), count($similar_products_data))
        ]);
    }


}
