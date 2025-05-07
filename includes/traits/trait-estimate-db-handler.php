<?php
namespace RuDigital\ProductEstimator\Includes\Traits;

use RuDigital\ProductEstimator\Includes\SessionHandler; // Add use statement

/**
 * Trait for handling estimate database ID references.
 *
 * Provides methods for checking if estimates are stored in the database
 * and handling database ID lookups efficiently.
 * MODIFIED: Uses SessionHandler for session interactions.
 *
 * @since      1.0.0
 * @since      x.x.x Updated for lazy session loading via SessionHandler
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/traits
 */
trait EstimateDbHandler {

    /**
     * Get the SessionHandler instance.
     * Helper method within the trait for convenience.
     *
     * @return SessionHandler
     */
    private function getSessionHandler(): SessionHandler {
        // If the class using the trait has a 'session' property that's an instance of SessionHandler, use it.
        // This provides flexibility if the consuming class manages the instance.
        if (property_exists($this, 'session') && $this->session instanceof SessionHandler) {
            return $this->session;
        }
        // Otherwise, get the singleton instance directly.
        return SessionHandler::getInstance();
    }

    /**
     * Helper to get estimate data safely using SessionHandler.
     *
     * @param array|string|int $estimate_ref Estimate data array or session estimate ID.
     * @param string|int|null $session_estimate_id_out If input is an ID, this will hold the ID.
     * @return array|null The estimate data array or null if not found/session fails.
     */
    private function resolveEstimateData($estimate_ref, &$session_estimate_id_out = null): ?array {
        $session = $this->getSessionHandler();
        $estimate_data = null;

        if (is_array($estimate_ref)) {
            $estimate_data = $estimate_ref;
            // Try to determine the session ID if db_id is present
            if (isset($estimate_data['db_id']) && !empty($estimate_data['db_id'])) {
                $found = $session->getEstimateSessionByDbId($estimate_data['db_id']);
                if ($found) {
                    $session_estimate_id_out = $found['id'];
                }
            } elseif (isset($estimate_ref['session_id_for_trait'])) {
                // Allow passing session ID within the array if needed, though less common
                $session_estimate_id_out = (string)$estimate_ref['session_id_for_trait'];
            }
        } elseif (is_string($estimate_ref) || is_numeric($estimate_ref)) {
            $session_estimate_id = (string)$estimate_ref;
            $estimate_data = $session->getEstimate($session_estimate_id); // Fetches using SessionHandler
            $session_estimate_id_out = $session_estimate_id;
        }

        return $estimate_data;
    }


    /**
     * Check if an estimate has a valid database ID stored within its data.
     *
     * @param array|string|int $estimate_ref The estimate data array or session estimate ID.
     * @return bool Whether the estimate data contains a valid 'db_id'.
     */
    protected function hasValidDbId($estimate_ref): bool {
        $estimate_data = $this->resolveEstimateData($estimate_ref);
        // Check if data was resolved and contains a non-empty db_id
        return $estimate_data !== null && isset($estimate_data['db_id']) && !empty($estimate_data['db_id']);
    }

    /**
     * Check if a database ID exists in the database estimates table.
     * (No session interaction needed here)
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
     * Check if an estimate is stored in the database (has db_id and that ID exists in DB).
     *
     * @param array|string|int $estimate_ref The estimate data array or session estimate ID.
     * @return bool Whether the estimate is considered stored in the database.
     */
    public function isEstimateStored($estimate_ref): bool {
        $estimate_data = $this->resolveEstimateData($estimate_ref);

        // If no estimate data found or no db_id, it's not stored
        if ($estimate_data === null || !isset($estimate_data['db_id']) || empty($estimate_data['db_id'])) {
            return false;
        }

        // Verify the stored db_id actually exists in the database table
        return $this->dbIdExists((int)$estimate_data['db_id']);
    }

    /**
     * Get the database ID for an estimate from its data.
     *
     * @param array|string|int $estimate_ref The estimate data array or session estimate ID.
     * @return int|null The database ID or null if not set or not stored.
     */
    public function getEstimateDbId($estimate_ref): ?int {
        $estimate_data = $this->resolveEstimateData($estimate_ref);

        // Check if data exists and has a valid db_id
        if ($estimate_data !== null && isset($estimate_data['db_id']) && !empty($estimate_data['db_id'])) {
            // Optionally, you could add a check here using isEstimateStored if you want to be absolutely sure
            // if ($this->isEstimateStored($estimate_data)) { ... }
            return (int)$estimate_data['db_id'];
        }

        return null; // Return null if no valid db_id found
    }

