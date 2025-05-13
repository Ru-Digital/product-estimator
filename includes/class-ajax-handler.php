<?php
namespace RuDigital\ProductEstimator\Includes;


/**
 * AJAX Handlers for Product Estimator
 */
class AjaxHandler {
    use \RuDigital\ProductEstimator\Includes\Traits\EstimateDbHandler;


//    /**
//     * @var SessionHandler Session handler instance
//     */
//    private $session;

    /**
     * Initialize the class
     */
    public function __construct() {
        try {
            $features = product_estimator_features(); // Get feature flags
            if ($features->suggested_products_enabled) {
                add_action('wp_ajax_fetch_suggestions_for_modified_room', array($this, 'handle_fetch_suggestions_for_modified_room'));
                add_action('wp_ajax_nopriv_fetch_suggestions_for_modified_room', array($this, 'handle_fetch_suggestions_for_modified_room'));

                add_action('wp_ajax_get_suggested_products', array($this, 'generateSuggestions'));
                add_action('wp_ajax_nopriv_get_suggested_products', array($this, 'generateSuggestions'));
            }

                // Ensure session is started
//            $this->session = SessionHandler::getInstance();

            // Register AJAX handlers
            add_action('wp_ajax_get_rooms_for_estimate', array($this, 'getRoomsForEstimate'));
            add_action('wp_ajax_nopriv_get_rooms_for_estimate', array($this, 'getRoomsForEstimate'));

            add_action('wp_ajax_add_product_to_room', array($this, 'addProductToRoom'));
            add_action('wp_ajax_nopriv_add_product_to_room', array($this, 'addProductToRoom'));

            add_action('wp_ajax_replace_product_in_room', array($this, 'replaceProductInRoom'));
            add_action('wp_ajax_nopriv_replace_product_in_room', array($this, 'replaceProductInRoom'));

            add_action('wp_ajax_get_estimates_list', array($this, 'getEstimatesList'));
            add_action('wp_ajax_nopriv_get_estimates_list', array($this, 'getEstimatesList'));

            add_action('wp_ajax_add_new_estimate', array($this, 'addNewEstimate'));
            add_action('wp_ajax_nopriv_add_new_estimate', array($this, 'addNewEstimate'));

            add_action('wp_ajax_add_new_room', array($this, 'addNewRoom'));
            add_action('wp_ajax_nopriv_add_new_room', array($this, 'addNewRoom'));

            add_action('wp_ajax_check_estimates_exist', array($this, 'checkEstimatesExist'));
            add_action('wp_ajax_nopriv_check_estimates_exist', array($this, 'checkEstimatesExist'));

            add_action('wp_ajax_remove_product_from_room', array($this, 'removeProductFromRoom'));
            add_action('wp_ajax_nopriv_remove_product_from_room', array($this, 'removeProductFromRoom'));

            add_action('wp_ajax_remove_room', array($this, 'removeRoom'));
            add_action('wp_ajax_nopriv_remove_room', array($this, 'removeRoom'));

            add_action('wp_ajax_remove_estimate', array($this, 'removeEstimate'));
            add_action('wp_ajax_nopriv_remove_estimate', array($this, 'removeEstimate'));

            add_action('wp_ajax_get_estimates_data', array($this, 'getEstimatesData'));
            add_action('wp_ajax_nopriv_get_estimates_data', array($this, 'getEstimatesData'));

            add_action('wp_ajax_get_variation_estimator', array($this, 'getVariationEstimator'));
            add_action('wp_ajax_nopriv_get_variation_estimator', array($this, 'getVariationEstimator'));

            add_action('wp_ajax_search_category_products', array($this, 'ajaxSearchCategoryProducts'));
            add_action('wp_ajax_nopriv_search_category_products', array($this, 'ajaxSearchCategoryProducts'));

            add_action('wp_ajax_get_estimate_selection_form', array($this, 'getEstimateSelectionForm'));
            add_action('wp_ajax_nopriv_get_estimate_selection_form', array($this, 'getEstimateSelectionForm'));

            // Register new AJAX handlers for form partials

            add_action('wp_ajax_get_new_estimate_form', array($this, 'getNewEstimateForm'));
            add_action('wp_ajax_nopriv_get_new_estimate_form', array($this, 'getNewEstimateForm'));

            add_action('wp_ajax_get_new_room_form', array($this, 'getNewRoomForm'));
            add_action('wp_ajax_nopriv_get_new_room_form', array($this, 'getNewRoomForm'));

            add_action('wp_ajax_get_room_selection_form', array($this, 'getRoomSelectionForm'));
            add_action('wp_ajax_nopriv_get_room_selection_form', array($this, 'getRoomSelectionForm'));

            add_action('wp_ajax_get_similar_products', array($this, 'get_similar_products'));
            add_action('wp_ajax_nopriv_get_similar_products', array($this, 'get_similar_products'));



            add_action('wp_ajax_update_customer_details', array($this, 'updateCustomerDetails'));
            add_action('wp_ajax_nopriv_update_customer_details', array($this, 'updateCustomerDetails'));

            add_action('wp_ajax_delete_customer_details', array($this, 'deleteCustomerDetails'));
            add_action('wp_ajax_nopriv_delete_customer_details', array($this, 'deleteCustomerDetails'));

            add_action('wp_ajax_get_product_upgrades', array($this, 'get_product_upgrades'));
            add_action('wp_ajax_nopriv_get_product_upgrades', array($this, 'get_product_upgrades'));

            add_action('wp_ajax_get_category_products', array($this, 'get_category_products'));
            add_action('wp_ajax_nopriv_get_category_products', array($this, 'get_category_products'));

            // Register the store session data handler
            add_action('wp_ajax_store_single_estimate', array($this, 'store_single_estimate'));
            add_action('wp_ajax_nopriv_store_single_estimate', array($this, 'store_single_estimate'));

            // In the constructor of AjaxHandler class
//            add_action('wp_ajax_print_estimate', array($this, 'print_estimate'));
//            add_action('wp_ajax_nopriv_print_estimate', array($this, 'print_estimate'));

            add_action('wp_ajax_check_estimate_stored', array($this, 'check_estimate_stored'));
            add_action('wp_ajax_nopriv_check_estimate_stored', array($this, 'check_estimate_stored'));

            add_action('wp_ajax_check_customer_details', array($this, 'check_customer_details'));
            add_action('wp_ajax_nopriv_check_customer_details', array($this, 'check_customer_details'));

            add_action('wp_ajax_request_copy_estimate', array($this, 'request_copy_estimate'));
            add_action('wp_ajax_nopriv_request_copy_estimate', array($this, 'request_copy_estimate'));

            add_action('wp_ajax_get_secure_pdf_url', array($this, 'get_secure_pdf_url'));
            add_action('wp_ajax_nopriv_get_secure_pdf_url', array($this, 'get_secure_pdf_url'));

            add_action('wp_ajax_request_store_contact', array($this, 'request_store_contact'));
            add_action('wp_ajax_nopriv_request_store_contact', array($this, 'request_store_contact'));

            add_action('wp_ajax_get_product_data_for_storage', array($this, 'get_product_data_for_storage'));
            add_action('wp_ajax_nopriv_get_product_data_for_storage', array($this, 'get_product_data_for_storage'));

        } catch (\Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Exception in AjaxHandler constructor: ' . $e->getMessage());
                error_log('Stack trace: ' . $e->getTraceAsString());
            }
        }
    }

    /**
     * AJAX handler to get comprehensive product data for local storage.
     * Ensures room_suggested_products is a numerically indexed array.
     *
     * @since 1.0.0
     */
    public function get_product_data_for_storage() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;

        // Ensure 'null' string from JS is converted to actual null for PHP
        $room_width_raw = $_POST['room_width'] ?? null;
        $room_length_raw = $_POST['room_length'] ?? null;

        $room_width = ($room_width_raw === 'null' || $room_width_raw === null) ? null : floatval($room_width_raw);
        $room_length = ($room_length_raw === 'null' || $room_length_raw === null) ? null : floatval($room_length_raw);

        // --- Parsing block for room_products ---
        $room_products_input = $_POST['room_products'] ?? '';
        $room_products_ids_for_suggestions = [];

        if (is_string($room_products_input) && $room_products_input !== '') {
            $ids_from_string = explode(',', $room_products_input);
            $temp_ids = [];
            foreach ($ids_from_string as $id_str) {
                $trimmed_id_str = trim($id_str);
                if (ctype_digit($trimmed_id_str)) {
                    $id_val = intval($trimmed_id_str);
                    if ($id_val > 0) {
                        $temp_ids[] = $id_val;
                    }
                }
            }
            if (!empty($temp_ids)) {
                $room_products_ids_for_suggestions = array_values(array_unique($temp_ids));
            }
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('AJAX get_product_data_for_storage: Raw room_products_input from POST: \'' . ($_POST['room_products'] ?? 'not set') . '\'');
            error_log('AJAX get_product_data_for_storage: Processed $room_products_ids_for_suggestions (array of IDs): ' . print_r($room_products_ids_for_suggestions, true));
        }
        // --- End of parsing block ---


        if (!$product_id) {
            wp_send_json_error(['message' => __('Product ID is required', 'product-estimator')]);
            return;
        }

        try {
            $product = wc_get_product($product_id);
            if (!$product) {
                wp_send_json_error(['message' => __('Product not found', 'product-estimator')]);
                return;
            }

            $room_area = 0;
            if ($room_width !== null && $room_length !== null && is_numeric($room_width) && is_numeric($room_length)) {
                $room_area = floatval($room_width) * floatval($room_length);
            }

            if (!function_exists('product_estimator_get_product_price')) {
                $helper_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/helpers.php';
                if (file_exists($helper_path)) {
                    require_once $helper_path;
                    if (!function_exists('product_estimator_get_product_price')) {
                        wp_send_json_error(['message' => __('Pricing helper function not available after include attempt.', 'product-estimator')]);
                        return;
                    }
                } else {
                    wp_send_json_error(['message' => __('Pricing helper file not found.', 'product-estimator')]);
                    return;
                }
            }
            $pricing_data = product_estimator_get_product_price($product_id, $room_area, false);

            $product_data = [
                'id' => $product_id,
                'name' => $product->get_name(),
                'image' => wp_get_attachment_image_url($product->get_image_id(), 'thumbnail'),
                'min_price' => $pricing_data['min_price'],
                'max_price' => $pricing_data['max_price'],
                'pricing_method' => $pricing_data['pricing_method'],
                'pricing_source' => $pricing_data['pricing_source'],
                'room_area' => $room_area,
                'additional_products' => [],
                'additional_notes' => [],
                'min_price_total' => 0,
                'max_price_total' => 0,
                'similar_products' => [],
                'room_suggested_products' => [] // Initialize as empty array
            ];

            if ($pricing_data['pricing_method'] === 'sqm' && $room_area > 0) {
                $product_data['min_price_total'] = $pricing_data['min_price'] * $room_area;
                $product_data['max_price_total'] = $pricing_data['max_price'] * $room_area;
            } else {
                $product_data['min_price_total'] = $pricing_data['min_price'];
                $product_data['max_price_total'] = $pricing_data['max_price'];
            }

            $product_id_for_categories = $product->is_type('variation') ? $product->get_parent_id() : $product_id;
            $product_categories = wp_get_post_terms($product_id_for_categories, 'product_cat', array('fields' => 'ids'));
            if (is_wp_error($product_categories)) {
                $product_categories = [];
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('AJAX get_product_data_for_storage: Error fetching product categories: ' . $product_categories->get_error_message());
                }
            }

            $fqcn_pa = '\\RuDigital\\ProductEstimator\\Includes\\Frontend\\ProductAdditionsFrontend';
            $product_additions_frontend_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/frontend/class-product-additions-frontend.php';
            $product_additions_manager = null;

            if (!class_exists($fqcn_pa)) {
                if (file_exists($product_additions_frontend_path)) {
                    require_once $product_additions_frontend_path;
                }
            }

            if (class_exists($fqcn_pa)) {
                try {
                    if (!defined('PRODUCT_ESTIMATOR_VERSION')) {
                        if (function_exists('get_plugin_data') && file_exists(PRODUCT_ESTIMATOR_PLUGIN_DIR . 'product-estimator.php')) {
                            $plugin_data = get_plugin_data(PRODUCT_ESTIMATOR_PLUGIN_DIR . 'product-estimator.php');
                            define('PRODUCT_ESTIMATOR_VERSION', $plugin_data['Version'] ?? '1.0.0');
                        } else {
                            define('PRODUCT_ESTIMATOR_VERSION', '1.0.0');
                        }
                    }
                    $product_additions_manager = new $fqcn_pa('product-estimator', PRODUCT_ESTIMATOR_VERSION);
                } catch (\Throwable $e) {
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('AJAX Handler FATAL: Failed to instantiate ' . $fqcn_pa . '. Error: ' . $e->getMessage());
                    }
                    $product_additions_manager = null;
                }
            }

            if ($product_additions_manager instanceof $fqcn_pa) {
                // Auto-add products and notes logic...
                $auto_add_products_ids = [];
                $auto_add_notes_texts = [];

                if (is_array($product_categories)) {
                    foreach ($product_categories as $category_id) {
                        $cat_auto_add_prods = $product_additions_manager->get_auto_add_products_for_category($category_id);
                        if (!empty($cat_auto_add_prods)) {
                            $auto_add_products_ids = array_merge($auto_add_products_ids, $cat_auto_add_prods);
                        }
                        $cat_auto_add_notes = $product_additions_manager->get_auto_add_notes_for_category($category_id);
                        if (!empty($cat_auto_add_notes)) {
                            $auto_add_notes_texts = array_merge($auto_add_notes_texts, $cat_auto_add_notes);
                        }
                    }
                }
                $auto_add_products_ids = array_values(array_unique($auto_add_products_ids)); // Ensure unique and re-indexed
                $auto_add_notes_texts = array_values(array_unique($auto_add_notes_texts));   // Ensure unique and re-indexed

                foreach ($auto_add_products_ids as $related_product_id) {
                    if ($related_product_id == $product_id) continue;
                    $related_product_obj = wc_get_product($related_product_id);
                    if ($related_product_obj) {
                        $related_pricing_data = product_estimator_get_product_price($related_product_id, $room_area, false);
                        $additional_product_entry = [
                            'id' => $related_product_id,
                            'name' => $related_product_obj->get_name(),
                            'image' => wp_get_attachment_image_url($related_product_obj->get_image_id(), 'thumbnail'),
                            'min_price' => $related_pricing_data['min_price'],
                            'max_price' => $related_pricing_data['max_price'],
                            'pricing_method' => $related_pricing_data['pricing_method'],
                            'min_price_total' => ($related_pricing_data['pricing_method'] === 'sqm' && $room_area > 0) ? $related_pricing_data['min_price'] * $room_area : $related_pricing_data['min_price'],
                            'max_price_total' => ($related_pricing_data['pricing_method'] === 'sqm' && $room_area > 0) ? $related_pricing_data['max_price'] * $room_area : $related_pricing_data['max_price'],
                        ];
                        $product_data['additional_products'][] = $additional_product_entry;
                    }
                }
                foreach ($auto_add_notes_texts as $note_text) {
                    $product_data['additional_notes'][] = ['id' => 'note_' . uniqid(), 'type' => 'note', 'note_text' => $note_text];
                }

                // Generate room suggestions.
                // $room_products_ids_for_suggestions is already an array of product IDs.
                // Format it for get_suggestions_for_room which expects an array of items, each with an 'id' key.

                $features = product_estimator_features(); // Get feature flags

                if ($features->suggested_products_enabled) {
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('AJAX get_product_data_for_storage: Suggested products ENABLED. Generating suggestions.');
                    }
                    // Format $room_products_ids_for_suggestions_context for get_suggestions_for_room
                    // which expects an array of items, each with an 'id' key.
                    $current_room_contents_for_suggestions_formatted = [];
                    foreach ($room_products_ids_for_suggestions as $pid) {
                        $current_room_contents_for_suggestions_formatted[] = ['id' => intval($pid)];
                    }

                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('AJAX get_product_data_for_storage: Calling get_suggestions_for_room with formatted items: ' . print_r($current_room_contents_for_suggestions_formatted, true) . ' for room_area ' . $room_area);
                    }

                    $raw_suggestions = $product_additions_manager->get_suggestions_for_room($current_room_contents_for_suggestions_formatted, $room_area);

                    if (is_array($raw_suggestions)) {
                        // Ensure the suggestions are a numerically indexed array for JSON
                        $product_data['room_suggested_products'] = array_values($raw_suggestions);
                        if (defined('WP_DEBUG') && WP_DEBUG) {
                            error_log('AJAX get_product_data_for_storage: Suggestions returned (and re-indexed): ' . print_r($product_data['room_suggested_products'], true));
                        }
                    } else {
                        // If $raw_suggestions is not an array, default to an empty array.
                        $product_data['room_suggested_products'] = [];
                        if (defined('WP_DEBUG') && WP_DEBUG) {
                            error_log('AJAX get_product_data_for_storage: get_suggestions_for_room did not return an array. Value: ' . print_r($raw_suggestions, true) . '. Defaulting to empty array for room_suggested_products.');
                        }
                    }
                } else {
                    // If suggested_products_enabled is false, ensure room_suggested_products is an empty array.
                    $product_data['room_suggested_products'] = [];
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('AJAX get_product_data_for_storage: Suggested products DISABLED. Setting room_suggested_products to empty array.');
                    }
                }
                // **END MODIFIED PART**

            } else {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('AJAX Handler Warning: ProductAdditionsFrontend manager is NOT available. Auto-add products and suggestions will be skipped.');
                }
                $product_data['room_suggested_products'] = []; // Ensure it's an empty array if manager is not available
            }

            $similar_products_list = $this->fetch_and_format_similar_products($product_id, $room_area);
            $product_data['similar_products'] = $similar_products_list;

            wp_send_json_success([
                'message' => __('Product data retrieved successfully', 'product-estimator'),
                'product_data' => $product_data
            ]);

        } catch (\Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Exception in get_product_data_for_storage: ' . $e->getMessage() . ' at ' . $e->getFile() . ':' . $e->getLine());
                error_log('Trace: ' . $e->getTraceAsString());
            }
            wp_send_json_error([
                'message' => __('An error occurred while retrieving product data', 'product-estimator'),
                'error_detail' => $e->getMessage()
            ]);
        }
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
     * Helper function to fetch and format detailed similar products.
     *
     * @param int $product_id The source product ID.
     * @param float $room_area The area of the room.
     * @param int $limit Maximum number of similar products to return.
     * @return array Array of similar product data.
     */
    private function fetch_and_format_similar_products($product_id, $room_area, $limit = 5) {
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

    public function getVariationEstimator() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Get variation ID
        $variation_id = isset($_POST['variation_id']) ? intval($_POST['variation_id']) : 0;

        if (!$variation_id) {
            wp_send_json_error([
                'message' => __('Variation ID is required', 'product-estimator')
            ]);
            return;
        }

        try {
            // Get variation
            $variation = wc_get_product($variation_id);

            if (!$variation || !$variation->is_type('variation')) {
                throw new \Exception(__('Invalid variation', 'product-estimator'));
            }

            // Check if estimator is enabled for this variation
            if (!\RuDigital\ProductEstimator\Includes\Integration\WoocommerceIntegration::isEstimatorEnabled($variation_id)) {
                throw new \Exception(__('Estimator not enabled for this variation', 'product-estimator'));
            }

            // Get parent product ID
            $parent_id = $variation->get_parent_id();

            // Start output buffer to capture estimator HTML
            ob_start();

            // Include the estimator partial with variation context
            $atts = [
                'title' => __('Product Estimate', 'product-estimator'),
                'button_text' => __('Calculate', 'product-estimator'),
                'product_id' => $variation_id,
                'parent_id' => $parent_id,
                'is_variation' => true
            ];
            include_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-display.php';

            // Get HTML
            $html = ob_get_clean();

            wp_send_json_success([
                'html' => $html
            ]);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => $e->getMessage()
            ]);
        }
    }


    public function checkEstimatesExist() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Force session initialization
        $session = SessionHandler::getInstance();

        // Get all estimates and check if there are any
        $estimates = $session->getEstimates();
        $has_estimates = !empty($estimates);

        wp_send_json_success([
            'has_estimates' => $has_estimates,
            'debug' => [
                'session_id' => session_id(),
                'estimate_count' => count($estimates)
            ]
        ]);
    }

    /**
     * Get rooms for a specific estimate
     */
    public function getRoomsForEstimate() {
        // Verify nonce
        if (!check_ajax_referer('product_estimator_nonce', 'nonce', false)) {
            wp_send_json_error(array(
                'message' => __('Security check failed', 'product-estimator')
            ));
            return;
        }

        // Get estimate_id and sanitize
        $estimate_id = array_key_exists('estimate_id', $_POST) ? sanitize_text_field($_POST['estimate_id']) : null;
        $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;

        if ($estimate_id === '') {
            wp_send_json_error(array(
                'message' => __('No estimate ID provided', 'product-estimator')
            ));
            return;
        }

        // Get the estimate from session
        $session = SessionHandler::getInstance();

        $estimate = $session->getEstimate($estimate_id);

        if (!$estimate) {
            wp_send_json_error(array(
                'message' => __('Estimate not found', 'product-estimator'),
                'debug' => [
                    'request_estimate_id' => $estimate_id,
                    'available_estimates' => array_keys($session->getEstimates())
                ]
            ));
            return;
        }

        // Check if estimate has rooms
        if (!isset($estimate['rooms']) || empty($estimate['rooms'])) {
            // No rooms exist, prepare response to show room creation form
            wp_send_json_success([
                'has_rooms' => false,
                'estimate_id' => $estimate_id,
                'estimate_name' => $estimate['name'] ?? __('Untitled Estimate', 'product-estimator'),
                'product_id' => $product_id,
                'message' => __('This estimate has no rooms. Would you like to create a room?', 'product-estimator')
            ]);
            return;
        }

        // Build rooms array
        $rooms = [];
        foreach ($estimate['rooms'] as $room_id => $room) {
            $rooms[] = [
                'id' => $room_id,
                'name' => $room['name'],
                'dimensions' => sprintf('%dm x %dm', $room['width'], $room['length'])
            ];
        }

        wp_send_json_success([
            'has_rooms' => true,
            'rooms' => $rooms,
            'estimate_name' => isset($estimate['name']) ? $estimate['name'] : __('Untitled Estimate', 'product-estimator'),
            'product_id' => $product_id
        ]);
    }

    /**
     * Modified version of the AjaxHandler addProductToRoom method
     * Removes the reference to storing suggestions in session
     */
    /**
     * Modified version of the AjaxHandler addProductToRoom method
     * Removes the reference to storing suggestions in session
     */
    public function addProductToRoom() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Validate inputs with proper handling for '0'
        if (!isset($_POST['room_id']) || $_POST['room_id'] === '' || (!is_string($_POST['room_id']) && !is_numeric($_POST['room_id']))) {
            error_log('Room ID is missing or invalid in request');
            wp_send_json_error(['message' => __('Room ID is required', 'product-estimator')]);
            return;
        }

        if (!isset($_POST['product_id']) || !intval($_POST['product_id'])) {
            error_log('Product ID is missing or invalid in request');
            wp_send_json_error(['message' => __('Valid Product ID is required', 'product-estimator')]);
            return;
        }

        // Get params, ensure consistent types for comparison
        $room_id = (string)$_POST['room_id']; // Force string conversion
        $product_id = intval($_POST['product_id']);
        $estimate_id = isset($_POST['estimate_id']) ? (string)$_POST['estimate_id'] : '';

        try {
            // Get all estimates from session
            $session = SessionHandler::getInstance();
            $estimates = $session->getEstimates();

            // If an estimate ID was explicitly provided
            if (!empty($estimate_id)) {
                // Make sure the estimate exists
                if (!isset($estimates[$estimate_id])) {
                    error_log("Specified estimate not found: $estimate_id");
                    wp_send_json_error([
                        'message' => __('Specified estimate not found', 'product-estimator'),
                        'debug' => [
                            'estimate_id' => $estimate_id,
                            'available_estimates' => array_keys($estimates)
                        ]
                    ]);
                    return;
                }

                // Make sure the room exists in this estimate
                if (!isset($estimates[$estimate_id]['rooms'][$room_id])) {
                    error_log("Room not found in specified estimate: $room_id in $estimate_id");
                    wp_send_json_error([
                        'message' => __('Room not found in specified estimate', 'product-estimator'),
                        'debug' => [
                            'estimate_id' => $estimate_id,
                            'room_id' => $room_id
                        ]
                    ]);
                    return;
                }

                $found_estimate_id = $estimate_id;
                $found_room_id = $room_id;
            } else {
                // We need to find which estimate contains this room
                $found_estimate_id = null;
                $found_room_id = null;

                // Loop through all estimates to find the room
                foreach ($estimates as $est_id => $estimate) {
                    if (isset($estimate['rooms']) && is_array($estimate['rooms'])) {
                        foreach (array_keys($estimate['rooms']) as $r_id) {
                            // Use string comparison to avoid type issues
                            if ((string)$r_id === (string)$room_id) {
                                $found_estimate_id = $est_id;
                                $found_room_id = $r_id;
                                break 2;
                            }
                        }
                    }
                }
            }

            // Validate found estimate and room
            if ($found_estimate_id === null || $found_room_id === null) {
                wp_send_json_error([
                    'message' => __('Room not found in any estimate', 'product-estimator'),
                    'debug' => [
                        'room_id' => $room_id,
                        'product_id' => $product_id,
                        'available_estimates' => array_keys($estimates)
                    ]
                ]);
                return;
            }

            // Use common method to prepare and add product to room
            $result = $this->prepareAndAddProductToRoom($product_id, $found_estimate_id, $found_room_id);

            if (!$result['success']) {
                // Check if this is a duplicate product case
                if (isset($result['duplicate']) && $result['duplicate']) {
                    wp_send_json_error([
                        'message' => $result['message'],
                        'duplicate' => true,
                        'estimate_id' => $result['estimate_id'],
                        'room_id' => $result['room_id']
                    ]);
                    return;
                }

                wp_send_json_error([
                    'message' => $result['message'],
                    'debug' => $result['debug'] ?? null
                ]);
                return;
            }

            wp_send_json_success([
                'message' => $result['message'],
                'estimate_id' => $found_estimate_id,
                'room_id' => $found_room_id,
                'product_data' => $result['product_data'],
                'added_notes' => $result['added_notes'] ?? 0,
                'has_products' => true
            ]);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Modified version of the getEstimatesList method
     * Removes suggestion generation code
     */
    public function getEstimatesList() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Make sure the LabelsFrontend class is available
        if (!class_exists('\\RuDigital\\ProductEstimator\\Includes\\Frontend\\LabelsFrontend')) {
            require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/frontend/class-labels-frontend.php';
        }

        // Get the global labels_frontend instance or create a new one
        global $product_estimator_labels_frontend;
        if (!isset($product_estimator_labels_frontend) || is_null($product_estimator_labels_frontend)) {
            $product_estimator_labels_frontend = new \RuDigital\ProductEstimator\Includes\Frontend\LabelsFrontend('product-estimator', PRODUCT_ESTIMATOR_VERSION);
        }

        // Start output buffer to capture HTML
        ob_start();

        // Get all estimates
        $session = SessionHandler::getInstance();

        $estimates = $session->getEstimates();

        // We no longer need to generate suggestions here
        // The template will handle this at render time

        // Include the estimates portion of the modal template
        include_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-estimates-list.php';

        // Get the HTML
        $html = ob_get_clean();

        // Send success response with HTML
        wp_send_json_success(array(
            'html' => $html
        ));
    }

    /**
     * Get estimates data for dropdown
     */
    public function getEstimatesData() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Force session initialization
        $session = SessionHandler::getInstance();

        // Get all estimates
        $estimates = $session->getEstimates();

        // Format for the frontend
        $formatted_estimates = [];
        foreach ($estimates as $id => $estimate) {
            $formatted_estimates[] = [
                'id' => $id,
                'name' => isset($estimate['name']) ? $estimate['name'] : __('Untitled Estimate', 'product-estimator'),
                'rooms' => isset($estimate['rooms']) ? $estimate['rooms'] : []
            ];
        }

        wp_send_json_success([
            'estimates' => $formatted_estimates
        ]);
    }

    /**
     * Handle new estimate submission
     * Modified to use the CustomerDetails class
     */
    public function addNewEstimate() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'product_estimator_nonce')) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Nonce verification failed');
            }
            wp_send_json_error(['message' => __('Security check failed.', 'product-estimator')]);
            return;
        }

        if (!isset($_POST['form_data'])) {
            wp_send_json_error(['message' => __('No form data provided', 'product-estimator')]);
            return;
        }

        // Parse form data
        parse_str($_POST['form_data'], $form_data);

        // Validate estimate name
        if (empty($form_data['estimate_name'])) {
            wp_send_json_error(['message' => __('Estimate name is required', 'product-estimator')]);
            return;
        }

        try {
            // Force session initialization

            // Check if CustomerDetails class exists and is accessible
            if (!class_exists('\\RuDigital\\ProductEstimator\\Includes\\CustomerDetails')) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('CustomerDetails class not found, including directly');
                }
                // Include it directly if needed
                require_once dirname(__FILE__) . '/class-customer-details.php';
            }

            // Initialize CustomerDetails class with error handling
            try {
                $customer_details_manager = new CustomerDetails();
            } catch (\Exception $e) {
                error_log('Error initializing CustomerDetails: ' . $e->getMessage());
                // Fallback to basic handling without CustomerDetails class
                $customer_details = [
                    'name' => isset($form_data['customer_name']) ? sanitize_text_field($form_data['customer_name']) : '',
                    'email' => isset($form_data['customer_email']) ? sanitize_email($form_data['customer_email']) : '',
                    'phone' => isset($form_data['customer_phone']) ? sanitize_text_field($form_data['customer_phone']) : '',
                    'postcode' => isset($form_data['customer_postcode']) ? sanitize_text_field($form_data['customer_postcode']) : ''
                ];

                // Store in session directly using the standard key
                if (!isset($_SESSION['product_estimator'])) {
                    $_SESSION['product_estimator'] = [];
                }
                $_SESSION['product_estimator']['customer_details'] = $customer_details;

                // Get default markup from pricing rules settings
             $pricing_rules = get_option('product_estimator_pricing_rules');
            $default_markup = isset($pricing_rules['default_markup']) ? floatval($pricing_rules['default_markup']) : 0;

                // Create new estimate data
                $estimate_data = [
                    'name' => sanitize_text_field($form_data['estimate_name']),
                    'created_at' => current_time('mysql'),
                    'rooms' => [],
                    'customer_details' => $customer_details,
                    'plugin_version' => PRODUCT_ESTIMATOR_VERSION,
                    'default_markup' => $default_markup
                ];
                $session = SessionHandler::getInstance();

                $estimate_id = $session->addEstimate($estimate_data);

                wp_send_json_success([
                    'message' => __('Estimate created successfully (fallback mode)', 'product-estimator'),
                    'estimate_id' => $estimate_id,
                    'has_customer_details' => true
                ]);
                return;
            }

            // Check if we need to save customer details
            $save_customer_details = false;
            $customer_details = [];

            if (!$customer_details_manager->hasCompleteDetails()) {
                // Validate and process customer details from form
                $validated_details = $customer_details_manager->validateFormData($form_data);

                if (is_wp_error($validated_details)) {
                    wp_send_json_error(['message' => $validated_details->get_error_message()]);
                    return;
                }

                // Save validated details
                $customer_details_manager->setDetails($validated_details);
                $customer_details = $validated_details;
                $save_customer_details = true;
            } else {
                // Use existing details
                $customer_details = $customer_details_manager->getDetails();
            }

            $pricing_rules = get_option('product_estimator_pricing_rules');
            $default_markup = isset($pricing_rules['default_markup']) ? floatval($pricing_rules['default_markup']) : 0;

            // Create new estimate data
            $estimate_data = [
                'name' => sanitize_text_field($form_data['estimate_name']),
                'created_at' => current_time('mysql'),
                'rooms' => [],
                'customer_details' => $customer_details,
                'plugin_version' => PRODUCT_ESTIMATOR_VERSION,
                'default_markup' => $default_markup
            ];

            // Add estimate to session
            $session = SessionHandler::getInstance();

            $estimate_id = $session->addEstimate($estimate_data);

            if (!$estimate_id && $estimate_id !== '0') { // Check for both false and non-zero values
                wp_send_json_error(['message' => __('Failed to create estimate', 'product-estimator')]);
                return;
            }

            wp_send_json_success([
                'message' => __('Estimate created successfully', 'product-estimator'),
                'estimate_id' => $estimate_id,
                'has_customer_details' => true
            ]);

        } catch (\Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Exception in addNewEstimate: ' . $e->getMessage());
                error_log('Stack trace: ' . $e->getTraceAsString());
            }
            wp_send_json_error(['message' => $e->getMessage()]);
        }
    }

    /**
     * Handle new room submission
     */
    public function addNewRoom() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        if (!isset($_POST['form_data']) || !isset($_POST['estimate_id'])) {
            error_log('Required parameters missing in request');
            wp_send_json_error(['message' => __('Required parameters missing', 'product-estimator')]);
            return;
        }

        $estimate_id = sanitize_text_field($_POST['estimate_id']);
        $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;

        // Parse form data
        parse_str($_POST['form_data'], $form_data);

        // Validate room data
        if (empty($form_data['room_name'])) {
            error_log('Room name is missing');
            wp_send_json_error(['message' => __('Room name is required', 'product-estimator')]);
            return;
        }

        if (!isset($form_data['room_width']) || !is_numeric($form_data['room_width'])) {
            error_log('Invalid room width: ' . print_r($form_data['room_width'] ?? 'not set', true));
            wp_send_json_error(['message' => __('Valid room width is required', 'product-estimator')]);
            return;
        }

        if (!isset($form_data['room_length']) || !is_numeric($form_data['room_length'])) {
            error_log('Invalid room length: ' . print_r($form_data['room_length'] ?? 'not set', true));
            wp_send_json_error(['message' => __('Valid room length is required', 'product-estimator')]);
            return;
        }

        try {
            // Force session initialization

            // Create room data with explicit values - USING STRICT TYPE CONVERSION
            $room_width = (float)$form_data['room_width'];
            $room_length = (float)$form_data['room_length'];
            $room_name = sanitize_text_field($form_data['room_name']);

            $room_data = [
                'name' => $room_name,
                'width' => $room_width,
                'length' => $room_length,
                'products' => []
            ];

            // Add room to estimate
            $session = SessionHandler::getInstance();

            $room_id = $session->addRoom($estimate_id, $room_data);

            if ($room_id === false) {
                error_log('Failed to add room: session returned false');
                wp_send_json_error([
                    'message' => __('Failed to add room to estimate', 'product-estimator'),
                    'debug' => [
                        'estimate_id' => $estimate_id,
                        'room_data' => $room_data
                    ]
                ]);
                return;
            }

            // Verify room was added correctly
            $session = SessionHandler::getInstance();

            $updated_estimates = $session->getEstimates();

            // Check if the room exists with correct data
            if (isset($updated_estimates[$estimate_id]['rooms'][$room_id])) {
                $saved_room = $updated_estimates[$estimate_id]['rooms'][$room_id];

                // Verify dimensions match
                if ((float)$saved_room['width'] != $room_width || (float)$saved_room['length'] != $room_length) {
                    error_log("WARNING: Saved room dimensions don't match input dimensions!");
                    error_log("Expected: width=$room_width, length=$room_length");
                    error_log("Actual: width={$saved_room['width']}, length={$saved_room['length']}");
                }
            } else {
                error_log("ERROR: Room ID $room_id not found in estimate $estimate_id after save!");
            }

            // If a product ID was provided, add it to the room
            $product_added = false;
            $product_data = null;
            if ($product_id > 0) {
                // Use common method to prepare and add product to room - PASS THE EXACT DIMENSIONS
                $result = $this->prepareAndAddProductToRoom(
                    $product_id,
                    $estimate_id,
                    $room_id,
                    $room_width,   // Pass the original width value
                    $room_length   // Pass the original length value
                );
                $product_added = $result['success'];

                if ($product_added) {
                    $product_data = $result['product_data'];

                    // Get the updated room data to check for products
                    $updated_room = $session->getRoom($estimate_id, $room_id);
                }
            }

            // Final check of session data
            $final_estimates = $session->getEstimates();

            wp_send_json_success([
                'message' => __('Room added successfully', 'product-estimator'),
                'estimate_id' => $estimate_id,
                'room_id' => $room_id,
                'product_added' => $product_added,
                'product_data' => $product_data,
                'room_data' => [  // Return the exact room data we sent to the session
                    'name' => $room_name,
                    'width' => $room_width,
                    'length' => $room_length
                ],
                // Include suggestions in the response if available
                'has_suggestions' => false
            ]);

        } catch (Exception $e) {
            error_log('Exception in addNewRoom: ' . $e->getMessage());
            error_log('Exception trace: ' . $e->getTraceAsString());
            error_log('=== NEW ROOM SUBMISSION - ERROR END ===');

            wp_send_json_error([
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * AJAX handler to remove a product from a room based on Product ID.
     */
    public function removeProductFromRoom() {
        // Verify nonce security check
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // --- MODIFIED: Expect product_id instead of just product_index ---
        if (!isset($_POST['estimate_id']) || !isset($_POST['room_id']) || !isset($_POST['product_id'])) {
            wp_send_json_error(['message' => __('Required parameters missing (estimate_id, room_id, product_id)', 'product-estimator')]);
            return;
        }

        $estimate_id = sanitize_text_field($_POST['estimate_id']);
        $room_id = sanitize_text_field($_POST['room_id']);
        $product_id_to_remove = sanitize_text_field($_POST['product_id']); // Get the product ID to remove

        // Optional: Keep product_index if needed elsewhere, but don't rely on it for finding
        // $product_index_from_post = isset($_POST['product_index']) ? intval($_POST['product_index']) : null;

        try {
            // Get the estimate data from the session
            $session = SessionHandler::getInstance();

            $estimate = $session->getEstimate($estimate_id);

            if (!$estimate) {
                wp_send_json_error(['message' => __('Estimate not found in session', 'product-estimator')]);
                return;
            }

            // Check if the specified room exists within the estimate
            if (!isset($estimate['rooms'][$room_id])) {
                wp_send_json_error(['message' => __('Room not found in this estimate', 'product-estimator')]);
                return;
            }

            // Check if the room's products array exists and is actually an array
            if (!isset($estimate['rooms'][$room_id]['products']) || !is_array($estimate['rooms'][$room_id]['products'])) {
                wp_send_json_error(['message' => __('No products found in this room', 'product-estimator')]);
                return;
            }

            $products_in_room = $estimate['rooms'][$room_id]['products'];

            // --- MODIFIED: Find the actual index of the product using product_id ---
            $actual_product_index = -1; // Initialize index as not found
            foreach ($products_in_room as $index => $product) {
                // Ensure the product has an 'id' key before comparing
                // Compare IDs (use string comparison for robustness if types might differ)
                if (isset($product['id']) && (string)$product['id'] === (string)$product_id_to_remove) {
                    $actual_product_index = $index; // Store the found index
                    break; // Exit the loop once the product is found
                }
            }

            // Check if the product was found by its ID
            if ($actual_product_index === -1) {
                wp_send_json_error(['message' => sprintf(__('Product with ID %s not found in this room', 'product-estimator'), esc_html($product_id_to_remove))]);
                return;
            }
            // --- END MODIFIED ---

            // Remove the product from the session using the *found index*
            // (Assuming $this->session->removeProductFromRoom still requires the index)
            $removed = $session->removeProductFromRoom($estimate_id, $room_id, $actual_product_index);

            if (!$removed) {
                // This might indicate an issue within the session removal logic itself
                wp_send_json_error(['message' => __('Failed to remove product from session data', 'product-estimator')]);
                return;
            }

            // Update estimate totals after successful removal
            $this->updateTotals($estimate_id);

            // Get the updated room data to check if any products remain (for suggestion logic)
            $updatedRoom = $session->getRoom($estimate_id, $room_id);
            $show_suggestions = !empty($updatedRoom['products']);

            // Send a success response
            wp_send_json_success([
                'message' => __('Product removed successfully', 'product-estimator'),
                'show_suggestions' => $show_suggestions, // Let frontend know if suggestions might still be relevant
                'estimate_id' => $estimate_id,        // Return IDs to help frontend maintain state
                'room_id' => $room_id,
                'removed_product_id' => $product_id_to_remove // Confirm which product ID was removed
            ]);

        } catch (\Exception $e) {
            // Catch any unexpected exceptions during the process
            error_log("Error in removeProductFromRoom AJAX handler: " . $e->getMessage()); // Log the actual error server-side
            wp_send_json_error([
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error_details' => $e->getMessage() // Optionally include details in debug mode
            ]);
        }
    }

    /**
     * Remove a room from an estimate
     */
    public function removeRoom()
    {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        if (!isset($_POST['estimate_id']) || !isset($_POST['room_id'])) {
            wp_send_json_error(['message' => __('Required parameters missing', 'product-estimator')]);
            return;
        }

        $estimate_id = sanitize_text_field($_POST['estimate_id']);
        $room_id = sanitize_text_field($_POST['room_id']);

        try {
            // Get the estimate from session
            $session = SessionHandler::getInstance();

            $estimate = $session->getEstimate($estimate_id);

            if (!$estimate) {
                wp_send_json_error(['message' => __('Estimate not found', 'product-estimator')]);
                return;
            }

            // Check if the room exists
            if (!isset($estimate['rooms'][$room_id])) {
                wp_send_json_error(['message' => __('Room not found in this estimate', 'product-estimator')]);
                return;
            }

            // Remove the room
            $removed = $session->removeRoom($estimate_id, $room_id);

            if (!$removed) {
                wp_send_json_error(['message' => __('Failed to remove room from estimate', 'product-estimator')]);
                return;
            }

            // Update totals after removing the room
            $this->updateTotals($estimate_id);

            // Check if the estimate has any rooms left
            $updated_estimate = $session->getEstimate($estimate_id);
            $has_rooms = !empty($updated_estimate['rooms']);

            wp_send_json_success([
                'message' => __('Room and all its products removed successfully', 'product-estimator'),
                'has_rooms' => $has_rooms,
                'estimate_id' => $estimate_id
            ]);

        } catch (\Exception $e) {
            error_log('Exception in removeRoom: ' . $e->getMessage());

            wp_send_json_error([
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }
    }


    /**
     * Remove an entire estimate
     */
    public function removeEstimate() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        if (!isset($_POST['estimate_id'])) {
            wp_send_json_error(['message' => __('Estimate ID is required', 'product-estimator')]);
            return;
        }

        $estimate_id = sanitize_text_field($_POST['estimate_id']);

        try {
            // Get the estimate from session
            $session = SessionHandler::getInstance();

            $estimate = $session->getEstimate($estimate_id);

            if (!$estimate) {
                wp_send_json_error(['message' => __('Estimate not found', 'product-estimator')]);
                return;
            }

            // Add debug logging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("Removing estimate ID: {$estimate_id}");
            }

            // Remove the estimate
            $removed = $session->removeEstimate($estimate_id);

            if (!$removed) {
                wp_send_json_error(['message' => __('Failed to remove estimate', 'product-estimator')]);
                return;
            }

            wp_send_json_success([
                'message' => __('Estimate removed successfully', 'product-estimator'),
                'estimate_id' => $estimate_id
            ]);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Update room and estimate totals in session via SessionHandler.
     * MODIFIED: Fetches and saves estimate data through SessionHandler, avoiding direct $_SESSION access.
     *
     * @param string|int $estimate_id Estimate ID
     * @return void
     */
    private function updateTotals($estimate_id) {
        // Get the SessionHandler instance
        $session = SessionHandler::getInstance();

        // Fetch the current estimate data through the handler.
        // This ensures the session is started correctly via ensureSessionStarted() if needed.
        $estimate = $session->getEstimate($estimate_id); // Assumes getEstimate handles ensureSessionStarted

        if (!$estimate) {
            // Log the error if the estimate wasn't found in the session
            error_log("Product Estimator (AjaxHandler::updateTotals): Cannot update totals - estimate ID '{$estimate_id}' not found in session via SessionHandler.");
            return; // Cannot proceed without estimate data
        }

        // --- Start: Calculation Logic (operates on the local $estimate array) ---
        $default_markup = isset($estimate['default_markup']) ? floatval($estimate['default_markup']) : 0;
        $pricing_rules = get_option('product_estimator_pricing_rules', []); // Getting options is fine

        $estimate_min_total = 0;
        $estimate_max_total = 0;

        if (isset($estimate['rooms']) && is_array($estimate['rooms'])) {
            foreach ($estimate['rooms'] as $room_id => &$room) { // Use reference to modify room directly in $estimate array
                $room_min_total = 0;
                $room_max_total = 0;
                $room_width = isset($room['width']) ? floatval($room['width']) : 0;
                $room_length = isset($room['length']) ? floatval($room['length']) : 0;
                $room_area = ($room_width > 0 && $room_length > 0) ? ($room_width * $room_length) : 0;

                if (isset($room['products']) && is_array($room['products'])) {
                    foreach ($room['products'] as &$product) { // Use reference to modify product directly
                        if (isset($product['type']) && $product['type'] === 'note') {
                            continue; // Skip notes
                        }

                        $product_id = isset($product['id']) ? intval($product['id']) : 0;
                        $pricing_method = isset($product['pricing_method']) ? $product['pricing_method'] : 'sqm'; // Default

                        // Dynamically determine pricing method if not set and product ID exists
                        if ($product_id > 0 && !isset($product['pricing_method'])) {
                            $product_categories = wp_get_post_terms($product_id, 'product_cat', ['fields' => 'ids']);
                            if (!is_wp_error($product_categories) && !empty($product_categories)) {
                                foreach ($pricing_rules as $rule) {
                                    if (isset($rule['categories']) && is_array($rule['categories']) && !empty(array_intersect($product_categories, $rule['categories']))) {
                                        $pricing_method = isset($rule['pricing_method']) ? $rule['pricing_method'] : 'sqm';
                                        break; // Found matching rule
                                    }
                                }
                            }
                            $product['pricing_method'] = $pricing_method; // Store determined method back into the product array
                        }

                        // Calculate main product prices
                        $product_min_val = 0;
                        $product_max_val = 0;
                        if (isset($product['min_price']) && isset($product['max_price'])) {
                            $min_price = floatval($product['min_price']); // Markup application removed as per original?
                            $max_price = floatval($product['max_price']); // Re-add if needed: * (1 + ($default_markup / 100));

                            if ($pricing_method === 'sqm' && $room_area > 0) {
                                $product_min_val = $min_price * $room_area;
                                $product_max_val = $max_price * $room_area;
                            } else { // Fixed pricing or zero area
                                $product_min_val = $min_price;
                                $product_max_val = $max_price;
                            }
                        } elseif (isset($product['min_price_total']) && isset($product['max_price_total'])) {
                            // Use pre-calculated totals if unit prices aren't available
                            $product_min_val = floatval($product['min_price_total']); // Markup application removed?
                            $product_max_val = floatval($product['max_price_total']); // Re-add if needed
                        }

                        // Store calculated totals back into the product array
                        $product['min_price_total'] = $product_min_val;
                        $product['max_price_total'] = $product_max_val;

                        // Add main product totals to room totals
                        $room_min_total += $product_min_val;
                        $room_max_total += $product_max_val;

                        // Calculate additional products prices
                        if (isset($product['additional_products']) && is_array($product['additional_products'])) {
                            foreach ($product['additional_products'] as &$additional_product) { // Use reference
                                $add_product_id = isset($additional_product['id']) ? intval($additional_product['id']) : 0;
                                $add_pricing_method = isset($additional_product['pricing_method']) ? $additional_product['pricing_method'] : $pricing_method; // Default to main product's method

                                // Determine pricing method for additional product if not set
                                if ($add_product_id > 0 && !isset($additional_product['pricing_method'])) {
                                    $add_product_categories = wp_get_post_terms($add_product_id, 'product_cat', ['fields' => 'ids']);
                                    if (!is_wp_error($add_product_categories) && !empty($add_product_categories)) {
                                        foreach ($pricing_rules as $rule) {
                                            if (isset($rule['categories']) && is_array($rule['categories']) && !empty(array_intersect($add_product_categories, $rule['categories']))) {
                                                $add_pricing_method = isset($rule['pricing_method']) ? $rule['pricing_method'] : 'sqm';
                                                break;
                                            }
                                        }
                                    }
                                    $additional_product['pricing_method'] = $add_pricing_method;
                                }

                                // Calculate additional product totals
                                $add_min_val = 0;
                                $add_max_val = 0;
                                if (isset($additional_product['min_price']) && isset($additional_product['max_price'])) {
                                    $add_min_price = floatval($additional_product['min_price']);
                                    $add_max_price = floatval($additional_product['max_price']);
                                    if ($add_pricing_method === 'sqm' && $room_area > 0) {
                                        $add_min_val = $add_min_price * $room_area;
                                        $add_max_val = $add_max_price * $room_area;
                                    } else {
                                        $add_min_val = $add_min_price;
                                        $add_max_val = $add_max_price;
                                    }
                                } elseif (isset($additional_product['min_price_total']) && isset($additional_product['max_price_total'])) {
                                    $add_min_val = floatval($additional_product['min_price_total']);
                                    $add_max_val = floatval($additional_product['max_price_total']);
                                }

                                // Store calculated totals back into the additional product array
                                $additional_product['min_price_total'] = $add_min_val;
                                $additional_product['max_price_total'] = $add_max_val;

                                // Add additional product totals to room totals
                                $room_min_total += $add_min_val;
                                $room_max_total += $add_max_val;

                            } // End foreach additional_product
                            unset($additional_product); // Unset reference
                        } // End if additional_products exist
                    } // End foreach product
                    unset($product); // Unset reference
                } // End if room products exist

                // Store calculated room totals back into the $room array (which is a reference)
                $room['min_total'] = $room_min_total;
                $room['max_total'] = $room_max_total;

                // Add room totals to estimate totals
                $estimate_min_total += $room_min_total;
                $estimate_max_total += $room_max_total;

            } // End foreach room
            unset($room); // Unset reference
        } // End if estimate rooms exist
        // --- End: Calculation Logic ---

        // Store calculated estimate totals back into the $estimate array
        $estimate['min_total'] = $estimate_min_total;
        $estimate['max_total'] = $estimate_max_total;

        // SAVE the updated $estimate array back to the session via the SessionHandler
        // Assumes you have added updateEstimateData() method to SessionHandler
        if (!$session->updateEstimateData($estimate_id, $estimate)) {
            error_log("Product Estimator (AjaxHandler::updateTotals): Failed to save updated totals for estimate ID '{$estimate_id}' via SessionHandler.");
        } else {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("Product Estimator (AjaxHandler::updateTotals): Successfully updated totals for estimate ID '{$estimate_id}'.");
            }
        }
    } // End updateTotals method


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
     * Helper method to prepare product data and add to room
     *
     * @param int $product_id The product ID
     * @param string|int $estimate_id The estimate ID
     * @param string|int $room_id The room ID
     * @param float $room_width Room width (optional, will use existing room data if not provided)
     * @param float $room_length Room length (optional, will use existing room data if not provided)
     * @return array Result with status and product data
     */
    /**
     * Helper method to prepare product data and add to room
     *
     * @param int $product_id The product ID
     * @param string|int $estimate_id The estimate ID
     * @param string|int $room_id The room ID
     * @param float $room_width Room width (optional, will use existing room data if not provided)
     * @param float $room_length Room length (optional, will use existing room data if not provided)
     * @return array Result with status and product data
     */
    /**
     * Modified version of the method in class-ajax-handler.php
     *
     * This fixes the issue with product variations not correctly following
     * the parent product's category product additions.
     */
    /**
     * Helper method to prepare product data and add to room
     *
     * @param int $product_id The product ID
     * @param string|int $estimate_id The estimate ID
     * @param string|int $room_id The room ID
     * @param float $room_width Room width (optional, will use existing room data if not provided)
     * @param float $room_length Room length (optional, will use existing room data if not provided)
     * @return array Result with status and product data
     */
    public function prepareAndAddProductToRoom($product_id, $estimate_id, $room_id, $room_width = null, $room_length = null) {
        try {
            // First, check if this product already exists in the room
            $session = SessionHandler::getInstance();

            $estimate = $session->getEstimate($estimate_id);

            if ($estimate && isset($estimate['rooms'][$room_id]['products'])) {
                foreach ($estimate['rooms'][$room_id]['products'] as $existing_product) {
                    // Check if this is a product (not a note) and has matching ID
                    if (!isset($existing_product['type']) &&
                        isset($existing_product['id']) &&
                        intval($existing_product['id']) === intval($product_id)) {

                        // Product already exists in this room
                        return [
                            'success' => false,
                            'duplicate' => true,
                            'message' => __('This product already exists in the selected room.', 'product-estimator'),
                            'estimate_id' => $estimate_id,
                            'room_id' => $room_id
                        ];
                    }
                }
            }

            // Get product data
            $product = wc_get_product($product_id);
            if (!$product) {
                return [
                    'success' => false,
                    'message' => __('Product not found', 'product-estimator')
                ];
            }

            // Calculate room area
            $room_area = 0;

            // If room dimensions were provided directly
            if ($room_width !== null && $room_length !== null) {
                $room_area = (float)$room_width * (float)$room_length;
            } else {
                // Get room dimensions from session
                $estimates = $session->getEstimates();
                if (isset($estimates[$estimate_id]['rooms'][$room_id])) {
                    $room_data = $estimates[$estimate_id]['rooms'][$room_id];
                    if (isset($room_data['width']) && isset($room_data['length'])) {
                        $room_area = (float)$room_data['width'] * (float)$room_data['length'];
                    }
                }
            }
            // Get markup from estimate if available
            $default_markup = isset($estimate['default_markup']) ? floatval($estimate['default_markup']) : 0;
            if ($default_markup === 0) {
                // Fall back to global settings
                $pricing_rules = get_option('product_estimator_pricing_rules');
                $default_markup = isset($pricing_rules['default_markup']) ? floatval($pricing_rules['default_markup']) : 0;
            }

            // Get pricing data using our helper function
            $pricing_data = product_estimator_get_product_price($product_id, $room_area, false); // Don't apply markup here

            // Get pricing method and source
            $pricing_method = $pricing_data['pricing_method'];
            $pricing_source = $pricing_data['pricing_source'];
            $min_price = $pricing_data['min_price'];
            $max_price = $pricing_data['max_price'];

            // Prepare base product data
            $product_data = [
                'id' => $product_id,
                'name' => $product->get_name(),
                'image' => wp_get_attachment_image_url($product->get_image_id(), 'thumbnail'),
                'min_price' => $min_price,
                'max_price' => $max_price,
                'pricing_method' => $pricing_method,
                'pricing_source' => $pricing_source,
                'room_area' => $room_area,
                'additional_products' => [],
                'additional_notes' => []
            ];

            // Calculate price totals based on pricing method
            if ($pricing_method === 'sqm' && $room_area > 0) {
                // Per square meter pricing - multiply by room area
                $min_total = $min_price * $room_area;
                $max_total = $max_price * $room_area;

                $product_data['min_price_total'] = $min_total;
                $product_data['max_price_total'] = $max_total;
            } else {
                // Fixed pricing - use price directly as total (already rounded)
                $product_data['min_price_total'] = $min_price;
                $product_data['max_price_total'] = $max_price;
            }

            // PRODUCT ADDITIONS - auto-add related products and notes
            $auto_add_products = array();
            $auto_add_notes = array();

            // Get product ID for categories - FIXED: For variations, use parent product ID
            $product_id_for_categories = $product_id;

            // Check if this is a variation
            if ($product->is_type('variation')) {
                // Get the parent product ID for getting categories
                $product_id_for_categories = $product->get_parent_id();
            }

            // Now get the categories using the appropriate product ID
            $product_categories = wp_get_post_terms($product_id_for_categories, 'product_cat', array('fields' => 'ids'));
            $product_additions_manager = new \RuDigital\ProductEstimator\Includes\Frontend\ProductAdditionsFrontend('product-estimator', PRODUCT_ESTIMATOR_VERSION);

            // Check if ProductAdditionsManager is accessible
            if ($product_additions_manager) {

                foreach ($product_categories as $category_id) {
                    // Get auto-add products
                    $category_auto_add_products = $product_additions_manager->get_auto_add_products_for_category($category_id);

                    if (!empty($category_auto_add_products)) {
                        $auto_add_products = array_merge($auto_add_products, $category_auto_add_products);
                    }

                    // Get auto-add notes
                    $category_auto_add_notes = $product_additions_manager->get_auto_add_notes_for_category($category_id);
                    if (!empty($category_auto_add_notes)) {
                        $auto_add_notes = array_merge($auto_add_notes, $category_auto_add_notes);
                    }
                }

                // Remove duplicates
                $auto_add_products = array_unique($auto_add_products);
                $auto_add_notes = array_unique($auto_add_notes);

                // Handle auto-add products
                foreach ($auto_add_products as $related_product_id) {
                    // Skip if it's the same product we just added (to avoid loops)
                    if ($related_product_id == $product_id) {
                        continue;
                    }

                    // Get the related product
                    $related_product = wc_get_product($related_product_id);
                    if (!$related_product) {
                        continue;
                    }

                    // Get pricing data for related product using our helper function
                    $related_pricing_data = product_estimator_get_product_price($related_product_id, $room_area, false);

                    // Prepare related product data
                    $related_product_data = [
                        'id' => $related_product_id,
                        'name' => $related_product->get_name(),
                        'image' => wp_get_attachment_image_url($related_product->get_image_id(), 'thumbnail'),
                        'pricing_method' => $related_pricing_data['pricing_method'],
                        'pricing_source' => $related_pricing_data['pricing_source'],
                        'min_price' => $related_pricing_data['min_price'],
                        'max_price' => $related_pricing_data['max_price'],
                    ];

                    // Calculate totals based on pricing method
                    if ($related_pricing_data['pricing_method'] === 'sqm' && $room_area > 0) {
                        // Per square meter pricing
                        $related_min_total = $related_pricing_data['min_price'] * $room_area;
                        $related_max_total = $related_pricing_data['max_price'] * $room_area;

                        $related_product_data['min_price_total'] = $related_min_total;
                        $related_product_data['max_price_total'] = $related_max_total;
                    } else {
                        // Fixed pricing - already rounded above
                        $related_product_data['min_price_total'] = $related_pricing_data['min_price'];
                        $related_product_data['max_price_total'] = $related_pricing_data['max_price'];
                    }

                    // Add to product's additional products list
                    $product_data['additional_products'][] = $related_product_data;
                }

                // Handle auto-add notes
                foreach ($auto_add_notes as $note_text) {
                    // Create note data - FIX: Put notes in additional_notes array, NOT additional_products
                    $note_data = [
                        'id' => 'note_' . uniqid(),
                        'type' => 'note',
                        'note_text' => $note_text,
                    ];

                    // Add to product's additional notes list
                    $product_data['additional_notes'][] = $note_data;
                }
            }

            // Add product to room
            $success = $session->addProductToRoom($estimate_id, $room_id, $product_data);

            if (!$success) {
                return [
                    'success' => false,
                    'message' => __('Failed to add product to room', 'product-estimator'),
                    'debug' => [
                        'estimate_id' => $estimate_id,
                        'room_id' => $room_id
                    ]
                ];
            }

            // Update totals after adding the product
            $this->updateTotals($estimate_id);

            return [
                'success' => true,
                'message' => __('Product added successfully', 'product-estimator'),
                'product_data' => $product_data,
                'added_notes' => count($auto_add_notes)
            ];
        } catch (\Exception $e) {
            error_log('Exception in prepareAndAddProductToRoom: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage()
            ];
        }
    }
    /**
     * Get the appropriate pricing rule for a product
     *
     * @param int $product_id The product ID
     * @return array The pricing rule with 'method' and 'source' keys, or default values
     */
    private function getPricingRuleForProduct($product_id) {
        // Get global settings
        $settings = get_option('product_estimator_settings');

        // Use defaults from settings if available, otherwise fall back to hardcoded defaults
        $default_rule = [
            'method' => isset($settings['default_pricing_method']) ? $settings['default_pricing_method'] : 'sqm',
            'source' => isset($settings['default_pricing_source']) ? $settings['default_pricing_source'] : 'website'
        ];

        // Return default rule if WooCommerce is not active or product ID is invalid
        if (!function_exists('wp_get_post_terms') || empty($product_id)) {
            return $default_rule;
        }
        // Check if product is a variation and get parent if needed
        $product = wc_get_product($product_id);
        $parent_product_id = null;

        if ($product && $product->is_type('variation')) {
            $parent_product_id = $product->get_parent_id();
        }

        // Get product categories
        if ($parent_product_id) {
            $product_categories = wp_get_post_terms($parent_product_id, 'product_cat', ['fields' => 'ids']);
        } else {
            $product_categories = wp_get_post_terms($product_id, 'product_cat', ['fields' => 'ids']);
        }

        if (empty($product_categories) || is_wp_error($product_categories)) {
            return $default_rule;
        }

        // Get all pricing rules
        $pricing_rules = get_option('product_estimator_pricing_rules', []);

        if (empty($pricing_rules)) {
            return $default_rule;
        }

        // Check each rule to find one that applies to this product's categories
        foreach ($pricing_rules as $rule) {
            if (!isset($rule['categories']) || !is_array($rule['categories'])) {
                continue;
            }

            // Check if any of this product's categories match the rule's categories
            $matching_categories = array_intersect($product_categories, $rule['categories']);

            if (!empty($matching_categories)) {
                // Found a matching rule, return its method and source
                return [
                    'method' => isset($rule['pricing_method']) ? $rule['pricing_method'] : $default_rule['method'],
                    'source' => isset($rule['pricing_source']) ? $rule['pricing_source'] : $default_rule['source']
                ];
            }
        }

        // No matching rule found, return default
        return $default_rule;
    }

    /**
     * Get pricing method for a product based on pricing rules
     *
     * @param int $product_id The product ID
     * @return string The pricing method ('sqm' or 'fixed')
     */
    private function getPricingMethodForProduct($product_id) {
        // Get settings
        $settings = get_option('product_estimator_settings');

        // Default to setting from options, or 'sqm' if not set
        $default_method = isset($settings['default_pricing_method']) ? $settings['default_pricing_method'] : 'sqm';

        // Get product categories
        $product_categories = wp_get_post_terms($product_id, 'product_cat', ['fields' => 'ids']);

        if (empty($product_categories)) {
            return $default_method;
        }

        // Get all pricing rules
        $pricing_rules = get_option('product_estimator_pricing_rules', []);

        if (empty($pricing_rules)) {
            return $default_method;
        }

        // Check each rule for matching categories
        foreach ($pricing_rules as $rule) {
            if (!isset($rule['categories']) || !is_array($rule['categories'])) {
                continue;
            }

            // Check if this product's categories match any in the rule
            $matching_categories = array_intersect($product_categories, $rule['categories']);

            if (!empty($matching_categories)) {
                // Found a matching rule, return its method
                return isset($rule['pricing_method']) ? $rule['pricing_method'] : $default_method;
            }
        }

        return $default_method;
    }


    /**
     * AJAX handler for searching products within a category
     */
    public function ajaxSearchCategoryProducts()
    {
        // Check nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'product_estimator_product_additions_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed.', 'product-estimator')));
            return;
        }

        // Check permissions
        if (!current_user_can('manage_product_terms')) {
            wp_send_json_error(array('message' => __('You do not have permission to perform this action.', 'product-estimator')));
            return;
        }

        // Get search parameters
        $search_term = isset($_POST['search']) ? sanitize_text_field($_POST['search']) : '';
        $category_id = isset($_POST['category']) ? absint($_POST['category']) : 0;

        if (empty($search_term) || empty($category_id)) {
            wp_send_json_error(array('message' => __('Invalid search parameters.', 'product-estimator')));
            return;
        }

        try {
            // Query products
            $args = array(
                'post_type' => 'product',
                'post_status' => 'publish',
                'posts_per_page' => 20,
                's' => $search_term,
                'tax_query' => array(
                    array(
                        'taxonomy' => 'product_cat',
                        'field' => 'term_id',
                        'terms' => $category_id,
                    ),
                ),
            );

            $query = new \WP_Query($args);
            $products = array();

            if ($query->have_posts()) {
                while ($query->have_posts()) {
                    $query->the_post();
                    $product_id = get_the_ID();
                    $product = wc_get_product($product_id);

                    if ($product) {
                        $products[] = array(
                            'id' => $product_id,
                            'name' => $product->get_name(),
                            'price' => $product->get_price(),
                            'formatted_price' => wc_price($product->get_price()),
                        );
                    }
                }
                wp_reset_postdata();
            }

            wp_send_json_success(array(
                'products' => $products,
            ));
        } catch (\Exception $e) {
            wp_send_json_error(array(
                'message' => __('Error searching products:', 'product-estimator') . ' ' . $e->getMessage()
            ));
        }
    }

    /**
     * Get estimate selection form HTML
     */
    public function getEstimateSelectionForm() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Start output buffer to capture form HTML
        ob_start();

        // Include the form partial
        include_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-estimate-selection-form.php';

        // Get HTML
        $html = ob_get_clean();

        wp_send_json_success(array(
            'html' => $html
        ));
    }

    /**
     * Get new estimate form HTML
     */
    public function getNewEstimateForm() {
        check_ajax_referer('product_estimator_nonce', 'nonce');

        ob_start();
        include_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-new-estimate-form.php';
        $html = ob_get_clean();

        wp_send_json_success(array(
            'html' => $html
        ));
    }

    /**
     * Get new room form HTML
     */
    public function getNewRoomForm() {
        check_ajax_referer('product_estimator_nonce', 'nonce');

        ob_start();
        include_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-new-room-form.php';
        $html = ob_get_clean();

        wp_send_json_success(array(
            'html' => $html
        ));
    }

    /**
     * Get room selection form HTML
     */
    public function getRoomSelectionForm() {
        check_ajax_referer('product_estimator_nonce', 'nonce');

        ob_start();
        include_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-room-selection-form.php';
        $html = ob_get_clean();

        wp_send_json_success(array(
            'html' => $html
        ));
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

    /**
     * Handle replacing a product in a room with another product.
     * MODIFIED: Uses local SessionHandler instance, avoids direct $_SESSION access,
     * uses local $session variable instead of removed $this->session.
     */
    public function replaceProductInRoom() {
        // Verify nonce security check
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Validate required inputs from the POST request
        if (!isset($_POST['estimate_id']) || !isset($_POST['room_id']) ||
            !isset($_POST['product_id']) || !isset($_POST['replace_product_id'])) {
            wp_send_json_error([
                'message' => __('Required parameters missing (estimate_id, room_id, product_id, replace_product_id)', 'product-estimator')
            ]);
            return;
        }

        // Sanitize and type-cast input parameters
        $estimate_id = sanitize_text_field($_POST['estimate_id']);
        $room_id = sanitize_text_field($_POST['room_id']);
        $new_product_id = intval($_POST['product_id']); // ID of the product to add
        $old_product_id = intval($_POST['replace_product_id']); // ID of the product to remove
        $replace_type = isset($_POST['replace_type']) ? sanitize_text_field($_POST['replace_type']) : 'main';
        $parent_product_id_from_post = isset($_POST['parent_product_id']) ? sanitize_text_field($_POST['parent_product_id']) : null;

        // Basic validation for IDs
        if ($new_product_id <= 0 || $old_product_id <= 0) {
            wp_send_json_error(['message' => __('Invalid product IDs provided.', 'product-estimator')]);
            return;
        }

        try {
            // Get SessionHandler instance locally within the method
            $session = SessionHandler::getInstance();

            // Fetch the current estimate data using the SessionHandler
            // This ensures the session is started correctly if needed.
            $estimate = $session->getEstimate($estimate_id);

            if (!$estimate) {
                wp_send_json_error(['message' => __('Estimate not found in session', 'product-estimator')]);
                return;
            }

            // Ensure the target room exists within the fetched estimate data
            if (!isset($estimate['rooms'][$room_id])) {
                wp_send_json_error(['message' => __('Room not found in this estimate', 'product-estimator')]);
                return;
            }

            // --- Logic Branch: Replacing an 'additional_product' ---
            if ($replace_type === 'additional_products') {
                // Validate parent_product_id is provided for this type
                if ($parent_product_id_from_post === null || intval($parent_product_id_from_post) <= 0) {
                    wp_send_json_error(['message' => __('Parent product ID is required and must be valid when replacing an additional product.', 'product-estimator')]);
                    return;
                }
                $parent_product_id = intval($parent_product_id_from_post);

                $parent_index = null; // Index of the main product in the room's products array
                $add_index = null;    // Index of the additional product to replace

                // Find the parent product and the specific additional product index
                if (isset($estimate['rooms'][$room_id]['products']) && is_array($estimate['rooms'][$room_id]['products'])) {
                    foreach ($estimate['rooms'][$room_id]['products'] as $p_idx => $main_product) {
                        if (isset($main_product['id']) && intval($main_product['id']) === $parent_product_id) {
                            if (isset($main_product['additional_products']) && is_array($main_product['additional_products'])) {
                                foreach ($main_product['additional_products'] as $a_idx => $add_prod) {
                                    // Direct ID match or check replacement chain
                                    if ((isset($add_prod['id']) && intval($add_prod['id']) === $old_product_id) ||
                                        (isset($add_prod['replacement_chain']) && is_array($add_prod['replacement_chain']) && in_array($old_product_id, $add_prod['replacement_chain']))) {
                                        $parent_index = $p_idx;
                                        $add_index = $a_idx;
                                        break 2; // Found it, exit both loops
                                    }
                                }
                            }
                        }
                    }
                }

                // If the additional product wasn't found
                if ($parent_index === null || $add_index === null) {
                    wp_send_json_error([
                        'message' => __('Additional product to replace not found within the specified parent product.', 'product-estimator'),
                        'debug' => ['old_product_id' => $old_product_id, 'parent_product_id' => $parent_product_id]
                    ]);
                    return;
                }

                // Get room area for pricing
                $room_width = isset($estimate['rooms'][$room_id]['width']) ? floatval($estimate['rooms'][$room_id]['width']) : 0;
                $room_length = isset($estimate['rooms'][$room_id]['length']) ? floatval($estimate['rooms'][$room_id]['length']) : 0;
                $room_area = ($room_width > 0 && $room_length > 0) ? ($room_width * $room_length) : 0;

                // Get data for the NEW product that will replace the old one
                $new_product_obj = wc_get_product($new_product_id);
                if (!$new_product_obj) {
                    wp_send_json_error(['message' => __('New replacement product not found', 'product-estimator')]);
                    return;
                }

                // Get pricing data for the new product
                $pricing_data = product_estimator_get_product_price($new_product_id, $room_area, false); // Don't apply markup here

                // Prepare the data structure for the new additional product
                $existing_add_product = $estimate['rooms'][$room_id]['products'][$parent_index]['additional_products'][$add_index];
                $replacement_chain = isset($existing_add_product['replacement_chain']) ? $existing_add_product['replacement_chain'] : [];
                if (!in_array($existing_add_product['id'], $replacement_chain)) { // Add the ID of the product being replaced to the chain
                    $replacement_chain[] = $existing_add_product['id'];
                }

                $new_add_product_data = [
                    'id' => $new_product_id,
                    'name' => $new_product_obj->get_name(),
                    'image' => wp_get_attachment_image_url($new_product_obj->get_image_id(), 'thumbnail'),
                    'min_price' => $pricing_data['min_price'],
                    'max_price' => $pricing_data['max_price'],
                    'pricing_method' => $pricing_data['pricing_method'],
                    'pricing_source' => $pricing_data['pricing_source'],
                    'replacement_chain' => $replacement_chain // Store the updated chain
                ];
                // Calculate totals based on pricing method
                if ($pricing_data['pricing_method'] === 'sqm' && $room_area > 0) {
                    $new_add_product_data['min_price_total'] = $pricing_data['min_price'] * $room_area;
                    $new_add_product_data['max_price_total'] = $pricing_data['max_price'] * $room_area;
                } else {
                    $new_add_product_data['min_price_total'] = $pricing_data['min_price'];
                    $new_add_product_data['max_price_total'] = $pricing_data['max_price'];
                }

                // Directly modify the $estimate array (which was fetched from session)
                $estimate['rooms'][$room_id]['products'][$parent_index]['additional_products'][$add_index] = $new_add_product_data;

                // Save the entire modified estimate back to the session via SessionHandler
                if (!$session->updateEstimateData($estimate_id, $estimate)) {
                    wp_send_json_error(['message' => __('Failed to update estimate session data after replacing additional product.', 'product-estimator')]);
                    return;
                }

                // Recalculate and update totals for the estimate
                $this->updateTotals($estimate_id); // This will use the data just saved to session

                // Send success response
                wp_send_json_success([
                    'message' => __('Additional product replaced successfully', 'product-estimator'),
                    'estimate_id' => $estimate_id, 'room_id' => $room_id,
                    'old_product_id' => $old_product_id, 'new_product_id' => $new_product_id,
                    'replace_type' => $replace_type, 'parent_product_id' => $parent_product_id,
                    'replacement_chain' => $replacement_chain
                ]);
                return; // End processing for additional_products type

            }
            // --- Logic Branch: Replacing a 'main' product ---
            else {
                $main_product_index = null;

                // Find the index of the main product to replace
                if (isset($estimate['rooms'][$room_id]['products']) && is_array($estimate['rooms'][$room_id]['products'])) {
                    foreach ($estimate['rooms'][$room_id]['products'] as $index => $product) {
                        // Check it's a main product (no 'type' or type != 'note') and ID matches
                        if ((!isset($product['type']) || $product['type'] !== 'note') && isset($product['id']) && intval($product['id']) === $old_product_id) {
                            $main_product_index = $index;
                            break;
                        }
                    }
                }

                // If the main product wasn't found by ID
                if ($main_product_index === null) {
                    wp_send_json_error([
                        'message' => __('Main product to replace not found in this room', 'product-estimator'),
                        'debug' => ['old_product_id' => $old_product_id, 'new_product_id' => $new_product_id]
                    ]);
                    return;
                }

                // Remove the old product using SessionHandler, passing the found index
                $removed = $session->removeProductFromRoom($estimate_id, $room_id, $main_product_index);

                if (!$removed) {
                    wp_send_json_error(['message' => __('Failed to remove old product from room via SessionHandler.', 'product-estimator')]);
                    return;
                }

                // Add the new product using the helper method (which now also uses SessionHandler)
                // Pass room dimensions explicitly if available from the estimate data
                $room_width = isset($estimate['rooms'][$room_id]['width']) ? floatval($estimate['rooms'][$room_id]['width']) : null;
                $room_length = isset($estimate['rooms'][$room_id]['length']) ? floatval($estimate['rooms'][$room_id]['length']) : null;

                $add_result = $this->prepareAndAddProductToRoom($new_product_id, $estimate_id, $room_id, $room_width, $room_length);

                // Check if adding the new product was successful
                if (!$add_result['success']) {
                    // Adding the new product failed. Consider logging the reason.
                    // It's tricky to automatically roll back the removal, so report the error.
                    wp_send_json_error([
                        'message' => $add_result['message'] ?? __('Failed to add the new product after removing the old one.', 'product-estimator'),
                        'debug' => $add_result['debug'] ?? null
                    ]);
                    return;
                }

                // Note: updateTotals is called within prepareAndAddProductToRoom, so it should reflect the final state.

                // Send success response
                wp_send_json_success([
                    'message' => __('Product replaced successfully', 'product-estimator'),
                    'estimate_id' => $estimate_id, 'room_id' => $room_id,
                    'old_product_id' => $old_product_id, 'new_product_id' => $new_product_id,
                    'replace_type' => $replace_type // Confirm type was 'main'
                ]);
            } // End 'main' product replacement logic

        } catch (\Exception $e) {
            // Catch any unexpected exceptions
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("Exception in replaceProductInRoom: " . $e->getMessage());
                error_log("Stack trace: " . $e->getTraceAsString());
            }
            wp_send_json_error([
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage() // Send error message only if WP_DEBUG is on?
            ]);
        }
    } // End replaceProductInRoom method


    /**
     * Helper method to prepare additional product data for replacement
     * Enhanced to maintain consistent product ID references for multiple replacements
     *
     * @param int $product_id Product ID
     * @param float $room_area Room area
     * @param int|null $original_id Original product ID to maintain reference consistency
     * @return array|false Product data array or false on failure
     */
    private function prepareAdditionalProductData($product_id, $room_area, $original_id = null) {
        try {
            // Get product data
            $product = wc_get_product($product_id);
            if (!$product) {
                return false;
            }

            // Get pricing data
            $pricing_data = product_estimator_get_product_price($product_id, $room_area, false);

            // Prepare product data
            $product_data = [
                'id' => $product_id,
                'name' => $product->get_name(),
                'image' => wp_get_attachment_image_url($product->get_image_id(), 'thumbnail'),
                'min_price' => $pricing_data['min_price'],
                'max_price' => $pricing_data['max_price'],
                'pricing_method' => $pricing_data['pricing_method'],
                'pricing_source' => $pricing_data['pricing_source']
            ];

            // If an original ID was provided, store it for reference consistency
            // This is crucial for maintaining multiple upgrades
            if ($original_id) {
                $product_data['original_id'] = $original_id;
            }

            // Calculate price totals
            if ($pricing_data['pricing_method'] === 'sqm' && $room_area > 0) {
                $min_total = $pricing_data['min_price'] * $room_area;
                $max_total = $pricing_data['max_price'] * $room_area;

                $product_data['min_price_total'] = $min_total;
                $product_data['max_price_total'] = $max_total;
            } else {
                $product_data['min_price_total'] = $pricing_data['min_price'];
                $product_data['max_price_total'] = $pricing_data['max_price'];
            }

            return $product_data;
        } catch (\Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Error preparing additional product data: ' . $e->getMessage());
            }
            return false;
        }
    }

    /**
     * Update customer details via AJAX
     */
    public function updateCustomerDetails() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        if (!isset($_POST['details'])) {
            wp_send_json_error(['message' => __('Invalid details provided', 'product-estimator')]);
            return;
        }

        $details_data = $_POST['details'];


        if (is_string($details_data)) {
            $details_data = json_decode(stripslashes($details_data), true);
        }

        // Validate details structure
        if (!is_array($details_data)) {
            wp_send_json_error(['message' => __('Invalid details format', 'product-estimator')]);
            return;
        }

        // Get the details from the request, keeping only fields that were submitted
        $details = [];

        // Always include required fields
        $details['postcode'] = isset($details_data['postcode']) ? sanitize_text_field($details_data['postcode']) : '';

        // Only include email if it was provided in the form
        if (isset($details_data['name'])) {
            $details['name'] = sanitize_text_field($details_data['name']);
        }

        // Only include email if it was provided in the form
        if (isset($details_data['email'])) {
            $details['email'] = sanitize_email($details_data['email']);
        }

        // Only include phone if it was provided in the form
        if (isset($details_data['phone'])) {
            $details['phone'] = sanitize_text_field($details_data['phone']);
        }

        // Validate required fields
        if (empty($details['postcode'])) {
            wp_send_json_error(['message' => __('Please fill in all required fields', 'product-estimator')]);
            return;
        }

        // Validate email format if provided
        if (isset($details['email']) && !empty($details['email']) && !is_email($details['email'])) {
            wp_send_json_error(['message' => __('Please enter a valid email address', 'product-estimator')]);
            return;
        }

        try {
            // Initialize CustomerDetails
            $customer_details = new \RuDigital\ProductEstimator\Includes\CustomerDetails();

            // Get existing details to preserve any fields not in the form
            $existing_details = $customer_details->getDetails();

            // Merge new details with existing details
            // This preserves fields that weren't in the form but were in the session
            $merged_details = array_merge($existing_details, $details);

            // Update the details
            $success = $customer_details->setDetails($merged_details);

            if ($success) {
                // Get the updated details to confirm they were set correctly
                $updated_details = $customer_details->getDetails();

                wp_send_json_success([
                    'message' => __('Customer details updated successfully', 'product-estimator'),
                    'details' => $updated_details
                ]);
            } else {
                wp_send_json_error(['message' => __('Failed to update customer details', 'product-estimator')]);
            }
        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => __('An error occurred while updating details', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Delete customer details via AJAX
     */
    public function deleteCustomerDetails() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        try {
            // Initialize CustomerDetails
            $customer_details = new \RuDigital\ProductEstimator\Includes\CustomerDetails();

            // Delete the details
            $success = $customer_details->clearDetails();

            if ($success) {
                // Get the HTML for the empty form
                ob_start();
                ?>
                <!-- New empty customer details form -->
                <div class="customer-details-section">
                    <h4><?php esc_html_e('Your Details', 'product-estimator'); ?></h4>

<!--                    <div class="form-group">-->
<!--                        <label for="customer-name">--><?php //esc_html_e('Full Name', 'product-estimator'); ?><!--</label>-->
<!--                        <input type="text" id="customer-name" name="customer_name" placeholder="--><?php //esc_attr_e('Your full name', 'product-estimator'); ?><!--" required>-->
<!--                    </div>-->

                    <div class="form-group">
                        <label for="customer-postcode"><?php esc_html_e('Postcode', 'product-estimator'); ?></label>
                        <input type="text" id="customer-postcode" name="customer_postcode" placeholder="<?php esc_attr_e('Your postcode', 'product-estimator'); ?>" required>
                    </div>
                </div>
                <?php
                $html = ob_get_clean();

                wp_send_json_success([
                    'message' => __('Customer details deleted successfully', 'product-estimator'),
                    'html' => $html
                ]);
            } else {
                wp_send_json_error(['message' => __('Failed to delete customer details', 'product-estimator')]);
            }
        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => __('An error occurred while deleting details', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }
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

    /**
     * Get products from specified categories
     */
    public function get_category_products() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Get category IDs
        $category_ids = isset($_POST['categories']) ? sanitize_text_field($_POST['categories']) : '';

        if (empty($category_ids)) {
            wp_send_json_error([
                'message' => __('Category IDs are required', 'product-estimator')
            ]);
            return;
        }

        // Convert comma-separated string to array
        $categories = explode(',', $category_ids);
        $categories = array_map('intval', $categories);

        // Query products in these categories
        $args = [
            'post_type' => 'product',
            'post_status' => 'publish',
            'posts_per_page' => 50, // Limit to 50 products for performance
            'tax_query' => [
                [
                    'taxonomy' => 'product_cat',
                    'field' => 'term_id',
                    'terms' => $categories,
                    'operator' => 'IN'
                ]
            ],
            'fields' => 'ids' // Only get post IDs for efficiency
        ];

        $product_query = new \WP_Query($args);
        $products = [];

        if ($product_query->have_posts()) {
            foreach ($product_query->posts as $product_id) {
                $product = wc_get_product($product_id);

                if ($product) {
                    // Only include products with estimator enabled
                    if (\RuDigital\ProductEstimator\Includes\Integration\WoocommerceIntegration::isEstimatorEnabled($product_id)) {
                        $products[] = [
                            'id' => $product_id,
                            'name' => $product->get_name(),
                            'price' => $product->get_price(),
                            'image' => wp_get_attachment_image_url($product->get_image_id(), 'thumbnail')
                        ];
                    }
                }
            }
        }

        wp_send_json_success([
            'products' => $products
        ]);
    }

    /**
     * Store current session data in the database with proper error handling
     * This is a fixed version that prevents empty estimate_id issues
     */
    public function store_single_estimate() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Get the estimate ID to store
        $estimate_id = array_key_exists('estimate_id', $_POST) ? sanitize_text_field($_POST['estimate_id']) : null;

        // Special handling for estimate_id validation - allow "0" as valid
        if (!isset($estimate_id) || $estimate_id === '') {
            wp_send_json_error([
                'message' => __('Estimate ID is required', 'product-estimator')
            ]);
            return;
        }

        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Processing store_single_estimate with estimate_id: ' . $estimate_id);
        }

        try {
            // Explicitly check if the estimate exists in session
            $session = SessionHandler::getInstance();

            $estimate = $session->getEstimate($estimate_id);
            if (!$estimate) {
                throw new \Exception(__('Estimate not found in session', 'product-estimator'));
            }

            // Get customer details from estimate
            $customer_details = isset($estimate['customer_details']) ? $estimate['customer_details'] : [];
            $notes = isset($estimate['notes']) ? $estimate['notes'] : '';

            // Store or update the estimate using our shared trait method
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Calling storeOrUpdateEstimate with:');
                error_log('Estimate ID: ' . print_r($estimate_id, true));
                error_log('Customer details: ' . print_r($customer_details, true));
                error_log('Notes: ' . print_r($notes, true));
            }
            $db_id = $this->storeOrUpdateEstimate($estimate_id, $customer_details, $notes);

            if (!$db_id) {
                throw new \Exception(__('Error saving estimate to database', 'product-estimator'));
            }

            // No need to manually update the session as storeOrUpdateEstimate already did this
            wp_send_json_success([
                'message' => __('Estimate saved successfully', 'product-estimator'),
                'estimate_id' => $db_id,
                'session_id' => $estimate_id,
                'is_update' => $this->getEstimateDbId($estimate_id) == $db_id
            ]);

        } catch (\Exception $e) {
            // Additional logging for debugging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Exception in store_single_estimate: ' . $e->getMessage());
                error_log('Trace: ' . $e->getTraceAsString());
            }

            wp_send_json_error([
                'message' => $e->getMessage(),
                'error' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Check if customer has valid details set in session.
     * MODIFIED: Uses CustomerDetails class which handles lazy session loading.
     * Removed explicit session start.
     */
    public function check_customer_details() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Get estimate ID if provided (optional, used for fallback check)
        $estimate_id = array_key_exists('estimate_id', $_POST) ? sanitize_text_field($_POST['estimate_id']) : null;

        try {
            // Initialize customer details manager.
            // The constructor no longer starts the session.
            // Session will only be started if getDetails() needs to load data.
            if (!class_exists('\\RuDigital\\ProductEstimator\\Includes\\CustomerDetails')) {
                require_once dirname(__FILE__) . '/class-customer-details.php';
            }
            $customer_details_manager = new CustomerDetails(); // Instantiate

            // Get details - this will trigger ensureDetailsLoaded() inside CustomerDetails if needed
            $customer_details = $customer_details_manager->getDetails(); // Returns [] if none or session fails

            // Check specific fields
            $has_email = $customer_details_manager->hasEmail(); // Checks loaded details
            $has_name = !empty($customer_details['name']);
            $has_phone = !empty($customer_details['phone']);
            $has_postcode = !empty($customer_details['postcode']); // Assuming postcode is essential

            // Fallback: If global details lack email, check the specific estimate's details
            // This requires getting the SessionHandler instance directly here.
            if (!$has_email && $estimate_id !== null) {
                $session = SessionHandler::getInstance();
                $estimate = $session->getEstimate($estimate_id); // This ensures session is started if needed

                if ($estimate && isset($estimate['customer_details']) && is_array($estimate['customer_details'])) {
                    $estimate_customer_details = $estimate['customer_details'];
                    if (!empty($estimate_customer_details['email'])) {
                        // If estimate has email, update flags based on estimate's data
                        $has_email = true;
                        $has_name = !empty($estimate_customer_details['name']);
                        $has_phone = !empty($estimate_customer_details['phone']);
                        $has_postcode = !empty($estimate_customer_details['postcode']);
                        // Optionally update the main $customer_details variable to return the estimate-specific ones
                        // $customer_details = $estimate_customer_details;
                    }
                }
            }

            wp_send_json_success([
                'has_email' => $has_email,
                'has_name' => $has_name,
                'has_phone' => $has_phone,
                'has_postcode' => $has_postcode, // Added postcode check flag
                'customer_details' => $customer_details // Return the details found (global or potentially estimate-specific if logic was added)
            ]);

        } catch (\Exception $e) {
            // Catch potential errors during CustomerDetails instantiation or session handling
            error_log('Error checking customer details: ' . $e->getMessage());
            wp_send_json_error([
                'message' => __('An error occurred while checking customer details.', 'product-estimator'),
                'error_details' => $e->getMessage() // Optionally include details in debug mode
            ]);
        }
    }

    /**
     * Check if an estimate is already stored in the database
     */
    public function check_estimate_stored() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Get the estimate ID to check
        $estimate_id = array_key_exists('estimate_id', $_POST) ? sanitize_text_field($_POST['estimate_id']) : null;

        if (empty($estimate_id)) {

            wp_send_json_error([
                'message' => __('Estimate ID is required', 'product-estimator')
            ]);
            return;
        }

        try {
            // Get the estimate from session
            $session = SessionHandler::getInstance();

            $estimate = $session->getEstimate($estimate_id);

            if (empty($estimate)) {
                wp_send_json_error([
                    'message' => __('Estimate not found in session', 'product-estimator')
                ]);
                return;
            }

            // Use the trait method to check if it's stored
            $is_stored = $this->isEstimateStored($estimate);
            $db_id = $this->getEstimateDbId($estimate);

            wp_send_json_success([
                'is_stored' => $is_stored,
                'estimate_id' => $estimate_id,
                'db_id' => $db_id
            ]);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Handle AJAX request to email a copy of the estimate to the customer.
     * Uses SessionHandler and the EstimateDbHandler trait methods.
     * Calls the global product_estimator_get_customer_email() helper.
     */
    public function request_copy_estimate() {
        // Verify nonce security check
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Get the estimate ID from the POST request
        $estimate_id = array_key_exists('estimate_id', $_POST) ? sanitize_text_field($_POST['estimate_id']) : null;

        // Validate estimate_id (allow '0')
        if (!isset($estimate_id) || $estimate_id === '') {
            wp_send_json_error([
                'message' => __('Estimate ID is required', 'product-estimator')
            ]);
            return;
        }
        $session_estimate_id = (string)$estimate_id; // Use this for session lookups

        try {
            // Get SessionHandler instance
            $session = SessionHandler::getInstance();

            // Get the estimate data from the session
            $estimate_session_data = $session->getEstimate($session_estimate_id);

            if (!$estimate_session_data) {
                // Maybe it's only in the DB? Try loading it.
                // If estimate_id *is* the DB ID (e.g., from admin view)
                if (ctype_digit($session_estimate_id)) {
                    $db_id_to_load = intval($session_estimate_id);
                    // Ensure it's loaded into session (returns session ID or null)
                    $session_estimate_id = $this->ensureEstimateInSession($db_id_to_load);
                    if ($session_estimate_id === null) {
                        wp_send_json_error(['message' => __('Estimate not found', 'product-estimator')]);
                        return;
                    }
                    $estimate_session_data = $session->getEstimate($session_estimate_id);
                    if (!$estimate_session_data) { // Double check after loading attempt
                        wp_send_json_error(['message' => __('Estimate could not be loaded into session', 'product-estimator')]);
                        return;
                    }
                } else {
                    wp_send_json_error(['message' => __('Estimate not found in session', 'product-estimator')]);
                    return;
                }
            }

            // Use the globally defined helper function to get the email
            // Pass both the estimate data and the session ID for flexibility
            $customer_email = product_estimator_get_customer_email($estimate_session_data, $session_estimate_id);

            // If no email found, return error code for frontend handling
            if (empty($customer_email)) {
                wp_send_json_error([
                    'message' => __('No customer email found for this estimate.', 'product-estimator'),
                    'code' => 'no_email' // Frontend can check this code
                ]);
                return;
            }

            // Check notification settings if PDF should be included
            $options = get_option('product_estimator_settings', array());
            $include_pdf = isset($options['notification_request_copy_include_pdf'])
                ? (bool)$options['notification_request_copy_include_pdf']
                : true; // Default true

            $pdf_path = '';
            $tmp_file = null;
            $estimate_data_for_pdf = $estimate_session_data; // Use session data by default

            // If including PDF, ensure estimate is saved and get DB data for PDF generation
            if ($include_pdf) {
                $db_id = $this->getEstimateDbId($estimate_session_data); // Use trait method

                // If not saved yet, save it now
                if (!$db_id) {
                    $customer_details_for_save = $estimate_session_data['customer_details'] ?? [];
                    $notes_for_save = $estimate_session_data['notes'] ?? '';
                    $db_id = $this->storeOrUpdateEstimate($session_estimate_id, $customer_details_for_save, $notes_for_save); // Use trait method
                }

                if (!$db_id) {
                    wp_send_json_error(['message' => __('Failed to save estimate before generating PDF.', 'product-estimator')]);
                    return;
                }

                // Fetch potentially updated data from DB for the PDF
                $estimate_data_for_pdf = $this->getEstimateFromDb($db_id); // Use trait method
                if (!$estimate_data_for_pdf) {
                    wp_send_json_error(['message' => __('Failed to retrieve estimate data from database for PDF generation.', 'product-estimator')]);
                    return;
                }

                // Generate PDF
                if (!class_exists(PDFGenerator::class)) {
                    wp_send_json_error(['message' => __('PDF Generation module not available.', 'product-estimator')]);
                    return;
                }
                $pdf_generator = new PDFGenerator();
                $pdf_content = $pdf_generator->generate_pdf($estimate_data_for_pdf); // Use DB data for PDF

                if (empty($pdf_content)) {
                    wp_send_json_error(['message' => __('Failed to generate PDF content.', 'product-estimator')]);
                    return;
                }

                // Save PDF to a temporary file
                $tmp_file = sys_get_temp_dir() . '/estimate-' . $db_id . "-" . uniqid() . '.pdf';
                if (file_put_contents($tmp_file, $pdf_content) === false) {
                    error_log("Product Estimator: Failed to write temporary PDF file to {$tmp_file}");
                    wp_send_json_error(['message' => __('Error saving PDF for email attachment.', 'product-estimator')]);
                    return;
                }
                $pdf_path = $tmp_file;
            }

            // Send email using the private helper method within this class
            // Pass the data used for the PDF (from DB if generated) or session data if no PDF
            $email_sent = $this->send_estimate_email($estimate_data_for_pdf, $customer_email, $pdf_path);

            // Clean up temporary PDF file if it was created
            if ($tmp_file && file_exists($tmp_file)) {
                @unlink($tmp_file);
            }

            // Check if email sending was successful
            if (!$email_sent) {
                wp_send_json_error(['message' => __('Error sending estimate email.', 'product-estimator')]);
                return;
            }

            // Send success response
            wp_send_json_success([
                'message' => __('Estimate has been emailed to', 'product-estimator') . ' ' . esc_html($customer_email),
                'email' => $customer_email, // Return email for confirmation
                'pdf_included' => ($include_pdf && !empty($pdf_path)) // Confirm if PDF was actually attached
            ]);

        } catch (\Exception $e) {
            // Log the detailed error on the server
            error_log("Product Estimator Error in request_copy_estimate: " . $e->getMessage() . "\nStack Trace:\n" . $e->getTraceAsString());
            // Send a generic error message to the client
            wp_send_json_error([
                'message' => __('An error occurred while processing your request.', 'product-estimator'),
                // Optionally include error details only if WP_DEBUG is on
                // 'error_details' => (defined('WP_DEBUG') && WP_DEBUG) ? $e->getMessage() : ''
            ]);
        }
    }

    /**
     * Send email with estimate details and optional PDF attachment.
     * This is a private helper method for request_copy_estimate.
     *
     * @param array $estimate The estimate data array (should contain db_id if saved).
     * @param string $email The recipient email address.
     * @param string $pdf_path Path to the temporary PDF file (optional).
     * @return bool True if email was sent successfully, false otherwise.
     */
    private function send_estimate_email(array $estimate, string $email, string $pdf_path = ''): bool {
        // Validate email format
        if (!is_email($email)) {
            error_log("Product Estimator (send_estimate_email): Invalid recipient email format: {$email}");
            return false;
        }

        // Get notification settings from WordPress options
        $options = get_option('product_estimator_settings', array());

        // Get site info for fallbacks and template tags
        $site_name = get_bloginfo('name');
        $site_url = home_url();

        // Determine From Name and From Email from settings or defaults
        $from_name = isset($options['from_name']) && !empty($options['from_name'])
            ? $options['from_name']
            : $site_name;
        $from_email = isset($options['from_email']) && !empty($options['from_email']) && is_email($options['from_email'])
            ? $options['from_email']
            : get_option('admin_email'); // Fallback to WordPress admin email

        // Get Subject and Content templates for the 'request_copy' type
        $subject_template = isset($options['notification_request_copy_subject']) && !empty($options['notification_request_copy_subject'])
            ? $options['notification_request_copy_subject']
            : sprintf(__('%s: Your Requested Estimate', 'product-estimator'), '[site_name]'); // Default subject

        $content_template = isset($options['notification_request_copy_content']) && !empty($options['notification_request_copy_content'])
            ? $options['notification_request_copy_content']
            : sprintf( // Default content
                __("Hello [customer_name],\n\nThank you for your interest in our products. As requested, please find attached your estimate \"%s\".\n\nIf you have any questions or would like to discuss this estimate further, please don't hesitate to contact us.\n\nBest regards,\n%s", 'product-estimator'),
                '[estimate_name]',
                '[site_name]'
            );

        // Determine if PDF should be included based on settings (redundant check, but safe)
        $include_pdf = isset($options['notification_request_copy_include_pdf'])
            ? (bool)$options['notification_request_copy_include_pdf']
            : true;

        // Prepare data for template tag replacement
        $customer_name = isset($estimate['customer_details']['name']) && !empty($estimate['customer_details']['name'])
            ? $estimate['customer_details']['name']
            : __('Customer', 'product-estimator');
        $estimate_name = isset($estimate['name']) && !empty($estimate['name'])
            ? $estimate['name']
            : __('Untitled Estimate', 'product-estimator');
        $db_id = isset($estimate['db_id']) ? $estimate['db_id'] : null; // Get DB ID if available

        // Replace template tags in subject and body
        $subject = str_replace(
            ['[site_name]', '[estimate_name]', '[estimate_id]', '[customer_name]'],
            [$site_name, $estimate_name, $db_id ?? __('New', 'product-estimator'), $customer_name],
            $subject_template
        );

        $body = str_replace(
            ['[site_name]', '[site_url]', '[estimate_name]', '[estimate_id]', '[customer_name]', '[customer_email]', '[date]'],
            [$site_name, $site_url, $estimate_name, $db_id ?? __('New', 'product-estimator'), $customer_name, $email, date_i18n(get_option('date_format'))],
            $content_template
        );

        // Add a link to view the estimate online if it has a DB ID
        if ($db_id) {
            // Generate the secure public URL (assuming product_estimator_get_pdf_url exists)
            if (function_exists('product_estimator_get_pdf_url')) {
                $pdf_public_url = product_estimator_get_pdf_url($db_id, true); // Get customer view URL
                if (!empty($pdf_public_url)) {
                    $body .= "\n\n" . sprintf( // Add a line break before the link
                            __('You can also view your estimate online here: %s', 'product-estimator'),
                            esc_url($pdf_public_url)
                        );
                }
            }
        }

        // Format body for HTML email
        $body_html = wpautop($body); // Use wpautop for paragraph formatting

        // Prepare email headers
        $headers = [
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . sprintf('%s <%s>', $from_name, $from_email) // Correct From header format
        ];

        // Prepare attachments array
        $attachments = [];
        if ($include_pdf && !empty($pdf_path) && file_exists($pdf_path)) {
            $attachments[] = $pdf_path; // Add the temporary PDF path
        }

        // Send the email using WordPress core function
        $sent = wp_mail($email, $subject, $body_html, $headers, $attachments);

        // Log the result if debugging is enabled
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $log_message = sprintf(
                'Product Estimator (send_estimate_email): Attempted to send email to %s. Subject: "%s". Status: %s.',
                $email,
                $subject,
                $sent ? 'Success' : 'Failed'
            );
            if (!empty($attachments)) {
                $log_message .= " Included PDF: " . basename($pdf_path);
            }
            if (!$sent && $GLOBALS['phpmailer'] instanceof \PHPMailer\PHPMailer\PHPMailer) {
                $log_message .= " Mailer Error: " . $GLOBALS['phpmailer']->ErrorInfo;
            }
            error_log($log_message);
        }

        return $sent; // Return true if sent, false otherwise
    }


    /**
     * Generate a secure PDF URL with token
     * Add this to the AjaxHandler class in class-ajax-handler.php
     */
    public function get_secure_pdf_url() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        if (!isset($_POST['estimate_id'])) {
            wp_send_json_error([
                'message' => __('Estimate ID is required', 'product-estimator')
            ]);
            return;
        }

        $estimate_id = intval($_POST['estimate_id']);

        // Get the PDF Route Handler
        $pdf_handler = new \RuDigital\ProductEstimator\Includes\PDFRouteHandler();

        // Generate a secure token
        $token = $pdf_handler->generate_secure_pdf_token($estimate_id);

        if (!$token) {
            wp_send_json_error([
                'message' => __('Failed to generate secure PDF token', 'product-estimator')
            ]);
            return;
        }

        // Build the URL
        $url = home_url('/product-estimator/pdf/view/' . $token);

        wp_send_json_success([
            'url' => $url,
            'token' => $token,
            'estimate_id' => $estimate_id
        ]);
    }

    /**
     * AJAX handler for store contact requests
     *
     * Add this to your class-ajax-handler.php file
     */

    /**
     * Handle store contact request
     * Sends notification to the store about customer contact request
     */
    public function request_store_contact() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Get the estimate ID
        $estimate_id = array_key_exists('estimate_id', $_POST) ? sanitize_text_field($_POST['estimate_id']) : null;
        $contact_method = array_key_exists('contact_method', $_POST) ? sanitize_text_field($_POST['contact_method']) : 'email';

        // Custom customer details if provided
        $customer_details_json = array_key_exists('customer_details', $_POST) ? $_POST['customer_details'] : null;
        $custom_customer_details = null;

        if (!empty($customer_details_json)) {
            $custom_customer_details = json_decode(stripslashes($customer_details_json), true);
        }

        if (!isset($estimate_id) || $estimate_id === '') {
            wp_send_json_error([
                'message' => __('Estimate ID is required', 'product-estimator')
            ]);
            return;
        }

        try {
            // Get the estimate from session or database
            $session = SessionHandler::getInstance();

            $estimate = $session->getEstimate($estimate_id);
            $db_id = null;

            // If estimate exists in session, check if it's stored in DB
            if ($estimate) {
                $db_id = $this->getEstimateDbId($estimate);

                // If not in DB, store it
                if (!$db_id) {
                    // Get customer details from estimate or custom details
                    $customer_details = $custom_customer_details ?: ($estimate['customer_details'] ?? []);
                    $notes = isset($estimate['notes']) ? $estimate['notes'] : '';

                    // Store the estimate
                    $db_id = $this->storeOrUpdateEstimate($estimate_id, $customer_details, $notes);

                    if (!$db_id) {
                        throw new \Exception('Failed to store estimate in database');
                    }
                }
            } else {
                // Try to get the estimate directly from the database using the ID
                $db_id = intval($estimate_id);
                $estimate_data = $this->get_estimate_from_db($db_id);

                if (!$estimate_data) {
                    wp_send_json_error([
                        'message' => __('Estimate not found', 'product-estimator')
                    ]);
                    return;
                }

                $estimate = $estimate_data;
            }

            // Get customer details - prefer custom passed details over stored ones
            $customer_details = $custom_customer_details ?: ($estimate['customer_details'] ?? []);

            // Validate customer details based on contact method
            if ($contact_method === 'email') {
                if (empty($customer_details['email'])) {
                    wp_send_json_error([
                        'message' => __('Customer email is required for email contact', 'product-estimator'),
                        'code' => 'missing_email'
                    ]);
                    return;
                }
            } else if ($contact_method === 'phone') {
                if (empty($customer_details['phone'])) {
                    wp_send_json_error([
                        'message' => __('Customer phone number is required for phone contact', 'product-estimator'),
                        'code' => 'missing_phone'
                    ]);
                    return;
                }
            }

            // Get postcode to determine which store to send to
            $postcode = isset($customer_details['postcode']) ? $customer_details['postcode'] : '0000';

            // Use the get_send_store function to get the store email based on postcode
            $store_email = get_send_store($postcode);

            // If no store email found, use default
            if (empty($store_email) || $store_email === 'default@yourdomain.com') {
                // Fallback to admin email
                $store_email = get_option('admin_email');
            }

            // Prepare and send email to store
            $email_sent = $this->send_store_contact_email(
                $store_email,
                $estimate,
                $customer_details,
                $contact_method
            );

            if (!$email_sent) {
                throw new \Exception('Failed to send email to store');
            }

            wp_send_json_success([
                'message' => __('Your contact request has been sent to the store', 'product-estimator'),
                'contact_method' => $contact_method
            ]);

        } catch (\Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Error in request_store_contact: ' . $e->getMessage());
            }

            wp_send_json_error([
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }
    }



    /**
     * Send contact request email to store
     *
     * @param string $store_email Store email address
     * @param array $estimate Estimate data
     * @param array $customer_details Customer details
     * @param string $contact_method Contact method ('email' or 'phone')
     * @return bool Success or failure
     */
    private function send_store_contact_email($store_email, $estimate, $customer_details, $contact_method) {
        // Get site info for email
        $site_name = get_bloginfo('name');
        $site_url = home_url();

        // Get notification settings
        $options = get_option('product_estimator_settings', array());

        // Use from_name and from_email from settings if available
        $from_name = isset($options['from_name']) && !empty($options['from_name'])
            ? $options['from_name']
            : $site_name;

        $from_email = isset($options['from_email']) && !empty($options['from_email'])
            ? $options['from_email']
            : get_option('admin_email');

        // Build email subject
        $subject = sprintf(
            __('%s: Customer Contact Request via %s', 'product-estimator'),
            $site_name,
            $contact_method === 'email' ? 'Email' : 'Phone'
        );

        // Get customer name or default to "Customer"
        $customer_name = isset($customer_details['name']) && !empty($customer_details['name'])
            ? $customer_details['name']
            : __('Customer', 'product-estimator');

        // Get estimate name or default to "Untitled Estimate"
        $estimate_name = isset($estimate['name']) && !empty($estimate['name'])
            ? $estimate['name']
            : __('Untitled Estimate', 'product-estimator');

        // Get estimate ID
        $estimate_id = isset($estimate['db_id']) ? $estimate['db_id'] : '';

        // Build email body based on contact method
        if ($contact_method === 'email') {
            $customer_email = isset($customer_details['email']) ? $customer_details['email'] : '';

            $body = sprintf(
                __("Hello,\n\nA customer has requested to be contacted via email about their estimate.\n\nCustomer Details:\nName: %s\nEmail: %s\nPostcode: %s\n\nEstimate Information:\nName: %s\nID: %s\n\nPlease contact the customer at your earliest convenience.\n\nThis request was sent from %s on %s", 'product-estimator'),
                $customer_name,
                $customer_email,
                isset($customer_details['postcode']) ? $customer_details['postcode'] : '',
                $estimate_name,
                $estimate_id,
                $site_name,
                date_i18n(get_option('date_format'))
            );
        } else {
            $customer_phone = isset($customer_details['phone']) ? $customer_details['phone'] : '';

            $body = sprintf(
                __("Hello,\n\nA customer has requested to be contacted via phone about their estimate.\n\nCustomer Details:\nName: %s\nPhone: %s\nPostcode: %s\n\nEstimate Information:\nName: %s\nID: %s\n\nPlease contact the customer at your earliest convenience.\n\nThis request was sent from %s on %s", 'product-estimator'),
                $customer_name,
                $customer_phone,
                isset($customer_details['postcode']) ? $customer_details['postcode'] : '',
                $estimate_name,
                $estimate_id,
                $site_name,
                date_i18n(get_option('date_format'))
            );
        }

        // Create PDF attachment if estimate is in database
        $attachments = array();
        if ($estimate_id) {
            try {
                // Get the estimate data from DB to ensure it's the latest version
                $db_id = isset($estimate['db_id']) ? $estimate['db_id'] : intval($estimate_id);
                $estimate_data = $this->get_estimate_from_db($db_id);

                // Generate PDF only if we have valid estimate data
                if ($estimate_data) {
                    $pdf_generator = new \RuDigital\ProductEstimator\Includes\Utilities\PDFGenerator();
                    $pdf_content = $pdf_generator->generate_pdf($estimate_data);

                    if (!empty($pdf_content)) {
                        // Save PDF to a temporary file
                        $tmp_file = sys_get_temp_dir() . '/andersens-estimate-' . $db_id . " - " . uniqid() . '.pdf';
                        file_put_contents($tmp_file, $pdf_content);
                        $attachments[] = $tmp_file;
                    }
                }
            } catch (\Exception $e) {
                // Log error but continue to send email without PDF
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Error generating PDF for store contact email: ' . $e->getMessage());
                }
            }
        }

        // Set HTML headers
        $headers = [
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . $from_name . ' <' . $from_email . '>'
        ];

        // Convert line breaks to HTML for email
        $body = wpautop($body);

        // Add PDF URL if available
        if ($estimate_id && isset($estimate['db_id'])) {
            // Get admin PDF URL
            $pdf_url = admin_url('admin.php?page=product-estimator-estimates&action=view&id=' . $estimate['db_id']);
            $body .= '<p><a href="' . esc_url($pdf_url) . '">' . __('View Estimate', 'product-estimator') . '</a></p>';
        }

        error_log("store email: " . $store_email);
        // Send email
//        $sent = wp_mail($store_email, $subject, $body, $headers, $attachments);

        // Delete temporary files
        foreach ($attachments as $file) {
            if (file_exists($file)) {
                @unlink($file);
            }
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            $this->log_debug('Store contact email ' . ($sent ? 'sent' : 'failed') . ' to ' . $store_email);
        }

        return $sent;
    }
}

