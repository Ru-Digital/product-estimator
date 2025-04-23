<?php
namespace RuDigital\ProductEstimator\Includes;

use RuDigital\ProductEstimator\Includes\Models\EstimateModel;
use RuDigital\ProductEstimator\Includes\Utilities\PDFGenerator;
use RuDigital\ProductEstimator\Includes\Traits\EstimateDbHandler;

/**
 * Estimate Handler
 *
 * Handles operations for printing and managing estimates
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */
class EstimateHandler {
    use EstimateDbHandler;

    /**
     * @var SessionHandler Session handler instance
     */
    private $session;

    /**
     * @var EstimateModel Estimate model instance
     */
    private $estimate_model;

    /**
     * Initialize the class
     */
    public function __construct() {
        // Initialize session handler
        $this->session = SessionHandler::getInstance();

        // Initialize estimate model if the class exists
        if (class_exists('\\RuDigital\\ProductEstimator\\Includes\\Models\\EstimateModel')) {
            $this->estimate_model = new EstimateModel();
        }

        // Register AJAX handlers
        add_action('wp_ajax_print_estimate', array($this, 'handle_print_estimate'));
        add_action('wp_ajax_nopriv_print_estimate', array($this, 'handle_print_estimate'));

        add_action('wp_ajax_request_copy_estimate', array($this, 'request_copy_estimate'));
        add_action('wp_ajax_nopriv_request_copy_estimate', array($this, 'request_copy_estimate'));

        // Register event handlers for estimate buttons
        add_action('wp_footer', array($this, 'register_estimate_buttons_handlers'));

        // Add PDF cleanup hooks
        $this->schedule_pdf_cleanup();
    }

    /**
     * Register JavaScript handlers for estimate buttons
     */
    public function register_estimate_buttons_handlers() {
        ?>
        <script type="text/javascript">
            (function($) {
                $(document).ready(function() {
                    // Print estimate button handler is now handled by PrintEstimate.js
                    // This is kept for legacy support
                    $(document).on('click', '.print-estimate:not(.js-initialized)', function(e) {
                        e.preventDefault();

                        // Check if we have the new handler
                        if (window.productEstimator && window.productEstimator.printEstimate) {
                            console.log('Using new PrintEstimate handler');
                            // Do nothing - the class-based handler will take over
                            $(this).addClass('js-initialized');
                            return;
                        }

                        // Legacy fallback code - only executes if PrintEstimate.js isn't loaded
                        console.log('Using legacy print handler');
                        const estimateId = $(this).data('estimate-id');
                        if (!estimateId) {
                            console.error('No estimate ID provided');
                            return;
                        }

                        // Show loading state
                        $(this).addClass('loading').text('Processing...');
                        const $button = $(this);

                        // Send AJAX request to print estimate
                        $.ajax({
                            url: productEstimatorVars.ajax_url,
                            type: 'POST',
                            data: {
                                action: 'print_estimate',
                                nonce: productEstimatorVars.nonce,
                                estimate_id: estimateId
                            },
                            success: function(response) {
                                // Reset button state
                                $button.removeClass('loading').text('Print estimate');

                                if (response.success) {
                                    // Open PDF in new window
                                    if (response.data.pdf_url) {
                                        window.open(response.data.pdf_url, '_blank');
                                    }
                                } else {
                                    alert(response.data.message || 'Error generating PDF. Please try again.');
                                }
                            },
                            error: function() {
                                // Reset button state
                                $button.removeClass('loading').text('Print estimate');
                                alert('Connection error. Please try again.');
                            }
                        });
                    });

                    // Handle other estimate action buttons here
                    // ...
                });
            })(jQuery);
        </script>
        <?php
    }

    /**
     * Handle AJAX request to print an estimate
     */
    public function handle_print_estimate() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        if (!isset($_POST['estimate_id'])) {
            wp_send_json_error([
                'message' => __('Estimate ID is required', 'product-estimator')
            ]);
            return;
        }

        $session_estimate_id = sanitize_text_field($_POST['estimate_id']);

