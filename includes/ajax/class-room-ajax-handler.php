<?php
namespace RuDigital\ProductEstimator\Includes\Ajax;

use RuDigital\ProductEstimator\Includes\SessionHandler;
use RuDigital\ProductEstimator\Includes\Traits\EstimateDbHandler;

/**
 * Room-related AJAX handlers
 */
class RoomAjaxHandler extends AjaxHandlerBase {
    use EstimateDbHandler;

    /**
     * Register WordPress hooks for AJAX endpoints
     *
     * @return void
     */
    protected function register_hooks() {
        $this->register_ajax_endpoint('get_rooms_for_estimate', 'getRoomsForEstimate');
        $this->register_ajax_endpoint('add_new_room', 'addNewRoom');
        $this->register_ajax_endpoint('remove_room', 'removeRoom');
        $this->register_ajax_endpoint('add_product_to_room', 'addProductToRoom');
        $this->register_ajax_endpoint('remove_product_from_room', 'removeProductFromRoom');
        $this->register_ajax_endpoint('replace_product_in_room', 'replaceProductInRoom');
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

            // NOTE: We're deliberately NOT adding the product here.
            // The client will handle product addition after room creation through a separate AJAX request.
            // This maintains separation of concerns and prevents duplicate product addition logic.
            $product_added = false;
            $product_data = null;
            
            // We still log the product_id if it was provided, for reference purposes
            if ($product_id > 0) {
                error_log("Product ID {$product_id} was provided with room creation, but will be added by client.");
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
     * Update room and estimate totals in session via SessionHandler.
     * MODIFIED: Fetches and saves estimate data through SessionHandler, avoiding direct $_SESSION access.
     *
     * @param string|int $estimate_id Estimate ID
     * @return void
     */
    private function updateTotals($estimate_id)
    {
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
    public function prepareAndAddProductToRoom($product_id, $estimate_id, $room_id, $room_width = null, $room_length = null)
    {
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
}
