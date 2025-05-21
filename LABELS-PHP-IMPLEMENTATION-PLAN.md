# Labels Hierarchical Structure Implementation Plan (PHP)

This document outlines the implementation plan for updating the PHP backend of the Product Estimator plugin to support the new hierarchical label structure.

## Overview

We need to modify several PHP files to support a deeper hierarchical structure with three levels (`category.subcategory.key`) while maintaining backward compatibility with the existing two-level structure (`category.key`).

## Implementation Steps

### 1. Update `LabelsMigration::get_default_structure()`

The default structure in `class-labels-migration.php` needs to be updated to support the new hierarchical format. Here's how we'll modify it:

```php
public static function get_default_structure() {
    return [
        // UI Components category
        'ui' => [
            'general' => [
                'modal_header_title' => __('Product Estimator', 'product-estimator'),
                'close' => __('Close', 'product-estimator'),
                // More general UI labels...
            ],
            'components' => [
                'loading' => [
                    'general' => __('Loading...', 'product-estimator'),
                    'processing' => __('Processing...', 'product-estimator'),
                    'searching' => __('Searching...', 'product-estimator'),
                    // More loading states...
                ],
                'toggles' => [
                    'show_details' => __('Show Details', 'product-estimator'),
                    'hide_details' => __('Hide Details', 'product-estimator'),
                    'show_more' => __('Show More', 'product-estimator'),
                    'show_less' => __('Show Less', 'product-estimator'),
                    // More toggle states...
                ],
                'variations' => [
                    'attribute_label' => __('Attribute Label', 'product-estimator'),
                    'select_option' => __('Select Option', 'product-estimator'),
                    'no_options' => __('No options available', 'product-estimator'),
                    // More variation labels...
                ]
            ],
            'emptystates' => [
                'no_results' => __('No results found', 'product-estimator'),
                'no_products' => __('You don\'t have any products in this room.', 'product-estimator'),
                'no_rooms' => __('No rooms added to this estimate yet.', 'product-estimator'),
                'no_estimates' => __('You don\'t have any estimates yet.', 'product-estimator'),
                // More empty states...
            ]
        ],
        
        // Dialogs category
        'dialogs' => [
            'titles' => [
                'confirmation' => __('Confirm Action', 'product-estimator'),
                'product_selection' => __('Select Product Options', 'product-estimator'),
                'variation_selection' => __('Select Variations', 'product-estimator'),
                'product_added' => __('Product Added', 'product-estimator'),
                'product_replaced' => __('Product Replaced', 'product-estimator'),
                'error' => __('Error', 'product-estimator'),
                'success' => __('Success', 'product-estimator'),
                // More dialog titles...
            ],
            'messages' => [
                'confirm_action' => __('Are you sure you want to proceed?', 'product-estimator'),
                'select_options' => __('Please select your options below:', 'product-estimator'),
                'variation_required' => __('Please select required options', 'product-estimator'),
                'product_added' => __('Product has been added successfully', 'product-estimator'),
                // More dialog messages...
            ],
            'instructions' => [
                'select_variation' => __('Select options for this product', 'product-estimator'),
                'product_details' => __('View details of this product below', 'product-estimator'),
                // More instructions...
            ]
        ],
        
        // Actions category
        'actions' => [
            'core' => [
                'save' => __('Save', 'product-estimator'),
                'cancel' => __('Cancel', 'product-estimator'),
                'confirm' => __('Confirm', 'product-estimator'),
                'delete' => __('Delete', 'product-estimator'),
                'remove' => __('Remove', 'product-estimator'),
                'edit' => __('Edit', 'product-estimator'),
                'apply' => __('Apply', 'product-estimator'),
                // More core actions...
            ],
            'estimate' => [
                'save' => __('Save Estimate', 'product-estimator'),
                'print' => __('Print Estimate', 'product-estimator'),
                'request_copy' => __('Request Copy', 'product-estimator'),
                'delete' => __('Delete Estimate', 'product-estimator'),
                'create_new' => __('Create New Estimate', 'product-estimator'),
                // More estimate actions...
            ],
            'room' => [
                'add_new' => __('Add New Room', 'product-estimator'),
                'add' => __('Add Room', 'product-estimator'),
                'delete' => __('Delete Room', 'product-estimator'),
                'edit' => __('Edit Room', 'product-estimator'),
                'select' => __('Select Room', 'product-estimator'),
                // More room actions...
            ],
            'product' => [
                'add' => __('Add Product', 'product-estimator'),
                'add_to_estimate' => __('Add to Estimate', 'product-estimator'),
                'add_to_room' => __('Add to Room', 'product-estimator'),
                'remove' => __('Remove Product', 'product-estimator'),
                'replace' => __('Replace Product', 'product-estimator'),
                'select' => __('Select Product', 'product-estimator'),
                'view_details' => __('View Details', 'product-estimator'),
                // More product actions...
            ],
            'features' => [
                'similar_products' => __('Similar Products', 'product-estimator'),
                'suggested_products' => __('Suggested Products', 'product-estimator'),
                'additional_products' => __('Additional Products', 'product-estimator'),
                'add_note' => __('Add Note', 'product-estimator'),
                // More feature actions...
            ]
        ],
        
        // Forms category
        'forms' => [
            'room' => [
                'name' => __('Room Name', 'product-estimator'),
                'width' => __('Width (m)', 'product-estimator'),
                'length' => __('Length (m)', 'product-estimator'),
                'placeholder_name' => __('e.g. Living Room', 'product-estimator'),
                'placeholder_width' => __('Width', 'product-estimator'),
                'placeholder_length' => __('Length', 'product-estimator'),
                // More room form labels...
            ],
            'customer' => [
                'name' => __('Name', 'product-estimator'),
                'email' => __('Email', 'product-estimator'),
                'phone' => __('Phone', 'product-estimator'),
                'postcode' => __('Postcode', 'product-estimator'),
                'placeholder_name' => __('Full Name', 'product-estimator'),
                'placeholder_email' => __('Email Address', 'product-estimator'),
                'placeholder_phone' => __('Phone Number', 'product-estimator'),
                'placeholder_postcode' => __('Postcode', 'product-estimator'),
                // More customer form labels...
            ],
            'validation' => [
                'required_field' => __('This field is required', 'product-estimator'),
                'min_length' => __('Minimum {min} characters required', 'product-estimator'),
                'max_length' => __('Maximum {max} characters allowed', 'product-estimator'),
                'number_required' => __('Please enter a valid number', 'product-estimator'),
                'email_required' => __('Please enter a valid email address', 'product-estimator'),
                'phone_required' => __('Please enter a valid phone number', 'product-estimator'),
                // More validation messages...
            ],
            'instructions' => [
                'room_dimensions' => __('Enter the width and length of the room', 'product-estimator'),
                'customer_details' => __('Enter your contact information', 'product-estimator'),
                'estimate_name' => __('Give your estimate a name for reference', 'product-estimator'),
                // More form instructions...
            ]
        ],
        
        // Messages category
        'messages' => [
            'success' => [
                'product_added' => __('Product has been added successfully.', 'product-estimator'),
                'estimate_saved' => __('Estimate has been saved successfully.', 'product-estimator'),
                'room_created' => __('Room has been created successfully.', 'product-estimator'),
                'email_sent' => __('Email has been sent successfully.', 'product-estimator'),
                'form_submitted' => __('Form has been submitted successfully.', 'product-estimator'),
                // More success messages...
            ],
            'error' => [
                'general' => __('An error occurred. Please try again.', 'product-estimator'),
                'form_submission' => __('An error occurred with the form submission. Please try again.', 'product-estimator'),
                'product_add' => __('Failed to add product. Please try again.', 'product-estimator'),
                'network' => __('Network error. Please check your connection and try again.', 'product-estimator'),
                'product_load' => __('Failed to load product data. Please try again.', 'product-estimator'),
                // More error messages...
            ]
        ],
        
        // PDF category
        'pdf' => [
            'document' => [
                'title' => __('Product Estimate', 'product-estimator'),
                'customer_details' => __('Customer Details', 'product-estimator'),
                'estimate_summary' => __('Estimate Summary', 'product-estimator'),
                'price_range' => __('Price Range', 'product-estimator'),
                'from' => __('From', 'product-estimator'),
                'to' => __('To', 'product-estimator'),
                'date' => __('Date', 'product-estimator'),
                'page' => __('Page', 'product-estimator'),
                'of' => __('of', 'product-estimator'),
                // More document labels...
            ],
            'company' => [
                'name' => get_bloginfo('name'),
                'phone' => '',
                'email' => get_bloginfo('admin_email'),
                'website' => get_bloginfo('url'),
                'footer_text' => __('Thank you for your business', 'product-estimator'),
                'disclaimer' => __('This estimate is valid for 30 days', 'product-estimator'),
                // More company details...
            ]
        ],
        
        // Add compatibility structures for legacy labels
        'buttons' => [], // Will be populated by migration
        'forms_legacy' => [], // Will be populated by migration
        'messages_legacy' => [], // Will be populated by migration
        'ui_elements' => [], // Will be populated by migration
    ];
}
```

