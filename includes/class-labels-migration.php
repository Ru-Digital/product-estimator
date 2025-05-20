<?php
namespace RuDigital\ProductEstimator\Includes;

/**
 * Handles migration of labels to new structure
 *
 * @since      2.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */
class LabelsMigration {
    /**
     * The old option name for labels
     */
    const OLD_OPTION_NAME = 'product_estimator_labels';
    
    /**
     * The new option name for labels
     */
    const NEW_OPTION_NAME = 'product_estimator_labels';
    
    /**
     * The option name for labels version
     */
    const VERSION_OPTION_NAME = 'product_estimator_labels_version';
    
    /**
     * Run the migration
     */
    public static function migrate() {
        $existing_labels = get_option(self::OLD_OPTION_NAME, []);
        
        if (empty($existing_labels)) {
            // No existing labels, create default structure
            self::create_default_structure();
            return;
        }
        
        // Check if already migrated
        $version = get_option(self::VERSION_OPTION_NAME, '0');
        if (version_compare($version, '2.0.0', '>=')) {
            return; // Already migrated
        }
        
        // Migrate existing labels to new structure
        $new_structure = self::migrate_labels($existing_labels);
        
        // Save the new structure
        update_option(self::NEW_OPTION_NAME, $new_structure);
        update_option(self::VERSION_OPTION_NAME, '2.0.0');
        
        // Clear any existing caches
        delete_transient('pe_frontend_labels_cache');
    }
    
    /**
     * Migrate labels from old structure to new
     */
    private static function migrate_labels($old_labels) {
        $new_structure = self::get_default_structure();
        
        // Map old labels to new categories
        foreach ($old_labels as $key => $value) {
            if (strpos($key, 'label_print') === 0 || strpos($key, 'label_save') === 0 || strpos($key, 'label_request') === 0) {
                $new_key = str_replace('label_', '', $key);
                $new_structure['buttons'][$new_key] = $value;
            }
            elseif (strpos($key, 'label_product') === 0 || strpos($key, 'label_similar') === 0) {
                $new_key = str_replace('label_', '', $key);
                $new_structure['buttons'][$new_key] = $value;
            }
            elseif (strpos($key, 'label_estimate') === 0 || strpos($key, 'label_room') === 0 || strpos($key, 'label_customer') === 0) {
                $new_key = str_replace('label_', '', $key);
                $new_structure['forms'][$new_key] = $value;
            }
            elseif (strpos($key, 'alert_') === 0 || strpos($key, 'validation_') === 0 || strpos($key, 'success_') === 0) {
                $new_structure['messages'][$key] = $value;
            }
            elseif (strpos($key, 'label_company') === 0 || strpos($key, 'label_pdf') === 0) {
                $new_key = str_replace('label_', '', $key);
                $new_structure['pdf'][$new_key] = $value;
            }
            else {
                // Put in ui_elements as fallback
                $new_structure['ui_elements'][$key] = $value;
            }
        }
        
        return $new_structure;
    }
    