    /**
     * Store or update an estimate in the database.
     * Also updates the db_id in the session estimate data via SessionHandler.
     *
     * @param string|int $session_estimate_id The session estimate ID.
     * @param array $customer_details Customer details array (optional).
     * @param string $notes Additional notes (optional).
     * @return int|false The database ID of the stored/updated estimate or false on failure.
     */
    protected function storeOrUpdateEstimate($session_estimate_id, array $customer_details = [], string $notes = '') {
        // Validate session_estimate_id (allow '0')
        if (!isset($session_estimate_id) || $session_estimate_id === '') {
            error_log('Product Estimator (EstimateDbHandler): storeOrUpdateEstimate called with empty session_estimate_id');
            return false;
        }
        $session_estimate_id = (string)$session_estimate_id; // Ensure string type

        $session = $this->getSessionHandler();

        try {
            // Get the estimate data from session using the handler
            $estimate = $session->getEstimate($session_estimate_id);

            if (!$estimate) {
                error_log("Product Estimator (EstimateDbHandler): Cannot find estimate with session ID '{$session_estimate_id}' in session via SessionHandler.");
                // Optionally log available IDs for debugging: error_log("Available estimate IDs: " . implode(', ', array_keys($session->getEstimates())));
                return false;
            }

            // Update customer details in the local $estimate array if provided
            if (!empty($customer_details)) {
                $estimate['customer_details'] = $customer_details;
            }
            // Update notes if provided
            if (!empty($notes)) {
                $estimate['notes'] = $notes; // Assuming 'notes' is a key in your estimate structure
            }


            global $wpdb;
            $table_name = $wpdb->prefix . 'product_estimator_estimates';

            // Check if this estimate is already stored (has a valid db_id in its data)
            $db_id = $this->getEstimateDbId($estimate); // Use the method which checks $estimate['db_id']

            // Prepare common data for insert/update, ensuring keys exist
            $data = [
                'name'           => isset($estimate['customer_details']['name']) ? sanitize_text_field($estimate['customer_details']['name']) : ($estimate['name'] ?? ''), // Fallback to estimate name if customer name missing
                'email'          => isset($estimate['customer_details']['email']) ? sanitize_email($estimate['customer_details']['email']) : '',
                'phone_number'   => isset($estimate['customer_details']['phone']) ? sanitize_text_field($estimate['customer_details']['phone']) : '',
                'postcode'       => isset($estimate['customer_details']['postcode']) ? sanitize_text_field($estimate['customer_details']['postcode']) : '',
                'total_min'      => isset($estimate['min_total']) ? floatval($estimate['min_total']) : 0,
                'total_max'      => isset($estimate['max_total']) ? floatval($estimate['max_total']) : 0,
                'markup'         => isset($estimate['default_markup']) ? floatval($estimate['default_markup']) : 0,
                'estimate_data'  => json_encode($estimate), // Encode the potentially modified $estimate array
                'notes'          => $notes // Use the passed-in notes
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

            if ($db_id && $this->dbIdExists($db_id)) { // Check if db_id is valid and exists
                // --- UPDATE existing record ---
                $data['updated_at'] = current_time('mysql'); // Add/update timestamp
                $formats[] = '%s'; // Add format for updated_at

                $result = $wpdb->update(
                    $table_name,
                    $data,              // Data to update
                    ['id' => $db_id],   // WHERE clause
                    $formats,           // Format for data
                    ['%d']              // Format for WHERE clause
                );

                if ($result === false) {
                    // Database update failed
                    error_log("Product Estimator (EstimateDbHandler): Database error updating estimate ID {$db_id}. Error: " . $wpdb->last_error);
                    throw new \Exception('Database error updating estimate.'); // Throw exception on failure
                }
                $saved_db_id = $db_id; // Use the existing db_id
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("Product Estimator (EstimateDbHandler): Successfully updated estimate DB ID {$db_id}.");
                }

            } else {
                // --- INSERT new record ---
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
                    // Database insert failed
                    error_log("Product Estimator (EstimateDbHandler): Database error inserting new estimate. Error: " . $wpdb->last_error);
                    throw new \Exception('Database error inserting estimate.'); // Throw exception on failure
                }

                $new_db_id = $wpdb->insert_id; // Get the newly inserted ID
                $saved_db_id = $new_db_id;

                // --- IMPORTANT: Update the session data with the new DB ID ---
                // Add the new db_id to the local $estimate array
                $estimate['db_id'] = $new_db_id;
                // Save the estimate array (which now includes the db_id) back to the session
                if (!$session->updateEstimateData($session_estimate_id, $estimate)) {
                    // Log an error if updating the session failed, but don't necessarily fail the whole operation
                    error_log("Product Estimator (EstimateDbHandler): Failed to update session with new DB ID {$new_db_id} for session estimate {$session_estimate_id}.");
                } else {
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log("Product Estimator (EstimateDbHandler): Successfully inserted estimate, new DB ID {$new_db_id}. Updated session.");
                    }
                }
            }