### 2. Update `LabelsMigration::migrate_labels()` to Map Old Labels to New Structure

We need to update the migration function to map the old labels to the new hierarchical structure:

```php
private static function migrate_labels($old_labels) {
    $new_structure = self::get_default_structure();
    $mapping = self::get_label_mapping();
    
    // Map old labels to new structure
    foreach ($old_labels as $category => $labels) {
        if (is_array($labels)) {
            foreach ($labels as $key => $value) {
                $old_path = $category . '.' . $key;
                if (isset($mapping[$old_path])) {
                    // Map to new structure
                    $new_path = $mapping[$old_path];
                    $path_parts = explode('.', $new_path);
                    
                    if (count($path_parts) === 3) {
                        $cat = $path_parts[0];
                        $subcat = $path_parts[1];
                        $label_key = $path_parts[2];
                        
                        // Create subcategory if needed
                        if (!isset($new_structure[$cat][$subcat])) {
                            $new_structure[$cat][$subcat] = [];
                        }
                        
                        // Set the value in the new structure
                        $new_structure[$cat][$subcat][$label_key] = $value;
                    } else {
                        // Fallback for incorrect mapping
                        $new_structure[$category][$key] = $value;
                    }
                } else {
                    // No mapping found, preserve in legacy category
                    $new_structure[$category][$key] = $value;
                }
            }
        }
    }
    
    return $new_structure;
}

/**
 * Get a mapping of old label paths to new hierarchical paths
 * 
 * @return array Mapping of old paths to new paths
 */
private static function get_label_mapping() {
    return [
        // Buttons category mapping
        'buttons.print_estimate' => 'actions.estimate.print',
        'buttons.save_estimate' => 'actions.estimate.save',
        'buttons.request_copy' => 'actions.estimate.request_copy',
        'buttons.create_new_estimate' => 'actions.estimate.create_new',
        'buttons.delete_estimate' => 'actions.estimate.delete',
        'buttons.add_new_room' => 'actions.room.add_new',
        'buttons.add_room' => 'actions.room.add',
        'buttons.remove_room' => 'actions.room.delete',
        'buttons.add_product' => 'actions.product.add',
        'buttons.add_to_estimate' => 'actions.product.add_to_estimate',
        'buttons.add_to_room' => 'actions.product.add_to_room',
        'buttons.remove_product' => 'actions.product.remove',
        'buttons.replace_product' => 'actions.product.replace',
        'buttons.similar_products' => 'actions.features.similar_products',
        'buttons.additional_products' => 'actions.features.additional_products',
        'buttons.add_note' => 'actions.features.add_note',
        'buttons.confirm' => 'actions.core.confirm',
        'buttons.cancel' => 'actions.core.cancel',
        'buttons.save' => 'actions.core.save',
        'buttons.delete' => 'actions.core.delete',
        'buttons.remove' => 'actions.core.remove',
        'buttons.apply' => 'actions.core.apply',
        
        // Forms category mapping
        'forms.room_name' => 'forms.room.name',
        'forms.room_width' => 'forms.room.width',
        'forms.room_length' => 'forms.room.length',
        'forms.placeholder_room_name' => 'forms.room.placeholder_name',
        'forms.placeholder_width' => 'forms.room.placeholder_width',
        'forms.placeholder_length' => 'forms.room.placeholder_length',
        'forms.customer_name' => 'forms.customer.name',
        'forms.customer_email' => 'forms.customer.email',
        'forms.customer_phone' => 'forms.customer.phone',
        'forms.customer_postcode' => 'forms.customer.postcode',
        'forms.placeholder_email' => 'forms.customer.placeholder_email',
        'forms.placeholder_phone' => 'forms.customer.placeholder_phone',
        
        // Messages category mapping
        'messages.product_added' => 'messages.success.product_added',
        'messages.estimate_saved' => 'messages.success.estimate_saved',
        'messages.room_created' => 'messages.success.room_created',
        'messages.email_sent' => 'messages.success.email_sent',
        'messages.general_error' => 'messages.error.general',
        'messages.save_failed' => 'messages.error.form_submission',
        'messages.product_add_error' => 'messages.error.product_add',
        'messages.network_error' => 'messages.error.network',
        'messages.product_load_error' => 'messages.error.product_load',
        'messages.confirm_proceed' => 'dialogs.messages.confirm_action',
        'messages.select_options' => 'dialogs.messages.select_options',
        
        // UI Elements category mapping
        'ui_elements.loading' => 'ui.components.loading.general',
        'ui_elements.no_results' => 'ui.emptystates.no_results',
        'ui_elements.no_products' => 'ui.emptystates.no_products',
        'ui_elements.no_rooms' => 'ui.emptystates.no_rooms',
        'ui_elements.no_estimates' => 'ui.emptystates.no_estimates',
        'ui_elements.confirm_title' => 'dialogs.titles.confirmation',
        'ui_elements.select_product_options' => 'dialogs.titles.product_selection',
        'ui_elements.modal_header_title' => 'ui.general.modal_header_title',
        'ui_elements.details_toggle' => 'ui.components.toggles.show_details',
        'ui_elements.details_toggle_hide' => 'ui.components.toggles.hide_details',
        
        // PDF category mapping
        'pdf.title' => 'pdf.document.title',
        'pdf.company_name' => 'pdf.company.name',
        'pdf.company_phone' => 'pdf.company.phone',
        'pdf.company_email' => 'pdf.company.email',
        'pdf.company_website' => 'pdf.company.website',
        'pdf.footer_text' => 'pdf.company.footer_text',
        'pdf.disclaimer' => 'pdf.company.disclaimer',
        'pdf.customer_details' => 'pdf.document.customer_details',
        'pdf.estimate_summary' => 'pdf.document.estimate_summary',
        'pdf.from' => 'pdf.document.from',
        'pdf.to' => 'pdf.document.to',
        'pdf.page' => 'pdf.document.page',
        'pdf.of' => 'pdf.document.of',
        'pdf.date' => 'pdf.document.date',
        
        // Add more mappings as needed...
    ];
}
```