    /**
     * Get the default label structure
     */
    public static function get_default_structure() {
        return [
            'buttons' => [
                'print_estimate' => __('Print Estimate', 'product-estimator'),
                'request_copy' => __('Request a Copy', 'product-estimator'),
                'save_estimate' => __('Save Estimate', 'product-estimator'),
                'similar_products' => __('Similar Products', 'product-estimator'),
                'product_includes' => __('Product Includes', 'product-estimator'),
                'additional_products' => __('Additional Products', 'product-estimator'),
                'suggested_products' => __('Suggested Products', 'product-estimator'),
                'add_to_cart' => __('Add to Cart', 'product-estimator'),
                'remove_product' => __('Remove', 'product-estimator'),
                'show_more' => __('Show More', 'product-estimator'),
                'show_less' => __('Show Less', 'product-estimator'),
                'confirm' => __('Confirm', 'product-estimator'),
                'cancel' => __('Cancel', 'product-estimator'),
                'close' => __('Close', 'product-estimator'),
                'save' => __('Save', 'product-estimator'),
                'delete' => __('Delete', 'product-estimator'),
                'edit' => __('Edit', 'product-estimator'),
                'add' => __('Add', 'product-estimator'),
                'remove' => __('Remove', 'product-estimator'),
                'update' => __('Update', 'product-estimator'),
                'search' => __('Search', 'product-estimator'),
                'filter' => __('Filter', 'product-estimator'),
                'reset' => __('Reset', 'product-estimator'),
                'apply' => __('Apply', 'product-estimator'),
            ],
            'forms' => [
                'estimate_name' => __('Estimate Name', 'product-estimator'),
                'room_name' => __('Room Name', 'product-estimator'),
                'room_dimensions' => __('Room Dimensions', 'product-estimator'),
                'customer_name' => __('Customer Name', 'product-estimator'),
                'customer_email' => __('Email Address', 'product-estimator'),
                'customer_phone' => __('Phone Number', 'product-estimator'),
                'customer_postcode' => __('Postcode', 'product-estimator'),
                'notes' => __('Additional Notes', 'product-estimator'),
                'quantity' => __('Quantity', 'product-estimator'),
                'price' => __('Price', 'product-estimator'),
                'total' => __('Total', 'product-estimator'),
                'subtotal' => __('Subtotal', 'product-estimator'),
                'tax' => __('Tax', 'product-estimator'),
                'shipping' => __('Shipping', 'product-estimator'),
                'discount' => __('Discount', 'product-estimator'),
                'placeholder_estimate_name' => __('Enter estimate name', 'product-estimator'),
                'placeholder_room_name' => __('Enter room name', 'product-estimator'),
                'placeholder_email' => __('your@email.com', 'product-estimator'),
                'placeholder_phone' => __('Your phone number', 'product-estimator'),
                'placeholder_postcode' => __('Your postcode', 'product-estimator'),
                'placeholder_search' => __('Search...', 'product-estimator'),
            ],
            'messages' => [
                // Success messages
                'product_added' => __('Product added successfully', 'product-estimator'),
                'product_removed' => __('Product removed', 'product-estimator'),
                'estimate_saved' => __('Estimate saved successfully', 'product-estimator'),
                'email_sent' => __('Email sent successfully', 'product-estimator'),
                'settings_saved' => __('Settings saved successfully', 'product-estimator'),
                'room_created' => __('Room created successfully', 'product-estimator'),
                'room_deleted' => __('Room deleted', 'product-estimator'),
                
                // Error messages
                'general_error' => __('An error occurred. Please try again.', 'product-estimator'),
                'save_failed' => __('Failed to save. Please try again.', 'product-estimator'),
                'invalid_email' => __('Please enter a valid email address', 'product-estimator'),
                'required_field' => __('This field is required', 'product-estimator'),
                'network_error' => __('Network error. Please check your connection.', 'product-estimator'),
                'permission_denied' => __('You do not have permission to perform this action', 'product-estimator'),
                
                // Confirmation messages
                'confirm_delete' => __('Are you sure you want to delete this?', 'product-estimator'),
                'confirm_remove_product' => __('Remove this product from the estimate?', 'product-estimator'),
                'confirm_delete_room' => __('Delete this room and all its products?', 'product-estimator'),
                'unsaved_changes' => __('You have unsaved changes. Are you sure you want to leave?', 'product-estimator'),
                
                // Validation messages
                'min_length' => __('Minimum {min} characters required', 'product-estimator'),
                'max_length' => __('Maximum {max} characters allowed', 'product-estimator'),
                'invalid_format' => __('Invalid format', 'product-estimator'),
                'number_required' => __('Please enter a valid number', 'product-estimator'),
            ],
            'ui_elements' => [
                'loading' => __('Loading...', 'product-estimator'),
                'no_results' => __('No results found', 'product-estimator'),
                'empty_room' => __('No products in this room', 'product-estimator'),
                'empty_estimate' => __('No rooms in this estimate', 'product-estimator'),
                'price_notice' => __('Prices are subject to check measures without notice', 'product-estimator'),
                'showing_results' => __('Showing {count} results', 'product-estimator'),
                'page_of' => __('Page {current} of {total}', 'product-estimator'),
                'sort_by' => __('Sort by', 'product-estimator'),
                'filter_by' => __('Filter by', 'product-estimator'),
                'search_results' => __('Search results for "{query}"', 'product-estimator'),
                'no_items' => __('No items to display', 'product-estimator'),
                'add_first_item' => __('Add your first item', 'product-estimator'),
                'get_started' => __('Get Started', 'product-estimator'),
                'learn_more' => __('Learn More', 'product-estimator'),
                'view_all' => __('View All', 'product-estimator'),
                'hide_all' => __('Hide All', 'product-estimator'),
                'expand' => __('Expand', 'product-estimator'),
                'collapse' => __('Collapse', 'product-estimator'),
                'previous' => __('Previous', 'product-estimator'),
                'next' => __('Next', 'product-estimator'),
            ],
            'pdf' => [
                'title' => __('Product Estimate', 'product-estimator'),
                'customer_details' => __('Customer Details', 'product-estimator'),
                'estimate_summary' => __('Estimate Summary', 'product-estimator'),
                'price_range' => __('Price Range', 'product-estimator'),
                'from' => __('From', 'product-estimator'),
                'to' => __('To', 'product-estimator'),
                'date' => __('Date', 'product-estimator'),
                'page' => __('Page', 'product-estimator'),
                'of' => __('of', 'product-estimator'),
                'company_name' => get_bloginfo('name'),
                'company_phone' => '',
                'company_email' => get_bloginfo('admin_email'),
                'company_website' => get_bloginfo('url'),
                'footer_text' => __('Thank you for your business', 'product-estimator'),
                'disclaimer' => __('This estimate is valid for 30 days', 'product-estimator'),
            ]
        ];
    }
    
    /**
     * Create the default label structure
     */
    private static function create_default_structure() {
        $default_structure = self::get_default_structure();
        
        update_option(self::NEW_OPTION_NAME, $default_structure);
        update_option(self::VERSION_OPTION_NAME, '2.0.0');
    }
}