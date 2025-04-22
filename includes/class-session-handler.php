<?php
namespace RuDigital\ProductEstimator\Includes;

/**
 * Handles session management for the plugin
 */
class SessionHandler {
    /**
     * @var SessionHandler|null Singleton instance
     */
    private static $instance = null;

    /**
     * @var bool Whether session has been started
     */
    private $session_started = false;

    /**
     * @var array Session data storage
     */
    private $session_data = [];

    /**
     * Get singleton instance
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Private constructor for singleton
     */
    private function __construct() {
        // Ensure session is started
        $this->startSession();
    }

    /**
     * Start the session safely
     */
    public function startSession() {
        if ($this->session_started) {
            return;
        }

        // Check if headers have been sent
        if (headers_sent($file, $line)) {
            error_log("Headers already sent in $file on line $line");
            return;
        }

        // Start session if not already started
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }

        // Initialize session data if not exists
        if (!isset($_SESSION['product_estimator'])) {
            $_SESSION['product_estimator'] = [
                'estimates' => []
            ];
        }

        // Ensure estimates array exists
        if (!isset($_SESSION['product_estimator']['estimates'])) {
            $_SESSION['product_estimator']['estimates'] = [];
        }

        // Store session data locally
        $this->session_data = &$_SESSION['product_estimator'];
        $this->session_started = true;
    }

    /**
     * Close the session safely
     */
    public function closeSession() {
        if ($this->session_started && session_status() === PHP_SESSION_ACTIVE) {
            session_write_close();
            $this->session_started = false;
        }
    }

    /**
     * Add a new estimate
     *
     * @param array $data Estimate data
     * @return int|string New estimate ID
     */
    public function addEstimate($data) {
        $this->startSession();

        // Ensure rooms array exists
        if (!isset($data['rooms']) || !is_array($data['rooms'])) {
            $data['rooms'] = [];
        }

        // Generate a new estimate ID
        $new_id = count($this->session_data['estimates']) > 0
            ? (string)(max(array_map('intval', array_keys($this->session_data['estimates']))) + 1)
            : '0';

        // Add the estimate
        $this->session_data['estimates'][$new_id] = $data;
        return $new_id;
    }

    /**
     * Add a room to an estimate
     *
     * @param string|int $estimate_id Estimate ID
     * @param array $room_data Room data
     * @return string|int|bool New room ID or false on failure
     */
    public function addRoom($estimate_id, $room_data) {
        $this->startSession();

        // Ensure rooms array exists
        if (!isset($this->session_data['estimates'][$estimate_id]['rooms'])) {
            $this->session_data['estimates'][$estimate_id]['rooms'] = [];
        }

        // Generate a new room ID
        $rooms = $this->session_data['estimates'][$estimate_id]['rooms'];
        $new_room_id = count($rooms) > 0
            ? (string)(max(array_map('intval', array_keys($rooms))) + 1)
            : '0';

        // Ensure products array exists
        if (!isset($room_data['products'])) {
            $room_data['products'] = [];
        }

        // Add the room
        $this->session_data['estimates'][$estimate_id]['rooms'][$new_room_id] = $room_data;

        return $new_room_id;
    }

    /**
     * Add a product to a room - with improved handling for '0' room ID
     *
     * @param string|int $estimate_id Estimate ID
     * @param string|int $room_id Room ID
     * @param array $product_data Product data
     * @return bool Success
     */
    public function addProductToRoom($estimate_id, $room_id, $product_data) {
        // Ensure session is started
        $this->startSession();

        // Important: Cast IDs to strings for consistent array access
        $estimate_id_str = (string)$estimate_id;
        $room_id_str = (string)$room_id;

        // Validate inputs - ensure estimate exists
        if (!isset($this->session_data['estimates'][$estimate_id_str])) {
            error_log("Estimate {$estimate_id_str} not found");
            error_log("Available estimates: " . implode(', ', array_keys($this->session_data['estimates'] ?? [])));
            return false;
        }

        // Ensure rooms array exists
        if (!isset($this->session_data['estimates'][$estimate_id_str]['rooms'])) {
            // Initialize rooms array if it doesn't exist
            $this->session_data['estimates'][$estimate_id_str]['rooms'] = [];
        }

        // Validate room exists in this specific estimate
        if (!isset($this->session_data['estimates'][$estimate_id_str]['rooms'][$room_id_str])) {
            error_log("Room {$room_id_str} not found in estimate {$estimate_id_str}");
            error_log("Available rooms: " . implode(', ', array_keys($this->session_data['estimates'][$estimate_id_str]['rooms'] ?? [])));
            return false;
        }

        // Ensure products array exists for the room
        if (!isset($this->session_data['estimates'][$estimate_id_str]['rooms'][$room_id_str]['products'])) {
            $this->session_data['estimates'][$estimate_id_str]['rooms'][$room_id_str]['products'] = [];
        }

        // Add product to room
        $this->session_data['estimates'][$estimate_id_str]['rooms'][$room_id_str]['products'][] = $product_data;
        return true;
    }

    /**
     * Get all estimates
     *
     * @return array Estimates data
     */
    public function getEstimates() {
        $this->startSession();
        return $this->session_data['estimates'] ?? [];
    }

    /**
     * Get a specific estimate by ID
     *
     * @param string|int $id Estimate ID
     * @return array|null Estimate data or null if not found
     */
    public function getEstimate($id) {
        $this->startSession();
        return $this->session_data['estimates'][$id] ?? null;
    }

    /**
     * Check if estimates exist in session
     *
     * @return bool Whether estimates exist
     */
    public function hasEstimates() {
        $this->startSession();
        return !empty($this->session_data['estimates']);
    }

    /**
     * Get a specific room by ID with improved handling for '0' room ID
     *
     * @param string|int $estimate_id Estimate ID
     * @param string|int $room_id Room ID
     * @return array|null Room data or null if not found
     */
    public function getRoom($estimate_id, $room_id) {
        $this->startSession();

        // Cast IDs to strings for consistent array access
        $estimate_id_str = (string)$estimate_id;
        $room_id_str = (string)$room_id;

        // Check if estimate exists
        if (!isset($this->session_data['estimates'][$estimate_id_str])) {
            error_log("Estimate {$estimate_id_str} not found in getRoom");
            return null;
        }

        // Check if rooms exist in the estimate
        if (!isset($this->session_data['estimates'][$estimate_id_str]['rooms'])) {
            error_log("No rooms found in estimate {$estimate_id_str}");
            return null;
        }

        // Try to find the room
        if (isset($this->session_data['estimates'][$estimate_id_str]['rooms'][$room_id_str])) {
            return $this->session_data['estimates'][$estimate_id_str]['rooms'][$room_id_str];
        } else {
            error_log("Room {$room_id_str} not found in estimate {$estimate_id_str}");
            error_log("Available rooms: " . implode(', ', array_keys($this->session_data['estimates'][$estimate_id_str]['rooms'])));
            return null;
        }
    }

    /**
     * Debug function to dump session data
     *
     * @return array Current session data
     */
    public function debugDump() {
        $this->startSession();
        return [
            'session_id' => session_id(),
            'session_active' => $this->session_started,
            'session_status' => session_status(),
            'estimates' => $this->getEstimates(),
            'has_estimates' => $this->hasEstimates()
        ];
    }

    /**
     * Remove a product from a room
     *
     * @param string|int $estimate_id Estimate ID
     * @param string|int $room_id Room ID
     * @param int $product_index Index of the product in the products array
     * @return bool Success
     */
    public function removeProductFromRoom($estimate_id, $room_id, $product_index)
    {
        // Ensure session is started
        $this->startSession();

        // Validate inputs
        if (!isset($this->session_data['estimates'][$estimate_id])) {
            error_log("Estimate $estimate_id not found");
            return false;
        }

        if (!isset($this->session_data['estimates'][$estimate_id]['rooms'][$room_id])) {
            error_log("Room $room_id not found in estimate $estimate_id");
            return false;
        }

        if (!isset($this->session_data['estimates'][$estimate_id]['rooms'][$room_id]['products'][$product_index])) {
            error_log("Product index $product_index not found in room $room_id");
            return false;
        }

        // Remove the product from the array
        array_splice($this->session_data['estimates'][$estimate_id]['rooms'][$room_id]['products'], $product_index, 1);
        return true;
    }

    /**
     * Remove a room from an estimate
     *
     * @param string|int $estimate_id Estimate ID
     * @param string|int $room_id Room ID
     * @return bool Success
     */
    public function removeRoom($estimate_id, $room_id)
    {
        // Ensure session is started
        $this->startSession();

        // Force string conversion for consistency
        $estimate_id = (string)$estimate_id;
        $room_id = (string)$room_id;

        // Validate inputs
        if (!isset($this->session_data['estimates'][$estimate_id])) {
            error_log("Estimate $estimate_id not found");
            return false;
        }

        if (!isset($this->session_data['estimates'][$estimate_id]['rooms'][$room_id])) {
            error_log("Room $room_id not found in estimate $estimate_id");
            return false;
        }

        // Get a reference to the rooms array for direct manipulation
        $rooms = &$this->session_data['estimates'][$estimate_id]['rooms'];

        // Remove the room
        unset($rooms[$room_id]);
        return true;
    }

    /**
     * Remove an entire estimate
     *
     * @param string|int $estimate_id Estimate ID
     * @return bool Success
     */
    public function removeEstimate($estimate_id)
    {
        // Ensure session is started
        $this->startSession();

        // Validate inputs
        if (!isset($this->session_data['estimates'][$estimate_id])) {
            error_log("Estimate $estimate_id not found");
            return false;
        }

        // Remove the estimate
        unset($this->session_data['estimates'][$estimate_id]);
        return true;
    }

    /**
     * Calculate total price range for a room
     *
     * @param array $room Room data with products
     * @param float $estimate_markup The markup percentage from the parent estimate
     * @return array Array with min_total and max_total values
     */
    public function calculateRoomTotals($room, $estimate_markup = null) {
        $min_total = 0;
        $max_total = 0;

        // Get default markup from settings
        $options = get_option('product_estimator_settings');
        $default_markup = $estimate_markup !== null ? $estimate_markup : 0;

        // Calculate room area
        $room_width = isset($room['width']) ? floatval($room['width']) : 0;
        $room_length = isset($room['length']) ? floatval($room['length']) : 0;
        $room_area = $room_width * $room_length;

        if (isset($room['products']) && is_array($room['products'])) {
            foreach ($room['products'] as $product) {
                // Skip notes
                if (isset($product['type']) && $product['type'] === 'note') {
                    continue;
                }

                // Get pricing method from product data
                $pricing_method = isset($product['pricing_method']) ? $product['pricing_method'] : 'sqm';

                // Calculate main product prices
                if (isset($product['min_price']) && isset($product['max_price'])) {
                    // Apply markup adjustment
//                    $min_price = floatval($product['min_price']) * (1 - ($default_markup / 100));
//                    $max_price = floatval($product['max_price']) * (1 + ($default_markup / 100));

                    // Round the prices
                    $min_price = $product['min_price'];
                    $max_price = $product['max_price'];

                    // Calculate based on pricing method
                    if ($pricing_method === 'sqm' && $room_area > 0) {
                        $product_min_total = $min_price * $room_area;
                        $product_max_total = $max_price * $room_area;

                        $min_total += $product_min_total;
                        $max_total += $product_max_total;
                    } else {
                        // Fixed pricing - already rounded
                        $min_total += $min_price;
                        $max_total += $max_price;
                    }
                } elseif (isset($product['min_price_total']) && isset($product['max_price_total'])) {
                    // For pre-calculated totals
//                    $min_product_total = floatval($product['min_price_total']) * (1 - ($default_markup / 100));
//                    $max_product_total = floatval($product['max_price_total']) * (1 + ($default_markup / 100));

                    // Round the product totals
                    $min_product_total = $product['min_price_total'];
                    $max_product_total = $product['max_price_total'];

                    $min_total += $min_product_total;
                    $max_total += $max_product_total;
                }

                // Calculate additional products prices
                if (isset($product['additional_products']) && is_array($product['additional_products'])) {
                    foreach ($product['additional_products'] as $additional_product) {
                        // Get the additional product pricing method
                        $add_pricing_method = isset($additional_product['pricing_method']) ?
                            $additional_product['pricing_method'] : $pricing_method;

                        if (isset($additional_product['min_price']) && isset($additional_product['max_price'])) {
                            // Apply markup adjustment
//                            $add_min_price = floatval($additional_product['min_price']) * (1 - ($default_markup / 100));
//                            $add_max_price = floatval($additional_product['max_price']) * (1 + ($default_markup / 100));

                            // Round the prices
                            $add_min_price = $additional_product['min_price'];
                            $add_max_price = $additional_product['max_price'];

                            // Calculate based on pricing method
                            if ($add_pricing_method === 'sqm' && $room_area > 0) {
                                $add_min_total = $add_min_price * $room_area;
                                $add_max_total = $add_max_price * $room_area;

                                $min_total += $add_min_total;
                                $max_total += $add_max_total;
                            } else {
                                // Fixed pricing - already rounded
                                $min_total += $add_min_price;
                                $max_total += $add_max_price;
                            }
                        } elseif (isset($additional_product['min_price_total']) && isset($additional_product['max_price_total'])) {
                            // For pre-calculated totals
//                            $add_min_total = floatval($additional_product['min_price_total']) * (1 - ($default_markup / 100));
//                            $add_max_total = floatval($additional_product['max_price_total']) * (1 + ($default_markup / 100));

                            // Round the totals
                            $add_min_total = $additional_product['min_price_total'];
                            $add_max_total = $additional_product['max_price_total'];

                            $min_total += $add_min_total;
                            $max_total += $add_max_total;
                        }
                    }
                }
            }
        }

        // Round the final room totals
        $min_total = $min_total;
        $max_total = $max_total;

        return [
            'min_total' => $min_total,
            'max_total' => $max_total
        ];
    }

    /**
     * Calculate total price range for an estimate
     *
     * @param array $estimate Estimate data with rooms
     * @return array Array with min_total and max_total values
     */
    public function calculateEstimateTotals($estimate) {
        $estimate_min = 0;
        $estimate_max = 0;

        $estimate_markup = isset($estimate['default_markup']) ? floatval($estimate['default_markup']) : null;


        if (isset($estimate['rooms']) && is_array($estimate['rooms'])) {
            foreach ($estimate['rooms'] as $room) {
                $room_totals = $this->calculateRoomTotals($room, $estimate_markup);
                $estimate_min += $room_totals['min_total'];
                $estimate_max += $room_totals['max_total'];
            }
        }

        return [
            'min_total' => $estimate_min,
            'max_total' => $estimate_max
        ];
    }

    /**
     * Initialize totals for all estimates in session
     * This ensures totals are set for existing session data
     */
    public function initializeAllTotals() {
        // Ensure session is started
        $this->startSession();

        // Reference to session data for direct manipulation
        if (!isset($_SESSION['product_estimator']['estimates'])) {
            return;
        }

        $estimates = &$_SESSION['product_estimator']['estimates'];


        // Get all pricing rules
        $pricing_rules = get_option('product_estimator_pricing_rules', []);

        foreach ($estimates as $estimate_id => &$estimate) {

            $default_markup = isset($estimate['default_markup'])
                ? floatval($estimate['default_markup'])
                : 0;

            $estimate_min_total = 0;
            $estimate_max_total = 0;

            if (isset($estimate['rooms'])) {
                foreach ($estimate['rooms'] as $room_id => &$room) {
                    $room_min_total = 0;
                    $room_max_total = 0;

                    // Calculate room area
                    $room_width = isset($room['width']) ? floatval($room['width']) : 0;
                    $room_length = isset($room['length']) ? floatval($room['length']) : 0;
                    $room_area = $room_width * $room_length;

                    if (isset($room['products']) && is_array($room['products'])) {
                        foreach ($room['products'] as &$product) {
                            // Skip notes
                            if (isset($product['type']) && $product['type'] === 'note') {
                                continue;
                            }

                            // Get product categories to determine pricing method
                            $product_id = isset($product['id']) ? $product['id'] : 0;
                            $pricing_method = isset($product['pricing_method']) ? $product['pricing_method'] : 'sqm';

                            // Determine pricing method based on rules if not already set
                            if ($product_id > 0 && !isset($product['pricing_method'])) {
                                // Get the pricing method from rules if not already set
                                $product_categories = wp_get_post_terms($product_id, 'product_cat', ['fields' => 'ids']);

                                // Check rules for matching categories
                                foreach ($pricing_rules as $rule) {
                                    if (isset($rule['categories']) && is_array($rule['categories'])) {
                                        $matching_categories = array_intersect($product_categories, $rule['categories']);
                                        if (!empty($matching_categories)) {
                                            $pricing_method = isset($rule['pricing_method']) ? $rule['pricing_method'] : 'sqm';
                                            break;
                                        }
                                    }
                                }

                                // Store the pricing method in the product data
                                $product['pricing_method'] = $pricing_method;
                            }

                            // Calculate main product prices
                            if (isset($product['min_price']) && isset($product['max_price'])) {
                                // Apply markup adjustment
//                                $min_price = floatval($product['min_price']) * (1 - ($default_markup / 100));
//                                $max_price = floatval($product['max_price']) * (1 + ($default_markup / 100));

                                // Round the unit prices
                                $min_price = $product['min_price'];
                                $max_price = $product['max_price'];

                                // Calculate based on pricing method
                                if ($pricing_method === 'sqm' && $room_area > 0) {
                                    $min_total = $min_price * $room_area;
                                    $max_total = $max_price * $room_area;

                                    // Store calculated totals
                                    $product['min_price_total'] = $min_total;
                                    $product['max_price_total'] = $max_total;

                                    // Add to room totals
                                    $room_min_total += $min_total;
                                    $room_max_total += $max_total;
                                } else {
                                    // Fixed pricing - already rounded above
                                    $product['min_price_total'] = $min_price;
                                    $product['max_price_total'] = $max_price;
                                    $room_min_total += $min_price;
                                    $room_max_total += $max_price;
                                }
                            } elseif (isset($product['min_price_total']) && isset($product['max_price_total'])) {
                                // For pre-calculated totals
//                                $min_total = floatval($product['min_price_total']) * (1 - ($default_markup / 100));
//                                $max_total = floatval($product['max_price_total']) * (1 + ($default_markup / 100));

                                // Round the totals
                                $min_total = $product['min_price_total'];
                                $max_total = $product['max_price_total'];

                                $room_min_total += $min_total;
                                $room_max_total += $max_total;

                                // Update the product totals with rounded values
                                $product['min_price_total'] = $min_total;
                                $product['max_price_total'] = $max_total;
                            }

                            // Calculate additional products prices
                            if (isset($product['additional_products']) && is_array($product['additional_products'])) {
                                foreach ($product['additional_products'] as &$additional_product) {
                                    // Get additional product pricing method
                                    $add_product_id = isset($additional_product['id']) ? $additional_product['id'] : 0;
                                    $add_pricing_method = isset($additional_product['pricing_method']) ?
                                        $additional_product['pricing_method'] : $pricing_method;

                                    // Determine pricing method based on rules if not already set
                                    if ($add_product_id > 0 && !isset($additional_product['pricing_method'])) {
                                        // Code to determine pricing method from rules...
                                        // (Same as above for main product)

                                        // Store the pricing method in the additional product data
                                        $additional_product['pricing_method'] = $add_pricing_method;
                                    }

                                    if (isset($additional_product['min_price']) && isset($additional_product['max_price'])) {
                                        // Apply markup adjustment
//                                        $add_min_price = floatval($additional_product['min_price']) * (1 - ($default_markup / 100));
//                                        $add_max_price = floatval($additional_product['max_price']) * (1 + ($default_markup / 100));

                                        // Round the unit prices
                                        $add_min_price = $additional_product['min_price'];
                                        $add_max_price = $additional_product['max_price'];

                                        // Calculate based on pricing method
                                        if ($add_pricing_method === 'sqm' && $room_area > 0) {
                                            $add_min_total = $add_min_price * $room_area;
                                            $add_max_total = $add_max_price * $room_area;

                                            // Store calculated totals
                                            $additional_product['min_price_total'] = $add_min_total;
                                            $additional_product['max_price_total'] = $add_max_total;

                                            // Add to room totals
                                            $room_min_total += $add_min_total;
                                            $room_max_total += $add_max_total;
                                        } else {
                                            // Fixed pricing - already rounded above
                                            $additional_product['min_price_total'] = $add_min_price;
                                            $additional_product['max_price_total'] = $add_max_price;
                                            $room_min_total += $add_min_price;
                                            $room_max_total += $add_max_price;
                                        }
                                    } elseif (isset($additional_product['min_price_total']) && isset($additional_product['max_price_total'])) {
                                        // For pre-calculated totals
//                                        $add_min_total = floatval($additional_product['min_price_total']) * (1 - ($default_markup / 100));
//                                        $add_max_total = floatval($additional_product['max_price_total']) * (1 + ($default_markup / 100));

                                        // Round the totals
                                        $add_min_total = $additional_product['min_price_total'];
                                        $add_max_total = $additional_product['max_price_total'];

                                        $room_min_total += $add_min_total;
                                        $room_max_total += $add_max_total;

                                        // Update the additional product totals with rounded values
                                        $additional_product['min_price_total'] = $add_min_total;
                                        $additional_product['max_price_total'] = $add_max_total;
                                    }
                                }
                            }
                        }
                    }

                    // Store room totals
                    $room['min_total'] = $room_min_total;
                    $room['max_total'] = $room_max_total;

                    // Add to estimate totals
                    $estimate_min_total += $room_min_total;
                    $estimate_max_total += $room_max_total;
                }
            }

            // Store estimate totals
            $estimate['min_total'] = $estimate_min_total;
            $estimate['max_total'] = $estimate_max_total;
        }
    }


    /**
     * Updated methods for the SessionHandler class to standardize customer details handling
     */

    /**
     * Store customer details in session
     *
     * @param array $customer_data Customer details data
     * @return bool Success
     */
    public function setCustomerDetails($customer_data)
    {
        // Ensure session is started
        $this->startSession();

        // Store customer details under the standard key
        $this->session_data['customer_details'] = $customer_data;

        // If user_details exists, remove it for consistency
        if (isset($this->session_data['user_details'])) {
            unset($this->session_data['user_details']);
        }

        return true;
    }

    /**
     * Get customer details from session
     *
     * @return array|null Customer details or null if not set
     */
    public function getCustomerDetails()
    {
        $this->startSession();

        // Check for customer_details (standard key)
        if (isset($this->session_data['customer_details'])) {
            return $this->session_data['customer_details'];
        }

        // Fall back to legacy user_details for backward compatibility
        if (isset($this->session_data['user_details'])) {
            // Migrate the data to the standard key
            $this->session_data['customer_details'] = $this->session_data['user_details'];
            unset($this->session_data['user_details']);

            return $this->session_data['customer_details'];
        }

        return null;
    }

    /**
     * Check if customer details exist in session
     *
     * @return bool Whether customer details exist
     */
    public function hasCustomerDetails()
    {
        $this->startSession();

        // First check the standard key
        $customer_details = isset($this->session_data['customer_details']) ?
            $this->session_data['customer_details'] : null;

        // If not found, check the legacy key
        if (empty($customer_details) && isset($this->session_data['user_details'])) {
            $customer_details = $this->session_data['user_details'];

            // Migrate to new key format
            $this->session_data['customer_details'] = $customer_details;
            unset($this->session_data['user_details']);
        }

        return !empty($customer_details) &&
            isset($customer_details['name']) &&
            isset($customer_details['email']) &&
            isset($customer_details['postcode']);
    }

    /**
     * Migrate legacy user details to customer details format in all existing estimates
     * This helps ensure all existing data is standardized
     */
    public function migrateUserDetailsInEstimates()
    {
        $this->startSession();

        if (!isset($this->session_data['estimates']) || empty($this->session_data['estimates'])) {
            return;
        }

        foreach ($this->session_data['estimates'] as $estimate_id => &$estimate) {
            // Migrate user_details to customer_details at the estimate level
            if (isset($estimate['user_details']) && !empty($estimate['user_details'])) {
                $estimate['customer_details'] = $estimate['user_details'];
                unset($estimate['user_details']);
            }
        }
    }
}