### 3. Update `LabelsFrontend::get_label()` to Support Hierarchical Structure

Modify the method that retrieves label values to efficiently support deeper paths:

```php
/**
 * Get a single label value
 *
 * @since    2.0.0
 * @access   public
 * @param    string    $key        Label key (supports dot notation: category.subcategory.key)
 * @param    string    $default    Default value if label not found
 * @return   string    The label value
 */
public function get_label($key, $default = '') {
    static $labels = null;
    
    // Load labels once per request
    if ($labels === null) {
        $labels = $this->get_all_labels_with_cache();
    }
    
    // Support dot notation
    $keys = explode('.', $key);
    $value = $labels;
    
    foreach ($keys as $k) {
        if (isset($value[$k])) {
            $value = $value[$k];
        } else {
            // Try the legacy lookup if the original path fails
            return $this->get_legacy_fallback($key, $default);
        }
    }
    
    return $value;
}

/**
 * Try to get a value using the legacy label path or compatibility mapping
 *
 * @since    2.0.0
 * @access   private
 * @param    string    $key        Original label key that failed to resolve
 * @param    string    $default    Default value if label not found
 * @return   string    The label value or default
 */
private function get_legacy_fallback($key, $default = '') {
    static $mapping = null;
    static $labels = null;
    
    // Load labels and mapping once per request
    if ($labels === null) {
        $labels = $this->get_all_labels_with_cache();
    }
    
    if ($mapping === null) {
        $mapping = $this->get_reverse_mapping();
    }
    
    // Check if there's a mapping for this key
    if (isset($mapping[$key])) {
        $old_key = $mapping[$key];
        
        // Try the old key path
        $keys = explode('.', $old_key);
        $value = $labels;
        
        foreach ($keys as $k) {
            if (isset($value[$k])) {
                $value = $value[$k];
            } else {
                return $default;
            }
        }
        
        return $value;
    }
    
    // No mapping found, return default
    return $default;
}

/**
 * Get reverse mapping (new path to old path)
 *
 * @since    2.0.0
 * @access   private
 * @return   array    Mapping of new paths to old paths
 */
private function get_reverse_mapping() {
    // Get forward mapping (old path to new path)
    $forward_mapping = LabelsMigration::get_label_mapping();
    
    // Create reverse mapping
    $reverse_mapping = [];
    foreach ($forward_mapping as $old_path => $new_path) {
        $reverse_mapping[$new_path] = $old_path;
    }
    
    return $reverse_mapping;
}
```

