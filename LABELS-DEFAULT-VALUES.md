# Labels Default Values

This document provides the default values for all missing labels identified in LABELS-MISSING-ELEMENTS-PLAN.md, organized according to the new label hierarchy.

## Dialog Labels

```php
// Define dialog label defaults
$dialog_labels = [
    'ui' => [
        'dialogs' => [
            'titles' => [
                'variation_selection' => __('Select Product Options', 'product-estimator'),
                'product_conflict' => __('Product Conflict', 'product-estimator'),
                'customer_details' => __('Your Details', 'product-estimator'),
            ],
            'bodies' => [
                'select_variation_options' => __('Please select options for this product:', 'product-estimator'),
                'variation_required' => __('You must select an option for all variations', 'product-estimator'),
                'variation_options_help' => __('The price may vary based on your selections', 'product-estimator'),
                'general_confirmation' => __('Are you sure you want to proceed?', 'product-estimator'),
                'confirm_delete' => __('This action cannot be undone.', 'product-estimator'),
                'product_conflict' => __('This product may conflict with products already in your estimate.', 'product-estimator'),
                'required_fields' => __('Please fill in all required fields before continuing.', 'product-estimator'),
            ],
        ],
    ],
    'buttons' => [
        'dialogs' => [
            'select_variation' => __('Select Options', 'product-estimator'),
            'close' => __('Close', 'product-estimator'),
            'confirm_action' => __('Confirm', 'product-estimator'),
            'cancel_action' => __('Cancel', 'product-estimator'),
            'proceed' => __('Proceed', 'product-estimator'),
            'try_again' => __('Try Again', 'product-estimator'),
            'continue_editing' => __('Continue Editing', 'product-estimator'),
            'discard_changes' => __('Discard Changes', 'product-estimator'),
        ],
    ],
];
```

## UI Component Labels

```php
// Define UI component label defaults
$ui_component_labels = [
    'ui' => [
        'loading' => [
            'processing_request' => __('Processing...', 'product-estimator'),
            'searching_products' => __('Searching products...', 'product-estimator'),
            'loading_products' => __('Loading products...', 'product-estimator'),
            'loading_estimates' => __('Loading estimates...', 'product-estimator'),
            'loading_rooms' => __('Loading rooms...', 'product-estimator'),
            'saving_changes' => __('Saving changes...', 'product-estimator'),
            'please_wait' => __('Please wait...', 'product-estimator'),
        ],
        'empty_states' => [
            'no_variations' => __('No variations available for this product', 'product-estimator'),
            'no_options' => __('No options available', 'product-estimator'),
            'no_estimates' => __('You don\'t have any estimates yet.', 'product-estimator'),
            'no_rooms' => __('No rooms in this estimate yet.', 'product-estimator'),
            'no_products' => __('No products in this room yet.', 'product-estimator'),
            'no_results' => __('No results found', 'product-estimator'),
            'no_similar_products' => __('No similar products found', 'product-estimator'),
            'no_includes' => __('This product has no inclusions', 'product-estimator'),
            'empty_room' => __('This room is empty', 'product-estimator'),
            'empty_estimate' => __('This estimate is empty', 'product-estimator'),
        ],
        'toggles' => [
            'show_details' => __('Show Details', 'product-estimator'),
            'hide_details' => __('Hide Details', 'product-estimator'),
            'expand' => __('Expand', 'product-estimator'),
            'collapse' => __('Collapse', 'product-estimator'),
            'show_more' => __('Show More', 'product-estimator'),
            'show_less' => __('Show Less', 'product-estimator'),
            'show_includes' => __('Show Inclusions', 'product-estimator'),
            'hide_includes' => __('Hide Inclusions', 'product-estimator'),
        ],
        'headings' => [
            'estimates_title' => __('Estimates', 'product-estimator'),
            'rooms_title' => __('Rooms', 'product-estimator'),
            'products_title' => __('Products', 'product-estimator'),
            'customer_details_title' => __('Your Details', 'product-estimator'),
            'estimate_summary' => __('Estimate Summary', 'product-estimator'),
            'room_summary' => __('Room Summary', 'product-estimator'),
            'product_details' => __('Product Details', 'product-estimator'),
            'similar_products' => __('Similar Products', 'product-estimator'),
        ],
        'labels' => [
            'total_price' => __('Total Price', 'product-estimator'),
            'price_range' => __('Price Range', 'product-estimator'),
            'unit_price' => __('Unit Price', 'product-estimator'),
            'product_name' => __('Product', 'product-estimator'),
            'room_name' => __('Room', 'product-estimator'),
            'estimate_name' => __('Estimate', 'product-estimator'),
            'created_date' => __('Created', 'product-estimator'),
            'last_modified' => __('Last Modified', 'product-estimator'),
            'quantity' => __('Quantity', 'product-estimator'),
            'dimensions' => __('Dimensions', 'product-estimator'),
        ],
    ],
];
```

