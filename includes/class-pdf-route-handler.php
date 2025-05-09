<?php
/**
 * Custom Route Handler for PDF generation
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */

namespace RuDigital\ProductEstimator\Includes;

use RuDigital\ProductEstimator\Includes\Models\EstimateModel;
use RuDigital\ProductEstimator\Includes\Traits\EstimateDbHandler;
use RuDigital\ProductEstimator\Includes\Utilities\PDFGenerator; // Ensure PDFGenerator is imported

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * PDF Route Handler Class
 *
 * Handles custom route for PDF generation and display.
 * MODIFIED: Implements lazy session loading via SessionHandler.
 */
class PDFRouteHandler {
    // Use the updated trait which internally uses SessionHandler
    use EstimateDbHandler;

    // REMOVE: The session property is no longer needed here
    // /**
    //  * @var SessionHandler Session handler instance
    //  */
    // private $session;

    /**
     * @var EstimateModel|null Estimate model instance
     */
    private $estimate_model = null;

    /**
     * @var EstimateHandler|null Estimate handler instance
     */
    private $estimate_handler = null; // Keep if needed for get_estimate_from_db fallback

    /**
     * Initialize the class and set up hooks
     */
    public function __construct() {
        // REMOVE: Session handler is no longer initialized in the constructor
        // $this->session = SessionHandler::getInstance();

        // Initialize EstimateHandler (if still needed for get_estimate_from_db)
        // Consider if EstimateHandler also needs lazy session loading if it uses sessions.
        if (class_exists(EstimateHandler::class)) {
            $this->estimate_handler = new EstimateHandler();
        }

        // Initialize estimate model if the class exists
        if (class_exists(EstimateModel::class)) {
            $this->estimate_model = new EstimateModel();
        }

        // Register the custom rewrite rules
        add_action('init', array($this, 'register_rewrite_rules'));

        // Register the custom query vars
        add_filter('query_vars', array($this, 'register_query_vars'));

        // Handle the custom endpoint
        add_action('template_redirect', array($this, 'handle_pdf_endpoint'));
    }


    /**
     * Register custom rewrite rule for PDF endpoint
     */
    public function register_rewrite_rules() {
        // Token-based access
        add_rewrite_rule(
            'product-estimator/pdf/view/([^/]+)/?$',
            'index.php?product_estimator_pdf=1&pdf_token=$matches[1]',
            'top'
        );

        // Admin-only direct ID access
        add_rewrite_rule(
            'product-estimator/pdf/admin/([0-9]+)/?$',
            'index.php?product_estimator_pdf=1&estimate_id=$matches[1]&admin_view=1',
            'top'
        );
    }

    /**
     * Register query vars for the custom endpoint
     *
     * @param array $vars The array of query vars
     * @return array Modified query vars
     */
    public function register_query_vars($vars) {
        $vars[] = 'product_estimator_pdf';
        $vars[] = 'estimate_id';
        $vars[] = 'pdf_token';
        $vars[] = 'admin_view';
        return $vars;
    }

    /**
     * Handle the custom PDF endpoint based on query vars
     */
    public function handle_pdf_endpoint() {
        global $wp_query;

        // Check if this is our custom endpoint trigger
        if (!isset($wp_query->query_vars['product_estimator_pdf']) ||
            $wp_query->query_vars['product_estimator_pdf'] != 1) {
            return; // Not our endpoint, let WordPress continue
        }

        // --- Admin direct access route ---
        if (isset($wp_query->query_vars['admin_view']) && $wp_query->query_vars['admin_view'] == 1 && isset($wp_query->query_vars['estimate_id'])) {
            // Verify current user has sufficient permissions (e.g., manage_options or a custom capability)
            if (!current_user_can('manage_options')) {
                $this->output_error(__('Unauthorized access. Administrator privileges required.', 'product-estimator'));
                // exit is handled by output_error
            }

            $db_id = intval($wp_query->query_vars['estimate_id']);
            if ($db_id <= 0) {
                $this->output_error(__('Invalid Estimate ID provided for admin view.', 'product-estimator'));
                // exit is handled by output_error
            }
            // Proceed to generate PDF using the database ID
            $this->generate_and_output_pdf($db_id);
            exit; // Ensure script stops after PDF output
        }

        // --- Token-based access route ---
        if (isset($wp_query->query_vars['pdf_token'])) {
            $token = sanitize_text_field($wp_query->query_vars['pdf_token']);
            $db_id = $this->validate_pdf_token($token); // Validate token returns DB ID or false

            if ($db_id && $db_id > 0) {
                // Valid token, proceed to generate PDF using the database ID
                $this->generate_and_output_pdf($db_id);
                exit; // Ensure script stops after PDF output
            } else {
                // Invalid or expired token
                $this->output_error(__('Invalid or expired PDF link.', 'product-estimator'));
                // exit is handled by output_error
            }
        }

        // If neither admin nor token access method matches, it's an invalid request
        $this->output_error(__('Invalid PDF request.', 'product-estimator'));
        // exit is handled by output_error
    }


