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

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * PDF Route Handler Class
 *
 * Handles custom route for PDF generation and display
 */
class PDFRouteHandler {
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
     * Initialize the class and set up hooks
     */
    public function __construct() {
        // Initialize session handler
        $this->session = SessionHandler::getInstance();

        // Initialize estimate model if the class exists
        if (class_exists('\\RuDigital\\ProductEstimator\\Includes\\Models\\EstimateModel')) {
            $this->estimate_model = new EstimateModel();
        }

        // Register the custom rewrite rules
        add_action('init', array($this, 'register_rewrite_rules'));

        // Register the custom query vars
        add_filter('query_vars', array($this, 'register_query_vars'));

        // Handle the custom endpoint
        add_action('template_redirect', array($this, 'handle_pdf_endpoint'));

        // Add a link in the admin bar for testing (debug mode only)
        if (defined('WP_DEBUG') && WP_DEBUG) {
            add_action('admin_bar_menu', array($this, 'add_admin_bar_pdf_link'), 999);
        }
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
     * Handle the custom PDF endpoint
     */
    public function handle_pdf_endpoint() {
        global $wp_query;

        // Check if this is our custom endpoint
        if (!isset($wp_query->query_vars['product_estimator_pdf']) ||
            $wp_query->query_vars['product_estimator_pdf'] != 1) {
            return;
        }

        // Admin direct access route
        if (isset($wp_query->query_vars['admin_view']) && isset($wp_query->query_vars['estimate_id'])) {
            // Verify current user is an admin
            if (!current_user_can('manage_options')) {
                $this->output_error('Unauthorized access');
                return;
            }

            $db_id = intval($wp_query->query_vars['estimate_id']);
            $this->generate_and_output_pdf($db_id);
            exit;
        }

        // Token-based access route
        if (isset($wp_query->query_vars['pdf_token'])) {
            $token = sanitize_text_field($wp_query->query_vars['pdf_token']);
            $estimate_id = $this->validate_pdf_token($token);

            if ($estimate_id) {
                $this->generate_and_output_pdf($estimate_id);
                exit;
            } else {
                $this->output_error('Invalid or expired link');
                return;
            }
        }

        // No valid access method provided
        $this->output_error('Invalid request');
        exit;
    }


    /**
     * Generate and output the PDF directly to the browser
     *
     * @param int $db_id The database ID of the estimate
     */
    private function generate_and_output_pdf($db_id) {
        try {
            // Validate the estimate ID
            if ($db_id <= 0) {
                $this->output_error('Invalid estimate ID');
                return;
            }

            // Find if this estimate exists in the session
            $session_id = $this->findSessionEstimateIdByDbId($db_id);

            // If it exists in session, use the storeOrUpdateEstimate method from the trait
            // to update the database with the latest session data
            if ($session_id !== null) {
                $session_estimate = $this->session->getEstimate($session_id);
                if ($session_estimate) {
                    // Use the trait method to update the database
                    // We need to extract customer details from the session estimate
                    $customer_details = isset($session_estimate['customer_details']) ?
                        $session_estimate['customer_details'] : [];

                    // Use notes from the session if available
                    $notes = isset($session_estimate['notes']) ? $session_estimate['notes'] : '';

                    // Use the trait method to update the estimate
                    $this->storeOrUpdateEstimate($session_id, $customer_details, $notes);
                }
            }

            // Now load the estimate from the database (which should now have the latest data)
            $estimate_data = $this->get_estimate_from_db($db_id);

            if (empty($estimate_data)) {
                $this->output_error('Estimate not found');
                return;
            }

            // Check if PDF generator class exists
            if (!class_exists('\\RuDigital\\ProductEstimator\\Includes\\Utilities\\PDFGenerator')) {
                require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/utilities/class-pdf-generator.php';
            }

            // Initialize the PDF generator
            $pdf_generator = new \RuDigital\ProductEstimator\Includes\Utilities\PDFGenerator();

            // Generate the PDF
            $pdf_content = $pdf_generator->generate_pdf($estimate_data);

            if (empty($pdf_content)) {
                $this->output_error('Failed to generate PDF');
                return;
            }

            // Output the PDF directly to the browser
            header('Content-Type: application/pdf');
            header('Content-Disposition: inline; filename="estimate-' . $db_id . '.pdf"');
            header('Cache-Control: private, max-age=0, must-revalidate');
            header('Pragma: public');
            echo $pdf_content;
            exit;

        } catch (\Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('PDF Route Error: ' . $e->getMessage());
                error_log('Error Stack Trace: ' . $e->getTraceAsString());
            }
            $this->output_error('An error occurred: ' . $e->getMessage());
        }
    }

