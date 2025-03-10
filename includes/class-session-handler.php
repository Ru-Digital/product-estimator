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

        // Initialize session data
        if (!isset($_SESSION['product_estimator'])) {
            $_SESSION['product_estimator'] = [
                'estimates' => []
            ];
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
            'estimates' => $this->getEstimates()
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
}
