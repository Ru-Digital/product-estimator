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
     * Fixed version to handle potential errors better
     *
     * @param string $session_estimate_id The session estimate ID
     * @param array $customer_details Customer details array
     * @param string $notes Additional notes
     * @return int|false The database ID of the stored/updated estimate or false on failure
     */
    private function storeOrUpdateEstimate($session_estimate_id, $customer_details = [], $notes = '') {
        // Validate session_estimate_id
        if (!isset($session_estimate_id) || $session_estimate_id === '') {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('storeOrUpdateEstimate called with empty session_estimate_id');
            }
            return false;
        }

        try {
            // Get the estimate from session
            $estimate = $this->session->getEstimate($session_estimate_id);

            if (!$estimate) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("Cannot find estimate with ID: {$session_estimate_id} in session");
                    error_log("Available estimate IDs: " . implode(', ', array_keys($this->session->getEstimates())));
                }
                return false;
            }

            // Add customer details to the estimate if provided
            if (!empty($customer_details)) {
                $estimate['customer_details'] = $customer_details;
            }

            // Initialize database table name
            global $wpdb;
            $table_name = $wpdb->prefix . 'product_estimator_estimates';

            // Check if this estimate is already stored using the trait's method
            $db_id = $this->getEstimateDbId($estimate);

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
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('Database error updating estimate: ' . $wpdb->last_error);
                    }
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
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log('Database error inserting estimate: ' . $wpdb->last_error);
                    }
                    throw new \Exception('Database error inserting estimate: ' . $wpdb->last_error);
                }

                $new_db_id = $wpdb->insert_id;

                // Update the session data with the new DB ID
                $this->setEstimateDbId($session_estimate_id, $new_db_id);

                return $new_db_id;
            }
        } catch (\Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Exception in storeOrUpdateEstimate: ' . $e->getMessage());
                error_log('Stack trace: ' . $e->getTraceAsString());
            }
            return false;
        }
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

    /**
     * Get customer email from estimate or session
     *
     * @param array $estimate The estimate data
     * @return string The customer email or empty string if not found
     */
    private function get_customer_email($estimate) {
        $customer_email = '';

        // First check in estimate's customer details
        if (isset($estimate['customer_details']['email']) && !empty($estimate['customer_details']['email'])) {
            $customer_email = sanitize_email($estimate['customer_details']['email']);
        } else {
            // If not in estimate, check session's customer details
            $customer_details = $this->session->getCustomerDetails();
            if (isset($customer_details['email']) && !empty($customer_details['email'])) {
                $customer_email = sanitize_email($customer_details['email']);
            }
        }

        return $customer_email;
    }

    /**
     * Get estimate data from the database
     *
     * @param int $db_id The database ID
     * @return array|false The estimate data or false if not found
     */
    public function get_estimate_from_db($db_id) {
        // First try using the EstimateModel
        if (isset($this->estimate_model) && method_exists($this->estimate_model, 'get_estimate')) {
            $estimate_row = $this->estimate_model->get_estimate($db_id);

            if ($estimate_row && isset($estimate_row['estimate_data'])) {
                if (is_array($estimate_row['estimate_data'])) {
                    // Data already decoded
                    $estimate_data = $estimate_row['estimate_data'];
                } else {
                    // Data needs to be decoded from JSON
                    $estimate_data = json_decode($estimate_row['estimate_data'], true);
                }

                if (is_array($estimate_data)) {
                    // Make sure the db_id is set in the estimate data for proper display
                    $estimate_data['db_id'] = $db_id;
                    return $estimate_data;
                }
            }
        }

        // Fall back to using the trait method if available
        return $this->getEstimateFromDb($db_id);

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
     * Handle request copy functionality
     * Sends an email with the PDF estimate attached
     */
    public function request_copy_estimate() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Get the estimate ID to store
        $estimate_id = array_key_exists('estimate_id', $_POST) ? sanitize_text_field($_POST['estimate_id']) : null;



        // Special handling for estimate_id validation - allow "0" as valid
        if (!isset($estimate_id) || $estimate_id === '') {
            wp_send_json_error([
                'message' => __('Estimate ID is required', 'product-estimator')
            ]);
            return;
        }

        try {



            // Get the estimate from session
            $estimate = $this->session->getEstimate($estimate_id);


            if (!$estimate) {
                wp_send_json_error([
                    'message' => __('Estimate not found', 'product-estimator')
                ]);
                return;
            }

            // Check if customer has a valid email address
            $customer_email = $this->get_customer_email($estimate);

            // If no email found, return error (the frontend will handle prompting for email)
            if (empty($customer_email)) {
                wp_send_json_error([
                    'message' => __('No customer email found', 'product-estimator'),
                    'code' => 'no_email'
                ]);
                return;
            }

            // Check notification settings to see if we need to generate a PDF
            $options = get_option('product_estimator_settings', array());
            $include_pdf = isset($options['notification_request_copy_include_pdf'])
                ? (bool)$options['notification_request_copy_include_pdf']
                : true; // Default to true for backwards compatibility

            $db_id = $this->getEstimateDbId($estimate);

            $estimate_data = $this->get_estimate_from_db($db_id);

            // Only generate PDF if the setting is enabled
            if ($include_pdf) {
                // Generate PDF


                $pdf_generator = new \RuDigital\ProductEstimator\Includes\Utilities\PDFGenerator();
                $pdf_content = $pdf_generator->generate_pdf($estimate_data);

                if (empty($pdf_content)) {
                    $this->output_error('Failed to generate PDF');
                    return;
                }

                // Save PDF to a temporary file
                $tmp_file = sys_get_temp_dir() . '/andersens-estimate-' . $db_id . " - " . uniqid() . '.pdf';
                file_put_contents($tmp_file, $pdf_content);

                if (!isset($tmp_file)) {
                    wp_send_json_error([
                        'message' => __('Error generating PDF for email', 'product-estimator')
                    ]);
                    return;
                }
            }

            // Send email with or without PDF attachment
            $pdf_path = $include_pdf ? $tmp_file : '';
            $email_sent = $this->send_estimate_email($estimate_data, $customer_email, $pdf_path);

            if (!$email_sent) {
                wp_send_json_error([
                    'message' => __('Error sending email', 'product-estimator')
                ]);
                return;
            }


            wp_send_json_success([
                'message' => __('Estimate has been emailed to', 'product-estimator') . ' ' . $customer_email,
                'email' => $customer_email, // Add email to response for confirmation dialog
                'pdf_included' => $include_pdf // Indicate whether PDF was included
            ]);


            if (file_exists($tmp_file)) {
                @unlink($tmp_file);
            }

        } catch (\Exception $e) {
            $this->log_error('Error in request_copy_estimate', $e);
            wp_send_json_error([
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }
    }




    /**
     * Send email with PDF estimate attachment
     *
     * @param array $estimate The estimate data
     * @param string $email The recipient email
     * @param string $pdf_path Path to the PDF file
     * @return bool Success or failure
     */
    private function send_estimate_email($estimate, $email, $pdf_path) {
        // Get notification settings
        $options = get_option('product_estimator_settings', array());

        // Get site info for fallbacks
        $site_name = get_bloginfo('name');

        // Use from_name and from_email from general notification settings, with fallbacks
        $from_name = isset($options['from_name']) && !empty($options['from_name'])
            ? $options['from_name']
            : $site_name;

        $from_email = isset($options['from_email']) && !empty($options['from_email'])
            ? $options['from_email']
            : get_option('admin_email');

        // Get notification template for request_copy type
        $subject_template = isset($options['notification_request_copy_subject']) && !empty($options['notification_request_copy_subject'])
            ? $options['notification_request_copy_subject']
            : sprintf(__('%s: Your Requested Estimate', 'product-estimator'), $site_name);

        $content_template = isset($options['notification_request_copy_content']) && !empty($options['notification_request_copy_content'])
            ? $options['notification_request_copy_content']
            : sprintf(
                __("Hello %s,\n\nThank you for your interest in our products. As requested, please find attached your estimate \"%s\".\n\nIf you have any questions or would like to discuss this estimate further, please don't hesitate to contact us.\n\nBest regards,\n%s"),
                '[customer_name]',
                '[estimate_name]',
                $site_name
            );

        // Check if we should include the PDF attachment
        $include_pdf = isset($options['notification_request_copy_include_pdf'])
            ? (bool)$options['notification_request_copy_include_pdf']
            : true; // Default to true for backwards compatibility

        // Get customer details for template tags
        $customer_name = isset($estimate['customer_details']['name'])
            ? $estimate['customer_details']['name']
            : __('Customer', 'product-estimator');

        $estimate_name = isset($estimate['name'])
            ? $estimate['name']
            : __('Untitled Estimate', 'product-estimator');

        // Replace template tags
        $subject = str_replace(
            ['[site_name]', '[estimate_name]', '[estimate_id]', '[customer_name]'],
            [$site_name, $estimate_name, $estimate['db_id'] ?? 'New', $customer_name],
            $subject_template
        );

        $body = str_replace(
            ['[site_name]', '[site_url]', '[estimate_name]', '[estimate_id]', '[customer_name]', '[customer_email]', '[date]'],
            [$site_name, home_url(), $estimate_name, $estimate['db_id'] ?? 'New', $customer_name, $email, date_i18n(get_option('date_format'))],
            $content_template
        );

//        $pdf_url = product_estimator_get_pdf_url($estimate['db_id']);
//        $body .= "\n\nView your estimate online: " . $pdf_url;


        // Properly format line breaks for emails - convert \n to <br> for HTML
        $body = wpautop($body); // Convert double line breaks to paragraphs

        // Set HTML headers
        $headers = [
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . $from_name . ' <' . $from_email . '>'
        ];

        // Attach PDF file only if the setting is enabled and path is provided
        $attachments = array();
        if ($include_pdf && !empty($pdf_path) && file_exists($pdf_path)) {
            $attachments[] = $pdf_path;
        }

        // Send email
        $sent = wp_mail($email, $subject, $body, $headers, $attachments);

        if (defined('WP_DEBUG') && WP_DEBUG) {
            $this->log_debug('Sent estimate email to ' . $email . ': ' . ($sent ? 'Success' : 'Failed'));
            $this->log_debug('Included PDF attachment: ' . ($include_pdf && !empty($pdf_path) ? 'Yes' : 'No'));
        }

        return $sent;
    }

    /**
     * Log error message and stack trace
     *
     * @param string $message Error message
     * @param \Exception $exception Exception object
     */
    private function log_error($message, \Exception $exception = null) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log($message);
            if ($exception) {
                error_log($exception->getMessage());
                error_log('Stack trace: ' . $exception->getTraceAsString());
            }
        }
    }

    /**
     * Log debug message if debugging is enabled
     *
     * @param string $message Debug message
     */
    private function log_debug($message) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log($message);
        }
    }
}
