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
    private $session_handler;

    /**
     * Customer details data, loaded on demand.
     *
     * @var array|null Null if not loaded, array once loaded (can be empty).
     */
    private $details = null; // Initialize as null to indicate not loaded

    /**
     * Flag to indicate if details have been loaded from session in the current request.
     * @var bool
     */
    private $details_loaded_this_request = false;


    /**
     * Initialize the class
     */
    public function __construct() {
        $this->session_handler = SessionHandler::getInstance();
        // Details are not loaded from session in the constructor anymore.
        // They will be loaded on-demand via ensureDetailsLoaded().
    }

    /**
     * Ensure details are loaded from session if not already for this request.
     * This method is the single point of truth for loading details from the session.
     *
     * @return bool True if details are available (loaded or already were), false if session failed or no details.
     */
    private function ensureDetailsLoaded() {
        if ($this->details_loaded_this_request) {
            return true; // Already loaded in this request lifecycle
        }

        if (!$this->session_handler->ensureSessionStarted()) {
            // If session cannot be started, we cannot reliably load details.
            $this->details = []; // Reset local details to a safe default (empty array)
            // We don't mark as loaded if session failed, so subsequent attempts might try again
            // or other parts of the app might behave as if no details exist.
            return false;
        }

        // Get details directly from SessionHandler, which handles $_SESSION access and legacy keys
        $session_customer_details = $this->session_handler->getCustomerDetails();

        if ($session_customer_details !== null && is_array($session_customer_details)) {
            $this->details = $session_customer_details;
        } else {
            $this->details = []; // Ensure it's an empty array if nothing in session or not an array
        }

        $this->details_loaded_this_request = true;
        return true;
    }

    /**
     * Set customer details, save to session, and update in all existing estimates.
     *
     * @param array $new_details Customer details array (e.g., from a form)
     * @return bool Success
     */
    public function setDetails($new_details) {
        // Validate essential input: postcode must be at least set
        if (!isset($new_details['postcode'])) {
            error_log("Product Estimator (CustomerDetails): Attempted to set details without a 'postcode' key.");
            return false;
        }

        // Ensure session can be started before attempting to save
        if (!$this->session_handler->ensureSessionStarted()) {
            error_log("Product Estimator (CustomerDetails): Session could not be started. Cannot set details.");
            return false;
        }

        // Sanitize and structure the details to be stored
        $this->details = [
            'name'     => isset($new_details['name']) ? sanitize_text_field($new_details['name']) : '',
            'email'    => isset($new_details['email']) ? sanitize_email($new_details['email']) : '',
            'phone'    => isset($new_details['phone']) ? sanitize_text_field($new_details['phone']) : '',
            'postcode' => sanitize_text_field($new_details['postcode']),
            'timestamp'=> current_time('timestamp')
        ];
        $this->details_loaded_this_request = true; // Details are now "loaded" (they are what we just set)

        // 1. Save the main customer details to the session's top level
        $this->session_handler->setCustomerDetails($this->details);

        // 2. Update customer_details in all existing estimates within the session
        // This now calls the dedicated method in SessionHandler as discussed
        if (!$this->session_handler->updateCustomerDetailsInAllEstimates($this->details)) {
            // Log if updating estimates failed, though setCustomerDetails for the main part succeeded.
            error_log("Product Estimator (CustomerDetails): Main customer details saved, but failed to update details in all existing estimates.");
            // Decide if this constitutes an overall failure for setDetails.
            // For now, we'll consider the main save a success.
        } else {
            error_log("Product Estimator (CustomerDetails): Updated customer details in existing session estimates.");
        }

        return true;
    }

    /**
     * Check if customer details are considered complete (primarily checks for postcode).
     *
     * @return bool Whether customer details are complete.
     */
    public function hasCompleteDetails() {
        if (!$this->ensureDetailsLoaded()) {
            return false; // Cannot determine if session/details are not available
        }
        // Based on your original logic, 'postcode' is the main check for "completeness"
        return !empty($this->details) && !empty($this->details['postcode']);
    }

    /**
     * Check if customer has an email set.
     *
     * @return bool Whether customer email is set.
     */
    public function hasEmail() {
        if (!$this->ensureDetailsLoaded()) {
            return false;
        }
        return !empty($this->details) && !empty($this->details['email']);
    }

    /**
     * Get all customer details.
     *
     * @return array Customer details (empty array if none or session fails).
     */
    public function getDetails() {
        $this->ensureDetailsLoaded();
        return is_array($this->details) ? $this->details : [];
    }

    /**
     * Get a specific detail by key.
     *
     * @param string $key Detail key.
     * @return mixed Detail value or null if not set or session fails.
     */
    public function getDetail($key) {
        if (!$this->ensureDetailsLoaded()) {
            return null;
        }
        return isset($this->details[$key]) ? $this->details[$key] : null;
    }

    /**
     * Clear customer details from this object and from session.
     * Also clears details in all existing session estimates.
     *
     * @return bool Success.
     */
    public function clearDetails() {
        if (!$this->session_handler->ensureSessionStarted()) {
            error_log("Product Estimator (CustomerDetails): Session could not be started. Cannot clear details.");
            return false;
        }

        $this->details = []; // Clear local copy
        $this->details_loaded_this_request = true; // Mark as "loaded" with empty details

        // 1. Clear the main customer details in the session's top level
        $this->session_handler->setCustomerDetails([]); // Pass empty array to clear

        // 2. Clear customer_details in all existing estimates within the session
        if (!$this->session_handler->updateCustomerDetailsInAllEstimates([])) {
            error_log("Product Estimator (CustomerDetails): Main customer details cleared, but failed to clear details in all existing estimates.");
        } else {
            error_log("Product Estimator (CustomerDetails): Cleared customer details in existing session estimates.");
        }
        return true;
    }

    /**
     * Validate customer details from form data.
     * This method does not interact with the session directly.
     *
     * @param array $form_data Form data.
     * @return array|\WP_Error Validated details as an array, or a WP_Error object on failure.
     */
    public function validateFormData($form_data) {
        $errors = new \WP_Error();

        // Postcode is required for this plugin's logic usually
//        if (empty($form_data['customer_postcode'])) {
//            $errors->add('missing_postcode', __('Your postcode is required', 'product-estimator'));
//        }

        // Validate email if provided and not empty
        // It's not strictly required by all plugin functions, but if given, it must be valid.
        if (!empty($form_data['customer_email']) && !is_email($form_data['customer_email'])) {
            $errors->add('invalid_email', __('Please enter a valid email address', 'product-estimator'));
        }

        // Add other validations as needed (e.g., name, phone format)
        // Example for name:
        // if (empty($form_data['customer_name'])) {
        //     $errors->add('missing_name', __('Your name is required', 'product-estimator'));
        // }

        if (!empty($errors->get_error_codes())) {
            return $errors;
        }

        // Return sanitized data if no errors
        return [
            'name'     => !empty($form_data['customer_name']) ? sanitize_text_field(trim($form_data['customer_name'])) : '',
            'email'    => !empty($form_data['customer_email']) ? sanitize_email($form_data['customer_email']) : '',
            'phone'    => !empty($form_data['customer_phone']) ? sanitize_text_field(trim($form_data['customer_phone'])) : '',
            'postcode' => !empty($form_data['customer_postcode']) ? sanitize_text_field(trim($form_data['customer_postcode'])) : ''
        ];
    }
}
