<?php
namespace RuDigital\ProductEstimator\Includes\Ajax;

use RuDigital\ProductEstimator\Includes\CustomerDetails;
use RuDigital\ProductEstimator\Includes\Traits\EstimateDbHandler;
use RuDigital\ProductEstimator\Includes\Frontend\LabelsFrontend;

/**
 * Storage-related AJAX handlers
 *
 * Handles all database storage operations including estimates and customer contacts
 */
class StorageAjaxHandler extends AjaxHandlerBase {
    /**
     * @var LabelsFrontend
     */
    private $labels;

    /**
     * Constructor
     */
    public function __construct() {
        parent::__construct();
        global $product_estimator_plugin_info;
        
        // Get plugin name and version from global if available, or use defaults
        $plugin_name = isset($product_estimator_plugin_info['name']) ? $product_estimator_plugin_info['name'] : 'product-estimator';
        $version = isset($product_estimator_plugin_info['version']) ? $product_estimator_plugin_info['version'] : '2.0.0';
        
        $this->labels = new LabelsFrontend($plugin_name, $version);
    }
    use EstimateDbHandler;

    /**
     * Register WordPress hooks for AJAX endpoints
     *
     * @return void
     */
    protected function register_hooks() {
        // Estimate storage endpoints
        $this->register_ajax_endpoint('store_single_estimate', 'store_single_estimate');
        $this->register_ajax_endpoint('check_estimate_stored', 'check_estimate_stored');
        $this->register_ajax_endpoint('get_secure_pdf_url', 'get_secure_pdf_url');
        $this->register_ajax_endpoint('request_copy_estimate', 'request_copy_estimate');

        // Customer contact endpoint
        $this->register_ajax_endpoint('request_store_contact', 'request_store_contact');
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
                'message' => $this->labels->get('messages.estimate_saved', 'Estimate saved successfully'),
                'estimate_id' => $db_id,
                'session_id' => $estimate_id,
                'is_update' => $this->getEstimateDbId($estimate_id) == $db_id
            ]);
        } catch (\Exception $e) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Error in store_single_estimate: ' . $e->getMessage());
                error_log('Trace: ' . $e->getTraceAsString());
            }

            wp_send_json_error([
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Check if an estimate is stored in the database
     */
    public function check_estimate_stored() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        $estimate_id = isset($_POST['estimate_id']) ? sanitize_text_field($_POST['estimate_id']) : '';

        if (!$estimate_id) {
            wp_send_json_error([
                'message' => __('Estimate ID is required', 'product-estimator'),
                'is_stored' => false
            ]);
            return;
        }

        // Check if estimate is stored
        $is_stored = $this->isEstimateStored($estimate_id);

        wp_send_json_success([
            'is_stored' => $is_stored
        ]);
    }

    /**
     * Get secure PDF URL for estimate
     */
    public function get_secure_pdf_url() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        $estimate_id = isset($_POST['estimate_id']) ? sanitize_text_field($_POST['estimate_id']) : '';

        if (!$estimate_id) {
            wp_send_json_error([
                'message' => __('Estimate ID is required', 'product-estimator')
            ]);
            return;
        }

        // Generate secure PDF URL
        $pdf_url = $this->generateSecurePdfUrl($estimate_id);

        if (!$pdf_url) {
            wp_send_json_error([
                'message' => __('Unable to generate PDF URL', 'product-estimator')
            ]);
            return;
        }

        wp_send_json_success([
            'pdf_url' => $pdf_url
        ]);
    }

    /**
     * Request a copy of the estimate
     */
    public function request_copy_estimate() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        $estimate_id = isset($_POST['estimate_id']) ? sanitize_text_field($_POST['estimate_id']) : '';
        $email = isset($_POST['email']) ? sanitize_email($_POST['email']) : '';

        if (!$estimate_id || !$email) {
            wp_send_json_error([
                'message' => __('Estimate ID and email are required', 'product-estimator')
            ]);
            return;
        }

        // Implementation for sending estimate copy via email
        // This would typically involve:
        // 1. Generating the estimate PDF
        // 2. Sending an email with the PDF attachment
        // For now, return success

        wp_send_json_success([
            'message' => __('Estimate copy request processed', 'product-estimator')
        ]);
    }

    /**
     * Request store contact - processes contact requests
     */
    public function request_store_contact() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Get customer details
        $customer_details = isset($_POST['customer_details']) ? $_POST['customer_details'] : null;

        if (!$customer_details) {
            wp_send_json_error([
                'message' => __('Customer details required', 'product-estimator')
            ]);
            return;
        }

        // Decode JSON if necessary
        if (is_string($customer_details)) {
            $customer_details = json_decode(stripslashes($customer_details), true);
        }

        try {
            // Validate required fields
            if (empty($customer_details['email']) || empty($customer_details['name'])) {
                throw new \Exception(__('Name and email are required', 'product-estimator'));
            }

            // Process the contact request
            $customer_handler = new CustomerDetails();
            $result = $customer_handler->requestStoreContact($customer_details);

            if ($result) {
                wp_send_json_success([
                    'message' => __('Contact request sent successfully', 'product-estimator')
                ]);
            } else {
                throw new \Exception(__('Failed to process contact request', 'product-estimator'));
            }

        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => $e->getMessage()
            ]);
        }
    }
}
