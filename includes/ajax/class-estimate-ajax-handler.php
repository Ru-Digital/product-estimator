<?php
namespace RuDigital\ProductEstimator\Includes\Ajax;

use RuDigital\ProductEstimator\Includes\CustomerDetails;
use RuDigital\ProductEstimator\Includes\Traits\EstimateDbHandler;
use RuDigital\ProductEstimator\Includes\Frontend\LabelsFrontend;

/**
 * Estimate-related AJAX handlers
 * 
 * This class now only handles database-related operations and PDF generation.
 * All session storage functionality has been removed as the frontend uses localStorage.
 */
class EstimateAjaxHandler extends AjaxHandlerBase {
    use EstimateDbHandler;

    /**
     * Register WordPress hooks for AJAX endpoints
     *
     * @return void
     */
    protected function register_hooks() {
        // These endpoints are used by localStorage-based operations
        $this->register_ajax_endpoint('store_single_estimate', 'store_single_estimate');
        $this->register_ajax_endpoint('check_estimate_stored', 'check_estimate_stored');
        $this->register_ajax_endpoint('get_secure_pdf_url', 'get_secure_pdf_url');
        $this->register_ajax_endpoint('request_copy_estimate', 'request_copy_estimate');
        
        // These endpoints used to interact with session but are now removed
        // - get_estimates_list
        // - get_estimates_data
        // - add_new_estimate
        // - remove_estimate
        // - check_estimates_exist
    }

    /**
     * Store estimate data in the database
     * This is called when the user wants to save their estimate permanently
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

        // Get estimate data from POST request (sent from localStorage)
        $estimate_data = isset($_POST['estimate_data']) ? $_POST['estimate_data'] : null;
        
        if (!$estimate_data) {
            wp_send_json_error([
                'message' => __('Estimate data is required', 'product-estimator')
            ]);
            return;
        }

        // Parse the estimate data if it's a JSON string
        if (is_string($estimate_data)) {
            $estimate_data = json_decode(stripslashes($estimate_data), true);
        }

        try {
            // Get customer details from estimate data
            $customer_details = isset($estimate_data['customer_details']) ? $estimate_data['customer_details'] : [];
            $notes = isset($estimate_data['notes']) ? $estimate_data['notes'] : '';

            // Store or update the estimate using our shared trait method
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Calling storeOrUpdateEstimate with:');
                error_log('Estimate ID: ' . print_r($estimate_id, true));
                error_log('Customer details: ' . print_r($customer_details, true));
                error_log('Notes: ' . print_r($notes, true));
            }
            
            $db_id = $this->storeOrUpdateEstimate($estimate_id, $customer_details, $notes, $estimate_data);

            if (!$db_id) {
                throw new \Exception(__('Error saving estimate to database', 'product-estimator'));
            }

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
            // Check if this estimate has a database ID stored
            $db_id = $this->getEstimateDbId($estimate_id);
            $is_stored = !empty($db_id);

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
     * Uses the EstimateDbHandler trait methods.
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

        try {
            // Get estimate data from the database
            $db_id = $this->getEstimateDbId($estimate_id);
            
            if (!$db_id) {
                wp_send_json_error(['message' => __('Estimate not found in database', 'product-estimator')]);
                return;
            }
            
            $estimate_data = $this->getEstimateFromDb($db_id);
            
            if (!$estimate_data) {
                wp_send_json_error(['message' => __('Failed to retrieve estimate data', 'product-estimator')]);
                return;
            }

            // Use the globally defined helper function to get the email
            $customer_email = product_estimator_get_customer_email($estimate_data, $estimate_id);

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

            // If including PDF, generate it
            if ($include_pdf) {
                // Generate PDF
                if (!class_exists('\\RuDigital\\ProductEstimator\\Includes\\Utilities\\PDFGenerator')) {
                    require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/utilities/class-pdf-generator.php';
                }
                $pdf_generator = new \RuDigital\ProductEstimator\Includes\Utilities\PDFGenerator();
                $pdf_content = $pdf_generator->generate_pdf($estimate_data);

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

            // Send email
            $email_sent = $this->send_estimate_email($estimate_data, $customer_email, $pdf_path);

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