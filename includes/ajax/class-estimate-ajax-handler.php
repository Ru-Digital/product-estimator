<?php
namespace RuDigital\ProductEstimator\Includes\Ajax;

use RuDigital\ProductEstimator\Includes\CustomerDetails;
use RuDigital\ProductEstimator\Includes\Traits\EstimateDbHandler;
use RuDigital\ProductEstimator\Includes\SessionHandler;
use RuDigital\ProductEstimator\Includes\Frontend\LabelsFrontend;

/**
 * Estimate-related AJAX handlers
 */
class EstimateAjaxHandler extends AjaxHandlerBase {
    use EstimateDbHandler;

    /**
     * Register WordPress hooks for AJAX endpoints
     *
     * @return void
     */
    protected function register_hooks() {
        $this->register_ajax_endpoint('get_estimates_list', 'getEstimatesList');
        $this->register_ajax_endpoint('get_estimates_data', 'getEstimatesData');
        $this->register_ajax_endpoint('add_new_estimate', 'addNewEstimate');
        $this->register_ajax_endpoint('remove_estimate', 'removeEstimate');
        $this->register_ajax_endpoint('check_estimates_exist', 'checkEstimatesExist');
        $this->register_ajax_endpoint('store_single_estimate', 'store_single_estimate');
        $this->register_ajax_endpoint('check_estimate_stored', 'check_estimate_stored');
        $this->register_ajax_endpoint('get_secure_pdf_url', 'get_secure_pdf_url');
        $this->register_ajax_endpoint('request_copy_estimate', 'request_copy_estimate');
    }

    /**
     * Modified version of the getEstimatesList method
     * Removes suggestion generation code
     */
    public function getEstimatesList() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Make sure the LabelsFrontend class is available
        if (!class_exists('\\RuDigital\\ProductEstimator\\Includes\\Frontend\\LabelsFrontend')) {
            require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/frontend/class-labels-frontend.php';
        }

        // Get the global labels_frontend instance or create a new one
        global $product_estimator_labels_frontend;
        if (!isset($product_estimator_labels_frontend) || is_null($product_estimator_labels_frontend)) {
            $product_estimator_labels_frontend = new \RuDigital\ProductEstimator\Includes\Frontend\LabelsFrontend('product-estimator', PRODUCT_ESTIMATOR_VERSION);
        }

        // Start output buffer to capture HTML
        ob_start();

        // Get all estimates
        $session = SessionHandler::getInstance();

        $estimates = $session->getEstimates();

        // We no longer need to generate suggestions here
        // The template will handle this at render time

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
        $session = SessionHandler::getInstance();

