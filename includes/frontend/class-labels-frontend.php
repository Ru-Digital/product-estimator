<?php
namespace RuDigital\ProductEstimator\Includes\Frontend;

/**
 * Frontend-only functionality for labels
 * This lightweight class provides only what's needed for the frontend
 * without loading admin dependencies
 *
 * @since      1.2.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/frontend
 */
class LabelsFrontend extends FrontendBase {
    /**
     * Option name for storing label settings
     *
     * @since    1.1.0
     * @access   private
     * @var      string $option_name Option name for settings
     */
    private $option_name;

    /**
     * Default labels cache
     *
     * @since    1.2.0
     * @access   private
     * @var      array    $default_labels    Default label values.
     */
    private $default_labels = [];

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.2.0
     * @param    string    $plugin_name    The name of this plugin.
     * @param    string    $version        The version of this plugin.
     */
    public function __construct($plugin_name, $version) {
        parent::__construct($plugin_name, $version);

        $this->option_name = 'product_estimator_labels';

        // Initialize default labels
        $this->init_default_labels();

        // Only add frontend actions if not in admin
        if (!is_admin()) {
            // Add labels to frontend scripts
            add_action('wp_enqueue_scripts', [$this, 'add_labels_to_frontend'], 20);
        }
    }

    /**
     * Initialize default labels
     *
     * @since    1.2.0
     * @access   private
     */
    private function init_default_labels() {
        $this->default_labels = [
            // General - Estimate Action Buttons
            'label_print_estimate' => __('Print Estimate', 'product-estimator'),
            'label_request_copy' => __('Request a Copy', 'product-estimator'),
            'label_save_estimate' => __('Save Estimate', 'product-estimator'),
            'label_similar_products' => __('Similar Products', 'product-estimator'),

            // General - Product Labels
            'label_product_includes' => __('Includes', 'product-estimator'),
            'label_product_notes' => __('Notes', 'product-estimator'),
            'label_additional_products' => __('Additional Products', 'product-estimator'),

            // General - Form Labels
            'label_estimate_name' => __('Estimate Name', 'product-estimator'),
            'label_room_name' => __('Room Name', 'product-estimator'),
            'label_room_dimensions' => __('Room Dimensions', 'product-estimator'),

            // PDF - Footer Contact Details
            'label_company_name' => get_bloginfo('name'),
            'label_company_phone' => '',
            'label_company_website' => get_bloginfo('url'),
            'label_company_email' => get_bloginfo('admin_email'),

            // PDF - Labels
            'label_estimate_title' => __('Product Estimate', 'product-estimator'),
            'label_customer_details' => __('Customer Details', 'product-estimator'),
            'label_estimate_summary' => __('Estimate Summary', 'product-estimator'),
            'label_price_range' => __('Price Range', 'product-estimator'),

            // Alerts - Alert Messages
            'alert_add_product_success' => __('Product added to estimate successfully.', 'product-estimator'),
            'alert_remove_product_success' => __('Product removed from estimate.', 'product-estimator'),
            'alert_update_quantity_success' => __('Quantity updated successfully.', 'product-estimator'),

            // Alerts - Validation Messages
            'validation_required_field' => __('This field is required.', 'product-estimator'),
            'validation_invalid_email' => __('Please enter a valid email address.', 'product-estimator'),
            'validation_invalid_number' => __('Please enter a valid number.', 'product-estimator'),

            // Alerts - Success Messages
            'success_estimate_saved' => __('Estimate saved successfully.', 'product-estimator'),
            'success_estimate_sent' => __('Estimate sent successfully.', 'product-estimator'),
            'success_copy_requested' => __('A copy of the estimate has been sent to your email.', 'product-estimator')
        ];
    }

