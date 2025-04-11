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

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Product Estimator Session started: ' . session_id());
            error_log('Session data initialized: ' . print_r($this->session_data, true));
        }
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

        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Added new estimate with ID: ' . $new_id);
            error_log('Current session estimates: ' . print_r($this->session_data['estimates'], true));
        }

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

        // Validate estimate exists
        if (!isset($this->session_data['estimates'][$estimate_id])) {
            error_log("Estimate $estimate_id not found");
            return false;
        }

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
     * Add a product to a room
     *
     * @param string|int $estimate_id Estimate ID
     * @param string|int $room_id Room ID
     * @param array $product_data Product data
     * @return bool Success
     */
    public function addProductToRoom($estimate_id, $room_id, $product_data) {
        // Ensure session is started
        $this->startSession();

        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('addProductToRoom called');
            error_log('Estimate ID: ' . print_r($estimate_id, true));
            error_log('Room ID: ' . print_r($room_id, true));
            error_log('Product Data: ' . print_r($product_data, true));
            error_log('Current session data: ' . print_r($this->session_data, true));
        }

        // Validate inputs
        if (!isset($this->session_data['estimates'][$estimate_id])) {
            error_log("Estimate $estimate_id not found");
            return false;
        }

        // Ensure rooms and products arrays exist
        if (!isset($this->session_data['estimates'][$estimate_id]['rooms'])) {
            $this->session_data['estimates'][$estimate_id]['rooms'] = [];
        }

        // Validate room
        if (!isset($this->session_data['estimates'][$estimate_id]['rooms'][$room_id])) {
            error_log("Room $room_id not found in estimate $estimate_id");
            return false;
        }

        // Ensure products array exists for the room
        if (!isset($this->session_data['estimates'][$estimate_id]['rooms'][$room_id]['products'])) {
            $this->session_data['estimates'][$estimate_id]['rooms'][$room_id]['products'] = [];
        }

        // Add product to room
        $this->session_data['estimates'][$estimate_id]['rooms'][$room_id]['products'][] = $product_data;

        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Product added successfully');
            error_log('Updated session data: ' . print_r($this->session_data, true));
        }

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

        // Debugging information
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Checking for estimates. Session data: ' . print_r($this->session_data, true));
            error_log('Has estimates: ' . (!empty($this->session_data['estimates']) ? 'true' : 'false'));
        }

        return !empty($this->session_data['estimates']);
    }

    /**
     * Get a specific estimate by ID
     *
     * @param string|int $estimate_id Estimate ID
     * @param string|int $room_id Room ID
     * @return array|null Room data or null if not found
     */
    public function getRoom($estimate_id, $room_id) {
        $this->startSession();

        // Check if estimate exists
        if (!isset($this->session_data['estimates'][$estimate_id])) {
            return null;
        }

        // Check if rooms exist in the estimate
        if (!isset($this->session_data['estimates'][$estimate_id]['rooms'])) {
            return null;
        }

        // Try to find the room
        return $this->session_data['estimates'][$estimate_id]['rooms'][$room_id] ?? null;
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

        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('removeProductFromRoom called');
            error_log('Estimate ID: ' . print_r($estimate_id, true));
            error_log('Room ID: ' . print_r($room_id, true));
            error_log('Product Index: ' . print_r($product_index, true));
        }

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

        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Product removed successfully');
        }

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

        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('removeRoom called');
            error_log('Estimate ID: ' . print_r($estimate_id, true));
            error_log('Room ID: ' . print_r($room_id, true));
        }

        // Validate inputs
        if (!isset($this->session_data['estimates'][$estimate_id])) {
            error_log("Estimate $estimate_id not found");
            return false;
        }

        if (!isset($this->session_data['estimates'][$estimate_id]['rooms'][$room_id])) {
            error_log("Room $room_id not found in estimate $estimate_id");
            return false;
        }

        // Remove the room
        unset($this->session_data['estimates'][$estimate_id]['rooms'][$room_id]);

        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Room removed successfully');
        }

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

        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('removeEstimate called');
            error_log('Estimate ID: ' . print_r($estimate_id, true));
        }

        // Validate inputs
        if (!isset($this->session_data['estimates'][$estimate_id])) {
            error_log("Estimate $estimate_id not found");
            return false;
        }

        // Remove the estimate
        unset($this->session_data['estimates'][$estimate_id]);

        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Estimate removed successfully');
        }

        return true;
    }

    /**
     * Calculate total price range for a room
     *
     * @param array $room Room data with products
     * @return array Array with min_total and max_total values
     */
    public function calculateRoomTotals($room) {
        $min_total = 0;
        $max_total = 0;

        // Get default markup from settings
        $options = get_option('product_estimator_settings');
        $default_markup = isset($options['default_markup']) ? floatval($options['default_markup']) : 0;

        // Calculate room area
        $room_width = isset($room['width']) ? floatval($room['width']) : 0;
        $room_length = isset($room['length']) ? floatval($room['length']) : 0;
        $room_area = $room_width * $room_length;

        if (isset($room['products']) && is_array($room['products'])) {
            foreach ($room['products'] as $product) {
                // Calculate main product prices
                if (isset($product['min_price']) && isset($product['max_price'])) {
                    // Apply markup adjustment
                    $min_price = floatval($product['min_price']) * (1 - ($default_markup / 100));
                    $max_price = floatval($product['max_price']) * (1 + ($default_markup / 100));

                    // Add to totals
                    $min_total += $min_price * $room_area;
                    $max_total += $max_price * $room_area;
                } elseif (isset($product['min_price_total']) && isset($product['max_price_total'])) {
                    // For pre-calculated totals
                    $min_total += floatval($product['min_price_total']) * (1 - ($default_markup / 100));
                    $max_total += floatval($product['max_price_total']) * (1 + ($default_markup / 100));
                }

                // Calculate additional products prices
                if (isset($product['additional_products']) && is_array($product['additional_products'])) {
                    foreach ($product['additional_products'] as $additional_product) {
                        if (isset($additional_product['min_price']) && isset($additional_product['max_price'])) {
                            // Apply markup adjustment
                            $add_min_price = floatval($additional_product['min_price']) * (1 - ($default_markup / 100));
                            $add_max_price = floatval($additional_product['max_price']) * (1 + ($default_markup / 100));

                            // Add to totals with room area
                            $min_total += $add_min_price * $room_area;
                            $max_total += $add_max_price * $room_area;
                        } elseif (isset($additional_product['min_price_total']) && isset($additional_product['max_price_total'])) {
                            // For pre-calculated totals
                            $min_total += floatval($additional_product['min_price_total']) * (1 - ($default_markup / 100));
                            $max_total += floatval($additional_product['max_price_total']) * (1 + ($default_markup / 100));
                        }
                    }
                }
            }
        }

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

        if (isset($estimate['rooms']) && is_array($estimate['rooms'])) {
            foreach ($estimate['rooms'] as $room) {
                $room_totals = $this->calculateRoomTotals($room);
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

        // Get default markup from settings
        $options = get_option('product_estimator_settings');
        $default_markup = isset($options['default_markup']) ? floatval($options['default_markup']) : 0;

        foreach ($estimates as $estimate_id => &$estimate) {
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
                        foreach ($room['products'] as $product) {
                            // Calculate main product prices
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

        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Customer details stored in session: ' . print_r($customer_data, true));
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
