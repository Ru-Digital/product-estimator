<?php
namespace RuDigital\ProductEstimator\Includes\Ajax;

use RuDigital\ProductEstimator\Includes\CustomerDetails;
use RuDigital\ProductEstimator\Includes\SessionHandler;

/**
 * Customer-related AJAX handlers
 */
class CustomerAjaxHandler extends AjaxHandlerBase {

    /**
     * Register WordPress hooks for AJAX endpoints
     *
     * @return void
     */
    protected function register_hooks() {
        $this->register_ajax_endpoint('update_customer_details', 'updateCustomerDetails');
        $this->register_ajax_endpoint('delete_customer_details', 'deleteCustomerDetails');
        $this->register_ajax_endpoint('check_customer_details', 'check_customer_details');
        $this->register_ajax_endpoint('request_store_contact', 'request_store_contact');
    }

    /**
     * Update customer details via AJAX
     */
    public function updateCustomerDetails() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        if (!isset($_POST['details'])) {
            wp_send_json_error(['message' => __('Invalid details provided', 'product-estimator')]);
            return;
        }

        $details_data = $_POST['details'];


        if (is_string($details_data)) {
            $details_data = json_decode(stripslashes($details_data), true);
        }

        // Validate details structure
        if (!is_array($details_data)) {
            wp_send_json_error(['message' => __('Invalid details format', 'product-estimator')]);
            return;
        }

        // Get the details from the request, keeping only fields that were submitted
        $details = [];

        // Always include required fields
        $details['postcode'] = isset($details_data['postcode']) ? sanitize_text_field($details_data['postcode']) : '';

        // Only include email if it was provided in the form
        if (isset($details_data['name'])) {
            $details['name'] = sanitize_text_field($details_data['name']);
        }

        // Only include email if it was provided in the form
        if (isset($details_data['email'])) {
            $details['email'] = sanitize_email($details_data['email']);
        }

        // Only include phone if it was provided in the form
        if (isset($details_data['phone'])) {
            $details['phone'] = sanitize_text_field($details_data['phone']);
        }

        // Validate required fields
        if (empty($details['postcode'])) {
            wp_send_json_error(['message' => __('Please fill in all required fields', 'product-estimator')]);
            return;
        }

        // Validate email format if provided
        if (isset($details['email']) && !empty($details['email']) && !is_email($details['email'])) {
            wp_send_json_error(['message' => __('Please enter a valid email address', 'product-estimator')]);
            return;
        }

