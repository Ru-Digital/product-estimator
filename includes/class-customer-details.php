<?php
namespace RuDigital\ProductEstimator\Includes;

/**
 * Customer Details Class
 *
 * Handles management of customer details for the Product Estimator
 * This class has been updated to work without PHP sessions.
 * Customer details are now stored in the browser's localStorage
 * and passed to the server as needed.
 *
 * @since      1.0.5
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */
class CustomerDetails {

    /**
     * Default customer details structure
     *
     * @var array
     */
    private $default_details = [
        'name' => '',
        'email' => '',
        'phone' => '',
        'postcode' => ''
    ];

    /**
     * Initialize the class
     */
    public function __construct() {
        // No longer requires session handler
    }

    /**
     * Validate form data for customer details
     *
     * @param array $form_data Form data to validate
     * @return array|\WP_Error Validated details or error
     */
    public function validateFormData($form_data) {
        $errors = new \WP_Error();
        
        // Check required fields
        if (empty($form_data['customer_name'])) {
            $errors->add('name_required', __('Customer name is required', 'product-estimator'));
        }
        
        if (empty($form_data['customer_email'])) {
            $errors->add('email_required', __('Customer email is required', 'product-estimator'));
        } elseif (!is_email($form_data['customer_email'])) {
            $errors->add('email_invalid', __('Please enter a valid email address', 'product-estimator'));
        }
        
        if (empty($form_data['customer_postcode'])) {
            $errors->add('postcode_required', __('Postcode is required', 'product-estimator'));
        }
        
        // If there are errors, return them
        if (!empty($errors->errors)) {
            return $errors;
        }
        
        // Return validated and sanitized details
        return [
            'name' => sanitize_text_field($form_data['customer_name']),
            'email' => sanitize_email($form_data['customer_email']),
            'phone' => isset($form_data['customer_phone']) ? sanitize_text_field($form_data['customer_phone']) : '',
            'postcode' => sanitize_text_field($form_data['customer_postcode'])
        ];
    }

    /**
     * Check if complete details exist
     * This now checks the data passed from the frontend
     *
     * @param array $details Customer details to check
     * @return bool Whether all required fields are present
     */
    public function hasCompleteDetails($details = null) {
        if (!$details) {
            return false;
        }
        
        return !empty($details['name']) && 
               !empty($details['email']) && 
               !empty($details['postcode']);
    }

    /**
     * Get customer details from passed data
     * This method is kept for backward compatibility
     *
     * @param array $details Customer details
     * @return array Customer details with defaults applied
     */
    public function getDetails($details = null) {
        if (!$details) {
            return $this->default_details;
        }
        
        return array_merge($this->default_details, $details);
    }

    /**
     * Format customer details for display
     *
     * @param array $details Customer details
     * @return array Formatted details
     */
    public function formatForDisplay($details) {
        if (!$details) {
            return $this->default_details;
        }
        
        return [
            'name' => isset($details['name']) ? esc_html($details['name']) : '',
            'email' => isset($details['email']) ? esc_html($details['email']) : '',
            'phone' => isset($details['phone']) ? esc_html($details['phone']) : '',
            'postcode' => isset($details['postcode']) ? esc_html($details['postcode']) : ''
        ];
    }

    /**
     * Legacy method kept for backward compatibility
     * Now just returns the passed details
     *
     * @param array $details Customer details
     * @return bool Always returns true
     */
    public function setDetails($details) {
        // This method no longer stores in session
        // It's kept for backward compatibility
        return true;
    }
}