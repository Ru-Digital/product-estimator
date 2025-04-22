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

        // Register event handlers for estimate buttons
        add_action('wp_footer', array($this, 'register_estimate_buttons_handlers'));
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
            // Get the estimate from session
            $estimate = $this->session->getEstimate($session_estimate_id);

            if (!$estimate) {
                wp_send_json_error([
                    'message' => __('Estimate not found in session', 'product-estimator')
                ]);
                return;
            }

            $db_id = $this->getEstimateDbId($estimate);


            // Check if this estimate is already saved in the database
            if (!$db_id) {
                // Verify it still exists in the database
                // Need to store it first
                global $wpdb;
                $table_name = $wpdb->prefix . 'product_estimator_estimates';

                // Store customer details
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
                        'estimate_data' => json_encode($estimate)
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
                        '%s'  // estimate_data
                    ]
                );

                if ($wpdb->last_error) {
                    throw new \Exception($wpdb->last_error);
                }

                $db_id = $wpdb->insert_id;

                // Store the db_id in the session estimate data
                $this->setEstimateDbId($session_estimate_id, $db_id);
                } else {
                    // Update the existing record
                    global $wpdb;
                    $table_name = $wpdb->prefix . 'product_estimator_estimates';

                    $default_markup = isset($estimate['default_markup']) ? floatval($estimate['default_markup']) : 0;

                    // Update the existing record with the latest data
                    $wpdb->update(
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
                }


            // Update session with the DB ID reference
            $estimate['db_id'] = $db_id;
            $_SESSION['product_estimator']['estimates'][$session_estimate_id]['db_id'] = $db_id;

            // Generate PDF using the stored estimate
            $pdf_generator = $this->get_pdf_generator();
            $pdf_content = $pdf_generator->generate_pdf($estimate);

            if (!$pdf_content) {
                wp_send_json_error([
                    'message' => __('Error generating PDF', 'product-estimator')
                ]);
                return;
            }

            // Create a temporary file
            $upload_dir = wp_upload_dir();
            $pdf_dir = $upload_dir['basedir'] . '/product-estimator-pdfs';

            // Create directory if it doesn't exist
            if (!file_exists($pdf_dir)) {
                wp_mkdir_p($pdf_dir);

                // Create an index.php file to prevent directory listing
                file_put_contents($pdf_dir . '/index.php', '<?php // Silence is golden');

                // Create an .htaccess file for additional security
                file_put_contents($pdf_dir . '/.htaccess', 'Options -Indexes');
            }

            // Generate a unique filename
            $filename = 'estimate-' . $db_id . '-' . uniqid() . '.pdf';
            $pdf_path = $pdf_dir . '/' . $filename;

            // Write the PDF content to the file
            file_put_contents($pdf_path, $pdf_content);

            // Get the URL for the PDF
            $pdf_url = $upload_dir['baseurl'] . '/product-estimator-pdfs/' . $filename;

            // Return success with the PDF URL
            wp_send_json_success([
                'message' => __('PDF generated successfully', 'product-estimator'),
                'pdf_url' => $pdf_url,
                'db_id' => $db_id,
                'session_id' => $session_estimate_id,
                'updated' => isset($estimate['db_id']) // Indicate if this was an update
            ]);

        } catch (\Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Error in handle_print_estimate: ' . $e->getMessage());
                error_log('Stack trace: ' . $e->getTraceAsString());
            }

            wp_send_json_error([
                'message' => __('An error occurred while processing your request', 'product-estimator'),
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get PDF generator instance
     * This helper method handles the case where the PDFGenerator class might not be available
     *
     * @return PDFGenerator|null
     */
    private function get_pdf_generator() {
        // Check if PDFGenerator class exists
        if (!class_exists('\\RuDigital\\ProductEstimator\\Includes\\Utilities\\PDFGenerator')) {
            // Try to include it manually
            $pdf_generator_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/utilities/class-pdf-generator.php';
            if (file_exists($pdf_generator_path)) {
                require_once $pdf_generator_path;
            } else {
                // Create a simple fallback generator
                return $this->get_fallback_pdf_generator();
            }
        }

        // Return a new instance
        return new PDFGenerator();
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
}