        // Get all estimates
        $estimates = $session->getEstimates();

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
     * Handle new estimate submission
     * Modified to use the CustomerDetails class
     */
    public function addNewEstimate() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'product_estimator_nonce')) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Nonce verification failed');
            }
            wp_send_json_error(['message' => __('Security check failed.', 'product-estimator')]);
            return;
        }

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

            // Check if CustomerDetails class exists and is accessible
            if (!class_exists('\\RuDigital\\ProductEstimator\\Includes\\CustomerDetails')) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('CustomerDetails class not found, including directly');
                }
                // Include it directly if needed
                require_once dirname(__FILE__) . '/class-customer-details.php';
            }

            // Initialize CustomerDetails class with error handling
            try {
                $customer_details_manager = new CustomerDetails();
            } catch (\Exception $e) {
                error_log('Error initializing CustomerDetails: ' . $e->getMessage());
                // Fallback to basic handling without CustomerDetails class
                $customer_details = [
                    'name' => isset($form_data['customer_name']) ? sanitize_text_field($form_data['customer_name']) : '',
                    'email' => isset($form_data['customer_email']) ? sanitize_email($form_data['customer_email']) : '',
                    'phone' => isset($form_data['customer_phone']) ? sanitize_text_field($form_data['customer_phone']) : '',
                    'postcode' => isset($form_data['customer_postcode']) ? sanitize_text_field($form_data['customer_postcode']) : ''
                ];

                // Store in session directly using the standard key
                if (!isset($_SESSION['product_estimator'])) {
                    $_SESSION['product_estimator'] = [];
                }
                $_SESSION['product_estimator']['customer_details'] = $customer_details;

                // Get default markup from pricing rules settings
                $pricing_rules = get_option('product_estimator_pricing_rules');
                $default_markup = isset($pricing_rules['default_markup']) ? floatval($pricing_rules['default_markup']) : 0;

                // Get client-provided UUID if available
                $client_uuid = isset($_POST['estimate_uuid']) ? sanitize_text_field($_POST['estimate_uuid']) : null;
                
                if (empty($client_uuid)) {
                    wp_send_json_error(['message' => __('Estimate UUID is required', 'product-estimator')]);
                    return;
                }

                // Create new estimate data with the client UUID
                $estimate_data = [
                    'id' => $client_uuid, // Include the UUID from the client
                    'name' => sanitize_text_field($form_data['estimate_name']),
                    'created_at' => current_time('mysql'),
                    'rooms' => [],
                    'customer_details' => $customer_details,
                    'plugin_version' => PRODUCT_ESTIMATOR_VERSION,
                    'default_markup' => $default_markup
                ];
                $session = SessionHandler::getInstance();

                $estimate_id = $session->addEstimate($estimate_data);
                
                if (!$estimate_id) {
                    wp_send_json_error(['message' => __('Failed to create estimate', 'product-estimator')]);
                    return;
                }

                wp_send_json_success([
                    'message' => __('Estimate created successfully (fallback mode)', 'product-estimator'),
                    'estimate_id' => $estimate_id,
                    'has_customer_details' => true
                ]);
                return;
            }

            // Check if we need to save customer details
            $save_customer_details = false;
            $customer_details = [];

            if (!$customer_details_manager->hasCompleteDetails()) {
                // Validate and process customer details from form
                $validated_details = $customer_details_manager->validateFormData($form_data);

                if (is_wp_error($validated_details)) {
                    wp_send_json_error(['message' => $validated_details->get_error_message()]);
                    return;
                }

                // Save validated details
                $customer_details_manager->setDetails($validated_details);
                $customer_details = $validated_details;
                $save_customer_details = true;
            } else {
                // Use existing details
                $customer_details = $customer_details_manager->getDetails();
            }

            $pricing_rules = get_option('product_estimator_pricing_rules');
            $default_markup = isset($pricing_rules['default_markup']) ? floatval($pricing_rules['default_markup']) : 0;

            // Get client-provided UUID if available
            $client_uuid = isset($_POST['estimate_uuid']) ? sanitize_text_field($_POST['estimate_uuid']) : null;
            
            if (empty($client_uuid)) {
                wp_send_json_error(['message' => __('Estimate UUID is required', 'product-estimator')]);
                return;
            }
            
            // Create new estimate data with the client UUID as the ID
            $estimate_data = [
                'id' => $client_uuid, // Include the UUID from the client
                'name' => sanitize_text_field($form_data['estimate_name']),
                'created_at' => current_time('mysql'),
                'rooms' => [],
                'customer_details' => $customer_details,
                'plugin_version' => PRODUCT_ESTIMATOR_VERSION,
                'default_markup' => $default_markup
            ];

            // Add estimate to session
            $session = SessionHandler::getInstance();

            $estimate_id = $session->addEstimate($estimate_data);

            if (!$estimate_id) { // No need to check for '0' as we're using UUIDs now
                wp_send_json_error(['message' => __('Failed to create estimate', 'product-estimator')]);
                return;
            }

            wp_send_json_success([
                'message' => __('Estimate created successfully', 'product-estimator'),
                'estimate_id' => $estimate_id,
                'has_customer_details' => true
            ]);

        } catch (\Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Exception in addNewEstimate: ' . $e->getMessage());
                error_log('Stack trace: ' . $e->getTraceAsString());
            }
            wp_send_json_error(['message' => $e->getMessage()]);
        }
    }

    /**
     * Remove an entire estimate
     */
    public function removeEstimate() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        if (!isset($_POST['estimate_id'])) {
            wp_send_json_error(['message' => __('Estimate ID is required', 'product-estimator')]);
            return;
        }

        $estimate_id = sanitize_text_field($_POST['estimate_id']);

        try {
            // Get the estimate from session
            $session = SessionHandler::getInstance();

            $estimate = $session->getEstimate($estimate_id);

            if (!$estimate) {
                wp_send_json_error(['message' => __('Estimate not found', 'product-estimator')]);
                return;
            }

            // Add debug logging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("Removing estimate ID: {$estimate_id}");
            }

            // Remove the estimate
            $removed = $session->removeEstimate($estimate_id);

            if (!$removed) {
                wp_send_json_error(['message' => __('Failed to remove estimate', 'product-estimator')]);
                return;
            }

            wp_send_json_success([
                'message' => __('Estimate removed successfully', 'product-estimator'),
                'estimate_id' => $estimate_id
            ]);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }
    }

    public function checkEstimatesExist() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Force session initialization
        $session = SessionHandler::getInstance();

        // Get all estimates and check if there are any
        $estimates = $session->getEstimates();
        $has_estimates = !empty($estimates);

        wp_send_json_success([
            'has_estimates' => $has_estimates,
            'debug' => [
                'session_id' => session_id(),
                'estimate_count' => count($estimates)
            ]
        ]);
    }

    /**
     * Store current session data in the database with proper error handling
     * This is a fixed version that prevents empty estimate_id issues
     */
    public function store_single_estimate() {
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

        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Processing store_single_estimate with estimate_id: ' . $estimate_id);
        }

        try {
            // Explicitly check if the estimate exists in session
            $session = SessionHandler::getInstance();

            $estimate = $session->getEstimate($estimate_id);
            if (!$estimate) {
                throw new \Exception(__('Estimate not found in session', 'product-estimator'));
            }

            // Get customer details from estimate
            $customer_details = isset($estimate['customer_details']) ? $estimate['customer_details'] : [];
            $notes = isset($estimate['notes']) ? $estimate['notes'] : '';

            // Store or update the estimate using our shared trait method
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Calling storeOrUpdateEstimate with:');
                error_log('Estimate ID: ' . print_r($estimate_id, true));
                error_log('Customer details: ' . print_r($customer_details, true));
                error_log('Notes: ' . print_r($notes, true));
            }
            $db_id = $this->storeOrUpdateEstimate($estimate_id, $customer_details, $notes);

            if (!$db_id) {
                throw new \Exception(__('Error saving estimate to database', 'product-estimator'));
            }

            // No need to manually update the session as storeOrUpdateEstimate already did this
            wp_send_json_success([
                'message' => __('Estimate saved successfully', 'product-estimator'),
                'estimate_id' => $db_id,
                'session_id' => $estimate_id,
                'is_update' => $this->getEstimateDbId($estimate_id) == $db_id
            ]);

        } catch (\Exception $e) {
            // Additional logging for debugging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Exception in store_single_estimate: ' . $e->getMessage());
                error_log('Trace: ' . $e->getTraceAsString());
            }

            wp_send_json_error([
                'message' => $e->getMessage(),
                'error' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Check if an estimate is already stored in the database
     */
    public function check_estimate_stored() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Get the estimate ID to check
        $estimate_id = array_key_exists('estimate_id', $_POST) ? sanitize_text_field($_POST['estimate_id']) : null;

        if (empty($estimate_id)) {

            wp_send_json_error([
                'message' => __('Estimate ID is required', 'product-estimator')
            ]);
            return;
        }

        try {
            // Get the estimate from session
            $session = SessionHandler::getInstance();

            $estimate = $session->getEstimate($estimate_id);

            if (empty($estimate)) {
                wp_send_json_error([
                    'message' => __('Estimate not found in session', 'product-estimator')
                ]);
                return;
            }

            // Use the trait method to check if it's stored
            $is_stored = $this->isEstimateStored($estimate);
            $db_id = $this->getEstimateDbId($estimate);

            wp_send_json_success([
                'is_stored' => $is_stored,
                'estimate_id' => $estimate_id,
                'db_id' => $db_id
            ]);

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Generate a secure PDF URL with token
     * Add this to the AjaxHandler class in class-ajax-handler.php
     */
    public function get_secure_pdf_url() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        if (!isset($_POST['estimate_id'])) {
            wp_send_json_error([
                'message' => __('Estimate ID is required', 'product-estimator')
            ]);
            return;
        }

        $estimate_id = intval($_POST['estimate_id']);

        // Get the PDF Route Handler
        $pdf_handler = new \RuDigital\ProductEstimator\Includes\PDFRouteHandler();

        // Generate a secure token
        $token = $pdf_handler->generate_secure_pdf_token($estimate_id);

        if (!$token) {
            wp_send_json_error([
                'message' => __('Failed to generate secure PDF token', 'product-estimator')
            ]);
            return;
        }

        // Build the URL
        $url = home_url('/product-estimator/pdf/view/' . $token);

        wp_send_json_success([
            'url' => $url,
            'token' => $token,
            'estimate_id' => $estimate_id
        ]);
    }

    /**
     * Handle AJAX request to email a copy of the estimate to the customer.
     * Uses SessionHandler and the EstimateDbHandler trait methods.
     * Calls the global product_estimator_get_customer_email() helper.
     */
    public function request_copy_estimate() {
        // Verify nonce security check
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Get the estimate ID from the POST request
        $estimate_id = array_key_exists('estimate_id', $_POST) ? sanitize_text_field($_POST['estimate_id']) : null;

        // Validate estimate_id (allow '0')
        if (!isset($estimate_id) || $estimate_id === '') {
            wp_send_json_error([
                'message' => __('Estimate ID is required', 'product-estimator')
            ]);
            return;
        }
        $session_estimate_id = (string)$estimate_id; // Use this for session lookups

        try {
            // Get SessionHandler instance
            $session = SessionHandler::getInstance();

            // Get the estimate data from the session
            $estimate_session_data = $session->getEstimate($session_estimate_id);

            if (!$estimate_session_data) {
                // Maybe it's only in the DB? Try loading it.
                // If estimate_id *is* the DB ID (e.g., from admin view)
                if (ctype_digit($session_estimate_id)) {
                    $db_id_to_load = intval($session_estimate_id);
                    // Ensure it's loaded into session (returns session ID or null)
                    $session_estimate_id = $this->ensureEstimateInSession($db_id_to_load);
                    if ($session_estimate_id === null) {
                        wp_send_json_error(['message' => __('Estimate not found', 'product-estimator')]);
                        return;
                    }
                    $estimate_session_data = $session->getEstimate($session_estimate_id);
                    if (!$estimate_session_data) { // Double check after loading attempt
                        wp_send_json_error(['message' => __('Estimate could not be loaded into session', 'product-estimator')]);
                        return;
                    }
                } else {
                    wp_send_json_error(['message' => __('Estimate not found in session', 'product-estimator')]);
                    return;
                }
            }

            // Use the globally defined helper function to get the email
            // Pass both the estimate data and the session ID for flexibility
            $customer_email = product_estimator_get_customer_email($estimate_session_data, $session_estimate_id);

            // If no email found, return error code for frontend handling
            if (empty($customer_email)) {
                wp_send_json_error([
                    'message' => __('No customer email found for this estimate.', 'product-estimator'),
                    'code' => 'no_email' // Frontend can check this code
                ]);
                return;
            }

            // Check notification settings if PDF should be included
            $options = get_option('product_estimator_settings', array());
            $include_pdf = isset($options['notification_request_copy_include_pdf'])
                ? (bool)$options['notification_request_copy_include_pdf']
                : true; // Default true

            $pdf_path = '';
            $tmp_file = null;
            $estimate_data_for_pdf = $estimate_session_data; // Use session data by default

            // If including PDF, ensure estimate is saved and get DB data for PDF generation
            if ($include_pdf) {
                $db_id = $this->getEstimateDbId($estimate_session_data); // Use trait method

                // If not saved yet, save it now
                if (!$db_id) {
                    $customer_details_for_save = $estimate_session_data['customer_details'] ?? [];
                    $notes_for_save = $estimate_session_data['notes'] ?? '';
                    $db_id = $this->storeOrUpdateEstimate($session_estimate_id, $customer_details_for_save, $notes_for_save); // Use trait method
                }

                if (!$db_id) {
                    wp_send_json_error(['message' => __('Failed to save estimate before generating PDF.', 'product-estimator')]);
                    return;
                }

                // Fetch potentially updated data from DB for the PDF
                $estimate_data_for_pdf = $this->getEstimateFromDb($db_id); // Use trait method
                if (!$estimate_data_for_pdf) {
                    wp_send_json_error(['message' => __('Failed to retrieve estimate data from database for PDF generation.', 'product-estimator')]);
                    return;
                }

                // Generate PDF
                if (!class_exists(PDFGenerator::class)) {
                    wp_send_json_error(['message' => __('PDF Generation module not available.', 'product-estimator')]);
                    return;
                }
                $pdf_generator = new PDFGenerator();
                $pdf_content = $pdf_generator->generate_pdf($estimate_data_for_pdf); // Use DB data for PDF

                if (empty($pdf_content)) {
                    wp_send_json_error(['message' => __('Failed to generate PDF content.', 'product-estimator')]);
                    return;
                }

                // Save PDF to a temporary file
                $tmp_file = sys_get_temp_dir() . '/estimate-' . $db_id . "-" . uniqid() . '.pdf';
                if (file_put_contents($tmp_file, $pdf_content) === false) {
                    error_log("Product Estimator: Failed to write temporary PDF file to {$tmp_file}");
                    wp_send_json_error(['message' => __('Error saving PDF for email attachment.', 'product-estimator')]);
                    return;
                }
                $pdf_path = $tmp_file;
            }

            // Send email using the private helper method within this class
            // Pass the data used for the PDF (from DB if generated) or session data if no PDF
            $email_sent = $this->send_estimate_email($estimate_data_for_pdf, $customer_email, $pdf_path);

            // Clean up temporary PDF file if it was created
            if ($tmp_file && file_exists($tmp_file)) {
                @unlink($tmp_file);
            }

            // Check if email sending was successful
            if (!$email_sent) {
                wp_send_json_error(['message' => __('Error sending estimate email.', 'product-estimator')]);
                return;
            }

            // Send success response
            wp_send_json_success([
                'message' => __('Estimate has been emailed to', 'product-estimator') . ' ' . esc_html($customer_email),
                'email' => $customer_email, // Return email for confirmation
                'pdf_included' => ($include_pdf && !empty($pdf_path)) // Confirm if PDF was actually attached
            ]);

        } catch (\Exception $e) {
            // Log the detailed error on the server
            error_log("Product Estimator Error in request_copy_estimate: " . $e->getMessage() . "\nStack Trace:\n" . $e->getTraceAsString());
            // Send a generic error message to the client
            wp_send_json_error([
                'message' => __('An error occurred while processing your request.', 'product-estimator'),
                // Optionally include error details only if WP_DEBUG is on
                // 'error_details' => (defined('WP_DEBUG') && WP_DEBUG) ? $e->getMessage() : ''
            ]);
        }
    }

    /**
     * Send email with estimate details and optional PDF attachment.
     * This is a private helper method for request_copy_estimate.
     *
     * @param array $estimate The estimate data array (should contain db_id if saved).
     * @param string $email The recipient email address.
     * @param string $pdf_path Path to the temporary PDF file (optional).
     * @return bool True if email was sent successfully, false otherwise.
     */
    private function send_estimate_email(array $estimate, string $email, string $pdf_path = ''): bool
    {
        // Validate email format
        if (!is_email($email)) {
            error_log("Product Estimator (send_estimate_email): Invalid recipient email format: {$email}");
            return false;
        }

        // Get notification settings from WordPress options
        $options = get_option('product_estimator_settings', array());

        // Get site info for fallbacks and template tags
        $site_name = get_bloginfo('name');
        $site_url = home_url();

        // Determine From Name and From Email from settings or defaults
        $from_name = isset($options['from_name']) && !empty($options['from_name'])
            ? $options['from_name']
            : $site_name;
        $from_email = isset($options['from_email']) && !empty($options['from_email']) && is_email($options['from_email'])
            ? $options['from_email']
            : get_option('admin_email'); // Fallback to WordPress admin email

        // Get Subject and Content templates for the 'request_copy' type
        $subject_template = isset($options['notification_request_copy_subject']) && !empty($options['notification_request_copy_subject'])
            ? $options['notification_request_copy_subject']
            : sprintf(__('%s: Your Requested Estimate', 'product-estimator'), '[site_name]'); // Default subject

        $content_template = isset($options['notification_request_copy_content']) && !empty($options['notification_request_copy_content'])
            ? $options['notification_request_copy_content']
            : sprintf( // Default content
                __("Hello [customer_name],\n\nThank you for your interest in our products. As requested, please find attached your estimate \"%s\".\n\nIf you have any questions or would like to discuss this estimate further, please don't hesitate to contact us.\n\nBest regards,\n%s", 'product-estimator'),
                '[estimate_name]',
                '[site_name]'
            );

        // Determine if PDF should be included based on settings (redundant check, but safe)
        $include_pdf = isset($options['notification_request_copy_include_pdf'])
            ? (bool)$options['notification_request_copy_include_pdf']
            : true;

        // Prepare data for template tag replacement
        $customer_name = isset($estimate['customer_details']['name']) && !empty($estimate['customer_details']['name'])
            ? $estimate['customer_details']['name']
            : __('Customer', 'product-estimator');
        $estimate_name = isset($estimate['name']) && !empty($estimate['name'])
            ? $estimate['name']
            : __('Untitled Estimate', 'product-estimator');
        $db_id = isset($estimate['db_id']) ? $estimate['db_id'] : null; // Get DB ID if available

        // Replace template tags in subject and body
        $subject = str_replace(
            ['[site_name]', '[estimate_name]', '[estimate_id]', '[customer_name]'],
            [$site_name, $estimate_name, $db_id ?? __('New', 'product-estimator'), $customer_name],
            $subject_template
        );

        $body = str_replace(
            ['[site_name]', '[site_url]', '[estimate_name]', '[estimate_id]', '[customer_name]', '[customer_email]', '[date]'],
            [$site_name, $site_url, $estimate_name, $db_id ?? __('New', 'product-estimator'), $customer_name, $email, date_i18n(get_option('date_format'))],
            $content_template
        );

        // Add a link to view the estimate online if it has a DB ID
        if ($db_id) {
            // Generate the secure public URL (assuming product_estimator_get_pdf_url exists)
            if (function_exists('product_estimator_get_pdf_url')) {
                $pdf_public_url = product_estimator_get_pdf_url($db_id, true); // Get customer view URL
                if (!empty($pdf_public_url)) {
                    $body .= "\n\n" . sprintf( // Add a line break before the link
                            __('You can also view your estimate online here: %s', 'product-estimator'),
                            esc_url($pdf_public_url)
                        );
                }
            }
        }

        // Format body for HTML email
        $body_html = wpautop($body); // Use wpautop for paragraph formatting

        // Prepare email headers
        $headers = [
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . sprintf('%s <%s>', $from_name, $from_email) // Correct From header format
        ];

        // Prepare attachments array
        $attachments = [];
        if ($include_pdf && !empty($pdf_path) && file_exists($pdf_path)) {
            $attachments[] = $pdf_path; // Add the temporary PDF path
        }

        // Send the email using WordPress core function
        $sent = wp_mail($email, $subject, $body_html, $headers, $attachments);

        // Log the result if debugging is enabled
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $log_message = sprintf(
                'Product Estimator (send_estimate_email): Attempted to send email to %s. Subject: "%s". Status: %s.',
                $email,
                $subject,
                $sent ? 'Success' : 'Failed'
            );
            if (!empty($attachments)) {
                $log_message .= " Included PDF: " . basename($pdf_path);
            }
            if (!$sent && $GLOBALS['phpmailer'] instanceof \PHPMailer\PHPMailer\PHPMailer) {
                $log_message .= " Mailer Error: " . $GLOBALS['phpmailer']->ErrorInfo;
            }
            error_log($log_message);
        }

        return $sent; // Return true if sent, false otherwise
    }
}
