<?php
namespace RuDigital\ProductEstimator\Includes\Models;

/**
 * Estimate Model
 *
 * Handles database operations for estimates
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/models
 */
class EstimateModel {
    /**
     * Database table name
     *
     * @var string
     */
    private $table_name;

    /**
     * Initialize the class
     */
    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'product_estimator_estimates';
    }

    /**
     * Save an estimate to the database
     *
     * @param array $estimate The estimate data from session
     * @param array $customer_details Customer details
     * @param string $notes Additional notes
     * @return int|false The ID of the saved estimate or false on failure
     */
    public function save_estimate($estimate, $customer_details = [], $notes = '') {
        global $wpdb;

        // Calculate min and max totals from estimate
        $total_min = isset($estimate['min_total']) ? floatval($estimate['min_total']) : 0;
        $total_max = isset($estimate['max_total']) ? floatval($estimate['max_total']) : 0;

        // Merge customer details from estimate if not provided
        if (empty($customer_details) && isset($estimate['customer_details'])) {
            $customer_details = $estimate['customer_details'];
        }

        // Prepare data for insertion
        $data = [
            'name' => isset($customer_details['name']) ? $customer_details['name'] : '',
            'email' => isset($customer_details['email']) ? $customer_details['email'] : '',
            'phone_number' => isset($customer_details['phone']) ? $customer_details['phone'] : '',
            'postcode' => isset($customer_details['postcode']) ? $customer_details['postcode'] : '',
            'total_min' => $total_min,
            'total_max' => $total_max,
            'markup' => isset($estimate['markup']) ? $estimate['markup'] : 0,
            'status' => 'saved',
            'notes' => $notes,
            'estimate_data' => json_encode($estimate),
            'created_at' => current_time('mysql')
        ];

        // Insert into database
        $result = $wpdb->insert(
            $this->table_name,
            $data,
            [
                '%s', // name
                '%s', // email
                '%s', // phone_number
                '%s', // postcode
                '%f', // total_min
                '%f', // total_max
                '%s', // status
                '%s', // notes
                '%s', // estimate_data
                '%s'  // created_at
            ]
        );

        if ($result === false) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Database error when saving estimate: ' . $wpdb->last_error);
            }
            return false;
        }

        return $wpdb->insert_id;
    }

    /**
     * Check if an estimate is already stored in the database
     *
     * @param array $estimate The estimate data from session
     * @return int|false The ID of the stored estimate or false if not found
     */
    public function is_estimate_stored($estimate) {
        global $wpdb;

        // We need some way to uniquely identify an estimate
        // Options:
        // 1. Use estimate name + customer details
        // 2. Use the JSON of the estimate data (but this could change)
        // 3. Generate and store a unique ID in the session estimate itself

        // Here we'll use approach #1
        if (!isset($estimate['name']) || !isset($estimate['customer_details']['email'])) {
            return false;
        }

        $name = $estimate['name'];
        $email = $estimate['customer_details']['email'];

        $query = $wpdb->prepare(
            "SELECT id FROM {$this->table_name}
            WHERE name = %s AND email = %s
            ORDER BY created_at DESC LIMIT 1",
            $name,
            $email
        );

        $id = $wpdb->get_var($query);

        return $id ? (int)$id : false;
    }

    /**
     * Get an estimate by ID
     *
     * @param int $id Estimate ID
     * @return array|false The estimate data or false if not found
     */
    public function get_estimate($id) {
        global $wpdb;

        $query = $wpdb->prepare(
            "SELECT * FROM {$this->table_name} WHERE id = %d",
            $id
        );

        $estimate = $wpdb->get_row($query, ARRAY_A);

        if ($estimate && isset($estimate['estimate_data'])) {
            $estimate['estimate_data'] = json_decode($estimate['estimate_data'], true);
        }

        return $estimate;
    }

    /**
     * Update an existing estimate
     *
     * @param int $id Estimate ID
     * @param array $estimate Updated estimate data
     * @param array $customer_details Updated customer details
     * @param string $notes Updated notes
     * @return bool Success or failure
     */
    public function update_estimate($id, $estimate, $customer_details = [], $notes = '') {
        global $wpdb;

        // Calculate min and max totals from estimate
        $total_min = isset($estimate['min_total']) ? floatval($estimate['min_total']) : 0;
        $total_max = isset($estimate['max_total']) ? floatval($estimate['max_total']) : 0;

        // Merge customer details from estimate if not provided
        if (empty($customer_details) && isset($estimate['customer_details'])) {
            $customer_details = $estimate['customer_details'];
        }

        // Prepare data for update
        $data = [
            'name' => isset($customer_details['name']) ? $customer_details['name'] : '',
            'email' => isset($customer_details['email']) ? $customer_details['email'] : '',
            'phone_number' => isset($customer_details['phone']) ? $customer_details['phone'] : '',
            'postcode' => isset($customer_details['postcode']) ? $customer_details['postcode'] : '',
            'total_min' => $total_min,
            'total_max' => $total_max,
            'notes' => $notes,
            'estimate_data' => json_encode($estimate),
            'updated_at' => current_time('mysql')
        ];

        // Update database
        $result = $wpdb->update(
            $this->table_name,
            $data,
            ['id' => $id],
            [
                '%s', // name
                '%s', // email
                '%s', // phone_number
                '%s', // postcode
                '%f', // total_min
                '%f', // total_max
                '%s', // notes
                '%s', // estimate_data
                '%s'  // updated_at
            ],
            ['%d'] // id
        );

        return $result !== false;
    }
}
