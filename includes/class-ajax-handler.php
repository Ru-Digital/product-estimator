<?php
namespace RuDigital\ProductEstimator\Includes;

use WP_Error;

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

            // Get product data
            $product = wc_get_product($product_id);
            if (!$product) {
                wp_send_json_error(['message' => __('Product not found', 'product-estimator')]);
                return;
            }

            // Prepare product data
            $product_data = [
                'id' => $product_id,
                'name' => $product->get_name(),
                'image' => wp_get_attachment_image_url($product->get_image_id(), 'thumbnail')
            ];

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

                // Log the pricing data
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Product price data: ' . print_r($product_data, true));
                }

            } catch (\Exception $e) {
                // If NetSuite API fails, log the error but continue with base price
                error_log('NetSuite API Error: ' . $e->getMessage());

                // Set default price range from WooCommerce price
                $base_price = (float)$product->get_price();
                $product_data['min_price'] = $base_price;
                $product_data['max_price'] = $base_price;
            }

            // Get room area (width * length)
            $room_area = 0;
            if (isset($estimates[$found_estimate_id]['rooms'][$found_room_id])) {
                $room_data = $estimates[$found_estimate_id]['rooms'][$found_room_id];
                if (isset($room_data['width']) && isset($room_data['length'])) {
                    $room_area = (float)$room_data['width'] * (float)$room_data['length'];
                }
            }

            // Calculate price based on min_price * room_area
            if ($room_area > 0 && isset($product_data['min_price'])) {
                $product_data['min_price_total'] = $product_data['min_price'] * $room_area;

                // Log the calculation
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Price calculation: min_price (' . $product_data['min_price'] . ') * room_area (' . $room_area . ') = ' . $product_data['min_price_total']);
                }
            } else {
                // If room area is not available or is zero, use min_price as fallback
                $product_data['min_price_total'] = $product_data['min_price'];

                // Log the fallback
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Room area not available, using max_price as price: ' . $product_data['min_price_total']);
                }
            }

            // Calculate price based on max_price * room_area
            if ($room_area > 0 && isset($product_data['max_price'])) {
                $product_data['max_price_total'] = $product_data['max_price'] * $room_area;

                // Log the calculation
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Price calculation: max_price (' . $product_data['max_price'] . ') * room_area (' . $room_area . ') = ' . $product_data['max_price_total']);
                }
            } else {
                // If room area is not available or is zero, use max_price as fallback
                $product_data['max_price_total'] = $product_data['max_price'];

                // Log the fallback
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Room area not available, using max_price as price: ' . $product_data['max_price_total']);
                }
            }

            $product_data['price_total'] = $product_data['min_price_total'] . " - " . $product_data['max_price_total'];

            // Add product to room
            $success = $this->session->addProductToRoom($found_estimate_id, $found_room_id, $product_data);

            if (!$success) {
                wp_send_json_error([
                    'message' => __('Failed to add product to room', 'product-estimator'),
                    'debug' => [
                        'estimate_id' => $found_estimate_id,
                        'room_id' => $found_room_id
                    ]
                ]);
                return;
            }

            wp_send_json_success([
                'message' => __('Product added successfully', 'product-estimator'),
                'estimate_id' => $found_estimate_id,
                'room_id' => $found_room_id,
                'product_data' => $product_data
            ]);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }

        $this->updateTotals($found_estimate_id);

    }
    /**
     * Get the full estimates list HTML
     */
    public function getEstimatesList() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Start output buffer to capture HTML
        ob_start();

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
    public function addNewRoom() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        if (!isset($_POST['form_data']) || !isset($_POST['estimate_id'])) {
            wp_send_json_error(['message' => __('Required parameters missing', 'product-estimator')]);
            return;
        }

        $estimate_id = sanitize_text_field($_POST['estimate_id']);
        $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;

        // Parse form data
        parse_str($_POST['form_data'], $form_data);

        // Validate room data
        if (empty($form_data['room_name'])) {
            wp_send_json_error(['message' => __('Room name is required', 'product-estimator')]);
            return;
        }

        if (!isset($form_data['room_width']) || !is_numeric($form_data['room_width'])) {
            wp_send_json_error(['message' => __('Valid room width is required', 'product-estimator')]);
            return;
        }

        if (!isset($form_data['room_length']) || !is_numeric($form_data['room_length'])) {
            wp_send_json_error(['message' => __('Valid room length is required', 'product-estimator')]);
            return;
        }

        try {
            // Force session initialization
            $this->session->startSession();

            // Debug logging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Adding room to estimate ID: ' . $estimate_id);
                error_log('Current estimates before room addition: ' . print_r($this->session->getEstimates(), true));
            }

            // Create room data
            $room_data = [
                'name' => sanitize_text_field($form_data['room_name']),
                'width' => floatval($form_data['room_width']),
                'length' => floatval($form_data['room_length']),
                'products' => []
            ];

            // Add room to estimate
            $room_id = $this->session->addRoom($estimate_id, $room_data);

            if (!$room_id && $room_id !== '0') { // Check for both false and non-zero string values
                wp_send_json_error([
                    'message' => __('Failed to add room to estimate', 'product-estimator'),
                    'debug' => [
                        'estimate_id' => $estimate_id,
                        'room_data' => $room_data
                    ]
                ]);
                return;
            }

            // Debug logging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Room added with ID: ' . print_r($room_id, true));
                error_log('Current estimates after room addition: ' . print_r($this->session->getEstimates(), true));
            }

            // If a product ID was provided, add it to the room
            $product_added = false;
            if ($product_id > 0) {
                // Get product data
                $product = wc_get_product($product_id);

                if ($product) {
                    // Instead of duplicating logic, simulate the product data creation from addProductToRoom
                    // but without sending the AJAX response
                    $product_data = [
                        'id' => $product_id,
                        'name' => $product->get_name(),
                        'image' => wp_get_attachment_image_url($product->get_image_id(), 'thumbnail')
                    ];

                    try {
                        // Get room area for calculations
                        $room_area = floatval($form_data['room_width']) * floatval($form_data['room_length']);

                        // Initialize NetSuite Integration for pricing
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

                        // Calculate price based on min_price * room_area
                        if ($room_area > 0 && isset($product_data['min_price'])) {
                            $product_data['min_price_total'] = $product_data['min_price'] * $room_area;
                        } else {
                            // If room area is not available or is zero, use min_price as fallback
                            $product_data['min_price_total'] = $product_data['min_price'];
                        }

                        // Calculate price based on max_price * room_area
                        if ($room_area > 0 && isset($product_data['max_price'])) {
                            $product_data['max_price_total'] = $product_data['max_price'] * $room_area;
                        } else {
                            // If room area is not available or is zero, use max_price as fallback
                            $product_data['max_price_total'] = $product_data['max_price'];
                        }

                        $product_data['price_total'] = $product_data['min_price_total'] . " - " . $product_data['max_price_total'];

                        // Add product to room
                        $product_added = $this->session->addProductToRoom($estimate_id, $room_id, $product_data);

                    } catch (\Exception $e) {
                        error_log('Error calculating product prices: ' . $e->getMessage());

                        // Simplified product data if pricing fails
                        $product_data = [
                            'id' => $product_id,
                            'name' => $product->get_name(),
                            'price' => $product->get_price(),
                            'image' => wp_get_attachment_image_url($product->get_image_id(), 'thumbnail')
                        ];

                        // Still try to add the product even if pricing calculation fails
                        $product_added = $this->session->addProductToRoom($estimate_id, $room_id, $product_data);
                    }
                }
            }

            wp_send_json_success([
                'message' => __('Room added successfully', 'product-estimator'),
                'estimate_id' => $estimate_id,
                'room_id' => $room_id,
                'product_added' => $product_added
            ]);

        } catch (Exception $e) {
            error_log('Exception in addNewRoom: ' . $e->getMessage());
            wp_send_json_error([
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }

        // If a product was added to the new room
        if ($product_added) {
            $this->updateTotals($estimate_id);
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

            wp_send_json_success([
                'message' => __('Product removed successfully', 'product-estimator')
            ]);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }
        $this->updateTotals($estimate_id);

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

            wp_send_json_success([
                'message' => __('Room and all its products removed successfully', 'product-estimator')
            ]);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }

        $this->updateTotals($estimate_id);

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
        // Get the estimate
        $estimate = $this->session->getEstimate($estimate_id);

        if (!$estimate) {
            return;
        }

        // Loop through rooms and update totals
        if (isset($estimate['rooms']) && is_array($estimate['rooms'])) {
            foreach ($estimate['rooms'] as $room_id => $room) {
                $room_totals = $this->session->calculateRoomTotals($room);

                // Store totals in session
                $_SESSION['product_estimator']['estimates'][$estimate_id]['rooms'][$room_id]['min_total'] = $room_totals['min_total'];
                $_SESSION['product_estimator']['estimates'][$estimate_id]['rooms'][$room_id]['max_total'] = $room_totals['max_total'];
            }
        }

        // Calculate and store estimate totals
        $estimate_totals = $this->session->calculateEstimateTotals($estimate);
        $_SESSION['product_estimator']['estimates'][$estimate_id]['min_total'] = $estimate_totals['min_total'];
        $_SESSION['product_estimator']['estimates'][$estimate_id]['max_total'] = $estimate_totals['max_total'];
    }
}