## Form Labels

```php
// Define form label defaults
$form_labels = [
    'forms' => [
        'validation' => [
            'required_field' => __('This field is required', 'product-estimator'),
            'min_length' => __('This field must be at least {length} characters long', 'product-estimator'),
            'max_length' => __('This field must be less than {length} characters long', 'product-estimator'),
            'invalid_email' => __('Please enter a valid email address', 'product-estimator'),
            'invalid_phone' => __('Please enter a valid phone number', 'product-estimator'),
            'invalid_postcode' => __('Please enter a valid postcode', 'product-estimator'),
            'numeric_only' => __('Please enter numbers only', 'product-estimator'),
        ],
        'estimate' => [
            'name' => [
                'label' => __('Estimate Name', 'product-estimator'),
                'placeholder' => __('Enter a name for this estimate', 'product-estimator'),
                'help_text' => __('Give your estimate a meaningful name', 'product-estimator'),
            ],
            'selector' => [
                'label' => __('Select Estimate', 'product-estimator'),
                'placeholder' => __('Choose an estimate', 'product-estimator'),
                'help_text' => __('Select an existing estimate to continue', 'product-estimator'),
            ],
        ],
        'room' => [
            'name' => [
                'label' => __('Room Name', 'product-estimator'),
                'placeholder' => __('Enter a name for this room', 'product-estimator'),
            ],
            'width' => [
                'label' => __('Width', 'product-estimator'),
                'placeholder' => __('Width', 'product-estimator'),
                'unit' => __('m', 'product-estimator'),
            ],
            'length' => [
                'label' => __('Length', 'product-estimator'),
                'placeholder' => __('Length', 'product-estimator'),
                'unit' => __('m', 'product-estimator'),
            ],
            'dimensions' => [
                'label' => __('Room Dimensions', 'product-estimator'),
                'help_text' => __('Enter the width and length of your room', 'product-estimator'),
            ],
            'selector' => [
                'label' => __('Select Room', 'product-estimator'),
                'placeholder' => __('Choose a room', 'product-estimator'),
                'help_text' => __('Select an existing room to continue', 'product-estimator'),
            ],
        ],
        'customer' => [
            'name' => [
                'label' => __('Your Name', 'product-estimator'),
                'placeholder' => __('Enter your full name', 'product-estimator'),
            ],
            'email' => [
                'label' => __('Email Address', 'product-estimator'),
                'placeholder' => __('Enter your email address', 'product-estimator'),
            ],
            'phone' => [
                'label' => __('Phone Number', 'product-estimator'),
                'placeholder' => __('Enter your phone number', 'product-estimator'),
            ],
            'postcode' => [
                'label' => __('Postcode', 'product-estimator'),
                'placeholder' => __('Enter your postcode', 'product-estimator'),
            ],
            'section_title' => __('Your Contact Details', 'product-estimator'),
            'save_details' => __('Save my details for next time', 'product-estimator'),
            'use_saved' => __('Use saved details', 'product-estimator'),
        ],
        'instructions' => [
            'room_details' => __('Please provide details about your room', 'product-estimator'),
            'customer_details' => __('Please provide your contact information', 'product-estimator'),
            'variation_selection' => __('Please select from the available options', 'product-estimator'),
        ],
    ],
];
```

## Common Labels