        try {
            // Generate PDF for the estimate
            $result = $this->generate_pdf($session_estimate_id);

            if (!$result) {
                wp_send_json_error([
                    'message' => __('Error generating PDF', 'product-estimator')
                ]);
                return;
            }

            // Return success response with PDF URL and other details
            wp_send_json_success([
                'message' => __('PDF generated successfully', 'product-estimator'),
                'pdf_url' => $result['pdf_url'],
                'db_id' => $result['db_id'],
                'session_id' => $session_estimate_id,
                'updated' => $result['updated']
            ]);

        } catch (\Exception $e) {
            $this->log_error('Error in handle_print_estimate', $e);
            wp_send_json_error([
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Generate a PDF for an estimate
     *
     * @param string $session_estimate_id The session estimate ID
     * @return array|false Result array with PDF details, or false on failure
     */
    public function generate_pdf($session_estimate_id) {
        try {
            // Get the estimate from session
            $estimate = $this->session->getEstimate($session_estimate_id);

            if (!$estimate) {
                throw new \Exception(__('Estimate not found in session', 'product-estimator'));
            }

            // Store or update the estimate in the database
            $db_id = $this->ensure_estimate_stored($estimate, $session_estimate_id);

            if (!$db_id) {
                throw new \Exception(__('Failed to store estimate in database', 'product-estimator'));
            }

            // Update session with the DB ID reference
            $estimate['db_id'] = $db_id;
            $_SESSION['product_estimator']['estimates'][$session_estimate_id]['db_id'] = $db_id;

            // Generate PDF
            $pdf_generator = $this->get_pdf_generator();
            $pdf_content = $pdf_generator->generate_pdf($estimate);

            if (!$pdf_content) {
                throw new \Exception(__('Error generating PDF content', 'product-estimator'));
            }

            // Create PDF file
            $pdf_file_data = $this->create_pdf_file($pdf_content, $db_id);

            if (!$pdf_file_data) {
                throw new \Exception(__('Error creating PDF file', 'product-estimator'));
            }

            // Return complete result
            return [
                'pdf_path' => $pdf_file_data['path'],
                'pdf_url' => $pdf_file_data['url'],
                'db_id' => $db_id,
                'updated' => isset($estimate['db_id']),
                'estimate_data' => $estimate
            ];

        } catch (\Exception $e) {
            $this->log_error('Error in generate_pdf', $e);
            return false;
        }
    }

    /**
     * Ensure estimate is stored in the database (create or update)
     *
     * @param array $estimate The estimate data
     * @param string $session_estimate_id The session estimate ID
     * @return int|false The database ID or false on failure
     */
    private function ensure_estimate_stored($estimate, $session_estimate_id) {
        // Check if already stored
        $db_id = $this->getEstimateDbId($estimate);

        if ($db_id) {
            // Update the existing record
            $this->update_estimate_in_db($db_id, $estimate);
            return $db_id;
        } else {
            // Store as new record
            $db_id = $this->store_estimate_in_db($estimate);

            if ($db_id) {
                // Store the db_id in the session estimate data
                $this->setEstimateDbId($session_estimate_id, $db_id);
                return $db_id;
            }
        }

        return false;
    }

    /**
     * Store a new estimate in the database
     *
     * @param array $estimate The estimate data
     * @return int|false The new database ID or false on failure
     */
    private function store_estimate_in_db($estimate) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'product_estimator_estimates';

        // Extract customer details
        $customer_name = isset($estimate['customer_details']['name']) ?
            sanitize_text_field($estimate['customer_details']['name']) : '';
        $customer_email = isset($estimate['customer_details']['email']) ?
            sanitize_email($estimate['customer_details']['email']) : '';
        $customer_phone = isset($estimate['customer_details']['phone']) ?
            sanitize_text_field($estimate['customer_details']['phone']) : '';
        $customer_postcode = isset($estimate['customer_details']['postcode']) ?
            sanitize_text_field($estimate['customer_details']['postcode']) : '';

        $default_markup = isset($estimate['default_markup']) ? floatval($estimate['default_markup']) : 0;

        // Insert into database
        $result = $wpdb->insert(
            $table_name,
            [
                'name' => $customer_name,
                'email' => $customer_email,
                'phone_number' => $customer_phone,
                'postcode' => $customer_postcode,
                'total_min' => isset($estimate['min_total']) ? floatval($estimate['min_total']) : 0,
                'total_max' => isset($estimate['max_total']) ? floatval($estimate['max_total']) : 0,
                'status' => 'saved',
                'notes' => '',
                'markup' => $default_markup,
                'estimate_data' => json_encode($estimate),
                'created_at' => current_time('mysql')
            ],
            [
                '%s', // name
                '%s', // email
                '%s', // phone_number
                '%s', // postcode
                '%f', // total_min
                '%f', // total_max
                '%s', // status
                '%s', // notes
                '%f', // markup
                '%s', // estimate_data
                '%s'  // created_at
            ]
        );

        if ($wpdb->last_error) {
            $this->log_error('Database error in store_estimate_in_db: ' . $wpdb->last_error);
            return false;
        }

        return $wpdb->insert_id;
    }

    /**
     * Update an existing estimate in the database
     *
     * @param int $db_id The database ID
     * @param array $estimate The estimate data
     * @return bool Success or failure
     */
    private function update_estimate_in_db($db_id, $estimate) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'product_estimator_estimates';

        $default_markup = isset($estimate['default_markup']) ? floatval($estimate['default_markup']) : 0;

        // Update the existing record with the latest data
        $result = $wpdb->update(
            $table_name,
            [
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
                'markup' => $default_markup,
                'estimate_data' => json_encode($estimate),
                'updated_at' => current_time('mysql')
            ],
            ['id' => $db_id],
            [
                '%s', // name
                '%s', // email
                '%s', // phone_number
                '%s', // postcode
                '%f', // total_min
                '%f', // total_max
                '%f', // markup
                '%s', // estimate_data
                '%s'  // updated_at
            ],
            ['%d'] // id
        );

        return $result !== false;
    }

    /**
     * Create a PDF file in the uploads directory
     *
     * @param string $pdf_content The PDF content
     * @param int $db_id The estimate database ID
     * @return array|false Array with file path and URL, or false on failure
     */
    private function create_pdf_file($pdf_content, $db_id) {
        // Create a temporary file
        $upload_dir = wp_upload_dir();
        $pdf_dir = $upload_dir['basedir'] . '/product-estimator-pdfs';

        // Ensure PDF directory exists
        $this->ensure_pdf_directory($pdf_dir);

        // Generate a unique filename
        $filename = 'estimate-' . $db_id . '-' . uniqid() . '.pdf';
        $pdf_path = $pdf_dir . '/' . $filename;

        // Write the PDF content to the file
        $result = file_put_contents($pdf_path, $pdf_content);

        if ($result === false) {
            return false;
        }

        // Get the URL for the PDF
        $pdf_url = $upload_dir['baseurl'] . '/product-estimator-pdfs/' . $filename;

        return [
            'path' => $pdf_path,
            'url' => $pdf_url
        ];
    }

    /**
     * Ensure the PDF directory exists and has proper security files
     *
     * @param string $pdf_dir Path to the PDF directory
     * @return bool Success or failure
     */
    private function ensure_pdf_directory($pdf_dir) {
        // Create directory if it doesn't exist
        if (!file_exists($pdf_dir)) {
            if (!wp_mkdir_p($pdf_dir)) {
                return false;
            }

            // Create an index.php file to prevent directory listing
            file_put_contents($pdf_dir . '/index.php', '<?php // Silence is golden');

            // Create an .htaccess file for additional security
            file_put_contents($pdf_dir . '/.htaccess', 'Options -Indexes');
        }

        return true;
    }

    /**
     * Get PDF generator instance
     * This helper method handles the case where the PDFGenerator class might not be available
     *
     * @return PDFGenerator|object PDF generator instance
     */
    private function get_pdf_generator() {
        // Check if PDFGenerator class exists
        if (!class_exists('\\RuDigital\\ProductEstimator\\Includes\\Utilities\\PDFGenerator')) {
            // Try to include it manually
            $pdf_generator_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/utilities/class-pdf-generator.php';
            if (file_exists($pdf_generator_path)) {
                require_once $pdf_generator_path;
                return new PDFGenerator();
            } else {
                // Create a simple fallback generator
                return $this->get_fallback_pdf_generator();
            }
        }

        // Return a new instance
        return new PDFGenerator();
    }

    /**
     * Handle request copy functionality
     * Sends an email with the PDF estimate attached
     */
    public function request_copy_estimate() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Get the estimate ID
        $estimate_id = array_key_exists('estimate_id', $_POST) ? sanitize_text_field($_POST['estimate_id']) : null;

        if (!isset($estimate_id) || $estimate_id === '') {
            wp_send_json_error([
                'message' => __('Estimate ID is required', 'product-estimator')
            ]);
            return;
        }

        try {
            // Get the estimate
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

            $pdf_result = null;

            // Only generate PDF if the setting is enabled
            if ($include_pdf) {
                // Generate PDF
                $pdf_result = $this->generate_pdf($estimate_id);

                if (!$pdf_result || !isset($pdf_result['pdf_path'])) {
                    wp_send_json_error([
                        'message' => __('Error generating PDF for email', 'product-estimator')
                    ]);
                    return;
                }
            }

            // Send email with or without PDF attachment
            $pdf_path = $include_pdf ? $pdf_result['pdf_path'] : '';
            $email_sent = $this->send_estimate_email($estimate, $customer_email, $pdf_path);

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

        } catch (\Exception $e) {
            $this->log_error('Error in request_copy_estimate', $e);
            wp_send_json_error([
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }
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
     * Get a fallback PDF generator if the main one is not available
     *
     * @return object Simple object with generate_pdf method
     */
    private function get_fallback_pdf_generator() {
        // Create a simple object with a generate_pdf method
        return new class {
            public function generate_pdf($estimate) {
                // Try to use TCPDF or DOMPDF if available
                if (class_exists('\\TCPDF')) {
                    return $this->generate_with_tcpdf($estimate);
                } elseif (class_exists('\\Dompdf\\Dompdf')) {
                    return $this->generate_with_dompdf($estimate);
                }

                // Last resort - generate a simple PDF
                return $this->generate_simple_pdf($estimate);
            }

            private function generate_with_tcpdf($estimate) {
                $pdf = new \TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
                $pdf->SetCreator('Product Estimator');
                $pdf->SetAuthor('Product Estimator');
                $pdf->SetTitle('Estimate #' . ($estimate['db_id'] ?? 'New'));
                $pdf->SetMargins(15, 15, 15);
                $pdf->AddPage();

                // Add content
                $html = $this->get_estimate_html($estimate);
                $pdf->writeHTML($html, true, false, true, false, '');

                return $pdf->Output('', 'S');
            }

            private function generate_with_dompdf($estimate) {
                $dompdf = new \Dompdf\Dompdf();
                $html = $this->get_estimate_html($estimate);
                $dompdf->loadHtml($html);
                $dompdf->setPaper('A4', 'portrait');
                $dompdf->render();

                return $dompdf->output();
            }

            private function generate_simple_pdf($estimate) {
                // Very basic PDF using PHP's built-in PDF functionality
                $html = $this->get_estimate_html($estimate);

                // Return empty string as fallback
                return '';
            }

            private function get_estimate_html($estimate) {
                ob_start();
                ?>
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Estimate</title>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .customer-details { margin-bottom: 20px; }
                        .room { margin-bottom: 20px; }
                        .product { margin-bottom: 10px; }
                        .totals { margin-top: 20px; font-weight: bold; }
                    </style>
                </head>
                <body>
                <div class="header">
                    <h1>Estimate: <?php echo esc_html($estimate['name'] ?? 'Product Estimate'); ?></h1>
                </div>

                <div class="customer-details">
                    <h2>Customer Details</h2>
                    <p>
                        <?php echo esc_html($estimate['customer_details']['name'] ?? ''); ?><br>
                        <?php echo esc_html($estimate['customer_details']['email'] ?? ''); ?><br>
                        <?php echo esc_html($estimate['customer_details']['phone'] ?? ''); ?><br>
                        <?php echo esc_html($estimate['customer_details']['postcode'] ?? ''); ?>
                    </p>
                </div>

                <?php if (isset($estimate['rooms']) && is_array($estimate['rooms'])): ?>
                    <?php foreach ($estimate['rooms'] as $room): ?>
                        <div class="room">
                            <h2><?php echo esc_html($room['name'] ?? 'Room'); ?></h2>
                            <p>Dimensions: <?php echo esc_html($room['width'] ?? '0'); ?>m × <?php echo esc_html($room['length'] ?? '0'); ?>m</p>

                            <?php if (isset($room['products']) && is_array($room['products'])): ?>
                                <div class="products">
                                    <h3>Products</h3>
                                    <?php foreach ($room['products'] as $product): ?>
                                        <div class="product">
                                            <p>
                                                <strong><?php echo esc_html($product['name'] ?? 'Product'); ?></strong><br>
                                                <?php if (isset($product['min_price_total']) && isset($product['max_price_total'])): ?>
                                                    Price: <?php echo wc_price($product['min_price_total']); ?> - <?php echo wc_price($product['max_price_total']); ?>
                                                <?php endif; ?>
                                            </p>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>

                            <?php if (isset($room['min_total']) && isset($room['max_total'])): ?>
                                <div class="room-total">
                                    <p><strong>Room Total:</strong> <?php echo wc_price($room['min_total']); ?> - <?php echo wc_price($room['max_total']); ?></p>
                                </div>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>

                <?php if (isset($estimate['min_total']) && isset($estimate['max_total'])): ?>
                    <div class="totals">
                        <h2>Estimate Total</h2>
                        <p><?php echo wc_price($estimate['min_total']); ?> - <?php echo wc_price($estimate['max_total']); ?></p>
                    </div>
                <?php endif; ?>
                </body>
                </html>
                <?php
                return ob_get_clean();
            }
        };
    }

    /**
     * Schedule cleanup of old PDF files
     *
     * @return void
     */
    public function schedule_pdf_cleanup() {
        if (!wp_next_scheduled('product_estimator_cleanup_pdfs')) {
            wp_schedule_event(time(), 'daily', 'product_estimator_cleanup_pdfs');
        }

        add_action('product_estimator_cleanup_pdfs', array($this, 'cleanup_pdf_files'));
    }

    /**
     * Clean up old PDF files to save disk space
     *
     * @return void
     */
    public function cleanup_pdf_files() {
        $upload_dir = wp_upload_dir();
        $pdf_dir = $upload_dir['basedir'] . '/product-estimator-pdfs';

        if (!is_dir($pdf_dir)) {
            return;
        }

        $files = glob($pdf_dir . '/*.pdf');
        $now = time();

        foreach ($files as $file) {
            // If file is older than 24 hours, delete it
            if ($now - filemtime($file) > 24 * 60 * 60) {
                @unlink($file);
            }
        }
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