### 4. Update `LabelsFrontend::optimize_label_structure()` to Support Deeper Nesting

Enhance the optimization method to handle arbitrary nesting depth:

```php
/**
 * Optimize label structure for performance
 *
 * @since    2.0.0
 * @access   private
 * @param    array    $labels    Labels array
 * @return   array    Optimized labels
 */
private function optimize_label_structure($labels) {
    // Initialize flattened structure
    if (!isset($labels['_flat'])) {
        $labels['_flat'] = [];
    }
    
    // Recursively flatten the hierarchical structure
    $this->flatten_structure($labels, $labels['_flat']);
    
    return $labels;
}

/**
 * Recursively flatten nested structures for faster access
 *
 * @since    2.0.0
 * @access   private
 * @param    array    $structure    Nested structure to flatten
 * @param    array    &$flattened   Reference to flattened output array
 * @param    string   $prefix       Current path prefix
 */
private function flatten_structure($structure, &$flattened, $prefix = '') {
    foreach ($structure as $key => $value) {
        // Skip special internal keys
        if ($key === '_flat' || $key === '_version') {
            continue;
        }
        
        $current_path = $prefix ? "$prefix.$key" : $key;
        
        if (is_array($value)) {
            // Recursively process nested structures
            $this->flatten_structure($value, $flattened, $current_path);
        } else {
            // This is a leaf node (actual label value)
            $flattened[$current_path] = $value;
        }
    }
}
```