```php
// Define common label defaults
$common_labels = [
    'common' => [
        'actions' => [
            'add' => __('Add', 'product-estimator'),
            'save' => __('Save', 'product-estimator'),
            'cancel' => __('Cancel', 'product-estimator'),
            'confirm' => __('Confirm', 'product-estimator'),
            'delete' => __('Delete', 'product-estimator'),
            'edit' => __('Edit', 'product-estimator'),
            'view' => __('View', 'product-estimator'),
            'back' => __('Back', 'product-estimator'),
            'next' => __('Next', 'product-estimator'),
            'previous' => __('Previous', 'product-estimator'),
        ],
        'states' => [
            'loading' => __('Loading', 'product-estimator'),
            'empty' => __('Empty', 'product-estimator'),
            'error' => __('Error', 'product-estimator'),
            'success' => __('Success', 'product-estimator'),
            'warning' => __('Warning', 'product-estimator'),
            'active' => __('Active', 'product-estimator'),
            'inactive' => __('Inactive', 'product-estimator'),
            'selected' => __('Selected', 'product-estimator'),
            'unselected' => __('Unselected', 'product-estimator'),
        ],
        'validation' => [
            'required' => __('Required', 'product-estimator'),
            'invalid' => __('Invalid', 'product-estimator'),
            'too_short' => __('Too short', 'product-estimator'),
            'too_long' => __('Too long', 'product-estimator'),
            'invalid_format' => __('Invalid format', 'product-estimator'),
            'invalid_value' => __('Invalid value', 'product-estimator'),
        ],
    ],
];
```

## Tooltip Labels

```php
// Define tooltip label defaults
$tooltip_labels = [
    'tooltips' => [
        'estimate' => [
            'create_new_tip' => __('Create a new estimate', 'product-estimator'),
            'print_tip' => __('Print this estimate', 'product-estimator'),
            'email_tip' => __('Email this estimate', 'product-estimator'),
            'save_tip' => __('Save changes to this estimate', 'product-estimator'),
            'delete_tip' => __('Delete this estimate', 'product-estimator'),
            'product_count_tip' => __('This estimate contains {count} products', 'product-estimator'),
        ],
        'product' => [
            'add_to_room_tip' => __('Add this product to the selected room', 'product-estimator'),
            'remove_from_room_tip' => __('Remove this product from the room', 'product-estimator'),
            'details_tip' => __('View detailed product information', 'product-estimator'),
            'price_range_tip' => __('Price may vary based on selected options', 'product-estimator'),
            'variations_tip' => __('This product has multiple options', 'product-estimator'),
            'includes_tip' => __('This product includes additional items', 'product-estimator'),
            'similar_products_tip' => __('View similar products', 'product-estimator'),
        ],
        'room' => [
            'add_room_tip' => __('Add a new room to this estimate', 'product-estimator'),
            'delete_room_tip' => __('Delete this room', 'product-estimator'),
            'dimensions_tip' => __('Edit room dimensions', 'product-estimator'),
            'products_count_tip' => __('This room contains {count} products', 'product-estimator'),
            'edit_dimensions_tip' => __('Change the width and length of this room', 'product-estimator'),
        ],
    ],
];
```

## Message Labels

