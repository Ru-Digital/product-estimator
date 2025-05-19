<?php
namespace RuDigital\ProductEstimator\Includes\Traits;

/**
 * Trait for handling estimate database operations.
 *
 * Provides methods for checking if estimates are stored in the database
 * and handling database operations efficiently.
 * Works directly with database storage as frontend uses localStorage.
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/traits
 */
trait EstimateDbHandler {

    /**
     * Check if a database ID exists in the database estimates table.
     *
     * @param int $db_id The database ID to check.
     * @return bool Whether the ID exists in the database.
     */
    protected function dbIdExists(int $db_id): bool {
        // Ensure db_id is valid before querying
        if ($db_id <= 0) {
            return false;
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'product_estimator_estimates';

        // Prepare the query safely
        $query = $wpdb->prepare("SELECT COUNT(*) FROM `{$table_name}` WHERE `id` = %d", $db_id);
        $count = $wpdb->get_var($query);

        // Check for errors
        if ($wpdb->last_error) {
            error_log("WPDB Error in dbIdExists: " . $wpdb->last_error);
            return false; // Treat database errors as 'not exists' for safety
        }

        return $count > 0;
    }

    /**
     * Store or update an estimate in the database.
     * 
     * TODO: This method needs to be updated to work with the new localStorage
     * mechanism. The frontend will be responsible for sending complete estimate
     * data to be stored directly in the database.
     *
     * @param array $estimate_data Complete estimate data from localStorage.
     * @param string $notes Additional notes (optional).
     * @return int|false The database ID of the stored/updated estimate or false on failure.
     */
    protected function storeOrUpdateEstimate(array $estimate_data, string $notes = '') {
        global $wpdb;
        $table_name = $wpdb->prefix . 'product_estimator_estimates';

        // Extract db_id if present
        $db_id = isset($estimate_data['db_id']) && !empty($estimate_data['db_id']) ? (int)$estimate_data['db_id'] : null;

        // Extract customer details from estimate data
        $customer_details = $estimate_data['customer_details'] ?? [];

        // Prepare common data for insert/update
        $data = [
            'name'           => isset($customer_details['name']) ? sanitize_text_field($customer_details['name']) : ($estimate_data['name'] ?? ''),
            'email'          => isset($customer_details['email']) ? sanitize_email($customer_details['email']) : '',
            'phone_number'   => isset($customer_details['phone']) ? sanitize_text_field($customer_details['phone']) : '',
            'postcode'       => isset($customer_details['postcode']) ? sanitize_text_field($customer_details['postcode']) : '',
            'total_min'      => isset($estimate_data['min_total']) ? floatval($estimate_data['min_total']) : 0,
            'total_max'      => isset($estimate_data['max_total']) ? floatval($estimate_data['max_total']) : 0,
            'markup'         => isset($estimate_data['default_markup']) ? floatval($estimate_data['default_markup']) : 0,
            'estimate_data'  => json_encode($estimate_data),
            'notes'          => $notes
        ];

        // Define corresponding formats for $wpdb->prepare
        $formats = [
            '%s', // name
            '%s', // email
            '%s', // phone_number
            '%s', // postcode
            '%f', // total_min
            '%f', // total_max
            '%f', // markup
            '%s', // estimate_data (JSON string)
            '%s'  // notes
        ];

        $saved_db_id = false;

        try {
            if ($db_id && $this->dbIdExists($db_id)) {
                // UPDATE existing record
                $data['updated_at'] = current_time('mysql');
                $formats[] = '%s'; // Add format for updated_at

                $result = $wpdb->update(
                    $table_name,
                    $data,              // Data to update
                    ['id' => $db_id],   // WHERE clause
                    $formats,           // Format for data
                    ['%d']              // Format for WHERE clause
                );

                if ($result === false) {
                    error_log("Product Estimator (EstimateDbHandler): Database error updating estimate ID {$db_id}. Error: " . $wpdb->last_error);
                    throw new \Exception('Database error updating estimate.');
                }
                $saved_db_id = $db_id;
                
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("Product Estimator (EstimateDbHandler): Successfully updated estimate DB ID {$db_id}.");
                }

            } else {
                // INSERT new record
                $data['created_at'] = current_time('mysql');
                $data['status'] = 'saved'; // Set initial status

                $formats[] = '%s'; // format for created_at
                $formats[] = '%s'; // format for status

                $result = $wpdb->insert(
                    $table_name,
                    $data,
                    $formats
                );

                if ($result === false) {
                    error_log("Product Estimator (EstimateDbHandler): Database error inserting new estimate. Error: " . $wpdb->last_error);
                    throw new \Exception('Database error inserting estimate.');
                }

                $saved_db_id = $wpdb->insert_id; // Get the newly inserted ID
                
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("Product Estimator (EstimateDbHandler): Successfully inserted estimate, new DB ID {$saved_db_id}.");
                }
            }

            return $saved_db_id;

        } catch (\Exception $e) {
            error_log('Product Estimator (EstimateDbHandler) Exception in storeOrUpdateEstimate: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get estimate data from the database by ID.
     *
     * @param int $db_id The database ID.
     * @return array|null The estimate data array or null if not found/error.
     */
    public function getEstimateFromDb(int $db_id): ?array {
        if ($db_id <= 0) {
            return null;
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'product_estimator_estimates';

        // Prepare query safely
        $query = $wpdb->prepare("SELECT * FROM `{$table_name}` WHERE `id` = %d", $db_id);
        $estimate_row = $wpdb->get_row($query, ARRAY_A);

        // Check for errors or no result
        if ($wpdb->last_error) {
            error_log("WPDB Error in getEstimateFromDb: " . $wpdb->last_error);
            return null;
        }
        if (!$estimate_row) {
            return null;
        }

        // Decode the JSON estimate data
        if (isset($estimate_row['estimate_data'])) {
            $estimate_data = json_decode($estimate_row['estimate_data'], true);

            // Check if JSON decoding was successful and resulted in an array
            if (is_array($estimate_data)) {
                // Ensure the db_id is present in the returned array
                $estimate_data['db_id'] = $db_id;
                return $estimate_data;
            } else {
                error_log("Product Estimator (EstimateDbHandler): Failed to decode JSON estimate_data for DB ID {$db_id}.");
                return null;
            }
        } else {
            error_log("Product Estimator (EstimateDbHandler): 'estimate_data' column missing for DB ID {$db_id}.");
            return null;
        }
    }

    /**
     * Get customer email from estimate data.
     *
     * @param array $estimate The estimate data array.
     * @return string The customer email or empty string if not found.
     */
    protected function get_customer_email(array $estimate): string {
        $customer_email = '';

        // Check estimate customer details first
        if (isset($estimate['customer_details']['email']) && !empty($estimate['customer_details']['email'])) {
            $customer_email = sanitize_email($estimate['customer_details']['email']);
        }

        return $customer_email;
    }

    // --- Logging Helper Methods ---

    /**
     * Log error message and stack trace if WP_DEBUG is enabled.
     *
     * @param string $message Error message.
     * @param \Exception|null $exception Optional Exception object.
     * @return void
     */
    protected function log_error(string $message, ?\Exception $exception = null): void {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Product Estimator Error: " . $message);
            if ($exception) {
                error_log("Exception Message: " . $exception->getMessage());
                error_log("Stack trace: " . $exception->getTraceAsString());
            }
        }
    }

    /**
     * Log debug message if WP_DEBUG is enabled.
     *
     * @param string $message Debug message.
     * @return void
     */
    protected function log_debug(string $message): void {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Product Estimator Debug: " . $message);
        }
    }

} // End trait EstimateDbHandler