    /**
     * Generate and output the PDF directly to the browser.
     * Handles potential updates from session to DB before generating PDF from DB data.
     *
     * @param int $db_id The database ID of the estimate.
     * @return void Outputs PDF or error page.
     */
    private function generate_and_output_pdf(int $db_id): void {
        // Validate the estimate ID early
        if ($db_id <= 0) {
            $this->output_error(__('Invalid estimate ID provided.', 'product-estimator'));
            return; // Exit handled by output_error
        }

        try {
            // Get SessionHandler instance ONLY when needed for potential update
            $session = SessionHandler::getInstance();

            // Find if this estimate exists in the current session using its DB ID
            // The trait method findSessionEstimateIdByDbId now uses SessionHandler internally.
            $session_id = $this->findSessionEstimateIdByDbId($db_id);

            // If found in session, update the database record with the latest session data
            // before generating the PDF from the potentially updated DB record.
            if ($session_id !== null) {
                // Get the estimate data from session using the SessionHandler
                $session_estimate = $session->getEstimate($session_id); // Uses SessionHandler

                if ($session_estimate) {
                    // Extract customer details and notes from the session data
                    $customer_details = $session_estimate['customer_details'] ?? [];
                    $notes = $session_estimate['notes'] ?? '';

                    // Use the trait method to update the database record.
                    // This method now handles getting the session data internally via SessionHandler.
                    $updated_db_id = $this->storeOrUpdateEstimate($session_id, $customer_details, $notes);

                    if ($updated_db_id === false) {
                        // Log the error but proceed to try and generate PDF from existing DB data
                        error_log("Product Estimator (PDFRouteHandler): Failed to update DB estimate ID {$db_id} from session ID {$session_id} before PDF generation.");
                    } elseif (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log("Product Estimator (PDFRouteHandler): Updated DB estimate ID {$db_id} from session ID {$session_id} before PDF generation.");
                    }
                } else {
                    error_log("Product Estimator (PDFRouteHandler): Found session ID {$session_id} for DB ID {$db_id}, but failed to retrieve estimate data from session.");
                }
            }

            // --- Always load the estimate data from the DATABASE for PDF generation ---
            // This ensures consistency, especially after a potential update from session.
            // Use the trait's getEstimateFromDb method.
            $estimate_data_for_pdf = $this->getEstimateFromDb($db_id);

            // Check if data was successfully retrieved from the database
            if (empty($estimate_data_for_pdf)) {
                $this->output_error(__('Estimate data could not be retrieved from the database.', 'product-estimator'));
                return; // Exit handled by output_error
            }

            // Check if PDF generator class exists and include if necessary
            if (!class_exists(PDFGenerator::class)) {
                $pdf_generator_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/utilities/class-pdf-generator.php';
                if (file_exists($pdf_generator_path)) {
                    require_once $pdf_generator_path;
                } else {
                    $this->output_error(__('PDF Generation library is missing.', 'product-estimator'));
                    return; // Exit handled by output_error
                }
            }

            // Initialize the PDF generator
            $pdf_generator = new PDFGenerator();

            // Generate the PDF content using data fetched from the database
            $pdf_content = $pdf_generator->generate_pdf($estimate_data_for_pdf);

            // Check if PDF generation was successful
            if (empty($pdf_content)) {
                $this->output_error(__('Failed to generate PDF content.', 'product-estimator'));
                return; // Exit handled by output_error
            }

            // --- Output the PDF directly to the browser ---
            // Clear any potential previous output buffering
            if (ob_get_level()) {
                ob_end_clean();
            }

            // Set appropriate headers for PDF display
            header('Content-Type: application/pdf');
            header('Content-Disposition: inline; filename="estimate-' . $db_id . '.pdf"'); // Suggest filename
            header('Content-Length: ' . strlen($pdf_content)); // Set content length
            header('Cache-Control: private, max-age=0, must-revalidate'); // Prevent caching issues
            header('Pragma: public'); // For older browsers/proxies

            // Output the PDF content
            echo $pdf_content;
            exit; // Terminate script execution after sending PDF

        } catch (\Exception $e) {
            // Log the exception details if debug mode is on
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Product Estimator PDF Route Error: ' . $e->getMessage());
                error_log('Error Stack Trace: ' . $e->getTraceAsString());
            }
            // Display a user-friendly error page
            $this->output_error(__('An unexpected error occurred while generating the PDF.', 'product-estimator') . ' ' . $e->getMessage());
            // Exit handled by output_error
        }
    }

    /**
     * Output a themed error message page and exit.
     *
     * @param string $message Error message to display.
     * @return void
     */
    private function output_error(string $message): void {
        // Prevent caching of the error page
        nocache_headers();
        // Set appropriate status header (e.g., 404 Not Found or 500 Internal Server Error)
        status_header(404); // Use 404 for invalid links/IDs, 500 for server errors

        // Try to load theme header/footer for consistent styling
        if (function_exists('get_header') && function_exists('get_footer')) {
            get_header();
            ?>
            <div id="primary" class="content-area" style="padding: 2em;">
                <main id="main" class="site-main" role="main">
                    <section class="error-display not-found">
                        <header class="page-header">
                            <h1 class="page-title"><?php echo esc_html__('PDF Access Error', 'product-estimator'); ?></h1>
                        </header>
                        <div class="page-content">
                            <p><?php echo esc_html($message); ?></p>
                            <p><a href="<?php echo esc_url(home_url('/')); ?>"><?php esc_html_e('Return to home page', 'product-estimator'); ?></a></p>
                        </div>
                    </section>
                </main>
            </div>
            <?php
            get_footer();
        } else {
            // Fallback if theme functions aren't available (less likely in template_redirect)
            wp_die(esc_html($message), esc_html__('PDF Error', 'product-estimator'), ['response' => 404]);
        }
        exit; // Ensure script stops
    }

    /**
     * Generate a secure token for PDF access.
     * This method now uses the EstimateDbHandler trait's getEstimateFromDb.
     *
     * @param int $estimate_id The database ID of the estimate.
     * @param int $expiry Token expiry time in seconds from now (default 24 hours).
     * @return string|false The generated URL-safe token or false on failure.
     */
    public function generate_secure_pdf_token(int $estimate_id, int $expiry_seconds = DAY_IN_SECONDS): ?string {
        if ($estimate_id <= 0) {
            return null;
        }

        // Use the trait method to get estimate data directly from DB
        $estimate = $this->getEstimateFromDb($estimate_id);

        // Check if estimate exists and has a customer email
        if (!$estimate || !isset($estimate['customer_details']['email']) || empty($estimate['customer_details']['email'])) {
            error_log("Product Estimator (PDFRouteHandler): Cannot generate token for DB ID {$estimate_id}. Estimate not found or missing customer email.");
            return null;
        }
        $customer_email = $estimate['customer_details']['email'];

        // Calculate expiry timestamp
        $expiry_timestamp = time() + $expiry_seconds;

        // Data to sign: estimate_id | email | expiry_timestamp
        $data_to_sign = $estimate_id . '|' . $customer_email . '|' . $expiry_timestamp;

        // Generate the signature using a WordPress salt for security
        $signature = hash_hmac('sha256', $data_to_sign, wp_salt('product_estimator_pdf_token')); // Use a specific salt

        // Combine data and signature, encode for URL safety
        $token_raw = $data_to_sign . '|' . $signature;
        $token_encoded = urlencode(base64_encode($token_raw)); // Base64 then URL encode

        return $token_encoded;
    }

    /**
     * Validate a PDF token and return the estimate DB ID if valid.
     *
     * @param string $token The URL-safe token received from the request.
     * @return int|false The estimate database ID if the token is valid and not expired, otherwise false.
     */
    private function validate_pdf_token(string $token): ?int {
        if (empty($token)) {
            return null;
        }

        try {
            // Decode the token (URL decode then Base64 decode)
            $decoded_token = base64_decode(urldecode($token));
            if ($decoded_token === false) {
                error_log("Product Estimator (PDFRouteHandler): Failed to base64 decode token.");
                return null;
            }

            // Split the decoded token into its parts
            $parts = explode('|', $decoded_token);
            if (count($parts) !== 4) {
                error_log("Product Estimator (PDFRouteHandler): Invalid token structure (expected 4 parts).");
                return null;
            }

            // Assign parts to variables
            list($estimate_id_str, $email, $expiry_timestamp_str, $received_signature) = $parts;

            // Validate types and values
            $estimate_id = intval($estimate_id_str);
            $expiry_timestamp = intval($expiry_timestamp_str);

            if ($estimate_id <= 0 || empty($email) || $expiry_timestamp <= 0 || empty($received_signature)) {
                error_log("Product Estimator (PDFRouteHandler): Invalid data types or empty values in token parts.");
                return null;
            }

            // Check if the token has expired
            if (time() > $expiry_timestamp) {
                error_log("Product Estimator (PDFRouteHandler): Token expired for estimate ID {$estimate_id}. Expiry: {$expiry_timestamp}, Current: " . time());
                return null; // Token expired
            }

            // Recreate the data string that was originally signed
            $data_signed = $estimate_id_str . '|' . $email . '|' . $expiry_timestamp_str;

            // Calculate the expected signature using the same method and salt
            $expected_signature = hash_hmac('sha256', $data_signed, wp_salt('product_estimator_pdf_token'));

            // Compare the expected signature with the received signature securely
            if (!hash_equals($expected_signature, $received_signature)) {
                error_log("Product Estimator (PDFRouteHandler): Token signature mismatch for estimate ID {$estimate_id}.");
                return null; // Signature mismatch
            }

            // --- Final Verification: Check estimate exists and email matches ---
            // Use trait method to get estimate data from DB
            $estimate = $this->getEstimateFromDb($estimate_id);
            if (!$estimate || !isset($estimate['customer_details']['email']) || $estimate['customer_details']['email'] !== $email) {
                error_log("Product Estimator (PDFRouteHandler): Estimate ID {$estimate_id} not found in DB or email mismatch during token validation. Token Email: {$email}, DB Email: " . ($estimate['customer_details']['email'] ?? 'Not Set'));
                return null; // Estimate doesn't exist or email doesn't match the one in the token
            }

            // If all checks pass, the token is valid, return the estimate DB ID
            return $estimate_id;

        } catch (\Exception $e) {
            // Log any unexpected errors during validation
            error_log('Product Estimator (PDFRouteHandler) Exception during token validation: ' . $e->getMessage());
            return null; // Return null on any exception
        }
    }

    /**
     * Flush rewrite rules - intended for plugin activation hook.
     * Static method for easier calling from activation hook.
     *
     * @return void
     */
    public static function flush_pdf_routes(): void {
        // Temporarily instantiate to call non-static method (or make register_rewrite_rules static)
        $handler = new self();
        $handler->register_rewrite_rules();
        // Flush the rewrite rules to apply the new rules immediately
        flush_rewrite_rules(true); // True ensures hard flush (updates .htaccess)
    }
} // End class PDFRouteHandler
