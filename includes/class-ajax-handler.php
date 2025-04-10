<?php
namespace RuDigital\ProductEstimator\Includes;

use WP_Error;
use RuDigital\ProductEstimator\Includes\Admin\ProductAdditionsManager;

/**
 * AJAX Handlers for Product Estimator
 */
class AjaxHandler {

    /**
     * @var SessionHandler Session handler instance
     */
    private $session;

    /**
     * Initialize the class
     */
    public function __construct() {
        try {
            // Ensure session is started
            $this->session = SessionHandler::getInstance();

            // Register AJAX handlers
            add_action('wp_ajax_get_rooms_for_estimate', array($this, 'getRoomsForEstimate'));
            add_action('wp_ajax_nopriv_get_rooms_for_estimate', array($this, 'getRoomsForEstimate'));

            add_action('wp_ajax_add_product_to_room', array($this, 'addProductToRoom'));
            add_action('wp_ajax_nopriv_add_product_to_room', array($this, 'addProductToRoom'));

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

        } catch (\Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Exception in AjaxHandler constructor: ' . $e->getMessage());
                error_log('Stack trace: ' . $e->getTraceAsString());
            }
        }
    }
/**
 * * Get variation estimator content via AJAX
 * */

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
        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-display.php';

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
        $estimate_id = isset($_POST['estimate_id']) ? sanitize_text_field($_POST['estimate_id']) : '';
        $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;

        if ($estimate_id === '') {
            wp_send_json_error(array(
                'message' => __('No estimate ID provided', 'product-estimator')
            ));
            return;
        }

        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('getRoomsForEstimate called');
            error_log('Estimate ID: ' . $estimate_id);
            error_log('Product ID: ' . $product_id);
        }

        // Get the estimate from session
        $estimate = $this->session->getEstimate($estimate_id);

        if (!$estimate) {
            wp_send_json_error(array(
                'message' => __('Estimate not found', 'product-estimator'),
                'debug' => [
                    'request_estimate_id' => $estimate_id,
                    'available_estimates' => array_keys($this->session->getEstimates())
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
     * Add a product to a room
     */
    public function addProductToRoom() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Validate inputs
        if (!isset($_POST['room_id']) || !isset($_POST['product_id'])) {
            wp_send_json_error(['message' => __('Room ID and Product ID are required', 'product-estimator')]);
            return;
        }

        $room_id = sanitize_text_field($_POST['room_id']);
        $product_id = intval($_POST['product_id']);

        try {
            // Use try-catch to handle potential session or database errors
            $estimates = $this->session->getEstimates();

            // Debug logging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('addProductToRoom called');
                error_log('Room ID: ' . $room_id);
                error_log('Product ID: ' . $product_id);
                error_log('Available estimates: ' . print_r(array_keys($estimates), true));
            }

            // Find the estimate that contains this room
            $found_estimate_id = null;
            $found_room_id = null;

            foreach ($estimates as $estimate_id => $estimate) {
                if (isset($estimate['rooms']) && is_array($estimate['rooms'])) {
                    foreach (array_keys($estimate['rooms']) as $key) {
                        if ((string)$key === (string)$room_id) {
                            $found_estimate_id = $estimate_id;
                            $found_room_id = $key;
                            break 2;
                        }
                    }
                }
            }

            // Handle fallback for '0' room ID
            if ($found_estimate_id === null && ($room_id === '0' || $room_id === 0)) {
                // Find first estimate with rooms
                foreach ($estimates as $estimate_id => $estimate) {
                    if (isset($estimate['rooms']) && !empty($estimate['rooms'])) {
                        $first_room_key = array_key_first($estimate['rooms']);
                        $found_estimate_id = $estimate_id;
                        $found_room_id = $first_room_key;
                        break;
                    }
                }

                // If still no rooms, create a new room in first estimate
                if ($found_estimate_id === null) {
                    $first_estimate_key = array_key_first($estimates);
                    $new_room_data = [
                        'name' => 'Default Room',
                        'width' => 0,
                        'length' => 0,
                        'products' => []
                    ];

                    $found_room_id = $this->session->addRoom($first_estimate_key, $new_room_data);
                    $found_estimate_id = $first_estimate_key;
                }
            }

            // Debugging output
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Room search results:');
                error_log('Estimate ID: ' . print_r($found_estimate_id, true));
                error_log('Room ID: ' . print_r($found_room_id, true));
            }

            // Validate found estimate and room
            if ($found_estimate_id === null || $found_room_id === null) {
                wp_send_json_error([
                    'message' => __('Room not found', 'product-estimator'),
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
                'added_notes' => $result['added_notes']
            ]);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }
    }
    /**
     * Get the full estimates list HTML
     */
    public function getEstimatesList()
    {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Start output buffer to capture HTML
        ob_start();

        // Get all estimates
        $estimates = $this->session->getEstimates();

        // Check if we have a ProductAdditionsManager instance to generate suggestions
        if (class_exists('RuDigital\\ProductEstimator\\Includes\\Admin\\ProductAdditionsManager')) {
            $product_additions_manager = new \RuDigital\ProductEstimator\Includes\Admin\ProductAdditionsManager('product-estimator', '1.0.4');

            // Generate suggestions for each room in each estimate
            foreach ($estimates as $estimate_id => &$estimate) {
                if (isset($estimate['rooms']) && is_array($estimate['rooms'])) {
                    foreach ($estimate['rooms'] as $room_id => &$room) {
                        if (isset($room['products']) && is_array($room['products'])) {
                            // Check if there are any regular (non-note) products in the room
                            $has_regular_products = false;
                            foreach ($room['products'] as $product) {
                                // Skip notes or products without IDs
                                if (isset($product['type']) && $product['type'] === 'note') {
                                    continue;
                                }
                                if (!isset($product['id']) || empty($product['id'])) {
                                    continue;
                                }
                                $has_regular_products = true;
                                break;
                            }

                            // Only generate suggestions if there are actual products in the room
                            if ($has_regular_products) {
                                // Get product categories in the room
                                $product_categories = array();
                                foreach ($room['products'] as $product) {
                                    // Skip notes
                                    if (isset($product['type']) && $product['type'] === 'note') {
                                        continue;
                                    }

                                    if (isset($product['id']) && $product['id'] > 0) {
                                        $categories = wp_get_post_terms($product['id'], 'product_cat', array('fields' => 'ids'));
                                        if (is_array($categories)) {
                                            $product_categories = array_merge($product_categories, $categories);
                                        }
                                    }
                                }

                                // Get unique categories
                                $product_categories = array_unique($product_categories);

                                // Check if any categories have suggestion relationships
                                $has_suggestion_relationships = false;
                                foreach ($product_categories as $category_id) {
                                    $suggestions = $product_additions_manager->get_suggested_products_for_category($category_id);
                                    if (!empty($suggestions)) {
                                        $has_suggestion_relationships = true;
                                        break;
                                    }
                                }

                                // Only add suggestions if there are relationship rules that apply
                                if ($has_suggestion_relationships) {
                                    // Generate suggestions based on room contents
                                    $suggestions = $product_additions_manager->get_suggestions_for_room($room['products']);

                                    // Add suggestions to the room data for template access
                                    if (!empty($suggestions)) {
                                        $room['product_suggestions'] = $suggestions;
                                    }
                                }
                            } else {
                                // No regular products in this room, remove any existing suggestions
                                if (isset($room['product_suggestions'])) {
                                    unset($room['product_suggestions']);
                                }
                            }
                        }
                    }
                }
            }

            // Update only the suggestions in the session, not the entire data
            if (isset($_SESSION['product_estimator']['estimates'])) {
                foreach ($estimates as $estimate_id => $estimate) {
                    if (isset($estimate['rooms']) && is_array($estimate['rooms'])) {
                        foreach ($estimate['rooms'] as $room_id => $room) {
                            if (isset($room['product_suggestions'])) {
                                // Only update the suggestions, not the entire room data
                                $_SESSION['product_estimator']['estimates'][$estimate_id]['rooms'][$room_id]['product_suggestions'] =
                                    $room['product_suggestions'];
                            } else if (isset($_SESSION['product_estimator']['estimates'][$estimate_id]['rooms'][$room_id]['product_suggestions'])) {
                                // Remove suggestions if they've been removed from our local copy
                                unset($_SESSION['product_estimator']['estimates'][$estimate_id]['rooms'][$room_id]['product_suggestions']);
                            }
                        }
                    }
                }
            }
        }

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
        $this->session->startSession();

        // Get all estimates
        $estimates = $this->session->getEstimates();

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
     * Add a new estimate
     */
    public function addNewEstimate() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

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
            $this->session->startSession();

            // Create new estimate data
            $estimate_data = [
                'name' => sanitize_text_field($form_data['estimate_name']),
                'created_at' => current_time('mysql'),
                'rooms' => []
            ];

            // Add estimate to session
            $estimate_id = $this->session->addEstimate($estimate_data);

            if (!$estimate_id && $estimate_id !== '0') { // Check for both false and non-zero values
                wp_send_json_error(['message' => __('Failed to create estimate', 'product-estimator')]);
                return;
            }

            // Debug log
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Estimate created with ID: ' . print_r($estimate_id, true));
                error_log('Current session estimates: ' . print_r($this->session->getEstimates(), true));
            }

            wp_send_json_success([
                'message' => __('Estimate created successfully', 'product-estimator'),
                'estimate_id' => $estimate_id
            ]);

        } catch (Exception $e) {
            wp_send_json_error(['message' => $e->getMessage()]);
        }
    }

    /**
     * Handle new room submission
     */
    /**
     * Handle new room submission
     */
    public function addNewRoom() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Enhanced debugging
        error_log('=== NEW ROOM SUBMISSION - START ===');
        error_log('POST data: ' . print_r($_POST, true));

        if (!isset($_POST['form_data']) || !isset($_POST['estimate_id'])) {
            error_log('Required parameters missing in request');
            wp_send_json_error(['message' => __('Required parameters missing', 'product-estimator')]);
            return;
        }

        $estimate_id = sanitize_text_field($_POST['estimate_id']);
        $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;

        error_log("Estimate ID: $estimate_id, Product ID: $product_id");

        // Parse form data
        parse_str($_POST['form_data'], $form_data);
        error_log('Parsed form data: ' . print_r($form_data, true));

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
            $this->session->startSession();

            // Get current estimates for debugging
            $current_estimates = $this->session->getEstimates();
            error_log('Current estimates before adding room: ' . print_r($current_estimates, true));

            // Create room data with explicit values - USING STRICT TYPE CONVERSION
            $room_width = (float)$form_data['room_width'];
            $room_length = (float)$form_data['room_length'];
            $room_name = sanitize_text_field($form_data['room_name']);

            error_log("Room dimensions from form: width=$room_width, length=$room_length, name=$room_name");

            $room_data = [
                'name' => $room_name,
                'width' => $room_width,
                'length' => $room_length,
                'products' => []
            ];

            error_log('Prepared room data: ' . print_r($room_data, true));

            // Add room to estimate
            $room_id = $this->session->addRoom($estimate_id, $room_data);
            error_log("Result of addRoom: room_id=$room_id");

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
            $updated_estimates = $this->session->getEstimates();
            error_log('Estimates after adding room: ' . print_r($updated_estimates, true));

            // Check if the room exists with correct data
            if (isset($updated_estimates[$estimate_id]['rooms'][$room_id])) {
                $saved_room = $updated_estimates[$estimate_id]['rooms'][$room_id];
                error_log("Saved room data: " . print_r($saved_room, true));

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
                error_log("Adding product $product_id to room $room_id");

                // Use common method to prepare and add product to room - PASS THE EXACT DIMENSIONS
                $result = $this->prepareAndAddProductToRoom(
                    $product_id,
                    $estimate_id,
                    $room_id,
                    $room_width,   // Pass the original width value
                    $room_length   // Pass the original length value
                );

                error_log('Result of prepareAndAddProductToRoom: ' . print_r($result, true));
                $product_added = $result['success'];

                if ($product_added) {
                    $product_data = $result['product_data'];

                    // Generate product suggestions immediately for the new room
                    if (class_exists('RuDigital\\ProductEstimator\\Includes\\Admin\\ProductAdditionsManager')) {
                        $product_additions_manager = new \RuDigital\ProductEstimator\Includes\Admin\ProductAdditionsManager('product-estimator', '1.0.4');

                        // Get product categories
                        $product_categories = array();
                        $categories = wp_get_post_terms($product_id, 'product_cat', array('fields' => 'ids'));
                        if (is_array($categories)) {
                            $product_categories = $categories;
                        }

                        // Check if any categories have suggestion relationships
                        $has_suggestion_relationships = false;
                        foreach ($product_categories as $category_id) {
                            $suggestions = $product_additions_manager->get_suggested_products_for_category($category_id);
                            if (!empty($suggestions)) {
                                $has_suggestion_relationships = true;
                                break;
                            }
                        }

                        // Only add suggestions if there are relationship rules that apply
                        if ($has_suggestion_relationships) {
                            // Get the updated products list for the room
                            $updated_room = $this->session->getRoom($estimate_id, $room_id);
                            if ($updated_room && isset($updated_room['products'])) {
                                // Generate suggestions based on room contents
                                $suggestions = $product_additions_manager->get_suggestions_for_room($updated_room['products']);

                                // Add suggestions to the session directly
                                if (!empty($suggestions)) {
                                    $_SESSION['product_estimator']['estimates'][$estimate_id]['rooms'][$room_id]['product_suggestions'] = $suggestions;
                                    error_log("Added product suggestions: " . print_r($suggestions, true));
                                }
                            }
                        }
                    }
                }
            }

            // Final check of session data
            $final_estimates = $this->session->getEstimates();
            error_log('Final estimate data: ' . print_r($final_estimates, true));
            error_log('=== NEW ROOM SUBMISSION - END ===');

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
                'has_suggestions' => isset($_SESSION['product_estimator']['estimates'][$estimate_id]['rooms'][$room_id]['product_suggestions'])
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
     * Check if any estimates exist in the session
     */
    public function checkEstimatesExist() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        $has_estimates = $this->session->hasEstimates();

        wp_send_json_success([
            'has_estimates' => $has_estimates
        ]);
    }

    /**
     * Remove a product from a room
     */
    public function removeProductFromRoom()
    {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        if (!isset($_POST['estimate_id']) || !isset($_POST['room_id']) || !isset($_POST['product_index'])) {
            wp_send_json_error(['message' => __('Required parameters missing', 'product-estimator')]);
            return;
        }

        $estimate_id = sanitize_text_field($_POST['estimate_id']);
        $room_id = sanitize_text_field($_POST['room_id']);
        $product_index = intval($_POST['product_index']);

        try {
            // Get the estimate from session
            $estimate = $this->session->getEstimate($estimate_id);

            if (!$estimate) {
                wp_send_json_error(['message' => __('Estimate not found', 'product-estimator')]);
                return;
            }

            // Check if the room exists
            if (!isset($estimate['rooms'][$room_id])) {
                wp_send_json_error(['message' => __('Room not found in this estimate', 'product-estimator')]);
                return;
            }

            // Check if the product index is valid
            if (!isset($estimate['rooms'][$room_id]['products'][$product_index])) {
                wp_send_json_error(['message' => __('Product not found in this room', 'product-estimator')]);
                return;
            }

            // Remove the product
            $removed = $this->session->removeProductFromRoom($estimate_id, $room_id, $product_index);

            if (!$removed) {
                wp_send_json_error(['message' => __('Failed to remove product from room', 'product-estimator')]);
                return;
            }

            // Update totals after removing the product
            $this->updateTotals($estimate_id);

            wp_send_json_success([
                'message' => __('Product removed successfully', 'product-estimator')
            ]);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage()
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
            $estimate = $this->session->getEstimate($estimate_id);

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
            $removed = $this->session->removeRoom($estimate_id, $room_id);

            if (!$removed) {
                wp_send_json_error(['message' => __('Failed to remove room from estimate', 'product-estimator')]);
                return;
            }

            $this->updateTotals($estimate_id);


            wp_send_json_success([
                'message' => __('Room and all its products removed successfully', 'product-estimator')
            ]);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }


    }


    /**
     * Remove an entire estimate
     */
    public function removeEstimate()
    {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        if (!isset($_POST['estimate_id'])) {
            wp_send_json_error(['message' => __('Estimate ID is required', 'product-estimator')]);
            return;
        }

        $estimate_id = sanitize_text_field($_POST['estimate_id']);

        try {
            // Get the estimate from session
            $estimate = $this->session->getEstimate($estimate_id);

            if (!$estimate) {
                wp_send_json_error(['message' => __('Estimate not found', 'product-estimator')]);
                return;
            }

            // Remove the estimate
            $removed = $this->session->removeEstimate($estimate_id);

            if (!$removed) {
                wp_send_json_error(['message' => __('Failed to remove estimate', 'product-estimator')]);
                return;
            }

            wp_send_json_success([
                'message' => __('Estimate removed successfully', 'product-estimator')
            ]);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Update room and estimate totals in session
     *
     * @param string $estimate_id Estimate ID
     */
    private function updateTotals($estimate_id) {
        // Ensure session is started
        $this->session->startSession();

        // Reference to session data for direct manipulation
        $estimates = &$_SESSION['product_estimator']['estimates'];

        if (!isset($estimates[$estimate_id])) {
            return;
        }

        // Get default markup from settings
        $options = get_option('product_estimator_settings');
        $default_markup = isset($options['default_markup']) ? floatval($options['default_markup']) : 0;

        $estimate_min_total = 0;
        $estimate_max_total = 0;

        // Loop through rooms and calculate totals
        if (isset($estimates[$estimate_id]['rooms'])) {
            foreach ($estimates[$estimate_id]['rooms'] as $room_id => &$room) {
                $room_min_total = 0;
                $room_max_total = 0;

                // Calculate room area
                $room_width = isset($room['width']) ? floatval($room['width']) : 0;
                $room_length = isset($room['length']) ? floatval($room['length']) : 0;
                $room_area = $room_width * $room_length;

                if (isset($room['products']) && is_array($room['products'])) {
                    foreach ($room['products'] as $product) {
                        // Calculate main product price
                        if (isset($product['min_price']) && isset($product['max_price'])) {
                            // Apply markup adjustment
                            $min_price = floatval($product['min_price']) * (1 - ($default_markup / 100));
                            $max_price = floatval($product['max_price']) * (1 + ($default_markup / 100));

                            // Add to totals
                            $room_min_total += $min_price * $room_area;
                            $room_max_total += $max_price * $room_area;
                        } elseif (isset($product['min_price_total']) && isset($product['max_price_total'])) {
                            // For pre-calculated totals
                            $room_min_total += floatval($product['min_price_total']) * (1 - ($default_markup / 100));
                            $room_max_total += floatval($product['max_price_total']) * (1 + ($default_markup / 100));
                        }

                        // Calculate additional products prices
                        if (isset($product['additional_products']) && is_array($product['additional_products'])) {
                            foreach ($product['additional_products'] as $additional_product) {
                                if (isset($additional_product['min_price']) && isset($additional_product['max_price'])) {
                                    // Apply markup adjustment
                                    $add_min_price = floatval($additional_product['min_price']) * (1 - ($default_markup / 100));
                                    $add_max_price = floatval($additional_product['max_price']) * (1 + ($default_markup / 100));

                                    // Add to totals with room area
                                    $room_min_total += $add_min_price * $room_area;
                                    $room_max_total += $add_max_price * $room_area;
                                } elseif (isset($additional_product['min_price_total']) && isset($additional_product['max_price_total'])) {
                                    // For pre-calculated totals
                                    $room_min_total += floatval($additional_product['min_price_total']) * (1 - ($default_markup / 100));
                                    $room_max_total += floatval($additional_product['max_price_total']) * (1 + ($default_markup / 100));
                                }
                            }
                        }
                    }
                }

                // Store room totals directly in the session
                $room['min_total'] = $room_min_total;
                $room['max_total'] = $room_max_total;

                // Add to estimate totals
                $estimate_min_total += $room_min_total;
                $estimate_max_total += $room_max_total;
            }
        }

        // Store estimate totals directly in the session
        $estimates[$estimate_id]['min_total'] = $estimate_min_total;
        $estimates[$estimate_id]['max_total'] = $estimate_max_total;
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
    private function prepareAndAddProductToRoom($product_id, $estimate_id, $room_id, $room_width = null, $room_length = null) {
        try {
            // Get product data
            $product = wc_get_product($product_id);
            if (!$product) {
                return [
                    'success' => false,
                    'message' => __('Product not found', 'product-estimator')
                ];
            }

            // Prepare base product data
            $product_data = [
                'id' => $product_id,
                'name' => $product->get_name(),
                'image' => wp_get_attachment_image_url($product->get_image_id(), 'thumbnail'),
                'additional_products' => [],
                'additional_notes' => []
            ];

            // Calculate room area
            $room_area = 0;

            // If room dimensions were provided directly
            if ($room_width !== null && $room_length !== null) {
                $room_area = (float)$room_width * (float)$room_length;
            } else {
                // Get room dimensions from session
                $estimates = $this->session->getEstimates();
                if (isset($estimates[$estimate_id]['rooms'][$room_id])) {
                    $room_data = $estimates[$estimate_id]['rooms'][$room_id];
                    if (isset($room_data['width']) && isset($room_data['length'])) {
                        $room_area = (float)$room_data['width'] * (float)$room_data['length'];
                    }
                }
            }

            // Get price range from NetSuite API
            try {
                // Initialize NetSuite Integration
                $netsuite_integration = new \RuDigital\ProductEstimator\Includes\Integration\NetsuiteIntegration();

                // Get pricing data for this product
                $pricing_data = $netsuite_integration->get_product_prices([$product_id]);

                // Check if we received valid pricing data
                if (!empty($pricing_data['prices']) && is_array($pricing_data['prices'])) {
                    foreach ($pricing_data['prices'] as $price_item) {
                        if ($price_item['product_id'] == $product_id) {
                            // Add NetSuite pricing data to product
                            $product_data['min_price'] = $price_item['min_price'];
                            $product_data['max_price'] = $price_item['max_price'];
                            break;
                        }
                    }
                }

                // If NetSuite data not found, set defaults based on WC price
                if (!isset($product_data['min_price'])) {
                    $base_price = (float)$product->get_price();
                    $product_data['min_price'] = $base_price;
                    $product_data['max_price'] = $base_price;
                }
            } catch (\Exception $e) {
                // If NetSuite API fails, log the error but continue with base price
                error_log('NetSuite API Error: ' . $e->getMessage());

                // Set default price range from WooCommerce price
                $base_price = (float)$product->get_price();
                $product_data['min_price'] = $base_price;
                $product_data['max_price'] = $base_price;
            }

            // Calculate price totals based on room area
            if ($room_area > 0) {
                $product_data['min_price_total'] = $product_data['min_price'] * $room_area;
                $product_data['max_price_total'] = $product_data['max_price'] * $room_area;
            } else {
                // If room area is not available or is zero, use min/max_price as fallback
                $product_data['min_price_total'] = $product_data['min_price'];
                $product_data['max_price_total'] = $product_data['max_price'];
            }

            // PRODUCT ADDITIONS - auto-add related products and notes
            $product_categories = wp_get_post_terms($product_id, 'product_cat', array('fields' => 'ids'));

            // Check if ProductAdditionsManager is accessible
            if (class_exists('RuDigital\\ProductEstimator\\Includes\\Admin\\ProductAdditionsManager')) {
                $product_additions_manager = new \RuDigital\ProductEstimator\Includes\Admin\ProductAdditionsManager('product-estimator', '1.0.3');
                $auto_add_products = array();
                $auto_add_notes = array();

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

                    // Prepare related product data
                    $related_product_data = [
                        'id' => $related_product_id,
                        'name' => $related_product->get_name(),
                        'image' => wp_get_attachment_image_url($related_product->get_image_id(), 'thumbnail')
                    ];

                    // Add pricing data (similar to original product)
                    try {
                        // Try to get pricing from NetSuite
                        $pricing_data = $netsuite_integration->get_product_prices([$related_product_id]);

                        if (!empty($pricing_data['prices']) && is_array($pricing_data['prices'])) {
                            foreach ($pricing_data['prices'] as $price_item) {
                                if ($price_item['product_id'] == $related_product_id) {
                                    $related_product_data['min_price'] = $price_item['min_price'];
                                    $related_product_data['max_price'] = $price_item['max_price'];
                                    break;
                                }
                            }
                        }

                        // If NetSuite data not found, use WC price
                        if (!isset($related_product_data['min_price'])) {
                            $base_price = (float)$related_product->get_price();
                            $related_product_data['min_price'] = $base_price;
                            $related_product_data['max_price'] = $base_price;
                        }

                        // Calculate totals based on room area
                        if ($room_area > 0) {
                            $related_product_data['min_price_total'] = $related_product_data['min_price'] * $room_area;
                            $related_product_data['max_price_total'] = $related_product_data['max_price'] * $room_area;
                        } else {
                            $related_product_data['min_price_total'] = $related_product_data['min_price'];
                            $related_product_data['max_price_total'] = $related_product_data['max_price'];
                        }

                        // Add to product's additional products list
                        $product_data['additional_products'][] = $related_product_data;

                    } catch (\Exception $e) {
                        error_log('Error adding related product: ' . $e->getMessage());
                    }
                }

                // Handle auto-add notes
                foreach ($auto_add_notes as $note_text) {
                    // Create note data
                    $note_data = [
                        'id' => 'note_' . uniqid(),
                        'type' => 'note',
                        'name' => __('Note', 'product-estimator'),
                        'note_text' => $note_text,
                    ];

                    // Add to product's additional notes list
                    $product_data['additional_notes'][] = $note_data;
                }
            }

            // Add product to room
            $success = $this->session->addProductToRoom($estimate_id, $room_id, $product_data);

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
                'added_notes' => !empty($auto_add_notes) ? count($auto_add_notes) : 0
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage()
            ];
        }
    }
}