    /**
     * Get estimate data from the database
     *
     * @param int $db_id The database ID
     * @return array|false The estimate data or false if not found
     */
    private function get_estimate_from_db($db_id) {
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
        if (method_exists($this, 'getEstimateFromDb')) {
            return $this->getEstimateFromDb($db_id);
        }

        // Last resort - query the database directly
        return $this->fallback_get_estimate($db_id);
    }

    /**
     * Fallback method to get estimate directly from database
     *
     * @param int $db_id The database ID
     * @return array|false The estimate data or false on failure
     */
    private function fallback_get_estimate($db_id) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'product_estimator_estimates';

        $estimate_row = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE id = %d",
            $db_id
        ), ARRAY_A);

        if (!$estimate_row || !isset($estimate_row['estimate_data'])) {
            return false;
        }

        // Decode JSON data
        $estimate_data = json_decode($estimate_row['estimate_data'], true);

        if (is_array($estimate_data)) {
            // Add db_id to the data for proper referencing
            $estimate_data['db_id'] = $db_id;
            return $estimate_data;
        }

        return false;
    }

    /**
     * Output error message
     *
     * @param string $message Error message
     */
    private function output_error($message) {
        status_header(404);

        // Get WordPress theme-styled error page
        get_header();
        ?>
        <div id="primary" class="content-area">
            <main id="main" class="site-main" role="main">
                <section class="error-404 not-found">
                    <header class="page-header">
                        <h1 class="page-title"><?php echo esc_html__('PDF Generation Error', 'product-estimator'); ?></h1>
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
        exit;
    }

    /**
     * Add test link in admin bar for debug purposes
     * Only shows in debug mode and if user is an admin
     *
     * @param WP_Admin_Bar $admin_bar Admin bar object
     */
    public function add_admin_bar_pdf_link($admin_bar) {
        // Only show for admins
        if (!current_user_can('manage_options')) {
            return;
        }

        // Get a random estimate ID from the database
        global $wpdb;
        $table_name = $wpdb->prefix . 'product_estimator_estimates';
        $random_id = $wpdb->get_var("SELECT id FROM {$table_name} ORDER BY id DESC LIMIT 1");

        if (!$random_id) {
            return; // No estimates in the database
        }

        $admin_bar->add_menu(array(
            'id'    => 'product-estimator-pdf-test',
            'title' => 'Test PDF (ID: ' . $random_id . ')',
            'href'  => home_url('/product-estimator/pdf/' . $random_id),
            'meta'  => array(
                'title' => 'Open PDF in new tab',
                'target' => '_blank'
            )
        ));
    }


    /**
     * Generate a secure token for PDF access
     *
     * @param int $estimate_id The database ID of the estimate
     * @param int $expiry Token expiry time in seconds (default 24 hours)
     * @return string|false The generated token or false on failure
     */
    public function generate_secure_pdf_token($estimate_id, $expiry = 9999999) {
        // Create a token with: estimate_id + customer_email + timestamp + secret_key
        $estimate = $this->get_estimate_from_db($estimate_id);

        if (!$estimate || empty($estimate['customer_details']['email'])) {
            return false;
        }

        $customer_email = $estimate['customer_details']['email'];
        $timestamp = time() + $expiry; // Token valid for 24 hours by default
        $data = $estimate_id . '|' . $customer_email . '|' . $timestamp;
        $signature = hash_hmac('sha256', $data, wp_salt('auth'));

        return urlencode(base64_encode($data . '|' . $signature));
    }

    /**
     * Validate a PDF token
     *
     * @param string $token The token to validate
     * @return int|false The estimate ID if valid, false otherwise
     */
    private function validate_pdf_token($token) {
        try {
            $decoded = base64_decode(urldecode($token));
            if (!$decoded) return false;

            $parts = explode('|', $decoded);
            if (count($parts) !== 4) return false;

            list($estimate_id, $email, $expiry, $signature) = $parts;

            // Check if token has expired
            if (time() > intval($expiry)) return false;

            // Verify signature
            $data = $estimate_id . '|' . $email . '|' . $expiry;
            $expected_signature = hash_hmac('sha256', $data, wp_salt('auth'));

            if (!hash_equals($expected_signature, $signature)) return false;
            // Verify estimate exists and belongs to this email
            $estimate = $this->get_estimate_from_db($estimate_id);
            if (!$estimate ||
                !isset($estimate['customer_details']['email']) ||
                $estimate['customer_details']['email'] !== $email) {
                return false;
            }

            return $estimate_id;
        } catch (\Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Token validation error: ' . $e->getMessage());
            }
            return false;
        }
    }

    /**
     * Flush rewrite rules - add this to plugin activation hook
     */
    public static function flush_pdf_routes() {
        $handler = new self();
        $handler->register_rewrite_rules();
        flush_rewrite_rules(true);
    }
}