### 5. Update Version and Create Update Method

Update the version to trigger migration:

```php
/**
 * Current version of labels structure
 */
const LABELS_VERSION = '2.1.0';

/**
 * Update the labels version to refresh caches
 */
public static function update_labels_version() {
    update_option(self::VERSION_OPTION_NAME, self::LABELS_VERSION);
    delete_transient('pe_frontend_labels_cache');
}
```

## JavaScript Updates

The JavaScript `LabelManager` class will also need updates to support the deeper structure. We'll modify the `get()` method to handle three-level paths and update the legacy mapping:

```javascript
/**
 * Get a label value using dot notation with client-side caching
 * 
 * @param {string} key - Label key (e.g., 'buttons.save_estimate' or 'actions.estimate.save')
 * @param {string} defaultValue - Default value if label not found
 * @returns {string} Label value or default
 */
get(key, defaultValue = '') {
    // Check cache first for the fastest retrieval
    if (this.cache.has(key)) {
        // Handle analytics tracking
        return this.cache.get(key);
    }
    
    // Check if we have a flattened version first (faster lookup)
    if (this.labels._flat && this.labels._flat[key] !== undefined) {
        const value = this.labels._flat[key];
        this.cache.set(key, value); // Cache for future
        return value;
    }
    
    // Check if this is a legacy key that needs mapping
    if (this.legacyMapping[key]) {
        const newKey = this.legacyMapping[key];
        return this.get(newKey, defaultValue);
    }
    
    // Standard dot notation lookup
    const keys = key.split('.');
    let value = this.labels;
    
    for (const k of keys) {
        if (value && value[k] !== undefined) {
            value = value[k];
        } else {
            // Log missing label in development
            if (window.productEstimatorDebug) {
                console.warn(`Label not found: ${key}`);
            }
            this.cache.set(key, defaultValue); // Cache the default too
            return defaultValue;
        }
    }
    
    // Cache the result for next time
    this.cache.set(key, value);
    
    // Track usage analytics
    if (this.analytics.enabled) {
        this.trackUsage(key);
    }
    
    return value;
}
```

## Testing and Deployment Strategy

1. **Development Testing**:
   - Create a test environment with a copy of production data
   - Run the migration with a limited set of labels first
   - Verify that the new structure is populated correctly
   - Test both old and new label paths to ensure backward compatibility

2. **UI Testing**:
   - Ensure the admin interface properly displays the hierarchical structure
   - Verify that editing labels in the admin UI works as expected
   - Test that templates with existing `data-label` attributes still work

3. **Performance Testing**:
   - Benchmark the performance of the new hierarchical structure vs. the old structure
   - Ensure caching mechanisms are working effectively
   - Test with a large number of labels to verify scalability

4. **Deployment**:
   - Schedule deployment during low traffic period
   - Ensure backup of current labels data
   - Run migration as part of the deployment process
   - Monitor for any issues immediately after deployment

## Conclusion

By implementing these changes, we'll transform the Product Estimator label system from a two-level structure to a three-level hierarchical structure while maintaining backward compatibility. This will provide better organization, make maintenance easier, and improve the overall user experience for administrators managing the label system.