```php
// Define message label defaults
$message_labels = [
    'messages' => [
        'success' => [
            'product_added' => __('Product successfully added to room', 'product-estimator'),
            'room_added' => __('Room successfully added to estimate', 'product-estimator'),
            'estimate_saved' => __('Estimate saved successfully', 'product-estimator'),
            'email_sent' => __('Email sent successfully', 'product-estimator'),
            'changes_saved' => __('Changes saved successfully', 'product-estimator'),
            'operation_completed' => __('Operation completed successfully', 'product-estimator'),
        ],
        'error' => [
            'general_error' => __('An error occurred', 'product-estimator'),
            'network_error' => __('Network error. Please check your connection', 'product-estimator'),
            'save_failed' => __('Failed to save changes', 'product-estimator'),
            'load_failed' => __('Failed to load data', 'product-estimator'),
            'invalid_data' => __('The data provided is invalid', 'product-estimator'),
            'server_error' => __('Server error. Please try again later', 'product-estimator'),
            'product_not_found' => __('Product not found', 'product-estimator'),
            'room_not_found' => __('Room not found', 'product-estimator'),
        ],
        'warning' => [
            'unsaved_changes' => __('You have unsaved changes', 'product-estimator'),
            'duplicate_item' => __('This item already exists', 'product-estimator'),
            'will_be_deleted' => __('This item will be permanently deleted', 'product-estimator'),
            'cannot_be_undone' => __('This action cannot be undone', 'product-estimator'),
            'validation_issues' => __('Please correct the errors below', 'product-estimator'),
        ],
        'info' => [
            'no_rooms_yet' => __('You haven\'t added any rooms yet', 'product-estimator'),
            'no_products_yet' => __('You haven\'t added any products yet', 'product-estimator'),
            'no_estimates_yet' => __('You haven\'t created any estimates yet', 'product-estimator'),
            'product_count' => __('Showing {count} products', 'product-estimator'),
            'room_count' => __('Showing {count} rooms', 'product-estimator'),
            'estimate_count' => __('Showing {count} estimates', 'product-estimator'),
            'price_range_info' => __('Price range: {min} - {max}', 'product-estimator'),
        ],
        'confirm' => [
            'delete_product' => __('Are you sure you want to delete this product?', 'product-estimator'),
            'delete_room' => __('Are you sure you want to delete this room?', 'product-estimator'),
            'delete_estimate' => __('Are you sure you want to delete this estimate?', 'product-estimator'),
            'discard_changes' => __('Discard unsaved changes?', 'product-estimator'),
            'proceed_with_action' => __('Are you sure you want to proceed?', 'product-estimator'),
            'replace_product' => __('Replace existing product?', 'product-estimator'),
            'product_conflict' => __('This product conflicts with existing products. How would you like to proceed?', 'product-estimator'),
            'create_new_room' => __('Would you like to create a new room for this product?', 'product-estimator'),
        ],
    ],
];
```

## Button Labels

```php
// Define button label defaults
$button_labels = [
    'buttons' => [
        'core' => [
            'save' => __('Save', 'product-estimator'),
            'cancel' => __('Cancel', 'product-estimator'),
            'confirm' => __('Confirm', 'product-estimator'),
            'delete' => __('Delete', 'product-estimator'),
            'edit' => __('Edit', 'product-estimator'),
            'close' => __('Close', 'product-estimator'),
            'back' => __('Back', 'product-estimator'),
            'apply' => __('Apply', 'product-estimator'),
            'reset' => __('Reset', 'product-estimator'),
            'search' => __('Search', 'product-estimator'),
            'continue' => __('Continue', 'product-estimator'),
            'select' => __('Select', 'product-estimator'),
            'show_more' => __('Show More', 'product-estimator'),
            'show_less' => __('Show Less', 'product-estimator'),
            'next' => __('Next', 'product-estimator'),
            'previous' => __('Previous', 'product-estimator'),
        ],
        'estimate' => [
            'create_estimate' => __('Create Estimate', 'product-estimator'),
            'save_estimate' => __('Save Estimate', 'product-estimator'),
            'print_estimate' => __('Print Estimate', 'product-estimator'),
            'email_estimate' => __('Email Estimate', 'product-estimator'),
            'share_estimate' => __('Share Estimate', 'product-estimator'),
            'delete_estimate' => __('Delete Estimate', 'product-estimator'),
            'view_details' => __('View Details', 'product-estimator'),
            'add_room' => __('Add Room', 'product-estimator'),
        ],
        'room' => [
            'add_room' => __('Add Room', 'product-estimator'),
            'edit_room' => __('Edit Room', 'product-estimator'),
            'delete_room' => __('Delete Room', 'product-estimator'),
            'select_room' => __('Select Room', 'product-estimator'),
            'view_products' => __('View Products', 'product-estimator'),
            'back_to_rooms' => __('Back to Rooms', 'product-estimator'),
            'add_product' => __('Add Product', 'product-estimator'),
        ],
        'product' => [
            'add_product' => __('Add Product', 'product-estimator'),
            'remove_product' => __('Remove Product', 'product-estimator'),
            'view_details' => __('View Details', 'product-estimator'),
            'add_to_room' => __('Add to Room', 'product-estimator'),
            'add_to_estimate' => __('Add to Estimate', 'product-estimator'),
            'add_to_estimate_single' => __('Add to My Estimate', 'product-estimator'),
            'select_product' => __('Select Product', 'product-estimator'),
            'show_includes' => __('Show Includes', 'product-estimator'),
            'add_note' => __('Add Note', 'product-estimator'),
            'view_similar' => __('View Similar', 'product-estimator'),
            'toggle_details' => __('Toggle Details', 'product-estimator'),
            'select_variation' => __('Select Options', 'product-estimator'),
            'hide_details' => __('Hide Details', 'product-estimator'),
        ],
    ],
];
```

