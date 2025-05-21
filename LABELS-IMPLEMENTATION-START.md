# Labels Reorganization: Quick Start Implementation Guide

This document provides the first steps to begin implementing the labels reorganization plan. It outlines the initial changes needed in the codebase to support the new hierarchical structure.

## Initial Setup Steps

1. [Create Hierarchical Structure](#1-create-hierarchical-structure)
2. [Add Compatibility Layer](#2-add-compatibility-layer)
3. [Update Database Schema](#3-update-database-schema)
4. [Modify Admin UI](#4-modify-admin-ui)

## 1. Create Hierarchical Structure

The first step is to update the `LabelsMigration` class to include the new hierarchical structure method:

```php
// In includes/class-labels-migration.php

/**
 * Get the hierarchical label structure
 * 
 * @return array Hierarchical structure
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
            ],
            // Add remaining UI subcategories...
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
            ],
            // Add remaining forms subcategories...
        ],
        // Add remaining categories...
    ];
}

/**
 * Get mapping from old to new label structure
 * 
 * @return array Mapping of old keys to new keys
 */
public static function get_label_mapping() {
    return [
        'buttons.print_estimate' => 'actions.estimate.print_estimate',
        'buttons.request_copy' => 'actions.estimate.request_copy',
        'buttons.save_estimate' => 'actions.estimate.save_estimate',
        // Add more mappings from LABELS-MAPPING-TABLE.md
    ];
}
```

## 2. Add Compatibility Layer

Next, add the compatibility layer to support both old and new label formats:

```php
// In includes/functions-labels.php

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
        $mapping = \RuDigital\ProductEstimator\Includes\LabelsMigration::get_label_mapping();
        
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

## 3. Update Database Schema

Add a migration script to handle the database schema update:

```php
// In a new file: includes/migrations/class-hierarchical-labels-migration.php

namespace RuDigital\ProductEstimator\Includes\Migrations;

use RuDigital\ProductEstimator\Includes\LabelsMigration;

class HierarchicalLabelsMigration {
    /**
     * Run the migration
     */
    public static function run() {
        // Check if already migrated
        $version = get_option('product_estimator_labels_version', '0');
        if (version_compare($version, '3.0.0', '>=')) {
            return; // Already migrated
        }
        
        // Get current labels
        $current_labels = get_option('product_estimator_labels', []);
        
        // Get hierarchical structure
        $hierarchical = LabelsMigration::get_hierarchical_structure();
        
        // Get mapping
        $mapping = LabelsMigration::get_label_mapping();
        
        // Initialize hierarchical with defaults
        $new_labels = $hierarchical;
        
        // Migrate existing values
        foreach ($current_labels as $category => $labels) {
            if (is_array($labels)) {
                foreach ($labels as $key => $value) {
                    $old_key = "{$category}.{$key}";
                    
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
        
        // Save the new structure
        update_option('product_estimator_hierarchical_labels', $new_labels);
        
        // Update version
        update_option('product_estimator_labels_version', '3.0.0');
        
        // Clear caches
        delete_transient('pe_frontend_labels_cache');
        
        return true;
    }
}
```

## 4. Modify Admin UI

Update the admin UI to display the hierarchical structure:

```php
// In includes/admin/settings/class-labels-settings-module.php

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

/**
 * Format a label key for display
 */
private function format_label_name($key) {
    // Convert snake_case to separate words
    $name = str_replace('_', ' ', $key);
    return ucfirst($name);
}
```

## Next Steps

After implementing these initial changes, you'll need to:

1. Test the compatibility layer to ensure both old and new label formats work
2. Update the JavaScript `labelManager` to support hierarchical keys
3. Create a migration utility to update template files
4. Run comprehensive tests to verify the system works as expected

Start by implementing the functions in this guide and testing them in a development environment. Refer to the complete implementation guide in `LABELS-MIGRATION-CODE.md` for more details on each step.

For a full mapping between old and new label formats, refer to `LABELS-MAPPING-TABLE.md`.

## Testing Initial Implementation

To test your initial implementation, add this code to a test PHP file:

```php
// test-labels-migration.php

// Include WordPress
require_once('wp-load.php');

// Run the migration
\RuDigital\ProductEstimator\Includes\Migrations\HierarchicalLabelsMigration::run();

// Test old and new label access
$old_key = 'buttons.save_estimate';
$new_key = 'actions.estimate.save_estimate';

echo "Testing label access:\n";
echo "Old key ({$old_key}): " . product_estimator_get_label($old_key) . "\n";
echo "New key ({$new_key}): " . product_estimator_get_hierarchical_label($new_key) . "\n";
echo "Wrapper with old key: " . product_estimator_get_label_wrapper($old_key) . "\n";
echo "Wrapper with new key: " . product_estimator_get_label_wrapper($new_key) . "\n";

echo "\nMigration completed!\n";
```

Run this script in your WordPress environment to verify the migration works as expected.