        try {
            // Initialize CustomerDetails
            $customer_details = new \RuDigital\ProductEstimator\Includes\CustomerDetails();

            // Get existing details to preserve any fields not in the form
            $existing_details = $customer_details->getDetails();

            // Merge new details with existing details
            // This preserves fields that weren't in the form but were in the session
            $merged_details = array_merge($existing_details, $details);

            // Update the details
            $success = $customer_details->setDetails($merged_details);

            if ($success) {
                // Get the updated details to confirm they were set correctly
                $updated_details = $customer_details->getDetails();

                wp_send_json_success([
                    'message' => __('Customer details updated successfully', 'product-estimator'),
                    'details' => $updated_details
                ]);
            } else {
                wp_send_json_error(['message' => __('Failed to update customer details', 'product-estimator')]);
            }
        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => __('An error occurred while updating details', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Delete customer details via AJAX
     */
    public function deleteCustomerDetails() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        try {
            // Initialize CustomerDetails
            $customer_details = new \RuDigital\ProductEstimator\Includes\CustomerDetails();

            // Delete the details
            $success = $customer_details->clearDetails();

            if ($success) {
                // Get the HTML for the empty form
                ob_start();
                ?>
                <!-- New empty customer details form -->
                <div class="customer-details-section">
                    <h4><?php esc_html_e('Your Details', 'product-estimator'); ?></h4>

                    <!--                    <div class="form-group">-->
                    <!--                        <label for="customer-name">--><?php //esc_html_e('Full Name', 'product-estimator'); ?><!--</label>-->
                    <!--                        <input type="text" id="customer-name" name="customer_name" placeholder="--><?php //esc_attr_e('Your full name', 'product-estimator'); ?><!--" required>-->
                    <!--                    </div>-->

                    <div class="form-group">
                        <label for="customer-postcode"><?php esc_html_e('Postcode', 'product-estimator'); ?></label>
                        <input type="text" id="customer-postcode" name="customer_postcode" placeholder="<?php esc_attr_e('Your postcode', 'product-estimator'); ?>" required>
                    </div>
                </div>
                <?php
                $html = ob_get_clean();

                wp_send_json_success([
                    'message' => __('Customer details deleted successfully', 'product-estimator'),
                    'html' => $html
                ]);
            } else {
                wp_send_json_error(['message' => __('Failed to delete customer details', 'product-estimator')]);
            }
        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => __('An error occurred while deleting details', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Check if customer has valid details set in session.
     * MODIFIED: Uses CustomerDetails class which handles lazy session loading.
     * Removed explicit session start.
     */
    public function check_customer_details() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Get estimate ID if provided (optional, used for fallback check)
        $estimate_id = array_key_exists('estimate_id', $_POST) ? sanitize_text_field($_POST['estimate_id']) : null;

        try {
            // Initialize customer details manager.
            // The constructor no longer starts the session.
            // Session will only be started if getDetails() needs to load data.
            if (!class_exists('\\RuDigital\\ProductEstimator\\Includes\\CustomerDetails')) {
                require_once dirname(__FILE__) . '/class-customer-details.php';
            }
            $customer_details_manager = new CustomerDetails(); // Instantiate

            // Get details - this will trigger ensureDetailsLoaded() inside CustomerDetails if needed
            $customer_details = $customer_details_manager->getDetails(); // Returns [] if none or session fails

            // Check specific fields
            $has_email = $customer_details_manager->hasEmail(); // Checks loaded details
            $has_name = !empty($customer_details['name']);
            $has_phone = !empty($customer_details['phone']);
            $has_postcode = !empty($customer_details['postcode']); // Assuming postcode is essential

            // Fallback: If global details lack email, check the specific estimate's details
            // This requires getting the SessionHandler instance directly here.
            if (!$has_email && $estimate_id !== null) {
                $session = SessionHandler::getInstance();
                $estimate = $session->getEstimate($estimate_id); // This ensures session is started if needed

                if ($estimate && isset($estimate['customer_details']) && is_array($estimate['customer_details'])) {
                    $estimate_customer_details = $estimate['customer_details'];
                    if (!empty($estimate_customer_details['email'])) {
                        // If estimate has email, update flags based on estimate's data
                        $has_email = true;
                        $has_name = !empty($estimate_customer_details['name']);
                        $has_phone = !empty($estimate_customer_details['phone']);
                        $has_postcode = !empty($estimate_customer_details['postcode']);
                        // Optionally update the main $customer_details variable to return the estimate-specific ones
                        // $customer_details = $estimate_customer_details;
                    }
                }
            }

            wp_send_json_success([
                'has_email' => $has_email,
                'has_name' => $has_name,
                'has_phone' => $has_phone,
                'has_postcode' => $has_postcode, // Added postcode check flag
                'customer_details' => $customer_details // Return the details found (global or potentially estimate-specific if logic was added)
            ]);

        } catch (\Exception $e) {
            // Catch potential errors during CustomerDetails instantiation or session handling
            error_log('Error checking customer details: ' . $e->getMessage());
            wp_send_json_error([
                'message' => __('An error occurred while checking customer details.', 'product-estimator'),
                'error_details' => $e->getMessage() // Optionally include details in debug mode
            ]);
        }
    }

    /**
     * AJAX handler for store contact requests
     *
     * Add this to your class-ajax-handler.php file
     */

    /**
     * Handle store contact request
     * Sends notification to the store about customer contact request
     */
    public function request_store_contact() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Get the estimate ID
        $estimate_id = array_key_exists('estimate_id', $_POST) ? sanitize_text_field($_POST['estimate_id']) : null;
        $contact_method = array_key_exists('contact_method', $_POST) ? sanitize_text_field($_POST['contact_method']) : 'email';

        // Custom customer details if provided
        $customer_details_json = array_key_exists('customer_details', $_POST) ? $_POST['customer_details'] : null;
        $custom_customer_details = null;

        if (!empty($customer_details_json)) {
            $custom_customer_details = json_decode(stripslashes($customer_details_json), true);
        }

        if (!isset($estimate_id) || $estimate_id === '') {
            wp_send_json_error([
                'message' => __('Estimate ID is required', 'product-estimator')
            ]);
            return;
        }

        try {
            // Get the estimate from session or database
            $session = SessionHandler::getInstance();

            $estimate = $session->getEstimate($estimate_id);
            $db_id = null;

            // If estimate exists in session, check if it's stored in DB
            if ($estimate) {
                $db_id = $this->getEstimateDbId($estimate);

                // If not in DB, store it
                if (!$db_id) {
                    // Get customer details from estimate or custom details
                    $customer_details = $custom_customer_details ?: ($estimate['customer_details'] ?? []);
                    $notes = isset($estimate['notes']) ? $estimate['notes'] : '';

                    // Store the estimate
                    $db_id = $this->storeOrUpdateEstimate($estimate_id, $customer_details, $notes);

                    if (!$db_id) {
                        throw new \Exception('Failed to store estimate in database');
                    }
                }
            } else {
                // Try to get the estimate directly from the database using the ID
                $db_id = intval($estimate_id);
                $estimate_data = $this->get_estimate_from_db($db_id);

                if (!$estimate_data) {
                    wp_send_json_error([
                        'message' => __('Estimate not found', 'product-estimator')
                    ]);
                    return;
                }

                $estimate = $estimate_data;
            }

            // Get customer details - prefer custom passed details over stored ones
            $customer_details = $custom_customer_details ?: ($estimate['customer_details'] ?? []);

            // Validate customer details based on contact method
            if ($contact_method === 'email') {
                if (empty($customer_details['email'])) {
                    wp_send_json_error([
                        'message' => __('Customer email is required for email contact', 'product-estimator'),
                        'code' => 'missing_email'
                    ]);
                    return;
                }
            } else if ($contact_method === 'phone') {
                if (empty($customer_details['phone'])) {
                    wp_send_json_error([
                        'message' => __('Customer phone number is required for phone contact', 'product-estimator'),
                        'code' => 'missing_phone'
                    ]);
                    return;
                }
            }

            // Get postcode to determine which store to send to
            $postcode = isset($customer_details['postcode']) ? $customer_details['postcode'] : '0000';

            // Use the get_send_store function to get the store email based on postcode
            $store_email = get_send_store($postcode);

            // If no store email found, use default
            if (empty($store_email) || $store_email === 'default@yourdomain.com') {
                // Fallback to admin email
                $store_email = get_option('admin_email');
            }

            // Prepare and send email to store
            $email_sent = $this->send_store_contact_email(
                $store_email,
                $estimate,
                $customer_details,
                $contact_method
            );

            if (!$email_sent) {
                throw new \Exception('Failed to send email to store');
            }

            wp_send_json_success([
                'message' => __('Your contact request has been sent to the store', 'product-estimator'),
                'contact_method' => $contact_method
            ]);

        } catch (\Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Error in request_store_contact: ' . $e->getMessage());
            }

            wp_send_json_error([
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send contact request email to store
     *
     * @param string $store_email Store email address
     * @param array $estimate Estimate data
     * @param array $customer_details Customer details
     * @param string $contact_method Contact method ('email' or 'phone')
     * @return bool Success or failure
     */
    private function send_store_contact_email($store_email, $estimate, $customer_details, $contact_method) {
        // Get site info for email
        $site_name = get_bloginfo('name');
        $site_url = home_url();

        // Get notification settings
        $options = get_option('product_estimator_settings', array());

        // Use from_name and from_email from settings if available
        $from_name = isset($options['from_name']) && !empty($options['from_name'])
            ? $options['from_name']
            : $site_name;

        $from_email = isset($options['from_email']) && !empty($options['from_email'])
            ? $options['from_email']
            : get_option('admin_email');

        // Build email subject
        $subject = sprintf(
            __('%s: Customer Contact Request via %s', 'product-estimator'),
            $site_name,
            $contact_method === 'email' ? 'Email' : 'Phone'
        );

        // Get customer name or default to "Customer"
        $customer_name = isset($customer_details['name']) && !empty($customer_details['name'])
            ? $customer_details['name']
            : __('Customer', 'product-estimator');

        // Get estimate name or default to "Untitled Estimate"
        $estimate_name = isset($estimate['name']) && !empty($estimate['name'])
            ? $estimate['name']
            : __('Untitled Estimate', 'product-estimator');

        // Get estimate ID
        $estimate_id = isset($estimate['db_id']) ? $estimate['db_id'] : '';

        // Build email body based on contact method
        if ($contact_method === 'email') {
            $customer_email = isset($customer_details['email']) ? $customer_details['email'] : '';

            $body = sprintf(
                __("Hello,\n\nA customer has requested to be contacted via email about their estimate.\n\nCustomer Details:\nName: %s\nEmail: %s\nPostcode: %s\n\nEstimate Information:\nName: %s\nID: %s\n\nPlease contact the customer at your earliest convenience.\n\nThis request was sent from %s on %s", 'product-estimator'),
                $customer_name,
                $customer_email,
                isset($customer_details['postcode']) ? $customer_details['postcode'] : '',
                $estimate_name,
                $estimate_id,
                $site_name,
                date_i18n(get_option('date_format'))
            );
        } else {
            $customer_phone = isset($customer_details['phone']) ? $customer_details['phone'] : '';

            $body = sprintf(
                __("Hello,\n\nA customer has requested to be contacted via phone about their estimate.\n\nCustomer Details:\nName: %s\nPhone: %s\nPostcode: %s\n\nEstimate Information:\nName: %s\nID: %s\n\nPlease contact the customer at your earliest convenience.\n\nThis request was sent from %s on %s", 'product-estimator'),
                $customer_name,
                $customer_phone,
                isset($customer_details['postcode']) ? $customer_details['postcode'] : '',
                $estimate_name,
                $estimate_id,
                $site_name,
                date_i18n(get_option('date_format'))
            );
        }

        // Create PDF attachment if estimate is in database
        $attachments = array();
        if ($estimate_id) {
            try {
                // Get the estimate data from DB to ensure it's the latest version
                $db_id = isset($estimate['db_id']) ? $estimate['db_id'] : intval($estimate_id);
                $estimate_data = $this->get_estimate_from_db($db_id);

                // Generate PDF only if we have valid estimate data
                if ($estimate_data) {
                    $pdf_generator = new \RuDigital\ProductEstimator\Includes\Utilities\PDFGenerator();
                    $pdf_content = $pdf_generator->generate_pdf($estimate_data);

                    if (!empty($pdf_content)) {
                        // Save PDF to a temporary file
                        $tmp_file = sys_get_temp_dir() . '/andersens-estimate-' . $db_id . " - " . uniqid() . '.pdf';
                        file_put_contents($tmp_file, $pdf_content);
                        $attachments[] = $tmp_file;
                    }
                }
            } catch (\Exception $e) {
                // Log error but continue to send email without PDF
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Error generating PDF for store contact email: ' . $e->getMessage());
                }
            }
        }

        // Set HTML headers
        $headers = [
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . $from_name . ' <' . $from_email . '>'
        ];

        // Convert line breaks to HTML for email
        $body = wpautop($body);

        // Add PDF URL if available
        if ($estimate_id && isset($estimate['db_id'])) {
            // Get admin PDF URL
            $pdf_url = admin_url('admin.php?page=product-estimator-estimates&action=view&id=' . $estimate['db_id']);
            $body .= '<p><a href="' . esc_url($pdf_url) . '">' . __('View Estimate', 'product-estimator') . '</a></p>';
        }

        error_log("store email: " . $store_email);
        // Send email
//        $sent = wp_mail($store_email, $subject, $body, $headers, $attachments);

        // Delete temporary files
        foreach ($attachments as $file) {
            if (file_exists($file)) {
                @unlink($file);
            }
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            $this->log_debug('Store contact email ' . ($sent ? 'sent' : 'failed') . ' to ' . $store_email);
        }

        return $sent;
    }

}