## PDF Labels

```php
// Define PDF label defaults
$pdf_labels = [
    'pdf' => [
        'headers' => [
            'document_title' => __('Estimate', 'product-estimator'),
            'customer_details' => __('Customer Details', 'product-estimator'),
            'estimate_summary' => __('Estimate Summary', 'product-estimator'),
            'page_number' => __('Page', 'product-estimator'),
            'date_created' => __('Date', 'product-estimator'),
            'quote_number' => __('Quote #', 'product-estimator'),
        ],
        'footers' => [
            'company_name' => get_bloginfo('name'),
            'company_contact' => __('Contact us: {phone}', 'product-estimator'),
            'company_website' => get_bloginfo('url'),
            'legal_text' => __('All prices are subject to change without notice. This estimate is valid for 30 days.', 'product-estimator'),
            'disclaimer' => __('This estimate is for informational purposes only and does not constitute a formal quote.', 'product-estimator'),
            'page_counter' => __('Page {page} of {total}', 'product-estimator'),
        ],
        'content' => [
            'estimate_details' => __('Estimate Details', 'product-estimator'),
            'room_details' => __('Room Details', 'product-estimator'),
            'product_details' => __('Product Details', 'product-estimator'),
            'pricing_information' => __('Pricing Information', 'product-estimator'),
            'includes_section' => __('Includes', 'product-estimator'),
            'notes_section' => __('Notes', 'product-estimator'),
            'summary_section' => __('Summary', 'product-estimator'),
        ],
    ],
];
```

## Integration into the Hierarchical Structure

To integrate all these labels into the hierarchical structure, you would merge them:

```php
// In LabelsMigration class

/**
 * Get hierarchical default structure
 *
 * @return array Default label structure
 */
public static function get_hierarchical_structure() {
    $structure = array_merge(
        $common_labels,
        $button_labels,
        $form_labels,
        $message_labels,
        $ui_component_labels,
        $tooltip_labels,
        $pdf_labels,
        $dialog_labels
    );
    
    // Add version information
    $structure['_version'] = '3.0.0';
    
    return $structure;
}
```

## Usage in Templates

Examples of using these labels in templates:

```html
<!-- Dialog template -->
<div class="pe-variation-dialog">
    <h3 class="pe-dialog-title" data-label="ui.dialogs.titles.variation_selection">Select Product Options</h3>
    <p class="pe-dialog-description" data-label="ui.dialogs.bodies.select_variation_options">Please select options for this product:</p>
    
    <!-- Variation options will be inserted here -->
    
    <div class="pe-dialog-footer">
        <p class="pe-dialog-help" data-label="ui.dialogs.bodies.variation_options_help">The price may vary based on your selections</p>
        <div class="pe-dialog-buttons">
            <button class="pe-dialog-cancel" data-label="buttons.core.cancel">Cancel</button>
            <button class="pe-dialog-confirm" data-label="buttons.dialogs.select_variation">Select Options</button>
        </div>
    </div>
</div>

<!-- Loading indicator -->
<div class="pe-loading">
    <span class="pe-loading-text" data-label="ui.loading.please_wait">Please wait...</span>
</div>

<!-- Empty state -->
<div class="pe-empty-state">
    <p class="pe-empty-message" data-label="ui.empty_states.no_products">No products in this room yet.</p>
</div>

<!-- Form validation message -->
<div class="pe-validation-message">
    <span data-label="forms.validation.required_field">This field is required</span>
</div>

<!-- Toggle button -->
<button class="pe-toggle-details" data-label="ui.toggles.show_details">Show Details</button>
```

This structured approach ensures that all UI elements have proper labels that are easy to maintain and update.