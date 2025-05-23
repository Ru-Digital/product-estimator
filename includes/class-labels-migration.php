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
        if (version_compare($version, '2.0.16', '>=')) {
            return; // Already migrated
        }

        // Migrate existing labels to new structure
        $new_structure = self::migrate_labels($existing_labels);

        // Save the new structure
        update_option(self::NEW_OPTION_NAME, $new_structure);
        update_option(self::VERSION_OPTION_NAME, '2.0.16');

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
                'continue' => __('Continue', 'product-estimator'),
                'save' => __('Save', 'product-estimator'),
                'delete' => __('Delete', 'product-estimator'),
                'edit' => __('Edit', 'product-estimator'),
                'add' => __('Add', 'product-estimator'),
                'remove' => __('Remove', 'product-estimator'),
                'remove_product' => __('Remove Product', 'product-estimator'),
                'update' => __('Update', 'product-estimator'),
                'search' => __('Search', 'product-estimator'),
                'filter' => __('Filter', 'product-estimator'),
                'reset' => __('Reset', 'product-estimator'),
                'apply' => __('Apply', 'product-estimator'),
                'create_new_estimate' => __('Create New Estimate', 'product-estimator'),
                'contact_email' => __('Email', 'product-estimator'),
                'contact_phone' => __('Phone', 'product-estimator'),
                'delete_estimate' => __('Delete Estimate', 'product-estimator'),
                'remove_room' => __('Remove Room', 'product-estimator'),
                'request_contact' => __('Request contact from store', 'product-estimator'),
                'add_new_room' => __('Add New Room', 'product-estimator'),
                'add_product' => __('Add Product', 'product-estimator'),
                'add_room' => __('Add Room', 'product-estimator'),
                'edit_product' => __('Edit Product', 'product-estimator'),
                'add_to_estimate' => __('Add to Estimate', 'product-estimator'),
                'continue' => __('Continue', 'product-estimator'),
                'create_estimate' => __('Create Estimate', 'product-estimator'),
                'save_changes' => __('Save Changes', 'product-estimator'),
                'ok' => __('OK', 'product-estimator'),
                'replace_product' => __('Replace Product', 'product-estimator'),
                'select_additional_product' => __('Select', 'product-estimator'),
                'selected_additional_product' => __('Selected', 'product-estimator'),
                'add_product_and_room' => __('Add Product & Room', 'product-estimator'),
                'back_to_products' => __('Back to Products', 'product-estimator'),
                'view_details' => __('View Details', 'product-estimator'),
                'back_to_rooms' => __('Back to Rooms', 'product-estimator'),
                'start_new_estimate' => __('Start New Estimate', 'product-estimator'),
                'select_product' => __('Select Product', 'product-estimator'),
                'select_room' => __('Select Room', 'product-estimator'),
                'add_note' => __('Add Note', 'product-estimator'),
                'submit' => __('Submit', 'product-estimator'),
                'more_options' => __('More Options', 'product-estimator'),
                'back' => __('Back', 'product-estimator'),
                'next' => __('Next', 'product-estimator'),
                'done' => __('Done', 'product-estimator'),
                'select_all' => __('Select All', 'product-estimator'),
                'select_none' => __('Select None', 'product-estimator'),
                'toggle_details' => __('Toggle Details', 'product-estimator'),
                'add_to_room' => __('Add to Room', 'product-estimator'),
                'add_product_to_room' => __('Add Product to Room', 'product-estimator'),
                'replace_existing_product' => __('Replace the existing product', 'product-estimator'),
                'go_back_to_room_select' => __('Go back to room select', 'product-estimator'),
                'add_to_estimate_single_product' => __('Add to Estimate', 'product-estimator'),
                'add_room_and_product' => __('Add Room & Product', 'product-estimator'),
            ],
            'forms' => [
                'estimate_name' => __('Estimate Name', 'product-estimator'),
                'room_name' => __('Room Name', 'product-estimator'),
                'room_dimensions' => __('Room Dimensions', 'product-estimator'),
                'room_width' => __('Width (m)', 'product-estimator'),
                'room_length' => __('Length (m)', 'product-estimator'),
                'customer_name' => __('Customer Name', 'product-estimator'),
                'customer_email' => __('Email Address', 'product-estimator'),
                'customer_phone' => __('Phone Number', 'product-estimator'),
                'customer_postcode' => __('Postcode', 'product-estimator'),
                'full_name' => __('Full Name', 'product-estimator'),
                'email_address' => __('Email Address', 'product-estimator'), 
                'phone_number' => __('Phone Number', 'product-estimator'),
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
                'placeholder_width' => __('Width', 'product-estimator'),
                'placeholder_length' => __('Length', 'product-estimator'), 
                'select_estimate' => __('Select an estimate', 'product-estimator'),
                'select_room' => __('Select a room', 'product-estimator'),
                'choose_estimate' => __('Choose an estimate:', 'product-estimator'),
                'select_estimate_option' => __('-- Select an Estimate --', 'product-estimator'),
                'choose_room' => __('Choose a room:', 'product-estimator'),
                'select_room_option' => __('-- Select a Room --', 'product-estimator'),
            ],
            'messages' => [
                // Success messages
                'product_added' => __('Product added successfully', 'product-estimator'),
                'product_added_message' => __('Product has been successfully added to your room', 'product-estimator'),
                'product_removed' => __('Product removed', 'product-estimator'),
                'estimate_saved' => __('Estimate saved successfully', 'product-estimator'),
                'estimate_removed' => __('This estimate has been removed successfully', 'product-estimator'),
                'estimate_deleted' => __('Estimate deleted successfully', 'product-estimator'),
                'email_sent' => __('Email sent successfully', 'product-estimator'),
                'settings_saved' => __('Settings saved successfully', 'product-estimator'),
                'room_created' => __('Room created successfully', 'product-estimator'),
                'room_deleted' => __('Room deleted', 'product-estimator'),

                // Error messages
                'general_error' => __('An error occurred. Please try again.', 'product-estimator'),
                'save_failed' => __('Failed to save. Please try again.', 'product-estimator'),
                'invalid_email' => __('Please enter a valid email address', 'product-estimator'),
                'invalid_phone' => __('Please enter a valid phone number', 'product-estimator'),
                'required_field' => __('This field is required', 'product-estimator'),
                'network_error' => __('Network error. Please check your connection.', 'product-estimator'),
                'permission_denied' => __('You do not have permission to perform this action', 'product-estimator'),
                'product_load_error' => __('Error loading products. Please try again.', 'product-estimator'),
                'room_load_error' => __('Error loading rooms. Please try again.', 'product-estimator'),
                'product_add_error' => __('Error adding product. Please try again.', 'product-estimator'),
                'product_remove_error' => __('Could not identify the product to remove.', 'product-estimator'),

                // Confirmation messages
                'confirm_delete' => __('Are you sure you want to delete this?', 'product-estimator'),
                'confirm_delete_estimate' => __('Are you sure you want to delete this estimate?', 'product-estimator'),
                'confirm_remove_product' => __('Remove this product from the estimate?', 'product-estimator'),
                'confirm_delete_room' => __('Delete this room and all its products?', 'product-estimator'),
                'unsaved_changes' => __('You have unsaved changes. Are you sure you want to leave?', 'product-estimator'),
                'confirm_proceed' => __('Are you sure you want to proceed?', 'product-estimator'),
                'select_options' => __('Please select your options below:', 'product-estimator'),
                'confirm_product_remove' => __('Are you sure you want to remove this product from the room?', 'product-estimator'),

                // Validation messages
                'min_length' => __('Minimum {min} characters required', 'product-estimator'),
                'max_length' => __('Maximum {max} characters allowed', 'product-estimator'),
                'invalid_format' => __('Invalid format', 'product-estimator'),
                'number_required' => __('Please enter a valid number', 'product-estimator'),
                
                // Dialog messages
                'product_replaced_success' => __('The product has been successfully replaced in your estimate.', 'product-estimator'),
                'primary_product_conflict' => __('This product conflicts with your primary product selection.', 'product-estimator'),
                'product_already_exists' => __('This product already exists in the selected room.', 'product-estimator'),
                'product_added_success' => __('The product has been added to the selected room.', 'product-estimator'),
                'room_created_with_product' => __('The room has been created and the product has been added.', 'product-estimator'),
                'room_created' => __('The room has been created.', 'product-estimator'),
                'additional_information_required' => __('Additional information is required to continue.', 'product-estimator'),
                'email_required_for_copy' => __('An email address is required to send your estimate copy.', 'product-estimator'),
                'phone_required_for_sms' => __('A phone number is required to send your estimate via SMS.', 'product-estimator'),
                'contact_email_details_required' => __('Your details are required for our store to contact you via email.', 'product-estimator'),
                'contact_phone_details_required' => __('Your details are required for our store to contact you via phone.', 'product-estimator'),
                'email_required_for_estimate' => __('An email address is required to view your estimate.', 'product-estimator'),
                'contact_method_estimate_prompt' => __('Please choose how you\'d prefer to receive your estimate:', 'product-estimator'),
                'contact_method_prompt' => __('Please choose how you\'d prefer our store to contact you:', 'product-estimator'),
                'product_conflict' => __('The {room_name} already contains "{existing_product}". Would you like to replace it with "{new_product}"?', 'product-estimator'),
                'confirm_product_remove_with_name' => __('Are you sure you want to remove "{product_name}" from this room?', 'product-estimator'),
            ],
            'ui_elements' => [
                'loading' => __('Loading...', 'product-estimator'),
                'no_results' => __('No results found', 'product-estimator'),
                'no_estimates_available' => __('No estimates available', 'product-estimator'),
                'no_rooms_available' => __('No rooms available', 'product-estimator'),
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
                'confirm_title' => __('Confirm Action', 'product-estimator'),
                'no_estimates' => __('You don\'t have any estimates yet.', 'product-estimator'),
                'no_rooms' => __('No rooms added to this estimate yet.', 'product-estimator'),
                'no_products' => __('No products added to this room yet.', 'product-estimator'),
                'rooms_heading' => __('Rooms', 'product-estimator'),
                'products_heading' => __('Products', 'product-estimator'),
                'select_product_options' => __('Select Product Options', 'product-estimator'),
                'create_new_estimate' => __('Create New Estimate', 'product-estimator'),
                'your_details' => __('Your Details', 'product-estimator'),
                'saved_details' => __('Your Saved Details', 'product-estimator'),
                'edit_your_details' => __('Edit Your Details', 'product-estimator'),
                'primary_product' => __('Primary product', 'product-estimator'),
                'previous_suggestions' => __('Previous Suggestions', 'product-estimator'),
                'next_suggestions' => __('Next Suggestions', 'product-estimator'),
                'product_details' => __('Product Details', 'product-estimator'),
                'room' => __('Room', 'product-estimator'),
                'products' => __('Products', 'product-estimator'),
                'variations' => __('Variations', 'product-estimator'),
                'select_variation' => __('Select Variation', 'product-estimator'),
                'select_options' => __('Select Options', 'product-estimator'),
                'add_to_room' => __('Add to Room', 'product-estimator'),
                'manage_estimate' => __('Manage Estimate', 'product-estimator'),
                'product_selection' => __('Product Selection', 'product-estimator'),
                'selected_rooms' => __('Selected Rooms', 'product-estimator'),
                'modal_header_title' => __('Product Estimator', 'product-estimator'),
                'modal_close' => __('Close', 'product-estimator'),
                'dialog_title_product_added' => __('Product Added', 'product-estimator'),
                'dialog_title_product_removed' => __('Product Removed', 'product-estimator'),
                'dialog_title_product_replaced' => __('Product Replaced', 'product-estimator'),
                'product_exists_title' => __('Product Already Exists', 'product-estimator'),
                'product_replaced_title' => __('Product Replaced Successfully', 'product-estimator'),
                'dialog_title_estimate_removed' => __('Estimate Removed', 'product-estimator'),
                'dialog_title_delete_estimate' => __('Delete Estimate', 'product-estimator'),
                'dialog_title_estimate_saved' => __('Estimate Saved', 'product-estimator'),
                'loading_variations' => __('Loading variations...', 'product-estimator'),
                'loading_products' => __('Loading products...', 'product-estimator'),
                'details_toggle' => __('Show Details', 'product-estimator'),
                'details_toggle_hide' => __('Hide Details', 'product-estimator'),
                'includes_heading' => __('Includes', 'product-estimator'),
                'no_includes' => __('No inclusions for this product', 'product-estimator'),
                'notes_heading' => __('Notes', 'product-estimator'),
                'no_notes' => __('No notes for this product', 'product-estimator'),
                'variation_options' => __('Variation Options', 'product-estimator'),
                'price_range' => __('Price Range', 'product-estimator'),
                'single_price' => __('Price', 'product-estimator'),
                'per_unit' => __('per {unit}', 'product-estimator'),
                'total_price' => __('Total Price', 'product-estimator'),
                'estimate_summary' => __('Estimate Summary', 'product-estimator'),
                'room_summary' => __('Room Summary', 'product-estimator'),
                'product_summary' => __('Product Summary', 'product-estimator'),
                // New UI elements
                'remove_product_title' => __('Remove Product', 'product-estimator'),
                'remove_room_title' => __('Remove Room', 'product-estimator'),
                'remove_room_message' => __('Are you sure you want to remove this room? All products in this room will also be removed. This action cannot be undone.', 'product-estimator'),
                'product_conflict_title' => __('A flooring product already exists in the selected room', 'product-estimator'),
                'product_exists_title' => __('Product Already Exists', 'product-estimator'),
                'product_added_title' => __('Product Added', 'product-estimator'),
                'room_created_title' => __('Room Created', 'product-estimator'),
                'success_title' => __('Success', 'product-estimator'),
                'error_title' => __('Error', 'product-estimator'),
                'select_estimate_title' => __('Select an estimate', 'product-estimator'),
                'select_room_title' => __('Select a room', 'product-estimator'),
                'complete_details_title' => __('Complete Your Details', 'product-estimator'),
                'email_details_required_title' => __('Email Details Required', 'product-estimator'),
                'phone_details_required_title' => __('Phone Number Required', 'product-estimator'),
                'contact_information_required_title' => __('Contact Information Required', 'product-estimator'),
                'contact_method_estimate_title' => __('How would you like to receive your estimate?', 'product-estimator'),
                'contact_method_title' => __('How would you like to be contacted?', 'product-estimator'),
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
        update_option(self::VERSION_OPTION_NAME, '2.0.16');
    }

    /**
     * Update the labels version to refresh caches
     */
    public static function update_labels_version() {
        update_option(self::VERSION_OPTION_NAME, '2.0.16');
        delete_transient('pe_frontend_labels_cache');
    }
}
