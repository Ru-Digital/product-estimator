<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

use RuDigital\ProductEstimator\Includes\LabelsMigration;

/**
 * Labels Settings Module Class
 *
 * Implements the labels settings tab functionality with vertical sub-tabs
 * for different label categories.
 *
 * @since      2.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
final class LabelsSettingsModule extends SettingsModuleWithVerticalTabsBase implements SettingsModuleInterface {

    protected $option_name = 'product_estimator_labels';
    private $label_categories = [];

    protected function set_tab_details() {
        $this->tab_id    = 'labels';
        $this->tab_title = __( 'Labels', 'product-estimator' );
        $this->section_id = 'labels_settings_section';
        $this->section_title = __( 'Manage Labels', 'product-estimator' );

        $this->label_categories = [
            'buttons' => [
                'id' => 'buttons',
                'title' => __( 'Button Labels', 'product-estimator' ),
                'description' => __( 'Labels for all buttons throughout the estimator.', 'product-estimator' ),
            ],
            'forms' => [
                'id' => 'forms',
                'title' => __( 'Form Fields', 'product-estimator' ),
                'description' => __( 'Labels for form fields, placeholders, and help text.', 'product-estimator' ),
            ],
            'messages' => [
                'id' => 'messages',
                'title' => __( 'Messages', 'product-estimator' ),
                'description' => __( 'Success, error, and confirmation messages.', 'product-estimator' ),
            ],
            'ui_elements' => [
                'id' => 'ui_elements',
                'title' => __( 'UI Elements', 'product-estimator' ),
                'description' => __( 'General user interface text and labels.', 'product-estimator' ),
            ],
            'pdf' => [
                'id' => 'pdf',
                'title' => __( 'PDF Export', 'product-estimator' ),
                'description' => __( 'Labels specific to PDF generation.', 'product-estimator' ),
            ],
        ];

        // Run migration if needed
//        LabelsMigration::migrate();
    }

    public function register_hooks() {
        parent::register_hooks(); // This registers wp_ajax_save_labels_settings through the base class

        // Add AJAX handlers for labels management
        add_action('wp_ajax_pe_export_labels', [$this, 'ajax_export_labels']);
        add_action('wp_ajax_pe_import_labels', [$this, 'ajax_import_labels']);
        add_action('wp_ajax_pe_bulk_update_labels', [$this, 'ajax_bulk_update_labels']);
        add_action('wp_ajax_pe_reset_category_labels', [$this, 'ajax_reset_category_labels']);
    }

    public function render_section_description() {
        echo "This section allows administrators to configure and manage all text labels used throughout the Product Estimator. Labels are organized into categories for easier management.";
    }

    protected function get_vertical_tabs() {
        $tabs = [];
        foreach ( $this->label_categories as $category_id => $category ) {
            $tabs[] = [
                'id'          => $category_id,
                'title'       => $category['title'],
                'description' => $category['description'] ?? '',
            ];
        }
        return $tabs;
    }

    protected function register_vertical_tab_fields( $vertical_tab_id, $page_slug_for_wp_api ) {
        $labels = $this->get_labels_for_category( $vertical_tab_id );
        $current_section_id = $this->section_id . '_' . $vertical_tab_id;

        // Create a single section for each category
        add_settings_section(
            $this->section_id . '_' . $vertical_tab_id,
            '', // No title needed as category name is already displayed
            [$this, 'render_category_description'],
            $page_slug_for_wp_api
        );

        foreach ( $labels as $label_key => $label_value ) {
            // This is the key difference - we need to store the field ID as "category[key]"
            // instead of "category_key" to match the form data structure
            $field_id = $vertical_tab_id . '[' . $label_key . ']';
            $display_id = $vertical_tab_id . '_' . $label_key; // For display/CSS purposes only
            $label_title = ucwords(str_replace('_', ' ', $label_key));

            $callback_args = [
                'id'          => $display_id, // HTML ID for the element
                'field_id'    => $field_id,   // Actual field ID for data matching
                'type'        => 'text',
                'description' => $this->get_label_description($vertical_tab_id, $label_key),
                'default'     => $label_value,
                'label_for'   => $display_id,
                'category'    => $vertical_tab_id,
                'label_key'   => $label_key,
                'value'       => $label_value, // Make sure value is set for rendering
            ];

            add_settings_field(
                $field_id, // Use the bracketed ID for the field name
                $label_title,
                [$this, 'render_label_field'],
                $page_slug_for_wp_api,
                $this->section_id . '_' . $vertical_tab_id,
                $callback_args
            );

            // Store the field using the bracketed format to match form data structure
            $this->store_field_for_sub_tab($vertical_tab_id, $field_id, $callback_args);
        }

        // Log debug info to ensure fields are being registered properly
        error_log("Registered " . count($labels) . " fields for vertical tab {$vertical_tab_id}");
    }


        public function render_label_field($args) {
            $options = get_option($this->option_name, []);
            $category = $args['category'] ?? '';
            $label_key = $args['label_key'] ?? '';

            // Get the current value with fallback to default
            $current_value = $options[$category][$label_key] ?? $args['default'] ?? '';

            // Field name for nested structure - this is the critical part
            // We need to use $this->option_name[$category][$label_key] format
            $field_name = $this->option_name . "[" . $category . "][" . $label_key . "]";

            // Create render args with the proper field_id from callback_args if available
            $render_args = $args;
            if (isset($args['field_id'])) {
                $render_args['id'] = $args['field_id']; // Use the bracketed ID format
            }

            // Call parent render_field with our custom field name
            parent::render_field($render_args, $current_value, $field_name);

            // Add description if provided
            if (!empty($args['description'])) {
                printf('<p class="description">%s</p>', esc_html($args['description']));
            }

            // Add preview if applicable
            $this->render_label_preview($category, $label_key);
        }

        public function render_category_description() {
        echo '<p class="description">Update the text labels for this category. Changes will be reflected throughout the estimator.</p>';
          }

    public function render_label_preview($category, $label_key) {
        // Show a preview of where this label is used
        $usage = $this->get_label_usage($category, $label_key);
        if (!empty($usage)) {
            echo '<div class="label-usage-preview">';
            echo '<strong>Used in:</strong> ' . esc_html($usage);
            echo '</div>';
        }
    }

    private function get_labels_for_category( $category ) {
        // Get saved labels from DB
        $saved_labels = get_option($this->option_name, []);

        // Get default structure
        $default_labels = LabelsMigration::get_default_structure();

        // If category doesn't exist in saved labels, use defaults
        if (!isset($saved_labels[$category])) {
            return $default_labels[$category] ?? [];
        }

        // Merge default and saved labels - this ensures new labels are included
        // Default labels come first, then are overridden by any saved labels
        $merged_labels = array_merge(
            $default_labels[$category] ?? [],
            $saved_labels[$category] ?? []
        );

        return $merged_labels;
    }

    private function get_label_description($category, $label_key) {
        $descriptions = [
            'buttons' => [
                'similar_products' => 'Text for the similar products expand button',
                'product_includes' => 'Text for the product includes expand button',
                'save_estimate' => 'Text for the save estimate button',
                'print_estimate' => 'Text for the print estimate button',
                'create_new_estimate' => 'Text for the create new estimate button',
                'confirm' => 'Text for the confirm button in dialogs',
                'cancel' => 'Text for the cancel button in dialogs',
                'contact_email' => 'Text for the email contact option button',
                'contact_phone' => 'Text for the phone contact option button',
                'delete_estimate' => 'Text for the delete estimate button',
                'remove_room' => 'Text for the remove room button',
                'request_contact' => 'Text for the request contact button',
                'request_copy' => 'Text for the request copy button',
                'add_new_room' => 'Text for the add new room button',
                'create_estimate' => 'Text for the submit button to create a new estimate',
                'save_changes' => 'Text for the button to save changes to form fields',
                'add_to_estimate' => 'Text for the button to add product to estimate (in modal dialog)',
                'add_to_estimate_single_product' => 'Text for the button to add product to estimate (on single product pages)',
                'remove_product' => 'Text for the remove product button',
                'add_product' => 'Text for the add product button',
                'edit_product' => 'Text for the edit product button',
                'continue' => 'Text for the continue button in multi-step flows and customer details dialog',
                'suggested_products' => 'Text for the suggested products expand button',
                'replace_product' => 'Text for the replace product button in selection dialog',
                'add_room' => 'Text for the add room button in new room form',
                'add_to_cart' => 'Text for the add to cart button in WooCommerce integration',
                'show_more' => 'Text for the show more/expand button for collapsible content',
                'show_less' => 'Text for the show less/collapse button for expanded content',
                'close' => 'Text for the close button in dialogs and modals',
                'save' => 'Text for the generic save button',
                'delete' => 'Text for the generic delete button across all interfaces',
                'edit' => 'Text for the generic edit button across all interfaces',
                'add' => 'Text for the generic add button (product lists, suggestion carousels)',
                'remove' => 'Text for the generic remove button used to remove items from lists and collections',
                'update' => 'Text for the update button when modifying records or settings',
                'search' => 'Text for the search button in product search interfaces',
                'filter' => 'Text for the filter button in product filtering interfaces',
                'reset' => 'Text for the reset button to clear form inputs and filters',
                'apply' => 'Text for the apply button to apply changes or filters',
                'additional_products' => 'Text for the additional products toggle button',
                'ok' => 'Text for simple acknowledgment button in dialogs and alerts',
                'upgrade' => 'Text for product upgrade buttons in additional product options',
                'replace_product' => 'Text for the button to replace a product with another',
                'remove_product_aria' => 'Accessibility text for product removal buttons (screen readers)',
                'select_additional_product' => 'Text for button to select an additional product',
                'selected_additional_product' => 'Text for button indicating an additional product is selected',
                'add_product_and_room' => 'Text for button to add both product and room at once',
                'back_to_products' => 'Text for button to return to product selection',
                'view_details' => 'Text for button to view detailed product information',
                'back_to_rooms' => 'Text for button to return to room selection',
                'start_new_estimate' => 'Text for button to begin a new estimate',
                'select_product' => 'Text for button to select a product',
                'select_room' => 'Text for button to select a room',
                'add_note' => 'Text for button to add a note to a product',
                'submit' => 'Text for generic form submission button',
                'more_options' => 'Text for button to show additional options',
                'back' => 'Text for navigation back button',
                'next' => 'Text for navigation next button',
                'done' => 'Text for completion button in multi-step flows',
                'select_all' => 'Text for button to select all items in a list',
                'select_none' => 'Text for button to deselect all items in a list',
                'toggle_details' => 'Text for button to show/hide additional details',
                'add_to_room' => 'Text for button to add a product to a room',
                'add_product_to_room' => 'Text for button to add a product to an existing room',
                'replace_existing_product' => 'Text for button to replace an existing product',
                'go_back_to_room_select' => 'Text for button to return to room selection in conflict dialog',
                'add_room_and_product' => 'Text for button to create a new room and add product in one step',
            ],
            'forms' => [
                'estimate_name' => 'Label for the estimate name field',
                'customer_email' => 'Label for the customer email field',
                'placeholder_email' => 'Placeholder text for email input',
                'customer_name' => 'Label for the customer name field',
                'customer_phone' => 'Label for the customer phone field',
                'customer_postcode' => 'Label for the customer postcode field',
                'placeholder_name' => 'Placeholder text for customer name input field',
                'placeholder_phone' => 'Placeholder text for phone input',
                'placeholder_postcode' => 'Placeholder text for postcode input',
                'placeholder_estimate_name' => 'Placeholder text for estimate name input',
                'room_name' => 'Label for the room name field',
                'room_width' => 'Label for the room width field',
                'room_length' => 'Label for the room length field',
                'placeholder_room_name' => 'Placeholder text for room name input',
                'placeholder_width' => 'Placeholder text for width input',
                'placeholder_length' => 'Placeholder text for length input',
                'product_quantity' => 'Label for the product quantity field in product forms',
                'notes' => 'Label for the additional notes field',
                'quantity' => 'Label for quantity field in product forms',
                'price' => 'Label for price display in product information',
                'total' => 'Label for total price calculation',
                'subtotal' => 'Label for subtotal before additional costs',
                'tax' => 'Label for tax amount in calculations',
                'shipping' => 'Label for shipping costs in calculations',
                'discount' => 'Label for discount amounts in calculations',
                'room_dimensions' => 'Label for room dimensions section in room creation form',
                'placeholder_search' => 'Placeholder text for search input fields',
                'choose_estimate' => 'Label prompt for estimate selection dropdown',
                'select_estimate_option' => 'Default option text in estimate dropdown',
                'select_estimate' => 'Title for estimate selection form',
                'select_room' => 'Title for room selection form',
                'full_name' => 'Label for the full name field in customer details dialog',
                'email_address' => 'Label for the email address field in customer details dialog',
                'phone_number' => 'Label for the phone number field in customer details dialog',
                'choose_room' => 'Label prompt for room selection dropdown',
                'select_room_option' => 'Default option text in room dropdown',
                'placeholder_width' => 'Placeholder text for room width input field',
                'placeholder_length' => 'Placeholder text for room length input field',
            ],
            'messages' => [
                'product_added' => 'Success message shown when a product is successfully added to a room',
                'product_added_message' => 'Message displayed after successfully adding a product to a room',
                'confirm_delete' => 'Confirmation message for delete actions',
                'confirm_product_remove' => 'Confirmation message shown when removing a product from a room',
                'product_load_error' => 'Error message shown when products fail to load',
                'room_load_error' => 'Error message shown when rooms fail to load',
                'confirm_proceed' => 'Generic confirmation message for dialog prompts',
                'select_options' => 'Message prompting user to select product options',
                'estimate_saved' => 'Message shown when an estimate is saved successfully',
                'estimate_deleted' => 'Message shown when an estimate is deleted',
                'room_added' => 'Message shown when a room is added successfully',
                'room_deleted' => 'Message shown when a room is deleted',
                'showing_results' => 'Message shown when displaying search results',
                'product_removed' => 'Message shown when a product is removed from estimate',
                'email_sent' => 'Message shown when email has been sent successfully',
                'settings_saved' => 'Message shown when settings are saved successfully',
                'room_created' => 'Message shown when a new room is created',
                'general_error' => 'Generic error message for unexpected issues',
                'save_failed' => 'Error message when saving operation fails',
                'invalid_email' => 'Validation error for invalid email addresses',
                'invalid_phone' => 'Validation error for invalid phone numbers',
                'required_field' => 'Validation error for required fields',
                'network_error' => 'Error message when network connection fails or API requests fail',
                'permission_denied' => 'Error message for insufficient permissions to perform an action',
                'confirm_remove_product' => 'Confirmation message when removing products from room or estimate',
                'confirm_delete_room' => 'Confirmation message when deleting rooms from an estimate',
                'unsaved_changes' => 'Warning message about unsaved changes when navigating away',
                'min_length' => 'Validation error for minimum text length in text inputs',
                'max_length' => 'Validation error for maximum text length in text inputs',
                'invalid_format' => 'Validation error for incorrect format in specific fields',
                'number_required' => 'Validation error requiring numeric input in number fields',
                'product_id_required' => 'Error message shown when a product ID is missing in requests',
                'product_not_found' => 'Error message shown when a requested product cannot be found',
                'product_data_error' => 'Error message shown when product data cannot be retrieved',
                'product_data_retrieved' => 'Success message when product data is successfully retrieved',
                'pricing_helper_missing' => 'Error message when pricing calculation function is unavailable',
                'pricing_helper_file_missing' => 'Error message when pricing helper file cannot be found',
                'modal_open_error' => 'Error message shown when the modal cannot be opened properly',
                'replace_product_error' => 'Error message shown when a product replacement fails',
                'product_replaced_success' => 'Message shown when a product is successfully replaced',
                'primary_product_conflict' => 'Message shown when a product conflicts with primary product selection',
                'product_already_exists' => 'Message shown when a product already exists in the estimate',
                'additional_information_required' => 'Default message when the customer details dialog opens',
                'email_required_for_copy' => 'Message explaining why email is needed for copy requests',
                'phone_required_for_sms' => 'Message explaining why phone number is needed for SMS requests',
                'contact_email_details_required' => 'Message explaining why details are needed for email contact',
                'contact_phone_details_required' => 'Message explaining why details are needed for phone contact',
                'email_required_for_estimate' => 'Message explaining why email is needed for estimate viewing',
                'contact_method_estimate_prompt' => 'Message asking the user how they want to receive their estimate',
                'contact_method_prompt' => 'Message asking the user how they want to be contacted by the store',
                'product_conflict' => 'Message displayed when a product conflicts with an existing product',
                'confirm_product_remove_with_name' => 'Product removal confirmation with product name included',
                'product_added_success' => 'Success message shown when a product is added to a room',
                'room_created_with_product' => 'Success message when both room and product are created',
                'estimate_removed' => 'Message shown when an estimate has been removed',
            ],
            'ui_elements' => [
                'confirm_title' => 'Title text for confirmation dialogs',
                'no_estimates' => 'Message shown when no estimates exist',
                'no_rooms' => 'Message shown when no rooms exist in estimate',
                'no_products' => 'Message shown when no products exist in room',
                'price_notice' => 'Price disclaimer notice text',
                'rooms_heading' => 'Heading text for rooms section',
                'products_heading' => 'Heading text for products section',
                'select_product_options' => 'Title for product options selection dialog',
                'create_new_estimate' => 'Heading for create new estimate form',
                'your_details' => 'Heading for customer details section',
                'saved_details' => 'Heading for saved customer details section',
                'edit_your_details' => 'Heading for edit customer details form',
                'primary_product' => 'Alt text for primary product image',
                'previous' => 'Text for previous navigation button',
                'next' => 'Text for next navigation button',
                'previous_suggestions' => 'Text for previous suggestions navigation',
                'next_suggestions' => 'Text for next suggestions navigation',
                'get_started' => 'Call to action for new users',
                'expand' => 'Text for expand button on collapsible sections',
                'collapse' => 'Text for collapse button on expanded sections',
                'loading' => 'Text shown during loading operations (spinners and progress indicators)',
                'loading_variations' => 'Text shown while loading product variations in selection dialogs',
                'loading_products' => 'Text shown while loading or searching for products',
                'close_tooltip' => 'Text for tooltip close button (screen reader and aria)',
                'notes_heading' => 'Heading for notes section in product tooltips and information panels',
                'details_heading' => 'Heading for details section in product tooltips and information panels',
                'no_notes' => 'Message shown when there are no notes for a product in the details view',
                'no_results' => 'Message shown when search returns no results in product searches',
                'empty_room' => 'Message shown when a room has no products added yet',
                'empty_estimate' => 'Message shown when an estimate has no rooms added yet',
                'showing_results' => 'Text for search results count display (e.g., "Showing 5 of 20 results")',
                'page_of' => 'Text for pagination display (e.g., "Page 1 of 5")',
                'sort_by' => 'Label for sorting dropdown in product listings',
                'filter_by' => 'Label for filtering dropdown in product listings',
                'search_results' => 'Heading for search results section in product searches',
                'no_items' => 'Message shown when a list has no items (generic empty state)',
                'add_first_item' => 'Prompt for adding first item to empty list (call to action)',
                'learn_more' => 'Text for information/help links that reveal additional details',
                'view_all' => 'Text for link to view all items in a collapsed/truncated list',
                'hide_all' => 'Text for link to hide all items in an expanded list',
                'error_title' => 'Title used for error message dialogs throughout the application',
                'product_estimator_title' => 'Title displayed in the modal header for the product estimator',
                'modal_not_found' => 'Error message when the estimator modal cannot be loaded',
                'close' => 'Text for close buttons (screen reader and aria-label)',
                'select_options' => 'Prompt shown to user to select product options for variable products',
                'product_replaced_title' => 'Title for dialog when a product is successfully replaced',
                'primary_product_conflict_title' => 'Title for dialog when a product conflicts with primary product',
                'product_already_exists_title' => 'Title for dialog when a product already exists in the estimate',
                'add_new_room_title' => 'Title for the add new room form',
                'complete_details_title' => 'Title for customer details collection dialog',
                'email_details_required_title' => 'Title for email details collection dialog',
                'phone_details_required_title' => 'Title for phone details collection dialog',
                'contact_information_required_title' => 'Title for contact information collection dialog',
                'contact_method_estimate_title' => 'Title for estimate delivery method selection dialog',
                'contact_method_title' => 'Title for contact method selection dialog',
                'product_added_title' => 'Title for product added success dialog',
                'room_created_title' => 'Title for room created success dialog',
                'success_title' => 'Generic title for success dialogs',
                'dialog_title_product_added' => 'Title for product added dialog',
                'dialog_title_product_removed' => 'Title for product removed dialog',
                'dialog_title_product_replaced' => 'Title for product replaced dialog',
                'dialog_title_estimate_removed' => 'Title for estimate removed dialog',
                'dialog_title_delete_estimate' => 'Title for delete estimate confirmation dialog',
                'dialog_title_estimate_saved' => 'Title for estimate saved dialog',
                'remove_product_title' => 'Title for remove product confirmation dialog',
                'remove_room_title' => 'Title for remove room confirmation dialog',
                'remove_room_message' => 'Message shown in remove room confirmation dialog',
                'product_conflict_title' => 'Title for product conflict dialog',
                'select_estimate_title' => 'Title for estimate selection dialog',
                'select_room_title' => 'Title for room selection dialog',
                'no_estimates_available' => 'Message shown when no estimates are available',
                'no_rooms_available' => 'Message shown when no rooms are available',
                'details_toggle' => 'Text for button to show product details',
                'details_toggle_hide' => 'Text for button to hide product details',
                'includes_heading' => 'Heading for product inclusions section',
                'no_includes' => 'Message shown when product has no inclusions',
                'variation_options' => 'Title for product variation options section',
                'price_range' => 'Label for product price range display',
                'single_price' => 'Label for single product price display',
                'per_unit' => 'Text for unit price indication',
                'total_price' => 'Label for total price display',
                'estimate_summary' => 'Title for estimate summary section',
                'room_summary' => 'Title for room summary section',
                'product_summary' => 'Title for product summary section',
            ],
            'pdf' => [
                'title' => 'Title for the PDF document',
                'customer_details' => 'Heading for customer details section in PDF',
                'estimate_summary' => 'Heading for estimate summary section in PDF',
                'price_range' => 'Label for price range in PDF',
                'from' => 'Label for minimum price in range',
                'to' => 'Label for maximum price in range',
                'date' => 'Label for date in PDF',
                'page' => 'Label for page number in PDF',
                'of' => 'Text between page numbers in pagination',
                'company_name' => 'Company name in PDF header',
                'company_phone' => 'Company phone number in PDF',
                'company_email' => 'Company email in PDF',
                'company_website' => 'Company website in PDF',
                'footer_text' => 'Text in PDF footer',
                'disclaimer' => 'Disclaimer text in PDF footer',
            ],
            // Add more descriptions as needed
        ];

        return $descriptions[$category][$label_key] ?? '';
    }

    private function get_label_usage($category, $label_key) {
        $usage_map = [
            'buttons' => [
                'similar_products' => 'Room template, product display',
                'product_includes' => 'Room template, product details',
                'save_estimate' => 'Estimate form, main toolbar',
                'create_new_estimate' => 'Empty estimates state, estimate creation',
                'confirm' => 'Confirmation dialogs, form submissions',
                'cancel' => 'Confirmation dialogs, form cancellations',
                'contact_email' => 'Contact selection dialog',
                'contact_phone' => 'Contact selection dialog',
                'delete_estimate' => 'Estimate list, estimate management',
                'remove_room' => 'Room template, room management',
                'request_contact' => 'Estimate actions menu',
                'request_copy' => 'Estimate actions menu',
                'add_new_room' => 'Estimate view, room management',
                'print_estimate' => 'Estimate actions menu, toolbar',
                'create_estimate' => 'New estimate form, submit button',
                'save_changes' => 'Customer details form, edit actions',
                'add_to_estimate' => 'Product selection dialog, confirm button',
                'add_to_estimate_single_product' => 'Single product pages, "Add to Estimate" button',
                'add_product' => 'Room management, product actions',
                'remove_product' => 'Product item, room management',
                'edit_product' => 'Product item, product management',
                'continue' => 'Multi-step forms, customer details dialog, navigation',
                'suggested_products' => 'Room template, suggestions section',
                'add_room' => 'New room form, form submissions',
                'add_to_cart' => 'Product detail, WooCommerce integration',
                'show_more' => 'Collapsible content areas, expandable sections',
                'show_less' => 'Expanded content areas, collapsible sections',
                'close' => 'Dialogs, modals, notification popups',
                'save' => 'Generic forms, edit interfaces',
                'delete' => 'Item removal interfaces, confirmation dialogs',
                'edit' => 'Customer details, item editing interfaces',
                'add' => 'Generic add buttons, item creation interfaces',
                'remove' => 'Generic remove buttons used throughout the interface for item removal',
                'update' => 'Form submission, record updates',
                'search' => 'Search interfaces, product search',
                'filter' => 'Product filtering, search results',
                'reset' => 'Form reset, filter clearing',
                'apply' => 'Settings forms, filter applications',
                'additional_products' => 'Product extras section, upsells',
                'ok' => 'Confirmation dialogs, error notifications, success messages',
                'upgrade' => 'Additional product options, product upgrade tiles',
                'replace_product' => 'Product replacement dialog, similar products section',
                'remove_product_aria' => 'Product item component, accessibility labels',
                'select_additional_product' => 'Additional products section, selection button',
                'selected_additional_product' => 'Additional products section, selected state button',
                'add_product_and_room' => 'New room form, submission button',
                'back_to_products' => 'Navigation, product selection flow',
                'view_details' => 'Product item, details expansion button',
                'back_to_rooms' => 'Navigation, room selection flow',
                'start_new_estimate' => 'Estimate action menu, new estimate creation',
                'select_product' => 'Product selection interface, prompt button',
                'select_room' => 'Room selection interface, prompt button',
                'add_note' => 'Product details, note addition button',
                'submit' => 'Form submission, generic action button',
                'more_options' => 'Product interface, additional options button',
                'back' => 'Navigation, return to previous screen',
                'next' => 'Navigation, proceed to next screen',
                'done' => 'Form completion, finalization button',
                'select_all' => 'Multi-select interfaces, selection control',
                'select_none' => 'Multi-select interfaces, deselection control',
                'toggle_details' => 'Product details, visibility toggle',
                'add_to_room' => 'Product selection, room addition button',
                'add_product_to_room' => 'Room management, product addition button',
                'replace_existing_product' => 'Product conflict dialog, replacement option',
                'go_back_to_room_select' => 'Product conflict dialog, cancel option',
                'add_room_and_product' => 'New room flow, combined action button',
            ],
            'forms' => [
                'estimate_name' => 'New estimate form, edit estimate form',
                'customer_email' => 'Customer details form',
                'customer_name' => 'Customer details form, profile fields',
                'customer_phone' => 'Customer details form, contact information',
                'customer_postcode' => 'Customer details form, address information',
                'placeholder_name' => 'Customer name input field',
                'placeholder_email' => 'Customer email input field',
                'placeholder_phone' => 'Customer phone input field',
                'placeholder_postcode' => 'Customer postcode input field',
                'placeholder_estimate_name' => 'Estimate name input field',
                'room_name' => 'New room form, room details',
                'room_width' => 'New room form, room dimensions',
                'room_length' => 'New room form, room dimensions',
                'placeholder_room_name' => 'Room name input field',
                'placeholder_width' => 'Room width input field',
                'placeholder_length' => 'Room length input field',
                'product_quantity' => 'Product details form, quantity field',
                'notes' => 'Product notes form, additional information',
                'quantity' => 'Product detail form, quantity selector',
                'price' => 'Product display, price field labels',
                'total' => 'Estimate summary, totals calculation',
                'subtotal' => 'Estimate summary, price calculations',
                'tax' => 'Estimate summary, price calculations',
                'shipping' => 'Estimate summary, additional costs',
                'discount' => 'Estimate summary, price reductions',
                'room_dimensions' => 'Room form, dimensions section header in new room creation form',
                'placeholder_search' => 'Search input field placeholder text in product search interfaces',
                'choose_estimate' => 'Estimate selection form, dropdown prompt in estimate selection dialog',
                'select_estimate_option' => 'Estimate dropdown, default option in estimate selection interfaces',
                'select_estimate' => 'Estimate selection form, heading in estimate selection modal',
                'select_room' => 'Room selection form, heading in room selection interfaces',
                'full_name' => 'Customer details dialog, name field label in contact information forms',
                'email_address' => 'Customer details dialog, email field label in customer details forms',
                'phone_number' => 'Customer details dialog, phone field label in contact forms',
                'choose_room' => 'Room selection dropdown, prompt text in room selection interfaces',
                'select_room_option' => 'Room selection dropdown, default option shown in empty room dropdowns',
                'placeholder_width' => 'Room dimensions form, width input field placeholder',
                'placeholder_length' => 'Room dimensions form, length input field placeholder',
            ],
            'messages' => [
                'product_added' => 'Product management notifications, success messages shown when adding products',
                'product_added_message' => 'Product addition notification, displayed when successfully adding a product to a room',
                'confirm_delete' => 'Delete confirmation dialogs, item removal flows',
                'product_load_error' => 'Product error template, loading failure notifications',
                'room_load_error' => 'Room error template, room loading failure notifications',
                'confirm_proceed' => 'Generic confirmation dialogs, user action confirmations',
                'select_options' => 'Product selection dialog instructions, variation selection',
                'estimate_saved' => 'Estimate saved notification, success messages',
                'estimate_deleted' => 'Estimate deletion notification, success messages',
                'room_added' => 'Room creation notification, success dialogs',
                'room_deleted' => 'Room deletion notification, success messages',
                'showing_results' => 'Search results component, product listings',
                'product_removed' => 'Notification after product removal, success messages',
                'email_sent' => 'Email notification success message, confirmation dialogs',
                'settings_saved' => 'Settings page, save confirmation messages',
                'room_created' => 'Room creation success notification, confirmation dialogs',
                'general_error' => 'Generic error notifications, fallback error messages',
                'save_failed' => 'Form submission error notification, save operation failures',
                'invalid_email' => 'Form validation, email fields validation errors',
                'invalid_phone' => 'Form validation, phone number fields validation errors',
                'required_field' => 'Form validation, empty required fields error message',
                'network_error' => 'AJAX request error handling, connection failure notifications',
                'permission_denied' => 'Access control error messages, authorization failures',
                'confirm_remove_product' => 'Product removal confirmation dialog, deletion flows',
                'confirm_product_remove' => 'Product removal confirmation dialog, displayed when removing products from rooms',
                'confirm_delete_room' => 'Room deletion confirmation dialog, removal flows',
                'confirm_delete_estimate' => 'Confirmation message shown when deleting an estimate from the list',
                'product_add_error' => 'Error message shown when a product fails to be added to a room',
                'product_remove_error' => 'Error message shown when a product cannot be removed from a room',
                'unsaved_changes' => 'Navigation warning, form state change detection',
                'min_length' => 'Form validation, text length validation for minimum requirements',
                'max_length' => 'Form validation, text length validation for maximum limits',
                'invalid_format' => 'Form validation, format validation for specific patterns',
                'number_required' => 'Form validation, numeric fields input validation',
                'product_id_required' => 'AJAX handling, product data requests validation',
                'product_not_found' => 'Product retrieval, error notifications for missing products',
                'product_data_error' => 'AJAX requests, product data loading error notifications',
                'product_data_retrieved' => 'AJAX responses, product data success confirmations',
                'pricing_helper_missing' => 'AJAX error handling, pricing calculation system errors',
                'pricing_helper_file_missing' => 'AJAX error handling, file dependency errors',
                'modal_open_error' => 'Modal system, error handling for initialization failures',
                'replace_product_error' => 'Product replacement flows, error notifications for failures',
                'product_replaced_success' => 'Product replacement success notification, confirmation dialogs',
                'primary_product_conflict' => 'Product conflict warning dialog, category conflict notifications',
                'product_already_exists' => 'Product duplicate warning dialog, duplicate detection',
                'additional_information_required' => 'Customer details dialog, default explanation message',
                'email_required_for_copy' => 'Email request dialog, explanation message for email requirement',
                'phone_required_for_sms' => 'SMS request dialog, explanation message for phone requirement',
                'contact_email_details_required' => 'Email contact dialog, explanation message for contact details',
                'contact_phone_details_required' => 'Phone contact dialog, explanation message for contact details',
                'email_required_for_estimate' => 'Estimate viewing dialog, explanation message for email requirement',
                'contact_method_estimate_prompt' => 'Estimate delivery dialog, instruction message for delivery options',
                'contact_method_prompt' => 'Store contact dialog, instruction message for contact preferences',
                'product_conflict' => 'Product conflict dialog, explanation message for product conflicts',
                'confirm_product_remove_with_name' => 'Product removal dialog, confirmation message with product name',
                'product_added_success' => 'Product addition dialog, success message for product additions',
                'room_created_with_product' => 'Room and product creation dialog, success message for combined actions',
                'estimate_removed' => 'Estimate removal notification, success message for estimate deletion',
            ],
            'ui_elements' => [
                'confirm_title' => 'Confirmation dialog header, displayed at the top of all confirmation dialogs',
                'no_estimates' => 'Empty estimates template, shown when no estimates exist in the system',
                'no_rooms' => 'Empty rooms template, displayed when an estimate contains no rooms',
                'no_products' => 'Empty products template, shown when a room contains no products',
                'price_notice' => 'Room item template, price disclaimer shown below product prices',
                'rooms_heading' => 'Estimate view, rooms section heading at the top of the rooms list',
                'products_heading' => 'Room view, products section heading above the product list',
                'select_product_options' => 'Product selection dialog header, displayed when selecting product variations',
                'create_new_estimate' => 'New estimate form heading, shown at the top of the estimate creation form',
                'your_details' => 'Customer details section heading, displayed in customer information forms',
                'saved_details' => 'Saved customer details heading, shown when displaying stored customer information',
                'edit_your_details' => 'Edit customer details form heading, displayed when editing customer information',
                'primary_product' => 'Room template, product image alt text for accessibility and screen readers',
                'previous' => 'Carousel controls, navigation button for moving to previous items in carousels',
                'next' => 'Carousel controls, navigation button for moving to next items in carousels',
                'previous_suggestions' => 'Suggestions carousel, navigation button for previous suggestion items',
                'next_suggestions' => 'Suggestions carousel, navigation button for next suggestion items',
                'get_started' => 'Home page, onboarding process call-to-action for new users',
                'expand' => 'Collapsible sections, UI control text for expanding collapsed content',
                'collapse' => 'Expanded sections, UI control text for collapsing expanded content',
                'loading' => 'Loading states, processing indicators shown during AJAX operations',
                'loading_variations' => 'Product selection dialog, loading indicator when fetching variations',
                'loading_products' => 'Product search interface, loading indicator when fetching products',
                'close_tooltip' => 'Tooltip component, close button text for accessibility and screen readers',
                'notes_heading' => 'Tooltip component, notes section heading in product information tooltips',
                'details_heading' => 'Tooltip component, details section heading in product information tooltips',
                'no_notes' => 'Product details panel, message shown when a product has no notes',
                'no_results' => 'Search results, empty state message when product search returns no matches',
                'empty_room' => 'Room display, empty state message when a room has no products added',
                'empty_estimate' => 'Estimate display, empty state message when an estimate has no rooms added',
                'showing_results' => 'Search results, count indicator showing number of results displayed',
                'page_of' => 'Pagination component, page indicator showing current page and total pages',
                'sort_by' => 'Product listings, sorting control label in product search interfaces',
                'filter_by' => 'Product listings, filtering control label in product search interfaces',
                'search_results' => 'Search results page, heading displayed above product search results',
                'no_items' => 'Generic lists, empty state message used across various empty list states',
                'add_first_item' => 'Empty lists, call to action prompt to add first item to an empty list',
                'learn_more' => 'Informational sections, additional details link text for help content',
                'view_all' => 'Section with collapsed content, expansion link text to show all items',
                'hide_all' => 'Section with expanded content, collapse link text to hide expanded items',
                'error_title' => 'Error dialog header, notification components for error messages',
                'product_estimator_title' => 'Modal header, application title displayed at the top of the main modal',
                'modal_not_found' => 'Error handling, modal initialization failure message',
                'close' => 'Modal header, dialogs, accessibility labels for close buttons',
                'select_options' => 'Product variation dialog, selection prompts for product options',
                'product_replaced_title' => 'Product replacement success dialog, header for successful product replacements',
                'primary_product_conflict_title' => 'Product conflict dialog, header for primary product category conflicts',
                'product_already_exists_title' => 'Product already exists dialog, header for duplicate product warnings',
                'product_exists_title' => 'Title shown in dialog when attempting to add a product that already exists in room',
                'add_new_room_title' => 'New room form, heading displayed at the top of the room creation form',
                'complete_details_title' => 'Customer details dialog, header for print/view estimate flows',
                'email_details_required_title' => 'Customer details dialog, header for email delivery flows',
                'phone_details_required_title' => 'Customer details dialog, header for SMS notification flows',
                'contact_information_required_title' => 'Customer details dialog, header for store contact request flows',
                'contact_method_estimate_title' => 'Contact method dialog, header for estimate delivery method selection',
                'contact_method_title' => 'Contact method dialog, header for store contact method selection',
                'product_added_title' => 'Product added dialog, success header when a product is added to a room',
                'room_created_title' => 'Room created dialog, success header when a new room is created',
                'success_title' => 'Generic success dialog, header used for general successful operations',
                'dialog_title_product_added' => 'Product added dialog, header for product addition confirmation',
                'dialog_title_product_removed' => 'Product removed dialog, header for product removal confirmation',
                'dialog_title_product_replaced' => 'Product replaced dialog, header for product replacement confirmation',
                'dialog_title_estimate_removed' => 'Estimate removed dialog, header for estimate deletion confirmation',
                'dialog_title_delete_estimate' => 'Delete estimate dialog, confirmation header for estimate deletion',
                'dialog_title_estimate_saved' => 'Estimate saved dialog, success header for estimate save confirmation',
                'remove_product_title' => 'Remove product dialog, confirmation header for product removal',
                'remove_room_title' => 'Remove room dialog, confirmation header for room deletion',
                'product_conflict_title' => 'Product conflict dialog, header for product conflict resolution',
                'product_exists_title' => 'Product already exists dialog, header for duplicate product detection',
                'select_estimate_title' => 'Estimate selection dialog, header for the estimate selection interface',
                'select_room_title' => 'Room selection dialog, header for the room selection interface',
                'no_estimates_available' => 'Estimate selection dialog, empty state message when no estimates exist',
                'no_rooms_available' => 'Room selection dialog, empty state message when no rooms exist',
                'details_toggle' => 'Product details toggle, show state label for expanding product details',
                'details_toggle_hide' => 'Product details toggle, hide state label for collapsing product details',
                'includes_heading' => 'Product details panel, inclusions section heading for product inclusions',
                'no_includes' => 'Product details panel, empty inclusions message when no inclusions exist',
                'variation_options' => 'Product selection dialog, variations section heading for product options',
                'price_range' => 'Product details, price range label for variable-priced products',
                'single_price' => 'Product details, single price label for fixed-price products',
                'per_unit' => 'Product pricing display, unit price indicator for unit-based pricing',
                'total_price' => 'Product pricing display, total price label for calculated final prices',
                'estimate_summary' => 'Estimate view, summary section heading for estimate overview',
                'room_summary' => 'Room view, summary section heading for room overview',
                'product_summary' => 'Product details, summary section heading for product overview',
                'remove_room_message' => 'Remove room dialog, confirmation message for room deletion',
                'product_details' => 'Product item, detailed information section heading shown when viewing product details',
                'room' => 'Label for room in product context, used in room selection interfaces and headers',
                'products' => 'Plural label for products in lists and headings throughout the interface',
                'variations' => 'Label for product variations section in product selection interfaces',
                'select_variation' => 'Label for variation selection prompt in variable product selection',
                'add_to_room' => 'Label for button/action to add product to room in product selection flows',
                'manage_estimate' => 'Label for estimate management section in estimate management interfaces',
                'product_selection' => 'Label for product selection interface in product browsing flows',
                'selected_rooms' => 'Label for list of selected rooms in room selection interfaces',
                'modal_header_title' => 'Title for the modal header displayed at the top of the main modal',
                'modal_close' => 'Label for modal close button in the modal header (accessibility text)',
                'modal_not_found' => 'Error message displayed when the estimator modal cannot be loaded or found',
                'close_tooltip' => 'Text for tooltip close button used by screen readers and accessibility tools',
                'notes_heading' => 'Heading displayed at the top of the notes section in product information tooltips',
                'details_heading' => 'Heading displayed at the top of the details section in product information tooltips',
            ],
            'pdf' => [
                'title' => 'PDF document, main title header displayed at the top of each PDF document',
                'customer_details' => 'PDF document, customer info section heading in the document header',
                'estimate_summary' => 'PDF document, estimate summary section heading at the start of the summary',
                'price_range' => 'PDF document, price range label for variable-priced products in PDF exports',
                'from' => 'PDF document, minimum price label in price ranges for variable products',
                'to' => 'PDF document, maximum price label in price ranges for variable products',
                'date' => 'PDF document, date field label shown with the estimate creation date',
                'page' => 'PDF document, page number label in the document footer pagination',
                'of' => 'PDF document, page count indicator used between page numbers in pagination',
                'company_name' => 'PDF document, company info header displayed in the document header',
                'company_phone' => 'PDF document, company contact info shown in the document header',
                'company_email' => 'PDF document, company contact info shown in the document header',
                'company_website' => 'PDF document, company contact info shown in the document header',
                'footer_text' => 'PDF document, footer message displayed at the bottom of each page',
                'disclaimer' => 'PDF document, legal disclaimer text shown in the document footer',
            ],
            // Add more usage mappings
        ];

        return $usage_map[$category][$label_key] ?? '';
    }

    public function render_vertical_tabs_sidebar() {
        ?>
        <div class="pe-vtabs-sidebar-panel label-management-tools">
            <h3><?php esc_html_e( 'Label Management', 'product-estimator' ); ?></h3>

            <div class="label-tools-section">
                <h4><?php esc_html_e( 'Quick Actions', 'product-estimator' ); ?></h4>
                <button type="button" class="button" id="export-labels">
                    <?php esc_html_e( 'Export Labels', 'product-estimator' ); ?>
                </button>
                <button type="button" class="button" id="import-labels">
                    <?php esc_html_e( 'Import Labels', 'product-estimator' ); ?>
                </button>
                <input type="file" id="import-file" style="display: none;" accept=".json" />
                <button type="button" class="button" id="reset-category-defaults">
                    <?php esc_html_e( 'Reset Category to Defaults', 'product-estimator' ); ?>
                </button>
            </div>


            <div class="label-bulk-edit-section" style="display: none;">
                <h4><?php esc_html_e( 'Bulk Edit', 'product-estimator' ); ?></h4>
                <div id="bulk-edit-items"></div>
                <button type="button" class="button button-primary" id="apply-bulk-edits">
                    <?php esc_html_e( 'Apply Changes', 'product-estimator' ); ?>
                </button>
                <button type="button" class="button" id="cancel-bulk-edit">
                    <?php esc_html_e( 'Cancel', 'product-estimator' ); ?>
                </button>
            </div>

            <div class="label-info-section">
                <h4><?php esc_html_e( 'Information', 'product-estimator' ); ?></h4>
                <p><?php esc_html_e( 'Labels are automatically cached for performance. Changes will be reflected immediately on the frontend.', 'product-estimator' ); ?></p>
                <p>
                    <strong><?php esc_html_e( 'Version:', 'product-estimator' ); ?></strong>
                    <?php echo esc_html(get_option('product_estimator_labels_version', '2.0.0')); ?>
                </p>
            </div>
        </div>
        <?php
    }

    protected function get_js_context_name() {
        return 'labelSettings';
    }

    protected function get_module_specific_script_data() {
        $data = [
            'option_name'         => $this->option_name,
            'defaultSubTabId'     => 'buttons',
            'ajaxActionPrefix'    => 'save_' . $this->tab_id,
            'categories'          => array_keys($this->label_categories),
            'managementNonce'     => wp_create_nonce('pe_labels_management'),
        ];

        $data['i18n'] = [
            'saveSuccess' => __('Label settings saved successfully.', 'product-estimator'),
            'saveError'   => __('Error saving label settings.', 'product-estimator'),
            'resetConfirm' => __('Are you sure you want to reset this category to default values?', 'product-estimator'),
            'exportSuccess' => __('Labels exported successfully.', 'product-estimator'),
            'importSuccess' => __('Labels imported successfully.', 'product-estimator'),
            'importError' => __('Error importing labels. Please check the file format.', 'product-estimator'),
            'bulkUpdateSuccess' => __('Labels updated successfully.', 'product-estimator'),
            'bulkUpdateError' => __('Error updating labels.', 'product-estimator'),
            'confirmImport' => __('This will replace all existing labels. Are you sure?', 'product-estimator'),
        ];

        return $data;
    }

    public function enqueue_scripts() {
        // Make sure to provide the script data
        $this->provide_script_data_for_localization();

        // The LabelsManagement module is bundled into the main admin script via webpack
        // No need to enqueue it separately
    }



    /**
     * Get fields for a given context (sub-tab) in a format compatible with the parent class methods.
     * This method is specially designed to handle the nested category[key] format used in the labels settings.
     *
     * @since    2.0.0
     * @access   protected
     * @param    string|null $context_id    The sub_tab_id (category name)
     * @return   array       Field definitions for the specified context
     */
    protected function get_fields_for_context($context_id = null) {
        if ($context_id === null) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(get_class($this) . ': get_fields_for_context called with null context_id for labels module.');
            }
            return []; // Return empty array when context is missing
        }

        $context_fields = [];
        $category_labels = $this->get_labels_for_category($context_id);

        // For each label in this category, create a field definition
        foreach ($category_labels as $label_key => $label_value) {
            // Important: For the context fields, use just the label_key as the field_id
            // This is because the handle_ajax_save method expects to find these keys directly in the input data
            $display_id = $context_id . '_' . $label_key;

            $context_fields[$label_key] = [
                'id' => $display_id,              // HTML ID for the element
                'field_id' => $label_key,         // Key for matching in validation
                'type' => 'text',                 // All labels are text fields
                'description' => $this->get_label_description($context_id, $label_key),
                'default' => $label_value,
                'label_for' => $display_id,
                'category' => $context_id,
                'label_key' => $label_key,
                'value' => $label_value,
                'sub_tab_id' => $context_id       // Required for parent class filtering
            ];
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('LabelsSettingsModule::get_fields_for_context for ' . $context_id . ' returning ' . count($context_fields) . ' fields');
        }

        return $context_fields;
    }

    /**
     * Override the handle_ajax_save method from the parent class to properly handle the nested structure
     * of the labels settings.
     */
    public function handle_ajax_save() {
        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('--- AJAX SAVE START (' . get_class($this) . ') ---'); }

        if (!isset($_POST['nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'product_estimator_settings_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed', 'product-estimator')), 403); exit;
        }
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('You do not have permission to change these settings', 'product-estimator')), 403); exit;
        }
        if (!isset($_POST['form_data'])) {
            if (defined('WP_DEBUG') && WP_DEBUG) { error_log('form_data not in POST.'); }
            wp_send_json_error(array('message' => __('No form data received', 'product-estimator')), 400); exit;
        }

        parse_str(wp_unslash($_POST['form_data']), $parsed_form_data);
        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('Parsed form_data: ' . print_r($parsed_form_data, true)); }

        // Get the current category (sub-tab) being updated
        $current_context_id = isset($_POST['sub_tab_id']) ? sanitize_key($_POST['sub_tab_id']) : null;
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Attempted to read "sub_tab_id" from POST. Value for $current_context_id: "' .
                ($current_context_id === null ? 'NULL' : $current_context_id) . '"');
        }

        if (empty($current_context_id) || !isset($this->label_categories[$current_context_id])) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(get_class($this) . ': AJAX save error - $current_context_id is invalid for labels module.');
            }
            wp_send_json_error(['message' => __('Error: Invalid category context.', 'product-estimator')]); exit;
        }

        // Get the submission data for the current category
        $category_data = $parsed_form_data[$this->option_name][$current_context_id] ?? [];
        if (empty($category_data)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(get_class($this) . ': AJAX save error - No data found for category ' . $current_context_id);
            }
            wp_send_json_error(['message' => __('Error: No data received for this category.', 'product-estimator')]); exit;
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Category data for validation: ' . print_r($category_data, true));
        }

        // Get existing options to merge with
        $existing_options = get_option($this->option_name, []);
        if (!is_array($existing_options)) { $existing_options = []; }
        $new_options = $existing_options;

        // Ensure the category exists in the options
        if (!isset($new_options[$current_context_id])) {
            $new_options[$current_context_id] = [];
        }

        // Get all default labels for this category to ensure we don't lose any new ones
        $default_labels = LabelsMigration::get_default_structure();
        $default_category_labels = $default_labels[$current_context_id] ?? [];

        // First, add any default labels not in the saved options (preserved across saves)
        foreach ($default_category_labels as $key => $value) {
            if (!isset($new_options[$current_context_id][$key])) {
                $new_options[$current_context_id][$key] = $value;
            }
        }

        // Then process and sanitize the submitted data
        foreach ($category_data as $label_key => $label_value) {
            $new_options[$current_context_id][$label_key] = sanitize_text_field($label_value);
        }

        // Save the updated options
        update_option($this->option_name, $new_options);

        // Increment version for cache busting
        update_option('product_estimator_labels_version', time());

        // Clear caches
        delete_transient('pe_frontend_labels_cache');

        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('--- AJAX SAVE SUCCESS (' . get_class($this) . ') ---'); }
        wp_send_json_success([
            'message' => sprintf(
                __('%s labels saved successfully.', 'product-estimator'),
                $this->label_categories[$current_context_id]['title']
            )
        ]);
        exit;
    }

    public function validate_settings($input, $fields = array()) {
        error_log('LabelSettingsModule::validate_settings called with input: ' . print_r($input, true));

        // Get existing options to merge with
        $existing_options = get_option($this->option_name, []);
        $validated = $existing_options;

        // Get default structure to ensure new labels are included
        $default_labels = LabelsMigration::get_default_structure();

        // With the new field name structure, input should be in nested format:
        // { buttons: { save: "Save", cancel: "Cancel", ... }, forms: { ... } }

        // Process the input data
        foreach ($input as $category => $values) {
            // Only process valid categories
            if (isset($this->label_categories[$category])) {
                if (!isset($validated[$category])) {
                    $validated[$category] = [];
                }

                // Get default labels for this category
                $default_category_labels = $default_labels[$category] ?? [];

                // First, add any default labels not in the existing options
                foreach ($default_category_labels as $key => $value) {
                    if (!isset($validated[$category][$key])) {
                        $validated[$category][$key] = $value;
                    }
                }

                // Process all values for this category
                if (is_array($values)) {
                    foreach ($values as $label_key => $label_value) {
                        // Sanitize each label value
                        $validated[$category][$label_key] = sanitize_text_field($label_value);
                    }
                }
            }
        }

        // Increment version for cache busting
        update_option('product_estimator_labels_version', time());

        // Clear caches
        delete_transient('pe_frontend_labels_cache');

        error_log('LabelSettingsModule::validate_settings returning validated data: ' . print_r($validated, true));

        return $validated;
    }

    /**
     * Export labels to JSON format
     *
     * @param array $labels Labels array to export
     * @return string JSON string
     */
    private function export_labels($labels = null) {
        if ($labels === null) {
            $labels = get_option('product_estimator_labels', []);
        }

        $export_data = [
            'version' => get_option('product_estimator_labels_version', '2.0.0'),
            'exported_at' => current_time('mysql'),
            'labels' => $labels
        ];

        return json_encode($export_data, JSON_PRETTY_PRINT);
    }

    /**
     * AJAX handler for exporting labels
     */
    public function ajax_export_labels() {
        check_ajax_referer('pe_labels_management', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }

        $labels = get_option($this->option_name, []);
        $json_data = $this->export_labels($labels);

        wp_send_json_success([
            'filename' => 'product-estimator-labels-' . date('Y-m-d') . '.json',
            'data' => $json_data
        ]);
    }

    /**
     * Validate import data structure
     *
     * @param array $data Import data to validate
     * @return array|false Validated data or false if invalid
     */
    private function validate_import_data($data) {
        $valid_categories = ['buttons', 'forms', 'messages', 'ui_elements', 'pdf'];
        $validated_data = [];

        foreach ($data as $category => $labels) {
            if (!in_array($category, $valid_categories)) {
                continue;
            }

            if (!is_array($labels)) {
                continue;
            }

            $validated_data[$category] = [];

            foreach ($labels as $key => $value) {
                // Sanitize key to ensure it's valid
                $clean_key = sanitize_key($key);
                if ($clean_key !== '') {
                    $validated_data[$category][$clean_key] = sanitize_text_field($value);
                }
            }
        }

        return empty($validated_data) ? false : $validated_data;
    }

    /**
     * Count total labels across all categories
     *
     * @param array $labels Labels array
     * @return int Total count
     */
    private function count_labels($labels) {
        $count = 0;
        foreach ($labels as $category => $category_labels) {
            if (is_array($category_labels)) {
                $count += count($category_labels);
            }
        }
        return $count;
    }

    /**
     * Import labels from JSON string
     *
     * @param string $json_string JSON string containing labels
     * @return array Result of the import operation
     */
    private function import_labels($json_string) {
        try {
            $data = json_decode($json_string, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return ['success' => false, 'message' => 'Invalid JSON format'];
            }

            if (!isset($data['labels'])) {
                return ['success' => false, 'message' => 'No labels found in import data'];
            }

            // Validate label structure
            $validated_labels = $this->validate_import_data($data['labels']);

            if (!$validated_labels) {
                return ['success' => false, 'message' => 'Invalid label structure'];
            }

            // Get current labels and default structure
            $current_labels = get_option('product_estimator_labels', []);
            $default_labels = LabelsMigration::get_default_structure();

            // Merge in a way that preserves new labels:
            // 1. Start with defaults (ensures all default labels exist)
            // 2. Override with existing saved labels (preserves customizations)
            // 3. Override with imported labels (applies the import)
            $merged_labels = [];

            // Add all categories from defaults, current, and imported
            $all_categories = array_unique(array_merge(
                array_keys($default_labels),
                array_keys($current_labels),
                array_keys($validated_labels)
            ));

            foreach ($all_categories as $category) {
                if (!isset($merged_labels[$category])) {
                    $merged_labels[$category] = [];
                }

                // First add defaults
                if (isset($default_labels[$category]) && is_array($default_labels[$category])) {
                    $merged_labels[$category] = array_merge($merged_labels[$category], $default_labels[$category]);
                }

                // Then add current saved values
                if (isset($current_labels[$category]) && is_array($current_labels[$category])) {
                    $merged_labels[$category] = array_merge($merged_labels[$category], $current_labels[$category]);
                }

                // Finally override with imported values
                if (isset($validated_labels[$category]) && is_array($validated_labels[$category])) {
                    $merged_labels[$category] = array_merge($merged_labels[$category], $validated_labels[$category]);
                }
            }

            // Update labels with the merged result
            update_option('product_estimator_labels', $merged_labels);

            // Update version to trigger cache invalidation
            $new_version = time() . '.0.0';
            update_option('product_estimator_labels_version', $new_version);

            // Clear transients
            delete_transient('pe_labels_' . get_option('product_estimator_labels_version'));

            return [
                'success' => true,
                'message' => 'Labels imported successfully',
                'count' => $this->count_labels($merged_labels)
            ];

        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Import failed: ' . $e->getMessage()];
        }
    }

    /**
     * AJAX handler for importing labels
     */
    public function ajax_import_labels() {
        check_ajax_referer('pe_labels_management', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }

        $json_data = stripslashes($_POST['import_data'] ?? '');

        if (empty($json_data)) {
            wp_send_json_error(__('No import data provided', 'product-estimator'));
        }

        $result = $this->import_labels($json_data);

        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result['message']);
        }
    }


    /**
     * Bulk update multiple labels
     *
     * @param array $updates Array of label updates ['path' => 'new value']
     * @return array Result of the operation
     */
    private function bulk_update_labels($updates) {
        $labels = get_option('product_estimator_labels', []);
        $updated_count = 0;

        foreach ($updates as $path => $new_value) {
            $parts = explode('.', $path);
            if (count($parts) !== 2) {
                continue;
            }

            $category = $parts[0];
            $key = $parts[1];

            if (isset($labels[$category][$key])) {
                $labels[$category][$key] = sanitize_text_field($new_value);
                $updated_count++;
            }
        }

        if ($updated_count > 0) {
            update_option('product_estimator_labels', $labels);

            // Update version to trigger cache invalidation
            $new_version = time() . '.0.0';
            update_option('product_estimator_labels_version', $new_version);

            // Clear transients
            delete_transient('pe_labels_' . get_option('product_estimator_labels_version'));
        }

        return [
            'success' => true,
            'updated_count' => $updated_count
        ];
    }

    /**
     * AJAX handler for bulk updating labels
     */
    public function ajax_bulk_update_labels() {
        check_ajax_referer('pe_labels_management', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }

        $updates = $_POST['updates'] ?? [];

        if (empty($updates)) {
            wp_send_json_error(__('No updates provided', 'product-estimator'));
        }

        $result = $this->bulk_update_labels($updates);

        wp_send_json_success($result);
    }

    /**
     * AJAX handler for resetting category to defaults
     */
    public function ajax_reset_category_labels() {
        check_ajax_referer('pe_labels_management', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }

        $category = sanitize_text_field($_POST['category'] ?? '');

        if (empty($category) || !isset($this->label_categories[$category])) {
            wp_send_json_error(__('Invalid category', 'product-estimator'));
        }

        // Get default structure for this category
        $defaults = LabelsMigration::get_default_structure();
        $default_category = $defaults[$category] ?? [];

        // Get current options
        $options = get_option($this->option_name, []);

        // Reset the specific category to defaults
        $options[$category] = $default_category;

        // Save
        update_option($this->option_name, $options);

        // Clear caches
        delete_transient('pe_frontend_labels_cache');
        update_option('product_estimator_labels_version', time());

        wp_send_json_success([
            'message' => __('Category reset to defaults successfully', 'product-estimator'),
            'category' => $category,
            'labels' => $options[$category]
        ]);
    }
}