    /**
     * Get a label value
     *
     * @since    1.2.0
     * @access   public
     * @param    string    $key        Label key
     * @param    array     $args       Arguments to replace placeholders
     * @return   string    The label value
     */
    public function get_label($key, $args = []) {
        // Get all label settings - use dedicated labels option
        $settings = get_option($this->option_name, []);

        // If the label exists in settings, use it
        if (isset($settings[$key])) {
            $label = $settings[$key];
        } else {
            // Otherwise, use the default label
            $label = $this->get_default_label($key);
        }

        // Replace placeholders
        if (!empty($args)) {
            foreach ($args as $placeholder => $value) {
                $label = str_replace('{' . $placeholder . '}', $value, $label);
            }
        }

        return $label;
    }

    /**
     * Get default label value
     *
     * @since    1.2.0
     * @access   public
     * @param    string    $key        Label key
     * @return   string    The default label value
     */
    public function get_default_label($key) {
        return isset($this->default_labels[$key]) ? $this->default_labels[$key] : $key;
    }

    /**
     * Get all labels for frontend
     *
     * @since    1.2.0
     * @access   public
     * @return   array     All labels for frontend use
     */
    public function get_all_frontend_labels() {
        // Get all label settings from dedicated option
        $settings = get_option($this->option_name, []);
        $labels = [];

        // Frontend label keys we want to expose
        $frontend_label_keys = [
            // General action buttons
            'label_print_estimate',
            'label_request_copy',
            'label_save_estimate',
            'label_similar_products',

            // Product labels
            'label_product_includes',
            'label_product_notes',
            'label_additional_products',

            // Form labels
            'label_estimate_name',
            'label_room_name',
            'label_room_dimensions',

            // Alert messages
            'alert_add_product_success',
            'alert_remove_product_success',
            'alert_update_quantity_success',

            // Validation messages
            'validation_required_field',
            'validation_invalid_email',
            'validation_invalid_number',

            // Success messages
            'success_estimate_saved',
            'success_estimate_sent',
            'success_copy_requested'
        ];

        // Build the labels array with default and custom values
        foreach ($frontend_label_keys as $key) {
            $labels[$key] = isset($settings[$key]) ? $settings[$key] : $this->get_default_label($key);
        }

        return $labels;
    }

    /**
     * Add labels to frontend script localization
     *
     * @since    1.2.0
     * @access   public
     */
    public function add_labels_to_frontend() {
        $labels = $this->get_all_frontend_labels();

        // Localize the script
        wp_localize_script(
            'product-estimator',
            'productEstimatorLabels',
            $labels
        );
    }

    /**
     * Get the PDF footer contact details
     *
     * @since    1.2.0
     * @access   public
     * @return   array     Footer contact details
     */
    public function get_pdf_footer_contact_details() {
        return [
            'company_name' => $this->get_label('label_company_name'),
            'company_phone' => $this->get_label('label_company_phone'),
            'company_website' => $this->get_label('label_company_website'),
            'company_email' => $this->get_label('label_company_email')
        ];
    }

    /**
     * Get labels for a specific category/group
     *
     * @since    1.2.0
     * @access   public
     * @param    string    $category   Label category (general, pdf, alerts)
     * @return   array     Labels for the category
     */
    public function get_labels_by_category($category) {
        $settings = get_option($this->option_name, []);
        $labels = [];

        $prefixes = [
            'general' => ['label_print', 'label_request', 'label_save', 'label_similar', 'label_product', 'label_estimate', 'label_room'],
            'pdf' => ['label_company', 'label_estimate_title', 'label_customer_details', 'label_estimate_summary', 'label_price_range'],
            'alerts' => ['alert_', 'validation_', 'success_']
        ];

        if (!isset($prefixes[$category])) {
            return [];
        }

        foreach ($settings as $key => $value) {
            foreach ($prefixes[$category] as $prefix) {
                if (strpos($key, $prefix) === 0) {
                    $labels[$key] = $value;
                    break;
                }
            }
        }

        // Add defaults for any missing labels
        foreach ($this->default_labels as $key => $value) {
            foreach ($prefixes[$category] as $prefix) {
                if (strpos($key, $prefix) === 0 && !isset($labels[$key])) {
                    $labels[$key] = $value;
                    break;
                }
            }
        }

        return $labels;
    }
}
