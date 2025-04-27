<?php
namespace RuDigital\ProductEstimator\Includes\Traits;

/**
 * Trait for handling estimate database ID references.
 *
 * Provides methods for checking if estimates are stored in the database
 * and handling database ID lookups efficiently.
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/traits
 */
trait EstimateDbHandler {

    /**
     * Check if an estimate has a valid database ID
     *
     * @param array|string $estimate The estimate data or estimate ID
     * @return bool Whether the estimate has a valid database ID
     */
    protected function hasValidDbId($estimate) {
        // If we received an estimate ID instead of estimate array
        if (is_string($estimate) || is_numeric($estimate)) {
            $session_estimate_id = (string)$estimate;

            // Access session data directly
            if (isset($_SESSION['product_estimator']['estimates'][$session_estimate_id])) {
                $estimate = $_SESSION['product_estimator']['estimates'][$session_estimate_id];
            } else {
                return false;
            }
        }

        return isset($estimate['db_id']) && !empty($estimate['db_id']);
    }

    /**
     * Check if a database ID exists in the database
     *
     * @param int $db_id The database ID to check
     * @return bool Whether the ID exists in the database
     */
    protected function dbIdExists($db_id) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'product_estimator_estimates';

        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $table_name WHERE id = %d",
            $db_id
        ));

        return $exists > 0;
    }

    /**
     * Check if an estimate is stored in the database
     *
     * @param mixed $estimate The estimate data or estimate ID
     * @return bool Whether the estimate is stored
     */
    public function isEstimateStored($estimate) {
        // First check if the estimate has a db_id
        if (!$this->hasValidDbId($estimate)) {
            return false;
        }

        // If it's a string or numeric (estimate ID), get the actual estimate data
        if (is_string($estimate) || is_numeric($estimate)) {
            $session_estimate_id = (string)$estimate;
            if (isset($_SESSION['product_estimator']['estimates'][$session_estimate_id])) {
                $estimate = $_SESSION['product_estimator']['estimates'][$session_estimate_id];
            } else {
                return false;
            }
        }

        // Verify the ID exists in the database
        return $this->dbIdExists((int)$estimate['db_id']);
    }

    /**
     * Get the database ID for an estimate
     *
     * @param mixed $estimate The estimate data or estimate ID
     * @return int|null The database ID or null if not stored
     */
    public function getEstimateDbId($estimate) {
        if ($this->isEstimateStored($estimate)) {
            // If it's a string or numeric (estimate ID), get the actual estimate data
            if (is_string($estimate) || is_numeric($estimate)) {
                $session_estimate_id = (string)$estimate;
                $estimate = $_SESSION['product_estimator']['estimates'][$session_estimate_id];
            }

            return (int)$estimate['db_id'];
        }

        return null;
    }

    /**
     * Store or update an estimate in the database
     *
     * @param string $session_estimate_id The session estimate ID
     * @param array $customer_details Customer details array
     * @param string $notes Additional notes
     * @return int|false The database ID of the stored/updated estimate or false on failure
     */
    // In trait-estimate-db-handler.php

    private function storeOrUpdateEstimate($session_estimate_id, $customer_details = [], $notes = '') {
        // Get the estimate from session
        $estimate = $this->session->getEstimate($session_estimate_id);

        if (!$estimate) {
            return false;
        }

        // Add customer details to the estimate if provided
        if (!empty($customer_details)) {
            $estimate['customer_details'] = $customer_details;
        }

        // Check if this estimate is already stored using the trait's method
        $db_id = $this->getEstimateDbId($estimate);

        // Initialize database table name
        global $wpdb;
        $table_name = $wpdb->prefix . 'product_estimator_estimates';

        // Prepare common data for insert/update
        $data = [
            'name' => isset($estimate['customer_details']['name']) ?
                sanitize_text_field($estimate['customer_details']['name']) : '',
            'email' => isset($estimate['customer_details']['email']) ?
                sanitize_email($estimate['customer_details']['email']) : '',
            'phone_number' => isset($estimate['customer_details']['phone']) ?
                sanitize_text_field($estimate['customer_details']['phone']) : '',
            'postcode' => isset($estimate['customer_details']['postcode']) ?
                sanitize_text_field($estimate['customer_details']['postcode']) : '',
            'total_min' => isset($estimate['min_total']) ? floatval($estimate['min_total']) : 0,
            'total_max' => isset($estimate['max_total']) ? floatval($estimate['max_total']) : 0,
            'markup' => isset($estimate['default_markup']) ? floatval($estimate['default_markup']) : 0,
            'estimate_data' => json_encode($estimate),
            'notes' => $notes
        ];

        // Common format definitions
        $formats = [
            '%s', // name
            '%s', // email
            '%s', // phone_number
            '%s', // postcode
            '%f', // total_min
            '%f', // total_max
            '%f', // markup
            '%s', // estimate_data
            '%s'  // notes
        ];

        if ($db_id) {
            // Update existing record
            $data['updated_at'] = current_time('mysql');
            $formats[] = '%s'; // updated_at

            $result = $wpdb->update(
                $table_name,
                $data,
                ['id' => $db_id],
                $formats,
                ['%d'] // id
            );

            if ($result === false) {
                throw new \Exception('Database error updating estimate: ' . $wpdb->last_error);
            }

            // Return the existing DB ID
            return $db_id;
        } else {
            // Insert new record
            $data['created_at'] = current_time('mysql');
            $data['status'] = 'saved';

            $formats[] = '%s'; // created_at
            $formats[] = '%s'; // status

            $result = $wpdb->insert(
                $table_name,
                $data,
                $formats
            );

            if ($result === false) {
                throw new \Exception('Database error inserting estimate: ' . $wpdb->last_error);
            }

            $new_db_id = $wpdb->insert_id;

            // Update the session data with the new DB ID
            $this->setEstimateDbId($session_estimate_id, $new_db_id);

            return $new_db_id;
        }
    }

    /**
     * Get an estimate from the database by ID
     *
     * @param int $db_id The database ID
     * @return array|null The estimate data or null if not found
     */
    public function getEstimateFromDb($db_id) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'product_estimator_estimates';

        $estimate_row = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE id = %d",
            $db_id
        ), ARRAY_A);

        if (!$estimate_row) {
            return null;
        }

        // Decode the JSON estimate data
        if (isset($estimate_row['estimate_data'])) {
            $estimate_data = json_decode($estimate_row['estimate_data'], true);

            // Make sure the db_id is set in the decoded data
            if (is_array($estimate_data)) {
                $estimate_data['db_id'] = $db_id;
                return $estimate_data;
            }
        }

        return null;
    }

    /**
     * Find a session estimate ID by database ID
     *
     * @param int $db_id The database ID to find
     * @return string|null The session estimate ID or null if not found
     */
    public function findSessionEstimateIdByDbId($db_id) {
        if (!isset($_SESSION['product_estimator']['estimates']) ||
            !is_array($_SESSION['product_estimator']['estimates'])) {
            return null;
        }

        foreach ($_SESSION['product_estimator']['estimates'] as $session_id => $estimate) {
            if (isset($estimate['db_id']) && (int)$estimate['db_id'] === (int)$db_id) {
                return $session_id;
            }
        }

        return null;
    }

    /**
     * Ensure an estimate is loaded in session from database if not already there
     *
     * @param int $db_id The database ID to load
     * @return string|null The session estimate ID or null on failure
     */
    public function ensureEstimateInSession($db_id) {
        // First check if this db_id already exists in session
        $session_id = $this->findSessionEstimateIdByDbId($db_id);

        if ($session_id !== null) {
            // Already in session
            return $session_id;
        }

        // Load from database
        $estimate_data = $this->getEstimateFromDb($db_id);

        if (!$estimate_data) {
            return null;
        }

        // Add to session
        if (method_exists($this, 'addEstimate')) {
            // If this trait is used in SessionHandler
            $session_id = $this->addEstimate($estimate_data);
            return $session_id;
        } elseif (isset($this->session) && method_exists($this->session, 'addEstimate')) {
            // If it's used in another class with session property
            $session_id = $this->session->addEstimate($estimate_data);
            return $session_id;
        }

        return null;
    }

    /**
     * Set or update the database ID in the session data
     *
     * @param string $session_estimate_id The session estimate ID
     * @param int $db_id The database ID to set
     * @return bool Whether the operation was successful
     */
    public function setEstimateDbId(string $session_estimate_id, int $db_id): bool {
        // Make sure session is started
        if (!isset($_SESSION['product_estimator']['estimates'][$session_estimate_id])) {
            return false;
        }

        // Update the db_id in the session
        $_SESSION['product_estimator']['estimates'][$session_estimate_id]['db_id'] = $db_id;

        return true;
    }
}
