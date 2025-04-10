<?php
namespace RuDigital\ProductEstimator\Includes;

/**
 * Customer Details Class
 *
 * Handles management of customer details for the Product Estimator
 *
 * @since      1.0.5
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */
class CustomerDetails {

    /**
     * Session handler instance
     *
     * @var SessionHandler
     */
    private $session;

    /**
     * Customer details data
     *
     * @var array
     */
    private $details = [];

    /**
     * Initialize the class
     */
    public function __construct() {
        $this->session = SessionHandler::getInstance();
        $this->loadFromSession();
    }

    /**
     * Load customer details from session
     *
     * @return void
     */
    private function loadFromSession() {
        $this->session->startSession();

        // First check for customer_details (new standard key)
        if (isset($_SESSION['product_estimator']['customer_details'])) {
            $this->details = $_SESSION['product_estimator']['customer_details'];
        }
        // Fall back to user_details for backward compatibility
        elseif (isset($_SESSION['product_estimator']['user_details'])) {
            $this->details = $_SESSION['product_estimator']['user_details'];

            // Migrate data from old key to new key
            $_SESSION['product_estimator']['customer_details'] = $this->details;

            // Remove the old key (optional, but helps with clean transition)
            unset($_SESSION['product_estimator']['user_details']);
        }
    }

    /**
     * Set customer details
     *
     * @param array $details Customer details array
     * @return bool Success
     */
    public function setDetails($details) {
        // Basic validation
        if (!isset($details['name']) || !isset($details['email']) || !isset($details['postcode'])) {
            return false;
        }

        $this->details = [
            'name' => sanitize_text_field($details['name']),
            'email' => sanitize_email($details['email']),
            'phone' => isset($details['phone']) ? sanitize_text_field($details['phone']) : '',
            'postcode' => sanitize_text_field($details['postcode']),
            'timestamp' => current_time('timestamp')
        ];

        // Save to session
        $this->saveToSession();

        return true;
    }

    /**
     * Save details to session
     *
     * @return bool Success
     */
    private function saveToSession() {
        $this->session->startSession();

        if (!isset($_SESSION['product_estimator'])) {
            $_SESSION['product_estimator'] = [];
        }

        // Save under the standardized customer_details key
        $_SESSION['product_estimator']['customer_details'] = $this->details;

        // If old key exists, remove it
        if (isset($_SESSION['product_estimator']['user_details'])) {
            unset($_SESSION['product_estimator']['user_details']);
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Customer details saved to session: ' . print_r($this->details, true));
        }

        return true;
    }

    /**
     * Check if customer details are complete
     *
     * @return bool Whether customer details are complete
     */
    public function hasCompleteDetails() {
        return !empty($this->details) &&
            isset($this->details['name']) &&
            isset($this->details['email']) &&
            isset($this->details['postcode']);
    }

    /**
     * Get all customer details
     *
     * @return array Customer details
     */
    public function getDetails() {
        return $this->details;
    }

    /**
     * Get specific detail
     *
     * @param string $key Detail key
     * @return mixed Detail value or null if not set
     */
    public function getDetail($key) {
        return isset($this->details[$key]) ? $this->details[$key] : null;
    }

    /**
     * Clear customer details
     *
     * @return bool Success
     */
    public function clearDetails() {
        $this->details = [];
        $this->saveToSession();
        return true;
    }

    /**
     * Validate customer details from form data
     *
     * @param array $form_data Form data
     * @return array|WP_Error Validated details or error
     */
    public function validateFormData($form_data) {
        $errors = [];

        // Required fields
        if (empty($form_data['customer_name'])) {
            $errors[] = __('Your name is required', 'product-estimator');
        }

        if (empty($form_data['customer_email'])) {
            $errors[] = __('Your email is required', 'product-estimator');
        } elseif (!filter_var($form_data['customer_email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = __('Please enter a valid email address', 'product-estimator');
        }

        if (empty($form_data['customer_postcode'])) {
            $errors[] = __('Your postcode is required', 'product-estimator');
        }

        if (!empty($errors)) {
            return new \WP_Error('validation_failed', implode('<br>', $errors));
        }

        // Return sanitized data
        return [
            'name' => sanitize_text_field($form_data['customer_name']),
            'email' => sanitize_email($form_data['customer_email']),
            'phone' => !empty($form_data['customer_phone']) ? sanitize_text_field($form_data['customer_phone']) : '',
            'postcode' => sanitize_text_field($form_data['customer_postcode'])
        ];
    }
}