            return $saved_db_id; // Return the DB ID (either existing or new)

        } catch (\Exception $e) {
            error_log('Product Estimator (EstimateDbHandler) Exception in storeOrUpdateEstimate: ' . $e->getMessage());
            // Optionally log stack trace if WP_DEBUG is on
            // if (defined('WP_DEBUG') && WP_DEBUG) { error_log('Stack trace: ' . $e->getTraceAsString()); }
            return false; // Return false on any exception
        }
    }

    /**
     * Find a session estimate ID by database ID using SessionHandler.
     *
     * @param int $db_id The database ID to find.
     * @return string|null The session estimate ID or null if not found.
     */
    public function findSessionEstimateIdByDbId(int $db_id): ?string {
        $session = $this->getSessionHandler();
        $found = $session->getEstimateSessionByDbId($db_id); // Use SessionHandler method
        return $found ? $found['id'] : null;
    }

    /**
     * Ensure an estimate is loaded in session from database if not already there.
     *
     * @param int $db_id The database ID to load.
     * @return string|null The session estimate ID or null on failure.
     */
    public function ensureEstimateInSession(int $db_id): ?string {
        // Check if this db_id already exists in session using the updated method
        $session_id = $this->findSessionEstimateIdByDbId($db_id);

        if ($session_id !== null) {
            return $session_id; // Already in session
        }

        // Load estimate data from the database
        $estimate_data = $this->getEstimateFromDb($db_id); // Uses trait's DB method

        if (!$estimate_data) {
            error_log("Product Estimator (EstimateDbHandler): Failed to load estimate DB ID {$db_id} from database.");
            return null; // Failed to load from DB
        }

        // Add the loaded estimate data to the session using SessionHandler
        $session = $this->getSessionHandler();
        $new_session_id = $session->addEstimate($estimate_data); // addEstimate handles ensureSessionStarted

        if ($new_session_id === false) {
            error_log("Product Estimator (EstimateDbHandler): Failed to add loaded estimate DB ID {$db_id} to session via SessionHandler.");
            return null; // Failed to add to session
        }

        return $new_session_id; // Return the new session ID
    }

    /**
     * Set or update the database ID in the session data for a specific estimate.
     * DEPRECATED in trait - Use SessionHandler->updateEstimateData instead.
     * Kept for backward compatibility reference, but should not be used directly if possible.
     *
     * @deprecated Use SessionHandler->updateEstimateData() by passing the full estimate array with the updated db_id.
     * @param string $session_estimate_id The session estimate ID.
     * @param int $db_id The database ID to set.
     * @return bool Whether the operation was successful.
     */
    public function setEstimateDbId(string $session_estimate_id, int $db_id): bool {
        error_log("Product Estimator Deprecation Notice: EstimateDbHandler::setEstimateDbId is deprecated. Use SessionHandler::updateEstimateData instead.");
        $session = $this->getSessionHandler();
        $estimate = $session->getEstimate($session_estimate_id);
        if ($estimate) {
            $estimate['db_id'] = $db_id;
            return $session->updateEstimateData($session_estimate_id, $estimate);
        }
        return false;
    }

    /**
     * Get customer email from estimate or session using SessionHandler.
     *
     * @param array|null $estimate The estimate data array (optional).
     * @param string|int|null $session_estimate_id The session estimate ID (used if $estimate is null).
     * @return string The customer email or empty string if not found.
     */
    private function get_customer_email(?array $estimate = null, $session_estimate_id = null): string {
        $customer_email = '';

        // If estimate data is provided, check it first
        if ($estimate !== null && isset($estimate['customer_details']['email']) && !empty($estimate['customer_details']['email'])) {
            $customer_email = sanitize_email($estimate['customer_details']['email']);
        }
        // If not found in provided estimate OR estimate wasn't provided, check session
        elseif ($session_estimate_id !== null) {
            $session = $this->getSessionHandler();
            $session_estimate = $session->getEstimate($session_estimate_id);
            if ($session_estimate && isset($session_estimate['customer_details']['email']) && !empty($session_estimate['customer_details']['email'])) {
                $customer_email = sanitize_email($session_estimate['customer_details']['email']);
            }
        }

        // If still not found, check the global customer details in session
        if (empty($customer_email)) {
            $session = $this->getSessionHandler(); // Ensure we have the instance
            $global_customer_details = $session->getCustomerDetails(); // Uses SessionHandler method
            if ($global_customer_details && isset($global_customer_details['email']) && !empty($global_customer_details['email'])) {
                $customer_email = sanitize_email($global_customer_details['email']);
            }
        }

        return $customer_email;
    }

    /**
     * Get estimate data from the database by ID.
     * (No session interaction needed here)
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
                // Optionally return the raw row data or null
                return null;
            }
        } else {
            error_log("Product Estimator (EstimateDbHandler): 'estimate_data' column missing for DB ID {$db_id}.");
            return null; // Indicate data is incomplete/missing
        }
    }

    // Note: request_copy_estimate and send_estimate_email methods were removed
    // as they seemed specific to AjaxHandler/EstimateHandler logic, not generic DB handling.
    // If they are needed generically, they should also be updated to use SessionHandler.

    // --- Logging Helper Methods (No session interaction) ---

    /**
     * Log error message and stack trace if WP_DEBUG is enabled.
     *
     * @param string $message Error message.
     * @param \Exception|null $exception Optional Exception object.
     * @return void
     */
    private function log_error(string $message, ?\Exception $exception = null): void {
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
    private function log_debug(string $message): void {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("Product Estimator Debug: " . $message);
        }
    }

} // End trait EstimateDbHandler
