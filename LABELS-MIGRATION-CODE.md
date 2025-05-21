# Labels Migration Implementation

This document provides the technical implementation details for migrating from the current flat labels structure to the new hierarchical structure.

## Table of Contents

1. [PHP Implementation](#php-implementation)
   - [Database Schema Updates](#database-schema-updates)
   - [Migration Script](#migration-script)
   - [Label Access Methods](#label-access-methods)
   - [Admin UI Updates](#admin-ui-updates)
2. [JavaScript Implementation](#javascript-implementation)
   - [LabelManager Enhancements](#labelmanager-enhancements)
   - [Template Processing](#template-processing)
   - [Usage Analytics](#usage-analytics)
3. [Template Updates](#template-updates)
   - [Automatic Migration Tool](#automatic-migration-tool)
   - [Manual Update Guide](#manual-update-guide)
4. [Testing Strategy](#testing-strategy)
   - [Unit Tests](#unit-tests)
   - [Integration Tests](#integration-tests)
   - [Validation Tools](#validation-tools)

## PHP Implementation

### Database Schema Updates

The existing labels are stored in a flat structure in the WordPress options table. We'll extend this to support the hierarchical structure while maintaining backward compatibility.

```php
/**
 * Enhanced get_default_structure method
 */
public static function get_hierarchical_structure() {
    return [
        'ui' => [
            'general' => [
                'modal_header_title' => __('Product Estimator', 'product-estimator'),
                'loading' => __('Loading...', 'product-estimator'),
                'close' => __('Close', 'product-estimator'),
                'no_results' => __('No results found', 'product-estimator'),
            ],
            'emptystates' => [
                'no_estimates' => __('You don\'t have any estimates yet.', 'product-estimator'),
                'no_rooms' => __('No rooms added to this estimate yet.', 'product-estimator'),
                'no_products' => __('No products added to this room yet.', 'product-estimator'),
                'empty_room' => __('No products in this room', 'product-estimator'),
                'empty_estimate' => __('No rooms in this estimate', 'product-estimator'),
            ],
            'navigation' => [
                'previous' => __('Previous', 'product-estimator'),
                'next' => __('Next', 'product-estimator'),
                'back' => __('Back', 'product-estimator'),
                'continue' => __('Continue', 'product-estimator'),
                'view_all' => __('View All', 'product-estimator'),
                'hide_all' => __('Hide All', 'product-estimator'),
            ],
            'headings' => [
                'rooms_heading' => __('Rooms', 'product-estimator'),
                'products_heading' => __('Products', 'product-estimator'),
                'estimate_summary' => __('Estimate Summary', 'product-estimator'),
                'room_summary' => __('Room Summary', 'product-estimator'),
                'product_summary' => __('Product Summary', 'product-estimator'),
                'includes_heading' => __('Includes', 'product-estimator'),
                'notes_heading' => __('Notes', 'product-estimator'),
            ],
        ],
        'forms' => [
            'general' => [
                'required_field' => __('This field is required', 'product-estimator'),
                'select_options' => __('Please select your options below:', 'product-estimator'),
            ],
            'estimateform' => [
                'estimate_name' => __('Estimate Name', 'product-estimator'),
                'placeholder_estimate_name' => __('Enter estimate name', 'product-estimator'),
                'create_new_estimate' => __('Create New Estimate', 'product-estimator'),
                'select_estimate' => __('Select an estimate', 'product-estimator'),
                'select_estimate_option' => __('-- Select an Estimate --', 'product-estimator'),
                'choose_estimate' => __('Choose an estimate:', 'product-estimator'),
            ],
            'roomform' => [
                'room_name' => __('Room Name', 'product-estimator'),
                'room_width' => __('Width (m)', 'product-estimator'),
                'room_length' => __('Length (m)', 'product-estimator'),
                'room_dimensions' => __('Room Dimensions', 'product-estimator'),
                'placeholder_room_name' => __('Enter room name', 'product-estimator'),
                'placeholder_width' => __('Width', 'product-estimator'),
                'placeholder_length' => __('Length', 'product-estimator'),
                'select_room' => __('Select a room', 'product-estimator'),
                'select_room_option' => __('-- Select a Room --', 'product-estimator'),
                'choose_room' => __('Choose a room:', 'product-estimator'),
            ],
            'customerdetails' => [
                'customer_name' => __('Customer Name', 'product-estimator'),
                'customer_email' => __('Email Address', 'product-estimator'),
                'customer_phone' => __('Phone Number', 'product-estimator'),
                'customer_postcode' => __('Postcode', 'product-estimator'),
                'full_name' => __('Full Name', 'product-estimator'),
                'email_address' => __('Email Address', 'product-estimator'),
                'phone_number' => __('Phone Number', 'product-estimator'),
                'your_details' => __('Your Details', 'product-estimator'),
                'saved_details' => __('Your Saved Details', 'product-estimator'),
                'edit_your_details' => __('Edit Your Details', 'product-estimator'),
                'placeholder_email' => __('your@email.com', 'product-estimator'),
                'placeholder_phone' => __('Your phone number', 'product-estimator'),
                'placeholder_postcode' => __('Your postcode', 'product-estimator'),
            ],
        ],
        // More categories follow the same pattern
    ];
}
```

### Migration Script

Create a migration script to convert the existing flat structure to the new hierarchical structure:

```php
/**
 * Migrate to hierarchical structure
 */
public static function migrate_to_hierarchical() {
    // Get current flat structure
    $current_labels = get_option(self::OPTION_NAME, []);
    
    // Get the hierarchical structure with defaults
    $hierarchical_structure = self::get_hierarchical_structure();
    
    // Get mapping from old to new format
    $mapping = self::get_label_mapping();
    
    // Initialize with defaults
    $new_labels = $hierarchical_structure;
    
    // Migrate existing values to new structure
    foreach ($current_labels as $category => $labels) {
        if (is_array($labels)) {
            foreach ($labels as $key => $value) {
                $old_key = "{$category}.{$key}";
                
                // If mapping exists for this key, use it
                if (isset($mapping[$old_key])) {
                    $new_key = $mapping[$old_key];
                    $parts = explode('.', $new_key);
                    
                    if (count($parts) === 3) {
                        $new_labels[$parts[0]][$parts[1]][$parts[2]] = $value;
                    }
                }
            }
        }
    }
    
    // Save new hierarchical structure
    update_option('product_estimator_hierarchical_labels', $new_labels);
    
    // Update version for cache busting
    $version = time();
    update_option(self::VERSION_OPTION_NAME, $version);
    
    // Clear caches
    delete_transient('pe_frontend_labels_cache');
    
    return $new_labels;
}

/**
 * Mapping from old to new label structure
 */
public static function get_label_mapping() {
    return [
        'buttons.print_estimate' => 'actions.estimate.print_estimate',
        'buttons.request_copy' => 'actions.estimate.request_copy',
        'buttons.save_estimate' => 'actions.estimate.save_estimate',
        'buttons.similar_products' => 'actions.features.similar_products',
        'buttons.product_includes' => 'actions.product.product_includes',
        // More mappings...
    ];
}
```

### Label Access Methods

Add new methods to access the hierarchical labels while maintaining backward compatibility:

```php
/**
 * Get a label using the hierarchical structure
 * 
 * @param string $key The label key (e.g., 'actions.estimate.print_estimate')
 * @param string $default Optional default value
 * @return string The label value
 */
function product_estimator_get_hierarchical_label($key, $default = '') {
    static $labels_cache = null;
    
    // Initialize the cache if not already set
    if ($labels_cache === null) {
        $labels_cache = get_option('product_estimator_hierarchical_labels', []);
    }
    
    $parts = explode('.', $key);
    
    // If we have 3 parts, it's a hierarchical key
    if (count($parts) === 3) {
        $category = $parts[0];
        $subcategory = $parts[1];
        $label_key = $parts[2];
        
        if (isset($labels_cache[$category][$subcategory][$label_key])) {
            return $labels_cache[$category][$subcategory][$label_key];
        }
    }
    
    // For backward compatibility, check old structure
    if (count($parts) === 2) {
        $old_key = $key;
        $mapping = LabelsMigration::get_label_mapping();
        
        if (isset($mapping[$old_key])) {
            return product_estimator_get_hierarchical_label($mapping[$old_key], $default);
        }
        
        // If not found in mapping, try the old way
        return product_estimator_get_label($key, $default);
    }
    
    return $default;
}

/**
 * Wrapper function to support both old and new label formats
 * 
 * @param string $key The label key
 * @param string $default Optional default value
 * @return string The label value
 */
function product_estimator_get_label_wrapper($key, $default = '') {
    $parts = explode('.', $key);
    
    // If we have 3 parts, it's a hierarchical key
    if (count($parts) === 3) {
        return product_estimator_get_hierarchical_label($key, $default);
    }
    
    // Otherwise, use the old function
    return product_estimator_get_label($key, $default);
}
```

### Admin UI Updates

Update the admin interface to display and edit hierarchical labels:

```php
/**
 * Render a category tab
 */
public function render_category_tab($data) {
    $category = $data['category'];
    $hierarchical_labels = get_option('product_estimator_hierarchical_labels', []);
    
    if (!isset($hierarchical_labels[$category])) {
        return;
    }
    
    // Display subcategories as sections
    foreach ($hierarchical_labels[$category] as $subcategory => $labels) {
        echo '<div class="subcategory-section">';
        echo '<h3>' . $this->format_subcategory_name($subcategory) . '</h3>';
        
        // Display labels in this subcategory
        echo '<table class="form-table">';
        foreach ($labels as $key => $value) {
            $full_key = "{$category}.{$subcategory}.{$key}";
            $field_id = "label_{$category}_{$subcategory}_{$key}";
            $field_name = "product_estimator_hierarchical_labels[{$category}][{$subcategory}][{$key}]";
            
            echo '<tr>';
            echo '<th>' . $this->format_label_name($key) . '</th>';
            echo '<td>';
            echo '<input type="text" id="' . esc_attr($field_id) . '" name="' . esc_attr($field_name) . '" value="' . esc_attr($value) . '" class="regular-text">';
            echo '</td>';
            echo '</tr>';
        }
        echo '</table>';
        echo '</div>';
    }
}

/**
 * Format a subcategory name for display
 */
private function format_subcategory_name($subcategory) {
    // Convert camelCase to separate words
    $name = preg_replace('/(?<=\\w)(?=[A-Z])/', ' $1', $subcategory);
    return ucfirst($name);
}
```

## JavaScript Implementation

### LabelManager Enhancements

Enhance the JavaScript `LabelManager` to support the hierarchical structure:

```javascript
/**
 * Enhanced LabelManager class
 */
export class LabelManager {
    constructor() {
        this.labels = window.productEstimatorHierarchicalLabels || {};
        this.flatLabels = window.productEstimatorLabels || {};
        this.cache = new Map();
        this._flat = this._flattenLabels(this.labels);
        this.mapping = window.productEstimatorLabelMapping || {};
    }
    
    /**
     * Get a label by key
     * 
     * @param {string} key - The label key (can be hierarchical or flat)
     * @param {string} defaultValue - Default value if label not found
     * @return {string} The label value
     */
    get(key, defaultValue = '') {
        // Check cache first
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        const parts = key.split('.');
        
        // If hierarchical key (3 parts)
        if (parts.length === 3) {
            const [category, subcategory, labelKey] = parts;
            
            if (this.labels[category] && 
                this.labels[category][subcategory] && 
                this.labels[category][subcategory][labelKey] !== undefined) {
                const value = this.labels[category][subcategory][labelKey];
                this.cache.set(key, value);
                return value;
            }
            
            // Try flattened version
            if (this._flat.has(key)) {
                const value = this._flat.get(key);
                this.cache.set(key, value);
                return value;
            }
        }
        
        // For backward compatibility, check old structure
        if (parts.length === 2) {
            const [category, labelKey] = parts;
            
            // Try to find in mapping
            const newKey = this.mapping[key];
            if (newKey) {
                return this.get(newKey, defaultValue);
            }
            
            // If not found in mapping, try the old way
            if (this.flatLabels[category] && this.flatLabels[category][labelKey] !== undefined) {
                const value = this.flatLabels[category][labelKey];
                this.cache.set(key, value);
                return value;
            }
        }
        
        // Fallback to default
        this.cache.set(key, defaultValue);
        return defaultValue;
    }
    
    /**
     * Flatten hierarchical labels structure
     * 
     * @param {Object} labels - The hierarchical labels object
     * @return {Map} Flattened map of labels
     */
    _flattenLabels(labels) {
        const flat = new Map();
        
        for (const category in labels) {
            for (const subcategory in labels[category]) {
                for (const key in labels[category][subcategory]) {
                    flat.set(`${category}.${subcategory}.${key}`, labels[category][subcategory][key]);
                }
            }
        }
        
        return flat;
    }
    
    // Additional methods remain the same
}
```

### Template Processing

Update the template processing to handle hierarchical labels:

```javascript
/**
 * Process labels in the element using data-label attributes
 * @param {Element|DocumentFragment} element - Element to process
 */
processLabels(element) {
    // Process regular data-label attributes
    const labelElements = element.querySelectorAll('[data-label]');
    
    labelElements.forEach(el => {
        const labelKey = el.dataset.label;
        const defaultValue = el.textContent;
        
        // Check for format parameters
        const formatParams = el.dataset.labelParams;
        
        let labelValue;
        
        if (formatParams) {
            try {
                const params = JSON.parse(formatParams);
                labelValue = labelManager.format(labelKey, params, defaultValue);
            } catch (e) {
                console.warn(`Invalid label params for ${labelKey}:`, e);
                labelValue = labelManager.get(labelKey, defaultValue);
            }
        } else {
            labelValue = labelManager.get(labelKey, defaultValue);
        }
        
        // Apply to text content
        el.textContent = labelValue;
    });
    
    // Process other label attributes (aria-label, title, placeholder)
    // (existing code remains the same)
}
```

### Usage Analytics

Add analytics to track which label format is being used:

```javascript
/**
 * Track label usage for analytics
 * 
 * @private
 * @param {string} key - Label key
 * @param {string} format - Format of the key ('hierarchical' or 'legacy')
 */
_trackLabelUsage(key, format = 'unknown') {
    // Increment local count
    if (!this.analytics.counts[key]) {
        this.analytics.counts[key] = 0;
    }
    this.analytics.counts[key]++;
    
    // Update timestamp
    this.analytics.timestamps[key] = Date.now();
    
    // Add to pending batch with format info
    this.analytics.pendingBatch.push({
        key: key,
        format: format, // Track which format was used
        timestamp: Date.now(),
        page: window.location.pathname
    });
    
    // Send batch if threshold reached
    if (this.analytics.pendingBatch.length >= this.analytics.batchSize) {
        this.sendAnalyticsBatch();
    }
}

/**
 * Get analytics about label format usage
 * 
 * @returns {Object} Statistics about hierarchical vs legacy label usage
 */
getLabelFormatStats() {
    const stats = {
        hierarchical: 0,
        legacy: 0,
        mapped: 0,
        total: 0
    };
    
    // Count from pending batch
    this.analytics.pendingBatch.forEach(item => {
        stats.total++;
        if (item.format === 'hierarchical') {
            stats.hierarchical++;
        } else if (item.format === 'legacy') {
            stats.legacy++;
        } else if (item.format === 'mapped') {
            stats.mapped++;
        }
    });
    
    // Calculate percentages
    if (stats.total > 0) {
        stats.hierarchicalPercent = (stats.hierarchical / stats.total) * 100;
        stats.legacyPercent = (stats.legacy / stats.total) * 100;
        stats.mappedPercent = (stats.mapped / stats.total) * 100;
    }
    
    return stats;
}
```

## Template Updates

### Automatic Migration Tool

Create a tool to automatically update templates with the new label paths:

```php
/**
 * Update data-label attributes in template files
 */
function product_estimator_update_template_labels() {
    $template_dir = plugin_dir_path(__FILE__) . '../src/templates';
    $mapping = LabelsMigration::get_label_mapping();
    $updated_count = 0;
    
    // Recursive function to process all template files
    $process_dir = function($dir) use (&$process_dir, $mapping, &$updated_count) {
        $files = scandir($dir);
        
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }
            
            $path = $dir . '/' . $file;
            
            if (is_dir($path)) {
                $process_dir($path);
            } elseif (pathinfo($path, PATHINFO_EXTENSION) === 'html') {
                // Process HTML template file
                $content = file_get_contents($path);
                $updated = false;
                
                // Update data-label attributes
                foreach ($mapping as $old_key => $new_key) {
                    $pattern = '/data-label=[\'"]' . preg_quote($old_key, '/') . '[\'"]|data-placeholder-label=[\'"]' . preg_quote($old_key, '/') . '[\'"]|data-title-label=[\'"]' . preg_quote($old_key, '/') . '[\'"]|data-aria-label=[\'"]' . preg_quote($old_key, '/') . '[\'"]|data-prefix-label=[\'"]' . preg_quote($old_key, '/') . '[\'"]';
                    $replacement = function($matches) use ($old_key, $new_key) {
                        $attr = substr($matches[0], 0, strpos($matches[0], '=') + 1);
                        return $attr . '"' . $new_key . '"';
                    };
                    
                    $updated_content = preg_replace_callback($pattern, $replacement, $content);
                    
                    if ($updated_content !== $content) {
                        $content = $updated_content;
                        $updated = true;
                    }
                }
                
                if ($updated) {
                    file_put_contents($path, $content);
                    $updated_count++;
                }
            }
        }
    };
    
    $process_dir($template_dir);
    
    return $updated_count;
}
```

### Manual Update Guide

Provide guidelines for manually updating templates:

```markdown
## Manual Template Update Guide

When updating templates to use the new hierarchical label structure, follow these guidelines:

1. **Find Current Label Paths**: Look for `data-label`, `data-placeholder-label`, `data-title-label`, and `data-aria-label` attributes.

2. **Look Up New Path**: Use the mapping table in the documentation to find the new hierarchical path.

3. **Update the Attribute**: Replace the old path with the new hierarchical path.

4. **Test the Template**: Verify that the labels display correctly after the update.

### Example:

#### Before:
```html
<button data-label="buttons.create_new_estimate">Create New Estimate</button>
```

#### After:
```html
<button data-label="actions.estimate.create_new_estimate">Create New Estimate</button>
```

### Common Category Mappings:

- `buttons.*` → `actions.*` (with subcategory)
- `forms.*` → `forms.*` (with subcategory)
- `messages.*` → `messages.*` (with subcategory)
- `ui_elements.*` → `ui.*` (with subcategory)
```

## Testing Strategy

### Unit Tests

```php
/**
 * Test hierarchical label access
 */
function test_hierarchical_label_access() {
    // Test direct hierarchical access
    $this->assertEquals(
        'Create New Estimate',
        product_estimator_get_hierarchical_label('actions.estimate.create_new_estimate', 'Default')
    );
    
    // Test legacy access with mapping
    $this->assertEquals(
        'Create New Estimate',
        product_estimator_get_label_wrapper('buttons.create_new_estimate', 'Default')
    );
    
    // Test fallback to default
    $this->assertEquals(
        'Default',
        product_estimator_get_hierarchical_label('unknown.category.label', 'Default')
    );
}
```

### Integration Tests

```php
/**
 * Test template rendering with hierarchical labels
 */
function test_template_rendering() {
    // Set up test environment
    $template = '<div data-label="actions.estimate.create_new_estimate"></div>';
    
    // Render the template
    $rendered = render_template_with_labels($template);
    
    // Verify the label was replaced correctly
    $this->assertStringContainsString('Create New Estimate', $rendered);
}
```

### Validation Tools

```php
/**
 * Validate label paths in templates
 */
function validate_template_labels() {
    $template_dir = plugin_dir_path(__FILE__) . '../src/templates';
    $mapping = LabelsMigration::get_label_mapping();
    $results = [
        'total' => 0,
        'valid' => 0,
        'invalid' => 0,
        'unmapped' => 0,
        'issues' => []
    ];
    
    // Get all valid hierarchical keys
    $hierarchical_structure = LabelsMigration::get_hierarchical_structure();
    $valid_keys = [];
    
    foreach ($hierarchical_structure as $category => $subcategories) {
        foreach ($subcategories as $subcategory => $labels) {
            foreach (array_keys($labels) as $key) {
                $valid_keys[] = "{$category}.{$subcategory}.{$key}";
            }
        }
    }
    
    // Recursive function to process all template files
    $process_dir = function($dir) use (&$process_dir, $mapping, $valid_keys, &$results) {
        $files = scandir($dir);
        
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }
            
            $path = $dir . '/' . $file;
            
            if (is_dir($path)) {
                $process_dir($path);
            } elseif (pathinfo($path, PATHINFO_EXTENSION) === 'html') {
                // Process HTML template file
                $content = file_get_contents($path);
                
                // Find all data-label attributes
                $pattern = '/data-(?:label|placeholder-label|title-label|aria-label|prefix-label)=[\'"]([^\'"]+)[\'"]/';
                preg_match_all($pattern, $content, $matches);
                
                if (!empty($matches[1])) {
                    foreach ($matches[1] as $key) {
                        $results['total']++;
                        
                        // Check if it's a valid hierarchical key
                        if (in_array($key, $valid_keys)) {
                            $results['valid']++;
                        } elseif (isset($mapping[$key])) {
                            $results['unmapped']++;
                            $results['issues'][] = [
                                'file' => $path,
                                'key' => $key,
                                'type' => 'unmapped',
                                'suggestion' => $mapping[$key]
                            ];
                        } else {
                            $results['invalid']++;
                            $results['issues'][] = [
                                'file' => $path,
                                'key' => $key,
                                'type' => 'invalid',
                                'suggestion' => null
                            ];
                        }
                    }
                }
            }
        }
    };
    
    $process_dir($template_dir);
    
    return $results;
}
```